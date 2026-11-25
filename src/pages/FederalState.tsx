import { useRef, useState } from "react";
import { useGameStore } from "../stores/game-store";
import { STATES, type StateDef } from "../data/states";
import { coalitionById } from "../data/parties";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Meter } from "../components/ui/Meter";
import { MalaysiaMap } from "../components/geo/MalaysiaMap";
import { useT } from "../i18n/store";
import { stateText } from "../i18n/data";
import { cn } from "../utils/cn";

const REGIONS = [
  { id: "all" },
  { id: "peninsula-north" },
  { id: "peninsula-south" },
  { id: "east-coast" },
  { id: "borneo" },
  { id: "territories" },
] as const;

export function FederalStateRelations() {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  const [region, setRegion] = useState<(typeof REGIONS)[number]["id"]>("all");
  const [pickedState, setPickedState] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  if (!game) return null;

  const regionLabel = (id: string) =>
    id === "all" ? t("federal.regionAll")
    : id === "peninsula-north" ? t("federal.regionNorth")
    : id === "peninsula-south" ? t("federal.regionSouth")
    : id === "east-coast" ? t("federal.regionEast")
    : id === "borneo" ? t("federal.regionBorneo")
    : t("federal.regionTerritories");

  const visible: StateDef[] = STATES.filter((s) => region === "all" || s.region === region);

  return (
    <div className="page-enter">
      <PageHeader
        dense
        kicker={t("federal.kicker")}
        title={t("federal.title")}
        lead={t("federal.lead")}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Panel kicker={t("federal.borneoFile")} title={t("federal.borneoTitle")}>
            <div className="space-y-4">
              <Meter label={t("federal.ma63")} value={game.federal.ma63Progress} tone="gold" hint={t("federal.ma63Hint")} />
              <Meter label={t("federal.autonomy")} value={game.federal.sabahSarawakAutonomy} tone="navy" />
              <Meter label={t("federal.revenue")} value={game.federal.revenueFairness} tone="brick" hint={t("federal.revenueHint")} />
            </div>
          </Panel>
          <Panel kicker={t("federal.national")} title={t("federal.infraTitle")} className="mt-4">
            <Meter label={t("federal.infraMeter")} value={game.federal.stateInfrastructure} tone="moss" />
          </Panel>

          {/* the atlas, beside the region list: pick a state to surface its row */}
          <div className="mt-4">
            <MalaysiaMap
              selectedId={pickedState}
              onSelect={(id) => {
                setPickedState(id);
                if (id) {
                  const def = STATES.find((s) => s.id === id);
                  if (def && region !== "all" && def.region !== region) setRegion("all");
                  requestAnimationFrame(() => {
                    listRef.current
                      ?.querySelector(`[data-state-id="${id}"]`)
                      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                  });
                }
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div role="tablist" aria-label={t("federal.regionsAria")} className="flex flex-wrap gap-2 mb-4">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={region === r.id}
                onClick={() => setRegion(r.id)}
                className={cn(
                  "px-3 py-2.5 text-xs font-semibold border rounded-[2px]",
                  region === r.id
                    ? "border-gold text-gold-text bg-paper-deep"
                    : "border-rule-strong text-muted hover:text-ink",
                )}
              >
                {regionLabel(r.id)}
              </button>
            ))}
          </div>

          <ul ref={listRef} className="space-y-2.5">
            {visible.map((raw) => {
              const state = stateText(raw, lang);
              const relation = game.federal.relations[state.id] ?? 50;
              const ruling = coalitionById(state.ruling);
              const picked = pickedState === state.id;
              return (
                <li key={state.id} data-state-id={state.id}>
                  <article
                    className={cn(
                      "bg-card border rounded-panel px-4 py-3 transition-colors",
                      picked ? "border-gold" : "border-rule",
                    )}
                    aria-label={state.name}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="display text-base font-semibold">{state.name}</h3>
                      <p className="kicker">
                        {state.capital} · {state.rulerTitle} · {ruling?.abbr ?? state.ruling}
                      </p>
                    </div>
                    <p className="text-sm text-muted leading-relaxed mt-1.5">{state.note}</p>
                    <div className="mt-2.5 max-w-sm">
                      <Meter label={t("overview.relations")} value={relation} tone={relation >= 55 ? "moss" : relation >= 42 ? "gold" : "brick"} />
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
