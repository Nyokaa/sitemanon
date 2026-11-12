"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/app/lib/site";
import { trackEvent, trackPixel } from "@/app/lib/analytics";
import { AGENDA_URL } from "../config";
import { formaterPrix } from "../catalogue";
import { FUSEAU } from "../creneaux";

type Etat =
  | { etat: "chargement" }
  | { etat: "erreur" }
  | { etat: "non_paye" }
  | {
      etat: "paye";
      montantCents: number;
      prestation: string;
      debut: string;
      prenom: string;
    };

function quand(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Le Purchase part une seule fois par paiement : une cliente qui recharge
 * la page ne doit pas compter deux ventes. Et l'identifiant de la session
 * sert d'eventID, ce qui permet a Meta de dedoublonner de son cote aussi.
 */
function envoyerAchat(session: string, montantCents: number) {
  // Paiement d'essai : rien vers Meta ni Analytics.
  try {
    if (window.sessionStorage.getItem("mj-paiement-essai")) return;
  } catch {}
  const cle = `mj-achat-${session}`;
  try {
    if (window.localStorage.getItem(cle)) return;
    window.localStorage.setItem(cle, "1");
  } catch {}
  trackEvent("purchase", { value: montantCents / 100, currency: "EUR", transaction_id: session });
  trackPixel("Purchase", { value: montantCents / 100, currency: "EUR" }, { eventID: session });
}

export function Merci() {
  const [etat, setEtat] = useState<Etat>({ etat: "chargement" });
  const [session, setSession] = useState<string | null>(null);

  const verifier = (id: string) => {
    setEtat({ etat: "chargement" });
    fetch(`${AGENDA_URL}?action=confirmer&session=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) return setEtat({ etat: "erreur" });
        if (json.statut !== "paye") return setEtat({ etat: "non_paye" });
        setEtat({ etat: "paye", ...json });
        envoyerAchat(id, json.montantCents);
      })
      .catch(() => setEtat({ etat: "erreur" }));
  };

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("session");
    setSession(id);
    if (id && AGENDA_URL) verifier(id);
    else setEtat({ etat: "erreur" });
  }, []);

  if (etat.etat === "chargement") {
    return <p className="text-[var(--color-ink-soft)]">Vérification du paiement…</p>;
  }

  if (etat.etat === "paye") {
    return (
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">
          Rendez-vous confirmé
        </p>
        <h1 className="font-serif text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
          Merci {etat.prenom}, à très vite.
        </h1>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-5 text-[var(--color-ink-soft)]">
          <p className="font-medium text-[var(--color-ink)]">{etat.prestation}</p>
          <p className="mt-1 first-letter:uppercase">{quand(etat.debut)}</p>
          <p className="mt-1">{formaterPrix(etat.montantCents)} réglés en ligne</p>
        </div>
        <p className="text-[var(--color-ink-soft)]">
          Je vous attends au {SITE.address.street}, {SITE.address.postalCode}{" "}
          {SITE.address.city}. Un reçu vous a été envoyé par email. En cas
          d&apos;empêchement, prévenez-moi au {SITE.phone}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[var(--color-ink-soft)]">
      <h1 className="font-serif text-3xl text-[var(--color-ink)]">
        {etat.etat === "non_paye"
          ? "Le paiement n'est pas encore confirmé"
          : "Impossible de vérifier votre paiement"}
      </h1>
      <p>
        {etat.etat === "non_paye"
          ? "Stripe ne nous a pas encore confirmé le paiement. Si vous venez de payer, patientez quelques secondes puis vérifiez à nouveau."
          : "La vérification n'a pas abouti. Si vous avez payé, votre rendez-vous est bien enregistré : vous recevrez votre reçu par email."}{" "}
        Une question ? Appelez-moi au {SITE.phone}.
      </p>
      <div className="flex flex-wrap gap-3">
        {session ? (
          <button
            type="button"
            onClick={() => verifier(session)}
            className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-[var(--color-bg-soft)]"
          >
            Vérifier à nouveau
          </button>
        ) : null}
        <Link
          href="/reserver/"
          className="rounded-full border border-[var(--color-ink)]/30 px-6 py-3 text-sm text-[var(--color-ink)]"
        >
          Retour à la réservation
        </Link>
      </div>
    </div>
  );
}
