import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "../../components/Container";
import { SITE } from "../../lib/site";
import { Merci } from "./Merci";

export const metadata: Metadata = {
  title: "Rendez-vous confirmé",
  robots: { index: false, follow: false },
};

export default function MerciPage() {
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
          <Merci />
        </Container>
      </main>
    </>
  );
}
