"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/app/lib/site";
import { trackEvent, trackPixel, viderEnVol } from "@/app/lib/analytics";
import { AGENDA_URL } from "../config";
import { formaterPrix } from "../catalogue";
import { FUSEAU } from "../creneaux";
import { estPaiementDeTest } from "../suivi";

type Etat =
  | { etat: "chargement" }
  | { etat: "erreur" }
  | { etat: "non_paye" }
  | {
      etat: "paye";
      montantCents: number;
      totalCents?: number;
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
function envoyerAchat(
  session: string,
  totalCents: number,
  acompteCents: number,
  service: string,
  gaServeur: boolean
) {
  // Session Stripe en mode test : ni booking_confirmed, ni purchase, ni
  // Purchase. Les paiements reels (cs_live_) ne sont pas concernes.
  if (estPaiementDeTest(session)) return;
  // Paiement d'essai : rien vers Meta ni Analytics.
  try {
    if (window.sessionStorage.getItem("mj-paiement-essai")) return;
  } catch {}
  const cle = `mj-achat-${session}`;
  try {
    if (window.localStorage.getItem(cle)) return;
    window.localStorage.setItem(cle, "1");
  } catch {}
  // Valeur = prix total de la prestation ; l'acompte encaisse en parametre.
  const valeur = totalCents / 100;
  const acompte = acompteCents / 100;
  // Part uniquement ici : apres que le script a relu le paiement chez Stripe
  // et repondu « paye ». Jamais au chargement de /reserver, jamais en erreur,
  // et une seule fois grace au marqueur ci-dessus. Si gtag n'est pas encore
  // charge, trackEvent le met en attente au lieu de le perdre.
  // Quand le script envoie deja ces deux evenements a GA4 depuis le serveur
  // (ga_serveur), le site ne les renvoie pas : ils compteraient deux fois.
  if (!gaServeur) {
    trackEvent("booking_confirmed", {
      value: valeur,
      currency: "EUR",
      transaction_id: session, // identifiant Stripe unique du rendez-vous
      service,
      acompte,
    });
    trackEvent("purchase", { value: valeur, currency: "EUR", transaction_id: session, acompte });
  }
  trackPixel("Purchase", { value: valeur, currency: "EUR", acompte }, { eventID: session });
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
        // Ancien script : pas de totalCents, le montant encaisse est le total.
        envoyerAchat(
          id,
          json.totalCents ?? json.montantCents,
          json.montantCents,
          json.prestation,
          Boolean(json.ga_serveur)
        );
      })
      .catch(() => setEtat({ etat: "erreur" }));
  };

  useEffect(() => {
    // D'abord les etapes mises de cote au depart vers Stripe, pour garder
    // l'ordre : paiement_clic, begin_checkout, puis booking_confirmed.
    viderEnVol();
    const id = new URLSearchParams(window.location.search).get("session");
    setSession(id);
    if (id && AGENDA_URL) verifier(id);
    else setEtat({ etat: "erreur" });
  }, []);

  if (etat.etat === "chargement") {
    return <p className="text-[var(--color-ink-soft)]">Vérification du paiement…</p>;
  }

  if (etat.etat === "paye") {
    const reste = (etat.totalCents ?? etat.montantCents) - etat.montantCents;
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
          {reste > 0 ? (
            <>
              <p className="mt-1">Acompte de {formaterPrix(etat.montantCents)} réglé en ligne</p>
              <p className="mt-1 text-[var(--color-ink)]">
                Reste {formaterPrix(reste)} à régler au studio, en espèces ou par carte
              </p>
            </>
          ) : (
            <p className="mt-1">{formaterPrix(etat.montantCents)} réglés en ligne</p>
          )}
        </div>
        <p className="text-[var(--color-ink-soft)]">
          Je vous attends au {SITE.address.street}, {SITE.address.postalCode}{" "}
          {SITE.address.city}. Un reçu vous a été envoyé par email.{" "}
          {reste > 0
            ? `Besoin de décaler ? C'est gratuit jusqu'à 48 h avant : appelez-moi ou écrivez-moi sur WhatsApp au ${SITE.phone}.`
            : `En cas d'empêchement, prévenez-moi au ${SITE.phone}.`}
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
