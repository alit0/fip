import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const PageContent: CollectionConfig = {
  slug: 'page-content',
  admin: {
    useAsTitle: 'sectionKey',
    defaultColumns: ['pageKey', 'sectionKey', 'title', 'order', 'active'],
  },
  fields: [
    {
      name: 'pageKey',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sectionKey',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
