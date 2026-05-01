# 01 — Patches metadata (Next.js App Router)

Fichier cible : `app/layout.tsx` (ou `app/page.tsx` si la metadata est définie page par page).

## A. Object `metadata` corrigé

Remplace l'export `metadata` actuel par :

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://manonjeanpert.com"),
  title: "Manon Jeanpert — Prothésiste ongulaire à Lyon 6 | Tête d'Or",
  description:
    "Prothésiste ongulaire à Lyon 6, près du Parc de la Tête d'Or. Pose semi-permanent, gel, rallongement et nail art sur-mesure. Diagnostic personnalisé.",
  authors: [{ name: "Manon Jeanpert" }],
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
  alternates: {
    canonical: "https://manonjeanpert.com/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://manonjeanpert.com/",
    siteName: "Manon Jeanpert",
    title: "Manon Jeanpert — Prothésiste ongulaire à Lyon 6",
    description:
      "Studio privé à Lyon 6. Diagnostic personnalisé, pose durable, hygiène irréprochable. Réservation en ligne sur Planity.",
    images: [
      {
        url: "/og.jpg", // resolved against metadataBase → https://manonjeanpert.com/og.jpg
        width: 1200,
        height: 630,
        alt: "Manon Jeanpert — Prothésiste ongulaire à Lyon 6",
      },
    ],
  },
  twitter: {
    card: "summary_large_image", // ← changé depuis "summary"
    title: "Manon Jeanpert — Prothésiste ongulaire à Lyon 6",
    description:
      "Studio privé à Lyon 6. Diagnostic personnalisé, pose durable, hygiène irréprochable.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png", // créer ce fichier 180×180
  },
  manifest: "/site.webmanifest", // optionnel — voir 10-low-priority-backlog.md
  themeColor: "#2c3a2e",
};
```

## B. Vérifications obligatoires

1. **Le fichier `/public/og.jpg` doit exister** en 1200×630 (PNG ou JPEG ≤ 300 KB).
   - Si absent, génère-le : ScreenStudio, Figma, Canva, ou capture du hero avec les éléments clés (nom + métier + ville).
2. **Apple touch icon** : `/public/apple-touch-icon.png` 180×180 (sinon enlever la ligne).
3. **Web manifest** : voir `10-low-priority-backlog.md` (sinon enlever la ligne).

## C. Diff résumé

| Champ | Avant | Après | Pourquoi |
|---|---|---|---|
| `description` | 210 chars | 151 chars | Pas de truncation Google |
| `openGraph.images` | absent | `og.jpg` 1200×630 | C1 — partages sociaux avec visuel |
| `twitter.card` | `summary` | `summary_large_image` | Cohérent avec l'image |
| `twitter.images` | absent | `og.jpg` | C1 — Twitter avec visuel |
| `metadataBase` | absent | URL canonique | Permet aux URLs relatives d'être résolues correctement |

## D. Test après déploiement

```bash
# Vérifier les balises rendues
curl -sSL https://manonjeanpert.com/ | grep -E '(og:|twitter:)' | head -20

# Aperçu social
open https://www.opengraph.xyz/url/https%3A%2F%2Fmanonjeanpert.com%2F
```
