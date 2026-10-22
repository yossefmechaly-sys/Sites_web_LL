import Link from 'next/link'
import React from 'react'

import { href, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { NavLink } from './NavLink'
import { ChevronDown, FacebookIcon, InstagramIcon, MailIcon } from './icons'
import { LangSwitch } from './LangSwitch'

export const SOCIAL = {
  facebook: 'https://www.facebook.com/JerusalemFootballClub',
  instagram: 'https://www.instagram.com/f.c._jerusalem/',
}

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)

  const menu = [
    { label: t.nav.home, to: href('home', locale) },
    {
      label: t.nav.club,
      children: [
        { label: t.nav.vision, to: href('club', locale) },
        { label: t.nav.songs, to: href('songs', locale) },
        { label: t.nav.torah, to: href('torah', locale) },
      ],
    },
    { label: t.nav.matches, to: href('matches', locale) },
    { label: t.nav.table, to: href('table', locale) },
    { label: t.nav.schedule, to: href('schedule', locale) },
    {
      label: t.nav.team,
      children: [
        { label: t.nav.players, to: href('players', locale) },
        { label: t.nav.staff, to: href('staff', locale) },
      ],
    },
    { label: t.nav.shop, to: href('shop', locale) },
  ]

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar__inner">
          <a className="topbar__mail" href={`mailto:${t.email}`}>
            <MailIcon /> {t.email}
          </a>
          <div className="topbar__social">
            <LangSwitch locale={locale} />
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>

      <Link href={href('home', locale)} className="site-logo" aria-label={t.siteName}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-header.svg" alt={t.siteName} width={175} height={175} />
      </Link>

      <nav className="mainnav" aria-label="Menu">
        {/* Menu mobile sans JavaScript : <details> */}
        <details className="mainnav__mobile">
          <summary aria-label="Menu">
            <span />
            <span />
            <span />
          </summary>
          <MenuList menu={menu} />
        </details>
        <MenuList menu={menu} className="mainnav__desktop" />
      </nav>
    </header>
  )
}

type Item = { label: string; to?: string; children?: { label: string; to: string }[] }

function MenuList({ menu, className }: { menu: Item[]; className?: string }) {
  return (
    <ul className={`mainnav__list ${className ?? ''}`}>
      {menu.map((item) =>
        item.children ? (
          <li key={item.label} className="has-sub">
            <span className="mainnav__link" tabIndex={0}>
              {item.label} <ChevronDown />
            </span>
            <ul className="mainnav__sub">
              {item.children.map((c) => (
                <li key={c.to}>
                  <NavLink href={c.to}>{c.label}</NavLink>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li key={item.label}>
            <NavLink className="mainnav__link" href={item.to!}>
              {item.label}
            </NavLink>
          </li>
        ),
      )}
    </ul>
  )
}
