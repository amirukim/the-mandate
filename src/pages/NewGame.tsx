import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../stores/game-store";
import type { Difficulty } from "../types/game";
import { Button } from "../components/ui/Button";
import {
  pmAvatarDataUrl,
  spriteDataUrl,
  specFromAvatar,
  AVATAR_SKINS,
  AVATAR_HAIRS,
  AVATAR_ATTIRE,
  AVATAR_BODIES,
  type AvatarCustomisation,
} from "../data/pixel-portraits";
import { STATES } from "../data/states";
import { prefersReducedMotion } from "../hooks/usePortalOverlay";
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

/** Wrap-around stepper index helper. */
function stepIndex(length: number, current: number, dir: number): number {
  return (current + dir + length) % length;
}

/**
 * New campaign as a character-select screen (v3a phase 3): the PM's paper-doll
 * idles live on a platform while each attribute steps with arrow controls.
 * Same fields, same saved shape — the presentation changes, the data does not.
 */
export function NewGame() {
  const newGame = useGameStore((s) => s.newGame);
  const navigate = useNavigate();
  const { t, lang } = useT();
  const reduced = prefersReducedMotion();
  const [playerName, setPlayerName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [avatar, setAvatar] = useState<AvatarCustomisation>({
    skin: AVATAR_SKINS[0][0],
    hair: AVATAR_HAIRS[0].id,
    headwear: "none",
    attire: AVATAR_ATTIRE[0].id,
    body: "average",
    glasses: false,
    homeState: "selangor",
    priorCareer: "civilService",
    traits: [],
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setTick((v) => v + 1), 700);
    return () => window.clearInterval(timer);
  }, [reduced]);

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

  // the live paper-doll: idle frames alternate on the platform
  const previewSpec = specFromAvatar(avatar);
  const idleFrame = reduced ? 0 : (tick % 2);
  const previewUrl = spriteDataUrl(previewSpec, "neutral", { pose: "stand", frame: idleFrame });

  const skinIndex = Math.max(0, AVATAR_SKINS.findIndex((s) => s[0] === avatar.skin));
  const hairIndex = Math.max(0, AVATAR_HAIRS.findIndex((h) => h.id === avatar.hair));
  const attireIndex = Math.max(0, AVATAR_ATTIRE.findIndex((a) => a.id === avatar.attire));
  const bodyIndex = Math.max(0, AVATAR_BODIES.findIndex((b) => b.id === avatar.body));
  const headIndex = Math.max(0, HEADWEAR.findIndex((h) => h.id === avatar.headwear));
  const stateIndex = Math.max(0, STATES.findIndex((s) => s.id === avatar.homeState));

  /** Attribute row: label + wrap-around ◀ value ▶ stepper. */
  const Stepper = (
    props: { label: string; value: string; onPrev(): void; onNext(): void },
  ) => (
    <div className="flex items-center justify-between gap-2 min-h-[44px] border border-rule rounded-[2px] px-2 bg-paper-deep">
      <span className="kicker text-[10px] shrink-0">{props.label}</span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${props.label} −`}
          onClick={props.onPrev}
          className="w-8 h-8 flex items-center justify-center border border-rule rounded-[2px] text-muted hover:text-ink hover:border-gold transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-ink min-w-[104px] text-center">{props.value}</span>
        <button
          type="button"
          aria-label={`${props.label} +`}
          onClick={props.onNext}
          className="w-8 h-8 flex items-center justify-center border border-rule rounded-[2px] text-muted hover:text-ink hover:border-gold transition-colors"
        >
          ›
        </button>
      </span>
    </div>
  );

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

        {/* Character select: the PM idles on the platform while the dossier is built */}
        <form onSubmit={submit} className="bg-card border border-rule rounded-panel p-6 sm:p-8 self-start">
          <p className="kicker kicker-gold">{t("newGame.record")}</p>
          <div className="rule-gold mt-2 mb-6" />

          {/* the platform */}
          <div className="flex items-stretch gap-5 mb-6">
            <div
              className="shrink-0 w-44 rounded-panel border border-gold/50 bg-navy/90 overflow-hidden flex flex-col items-center justify-end"
              aria-hidden="true"
            >
              <img
                src={previewUrl}
                alt=""
                className="pixelated"
                style={{ width: SPRITE_PREVIEW, height: SPRITE_PREVIEW * 1.5, imageRendering: "pixelated" }}
              />
              <div className="w-full h-2 bg-[#c9a96a]/70" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
              <p className="kicker kicker-gold">{t("avatar.kicker")}</p>
              <img
                src={pmAvatarDataUrl(avatar)}
                alt=""
                width={96}
                height={96}
                className="pixelated rounded-[2px] border border-gold/50 shadow-lift mt-3"
              />
              <p className="text-sm text-muted leading-relaxed mt-3">{t("avatar.lead")}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {Stepper({ label: t("avatar.skin"), value: `${t("avatar.skinTone")} ${skinIndex + 1}`, onPrev: () => setAvatarField("skin", AVATAR_SKINS[stepIndex(AVATAR_SKINS.length, skinIndex, -1)][0]), onNext: () => setAvatarField("skin", AVATAR_SKINS[stepIndex(AVATAR_SKINS.length, skinIndex, 1)][0]) })}
            {Stepper({ label: t("avatar.hair"), value: t(`avatar.hair_${AVATAR_HAIRS[hairIndex].id}`), onPrev: () => setAvatarField("hair", AVATAR_HAIRS[stepIndex(AVATAR_HAIRS.length, hairIndex, -1)].id), onNext: () => setAvatarField("hair", AVATAR_HAIRS[stepIndex(AVATAR_HAIRS.length, hairIndex, 1)].id) })}
            {Stepper({ label: t("avatar.headwear"), value: t(HEADWEAR[headIndex].key), onPrev: () => setAvatarField("headwear", HEADWEAR[stepIndex(HEADWEAR.length, headIndex, -1)].id), onNext: () => setAvatarField("headwear", HEADWEAR[stepIndex(HEADWEAR.length, headIndex, 1)].id) })}
            {Stepper({ label: t("avatar.attire"), value: t(`avatar.attire_${AVATAR_ATTIRE[attireIndex].id}`), onPrev: () => setAvatarField("attire", AVATAR_ATTIRE[stepIndex(AVATAR_ATTIRE.length, attireIndex, -1)].id), onNext: () => setAvatarField("attire", AVATAR_ATTIRE[stepIndex(AVATAR_ATTIRE.length, attireIndex, 1)].id) })}
            {Stepper({ label: t("avatar.body"), value: lang === "ms" ? AVATAR_BODIES[bodyIndex].label.ms : AVATAR_BODIES[bodyIndex].label.en, onPrev: () => setAvatarField("body", AVATAR_BODIES[stepIndex(AVATAR_BODIES.length, bodyIndex, -1)].id), onNext: () => setAvatarField("body", AVATAR_BODIES[stepIndex(AVATAR_BODIES.length, bodyIndex, 1)].id) })}
            {Stepper({ label: t("avatar.homeState"), value: STATES[stateIndex].name, onPrev: () => setAvatarField("homeState", STATES[stepIndex(STATES.length, stateIndex, -1)].id), onNext: () => setAvatarField("homeState", STATES[stepIndex(STATES.length, stateIndex, 1)].id) })}

            {/* glasses chip */}
            <button
              type="button"
              aria-pressed={avatar.glasses ?? false}
              onClick={() => setAvatarField("glasses", !(avatar.glasses ?? false))}
              className={cn(
                "w-full min-h-[44px] flex items-center justify-between border rounded-[2px] px-2 transition-colors",
                avatar.glasses ? "border-gold bg-gold/10 text-gold-text" : "border-rule bg-paper-deep text-muted hover:border-rule-strong",
              )}
            >
              <span className="kicker text-[10px]">{t("avatar.glasses")}</span>
              <span className={cn("font-pixel text-[8px]", avatar.glasses ? "text-gold-text" : "text-muted")}>
                {avatar.glasses ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          {/* career: segmented chips */}
          <fieldset className="mt-5">
            <legend className="kicker mb-2">{t("avatar.priorCareer")}</legend>
            <div className="grid grid-cols-2 gap-2">
              {CAREERS.map((career) => (
                <button
                  key={career.id}
                  type="button"
                  aria-pressed={avatar.priorCareer === career.id}
                  onClick={() => setAvatarField("priorCareer", career.id)}
                  className={cn(
                    "min-h-[44px] border rounded-[2px] px-2.5 py-2 text-xs font-semibold transition-colors",
                    avatar.priorCareer === career.id
                      ? "border-gold bg-gold/10 text-gold-text"
                      : "border-rule text-muted hover:border-rule-strong hover:text-ink",
                  )}
                >
                  {t(career.key)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* traits: chip toggles */}
          <fieldset className="mt-5">
            <legend className="kicker mb-2">{t("avatar.traits")}</legend>
            <div className="flex flex-wrap gap-2">
              {TRAITS.map((trait) => {
                const on = (avatar.traits ?? []).includes(trait.id);
                return (
                  <button
                    key={trait.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setAvatarField(
                        "traits",
                        on
                          ? (avatar.traits ?? []).filter((x) => x !== trait.id)
                          : [...(avatar.traits ?? []), trait.id],
                      )
                    }
                    className={cn(
                      "min-h-[36px] border rounded-[2px] px-2 py-1.5 text-xs font-semibold transition-colors",
                      on
                        ? "border-gold bg-gold/10 text-gold-text"
                        : "border-rule text-muted hover:border-rule-strong hover:text-ink",
                    )}
                  >
                    {t(trait.key)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 space-y-4">
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
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={difficulty === option.id}
                    onClick={() => setDifficulty(option.id)}
                    className={cn(
                      "w-full text-left flex gap-3 items-start border rounded-[2px] p-3.5 transition-colors min-h-[44px]",
                      difficulty === option.id
                        ? "border-gold bg-gold/10"
                        : "border-rule bg-paper-deep hover:border-rule-strong",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1 w-3 h-3 rounded-full border shrink-0",
                        difficulty === option.id ? "border-gold bg-gold" : "border-rule-strong",
                      )}
                    />
                    <span>
                      <span className="text-sm font-semibold block text-ink">{option.label}</span>
                      <span className="text-xs text-muted leading-snug block mt-0.5">{option.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <Button type="submit" className="w-full">
              {t("newGame.takeOffice")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Live-preview sprite width in px (3x of the 64-wide sheet, D-16). */
const SPRITE_PREVIEW = 192;
