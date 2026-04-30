"use client";

import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { SITE } from "@/app/lib/site";

export function Studio() {
  const mapsQuery = encodeURIComponent(
    `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`
  );

  return (
    <section
      id="studio"
      className="relative bg-[var(--color-bg-soft)]/60 py-24 md:py-32"
    >
      <Container className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="Le studio"
            title="Votre adresse à Lyon 6."
            intro="Un studio privé, pensé pour vous accueillir dans les meilleures conditions, à deux pas du Parc de la Tête d'Or."
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-10 space-y-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Adresse
              </p>
              <p className="mt-2 font-serif text-xl text-[var(--color-ink)]">
                {SITE.address.street}
              </p>
              <p className="text-[var(--color-ink-soft)]/85">
                {SITE.address.postalCode} {SITE.address.city}
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]/70">
                À deux pas du Parc de la Tête d'Or
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Horaires
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--color-ink-soft)]/85">
                {SITE.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-6">
                    <span>{h.day}</span>
                    <span className="text-[var(--color-ink)]/75">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Contact
              </p>
              <a
                href={`tel:${SITE.phoneE164}`}
                className="mt-2 block font-serif text-xl text-[var(--color-ink)] hover:text-[var(--color-accent)]"
              >
                {SITE.phone}
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7"
        >
          <div className="overflow-hidden rounded-3xl border border-[var(--color-line)] shadow-[0_25px_60px_-30px_rgba(44,58,46,0.4)]">
            <iframe
              title="Plan d'accès au studio Manon Jeanpert, Lyon 6"
              src={`https://maps.google.com/maps?q=${mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="h-[420px] w-full border-0 grayscale-[20%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-center text-sm text-[var(--color-ink)]/85 hover:bg-[var(--color-ink)]/5"
            >
              Itinéraire
            </a>
            <a
              href={SITE.googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-center text-sm text-[var(--color-ink)]/85 hover:bg-[var(--color-ink)]/5"
            >
              Fiche Google
            </a>
            <a
              href={`tel:${SITE.phoneE164}`}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-center text-sm text-[var(--color-ink)]/85 hover:bg-[var(--color-ink)]/5"
            >
              Appeler
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
