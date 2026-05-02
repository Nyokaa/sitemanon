"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/app/lib/site";
import { trackEvent } from "@/app/lib/analytics";

export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // visible après 600 px de scroll (passé le hero)
      setVisible(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
        >
          <a
            href={SITE.planityUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("booking_click", { source: "mobile_sticky" })}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-4 text-sm font-medium tracking-wide text-[var(--color-bg-soft)] shadow-[0_15px_30px_-10px_rgba(44,58,46,0.55)] transition-all active:scale-[0.98]"
          >
            <span>Prendre rendez-vous</span>
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
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
