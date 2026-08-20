import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { DevelopmentPoint, DevelopmentSeries } from "@/lib/development";
import { formatMetricValue, metricConfig } from "@/lib/metrics";
import type { DevelopmentMetric } from "@/lib/types";

const seriesColors = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#4338ca",
  "#ea580c",
];

type DevelopmentChartProps = {
  metric: DevelopmentMetric;
  points: DevelopmentPoint[];
  series: DevelopmentSeries[];
  athleteCount: number;
};

export function DevelopmentChart({
  metric,
  points,
  series,
  athleteCount,
}: DevelopmentChartProps) {
  const config = metricConfig[metric];

  const values = points.flatMap((point) =>
    series
      .map((item) => point[item.id])
      // `typeof NaN === "number"` ist true – Number.isFinite schließt NaN korrekt aus
      // und verhindert, dass ein einzelner ungültiger Wert Math.min/max vergiftet.
      .filter((value): value is number => Number.isFinite(value)),
  );

  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;

  const range = maxValue - minValue;

  const padding = range > 0 ? range * 0.2 : Math.max(Math.abs(minValue) * 0.1, 1);

  const domain: [number, number] = [Math.max(0, minValue - padding), maxValue + padding];

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{config.label}</h2>

          <p className="mt-1 text-sm text-zinc-500">
            {config.betterDirection === "higher" ? "höher ist besser" : "niedriger ist besser"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-zinc-500">Athlet:innen</p>

          <p className="text-2xl font-semibold">{athleteCount}</p>
        </div>
      </div>

      {series.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
          Für diese Auswahl liegen keine Werte vor.
        </div>
      ) : (
        <LineChart
          responsive
          width="100%"
          height={360}
          data={points}
          margin={{
            top: 10,
            right: 25,
            bottom: 5,
            left: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />

          <XAxis dataKey="ageGroup" tickLine={false} axisLine={false} />

          <YAxis
            domain={domain}
            tickLine={false}
            axisLine={false}
            width={50}
            unit={config.unit}
            tickFormatter={(value) => formatMetricValue(value, metric)}
          />

          <Tooltip
            formatter={(value, name) => [
              `${formatMetricValue(value, metric)}${config.unit ? ` ${config.unit}` : ""}`,
              name,
            ]}
          />

          <Legend />

          {series.map((item, index) => (
            <Line
              key={item.id}
              type="linear"
              dataKey={item.id}
              name={item.label}
              stroke={seriesColors[index % seriesColors.length]}
              strokeDasharray={item.participantType === "reference" ? "5 4" : undefined}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      )}
    </section>
  );
}







