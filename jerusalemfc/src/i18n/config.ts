export const locales = ['he', 'fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'he'

// Nom de chaque langue dans sa propre langue (sélecteur de langue)
export const localeNames: Record<'he' | 'fr' | 'en', string> = { he: 'עברית', fr: 'Français', en: 'English' }

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value)

export const dir = (locale: Locale) => (locale === 'he' ? 'rtl' : 'ltr')

// Adresses des pages, reprises de l'ancien site pour garder le référencement.
export const routes = {
  home: { he: '/he', fr: '/fr', en: '/en' },
  club: { he: '/he/המועדון', fr: '/fr/le-club', en: '/en/the-club' },
  songs: { he: '/he/שירי-הקבוצה', fr: '/fr/chants-slogans', en: '/en/songs' },
  torah: { he: '/he/תורה-וכדורגל', fr: '/fr/torah-foot', en: '/en/torah-and-football' },
  matches: { he: '/he/רשימת-המשחקים', fr: '/fr/matchs', en: '/en/matches' },
  table: { he: '/he/הטבלה', fr: '/fr/classement', en: '/en/standings' },
  schedule: { he: '/he/לוז-המשחקים', fr: '/fr/calendrier', en: '/en/fixtures' },
  players: { he: '/he/הקבוצה-שלנו', fr: '/fr/equipe', en: '/en/players' },
  staff: { he: '/he/הסגל', fr: '/fr/staff', en: '/en/staff' },
  shop: { he: '/he/הזמנות', fr: '/fr/precommande', en: '/en/shop' },
  join: { he: '/he/הצטרפות', fr: '/fr/adhesion', en: '/en/membership' },
  legal: { he: '/he/מידע-משפטי', fr: '/fr/mentions-legales', en: '/en/legal-notice' },
} satisfies Record<string, Record<Locale, string>>

export type RouteKey = keyof typeof routes
export const href = (key: RouteKey, locale: Locale) => routes[key][locale]
