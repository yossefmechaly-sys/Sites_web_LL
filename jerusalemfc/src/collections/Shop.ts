import type { Access, CollectionConfig } from 'payload'

// Boutique sans paiement en ligne : catalogue + précommandes traitées par le club.

const shopGroup = { fr: 'Boutique', he: 'החנות' }
const loggedIn: Access = ({ req }) => Boolean(req.user)

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: { fr: 'Produit', he: 'מוצר' }, plural: { fr: 'Produits', he: 'מוצרים' } },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'kind', 'price', 'order'], group: shopGroup },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: { fr: 'Nom', he: 'שם' } },
    { name: 'description', type: 'textarea', localized: true, label: { fr: 'Description', he: 'תיאור' } },
    { name: 'image', type: 'upload', relationTo: 'media', label: { fr: 'Image', he: 'תמונה' } },
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', min: 0, label: { fr: 'Prix (₪)', he: 'מחיר (₪)' } },
        {
          name: 'sizes',
          type: 'text',
          label: { fr: 'Tailles disponibles', he: 'מידות זמינות' },
          admin: { placeholder: '12, 14, 16, 18, S, M, L, XL' },
        },
      ],
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'item',
      options: [
        { value: 'featured', label: { fr: 'Mis en avant (grande carte en haut)', he: 'מוצג בראש העמוד' } },
        { value: 'item', label: { fr: 'Article de la boutique', he: 'מוצר בחנות' } },
      ],
      label: { fr: 'Présentation', he: 'תצוגה' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      label: { fr: 'Ordre d’affichage', he: 'סדר' },
      admin: { position: 'sidebar' },
    },
  ],
}

export const PreOrders: CollectionConfig = {
  slug: 'pre-orders',
  labels: { singular: { fr: 'Précommande', he: 'הזמנה מוקדמת' }, plural: { fr: 'Précommandes', he: 'הזמנות מוקדמות' } },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'phone', 'email', 'status', 'createdAt'], group: shopGroup },
  // Créées uniquement par le formulaire du site (action serveur)
  access: { create: () => false, read: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: { fr: 'Prénom et nom', he: 'שם מלא' } },
        { name: 'phone', type: 'text', required: true, label: { fr: 'Téléphone', he: 'טלפון' } },
        { name: 'email', type: 'email', label: { fr: 'Email', he: 'אימייל' } },
      ],
    },
    { name: 'details', type: 'textarea', required: true, label: { fr: 'Commande (quantité, taille, couleur)', he: 'פרטי ההזמנה' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { value: 'new', label: { fr: 'Nouvelle', he: 'חדשה' } },
        { value: 'contacted', label: { fr: 'Client contacté', he: 'נוצר קשר' } },
        { value: 'done', label: { fr: 'Terminée', he: 'הושלמה' } },
        { value: 'cancelled', label: { fr: 'Annulée', he: 'בוטלה' } },
      ],
      label: { fr: 'Suivi', he: 'מעקב' },
      admin: { position: 'sidebar' },
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
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}

export const Members: CollectionConfig = {
  slug: 'members',
  labels: { singular: { fr: 'Adhérent', he: 'חבר מועדון' }, plural: { fr: 'Adhérents', he: 'חברי מועדון' } },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['lastName', 'firstName', 'email', 'phone', 'createdAt'],
    group: { fr: 'Site', he: 'אתר' },
  },
  access: { create: () => false, read: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'lastName', type: 'text', required: true, label: { fr: 'Nom', he: 'שם משפחה' } },
        { name: 'firstName', type: 'text', required: true, label: { fr: 'Prénom', he: 'שם פרטי' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', required: true, unique: true, label: { fr: 'Email', he: 'אימייל' } },
        { name: 'phone', type: 'text', label: { fr: 'Téléphone', he: 'טלפון' } },
      ],
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
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
