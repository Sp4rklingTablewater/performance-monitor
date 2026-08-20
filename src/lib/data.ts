import { supabase } from "@/lib/supabase/client";
import type { ComparisonTest, Participant, PerformanceTest } from "@/lib/types";

export const queryKeys = {
  authSession: ["auth", "session"] as const,
  dashboard: ["dashboard"] as const,
  participants: ["participants"] as const,
  participant: (id: string) => ["participants", id] as const,
  performanceTestsByParticipant: (id: string) => ["performance-tests", "participant", id] as const,
  performanceTest: (id: string, testId: string) => ["performance-tests", id, testId] as const,
  comparison: ["comparison"] as const,
};

export async function fetchDashboardStats() {
  const [participantsResult, testsResult, athleteYearsResult, referencesResult] = await Promise.all(
    [
      supabase.from("participants").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("performance_tests").select("id", { count: "exact", head: true }),
      supabase
        .from("participants")
        .select("birth_year")
        .eq("active", true)
        .eq("participant_type", "athlete"),
      supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .eq("active", true)
        .eq("participant_type", "reference"),
    ],
  );

  if (
    participantsResult.error ||
    testsResult.error ||
    athleteYearsResult.error ||
    referencesResult.error
  ) {
    throw new Error(
      participantsResult.error?.message ||
        testsResult.error?.message ||
        athleteYearsResult.error?.message ||
        referencesResult.error?.message ||
        "Daten konnten nicht geladen werden.",
    );
  }

  const yearCount = new Set(
    (athleteYearsResult.data ?? [])
      .map((item) => item.birth_year)
      .filter((value): value is number => value !== null),
  ).size;

  return {
    participants: participantsResult.count ?? 0,
    tests: testsResult.count ?? 0,
    yearCount,
    references: referencesResult.count ?? 0,
  };
}

export async function fetchParticipants(): Promise<Participant[]> {
  const { data, error } = await supabase
    .from("participants")
    .select("id, name, birth_year, participant_type, active, created_at")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Athlet:innen konnten nicht geladen werden: ${error.message}`);
  }

  return data;
}

export async function fetchParticipantById(id: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from("participants")
    .select("id, name, birth_year, participant_type, active, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Athlet:in konnte nicht geladen werden: ${error.message}`);
  }

  return data;
}

export async function fetchPerformanceTestsByParticipant(id: string): Promise<PerformanceTest[]> {
  const { data, error } = await supabase
    .from("performance_tests")
    .select(
      "id, participant_id, test_date, age_group, reach_height_cm, jump_reach_cm, sprint_93639_seconds, ball_control_count, notes, created_at",
    )
    .eq("participant_id", id)
    .order("test_date", { ascending: false });

  if (error) {
    throw new Error(`Leistungstests konnten nicht geladen werden: ${error.message}`);
  }

  return data;
}

export async function fetchPerformanceTest(
  id: string,
  testId: string,
): Promise<PerformanceTest | null> {
  const { data, error } = await supabase
    .from("performance_tests")
    .select(
      "id, participant_id, test_date, age_group, reach_height_cm, jump_reach_cm, sprint_93639_seconds, ball_control_count, notes, created_at",
    )
    .eq("id", testId)
    .eq("participant_id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Leistungstest konnte nicht geladen werden: ${error.message}`);
  }

  return data;
}

export async function fetchComparisonTests(): Promise<ComparisonTest[]> {
  const { data, error } = await supabase
    .from("performance_tests")
    .select(
      `
      id,
      participant_id,
      test_date,
      age_group,
      reach_height_cm,
      jump_reach_cm,
      sprint_93639_seconds,
      ball_control_count,
      notes,
      created_at,
      participants!inner (
        id,
        name,
        birth_year,
        participant_type,
        active
      )
    `,
    )
    .eq("participants.active", true)
    .order("test_date", { ascending: true });

  if (error) {
    throw new Error(`Vergleichsdaten konnten nicht geladen werden: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => {
      const participant = Array.isArray(row.participants) ? row.participants[0] : row.participants;

      if (!participant) {
        return null;
      }

      return {
        id: row.id,
        participant_id: row.participant_id,
        test_date: row.test_date,
        age_group: row.age_group,
        reach_height_cm: row.reach_height_cm,
        jump_reach_cm: row.jump_reach_cm,
        sprint_93639_seconds: row.sprint_93639_seconds,
        ball_control_count: row.ball_control_count,
        notes: row.notes,
        created_at: row.created_at,
        participant,
      } satisfies ComparisonTest;
    })
    .filter((value): value is ComparisonTest => value !== null);
}
