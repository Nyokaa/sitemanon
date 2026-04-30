"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { Reveal } from "@/app/components/Reveal";
import { BookingButton } from "@/app/components/BookingButton";

export function About() {
  return (
    <section id="methode" className="relative py-24 md:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <AboutPortrait />
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">
              La méthode Manon
            </p>
            <h2 className="font-serif text-4xl leading-[1.05] text-[var(--color-ink)] md:text-5xl">
              Une approche basée
              <br />
              sur le <span className="italic text-[var(--color-accent)]">diagnostic</span>.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-ink-soft)]/85 md:text-lg">
              Chaque rendez-vous commence par une analyse complète : mode de vie,
              contraintes du quotidien, état de l'ongle, colorimétrie. Une pose
              jamais standardisée, toujours adaptée à <em>vous</em>.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "Diagnostic",
                  d: "On parle de vos envies, vos contraintes, vos ongles.",
                },
                {
                  n: "02",
                  t: "Sur-mesure",
                  d: "Technique, forme et finition choisies ensemble.",
                },
                {
                  n: "03",
                  t: "Pose durable",
                  d: "Geste précis, résultat élégant qui tient dans le temps.",
                },
              ].map((step) => (
                <motion.li
                  key={step.n}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/40 p-5"
                >
                  <p className="font-serif text-2xl text-[var(--color-accent)]">
                    {step.n}
                  </p>
                  <p className="mt-2 font-serif text-lg text-[var(--color-ink)]">
                    {step.t}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-soft)]/80">
                    {step.d}
                  </p>
                </motion.li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-10">
              <BookingButton size="md" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function AboutPortrait() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      <div className="absolute inset-0 -rotate-2 rounded-[2rem] bg-[var(--color-bg-soft)] shadow-sm" />

      <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-[var(--color-line)] shadow-[0_25px_60px_-25px_rgba(44,58,46,0.4)]">
        <Image
          src="/images/portrait.jpeg"
          alt="Manon Jeanpert, prothésiste ongulaire à Lyon 6"
          fill
          sizes="(max-width: 1024px) 100vw, 480px"
          className="object-cover"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-ink)]/80 via-[var(--color-ink)]/20 to-transparent p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/80">Manon Jeanpert</p>
          <p className="mt-1 font-serif text-xl text-white">
            Prothésiste ongulaire à Lyon 6
          </p>
        </div>
      </div>

      <div className="absolute -right-4 top-8 hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 shadow-md md:block">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Approche
        </p>
        <p className="mt-1 font-serif text-base text-[var(--color-ink)]">
          Sur-mesure
        </p>
      </div>
    </div>
  );
}
