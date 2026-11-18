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
    expect(appels).toEqual([["event", "booking_click", { source: "footer" }]]);
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

  it("n'envoie jamais rien si gtag ne se charge pas (cookies refuses)", async () => {
    const { trackEvent } = await import("./analytics");
    trackEvent("whatsapp_click");
    expect(fenetre.gtag).toBeUndefined();
  });
});
