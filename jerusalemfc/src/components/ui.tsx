import React from 'react'
import { optimizedSrc, optimizedSrcSet } from './Img'

import type { Dictionary } from '@/i18n/dictionaries'
import type { StandingView, TeamView } from '@/lib/matches'

// Éléments d'interface partagés entre les pages.

export const dateFmt = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(iso),
  )

export const timeFmt = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

// « 2026/27 » → « 2026/2027 »
export const seasonLabel = (label: string) => label.replace(/\/(\d{2})$/, '/20$1')

export function TeamLogo({ team, size }: { team: TeamView; size: number }) {
  const src = team.isClub ? '/images/logo.svg' : team.logo
  if (!src) return <TeamAvatar name={team.name} size={size} />
  // Balise simple (pas de composant client) : les listes de matchs affichent des centaines de logos
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="team-logo"
      src={optimizedSrc(src, size)}
      srcSet={optimizedSrcSet(src, size)}
      alt={team.name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  )
}

// Préfixes de noms de clubs ignorés pour les initiales (« הפועל אזור » → « א »)
const PREFIXES = new Set(
  [
    'הפועל', "הפ'", 'הפ', 'מכבי', 'ביתר', 'בית"ר', 'בית״ר', 'עירוני', 'מ.כ.', 'מכ', 'מ.ס.', 'א.ס.', 'ש.',
    'fc', 'f.c.', 'ms', 'as', 'm.c.', 'hapoel', 'maccabi', 'beitar', 'ironi', 'shimshon', 'bne', 'bné',
  ].map((p) => p.toLowerCase()),
)
const AVATAR_COLORS = ['#19276f', '#3446cb', '#0f6fb5', '#2b3a8f', '#5a4fcf', '#1d7a8c', '#7a5c1d', '#8c2b3a']

// Avatar des clubs sans logo : écusson aux initiales, couleur stable dérivée du nom
export function TeamAvatar({ name, size }: { name: string; size: number }) {
  const words = name.split(/\s+/).filter((w) => w && !PREFIXES.has(w.toLowerCase()) && !/\d/.test(w))
  const initials = (words.length ? words : name.split(/\s+/))
    .slice(0, 2)
    .map((w) => w.replace(/^["'״׳.]+/, '').charAt(0))
    .join('')
    .toUpperCase()
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length]
  return (
    <svg className="team-logo team-avatar" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={name}>
      <path d="M50 4 88 18v32c0 24-16 40-38 46C28 90 12 74 12 50V18Z" fill={color} />
      <path d="M50 12 80 23v27c0 19-12 32-30 37-18-5-30-18-30-37V23Z" fill="none" stroke="#c49c48" strokeWidth="3" />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize={initials.length > 1 ? 30 : 38}
      >
        {initials}
      </text>
    </svg>
  )
}

export function Heading({ kicker, title, light }: { kicker: string; title: string; light?: boolean }) {
  return (
    <div className={`heading ${light ? 'heading--light' : ''}`}>
      <span className="heading__kicker">{kicker}</span>
      <h2 className="heading__title">{title}</h2>
    </div>
  )
}

// Tableau de classement : variante « dark » (accueil, fond bleu) ou « light » (page classement)
export function StandingsTable({
  rows,
  t,
  variant = 'dark',
}: {
  rows: StandingView[]
  t: Dictionary
  variant?: 'dark' | 'light'
}) {
  const c = t.table.cols
  return (
    <div className="standings__scroll">
      <table className={`standings__table standings__table--${variant}`}>
        <thead>
          <tr>
            <th>{c.pos}</th>
            <th className="standings__club">{c.club}</th>
            <th>{c.p}</th>
            <th>{c.w}</th>
            <th>{c.d}</th>
            <th>{c.l}</th>
            <th>{c.f}</th>
            <th>{c.a}</th>
            <th>{c.gd}</th>
            <th>{c.pts}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.team.id} className={r.team.isClub ? 'is-club' : undefined}>
              <td>{r.position}</td>
              <td className="standings__club">
                <TeamLogo team={r.team} size={26} />
                {r.team.name}
              </td>
              <td>{r.played}</td>
              <td>{r.won}</td>
              <td>{r.drawn}</td>
              <td>{r.lost}</td>
              <td>{r.gf}</td>
              <td>{r.ga}</td>
              <td dir="ltr">{r.gd > 0 && variant === 'light' ? `+${r.gd}` : r.gd}</td>
              <td>{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

