// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';
let letzteEntgeltAufgaben = [];

// ============================================================================
// YAML-DATEN LADEN (identisch zu den anderen Generatoren)
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
// DROPDOWN BEFÜLLEN
// ============================================================================

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;

  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });

  const kundeSelect = document.getElementById('entgeltKunde');
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

// Zufallszahl von min bis max in festen Schritten
function rnd(min, max, step) {
  const n = Math.floor((max - min) / step);
  return Math.round((min + Math.floor(Math.random() * (n + 1)) * step) * 100) / 100;
}

// Zahl mit zwei Dezimalstellen (deutsches Format)
function fmt(n) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Zahl ohne feste Dezimalstellen (deutsches Format, z. B. 3,5 oder 120.000)
function fmtInt(n) {
  return n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
}

const unternehmensVarianten = [
  (name) => name,
  (name) => `Firma ${name}`,
  (name) => `Unternehmen ${name}`,
];

// ============================================================================
// ENTGELTFORMEN – DEFINITIONEN UND FALLBEISPIELE
// Jede Formulierung erzeugt ihre Zufallszahlen selbst und liefert den Text.
// "art" nennt die konkrete Ausprägung (wird in der Lösung angezeigt).
// ============================================================================

const entgeltformen = {

  zeit: {
    label: 'Zeitentgelt',
    langform: 'Zeitentgelt ',
    kurzbeschreibung: 'Der Lohn richtet sich nach der geleisteten Arbeitszeit, nicht nach der Menge oder Qualität der Arbeit. Frage: Wie lange wird gearbeitet?',
    formulierungen: [
      {
        art: 'Stundenlohn',
        text: (u) => {
          const l = rnd(12, 28, 0.5), h = rnd(120, 176, 4);
          return `Frau Yilmaz arbeitet bei ${u} als Sachbearbeiterin. Für jede geleistete Arbeitsstunde erhält sie ${fmt(l)} €. Im letzten Monat hat sie ${h} Stunden gearbeitet und bekommt dafür ${fmt(l * h)} € brutto.`;
        }
      },
      {
        art: 'Monatsgehalt',
        text: (u) => {
          const g = rnd(2400, 4800, 50);
          return `Herr Becker ist bei ${u} als Buchhalter angestellt. Er erhält jeden Monat ein festes Gehalt von ${fmt(g)} € – unabhängig davon, wie viele Buchungen er in dieser Zeit bearbeitet.`;
        }
      },
      {
        art: 'Stundenlohn mit Überstundenzuschlag',
        text: (u) => {
          const l = rnd(13, 25, 0.5), ue = rnd(4, 16, 2);
          return `Bei ${u} erhält Herr Novak als Lagerarbeiter ${fmt(l)} € je Stunde. Für die ${ue} Überstunden in diesem Monat bekommt er zusätzlich einen Zuschlag von 25 %. Sein Verdienst hängt allein von der Dauer seiner Arbeitszeit ab.`;
        }
      },
      {
        art: 'Tagelohn',
        text: (u) => {
          const t = rnd(80, 160, 5);
          return `${u} beschäftigt Frau Kaya als Aushilfe auf Messen. Sie erhält für jeden Arbeitstag ${fmt(t)} € – egal, wie viele Kunden sie in dieser Zeit berät oder wie viel verkauft wird.`;
        }
      },
      {
        art: 'Wochenlohn',
        text: (u) => {
          const w = rnd(480, 800, 10);
          return `Herr Lang arbeitet bei ${u} an der Pforte. Er bekommt pro Woche (40 Stunden) einen festen Lohn von ${fmt(w)} €. Wie viele Besucher er in dieser Zeit abfertigt, spielt dafür keine Rolle.`;
        }
      },
      {
        art: 'Stundenlohn mit Nachtzuschlag',
        text: (u) => {
          const l = rnd(13, 24, 0.5), z = rnd(10, 25, 5);
          return `Frau Weber arbeitet bei ${u} in der Nachtschicht. Zusätzlich zu ihrem Stundenlohn von ${fmt(l)} € erhält sie für die Nachtstunden einen Zuschlag von ${z} %. Der Verdienst richtet sich nach der Zahl der gearbeiteten Stunden.`;
        }
      },
    ]
  },

  leistung: {
    label: 'Leistungsentgelt',
    langform: 'Leistungsentgelt ',
    kurzbeschreibung: 'Der Lohn richtet sich nach der Arbeitsleistung (Menge, Qualität, Erfolg). Frage: Wie viel bzw. wie gut wird gearbeitet?',
        formulierungen: [
      {
        art: 'Stückakkord',
        text: (u) => {
          const s = rnd(0.4, 2.5, 0.05), st = rnd(1200, 3600, 100);
          return `Frau Horvat arbeitet bei ${u} im Versand und packt die bestellten Waren für den Transport. Sie erhält für jedes versandfertig gepackte Paket ${fmt(s)} €. Im Monat hat sie ${fmtInt(st)} Pakete gepackt und verdient damit ${fmt(s * st)} €.`;
        }
      },
      {
        art: 'Zeitakkord',
        text: (u) => {
          const vz = rnd(4, 12, 1), mf = rnd(0.2, 0.4, 0.05), st = rnd(300, 600, 20);
          return `Bei ${u} stellt Herr Brandt in der Kommissionierung die Waren für Kundenaufträge zusammen. Pro Kundenauftrag gilt eine Vorgabezeit von ${vz} Minuten bei einem Minutenfaktor von ${fmt(mf)} €. Er erhält je Kundenauftrag ${fmt(vz * mf)} € – unabhängig davon, wie lange er tatsächlich braucht. In diesem Monat hat er ${st} Aufträge bearbeitet.`;
        }
      },
      {
        art: 'Provision',
        text: (u) => {
          const pr = rnd(2, 8, 0.5), um = rnd(40000, 160000, 5000);
          return `Herr Schulz ist Außendienstmitarbeiter bei ${u}. Er erhält ${fmtInt(pr)} % Provision auf seinen erzielten Umsatz. Im letzten Monat verkaufte er Produkte des Unternehmens für ${fmtInt(um)} € und bekam dafür ${fmt(um * pr / 100)} €.`;
        }
      },
      {
        art: 'Prämienlohn (Qualitätsprämie)',
        text: (u) => {
          const gl = rnd(2000, 3200, 50), pm = rnd(5, 20, 1), n = rnd(20, 60, 2);
          return `Herr Ostermann bekommt bei ${u} einen Grundlohn von ${fmt(gl)} € im Monat. Zusätzlich erhält er eine Qualitätsprämie von ${fmt(pm)} € für jeden Kundenauftrag, der ohne Reklamation abgeschlossen wird. Im letzten Monat waren das ${n} Aufträge.`;
        }
      },
      {
        art: 'Prämienlohn (Ersparnisprämie)',
        text: (u) => {
          const p = rnd(10, 40, 5), pc = rnd(2, 8, 1);
          return `${u} zahlt Frau Dietrich neben ihrem Grundlohn eine Prämie von ${fmt(p)} € für jedes Prozent, um das sie den Verbrauch an Verbrauchsmaterial (z. B. Papier, Verpackung) in ihrer Abteilung senkt. In diesem Monat hat sie ${pc} % eingespart.`;
        }
      },
      {
        art: 'Abschlussprämie',
        text: (u) => {
          const b = rnd(30, 120, 5), n = rnd(6, 25, 1);
          return `Frau Petrović arbeitet im Verkauf bei ${u}. Für jeden abgeschlossenen Kaufvertrag mit einem Kunden erhält sie ${fmt(b)} €. Im letzten Monat hat sie ${n} Verträge abgeschlossen. Je mehr Abschlüsse sie erzielt, desto höher ist ihr Verdienst.`;
        }
      },
    ]
  },

  gewinn: {
    label: 'Gewinnbeteiligung',
    langform: 'Gewinnbeteiligung',
    kurzbeschreibung: 'Die Beschäftigten erhalten zusätzlich zum Lohn einen Anteil am Unternehmensgewinn. Frage: Wie erfolgreich war das Unternehmen?',
    formulierungen: [
      {
        art: 'gleiche Beträge für alle Beschäftigten',
        text: (u) => {
          const gw = rnd(100000, 800000, 10000), pc = rnd(5, 20, 1), ma = rnd(20, 80, 5);
          const topf = gw * pc / 100;
          return `${u} hat im Geschäftsjahr einen Gewinn von ${fmtInt(gw)} € erzielt. ${pc} % davon schüttet das Unternehmen an die ${ma} Beschäftigten aus. Jeder erhält denselben Betrag von ${fmt(topf / ma)} € zusätzlich zum Gehalt.`;
        }
      },
      {
        art: 'Anteil am Jahresgehalt',
        text: (u) => {
          const pc = rnd(2, 8, 1), jg = rnd(30000, 60000, 1000);
          return `Bei ${u} wird am Jahresende ein Teil des Gewinns an die Belegschaft verteilt. Frau Maier erhält ${pc} % ihres Jahresgehalts von ${fmtInt(jg)} €, also ${fmt(jg * pc / 100)} €, als Beteiligung. In Jahren ohne Gewinn entfällt diese Zahlung.`;
        }
      },
      {
        art: 'Tantieme',
        text: (u) => {
          const gw = rnd(200000, 900000, 10000), pc = rnd(2, 6, 1);
          return `Die Geschäftsführerin von ${u}, Frau Hartmann, erhält neben ihrem festen Gehalt eine Tantieme von ${pc} % des Jahresüberschusses. Bei einem Jahresüberschuss von ${fmtInt(gw)} € sind das ${fmt(gw * pc / 100)} €.`;
        }
      },
      {
        art: 'Beteiligung am Mehrgewinn',
        text: (u) => {
          const vor = rnd(100000, 500000, 10000), mehr = rnd(20000, 150000, 10000), pc = rnd(10, 30, 5);
          return `${u} beteiligt alle Mitarbeiter am Unternehmenserfolg: Steigt der Gewinn gegenüber dem Vorjahr, erhalten sie zum Jahresende ${pc} % des Mehrgewinns. Der Gewinn stieg von ${fmtInt(vor)} € auf ${fmtInt(vor + mehr)} €. Insgesamt werden ${fmt(mehr * pc / 100)} € an die Belegschaft ausgezahlt.`;
        }
      },
      {
        art: 'Beteiligung nur bei Gewinn',
        text: (u) => {
          const gw = rnd(150000, 600000, 10000), b = rnd(300, 1500, 50);
          return `Die Beschäftigten von ${u} erhalten am Jahresende eine Beteiligung am Gewinn. Im Vorjahr (Gewinn: ${fmtInt(gw)} €) bekam jeder Mitarbeiter ${fmt(b)} € zusätzlich. In diesem Jahr schloss das Unternehmen mit einem Verlust ab, deshalb gab es keine Beteiligung.`;
        }
      },
      {
        art: 'Verteilung nach Betriebszugehörigkeit',
        text: (u) => {
          const topf = rnd(40000, 120000, 5000), je = rnd(50, 150, 10), j = rnd(3, 25, 1);
          return `${u} verteilt einen Teil von ${fmtInt(topf)} € des Jahresgewinns nach der Betriebszugehörigkeit: Für jedes Jahr im Unternehmen gibt es ${fmt(je)} €. Frau Sommer ist seit ${j} Jahren dabei und erhält daher ${fmt(je * j)} € als Gewinnbeteiligung.`;
        }
      },
    ]
  }
};

// ============================================================================
// HAUPTFUNKTION – FALLBEISPIELE ANZEIGEN
// ============================================================================

function zeigeZufaelligeEntgeltformen() {
  const container = document.getElementById('Container');

  if (!container) {
    console.error("Container nicht gefunden");
    return;
  }

  const kundeSelect = document.getElementById('entgeltKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  const anzeigeName = kundeValue || '[Modellunternehmen]';

  const anzahl = parseInt(document.getElementById('anzahlFaelle')?.value) || 6;
  const proArt = Math.max(1, Math.floor(anzahl / 3));
  const zeigeArt = document.getElementById('zeigeArt')?.checked;

  // Pro Entgeltform proArt verschiedene Fälle, danach alles mischen
  let faelle = [];
  Object.keys(entgeltformen).forEach(key => {
    const diff = entgeltformen[key];
    shuffle(diff.formulierungen).slice(0, proArt).forEach(f => {
      const ausgabe = pick(unternehmensVarianten)(anzeigeName);
      faelle.push({
        key,
        label: diff.label,
        langform: diff.langform,
        kurzbeschreibung: diff.kurzbeschreibung,
        art: f.art,
        text: f.text(ausgabe)
      });
    });
  });
  faelle = shuffle(faelle);

  letzteEntgeltAufgaben = faelle.map(f => ({ text: f.text, label: f.label }));

  let aufgabenHTML = '<h2>Aufgaben</h2>';
  aufgabenHTML += '<p>Ordne jedem Fall die passende Entgeltform zu: <strong>Zeitentgelt</strong>, <strong>Leistungsentgelt</strong> oder <strong>Gewinnbeteiligung</strong>.</p><ol>';
  let loesungenHTML = '<h2 class="loesung">Lösung</h2>';

  faelle.forEach((f, idx) => {
    aufgabenHTML += `<li>${f.text}</li>`;

    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${idx + 1}.</strong><br>`;
    loesungenHTML += `<div style="border: 1px solid #ccc; background-color:#fff; font-family:courier; padding: 4px 8px; margin: 0 0 6px;">
      <strong>${f.langform}</strong>${zeigeArt ? ` – Art: ${f.art}` : ''}<br>${f.kurzbeschreibung}
    </div>`;
    loesungenHTML += `</div>`;
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Assistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von Entgeltformen.

Aufgabe:
- Gib KEINE fertigen Lösungen (Begriffsnamen) vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Zuordnung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage, wovon die Höhe des Verdienstes abhängt (Arbeitszeit? Arbeitsleistung? Unternehmensgewinn?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst auf den richtigen Begriff kommt, bestätige ihn.

Methodik bei Rückfragen:
- Bekommt die Person Geld für die Zeit, die sie arbeitet?
- Hängt der Verdienst davon ab, wie viel oder wie gut die Person arbeitet?
- Bekommt die Person etwas, weil das Unternehmen Gewinn gemacht hat?
- Würde sich der Verdienst ändern, wenn die Person in der gleichen Zeit mehr schafft?

Die drei Entgeltformen:

1. Zeitentgelt 
   - Der Lohn richtet sich nach der Arbeitszeit
   - Beispiele: Stundenlohn, Tagelohn, Wochenlohn, Monatsgehalt
   - Kriterium: Wie lange wird gearbeitet?

2. Leistungsentgelt 
   - Der Lohn richtet sich nach der Arbeitsleistung
   - Beispiele: Stückakkord, Zeitakkord, Prämienlohn, Provision
   - Kriterium: Wie viel oder wie gut wird gearbeitet?

3. Gewinnbeteiligung
   - Beschäftigte erhalten zusätzlich einen Anteil am Gewinn des Unternehmens
   - Beispiele: Gewinnanteil für alle Mitarbeiter, Tantieme
   - Kriterium: Wie erfolgreich ist das Unternehmen?

Typische Abgrenzungsfehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- Zeitakkord ist Leistungsentgelt, obwohl das Wort „Zeit" vorkommt (bezahlt wird die Menge, nicht die tatsächlich gebrauchte Zeit)
- Prämien für Qualität oder Einsparungen gehören zum Leistungsentgelt, nicht zur Gewinnbeteiligung
- Provision hängt am Umsatz der Person, Gewinnbeteiligung am Gewinn des ganzen Unternehmens
- Das auslösende Merkmal entscheidet – nicht die Höhe des Betrags

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 💶⏱️📈✅❓

Was du NICHT tust:
- Nenne den Fachbegriff nicht, bevor der Schüler ihn selbst erarbeitet hat
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
// MOODLE-XML-EXPORT – Fragetyp „Zuordnung“ (matching), alle Fälle in EINER Frage
// ============================================================================

const MOODLE_ENTGELT_PRAEFIX = '8.5-03#T';
const MOODLE_ENTGELT_TITELENDE = 'meinBwR-Zuordnen';
const MOODLE_ENTGELT_ANWEISUNG = 'Ordne die jeweilige Entgeltform zu!';
const MOODLE_ENTGELT_PUNKTE_PRO_AUFGABE = 1;

function mxEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mxCdata(s) {
  return '<![CDATA[' + String(s ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
}

// Eindeutige, zeitabhängige ID (yyMMddHHmmss), pro Browser streng aufsteigend
function mxIdBasis() {
  const SCHLUESSEL = 'moodleEntgeltLetzteIdSekunde';
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
  const punkte = aufgaben.length * MOODLE_ENTGELT_PUNKTE_PRO_AUFGABE;
  const titel = `${MOODLE_ENTGELT_PRAEFIX}${mxIdBasis()}${MOODLE_ENTGELT_TITELENDE}`;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
  xml += `  <question type="matching">\n`;
  xml += `    <name>\n      <text>${mxEsc(titel)}</text>\n    </name>\n`;
  xml += `    <questiontext format="html">\n      <text>${mxCdata(`<p>${MOODLE_ENTGELT_ANWEISUNG}</p>`)}</text>\n    </questiontext>\n`;
  xml += `    <generalfeedback format="html">\n      <text></text>\n    </generalfeedback>\n`;
  xml += `    <defaultgrade>${punkte}</defaultgrade>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n`;
  xml += `    <shuffleanswers>true</shuffleanswers>\n`;
  xml += `    <correctfeedback format="html">\n      <text>${mxCdata('<p>Die Antwort ist richtig.</p>')}</text>\n    </correctfeedback>\n`;
  xml += `    <partiallycorrectfeedback format="html">\n      <text>${mxCdata('<p>Die Antwort ist teilweise richtig.</p>')}</text>\n    </partiallycorrectfeedback>\n`;
  xml += `    <incorrectfeedback format="html">\n      <text>${mxCdata('<p>Die Antwort ist falsch.</p>')}</text>\n    </incorrectfeedback>\n`;
  xml += `    <shownumcorrect/>\n`;

  aufgaben.forEach(({ text, label }) => {
    xml += `    <subquestion format="html">\n`;
    xml += `      <text>${mxCdata(`<p>${text}</p><hr>`)}</text>\n`;
    xml += `      <answer>\n        <text>${mxEsc(label)}</text>\n      </answer>\n`;
    xml += `    </subquestion>\n`;
  });

  xml += `  </question>\n\n</quiz>\n`;
  return xml;
}

function exportiereMoodle() {
  if (!letzteEntgeltAufgaben.length) {
    alert('Bitte zuerst Aufgaben erstellen.');
    return;
  }
  const xml = mxBaueMatchingXml(letzteEntgeltAufgaben);

  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const dateiname = `quiz-entgeltformen-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

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

// ============================================================================
// INITIALISIERUNG
// ============================================================================

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

document.addEventListener('DOMContentLoaded', () => {
  const kundeSelect = document.getElementById('entgeltKunde');

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  if (kundeSelect) {
    kundeSelect.addEventListener('change', () => {
      kunde = kundeSelect.value.trim() || '';
    });
  }

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

  setTimeout(function () {
    autoSelectMyCompany();
    zeigeZufaelligeEntgeltformen();
  }, 500);
});