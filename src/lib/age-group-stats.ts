import { ageGroupOrder } from "@/lib/constants";
import { getComparisonMetricValue } from "@/lib/metrics";
import type { ComparisonMetric, ComparisonTest } from "@/lib/types";

export type AgeGroupStats = {
  mean: number;
  /** Stichproben-Std.-Abw. (Teiler n-1). */
  std: number;
  sampleSize: number;
};

/**
 * Populations-Statistik (Mittelwert, Stichproben-Std.-Abw.) je Altersklasse
 * für eine Messgröße. Gemeinsame Grundlage für den Normbereich im
 * Entwicklungs-Chart (`development.ts`) und den Z-Index-Chart auf der
 * Athletenseite (`z-index.ts`) – beide sollen sich auf dieselbe
 * Vergleichspopulation beziehen.
 *
 * Bezieht sich bewusst auf ALLE Athlet:innen-Tests dieser Altersklasse, über
 * alle Jahrgänge/Kalenderjahre hinweg, ohne Referenzpersonen (die sind ein
 * Ziel-Maßstab, keine Norm für Jugendliche) – unabhängig von Filtern
 * (Jahrgangs-Auswahl etc.), die an anderer Stelle angewendet werden. So
 * bleibt die Population eine stabile, von der aktuellen Auswahl unabhängige
 * Vergleichsgröße.
 *
 * `tests` muss aufsteigend nach `test_date` sortiert sein (wie von
 * `fetchComparisonTests` geliefert): Pro Person + Altersklasse zählt nur der
 * letzte Wert, damit Mehrfachtests innerhalb derselben Altersklasse nicht
 * doppelt in die Statistik einfließen.
 *
 * Altersklassen mit weniger als 2 Athlet:innen-Werten fehlen im Ergebnis
 * (Std.-Abw. bei nur einem Wert nicht sinnvoll).
 */
export function computeAgeGroupStats(
  tests: ComparisonTest[],
  metric: ComparisonMetric,
): Map<string, AgeGroupStats> {
  const validAgeGroups = new Set<string>(ageGroupOrder);
  const valuesByAgeGroup = new Map<string, Map<string, number>>();

  for (const test of tests) {
    if (
      !test.age_group ||
      !validAgeGroups.has(test.age_group) ||
      test.participant.participant_type === "reference"
    ) {
      continue;
    }

    const value = getComparisonMetricValue(test, metric);

    if (value === null) {
      continue;
    }

    let byParticipant = valuesByAgeGroup.get(test.age_group);

    if (!byParticipant) {
      byParticipant = new Map();
      valuesByAgeGroup.set(test.age_group, byParticipant);
    }

    byParticipant.set(test.participant.id, value);
  }

  const stats = new Map<string, AgeGroupStats>();

  for (const [ageGroup, byParticipant] of valuesByAgeGroup) {
    if (byParticipant.size < 2) {
      continue;
    }

    const values = Array.from(byParticipant.values());
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);

    stats.set(ageGroup, { mean, std: Math.sqrt(variance), sampleSize: values.length });
  }

  return stats;
}
