import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updatePerformanceTest } from "./actions";

type EditPerformanceTestPageProps = {
    params: Promise<{
        id: string;
        testId: string;
    }>;
};

export default async function EditPerformanceTestPage({
                                                          params,
                                                      }: EditPerformanceTestPageProps) {
    const { id, testId } = await params;
    const supabase = await createClient();

    const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("id, name, birth_year")
        .eq("id", id)
        .single();

    if (participantError || !participant) {
        notFound();
    }

    const { data: test, error: testError } = await supabase
        .from("performance_tests")
        .select(
            "id, test_date, age_group, reach_height_cm, jump_reach_cm, sprint_93639_seconds, ball_control_count"
        )
        .eq("id", testId)
        .eq("participant_id", id)
        .single();

    if (testError || !test) {
        notFound();
    }

    const updateTest = updatePerformanceTest.bind(
        null,
        participant.id,
        test.id
    );

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
                    Leistungstest bearbeiten
                </h1>
            </header>

            <form
                action={updateTest}
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
                            defaultValue={test.test_date}
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
                            defaultValue={test.age_group ?? ""}
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

                        <input
                            id="reach_height_cm"
                            name="reach_height_cm"
                            type="number"
                            min="1"
                            step="1"
                            defaultValue={test.reach_height_cm ?? ""}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="jump_reach_cm"
                            className="mb-1 block text-sm font-medium"
                        >
                            Sprunghöhe
                        </label>

                        <input
                            id="jump_reach_cm"
                            name="jump_reach_cm"
                            type="number"
                            min="1"
                            step="1"
                            defaultValue={test.jump_reach_cm ?? ""}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
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

                        <input
                            id="sprint_93639_seconds"
                            name="sprint_93639_seconds"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={test.sprint_93639_seconds ?? ""}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
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
                            defaultValue={test.ball_control_count ?? ""}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
                    </div>
                </div>

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

                    <Link
                        href={`/athletes/${participant.id}/tests/${test.id}/delete`}
                        className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                        Test löschen
                    </Link>
                </div>
            </form>
        </>
    );
}