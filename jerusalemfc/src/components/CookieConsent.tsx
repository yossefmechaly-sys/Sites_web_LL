'use client'

import Link from 'next/link'
import Script from 'next/script'
import React, { useEffect, useState } from 'react'

// Bandeau cookies + Google Analytics 4 chargé uniquement après accord.
// Le choix est conservé 6 mois (cookie « jfc_consent »), puis redemandé.
// Le lien « Cookies » du pied de page rouvre le bandeau (événement « jfc:cookies »).

const COOKIE = 'jfc_consent'
const MAX_AGE = 60 * 60 * 24 * 182

type Choice = 'granted' | 'denied'
type Labels = { text: string; accept: string; refuse: string; more: string }

function readChoice(): Choice | null {
  const m = document.cookie.match(/(?:^|; )jfc_consent=(granted|denied)/)
  return (m?.[1] as Choice) ?? null
}

export function openCookieSettings() {
  window.dispatchEvent(new Event('jfc:cookies'))
}

export function CookieConsent({ gaId, labels, legalHref }: { gaId?: string; labels: Labels; legalHref: string }) {
  const [choice, setChoice] = useState<Choice | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const current = readChoice()
    setChoice(current)
    setOpen(current === null)
    const reopen = () => setOpen(true)
    window.addEventListener('jfc:cookies', reopen)
    return () => window.removeEventListener('jfc:cookies', reopen)
  }, [])

  const decide = (value: Choice) => {
    document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    // Retrait du consentement : on efface les cookies Analytics déjà posés
    if (value === 'denied' && choice === 'granted') {
      const domain = location.hostname.replace(/^www\./, '')
      for (const name of document.cookie.split('; ').map((c) => c.split('=')[0]))
        if (name.startsWith('_ga'))
          for (const d of ['', `; Domain=${domain}`, `; Domain=.${domain}`])
            document.cookie = `${name}=; Max-Age=0; Path=/${d}`
      location.reload()
      return
    }
    setChoice(value)
    setOpen(false)
  }

  return (
    <>
      {gaId && choice === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{cookie_expires:34128000});`}
          </Script>
        </>
      )}
      {open && (
        <div className="cookies" role="dialog" aria-live="polite" aria-label="Cookies">
          <p>
            {labels.text} <Link href={legalHref}>{labels.more}</Link>
          </p>
          <div className="cookies__actions">
            <button type="button" className="btn cookies__refuse" onClick={() => decide('denied')}>
              {labels.refuse}
            </button>
            <button type="button" className="btn btn--gold" onClick={() => decide('granted')}>
              {labels.accept}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Lien du pied de page pour revenir sur son choix
export function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button type="button" className="site-footer__link" onClick={openCookieSettings}>
      {label}
    </button>
  )
}
