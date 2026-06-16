# Limpieza de Placeholders y Datos de Prueba

Este documento detalla el estado de los placeholders visuales y datos de prueba tras la ejecución de la card AGENTESOPE-49.

## Acciones Realizadas

Se han eliminado o profesionalizado los textos "TODO" que eran visibles en la interfaz de usuario o en las etiquetas de accesibilidad (`aria-label`) de los componentes.

### 1. Mock de Contenido (src/mocks/)
- **home.json**:
    - Se reemplazó `"TODO: foto del hero..."` por `"Imagen principal del festival."`.
    - Se profesionalizaron los avisos de información pendiente en las secciones de Jurados y Auspiciantes.
- **categorias.json**: Se documentó el estado de ingesta de rubros y categorías, eliminando prefijos "TODO".

### 2. Componentes UI (src/components/)
- **ImagePlaceholder.tsx**: Se mantiene como componente para indicar la ausencia de assets reales (Fase 2), pero ahora consume etiquetas descriptivas profesionales en lugar de directivas de desarrollo.
- **Hero.tsx**: Las etiquetas de imagen ahora son descriptivas.
- **AwardBadge.tsx**: Se documentó internamente el reemplazo futuro de iconos Lucide por PNGs reales, sin afectar la visibilidad en el frontend.

## Datos de Prueba (Seed)

Se verificó que los scripts de seed (`scripts/seed-*.ts`) utilicen exclusivamente datos provenientes de los mocks oficiales (`src/mocks/`).
- Los datos de prueba locales (ej: "Test Payload Sponsor") detectados durante el desarrollo no forman parte del seed oficial y deben ser limpiados manualmente de la base de datos de staging/producción si persistieran.

## Pendientes

Existen comentarios técnicos `// TODO` dentro del código fuente que corresponden a lógica pendiente para fases futuras (Fase 3: Backend, Fase 6: Scoring). Estos no son visibles para el usuario final y se mantienen como guía para el equipo de desarrollo.
