const zufallsnamen = [
  { vorname: 'Anna', nachname: 'Bauer', geschlecht: 'w' },
  { vorname: 'Markus', nachname: 'Huber', geschlecht: 'm' },
  { vorname: 'Sandra', nachname: 'Gruber', geschlecht: 'w' },
  { vorname: 'Thomas', nachname: 'Maier', geschlecht: 'm' },
  { vorname: 'Lisa', nachname: 'Schmid', geschlecht: 'w' },
  { vorname: 'Eren', nachname: 'Wagner', geschlecht: 'm' },
  { vorname: 'Julia', nachname: 'Fischer', geschlecht: 'w' },
  { vorname: 'Stefan', nachname: 'Berger', geschlecht: 'm' },
  { vorname: 'Katharina', nachname: 'Wolf', geschlecht: 'w' },
  { vorname: 'Andreas', nachname: 'Zimmermann', geschlecht: 'm' },
  { vorname: 'Maria', nachname: 'Braun', geschlecht: 'w' },
  { vorname: 'Klaus', nachname: 'Hartmann', geschlecht: 'm' },
  { vorname: 'Petra', nachname: 'Schreiber', geschlecht: 'w' },
  { vorname: 'Florian', nachname: 'Klein', geschlecht: 'm' },
  { vorname: 'Monika', nachname: 'Kraus', geschlecht: 'w' },
  { vorname: 'Christian', nachname: 'Celek', geschlecht: 'm' },
  { vorname: 'Tobias', nachname: 'Jackson', geschlecht: 'm' },
  { vorname: 'Claudia', nachname: 'Weiss', geschlecht: 'w' },
  { vorname: 'Martin', nachname: 'Schulz', geschlecht: 'm' },
  { vorname: 'Nicole', nachname: 'Frank', geschlecht: 'w' },
  { vorname: 'Werner', nachname: 'Probst', geschlecht: 'm' },
  { vorname: 'Andrea', nachname: 'Lehmann', geschlecht: 'w' },
  { vorname: 'Rainer', nachname: 'Khan', geschlecht: 'm' },
  { vorname: 'Susanne', nachname: 'Keller', geschlecht: 'w' },
  { vorname: 'Mia', nachname: 'Baumann', geschlecht: 'w' },
  { vorname: 'Konrad', nachname: 'Frei', geschlecht: 'm' },
  { vorname: 'Ali', nachname: 'Yilmaz', geschlecht: 'm' },
  { vorname: 'Erwin', nachname: 'Ziegler', geschlecht: 'm' },
];

function zufallsname(ausschluss = []) {
  const v = zufallsnamen.filter(n => !ausschluss.includes(n.nachname));
  return v[Math.floor(Math.random() * v.length)];
}

function ersetzeText(text, person) {
  const w = person.geschlecht === 'w';
  return text
    .replace(/\{vorname\}/g, person.vorname)
    .replace(/\{nachname\}/g, person.nachname)
    .replace(/\{Er_Sie\}/g, w ? 'Sie' : 'Er')
    .replace(/\{er_sie\}/g, w ? 'sie' : 'er')
    .replace(/\{Sein_Ihr\}/g, w ? 'Ihr' : 'Sein')
    .replace(/\{sein_ihr\}/g, w ? 'ihr' : 'sein')
    .replace(/\{seinen_ihren\}/g, w ? 'ihren' : 'seinen')
    .replace(/\{seiner_ihrer\}/g, w ? 'ihrer' : 'seiner')
    .replace(/\{seine_ihre\}/g, w ? 'ihre' : 'seine')
    .replace(/\{ihn_sie\}/g, w ? 'sie' : 'ihn')
    .replace(/\{Mitarbeiter_in\}/g, w ? 'Mitarbeiterin' : 'Mitarbeiter');
}

// kategorie: 'gesetzlich' oder 'tariflich'
const faelle = [
  // ───────────── GESETZLICH ─────────────
  {
    kategorie: 'gesetzlich',
    situation: 'Rentenversicherung',
    sachverhalt: 'Die Bäckerei Kraus überweist jeden Monat ihren Anteil am Beitrag zur Rentenversicherung für {vorname} {nachname}.',
    begruendung: 'Der Arbeitgeberanteil zur Sozialversicherung ist gesetzlich vorgeschrieben. Der Betrieb muss ihn zahlen, egal ob er will oder nicht.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Krankenversicherung',
    sachverhalt: 'Für {vorname} {nachname} zahlt die Schreinerei Huber den Arbeitgeberanteil zur gesetzlichen Krankenversicherung.',
    begruendung: 'Der Arbeitgeberanteil zur Krankenversicherung ist gesetzlich geregelt (Sozialversicherung) und damit Pflicht.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Arbeitslosenversicherung',
    sachverhalt: 'Die Autowerkstatt Berger führt für {vorname} {nachname} den Arbeitgeberanteil zur Arbeitslosenversicherung ab.',
    begruendung: 'Die Arbeitslosenversicherung gehört zur gesetzlichen Sozialversicherung. Der Arbeitgeberanteil ist Pflicht.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Pflegeversicherung',
    sachverhalt: 'Das Autohaus Maier zahlt für {vorname} {nachname} den Arbeitgeberanteil zur Pflegeversicherung.',
    begruendung: 'Die Pflegeversicherung ist Teil der gesetzlichen Sozialversicherung. Der Arbeitgeberanteil ist gesetzlich vorgeschrieben.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Unfallversicherung',
    sachverhalt: 'Die Baufirma Gruber zahlt Beiträge an die Berufsgenossenschaft. Damit sind {vorname} {nachname} und alle anderen Beschäftigten bei Arbeitsunfällen versichert.',
    begruendung: 'Die gesetzliche Unfallversicherung (Berufsgenossenschaft) zahlt allein der Arbeitgeber. Sie ist gesetzlich vorgeschrieben.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Entgeltfortzahlung',
    sachverhalt: '{vorname} {nachname} ist zwei Wochen krank. Der Arbeitgeber zahlt {ihn_sie} in dieser Zeit weiter den vollen Lohn.',
    begruendung: 'Die Entgeltfortzahlung im Krankheitsfall (bis zu sechs Wochen) ist im Entgeltfortzahlungsgesetz vorgeschrieben.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Gesetzliche Feiertage',
    sachverhalt: 'An Weihnachten und am Tag der Deutschen Einheit bleibt der Betrieb geschlossen. {vorname} {nachname} erhält trotzdem den normalen Lohn.',
    begruendung: 'Die Bezahlung an gesetzlichen Feiertagen ist gesetzlich vorgeschrieben (Entgeltfortzahlungsgesetz).'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Gesetzlicher Urlaub',
    sachverhalt: '{vorname} {nachname} nimmt den gesetzlichen Mindesturlaub von 20 Tagen (bei einer Fünf-Tage-Woche). Der Lohn wird in dieser Zeit weitergezahlt.',
    begruendung: 'Der bezahlte Mindesturlaub steht jedem Arbeitnehmer nach dem Bundesurlaubsgesetz zu.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Mutterschutz',
    sachverhalt: 'Die Mitarbeiterin {vorname} {nachname} ist im Mutterschutz. Die Krankenkasse zahlt Mutterschaftsgeld, den Rest bis zum bisherigen Nettolohn zahlt der Arbeitgeber.',
    begruendung: 'Der Arbeitgeberzuschuss zum Mutterschaftsgeld ist im Mutterschutzgesetz (§ 20 MuSchG) vorgeschrieben. Der Betrieb muss die Differenz zum bisherigen Nettolohn zahlen.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Entgeltfortzahlung',
    sachverhalt: '{vorname} {nachname} bricht sich beim Sport das Bein und fällt vier Wochen aus. Der Arbeitgeber zahlt das Gehalt in dieser Zeit weiter.',
    begruendung: 'Der Arbeitgeber ist gesetzlich verpflichtet, das Entgelt bei Krankheit bis zu sechs Wochen weiterzuzahlen.'
  },
  {
    kategorie: 'gesetzlich',
    situation: 'Sozialversicherung',
    sachverhalt: 'Bei der Lohnabrechnung von {vorname} {nachname} fallen neben dem Bruttolohn noch Beiträge des Arbeitgebers an Renten-, Kranken-, Pflege- und Arbeitslosenversicherung an.',
    begruendung: 'Der Arbeitgeberanteil zur Sozialversicherung ist gesetzlich vorgeschrieben.'
  },

// ───────────── TARIFLICH / BETRIEBLICH ─────────────
  {
    kategorie: 'tariflich',
    situation: 'Weihnachtsgeld',
    sachverhalt: 'Laut Tarifvertrag erhält {vorname} {nachname} im November ein Weihnachtsgeld in Höhe eines halben Monatsgehalts.',
    begruendung: 'Weihnachtsgeld ist nicht gesetzlich vorgeschrieben. Es beruht auf dem Tarifvertrag und stellt damit tarifliche Personalzusatzkosten dar.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Urlaubsgeld',
    sachverhalt: 'Vor dem Sommerurlaub bekommt {vorname} {nachname} vom Arbeitgeber zusätzlich 500 € Urlaubsgeld.',
    begruendung: 'Urlaubsgeld ist eine freiwillige oder tarifliche Leistung. Einen gesetzlichen Anspruch darauf gibt es nicht.'
  },
  {
    kategorie: 'tariflich',
    situation: '13. Monatsgehalt',
    sachverhalt: 'Im Arbeitsvertrag von {vorname} {nachname} steht ein 13. Monatsgehalt, das im Dezember ausgezahlt wird.',
    begruendung: 'Ein 13. Gehalt wird vertraglich, tariflich oder betrieblich vereinbart und ist somit keine gesetzliche Vorgabe.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Vermögenswirksame Leistungen',
    sachverhalt: 'Der Betrieb zahlt {vorname} {nachname} jeden Monat 40 € als vermögenswirksame Leistung in einen Bausparvertrag.',
    begruendung: 'Der Arbeitgeberzuschuss zu vermögenswirksamen Leistungen wird im Tarif- oder Arbeitsvertrag vereinbart.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Betriebliche Altersvorsorge',
    sachverhalt: 'Der Arbeitgeber schließt für {vorname} {nachname} freiwillig eine Direktversicherung ab und zahlt die Beiträge allein.',
    begruendung: 'Die zusätzliche betriebliche Altersvorsorge ist eine freiwillige betriebliche Leistung des Arbeitgebers.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Jubiläumsgeld',
    sachverhalt: '{vorname} {nachname} feiert 25 Jahre Betriebszugehörigkeit und erhält vom Arbeitgeber eine Jubiläumsprämie von 1.000 €.',
    begruendung: 'Jubiläumszuwendungen sind freiwillige betriebliche Leistungen ohne gesetzlichen Anspruch.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Kantinenzuschuss',
    sachverhalt: 'In der Kantine des Unternehmens bezahlt {vorname} {nachname} nur 3 € für das Mittagessen. Den Rest übernimmt der Betrieb.',
    begruendung: 'Der Essenszuschuss ist eine freiwillige betriebliche Sozialleistung.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Fahrtkostenzuschuss',
    sachverhalt: 'Der Arbeitgeber übernimmt für {vorname} {nachname} die Kosten für das Jobticket des öffentlichen Nahverkehrs.',
    begruendung: 'Der Zuschuss zu den Fahrtkosten ist freiwillig und beruht auf einer betrieblichen Vereinbarung.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Zusätzliche Urlaubstage',
    sachverhalt: 'Nach dem Tarifvertrag hat {vorname} {nachname} 30 Urlaubstage. Gesetzlich wären nur 20 Tage vorgeschrieben.',
    begruendung: 'Die Urlaubstage über den gesetzlichen Mindesturlaub hinaus beruhen auf dem Tarifvertrag.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Betriebsfeier',
    sachverhalt: 'Jedes Jahr lädt die Geschäftsführung alle Beschäftigten, auch {vorname} {nachname}, auf Firmenkosten zur Weihnachtsfeier ein.',
    begruendung: 'Betriebsfeiern sind freiwillige betriebliche Leistungen des Arbeitgebers.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Betriebliche Fortbildung',
    sachverhalt: 'Der Arbeitgeber bezahlt {vorname} {nachname} einen Sprachkurs und gibt {ihn_sie} dafür bezahlt frei. Die Fortbildung ist freiwillig.',
    begruendung: 'Freiwillige Fort- und Weiterbildungen, die der Betrieb bezahlt, gelten als betriebliche Leistungen.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Kinderbetreuung',
    sachverhalt: 'Der Betrieb zahlt {vorname} {nachname} monatlich einen Zuschuss zu den Kita-Kosten.',
    begruendung: 'Der Zuschuss zur Kinderbetreuung ist eine freiwillige betriebliche Sozialleistung.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Gewinnbeteiligung',
    sachverhalt: 'Weil das Geschäftsjahr gut lief, zahlt der Arbeitgeber allen Beschäftigten, auch {vorname} {nachname}, eine Erfolgsprämie von 800 €.',
    begruendung: 'Prämien und Gewinnbeteiligungen sind freiwillige oder vertraglich vereinbarte betriebliche Leistungen.'
  },
  {
    kategorie: 'tariflich',
    situation: 'Firmenwagen',
    sachverhalt: '{vorname} {nachname} darf den Firmenwagen auch privat nutzen. So steht es im Arbeitsvertrag.',
    begruendung: 'Die private Nutzung eines Firmenwagens wird individuell vereinbart. Einen gesetzlichen Anspruch darauf gibt es nicht.'
  },
];

const KATEGORIE_LABEL = {
  gesetzlich: 'Gesetzliche Personalzusatzkosten',
  tariflich: 'Tarifliche/betriebliche Personalzusatzkosten'
};

function kategorieLabel(k) {
  return KATEGORIE_LABEL[k] || k;
}

let letzteGenerierteAufgaben = [];

const KI_PROMPT = `Du bist ein freundlicher Lernassistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst beim Verständnis der Personalzusatzkosten.

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib KEINE fertigen Lösungen vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Einschätzung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach konkreten Hinweisen im Beispiel (Wer schreibt die Zahlung vor? Muss der Betrieb zahlen oder tut er es freiwillig?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler die richtige Zuordnung erarbeitet hat, bestätige sie.

Begrüße den Schüler freundlich und gib ihm eine Aufgabe aus der folgenden Aufgabenliste vor.
Arbeitsauftrag: „Lies das Beispiel und entscheide: Handelt es sich um gesetzliche oder um tarifliche/betriebliche Personalzusatzkosten?"

Aufgabenliste:

###AUFGABEN und LOESUNGEN###

Methodik bei Rückfragen:
- Was zahlt oder leistet der Arbeitgeber im Beispiel genau?
- Muss der Arbeitgeber das nach einem Gesetz tun?
- Oder steht es in einem Tarifvertrag, im Arbeitsvertrag oder ist es eine freiwillige Leistung des Betriebs?
- Gibt es einen Anspruch für alle Arbeitnehmer in Deutschland?

Die zwei Arten von Personalzusatzkosten:

Personalzusatzkosten sind Kosten, die dem Arbeitgeber zusätzlich zum Bruttoarbeitsentgelt für die Beschäftigten entstehen.

1. Gesetzliche Personalzusatzkosten
   - Der Arbeitgeber muss sie wegen eines Gesetzes zahlen
   - Beispiele: Arbeitgeberanteil zur Sozialversicherung (Renten-, Kranken-, Arbeitslosen-, Pflegeversicherung), Beitrag zur Unfallversicherung (Berufsgenossenschaft), Entgeltfortzahlung im Krankheitsfall, Bezahlung an gesetzlichen Feiertagen, gesetzlicher Mindesturlaub, Umlagen (U1, U2, U3), Zuschuss zum Mutterschaftsgeld

2. Tarifliche/betriebliche Personalzusatzkosten
   - Sie beruhen auf einem Tarifvertrag, einer Betriebsvereinbarung, dem Arbeitsvertrag oder sind freiwillige Leistungen des Betriebs
   - Beispiele: Weihnachtsgeld, Urlaubsgeld, 13. Monatsgehalt, vermögenswirksame Leistungen, betriebliche Altersvorsorge, Jubiläumsgeld, Essens- und Fahrtkostenzuschuss, zusätzliche Urlaubstage über den gesetzlichen Mindesturlaub hinaus, Betriebsfeiern, Firmenwagen zur privaten Nutzung

Typische Fehler der Schüler:
- Der Bruttolohn selbst gehört NICHT zu den Personalzusatzkosten, es geht um die Kosten zusätzlich zum Lohn
- Bei der Sozialversicherung zählt nur der Arbeitgeberanteil. Der Arbeitnehmeranteil wird vom Lohn abgezogen
- Weihnachts- und Urlaubsgeld sind nicht gesetzlich vorgeschrieben, auch wenn viele Betriebe sie zahlen
- Beim Urlaub: Der gesetzliche Mindesturlaub ist gesetzlich, zusätzliche Tage laut Tarifvertrag sind tariflich
- „Freiwillig" bedeutet nicht, dass es nichts kostet. Es sind trotzdem Personalzusatzkosten

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 💶📋🔍❓✅

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch eine weitere Aufgabe üben?"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor.`;

function erstelleKiPromptText() {
  if (letzteGenerierteAufgaben.length === 0) return KI_PROMPT.replace("###AUFGABEN und LOESUNGEN###", "(Noch keine Aufgaben generiert.)");
  const aufgabenText = letzteGenerierteAufgaben.map(({ fall, sachverhalt, begruendung }, idx) => {
    return `Aufgabe ${idx + 1}:\n${sachverhalt}\n\nMusterlösung ${idx + 1}:\nArt der Personalzusatzkosten: ${kategorieLabel(fall.kategorie)}\nBegründung: ${begruendung}`;
  }).join("\n\n---\n\n");
  return KI_PROMPT.replace("###AUFGABEN und LOESUNGEN###", aufgabenText);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Zieht n Fälle aus dem Pool (ohne Wiederholung, solange der Pool reicht)
function nimm(pool, n) {
  let r = [];
  while (r.length < n) r = r.concat(shuffle(pool));
  return r.slice(0, n);
}

// Bei "alle": ausgewogen ca. 50 % gesetzlich / 50 % tariflich, dann mischen
function waehleAufgaben(anzahl, filter) {
  if (filter !== 'alle') {
    return nimm(faelle.filter(f => f.kategorie === filter), anzahl);
  }
  const gesetzlich = faelle.filter(f => f.kategorie === 'gesetzlich');
  const tariflich = faelle.filter(f => f.kategorie === 'tariflich');
  const nG = Math.floor(anzahl / 2) + (anzahl % 2 && Math.random() < 0.5 ? 1 : 0);
  const nT = anzahl - nG;
  return shuffle([...nimm(gesetzlich, nG), ...nimm(tariflich, nT)]);
}

function generiereAufgaben() {
  const anzahl = parseInt(document.getElementById('anzahl').value) || 4;
  const filter = document.getElementById('filter').value;
  const container = document.getElementById('Container');
  if (!container) return;

  const ausgewaehlt = waehleAufgaben(anzahl, filter);

  const verwendeteNachname = [];
  letzteGenerierteAufgaben = ausgewaehlt.map(fall => {
    const person = zufallsname(verwendeteNachname);
    verwendeteNachname.push(person.nachname);
    return {
      fall,
      person,
      sachverhalt: ersetzeText(fall.sachverhalt, person),
      begruendung: ersetzeText(fall.begruendung, person),
    };
  });

  // --- AUFGABEN-TABELLE ---
  let aufgabenHTML = `
    <h2>Aufgaben</h2>
    <p><strong>Arbeitsauftrag:</strong><br>Lies die Beispiele und kreuze in der jeweiligen Zeile an, ob es sich um gesetzliche oder um tarifliche/betriebliche Personalzusatzkosten handelt.</p>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 15px; margin-top: 10px;">
        <thead>
          <tr style="background: #f4f4f4; border-bottom: 2px solid #333;">
            <th style="border: 0.5px solid #333; padding: 10px; text-align: left; width: 60%;">Beispiel (Sachverhalt)</th>
            <th style="border: 0.5px solid #333; padding: 10px; text-align: center; width: 20%;">Gesetzliche Personalzusatzkosten</th>
            <th style="border: 0.5px solid #333; padding: 10px; text-align: center; width: 20%;">Tarifliche / betriebliche Personalzusatzkosten</th>
          </tr>
        </thead>
        <tbody>
  `;

  letzteGenerierteAufgaben.forEach(({ fall, sachverhalt }, idx) => {
    aufgabenHTML += `
      <tr class="pz-aufgabe" data-kategorie="${fall.kategorie}">
        <td style="border: 0.5px solid #333; padding: 10px; vertical-align: top;">
          <strong>${idx + 1}. ${fall.situation}</strong>
          <p style="margin: 6px 0 0 0; line-height: 1.5;">${sachverhalt}</p>
        </td>
        <td style="border: 0.5px solid #333; padding: 10px; text-align: center; vertical-align: middle;">
          <input type="checkbox" name="aufgabe_${idx}_gesetzlich" value="gesetzlich" style="transform: scale(1.3); cursor: pointer;">
        </td>
        <td style="border: 0.5px solid #333; padding: 10px; text-align: center; vertical-align: middle;">
          <input type="checkbox" name="aufgabe_${idx}_tariflich" value="tariflich" style="transform: scale(1.3); cursor: pointer;">
        </td>
      </tr>
    `;
  });

  aufgabenHTML += `
        </tbody>
      </table>
    </div>
  `;

  // --- LÖSUNGS-TABELLE ---
  let loesungenHTML = `
    <br>
    <h2 class="loesung">Lösungen</h2>
    <div class="loesungen-wrap" style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 15px; margin-top: 10px;">
        <thead>
          <tr style="background: #f4f4f4; border-bottom: 2px solid #333;">
            <th style="border: 0.5px solid #333; padding: 10px; text-align: left; width: 50%;">Beispiel &amp; Begründung</th>
            <th style="border: 0.5px solid #333; padding: 10px; text-align: center; width: 25%;">Gesetzliche Personalzusatzkosten</th>
            <th style="border: 0.5px solid #333; padding: 10px; text-align: center; width: 25%;">Tarifliche / betriebliche Personalzusatzkosten</th>
          </tr>
        </thead>
        <tbody>
  `;

  letzteGenerierteAufgaben.forEach(({ fall, begruendung }, idx) => {
    const istGesetzlich = fall.kategorie === 'gesetzlich';
    
    loesungenHTML += `
      <tr>
        <td style="border: 0.5px solid #333; padding: 10px; vertical-align: top;">
          <strong>${idx + 1}. ${fall.situation}</strong>
          <p style="margin: 6px 0 8px 0; line-height: 1.5; font-size: 14px;">${begruendung}</p>
        </td>
        <td style="border: 0.5px solid #333; padding: 10px; text-align: center; vertical-align: middle; background: ${istGesetzlich ? '#FAECE7' : 'transparent'};">
          <span style="font-size: 20px; color: ${istGesetzlich ? '#993C1D' : '#ccc'};">${istGesetzlich ? '☑' : '☐'}</span>
        </td>
        <td style="border: 0.5px solid #333; padding: 10px; text-align: center; vertical-align: middle; background: ${!istGesetzlich ? '#E1F5EE' : 'transparent'};">
          <span style="font-size: 20px; color: ${!istGesetzlich ? '#0F6E56' : '#ccc'};">${!istGesetzlich ? '☑' : '☐'}</span>
        </td>
      </tr>
    `;
  });

  loesungenHTML += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = aufgabenHTML + loesungenHTML;

  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && vorschau.style.display !== 'none') {
    vorschau.textContent = erstelleKiPromptText();
  }
}

function kopiereKiPrompt() {
  const text = erstelleKiPromptText();
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    btn.textContent = 'Kopiert!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Prompt kopieren'; btn.classList.remove('copied'); }, 2500);
  }).catch(() => alert('Kopieren nicht möglich.'));
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const hidden = getComputedStyle(vorschau).display === 'none';
  if (hidden) {
    vorschau.style.display = 'block';
    vorschau.textContent = erstelleKiPromptText();
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

// ============================================================================
// MOODLE-XML-EXPORT – PERSONALZUSATZKOSTEN – Fragetyp „Zuordnung“ (matching),
// alle Aufgaben in EINER Frage
// Liest die Aufgaben-Boxen (.pz-aufgabe) direkt aus der Seite – inklusive
// Änderungen im bearbeitbaren Bereich. Button: onclick="exportiereMoodle()"
// ============================================================================

const MOODLE_PZ_PRAEFIX = '8.5-01#T';   // ANPASSEN: Kennung Ihrer Aufgabensammlung
const MOODLE_PZ_TITELENDE = 'meinBwR-Zuordnen';
const MOODLE_PZ_ANWEISUNG = 'Entscheide jeweils, ob es sich um gesetzliche oder um tarifliche/betriebliche Personalzusatzkosten handelt.';
const MOODLE_PZ_PUNKTE_PRO_AUFGABE = 1;
const MOODLE_PZ_ABLENKER = [];          // optional z. B. ['weder noch'] als zusätzliche falsche Antwort

function mfEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mfCdata(s) {
  return '<![CDATA[' + String(s ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
}

// Eindeutige, zeitabhängige ID (yyMMddHHmmss), pro Browser streng aufsteigend
function mfIdBasis() {
  const SCHLUESSEL = 'moodlePzLetzteIdSekunde';
  let sek = Math.floor(Date.now() / 1000);
  try {
    const letzte = Number(localStorage.getItem(SCHLUESSEL)) || 0;
    if (sek <= letzte) sek = letzte + 1;
    localStorage.setItem(SCHLUESSEL, String(sek));
  } catch (e) { /* ohne localStorage: nur Zeitstempel */ }
  const d = new Date(sek * 1000);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getFullYear() % 100)}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// Liest Sachverhalt und Kategorie aus den Aufgaben-Boxen
function mfLeseAufgaben() {
  const boxen = document.querySelectorAll('#Container .pz-aufgabe');
  const aufgaben = [];
  boxen.forEach(box => {
    const p = box.querySelector('p');
    const text = p ? p.textContent.replace(/\s+/g, ' ').trim() : '';
    const label = kategorieLabel(box.dataset.kategorie || '');
    if (text && box.dataset.kategorie) aufgaben.push({ text, label });
  });
  return aufgaben;
}

function mfBaueMatchingXml(aufgaben) {
  const punkte = aufgaben.length * MOODLE_PZ_PUNKTE_PRO_AUFGABE;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
  xml += `  <question type="matching">\n`;
  const titel = `${MOODLE_PZ_PRAEFIX}${mfIdBasis()}${MOODLE_PZ_TITELENDE}`;
  xml += `    <name>\n      <text>${mfEsc(titel)}</text>\n    </name>\n`;
  xml += `    <questiontext format="html">\n      <text>${mfCdata(`<p>${MOODLE_PZ_ANWEISUNG}</p>`)}</text>\n    </questiontext>\n`;
  xml += `    <generalfeedback format="html">\n      <text></text>\n    </generalfeedback>\n`;
  xml += `    <defaultgrade>${punkte}</defaultgrade>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n`;
  xml += `    <shuffleanswers>true</shuffleanswers>\n`;
  xml += `    <correctfeedback format="html">\n      <text>${mfCdata('<p>Die Antwort ist richtig.</p>')}</text>\n    </correctfeedback>\n`;
  xml += `    <partiallycorrectfeedback format="html">\n      <text>${mfCdata('<p>Die Antwort ist teilweise richtig.</p>')}</text>\n    </partiallycorrectfeedback>\n`;
  xml += `    <incorrectfeedback format="html">\n      <text>${mfCdata('<p>Die Antwort ist falsch.</p>')}</text>\n    </incorrectfeedback>\n`;
  xml += `    <shownumcorrect/>\n`;

  aufgaben.forEach(({ text, label }) => {
    xml += `    <subquestion format="html">\n`;
    xml += `      <text>${mfCdata(`<p>${mfEsc(text)}</p><hr>`)}</text>\n`;
    xml += `      <answer>\n        <text>${mfEsc(label)}</text>\n      </answer>\n`;
    xml += `    </subquestion>\n`;
  });

  // Zusätzliche falsche Antworten (leere Frage + Antwort)
  MOODLE_PZ_ABLENKER.forEach(a => {
    xml += `    <subquestion format="html">\n      <text></text>\n`;
    xml += `      <answer>\n        <text>${mfEsc(a)}</text>\n      </answer>\n    </subquestion>\n`;
  });

  xml += `  </question>\n\n</quiz>\n`;
  return xml;
}

function exportiereMoodle() {
  const aufgaben = mfLeseAufgaben();
  if (!aufgaben.length) {
    alert('Bitte zuerst Aufgaben erstellen.');
    return;
  }
  const xml = mfBaueMatchingXml(aufgaben);

  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const dateiname = `quiz-personalzusatzkosten-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

generiereAufgaben();