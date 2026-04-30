"use client";

import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { BookingButton } from "@/app/components/BookingButton";
import { SITE } from "@/app/lib/site";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] py-24 text-[var(--color-bg-soft)] md:py-32">
      <CtaBackground />
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[var(--color-accent-soft)]">
            On se rencontre ?
          </p>
          <h2 className="font-serif text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
            Prête pour des ongles
            <br />
            <span className="italic text-[var(--color-accent-soft)]">faits pour vous</span> ?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--color-bg-soft)]/75 md:text-lg">
            Réservez votre créneau en ligne sur Planity, ou appelez-moi
            directement. Le studio vous attend à Lyon 6.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <BookingButton variant="accent" size="lg" />
            <a
              href={`tel:${SITE.phoneE164}`}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-bg-soft)]/30 px-8 py-4 text-sm text-[var(--color-bg-soft)] transition-colors hover:border-[var(--color-bg-soft)] hover:bg-[var(--color-bg-soft)]/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {SITE.phone}
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function CtaBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,_rgba(178,92,63,0.4),_transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
    </>
  );
}
