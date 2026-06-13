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

Los agentes acceden a Plane **siempre** a través de los scripts del repo — nunca asumen
que la key está en el entorno, nunca la piden al humano:

```bash
npm run plane:check              # verificar acceso
tsx scripts/plane-check.ts       # idem, directo
tsx scripts/plane-query.ts [args]
tsx scripts/plane-list.ts [args]
tsx scripts/plane-backup.ts
```

Los scripts cargan `.env.local` automáticamente (con `npm run` o con `tsx` directo).
Si un script Plane falla con `❌ Missing Plane env vars`:
1. Verificar que `.env.local` existe en el worktree: `ls .env.local`
2. Correr `npm run plane:check` para confirmar acceso
3. Si falta `.env.local`, escalar al humano — nunca hardcodear la key

**Nunca hardcodear la key. Nunca pedirla por chat. Nunca guardarla en código versionado.**

## Reglas no negociables

1. Nunca commitear en `main` directo. `main` es sagrada (solo releases).
2. `develop` es la rama de trabajo diario.
3. Una tarea por vez. No mezclar cambios de distintas tareas.
4. Verificar con `npm test`, `npm run typecheck`, `npm run build` antes de cerrar.
5. No tocar archivos fuera del territorio asignado.
6. Si el build falla, resolver dentro del alcance. Si requiere tocar fuera del
   alcance, frenar y preguntar.
