import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Sponsors } from './src/collections/Sponsors'
import { Editions } from './src/collections/Editions'
import { Rubros } from './src/collections/Rubros'
import { Categories } from './src/collections/Categories'
import { Winners } from './src/collections/Winners'
import { RankingEntries } from './src/collections/RankingEntries'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  collections: [Users, Media, Sponsors, Editions, Rubros, Categories, Winners, RankingEntries],

  admin: {
    user: Users.slug,
  },

  editor: lexicalEditor({}),

  secret: process.env.PAYLOAD_SECRET || '',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  // Localization rails ready for Phase 4 (es/pt). No translated content yet.
  localization: {
    locales: ['es', 'pt'],
    defaultLocale: 'es',
    fallback: true,
  },

  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
})
