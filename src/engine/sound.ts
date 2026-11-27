import { useSyncExternalStore } from "react";

/**
 * The UI sound kit (D-21): tiny synthesised Web Audio cues, no asset files.
 * Silent until the first user gesture unlocks an AudioContext, silent where
 * reduced motion applies, and master mute + volume persist in Settings.
 */

const STORAGE_KEY = "mtm:sound";

type Sfx =
  | "tap"
  | "hover"
  | "confirm"
  | "back"
  | "error"
  | "open"
  | "close"
  | "stamp"
  | "blip";

interface SoundPrefs {
  muted: boolean;
  volume: number; // 0..1
}

let prefs: SoundPrefs = { muted: true, volume: 0.5 };
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) prefs = { ...prefs, ...(JSON.parse(raw) as Partial<SoundPrefs>) };
} catch {
  /* a hostile sound pref never blocks boot */
}

const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;
let unlocked = false;

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage full or blocked: session-only prefs */
  }
  listeners.forEach((fn) => fn());
}

function readReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Call once from the shell: the context unlocks on the first real gesture. */
export function attachSoundUnlock(): () => void {
  const unlock = () => {
    if (!unlocked) {
      unlocked = true;
      try {
        ctx = ctx ?? new AudioContext();
        void ctx.resume();
      } catch {
        /* no WebAudio: the game stays silent */
      }
    } else if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
}

export function getSoundPrefs(): SoundPrefs {
  return prefs;
}

export function setSoundMuted(muted: boolean): void {
  prefs = { ...prefs, muted };
  persist();
}

export function setSoundVolume(volume: number): void {
  prefs = { ...prefs, volume: Math.max(0, Math.min(1, volume)) };
  persist();
}

/** React hook: re-renders when sound prefs change. */
export function useSoundPrefs(): SoundPrefs {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => prefs,
    () => prefs,
  );
}

/* --- the synth ---------------------------------------------------------- */

/** One cue: a short envelope on a simple oscillator, per-kind voice. */
function tone(freq: number, duration: number, type: OscillatorType, gain: number, when = 0, slide = 0): void {
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide !== 0) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + duration);
  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(gain * prefs.volume, t0 + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const CUES: Record<Sfx, () => void> = {
  tap: () => tone(720, 0.05, "square", 0.12),
  hover: () => tone(520, 0.03, "triangle", 0.05),
  confirm: () => {
    tone(540, 0.07, "square", 0.1);
    tone(810, 0.1, "square", 0.1, 0.06);
  },
  back: () => tone(420, 0.08, "triangle", 0.1, 0, -180),
  error: () => {
    tone(190, 0.12, "sawtooth", 0.12);
    tone(160, 0.14, "sawtooth", 0.1, 0.1);
  },
  open: () => tone(330, 0.08, "triangle", 0.09, 0, 220),
  close: () => tone(500, 0.08, "triangle", 0.09, 0, -220),
  stamp: () => {
    tone(140, 0.1, "square", 0.16);
    tone(90, 0.12, "square", 0.12, 0.05);
  },
  blip: () => tone(980, 0.03, "square", 0.05),
};

/** Play one UI cue. Guards: unlocked context, not muted, reduced motion. */
export function playSfx(kind: Sfx): void {
  if (!unlocked || prefs.muted || readReducedMotion() || !ctx || ctx.state !== "running") return;
  CUES[kind]();
}
