import { useNavigate } from "react-router-dom";
import { useUiStore } from "../stores/ui-store";
import { useAuthStore } from "../stores/auth-store";
import { useGameStore } from "../stores/game-store";
import { useLocale, useT } from "../i18n/store";
import { playSfx, setSoundMuted, setSoundVolume, useSoundPrefs } from "../engine/sound";
import { PRIMER } from "../data/historical-data/primer";
import { SAVE_VERSION } from "../types/game";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";

function clearLocalData(): void {
  localStorage.removeItem("mtm:slots");
  localStorage.removeItem("mtm:profile");
  localStorage.removeItem("mtm:users");
  for (const slot of [0, 1, 2, 3]) localStorage.removeItem(`mtm:sync:${slot}`);
}

export function Settings() {
  const theme = useUiStore((s) => s.theme);
  const bodySize = useUiStore((s) => s.bodySize);
  const scanlines = useUiStore((s) => s.scanlines);
  const setTheme = useUiStore((s) => s.setTheme);
  const setBodySize = useUiStore((s) => s.setBodySize);
  const setScanlines = useUiStore((s) => s.setScanlines);
  const sound = useSoundPrefs();
  const lang = useLocale((s) => s.lang);
  const setLang = useLocale((s) => s.setLang);
  const { t, tf } = useT();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const closeCampaign = useGameStore((s) => s.closeCampaign);
  const navigate = useNavigate();

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader
        kicker={t("settings.kicker")}
        title={t("settings.title")}
        lead={tf("settings.lead", { v: SAVE_VERSION })}
      />

      <Panel kicker={t("settings.appearance")} title={t("settings.languageTitle")}>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t("settings.languageAria")}>
          {(
            [
              { id: "en" as const, label: t("settings.langEn"), desc: t("settings.langEnDesc") },
              { id: "ms" as const, label: t("settings.langMs"), desc: t("settings.langMsDesc") },
            ]
          ).map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex gap-3 items-start border rounded-[2px] p-3 bg-paper-deep min-w-48",
                lang === option.id ? "border-gold" : "border-rule",
              )}
            >
              <input
                type="radio"
                name="language"
                checked={lang === option.id}
                onChange={() => setLang(option.id)}
                className="mt-0.5 accent-[var(--gold)]"
              />
              <span>
                <span className="text-sm font-semibold block">{option.label}</span>
                <span className="text-xs text-muted">{option.desc}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">{t("settings.langNote")}</p>
      </Panel>

      <Panel kicker={t("settings.appearance")} title={t("settings.theme")} className="mt-4">
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t("settings.themeAria")}>
          {(
            [
              { id: "night", label: t("settings.themeNight"), desc: t("settings.themeNightDesc") },
              { id: "paper", label: t("settings.themePaper"), desc: t("settings.themePaperDesc") },
            ] as const
          ).map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex gap-3 items-start border rounded-[2px] p-3 bg-paper-deep min-w-48",
                theme === option.id ? "border-gold" : "border-rule",
              )}
            >
              <input
                type="radio"
                name="theme"
                checked={theme === option.id}
                onChange={() => setTheme(option.id)}
                className="mt-0.5 accent-[var(--gold)]"
              />
              <span>
                <span className="text-sm font-semibold block">{option.label}</span>
                <span className="text-xs text-muted">{option.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </Panel>

      <Panel kicker={t("settings.appearance")} title={t("settings.textTitle")} className="mt-4">
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t("settings.textAria")}>
          {(
            [
              { id: "base", label: t("settings.textStandard") },
              { id: "large", label: t("settings.textLarger") },
            ] as const
          ).map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex gap-2 items-center border rounded-[2px] px-3 py-2 bg-paper-deep",
                bodySize === option.id ? "border-gold" : "border-rule",
              )}
            >
              <input
                type="radio"
                name="body-size"
                checked={bodySize === option.id}
                onChange={() => setBodySize(option.id)}
                className="accent-[var(--gold)]"
              />
              <span className="text-sm font-semibold">{option.label}</span>
            </label>
          ))}
        </div>

        {/* scanline overlay: restrained, off by default */}
        <button
          type="button"
          aria-pressed={scanlines}
          onClick={() => setScanlines(!scanlines)}
          className={cn(
            "mt-4 w-full sm:w-auto min-h-[44px] flex items-center justify-between gap-3 border rounded-[2px] px-3 py-2 text-sm font-semibold transition-colors",
            scanlines ? "border-gold bg-gold/10 text-gold-text" : "border-rule bg-paper-deep text-muted hover:border-rule-strong",
          )}
        >
          {t("settings.scanlines")}
          <span className={cn("font-pixel text-[8px]", scanlines ? "text-gold-text" : "text-muted")}>
            {scanlines ? "ON" : "OFF"}
          </span>
        </button>
      </Panel>

      <Panel kicker={t("settings.sound")} title={t("settings.soundTitle")} className="mt-4">
        <p className="text-xs text-muted leading-relaxed">{t("settings.soundLead")}</p>
        <div className="mt-4 space-y-4">
          <button
            type="button"
            role="switch"
            aria-checked={!sound.muted}
            onClick={() => {
              const next = !sound.muted;
              setSoundMuted(next);
              if (!next) playSfx("confirm");
            }}
            className={cn(
              "w-full sm:w-auto min-h-[44px] flex items-center justify-between gap-3 border rounded-[2px] px-3 py-2 text-sm font-semibold transition-colors",
              sound.muted ? "border-rule bg-paper-deep text-muted" : "border-gold bg-gold/10 text-gold-text",
            )}
          >
            {sound.muted ? t("settings.soundOff") : t("settings.soundOn")}
            <span aria-hidden="true" className={cn("font-pixel text-[8px]", sound.muted ? "text-muted" : "text-gold-text")}>
              {sound.muted ? "OFF" : "ON"}
            </span>
          </button>

          <div>
            <label htmlFor="sound-volume" className="kicker block mb-1.5">
              {t("settings.soundVolume")}: {Math.round(sound.volume * 100)}%
            </label>
            <input
              id="sound-volume"
              type="range"
              min={0}
              max={100}
              value={Math.round(sound.volume * 100)}
              onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
              onPointerUp={() => playSfx("tap")}
              className="pixel-range w-full max-w-xs"
              disabled={sound.muted}
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => playSfx("confirm")}>
            {t("settings.soundTest")}
          </Button>
        </div>
      </Panel>

      <Panel kicker={t("settings.account")} title={t("settings.profile")} className="mt-4">
        {user ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-semibold">{user.name}</span>{" "}
              <span className="text-muted">
                · {user.email} {user.provider === "local" && `· ${t("settings.storedLocal")}`}
              </span>
            </p>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              {t("common.signOut")}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted">{t("settings.notSignedIn")}</p>
        )}
      </Panel>

      <Panel kicker={t("settings.finePrint")} title={t("settings.factFiction")} className="mt-4">
        <dl className="space-y-4">
          {PRIMER.map((entry, i) => (
            <div key={i} className="flex gap-3">
              <dt className="shrink-0">
                <span
                  className={cn(
                    "inline-block text-[10px] font-bold uppercase tracking-widest border rounded-[2px] px-1.5 py-0.5",
                    entry.kind === "real" ? "border-moss text-moss-text" : "border-gold text-gold-text",
                  )}
                >
                  {entry.kind === "real" ? t("settings.real") : t("settings.fiction")}
                </span>
              </dt>
              <dd className="text-sm leading-relaxed text-ink/90">{entry.text}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel kicker={t("settings.danger")} title={t("settings.clearTitle")} className="mt-4 mb-8">
        <p className="text-sm text-muted leading-relaxed">
          {t("settings.clearText")}
        </p>
        <Button
          variant="danger"
          className="mt-3"
          onClick={() => {
            const confirmed = window.confirm(t("settings.clearConfirm"));
            if (!confirmed) return;
            clearLocalData();
            closeCampaign();
            navigate("/");
          }}
        >
          {t("settings.clearButton")}
        </Button>
      </Panel>
    </div>
  );
}
