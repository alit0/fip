# System Overview — Modelo de Agentes (FIP Festival)

> Este documento es el punto de entrada principal para entender cómo opera el equipo de agentes en el proyecto FIP Festival. Consolida la información dispersa en otros documentos técnicos y define el flujo de trabajo vigente.

## 1. El Equipo de 5 Agentes

El desarrollo se organiza en torno a 5 agentes con roles especializados. Cada agente opera en su propio **worktree** (una carpeta física separada bajo `C:/agents/`) para evitar conflictos de archivos.

| Agente | Rol | Responsabilidades | Carpeta Worktree |
| :--- | :--- | :--- | :--- |
| **Cloe** | Core / UI | Maquetado, componentes y lógica en `src/app`. | `fip-cloe/` |
| **Gepeto** | Infra / QA | Seguridad, base de datos, config y tests de integración. | `fip-gepeto/` |
| **Geni** | Relevamiento | Investigación y documentación de contenido en `_scratch/`. | `fip-geni/` |
| **Chano** | Audit / Merge | QA, auditoría de código y merge de ramas a `develop`. | `fip-chano/` |
| **Opi** | Docs | Gestión de documentación y cierre formal de tareas. | `fip-opi/` |

---

## 2. Plane: La Fuente de Verdad

**Plane** es el tablero donde vive el estado de cada tarea (card). Ningún trabajo se inicia sin una card asignada.

### Flujo de Estados de una Card

1.  **Backlog**: Tarea pendiente de priorización.
2.  **Ready for Dev**: Tarea lista para que un implementador la tome.
3.  **In Dev**: El agente está trabajando activamente en la card.
4.  **Ready for QA**: El implementador terminó, pasó las compuertas y pusheó la rama.
5.  **QA**: **Chano** audita el código y corre las pruebas.
6.  **Ready for Docs**: Código aprobado y mergeado a `develop`. **Opi** debe documentar/cerrar.
7.  **Docs**: En proceso de documentación final.
8.  **Done**: Tarea finalizada y cerrada.

---

## 3. Protocolo de Desarrollo (Git Workflow)

### Ramas y Commits
- **Ramas**: Una rama por card, sacada de `develop`. Nombre: `feat/<CARD-ID>-<slug-corto>`.
- **Commits**: Todo commit debe empezar con el ID de la card. Ejemplo: `AGENTESOPE-68: crea SYSTEM-OVERVIEW.md`.
- **Merge**: Solo **Chano** mergea a `develop` tras aprobar el QA. `main` es sagrada y solo recibe releases del Tech Lead.

### Compuertas de Verificación (MANDATORIAS)
Antes de mover una card a *Ready for QA*, el implementador DEBE asegurar que estos comandos pasen en verde en su worktree:
```bash
npm run build && npm run typecheck && npm test
```

### Reglas de Handoff y Evidencia
- Al mover una card de estado, el agente debe dejar un **comentario en Plane** con la evidencia de lo realizado (logs de tests, capturas si aplica, o resumen técnico).
- **Regla de Stale-Blocker**: Al cerrar cada card, el agente debe verificar si el cambio introdujo alguna inconsistencia o si requiere actualizar dependencias de otros documentos.

---

## 4. Documentación y Memoria

### Jerarquía de Documentos
- **Vigentes**: `SYSTEM-OVERVIEW.md`, `docs/MANUAL-DE-OPERACION.md`, `GIT-WORKFLOW.md`, `AGENTS.md`, `README.md`.
- **Patrones y Guías**: `docs/PATRON-AUTH.md` (seguridad), `docs/DOCS-PLACEHOLDERS.md` (limpieza).
- **Legados**: Ubicados en `docs/legacy/` (`ROADMAP.md`, `ORQUESTACION-AGENTES.md`). (Consultar solo como referencia histórica).

### Engram
Se utiliza **Engram** como memoria persistente entre sesiones. Los agentes deben consultar y guardar hallazgos críticos para mantener la continuidad del equipo.

---

## 5. Glosario Rápido
- **Worktree**: Carpeta independiente que permite trabajar en varias ramas del mismo repo a la vez.
- **Compuerta**: Conjunto de validaciones automáticas que garantizan la salud del código.
- **Ready for QA**: Estado que indica que el código está listo para ser auditado por otro agente.
