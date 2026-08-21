import { describe, expect, it } from "vitest";
import { buildComparisonChartData } from "@/lib/comparison-chart-data";
import { createTest } from "@/lib/test-utils";

describe("buildComparisonChartData", () => {
  it("includes the birth year in the label when more than one birth year can be shown", () => {
    const tests = [
      createTest({
        age_group: "U14",
        ball_control_count: 10,
        participant: { id: "a", name: "Anna", birth_year: 2010 },
      }),
    ];

    const data = buildComparisonChartData(tests, {
      metric: "ball_control",
      ageGroup: "U14",
      birthYears: [2010, 2011],
      showReferences: true,
    });

    expect(data[0].label).toBe("Anna (2010)");
  });

  it("omits the birth year from the label when exactly one birth year is selected", () => {
    const tests = [
      createTest({
        age_group: "U14",
        ball_control_count: 10,
        participant: { id: "a", name: "Anna", birth_year: 2010 },
      }),
    ];

    const data = buildComparisonChartData(tests, {
      metric: "ball_control",
      ageGroup: "U14",
      birthYears: [2010],
      showReferences: true,
    });

    expect(data[0].label).toBe("Anna");
  });

  it("filters out tests from a different age group", () => {
    const tests = [
      createTest({ age_group: "U12.1", ball_control_count: 10, participant: { id: "a" } }),
    ];

    const data = buildComparisonChartData(tests, {
      metric: "ball_control",
      ageGroup: "U14",
      birthYears: [],
      showReferences: true,
    });

    expect(data).toHaveLength(0);
  });

  it("excludes tests with no value for the selected metric", () => {
    const tests = [
      createTest({ age_group: "U14", ball_control_count: null, participant: { id: "a" } }),
    ];

    const data = buildComparisonChartData(tests, {
      metric: "ball_control",
      ageGroup: "U14",
      birthYears: [],
      showReferences: true,
    });

    expect(data).toHaveLength(0);
  });

  it("uses participantId as the item's identity even if two participants share the same label", () => {
    const tests = [
      createTest({
        age_group: "U14",
        ball_control_count: 10,
        participant: { id: "a", name: "Max", birth_year: 2010 },
      }),
      createTest({
        age_group: "U14",
        ball_control_count: 20,
        participant: { id: "b", name: "Max", birth_year: 2010 },
      }),
    ];

    const data = buildComparisonChartData(tests, {
      metric: "ball_control",
      ageGroup: "U14",
      birthYears: [2010],
      showReferences: true,
    });

    expect(data.map((item) => item.participantId)).toEqual(["a", "b"]);
  });
});

