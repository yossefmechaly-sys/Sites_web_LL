import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { InnerPage } from '@/components/InnerPage'
import { StorySection } from '@/components/Sections'
import { Heading } from '@/components/ui'
import { YouTube } from '@/components/YouTube'
import { Img } from '@/components/Img'
import { href, type Locale } from '@/i18n/config'
import { getHomeContent } from '@/lib/homeContent'
import config from '@/payload.config'

// Pages « Le club », « Chants » et « Torah & foot » : contenu des fiches du même nom dans l'admin.

const payloadClient = async () => getPayload({ config: await config })

const paragraphs = (text?: string | null) => (text ?? '').split(/\n\s*\n/).filter(Boolean)

export async function ClubView({ locale }: { locale: Locale }) {
  const payload = await payloadClient()
  const [p, home] = await Promise.all([
    payload.findGlobal({ slug: 'club-page', locale, depth: 1 }),
    getHomeContent(locale),
  ])

  return (
    <InnerPage
      locale={locale}
      kicker={p.emblems?.kicker ?? ''}
      title={p.emblems?.title ?? ''}
      hero={null}
      cta="supporters"
      bleed
    >
      {/* Emblèmes : grande photo et signification de chaque symbole */}
      <section className="emblems">
        <div className="emblems__text">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="" className="emblems__logo" width={110} height={110} />
          <dl>
            {(p.emblems?.items ?? []).map((item) => (
              <React.Fragment key={item.id}>
                <dt>{item.title}</dt>
                <dd>{item.text}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
        <Img src={p.emblems?.image} alt="" className="emblems__image" sizes="(max-width: 767px) 100vw, 50vw" />
      </section>

      {/* Vision */}
      <section className="vision">
        <div className="container">
          <Heading kicker={p.vision?.kicker ?? ''} title={p.vision?.title ?? ''} light />
          {paragraphs(p.vision?.text).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          {p.vision?.button && (
            <Link className="btn btn--gold" href={href('table', locale)}>
              {p.vision.button}
            </Link>
          )}
        </div>
      </section>

      {/* Charte : 10 articles numérotés sur deux colonnes */}
      <section className="charter">
        <div className="container">
          <Heading kicker={p.charter?.kicker ?? ''} title={p.charter?.title ?? ''} />
          <ol className="charter__card">
            {(p.charter?.items ?? []).map((item, i) => (
              <li key={item.id}>
                <span className="charter__num">{i + 1}</span>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <StorySection c={home} />
    </InnerPage>
  )
}

export async function SongsView({ locale }: { locale: Locale }) {
  const payload = await payloadClient()
  const p = await payload.findGlobal({ slug: 'songs-page', locale, depth: 0 })
  return (
    <InnerPage locale={locale} kicker={p.kicker ?? ''} title={p.title ?? ''} hero={null} cta="supporters" tone="blue">
      {p.intro && <p className="videos-page__intro">{p.intro}</p>}
      <div className="videos-grid">
        {(p.videos ?? []).map((v) => (
          <YouTube key={v.id} id={v.youtubeId} title={v.caption ?? ''} />
        ))}
      </div>
      {p.channelUrl && p.channelLabel && (
        <div className="videos-page__more">
          <a className="btn btn--gold" href={p.channelUrl} target="_blank" rel="noopener noreferrer">
            {p.channelLabel}
          </a>
        </div>
      )}
    </InnerPage>
  )
}

export async function TorahView({ locale }: { locale: Locale }) {
  const payload = await payloadClient()
  const p = await payload.findGlobal({ slug: 'torah-page', locale, depth: 0 })
  return (
    <InnerPage locale={locale} kicker={p.kicker ?? ''} title={p.title ?? ''} hero={null} cta="supporters" tone="blue">
      {p.intro && <p className="videos-page__intro">{p.intro}</p>}
      <div className="videos-grid">
        {(p.videos ?? []).map((v) => (
          <figure key={v.id}>
            <YouTube id={v.youtubeId} title="" />
            {v.caption && <figcaption>{v.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </InnerPage>
  )
}
