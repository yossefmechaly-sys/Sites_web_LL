import React from 'react'

import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getHomeContent } from '@/lib/homeContent'
import { CtaSection, GallerySection, NewsletterSection } from './Sections'
import { Heading } from './ui'
import { Img } from './Img'

// Gabarit des pages intérieures de l'ancien site : bandeau photo, section grise avec titre et
// contenu, puis appel à l'action (photo de stade), newsletter et galerie.
export async function InnerPage({
  locale,
  kicker,
  title,
  bleed = false,
  hero = '/images/bandeau-interieur.jpg',
  cta = 'stadium',
  tone = 'grey',
  children,
}: {
  locale: Locale
  kicker: string
  title: string
  // Contenu pleine largeur, hors de la section grise (grille du staff)
  bleed?: boolean
  // Photo du bandeau, propre à chaque page sur l'ancien site ; null = pas de bandeau
  hero?: string | null
  // Fond de la section titre : gris, ou bleu à motif (pages chants et Torah)
  tone?: 'grey' | 'blue'
  // Fond de l'appel à l'action : photo de stade, ou celle des supporters (fiche « Accueil »)
  cta?: 'stadium' | 'supporters'
  children: React.ReactNode
}) {
  const t = getDictionary(locale)
  const c = await getHomeContent(locale)
  return (
    <main>
      {hero && (
        <section className="hero hero--inner">
          <Img src={hero} alt="" className="hero__img is-active" width={2200} height={1498} sizes="100vw" priority />
          <p className="hero__watermark" aria-hidden>
            Jerusalem
            <br />
            Footballclub
          </p>
        </section>
      )}
      <section
        className={`section inner ${tone === 'blue' ? 'inner--blue' : 'section--grey'} ${bleed ? 'inner--bleed' : ''}`}
      >
        <div className="container">
          <Heading kicker={kicker} title={title} light={tone === 'blue'} />
          {!bleed && children}
        </div>
      </section>
      {bleed && children}
      <CtaSection c={c} locale={locale} background={cta === 'stadium' ? '/images/stade.jpg' : undefined} />
      <NewsletterSection c={c} t={t} locale={locale} />
      <GallerySection c={c} />
    </main>
  )
}
