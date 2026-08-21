import { useMemo, useState } from "react";
import { BirthYearMultiSelect } from "@/components/birth-year-multi-select";
import { ComparisonChart, type ComparisonChartItem } from "@/components/comparison-chart";
import { PerformanceRadarChart } from "@/components/performance-radar-chart";
import { ageGroupOrder, defaultAgeGroup } from "@/lib/constants";
import { buildComparisonRadarData } from "@/lib/comparison-summary";
import { buildParticipantLabel, getComparisonMetricValue, metricConfig } from "@/lib/metrics";
import { getAvailableBirthYears } from "@/lib/ranking";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

type PerformanceComparisonProps = {
  tests: ComparisonTest[];
};

type MetricFilter = "all" | ComparisonMetric;

const comparisonMetrics = Object.keys(metricConfig) as ComparisonMetric[];

export function PerformanceComparison({ tests }: PerformanceComparisonProps) {
  const [birthYears, setBirthYears] = useState<number[]>([]);
  const [ageGroup, setAgeGroup] = useState(defaultAgeGroup);
  const [metric, setMetric] = useState<MetricFilter>("all");
  const [showReferences, setShowReferences] = useState(true);

  const availableBirthYears = useMemo(() => getAvailableBirthYears(tests), [tests]);

  // Bei genau einem gewählten Jahrgang ist er für alle gezeigten Athlet:innen
  // gleich und muss im Namen nicht wiederholt werden.
  const showBirthYearInLabel = birthYears.length !== 1;

  const availableAgeGroups = useMemo(() => {
    const found = new Set(
      tests
        .map((test) => test.age_group)
        .filter((value): value is string => value !== null && value !== ""),
    );

    return ageGroupOrder.filter((group) => found.has(group));
  }, [tests]);

  function getChartData(selectedMetric: ComparisonMetric): ComparisonChartItem[] {
    return tests
      .filter((test) => {
        if (test.age_group !== ageGroup) {
          return false;
        }

        const isReference = test.participant.participant_type === "reference";

        if (isReference) {
          return showReferences;
        }

        if (birthYears.length > 0 && !birthYears.includes(test.participant.birth_year ?? -1)) {
          return false;
        }

        return true;
      })
      .map((test) => {
        const value = getComparisonMetricValue(test, selectedMetric);

        if (value === null) {
          return null;
        }

        const label = buildParticipantLabel(test.participant, {
          showBirthYear: showBirthYearInLabel,
        });

        return {
          id: test.id,
          participantId: test.participant.id,
          label,
          name: test.participant.name,
          birthYear: test.participant.birth_year,
          participantType: test.participant.participant_type,
          testDate: test.test_date,
          value,
        };
      })
      .filter((item): item is ComparisonChartItem => item !== null);
  }

  const dataByMetric = useMemo(
    () =>
      Object.fromEntries(
        comparisonMetrics.map((metricKey) => [metricKey, getChartData(metricKey)]),
      ) as Record<ComparisonMetric, ComparisonChartItem[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tests, ageGroup, birthYears, showReferences],
  );

  const summaryData = useMemo(() => buildComparisonRadarData(dataByMetric), [dataByMetric]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-card-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BirthYearMultiSelect
            availableYears={availableBirthYears}
            selectedYears={birthYears}
            onChange={setBirthYears}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">Altersklasse</label>
            <select
              value={ageGroup}
              onChange={(event) => setAgeGroup(event.target.value)}
              className="w-full rounded-lg border border-card-border px-3 py-2"
            >
              {availableAgeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Messgröße</label>
            <select
              value={metric}
              onChange={(event) => setMetric(event.target.value as MetricFilter)}
              className="w-full rounded-lg border border-card-border px-3 py-2"
            >
              <option value="all">Alle Messgrößen</option>
              <option value="reach_height">Reichhöhe im Stand</option>
              <option value="jump_reach">Reichhöhe im Sprung</option>
              <option value="jump_height">Sprung absolut</option>
              <option value="sprint_93639">9-3-6-3-9</option>
              <option value="ball_control">Ballkontrolle</option>
            </select>
          </div>

          <label className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={showReferences}
              onChange={(event) => setShowReferences(event.target.checked)}
            />
            <span className="text-sm font-medium">Referenzen anzeigen</span>
          </label>
        </div>
      </section>

      {metric === "all" ? (
        <>
          <PerformanceRadarChart
            points={summaryData.points}
            series={summaryData.series}
            athleteCount={summaryData.athleteCount}
            incompleteCount={summaryData.incompleteCount}
          />

          <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {comparisonMetrics.map((metricKey) => (
              <ComparisonChart key={metricKey} metric={metricKey} data={dataByMetric[metricKey]} />
            ))}
          </div>
        </>
      ) : (
        <ComparisonChart metric={metric} data={dataByMetric[metric]} />
      )}
    </div>
  );
}
