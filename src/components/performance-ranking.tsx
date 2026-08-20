import { useEffect, useMemo, useState } from "react";
import { BirthYearMultiSelect } from "@/components/birth-year-multi-select";
import { metricConfig } from "@/lib/metrics";
import {
  buildRankingTable,
  getAvailableBirthYears,
  getAvailableYears,
  rankingMetrics,
} from "@/lib/ranking";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

type PerformanceRankingProps = {
  tests: ComparisonTest[];
};

function rankBadgeClass(rank: number | null) {
  if (rank === 1) {
    return "bg-amber-100 text-amber-800";
  }

  if (rank === 2) {
    return "bg-card-border/60 text-foreground";
  }

  if (rank === 3) {
    return "bg-orange-100 text-orange-800";
  }

  return "bg-card-border/40 text-foreground/70";
}

export function PerformanceRanking({ tests }: PerformanceRankingProps) {
  const [year, setYear] = useState("");
  const [birthYears, setBirthYears] = useState<number[]>([]);
  const [sortMetric, setSortMetric] = useState<ComparisonMetric>("jump_height");
  const [showReferences, setShowReferences] = useState(true);

  const availableBirthYears = useMemo(() => getAvailableBirthYears(tests), [tests]);

  const availableYears = useMemo(() => getAvailableYears(tests), [tests]);

  useEffect(() => {
    if (!availableYears.includes(Number(year))) {
      setYear(availableYears[0] !== undefined ? String(availableYears[0]) : "");
    }
  }, [availableYears, year]);

  const rows = useMemo(
    () => (year ? buildRankingTable(tests, { sortMetric, year, birthYears, showReferences }) : []),
    [tests, sortMetric, year, birthYears, showReferences],
  );

  const athleteCount = rows.filter((row) => row.participantType === "athlete").length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-card-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Testjahr</label>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-10 w-full rounded-lg border border-card-border px-3"
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

          <BirthYearMultiSelect
            availableYears={availableBirthYears}
            selectedYears={birthYears}
            onChange={setBirthYears}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">Rang nach</label>
            <select
              value={sortMetric}
              onChange={(event) => setSortMetric(event.target.value as ComparisonMetric)}
              className="h-10 w-full rounded-lg border border-card-border px-3"
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

      <section className="rounded-xl border border-card-border bg-card p-5">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">Ranking</h2>

          <div className="text-right">
            <p className="text-sm text-foreground/60">Athlet:innen</p>
            <p className="text-2xl font-semibold">{athleteCount}</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-foreground/60">
            Für diese Auswahl liegen keine Werte vor.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-card-border">
            <div className="grid min-w-205 grid-cols-[56px_1fr_90px_repeat(5,112px)] gap-3 border-b border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground/60">
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
                className="grid min-w-205 grid-cols-[56px_1fr_90px_repeat(5,112px)] items-center gap-3 border-b border-card-border/50 px-4 py-3 text-sm last:border-b-0"
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${rankBadgeClass(row.rank)}`}
                >
                  {row.rank ?? "-"}
                </span>
                <span className="font-medium">
                  {row.name}
                  {row.participantType === "reference" ? (
                    <span className="ml-2 rounded-full bg-card-border/40 px-2 py-0.5 text-xs font-medium text-foreground/60">
                      Ref.
                    </span>
                  ) : null}
                </span>
                <span className="text-foreground/70">{row.birthYear ?? "-"}</span>
                {rankingMetrics.map((metric) => {
                  const cell = row.values[metric];
                  const unit = metricConfig[metric].unit;

                  return (
                    <span key={metric} className="text-right">
                      {cell.value === null ? (
                        <span className="text-foreground/30">-</span>
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

        <p className="mt-3 text-xs text-foreground/50">
          * Wert aus einem früheren Testjahr fortgeschrieben (kein Test im gewählten Jahr
          vorhanden).
        </p>
      </section>
    </div>
  );
}
