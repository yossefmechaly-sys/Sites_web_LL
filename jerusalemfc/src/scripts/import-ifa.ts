// Import des saisons marquées « import automatique » depuis la Fédération.
// Usage : npm run import:ifa   (lancé par le cron sur le serveur)
// Sur une base vide, crée d'abord les saisons connues (`payload run` ne transmet pas d'arguments).

import { getPayload } from 'payload'
import config from '@payload-config'

import { formatReport, importSeason } from '../lib/importSeason'

const CLUB_IFA_ID = '7348' // מ.כ. ירושלים

// Saisons connues de la Liga Alef Sud (league_id 62 sur football.org.il)
const KNOWN_SEASONS = [
  { label: '2025/26', ifaSeasonId: 27, isCurrent: false },
  { label: '2026/27', ifaSeasonId: 28, isCurrent: true },
]

const payload = await getPayload({ config })

if ((await payload.count({ collection: 'seasons' })).totalDocs === 0) {
  for (const s of KNOWN_SEASONS) {
    const created = await payload.create({
      collection: 'seasons',
      locale: 'he',
      data: { ...s, leagueName: "ליגה א' דרום", ifaLeagueId: 62, autoImport: true },
    })
    await payload.update({
      collection: 'seasons',
      id: created.id,
      locale: 'fr',
      data: { leagueName: 'Liga Alef Sud' },
    })
    payload.logger.info(`Saison ${s.label} créée`)
  }
}

const seasons = await payload.find({
  collection: 'seasons',
  where: {
    autoImport: { equals: true },
    ifaLeagueId: { exists: true },
    ifaSeasonId: { exists: true },
  },
  limit: 0,
  pagination: false,
})

let failed = false
for (const season of seasons.docs) {
  try {
    const report = await importSeason(payload, season)
    payload.logger.info(`[${season.label}] ${formatReport(report)}`)
  } catch (err) {
    failed = true
    payload.logger.error(`[${season.label}] import échoué : ${(err as Error).message}`)
    await payload.update({
      collection: 'seasons',
      id: season.id,
      data: { lastImportReport: `❌ Échec ${new Date().toISOString()} : ${(err as Error).message}` },
    })
  }
}

// Notre club : marqué une fois pour toutes
const club = await payload.find({ collection: 'teams', where: { ifaId: { equals: CLUB_IFA_ID } }, limit: 1 })
if (club.docs[0] && !club.docs[0].isClub) {
  await payload.update({ collection: 'teams', id: club.docs[0].id, data: { isClub: true } })
}

// Le script tourne hors du serveur Next.js : on lui demande de vider le cache des pages
// (route /revalidate). Sans REVALIDATE_SECRET, les pages se mettent à jour d'elles-mêmes sous 5 minutes.
if (process.env.REVALIDATE_SECRET) {
  const url = `${process.env.INTERNAL_URL ?? 'http://127.0.0.1:3100'}/revalidate`
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET } })
    payload.logger.info(`Cache du site : ${res.ok ? 'vidé' : `échec HTTP ${res.status}`}`)
  } catch (err) {
    payload.logger.warn(`Cache du site non vidé (${(err as Error).message}) : mise à jour sous 5 minutes`)
  }
}

process.exit(failed ? 1 : 0)
