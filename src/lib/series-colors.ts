/**
 * Erzeugt für eine beliebige Anzahl an Serien (Athlet:innen/Referenzen) in
 * Linien-/Radar-Charts eindeutige Farben. Vorher gab es eine feste Palette
 * mit 10 Farben (`index % 10`) – ab der 11. Person wiederholten sich Farben,
 * wodurch z. B. zwei unterschiedliche Personen exakt dieselbe Linienfarbe
 * bekamen und eine Linie fälschlich der falschen Person zugeordnet wirkte.
 *
 * Der goldene Winkel (~137,5°) verteilt Farbtöne so, dass auch bei vielen
 * Serien benachbarte Indizes optisch gut unterscheidbar bleiben, ohne dass
 * eine feste Obergrenze an Farben existiert.
 */
const GOLDEN_ANGLE_DEGREES = 137.508;

/** Start-Farbton, damit Serie 0 weiterhin im vertrauten Sage-/Waldgrün beginnt. */
const BASE_HUE_DEGREES = 152;

export function getSeriesColor(index: number): string {
  const hue = (BASE_HUE_DEGREES + index * GOLDEN_ANGLE_DEGREES) % 360;
  return `hsl(${hue.toFixed(1)}deg 48% 45%)`;
}

