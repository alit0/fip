# FIP Festival — Agent Protocol

> Este archivo define el protocolo que TODO agente debe seguir antes de tocar código
> en este proyecto. No son sugerencias.

## Pre-task checklist (MANDATORY — ejecutar en este orden)

### A. Memoria y contexto

1. Buscar contexto previo en Engram (`mem_search` / `mem_context`) para el proyecto
   `FipFestival`.
2. Si hay sesiones anteriores relevantes, cargar el contexto antes de decidir.

### B. Estado del repo

```bash
pwd
git status
git branch --show-current
```

- Verificar que el working tree está limpio antes de empezar.
- Si hay cambios sin commitear de otra tarea, frenar y preguntar.

### C. Graphify (mapa del código)

Graphify está instalado como skill del sistema. `graphify-out/` contiene un grafo de
conocimiento del códigobase.

1. **Si `graphify-out/GRAPH_REPORT.md` existe:**
   - Leerlo **primero** como mapa de orientación.
   - Leer `graphify-out/manifest.json` como apoyo rápido.
   - **NO leer `graphify-out/graph.html`.**
   - **NO leer `graphify-out/graph.json` completo** (es grande). Solo leer secciones
     específicas si el reporte no alcanza.
   - Usar el grafo para decidir qué archivos leer después. Ej: si la tarea toca
     Sponsors, buscar `Sponsor` en los nodos del grafo para entender qué archivos
     están conectados.
   - **El grafo es un mapa, no un reemplazo.** Leer los archivos necesarios para la
     tarea, pero usar el grafo para evitar lecturas innecesarias.

2. **Si `graphify-out/` no existe o `GRAPH_REPORT.md` está ausente:**
   - Avisar que no hay grafo.
   - Preguntar si se quiere regenerar (`graphify . --update`).

3. **Graph freshness check:**
   - El reporte indica el commit desde el que se construyó.
   - Comparar con `git rev-parse --short HEAD`.
   - Si el commit del grafo es anterior al HEAD actual, **avisar** que el grafo puede
     estar desactualizado y sugerir `graphify . --update`.

4. **NUNCA inventar un mapa si Graphify no está disponible.** 
   Si no hay grafo, leer los archivos normalmente.

### D. Delegación (HARD GATE — el orchestrator NO hace todo solo)

El orchestrator (`gentle-orchestrator`) es un **coordinador**, no un ejecutor monolítico.
Debe delegar trabajo real a subagentes especializados y reservarse solo la síntesis,
la verificación, las decisiones de alto nivel y la interacción con el usuario.

**Mapa de delegación (no negociable):**

| Tipo de tarea | Subagente | Herramienta | Cuándo |
|---|---|---|---|
| Leer 4+ archivos para entender | `explore` | `delegate` | Siempre que requiera exploración |
| Investigación externa / docs | `researcher` | `delegate` | Web, API docs, librerías |
| Diseño técnico / arquitectura | `sdd-design-ops` | `task` | Cambios con decisiones de diseño |
| Especificación detallada | `sdd-spec-ops` | `task` | Requisitos formales |
| Implementación de código | `sdd-apply-ops` | `task` | Cualquier cambio multi-archivo |
| Verificación post-implementación | `sdd-verify-ops` | `task` | Después de cada cambio de código |
| Documentación / bitácoras | `scribe` | `delegate` | README, changelog, bitácora |

**El orchestrator SÍ puede hacer inline (sin delegar):**
- Leer 1-3 archivos para decidir o verificar
- Escribir un archivo mecánico (ya sabe exactamente qué)
- Bash para estado (`git status`, `pwd`, `docker ps`)
- Sintetizar resultados de subagentes
- Preguntar al usuario y esperar respuesta

**El orchestrator NO debe hacer inline:**
- Leer 4+ archivos para "entender el código"
- Escribir features multi-archivo
- Correr `npm test`, `npm run build`, `npm install`
- Investigar APIs o documentación externa
- Editar archivos como preparación para más ediciones (delegar todo junto)

**Protocolo previo a cada acción grande:**
1. El orchestrator analiza la tarea y determina qué subagente(s) necesita.
2. **Antes de delegar**, dice explícitamente: _"Voy a delegar X a [subagente] porque [motivo]."_
3. Recibe el resultado y lo sintetiza para el usuario.
4. Si la tarea tocó código, **obligatorio** correr `sdd-verify-ops` después.
5. Si la tarea tocó docs, **obligatorio** revisar con `scribe`.

**Regla de economía:**
- Delegar cuando ahorre tokens, aporte especialización o separe concerns.
- NO delegar tareas triviales (1 archivo, cambio mecánico conocido).
- Si la tarea cabe en 1-3 lecturas + 1 escritura atómica, hacerla inline y explicar por qué no se delegó.

## Reglas de territorio

- `src/app/**` — páginas públicas y layouts
- `src/lib/content/**` — capa de datos async (getters)
- `src/mocks/**` — datos mock (temporales, reemplazados por Payload en Fase 3)
- `src/collections/**` — colecciones de Payload CMS (Fase 3)
- `src/i18n/**` — routing y mensajes next-intl
- `src/test/**` — tests
- `_scratch/**` — solo Gemini CLI (relevamiento, no código)
- `.atl/**` — skill registry y artefactos de configuración
- `graphify-out/**` — grafo de conocimiento (no editar a mano)

## Acceso a Plane (MANDATORY)

Los agentes acceden a Plane **siempre** a través de los scripts del repo:

```bash
npm run plane:check              # verificar acceso
tsx scripts/plane-check.ts       # idem, directo
tsx scripts/plane-query.ts [args]
tsx scripts/plane-list.ts [args]
tsx scripts/plane-backup.ts
```

**Cómo llegan las vars al script (orden de prioridad):**

1. `process.env` (si el runner las inyecta directamente)
2. `.env.local` en la raíz del worktree (accesible para agentes no-sandbox)
3. `.plane-config` en la raíz del worktree (fallback para el sandbox Codex)

El sandbox Codex (usuario `CodexSandboxOnline`, perfil `gentle-dev`) deniega la lectura
de `**/.env.local` pero NO deniega `.plane-config`. Sebastián mantiene `.plane-config`
en cada worktree de Codex con las 3 vars. El archivo está en `.gitignore` — no se versiona.

**Mover una card de estado (PATCH):**

```bash
# 1. Obtener el ID de la card y el ID del estado destino
tsx scripts/plane-check.ts --list-states        # lista todos los estados con sus UUIDs
tsx scripts/plane-query.ts --label agent:X      # lista cards con su UUID en el campo (id)

# 2. Aplicar el cambio
tsx scripts/plane-check.ts --update-state <issue-uuid> <state-uuid>
```

IDs de estado del proyecto (estables):
| Estado | UUID |
|---|---|
| Ready for Dev | `b4346a4c-9897-4bd9-8580-0474a6ac9c3e` |
| In Dev | `3acb214d-d8da-446a-825b-76770a383f88` |
| Ready for QA | `e13846f7-31c3-4689-b29a-81d43f10c71e` |
| QA | `2ed82130-d06d-4fa1-96ba-1b30def0a45d` |
| Ready for Docs | `3a2e23f4-c474-46db-aed4-b35b3d9a1aba` |
| Docs | `b1237dbb-3226-44b0-aa41-a15dd30c5c2d` |
| Done | `a6664753-a901-45ad-b35e-9653b81667fa` |
| Blocked | `4e22574f-d73d-4d9e-9a38-8db987dd9e20` |

**Si un script Plane falla con `❌ Missing Plane env vars`:**
1. NO pedir la key al humano
2. NO hardcodear la key en ningún archivo
3. Verificar que `.plane-config` existe en la raíz del worktree
4. Si falta, escalar a Sebastián (tarea de infra — él recrea el archivo)

**Nunca hardcodear la key. Nunca pedirla por chat. Nunca guardarla en código versionado.**

## Compuerta de avance a Ready for QA (HARD GATE)

**La rama DEBE estar en origin antes de mover la card a Ready for QA.**

Protocolo obligatorio al terminar implementación:

```bash
git push origin <rama>   # 1. push
# si exit code = 0 → mover card a Ready for QA
# si exit code != 0 → card queda en In Dev, reportar el fallo, NO avanzar
```

Verificar que el push llegó:
```bash
git ls-remote origin refs/heads/<rama>   # debe devolver el SHA del commit
```

**Razón:** Chano audita desde GitHub. Si la rama no está en origin, no puede ver el
código — la compuerta verde local es irrelevante. Un push fallido silencioso seguido
de un avance de estado rompe el flujo de auditoría completo.

**Si el push falla:** dejar la card en In Dev, agregar comentario con el error exacto
del push, escalar a Sebastián. No avanzar de estado bajo ninguna circunstancia.

## Reglas no negociables

1. Nunca commitear en `main` directo. `main` es sagrada (solo releases).
2. `develop` es la rama de trabajo diario.
3. Una tarea por vez. No mezclar cambios de distintas tareas.
4. Verificar con `npm test`, `npm run typecheck`, `npm run build` antes de cerrar.
5. No tocar archivos fuera del territorio asignado.
6. Si el build falla, resolver dentro del alcance. Si requiere tocar fuera del
   alcance, frenar y preguntar.
