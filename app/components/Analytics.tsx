"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CONSENT_KEY,
  Consent,
  GA_MEASUREMENT_ID,
  getStoredConsent,
} from "@/app/lib/analytics";

const RESET_EVENT = "mj-cookie-reset";

export function Analytics() {
  const [consent, setConsent] = useState<Consent | null | "loading">("loading");

  useEffect(() => {
    setConsent(getStoredConsent());

    const onReset = () => setConsent(null);
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  const persist = (value: Consent) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "accepted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                anonymize_ip: true,
                page_path: window.location.pathname
              });
            `}
          </Script>
        </>
      ) : null}

      <AnimatePresence>
        {consent === null ? (
          <motion.aside
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-labelledby="cookie-title"
            aria-describedby="cookie-desc"
            className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-5 shadow-[0_25px_50px_-15px_rgba(44,58,46,0.45)] md:bottom-5 md:p-6"
          >
            <p
              id="cookie-title"
              className="font-serif text-base text-[var(--color-ink)] md:text-lg"
            >
              Vos cookies, votre choix
            </p>
            <p
              id="cookie-desc"
              className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]/85"
            >
              Ce site utilise Google Analytics pour comprendre ce qui intéresse
              les visiteurs et améliorer l&apos;expérience. Aucune donnée
              personnelle n&apos;est partagée avec des tiers à des fins
              publicitaires.{" "}
              <a
                href="/mentions-legales"
                className="underline underline-offset-2 hover:text-[var(--color-ink)]"
              >
                En savoir plus
              </a>
              .
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => persist("refused")}
                className="rounded-full border border-[var(--color-ink)]/25 px-5 py-2.5 text-sm text-[var(--color-ink)]/85 transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)]/5"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={() => persist("accepted")}
                className="rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg-soft)] transition-colors hover:bg-[var(--color-ink-soft)]"
              >
                Accepter
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/** Programmatic way to re-open the consent banner (used by footer link). */
export function resetCookieConsent() {
  window.localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new Event(RESET_EVENT));
}
