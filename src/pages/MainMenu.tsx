import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameStore } from "../stores/game-store";
import { useAuthStore } from "../stores/auth-store";
import { loadLocal } from "../services/save-service";
import { ENVIRONMENTS } from "../data/art";
import { SceneBackground } from "../components/game/SceneBackground";
import { PixelEmblem } from "../components/menu/PixelEmblem";
import { MenuAmbience } from "../components/menu/MenuAmbience";
import { prefersReducedMotion } from "../hooks/usePortalOverlay";
import { pmAvatarDataUrl } from "../data/pixel-portraits";
import { playSfx } from "../engine/sound";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";
import type { GameSave } from "../types/game";

/**
 * The title screen (v3a phase 5): a game start screen. First visit shows a
 * short title-card ("press any key"); the menu panel carries a pixel cursor,
 * hotkeys (Up/Down/Enter, N, C), the PM portrait on the Continue save card,
 * Credits and a version string. The ambience layer breathes over the key
 * art; the scrim is narrowed so the art shows its real colours.
 */

const APP_VERSION = "0.2.0-v3a";
const TITLECARD_KEY = "mtm:titlecard";

interface Item {
  labelKey: "menu.continueCampaign" | "menu.newCampaign" | "menu.load" | "menu.credits" | "menu.signIn" | "menu.settings";
  icon: string;
  to?: string;
  onClick?: () => void;
  accent?: boolean;
  hotkey?: string;
}

export function MainMenu() {
  const continueGame = useGameStore((s) => s.continueGame);
  const closeCampaign = useGameStore((s) => s.closeCampaign);
  const game = useGameStore((s) => s.game);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { t, lang } = useT();
  const reduced = prefersReducedMotion();

  const autosave: GameSave | null = loadLocal(0);
  const hasAutosave = autosave !== null;
  const [titleCard, setTitleCard] = useState(() => localStorage.getItem(TITLECARD_KEY) === null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const rowRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([]);

  const dismissTitleCard = () => {
    setTitleCard(false);
    try {
      localStorage.setItem(TITLECARD_KEY, "1");
    } catch {
      /* private mode: the card returns next visit — harmless */
    }
    playSfx("confirm");
  };

  // press-any-key: any key or click dismisses
  useEffect(() => {
    if (!titleCard) return;
    const onKey = () => dismissTitleCard();
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleCard]);

  const items: Item[] = [
    ...(hasAutosave
      ? [
          {
            labelKey: "menu.continueCampaign",
            icon: "briefing",
            accent: true,
            hotkey: "C",
            onClick: () => {
              closeCampaign();
              if (continueGame()) navigate("/game/home");
            },
          } as Item,
        ]
      : []),
    { labelKey: "menu.newCampaign", icon: "policy", to: "/new", hotkey: "N" },
    { labelKey: "menu.load", icon: "saves", to: "/campaigns" },
    { labelKey: "menu.credits", icon: "news", onClick: () => setCreditsOpen((v) => !v) },
    { labelKey: "menu.signIn", icon: "diplomacy", to: "/login" },
    { labelKey: "menu.settings", icon: "settings", to: "/settings" },
  ];

  const focusRow = (index: number) => {
    const clamped = (index + items.length) % items.length;
    rowRefs.current[clamped]?.focus();
    playSfx("blip");
  };

  // hotkeys: Up/Down move focus, N = new, C = continue (window-level so the
  // keys work wherever focus sits on the menu page)
  const onKeyDown = (e: KeyboardEvent) => {
    if (titleCard || creditsOpen) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const focused = rowRefs.current.findIndex((r) => r === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusRow(focused < 0 ? 0 : focused + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusRow(focused < 0 ? items.length - 1 : focused - 1);
    } else if (e.key.toLowerCase() === "n") {
      navigate("/new");
    } else if (e.key.toLowerCase() === "c" && hasAutosave) {
      closeCampaign();
      if (continueGame()) navigate("/game/home");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleCard, creditsOpen, hasAutosave]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="min-h-screen atmosphere text-ink relative overflow-hidden flex flex-col">
      {/* authored key art, breathing slowly — ambience layers over it */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          animate={reduced ? {} : { scale: [1, 1.05] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        >
          <SceneBackground art={ENVIRONMENTS.menuKeyArt} />
        </motion.div>
        {/* the ambience: stars, clouds, window lights, the bird, dusk tint */}
        <MenuAmbience />
        {/* narrow left scrim behind the text column only — the art keeps its colours */}
        <div className="absolute inset-y-0 left-0 w-[46%] bg-gradient-to-r from-paper via-paper/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-paper/90 to-transparent" />
      </div>

      {/* the title card: first visit only, any key dismisses */}
      {titleCard && (
        <button
          type="button"
          onClick={dismissTitleCard}
          aria-label={t("menu.pressAnyKey")}
          className={cn(
            "fixed inset-0 z-50 bg-ink flex flex-col items-center justify-center gap-8 text-center cursor-pointer",
            !reduced && "animate-[titlecard-out_600ms_ease_2.4s_forwards]",
          )}
        >
          <PixelEmblem scale={6} />
          <p className="display text-paper text-4xl sm:text-5xl font-semibold leading-tight">
            Malaysia
            <span className="block text-gold italic font-normal">The Mandate</span>
          </p>
          <p className="font-pixel text-[16px] text-paper/90 animate-[twinkle_2.2s_ease-in-out_infinite]">
            {t("menu.pressAnyKey")}
          </p>
        </button>
      )}

      {/* quiet top metadata */}
      <motion.header {...fade(0)} className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between gap-4">
          <p className="kicker kicker-gold">{t("menu.kicker")}</p>
          {/* fixed: readable on the dark sky */}
          <p className="font-pixel text-[8px] text-paper/90 [text-shadow:0_1px_0_rgb(0_0_0/0.8)]">
            {t("menu.tag")}
          </p>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 flex flex-col justify-center py-6 min-h-0">
        <motion.div {...fade(0.08)} className="flex items-center gap-4">
          <PixelEmblem scale={4} />
          <h1 className="display font-semibold leading-[0.92] text-[clamp(2.5rem,7vw,5.2rem)]">
            Malaysia
            <span className="block text-gold-bright italic font-normal tracking-tight">The Mandate</span>
          </h1>
        </motion.div>

        {/* the menu: pixel-chrome panel with a cursor on the focused row */}
        <motion.nav {...fade(0.28)} aria-label="Main menu" className="mt-8 max-w-md">
          <ul
            className="bg-navy/80 border-2 border-gold/40 rounded-[4px] backdrop-blur-sm shadow-lift p-2 space-y-1"
          >
            {items.map((item, index) => {
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
                  {item.hotkey && (
                    <span
                      aria-hidden="true"
                      className="font-pixel text-[8px] text-paper/60 border border-paper/30 rounded-[2px] px-1 py-0.5 shrink-0"
                    >
                      {item.hotkey}
                    </span>
                  )}
                  {/* the pixel cursor: appears on hover and keyboard focus */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "font-pixel text-[16px] text-gold shrink-0 w-[24px] text-right opacity-0 transition-opacity",
                      "group-hover:opacity-100 group-focus-visible:opacity-100",
                    )}
                  >
                    ▶
                  </span>
                </>
              );
              const cls = cn(
                "group flex items-center gap-3 w-full min-h-[56px] px-2.5 rounded-[4px] text-left transition-colors",
                item.accent
                  ? "bg-gold/15 hover:bg-gold/25 border-2 border-gold/50"
                  : "hover:bg-paper/10 border-2 border-transparent focus-visible:border-paper/40 focus-visible:outline-none",
              );
              return (
                <li key={item.labelKey}>
                  {item.to ? (
                    <Link
                      to={item.to}
                      ref={(el) => {
                        rowRefs.current[index] = el;
                      }}
                      onClick={() => playSfx("tap")}
                      onMouseEnter={() => playSfx("hover")}
                      className={cls}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      ref={(el) => {
                        rowRefs.current[index] = el;
                      }}
                      onClick={() => {
                        playSfx(item.labelKey === "menu.credits" ? "open" : "confirm");
                        item.onClick?.();
                      }}
                      onMouseEnter={() => playSfx("hover")}
                      className={cls}
                    >
                      {inner}
                    </button>
                  )}
                  {item.accent && autosave && (
                    <div className="px-2.5 pb-1.5 -mt-0.5 flex items-center gap-2.5 [text-shadow:0_1px_0_rgb(0_0_0/0.7)]">
                      {autosave.state.avatar && (
                        <img
                          src={pmAvatarDataUrl(autosave.state.avatar)}
                          alt=""
                          width={28}
                          height={28}
                          className="pixelated rounded-[3px] border border-paper/30"
                        />
                      )}
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
              {t("menu.signIn") === "Sign in" ? "Signed in: " : "Telah log masuk: "}
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

          {/* credits panel */}
          {creditsOpen && (
            <div role="dialog" aria-label={t("menu.credits")} className="mt-4 bg-navy/85 border-2 border-gold/50 rounded-[4px] p-5 backdrop-blur-sm">
              <p className="font-pixel text-[16px] text-gold">{t("menu.credits")}</p>
              <dl className="mt-3 space-y-2 text-xs text-paper/90">
                <div>
                  <dt className="kicker text-[10px] text-paper/60">{lang === "ms" ? "Reka bentuk, kod & seni" : "Design, code & art"}</dt>
                  <dd>{lang === "ms" ? "Studio Jalur — pasukan rekaan" : "Studio Jalur — a fictional team"}</dd>
                </div>
                <div>
                  <dt className="kicker text-[10px] text-paper/60">{lang === "ms" ? "Fon" : "Typefaces"}</dt>
                  <dd>Fraunces · Public Sans · Silkscreen (OFL)</dd>
                </div>
                <div>
                  <dt className="kicker text-[10px] text-paper/60">{lang === "ms" ? "Geografi" : "Geography"}</dt>
                  <dd>Natural Earth (public domain)</dd>
                </div>
              </dl>
              <p className="text-[11px] text-paper/60 mt-3 leading-relaxed">
                {lang === "ms"
                  ? "Semua watak, parti dan keputusan adalah rekaan."
                  : "Every person, party and result is fiction. No real politician's likeness is depicted."}
              </p>
            </div>
          )}
        </motion.nav>
      </main>

      {/* disclaimers + version */}
      <motion.footer {...fade(0.4)} className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 pb-6">
        <p className="text-[11px] text-muted leading-relaxed max-w-xl">{t("menu.footerFiction")}</p>
        <p className="text-[11px] text-muted mt-1">{t("menu.footerOffline")}</p>
        <p className="font-pixel text-[8px] text-muted mt-2">v{APP_VERSION}</p>
      </motion.footer>
    </div>
  );
}
