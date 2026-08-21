/**
 * Erzeugt für eine beliebige Anzahl an Serien (Athlet:innen/Referenzen) in
 * Linien-/Radar-Charts eindeutige Farben. Vorher gab es eine feste Palette
 * mit 10 Farben (`index % 10`) – ab der 11. Person wiederholten sich Farben,
 * wodurch z. B. zwei unterschiedliche Personen exakt dieselbe Linienfarbe
 * bekamen und eine Linie fälschlich der falschen Person zugeordnet wirkte.
 *
 * Das App-Theme (siehe `styles.css`) ist warm/erdig: Gold (`--primary`),
 * Salbei-Oliv (`--sage`), dunkles Braun/Schwarz. Deshalb werden zuerst diese
 * kuratierten, zum Schema passenden Töne verteilt (`THEME_COLORS`). Erst wenn
 * mehr Serien gleichzeitig dargestellt werden, als kuratierte Farben
 * existieren, kommen zusätzliche generierte Farben zum Einsatz – deren
 * Farbton bewusst auf den warmen Bereich (Braun → Oliv → Waldgrün)
 * beschränkt bleibt, statt über den kompletten Farbkreis (inkl. Blau/Lila/
 * Pink) zu rotieren, was nicht ins dunkle, erdige Theme passen würde.
 */
const THEME_COLORS = [
  "#4d8c79", // Waldgrün
  "#b5651d", // Terrakotta
  "#3c6e71", // Petrol-Grün
  "#c9a227", // Gold (nah an --primary)
  "#2f5d50", // dunkles Tannengrün
  "#8a4b3b", // Rotbraun
  "#5b7f77", // gedecktes Salbeigrün
  "#a8763e", // Ocker
  "#264d43", // sehr dunkles Grün
  "#6b4226", // Schokobraun
  "#9a8a68", // Salbei (== --sage)
  "#d1a954", // Gold (== --primary)
];

/** Warmer Farbton-Bereich (Braun bis Waldgrün) für Farben jenseits der kuratierten Liste. */
const EXTRA_HUE_MIN_DEGREES = 20;
const EXTRA_HUE_RANGE_DEGREES = 150;
const GOLDEN_ANGLE_DEGREES = 137.508;

export function getSeriesColor(index: number): string {
  if (index < THEME_COLORS.length) {
    return THEME_COLORS[index];
  }

  const extraIndex = index - THEME_COLORS.length;
  const hue = EXTRA_HUE_MIN_DEGREES + ((extraIndex * GOLDEN_ANGLE_DEGREES) % EXTRA_HUE_RANGE_DEGREES);
  // Nach jedem vollen Durchlauf durch den Hue-Bereich Helligkeit/Sättigung
  // leicht variieren, damit auch sehr viele Serien nicht doch wieder
  // identisch aussehen.
  const lap = Math.floor((extraIndex * GOLDEN_ANGLE_DEGREES) / EXTRA_HUE_RANGE_DEGREES);
  const lightness = 38 + ((lap * 11) % 3) * 10;
  const saturation = 40 + ((lap * 7) % 3) * 8;

  return `hsl(${hue.toFixed(1)}deg ${saturation}% ${lightness}%)`;
}

