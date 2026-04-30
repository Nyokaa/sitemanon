"use client";

import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { TRUST_PILLARS } from "@/app/lib/site";

const ICONS = [
  // diagnostic
  <path key="d" d="M11 4a7 7 0 1 1-4.95 11.95M11 4v7l4 4" />,
  // hygiène
  <>
    <path key="h1" d="M5 12h14" />
    <path key="h2" d="M7 12V7a5 5 0 0 1 10 0v5" />
    <path key="h3" d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </>,
  // studio
  <>
    <path key="s1" d="M3 21V8l9-5 9 5v13" />
    <path key="s2" d="M9 21v-7h6v7" />
  </>,
  // tenue
  <>
    <path key="t1" d="M12 2v6" />
    <path key="t2" d="M5 12c0-3 3-5 7-5s7 2 7 5-3 10-7 10-7-7-7-10z" />
  </>,
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
