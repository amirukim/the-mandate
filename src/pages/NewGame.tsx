import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import type { Difficulty } from "../types/game";
import { Button } from "../components/ui/Button";
import { pmAvatarDataUrl, AVATAR_SKINS, AVATAR_HAIRS, AVATAR_ATTIRE, type AvatarCustomisation } from "../data/pixel-portraits";
import { STATES } from "../data/states";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";

const CAREERS: Array<{ id: NonNullable<AvatarCustomisation["priorCareer"]>; key: string }> = [
  { id: "civilService", key: "avatar.careerCivil" },
  { id: "military", key: "avatar.careerMilitary" },
  { id: "business", key: "avatar.careerBusiness" },
  { id: "activism", key: "avatar.careerActivism" },
  { id: "academia", key: "avatar.careerAcademia" },
];

const TRAITS: Array<{ id: string; key: string }> = [
  { id: "reformer", key: "avatar.traitReformer" },
  { id: "technocrat", key: "avatar.traitTechnocrat" },
  { id: "populist", key: "avatar.traitPopulist" },
  { id: "fixer", key: "avatar.traitFixer" },
  { id: "consensus", key: "avatar.traitConsensus" },
  { id: "hardliner", key: "avatar.traitHardliner" },
];

const HEADWEAR: Array<{ id: NonNullable<AvatarCustomisation["headwear"]>; key: string }> = [
  { id: "none", key: "avatar.headNone" },
  { id: "songkok", key: "avatar.headSongkok" },
  { id: "kopiah", key: "avatar.headKopiah" },
  { id: "tudung", key: "avatar.headTudung" },
];

export function NewGame() {
  const newGame = useGameStore((s) => s.newGame);
  const navigate = useNavigate();
  const { t } = useT();
  const [playerName, setPlayerName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [avatar, setAvatar] = useState<AvatarCustomisation>({
    skin: AVATAR_SKINS[0][0],
    hair: AVATAR_HAIRS[0].id,
    headwear: "none",
    attire: AVATAR_ATTIRE[0].id,
    glasses: false,
    homeState: "selangor",
    priorCareer: "civilService",
    traits: [],
  });

  const setAvatarField = <K extends keyof AvatarCustomisation>(field: K, value: AvatarCustomisation[K]) =>
    setAvatar((prev) => ({ ...prev, [field]: value }));

  const DIFFICULTIES: Array<{ id: Difficulty; label: string; desc: string }> = [
    { id: "standard", label: t("newGame.standard"), desc: t("newGame.standardDesc") },
    { id: "turmoil", label: t("newGame.turmoil"), desc: t("newGame.turmoilDesc") },
  ];

  function submit(event: FormEvent) {
    event.preventDefault();
    newGame(playerName, campaignName, difficulty, avatar);
    navigate("/game/home");
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

          {/* the Prime Minister's dossier: live bust preview */}
          <div className="mb-7 flex gap-5 items-start">
            <img
              src={pmAvatarDataUrl(avatar)}
              alt=""
              width={128}
              height={128}
              className="pixelated rounded-[2px] border border-gold/50 shadow-lift shrink-0"
            />
            <div className="min-w-0">
              <p className="kicker kicker-gold">{t("avatar.kicker")}</p>
              <p className="text-sm text-muted leading-relaxed mt-2">{t("avatar.lead")}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="avatar-skin" className="kicker block mb-1.5">{t("avatar.skin")}</label>
                <select
                  id="avatar-skin"
                  value={avatar.skin}
                  onChange={(e) => setAvatarField("skin", e.target.value)}
                  className="w-full bg-paper-deep border border-rule rounded-[2px] px-2.5 py-2 text-sm focus:border-gold outline-none"
                >
                  {AVATAR_SKINS.map((s, i) => (
                    <option key={s[0]} value={s[0]}>{t("avatar.skinTone")} {i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="avatar-hair" className="kicker block mb-1.5">{t("avatar.hair")}</label>
                <select
                  id="avatar-hair"
                  value={avatar.hair}
                  onChange={(e) => setAvatarField("hair", e.target.value)}
                  className="w-full bg-paper-deep border border-rule rounded-[2px] px-2.5 py-2 text-sm focus:border-gold outline-none"
                >
                  {AVATAR_HAIRS.map((h) => (
                    <option key={h.id} value={h.id}>{t(`avatar.hair_${h.id}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="avatar-headwear" className="kicker block mb-1.5">{t("avatar.headwear")}</label>
                <select
                  id="avatar-headwear"
                  value={avatar.headwear}
                  onChange={(e) => setAvatarField("headwear", e.target.value as AvatarCustomisation["headwear"])}
                  className="w-full bg-paper-deep border border-rule rounded-[2px] px-2.5 py-2 text-sm focus:border-gold outline-none"
                >
                  {HEADWEAR.map((h) => (
                    <option key={h.id} value={h.id}>{t(h.key)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="avatar-attire" className="kicker block mb-1.5">{t("avatar.attire")}</label>
                <select
                  id="avatar-attire"
                  value={avatar.attire}
                  onChange={(e) => setAvatarField("attire", e.target.value)}
                  className="w-full bg-paper-deep border border-rule rounded-[2px] px-2.5 py-2 text-sm focus:border-gold outline-none"
                >
                  {AVATAR_ATTIRE.map((a) => (
                    <option key={a.id} value={a.id}>{t(`avatar.attire_${a.id}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={avatar.glasses ?? false}
                  onChange={(e) => setAvatarField("glasses", e.target.checked)}
                  className="accent-[#c69b54] w-4 h-4"
                />
                {t("avatar.glasses")}
              </label>
              <div className="flex items-center gap-2">
                <label htmlFor="avatar-home" className="kicker text-[9px]">{t("avatar.homeState")}</label>
                <select
                  id="avatar-home"
                  value={avatar.homeState}
                  onChange={(e) => setAvatarField("homeState", e.target.value)}
                  className="bg-paper-deep border border-rule rounded-[2px] px-2 py-1.5 text-xs focus:border-gold outline-none"
                >
                  {STATES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset>
              <legend className="kicker mb-2">{t("avatar.priorCareer")}</legend>
              <div className="grid grid-cols-2 gap-2">
                {CAREERS.map((career) => (
                  <label
                    key={career.id}
                    className={cn(
                      "flex items-center gap-2 border rounded-[2px] px-2.5 py-2 text-xs cursor-pointer transition-colors",
                      avatar.priorCareer === career.id ? "border-gold bg-gold/10" : "border-rule hover:border-rule-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="prior-career"
                      checked={avatar.priorCareer === career.id}
                      onChange={() => setAvatarField("priorCareer", career.id)}
                      className="accent-[#c69b54] w-3.5 h-3.5"
                    />
                    {t(career.key)}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="kicker mb-2">{t("avatar.traits")}</legend>
              <div className="flex flex-wrap gap-2">
                {TRAITS.map((trait) => {
                  const on = (avatar.traits ?? []).includes(trait.id);
                  return (
                    <label
                      key={trait.id}
                      className={cn(
                        "flex items-center gap-1.5 border rounded-[2px] px-2 py-1.5 text-xs cursor-pointer transition-colors",
                        on ? "border-gold bg-gold/10 text-gold-text" : "border-rule text-muted hover:border-rule-strong",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) =>
                          setAvatarField(
                            "traits",
                            e.target.checked
                              ? [...(avatar.traits ?? []), trait.id]
                              : (avatar.traits ?? []).filter((x) => x !== trait.id),
                          )
                        }
                        className="accent-[#c69b54] w-3.5 h-3.5"
                      />
                      {t(trait.key)}
                    </label>
                  );
                })}
              </div>
            </fieldset>

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
