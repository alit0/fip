import type { GlobalConfig } from 'payload'

export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  label: 'Site Config',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'contactEmails',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
      ],
    },
    {
      name: 'phones',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'number',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'whatsapps',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'number',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'currentEdition',
      type: 'relationship',
      relationTo: 'editions',
    },
  ],
}
