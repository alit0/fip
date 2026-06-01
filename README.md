# FIP Festival — réplica web

Réplica del sitio [fipfestival.com.ar](https://www.fipfestival.com.ar/) en una
arquitectura moderna. Fuente de verdad: `Auditoria_FIP_Festival.docx`.

## Stack

- **Next.js 15** (App Router) + **React 19** — sitio público, SEO, SSR/SSG.
- **Tailwind v4** + design tokens en CSS variables (`src/styles/tokens.css`).
- **Payload CMS 3** — CMS + API + auth con roles + storage, dentro de la misma app Next (Fase 3).
- **PostgreSQL** — base de datos relacional (Fase 3).
- **next-intl** — i18n de UI es/pt (Fase 4).

## Estado actual: Fase 1 — esqueleto

App que levanta en local con layout base, las 15 páginas públicas como placeholders,
las 2 áreas privadas como placeholders, y el sistema de tokens aplicado.
**Sin contenido real y sin Payload/DB todavía** (se agregan en fases posteriores).

## Correr en local

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Estructura

```
src/
├─ app/
│  ├─ (public)/      páginas públicas + layout (TopBar, MainNav, Footer)
│  ├─ (auth)/        áreas privadas (login jurados / agencias)
│  └─ layout.tsx     root: html, fuentes (Inter/Lato/Archivo Black), globals
├─ components/
│  ├─ layout/        TopBar, MainNav, Footer, SocialIcons
│  └─ shared/        Placeholder
├─ collections/      schema Payload (Fase 3)
├─ i18n/             catálogos de UI (Fase 4)
├─ lib/              navigation.ts (nav, redes, contacto, descargas)
└─ styles/           tokens.css, globals.css
```

## Plan de fases

1. **Fase 1 (actual)** — Arquitectura + esqueleto vacío.
2. **Fase 2** — Frontend público con datos mock (las 15 páginas maquetadas).
3. **Fase 3** — Payload (collections, admin, S3) + queries reales.
4. **Fase 4** — i18n es/pt.
5. **Fase 5** — Área privada Agencias (wizard de 4 pasos).
6. **Fase 6** — Área privada Jurados (scoring por 4 criterios — épico aparte).
