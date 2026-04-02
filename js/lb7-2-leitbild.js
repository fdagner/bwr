// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================
let letzteGenerierteAufgaben = []; // Array – ein Eintrag pro generiertem Leitbild

// ============================================================================
// BRANCHEN MIT FIKTIVEN UNTERNEHMENSNAMEN
// ============================================================================
const branchen = [
  {
    id: 'baeckerei',
    label: 'Bäckerei',
    unternehmenstyp: 'produktion',
    firmen: ['Bäckerei Goldkruste', 'Bäckerei Sonnenkorn', 'Landbäckerei Huber & Söhne', 'Bäckerei Frischwerk', 'Backstube Kornfeld', 'Bäckerei Waldmeister'],
    intro: [
      'Die {firma} wurde vor über 30 Jahren als kleiner Familienbetrieb gegründet und hat sich seitdem zu einer bekannten Handwerksbäckerei in der Region entwickelt.',
      'Als traditionelle Handwerksbäckerei steht die {firma} seit Generationen für ehrliches Handwerk und hochwertige Backwaren.',
      'Die {firma} backt seit vielen Jahren täglich frische Backwaren für ihre Kundinnen und Kunden in der Region.',
      'Gegründet von einem leidenschaftlichen Bäckermeister, ist die {firma} heute aus dem Alltag der Region nicht mehr wegzudenken.',
    ],
  },
  {
    id: 'schreinerei',
    label: 'Schreinerei / Handwerk',
    unternehmenstyp: 'produktion',
    firmen: ['Schreinerei Holzgeist', 'Tischlerei Maier & Partner', 'Holzwerkstatt Bergmann', 'Schreinerei Eichwald', 'Tischlerei Fichtenau', 'Holzbau Steingraber'],
    intro: [
      'Die {firma} ist ein mittelständischer Handwerksbetrieb mit langjähriger Erfahrung in der Holzverarbeitung und Möbelherstellung.',
      'Als Familienbetrieb in zweiter Generation fertigt die {firma} individuelle Möbel und Innenausbauten für private und gewerbliche Kunden.',
      'Die {firma} verbindet seit ihrer Gründung traditionelles Handwerk mit modernen Fertigungsmethoden.',
      'Mit über zwei Dutzend erfahrenen Fachkräften fertigt die {firma} maßgeschneiderte Holzprodukte für Kunden aus der ganzen Region.',
    ],
  },
  {
    id: 'it',
    label: 'IT / Dienstleistung',
    unternehmenstyp: 'dienst',
    firmen: ['Digitalwerk GmbH', 'NetSolutions Müller', 'TechWave IT-Services', 'Bytes & Berg GmbH', 'Softline Solutions', 'Datacraft GmbH'],
    intro: [
      'Die {firma} ist ein modernes IT-Dienstleistungsunternehmen und unterstützt kleine und mittelständische Betriebe bei der Digitalisierung.',
      'Als innovatives Technologieunternehmen entwickelt die {firma} seit Jahren maßgeschneiderte Softwarelösungen für Unternehmen aus der Region.',
      'Die {firma} wurde von jungen Fachleuten gegründet und hat sich auf IT-Beratung und digitale Dienstleistungen spezialisiert.',
      'Mit einem erfahrenen Team aus Entwicklerinnen, Beratern und Designern begleitet die {firma} ihre Kunden durch den digitalen Wandel.',
    ],
  },
  {
    id: 'hotel',
    label: 'Hotel / Gastronomie',
    unternehmenstyp: 'dienst',
    firmen: ['Hotel Bergblick', 'Gasthof zur Linde', 'Landhotel Sonnenhang', 'Gasthaus Waldfrieden', 'Pension Alpenrose', 'Hotel Seeblick'],
    intro: [
      'Das {firma} liegt mitten in der bayerischen Landschaft und empfängt seine Gäste seit vielen Jahren mit herzlicher Gastfreundschaft.',
      'Als familiengeführtes Haus legt das {firma} großen Wert auf persönlichen Service und regionale Küche.',
      'Das {firma} bietet seinen Gästen eine entspannte Atmosphäre – fernab vom Alltag, mitten in der Natur.',
      'Seit seiner Eröffnung ist das {firma} ein beliebtes Ziel für Erholungssuchende und Geschäftsreisende gleichermaßen.',
    ],
  },
  {
    id: 'gartenbau',
    label: 'Gartenbau / Landwirtschaft',
    unternehmenstyp: 'produktion',
    firmen: ['Gärtnerei Grünzeit', 'Hofgut Feldblume', 'Gartenbau Steinmetz', 'Naturhof Brunntal', 'Gärtnerei Blütenreich', 'Landgut Grüntal'],
    intro: [
      'Die {firma} bewirtschaftet seit mehreren Generationen ihre Felder und Gewächshäuser in der Region und versorgt den lokalen Markt mit frischem Gemüse und Pflanzen.',
      'Als ökologisch ausgerichteter Betrieb setzt die {firma} auf naturnahe Anbaumethoden und kurze Wege vom Feld zum Kunden.',
      'Die {firma} verbindet moderne Anbautechnik mit einem tiefen Respekt für Natur und Boden.',
      'Mit einer langen Tradition in der Pflanzenanzucht hat sich die {firma} als verlässlicher Partner für Privatgärten und Kommunen etabliert.',
    ],
  },
  {
    id: 'einzelhandel',
    label: 'Einzelhandel',
    unternehmenstyp: 'dienst',
    firmen: ['Kaufhaus Stadtmitte', 'Markt am Tor', 'Handelshaus Keller', 'Fachmarkt Zentral', 'Warenhaus Breitmayer', 'Einkaufshaus Löwenmarkt'],
    intro: [
      'Die {firma} ist seit Jahrzehnten eine feste Größe im regionalen Einzelhandel und bietet seinen Kundinnen und Kunden ein breites Sortiment.',
      'Als inhabergeführtes Handelshaus legt die {firma} besonderen Wert auf persönliche Beratung und ein sorgfältig ausgewähltes Warenangebot.',
      'Die {firma} versteht sich als Nahversorger der Region und möchte für seine Kunden immer der erste Ansprechpartner sein.',
      'Gegründet als kleines Fachgeschäft, ist die {firma} heute ein modernes Einkaufsziel mit einem vielfältigen Angebot für die ganze Familie.',
    ],
  },
  // ── NEU: PRODUKTIONSUNTERNEHMEN ──────────────────────────────────────────
  {
    id: 'metallbau',
    label: 'Metallverarbeitung / Maschinenbau',
    unternehmenstyp: 'produktion',
    firmen: ['Metallwerk Kastner GmbH', 'Präzisionsbau Feldner', 'Maschinenfabrik Steiner & Co.', 'Stahlwerk Haberland', 'Metallbau Kronauer', 'Feinmechanik Bergtal GmbH'],
    intro: [
      'Die {firma} ist ein mittelständisches Produktionsunternehmen und stellt seit Jahrzehnten Metallteile und Baugruppen für Industrie und Handwerk her.',
      'Als spezialisierter Zulieferer beliefert die {firma} Kunden aus der Automobil-, Maschinen- und Elektrobranche mit präzise gefertigten Metallkomponenten.',
      'Die {firma} wurde als Familienbetrieb gegründet und hat sich durch hohe Fertigungsqualität und zuverlässige Lieferzeiten einen guten Ruf erarbeitet.',
      'Mit modernen CNC-Maschinen und einem erfahrenen Fachteam fertigt die {firma} anspruchsvolle Metallteile nach Kundenzeichnung.',
    ],
  },
  {
    id: 'kunststoff',
    label: 'Kunststoff- / Verpackungsproduktion',
    unternehmenstyp: 'produktion',
    firmen: ['Kunststoffwerk Dornau GmbH', 'Packtech Riedel', 'Formgebung Westner & Söhne', 'Plastiform GmbH', 'Verpackungswerk Lichtfeld', 'Polyform Technik GmbH'],
    intro: [
      'Die {firma} produziert Kunststoffteile und Verpackungslösungen für Kunden aus Lebensmittel-, Medizin- und Industriebranchen.',
      'Als modernes Produktionsunternehmen fertigt die {firma} maßgeschneiderte Verpackungen und Formteile aus Kunststoff für Kunden aus aller Welt.',
      'Die {firma} verbindet seit ihrer Gründung hohe Produktionseffizienz mit dem Anspruch, immer umweltfreundlichere Materialien und Prozesse einzusetzen.',
      'Mit einer eigenen Entwicklungsabteilung und modernsten Spritzgussmaschinen ist die {firma} ein gefragter Partner in der Verpackungsbranche.',
    ],
  },
  {
    id: 'lebensmittel',
    label: 'Lebensmittelproduktion',
    unternehmenstyp: 'produktion',
    firmen: ['Molkerei Bergfrisch GmbH', 'Fleischerei Waldmann & Söhne', 'Lebensmittelwerk Grundtal', 'Käserei Alpenglück', 'Konservenfabrik Röthlein', 'Nudelfabrik Sonnental'],
    intro: [
      'Die {firma} produziert hochwertige Lebensmittel und beliefert Supermärkte, Großküchen und Direktkunden in der gesamten Region.',
      'Als regionaler Lebensmittelproduzent setzt die {firma} auf kurze Lieferketten, frische Zutaten und schonende Verarbeitungsmethoden.',
      'Die {firma} verarbeitet seit vielen Jahren Rohstoffe aus der Region zu schmackhaften Produkten – mit viel Sorgfalt und ohne unnötige Zusatzstoffe.',
      'Gegründet als kleiner Familienbetrieb, hat sich die {firma} zu einem wichtigen Lebensmittelproduzenten für die Region entwickelt.',
    ],
  },
  {
    id: 'druckerei',
    label: 'Druckerei / Medienproduktion',
    unternehmenstyp: 'produktion',
    firmen: ['Druckerei Farbwerk GmbH', 'Medienhaus Lettner', 'Printcenter Bergmann', 'Druckwerk Südtal', 'Grafik & Druck Vogel', 'Offsetdruck Steinmetz GmbH'],
    intro: [
      'Die {firma} produziert Druckerzeugnisse aller Art – von Flyern und Broschüren bis hin zu Verpackungsdrucken für die Industrie.',
      'Als moderner Druckdienstleister verbindet die {firma} handwerkliches Können mit digitaler Drucktechnik auf höchstem Niveau.',
      'Die {firma} begleitet ihre Kunden von der Idee bis zum fertigen Druckprodukt und legt dabei besonderen Wert auf Termintreue und Qualität.',
      'Seit ihrer Gründung ist die {firma} ein verlässlicher Partner für Unternehmen, Behörden und Privatpersonen in der Region.',
    ],
  },
  {
    id: 'textil',
    label: 'Textil- / Bekleidungsproduktion',
    unternehmenstyp: 'produktion',
    firmen: ['Textilfabrik Weberhof GmbH', 'Nähwerk Sonnfeld', 'Bekleidungswerk Kistler', 'Strickerei Alpenmode', 'Textilmanufaktur Brunntal', 'Weberei Feldkamp GmbH'],
    intro: [
      'Die {firma} stellt Textilien und Bekleidung für den Groß- und Einzelhandel her und legt dabei besonderen Wert auf Qualität und faire Produktionsbedingungen.',
      'Als traditionsreicher Textilbetrieb produziert die {firma} Stoffe, Arbeitskleidung und Heimtextilien für Kunden aus dem In- und Ausland.',
      'Die {firma} verbindet moderne Produktionstechnik mit dem Anspruch, Textilien herzustellen, die langlebig, fair und so umweltfreundlich wie möglich sind.',
      'Gegründet als Familienmanufaktur, hat sich die {firma} zu einem angesehenen Produktionsbetrieb mit über 80 Mitarbeiterinnen und Mitarbeitern entwickelt.',
    ],
  },
  {
    id: 'holzverarbeitung',
    label: 'Holzverarbeitung / Sägewerk',
    unternehmenstyp: 'produktion',
    firmen: ['Sägewerk Waldtal GmbH', 'Holzwerk Berghammer', 'Forstbetrieb & Säge Gruber', 'Holzmanufaktur Tannengrün', 'Bretterwerk Fichtelbach', 'Holzindustrie Bergkiefer GmbH'],
    intro: [
      'Die {firma} verarbeitet heimisches Holz zu Schnittholz, Balken und Holzprodukten für den Bau- und Handwerksbereich.',
      'Als regionaler Forstbetrieb und Sägewerk bezieht die {firma} ihr Holz ausschließlich aus nachhaltig bewirtschafteten Wäldern der Region.',
      'Die {firma} steht für ressourcenschonende Holzverarbeitung – von der Fällung bis zum fertigen Produkt bleibt alles in der Region.',
      'Seit mehreren Generationen bewirtschaftet und verarbeitet die {firma} Holz aus der Region und versorgt das lokale Handwerk mit hochwertigen Materialien.',
    ],
  },
];

// ============================================================================
// SATZBAUSTEINE – ÖKONOMISCHE ZIELE
// typ: 'alle'        → passt für jeden Unternehmenstyp
// typ: 'produktion'  → nur für Produktions- / Handwerksbetriebe
// typ: 'dienst'      → nur für Dienstleistung / IT / Handel / Gastronomie
// ============================================================================
const saetze_okon = [
  // ── für alle ──
  { typ: 'alle', satz: 'Unser wichtigstes Ziel ist es, langfristig Gewinne zu erwirtschaften, um den Betrieb für die Zukunft zu sichern.',                              kw: 'Gewinn erwirtschaften' },
  { typ: 'alle', satz: 'Wir wollen unseren Umsatz kontinuierlich steigern, um weiter in unser Unternehmen investieren zu können.',                                       kw: 'Umsatz steigern' },
  { typ: 'alle', satz: 'Durch effiziente Abläufe und sorgfältige Planung halten wir unsere Kosten so niedrig wie möglich, ohne dabei an Qualität zu sparen.',            kw: 'Kosten senken / Effizienz' },
  { typ: 'alle', satz: 'Wir möchten unseren Marktanteil ausbauen und für noch mehr Kundinnen und Kunden die erste Wahl sein.',                                           kw: 'Marktanteil erhöhen' },
  { typ: 'alle', satz: 'Zufriedene Kundinnen und Kunden sind unser größtes Kapital – daher legen wir höchsten Wert auf Qualität und freundlichen Service.',              kw: 'Kundenzufriedenheit / Qualität' },
  { typ: 'alle', satz: 'Durch ein attraktives Preis-Leistungs-Verhältnis wollen wir unsere Kunden langfristig an uns binden.',                                           kw: 'Kundenbindung / Preis-Leistung' },
  { typ: 'alle', satz: 'Ein stabiler Gewinn sichert nicht nur das Unternehmen selbst, sondern auch die Arbeitsplätze unserer Mitarbeiterinnen und Mitarbeiter.',          kw: 'Gewinn / Arbeitsplatzsicherung' },
  { typ: 'alle', satz: 'Unser Ziel ist solides, planbares Wachstum – durch Verlässlichkeit und Vertrauen, nicht auf Kosten der Qualität.',                               kw: 'nachhaltiges Wachstum' },
  { typ: 'alle', satz: 'Wir analysieren regelmäßig unsere Leistungen und Zahlen, um Verbesserungspotenziale frühzeitig zu erkennen und umzusetzen.',                     kw: 'Controlling / Leistungsoptimierung' },
  { typ: 'alle', satz: 'Termintreue und Zuverlässigkeit sind für uns keine leeren Versprechen, sondern die Grundlage jeder guten Geschäftsbeziehung.',                   kw: 'Termintreue / Zuverlässigkeit' },
  { typ: 'alle', satz: 'Durch gezielte Werbung und einen starken Markenauftritt wollen wir unseren Bekanntheitsgrad steigern und neue Zielgruppen ansprechen.',           kw: 'Marketing / Markenbekanntheit' },
  { typ: 'alle', satz: 'Um unsere Wettbewerbsposition zu stärken, beobachten wir den Markt genau und passen unser Angebot regelmäßig an.',                               kw: 'Marktbeobachtung / Wettbewerbsfähigkeit' },
  { typ: 'alle', satz: 'Wir streben eine hohe Wiederkaufsrate an – ein Kunde, der einmal bei uns kauft, soll gerne wiederkommen.',                                       kw: 'Kundenbindung / Wiederkaufsrate' },
  // ── nur Produktion / Handwerk ──
  { typ: 'produktion', satz: 'Wir investieren regelmäßig in neue Maschinen und Fertigungsanlagen, um unsere Produktionskapazität und Qualität weiter zu steigern.',     kw: 'Investitionen in Maschinen' },
  { typ: 'produktion', satz: 'Wir setzen auf eine schlanke Produktion ohne Verschwendung – jeder Arbeitsschritt soll einen echten Mehrwert schaffen.',                  kw: 'Produktionseffizienz' },
  { typ: 'produktion', satz: 'Durch den Einsatz moderner Planungssoftware optimieren wir unsere Lagerbestände und vermeiden teure Überproduktion.',                     kw: 'Lageroptimierung / Kostenreduktion' },
  { typ: 'produktion', satz: 'Wir pflegen enge Beziehungen zu unseren Rohstofflieferanten, um stabile Einkaufspreise und zuverlässige Materialversorgung zu sichern.',  kw: 'Lieferantenmanagement' },
  { typ: 'produktion', satz: 'Ein breites Produktspektrum und kurze Lieferzeiten ermöglichen es uns, schnell und flexibel auf Aufträge zu reagieren.',                  kw: 'Flexibilität / Lieferfähigkeit' },
  { typ: 'produktion', satz: 'Durch strenge Qualitätskontrollen stellen wir sicher, dass jedes unserer Produkte den hohen Anforderungen unserer Kunden entspricht.',   kw: 'Qualitätssicherung / Kontrolle' },
  { typ: 'produktion', satz: 'Wir entwickeln unser Produktangebot ständig weiter, um den sich verändernden Anforderungen des Marktes gerecht zu werden.',               kw: 'Produktentwicklung / Innovation' },
  // ── nur Dienstleistung / IT / Handel / Gastronomie ──
  { typ: 'dienst', satz: 'Wir investieren gezielt in moderne Software und digitale Werkzeuge, um unsere Dienstleistungen effizienter und besser zu machen.',            kw: 'Investitionen in Technologie' },
  { typ: 'dienst', satz: 'Durch individuelle Beratung und maßgeschneiderte Lösungen heben wir uns von Mitbewerbern ab.',                                                kw: 'individuelle Beratung / Differenzierung' },
  { typ: 'dienst', satz: 'Wir wollen neue Auftraggeber und Kundengruppen erschließen, indem wir unser Leistungsangebot gezielt ausbauen.',                              kw: 'Neukundengewinnung / Angebotserweiterung' },
  { typ: 'dienst', satz: 'Schnelle Reaktionszeiten und unkomplizierter Service sind für uns der Schlüssel zu langfristiger Kundenzufriedenheit.',                       kw: 'Schneller Service / Kundennähe' },
  { typ: 'dienst', satz: 'Wir entwickeln unser Dienstleistungsangebot laufend weiter, um auf neue Trends und Kundenwünsche eingehen zu können.',                        kw: 'Angebotsentwicklung / Innovation' },
  { typ: 'dienst', satz: 'Durch Kooperationen mit anderen Unternehmen erweitern wir unser Netzwerk und erschließen neue Geschäftsmöglichkeiten.',                       kw: 'Kooperationen / Netzwerk' },
];

// ============================================================================
// SATZBAUSTEINE – ÖKOLOGISCHE ZIELE
// ============================================================================
const saetze_oeko = [
  // ── für alle ──
  { typ: 'alle', satz: 'Wir achten darauf, so wenig Energie wie möglich zu verbrauchen, und beziehen unseren Strom vollständig aus erneuerbaren Quellen.',              kw: 'Energiesparen / Ökostrom' },
  { typ: 'alle', satz: 'Unser Ziel ist es, unseren CO₂-Ausstoß in den nächsten Jahren deutlich zu senken – durch sparsamere Fahrzeuge und optimierte Abläufe.',        kw: 'CO₂-Reduktion / Klimaschutz' },
  { typ: 'alle', satz: 'Abfälle werden bei uns sorgfältig getrennt und so weit wie möglich wiederverwertet.',                                                           kw: 'Abfallvermeidung / Recycling' },
  { typ: 'alle', satz: 'Durch moderne Wärmedämmung und energieeffiziente Geräte sparen wir jedes Jahr eine beträchtliche Menge an Heizenergie.',                       kw: 'Energieeffizienz / Gebäude' },
  { typ: 'alle', satz: 'Wir setzen schrittweise auf Elektrofahrzeuge, um den Schadstoffausstoß unseres Betriebs zu verringern.',                                        kw: 'Elektromobilität' },
  { typ: 'alle', satz: 'Wir arbeiten an einem Konzept zur Begrünung unseres Betriebsgeländes, um Insekten und anderen Tieren einen Lebensraum zu bieten.',              kw: 'Biodiversität / Naturflächen' },
  { typ: 'alle', satz: 'Unsere Mitarbeitenden werden regelmäßig für den bewussten Umgang mit Ressourcen sensibilisiert, weil Umweltschutz bei uns alle angeht.',        kw: 'Umweltbewusstsein / Schulungen' },
  // ── nur Produktion / Handwerk ──
  { typ: 'produktion', satz: 'Unsere Verpackungen bestehen aus recycelbaren oder kompostierbaren Materialien – auf unnötiges Plastik verzichten wir konsequent.',       kw: 'Recycling / plastikfreie Verpackung' },
  { typ: 'produktion', satz: 'Wir beziehen unsere Rohstoffe bevorzugt von regionalen Lieferanten, um lange Transportwege und den damit verbundenen CO₂-Ausstoß zu vermeiden.', kw: 'Regionale Rohstoffe / CO₂-Reduktion' },
  { typ: 'produktion', satz: 'Bei der Auswahl unserer Materialien achten wir auf anerkannte Umweltzertifikate und lehnen Stoffe aus nicht nachhaltigem Anbau ab.',      kw: 'Nachhaltige Beschaffung / Zertifizierung' },
  { typ: 'produktion', satz: 'Produktionsabfälle werden bei uns so weit wie möglich als Sekundärrohstoff weiterverwendet, statt sie zu entsorgen.',                     kw: 'Kreislaufwirtschaft / Rohstoffeffizienz' },
  { typ: 'produktion', satz: 'Wir reduzieren den Wasserverbrauch in unserer Produktion durch geschlossene Kreisläufe und sparsame Anlagentechnik.',                     kw: 'Wassersparen / Ressourcenschonung' },
  { typ: 'produktion', satz: 'Lärm- und Schadstoffemissionen unserer Anlagen werden regelmäßig gemessen und durch technische Maßnahmen so weit wie möglich gesenkt.',  kw: 'Emissionsreduzierung / Umweltschutz' },
  // ── nur Dienstleistung / IT / Handel ──
  { typ: 'dienst', satz: 'Wir drucken so wenig wie möglich und setzen auf digitale Prozesse, um Papierverbrauch und Müll in unserem Büro zu reduzieren.',              kw: 'Papierlos / digitale Prozesse' },
  { typ: 'dienst', satz: 'Unsere Büroausstattung wird auf Energieeffizienz geprüft – alte Geräte werden durch stromsparende Modelle ersetzt.',                         kw: 'Energieeffiziente Ausstattung' },
  { typ: 'dienst', satz: 'Wo immer möglich ermöglichen wir unseren Mitarbeitenden, von zu Hause zu arbeiten, um Pendelwege und damit den CO₂-Ausstoß zu reduzieren.',  kw: 'Homeoffice / CO₂-Reduktion' },
  { typ: 'dienst', satz: 'Wir beziehen unsere Waren und Materialien bevorzugt von Lieferanten aus der Region, um Transportwege kurz zu halten.',                       kw: 'Regionale Beschaffung / kurze Wege' },
];

// ============================================================================
// SATZBAUSTEINE – SOZIALE ZIELE
// ============================================================================
const saetze_soz = [
  // ── für alle ──
  { typ: 'alle', satz: 'Unsere Mitarbeiterinnen und Mitarbeiter erhalten faire Löhne, die deutlich über dem gesetzlichen Mindestlohn liegen.',                           kw: 'Faire Entlohnung' },
  { typ: 'alle', satz: 'Wir bieten regelmäßige Weiterbildungen an, damit sich unser Team fachlich und persönlich weiterentwickeln kann.',                               kw: 'Mitarbeiterweiterbildung' },
  { typ: 'alle', satz: 'Jedes Jahr bilden wir junge Menschen in unserem Betrieb aus, weil wir Verantwortung für die Zukunft der Region übernehmen wollen.',             kw: 'Ausbildungsplätze / Jugendförderung' },
  { typ: 'alle', satz: 'Flexible Arbeitszeiten und Rücksicht auf familiäre Situationen sind für uns selbstverständlich – denn zufriedene Mitarbeiter leisten gute Arbeit.', kw: 'Work-Life-Balance / Familienfreundlichkeit' },
  { typ: 'alle', satz: 'Wir unterstützen lokale Vereine, Schulen und gemeinnützige Projekte, weil wir uns als Teil unserer Gemeinschaft verstehen.',                   kw: 'Gesellschaftliches Engagement' },
  { typ: 'alle', satz: 'Bei uns wird jede Person mit Respekt behandelt – unabhängig von Herkunft, Alter, Geschlecht oder Religion.',                                   kw: 'Chancengleichheit / Respekt' },
  { typ: 'alle', satz: 'Ein gutes Betriebsklima, in dem sich alle wohlfühlen, ist uns genauso wichtig wie wirtschaftlicher Erfolg.',                                   kw: 'Mitarbeiterzufriedenheit / Betriebsklima' },
  { typ: 'alle', satz: 'Neue Kolleginnen und Kollegen werden bei uns sorgfältig eingearbeitet, damit sie sich von Anfang an willkommen fühlen.',                       kw: 'Einarbeitung / Willkommenskultur' },
  { typ: 'alle', satz: 'Wir kooperieren mit regionalen Schulen, um Schülerinnen und Schüler frühzeitig für Berufe in unserem Betrieb zu begeistern.',                 kw: 'Nachwuchsförderung / Schulkooperation' },
  { typ: 'alle', satz: 'Wir tragen soziale Verantwortung über unsere Betriebsgrenzen hinaus und spenden jährlich einen Teil unseres Gewinns für gemeinnützige Zwecke.', kw: 'Soziales Engagement / Spenden' },
  // ── nur Produktion / Handwerk ──
  { typ: 'produktion', satz: 'Arbeitssicherheit hat in unserem Produktionsbetrieb höchste Priorität: Schutzausrüstung, regelmäßige Unterweisungen und sichere Maschinen sind für uns selbstverständlich.', kw: 'Arbeitssicherheit / Unfallschutz' },
  { typ: 'produktion', satz: 'Gesundheitsförderung ist uns wichtig – ergonomische Arbeitsplätze und regelmäßige Vorsorgeuntersuchungen schützen unsere Mitarbeitenden.', kw: 'Gesundheitsförderung / Ergonomie' },
  { typ: 'produktion', satz: 'Wir ermöglichen unseren Fachkräften, eigene Ideen in den Fertigungsprozess einzubringen, weil Verbesserungen oft direkt aus der Werkstatt kommen.', kw: 'Mitbestimmung / Eigenverantwortung' },
  // ── nur Dienstleistung / IT / Handel ──
  { typ: 'dienst', satz: 'Arbeitssicherheit bedeutet bei uns auch psychische Gesundheit: Wir achten darauf, dass niemand dauerhaft überlastet wird.',                  kw: 'Psychische Gesundheit / Arbeitssicherheit' },
  { typ: 'dienst', satz: 'Wir ermöglichen unseren Mitarbeitenden, eigene Ideen und Vorschläge einzubringen – denn gute Lösungen entstehen oft im Team.',               kw: 'Mitbestimmung / Teamkultur' },
  { typ: 'dienst', satz: 'Homeoffice und flexible Arbeitsorte sind bei uns keine Ausnahme, sondern fester Bestandteil moderner Arbeitsgestaltung.',                    kw: 'Homeoffice / flexible Arbeit' },
];

// ============================================================================
// FÜLLSÄTZE / EINLEITUNGSSÄTZE (neutral)
// ============================================================================
const saetze_fuell = [
  'Wir verstehen uns nicht nur als Wirtschaftsunternehmen, sondern als Teil unserer Region und Gesellschaft.',
  'Vertrauen, Ehrlichkeit und Verlässlichkeit bilden das Fundament unseres unternehmerischen Handelns.',
  'Unser Leitbild ist kein Papier, das in einer Schublade liegt – es lebt in der täglichen Arbeit unserer Mitarbeiterinnen und Mitarbeiter.',
  'Wir glauben daran, dass wirtschaftlicher Erfolg und Verantwortung gegenüber Mensch und Natur kein Widerspruch sind.',
  'Seit unserer Gründung leitet uns die Überzeugung, dass gute Arbeit, Fairness und Qualität langfristig belohnt werden.',
];

// ============================================================================
// ABSCHLUSSSÄTZE
// ============================================================================
const saetze_schluss = [
  'Dieses Leitbild gibt uns täglich Orientierung – und ist Versprechen an unsere Kunden, Mitarbeiter und die Region.',
  'Wir überprüfen unser Handeln regelmäßig an diesen Grundsätzen und entwickeln uns gemeinsam weiter.',
  'Unser Leitbild ist Anspruch und Verpflichtung zugleich – für heute und für künftige Generationen.',
];

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

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickN(arr, n) { return shuffle(arr).slice(0, n); }

function rand(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

// Gibt alle Sätze zurück, die zum Unternehmenstyp passen (typ='alle' + passender typ)
function filterPool(pool, unternehmenstyp) {
  return pool.filter(s => s.typ === 'alle' || s.typ === unternehmenstyp);
}

// ============================================================================
// LEITBILD ZUSAMMENBAUEN
// ============================================================================
function erstelleLeitbild(branche) {
  const firma    = pick(branche.firmen);
  const introTpl = pick(branche.intro);
  const intro    = introTpl.replace(/\{firma\}/g, firma);
  const ut       = branche.unternehmenstyp; // 'produktion' oder 'dienst'

  const poolOkon = filterPool(saetze_okon, ut);
  const poolOeko = filterPool(saetze_oeko, ut);
  const poolSoz  = filterPool(saetze_soz,  ut);

  const gewaehltOkon = pickN(poolOkon, rand(4, 5));
  const gewaehltOeko = pickN(poolOeko, rand(2, 3));
  const gewaehltSoz  = pickN(poolSoz,  rand(2, 3));

  const sektionen = [
    { key: 'wirtschaft', saetze: gewaehltOkon },
    { key: 'umwelt',     saetze: gewaehltOeko },
    { key: 'sozial',     saetze: gewaehltSoz  },
  ];

  const fuell  = pick(saetze_fuell);
  const schluss = pick(saetze_schluss);

  return {
    branche: branche.label,
    firma,
    intro,
    fuell,
    sektionen,
    schluss,
    loesung: {
      okon: sektionen.find(s => s.key === 'wirtschaft').saetze.map(s => s.kw),
      oeko: sektionen.find(s => s.key === 'umwelt').saetze.map(s => s.kw),
      soz:  sektionen.find(s => s.key === 'sozial').saetze.map(s => s.kw),
    },
  };
}

// ============================================================================
// FARBEN FÜR LÖSUNGS-BADGES
// ============================================================================
const FARBEN = {
  okon: { bg: '#e65100', text: '#fff' },
  oeko: { bg: '#2e7d32', text: '#fff' },
  soz:  { bg: '#1565c0', text: '#fff' },
};

function badge(kw, farbe) {
  return `<span style="background:${farbe.bg}; color:${farbe.text}; padding:2px 9px; border-radius:3px; font-size:0.82rem; font-weight:bold; display:inline-block; margin:2px 2px 2px 0;">${kw}</span>`;
}

// ============================================================================
// HILFSFUNKTION: EIN LEITBILD ALS HTML-BLOCK RENDERN
// ============================================================================
function renderLeitbildBlock(lb, nr, gesamt) {
  const titel = gesamt > 1 ? `Aufgabe ${nr}` : 'Aufgabe';
  let html = '';

  // Überschrift
  html += `<h2 style="margin-top:${nr > 1 ? '2.5em' : '0'};">${titel}</h2>`;
  html += `<p style="font-style:italic; color:#555; font-size:0.95rem;">
    Lies das folgende Unternehmens-Leitbild sorgfältig durch.
    Leite daraus in Stichworten die
    <strong>ökonomischen</strong>, <strong>ökologischen</strong> und <strong>sozialen</strong>
    Ziele des Unternehmens ab.
  </p>`;

  // Leitbild-Kasten
  html += `<div style="border:1px solid #ccc; border-left:5px solid #1a237e; border-radius:6px; padding:20px 24px; margin:16px 0; background:#fafafa; max-width:680px;">`;
  html += `<h3 style="margin-bottom:4px; color:#1a237e;">${lb.firma}</h3>`;
  html += `<p style="color:#546e7a; font-size:0.85rem; margin-bottom:14px; font-style:italic;">Branche: ${lb.branche}</p>`;
  html += `<p style="margin-bottom:14px;">${lb.intro} ${lb.fuell}</p>`;
  const alleSaetze = shuffle(lb.sektionen.flatMap(sek => sek.saetze.map(s => s.satz)));
  const mitte = Math.ceil(alleSaetze.length / 2);
  html += `<p style="margin-bottom:10px;">${alleSaetze.slice(0, mitte).join(' ')}</p>`;
  html += `<p style="margin-bottom:4px;">${alleSaetze.slice(mitte).join(' ')}</p>`;
  html += `<p style="margin-top:16px; font-style:italic; color:#546e7a;">${lb.schluss}</p>`;
  html += `</div>`;

  // Ausfülltabelle
  const tabellenTitel = gesamt > 1 ? `Tabelle ${nr} – Ziele herausarbeiten` : 'Tabelle – Ziele herausarbeiten';
  html += `<h3>${tabellenTitel}</h3>`;
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">`;
  html += `<thead><tr style="background:#eee;">
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left; width:33%;">Ökonomische Ziele<br><span style="font-weight:400; font-size:0.83rem;">(wirtschaftlich)</span></th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left; width:33%;">Ökologische Ziele<br><span style="font-weight:400; font-size:0.83rem;">(Umwelt)</span></th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left; width:33%;">Soziale Ziele<br><span style="font-weight:400; font-size:0.83rem;">(Menschen)</span></th>
  </tr></thead><tbody>`;
  for (let i = 0; i < 5; i++) {
    html += `<tr>
      <td style="border:1px solid #ccc; padding:6px 10px; height:34px;">&nbsp;</td>
      <td style="border:1px solid #ccc; padding:6px 10px; height:34px;">&nbsp;</td>
      <td style="border:1px solid #ccc; padding:6px 10px; height:34px;">&nbsp;</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  // Lösungstabelle
  const loesungTitel = gesamt > 1 ? `Lösung ${nr}` : 'Lösung';
  html += `<h2 style="margin-top:2em;">${loesungTitel}</h2>`;
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">`;
  html += `<thead><tr style="background:#eee;">
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left; width:33%;">Ökonomische Ziele</th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left; width:33%;">Ökologische Ziele</th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left; width:33%;">Soziale Ziele</th>
  </tr></thead><tbody><tr>`;
  html += `<td style="border:1px solid #ccc; padding:7px 10px; vertical-align:top;">${lb.loesung.okon.map(kw => badge(kw, FARBEN.okon)).join('')}</td>`;
  html += `<td style="border:1px solid #ccc; padding:7px 10px; vertical-align:top;">${lb.loesung.oeko.map(kw => badge(kw, FARBEN.oeko)).join('')}</td>`;
  html += `<td style="border:1px solid #ccc; padding:7px 10px; vertical-align:top;">${lb.loesung.soz.map(kw => badge(kw, FARBEN.soz)).join('')}</td>`;
  html += `</tr></tbody></table>`;

  return html;
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================
function zeigeZufaelligeLeitbilder() {
  const container = document.getElementById('Container');
  if (!container) return;

  const typFilter = document.getElementById('typFilter')?.value || 'alle';
  const anzahl    = parseInt(document.getElementById('anzahlLeitbilder')?.value) || 1;

  let poolBranchen = branchen;
  if (typFilter !== 'alle') poolBranchen = branchen.filter(b => b.id === typFilter);
  if (poolBranchen.length === 0) poolBranchen = branchen;

  // Branchen für alle Leitbilder ziehen (mit Zurücklegen, damit auch bei wenigen Branchen viele möglich sind)
  letzteGenerierteAufgaben = [];
  const genutzteBranchen = [];
  for (let i = 0; i < anzahl; i++) {
    // Bevorzugt noch nicht genutzte Branchen, um Wiederholungen zu vermeiden
    const verfuegbar = poolBranchen.filter(b => !genutzteBranchen.includes(b.id));
    const branche    = pick(verfuegbar.length > 0 ? verfuegbar : poolBranchen);
    genutzteBranchen.push(branche.id);
    letzteGenerierteAufgaben.push(erstelleLeitbild(branche));
  }

  let html = '';
  letzteGenerierteAufgaben.forEach((lb, idx) => {
    html += renderLeitbildBlock(lb, idx + 1, anzahl);
  });

  container.innerHTML = html;

  // KI-Prompt aktualisieren falls sichtbar
  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && vorschau.style.display !== 'none') {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================
const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Lernassistent für Schüler der bayerischen Realschule (BwR, Klasse 7). Du hilfst beim Verstehen von Unternehmens-Leitbildern und Unternehmenszielen.

Aufgabe:
- Gib KEINE fertigen Lösungen direkt vor.
- Führe die Schülerinnen und Schüler durch gezielte Fragen zur richtigen Zuordnung.
- Ziel: eigenes Denken fördern, Lernfortschritt erzielen.

Wichtige Begriffe (korrekt verwenden!):
- Ökonomisches Ziel = wirtschaftliches Ziel (Gewinn, Umsatz, Kosten, Marktanteil, Kunden …)
- Ökologisches Ziel = Umweltziel (Energie sparen, Müll reduzieren, CO₂ senken …)
- Soziales Ziel = Ziel für Menschen (Mitarbeiter, Ausbildung, Fairness, Gesellschaft …)

Pädagogischer Ansatz:
- Frage, worum es in dem Satz geht: Geld verdienen? Umwelt schützen? Menschen helfen?
- Stelle gezielte Rückfragen.
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst die richtige Kategorie nennt, bestätige ihn.

Begrüße den Schüler freundlich und wähle zufällig ein Leitbild aus der Liste aus.
Arbeitsauftrag: "Lies das Leitbild. Leite daraus ökonomische, ökologische und soziales Ziele ab. Notiere in Stichpunkten."
Wenn eine Aufgabe abgeschlossen ist, frage: „Möchtest du mit dem nächsten Leitbild weitermachen?"

Alle Leitbilder mit Musterlösungen:
###AUFGABEN und LÖSUNGEN###

Methodik bei Rückfragen:
- Geht es in diesem Satz ums Geldverdienen, Sparen oder Wachsen? → ökonomisch
- Geht es darum, die Umwelt zu schützen oder Ressourcen zu schonen? → ökologisch
- Geht es um Mitarbeiter, Fairness, Ausbildung oder die Gesellschaft? → sozial

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, kurze Sätze
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 💰🌿🤝🏢

Was du NICHT tust:
- Nenne die Kategorie nicht direkt, bevor der Schüler selbst argumentiert hat
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort"

Am Ende: „Möchtest du ein neues Leitbild üben?" --> wähle ein anderes, zufälliges Leitbild aus der Liste aus.
`;

function erstelleKiPromptText() {
  let inhalt = '';
  if (letzteGenerierteAufgaben.length === 0) {
    inhalt = '(Noch keine Aufgaben generiert. Bitte zuerst Leitbilder erstellen.)';
  } else {
    inhalt = letzteGenerierteAufgaben.map((lb, idx) => {
      const nr  = idx + 1;
      const text = lb.sektionen.flatMap(s => s.saetze.map(z => z.satz)).join(' ');
      const lsg = [
        `Ökonomische Ziele: ${lb.loesung.okon.join(', ')}`,
        `Ökologische Ziele: ${lb.loesung.oeko.join(', ')}`,
        `Soziale Ziele: ${lb.loesung.soz.join(', ')}`,
      ].join('\n');
      return `--- Leitbild ${nr}: ${lb.firma} (${lb.branche}) ---\n${lb.intro} ${lb.fuell} ${text} ${lb.schluss}\n\nMusterlösung ${nr}:\n${lsg}`;
    }).join('\n\n');
  }
  return KI_ASSISTENT_PROMPT.replace('###AUFGABEN und LÖSUNGEN###', inhalt);
}

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
  const btn      = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    vorschau.textContent   = erstelleKiPromptText();
    btn.textContent        = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent        = 'Prompt anzeigen ▼';
  }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    zeigeZufaelligeLeitbilder();
  }, 500);
});