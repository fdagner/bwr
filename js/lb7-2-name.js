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
  { vorname: 'Murat',      nachname: 'Metin',     geschlecht: 'm' },
  { vorname: 'Fatima',     nachname: 'Mutas',      geschlecht: 'w' },
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
  { vorname: 'Aghad',      nachname: 'Oslan',      geschlecht: 'm' },
  { vorname: 'Anna',       nachname: 'Simon',       geschlecht: 'w' },
  { vorname: 'Kerim',       nachname: 'Kaya',        geschlecht: 'm' },
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
  { vorname: 'Aghad',     nachname: 'Celik',       geschlecht: 'm' },
  { vorname: 'Mia',       nachname: 'Baumann',     geschlecht: 'w' },
  { vorname: 'Konrad',     nachname: 'Frei',        geschlecht: 'm' },
  { vorname: 'Elfriede',   nachname: 'Brauer',      geschlecht: 'w' },
  { vorname: 'Ali',        nachname: 'Yılmaz',      geschlecht: 'm' },
  { vorname: 'Meyram',     nachname: 'Riedl',       geschlecht: 'w' },
  { vorname: 'Marik',        nachname: 'Pavlovic',    geschlecht: 'm' },
  { vorname: 'Gertrud',    nachname: 'Huber',       geschlecht: 'w' },
  { vorname: 'Erwin',      nachname: 'Ziegler',     geschlecht: 'm' },
];

// Zufälligen Namen liefern (optional Nachname-Ausschluss)
function zufallsname(ausschluss = []) {
  const verfuegbar = zufallsnamen.filter(n => !ausschluss.includes(n.nachname));
  return verfuegbar[Math.floor(Math.random() * verfuegbar.length)];
}

// Passende Rechtsform bestimmen
// Personengesellschaften (OHG, GbR, KG) und Kapitalgesellschaften bleiben erhalten.
// e. K. / e. Kfr. wird je nach Geschlecht des (neuen) Inhabers bestimmt.
function rechtsformFuer(person, urspruenglicheRechtsform) {
  const behalten = ['OHG', 'GbR', 'KG', 'GmbH', 'AG', 'mbB', 'GmbH & Co. KG'];
  if (behalten.includes(urspruenglicheRechtsform)) return urspruenglicheRechtsform;
  return person.geschlecht === 'w' ? 'e. Kfr.' : 'e. K.';
}

// Sachverhalt anpassen (Name + Pronomen + Rechtsform ersetzen)
function ersetzeSachverhalt(fall, person) {
  const originalRechtsform = fall._originalRechtsform;
  const neueRechtsform     = rechtsformFuer(person, originalRechtsform);

  let text = fall.sachverhalt;

  // Bei Beständigkeits-Fällen mit neuem Inhaber: nur den neuen Inhabernamen ersetzen,
  // den Vorgänger-Namen im Firmennamen (in <em>…</em>) NICHT anfassen.
  // Wir ersetzen nur den Vorname/Nachname des _neuen_ Inhabers (außerhalb der em-Tags).
  if (fall._bestaendigkeit_neuerInhaber) {
    // Vorname/Nachname des neuen Inhabers ersetzen (steht außerhalb des Firmennamens)
    text = text.replace(new RegExp(fall._neuerInhaberVorname, 'g'), person.vorname);
    text = text.replace(new RegExp(fall._neuerInhaberNachname, 'g'), person.nachname);
    // Pronomen für neuen Inhaber anpassen
    if (fall._neuerInhaberGeschlecht !== person.geschlecht) {
      const L = '[a-zA-ZäöüÄÖÜß]';
      const pw = (w) => new RegExp(`(?<!${L})${w}(?!${L})`, 'g');
      if (person.geschlecht === 'w') {
        text = text.replace(pw('Er'), 'Sie').replace(pw('er'), 'sie');
        text = text.replace(pw('Seinen'), 'Ihren').replace(pw('seinen'), 'ihren');
        text = text.replace(pw('Seiner'), 'Ihrer').replace(pw('seiner'), 'ihrer');
        text = text.replace(pw('Seine'), 'Ihre').replace(pw('seine'), 'ihre');
        text = text.replace(pw('Sein'), 'Ihr').replace(pw('sein'), 'ihr');
      } else {
        text = text.replace(pw('Sie'), 'Er').replace(pw('sie'), 'er');
        text = text.replace(pw('Ihren'), 'Seinen').replace(pw('ihren'), 'seinen');
        text = text.replace(pw('Ihre'), 'Seine').replace(pw('ihre'), 'seine');
        text = text.replace(pw('Ihr'), 'Sein').replace(pw('ihr'), 'sein');
      }
    }
    // Rechtsform im Firmennamen (in em-Tags) anpassen
    if (originalRechtsform && neueRechtsform !== originalRechtsform) {
      text = text.replace(
        new RegExp(originalRechtsform.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        neueRechtsform
      );
    }
    return text;
  }

  // Normaler Fall: Vorname + Nachname + Pronomen + Rechtsform ersetzen
  if (fall._originalVorname)
    text = text.replace(new RegExp(fall._originalVorname, 'g'), person.vorname);
  if (fall._originalNachname)
    text = text.replace(new RegExp(fall._originalNachname, 'g'), person.nachname);

  if (fall._originalGeschlecht !== person.geschlecht) {
    const L = '[a-zA-ZäöüÄÖÜß]';
    const pw = (w) => new RegExp(`(?<!${L})${w}(?!${L})`, 'g');
    if (person.geschlecht === 'w') {
      text = text.replace(pw('Er'), 'Sie').replace(pw('er'), 'sie');
      text = text.replace(pw('Seinen'), 'Ihren').replace(pw('seinen'), 'ihren');
      text = text.replace(pw('Seiner'), 'Ihrer').replace(pw('seiner'), 'ihrer');
      text = text.replace(pw('Seine'), 'Ihre').replace(pw('seine'), 'ihre');
      text = text.replace(pw('Sein'), 'Ihr').replace(pw('sein'), 'ihr');
    } else {
      text = text.replace(pw('Sie'), 'Er').replace(pw('sie'), 'er');
      text = text.replace(pw('Ihren'), 'Seinen').replace(pw('ihren'), 'seinen');
      text = text.replace(pw('Ihre'), 'Seine').replace(pw('ihre'), 'seine');
      text = text.replace(pw('Ihr'), 'Sein').replace(pw('ihr'), 'sein');
    }
  }

  if (originalRechtsform && neueRechtsform !== originalRechtsform) {
    text = text.replace(
      new RegExp(originalRechtsform.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      neueRechtsform
    );
  }

  return text;
}

// Firmennamen anpassen
function ersetzeFirmenname(fall, person) {
  const originalRechtsform = fall._originalRechtsform;
  const neueRechtsform     = rechtsformFuer(person, originalRechtsform);

  let name = fall.firmenname;

  // Bei Beständigkeits-Fällen mit neuem Inhaber: Vorgänger-Nachname bleibt im Namen,
  // nur die Rechtsform wird nach dem neuen (zufälligen) Inhaber angepasst.
  if (!fall._bestaendigkeit_neuerInhaber) {
    if (fall._originalNachname)
      name = name.replace(new RegExp(fall._originalNachname, 'g'), person.nachname);
    if (fall._originalVorname)
      name = name.replace(new RegExp(fall._originalVorname, 'g'), person.vorname);
  }

  if (originalRechtsform)
    name = name.replace(
      new RegExp(originalRechtsform.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      neueRechtsform
    );
  return name;
}

// ============================================================================
// FALLBEISPIELE – Firmenname Grundsätze
// ============================================================================

const faelle = [

  // ── FIRMENWAHRHEIT ──────────────────────────────────────────────────────

  {
    grundsatz: 'wahrheit',
    firmenname: 'Bäckerei Süddeutschland e. K.',
    _originalVorname: 'Anna', _originalNachname: 'Heiß',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'w',
    sachverhalt: 'Anna Heiß betreibt eine kleine Bäckerei mit zwei Angestellten in Augsburg. Sie möchte ihren Betrieb unter dem Namen <em>„Bäckerei Süddeutschland e. Kfr."</em> führen, weil ihr der Name regional bedeutsam klingt.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Zusatz „Süddeutschland" täuscht über die tatsächliche Größe und Reichweite des Betriebs. Eine kleine Bäckerei mit zwei Mitarbeitern darf nicht den Eindruck erwecken, ein überregional tätiges Unternehmen zu sein.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Deutschlands Friseure GmbH',
    _originalVorname: 'Tobias', _originalNachname: 'Kurz',
    _originalRechtsform: 'GmbH', _originalGeschlecht: 'm',
    sachverhalt: 'Tobias Kurz eröffnet einen Friseursalon in Landshut mit vier Stühlen. Er möchte seinen Salon <em>„Deutschlands Friseure GmbH"</em> nennen, weil er glaubt, das klingt nach Qualität.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Name erweckt den Eindruck eines bundesweit tätigen Unternehmens oder gar eines Marktführers. Ein einzelner Salon in Landshut ist damit nicht vereinbar. Der Name täuscht über Größe und Bedeutung des Unternehmens.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Kfz-Werkstatt Schweiger e. K.',
    _originalVorname: 'Markus', _originalNachname: 'Schweiger',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Markus Schweiger betreibt seit Jahren eine Kfz-Werkstatt in Rosenheim. Er ist Alleininhaber und möchte den Namen <em>„Kfz-Werkstatt Schweiger e. K."</em> verwenden.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name beschreibt die Art des Betriebs (Kfz-Werkstatt), nennt den Inhaber (Schweiger) und führt die korrekte Rechtsform an. Keine irreführenden Angaben – die Firmenwahrheit ist gewahrt.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Internationale Steuerberatung Lechner e. Kfr.',
    _originalVorname: 'Beate', _originalNachname: 'Lechner',
    _originalRechtsform: 'e. Kfr.', _originalGeschlecht: 'w',
    sachverhalt: 'Beate Lechner arbeitet als selbstständige Steuerberaterin in Straubing und hat ausschließlich lokale Kunden. Sie möchte ihre Kanzlei <em>„Internationale Steuerberatung Lechner e. Kfr."</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Das Wort „Internationale" täuscht über die tatsächliche Tätigkeit. Da Beate Lechner ausschließlich lokale Kunden betreut, erweckt der Name fälschlicherweise den Eindruck grenzüberschreitender Geschäftstätigkeit.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Supermarkt König der Märkte OHG',
    _originalVorname: 'Georg', _originalNachname: 'Huber',
    _originalRechtsform: 'OHG', _originalGeschlecht: 'm',
    sachverhalt: 'Georg Huber und seine Frau Petra betreiben gemeinsam zwei Supermärkte in Dingolfing. Sie möchten ihre OHG <em>„Supermarkt König der Märkte OHG"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Zusatz „König der Märkte" ist eine anmaßende Selbstbezeichnung, die eine marktbeherrschende Stellung suggeriert, die tatsächlich nicht vorhanden ist. Zwei Supermärkte in einer Kleinstadt begründen keine derartige Marktposition.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Blumenladen Rosenzauber GbR',
    _originalVorname: 'Sandra', _originalNachname: 'Neubauer',
    _originalRechtsform: 'GbR', _originalGeschlecht: 'w',
    sachverhalt: 'Sandra Neubauer und Klaudia Weiß betreiben gemeinsam einen kleinen Blumenladen in Kelheim. Sie wollen ihren Betrieb <em>„Blumenladen Rosenzauber GbR"</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name beschreibt die Branche klar (Blumenladen), enthält einen fantasievollen, aber nicht irreführenden Zusatz (Rosenzauber) und nennt die korrekte Rechtsform (GbR). Es wird keine falsche Größe oder Bedeutung vorgespielt.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Weltmarktführer Elektro Baur GmbH',
    _originalVorname: 'Heinrich', _originalNachname: 'Baur',
    _originalRechtsform: 'GmbH', _originalGeschlecht: 'm',
    sachverhalt: 'Heinrich Baur betreibt drei Elektrofachgeschäfte in Mittelfranken und möchte seine GmbH <em>„Weltmarktführer Elektro Baur GmbH"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Die Bezeichnung „Weltmarktführer" ist eine grob irreführende Selbstbezeichnung. Drei regionale Fachgeschäfte können keine weltweite Marktführerschaft beanspruchen. Solche anmaßenden Superlative verstoßen klar gegen die Firmenwahrheit.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Zimmerei Hopfner & Söhne e. K.',
    _originalVorname: 'Alois', _originalNachname: 'Hopfner',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Alois Hopfner führt seine Zimmerei allein – seine beiden Söhne sind im Betrieb nicht tätig und auch keine Gesellschafter. Er möchte die Firma <em>„Zimmerei Hopfner & Söhne e. K."</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Zusatz „& Söhne" täuscht darüber, dass Familienmitglieder am Unternehmen beteiligt sind. Da die Söhne weder tätig noch Gesellschafter sind, ist dieser Zusatz irreführend.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Notar Reinhardt & Kollegen Rechtsanwaltskanzlei e. K.',
    _originalVorname: 'Paul', _originalNachname: 'Reinhardt',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Paul Reinhardt ist Rechtsanwalt (kein Notar) und betreibt seine Kanzlei mit zwei weiteren Anwälten in Augsburg. Er möchte sie <em>„Notar Reinhardt & Kollegen Rechtsanwaltskanzlei e. K."</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Die Bezeichnung „Notar" ist ein gesetzlich geschützter Titel. Da Paul Reinhardt kein Notar ist, täuscht der Name über seine tatsächliche Qualifikation.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Gasthof Zur Alten Post Berger e. K.',
    _originalVorname: 'Klaus', _originalNachname: 'Berger',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Klaus Berger eröffnet einen neuen Gasthof in Grafing. Das Gebäude war früher nie eine Poststation. Er möchte den romantisch klingenden Namen <em>„Gasthof Zur Alten Post Berger e. K."</em> wählen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Name „Zur Alten Post" erweckt den Eindruck, das Gebäude sei historisch als Poststation genutzt worden – was nicht der Fall ist. Damit wird über die Geschichte des Hauses getäuscht.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Physiotherapie Maier e. Kfr.',
    _originalVorname: 'Sandra', _originalNachname: 'Maier',
    _originalRechtsform: 'e. Kfr.', _originalGeschlecht: 'w',
    sachverhalt: 'Sandra Maier ist ausgebildete Physiotherapeutin und eröffnet in Mühldorf ihre eigene Praxis. Sie möchte diese <em>„Physiotherapie Maier e. Kfr."</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name gibt die Branche (Physiotherapie) und den Inhabernamen (Maier) korrekt wieder. Die Rechtsform e. Kfr. ist für Einzelunternehmerinnen zulässig. Keine Täuschung liegt vor.'
  },
  {
    grundsatz: 'wahrheit',
    firmenname: 'Premium Bio Hof Gruber AG',
    _originalVorname: 'Josef', _originalNachname: 'Gruber',
    _originalRechtsform: 'AG', _originalGeschlecht: 'm',
    sachverhalt: 'Familie Gruber betreibt einen kleinen Bauernhof in Dachau mit drei Hektar Fläche. Ihr Hof ist nicht offiziell als Bio-Betrieb zertifiziert. Sie möchten ihn <em>„Premium Bio Hof Gruber AG"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Der Zusatz „Bio" täuscht über die fehlende offizielle Zertifizierung. Da der Hof nicht als Bio-Betrieb anerkannt ist, ist die Bezeichnung irreführend. Außerdem ist die Rechtsform AG für einen kleinen Familienbetrieb dieser Größe unzutreffend.'
  },

  // ── FIRMENKLARHEIT ──────────────────────────────────────────────────────

  {
    grundsatz: 'klarheit',
    firmenname: 'Bäckerei e. K.',
    _originalVorname: 'Franz', _originalNachname: 'Mühlbauer',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Franz Mühlbauer möchte seine Bäckerei in Regensburg schlicht <em>„Bäckerei e. K."</em> nennen, ohne einen weiteren individuellen Zusatz.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Der Name enthält keinen individualisierenden Bestandteil, der das Unternehmen von anderen Bäckereien unterscheidbar macht. Jede Bäckerei könnte so heißen. Es fehlt die notwendige Unterscheidungskraft.'
  },
  {
    grundsatz: 'klarheit',
    firmenname: 'Sanitär GmbH',
    _originalVorname: 'Werner', _originalNachname: 'Pröll',
    _originalRechtsform: 'GmbH', _originalGeschlecht: 'm',
    sachverhalt: 'Werner Pröll und sein Partner möchten ihre neu gegründete Sanitärfirma in München einfach <em>„Sanitär GmbH"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Eine reine Branchenbezeichnung ohne weiteren individuellen Zusatz (z. B. Name oder Fantasiebezeichnung) hat keine Unterscheidungskraft. Der Name ist zu allgemein, um ein bestimmtes Unternehmen eindeutig zu kennzeichnen.'
  },
  {
    grundsatz: 'klarheit',
    firmenname: 'Metzgerei Breitenmoser e. K.',
    _originalVorname: 'Benedikt', _originalNachname: 'Breitenmoser',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Benedikt Breitenmoser führt seine Metzgerei in Landsberg am Lech und möchte sie <em>„Metzgerei Breitenmoser e. K."</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Familienname „Breitenmoser" verleiht dem Namen die notwendige Unterscheidungskraft. Die Branchenangabe „Metzgerei" ist sachlich korrekt, und die Rechtsform ist klar angegeben. Der Name ist eindeutig und unverwechselbar.'
  },
  {
    grundsatz: 'klarheit',
    firmenname: 'IT-Service AG',
    _originalVorname: 'Karl', _originalNachname: 'Seidlmeier',
    _originalRechtsform: 'AG', _originalGeschlecht: 'm',
    sachverhalt: 'Vier Gründer wollen eine IT-Firma in Nürnberg als AG gründen und den Namen <em>„IT-Service AG"</em> eintragen lassen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Hier fehlt ein unterscheidungskräftiger Zusatz. Allgemeine Beschreibungen der Tätigkeit wie „IT-Service" haben keine ausreichende Kennzeichnungskraft ohne einen individualisierenden Bestandteil.'
  },
  {
    grundsatz: 'klarheit',
    firmenname: 'Café Sonnenschein Bergmann e. Kfr.',
    _originalVorname: 'Luisa', _originalNachname: 'Bergmann',
    _originalRechtsform: 'e. Kfr.', _originalGeschlecht: 'w',
    sachverhalt: 'Luisa Bergmann eröffnet ein Café in Garmisch-Partenkirchen und möchte es <em>„Café Sonnenschein Bergmann e. Kfr."</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name enthält die Branchenbezeichnung (Café), einen fantasievollen Zusatz (Sonnenschein) und den Familiennamen (Bergmann). Damit ist ausreichend Unterscheidungskraft gegeben.'
  },
  {
    grundsatz: 'klarheit',
    firmenname: 'Dienstleistungen GmbH',
    _originalVorname: 'Ernst', _originalNachname: 'Pöhlmann',
    _originalRechtsform: 'GmbH', _originalGeschlecht: 'm',
    sachverhalt: 'Vier Gesellschafter gründen in Regensburg eine GmbH für verschiedene Haushaltsdienstleistungen und wollen sie schlicht <em>„Dienstleistungen GmbH"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Reine Gattungsbezeichnungen wie „Dienstleistungen" haben keinerlei Unterscheidungskraft. Ohne einen individualisierenden Zusatz ist der Name nicht geeignet, das Unternehmen eindeutig zu kennzeichnen.'
  },
  {
    grundsatz: 'klarheit',
    firmenname: 'Schreinerei Holzdesign Kastner OHG',
    _originalVorname: 'Rudi', _originalNachname: 'Kastner',
    _originalRechtsform: 'OHG', _originalGeschlecht: 'm',
    sachverhalt: 'Rudi und Anni Kastner betreiben gemeinsam eine Schreinerei in Eichstätt. Sie möchten ihren Betrieb <em>„Schreinerei Holzdesign Kastner OHG"</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name enthält die Branchenangabe (Schreinerei), einen beschreibenden Zusatz (Holzdesign) und den Familiennamen (Kastner) als individualisierendes Merkmal. Die Unterscheidungskraft ist gegeben.'
  },
  {
    grundsatz: 'klarheit',
    firmenname: 'Transport GbR',
    _originalVorname: 'Peter', _originalNachname: 'Aigner',
    _originalRechtsform: 'GbR', _originalGeschlecht: 'm',
    sachverhalt: 'Drei Freunde gründen ein Transportunternehmen in Deggendorf und möchten es einfach <em>„Transport GbR"</em> nennen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenklarheit',
    begruendung: 'Die bloße Branchenangabe „Transport" ohne jeden individualisierenden Zusatz besitzt keine Unterscheidungskraft. Der Name könnte für unzählige Transportunternehmen stehen und macht das konkrete Unternehmen nicht erkennbar.'
  },
  {
    grundsatz: 'klarheit',
    firmenname: 'Friseurmeisterin Zopfinger e. Kfr.',
    _originalVorname: 'Anita', _originalNachname: 'Zopfinger',
    _originalRechtsform: 'e. Kfr.', _originalGeschlecht: 'w',
    sachverhalt: 'Anita Zopfinger ist ausgebildete Friseurmeisterin und eröffnet in Weilheim einen Friseursalon. Sie möchte ihn <em>„Friseurmeisterin Zopfinger e. Kfr."</em> nennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Der Name enthält die Berufsbezeichnung (Friseurmeisterin) und den Familiennamen, der als individualisierendes Element für ausreichende Unterscheidungskraft sorgt.'
  },

  // ── FIRMENAUSSCHLIESSLICHKEIT ────────────────────────────────────────────

  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Schreinerei Holzbauer e. K.',
    _originalVorname: 'Klaus', _originalNachname: 'Holzbauer',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Klaus Holzbauer will in Passau eine Schreinerei eröffnen. Im Handelsregister Passau ist bereits eine <em>„Holzbauer Schreinerei e. K."</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Obwohl die Reihenfolge der Wörter leicht verändert ist, ist der Name täuschend ähnlich zum bereits eingetragenen Unternehmen am gleichen Ort. Verwechslungsgefahr besteht. Der Name muss sich deutlicher unterscheiden.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Autohaus Zenith GmbH',
    _originalVorname: 'Petra', _originalNachname: 'Söllner',
    _originalRechtsform: 'GmbH', _originalGeschlecht: 'w',
    sachverhalt: 'Petra Söllner will in Würzburg ein Autohaus gründen. In Würzburg gibt es bereits ein <em>„Autohaus am Zenith GmbH"</em>.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Die Bezeichnungen „Zenith" und „am Zenith" sind so ähnlich, dass Verwechslungsgefahr am gleichen Ort besteht. Die Firmenausschließlichkeit schützt bestehende Unternehmen vor täuschend ähnlichen Neueintragungen.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Apotheke am Marktplatz Vogl e. Kfr.',
    _originalVorname: 'Cornelia', _originalNachname: 'Vogl',
    _originalRechtsform: 'e. Kfr.', _originalGeschlecht: 'w',
    sachverhalt: 'Cornelia Vogl will in Deggendorf eine Apotheke eröffnen. In Deggendorf ist keine andere Apotheke unter diesem oder einem ähnlichen Namen eingetragen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Da keine verwechslungsfähige Firma am gleichen Ort existiert, ist die Firmenausschließlichkeit gewahrt. Der Name ist klar, individuell und entspricht den Anforderungen.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Fahrradhaus Radsport Müller e. K.',
    _originalVorname: 'Herbert', _originalNachname: 'Müller',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Herbert Müller möchte in Bamberg ein Fahrradgeschäft eröffnen. Dort ist bereits ein <em>„Radsport Müller GmbH"</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Beide Firmen enthalten die Bestandteile „Radsport" und „Müller". Trotz unterschiedlicher Rechtsformen und leicht abweichender Reihenfolge besteht erhebliche Verwechslungsgefahr. Der Name muss stärker individualisiert werden.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Elektro Huber e. K.',
    _originalVorname: 'Stefan', _originalNachname: 'Huber',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Stefan Huber will in Freising einen Elektrobetrieb eröffnen. In Freising ist kein Unternehmen mit einem ähnlichen Namen tätig.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Da kein gleichnamiges oder täuschend ähnliches Unternehmen am gleichen Ort besteht, ist die Firmenausschließlichkeit erfüllt. Der Name hat ausreichend Unterscheidungskraft und ist wahrheitsgemäß.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Reisebüro Sunshine Tours GmbH',
    _originalVorname: 'Nadine', _originalNachname: 'Sommer',
    _originalRechtsform: 'GmbH', _originalGeschlecht: 'w',
    sachverhalt: 'Nadine Sommer möchte in Kempten ein Reisebüro als GmbH gründen. In Kempten ist bereits ein <em>„Sunshine Reisebüro GmbH"</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Beide Namen enthalten den charakteristischen Bestandteil „Sunshine" in Verbindung mit Reisebüro. Obwohl die genaue Formulierung abweicht, besteht erhebliche Verwechslungsgefahr. Der Grundsatz der Firmenausschließlichkeit ist verletzt.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Gärtnerei Blütenwelt Huber OHG',
    _originalVorname: 'Josef', _originalNachname: 'Huber',
    _originalRechtsform: 'OHG', _originalGeschlecht: 'm',
    sachverhalt: 'Josef und Maria Huber wollen in Erding eine Gärtnerei eröffnen. In Erding ist bereits eine <em>„Gärtnerei Huber e. K."</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Beide Namen tragen den Familiennamen „Huber" in Verbindung mit „Gärtnerei". Auch wenn ein Fantasiezusatz (Blütenwelt) ergänzt wurde, besteht Verwechslungsgefahr, da der prägende Namensbestandteil identisch ist.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Steuerberatung Kern & Partner mbB',
    _originalVorname: 'Katharina', _originalNachname: 'Kern',
    _originalRechtsform: 'mbB', _originalGeschlecht: 'w',
    sachverhalt: 'Katharina Kern möchte in Passau eine Steuerberatungskanzlei gründen. In Passau gibt es keine vergleichbare Firma unter diesem oder einem ähnlichen Namen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Da am gleichen Ort keine täuschend ähnliche Firma eingetragen ist, liegt kein Verstoß gegen die Firmenausschließlichkeit vor. Der Name ist individuell und verwechslungsfrei.'
  },
  {
    grundsatz: 'ausschliesslichkeit',
    firmenname: 'Bäckerei Mehlstube Ziegler e. K.',
    _originalVorname: 'Tobias', _originalNachname: 'Ziegler',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    sachverhalt: 'Tobias Ziegler will in Neumarkt eine Bäckerei eröffnen. In Neumarkt ist bereits eine <em>„Mehlstube Neumarkt GmbH"</em> eingetragen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenausschließlichkeit',
    begruendung: 'Das prägende Element „Mehlstube" taucht in beiden Namen auf. Da beide Unternehmen Bäckereien im gleichen Ort sind, ist die Verwechslungsgefahr erheblich. Der Grundsatz der Firmenausschließlichkeit ist verletzt.'
  },

  // ── FIRMENBESTÄNDIGKEIT ──────────────────────────────────────────────────

  // Heirat – Inhaberin bleibt dieselbe Person, kein Inhaberwechsel
  {
    grundsatz: 'bestaendigkeit',
    firmenname: 'Nagelstudio Brösl e. Kfr.',
    _originalVorname: 'Michaela', _originalNachname: 'Brösl',
    _originalRechtsform: 'e. Kfr.', _originalGeschlecht: 'w',
    sachverhalt: 'Michaela Brösl heiratet und heißt nun Degener. Sie will ihre Firma <em>„Nagelstudio Brösl e. Kfr."</em> weiterhin unter dem alten Namen Brösl führen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit erlaubt es, einen einmal eingetragenen Namen auch nach Änderungen beim Inhaber (z. B. Namensänderung durch Heirat) beizubehalten. Das Unternehmen hat sich unter diesem Namen einen Ruf erarbeitet, den es fortführen darf.'
  },
  // Kauf + Branchenwechsel → Firmenwahrheit verletzt
  {
    grundsatz: 'bestaendigkeit',
    firmenname: 'Schreinerei Mayer e. K.',
    _originalVorname: 'Felix', _originalNachname: 'Mayer',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    _bestaendigkeit_neuerInhaber: true,
    _neuerInhaberVorname: 'Felix', _neuerInhaberNachname: 'Mayer', _neuerInhaberGeschlecht: 'm',
    sachverhalt: 'Felix Mayer kauft die <em>„Schreinerei Mayer e. K."</em> und möchte den bekannten Namen weiterführen. Statt einer Schreinerei will er unter demselben Namen einen Lebensmittelhandel eröffnen.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit (trotz Beständigkeit)',
    begruendung: 'Die Firmenbeständigkeit erlaubt das Weiterführen des Namens nach einem Inhaberwechsel. Der Name „Schreinerei Mayer" beschreibt aber eindeutig einen holzverarbeitenden Betrieb. Wird darunter zusätzlich ein Lebensmittelhandel betrieben, täuscht der Name über den tatsächlichen Unternehmensgegenstand – das verstößt gegen die Firmenwahrheit.'
  },
  // Kauf – Name bleibt, Branche bleibt → zulässig
  {
    grundsatz: 'bestaendigkeit',
    firmenname: 'Landgasthof Daxenberger e. K.',
    _originalVorname: 'Christian', _originalNachname: 'Schillinger',
    _originalRechtsform: 'e. K.', _originalGeschlecht: 'm',
    _bestaendigkeit_neuerInhaber: true,
    _neuerInhaberVorname: 'Christian', _neuerInhaberNachname: 'Schillinger', _neuerInhaberGeschlecht: 'm',
    sachverhalt: 'Christian Schillinger kauft den <em>„Landgasthof Daxenberger e. K."</em> von der Familie Daxenberger und möchte den altbekannten Namen weiterführen, da der Gasthof seit Jahrzehnten unter diesem Namen bekannt ist.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit erlaubt das Weiterführen des Namens auch nach einem Eigentümerwechsel, sofern der Erwerber einwilligt. Der gute Ruf des Namens bleibt erhalten – das ist der Zweck dieses Grundsatzes.'
  },
  // Kauf Kanzlei – neue Inhaberin, Name bleibt → zulässig
  {
    grundsatz: 'bestaendigkeit',
    firmenname: 'Steuerberater Grünwald & Partner GbR',
    _originalVorname: 'Barbara', _originalNachname: 'Winkler',
    _originalRechtsform: 'GbR', _originalGeschlecht: 'w',
    _bestaendigkeit_neuerInhaber: true,
    _neuerInhaberVorname: 'Barbara', _neuerInhaberNachname: 'Winkler', _neuerInhaberGeschlecht: 'w',
    sachverhalt: 'Barbara Winkler übernimmt die Kanzlei <em>„Steuerberater Grünwald & Partner GbR"</em> von Herrn Grünwald, der in Rente geht. Sie möchte den Namen beibehalten, da die Kanzlei damit bestens bekannt ist.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Durch die Firmenbeständigkeit darf die neue Inhaberin den Namen fortführen, auch wenn Herr Grünwald nicht mehr im Unternehmen tätig ist. Der Firmenname verkörpert den Ruf der Kanzlei – diesen Wert darf sie nutzen.'
  },
  // Austritt Gesellschafter – OHG nicht mehr korrekt
  {
    grundsatz: 'bestaendigkeit',
    firmenname: 'Bäckerei Schindlbeck OHG',
    _originalVorname: 'Vroni', _originalNachname: 'Schindlbeck',
    _originalRechtsform: 'OHG', _originalGeschlecht: 'w',
    sachverhalt: 'Vroni Schindlbeck tritt aus der OHG aus. Ihr früherer Gesellschafter Josef Haas führt den Betrieb allein weiter und möchte den Namen <em>„Bäckerei Schindlbeck OHG"</em> beibehalten.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Die Rechtsform OHG ist nicht mehr korrekt, wenn nur noch ein Inhaber vorhanden ist. Name und Rechtsform müssen angepasst werden.'
  },
  // Kauf Modehaus – neue Inhaberin, Rechtsform muss passen
 {
  grundsatz: 'bestaendigkeit',

  // Firma (bleibt stabil)
  firmenname: 'Modehaus Vogt e. Kfr.',

  // ursprünglicher Inhaber (steht im Firmennamen)
  _originalVorname: 'Elke',
  _originalNachname: 'Vogt',
  _originalGeschlecht: 'w',
  _originalRechtsform: 'e. Kfr.',

  // neuer Inhaber
  _bestaendigkeit_neuerInhaber: true,
  _neuerInhaberVorname: 'Maria',
  _neuerInhaberNachname: 'Thalmaier',
  _neuerInhaberGeschlecht: 'w',

  sachverhalt:
    'Elke Vogt verkauft ihr Modehaus an Maria Thalmaier. Der Name <em>„Modehaus Vogt e. Kfr."</em> soll weiterführt werden, da das Geschäft in der Stadt sehr bekannt ist.'
},
  // Heirat Optikerin
  {
    grundsatz: 'bestaendigkeit',
    firmenname: 'Optiker Weissgerber e. Kfr.',
    _originalVorname: 'Lena', _originalNachname: 'Weissgerber',
    _originalRechtsform: 'e. Kfr.', _originalGeschlecht: 'w',
    sachverhalt: 'Lena Weissgerber heiratet und heißt nun Lena Zankl. Sie führt ihr Optikergeschäft <em>„Optiker Weissgerber e. Kfr."</em> unter ihrem Mädchennamen weiter, da alle Kunden diesen Namen kennen.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit schützt genau diesen Fall: Persönliche Veränderungen des Inhabers (Namensänderung durch Heirat) berechtigen nicht zum Zwang, den Namen zu ändern. Der Goodwill des Namens bleibt erhalten.'
  },
  // Übernahme Fahrschule – gleicher Nachname
  {
  grundsatz: 'bestaendigkeit',

  firmenname: 'Fahrschule Kaya e. K.',

  // ursprünglicher Inhaber
  _originalVorname: 'Georg',
  _originalNachname: 'Kaya',
  _originalGeschlecht: 'm',
  _originalRechtsform: 'e. K.',

  // neuer Inhaber
  _bestaendigkeit_neuerInhaber: true,
  _neuerInhaberVorname: 'Kerim',
  _neuerInhaberNachname: 'Kaya',
  _neuerInhaberGeschlecht: 'm',

  sachverhalt:
    'Kerim Kaya übernimmt die Fahrschule vom Vater Georg Kaya, der in Rente geht. Da er denselben Nachnamen trägt, möchte er die Fahrschule weiterhin unter dem Namen <em>„Fahrschule Kaya e. K."</em> führen.',

  korrekt: true,
  urteil: 'Entspricht den rechtlichen Vorgaben',
  begruendung:
    'Nach dem Grundsatz der Firmenbeständigkeit darf der Firmenname auch nach einem Inhaberwechsel weitergeführt werden. Da Kerim Kaya die Fahrschule übernimmt und der Familienname ohnehin gleich bleibt, besteht keine Irreführung.'
},
  // Austritt Gesellschafter Buchhandlung – OHG + Name irreführend
  {
    grundsatz: 'bestaendigkeit',
    firmenname: 'Buchhandlung Lesen & Mehr Strobl OHG',
    _originalVorname: 'Karl', _originalNachname: 'Strobl',
    _originalRechtsform: 'OHG', _originalGeschlecht: 'm',
    sachverhalt: 'Karl Strobl scheidet aus der OHG aus. Seine frühere Partnerin Inge Wimmer führt die Buchhandlung <em>„Buchhandlung Lesen & Mehr Strobl OHG"</em> alleine weiter und möchte den bekannten Namen behalten.',
    korrekt: false,
    urteil: 'Verstoß gegen die Firmenwahrheit',
    begruendung: 'Da Karl Strobl aus dem Unternehmen ausgeschieden ist, ist sein Name im Firmennamen irreführend. Außerdem ist die Rechtsform OHG bei Alleinführung nicht mehr korrekt. Der Name und die Rechtsform müssen aktualisiert werden.'
  },
  // Kauf Autowerkstatt – Rechtsform KG bleibt
  {
    grundsatz: 'bestaendigkeit',
    firmenname: 'Autowerkstatt Seidl & Co. KG',
    _originalVorname: 'Michael', _originalNachname: 'Brandner',
    _originalRechtsform: 'KG', _originalGeschlecht: 'm',
    _bestaendigkeit_neuerInhaber: true,
    _neuerInhaberVorname: 'Michael', _neuerInhaberNachname: 'Brandner', _neuerInhaberGeschlecht: 'm',
    sachverhalt: 'Familie Seidl verkauft ihre Autowerkstatt an Michael Brandner. Er möchte den Namen <em>„Autowerkstatt Seidl & Co. KG"</em> weiterführen, da die Werkstatt in der Region sehr bekannt ist.',
    korrekt: true,
    urteil: 'Entspricht den rechtlichen Vorgaben',
    begruendung: 'Die Firmenbeständigkeit erlaubt das Weiterführen des Namens nach einem Eigentümerwechsel. Der Erwerber darf den Goodwill des bekannten Namens nutzen. Voraussetzung ist die Einwilligung des bisherigen Inhabers.'
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
    wahrheit: 'Firmenwahrheit',
    klarheit: 'Firmenklarheit',
    ausschliesslichkeit: 'Firmenausschließlichkeit',
    bestaendigkeit: 'Firmenbeständigkeit',
  };
  return map[key] || key;
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

    const firmenname  = ersetzeFirmenname(fall, person);
    const sachverhalt = ersetzeSachverhalt(fall, person);

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
          <span style="font-size:0.95em;">${fall.begruendung}</span>
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