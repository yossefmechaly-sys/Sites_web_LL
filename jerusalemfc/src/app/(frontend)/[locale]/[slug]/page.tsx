import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { isLocale, locales, routes, type Locale, type RouteKey } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { ClubView, SongsView, TorahView } from '@/views/ClubViews'
import { MatchesView } from '@/views/MatchesView'
import { PlayersView } from '@/views/PlayersView'
import { ScheduleView } from '@/views/ScheduleView'
import { LegalView } from '@/views/LegalView'
import { JoinView, ShopView } from '@/views/ShopViews'
import { StaffView } from '@/views/StaffView'
import { TableView } from '@/views/TableView'

// Pages mises en cache 5 minutes ; vidées dès qu'un contenu change dans l'admin (voir revalidate.ts)
export const revalidate = 300

// Une seule route pour toutes les pages intérieures : l'adresse (en hébreu ou en français,
// reprise de l'ancien site) est retrouvée dans la table des routes.
const VIEWS: Partial<Record<RouteKey, (p: { locale: Locale }) => Promise<React.ReactElement>>> = {
  matches: MatchesView,
  table: TableView,
  schedule: ScheduleView,
  players: PlayersView,
  staff: StaffView,
  club: ClubView,
  songs: SongsView,
  torah: TorahView,
  shop: ShopView,
  join: JoinView,
  legal: LegalView,
}

// Toutes les pages connues sont prégénérées au build, puis régénérées en arrière-plan
export const generateStaticParams = () =>
  (Object.keys(VIEWS) as RouteKey[]).flatMap((key) =>
    locales.map((locale) => ({ locale, slug: routes[key][locale].split('/').slice(2).join('/') })),
  )

function resolve(locale: string, slug: string): { locale: Locale; key: RouteKey } | null {
  if (!isLocale(locale)) return null
  const path = `/${locale}/${decodeURIComponent(slug)}`
  const key = (Object.keys(routes) as RouteKey[]).find((k) => routes[k][locale] === path)
  return key ? { locale, key } : null
}

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const r = resolve(locale, slug)
  if (!r) return {}
  const t = getDictionary(r.locale)
  const page = t.pages[r.key as keyof typeof t.pages]
  return {
    title: page ? `${page.title} – ${t.siteName}` : t.siteName,
    alternates: {
      canonical: routes[r.key][r.locale],
      languages: { he: routes[r.key].he, fr: routes[r.key].fr, en: routes[r.key].en, 'x-default': routes[r.key].he },
    },
  }
}

export default async function InnerRoute({ params }: Props) {
  const { locale, slug } = await params
  const r = resolve(locale, slug)
  const View = r && VIEWS[r.key]
  if (!r || !View) notFound()
  return <View locale={r.locale} />
}
