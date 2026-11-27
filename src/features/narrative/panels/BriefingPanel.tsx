import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { useT } from "../../../i18n/store";
import { cn } from "../../../utils/cn";
import { stageFade } from "../useTypewriter";
import type { CastMember } from "../cast";

interface BriefingPanelProps {
  briefing: string[];
  cast: CastMember[];
  onProceed(): void;
}

/** The file: the event's setup, a drop cap, the cast line, and the door. */
export function BriefingPanel({ briefing, cast, onProceed }: BriefingPanelProps) {
  const { t } = useT();
  return (
    <motion.section
      key="briefing"
      {...stageFade(0.05)}
      aria-label={t("scene.briefingAria")}
      className="max-w-3xl w-full ml-auto bg-card/85 border border-gold/25 rounded-panel backdrop-blur-sm px-5 sm:px-7 py-5 max-h-[62vh] overflow-y-auto"
    >
      <div className="flex items-center gap-3">
        <p className="kicker kicker-gold shrink-0">{t("scene.file")}</p>
        <span aria-hidden="true" className="flex-1 border-t border-gold/40" />
      </div>
      <div className="space-y-4 mt-4">
        {briefing.map((paragraph, i) => (
          <p
            key={i}
            className={cn(
              "display text-[1.0625rem] sm:text-[1.125rem] leading-[1.75] text-ink/90 max-w-prose",
              i === 0 && "drop-cap",
            )}
          >
            {paragraph}
          </p>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 mt-6">
        {cast.length > 0 && (
          <p className="kicker text-[11px] text-muted">{cast.map((c) => c.speaker).join(" · ")}</p>
        )}
        <Button onClick={onProceed}>{t("scene.proceed")} &rarr;</Button>
      </div>
    </motion.section>
  );
}
