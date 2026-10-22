<?php
// Formulaire de contact : reçoit du JSON (ou un POST classique) et envoie un e-mail.
// À configurer avant la mise en ligne : CONTACT_TO (destinataire) et CONTACT_FROM
// (une adresse du domaine du site, pour que les e-mails ne partent pas en spam).
const CONTACT_TO   = 'CHANGER@exemple.com';
const CONTACT_FROM = 'site@xn-----xldnbaepd2cbs3c5a9azbtec.co.il';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out(int $code, bool $ok): never {
    http_response_code($code);
    echo json_encode(['ok' => $ok]);
    exit;
}
function clean(string $v, int $max): string {
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $v));
    return mb_substr($v, 0, $max);
}
function oneLine(string $v): string { return trim(preg_replace('/[\r\n]+/', ' ', $v)); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, false);

$raw = file_get_contents('php://input');
$d = stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false ? (json_decode($raw, true) ?: []) : $_POST;

// Anti-spam : champ piège rempli, ou formulaire envoyé en moins de 3 secondes.
if (!empty($d['website'])) out(200, true);
$ts = (int)($d['ts'] ?? 0);
if ($ts > 0 && (microtime(true) * 1000 - $ts) < 3000) out(200, true);

// Limitation : 5 envois par heure et par adresse IP.
$dir = sys_get_temp_dir() . '/les7cles-contact';
@mkdir($dir, 0700, true);
$file = $dir . '/' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
$hits = array_filter(array_map('intval', @file($file, FILE_IGNORE_NEW_LINES) ?: []), fn($t) => $t > time() - 3600);
if (count($hits) >= 5) out(429, false);

$first   = oneLine(clean((string)($d['first-name'] ?? ''), 80));
$last    = oneLine(clean((string)($d['last-name'] ?? ''), 80));
$email   = oneLine(clean((string)($d['your-email'] ?? ''), 160));
$phone   = oneLine(clean((string)($d['your-phone'] ?? ''), 40));
$message = clean((string)($d['your-message'] ?? ''), 5000);
$lang    = in_array($d['lang'] ?? '', ['fr', 'en', 'he'], true) ? $d['lang'] : 'fr';

if ($first === '' || $last === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) out(422, false);

$subject = '=?UTF-8?B?' . base64_encode("Nouveau message du site ($lang) - $first $last") . '?=';
$body = "Prénom : $first\nNom : $last\nE-mail : $email\nTéléphone : $phone\nLangue du site : $lang\n\n$message\n";
$headers = [
    'From: ' . CONTACT_FROM,
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];
$sent = mail(CONTACT_TO, $subject, $body, implode("\r\n", $headers));
if ($sent) { $hits[] = time(); @file_put_contents($file, implode("\n", $hits)); }
out($sent ? 200 : 500, $sent);
