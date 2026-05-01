# 10 — Backlog Low priority

À traiter quand toutes les actions Critical / High / Medium sont déployées et validées.

## L1 — Apple touch icon + Web manifest

Pour l'expérience iOS (bookmark écran d'accueil) et PWA légère.

### Fichiers à ajouter

`public/apple-touch-icon.png` — 180×180 PNG (logo ou monogramme "MJ" sur fond `#2c3a2e`).

`public/site.webmanifest` :

```json
{
  "name": "Manon Jeanpert — Prothésiste ongulaire à Lyon 6",
  "short_name": "Manon Jeanpert",
  "description": "Prothésiste ongulaire à Lyon 6, près du Parc de la Tête d'Or.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#2c3a2e",
  "theme_color": "#2c3a2e",
  "lang": "fr-FR",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

Déjà câblé dans `01-metadata-patches.md` via `metadata.icons.apple` et `metadata.manifest`.

## L2 — `inLanguage` au schema

Déjà inclus dans `02-jsonld-business.json` (`"inLanguage": "fr-FR"`).

## L3 — Géo-modifiers sur quelques alts galerie

Pas de spam — 2-3 images stratégiques suffisent.

```diff
- <img alt="Nude amande long" src="/images/gallery/nude-1.png" />
+ <img alt="Nude amande long — pose semi-permanente Lyon 6" src="/images/gallery/nude-1.png" />

- <img alt="Création signature" src="/images/gallery/nailart6.jpeg" />
+ <img alt="Création signature nail art — studio Tête d'Or Lyon 6" src="/images/gallery/nailart6.jpeg" />

- <img alt="Manon Jeanpert, prothésiste ongulaire à Lyon 6" src="/images/portrait.jpeg" />
  (déjà bon, garder tel quel)
```

## L4 — `priceRange` avec hyphen au lieu d'en-dash

Déjà fait dans `02-jsonld-business.json` (`"priceRange": "€10-€125"` au lieu de `"€10–€125"`).

## L5 — Mesurer Core Web Vitals réels

Une fois la page indexée (sous 7-14 jours), lancer :

- https://pagespeed.web.dev/analysis?url=https://manonjeanpert.com/
- Onglets "Mobile" + "Desktop"
- Métriques cibles :
  - **LCP** ≤ 2.5s (mobile)
  - **INP** ≤ 200ms
  - **CLS** ≤ 0.1

Si LCP > 2.5s : appliquer 09 (optimisation images) en priorité.
Si INP > 200ms : profiler avec Chrome DevTools Performance, identifier les longs handlers React (souvent : Gallery filter, FAQ toggle, animations Framer/intersection).

Une fois GSC actif et les CWV stabilisés, lance dans Claude Code :
```
/seo google audit https://manonjeanpert.com/
```
pour récupérer les CWV champ via CrUX (au lieu du lab) — données beaucoup plus fiables.

## L6 — FAQPage schema (gain GEO uniquement)

Déjà préparé dans `04-jsonld-faqpage.json`. À déployer si tu veux maximiser la citation par les LLMs.

⚠️ **Pas de gain Google** — depuis août 2023, le rich result FAQ est restreint aux sites gouvernementaux et de santé. Les sites commerciaux ne voient plus l'enrichissement dans les SERP, mais Schema.org reste lu par Bing AI, Perplexity, ChatGPT search, Claude, Gemini.

## L7 — Pages services dédiées (si objectif trafic)

Le site est mono-page avec ancres. Pour capturer plus de queries :

```
/semi-permanent-lyon-6
/gel-rallongement-lyon-6
/manucure-russe-lyon
/nail-art-lyon-6
```

Chaque page :
- Contenu unique 500-800 mots (pas de duplication ni de spinning)
- Galerie filtrée à la prestation
- Témoignages contextuels
- Schema `Service` avec `provider` lié au `BeautySalon`
- CTA Planity ciblé

⚠️ **Quality gate** : ne pas dépasser 5 pages services dans un premier temps. Le skill `/seo programmatic` alerte à 30+ pages, hard stop à 50+ pour un site local. Pour 4-5 pages bien faites, c'est le sweet spot.

## L8 — Sitemap : ajouter des URLs ancres ?

Question discutable : faut-il mettre `https://manonjeanpert.com/#prestations` dans le sitemap ? **Non** — Google ne traite pas les fragments d'URL comme des pages distinctes. Le `<urlset>` actuel (2 URLs : `/` et `/mentions-legales`) est correct pour un site one-page.

Si tu pars sur L7 (pages dédiées), tu ajouteras :
```xml
<url>
  <loc>https://manonjeanpert.com/semi-permanent-lyon-6</loc>
  <lastmod>2026-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

## L9 — `robots.txt` : ajouter explicitement les bots IA

Le `robots.txt` actuel autorise tout (`User-Agent: *`). Si tu veux **explicitement** signaler que tu acceptes les crawlers IA (signal positif pour la citation) :

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://manonjeanpert.com/sitemap.xml
```

Ou inversement, si tu veux bloquer les LLMs (cas de figure : tu ne veux pas que ton contenu serve à entraîner les modèles), remplace `Allow: /` par `Disallow: /` pour ces user-agents. **Pour un local service, l'allowlist est recommandée** — la citation IA est un canal d'acquisition.

## L10 — Open Graph image : tester sur les vrais réseaux

Une fois `og.jpg` en place :

- Facebook debugger : https://developers.facebook.com/tools/debug/?q=https://manonjeanpert.com/
- LinkedIn post inspector : https://www.linkedin.com/post-inspector/
- Twitter/X card validator : https://cards-dev.twitter.com/validator
- WhatsApp : envoyer le lien à toi-même dans une conversation, vérifier l'aperçu.
