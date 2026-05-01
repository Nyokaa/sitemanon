# 08 — Checklist Google Search Console & Bing Webmaster

**Finding** : H2 (audit) — `site:manonjeanpert.com` retourne 0 résultat. Site non indexé.

Action externe au code (pas de patch). À faire manuellement, ~15 min.

## Google Search Console

1. **Créer la propriété**
   - https://search.google.com/search-console
   - Type **"Préfixe d'URL"** → `https://manonjeanpert.com/`
   - Vérification recommandée : **Balise HTML** (Next.js metadata `verification.google`)

2. **Vérifier la propriété** (méthode balise HTML)

   Ajoute dans `app/layout.tsx` :
   ```ts
   export const metadata: Metadata = {
     // ... reste de la config
     verification: {
       google: "TON_CODE_DE_VERIFICATION_GSC",
     },
   };
   ```

   Déploie, puis clique "Vérifier" dans GSC.

3. **Soumettre le sitemap**
   - Sitemaps → Ajouter un nouveau sitemap → `sitemap.xml`
   - Statut attendu : "Réussite" sous quelques heures.

4. **Demander l'indexation de chaque URL**
   - URL inspection → `https://manonjeanpert.com/`
   - Bouton "Demander une indexation"
   - Idem pour `https://manonjeanpert.com/mentions-legales`
   - ⚠️ Quota limité (~10/jour) — concentre-toi sur les pages clés.

5. **Surveiller pendant 14 jours**
   - "Couverture" : nombre de pages indexées (objectif : 2/2).
   - "Performance" : impressions, clics, position moyenne.
   - "Améliorations" : warnings sur le BeautySalon schema (utile après application des fixes).

## Bing Webmaster Tools

1. https://www.bing.com/webmasters
2. Importer depuis GSC (1 clic une fois GSC vérifié) — recommandé.
3. Soumettre le sitemap manuellement si l'import ne le fait pas.

## Référencement local — Google Business Profile

Si pas encore créé/optimisé :

1. https://business.google.com/
2. Catégorie principale : **"Salon de beauté"** ou **"Salon d'onglerie"**.
3. Catégories secondaires : "Manucure", "Prothésiste ongulaire".
4. Ajouter :
   - 12 av. de Grande-Bretagne, 69006 Lyon
   - +33 6 81 80 59 56
   - Horaires (synchronisés avec ceux du site et du schema)
   - URL : https://manonjeanpert.com/
   - Photos : portrait, 5-10 photos de la galerie, photo du studio
5. **Récupérer le CID** (Partager > URL courte) → l'utiliser dans :
   - `02-jsonld-business.json` → `sameAs[0]`
   - Lien "Fiche Google" du site (déjà présent, mais utilise une URL Google search — préfère la maps URL avec CID).

## Citations et backlinks initiaux

Déjà repérés (on-site) :
- Planity ✓
- Instagram ✓
- AlloVoisins (recherche externe trouvée pendant l'audit) — vérifier que la fiche est à jour avec la bonne adresse.

À ajouter (gratuit, haute autorité locale) :
- PagesJaunes (pagesjaunes.fr)
- Yelp France
- Treatwell (alternative à Planity, peut référencer aussi)
- Annuaire local Lyon 6 (mairie 6e arrondissement)

Vérifier la cohérence NAP partout : **exactement** la même formulation d'adresse et numéro de téléphone que sur le site et dans le schema.

## Test après 7-14 jours

```
site:manonjeanpert.com
```

Doit retourner 2 résultats minimum. Si toujours rien après 14 jours :
- Vérifier robots.txt (déjà OK)
- Vérifier qu'aucun `<meta name="robots" content="noindex">` n'est présent
- Vérifier dans GSC > "Pages" si Google a vu les URLs et leur statut
