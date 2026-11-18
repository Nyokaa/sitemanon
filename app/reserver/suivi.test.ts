import { describe, expect, it } from "vitest";
import { estPaiementDeTest } from "./suivi";

describe("estPaiementDeTest", () => {
  it("ecarte une session Stripe en mode test", () => {
    expect(estPaiementDeTest("cs_test_a0bW5vveIAiP2vavvLaE7xCjTfAFoQ")).toBe(true);
  });

  it("garde une session Stripe en mode reel", () => {
    expect(estPaiementDeTest("cs_live_a1B2c3D4e5F6g7H8")).toBe(false);
  });

  it("ne confond pas un identifiant qui contient cs_test_ ailleurs qu'au debut", () => {
    expect(estPaiementDeTest("cs_live_cs_test_")).toBe(false);
  });
});
