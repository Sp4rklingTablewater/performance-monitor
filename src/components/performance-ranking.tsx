import { useEffect, useMemo, useState } from "react";
import { metricConfig } from "@/lib/metrics";
import { buildRankingTable, getAvailableYears, rankingMetrics } from "@/lib/ranking";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

type PerformanceRankingProps = {
  tests: ComparisonTest[];
};

function rankBadgeClass(rank: number | null) {
  if (rank === 1) {
    return "bg-amber-100 text-amber-800";
  }

  if (rank === 2) {
    return "bg-zinc-200 text-zinc-700";
  }

  if (rank === 3) {
    return "bg-orange-100 text-orange-800";
  }

  return "bg-zinc-100 text-zinc-600";
}

export function PerformanceRanking({ tests }: PerformanceRankingProps) {
  const [year, setYear] = useState("");
  const [birthYears, setBirthYears] = useState<number[]>([]);
  const [sortMetric, setSortMetric] = useState<ComparisonMetric>("jump_height");
  const [showReferences, setShowReferences] = useState(true);

  const availableBirthYears = useMemo(() => {
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

  const availableYears = useMemo(() => getAvailableYears(tests), [tests]);

  useEffect(() => {
    if (!availableYears.includes(Number(year))) {
      setYear(availableYears[0] !== undefined ? String(availableYears[0]) : "");
    }
  }, [availableYears, year]);

  const rows = useMemo(
    () =>
      year ? buildRankingTable(tests, { sortMetric, year, birthYears, showReferences }) : [],
    [tests, sortMetric, year, birthYears, showReferences],
  );

  const athleteCount = rows.filter((row) => row.participantType === "athlete").length;

  function toggleBirthYear(value: number) {
    setBirthYears((current) =>
      current.includes(value) ? current.filter((year) => year !== value) : [...current, value],
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Testjahr</label>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 px-3"
              disabled={availableYears.length === 0}
            >
              {availableYears.length === 0 ? (
                <option value="">Kein Test vorhanden</option>
              ) : (
                availableYears.map((availableYear) => (
                  <option key={availableYear} value={availableYear}>
                    {availableYear}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium">Jahrgänge</label>
              {birthYears.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setBirthYears([])}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                >
                  Zurücksetzen
                </button>
              ) : null}
            </div>
            <div className="h-10 flex flex-wrap gap-1 overflow-y-auto rounded-lg border border-zinc-300 px-2 py-1.5">
              {availableBirthYears.length === 0 ? (
                <span className="py-0.5 text-sm text-zinc-400">Keine Jahrgänge vorhanden</span>
              ) : (
                availableBirthYears.map((option) => {
                  const isSelected = birthYears.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleBirthYear(option)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isSelected
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Rang nach</label>
            <select
              value={sortMetric}
              onChange={(event) => setSortMetric(event.target.value as ComparisonMetric)}
              className="h-10 w-full rounded-lg border border-zinc-300 px-3"
            >
              {rankingMetrics.map((metric) => (
                <option key={metric} value={metric}>
                  {metricConfig[metric].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span aria-hidden="true" className="mb-1 hidden text-sm font-medium xl:block">
              &nbsp;
            </span>
            <label className="flex h-10 items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                checked={showReferences}
                onChange={(event) => setShowReferences(event.target.checked)}
              />
              <span className="text-sm font-medium">Referenzen anzeigen</span>
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">Ranking</h2>

          <div className="text-right">
            <p className="text-sm text-zinc-500">Athlet:innen</p>
            <p className="text-2xl font-semibold">{athleteCount}</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
            Für diese Auswahl liegen keine Werte vor.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <div className="grid min-w-205 grid-cols-[56px_1fr_90px_repeat(5,112px)] gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-500">
              <span>Rang</span>
              <span>Name</span>
              <span>Jahrgang</span>
              {rankingMetrics.map((metric) => (
                <span key={metric} className="text-right">
                  {metricConfig[metric].label}
                </span>
              ))}
            </div>

            {rows.map((row) => (
              <div
                key={row.id}
                className="grid min-w-205 grid-cols-[56px_1fr_90px_repeat(5,112px)] items-center gap-3 border-b border-zinc-100 px-4 py-3 text-sm last:border-b-0"
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${rankBadgeClass(row.rank)}`}
                >
                  {row.rank ?? "-"}
                </span>
                <span className="font-medium">
                  {row.name}
                  {row.participantType === "reference" ? (
                    <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                      Ref.
                    </span>
                  ) : null}
                </span>
                <span className="text-zinc-600">{row.birthYear ?? "-"}</span>
                {rankingMetrics.map((metric) => {
                  const cell = row.values[metric];
                  const unit = metricConfig[metric].unit;

                  return (
                    <span key={metric} className="text-right">
                      {cell.value === null ? (
                        <span className="text-zinc-300">-</span>
                      ) : (
                        <span
                          className={cell.isCarriedOver ? "text-amber-700" : "font-semibold"}
                          title={
                            cell.isCarriedOver && cell.testDate
                              ? `Kein Wert in ${year}, letzter bekannter Wert aus ${cell.testDate.slice(0, 4)}`
                              : undefined
                          }
                        >
                          {cell.value}
                          {unit ? ` ${unit}` : ""}
                          {cell.isCarriedOver ? "*" : ""}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-zinc-400">
          * Wert aus einem früheren Testjahr fortgeschrieben (kein Test im gewählten Jahr vorhanden).
        </p>
      </section>
    </div>
  );
}











