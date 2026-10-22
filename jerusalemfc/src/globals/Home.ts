import type { Field, GlobalConfig } from 'payload'

import { routes } from '../i18n/config'

// Contenu de la page d'accueil, modifiable dans l'admin (un onglet par section).
// Les listes sont propres à chaque langue : l'ordre et le nombre d'éléments peuvent différer.

const linkOptions = Object.keys(routes).map((key) => ({ label: key, value: key }))

const text = (name: string, fr: string, he: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: 'text', localized: true, label: { fr, he }, ...extra }) as Field

const image = (name: string, fr: string, he: string): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  label: { fr, he },
})

const heading = (): Field[] => [
  text('kicker', 'Sur-titre (manuscrit doré)', 'כותרת עליונה'),
  text('title', 'Titre', 'כותרת'),
]

export const Home: GlobalConfig = {
  slug: 'home',
  label: { fr: 'Accueil', he: 'דף הבית' },
  admin: { group: { fr: 'Pages', he: 'עמודים' } },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Bandeau', he: 'באנר' },
          name: 'hero',
          fields: [
            {
              name: 'slides',
              type: 'array',
              label: { fr: 'Photos du diaporama', he: 'תמונות' },
              minRows: 1,
              fields: [image('image', 'Photo', 'תמונה')],
            },
          ],
        },
        {
          label: { fr: 'Résultats', he: 'תוצאות' },
          name: 'results',
          fields: [
            text('kicker', 'Sur-titre', 'כותרת עליונה'),
            text('title', 'Titre', 'כותרת', {
              admin: {
                description: {
                  fr: 'Laisser vide pour afficher la saison (ex. 2026/2027).',
                  he: 'השאירו ריק כדי להציג את העונה.',
                },
              },
            }),
          ],
        },
        {
          label: { fr: 'Coulisses', he: 'מאחורי הקלעים' },
          name: 'behind',
          fields: [
            ...heading(),
            text('joinLabel', 'Bouton « devenir supporter »', 'כפתור הצטרפות'),
            text('joinSub', 'Texte sous le bouton', 'טקסט מתחת לכפתור'),
            {
              name: 'cards',
              type: 'array',
              localized: true,
              label: { fr: 'Cartes', he: 'כרטיסים' },
              fields: [
                { name: 'title', type: 'text', required: true, label: { fr: 'Titre', he: 'כותרת' } },
                { name: 'sub', type: 'text', label: { fr: 'Sous-titre', he: 'כותרת משנה' } },
                image('image', 'Image', 'תמונה'),
                { name: 'link', type: 'select', options: linkOptions, label: { fr: 'Lien vers', he: 'קישור' } },
              ],
            },
          ],
        },
        {
          label: { fr: 'Histoire', he: 'הקבוצה' },
          name: 'story',
          fields: [
            text('title', 'Titre', 'כותרת'),
            {
              name: 'columns',
              type: 'array',
              localized: true,
              maxRows: 3,
              label: { fr: 'Colonnes (ballon, coupe, stade)', he: 'עמודות' },
              fields: [{ name: 'text', type: 'textarea', required: true, label: { fr: 'Texte', he: 'טקסט' } }],
            },
          ],
        },
        {
          label: { fr: 'Appel à l’action', he: 'קריאה לפעולה' },
          name: 'cta',
          fields: [
            text('title', 'Titre', 'כותרת'),
            text('button', 'Bouton', 'כפתור'),
            image('background', 'Photo de fond', 'תמונת רקע'),
          ],
        },
        {
          label: { fr: 'Boutique', he: 'החנות' },
          name: 'shop',
          fields: [
            ...heading(),
            {
              name: 'items',
              type: 'array',
              localized: true,
              label: { fr: 'Points forts', he: 'נקודות' },
              fields: [{ name: 'text', type: 'text', required: true, label: { fr: 'Texte', he: 'טקסט' } }],
            },
            text('button', 'Bouton', 'כפתור'),
            image('image', 'Image', 'תמונה'),
          ],
        },
        {
          label: { fr: 'Le club', he: 'המועדון' },
          name: 'club',
          fields: [
            ...heading(),
            {
              name: 'cards',
              type: 'array',
              localized: true,
              label: { fr: 'Cartes', he: 'כרטיסים' },
              fields: [
                { name: 'title', type: 'text', required: true, label: { fr: 'Titre', he: 'כותרת' } },
                { name: 'text', type: 'textarea', label: { fr: 'Texte', he: 'טקסט' } },
                image('image', 'Image', 'תמונה'),
                { name: 'link', type: 'select', options: linkOptions, label: { fr: 'Lien vers', he: 'קישור' } },
              ],
            },
          ],
        },
        {
          label: { fr: 'L’équipe', he: 'הקבוצה' },
          name: 'team',
          fields: [
            ...heading(),
            text('playersLabel', 'Libellé « joueurs »', 'שחקנים'),
            image('playersImage', 'Photo joueurs', 'תמונת שחקנים'),
            text('staffLabel', 'Libellé « staff »', 'סגל'),
            image('staffImage', 'Photo staff', 'תמונת סגל'),
          ],
        },
        {
          label: { fr: 'Vidéos', he: 'סרטונים' },
          name: 'videos',
          fields: [
            ...heading(),
            {
              name: 'items',
              type: 'array',
              localized: true,
              label: { fr: 'Vidéos YouTube', he: 'סרטוני יוטיוב' },
              fields: [
                {
                  name: 'youtubeId',
                  type: 'text',
                  required: true,
                  label: { fr: 'ID YouTube', he: 'מזהה יוטיוב' },
                  admin: { description: { fr: 'Ex. aaiHSJduqCM dans youtu.be/aaiHSJduqCM', he: 'לדוגמה aaiHSJduqCM' } },
                },
                { name: 'title', type: 'text', required: true, label: { fr: 'Titre', he: 'כותרת' } },
              ],
            },
          ],
        },
        {
          label: { fr: 'Partenaires', he: 'שותפים' },
          name: 'partners',
          fields: [
            text('title', 'Titre', 'כותרת'),
            {
              name: 'logos',
              type: 'array',
              label: { fr: 'Logos', he: 'סמלים' },
              fields: [
                { name: 'name', type: 'text', required: true, label: { fr: 'Nom', he: 'שם' } },
                { ...image('logo', 'Logo', 'סמל'), required: true } as Field,
                {
                  name: 'width',
                  type: 'number',
                  defaultValue: 120,
                  label: { fr: 'Largeur affichée (px)', he: 'רוחב (פיקסלים)' },
                },
                { name: 'url', type: 'text', label: { fr: 'Site du partenaire', he: 'אתר' } },
              ],
            },
          ],
        },
        {
          label: { fr: 'Newsletter', he: 'ניוזלטר' },
          name: 'newsletter',
          fields: [
            text('title', 'Titre', 'כותרת'),
            text('sub', 'Texte', 'טקסט'),
            text('button', 'Bouton', 'כפתור'),
            text('success', 'Message de confirmation', 'הודעת אישור'),
          ],
        },
        {
          label: { fr: 'Galerie', he: 'גלריה' },
          name: 'gallery',
          fields: [
            {
              name: 'images',
              type: 'array',
              label: { fr: 'Photos (liées à Instagram)', he: 'תמונות' },
              fields: [image('image', 'Photo', 'תמונה')],
            },
          ],
        },
      ],
    },
  ],
}
