import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from "recharts";
import type { ProfilePoint, ProfileSeries } from "@/lib/profile";
import { formatMetricValue, metricConfig } from "@/lib/metrics";
import { getSeriesColor } from "@/lib/series-colors";
import { ChartLegend } from "@/components/chart-legend";

type PerformanceRadarChartProps = {
  points: ProfilePoint[];
  series: ProfileSeries[];
  athleteCount: number;
  /** Anzahl Personen mit unvollständigen Werten, die deshalb nicht im Radar auftauchen. */
  incompleteCount: number;
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
  // "average" ist der Referenzring (Populationsdurchschnitt), keine Person –
  // dafür gibt es keinen sinnvollen Rohwert, daher hier ausblenden statt
  // fälschlich "average: kein Wert" anzuzeigen.
  const personEntries = payload.filter((entry) => entry.dataKey !== "average");

  return (
    <div className="rounded-lg border border-header bg-header px-3 py-2 text-sm text-white shadow-sm">
      <p className="mb-1 font-medium">{config.label}</p>

      {personEntries.map((entry) => {
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

export function PerformanceRadarChart({
  points,
  series,
  athleteCount,
  incompleteCount,
}: PerformanceRadarChartProps) {
  return (
    <section className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Profil</h2>

          {incompleteCount > 0 ? (
            <p className="mt-1 text-sm text-foreground/50">
              {incompleteCount === 1
                ? "1 Person hat nicht für alle Messgrößen Werte und wird hier nicht angezeigt."
                : `${incompleteCount} Personen haben nicht für alle Messgrößen Werte und werden hier nicht angezeigt.`}
            </p>
          ) : null}
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
        <>
          <RadarChart responsive width="100%" height={420} data={points} outerRadius="75%">
            <PolarGrid stroke="var(--color-card-border)" />

            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />

            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />

            <Tooltip content={<RadarTooltip series={series} />} />

            {/* Referenzring beim Populationsdurchschnitt (Z = 0): ohne diesen
                lässt sich im Chart nicht erkennen, ob ein Wert über- oder
                unterdurchschnittlich ist – siehe AVERAGE_RADIUS_PERCENT in
                comparison-summary.ts. Zuerst gerendert, damit die echten
                Personen-Polygone darüber liegen. */}
            <Radar
              dataKey="average"
              name="Ø aller Athlet:innen"
              stroke="var(--color-foreground)"
              strokeOpacity={0.4}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="none"
              dot={false}
              isAnimationActive={false}
            />

            {series.map((item, index) => (
              <Radar
                key={item.id}
                dataKey={item.id}
                name={item.label}
                stroke={getSeriesColor(index)}
                fill={getSeriesColor(index)}
                fillOpacity={0.12}
                strokeWidth={2}
                strokeDasharray={item.participantType === "reference" ? "5 4" : undefined}
                connectNulls={false}
              />
            ))}
          </RadarChart>

          <ChartLegend
            series={series}
            referenceLine={{ label: "Ø aller Athlet:innen", color: "var(--color-foreground)" }}
          />
        </>
      )}
    </section>
  );
}
