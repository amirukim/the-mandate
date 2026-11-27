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
import type { NavItem } from "../components/ipad/GameNavigation";
import { GameNavigation } from "../components/ipad/GameNavigation";
import { IPadFrame } from "../components/ipad/IPadFrame";
import { IPadStatusBar } from "../components/ipad/IPadStatusBar";
import { HomeScreen } from "../components/ipad/HomeScreen";
import { NotificationBanner, type BannerItem } from "../components/ipad/NotificationBanner";
import { attachSoundUnlock } from "../engine/sound";

/**
 * The v2 shell: the game runs inside an iPad frame (full-bleed on touch and
 * narrow viewports). A slim status bar carries the mandate readouts; the home
 * screen is the office plate with app icons over it (decision D-07); the old
 * drawer is the app switcher. Every route change opens like an app — scale and
 * fade within 300ms, instant under reduced motion.
 */
export function GameLayout() {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [banner, setBanner] = useState<BannerItem | null>(null);
  const [seenNews, setSeenNews] = useState<number | null>(null);
  const [seenQueue, setSeenQueue] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // the sound kit unlocks on the first real gesture (D-21)
  useEffect(() => attachSoundUnlock(), []);

  const NAV_SECTIONS: Array<{ label: string; items: NavItem[] }> = [
    {
      label: t("nav.government"),
      items: [
        { to: "/game/home", label: t("nav.home"), icon: Landmark },
        { to: "/game/office", label: t("nav.office"), icon: Briefcase },
        { to: "/game/briefing", label: t("nav.briefing"), icon: FileText },
        { to: "/game/messages", label: t("nav.messages"), icon: Users },
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

  // notifications: a new wire item or a new briefing on the desk raises a
  // banner (ARIA live via the banner component), once per item.
  const newsCount = game?.news.length ?? 0;
  const queueCount = game?.queuedEventIds.length ?? 0;
  useEffect(() => {
    if (!game) return;
    if (seenNews !== null && newsCount > seenNews) {
      const item = game.news[game.news.length - 1];
      setBanner({ id: item.id, kind: "news", title: item.headline, body: item.body });
      return;
    }
    if (seenNews === null) setSeenNews(newsCount);
  }, [game, newsCount, seenNews]);

  useEffect(() => {
    if (!game) return;
    if (seenQueue !== null && queueCount > seenQueue) {
      setBanner({ id: `briefing-${game.turn}`, kind: "briefing", title: t("home.notifBriefing") });
      return;
    }
    if (seenQueue === null) setSeenQueue(queueCount);
  }, [game, queueCount, seenQueue, t]);

  if (!game) return null;

  const isHome = location.pathname === "/game/home";

  return (
    <IPadFrame>
      <IPadStatusBar
        turn={game.turn}
        chapter={game.chapter}
        approval={game.politics.approval}
        coalition={game.politics.coalitionStability}
        seats={governmentSeats()}
        queueCount={queueCount}
        menuOpen={menuOpen}
        isHome={isHome}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {isHome ? (
        <HomeScreen />
      ) : (
        <main
          id="main"
          key={location.pathname}
          className="app-surface relative flex-1 min-h-0 overflow-y-auto bg-paper"
        >
          {!online && (
            <p role="status" className="bg-paper-deep border-b border-rule text-center text-xs py-1.5 text-muted px-4">
              {t("common.offline")}
            </p>
          )}
          <div className="px-4 sm:px-8 py-7 max-w-6xl w-full mx-auto min-w-0">
            {location.pathname !== "/game/office" && (
              <Link
                to="/game/home"
                className="inline-flex items-center gap-1.5 min-h-[24px] text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-gold-bright transition-colors mb-5"
              >
                <span aria-hidden="true" className="h-px w-4 bg-gold/60" />
                {t("nav.home")}
              </Link>
            )}
            <Outlet />
          </div>
        </main>
      )}

      {/* scene cut: every screen change passes through midnight */}
      <motion.div
        key={`cut-${location.pathname}`}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[45] bg-chrome-deep"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />

      <NotificationBanner banner={banner} onDismiss={() => setBanner(null)} />

      {menuOpen && (
        <GameNavigation
          sections={NAV_SECTIONS}
          queueCount={queueCount}
          dateLabel={dateLabel(game.turn, lang)}
          chapterLabel={chapterTitle(game.chapter, lang)}
          onClose={() => setMenuOpen(false)}
          onExit={() => {
            setMenuOpen(false);
            navigate("/campaigns");
          }}
        />
      )}
    </IPadFrame>
  );
}
