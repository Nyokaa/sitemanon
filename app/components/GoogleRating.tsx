import { SITE } from "@/app/lib/site";

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export function GoogleRating({ className = "", variant = "light" }: Props) {
  const stars = Math.round(SITE.googleRating);
  const ink = variant === "dark" ? "text-white" : "text-[var(--color-ink)]";
  const muted =
    variant === "dark" ? "text-white/70" : "text-[var(--color-ink)]/65";

  return (
    <a
      href={SITE.googleReviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Note Google : ${SITE.googleRating} sur 5, ${SITE.googleReviewCount} avis — voir tous les avis`}
      className={`inline-flex items-center gap-2.5 text-sm transition-opacity hover:opacity-80 ${className}`}
    >
      <span className="flex gap-0.5 text-[var(--color-accent)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={i < stars ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
      <span className={`font-medium ${ink}`}>
        {SITE.googleRating.toFixed(1)}/5
      </span>
      <span className={muted}>
        · {SITE.googleReviewCount} avis Google
      </span>
    </a>
  );
}
