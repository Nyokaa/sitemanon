declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = "G-N032H9NZ3E";
export const META_PIXEL_ID = "1635263904032770";

export const CONSENT_KEY = "mj-cookie-consent";
export type Consent = "accepted" | "refused";

export function getStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "refused" ? v : null;
}

export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params ?? {});
}

/**
 * Evenement standard du pixel Meta. Sans consentement le pixel n'est pas
 * charge, window.fbq n'existe pas, et l'appel ne fait rien.
 */
export function trackPixel(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  window.fbq?.("track", name, params ?? {});
}
