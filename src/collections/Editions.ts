import type { CollectionConfig } from 'payload'

export const Editions: CollectionConfig = {
  slug: 'editions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['year', 'title', 'status', 'isCurrent'],
  },
  fields: [
    {
      name: 'year',
      type: 'number',
      required: true,
      unique: true,
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Closed', value: 'closed' },
      ],
    },
  ],
}
