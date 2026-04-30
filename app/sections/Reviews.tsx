"use client";

import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { SITE } from "@/app/lib/site";

const REVIEWS = [
  {
    author: "Camille",
    body:
      "Manon est à l'écoute, très professionnelle et son travail est impeccable. Le diagnostic au début change tout, je n'avais jamais eu une pose aussi adaptée.",
    rating: 5,
  },
  {
    author: "Sarah",
    body:
      "Studio impeccable, hygiène irréprochable, et un résultat qui tient des semaines sans broncher. Je recommande à 100% pour Lyon 6.",
    rating: 5,
  },
  {
    author: "Léa",
    body:
      "Pose élégante, finition parfaite et un vrai moment pour soi. Manon prend le temps, on se sent bien dans son studio.",
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
          <a
            href={SITE.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-[var(--color-ink)]/70 underline-offset-4 hover:text-[var(--color-ink)] hover:underline md:inline"
          >
            Voir tous les avis Google →
          </a>
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
              <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[var(--color-ink)]/55">
                — {r.author}
              </p>
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
