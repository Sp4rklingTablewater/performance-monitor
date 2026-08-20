/**
 * Berechnet eine sinnvoll gepolsterte Achsen-Domain für Recharts-Achsen
 * (Scatter-, Line- und Entwicklungs-Charts). Bei einer Wertespanne > 0 wird
 * relativ zur Spanne gepolstert; bei nur einem eindeutigen Wert (Spanne 0)
 * wird relativ zum Betrag des Werts gepolstert, mit Mindestpolsterung von 1,
 * damit die Achse nicht kollabiert. Die untere Grenze wird nie unter 0
 * gezogen (alle Messgrößen dieser App sind nicht-negativ).
 */
export function computeChartDomain(values: number[], paddingFactor = 0.2): [number, number] {
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;

  const range = maxValue - minValue;
  const padding = range > 0 ? range * paddingFactor : Math.max(Math.abs(minValue) * 0.1, 1);

  return [Math.max(0, minValue - padding), maxValue + padding];
}
