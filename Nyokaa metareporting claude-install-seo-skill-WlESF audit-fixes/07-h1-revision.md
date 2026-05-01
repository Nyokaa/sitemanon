# 07 — Revision H1 + structure de titres

**Finding** : H4 (audit) — le H1 actuel n'inclut aucun mot-clé local.

## État actuel

```html
<p class="...">Studio privé · Lyon 6 · Tête d'Or</p>   <!-- eyebrow, n'est pas un titre -->
<h1>Des ongles <em>durables</em>, pensés pour votre quotidien.</h1>
```

Pas de geo-keyword dans le H1. Le `<title>` et la meta description compensent côté Google, mais le H1 reste un signal fort de pertinence.

## Option A — minimaliste (recommandée)

Garde le H1 lifestyle, transforme l'eyebrow `<p>` en `<h2>` placé **avant** le H1 (sémantiquement valide en HTML5 — `<h2>` peut précéder le `<h1>` si la page se construit ainsi).

⚠️ Cela dit, l'ordre `h2 → h1 → h2 → h2` peut faire grogner certains validateurs accessibility. Préférable : intégrer le keyword dans le H1.

## Option B — keyword dans le H1 (recommandée pour SEO)

```tsx
<p className="mb-6 inline-flex ...">
  <span className="h-px w-8 bg-[var(--color-accent)]" />
  Studio privé · Tête d'Or
</p>

<h1 className="font-serif text-5xl ...">
  Prothésiste ongulaire à <span className="italic text-[var(--color-accent)]">Lyon 6</span>
  <br />
  des ongles durables<br />
  pensés pour votre quotidien.
</h1>
```

Avantages :
- "Prothésiste ongulaire" + "Lyon 6" en H1 → match exact sur la requête primaire.
- Garde la dimension lifestyle ("ongles durables / votre quotidien").
- Hiérarchie typographique conservée (le keyword peut être plus petit visuellement via `<span class="text-3xl">` si tu veux).

## Option C — deux lignes équilibrées

```tsx
<h1>
  <span className="block text-3xl md:text-4xl text-[var(--color-accent)] font-normal not-italic mb-3">
    Prothésiste ongulaire à Lyon 6
  </span>
  Des ongles <span className="italic">durables</span>,
  <br />
  pensés pour votre quotidien.
</h1>
```

Le keyword est dans le H1 mais visuellement secondaire — bonne tension SEO/design.

## Recommandation

**Option C**. Tu gardes le ton et le visuel actuel, tu ajoutes le keyword sans le crier.

## Vérification après modif

```bash
curl -sSL https://manonjeanpert.com/ | grep -oE '<h1[^>]*>.*?</h1>' | head -1
```

Doit contenir `Prothésiste ongulaire` ET `Lyon 6`.
