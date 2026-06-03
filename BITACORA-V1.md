# Bitácora del proyecto — Réplica web FIP Festival

> Réplica de [fipfestival.com.ar](https://www.fipfestival.com.ar/) en **Next.js + Payload CMS**.
> Documento de referencia para retomar el proyecto o traspasarlo a otra persona.

**Estado:** Fase 2 en curso — 3 de 12 páginas maquetadas
**Repositorio:** `github.com/alit0/fip` (rama `main`)
**Última actualización:** junio 2026

## Tabla de contenidos

- [1. Qué es este proyecto](#1-qué-es-este-proyecto)
- [2. Decisiones de arquitectura](#2-decisiones-de-arquitectura)
- [3. Modelo de datos](#3-modelo-de-datos)
- [4. Guía de diseño (design tokens)](#4-guía-de-diseño-design-tokens)
- [5. Estructura del proyecto](#5-estructura-del-proyecto)
- [6. Plan de fases y estado actual](#6-plan-de-fases-y-estado-actual)
- [7. Lo construido en detalle](#7-lo-construido-en-detalle)
- [8. Discrepancias de contenido](#8-discrepancias-de-contenido)
- [9. Git y respaldo](#9-git-y-respaldo)
- [10. Pendientes y próximos pasos](#10-pendientes-y-próximos-pasos)

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
│  ├─ (public)/        # sitio público: layout + 13 páginas
│  │  ├─ page.tsx (Home), reglamento/, categorias/, inscripcion/,
│  │  ├─ fechas-de-cierre/, tarifario/, premios/, hall-de-la-fama/,
│  │  ├─ contacto/, 20-consejos/
│  │  ├─ jurados/[year]/, ganadores/[year]/, ranking/[country]/
│  ├─ (auth)/          # áreas privadas (fase final): acceso/jurados, acceso/agencias
│  ├─ (payload)/       # admin CMS (se cablea en Fase 3)
│  └─ api/             # endpoints custom (fases finales)
├─ collections/        # SCHEMA Payload = modelo de datos (Fase 3)
├─ components/
│  ├─ layout/          # TopBar, MainNav (con menú mobile), Footer, SocialIcons
│  └─ shared/          # Placeholder, Cta, Section, SectionHeading, ImagePlaceholder
├─ mocks/              # datos mock tipados (home.json, rubros.json, ...) + types.ts + index.ts
├─ styles/tokens.css   # design tokens
├─ i18n/               # next-intl (Fase 4)
└─ lib/                # navigation.ts (datos de nav/header/footer) y helpers
```

> [!NOTE]
> Las páginas importan los datos desde `@/mocks`. En la Fase 3, cambiar de mock a
> Payload se hace en **un solo lugar por entidad**, sin tocar las páginas.

---

## 6. Plan de fases y estado actual

| Fase | Qué incluye | Estado |
|------|-------------|--------|
| **Fase 1** | Arquitectura + esqueleto: layout base, routing de las 15 páginas como placeholders, tokens | ✅ Completa y pusheada |
| **Fase 2** | Frontend público con datos mock: maquetar las 12 páginas, responsive + SEO | 🔄 En curso (3/12) |
| **Fase 3** | Backend/API + CMS: collections de Payload, PostgreSQL, panel admin, storage, migrar mock→queries | ⏳ Pendiente |
| **Fase 4** | i18n es/pt: campos traducibles + UI con next-intl + descargas por idioma | ⏳ Pendiente |
| **Fase 5** | Área privada Agencias: login, dashboard, wizard de 4 pasos, validaciones | ⏳ Pendiente |
| **Fase 6** | Área privada Jurados: scoring por 4 criterios, votos bloqueables, reportes (la más compleja) | ⏳ Pendiente |

### Progreso de la Fase 2 (páginas)

- [x] 1. **Home** — hero, premios, FIP 2025, categorías, jurados, auspiciantes, rankings
- [x] 2. **Reglamento** — índice, artículos A–R, tabla de puntajes
- [x] 3. **Categorías** — 23 rubros, 143 categorías reales (desde PDF + MP del sitio en vivo)
- [ ] 4. **Inscripción** ← siguiente
- [ ] 5. Fechas de cierre
- [ ] 6. Tarifario
- [ ] 7. Premios / Réplicas
- [ ] 8. Jurados `[year]`
- [ ] 9. Ganadores `[year]`
- [ ] 10. Hall de la Fama
- [ ] 11. Ranking `[country]`
- [ ] 12. Contacto (incluye formulario nuevo)

---

## 7. Lo construido en detalle

### 7.1 Fase 1 — Esqueleto

- App Next.js que levanta en local y compila (**35 rutas** generadas: estáticas +
  dinámicas por año/país + áreas privadas).
- Layout base: `TopBar` (accesos privados + redes), `MainNav` con dropdowns
  Jurados/Ganadores, `Footer` con descargas ES/PT + contacto.
- Las 15 páginas como placeholders vacíos; design tokens aplicados.

> [!NOTE]
> Decisión consciente: Payload + PostgreSQL **no** se cablearon en Fase 1 (no tiene
> sentido una base de datos para mostrar páginas vacías). La estructura quedó lista
> para que Payload entre limpio en la Fase 3.

### 7.2 Fase 2 — Páginas maquetadas

**Home** — las 8 secciones en el orden del original: hero "El FIP celebra sus 27
años", muestra digital, los premios (8 trofeos), texto institucional FIP 2025 con
subsecciones, categorías 2026 (23 rubros), jurados 2026, auspiciantes, rankings.
Datos desde mock tipado, SEO/OG por página, imágenes como placeholders marcados
`TODO`. Se agregó **menú mobile** (hamburger) que afecta a todas las páginas.

- _Pendiente menor:_ el texto de FIP 2025 quedó con el resumen de la auditoría;
  falta el copy verbatim del sitio (está en la captura `Home.png`).

**Reglamento** — índice de anclas, artículos A–R con badges, tabla de puntajes
(Gran Prix 12 · Oro 10 · Plata 6 · Bronce 4 · Finalista 1), descargas ES/PT.

**Categorías** — header + grilla de 23 rubros numerados (anclas `#rubro-N`) +
"Ventajas a considerar" + detalle por rubro con badge de premio, código, título,
descripción y marcadores Especial/Nueva. Las **143 categorías** se extrajeron de
`categorias.pdf` (extracción por columnas para no mezclar el texto del PDF a dos
columnas). El Rubro 1 (MP) se dejó con el contenido del **sitio en vivo** porque
difiere del PDF.

---

## 8. Discrepancias de contenido

Durante la carga de Categorías aparecieron diferencias entre el sitio en vivo, el
PDF descargable y la auditoría. Se registran porque afectan la fidelidad y algunas
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

## 9. Git y respaldo

Proyecto versionado y respaldado en **`github.com/alit0/fip`** (rama `main`). Local
y remoto sincronizados.

> [!WARNING]
> **Incidente resuelto:** en el setup inicial hubo confusión de carpetas (una
> subcarpeta `fip` vacía creada por la herramienta de memoria "engram" se borró, lo
> que generó un susto). No se perdió nada porque el repo estaba en GitHub.
> **Aprendizaje aplicado:** commit + push al cerrar cada fase/página.

### Rutina de git del proyecto

El asistente de código commitea en unidades limpias (conventional commits) a medida
que avanza, así que para publicar alcanza con:

```bash
git push
```

El `git add . && git commit` manual suele responder "nothing to commit" porque los
commits ya están hechos. Para clonar el proyecto en otra máquina:

```bash
git clone https://github.com/alit0/fip.git
```

> [!CAUTION]
> La carpeta `img` (capturas de referencia + PDFs/PPTs fuente) está **fuera de git**
> (no se sube a GitHub). El asistente puede leer esos archivos desde el disco, pero
> **no están respaldados en la nube**. Si se borra la copia local, hay que volver a
> bajarlos del sitio. _Decisión pendiente: versionarlos de nuevo o respaldarlos
> aparte si se quiere tenerlos a salvo._

---

## 10. Pendientes y próximos pasos

### 10.1 Próximos pasos inmediatos (en orden)

1. **Cerrar discrepancias de Categorías** — alinear los casos de la sección 8 a
   favor del sitio en vivo y commitear.
2. **Auditoría de arquitectura** — pedir al asistente un diagnóstico honesto de
   componentización, separación de responsabilidades, tipado, consistencia entre
   páginas, uso de tokens y code smells. **Sin refactorizar todavía**, solo
   diagnóstico, para decidir juntos qué tocar antes de que se multiplique por 12
   páginas.
3. **Andamiaje de testing** — instalar el framework de tests + unos pocos *smoke
   tests* (que cada página renderice sin error) + 1-2 tests unitarios de ejemplo,
   con explicación en criollo. Sin cobertura total todavía.
4. **Seguir Fase 2** — Inscripción (pág. 4) y el resto, una por vez, revisando en el
   navegador y comparando contra las capturas.

### 10.2 Pendientes de contenido

- [ ] Texto verbatim de la sección "FIP 2025" del Home (está en `Home.png`).
- [ ] Ubicar los premios "Red del Año" (Independientes + Mundiales).
- [ ] Confirmar el nombre del Rubro 5 (Desarrollo Humano vs. "FIP Salud y desarrollo humano").
- [ ] Reemplazar todos los placeholders de imágenes por assets reales (fotos de
  jurados, logos, íconos de premios, sello "27", banderas, imágenes OG).

### 10.3 Sobre el testing (criterio acordado)

No obsesionarse con cobertura total ahora. En Fase 2 (páginas estáticas con mock) lo
visual se valida mirando el navegador. El testing serio se concentra donde hay
**lógica real**: las queries de la Fase 3 y, sobre todo, las áreas privadas — el
wizard de carga de agencias y el scoring de jurados (4 criterios, votos
bloqueables). Ahí un bug no es un color corrido: es un voto mal calculado o una
campaña que no se guarda.

### 10.4 Recordatorios de método

- Una fase (o página) por vez; revisar en el navegador antes de aprobar; commit +
  push antes de seguir.
- No afirmarle al asistente que algo está hecho sin verificarlo en git (un prompt
  asumió la Fase 2 terminada cuando no existía, y el asistente lo detectó y frenó —
  comportamiento correcto).
- Modelo potente para pensar (arquitectura, páginas complejas como Home o
  Categorías); modelo más económico para maquetado repetitivo.
- Para páginas con mucho contenido (Categorías, Ganadores), tirar de los PDFs
  descargables en vez de transcribir de capturas: más exacto y más rápido.
- Antes de cualquier comando que cree, borre o sobrescriba carpetas, leer qué
  carpeta toca.

---

> **Estado al cierre de esta sesión:** Fase 2 con 3 de 12 páginas (Home, Reglamento,
> Categorías) maquetadas, verificadas y pusheadas. **Próximo paso sugerido:**
> auditoría de arquitectura + andamiaje de tests antes de continuar con Inscripción.
