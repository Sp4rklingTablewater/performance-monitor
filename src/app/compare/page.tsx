import { createClient } from "@/lib/supabase/server";
import { PerformanceComparison } from "@/components/performance-comparison";

export default async function ComparePage() {
    const supabase = await createClient();

    const { data: tests, error } = await supabase
        .from("performance_tests")
        .select(`
            id,
            test_date,
            age_group,
            reach_height_cm,
            jump_reach_cm,
            sprint_93639_seconds,
            ball_control_count,
            participants!inner (
                id,
                name,
                birth_year,
                participant_type,
                active
            )
        `)
        .eq("participants.active", true)
        .order("test_date", { ascending: true });

    if (error) {
        throw new Error(
            `Vergleichsdaten konnten nicht geladen werden: ${error.message}`
        );
    }

    return (
        <>
            <header className="mb-8">
                <p className="text-sm font-medium text-zinc-500">
                    Vergleich
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Leistungsvergleich
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Leistungen innerhalb einer Altersklasse vergleichen.
                </p>
            </header>

            <PerformanceComparison tests={tests} />
        </>
    );
}