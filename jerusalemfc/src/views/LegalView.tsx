import { getPayload } from 'payload'
import React from 'react'

import { InnerPage } from '@/components/InnerPage'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import config from '@/payload.config'

// Mentions légales, données personnelles et cookies (fiche « Mentions légales » de l'admin).
export async function LegalView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const payload = await getPayload({ config: await config })
  const p = await payload.findGlobal({ slug: 'legal-page', locale, depth: 0 })
  const updated = p.updatedOn
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'Asia/Jerusalem' }).format(new Date(p.updatedOn))
    : null

  return (
    <InnerPage locale={locale} kicker="Jerusalem Football Club" title={p.title ?? t.footer.legal} hero={null} cta="supporters">
      <article className="panel legal">
        {(p.sections ?? []).map((s) => (
          <section key={s.id}>
            <h2>{s.heading}</h2>
            {s.body
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </section>
        ))}
        {updated && <p className="legal__updated">{updated}</p>}
      </article>
    </InnerPage>
  )
}
