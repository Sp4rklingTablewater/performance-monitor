import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const metricConfig = {
  jump_height: {
    label: "Sprung absolut",
    unit: "cm",
    betterDirection: "higher",
  },
  sprint_93639: {
    label: "9-3-6-3-9",
    unit: "s",
    betterDirection: "lower",
  },
  ball_control: {
    label: "Ballkontrolle",
    unit: "",
    betterDirection: "higher",
  },
} as const;

type ComparisonChartProps = {
  metric: ComparisonMetric;
  data: ComparisonChartItem[];
  birthYear: string;
  ageGroup: string;
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

export function ComparisonChart({ metric, data, birthYear, ageGroup }: ComparisonChartProps) {
  const config = metricConfig[metric];

  const sortedData = [...data].sort((a, b) => {
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
            {birthYear === "all" ? "Alle Jahrgänge" : `Jahrgang ${birthYear}`}
            {" · "}
            {ageGroup}
            {" · "}
            {config.betterDirection === "higher" ? "höher ist besser" : "niedriger ist besser"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-zinc-500">Athlet:innen</p>

          <p className="text-2xl font-semibold">{athleteValues.length}</p>

          {medianValue !== null && (
            <p className="mt-1 text-sm text-zinc-500">
              Median: {medianValue}
              {config.unit ? ` ${config.unit}` : ""}
            </p>
          )}
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
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
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />

          <XAxis type="number" dataKey="value" domain={domain} tickLine={false} />

          <YAxis type="category" dataKey="label" width={135} tickLine={false} axisLine={false} />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value) => [`${value}${config.unit ? ` ${config.unit}` : ""}`, config.label]}
          />

          {medianValue !== null && <ReferenceLine x={medianValue} strokeDasharray="4 4" />}

          <Scatter data={sortedData} />
        </ScatterChart>
      )}
    </section>
  );
}
