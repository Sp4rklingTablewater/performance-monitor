import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

type ChartPoint = {
  date: string;
  value: number;
};

type PerformanceLineChartProps = {
  title: string;
  unit: string;
  data: ChartPoint[];
  betterDirection: "higher" | "lower";
  /** Anzahl sinnvoller Nachkommastellen für Achsenbeschriftung/Tooltip. */
  decimals?: number;
};

export function PerformanceLineChart({
  title,
  unit,
  data,
  betterDirection,
  decimals = 0,
}: PerformanceLineChartProps) {
  // Nicht-finite Werte (z. B. NaN durch fehlerhafte Daten) würden Math.min/max
  // vergiften und die gesamte Achse unbrauchbar machen – daher vorab entfernen.
  const cleanData = data.filter((point) => Number.isFinite(point.value));
  const values = cleanData.map((point) => point.value);

  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;

  const range = maxValue - minValue;

  const padding = range > 0 ? range * 0.25 : Math.max(Math.abs(minValue) * 0.1, 1);

  const domain: [number, number] = [Math.max(0, minValue - padding), maxValue + padding];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-5">
        <h3 className="font-semibold">{title}</h3>

        <p className="mt-1 text-sm text-zinc-500">
          {betterDirection === "higher" ? "Höher ist besser" : "Niedriger ist besser"}
        </p>
      </div>

      {cleanData.length < 2 ? (
        <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
          Mindestens zwei Messungen für eine Entwicklung erforderlich.
        </div>
      ) : (
        <LineChart
          responsive
          width="100%"
          height={260}
          data={cleanData}
          margin={{
            top: 10,
            right: 15,
            bottom: 5,
            left: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />

          <XAxis dataKey="date" tickLine={false} axisLine={false} />

          <YAxis
            domain={domain}
            tickLine={false}
            axisLine={false}
            width={45}
            unit={unit}
            tickFormatter={(value) => Number(value).toFixed(decimals)}
          />

          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(decimals)} ${unit}`, title]}
          />

          <Line
            type="linear"
            dataKey="value"
            stroke="currentColor"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      )}
    </div>
  );
}
