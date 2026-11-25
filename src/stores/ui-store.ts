import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeId = "night" | "paper";
export type BodySize = "base" | "large";

interface UiState {
  theme: ThemeId;
  bodySize: BodySize;
  setTheme(theme: ThemeId): void;
  setBodySize(size: BodySize): void;
}

function applyToDocument(theme: ThemeId, bodySize: BodySize): void {
  const root = document.documentElement;
  // Jalur daylight is the default on <html>; the Night umber scheme is opt-in.
  root.classList.toggle("theme-night", theme === "night");
  root.style.setProperty("--mtm-body-size", bodySize === "large" ? "18px" : "16px");
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "paper",
      bodySize: "base",
      setTheme(theme) {
        set({ theme });
        applyToDocument(theme, useUiStore.getState().bodySize);
      },
      setBodySize(bodySize) {
        set({ bodySize });
        applyToDocument(useUiStore.getState().theme, bodySize);
      },
    }),
    {
      // Key bumped for the redesign so older light-scheme prefs do not shadow the new default.
      name: "mtm:ui:v2",
      partialize: (state) => ({ theme: state.theme, bodySize: state.bodySize }),
      onRehydrateStorage: () => (state) => {
        applyToDocument(state?.theme ?? "paper", state?.bodySize ?? "base");
      },
    },
  ),
);
