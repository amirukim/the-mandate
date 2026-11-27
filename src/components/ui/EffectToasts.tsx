import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ChosenOutcome } from "../../engine/turn-flow";
import type { Effect } from "../../types/game";
import { useT } from "../../i18n/store";

/**
 * Stat toasts: the immediate, visible deltas of a just-made decision, floated
 * beside the consequence sheet for a few seconds. Delayed effects stay hidden
 * until they land — that is the point of them.
 */

/** Which i18n label each known effect target reads as. */
const TARGET_LABEL: Record<string, string> = {
  "politics.approval": "common.approval",
  "politics.coalitionStability": "overview.coalition",
  "politics.oppositionStrength": "overview.opposition",
  "politics.institutionalIntegrity": "overview.integrity",
  "economy.gdpGrowth": "overview.gdp",
  "economy.inflation": "overview.inflation",
  "economy.unemployment": "overview.unemployment",
  "economy.ringgit": "overview.ringgit",
  "social.costOfLivingPressure": "overview.costLiving",
  "federal.ma63Progress": "federal.ma63",
  "federal.sabahSarawakAutonomy": "federal.autonomy",
  "security.domesticStability": "security.stability",
};

/** Fallbacks for paths the table misses: relationships, social dials, etc. */
function labelFor(target: string, t: (k: string) => string): string {
  if (TARGET_LABEL[target]) return t(TARGET_LABEL[target]);
  const rel = target.match(/^characters\.([\w-]+)\.relationship$/);
  if (rel) return t("cabinet.relationship");
  if (target.startsWith("social.")) return t(`social.${target.slice(7)}`) !== target ? t(`social.${target.slice(7)}`) : target;
  return target;
}

interface Toast {
  id: string;
  label: string;
  delta: number;
}

function toastsFor(chosen: ChosenOutcome, t: (k: string) => string): Toast[] {
  const deltas = new Map<string, number>();
  for (const consequence of chosen.option.consequences) {
    if (consequence.delayTurns !== undefined) continue;
    for (const effect of consequence.effects ?? []) collect(effect, deltas);
  }
  return [...deltas.entries()]
    .filter(([, delta]) => delta !== 0)
    .map(([target, delta], i) => ({ id: `${chosen.option.id}-${target}-${i}`, label: labelFor(target, t), delta }));
}

function collect(effect: Effect, deltas: Map<string, number>) {
  if (effect.delta === undefined) return;
  deltas.set(effect.target, (deltas.get(effect.target) ?? 0) + effect.delta);
}

export function EffectToasts({ chosen }: { chosen: ChosenOutcome }) {
  const { t } = useT();
  const [visible, setVisible] = useState(() => toastsFor(chosen, t));

  useEffect(() => {
    setVisible(toastsFor(chosen, t));
    const timer = window.setTimeout(() => setVisible([]), 3600);
    return () => window.clearTimeout(timer);
  }, [chosen]);

  return (
    <div aria-live="polite" className="pointer-events-none absolute right-4 top-24 z-20 flex flex-col gap-2">
      {visible.map((toast, i) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: i * 0.12 }}
          className="flex items-center gap-2 bg-chrome-deep/90 border border-gold/50 rounded-[3px] px-3 py-1.5"
        >
          <span className="font-pixel text-[12px] text-gold">
            {toast.delta > 0 ? `+${toast.delta}` : toast.delta}
          </span>
          <span className="kicker text-[11px] text-paper">
            {t(toast.label)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
