import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateParticipant } from "./actions";

type EditParticipantPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditParticipantPage({
                                                      params,
                                                  }: EditParticipantPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: participant, error } = await supabase
        .from("participants")
        .select("id, name, birth_year, participant_type, active")
        .eq("id", id)
        .single();

    if (error || !participant) {
        notFound();
    }

    const updateAthlete = updateParticipant.bind(null, participant.id);

    return (
        <>
            <header className="mb-8">
                <Link
                    href={`/athletes/${participant.id}`}
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                    ← {participant.name}
                </Link>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                    Athlet:in bearbeiten
                </h1>
            </header>

            <form
                action={updateAthlete}
                className="max-w-xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
            >
                <div>
                    <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium"
                    >
                        Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        defaultValue={participant.name}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="birth_year"
                        className="mb-1 block text-sm font-medium"
                    >
                        Jahrgang
                    </label>

                    <input
                        id="birth_year"
                        name="birth_year"
                        type="number"
                        min="1900"
                        max="2100"
                        defaultValue={participant.birth_year ?? ""}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="participant_type"
                        className="mb-1 block text-sm font-medium"
                    >
                        Typ
                    </label>

                    <select
                        id="participant_type"
                        name="participant_type"
                        defaultValue={participant.participant_type}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    >
                        <option value="athlete">Athlet:in</option>
                        <option value="reference">Referenz</option>
                    </select>
                </div>

                <label className="flex items-center gap-3">
                    <input
                        name="active"
                        type="checkbox"
                        defaultChecked={participant.active}
                    />
                    <span className="text-sm font-medium">Aktiv</span>
                    <span className="block text-sm text-zinc-500">
            Deaktivierte Athlet:innen bleiben mit ihren historischen
            Leistungstests erhalten.
        </span>
                </label>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                    >
                        Änderungen speichern
                    </button>

                    <Link
                        href={`/athletes/${participant.id}`}
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                    >
                        Abbrechen
                    </Link>
                </div>
            </form>
        </>
    );
}