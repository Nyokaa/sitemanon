import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "../components/Container";
import { SITE } from "../lib/site";
import { Reservation } from "./Reservation";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description:
    "Réservez votre prestation chez Manon Jeanpert, prothésiste ongulaire à Lyon 6 : choisissez votre prestation et votre créneau en ligne.",
  alternates: { canonical: "/reserver/" },
};

export default function ReserverPage() {
  return (
    <>
      <header className="border-b border-[var(--color-line)] bg-[var(--color-bg)]">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="font-serif text-lg text-[var(--color-ink)]">
            {SITE.name}
          </Link>
          <a
            href={`tel:${SITE.phoneE164}`}
            className="text-sm text-[var(--color-ink)]/75 hover:text-[var(--color-ink)]"
          >
            {SITE.phone}
          </a>
        </Container>
      </header>
      <main className="pb-24 pt-10 md:pt-14">
        <Container className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">
            Studio privé · {SITE.address.street}, Lyon 6
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
            Prendre rendez-vous
          </h1>
          <Reservation />
        </Container>
      </main>
    </>
  );
}
