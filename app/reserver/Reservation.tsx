"use client";

import { useEffect, useMemo, useState } from "react";
import { SITE } from "@/app/lib/site";
import { trackEvent, trackPixel } from "@/app/lib/analytics";
import { AGENDA_URL } from "./config";
import {
  CATEGORIES,
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
  ajouterJours,
  creneauxDuJour,
  dateParis,
  heureParis,
  joursOuverts,
} from "./creneaux";

type Etape = "prestation" | "creneau" | "coordonnees";

type Agenda =
  | { etat: "chargement" }
  | { etat: "erreur" }
  | { etat: "pret"; occupations: Intervalle[] };

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

async function chargerOccupations(): Promise<Intervalle[]> {
  const debut = new Date();
  const fin = new Date(debut.getTime() + (HORIZON_JOURS + 1) * 86400000);
  const url = `${AGENDA_URL}?action=occupations&debut=${encodeURIComponent(
    debut.toISOString()
  )}&fin=${encodeURIComponent(fin.toISOString())}`;
  const r = await fetch(url);
  const json = await r.json();
  if (!json.ok) throw new Error(json.erreur ?? "agenda illisible");
  return (json.occupations as { debut: string; fin: string }[]).map((o) => ({
    debut: new Date(o.debut),
    fin: new Date(o.fin),
  }));
}

export function Reservation() {
  const [etape, setEtape] = useState<Etape>("prestation");
  const [prestationId, setPrestationId] = useState<string | null>(null);
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [agenda, setAgenda] = useState<Agenda>({ etat: "chargement" });
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [creneau, setCreneau] = useState<Intervalle | null>(null);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    message: "",
  });
  const [envoi, setEnvoi] = useState<"repos" | "en-cours">("repos");
  const [alerte, setAlerte] = useState<string | null>(null);

  // Une publicite peut pointer sur une prestation : /reserver/?prestation=semi-permanent
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("prestation");
    const arrivee = id ? trouverPrestation(id) : undefined;
    if (arrivee) {
      setPrestationId(arrivee.id);
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
      .then((occupations) => {
        setMaintenant(new Date());
        setAgenda({ etat: "pret", occupations });
      })
      .catch(() => setAgenda({ etat: "erreur" }));
  };

  // L'agenda se charge des l'arrivee, pendant que la cliente choisit.
  useEffect(recharger, []);

  const prestation = prestationId ? trouverPrestation(prestationId) ?? null : null;
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

  const choisirPrestation = (id: string) => {
    const p = trouverPrestation(id)!;
    setPrestationId(id);
    setOptionIds([]);
    if (p.cachee) return;
    trackEvent("reservation_prestation", { prestation: id });
    trackPixel("ViewContent", {
      content_ids: [id],
      content_type: "product",
      value: p.prixCents / 100,
      currency: "EUR",
    });
  };

  const basculerOption = (id: string) =>
    setOptionIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const confirmer = async () => {
    if (!panier || !creneau) return;
    setEnvoi("en-cours");
    setAlerte(null);
    try {
      const r = await fetch(AGENDA_URL, {
        method: "POST",
        // text/plain : pas de preflight CORS, que Google ne sait pas servir.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        // Le navigateur dit ce qui est choisi, jamais ce que ca coute : le
        // script recalcule prix et duree depuis le catalogue publie.
        body: JSON.stringify({
          prestationId: panier.prestation.id,
          optionIds: panier.options.map((o) => o.id),
          debut: creneau.debut.toISOString(),
          ...form,
        }),
      });
      const json = await r.json();
      if (json.ok && json.url) {
        const valeur = (json.montantCents ?? panier.totalCents) / 100;
        // Un paiement d'essai ne doit rien apprendre a Meta : ni ici, ni en
        // Purchase sur la page de remerciement, qui lit ce marqueur.
        try {
          if (panier.prestation.cachee) window.sessionStorage.setItem("mj-paiement-essai", "1");
          else window.sessionStorage.removeItem("mj-paiement-essai");
        } catch {}
        if (!panier.prestation.cachee) trackEvent("begin_checkout", {
          prestation: panier.prestation.id,
          value: valeur,
          currency: "EUR",
        });
        if (!panier.prestation.cachee) trackPixel("InitiateCheckout", {
          content_ids: [panier.prestation.id],
          value: valeur,
          currency: "EUR",
        });
        // Le pixel envoie ses evenements en tache de fond : on lui laisse un
        // instant avant de quitter la page pour Stripe.
        setTimeout(() => {
          window.location.href = json.url;
        }, 300);
        return;
      } else if (json.raison === "pris") {
        setAlerte(
          "Ce créneau vient d'être réservé par quelqu'un d'autre. Choisissez-en un autre, les disponibilités sont à jour."
        );
        setCreneau(null);
        setEtape("creneau");
        recharger();
      } else {
        setAlerte(
          `La réservation n'a pas pu être enregistrée (${json.erreur ?? "erreur inconnue"}). Vérifiez vos coordonnées, ou appelez-moi au ${SITE.phone}.`
        );
      }
    } catch {
      setAlerte(
        `La réservation n'a pas pu être enregistrée. Réessayez dans un instant, ou appelez-moi au ${SITE.phone}.`
      );
    }
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

  return (
    <div>
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
          {CATEGORIES.map((cat) => (
            <section key={cat.id}>
              <h2 className="font-serif text-2xl text-[var(--color-ink)]">{cat.nom}</h2>
              <ul className="mt-4 space-y-3">
                {prestationsVisibles(prestationId).filter((p) => p.categorie === cat.id).map((p) => {
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
                })}
              </ul>
            </section>
          ))}
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
                <div>
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
                            onClick={() => setCreneau(c)}
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
                type="button"
                disabled={!creneau}
                onClick={() => {
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
              autoComplete="given-name"
              placeholder="Prénom"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              className={champ}
            />
            <input
              required
              autoComplete="family-name"
              placeholder="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className={champ}
            />
            <input
              required
              type="tel"
              autoComplete="tel"
              placeholder="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className={champ}
            />
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <button type="submit" disabled={envoi === "en-cours"} className={`${bouton} w-full sm:w-auto`}>
            {envoi === "en-cours"
              ? "Ouverture du paiement…"
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
