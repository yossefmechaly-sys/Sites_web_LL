import type { MetadataRoute } from 'next'

import { locales, routes, type RouteKey } from '@/i18n/config'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jerusalemfc.co.il'

// Plan du site : toutes les pages dans les trois langues, avec leurs équivalents (hreflang)
export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(routes) as RouteKey[]).flatMap((key) =>
    locales.map((locale) => ({
      url: SITE + encodeURI(routes[key][locale]),
      changeFrequency: ['home', 'matches', 'table', 'schedule'].includes(key) ? ('daily' as const) : ('monthly' as const),
      priority: key === 'home' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, SITE + encodeURI(routes[key][l])])),
      },
    })),
  )
}
