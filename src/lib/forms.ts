export function requireString(value: FormDataEntryValue | null, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} fehlt.`);
  }

  return value.trim();
}

export function parseNullableNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Ungültiger Zahlenwert.");
  }

  return parsed;
}

export function parseOptionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parseParticipantType(value: FormDataEntryValue | null): "athlete" | "reference" {
  if (value === "athlete" || value === "reference") {
    return value;
  }

  throw new Error("Ungültiger Typ.");
}

export type PerformanceTestFormValues = {
  testDate: string;
  ageGroup: string | null;
  reachHeight: number | null;
  jumpReach: number | null;
  sprint: number | null;
  ballControl: number | null;
};

/** Liest und validiert die Felder des Leistungstest-Formulars (Neuanlage & Bearbeitung). */
export function parsePerformanceTestForm(formData: FormData): PerformanceTestFormValues {
  return {
    testDate: requireString(formData.get("test_date"), "Testdatum"),
    ageGroup: parseOptionalString(formData.get("age_group")),
    reachHeight: parseNullableNumber(formData.get("reach_height_cm")),
    jumpReach: parseNullableNumber(formData.get("jump_reach_cm")),
    sprint: parseNullableNumber(formData.get("sprint_93639_seconds")),
    ballControl: parseNullableNumber(formData.get("ball_control_count")),
  };
}
