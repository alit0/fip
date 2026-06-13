import type { GlobalConfig } from 'payload'

const textRows = [
  {
    name: 'text',
    type: 'textarea' as const,
    localized: true,
    required: true,
  },
]

const linkFields = [
  { name: 'label', type: 'text' as const, localized: true, required: true },
  { name: 'href', type: 'text' as const, required: true },
]

const downloadFields = [
  { name: 'label', type: 'text' as const, localized: true, required: true },
  { name: 'href', type: 'text' as const, required: true },
  { name: 'lang', type: 'select' as const, required: true, options: ['ES', 'PT'] },
]

export const InscripcionGlobal: GlobalConfig = {
  slug: 'inscripcion-global',
  label: 'Inscripcion Global',
  admin: {
    group: 'Settings',
  },
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'subtitle', type: 'text', localized: true },
    {
      name: 'index',
      type: 'array',
      fields: linkFields,
    },
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'step', type: 'text', localized: true, required: true },
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'body', type: 'array', fields: textRows },
        { name: 'bullets', type: 'array', fields: textRows },
        { name: 'links', type: 'array', fields: linkFields },
        {
          name: 'cta',
          type: 'group',
          fields: linkFields,
        },
        { name: 'downloads', type: 'array', fields: downloadFields },
        { name: 'imageTodo', type: 'text', localized: true },
      ],
    },
    {
      name: 'condiciones',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'body', type: 'textarea', localized: true, required: true },
      ],
    },
    {
      name: 'contenido',
      type: 'group',
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'question', type: 'textarea', localized: true, required: true },
        {
          name: 'aspects',
          type: 'array',
          fields: [
            { name: 'number', type: 'number', required: true },
            { name: 'title', type: 'text', localized: true, required: true },
            { name: 'body', type: 'array', fields: textRows },
          ],
        },
      ],
    },
  ],
}
