import React from 'react'

import { InnerPage } from '@/components/InnerPage'
import { dateFmt, TeamLogo, timeFmt } from '@/components/ui'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getCurrentSeason, getMatches } from '@/lib/matches'

// Calendrier du club pour la saison en cours : score si le match est joué, sinon l'heure (« 19H30 »).
export async function ScheduleView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const season = await getCurrentSeason(locale)
  const matches = season ? await getMatches(locale, { seasonId: season.id, clubOnly: true }) : []

  return (
    <InnerPage locale={locale} kicker={t.pages.schedule.kicker} title={t.pages.schedule.title}>
      <div className="panel">
        {matches.length === 0 && <p className="panel__empty">{t.noData}</p>}
        <ul className="schedule">
          {matches.map((m) => {
            const played = m.status === 'played' && m.homeScore != null
            return (
              <li key={m.id} className="schedule__item">
                <TeamLogo team={m.home} size={80} />
                <div className="schedule__center">
                  <span className="schedule__date">{dateFmt(m.kickoff)}</span>
                  <span className="schedule__main" dir="ltr">
                    {played
                      ? locale === 'he'
                        ? `${m.awayScore} - ${m.homeScore}`
                        : `${m.homeScore} - ${m.awayScore}`
                      : m.timeTbd
                        ? '--:--'
                        : timeFmt(m.kickoff).replace(':', 'H')}
                  </span>
                  <span className="schedule__teams">
                    {m.home.name} - {m.away.name}
                  </span>
                  <span className="schedule__league">{m.season?.leagueName}</span>
                </div>
                <TeamLogo team={m.away} size={80} />
              </li>
            )
          })}
        </ul>
      </div>
    </InnerPage>
  )
}
