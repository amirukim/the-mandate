import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Flag,
  Gavel,
  Globe,
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

export function GameLayout() {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const navigate = useNavigate();

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

  const drawerNav = (
    <nav aria-label={t("nav.navAria")} className="flex flex-col gap-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="kicker px-3 mb-1.5">{section.label}</p>
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
                        "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-[2px] border-l-2 transition-colors",
                        isActive
                          ? "border-gold bg-surface text-ink font-semibold"
                          : "border-transparent text-muted hover:text-ink hover:bg-surface/60",
                      )
                    }
                  >
                    <Icon size={15} aria-hidden="true" className="shrink-0" />
                    <span className="min-w-0 truncate">{item.label}</span>
                    {item.to === "/game/briefing" && queueCount > 0 && (
                      <span className="tabular ml-auto text-[11px] font-bold text-gold-text border border-gold rounded-[2px] px-1">
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
    <div className="min-h-screen flex flex-col bg-paper">
      <a href="#main" className="skip-link">
        {t("common.skip")}
      </a>

      {/* Slim game top bar: identity, calendar, HUD figures. */}
      <header className="sticky top-0 z-30 border-b border-rule bg-card/97 backdrop-blur-sm">
        <div className="flex items-center gap-3 sm:gap-6 px-3 sm:px-5 h-14">
          <div className="flex items-center gap-2.5 shrink-0">
            <StarMark />
            <div className="leading-none hidden sm:block">
              <p className="display font-semibold text-[13px] tracking-wide">{t("brand.name")}</p>
              <p className="kicker text-[9px] mt-0.5">{t("brand.sub")}</p>
            </div>
          </div>

          <div className="hidden md:flex items-baseline gap-3 border-l border-rule pl-6">
            <span className="tabular text-sm font-medium text-ink">{dateLabel(game.turn, lang)}</span>
            <span className="kicker">{chapterTitle(game.chapter, lang)}</span>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <div className="flex sm:hidden items-baseline gap-2.5" aria-hidden="true">
              <span className="tabular text-xs font-semibold text-gold-text">{Math.round(approval)}%</span>
              <span className="text-muted text-[10px]">&middot;</span>
              <span className="tabular text-xs font-semibold text-moss-text">{Math.round(coalition)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-5" aria-label={t("overview.mandate")}>
              <Hud label={t("common.approval")} value={`${Math.round(approval)}%`} tone={toneOf(approval, 45, 30)} />
              <Hud label={t("overview.coalition")} value={`${Math.round(coalition)}`} tone={toneOf(coalition, 55, 35)} />
              <div className="hidden lg:flex items-baseline gap-1.5" title={t("overview.seatsHouse")}>
                <span className="kicker text-[9px]">{t("nav.parliament")}</span>
                <span className="tabular text-xs font-semibold text-ink">{seats}/222</span>
              </div>
            </div>

            <NavLink
              to="/game/briefing"
              aria-label={t("nav.briefingsBadge").replace("%{n}", String(queueCount))}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center justify-center min-w-[40px] h-10 px-2 border rounded-[2px] transition-colors",
                  isActive ? "border-gold text-gold-text" : "border-rule text-muted hover:text-ink hover:border-rule-strong",
                )
              }
            >
              <FileText size={16} aria-hidden="true" />
              {queueCount > 0 && (
                <span className="tabular absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center bg-brick text-ink text-[10px] font-bold rounded-[1px] border border-paper">
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
              className="lg:hidden flex items-center justify-center min-w-[40px] h-10 border border-rule rounded-[2px] text-ink"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Right-edge icon rail: Suzerain's side buttons, not a dashboard sidebar. */}
      <nav
        aria-label={t("nav.sectionsAria")}
        className="hidden lg:flex fixed right-0 top-14 bottom-0 w-14 z-20 flex-col items-center pt-4 pb-3 gap-1 border-l border-rule bg-card overflow-y-auto"
      >
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.label} className="contents">
            {si > 0 && <span aria-hidden="true" className="w-7 border-t border-rule my-2" />}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center justify-center w-11 h-11 rounded-[2px] border transition-colors",
                      isActive
                        ? "border-gold/60 bg-surface text-gold-bright"
                        : "border-transparent text-muted hover:text-ink hover:bg-surface/70",
                    )
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.to === "/game/briefing" && queueCount > 0 && (
                    <span className="tabular absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-0.5 flex items-center justify-center bg-brick text-ink text-[9px] font-bold rounded-[1px] border border-card">
                      {queueCount}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-card border border-rule rounded-[2px] text-[11px] font-semibold uppercase tracking-[0.1em] text-ink whitespace-nowrap shadow-lift opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex-1 min-w-0 lg:pr-14">
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <button
              type="button"
              aria-label={t("nav.closeNav")}
              className="absolute inset-0 bg-black/65"
              onClick={() => setMenuOpen(false)}
            />
            <div
              id="game-nav"
              className="absolute right-0 top-0 h-full w-[19rem] max-w-[85vw] bg-card border-l border-rule flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-rule">
                <span className="kicker kicker-gold">{t("nav.navTitle")}</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t("nav.closeNav")}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] border border-rule rounded-[2px]"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">{drawerNav}</div>
              <div className="px-4 py-3 border-t border-rule">
                <p className="tabular text-sm text-ink">{dateLabel(game.turn, lang)}</p>
                <p className="kicker mt-0.5">{chapterTitle(game.chapter, lang)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/campaigns");
                }}
                className="w-full text-sm text-muted hover:text-ink py-3.5 border-t border-rule text-left px-4"
              >
                {t("nav.exitCampaign")}
              </button>
            </div>
          </div>
        )}

        {!online && (
          <p role="status" className="bg-paper-deep border-b border-rule text-center text-xs py-1.5 text-muted px-4">
            {t("common.offline")}
          </p>
        )}

        <main id="main" className="page-enter flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full mx-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function StarMark() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" aria-hidden="true">
      <g fill="var(--gold-bright)">
        <rect x="9" y="9" width="14" height="14" />
        <rect x="9" y="9" width="14" height="14" transform="rotate(45 16 16)" />
      </g>
      <circle cx="16" cy="16" r="4.2" fill="var(--card)" />
    </svg>
  );
}

/** Compact HUD figure in the top bar — a game readout, not a dashboard widget. */
function Hud({ label, value, tone }: { label: string; value: string; tone: "good" | "watch" | "bad" }) {
  const color = tone === "good" ? "text-moss-text" : tone === "watch" ? "text-gold-text" : "text-brick-text";
  return (
    <div className="flex items-baseline gap-1.5" title={label}>
      <span className="kicker text-[9px]">{label}</span>
      <span className={cn("tabular text-xs font-semibold", color)}>{value}</span>
    </div>
  );
}
