import type { Lang } from "../types/lang";

/** Bilingual inline text for Phase 7 content scaffolding (policies, bills,
 * budget lines, cabinet posts). The Phase 8 pass decides what graduates into
 * the en/ms key maps. */
export interface LText {
  en: string;
  ms: string;
}

export function tx(text: LText, lang: Lang): string {
  return text[lang];
}
