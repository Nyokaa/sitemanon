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

/**
 * Les seuls domaines ou GA4, Google Ads et le pixel Meta se chargent. Sur
 * localhost, un apercu ou tout autre domaine, aucune balise : des tests
 * locaux ont deja envoye de faux achats dans GA4 le 18 novembre 2026.
 * La meme liste est recopiee dans public/consentement.js, un test verifie
 * qu'elles concordent.
 */
export const DOMAINES_AUTORISES = ["manonjeanpert.com", "www.manonjeanpert.com"];

export function domaineAutorise(hostname: string): boolean {
  return DOMAINES_AUTORISES.includes(hostname);
}

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

// ------------------------------------------------------------ evenements en vol
//
// GA4 regroupe ses envois et ne les fait partir qu'au bout d'environ cinq
// secondes ; il confirme (event_callback) avant d'avoir envoye, et ne vide pas
// sa file quand la page part. Mesure le 20 novembre 2026 : un evenement emis
// juste avant le depart vers Stripe ne quitte jamais le navigateur.
//
// Ces evenements sont donc mis de cote dans la session, et envoyes au retour
// sur le site (page merci, ou /reserver apres un abandon). Ce qui reste perdu :
// une visiteuse qui ferme l'onglet sur Stripe.

const CLE_EN_VOL = "mj-ga-en-vol";

function lireEnVol(): [string, Record<string, unknown>][] {
  try {
    return JSON.parse(window.sessionStorage.getItem(CLE_EN_VOL) ?? "[]");
  } catch {
    return [];
  }
}

/** Met un evenement de cote, pour l'envoyer au prochain chargement d'une page du site. */
export function garderEnVol(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CLE_EN_VOL, JSON.stringify([...lireEnVol(), [name, params]]));
  } catch {
    trackEvent(name, params);
  }
}

/** Envoie les evenements mis de cote, une seule fois. */
export function viderEnVol(): void {
  if (typeof window === "undefined") return;
  const enVol = lireEnVol();
  try {
    window.sessionStorage.removeItem(CLE_EN_VOL);
  } catch {}
  for (const [n, p] of enVol) trackEvent(n, p);
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
