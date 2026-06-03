# Roadmap — Réplica web FIP Festival (v2, con equipo de agentes)

> Plan paso a paso desde el estado actual hasta el objetivo final: sitio público +
> CMS + áreas privadas, en Next.js + Payload.
> Esta versión integra el **equipo de 3 agentes**. El _qué_ y el _orden_ no
> cambiaron respecto de v1; lo que se agrega es _quién_ ejecuta cada parte.
> El detalle de cómo conviven los agentes está en
> [ORQUESTACION-AGENTES.md](./ORQUESTACION-AGENTES.md). La
> [BITACORA](./BITACORA-V1.md) sigue siendo la fuente de verdad del **estado**.

**Estado de partida:** Fase 2, páginas 1-7 maquetadas (Home, Reglamento,
Categorías, Inscripción, Fechas de cierre, Tarifario, Premios). Cimientos
arquitectónicos hechos (capa async + ruteo i18n). Testing base instalado (18 tests).
Equipo de 3 agentes operando.

**Lo nuevo en v2:** el trabajo se reparte entre tres agentes según sus fortalezas,
sin que se pisen, usando git worktrees. Claude Code construye el core, Codex hace
infra/QA/seguridad, Gemini releva. Vos sos el tech lead que mergea a `main`.

## Tabla de contenidos

- [El equipo (resumen)](#el-equipo-resumen)
- [Mapa general del camino](#mapa-general-del-camino)
- [Hito 1 — Cimientos arquitectónicos](#hito-1--cimientos-arquitectónicos)
- [Hito 2 — Terminar Fase 2 (páginas)](#hito-2--terminar-fase-2-páginas)
- [Hito 3 — Fase 3: Backend + CMS](#hito-3--fase-3-backend--cms)
- [Hito 4 — Fase 4: i18n completo](#hito-4--fase-4-i18n-completo)
- [Hito 5 — Fase 5: Área privada Agencias](#hito-5--fase-5-área-privada-agencias)
- [Hito 6 — Fase 6: Área privada Jurados](#hito-6--fase-6-área-privada-jurados)
- [Hito 7 — Cierre: pulido y publicación](#hito-7--cierre-pulido-y-publicación)
- [Reglas de método (no negociables)](#reglas-de-método-no-negociables)

---

## El equipo (resumen)

| Agente | Rol | Territorio |
|--------|-----|-----------|
| **Claude Code** | Core del producto | páginas, componentes, mocks, `lib/content` |
| **Codex (GPT-5.5)** | Infra + QA + seguridad | config, boundaries, tests, auth |
| **Gemini CLI** | Relevamiento | `_scratch/` (cero código) |
| **Vos** | Tech lead | mergea a `main`, aprueba todo |

> [!IMPORTANT]
> La división es por **tipo de archivo**, no por página. Eso es lo que permite el
> paralelo sin conflictos. Ver el mapa de territorios en
> [ORQUESTACION-AGENTES.md](./ORQUESTACION-AGENTES.md).

---

## Mapa general del camino

| Hito | Qué resuelve | Agentes en paralelo | Estado |
|------|--------------|---------------------|--------|
| **1** | Cimientos: datos async + ruteo i18n | Claude Code (solo) | ✅ Hecho |
| **2** | Terminar Fase 2: páginas 5-12 | Claude Code (core) ∥ Gemini (releva) ∥ Codex (boundaries+lint) | 🔄 En curso |
| **3** | Fase 3: Payload + PostgreSQL + admin | Claude Code (collections) ∥ Codex (env+tests integración) | ⏳ |
| **4** | Fase 4: i18n completo (contenido es/pt) | Claude Code (campos) ∥ Gemini (releva traducciones) | ⏳ |
| **5** | Fase 5: área privada Agencias | Claude Code (wizard) ∥ Codex (auth+seguridad+tests) | ⏳ |
| **6** | Fase 6: área privada Jurados (scoring) | Claude Code (scoring) ∥ Codex (auth+tests críticos) | ⏳ |
| **7** | Cierre: pulido, assets, SEO, publicación | Codex (CI+HTTPS) ∥ Claude Code (assets) ∥ Gemini (verificación) | ⏳ |

El símbolo `∥` significa "en paralelo": esos agentes pueden trabajar a la vez
porque tocan archivos distintos.

---

## Hito 1 — Cimientos arquitectónicos

✅ **Hecho.** Capa de datos async (`lib/content/`) + ruteo i18n con segmento
`[locale]` y `next-intl`. Lo hizo Claude Code en solitario (era pre-equipo). Las 7
páginas maquetadas corren sobre estos rieles.

---

## Hito 2 — Terminar Fase 2 (páginas)

Maquetar las páginas restantes sobre los rieles ya puestos. **Acá arranca el
trabajo en equipo de verdad.**

### Reparto de trabajo

- **Claude Code (core):** maqueta las páginas, una por vez, en su rama
  `feat/claude-<pagina>`. Tu revisión en el navegador antes de mergear se mantiene
  intacta.
- **Gemini (releva, en paralelo):** adelanta el contenido de las páginas pesadas que
  vienen. Ya entregó relevamientos prolijos de Premios, Jurados, Ranking y Hall de la
  Fama (en `_scratch/`). De **Ganadores** sólo dejó datos crudos (JSON), y 2024 y 2023
  sólo existen en PDF (sin tablas HTML scrapeables): esa página necesita un
  relevamiento prolijo —o trabajar directo de los PDFs— antes de maquetarse.
- **Codex (infra, en paralelo):** los quick wins que no chocan con páginas — los
  boundaries base (`error.tsx`/`loading.tsx`/`not-found.tsx`) y los scripts
  `typecheck`/`lint`. Rama `feat/codex-infra`.

> [!CAUTION]
> Codex tocando boundaries y Claude Code maquetando páginas casi no se solapan,
> **salvo `package.json`**: si Codex agrega los scripts y Claude Code agrega una
> dependencia de página a la vez, chocan. Regla: serializar el `package.json` (uno
> por turno). Ver reglas anti-pisada en la guía de orquestación.

### Páginas pendientes (orden de la bitácora)

Ya hechas: **5. Fechas de cierre · 6. Tarifario · 7. Premios / Réplicas.** Faltan:

8. Jurados `[year]` (Gemini ya relevó)
9. Ganadores `[year]` (Gemini dejó **solo datos crudos** en `_scratch/`; 2024 y 2023
   sólo existen en PDF — necesita un relevamiento prolijo, o trabajar de los PDFs,
   antes de maquetarse)
10. Hall de la Fama (Gemini ya relevó)
11. Ranking `[country]` (Gemini ya relevó)
12. Contacto (incluye formulario nuevo)

### Método por página (el de siempre)

- Una página por vez, en su rama.
- Para páginas con mucho contenido, usar el relevamiento de Gemini de `_scratch/`
  como fuente (no transcribir de capturas).
- Regla de fuentes: cuando el sitio en vivo difiere de la auditoría o un PDF, manda
  el sitio en vivo.
- Revisar en el navegador antes de mergear.
- Smoke test de la página nueva.
- Merge a `main` (vos) + push.

### Pendientes de contenido arrastrados

- [ ] Texto verbatim de "FIP 2025" del Home (en `Home.png`).
- [ ] Ubicar los premios "Red del Año" (Independientes + Mundiales).
- [ ] Confirmar nombre del Rubro 5 (Desarrollo Humano vs "FIP Salud y desarrollo
  humano"). → buen encargo para Gemini.
- [ ] Cerrar discrepancias de Categorías (sección 8 de la bitácora).

---

## Hito 3 — Fase 3: Backend + CMS

El sitio deja de ser estático y empieza a tener datos editables.

### Reparto de trabajo

- **Claude Code (core):** las collections de Payload (traducir las 15 entidades a
  schema TypeScript), cablear el panel admin, migrar las funciones de `lib/content/`
  de mock a queries de Payload. Las páginas no se tocan (la inversión del Hito 1).
- **Codex (infra + QA, en paralelo):** montar el manejo de entorno (`.env`,
  `DATABASE_URI`, `PAYLOAD_SECRET`, credenciales storage), sacar el `metadataBase`
  hardcodeado, y escribir los **tests de integración** de la capa `lib/content/`
  (que las queries devuelvan lo correcto). Rama propia.

> [!IMPORTANT]
> Acá empieza el testing serio. Las queries tienen lógica real. Codex escribe esos
> tests en `src/test/` mientras Claude Code arma las collections — territorios
> separados, paralelo seguro. Pero el orden importa: Codex no puede testear queries
> que todavía no existen, así que se sincroniza (Claude Code entrega la collection,
> Codex la testea).

### Pasos gruesos

1. Entorno (Codex) — `.env`, secrets, storage.
2. PostgreSQL (Claude Code) — levantar la base.
3. Collections de Payload (Claude Code) — empezar por contenido público.
4. Panel admin (Claude Code) — cablear el grupo `(payload)`.
5. Storage (Codex) — bucket para PDFs/PPTX/DOCX e imágenes.
6. Migrar mock → queries (Claude Code) — dentro de `lib/content/`.
7. Estrategia de rendering (decisión conjunta) — ISR / revalidación on-demand.
8. Boundaries (Codex) — si no se hicieron en Hito 2, acá son obligatorios.

---

## Hito 4 — Fase 4: i18n completo

Los rieles ya están (Hito 1). Acá se carga el contenido real en dos idiomas.

### Reparto de trabajo

- **Claude Code (core):** activar campos traducibles en Payload (los marcados 🌐),
  UI traducida vía `next-intl`, descargas por idioma.
- **Gemini (releva, en paralelo):** adelantar el contenido en portugués de los PDFs
  descargables y confirmar qué textos del sitio vivo ya están en pt. Deja el material
  en `_scratch/` para que Claude Code lo cargue.

### Pasos

1. Campos traducibles en Payload (Claude Code) — nombres propios, marcas y países NO
   se traducen.
2. UI traducida (Claude Code) — strings de navegación, botones, labels.
3. Descargas por idioma (Claude Code).
4. Verificar (vos) — recorrer `/pt` y confirmar fallback donde no hay traducción.

---

## Hito 5 — Fase 5: Área privada Agencias

Primera área privada. Entra la lógica de verdad.

### Reparto de trabajo

- **Claude Code (core):** el dashboard de campañas y el wizard de 4 pasos (datos →
  categorías → presentación → video).
- **Codex (auth + seguridad + QA):** el patrón de auth (`middleware.ts`, sesión
  server-side, gating por rol), el login + recuperación de contraseña, y los tests
  de las validaciones (tamaño de archivo, límite de 7 categorías). **Codex es el
  dueño de la capa de seguridad acá.**

> [!CAUTION]
> El `middleware.ts` se cruza con el ruteo i18n del Hito 1. Codex tiene que
> coordinarse para no romper el locale al agregar el gating de auth. Es un archivo
> de frontera — se trabaja con cuidado y se testea que ambas cosas (idioma + auth)
> sigan andando.

> [!IMPORTANT]
> Testing fuerte. Un bug es una campaña que no se guarda. Codex escribe los tests del
> wizard y las validaciones.

---

## Hito 6 — Fase 6: Área privada Jurados

La parte más compleja. Se deja para el final a propósito.

### Reparto de trabajo

- **Claude Code (core):** la pantalla de scoring (4 criterios, total automático), la
  asignación de campañas (cada jurado ve su set, sin las de su agencia), el bloqueo
  de votos.
- **Codex (auth + QA crítico):** reusa el patrón de auth del Hito 5 para el rol
  `juror`, y escribe los **tests críticos del scoring**. Acá un bug es un voto mal
  calculado — el testing no es opcional.

> [!CAUTION]
> El sistema de votación actual no es visible públicamente, así que hay incógnitas.
> Tratarlo como un épico aparte con su propio relevamiento (buen encargo para Gemini:
> documentar todo lo que se pueda inferir del Reglamento, sección K).

---

## Hito 7 — Cierre: pulido y publicación

Lo transversal que se cierra antes de publicar.

### Reparto de trabajo

- **Codex (infra):** CI (tests + build en cada push), HTTPS forzado, cablear GA4
  (`G-WZ5GVL3QXP`).
- **Claude Code (core):** reemplazar placeholders por assets reales (fotos, logos,
  íconos, sello "27", banderas, OG), meta description + Open Graph por página.
- **Gemini (verificación):** recorrer el sitio en vivo página por página y comparar
  contra la réplica, listar diferencias finales.

### Pasos

1. Assets reales (Claude Code).
2. SEO — meta description + Open Graph por página (Claude Code).
3. GA4 (Codex).
4. HTTPS forzado (Codex).
5. CI (Codex).
6. Decisión pendiente: qué hacer con `img` y los artefactos de `_scratch/`
   (versionar aparte o respaldar).
7. Revisión final página por página contra el sitio en vivo (Gemini + vos).

---

## Reglas de método (no negociables)

Las de siempre, más las del trabajo en equipo:

- **Una página/tarea por vez por agente.** Revisar antes de mergear.
- **Solo vos mergeás a `main`.** Los agentes pushean ramas, no `main`.
- **Una rama por tarea** (`feat/<agente>-<tarea>`), nunca trabajar en `main` directo.
- **Un agente toca `package.json` por vez** (es el archivo más compartido).
- **Regla de fuentes:** sitio en vivo manda sobre auditoría/PDF.
- **Antes de comandos que crean/borran/sobrescriben carpetas o cambian de rama, leer
  qué tocan** (worktrees lo hacen más delicado).
- **Después de cada corrida de Gemini: `git status`** (verificar que no salió de
  `_scratch/`).
- **No dar por hecho lo que no se verificó en git.**
- **Modelo/agente según la tarea:** Claude Code para core, Codex para infra/QA,
  Gemini para relevar.
- **Commits en unidades limpias:** una cosa por commit.

---

## See Also

- [ORQUESTACION-AGENTES.md](./ORQUESTACION-AGENTES.md) — manual del equipo (worktrees,
  roles, anti-pisada, merge).
- [BITACORA-V1.md](./BITACORA-V1.md) — estado del proyecto (fuente de verdad).
- [Auditoria_FIP_Festival.docx](./Auditoria_FIP_Festival.docx) — relevamiento original.
