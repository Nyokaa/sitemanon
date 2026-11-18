// Les balises (GA4, Google Ads, pixel Meta) ne se chargent que sur le vrai
// domaine. Sur localhost ou ailleurs, rien : des tests locaux ont deja envoye
// de faux achats dans GA4.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { DOMAINES_AUTORISES, domaineAutorise } from "./analytics";

const CONSENTEMENT = readFileSync(join(__dirname, "../../public/consentement.js"), "utf8");

describe("domaineAutorise (site Next)", () => {
  it("autorise le domaine et sa variante www", () => {
    expect(domaineAutorise("manonjeanpert.com")).toBe(true);
    expect(domaineAutorise("www.manonjeanpert.com")).toBe(true);
  });

  it("refuse localhost, un apercu et les domaines qui ressemblent", () => {
    for (const h of [
      "localhost",
      "127.0.0.1",
      "nyokaa.github.io",
      "manonjeanpert.com.exemple.fr",
      "faux-manonjeanpert.com",
      "",
    ]) {
      expect(domaineAutorise(h), h).toBe(false);
    }
  });
});

/** Execute public/consentement.js sur un domaine, cookies deja acceptes. */
function pagesStatiques(hostname: string) {
  const scriptsAjoutes: string[] = [];
  const fenetre: Record<string, unknown> = {
    location: { hostname },
    localStorage: { getItem: () => "accepted", setItem: () => {} },
  };
  const document = {
    body: {},
    createElement: () => ({}),
    getElementsByTagName: () => [
      { parentNode: { insertBefore: (s: { src: string }) => scriptsAjoutes.push(s.src) } },
    ],
    addEventListener: () => {},
  };
  fenetre.window = fenetre;
  fenetre.document = document;
  vm.createContext(fenetre);
  vm.runInContext(CONSENTEMENT, fenetre);
  return { fenetre, scriptsAjoutes };
}

describe("consentement.js (pages formation)", () => {
  it("charge le pixel sur manonjeanpert.com et www.manonjeanpert.com", () => {
    for (const h of ["manonjeanpert.com", "www.manonjeanpert.com"]) {
      const { fenetre, scriptsAjoutes } = pagesStatiques(h);
      expect(scriptsAjoutes, h).toEqual(["https://connect.facebook.net/en_US/fbevents.js"]);
      expect(typeof fenetre.fbq, h).toBe("function");
    }
  });

  it("ne charge rien sur localhost ni sur un autre domaine, meme cookies acceptes", () => {
    for (const h of ["localhost", "nyokaa.github.io", "manonjeanpert.com.exemple.fr"]) {
      const { fenetre, scriptsAjoutes } = pagesStatiques(h);
      expect(scriptsAjoutes, h).toEqual([]);
      expect(fenetre.fbq, h).toBeUndefined();
      // Le Lead en attente ne part jamais non plus.
      let lead = false;
      (fenetre.mjPixel as (fn: () => void) => void)(() => (lead = true));
      expect(lead, h).toBe(false);
    }
  });

  it("porte la meme liste de domaines que le site", () => {
    const liste = CONSENTEMENT.match(/var DOMAINES = (\[[^\]]*\])/)![1].replace(/'/g, '"');
    expect(JSON.parse(liste)).toEqual(DOMAINES_AUTORISES);
  });
});
