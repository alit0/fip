import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    // Minimal: email is built-in by auth:true. No complex roles yet (Phase 5-6).
  ],
}
