"use client";

import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { GoogleRating } from "@/app/components/GoogleRating";
import { SITE } from "@/app/lib/site";

const REVIEWS = [
  {
    author: "Maria & Mélanie",
    role: "Clientes fidèles",
    body:
      "Manon est très professionnelle, agréable, bienveillante. Des produits de qualité, une hygiène irréprochable, le tout dans la bonne humeur — un vrai moment de détente qui fait du bien au cœur.",
    rating: 5,
  },
  {
    author: "Une cliente",
    role: "Avis Google",
    body:
      "Manon est très agréable et fait surtout un très beau travail. Très soignée, le rendu est impeccable. Elle n'a pas hésité à m'arranger pour partir en vacances avec de jolies ongles malgré mes contraintes — c'est très sympa.",
    rating: 5,
  },
  {
    author: "Cliente abonnée",
    role: "Avis Google",
    body:
      "Très bonne professionnelle, elle m'a donné beaucoup de conseils et expliqué étape par étape. La santé de l'ongle passe avant tout — elle ne vous vendra jamais une prestation inutile. Mes ongles étaient en mauvais état, ils sont aujourd'hui solides. Je recommande à 100 %.",
    rating: 5,
  },
];

export function Reviews() {
  return (
    <section id="avis" className="relative py-24 md:py-32">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Elles en parlent"
            title="Un travail recommandé par celles qui le portent."
            intro="Quelques retours de mes clientes. Vous trouverez tous les avis sur ma fiche Google."
          />
          <div className="flex flex-col gap-3 md:items-end">
            <GoogleRating />
            <a
              href={SITE.googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-ink)]/70 underline-offset-4 hover:text-[var(--color-ink)] hover:underline"
            >
              Voir tous les avis Google →
            </a>
          </div>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.li
              key={r.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/55 p-7"
            >
              <Stars rating={r.rating} />
              <p className="mt-5 grow font-serif text-lg leading-relaxed text-[var(--color-ink)]/90">
                « {r.body} »
              </p>
              <div className="mt-6">
                <p className="font-serif text-base text-[var(--color-ink)]">
                  — {r.author}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-ink)]/45">
                  {r.role}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="mt-10 text-center md:hidden">
          <a
            href={SITE.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-ink)]/70 underline underline-offset-4"
          >
            Voir tous les avis Google →
          </a>
        </div>
      </Container>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-[var(--color-accent)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
