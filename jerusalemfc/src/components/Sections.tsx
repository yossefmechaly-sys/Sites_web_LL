import Link from 'next/link'
import React from 'react'

import { href, type Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { mediaUrl } from '@/lib/homeContent'
import type { Home } from '@/payload-types'
import { SOCIAL } from './Header'
import { NewsletterForm } from './NewsletterForm'
import { Img } from './Img'

// Sections communes à l'accueil et aux pages intérieures (contenu : fiche « Accueil »).

// Icônes fixes des trois colonnes « histoire »
const STORY_ICONS = ['/images/icone-ballon.svg', '/images/icone-coupe.svg', '/images/icone-stade.svg']

export function StorySection({ c }: { c: Home }) {
  return (
    <section className="story">
      <div className="container story__inner">
        <div className="story__brand">
          <h2>{c.story?.title}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-blanc.svg" alt="" width={159} height={150} loading="lazy" />
        </div>
        {(c.story?.columns ?? []).map((col, i) => (
          <div key={col.id} className="story__col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STORY_ICONS[i % STORY_ICONS.length]} alt="" loading="lazy" />
            <p>{col.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CtaSection({ c, locale, background }: { c: Home; locale: Locale; background?: string | null }) {
  const src = background ?? mediaUrl(c.cta?.background)
  // Fond optimisé par Next.js (AVIF/WebP, 1920 px max) plutôt que l'original
  const bg = src ? `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75` : null
  return (
    <section className="cta" style={bg ? { backgroundImage: `url('${bg}')` } : undefined}>
      <div className="container">
        <h2>{c.cta?.title}</h2>
        <Link className="btn btn--gold btn--lg" href={href('join', locale)}>
          {c.cta?.button}
        </Link>
      </div>
    </section>
  )
}

export function NewsletterSection({ c, t, locale }: { c: Home; t: Dictionary; locale: Locale }) {
  return (
    <section className="newsletter">
      <div className="container">
        <h2>{c.newsletter?.title}</h2>
        <p>{c.newsletter?.sub}</p>
        <NewsletterForm
          locale={locale}
          labels={{
            placeholder: t.newsletter.placeholder,
            button: c.newsletter?.button ?? '',
            success: c.newsletter?.success ?? '',
            invalid: t.newsletter.invalid,
            error: t.newsletter.error,
          }}
        />
      </div>
    </section>
  )
}

export function GallerySection({ c }: { c: Home }) {
  return (
    <section className="gallery" aria-label="Instagram">
      {(c.gallery?.images ?? []).map((g) => (
        <a key={g.id} href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <Img src={g.image} alt="" sizes="(max-width: 1024px) 25vw, 12.5vw" />
        </a>
      ))}
    </section>
  )
}
