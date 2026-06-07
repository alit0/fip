# FIP Festival — réplica web moderna

Réplica evolutiva del sitio [fipfestival.com.ar](https://www.fipfestival.com.ar/)
con arquitectura moderna, preparada para pasar de contenido mock a CMS sin rehacer
las páginas públicas.

## Estado actual

El proyecto está en **Fase 3 en curso**.

- Fase 2 completa: 12/12 páginas públicas maquetadas con datos mock.
- **PostgreSQL 16** integrado vía Docker Compose (`docker compose up -d`).
- **Payload CMS 3** base integrado: admin en `/admin` funcionando.
- Collections creadas: `Users` (auth admin), `Media` (uploads), `Sponsors`, `Editions`, `Rubros`, `Categories`.
- `.env.local` requerido para desarrollo (gitignoreado); `.env.example` como template.
- Tests, typecheck y build en verde (46 tests).
- Migración mock → queries en curso (Sponsors, Editions, Rubros y Categories ya migrados).

- Áreas privadas de **Agencias** y **Jurados** siguen pendientes para fases finales.

## Stack

- **Next.js 15** + **React 19** con App Router.
- **Tailwind CSS v4**.
- **next-intl** para ruteo y chrome de interfaz es/pt.
- **TypeScript**.
- **Vitest** + **React Testing Library** + **jsdom** para tests base.
- **Payload CMS 3** + **PostgreSQL 16** (Docker) — integrados en Fase 3.
- **Docker Compose** para base de datos local (`docker compose up -d`).

## Correr en local

```bash
cp .env.example .env.local   # editar con DATABASE_URI y PAYLOAD_SECRET
docker compose up -d         # levantar PostgreSQL
npm install
npm run dev
```

Abrir <http://localhost:3000> (sitio público) y <http://localhost:3000/admin> (CMS).

> **Nota:** `npm install` requiere `--legacy-peer-deps` por un desfase entre las peer
> dependencies de Next.js y Payload CMS. No afecta el funcionamiento.

Comandos útiles:

```bash
npm run build
npm run typecheck
npm run lint
npm test
npm run seed:sponsors   # carga sponsors desde mocks a Payload (idempotente)
npm run seed:edition     # carga edición 2026 en Payload (idempotente)
npm run seed:rubros      # carga rubros desde mocks a Payload (idempotente)
npm run seed:categories  # carga categorías desde mocks a Payload (idempotente)
```

> **Nota:** `npm run seed:sponsors` requiere PostgreSQL corriendo (`docker compose up -d`)
> y `.env.local` configurado. Es idempotente: si se corre dos veces, no duplica sponsors.
> No borra datos existentes.

> **Nota:** `npm run seed:edition` requiere los mismos prerequisitos. Es idempotente
> por `year`: si se corre dos veces, no duplica ediciones. El getter `getCurrentEdition()`
> ya existe y devuelve la edición actual desde Payload con fallback seguro a 2026.

## Estructura resumida

```text
src/
├─ app/
│  ├─ [locale]/         rutas públicas y layouts localizados
│  └─ (payload)/        admin CMS y API de Payload
├─ collections/         config de colecciones de Payload (Users, Media, Sponsors…)
├─ components/          componentes de layout, páginas y shared UI
├─ lib/content/         getters async que alimentan las páginas
├─ mocks/               datos temporales usados por la capa de contenido
├─ i18n/                routing y mensajes de next-intl
└─ test/                smoke tests y tests base
```

## Regla arquitectónica clave

Las páginas **no deben importar mocks directo**.

El flujo correcto es:

```text
página → src/lib/content/ → src/mocks/
```

`src/lib/content/` es el punto de reemplazo previsto para Fase 3: cuando entren
Payload y PostgreSQL, las páginas deberían seguir consumiendo los mismos getters
async, pero esos getters pasarán de leer mocks a consultar datos reales.

## i18n y rutas

- `es` es el idioma default y se sirve **sin prefijo**.
- `pt` se sirve con prefijo: `/pt/...`.
- Las rutas viven bajo `src/app/[locale]/`.
- El chrome/layout ya está preparado con `next-intl`.
- El contenido del cuerpo sigue en migración incremental según la documentación
  actual; la traducción completa queda para Fase 4.

## Flujo de ramas

Según la documentación de operación vigente:

- `main` es estable/publicable y solo recibe releases.
- `develop` es la rama de integración y trabajo diario.
- Codex trabaja en ramas `feat/codex-*` creadas desde `develop` y no mergea solo.
- El tech lead revisa e integra a `develop`.

## Documentos importantes

- [`ROADMAP.md`](./ROADMAP.md) — fases, hitos y trabajo pendiente.
- [`BITACORA-V1.md`](./BITACORA-V1.md) — estado operativo y decisiones recientes.
- [`MANUAL-DE-OPERACION.md`](./MANUAL-DE-OPERACION.md) — método de trabajo,
  testing y criterios de avance.
- [`ORQUESTACION-AGENTES.md`](./ORQUESTACION-AGENTES.md) — roles, ramas,
  worktrees y reglas anti-pisada.
- [`SECURITY-AUDIT-NPM.md`](./SECURITY-AUDIT-NPM.md) — auditoría npm y decisiones
  de seguridad pendientes.
- [`JURADOS-SCORING-SPEC.md`](./JURADOS-SCORING-SPEC.md) — especificación
  preliminar del scoring de jurados para Fase 6.

## Reglas rápidas para agentes

- Una tarea por vez.
- No tocar archivos fuera del territorio asignado.
- No mezclar commits ni cambios de distintas tareas.
- No modificar páginas/componentes/mocks/tests si la tarea no lo pide.
- Verificar con `npm test`, `npm run typecheck` y `npm run build` antes de cerrar
  cambios de código o configuración.
- Si hay discrepancia entre auditoría/documentos viejos y el sitio en vivo, el sitio
  en vivo manda.

## Próximas fases

- **Fase 3:** ✅ PostgreSQL (Docker) · ✅ Payload CMS base · ✅ Admin `/admin` · ✅ Collections Users/Media/Sponsors/Editions/Rubros/Categories · ✅ `getSponsors()`, `getCurrentEdition()`, `getRubros()` y `getCategories()` migrados a Payload con fallback · 🔄 Resto del backbone (Winner) pendiente.
- **Fase 4:** i18n completo es/pt para contenido.
- **Fase 5:** área privada de Agencias.
- **Fase 6:** área privada de Jurados y scoring.
