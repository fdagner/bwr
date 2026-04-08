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
  { vorname: 'Florian',    nachname: 'Klein',       geschlecht: 'm' },
  { vorname: 'Monika',     nachname: 'Kraus',       geschlecht: 'w' },
  { vorname: 'Christian',  nachname: 'Celek',       geschlecht: 'm' },
  { vorname: 'Alara',      nachname: 'Köhler',      geschlecht: 'w' },
  { vorname: 'Tobias',     nachname: 'Jackson',     geschlecht: 'm' },
  { vorname: 'Claudia',    nachname: 'Weiß',        geschlecht: 'w' },
  { vorname: 'Martin',     nachname: 'Schulz',      geschlecht: 'm' },
  { vorname: 'Ayla',       nachname: 'Schwarz',     geschlecht: 'w' },
  { vorname: 'Nicole',     nachname: 'Frank',       geschlecht: 'w' },
  { vorname: 'Werner',     nachname: 'Probst',      geschlecht: 'm' },
  { vorname: 'Susanne',    nachname: 'Keller',      geschlecht: 'w' },
  { vorname: 'Kerim',      nachname: 'Kaya',        geschlecht: 'm' },
  { vorname: 'Mia',        nachname: 'Baumann',     geschlecht: 'w' },
  { vorname: 'Konrad',     nachname: 'Frei',        geschlecht: 'm' },
  { vorname: 'Fatima',     nachname: 'Mutas',       geschlecht: 'w' },
  { vorname: 'Omar',       nachname: 'Peters',      geschlecht: 'm' },
  { vorname: 'Renate',     nachname: 'Melin',       geschlecht: 'w' },
];

function zufallsname(ausschluss = []) {
  const verfuegbar = zufallsnamen.filter(n => !ausschluss.includes(n.nachname));
  return verfuegbar[Math.floor(Math.random() * verfuegbar.length)];
}

// ============================================================================
// UNIVERSELLE ERSETZUNGSFUNKTION
// ============================================================================

function ersetzeText(text, person) {
  const w = person.geschlecht === 'w';
  return text
    .replace(/\{vorname\}/g,         person.vorname)
    .replace(/\{nachname\}/g,        person.nachname)
    .replace(/\{Er_Sie\}/g,          w ? 'Sie'   : 'Er')
    .replace(/\{er_sie\}/g,          w ? 'sie'   : 'er')
    .replace(/\{Sein_Ihr\}/g,        w ? 'Ihr'   : 'Sein')
    .replace(/\{sein_ihr\}/g,        w ? 'ihr'   : 'sein')
    .replace(/\{seinen_ihren\}/g,    w ? 'ihren' : 'seinen')
    .replace(/\{seiner_ihrer\}/g,    w ? 'ihrer' : 'seiner')
    .replace(/\{seine_ihre\}/g,      w ? 'ihre'  : 'seine')
    .replace(/\{Mitarbeiter_in\}/g,  w ? 'Mitarbeiterin' : 'Mitarbeiter')
    .replace(/\{Chef_Chefin\}/g,     w ? 'Chefin' : 'Chef')
    .replace(/\{Kollegen_innen\}/g,  'Kolleginnen und Kollegen');
}

// ============================================================================
// FALLBEISPIELE – Personalführungstechniken
// ============================================================================

const faelle = [

  // ── MANAGEMENT BY OBJECTIVES ────────────────────────────────────────────

  {
    technik: 'mbo',
    sachverhalt: '{vorname} {nachname} ist Abteilungsleiter/-in in einer Versicherung. Einmal im Jahr setzt {er_sie} sich gemeinsam mit jedem {Mitarbeiter_in} zusammen und bespricht, welche Ziele bis zum Jahresende erreicht werden sollen. Die Ziele werden schriftlich festgehalten. Wer {seine_ihre} Ziele erfüllt, erhält eine Prämie.',
    vorteile: [
      'Mitarbeitende kennen ihre genauen Ziele und können eigenverantwortlich arbeiten.',
      'Gemeinsam vereinbarte Ziele erhöhen die Motivation und Identifikation mit dem Betrieb.',
      'Leistungen sind messbar und faire Beurteilung wird erleichtert.',
    ],
    nachteile: [
      'Hoher Zeitaufwand für Zielvereinbarungsgespräche.',
      'Gefahr, dass nur messbare Ziele beachtet werden – wichtige, schwer messbare Aufgaben werden vernachlässigt.',
      'Bei unrealistischen Zielen kann Frustration entstehen.',
    ],
  },
  {
    technik: 'mbo',
    sachverhalt: 'In der Bäckerei von {vorname} {nachname} wird jedes Jahr im Januar besprochen, welche Umsatzziele jede Filiale erreichen soll. Die Filialleiterinnen und -leiter dürfen selbst Vorschläge einbringen. Bei Zielerreichung gibt es Sonderzahlungen.',
    vorteile: [
      'Mitarbeitende übernehmen Verantwortung für ihre Filiale.',
      'Klare Erfolgskriterien schaffen Transparenz und Fairness.',
      'Eigeninitiative und unternehmerisches Denken werden gefördert.',
    ],
    nachteile: [
      'Ziele können zwischen Filialen ungleich verteilt werden.',
      'Hoher organisatorischer Aufwand für die Planung und Kontrolle.',
      'Fokus auf Umsatzziele kann Qualität oder Teamklima gefährden.',
    ],
  },
  {
    technik: 'mbo',
    sachverhalt: '{vorname} {nachname} führt ein mittelständisches IT-Unternehmen. {Er_Sie} führt regelmäßige Mitarbeitergespräche, in denen gemeinsam Quartalsziele festgelegt werden. Am Ende des Quartals wird ausgewertet, was erreicht wurde – und warum gegebenenfalls nicht.',
    vorteile: [
      'Regelmäßige Gespräche stärken das Vertrauensverhältnis zwischen Führungskraft und Team.',
      'Ziele sind nachvollziehbar und motivieren zur selbstständigen Arbeit.',
      'Abweichungen werden frühzeitig erkannt und können korrigiert werden.',
    ],
    nachteile: [
      'Auswertungsgespräche binden viel Zeit der Führungskraft.',
      'Mitarbeitende empfinden die Kontrolle am Quartalsende manchmal als Druck.',
      'Kurzfristige Ziele können langfristige Unternehmensziele aus dem Blick drängen.',
    ],
  },
  {
    technik: 'mbo',
    sachverhalt: 'Die Vertriebsabteilung bei {vorname} {nachname}s Firma legt gemeinsam mit der Teamleitung fest, wie viele Neukunden pro Monat gewonnen werden sollen. Alle Beteiligten einigen sich auf realistische Zahlen. Am Monatsende gibt es ein kurzes Feedback-Gespräch.',
    vorteile: [
      'Vertriebsmitarbeitende wissen genau, was von ihnen erwartet wird.',
      'Gemeinsame Zielsetzung sorgt für Akzeptanz und Motivation.',
      'Monatliche Feedbackgespräche fördern eine offene Kommunikation.',
    ],
    nachteile: [
      'Wenn Ziele nicht erreicht werden, kann das Betriebsklima leiden.',
      'Die reine Fokussierung auf Zahlen kann den Kundenkontakt unpersönlich machen.',
      'Häufige Gespräche können als zeitraubend empfunden werden.',
    ],
  },
  {
    technik: 'mbo',
    sachverhalt: 'Im Krankenhaus von {vorname} {nachname} werden für jede Pflegestation jährliche Qualitätsziele vereinbart, z. B. die Verringerung von Wartezeiten. Die Stationsleitungen können eigene Vorschläge einbringen. Bei Zielerreichung gibt es eine öffentliche Anerkennung im Intranet.',
    vorteile: [
      'Pflegefachkräfte engagieren sich stärker, da sie die Ziele mitgestaltet haben.',
      'Qualitätsziele verbessern messbar die Patientenversorgung.',
      'Öffentliche Anerkennung stärkt das Teamgefühl und den Zusammenhalt.',
    ],
    nachteile: [
      'Pflegekräfte können sich durch Zieldruck belastet fühlen.',
      'Ziele können bei Personalmangel kaum realistisch erreicht werden.',
      'Nicht alle relevanten Aspekte der Pflege lassen sich in Zielen messen.',
    ],
  },

  // ── MANAGEMENT BY DELEGATION ────────────────────────────────────────────

  {
    technik: 'mbd',
    sachverhalt: '{vorname} {nachname} ist Inhaberin einer Werbeagentur. {Er_Sie} überträgt einzelnen Teammitgliedern ganze Kundenprojekte – inklusive der Entscheidungsbefugnis für Budget und Gestaltung. {Er_Sie} selbst ist nur bei grundlegenden Problemen ansprechbar.',
    vorteile: [
      'Mitarbeitende entwickeln Eigenverantwortung und Kompetenz.',
      'Die Führungskraft wird entlastet und kann sich auf strategische Aufgaben konzentrieren.',
      'Teamarbeit und Kreativität werden gefördert.',
    ],
    nachteile: [
      'Fehler der Mitarbeitenden können teuer werden, da zu wenig kontrolliert wird.',
      'Nicht alle Mitarbeitenden fühlen sich mit großer Verantwortung wohl.',
      'Uneinheitliche Qualität durch verschiedene Vorgehensweisen im Team.',
    ],
  },
  {
    technik: 'mbd',
    sachverhalt: 'Bei {vorname} {nachname}s Logistikfirma erhalten Schichtleiterinnen und -leiter die vollständige Verantwortung für ihre Schicht – von der Einsatzplanung bis zur Qualitätskontrolle. {Er_Sie} greift nur ein, wenn es zu gravierenden Problemen kommt.',
    vorteile: [
      'Schichtleiter/-innen können situationsgerecht und schnell entscheiden.',
      'Führungskraft wird entlastet und hat Zeit für übergeordnete Planungsaufgaben.',
      'Mitarbeitende fühlen sich ernstgenommen und zeigen mehr Engagement.',
    ],
    nachteile: [
      'Unterschiedliche Führung in verschiedenen Schichten kann zu Ungleichbehandlung führen.',
      'Ohne klare Rückmeldung können Fehler lange unentdeckt bleiben.',
      'Weniger erfahrene Schichtleitungen können überfordert sein.',
    ],
  },
  {
    technik: 'mbd',
    sachverhalt: 'Die Restaurantchefin {vorname} {nachname} überträgt ihrer Küchenleiterin die vollständige Planung der Wochenkarte – inklusive Einkauf und Kalkulation. {Er_Sie} selbst schaut sich das Ergebnis erst am Wochenende an.',
    vorteile: [
      'Die Küchenleitung kann ihr Fachwissen voll einbringen und wächst fachlich.',
      'Schnellere Entscheidungen im Tagesgeschäft ohne Rückfragen bei der Chefin.',
      'Gegenseitiges Vertrauen stärkt die Zusammenarbeit langfristig.',
    ],
    nachteile: [
      'Fehleinkäufe oder schlechte Kalkulation können wirtschaftlichen Schaden verursachen.',
      'Fehlende Kontrolle kann zu Qualitätsproblemen bei Speisen führen.',
      'Die Chefin verliert den Überblick über das laufende Tagesgeschäft.',
    ],
  },
  {
    technik: 'mbd',
    sachverhalt: 'Im Handwerksbetrieb von {vorname} {nachname} sind erfahrene Gesellen für ihre Baustellen komplett selbstverantwortlich – sie koordinieren Material, Zeitplan und Kundenkommunikation. {Er_Sie} selbst kümmert sich um Akquise und Buchhaltung.',
    vorteile: [
      'Gesellen können flexibel auf Baustellensituationen reagieren.',
      'Inhabende werden von Routineaufgaben entlastet und können den Betrieb ausbauen.',
      'Mitarbeitende fühlen sich als vollwertige Fachkräfte anerkannt.',
    ],
    nachteile: [
      'Bei Konflikten mit Kunden fehlt eine direkte Ansprechperson der Betriebsleitung.',
      'Qualitätsunterschiede zwischen verschiedenen Gesellen sind schwer zu kontrollieren.',
      'Eigenverantwortung überfordert manchmal weniger erfahrene Fachkräfte.',
    ],
  },
  {
    technik: 'mbd',
    sachverhalt: '{vorname} {nachname} leitet eine Sozialpädagogikeinrichtung. {Er_Sie} überträgt den Gruppenleiterinnen und Gruppenleitern die vollständige Verantwortung für die Freizeitgestaltung, Elterngespräche und Dokumentation ihrer Gruppe.',
    vorteile: [
      'Gruppenleiter/-innen können pädagogisch individuell und flexibel handeln.',
      'Eltern haben eine feste Ansprechperson, die den Alltag der Gruppe kennt.',
      'Mitarbeitende entwickeln Führungskompetenzen für ihre spätere Karriere.',
    ],
    nachteile: [
      'Ohne Absprache können unterschiedliche pädagogische Ansätze zu Konflikten führen.',
      'Wenig erfahrene Gruppenleiter/-innen sind mit der gesamten Verantwortung überfordert.',
      'Die Einrichtungsleitung kann Qualität und Einheitlichkeit schwer sicherstellen.',
    ],
  },
  {
    technik: 'mbd',
    sachverhalt: 'Die Filialleiterinnen und -leiter bei {vorname} {nachname}s Modekette dürfen eigenständig entscheiden, welche Kollektionen sie in welchem Umfang bestellen, wie sie das Personal einteilen und wie sie Aktionen in ihrer Filiale gestalten.',
    vorteile: [
      'Filialen können auf lokale Kundenwünsche und Trends reagieren.',
      'Schnellere Entscheidungen ohne langen Abstimmungsweg zur Zentrale.',
      'Filialleiter/-innen übernehmen unternehmerische Verantwortung und wachsen daran.',
    ],
    nachteile: [
      'Zu unterschiedliche Filialen können das Markenimage verwässern.',
      'Fehleinkäufe oder Fehlentscheidungen bleiben ohne Kontrolle länger unbemerkt.',
      'Nicht alle Filialleiter/-innen haben das nötige kaufmännische Wissen für alle Aufgaben.',
    ],
  },

  // ── MANAGEMENT BY EXCEPTION ─────────────────────────────────────────────

  {
    technik: 'mbe',
    sachverhalt: '{vorname} {nachname} ist Geschäftsführer/-in eines Maschinenbaubetriebs. {Er_Sie} greift nur ein, wenn Kennzahlen deutlich vom Plan abweichen – z. B. wenn die Ausschussquote über 5 % steigt. Alles, was im Normalbereich liegt, regeln die Mitarbeitenden selbst.',
    vorteile: [
      'Führungskraft hat Kapazitäten für strategisch wichtige Entscheidungen.',
      'Mitarbeitende gewinnen Handlungsspielraum und Vertrauen.',
      'Ressourcen werden gezielt dort eingesetzt, wo wirklich etwas schiefläuft.',
    ],
    nachteile: [
      'Kleine Probleme, die sich langsam anbahnen, werden erst spät erkannt.',
      'Mitarbeitende fühlen sich alleingelassen, wenn keine regelmäßige Rückmeldung kommt.',
      'Schwierig umzusetzen, wenn nicht alle Prozesse gut messbar sind.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Im Onlinehandel von {vorname} {nachname} überwacht ein Dashboard alle wichtigen Kennzahlen. {Er_Sie} schaut nur dann auf den Betrieb, wenn ein Wert – etwa die Retourenquote oder Lieferdauer – einen festgelegten Grenzwert überschreitet. Im Normalfall läuft alles automatisch.',
    vorteile: [
      'Effizienter Einsatz der Führungszeit durch klare Eingriffsschwellen.',
      'Schnelle Reaktion auf kritische Abweichungen dank automatisierter Benachrichtigungen.',
      'Mitarbeitende können selbstständig und routiniert arbeiten.',
    ],
    nachteile: [
      'Mitarbeitende erhalten kaum Feedback im Normalfall – das kann demotivieren.',
      'Grenzwerte müssen regelmäßig überprüft und angepasst werden.',
      'Unvorhergesehene Probleme außerhalb der Kennzahlen werden leicht übersehen.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Die Buchhalterin {vorname} {nachname} in einem mittelständischen Unternehmen meldet nur dann an die Geschäftsleitung, wenn Ausgaben einen bestimmten Betrag überschreiten. Alles darunter regelt {er_sie} in eigener Zuständigkeit.',
    vorteile: [
      'Die Geschäftsleitung wird von kleinen Routineentscheidungen entlastet.',
      'Schnelle Abläufe im Tagesgeschäft ohne unnötige Rückfragen.',
      'Vertrauen in die Kompetenz der Mitarbeitenden wird deutlich signalisiert.',
    ],
    nachteile: [
      'Viele kleine Ausgaben können sich zu großen Summen summieren – ohne Kontrolle.',
      'Grenzwerte müssen klar kommuniziert und regelmäßig überprüft werden.',
      'Gefahr, dass Mitarbeitende die Grenzen ausreizen, wenn niemand hinschaut.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Bei {vorname} {nachname}s Spedition kontrolliert die Disponent/-in täglich die Fahrtzeiten und Lieferquoten. Nur wenn ein Fahrerin oder ein Fahrer deutlich vom Zeitplan abweicht oder eine Lieferung ausfällt, informiert {er_sie} die Betriebsleitung.',
    vorteile: [
      'Führungskraft muss nicht jede Fahrt einzeln verfolgen – Zeit wird gespart.',
      'Abweichungen werden strukturiert erfasst und gezielt behoben.',
      'Fahrpersonal arbeitet eigenverantwortlich und ohne ständige Kontrolle.',
    ],
    nachteile: [
      'Kleine, häufige Verspätungen unter dem Schwellenwert bleiben unbeachtet.',
      'Fahrpersonal fühlt sich nur bei Problemen wahrgenommen, nie für gute Arbeit gelobt.',
      'Grenzwerte müssen gut kalibriert sein – sonst ist das System zu starr oder zu lasch.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: '{vorname} {nachname} führt eine Steuerberatungskanzlei. {Er_Sie} greift in die Arbeit der Fachkräfte nur ein, wenn Fristen nicht eingehalten werden oder Fehler in Steuererklärungen auftauchen. Standardfälle bearbeitet das Team eigenständig.',
    vorteile: [
      'Gut ausgebildete Fachkräfte können ohne ständige Aufsicht produktiv arbeiten.',
      'Führungskraft hat Zeit für anspruchsvolle Beratungsfälle und Mandantenbeziehungen.',
      'Klare Regeln, was gemeldet werden muss, geben dem Team Orientierung.',
    ],
    nachteile: [
      'Fachkräfte bekommen wenig Feedback – das hemmt die fachliche Weiterentwicklung.',
      'Fehlerkultur kann leiden, wenn Eingreifen immer negativ besetzt ist.',
      'Bei komplexen Grenzfällen wissen Mitarbeitende nicht, ob sie selbst entscheiden sollen.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Im Supermarkt von {vorname} {nachname} übernehmen Abteilungsleiterinnen und -leiter alle operativen Entscheidungen selbst. Die Marktleitung wird nur informiert, wenn Waren massiv unter dem Mindestbestand liegen oder ein Mitarbeitender krank ist und keine Vertretung gefunden werden kann.',
    vorteile: [
      'Marktleitung wird von Alltagsentscheidungen entlastet und kann sich dem Gesamtbetrieb widmen.',
      'Abteilungsleiter/-innen handeln schnell und situationsnah.',
      'Klare Eskalationsregeln verhindern unnötige Anfragen.',
    ],
    nachteile: [
      'Abteilungsleiter/-innen sind auf sich gestellt – das kann bei Unsicherheiten belasten.',
      'Probleme, die knapp unter der Meldeschwelle liegen, werden ignoriert.',
      'Marktleitung verliert das Gefühl für den Alltag im Markt.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Bei der Softwarefirma von {vorname} {nachname} haben Entwickler-Teams volle Autonomie. Nur wenn ein Projektbudget überschritten wird oder ein Meilenstein nicht erreicht wird, schaltet sich {er_sie} ein. Ansonsten vertraut {er_sie} den Teams vollständig.',
    vorteile: [
      'Entwicklungsteams können kreativ und agil arbeiten ohne bürokratische Eingriffe.',
      'Führungskraft kann sich auf Produkt- und Unternehmensstrategie konzentrieren.',
      'Hohe Eigenverantwortung zieht selbstständige und engagierte Fachkräfte an.',
    ],
    nachteile: [
      'Wenn Teams schweigen, um keinen „Ausnahmefall" auszulösen, entstehen versteckte Risiken.',
      'Projektverzögerungen werden erst spät eskaliert – dann ist Gegensteuern schwieriger.',
      'Weniger erfahrene Teams können ohne regelmäßiges Coaching in Schwierigkeiten geraten.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Die Heimleiterin {vorname} {nachname} eines Altenpflegeheims greift nur dann in den Pflegealltag ein, wenn dokumentierte Qualitätsmängel auftauchen oder ein Beschwerdebrief eingeht. Den Stationsleiterinnen und -leitern überlässt {er_sie} ansonsten alle Entscheidungen.',
    vorteile: [
      'Stationsleitungen handeln eigenverantwortlich und kennen ihren Bereich am besten.',
      'Heimleitung hat Zeit für strategische Aufgaben wie Belegungsplanung und Qualitätsberichte.',
      'Vertrauen in das Team stärkt die Arbeitszufriedenheit.',
    ],
    nachteile: [
      'In einem sensiblen Umfeld wie der Pflege können Probleme ohne regelmäßige Kontrolle eskalieren.',
      'Stationsleitungen fühlen sich möglicherweise allein mit schwierigen Situationen.',
      'Das Eingreifen nur bei Ausnahmen kann als mangelndes Interesse wahrgenommen werden.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: '{vorname} {nachname} ist Schulleiter/-in eines Gymnasiums. {Er_Sie} vertraut darauf, dass Lehrerinnen und Lehrer ihren Unterricht eigenständig planen und durchführen. Nur bei Beschwerden von Eltern oder gravierenden disziplinarischen Vorfällen wird {er_sie} aktiv.',
    vorteile: [
      'Lehrkräfte genießen pädagogische Freiheit und können kreativ unterrichten.',
      'Schulleitung wird nicht mit alltäglichen Unterrichtsfragen belastet.',
      'Eigenverantwortung fördert professionelles Selbstverständnis der Lehrkräfte.',
    ],
    nachteile: [
      'Probleme im Unterricht werden oft erst durch Elternbeschwerden sichtbar – zu spät.',
      'Lehrkräfte erhalten wenig systematische Rückmeldung zu ihrer Arbeit.',
      'Einheitliche Schulkultur ist schwer zu entwickeln, wenn Schulleitung kaum präsent ist.',
    ],
  },

  // ── WEITERE MIXED-FÄLLE ──────────────────────────────────────────────────

  {
    technik: 'mbo',
    sachverhalt: 'Das Fitnessstudio von {vorname} {nachname} vereinbart zu Jahresbeginn mit jeder Trainerin und jedem Trainer individuelle Ziele: z. B. eine bestimmte Kundenzufriedenheitswertung oder Anzahl neuer Mitgliedschaften. Bei Zielerreichung winkt ein Bonus.',
    vorteile: [
      'Trainerinnen und Trainer wissen, worauf es ankommt, und arbeiten zielorientiert.',
      'Bonusregelung schafft einen konkreten finanziellen Anreiz.',
      'Kundenzufriedenheit und Mitgliederzahlen lassen sich gut messen und vergleichen.',
    ],
    nachteile: [
      'Konkurrenzdruck unter Kolleginnen und Kollegen kann das Teamklima belasten.',
      'Qualitative Aspekte wie Beratungsqualität sind schwer in Zahlen zu fassen.',
      'Einzelne Trainerinnen oder Trainer mit schwierigeren Kundensegmenten haben Nachteile.',
    ],
  },
  {
    technik: 'mbd',
    sachverhalt: 'Im Büro von {vorname} {nachname} darf die Teamassistenz eigenständig Bestellungen bis 500 Euro tätigen, Termine mit Dienstleistern koordinieren und Reisen buchen. {Er_Sie} selbst informiert sich nur wöchentlich über das Gebuchte.',
    vorteile: [
      'Schnelle Abwicklung von Routineaufgaben ohne unnötige Rückfragen.',
      'Teamassistenz kann Aufgaben effizient und eigenverantwortlich erledigen.',
      '{vorname} {nachname} wird von Kleinstentscheidungen entlastet.',
    ],
    nachteile: [
      'Ohne wöchentliche Kontrolle können sich Fehler oder Mehrausgaben summieren.',
      'Unklare Grenzen bei unerwarteten Situationen können zu Fehlentscheidungen führen.',
      'Nur wöchentliche Rückmeldung bedeutet kaum Feedback für die Teamassistenz.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Im Reisebüro von {vorname} {nachname} kümmern sich die Reiseberaterinnen und -berater selbstständig um alle Buchungsanfragen. Nur bei Stornierungen über 2.000 Euro oder Kundenbeschwerden wird {er_sie} informiert.',
    vorteile: [
      'Kunden werden schnell und kompetent beraten, ohne auf Rückfragen bei der Leitung zu warten.',
      'Beraterinnen und Berater entwickeln ihr Fachwissen und ihre Entscheidungskompetenz.',
      'Leitung kann sich auf Unternehmensentwicklung und Partnerverhandlungen konzentrieren.',
    ],
    nachteile: [
      'Kleine Probleme unter der Eingriffsschwelle können sich zu Kundenverlust summieren.',
      'Beraterinnen und Berater erhalten kaum Lob oder Korrektur im Normalfall.',
      'Bei schwierigen Kundensituationen fühlen sich manche Mitarbeitende alleingelassen.',
    ],
  },
  {
    technik: 'mbo',
    sachverhalt: '{vorname} {nachname} führt ein Ingenieurbüro. Jede Projektteilnehmerin und jeder Projektteilnehmer verpflichtet sich zu Projektbeginn auf klare Meilensteine. Am Ende jedes Projektabschnitts wird gemeinsam bewertet, ob die Zwischenziele erreicht wurden.',
    vorteile: [
      'Klare Meilensteine machen Fortschritt und Verzögerungen transparent.',
      'Alle Beteiligten wissen, was bis wann erwartet wird.',
      'Regelmäßige Zwischenauswertungen ermöglichen frühe Kurskorrektur.',
    ],
    nachteile: [
      'Strenge Meilensteinfixierung kann zu wenig Flexibilität bei unerwarteten Projektänderungen führen.',
      'Zwischenauswertungen kosten Zeit und können als Kontrolldruck empfunden werden.',
      'Kreative Lösungsfindung wird gehemmt, wenn alle nur auf das definierte Ziel starren.',
    ],
  },
  {
    technik: 'mbd',
    sachverhalt: 'Bei {vorname} {nachname}s Eventmanagementagentur leitet jede Projektmanagerin und jeder Projektmanager eine Veranstaltung eigenständig – von der Planung über die Budgetkontrolle bis zur Nachbereitung. {Er_Sie} tritt nur als Ansprechperson bei großen Vertragsabschlüssen auf.',
    vorteile: [
      'Projektleitende sammeln umfassende Berufserfahrung und entwickeln Führungsqualitäten.',
      'Agenturinhaberin oder -inhaber kann mehrere Projekte gleichzeitig laufen lassen.',
      'Kunden haben eine feste Ansprechperson, die das gesamte Projekt kennt.',
    ],
    nachteile: [
      'Qualitätsunterschiede zwischen verschiedenen Projektleitungen können das Agenturimage schädigen.',
      'Bei Fehlern ohne direktes Eingreifen der Leitung können Kundenverhältnisse beschädigt werden.',
      'Nicht alle Projektleitenden sind gleich belastbar oder erfahren genug für volle Eigenverantwortung.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Im Großhandelsunternehmen von {vorname} {nachname} bearbeiten Sachbearbeiterinnen und Sachbearbeiter alle eingehenden Aufträge selbst. Nur wenn ein Auftragswert über 10.000 Euro liegt oder ein Kunde explizit die Geschäftsleitung sprechen möchte, wird {er_sie} eingeschaltet.',
    vorteile: [
      'Aufträge werden zügig ohne bürokratischen Umweg abgewickelt.',
      'Sachbearbeitende entwickeln Eigenverantwortung und Kundenkompetenz.',
      'Geschäftsleitung kann sich auf strategische Kundenbeziehungen und Einkauf konzentrieren.',
    ],
    nachteile: [
      'Grenzfälle knapp unter 10.000 Euro werden ohne Kontrolle entschieden.',
      'Sachbearbeitende können bei schwierigen Verhandlungen auf sich allein gestellt sein.',
      'Fehler bei größeren Standardaufträgen bleiben unbemerkt, bis der Schwellenwert überschritten wird.',
    ],
  },
  {
    technik: 'mbo',
    sachverhalt: 'In {vorname} {nachname}s Pflegeheim werden mit allen Pflegefachkräften jährliche Qualitätsziele vereinbart, z. B. die Verbesserung der Dokumentationsqualität oder die Reduzierung von Sturzereignissen. Bei Zielerreichung gibt es zusätzliche Weiterbildungstage.',
    vorteile: [
      'Qualitätsziele verbessern messbar die Pflege und Patientensicherheit.',
      'Weiterbildungstage als Belohnung fördern Fachkompetenz und Mitarbeiterzufriedenheit.',
      'Pflegefachkräfte identifizieren sich stärker mit der Einrichtung.',
    ],
    nachteile: [
      'Pflegekräfte stehen bereits unter hohem Druck – Zieldruck kann zu Burnout beitragen.',
      'Nicht alle Qualitätsaspekte der Pflege sind in Zahlen messbar.',
      'Jährliche Gespräche decken Probleme im laufenden Jahr nur verzögert auf.',
    ],
  },
  {
    technik: 'mbd',
    sachverhalt: '{vorname} {nachname} ist Inhaberin einer Zahnarztpraxis. Die Praxismanagerin übernimmt eigenverantwortlich alle Verwaltungsaufgaben: Terminplanung, Abrechnungen, Bestellungen und Mitarbeiterdienstplan. {vorname} {nachname} selbst konzentriert sich vollständig auf die Patientenbehandlung.',
    vorteile: [
      'Klare Aufgabentrennung: {vorname} {nachname} kann sich auf {seine_ihre} ärztliche Tätigkeit konzentrieren.',
      'Praxismanagerin entwickelt umfassende Fachkompetenz im Praxismanagement.',
      'Verwaltungsaufgaben werden schnell und ohne Rückfragen erledigt.',
    ],
    nachteile: [
      'Wenn die Praxismanagerin ausfällt, fehlt eine vollständige Vertretung.',
      'Inhaber/-in verliert den Überblick über Kosten, Personalentscheidungen und Abläufe.',
      'Zu viel Verantwortung bei einer einzigen Person birgt ein Abhängigkeitsrisiko.',
    ],
  },
  {
    technik: 'mbe',
    sachverhalt: 'Bei {vorname} {nachname}s Softwareentwicklungsfirma arbeiten die Entwicklerinnen und Entwickler in selbst organisierten Teams. {Er_Sie} wird nur dann informiert, wenn ein Sprint-Ziel nicht erreicht wird oder eine kritische Sicherheitslücke gefunden wurde.',
    vorteile: [
      'Entwicklungsteams können agil und ohne Mikromanagement effizient arbeiten.',
      'Führungskraft erfährt nur wirklich relevante Informationen und kann schnell handeln.',
      'Selbstorganisation fördert Kreativität und Teamverantwortung.',
    ],
    nachteile: [
      'Probleme, die knapp unter dem Eskalationslevel liegen, werden zu spät sichtbar.',
      'Mitarbeitende erhalten kein regelmäßiges Feedback, was Weiterentwicklung hemmt.',
      'Schlechtes Teamklima oder interne Konflikte bleiben unbemerkt, bis es eskaliert.',
    ],
  },
];

// ============================================================================
// GLOBALE VARIABLE FÜR ZULETZT GENERIERTE AUFGABEN
// ============================================================================

let letzteGenerierteAufgaben = [];

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

function technikLabel(key) {
  const map = {
    mbo: 'Management by Objectives',
    mbd: 'Management by Delegation',
    mbe: 'Management by Exception',
  };
  return map[key] || key;
}

// ============================================================================
// MUSTERLÖSUNG ALS REINER TEXT (für KI-Prompt)
// ============================================================================

function erstelleLoesungsText(aufgabe) {
  const { fall, person } = aufgabe;
  const sachverhalt = ersetzeText(fall.sachverhalt, person);
  const vorteile = fall.vorteile.map(v => ersetzeText(v, person));
  const nachteile = fall.nachteile.map(n => ersetzeText(n, person));

  return `Führungstechnik: ${technikLabel(fall.technik)}\n` +
    `Vorteile:\n${vorteile.map((v, i) => `  ${i + 1}. ${v}`).join('\n')}\n` +
    `Nachteile:\n${nachteile.map((n, i) => `  ${i + 1}. ${n}`).join('\n')}`;
}

// ============================================================================
// KI-PROMPT MIT AKTUELLEN AUFGABEN UND LÖSUNGEN
// ============================================================================

function erstelleKiPromptText() {
  let aufgabenUndLoesungen = '';

  if (letzteGenerierteAufgaben.length === 0) {
    aufgabenUndLoesungen = '(Noch keine Aufgaben generiert. Bitte zuerst neue Aufgaben erstellen.)';
  } else {
    aufgabenUndLoesungen = letzteGenerierteAufgaben
      .map(({ fall, person }, idx) => {
        const sachverhalt = ersetzeText(fall.sachverhalt, person);
        return `Aufgabe ${idx + 1}:\n${sachverhalt}\n\nMusterlösung ${idx + 1}:\n${erstelleLoesungsText({ fall, person })}`;
      })
      .join('\n\n---\n\n');
  }

  return KI_ASSISTENT_PROMPT.replace('###AUFGABEN und LÖSUNGEN###', aufgabenUndLoesungen);
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Assistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst beim Verständnis der Personalführungstechniken Management by Objectives, Management by Delegation und Management by Exception.

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib KEINE fertigen Lösungen (Name der Führungstechnik oder Vor-/Nachteile) direkt vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Einschätzung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach dem Verhalten der Führungsperson im Fallbeispiel.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler die richtige Technik und Vor-/Nachteile erarbeitet hat, bestätige es.

Begrüße den Schüler freundlich und gib ihm eine Aufgabe vor, die du aus der folgenden Aufgabenliste zufällig auswählst.
Arbeitsauftrag:
"1. Bestimme die Führungstechnik (Management by Objectives, by Delegation oder by Exception).
2. Nenne je zwei Vor- und Nachteile dieser Führungstechnik."

Aufgabenliste:

###AUFGABEN und LÖSUNGEN###

Methodik bei Rückfragen:
- Was macht die Führungskraft im Alltag – gibt sie Ziele vor, überträgt sie Aufgaben oder greift sie nur bei Problemen ein?
- Wie viel Freiheit haben die Mitarbeitenden?
- Wann und wie oft schaltet sich die Führungskraft ein?
- Was könnte schieflaufen, wenn niemand kontrolliert?
- Was motiviert die Mitarbeitenden bei dieser Technik besonders?

Die drei Führungstechniken:

1. Management by Objectives (Führen durch Zielvereinbarung)
   - Führungskraft und Mitarbeitende legen gemeinsam messbare Ziele fest
   - Mitarbeitende entscheiden selbst, wie sie die Ziele erreichen
   - Oft verbunden mit Prämien oder Boni bei Zielerreichung
   - Typisch: jährliche Mitarbeitergespräche, Quartalsziele

2. Management by Delegation (Führen durch Aufgabenübertragung)
   - Führungskraft überträgt Aufgaben UND Entscheidungsbefugnis vollständig
   - Mitarbeitende handeln eigenverantwortlich in ihrem Bereich
   - Führungskraft greift nur bei grundlegenden Problemen ein
   - Typisch: Projektverantwortung, Filialverantwortung, Bereichsleitung

3. Management by Exception (Führen durch Ausnahmeprinzip)
   - Führungskraft greift nur bei klaren Abweichungen (Ausnahmen) ein
   - Es gibt festgelegte Grenzwerte – alles dazwischen regeln Mitarbeitende selbst
   - Keine Eingriffe solange alles im Normalbereich läuft
   - Typisch: Schwellenwerte für Budget, Qualitätskennzahlen, Eskalationsregeln

Typische Fehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- MbD ≠ MbE: Bei MbD wird eine ganze Aufgabe übertragen, bei MbE greift die Leitung erst bei Ausnahmen ein
- MbO ≠ „der Chef gibt Aufgaben vor" – entscheidend ist die gemeinsame Zielfindung
- Vorteile ≠ Nachteile einfach umformulieren – auf echte Unterschiede hinweisen

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, Fachbegriffe bei Bedarf erklären
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🎯📋🔍✅❓

Was du NICHT tust:
- Nenne die Führungstechnik nicht, bevor der Schüler sie selbst erarbeitet hat
- Gib keine fertigen Vor-/Nachteilelisten auf Anfrage – erkläre, dass eigenes Nachdenken das Ziel ist

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch eine andere Aufgabe üben? Dann geb ich dir einfach die nächste!"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Lösung selbst findet und versteht.
`;

// ============================================================================
// HAUPTFUNKTION – AUFGABEN GENERIEREN
// ============================================================================

function generiereAufgaben() {
  const anzahl    = parseInt(document.getElementById('anzahl').value) || 4;
  const filter    = document.getElementById('filter').value;
  const container = document.getElementById('Container');

  if (!container) return;

  let pool = filter === 'alle' ? faelle : faelle.filter(f => f.technik === filter);
  let gefuellt = [...pool];
  while (gefuellt.length < anzahl) gefuellt = [...gefuellt, ...pool];
  const ausgewaehlt = shuffle(gefuellt).slice(0, anzahl);

  const verwendeteNachname = [];

  letzteGenerierteAufgaben = ausgewaehlt.map((fall) => {
    const person = zufallsname(verwendeteNachname);
    verwendeteNachname.push(person.nachname);
    return { fall, person };
  });

 let aufgabenHTML = '<h2>Aufgaben</h2>' +
  '<ol><li>Bestimme jeweils die Führungstechnik (Management by Objectives, by Delegation oder by Exception).</li>' + 
  '<li>Nenne je zwei Vor- und Nachteile dieser Führungstechnik bezogen auf das Fallbeispiel.</li></ol>' +
  '<table style="width:100%; border-collapse:collapse;">' + 
  '<thead><tr>' + 
  '<th style="background:#4a6fa5; color:#fff; padding:8px 10px; text-align:left; border:1px solid #ccc;">Personenbeschreibung</th>' + 
  '</tr></thead><tbody>';

let loesungenHTML = '<h2>Lösungen</h2>';

letzteGenerierteAufgaben.forEach(({ fall, person }, idx) => {
  const sachverhalt = ersetzeText(fall.sachverhalt, person);
  const vorteile = fall.vorteile.map(v => ersetzeText(v, person));
  const nachteile = fall.nachteile.map(n => ersetzeText(n, person));

  aufgabenHTML += `
    <tr>
      <td style="border:1px solid #ccc; padding:8px 10px; font-style:italic;">${idx + 1}. ${sachverhalt}</td>
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #ccc; padding:8px 10px;">
        <strong>Führungstechnik:</strong><br><br>
        <strong>Vor- und Nachteile:</strong><br>
        <br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
      </td>
    </tr>`;

    loesungenHTML += `
      <div style="margin-top:1.5em; border:1px solid #ccc; padding:8px 12px; background:#fff; font-family:courier;">
        <strong>${idx + 1}. Führungstechnik: <span style="color:#2a5ea5;">${technikLabel(fall.technik)}</span></strong><br><br>
        <strong style="color:#2a7a2a;">✅ Vorteile:</strong><br>
        <ul style="margin:4px 0 8px 18px; padding:0;">
          ${vorteile.map(v => `<li style="margin-bottom:3px;">${v}</li>`).join('')}
        </ul>
        <strong style="color:#a00;">⚠️ Nachteile:</strong><br>
        <ul style="margin:4px 0 0 18px; padding:0;">
          ${nachteile.map(n => `<li style="margin-bottom:3px;">${n}</li>`).join('')}
        </ul>
      </div>`;
  });

  aufgabenHTML += '</tbody></table>';
  container.innerHTML = aufgabenHTML + loesungenHTML;

  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && vorschau.style.display !== 'none') {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ============================================================================
// KI-ASSISTENT FUNKTIONEN
// ============================================================================

function kopiereKiPrompt() {
  const promptText = erstelleKiPromptText();
  navigator.clipboard
    .writeText(promptText)
    .then(() => {
      const btn = document.getElementById('kiPromptKopierenBtn');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
      btn.classList.add('ki-prompt-btn--success');
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('ki-prompt-btn--success');
      }, 2500);
    })
    .catch(() => alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.'));
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    vorschau.textContent = erstelleKiPromptText();
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