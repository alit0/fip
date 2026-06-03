# Phase 6 — Juror Scoring Module — Preliminary Technical Spec

**Rama:** `feat/codex-jurados-spec`  
**Fecha:** 2026-06-03  
**Autor:** Codex (infra + QA + seguridad)  
**Audiencia:** tech lead y Claude Code (constructor del core)  
**Propósito:** documentar lo que se sabe del sistema de votación de jurados para
planificar la Fase 6 antes de escribir una línea de código. No es un diseño
técnico — es un mapa de requisitos, reglas de negocio e incógnitas.

**Regla cumplida:** no se modificó `src/`, no se tocaron páginas, no se tocó
`package.json`.

---

## Tabla de contenidos

1. [Fuentes](#1-fuentes)
2. [Qué dice el Reglamento (sección K)](#2-qué-dice-el-reglamento-sección-k)
3. [Entidades del módulo de scoring](#3-entidades-del-módulo-de-scoring)
4. [Reglas de negocio](#4-reglas-de-negocio)
5. [Flujo de trabajo del jurado](#5-flujo-de-trabajo-del-jurado)
6. [Roles y permisos](#6-roles-y-permisos)
7. [Validaciones](#7-validaciones)
8. [Casos borde](#8-casos-borde)
9. [Segunda fase: Comité Ejecutivo](#9-segunda-fase-comité-ejecutivo)
10. [Qué NO es este módulo](#10-qué-no-es-este-módulo)
11. [Incógnitas — cosas que hay que confirmar con el cliente](#11-incógnitas--cosas-que-hay-que-confirmar-con-el-cliente)
12. [Hoja de ruta sugerida para el épico](#12-hoja-de-ruta-sugerida-para-el-épico)

---

## 1. Fuentes

| Fuente | Tipo | Qué aporta |
|--------|------|-----------|
| Reglamento FIP, sección K — sitio en vivo | Primaria, pública | Reglas del juzgamiento, fases, criterios, tabla de puntajes, irrevocabilidad |
| `Auditoria_FIP_Festival.docx`, sección 12.2 | Secundaria, interna | Resumen funcional del login y scoring; confirma que el sistema actual no es visible |
| `ROADMAP.md`, Hito 6 | Secundaria, interna | Reparto de trabajo entre agentes para Fase 6 |
| `ORQUESTACION-AGENTES.md` | Secundaria, interna | Territorio de Codex (tests críticos del scoring) |

---

## 2. Qué dice el Reglamento (sección K)

### K.1 — Primera Fase (jurados internacionales)

- ~70 jurados (o más), profesionales de habla hispana y portuguesa.
- Se integran en **equipos**.
- Reciben **grupos de campañas asignados**.
- Puntúan según **cuatro conceptos**:
  1. **Estrategia**
  2. **Originalidad de la Idea**
  3. **Implementación**
  4. **Alcance estimado de la Propuesta**
- **Sin decimales.**
- Deben **abstenerse de juzgar campañas de su propia agencia**.
- Deben completar **todas las campañas asignadas** y entregar planillas con la
  sumatoria de puntajes totales.
- La observación del video adicional **no es obligatoria**.
- Compromiso de **confidencialidad** de los fallos.
- Si un jurado **omite calificar categorías completas**, el Comité Ejecutivo
  decide si sus votos restantes son válidos y lo puede dar de baja como jurado.

### K.2 — Segunda Fase (Comité Ejecutivo)

- Los 5 miembros del Comité Ejecutivo observan en Buenos Aires las campañas que
  alcanzaron puntaje de finalista.
- Avalan la adjudicación de premios (Platino, Oro, Plata, Bronce, Finalista).
- Validan los Grand Prix especiales y los 12 Grandes Premios.
- Certifican puntajes de "Agencia del Año".

### K.3 — Irrevocabilidad y confidencialidad

- Los votos son **inapelables e irrevocables**.
- Excepciones donde el Comité Ejecutivo **puede impugnar**:
  - Error.
  - No abstención de juzgar campaña propia.
  - Calificaciones incompletas.
- Los votos son **confidenciales**: el FIP no informa puntajes ni posiciones a
  participantes ni asociaciones.

### K.4 — Atribuciones y límites

- Los jurados **no pueden cambiar una campaña de categoría**. Es atribución
  exclusiva del organizador.
- No se puede recategorizar mientras el jurado está trabajando.
- Discrepancias entre jurados → resuelve el Comité Ejecutivo.
- Controversia muy acentuada → define el Presidente del Festival.

### Tabla de puntajes (para premios, inferida de K.3 y sección F)

| Premio | Puntos |
|--------|--------|
| Gran Prix | 12 |
| Oro | 10 |
| Plata | 6 |
| Bronce | 4 |
| Finalista | 1 |

> ⚠️ Esta tabla aplica a la **conversión de puntajes de scoring a premios**, no
> necesariamente a la escala que usan los jurados para puntuar campañas
> individuales. Ver incógnitas abajo.

---

## 3. Entidades del módulo de scoring

### 3.1 `Juror` (Jurado)

Un profesional invitado a juzgar. Autenticado, con rol `juror`.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | |
| `name` | string | Nombre completo |
| `email` | string | Para login y notificaciones |
| `agencyId` | FK → Agency | Agencia a la que pertenece (para la regla de exclusión) |
| `year` | FK → Edition | Edición del festival en la que juzga |
| `status` | enum: `active`, `inactive`, `removed` | Para dar de baja si omite categorías |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

### 3.2 `JuryTeam` (Equipo de jurados)

Agrupación de jurados. El Reglamento dice "se integrarán en equipos".

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | |
| `name` | string | Nombre o identificador del equipo |
| `year` | FK → Edition | |
| `members` | FK[] → Juror | Jurados que integran el equipo |

### 3.3 `Campaign` (Campaña)

La pieza inscripta que se juzga. Viene del módulo de Agencias (Fase 5).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | |
| `title` | string | Nombre de la campaña |
| `agencyId` | FK → Agency | Agencia que la inscribió |
| `categoryId` | FK → Category | Categoría en la que compite |
| `year` | FK → Edition | |
| `materials` | array | Videos, PDFs, imágenes de la presentación |
| `optionalVideo` | file? | Video adicional (no obligatorio para el jurado) |
| `status` | enum | `submitted`, `under_review`, `finalist`, `awarded`, etc. |

### 3.4 `CampaignAssignment` (Asignación de campaña a jurado)

El corazón del reparto. Conecta un jurado (o equipo) con las campañas que debe
evaluar, **excluyendo las de su propia agencia**.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | |
| `jurorId` | FK → Juror | |
| `campaignId` | FK → Campaign | |
| `teamId` | FK → JuryTeam? | Si la asignación es por equipo |
| `assignedAt` | datetime | Cuándo se asignó |
| `deadline` | datetime? | Si hay fecha límite por lote |

### 3.5 `Score` (Voto / Puntuación)

El voto individual de un jurado sobre una campaña. **Un jurado emite exactamente
un voto por campaña asignada.**

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | |
| `jurorId` | FK → Juror | |
| `campaignId` | FK → Campaign | |
| `assignmentId` | FK → CampaignAssignment | Trazabilidad |
| `criteria` | JSON | `{ estrategia: int, originalidad: int, implementacion: int, alcance: int }` |
| `total` | int | Suma automática de los 4 criterios (calculado, no ingresado) |
| `status` | enum: `draft`, `submitted`, `locked`, `impugned` | |
| `submittedAt` | datetime | |
| `lockedAt` | datetime | |
| `impugnedAt` | datetime? | |
| `impugnedBy` | FK → User? | Quién del Comité Ejecutivo impugnó |
| `impugnationReason` | string? | |

### 3.6 `ExecutiveReview` (Revisión del Comité Ejecutivo)

Registro de auditoría de las decisiones del Comité en Fase 2.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | |
| `scoreId` | FK → Score | Voto revisado |
| `reviewerId` | FK → User | Miembro del Comité |
| `action` | enum: `validated`, `impugned`, `reopened` | |
| `reason` | string | |
| `createdAt` | datetime | |

---

## 4. Reglas de negocio

### RB-01 — Exclusión de campaña propia

> Un jurado **nunca** recibe ni puede puntuar campañas de su propia agencia.

**Fuente:** Reglamento K.1, punto 2º. Auditoría 12.2.

**Implementación:** el algoritmo de asignación (`CampaignAssignment`) debe
filtrar `campaign.agencyId !== juror.agencyId`. Si un jurado cambia de agencia
durante el proceso, las asignaciones existentes deben revalidarse.

### RB-02 — Cuatro criterios, sin decimales

> Cada voto contiene exactamente 4 puntuaciones enteras. No se admiten
> decimales.

**Fuente:** Reglamento K.1, puntos 3º y Tabla. Auditoría 12.2.

**Implementación:** validación en frontend (input `type="number" step="1"`) y
backend (validación de enteros, sin floats). El rango exacto de cada criterio es
una incógnita (ver §11).

### RB-03 — Total automático

> El total es la suma de los 4 criterios. El jurado no ingresa el total
> manualmente.

**Fuente:** Reglamento K.1, punto 4º ("entregar las planillas completas incluida
la sumatoria de puntajes totales"). Auditoría 12.2 ("total automático").

**Implementación:** `score.total = criteria.estrategia + criteria.originalidad +
criteria.implementacion + criteria.alcance`. Calculado en backend, nunca
confiado del frontend.

### RB-04 — Voto completo obligatorio

> Un voto no se puede enviar si falta algún criterio.

**Fuente:** Reglamento K.1 (debe completar todas las campañas asignadas). K.3
(calificaciones incompletas = causal de impugnación).

**Implementación:** validación `all criteria fields are non-null integers` antes
de permitir `status: draft → submitted`.

### RB-05 — Confidencialidad e irrevocabilidad

> Una vez enviado y confirmado, el voto queda bloqueado (`locked`). No se puede
> editar ni eliminar. Es confidencial: ningún participante, agencia ni otro
> jurado ve los puntajes.

**Fuente:** Reglamento K.1 (confidencialidad), K.3 (inapelables e irrevocables).

**Implementación:** transición `submitted → locked` disparada por acción
explícita del jurado (confirmación final). Solo el Comité Ejecutivo puede
impugnar (`locked → impugned`). API de scoring no expone puntajes a roles que no
sean `juror` (el propio) o `admin`/`executive`.

### RB-06 — Comité Ejecutivo puede impugnar

> En casos de error, voto a campaña propia, o calificaciones incompletas, el
> Comité Ejecutivo puede impugnar votos.

**Fuente:** Reglamento K.3.

**Implementación:** endpoint restringido a rol `executive`: `POST
/scores/:id/impugn` con motivo. Impugnar no es borrar — el registro queda con
`status: impugned` y trazabilidad.

### RB-07 — Jurado que omite categorías completas

> Si un jurado no califica categorías enteras, el Comité Ejecutivo decide la
> validez de sus votos restantes y puede darlo de baja.

**Fuente:** Reglamento K.1, nota al pie (*).

**Implementación:** reporte de completitud para el Comité: `jurorId → categorías
asignadas vs. categorías con votos submitted`. Dashboard o query que permita
detectar omisiones.

### RB-08 — No recategorizar durante juzgamiento

> Un jurado no puede cambiar la categoría de una campaña. El organizador no
> puede recategorizar mientras el jurado está trabajando.

**Fuente:** Reglamento K.4.

**Implementación:** si hay un proceso de recategorización, debe ocurrir antes de
que se generen las asignaciones (`CampaignAssignment`). Una vez que existen
asignaciones, `categoryId` de `Campaign` se considera inmutable hasta que el
juzgamiento termine.

### RB-09 — Video adicional opcional

> La observación y calificación del video adicional no es obligatoria.

**Fuente:** Reglamento K.1.

**Implementación:** el scoring no debe bloquearse si el jurado no miró el video
opcional. Es solo material de apoyo.

---

## 5. Flujo de trabajo del jurado

```
1. LOGIN
   Jurado se autentica con credenciales (email + password o magic link).
   └─ Redirige al dashboard de jurado.

2. DASHBOARD
   Ve sus equipos, categorías asignadas, progreso general.
   └─ "Campañas pendientes: 12/20", "Votos enviados: 8/20".

3. LISTADO DE CAMPAÑAS
   Ve las campañas asignadas, filtradas por categoría/equipo.
   Cada campaña muestra: título, agencia (sin mostrar que es propia — directamente
   no aparece si es propia), categoría, estado del voto (pendiente / en progreso /
   enviado).

4. PANTALLA DE SCORING
   └─ Material de la campaña (video principal, imágenes, PDFs).
   └─ Video adicional opcional.
   └─ Formulario con 4 campos numéricos enteros:
        [Estrategia] [Originalidad] [Implementación] [Alcance]
   └─ Total calculado automáticamente (solo lectura).
   └─ Botón "Guardar borrador" (draft).
   └─ Botón "Enviar y confirmar" (submitted → locked).

5. CONFIRMACIÓN
   └─ Diálogo: "Una vez confirmado, el voto es irrevocable. ¿Estás seguro?"
   └─ Si confirma: voto pasa a submitted y luego a locked.
   └─ Ya no puede editarse.

6. FINALIZACIÓN
   Cuando todos los votos están locked, el jurado completó su trabajo.
   El sistema notifica al Comité Ejecutivo.
```

---

## 6. Roles y permisos

| Rol | Puede |
|-----|-------|
| `juror` | Ver sus campañas asignadas, puntuar, guardar borrador, enviar/confirmar votos. Ver sus propios puntajes. **No** ve puntajes de otros jurados. |
| `executive` | Ver todos los puntajes, reportes de completitud, impugnar votos, dar de baja jurados. Validar finalistas y premios. |
| `admin` | Gestionar jurados, equipos, asignaciones. Acceso full al sistema. |
| `agency` | **No** tiene acceso al módulo de scoring. |
| `public` | **No** tiene acceso al módulo de scoring. |

---

## 7. Validaciones

### Frontend (UX)

| Validación | Regla |
|-----------|-------|
| Enteros sin decimales | `step="1"`, `pattern="[0-9]*"`, inputmode `numeric` |
| No vacío | Los 4 campos son requeridos para enviar |
| No negativos | `min="0"` (si el rango empieza en 0, ver incógnitas) |
| Total es solo lectura | No editable, calculado en tiempo real |
| Confirmación antes de enviar | Diálogo modal irrevocable |
| Campaña propia | Ni siquiera aparece en la lista del jurado |

### Backend (seguridad)

| Validación | Regla |
|-----------|-------|
| Autenticación | Sesión server-side o JWT con rol `juror` |
| Ownership | Un jurado solo puede votar campañas de sus `CampaignAssignment` |
| No revotar | Unique constraint `(jurorId, campaignId)` en `Score` |
| Enteros | `Number.isInteger()` en cada criterio |
| Rango | Validar min/max por criterio (depende de incógnita) |
| No editar locked | `score.status === 'locked'` → 403 |
| Exclusión agencia propia | Validación adicional en backend (defensa en profundidad) |
| Rate limiting | Endpoints de scoring con rate limit (anti-brute force, anti-bot) |

---

## 8. Casos borde

| # | Caso | Comportamiento esperado |
|---|------|------------------------|
| CB-01 | Jurado intenta votar campaña no asignada | 403 Forbidden |
| CB-02 | Jurado intenta votar dos veces la misma campaña | 409 Conflict (unique constraint) |
| CB-03 | Jurado envía voto con un criterio faltante | 422 Unprocessable — rechazar con error descriptivo |
| CB-04 | Jurado ingresa decimal (ej. 7.5) | 422 — "Los puntajes deben ser números enteros" |
| CB-05 | Jurado ingresa valor negativo | 422 — "El puntaje no puede ser negativo" |
| CB-06 | Jurado cambia de agencia después de tener asignaciones | Las asignaciones existentes se revalidan; las que ahora son de su nueva agencia se revocan o marcan para revisión del Comité. |
| CB-07 | Campaña es recategorizada después de que un jurado ya la votó | Según K.4, no debería pasar. Si pasa por error administrativo: el voto existente se marca para revisión del Comité. |
| CB-08 | Jurado abandona sin completar (no vuelve a loguearse) | El Comité Ejecutivo ve el reporte de incompletitud y decide (K.1). |
| CB-09 | Video opcional no disponible (link roto, archivo faltante) | No bloquea el scoring. |
| CB-10 | Dos jurados puntúan con puntajes muy divergentes | No se bloquea automáticamente. En Fase 2, el Comité Ejecutivo revisa discrepancias (K.4). |
| CB-11 | Jurado quiere editar un voto ya enviado | Bloqueado. Solo el Comité Ejecutivo puede impugnar/reabrir. |
| CB-12 | Deadline de juzgamiento vencido | Los votos en `draft` no se envían automáticamente. El Comité decide si aceptarlos fuera de plazo. |

---

## 9. Segunda fase: Comité Ejecutivo

Módulo separado dentro del mismo épico, pero con alcance más acotado:

- **Dashboard del Comité**: acceso a todos los puntajes, agrupados por categoría.
- **Reporte de finalistas**: campañas que alcanzan el umbral de puntaje (el
  umbral exacto es incógnita).
- **Validación de premios**: el Comité asigna Oro/Plata/Bronce/Finalista basado
  en los puntajes y su criterio.
- **Impugnación de votos**: interfaz para que un miembro del Comité impugne un
  voto con motivo.
- **Auditoría de "Agencia del Año"**: suma de puntajes por agencia, según reglas
  de la sección R del Reglamento.

---

## 10. Qué NO es este módulo

- **No es** el login de agencias ni el wizard de carga de campañas (Fase 5).
- **No es** el CMS público ni las collections de Payload (Fase 3).
- **No es** la pantalla pública de "Jurados [year]" (es página pública de Fase
  2, territorio de Claude Code).
- **No es** el sistema de inscripciones ni pagos.
- **No es** la generación automática de diplomas o certificados (posible
  extensión futura).

---

## 11. Incógnitas — cosas que hay que confirmar con el cliente

### Scoring

| # | Incógnita | Impacto |
|---|-----------|---------|
| I-01 | **Rango de puntuación por criterio.** ¿0–10? ¿1–10? ¿0–100? ¿1–5? | Determina las validaciones de frontend y backend. Crítico. |
| I-02 | **¿Todos los criterios tienen el mismo peso?** ¿O hay criterios que pesan más? El Reglamento no menciona ponderación. | Si hay pesos, el total no es una simple suma. |
| I-03 | **¿Los jurados pueden guardar borrador y seguir después?** El Reglamento habla de "entregar planillas completas". | Determina si existe el estado `draft` o si el flujo es "todo de una vez". |
| I-04 | **¿La confirmación es voto por voto o por lote?** ¿El jurado confirma campaña por campaña, o todas juntas al final? | Define la UX de envío. |
| I-05 | **¿Hay fecha límite por jurado/equipo?** El Reglamento menciona "plazo lógico". | Define si hay deadlines automáticos y recordatorios. |
| I-06 | **Rango exacto para determinar finalistas.** ¿Cuántos puntos necesita una campaña para ser finalista? | Determina el algoritmo de la Fase 2. |

### Asignación

| # | Incógnita | Impacto |
|---|-----------|---------|
| I-07 | **¿Cómo se asignan las campañas a los jurados/equipos?** ¿Manual (Excel → CSV), automático (algoritmo), o mixto? | Define si necesitamos una UI de asignación o un importador. |
| I-08 | **¿Qué es exactamente un "equipo"?** ¿Comparten las mismas campañas? ¿Votan independientemente o discuten y emiten un voto conjunto? | Crítico para el modelo de datos. |
| I-09 | **¿Un jurado puede estar en más de un equipo?** | Afecta la UI de asignación y el dashboard. |
| I-10 | **¿Cuántas campañas por jurado es "un número prudente" (K.1)?** | Determina la carga por jurado y el dimensionamiento. |

### Sistema actual

| # | Incógnita | Impacto |
|---|-----------|---------|
| I-11 | **¿Cómo funciona el sistema de votación actual?** No es visible públicamente. | Saber si migramos datos históricos o empezamos de cero. |
| I-12 | **¿Hay datos históricos de votos que migrar?** ¿Se necesita compatibilidad hacia atrás? | Determina si hay migración de datos. |
| I-13 | **¿El sistema actual tiene funcionalidades que no están en el Reglamento?** (ej. comentarios del jurado, ranking en tiempo real, notificaciones) | Puede revelar requisitos ocultos. |

### UX y reporting

| # | Incógnita | Impacto |
|---|-----------|---------|
| I-14 | **¿Los jurados necesitan UI multilingüe (español/portugués)?** | Define alcance de i18n en el área privada. |
| I-15 | **¿Qué reportes necesita el Comité Ejecutivo?** ¿Solo completitud? ¿Rankings? ¿Distribución de puntajes? | Define el alcance del dashboard del Comité. |
| I-16 | **¿Los puntajes históricos se conservan después de la premiación?** ¿O se anonimizan/archivan? | Define políticas de retención de datos. |
| I-17 | **¿Se notifica a los jurados por email?** (asignación lista, recordatorio de deadline, confirmación de recepción) | Define integración con sistema de email. |

### Premios y puntajes

| # | Incógnita | Impacto |
|---|-----------|---------|
| I-18 | **¿"Platino" (K.2) es un premio separado o sinónimo de "Oro"?** El Reglamento menciona Platino en K.2 pero no en la tabla de puntajes. | Determina si hay 4 o 5 niveles de premio. |
| I-19 | **¿El puntaje total del jurado determina directamente el premio, o es solo input para el Comité?** | Define si el sistema asigna premios automáticamente o solo calcula rankings para revisión humana. |

---

## 12. Hoja de ruta sugerida para el épico

Cuando llegue la Fase 6, el épico se puede partir en estos entregables:

### E1 — Modelo de datos y auth

- Entidades: `Juror`, `JuryTeam`, `CampaignAssignment`, `Score`, `ExecutiveReview`.
- Auth con rol `juror` (reusa patrón de Fase 5).
- Middleware de autorización por rol.
- **Codex** escribe tests de integración para auth + permisos.

### E2 — Asignación de campañas

- UI/API para que el admin asigne campañas a jurados/equipos.
- Algoritmo de exclusión de campaña propia (RB-01).
- Importador CSV si el cliente lo usa actualmente (a confirmar).
- **Codex** escribe tests de asignación (exclusión, duplicados, cambios de agencia).

### E3 — Pantalla de scoring

- **Claude Code** construye la UI de scoring (lista de campañas + formulario de 4 criterios + total automático).
- Estados: borrador → enviado → bloqueado.
- **Codex** escribe tests del scoring (validaciones, enteros, total automático, irrevocabilidad).

### E4 — Dashboard del Comité Ejecutivo

- Reportes de completitud, rankings por categoría, detalle de puntajes.
- Funcionalidad de impugnación de votos.
- Validación de finalistas y premios.
- **Codex** escribe tests de integración del flujo completo (voto → impugnación → premio).

---

> **Fin del documento.** La Fase 6 solo se ejecuta después de contestar las
> incógnitas de §11 y recibir la aprobación del tech lead.