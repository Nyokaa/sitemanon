"use client";

import Link from "next/link";
import { SITE } from "@/app/lib/site";
import { trackEvent } from "@/app/lib/analytics";
import { noterOrigineInterne } from "@/app/reserver/entonnoir";

type Props = {
  className?: string;
  variant?: "primary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  source?: string;
  /** Destination : Planity (nouvel onglet, par defaut) ou la page /reserver/. */
  vers?: "planity" | "reserver";
  children?: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] focus:ring-[var(--color-ink)]";

const variants = {
  primary:
    "bg-[var(--color-ink)] text-[var(--color-bg-soft)] hover:bg-[var(--color-ink-soft)] shadow-sm hover:shadow-md",
  ghost:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]/30 hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)]/5",
  accent:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-soft)] shadow-sm hover:shadow-md",
};

const sizes = {
  sm: "text-xs px-4 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-sm px-8 py-4 md:text-base",
};

/** Lien de la page de reservation du site, au lieu de Planity. */
export const RESERVER_URL = "/reserver/";

const flecheExterne = <path d="M7 17L17 7M17 7H8M17 7V16" />;
const flecheInterne = <path d="M5 12h14M13 6l6 6-6 6" />;

export function BookingButton({
  className = "",
  variant = "primary",
  size = "md",
  source = "default",
  vers = "planity",
  children = "Prendre rendez-vous",
}: Props) {
  const interne = vers === "reserver";
  const contenu = (
    <>
      <span>{children}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {interne ? flecheInterne : flecheExterne}
      </svg>
    </>
  );
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const clic = () => {
    trackEvent("booking_click", { source });
    if (interne) noterOrigineInterne(source);
  };

  // Reservation sur le site : lien interne, meme onglet. Next change de page
  // sans recharger, donc booking_click a le temps de partir.
  if (interne) {
    return (
      <Link href={RESERVER_URL} onClick={clic} className={classes}>
        {contenu}
      </Link>
    );
  }
  return (
    <a
      href={SITE.planityUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={clic}
      className={classes}
    >
      {contenu}
    </a>
  );
}
