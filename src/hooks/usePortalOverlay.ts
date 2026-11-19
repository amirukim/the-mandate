import { useEffect, useState } from "react";

/**
 * Fixed-overlay plumbing for cinematic screens (scene theatre, full-screen map):
 * a portal container appended to <body>, body scroll lock, and cleanup.
 * Pair with trapTab() for keyboard containment.
 */
export function usePortalOverlay(id: string) {
  const [container] = useState<HTMLElement>(() => {
    if (typeof document === "undefined") return null as unknown as HTMLElement;
    const el = document.createElement("div");
    el.dataset.overlay = id;
    return el;
  });

  useEffect(() => {
    document.body.appendChild(container);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      container.remove();
    };
  }, [container]);

  return { container };
}

/** Keeps Tab focus inside the overlay root (minimal modal containment). */
export function trapTab(event: React.KeyboardEvent, root: HTMLElement | null): void {
  if (event.key !== "Tab" || !root) return;
  const focusables = root.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === root)) {
    last.focus();
    event.preventDefault();
  } else if (!event.shiftKey && active === last) {
    first.focus();
    event.preventDefault();
  }
}

/** Honours the OS reduce-motion setting for cinematic effects. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}
