import type { Metadata } from "next";
import { Inter, Lato, Archivo_Black } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FIP Festival — Festival Iberoamericano de Promociones y Eventos",
    template: "%s · FIP Festival",
  },
  description:
    "Festival Iberoamericano de Promociones y Eventos. 27 años de trayectoria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${lato.variable} ${archivoBlack.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
