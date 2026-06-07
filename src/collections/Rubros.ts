import type { CollectionConfig } from 'payload'

export const Rubros: CollectionConfig = {
  slug: 'rubros',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['number', 'code', 'name', 'edition', 'order'],
  },
  fields: [
    {
      name: 'number',
      type: 'number',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'edition',
      type: 'relationship',
      relationTo: 'editions',
      required: true,
    },
  ],
}
