import { describe, expect, it } from "vitest";
import { matchesParticipantFilter } from "@/lib/participant-filter";

describe("matchesParticipantFilter", () => {
  it("includes references only when showReferences is true, regardless of birthYears", () => {
    const reference = { participant_type: "reference" as const, birth_year: null };

    expect(
      matchesParticipantFilter(reference, { birthYears: [2010], showReferences: true }),
    ).toBe(true);
    expect(
      matchesParticipantFilter(reference, { birthYears: [2010], showReferences: false }),
    ).toBe(false);
  });

  it("includes all athletes when no birth years are selected", () => {
    const athlete = { participant_type: "athlete" as const, birth_year: 2012 };

    expect(matchesParticipantFilter(athlete, { birthYears: [], showReferences: true })).toBe(true);
  });

  it("excludes athletes whose birth year is not part of the selection", () => {
    const athlete = { participant_type: "athlete" as const, birth_year: 2012 };

    expect(
      matchesParticipantFilter(athlete, { birthYears: [2010, 2011], showReferences: true }),
    ).toBe(false);
  });

  it("excludes athletes without a birth year once a birth year filter is active", () => {
    const athlete = { participant_type: "athlete" as const, birth_year: null };

    expect(
      matchesParticipantFilter(athlete, { birthYears: [2010], showReferences: true }),
    ).toBe(false);
  });
});

