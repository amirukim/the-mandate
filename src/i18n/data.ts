import type { GameEventDef, SceneOption } from "../types/narrative";
import type { ChosenOutcome } from "../engine/turn-flow";
import type { TurnReport } from "../engine/simulation";
import type { CharacterDef } from "../data/characters";
import type { CoalitionDef } from "../data/parties";
import type { StateDef } from "../data/states";
import type { Lang } from "./store";
import { EVENTS_CH1_MS, type EventMs } from "./ms-events-ch1";
import { EVENTS_RECURRING_MS } from "./ms-events-recurring";
import { CHARACTER_MS, COALITION_MS, STATE_MS, COUNSEL_MS, ECONOMY_MS } from "./ms-world";

const ALL_EVENTS_MS: Record<string, EventMs> = { ...EVENTS_CH1_MS, ...EVENTS_RECURRING_MS };

/* ---------------- Events ---------------- */

export interface DialogueDisplay {
  speaker: string;
  role: string;
  text: string;
}

export interface OptionDisplay extends SceneOption {
  label: string;
  detail: string;
  summary: string;
}

export interface EventDisplay {
  id: string;
  title: string;
  location: string;
  category: GameEventDef["category"];
  briefing: string[];
  dialogue: DialogueDisplay[];
  options: OptionDisplay[];
}

/** The display view of an event, in the active language. */
export function eventDisplay(event: GameEventDef, lang: Lang): EventDisplay {
  if (lang !== "ms") {
    return {
      id: event.id,
      title: event.title,
      location: event.location,
      category: event.category,
      briefing: event.briefing,
      dialogue: event.dialogue,
      options: event.options.map((o) => ({ ...o })),
    };
  }
  const ms = ALL_EVENTS_MS[event.id];
  if (!ms) {
    return {
      id: event.id,
      title: event.title,
      location: event.location,
      category: event.category,
      briefing: event.briefing,
      dialogue: event.dialogue,
      options: event.options.map((o) => ({ ...o })),
    };
  }
  const dialogue: DialogueDisplay[] = event.dialogue.map((line, i) => ({
    speaker: line.speaker,
    role: ms.dialogue?.[i]?.role ?? line.role,
    text: ms.dialogue?.[i]?.text ?? line.text,
  }));
  const options: OptionDisplay[] = event.options.map((option) => {
    const oMs = ms.options?.[option.id];
    return {
      ...option,
      label: oMs?.label ?? option.label,
      detail: oMs?.detail ?? option.detail,
      summary: oMs?.summary ?? option.summary,
    };
  });
  return {
    id: event.id,
    title: ms.title ?? event.title,
    location: ms.location ?? event.location,
    category: event.category,
    briefing: ms.briefing ?? event.briefing,
    dialogue,
    options,
  };
}

/** Looks up the display option for a stored option id. */
export function optionDisplay(event: GameEventDef, optionId: string, lang: Lang): SceneOption | null {
  const display = eventDisplay(event, lang);
  return display.options.find((o) => o.id === optionId) ?? null;
}

/** Translates a decided outcome (notes, news, option text) after the fact. */
export function outcomeDisplay(outcome: ChosenOutcome, lang: Lang): ChosenOutcome {
  if (lang !== "ms") return outcome;
  const ms = ALL_EVENTS_MS[outcome.event.id];
  const optionMs = ms?.options?.[outcome.option.id];
  if (!ms || !optionMs) return outcome;

  // Notes are the immediate consequences' notes, in order: translate positionally.
  const enOption = outcome.event.options.find((o) => o.id === outcome.option.id);
  const enNotes: string[] = [];
  (enOption?.consequences ?? []).forEach((c) => {
    if (c.delayTurns === undefined && c.note) enNotes.push(c.note);
  });
  const msNotes: (string | undefined)[] = [];
  (optionMs.consequences ?? []).forEach((c) => {
    if (c.note) msNotes.push(c.note);
  });

  const notes = outcome.notes.map((note) => {
    const at = enNotes.indexOf(note);
    return (at >= 0 ? msNotes[at] : undefined) ?? note;
  });

  // News item ids carry their consequence index: `${eventId}-${optionId}-${index}-${ni}`.
  const news = outcome.news.map((item) => {
    const m = /^.*-(\d+)-(\d+)$/.exec(item.id);
    const translated = m ? optionMs.consequences?.[Number(m[1])]?.news?.[Number(m[2])] : undefined;
    return translated
      ? { ...item, headline: translated.headline ?? item.headline, body: translated.body ?? item.body }
      : item;
  });

  return {
    ...outcome,
    option: {
      ...outcome.option,
      label: optionMs.label ?? outcome.option.label,
      detail: optionMs.detail ?? outcome.option.detail,
      summary: optionMs.summary ?? outcome.option.summary,
    },
    notes,
    news,
  };
}

/** Translates a month-end report's human strings. */
export function reportDisplay(report: TurnReport, _eventIdHint: string | null, lang: Lang): TurnReport {
  if (lang !== "ms") return report;
  const delayedNotes = report.delayedNotes.map((note) => {
    for (const ms of Object.values(ALL_EVENTS_MS)) {
      for (const option of Object.values(ms.options ?? {})) {
        const match = (option.consequences ?? []).find((c) => c.description === note);
        if (match?.description) return match.description;
      }
    }
    return note;
  });
  const headlines = report.headlines.map((item) => {
    if (item.id.startsWith("eco-")) {
      const econ = ECONOMY_MS.find((e) => e.en === item.headline);
      if (econ) return { ...item, headline: econ.headline, body: econ.body };
    }
    for (const ms of Object.values(ALL_EVENTS_MS)) {
      for (const option of Object.values(ms.options ?? {})) {
        for (const c of option.consequences ?? []) {
          const match = c.news?.find((n) => n.headline === item.headline);
          if (match) return { ...item, headline: match.headline ?? item.headline, body: match.body ?? item.body };
        }
      }
    }
    return item;
  });
  return { ...report, delayedNotes, headlines };
}

/** Monthly economy headline, in language. */
export function economyHeadlineMs(enHeadline: string): { headline: string; body: string } | null {
  const match = ECONOMY_MS.find((e) => e.en === enHeadline);
  return match ? { headline: match.headline, body: match.body } : null;
}

/* ---------------- Static data ---------------- */

export function characterText(def: CharacterDef, lang: Lang): CharacterDef {
  if (lang !== "ms") return def;
  const ms = CHARACTER_MS[def.id];
  return ms ? { ...def, role: ms.role, bio: ms.bio, loyaltyHint: ms.loyaltyHint } : def;
}

export function coalitionText(def: CoalitionDef, lang: Lang): CoalitionDef {
  if (lang !== "ms") return def;
  const ms = COALITION_MS[def.id];
  return ms ? { ...def, stance: ms.stance, note: ms.note } : def;
}

export function stateText(def: StateDef, lang: Lang): StateDef {
  if (lang !== "ms") return def;
  const note = STATE_MS[def.id];
  return note ? { ...def, note } : def;
}

/** Counsel voice in language; falls back to a neutral line. */
export function counselVoice(characterId: string, lang: Lang): ((subject: string) => string) | null {
  if (lang !== "ms") return null;
  return COUNSEL_MS[characterId] ?? null;
}
