import type { Field, GlobalConfig } from 'payload'

// Contenu des pages « Le club », « Chants » et « Torah & foot », modifiable dans l'admin.

const group = { fr: 'Pages', he: 'עמודים' }
const text = (name: string, fr: string, he: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: 'text', localized: true, label: { fr, he }, ...extra }) as Field
const heading = (): Field[] => [text('kicker', 'Sur-titre (manuscrit doré)', 'כותרת עליונה'), text('title', 'Titre', 'כותרת')]
const videos = (withCaption: boolean): Field => ({
  name: 'videos',
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
    {
      name: 'caption',
      type: 'text',
      label: withCaption ? { fr: 'Légende', he: 'כיתוב' } : { fr: 'Titre (facultatif)', he: 'כותרת (רשות)' },
    },
  ],
})

export const ClubPage: GlobalConfig = {
  slug: 'club-page',
  label: { fr: 'Le club', he: 'המועדון' },
  admin: { group },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'emblems',
          label: { fr: 'Emblèmes', he: 'הסמלים' },
          fields: [
            ...heading(),
            { name: 'image', type: 'upload', relationTo: 'media', label: { fr: 'Grande photo', he: 'תמונה' } },
            {
              name: 'items',
              type: 'array',
              localized: true,
              label: { fr: 'Symboles', he: 'סמלים' },
              fields: [
                { name: 'title', type: 'text', required: true, label: { fr: 'Symbole', he: 'סמל' } },
                { name: 'text', type: 'textarea', label: { fr: 'Signification', he: 'משמעות' } },
              ],
            },
          ],
        },
        {
          name: 'vision',
          label: { fr: 'Vision', he: 'החזון' },
          fields: [
            ...heading(),
            {
              name: 'text',
              type: 'textarea',
              localized: true,
              label: { fr: 'Texte (un paragraphe par ligne vide)', he: 'טקסט' },
            },
            text('button', 'Bouton (vers le classement)', 'כפתור'),
          ],
        },
        {
          name: 'charter',
          label: { fr: 'Charte', he: 'האמנה' },
          fields: [
            ...heading(),
            {
              name: 'items',
              type: 'array',
              localized: true,
              label: { fr: 'Articles (numérotés dans l’ordre)', he: 'סעיפים' },
              fields: [{ name: 'text', type: 'textarea', required: true, label: { fr: 'Texte', he: 'טקסט' } }],
            },
          ],
        },
      ],
    },
  ],
}

export const SongsPage: GlobalConfig = {
  slug: 'songs-page',
  label: { fr: 'Chants', he: 'שירי הקבוצה' },
  admin: { group },
  access: { read: () => true },
  fields: [
    ...heading(),
    { name: 'intro', type: 'textarea', localized: true, label: { fr: 'Introduction', he: 'פתיח' } },
    videos(false),
    text('channelLabel', 'Bouton chaîne YouTube', 'כפתור ערוץ יוטיוב'),
    { name: 'channelUrl', type: 'text', label: { fr: 'Adresse de la chaîne YouTube', he: 'כתובת הערוץ' } },
  ],
}

export const TorahPage: GlobalConfig = {
  slug: 'torah-page',
  label: { fr: 'Torah & foot', he: 'תורה וכדורגל' },
  admin: { group },
  access: { read: () => true },
  fields: [
    ...heading(),
    { name: 'intro', type: 'textarea', localized: true, label: { fr: 'Introduction', he: 'פתיח' } },
    videos(true),
  ],
}
