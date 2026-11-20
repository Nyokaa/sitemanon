// Entonnoir de la page /reserver/ : les evenements GA4 de chaque etape et
// leurs regles. Module PUR, teste sans navigateur.
//
// L'ordre des etapes, du premier au dernier :
//   1 reservation_ouverture          arrivee sur la page
//   2 reservation_prestation         prestation choisie (clic ou adresse)
//   3 reservation_vers_creneaux      clic sur « Choisir un creneau »
//   4 reservation_creneaux_affiches  creneaux visibles (ou reservation_aucun_creneau,
//                                    reservation_agenda_erreur)
//   5 reservation_creneau            heure choisie
//   6 reservation_coordonnees        clic sur « Continuer »
//   7 reservation_paiement_clic      clic sur « Payer et reserver »
//   8 begin_checkout                 depart vers Stripe
//   9 booking_confirmed              paiement confirme (page merci)
// A cote : reservation_erreur et reservation_paiement_annule.
//
// Aucun parametre ne porte de donnee personnelle : ni nom, ni telephone, ni
// email. Seulement la prestation, des montants, des delais et des heures.

export const ETAPES = {
  ouverture: 1,
  prestation: 2,
  versCreneaux: 3,
  creneauxAffiches: 4,
  creneau: 5,
  coordonnees: 6,
  paiementClic: 7,
} as const;

/** Cle de session posee par un bouton interne juste avant /reserver/. */
export const CLE_ORIGINE_INTERNE = "mj-resa-origine";

/**
 * Note la source d'un bouton interne (hero, bouton collant). Le site change
 * de page sans recharger : document.referrer reste celui d'avant le site, et
 * la visiteuse venue du hero serait notee « direct ».
 */
export function noterOrigineInterne(source: string): void {
  try {
    window.sessionStorage.setItem(CLE_ORIGINE_INTERNE, source);
  } catch {}
}

/**
 * D'ou vient la visiteuse : une pub Meta (fbclid), une pub Google (gclid),
 * une autre page du site (hero, bouton collant), un autre site, ou rien.
 */
export function origineArrivee(
  recherche: string,
  referent: string,
  hote: string
): "meta" | "google_ads" | "site" | "externe" | "direct" {
  const p = new URLSearchParams(recherche);
  if (p.has("fbclid")) return "meta";
  if (p.has("gclid") || p.has("gbraid") || p.has("wbraid")) return "google_ads";
  if (!referent) return "direct";
  try {
    return new URL(referent).hostname === hote ? "site" : "externe";
  } catch {
    return "direct";
  }
}

/** Nombre de jours entre aujourd'hui et le rendez-vous (dates AAAA-MM-JJ). */
export function delaiJours(dateRdv: string, aujourdhui: string): number {
  const jour = (d: string) => {
    const [a, m, j] = d.split("-").map(Number);
    return Date.UTC(a, m - 1, j) / 86400000;
  };
  return Math.round(jour(dateRdv) - jour(aujourdhui));
}
