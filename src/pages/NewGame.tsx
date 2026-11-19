import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import type { Difficulty } from "../types/game";
import { Button } from "../components/ui/Button";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";

export function NewGame() {
  const newGame = useGameStore((s) => s.newGame);
  const navigate = useNavigate();
  const { t } = useT();
  const [playerName, setPlayerName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");

  const DIFFICULTIES: Array<{ id: Difficulty; label: string; desc: string }> = [
    { id: "standard", label: t("newGame.standard"), desc: t("newGame.standardDesc") },
    { id: "turmoil", label: t("newGame.turmoil"), desc: t("newGame.turmoilDesc") },
  ];

  function submit(event: FormEvent) {
    event.preventDefault();
    newGame(playerName, campaignName, difficulty);
    navigate("/game/briefing");
  }

  return (
    <div className="min-h-screen atmosphere">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16">
        {/* Editorial column */}
        <div className="lg:pt-6">
          <Link
            to="/"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-gold-bright transition-colors"
          >
            &larr; {t("newGame.back")}
          </Link>

          <div className="mt-10 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 bg-gold" />
            <p className="kicker kicker-gold">{t("newGame.kicker")}</p>
          </div>
          <h1 className="headline mt-3">
            {t("newGame.title1")}
            <span className="block text-gold-bright italic font-normal">{t("newGame.title2")}</span>
          </h1>
          <div className="rule-double mt-5 max-w-md" />
          <p className="lede mt-5 text-sm">
            {t("newGame.lede")}
          </p>

          <dl className="mt-9 space-y-3 max-w-md text-sm">
            {[
              [t("newGame.carryK"), t("newGame.carryV")],
              [t("newGame.autosaveK"), t("newGame.autosaveV")],
              [t("newGame.fallingK"), t("newGame.fallingV")],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 border-t border-rule pt-3">
                <dt className="kicker w-36 shrink-0 pt-0.5">{k}</dt>
                <dd className="text-muted leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Form column */}
        <form onSubmit={submit} className="bg-card border border-rule rounded-panel p-6 sm:p-8 self-start">
          <p className="kicker kicker-gold">{t("newGame.record")}</p>
          <div className="rule-gold mt-2 mb-6" />

          <div className="space-y-5">
            <div>
              <label htmlFor="player-name" className="kicker block mb-2">
                {t("newGame.yourName")}
              </label>
              <input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={t("newGame.namePh")}
                className="w-full bg-paper-deep border border-rule rounded-[2px] px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-gold outline-none transition-colors"
                maxLength={40}
              />
            </div>

            <div>
              <label htmlFor="campaign-name" className="kicker block mb-2">
                {t("newGame.campaignName")}
              </label>
              <input
                id="campaign-name"
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder={t("newGame.campaignPh")}
                className="w-full bg-paper-deep border border-rule rounded-[2px] px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-gold outline-none transition-colors"
                maxLength={40}
              />
            </div>

            <fieldset>
              <legend className="kicker mb-2.5">{t("newGame.difficulty")}</legend>
              <div className="space-y-2.5">
                {DIFFICULTIES.map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      "flex gap-3 items-start border rounded-[2px] p-3.5 transition-colors",
                      difficulty === option.id
                        ? "border-gold bg-gold/10"
                        : "border-rule bg-paper-deep hover:border-rule-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      checked={difficulty === option.id}
                      onChange={() => setDifficulty(option.id)}
                      className="mt-1 accent-[var(--gold)]"
                    />
                    <span>
                      <span className="text-sm font-semibold block text-ink">{option.label}</span>
                      <span className="text-xs text-muted leading-snug block mt-0.5">{option.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="w-full sm:w-auto">
              {t("newGame.takeOffice")}
            </Button>
            <Link to="/" className="inline-flex items-center justify-center min-h-[44px] px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink transition-colors">
              {t("common.cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
