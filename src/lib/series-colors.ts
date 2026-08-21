/**
 * Erzeugt für eine beliebige Anzahl an Serien (Athlet:innen/Referenzen) in
 * Linien-/Radar-Charts eindeutige Farben. Vorher gab es eine feste Palette
 * mit 10 Farben (`index % 10`) – ab der 11. Person wiederholten sich Farben,
 * wodurch z. B. zwei unterschiedliche Personen exakt dieselbe Linienfarbe
 * bekamen und eine Linie fälschlich der falschen Person zugeordnet wirkte.
 *
 * Das App-Theme (siehe `styles.css`) ist warm/erdig: Gold (`--primary`),
 * Salbei-Oliv (`--sage`), dunkles Braun/Schwarz. Für die ersten paar Serien
 * werden deshalb kuratierte, zum Schema passende Töne verwendet
 * (`THEME_COLORS`). Die vorherige Version hatte hier 12 Farben, von denen
 * sich viele (mehrere Grün- und Brauntöne) untereinander kaum unterschieden
 * – ab der 6. Person waren Linien im Chart praktisch nicht mehr zu
 * unterscheiden. `THEME_COLORS` ist deshalb auf die tatsächlich gut
 * unterscheidbaren, zum Design passenden Töne reduziert.
 *
 * Wichtig ist dabei der FarbTON (Hue), nicht nur ein anderer Name: Waldgrün
 * (Hue ~162°) und das vorherige Petrol-Grün (Hue ~183°) lagen nur 21°
 * auseinander, Terrakotta (Hue ~28°) und Rotbraun (Hue ~12°) nur 16° – bei
 * ähnlicher Sättigung/Helligkeit macht das beide Paare in den Charts kaum
 * unterscheidbar. Petrol-Grün und Rotbraun wurden deshalb durch Pflaume/
 * Indigo (Hue ~252°) und Weinrot (Hue ~340°) ersetzt: alle fünf Farben liegen
 * jetzt (bis auf Gold/Terrakotta, siehe unten) mindestens 88° auseinander.
 * Gold (Hue ~41°) und Terrakotta (Hue ~28°) bleiben zwar hue-technisch nah
 * beieinander, sind aber durch deutlich unterschiedliche Sättigung/Helligkeit
 * (helles Gold vs. dunkles Rostorange) klar zu unterscheiden.
 *
 * Für weitere Serien reicht der warme Farbbereich allein nicht mehr für
 * genug Kontrast – deshalb wird ab hier bewusst der volle Farbkreis
 * genutzt (inkl. Blau-, Rot- und Violetttönen), beginnend bei Blau als
 * deutlichem Kontrast zu den vorangegangenen warmen Tönen. Der goldene
 * Winkel (~137,5°) verteilt die Farbtöne dabei so, dass auch benachbarte
 * Indizes optisch gut unterscheidbar bleiben, ohne dass eine feste
 * Obergrenze an Farben existiert.
 */
const THEME_COLORS = [
  "#d1a954", // Gold (== --primary)
  "#4d8c79", // Waldgrün
  "#b5651d", // Terrakotta
  "#514389", // Pflaume/Indigo
  "#88304d", // Weinrot
];

/** Start-Farbton für Serien jenseits von `THEME_COLORS`: Blau, als klarer Kontrast zu den vorangegangenen warmen Tönen. */
const EXTENDED_HUE_START_DEGREES = 205;
const GOLDEN_ANGLE_DEGREES = 137.508;

export function getSeriesColor(index: number): string {
  if (index < THEME_COLORS.length) {
    return THEME_COLORS[index];
  }

  const extraIndex = index - THEME_COLORS.length;
  const hue = (EXTENDED_HUE_START_DEGREES + extraIndex * GOLDEN_ANGLE_DEGREES) % 360;

  // Nach jedem vollen Durchlauf durch den Farbkreis (360°) Helligkeit/
  // Sättigung leicht variieren, damit auch sehr viele Serien nicht doch
  // wieder identisch aussehen. Werte bewusst kräftig genug (Sättigung
  // ≥50 %, Helligkeit ≥42 %) gewählt, um vor dem sehr dunklen Hintergrund
  // (`--background: #0b0a08`) noch gut lesbar zu bleiben.
  const lap = Math.floor((extraIndex * GOLDEN_ANGLE_DEGREES) / 360);
  const lightness = 50 + ((lap * 11) % 3) * 6;
  const saturation = 55 + ((lap * 7) % 3) * 12;

  return `hsl(${hue.toFixed(1)}deg ${saturation}% ${lightness}%)`;
}
