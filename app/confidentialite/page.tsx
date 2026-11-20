import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "../components/Container";
import { SITE } from "../lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Données personnelles traitées par le site de Manon Jeanpert, prothésiste ongulaire à Lyon 6 : réservation en ligne, réservations non finalisées, mesure d'audience.",
  alternates: { canonical: "/confidentialite/" },
};

// Les durees et finalites decrites ici doivent rester alignees sur le code :
// relances dans agenda/Code.gs (RELANCE_CONSERVATION_JOURS = 30), balises
// dans app/components/Analytics.tsx.
export default function Confidentialite() {
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
            Données personnelles
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
            Politique de confidentialité
          </h1>

          <div className="mt-10 space-y-8 leading-relaxed text-[var(--color-ink-soft)]">
            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">Responsable</h2>
              <p className="mt-2">
                {SITE.name}, prothésiste ongulaire, {SITE.address.street},{" "}
                {SITE.address.postalCode} {SITE.address.city}. Téléphone et
                WhatsApp : {SITE.phone}.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Réservation en ligne
              </h2>
              <p className="mt-2">
                Lorsque vous réservez sur ce site, vos nom, téléphone et email,
                votre message éventuel, la prestation et le créneau choisis sont
                enregistrés dans l&apos;agenda Google de Manon Jeanpert, pour le
                suivi de votre rendez-vous. Le paiement de l&apos;acompte est
                traité par Stripe : vos données de carte ne transitent jamais par
                ce site.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Réservation non finalisée
              </h2>
              <p className="mt-2">
                Si vous commencez une réservation sans la finaliser, les
                informations déjà saisies (prénom et nom, téléphone, email,
                prestation et créneau choisis, et le montant de l&apos;acompte si
                vous avez cliqué sur « Payer l&apos;acompte ») sont enregistrées
                dès que vous avez indiqué un téléphone ou un email.
              </p>
              <p className="mt-3">
                Elles servent uniquement à vous recontacter au sujet de votre
                demande de rendez-vous : si aucun paiement n&apos;est confirmé dans
                les 30 minutes, elles sont transmises une seule fois par email à
                Manon Jeanpert et à son prestataire chargé du site. Elles ne sont
                jamais utilisées à d&apos;autres fins, ni transmises à des outils
                de mesure ou de publicité. Si la réservation est confirmée, elles
                sont effacées. Dans tous les cas, elles sont supprimées
                automatiquement au bout de 30 jours.
              </p>
              <p className="mt-3">
                Ce traitement repose sur l&apos;intérêt légitime de Manon Jeanpert
                à donner suite à une demande de rendez-vous que vous avez
                commencée.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Mesure d&apos;audience et publicité
              </h2>
              <p className="mt-2">
                Google Analytics, Google Ads et le pixel Meta ne se chargent que si
                vous les acceptez. Le détail figure dans les{" "}
                <Link href="/mentions-legales/" className="underline underline-offset-4">
                  mentions légales
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Hébergement et destinataires
              </h2>
              <p className="mt-2">
                Les données de réservation sont traitées par Google (agenda,
                service de réservation, email) et Stripe (paiement). Elles ne
                sont ni vendues ni cédées.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">Vos droits</h2>
              <p className="mt-2">
                Vous pouvez demander l&apos;accès à vos données, leur rectification
                ou leur effacement, ou vous opposer à leur traitement, en
                contactant Manon Jeanpert au {SITE.phone}. Vous pouvez aussi
                adresser une réclamation à la CNIL (cnil.fr).
              </p>
            </section>
          </div>
        </Container>
      </main>
    </>
  );
}
