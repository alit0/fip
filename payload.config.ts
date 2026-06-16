import { buildConfig } from 'payload'
import type { GlobalAfterChangeHook } from 'payload'
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
import { ContactMessages } from './src/collections/ContactMessages'
import { AgencyCampaigns } from './src/collections/AgencyCampaigns'
import { SiteConfig } from './src/globals/SiteConfig'
import { PremiosGlobal } from './src/globals/PremiosGlobal'
import { FechasGlobal } from './src/globals/FechasGlobal'
import { InscripcionGlobal } from './src/globals/InscripcionGlobal'
import { triggerRevalidation } from './src/lib/revalidation/triggerRevalidation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ---------------------------------------------------------------------------
// Revalidation hooks
// ---------------------------------------------------------------------------

/**
 * Paths revalidated when a Global changes (affects the whole public site since
 * Globals supply shared content like SiteConfig, Premios, Fechas, Inscripcion).
 */
const ALL_PUBLIC_PATHS = [
  '/es',
  '/pt',
  '/es/categorias',
  '/pt/categorias',
  '/es/fechas-de-cierre',
  '/pt/fechas-de-cierre',
  '/es/hall-de-la-fama',
  '/pt/hall-de-la-fama',
  '/es/inscripcion',
  '/pt/inscripcion',
  '/es/jurados',
  '/pt/jurados',
  '/es/premios',
  '/pt/premios',
  '/es/reglamento',
  '/pt/reglamento',
  '/es/tarifario',
  '/pt/tarifario',
  '/es/20-consejos',
  '/pt/20-consejos',
  '/es/ranking',
  '/pt/ranking',
  '/es/ganadores',
  '/pt/ganadores',
  '/sitemap.xml',
]

/** Revalidate every public path after a Global is saved. */
const globalRevalidationHook: GlobalAfterChangeHook = async () => {
  await triggerRevalidation(ALL_PUBLIC_PATHS)
}

/** Factory for Global-scoped hooks that only touch specified paths. */
function makeGlobalRevalidationHook(paths: string[]): GlobalAfterChangeHook {
  return async () => {
    await triggerRevalidation(paths)
  }
}

/** Factory for Collection-scoped hooks that only touch relevant paths. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeCollectionRevalidationHook(paths: string[]): (args: any) => Promise<void> {
  return async () => {
    await triggerRevalidation(paths)
  }
}

export default buildConfig({
  collections: [
    {
      ...Users,
    },
    {
      ...Media,
    },
    {
      ...Sponsors,
      hooks: {
        ...Sponsors.hooks,
        afterChange: [
          ...(Sponsors.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook(['/es', '/pt', '/es/tarifario', '/pt/tarifario']),
        ],
      },
    },
    {
      ...Editions,
      hooks: {
        ...Editions.hooks,
        afterChange: [
          ...(Editions.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook(ALL_PUBLIC_PATHS),
        ],
      },
    },
    {
      ...Rubros,
      hooks: {
        ...Rubros.hooks,
        afterChange: [
          ...(Rubros.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook([
            '/es/categorias',
            '/pt/categorias',
            '/es',
            '/pt',
          ]),
        ],
      },
    },
    {
      ...Categories,
      hooks: {
        ...Categories.hooks,
        afterChange: [
          ...(Categories.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook([
            '/es/categorias',
            '/pt/categorias',
            '/es',
            '/pt',
          ]),
        ],
      },
    },
    {
      ...Winners,
      hooks: {
        ...Winners.hooks,
        afterChange: [
          ...(Winners.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook(['/es/ganadores', '/pt/ganadores']),
        ],
      },
    },
    {
      ...RankingEntries,
      hooks: {
        ...RankingEntries.hooks,
        afterChange: [
          ...(RankingEntries.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook(['/es/ranking', '/pt/ranking']),
        ],
      },
    },
    {
      ...Jurors,
      hooks: {
        ...Jurors.hooks,
        afterChange: [
          ...(Jurors.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook(['/es/jurados', '/pt/jurados', '/es', '/pt']),
        ],
      },
    },
    {
      ...HallOfFameMembers,
      hooks: {
        ...HallOfFameMembers.hooks,
        afterChange: [
          ...(HallOfFameMembers.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook(['/es/hall-de-la-fama', '/pt/hall-de-la-fama']),
        ],
      },
    },
    {
      ...DownloadFiles,
      hooks: {
        ...DownloadFiles.hooks,
        afterChange: [
          ...(DownloadFiles.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook([
            '/es/reglamento',
            '/pt/reglamento',
            '/es/inscripcion',
            '/pt/inscripcion',
            '/es/tarifario',
            '/pt/tarifario',
            '/es/premios',
            '/pt/premios',
          ]),
        ],
      },
    },
    {
      ...PageContent,
      hooks: {
        ...PageContent.hooks,
        afterChange: [
          ...(PageContent.hooks?.afterChange ?? []),
          makeCollectionRevalidationHook(ALL_PUBLIC_PATHS),
        ],
      },
    },
    {
      ...ContactMessages,
    },
    {
      ...AgencyCampaigns,
    },
  ],
  globals: [
    {
      ...SiteConfig,
      hooks: {
        ...SiteConfig.hooks,
        afterChange: [
          ...(SiteConfig.hooks?.afterChange ?? []),
          globalRevalidationHook,
        ],
      },
    },
    {
      ...PremiosGlobal,
      hooks: {
        ...PremiosGlobal.hooks,
        afterChange: [
          ...(PremiosGlobal.hooks?.afterChange ?? []),
          makeGlobalRevalidationHook(['/es/premios', '/pt/premios']),
        ],
      },
    },
    {
      ...FechasGlobal,
      hooks: {
        ...FechasGlobal.hooks,
        afterChange: [
          ...(FechasGlobal.hooks?.afterChange ?? []),
          makeGlobalRevalidationHook(['/es/fechas-de-cierre', '/pt/fechas-de-cierre']),
        ],
      },
    },
    {
      ...InscripcionGlobal,
      hooks: {
        ...InscripcionGlobal.hooks,
        afterChange: [
          ...(InscripcionGlobal.hooks?.afterChange ?? []),
          makeGlobalRevalidationHook(['/es/inscripcion', '/pt/inscripcion']),
        ],
      },
    },
  ],

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
