import type { CollectionConfig } from 'payload'

// Une saison d'une ligue, avec ses identifiants à la Fédération (football.org.il).
export const Seasons: CollectionConfig = {
  slug: 'seasons',
  labels: {
    singular: { fr: 'Saison', he: 'עונה' },
    plural: { fr: 'Saisons', he: 'עונות' },
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'leagueName', 'isCurrent', 'autoImport', 'lastImportAt'],
    group: { fr: 'Compétition', he: 'תחרות' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: { fr: 'Saison', he: 'עונה' },
      admin: { placeholder: '2026/27' },
    },
    {
      name: 'leagueName',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Ligue', he: 'ליגה' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ifaLeagueId',
          type: 'number',
          label: { fr: 'ID ligue (Fédération)', he: 'מזהה ליגה' },
        },
        {
          name: 'ifaSeasonId',
          type: 'number',
          label: { fr: 'ID saison (Fédération)', he: 'מזהה עונה' },
        },
      ],
    },
    {
      name: 'standings',
      type: 'array',
      label: { fr: 'Classement publié', he: 'טבלה מפורסמת' },
      admin: {
        description: {
          fr: 'Facultatif. S’il est rempli, il remplace le classement calculé à partir des matchs (utile quand seuls les matchs du club sont connus).',
          he: 'רשות. אם מולא, מחליף את הטבלה המחושבת מהמשחקים.',
        },
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'position', type: 'number', required: true, label: { fr: 'Pos', he: 'מקום' }, admin: { width: '10%' } },
            {
              name: 'team',
              type: 'relationship',
              relationTo: 'teams',
              required: true,
              label: { fr: 'Équipe', he: 'קבוצה' },
              admin: { width: '30%' },
            },
            { name: 'played', type: 'number', label: { fr: 'J', he: 'מש׳' }, admin: { width: '8%' } },
            { name: 'won', type: 'number', label: { fr: 'G', he: 'נ' }, admin: { width: '8%' } },
            { name: 'drawn', type: 'number', label: { fr: 'N', he: 'ת' }, admin: { width: '8%' } },
            { name: 'lost', type: 'number', label: { fr: 'P', he: 'ה' }, admin: { width: '8%' } },
            { name: 'gf', type: 'number', label: { fr: 'BP', he: 'זכות' }, admin: { width: '8%' } },
            { name: 'ga', type: 'number', label: { fr: 'BC', he: 'חובה' }, admin: { width: '8%' } },
            { name: 'points', type: 'number', label: { fr: 'Pts', he: 'נק׳' }, admin: { width: '8%' } },
          ],
        },
      ],
    },
    {
      name: 'wpKey',
      type: 'text',
      unique: true,
      index: true,
      label: { fr: 'Clé ancien site', he: 'מפתח האתר הישן' },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: { fr: 'Saison reprise de l’ancien site (saison-ligue).', he: 'עונה מהאתר הישן.' },
      },
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Saison en cours (affichée sur le site)', he: 'העונה הנוכחית' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'autoImport',
      type: 'checkbox',
      defaultValue: true,
      label: { fr: 'Import automatique actif', he: 'ייבוא אוטומטי פעיל' },
      admin: {
        position: 'sidebar',
        description: { fr: 'Nécessite les ID Fédération.', he: 'דורש את מזהי ההתאחדות.' },
      },
    },
    {
      name: 'lastImportAt',
      type: 'date',
      label: { fr: 'Dernier import', he: 'ייבוא אחרון' },
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'lastImportReport',
      type: 'textarea',
      label: { fr: 'Rapport du dernier import', he: 'דוח ייבוא אחרון' },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
