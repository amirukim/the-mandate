import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameStore } from "../stores/game-store";
import { useAuthStore } from "../stores/auth-store";
import { loadLocal } from "../services/save-service";
import { MENU_ART } from "../data/art";
import { PixelScene } from "../components/game/PixelScene";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";

/**
 * The title screen, cut to Suzerain's measure: one painted key art, one logo,
 * a short stack of quiet menu items, and nothing else. No cards, no pitch —
 * the mood does the selling.
 */
function Skyline() {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[46vh] w-full pointer-events-none"
    >
      {/* far layer: office blocks */}
      <g fill="var(--gold)" opacity="0.16">
        <rect x="0" y="210" width="1440" height="110" />
        <rect x="60" y="170" width="70" height="150" />
        <rect x="150" y="196" width="46" height="124" />
        <rect x="1230" y="184" width="64" height="136" />
        <rect x="1310" y="160" width="40" height="160" />
        <rect x="1362" y="198" width="58" height="122" />
        <rect x="330" y="200" width="80" height="120" />
        <rect x="1080" y="196" width="96" height="124" />
      </g>
      {/* mid layer: the domed complex and its minarets */}
      <g fill="var(--ink)" opacity="0.9">
        <rect x="560" y="236" width="320" height="84" />
        <path d="M640 236c0-44 36-80 80-80s80 36 80 80z" />
        <rect x="716" y="132" width="8" height="30" />
        <rect x="544" y="150" width="14" height="170" />
        <path d="M544 150c0-14 3-24 7-24s7 10 7 24z" />
        <rect x="882" y="150" width="14" height="170" />
        <path d="M882 150c0-14 3-24 7-24s7 10 7 24z" />
        <rect x="470" y="252" width="60" height="68" />
        <rect x="910" y="252" width="60" height="68" />
      </g>
      {/* near layer: boulevard edge */}
      <g fill="var(--ink)" opacity="0.98">
        <rect x="0" y="278" width="1440" height="42" />
        <rect x="180" y="248" width="120" height="72" />
        <rect x="1140" y="256" width="140" height="64" />
      </g>
      {/* horizon light */}
      <rect x="0" y="276" width="1440" height="1.5" fill="var(--gold)" opacity="0.65" />
    </svg>
  );
}

export function MainMenu() {
  const continueGame = useGameStore((s) => s.continueGame);
  const closeCampaign = useGameStore((s) => s.closeCampaign);
  const game = useGameStore((s) => s.game);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { t } = useT();

  const hasAutosave = loadLocal(0) !== null;

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  interface Item {
    label: string;
    to?: string;
    onClick?: () => void;
    accent?: boolean;
  }

  const items: Item[] = [
    ...(hasAutosave
      ? [
          {
            label: t("menu.continueCampaign"),
            accent: true,
            onClick: () => {
              closeCampaign();
              if (continueGame()) navigate("/game/briefing");
            },
          },
        ]
      : []),
    { label: t("menu.newCampaign"), to: "/new" },
    { label: t("menu.load"), to: "/campaigns" },
    { label: t("menu.signIn"), to: "/login" },
    { label: t("menu.settings"), to: "/settings" },
  ];

  return (
    <div className="min-h-screen atmosphere text-ink relative overflow-hidden flex flex-col">
      {/* painted key art, breathing slowly — now in pixels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <Skyline />
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.05] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        >
          <PixelScene src={MENU_ART} width={480} height={200} className="art-warm" />
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

        {/* the menu: a short stack of quiet lines */}
        <motion.nav {...fade(0.28)} aria-label="Main menu" className="mt-8 max-w-md">
          <ul>
            {items.map((item) => {
              const inner = (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-px w-0 group-hover:w-7 transition-all duration-200 bg-gold shrink-0",
                      item.accent && "bg-gold-bright",
                    )}
                  />
                  <span
                    className={cn(
                      "display text-[1.45rem] sm:text-[1.7rem] font-semibold tracking-tight transition-colors",
                      item.accent ? "text-gold-bright" : "text-ink/90 group-hover:text-gold-bright",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              );
              const cls =
                "group flex items-center gap-0 py-2.5 text-left transition-colors focus-visible:outline-none";
              return (
                <li key={item.label}>
                  {item.to ? (
                    <Link to={item.to} className={cn(cls, "focus-visible:[&>span:first-child]:w-7")}>
                      {inner}
                    </Link>
                  ) : (
                    <button type="button" onClick={item.onClick} className={cn(cls, "w-full")}>
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {user && (
            <p className="mt-7 text-[11px] uppercase tracking-[0.12em] text-muted">
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
