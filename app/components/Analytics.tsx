"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CONSENT_KEY,
  Consent,
  EVENEMENT_GTAG_PRET,
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  META_PIXEL_ID,
  domaineAutorise,
  getStoredConsent,
} from "@/app/lib/analytics";

const RESET_EVENT = "mj-cookie-reset";

export function Analytics() {
  const [consent, setConsent] = useState<Consent | null | "loading">("loading");
  // Faux tant que le domaine n'est pas verifie : rien ne se charge au rendu
  // statique, ni sur localhost ou un autre domaine.
  const [domaineOk, setDomaineOk] = useState(false);

  useEffect(() => {
    setConsent(getStoredConsent());
    setDomaineOk(domaineAutorise(window.location.hostname));

    const onReset = () => setConsent(null);
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  // Le premier PageView part avec l'initialisation du pixel. Les suivants
  // suivent la navigation interne, que Next fait sans recharger la page.
  const pathname = usePathname();
  const premierePage = useRef(true);
  useEffect(() => {
    if (consent !== "accepted") return;
    if (premierePage.current) {
      premierePage.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname, consent]);

  const persist = (value: Consent) => {
    // On regarde les balises reellement chargees, pas le choix enregistre :
    // « Gerer les cookies » efface ce choix avant de rouvrir la banniere.
    const balisesChargees =
      typeof window.gtag === "function" || typeof window.fbq === "function";
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    // Retrait d'un consentement deja donne : les balises chargees ne se
    // dechargent pas seules. On previent Google, puis on recharge la page,
    // qui repart sans GA4, sans Google Ads et sans pixel.
    if (value === "refused" && balisesChargees) {
      window.gtag?.("consent", "update", {
        ad_storage: "denied",
        analytics_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      window.location.reload();
    }
  };

  return (
    <>
      {consent === "accepted" && domaineOk ? (
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
              // Consent Mode v2, mode de base : ce script ne se charge
              // qu'apres « Accepter », donc le consentement est accorde.
              gtag('consent', 'default', {
                ad_storage: 'granted',
                analytics_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
              });
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
              // Google Ads : configuration seule (relais de conversion,
              // cookie _gcl_aw). Les conversions restent importees de GA4.
              gtag('config', '${GOOGLE_ADS_ID}');
              // Libere les evenements emis avant le chargement de gtag.
              window.dispatchEvent(new Event('${EVENEMENT_GTAG_PRET}'));
            `}
          </Script>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
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
              les visiteurs, ainsi que Google Ads et le pixel Meta pour mesurer
              l&apos;efficacité de nos publicités Google, Facebook et
              Instagram. Ces outils ne se chargent que si vous acceptez.{" "}
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
