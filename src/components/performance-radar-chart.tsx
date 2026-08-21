import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";
import type { ProfilePoint, ProfileSeries } from "@/lib/profile";
import { formatMetricValue, metricConfig } from "@/lib/metrics";

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

type PerformanceRadarChartProps = {
  points: ProfilePoint[];
  series: ProfileSeries[];
  athleteCount: number;
};

type RadarTooltipProps = {
  active?: boolean;
  payload?: { payload: ProfilePoint; dataKey: string; color?: string }[];
  series: ProfileSeries[];
};

/**
 * Die Radar-Achsen zeigen normierte Werte (0–100), die für Menschen nicht
 * unmittelbar lesbar sind. Ein eigener Tooltip löst pro Person den
 * hinterlegten Rohwert (samt Einheit) für die gerade gehoverte Messgröße auf.
 */
function RadarTooltip({ active, payload, series }: RadarTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const metricKey = payload[0].payload.metricKey;
  const config = metricConfig[metricKey];

  return (
    <div className="rounded-lg border border-header bg-header px-3 py-2 text-sm text-white shadow-sm">
      <p className="mb-1 font-medium">{config.label}</p>

      {payload.map((entry) => {
        const person = series.find((item) => item.id === entry.dataKey);
        const rawValue = person?.rawValues[metricKey];

        return (
          <p key={entry.dataKey} className="text-sage">
            {person?.label ?? entry.dataKey}:{" "}
            {rawValue !== undefined ? (
              <span className="text-white">
                {formatMetricValue(rawValue, metricKey)}
                {config.unit ? ` ${config.unit}` : ""}
              </span>
            ) : (
              <span className="text-white/50">kein Wert</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

export function PerformanceRadarChart({ points, series, athleteCount }: PerformanceRadarChartProps) {
  return (
    <section className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Profil</h2>

          <p className="mt-1 text-sm text-foreground/60">
            Alle Messgrößen zu einem Testzeitpunkt, normiert auf 0–100 (weiter außen = besser)
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
        <RadarChart responsive width="100%" height={420} data={points} outerRadius="75%">
          <PolarGrid stroke="var(--color-card-border)" />

          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />

          <PolarRadiusAxis
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickCount={5}
          />

          <Tooltip content={<RadarTooltip series={series} />} />

          <Legend />

          {series.map((item, index) => (
            <Radar
              key={item.id}
              dataKey={item.id}
              name={item.label}
              stroke={seriesColors[index % seriesColors.length]}
              fill={seriesColors[index % seriesColors.length]}
              fillOpacity={0.12}
              strokeWidth={2}
              strokeDasharray={item.participantType === "reference" ? "5 4" : undefined}
              connectNulls={false}
            />
          ))}
        </RadarChart>
      )}
    </section>
  );
}


