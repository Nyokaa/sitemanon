import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "./components/Analytics";
import { WhatsAppButton } from "./components/WhatsAppButton";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://manonjeanpert.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prothésiste ongulaire Lyon 6 Tête d'Or | Manon Jeanpert",
    template: "%s · Manon Jeanpert",
  },
  description:
    "Prothésiste ongulaire à Lyon 6, en studio privé près du Parc de la Tête d'Or. Pose semi-permanente, gel, nail art, rallongement. Réservation en ligne.",
  keywords: [
    "prothésiste ongulaire Lyon 6",
    "manucure Lyon 6",
    "pose gel Lyon",
    "semi-permanent Lyon",
    "nail art Lyon",
    "rallongement ongles Lyon",
    "Tête d'Or",
    "Manon Jeanpert",
  ],
  authors: [{ name: "Manon Jeanpert" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Manon Jeanpert",
    title: "Prothésiste ongulaire Lyon 6 Tête d'Or | Manon Jeanpert",
    description:
      "Studio privé à Lyon 6, près du Parc de la Tête d'Or. Pose semi-permanente, gel, nail art, rallongement. Réservation en ligne sur Planity.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Manon Jeanpert — Prothésiste ongulaire à Lyon 6",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prothésiste ongulaire Lyon 6 Tête d'Or | Manon Jeanpert",
    description:
      "Studio privé à Lyon 6, près du Parc de la Tête d'Or. Pose semi-permanente, gel, nail art, rallongement.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2c3a2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}
