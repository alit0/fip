import type { Metadata } from "next";

export const appIcons = {
  icon: [{ url: "/favicon.ico", sizes: "any" }],
  apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
} satisfies Metadata["icons"];
