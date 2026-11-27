import { useGameStore } from "../stores/game-store";
import { POLICY_MEASURES, type PolicyDomain, type PolicyMeasure } from "../data/policies";
import { tx } from "../data/lt";
import { canEnact, isEnacted } from "../engine/policy";
import { effectLabel } from "../features/shared/effectLabel";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";

const DOMAINS: Array<{ id: PolicyDomain; labelKey: string }> = [
  { id: "economy", labelKey: "policy.domainEconomy" },
  { id: "social", labelKey: "policy.domainSocial" },
  { id: "security", labelKey: "policy.domainSecurity" },
  { id: "institutions", labelKey: "policy.domainInstitutions" },
];

function MeasureRow({ measure }: { measure: PolicyMeasure }) {
  const game = useGameStore((s) => s.game);
  const enact = useGameStore((s) => s.enactPolicy);
  const { t, lang } = useT();
  if (!game) return null;

  const enacted = isEnacted(game, measure.id);
  const guard = canEnact(game, measure.id);
  const blocked = !enacted && !guard.ok && guard.reason === "conflict";

  return (
    <li className={cn("py-3", enacted && "opacity-80")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="display text-sm font-semibold">{tx(measure.title, lang)}</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">{tx(measure.summary, lang)}</p>
        </div>
        {enacted ? (
          <span className="kicker text-[11px] shrink-0 px-1.5 py-0.5 bg-gold/15 text-gold-text border border-gold/50 rounded-[2px]">
            {t("policy.enacted")} · {tx(measure.title, lang) === measure.title.en ? "" : ""}{game.policy?.enacted[measure.id] !== undefined ? `T${game.policy.enacted[measure.id] + 1}` : ""}
          </span>
        ) : blocked ? (
          <span className="kicker text-[11px] shrink-0 px-1.5 py-0.5 border border-rule text-muted rounded-[2px]">
            {t("policy.lockedConflict")} {measure.conflicts?.filter((c) => isEnacted(game, c)).map((c) => c).join(", ")}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => enact(measure.id)}
            className="shrink-0 text-xs font-semibold text-gold-text border border-gold/50 rounded-[2px] px-2 py-1 hover:bg-gold hover:text-paper transition-colors"
          >
            {t("policy.enact")}
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {measure.effects.map((e, i) => (
          <span key={`eff-${i}`} className={cn("text-[11px] px-1.5 py-0.5 rounded-[2px] border", (e.delta ?? 0) >= 0 ? "border-moss/40 bg-moss/5" : "border-brick/40 bg-brick/5")}>
            {effectLabel(e, lang)}
          </span>
        ))}
        {measure.delayed && (
          <span className="text-[11px] px-1.5 py-0.5 rounded-[2px] border border-gold/40 bg-gold/5 text-muted">
            +{measure.delayed.turns} · {t("policy.delayedNote")}
          </span>
        )}
      </div>
    </li>
  );
}

/** The policy dossier (v2): the measures this office can still enact. */
export function PolicyDossier() {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  if (!game) return null;

  const anyLeft = POLICY_MEASURES.some((m) => !isEnacted(game, m.id));

  return (
    <div className="page-enter">
      <PageHeader
        dense
        kicker={t("nav.policyDossier")}
        title={t("policy.title")}
        lead={t("policy.lead")}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {DOMAINS.map((domain) => {
          const measures = POLICY_MEASURES.filter((m) => m.domain === domain.id);
          return (
            <Panel key={domain.id} kicker={t(domain.labelKey)} title={t(domain.labelKey)}>
              {measures.length > 0 ? (
                <ul className="divide-y divide-rule">
                  {measures.map((m) => <MeasureRow key={m.id} measure={m} />)}
                </ul>
              ) : (
                <p className="text-sm text-muted">{t("policy.none")}</p>
              )}
            </Panel>
          );
        })}
      </div>

      {!anyLeft && (
        <p className="text-sm text-muted mt-6">{t("policy.none")}</p>
      )}
      <p className="text-[11px] text-muted mt-6">{tx({ en: "Measures are fiction; the ministries and thresholds they touch are the real ones.", ms: "Langkah adalah rekaan; kementerian dan ambang yang disentuh adalah yang sebenar." }, lang)}</p>
    </div>
  );
}
