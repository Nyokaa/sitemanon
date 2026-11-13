import { describe, expect, it } from "vitest";
import {
  composerPanier,
  formaterDuree,
  formaterPrix,
  optionsDisponibles,
  PRESTATIONS,
  trouverPrestation,
  prestationsVisibles,
  OPTIONS,
} from "./catalogue";
import {
  creneauxDuJour,
  dateParis,
  heureParis,
  instantParis,
  joursOuverts,
} from "./creneaux";

describe("instantParis", () => {
  it("rend 10h a Paris en hiver (UTC+1)", () => {
    expect(instantParis("2026-11-16", 600).toISOString()).toBe(
      "2026-11-16T09:00:00.000Z"
    );
  });

  it("rend 10h a Paris en ete (UTC+2)", () => {
    expect(instantParis("2026-07-15", 600).toISOString()).toBe(
      "2026-07-15T08:00:00.000Z"
    );
  });

  it("tient le lendemain du passage a l'heure d'hiver", () => {
    // Le 25 octobre 2026 a 3h, Paris repasse a UTC+1.
    expect(instantParis("2026-10-26", 600).toISOString()).toBe(
      "2026-10-26T09:00:00.000Z"
    );
  });

  it("dateParis decoupe a minuit de Paris, pas a minuit UTC", () => {
    // 23h30 UTC le 16 novembre = 00h30 le 17 a Paris.
    expect(dateParis(new Date("2026-11-16T23:30:00Z"))).toBe("2026-11-17");
  });
});

describe("joursOuverts", () => {
  it("saute le dimanche", () => {
    // Samedi 14 novembre 2026.
    const jours = joursOuverts(new Date("2026-11-14T08:00:00Z"), 2);
    expect(jours).toEqual(["2026-11-14", "2026-11-16"]);
  });
});

describe("creneauxDuJour", () => {
  const lundi = "2026-11-16";
  const avant = new Date("2026-11-01T00:00:00Z");

  it("propose le premier creneau a l'ouverture et le dernier qui tient avant la fermeture", () => {
    const c = creneauxDuJour(lundi, 90, [], avant);
    expect(heureParis(c[0].debut)).toBe("10:00");
    expect(heureParis(c[c.length - 1].debut)).toBe("17:30");
    expect(heureParis(c[c.length - 1].fin)).toBe("19:00");
  });

  it("ferme a 15h le vendredi et le samedi", () => {
    const c = creneauxDuJour("2026-11-20", 90, [], avant);
    expect(heureParis(c[c.length - 1].fin)).toBe("15:00");
  });

  it("ne propose rien le dimanche", () => {
    expect(creneauxDuJour("2026-11-15", 30, [], avant)).toEqual([]);
  });

  it("ne propose aucun creneau qui chevauche un rendez-vous de l'agenda", () => {
    const occupe = {
      debut: instantParis(lundi, 11 * 60),
      fin: instantParis(lundi, 12 * 60),
    };
    const c = creneauxDuJour(lundi, 60, [occupe], avant);
    const heures = c.map((x) => heureParis(x.debut));
    // 10h00-11h00 finit pile quand l'autre commence : il reste propose.
    expect(heures).toContain("10:00");
    expect(heures).not.toContain("10:15");
    expect(heures).not.toContain("11:30");
    // 12h00 commence pile a la fin de l'autre.
    expect(heures).toContain("12:00");
  });

  it("ne propose pas un creneau qui commence dans moins d'une heure", () => {
    const maintenant = instantParis(lundi, 14 * 60);
    const c = creneauxDuJour(lundi, 30, [], maintenant);
    expect(heureParis(c[0].debut)).toBe("15:00");
  });

  it("ne propose rien quand la prestation est plus longue que la journee", () => {
    expect(creneauxDuJour("2026-11-21", 6 * 60, [], avant)).toEqual([]);
  });
});

describe("catalogue", () => {
  it("chaque prestation a un identifiant unique, une duree et un prix", () => {
    const ids = PRESTATIONS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PRESTATIONS) {
      expect(p.dureeMin).toBeGreaterThan(0);
      expect(p.prixCents).toBeGreaterThan(0);
    }
  });

  it("chaque option citee par une prestation existe", () => {
    const connues = new Set(OPTIONS.map((o) => o.id));
    for (const p of PRESTATIONS) {
      for (const o of p.options) expect(connues.has(o)).toBe(true);
    }
  });

  it("additionne duree et prix des options", () => {
    const panier = composerPanier("semi-permanent", ["french", "manucure-profonde"], "2026-12-01");
    expect(panier?.dureeMin).toBe(90 + 20 + 15);
    expect(panier?.totalCents).toBe(7000 + 1000 + 1000);
  });

  it("ecarte une option qui n'est pas proposee pour la prestation", () => {
    // Une epilation ne prend pas de French : le prix ne doit pas le compter.
    const panier = composerPanier("epilation-sourcils", ["french"], null);
    expect(panier?.options).toEqual([]);
    expect(panier?.totalCents).toBe(1500);
  });

  it("l'offre de novembre ne vaut plus pour un rendez-vous en decembre", () => {
    const semi = trouverPrestation("semi-permanent")!;
    const ids = (d: string) => optionsDisponibles(semi, d).map((o) => o.id);
    expect(ids("2026-11-30")).toContain("cocooning");
    expect(ids("2026-12-01")).not.toContain("cocooning");
  });

  it("les soins japonais ne proposent pas le Cocooning, deja compris dedans", () => {
    for (const id of ["rituel-japonais", "manucure-japonaise"]) {
      const p = trouverPrestation(id)!;
      expect(optionsDisponibles(p, "2026-11-20").map((o) => o.id)).not.toContain("cocooning");
      expect(composerPanier(id, ["cocooning"], "2026-11-20")!.totalCents).toBe(p.prixCents);
    }
  });

  it("le nail art reserve 15 minutes sans rien facturer en ligne", () => {
    const panier = composerPanier("semi-permanent", ["nail-art"], "2026-12-01")!;
    expect(panier.dureeMin).toBe(90 + 15);
    expect(panier.totalCents).toBe(7000);
    expect(panier.options.map((o) => o.id)).toEqual(["nail-art"]);
  });

  it("aucune prestation cachee n'est en ligne : toutes sont visibles", () => {
    // Le mecanisme reste (champ cachee) pour un futur paiement d'essai,
    // mais rien ne doit dormir cache dans le catalogue publie.
    expect(PRESTATIONS.filter((p) => p.cachee)).toEqual([]);
    expect(prestationsVisibles(null)).toHaveLength(PRESTATIONS.length);
  });

  it("refuse une prestation inconnue", () => {
    expect(composerPanier("inconnue", [], null)).toBeNull();
  });

  it("formate prix et durees comme sur Planity", () => {
    expect(formaterPrix(7000)).toBe("70 €");
    expect(formaterPrix(1250)).toBe("12,50 €");
    expect(formaterDuree(115)).toBe("1 h 55");
    expect(formaterDuree(60)).toBe("1 h");
    expect(formaterDuree(20)).toBe("20 min");
  });
});
