import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryPoint } from "../../types/game";

export interface SeriesDef {
  key: keyof HistoryPoint;
  label: string;
  color: string;
  unit?: string;
}

interface TrendChartProps {
  history: HistoryPoint[];
  series: SeriesDef;
  height?: number;
}

/** One question per chart: a single indicator across the months governed. */
export function TrendChart({ history, series, height = 200 }: TrendChartProps) {
  return (
    <div style={{ height }} aria-label={`${series.label} chart`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 10, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--rule-strong)" }}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--rule-strong)",
              borderRadius: 3,
              fontSize: 12,
              color: "var(--ink)",
            }}
            labelStyle={{ color: "var(--muted)", fontWeight: 600 }}
            formatter={(value) => [`${value}${series.unit ?? ""}`, series.label]}
          />
          <Line
            type="monotone"
            dataKey={series.key}
            stroke={series.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
