// ============================================================================
// lb7-1-konsumgewohnheiten.js
// BwR Klasse 7 · Lernbereich 1 · Konsumgewohnheiten
// meinbwr.de
// ============================================================================

// ── Globale Variable für KI-Prompt ──────────────────────────────────────────
let letzteGenerierteKonsumaufgaben = [];

// ============================================================================
// PERSONEN-POOL
// ============================================================================
const personenPool = {
  schueler: [
    { name: 'Lena',   alter: 14, geschlecht: 'w', typ: 'Realschülerin (8. Klasse)',    minderjaehrig: true  },
    { name: 'Jonas',  alter: 15, geschlecht: 'm', typ: 'Realschüler (9. Klasse)',      minderjaehrig: true  },
    { name: 'Sophie', alter: 13, geschlecht: 'w', typ: 'Mittelschülerin (7. Klasse)',  minderjaehrig: true  },
    { name: 'Finn',   alter: 16, geschlecht: 'm', typ: 'Gymnasiast (10. Klasse)',      minderjaehrig: true  },
    { name: 'Mia',    alter: 14, geschlecht: 'w', typ: 'Realschülerin (8. Klasse)',    minderjaehrig: true  },
    { name: 'Noah',   alter: 15, geschlecht: 'm', typ: 'Realschüler (9. Klasse)',      minderjaehrig: true  },
  ],
  azubi: [
    { name: 'Tim',     alter: 18, geschlecht: 'm', typ: 'Auszubildender – Kaufmann im Einzelhandel (2. Lehrjahr)', minderjaehrig: false },
    { name: 'Johanna', alter: 19, geschlecht: 'w', typ: 'Auszubildende – Bürokauffrau (3. Lehrjahr)',             minderjaehrig: false },
    { name: 'Alina',   alter: 20, geschlecht: 'w', typ: 'Auszubildende – Bankkauffrau (3. Lehrjahr)',             minderjaehrig: false },
    { name: 'Lukas',   alter: 17, geschlecht: 'm', typ: 'Auszubildender – Mechatroniker (1. Lehrjahr)',           minderjaehrig: true  },
  ],
  student: [
    { name: 'Felix', alter: 22, geschlecht: 'm', typ: 'Student – BWL, 4. Semester',            minderjaehrig: false },
    { name: 'Laura', alter: 21, geschlecht: 'w', typ: 'Studentin – Lehramt, 3. Semester',      minderjaehrig: false },
    { name: 'Max',   alter: 23, geschlecht: 'm', typ: 'Student – Informatik, 5. Semester',     minderjaehrig: false },
    { name: 'Jana',  alter: 22, geschlecht: 'w', typ: 'Studentin – Soziale Arbeit, 4. Sem.',   minderjaehrig: false },
  ],
};

// ============================================================================
// KAUFSZENARIEN
// ============================================================================
const kaufSzenarienPool = [
  {
    id: 'hoodie',
    kategorie: 'Kleidung & Mode',
    produkt: 'ein Marken-Hoodie',
    einmalig: true,
    minderjaehrigOk: true,
    preis: 89,
    kriterien: { Notwendigkeit: '--', Prestige: '++', Trend: '++', Kosten: '-', Qualität: '+', Nachhaltigkeit: '--' },
    bewertung: 'kritisch',
    begruendung: 'Die Hauptmotive sind Prestige und Trend – echte Notwendigkeit besteht nicht. Der Preis ist hoch im Verhältnis zum verfügbaren Budget. Nachhaltigkeitsaspekte spielen keine Rolle.',
    alternative: 'Ein ähnlicher Hoodie ohne Markenlogo ist für 20–30 Euro erhältlich und erfüllt denselben praktischen Zweck.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> Fast alle in ${p.vars.vPossLow} Freundeskreis tragen seit einigen Wochen einen Hoodie der Marke „UrbanCore". ${p.name} findet die Marke eigentlich zu teuer – beim Schaufensterbummeln mit ${p.vars.vorname2} entdeckt ${p.vars.vNom} das aktuelle Modell für <strong>89,00 Euro</strong>. Zu Hause hängen bereits drei Hoodies, alle noch in gutem Zustand – keiner davon trägt jedoch das begehrte Logo. ${p.vars.vPoss} Eltern haben klargemacht, dass sie diesen Kauf nicht finanzieren werden.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} erwägt, sich den Hoodie vom Ersparten zu kaufen. ${p.vars.vPoss} monatliche Rücklage für ${p.vars.sparziel} würde dadurch wegfallen.</p>`;
    },
    konsequenzFn(p) {
      return `Kauft ${p.name} den Hoodie, entfällt die monatliche Rücklage für ${p.vars.sparziel} vollständig. Das Sparziel verzögert sich damit um mindestens einen Monat. Außerdem besteht die Gefahr, dass ${p.vars.vNom} bei der nächsten Trendsaison erneut unter Druck gerät.`;
    },
  },
  {
    id: 'bundle',
    kategorie: 'Kleidung & Mode',
    produkt: 'zwei T-Shirts (Bundle-Angebot)',
    einmalig: true,
    minderjaehrigOk: true,
    preis: 36,
    preisBeschreibung: '2 × 18,00 Euro (statt 2 × 20,00 Euro – „2 kaufen, 10 % sparen")',
    kriterien: { Notwendigkeit: '-', Prestige: '-', Trend: '+', Kosten: '+', Qualität: '+', Nachhaltigkeit: '-' },
    bewertung: 'kritisch',
    begruendung: 'Ein echter Bedarf liegt nicht vor – der Kauf entsteht allein durch das Sonderangebot. Wer ein Produkt kauft, das nicht gebraucht wird, spart kein Geld, sondern gibt mehr aus als geplant. Das ist ein typisches Marketingprinzip.',
    alternative: 'Bei Bedarf nur ein T-Shirt kaufen – auch zum Normalpreis von 20,00 Euro bleibt man deutlich günstiger als beim Doppelkauf.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> ${p.name} betritt einen Bekleidungsladen mit dem klaren Ziel, ein einziges neues T-Shirt zu kaufen. An einem Aufsteller entdeckt ${p.vars.vNom} ein Angebot: „2 T-Shirts für je 18,00 Euro statt je 20,00 Euro – 10 % gespart!" Das bisherige T-Shirt zu Hause ist noch gut erhalten. Trotzdem klingt das Angebot verlockend.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} rechnet nach: Statt 20,00 Euro würde ${p.vars.vNom} nun 36,00 Euro ausgeben – also 16,00 Euro mehr als ursprünglich geplant. ${p.vars.vNom} fragt sich, ob das wirklich ein Vorteil ist.</p>`;
    },
    konsequenzFn(p) {
      return `Kauft ${p.name} beide T-Shirts, gibt ${p.vars.vNom} 16,00 Euro mehr aus als notwendig. Obwohl der Stückpreis geringer ist, steigt die Gesamtausgabe – das ist kein echtes Sparen, sondern eine bewährte Marketingstrategie des Handels.`;
    },
  },
  {
    id: 'sneaker',
    kategorie: 'Kleidung & Mode',
    produkt: 'limitierte Sneakers',
    einmalig: true,
    minderjaehrigOk: true,
    preis: 220,
    kriterien: { Notwendigkeit: '--', Prestige: '++', Trend: '++', Kosten: '--', Qualität: '+', Nachhaltigkeit: '-' },
    bewertung: 'kritisch',
    begruendung: 'Der Preis von 220,00 Euro ist extrem hoch im Verhältnis zum verfügbaren Budget. Die Kaufmotive sind fast ausschließlich Prestige und Trend. Es sind bereits genügend Schuhe vorhanden – eine Notwendigkeit besteht nicht.',
    alternative: 'Funktionale Sportschuhe guter Qualität sind für 50–80 Euro erhältlich und erfüllen denselben Zweck – ohne Markenaufschlag.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> Am Samstag erscheint eine limitierte Edition des Sneaker-Labels „Stride X" – ein Release, auf den die Szene seit Monaten wartet. ${p.name} steht bereits um 7 Uhr morgens vor dem Laden. Der Preis: <strong>220,00 Euro</strong>. ${p.vars.vPoss} Schuhschrank enthält bereits drei Paar Sportschuhe und zwei Paar Alltagsschuhe, alle in gutem Zustand. „Limitiert" bedeutet jedoch: dieses Modell gibt es nie wieder.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} hat ${e.ersparnisHinweis} auf dem Konto. Der Kauf würde ${p.vars.akkPoss} nahezu vollständig aufbrauchen. Das Sparziel für ${p.vars.sparziel} wäre damit in weite Ferne gerückt.</p>`;
    },
    konsequenzFn(p) {
      return `Nach dem Kauf hat ${p.name} kaum noch Rücklagen. Das Sparziel für ${p.vars.sparziel} ist damit unrealistisch geworden. Da die Schuhe „limitiert" sind, verlieren sie auf dem Wiederverkaufsmarkt nach einigen Monaten oft erheblich an Wert.`;
    },
  },
  {
    id: 'tablet_gebraucht',
    kategorie: 'Technik & Medien',
    produkt: 'ein gebrauchtes Tablet',
    einmalig: true,
    minderjaehrigOk: true,
    preis: 110,
    preisBeschreibung: '110,00 Euro (gebraucht, 1 Jahr alt, sehr guter Zustand)',
    kriterien: { Notwendigkeit: '++', Prestige: '-', Trend: '-', Kosten: '++', Qualität: '+', Nachhaltigkeit: '++' },
    bewertung: 'vertretbar',
    begruendung: 'Das Tablet wird für die Schule benötigt (klare Notwendigkeit). Der Kauf eines gebrauchten Geräts ist kostengünstig und nachhaltig – er verlängert den Produktlebenszyklus und spart gegenüber dem Neugerät fast 300 Euro.',
    alternative: 'Falls das Budget noch knapper ist, kann die Schulbibliothek oder ein Familienmitglied gefragt werden, ob vorübergehend ein Gerät ausgeliehen werden kann.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> Im neuen Schuljahr empfiehlt die Schule für das Fach Informatik ein Tablet. ${p.name} hat eine Anzeige auf einer Gebrauchtwarenplattform gefunden: Ein Tablet, erst ein Jahr alt, in sehr gutem Zustand, für <strong>110,00 Euro</strong>. Ein vergleichbares Neugerät kostet im Laden <strong>399,00 Euro</strong>.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} hat genug Ersparnisse für den Kauf und ${p.vars.vPossLow} Eltern befürworten die Entscheidung ausdrücklich. Das Gerät wird täglich genutzt werden. Durch den Kauf eines Gebrauchtgeräts verlängert sich die Nutzungsdauer des Produkts – Ressourcen werden geschont.</p>`;
    },
    konsequenzFn(p) {
      return `${p.name} kauft das Tablet bewusst und bedarfsorientiert. Die Rücklagen sinken, werden aber nicht aufgebraucht. Das Gerät wird täglich für die Schule eingesetzt – ein nachhaltiger Kauf mit klarem Nutzen.`;
    },
  },
  {
    id: 'smartphone',
    kategorie: 'Technik & Medien',
    produkt: 'ein neues Smartphone (Upgrade)',
    einmalig: true,
    minderjaehrigOk: false,
    preis: 549,
    kriterien: { Notwendigkeit: '-', Prestige: '++', Trend: '+', Kosten: '--', Qualität: '+', Nachhaltigkeit: '--' },
    bewertung: 'kritisch',
    begruendung: 'Das bisherige Gerät funktioniert noch einwandfrei – eine Notwendigkeit liegt nicht vor. Der Preis von 549,00 Euro entspricht einem sehr großen Teil des monatlichen Einkommens. Häufige Smartphone-Wechsel erzeugen zudem erheblichen Elektroschrott.',
    alternative: 'Das bisherige Gerät noch 1–2 Jahre weiternutzen und gezielt sparen. Alternativ: ein günstiges Mittelklassegerät für ca. 200 Euro, das alle wesentlichen Funktionen bietet.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> Das neue Topmodell „ProMax Z15" ist gerade erschienen – verbesserte Kamera, schnellerer Prozessor, schlichtes Design für <strong>549,00 Euro</strong>. ${p.name} nutzt aktuell ein Gerät, das vor zwei Jahren gekauft wurde und einwandfrei funktioniert. Im Freundeskreis haben bereits drei Personen auf das neue Modell umgestellt.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} könnte das alte Gerät für ca. 120,00 Euro verkaufen, um die Differenz zu verringern. Dennoch würden mehrere Monate Erspartes verschwinden. ${p.vars.vNom} fragt sich, ob der Kauf wirklich notwendig ist – oder ob der Wunsch vor allem aus dem sozialen Umfeld entsteht.</p>`;
    },
    konsequenzFn(p) {
      return `Ein Kauf würde ${p.name} mehrere Monate Ersparnisse kosten. Das alte Gerät – noch voll funktionsfähig – wird vorzeitig ausrangiert. Elektronikexperten weisen darauf hin, dass jährliche Smartphone-Upgrades weltweit Millionen Tonnen Elektroschrott erzeugen.`;
    },
  },
  {
    id: 'streaming',
    kategorie: 'Technik & Medien',
    produkt: 'drei Streaming-Abonnements',
    einmalig: false,
    minderjaehrigOk: true,
    preis: 38,
    preisBeschreibung: '3 Dienste × 12–13 Euro = 38,00 Euro pro Monat (= 456,00 Euro im Jahr)',
    kriterien: { Notwendigkeit: '-', Prestige: '-', Trend: '+', Kosten: '-', Qualität: '+', Nachhaltigkeit: '+' },
    bewertung: 'kritisch',
    begruendung: 'Einzeln betrachtet wirken die Abos günstig – zusammen ergeben sie 38,00 Euro monatlich bzw. 456,00 Euro jährlich. Nicht alle Dienste werden regelmäßig genutzt. Laufende Verträge sind psychologisch schwerer zu kündigen als einmalige Ausgaben.',
    alternative: 'Genau prüfen, welche Dienste wirklich täglich genutzt werden. Nicht genutzte Abos sofort kündigen – das spart 12–25 Euro monatlich.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> ${p.name} hat im letzten Jahr schrittweise drei Streaming-Dienste abonniert: einen für Musik (11,99 Euro/Monat), einen für Serien und Filme (12,99 Euro/Monat) und einen für Hörbücher und Podcasts (13,00 Euro/Monat). Zusammen werden monatlich <strong>37,98 Euro</strong> vom Konto abgebucht – im Jahr sind das <strong>455,76 Euro</strong>.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> Beim Blick auf den aktuellen Kontoauszug bemerkt ${p.name}, wie viel die Abos insgesamt kosten. Den Musik-Dienst nutzt ${p.vars.vNom} täglich. Die Serien-Plattform wird nur gelegentlich geöffnet. Den Hörbuch-Dienst hat ${p.vars.vNom} seit drei Monaten kaum mehr benutzt.</p>`;
    },
    konsequenzFn(p) {
      return `Behält ${p.name} alle drei Abos, zahlt ${p.vars.vNom} im Jahr 455,76 Euro allein für Streaming. Kündigt ${p.vars.vNom} den selten genutzten Hörbuch-Dienst, spart ${p.vars.vNom} 156,00 Euro pro Jahr – Geld, das für ${p.vars.sparziel} genutzt werden könnte.`;
    },
  },
  {
    id: 'fastfood',
    kategorie: 'Essen & Freizeit',
    produkt: 'Fast Food täglich nach der Schule',
    einmalig: false,
    minderjaehrigOk: true,
    preis: 8,
    monatlich: 192,
    preisBeschreibung: 'ca. 8,00 Euro täglich × 24 Schultage ≈ 192,00 Euro pro Monat',
    kriterien: { Notwendigkeit: '+', Prestige: '-', Trend: '+', Kosten: '--', Qualität: '-', Nachhaltigkeit: '--' },
    bewertung: 'kritisch',
    begruendung: 'Essen ist notwendig – tägliches Fast Food ist es nicht. Die kumulierten Kosten von ca. 192,00 Euro monatlich übersteigen das gesamte Taschengeld vieler Jugendlicher bei Weitem. Qualität und Nachhaltigkeit sind bei Fast Food gering.',
    alternative: 'Ein Pausenbrot von zu Hause kostet nahezu nichts. Gelegentlicher Fast-Food-Besuch (1–2× pro Woche) senkt die Ausgaben auf 32–64 Euro monatlich.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> Nach der Schule geht ${p.name} mit der Clique fast täglich zur Fast-Food-Kette in der Nähe. Es gehört einfach dazu: Die anderen gehen auch, und zusammen essen macht Spaß. Pro Besuch gibt ${p.vars.vNom} etwa <strong>8,00 Euro</strong> aus (Menü mit Getränk). An 24 Schultagen summiert sich das auf ca. <strong>192,00 Euro pro Monat</strong>.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} hat bemerkt, dass am Monatsende kaum Geld mehr übrig ist. ${p.vars.vNom} hat bisher nie genau nachgerechnet, was die täglichen Fast-Food-Besuche insgesamt kosten – und was ${p.vars.vNom} stattdessen damit anstellen könnte.</p>`;
    },
    konsequenzFn(p) {
      return `Die kumulierten Fast-Food-Ausgaben fressen einen Großteil des verfügbaren Einkommens auf. ${p.name} kann kaum etwas sparen und muss auf andere Wünsche verzichten. Tägliches Fast Food ist zudem langfristig gesundheitlich bedenklich und erzeugt erheblich mehr Verpackungsmüll als selbst zubereitetes Essen.`;
    },
  },
  {
    id: 'naturkosmetik',
    kategorie: 'Kosmetik & Lifestyle',
    produkt: 'Naturkosmetik-Produkte (monatlich)',
    einmalig: false,
    minderjaehrigOk: true,
    preis: 28,
    preisBeschreibung: 'ca. 28,00 Euro pro Monat (Shampoo, Duschgel, Feuchtigkeitscreme)',
    kriterien: { Notwendigkeit: '++', Prestige: '-', Trend: '-', Kosten: '-', Qualität: '++', Nachhaltigkeit: '++' },
    bewertung: 'vertretbar',
    begruendung: 'Körperpflege ist eine echte Notwendigkeit. Die Wahl von Naturkosmetik ist bewusst und werteorientiert – Qualität und Nachhaltigkeit stehen im Vordergrund. Die Ausgabe ist dauerhaft im Budget eingeplant und nicht impulsiv.',
    alternative: 'Einzelne Produkte können durch günstigere, aber ebenfalls schadstoffarme Drogerieprodukte ersetzt werden, wenn das Budget knapper wird.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> ${p.name} kauft seit einem Jahr bewusst Naturkosmetik: ein schadstoffarmes Shampoo (9,50 Euro), ein veganes Duschgel (8,00 Euro) und eine Feuchtigkeitscreme ohne Silikone (10,50 Euro). Zusammen <strong>28,00 Euro pro Monat</strong>. Vergleichbare Discounterprodukte würden zusammen etwa 8,00 Euro kosten.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} ist überzeugt, mit diesen Produkten nicht nur die eigene Haut zu schonen, sondern auch einen Beitrag zum Umweltschutz zu leisten. Die Ausgabe ist seit Monaten fest im Budget eingeplant – ${p.vars.vNom} verzichtet dafür bewusst auf andere Dinge.</p>`;
    },
    konsequenzFn(p) {
      return `${p.name} gibt bewusst mehr für Körperpflege aus, weil Nachhaltigkeit und Gesundheit ${p.vars.vDat} wichtig sind. Da die Ausgabe langfristig geplant und ins Budget integriert ist, entstehen keine finanziellen Engpässe.`;
    },
  },
  {
    id: 'fitnessstudio',
    kategorie: 'Sport & Hobby',
    produkt: 'Fitnessstudio-Mitgliedschaft (12 Monate)',
    einmalig: false,
    minderjaehrigOk: false,
    preis: 30,
    preisBeschreibung: '30,00 Euro pro Monat bei 12 Monaten Mindestlaufzeit (Gesamtkosten: 360,00 Euro)',
    kriterien: { Notwendigkeit: '+', Prestige: '+', Trend: '+', Kosten: '-', Qualität: '++', Nachhaltigkeit: '+' },
    bewertung: 'kritisch',
    begruendung: 'Sport ist sinnvoll – die Mindestlaufzeit von 12 Monaten bindet jedoch dauerhaft Geld. Wird das Studio nach einigen Monaten weniger besucht, entstehen hohe Fixkosten ohne echten Nutzen. Günstigere, flexiblere Alternativen existieren.',
    alternative: 'Outdoor-Sport (Joggen, Radfahren, Schwimmbad) ist nahezu kostenlos. Alternativ: ein Kurz-Abo ohne Mindestlaufzeit testen, bevor eine langfristige Bindung eingegangen wird.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> ${p.name} hat sich im Januar vorgenommen, regelmäßig Sport zu treiben. Ein Fitnessstudio in der Nähe bietet eine Mitgliedschaft für <strong>30,00 Euro pro Monat</strong> mit <strong>12 Monaten Mindestlaufzeit</strong> an – also Gesamtkosten von <strong>360,00 Euro</strong>, unabhängig davon, wie oft das Studio besucht wird. ${p.vars.vPoss} Freund/Freundin ${p.vars.vorname2} hat eine ähnliche Mitgliedschaft abgeschlossen und geht mittlerweile kaum noch hin – zahlt aber trotzdem weiter.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} ist in diesem Moment sehr motiviert. ${p.vars.vNom} überlegt aber auch: Wird die Motivation in drei oder sechs Monaten noch genauso stark sein?</p>`;
    },
    konsequenzFn(p) {
      return `Wird das Fitnessstudio nach drei Monaten nur noch selten besucht, zahlt ${p.name} trotzdem weitere 9 Monate – das sind 270,00 Euro für kaum genutzten Service. Günstigere Alternativen wie Outdoor-Sport wären deutlich flexibler und kostengünstiger.`;
    },
  },
  {
    id: 'sportverein',
    kategorie: 'Sport & Hobby',
    produkt: 'Vereinsmitgliedschaft (Fußball)',
    einmalig: false,
    minderjaehrigOk: true,
    preis: 15,
    preisBeschreibung: '15,00 Euro pro Monat (Vereinsbeitrag, jederzeit kündbar mit 1 Monat Frist)',
    kriterien: { Notwendigkeit: '+', Prestige: '-', Trend: '-', Kosten: '++', Qualität: '++', Nachhaltigkeit: '++' },
    bewertung: 'vertretbar',
    begruendung: 'Ein Vereinsbeitrag von 15,00 Euro monatlich ist erschwinglich und fördert sportliche Aktivität, Teamgeist und soziale Bindungen. Die Ausgabe ist dauerhaft planbar und im Budget klar vertretbar.',
    alternative: 'Falls der Beitrag zu hoch erscheint, bieten viele Vereine Ermäßigungen an. Schulsport-AGs sind eine kostenfreie Alternative.',
    situationFn(p, e, a) {
      return `<p><span class="fb-absatz-titel">Zur Person:</span> ${p.name} (${p.alter} Jahre) ist ${p.typ}. ${e.einnahmenText}</p>
<p><span class="fb-absatz-titel">Ausgaben:</span> ${a.ausgabenText}</p>
<p><span class="fb-absatz-titel">Situation:</span> ${p.name} spielt seit Jahren leidenschaftlich Fußball. ${p.vars.vPoss} Schule hat zwar eine Fußball-AG, aber ${p.vars.vNom} möchte in einem richtigen Verein trainieren und an Meisterschaften teilnehmen. Der örtliche Fußballverein bietet Jugendmitgliedschaften für <strong>15,00 Euro pro Monat</strong> an, kündbar mit einem Monat Frist. Die Trainingszeiten passen gut in ${p.vars.vPossLow} Stundenplan, und ${p.vars.vPossLow} Eltern befürworten die Mitgliedschaft ausdrücklich.</p>
<p><span class="fb-absatz-titel">Überlegung:</span> ${p.name} ist begeistert und überzeugt, dass ${p.vars.vNom} regelmäßig zum Training gehen wird. Die flexible Kündigung gibt ${p.vars.vDat} Sicherheit, falls sich die Situation ändern sollte.</p>`;
    },
    konsequenzFn(p) {
      return `${p.name} tritt dem Verein bei. Die 15,00 Euro monatlich sind gut angelegt: ${p.vars.vNom} treibt regelmäßig Sport, knüpft neue Freundschaften und entwickelt Teamfähigkeit. Die flexible Kündigungsmöglichkeit verhindert eine langfristige finanzielle Falle.`;
    },
  },
];

// ============================================================================
// HILFSPOOLS
// ============================================================================
const nebenjobPool    = ['Babysitting', 'Zeitungsaustragen', 'Rasenmähen bei Nachbarn', 'Nachhilfe geben', 'Kellnern am Wochenende', 'Aushilfe im Supermarkt'];
const freundePool     = ['Luca', 'Emma', 'Ben', 'Emre', 'Pia', 'Tom', 'Sarah', 'Jan'];

// Elternpool ist geschlechtsabhängig: pick(elternPool(w)) gibt korrekte Formen
function elternPool(weiblich) {
  // Dativ nach "von": von seinen Eltern / von seiner Mutter / von seinem Vater
  return weiblich
    ? ['ihren Eltern', 'ihrer Mutter', 'ihrem Vater', 'den Eltern']
    : ['seinen Eltern', 'seiner Mutter', 'seinem Vater', 'den Eltern'];
}
const sparzielePool   = ['einen Konzertbesuch', 'den Führerschein', 'eine Urlaubsreise', 'ein neues Fahrrad', 'einen Sprachkurs', 'eine eigene Wohnung'];

const kriterienReihenfolge = ['Notwendigkeit', 'Kosten', 'Qualität', 'Nachhaltigkeit', 'Prestige', 'Trend'];
const kriterienLabel = {
  Notwendigkeit:  'Notwendigkeit',
  Prestige:       'Prestige (steigert mein Ansehen)',
  Trend:          'Trend (andere besitzen es auch)',
  Kosten:         'Kosten / Preis',
  Qualität:       'Qualität des Produkts',
  Nachhaltigkeit: 'Nachhaltigkeit / Umwelt',
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function rnd(min, max, step = 5) {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

function fmt(n) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function gVars(person) {
  const w = person.geschlecht === 'w';
  return {
    weiblich:    w,
    vNom:        w ? 'sie'   : 'er',
    vDat:        w ? 'ihr'   : 'ihm',
    vAkk:        w ? 'sie'   : 'ihn',
    vPoss:       w ? 'Ihre'  : 'Seine',
    vPossLow:    w ? 'ihre'  : 'seine',
    vPossDat:    w ? 'ihrem' : 'seinem',
    vPossGenPl:  w ? 'ihren' : 'seinen',
    akkPoss:     w ? 'ihr'   : 'ihn',
    vorname2:    pick(freundePool),
    sparziel:    pick(sparzielePool),
  };
}

// ============================================================================
// EINNAHMEN GENERIEREN
// ============================================================================
function genEinnahmen(person) {
  const typ = person.typ.toLowerCase();
  const istStudent = typ.includes('student');
  const istAzubi   = typ.includes('auszubild');
  const posten = [];

  if (!istStudent && !istAzubi) {
    // Schüler/in
    const tg = rnd(40, 120, 5);
    posten.push({ label: 'Taschengeld (monatlich)', betrag: tg });
    if (Math.random() < 0.65) {
      const nj  = rnd(20, 80, 5);
      const job = pick(nebenjobPool);
      posten.push({ label: `Nebenverdienst (${job})`, betrag: nj });
    }
    if (Math.random() < 0.4) {
      const g = rnd(50, 250, 10);
      posten.push({ label: 'Ersparnisse (Geschenke / Weihnachtsgeld)', betrag: g, einmalig: true });
    }
  } else if (istAzubi) {
    const az = rnd(500, 950, 50);
    posten.push({ label: 'Ausbildungsvergütung (netto)', betrag: az });
    if (Math.random() < 0.5) {
      const el = rnd(100, 250, 50);
      posten.push({ label: 'Unterstützung der Eltern', betrag: el });
    }
  } else {
    // Student/in
    const baf = rnd(300, 700, 50);
    posten.push({ label: 'BAföG', betrag: baf });
    const el = rnd(150, 400, 50);
    posten.push({ label: 'Unterstützung der Eltern', betrag: el });
    if (Math.random() < 0.55) {
      const nj  = rnd(150, 350, 50);
      const job = pick(nebenjobPool);
      posten.push({ label: `Nebenverdienst (${job})`, betrag: nj });
    }
  }
  return posten;
}

// ============================================================================
// AUSGABEN GENERIEREN
// ============================================================================
function genAusgaben(person) {
  const typ = person.typ.toLowerCase();
  const istStudent = typ.includes('student');
  const istAzubi   = typ.includes('auszubild');
  const posten = [];

  if (!istStudent && !istAzubi) {
    // Schüler/in – keine Miete, wenige Fixkosten
    posten.push({ label: 'Handykosten (Prepaid)',         betrag: rnd(10, 25, 5) });
    posten.push({ label: 'Freizeit & Unternehmungen',     betrag: rnd(10, 30, 5) });
    posten.push({ label: 'Kleidung & Schulmaterial',      betrag: rnd(10, 25, 5) });
  } else if (istAzubi) {
    posten.push({ label: 'Kaltmiete (WG-Zimmer)',         betrag: rnd(400, 650, 50) });
    posten.push({ label: 'Nebenkosten (Strom, Internet)', betrag: rnd(80, 150, 10)  });
    posten.push({ label: 'Lebensmittel',                  betrag: rnd(150, 250, 10) });
    posten.push({ label: 'Handy & Telefon',               betrag: rnd(20, 40, 5)   });
    posten.push({ label: 'Fahrtkosten (ÖPNV)',            betrag: rnd(30, 80, 10)  });
  } else {
    // Student/in
    posten.push({ label: 'Kaltmiete (Wohnheim/WG)',               betrag: rnd(450, 750, 50) });
    posten.push({ label: 'Nebenkosten (Strom, Internet, GEZ)',    betrag: rnd(60, 130, 10)  });
    posten.push({ label: 'Lebensmittel & Mensa',                  betrag: rnd(180, 280, 10) });
    posten.push({ label: 'Handy & Telefon',                       betrag: rnd(20, 40, 5)   });
    posten.push({ label: 'Semesterbeitrag (anteilig monatlich)',   betrag: 70               });
    posten.push({ label: 'Fahrtkosten',                           betrag: rnd(20, 60, 10)  });
  }
  return posten;
}

// ============================================================================
// FLIESSTEXT AUFBAUEN
// ============================================================================
function buildEinnahmenSatz(lfdEin, einmEin, vars) {
  const texte = lfdEin.map(e => {
    if (e.label.includes('Taschengeld'))  return `monatlich <strong>${fmt(e.betrag)} Euro Taschengeld von ${pick(elternPool(vars.weiblich))}</strong>`;
    if (e.label.includes('Neben'))        return `einen monatlichen Nebenverdienst von <strong>${fmt(e.betrag)} Euro</strong> (${e.label.replace('Nebenverdienst (', '').replace(')', '')})`;
    if (e.label.includes('Ausbildung'))   return `eine monatliche Ausbildungsvergütung von <strong>${fmt(e.betrag)} Euro</strong> netto`;
    if (e.label.includes('BAföG'))        return `monatlich <strong>${fmt(e.betrag)} Euro BAföG</strong>`;
    if (e.label.includes('Eltern'))       return `<strong>${fmt(e.betrag)} Euro monatliche Unterstützung</strong> von den Eltern`;
    return `<strong>${fmt(e.betrag)} Euro</strong> (${e.label})`;
  });

  let satz = '';
  if (texte.length === 1) {
    satz = `verfügt über ${texte[0]}.`;
  } else {
    satz = `verfügt über ${texte.slice(0, -1).join(', ')} sowie ${texte[texte.length - 1]}.`;
  }

  if (einmEin.length > 0) {
    const es = einmEin.map(e => `<strong>${fmt(e.betrag)} Euro</strong> (${e.label})`).join(' und ');
    satz += ` Auf ${vars.vPossDat} Konto befinden sich außerdem noch ${es}.`;
  }
  return satz;
}

function buildAusgabenSatz(ausPosten, vars) {
  const texte = ausPosten.map(e => `${e.label} (<strong>${fmt(e.betrag)} Euro</strong>)`).join(', ');
  return `Zu ${vars.vPossGenPl} monatlichen Ausgaben zählen: ${texte}.`;
}

// ============================================================================
// AUFGABE GENERIEREN
// ============================================================================
function erstelleKonsumaufgabe(personaTyp) {
  let pool;
  if (personaTyp === 'alle') pool = [...personenPool.schueler, ...personenPool.azubi, ...personenPool.student];
  else pool = personenPool[personaTyp] || personenPool.schueler;

  const person = pick(pool);
  const vars   = gVars(person);
  person.vars  = vars;

  const einPosten  = genEinnahmen(person);
  const lfdEin     = einPosten.filter(e => !e.einmalig);
  const einmEin    = einPosten.filter(e =>  e.einmalig);
  const gesamtEin  = lfdEin.reduce((s, e) => s + e.betrag, 0);
  const ersparnisse = einmEin.reduce((s, e) => s + e.betrag, 0);

  const ausPosten  = genAusgaben(person);
  const gesamtAus  = ausPosten.reduce((s, e) => s + e.betrag, 0);
  const freiVerfuegbar = gesamtEin - gesamtAus;

  // Texte für Situationsbausteine
  const einnahmenTextSatz = `${person.name} ${buildEinnahmenSatz(lfdEin, einmEin, vars)}`;
  const ausgabenTextSatz  = buildAusgabenSatz(ausPosten, vars);
  const ersparnisHinweis  = ersparnisse > 0 ? `${fmt(ersparnisse)} Euro` : 'kaum Ersparnisse';

  // Szenario auswählen (Minderjährige: kein Ratenkauf / Kreditvertrag)
  let szPool = kaufSzenarienPool.filter(s => !person.minderjaehrig || s.minderjaehrigOk !== false);
  if (szPool.length === 0) szPool = kaufSzenarienPool.filter(s => s.minderjaehrigOk !== false);
  const szenario = pick(szPool);

  const preisBez = szenario.preisBeschreibung
    || (szenario.einmalig
      ? `${fmt(szenario.preis)} Euro (einmalige Ausgabe)`
      : `${fmt(szenario.preis)} Euro pro Monat`);

  const preisFuerSparplan = szenario.monatlich || (szenario.einmalig ? szenario.preis : szenario.preis * 6);

  const eObj = { einnahmenText: einnahmenTextSatz, ersparnisHinweis };
  const aObj = { ausgabenText:  ausgabenTextSatz  };

  const situationsHTML = szenario.situationFn(person, eObj, aObj);
  const konsequenz     = szenario.konsequenzFn(person);

  // Sparplan-Berechnung
  const sparrate = Math.max(5, Math.round(Math.min(Math.max(freiVerfuegbar, 10), gesamtEin * 0.25) / 5) * 5);
  const sparZiel = preisFuerSparplan;
  const monate   = sparrate > 0 ? Math.ceil(sparZiel / sparrate) : '–';

  return {
    person, vars,
    lfdEin, einmEin, gesamtEin, ersparnisse,
    ausPosten, gesamtAus, freiVerfuegbar,
    szenario, preisBez, situationsHTML, konsequenz,
    sparrate, sparZiel, monate,
  };
}

// ============================================================================
// RENDER-FUNKTION
// ============================================================================
function renderKonsumaufgabeBlock(data, nr, gesamt) {
  const {
    person, vars,
    lfdEin, einmEin, gesamtEin, ersparnisse,
    ausPosten, gesamtAus, freiVerfuegbar,
    szenario, preisBez, situationsHTML, konsequenz,
    sparrate, sparZiel, monate,
  } = data;

  const aL = gesamt > 1 ? `Aufgabe ${nr}A` : 'Aufgabe A';
  const bL = gesamt > 1 ? `Aufgabe ${nr}B` : 'Aufgabe B';
  const cL = gesamt > 1 ? `Aufgabe ${nr}C` : 'Aufgabe C';
  const dL = gesamt > 1 ? `Aufgabe ${nr}D` : 'Aufgabe D';
  const lL = gesamt > 1 ? `Lösung ${nr}`   : 'Lösung';

  const bew      = szenario.kriterien;
  const bewLabel = szenario.bewertung;
  const bewIcon  = bewLabel === 'kritisch' ? '⚠️' : '✅';

  // Sparplan: einfache Rechnung, keine Tabelle mehr

  // ── HTML aufbauen ────────────────────────────────────────────────────────
  let html = nr > 1 ? `<h2 style="margin-top:2.5em;">Aufgabe ${nr}</h2>` : '';

  // ── A: Einnahmen und Ausgaben ─────────────────────────────────────────────
  html += `<h2 style="margin-top:${nr > 1 ? '1em' : '0'};">${aL} – Einnahmen und Ausgaben</h2>`;
  html += `<p style="font-style:italic; color:#555; font-size:0.95rem; max-width:680px;">
    Lies das folgende Fallbeispiel sorgfältig durch.
  </p>`;

  html += `<div style="border:1px solid #ccc; border-left:5px solid #1a237e; border-radius:6px; padding:20px 24px; margin:12px 0 16px; background:#fafafa; max-width:680px;">`;
  html += `<h3 style="margin-bottom:4px; color:#1a237e;">${person.name} (${person.alter} Jahre)</h3>`;
  html += `<p style="color:#546e7a; font-size:0.85rem; margin-bottom:14px; font-style:italic;">${person.typ}</p>`;
  html += situationsHTML;
  html += `</div>`;

  html += `<ol style="max-width:680px; font-size:0.9rem; line-height:2; margin-bottom:0;">
    <li><strong>Ermittle</strong> alle Einnahmen von ${person.name} aus dem Fallbeispiel und trage sie vollständig in die folgende Tabelle ein. Berechne die monatliche Gesamteinnahme.</li>
    <li><strong>Ermittle</strong> alle Ausgaben von ${person.name} aus dem Fallbeispiel und ergänze sie in der Ausgabentabelle. Berechne die Summe der Ausgaben.</li>
    <li><strong>Berechne</strong>, wie viel Geld ${person.name} nach Abzug aller Ausgaben monatlich frei verfügbar hat.${einmEin.length > 0 ? ' Gib außerdem den einmalig verfügbaren Betrag (Ersparnisse) an.' : ''}</li>
  </ol>`;

  // Einnahmen-Tabelle (leer)
  html += `<h3 style="margin-top:1.2em;">Einnahmen</h3>`;
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">
    <thead><tr style="background:#e8eaf6;">
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:left; width:65%;">Einnahmequelle</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:right; width:35%;">Betrag pro Monat (€)</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < Math.max(lfdEin.length, 3); i++) {
    html += `<tr><td style="border:1px solid #ccc; padding:7px 12px; height:32px;">&nbsp;</td><td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td></tr>`;
  }
  html += `<tr style="background:#e8eaf6; font-weight:bold;">
    <td style="border:1px solid #ccc; padding:7px 12px;">Gesamteinnahmen</td>
    <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
  </tr>`;
  if (einmEin.length > 0) {
    html += `<tr><td colspan="2" style="border:1px solid #ccc; padding:6px 12px; font-style:italic; font-size:0.83rem; color:#555;">Ersparnisse (einmalig verfügbar): ____________________ €</td></tr>`;
  }
  html += `</tbody></table>`;

  // Ausgaben-Tabelle (leer)
  html += `<h3 style="margin-top:1em;">Ausgaben</h3>`;
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">
    <thead><tr style="background:#fce4ec;">
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:left; width:65%;">Ausgabe</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:right; width:35%;">Betrag pro Monat (€)</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < Math.max(ausPosten.length, 3); i++) {
    html += `<tr><td style="border:1px solid #ccc; padding:7px 12px; height:32px;">&nbsp;</td><td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td></tr>`;
  }
  html += `<tr style="background:#fce4ec; font-weight:bold;">
    <td style="border:1px solid #ccc; padding:7px 12px;">Summe Ausgaben</td>
    <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
  </tr>
  <tr style="background:#f3e5f5; font-weight:bold;">
    <td style="border:1px solid #ccc; padding:7px 12px;">Frei verfügbar (Einnahmen − Ausgaben)</td>
    <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
  </tr>`;
  html += `</tbody></table>`;

  // ── B: Kaufentscheidung ───────────────────────────────────────────────────
  html += `<h2 style="margin-top:2em;">${bL} – Kaufentscheidung analysieren und bewerten</h2>`;

  const wBg     = bewLabel === 'kritisch' ? '#fff8e1' : '#f1f8e9';
  const wBorder = bewLabel === 'kritisch' ? '#f9a825' : '#558b2f';
  html += `<div style="border:1px solid ${wBorder}; border-left:5px solid ${wBorder}; border-radius:6px; padding:16px 20px; margin:12px 0; background:${wBg}; max-width:680px;">
    <p style="margin:0; font-size:0.95rem;"><strong>${person.name} möchte ${szenario.produkt} kaufen.</strong><br>
    <span style="font-size:0.88rem; color:#555;">Preis: <strong>${preisBez}</strong> &nbsp;·&nbsp; Kategorie: ${szenario.kategorie} &nbsp;·&nbsp; ${szenario.einmalig ? 'Einmalige Ausgabe' : 'Laufende monatliche Ausgabe'}</span></p>
  </div>`;

  html += `<ol style="max-width:680px; font-size:0.9rem; line-height:2;">
    <li><strong>Fülle</strong> die Bewertungstabelle für diese Kaufentscheidung vollständig aus (++ sehr wichtig | + wichtig | – weniger wichtig | – – unwichtig).</li>
    <li><strong>Beurteile</strong>, ob der Kauf für ${person.name} finanziell <strong>vertretbar</strong> oder <strong>kritisch</strong> ist. <strong>Begründe</strong> deine Einschätzung anhand von mindestens zwei Kriterien aus der Tabelle.</li>
    <li><strong>Nenne</strong> eine günstigere oder nachhaltigere Alternative zu diesem Kauf.</li>
    <li><strong>Erkläre</strong>, welche Rolle Werbung und soziales Umfeld bei dieser Kaufentscheidung spielen könnten.</li>
  </ol>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">
    <thead><tr style="background:#e8eaf6;">
      <th style="border:1px solid #ccc; padding:8px 12px; width:55%;">Kriterium</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:center; width:11.25%;">++</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:center; width:11.25%;">+</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:center; width:11.25%;">–</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:center; width:11.25%;">– –</th>
    </tr></thead><tbody>`;
  for (const k of kriterienReihenfolge) {
    html += `<tr>
      <td style="border:1px solid #ccc; padding:7px 12px;">${kriterienLabel[k]}</td>
      <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
      <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
      <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
      <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  // ── C: Sparplan ───────────────────────────────────────────────────────────
  html += `<h2 style="margin-top:2em;">${cL} – Sparplan</h2>`;
  html += `<p style="font-size:0.9rem; max-width:680px; margin-bottom:10px;">${person.name} entscheidet sich, den Kauf erst dann zu tätigen, wenn ${vars.vNom} genug Geld angespart hat. Dafür legt ${vars.vNom} jeden Monat einen festen Betrag zur Seite.</p>`;

  html += `<ol style="max-width:680px; font-size:0.9rem; line-height:2;">
    <li><strong>Berechne</strong>, nach wie vielen Monaten ${person.name} das Sparziel von <strong>${fmt(sparZiel)} Euro</strong> erreicht, wenn ${vars.vNom} monatlich <strong>${fmt(sparrate)} Euro</strong> zurücklegt.</li>
    <li><strong>Begründe</strong>, weshalb es sinnvoll ist, größere Anschaffungen durch Sparen zu finanzieren, anstatt sofort zu kaufen oder sich Geld zu leihen.</li>
  </ol>`;

  html += `<p style="font-size:0.9rem; max-width:680px; margin-top:4px;">Rechenweg: _______ Euro ÷ _______ Euro/Monat = _______ Monate</p>`;

  // ── D: Eigene Reflexion ───────────────────────────────────────────────────
  html += `<h2 style="margin-top:2em;">${dL} – Eigene Konsumgewohnheiten reflektieren</h2>`;
  html += `<ol style="max-width:680px; font-size:0.9rem; line-height:2;">
    <li><strong>Nenne</strong> ein Produkt, das du im letzten Monat gekauft hast, und <strong>fülle</strong> die folgende Bewertungstabelle aus.</li>
    <li><strong>Vergleiche</strong> deine Kaufmotive mit denen von ${person.name}: <strong>Stelle</strong> Gemeinsamkeiten und Unterschiede heraus.</li>
    <li><strong>Leite</strong> aus deiner Analyse drei konkrete Maßnahmen ab, mit denen du deinen eigenen Konsum verantwortungsvoller gestalten kannst.</li>
    <li><strong>Erkläre</strong> in eigenen Worten, was unter dem Begriff „verantwortungsvoller Konsum" zu verstehen ist.</li>
  </ol>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">
    <thead><tr style="background:#e8eaf6;">
      <th style="border:1px solid #ccc; padding:8px 12px; width:55%;">Mein Produkt: _________________________________</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:center; width:11.25%;">++</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:center; width:11.25%;">+</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:center; width:11.25%;">–</th>
      <th style="border:1px solid #ccc; padding:8px 12px; text-align:center; width:11.25%;">– –</th>
    </tr></thead><tbody>`;
  for (const k of kriterienReihenfolge) {
    html += `<tr>
      <td style="border:1px solid #ccc; padding:7px 12px;">${kriterienLabel[k]}</td>
      <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
      <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
      <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
      <td style="border:1px solid #ccc; padding:7px 12px;">&nbsp;</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  // ══ LÖSUNG ════════════════════════════════════════════════════════════════
  html += `<h2 style="margin-top:2.5em;">Lösung ${gesamt > 1 ? nr : ''}</h2>`;

  // Lösung A
  html += `<h3 style="margin-top:0;">Lösung ${gesamt > 1 ? nr : ''}A – Einnahmen und Ausgaben</h3>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">
    <thead><tr style="background:#d0e4d0;">
      <th style="border:1px solid #9ec09e; padding:7px 12px; width:65%;">Einnahmequelle</th>
      <th style="border:1px solid #9ec09e; padding:7px 12px; text-align:right; width:35%;">Betrag/Monat (€)</th>
    </tr></thead><tbody>`;
  lfdEin.forEach(e => {
    html += `<tr><td style="border:1px solid #ccc; padding:6px 12px;">${e.label}</td><td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${fmt(e.betrag)} €</td></tr>`;
  });
  html += `<tr style="background:#d0e4d0; font-weight:bold;">
    <td style="border:1px solid #ccc; padding:6px 12px;">Gesamteinnahmen</td>
    <td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${fmt(gesamtEin)} €</td>
  </tr>`;
  if (einmEin.length > 0) {
    html += `<tr><td colspan="2" style="border:1px solid #ccc; padding:6px 12px; font-style:italic; font-size:0.83rem; color:#555;">Ersparnisse (einmalig): ${fmt(ersparnisse)} € – kein Teil der monatlichen Einnahmen</td></tr>`;
  }
  html += `</tbody></table>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px; margin-top:8px;">
    <thead><tr style="background:#fce4ec;">
      <th style="border:1px solid #ccc; padding:7px 12px; width:65%;">Ausgabe</th>
      <th style="border:1px solid #ccc; padding:7px 12px; text-align:right; width:35%;">Betrag/Monat (€)</th>
    </tr></thead><tbody>`;
  ausPosten.forEach(a => {
    html += `<tr><td style="border:1px solid #ccc; padding:6px 12px;">${a.label}</td><td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${fmt(a.betrag)} €</td></tr>`;
  });
  html += `<tr style="background:#fce4ec; font-weight:bold;">
    <td style="border:1px solid #ccc; padding:6px 12px;">Summe Ausgaben</td>
    <td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${fmt(gesamtAus)} €</td>
  </tr>`;
  const sfBg = freiVerfuegbar >= 0 ? 'background:#e8f0f8' : 'background:#ffebee';
  html += `<tr style="font-weight:bold; ${sfBg}">
    <td style="border:1px solid #ccc; padding:6px 12px;">Frei verfügbar (${fmt(gesamtEin)} € − ${fmt(gesamtAus)} €)</td>
    <td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${fmt(freiVerfuegbar)} €</td>
  </tr>`;
  html += `</tbody></table>`;

  // Lösung B
  html += `<h3 style="margin-top:1.6em;">Lösung ${gesamt > 1 ? nr : ''}B – Kaufentscheidung</h3>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">
    <thead><tr style="background:#d0e4d0;">
      <th style="border:1px solid #9ec09e; padding:7px 12px; width:55%;">Kriterium</th>
      <th style="border:1px solid #9ec09e; padding:7px 12px; text-align:center; width:11.25%;">++</th>
      <th style="border:1px solid #9ec09e; padding:7px 12px; text-align:center; width:11.25%;">+</th>
      <th style="border:1px solid #9ec09e; padding:7px 12px; text-align:center; width:11.25%;">–</th>
      <th style="border:1px solid #9ec09e; padding:7px 12px; text-align:center; width:11.25%;">– –</th>
    </tr></thead><tbody>`;
  for (const k of kriterienReihenfolge) {
    const v  = bew[k] || '-';
    html += `<tr>
      <td style="border:1px solid #ccc; padding:6px 12px;">${kriterienLabel[k]}</td>
      <td style="border:1px solid #ccc; padding:6px 12px; text-align:center;">${v === '++' ? '✓' : ''}</td>
      <td style="border:1px solid #ccc; padding:6px 12px; text-align:center;">${v === '+'  ? '✓' : ''}</td>
      <td style="border:1px solid #ccc; padding:6px 12px; text-align:center;">${v === '-'  ? '✓' : ''}</td>
      <td style="border:1px solid #ccc; padding:6px 12px; text-align:center;">${v === '--' ? '✓' : ''}</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  const lBg     = bewLabel === 'kritisch' ? '#ffebee' : '#e8f5e9';
  const lBorder = bewLabel === 'kritisch' ? '#c62828' : '#2e7d32';
  html += `<div style="background:${lBg}; border:1px solid ${lBorder}; border-radius:4px; padding:10px 16px; max-width:680px; font-size:0.88rem; line-height:1.9; margin-top:8px;">
    <strong>Beurteilung:</strong> ${bewIcon} <strong>${bewLabel === 'kritisch' ? 'Kritisch' : 'Vertretbar'}</strong><br>
    ${szenario.begruendung}<br><br>
    <strong>Alternative:</strong> ${szenario.alternative}<br><br>
    <strong>Werbung und soziales Umfeld:</strong> Werbung erzeugt über Bilder von Zugehörigkeit, Status und Anerkennung künstliche Bedürfnisse. Das soziale Umfeld (Freundeskreis, Social Media) verstärkt diesen Druck – wer nicht mitzieht, fürchtet Ausgrenzung. Eine bewusste Kaufentscheidung hinterfragt, ob ein Wunsch wirklich aus eigenem Bedürfnis entsteht oder durch äußeren Druck.
  </div>`;

  // Lösung C
  html += `<h3 style="margin-top:1.6em;">Lösung ${gesamt > 1 ? nr : ''}C – Sparplan</h3>`;
  html += `<div style="background:#f0f5f0; border:1px solid #b8d0b8; border-radius:4px; padding:10px 16px; max-width:680px; font-size:0.88rem; line-height:1.9;">
    <strong>Rechenweg:</strong> ${fmt(sparZiel)} Euro ÷ ${fmt(sparrate)} Euro/Monat = <strong>${monate} Monat${monate !== 1 ? 'e' : ''}</strong><br><br>
    <strong>Begründung – Sparen statt sofort kaufen oder Geld leihen:</strong> Durch Sparen entsteht keine Verschuldung – das Geld ist tatsächlich vorhanden, bevor es ausgegeben wird. ${person.minderjaehrig ? 'Minderjährige dürfen rechtlich keine Kreditverträge abschließen.' : 'Wer sich Geld leiht, muss es zurückzahlen – häufig mit Zinsen, was den Kauf insgesamt verteuert.'} Außerdem entsteht durch die Wartephase eine natürliche Bedenkzeit: Oft stellt sich heraus, dass der Wunsch nach einigen Wochen gar nicht mehr so dringend war.<br><br>
    <strong>Konsequenz des Kaufs ohne Sparen:</strong> ${konsequenz}
  </div>`;

  // Lösung D
  html += `<h3 style="margin-top:1.6em;">Lösung ${gesamt > 1 ? nr : ''}D – Reflexion (Musterschema)</h3>`;
  html += `<div style="background:#f0f5f0; border:1px solid #b8d0b8; border-radius:4px; padding:10px 16px; max-width:680px; font-size:0.88rem; line-height:1.9;">
    <strong>Verantwortungsvoller Konsum</strong> bedeutet, Kaufentscheidungen bewusst, informiert und abwägend zu treffen. Dabei werden Notwendigkeit, finanzielle Möglichkeiten, Qualität und ökologische Auswirkungen berücksichtigt. Ziel ist ein Umgang mit dem eigenen Einkommen, der kurzfristige Impulse hinterfragt, Schulden vermeidet und langfristige Ziele nicht gefährdet.<br><br>
    <strong>Mögliche Maßnahmen:</strong>
    <ul style="margin:6px 0 0 18px; line-height:2;">
      <li>Vor jedem Kauf die Fragen stellen: „Brauche ich das wirklich?" und „Kann ich es mir leisten?"</li>
      <li>Die 24-Stunden-Regel anwenden: Größere Anschaffungen einen Tag aufschieben und erneut überdenken.</li>
      <li>Monatlich einen festen Sparbetrag zurücklegen, <em>bevor</em> Geld für Konsum ausgegeben wird.</li>
      <li>Laufende Abonnements regelmäßig auf dem Kontoauszug prüfen und nicht genutzte kündigen.</li>
      <li>Gebrauchte oder nachhaltige Alternativen prüfen, bevor ein Neukauf getätigt wird.</li>
    </ul>
  </div>`;

  return html;
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================
function zeigeZufaelligeKonsumaufgaben() {
  const container  = document.getElementById('Container');
  if (!container) return;

  const typFilter  = document.getElementById('typFilter')?.value   || 'alle';
  const anzahl     = parseInt(document.getElementById('anzahlAufgaben')?.value) || 1;

  letzteGenerierteKonsumaufgaben = [];
  const genutzteKategorien = [];

  for (let i = 0; i < anzahl; i++) {
    let data, versuche = 0;
    do {
      data = erstelleKonsumaufgabe(typFilter);
      versuche++;
    } while (genutzteKategorien.includes(data.szenario.kategorie) && versuche < 10);
    genutzteKategorien.push(data.szenario.kategorie);
    letzteGenerierteKonsumaufgaben.push(data);
  }

  let html = '';
  letzteGenerierteKonsumaufgaben.forEach((data, idx) => {
    html += renderKonsumaufgabeBlock(data, idx + 1, anzahl);
  });
  container.innerHTML = html;

  // KI-Prompt aktualisieren falls Vorschau sichtbar
  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && getComputedStyle(vorschau).display !== 'none') {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================
const KI_SYSTEM_PROMPT = `
Du bist ein freundlicher Lernassistent für Schülerinnen und Schüler der bayerischen Realschule (BwR, Klasse 7). Du hilfst beim Analysieren von Konsumgewohnheiten und Kaufentscheidungen.

Aufgabe:
- Gib KEINE fertigen Lösungen direkt vor.
- Führe die Lernenden durch gezielte Fragen zur richtigen Lösung.
- Ziel: eigenes Denken und Urteilen fördern.

Wichtige Begriffe (korrekt verwenden!):
- Einnahmen = Geld, das regelmäßig zur Verfügung steht (Taschengeld, Lohn, BAföG …)
- Ausgaben = Geld, das regelmäßig ausgegeben wird (Miete, Lebensmittel, Handy …)
- Frei verfügbar = Einnahmen – Ausgaben
- Kaufkriterien: Notwendigkeit, Kosten, Qualität, Nachhaltigkeit, Prestige, Trend
- Vertretbar = Kauf ist finanziell und inhaltlich begründbar
- Kritisch = Kauf birgt finanzielle Risiken oder ist impulsgesteuert
- Sparplan = monatliche Rücklage für ein konkretes Sparziel

Pädagogischer Ansatz (Sokratische Methode):
- Frage, was die Schülerin / der Schüler als Erstes tun würde.
- Stelle gezielte Rückfragen wie: „Welche Kriterien sprechen für den Kauf, welche dagegen?"
- Beantworte deine Rückfragen NICHT selbst.
- Bei Rechenfehlern: Lass neu rechnen, erkläre den Weg, nenne nicht das Ergebnis.
- Erst wenn die Schülerin / der Schüler selbst auf die richtige Antwort kommt, bestätige sie / ihn.



Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, kurze Sätze
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 🛒💡✅💰

Was du NICHT tust:
- Nenne die Beurteilung (kritisch / vertretbar) nicht, bevor die Schülerin / der Schüler selbst geurteilt hat.
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort".
- Minderjährige dürfen keine Kreditverträge abschließen – weise darauf hin, falls relevant.

Begrüße die Schülerin / den Schüler freundlich und wähle ein Fallbeispiel aus der Liste aus.
Wenn eine Aufgabe abgeschlossen ist, frage: „Möchtest du das nächste Fallbeispiel bearbeiten?"

Alle Aufgaben mit Musterlösungen:
###AUFGABEN###
`;

function erstelleKiPromptText() {
  let inhalt = '';
  if (letzteGenerierteKonsumaufgaben.length === 0) {
    inhalt = '(Noch keine Aufgaben generiert. Bitte zuerst Aufgaben erstellen.)';
  } else {
    inhalt = letzteGenerierteKonsumaufgaben.map((data, idx) => {
      const { person, lfdEin, ausPosten, gesamtEin, gesamtAus, freiVerfuegbar, szenario, preisBez, sparrate, sparZiel, monate } = data;
      const einStr = lfdEin.map(e => `  - ${e.label}: ${fmt(e.betrag)} €`).join('\n');
      const ausStr = ausPosten.map(a => `  - ${a.label}: ${fmt(a.betrag)} €`).join('\n');
      return `--- Aufgabe ${idx + 1}: ${person.name} (${person.typ}) ---
Persona: ${person.typ}

Einnahmen:
${einStr}
  Gesamt: ${fmt(gesamtEin)} €

Ausgaben:
${ausStr}
  Gesamt: ${fmt(gesamtAus)} €
  Frei verfügbar: ${fmt(freiVerfuegbar)} €

Kaufszenario: ${szenario.produkt} (${preisBez})
Kategorie: ${szenario.kategorie}
Bewertung: ${szenario.bewertung.toUpperCase()}
Begründung: ${szenario.begruendung}
Alternative: ${szenario.alternative}

Sparplan:
  Sparrate: ${fmt(sparrate)} €/Monat
  Sparziel: ${fmt(sparZiel)} €
  Dauer: ${monate} Monate`;
    }).join('\n\n');
  }
  return KI_SYSTEM_PROMPT.replace('###AUFGABEN###', inhalt);
}

function kopiereKiPrompt() {
  const promptText = erstelleKiPromptText();
  navigator.clipboard.writeText(promptText).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
  }).catch(() => alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.'));
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
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    zeigeZufaelligeKonsumaufgaben();
  }, 500);
});