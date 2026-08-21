import type { ComparisonChartItem } from "@/components/comparison-chart";
import { computeAgeGroupStats } from "@/lib/age-group-stats";
import { metricConfig } from "@/lib/metrics";
import type { ProfileData, ProfilePoint, ProfileSeries } from "@/lib/profile";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

const comparisonMetrics = Object.keys(metricConfig) as ComparisonMetric[];

/**
 * Kein Wert in der normierten Darstellung fällt unter diesen Radius (in %).
 * Bei extremen Z-Werten würde ein linearer 0–100-Bereich den schlechtesten
 * Fall exakt auf 0 (Mittelpunkt) setzen – optisch nicht unterscheidbar von
 * einem fehlenden Wert. Mit einem Sockelradius bleibt auch eine sehr
 * unterdurchschnittliche Leistung immer als sichtbarer Achsenpunkt erkennbar.
 */
const MIN_RADIUS_PERCENT = 12;

/**
 * Z-Werte jenseits dieser Grenze werden gekappt, bevor sie auf den Radius
 * gemappt werden. ±2.5 Standardabweichungen decken bereits >98 % einer
 * normalverteilten Population ab – darüber hinausgehende Ausreißer würden
 * sonst die gesamte restliche Kohorte optisch in die Mitte stauchen.
 */
const Z_CLAMP = 2.5;

/** Mappt einen (bereits vorzeichen-korrigierten) Z-Wert auf einen Radius zwischen `MIN_RADIUS_PERCENT` und 100. */
function zToRadiusPercent(z: number): number {
  const clamped = Math.max(-Z_CLAMP, Math.min(Z_CLAMP, z));
  const relative = (clamped + Z_CLAMP) / (2 * Z_CLAMP);

  return MIN_RADIUS_PERCENT + relative * (100 - MIN_RADIUS_PERCENT);
}

/**
 * Radius des Populationsdurchschnitts (Z = 0). Wegen `MIN_RADIUS_PERCENT`
 * liegt das NICHT bei 50 %, sondern in der Mitte zwischen Sockel und 100 %.
 * Exportiert, damit `performance-radar-chart.tsx` einen sichtbaren
 * Referenzring auf genau diesem Radius zeichnen kann – ohne den würde man
 * unterdurchschnittliche Werte im Chart nicht von überdurchschnittlichen
 * unterscheiden können.
 */
export const AVERAGE_RADIUS_PERCENT = zToRadiusPercent(0);

/**
 * Baut aus den pro Messgröße gefilterten Vergleichsdaten (`dataByMetric`, wie
 * im Leistungsvergleich verwendet) die Datenstruktur für einen Profil-Radar
 * auf – eine Achse pro Messgröße, ein Polygon pro Person.
 *
 * Jede Messgröße wird als Z-Index dargestellt (Standardabweichungen vom
 * Mittelwert aller Athlet:innen dieser Altersklasse, alle Jahrgänge, ohne
 * Referenzen – siehe `computeAgeGroupStats`, dieselbe Population wie beim
 * Normbereich im Entwicklungs-Chart und dem Z-Index-Panel auf der
 * Athletenseite). Vorzeichen bei „niedriger ist besser" gedreht, damit
 * „weiter außen" auf jeder Achse immer „besser" bedeutet.
 *
 * Das ist bewusst KEINE Min-Max-Normierung innerhalb der aktuell gefilterten
 * Kohorte: Bei wenigen sichtbaren Personen würde eine Min-Max-Skala immer
 * jemanden auf 100 % und jemanden auf den Sockel ziehen, selbst wenn die
 * echten Unterschiede winzig sind – und "80 %" hätte je nach Filter (Jahrgang,
 * Referenzen an/aus) jedes Mal eine andere Bedeutung. Mit einer festen
 * Populations-Referenz bleibt die Polygon-Größe dagegen tatsächlich
 * aussagekräftig: klein heißt nah am Durchschnitt, groß heißt wirklich
 * überdurchschnittlich – unabhängig davon, wer gerade mitverglichen wird.
 *
 * Recharts setzt den Radius eines Radar-Punkts bei fehlendem Wert auf 0
 * (Mittelpunkt) statt die Achse auszulassen – bei Personen mit nur teilweise
 * vorhandenen Messgrößen würde das Polygon dadurch zu einem spitzen Dreieck
 * statt einem Fünfeck kollabieren. Deshalb werden nur Personen mit einem
 * Wert für **alle** Messgrößen dargestellt; alle anderen fließen weder in die
 * Normierung noch ins Chart ein und werden über `incompleteCount` gezählt.
 */
export function buildComparisonRadarData(
  tests: ComparisonTest[],
  dataByMetric: Record<ComparisonMetric, ComparisonChartItem[]>,
  ageGroup: string,
): ProfileData {
  const rawValuesByParticipant = new Map<
    string,
    {
      label: string;
      participantType: "athlete" | "reference";
      values: Partial<Record<ComparisonMetric, number>>;
    }
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
      .filter(([, entry]) =>
        comparisonMetrics.every((metricKey) => entry.values[metricKey] !== undefined),
      )
      .map(([participantId]) => participantId),
  );

  const incompleteCount = rawValuesByParticipant.size - completeParticipantIds.size;

  const points: ProfilePoint[] = comparisonMetrics.map((metricKey) => {
    const items = dataByMetric[metricKey].filter((item) =>
      completeParticipantIds.has(item.participantId),
    );
    const config = metricConfig[metricKey];
    const stats = computeAgeGroupStats(tests, metricKey).get(ageGroup);

    // "average" ist ein reservierter Schlüssel (siehe `AVERAGE_RADIUS_PERCENT`)
    // für den Referenzring des Populationsdurchschnitts, kein Teilnehmer:in.
    const point: ProfilePoint = {
      metric: config.label,
      metricKey,
      average: AVERAGE_RADIUS_PERCENT,
    };

    for (const item of items) {
      if (!stats || stats.std === 0) {
        // Population zu klein für eine aussagekräftige Std.-Abw. (z. B.
        // weniger als 2 Athlet:innen dieser Altersklasse) – neutralen
        // Mittelwert-Radius zeigen, statt eine nicht belastbare Kennzahl
        // vorzutäuschen.
        point[item.participantId] = 50;
        continue;
      }

      const rawZ = (item.value - stats.mean) / stats.std;
      const z = config.betterDirection === "higher" ? rawZ : -rawZ;

      point[item.participantId] = zToRadiusPercent(z);
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
