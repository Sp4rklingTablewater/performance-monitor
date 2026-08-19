import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, queryKeys } from "@/lib/data";

export function DashboardPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboardStats,
  });

  return (
    <>
      <header className="mb-10">
        <p className="text-sm font-medium text-zinc-500">Uebersicht</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Leistungsuebersicht</h1>
      </header>

      {isError ? <p className="mb-4 text-sm text-red-700">{error.message}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Athlet:innen"
          value={isPending ? "..." : String(data?.participants ?? "-")}
        />
        <StatCard title="Leistungstests" value={isPending ? "..." : String(data?.tests ?? "-")} />
        <StatCard title="Jahrgaenge" value={isPending ? "..." : String(data?.yearCount ?? "-")} />
        <StatCard title="Referenzen" value={isPending ? "..." : String(data?.references ?? "-")} />
      </section>
    </>
  );
}

type StatCardProps = {
  title: string;
  value: string;
};

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
