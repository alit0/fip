# Bitácora del proyecto — Réplica web FIP Festival

> Réplica de [fipfestival.com.ar](https://www.fipfestival.com.ar/) en **Next.js + Payload CMS**.
> Documento de referencia para retomar el proyecto o traspasarlo a otra persona.

**Estado:** Fase 3 EN CURSO — Payload CMS base integrado · PostgreSQL en Docker · Admin /admin funcionando
**Repositorio:** `github.com/alit0/fip` (trabajo en `develop`; `main` = releases)
**Última actualización:** 7 de junio de 2026

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
│     └─ (payload)/              # admin CMS + API (cableado en Fase 3) ✅
│        ├─ admin/[[...segments]]/ page.tsx, not-found.tsx
│        ├─ admin/importMap.js
│        ├─ api/[...slug]/route.ts
│        └─ layout.tsx
├─ collections/                  # SCHEMA Payload = modelo de datos (Fase 3) ✅
│  ├─ Users.ts, Media.ts, Sponsors.ts
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
| **Fase 2** | Frontend público con datos mock: maquetar las 12 páginas, responsive + SEO | ✅ Completa (12/12) — release a `main` |
| **Fase 3** | Backend/API + CMS: collections de Payload, PostgreSQL, panel admin, storage, migrar mock→queries | 🔄 En curso — Payload base + PostgreSQL + Admin integrados |
| **Fase 4** | i18n es/pt: campos traducibles + UI con next-intl + descargas por idioma | ⏳ Pendiente (rieles ya puestos en Hito 1) |
| **Fase 5** | Área privada Agencias: login, dashboard, wizard de 4 pasos, validaciones | ⏳ Pendiente |
| **Fase 6** | Área privada Jurados: scoring por 4 criterios, votos bloqueables, reportes (la más compleja) | ⏳ Pendiente |

> [!NOTE]
> Los **cimientos arquitectónicos** (capa de datos async + ruteo i18n con `[locale]`
> y next-intl) corresponden al **Hito 1** del [ROADMAP](./ROADMAP.md) y ya están
> hechos. Por eso la Fase 4 sólo tiene que cargar contenido sobre rieles existentes.

### Progreso de la Fase 2 (páginas)

- [x] 1. **Home** — hero, premios, FIP 2025, categorías, jurados, auspiciantes, rankings (corregido para alinearlo al sitio en vivo)
- [x] 2. **Reglamento** — índice, artículos A–R, tabla de puntajes **+ cuerpos verbatim cargados**
- [x] 3. **Categorías** — 23 rubros, 143 categorías reales (desde PDF + MP del sitio en vivo)
- [x] 4. **Inscripción** — pasos, condiciones, contenido de la presentación
- [x] 5. **Fechas de cierre** — descuentos por pago anticipado + tabla de cierres regionales
- [x] 6. **Tarifario** — aranceles, descuentos por cantidad, formas de pago, envío de factura
- [x] 7. **Premios / Réplicas** — catálogo de 6 trofeos con precios, tarifario de envío, medios de pago
- [x] 8. **Jurados `[year]`** — grilla por año (2020-2026), país/bandera; fuente v2 con flag interno de verificación
- [x] 9. **Ganadores `[year]`** — híbrida (completo / parcial / solo-PDF) con botones de informe en PDF
- [x] 10. **Hall de la Fama** — bloque institucional + miembros (bio en texto o en imagen)
- [x] 11. **Ranking `[country]`** — tabla histórica 2017-2024 por país (6 países)
- [x] 12. **Contacto** — datos de contacto + formulario (client component; envío sin backend, TODO Fase 3)

Las 12 páginas públicas están maquetadas sobre la capa async + i18n, con smoke tests y
aserciones de datos críticos. **Release de Fase 2 a `main`** hecho (ver "Estado al cierre").

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

### 7.2 Fase 2 — Páginas maquetadas (12/12)

Todas tiran de un mock tipado a través de la capa async (`lib/content`), con
SEO/Open Graph por página e imágenes como placeholders marcados `TODO`.

**Home** — las 8 secciones en el orden del original: hero "El FIP celebra sus 27
años", franja del informe de ganadores, los premios, texto institucional FIP 2025
con subsecciones, categorías 2026 (23 rubros), jurados 2026, auspiciantes, rankings.
Tiene **menú mobile** (hamburger) que afecta a todas las páginas. **Se corrigió para
alinearlo al sitio en vivo** (ver detalle abajo).

**Reglamento** — índice de anclas, artículos A–R con badges, tabla de puntajes
(Gran Prix 12 · Oro 10 · Plata 6 · Bronce 4 · Finalista 1), descargas ES/PT.
**Cuerpos legales verbatim cargados** (17 de 18 artículos, desde
`_scratch/Texto_Canonico_Vivo.md`): pasó de solo-estructura a **contenido completo**.
El Art. O queda sin cuerpo a propósito (el vivo solo tiene su título, sin texto legal).

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
   ANUNCIOS DEL FIP"). _(Pendiente histórico del copy verbatim **RESUELTO**:
   confirmado contra `_scratch/Texto_Canonico_Vivo.md` por la auditoría de fidelidad.)_
2. **Franja del informe** — el vivo no tiene título "Muestra digital"; la franja
   quedó sólo con el CTA de descarga del informe (sin título ni imagen).
3. **Nombres de premios** — "Oro/Plata/Bronce" → "FIP de Oro/Plata/Bronce".
4. **"Quiero mi réplica"** — pasó de botón externo a ser un ítem más de la grilla de
   premios, como en el vivo.

### 7.3 Fase 3 — Payload CMS base (en curso)

**PostgreSQL:** base de datos PostgreSQL 16 Alpine levantada con Docker Compose
(`docker compose up -d`). Contenedor `fip-postgres`, usuario `fip_user`, base
`fip_dev`, puerto `5432`, volumen persistente `fip_postgres_data`. Healthcheck con
`pg_isready`.

**Payload CMS 3:** integrado como dependencia dentro de la misma app Next.js.
Configuración en `payload.config.ts` (raíz del proyecto) con:
- `@payloadcms/db-postgres` conectado vía `DATABASE_URI` de `.env.local`.
- `@payloadcms/richtext-lexical` como editor.
- Localization rails `es`/`pt` preparados (`defaultLocale: es`, `fallback: true`).
- Tipos generados en `src/payload-types.ts`.

**Collections iniciales creadas:**
- `Users` — auth mínima (`auth: true`, email/password). Para entrar al admin.
  Sin roles complejos todavía (Fase 5-6).
- `Media` — uploads para imágenes, PDF, PPTX, DOCX. `staticDir: 'media'`.
  Storage local primero; S3 pendiente.
- `Sponsors` — `name` (requerido), `country`, `countryCode` (ISO alpha-2),
  `logo` (upload→Media, opcional), `url`, `order`, `active` (default `true`).

**Rutas de Payload:** bajo `src/app/(payload)/` (fuera del `[locale]` de i18n):
- `admin/[[...segments]]/page.tsx` — panel admin (`/admin`).
- `api/[...slug]/route.ts` — REST API (`/api`).
- `layout.tsx` — `RootLayout` con `serverFunction` e `importMap`.

**Middleware:** next-intl excluye `/admin` del matcher para no interferir.

**Dependencias instaladas:** `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`,
`@payloadcms/richtext-lexical`, `sharp`, `graphql`.

**Nota técnica:** la instalación usó `--legacy-peer-deps` porque
`@payloadcms/next@3.85.0` espera Next.js `<15.5.0` pero el proyecto tiene
`next@15.5.19`. No afecta el funcionamiento (build, typecheck y tests en verde).

**Pipeline real validado — mini-hito cerrado (7 jun 2026):**

`getSponsors()` ahora lee Payload primero y cae al mock si:
- DB no disponible
- Payload falla
- `docs: []` (sin sponsors activos en la base)

El fallback mock ("Avid") queda intacto como red de seguridad cuando Payload
no responde o no tiene datos. Home ya renderiza sponsors reales desde Payload
(`Test Payload Sponsor`, `Test Payload Sponsor 2`); el mock no apareció,
confirmando que el pipeline real está funcionando.

**Tests subidos a 32** (desde 25): se agregaron 7 tests focales para `getSponsors()`
cubriendo:
- Payload con docs válidos → mapping correcto de `name`, `url`, `logoUrl`
- Payload con `docs: []` → fallback mock
- Payload con error → fallback mock
- Protección contra mutación del campo `name` (mutation testing confirma)

**Mutation testing:** antes de este cambio, los tests no detectaban roturas en
el mapping de `name`; ahora sí. Fue el indicador de que el pipeline real estaba
validado.

**`/admin` funciona** — puede tener timeout inicial (>30s) por carga pesada
de Payload CMS durante el primer arranque.

**Pendientes específicos de Sponsors:**
- ~~Seed formal de Sponsors~~ ✅ Hecho: `npm run seed:sponsors`
- Resolver `logoUrl` real desde Media (actualmente hardcodeado como `null`)

**Próximas migraciones:** ~~`Edition`~~ ✅ Hecho. Siguiente: `Rubro` (depende de Edition),
luego `Category → Winner`. El patrón ya está probado dos veces (Sponsors y Edition).

**Seed formal de Sponsors — mini-hito cerrado (7 jun 2026):**

Script oficial creado en `scripts/seed-sponsors.ts` para cargar sponsors desde
`src/mocks/sponsors.json` a Payload/PostgreSQL. Comando: `npm run seed:sponsors`.

**Comportamiento:**
- Lee los 4 sponsors del mock: AEVEA, Nuevo Marketing, La Fundación, Hall de la Fama
- Upsert por `name` (exact match): si existe, actualiza `url`/`active`/`order`; si no, crea
- Idempotente: correr dos veces no duplica
- No borra datos existentes (no implementa delete/reset)
- No sube logos todavía (`logoUrl` queda pendiente; Media no está cableada)
- Mapea: `name`, `url`, `active: true`, `order` (índice del array)
- NO mapea `country`/`countryCode` (no están en el mock actual)

**Requisitos:**
- PostgreSQL corriendo (`docker compose up -d`)
- `.env.local` con `DATABASE_URI` y `PAYLOAD_SECRET`

**Datos de prueba locales:** la DB local tiene 2 sponsors adicionales (`Test Payload Sponsor`,
`Test Payload Sponsor 2`) creados manualmente durante verificación del pipeline. No son parte
del seed oficial; pueden limpiarse manualmente si molestan, pero no afectan el funcionamiento.

**Pendiente específico:**
- Resolver `logoUrl` real desde Media (actualmente hardcodeado como `null` en mock y seed)

**Edition mínimo — mini-hito cerrado (7 jun 2026):**

Collection Payload `Editions` creada como raíz del backbone del modelo de datos
(entidad sin dependencias que agrupa Rubros, Categorías, Ganadores, etc.).

**Comportamiento:**
- Campos: `year` (number, required, unique), `isCurrent` (checkbox, default false),
  `title` (text opcional), `status` (select: draft/active/closed)
- Getter `getCurrentEdition()` en `src/lib/content/edition.ts`
- Intenta leer desde Payload: `find({ where: { isCurrent: true }, limit: 1 })`
- Fallback seguro si Payload falla, docs vacío, o tabla no existe:
  ```ts
  { year: 2026, isCurrent: true, title: "FIP Festival 2026", status: "active" }
  ```
- Seed idempotente por `year`: `npm run seed:edition`
- No borra ediciones existentes
- Warn si hay múltiples ediciones con `isCurrent=true`

**Tests subidos a 38** (desde 32): se agregaron 6 tests para `getCurrentEdition()`
cubriendo:
- Payload con doc actual → devuelve Payload
- Payload con docs vacío → fallback 2026
- Payload con error → fallback 2026
- Payload null → fallback 2026
- Title fallback si falta en doc
- Status null si falta en doc

**DB validada:** 1 edición 2026, sin duplicados por year.

**Rubros — mini-hito cerrado (7 jun 2026):**

Collection Payload `Rubros` creada y cableada al backbone. Representa los grandes
segmentos del festival (MP, Eventos, etc.).

**Comportamiento:**
- Campos: `number` (number), `code` (text), `name` (text localized),
  `description` (textarea localized), `order` (number), `edition` (rel. Editions).
- Getter `getRubros()` en `src/lib/content/rubros.ts` (movido desde `catalog.ts`).
- Mapping dinámico: resuelve `editionYear` desde la relación con `Editions`.
- Fallback seguro a mocks (`rubros.json`) si Payload falla o no hay datos.
- Seed idempotente por `edición + número`: `npm run seed:rubros`.
- Carga los 23 rubros estándar del festival asociados a la edición 2026.

**Tests subidos a 42** (desde 38): se agregaron 4 tests para `getRubros()`
cubriendo:
- Payload con docs → mapping correcto (incluyendo `href` dinámico).
- Fallback a mocks si DB está vacía o falla.
- Resolución de `editionYear` por relación expandida o fallback.

**DB validada:** 23 rubros creados, asignados a edición 2026.

**Categorías — mini-hito cerrado (7 jun 2026):**

Collection Payload `Categories` creada y cableada al backbone relacional.
Establece la jerarquía `Edition → Rubro → Category`.

**Comportamiento:**
- Campos: `rubro` (rel. Rubros), `edition` (rel. Editions), `code` (text),
  `title` (text localized), `description` (textarea localized), `awardIcon` (select),
  `isSpecial`, `specialType`, `isNew` (flags), `order` (number).
- Getter `getCategories()` en `src/lib/content/categories.ts` (nuevo archivo).
- Mapping dinámico: resuelve `rubroCode`, `rubroNumber` y `editionYear` mediante
  relaciones de profundidad 2 (`depth: 2`).
- Fallback seguro a mocks (`categories.json`) mapeados dinámicamente si Payload falla.
- Seed idempotente por `edición + rubro + código`: `npm run seed:categories`.
- Carga las 147 categorías reales del festival vinculadas a sus rubros.

**Tests subidos a 46** (desde 42): se agregaron 4 tests para `getCategories()`
cubriendo:
- Payload con docs → mapping relacional correcto.
- Fallback a mocks con reconstrucción dinámica del mapa de rubros.
- Manejo de relaciones no expandidas (fallbacks a 0 / string vacío).

**DB validada:** 147 categorías creadas, vinculadas a sus 23 rubros padres.

**Winners — mini-hito cerrado (7 jun 2026):**

Collection Payload `Winners` creada y cableada al backbone relacional.
Completa el núcleo duro del modelo de datos del festival.

**Comportamiento:**
- Campos: `edition` (rel. Editions), `rubro` (rel. Rubros), `category` (rel. Categories),
  `awardLevel` (select), `specialAwardName` (text localized), `campaign` (text),
  `brand` (text), `agency` (text), `country` (text), `isGrandReco` (checkbox).
- Getter `getWinners()` en `src/lib/content/winners.ts` (nuevo archivo).
- Fallback dinámico: realiza un "flattening" del archivo anidado `ganadores.json`
  para entregar una lista plana compatible con el nuevo modelo.
- Seed idempotente por `edición + categoría + nivel + campaña + agencia`:
  `npm run seed:winners`.
- **Regla de integridad:** El seed NO crea ediciones automáticamente; requiere que el
  backbone (`Edition` y `Categories`) para el año en cuestión ya existan en la DB.

**Tests subidos a 50** (desde 46): se agregaron 4 tests para `getWinners()`
cubriendo:
- Payload con docs → mapping relacional profundo (`depth: 2`).
- Fallback a mocks con aplanado de años, rubros y categorías.
- Manejo de relaciones no expandidas con fallbacks seguros.

**DB local:** Estructura de tablas y tipos creada. Registros de ganadores en 0
esperando la carga de categorías históricas.

**Ranking — mini-hito cerrado (7 jun 2026):**

Collection Payload `RankingEntries` creada para gestionar los rankings históricos
por país.

**Comportamiento:**
- Campos: `country` (text), `countrySlug` (text indexed), `year` (number),
  `position` (number), `agency` (text), `granPrix`, `oro`, `plata`, `bronce`,
  `total` (numbers), `order` (number).
- Getter `getRankingEntries()` en `src/lib/content/rankings.ts` (nuevo archivo).
- Fallback dinámico: aplana el objeto anidado `ranking.json` a una lista plana.
- Seed idempotente por `countrySlug + year + position + agency`:
  `npm run seed:rankings`.
- **Nota histórica:** se utiliza `2024` como año representativo para el rango
  consolidado `2017-2024` del mock actual.

**Tests subidos a 53** (desde 50): se agregaron 3 tests para `getRankingEntries()`
cubriendo:
- Payload con docs → mapping directo al shape público.
- Fallback a mocks con aplanado de países y filas.
- Fallback ante fallo de conexión a DB.

**DB local validada:** 145 entradas de ranking cargadas (6 países).

**Jurors — mini-hito cerrado (8 jun 2026):**

Collection Payload `Jurors` creada para gestionar el cuerpo de jurados del festival.

**Comportamiento:**
- Campos: `edition` (rel. Editions), `name` (text), `role` (text), `agency` (text),
  `country` (text), `countryCode` (text), `bio` (textarea), `photo` (rel. Media, opcional),
  `order` (number), `active` (checkbox).
- Getter `getJurors()` en `src/lib/content/jurors.ts` (nuevo archivo).
- Payload-first con fallback mock seguro.
- Seed idempotente por `name + edition`: `npm run seed:jurors`.
- **Regla de integridad:** El seed NO crea ediciones automáticamente; si falta la Edition
  correspondiente, saltea el jurado y avisa.
- Genera `slug` dinámicamente desde `name` (lowercase + hyphens).

**Tests subidos a 61** (desde 53): se agregaron 8 tests para `getJurors()`
cubriendo:
- Payload con docs → mapping correcto (incluyendo slug dinámico).
- Fallback a mocks si DB está vacía o falla.
- Manejo de relaciones no expandidas con fallbacks seguros.
- Validación de campos opcionales (photo, bio).

**DB local validada:** Estructura de tablas y tipos creada. Seed listo para ejecutar
cuando haya ediciones en la DB.

**HallOfFameMembers — mini-hito cerrado (8 jun 2026):**

Collection Payload `HallOfFameMembers` creada para gestionar los miembros históricos del Hall de la Fama.
A diferencia de Jurors o Winners, es una entidad histórica/global sin relación estricta con `Edition`.

**Comportamiento:**
- Campos: `slug` (text unique), `name` (text), `role` (text localized), `company` (text),
  `country` (text), `countryCode` (text), `photo` (rel. Media, opcional), `logo` (rel. Media, opcional),
  `bio` (richtext localized), `inductionYear` (number, opcional), `order` (number), `active` (checkbox).
- Getter `getHallOfFameMembers()` en `src/lib/content/hallOfFameMembers.ts` (nuevo archivo).
- Payload-first con fallback mock seguro desde `hall-de-la-fama.json`.
- Seed idempotente por `slug`: `npm run seed:hall-of-fame`.
- No duplica, no inventa datos y no sube Media todavía (fotos/logos quedan vacíos si faltan en mock).

**Tests subidos a 70** (desde 61): se agregaron tests para `getHallOfFameMembers()`
cubriendo:
- Payload con docs → mapping correcto.
- Fallback a mocks si DB está vacía o falla.
- Ordenamiento y campos opcionales.

**DB local validada:** Estructura de tablas y tipos creada.

**Backbone actual consolidado:** `Edition → Rubro → Category → Winner` + `Ranking` + `Jurors` + `HallOfFameMembers`.

**Próximo slice técnico:** `DownloadFiles` o `PageContent/SiteConfig`.

**Pendiente en Fase 3:**
- Migrar el resto de `lib/content/` de mock → queries de Payload (sin tocar páginas).
- ~~Crear collection Edition~~ ✅ Hecho. Crear el resto de las collections (Rubro, Category, Juror, Winner, etc.)
  según el plan en `_scratch/Plan_Collections_Fase3.md`.
- Storage S3 para producción.
- Script de seed desde `src/mocks/`.

### 7.4 Infraestructura (territorio Codex)

- **Boundaries** del App Router: `error.tsx`, `loading.tsx`, `not-found.tsx` en
  `src/app/[locale]/`.
- **ESLint** configurado (flat config) con scripts `npm run lint` y
  `npm run typecheck` listos para CI; ignores de artefactos generados (`.next/**`,
  `out/**`, `build/**`) y `tsconfig.tsbuildinfo` fuera de git.
- Auditoría de dependencias npm corrida (fase 1, sólo reporte): ver
  [`SECURITY-AUDIT-NPM.md`](./SECURITY-AUDIT-NPM.md) y sección 9.

### 7.5 Testing

**25 tests, todos en verde** (Vitest + Testing Library + jsdom). Cobertura actual:

- **Smoke** de las 12 páginas públicas (renderizan sin error): públicas estáticas,
  públicas con datos (async) y dinámicas con un parámetro válido (`jurados/2026`,
  `ganadores/2025`, `ranking/colombia`).
- **Aserciones de dato crítico** en las páginas que lo ameritan: Premios (`550`), Home
  (`LA NOCHE DE LOS CAMPEONES`), Jurados (un jurado con su país), Ganadores (caso
  completo y caso solo-PDF), Ranking (una agencia), Contacto (email + formulario) y
  Reglamento (cuerpo verbatim de un artículo).
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

### Documentos históricos de Emi (Referencia Funcional)

Los archivos en `PDF/` (`Definición de Proyecto_ FIP.md` y `Flujo del Sitio Web...`)
datan de agosto 2025. Sirven como visión original del proyecto.

- **Veredicto:** Referencia funcional histórica, NO fuente técnica actual.
- **Coincidencias:** Validan la visión general (sitio público, CMS, portales,
  rankings, PDFs).
- **Obsolescencia:** Strapi fue reemplazado por Payload CMS; la arquitectura de
  API separada por una app única Next.js.
- **Impacto:** Nada en estos documentos bloquea la Fase 3. El próximo slice técnico
  sigue siendo `Winner`.
- **Decisiones pendientes (extraídas de la visión original):**
  - Criterios finales de scoring de jurados (unificar nombres entre docs).
  - Definición de roles avanzados (Owner / Admin / Comité Ejecutivo).
  - Dashboard de estadísticas para el administrador.
  - Sistemas de notificaciones, historial de cambios (auditoría) y exportaciones.

### Documentos históricos de Emi (agosto 2025)

En `PDF/` hay dos documentos de la visión funcional original del proyecto:

- `Definición de Proyecto_ FIP.md`
- `FIP Festival - Flujo del Sitio Web y App Autoadministrable.md`

> [!IMPORTANT]
> **Estos documentos son referencia funcional histórica, no fuente técnica actual.**
> El proyecto cambió Strapi por Payload CMS, la paleta pasó de negro/blanco/dorado a
> dark mode púrpura/dorado (fidelidad al sitio vivo), y el modelo de datos evolucionó
> significativamente. Leer con contexto: son la visión de agosto 2025, no el estado actual.

**Qué coinciden con el proyecto actual:**
- Visión general: sitio público, CMS editable, portal de agencias, portal de jurados,
  ganadores, rankings, PDFs descargables.
- Priorización: público primero, áreas privadas después.
- Stack base: Next.js + PostgreSQL.

**Qué quedó obsoleto:**
- **Strapi** → reemplazado por **Payload CMS 3** (monolito dentro de la misma app Next.js).
- Paleta de colores (negro/blanco/dorado → púrpura/dorado dark mode).
- Roles originales (Owner/Admin/Agencia/Jurado → modelo actual con Admin sin Owner separado).
- Ritmo de ejecución (Emi era más agresiva; el proyecto actual usa 7 fases graduales).

**Decisiones pendientes para fases futuras (rescatables de Emi):**
- Criterios finales de scoring de jurados (hay 3 variantes en circulación: Emi 1, Emi 2,
  y BITACORA actual — resolver con cliente antes de Fase 6).
- Separación Owner / Admin / Comité Ejecutivo (para Fase 5).
- Dashboard admin con estadísticas (post-lanzamiento).
- Notificaciones (email a agencias tras envío, alertas a jurados).
- Auditoría de cambios en el CMS (quién editó qué y cuándo).
- Exportaciones de datos (ganadores, rankings, votos de jurados).

**Nada de estos documentos bloquea la Fase 3 actual.** Ya implementamos Rubro, Category, Winner, RankingEntries y Jurors. El próximo slice técnico es `HallOfFameMembers`. Los documentos de Emi son útiles como checklist funcional para Fases 5 y 6, pero requieren reconciliación con el estado actual antes de usarse como spec.

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

Fase 2 está **completa** (12/12, con release a `main`). **Fase 3 está en curso** — el
vertical slice inicial (Payload base + PostgreSQL + Admin + collections Users/Media/Sponsors/Editions/Rubros/Categories/Winners)
está funcionando. Lo que sigue:

1. **Migrar `lib/content/` mock → queries de Payload** — ~~`getSponsors()`~~ ✅ hecho,
   ~~`getCurrentEdition()`~~ ✅ hecho, ~~`getRubros()`~~ ✅ hecho, ~~`getCategories()`~~ ✅ hecho,
   ~~`getWinners()`~~ ✅ hecho, ~~`getRankingEntries()`~~ ✅ hecho, ~~`getJurors()`~~ ✅ hecho,
   ~~`getHallOfFameMembers()`~~ ✅ hecho.
   Siguiente: backbone `DownloadFiles` o `PageContent/SiteConfig`.
2. **Crear el resto de las collections** según el orden topológico definido en
   `_scratch/Plan_Collections_Fase3.md`: SiteConfig, PageContent,
   DownloadFile.
3. **Storage S3 para producción** — reemplazar `staticDir: 'media'` por adapter S3.
4. ~~**Script de seed**~~ ✅ Hecho: `npm run seed:sponsors`, `npm run seed:rubros`, `npm run seed:categories`, `npm run seed:winners`, `npm run seed:rankings`, `npm run seed:jurors` y `npm run seed:hall-of-fame` cargan datos desde mocks.
5. Codex escribe tests de integración para las queries de `lib/content/` en paralelo.

### 11.2 Pendientes de contenido

- [ ] Ubicar los premios "Red del Año" (Independientes + Mundiales).
- [ ] Confirmar el nombre del Rubro 5 (Desarrollo Humano vs. "FIP Salud y desarrollo humano").
- [ ] Reemplazar todos los placeholders de imágenes por assets reales (fotos de
  jurados, logos, íconos de premios, sello "27", banderas, imágenes OG).
- [ ] **Consulta cliente/FIP:** el Art. R del Reglamento dice "Vigencia: 31 de Junio
  2026" — junio tiene 30 días. Es un **error de contenido del vivo** (no un typo), se
  dejó **verbatim**. Confirmar el valor correcto con el cliente.

### 11.3 Auditoría de fidelidad de texto y pulido (Hito 7)

- [ ] **Referencia de fidelidad:** `_scratch/Texto_Canonico_Vivo.md` contiene el texto
  verbatim del vivo (extraído el 2/6/2026) de las **5 páginas institucionales** (Home,
  Reglamento, Inscripción, Tarifario, Premios). Es la fuente para auditar la fidelidad
  de texto en el pulido del Hito 7.
- [ ] **Inscripción — variaciones menores vs el vivo** (detectadas en la auditoría de
  fidelidad): "Muestra Digital" debería decir "Muestra Itinerante"; ajustes de
  puntuación/énfasis. Cosmético, para el Hito 7.

### 11.4 Deuda técnica anotada

- [ ] **Renombrar `MuestraDigital.tsx`** — tras la corrección del Home, el componente
  ya no maqueta ninguna "muestra digital" (es la franja del informe de ganadores). El
  nombre quedó sin describir lo que hace; renombrar en un refactor aparte.

### 11.5 Sobre el testing (criterio acordado)

No obsesionarse con cobertura total ahora. En Fase 2 (páginas estáticas con mock) lo
visual se valida mirando el navegador, y cada página suma su smoke + una aserción de
dato crítico. El testing serio se concentra donde hay **lógica real**: las queries de
la Fase 3 y, sobre todo, las áreas privadas — el wizard de carga de agencias y el
scoring de jurados (4 criterios, votos bloqueables). Ahí un bug no es un color
corrido: es un voto mal calculado o una campaña que no se guarda.

### 11.6 Recordatorios de método

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

> **Estado al cierre de esta sesión (8 jun 2026):** **Fase 3 EN CURSO** —
> Payload CMS 3 base integrado con PostgreSQL 16 en Docker. Admin `/admin`
> funcionando con collections `Users` (auth), `Media` (uploads), `Sponsors`,
> `Editions`, `Rubros`, `Categories`, `Winners`, `RankingEntries`, `Jurors`
> y `HallOfFameMembers`. Localization rails `es`/`pt` preparados. `.env.local`
> requerido (gitignoreado). **70 tests en verde** (subió de 61 con 9 tests para
> `getHallOfFameMembers()`). Typecheck y build limpios. Las 12 páginas
> públicas de Fase 2 intactas. **Ocho pipelines reales validados:** `getSponsors()`,
> `getCurrentEdition()`, `getRubros()`, `getCategories()`, `getWinners()`,
> `getRankingEntries()`, `getJurors()` y `getHallOfFameMembers()`
> → Payload con fallback seguro. Backbone relacional consolidado; siguiente
> slice: `DownloadFiles` o `PageContent/SiteConfig`.

