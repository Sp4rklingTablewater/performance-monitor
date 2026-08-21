import type { ComparisonChartItem } from "@/components/comparison-chart";
import { metricConfig } from "@/lib/metrics";
import type { ProfileData, ProfilePoint, ProfileSeries } from "@/lib/profile";
import type { ComparisonMetric } from "@/lib/types";

const comparisonMetrics = Object.keys(metricConfig) as ComparisonMetric[];

/**
 * Baut aus den pro Messgröße gefilterten Vergleichsdaten (`dataByMetric`, wie
 * im Leistungsvergleich verwendet) die Datenstruktur für einen Profil-Radar
 * auf – eine Achse pro Messgröße, ein Polygon pro Person. Analog zu
 * `buildProfileData` wird jede Messgröße innerhalb der aktuell gezeigten
 * Kohorte auf 0–100 normiert (invertiert bei „niedriger ist besser"), damit
 * unterschiedliche Einheiten auf einer gemeinsamen Achse darstellbar sind.
 */
export function buildComparisonRadarData(
  dataByMetric: Record<ComparisonMetric, ComparisonChartItem[]>,
): ProfileData {
  const seriesInfo = new Map<
    string,
    { label: string; participantType: "athlete" | "reference"; rawValues: Partial<Record<ComparisonMetric, number>> }
  >();

  const points: ProfilePoint[] = comparisonMetrics.map((metricKey) => {
    const items = dataByMetric[metricKey];
    const config = metricConfig[metricKey];

    const values = items.map((item) => item.value);
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 0;
    const range = maxValue - minValue;

    const point: ProfilePoint = { metric: config.label, metricKey };

    for (const item of items) {
      const normalized =
        range === 0
          ? 100
          : config.betterDirection === "higher"
            ? ((item.value - minValue) / range) * 100
            : ((maxValue - item.value) / range) * 100;

      point[item.participantId] = normalized;

      let entry = seriesInfo.get(item.participantId);

      if (!entry) {
        entry = { label: item.label, participantType: item.participantType, rawValues: {} };
        seriesInfo.set(item.participantId, entry);
      }

      entry.rawValues[metricKey] = item.value;
    }

    return point;
  });

  const series: ProfileSeries[] = Array.from(seriesInfo.entries())
    .map(([id, entry]) => ({
      id,
      label: entry.label,
      participantType: entry.participantType,
      rawValues: entry.rawValues,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "de"));

  const athleteCount = series.filter((item) => item.participantType === "athlete").length;

  return { points, series, athleteCount };
}


