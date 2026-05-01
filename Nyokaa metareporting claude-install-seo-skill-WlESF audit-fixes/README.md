# Audit fixes — manonjeanpert.com

Patches prêts à coller, organisés par ordre d'application. Score actuel : **74/100**.
Une fois tout appliqué, score cible : **~92/100**.

## Ordre d'application

| # | Fichier | Priorité | Effort | Action |
|---|---------|----------|--------|--------|
| 1 | [`01-metadata-patches.md`](./01-metadata-patches.md) | 🔴 Critical | 5 min | Ajouter `og:image`, `twitter:image`, `summary_large_image`. Réécrire la meta description. |
| 2 | [`02-jsonld-business.json`](./02-jsonld-business.json) | 🔴🟠 Crit+High | 10 min | Remplacer le `<script type="application/ld+json">` BeautySalon. Corrige Facebook sameAs, ajoute `aggregateRating` + `review`, `inLanguage`, fix Offer "Supplément". |
| 3 | [`03-jsonld-person.json`](./03-jsonld-person.json) | 🟡 Medium | 5 min | Ajouter un 2e bloc JSON-LD Person pour Manon (E-E-A-T + GEO). |
| 4 | [`04-jsonld-faqpage.json`](./04-jsonld-faqpage.json) | 🔵 Low (GEO) | 5 min | Optionnel — bénéfice IA/LLM uniquement (FAQ rich result Google retiré pour les sites commerciaux depuis 2023). |
| 5 | [`05-faq-component.tsx`](./05-faq-component.tsx) | 🟠 High | 15 min | Remplacer le composant FAQ — toutes les réponses dans le DOM initial (crawlable IA). |
| 6 | [`06-llms.txt`](./06-llms.txt) | 🟡 Medium | 2 min | Sauver dans `public/llms.txt`. |
| 7 | [`07-h1-revision.md`](./07-h1-revision.md) | 🟠 High | 5 min | Ajouter un mot-clé local au H1 (ou H2 sémantique en remplacement de l'eyebrow `<p>`). |
| 8 | [`08-search-console-checklist.md`](./08-search-console-checklist.md) | 🟠 High | 15 min | Indexation Google + Bing (action externe au code). |
| 9 | [`09-image-optimization.md`](./09-image-optimization.md) | 🟡 Medium | 1-2h | Pré-générer WebP/AVIF pour la galerie. |
| 10 | [`10-low-priority-backlog.md`](./10-low-priority-backlog.md) | 🔵 Low | — | apple-touch-icon, manifest, alts géo-localisés, etc. |

## Tableau récap par finding

| Finding audit | Fichier de fix |
|---|---|
| C1 og:image manquant | 01 |
| C2 Facebook sameAs invalide | 02 |
| H1 5 réponses FAQ hors DOM | 05 |
| H2 Site non indexé | 08 |
| H3 aggregateRating + review | 02 |
| H4 H1 sans mot-clé local | 07 |
| M1 Person schema | 03 |
| M2 sameAs Google → CID | 02 (commentaire) |
| M3 Fix Offer "Supplément" | 02 |
| M4 llms.txt | 06 |
| M5 WebP/AVIF galerie | 09 |
| M6 Meta description trop longue | 01 |
| L1-L7 Backlog | 10 |

## Tests après application

1. Validateurs schema :
   - https://validator.schema.org/ → coller l'URL
   - https://search.google.com/test/rich-results → URL ou code
2. Aperçu social :
   - https://www.opengraph.xyz/ → URL (OG, Twitter)
3. CWV champ + lab (à faire après que le site soit indexé) :
   - https://pagespeed.web.dev/analysis?url=https://manonjeanpert.com/
4. Indexation :
   - `site:manonjeanpert.com` dans Google après 7-14 jours

## Notes importantes

- **Les `aggregateRating.ratingValue` et `reviewCount` du fichier 02 sont des placeholders `TODO`** — remplace par les vrais chiffres de ta fiche Google Business Profile avant déploiement. **Ne JAMAIS inventer une note ou un nombre d'avis** (sanction Google + perte de confiance).
- **Le `cid` de la sameAs Google** dans le fichier 02 est un placeholder. Récupère la vraie URL depuis ton dashboard GBP.
- **Les 5 réponses FAQ dans `05-faq-component.tsx`** sont des suggestions plausibles. Relis et ajuste si besoin (notamment "moyens de paiement", "déposer chez vous").
