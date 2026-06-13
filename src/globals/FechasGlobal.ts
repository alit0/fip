import type { GlobalConfig } from 'payload'

export const FechasGlobal: GlobalConfig = {
  slug: 'fechas-global',
  label: 'Fechas Global',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'discounts',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'rows',
          type: 'array',
          fields: [
            { name: 'descuento', type: 'text', localized: true, required: true },
            { name: 'tipo', type: 'text', localized: true, required: true },
            { name: 'condicion', type: 'textarea', localized: true, required: true },
            { name: 'vigencia', type: 'text', localized: true, required: true },
          ],
        },
      ],
    },
    {
      name: 'closings',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'regions',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', localized: true, required: true },
            { name: 'detail', type: 'textarea', localized: true, required: true },
            { name: 'date', type: 'text', localized: true, required: true },
          ],
        },
        {
          name: 'milestones',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', localized: true, required: true },
            { name: 'detail', type: 'textarea', localized: true, required: true },
            { name: 'date', type: 'text', localized: true, required: true },
          ],
        },
        {
          name: 'note',
          type: 'textarea',
          localized: true,
        },
      ],
    },
  ],
}
