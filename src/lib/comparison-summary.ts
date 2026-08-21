import type { ComparisonChartItem } from "@/components/comparison-chart";
import { metricConfig } from "@/lib/metrics";
import type { ProfileData, ProfilePoint, ProfileSeries } from "@/lib/profile";
import type { ComparisonMetric } from "@/lib/types";

const comparisonMetrics = Object.keys(metricConfig) as ComparisonMetric[];

/**
 * Kein Wert in der normierten Darstellung fällt unter diesen Radius (in %).
 * Reine Min-Max-Normierung würde den/die schlechteste:n Teilnehmer:in einer
 * Messgröße exakt auf 0 (Mittelpunkt) setzen – optisch nicht unterscheidbar
 * von einem fehlenden Wert. Mit einem Sockelradius bleibt „schlechtester
 * echter Wert in der Kohorte" immer als sichtbarer Achsenpunkt erkennbar.
 */
const MIN_RADIUS_PERCENT = 12;

/**
 * Baut aus den pro Messgröße gefilterten Vergleichsdaten (`dataByMetric`, wie
 * im Leistungsvergleich verwendet) die Datenstruktur für einen Profil-Radar
 * auf – eine Achse pro Messgröße, ein Polygon pro Person. Analog zu
 * `buildProfileData` wird jede Messgröße innerhalb der aktuell gezeigten
 * Kohorte auf `MIN_RADIUS_PERCENT`–100 normiert (invertiert bei „niedriger
 * ist besser"), damit unterschiedliche Einheiten auf einer gemeinsamen Achse
 * darstellbar sind.
 *
 * Recharts setzt den Radius eines Radar-Punkts bei fehlendem Wert auf 0
 * (Mittelpunkt) statt die Achse auszulassen – bei Personen mit nur teilweise
 * vorhandenen Messgrößen würde das Polygon dadurch zu einem spitzen Dreieck
 * statt einem Fünfeck kollabieren. Deshalb werden nur Personen mit einem
 * Wert für **alle** Messgrößen normiert und dargestellt; alle anderen fließen
 * weder in die Normierung noch ins Chart ein und werden über
 * `incompleteCount` gezählt.
 */
export function buildComparisonRadarData(
  dataByMetric: Record<ComparisonMetric, ComparisonChartItem[]>,
): ProfileData {
  const rawValuesByParticipant = new Map<
    string,
    { label: string; participantType: "athlete" | "reference"; values: Partial<Record<ComparisonMetric, number>> }
  >();

  for (const metricKey of comparisonMetrics) {
    for (const item of dataByMetric[metricKey]) {
      let entry = rawValuesByParticipant.get(item.participantId);

      if (!entry) {
        entry = { label: item.label, participantType: item.participantType, values: {} };
        rawValuesByParticipant.set(item.participantId, entry);
      }

      entry.values[metricKey] = item.value;
    }
  }

  const completeParticipantIds = new Set(
    Array.from(rawValuesByParticipant.entries())
      .filter(([, entry]) => comparisonMetrics.every((metricKey) => entry.values[metricKey] !== undefined))
      .map(([participantId]) => participantId),
  );

  const incompleteCount = rawValuesByParticipant.size - completeParticipantIds.size;

  const points: ProfilePoint[] = comparisonMetrics.map((metricKey) => {
    const items = dataByMetric[metricKey].filter((item) => completeParticipantIds.has(item.participantId));
    const config = metricConfig[metricKey];

    const values = items.map((item) => item.value);
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 0;
    const range = maxValue - minValue;

    const point: ProfilePoint = { metric: config.label, metricKey };

    for (const item of items) {
      const relativeScore =
        range === 0
          ? 100
          : config.betterDirection === "higher"
            ? ((item.value - minValue) / range) * 100
            : ((maxValue - item.value) / range) * 100;

      // Auf MIN_RADIUS_PERCENT–100 stauchen, statt 0–100 zu nutzen, damit
      // selbst der schlechteste echte Wert noch als Punkt auf der Achse
      // sichtbar bleibt und nicht mit einem fehlenden Wert verwechselt wird.
      point[item.participantId] =
        MIN_RADIUS_PERCENT + (relativeScore / 100) * (100 - MIN_RADIUS_PERCENT);
    }

    return point;
  });

  const series: ProfileSeries[] = Array.from(completeParticipantIds)
    .map((participantId) => {
      const entry = rawValuesByParticipant.get(participantId)!;

      return {
        id: participantId,
        label: entry.label,
        participantType: entry.participantType,
        rawValues: entry.values,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "de"));

  const athleteCount = series.filter((item) => item.participantType === "athlete").length;

  return { points, series, athleteCount, incompleteCount };
}





