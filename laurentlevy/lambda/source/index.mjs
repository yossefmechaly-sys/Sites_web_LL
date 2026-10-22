// Formulaire de contact : AWS Lambda (Function URL derrière CloudFront, /api/contact) + Amazon SES.
// Accepte un envoi classique (application/x-www-form-urlencoded, sans JavaScript -> redirection 303)
// ou un envoi fetch (Accept: application/json -> réponse JSON).
//
// Variables d'environnement :
//   TO_EMAIL       destinataire (contact@laurent-levy.com)
//   FROM_EMAIL     expéditeur vérifié dans SES (ex. formulaire@laurent-levy.com)
//   ORIGIN_SECRET  valeur de l'en-tête x-origin-secret ajouté par CloudFront (bloque les appels directs)
//   DRY_RUN=1      n'envoie rien, journalise le message (développement)

const LANGS = ['fr', 'en', 'he'];
const THANKS = { fr: '/fr/contact/merci/', en: '/en/contact/thank-you/', he: '/he/צור-קשר/תודה/' };
const CONTACT = { fr: '/fr/contact/', en: '/en/contact/', he: '/he/צור-קשר/' };
const LIMITS = { name: 120, email: 200, subject: 200, message: 5000 };
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const MIN_FILL_MS = 3000; // un humain met plus de 3 s à remplir le formulaire

const clean = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max + 1);
const oneLine = (v) => v.replace(/\s+/g, ' ');

/** Valide les champs. Retourne { ok, errors, data, spam }. */
export function validate(raw, now = Date.now()) {
  const data = {
    name: oneLine(clean(raw.name, LIMITS.name)),
    email: oneLine(clean(raw.email, LIMITS.email)),
    subject: oneLine(clean(raw.subject, LIMITS.subject)),
    message: clean(raw.message, LIMITS.message),
    lang: LANGS.includes(raw.lang) ? raw.lang : 'fr',
  };
  // pièges à robots : champ caché rempli, ou formulaire soumis trop vite
  const startedAt = Number(raw.t);
  const spam = Boolean(clean(raw.website, 200)) || (Number.isFinite(startedAt) && startedAt > 0 && now - startedAt < MIN_FILL_MS)
    || (data.message.match(/https?:\/\//gi) ?? []).length > 3;

  const errors = [];
  if (data.name.length < 2 || data.name.length > LIMITS.name) errors.push('name');
  if (!EMAIL_RE.test(data.email) || data.email.length > LIMITS.email) errors.push('email');
  if (data.subject.length > LIMITS.subject) errors.push('subject');
  if (data.message.length < 10 || data.message.length > LIMITS.message) errors.push('message');
  if (!['on', 'true', '1', true].includes(raw.consent)) errors.push('consent');
  return { ok: errors.length === 0, errors, data, spam };
}

export function buildEmail(data, meta, { from, to }) {
  const subject = `[laurent-levy.com] ${data.subject || 'Message de ' + data.name}`.slice(0, 200);
  const text = [
    `Nom : ${data.name}`,
    `E-mail : ${data.email}`,
    ...(data.subject ? [`Sujet : ${data.subject}`] : []),
    `Langue : ${data.lang}`,
    '',
    data.message,
    '',
    '—',
    `Envoyé depuis le formulaire de laurent-levy.com le ${new Date(meta.date).toISOString()}`,
    `IP : ${meta.ip ?? '?'} · Navigateur : ${meta.userAgent ?? '?'}`,
  ].join('\n');
  return {
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    ReplyToAddresses: [data.email],
    Content: { Simple: { Subject: { Data: subject, Charset: 'UTF-8' }, Body: { Text: { Data: text, Charset: 'UTF-8' } } } },
  };
}

let sesClient;
async function sendWithSes(params) {
  const { SESv2Client, SendEmailCommand } = await import('@aws-sdk/client-sesv2');
  sesClient ??= new SESv2Client({});
  await sesClient.send(new SendEmailCommand(params));
}

function parseBody(event) {
  const body = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : event.body ?? '';
  const type = (event.headers?.['content-type'] ?? '').toLowerCase();
  if (body.length > 20_000) return null;
  if (type.includes('application/json')) {
    try { return JSON.parse(body); } catch { return null; }
  }
  return Object.fromEntries(new URLSearchParams(body));
}

const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  body: JSON.stringify(payload),
});
const seeOther = (location) => ({ statusCode: 303, headers: { location: encodeURI(location), 'cache-control': 'no-store' }, body: '' });

/**
 * @param {object} event  événement Lambda Function URL (payload v2)
 * @param {{ send?: (params: object) => Promise<void>, env?: Record<string, string|undefined>, now?: number }} deps
 */
export async function handle(event, deps = {}) {
  const env = deps.env ?? process.env;
  const headers = event.headers ?? {};
  const wantsJson = (headers.accept ?? '').includes('application/json');
  const method = event.requestContext?.http?.method ?? 'POST';

  if (env.ORIGIN_SECRET && headers['x-origin-secret'] !== env.ORIGIN_SECRET) return json(403, { ok: false, error: 'forbidden' });
  if (method !== 'POST') return json(405, { ok: false, error: 'method' });

  const raw = parseBody(event);
  if (!raw) return json(400, { ok: false, error: 'body' });
  const now = deps.now ?? Date.now();
  const { ok, errors, data, spam } = validate(raw, now);

  if (!ok) return wantsJson ? json(422, { ok: false, errors }) : seeOther(`${CONTACT[data.lang]}#form-error`);
  // aux robots, on répond comme si tout s'était bien passé
  if (spam) return wantsJson ? json(200, { ok: true }) : seeOther(THANKS[data.lang]);

  const params = buildEmail(data, { date: now, ip: event.requestContext?.http?.sourceIp, userAgent: headers['user-agent'] }, {
    from: env.FROM_EMAIL ?? 'formulaire@laurent-levy.com',
    to: env.TO_EMAIL ?? 'contact@laurent-levy.com',
  });
  try {
    if (env.DRY_RUN) console.log('[contact] DRY_RUN — message non envoyé :\n' + params.Content.Simple.Body.Text.Data);
    else await (deps.send ?? sendWithSes)(params);
  } catch (err) {
    console.error('[contact] échec SES', err);
    return wantsJson ? json(502, { ok: false, error: 'send' }) : seeOther(`${CONTACT[data.lang]}#form-error`);
  }
  return wantsJson ? json(200, { ok: true }) : seeOther(THANKS[data.lang]);
}

export const handler = (event) => handle(event);
