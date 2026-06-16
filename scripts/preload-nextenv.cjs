/**
 * Preload shim: patches @next/env for CJS/ESM interop with tsx.
 * Payload's loadEnv.js does `import nextEnvImport from '@next/env'` then
 * destructures `{ loadEnvConfig } = nextEnvImport`. Under tsx the CJS default
 * export wrapping breaks this. We fix it by requiring the module and setting
 * its default property to itself before tsx processes the ESM import.
 */
const nextEnv = require('@next/env')
if (!nextEnv.default) {
  nextEnv.default = nextEnv
}
