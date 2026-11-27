import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useGameStore } from "../stores/game-store";
import { useAuthStore } from "../stores/auth-store";
import { loadLocal } from "../services/save-service";
import { ENVIRONMENTS } from "../data/art";
import { SceneBackground } from "../components/game/SceneBackground";
import { prefersReducedMotion } from "../hooks/usePortalOverlay";
import { attachSoundUnlock } from "../engine/sound";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";
import type { GameSave } from "../types/game";

/**
 * The title screen (v2 menu revamp): the authored key art and the logo lockup
 * stay, but the menu is now a pixel-chrome panel — Silkscreen labels on app
 * icons, a save-status chip on Continue — the same chrome language as the iPad
 * shell's dock. Keyboard and touch rows are 44px or taller.
 */

interface Item {
  labelKey: "menu.continueCampaign" | "menu.newCampaign" | "menu.load" | "menu.signIn" | "menu.settings";
  icon: string;
  to?: string;
  onClick?: () => void;
  accent?: boolean;
}

export function MainMenu() {
  const continueGame = useGameStore((s) => s.continueGame);
  const closeCampaign = useGameStore((s) => s.closeCampaign);
  const game = useGameStore((s) => s.game);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { t } = useT();

  const autosave: GameSave | null = loadLocal(0);
  const hasAutosave = autosave !== null;

  useEffect(() => attachSoundUnlock(), []);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  const items: Item[] = [
    ...(hasAutosave
      ? [
          {
            labelKey: "menu.continueCampaign",
            icon: "briefing",
            accent: true,
            onClick: () => {
              closeCampaign();
              if (continueGame()) navigate("/game/home");
            },
          } as Item,
        ]
      : []),
    { labelKey: "menu.newCampaign", icon: "policy", to: "/new" },
    { labelKey: "menu.load", icon: "saves", to: "/campaigns" },
    { labelKey: "menu.signIn", icon: "diplomacy", to: "/login" },
    { labelKey: "menu.settings", icon: "settings", to: "/settings" },
  ];

  return (
    <div className="min-h-screen atmosphere text-ink relative overflow-hidden flex flex-col">
      {/* authored key art, breathing slowly — pixels over a vector fallback */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          animate={prefersReducedMotion() ? {} : { scale: [1, 1.05] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        >
          <SceneBackground art={ENVIRONMENTS.menuKeyArt} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/70 to-paper/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
      </div>

      {/* quiet top metadata, the Suzerain version line */}
      <motion.header {...fade(0)} className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between gap-4">
          <p className="kicker kicker-gold">{t("menu.kicker")}</p>
          <p className="kicker hidden sm:block">{t("menu.tag")}</p>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 flex flex-col justify-center py-6 min-h-0">
        <motion.h1
          {...fade(0.08)}
          className="display font-semibold leading-[0.92] text-[clamp(2.5rem,7vw,5.2rem)]"
        >
          Malaysia
          <span className="block text-gold-bright italic font-normal tracking-tight">The Mandate</span>
        </motion.h1>

        <motion.div {...fade(0.16)} className="mt-5 w-56">
          {/* the Jalur ribbon, worn as a lapel */}
          <div className="jalur-stripes h-[28px] border border-rule" />
        </motion.div>

        {/* the menu: a pixel-chrome panel, dock language */}
        <motion.nav {...fade(0.28)} aria-label="Main menu" className="mt-8 max-w-md">
          <ul className="bg-navy/75 border border-gold/30 rounded-[14px] backdrop-blur-sm shadow-lift p-2 space-y-1">
            {items.map((item) => {
              const inner = (
                <>
                  <img
                    src={`/art/pixel/icons/icon-${item.icon}.png`}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    className={cn("w-11 h-11 pixelated rounded-[7px] shrink-0", !item.accent && "opacity-90")}
                  />
                  <span
                    className={cn(
                      "font-pixel text-[16px] leading-tight flex-1 [text-shadow:0_1px_0_rgb(0_0_0/0.75)]",
                      item.accent ? "text-gold" : "text-paper",
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                  <span aria-hidden="true" className={cn("font-pixel text-[16px] shrink-0 [text-shadow:0_1px_0_rgb(0_0_0/0.75)]", item.accent ? "text-gold" : "text-paper/70")}>
                    →
                  </span>
                </>
              );
              const cls = cn(
                "group flex items-center gap-3 w-full min-h-[56px] px-2.5 rounded-[9px] text-left transition-colors",
                item.accent
                  ? "bg-gold/15 hover:bg-gold/25 border border-gold/40"
                  : "hover:bg-paper/10 border border-transparent focus-visible:border-paper/40 focus-visible:outline-none",
              );
              return (
                <li key={item.labelKey}>
                  {item.to ? (
                    <Link to={item.to} className={cls}>
                      {inner}
                    </Link>
                  ) : (
                    <button type="button" onClick={item.onClick} className={cls}>
                      {inner}
                    </button>
                  )}
                  {item.accent && autosave && (
                    <div className="px-2.5 pb-1.5 -mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 [text-shadow:0_1px_0_rgb(0_0_0/0.7)]">
                      <span className="font-pixel text-[8px] text-paper">{autosave.summary.campaignName}</span>
                      <span className="font-pixel text-[8px] text-paper/70">{autosave.summary.dateLabel}</span>
                      <span className="font-pixel text-[8px] text-gold">
                        {autosave.summary.approval}% {t("common.approval")}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {user && (
            <p className="mt-5 text-[11px] uppercase tracking-[0.12em] text-muted">
              {t("menu.signIn") === "Sign in"
                ? "Signed in: "
                : "Telah log masuk: "}
              <span className="text-ink normal-case tracking-normal font-medium">{user.name}</span>
              {user.provider === "local" && (t("menu.signIn") === "Sign in" ? " (this device)" : " (peranti ini)")}
              <button
                type="button"
                onClick={() => logout()}
                className="ml-3 uppercase tracking-[0.14em] text-gold-text hover:text-gold-bright underline underline-offset-4"
              >
                {t("common.signOut")}
              </button>
            </p>
          )}

          {game && (
            <p className="mt-4 text-xs text-muted max-w-prose">
              {t("menu.signIn") === "Sign in"
                ? "A campaign is currently open. Starting or continuing another one keeps the autosave separate per slot."
                : "Satu kempen sedang terbuka. Memulakan atau menyambung kempen lain mengekalkan auto-simpan berasingan mengikut slot."}
            </p>
          )}
        </motion.nav>
      </main>

      {/* disclaimers: the small print, bottom edges */}
      <motion.footer {...fade(0.4)} className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 pb-6">
        <p className="text-[11px] text-muted leading-relaxed max-w-xl">{t("menu.footerFiction")}</p>
        <p className="text-[11px] text-muted mt-1">{t("menu.footerOffline")}</p>
      </motion.footer>
    </div>
  );
}
