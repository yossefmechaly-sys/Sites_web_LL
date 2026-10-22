import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from '@payloadcms/translations/languages/fr'
import { he } from '@payloadcms/translations/languages/he'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Teams } from './collections/Teams'
import { Seasons } from './collections/Seasons'
import { Matches } from './collections/Matches'
import { Subscribers } from './collections/Subscribers'
import { Players } from './collections/Players'
import { Staff } from './collections/Staff'
import { Members, PreOrders, Products } from './collections/Shop'
import { Home } from './globals/Home'
import { ClubPage, SongsPage, TorahPage } from './globals/ClubPages'
import { LegalPage } from './globals/LegalPage'
import { withGlobalRevalidation, withRevalidation } from './lib/revalidate'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    timezones: {
      supportedTimezones: [{ label: 'Jérusalem', value: 'Asia/Jerusalem' }],
      defaultTimezone: 'Asia/Jerusalem',
    },
  },
  // Langue de l'interface d'admin (choix par utilisateur)
  i18n: {
    supportedLanguages: { fr, he },
    fallbackLanguage: 'fr',
  },
  // Langues du contenu du site : hébreu par défaut, français
  localization: {
    locales: [
      { code: 'he', label: 'עברית', rtl: true },
      { code: 'fr', label: 'Français' },
      // Contenu anglais manquant : affiché en français (plus proche que l'hébreu pour un lecteur anglophone)
      { code: 'en', label: 'English', fallbackLocale: 'fr' },
    ],
    defaultLocale: 'he',
    fallback: true,
  },
  // Toute modification vide le cache des pages publiques (voir lib/revalidate.ts)
  collections: [Matches, Teams, Seasons, Players, Staff, Products, PreOrders, Members, Subscribers, Media, Users].map(
    withRevalidation,
  ),
  globals: [Home, ClubPage, SongsPage, TorahPage, LegalPage].map(withGlobalRevalidation),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
