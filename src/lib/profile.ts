import type { ComparisonMetric } from "@/lib/types";

/**
 * Gemeinsame Datenstruktur für den Profil-Radar-Chart (siehe
 * `performance-radar-chart.tsx`): eine Achse pro Messgröße, ein Polygon pro
 * Teilnehmer:in. Wird im Leistungsvergleich befüllt (`comparison-summary.ts`,
 * Z-Index je Altersklasse, siehe dort für Details zur Normierung).
 */
export type ProfilePoint = {
  metric: string;
  metricKey: ComparisonMetric;
  /** Reservierter Schlüssel für den Referenzring des Populationsdurchschnitts (siehe `AVERAGE_RADIUS_PERCENT`), kein Teilnehmer:in. */
  average: number;
  [participantId: string]: number | string | null;
};

export type ProfileSeries = {
  id: string;
  label: string;
  participantType: "athlete" | "reference";
  /** Ungenormte Messwerte je Messgröße, für die Tooltip-Anzeige. */
  rawValues: Partial<Record<ComparisonMetric, number>>;
};

export type ProfileData = {
  points: ProfilePoint[];
  series: ProfileSeries[];
  athleteCount: number;
  /**
   * Anzahl Personen, die zwar in mindestens einer Messgröße einen Wert
   * hatten, aber nicht in allen – sie werden nicht im Radar dargestellt, da
   * fehlende Achsen sonst als Wert 0 (Mittelpunkt) interpretiert würden und
   * das Polygon zu einem spitzen Dreieck statt einem Fünfeck verzerren.
   */
  incompleteCount: number;
};
