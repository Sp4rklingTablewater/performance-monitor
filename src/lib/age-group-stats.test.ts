import { describe, expect, it } from "vitest";
import { computeAgeGroupStats } from "@/lib/age-group-stats";
import { createTest } from "@/lib/test-utils";

describe("computeAgeGroupStats", () => {
  it("computes mean and sample standard deviation per age group", () => {
    const tests = [
      createTest({ age_group: "U14", ball_control_count: 10, participant: { id: "a" } }),
      createTest({ age_group: "U14", ball_control_count: 20, participant: { id: "b" } }),
      createTest({ age_group: "U14", ball_control_count: 30, participant: { id: "c" } }),
    ];

    const stats = computeAgeGroupStats(tests, "ball_control").get("U14");

    expect(stats?.mean).toBe(20);
    expect(stats?.std).toBeCloseTo(10);
    expect(stats?.sampleSize).toBe(3);
  });

  it("excludes reference participants from the population", () => {
    const tests = [
      createTest({
        age_group: "U14",
        ball_control_count: 10,
        participant: { id: "a", participant_type: "athlete" },
      }),
      createTest({
        age_group: "U14",
        ball_control_count: 999,
        participant: { id: "ref", participant_type: "reference" },
      }),
    ];

    // Nur 1 Athlet:innen-Wert übrig -> unter der Mindeststichprobe von 2.
    expect(computeAgeGroupStats(tests, "ball_control").has("U14")).toBe(false);
  });

  it("omits an age group with fewer than 2 athlete values", () => {
    const tests = [
      createTest({ age_group: "U14", ball_control_count: 10, participant: { id: "a" } }),
    ];

    expect(computeAgeGroupStats(tests, "ball_control").has("U14")).toBe(false);
  });

  it("uses only the latest value per participant within the same age group", () => {
    const tests = [
      createTest({
        age_group: "U14",
        ball_control_count: 10,
        test_date: "2024-01-01",
        participant: { id: "a" },
      }),
      createTest({
        age_group: "U14",
        ball_control_count: 50,
        test_date: "2024-06-01",
        participant: { id: "a" },
      }),
      createTest({
        age_group: "U14",
        ball_control_count: 30,
        test_date: "2024-01-01",
        participant: { id: "b" },
      }),
    ];

    const stats = computeAgeGroupStats(tests, "ball_control").get("U14");

    // Teilnehmer:in "a" geht mit 50 (späterer Test) ein, nicht mit 10 -> Ø von (50, 30) = 40.
    expect(stats?.mean).toBe(40);
  });

  it("ignores tests without a recognized age group", () => {
    const tests = [
      createTest({ age_group: null, ball_control_count: 10, participant: { id: "a" } }),
      createTest({
        age_group: "not-a-real-group",
        ball_control_count: 20,
        participant: { id: "b" },
      }),
    ];

    expect(computeAgeGroupStats(tests, "ball_control").size).toBe(0);
  });
});

