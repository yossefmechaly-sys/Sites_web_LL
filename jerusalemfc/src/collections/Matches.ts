import type { CollectionConfig } from 'payload'

export const Matches: CollectionConfig = {
  slug: 'matches',
  labels: {
    singular: { fr: 'Match', he: 'משחק' },
    plural: { fr: 'Matchs', he: 'משחקים' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kickoff', 'round', 'homeScore', 'awayScore', 'status', 'locked'],
    group: { fr: 'Compétition', he: 'תחרות' },
    listSearchableFields: ['title'],
  },
  access: {
    read: () => true,
  },
  defaultSort: '-kickoff',
  hooks: {
    // Titre lisible dans l'admin : « Équipe A - Équipe B »
    beforeChange: [
      async ({ data, req }) => {
        const name = async (id: unknown) => {
          if (!id) return '?'
          const team = await req.payload.findByID({
            collection: 'teams',
            id: typeof id === 'object' ? (id as { id: number }).id : (id as number),
            depth: 0,
            locale: req.locale ?? 'he',
            req,
          })
          return team?.name ?? '?'
        }
        data.title = `${await name(data.homeTeam)} - ${await name(data.awayTeam)}`
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: { fr: 'Match', he: 'משחק' },
      admin: { hidden: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'homeTeam',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          label: { fr: 'Domicile', he: 'בית' },
        },
        {
          name: 'awayTeam',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          label: { fr: 'Extérieur', he: 'חוץ' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'homeScore',
          type: 'number',
          min: 0,
          label: { fr: 'Buts domicile', he: 'שערי בית' },
        },
        {
          name: 'awayScore',
          type: 'number',
          min: 0,
          label: { fr: 'Buts extérieur', he: 'שערי חוץ' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kickoff',
          type: 'date',
          required: true,
          timezone: true,
          label: { fr: 'Date et heure', he: 'תאריך ושעה' },
          admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' } },
        },
        {
          name: 'timeTbd',
          type: 'checkbox',
          defaultValue: false,
          label: { fr: 'Heure non fixée', he: 'שעה טרם נקבעה' },
        },
      ],
    },
    {
      name: 'venue',
      type: 'text',
      localized: true,
      label: { fr: 'Stade', he: 'מגרש' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'season',
          type: 'relationship',
          relationTo: 'seasons',
          label: { fr: 'Saison', he: 'עונה' },
          admin: { description: { fr: 'Vide pour un match amical.', he: 'ריק למשחק ידידות.' } },
        },
        {
          name: 'round',
          type: 'number',
          label: { fr: 'Journée', he: 'מחזור' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      label: { fr: 'Statut', he: 'סטטוס' },
      options: [
        { value: 'scheduled', label: { fr: 'À venir', he: 'עתידי' } },
        { value: 'played', label: { fr: 'Joué', he: 'שוחק' } },
        { value: 'postponed', label: { fr: 'Reporté', he: 'נדחה' } },
        { value: 'cancelled', label: { fr: 'Annulé', he: 'בוטל' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'locked',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Verrouillé (l’import ne le modifie plus)', he: 'נעול (הייבוא לא ישנה אותו)' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      label: { fr: 'Source', he: 'מקור' },
      options: [
        { value: 'ifa', label: { fr: 'Import Fédération', he: 'ייבוא מההתאחדות' } },
        { value: 'wp', label: { fr: 'Ancien site', he: 'האתר הישן' } },
        { value: 'manual', label: { fr: 'Saisie manuelle', he: 'הזנה ידנית' } },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'ifaKey',
      type: 'text',
      unique: true,
      index: true,
      label: { fr: 'Clé import', he: 'מפתח ייבוא' },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: { fr: 'ligue-saison-journée-domicile-extérieur', he: 'ליגה-עונה-מחזור-בית-חוץ' },
      },
    },
    {
      name: 'ifaGameId',
      type: 'text',
      label: { fr: 'N° match Fédération', he: 'מס׳ משחק בהתאחדות' },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
