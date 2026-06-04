# FIP Festival — réplica web moderna

Réplica evolutiva del sitio [fipfestival.com.ar](https://www.fipfestival.com.ar/)
con arquitectura moderna, preparada para pasar de contenido mock a CMS sin rehacer
las páginas públicas.

## Estado actual

El proyecto está en **Fase 2 en curso**.

- Cimientos arquitectónicos creados: App Router, rutas localizadas, layout base,
  tokens visuales y capa de contenido async.
- Frontend público avanzado con páginas maquetadas según la documentación vigente
  del proyecto. La bitácora registra 7/12 páginas de Fase 2 cerradas.
- Testing base instalado con **Vitest**, **React Testing Library** y **jsdom**.
- **Payload CMS** y **PostgreSQL** todavía no están implementados: quedan para
  Fase 3.
- Las áreas privadas de **Agencias** y **Jurados** siguen pendientes para fases
  finales.

## Stack

- **Next.js 15** + **React 19** con App Router.
- **Tailwind CSS v4**.
- **next-intl** para ruteo y chrome de interfaz es/pt.
- **TypeScript**.
- **Vitest** + **React Testing Library** + **jsdom** para tests base.
- **Payload CMS 3** + **PostgreSQL** planificados para Fase 3.

## Correr en local

```bash
npm install
npm run dev
```

Abrir <http://localhost:3000>.

Comandos útiles:

```bash
npm run build
npm run typecheck
npm run lint
npm test
```

## Estructura resumida

```text
src/
├─ app/[locale]/     rutas públicas y layouts localizados
├─ components/       componentes de layout, páginas y shared UI
├─ lib/content/      getters async que alimentan las páginas
├─ mocks/            datos temporales usados por la capa de contenido
├─ i18n/             routing y mensajes de next-intl
└─ test/             smoke tests y tests base
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

- **Fase 3:** Payload CMS, PostgreSQL, admin, storage y migración mock → queries.
- **Fase 4:** i18n completo es/pt para contenido.
- **Fase 5:** área privada de Agencias.
- **Fase 6:** área privada de Jurados y scoring.
