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
    throw new Error("Ungueltiger Zahlenwert.");
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

  throw new Error("Ungueltiger Typ.");
}
