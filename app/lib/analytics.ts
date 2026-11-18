declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = "G-N032H9NZ3E";
export const GOOGLE_ADS_ID = "AW-18205554627";
/** Emis par le script d'initialisation de gtag, une fois gtag pret. */
export const EVENEMENT_GTAG_PRET = "mj-gtag-pret";
export const META_PIXEL_ID = "1635263904032770";

export const CONSENT_KEY = "mj-cookie-consent";
export type Consent = "accepted" | "refused";

export function getStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "refused" ? v : null;
}

// Evenements emis avant que gtag soit charge : un clic juste apres
// « Accepter », ou une conversion sur une page ou les cookies sont acceptes
// apres coup. Ils partent des que gtag est pret. Si la visiteuse refuse,
// gtag ne se charge jamais et rien ne part.
const enAttente: [string, Record<string, unknown>][] = [];

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  // send_to limite l'evenement a GA4. Sans lui, gtag l'envoie aussi a la
  // balise Google Ads configuree a cote ; or les conversions Ads doivent
  // rester importees depuis GA4, jamais envoyees directement.
  const avecDestination = { ...params, send_to: GA_MEASUREMENT_ID };
  if (window.gtag) window.gtag("event", name, avecDestination);
  else enAttente.push([name, avecDestination]);
}

if (typeof window !== "undefined") {
  window.addEventListener(EVENEMENT_GTAG_PRET, () => {
    while (enAttente.length) {
      const [n, p] = enAttente.shift()!;
      window.gtag?.("event", n, p);
    }
  });
}

/**
 * Evenement standard du pixel Meta. Sans consentement le pixel n'est pas
 * charge, window.fbq n'existe pas, et l'appel ne fait rien.
 */
export function trackPixel(
  name: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
): void {
  if (typeof window === "undefined") return;
  const envoyer = () => {
    if (!window.fbq) return false;
    window.fbq("track", name, params ?? {}, options ?? {});
    return true;
  };
  if (envoyer() || getStoredConsent() !== "accepted") return;
  // Consentement donne mais pixel pas encore charge : c'est le cas d'un
  // evenement emis des l'arrivee sur la page. On attend jusqu'a dix secondes
  // plutot que de le perdre en silence.
  let essais = 0;
  const minuterie = window.setInterval(() => {
    if (envoyer() || ++essais > 20) window.clearInterval(minuterie);
  }, 500);
}
