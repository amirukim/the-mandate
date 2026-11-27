import { motion } from "framer-motion";
import { useT } from "../../../i18n/store";
import { stageFade } from "../useTypewriter";

interface DecisionPanelProps {
  options: Array<{ id: string; label: string; detail: string }>;
  /** The picked option id while the pause runs, or null before a choice. */
  selected: string | null;
  onPick(optionId: string): void;
  onBackToBriefing(): void;
}

/**
 * The reply: numbered options, one-line detail, a deliberate pause after the
 * pick, and no undo.
 */
export function DecisionPanel({ options, selected, onPick, onBackToBriefing }: DecisionPanelProps) {
  const { t } = useT();
  return (
    <motion.section
      key="decision"
      {...stageFade(0)}
      aria-label={t("scene.decisionsAria")}
      className="max-w-3xl w-full ml-auto bg-card/85 border border-gold/25 rounded-panel backdrop-blur-sm px-5 sm:px-7 py-5 max-h-[62vh] overflow-y-auto"
    >
      <div className="flex items-center gap-3">
        <p className="kicker kicker-gold shrink-0">{t("scene.reply")}</p>
        <span aria-hidden="true" className="flex-1 border-t border-gold/30" />
      </div>
      {selected === null ? (
        <>
          <div className="grid gap-2 mt-3">
            {options.map((option, i) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onPick(option.id)}
                className="group w-full text-left flex items-start gap-4 px-4 py-3 rounded-[3px] border border-chrome-ink/10 bg-chrome-ink/[0.04] transition-colors hover:border-gold/60 hover:bg-chrome-ink/[0.07] focus-visible:border-gold"
              >
                <span className="tabular inline-flex w-7 h-7 shrink-0 mt-0.5 items-center justify-center border border-gold text-gold-text text-xs font-bold rounded-[2px] group-hover:bg-gold group-hover:text-paper transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="display block text-base sm:text-lg font-semibold leading-snug">{option.label}</span>
                  <span className="block text-sm text-muted mt-0.5 leading-relaxed line-clamp-2 max-w-prose">
                    {option.detail}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="hidden sm:block ml-auto text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xl translate-y-0.5"
                >
                  &rarr;
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 mt-3">
            <p className="text-[11px] text-muted">{t("scene.noUndo")}</p>
            <button
              type="button"
              onClick={onBackToBriefing}
              className="kicker text-[11px] text-muted hover:text-gold-bright underline underline-offset-4"
            >
              {t("scene.file")}
            </button>
          </div>
        </>
      ) : (
        <p className="text-muted text-sm py-2" aria-live="polite">
          {t("scene.decisionMade").replace("%{choice}", options.find((o) => o.id === selected)?.label ?? "")}
        </p>
      )}
    </motion.section>
  );
}
