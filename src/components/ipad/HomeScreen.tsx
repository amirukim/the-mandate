import { Link } from "react-router-dom";
import { SceneBackground } from "../game/SceneBackground";
import { ENVIRONMENTS } from "../../data/art";
import { prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";

/**
 * The iPad home screen (decision D-07): the office plate as the live
 * wallpaper, app icons over it, and the dock. Policy and Budget arrive with
 * their Phase 7 apps and are shown as locked tiles until then.
 */

interface HomeApp {
  id: string;
  to: string;
  icon: string;
  labelKey: string;
  soon?: boolean;
}

const APPS: HomeApp[][] = [
  [
    { id: "briefing", to: "/game/briefing", icon: "briefing", labelKey: "nav.briefing" },
    { id: "messages", to: "/game/messages", icon: "messages", labelKey: "nav.messages" },
    { id: "cabinet", to: "/game/cabinet", icon: "cabinet", labelKey: "nav.cabinet" },
    { id: "parliament", to: "/game/parliament", icon: "parliament", labelKey: "nav.parliament" },
    { id: "economy", to: "/game/economy", icon: "economy", labelKey: "nav.economy" },
    { id: "overview", to: "/game/overview", icon: "overview", labelKey: "nav.overview" },
  ],
  [
    { id: "states", to: "/game/states", icon: "states", labelKey: "nav.states" },
    { id: "parties", to: "/game/parties", icon: "parties", labelKey: "nav.parties" },
    { id: "diplomacy", to: "/game/diplomacy", icon: "diplomacy", labelKey: "nav.diplomacy" },
    { id: "security", to: "/game/security", icon: "security", labelKey: "nav.security" },
    { id: "news", to: "/game/news", icon: "news", labelKey: "nav.news" },
    { id: "history", to: "/game/history", icon: "history", labelKey: "nav.history" },
  ],
  [
    { id: "policy", to: "/game/policy", icon: "policy", labelKey: "nav.policyDossier" },
    { id: "budget", to: "/game/budget", icon: "budget", labelKey: "nav.budgetOffice" },
    { id: "saves", to: "/game/saves", icon: "saves", labelKey: "nav.saves" },
    { id: "settings", to: "/game/settings", icon: "settings", labelKey: "nav.settings" },
    { id: "office", to: "/game/office", icon: "briefing", labelKey: "nav.office" },
  ],
];

const DOCK: HomeApp[] = [
  { id: "dock-briefing", to: "/game/briefing", icon: "briefing", labelKey: "nav.briefing" },
  { id: "dock-messages", to: "/game/messages", icon: "messages", labelKey: "nav.messages" },
  { id: "dock-office", to: "/game/office", icon: "briefing", labelKey: "nav.office" },
  { id: "dock-settings", to: "/game/settings", icon: "settings", labelKey: "nav.settings" },
];

function AppIcon({ app, autoFocus }: { app: HomeApp; autoFocus?: boolean }) {
  const { t } = useT();
  const inner = (
    <>
      <img
        src={`/art/pixel/icons/icon-${app.icon}.png`}
        alt=""
        width={64}
        height={64}
        loading="lazy"
        className={cn(
          "w-16 h-16 pixelated rounded-[9px] shadow-lift transition-transform",
          !app.soon && "group-hover:scale-105 group-active:scale-95",
        )}
      />
      <span
        className={cn(
          "font-pixel text-[10px] leading-tight text-center text-paper [text-shadow:0_1px_0_rgb(0_0_0/0.7)]",
          app.soon && "opacity-70",
        )}
      >
        {t(app.labelKey)}
        {app.soon && <span className="block text-gold text-[8px]">{t("home.soon")}</span>}
      </span>
    </>
  );
  const cls = "group flex flex-col items-center gap-1.5 w-20 focus-visible:outline-none";
  if (app.soon) {
    return (
      <button
        type="button"
        autoFocus={autoFocus}
        disabled
        aria-label={`${t(app.labelKey)} — ${t("home.soon")}`}
        className={cn(cls, "cursor-not-allowed opacity-60")}
        title={t("home.soon")}
      >
        {inner}
      </button>
    );
  }
  return (
    <Link to={app.to} autoFocus={autoFocus} className={cls}>
      {inner}
    </Link>
  );
}

export function HomeScreen() {
  const { t } = useT();
  const reduced = prefersReducedMotion();

  return (
    <div className="app-surface relative flex-1 min-h-0 overflow-hidden">
      {/* wallpaper: the office plate, drifting slowly */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className={cn("absolute inset-0", !reduced && "animate-[home-drift_36s_ease-in-out_infinite_alternate]")}
        >
          <SceneBackground art={ENVIRONMENTS.officeHub} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/10 to-ink/70" />
      </div>

      {/* icon grid */}
      <div className="relative z-10 h-full overflow-y-auto px-6 pt-24 pb-36">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-6 max-w-3xl mx-auto">
          {APPS.flat().map((app, i) => (
            <AppIcon key={app.id} app={app} autoFocus={i === 0} />
          ))}
        </div>
      </div>

      {/* dock */}
      <nav
        aria-label={t("nav.dock")}
        className="absolute z-20 inset-x-0 bottom-5 flex justify-center"
      >
        <div className="flex items-end gap-5 px-6 py-3 rounded-[18px] bg-navy/70 border border-gold/25 backdrop-blur-sm shadow-lift">
          {DOCK.map((app) => (
            <Link
              key={app.id}
              to={app.to}
              aria-label={t(app.labelKey)}
              className="group flex flex-col items-center focus-visible:outline-none"
            >
              <img
                src={`/art/pixel/icons/icon-${app.icon}.png`}
                alt=""
                width={52}
                height={52}
                className="w-[52px] h-[52px] pixelated rounded-[8px] transition-transform group-hover:scale-110 group-active:scale-95"
              />
              <span className="font-pixel text-[8px] text-paper/85 [text-shadow:0_1px_0_rgb(0_0_0/0.7)] mt-1">
                {t(app.labelKey)}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
