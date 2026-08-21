import { ageGroupOrder } from "@/lib/constants";
import { computeAgeGroupStats } from "@/lib/age-group-stats";
import { getComparisonMetricValue, metricConfig } from "@/lib/metrics";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

export type ZIndexMetricValue = {
  /** Anzahl Std.-Abw. vom Populationsmittel, Vorzeichen ggf. gedreht (siehe `buildZIndexData`). */
  z: number;
  rawValue: number;
  mean: number;
  std: number;
  /** Anzahl Athlet:innen, aus denen `mean`/`std` berechnet wurden. */
  sampleSize: number;
};

/** Ein Datenpunkt pro Altersklasse mit dem Z-Index je Disziplin, für die ein Wert vorliegt. */
export type ZIndexPoint = {
  ageGroup: string;
  values: Partial<Record<ComparisonMetric, ZIndexMetricValue>>;
};

export type ZIndexSeries = {
  id: ComparisonMetric;
  label: string;
};

export type ZIndexData = {
  points: ZIndexPoint[];
  series: ZIndexSeries[];
};

/**
 * Baut je Altersklasse einen Z-Index für jede Disziplin einer einzelnen
 * Person: Anzahl Standardabweichungen, die ihr Wert vom Mittelwert aller
 * Athlet:innen dieser Altersklasse entfernt liegt. Das ist Standardvorgehen
 * im Leistungssport-Scouting (u. a. bei Talent-ID-Testbatterien), um
 * Disziplinen mit unterschiedlichen Einheiten (cm, Sekunden, Ballkontakte)
 * auf einer gemeinsamen, direkt vergleichbaren Skala nebeneinander
 * darzustellen – anders als der Normbereich im Entwicklungs-Chart, der den
 * Rohwert-Bereich zeigt, aber nur innerhalb einer einzelnen Disziplin
 * interpretierbar ist.
 *
 * Die Vergleichspopulation ist bewusst dieselbe wie beim Normbereich (siehe
 * `computeAgeGroupStats`): alle Athlet:innen-Tests dieser Altersklasse, alle
 * Jahrgänge, ohne Referenzen.
 *
 * Bei Messgrößen mit `betterDirection: "lower"` (z. B. Sprintzeit) wird das
 * Vorzeichen gedreht, damit in diesem Chart durchgängig gilt: positiver
 * Balken = überdurchschnittlich gut, unabhängig von der Disziplin. Ohne diese
 * Drehung wäre eine schnelle (gute) Sprintzeit fälschlich negativ und optisch
 * "schlecht" dargestellt.
 */
export function buildZIndexData(tests: ComparisonTest[], participantId: string): ZIndexData {
  const metrics = Object.keys(metricConfig) as ComparisonMetric[];
  const statsByMetric = new Map(
    metrics.map((metric) => [metric, computeAgeGroupStats(tests, metric)] as const),
  );

  // Letzter Wert je Altersklasse + Disziplin für die betrachtete Person
  // (analog zu `development.ts`): `tests` ist aufsteigend nach test_date
  // sortiert, spätere Tests überschreiben ältere für dieselbe Altersklasse.
  const valuesByAgeGroup = new Map<string, Map<ComparisonMetric, number>>();

  for (const test of tests) {
    if (!test.age_group || test.participant.id !== participantId) {
      continue;
    }

    let byMetric = valuesByAgeGroup.get(test.age_group);

    if (!byMetric) {
      byMetric = new Map();
      valuesByAgeGroup.set(test.age_group, byMetric);
    }

    for (const metric of metrics) {
      const value = getComparisonMetricValue(test, metric);

      if (value !== null) {
        byMetric.set(metric, value);
      }
    }
  }

  const usedMetrics = new Set<ComparisonMetric>();

  const points: ZIndexPoint[] = ageGroupOrder
    .filter((ageGroup) => valuesByAgeGroup.has(ageGroup))
    .map((ageGroup) => {
      const byMetric = valuesByAgeGroup.get(ageGroup) as Map<ComparisonMetric, number>;
      const values: ZIndexPoint["values"] = {};

      for (const metric of metrics) {
        const rawValue = byMetric.get(metric);
        const stats = statsByMetric.get(metric)?.get(ageGroup);

        if (rawValue === undefined || !stats || stats.std === 0) {
          // stats.std === 0: keine Streuung in der Population (z. B. alle
          // Werte identisch) – ein Z-Index wäre hier nicht aussagekräftig
          // (Division durch 0), daher auslassen statt eines irreführenden
          // Balkens.
          continue;
        }

        const rawZ = (rawValue - stats.mean) / stats.std;
        const z = metricConfig[metric].betterDirection === "higher" ? rawZ : -rawZ;

        values[metric] = {
          z,
          rawValue,
          mean: stats.mean,
          std: stats.std,
          sampleSize: stats.sampleSize,
        };
        usedMetrics.add(metric);
      }

      return { ageGroup, values };
    })
    .filter((point) => Object.keys(point.values).length > 0);

  const series: ZIndexSeries[] = metrics
    .filter((metric) => usedMetrics.has(metric))
    .map((metric) => ({ id: metric, label: metricConfig[metric].label }));

  return { points, series };
}
