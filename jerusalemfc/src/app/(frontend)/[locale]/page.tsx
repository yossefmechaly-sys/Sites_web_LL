import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Countdown } from '@/components/Countdown'
import { HeroSlider } from '@/components/HeroSlider'
import { CartIcon } from '@/components/icons'
import { CtaSection, GallerySection, NewsletterSection, StorySection } from '@/components/Sections'
import { dateFmt, Heading, seasonLabel, StandingsTable, TeamLogo, timeFmt } from '@/components/ui'
import { YouTube } from '@/components/YouTube'
import { Img } from '@/components/Img'
import { href, isLocale, type Locale } from '@/i18n/config'
import { getDictionary, type Dictionary } from '@/i18n/dictionaries'
import { getHomeContent, mediaUrl, routeKey } from '@/lib/homeContent'
import { getHomeData, type MatchView } from '@/lib/matches'

// Page mise en cache 5 minutes ; vidée dès qu'un contenu change dans l'admin (voir revalidate.ts)
export const revalidate = 300

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  // Textes et images : fiche « Accueil » de l'admin ; matchs et classement : import Fédération
  const [c, data] = await Promise.all([getHomeContent(locale), getHomeData(locale)])
  const slides = (c.hero?.slides ?? []).map((sl) => mediaUrl(sl.image)).filter((u): u is string => Boolean(u))

  return (
    <main>
      {slides.length > 0 && <HeroSlider slides={slides} alt={t.siteName} />}

      {/* Résultats : prochain et dernier match */}
      <section className="section section--grey results">
        <div className="container">
          <Heading
            kicker={c.results?.kicker ?? ''}
            title={c.results?.title || ((data.season ? seasonLabel(data.season.label) : ''))}
          />
          {/* Comme l'original : « prochain match » à gauche, « dernier match » à droite, dans les deux langues */}
          <div className="results__grid">
            {locale === 'he' ? (
              <>
                <LastMatch t={t} locale={locale} match={data.last} league={data.season?.leagueName ?? ''} />
                <NextMatch t={t} locale={locale} match={data.next} />
              </>
            ) : (
              <>
                <NextMatch t={t} locale={locale} match={data.next} />
                <LastMatch t={t} locale={locale} match={data.last} league={data.season?.leagueName ?? ''} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Classement */}
      <section className="standings">
        <div className="container standings__inner">
          <h2 className="standings__title">{t.table.title}</h2>
          <StandingsTable rows={data.standings} t={t} />
        </div>
      </section>

      {/* Coulisses */}
      <section className="section behind">
        <div className="container">
          <div className="behind__head">
            <Heading kicker={c.behind?.kicker ?? ''} title={c.behind?.title ?? ''} />
            {c.behind?.joinLabel && (
              <div className="behind__join">
                <Link className="btn btn--gold" href={href('join', locale)}>
                  {c.behind.joinLabel}
                </Link>
                <span>{c.behind.joinSub}</span>
              </div>
            )}
          </div>
          <div className="cards3">
            {(c.behind?.cards ?? []).map((card) => (
              <Link key={card.id} href={href(routeKey(card.link, 'club'), locale)} className="card">
                <Img src={card.image} alt="" sizes="(max-width: 767px) 100vw, 420px" />
                <h3>{card.title}</h3>
                <p>{card.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Le club en trois colonnes */}
      <StorySection c={c} />

      {/* Appel à l'action sur fond photo fixe */}
      <CtaSection c={c} locale={locale} />

      {/* Boutique */}
      <section className="shop">
        <div className="container shop__inner">
          <div className="shop__text">
            <Heading kicker={c.shop?.kicker ?? ''} title={c.shop?.title ?? ''} />
            <ul>
              {(c.shop?.items ?? []).map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
            <Link className="btn btn--gold btn--lg btn--shop" href={href('shop', locale)}>
              <CartIcon /> {c.shop?.button}
            </Link>
          </div>
          <div className="shop__image">
            <Img src={c.shop?.image} alt="" sizes="(max-width: 767px) 100vw, 740px" />
          </div>
        </div>
      </section>

      {/* Le club */}
      <section className="section club">
        <div className="container">
          <Heading kicker={c.club?.kicker ?? ''} title={c.club?.title ?? ''} />
          <div className="club__panel">
            {(c.club?.cards ?? []).map((card) => (
              <Link key={card.id} href={href(routeKey(card.link, 'club'), locale)} className="club__card">
                <Img src={card.image} alt="" sizes="(max-width: 1024px) 100vw, 620px" />
                <h3>{card.title}</h3>
                {card.text && <p>{card.text}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* L'équipe */}
      <section className="team">
        <div className="container">
          <Heading kicker={c.team?.kicker ?? ''} title={c.team?.title ?? ''} light />
          <div className="team__grid">
            <Link href={href('players', locale)} className="team__item">
              <Img src={c.team?.playersImage} alt="" sizes="426px" />
              <span>{c.team?.playersLabel}</span>
            </Link>
            <Link href={href('staff', locale)} className="team__item">
              <Img src={c.team?.staffImage} alt="" sizes="426px" />
              <span>{c.team?.staffLabel}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Vidéos */}
      <section className="section videos">
        <div className="container">
          <Heading kicker={c.videos?.kicker ?? ''} title={c.videos?.title ?? ''} />
          <div className="cards3">
            {(c.videos?.items ?? []).map((v) => (
              <YouTube key={v.id} id={v.youtubeId} title={v.title} />
            ))}
          </div>
        </div>
      </section>

      {/* Partenaires */}
      <section className="partners">
        <div className="container">
          <h2>{c.partners?.title}</h2>
          <div className="partners__logos">
            {(c.partners?.logos ?? []).map((p) => {
              const w = p.width ?? 120
              const logo = <Img src={p.logo} alt={p.name} sizes={`${w}px`} style={{ width: w, height: 'auto' }} />
              return p.url ? (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.name}>
                  {logo}
                </a>
              ) : (
                <React.Fragment key={p.id}>{logo}</React.Fragment>
              )
            })}
          </div>
        </div>
      </section>

      <NewsletterSection c={c} t={t} locale={locale} />

      <GallerySection c={c} />
    </main>
  )
}

function NextMatch({ t, locale, match }: { t: Dictionary; locale: Locale; match: MatchView | null }) {
  return (
    <article className="match-card">
      <h3 className="match-card__title">{t.results.nextMatch}</h3>
      {match ? (
        <>
          <p className="match-card__teams">
            {match.home.name} {t.results.vs} {match.away.name}
          </p>
          <div className="match-card__logos">
            <TeamLogo team={match.home} size={190} />
            <TeamLogo team={match.away} size={190} />
          </div>
          <p className="match-card__meta">
            {dateFmt(match.kickoff)} · {match.timeTbd ? t.results.timeTbd : timeFmt(match.kickoff)}
          </p>
          <Countdown target={match.kickoff} labels={t.results.countdown} />
        </>
      ) : (
        <p className="match-card__teams">{t.results.noMatch}</p>
      )}
    </article>
  )
}

function LastMatch({
  t,
  locale,
  match,
  league,
}: {
  t: Dictionary
  locale: Locale
  match: MatchView | null
  league: string
}) {
  return (
    <article className="match-card">
      <h3 className="match-card__title">{t.results.lastMatch}</h3>
      {match && (
        <div className="last">
          <TeamLogo team={match.home} size={80} />
          <div className="last__center">
            <span className="last__date">{dateFmt(match.kickoff)}</span>
            <span className="last__score" dir="ltr">
              {/* Score dans le sens de lecture des logos : domicile du côté du logo domicile */}
              {locale === 'he' ? `${match.awayScore} - ${match.homeScore}` : `${match.homeScore} - ${match.awayScore}`}
            </span>
            <span className="last__league">{league}</span>
          </div>
          <TeamLogo team={match.away} size={80} />
        </div>
      )}
      <Link className="btn btn--gradient btn--block" href={href('matches', locale)}>
        {t.results.allMatches}
      </Link>
    </article>
  )
}
