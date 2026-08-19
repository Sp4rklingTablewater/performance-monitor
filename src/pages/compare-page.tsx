import { useQuery } from "@tanstack/react-query";
import { PerformanceComparison } from "@/components/performance-comparison";
import { fetchComparisonTests, queryKeys } from "@/lib/data";

export function ComparePage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.comparison,
    queryFn: fetchComparisonTests,
  });

  return (
    <>
      <header className="mb-8">
        <p className="text-sm font-medium text-zinc-500">Vergleich</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Leistungsvergleich</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Leistungen innerhalb einer Altersklasse vergleichen.
        </p>
      </header>

      {isPending ? <p className="text-sm text-zinc-500">Lade Vergleichsdaten...</p> : null}
      {isError ? <p className="text-sm text-red-700">{error.message}</p> : null}
      {data ? <PerformanceComparison tests={data} /> : null}
    </>
  );
}
