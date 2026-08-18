import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AthletesPage() {
    const supabase = await createClient();

    const { data: participants, error } = await supabase
        .from("participants")
        .select("id, name, birth_year, participant_type, active")
        .eq("active", true)
        .order("name", { ascending: true });

    if (error) {
        throw new Error(`Failed to load participants: ${error.message}`);
    }

    return (
        <>
            <header className="mb-8">
                <p className="text-sm font-medium text-zinc-500">Athlet:innen</p>

                <div className="mt-2 flex items-center justify-between gap-4">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Athlet:innen
                    </h1>

                    <Link
                        href="/athletes/new"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                    >
                        Athlet:in hinzufügen
                    </Link>
                </div>
            </header>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <div className="grid grid-cols-[1fr_140px_140px] border-b border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-500">
                    <span>Name</span>
                    <span>Jahrgang</span>
                    <span>Typ</span>
                </div>

                {participants.length === 0 ? (
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
                                <Link
                                    href={`/athletes/${participant.id}`}
                                    className="font-medium hover:underline"
                                >
                                    {participant.name}
                                </Link>

                                <span className="text-zinc-600">
                  {participant.birth_year ?? "–"}
                </span>

                                <span className="text-zinc-600">
                  {participant.participant_type === "reference"
                      ? "Referenz"
                      : "Athlet:in"}
                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}