// Fait tourner agenda/Code.gs dans Node, avec un faux agenda Google et un
// faux Stripe. Le script ne se teste pas autrement : il ne vit que chez
// Google, et une erreur de prix ne se verrait que sur un vrai paiement.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { beforeEach, describe, expect, it } from "vitest";
import { OPTIONS, PRESTATIONS, composerPanier } from "../app/reserver/catalogue";

const SOURCE = readFileSync(join(__dirname, "Code.gs"), "utf8");
const CATALOGUE = JSON.stringify({ prestations: PRESTATIONS, options: OPTIONS });

type Evt = {
  id: string;
  titre: string;
  debut: Date;
  fin: Date;
  description: string;
  tags: Record<string, string>;
  cree: Date;
  supprime: boolean;
};

function formatDate(d: Date, _fuseau: string, motif: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value])
  );
  if (motif === "yyyy-MM-dd") return `${p.year}-${p.month}-${p.day}`;
  return `${p.day}/${p.month}/${p.year} à ${p.hour}h${p.minute}`;
}

function monter() {
  const evenements: Evt[] = [];
  const mails: { to: string; subject: string }[] = [];
  const appelsStripe: { methode: string; chemin: string; champs?: Record<string, string> }[] = [];
  const sessions = new Map<string, Record<string, unknown>>();
  let stripeEnPanne = false;
  let n = 0;

  const versEvenement = (e: Evt) => ({
    getId: () => e.id,
    getTitle: () => e.titre,
    setTitle: (t: string) => (e.titre = t),
    getDescription: () => e.description,
    setDescription: (t: string) => (e.description = t),
    getStartTime: () => e.debut,
    getEndTime: () => e.fin,
    getTag: (k: string) => e.tags[k] ?? null,
    setTag: (k: string, v: string) => (e.tags[k] = v),
    getDateCreated: () => e.cree,
    getMyStatus: () => "OWNER",
    deleteEvent: () => (e.supprime = true),
  });

  const agenda = {
    getId: () => "manon@exemple.fr",
    getEvents: (debut: Date, fin: Date) =>
      evenements
        .filter((e) => !e.supprime && e.debut < fin && debut < e.fin)
        .map(versEvenement),
    getEventById: (id: string) => {
      const e = evenements.find((x) => x.id === id && !x.supprime);
      return e ? versEvenement(e) : null;
    },
    createEvent: (titre: string, debut: Date, fin: Date, o: { description: string }) => {
      const e: Evt = {
        id: `evt${++n}`,
        titre,
        debut,
        fin,
        description: o.description,
        tags: {},
        cree: new Date(),
        supprime: false,
      };
      evenements.push(e);
      return versEvenement(e);
    },
  };

  const reponse = (code: number, corps: unknown) => ({
    getResponseCode: () => code,
    getContentText: () => JSON.stringify(corps),
  });

  const contexte: Record<string, unknown> = {
    console,
    CalendarApp: {
      getDefaultCalendar: () => agenda,
      getCalendarById: () => agenda,
      GuestStatus: { NO: "NO" },
    },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (t: string) => ({ setMimeType: () => ({ texte: t }) }),
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    CacheService: { getScriptCache: () => ({ get: () => null, put: () => {} }) },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => "sk_test_faux" }),
    },
    Utilities: { formatDate },
    MailApp: { sendEmail: (m: { to: string; subject: string }) => mails.push(m) },
    UrlFetchApp: {
      fetch: (url: string, o?: { method: string; payload?: Record<string, string> }) => {
        if (url.endsWith("/reserver/catalogue.json")) {
          return { getContentText: () => CATALOGUE };
        }
        const chemin = url.replace("https://api.stripe.com/v1", "");
        appelsStripe.push({ methode: o?.method ?? "get", chemin, champs: o?.payload });
        if (stripeEnPanne) return reponse(500, { error: { message: "panne" } });
        if (chemin === "/checkout/sessions" && o?.method === "post") {
          const id = `cs_test_${++n}`;
          const p = o.payload!;
          const s = {
            id,
            url: `https://checkout.stripe.com/c/pay/${id}`,
            status: "open",
            payment_status: "unpaid",
            amount_total: Number(p["line_items[0][price_data][unit_amount]"]),
            metadata: {
              evenement: p["metadata[evenement]"],
              prestation: p["metadata[prestation]"],
              debut: p["metadata[debut]"],
              prenom: p["metadata[prenom]"],
            },
          };
          sessions.set(id, s);
          return reponse(200, s);
        }
        const expire = chemin.match(/^\/checkout\/sessions\/(.+)\/expire$/);
        if (expire) {
          sessions.get(expire[1])!.status = "expired";
          return reponse(200, sessions.get(expire[1]));
        }
        const lu = chemin.match(/^\/checkout\/sessions\/(.+)$/);
        if (lu) return reponse(200, sessions.get(lu[1]));
        return reponse(404, { error: { message: "inconnu" } });
      },
    },
  };
  vm.createContext(contexte);
  vm.runInContext(SOURCE, contexte);

  const appeler = (nom: string, ...args: unknown[]) => {
    const r = (contexte[nom] as (...a: unknown[]) => { texte?: string })(...args);
    return r && r.texte ? JSON.parse(r.texte) : r;
  };

  return {
    evenements,
    mails,
    appelsStripe,
    sessions,
    panne: () => (stripeEnPanne = true),
    panier: (id: string, opts: string[], date: string | null) =>
      appeler("panier_", JSON.parse(CATALOGUE), id, opts, date),
    reserver: (corps: Record<string, unknown>) =>
      appeler("doPost", { postData: { contents: JSON.stringify(corps) } }),
    get: (parametres: Record<string, string>) => appeler("doGet", { parameter: parametres }),
    menage: () => appeler("menage"),
  };
}

// Un lundi suffisamment lointain pour etre toujours dans le futur, et dans
// l'horizon de reservation.
function lundiProchain(heure: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7) + 7);
  d.setUTCHours(heure, 0, 0, 0);
  return d.toISOString();
}

const CLIENTE = {
  prenom: "Léa",
  nom: "Test",
  telephone: "0600000000",
  email: "lea@exemple.fr",
};

describe("le prix du script est celui du site", () => {
  it("panier_ rend exactement composerPanier, pour toute prestation et toute combinaison d'options", () => {
    const s = monter();
    const ids = OPTIONS.map((o) => o.id);
    const combinaisons = Array.from({ length: 1 << ids.length }, (_, m) =>
      ids.filter((_, i) => m & (1 << i))
    );
    for (const p of PRESTATIONS) {
      for (const opts of combinaisons) {
        for (const date of ["2026-11-30", "2026-12-01", null]) {
          const attendu = composerPanier(p.id, opts, date)!;
          const obtenu = s.panier(p.id, opts, date);
          expect(obtenu.totalCents, `${p.id} ${opts} ${date}`).toBe(attendu.totalCents);
          expect(obtenu.dureeMin).toBe(attendu.dureeMin);
          expect(obtenu.options.map((o: { id: string }) => o.id)).toEqual(
            attendu.options.map((o) => o.id)
          );
        }
      }
    }
  });
});

describe("reserver", () => {
  let s: ReturnType<typeof monter>;
  beforeEach(() => {
    s = monter();
  });

  it("encaisse le prix du catalogue, jamais celui envoye par le navigateur", () => {
    const r = s.reserver({
      ...CLIENTE,
      prestationId: "semi-permanent",
      optionIds: ["french", "inventee"],
      debut: lundiProchain(9),
      // Champs qu'un navigateur trafique pourrait envoyer : ignores.
      total: "1 €",
      fin: lundiProchain(9.25),
    });
    expect(r.ok).toBe(true);
    const creation = s.appelsStripe.find((a) => a.chemin === "/checkout/sessions")!;
    expect(creation.champs!["line_items[0][price_data][unit_amount]"]).toBe("8000");
    // Et la duree bloquee dans l'agenda est celle du catalogue : 1h30 + 20 min.
    const e = s.evenements[0];
    expect((e.fin.getTime() - e.debut.getTime()) / 60000).toBe(110);
    expect(e.titre.startsWith("En attente de paiement")).toBe(true);
  });

  it("refuse un creneau deja occupe, sans ouvrir de paiement", () => {
    const corps = { ...CLIENTE, prestationId: "semi-permanent", debut: lundiProchain(9) };
    expect(s.reserver(corps).ok).toBe(true);
    const appels = s.appelsStripe.length;
    expect(s.reserver(corps)).toEqual({ ok: false, raison: "pris" });
    expect(s.appelsStripe.length).toBe(appels);
  });

  it("libere le creneau si Stripe ne repond pas", () => {
    s.panne();
    const r = s.reserver({ ...CLIENTE, prestationId: "semi-permanent", debut: lundiProchain(9) });
    expect(r).toEqual({ ok: false, erreur: "paiement indisponible" });
    expect(s.evenements.every((e) => e.supprime)).toBe(true);
  });

  it("refuse une prestation inconnue", () => {
    const r = s.reserver({ ...CLIENTE, prestationId: "gratuite", debut: lundiProchain(9) });
    expect(r.erreur).toBe("prestation inconnue");
  });
});

describe("apres le paiement", () => {
  let s: ReturnType<typeof monter>;
  let session: string;
  beforeEach(() => {
    s = monter();
    s.reserver({ ...CLIENTE, prestationId: "gel-naturel", debut: lundiProchain(9) });
    session = [...s.sessions.keys()][0];
  });

  it("ne confirme rien tant que Stripe ne dit pas paye", () => {
    expect(s.get({ action: "confirmer", session }).statut).toBe("non_paye");
    expect(s.mails).toHaveLength(0);
  });

  it("confirme un paiement une seule fois, meme si la page et le menage y arrivent tous les deux", () => {
    s.sessions.get(session)!.payment_status = "paid";
    const r = s.get({ action: "confirmer", session });
    expect(r).toMatchObject({ ok: true, statut: "paye", montantCents: 9500 });
    s.get({ action: "confirmer", session });
    s.menage();
    expect(s.mails).toHaveLength(1);
    // Sans Session : le mail part a l'adresse de l'agenda principal.
    expect(s.mails[0].to).toBe("manon@exemple.fr");
    const e = s.evenements[0];
    expect(e.titre.startsWith("À recopier sur Planity")).toBe(true);
    expect(e.description).toContain("95 € payé en ligne");
  });

  it("annuler libere le creneau et ferme la session", () => {
    expect(s.get({ action: "annuler", session }).statut).toBe("annule");
    expect(s.evenements[0].supprime).toBe(true);
    expect(s.sessions.get(session)!.status).toBe("expired");
  });

  it("annuler ne touche jamais un rendez-vous paye", () => {
    s.sessions.get(session)!.payment_status = "paid";
    expect(s.get({ action: "annuler", session }).statut).toBe("paye");
    expect(s.evenements[0].supprime).toBe(false);
  });

  it("le menage libere un paiement expire et garde un paiement en cours", () => {
    s.menage();
    expect(s.evenements[0].supprime).toBe(false);
    s.sessions.get(session)!.status = "expired";
    s.menage();
    expect(s.evenements[0].supprime).toBe(true);
  });

  it("le menage confirme une cliente qui a paye puis ferme l'onglet", () => {
    s.sessions.get(session)!.payment_status = "paid";
    s.menage();
    expect(s.mails).toHaveLength(1);
    expect(s.evenements[0].tags.statut).toBe("paye");
  });

  it("refuse un identifiant de session fantaisiste", () => {
    expect(s.get({ action: "confirmer", session: "../../charges" }).erreur).toBe(
      "session invalide"
    );
  });
});

describe("occupations", () => {
  it("ne rend que les heures, jamais le titre ni la description", () => {
    const s = monter();
    s.reserver({ ...CLIENTE, prestationId: "semi-permanent", debut: lundiProchain(9) });
    const debut = new Date(Date.now()).toISOString();
    const fin = new Date(Date.now() + 30 * 86400000).toISOString();
    const r = s.get({ action: "occupations", debut, fin });
    expect(r.occupations).toHaveLength(1);
    expect(Object.keys(r.occupations[0]).sort()).toEqual(["debut", "fin"]);
  });
});
