import type { GlobalConfig } from 'payload'

// Mentions légales, politique de confidentialité et cookies : sections modifiables dans l'admin.
export const LegalPage: GlobalConfig = {
  slug: 'legal-page',
  label: { fr: 'Mentions légales', he: 'מידע משפטי' },
  admin: { group: { fr: 'Pages', he: 'עמודים' } },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { fr: 'Titre', he: 'כותרת' } },
    {
      name: 'updatedOn',
      type: 'date',
      label: { fr: 'Dernière mise à jour', he: 'עדכון אחרון' },
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
    },
    {
      name: 'sections',
      type: 'array',
      localized: true,
      label: { fr: 'Sections', he: 'סעיפים' },
      fields: [
        { name: 'heading', type: 'text', required: true, label: { fr: 'Titre de section', he: 'כותרת סעיף' } },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          label: { fr: 'Texte (un paragraphe par ligne vide)', he: 'טקסט' },
          admin: { rows: 6 },
        },
      ],
    },
  ],
}
