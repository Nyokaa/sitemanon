"use client";

/**
 * FAQ — composant client.
 *
 * Avant : seules les questions étaient rendues dans le HTML statique.
 *         Les réponses (sauf la 1re) étaient absentes du DOM initial,
 *         ajoutées uniquement après hydratation.
 *         → Crawlers IA (ChatGPT, Perplexity, Claude, Bing) ne les voyaient jamais.
 *
 * Après : toutes les réponses sont dans le DOM dès le 1er rendu.
 *         L'animation collapse/expand se fait via CSS (max-height + opacity).
 *         JS ne fait que basculer une classe — pas de mount/unmount.
 *
 * Bonus : a11y propre (aria-controls, aria-expanded, role/disclosure pattern),
 *         état initial "première FAQ ouverte" préservé.
 */

import { useState, useId } from "react";

type Item = { question: string; answer: string };

const ITEMS: Item[] = [
  {
    question: "Comment se déroule un premier rendez-vous ?",
    answer:
      "On commence toujours par un diagnostic ongulaire (30 min, 10 € déduits de la prestation) : on parle de votre mode de vie, de vos contraintes et on choisit ensemble la technique la plus adaptée. Aucune pose standardisée — tout est sur-mesure.",
  },
  {
    question: "Combien de temps tient une pose ?",
    answer:
      "Une pose semi-permanente tient jusqu'à 4 semaines. Les poses gel et rallongements tiennent 3 à 4 semaines, avec un remplissage recommandé toutes les 3 à 4 semaines pour entretenir le résultat.",
  },
  {
    question: "Faut-il déposer chez vous si j'ai déjà du gel ?",
    answer:
      "Oui, si vous portez déjà du gel d'un autre professionnel, je préfère effectuer la dépose moi-même pour garantir la santé de l'ongle et la qualité de la nouvelle pose. Le tarif de dépose est précisé dans la grille des prestations.",
  },
  {
    question: "Où se trouve le studio ?",
    answer:
      "Le studio est situé au 12 avenue de Grande-Bretagne, 69006 Lyon, à deux pas du Parc de la Tête d'Or. Accès facile en transports en commun et stationnement à proximité.",
  },
  {
    question: "Comment réserver ?",
    answer:
      "La réservation se fait en ligne 24h/24 sur Planity ou par téléphone au 06 81 80 59 56.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: "Le studio accepte les paiements en espèces et par carte bancaire.",
  },
];

export function Faq() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="max-w-2xl text-left">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">
              Questions fréquentes
            </p>
            <h2 className="font-serif text-4xl leading-[1.05] text-[var(--color-ink)] md:text-5xl">
              Tout ce que vous voulez savoir avant de réserver.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[var(--color-ink-soft)]/85 md:text-lg">
              Une question qui n'est pas listée ? Écrivez-moi sur Instagram ou
              appelez-moi directement.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {ITEMS.map((item, i) => {
              const open = openIndex === i;
              const panelId = `${baseId}-panel-${i}`;
              const buttonId = `${baseId}-button-${i}`;
              return (
                <li key={item.question}>
                  <h3 className="m-0">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(open ? -1 : i)}
                      className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-[var(--color-accent)]"
                    >
                      <span className="font-serif text-xl text-[var(--color-ink)] md:text-2xl">
                        {item.question}
                      </span>
                      <span
                        className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--color-ink)]/30 transition-transform duration-300 ${
                          open
                            ? "rotate-45 bg-[var(--color-ink)] text-[var(--color-bg-soft)]"
                            : "text-[var(--color-ink)]"
                        }`}
                        aria-hidden="true"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>
                  </h3>

                  {/*
                    Toujours rendu dans le DOM (crawlable IA et Googlebot 1re passe).
                    L'état "fermé" est purement visuel via CSS grid-rows-[0fr→1fr].
                    `inert` retire le panneau collapsé de la navigation clavier
                    et de l'arbre a11y tout en gardant le contenu dans le DOM.
                  */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    {...(!open && { inert: "" as unknown as boolean })}
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                      open
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <p className="pb-6 pr-12 text-base leading-relaxed text-[var(--color-ink-soft)]/85">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Faq;
