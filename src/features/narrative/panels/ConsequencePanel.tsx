import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { NewspaperArticle } from "../../../components/game/NewspaperArticle";
import { useT } from "../../../i18n/store";
import { stageFade } from "../useTypewriter";
import type { ChosenOutcome } from "../../../engine/turn-flow";

interface ConsequencePanelProps {
  chosen: ChosenOutcome;
  onContinue(): void;
}

/** The wire: the stamp, what follows, tomorrow's front pages, and the month end. */
export function ConsequencePanel({ chosen, onContinue }: ConsequencePanelProps) {
  const { t } = useT();
  return (
    <motion.section
      key="reaction"
      {...stageFade(0)}
      aria-labelledby="reaction-title"
      className="max-w-3xl w-full ml-auto bg-card/85 border border-gold/25 rounded-panel backdrop-blur-sm px-5 sm:px-6 py-5 max-h-[62vh] overflow-y-auto"
    >
      <p className="stamp">{t("scene.stamp")}</p>
      <h1 id="reaction-title" className="display text-2xl sm:text-3xl font-semibold mt-3 leading-tight">
        {chosen.option.label}
      </h1>
      <p className="text-muted text-sm mt-2 max-w-prose leading-relaxed">{chosen.option.summary}</p>
      <div className="rule-double mt-5" />

      {chosen.notes.length > 0 && (
        <motion.section {...stageFade(0.15)} aria-label={t("scene.consequencesAria")} className="mt-5">
          <p className="kicker kicker-gold mb-3">{t("scene.whatFollows")}</p>
          <div className="space-y-3">
            {chosen.notes.map((note, i) => (
              <p
                key={i}
                className="display text-[1.0313rem] leading-relaxed text-ink/90 border-l-2 border-gold pl-4 py-0.5"
              >
                {note}
              </p>
            ))}
          </div>
        </motion.section>
      )}

      {chosen.news.length > 0 && (
        <motion.section {...stageFade(0.3)} aria-label={t("scene.wire")} className="mt-6">
          <div className="flex items-center gap-3">
            <p className="kicker kicker-gold shrink-0">{t("scene.wire")}</p>
            <span aria-hidden="true" className="flex-1 border-t border-gold/40" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {chosen.news.map((item) => (
              <NewspaperArticle key={item.id} item={item} />
            ))}
          </div>
        </motion.section>
      )}

      <motion.div {...stageFade(0.4)} className="mt-6 flex items-center gap-4">
        <Button onClick={onContinue}>{t("common.continue")}</Button>
        <span className="text-xs text-muted">{t("common.monthEnd")}</span>
      </motion.div>
    </motion.section>
  );
}
