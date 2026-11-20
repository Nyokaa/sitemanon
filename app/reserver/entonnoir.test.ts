import { describe, expect, it } from "vitest";
import { ETAPES, delaiJours, origineArrivee } from "./entonnoir";

describe("origineArrivee", () => {
  const hote = "manonjeanpert.com";
  it("reconnait une pub Meta ou Google, meme si la page vient du site", () => {
    expect(origineArrivee("?fbclid=abc", "https://manonjeanpert.com/", hote)).toBe("meta");
    expect(origineArrivee("?gclid=abc", "", hote)).toBe("google_ads");
    expect(origineArrivee("?wbraid=abc", "", hote)).toBe("google_ads");
  });
  it("distingue le hero du site, un autre site et l'absence de referent", () => {
    expect(origineArrivee("", "https://manonjeanpert.com/", hote)).toBe("site");
    expect(origineArrivee("", "https://www.instagram.com/", hote)).toBe("externe");
    expect(origineArrivee("", "", hote)).toBe("direct");
    expect(origineArrivee("", "pas une url", hote)).toBe("direct");
  });
});

describe("delaiJours", () => {
  it("compte les jours calendaires, y compris en changeant de mois", () => {
    expect(delaiJours("2026-11-20", "2026-11-20")).toBe(0);
    expect(delaiJours("2026-11-23", "2026-11-20")).toBe(3);
    expect(delaiJours("2026-12-01", "2026-11-30")).toBe(1);
  });
});

describe("ETAPES", () => {
  it("numerote les etapes dans l'ordre du parcours, sans trou", () => {
    expect(Object.values(ETAPES)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
