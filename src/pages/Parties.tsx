import { useGameStore } from "../stores/game-store";
import { COALITIONS } from "../data/parties";
import { PageHeader } from "../components/ui/PageHeader";
import { PartyFlag } from "../components/ui/PartyFlag";
import { useT } from "../i18n/store";
import { coalitionText } from "../i18n/data";

export function Parties() {
  const game = useGameStore((s) => s.game);
  const { t, tf, lang } = useT();
  if (!game) return null;

  return (
    <div className="page-enter">
      <PageHeader
        dense
        kicker={t("parties.kicker")}
        title={t("parties.title")}
        lead={t("parties.lead")}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {COALITIONS.map((c) => {
          const isGov = c.status === "government";
          const display = coalitionText(c, lang);
          return (
            <article
              key={c.id}
              className="bg-card border border-rule rounded-panel overflow-hidden"
              aria-label={`${display.name}, ${display.seats} ${lang === "ms" ? "kerusi" : "seats"}, ${display.status}`}
            >
              <header className="px-4 pt-4 pb-3 border-b border-rule" style={{ borderTop: `3px solid ${display.color}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PartyFlag coalitionId={c.id} size={30} className="mt-0.5" title={`${display.name} ${t("parties.standard")}`} />
                    <h2 className="display text-lg font-semibold leading-tight">{display.name}</h2>
                  </div>
                  <span className="tabular text-sm font-semibold shrink-0" style={{ color: display.color }}>
                    {tf("parties.seats", { n: display.seats })}
                  </span>
                </div>
                <p className="kicker mt-0.5">
                  {display.status === "government" ? t("parties.statusGov") : display.status === "opposition" ? t("parties.statusOpp") : t("parties.statusKing")} ·{" "}
                  {display.leader}
                </p>
              </header>
              <div className="px-4 py-3">
                <p className="text-sm font-medium">{display.stance}</p>
                <p className="text-sm text-muted leading-relaxed mt-2">{display.note}</p>
                {isGov && (
                  <p className="text-xs text-gold-text font-semibold mt-3">
                    {t("parties.govNote")}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
