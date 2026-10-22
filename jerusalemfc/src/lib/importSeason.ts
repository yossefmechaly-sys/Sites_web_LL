// Import d'une saison depuis la Fédération vers la base Payload.
// Règles : on crée les équipes manquantes (nom hébreu), on crée/met à jour les matchs,
// on ne touche jamais un match verrouillé et on ne supprime rien.

import type { Payload } from 'payload'

import type { Season } from '../payload-types'
import { fetchSeasonGames, israelTimeToUtc, type IfaGame } from './ifa'

export type ImportReport = {
  games: number
  created: number
  updated: number
  unchanged: number
  locked: number
  newTeams: string[]
  missingFromFeed: number
}

export async function importSeason(payload: Payload, season: Season): Promise<ImportReport> {
  if (!season.ifaLeagueId || !season.ifaSeasonId) throw new Error(`Saison ${season.label} sans ID Fédération`)
  const games = await fetchSeasonGames(season.ifaLeagueId, season.ifaSeasonId)
  const report: ImportReport = {
    games: games.length,
    created: 0,
    updated: 0,
    unchanged: 0,
    locked: 0,
    newTeams: [],
    missingFromFeed: 0,
  }

  // Équipes : ifaId → id Payload
  const teamIds = new Map<string, number>()
  const ensureTeam = async (t: IfaGame['home']) => {
    if (teamIds.has(t.id)) return teamIds.get(t.id)!
    const found = await payload.find({
      collection: 'teams',
      where: { ifaId: { equals: t.id } },
      limit: 1,
      depth: 0,
    })
    let id = found.docs[0]?.id
    if (!id) {
      const created = await payload.create({
        collection: 'teams',
        locale: 'he',
        data: { name: t.name, ifaId: t.id },
      })
      id = created.id
      report.newTeams.push(t.name)
    }
    teamIds.set(t.id, id)
    return id
  }

  const seenKeys = new Set<string>()
  for (const g of games) {
    if (!g.date) continue
    const key = `${season.ifaLeagueId}-${season.ifaSeasonId}-${g.round}-${g.home.id}-${g.away.id}`
    seenKeys.add(key)
    const homeTeam = await ensureTeam(g.home)
    const awayTeam = await ensureTeam(g.away)

    const data = {
      homeTeam,
      awayTeam,
      homeScore: g.score?.home ?? null,
      awayScore: g.score?.away ?? null,
      kickoff: israelTimeToUtc(g.date, g.time).toISOString(),
      kickoff_tz: 'Asia/Jerusalem' as const,
      timeTbd: !g.time,
      venue: g.venue,
      season: season.id,
      round: g.round,
      status: (g.score ? 'played' : 'scheduled') as 'played' | 'scheduled',
      source: 'ifa' as const,
      ifaKey: key,
      ifaGameId: g.gameId,
    }

    const existing = (
      await payload.find({
        collection: 'matches',
        where: { ifaKey: { equals: key } },
        limit: 1,
        depth: 0,
        locale: 'he',
      })
    ).docs[0]

    if (!existing) {
      await payload.create({ collection: 'matches', locale: 'he', data })
      report.created++
      continue
    }
    if (existing.locked) {
      report.locked++
      continue
    }
    const changed =
      existing.homeScore !== data.homeScore ||
      existing.awayScore !== data.awayScore ||
      new Date(existing.kickoff).toISOString() !== data.kickoff ||
      Boolean(existing.timeTbd) !== data.timeTbd ||
      (existing.venue ?? null) !== data.venue ||
      existing.status !== data.status ||
      (existing.ifaGameId ?? null) !== data.ifaGameId
    if (!changed) {
      report.unchanged++
      continue
    }
    await payload.update({ collection: 'matches', id: existing.id, locale: 'he', data })
    report.updated++
  }

  // Matchs importés auparavant mais absents du flux (ex. journée renumérotée) : signalés, pas supprimés.
  const previous = await payload.find({
    collection: 'matches',
    where: { season: { equals: season.id }, source: { equals: 'ifa' } },
    limit: 0,
    pagination: false,
    depth: 0,
  })
  report.missingFromFeed = previous.docs.filter((m) => m.ifaKey && !seenKeys.has(m.ifaKey)).length

  await payload.update({
    collection: 'seasons',
    id: season.id,
    data: {
      lastImportAt: new Date().toISOString(),
      lastImportReport: formatReport(report),
    },
  })
  return report
}

export function formatReport(r: ImportReport): string {
  const lines = [
    `${r.games} matchs lus : ${r.created} créés, ${r.updated} mis à jour, ${r.unchanged} inchangés, ${r.locked} verrouillés ignorés.`,
  ]
  if (r.newTeams.length) lines.push(`Nouvelles équipes (nom FR à compléter) : ${r.newTeams.join(', ')}`)
  if (r.missingFromFeed) lines.push(`⚠ ${r.missingFromFeed} match(s) importé(s) absent(s) du site de la Fédération.`)
  return lines.join('\n')
}
