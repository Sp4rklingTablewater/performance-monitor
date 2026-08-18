import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { deletePerformanceTest } from "./actions";

type DeletePerformanceTestPageProps = {
    params: Promise<{
        id: string;
        testId: string;
    }>;
};

export default async function DeletePerformanceTestPage({
                                                            params,
                                                        }: DeletePerformanceTestPageProps) {
    const { id, testId } = await params;
    const supabase = await createClient();

    const { data: participant } = await supabase
        .from("participants")
        .select("id, name")
        .eq("id", id)
        .single();

    if (!participant) {
        notFound();
    }

    const { data: test } = await supabase
        .from("performance_tests")
        .select("id, test_date, age_group")
        .eq("id", testId)
        .eq("participant_id", id)
        .single();

    if (!test) {
        notFound();
    }

    const deleteTest = deletePerformanceTest.bind(
        null,
        participant.id,
        test.id
    );

    return (
        <>
            <header className="mb-8">
                <Link
                    href={`/athletes/${participant.id}/tests/${test.id}/edit`}
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                    ← Zurück
                </Link>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                    Leistungstest löschen
                </h1>
            </header>

            <div className="max-w-xl rounded-xl border border-red-200 bg-white p-6">
                <p className="font-medium">
                    Möchtest du diesen Leistungstest wirklich löschen?
                </p>

                <div className="mt-4 text-sm text-zinc-600">
                    <p>{participant.name}</p>
                    <p>
                        {test.test_date}
                        {test.age_group ? ` · ${test.age_group}` : ""}
                    </p>
                </div>

                <p className="mt-4 text-sm text-red-700">
                    Der Leistungstest wird dauerhaft gelöscht.
                </p>

                <div className="mt-6 flex gap-3">
                    <form action={deleteTest}>
                        <button
                            type="submit"
                            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                        >
                            Endgültig löschen
                        </button>
                    </form>

                    <Link
                        href={`/athletes/${participant.id}/tests/${test.id}/edit`}
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                    >
                        Abbrechen
                    </Link>
                </div>
            </div>
        </>
    );
}