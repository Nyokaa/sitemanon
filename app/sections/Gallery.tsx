"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";

type Item = {
  id: string;
  category: "nude" | "color" | "art" | "long";
  title: string;
  gradient: string;
  ratio: "tall" | "wide" | "square";
};

const ITEMS: Item[] = [
  { id: "1", category: "nude", title: "Babyboomer pêche", gradient: "from-[#fde0d0] via-[#f5b8a4] to-[#d98a73]", ratio: "tall" },
  { id: "2", category: "art", title: "Fleurs séchées", gradient: "from-[#fce4ec] via-[#f5b6c8] to-[#c97ba0]", ratio: "wide" },
  { id: "3", category: "color", title: "Magenta glacé", gradient: "from-[#f5b8d3] via-[#c14d7c] to-[#7d2747]", ratio: "square" },
  { id: "4", category: "nude", title: "Nude minimaliste", gradient: "from-[#f4e4d4] via-[#e7c8b1] to-[#b69279]", ratio: "tall" },
  { id: "5", category: "long", title: "Amande marbrée", gradient: "from-[#fbe4d6] via-[#e8a89f] to-[#a26d8a]", ratio: "wide" },
  { id: "6", category: "art", title: "Aquarelle pastel", gradient: "from-[#f9e5d8] via-[#e2bdb1] to-[#a17b96]", ratio: "square" },
  { id: "7", category: "color", title: "Orange & fuchsia", gradient: "from-[#ffd6a5] via-[#ff8b6a] to-[#c93f74]", ratio: "tall" },
  { id: "8", category: "long", title: "Stiletto rosé", gradient: "from-[#fde0d6] via-[#f0a895] to-[#b06b6f]", ratio: "wide" },
];

const FILTERS: { id: Item["category"] | "all"; label: string }[] = [
  { id: "all", label: "Tout voir" },
  { id: "nude", label: "Nude & naturel" },
  { id: "color", label: "Couleur" },
  { id: "art", label: "Nail art" },
  { id: "long", label: "Rallongement" },
];

export function Gallery() {
  const [filter, setFilter] = useState<Item["category"] | "all">("all");
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
            href={`https://www.instagram.com/`}
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

        <motion.div
          layout
          className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
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
                className={`group relative overflow-hidden rounded-2xl border border-[var(--color-line)] shadow-sm ${
                  item.ratio === "tall"
                    ? "aspect-[3/4]"
                    : item.ratio === "wide"
                    ? "aspect-[4/3]"
                    : "aspect-square"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
                <NailMotif />
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-[var(--color-ink)]/70 to-transparent p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                    {labelFor(item.category)}
                  </p>
                  <p className="mt-1 font-serif text-base">{item.title}</p>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </motion.div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.2em] text-[var(--color-ink)]/55">
          Visuels illustratifs — remplacer par vos photos en haute résolution
        </p>
      </Container>
    </section>
  );
}

function labelFor(c: Item["category"]) {
  return {
    nude: "Nude",
    color: "Couleur",
    art: "Nail art",
    long: "Rallongement",
  }[c];
}

function NailMotif() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-80"
      viewBox="0 0 200 280"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="nm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="140" rx="50" ry="90" fill="url(#nm)" />
      <ellipse cx="100" cy="100" rx="35" ry="20" fill="#fff" opacity="0.35" />
    </svg>
  );
}
