import { useGameStore } from "../stores/game-store";
import { CHARACTERS } from "../data/characters";
import { Meter } from "../components/ui/Meter";
import { PixelSprite } from "../components/game/PixelSprite";
import { PartyFlag } from "../components/ui/PartyFlag";
import { PixelScene } from "../components/game/PixelScene";
import { CabinetTable } from "../features/cabinet/CabinetTable";
import { prefersReducedMotion } from "../hooks/usePortalOverlay";
import { useT } from "../i18n/store";
import { characterText } from "../i18n/data";
import { cn } from "../utils/cn";

type Tier = "cabinet" | "adviser" | "coalition";

interface CharacterCardProps {
  id: string;
  tier: Tier;
}

const TIER_META: Record<Tier, { tag: string; accent: string }> = {
  cabinet: { tag: "Cabinet seat", accent: "border-l-gold" },
  adviser: { tag: "Inner office", accent: "border-l-ink/40" },
  coalition: { tag: "Coalition", accent: "border-l-brick" },
};

/** Coalition leaders carry their party's standard; fictional characters, real blocs. */
const FIGURE_PARTY: Record<string, string> = {
  gpsPremier: "gps",
  bnChair: "bn",
  borneoMinister: "grs",
  oppositionLeader: "pn",
};

/**
 * A single person's file: portrait, office, who they are, how they lean,
 * and where the relationship stands. Three tiers differ by accent and tag,
 * not by layout, so the roster reads as one document.
 * All characters are fictional; the portrait area accepts a real asset via
 * data/portraits.ts without changing this component.
 */
function CharacterCard({ id, tier }: CharacterCardProps) {
  const game = useGameStore((s) => s.game);
  const { t, lang } = useT();
  if (!game) return null;
  const def = CHARACTERS.find((c) => c.id === id);
  const state = game.characters[id];
  if (!def || !state) return null;
  const display = characterText(def, lang);

  return (
    <article
      className={cn(
        "bg-card border border-rule border-l-2 rounded-panel p-4 sm:p-5 flex gap-4",
        TIER_META[tier].accent,
      )}
    >
      <div className="shrink-0 self-start flex flex-col items-center gap-1.5">
        <PixelSprite characterId={id} mode="idle" scale={2} className="rounded-[2px] bg-navy/90 border border-rule" />
        <span className="kicker text-[8px] text-muted">48 × 64</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {tier === "coalition" && FIGURE_PARTY[id] && (
            <PartyFlag coalitionId={FIGURE_PARTY[id]} size={20} className="self-center" />
          )}
          <h3 className="display text-lg font-semibold leading-tight">{display.name}</h3>
          <p className="kicker text-[10px]">
            {tier === "cabinet" ? t("cabinet.tagCabinet") : tier === "adviser" ? t("cabinet.tagInner") : t("cabinet.tagCoalition")}
          </p>
        </div>
        <p className="text-xs text-gold-text mt-1">{display.role}</p>
        <p className="text-sm text-muted leading-relaxed mt-2.5">{display.bio}</p>
        <p className="text-xs text-ink/80 mt-2 italic border-t border-rule pt-2">{display.loyaltyHint}</p>
        <div className="mt-3">
          <Meter
            label={t("cabinet.relationship")}
            value={state.relationship}
            tone={state.relationship >= 60 ? "moss" : state.relationship >= 35 ? "gold" : "brick"}
            hint={state.counselUsedTurn === game.turn ? t("cabinet.counselHint") : t("cabinet.counselHintOk")}
          />
        </div>
      </div>
    </article>
  );
}

const COALITION_FIGURES = ["gpsPremier", "bnChair", "borneoMinister", "oppositionLeader"] as const;

export function Cabinet() {
  const game = useGameStore((s) => s.game);
  const { t } = useT();
  if (!game) return null;

  // room hotspots: each chip walks to its section of the dossier below
  const SPOTS: Array<{ id: string; label: string; dot: string }> = [
    { id: "cabinet-table", label: t("cabinet.spotTable"), dot: "bg-gold" },
    { id: "inner-office", label: t("cabinet.spotInner"), dot: "bg-ink/50" },
    { id: "coalition-bench", label: t("cabinet.spotBench"), dot: "bg-brick" },
  ];
  const jumpTo = (id: string) => {
    const reduced = prefersReducedMotion();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const cabinetIds = CHARACTERS.filter((c) => c.cabinet).map((c) => c.id);
  const adviserIds = CHARACTERS.filter(
    (c) => !c.cabinet && !(COALITION_FIGURES as readonly string[]).includes(c.id),
  ).map((c) => c.id);

  const sections: Array<{ id: string; label: string; note: string; ids: string[]; tier: Tier }> = [
    {
      id: "cabinet-table",
      label: t("cabinet.cabinet"),
      note: t("cabinet.cabinetNote"),
      ids: cabinetIds,
      tier: "cabinet",
    },
    {
      id: "inner-office",
      label: t("cabinet.inner"),
      note: t("cabinet.innerNote"),
      ids: adviserIds,
      tier: "adviser",
    },
    {
      id: "coalition-bench",
      label: t("cabinet.coalition"),
      note: t("cabinet.coalitionNote"),
      ids: [...COALITION_FIGURES],
      tier: "coalition",
    },
  ];

  return (
    <div className="page-enter">
      {/* the room: the cabinet meets in the chamber's meeting wing */}
      <header className="relative -mx-4 sm:-mx-8 -mt-8 mb-8 border-b border-rule overflow-hidden">
        <div className="absolute inset-0 glow-art" aria-hidden="true">
          <PixelScene src="/art/scene-chamber.svg" width={480} height={140} className="art-warm opacity-70 object-[center_45%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/85 to-paper/55" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
        </div>
        <div className="relative px-4 sm:px-8 pt-10 pb-6">
          <p className="kicker kicker-gold">{t("cabinet.kicker")}</p>
          <h1 className="display text-2xl sm:text-3xl font-semibold mt-1.5">{t("cabinet.title")}</h1>
          <p className="text-sm text-muted leading-relaxed mt-2 max-w-4xl">{t("cabinet.lead")}</p>
          <div className="mt-4 flex flex-wrap gap-2" role="navigation" aria-label={t("cabinet.title")}>
            {SPOTS.map((spot) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => jumpTo(spot.id)}
                className="group flex items-center gap-2 border border-gold/50 bg-card/80 rounded-[2px] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-text transition-colors hover:bg-gold hover:text-paper hover:border-gold"
              >
                <span aria-hidden="true" className={cn("w-1.5 h-1.5 rounded-[1px]", spot.dot)} />
                {spot.label}
              </button>
            ))}
          </div>
          <div className="rule mt-4" />
        </div>
      </header>

      {/* v2: the working table — posts, appointments, faction anger */}
      <section id="appointments" aria-label={t("cabinet.appointments")} className="mb-2 scroll-mt-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="kicker kicker-gold">{t("cabinet.appointments")}</h2>
        </div>
        <div className="rule-gold mt-2 mb-4" />
        <CabinetTable />
      </section>

      {sections.map((section) => (
        <section key={section.id} id={section.id} aria-label={section.label} className="mt-10 first:mt-0 scroll-mt-6">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="kicker kicker-gold">{section.label}</h2>
            <p className="text-xs text-muted">{section.note}</p>
          </div>
          <div className="rule-gold mt-2 mb-4" />
          <div className="grid gap-4 lg:grid-cols-2">
            {section.ids.map((id) => (
              <CharacterCard key={id} id={id} tier={section.tier} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
