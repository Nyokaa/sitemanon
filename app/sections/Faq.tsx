"use client";

import { useId, useState } from "react";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { FAQ } from "@/app/lib/site";

export function Faq() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <Container className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader
            eyebrow="Questions fréquentes"
            title="Tout ce que vous voulez savoir avant de réserver."
            intro="Une question qui n'est pas listée ? Écrivez-moi sur Instagram ou appelez-moi directement."
          />
        </div>

        <div className="lg:col-span-8">
          <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {FAQ.map((item, i) => {
              const open = openIndex === i;
              const panelId = `${baseId}-panel-${i}`;
              const buttonId = `${baseId}-button-${i}`;
              return (
                <li key={item.q}>
                  <h3 className="m-0">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(open ? -1 : i)}
                      className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-[var(--color-accent)]"
                    >
                      <span className="font-serif text-xl text-[var(--color-ink)] md:text-2xl">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--color-ink)]/30 transition-transform duration-300 ${
                          open
                            ? "rotate-45 bg-[var(--color-ink)] text-[var(--color-bg-soft)]"
                            : "text-[var(--color-ink)]"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    {...(!open && { inert: "" as unknown as boolean })}
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                      open
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <p className="pb-6 pr-12 text-base leading-relaxed text-[var(--color-ink-soft)]/85">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
