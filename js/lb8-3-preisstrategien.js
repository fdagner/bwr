// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';
let letztePreisAufgaben = [];

// ============================================================================
// YAML-DATEN LADEN (identisch zum Marketing-Generator)
// ============================================================================

function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  if (userCompanies.length > 0) {
    yamlData = [...yamlData, ...userCompanies];
    yamlData.sort((a, b) => {
      const brancheA = a.unternehmen?.branche || '';
      const brancheB = b.unternehmen?.branche || '';
      return brancheA.localeCompare(brancheB);
    });
  }
}

function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
      return true;
    } catch (err) {
      console.warn("localStorage YAML kaputt:", err);
    }
  }
  return false;
}

function loadDefaultYaml() {
  fetch('js/unternehmen.yml')
    .then(res => {
      if (!res.ok) throw new Error('unternehmen.yml nicht gefunden');
      return res.text();
    })
    .then(yamlText => {
      yamlData = jsyaml.load(yamlText) || [];
      if (!localStorage.getItem('standardYamlData')) {
        localStorage.setItem('standardYamlData', JSON.stringify(yamlData));
      }
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => {
      console.error("Konnte unternehmen.yml nicht laden:", err);
    });
}

// ============================================================================
// DROPDOWN BEFÜLLEN (identisch zum Marketing-Generator)
// ============================================================================

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;

  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });

  const kundeSelect = document.getElementById('preisKunde');
  if (!kundeSelect) return;

  kundeSelect.innerHTML = '';
  const opt = document.createElement('option');
  opt.value = '';
  opt.text = '— bitte Unternehmen auswählen —';
  opt.disabled = true;
  opt.selected = true;
  kundeSelect.appendChild(opt);

  sortedCompanies.forEach(company => {
    const u = company.unternehmen;
    if (!u?.name) return;

    const displayText = u.branche
      ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim()
      : `${u.name} ${u.rechtsform || ''}`.trim();

    const option = document.createElement('option');
    option.value = u.name;
    option.textContent = displayText;
    option.dataset.id = u.id || '';
    option.dataset.rechtsform = u.rechtsform || '';
    option.dataset.branche = u.branche || '';

    kundeSelect.appendChild(option);
  });
}

// ============================================================================
// PREISSTRATEGIE-DEFINITIONEN
// ============================================================================


function validierePreisEingabe() {
  const minInput = document.getElementById('preisMin');
  const maxInput = document.getElementById('preisMax');
  const hinweis  = document.getElementById('preisHinweis');

  let minVal = parseInt(minInput.value);
  let maxVal = parseInt(maxInput.value);
  const fehler = [];

  // Absolutgrenzen erzwingen
  if (isNaN(minVal) || minVal < 1)      { minVal = 1;     minInput.value = 1; }
  if (minVal > 99998)                   { minVal = 99998; minInput.value = 99998; }
  if (isNaN(maxVal) || maxVal < 2)      { maxVal = 2;     maxInput.value = 2; }
  if (maxVal > 99999)                   { maxVal = 99999; maxInput.value = 99999; }

  // Mindestpreis muss kleiner als Höchstpreis sein
  if (minVal >= maxVal) {
    // Korrigiere: Mindestpreis auf Höchstpreis − 1 setzen
    minVal = maxVal - 1;
    minInput.value = minVal;
    fehler.push(`Mindestpreis wurde auf ${minVal} € korrigiert (muss kleiner als Höchstpreis sein).`);
  }

  // Hinweisfeld anzeigen oder ausblenden
  if (fehler.length > 0) {
    hinweis.textContent = '⚠️ ' + fehler.join(' ');
    hinweis.style.display = 'block';
    setTimeout(() => { hinweis.style.display = 'none'; }, 4000);
  } else {
    hinweis.style.display = 'none';
  }
}
// Liest Mindest- und Höchstpreis aus den Inputs und gibt einen zufälligen
// Preis je Strategie zurück. Skimming/Hochpreis liegen im oberen Drittel,
// Dumping/Niedrigpreis im unteren Drittel des eingegebenen Bereichs.
function getPreisBereich() {
  const min = parseInt(document.getElementById('preisMin').value) || 100;
  const max = parseInt(document.getElementById('preisMax').value) || 1000;
  // Sicherheitshalber sicherstellen, dass min < max
  return { min: Math.min(min, max - 1), max: Math.max(min + 1, max) };
}

function zufallsPreisInBereich(von, bis) {
  // Rundet auf volle 5 € für natürlichere Preise
  const step = 5;
  const schritte = Math.floor((bis - von) / step);
  if (schritte <= 0) return von;
  return von + Math.floor(Math.random() * (schritte + 1)) * step;
}

function berechnePreis(stratKey) {
  const { min, max } = getPreisBereich();
  const spanne = max - min;
  const drittel = spanne / 3;

  // Skimming und Hochpreis → oberes Drittel des Bereichs
  // Dumping und Niedrigpreis → unteres Drittel des Bereichs
  if (stratKey === 'skimming' || stratKey === 'hochpreis') {
    return zufallsPreisInBereich(Math.round(min + 2 * drittel), max);
  } else {
    return zufallsPreisInBereich(min, Math.round(min + drittel));
  }
}

const strategien = {
  skimming: {
    label: 'Skimming-Strategie',
    kurzbeschreibung: 'Hoher Einführungspreis → später schrittweise Preissenkung',
    formulierungen: [
      (u, pr) => `${u} bringt ein Fertigerzeugnis neu auf den Markt und setzt zunächst einen sehr hohen Preis von ${pr} €. Damit sollen besonders kaufbereite Kunden angesprochen werden. Später plant das Unternehmen, den Preis schrittweise zu senken.`,
      (u, pr) => `${u} führt ein Fertigerzeugnis ein und verlangt anfangs ${pr} € pro Stück. Das Unternehmen rechnet damit, dass Kunden, die als Erste das neue Produkt besitzen wollen, diesen Preis zahlen. Im weiteren Verlauf soll der Preis sinken.`,
      (u, pr) => `Beim Markteintritt setzt ${u} den Preis für ein Fertigerzeugnis bewusst hoch auf ${pr} €. So werden zuerst Kunden mit hoher Zahlungsbereitschaft gewonnen. Nach einer gewissen Zeit wird der Preis für die breite Masse gesenkt.`,
      (u, pr) => `${u} startet ein Fertigerzeugnis mit einem Einführungspreis von ${pr} € – deutlich über dem Marktdurchschnitt. Das Unternehmen möchte in der Einführungsphase hohe Gewinne erzielen, bevor Konkurrenten den Markt betreten.`,
      (u, pr) => `Für ein neu entwickeltes Fertigerzeugnis legt ${u} einen Startpreis von ${pr} € fest. Dieser ist bewusst hoch gewählt, um zunächst die Gewinnspanne zu maximieren. Erst wenn Wettbewerber nachziehen, wird der Preis gesenkt.`,
      (u, pr) => `${u} bringt ein Fertigerzeugnis zum Preis von ${pr} € auf den Markt und zielt damit auf Erstkäufer mit hoher Zahlungsbereitschaft. Sobald die Nachfrage dieser Gruppe gedeckt ist, werden die Preise Schritt für Schritt reduziert.`,
    ]
  },

  dumping: {
    label: 'Dumping-Strategie',
    kurzbeschreibung: 'Preis unter Herstellungskosten → Konkurrenten aus dem Markt verdrängen',
    formulierungen: [
      (u, pr) => `Um Konkurrenten vom Markt zu verdrängen, verkauft ${u} ein Fertigerzeugnis für nur ${pr} € – und nimmt dabei sogar Verluste in Kauf. Sobald die Wettbewerber den Markt verlassen haben, soll der Preis deutlich angehoben werden.`,
      (u, pr) => `${u} bietet ein Fertigerzeugnis zu einem Preis von ${pr} € an, der deutlich unter den eigenen Herstellungskosten liegt. Ziel ist es, die Konkurrenz aus dem Markt zu drängen. Anschließend sollen die Preise erheblich steigen.`,
      (u, pr) => `Ein Fertigerzeugnis von ${u} wird für ${pr} € verkauft – ein Preis, der bewusst unter den Einstandskosten liegt. Mit dieser aggressiven Preissetzung möchte das Unternehmen Mitbewerber in die Verlustzone treiben und dauerhaft aus dem Markt herausdrängen.`,
      (u, pr) => `Mit einem Preis von nur ${pr} € für ein Fertigerzeugnis unterbindet ${u} jeden Wettbewerb. Das Unternehmen nimmt kurzfristig Verluste in Kauf, um mittel- bis langfristig eine Marktbeherrschung zu erzielen.`,
      (u, pr) => `Um schnell Marktanteile zu gewinnen, setzt ${u} den Preis für ein Fertigerzeugnis auf ${pr} € – weit unter dem marktüblichen Niveau und unterhalb der Herstellungskosten. Sobald Mitbewerber verschwunden sind, wird der Preis massiv erhöht.`,
      (u, pr) => `${u} bietet ein Fertigerzeugnis zu ${pr} € an und ist sich bewusst, damit Verluste zu erwirtschaften. Die Strategie: Preiskampf bis zur Verdrängung aller Konkurrenten – danach Preiserhöhung in einer marktbeherrschenden Stellung.`,
    ]
  },

  hochpreis: {
    label: 'Hochpreisstrategie',
    kurzbeschreibung: 'Dauerhaft hoher Preis als Qualitäts- und Exklusivitätssignal',
    formulierungen: [
      (u, pr) => `${u} setzt den Preis für ein Fertigerzeugnis dauerhaft auf ${pr} € fest. Das Unternehmen positioniert sich damit als Anbieter hochwertiger Produkte und spricht Kunden an, die Qualität und Exklusivität schätzen.`,
      (u, pr) => `Ein Fertigerzeugnis von ${u} kostet bewusst ${pr} € – ein hoher Preis, der zum Markenimage passt. Das Unternehmen verzichtet auf eine breite Masse und zielt stattdessen auf ein anspruchsvolles Kundensegment.`,
      (u, pr) => `Mit einem Dauerpreis von ${pr} € für ein Fertigerzeugnis signalisiert ${u}: Qualität hat ihren Preis. Die Preisgestaltung ist Teil des Markenversprechens und wird dauerhaft nicht nach unten angepasst.`,
      (u, pr) => `${u} verlangt für ein Fertigerzeugnis konstant ${pr} €. Dieser Preis liegt bewusst über dem Wettbewerb, um das Produkt als Premiumoption zu positionieren und Preissenkungen – die das Image schädigen könnten – zu vermeiden.`,
      (u, pr) => `Seit Markteinführung liegt der Preis für ein Fertigerzeugnis bei ${u} stabil bei ${pr} €. Das Unternehmen nutzt den hohen Preis als Qualitätssignal und pflegt damit eine exklusive Marktpositionierung.`,
      (u, pr) => `${u} verfolgt bei einem Fertigerzeugnis konsequent eine Premiumpositionierung: Preis ${pr} €, keine Rabattaktionen, kein Massenmarkt. Die Kundschaft zahlt für Qualität, Ansehen und Verarbeitung.`,
    ]
  },

  niedrigpreis: {
    label: 'Niedrigpreisstrategie',
    kurzbeschreibung: 'Dauerhaft günstiger Preis → breite Kundenmasse, hohe Absatzmengen',
    formulierungen: [
      (u, pr) => `${u} setzt ein Fertigerzeugnis dauerhaft zu einem günstigen Preis von ${pr} € an. Ziel ist es, möglichst viele Kunden zu erreichen und durch hohe Absatzmengen profitabel zu sein.`,
      (u, pr) => `Mit ${pr} € hält ${u} den Preis für ein Fertigerzeugnis auf einem niedrigen Niveau – und zwar nicht als Sonderaktion, sondern als dauerhafte Positionierung. Das Unternehmen setzt auf Masse statt Marge.`,
      (u, pr) => `Ein Fertigerzeugnis von ${u} ist für ${pr} € dauerhaft günstig erhältlich. Das Unternehmen möchte so breite Bevölkerungsschichten ansprechen und durch effiziente Produktion und große Mengen rentabel arbeiten.`,
      (u, pr) => `${u} verfolgt bei einem Fertigerzeugnis eine klare Preisstrategie: ${pr} € – günstig, verlässlich, dauerhaft. Kosteneinsparungen in der Produktion ermöglichen diesen Preis, ohne auf Gewinne zu verzichten.`,
      (u, pr) => `Der Preis für ein Fertigerzeugnis bei ${u} bleibt konsequent bei ${pr} €. Das Unternehmen richtet sich an preisbewusste Käufer und verzichtet auf Premium-Extras, um wettbewerbsfähig zu bleiben.`,
      (u, pr) => `${u} bietet ein Fertigerzeugnis langfristig für ${pr} € an und möchte so die günstigste Option im Markt bleiben. Effizienz und Skaleneffekte machen diese Dauerstrategie wirtschaftlich möglich.`,
    ]
  }
};

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

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const unternehmensVarianten = [
  (name) => name,
  (name) => `Firma ${name}`,
  (name) => `Unternehmen ${name}`,
];

// ============================================================================
// HAUPTFUNKTION – PREISSTRATEGIEN ANZEIGEN
// ============================================================================

function zeigeZufaelligePreisstrategien() {
  const anzahl = 4;
  const container = document.getElementById('Container');

  if (!container) {
    console.error("Container nicht gefunden");
    return;
  }

  // Eingabe validieren
  const minVal = parseInt(document.getElementById('preisMin').value);
  const maxVal = parseInt(document.getElementById('preisMax').value);
  if (isNaN(minVal) || isNaN(maxVal) || minVal >= maxVal) {
    alert('Bitte geben Sie einen gültigen Preisbereich ein (Mindestpreis < Höchstpreis).');
    return;
  }

  container.innerHTML = '';

  const kundeSelect = document.getElementById('preisKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  const anzeigeName = kundeValue || '[Modellunternehmen]';

  // Strategien in zufälliger Reihenfolge, bei Bedarf wiederholen
  const alleStrategieKeys = ['skimming', 'dumping', 'hochpreis', 'niedrigpreis'];
  let aufgabenListe = [];
  while (aufgabenListe.length < anzahl) {
    aufgabenListe = [...aufgabenListe, ...shuffle(alleStrategieKeys)];
  }
  aufgabenListe = aufgabenListe.slice(0, anzahl);

  let aufgabenHTML = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2 class="loesung">Lösung</h2>';
  letztePreisAufgaben = [];

  aufgabenListe.forEach((stratKey, idx) => {
    const strat = strategien[stratKey];
    const preis = berechnePreis(stratKey);
    const preisFormatted = preis.toLocaleString('de-DE');

    const ausgabe = pick(unternehmensVarianten)(anzeigeName);
    const text = pick(strat.formulierungen)(ausgabe, preisFormatted);
    letztePreisAufgaben.push({ text, label: strat.label });

    aufgabenHTML += `<li>${text}</li>`;

    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${idx + 1}.</strong><br>`;
    loesungenHTML += erstelleLoesungsTabelle(strat);
    loesungenHTML += `</div>`;
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

function erstelleLoesungsTabelle(strat) {
  return `
    <div style="border: 1px solid #ccc; background-color:#fff; font-family:courier; padding: 4px 8px; margin: 0 0 6px;">
      <strong>${strat.label}</strong> – ${strat.kurzbeschreibung}
    </div>`;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Marketing-Assistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von Preisstrategien.

Aufgabe:
- Gib KEINE fertigen Lösungen (Strategienamen) vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Zuordnung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach Merkmalen des beschriebenen Preises (hoch/niedrig? dauerhaft/temporär? mit welchem Ziel?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Fachbegriff.

Methodik bei Rückfragen:
- Ist der Preis dauerhaft oder nur am Anfang so hoch/niedrig?
- Liegt der Preis unter den Herstellungskosten?
- Welche Kundengruppe soll angesprochen werden?
- Was passiert mit dem Preis in Zukunft?
- Was ist das eigentliche Ziel des Unternehmens?

Die vier Preisstrategien:

1. Skimming-Strategie
   - Sehr hoher Preis bei Markteinführung
   - Zielt auf zahlungsbereite Erstkäufer (Innovatoren)
   - Preis wird später schrittweise gesenkt
   - Ziel: Gewinne abschöpfen, bevor Konkurrenz kommt

2. Dumping-Strategie
   - Preis liegt unter den eigenen Herstellungskosten
   - Ziel: Konkurrenten aus dem Markt drängen
   - Danach: Preise drastisch erhöhen (Marktmacht)
   - Oft wettbewerbsrechtlich problematisch

3. Hochpreisstrategie
   - Dauerhaft hoher Preis als Qualitätssignal
   - Positionierung als Premium-/Luxusprodukt
   - Keine Absicht zur späteren Preissenkung
   - Zielt auf anspruchsvolles, preisunempfindliches Kundensegment

4. Niedrigpreisstrategie
   - Dauerhaft günstiger Preis über dem Einstandspreis
   - Zielt auf breite Kundenmasse, hohe Absatzmengen
   - Effiziente Produktion macht dies rentabel
   - Kein aggressives Ziel (im Gegensatz zum Dumping)

Typische Abgrenzungsfehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- Skimming ≠ Hochpreisstrategie (Skimming ist temporär, Hochpreis dauerhaft)
- Dumping ≠ Niedrigpreisstrategie (Dumping liegt unter Kosten und ist aggressiv/vorübergehend)
- Preis allein reicht nicht – Absicht und Dauer sind entscheidend

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 💰📊✅❓

Was du NICHT tust:
- Nenne den Strategienamen nicht, bevor der Schüler ihn selbst erarbeitet hat
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist
`;

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
  const kundeSelect = document.getElementById('preisKunde');

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  kundeSelect.addEventListener('change', () => {
    kunde = kundeSelect.value.trim() || '';
  });

  if (!loadYamlFromLocalStorage()) {
    loadDefaultYaml();
  }

  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
  }

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
});

// ============================================================================
// MOODLE-XML-EXPORT – Fragetyp „Zuordnung“ (matching), alle Aufgaben in EINER Frage
// ============================================================================

const MOODLE_PREIS_PRAEFIX = '8.3-03';
const MOODLE_PREIS_TITELENDE = 'meinBwR-Zuordnen';
const MOODLE_PREIS_ANWEISUNG = 'Ordne die jeweilige Preisstrategie zu!';
const MOODLE_PREIS_PUNKTE_PRO_AUFGABE = 1;

function mxEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mxCdata(s) {
  return '<![CDATA[' + String(s ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
}

// Eindeutige, zeitabhängige ID (yyMMddHHmmss), pro Browser streng aufsteigend
function mxIdBasis() {
  const SCHLUESSEL = 'moodlePreisLetzteIdSekunde';
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

function mxBaueMatchingXml(aufgaben) {
  const punkte = aufgaben.length * MOODLE_PREIS_PUNKTE_PRO_AUFGABE;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
  xml += `  <question type="matching">\n`;
  const titel = `${MOODLE_PREIS_PRAEFIX}T${mxIdBasis()}${MOODLE_PREIS_TITELENDE}`;
  xml += `    <name>\n      <text>${mxEsc(titel)}</text>\n    </name>\n`;
  xml += `    <questiontext format="html">\n      <text>${mxCdata(`<p>${MOODLE_PREIS_ANWEISUNG}</p>`)}</text>\n    </questiontext>\n`;
  xml += `    <generalfeedback format="html">\n      <text></text>\n    </generalfeedback>\n`;
  xml += `    <defaultgrade>${punkte}</defaultgrade>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n`;
  xml += `    <shuffleanswers>true</shuffleanswers>\n`;
  xml += `    <correctfeedback format="html">\n      <text>${mxCdata('<p>Die Antwort ist richtig.</p>')}</text>\n    </correctfeedback>\n`;
  xml += `    <partiallycorrectfeedback format="html">\n      <text>${mxCdata('<p>Die Antwort ist teilweise richtig.</p>')}</text>\n    </partiallycorrectfeedback>\n`;
  xml += `    <incorrectfeedback format="html">\n      <text>${mxCdata('<p>Die Antwort ist falsch.</p>')}</text>\n    </incorrectfeedback>\n`;
  xml += `    <shownumcorrect/>\n`;

  aufgaben.forEach(({ text, label }, i) => {
    xml += `    <subquestion format="html">\n`;
    xml += `      <text>${mxCdata(`<p>${text}</p><hr>`)}</text>\n`;
    xml += `      <answer>\n        <text>${mxEsc(label)}</text>\n      </answer>\n`;
    xml += `    </subquestion>\n`;
  });
  

  xml += `  </question>\n\n</quiz>\n`;
  return xml;
}

function exportiereMoodle() {
  if (!letztePreisAufgaben.length) {
    alert('Bitte zuerst Aufgaben erstellen.');
    return;
  }
  const xml = mxBaueMatchingXml(letztePreisAufgaben);

  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const dateiname = `quiz-preisstrategien-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

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

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  if (!myCompanyName) return;

  const dropdowns = document.querySelectorAll('select.meinUnternehmen');
  dropdowns.forEach(dropdown => {
    const options = Array.from(dropdown.options);
    const matchingOption = options.find(opt => opt.value === myCompanyName);
    if (matchingOption) {
      dropdown.value = myCompanyName;
      const event = new Event('change', { bubbles: true });
      dropdown.dispatchEvent(event);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    autoSelectMyCompany();
    zeigeZufaelligePreisstrategien()
  }, 500);

});
