import React from 'react'

import { InnerPage } from '@/components/InnerPage'
import { dateFmt, seasonLabel, TeamLogo } from '@/components/ui'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getMatches } from '@/lib/matches'

// Liste de tous les matchs du club, toutes saisons, dans l'ordre chronologique (comme l'ancien site).
export async function MatchesView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const matches = await getMatches(locale, { clubOnly: true })
  const col = t.matchesCols

  return (
    <InnerPage locale={locale} kicker={t.pages.matches.kicker} title={t.pages.matches.title}>
      <div className="panel">
        {matches.length === 0 ? (
          <p className="panel__empty">{t.noData}</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table matches-table">
              <thead>
                <tr>
                  <th>{col.date}</th>
                  <th>{col.clubs}</th>
                  <th>{col.result}</th>
                  <th>{col.league}</th>
                  <th>{col.season}</th>
                  <th>{col.venue}</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id}>
                    <td className="matches-table__date">{dateFmt(m.kickoff)}</td>
                    <td>
                      <span className="matches-table__names">
                        {m.home.name} - {m.away.name}
                      </span>
                      <span className="matches-table__logos">
                        <TeamLogo team={m.home} size={32} />
                        <TeamLogo team={m.away} size={32} />
                      </span>
                    </td>
                    <td dir="ltr">
                      {m.status === 'played' && m.homeScore != null ? (
                        // Domicile du côté du logo domicile (à droite en hébreu)
                        locale === 'he' ? (
                          `${m.awayScore} - ${m.homeScore}`
                        ) : (
                          `${m.homeScore} - ${m.awayScore}`
                        )
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{m.season?.leagueName}</td>
                    <td dir="ltr">{m.season ? seasonLabel(m.season.label).replace('/', ' - ') : ''}</td>
                    <td className="matches-table__venue">{m.venue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </InnerPage>
  )
}
