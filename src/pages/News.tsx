import { useState } from "react";
import { useGameStore } from "../stores/game-store";
import { OUTLETS } from "../components/news/NewsList";
import type { NewsCategory, NewsItem, OutletId } from "../types/game";
import { shortDateLabel } from "../engine/calendar";
import { useT } from "../i18n/store";
import { cn } from "../utils/cn";

type Filter = OutletId | "all";

const EDITION_NAME = "The Federal Desk";

/** Small caps category tag, as printed above a story. */
function SectionTag({ category }: { category: NewsCategory }) {
  const { t } = useT();
  return (
    <span className="kicker text-[10px] border border-rule-strong px-1.5 py-0.5 rounded-[1px]">
      {t(`category.${category}`)}
    </span>
  );
}

interface FrontPageProps {
  items: NewsItem[];
  outlet: OutletId | null;
  onOpen: (item: NewsItem) => void;
}

/**
 * The front page: nameplate, dateline, a lead story and the rest flowed
 * into newsprint columns. Copy is the game's own; only the presentation
 * is print.
 */
function FrontPage({ items, outlet, onOpen }: FrontPageProps) {
  const { t, lang } = useT();
  const [lead, ...rest] = items;
  const paperName = outlet ? OUTLETS[outlet].name : EDITION_NAME;
  const paperNote = outlet ? t(OUTLETS[outlet].noteKey) : t("news.deskNote");

  return (
    <article className="newspaper px-5 sm:px-10 py-7 sm:py-9">
      {/* honesty strip */}
      <p className="kicker text-[9px] text-center">{t("news.honesty")}</p>

      {/* nameplate */}
      <header className="mt-4 text-center">
        <div className="flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted">
          <span className="hidden sm:inline">{shortDateLabel(lead.turn, lang)}</span>
          <span className="kicker kicker-gold text-[10px]">{outlet ? t("news.daily") : t("news.allEditionsTag")}</span>
          <span className="hidden sm:inline tabular">No. {lead.turn + 1}</span>
        </div>
        <h2 className="display font-semibold leading-none mt-2 tracking-tight text-[2.4rem] sm:text-5xl">
          {paperName}
        </h2>
        <div className="nameplate-rule mt-3" />
        <p className="text-xs text-muted mt-2 italic">{paperNote}</p>
      </header>

      {/* lead story */}
      <section aria-label={t("news.leadStory")} className="mt-7 max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3">
          <SectionTag category={lead.category} />
          <span className="kicker">{shortDateLabel(lead.turn, lang)}</span>
        </div>
        <button
          type="button"
          onClick={() => onOpen(lead)}
          className="group block w-full text-left sm:text-center mt-3"
        >
          <h3 className="display font-semibold leading-[1.04] text-[1.9rem] sm:text-[2.6rem] group-hover:text-[var(--gold-text)] transition-colors">
            {lead.headline}
          </h3>
        </button>
        {lead.body && (
          <p className="text-sm sm:text-[0.95rem] leading-relaxed text-ink/85 mt-4 text-left sm:text-center">
            {lead.body}
          </p>
        )}
        <div className="rule-double mt-6" />
      </section>

      {/* the rest of the edition, flowed into columns */}
      {rest.length > 0 && (
        <section aria-label={t("news.moreStories")} className="mt-6">
          <div className="columns-1 sm:columns-2 xl:columns-3 gap-8" style={{ columnRule: "1px solid var(--rule)" }}>
            {rest.map((item) => (
              <div key={item.id} className="break-inside-avoid mb-6 pb-6 border-b border-rule last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <SectionTag category={item.category} />
                  <span className="kicker text-[9px]">
                    {OUTLETS[item.outlet].name} · {shortDateLabel(item.turn, lang)}
                  </span>
                </div>
                <button type="button" onClick={() => onOpen(item)} className="group text-left w-full mt-2">
                  <h4 className="display text-lg font-semibold leading-snug group-hover:text-[var(--gold-text)] transition-colors">
                    {item.headline}
                  </h4>
                </button>
                {item.body && <p className="text-sm text-muted leading-relaxed mt-1.5">{item.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 pt-4 border-t-[3px] border-double border-rule-strong flex flex-wrap items-center justify-between gap-2">
        <span className="kicker text-[9px]">{t("news.printedIn")}</span>
        <span className="kicker text-[9px]">{paperName} · {t("news.fictionTag")}</span>
        <span className="kicker text-[9px] tabular">{t("news.pageOf")}</span>
      </footer>
    </article>
  );
}

interface ArticleProps {
  item: NewsItem;
  siblings: NewsItem[];
  onBack: () => void;
  onOpen: (item: NewsItem) => void;
}

/** One story, read as an article page inside the same sheet. */
function ArticleView({ item, siblings, onBack, onOpen }: ArticleProps) {
  const { t, lang, tf } = useT();
  const more = siblings.filter((s) => s.id !== item.id).slice(0, 5);
  return (
    <article className="newspaper px-5 sm:px-10 py-7 sm:py-9">
      <header className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="kicker kicker-gold hover:text-[var(--ink)] transition-colors"
        >
          ← {t("news.backToFront")}
        </button>
        <div className="nameplate-rule mt-4" />
        <p className="display text-2xl sm:text-3xl font-semibold mt-3">{OUTLETS[item.outlet].name}</p>
        <p className="kicker text-[9px] mt-1">
          {shortDateLabel(item.turn, lang)} · {t(OUTLETS[item.outlet].noteKey)}
        </p>
      </header>

      <div className="mt-7 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <SectionTag category={item.category} />
          <span aria-hidden="true" className="flex-1 border-t border-rule" />
        </div>
        <h2 className="display font-semibold leading-[1.05] text-[1.9rem] sm:text-[2.5rem] mt-3">
          {item.headline}
        </h2>
        <p className="kicker mt-3">
          {tf("news.byline", { outlet: OUTLETS[item.outlet].name })}
        </p>
        <div className="rule-double mt-4" />
        {item.body ? (
          <p className="drop-cap text-[1.02rem] leading-[1.75] mt-5">{item.body}</p>
        ) : (
          <p className="text-sm text-muted mt-5 italic">
            {t("news.copyPending")}
          </p>
        )}
      </div>

      {more.length > 0 && (
        <aside aria-label={t("news.articleAria")} className="mt-9 max-w-3xl mx-auto">
          <p className="kicker kicker-gold">{t("news.alsoIn")}</p>
          <div className="rule-gold mt-2 mb-3" />
          <ul className="divide-y divide-rule">
            {more.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onOpen(s)}
                  className="group w-full text-left py-2.5 flex items-baseline gap-3"
                >
                  <span className="kicker text-[9px] shrink-0 w-20">{shortDateLabel(s.turn, lang)}</span>
                  <span className="display text-sm font-semibold group-hover:text-[var(--gold-text)] transition-colors">
                    {s.headline}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}

export function News() {
  const game = useGameStore((s) => s.game);
  const { t } = useT();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  if (!game) return null;

  const items = [...game.news].reverse().filter((item) => filter === "all" || item.outlet === filter);
  const open = openId ? items.find((i) => i.id === openId) ?? null : null;

  const switchFilter = (id: Filter) => {
    setFilter(id);
    setOpenId(null);
  };

  return (
    <div className="page-enter">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-6 bg-gold" />
          <p className="kicker kicker-gold">{t("news.kicker")}</p>
        </div>
        <h1 className="headline mt-3">{t("news.title")}</h1>
        <p className="lede mt-3 text-sm">
          {t("news.lead")}
        </p>
      </header>

      <div role="tablist" aria-label={t("news.tabAria")} className="flex flex-wrap gap-2 mb-5">
        {(["all", "peninsula", "borneo", "sinar"] as const).map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={filter === id}
            onClick={() => switchFilter(id)}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border rounded-[2px] transition-colors",
              filter === id
                ? "border-gold text-gold-text bg-paper-deep"
                : "border-rule-strong text-muted hover:text-ink hover:border-gold/60",
            )}
          >
            {id === "all" ? t("news.allEditions") : OUTLETS[id].name}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="newspaper px-6 py-10 text-center">
          <p className="display text-xl font-semibold">{t("news.pressesIdle")}</p>
          <p className="text-sm text-muted mt-2 max-w-prose mx-auto">
            {t("news.pressesIdleText")}
          </p>
        </div>
      ) : open ? (
        <ArticleView
          item={open}
          siblings={items}
          onBack={() => setOpenId(null)}
          onOpen={(i) => setOpenId(i.id)}
        />
      ) : (
        <FrontPage items={items} outlet={filter === "all" ? null : filter} onOpen={(i) => setOpenId(i.id)} />
      )}
    </div>
  );
}
