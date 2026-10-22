import type { CollectionConfig } from 'payload'

export const POSITIONS = [
  { value: 'attacker', label: { fr: 'Attaquant', he: 'חלוץ' } },
  { value: 'midfielder', label: { fr: 'Milieu de terrain', he: 'קשר' } },
  { value: 'defender', label: { fr: 'Défenseur', he: 'מגן' } },
  { value: 'goalkeeper', label: { fr: 'Gardien', he: 'שוער' } },
]

// Effectif du club, affiché par poste sur la page « joueurs ».
export const Players: CollectionConfig = {
  slug: 'players',
  labels: {
    singular: { fr: 'Joueur', he: 'שחקן' },
    plural: { fr: 'Joueurs', he: 'שחקנים' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'number', 'position', 'active'],
    group: { fr: 'Équipe', he: 'הקבוצה' },
  },
  access: { read: () => true },
  defaultSort: 'number',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: { fr: 'Nom', he: 'שם' } },
    {
      type: 'row',
      fields: [
        { name: 'number', type: 'number', min: 0, max: 99, label: { fr: 'Numéro', he: 'מספר' } },
        {
          name: 'position',
          type: 'select',
          required: true,
          options: POSITIONS,
          label: { fr: 'Poste', he: 'עמדה' },
        },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media', label: { fr: 'Photo', he: 'תמונה' } },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: { fr: 'Dans l’effectif actuel (affiché sur le site)', he: 'בסגל הנוכחי' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'wpId',
      type: 'number',
      unique: true,
      label: { fr: 'ID ancien site', he: 'מזהה האתר הישן' },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
