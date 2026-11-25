import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EN_DICT } from "./en";
import { MS_DICT } from "./ms";

/**
 * Locale: English default, Bahasa Melayu full translation.
 * Persisted so the choice survives reloads; the language a record was
 * generated in is the language it keeps (decision log, wire items).
 */
export type Lang = "en" | "ms";

interface LocaleState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) => {
        set({ lang });
        applyDocumentLang(lang);
      },
    }),
    {
      name: "mtm:locale:v1",
      onRehydrateStorage: () => (state) => {
        // screen readers need the document language to match the locale
        if (state) applyDocumentLang(state.lang);
      },
    },
  ),
);

function applyDocumentLang(lang: Lang) {
  if (typeof document !== "undefined") document.documentElement.lang = lang;
}

export function getLang(): Lang {
  return useLocale.getState().lang;
}

/** UI chrome lookup: dotted path into the dictionary, EN fallback. */
export function translate(lang: Lang, path: string): string {
  const pick = (dict: Record<string, unknown>): string | undefined => {
    let cur: unknown = dict;
    for (const part of path.split(".")) {
      if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return typeof cur === "string" ? cur : undefined;
  };
  if (lang === "ms") {
    const ms = pick(MS_DICT);
    if (ms !== undefined) return ms;
  }
  return pick(EN_DICT) ?? path;
}

/** Reactive helper for components: t() for plain strings, tf() for templates. */
export function useT() {
  const lang = useLocale((s) => s.lang);
  return {
    lang,
    t: (path: string) => translate(lang, path),
    tf: (path: string, vars: Record<string, string | number>) => fill(translate(lang, path), vars),
  };
}

/** Fills %{name} markers in a translated template. */
export function fill(template: string, vars: Record<string, string | number>): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`%{${key}}`).join(String(value));
  }
  return out;
}

export function tf(path: string, vars: Record<string, string | number>): string {
  return fill(translate(getLang(), path), vars);
}
