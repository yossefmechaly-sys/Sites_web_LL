import type { CollectionConfig } from 'payload'

// Inscrits à la newsletter. Créés uniquement par le formulaire du site (action serveur),
// jamais par l'API publique.
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: { fr: 'Abonné newsletter', he: 'מנוי לניוזלטר' },
    plural: { fr: 'Abonnés newsletter', he: 'מנויים לניוזלטר' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'locale', 'createdAt'],
    group: { fr: 'Site', he: 'אתר' },
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      label: { fr: 'Email', he: 'אימייל' },
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        { label: 'עברית', value: 'he' },
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
      ],
      label: { fr: 'Langue', he: 'שפה' },
      admin: { position: 'sidebar' },
    },
  ],
}
