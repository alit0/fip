import type { CollectionConfig } from 'payload'

export const RankingEntries: CollectionConfig = {
  slug: 'ranking-entries',
  admin: {
    useAsTitle: 'agency',
    defaultColumns: ['country', 'year', 'position', 'agency', 'total'],
  },
  fields: [
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'countrySlug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'year',
      type: 'number',
      required: true,
    },
    {
      name: 'position',
      type: 'number',
      required: true,
    },
    {
      name: 'agency',
      type: 'text',
      required: true,
    },
    {
      name: 'granPrix',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'oro',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'plata',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'bronce',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'total',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
