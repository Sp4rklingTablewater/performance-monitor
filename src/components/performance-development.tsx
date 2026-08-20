import { useMemo, useState } from "react";
import { DevelopmentChart } from "@/components/development-chart";
import { buildDevelopmentData } from "@/lib/development";
import type { ComparisonTest, DevelopmentMetric } from "@/lib/types";

type PerformanceDevelopmentProps = {
  tests: ComparisonTest[];
};

const developmentMetricOptions: { value: DevelopmentMetric; label: string }[] = [
  { value: "reach_height", label: "Reichhöhe im Stand" },
  { value: "jump_reach", label: "Reichhöhe im Sprung" },
  { value: "jump_height", label: "Sprung absolut" },
  { value: "sprint_93639", label: "9-3-6-3-9" },
  { value: "ball_control", label: "Ballkontrolle" },
];

export function PerformanceDevelopment({ tests }: PerformanceDevelopmentProps) {
  const [birthYear, setBirthYear] = useState("all");
  const [metric, setMetric] = useState<DevelopmentMetric>("jump_height");
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

  const { points, series, athleteCount } = useMemo(
    () => buildDevelopmentData(tests, { metric, birthYear, showReferences }),
    [tests, metric, birthYear, showReferences],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            <label className="mb-1 block text-sm font-medium">Messgröße</label>
            <select
              value={metric}
              onChange={(event) => setMetric(event.target.value as DevelopmentMetric)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              {developmentMetricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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

      <DevelopmentChart
        metric={metric}
        points={points}
        series={series}
        athleteCount={athleteCount}
      />
    </div>
  );
}



