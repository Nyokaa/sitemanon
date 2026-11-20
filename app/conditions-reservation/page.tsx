import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "../components/Container";
import { SITE } from "../lib/site";

export const metadata: Metadata = {
  title: "Conditions de réservation",
  description:
    "Conditions de réservation en ligne chez Manon Jeanpert, prothésiste ongulaire à Lyon 6 : acompte, report et annulation.",
  alternates: { canonical: "/conditions-reservation/" },
};

// Les regles affichees ici sont celles de la page /reserver/ : un acompte
// de 50 %, un report gratuit jusqu'a 48 h avant, aucun remboursement de
// l'acompte. Toute modification doit etre faite aux deux endroits.
export default function ConditionsReservation() {
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
            Réservation en ligne
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
            Conditions de réservation
          </h1>

          <div className="mt-10 space-y-8 text-[var(--color-ink-soft)]">
            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">Acompte</h2>
              <p className="mt-2 leading-relaxed">
                La réservation en ligne se fait avec un acompte de 50 % du prix
                de la prestation, payé en ligne au moment de réserver
                (carte bancaire, Apple Pay ou Google Pay, par Stripe).
                L&apos;acompte est déduit du prix de votre prestation : le reste
                se règle au studio, en espèces ou par carte.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">Report</h2>
              <p className="mt-2 leading-relaxed">
                Vous pouvez décaler votre rendez-vous gratuitement jusqu&apos;à
                48 h avant, en contactant Manon par téléphone ou sur WhatsApp au{" "}
                <a href={`tel:${SITE.phoneE164}`} className="underline underline-offset-4">
                  {SITE.phone}
                </a>
                . Le report ne se fait pas en ligne pour l&apos;instant.
              </p>
              <p className="mt-3 leading-relaxed">
                À moins de 48 h du rendez-vous, aucun report n&apos;est plus
                possible : l&apos;acompte est perdu.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">Annulation</h2>
              <p className="mt-2 leading-relaxed">
                En cas d&apos;annulation, l&apos;acompte n&apos;est jamais remboursé.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">Studio</h2>
              <p className="mt-2 leading-relaxed">
                {SITE.name}, prothésiste ongulaire
                <br />
                {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}
              </p>
            </section>

            <p>
              <Link href="/reserver/" className="underline underline-offset-4">
                Retour à la réservation
              </Link>
            </p>
          </div>
        </Container>
      </main>
    </>
  );
}
