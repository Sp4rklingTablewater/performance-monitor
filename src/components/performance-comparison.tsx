import { useMemo, useState } from "react";
import { ComparisonChart, type ComparisonChartItem } from "@/components/comparison-chart";
import { ageGroupOrder, defaultAgeGroup } from "@/lib/constants";
import { getComparisonMetricValue } from "@/lib/metrics";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

type PerformanceComparisonProps = {
  tests: ComparisonTest[];
};

type MetricFilter = "all" | ComparisonMetric;

export function PerformanceComparison({ tests }: PerformanceComparisonProps) {
  const [birthYear, setBirthYear] = useState("all");
  const [ageGroup, setAgeGroup] = useState(defaultAgeGroup);
  const [metric, setMetric] = useState<MetricFilter>("all");
  const [showReferences, setShowReferences] = useState(true);

  const birthYears = useMemo(() => {
    return Array.from(
      new Set(
        tests
          .filter(
            (test) =>
              test.participant.participant_type === "athlete" &&
              test.participant.birth_year !== null,
          )
          .map((test) => test.participant.birth_year as number),
      ),
    ).sort((a, b) => a - b);
  }, [tests]);

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

        if (birthYear !== "all" && test.participant.birth_year !== Number(birthYear)) {
          return false;
        }

        return true;
      })
      .map((test) => {
        const value = getComparisonMetricValue(test, selectedMetric);

        if (value === null) {
          return null;
        }

        const isReference = test.participant.participant_type === "reference";
        const label = isReference
          ? `${test.participant.name} (Ref.)`
          : birthYear === "all"
            ? `${test.participant.name} (${test.participant.birth_year ?? "-"})`
            : test.participant.name;

        return {
          id: test.id,
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

  const reachHeightData = getChartData("reach_height");
  const jumpReachData = getChartData("jump_reach");
  const jumpHeightData = getChartData("jump_height");
  const sprintData = getChartData("sprint_93639");
  const ballControlData = getChartData("ball_control");

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Jahrgang</label>
            <select
              value={birthYear}
              onChange={(event) => setBirthYear(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="all">Alle Jahrgänge</option>
              {birthYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Altersklasse</label>
            <select
              value={ageGroup}
              onChange={(event) => setAgeGroup(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
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
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
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
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          <ComparisonChart
            metric="reach_height"
            data={reachHeightData}
            birthYear={birthYear}
            ageGroup={ageGroup}
          />
          <ComparisonChart
            metric="jump_reach"
            data={jumpReachData}
            birthYear={birthYear}
            ageGroup={ageGroup}
          />
          <ComparisonChart
            metric="jump_height"
            data={jumpHeightData}
            birthYear={birthYear}
            ageGroup={ageGroup}
          />
          <ComparisonChart
            metric="sprint_93639"
            data={sprintData}
            birthYear={birthYear}
            ageGroup={ageGroup}
          />
          <ComparisonChart
            metric="ball_control"
            data={ballControlData}
            birthYear={birthYear}
            ageGroup={ageGroup}
          />
        </div>
      ) : (
        <ComparisonChart
          metric={metric}
          data={
            metric === "reach_height"
              ? reachHeightData
              : metric === "jump_reach"
                ? jumpReachData
                : metric === "jump_height"
                  ? jumpHeightData
                  : metric === "sprint_93639"
                    ? sprintData
                    : ballControlData
          }
          birthYear={birthYear}
          ageGroup={ageGroup}
        />
      )}
    </div>
  );
}
