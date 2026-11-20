import { useGameStore } from "../stores/game-store";
import { CHARACTERS } from "../data/characters";
import { PageHeader } from "../components/ui/PageHeader";
import { Meter } from "../components/ui/Meter";
import { CharacterPortrait } from "../components/game/CharacterPortrait";
import { PartyFlag } from "../components/ui/PartyFlag";
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
      <CharacterPortrait characterId={id} size="xl" className="shrink-0 self-start" />
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

  const cabinetIds = CHARACTERS.filter((c) => c.cabinet).map((c) => c.id);
  const adviserIds = CHARACTERS.filter(
    (c) => !c.cabinet && !(COALITION_FIGURES as readonly string[]).includes(c.id),
  ).map((c) => c.id);

  const sections: Array<{ label: string; note: string; ids: string[]; tier: Tier }> = [
    {
      label: t("cabinet.cabinet"),
      note: t("cabinet.cabinetNote"),
      ids: cabinetIds,
      tier: "cabinet",
    },
    {
      label: t("cabinet.inner"),
      note: t("cabinet.innerNote"),
      ids: adviserIds,
      tier: "adviser",
    },
    {
      label: t("cabinet.coalition"),
      note: t("cabinet.coalitionNote"),
      ids: [...COALITION_FIGURES],
      tier: "coalition",
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        dense
        kicker={t("cabinet.kicker")}
        title={t("cabinet.title")}
        lead={t("cabinet.lead")}
      />

      {sections.map((section) => (
        <section key={section.label} aria-label={section.label} className="mt-10 first:mt-0">
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
