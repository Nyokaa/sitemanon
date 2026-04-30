"use client";

import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { TRUST_PILLARS } from "@/app/lib/site";

const ICONS: React.ReactNode[] = [
  // 0 — Diagnostic personnalisé : loupe avec check
  <g key="d">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
    <path d="m8.5 11 2 2 3-3" />
  </g>,
  // 1 — Hygiène irréprochable : bouclier avec check
  <g key="h">
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
    <path d="m8.5 12 2.5 2.5 4.5-4.5" />
  </g>,
  // 2 — Studio Lyon 6 : pin localisation
  <g key="s">
    <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </g>,
  // 3 — Tenue durable : horloge
  <g key="t">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </g>,
];

export function TrustStrip() {
  return (
    <section className="relative border-y border-[var(--color-line)] bg-[var(--color-bg-soft)]/60 py-14 md:py-18">
      <Container>
        <ul className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((p, i) => (
            <motion.li
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-4"
            >
              <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-bg)] text-[var(--color-accent)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {ICONS[i]}
                </svg>
              </span>
              <div>
                <p className="font-serif text-lg text-[var(--color-ink)]">
                  {p.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-soft)]/80">
                  {p.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
