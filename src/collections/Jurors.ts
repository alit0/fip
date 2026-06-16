import type { CollectionConfig } from 'payload'

export const Jurors: CollectionConfig = {
  slug: 'jurors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'role', 'active'],
  },
  fields: [
    {
      name: 'edition',
      type: 'relationship',
      relationTo: 'editions',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
    },
    {
      name: 'agency',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'countryCode',
      type: 'text',
      admin: {
        description: 'ISO alpha-2 code (e.g. AR, BR, ES)',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'order',
      type: 'number',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
