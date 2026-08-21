import type { ComparisonTest } from "@/lib/types";

let counter = 0;

type ComparisonTestOverrides = Partial<Omit<ComparisonTest, "participant">> & {
  participant?: Partial<ComparisonTest["participant"]>;
};

/**
 * Test-Fixture-Fabrik für `ComparisonTest`. Erzeugt standardmäßig einen
 * vollständig gültigen Athlet:innen-Test in U14 ohne Messwerte; einzelne
 * Felder werden per `overrides` gezielt für den jeweiligen Testfall gesetzt.
 * Jeder Aufruf bekommt eine eindeutige `id`, damit Tests nicht versehentlich
 * durch kollidierende IDs verfälscht werden.
 */
export function createTest(overrides: ComparisonTestOverrides = {}): ComparisonTest {
  counter += 1;
  const { participant, ...rest } = overrides;

  return {
    id: `test-${counter}`,
    test_date: "2024-01-01",
    age_group: "U14",
    reach_height_cm: null,
    jump_reach_cm: null,
    sprint_93639_seconds: null,
    ball_control_count: null,
    ...rest,
    participant: {
      id: "participant-1",
      name: "Athlet",
      birth_year: 2010,
      participant_type: "athlete",
      active: true,
      ...participant,
    },
  };
}

