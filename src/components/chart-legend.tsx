import { getSeriesColor } from "@/lib/series-colors";

type ChartLegendSeries = {
  id: string;
  label: string;
  /** Gestrichelte Linie für Referenzpersonen. Weglassen, wenn die Serie keine Athlet/Referenz-Unterscheidung hat (z. B. Disziplinen). */
  participantType?: "athlete" | "reference";
};

type ChartLegendProps = {
  series: ChartLegendSeries[];
  /** Optionaler zusätzlicher Eintrag für eine statische Referenzlinie (z. B. Populationsdurchschnitt), mit fester Farbe statt Serien-Farbindex. */
  referenceLine?: { label: string; color: string };
};

/**
 * Eigene HTML-Legende statt der Recharts-`<Legend/>`. Die eingebaute Legende
 * liegt innerhalb der fest-höhigen Chart-Fläche (`height={...}`) – wächst sie
 * durch mehr Personen auf mehrere Zeilen, frisst sie sich in die Plot-Fläche
 * hinein, statt dass das umgebende Panel wächst. Als normales HTML-Element
 * außerhalb des Charts platziert, wächst stattdessen einfach das Panel nach
 * unten; die Chart-Höhe bleibt unangetastet.
 */
export function ChartLegend({ series, referenceLine }: ChartLegendProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
      {referenceLine ? (
        <span className="inline-flex items-center gap-1.5 text-foreground/60">
          <svg width="14" height="10" aria-hidden="true" className="shrink-0">
            <line
              x1="0"
              y1="5"
              x2="14"
              y2="5"
              stroke={referenceLine.color}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          </svg>
          {referenceLine.label}
        </span>
      ) : null}

      {series.map((item, index) => (
        <span key={item.id} className="inline-flex items-center gap-1.5 text-foreground/80">
          <svg width="14" height="10" aria-hidden="true" className="shrink-0">
            <line
              x1="0"
              y1="5"
              x2="14"
              y2="5"
              stroke={getSeriesColor(index)}
              strokeWidth={2}
              strokeDasharray={item.participantType === "reference" ? "4 3" : undefined}
            />
          </svg>
          {item.label}
        </span>
      ))}
    </div>
  );
}
