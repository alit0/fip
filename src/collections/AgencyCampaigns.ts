import type { CollectionConfig } from 'payload'

export const AgencyCampaigns: CollectionConfig = {
  slug: 'agency-campaigns',
  admin: {
    useAsTitle: 'campaignName',
    defaultColumns: ['campaignName', 'company', 'edition', 'status', 'paymentStatus'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user?.role === 'agency') {
        return { submittedBy: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => req.user?.role === 'agency' || req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'edition',
      type: 'relationship',
      relationTo: 'editions',
      required: true,
    },
    {
      name: 'campaignName',
      type: 'text',
      required: true,
    },
    {
      name: 'company',
      type: 'text',
      required: true,
      label: 'Brand / Company',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      maxRows: 7,
    },
    {
      name: 'presentationFile',
      type: 'relationship',
      relationTo: 'media',
      label: 'Presentation File (PDF/PPTX)',
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video URL (YouTube / Vimeo)',
    },
    {
      name: 'laminaUrl',
      type: 'text',
      label: 'Lamina / Brief URL',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Exempt', value: 'exempt' },
      ],
    },
  ],
}
