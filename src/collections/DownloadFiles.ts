import type { CollectionConfig } from 'payload'

export const DownloadFiles: CollectionConfig = {
  slug: 'download-files',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'key', 'language', 'section', 'active'],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'language',
      type: 'select',
      options: [
        { label: 'Español', value: 'es' },
        { label: 'Português', value: 'pt' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'format',
      type: 'select',
      options: [
        { label: 'PDF', value: 'pdf' },
        { label: 'PowerPoint', value: 'pptx' },
        { label: 'Word', value: 'docx' },
      ],
      required: true,
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'fileUrl',
      type: 'text',
    },
    {
      name: 'section',
      type: 'text',
      required: true,
      index: true,
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
