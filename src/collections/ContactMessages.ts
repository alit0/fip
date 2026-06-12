import type { CollectionConfig } from 'payload'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'createdAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'stored',
      options: [
        { label: 'Stored', value: 'stored' },
        { label: 'Sent', value: 'sent' },
        { label: 'Spam', value: 'spam' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'source', type: 'text', defaultValue: 'contact-form' },
    { name: 'ip', type: 'text' },
    { name: 'userAgent', type: 'textarea' },
    { name: 'emailError', type: 'textarea' },
  ],
}
