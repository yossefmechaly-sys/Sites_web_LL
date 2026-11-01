<?php
declare(strict_types=1);

/**
 * Formulaire de contact — version PHP (Apache + PHP-FPM) envoyant par Brevo : SMTP (STARTTLS, port 587) ou API transactionnelle (HTTPS).
 * Même comportement que deploy/lambda/contact/index.mjs :
 *  - envoi classique (sans JavaScript) -> redirection 303 vers la page de confirmation
 *  - envoi fetch (Accept: application/json) -> réponse JSON
 *
 * Configuration : fichier INI hors du dossier public (voir deploy/php/contact.ini.example),
 * chemin donné par la variable CONTACT_CONFIG (par défaut /etc/laurent-levy/contact.ini).
 * Fichier unique : les fonctions sont testables (tests/php/contact-test.php) sans serveur web.
 */

const LL_LANGS = ['fr', 'en', 'he'];
const LL_THANKS = ['fr' => '/fr/contact/merci/', 'en' => '/en/contact/thank-you/', 'he' => '/he/צור-קשר/תודה/'];
const LL_CONTACT = ['fr' => '/fr/contact/', 'en' => '/en/contact/', 'he' => '/he/צור-קשר/'];
const LL_LIMITS = ['name' => 120, 'email' => 200, 'subject' => 200, 'message' => 5000];
const LL_MIN_FILL_MS = 3000;        // un humain met plus de 3 s à remplir le formulaire
const LL_RATE_MAX = 5;              // messages acceptés par IP et par fenêtre
const LL_RATE_WINDOW = 3600;        // fenêtre de 1 h
const LL_MAX_BODY = 20000;

/** Nettoie une valeur : normalise les fins de ligne, retire les caractères de contrôle, tronque (max + 1 pour détecter l'excès). */
function ll_clean(mixed $v, int $max): string
{
    $s = is_scalar($v) ? (string) $v : '';
    $s = preg_replace('/\r\n?/', "\n", $s) ?? '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max + 1, 'UTF-8');
}

function ll_one_line(string $s): string
{
    return preg_replace('/\s+/u', ' ', $s) ?? '';
}

/** @return array{ok: bool, errors: string[], data: array<string, string>, spam: bool} */
function ll_validate(array $raw, int $nowMs): array
{
    $lang = $raw['lang'] ?? '';
    $data = [
        'name' => ll_one_line(ll_clean($raw['name'] ?? '', LL_LIMITS['name'])),
        'email' => ll_one_line(ll_clean($raw['email'] ?? '', LL_LIMITS['email'])),
        'subject' => ll_one_line(ll_clean($raw['subject'] ?? '', LL_LIMITS['subject'])),
        'message' => ll_clean($raw['message'] ?? '', LL_LIMITS['message']),
        'lang' => in_array($lang, LL_LANGS, true) ? $lang : 'fr',
    ];

    // pièges à robots : champ caché rempli, formulaire soumis trop vite, liens en masse
    $startedAt = (float) ($raw['t'] ?? 0);
    $spam = ll_clean($raw['website'] ?? '', 200) !== ''
        || ($startedAt > 0 && $nowMs - $startedAt < LL_MIN_FILL_MS)
        || preg_match_all('~https?://~i', $data['message']) > 3;

    $errors = [];
    $len = static fn (string $s): int => mb_strlen($s, 'UTF-8');
    if ($len($data['name']) < 2 || $len($data['name']) > LL_LIMITS['name']) $errors[] = 'name';
    if (!preg_match('/^[^\s@<>()\[\]\\\\,;:"]+@[^\s@<>()\[\]\\\\,;:"]+\.[a-z]{2,}$/i', $data['email']) || $len($data['email']) > LL_LIMITS['email']) $errors[] = 'email';
    if ($len($data['subject']) > LL_LIMITS['subject']) $errors[] = 'subject';
    if ($len($data['message']) < 10 || $len($data['message']) > LL_LIMITS['message']) $errors[] = 'message';
    if (!in_array($raw['consent'] ?? null, ['on', 'true', '1', true], true)) $errors[] = 'consent';

    return ['ok' => $errors === [], 'errors' => $errors, 'data' => $data, 'spam' => $spam];
}

/**
 * Liste d'adresses de la configuration (« a@x.fr, b@y.fr »), validées, sans doublon, 5 au maximum.
 * @return string[]
 */
function ll_address_list(string $list, int $max = 5): array
{
    $out = [];
    foreach (preg_split('/[\s,;]+/', $list, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $a) {
        $a = ll_smtp_address($a);
        if (!in_array(strtolower($a), array_map('strtolower', $out), true)) $out[] = $a;
    }
    if (count($out) > $max) throw new RuntimeException("trop de destinataires (maximum $max)");
    return $out;
}

/**
 * Message à envoyer, indépendant du fournisseur. $to : destinataires visibles (champ « À »),
 * $bcc : destinataires en copie cachée (jamais écrits dans les en-têtes). 5 adresses au plus au total.
 * @return array{from: array{email: string, name: string}, to: string[], bcc: string[], replyTo: array{email: string, name: string}, subject: string, text: string}
 */
function ll_build_email(array $data, array $meta, string $from, string $to, string $fromName = 'Site laurent-levy.com', string $bcc = ''): array
{
    $toList = ll_address_list($to);
    if ($toList === []) throw new RuntimeException('aucun destinataire configuré (to_email)');
    $bccList = array_values(array_filter(ll_address_list($bcc), static fn (string $a): bool => !in_array(strtolower($a), array_map('strtolower', $toList), true)));
    if (count($toList) + count($bccList) > 5) throw new RuntimeException('trop de destinataires (maximum 5 au total)');

    $subject = mb_substr('[laurent-levy.com] ' . ($data['subject'] !== '' ? $data['subject'] : 'Message de ' . $data['name']), 0, 200, 'UTF-8');
    $lines = [
        'Nom : ' . $data['name'],
        'E-mail : ' . $data['email'],
        ...($data['subject'] !== '' ? ['Sujet : ' . $data['subject']] : []),
        'Langue : ' . $data['lang'],
        '',
        $data['message'],
        '',
        '—',
        'Envoyé depuis le formulaire de laurent-levy.com le ' . gmdate('c', (int) ($meta['time'] ?? time())),
        'IP : ' . ($meta['ip'] ?? '?') . ' · Navigateur : ' . mb_substr((string) ($meta['userAgent'] ?? '?'), 0, 200, 'UTF-8'),
    ];
    return [
        'from' => ['email' => $from, 'name' => $fromName],
        'to' => $toList,
        'bcc' => $bccList,
        'replyTo' => ['email' => $data['email'], 'name' => $data['name']],
        'subject' => $subject,
        'text' => implode("\n", $lines),
    ];
}

/** Corps JSON de l'API Brevo « Send a transactional email » (POST /v3/smtp/email). @return array<string, mixed> */
function ll_brevo_payload(array $mail): array
{
    $address = static fn (string $a): array => ['email' => $a];
    return [
        'sender' => $mail['from'],
        'to' => array_map($address, $mail['to']),
        ...($mail['bcc'] !== [] ? ['bcc' => array_map($address, $mail['bcc'])] : []),
        'replyTo' => $mail['replyTo'],
        'subject' => $mail['subject'],
        'textContent' => $mail['text'],
        'tags' => ['formulaire-contact'],
    ];
}

/**
 * Envoie le message via l'API Brevo (HTTPS). Lève une exception en cas d'échec.
 * Configuration : brevo_api_key (obligatoire), api_url (tests uniquement : adresse du faux serveur).
 */
function ll_send_brevo(array $mail, array $cfg): void
{
    $key = (string) ($cfg['brevo_api_key'] ?? '');
    if ($key === '') throw new RuntimeException('brevo_api_key manquante dans la configuration');
    $url = (string) ($cfg['api_url'] ?? 'https://api.brevo.com/v3/smtp/email');
    $body = json_encode(ll_brevo_payload($mail), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body,
        CURLOPT_HTTPHEADER => ['accept: application/json', 'content-type: application/json', 'api-key: ' . $key],
        CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5,
        // HTTPS uniquement, sauf adresse de test explicitement configurée côté serveur
        CURLOPT_PROTOCOLS => isset($cfg['api_url']) ? (CURLPROTO_HTTP | CURLPROTO_HTTPS) : CURLPROTO_HTTPS,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    $out = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    // la clé d'API n'apparaît jamais dans le message d'erreur
    if ($status < 200 || $status >= 300) throw new RuntimeException("Brevo a répondu $status : " . ($out !== false ? mb_substr((string) $out, 0, 300) : $err));
}

/** Adresse e-mail sûre pour les commandes SMTP et les en-têtes (pas de chevrons, espaces ni retours à la ligne). */
function ll_smtp_address(string $a): string
{
    if (!preg_match('/^[^\s@<>()\[\]\\\\,;:"]+@[^\s@<>()\[\]\\\\,;:"]+\.[a-z]{2,}$/i', $a)) throw new RuntimeException('adresse e-mail invalide pour SMTP');
    return $a;
}

/** En-tête avec texte encodé (RFC 2047, UTF-8) : nom d'en-tête + valeur sur une ligne, repliée si nécessaire. */
function ll_mime_header(string $name, string $value): string
{
    $value = preg_replace('/[\r\n]+/', ' ', $value) ?? '';
    if (!preg_match('/[^\x20-\x7E]/', $value)) return "$name: $value";
    return "$name: " . mb_encode_mimeheader($value, 'UTF-8', 'B', "\r\n", strlen($name) + 2);
}

/** Message complet (en-têtes + corps UTF-8 en base64) prêt pour la commande DATA. */
function ll_mime_message(array $mail, int $time, string $domain): string
{
    $from = ll_smtp_address($mail['from']['email']);
    $toHeader = implode(', ', array_map(static fn (string $a): string => '<' . ll_smtp_address($a) . '>', $mail['to']));
    $reply = ll_smtp_address($mail['replyTo']['email']);
    $name = static fn (string $n, string $addr): string => $n === '' ? "<$addr>" : mb_encode_mimeheader(preg_replace('/[\r\n"<>]+/', ' ', $n) ?? '', 'UTF-8', 'B', "\r\n", 12) . " <$addr>";
    $headers = [
        'Date: ' . gmdate('D, d M Y H:i:s', $time) . ' +0000',
        'From: ' . $name($mail['from']['name'], $from),
        "To: $toHeader",
        'Reply-To: ' . $name($mail['replyTo']['name'], $reply),
        ll_mime_header('Subject', $mail['subject']),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];
    return implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($mail['text']), 76, "\r\n");
}

/** Lit une réponse SMTP (éventuellement sur plusieurs lignes « 250-… »). @return array{0: int, 1: string} */
function ll_smtp_read($fp): array
{
    $text = '';
    do {
        $line = fgets($fp, 1024);
        if ($line === false) throw new RuntimeException('connexion SMTP interrompue');
        $text .= $line;
    } while (isset($line[3]) && $line[3] === '-');
    return [(int) substr($text, 0, 3), trim($text)];
}

/** Envoie une commande SMTP et vérifie le code de réponse. Les secrets ne sont jamais recopiés dans l'erreur. */
function ll_smtp_cmd($fp, string $cmd, array $ok, string $label = ''): string
{
    fwrite($fp, $cmd . "\r\n");
    [$code, $text] = ll_smtp_read($fp);
    if (!in_array($code, $ok, true)) throw new RuntimeException('SMTP ' . ($label !== '' ? $label : strtok($cmd, ' ')) . " refusé ($code) : " . mb_substr($text, 0, 200));
    return $text;
}

/**
 * Envoie le message par SMTP (STARTTLS puis AUTH LOGIN). Lève une exception en cas d'échec.
 * Configuration : smtp_user, smtp_pass (obligatoires) ; smtp_host (défaut smtp-relay.brevo.com), smtp_port (587),
 * smtp_security = starttls (défaut) | none (tests uniquement), smtp_verify_peer (défaut vrai), helo_name.
 */
function ll_send_smtp(array $mail, array $cfg): void
{
    $user = (string) ($cfg['smtp_user'] ?? '');
    $pass = (string) ($cfg['smtp_pass'] ?? '');
    if ($user === '' || $pass === '') throw new RuntimeException('smtp_user / smtp_pass manquants dans la configuration');
    $host = (string) ($cfg['smtp_host'] ?? 'smtp-relay.brevo.com');
    $port = (int) ($cfg['smtp_port'] ?? 587);
    $security = (string) ($cfg['smtp_security'] ?? 'starttls');
    $helo = (string) ($cfg['helo_name'] ?? 'laurent-levy.com');

    $message = ll_mime_message($mail, time(), $helo);
    $from = ll_smtp_address($mail['from']['email']);
    $recipients = array_map('ll_smtp_address', [...$mail['to'], ...($mail['bcc'] ?? [])]);

    $fp = @stream_socket_client("tcp://$host:$port", $errno, $errstr, 10);
    if (!$fp) throw new RuntimeException("connexion SMTP impossible ($errno)");
    stream_set_timeout($fp, 15);
    try {
        [$code] = ll_smtp_read($fp);
        if ($code !== 220) throw new RuntimeException("SMTP accueil inattendu ($code)");
        ll_smtp_cmd($fp, "EHLO $helo", [250]);
        if ($security === 'starttls') {
            ll_smtp_cmd($fp, 'STARTTLS', [220]);
            stream_context_set_option($fp, 'ssl', 'peer_name', $host);
            stream_context_set_option($fp, 'ssl', 'verify_peer', ($cfg['smtp_verify_peer'] ?? true) !== false);
            stream_context_set_option($fp, 'ssl', 'verify_peer_name', ($cfg['smtp_verify_peer'] ?? true) !== false);
            $method = STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT') ? STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT : 0);
            if (@stream_socket_enable_crypto($fp, true, $method) !== true) throw new RuntimeException('négociation TLS SMTP échouée');
            ll_smtp_cmd($fp, "EHLO $helo", [250]);   // l'authentification n'a lieu qu'après chiffrement
        }
        ll_smtp_cmd($fp, 'AUTH LOGIN', [334], 'AUTH');
        ll_smtp_cmd($fp, base64_encode($user), [334], 'AUTH (identifiant)');
        ll_smtp_cmd($fp, base64_encode($pass), [235], 'AUTH (mot de passe)');
        ll_smtp_cmd($fp, "MAIL FROM:<$from>", [250], 'MAIL FROM');
        foreach ($recipients as $rcpt) ll_smtp_cmd($fp, "RCPT TO:<$rcpt>", [250, 251], 'RCPT TO');
        ll_smtp_cmd($fp, 'DATA', [354]);
        ll_smtp_cmd($fp, $message . '.', [250], 'DATA');
        @fwrite($fp, "QUIT\r\n");
    } finally {
        @fclose($fp);
    }
}

/** Choisit le transport selon la configuration : SMTP (défaut si smtp_user est défini) ou API Brevo. */
function ll_send_mail(array $mail, array $cfg): void
{
    $transport = (string) ($cfg['transport'] ?? (isset($cfg['smtp_user']) ? 'smtp' : 'brevo_api'));
    match ($transport) {
        'smtp' => ll_send_smtp($mail, $cfg),
        'brevo_api' => ll_send_brevo($mail, $cfg),
        default => throw new RuntimeException("transport inconnu : $transport"),
    };
}

/** Limitation simple par IP (fichiers temporaires). Retourne true si l'IP a dépassé la limite. */
function ll_rate_limited(string $ip, string $dir, int $now): bool
{
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) return false; // en cas de doute, on laisse passer
    $file = $dir . '/' . hash('sha256', $ip);
    $hits = [];
    if (is_file($file)) $hits = array_filter(array_map('intval', explode("\n", (string) file_get_contents($file))), static fn (int $t): bool => $t > $now - LL_RATE_WINDOW);
    if (count($hits) >= LL_RATE_MAX) return true;
    $hits[] = $now;
    @file_put_contents($file, implode("\n", $hits), LOCK_EX);
    return false;
}

/** @return array{status: int, headers: array<string, string>, body: string} */
function ll_response_json(int $status, array $payload): array
{
    return ['status' => $status, 'headers' => ['Content-Type' => 'application/json; charset=utf-8', 'Cache-Control' => 'no-store'], 'body' => json_encode($payload, JSON_UNESCAPED_UNICODE)];
}

function ll_response_redirect(string $location): array
{
    // les segments hébreux sont encodés pour l'en-tête Location
    $encoded = implode('/', array_map('rawurlencode', explode('/', $location)));
    $hash = '';
    if (($pos = strpos($encoded, '%23')) !== false) { $hash = '#' . substr($encoded, $pos + 3); $encoded = substr($encoded, 0, $pos); }
    return ['status' => 303, 'headers' => ['Location' => $encoded . $hash, 'Cache-Control' => 'no-store'], 'body' => ''];
}

/**
 * Traite une requête.
 * @param array{method?: string, accept?: string, contentType?: string, ip?: string, userAgent?: string} $req
 * @param array<string, string|bool|null> $cfg  to_email (plusieurs : séparés par des virgules), bcc_email, from_email, from_name, transport, smtp_*, brevo_api_key, dry_run, rate_dir
 * @param (callable(array): void)|null $send    remplace l'envoi Brevo (tests)
 */
function ll_handle(array $req, string $rawBody, array $post, array $cfg, ?int $now = null, ?callable $send = null): array
{
    $now ??= time();
    $wantsJson = str_contains((string) ($req['accept'] ?? ''), 'application/json');
    if (($req['method'] ?? 'POST') !== 'POST') return ll_response_json(405, ['ok' => false, 'error' => 'method']);
    if (strlen($rawBody) > LL_MAX_BODY) return ll_response_json(400, ['ok' => false, 'error' => 'body']);

    $raw = $post;
    if (stripos((string) ($req['contentType'] ?? ''), 'application/json') !== false) {
        $decoded = json_decode($rawBody, true);
        if (!is_array($decoded)) return ll_response_json(400, ['ok' => false, 'error' => 'body']);
        $raw = $decoded;
    }

    $v = ll_validate($raw, $now * 1000);
    $lang = $v['data']['lang'];
    if (!$v['ok']) return $wantsJson ? ll_response_json(422, ['ok' => false, 'errors' => $v['errors']]) : ll_response_redirect(LL_CONTACT[$lang] . '#form-error');
    // aux robots, on répond comme si tout s'était bien passé
    if ($v['spam']) return $wantsJson ? ll_response_json(200, ['ok' => true]) : ll_response_redirect(LL_THANKS[$lang]);

    if (!empty($cfg['rate_dir']) && ll_rate_limited((string) ($req['ip'] ?? '?'), (string) $cfg['rate_dir'], $now)) {
        return $wantsJson ? ll_response_json(429, ['ok' => false, 'error' => 'rate']) : ll_response_redirect(LL_CONTACT[$lang] . '#form-error');
    }

    try {
        $params = ll_build_email($v['data'], ['time' => $now, 'ip' => $req['ip'] ?? null, 'userAgent' => $req['userAgent'] ?? null],
            (string) ($cfg['from_email'] ?? 'contact@laurent-levy.com'), (string) ($cfg['to_email'] ?? 'contact@laurent-levy.com'),
            (string) ($cfg['from_name'] ?? 'Site laurent-levy.com'), (string) ($cfg['bcc_email'] ?? ''));
        if (!empty($cfg['dry_run'])) error_log('[contact] DRY_RUN — message non envoyé : ' . $params['text']);
        else ($send ?? static fn (array $p) => ll_send_mail($p, $cfg))($params);
    } catch (Throwable $e) {
        error_log('[contact] échec d\'envoi : ' . $e->getMessage());
        return $wantsJson ? ll_response_json(502, ['ok' => false, 'error' => 'send']) : ll_response_redirect(LL_CONTACT[$lang] . '#form-error');
    }
    return $wantsJson ? ll_response_json(200, ['ok' => true]) : ll_response_redirect(LL_THANKS[$lang]);
}

/** Charge la configuration (fichier INI hors du dossier public). */
function ll_load_config(?string $file = null): array
{
    $file ??= getenv('CONTACT_CONFIG') ?: '/etc/laurent-levy/contact.ini';
    $cfg = is_readable($file) ? (parse_ini_file($file, false, INI_SCANNER_TYPED) ?: []) : [];
    $cfg['rate_dir'] ??= sys_get_temp_dir() . '/laurent-levy-contact';
    return $cfg;
}

function ll_front_controller(): void
{
    $cfg = ll_load_config();
    $res = ll_handle([
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'GET',
        'accept' => $_SERVER['HTTP_ACCEPT'] ?? '',
        'contentType' => $_SERVER['CONTENT_TYPE'] ?? '',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '?',
        'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? '?',
    ], (string) file_get_contents('php://input', false, null, 0, LL_MAX_BODY + 1), $_POST, $cfg);
    http_response_code($res['status']);
    foreach ($res['headers'] as $k => $v) header("$k: $v");
    echo $res['body'];
}

// Exécution seulement quand le fichier est appelé directement par le serveur web (pas quand il est inclus par les tests).
if (PHP_SAPI !== 'cli' && isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    ll_front_controller();
}
