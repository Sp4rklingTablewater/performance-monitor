import { getComparisonMetricValue, metricConfig } from "@/lib/metrics";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

export const rankingMetrics = Object.keys(metricConfig) as ComparisonMetric[];

export type RankingMetricValue = {
  value: number | null;
  /** true, wenn der Wert nicht aus dem gewählten Testjahr stammt, sondern aus einem früheren Jahr fortgeschrieben wurde. */
  isCarriedOver: boolean;
  testDate: string | null;
};

export type RankingRow = {
  /** Rang bezogen auf `sortMetric`. `null`, wenn für diese Messgröße kein Wert vorliegt. */
  rank: number | null;
  id: string;
  name: string;
  birthYear: number | null;
  participantType: "athlete" | "reference";
  values: Record<ComparisonMetric, RankingMetricValue>;
};

type BuildRankingTableOptions = {
  sortMetric: ComparisonMetric;
  year: string;
  /** Leeres Array = keine Einschränkung (alle Jahrgänge). */
  birthYears: number[];
  showReferences: boolean;
};

function getTestYear(testDate: string): number {
  return Number(testDate.slice(0, 4));
}

/**
 * Liefert die Kalenderjahre, in denen Tests erfasst wurden, absteigend
 * sortiert (neuestes Jahr zuerst).
 */
export function getAvailableYears(tests: ComparisonTest[]): number[] {
  return Array.from(new Set(tests.map((test) => getTestYear(test.test_date)))).sort(
    (a, b) => b - a,
  );
}

function getEffectiveMetricValue(
  participantTests: ComparisonTest[],
  metric: ComparisonMetric,
  selectedYear: number,
): RankingMetricValue {
  const latestEligibleTest = participantTests
    .filter((test) => getTestYear(test.test_date) <= selectedYear)
    .filter((test) => getComparisonMetricValue(test, metric) !== null)
    .sort((a, b) => b.test_date.localeCompare(a.test_date))[0];

  if (!latestEligibleTest) {
    return { value: null, isCarriedOver: false, testDate: null };
  }

  return {
    value: getComparisonMetricValue(latestEligibleTest, metric) as number,
    isCarriedOver: getTestYear(latestEligibleTest.test_date) < selectedYear,
    testDate: latestEligibleTest.test_date,
  };
}

/**
 * Baut eine Tabelle mit allen Messgrößen je Teilnehmer:in für ein Testjahr
 * (analog zur Testübersicht auf der Athlet:innen-Seite, aber über alle
 * Teilnehmer:innen hinweg). Hat ein:e Teilnehmer:in in diesem Jahr für eine
 * Messgröße keinen Wert, wird der letzte bekannte Wert aus einem früheren
 * Jahr fortgeschrieben. Der Rang wird anhand von `sortMetric` bestimmt; bei
 * gleichem Wert erhalten Teilnehmer:innen denselben Rang (Standard-
 * Kompetition: 1, 2, 2, 4, ...). Teilnehmer:innen ohne jeglichen Wert bis
 * einschließlich des gewählten Jahres werden ausgelassen.
 */
export function buildRankingTable(
  tests: ComparisonTest[],
  { sortMetric, year, birthYears, showReferences }: BuildRankingTableOptions,
): RankingRow[] {
  const selectedYear = Number(year);

  const filteredTests = tests.filter((test) => {
    const isReference = test.participant.participant_type === "reference";

    if (isReference) {
      return showReferences;
    }

    if (
      birthYears.length > 0 &&
      (test.participant.birth_year === null || !birthYears.includes(test.participant.birth_year))
    ) {
      return false;
    }

    return true;
  });

  const testsByParticipant = new Map<string, ComparisonTest[]>();

  for (const test of filteredTests) {
    const participantId = test.participant.id;
    const existing = testsByParticipant.get(participantId) ?? [];
    testsByParticipant.set(participantId, [...existing, test]);
  }

  const rows: Omit<RankingRow, "rank">[] = [];

  for (const participantTests of testsByParticipant.values()) {
    const [reference] = participantTests;
    const values = {} as Record<ComparisonMetric, RankingMetricValue>;
    let hasAnyValue = false;

    for (const metric of rankingMetrics) {
      const metricValue = getEffectiveMetricValue(participantTests, metric, selectedYear);
      values[metric] = metricValue;

      if (metricValue.value !== null) {
        hasAnyValue = true;
      }
    }

    if (!hasAnyValue) {
      continue;
    }

    rows.push({
      id: reference.participant.id,
      name: reference.participant.name,
      birthYear: reference.participant.birth_year,
      participantType: reference.participant.participant_type,
      values,
    });
  }

  const betterDirection = metricConfig[sortMetric].betterDirection;

  const withValue = rows.filter((row) => row.values[sortMetric].value !== null);
  const withoutValue = rows
    .filter((row) => row.values[sortMetric].value === null)
    .sort((a, b) => a.name.localeCompare(b.name, "de"));

  withValue.sort((a, b) => {
    const valueA = a.values[sortMetric].value as number;
    const valueB = b.values[sortMetric].value as number;

    return betterDirection === "higher" ? valueB - valueA : valueA - valueB;
  });

  let rankedRows: RankingRow[] = [];
  let previousValue: number | null = null;
  let previousRank = 0;

  withValue.forEach((row, index) => {
    const value = row.values[sortMetric].value as number;
    const rank = value === previousValue ? previousRank : index + 1;
    previousValue = value;
    previousRank = rank;
    rankedRows = [...rankedRows, { ...row, rank }];
  });

  const unrankedRows: RankingRow[] = withoutValue.map((row) => ({ ...row, rank: null }));

  return [...rankedRows, ...unrankedRows];
}
