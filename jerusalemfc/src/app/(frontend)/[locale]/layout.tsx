import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'
import React from 'react'

import { CookieConsent } from '@/components/CookieConsent'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { dir, href, isLocale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import './site.css'

// Polices de l'ancien thème. Aucune n'a de glyphes hébreux : comme sur l'ancien site,
// l'hébreu s'affiche dans la police de repli (Arial). Hébergées localement (paquets @fontsource ;
// next/font exige des chemins littéraux). Pas de police de repli « ajustée » : elle réduirait
// l'hébreu, qui s'affiche justement dans la police de repli.
const poppins = localFont({
  src: [
    { path: '../../../../node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2', weight: '400' },
    { path: '../../../../node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2', weight: '500' },
    { path: '../../../../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2', weight: '600' },
    { path: '../../../../node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-body',
  adjustFontFallback: false,
})
const bebas = localFont({
  src: '../../../../node_modules/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2',
  variable: '--font-display',
  adjustFontFallback: false,
})
const euphoria = localFont({
  src: '../../../../node_modules/@fontsource/euphoria-script/files/euphoria-script-latin-400-normal.woff2',
  variable: '--font-script',
  adjustFontFallback: false,
})

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jerusalemfc.co.il'),
    title: `${t.siteName} – ${t.siteDescription}`,
    description: t.siteDescription,
    alternates: { canonical: `/${locale}`, languages: { he: '/he', fr: '/fr', en: '/en', 'x-default': '/he' } },
    icons: { icon: '/images/logo.svg' },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html lang={locale} dir={dir(locale)} className={`${poppins.variable} ${bebas.variable} ${euphoria.variable}`}>
      <body>
        <Header locale={locale} />
        {children}
        <Footer locale={locale} />
        <CookieConsent
          gaId={process.env.NEXT_PUBLIC_GA_ID}
          labels={getDictionary(locale).cookies}
          legalHref={href('legal', locale)}
        />
      </body>
    </html>
  )
}
