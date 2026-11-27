import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { usePortalOverlay, prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { useT } from "../../i18n/store";

interface MonthTransitionProps {
  /** The month label the player is entering, e.g. "December 2026". */
  dateLabel: string;
  chapterTitle: string;
  onDone: () => void;
}

/**
 * Suzerain's turn change: a black interstitial that stamps the new month
 * across the screen for a beat, then releases the player into it.
 * Skips instantly under prefers-reduced-motion.
 */
export function MonthTransition({ dateLabel, chapterTitle, onDone }: MonthTransitionProps) {
  const { container } = usePortalOverlay("month-transition");
  const [exiting, setExiting] = useState(false);
  const { lang } = useT();
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    const hold = window.setTimeout(() => setExiting(true), 1100);
    const release = window.setTimeout(onDone, 1700);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(release);
    };
  }, [onDone, reduced]);

  if (!container) return null;
  const entering = lang === "ms" ? "MEMASUKI" : "ENTERING";

  return createPortal(
    <motion.div
      key="month"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.55 }}
      className="fixed inset-0 z-[70] bg-chrome-deep flex items-center justify-center"
      aria-hidden="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="text-center px-6"
      >
        <p className="kicker text-[11px] text-chrome-gold">{entering}</p>
        <p className="display text-4xl sm:text-6xl font-semibold mt-3 tracking-tight text-chrome-ink">{dateLabel}</p>
        <div className="rule-gold mt-6 max-w-xs mx-auto" />
        <p className="kicker text-[12px] text-chrome-ink/60">{chapterTitle}</p>
      </motion.div>
    </motion.div>,
    container,
  );
}
