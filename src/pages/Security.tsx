import { useGameStore } from "../stores/game-store";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Meter } from "../components/ui/Meter";
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
      <PageHeader
        dense
        kicker={t("security.kicker")}
        title={t("security.title")}
        lead={t("security.lead")}
      />

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
