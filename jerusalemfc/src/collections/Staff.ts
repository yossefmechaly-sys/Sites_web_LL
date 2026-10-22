import type { CollectionConfig } from 'payload'

// Encadrement du club, affiché sur la page « staff » dans l'ordre choisi.
export const Staff: CollectionConfig = {
  slug: 'staff',
  labels: {
    singular: { fr: 'Membre du staff', he: 'איש סגל' },
    plural: { fr: 'Staff', he: 'סגל' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
    group: { fr: 'Équipe', he: 'הקבוצה' },
  },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, localized: true, label: { fr: 'Nom', he: 'שם' } },
        { name: 'role', type: 'text', required: true, localized: true, label: { fr: 'Fonction', he: 'תפקיד' } },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media', label: { fr: 'Photo', he: 'תמונה' } },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      label: { fr: 'Ordre d’affichage', he: 'סדר' },
      admin: { position: 'sidebar', description: { fr: 'Du plus petit au plus grand.', he: 'מהקטן לגדול.' } },
    },
  ],
}
