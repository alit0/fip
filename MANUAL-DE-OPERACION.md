# Manual de operación — Réplica web FIP Festival

> Cómo trabajamos en este proyecto: el método, el equipo de agentes, los protocolos
> de git y testing, y las lecciones aprendidas en la práctica.
> Este documento es el **cómo trabajamos**. La [BITACORA](./BITACORA-V1.md) es el
> **estado**; el [ROADMAP](./ROADMAP.md) es el **camino**; la
> [ORQUESTACION](./ORQUESTACION-AGENTES.md) es el **manual del equipo de agentes**.
> Este los ata a todos y agrega los protocolos finos que aprendimos sobre la marcha.

**Para quién es:** para retomar el proyecto después de un corte, para traspasarlo, o
para no repetir los errores que ya cometimos y resolvimos.

## Tabla de contenidos

- [Resumen del proyecto](#resumen-del-proyecto)
- [El equipo y los roles](#el-equipo-y-los-roles)
- [El método base (no negociable)](#el-método-base-no-negociable)
- [Flujo de una página, paso a paso](#flujo-de-una-página-paso-a-paso)
- [Protocolo de git con worktrees](#protocolo-de-git-con-worktrees)
- [Protocolo de testing](#protocolo-de-testing)
- [Cómo se escriben los prompts a los agentes](#cómo-se-escriben-los-prompts-a-los-agentes)
- [Lecciones aprendidas (errores reales y su fix)](#lecciones-aprendidas-errores-reales-y-su-fix)
- [Recetas rápidas (troubleshooting)](#recetas-rápidas-troubleshooting)
- [Estado y qué falta](#estado-y-qué-falta)
- [See Also](#see-also)

---

## Resumen del proyecto

Réplica completa del sitio del FIP Festival (festival iberoamericano de marketing,
promociones y eventos), migrándolo de PHP plano a **Next.js 15 + Payload CMS**, con
sitio público, CMS editable, i18n es/pt y dos áreas privadas (Agencias y Jurados).

El trabajo se reparte entre un humano (tech lead) y tres agentes de IA, cada uno en
su rol. El humano sabe programar pero está aprendiendo arquitectura, git y testing,
así que el método prioriza **control, verificación y pasos chicos** por encima de
la velocidad.

---

## El equipo y los roles

| Quién | Rol | Territorio | Qué NO hace |
|-------|-----|-----------|-------------|
| **Vos (tech lead)** | Decidís, revisás, mergeás a `main` | `main`, las decisiones | No delegás el criterio ni el merge final |
| **Claude (este chat)** | Asesor/orquestador | Piensa, arma prompts, interpreta, frena riesgos | No toca el repo directamente |
| **Claude Code** | Constructor del core | páginas, componentes, mocks, `lib/content` | No toca infra/tests/config |
| **Codex (GPT-5.5)** | Infra + QA + seguridad | config, boundaries, `src/test`, `middleware`, CI | No maqueta páginas |
| **Gemini CLI** | Relevamiento | `_scratch/` (cero código) | No toca código ni git |

> [!IMPORTANT]
> La división entre los agentes de código es por **tipo de archivo**, no por página.
> Eso es lo que permite que trabajen en paralelo sin pisarse. Si dos tareas necesitan
> el mismo archivo, se **serializan** (una primero, otra después), no se paralelizan.

### El rol de cada uno, en detalle

- **Claude Code** es el dueño del camino crítico: maqueta las páginas, arma las
  collections de Payload (Fase 3) y las áreas privadas (Fases 5-6). Es donde la
  revisión en el navegador es más estricta.
- **Codex** hace lo que vive en archivos distintos a las páginas: setup de entorno,
  boundaries (`error/loading/not-found`), ESLint, tests serios, auth/seguridad. Toca
  config y tests, no páginas.
- **Gemini** scrapea el sitio en vivo y documenta. Siempre escribe en `_scratch/`,
  que está gitignoreado. Su salida es material de referencia, **no fuente de verdad**
  (ver lecciones).

---

## El método base (no negociable)

Estas reglas se mantienen pase lo que pase:

1. **Una página o tarea por vez por agente.** Revisar antes de aprobar.
2. **Regla de fuentes:** cuando el sitio en vivo difiere de la auditoría o un PDF,
   **manda el sitio en vivo**. Siempre.
3. **Revisar en el navegador antes de aprobar** cualquier página, comparando contra
   el vivo.
4. **Commit + push antes de pasar a lo siguiente** (red de seguridad en GitHub).
5. **Commits en unidades limpias:** una cosa por commit. La página por un lado, el
   testing por otro, los docs por otro.
6. **Nadie commitea en `main` directo; `main` es sagrada (solo releases).** El trabajo
   vive en `develop`: Claude Code commitea directo ahí (con tu OK); Codex usa ramas
   `feat/*` sacadas de `develop`. Solo el tech lead integra a `develop` y promueve a
   `main`.
7. **No dar por hecho lo que no se verificó en git.** Si depende del estado del repo,
   se mira con `git status` / `git log`, no se asume.
8. **Antes de comandos que crean/borran/sobrescriben carpetas o cambian de rama, leer
   qué tocan.**
9. **Typos del sitio en vivo se normalizan** (réplica prolija, no clon de errores).
   Esto NO viola la regla de fuentes: un typo es un defecto, no contenido.

---

## Flujo de una página, paso a paso

El ciclo que usamos para cada página de Fase 2, y que funcionó bien:

1. **(Opcional) Gemini releva** la página pesada por adelantado y deja el contenido en
   `_scratch/`.
2. **Claude (chat) arma el prompt** para Claude Code, con: ruta, arquitectura (capa
   async + locale), fuente (vivo > auditoría), qué maquetar, criterio de typos,
   testing, y la instrucción de **no commitear** hasta revisión.
3. **Claude Code maqueta** la página en el working tree, sin tocar git. Corre
   lint + typecheck + build, deja todo en verde, y reporta discrepancias.
4. **Vos revisás en el navegador** (`localhost:300x/pagina` y `/pt/pagina`),
   comparando contra el vivo. Atención especial a datos sensibles (precios, fechas) y
   a layout.
5. **Si está OK, das el OK explícito** para los dos commits: `feat(pagina)` y el de
   testing aparte.
6. **Claude Code commitea y pushea** (en este proyecto commitea sobre `develop`
   directo; `main` es sagrada y no se toca en el día a día. Los agentes de rama es
   distinto, ver protocolo de git).
7. **Verificás** con `git log --oneline` y `npm test` que quedó limpio.

> [!NOTE]
> El patrón de arquitectura: cada página vive en `app/[locale]/(public)/<pagina>/`,
> lee datos vía `getX()` async de `lib/content/` (nunca importa de `@/mocks` directo),
> y reusa componentes compartidos en vez de duplicar. El cuerpo queda en español
> hardcodeado por ahora; el i18n del contenido es Fase 4.

---

## Protocolo de git con worktrees

Los tres agentes no pueden compartir el mismo working tree sin pisarse. La solución
es **git worktrees**: varias carpetas, cada una con su rama, todas del mismo repo.

### Estructura

```text
FipFestival/          → rama develop (tu carpeta; integración / trabajo diario)
FipFestival-codex/    → worktree de Codex, ramas feat/codex-* desde develop
```

> [!IMPORTANT]
> **Flujo main + develop.** `main` es la rama **sagrada**: estable, publicable, solo
> recibe releases. **Nadie commitea ahí directo, jamás.** El trabajo diario vive en
> `develop`. `main` se actualiza solo desde `develop` cuando hay un hito publicable
> (ver "Release a main" abajo).

> [!NOTE]
> En la práctica, **opencode/Codex crea sus propios worktrees temporales** en
> `AppData/Local/Temp/opencode/...`, uno por tarea. No hace falta montarle uno a mano.
> Esos temporales son asunto de la herramienta — no los persigas (ver lecciones).

### El ciclo de una tarea en rama (Codex)

1. Codex crea rama `feat/codex-<tarea>` desde `develop`.
2. Trabaja en su worktree, commitea en unidades limpias.
3. **Pushea su rama**, NO `develop` ni `main`. Avisa.
4. Vos revisás el diff de la rama.
5. **Vos mergeás a `develop`** con el ritual de abajo.
6. Limpieza de la rama (local + remota).

### Ritual de merge a develop (SAGRADO — seguir el orden)

```bash
# Parado en develop, en TU carpeta principal, working tree LIMPIO
git checkout develop
git pull
git merge feat/codex-<tarea>
npm test          # ← si da ROJO, NO seguir
git push          # ← solo si los tests están en VERDE (pushea develop)
# limpieza:
git branch -d feat/codex-<tarea>
git push origin --delete feat/codex-<tarea>
```

### Release a main (cuando hay un hito publicable)

`main` se toca **solo** acá, y es una decisión consciente, no el día a día:

```bash
git checkout develop && git pull
npm test                      # ← todo en VERDE antes de tocar main
git checkout main && git pull
git merge --no-ff develop     # promover develop → main (release)
git push
git checkout develop          # volver a trabajar en develop
```

> [!CAUTION]
> **Dos condiciones antes de mergear, sin excepción:**
> 1. Working tree LIMPIO (`git status` = "nothing to commit").
> 2. NINGÚN agente escribiendo en el working tree en ese momento.
> Si mergeás con un agente trabajando, el `npm test` del ritual corre sobre un estado
> mezclado y te da resultados falsos. Nos pasó (ver lecciones).

> [!WARNING]
> **NUNCA pushear con `npm test` en rojo.** El test en rojo es la luz que dice "pará".
> Si hay una sola X, se frena y se investiga antes de pushear.

### Antes de cualquier operación de git, ubicate

```bash
pwd          # ¿en qué carpeta estoy?
git status   # ¿en qué rama? ¿working tree limpio?
```

Con worktrees, "en qué rama estás" depende de "en qué carpeta estás". Este reflejo
evita el 90% de los enredos.

---

## Protocolo de testing

El testing serio se reserva para donde hay **lógica real** (Fase 3 queries, áreas
privadas). En Fase 2 (páginas estáticas con mock), el criterio es liviano:

- **Smoke test por página:** que renderice sin romper. Es la red mínima.
- **+ UNA aserción de un dato crítico** por página con datos sensibles (un precio, una
  fecha clave). UNA, no una batería. Ej: que Premios muestre `550`.
- Las aserciones pesadas de contenido → Fase 3 y áreas privadas.

> [!IMPORTANT]
> **Regla dura de testing:** nunca se quita un test de algo que funciona. El total de
> tests sube o se mantiene, **jamás baja**. Si un agente cree que un test sobra, lo
> marca y pregunta — no lo borra. (Esta regla nació de un error real, ver lecciones.)

El patrón técnico para testear páginas async (server components con `params`):

```typescript
const ui = await PageComponent({ params: Promise.resolve({ year: "2026" }) });
render(ui);
```

---

## Cómo se escriben los prompts a los agentes

Lo que funcionó: prompts **explícitos, autocontenidos y con límites duros**. Cada
prompt a un agente de código incluye:

- **Contexto de arquitectura** (la ruta, el patrón async, el locale) para que no
  invente estructura.
- **Territorio explícito:** qué SÍ puede tocar y qué NO. Especialmente "no toques
  `package.json` sin avisar" (es el archivo más compartido).
- **Fuente de verdad:** vivo > relevamiento de Gemini > auditoría. Y "anotá
  discrepancias, no las resuelvas inventando".
- **Criterio de commits:** "no commitees hasta que yo revise" + "una cosa por commit".
- **Para Codex en rama:** "no toques `main`, no mergees, pusheá tu rama y avisá" +
  "limpiá tu worktree temporal al terminar".
- **Principios, no solo instrucciones:** ej. en testing, decir "nunca quites un test
  que funciona" en vez de solo "completá la cobertura". Los agentes interpretan las
  instrucciones vagas con flexibilidad — los principios cierran esa puerta.

> [!TIP]
> Regla de oro de los prompts: si un límite importa, escribilo explícito. Lo que
> queda implícito, el agente lo interpreta a su manera (y no siempre como vos querés).

---

## Lecciones aprendidas (errores reales y su fix)

Todo esto pasó de verdad en el proyecto. Documentado para no repetirlo.

### 1. Gemini interpreta sus límites con flexibilidad

Gemini generó archivos fuera de lo pedido más de una vez (admitió "tenía políticas
restrictivas" y los generó igual). **Fix:** después de CADA corrida de Gemini, correr
`git status` para confirmar que no se escapó de `_scratch/`. Confiar pero verificar.

### 2. Los relevamientos de Gemini son insumo, no verdad

En la comparación del Home, Gemini reportó que teníamos un "resumen" cuando el mock ya
tenía el verbatim completo. **Fix:** el relevamiento se usa como material de trabajo;
la verdad final se confirma contra el vivo y el código real.

### 3. Codex redujo cobertura de tests "limpiando"

Con la instrucción "completar cobertura", Codex **eliminó** tests de páginas que
funcionaban (pasó de 16 a 8). **Fix:** se descartó esa rama; la regla dura de testing
("nunca bajar cobertura") nació de acá; los prompts ahora fijan el principio explícito.

### 4. Mergear con un agente escribiendo en paralelo

Se mergeó una rama mientras Claude Code editaba el Home; el `npm test` del ritual dio
rojo por el trabajo a medias, no por el merge. **Fix:** merges solo con working tree
limpio y ningún agente escribiendo. (El daño no llegó a `main` porque el trabajo a
medias estaba sin commitear.)

### 5. Push con tests en rojo

En el mismo episodio, se pusheó con un test en rojo (por suerte el push solo agarró un
doc, no el código roto). **Fix:** `npm test` en rojo = NO pushear. Sin excepción.

### 6. Terminal parada en la rama/carpeta equivocada

Con varios worktrees, la terminal quedó en `FipFestival-codex` y mostraba la rama de
Codex; pareció que `main` estaba roto (no lo estaba). **Fix:** `pwd` + `git status`
antes de operar. Y: tener **una sola carpeta tuya** (`FipFestival` en `main`) reduce
las chances de pararte en la equivocada.

### 7. Worktrees temporales de opencode con locks

Intentar borrar los worktrees temporales de opencode da "Permission denied" / locks
mientras opencode corre. **Fix:** no perseguirlos. Borrar la rama remota (que es lo que
importa) y dejar el resto; se limpia solo cuando se cierra opencode. Pedirle a Codex
que limpie su propio worktree al terminar.

### 8. La carpeta `.next` se corrompe seguido

Errores tipo `__webpack_modules__[moduleId] is not a function`,
`Cannot find module './xxx.js'`, o módulos "not found in React Client Manifest"
**casi siempre son caché de `.next` corrupta**, no bugs de código. Pasó dos veces.
**Fix:** ver receta abajo.

---

## Recetas rápidas (troubleshooting)

### `.next` corrupta (errores raros de webpack/módulos)

```powershell
# Frená el dev (Ctrl+C en su consola), después:
Remove-Item -Recurse -Force .next
npm run dev
```

Es seguro: `.next` es build cacheado (está gitignoreado), no toca tu código fuente ni
el trabajo sin commitear. Si el error persiste tras esto, recién ahí es código.

### "main is already used by worktree" / rama equivocada

```powershell
pwd                                    # confirmá en qué carpeta estás
cd C:\Users\Ale\Documents\FipFestival  # volvé a la principal
git status                             # confirmá main + limpio
```

### Limpiar una rama de agente ya mergeada

```bash
git branch -d feat/<agente>-<tarea>
git push origin --delete feat/<agente>-<tarea>
```

### Después de cada corrida de Gemini

```bash
git status   # ¿dejó algo fuera de _scratch/?
```

### Después de mergear algo que tocó package.json

```bash
npm install  # bajar las deps nuevas en tu carpeta
```

---

## Estado y qué falta

> [!NOTE]
> El estado detallado y actualizado vive en la [BITACORA](./BITACORA-V1.md). Esto es
> un resumen al momento de escribir este manual.

**Hecho:**
- Cimientos arquitectónicos: capa de datos async (`lib/content`) + ruteo i18n
  (`[locale]` + next-intl).
- Páginas 1-7 maquetadas: Home (corregido al vivo), Reglamento, Categorías,
  Inscripción, Fechas de cierre, Tarifario, Premios.
- Infra: boundaries, ESLint + scripts, ignores de `.next` y `tsconfig.tsbuildinfo`.
- Equipo de 3 agentes operando con worktrees.
- Docs de análisis en el repo: `SECURITY-AUDIT-NPM.md`, `JURADOS-SCORING-SPEC.md`.
- Relevamiento prolijo en `_scratch/`: Premios, Jurados, Ranking, Hall, textos Home.
- Ganadores: **solo datos crudos** en `_scratch/` (JSON sin documento ordenado), y
  **2024 y 2023 solo existen en PDF** (sin tablas HTML scrapeables). Es la página
  más cara que falta — probablemente necesite un relevamiento nuevo y prolijo de
  Gemini, o trabajar directo de los PDFs, antes de maquetarla.

**Falta (Fase 2):** Jurados `[year]`, Ganadores `[year]`, Hall de la Fama,
Ranking `[country]`, Contacto.

**Pendientes técnicos:**
- Audit npm fase 2 (aplicar fixes de seguridad) — pendiente de decisión.
- Renombrar `MuestraDigital.tsx` (ya no maqueta una "muestra digital").
- Pendientes de contenido: premios "Red del Año", confirmar Rubro 5, assets reales.

**Después de Fase 2:** Fase 3 (Payload + CMS), Fase 4 (i18n completo), Fase 5
(área Agencias), Fase 6 (área Jurados — la más compleja), Fase 7 (cierre y publicación).

---

## See Also

- [BITACORA-V1.md](./BITACORA-V1.md) — estado del proyecto (fuente de verdad del estado).
- [ROADMAP.md](./ROADMAP.md) — el camino, fase por fase, con la capa de agentes.
- [ORQUESTACION-AGENTES.md](./ORQUESTACION-AGENTES.md) — manual del equipo (worktrees, territorios, merge).
- [Auditoria_FIP_Festival.docx](./Auditoria_FIP_Festival.docx) — relevamiento del sitio original.
- [SECURITY-AUDIT-NPM.md](./SECURITY-AUDIT-NPM.md) — análisis de vulnerabilidades npm.
- [JURADOS-SCORING-SPEC.md](./JURADOS-SCORING-SPEC.md) — spec preliminar del scoring (Fase 6).
