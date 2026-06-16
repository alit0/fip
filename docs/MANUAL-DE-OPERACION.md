# Manual de operación — Réplica web FIP Festival

> Cómo trabajamos en este proyecto: el método, el equipo de 5 agentes, los protocolos
> de git y testing, y las lecciones aprendidas en la práctica.
> Este documento es el **cómo trabajamos**. La [BITACORA](../BITACORA-V1.md) es el
> **estado**; el [ROADMAP](./legacy/ROADMAP.md) es el **camino**; el
> [SYSTEM-OVERVIEW.md](./SYSTEM-OVERVIEW.md) es la **visión general**.

## Tabla de contenidos

- [Resumen del proyecto](#resumen-del-proyecto)
- [El equipo de 5 agentes](#el-equipo-de-5-agentes)
- [El método base (no negociable)](#el-método-base-no-negociable)
- [Flujo de trabajo con Plane](#flujo-de-trabajo-con-plane)
- [Protocolo de git con worktrees](#protocolo-de-git-con-worktrees)
- [Protocolo de testing](#protocolo-de-testing)
- [Lecciones aprendidas (errores reales y su fix)](#lecciones-aprendidas-errores-reales-y-su-fix)
- [Recetas rápidas (troubleshooting)](#recetas-rápidas-troubleshooting)
- [See Also](#see-also)

---

## Resumen del proyecto

Réplica completa del sitio del FIP Festival (festival iberoamericano de marketing,
promociones y eventos), migrándolo de PHP plano a **Next.js 15 + Payload CMS**, con
sitio público, CMS editable, i18n es/pt y dos áreas privadas (Agencias y Jurados).

El trabajo es impulsado por un equipo de 5 agentes especializados, coordinados por
un Tech Lead (humano). El método prioriza **control, verificación y pasos chicos**.

---

## El equipo de 5 agentes

| Agente | Rol | Territorio | Responsabilidades |
| :--- | :--- | :--- | :--- |
| **Cloe** | Core / UI | `src/app`, `src/components`, `src/mocks` | Páginas, componentes, maquetado y lógica de negocio. |
| **Gepeto** | Infra / QA | `src/lib`, config, `middleware.ts`, DB | Seguridad, base de datos, configuración y tests de integración. |
| **Geni** | Relevamiento | `_scratch/`, `docs/` | Investigación, scraping, documentación y relevamiento de contenido. |
| **Chano** | Audit / Merge | QA / Auditoría | Revisión de código, ejecución de pruebas y merge a `develop`. |
| **Opi** | Docs | Gestión de Docs | Cierre formal de tareas, actualización de manuales y guías. |

---

## El método base (no negociable)

1.  **Una card por vez por agente.** Revisar antes de aprobar.
2.  **Regla de fuentes**: Cuando el sitio en vivo difiere de la auditoría o un PDF, **manda el sitio en vivo**.
3.  **Revisar en el navegador antes de entregar** cualquier página, comparando contra el vivo.
4.  **Compuerta Verde obligatoria**: `npm run build && npm run typecheck && npm test`.
5.  **Commits en unidades limpias**: Una cosa por commit, siempre con el ID de la card (`AGENTESOPE-XX: mensaje`).
6.  **Flujo main + develop**: `main` es sagrada (solo releases). El trabajo vive en `develop`.
7.  **No dar por hecho lo que no se verificó en git**: Usar `git status` / `git log`.
8.  **Typos del sitio en vivo se normalizan**: Réplica prolija, no clon de errores.

---

## Flujo de trabajo con Plane

1.  **Card**: Cada tarea nace como una card en Plane.
2.  **In Dev / Docs**: El agente toma la card y la mueve a su estado activo.
3.  **Handoff de evidencia**: Al terminar, el agente deja un comentario en Plane con los resultados (logs, capturas, links).
4.  **Ready for QA**: El agente pushea su rama y mueve la card para auditoría.
5.  **QA / Audit**: **Chano** revisa el código y corre las pruebas.
6.  **Merge**: Si aprueba, **Chano** mergea a `develop` y mueve a *Ready for Docs*.

---

## Protocolo de git con worktrees

Para evitar conflictos físicos, cada agente tiene su propio espacio de trabajo.

### Estructura de Worktrees
```text
C:/agents/
  ├── fip-cloe/    (rama feat/...)
  ├── fip-gepeto/  (rama feat/...)
  ├── fip-geni/    (rama develop / feat/...)
  ├── fip-chano/   (rama develop)
  └── fip-opi/     (rama develop)
```

### Ritual de merge a develop (Solo Chano / Tech Lead)
```bash
git checkout develop
git pull
git merge feat/CARD-ID-slug
npm test          # ← Si da ROJO, NO seguir
git push          # ← Solo si los tests están en VERDE
```

---

## Protocolo de testing

-   **Smoke test por página**: Que renderice sin romper.
-   **Aserción de dato crítico**: Al menos una por página con datos sensibles (precios, fechas).
-   **Integración (Fase 3)**: Tests serios sobre las queries de Payload en `src/test/`.
-   **Regla dura**: Nunca se quita un test que funciona. El total de tests sube o se mantiene, jamás baja.

---

## Lecciones aprendidas (errores reales y su fix)

### 1. El relevamiento es insumo, no verdad
Los relevamientos iniciales pueden tener imprecisiones. La verdad final se confirma contra el sitio en vivo y el código real durante la implementación.

### 2. No bajar cobertura al "limpiar"
Evitar que los agentes eliminen tests existentes en nombre de la "limpieza". Las reglas de los agentes ahora incluyen límites explícitos sobre esto.

### 3. Mergear solo con working tree limpio
Mergeas una rama mientras otro agente escribe genera resultados falsos en los tests. El ritual de merge requiere silencio total en el repo.

### 4. La carpeta `.next` se corrompe seguido
Errores extraños de webpack suelen ser caché corrupta. Fix: `Remove-Item -Recurse -Force .next` y reiniciar el dev.

---

## Recetas rápidas (troubleshooting)

### Limpiar caché de Next.js
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Volver a la carpeta principal y rama estable
```powershell
cd C:\agents\fip-geni
git checkout develop
git pull
```

### Después de cada corrida de Gemini/Geni
```bash
git status   # ¿Dejó algo fuera de _scratch/ o docs/?
```

---

## See Also

- [BITACORA-V1.md](../BITACORA-V1.md) — Estado del proyecto.
- [SYSTEM-OVERVIEW.md](./SYSTEM-OVERVIEW.md) — Visión general del equipo.
- [GIT-WORKFLOW.md](../GIT-WORKFLOW.md) — Protocolo detallado de Git.
- [AGENTS.md](../AGENTS.md) — Protocolo de actuación para agentes.
