import type { Participant } from "@/lib/types";

export type ParticipantFilterOptions = {
  /** Leeres Array = keine Einschränkung (alle Jahrgänge). Wird für Referenzen ignoriert. */
  birthYears: number[];
  showReferences: boolean;
};

type FilterableParticipant = Pick<Participant, "participant_type" | "birth_year">;

/**
 * Gemeinsame Athlet:in/Referenz- + Jahrgangs-Filterregel, wie sie in
 * Leistungsvergleich, Ranking und Entwicklungs-Chart identisch gebraucht
 * wird: Referenzpersonen werden nur über `showReferences` ein-/ausgeblendet
 * (Jahrgangsfilter gilt für sie nicht, da Referenzen kein Jahrgangskonzept
 * haben), Athlet:innen zusätzlich über `birthYears`.
 *
 * Vorher an drei Stellen (ranking.ts, development.ts,
 * performance-comparison.tsx) fast identisch dupliziert – ein Bugfix hier
 * (z. B. eine übersehene Kombination) musste bisher an drei Stellen
 * synchron nachgezogen werden.
 */
export function matchesParticipantFilter(
  participant: FilterableParticipant,
  { birthYears, showReferences }: ParticipantFilterOptions,
): boolean {
  if (participant.participant_type === "reference") {
    return showReferences;
  }

  if (
    birthYears.length > 0 &&
    (participant.birth_year === null || !birthYears.includes(participant.birth_year))
  ) {
    return false;
  }

  return true;
}

