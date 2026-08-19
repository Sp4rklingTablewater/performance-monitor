import type { PerformanceTest } from "@/lib/types";

type JumpHeightInput = Pick<PerformanceTest, "reach_height_cm" | "jump_reach_cm">;

/**
 * Berechnet die absolute Sprunghoehe (Sprungreichweite minus Reichhoehe).
 * Liefert `null`, wenn eine der beiden Messgroessen fehlt.
 */
export function computeJumpHeight(test: JumpHeightInput): number | null {
  if (test.reach_height_cm === null || test.jump_reach_cm === null) {
    return null;
  }

  return test.jump_reach_cm - test.reach_height_cm;
}
