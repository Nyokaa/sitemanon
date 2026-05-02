"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingButton } from "./BookingButton";
import { SITE } from "@/app/lib/site";

const NAV = [
  { href: "#prestations", label: "Prestations" },
  { href: "#galerie", label: "Galerie" },
  { href: "#methode", label: "Méthode" },
  { href: "#avis", label: "Avis" },
  { href: "#studio", label: "Studio" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--color-bg)]/85 backdrop-blur-md shadow-[0_1px_0_0_var(--color-line)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <a
          href="#top"
          className="group flex items-center gap-3"
          aria-label="Accueil — Manon Jeanpert"
        >
          <span className="font-serif text-xl tracking-tight text-[var(--color-ink)] md:text-2xl">
            Manon Jeanpert
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm text-[var(--color-ink)]/80 transition-colors hover:text-[var(--color-ink)]"
            >
              <span>{item.label}</span>
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`tel:${SITE.phoneE164}`}
            className="text-sm text-[var(--color-ink)]/70 hover:text-[var(--color-ink)]"
            aria-label="Appeler Manon"
          >
            {SITE.phone}
          </a>
          <BookingButton size="sm" source="header" />
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-ink)]/20 text-[var(--color-ink)] lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[var(--color-line)] bg-[var(--color-bg)]/95 backdrop-blur"
          >
            <nav className="flex flex-col gap-1 px-6 py-6">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-line)] pt-4">
                <a
                  href={`tel:${SITE.phoneE164}`}
                  className="rounded-lg px-3 py-3 text-sm text-[var(--color-ink)]/80"
                >
                  {SITE.phone}
                </a>
                <BookingButton size="md" className="w-full" source="mobile_menu" />
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
