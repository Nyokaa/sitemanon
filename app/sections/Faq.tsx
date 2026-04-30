"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { FAQ } from "@/app/lib/site";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <Container className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader
            eyebrow="Questions fréquentes"
            title="Tout ce que vous voulez savoir avant de réserver."
            intro="Une question qui n'est pas listée ? Écrivez-moi sur Instagram ou appelez-moi directement."
          />
        </div>

        <div className="lg:col-span-8">
          <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-[var(--color-accent)]"
                  >
                    <span className="font-serif text-xl text-[var(--color-ink)] md:text-2xl">
                      {item.q}
                    </span>
                    <span
                      className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--color-ink)]/30 transition-transform ${
                        isOpen ? "rotate-45 bg-[var(--color-ink)] text-[var(--color-bg-soft)]" : "text-[var(--color-ink)]"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-12 text-base leading-relaxed text-[var(--color-ink-soft)]/85">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
