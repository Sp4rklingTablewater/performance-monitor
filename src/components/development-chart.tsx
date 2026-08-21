import { CartesianGrid, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis } from "recharts";
import type { DevelopmentPoint, DevelopmentSeries } from "@/lib/development";
import { formatMetricValue, metricConfig } from "@/lib/metrics";
import { computeChartDomain } from "@/lib/chart-domain";
import { getSeriesColor } from "@/lib/series-colors";
import { ChartLegend } from "@/components/chart-legend";
import type { DevelopmentMetric } from "@/lib/types";

type DevelopmentChartProps = {
  metric: DevelopmentMetric;
  points: DevelopmentPoint[];
  series: DevelopmentSeries[];
  athleteCount: number;
};

type DevelopmentTooltipProps = {
  active?: boolean;
  payload?: { dataKey: string; value: number; name: string; color?: string; payload: DevelopmentPoint }[];
  series: DevelopmentSeries[];
  metric: DevelopmentMetric;
};

/**
 * Eigener Tooltip-Inhalt statt `formatter`: Der interne `normRange`-Wert
 * (Array) soll nicht als rohe Zahl/kaputte Zeile auftauchen – stattdessen
 * eine einzelne "Normbereich"-Zeile mit echtem Von-bis-Wert. Da die X-Achse
 * numerisch ist (siehe unten), wird das Label über `payload[0].payload`
 * (die Original-Altersklasse) statt über den rohen Index bestimmt.
 */
function DevelopmentTooltip({ active, payload, series, metric }: DevelopmentTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const config = metricConfig[metric];
  const point = payload[0].payload as DevelopmentPoint | undefined;
  const seriesIds = new Set(series.map((item) => item.id));
  const personEntries = payload.filter((entry) => seriesIds.has(entry.dataKey));

  return (
    <div className="rounded-lg border border-header bg-header px-3 py-2 text-sm text-white shadow-sm">
      <p className="mb-1 font-medium text-sage">{point?.ageGroup}</p>

      {point?.hasNorm ? (
        <p className="mb-1 text-white/70">
          Normbereich: {formatMetricValue(point.normRange[0], metric)}–
          {formatMetricValue(point.normRange[1], metric)}
          {config.unit ? ` ${config.unit}` : ""}
        </p>
      ) : null}

      {personEntries.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {formatMetricValue(entry.value, metric)}
          {config.unit ? ` ${config.unit}` : ""}
        </p>
      ))}
    </div>
  );
}

export function DevelopmentChart({ metric, points, series, athleteCount }: DevelopmentChartProps) {
  const config = metricConfig[metric];

  const values = points.flatMap((point) => {
    const seriesValues = series
      .map((item) => point[item.id])
      // `typeof NaN === "number"` ist true – Number.isFinite schließt NaN korrekt aus
      // und verhindert, dass ein einzelner ungültiger Wert Math.min/max vergiftet.
      .filter((value): value is number => Number.isFinite(value));

    // Normbereich in die Domain-Berechnung einbeziehen, damit die Y-Achse
    // die Referenzfläche nicht abschneidet, auch wenn alle Linien innerhalb
    // liegen. Platzhalter-Bereiche ([0, 0] bei zu wenig Stichprobe) sollen
    // die Domain nicht künstlich auf 0 herunterziehen.
    return point.hasNorm ? [...seriesValues, ...point.normRange] : seriesValues;
  });

  const domain = computeChartDomain(values);

  // Recharts' Kategorie-Achse in einem LineChart nutzt eine Punkt-Skala ohne
  // Bandbreite (anders als bei BarChart) – ein ReferenceArea mit x1=x2=selbe
  // Kategorie hätte dadurch Breite 0 und wäre unsichtbar. Deshalb wird die
  // X-Achse hier numerisch geführt (Index 0, 1, 2, …), mit den
  // Altersklassen-Namen nur als Tick-Beschriftung. So kann jedes
  // Normbereichs-Rechteck exakt `index − 0.5` bis `index + 0.5` nutzen:
  // eigene, nicht überlappende Spalte pro Altersklasse, Messpunkt exakt mittig.
  const chartData = points.map((point, index) => ({ ...point, index }));

  const normSegments = points.flatMap((point, index) =>
    point.hasNorm
      ? [
          {
            key: point.ageGroup,
            x1: index - 0.5,
            x2: index + 0.5,
            y1: point.normRange[0],
            y2: point.normRange[1],
          },
        ]
      : [],
  );

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

          <p className="text-2xl font-semibold">{athleteCount}</p>
        </div>
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
            height={360}
            data={chartData}
            margin={{
              top: 10,
              right: 25,
              bottom: 5,
              left: 10,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-card-border)" />

            <XAxis
              dataKey="index"
              type="number"
              domain={[-0.5, points.length - 0.5]}
              ticks={points.map((_, index) => index)}
              tickFormatter={(index) => points[index]?.ageGroup ?? ""}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              domain={domain}
              // Ohne allowDataOverflow bezieht Recharts bei zusätzlichen
              // Areas/Range-Serien u. U. auch deren volle Wertespanne in die
              // Achsen-Skalierung ein und ignoriert unsere eigene, eng um die
              // Werte gepolsterte `domain`. allowDataOverflow erzwingt exakt
              // die berechnete Domain. Der Normbereich ist bereits oben in
              // `values` eingerechnet, überschreitet die Domain also nie.
              allowDataOverflow
              tickLine={false}
              axisLine={false}
              width={64}
              unit={config.unit}
              tickFormatter={(value) => formatMetricValue(value, metric)}
            />

            <Tooltip content={<DevelopmentTooltip series={series} metric={metric} />} />

            {normSegments.map((segment) => (
              <ReferenceArea
                key={segment.key}
                x1={segment.x1}
                x2={segment.x2}
                y1={segment.y1}
                y2={segment.y2}
                // Standard von Recharts ist "discard": Eine ReferenceArea, die
                // (und sei es minimal, z. B. durch Rundung) außerhalb der
                // Achsen-Domain liegt, wird dann komplett ausgeblendet – das
                // war die Ursache für den zuvor "verschwundenen" Normbereich.
                // "visible" zeichnet ihn immer, unabhängig von der Domain.
                // (Nicht "extendDomain": das würde durch `allowDataOverflow`
                // auf der YAxis ohnehin ignoriert, siehe recharts'
                // `extendDomain()` in util/isDomainSpecifiedByUser.ts.)
                ifOverflow="visible"
                fill="var(--color-sage)"
                fillOpacity={0.15}
                stroke="none"
              />
            ))}

            {series.map((item, index) => (
              <Line
                key={item.id}
                type="linear"
                dataKey={item.id}
                name={item.label}
                stroke={getSeriesColor(index)}
                strokeDasharray={item.participantType === "reference" ? "5 4" : undefined}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                // Seit dem X-Achsen-Fix enthält `points` auch Altersklassen, in
                // denen NUR andere Personen einen Wert haben. Bei `false` würde
                // Recharts die Linie an jeder solchen individuellen Lücke
                // komplett abbrechen (viele isolierte Punkte statt einer Linie).
                // `true` verbindet stattdessen direkt den letzten mit dem
                // nächsten echten Wert dieser Person, ohne einen Wert für die
                // übersprungene Altersklasse zu erfinden.
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
