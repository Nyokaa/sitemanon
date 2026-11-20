import { describe, expect, it } from "vitest";
import { PRESTATIONS, PRESTATIONS_PHARES, acompteCents, formaterPrix } from "./catalogue";
import { instantParis } from "./creneaux";
import { premierCreneau, separerNom, separerPhares } from "./parcours";

describe("separerNom", () => {
  it("prend le premier mot comme prenom et garde le reste comme nom", () => {
    expect(separerNom("Léa Martin")).toEqual({ prenom: "Léa", nom: "Martin" });
    expect(separerNom("  Marie   de la   Tour ")).toEqual({ prenom: "Marie", nom: "de la Tour" });
  });
  it("accepte un prenom seul", () => {
    expect(separerNom("Léa")).toEqual({ prenom: "Léa", nom: "" });
    expect(separerNom("   ")).toEqual({ prenom: "", nom: "" });
  });
});

describe("premierCreneau", () => {
  const c = (d: string, h: number) => ({ debut: instantParis(d, h * 60), fin: instantParis(d, h * 60 + 30) });
  it("saute les jours complets et rend le premier creneau du premier jour libre", () => {
    const parJour = new Map([
      ["2026-11-21", []],
      ["2026-11-23", [c("2026-11-23", 13), c("2026-11-23", 14)]],
    ]);
    const r = premierCreneau(["2026-11-21", "2026-11-23"], parJour)!;
    expect(r.date).toBe("2026-11-23");
    expect(r.creneau.debut.toISOString()).toBe(instantParis("2026-11-23", 13 * 60).toISOString());
  });
  it("rend null quand tout est complet", () => {
    expect(premierCreneau(["2026-11-21"], new Map([["2026-11-21", []]]))).toBeNull();
  });
});

describe("prestations phares", () => {
  it("met les 5 phares d'abord, dans l'ordre demande, sans en perdre ni en doubler", () => {
    const { phares, autres } = separerPhares(PRESTATIONS, PRESTATIONS_PHARES);
    expect(phares.map((p) => p.id)).toEqual([
      "semi-permanent",
      "gel-naturel",
      "remplissage",
      "gel-rallongement",
      "diagnostic",
    ]);
    expect(phares.length + autres.length).toBe(PRESTATIONS.length);
    expect(autres.some((p) => PRESTATIONS_PHARES.includes(p.id))).toBe(false);
  });
});

describe("acompteCents", () => {
  it("vaut 50 % du prix, arrondi au centime", () => {
    expect(acompteCents(7000)).toBe(3500);
    expect(acompteCents(12500)).toBe(6250);
    expect(formaterPrix(acompteCents(9500))).toBe("47,50 €");
  });
});
