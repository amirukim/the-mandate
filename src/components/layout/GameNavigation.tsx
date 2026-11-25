import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useT } from "../../i18n/store";
import { cn } from "../../utils/cn";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface GameNavigationProps {
  sections: Array<{ label: string; items: NavItem[] }>;
  queueCount: number;
  dateLabel: string;
  chapterLabel: string;
  onClose(): void;
  onExit(): void;
}

const FOCUSABLE = 'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The pause menu: a modal drawer that traps focus, closes on Escape or the
 * overlay, and hands focus back to whatever opened it.
 */
export function GameNavigation({ sections, queueCount, dateLabel, chapterLabel, onClose, onExit }: GameNavigationProps) {
  const { t } = useT();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label={t("nav.closeNav")}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        id="game-nav"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.navTitle")}
        className="absolute right-0 top-0 h-full w-[20rem] max-w-[85vw] bg-chrome-deep border-l border-gold/30 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-chrome-ink/15">
          <span className="kicker text-chrome-gold">{t("nav.navTitle")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.closeNav")}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] border border-chrome-ink/30 rounded-[2px] text-chrome-ink/90"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <nav aria-label={t("nav.navAria")} className="flex flex-col gap-6">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="kicker px-3 mb-2">{section.label}</p>
                <ul>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-3 py-3 rounded-[2px] transition-colors font-display text-[15px] font-semibold",
                              isActive
                                ? "bg-chrome-ink/10 text-chrome-gold"
                                : "text-chrome-ink/85 hover:text-chrome-ink hover:bg-chrome-ink/5",
                            )
                          }
                        >
                          <Icon size={18} aria-hidden="true" className="shrink-0 text-chrome-gold/80" />
                          <span className="min-w-0 truncate">{item.label}</span>
                          {item.to === "/game/briefing" && queueCount > 0 && (
                            <span className="tabular ml-auto text-[11px] font-bold text-chrome-gold border border-chrome-gold/60 rounded-[2px] px-1">
                              {queueCount}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="px-4 py-3 border-t border-chrome-ink/15">
          <p className="tabular text-sm text-chrome-gold">{dateLabel}</p>
          <p className="kicker mt-0.5 text-chrome-ink/60">{chapterLabel}</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="w-full text-sm text-chrome-ink/70 hover:text-chrome-ink py-3.5 border-t border-chrome-ink/15 text-left px-4"
        >
          {t("nav.exitCampaign")}
        </button>
      </div>
    </div>
  );
}
