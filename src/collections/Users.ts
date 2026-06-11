import type { CollectionConfig } from 'payload'
import { ROLES } from '../lib/auth/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      // Gates access to the private areas (/acceso/*). The middleware checks
      // session presence; requireRole() enforces this role server-side.
      name: 'role',
      type: 'select',
      required: true,
      // Least-privilege default: a freshly created user is an agency, never an
      // admin. Elevate to admin/juror explicitly.
      defaultValue: 'agency',
      options: ROLES.map((r) => ({
        label: r.charAt(0).toUpperCase() + r.slice(1),
        value: r,
      })),
    },
  ],
}
