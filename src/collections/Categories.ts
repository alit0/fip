import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'rubro', 'edition', 'order'],
  },
  fields: [
    {
      name: 'rubro',
      type: 'relationship',
      relationTo: 'rubros',
      required: true,
    },
    {
      name: 'edition',
      type: 'relationship',
      relationTo: 'editions',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
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
      name: 'awardIcon',
      type: 'select',
      options: [
        { label: 'Oro', value: 'oro' },
        { label: 'Cristal', value: 'cristal' },
        { label: 'Platino', value: 'platino' },
      ],
    },
    {
      name: 'isSpecial',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'specialType',
      type: 'text',
    },
    {
      name: 'isNew',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
  ],
}
