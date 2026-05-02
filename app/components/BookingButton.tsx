"use client";

import { SITE } from "@/app/lib/site";
import { trackEvent } from "@/app/lib/analytics";

type Props = {
  className?: string;
  variant?: "primary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  source?: string;
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

export function BookingButton({
  className = "",
  variant = "primary",
  size = "md",
  source = "default",
  children = "Prendre rendez-vous",
}: Props) {
  return (
    <a
      href={SITE.planityUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("booking_click", { source })}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
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
        <path d="M7 17L17 7M17 7H8M17 7V16" />
      </svg>
    </a>
  );
}
