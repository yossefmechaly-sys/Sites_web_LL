'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { localeNames, locales, routes, type Locale, type RouteKey } from '@/i18n/config'
import { FlagFr, FlagGb, FlagIl } from './icons'

const FLAGS: Record<Locale, () => React.ReactElement> = { he: FlagIl, fr: FlagFr, en: FlagGb }

// Drapeaux des autres langues ; chacun mène à la même page dans cette langue.
export function LangSwitch({ locale }: { locale: Locale }) {
  const pathname = decodeURI(usePathname() ?? '').replace(/\/$/, '')
  const key = (Object.keys(routes) as RouteKey[]).find((k) => routes[k][locale] === pathname) ?? 'home'
  return (
    <>
      {locales
        .filter((l) => l !== locale)
        .map((l) => {
          const Flag = FLAGS[l]
          return (
            <Link key={l} href={routes[key][l]} hrefLang={l} lang={l} title={localeNames[l]} className="topbar__flag">
              <Flag />
              <span className="sr-only">{localeNames[l]}</span>
            </Link>
          )
        })}
    </>
  )
}
