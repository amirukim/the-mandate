import { useState } from "react";
import { useGameStore } from "../../stores/game-store";
import { CHARACTERS } from "../../data/characters";
import { CABINET_POSTS, angerMeters, blocOfCharacter, holderOf, postOfCharacter } from "../../engine/cabinet";
import { tx } from "../../data/lt";
import { coalitionById } from "../../data/parties";
import { characterText } from "../../i18n/data";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";
import { Meter } from "../../components/ui/Meter";

/**
 * The cabinet table (v2): the posts, who holds each, the anger meters, and
 * the assignment flow. A reshuffle is another appointment — the anger maths
 * runs again and the roster updates.
 */
export function CabinetTable() {
  const game = useGameStore((s) => s.game);
  const appoint = useGameStore((s) => s.appointMinister);
  const { t, lang } = useT();
  const [openPost, setOpenPost] = useState<string | null>(null);
  if (!game) return null;

  const candidates = CHARACTERS.filter((c) => c.cabinet);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* posts */}
      <div className="lg:col-span-3 min-w-0">
        <ul className="divide-y divide-rule border border-rule rounded-panel bg-card overflow-hidden">
          {CABINET_POSTS.map((post) => {
            const holder = holderOf(game, post.id);
            const holderDef = holder ? CHARACTERS.find((c) => c.id === holder) : null;
            const open = openPost === post.id;
            return (
              <li key={post.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="display text-sm font-semibold">{tx(post.label, lang)}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {t("cabinet.expects")}: {post.expects.map((b) => coalitionById(b)?.abbr ?? b).join(" / ")}
                    </p>
                  </div>
                  {holderDef ? (
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{characterText(holderDef, lang).name}</p>
                      <p className="kicker text-[11px] text-muted">
                        {blocOfCharacter(holderDef.id).toUpperCase()} · {post.fit.includes(holderDef.id) ? t("cabinet.fitGood") : t("cabinet.fitPoor")}
                      </p>
                    </div>
                  ) : (
                    <span className="kicker text-[11px] text-muted shrink-0 px-1.5 py-0.5 border border-rule rounded-[2px]">{t("cabinet.vacancy")}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOpenPost(open ? null : post.id)}
                  aria-expanded={open}
                  className="mt-2 text-sm font-semibold text-gold-text hover:text-gold-bright transition-colors"
                >
                  {holder ? t("cabinet.reshuffle") : t("cabinet.assign")} →
                </button>

                {open && (
                  <ul className="mt-3 border-t border-rule pt-2 grid sm:grid-cols-2 gap-1.5">
                    {candidates.map((c) => {
                      const busy = postOfCharacter(game, c.id);
                      const busyHere = busy === post.id;
                      const display = characterText(c, lang);
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => {
                              appoint(post.id, c.id);
                              setOpenPost(null);
                            }}
                            className={cn(
                              "w-full text-left text-xs border rounded-[2px] px-2 py-1.5 transition-colors flex items-center justify-between gap-2",
                              busyHere ? "border-gold/60 bg-gold/10" : "border-rule hover:border-gold/60 hover:bg-surface/60",
                            )}
                          >
                            <span className="min-w-0">
                              <span className="font-semibold block truncate">{display.name}</span>
                              <span className="text-muted block truncate">{tx({ en: blocOfCharacter(c.id).toUpperCase(), ms: blocOfCharacter(c.id).toUpperCase() }, lang)} · {post.fit.includes(c.id) ? t("cabinet.fitGood") : t("cabinet.fitPoor")}</span>
                            </span>
                            {busyHere && <span className="kicker text-[8px] text-gold-text shrink-0">{t("cabinet.holdPost")}</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* anger meters */}
      <div className="lg:col-span-2 min-w-0">
        <div className="bg-card border border-rule rounded-panel p-4 h-full">
          <h4 className="display text-sm font-semibold">{t("cabinet.angerTitle")}</h4>
          <p className="text-[11px] text-muted mt-1">{t("cabinet.angerNote")}</p>
          <div className="mt-3 space-y-3">
            {angerMeters(game).map(({ blocId, anger }) => (
              <Meter
                key={blocId}
                label={`${coalitionById(blocId)?.abbr ?? blocId} — ${t("cabinet.angerTitle")}`}
                value={anger}
                tone={anger >= 30 ? "brick" : anger >= 15 ? "gold" : "moss"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
