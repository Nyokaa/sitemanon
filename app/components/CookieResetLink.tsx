"use client";

import { resetCookieConsent } from "./Analytics";

export function CookieResetLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={resetCookieConsent}
      className={`hover:text-[var(--color-ink)] ${className}`}
    >
      Gérer les cookies
    </button>
  );
}
