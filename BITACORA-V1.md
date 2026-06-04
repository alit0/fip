# Bitácora del proyecto — Réplica web FIP Festival

> Réplica de [fipfestival.com.ar](https://www.fipfestival.com.ar/) en **Next.js + Payload CMS**.
> Documento de referencia para retomar el proyecto o traspasarlo a otra persona.

**Estado:** Fase 2 en curso — 7 de 12 páginas maquetadas · equipo de 3 agentes en marcha
**Repositorio:** `github.com/alit0/fip` (trabajo en `develop`; `main` = releases)
**Última actualización:** 3 de junio de 2026

## Tabla de contenidos

- [1. Qué es este proyecto](#1-qué-es-este-proyecto)
- [2. Decisiones de arquitectura](#2-decisiones-de-arquitectura)
- [3. Modelo de datos](#3-modelo-de-datos)
- [4. Guía de diseño (design tokens)](#4-guía-de-diseño-design-tokens)
- [5. Estructura del proyecto](#5-estructura-del-proyecto)
- [6. Plan de fases y estado actual](#6-plan-de-fases-y-estado-actual)
- [7. Lo construido en detalle](#7-lo-construido-en-detalle)
- [8. Discrepancias de contenido](#8-discrepancias-de-contenido)
- [9. Equipo de agentes y documentos de proceso](#9-equipo-de-agentes-y-documentos-de-proceso)
- [10. Git y respaldo](#10-git-y-respaldo)
- [11. Pendientes y próximos pasos](#11-pendientes-y-próximos-pasos)

---

## 1. Qué es este proyecto

Replicar por completo el sitio del **FIP Festival** (festival iberoamericano de
marketing, promociones y eventos, 27 años de trayectoria), pasándolo de su
tecnología actual (PHP plano, sin CMS) a una arquitectura moderna en React con un
backend que permita editar todo el contenido desde un panel de administración.

**Alcance acordado:**

- **Sitio público** — las ~15 páginas del original, fieles en contenido y diseño.
- **CMS** — panel para editar contenido dinámico (jurados por año, ganadores por
  año, rankings por país, categorías, fechas, tarifario, premios, textos,
  descargables) y gestionar archivos PDF/PPTX/DOCX en español y portugués.
- **Áreas privadas** — login por rol para **Agencias** (carga de campañas, wizard
  de 4 pasos) y **Jurados** (puntuación de campañas por 4 criterios). Es la parte
  más compleja y va al final.

**Documentos fuente (la "fuente de verdad"):**

- `Auditoria_FIP_Festival.docx` — relevamiento completo (páginas, contenido,
  modelo de datos, guía de diseño).
- Capturas de pantalla de cada página del sitio original (referencia visual).
- PDFs y PPTs descargables del sitio (categorías, reglamento, tarifario, informes
  de ganadores), guardados en la carpeta `./img`.

> [!IMPORTANT]
> **Regla de oro de fuentes:** cuando el sitio en vivo y un documento (auditoría o
> PDF) difieren, **manda el sitio en vivo**. Se replica la web actual, no
> documentos que pueden estar desactualizados.

---

## 2. Decisiones de arquitectura

Stack elegido y confirmado. La decisión clave —y la más discutida— fue el **CMS**:
se eligió **Payload** por encima de Strapi, Directus y un panel propio.

| Capa | Elección | Motivo resumido |
|------|----------|-----------------|
| Frontend | Next.js 15 (App Router) + React 19 | SEO real (SSR/SSG); routing por archivos ideal para páginas por año |
| Estilos | Tailwind v4 + design tokens en CSS | Paleta centralizada en un solo lugar |
| Animación / carrusel / íconos | Framer Motion · Embla · lucide-react | Reemplazan GSAP/SheetSlider/FontAwesome del sitio viejo |
| Backend + CMS + Auth + Storage | Payload CMS 3 (dentro de la misma app Next) | Una sola app: API, admin, auth por roles y storage |
| Base de datos | PostgreSQL | Datos relacionales (`Winner → Category → Rubro → Edition`) |
| i18n | Localización nativa de Payload + next-intl | Campos traducibles es/pt, field por field |

### Por qué Payload y no Strapi/Directus

- **Una sola app** — API, panel de admin, login con roles (`admin`/`juror`/`agency`)
  y storage de archivos viven juntos. Strapi/Directus serían un segundo servicio
  aparte (dos deploys).
- **Schema en código** — el modelo de datos vive en archivos TypeScript versionados
  en git, no enterrado en un panel. Cada cambio queda registrado y es reversible.
- **Áreas privadas integradas** — el scoring de jurados y el wizard de agencias
  hablan directo con la base, sin salir a la red.

### Cimientos ya colocados (Hito 1 del roadmap)

Antes de seguir maquetando se pusieron los dos rieles arquitectónicos sobre los que
corren todas las páginas. **Ya están hechos y verificados:**

- **Capa de datos async (`src/lib/content/`)** — único límite entre la UI y la
  fuente de datos. Las páginas y componentes importan getters de acá
  (`getHomeContent`, `getTarifario`, `getPremios`, …), **nunca de `@/mocks`
  directo**. Todos los getters son `async` y reciben locale. En la Fase 3, el cambio
  de mock → query de Payload se hace dentro de estos archivos, sin tocar páginas.
- **Ruteo i18n con segmento `[locale]` + next-intl** — todas las rutas viven bajo
  `src/app/[locale]/`. El layout raíz setea `html lang`, fuentes, metadata y el
  `NextIntlClientProvider`. Genera `/es` y `/pt` por SSG. El contenido del cuerpo
  está hardcodeado en español por ahora; la traducción real es la Fase 4.

---

## 3. Modelo de datos

15 entidades. Los campos marcados con 🌐 son **traducibles** (es/pt). Nombres
propios, marcas, agencias y países **no** se traducen (texto plano).

```text
Edition        { year, isCurrent, title🌐, status, datesClosing[], fees{...} }
Rubro          { number, code, name🌐, description🌐, order, edition→Edition }
Category       { rubro→Rubro, code, title🌐, description🌐, awardIcon,
                 isSpecial, specialType?, isNew, order }
Juror          { edition→Edition, slug, name, role🌐, agency, country,
                 countryFlag, photo→Media, bio🌐, order }
Winner         { edition→Edition, rubro, category→Category, awardLevel,
                 specialAwardName?🌐, campaign, brand, agency, country, isGrandReco }
HallOfFameMember { slug, name, role🌐, company, country, photo, logo,
                 bio🌐, inductionYear, order }
RankingEntry   { country, year, position, agency, granPrix, oro, plata,
                 bronce, total }
Sponsor        { name, country, countryFlag, logo→Media, url, order }
DownloadFile   { key, label🌐, language(es|pt), format(pdf|pptx|docx),
                 file→Media, section, updatedAt }
PageContent    { pageKey, sectionKey, title🌐, body🌐, order }
SiteConfig     { contactEmails, phones, address🌐, socialLinks, currentEditionYear }  # global

# Áreas privadas (fases finales)
User           { role(admin|juror|agency), email, name, country }
AgencyEntry    { user→User, edition, campaignName, company, description🌐,
                 categories[](max 7), presentationFile, videoUrl, laminaUrl,
                 status, paymentStatus }
JurorAssignment{ juror→User, edition, categoryCode, campaigns[]→AgencyEntry }
Vote           { juror→User, agencyEntry→AgencyEntry,
                 scores{estrategia,originalidad,implementacion,alcance}, total, locked }
```

> [!NOTE]
> El modelo de datos del scoring de jurados (Fase 6) tiene un análisis preliminar
> propio en [`JURADOS-SCORING-SPEC.md`](./JURADOS-SCORING-SPEC.md). Ver sección 9.

---

## 4. Guía de diseño (design tokens)

Estética **dark mode** con fondos púrpura y acento dorado. Los tokens ya están en
código (`src/styles/tokens.css`) y se ajustaron a los valores reales del sitio
durante la Fase 2.

| Token | Valor | Uso |
|-------|-------|-----|
| `--fip-purple-900` | `rgb(28, 0, 55)` | Body, header, footer, secciones base |
| `--fip-purple-700` | `rgb(45, 0, 90)` | Secciones alternadas |
| `--fip-purple-500` | `rgb(85, 1, 170)` | Sección premios, acentos |
| `--fip-gold` | `rgb(212, 175, 55)` | CTAs, badges, "27 años" |
| `--fip-blue` | `≈ #1A1AFF` | Badges A–R del reglamento |

- **Tipografía:** Inter (títulos, hasta 72px/900), Archivo Black (impacto), Lato
  (cuerpo y navegación).
- **Spacing:** escala de 4px. **CTAs:** estilo pill (`radius: 9999px`).

---

## 5. Estructura del proyecto

Una sola app Next.js + Payload. Vive en la raíz `C:\Users\Ale\Documents\FipFestival`
(junto a la auditoría y la carpeta `img`).

```text
src/
├─ app/
│  └─ [locale]/                  # segmento i18n (genera /es y /pt)
│     ├─ layout.tsx              # layout raíz: html lang, fuentes, next-intl provider
│     ├─ error.tsx / loading.tsx / not-found.tsx   # boundaries (Codex/infra)
│     ├─ (public)/               # sitio público: layout + páginas
│     │  ├─ page.tsx (Home), reglamento/, categorias/, inscripcion/,
│     │  ├─ fechas-de-cierre/, tarifario/, premios/, hall-de-la-fama/,
│     │  ├─ contacto/, 20-consejos/
│     │  ├─ jurados/[year]/, ganadores/[year]/, ranking/[country]/
│     ├─ (auth)/                 # áreas privadas (fase final): acceso/jurados, acceso/agencias
│     └─ (payload)/              # admin CMS (se cablea en Fase 3)
├─ collections/                  # SCHEMA Payload = modelo de datos (Fase 3)
├─ components/
│  ├─ layout/                    # TopBar, MainNav (con menú mobile), Footer, SocialIcons
│  ├─ home/ categorias/ inscripcion/ fechas/ reglamento/   # componentes por página
│  └─ shared/                    # Placeholder, Cta, Section, SectionHeading, ImagePlaceholder, DownloadButton, …
├─ lib/
│  ├─ content/                   # capa de datos ASYNC (getters) — el límite UI ↔ datos
│  └─ navigation.ts              # datos de nav/header/footer y helpers
├─ mocks/                        # datos mock tipados (home.json, premios.json, …) + types.ts + index.ts
├─ styles/tokens.css             # design tokens
├─ i18n/                         # config de next-intl
└─ test/                         # vitest: smoke de páginas + aserciones de datos críticos
```

Documentos de proceso en la raíz del repo: [`ROADMAP.md`](./ROADMAP.md),
[`ORQUESTACION-AGENTES.md`](./ORQUESTACION-AGENTES.md),
[`SECURITY-AUDIT-NPM.md`](./SECURITY-AUDIT-NPM.md),
[`JURADOS-SCORING-SPEC.md`](./JURADOS-SCORING-SPEC.md), y los relevamientos de
Gemini en `_scratch/` (ver sección 9).

> [!NOTE]
> Las páginas importan los datos desde `@/lib/content` (capa async), **no** desde
> `@/mocks` directo. En la Fase 3, cambiar de mock a Payload se hace en **un solo
> lugar por entidad**, sin tocar las páginas.

---

## 6. Plan de fases y estado actual

| Fase | Qué incluye | Estado |
|------|-------------|--------|
| **Fase 1** | Arquitectura + esqueleto: layout base, routing de las 15 páginas como placeholders, tokens | ✅ Completa y pusheada |
| **Fase 2** | Frontend público con datos mock: maquetar las 12 páginas, responsive + SEO | 🔄 En curso (7/12) |
| **Fase 3** | Backend/API + CMS: collections de Payload, PostgreSQL, panel admin, storage, migrar mock→queries | ⏳ Pendiente |
| **Fase 4** | i18n es/pt: campos traducibles + UI con next-intl + descargas por idioma | ⏳ Pendiente (rieles ya puestos en Hito 1) |
| **Fase 5** | Área privada Agencias: login, dashboard, wizard de 4 pasos, validaciones | ⏳ Pendiente |
| **Fase 6** | Área privada Jurados: scoring por 4 criterios, votos bloqueables, reportes (la más compleja) | ⏳ Pendiente |

> [!NOTE]
> Los **cimientos arquitectónicos** (capa de datos async + ruteo i18n con `[locale]`
> y next-intl) corresponden al **Hito 1** del [ROADMAP](./ROADMAP.md) y ya están
> hechos. Por eso la Fase 4 sólo tiene que cargar contenido sobre rieles existentes.

### Progreso de la Fase 2 (páginas)

- [x] 1. **Home** — hero, premios, FIP 2025, categorías, jurados, auspiciantes, rankings (corregido para alinearlo al sitio en vivo)
- [x] 2. **Reglamento** — índice, artículos A–R, tabla de puntajes
- [x] 3. **Categorías** — 23 rubros, 143 categorías reales (desde PDF + MP del sitio en vivo)
- [x] 4. **Inscripción** — pasos, condiciones, contenido de la presentación
- [x] 5. **Fechas de cierre** — descuentos por pago anticipado + tabla de cierres regionales
- [x] 6. **Tarifario** — aranceles, descuentos por cantidad, formas de pago, envío de factura
- [x] 7. **Premios / Réplicas** — catálogo de 6 trofeos con precios, tarifario de envío, medios de pago
- [ ] 8. Jurados `[year]` ← siguiente (Gemini ya relevó)
- [ ] 9. Ganadores `[year]` (Gemini dejó solo datos crudos; 2024 y 2023 sólo en PDF)
- [ ] 10. Hall de la Fama (Gemini ya relevó)
- [ ] 11. Ranking `[country]` (Gemini ya relevó)
- [ ] 12. Contacto (incluye formulario nuevo)

Las 5 que faltan (8–12) están como placeholders y ya tienen su ruta y su smoke test.

---

## 7. Lo construido en detalle

### 7.1 Fase 1 — Esqueleto

- App Next.js que levanta en local y compila (estáticas + dinámicas por año/país +
  áreas privadas).
- Layout base: `TopBar` (accesos privados + redes), `MainNav` con dropdowns
  Jurados/Ganadores, `Footer` con descargas ES/PT + contacto.
- Las 15 páginas como placeholders vacíos; design tokens aplicados.

> [!NOTE]
> Decisión consciente: Payload + PostgreSQL **no** se cablearon en Fase 1 (no tiene
> sentido una base de datos para mostrar páginas vacías). La estructura quedó lista
> para que Payload entre limpio en la Fase 3.

### 7.2 Fase 2 — Páginas maquetadas (7/12)

Todas tiran de un mock tipado a través de la capa async (`lib/content`), con
SEO/Open Graph por página e imágenes como placeholders marcados `TODO`.

**Home** — las 8 secciones en el orden del original: hero "El FIP celebra sus 27
años", franja del informe de ganadores, los premios, texto institucional FIP 2025
con subsecciones, categorías 2026 (23 rubros), jurados 2026, auspiciantes, rankings.
Tiene **menú mobile** (hamburger) que afecta a todas las páginas. **Se corrigió para
alinearlo al sitio en vivo** (ver detalle abajo).

**Reglamento** — índice de anclas, artículos A–R con badges, tabla de puntajes
(Gran Prix 12 · Oro 10 · Plata 6 · Bronce 4 · Finalista 1), descargas ES/PT.

**Categorías** — header + grilla de 23 rubros numerados (anclas `#rubro-N`) +
"Ventajas a considerar" + detalle por rubro. Las **143 categorías** se extrajeron de
`categorias.pdf` (extracción por columnas). El Rubro 1 (MP) se dejó con el contenido
del **sitio en vivo** porque difiere del PDF.

**Inscripción** — pasos del proceso, condiciones y el bloque de "qué contiene la
presentación", desde el sitio en vivo vía `getInscripcion()`.

**Fechas de cierre** — descuentos por pago anticipado y tabla de cierres por región,
vía `getFechasCierre()`.

**Tarifario** — tarifas base, descuentos por cantidad, otras tarifas, formas de pago
(Argentina y exterior), envío de factura y descargas ES/PT, vía `getTarifario()`.

**Premios / Réplicas** — catálogo de 6 trofeos en cards (Agencia del Año 550, Marca
del Año 345, Gran Prix 420, FIP de Oro 380, FIP de Plata 380, FIP de Bronce 350),
tarifario de envío por peso (45/75/100), aviso de precios, medios de pago y
condiciones de envío, email de órdenes y descargas ES/PT, vía `getPremios()`.
Precios verificados uno por uno contra el sitio en vivo.

#### Correcciones de fidelidad del Home (alineación con el vivo)

Tras comparar el Home contra producción se aplicaron 4 correcciones en una sola
pasada (`fix(home)`):

1. **FIP 2025** — el cuerpo ya estaba en verbatim completo; se ajustaron los
   subtítulos a mayúsculas como en el vivo ("LA NOCHE DE LOS CAMPEONES", "LOS
   ANUNCIOS DEL FIP"). _(Esto cierra el pendiente histórico del copy verbatim.)_
2. **Franja del informe** — el vivo no tiene título "Muestra digital"; la franja
   quedó sólo con el CTA de descarga del informe (sin título ni imagen).
3. **Nombres de premios** — "Oro/Plata/Bronce" → "FIP de Oro/Plata/Bronce".
4. **"Quiero mi réplica"** — pasó de botón externo a ser un ítem más de la grilla de
   premios, como en el vivo.

### 7.3 Infraestructura (territorio Codex)

- **Boundaries** del App Router: `error.tsx`, `loading.tsx`, `not-found.tsx` en
  `src/app/[locale]/`.
- **ESLint** configurado (flat config) con scripts `npm run lint` y
  `npm run typecheck` listos para CI; ignores de artefactos generados (`.next/**`,
  `out/**`, `build/**`) y `tsconfig.tsbuildinfo` fuera de git.
- Auditoría de dependencias npm corrida (fase 1, sólo reporte): ver
  [`SECURITY-AUDIT-NPM.md`](./SECURITY-AUDIT-NPM.md) y sección 9.

### 7.4 Testing

**18 tests, todos en verde** (Vitest + Testing Library + jsdom). Cobertura actual:

- **Smoke** de todas las páginas maquetadas (renderizan sin error): públicas
  estáticas, públicas con datos (async) y dinámicas con un parámetro válido
  (`jurados/2026`, `ganadores/2025`, `ranking/colombia`).
- **Aserciones de dato crítico** en las páginas que lo ameritan: Premios (que aparezca
  el precio clave `550`) y Home (que aparezca `LA NOCHE DE LOS CAMPEONES`).
- Un test unitario de helper (`isExternal`).

> [!NOTE]
> **Criterio de testing acordado:** de cada página nueva en adelante, smoke (que
> renderice) **+ una sola** aserción de un dato crítico verificable (un precio o una
> fecha). Una, no una batería. El total de tests **sube o se mantiene, nunca baja**.
> Las aserciones pesadas se reservan para la Fase 3 (queries) y las áreas privadas
> (scoring), donde hay lógica real.

---

## 8. Discrepancias de contenido

Durante la carga de contenido aparecieron diferencias entre el sitio en vivo, el PDF
descargable y la auditoría. Se registran porque afectan la fidelidad y algunas
siguen pendientes. **Criterio aplicado: manda el sitio en vivo.**

1. **Marketing Promocional (MP)** — sitio en vivo y PDF son versiones distintas. El
   sitio tiene `MP.23` "Promociones navideñas" (el PDF no); `MP.5` dice cosas
   distintas; `MP.4` y `MP.9` difieren en redacción. Se dejó MP del sitio en vivo.
   ✅ _Resuelto a favor del sitio._
2. **Eventos (E)** — el PDF tiene `E.1–E.40` (no ~39). `E.16` se divide en `E.16 A`
   y `E.16 B`; falta `E.21` (salta de `E.20` a `E.22`). Más premio especial
   "Agencia del Año – Eventos".
3. **Prensa y RRPP (RRPP)** — el PDF tiene `RRPP.3` ("Mejor espacio o emprendimiento
   para eventos"); la auditoría decía solo 2.
4. **Marketing Puro (MPU)** — hay una 5ª categoría sin numerar ("Mejor acción de
   comunicación corporativa"); se codificó `MPU.5`.
5. **Premios "Red del Año" (Independientes + Mundiales)** — son premios globales del
   festival, no categorías de rubro. **No** se cargaron en Categorías; pendiente
   ubicarlos en Premios o Ganadores.
6. **Rubro 5 (Desarrollo Humano / `DH`)** — los encabezados internos del PDF dicen
   "FIP Salud y desarrollo humano". A confirmar contra el sitio.

> [!NOTE]
> Varias categorías no traen descripción en la fuente (`E.2`, `E.29`, `EM.3–8`,
> `MI.1`, `D.5`, `MD.1`) — quedan sin descripción a propósito, no son `TODO`. Los
> íconos de premio (oro/cristal/platino) son placeholders hasta tener los PNG reales.

---

## 9. Equipo de agentes y documentos de proceso

El proyecto pasó de un asistente solo a un **equipo de 3 agentes** que trabajan sin
pisarse usando **git worktrees** y roles diferenciados. El detalle vive en dos
documentos del repo: [`ROADMAP.md`](./ROADMAP.md) (el _qué_ y el _orden_) y
[`ORQUESTACION-AGENTES.md`](./ORQUESTACION-AGENTES.md) (el _quién_ y el _cómo_).

| Agente | Rol | Territorio (qué toca) |
|--------|-----|----------------------|
| **Claude Code** | Core del producto | `app/[locale]/(public)/**`, `components/**`, `mocks/**`, `lib/content/**` |
| **Codex (GPT-5.5)** | Infra + QA + seguridad | config, boundaries, `src/test/**`, `middleware.ts`, CI |
| **Gemini CLI** | Relevamiento e investigación | `_scratch/**` (cero código) |
| **Vos** | Tech lead | `main` (el único que mergea) — aprueba todo |

> [!IMPORTANT]
> La división es por **tipo de archivo**, no por página. Dos agentes nunca tocan el
> mismo archivo a la vez; si hace falta, se serializa. La zona de fricción es
> `package.json` y `lib/content/`: un solo agente la toca por tanda.

### Relevamientos de Gemini (en `_scratch/`)

Material de investigación que adelanta contenido de páginas pesadas. **Sólo lectura
para maquetar; nunca es código.** Lo que hay hoy:

- `Relevamiento_Jurados.md`
- `Relevamiento_Rankings.md`
- `Relevamiento_HallFama.md`
- `Relevamiento_Premios.md`
- `Comparison_Home.md` — comparación de textos del Home contra el vivo
- `Muestra_Digital_Analisis.md` — análisis de la franja entre el hero y los premios

> [!CAUTION]
> **Ganadores** es la página más cara que falta. En `_scratch/` sólo hay **datos
> crudos** (`ganadores_php_data.json`), no un `Relevamiento_Ganadores.md` prolijo, y
> **2024 y 2023 existen sólo en PDF** (no hay página HTML scrapeable). Antes de
> maquetarla, conviene pedirle a Gemini un relevamiento prolijo o trabajar directo de
> esos PDFs.

### Documentos de análisis en el repo

- [`SECURITY-AUDIT-NPM.md`](./SECURITY-AUDIT-NPM.md) — reporte de vulnerabilidades de
  dependencias npm (fase 1: sólo diagnóstico, sin aplicar fixes todavía).
- [`JURADOS-SCORING-SPEC.md`](./JURADOS-SCORING-SPEC.md) — spec técnica preliminar del
  sistema de scoring de jurados, para la Fase 6 (la más compleja).

---

## 10. Git y respaldo

Proyecto versionado y respaldado en **`github.com/alit0/fip`**. Local y remoto
sincronizados.

> [!IMPORTANT]
> **Flujo de ramas: `main` + `develop`.** `main` es la rama **sagrada** (estable,
> publicable, solo recibe releases — nadie commitea ahí directo). `develop` es la
> rama de integración / trabajo diario donde cae todo. `main` se actualiza desde
> `develop` solo en un release (hito publicable). El detalle del flujo está en
> [ORQUESTACION-AGENTES.md](./ORQUESTACION-AGENTES.md).

> [!WARNING]
> **Incidente resuelto:** en el setup inicial hubo confusión de carpetas (una
> subcarpeta `fip` vacía creada por la herramienta de memoria "engram" se borró, lo
> que generó un susto). No se perdió nada porque el repo estaba en GitHub.
> **Aprendizaje aplicado:** commit + push al cerrar cada fase/página.

### Rutina de git del proyecto

El trabajo vive en `develop`: Claude Code commitea directo ahí (con el OK del tech
lead tras la revisión) y Codex usa ramas `feat/codex-*` sacadas de `develop`. Solo el
tech lead integra a `develop` y promueve a `main` en los releases; **nadie commitea
en `main` directo**. Para publicar tu propio trabajo alcanza con:

```bash
git push
```

El `git add . && git commit` manual suele responder "nothing to commit" porque los
commits ya están hechos en unidades limpias. Para clonar el proyecto en otra máquina:

```bash
git clone https://github.com/alit0/fip.git
```

> [!CAUTION]
> La carpeta `img` (capturas de referencia + PDFs/PPTs fuente) y los artefactos de
> `_scratch/` están **fuera de git** (no se suben a GitHub). El asistente puede
> leerlos desde el disco, pero **no están respaldados en la nube**. _Decisión
> pendiente: versionarlos aparte o respaldarlos si se quiere tenerlos a salvo._

---

## 11. Pendientes y próximos pasos

### 11.1 Próximos pasos inmediatos (en orden)

1. **Seguir Fase 2** — maquetar las 5 páginas restantes (Jurados `[year]`, Ganadores
   `[year]`, Hall de la Fama, Ranking `[country]`, Contacto), una por vez, revisando
   en el navegador y comparando contra el vivo. Usar los relevamientos de Gemini de
   `_scratch/` como fuente.
2. **Conseguir el relevamiento de Ganadores** que falta en `_scratch/` (o trabajar
   desde los PDFs, recordando que 2024 y 2023 son sólo PDF).
3. **Decidir sobre la auditoría npm fase 2** — aplicar (o no) los fixes de seguridad
   reportados en `SECURITY-AUDIT-NPM.md`. Pendiente de decisión.

### 11.2 Pendientes de contenido

- [ ] Ubicar los premios "Red del Año" (Independientes + Mundiales).
- [ ] Confirmar el nombre del Rubro 5 (Desarrollo Humano vs. "FIP Salud y desarrollo humano").
- [ ] Reemplazar todos los placeholders de imágenes por assets reales (fotos de
  jurados, logos, íconos de premios, sello "27", banderas, imágenes OG).

### 11.3 Deuda técnica anotada

- [ ] **Renombrar `MuestraDigital.tsx`** — tras la corrección del Home, el componente
  ya no maqueta ninguna "muestra digital" (es la franja del informe de ganadores). El
  nombre quedó sin describir lo que hace; renombrar en un refactor aparte.

### 11.4 Sobre el testing (criterio acordado)

No obsesionarse con cobertura total ahora. En Fase 2 (páginas estáticas con mock) lo
visual se valida mirando el navegador, y cada página suma su smoke + una aserción de
dato crítico. El testing serio se concentra donde hay **lógica real**: las queries de
la Fase 3 y, sobre todo, las áreas privadas — el wizard de carga de agencias y el
scoring de jurados (4 criterios, votos bloqueables). Ahí un bug no es un color
corrido: es un voto mal calculado o una campaña que no se guarda.

### 11.5 Recordatorios de método

- Una página/tarea por vez por agente; revisar en el navegador antes de aprobar;
  commit + push a `develop` antes de seguir. **`main` es sagrada: nadie commitea ahí
  directo; solo el tech lead la actualiza en un release.**
- No afirmarle al asistente que algo está hecho sin verificarlo en git.
- Después de cada corrida de Gemini, correr `git status` para confirmar que no se
  escapó de `_scratch/`.
- Modelo potente para pensar (arquitectura, páginas complejas); modelo más económico
  para maquetado repetitivo.
- Para páginas con mucho contenido (Categorías, Ganadores), tirar de los PDFs
  descargables en vez de transcribir de capturas: más exacto y más rápido.
- Antes de cualquier comando que cree, borre o sobrescriba carpetas o cambie de rama
  (worktrees lo hacen más delicado), leer qué toca.

---

## See Also

- [ROADMAP.md](./ROADMAP.md) — qué se construye y en qué orden (con la capa de agentes).
- [ORQUESTACION-AGENTES.md](./ORQUESTACION-AGENTES.md) — manual del equipo (worktrees, roles, anti-pisada, merge).
- [SECURITY-AUDIT-NPM.md](./SECURITY-AUDIT-NPM.md) — reporte de auditoría de dependencias.
- [JURADOS-SCORING-SPEC.md](./JURADOS-SCORING-SPEC.md) — spec preliminar del scoring (Fase 6).

---

> **Estado al cierre de esta sesión:** Fase 2 con 7 de 12 páginas (Home, Reglamento,
> Categorías, Inscripción, Fechas de cierre, Tarifario, Premios) maquetadas,
> verificadas y pusheadas; Home alineado al sitio en vivo. Cimientos arquitectónicos
> (capa async + ruteo i18n) y andamiaje de testing (18 tests en verde) hechos. Equipo
> de 3 agentes en marcha con git worktrees. **Próximo paso sugerido:** maquetar las 5
> páginas restantes de Fase 2, empezando por Jurados `[year]`.
