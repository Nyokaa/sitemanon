"use client";

import { motion } from "framer-motion";
import { BookingButton } from "@/app/components/BookingButton";
import { Container } from "@/app/components/Container";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
    >
      <BackgroundOrnaments />

      <Container className="relative grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]"
          >
            <span className="h-px w-8 bg-[var(--color-accent)]" />
            Studio privé · Lyon 6 · Tête d'Or
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="font-serif text-5xl leading-[0.98] tracking-tight text-[var(--color-ink)] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            Des ongles
            <br />
            <span className="italic text-[var(--color-accent)]">durables</span>,
            <br />
            pensés pour
            <br />
            votre quotidien.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-ink-soft)]/85 md:text-xl"
          >
            Prothésiste ongulaire à Lyon 6, j'imagine des poses sur-mesure :
            diagnostic personnalisé, hygiène irréprochable, résultat élégant et
            qui dure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <BookingButton size="lg" />
            <a
              href="#prestations"
              className="group inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-[var(--color-ink)] underline-offset-4 hover:underline"
            >
              Voir les prestations
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.18em] text-[var(--color-ink)]/60"
          >
            <span>Diagnostic personnalisé</span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-accent)]" />
            <span>Hygiène irréprochable</span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-accent)]" />
            <span>Tenue 3 — 4 semaines</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="lg:col-span-5"
        >
          <HeroVisual />
        </motion.div>
      </Container>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-md">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-[#f3d4c1] via-[#e9b8a3] to-[#c97e63] opacity-40 blur-2xl" />

      <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-[var(--color-line)] shadow-[0_30px_80px_-30px_rgba(44,58,46,0.45)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5dccb] via-[#eab8a0] to-[#c98770]" />

        <svg
          className="absolute inset-0 h-full w-full opacity-90"
          viewBox="0 0 400 540"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <radialGradient id="nail-grad" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#fce6da" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c97e63" stopOpacity="0.0" />
            </radialGradient>
            <linearGradient id="nail-shape" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#fad9c8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#e8a98e" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="400" height="540" fill="url(#nail-grad)" />
          {[
            { x: 90, y: 220, w: 38, h: 150, r: 18 },
            { x: 150, y: 180, w: 42, h: 200, r: 20 },
            { x: 215, y: 165, w: 44, h: 220, r: 21 },
            { x: 282, y: 200, w: 40, h: 180, r: 19 },
          ].map((n, i) => (
            <rect
              key={i}
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={n.r}
              fill="url(#nail-shape)"
              opacity="0.95"
            />
          ))}
          <g opacity="0.85">
            <circle cx="232" cy="190" r="3" fill="#c14d6b" />
            <circle cx="240" cy="200" r="2" fill="#7e8d4f" />
            <circle cx="225" cy="205" r="2.5" fill="#e3a8c3" />
            <path d="M222 215 q5 -8 12 -2" stroke="#a85a3a" strokeWidth="1" fill="none" />
          </g>
        </svg>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-ink)]/55 via-[var(--color-ink)]/10 to-transparent p-6">
          <p className="font-serif text-lg italic text-white/95">
            « Une pose jamais standardisée, toujours adaptée. »
          </p>
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink)] backdrop-blur">
          Photo signature
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/95 px-5 py-4 shadow-lg backdrop-blur md:block">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Réservation
        </p>
        <p className="mt-1 font-serif text-lg text-[var(--color-ink)]">
          24h/24 sur Planity
        </p>
      </div>
    </div>
  );
}

function BackgroundOrnaments() {
  return (
    <>
      <div className="pointer-events-none absolute -top-32 left-1/3 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,_rgba(178,92,63,0.22),_transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 -z-10 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,_rgba(44,58,46,0.18),_transparent_70%)] blur-3xl" />
    </>
  );
}
