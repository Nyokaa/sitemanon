"use client";

import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { BookingButton } from "@/app/components/BookingButton";
import { SERVICES } from "@/app/lib/site";

export function Services() {
  return (
    <section
      id="prestations"
      className="relative bg-[var(--color-bg-soft)]/55 py-24 md:py-32"
    >
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Prestations & tarifs"
            title="Des prestations adaptées à chaque cliente."
            intro="Toutes les poses commencent par un diagnostic. Le tarif du diagnostic est déduit de la prestation réalisée."
          />
          <div className="hidden md:block">
            <BookingButton variant="primary" size="md" />
          </div>
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative flex flex-col rounded-3xl border p-7 transition-all hover:-translate-y-1 hover:shadow-lg ${
                s.highlight
                  ? "border-[var(--color-accent)]/40 bg-[var(--color-bg)]"
                  : "border-[var(--color-line)] bg-[var(--color-bg)]/70"
              }`}
            >
              {s.highlight ? (
                <span className="absolute right-5 top-5 rounded-full bg-[var(--color-accent)]/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  Populaire
                </span>
              ) : null}

              <h3 className="font-serif text-2xl leading-tight text-[var(--color-ink)]">
                {s.name}
              </h3>
              <p className="mt-3 grow text-sm leading-relaxed text-[var(--color-ink-soft)]/80">
                {s.description}
              </p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-serif text-3xl text-[var(--color-ink)]">
                  {s.price}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-ink)]/55">
                  {s.duration}
                </span>
              </div>

              <BookingButton
                variant="ghost"
                size="sm"
                className="mt-6 w-full justify-center"
              >
                Réserver
              </BookingButton>
            </motion.li>
          ))}
        </ul>

        <div className="mt-12 md:hidden">
          <BookingButton variant="primary" size="lg" className="w-full" />
        </div>
      </Container>
    </section>
  );
}
