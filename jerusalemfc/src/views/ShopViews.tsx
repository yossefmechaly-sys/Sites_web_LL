import { getPayload } from 'payload'
import React from 'react'

import { JoinForm, PreOrderForm } from '@/components/ClubForms'
import { CartIcon } from '@/components/icons'
import { GallerySection, NewsletterSection } from '@/components/Sections'
import { Img } from '@/components/Img'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getHomeContent } from '@/lib/homeContent'
import config from '@/payload.config'

// Boutique (catalogue + formulaire de précommande, sans paiement) et adhésion.

export async function ShopView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const s = t.shopPage
  const payload = await getPayload({ config: await config })
  const [{ docs: products }, home] = await Promise.all([
    payload.find({ collection: 'products', sort: 'order', limit: 0, pagination: false, depth: 1, locale }),
    getHomeContent(locale),
  ])
  const featured = products.filter((p) => p.kind === 'featured')
  const items = products.filter((p) => p.kind !== 'featured')
  const messages = { submit: s.submit, success: s.success, invalid: s.invalid, error: t.newsletter.error }

  return (
    <main>
      {/* Maillots mis en avant sur fond photo */}
      <section className="shop-hero">
        <div className="container">
          <div className="heading heading--light">
            <span className="heading__kicker">{s.kicker}</span>
            <h1 className="heading__title">{s.title}</h1>
          </div>
          <div className="shop-hero__grid">
            {featured.map((p) => (
              <article key={p.id} className="product-card">
                <Img src={p.image} alt="" sizes="300px" />
                <h2>{p.name}</h2>
                {p.description && <p>{p.description}</p>}
                {p.sizes && (
                  <div className="product-card__sizes">
                    <strong>{s.sizes}</strong>
                    <span>{p.sizes}</span>
                  </div>
                )}
                {p.price != null && <span className="product-card__price">₪{p.price}</span>}
                <a className="btn btn--gold" href="#precommande">
                  {s.preorder}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Autres articles */}
      <section className="section store">
        <div className="container">
          <h2 className="store__title">{s.storeTitle}</h2>
          <p className="store__text">{s.storeText}</p>
          <ul className="store__items">
            {items.map((p) => (
              <li key={p.id}>
                <Img src={p.image} alt="" sizes="200px" />
                <h3>{p.name}</h3>
                {p.price != null && <span>{p.price} ₪</span>}
              </li>
            ))}
          </ul>

          <h2 className="store__title" id="precommande">
            <CartIcon size={26} /> {s.formTitle}
          </h2>
          <p className="store__text">{s.formText}</p>
          <PreOrderForm locale={locale} labels={s.fields} m={messages} />
        </div>
      </section>

      <NewsletterSection c={home} t={t} locale={locale} />
      <GallerySection c={home} />
    </main>
  )
}

export async function JoinView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const j = t.joinPage
  const home = await getHomeContent(locale)
  return (
    <main>
      <section className="join">
        <div className="container join__inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-blanc.svg" alt="" width={110} height={104} className="join__logo" />
          <div className="heading heading--light">
            <span className="heading__kicker join__kicker">{j.kicker}</span>
            <h1 className="heading__title">{j.title}</h1>
          </div>
          <p className="join__text">{j.text}</p>
          <JoinForm
            locale={locale}
            labels={j.fields}
            m={{ submit: j.submit, success: j.success, invalid: j.invalid, error: t.newsletter.error }}
          />
        </div>
      </section>
      <NewsletterSection c={home} t={t} locale={locale} />
      <GallerySection c={home} />
    </main>
  )
}
