import { describe, expect, it } from "vitest";
import { buildMetricTimeSeries } from "@/lib/metrics";

describe("buildMetricTimeSeries", () => {
  it("maps each test to a date/value point using the given metric", () => {
    const tests = [
      { test_date: "2024-01-01", reach_height_cm: 200, jump_reach_cm: null, sprint_93639_seconds: null, ball_control_count: null },
      { test_date: "2024-06-01", reach_height_cm: 210, jump_reach_cm: null, sprint_93639_seconds: null, ball_control_count: null },
    ];

    const series = buildMetricTimeSeries(tests, "reach_height", (test) => test.test_date);

    expect(series).toEqual([
      { date: "2024-01-01", value: 200 },
      { date: "2024-06-01", value: 210 },
    ]);
  });

  it("computes the derived jump_height metric via reach and jump reach", () => {
    const tests = [
      { test_date: "2024-01-01", reach_height_cm: 200, jump_reach_cm: 260, sprint_93639_seconds: null, ball_control_count: null },
    ];

    const series = buildMetricTimeSeries(tests, "jump_height", (test) => test.test_date);

    expect(series).toEqual([{ date: "2024-01-01", value: 60 }]);
  });

  it("skips tests without a value for the requested metric instead of inventing a gap", () => {
    const tests = [
      { test_date: "2024-01-01", reach_height_cm: null, jump_reach_cm: null, sprint_93639_seconds: null, ball_control_count: 12 },
      { test_date: "2024-06-01", reach_height_cm: null, jump_reach_cm: null, sprint_93639_seconds: null, ball_control_count: 15 },
    ];

    const series = buildMetricTimeSeries(tests, "reach_height", (test) => test.test_date);

    expect(series).toEqual([]);
  });
});

