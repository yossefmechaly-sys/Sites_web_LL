import React from 'react'

import { InnerPage } from '@/components/InnerPage'
import { seasonLabel, StandingsTable } from '@/components/ui'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getMatches, getSeasons, publishedStandings, standingsOf } from '@/lib/matches'

// Un classement par saison, de la plus récente à la plus ancienne.
export async function TableView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const seasons = await getSeasons(locale)
  // Classement publié s'il existe ; sinon calculé, mais seulement pour les saisons de la Fédération
  // (l'ancien site ne connaît que les matchs du club : un calcul serait faux)
  const tables = await Promise.all(
    seasons.map(async (s) => ({
      season: s,
      rows: s.standings?.length
        ? await publishedStandings(locale, s)
        : s.ifaLeagueId
          ? standingsOf(await getMatches(locale, { seasonId: s.id }))
          : [],
    })),
  )

  return (
    <InnerPage locale={locale} kicker={t.pages.table.kicker} title={t.pages.table.title}>
      {tables
        .filter((x) => x.rows.length > 0)
        .map(({ season, rows }) => (
          <div key={season.id} className="panel panel--table">
            <h3 className="panel__title">
              {season.leagueName} {seasonLabel(season.label)}
            </h3>
            <StandingsTable rows={rows} t={t} variant="light" />
          </div>
        ))}
    </InnerPage>
  )
}
