import type { ComparisonMetric, Participant, PerformanceTest } from "@/lib/types";

type JumpHeightInput = Pick<PerformanceTest, "reach_height_cm" | "jump_reach_cm">;

/**
 * Berechnet die absolute Sprunghöhe (Sprungreichweite minus Reichhöhe).
 * Liefert `null`, wenn eine der beiden Messgrößen fehlt.
 */
export function computeJumpHeight(test: JumpHeightInput): number | null {
  if (test.reach_height_cm === null || test.jump_reach_cm === null) {
    return null;
  }

  return test.jump_reach_cm - test.reach_height_cm;
}

type MetricValueInput = Pick<
  PerformanceTest,
  "reach_height_cm" | "jump_reach_cm" | "sprint_93639_seconds" | "ball_control_count"
>;

/**
 * Liest den Wert einer Vergleichs-Messgröße aus einem Leistungstest.
 * Liefert `null`, wenn die Messgröße für diesen Test nicht vorliegt.
 *
 * Nimmt bewusst nur die 4 tatsächlich benötigten Rohfelder entgegen (statt
 * `ComparisonTest`): So funktioniert die Funktion unverändert sowohl mit
 * `ComparisonTest` (Vergleichsseiten) als auch mit einem einfachen
 * `PerformanceTest` ohne `participant`-Relation (Athletenseite).
 */
export function getComparisonMetricValue(
  test: MetricValueInput,
  metric: ComparisonMetric,
): number | null {
  if (metric === "reach_height") {
    return test.reach_height_cm === null ? null : Number(test.reach_height_cm);
  }

  if (metric === "jump_reach") {
    return test.jump_reach_cm === null ? null : Number(test.jump_reach_cm);
  }

  if (metric === "jump_height") {
    return computeJumpHeight(test);
  }

  if (metric === "sprint_93639") {
    return test.sprint_93639_seconds === null ? null : Number(test.sprint_93639_seconds);
  }

  return test.ball_control_count;
}

type LabelParticipant = Pick<Participant, "name" | "birth_year" | "participant_type">;

/**
 * Baut das Anzeige-Label für eine:n Teilnehmer:in in Charts/Tabellen.
 * Referenzen erhalten den Zusatz „(Ref.)“, Athlet:innen den Jahrgang in
 * Klammern – aber nur, wenn `showBirthYear` true ist (z. B. weil mehrere
 * Jahrgänge gleichzeitig angezeigt werden und der Jahrgang sonst nicht
 * eindeutig wäre).
 */
export function buildParticipantLabel(
  participant: LabelParticipant,
  { showBirthYear }: { showBirthYear: boolean },
): string {
  if (participant.participant_type === "reference") {
    return `${participant.name} (Ref.)`;
  }

  return showBirthYear
    ? `${participant.name} (${participant.birth_year ?? "-"})`
    : participant.name;
}

export type MetricConfig = {
  label: string;
  unit: string;
  betterDirection: "higher" | "lower";
  /** Anzahl sinnvoller Nachkommastellen für Anzeige/Achsenbeschriftung. */
  decimals: number;
};

export const metricConfig: Record<ComparisonMetric, MetricConfig> = {
  reach_height: {
    label: "Reichhöhe im Stand",
    unit: "cm",
    betterDirection: "higher",
    decimals: 0,
  },
  jump_reach: {
    label: "Reichhöhe im Sprung",
    unit: "cm",
    betterDirection: "higher",
    decimals: 0,
  },
  jump_height: {
    label: "Sprung absolut",
    unit: "cm",
    betterDirection: "higher",
    decimals: 0,
  },
  sprint_93639: {
    label: "9-3-6-3-9",
    unit: "s",
    betterDirection: "lower",
    decimals: 2,
  },
  ball_control: {
    label: "Ballkontrolle",
    unit: "",
    betterDirection: "higher",
    decimals: 0,
  },
};

/** Rundet einen Messwert auf die für die Messgröße sinnvolle Anzahl Nachkommastellen. */
export function formatMetricValue(value: number | string, metric: ComparisonMetric): string {
  return Number(value).toFixed(metricConfig[metric].decimals);
}

export type MetricTimeSeriesPoint = {
  date: string;
  value: number;
};

/**
 * Baut die Zeitreihe einer einzelnen Messgröße über mehrere Tests (z. B. für
 * `PerformanceLineChart` auf der Athletenseite). Tests ohne Wert für diese
 * Messgröße werden ausgelassen statt einer erfundenen Lücke.
 *
 * Als generische, über `ComparisonMetric` parametrisierte Funktion ersetzt
 * das 5 vorher pro Messgröße fast identisch kopierte Filter+Map-Blöcke
 * (eine Kopie pro Diagramm) – jede Kopie hätte bei einer neuen Messgröße
 * erneut dupliziert und dabei potenziell das falsche Feld erwischt werden
 * müssen. Da `getComparisonMetricValue` bereits die einzige Quelle für "wie
 * liest man Messgröße X aus einem Test" ist, muss dieses Wissen hier nicht
 * erneut existieren.
 */
export function buildMetricTimeSeries(
  tests: (MetricValueInput & Pick<PerformanceTest, "test_date">)[],
  metric: ComparisonMetric,
  formatDate: (test: MetricValueInput & Pick<PerformanceTest, "test_date">) => string,
): MetricTimeSeriesPoint[] {
  return tests
    .map((test) => ({ date: formatDate(test), value: getComparisonMetricValue(test, metric) }))
    .filter((point): point is MetricTimeSeriesPoint => point.value !== null);
}
