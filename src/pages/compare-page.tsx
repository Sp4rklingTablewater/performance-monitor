import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PerformanceComparison } from "@/components/performance-comparison";
import { PerformanceDevelopment } from "@/components/performance-development";
import { PerformanceRanking } from "@/components/performance-ranking";
import { fetchComparisonTests, queryKeys } from "@/lib/data";

type CompareMode = "comparison" | "ranking" | "development";

const modeLabels: Record<CompareMode, string> = {
  comparison: "Leistungsvergleich",
  ranking: "Ranking",
  development: "Entwicklung",
};

export function ComparePage() {
  const [mode, setMode] = useState<CompareMode>("comparison");

  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.comparison,
    queryFn: fetchComparisonTests,
  });

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{modeLabels[mode]}</h1>

        <div className="mt-4 inline-flex rounded-lg border border-zinc-300 bg-white p-1">
          {(Object.keys(modeLabels) as CompareMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                mode === option ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {modeLabels[option]}
            </button>
          ))}
        </div>
      </header>

      {isPending ? <p className="text-sm text-zinc-500">Lade Vergleichsdaten...</p> : null}
      {isError ? <p className="text-sm text-red-700">{error.message}</p> : null}
      {data ? (
        mode === "comparison" ? (
          <PerformanceComparison tests={data} />
        ) : mode === "ranking" ? (
          <PerformanceRanking tests={data} />
        ) : (
          <PerformanceDevelopment tests={data} />
        )
      ) : null}
    </>
  );
}

