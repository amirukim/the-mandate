import type { ReactNode } from "react";

/**
 * The iPad shell (decision D-07, v2 shell): full-screen on every viewport.
 * The iPad *UI* is the presentation — status bar, home screen with wallpaper,
 * dock, app surfaces — not a shrunken device mock-up, so there is no bezel
 * and no centred frame to make the game look small.
 */
export function IPadFrame({ children }: { children: ReactNode }) {
  return (
    <div className="ipad-backdrop min-h-dvh flex items-stretch justify-center">
      <div className="ipad-device relative flex flex-col overflow-hidden">
        <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
