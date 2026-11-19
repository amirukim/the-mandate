import { useState } from "react";
import { useGameStore } from "../stores/game-store";
import type { DiplomacyKey } from "../types/game";
import { PageHeader } from "../components/ui/PageHeader";
import { Meter } from "../components/ui/Meter";
import { RegionMap } from "../components/geo/RegionMap";
import { useT } from "../i18n/store";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

function stanceOf(value: number, t: (path: string) => string): { label: string; tone: "moss" | "gold" | "brick" } {
  if (value >= 70) return { label: t("diplomacy.stanceWarm"), tone: "moss" };
  if (value >= 55) return { label: t("diplomacy.stanceWorking"), tone: "gold" };
  if (value >= 40) return { label: t("diplomacy.stanceCool"), tone: "gold" };
  return { label: t("diplomacy.stanceStrained"), tone: "brick" };
}

/** Simplified flag chip, decorative; real colours, no real emblem detail. */
function FlagChip({ id, size = 30 }: { id: DiplomacyKey; size?: number }) {
  const h = size * (2 / 3);
  const w = size;
  switch (id) {
    case "china":
      return (
        <svg width={w} height={h} viewBox="0 0 30 20" aria-hidden="true" className="shrink-0 border border-black/50">
          <rect width="30" height="20" fill="#c8442e" />
          <path d="M6 4l1.2 2.4 2.6.3-1.9 1.8.5 2.6L6 9.8 3.6 11l.5-2.6L2.2 6.7l2.6-.3z" fill="#e6cd8e" />
        </svg>
      );
    case "unitedStates":
      return (
        <svg width={w} height={h} viewBox="0 0 30 20" aria-hidden="true" className="shrink-0 border border-black/50">
          <rect width="30" height="20" fill="#e9e2d2" />
          <g fill="#b04438">
            <rect y="0" width="30" height="2.9" />
            <rect y="5.7" width="30" height="2.9" />
            <rect y="11.4" width="30" height="2.9" />
            <rect y="17.1" width="30" height="2.9" />
          </g>
          <rect width="13" height="9" fill="#2f4373" />
        </svg>
      );
    case "singapore":
      return (
        <svg width={w} height={h} viewBox="0 0 30 20" aria-hidden="true" className="shrink-0 border border-black/50">
          <rect width="30" height="10" fill="#c8442e" />
          <rect y="10" width="30" height="10" fill="#f2ede3" />
          <circle cx="7" cy="5" r="3" fill="#f2ede3" />
          <circle cx="8.6" cy="5" r="2.6" fill="#c8442e" />
        </svg>
      );
    case "indonesia":
      return (
        <svg width={w} height={h} viewBox="0 0 30 20" aria-hidden="true" className="shrink-0 border border-black/50">
          <rect width="30" height="10" fill="#c8442e" />
          <rect y="10" width="30" height="10" fill="#f2ede3" />
        </svg>
      );
    case "europeanUnion":
      return (
        <svg width={w} height={h} viewBox="0 0 30 20" aria-hidden="true" className="shrink-0 border border-black/50">
          <rect width="30" height="20" fill="#2f4373" />
          <g fill="#e6cd8e">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
              const a = (i / 12) * Math.PI * 2;
              return <circle key={i} cx={15 + Math.sin(a) * 6} cy={10 - Math.cos(a) * 6} r="1" />;
            })}
          </g>
        </svg>
      );
    default: // asean
      return (
        <svg width={w} height={h} viewBox="0 0 30 20" aria-hidden="true" className="shrink-0 border border-black/50">
          <rect width="30" height="20" fill="#2f4373" />
          <circle cx="15" cy="10" r="6" fill="none" stroke="#e6cd8e" strokeWidth="1.5" />
          <circle cx="15" cy="10" r="2" fill="#e6cd8e" />
        </svg>
      );
  }
}

interface DialRowProps {
  brief: { key: DiplomacyKey; label: string; note: string };
  value: number;
  selected: boolean;
  onSelect: () => void;
}

/** One row of the dials list; clicking syncs with the chart. */
function DialRow({
  brief,
  value,
  selected,
  onSelect,
}: DialRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full text-left flex items-center gap-3 px-3.5 py-2.5 border-l-2 transition-colors",
        selected ? "border-gold bg-surface" : "border-transparent hover:bg-surface/60",
      )}
    >
      <FlagChip id={brief.key} size={26} />
      <span className="min-w-0 flex-1">
        <span className="kicker text-[10px] block truncate">{brief.label}</span>
        <span className="meter mt-1 h-1 overflow-hidden rounded-[1px] block" aria-hidden="true">
          <span
            className={cn("block h-full", value >= 55 ? "bg-moss" : value >= 40 ? "bg-gold" : "bg-brick")}
            style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
          />
        </span>
      </span>
      <span className="tabular text-sm font-semibold">{value}</span>
    </button>
  );
}

export function Diplomacy() {
  const game = useGameStore((s) => s.game);
  const { t } = useT();
  const [selected, setSelected] = useState<DiplomacyKey | null>(null);
  if (!game) return null;

  const BRIEFS: Array<{ key: DiplomacyKey; label: string; note: string }> = [
    { key: "asean", label: t("diplomacy.asean"), note: t("diplomacy.aseanNote") },
    { key: "china", label: t("diplomacy.china"), note: t("diplomacy.chinaNote") },
    { key: "unitedStates", label: t("diplomacy.us"), note: t("diplomacy.usNote") },
    { key: "singapore", label: t("diplomacy.singapore"), note: t("diplomacy.singaporeNote") },
    { key: "indonesia", label: t("diplomacy.indonesia"), note: t("diplomacy.indonesiaNote") },
    { key: "europeanUnion", label: t("diplomacy.eu"), note: t("diplomacy.euNote") },
  ];
  const briefFor = (key: DiplomacyKey) => BRIEFS.find((b) => b.key === key)!;

  const brief = selected ? briefFor(selected) : null;
  const value = selected ? game.diplomacy[selected] : null;
  const stance = value !== null ? stanceOf(value, t) : null;

  return (
    <div className="page-enter">
      <PageHeader
        dense
        kicker={t("diplomacy.kicker")}
        title={t("diplomacy.title")}
        lead={t("diplomacy.lead")}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <RegionMap selected={selected} onSelect={setSelected} />
        </div>

        <div className="lg:col-span-1 min-w-0 space-y-6">
          {brief && value !== null && stance ? (
            <div className="bg-card border border-gold/50 rounded-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-rule flex items-center justify-between gap-2">
                <p className="kicker kicker-gold">{t("diplomacy.relationsFile")}</p>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label={t("diplomacy.closeFile")}
                  className="flex items-center justify-center w-8 h-8 border border-rule rounded-[2px] text-muted hover:text-ink hover:border-gold/60 transition-colors"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <FlagChip id={brief.key} size={34} />
                  <div>
                    <h2 className="display text-2xl font-semibold leading-tight">{brief.label}</h2>
                    <p className={cn("kicker text-[10px] mt-0.5", stance.tone === "moss" ? "text-moss-text" : stance.tone === "brick" ? "text-brick-text" : "text-gold-text")}>
                      {stance.label}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Meter label={t("diplomacy.stateOf")} value={value} tone={stance.tone} />
                </div>
                <p className="text-sm text-muted leading-relaxed mt-4">{brief.note}</p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-rule rounded-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-rule">
                <p className="kicker kicker-gold">{t("diplomacy.doctrineKicker")}</p>
              </div>
              <div className="px-4 py-4">
                <p className="text-sm leading-relaxed text-ink/85">
                  {t("diplomacy.doctrineText")}
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="kicker kicker-gold shrink-0">{t("diplomacy.dials")}</p>
              <span aria-hidden="true" className="flex-1 border-t border-gold/40" />
            </div>
            <div className="bg-card border border-rule rounded-panel overflow-hidden divide-y divide-rule">
              {BRIEFS.map((b) => (
                <DialRow
                  key={b.key}
                  brief={b}
                  value={game.diplomacy[b.key]}
                  selected={selected === b.key}
                  onSelect={() => setSelected(selected === b.key ? null : b.key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
