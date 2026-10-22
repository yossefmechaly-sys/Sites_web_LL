import React from 'react'

import { href, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { CookieSettingsLink } from './CookieConsent'
import { SOCIAL } from './Header'
import { FacebookIcon, InstagramIcon } from './icons'

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  return (
    <footer className="site-footer">
      <div className="site-footer__social">
        <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <FacebookIcon />
        </a>
        <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <InstagramIcon />
        </a>
      </div>
      <p className="site-footer__copy">
        {t.footer.rights} - {new Date().getFullYear()} - <a href={`mailto:${t.email}`}>{t.footer.contact}</a>
      </p>
      <p className="site-footer__links">
        <a href={href('legal', locale)}>{t.footer.legal}</a>
        <CookieSettingsLink label={t.footer.cookies} />
        <span>
          {t.footer.credit}{' '}
          <a href="https://tobeweb.eu/" target="_blank" rel="noopener">
            Tobeweb
          </a>
        </span>
      </p>
    </footer>
  )
}
