import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { useT } from "../../../i18n/store";
import { stageFade } from "../useTypewriter";

interface DialoguePanelProps {
  speaker: string;
  role: string;
  /** Revealed text (typewriter) and the full line for screen readers. */
  shown: string;
  text: string;
  done: boolean;
  lineIdx: number;
  total: number;
  onProceed(): void;
}

/** One exchange at a time: speaker plate, typewriter reveal, Space/Enter. */
export function DialoguePanel({ speaker, role, shown, text, done, lineIdx, total, onProceed }: DialoguePanelProps) {
  const { t, lang } = useT();
  return (
    <motion.section
      key={`dialogue-${lineIdx}`}
      {...stageFade(0)}
      aria-label={t("scene.inRoom")}
      className="max-w-3xl w-full ml-auto bg-card/85 border border-gold/25 rounded-panel backdrop-blur-sm px-5 sm:px-7 py-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-bright">{speaker}</p>
          <p className="kicker text-[12px]">{role}</p>
        </div>
        <p className="tabular kicker text-[12px] text-muted">
          {lineIdx + 1} / {total}
        </p>
      </div>
      <p className="display italic text-[1.2rem] sm:text-[1.32rem] leading-[1.6] mt-3 text-ink/95 min-h-[5.5rem]">
        &ldquo;{shown}
        {!done && <span aria-hidden="true" className="text-gold">▌</span>}
        {done && "\u201D"}
      </p>
      <span className="sr-only">{text}</span>
      <div className="flex items-center justify-between gap-3 mt-3">
        <p className="text-[11px] text-muted">
          {lang === "ms" ? "Klik atau tekan Space untuk teruskan." : "Click, or press Space, to continue."}
        </p>
        <Button onClick={onProceed}>{t("common.continue")} &rarr;</Button>
      </div>
    </motion.section>
  );
}
