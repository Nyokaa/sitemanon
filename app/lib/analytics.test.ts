// La file d'attente de trackEvent : un evenement emis avant que gtag soit
// charge (cookies acceptes apres coup, clic juste apres « Accepter ») doit
// partir des que gtag est pret, et jamais si gtag ne se charge pas.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Ecouteur = () => void;

function fausseFenetre() {
  const ecouteurs = new Map<string, Ecouteur[]>();
  return {
    gtag: undefined as undefined | ((...a: unknown[]) => void),
    addEventListener: (nom: string, fn: Ecouteur) =>
      ecouteurs.set(nom, [...(ecouteurs.get(nom) ?? []), fn]),
    emettre: (nom: string) => (ecouteurs.get(nom) ?? []).forEach((fn) => fn()),
  };
}

let fenetre: ReturnType<typeof fausseFenetre>;

beforeEach(() => {
  vi.resetModules();
  fenetre = fausseFenetre();
  vi.stubGlobal("window", fenetre);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("trackEvent", () => {
  it("envoie tout de suite quand gtag est deja charge", async () => {
    const { trackEvent } = await import("./analytics");
    const appels: unknown[][] = [];
    fenetre.gtag = (...a) => appels.push(a);
    trackEvent("booking_click", { source: "footer" });
    expect(appels).toEqual([
      ["event", "booking_click", { source: "footer", send_to: "G-N032H9NZ3E" }],
    ]);
  });

  it("met en attente avant gtag, puis envoie dans l'ordre quand gtag est pret", async () => {
    const { trackEvent, EVENEMENT_GTAG_PRET } = await import("./analytics");
    trackEvent("booking_confirmed", { value: 70, transaction_id: "cs_1" });
    trackEvent("purchase", { value: 70, transaction_id: "cs_1" });

    const appels: unknown[][] = [];
    fenetre.gtag = (...a) => appels.push(a);
    fenetre.emettre(EVENEMENT_GTAG_PRET);

    expect(appels.map((a) => a[1])).toEqual(["booking_confirmed", "purchase"]);
    // Une seule fois : un second signal ne renvoie rien.
    fenetre.emettre(EVENEMENT_GTAG_PRET);
    expect(appels).toHaveLength(2);
  });

  it("n'adresse les evenements qu'a GA4, jamais a la balise Google Ads", async () => {
    const { trackEvent, GA_MEASUREMENT_ID } = await import("./analytics");
    const appels: unknown[][] = [];
    fenetre.gtag = (...a) => appels.push(a);
    trackEvent("booking_confirmed", { value: 70 });
    expect((appels[0][2] as { send_to: string }).send_to).toBe(GA_MEASUREMENT_ID);
  });

  it("n'envoie jamais rien si gtag ne se charge pas (cookies refuses)", async () => {
    const { trackEvent } = await import("./analytics");
    trackEvent("whatsapp_click");
    expect(fenetre.gtag).toBeUndefined();
  });
});

describe("evenements en vol", () => {
  function session() {
    const m = new Map<string, string>();
    return {
      getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
      setItem: (k: string, v: string) => m.set(k, v),
      removeItem: (k: string) => m.delete(k),
    };
  }

  it("garde sans envoyer, puis envoie dans l'ordre au retour, une seule fois", async () => {
    (fenetre as Record<string, unknown>).sessionStorage = session();
    const { garderEnVol, viderEnVol } = await import("./analytics");
    const appels: unknown[][] = [];
    fenetre.gtag = (...a) => appels.push(a);

    garderEnVol("reservation_paiement_clic", { value: 70 });
    garderEnVol("begin_checkout", { value: 70 });
    expect(appels).toHaveLength(0); // rien ne part avant le depart vers Stripe

    viderEnVol(); // retour sur le site
    expect(appels.map((a) => a[1])).toEqual(["reservation_paiement_clic", "begin_checkout"]);
    viderEnVol();
    expect(appels).toHaveLength(2);
  });

  it("sans GA4 charge au retour, les evenements attendent gtag comme les autres", async () => {
    (fenetre as Record<string, unknown>).sessionStorage = session();
    const { garderEnVol, viderEnVol, EVENEMENT_GTAG_PRET } = await import("./analytics");
    garderEnVol("begin_checkout", { value: 70 });
    viderEnVol();
    const appels: unknown[][] = [];
    fenetre.gtag = (...a) => appels.push(a);
    fenetre.emettre(EVENEMENT_GTAG_PRET);
    expect(appels.map((a) => a[1])).toEqual(["begin_checkout"]);
  });
});
