import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createPerformanceTest } from "./actions";

type NewPerformanceTestPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function NewPerformanceTestPage({
                                                         params,
                                                     }: NewPerformanceTestPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: participant, error } = await supabase
        .from("participants")
        .select("id, name, birth_year")
        .eq("id", id)
        .single();

    if (error || !participant) {
        notFound();
    }

    const createTest = createPerformanceTest.bind(null, participant.id);

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
        Leistungstest hinzufügen
    </h1>

    <p className="mt-2 text-sm text-zinc-500">
        {participant.name}
    {participant.birth_year
        ? ` · Jahrgang ${participant.birth_year}`
        : ""}
    </p>
    </header>

    <form
    action={createTest}
    className="max-w-2xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
    >
    <div className="grid gap-6 sm:grid-cols-2">
    <div>
        <label
            htmlFor="test_date"
    className="mb-1 block text-sm font-medium"
        >
        Testdatum
        </label>

        <input
    id="test_date"
    name="test_date"
    type="date"
    required
    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
    />
    </div>

    <div>
    <label
        htmlFor="age_group"
    className="mb-1 block text-sm font-medium"
        >
        Altersklasse
        </label>

        <input
    id="age_group"
    name="age_group"
    type="text"
    placeholder="z. B. U14"
    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
    <div>
        <label
            htmlFor="reach_height_cm"
    className="mb-1 block text-sm font-medium"
        >
        Reichhöhe
        </label>

        <div className="flex">
    <input
        id="reach_height_cm"
    name="reach_height_cm"
    type="number"
    min="1"
    step="1"
    className="w-full rounded-l-lg border border-zinc-300 px-3 py-2"
    />
    <span className="flex items-center rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">
    cm
    </span>
    </div>
    </div>

    <div>
    <label
        htmlFor="jump_reach_cm"
    className="mb-1 block text-sm font-medium"
        >
        Sprunghöhe
        </label>

        <div className="flex">
    <input
        id="jump_reach_cm"
    name="jump_reach_cm"
    type="number"
    min="1"
    step="1"
    className="w-full rounded-l-lg border border-zinc-300 px-3 py-2"
    />
    <span className="flex items-center rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">
        cm
        </span>
        </div>
        </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
    <div>
        <label
            htmlFor="sprint_93639_seconds"
    className="mb-1 block text-sm font-medium"
        >
        9-3-6-3-9
        </label>

        <div className="flex">
    <input
        id="sprint_93639_seconds"
    name="sprint_93639_seconds"
    type="number"
    min="0"
    step="0.01"
    className="w-full rounded-l-lg border border-zinc-300 px-3 py-2"
    />
    <span className="flex items-center rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">
    s
    </span>
    </div>
    </div>

    <div>
    <label
        htmlFor="ball_control_count"
    className="mb-1 block text-sm font-medium"
        >
        Ballkontrolle
        </label>

        <input
    id="ball_control_count"
    name="ball_control_count"
    type="number"
    min="0"
    step="1"
    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        </div>
        </div>

        <div className="flex gap-3">
    <button
        type="submit"
    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
        Test speichern
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