// Calcul des creneaux libres. Module PUR : l'horloge et l'agenda arrivent en
// parametres, ce qui permet de tout tester sans navigateur ni Google.
//
// Tout se raisonne en heure de Paris, quel que soit le fuseau du visiteur :
// un 10h affiche doit etre le 10h du studio, y compris au passage de l'heure.

export const FUSEAU = "Europe/Paris";

/** Ouverture par jour de la semaine (0 = dimanche), en minutes depuis minuit. */
export const HORAIRES: Record<number, [number, number] | null> = {
  0: null,
  1: [10 * 60, 19 * 60],
  2: [10 * 60, 19 * 60],
  3: [10 * 60, 19 * 60],
  4: [10 * 60, 19 * 60],
  5: [10 * 60, 15 * 60],
  6: [10 * 60, 15 * 60],
};

/** Ecart entre deux debuts de creneau proposes. */
export const PAS_MIN = 15;

/**
 * Delai sous lequel un creneau n'est plus propose. Ce n'est pas un delai de
 * reservation : il evite seulement de vendre un rendez-vous qui commence
 * pendant que la cliente remplit le formulaire.
 */
export const MARGE_MIN = 60;

/** Jusqu'ou l'on peut reserver. */
export const HORIZON_JOURS = 60;

export type Intervalle = { debut: Date; fin: Date };

/** Decalage de Paris par rapport a UTC, en minutes, a un instant donne. */
function decalageParis(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSEAU,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);
  const v = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const commeUtc = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"));
  return Math.round((commeUtc - instant.getTime()) / 60000);
}

/** L'instant correspondant a « date, minutes depuis minuit » a Paris. */
export function instantParis(date: string, minutes: number): Date {
  const [a, m, j] = date.split("-").map(Number);
  const naif = Date.UTC(a, m - 1, j, 0, minutes);
  let instant = new Date(naif - decalageParis(new Date(naif)) * 60000);
  // Seconde passe : le decalage peut changer entre l'estimation et le resultat.
  instant = new Date(naif - decalageParis(instant) * 60000);
  return instant;
}

/** La date (AAAA-MM-JJ) a Paris d'un instant. */
export function dateParis(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Jour de la semaine (0 = dimanche) d'une date AAAA-MM-JJ. */
export function jourSemaine(date: string): number {
  const [a, m, j] = date.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, j)).getUTCDay();
}

/** Ajoute des jours a une date AAAA-MM-JJ. */
export function ajouterJours(date: string, n: number): string {
  const [a, m, j] = date.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10);
}

/** Les dates ouvertes, de aujourd'hui (a Paris) jusqu'a l'horizon. */
export function joursOuverts(maintenant: Date, horizon = HORIZON_JOURS): string[] {
  const depart = dateParis(maintenant);
  const jours: string[] = [];
  for (let i = 0; i <= horizon; i++) {
    const d = ajouterJours(depart, i);
    if (HORAIRES[jourSemaine(d)]) jours.push(d);
  }
  return jours;
}

function chevauche(a: Intervalle, b: Intervalle): boolean {
  return a.debut < b.fin && b.debut < a.fin;
}

/**
 * Les creneaux d'une journee pour une duree donnee. Un creneau est propose
 * s'il tient entier dans les horaires, ne chevauche aucune occupation de
 * l'agenda et commence apres maintenant + MARGE_MIN.
 */
export function creneauxDuJour(
  date: string,
  dureeMin: number,
  occupations: Intervalle[],
  maintenant: Date
): Intervalle[] {
  const horaires = HORAIRES[jourSemaine(date)];
  if (!horaires || dureeMin <= 0) return [];
  const [ouverture, fermeture] = horaires;
  const auPlusTot = maintenant.getTime() + MARGE_MIN * 60000;
  const creneaux: Intervalle[] = [];
  for (let m = ouverture; m + dureeMin <= fermeture; m += PAS_MIN) {
    const c = { debut: instantParis(date, m), fin: instantParis(date, m + dureeMin) };
    if (c.debut.getTime() < auPlusTot) continue;
    if (occupations.some((o) => chevauche(c, o))) continue;
    creneaux.push(c);
  }
  return creneaux;
}

/** « 14:30 » a Paris. */
export function heureParis(instant: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU,
    hour: "2-digit",
    minute: "2-digit",
  }).format(instant);
}
