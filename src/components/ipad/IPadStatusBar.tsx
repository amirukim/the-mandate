import { Link, NavLink } from "react-router-dom";
import { FileText, House, Landmark, Menu, Users } from "lucide-react";
import { dateLabel, chapterTitle } from "../../engine/calendar";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";

/** Compact readout: icon + figure, pixel numerals on the iPad slab. */
function Readout({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone: "good" | "watch" | "bad" | "plain";
}) {
  const color =
    tone === "good" ? "text-chrome-good" : tone === "watch" ? "text-chrome-gold" : tone === "bad" ? "text-chrome-bad" : "text-chrome-ink";
  return (
    <span className="flex items-center gap-1.5" title={label}>
      <Icon size={13} aria-hidden="true" className="text-chrome-ink/70 shrink-0" />
      <span className={cn("font-pixel text-[8px] font-normal", color)}>{value}</span>
    </span>
  );
}

function toneOf(v: number, watch: number, bad: number): "good" | "watch" | "bad" {
  return v >= watch ? "good" : v >= bad ? "watch" : "bad";
}

interface IPadStatusBarProps {
  turn: number;
  chapter: number;
  approval: number;
  coalition: number;
  seats: number;
  queueCount: number;
  menuOpen: boolean;
  isHome: boolean;
  onOpenMenu(): void;
}

/**
 * The iPad status bar: in-game date, mandate readouts, the briefing badge and
 * the app-switcher button, with a home button outside the home screen. Pixel
 * numerals (D-06); navigation and ARIA behaviour carried over from the HUD.
 */
export function IPadStatusBar({ turn, chapter, approval, coalition, seats, queueCount, menuOpen, isHome, onOpenMenu }: IPadStatusBarProps) {
  const { t, lang } = useT();
  return (
    <header
      className={cn(
        "relative z-30 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 h-12 shrink-0",
        "bg-chrome text-chrome-ink border-b border-black/30",
        isHome && "bg-transparent border-b-0 absolute inset-x-0 top-0",
      )}
    >
      {/* date + chapter */}
      <div className="flex items-baseline gap-2.5 min-w-0">
        <span className="font-pixel text-[16px] whitespace-nowrap text-chrome-gold">{dateLabel(turn, lang)}</span>
        <span className="kicker hidden lg:inline whitespace-nowrap text-chrome-ink/70">{chapterTitle(chapter, lang)}</span>
      </div>

      <div className="ml-auto flex items-center gap-2.5 sm:gap-3.5">
        <div className="flex items-center gap-3" aria-label={t("overview.mandate")}>
          <Readout icon={Users} label={t("common.approval")} value={`${Math.round(approval)}%`} tone={toneOf(approval, 45, 30)} />
          <div className="hidden sm:flex items-center gap-3">
            <Readout icon={Users} label={t("overview.coalition")} value={`${Math.round(coalition)}`} tone={toneOf(coalition, 55, 35)} />
            <Readout icon={Landmark} label={t("nav.parliament")} value={`${seats}`} tone="plain" />
          </div>
        </div>

        {/* briefing badge */}
        <NavLink
          to="/game/briefing"
          aria-label={t("nav.briefingsBadge").replace("%{n}", String(queueCount))}
          className={({ isActive }) =>
            cn(
              "relative flex items-center justify-center min-w-[36px] h-8 px-2 border rounded-[3px] transition-colors",
              isActive ? "border-chrome-gold text-chrome-gold" : "border-chrome-ink/30 text-chrome-ink/80 hover:text-chrome-ink hover:border-chrome-ink/60",
            )
          }
        >
          <FileText size={15} aria-hidden="true" />
          {queueCount > 0 && (
            <span className="font-pixel absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center bg-brick text-on-brick text-[9px] border border-chrome-ink/70 rounded-[2px]">
              {queueCount}
            </span>
          )}
        </NavLink>

        {/* home button outside the home screen */}
        {!isHome && (
          <Link
            to="/game/home"
            aria-label={t("nav.home")}
            title={t("nav.home")}
            className="hidden sm:flex items-center justify-center min-w-[36px] h-8 border border-chrome-ink/30 rounded-[3px] text-chrome-ink/90 hover:text-chrome-ink hover:border-chrome-ink/60 transition-colors"
          >
            <House size={15} aria-hidden="true" />
          </Link>
        )}

        {/* app switcher */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-expanded={menuOpen}
          aria-controls="game-nav"
          aria-label={t("nav.openNav")}
          className="flex items-center justify-center min-w-[36px] h-8 border border-chrome-ink/30 rounded-[3px] text-chrome-ink/90"
        >
          <Menu size={15} aria-hidden="true" />
        </button>
      </div>
      {/* the instrument rule: antique gold */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-chrome-gold/70" />
    </header>
  );
}
