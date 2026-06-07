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

### D. Después del mapa, proceder con la tarea

Solo después de completar A → B → C, empezar a tocar archivos.

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

## Reglas no negociables

1. Nunca commitear en `main` directo. `main` es sagrada (solo releases).
2. `develop` es la rama de trabajo diario.
3. Una tarea por vez. No mezclar cambios de distintas tareas.
4. Verificar con `npm test`, `npm run typecheck`, `npm run build` antes de cerrar.
5. No tocar archivos fuera del territorio asignado.
6. Si el build falla, resolver dentro del alcance. Si requiere tocar fuera del
   alcance, frenar y preguntar.
