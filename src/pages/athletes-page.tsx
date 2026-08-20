import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchDashboardStats, fetchParticipants, queryKeys } from "@/lib/data";

export function AthletesPage() {
  const {
    data: participants,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.participants,
    queryFn: fetchParticipants,
  });

  const { data: stats, isPending: statsPending } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboardStats,
  });

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Athlet:innen</h1>
          <Link
            to="/athletes/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Athlet:in hinzufügen
          </Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Athlet:innen"
          value={statsPending ? "..." : String(stats?.participants ?? "-")}
        />
        <StatCard
          title="Leistungstests"
          value={statsPending ? "..." : String(stats?.tests ?? "-")}
        />
        <StatCard
          title="Jahrgänge"
          value={statsPending ? "..." : String(stats?.yearCount ?? "-")}
        />
        <StatCard
          title="Referenzen"
          value={statsPending ? "..." : String(stats?.references ?? "-")}
        />
      </section>

      {isError ? <p className="mb-4 text-sm text-red-400">{error.message}</p> : null}

      <div className="overflow-hidden rounded-xl border border-card-border bg-card">
        <div className="grid grid-cols-[1fr_140px_140px] border-b border-card-border px-5 py-3 text-sm font-medium text-foreground/60">
          <span>Name</span>
          <span>Jahrgang</span>
          <span>Typ</span>
        </div>

        {isPending ? (
          <div className="px-5 py-10 text-center text-sm text-foreground/60">
            Lade Athlet:innen...
          </div>
        ) : !participants || participants.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-foreground/60">
            Noch keine Athlet:innen vorhanden.
          </div>
        ) : (
          <div>
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="grid grid-cols-[1fr_140px_140px] border-b border-card-border/50 px-5 py-4 text-sm last:border-b-0"
              >
                <Link to={`/athletes/${participant.id}`} className="font-medium hover:underline">
                  {participant.name}
                </Link>
                <span className="text-foreground/70">{participant.birth_year ?? "-"}</span>
                <span className="text-foreground/70">
                  {participant.participant_type === "reference" ? "Referenz" : "Athlet:in"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

type StatCardProps = {
  title: string;
  value: string;
};

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <p className="text-sm text-foreground/60">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
