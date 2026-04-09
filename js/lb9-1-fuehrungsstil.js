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

function zufallsname(ausschluss=[]) {
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
    .replace(/\{Mitarbeiter_in\}/g, w ? 'Mitarbeiterin' : 'Mitarbeiter')
    .replace(/\{den_die_chef\}/g, w ? 'die Chefin' : 'den Chef')
    .replace(/\{Vorgesetzte_r\}/g, w ? 'Vorgesetzte' : 'Vorgesetzter');
}

const faelle = [
  {
    stil: 'autoritativ',
    situation: 'Anweisungen & Kontrolle',
    sachverhalt: '{vorname} {nachname} leitet die Produktion in einer Metallfabrik. {Er_Sie} gibt {seinen_ihren} Mitarbeitern klare und detaillierte Arbeitsanweisungen und erwartet, dass diese präzise umgesetzt werden. Verbesserungsvorschläge der Belegschaft werden von {ihm_ihr} nicht aufgegriffen, da {er_sie} die Verantwortung für die Abläufe trägt.',
    begruendung: 'Typisch autoritativer Führungsstil: Die Führungskraft trifft Entscheidungen allein, erteilt klare Anweisungen und lässt wenig Raum für Diskussion. Die Mitarbeiter haben begrenzten Entscheidungsspielraum.'
  },
  {
    stil: 'kooperativ',
    situation: 'Entscheidung im Team',
    sachverhalt: '{vorname} {nachname} ist Abteilungsleiter/-in einer Marketingagentur. Bevor {er_sie} eine neue Kampagnenstrategie festlegt, bespricht {er_sie} die Ideen gemeinsam mit dem Team. Alle Mitglieder können Vorschläge einbringen, Bedenken äußern und abstimmen. Die endgültige Entscheidung trifft {er_sie} erst, nachdem alle gehört wurden.',
    begruendung: 'Typisch Die Führungskraft bezieht das Team aktiv in Entscheidungsprozesse ein, hört Meinungen an und lässt Mitsprache zu. Die Mitarbeiter können ihre Ideen einbringen.'
  },
  {
    stil: 'autoritativ',
    situation: 'Krisensituation',
    sachverhalt: 'Im Lager von {vorname} {nachname} bricht ein Brand aus. {Er_Sie} ruft sofort: „Alle sofort raus durch den Hinterausgang!“ und koordiniert die Evakuierung eigenständig. In dieser Situation werden keine Rückfragen zugelassen, alle folgen den Anweisungen.',
    begruendung: 'In Krisensituationen ist ein autoritativer Führungsstil oft notwendig und gerechtfertigt: Schnelle, klare Entscheidungen einer Person schützen die Sicherheit aller. Diskussionen wären hier nicht zielführend.'
  },
  {
    stil: 'kooperativ',
    situation: 'Problemlösung im Team',
    sachverhalt: 'In der IT-Abteilung von {vorname} {nachname} häufen sich Kundenbeschwerden wegen langer Wartezeiten. Statt selbst eine Lösung anzuordnen, lädt {er_sie} das Team zu einer Besprechung ein. Gemeinsam analysieren alle die Ursachen und erarbeiten einen Maßnahmenplan, hinter dem das gesamte Team steht.',
    begruendung: 'Die Führungskraft nutzt das Wissen und die Erfahrung der Mitarbeiter zur Problemlösung. Das stärkt die Motivation und führt oft zu besseren Lösungen.'
  },
  {
    stil: 'autoritativ',
    situation: 'Urlaubsplanung',
    sachverhalt: '{vorname} {nachname} legt die Urlaubstermine in {seiner_ihrer} Abteilung eigenverantwortlich fest. Die Mitarbeiter erhalten einen fertigen Plan. Auf Bitten um Änderungen erklärt {er_sie}, dass der Plan so bleibt, da die betrieblichen Abläufe Vorrang haben.',
    begruendung: 'Entscheidungen werden von der Führungskraft allein getroffen. Die Mitarbeiter haben hier keinen Einfluss auf die Planung.'
  },
  {
    stil: 'kooperativ',
    situation: 'Zielvereinbarung',
    sachverhalt: '{vorname} {nachname} führt mit jedem Mitarbeiter einmal im Jahr ein persönliches Gespräch. Dabei werden gemeinsam Ziele für das nächste Jahr besprochen und festgelegt. Beide Seiten bringen Wünsche ein – die Führungskraft formuliert keine Vorgaben, sondern einigt sich mit dem {Mitarbeiter_in} auf realistische Ziele.',
    begruendung: 'Ziele werden gemeinsam und auf Augenhöhe vereinbart. Das fördert Eigenverantwortung, Motivation und Identifikation mit den Zielen.'
  },
  {
    stil: 'autoritativ',
    situation: 'Fortbildung',
    sachverhalt: '{vorname} {nachname} entscheidet ohne vorherige Rücksprache, zu welcher Fortbildung {seine_ihre} Mitarbeiter geschickt werden. Als ein Mitarbeiter eine andere Schulung vorschlägt, erklärt {er_sie}, dass {er_sie} die Entscheidung bereits getroffen hat und diese so bleibt.',
    begruendung: 'Die Führungskraft trifft Entscheidungen über Weiterbildung allein. Der Mitarbeiter hat in diesem Fall keine Mitsprache.'
  },
  {
    stil: 'kooperativ',
    situation: 'Feedback-Kultur',
    sachverhalt: '{vorname} {nachname} hält monatliche Teamrunden ab, in denen Mitarbeiter offen Kritik äußern dürfen – auch an {ihn_sie}. {Er_Sie} nimmt Rückmeldungen ernst und passt {seine_ihre} Arbeitsweise an, wenn das Team es für sinnvoll hält.',
    begruendung: 'Offene Kommunikation und gegenseitiges Feedback sind Kennzeichen dieses Stils. Die Führungskraft sieht sich nicht als unanfechtbare Autorität, sondern als Teil des Teams.'
  },
  {
    stil: 'autoritativ',
    situation: 'Neue Mitarbeiterin',
    sachverhalt: '{vorname} {nachname} stellt eine neue Mitarbeiterin ein und gibt ihr am ersten Tag eine klare Liste mit Regeln zu Pausenzeiten, Kleiderordnung und Kommunikationswegen. Auf Fragen antwortet {er_sie} sachlich: „Das steht alles in der Liste. Halten Sie sich bitte daran.“',
    begruendung: 'Die Führungskraft legt die Rahmenbedingungen klar und einseitig fest. Es gibt begrenzten Raum für individuelle Anpassungen in der Einarbeitung.'
  },
  {
    stil: 'kooperativ',
    situation: 'Arbeitszeiten',
    sachverhalt: 'Das Team von {vorname} {nachname} möchte flexiblere Arbeitszeiten. Statt einfach ja oder nein zu sagen, lädt {er_sie} das Team ein, gemeinsam ein Modell zu entwickeln, das sowohl den betrieblichen Anforderungen als auch den Bedürfnissen der Mitarbeiter gerecht wird.',
    begruendung: 'Die Führungskraft bezieht Mitarbeiter in die Gestaltung der Arbeitsbedingungen ein. Das zeigt Wertschätzung und führt zu tragfähigen gemeinsamen Lösungen.'
  },
  {
    stil: 'autoritativ',
    situation: 'Konfliktvermittlung',
    sachverhalt: 'Zwei Mitarbeiter streiten sich über die Aufgabenverteilung. {vorname} {nachname} ruft beide zu sich und teilt ihnen die Entscheidung mit: „Person A übernimmt Aufgabe X, Person B Aufgabe Y. So wird es umgesetzt.“',
    begruendung: 'Die Führungskraft löst den Konflikt durch eine klare eigene Entscheidung, ohne die Beteiligten ausführlich in die Lösungsfindung einzubeziehen.'
  },
  {
    stil: 'kooperativ',
    situation: 'Konfliktlösung',
    sachverhalt: 'Als in {vorname} {nachname}s Team Spannungen entstehen, lädt {er_sie} alle Beteiligten zu einem Gespräch ein. {Er_Sie} moderiert die Runde, lässt alle zu Wort kommen und erarbeitet gemeinsam mit dem Team eine Lösung, die alle mittragen können.',
    begruendung: 'Konflikte werden nicht durch einseitige Entscheidung gelöst, sondern gemeinsam im Dialog. Die Führungskraft moderiert, statt zu diktieren.'
  },
  {
    stil: 'autoritativ',
    situation: 'Qualitätskontrolle',
    sachverhalt: '{vorname} {nachname} kontrolliert regelmäßig die Arbeitsergebnisse {seiner_ihrer} Mitarbeiter und nimmt bei Bedarf eigenständig Korrekturen vor. Die Mitarbeiter werden über die Änderungen informiert, haben aber keinen Einfluss auf die Entscheidung.',
    begruendung: 'Die Führungskraft behält die Kontrolle über die Qualität und trifft die finalen Entscheidungen selbst. Es gibt begrenztes Vertrauen in die eigenständige Korrektur durch die Mitarbeiter.'
  },
  {
    stil: 'kooperativ',
    situation: 'Projektplanung',
    sachverhalt: 'Vor dem Start eines neuen Projekts versammelt {vorname} {nachname} das gesamte Team. Gemeinsam werden Aufgaben verteilt, Meilensteine gesetzt und Verantwortlichkeiten festgelegt. {Er_Sie} fragt aktiv: „Wer traut sich welche Aufgabe zu? Wo braucht ihr Unterstützung?“',
    begruendung: 'Verantwortung und Aufgaben werden gemeinsam und auf Basis der Stärken der Mitarbeiter verteilt. Die Führungskraft fördert Eigenverantwortung.'
  },
  {
    stil: 'autoritativ',
    situation: 'Arbeitsplatztausch',
    sachverhalt: '{vorname} {nachname} ordnet an, dass zwei Mitarbeiter die Abteilung wechseln sollen. Auf Nachfragen erklärt {er_sie}, dass dies eine betriebliche Notwendigkeit ist und die Entscheidung so bestehen bleibt.',
    begruendung: 'Entscheidungen mit Auswirkungen auf die Mitarbeiter werden von der Führungskraft allein getroffen und mitgeteilt. Es gibt keine gemeinsame Abstimmung.'
  },
  {
    stil: 'kooperativ',
    situation: 'Einarbeitung',
    sachverhalt: '{vorname} {nachname} bespricht mit neuen Mitarbeitern in der ersten Woche ausführlich deren Stärken, Ziele und Erwartungen. {Er_Sie} fragt: „Was brauchst du, um gut starten zu können?“ und passt den Einarbeitungsplan gemeinsam an.',
    begruendung: 'Die Führungskraft geht individuell auf die Bedürfnisse neuer Mitarbeiter ein und gestaltet die Einarbeitung gemeinsam. Das stärkt das Vertrauen und den Einstieg ins Unternehmen.'
  },
];

let letzteGenerierteAufgaben = [];

const KI_PROMPT = `Du bist ein freundlicher Lernassistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst beim Verständnis der Führungsstile in der Personalführung.

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib KEINE fertigen Lösungen vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Einschätzung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach konkreten Hinweisen im Sachverhalt (Was macht die Führungskraft? Werden Mitarbeiter gefragt?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler den richtigen Führungsstil erarbeitet hat, bestätige es.

Begrüße den Schüler freundlich und gib ihm eine Aufgabe aus der folgenden Aufgabenliste vor.
Arbeitsauftrag: „Lies den Sachverhalt und entscheide: Welchen Führungsstil wendet die Führungskraft an – autoritativ oder kooperativ? Begründe deine Antwort."

Aufgabenliste:

###AUFGABEN und LOESUNGEN###

Methodik bei Rückfragen:
- Was tut die Führungskraft im Sachverhalt genau?
- Werden die Mitarbeiter gefragt oder einbezogen?
- Wer trifft die Entscheidung – alleine oder gemeinsam?
- Gibt es Raum für Kritik oder Vorschläge?

Die zwei Führungsstile:

1. Autoritativer Führungsstil
   - Die Führungskraft entscheidet allein, ohne die Mitarbeiter einzubeziehen
   - Klare Anweisungen, keine Diskussion, kein Widerspruch erwünscht
   - Vorteil: schnelle Entscheidungen, klare Struktur
   - Nachteil: wenig Motivation, kein Raum für Ideen der Mitarbeiter
   - Beispiel: Chef ordnet Urlaubsplan an, ohne die Mitarbeiter zu fragen

2. Kooperativer Führungsstil
   - Die Führungskraft bindet die Mitarbeiter in Entscheidungen ein
   - Gemeinsame Diskussion, offene Kommunikation, Teamarbeit
   - Vorteil: hohe Motivation, bessere Lösungen durch Teamwissen
   - Nachteil: Entscheidungen dauern länger
   - Beispiel: Team erarbeitet gemeinsam einen Maßnahmenplan

Typische Fehler der Schüler:
- Autoritativ bedeutet NICHT, dass die Führungskraft böse oder ungerecht ist – auch sachliche, nüchterne Entscheidungen alleine sind autoritativ
- Kooperativ bedeutet NICHT, dass alle immer einer Meinung sind – entscheidend ist, ob Mitarbeiter einbezogen werden
- In Krisenszenarien kann autoritativer Führungsstil sinnvoll und richtig sein – das ist kein Verstoß

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 👔🤝🔍❓✅

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch eine weitere Aufgabe üben?"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor.`;

function erstelleKiPromptText() {
  if (letzteGenerierteAufgaben.length === 0) return KI_PROMPT.replace("###AUFGABEN und LOESUNGEN###", "(Noch keine Aufgaben generiert.)");
  const aufgabenText = letzteGenerierteAufgaben.map(({fall, person, sachverhalt, begruendung}, idx) => {
    return `Aufgabe ${idx+1}:\n${sachverhalt}\n\nMusterlösung ${idx+1}:\nFühungsstil: ${stilLabel(fall.stil)}\nBegründung: ${begruendung}`;
  }).join("\n\n---\n\n");
  return KI_PROMPT.replace("###AUFGABEN und LOESUNGEN###", aufgabenText);
}

function stilLabel(k) {
  return k === 'autoritativ' ? 'Autoritativer Führungsstil' : 'Kooperativer Führungsstil';
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generiereAufgaben() {
  const anzahl = parseInt(document.getElementById('anzahl').value) || 4;
  const filter = document.getElementById('filter').value;
  const container = document.getElementById('Container');
  if (!container) return;

  let pool = filter === 'alle' ? faelle : faelle.filter(f => f.stil === filter);
  let gefuellt = [...pool];
  while (gefuellt.length < anzahl) gefuellt = [...gefuellt, ...pool];
  const ausgewaehlt = shuffle(gefuellt).slice(0, anzahl);

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

  let aufgabenHTML = `<h2>Aufgaben</h2><p><strong>Arbeitsauftrag:</strong><br>Lies die Fallbeispiels. Entscheide jeweils, welchen Führungsstil die Führungskraft anwendet (autoritativ oder kooperativ) und begründe deine Antwort.</p>`;

  letzteGenerierteAufgaben.forEach(({fall, sachverhalt}, idx) => {
    aufgabenHTML += `<div style="margin-bottom: 10px;font-size: 16px; line-height: 1.6; font-family: var(--font-mono); border: 0.5px solid #333; padding: 8px 12px;"><strong>Aufgabe ${idx+1}: ${fall.situation}</strong>
      <p>${sachverhalt}</p></div>`;
  });

  let loesungenHTML = `<br><h2>Lösungen</h2><div class="loesungen-wrap">`;
  letzteGenerierteAufgaben.forEach(({fall, sachverhalt, begruendung}, idx) => {
    const badgeClass = fall.stil === 'autoritativ' ? 'display: inline-block; font-size: 14px; padding: 2px 8px; border-radius: 20px; background: #FAECE7; color: #993C1D;' : 'display: inline-block; font-size: 14px; padding: 2px 8px; border-radius: 20px; background: #E1F5EE; color: #0F6E56; ';
    const label = stilLabel(fall.stil);
    loesungenHTML += `<div style="margin-bottom: 10px; padding: 10px;">
      <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">${idx+1}. ${fall.situation}</div>
      <div style="font-size: 16px; font-weight: 500; margin-bottom: 6px;"><span style="${badgeClass}">${label}</span></div>
      <div style="font-size: 16px; line-height: 1.6; font-family: var(--font-mono); border: 0.5px solid #333; padding: 8px 12px;">${begruendung}</div>
    </div>`;
  });
  loesungenHTML += '</div>';

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

generiereAufgaben();