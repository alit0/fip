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
import { Jurors } from './src/collections/Jurors'
import { HallOfFameMembers } from './src/collections/HallOfFameMembers'
import { DownloadFiles } from './src/collections/DownloadFiles'
import { PageContent } from './src/collections/PageContent'
import { SiteConfig } from './src/globals/SiteConfig'
import { PremiosGlobal } from './src/globals/PremiosGlobal'
import { FechasGlobal } from './src/globals/FechasGlobal'
import { InscripcionGlobal } from './src/globals/InscripcionGlobal'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  collections: [
    Users,
    Media,
    Sponsors,
    Editions,
    Rubros,
    Categories,
    Winners,
    RankingEntries,
    Jurors,
    HallOfFameMembers,
    DownloadFiles,
    PageContent,
  ],
  globals: [SiteConfig, PremiosGlobal, FechasGlobal, InscripcionGlobal],

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
