// ============================================================================
// KONTENPLAN-WIDGET-DATENQUELLE (kontoAuswahlYAML)
// --------------------------------------------------------------------------
// WICHTIG: Der Kontenplan selbst wird nicht mehr hier gepflegt, sondern
// zentral in js/utils.js (Konstante KONTENPLAN, mit Langnamen).
//
// Diese Datei leitet daraus den YAML-String ab, den buchungssatz.js,
// t-konto.js und vorkontierung.js per jsyaml.load() einlesen.
//
// Aufbau (kompatibel zur früheren handgepflegten Version):
//   konten:
//     - value_number: "0500"
//       value_account: "GR"
//       label: "0500 GR"
//
// Die Ableitung erfolgt LAZY (beim ersten Zugriff), damit es keine Rolle
// spielt, ob kontenplan.js vor oder nach utils.js geladen wird, und damit
// Seiten, die die Daten gar nicht nutzen, keinen Fehler erzeugen.
// ============================================================================

let _kontoAuswahlYAMLCache = null;

function baueKontoAuswahlYAML() {
  if (_kontoAuswahlYAMLCache !== null) return _kontoAuswahlYAMLCache;

  const konten = (typeof KONTENPLAN !== 'undefined' && KONTENPLAN) || [];
  if (konten.length === 0 && typeof console !== 'undefined') {
    console.warn('kontoAuswahlYAML: KONTENPLAN (js/utils.js) nicht gefunden – Kontenplan-Widget leer (kontenplan.js nach utils.js laden).');
  }

  const eintraege = konten.map(k =>
    '  - value_number: "' + k.nr + '"\n' +
    '    value_account: "' + k.abk + '"\n' +
    '    label: "' + k.nr + ' ' + k.abk + '"'
  ).join('\n');

  _kontoAuswahlYAMLCache = 'konten:\n' + eintraege + '\n';
  return _kontoAuswahlYAMLCache;
}

// Unter dem bisherigen Namen global lesbar machen (Getter statt const),
// damit Abfragen wie const parsedData = jsyaml.load(kontoAuswahlYAML);
// unverändert funktionieren.
Object.defineProperty(window, 'kontoAuswahlYAML', { get: baueKontoAuswahlYAML });
