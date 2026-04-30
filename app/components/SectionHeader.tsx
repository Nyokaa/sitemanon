"use client";

import { motion } from "framer-motion";

type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
};

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
}: Props) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`max-w-2xl ${alignment}`}
    >
      {eyebrow ? (
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-4xl leading-[1.05] text-[var(--color-ink)] md:text-5xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-5 text-base leading-relaxed text-[var(--color-ink-soft)]/85 md:text-lg">
          {intro}
        </p>
      ) : null}
    </motion.div>
  );
}
