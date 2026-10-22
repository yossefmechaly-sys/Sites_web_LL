// Reprise de l'historique des matchs depuis l'ancien site WordPress (SportsPress).
// Crée les saisons (une par saison + ligue), les équipes manquantes (noms HE/FR, logo) et les matchs.
// Idempotent : un match déjà repris n'est pas recréé ; rien n'est supprimé.
// La Liga Alef Sud 2025/26 est ignorée : elle vient de l'import Fédération.
// Usage : npm run migrate:wp-matches

import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { getPayload, type Where } from 'payload'
import config from '@payload-config'

import { israelTimeToUtc } from '../lib/ifa'
import { IFA_TO_WP, WP_BASE, WP_LEAGUE_FR, WP_SKIP, WP_TEAM_FR_ID } from '../lib/wpMapping'

const execFileAsync = promisify(execFile)
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const API = (locale: 'he' | 'fr') => `${WP_BASE}/${locale}/wp-json`

type WpTeam = { id: number; title: { rendered: string }; featured_media: number }
type WpTerm = { id: number; name: string }
type WpEvent = {
  id: number
  date: string
  teams: number[]
  main_results: string[]
  leagues: number[]
  seasons: number[]
  venues: number[]
}

async function curlJson<T>(url: string): Promise<T> {
  const { stdout } = await execFileAsync('curl', ['-s', '-f', '-A', UA, url], { maxBuffer: 50 * 1024 * 1024 })
  return JSON.parse(stdout) as T
}

const decodeEntities = (s: string) =>
  s
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;/g, "'")
    .trim()

// « 2019 - 2020 », « 2023-2024 גביה » → « 2019/20 »
const seasonLabel = (name: string) => {
  const m = name.match(/(\d{4})\s*-\s*(\d{4})/)
  return m ? `${m[1]}/${m[2].slice(2)}` : name
}

const payload = await getPayload({ config })
const tmp = await mkdtemp(path.join(tmpdir(), 'jfc-wp-'))

// --- Référentiels de l'ancien site
const [heTeams, frTeams, leagues, seasons, venues] = await Promise.all([
  curlJson<WpTeam[]>(`${API('he')}/sportspress/v2/teams?per_page=100&_fields=id,title,featured_media`),
  curlJson<WpTeam[]>(`${API('fr')}/sportspress/v2/teams?per_page=100&_fields=id,title`),
  curlJson<WpTerm[]>(`${API('he')}/sportspress/v2/leagues?per_page=100&_fields=id,name`),
  curlJson<WpTerm[]>(`${API('he')}/sportspress/v2/seasons?per_page=100&_fields=id,name`),
  curlJson<WpTerm[]>(`${API('he')}/sportspress/v2/venues?per_page=100&_fields=id,name`),
])
const heTeamById = new Map(heTeams.map((t) => [t.id, t]))
const frTeamById = new Map(frTeams.map((t) => [t.id, t]))
const leagueById = new Map(leagues.map((l) => [l.id, decodeEntities(l.name)]))
const seasonById = new Map(seasons.map((s) => [s.id, decodeEntities(s.name)]))
const venueById = new Map(venues.map((v) => [v.id, decodeEntities(v.name)]))

// --- Matchs : l'API plante sur les grandes pages, on pagine par 10 avec plusieurs tentatives
const PER_PAGE = 10
const { stdout: headers } = await execFileAsync('curl', ['-s', '-I', '-A', UA, `${API('he')}/sportspress/v2/events?per_page=${PER_PAGE}`])
const total = Number(headers.match(/x-wp-total:\s*(\d+)/i)?.[1] ?? 0)
const events: WpEvent[] = []
for (let page = 1; page <= Math.ceil(total / PER_PAGE); page++) {
  const url = `${API('he')}/sportspress/v2/events?per_page=${PER_PAGE}&page=${page}&orderby=date&order=asc`
  for (let attempt = 1; ; attempt++) {
    try {
      events.push(...(await curlJson<WpEvent[]>(url)))
      break
    } catch (err) {
      if (attempt === 3) throw new Error(`Page ${page} des matchs illisible : ${(err as Error).message}`)
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
}
payload.logger.info(`${events.length} matchs lus sur l'ancien site (${total} annoncés)`)

// Matchs que l'API de l'ancien site ne renvoie pas (WordPress les masque) mais que sa page publique
// « liste des matchs » affiche : relevés à la main sur cette page (même ordre équipes/score que l'API).
// L'id négatif sert de clé d'import stable. Heure inconnue.
const HIDDEN_FROM_API: WpEvent[] = [
  { id: -1, date: '2024-01-19T00:00', teams: [3477, 5117], main_results: ['3', '0'], leagues: [148], seasons: [156], venues: [155] },
  { id: -2, date: '2024-01-26T00:00', teams: [5797, 3477], main_results: ['2', '2'], leagues: [148], seasons: [156], venues: [] },
  { id: -3, date: '2024-03-01T00:00', teams: [5697, 3477], main_results: ['0', '2'], leagues: [148], seasons: [156], venues: [] },
  { id: -4, date: '2024-04-05T00:00', teams: [3477, 5157], main_results: ['5', '1'], leagues: [158], seasons: [159], venues: [155] },
  { id: -5, date: '2024-09-27T00:00', teams: [5912, 3477], main_results: ['0', '1'], leagues: [160], seasons: [161], venues: [] },
  { id: -6, date: '2024-12-20T00:00', teams: [5923, 3477], main_results: ['1', '0'], leagues: [160], seasons: [161], venues: [] },
]
events.push(...HIDDEN_FROM_API)

// --- Équipes : WP id → id Payload
const wpHeToIfa = new Map(
  Object.entries(IFA_TO_WP)
    .filter(([, v]) => v.wpHe)
    .map(([ifa, v]) => [v.wpHe!, ifa]),
)
const teamIds = new Map<number, number>()
let createdTeams = 0
async function teamFor(wpId: number): Promise<number> {
  if (teamIds.has(wpId)) return teamIds.get(wpId)!
  const ifaId = wpHeToIfa.get(wpId)
  const where: Where = ifaId ? { ifaId: { equals: ifaId } } : { wpId: { equals: wpId } }
  let team = (await payload.find({ collection: 'teams', where, limit: 1, depth: 0 })).docs[0]
  if (team && !team.wpId) await payload.update({ collection: 'teams', id: team.id, data: { wpId } })
  if (!team) {
    const he = heTeamById.get(wpId)
    const fr = frTeamById.get(WP_TEAM_FR_ID[wpId] ?? wpId)
    const heName = he ? decodeEntities(he.title.rendered) : `#${wpId}`
    let logo: number | undefined
    if (he?.featured_media) {
      const media = await curlJson<{ source_url: string }>(`${API('he')}/wp/v2/media/${he.featured_media}`).catch(
        () => null,
      )
      if (media) {
        const url = encodeURI(decodeURI(media.source_url))
        const file = path.join(tmp, `wp-team-${wpId}${path.extname(new URL(url).pathname)}`)
        const { stdout: type } = await execFileAsync('curl', ['-s', '-f', '-A', UA, '-o', file, '-w', '%{content_type}', url]).catch(
          () => ({ stdout: '' }),
        )
        if (type.startsWith('image/'))
          logo = (await payload.create({ collection: 'media', data: { alt: heName }, filePath: file })).id
      }
    }
    team = await payload.create({ collection: 'teams', locale: 'he', data: { name: heName, wpId, logo } })
    if (fr) await payload.update({ collection: 'teams', id: team.id, locale: 'fr', data: { name: decodeEntities(fr.title.rendered) } })
    createdTeams++
  }
  teamIds.set(wpId, team.id)
  return team.id
}

// --- Saisons : une par (saison WP, ligue WP)
const seasonIds = new Map<string, number>()
let createdSeasons = 0
async function seasonFor(wpSeason: number, wpLeague: number): Promise<number> {
  const key = `${wpSeason}-${wpLeague}`
  if (seasonIds.has(key)) return seasonIds.get(key)!
  let season = (await payload.find({ collection: 'seasons', where: { wpKey: { equals: key } }, limit: 1 })).docs[0]
  if (!season) {
    season = await payload.create({
      collection: 'seasons',
      locale: 'he',
      data: {
        label: seasonLabel(seasonById.get(wpSeason) ?? String(wpSeason)),
        leagueName: leagueById.get(wpLeague) ?? '',
        wpKey: key,
        autoImport: false,
        isCurrent: false,
      },
    })
    if (WP_LEAGUE_FR[wpLeague])
      await payload.update({ collection: 'seasons', id: season.id, locale: 'fr', data: { leagueName: WP_LEAGUE_FR[wpLeague] } })
    createdSeasons++
  }
  seasonIds.set(key, season.id)
  return season.id
}

// --- Matchs
let created = 0
let existing = 0
let skipped = 0
for (const e of events) {
  const [homeWp, awayWp] = e.teams
  const wpSeason = e.seasons[0]
  const wpLeague = e.leagues[0]
  if (!homeWp || !awayWp || !wpSeason || !wpLeague) {
    skipped++
    continue
  }
  if (wpSeason === WP_SKIP.season && wpLeague === WP_SKIP.league) {
    skipped++
    continue
  }
  const key = e.id < 0 ? `wp-hidden${e.id}` : `wp-${e.id}`
  if ((await payload.count({ collection: 'matches', where: { ifaKey: { equals: key } } })).totalDocs) {
    existing++
    continue
  }
  const [date, time] = e.date.split('T')
  const hs = e.main_results?.[0]
  const as = e.main_results?.[1]
  const played = hs !== undefined && hs !== '' && as !== undefined && as !== ''
  await payload.create({
    collection: 'matches',
    locale: 'he',
    data: {
      homeTeam: await teamFor(homeWp),
      awayTeam: await teamFor(awayWp),
      homeScore: played ? Number(hs) : null,
      awayScore: played ? Number(as) : null,
      kickoff: israelTimeToUtc(date, time.slice(0, 5)).toISOString(),
      kickoff_tz: 'Asia/Jerusalem',
      timeTbd: e.id < 0,
      venue: e.venues[0] ? venueById.get(e.venues[0]) : null,
      season: await seasonFor(wpSeason, wpLeague),
      status: played ? 'played' : 'scheduled',
      source: 'wp',
      ifaKey: key,
    },
  })
  created++
}

// --- Classements saisis sur l'ancien site : l'ancien site ne connaît que les matchs du club,
// un classement calculé serait faux. On reprend ses tableaux (sauf la saison couverte par la Fédération).
type WpTable = { id: number; leagues: number[]; seasons: number[]; data: Record<string, Record<string, string | number>> }
const tables = await curlJson<WpTable[]>(`${API('he')}/sportspress/v2/tables?per_page=100`)
let tablesImported = 0
for (const table of tables) {
  const [wpSeason] = table.seasons
  const [wpLeague] = table.leagues
  if (!wpSeason || !wpLeague || (wpSeason === WP_SKIP.season && wpLeague === WP_SKIP.league)) continue
  const seasonId = await seasonFor(wpSeason, wpLeague)
  const season = await payload.findByID({ collection: 'seasons', id: seasonId, depth: 0 })
  if (season.standings?.length) continue // déjà repris ou saisi dans l'admin
  const num = (v: unknown) => (v === '' || v == null ? null : Number(v))
  const rows = []
  for (const [teamWpId, row] of Object.entries(table.data)) {
    if (teamWpId === '0') continue // ligne d'en-têtes
    rows.push({
      position: Number(row.pos),
      team: await teamFor(Number(teamWpId)),
      played: num(row.p),
      won: num(row.w),
      drawn: num(row.d),
      lost: num(row.l),
      gf: num(row.f),
      ga: num(row.a),
      points: num(row.pts),
    })
  }
  rows.sort((a, b) => a.position - b.position)
  await payload.update({ collection: 'seasons', id: seasonId, data: { standings: rows } })
  tablesImported++
}

await rm(tmp, { recursive: true, force: true })
payload.logger.info(
  `Historique : ${created} matchs créés, ${existing} déjà présents, ${skipped} ignorés ; ` +
    `${createdSeasons} saisons et ${createdTeams} équipes créées ; ${tablesImported} classements repris.`,
)
process.exit(0)
