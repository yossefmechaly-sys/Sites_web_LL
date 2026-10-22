import { getPayload } from 'payload'
import React from 'react'

import { InnerPage } from '@/components/InnerPage'
import { Img } from '@/components/Img'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { mediaUrl } from '@/lib/homeContent'
import config from '@/payload.config'
import type { Player } from '@/payload-types'

const ORDER: Player['position'][] = ['attacker', 'midfielder', 'defender', 'goalkeeper']

// Effectif actuel, regroupé par poste puis trié par numéro (comme l'ancien site).
export async function PlayersView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'players',
    where: { active: { equals: true } },
    sort: 'number',
    limit: 0,
    pagination: false,
    depth: 1,
    locale,
  })

  return (
    <InnerPage
      locale={locale}
      kicker={t.pages.players.kicker}
      title={t.pages.players.title}
      hero="/images/bandeau-joueurs.jpg"
    >
      <div className="panel players">
        {docs.length === 0 && <p className="panel__empty">{t.noData}</p>}
        {ORDER.map((position) => {
          const group = docs.filter((p) => p.position === position)
          if (!group.length) return null
          return (
            <section key={position} className="players__group">
              <h3 className="players__title">{t.positions[position]}</h3>
              <ul className="players__grid">
                {group.map((p) => {
                  const photo = mediaUrl(p.photo)
                  return (
                    <li key={p.id} className="player">
                      <div className="player__photo">
                        {p.number != null && <span className="player__number">{p.number}</span>}
                        {photo ? (
                          <Img src={p.photo} alt="" sizes="(max-width: 767px) 50vw, 240px" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src="/images/logo.svg" alt="" className="player__placeholder" loading="lazy" />
                        )}
                      </div>
                      <span className="player__name">{p.name}</span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </InnerPage>
  )
}
