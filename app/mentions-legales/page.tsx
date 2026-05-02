import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../sections/Footer";
import { Container } from "../components/Container";
import { SITE } from "../lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Manon Jeanpert, prothésiste ongulaire à Lyon 6.",
  robots: { index: false, follow: true },
};

export default function MentionsLegales() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24">
        <Container className="prose-zinc">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">
            Informations
          </p>
          <h1 className="font-serif mt-3 text-4xl text-[var(--color-ink)] md:text-5xl">
            Mentions légales
          </h1>

          <div className="mt-10 space-y-8 text-[var(--color-ink-soft)]/85">
            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Éditeur du site
              </h2>
              <p className="mt-2 leading-relaxed">
                {SITE.name} — Prothésiste ongulaire
                <br />
                {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}
                <br />
                Téléphone : {SITE.phone}
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Hébergement
              </h2>
              <p className="mt-2 leading-relaxed">
                À compléter (nom et adresse de l'hébergeur).
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Propriété intellectuelle
              </h2>
              <p className="mt-2 leading-relaxed">
                L'ensemble des contenus présents sur ce site (textes, photos,
                visuels) est la propriété exclusive de {SITE.name}. Toute
                reproduction sans autorisation préalable est interdite.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Données personnelles
              </h2>
              <p className="mt-2 leading-relaxed">
                Aucune donnée n&apos;est collectée par formulaire sur ce site.
                Les réservations sont gérées par la plateforme Planity, soumise
                à sa propre politique de confidentialité.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">
                Cookies & mesure d&apos;audience
              </h2>
              <p className="mt-2 leading-relaxed">
                Ce site utilise <strong>Google Analytics 4</strong> pour mesurer
                la fréquentation et améliorer l&apos;expérience. Les données
                sont anonymisées (IP tronquée) et conservées 14 mois maximum.
                Aucune donnée n&apos;est partagée avec des tiers à des fins
                publicitaires.
              </p>
              <p className="mt-3 leading-relaxed">
                Aucun cookie analytique n&apos;est déposé tant que vous
                n&apos;avez pas donné votre consentement explicite via le
                bandeau qui s&apos;affiche à votre première visite. Vous pouvez
                à tout moment revenir sur votre choix via le lien{" "}
                <em>Gérer les cookies</em> en bas de page.
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
