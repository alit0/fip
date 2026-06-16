import type { CollectionConfig } from 'payload'

export const Winners: CollectionConfig = {
  slug: 'winners',
  admin: {
    useAsTitle: 'campaign',
    defaultColumns: ['edition', 'category', 'awardLevel', 'campaign', 'agency', 'country'],
  },
  fields: [
    {
      name: 'edition',
      type: 'relationship',
      relationTo: 'editions',
      required: true,
    },
    {
      name: 'rubro',
      type: 'relationship',
      relationTo: 'rubros',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'awardLevel',
      type: 'select',
      required: true,
      options: [
        { label: 'Gran Prix', value: 'granprix' },
        { label: 'Oro', value: 'oro' },
        { label: 'Plata', value: 'plata' },
        { label: 'Bronce', value: 'bronce' },
        { label: 'Finalista', value: 'finalista' },
        { label: 'Especial', value: 'especial' },
      ],
    },
    {
      name: 'specialAwardName',
      type: 'text',
      localized: true,
    },
    {
      name: 'campaign',
      type: 'text',
      required: true,
    },
    {
      name: 'brand',
      type: 'text',
    },
    {
      name: 'agency',
      type: 'text',
      required: true,
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'isGrandReco',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
