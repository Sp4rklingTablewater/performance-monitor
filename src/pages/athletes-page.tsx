import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchParticipants, queryKeys } from "@/lib/data";

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

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Athlet:innen</h1>
          <Link
            to="/athletes/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Athlet:in hinzufügen
          </Link>
        </div>
      </header>

      {isError ? <p className="mb-4 text-sm text-red-700">{error.message}</p> : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-[1fr_140px_140px] border-b border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-500">
          <span>Name</span>
          <span>Jahrgang</span>
          <span>Typ</span>
        </div>

        {isPending ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">Lade Athlet:innen...</div>
        ) : !participants || participants.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">
            Noch keine Athlet:innen vorhanden.
          </div>
        ) : (
          <div>
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="grid grid-cols-[1fr_140px_140px] border-b border-zinc-100 px-5 py-4 text-sm last:border-b-0"
              >
                <Link to={`/athletes/${participant.id}`} className="font-medium hover:underline">
                  {participant.name}
                </Link>
                <span className="text-zinc-600">{participant.birth_year ?? "-"}</span>
                <span className="text-zinc-600">
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
