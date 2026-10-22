// Reprise des joueurs (API SportsPress) et du staff (relevé sur la page « staff » de l'ancien site,
// saisie à la main dans la mise en page et absente de l'API). Idempotent : rien n'est recréé.
// Usage : npm run migrate:wp-people

import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Player } from '../payload-types'
import { WP_BASE } from '../lib/wpMapping'

const execFileAsync = promisify(execFile)
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

// Joueur (id hébreu) → id français, quand ils diffèrent (vérifié sur les noms)
const PLAYER_FR_ID: Record<number, number> = {
  6103: 6082, 6102: 6090, 6101: 6081, 6100: 6080, 6099: 6089, 6098: 6088, 6097: 6087, 6096: 6086,
  6095: 6084, 6094: 6083, 6093: 6079, 6092: 6078, 6091: 6077, 6090: 6076, 6089: 6075, 6088: 6074,
  5753: 5719, 5747: 5727,
}
const POSITION: Record<number, Player['position']> = {
  141: 'attacker',
  142: 'midfielder',
  143: 'defender',
  144: 'goalkeeper',
}

// Staff de la page hébraïque (ordre de lecture), avec les fonctions et noms de la page française
const STAFF = [
  { he: ['לורנט לוי', 'הנשיא'], fr: ['Laurent Levy', 'le président'], photo: '2022/03/WhatsApp-Image-2022-03-13-at-11.54.36.jpeg' },
  { he: ['דניאל ישי', 'מנהל כללי'], fr: ['Daniel Ishay', 'directeur général'], photo: '2022/02/directeur.jpg' },
  { he: ['דויד ברמן', 'מאמן'], fr: ['David Birman', 'entraineur'], photo: '2025/09/1.png' },
  { he: ['אופיר גרינברג', 'סגן מאמן'], fr: ['Ofir Grinberg', 'entraîneur adjoint'], photo: '2025/09/4.png' },
  { he: ['מתאו עשור', 'מאמן כושר'], fr: ['Matou Achour', 'coach sportif'], photo: '2025/09/3.png' },
  { he: ['דן אטל', 'לוגיסטיקה'], fr: ['Dan Atal', 'responsable logistique'], photo: '2024/02/מכ-ירושלים-שיכון-המזרח-246-of-583.jpg' },
  { he: ['אמיר אבוקסיס', 'מאמן שוערים'], fr: ['Amir Aboucasis', 'entraineur gardien'], photo: '2025/09/2.png' },
  { he: ['אריק בניסטי', 'חובש'], fr: ['Eric Benisti', 'préparateur physique'], photo: '2022/02/infirmier.jpg' },
  { he: ['יוסי גספי', 'מחסנאי'], fr: ['Yossi Gaspi', 'magasinier'], photo: '2024/02/מכ-ירושלים-מכבי-רמלה-60-of-383.jpg' },
]

async function curlJson<T>(url: string): Promise<T> {
  const { stdout } = await execFileAsync('curl', ['-s', '-f', '-A', UA, url], { maxBuffer: 20 * 1024 * 1024 })
  return JSON.parse(stdout) as T
}

const payload = await getPayload({ config })
const tmp = await mkdtemp(path.join(tmpdir(), 'jfc-people-'))

// Télécharge une image de l'ancien site dans la médiathèque ; null si ce n'est pas une image
async function upload(url: string, alt: string, name: string): Promise<number | null> {
  const safe = encodeURI(decodeURI(url))
  const file = path.join(tmp, `${name}${path.extname(new URL(safe).pathname)}`)
  const { stdout: type } = await execFileAsync('curl', ['-s', '-f', '-A', UA, '-o', file, '-w', '%{content_type}', safe]).catch(
    () => ({ stdout: '' }),
  )
  if (!type.startsWith('image/')) {
    payload.logger.warn(`Image introuvable : ${url}`)
    return null
  }
  return (await payload.create({ collection: 'media', data: { alt }, filePath: file })).id
}

// --- Joueurs
type WpPlayer = { id: number; title: { rendered: string }; number: number | ''; positions: number[]; featured_media: number }
const [hePlayers, frPlayers] = await Promise.all([
  curlJson<WpPlayer[]>(`${WP_BASE}/he/wp-json/sportspress/v2/players?per_page=100`),
  curlJson<WpPlayer[]>(`${WP_BASE}/fr/wp-json/sportspress/v2/players?per_page=100&_fields=id,title`),
])
const frById = new Map(frPlayers.map((p) => [p.id, p.title.rendered.trim()]))
let players = 0
for (const p of hePlayers) {
  if ((await payload.count({ collection: 'players', where: { wpId: { equals: p.id } } })).totalDocs) continue
  const name = p.title.rendered.trim()
  let photo: number | null = null
  if (p.featured_media) {
    const media = await curlJson<{ source_url: string }>(`${WP_BASE}/he/wp-json/wp/v2/media/${p.featured_media}`).catch(
      () => null,
    )
    if (media) photo = await upload(media.source_url, name, `player-${p.id}`)
  }
  const created = await payload.create({
    collection: 'players',
    locale: 'he',
    data: {
      name,
      number: p.number === '' ? null : Number(p.number),
      position: POSITION[p.positions[0]] ?? 'midfielder',
      photo,
      active: true,
      wpId: p.id,
    },
  })
  const fr = frById.get(PLAYER_FR_ID[p.id] ?? p.id)
  if (fr) await payload.update({ collection: 'players', id: created.id, locale: 'fr', data: { name: fr } })
  players++
}

// --- Staff
let staff = 0
for (const [i, s] of STAFF.entries()) {
  const exists = await payload.count({ collection: 'staff', where: { name: { equals: s.he[0] } }, locale: 'he' })
  if (exists.totalDocs) continue
  const photo = await upload(`${WP_BASE}/he/wp-content/uploads/${s.photo}`, s.he[0], `staff-${i + 1}`)
  const created = await payload.create({
    collection: 'staff',
    locale: 'he',
    data: { name: s.he[0], role: s.he[1], photo, order: (i + 1) * 10 },
  })
  await payload.update({ collection: 'staff', id: created.id, locale: 'fr', data: { name: s.fr[0], role: s.fr[1] } })
  staff++
}

await rm(tmp, { recursive: true, force: true })
payload.logger.info(`${players} joueurs et ${staff} membres du staff repris.`)
process.exit(0)
