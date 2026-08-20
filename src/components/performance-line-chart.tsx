import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { computeChartDomain } from "@/lib/chart-domain";

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

  const domain = computeChartDomain(values, 0.25);

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-5">
        <h3 className="font-semibold">{title}</h3>

        <p className="mt-1 text-sm text-foreground/60">
          {betterDirection === "higher" ? "Höher ist besser" : "Niedriger ist besser"}
        </p>
      </div>

      {cleanData.length < 2 ? (
        <div className="flex h-64 items-center justify-center text-sm text-foreground/60">
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
            left: 10,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-card-border)" />

          <XAxis dataKey="date" tickLine={false} axisLine={false} />

          <YAxis
            domain={domain}
            tickLine={false}
            axisLine={false}
            width={60}
            unit={unit}
            tickFormatter={(value) => Number(value).toFixed(decimals)}
          />

          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(decimals)} ${unit}`, title]}
            contentStyle={{
              backgroundColor: "var(--color-header)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
            }}
            labelStyle={{ color: "var(--color-sage)" }}
            itemStyle={{ color: "#fff" }}
          />

          <Line
            type="linear"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--color-primary)" }}
            activeDot={{ r: 6, fill: "var(--color-header)" }}
          />
        </LineChart>
      )}
    </div>
  );
}
