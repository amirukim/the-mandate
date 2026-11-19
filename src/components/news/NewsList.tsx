import type { NewsItem, OutletId } from "../../types/game";
import { shortDateLabel } from "../../engine/calendar";
import type { Lang } from "../../i18n/store";

export const OUTLETS: Record<OutletId, { name: string; noteKey: string }> = {
  peninsula: { name: "The Peninsula Post", noteKey: "news.outletPeninsulaNote" },
  borneo: { name: "Borneo Herald", noteKey: "news.outletBorneoNote" },
  sinar: { name: "Sinar Waktu", noteKey: "news.outletSinarNote" },
};

interface NewsListProps {
  items: NewsItem[];
  lang?: Lang;
}

/** Print-style news wire. Fictional outlets reporting on a fictional government. */
export function NewsList({ items, lang = "en" }: NewsListProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted text-sm py-6">
        {lang === "ms"
          ? "Berita wire senyap. Belum ada liputan media pada penggal ini; keputusan pertama anda akan mengubahnya."
          : "The wire is quiet. No press coverage yet this term; your first decision will fix that."}
      </p>
    );
  }
  return (
    <ol className="divide-y divide-rule">
      {items.map((item) => (
        <li key={item.id} className="py-4">
          <p className="kicker">
            {OUTLETS[item.outlet].name} · {shortDateLabel(item.turn, lang)}
          </p>
          <h3 className="display text-lg font-semibold leading-snug mt-1">{item.headline}</h3>
          {item.body && <p className="text-sm text-muted mt-1 leading-relaxed">{item.body}</p>}
        </li>
      ))}
    </ol>
  );
}
