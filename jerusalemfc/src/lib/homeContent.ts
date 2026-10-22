import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Locale, RouteKey } from '@/i18n/config'
import type { Home, Media } from '@/payload-types'

// URL d'une image de la médiathèque (relation chargée avec depth >= 1)
export const mediaUrl = (m: number | Media | null | undefined): string | null =>
  m && typeof m === 'object' ? (m.url ?? null) : null

export const routeKey = (value: string | null | undefined, fallback: RouteKey): RouteKey =>
  (value as RouteKey | null | undefined) ?? fallback

export async function getHomeContent(locale: Locale): Promise<Home> {
  const payload = await getPayload({ config: await config })
  return payload.findGlobal({ slug: 'home', locale, depth: 1 })
}
