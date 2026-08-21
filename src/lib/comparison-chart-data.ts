import type { ComparisonChartItem } from "@/components/comparison-chart";
import { buildParticipantLabel, getComparisonMetricValue } from "@/lib/metrics";
import { matchesParticipantFilter } from "@/lib/participant-filter";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

type BuildComparisonChartDataOptions = {
  metric: ComparisonMetric;
  ageGroup: string;
  /** Leeres Array = keine Einschränkung (alle Jahrgänge). */
  birthYears: number[];
  showReferences: boolean;
};

/**
 * Baut die Scatter-Chart-Datenpunkte einer einzelnen Messgröße + Altersklasse
 * für `ComparisonChart`. Als eigenständige, reine Funktion definiert (statt
 * als Closure innerhalb von `PerformanceComparison`), damit sie ohne
 * `eslint-disable-next-line react-hooks/exhaustive-deps` in `useMemo`
 * verwendet und unabhängig von React getestet werden kann.
 */
export function buildComparisonChartData(
  tests: ComparisonTest[],
  { metric, ageGroup, birthYears, showReferences }: BuildComparisonChartDataOptions,
): ComparisonChartItem[] {
  // Bei genau einem gewählten Jahrgang ist er für alle gezeigten Athlet:innen
  // gleich und muss im Namen nicht wiederholt werden.
  const showBirthYearInLabel = birthYears.length !== 1;

  return tests
    .filter(
      (test) =>
        test.age_group === ageGroup &&
        matchesParticipantFilter(test.participant, { birthYears, showReferences }),
    )
    .map((test) => {
      const value = getComparisonMetricValue(test, metric);

      if (value === null) {
        return null;
      }

      return {
        id: test.id,
        participantId: test.participant.id,
        label: buildParticipantLabel(test.participant, { showBirthYear: showBirthYearInLabel }),
        name: test.participant.name,
        birthYear: test.participant.birth_year,
        participantType: test.participant.participant_type,
        testDate: test.test_date,
        value,
      };
    })
    .filter((item): item is ComparisonChartItem => item !== null);
}

