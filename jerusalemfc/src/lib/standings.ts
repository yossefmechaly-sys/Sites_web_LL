// Classement calculé à partir des résultats : la Fédération ne le publie pas pour la Liga Alef.

export type StandingInput = {
  homeId: string | number
  awayId: string | number
  homeScore: number | null | undefined
  awayScore: number | null | undefined
}

export type StandingRow = {
  position: number
  teamId: string | number
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
}

export function computeStandings(matches: StandingInput[]): StandingRow[] {
  const table = new Map<string | number, Omit<StandingRow, 'position' | 'gd'>>()
  const row = (teamId: string | number) => {
    if (!table.has(teamId))
      table.set(teamId, { teamId, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 })
    return table.get(teamId)!
  }
  for (const m of matches) {
    const h = row(m.homeId)
    const a = row(m.awayId)
    if (m.homeScore == null || m.awayScore == null) continue
    const hs = m.homeScore
    const as = m.awayScore
    h.played++
    a.played++
    h.gf += hs
    h.ga += as
    a.gf += as
    a.ga += hs
    if (hs > as) {
      h.won++
      a.lost++
      h.points += 3
    } else if (hs < as) {
      a.won++
      h.lost++
      a.points += 3
    } else {
      h.drawn++
      a.drawn++
      h.points++
      a.points++
    }
  }
  // Départage simplifié (points, différence, buts marqués) : le règlement IFA est à confirmer.
  return [...table.values()]
    .map((r) => ({ ...r, gd: r.gf - r.ga }))
    .sort((x, y) => y.points - x.points || y.gd - x.gd || y.gf - x.gf)
    .map((r, i) => ({ position: i + 1, ...r }))
}
