# FIP Festival — Réplica Web Moderna

Réplica integral del sitio [fipfestival.com.ar](https://www.fipfestival.com.ar/) (Festival Iberoamericano de Promociones y Eventos) utilizando una arquitectura moderna basada en **Next.js 15**, **Payload CMS 3** y **PostgreSQL 16**.

## El Equipo de Agentes

El desarrollo es impulsado por un equipo de 5 agentes especializados que operan de forma coordinada bajo la supervisión de un Tech Lead (humano).

| Agente | Rol | Responsabilidades |
| :--- | :--- | :--- |
| **Cloe** (Claude Code) | **Core / UI** | Páginas, componentes, maquetado y lógica de negocio en `src/app`. |
| **Gepeto** (Gepeto) | **Infra / QA** | Configuración, seguridad, base de datos, tests de integración y `middleware.ts`. |
| **Geni** (Gemini CLI) | **Relevamiento** | Investigación, scrapeo y documentación de contenido en `_scratch/`. |
| **Chano** (Audit / Merge) | **QA / Auditoría** | Revisión de código (QA), ejecución de pruebas y merge de ramas a `develop`. |
| **Opi** (Docs) | **Documentación** | Gestión de documentación y cierre de tareas en el estado *Ready for Docs*. |

## Flujo de Trabajo (Git + Plane)

El proyecto utiliza **Plane** como tablero de gestión de tareas (cards) y un flujo de trabajo basado en **Git Worktrees** para permitir la operación en paralelo de los agentes.

1.  **Card**: Cada tarea nace como una card en Plane.
2.  **Worktree**: Cada agente tiene su propio espacio de trabajo físico en `C:/agents/fip-<agente>/` (compartiendo el mismo repositorio).
3.  **Rama**: Una rama por card, sacada de `develop`: `feat/<CARD-ID>-<slug-corto>`.
4.  **Commits**: Todos los commits comienzan con el ID de la card: `AGENTESOPE-XX: mensaje`.
5.  **Compuerta**: Antes de entregar, el implementador verifica la "compuerta verde":
    `npm run build && npm run typecheck && npm test`
6.  **PR & QA**: La rama se pushea y la card se mueve a *Ready for QA*.
7.  **Merge**: **Chano** audita el cambio. Si aprueba, mergea a `develop` y mueve la card a *Ready for Docs* (donde **Opi** finaliza el proceso).
8.  **Main**: La rama `main` es sagrada y solo recibe releases estables del Tech Lead.

## Estado Actual: Fase 3 (CMS & Globals)

Estamos migrando el contenido estático a una gestión dinámica mediante **Payload CMS**.

-   ✅ **Backend**: PostgreSQL 16 en Docker + Payload 3 integrado.
-   ✅ **Admin**: Panel de administración funcional en `/admin`.
-   ✅ **Globals Migrados**: Sponsors, Editions, Rubros, Categories, Winners, RankingEntries, Jurors, HallOfFameMembers, DownloadFiles, PageContent y SiteConfig.
-   🔄 **En curso**: Migración de estructuras globales complejas (TarifarioGlobal, PremiosGlobal, etc.).
-   ⏳ **Próximas Fases**: Fase 4 (i18n completo), Fase 5 (Área Agencias), Fase 6 (Área Jurados).

## Cómo arrancar en local

1.  **Entorno**: Copia `.env.example` a `.env.local` y configura `DATABASE_URI`, `PAYLOAD_SECRET` y las llaves de Plane.
2.  **Base de Datos**: Levanta PostgreSQL con Docker:
    ```bash
    docker compose up -d
    ```
3.  **Instalación**:
    ```bash
    npm install --legacy-peer-deps
    ```
4.  **Desarrollo**:
    ```bash
    npm run dev
    ```
    - Sitio público: `http://localhost:3000`
    - Panel CMS: `http://localhost:3000/admin`

## Documentación de Referencia

-   `BITACORA-V1.md`: Estado técnico real y bitácora de decisiones (Fuente de Verdad).
-   `GIT-WORKFLOW.md`: Protocolo detallado de Git y ramas.
-   `AGENTS.md`: Protocolo de actuación y delegación para agentes.
-   `JURADOS-SCORING-SPEC.md`: Especificación técnica del módulo de scoring (Fase 6).

---
*Nota: Los archivos `ROADMAP.md`, `ORQUESTACION-AGENTES.md` y `MANUAL-DE-OPERACION.md` se consideran documentación legacy y no deben usarse como fuente de verdad.*
