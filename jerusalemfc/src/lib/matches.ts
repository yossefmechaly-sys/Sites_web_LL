import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Locale } from '@/i18n/config'
import type { Match, Media, Season } from '@/payload-types'
import { computeStandings, type StandingRow } from './standings'

// Lecture des matchs, saisons et classements pour les pages du site.
// Les matchs sont lus sans leurs relations (depth 0) puis complétés à partir des équipes et saisons
// chargées une seule fois par requête : peuplement relation par relation beaucoup trop lent sinon.

export type TeamView = { id: number; name: string; logo: string | null; isClub: boolean }
export type MatchView = {
  id: number
  kickoff: string
  timeTbd: boolean
  venue: string | null
  status: Match['status']
  round: number | null
  home: TeamView
  away: TeamView
  homeScore: number | null
  awayScore: number | null
  season: { id: number; label: string; leagueName: string } | null
}
export type StandingView = StandingRow & { team: TeamView }

const payloadClient = async () => getPayload({ config: await config })

const relId = (v: number | { id: number } | null | undefined) => (v && typeof v === 'object' ? v.id : (v ?? null))

const UNKNOWN_TEAM: TeamView = { id: 0, name: '?', logo: null, isClub: false }

// Toutes les équipes (avec l'URL du logo), une fois par requête et par langue
const getTeams = cache(async (locale: Locale): Promise<Map<number, TeamView>> => {
  const payload = await payloadClient()
  const { docs } = await payload.find({ collection: 'teams', limit: 0, pagination: false, depth: 1, locale })
  return new Map(
    docs.map((t) => [
      t.id,
      { id: t.id, name: t.name, logo: (t.logo as Media | null | undefined)?.url ?? null, isClub: Boolean(t.isClub) },
    ]),
  )
})

// Saisons de la plus récente à la plus ancienne
export const getSeasons = cache(async (locale: Locale): Promise<Season[]> => {
  const payload = await payloadClient()
  const { docs } = await payload.find({ collection: 'seasons', limit: 0, pagination: false, locale, depth: 0 })
  return docs.sort((a, b) => b.label.localeCompare(a.label))
})

export async function getCurrentSeason(locale: Locale): Promise<Season | null> {
  return (await getSeasons(locale)).find((s) => s.isCurrent) ?? null
}

// Classement publié d'une saison (saisi dans l'admin ou repris de l'ancien site)
export async function publishedStandings(locale: Locale, season: Season): Promise<StandingView[]> {
  const teams = await getTeams(locale)
  return (season.standings ?? []).map((r) => {
    const gf = r.gf ?? 0
    const ga = r.ga ?? 0
    const teamId = relId(r.team) ?? 0
    return {
      position: r.position,
      teamId,
      played: r.played ?? 0,
      won: r.won ?? 0,
      drawn: r.drawn ?? 0,
      lost: r.lost ?? 0,
      gf,
      ga,
      gd: gf - ga,
      points: r.points ?? 0,
      team: teams.get(teamId) ?? UNKNOWN_TEAM,
    }
  })
}

// Matchs (hors annulés) dans l'ordre chronologique ; filtrés par saison et/ou sur notre club
export async function getMatches(
  locale: Locale,
  { seasonId, clubOnly = false }: { seasonId?: number; clubOnly?: boolean } = {},
): Promise<MatchView[]> {
  const payload = await payloadClient()
  const [teams, seasons] = await Promise.all([getTeams(locale), getSeasons(locale)])
  const seasonById = new Map(seasons.map((s) => [s.id, s]))

  // Filtre « notre club » fait par la base, pour ne pas charger toutes les rencontres de la ligue
  const clubIds = [...teams.values()].filter((t) => t.isClub).map((t) => t.id)
  const where: Where = {
    and: [
      { status: { not_equals: 'cancelled' } },
      ...(seasonId ? [{ season: { equals: seasonId } }] : []),
      ...(clubOnly ? [{ or: [{ homeTeam: { in: clubIds } }, { awayTeam: { in: clubIds } }] }] : []),
    ],
  }
  const { docs } = await payload.find({
    collection: 'matches',
    where,
    sort: 'kickoff',
    limit: 0,
    pagination: false,
    depth: 0,
    locale,
  })

  return docs.map((m) => {
    const season = seasonById.get(relId(m.season as number | null) ?? -1)
    return {
      id: m.id,
      kickoff: m.kickoff,
      timeTbd: Boolean(m.timeTbd),
      venue: m.venue ?? null,
      status: m.status,
      round: m.round ?? null,
      home: teams.get(relId(m.homeTeam as number) ?? -1) ?? UNKNOWN_TEAM,
      away: teams.get(relId(m.awayTeam as number) ?? -1) ?? UNKNOWN_TEAM,
      homeScore: m.homeScore ?? null,
      awayScore: m.awayScore ?? null,
      season: season ? { id: season.id, label: season.label, leagueName: season.leagueName } : null,
    }
  })
}

export function standingsOf(matches: MatchView[]): StandingView[] {
  const teams = new Map<number, TeamView>()
  for (const m of matches) for (const t of [m.home, m.away]) teams.set(t.id, t)
  return computeStandings(
    matches.map((m) => ({
      homeId: m.home.id,
      awayId: m.away.id,
      homeScore: m.status === 'played' ? m.homeScore : null,
      awayScore: m.status === 'played' ? m.awayScore : null,
    })),
  ).map((row) => ({ ...row, team: teams.get(row.teamId as number)! }))
}

export type HomeData = {
  season: Season | null
  next: MatchView | null
  last: MatchView | null
  standings: StandingView[]
}

export async function getHomeData(locale: Locale): Promise<HomeData> {
  const season = await getCurrentSeason(locale)
  if (!season) return { season: null, next: null, last: null, standings: [] }
  const matches = await getMatches(locale, { seasonId: season.id })
  const club = matches.filter((m) => m.home.isClub || m.away.isClub)
  const now = Date.now()
  return {
    season,
    last: club.filter((m) => m.status === 'played').at(-1) ?? null,
    next: club.find((m) => m.status === 'scheduled' && new Date(m.kickoff).getTime() > now) ?? null,
    standings: standingsOf(matches),
  }
}
