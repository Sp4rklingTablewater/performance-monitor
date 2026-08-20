import type { ComparisonMetric, ComparisonTest, PerformanceTest } from "@/lib/types";

type JumpHeightInput = Pick<PerformanceTest, "reach_height_cm" | "jump_reach_cm">;

/**
 * Berechnet die absolute Sprunghöhe (Sprungreichweite minus Reichhöhe).
 * Liefert `null`, wenn eine der beiden Messgrößen fehlt.
 */
export function computeJumpHeight(test: JumpHeightInput): number | null {
  if (test.reach_height_cm === null || test.jump_reach_cm === null) {
    return null;
  }

  return test.jump_reach_cm - test.reach_height_cm;
}

/**
 * Liest den Wert einer Vergleichs-Messgröße aus einem Leistungstest.
 * Liefert `null`, wenn die Messgröße für diesen Test nicht vorliegt.
 */
export function getComparisonMetricValue(
  test: ComparisonTest,
  metric: ComparisonMetric,
): number | null {
  if (metric === "reach_height") {
    return test.reach_height_cm === null ? null : Number(test.reach_height_cm);
  }

  if (metric === "jump_reach") {
    return test.jump_reach_cm === null ? null : Number(test.jump_reach_cm);
  }

  if (metric === "jump_height") {
    return computeJumpHeight(test);
  }

  if (metric === "sprint_93639") {
    return test.sprint_93639_seconds === null ? null : Number(test.sprint_93639_seconds);
  }

  return test.ball_control_count;
}

export type MetricConfig = {
  label: string;
  unit: string;
  betterDirection: "higher" | "lower";
};

export const metricConfig: Record<ComparisonMetric, MetricConfig> = {
  reach_height: {
    label: "Reichhöhe im Stand",
    unit: "cm",
    betterDirection: "higher",
  },
  jump_reach: {
    label: "Reichhöhe im Sprung",
    unit: "cm",
    betterDirection: "higher",
  },
  jump_height: {
    label: "Sprung absolut",
    unit: "cm",
    betterDirection: "higher",
  },
  sprint_93639: {
    label: "9-3-6-3-9",
    unit: "s",
    betterDirection: "lower",
  },
  ball_control: {
    label: "Ballkontrolle",
    unit: "",
    betterDirection: "higher",
  },
};

