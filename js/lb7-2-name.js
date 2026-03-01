// ============================================================================
// NAMEN-POOL
// ============================================================================

const zufallsnamen = [
  { vorname: 'Anna',       nachname: 'Bauer',       geschlecht: 'w' },
  { vorname: 'Markus',     nachname: 'Huber',       geschlecht: 'm' },
  { vorname: 'Sandra',     nachname: 'Gruber',      geschlecht: 'w' },
  { vorname: 'Thomas',     nachname: 'Maier',       geschlecht: 'm' },
  { vorname: 'Lisa',       nachname: 'Schmid',      geschlecht: 'w' },
  { vorname: 'Eren',       nachname: 'Wagner',      geschlecht: 'm' },
  { vorname: 'Julia',      nachname: 'Fischer',     geschlecht: 'w' },
  { vorname: 'Stefan',     nachname: 'Berger',      geschlecht: 'm' },
  { vorname: 'Katharina',  nachname: 'Wolf',        geschlecht: 'w' },
  { vorname: 'Andreas',    nachname: 'Zimmermann',  geschlecht: 'm' },
  { vorname: 'Maria',      nachname: 'Braun',       geschlecht: 'w' },
  { vorname: 'Klaus',      nachname: 'Hartmann',    geschlecht: 'm' },
  { vorname: 'Petra',      nachname: 'Schreiber',   geschlecht: 'w' },
  { vorname: 'Murat',      nachname: 'Metin',       geschlecht: 'm' },
  { vorname: 'Fatima',     nachname: 'Mutas',       geschlecht: 'w' },
  { vorname: 'Florian',    nachname: 'Klein',       geschlecht: 'm' },
  { vorname: 'Monika',     nachname: 'Kraus',       geschlecht: 'w' },
  { vorname: 'Christian',  nachname: 'Celek',       geschlecht: 'm' },
  { vorname: 'Alara',      nachname: 'Köhler',      geschlecht: 'w' },
  { vorname: 'Tobias',     nachname: 'Jackson',     geschlecht: 'm' },
  { vorname: 'Claudia',    nachname: 'Weiß',        geschlecht: 'w' },
  { vorname: 'Martin',     nachname: 'Schulz',      geschlecht: 'm' },
  { vorname: 'Ayla',       nachname: 'Schwarz',     geschlecht: 'w' },
  { vorname: 'Jürgen',     nachname: 'Kramer',      geschlecht: 'm' },
  { vorname: 'Nicole',     nachname: 'Frank',       geschlecht: 'w' },
  { vorname: 'Werner',     nachname: 'Probst',      geschlecht: 'm' },
  { vorname: 'Andrea',     nachname: 'Lehmann',     geschlecht: 'w' },
  { vorname: 'Rainer',     nachname: 'Khan',        geschlecht: 'm' },
  { vorname: 'Susanne',    nachname: 'Keller',      geschlecht: 'w' },
  { vorname: 'Aghad',      nachname: 'Oslan',       geschlecht: 'm' },
  { vorname: 'Anna',       nachname: 'Simon',       geschlecht: 'w' },
  { vorname: 'Kerim',      nachname: 'Kaya',        geschlecht: 'm' },
  { vorname: 'Ursula',     nachname: 'Lang',        geschlecht: 'w' },
  { vorname: 'Omar',       nachname: 'Peters',      geschlecht: 'm' },
  { vorname: 'Ayla',       nachname: 'Cetin',       geschlecht: 'w' },
  { vorname: 'Kurt',       nachname: 'Stein',       geschlecht: 'm' },
  { vorname: 'Renate',     nachname: 'Melin',       geschlecht: 'w' },
  { vorname: 'Mehmet',     nachname: 'Sommer',      geschlecht: 'm' },
  { vorname: 'Inge',       nachname: 'Kovic',       geschlecht: 'w' },
  { vorname: 'Rolf',       nachname: 'Brand',       geschlecht: 'm' },
  { vorname: 'Helga',      nachname: 'Haas',        geschlecht: 'w' },
  { vorname: 'Norbert',    nachname: 'Brandt',      geschlecht: 'm' },
  { vorname: 'Elke',       nachname: 'Vogt',        geschlecht: 'w' },
  { vorname: 'Armin',      nachname: 'Sauer',       geschlecht: 'm' },
  { vorname: 'Bintu',      nachname: 'Meier',       geschlecht: 'w' },
  { vorname: 'Egon',       nachname: 'Schubert',    geschlecht: 'm' },
  { vorname: 'Maria',      nachname: 'Neumann',     geschlecht: 'w' },
  { vorname: 'Günter',     nachname: 'Kern',        geschlecht: 'm' },
  { vorname: 'Hildegard',  nachname: 'Roth',        geschlecht: 'w' },
  { vorname: 'Siegfried',  nachname: 'Böhm',        geschlecht: 'm' },
  { vorname: 'Irmgard',    nachname: 'Lenz',        geschlecht: 'w' },
  { vorname: 'Aghad',      nachname: 'Celik',       geschlecht: 'm' },
  { vorname: 'Mia',        nachname: 'Baumann',     geschlecht: 'w' },
  { vorname: 'Konrad',     nachname: 'Frei',        geschlecht: 'm' },
  { vorname: 'Elfriede',   nachname: 'Brauer',      geschlecht: 'w' },
  { vorname: 'Ali',        nachname: 'Yılmaz',      geschlecht: 'm' },
  { vorname: 'Meyram',     nachname: 'Riedl',       geschlecht: 'w' },
  { vorname: 'Marik',      nachname: 'Pavlovic',    geschlecht: 'm' },
  { vorname: 'Gertrud',    nachname: 'Huber',       geschlecht: 'w' },
  { vorname: 'Erwin',      nachname: 'Ziegler',     geschlecht: 'm' },
];

// Zufälligen Namen liefern (optional Nachname-Ausschluss)
function zufallsname(ausschluss = []) {
  const verfuegbar = zufallsnamen.filter(n => !ausschluss.includes(n.nachname));
  return verfuegbar[Math.floor(Math.random() * verfuegbar.length)];
}

// Passende Rechtsform bestimmen
function rechtsformFuer(person, urspruenglicheRechtsform) {
  const behalten = ['OHG', 'GbR', 'KG', 'GmbH', 'AG', 'mbB', 'GmbH & Co. KG'];
  if (behalten.includes(urspruenglicheRechtsform)) return urspruenglicheRechtsform;
  return person.geschlecht === 'w' ? 'e. Kfr.' : 'e. K.';
}

// ============================================================================
// UNIVERSELLE ERSETZUNGSFUNKTION (Platzhalter-System)
// ============================================================================
// Platzhalter:
//   {vorname}         → Vorname der zufälligen Person
//   {nachname}        → Nachname der zufälligen Person
//   {rechtsform}      → passende Rechtsform (e. K. / e. Kfr. / GmbH etc.)
//   {er_sie}          → Er / Sie
//   {er_sie_klein}    → er / sie
//   {sein_ihr}        → sein / ihr
//   {seinen_ihren}    → seinen / ihren
//   {seiner_ihrer}    → seiner / ihrer
//   {seine_ihre}      → seine / ihre
//
// Für Beständigkeits-Fälle mit festem Vorgänger-Namen im Firmennamen:
//   {neuer_vorname}   → Vorname des neuen Inhabers (= zufällige Person)
//   {neuer_nachname}  → Nachname des neuen Inhabers (= zufällige Person)
//   (der Vorgänger-Name steht fest im Text und wird NICHT ersetzt)

function ersetzeText(text, fall, person) {
  const neueRechtsform = rechtsformFuer(person, fall._originalRechtsform);
  const w = person.geschlecht === 'w';

  return text
    .replace(/\{vorname\}/g,       person.vorname)
    .replace(/\{nachname\}/g,      person.nachname)
    .replace(/\{neuer_vorname\}/g, person.vorname)
    .replace(/\{neuer_nachname\}/g,person.nachname)
    .replace(/\{rechtsform\}/g,    neueRechtsform)
    .replace(/\{Er_Sie\}/g,        w ? 'Sie'    : 'Er')
    .replace(/\{er_sie\}/g,        w ? 'sie'    : 'er')
    .replace(/\{Sein_Ihr\}/g,      w ? 'Ihr'    : 'Sein')
    .replace(/\{sein_ihr\}/g,      w ? 'ihr'    : 'sein')
    .replace(/\{Seinen_Ihren\}/g,  w ? 'Ihren'  : 'Seinen')
    .replace(/\{seinen_ihren\}/g,  w ? 'ihren'  : 'seinen')
    .replace(/\{Seiner_Ihrer\}/g,  w ? 'Ihrer'  : 'Seiner')
    .replace(/\{seiner_ihrer\}/g,  w ? 'ihrer'  : 'seiner')
    .replace(/\{Seine_Ihre\}/g,    w ? 'Ihre'   : 'Seine')
    .replace(/\{seine_ihre\}/g,    w ? 'ihre'   : 'seine');
}

// ============================================================================
// FALLBEISPIELE – Firmenname Grundsätze
// ============================================================================

const faelle = [

  // ── FIRMENWAHRHEIT ──────────────────────────────────────────────────────

  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Bäckerei Süddeutschland {rechtsform}',
    sachverhalt: '{vorname} {nachname} betreibt eine kleine Bäckerei mit zwei Angestellten in Augsburg. {Er_Sie} möchte {seinen_ihren} Betrieb unter dem Namen <em>„Bäckerei Süddeutschland {rechtsform}"</em> führen, weil ihr der Name regional bedeutsam klingt.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Zusatz „Süddeutschland" täuscht über die tatsächliche Größe und Reichweite des Betriebs. Eine kleine Bäckerei mit zwei Mitarbeitern darf nicht den Eindruck erwecken, ein überregional tätiges Unternehmen zu sein.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'GmbH',
    firmenname: 'Deutschlands Friseure GmbH',
    sachverhalt: '{vorname} {nachname} eröffnet einen Friseursalon in Landshut mit vier Stühlen. {Er_Sie} möchte {seinen_ihren} Salon <em>„Deutschlands Friseure GmbH"</em> nennen, weil {er_sie} glaubt, das klingt nach Qualität.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Name erweckt den Eindruck eines bundesweit tätigen Unternehmens oder gar eines Marktführers. Ein einzelner Salon in Landshut ist damit nicht vereinbar. Der Name täuscht über Größe und Bedeutung des Unternehmens.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Kfz-Werkstatt {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} betreibt seit Jahren eine Kfz-Werkstatt in Rosenheim. {Er_Sie} ist Alleininhaber und möchte den Namen <em>„Kfz-Werkstatt {nachname} {rechtsform}"</em> verwenden.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name beschreibt die Art des Betriebs (Kfz-Werkstatt), nennt den Inhaber ({nachname}) und führt die korrekte Rechtsform an. Keine irreführenden Angaben – die Firmenwahrheit ist gewahrt.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Internationale Steuerberatung {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} arbeitet als selbstständige Steuerberaterin in Straubing und hat ausschließlich lokale Kunden. {Er_Sie} möchte {seine_ihre} Kanzlei <em>„Internationale Steuerberatung {nachname} {rechtsform}"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Das Wort „Internationale" täuscht über die tatsächliche Tätigkeit. Da {vorname} {nachname} ausschließlich lokale Kunden betreut, erweckt der Name fälschlicherweise den Eindruck grenzüberschreitender Geschäftstätigkeit.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'OHG',
    firmenname: 'Supermarkt König der Märkte OHG',
    sachverhalt: '{vorname} {nachname} und {sein_ihr} Partner betreiben gemeinsam zwei Supermärkte in Dingolfing. Sie möchten ihre OHG <em>„Supermarkt König der Märkte OHG"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Zusatz „König der Märkte" ist eine anmaßende Selbstbezeichnung, die eine marktbeherrschende Stellung suggeriert, die tatsächlich nicht vorhanden ist. Zwei Supermärkte in einer Kleinstadt begründen keine derartige Marktposition.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'GbR',
    firmenname: 'Blumenladen Rosenzauber GbR',
    sachverhalt: '{vorname} {nachname} und eine Partnerin betreiben gemeinsam einen kleinen Blumenladen in Kelheim. Sie wollen ihren Betrieb <em>„Blumenladen Rosenzauber GbR"</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name beschreibt die Branche klar (Blumenladen), enthält einen fantasievollen, aber nicht irreführenden Zusatz (Rosenzauber) und nennt die korrekte Rechtsform (GbR). Es wird keine falsche Größe oder Bedeutung vorgespielt.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'GmbH',
    firmenname: 'Weltmarktführer Elektro {nachname} GmbH',
    sachverhalt: '{vorname} {nachname} betreibt drei Elektrofachgeschäfte in Mittelfranken und möchte {seine_ihre} GmbH <em>„Weltmarktführer Elektro {nachname} GmbH"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Die Bezeichnung „Weltmarktführer" ist eine grob irreführende Selbstbezeichnung. Drei regionale Fachgeschäfte können keine weltweite Marktführerschaft beanspruchen. Solche anmaßenden Superlative verstoßen klar gegen die Firmenwahrheit.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Zimmerei {nachname} & Söhne {rechtsform}',
    sachverhalt: '{vorname} {nachname} führt {seine_ihre} Zimmerei allein – {seine_ihre} beiden Söhne sind im Betrieb nicht tätig und auch keine Gesellschafter. {Er_Sie} möchte die Firma <em>„Zimmerei {nachname} & Söhne {rechtsform}"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Zusatz „& Söhne" täuscht darüber, dass Familienmitglieder am Unternehmen beteiligt sind. Da die Söhne weder tätig noch Gesellschafter sind, ist dieser Zusatz irreführend.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Notar {nachname} & Kollegen Rechtsanwaltskanzlei {rechtsform}',
    sachverhalt: '{vorname} {nachname} ist Rechtsanwalt (kein Notar) und betreibt {seine_ihre} Kanzlei mit zwei weiteren Anwälten in Augsburg. {Er_Sie} möchte sie <em>„Notar {nachname} & Kollegen Rechtsanwaltskanzlei {rechtsform}"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Die Bezeichnung „Notar" ist ein gesetzlich geschützter Titel. Der Name täuscht über die tatsächliche Qualifikation.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Gasthof Zur Alten Post {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} eröffnet einen neuen Gasthof in Grafing. Das Gebäude war früher nie eine Poststation. {Er_Sie} möchte den romantisch klingenden Namen <em>„Gasthof Zur Alten Post {nachname} {rechtsform}"</em> wählen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Name „Zur Alten Post" erweckt den Eindruck, das Gebäude sei historisch als Poststation genutzt worden – was nicht der Fall ist. Damit wird über die Geschichte des Hauses getäuscht.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Physiotherapie {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} ist ausgebildete Physiotherapeutin und eröffnet in Mühldorf {seine_ihre} eigene Praxis. {Er_Sie} möchte diese <em>„Physiotherapie {nachname} {rechtsform}"</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name gibt die Branche (Physiotherapie) und den Inhabernamen ({nachname}) korrekt wieder. Die Rechtsform ist für Einzelunternehmer/-innen zulässig. Keine Täuschung liegt vor.'
  },
  {
    grundsatz: 'wahrheit',
    _originalRechtsform: 'AG',
    firmenname: 'Premium Bio Hof {nachname} AG',
    sachverhalt: 'Familie {nachname} betreibt einen kleinen Bauernhof in Dachau mit drei Hektar Fläche. Ihr Hof ist nicht offiziell als Bio-Betrieb zertifiziert. Sie möchten ihn <em>„Premium Bio Hof {nachname} AG"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Zusatz „Bio" täuscht über die fehlende offizielle Zertifizierung. Da der Hof nicht als Bio-Betrieb anerkannt ist, ist die Bezeichnung irreführend. Außerdem ist die Rechtsform AG für einen kleinen Familienbetrieb dieser Größe unzutreffend.'
  },

  // ── FIRMENKLARHEIT ──────────────────────────────────────────────────────

  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Bäckerei {rechtsform}',
    sachverhalt: '{vorname} {nachname} möchte {seine_ihre} Bäckerei in Regensburg schlicht <em>„Bäckerei {rechtsform}"</em> nennen, ohne einen weiteren individuellen Zusatz.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Der Name enthält keinen individualisierenden Bestandteil, der das Unternehmen von anderen Bäckereien unterscheidbar macht. Jede Bäckerei könnte so heißen. Es fehlt die notwendige Unterscheidungskraft.'
  },
  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'GmbH',
    firmenname: 'Sanitär GmbH',
    sachverhalt: '{vorname} {nachname} und {sein_ihr} Partner möchten ihre neu gegründete Sanitärfirma in München einfach <em>„Sanitär GmbH"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Eine reine Branchenbezeichnung ohne weiteren individuellen Zusatz (z. B. Name oder Fantasiebezeichnung) hat keine Unterscheidungskraft. Der Name ist zu allgemein, um ein bestimmtes Unternehmen eindeutig zu kennzeichnen.'
  },
  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Metzgerei {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} führt {seine_ihre} Metzgerei in Landsberg am Lech und möchte sie <em>„Metzgerei {nachname} {rechtsform}"</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Familienname „{nachname}" verleiht dem Namen die notwendige Unterscheidungskraft. Die Branchenangabe „Metzgerei" ist sachlich korrekt, und die Rechtsform ist klar angegeben. Der Name ist eindeutig und unverwechselbar.'
  },
  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'AG',
    firmenname: 'IT-Service AG',
    sachverhalt: 'Vier Gründer wollen eine IT-Firma in Nürnberg als AG gründen und den Namen <em>„IT-Service AG"</em> eintragen lassen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Hier fehlt ein unterscheidungskräftiger Zusatz. Allgemeine Beschreibungen der Tätigkeit wie „IT-Service" haben keine ausreichende Kennzeichnungskraft ohne einen individualisierenden Bestandteil.'
  },
  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Café Sonnenschein {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} eröffnet ein Café in Garmisch-Partenkirchen und möchte es <em>„Café Sonnenschein {nachname} {rechtsform}"</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name enthält die Branchenbezeichnung (Café), einen fantasievollen Zusatz (Sonnenschein) und den Familiennamen ({nachname}). Damit ist ausreichend Unterscheidungskraft gegeben.'
  },
  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'GmbH',
    firmenname: 'Dienstleistungen GmbH',
    sachverhalt: 'Vier Gesellschafter gründen in Regensburg eine GmbH für verschiedene Haushaltsdienstleistungen und wollen sie schlicht <em>„Dienstleistungen GmbH"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Reine Gattungsbezeichnungen wie „Dienstleistungen" haben keinerlei Unterscheidungskraft. Ohne einen individualisierenden Zusatz ist der Name nicht geeignet, das Unternehmen eindeutig zu kennzeichnen.'
  },
  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'OHG',
    firmenname: 'Schreinerei Holzdesign {nachname} OHG',
    sachverhalt: '{vorname} {nachname} und {sein_ihr} Partner betreiben gemeinsam eine Schreinerei in Eichstätt. Sie möchten ihren Betrieb <em>„Schreinerei Holzdesign {nachname} OHG"</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name enthält die Branchenangabe (Schreinerei), einen beschreibenden Zusatz (Holzdesign) und den Familiennamen ({nachname}) als individualisierendes Merkmal. Die Unterscheidungskraft ist gegeben.'
  },
  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'GbR',
    firmenname: 'Transport GbR',
    sachverhalt: 'Drei Freunde gründen ein Transportunternehmen in Deggendorf und möchten es einfach <em>„Transport GbR"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Die bloße Branchenangabe „Transport" ohne jeden individualisierenden Zusatz besitzt keine Unterscheidungskraft. Der Name könnte für unzählige Transportunternehmen stehen und macht das konkrete Unternehmen nicht erkennbar.'
  },
  {
    grundsatz: 'klarheit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Friseurmeister/-in {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} ist Friseurmeister/-in und eröffnet in Weilheim einen Friseursalon. {Er_Sie} möchte ihn <em>„Friseurmeister/-in {nachname} {rechtsform}"</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name enthält die Berufsbezeichnung (Friseurmeister/-in) und den Familiennamen ({nachname}), der als individualisierendes Element für ausreichende Unterscheidungskraft sorgt.'
  },

  // ── FIRMENAUSSCHLIESSLICHKEIT ────────────────────────────────────────────

  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Schreinerei {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} will in Passau eine Schreinerei eröffnen. Im Handelsregister Passau ist bereits eine <em>„{nachname} Schreinerei {rechtsform}"</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Obwohl die Reihenfolge der Wörter leicht verändert ist, ist der Name täuschend ähnlich zum bereits eingetragenen Unternehmen am gleichen Ort. Verwechslungsgefahr besteht. Der Name muss sich deutlicher unterscheiden.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'GmbH',
    firmenname: 'Autohaus Zenith GmbH',
    sachverhalt: '{vorname} {nachname} will in Würzburg ein Autohaus gründen. In Würzburg gibt es bereits ein <em>„Autohaus am Zenith GmbH"</em>.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Die Bezeichnungen „Zenith" und „am Zenith" sind so ähnlich, dass Verwechslungsgefahr am gleichen Ort besteht. Die Firmenausschließlichkeit schützt bestehende Unternehmen vor täuschend ähnlichen Neueintragungen.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Apotheke am Marktplatz {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} will in Deggendorf eine Apotheke eröffnen. In Deggendorf ist keine andere Apotheke unter diesem oder einem ähnlichen Namen eingetragen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Da keine verwechslungsfähige Firma am gleichen Ort existiert, ist die Firmenausschließlichkeit gewahrt. Der Name ist klar, individuell und entspricht den Anforderungen.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Fahrradhaus Radsport {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} möchte in Bamberg ein Fahrradgeschäft eröffnen. Dort ist bereits ein <em>„Radsport {nachname} GmbH"</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Beide Firmen enthalten die Bestandteile „Radsport" und „{nachname}". Trotz unterschiedlicher Rechtsformen und leicht abweichender Reihenfolge besteht erhebliche Verwechslungsgefahr. Der Name muss stärker individualisiert werden.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Elektro {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} will in Freising einen Elektrobetrieb eröffnen. In Freising ist kein Unternehmen mit einem ähnlichen Namen tätig.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Da kein gleichnamiges oder täuschend ähnliches Unternehmen am gleichen Ort besteht, ist die Firmenausschließlichkeit erfüllt. Der Name hat ausreichend Unterscheidungskraft und ist wahrheitsgemäß.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'GmbH',
    firmenname: 'Reisebüro Sunshine Tours GmbH',
    sachverhalt: '{vorname} {nachname} möchte in Kempten ein Reisebüro als GmbH gründen. In Kempten ist bereits ein <em>„Sunshine Reisebüro GmbH"</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Beide Namen enthalten den charakteristischen Bestandteil „Sunshine" in Verbindung mit Reisebüro. Obwohl die genaue Formulierung abweicht, besteht erhebliche Verwechslungsgefahr. Der Grundsatz der Firmenausschließlichkeit ist verletzt.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'OHG',
    firmenname: 'Gärtnerei Blütenwelt {nachname} OHG',
    sachverhalt: '{vorname} {nachname} und {sein_ihr} Partner wollen in Erding eine Gärtnerei eröffnen. In Erding ist bereits eine <em>„Gärtnerei {nachname} e. K."</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Beide Namen tragen den Familiennamen „{nachname}" in Verbindung mit „Gärtnerei". Auch wenn ein Fantasiezusatz (Blütenwelt) ergänzt wurde, besteht Verwechslungsgefahr, da der prägende Namensbestandteil identisch ist.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'mbB',
    firmenname: 'Steuerberatung {nachname} & Partner mbB',
    sachverhalt: '{vorname} {nachname} möchte in Passau eine Steuerberatungskanzlei gründen. In Passau gibt es keine vergleichbare Firma unter diesem oder einem ähnlichen Namen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Da am gleichen Ort keine täuschend ähnliche Firma eingetragen ist, liegt kein Verstoß gegen die Firmenausschließlichkeit vor. Der Name ist individuell und verwechslungsfrei.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Bäckerei Mehlstube {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} will in Neumarkt eine Bäckerei eröffnen. In Neumarkt ist bereits eine <em>„Mehlstube Neumarkt GmbH"</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Das prägende Element „Mehlstube" taucht in beiden Namen auf. Da beide Unternehmen Bäckereien im gleichen Ort sind, ist die Verwechslungsgefahr erheblich. Der Grundsatz der Firmenausschließlichkeit ist verletzt.'
  },

  // ── FIRMENBESTÄNDIGKEIT ──────────────────────────────────────────────────

  // Heirat – Inhaberin bleibt dieselbe Person
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'e. K.',
    // fester Firmenname (Mädchenname bleibt im Namen)
    firmenname: 'Nagelstudio {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} heiratet und heißt nun anders. {Er_Sie} will {seine_ihre} Firma <em>„Nagelstudio {nachname} {rechtsform}"</em> weiterhin unter dem alten Namen führen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit erlaubt es, einen einmal eingetragenen Namen auch nach Änderungen beim Inhaber (z. B. Namensänderung durch Heirat) beizubehalten. Das Unternehmen hat sich unter diesem Namen einen Ruf erarbeitet, den es fortführen darf.'
  },
  // Kauf + Branchenwechsel → Firmenwahrheit verletzt
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'e. K.',
    // Firmenname bleibt stabil (Vorgänger-Name „Mayer" fest eingetragen)
    firmenname: 'Schreinerei Mayer e. K.',
    sachverhalt: '{neuer_vorname} {neuer_nachname} kauft die <em>„Schreinerei Mayer e. K."</em> und möchte den bekannten Namen weiterführen. Statt einer Schreinerei will {er_sie} unter demselben Namen einen Lebensmittelhandel eröffnen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit (trotz Beständigkeit)',
    begruendung: 'Die Firmenbeständigkeit erlaubt das Weiterführen des Namens nach einem Inhaberwechsel. Der Name „Schreinerei Mayer" beschreibt aber eindeutig einen holzverarbeitenden Betrieb. Wird darunter ein Lebensmittelhandel betrieben, täuscht der Name über den tatsächlichen Unternehmensgegenstand – das verstößt gegen die Firmenwahrheit.'
  },
  // Kauf – Name bleibt, Branche bleibt → zulässig
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Landgasthof Daxenberger e. K.',
    sachverhalt: '{neuer_vorname} {neuer_nachname} kauft den <em>„Landgasthof Daxenberger e. K."</em> von der Familie Daxenberger und möchte den altbekannten Namen weiterführen, da der Gasthof seit Jahrzehnten unter diesem Namen bekannt ist.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit erlaubt das Weiterführen des Namens auch nach einem Eigentümerwechsel, sofern der Erwerber einwilligt. Der gute Ruf des Namens bleibt erhalten – das ist der Zweck dieses Grundsatzes.'
  },
  // Kauf Kanzlei – neue Inhaberin, Name bleibt → zulässig
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'GbR',
    firmenname: 'Steuerberater Grünwald & Partner GbR',
    sachverhalt: '{neuer_vorname} {neuer_nachname} übernimmt die Kanzlei <em>„Steuerberater Grünwald & Partner GbR"</em> von Herrn Grünwald, der in Rente geht. {Er_Sie} möchte den Namen beibehalten, da die Kanzlei damit bestens bekannt ist.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Durch die Firmenbeständigkeit darf die neue Inhaberin den Namen fortführen, auch wenn Herr Grünwald nicht mehr im Unternehmen tätig ist. Der Firmenname verkörpert den Ruf der Kanzlei – diesen Wert darf {er_sie} nutzen.'
  },
  // Austritt Gesellschafter – OHG nicht mehr korrekt
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'OHG',
    firmenname: 'Bäckerei {nachname} OHG',
    sachverhalt: '{vorname} {nachname} tritt aus der OHG aus. {Sein_Ihr} früherer Gesellschafter führt den Betrieb allein weiter und möchte den Namen <em>„Bäckerei {nachname} OHG"</em> beibehalten.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Die Rechtsform OHG ist nicht mehr korrekt, wenn nur noch ein Inhaber vorhanden ist. Name und Rechtsform müssen angepasst werden.'
  },
  // Kauf Modehaus – neue Inhaberin, Name bleibt → zulässig
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Modehaus Vogt e. Kfr.',
    sachverhalt: 'Elke Vogt verkauft ihr Modehaus an {neuer_vorname} {neuer_nachname}. Der Name <em>„Modehaus Vogt e. Kfr."</em> soll weitergeführt werden, da das Geschäft in der Stadt sehr bekannt ist.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit erlaubt das Weiterführen des Namens nach einem Eigentümerwechsel. {neuer_vorname} {neuer_nachname} darf den Goodwill des bekannten Namens nutzen.'
  },
  // Heirat Optikerin
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Optiker {nachname} {rechtsform}',
    sachverhalt: '{vorname} {nachname} heiratet und nimmt den Namen {nachname}-Zankl an. {Er_Sie} führt {sein_ihr} Optikergeschäft <em>„Optiker {nachname} {rechtsform}"</em> unter dem Mädchennamen weiter, da alle Kunden diesen Namen kennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit schützt genau diesen Fall: Persönliche Veränderungen des Inhabers (Namensänderung durch Heirat) berechtigen nicht zum Zwang, den Namen zu ändern. Der Goodwill des Namens bleibt erhalten.'
  },
  // Übernahme Fahrschule – gleicher Nachname
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'e. K.',
    firmenname: 'Fahrschule {nachname} {rechtsform}',
    sachverhalt: '{neuer_vorname} {neuer_nachname} übernimmt die Fahrschule vom Vater, der in Rente geht. Da {er_sie} denselben Nachnamen trägt, möchte {er_sie} die Fahrschule weiterhin unter dem Namen <em>„Fahrschule {neuer_nachname} {rechtsform}"</em> führen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Nach dem Grundsatz der Firmenbeständigkeit darf der Firmenname auch nach einem Inhaberwechsel weitergeführt werden. Da {neuer_vorname} {neuer_nachname} die Fahrschule übernimmt und der Familienname ohnehin gleich bleibt, besteht keine Irreführung.'
  },
  // Austritt Gesellschafter Buchhandlung
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'OHG',
    firmenname: 'Buchhandlung Lesen & Mehr {nachname} OHG',
    sachverhalt: '{vorname} {nachname} scheidet aus der OHG aus. {Sein_Ihr} frühere Partnerin führt die Buchhandlung <em>„Buchhandlung Lesen & Mehr {nachname} OHG"</em> alleine weiter und möchte den bekannten Namen behalten.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Da {vorname} {nachname} aus dem Unternehmen ausgeschieden ist, ist {sein_ihr} Name im Firmennamen irreführend. Außerdem ist die Rechtsform OHG bei Alleinführung nicht mehr korrekt. Name und Rechtsform müssen aktualisiert werden.'
  },
  // Kauf Autowerkstatt – Rechtsform KG bleibt
  {
    grundsatz: 'bestaendigkeit',
    _originalRechtsform: 'KG',
    firmenname: 'Autowerkstatt Seidl & Co. KG',
    sachverhalt: 'Familie Seidl verkauft ihre Autowerkstatt an {neuer_vorname} {neuer_nachname}. {Er_Sie} möchte den Namen <em>„Autowerkstatt Seidl & Co. KG"</em> weiterführen, da die Werkstatt in der Region sehr bekannt ist.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit erlaubt das Weiterführen des Namens nach einem Eigentümerwechsel. {neuer_vorname} {neuer_nachname} darf den Goodwill des bekannten Namens nutzen. Voraussetzung ist die Einwilligung des bisherigen Inhabers.'
  },
];

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Rechtsassistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst beim Verständnis der rechtlichen Grundsätze des Namens.

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib KEINE fertigen Lösungen (Verstoß / kein Verstoß) vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Einschätzung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach den Eigenschaften des Namens (Was steht da? Stimmt das? Gibt es das schon?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler den richtigen Grundsatz und das richtige Urteil erarbeitet hat, bestätige es.

Methodik bei Rückfragen:
- Schau dir den Namen genau an – was steht da drin?
- Stimmt das, was der Name aussagt, mit der Realität überein?
- Könnte man diesen Namen mit einem anderen Unternehmen verwechseln?
- Hat der Name etwas, das ihn von anderen Firmen unterscheidet?
- Was hat sich beim Unternehmen verändert – und darf der alte Name trotzdem bleiben?

Die vier Grundsätze des Namens:

1. Firmenwahrheit
   - Der Firmenname darf nicht täuschen (über Größe, Art, Inhaber, Qualifikation)
   - Keine irreführenden Zusätze wie „International", „Weltmarktführer", falsche Titel
   - Beispiel-Verstoß: Eine kleine Bäckerei nennt sich „Bäckerei Süddeutschland e. K."

2. Firmenklarheit
   - Der Name muss das Unternehmen eindeutig erkennbar machen (Unterscheidungskraft)
   - Reine Branchenbezeichnungen ohne Zusatz reichen nicht
   - Beispiel-Verstoß: „Sanitär GmbH" ohne jeden weiteren Zusatz

3. Firmenausschließlichkeit
   - Am gleichen Ort darf kein anderes Unternehmen denselben oder einen täuschend ähnlichen Namen führen
   - Verwechslungsgefahr ist entscheidend, nicht nur wörtliche Gleichheit
   - Beispiel-Verstoß: „Radsport Müller GmbH" existiert bereits → „Fahrradhaus Radsport Müller e. K." nicht möglich

4. Firmenbeständigkeit
   - Ein eingetragener Name darf trotz Änderungen beim Inhaber weitergeführt werden
   - Gilt bei: Heirat, Kauf/Verkauf des Unternehmens, Ausscheiden eines Gesellschafters (mit Einschränkungen)
   - Grenze: Wenn dabei andere Grundsätze verletzt werden (z. B. Firmenwahrheit)

Typische Fehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- Firmenbeständigkeit ≠ „alles darf immer bleiben" – andere Grundsätze bleiben gültig
- Firmenklarheit ≠ „der Name ist unklar formuliert" – es geht um Unterscheidungskraft
- Firmenwahrheit ≠ „der Name klingt komisch" – es geht um sachliche Irreführung

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung ⚖️🔍📌🚫✅❓

Was du NICHT tust:
- Nenne den betroffenen Grundsatz nicht, bevor der Schüler ihn selbst erarbeitet hat
- Gib keine fertigen Urteile auf Anfragen wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist
`;

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function grundsatzLabel(key) {
  const map = {
    wahrheit:         'Firmenwahrheit',
    klarheit:         'Firmenklarheit',
    ausschliesslichkeit: 'Firmenausschließlichkeit',
    bestaendigkeit:   'Firmenbeständigkeit',
  };
  return map[key] || key;
}

// ============================================================================
// UNIVERSELLE ERSETZUNGSFUNKTION
// ============================================================================

function ersetzeText(text, fall, person) {
  const neueRechtsform = rechtsformFuer(person, fall._originalRechtsform);
  const w = person.geschlecht === 'w';

  return text
    .replace(/\{vorname\}/g,         person.vorname)
    .replace(/\{nachname\}/g,        person.nachname)
    .replace(/\{neuer_vorname\}/g,   person.vorname)
    .replace(/\{neuer_nachname\}/g,  person.nachname)
    .replace(/\{rechtsform\}/g,      neueRechtsform)
    .replace(/\{Er_Sie\}/g,          w ? 'Sie'    : 'Er')
    .replace(/\{er_sie\}/g,          w ? 'sie'    : 'er')
    .replace(/\{Sein_Ihr\}/g,        w ? 'Ihr'    : 'Sein')
    .replace(/\{sein_ihr\}/g,        w ? 'ihr'    : 'sein')
    .replace(/\{Seinen_Ihren\}/g,    w ? 'Ihren'  : 'Seinen')
    .replace(/\{seinen_ihren\}/g,    w ? 'ihren'  : 'seinen')
    .replace(/\{Seiner_Ihrer\}/g,    w ? 'Ihrer'  : 'Seiner')
    .replace(/\{seiner_ihrer\}/g,    w ? 'ihrer'  : 'seiner')
    .replace(/\{Seine_Ihre\}/g,      w ? 'Ihre'   : 'Seine')
    .replace(/\{seine_ihre\}/g,      w ? 'ihre'   : 'seine');
}

// ============================================================================
// HAUPTFUNKTION – AUFGABEN GENERIEREN
// ============================================================================

function generiereAufgaben() {
  const anzahl    = parseInt(document.getElementById('anzahl').value) || 4;
  const filter    = document.getElementById('filter').value;
  const container = document.getElementById('Container');

  if (!container) return;

  let pool = filter === 'alle' ? faelle : faelle.filter(f => f.grundsatz === filter);
  let gefuellt = [...pool];
  while (gefuellt.length < anzahl) gefuellt = [...gefuellt, ...pool];
  const ausgewaehlt = shuffle(gefuellt).slice(0, anzahl);

  const verwendeteNachname = [];

  let aufgabenHTML  = '<h2>Aufgaben</h2><p><strong>Arbeitsauftrag:</strong> Entscheide jeweils, ob der Firmenname den rechtlichen Vorgaben entspricht. Nenne den betroffenen Grundsatz und begründe deine Entscheidung.</p><ol>';
  let loesungenHTML = '<h2>Lösungen</h2>';

  ausgewaehlt.forEach((fall, idx) => {
    const person = zufallsname(verwendeteNachname);
    verwendeteNachname.push(person.nachname);

    const firmenname  = ersetzeText(fall.firmenname,  fall, person);
    const sachverhalt = ersetzeText(fall.sachverhalt, fall, person);
    const begruendung = ersetzeText(fall.begruendung, fall, person);

    const infoBox = `<div>
      <strong>Firma:</strong> <em>${firmenname}</em><br>
      ${sachverhalt}
    </div>`;

    aufgabenHTML += `<li style="margin-bottom: 1.4em;">${infoBox}</li>`;

    const typFarbe = fall.korrekt ? '#2a7a2a' : '#a00';
    const typLabel = fall.korrekt
      ? '✅ Entspricht den rechtlichen Vorgaben'
      : '⚠️ Verstoß gegen: ' + grundsatzLabel(fall.grundsatz);

    loesungenHTML += `
      <div style="margin-top: 1.5em;">
        <strong>${idx + 1}. ${firmenname}</strong><br>
        <div style="border: 1px solid #ccc; background-color:#fff; font-family:courier; padding: 6px 10px; margin: 6px 0;">
          <span style="color:${typFarbe}; font-weight:bold;">${typLabel}</span><br>
          <span style="font-size:0.95em;">${begruendung}</span>
        </div>
      </div>`;
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// KI-ASSISTENT FUNKTIONEN
// ============================================================================

function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
  }).catch(err => {
    console.error('Fehler beim Kopieren:', err);
    alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.');
  });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
  setTimeout(() => {
    generiereAufgaben();
  }, 300);
});