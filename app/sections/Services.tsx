"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { BookingButton } from "@/app/components/BookingButton";
import { SERVICES } from "@/app/lib/site";

export function Services() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            <BookingButton variant="primary" size="md" source="services_top" />
          </div>
        </div>

        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-[var(--color-ink)]/55 md:hidden">
          Touchez une carte pour voir le détail
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const isExpanded = expandedId === s.id;

            return (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: (i % 3) * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative rounded-2xl border transition-shadow md:rounded-3xl md:p-7 md:hover:-translate-y-1 md:hover:shadow-lg ${
                  s.highlight
                    ? "border-[var(--color-accent)]/40 bg-[var(--color-bg)]"
                    : "border-[var(--color-line)] bg-[var(--color-bg)]/70"
                } ${isExpanded ? "col-span-2 md:col-span-1" : ""}`}
              >
                {s.highlight ? (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-[var(--color-accent)]/15 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[var(--color-accent)] md:right-5 md:top-5 md:px-3 md:py-1 md:text-[10px] md:tracking-[0.18em]">
                    Populaire
                  </span>
                ) : null}

                {/* Header — always visible */}
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : s.id)
                  }
                  className="flex w-full flex-col items-start p-4 text-left md:p-0 md:pointer-events-none"
                >
                  <h3 className="font-serif text-base leading-tight text-[var(--color-ink)] md:text-2xl">
                    {s.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2 md:mt-6 md:gap-3">
                    <span className="font-serif text-xl text-[var(--color-ink)] md:text-3xl">
                      {s.price}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink)]/55 md:text-xs md:tracking-[0.18em]">
                      {s.duration}
                    </span>
                  </div>
                </button>

                {/* Body — desktop always visible, mobile collapsible */}
                <div className="hidden md:block">
                  <p className="mt-3 grow text-sm leading-relaxed text-[var(--color-ink-soft)]/80">
                    {s.description}
                  </p>
                  <BookingButton
                    variant="ghost"
                    size="sm"
                    source={`service_${s.id}`}
                    className="mt-6 w-full justify-center"
                  >
                    Prendre rendez-vous
                  </BookingButton>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden md:hidden"
                    >
                      <div className="px-4 pb-4">
                        <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]/85">
                          {s.description}
                        </p>
                        <BookingButton
                          variant="primary"
                          size="sm"
                          source={`service_${s.id}`}
                          className="mt-4 w-full justify-center"
                        >
                          Prendre rendez-vous
                        </BookingButton>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-12 md:hidden">
          <BookingButton
            variant="primary"
            size="lg"
            className="w-full"
            source="services_bottom"
          />
        </div>
      </Container>
    </section>
  );
}
