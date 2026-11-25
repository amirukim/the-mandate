import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Flag,
  Gavel,
  Globe,
  Handshake,
  History,
  Landmark,
  Map as MapIcon,
  Menu,
  Newspaper,
  Save,
  Settings,
  Shield,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useGameStore } from "../stores/game-store";
import { useT } from "../i18n/store";
import { dateLabel, chapterTitle } from "../engine/calendar";
import { governmentSeats } from "../data/parties";
import { cn } from "../utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The shell, cut like a game stage rather than a web page: the frame fills
 * the viewport and never scrolls — content scrolls inside it — every screen
 * change cuts through black, and the HUD is a readout line, not a navbar.
 */
export function GameLayout() {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_SECTIONS: Array<{ label: string; items: NavItem[] }> = [
    {
      label: t("nav.government"),
      items: [
        { to: "/game/overview", label: t("nav.overview"), icon: Landmark },
        { to: "/game/office", label: t("nav.office"), icon: Briefcase },
        { to: "/game/briefing", label: t("nav.briefing"), icon: FileText },
        { to: "/game/cabinet", label: t("nav.cabinet"), icon: Users },
      ],
    },
    {
      label: t("nav.policy"),
      items: [
        { to: "/game/parliament", label: t("nav.parliament"), icon: Gavel },
        { to: "/game/economy", label: t("nav.economy"), icon: TrendingUp },
        { to: "/game/parties", label: t("nav.parties"), icon: Flag },
        { to: "/game/states", label: t("nav.states"), icon: MapIcon },
      ],
    },
    {
      label: t("nav.world"),
      items: [
        { to: "/game/diplomacy", label: t("nav.diplomacy"), icon: Globe },
        { to: "/game/security", label: t("nav.security"), icon: Shield },
        { to: "/game/news", label: t("nav.news"), icon: Newspaper },
      ],
    },
    {
      label: t("nav.record"),
      items: [
        { to: "/game/history", label: t("nav.history"), icon: History },
        { to: "/game/saves", label: t("nav.saves"), icon: Save },
        { to: "/game/settings", label: t("nav.settings"), icon: Settings },
      ],
    },
  ];

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (!game) return null;

  const queueCount = game.queuedEventIds.length;
  const approval = game.politics.approval;
  const coalition = game.politics.coalitionStability;
  const seats = governmentSeats();
  const toneOf = (v: number, watch: number, bad: number): "good" | "watch" | "bad" =>
    v >= watch ? "good" : v >= bad ? "watch" : "bad";
  const onOffice = location.pathname === "/game/office";

  const drawerNav = (
    <nav aria-label={t("nav.navAria")} className="flex flex-col gap-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="kicker px-3 mb-2">{section.label}</p>
          <ul>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-3 rounded-[2px] transition-colors font-display text-[15px] font-semibold",
                        isActive
                          ? "bg-chrome-ink/10 text-chrome-gold"
                          : "text-chrome-ink/85 hover:text-chrome-ink hover:bg-chrome-ink/5",
                      )
                    }
                  >
                    <Icon size={18} aria-hidden="true" className="shrink-0 text-chrome-gold/80" />
                    <span className="min-w-0 truncate">{item.label}</span>
                    {item.to === "/game/briefing" && queueCount > 0 && (
                      <span className="tabular ml-auto text-[11px] font-bold text-chrome-gold border border-chrome-gold/60 rounded-[2px] px-1">
                        {queueCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-paper">
      <a href="#main" className="skip-link">
        {t("common.skip")}
      </a>

      {/* HUD readout line — the federal instrument, carried as chrome */}
      <header className="relative z-30 border-b border-black/30 bg-chrome text-chrome-ink">
        <div className="flex items-center gap-3 sm:gap-5 px-3 sm:px-5 h-11">
          <StarMark />
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="tabular text-[13px] font-medium whitespace-nowrap text-chrome-gold">{dateLabel(game.turn, lang)}</span>
            <span className="kicker hidden lg:inline whitespace-nowrap text-chrome-ink/70">{chapterTitle(game.chapter, lang)}</span>
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
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="game-nav"
              aria-label={t("nav.openNav")}
              className="flex items-center justify-center min-w-[36px] h-8 border border-chrome-ink/30 rounded-[2px] text-chrome-ink/90"
            >
              <Menu size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        {/* the instrument rule: antique gold, not a flag ribbon */}
        <div aria-hidden="true" className="h-[2px] bg-chrome-gold/70" />
      </header>

      {/* the stage: the frame never scrolls, the report scrolls inside it */}
      <main id="main" className="relative flex-1 min-h-0 overflow-y-auto">
        {!online && (
          <p role="status" className="bg-paper-deep border-b border-rule text-center text-xs py-1.5 text-muted px-4">
            {t("common.offline")}
          </p>
        )}
        <div className="px-4 sm:px-8 py-7 max-w-6xl w-full mx-auto min-w-0">
          {!onOffice && (
            <Link
              to="/game/office"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-gold-bright transition-colors mb-5"
            >
              <span aria-hidden="true" className="h-px w-4 bg-gold/60" />
              {t("nav.backToOffice")}
            </Link>
          )}
          <Outlet />
        </div>
      </main>

      {/* the frame: floor bar with a gold hairline */}
      <div aria-hidden="true" className="h-2 bg-chrome-deep border-t border-gold/25" />

      {/* scene cut: every screen change passes through midnight */}
      <motion.div
        key={location.pathname}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[45] bg-chrome-deep"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />

      {/* the pause menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label={t("nav.closeNav")}
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="game-nav"
            className="absolute right-0 top-0 h-full w-[20rem] max-w-[85vw] bg-chrome-deep border-l border-gold/30 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-chrome-ink/15">
              <span className="kicker text-chrome-gold">{t("nav.navTitle")}</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t("nav.closeNav")}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] border border-chrome-ink/30 rounded-[2px] text-chrome-ink/90"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{drawerNav}</div>
            <div className="px-4 py-3 border-t border-chrome-ink/15">
              <p className="tabular text-sm text-chrome-gold">{dateLabel(game.turn, lang)}</p>
              <p className="kicker mt-0.5 text-chrome-ink/60">{chapterTitle(game.chapter, lang)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/campaigns");
              }}
              className="w-full text-sm text-chrome-ink/70 hover:text-chrome-ink py-3.5 border-t border-chrome-ink/15 text-left px-4"
            >
              {t("nav.exitCampaign")}
            </button>
          </div>
        </div>
      )}
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
