import { describe, expect, it } from "vitest";
import { buildZIndexData } from "@/lib/z-index";
import { createTest } from "@/lib/test-utils";

describe("buildZIndexData", () => {
  it("computes a positive z-score for an above-average value on a higher-is-better metric", () => {
    const tests = [
      createTest({ age_group: "U14", ball_control_count: 10, participant: { id: "a" } }),
      createTest({ age_group: "U14", ball_control_count: 20, participant: { id: "b" } }),
      createTest({ age_group: "U14", ball_control_count: 30, participant: { id: "target" } }),
    ];

    const data = buildZIndexData(tests, "target");
    const point = data.points.find((item) => item.ageGroup === "U14");

    expect(point?.values.ball_control?.z).toBeCloseTo(1);
  });

  it("flips the sign for lower-is-better metrics, so a faster sprint time yields a positive z-score", () => {
    const tests = [
      createTest({ age_group: "U14", sprint_93639_seconds: 10, participant: { id: "a" } }),
      createTest({ age_group: "U14", sprint_93639_seconds: 12, participant: { id: "b" } }),
      createTest({ age_group: "U14", sprint_93639_seconds: 8, participant: { id: "target" } }),
    ];

    const data = buildZIndexData(tests, "target");
    const point = data.points.find((item) => item.ageGroup === "U14");

    // "target" ist schneller (kleinerer Rohwert) als der Populationsdurchschnitt
    // -> das muss trotz "lower is better" als POSITIVER Z-Wert erscheinen.
    expect(point?.values.sprint_93639?.z).toBeCloseTo(1);
  });

  it("omits a metric entirely when the population has zero standard deviation", () => {
    const tests = [
      createTest({ age_group: "U14", ball_control_count: 15, participant: { id: "a" } }),
      createTest({ age_group: "U14", ball_control_count: 15, participant: { id: "b" } }),
      createTest({ age_group: "U14", ball_control_count: 15, participant: { id: "target" } }),
    ];

    const data = buildZIndexData(tests, "target");
    const point = data.points.find((item) => item.ageGroup === "U14");

    expect(point?.values.ball_control).toBeUndefined();
  });

  it("only returns data points for the requested participant", () => {
    const tests = [
      createTest({ age_group: "U14", ball_control_count: 10, participant: { id: "a" } }),
      createTest({ age_group: "U14", ball_control_count: 20, participant: { id: "b" } }),
    ];

    const data = buildZIndexData(tests, "someone-else");

    expect(data.points).toHaveLength(0);
  });
});

