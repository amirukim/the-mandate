import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { MalaysiaMap } from "./MalaysiaMap";
import { PartyFlag } from "../ui/PartyFlag";
import { Meter } from "../ui/Meter";
import type { StateDef } from "../../data/states";
import { coalitionById } from "../../data/parties";
import { usePortalOverlay, trapTab, prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { useT } from "../../i18n/store";
import { coalitionText } from "../../i18n/data";

interface MapTheatreProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
  /** The currently open state file, rendered as a floating dossier card. */
  state?: StateDef | null;
  onClearState: () => void;
}

/**
 * The map as a Suzerain-style world screen: full viewport, the dossier
 * floating over it, Escape / backdrop to leave.
 */
export function MapTheatre({ selectedId, onSelect, onClose, state, onClearState }: MapTheatreProps) {
  const { container } = usePortalOverlay("map-theatre");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const { t, lang } = useT();
  const reduced = prefersReducedMotion();

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!container) return null;

  return createPortal(
    <motion.div
      key="map-theatre"
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      className="fixed inset-0 z-[60] bg-paper-deep flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={t("overview.mapAria")}
      onKeyDown={(e) => trapTab(e, rootRef.current)}
    >
      <div className="flex items-center justify-between px-5 sm:px-10 py-4 border-b border-rule bg-card">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <p className="kicker kicker-gold">{t("overview.mapTitle")}</p>
          <span aria-hidden="true" className="text-rule">&middot;</span>
          <p className="kicker">{t("overview.mapHint")}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("overview.closeMap")}
          className="flex items-center justify-center min-w-[40px] h-10 border border-rule rounded-[2px] text-muted hover:text-ink hover:border-gold/60 transition-colors"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 min-h-0 relative">
        <MalaysiaMap expanded selectedId={selectedId} onSelect={onSelect} />
        {state && (
          <motion.aside
            key={state.id}
            initial={{ opacity: 0, x: reduced ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-[19rem] max-w-[calc(100vw-2rem)] max-h-[80%] overflow-y-auto"
          >
            <StateFileCard state={state} lang={lang} onClear={onClearState} />
          </motion.aside>
        )}
      </div>
    </motion.div>,
    container,
  );
}

function StateFileCard({ state, lang, onClear }: { state: StateDef; lang: "en" | "ms"; onClear: () => void }) {
  const { t } = useT();
  const bloc = coalitionById(state.ruling);
  const blocDisplay = bloc ? coalitionText(bloc, lang) : null;
  const relationTone = state.relation >= 55 ? "moss" : state.relation >= 40 ? "gold" : "brick";
  return (
    <div className="bg-card border border-gold/50 rounded-panel overflow-hidden shadow-lift">
      <div className="px-4 py-3 border-b border-rule flex items-center justify-between gap-2">
        <p className="kicker kicker-gold">{t("overview.stateFile")}</p>
        <button
          type="button"
          onClick={onClear}
          aria-label={t("overview.closeFile")}
          className="flex items-center justify-center w-8 h-8 border border-rule rounded-[2px] text-muted hover:text-ink hover:border-gold/60 transition-colors"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          {bloc && <PartyFlag coalitionId={bloc.id} size={30} />}
          <div className="min-w-0">
            <h2 className="display text-2xl font-semibold leading-tight">{state.name}</h2>
            <p className="kicker text-[10px] mt-0.5">{state.capital}</p>
          </div>
        </div>
        <dl className="mt-4 divide-y divide-rule border-y border-rule">
          <div className="py-2.5 flex items-baseline justify-between gap-3">
            <dt className="kicker text-[10px]">{t("overview.headOfGov")}</dt>
            <dd className="text-sm font-semibold text-right">{state.rulerTitle}</dd>
          </div>
          <div className="py-2.5 flex items-baseline justify-between gap-3">
            <dt className="kicker text-[10px]">{t("overview.alignment")}</dt>
            <dd className="text-sm font-semibold text-right flex items-center justify-end gap-1.5">
              {bloc && (
                <span aria-hidden="true" className="inline-block w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: bloc.color }} />
              )}
              <span>{blocDisplay ? blocDisplay.name : t("overview.federalGov")}</span>
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <Meter label={t("overview.relations")} value={state.relation} tone={relationTone} />
        </div>
        <p className="text-sm text-muted leading-relaxed mt-4">{state.note}</p>
      </div>
    </div>
  );
}
