import type { CollectionConfig } from 'payload'

export const HallOfFameMembers: CollectionConfig = {
  slug: 'hall-of-fame-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'inductionYear', 'order', 'active'],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'countryCode',
      type: 'text',
      required: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'inductionYear',
      type: 'number',
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
  ],
}
