import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameStore } from "../stores/game-store";
import { useAuthStore } from "../stores/auth-store";
import { loadLocal } from "../services/save-service";
import { MENU_ART } from "../data/art";
import { useT } from "../i18n/store";

/**
 * Procedural silhouette of the Putrajaya federal district: the Putra dome,
 * minarets, ministry blocks and the boulevard. Drawn, not photographic, so the
 * title screen stays a work of fiction about a real place.
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
      <g fill="rgb(182 154 91 / 0.16)">
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
      <g fill="rgb(32 38 49 / 0.95)">
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
      <g fill="rgb(8 11 17 / 0.98)">
        <rect x="0" y="278" width="1440" height="42" />
        <rect x="180" y="248" width="120" height="72" />
        <rect x="1140" y="256" width="140" height="64" />
      </g>
      {/* horizon light */}
      <rect x="0" y="276" width="1440" height="1.5" fill="rgb(182 154 91 / 0.65)" />
    </svg>
  );
}

const SECONDARY = [
  { to: "/campaigns", key: "menu.load" },
  { to: "/login", key: "menu.signIn" },
  { to: "/settings", key: "menu.settings" },
] as const;

export function MainMenu() {
  const continueGame = useGameStore((s) => s.continueGame);
  const closeCampaign = useGameStore((s) => s.closeCampaign);
  const game = useGameStore((s) => s.game);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [artOk, setArtOk] = useState(true);

  const hasAutosave = loadLocal(0) !== null;
  const { t } = useT();

  const SCENARIO = [
    { k: t("menu.scenario"), v: t("menu.scenarioValue") },
    { k: t("menu.chamber"), v: t("menu.chamberValue") },
    { k: t("menu.government"), v: t("menu.governmentValue") },
    { k: t("menu.condition"), v: t("menu.conditionValue") },
  ];

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="min-h-screen atmosphere text-ink relative overflow-hidden flex flex-col">
      {/* Illustrated Putrajaya backdrop; the drawn skyline stands in if it fails to load. */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {artOk ? (
          <img
            src={MENU_ART}
            alt=""
            onError={() => setArtOk(false)}
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        ) : (
          <Skyline />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/70 to-paper/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
      </div>

      {/* top metadata bar */}
      <motion.header {...fade(0)} className="relative z-10 border-b border-rule/70">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between gap-4">
          <p className="kicker kicker-gold">{t("menu.kicker")}</p>
          <p className="kicker hidden sm:block">{t("menu.tag")}</p>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 pt-14 sm:pt-20">
        <motion.h1 {...fade(0.08)} className="display font-semibold leading-[0.92] text-[clamp(2.8rem,9vw,6.5rem)]">
          Malaysia
          <span className="block text-gold-bright italic font-normal tracking-tight">The Mandate</span>
        </motion.h1>

        <motion.div {...fade(0.16)} className="mt-7 max-w-xl">
          <div className="rule-gold" />
          <p className="mt-5 text-[0.95rem] sm:text-base leading-relaxed text-ink/85 max-w-prose">
            {t("menu.lede")}
          </p>
        </motion.div>

        {/* scenario card */}
        <motion.dl {...fade(0.24)} className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule/60 border border-rule/60 max-w-2xl">
          {SCENARIO.map((row) => (
            <div key={row.k} className="bg-paper/70 backdrop-blur-[2px] px-3.5 py-3">
              <dt className="kicker text-[10px]">{row.k}</dt>
              <dd className="text-sm font-medium mt-1 text-ink">{row.v}</dd>
            </div>
          ))}
        </motion.dl>

        {/* primary actions */}
        <motion.nav {...fade(0.32)} aria-label="Main menu" className="mt-12 max-w-2xl">
          <ul className="border-t border-rule">
            {hasAutosave && (
              <li className="border-b border-rule">
                <button
                  type="button"
                  onClick={() => {
                    closeCampaign();
                    if (continueGame()) navigate("/game/briefing");
                  }}
                  className="group w-full text-left py-5 flex items-baseline gap-4 text-gold-bright hover:text-ink transition-colors"
                >
                  <span className="tabular text-xs text-muted group-hover:text-gold">01</span>
                  <span className="display text-2xl sm:text-3xl font-semibold group-hover:translate-x-1 transition-transform">
                    {t("menu.continueCampaign")}
                  </span>
                  <span aria-hidden="true" className="flex-1 border-t border-rule group-hover:border-gold transition-colors translate-y-[-6px]" />
                </button>
              </li>
            )}
            <li className="border-b border-rule">
              <Link
                to="/new"
                className="group py-5 flex items-baseline gap-4 text-ink hover:text-gold-bright transition-colors"
              >
                <span className="tabular text-xs text-muted group-hover:text-gold">02</span>
                <span className="display text-2xl sm:text-3xl font-semibold group-hover:translate-x-1 transition-transform">
                  {t("menu.newCampaign")}
                </span>
                <span aria-hidden="true" className="flex-1 border-t border-rule group-hover:border-gold transition-colors translate-y-[-6px]" />
              </Link>
            </li>
          </ul>

          <ul className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
            {SECONDARY.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-gold-bright transition-colors"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
            {user && (
              <li className="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-muted">
                <span>
                  {t("menu.signIn") === "Sign in" ? "Signed in: " : "Telah log masuk: "}
                  <span className="text-ink normal-case tracking-normal font-medium">{user.name}</span>
                  {user.provider === "local" && (t("menu.signIn") === "Sign in" ? " (this device)" : " (peranti ini)")}
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="uppercase tracking-[0.14em] text-gold-text hover:text-gold-bright underline underline-offset-4"
                >
                  {t("common.signOut")}
                </button>
              </li>
            )}
          </ul>

          {game && (
            <p className="mt-6 text-sm text-muted max-w-prose">
              {t("menu.signIn") === "Sign in"
                ? "A campaign is currently open. Starting or continuing another one keeps the autosave separate per slot."
                : "Satu kempen sedang terbuka. Memulakan atau menyambung kempen lain mengekalkan auto-simpan berasingan mengikut slot."}
            </p>
          )}
        </motion.nav>
      </main>

      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 pt-24 pb-8">
        <div className="border-t border-rule pt-4 flex flex-wrap gap-x-8 gap-y-2 justify-between">
          <p className="text-[11px] text-muted leading-relaxed max-w-xl">
            {t("menu.footerFiction")}
          </p>
          <p className="text-[11px] text-muted">
            {t("menu.footerOffline")}
          </p>
        </div>
      </footer>
    </div>
  );
}
