import { NavLink } from "react-router-dom";
import { FileText, Handshake, Landmark, Menu, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { dateLabel, chapterTitle } from "../../engine/calendar";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";

/** Compact HUD readout: icon + figure, light on the instrument bar. */
function Hud({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "good" | "watch" | "bad" | "plain";
}) {
  const color =
    tone === "good" ? "text-chrome-good" : tone === "watch" ? "text-chrome-gold" : tone === "bad" ? "text-chrome-bad" : "text-chrome-ink";
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <Icon size={13} aria-hidden="true" className="text-chrome-ink/70 shrink-0" />
      <span className={cn("tabular text-xs font-semibold", color)}>{value}</span>
    </div>
  );
}

function StarMark() {
  return (
    <svg viewBox="0 0 32 32" className="w-5 h-5 shrink-0" aria-hidden="true">
      <g fill="var(--chrome-gold)">
        <rect x="9" y="9" width="14" height="14" />
        <rect x="9" y="9" width="14" height="14" transform="rotate(45 16 16)" />
      </g>
      <circle cx="16" cy="16" r="4.2" fill="var(--chrome)" />
    </svg>
  );
}

interface GameHUDProps {
  turn: number;
  chapter: number;
  approval: number;
  coalition: number;
  seats: number;
  queueCount: number;
  menuOpen: boolean;
  onOpenMenu(): void;
}

/**
 * The HUD readout line — the federal instrument, carried as chrome: date,
 * chapter, mandate figures, the briefing queue badge and the menu button,
 * closed by a 2px antique-gold rule (not a flag ribbon).
 */
export function GameHUD({ turn, chapter, approval, coalition, seats, queueCount, menuOpen, onOpenMenu }: GameHUDProps) {
  const { t, lang } = useT();
  const toneOf = (v: number, watch: number, bad: number): "good" | "watch" | "bad" =>
    v >= watch ? "good" : v >= bad ? "watch" : "bad";

  return (
    <header className="relative z-30 border-b border-black/30 bg-chrome text-chrome-ink">
      <div className="flex items-center gap-3 sm:gap-5 px-3 sm:px-5 h-11">
        <StarMark />
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="tabular text-[13px] font-medium whitespace-nowrap text-chrome-gold">{dateLabel(turn, lang)}</span>
          <span className="kicker hidden lg:inline whitespace-nowrap text-chrome-ink/70">{chapterTitle(chapter, lang)}</span>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5" aria-label={t("overview.mandate")}>
            <Hud icon={Users} label={t("common.approval")} value={`${Math.round(approval)}%`} tone={toneOf(approval, 45, 30)} />
            <div className="hidden sm:flex items-center gap-3.5">
              <Hud icon={Handshake} label={t("overview.coalition")} value={`${Math.round(coalition)}`} tone={toneOf(coalition, 55, 35)} />
              <Hud icon={Landmark} label={t("nav.parliament")} value={`${seats}/222`} tone="plain" />
            </div>
          </div>

          <NavLink
            to="/game/briefing"
            aria-label={t("nav.briefingsBadge").replace("%{n}", String(queueCount))}
            className={({ isActive }) =>
              cn(
                "relative flex items-center justify-center min-w-[36px] h-8 px-2 border rounded-[2px] transition-colors",
                // the visual chip stays compact; the touch floor is met by the inflated hit area
                "after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']",
                isActive ? "border-chrome-gold text-chrome-gold" : "border-chrome-ink/30 text-chrome-ink/80 hover:text-chrome-ink hover:border-chrome-ink/60",
              )
            }
          >
            <FileText size={15} aria-hidden="true" />
            {queueCount > 0 && (
              <span className="tabular absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center bg-brick text-on-brick text-[10px] font-bold rounded-[1px] border border-chrome-ink/70">
                {queueCount}
              </span>
            )}
          </NavLink>

          <button
            type="button"
            onClick={onOpenMenu}
            aria-expanded={menuOpen}
            aria-controls="game-nav"
            aria-label={t("nav.openNav")}
            className="relative flex items-center justify-center min-w-[36px] h-8 border border-chrome-ink/30 rounded-[2px] text-chrome-ink/90 after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']"
          >
            <Menu size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {/* the instrument rule: antique gold, not a flag ribbon */}
      <div aria-hidden="true" className="h-[2px] bg-chrome-gold/70" />
    </header>
  );
}
