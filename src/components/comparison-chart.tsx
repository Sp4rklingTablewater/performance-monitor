import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMetricValue, metricConfig } from "@/lib/metrics";
import { computeChartDomain } from "@/lib/chart-domain";
import type { ComparisonMetric } from "@/lib/types";

export type { ComparisonMetric };

export type ComparisonChartItem = {
  id: string;
  label: string;
  name: string;
  birthYear: number | null;
  participantType: "athlete" | "reference";
  testDate: string;
  value: number;
};

type ComparisonChartProps = {
  metric: ComparisonMetric;
  data: ComparisonChartItem[];
};

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

type ScatterTooltipProps = {
  active?: boolean;
  payload?: { payload: ComparisonChartItem }[];
  metric: ComparisonMetric;
};

/**
 * Recharts erzeugt für ScatterChart-Punkte zwei Tooltip-Einträge (X- und
 * Y-Achse sind beide datengetrieben), was mit einem `formatter` zu einer
 * doppelten Zeile führt. Ein eigener `content` zeigt stattdessen genau
 * einen Eintrag pro Punkt, direkt aus den Originaldaten gelesen.
 */
function ScatterTooltip({ active, payload, metric }: ScatterTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0].payload;
  const config = metricConfig[metric];

  return (
    <div className="rounded-lg border border-header bg-header px-3 py-2 text-sm text-white shadow-sm">
      <p className="font-medium">{item.label}</p>
      <p className="text-sage">
        {formatMetricValue(item.value, metric)}
        {config.unit ? ` ${config.unit}` : ""}
      </p>
    </div>
  );
}

type ScatterDotProps = {
  cx?: number;
  cy?: number;
  payload?: ComparisonChartItem;
};

/** Athlet:innen erhalten einen kräftigen Primary-Punkt, Referenzen einen zurückhaltenderen Sage-Punkt. */
function ScatterDot({ cx, cy, payload }: ScatterDotProps) {
  if (cx === undefined || cy === undefined) {
    return null;
  }

  const isReference = payload?.participantType === "reference";

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isReference ? 5 : 6}
      fill={isReference ? "var(--color-sage)" : "var(--color-primary)"}
      stroke="var(--color-header)"
      strokeWidth={isReference ? 1 : 1.5}
    />
  );
}

export function ComparisonChart({ metric, data }: ComparisonChartProps) {
  const config = metricConfig[metric];

  // Nicht-finite Werte (z. B. NaN durch fehlerhafte Daten) würden Math.min/max
  // vergiften und die gesamte Achse unbrauchbar machen – daher vorab entfernen.
  const cleanData = data.filter((item) => Number.isFinite(item.value));

  const sortedData = [...cleanData].sort((a, b) => {
    if (config.betterDirection === "higher") {
      return b.value - a.value;
    }

    return a.value - b.value;
  });

  const athleteValues = sortedData
    .filter((item) => item.participantType === "athlete")
    .map((item) => item.value);

  const medianValue = median(athleteValues);
  const values = sortedData.map((item) => item.value);

  const domain = computeChartDomain(values);

  return (
    <section className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{config.label}</h2>

          <p className="mt-1 text-sm text-foreground/60">
            {config.betterDirection === "higher" ? "Höher ist besser" : "Niedriger ist besser"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-foreground/60">Athlet:innen</p>

          <p className="text-2xl font-semibold">{athleteValues.length}</p>

          {medianValue !== null && (
            <p className="mt-1 text-sm text-foreground/60">
              Median: {formatMetricValue(medianValue, metric)}
              {config.unit ? ` ${config.unit}` : ""}
            </p>
          )}
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-foreground/60">
          Für diese Auswahl liegen keine Werte vor.
        </div>
      ) : (
        <ScatterChart
          responsive
          width="100%"
          height={Math.max(300, sortedData.length * 40)}
          margin={{
            top: 10,
            right: 35,
            bottom: 20,
            left: 15,
          }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="var(--color-card-border)"
          />

          <XAxis
            type="number"
            dataKey="value"
            domain={domain}
            tickLine={false}
            tickFormatter={(value) => formatMetricValue(value, metric)}
          />

          <YAxis type="category" dataKey="label" width={135} tickLine={false} axisLine={false} />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<ScatterTooltip metric={metric} />}
          />

          {medianValue !== null && (
            <ReferenceLine x={medianValue} stroke="var(--color-header)" strokeDasharray="4 4" />
          )}

          <Scatter data={sortedData} shape={<ScatterDot />} />
        </ScatterChart>
      )}
    </section>
  );
}
