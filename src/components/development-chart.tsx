import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { DevelopmentPoint, DevelopmentSeries } from "@/lib/development";
import { formatMetricValue, metricConfig } from "@/lib/metrics";
import { computeChartDomain } from "@/lib/chart-domain";
import type { DevelopmentMetric } from "@/lib/types";

const seriesColors = [
  "#4d8c79",
  "#b5651d",
  "#2f5d50",
  "#c9a227",
  "#5b7f77",
  "#8a4b3b",
  "#3c6e71",
  "#a8763e",
  "#264d43",
  "#6b4226",
];

type DevelopmentChartProps = {
  metric: DevelopmentMetric;
  points: DevelopmentPoint[];
  series: DevelopmentSeries[];
  athleteCount: number;
};

export function DevelopmentChart({ metric, points, series, athleteCount }: DevelopmentChartProps) {
  const config = metricConfig[metric];

  const values = points.flatMap((point) =>
    series
      .map((item) => point[item.id])
      // `typeof NaN === "number"` ist true – Number.isFinite schließt NaN korrekt aus
      // und verhindert, dass ein einzelner ungültiger Wert Math.min/max vergiftet.
      .filter((value): value is number => Number.isFinite(value)),
  );

  const domain = computeChartDomain(values);

  return (
    <section className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{config.label}</h2>

          <p className="mt-1 text-sm text-foreground/60">
            {config.betterDirection === "higher" ? "höher ist besser" : "niedriger ist besser"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-foreground/60">Athlet:innen</p>

          <p className="text-2xl font-semibold">{athleteCount}</p>
        </div>
      </div>

      {series.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-foreground/60">
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
            left: 10,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-card-border)" />

          <XAxis dataKey="ageGroup" tickLine={false} axisLine={false} />

          <YAxis
            domain={domain}
            tickLine={false}
            axisLine={false}
            width={64}
            unit={config.unit}
            tickFormatter={(value) => formatMetricValue(value, metric)}
          />

          <Tooltip
            formatter={(value, name) => [
              `${formatMetricValue(value, metric)}${config.unit ? ` ${config.unit}` : ""}`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "var(--color-header)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
            }}
            labelStyle={{ color: "var(--color-sage)" }}
            itemStyle={{ color: "#fff" }}
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
