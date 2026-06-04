# Informe Fase 1 — npm audit

**Rama:** `feat/codex-audit`  
**Fecha:** 2026-06-03  
**Proyecto:** FIP Festival (`fip-festival`)  
**Comando principal:** `npm audit --json`  
**Regla respetada:** no se modificaron `package.json` ni `package-lock.json`.

## Resumen ejecutivo

`npm audit` reporta **8 vulnerabilidades**: **7 moderate** y **1 critical**.

La foto real para este proyecto es más tranquila que el número bruto:

- **3 vulnerabilidades son de producción** y vienen del stack `next` → `postcss` → `next-intl`.
- **5 vulnerabilidades son de desarrollo/test** y vienen del stack `vitest` → `vite`/`vite-node`/`@vitest/mocker`/`esbuild`.
- El único `critical` es **Vitest**, pero aplica cuando se expone/usa el **Vitest UI server**. El proyecto hoy usa scripts `vitest run` y `vitest`, no `vitest --ui`.
- No encontré un fix “bump menor seguro” para cerrar todo. Los fixes automáticos que propone npm son **semver major** o downgrades absurdos.

Mi recomendación: **no correr `npm audit fix --force` a ciegas**. Para Fase 2, aplicaría solo fixes explícitos y verificados.

## Dependencias auditadas

Directas relevantes en `package.json`:

- Producción: `next`, `next-intl`, `react`, `react-dom`, `lucide-react`.
- Desarrollo: `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, Testing Library, TypeScript, ESLint.

Versiones instaladas en `package-lock.json`:

- `next`: `15.5.18`
- `next-intl`: `4.13.0`
- `next/node_modules/postcss`: `8.4.31` vulnerable
- `postcss` raíz: `8.5.15` no vulnerable, pero dev/transitivo
- `vitest`: `2.1.9`
- `vite`: `5.4.21`
- `vite-node`: `2.1.9`
- `@vitest/mocker`: `2.1.9`
- `esbuild`: `0.21.5`

## Tabla de vulnerabilidades

| # | Paquete | Severidad | Tipo | Entra por | Riesgo real en este proyecto | Fix existente | Método |
|---|---------|-----------|------|-----------|------------------------------|---------------|--------|
| 1 | `vitest` | critical | devDependency directa | `vitest@2.1.9` | Bajo/medio hoy: el exploit requiere Vitest UI server escuchando. No hay script `--ui`. Sube si alguien expone la UI o corre tests en red compartida. | `vitest@4.1.8` | **Requiere major**. npm lo trata como `--force`. |
| 2 | `vite` | moderate | dev transitiva | `vitest` | Bajo: afecta server/dev tooling y sourcemaps de deps optimizadas. No es runtime público de Next. | Vite no vulnerable vía `vitest@4.1.8` | **Requiere major de Vitest**. |
| 3 | `vite-node` | moderate | dev transitiva | `vitest` | Bajo: ejecución de tests/dev, no producción. | `vitest@4.1.8` | **Requiere major de Vitest**. |
| 4 | `@vitest/mocker` | moderate | dev transitiva | `vitest` | Bajo: mocker de tests, no llega al build público. | `vitest@4.1.8` | **Requiere major de Vitest**. |
| 5 | `esbuild` | moderate | dev transitiva | `vite` | Bajo: afecta dev server de esbuild. No hay server esbuild público en producción. | Subir cadena Vite/Vitest | **Requiere major de Vitest** en esta gráfica. |
| 6 | `postcss` | moderate | prod transitiva | `next@15.5.18` vendorea `postcss@8.4.31` | Bajo/medio: el riesgo es XSS al stringificar CSS con contenido no confiable. Este sitio compila CSS propio, no CSS de usuarios. Aun así es dependencia de producción. | `postcss>=8.5.10`; `next@canary` ya declara `8.5.10`, `next@latest` sigue en `8.4.31` | **No hay bump menor estable de Next hoy**. Posible override manual, con test/build. |
| 7 | `next` | moderate | dependency directa | vía `postcss` vulnerable interno | Mismo riesgo que #6; `next` aparece porque contiene el `postcss` vulnerable. | npm sugiere `next@9.3.3`, que es un downgrade inválido para este proyecto | **No usar `npm audit fix --force`**. |
| 8 | `next-intl` | moderate | dependency directa | depende de `next` | No es vulnerabilidad propia de `next-intl`; es efecto cascada por `next`. | npm sugiere `next-intl@0.0.1`, downgrade inválido | **No usar `npm audit fix --force`**. |

## Análisis por grupo

### Grupo A — Vitest/Vite/esbuild, solo desarrollo

Paquetes afectados:

- `vitest@2.1.9`
- `vite@5.4.21`
- `vite-node@2.1.9`
- `@vitest/mocker@2.1.9`
- `esbuild@0.21.5`

**Riesgo real:** bajo para usuarios finales. Estos paquetes se usan en test/dev, no en el servidor Next de producción.

**Riesgo operativo:** medio para la máquina del desarrollador o CI si se expone un servidor de Vitest/Vite a la red. El `critical` de Vitest es serio si alguien corre Vitest UI expuesto.

**Fix:** subir `vitest` de `2.1.9` a `4.1.8`.

**Costo/riesgo del fix:** no es menor. Es salto mayor `2 → 4`. La config actual es simple (`vitest.config.mts`, jsdom, Testing Library), así que probablemente sea manejable, pero igual requiere:

1. Cambiar `vitest`.
2. Regenerar lockfile.
3. Correr `npm test`.
4. Correr `npm run typecheck` y, si aplica, `npm run build`.

**Decisión recomendada:** aplicar en Fase 2 solo si aceptás el salto mayor controlado. No usar `npm audit fix --force` sin revisar el diff.

### Grupo B — Next/PostCSS/next-intl, producción

Paquetes afectados:

- `next@15.5.18`
- `next/node_modules/postcss@8.4.31`
- `next-intl@4.13.0` por dependencia de `next`

**Riesgo real:** bajo/medio. Es producción, así que importa más. Pero el bug de PostCSS necesita CSS no confiable entrando al proceso de stringificación. El proyecto hoy no permite que usuarios suban o editen CSS arbitrario.

**Problema:** `next@latest` (`16.2.7`) todavía declara `postcss: 8.4.31`. `next@canary` (`16.3.0-canary.39`) ya declara `postcss: 8.5.10`, pero sería salto mayor + canary.

**Fixes posibles:**

1. **Esperar release estable de Next** que suba PostCSS a `8.5.10` o superior. Es lo más sano.
2. **Override manual de npm** para forzar `next -> postcss@8.5.10`. Menos invasivo que Next canary, pero sigue siendo una intervención manual sobre dependencia interna de Next. Requiere build completo.
3. **Next canary**. No lo recomiendo para este proyecto salvo urgencia, porque mete más riesgo que el que reduce.

**Decisión recomendada:** no tocar ahora con `--force`. Para una web pública sin CSS de usuario, aceptaría el riesgo temporal y lo reabriría cuando salga Next estable con PostCSS actualizado, o haría override solo si querés dejar audit limpio ya.

## Qué arreglaría

### En Fase 2, con tu OK

1. **Vitest/Vite/esbuild**: haría upgrade explícito de `vitest` a `4.1.8`, no `npm audit fix --force` genérico.
   - Motivo: elimina el único `critical` y cuatro `moderate` de tooling.
   - Riesgo: salto mayor del test runner.
   - Mitigación: tests + typecheck + build.

2. **Next/PostCSS**: no aplicaría canary ni downgrade. Como máximo propondría un override manual de `postcss@8.5.10` bajo `next`, pero solo si aceptás validar build.
   - Motivo: es prod, pero el riesgo explotable en este sitio parece bajo.
   - Riesgo del fix: tocar dependencia interna de Next puede ser más riesgoso que el advisory para este caso.

## Qué NO haría

- No correría `npm audit fix --force` global.
- No aceptaría los “fixes” sugeridos por npm para `next@9.3.3` ni `next-intl@0.0.1`: son downgrades incompatibles con el proyecto.
- No subiría Next a canary en una rama de auditoría salvo autorización explícita.

## Clasificación por método

### Bump menor seguro

Ninguno confirmado para cerrar estas 8 vulnerabilidades en la gráfica actual.

### Requiere upgrade mayor / riesgoso

- `vitest@2.1.9` → `vitest@4.1.8`: cierra el grupo dev/test, pero es major.
- `next@15.5.18` → `next@16.3.0-canary.39`: cierra PostCSS, pero es major + canary. No recomendado.

### Fix manual posible, no automático

- Override de `next` → `postcss@8.5.10`: potencialmente razonable, pero requiere validación. No es “bump menor normal” porque Next declara PostCSS interno exacto.

## Recomendación final

Para Fase 2, mi plan sería:

1. **Acordar upgrade controlado de Vitest a 4.1.8** para eliminar el critical y las vulnerabilidades dev asociadas.
2. **No tocar Next/PostCSS todavía**, salvo que quieras audit limpio a toda costa. Si lo querés, prefiero override manual antes que Next canary.
3. **Nunca usar `npm audit fix --force` sin diff revisado**, porque npm propone downgrades/majors que no respetan la arquitectura actual.

## Seguimiento Fase 2 — 2026-06-04

Se intentó el upgrade explícito `vitest@2.1.9` → `vitest@4.1.8` sin usar
`npm audit fix --force`.

Resultado: **revertido**. `npm test` dejó de ejecutar los 18 tests y falló antes de
correrlos por incompatibilidad de parsing/transforms en la cadena nueva
`vitest@4.1.8` / `vite@8.x` / Rolldown:

- `src/test/pages.smoke.test.tsx`: `Unexpected JSX expression` en `render(<Page />)`.
- `src/components/shared/Cta.tsx`: fallo de import analysis sobre TSX.

Como el criterio de aceptación de Fase 2 exige que los 18 tests sigan verdes, no se
mantiene este upgrade en `package.json` ni en `package-lock.json`.

Decisión pendiente para tech lead: si se quiere cerrar el critical de Vitest, hacerlo
como tarea separada de migración de test runner/config Vite, no como bump seguro de
dependencia.
