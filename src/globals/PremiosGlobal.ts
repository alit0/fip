import type { GlobalConfig } from 'payload'

export const PremiosGlobal: GlobalConfig = {
  slug: 'premios-global',
  label: 'Premios Global',
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
      name: 'orderEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'priceNotice',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'trophies',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          required: true,
        },
        {
          name: 'price',
          type: 'text',
          required: true,
        },
        {
          name: 'imageTodo',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'shipping',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'note',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'rows',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              localized: true,
              required: true,
            },
            {
              name: 'price',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: true,
            },
            {
              name: 'body',
              type: 'textarea',
              localized: true,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'downloads',
      type: 'group',
      fields: [
        {
          name: 'esDownloadKey',
          type: 'text',
          required: true,
          admin: {
            description:
              'DownloadFiles.key for the Spanish premios/replicas file. Resolved with language=es.',
          },
        },
        {
          name: 'ptDownloadKey',
          type: 'text',
          required: true,
          admin: {
            description:
              'DownloadFiles.key for the Portuguese premios/replicas file. Resolved with language=pt.',
          },
        },
      ],
    },
  ],
}
