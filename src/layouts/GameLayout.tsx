import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Flag,
  Gavel,
  Globe,
  History,
  Landmark,
  Map as MapIcon,
  Newspaper,
  Save,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useGameStore } from "../stores/game-store";
import { useT } from "../i18n/store";
import { dateLabel, chapterTitle } from "../engine/calendar";
import { governmentSeats } from "../data/parties";
import { GameHUD } from "../components/layout/GameHUD";
import { GameNavigation } from "../components/layout/GameNavigation";
import type { NavItem } from "../components/layout/GameNavigation";

/**
 * The shell, cut like a game stage rather than a web page: the frame fills
 * the viewport and never scrolls — content scrolls inside it — every screen
 * change cuts through black, and the HUD is a readout line, not a navbar.
 * The readout itself lives in GameHUD, the pause drawer in GameNavigation.
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

  if (!game) return null;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-paper">
      <a href="#main" className="skip-link">
        {t("common.skip")}
      </a>

      <GameHUD
        turn={game.turn}
        chapter={game.chapter}
        approval={game.politics.approval}
        coalition={game.politics.coalitionStability}
        seats={governmentSeats()}
        queueCount={game.queuedEventIds.length}
        menuOpen={menuOpen}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {/* the stage: the frame never scrolls, the report scrolls inside it */}
      <main id="main" className="relative flex-1 min-h-0 overflow-y-auto">
        {!online && (
          <p role="status" className="bg-paper-deep border-b border-rule text-center text-xs py-1.5 text-muted px-4">
            {t("common.offline")}
          </p>
        )}
        <div className="px-4 sm:px-8 py-7 max-w-6xl w-full mx-auto min-w-0">
          {location.pathname !== "/game/office" && (
            <Link
              to="/game/office"
              className="inline-flex items-center gap-1.5 min-h-[24px] text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-gold-bright transition-colors mb-5"
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
        <GameNavigation
          sections={NAV_SECTIONS}
          queueCount={game.queuedEventIds.length}
          dateLabel={dateLabel(game.turn, lang)}
          chapterLabel={chapterTitle(game.chapter, lang)}
          onClose={() => setMenuOpen(false)}
          onExit={() => {
            setMenuOpen(false);
            navigate("/campaigns");
          }}
        />
      )}
    </div>
  );
}
