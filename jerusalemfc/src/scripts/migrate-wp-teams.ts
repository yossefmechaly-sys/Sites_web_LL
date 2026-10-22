// Reprise depuis l'ancien site WordPress (SportsPress) : nom français et logo des équipes.
// Ne remplace jamais un nom français ou un logo déjà saisis dans l'admin.
// Usage : npm run migrate:wp-teams

import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { getPayload } from 'payload'
import config from '@payload-config'

import { IFA_TO_WP, WP_BASE } from '../lib/wpMapping'

const execFileAsync = promisify(execFile)
const WP = WP_BASE
const MAPPING = IFA_TO_WP
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

async function curlJson<T>(url: string): Promise<T> {
  const { stdout } = await execFileAsync('curl', ['-s', '-A', UA, url], { maxBuffer: 10 * 1024 * 1024 })
  return JSON.parse(stdout) as T
}

const payload = await getPayload({ config })
const tmp = await mkdtemp(path.join(tmpdir(), 'jfc-logos-'))

const teams = await payload.find({ collection: 'teams', limit: 0, pagination: false, locale: 'fr', fallbackLocale: false })
for (const team of teams.docs) {
  const map = team.ifaId ? MAPPING[team.ifaId] : undefined
  if (!map) {
    payload.logger.warn(`Pas de correspondance pour l'équipe ${team.id} (ifa ${team.ifaId})`)
    continue
  }
  const data: { name?: string; logo?: number | null } = {}
  if (!team.name) data.name = map.frName

  // Un logo importé qui n'est pas une image (page d'erreur enregistrée par une version précédente) est remplacé
  let logo = team.logo
  if (logo && typeof logo === 'object' && !logo.mimeType?.startsWith('image/')) {
    await payload.delete({ collection: 'media', id: logo.id })
    payload.logger.warn(`${map.frName} : logo invalide supprimé`)
    logo = null
    data.logo = null
  }

  if (!logo && map.wpHe) {
    const wpTeam = await curlJson<{ featured_media: number }>(`${WP}/he/wp-json/sportspress/v2/teams/${map.wpHe}`)
    if (wpTeam.featured_media) {
      const media = await curlJson<{ source_url: string }>(`${WP}/he/wp-json/wp/v2/media/${wpTeam.featured_media}`)
      // Noms de fichiers en hébreu : l'URL doit être encodée
      const url = encodeURI(decodeURI(media.source_url))
      const file = path.join(tmp, `logo-${team.ifaId}${path.extname(new URL(url).pathname)}`)
      const { stdout: type } = await execFileAsync('curl', ['-s', '-f', '-A', UA, '-o', file, '-w', '%{content_type}', url]).catch(
        () => ({ stdout: '' }),
      )
      if (type.startsWith('image/')) {
        const created = await payload.create({ collection: 'media', data: { alt: map.frName }, filePath: file })
        data.logo = created.id
      } else {
        payload.logger.warn(`${map.frName} : logo introuvable sur l'ancien site (${url})`)
      }
    }
  }

  if (Object.keys(data).length) {
    await payload.update({ collection: 'teams', id: team.id, locale: 'fr', data })
    const taken = Object.entries(data).filter(([, v]) => v != null).map(([k]) => k)
    if (taken.length) payload.logger.info(`${map.frName} : ${taken.join(', ')} repris`)
  }
}

await rm(tmp, { recursive: true, force: true })
process.exit(0)
