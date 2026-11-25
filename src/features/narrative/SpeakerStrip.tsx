import { Avatar } from "../../components/ui/Avatar";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";
import type { CastMember } from "./cast";

/**
 * The scene cast as portrait plates: the Suzerain character row. The speaking
 * character is lit in gold; the others wait in shadow. Tapping one brings
 * them to the stage.
 */
export function SpeakerStrip({
  cast,
  active,
  onFocus,
  className,
}: {
  cast: CastMember[];
  active?: string;
  onFocus: (idx: number) => void;
  className?: string;
}) {
  const { t } = useT();
  return (
    <div className={cn("items-start gap-2 overflow-x-auto max-w-full pt-1", className)} role="group" aria-label={t("scene.inRoom")}>
      {cast.map((c) => {
        const isActive = active === c.speaker;
        return (
          <button
            key={c.speaker}
            type="button"
            onClick={() => onFocus(c.idx)}
            aria-pressed={isActive}
            className={cn(
              "flex w-14 shrink-0 flex-col items-center gap-1 rounded-[2px] p-1 transition-all",
              isActive
                ? "bg-chrome-ink/[0.07] opacity-100"
                : "opacity-55 hover:opacity-95 focus-visible:opacity-100",
            )}
            title={`${c.speaker} — ${c.role}`}
          >
            <Avatar name={c.speaker} size="md" className={isActive ? "ring-gold" : "ring-chrome-ink/10"} />
            <span
              className={cn(
                "w-full truncate text-center text-[9px] font-semibold uppercase tracking-[0.06em] leading-tight",
                isActive ? "text-gold-bright" : "text-muted",
              )}
            >
              {c.speaker}
            </span>
          </button>
        );
      })}
    </div>
  );
}
