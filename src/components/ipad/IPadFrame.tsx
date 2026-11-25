import type { ReactNode } from "react";

/**
 * The iPad frame (decision D-07, v2 shell): bezel, camera dot and soft shadow
 * on desktop pointers; full-bleed on narrow viewports and touch devices. The
 * screen area clips to the bezel so scenes and overlays never bleed out.
 */
export function IPadFrame({ children }: { children: ReactNode }) {
  return (
    <div className="ipad-backdrop min-h-dvh flex items-stretch justify-center">
      <div className="ipad-device relative flex flex-col overflow-hidden">
        <div className="ipad-camera" aria-hidden="true" />
        <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
