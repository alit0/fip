import type { MetadataRoute } from "next";
import { GANADOR_YEARS, JURADO_YEARS, RANKING_COUNTRIES } from "@/lib/navigation";

const SITE_URL = (process.env.SITE_URL ?? "https://www.fipfestival.com.ar").replace(/\/$/, "");

const staticPaths = [
  "",
  "/reglamento",
  "/categorias",
  "/inscripcion",
  "/fechas-de-cierre",
  "/tarifario",
  "/premios",
  "/hall-de-la-fama",
  "/contacto",
] as const;

function localizedUrl(path: string, locale: "es" | "pt") {
  return `${SITE_URL}${locale === "pt" ? "/pt" : ""}${path}`;
}

function entry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: localizedUrl(path, "es"),
    alternates: {
      languages: {
        es: localizedUrl(path, "es"),
        pt: localizedUrl(path, "pt"),
      },
    },
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const dynamicPaths = [
    ...JURADO_YEARS.map((year) => `/jurados/${year}`),
    ...GANADOR_YEARS.map((year) => `/ganadores/${year}`),
    ...RANKING_COUNTRIES.map(({ slug }) => `/ranking/${slug}`),
  ];

  return [...staticPaths, ...dynamicPaths].map(entry);
}
