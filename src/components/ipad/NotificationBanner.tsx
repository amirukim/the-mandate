import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useT } from "../../i18n/store";

export interface BannerItem {
  id: string;
  kind: "news" | "briefing";
  title: string;
  body?: string;
}

interface NotificationBannerProps {
  banner: BannerItem | null;
  onDismiss(): void;
}

/**
 * iPad-style notification banner (v2 shell). Rendered inside an ARIA live
 * region so screen readers hear it; auto-dismisses after five seconds.
 */
export function NotificationBanner({ banner, onDismiss }: NotificationBannerProps) {
  const { t } = useT();

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [banner, onDismiss]);

  return (
    <div aria-live="polite" role="status" className="pointer-events-none absolute inset-x-0 top-14 z-50 flex justify-center px-4">
      {banner && (
        <div className="pointer-events-auto app-surface w-full max-w-md bg-paper border border-gold/60 rounded-panel shadow-lift overflow-hidden">
          <div className="flex items-start gap-3 px-4 py-3">
            <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[2px] bg-gold" />
            <div className="min-w-0 flex-1">
              <p className="kicker text-[11px] text-gold-text">
                {banner.kind === "briefing" ? t("home.notifBriefing") : t("home.notifWire")}
              </p>
              <p className="text-sm font-semibold leading-snug mt-0.5">{banner.title}</p>
              {banner.body && <p className="text-xs text-muted mt-0.5 line-clamp-2">{banner.body}</p>}
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label={t("common.dismiss")}
              className="shrink-0 flex items-center justify-center w-7 h-7 border border-rule rounded-[2px] text-muted hover:text-ink hover:border-gold/60 transition-colors"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>
          <Link
            to={banner.kind === "briefing" ? "/game/briefing" : "/game/news"}
            onClick={onDismiss}
            className="block text-center text-xs font-semibold text-gold-text hover:text-gold-bright bg-paper-deep/60 py-1.5 border-t border-rule transition-colors"
          >
            {banner.kind === "briefing" ? t("office.openBriefings") : t("news.title")}
          </Link>
        </div>
      )}
    </div>
  );
}
