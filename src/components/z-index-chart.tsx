import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import type { ZIndexPoint, ZIndexSeries } from "@/lib/z-index";
import { formatMetricValue, metricConfig } from "@/lib/metrics";
import { getSeriesColor } from "@/lib/series-colors";
import { ChartLegend } from "@/components/chart-legend";

type ZIndexChartProps = {
  points: ZIndexPoint[];
  series: ZIndexSeries[];
};

type ZIndexTooltipProps = {
  active?: boolean;
  payload?: { dataKey: string; payload: ZIndexPoint }[];
  series: ZIndexSeries[];
};

/**
 * Eigener Tooltip statt `formatter`: Ein reiner Z-Wert ("+0.8") ist für sich
 * genommen wenig aussagekräftig. Zusätzlich zum Rohwert werden Populations-
 * Mittelwert und Stichprobengröße gezeigt, damit erkennbar ist, wie
 * belastbar der Vergleich ist (z. B. "n=3" statt einer verlässlichen Norm).
 */
function ZIndexTooltip({ active, payload, series }: ZIndexTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload;
  const entries = series.filter((item) => point.values[item.id] !== undefined);

  return (
    <div className="rounded-lg border border-header bg-header px-3 py-2 text-sm text-white shadow-sm">
      <p className="mb-1 font-medium text-sage">{point.ageGroup}</p>

      {entries.map((item) => {
        const value = point.values[item.id];

        if (!value) {
          return null;
        }

        const config = metricConfig[item.id];

        return (
          <p key={item.id} style={{ color: getSeriesColor(series.indexOf(item)) }}>
            {item.label}: {value.z >= 0 ? "+" : ""}
            {value.z.toFixed(2)} σ ({formatMetricValue(value.rawValue, item.id)}
            {config.unit ? ` ${config.unit}` : ""}, Ø {formatMetricValue(value.mean, item.id)}
            {config.unit ? ` ${config.unit}` : ""}, n={value.sampleSize})
          </p>
        );
      })}
    </div>
  );
}

/** Feste Y-Achsen-Skala: ±3 Standardabweichungen decken die weit überwiegende Mehrheit realistischer Werte ab. */
const Y_DOMAIN: [number, number] = [-3, 3];
const Y_TICKS = [-3, -2, -1, 0, 1, 2, 3];

export function ZIndexChart({ points, series }: ZIndexChartProps) {
  return (
    <section className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Z-Index</h2>
      </div>

      {series.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-foreground/60">
          Für diese Auswahl liegen keine Werte vor.
        </div>
      ) : (
        <>
          <LineChart
            responsive
            width="100%"
            height={260}
            data={points}
            margin={{
              top: 10,
              right: 25,
              bottom: 5,
              left: 10,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--color-card-border)"
            />

            <XAxis dataKey="ageGroup" tickLine={false} axisLine={false} />

            <YAxis
              domain={Y_DOMAIN}
              ticks={Y_TICKS}
              allowDataOverflow
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value) => `${value.toFixed(1)} σ`}
            />

            <Tooltip
              content={<ZIndexTooltip series={series} />}
              cursor={{ stroke: "var(--color-card-border)", strokeDasharray: "3 3" }}
            />

            <ReferenceLine y={0} stroke="var(--color-card-border)" />

            {series.map((item, index) => (
              <Line
                key={item.id}
                type="monotone"
                dataKey={(point: ZIndexPoint) => point.values[item.id]?.z}
                name={item.label}
                stroke={getSeriesColor(index)}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                // Fehlende Werte (Disziplin in dieser Altersklasse nicht
                // getestet) sollen die Linie nicht abreißen lassen, siehe
                // dieselbe Begründung in development-chart.tsx.
                connectNulls
              />
            ))}
          </LineChart>

          <ChartLegend series={series} />
        </>
      )}
    </section>
  );
}
