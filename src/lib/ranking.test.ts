import { describe, expect, it } from "vitest";
import { buildRankingTable } from "@/lib/ranking";
import { createTest } from "@/lib/test-utils";

describe("buildRankingTable", () => {
  it("assigns standard competition ranks (1, 2, 2, 4) for tied values", () => {
    const tests = [
      createTest({
        test_date: "2024-01-01",
        reach_height_cm: 0,
        jump_reach_cm: 250,
        participant: { id: "a", name: "Anna" },
      }),
      createTest({
        test_date: "2024-01-01",
        reach_height_cm: 0,
        jump_reach_cm: 240,
        participant: { id: "b", name: "Bea" },
      }),
      createTest({
        test_date: "2024-01-01",
        reach_height_cm: 0,
        jump_reach_cm: 240,
        participant: { id: "c", name: "Clara" },
      }),
      createTest({
        test_date: "2024-01-01",
        reach_height_cm: 0,
        jump_reach_cm: 200,
        participant: { id: "d", name: "Dana" },
      }),
    ];

    const rows = buildRankingTable(tests, {
      sortMetric: "jump_height",
      year: "2024",
      birthYears: [],
      showReferences: true,
    });

    expect(rows.map((row) => [row.name, row.rank])).toEqual([
      ["Anna", 1],
      ["Bea", 2],
      ["Clara", 2],
      ["Dana", 4],
    ]);
  });

  it("carries the last known value forward from an earlier year when none exists in the selected year", () => {
    const tests = [
      createTest({
        test_date: "2023-05-01",
        ball_control_count: 15,
        participant: { id: "a", name: "Anna" },
      }),
    ];

    const rows = buildRankingTable(tests, {
      sortMetric: "ball_control",
      year: "2024",
      birthYears: [],
      showReferences: true,
    });

    expect(rows[0].values.ball_control).toMatchObject({
      value: 15,
      isCarriedOver: true,
      testDate: "2023-05-01",
    });
  });

  it("does not carry a value forward from a later (not yet reached) year", () => {
    const tests = [
      createTest({
        test_date: "2025-01-01",
        ball_control_count: 15,
        participant: { id: "a", name: "Anna" },
      }),
    ];

    const rows = buildRankingTable(tests, {
      sortMetric: "ball_control",
      year: "2024",
      birthYears: [],
      showReferences: true,
    });

    expect(rows).toHaveLength(0);
  });

  it("excludes references when showReferences is false", () => {
    const tests = [
      createTest({
        test_date: "2024-01-01",
        ball_control_count: 10,
        participant: { id: "a", name: "Anna", participant_type: "athlete" },
      }),
      createTest({
        test_date: "2024-01-01",
        ball_control_count: 20,
        participant: { id: "ref", name: "Referenz", participant_type: "reference" },
      }),
    ];

    const rows = buildRankingTable(tests, {
      sortMetric: "ball_control",
      year: "2024",
      birthYears: [],
      showReferences: false,
    });

    expect(rows.map((row) => row.name)).toEqual(["Anna"]);
  });

  it("filters athletes by birth year but always keeps references", () => {
    const tests = [
      createTest({
        test_date: "2024-01-01",
        ball_control_count: 10,
        participant: { id: "a", name: "Anna", birth_year: 2010 },
      }),
      createTest({
        test_date: "2024-01-01",
        ball_control_count: 20,
        participant: { id: "b", name: "Bea", birth_year: 2011 },
      }),
      createTest({
        test_date: "2024-01-01",
        ball_control_count: 30,
        participant: { id: "ref", name: "Referenz", participant_type: "reference" },
      }),
    ];

    const rows = buildRankingTable(tests, {
      sortMetric: "ball_control",
      year: "2024",
      birthYears: [2010],
      showReferences: true,
    });

    expect(rows.map((row) => row.name).sort()).toEqual(["Anna", "Referenz"]);
  });

  it("lists participants without a value for the sort metric as unranked, sorted alphabetically", () => {
    const tests = [
      createTest({
        test_date: "2024-01-01",
        ball_control_count: 10,
        participant: { id: "a", name: "Zoe" },
      }),
      createTest({
        test_date: "2024-01-01",
        reach_height_cm: 0,
        jump_reach_cm: 200,
        participant: { id: "b", name: "Anna" },
      }),
    ];

    const rows = buildRankingTable(tests, {
      sortMetric: "ball_control",
      year: "2024",
      birthYears: [],
      showReferences: true,
    });

    expect(rows.map((row) => [row.name, row.rank])).toEqual([
      ["Zoe", 1],
      ["Anna", null],
    ]);
  });
});

