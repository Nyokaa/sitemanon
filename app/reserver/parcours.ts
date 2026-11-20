// Regles du parcours de reservation. Module PUR, teste sans navigateur.

import type { Intervalle } from "./creneaux";
import type { Prestation } from "./catalogue";

/**
 * Le champ unique « Prenom et nom » : le premier mot est le prenom, le reste
 * le nom (qui peut manquer). Les espaces superflus sont retires.
 */
export function separerNom(saisie: string): { prenom: string; nom: string } {
  const mots = saisie.trim().split(/\s+/).filter(Boolean);
  return { prenom: mots[0] ?? "", nom: mots.slice(1).join(" ") };
}

/** Le tout premier creneau libre, jours dans l'ordre, ou null. */
export function premierCreneau(
  jours: string[],
  creneauxParJour: Map<string, Intervalle[]>
): { date: string; creneau: Intervalle } | null {
  for (const d of jours) {
    const c = creneauxParJour.get(d);
    if (c && c.length > 0) return { date: d, creneau: c[0] };
  }
  return null;
}

/**
 * Les prestations phares d'abord, dans l'ordre demande, puis les autres. Un
 * identifiant phare inconnu est ignore, une prestation n'apparait qu'une fois.
 */
export function separerPhares(
  prestations: Prestation[],
  phares: string[]
): { phares: Prestation[]; autres: Prestation[] } {
  const enTete = phares
    .map((id) => prestations.find((p) => p.id === id))
    .filter((p): p is Prestation => Boolean(p));
  const ids = new Set(enTete.map((p) => p.id));
  return { phares: enTete, autres: prestations.filter((p) => !ids.has(p.id)) };
}

// ------------------------------------------------------------ relances
//
// Memes regles que telephoneValide_ et emailValide_ dans agenda/Code.gs : le
// site n'envoie une saisie partielle que si le script la gardera.

export function telephoneValide(t: string): boolean {
  return /^[+\d\s.\-()]+$/.test(t) && t.replace(/\D/g, "").length >= 9;
}

export function emailValide(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/** Vrai si la saisie merite d'etre gardee : un telephone ou un email valide. */
export function relanceUtile(telephone: string, email: string): boolean {
  return telephoneValide(telephone.trim()) || emailValide(email.trim());
}
