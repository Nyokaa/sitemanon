"use client";

import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { Reveal } from "@/app/components/Reveal";

const POINTS = [
  {
    title: "On commence par discuter",
    body:
      "Le diagnostic (30 min, 10 €) sert à comprendre votre quotidien, vos contraintes et vos envies. Le tarif est ensuite déduit de la pose. Aucun engagement.",
  },
  {
    title: "On choisit ensemble",
    body:
      "Forme, longueur, couleur, finition : la technique est adaptée à vous, pas l'inverse. Vous repartez avec un plan clair, jamais une surprise au moment de payer.",
  },
  {
    title: "Le studio est fait pour vous mettre à l'aise",
    body:
      "Espace privé, calme, hygiène irréprochable. Vous pouvez parler ou rester silencieuse, écouter de la musique ou pas. Votre rendez-vous, votre rythme.",
  },
];

export function FirstVisit() {
  return (
    <section className="relative bg-[var(--color-bg-soft)]/55 py-24 md:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">
                Vous venez pour la première fois ?
              </p>
              <h2 className="font-serif text-4xl leading-[1.05] text-[var(--color-ink)] md:text-5xl">
                Pas de stress.
                <br />
                <span className="italic text-[var(--color-accent)]">
                  Voilà comment ça se passe.
                </span>
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-ink-soft)]/85 md:text-lg">
                Première pose ? Vous changez de prothésiste ? Le premier
                rendez-vous est conçu pour vous mettre en confiance — vous
                repartez avec une vision claire de ce qui est adapté à vos
                ongles.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <ol className="space-y-5">
              {POINTS.map((p, i) => (
                <motion.li
                  key={p.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-5 rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 md:p-7"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-accent)]/10 font-serif text-base text-[var(--color-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-serif text-xl text-[var(--color-ink)] md:text-2xl">
                      {p.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]/85 md:text-base">
                      {p.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
