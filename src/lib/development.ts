import { ageGroupOrder } from "@/lib/constants";
import { computeAgeGroupStats } from "@/lib/age-group-stats";
import { buildParticipantLabel, getComparisonMetricValue } from "@/lib/metrics";
import { matchesParticipantFilter } from "@/lib/participant-filter";
import type { ComparisonTest, DevelopmentMetric } from "@/lib/types";

/** Ein Datenpunkt pro Altersklasse. `ageGroup` ist die X-Achsen-Kategorie,
 * `norm*`-Felder beschreiben den Normbereich dieser Altersklasse,
 * alle weiteren Felder sind Werte einzelner Teilnehmer:innen (Schlüssel = participant.id). */
export type DevelopmentPoint = {
  ageGroup: string;
  /**
   * [Mittelwert − Std.-Abw., Mittelwert + Std.-Abw.] aller Athlet:innen-Tests
   * dieser Altersklasse, unabhängig von Filtern. Immer ein Array (nie
   * `undefined`) – bei zu wenig Stichprobe `[0, 0]` als unsichtbarer
   * Platzhalter, damit Recharts die gesamte Serie konsistent als
   * Bereichs-Fläche erkennt (siehe `hasNorm` für die tatsächliche
   * Verfügbarkeit).
   */
  normRange: [number, number];
  /** `true`, wenn `normRange` auf echten Werten beruht (mind. 2 Athlet:innen). */
  hasNorm: boolean;
  [participantId: string]: number | string | boolean | [number, number] | undefined;
};

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
 *
 * Zusätzlich wird pro Altersklasse ein Normbereich (Ø ± Std.-Abw.) berechnet.
 * Der bezieht sich bewusst auf **alle** Athlet:innen-Tests dieser Altersklasse
 * über alle Jahrgänge/Kalenderjahre hinweg – unabhängig vom aktuell gewählten
 * Jahrgangs-Filter und ohne Referenzpersonen (die sind ein Ziel-Maßstab,
 * keine Norm für Jugendliche). So bleibt der Normbereich eine stabile
 * Vergleichsgröße: Ein einzelner schwacher oder starker Jahrgang verschiebt
 * nicht seine eigene Referenz, und die Stichprobe ist größer/stabiler als
 * bei nur einem Jahrgang.
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

  // Populations-Statistik für den Normbereich: dieselbe Berechnung wie für
  // den Z-Index-Chart auf der Athletenseite (siehe `age-group-stats.ts`),
  // unabhängig von birthYears/showReferences.
  const ageGroupStats = computeAgeGroupStats(tests, metric);

  for (const test of tests) {
    if (!test.age_group || !validAgeGroups.has(test.age_group)) {
      continue;
    }

    const participant = test.participant;

    if (!matchesParticipantFilter(participant, { birthYears, showReferences })) {
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
    .filter((ageGroup) =>
      Array.from(participantEntries.values()).some((entry) => entry.values.has(ageGroup)),
    )
    .map((ageGroup) => {
      const point: DevelopmentPoint = { ageGroup, normRange: [0, 0], hasNorm: false };
      const stats = ageGroupStats.get(ageGroup);

      if (stats) {
        point.normRange = [stats.mean - stats.std, stats.mean + stats.std];
        point.hasNorm = true;
      }

      for (const [id, entry] of participantEntries) {
        const value = entry.values.get(ageGroup);

        if (value !== undefined) {
          point[id] = value;
        }
      }

      return point;
    });

  const athleteCount = series.filter((item) => item.participantType === "athlete").length;

  return { points, series, athleteCount };
}
