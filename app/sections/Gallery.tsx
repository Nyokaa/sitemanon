"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { SITE } from "@/app/lib/site";
import { asset } from "@/app/lib/asset";

type Category = "nude" | "color" | "art" | "long";

type Item = {
  id: string;
  category: Category;
  title: string;
  src: string;
};

const ITEMS: Item[] = [
  { id: "n1", category: "nude", title: "Nude amande long", src: "/images/gallery/nude-1.png" },
  { id: "n2", category: "nude", title: "Ombré rosé naturel", src: "/images/gallery/nudes-rose.png" },
  { id: "n3", category: "nude", title: "Rallongement nude", src: "/images/gallery/long2.png" },

  { id: "c1", category: "color", title: "Écaille caramel & or", src: "/images/gallery/couleurs1.png" },
  { id: "c2", category: "color", title: "Ombré pêche & fleurs séchées", src: "/images/gallery/couleurs2.png" },
  { id: "c3", category: "color", title: "French jaune pailleté", src: "/images/gallery/couleurs3.png" },

  { id: "l1", category: "long", title: "Marbré rose long", src: "/images/gallery/couleurs4.jpeg" },

  { id: "a1", category: "art", title: "Fleurs roses french", src: "/images/gallery/nailart1.jpeg" },
  { id: "a2", category: "art", title: "Nail art floral", src: "/images/gallery/nailart1.png" },
  { id: "a3", category: "art", title: "Fleurs séchées coral", src: "/images/gallery/nailart2.jpeg" },
  { id: "a4", category: "art", title: "Fleurs blanches & jaunes", src: "/images/gallery/nailart3.jpeg" },
  { id: "a5", category: "art", title: "Personnage Disney", src: "/images/gallery/nailart4.jpeg" },
  { id: "a6", category: "art", title: "Cinéma & couleurs", src: "/images/gallery/nailart5.jpeg" },
  { id: "a7", category: "art", title: "Création signature", src: "/images/gallery/nailart6.jpeg" },
];

const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "Tout voir" },
  { id: "nude", label: "Nude & naturel" },
  { id: "color", label: "Couleur" },
  { id: "art", label: "Nail art" },
  { id: "long", label: "Rallongement" },
];

export function Gallery() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const visible = ITEMS.filter((i) => filter === "all" || i.category === filter);

  return (
    <section id="galerie" className="relative py-24 md:py-32">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Portfolio"
            title="Des résultats visibles, sans compromis sur la qualité."
            intro="Quelques pièces récentes du studio. Chaque pose est unique et conçue pour vous."
          />
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-[var(--color-ink)]/70 underline-offset-4 hover:text-[var(--color-ink)] hover:underline md:inline"
          >
            Voir sur Instagram →
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-5 py-2 text-sm transition-all ${
                  active
                    ? "bg-[var(--color-ink)] text-[var(--color-bg-soft)]"
                    : "bg-[var(--color-bg-soft)]/60 text-[var(--color-ink)]/80 hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <motion.div layout className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((item) => (
              <motion.figure
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/40 shadow-sm"
              >
                <Image
                  src={asset(item.src)}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-[var(--color-ink)]/80 via-[var(--color-ink)]/30 to-transparent p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                    {labelFor(item.category)}
                  </p>
                  <p className="mt-1 font-serif text-base">{item.title}</p>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  );
}

function labelFor(c: Category) {
  return {
    nude: "Nude",
    color: "Couleur",
    art: "Nail art",
    long: "Rallongement",
  }[c];
}
