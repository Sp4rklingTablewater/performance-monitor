import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AthletePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function AthletePage({
                                              params,
                                          }: AthletePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("id, name, birth_year, participant_type, active")
        .eq("id", id)
        .single();

    if (participantError || !participant) {
        notFound();
    }

    const { data: tests, error: testsError } = await supabase
        .from("performance_tests")
        .select(
            "id, test_date, age_group, reach_height_cm, jump_reach_cm, sprint_93639_seconds, ball_control_count"
        )
        .eq("participant_id", id)
        .order("test_date", { ascending: false });

    if (testsError) {
        throw new Error(
            `Leistungstests konnten nicht geladen werden: ${testsError.message}`
        );
    }

    return (
        <>
            <header className="mb-8">
                <Link
                    href="/athletes"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                    ← Athlet:innen
                </Link>

                <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {participant.name}
                        </h1>

                        <p className="mt-2 text-sm text-zinc-500">
                            {participant.birth_year
                                ? `Jahrgang ${participant.birth_year}`
                                : "Kein Jahrgang"}
                            {" · "}
                            {participant.participant_type === "reference"
                                ? "Referenz"
                                : "Athlet:in"}
                        </p>
                    </div>

                    <Link
                        href={`/athletes/${participant.id}/tests/new`}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                    >
                        Test hinzufügen
                    </Link>
                </div>
            </header>

            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Leistungstests
                </h2>

                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    <div className="grid grid-cols-[110px_100px_repeat(5,1fr)_80px] gap-4 border-b border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-500">
                        <span>Datum</span>
                        <span>Altersklasse</span>
                        <span>Reichhöhe</span>
                        <span>Sprunghöhe</span>
                        <span>Sprung absolut</span>
                        <span>9-3-6-3-9</span>
                        <span>Ballkontrolle</span>
                        <span></span>
                    </div>

                    {tests.length === 0 ? (
                        <div className="px-5 py-10 text-center text-sm text-zinc-500">
                            Noch keine Leistungstests vorhanden.
                        </div>
                    ) : (
                        tests.map((test) => {
                            const jumpHeight =
                                test.reach_height_cm !== null &&
                                test.jump_reach_cm !== null
                                    ? test.jump_reach_cm - test.reach_height_cm
                                    : null;

                            return (
                                <div
                                    key={test.id}
                                    className="grid grid-cols-[110px_100px_repeat(5,1fr)_80px] gap-4 border-b border-zinc-100 px-5 py-4 text-sm last:border-b-0"
                                >
                                    <span>{test.test_date}</span>

                                    <span>{test.age_group ?? "–"}</span>

                                    <span>
      {test.reach_height_cm !== null
          ? `${test.reach_height_cm} cm`
          : "–"}
    </span>

                                    <span>
      {test.jump_reach_cm !== null
          ? `${test.jump_reach_cm} cm`
          : "–"}
    </span>

                                    <span>
      {jumpHeight !== null
          ? `${jumpHeight} cm`
          : "–"}
    </span>

                                    <span>
      {test.sprint_93639_seconds !== null
          ? `${test.sprint_93639_seconds} s`
          : "–"}
    </span>

                                    <span>{test.ball_control_count ?? "–"}</span>

                                    <Link
                                        href={`/athletes/${participant.id}/tests/${test.id}/edit`}
                                        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                                    >
                                        Ändern
                                    </Link>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </>
    );
}