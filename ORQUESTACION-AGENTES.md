# Guía de orquestación — Equipo de agentes FIP Festival

> Cómo trabajan los tres agentes (Claude Code, Codex/GPT-5.5, Gemini CLI) sin
> pisarse, usando git worktrees y roles diferenciados.
> Este documento es el **manual del equipo**. El [ROADMAP](./ROADMAP.md) dice
> _qué_ se construye y en qué orden; este dice _quién_ lo hace y _cómo_ conviven.

**Regla de oro de todo el sistema:** dos agentes nunca tocan el mismo archivo a la
vez. La división de roles está diseñada para que eso no pase. Si alguna vez dos
agentes necesitan el mismo archivo, ese trabajo se serializa (uno primero, el otro
después), no se paraleliza.

## Tabla de contenidos

- [El equipo y sus roles](#el-equipo-y-sus-roles)
- [El flujo de ramas: main + develop](#el-flujo-de-ramas-main--develop)
- [Por qué worktrees](#por-qué-worktrees)
- [Setup inicial de los worktrees](#setup-inicial-de-los-worktrees)
- [El ciclo de trabajo de cada tarea](#el-ciclo-de-trabajo-de-cada-tarea)
- [Quién toca qué archivos (mapa de territorios)](#quién-toca-qué-archivos-mapa-de-territorios)
- [Reglas anti-pisada](#reglas-anti-pisada)
- [Rutina de merge a develop](#rutina-de-merge-a-develop)
- [Rutina de release (develop → main)](#rutina-de-release-develop--main)
- [Qué hacer cuando hay conflicto](#qué-hacer-cuando-hay-conflicto)
- [Glosario en criollo](#glosario-en-criollo)

---

## El equipo y sus roles

Como un equipo de IT real: cada uno juega en su posición según lo que mejor hace.

| Agente | Rol | Territorio (qué toca) | Tu nivel de revisión |
|--------|-----|----------------------|----------------------|
| **Claude Code** | Constructor del core | `app/`, `components/`, `mocks/`, páginas | **Alta** — página por vez, navegador antes del commit |
| **Codex (GPT-5.5)** | Infra + QA + seguridad | config, `error.tsx`/`loading.tsx`, `src/test/`, `middleware.ts`, CI | **Media** — revisás el PR/rama antes de mergear a develop |
| **Gemini CLI** | Relevamiento e investigación | `_scratch/` SOLO (cero código) | **Baja** — leés el documento cuando lo necesitás |
| **Vos** | Tech lead | `develop` (integración) + `main` (releases, sagrada) | Sos quien aprueba todo |

### Claude Code — el constructor del producto

Es el dueño del camino crítico. Maqueta las páginas de la Fase 2, después arma las
collections de Payload (Fase 3) y las áreas privadas (Fases 5-6). Toca el código
que el usuario final ve. Tu metodología de "una página por vez, revisar en el
navegador antes de aprobar" se mantiene **acá**, intacta, porque es donde más
importa. Claude Code **commitea directo en `develop`** (no en `main`); el control es
tu revisión en el navegador **antes** del commit, con tu OK explícito.

### Codex (GPT-5.5) — infraestructura y QA

Hace lo que NO es maquetado de páginas y que vive en archivos distintos:

- **Infra:** el `.env`, los boundaries (`error.tsx`, `loading.tsx`,
  `not-found.tsx`), scripts `typecheck`/`lint`, configuración de CI.
- **QA:** los tests serios de Fase 3 en adelante (queries de `lib/content`,
  scoring de jurados). Viven en `src/test/`.
- **Seguridad:** revisión del patrón de auth cuando lleguemos a Fases 5-6
  (`middleware.ts`, gating por rol).

Codex trabaja en ramas `feat/codex-*` que **salen de `develop` y mergean a
`develop`** (nunca a `main`).

> [!IMPORTANT]
> Codex **no maqueta páginas**. Si Codex tocara `app/[locale]/(public)/...` chocaría
> con Claude Code en `lib/content/`, `types.ts` y `mocks/`. La división es por
> **tipo de archivo**, no por página.

### Gemini CLI — relevamiento

Scrapea el sitio en vivo, documenta contenido, confirma discrepancias contra la
auditoría. Ya entregó relevamientos prolijos de Premios, Jurados, Ranking y Hall de
la Fama. De **Ganadores** sólo dejó datos crudos (JSON), y 2024 y 2023 sólo existen
en PDF (sin tablas HTML scrapeables): esa página necesita un relevamiento prolijo —o
trabajar de los PDFs— antes de maquetarse. **Siempre escribe en `_scratch/`, nunca
toca código.** No necesita worktree propio.

> [!CAUTION]
> Gemini demostró interpretar sus límites con flexibilidad (en una corrida admitió
> haber generado archivos fuera de lo pedido "aunque tenía políticas restrictivas").
> Por eso: después de CADA corrida de Gemini, correr `git status` para confirmar que
> no dejó nada fuera de `_scratch/`. Confiar pero verificar.

---

## El flujo de ramas: main + develop

El proyecto trabaja con dos ramas largas. Esta es la regla que ordena todo lo demás.

| Rama | Para qué | Quién la toca |
|------|----------|---------------|
| **`main`** | **Rama SAGRADA.** Estable, publicable. Solo recibe **releases** (hitos terminados). | Solo el tech lead, y solo en un release. **Nadie commitea acá directo, jamás.** |
| **`develop`** | Rama de **integración / trabajo diario**. Acá cae TODO el trabajo. | Claude Code commitea directo; Codex mergea sus ramas `feat/*` acá; el tech lead aprueba. |

Cómo se mueve el trabajo:

```text
feat/codex-*  ──merge──▶  develop  ──release──▶  main
(Codex)                   (día a día)            (hitos publicables)
Claude Code ──commit directo──▶ develop
```

- **`main` es sagrada.** No se commitea ahí directo bajo ninguna circunstancia. Solo
  se actualiza desde `develop` cuando hay un **release**: un hito publicable. Es un
  evento especial, no el día a día.
- **`develop` es donde se vive.** Claude Code commitea directo en `develop` (con tu
  OK tras la revisión en el navegador). Codex abre ramas `feat/codex-*` desde
  `develop` y las mergea de vuelta a `develop`.
- **Nadie trabaja en `main` directo** — ni Claude Code, ni Codex, ni vos en el día a
  día. El único momento en que `main` cambia es el release (ver rutina abajo).

> [!IMPORTANT]
> Esta es la regla que reemplaza al viejo "Claude Code committea en main directo".
> Ahora es **"nadie en main directo; el trabajo vive en develop"**. Sin excepciones.

---

## Por qué worktrees

El problema físico: si los tres agentes corren en la **misma carpeta**, comparten
el mismo working tree (los archivos en disco). Solo puede haber una rama activa por
carpeta a la vez. Si un agente cambia de rama, le cambia los archivos a los otros.
Caos garantizado.

La solución: **git worktree** deja tener varias carpetas, cada una con su propia
rama, todas conectadas al mismo repositorio. Un solo repo por debajo, varias
carpetas de trabajo aisladas arriba. Los commits de todos terminan en el mismo
GitHub.

```text
FipFestival/          → rama develop (integración; acá cae el trabajo diario)
FipFestival-codex/    → worktree, ramas feat/codex-* desde develop (Codex trabaja acá)
```

Claude Code trabaja en la carpeta principal (`FipFestival/`) parada en `develop`,
commiteando directo ahí. Codex vive en su worktree con ramas `feat/codex-*` sacadas
de `develop`. Gemini en cualquier lado (solo `_scratch/`).

> [!NOTE]
> Worktrees suma comandos de git nuevos. No los vas a usar a cada rato: se crean una
> vez y cada agente vive en el suyo. Los comandos exactos están abajo.

---

## Setup inicial de los worktrees

Se hace **una sola vez**. Desde la carpeta principal `FipFestival/`, con el working
tree limpio (todo commiteado y pusheado).

> [!WARNING]
> Antes de empezar: `git status` debe decir "working tree clean". Si hay cambios sin
> commitear, cerralos primero. Crear worktrees con cosas a medias es pedir lío.

```bash
# Asegurarse de estar en develop y actualizado
git checkout develop
git pull

# Crear el worktree de Codex: una carpeta hermana con su propia rama, SACADA de develop
git worktree add ../FipFestival-codex -b feat/codex-infra develop

# Verificar que se creó
git worktree list
```

Eso crea la carpeta `FipFestival-codex/` al lado de `FipFestival/`, ya parada en la
rama `feat/codex-infra` (sacada de `develop`). Codex se lanza apuntando a esa carpeta.

Para crear más worktrees después (otra tarea de Codex):

```bash
git worktree add ../FipFestival-codex2 -b feat/codex-fechas develop
```

Para eliminar un worktree cuando una tarea terminó y ya se mergeó:

```bash
git worktree remove ../FipFestival-codex
```

---

## El ciclo de trabajo de cada tarea

El trabajo vive en `develop`. `main` no se toca en el día a día (es sagrada).

**Claude Code (core):** commitea **directo en `develop`** en la carpeta principal.
No abre rama por tarea; el punto de control es tu revisión en el navegador **antes**
del commit. El ciclo es: maqueta → vos revisás en el navegador → das el OK →
commitea y pushea a `develop`.

**Codex (infra/QA), en rama:**

1. **Rama nueva por tarea, sacada de `develop`.** Nunca se trabaja directo en `main`
   (es sagrada) ni se commitea suelto en `develop`. Cada tarea tiene su rama
   `feat/codex-<tarea>`.
2. **El agente trabaja en su worktree/rama.** Commitea en unidades limpias ahí.
3. **NO pushea a main ni a develop directo.** Pushea su rama
   (`git push -u origin feat/codex-infra`).
4. **Vos revisás** — leyendo el diff de la rama.
5. **Vos mergeás a `develop`** (ver rutina de merge abajo). Sos el único que integra.
6. **Push de `develop` + limpieza** del worktree/rama si la tarea cerró.

> [!IMPORTANT]
> El punto 5 es tu punto de control. "Aflojar la revisión" significa confiar más en
> el trabajo dentro de la rama, **no** dejar que los agentes mergeen solos. El merge
> a `develop` siempre pasa por vos. Y `main` solo cambia en un release.

---

## Quién toca qué archivos (mapa de territorios)

La tabla que garantiza que no se pisen. Si una tarea necesita un archivo de otra
columna, esa tarea se serializa, no se paraleliza.

| Zona | Archivos | Dueño |
|------|----------|-------|
| Páginas públicas | `app/[locale]/(public)/**` | Claude Code |
| Componentes de página | `components/{home,categorias,inscripcion,...}/**` | Claude Code |
| Datos / mocks | `mocks/**`, `lib/content/**` | Claude Code |
| Componentes compartidos | `components/shared/**`, `components/layout/**` | Claude Code |
| Boundaries | `app/**/{error,loading,not-found}.tsx` | Codex |
| Config raíz | `next.config.ts`, `package.json` (scripts), `.env*` | Codex |
| Testing | `src/test/**`, `vitest.config.mts` | Codex (desde Fase 3) |
| Auth / middleware | `middleware.ts`, gating por rol | Codex (Fases 5-6) |
| Relevamiento | `_scratch/**` | Gemini |

> [!CAUTION]
> **La zona de fricción es `package.json` y `lib/content/`.** Claude Code agrega
> dependencias de páginas y funciones de contenido; Codex agrega scripts y deps de
> testing. Si los dos lo tocan a la vez → conflicto. Regla: **un solo agente toca
> `package.json` por tanda.** Si Codex va a tocar scripts, Claude Code no agrega
> dependencias en paralelo. Se coordina por turnos.

---

## Reglas anti-pisada

Las no-negociables del trabajo en equipo:

- **Nadie commitea en `main` directo, jamás.** `main` es sagrada: solo recibe
  releases desde `develop`, y solo los hace el tech lead.
- **El trabajo vive en `develop`.** Claude Code commitea directo en `develop` (con tu
  OK tras la revisión); Codex usa ramas `feat/codex-*` sacadas de `develop` y las
  mergea a `develop`.
- **Solo vos integrás.** Los agentes de rama pushean su `feat/*`, no `develop` ni
  `main`. El merge a `develop` y el release a `main` los hacés vos.
- **Un agente toca `package.json` por vez.** Es el archivo más compartido; se
  serializa.
- **Antes de crear un worktree o cambiar de rama: working tree limpio.**
- **Después de cada corrida de Gemini: `git status`** para confirmar que no se
  escapó de `_scratch/`.
- **Sincronizar seguido:** cada rama hace `git pull` de `develop` antes de empezar y
  antes de pedirte merge, para reducir la distancia (y los conflictos).
- **Una tarea grande no se larga en paralelo con otra que toca lo mismo.** Ante la
  duda de si dos tareas comparten archivos, se serializan.

---

## Rutina de merge a develop

Cuando una rama `feat/*` está aprobada y lista. Desde la carpeta principal:

```bash
# Parado en develop, actualizado
git checkout develop
git pull

# Traer la rama de la tarea
git merge feat/codex-infra

# Si no hay conflicto: se mergeó solo. Verificar y pushear.
npm test
git push

# Limpieza: borrar la rama ya mergeada
git branch -d feat/codex-infra
git push origin --delete feat/codex-infra   # rama remota
git worktree remove ../FipFestival-codex    # si era worktree
```

> [!NOTE]
> Correr `npm test` después del merge y antes del push es la red de seguridad: si el
> merge rompió algo, los tests gritan antes de que llegue a GitHub.

> [!CAUTION]
> Esto mergea a **`develop`**, nunca a `main`. `main` solo se toca en un release.

---

## Rutina de release (develop → main)

`main` se actualiza **solo cuando hay un hito publicable**. No es el día a día: es un
evento especial y consciente. Cuando `develop` está estable y querés publicar:

```bash
# develop al día y en verde
git checkout develop
git pull
npm test            # ← tiene que estar TODO en verde antes de tocar main

# Promover develop a main
git checkout main
git pull
git merge --no-ff develop   # --no-ff deja registro del release
git push

# Volver a develop para seguir trabajando
git checkout develop
```

> [!WARNING]
> `main` es sagrada: solo se llega acá con `develop` en verde y con tu decisión
> explícita de hacer un release. Nunca se commitea ni se pushea a `main` a mano.

---

## Qué hacer cuando hay conflicto

Si el `git merge` dice "CONFLICT", no entres en pánico. Significa que dos ramas
tocaron las mismas líneas del mismo archivo y git no sabe cuál gana.

1. **No sigas a ciegas.** Pará y mirá qué archivo está en conflicto (`git status`
   lo lista).
2. **Pedí ayuda antes de resolver** si no estás seguro — los conflictos en
   `lib/content/`, `types.ts` o `package.json` son delicados.
3. **Si te asusta, abortá:** `git merge --abort` te devuelve a como estabas antes
   del merge, sin daño. Después lo encaramos con calma.

> [!IMPORTANT]
> La mejor forma de manejar conflictos es **prevenirlos**: el mapa de territorios y
> la regla de "un agente por `package.json`" existen justamente para que casi nunca
> llegues acá. Si estás teniendo conflictos seguido, es señal de que dos agentes
> están pisando la misma zona y hay que rever la división.

---

## Glosario en criollo

- **Worktree:** una carpeta de trabajo extra conectada al mismo repositorio. Te deja
  tener varias ramas "abiertas" en carpetas distintas a la vez, sin que se pisen los
  archivos en disco.
- **Rama (branch):** una línea de trabajo paralela. `main` es la **sagrada** (solo
  releases); `develop` es la de integración / trabajo diario; las `feat/*` salen de
  `develop` y se mergean a `develop` cuando están listas.
- **Merge:** unir una rama con otra. En el día a día, traer el trabajo de
  `feat/codex-infra` a `develop`.
- **Release:** promover `develop` a `main` cuando hay un hito publicable. Es el único
  momento en que `main` cambia.
- **Conflicto de merge:** cuando dos ramas cambiaron las mismas líneas y git no
  puede decidir solo; lo resolvés a mano.
- **`git merge --abort`:** botón de pánico. Cancela un merge en curso y te deja como
  antes de empezarlo. No pierde nada.
- **PR (Pull Request):** en GitHub, la forma "formal" de proponer mergear una rama,
  con revisión. Para un equipo de una persona + agentes, el merge local alcanza,
  pero si querés el flujo completo se puede usar PRs.
- **Serializar:** hacer las cosas de a una en vez de en paralelo. Cuando dos tareas
  tocan lo mismo, se serializan para no chocar.

---

## See Also

- [ROADMAP.md](./ROADMAP.md) — qué se construye y en qué orden (con la capa de agentes).
- [BITACORA-V1.md](./BITACORA-V1.md) — estado del proyecto.
- [MANUAL-DE-OPERACION.md](./MANUAL-DE-OPERACION.md) — el cómo trabajamos (método, git, testing).
- [git worktree (docs)](https://git-scm.com/docs/git-worktree) — referencia oficial.
