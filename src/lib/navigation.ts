/**
 * Navigation + layout data.
 * Per the audit (table 8) header/footer/layout is CODE, not CMS — except contact data
 * and social links, which move to the SiteConfig singleton in Phase 3. Hardcoded here
 * for the skeleton so the layout renders realistically.
 */

export type NavItem =
  | { label: string; href: string }
  | { label: string; dropdown: "jurados" | "ganadores" };

// Order is exact, per audit section 3.2.
export const MAIN_NAV: NavItem[] = [
  { label: "Reglamento", href: "/reglamento" },
  { label: "Categorías", href: "/categorias" },
  { label: "Inscripción", href: "/inscripcion" },
  { label: "Fechas de cierre", href: "/fechas-de-cierre" },
  { label: "Tarifario", href: "/tarifario" },
  { label: "Premios / Réplicas", href: "/premios" },
  { label: "Jurados", dropdown: "jurados" },
  { label: "Ganadores", dropdown: "ganadores" },
  { label: "Hall de la fama", href: "/hall-de-la-fama" },
  { label: "Contacto", href: "/contacto" },
];

// Jurados 2020–2026 (dropdown shows newest first).
export const JURADO_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

// Ganadores 2019–2025 (newest first). NOTE: in the original, 2024 & 2023 link to a
// PDF instead of a page — handled in Phase 2/3; here all route to a page placeholder.
export const GANADOR_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

export const RANKING_COUNTRIES = [
  { slug: "colombia", label: "Colombia" },
  { slug: "argentina", label: "Argentina" },
  { slug: "brasil", label: "Brasil" },
  { slug: "espana", label: "España" },
  { slug: "peru", label: "Perú" },
  { slug: "mexico", label: "México" },
];

export const PRIVATE_ACCESS = [
  { label: "Ingreso Jurados", href: "/acceso/jurados" },
  { label: "Ingreso Agencias", href: "/acceso/agencias" },
];

export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/fipfestival" },
  { name: "Facebook", href: "https://www.facebook.com/fipfestival" },
  { name: "X", href: "https://x.com/FipAwards" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/fip-festival-835459172/" },
  { name: "YouTube", href: "https://www.youtube.com/channel/UCrkZR7HcevTOlfs1f0q7SWw" },
  { name: "WhatsApp", href: "https://api.whatsapp.com/send?phone=5491163777902" },
];

export const CONTACT = {
  address: "Av. Forest 1147, Buenos Aires, Argentina",
  whatsapp: "(+54) 9 11 6377 7902",
  tel: "(+54) 11 5707 8856",
  office: "+54 9 4803 0227",
  email: "info@fipfestival.com.ar",
};

// Downloadable files (audit tables 2 & 3). In Phase 3 these come from DownloadFile (CMS).
export const DOWNLOADS_ES = [
  { label: "Reglamento", href: "/descargas/reglamento.pdf" },
  { label: "Presentación de campañas", href: "/descargas/fip_presentacion_campanas.pptx" },
  { label: "Formulario de inscripción", href: "/descargas/inscripcion_autocompletable.pdf" },
  { label: "Solicitud de réplicas", href: "/descargas/replicas_Orden_de_Compra.pdf" },
  { label: "Categorías", href: "/descargas/categorias.pdf" },
  { label: "Tarifario", href: "/descargas/tarifario_feb2026.pdf" },
];

export const DOWNLOADS_PT = [
  { label: "Regulamento", href: "/descargas/regulamento_port.pdf" },
  { label: "Apresentação Campanhas", href: "/descargas/fip_apresentacao_campanas_port.pptx" },
  { label: "Ficha de inscrição", href: "/descargas/inscricao_autocompletable_port.pdf" },
  { label: "Solicitação de réplicas", href: "/descargas/Replicas-Orden_de_Compra_port.docx" },
  { label: "Categorias", href: "/descargas/categorias_port.pdf" },
  { label: "Tarifário / Preço", href: "/descargas/tarifario-port__feb2026.pdf" },
];
