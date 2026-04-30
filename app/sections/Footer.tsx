import { Container } from "@/app/components/Container";
import { SITE } from "@/app/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-bg-soft)]/40 py-14 text-sm text-[var(--color-ink-soft)]/80">
      <Container className="grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl text-[var(--color-ink)]">
            Manon Jeanpert
          </p>
          <p className="mt-3 max-w-sm leading-relaxed">
            Prothésiste ongulaire à Lyon 6. Studio privé, diagnostic personnalisé,
            poses durables.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Studio
          </p>
          <p className="mt-3 leading-relaxed">
            {SITE.address.street}
            <br />
            {SITE.address.postalCode} {SITE.address.city}
          </p>
          <a
            href={`tel:${SITE.phoneE164}`}
            className="mt-2 block text-[var(--color-ink)] hover:text-[var(--color-accent)]"
          >
            {SITE.phone}
          </a>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Suivre & réserver
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href={SITE.planityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-ink)]"
              >
                Réserver sur Planity
              </a>
            </li>
            <li>
              <a
                href={SITE.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-ink)]"
              >
                Avis Google
              </a>
            </li>
            <li>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-ink)]"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={SITE.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-ink)]"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-ink-soft)]/70 md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} Manon Jeanpert · Tous droits réservés</p>
        <a href="/mentions-legales" className="hover:text-[var(--color-ink)]">
          Mentions légales
        </a>
      </Container>
    </footer>
  );
}
