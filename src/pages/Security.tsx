import { useGameStore } from "../stores/game-store";
import { Panel } from "../components/ui/Panel";
import { Meter } from "../components/ui/Meter";
import { PixelScene } from "../components/game/PixelScene";
import { useT } from "../i18n/store";

export function Security() {
  const game = useGameStore((s) => s.game);
  const { t } = useT();
  if (!game) return null;

  const DOMAINS: Array<{ key: keyof import("../types/game").SecurityState; label: string; note: string }> = [
    { key: "militaryReadiness", label: t("security.military"), note: t("security.militaryNote") },
    { key: "policeEffectiveness", label: t("security.police"), note: t("security.policeNote") },
    { key: "cybersecurity", label: t("security.cyber"), note: t("security.cyberNote") },
    { key: "maritimeSecurity", label: t("security.maritime"), note: t("security.maritimeNote") },
    { key: "borderProtection", label: t("security.border"), note: t("security.borderNote") },
    { key: "domesticStability", label: t("security.stability"), note: t("security.stabilityNote") },
  ];

  return (
    <div className="page-enter">
      {/* Illustrated masthead: the crisis operations room. */}
      <header className="relative -mx-4 sm:-mx-8 -mt-8 mb-6 border-b border-rule overflow-hidden">
        <div className="absolute inset-0 glow-art" aria-hidden="true">
          <PixelScene src="/art/scene-ops.svg" width={480} height={140} className="art-warm opacity-70 object-[center_45%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/85 to-paper/55" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
        </div>
        <div className="relative px-4 sm:px-8 pt-10 pb-6">
          <p className="kicker kicker-gold">{t("security.kicker")}</p>
          <h1 className="display text-2xl sm:text-3xl font-semibold mt-1.5">{t("security.title")}</h1>
          <p className="text-sm text-muted leading-relaxed mt-2 max-w-4xl">{t("security.lead")}</p>
          <div className="rule mt-3" />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DOMAINS.map((domain) => (
          <Panel key={domain.key}>
            <Meter label={domain.label} value={game.security[domain.key]} tone="gold" />
            <p className="text-sm text-muted leading-relaxed mt-3">{domain.note}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
