import { getPayload } from 'payload'
import React from 'react'

import { InnerPage } from '@/components/InnerPage'
import { Img } from '@/components/Img'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import config from '@/payload.config'

// Grille pleine largeur de l'ancien site : deux personnes par ligne, chacune = photo + fonction/nom,
// l'ordre photo/texte s'inversant une ligne sur deux.
export async function StaffView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({ collection: 'staff', sort: 'order', limit: 0, pagination: false, depth: 1, locale })

  return (
    <InnerPage
      locale={locale}
      kicker={t.pages.staff.kicker}
      title={t.pages.staff.title}
      hero="/images/bandeau-staff.jpg"
      cta="supporters"
      bleed
    >
      <ul className="staff">
        {docs.map((s, i) => {
          const reversed = Math.floor(i / 2) % 2 === 1
          return (
            <li key={s.id} className={`staff__person ${reversed ? 'staff__person--reversed' : ''}`}>
              <div className="staff__photo">
                <Img src={s.photo} alt="" sizes="(max-width: 1024px) 50vw, 25vw" />
              </div>
              <div className="staff__text">
                <span className="staff__role">{s.role}</span>
                <span className="staff__name">{s.name}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </InnerPage>
  )
}
