import type { CollectionConfig } from 'payload'

// Équipes de la ligue. Créées par l'import (nom hébreu) ; le nom français se saisit une fois.
export const Teams: CollectionConfig = {
  slug: 'teams',
  labels: {
    singular: { fr: 'Équipe', he: 'קבוצה' },
    plural: { fr: 'Équipes', he: 'קבוצות' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'shortName', 'isClub', 'ifaId'],
    group: { fr: 'Compétition', he: 'תחרות' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Nom', he: 'שם' },
    },
    {
      name: 'shortName',
      type: 'text',
      localized: true,
      label: { fr: 'Nom court', he: 'שם מקוצר' },
      admin: { description: { fr: 'Pour les tableaux sur mobile (facultatif).', he: 'לטבלאות בנייד (רשות).' } },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Logo', he: 'סמל' },
    },
    {
      name: 'isClub',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'C’est notre club', he: 'זו הקבוצה שלנו' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'ifaId',
      type: 'text',
      unique: true,
      index: true,
      label: { fr: 'ID Fédération', he: 'מזהה התאחדות' },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: { fr: 'Rempli par l’import.', he: 'ממולא ע״י הייבוא.' },
      },
    },
    {
      name: 'wpId',
      type: 'number',
      unique: true,
      index: true,
      label: { fr: 'ID ancien site', he: 'מזהה האתר הישן' },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
