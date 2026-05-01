# 09 — Optimisation des images (WebP/AVIF)

**Finding** : M5 (audit) — 14 images de galerie en `.png/.jpeg`. Sur GitHub Pages (export statique Next.js), `next/image` ne peut pas optimiser à la volée.

## Inventaire actuel

```
public/images/
  signature.jpeg              (hero, preload)
  portrait.jpeg               (méthode)
  gallery/
    nude-1.png                (galerie ×14)
    nudes-rose.png
    long2.png
    couleurs1.png
    couleurs2.png
    couleurs3.png
    couleurs4.jpeg
    nailart1.jpeg
    nailart1.png
    nailart2.jpeg
    nailart3.jpeg
    nailart4.jpeg
    nailart5.jpeg
    nailart6.jpeg
```

⚠️ Doublon : `nailart1.jpeg` ET `nailart1.png`. Vérifier et garder un seul (le PNG est probablement plus lourd, garder le JPEG sauf transparence nécessaire).

## Stratégie

Pré-générer les variantes WebP et AVIF au moment du build, servir via `<picture>` avec srcset.

### Étape 1 — Installer sharp + script de conversion

```bash
npm i -D sharp glob
```

### Étape 2 — Script `scripts/optimize-images.mjs`

```js
import sharp from "sharp";
import { glob } from "glob";
import { dirname, basename, extname, join } from "node:path";
import { mkdir } from "node:fs/promises";

const SOURCES = await glob("public/images/**/*.{jpg,jpeg,png}");

const FORMATS = [
  { ext: "avif", options: { quality: 55, effort: 6 } },
  { ext: "webp", options: { quality: 78 } },
];

const WIDTHS = [480, 768, 1200, 1600];

for (const src of SOURCES) {
  const dir = dirname(src);
  const name = basename(src, extname(src));

  for (const { ext, options } of FORMATS) {
    for (const width of WIDTHS) {
      const out = join(dir, `${name}-${width}.${ext}`);
      await sharp(src)
        .resize({ width, withoutEnlargement: true })
        .toFormat(ext, options)
        .toFile(out);
      console.log(`✓ ${out}`);
    }
  }
}
```

### Étape 3 — Script npm

```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.mjs",
    "build": "npm run optimize:images && next build"
  }
}
```

### Étape 4 — Utiliser `<picture>` dans le composant Gallery

```tsx
function GalleryImage({ src, alt }: { src: string; alt: string }) {
  // src = "/images/gallery/nude-1.png" → base = "/images/gallery/nude-1"
  const base = src.replace(/\.(png|jpe?g)$/, "");

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${base}-480.avif 480w, ${base}-768.avif 768w, ${base}-1200.avif 1200w`}
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <source
        type="image/webp"
        srcSet={`${base}-480.webp 480w, ${base}-768.webp 768w, ${base}-1200.webp 1200w`}
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </picture>
  );
}
```

## Hero image (LCP)

Pour `signature.jpeg` (image LCP), traitement séparé :

1. Générer aussi des variantes 1600w et 2400w (pour écrans haute densité).
2. Garder le `<link rel="preload">` mais cibler la variante AVIF :
   ```tsx
   <link
     rel="preload"
     as="image"
     href="/images/signature-1200.avif"
     type="image/avif"
     fetchPriority="high"
   />
   ```
3. Utiliser `<picture>` avec `fetchPriority="high"` sur le `<img>` fallback.

## Gain attendu

| Format | Poids moyen / image (ratio) | Gain LCP estimé |
|---|---|---|
| JPEG actuel | 100 % | baseline |
| WebP @ q78 | 60-70 % | -20 à -30 % LCP |
| AVIF @ q55 | 40-50 % | -40 à -55 % LCP |

Total : **galerie ~14 images × ~50 % de réduction** = ~1.5-3 MB économisés sur la 1re visite mobile.

## Vérification après déploiement

```bash
# Headers Content-Type des images
curl -sI https://manonjeanpert.com/images/gallery/nude-1-768.avif | grep -i content

# PageSpeed Insights — section "Use modern image formats"
# https://pagespeed.web.dev/analysis?url=https://manonjeanpert.com/
```
