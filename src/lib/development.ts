import { ageGroupOrder } from "@/lib/constants";
import { buildParticipantLabel, getComparisonMetricValue } from "@/lib/metrics";
import type { ComparisonTest, DevelopmentMetric } from "@/lib/types";

/** Ein Datenpunkt pro Altersklasse. `ageGroup` ist die X-Achsen-Kategorie,
 * alle weiteren Felder sind Werte einzelner Teilnehmer:innen (Schlüssel = participant.id). */
export type DevelopmentPoint = { ageGroup: string; [participantId: string]: number | string };

export type DevelopmentSeries = {
  id: string;
  label: string;
  participantType: "athlete" | "reference";
};

export type DevelopmentData = {
  points: DevelopmentPoint[];
  series: DevelopmentSeries[];
  athleteCount: number;
};

type BuildDevelopmentDataOptions = {
  metric: DevelopmentMetric;
  /** Leeres Array = keine Einschränkung (alle Jahrgänge). */
  birthYears: number[];
  showReferences: boolean;
};

/**
 * Baut die Datenstruktur für den Entwicklungsvergleich auf: eine Linie pro Athlet:in
 * über die sportliche Entwicklungsreihenfolge
 * U12.3 → U12.2 → U12.1 → U13 → U14 → U16.2 → U16.1.
 * Fehlende Tests werden nicht künstlich aufgefüllt – der Chart überspringt
 * sie stattdessen beim Zeichnen der Linie (siehe `connectNulls` in
 * `development-chart.tsx`), statt einen erfundenen Wert einzusetzen.
 */
export function buildDevelopmentData(
  tests: ComparisonTest[],
  { metric, birthYears, showReferences }: BuildDevelopmentDataOptions,
): DevelopmentData {
  const validAgeGroups = new Set<string>(ageGroupOrder);

  // Bei genau einem gewählten Jahrgang ist er für alle gezeigten Athlet:innen
  // gleich und muss im Namen nicht wiederholt werden.
  const showBirthYearInLabel = birthYears.length !== 1;

  const participantEntries = new Map<
    string,
    { label: string; participantType: "athlete" | "reference"; values: Map<string, number> }
  >();

  for (const test of tests) {
    if (!test.age_group || !validAgeGroups.has(test.age_group)) {
      continue;
    }

    const participant = test.participant;
    const isReference = participant.participant_type === "reference";

    if (isReference && !showReferences) {
      continue;
    }

    if (
      !isReference &&
      birthYears.length > 0 &&
      (participant.birth_year === null || !birthYears.includes(participant.birth_year))
    ) {
      continue;
    }

    const value = getComparisonMetricValue(test, metric);

    if (value === null) {
      continue;
    }

    const label = buildParticipantLabel(participant, { showBirthYear: showBirthYearInLabel });

    let entry = participantEntries.get(participant.id);

    if (!entry) {
      entry = { label, participantType: participant.participant_type, values: new Map() };
      participantEntries.set(participant.id, entry);
    }

    // `tests` ist aufsteigend nach test_date sortiert, spätere Tests überschreiben ältere
    // für dieselbe Altersklasse (letzter gemessener Wert gewinnt).
    entry.values.set(test.age_group, value);
  }

  const series: DevelopmentSeries[] = Array.from(participantEntries.entries())
    .map(([id, entry]) => ({ id, label: entry.label, participantType: entry.participantType }))
    .sort((a, b) => a.label.localeCompare(b.label, "de"));

  // Nur Altersklassen aufnehmen, für die mindestens ein:e Teilnehmer:in einen
  // Wert hat – so reicht die X-Achse nur so weit, wie tatsächlich Daten
  // vorliegen, statt immer die vollständige Alterklassen-Reihenfolge zu zeigen.
  const points: DevelopmentPoint[] = ageGroupOrder
    .map((ageGroup) => {
      const point: DevelopmentPoint = { ageGroup };

      for (const [id, entry] of participantEntries) {
        const value = entry.values.get(ageGroup);

        if (value !== undefined) {
          point[id] = value;
        }
      }

      return point;
    })
    .filter((point) => Object.keys(point).length > 1);

  const athleteCount = series.filter((item) => item.participantType === "athlete").length;

  return { points, series, athleteCount };
}
