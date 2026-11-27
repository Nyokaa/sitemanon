"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SITE } from "@/app/lib/site";
import { asset } from "@/app/lib/asset";
import {
  garderEnVol,
  lireIdsGa4,
  trackEvent,
  trackPixel,
  viderEnVol,
} from "@/app/lib/analytics";
import { AGENDA_URL } from "./config";
import { CLE_ORIGINE_INTERNE, ETAPES, delaiJours, origineArrivee } from "./entonnoir";
import {
  CATEGORIES,
  PRESTATIONS_PHARES,
  Prestation,
  acompteCents,
  prestationsVisibles,
  composerPanier,
  formaterDuree,
  formaterPrix,
  optionsDisponibles,
  trouverPrestation,
} from "./catalogue";
import {
  HORIZON_JOURS,
  Intervalle,
  creneauxDuJour,
  dateParis,
  heureParis,
  joursOuverts,
} from "./creneaux";
import { premierCreneau, relanceUtile, separerNom, separerPhares } from "./parcours";

type Etape = "prestation" | "creneau" | "coordonnees";

type Agenda =
  | { etat: "chargement" }
  | { etat: "erreur" }
  | { etat: "pret"; occupations: Intervalle[] };

/**
 * Version du script de l'agenda qui encaisse un acompte. Avant elle, le
 * script encaisse le prix complet : la page garde alors l'ancien affichage,
 * pour que le montant annonce soit toujours celui reellement encaisse.
 */
const VERSION_ACOMPTE = 2;

/**
 * Version du script qui sait garder une saisie partielle. Une version plus
 * ancienne prendrait l'envoi pour une vraie reservation (creneau bloque,
 * paiement ouvert) : rien n'est envoye tant que le script n'y est pas.
 */
const VERSION_RELANCE = 3;

/** Identifiant de la demande en cours, garde le temps de la session. */
const CLE_RELANCE = "mj-relance-id";

function idRelance(): string {
  try {
    const existant = window.sessionStorage.getItem(CLE_RELANCE);
    if (existant) return existant;
  } catch {}
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  try {
    window.sessionStorage.setItem(CLE_RELANCE, id);
  } catch {}
  return id;
}

export const CONDITIONS_URL = "/conditions-reservation/";

const PHOTOS = [
  { src: "/images/reserver/paillettes.webp", alt: "Pose gel rose pailleté, amande longue" },
  { src: "/images/reserver/noir.webp", alt: "Semi-permanent noir brillant, ongles courts" },
  { src: "/images/reserver/nail-art.webp", alt: "Nail art rouge, étoiles et motif vache" },
];

const champ =
  "w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/40 focus:border-[var(--color-ink)] focus:outline-none";

const bouton =
  "inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-sm font-medium text-[var(--color-bg-soft)] transition-colors hover:bg-[var(--color-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40";

function jourLong(date: string): string {
  const [a, m, j] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(a, m - 1, j)));
}

function jourCourt(date: string): { semaine: string; jour: string; mois: string } {
  const [a, m, j] = date.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1, j));
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...o }).format(d);
  return {
    semaine: f({ weekday: "short" }).replace(".", ""),
    jour: f({ day: "numeric" }),
    mois: f({ month: "short" }).replace(".", ""),
  };
}

async function chargerOccupations(): Promise<{ occupations: Intervalle[]; version: number }> {
  const debut = new Date();
  const fin = new Date(debut.getTime() + (HORIZON_JOURS + 1) * 86400000);
  const url = `${AGENDA_URL}?action=occupations&debut=${encodeURIComponent(
    debut.toISOString()
  )}&fin=${encodeURIComponent(fin.toISOString())}`;
  const r = await fetch(url);
  const json = await r.json();
  if (!json.ok) throw new Error(json.erreur ?? "agenda illisible");
  return {
    occupations: (json.occupations as { debut: string; fin: string }[]).map((o) => ({
      debut: new Date(o.debut),
      fin: new Date(o.fin),
    })),
    version: Number(json.version) || 1,
  };
}

export function Reservation() {
  const [etape, setEtape] = useState<Etape>("prestation");
  const [prestationId, setPrestationId] = useState<string | null>(null);
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [agenda, setAgenda] = useState<Agenda>({ etat: "chargement" });
  const [versionScript, setVersionScript] = useState<number | null>(null);
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [creneau, setCreneau] = useState<Intervalle | null>(null);
  const [toutVoir, setToutVoir] = useState(false);
  const [form, setForm] = useState({ nomComplet: "", telephone: "", email: "", message: "" });
  const [conditionsAcceptees, setConditionsAcceptees] = useState(false);
  const [envoi, setEnvoi] = useState<"repos" | "en-cours">("repos");
  const [alerte, setAlerte] = useState<string | null>(null);
  const heuresRef = useRef<HTMLDivElement>(null);
  const continuerRef = useRef<HTMLButtonElement>(null);

  const acompteActif = (versionScript ?? 0) >= VERSION_ACOMPTE;
  const relanceActive = (versionScript ?? 0) >= VERSION_RELANCE;
  const derniereRelance = useRef("");

  // Une publicite peut pointer sur une prestation : /reserver/?prestation=semi-permanent
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("prestation");
    const arrivee = id ? trouverPrestation(id) : undefined;
    // Retour sur la page apres un depart vers Stripe (abandon, retour arriere) :
    // les evenements mis de cote partent maintenant.
    viderEnVol();
    let bouton: string | null = null;
    try {
      bouton = window.sessionStorage.getItem(CLE_ORIGINE_INTERNE);
      window.sessionStorage.removeItem(CLE_ORIGINE_INTERNE);
    } catch {}
    // Un retour de Stripe (?annule=) n'est pas une nouvelle arrivee : il
    // compterait deux fois la meme visiteuse a l'etape 1.
    const retourStripe = new URLSearchParams(window.location.search).has("annule");
    if (!arrivee?.cachee && !retourStripe) {
      const origine = origineArrivee(window.location.search, document.referrer, window.location.hostname);
      trackEvent("reservation_ouverture", {
        etape: ETAPES.ouverture,
        // Une pub reste une pub ; sinon, un bouton interne note fait foi.
        origine: bouton && origine === "direct" ? "site" : origine,
        bouton: bouton ?? "aucun",
        prestation: arrivee?.id ?? "aucune",
      });
    }
    if (arrivee) {
      setPrestationId(arrivee.id);
      // Une prestation hors des phares, demandee par l'adresse, doit se voir.
      if (!PRESTATIONS_PHARES.includes(arrivee.id)) setToutVoir(true);
      if (!arrivee.cachee) trackEvent("reservation_prestation", {
        etape: ETAPES.prestation,
        prestation: arrivee.id,
        value: arrivee.prixCents / 100,
        currency: "EUR",
        mode: "adresse",
      });
      // Arrivee par une pub sur une prestation : elle est vue sans clic.
      if (!arrivee.cachee) trackPixel("ViewContent", {
        content_ids: [arrivee.id],
        content_type: "product",
        value: arrivee.prixCents / 100,
        currency: "EUR",
      });
    }
    setMaintenant(new Date());

    // Retour de Stripe sans paiement : on libere tout de suite le creneau
    // bloque, plutot que d'attendre que la session expire.
    const annule = new URLSearchParams(window.location.search).get("annule");
    if (annule && AGENDA_URL) {
      window.history.replaceState(null, "", window.location.pathname);
      fetch(`${AGENDA_URL}?action=annuler&session=${encodeURIComponent(annule)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.statut === "paye") {
            window.location.href = `/reserver/merci/?session=${encodeURIComponent(annule)}`;
            return;
          }
          trackEvent("reservation_paiement_annule", {});
          setAlerte("Le paiement a été interrompu et le créneau libéré. Vous pouvez en choisir un nouveau.");
          recharger();
        })
        .catch(() => {});
    }
  }, []);

  const recharger = () => {
    if (!AGENDA_URL) return;
    setAgenda({ etat: "chargement" });
    chargerOccupations()
      .then(({ occupations, version }) => {
        setMaintenant(new Date());
        setVersionScript(version);
        setAgenda({ etat: "pret", occupations });
      })
      .catch(() => setAgenda({ etat: "erreur" }));
  };

  // L'agenda se charge des l'arrivee, pendant que la cliente choisit.
  useEffect(recharger, []);

  const panier = prestationId ? composerPanier(prestationId, optionIds, date) : null;

  const jours = useMemo(() => (maintenant ? joursOuverts(maintenant) : []), [maintenant]);

  const creneauxParJour = useMemo(() => {
    const parJour = new Map<string, Intervalle[]>();
    if (agenda.etat !== "pret" || !panier || !maintenant) return parJour;
    for (const d of jours) {
      parJour.set(d, creneauxDuJour(d, panier.dureeMin, agenda.occupations, maintenant));
    }
    return parJour;
  }, [agenda, panier?.dureeMin, jours, maintenant]);

  const prochain = useMemo(() => premierCreneau(jours, creneauxParJour), [jours, creneauxParJour]);

  // Etape 4 : ce que la visiteuse trouve en arrivant sur les creneaux. Une
  // seule fois par passage a cette etape, une fois l'agenda charge.
  const creneauxSuivis = useRef(false);
  useEffect(() => {
    if (etape !== "creneau") {
      creneauxSuivis.current = false;
      return;
    }
    if (creneauxSuivis.current || !panier || panier.prestation.cachee || !maintenant) return;
    if (agenda.etat === "erreur") {
      creneauxSuivis.current = true;
      trackEvent("reservation_agenda_erreur", { etape: ETAPES.creneauxAffiches, prestation: panier.prestation.id });
      return;
    }
    if (agenda.etat !== "pret") return;
    creneauxSuivis.current = true;
    const ouverts = jours.filter((d) => (creneauxParJour.get(d)?.length ?? 0) > 0);
    if (ouverts.length === 0) {
      trackEvent("reservation_aucun_creneau", { etape: ETAPES.creneauxAffiches, prestation: panier.prestation.id });
      return;
    }
    trackEvent("reservation_creneaux_affiches", {
      etape: ETAPES.creneauxAffiches,
      prestation: panier.prestation.id,
      jours_disponibles: ouverts.length,
      premier_delai_jours: delaiJours(ouverts[0], dateParis(maintenant)),
    });
  }, [etape, agenda, creneauxParJour]);

  // Le premier jour qui a de la place est choisi d'office.
  useEffect(() => {
    if (etape !== "creneau") return;
    if (date && (creneauxParJour.get(date)?.length ?? 0) > 0) return;
    const premier = jours.find((d) => (creneauxParJour.get(d)?.length ?? 0) > 0);
    setDate(premier ?? null);
  }, [etape, creneauxParJour]);

  if (!AGENDA_URL) {
    return (
      <div className="mt-10 rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-8">
        <p className="text-[var(--color-ink-soft)]">
          La réservation en ligne ouvre très bientôt. En attendant, vous pouvez
          réserver sur Planity ou m&apos;appeler au {SITE.phone}.
        </p>
        <a href={SITE.planityUrl} className={`${bouton} mt-6`}>
          Réserver sur Planity
        </a>
      </div>
    );
  }

  const defilerVers = (el: HTMLElement | null, bloc: ScrollLogicalPosition = "start") =>
    window.setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: bloc }), 60);

  const choisirPrestation = (id: string) => {
    const p = trouverPrestation(id)!;
    setPrestationId(id);
    setOptionIds([]);
    if (p.cachee) return;
    trackEvent("reservation_prestation", {
      etape: ETAPES.prestation,
      prestation: id,
      value: p.prixCents / 100,
      currency: "EUR",
      mode: "clic",
    });
    trackPixel("ViewContent", {
      content_ids: [id],
      content_type: "product",
      value: p.prixCents / 100,
      currency: "EUR",
    });
  };

  const choisirCreneau = (d: string, c: Intervalle, mode: "clic" | "prochain") => {
    setDate(d);
    setCreneau(c);
    if (panier && maintenant && !panier.prestation.cachee) {
      trackEvent("reservation_creneau", {
        etape: ETAPES.creneau,
        prestation: panier.prestation.id,
        delai_jours: delaiJours(d, dateParis(maintenant)),
        heure: heureParis(c.debut),
        mode,
      });
    }
    defilerVers(continuerRef.current, "center");
  };

  const basculerOption = (id: string) =>
    setOptionIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  // Saisie partielle a l'etape 3, a la sortie d'un champ : gardee par le
  // script pour recontacter la visiteuse si elle ne finalise pas. Rien ne
  // part vers GA4, Google Ads ni Meta ; rien sans telephone ou email valide ;
  // rien deux fois de suite a l'identique.
  const noterSaisie = () => {
    if (!relanceActive || !panier || !creneau || panier.prestation.cachee) return;
    if (!relanceUtile(form.telephone, form.email)) return;
    const { prenom, nom } = separerNom(form.nomComplet);
    const corps = {
      action: "relance",
      relanceId: idRelance(),
      prenom,
      nom,
      telephone: form.telephone.trim(),
      email: form.email.trim(),
      prestationId: panier.prestation.id,
      optionIds: panier.options.map((o) => o.id),
      debut: creneau.debut.toISOString(),
    };
    const signature = JSON.stringify(corps);
    if (signature === derniereRelance.current) return;
    derniereRelance.current = signature;
    fetch(AGENDA_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: signature,
      keepalive: true,
    }).catch(() => {});
  };

  const confirmer = async () => {
    if (!panier || !creneau) return;
    setEnvoi("en-cours");
    setAlerte(null);
    const suivi = !panier.prestation.cachee;
    const acompteAffiche = acompteActif ? acompteCents(panier.totalCents) : panier.totalCents;
    // Mis de cote : si la page part vers Stripe, un envoi direct serait perdu.
    if (suivi) garderEnVol("reservation_paiement_clic", {
      etape: ETAPES.paiementClic,
      prestation: panier.prestation.id,
      value: panier.totalCents / 100,
      currency: "EUR",
      acompte: acompteAffiche / 100,
    });
    // Identifiants GA4, seulement si GA4 est charge (cookies acceptes) : le
    // script les utilise pour envoyer begin_checkout et booking_confirmed
    // depuis le serveur, rattaches a cette session.
    const ga = suivi ? await lireIdsGa4() : null;
    const { prenom, nom } = separerNom(form.nomComplet);
    try {
      const r = await fetch(AGENDA_URL, {
        method: "POST",
        // text/plain : pas de preflight CORS, que Google ne sait pas servir.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        // Le navigateur dit ce qui est choisi, jamais ce que ca coute : le
        // script recalcule prix, acompte et duree depuis le catalogue publie.
        body: JSON.stringify({
          prestationId: panier.prestation.id,
          optionIds: panier.options.map((o) => o.id),
          debut: creneau.debut.toISOString(),
          prenom,
          nom,
          telephone: form.telephone,
          email: form.email,
          message: form.message,
          ga_client_id: ga?.clientId ?? "",
          ga_session_id: ga?.sessionId ?? "",
          // La meme demande : le script la complete (clic sur payer, page
          // Stripe ouverte) et l'efface si le paiement est confirme.
          relanceId: relanceActive && !panier.prestation.cachee ? idRelance() : "",
        }),
      });
      const json = await r.json();
      if (json.ok && json.url) {
        // Valeur = prix total de la prestation ; l'acompte en parametre.
        const total = (json.totalCents ?? json.montantCents ?? panier.totalCents) / 100;
        const acompte = (json.montantCents ?? panier.totalCents) / 100;
        // Un paiement d'essai ne doit rien apprendre a Meta : ni ici, ni en
        // Purchase sur la page de remerciement, qui lit ce marqueur.
        try {
          if (panier.prestation.cachee) window.sessionStorage.setItem("mj-paiement-essai", "1");
          else window.sessionStorage.removeItem("mj-paiement-essai");
        } catch {}
        if (panier.prestation.cachee) {
          window.location.href = json.url;
          return;
        }
        trackPixel("InitiateCheckout", {
          content_ids: [panier.prestation.id],
          value: total,
          currency: "EUR",
          acompte,
        });
        // Le script l'a deja envoye a GA4 depuis le serveur : pas de doublon.
        if (!json.ga_serveur) {
          garderEnVol("begin_checkout", {
            prestation: panier.prestation.id,
            value: total,
            currency: "EUR",
            acompte,
          });
        }
        // Le pixel envoie ses evenements en tache de fond : on lui laisse un
        // instant avant de quitter la page pour Stripe.
        setTimeout(() => {
          window.location.href = json.url;
        }, 300);
        return;
      } else if (json.raison === "pris") {
        if (suivi) trackEvent("reservation_erreur", { raison: "creneau_pris", prestation: panier.prestation.id });
        setAlerte(
          "Ce créneau vient d'être réservé par quelqu'un d'autre. Choisissez-en un autre, les disponibilités sont à jour."
        );
        setCreneau(null);
        setEtape("creneau");
        recharger();
      } else {
        if (suivi) trackEvent("reservation_erreur", {
          raison: String(json.erreur ?? "inconnue").slice(0, 40),
          prestation: panier.prestation.id,
        });
        setAlerte(
          `La réservation n'a pas pu être enregistrée (${json.erreur ?? "erreur inconnue"}). Vérifiez vos coordonnées, ou appelez-moi au ${SITE.phone}.`
        );
      }
    } catch {
      if (suivi) trackEvent("reservation_erreur", { raison: "reseau", prestation: panier.prestation.id });
      setAlerte(
        `La réservation n'a pas pu être enregistrée. Réessayez dans un instant, ou appelez-moi au ${SITE.phone}.`
      );
    }
    // Pas de depart vers Stripe : ce qui a ete mis de cote part tout de suite.
    viderEnVol();
    setEnvoi("repos");
  };

  const recap = panier ? (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-5 text-sm text-[var(--color-ink-soft)]">
      <p className="font-medium text-[var(--color-ink)]">{panier.prestation.nom}</p>
      {panier.options.length > 0 ? (
        <p className="mt-1">+ {panier.options.map((o) => o.nom).join(", ")}</p>
      ) : null}
      {creneau && date ? (
        <p className="mt-1 first-letter:uppercase">
          {jourLong(date)} à {heureParis(creneau.debut)}
        </p>
      ) : null}
      <p className="mt-1">
        {formaterDuree(panier.dureeMin)} · {formaterPrix(panier.totalCents)}
        {panier.options.some((o) => o.grille) ? " + nail art réglé au studio" : ""}
      </p>
      {acompteActif ? (
        <p className="mt-1 text-[var(--color-ink)]">
          Acompte en ligne : {formaterPrix(acompteCents(panier.totalCents))} · reste{" "}
          {formaterPrix(panier.totalCents - acompteCents(panier.totalCents))} au studio
        </p>
      ) : null}
    </div>
  ) : null;

  const fil = (
    <ol className="mt-8 flex gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]/45">
      {(["prestation", "creneau", "coordonnees"] as Etape[]).map((e, i) => (
        <li
          key={e}
          className={etape === e ? "text-[var(--color-accent)]" : undefined}
        >
          {i + 1}. {e === "prestation" ? "Prestation" : e === "creneau" ? "Créneau" : "Coordonnées"}
          {i < 2 ? <span className="ml-2 text-[var(--color-ink)]/25">/</span> : null}
        </li>
      ))}
    </ol>
  );

  const carte = (p: Prestation) => {
    const choisie = p.id === prestationId;
    // Une offre datee disparait une fois passee. Si le creneau choisi tombe
    // apres sa fin, composerPanier la retire et le recapitulatif le montre.
    const options = optionsDisponibles(p, maintenant ? dateParis(maintenant) : null);
    return (
      <li
        key={p.id}
        className={`rounded-2xl border transition-colors ${
          choisie
            ? "border-[var(--color-ink)] bg-[var(--color-bg-soft)]"
            : "border-[var(--color-line)] bg-[var(--color-bg)]/70"
        }`}
      >
        <button
          type="button"
          onClick={() => choisirPrestation(p.id)}
          aria-pressed={choisie}
          className="flex w-full items-start justify-between gap-4 p-5 text-left"
        >
          <span>
            <span className="block font-medium text-[var(--color-ink)]">{p.nom}</span>
            <span className="mt-1 block text-sm leading-relaxed text-[var(--color-ink-soft)]/80">
              {p.description}
            </span>
          </span>
          <span className="shrink-0 text-right text-sm">
            <span className="block font-medium text-[var(--color-ink)]">
              {formaterPrix(p.prixCents)}
            </span>
            <span className="block text-[var(--color-ink)]/55">
              {formaterDuree(p.dureeMin)}
            </span>
          </span>
        </button>

        {choisie ? (
          <div className="border-t border-[var(--color-line)] px-5 pb-5 pt-4">
            {options.length > 0 ? (
              <fieldset>
                <legend className="text-xs uppercase tracking-[0.18em] text-[var(--color-ink)]/55">
                  En option
                </legend>
                <div className="mt-3 space-y-2">
                  {options.map((o) => (
                    <label
                      key={o.id}
                      className="flex cursor-pointer items-start gap-3 text-sm text-[var(--color-ink-soft)]"
                    >
                      <input
                        type="checkbox"
                        checked={optionIds.includes(o.id)}
                        onChange={() => basculerOption(o.id)}
                        className="mt-0.5 h-4 w-4 accent-[var(--color-ink)]"
                      />
                      <span className="flex-1">
                        <span className="text-[var(--color-ink)]">{o.nom}</span>
                        {o.jusquau ? (
                          <span className="ml-2 rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            Jusqu&apos;au 30 novembre
                          </span>
                        ) : null}
                        <span className="block text-[var(--color-ink-soft)]/75">
                          {o.description}
                        </span>
                        {o.grille && optionIds.includes(o.id) ? (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-[var(--color-ink-soft)]/85">
                            {o.grille.map((ligne) => (
                              <li key={ligne}>{ligne}</li>
                            ))}
                          </ul>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-right">
                        {o.prixCents > 0 ? `+${formaterPrix(o.prixCents)}` : "Au studio"}
                        {" · "}
                        {formaterDuree(o.dureeMin)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (panier && !p.cachee) trackEvent("reservation_vers_creneaux", {
                  etape: ETAPES.versCreneaux,
                  prestation: p.id,
                  value: panier.totalCents / 100,
                  currency: "EUR",
                  nb_options: panier.options.length,
                });
                setCreneau(null);
                setEtape("creneau");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`${bouton} mt-5 w-full sm:w-auto`}
            >
              Choisir un créneau
              {panier ? ` · ${formaterPrix(panier.totalCents)}` : ""}
            </button>
          </div>
        ) : null}
      </li>
    );
  };

  const visibles = prestationsVisibles(prestationId);
  const { phares, autres } = separerPhares(visibles, PRESTATIONS_PHARES);

  return (
    <div>
      {/* Reassurance : visible des l'arrivee, avant toute prestation. */}
      <div className="mt-5 space-y-4">
        <p className="text-sm text-[var(--color-ink-soft)]">
          <a
            href={SITE.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline"
          >
            <span aria-hidden className="text-[var(--color-accent)]">★★★★★</span> {SITE.googleRating.toFixed(1).replace(".", ",")}/5 sur{" "}
            {SITE.googleReviewCount} avis Google
          </a>
          <span className="mx-2 text-[var(--color-ink)]/30">·</span>
          Studio privé près du parc de la Tête d&apos;Or
        </p>
        <ul className="grid grid-cols-3 gap-2 sm:max-w-md">
          {PHOTOS.map((ph) => (
            <li key={ph.src}>
              <img
                src={asset(ph.src)}
                alt={ph.alt}
                width={160}
                height={160}
                className="aspect-square w-full rounded-xl object-cover"
              />
            </li>
          ))}
        </ul>
        {acompteActif ? (
          <p className="rounded-xl bg-[var(--color-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--color-ink)]">
            Réservez avec un acompte de 50 %, le reste au studio. Report gratuit jusqu&apos;à 48 h avant.
          </p>
        ) : null}
      </div>

      {fil}

      {alerte ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 p-4 text-sm text-[var(--color-ink)]"
        >
          {alerte}
        </p>
      ) : null}

      {etape === "prestation" ? (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="font-serif text-2xl text-[var(--color-ink)]">Les plus demandées</h2>
            <ul className="mt-4 space-y-3">{phares.map(carte)}</ul>
          </section>

          {toutVoir ? (
            CATEGORIES.map((cat) => {
              const liste = autres.filter((p) => p.categorie === cat.id);
              if (liste.length === 0) return null;
              return (
                <section key={cat.id}>
                  <h2 className="font-serif text-2xl text-[var(--color-ink)]">{cat.nom}</h2>
                  <ul className="mt-4 space-y-3">{liste.map(carte)}</ul>
                </section>
              );
            })
          ) : (
            <button
              type="button"
              onClick={() => setToutVoir(true)}
              className="w-full rounded-full border border-[var(--color-ink)]/30 px-6 py-3.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] sm:w-auto"
            >
              Voir toutes les prestations ({autres.length} de plus)
            </button>
          )}
        </div>
      ) : null}

      {etape === "creneau" && panier ? (
        <div className="mt-8 space-y-6">
          {recap}
          <button
            type="button"
            onClick={() => setEtape("prestation")}
            className="text-sm text-[var(--color-ink)]/65 underline underline-offset-4"
          >
            Changer de prestation
          </button>

          {agenda.etat === "chargement" ? (
            <p className="text-[var(--color-ink-soft)]">Chargement des disponibilités…</p>
          ) : agenda.etat === "erreur" ? (
            <div className="space-y-3 text-[var(--color-ink-soft)]">
              <p>
                Les disponibilités n&apos;ont pas pu être chargées. Réessayez, ou
                appelez-moi au {SITE.phone}.
              </p>
              <button type="button" onClick={recharger} className={bouton}>
                Réessayer
              </button>
            </div>
          ) : (
            <>
              {prochain ? (
                <button
                  type="button"
                  onClick={() => choisirCreneau(prochain.date, prochain.creneau, "prochain")}
                  className="w-full rounded-2xl border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 px-5 py-4 text-left text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)]"
                >
                  <span className="block text-xs uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    Prochain créneau
                  </span>
                  <span className="mt-1 block font-medium first-letter:uppercase">
                    {jourLong(prochain.date)} à {heureParis(prochain.creneau.debut)}
                  </span>
                </button>
              ) : null}

              <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
                <ul className="flex gap-2 pb-2">
                  {jours.map((d) => {
                    const n = creneauxParJour.get(d)?.length ?? 0;
                    const c = jourCourt(d);
                    const actif = d === date;
                    return (
                      <li key={d}>
                        <button
                          type="button"
                          disabled={n === 0}
                          onClick={() => {
                            setDate(d);
                            setCreneau(null);
                            defilerVers(heuresRef.current);
                          }}
                          className={`flex w-16 flex-col items-center rounded-2xl border py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                            actif
                              ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg-soft)]"
                              : "border-[var(--color-line)] bg-[var(--color-bg-soft)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                          }`}
                        >
                          <span className="text-[11px] uppercase tracking-[0.12em] opacity-75">
                            {c.semaine}
                          </span>
                          <span className="font-serif text-xl leading-tight">{c.jour}</span>
                          <span className="text-[11px] opacity-75">{c.mois}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {date ? (
                <div ref={heuresRef} className="scroll-mt-6">
                  <p className="font-serif text-xl text-[var(--color-ink)] first-letter:uppercase">
                    {jourLong(date)}
                  </p>
                  <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {(creneauxParJour.get(date) ?? []).map((c) => {
                      const actif = creneau?.debut.getTime() === c.debut.getTime();
                      return (
                        <li key={c.debut.toISOString()}>
                          <button
                            type="button"
                            onClick={() => choisirCreneau(date, c, "clic")}
                            className={`w-full rounded-xl border py-2.5 text-sm transition-colors ${
                              actif
                                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg-soft)]"
                                : "border-[var(--color-line)] bg-[var(--color-bg-soft)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                            }`}
                          >
                            {heureParis(c.debut)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-[var(--color-ink-soft)]">
                  Plus aucun créneau libre pour cette durée sur les{" "}
                  {HORIZON_JOURS} prochains jours. Appelez-moi au {SITE.phone},
                  on trouvera une solution.
                </p>
              )}

              <button
                ref={continuerRef}
                type="button"
                disabled={!creneau}
                onClick={() => {
                  if (panier && creneau && date && maintenant && !panier.prestation.cachee) {
                    trackEvent("reservation_coordonnees", {
                      etape: ETAPES.coordonnees,
                      prestation: panier.prestation.id,
                      delai_jours: delaiJours(date, dateParis(maintenant)),
                    });
                  }
                  setEtape("coordonnees");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`${bouton} w-full sm:w-auto`}
              >
                Continuer
              </button>
            </>
          )}
        </div>
      ) : null}

      {etape === "coordonnees" && panier && creneau ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            confirmer();
          }}
        >
          {recap}
          <button
            type="button"
            onClick={() => setEtape("creneau")}
            className="text-sm text-[var(--color-ink)]/65 underline underline-offset-4"
          >
            Changer de créneau
          </button>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              autoComplete="name"
              placeholder="Prénom et nom"
              value={form.nomComplet}
              onChange={(e) => setForm({ ...form, nomComplet: e.target.value })}
              onBlur={noterSaisie}
              // L'ancien script exige un nom : tant qu'il tourne, deux mots.
              pattern={acompteActif ? undefined : "\\s*\\S+\\s+\\S.*"}
              title={acompteActif ? undefined : "Indiquez votre prénom et votre nom"}
              className={`${champ} sm:col-span-2`}
            />
            <input
              required
              type="tel"
              autoComplete="tel"
              placeholder="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              onBlur={noterSaisie}
              className={champ}
            />
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={noterSaisie}
              className={champ}
            />
          </div>
          <textarea
            rows={3}
            placeholder="Un message pour Manon ? (idée de nail art, première visite…)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={champ}
          />

          {acompteActif ? (
            <>
              <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
                L&apos;acompte est déduit du prix de votre prestation. Vous pouvez
                décaler votre rendez-vous gratuitement jusqu&apos;à 48 h avant en
                contactant Manon. En cas d&apos;annulation, l&apos;acompte n&apos;est
                pas remboursé.
              </p>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  required
                  checked={conditionsAcceptees}
                  onChange={(e) => setConditionsAcceptees(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-ink)]"
                />
                <span>
                  J&apos;accepte les{" "}
                  <a
                    href={CONDITIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    conditions de réservation
                  </a>
                </span>
              </label>
            </>
          ) : null}

          <button type="submit" disabled={envoi === "en-cours"} className={`${bouton} w-full sm:w-auto`}>
            {envoi === "en-cours"
              ? "Ouverture du paiement…"
              : acompteActif
                ? `Payer l'acompte · ${formaterPrix(acompteCents(panier.totalCents))}`
                : `Payer et réserver · ${formaterPrix(panier.totalCents)}`}
          </button>
          <p className="text-xs leading-relaxed text-[var(--color-ink)]/55">
            Paiement sécurisé par Stripe : carte bancaire, Apple Pay ou Google Pay.
            Le créneau vous est réservé pendant 30 minutes, le temps du paiement.
          </p>
        </form>
      ) : null}
    </div>
  );
}
