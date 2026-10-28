// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';
let letzteEkAufgaben = [];
let letzteAktiveSpalten = ['aufw', 'ertr', 'gewinn', 'ekAnf', 'ekEnd']; // Standard

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

  const kundeSelect = document.getElementById('ekKunde');
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

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Zufallszahl von min bis max in festen Schritten
function rnd(min, max, step) {
  const n = Math.floor((max - min) / step);
  return Math.round((min + Math.floor(Math.random() * (n + 1)) * step) * 100) / 100;
}

// Zahl mit zwei Dezimalstellen (deutsches Format, Minus als echtes Minuszeichen)
function fmt(n) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace('-', '−');
}

// Eurobetrag mit geschütztem Leerzeichen
function eur(n) {
  return fmt(n) + '\u00a0€';
}

const unternehmensVarianten = [
  (name) => name,
  (name) => `Firma ${name}`,
  (name) => `Unternehmen ${name}`,
];

// Einleitungstexte (ohne Zahlen, passen für Aufgabe und Moodle)
const einleitungen = [
  (u) => `Im Buchführungsprogramm von ${u} fehlen in der folgenden Übersicht einige Werte. Berechne die fehlenden Werte.`,
  (u) => `Bei der Erstellung der Jahreszahlen von ${u} sind einige Werte verloren gegangen. Berechne die fehlenden Werte.`,
  (u) => `Bei ${u} zeigt das Programm einige Werte nicht an. Berechne die fehlenden Werte.`,
];

// ============================================================================
// DATENMODELL
// Pro Geschäftsjahr: aufw, ertr, ekAnf, ekEnd, gewinn (Erfolg), fehlt (verdeckte Spalte)
// Zusammenhang: gewinn = ertr − aufw = ekEnd − ekAnf
// ============================================================================

const SPALTEN = ['aufw', 'ertr', 'gewinn', 'ekAnf', 'ekEnd'];

const FELD_LABEL = {
  aufw: 'Summe der Aufwendungen',
  ertr: 'Summe der Erträge',
  gewinn: 'Gewinn / Verlust',
  ekAnf: 'EK zum 01.01.',
  ekEnd: 'EK zum 31.12.'
};

function erzeugeJahre(anzahlJahre, mitVerlust, anknuepfen, aktiveSpalten) {
  const endJahr = new Date().getFullYear();
  const jahre = [];
  let ekAnf = rnd(300000, 900000, 1000);

  for (let i = 0; i < anzahlJahre; i++) {
    if (i > 0 && !anknuepfen) ekAnf = rnd(300000, 900000, 1000);

    const aufw = rnd(120000, 400000, 2000);
    const verlust = mitVerlust && Math.random() < 0.3;
    const betrag = verlust ? rnd(4000, 40000, 2000) : rnd(10000, 90000, 2000);
    const gewinn = verlust ? -betrag : betrag;

    const ertr = aufw + gewinn;
    const ekEnd = ekAnf + gewinn;

    jahre.push({
      jahr: endJahr - anzahlJahre + 1 + i,
      aufw, ertr, ekAnf, ekEnd, gewinn,
      fehlt: pick(aktiveSpalten) // Es wird nur aus den sichtbaren Spalten eine verdeckte ausgewählt
    });

    ekAnf = ekEnd;
  }
  return jahre;
}

// ============================================================================
// TABELLE UND RECHENWEG
// ============================================================================

const TH_STYLE = 'border:1px solid #000; padding:3px 8px; text-align:center; font-weight:normal; background:#fff;';
const TD_STYLE = 'border:1px solid #000; padding:3px 8px; min-width:95px; text-align:right; white-space:nowrap; background:#fff;';

// zelleFn(jahrObjekt, spaltenKey) liefert den HTML-Inhalt der Zelle
function baueTabelle(jahre, zelleFn, aktiveSpalten) {
  let h = '<table style="border-collapse:collapse; margin:8px 0; font-family:Arial,Helvetica,sans-serif; font-size:14px;">';
  h += '<tr>';
  h += `<th style="${TH_STYLE}">Geschäfts&shy;jahr</th>`;
  aktiveSpalten.forEach(k => { h += `<th style="${TH_STYLE}">${FELD_LABEL[k]}</th>`; });
  h += '</tr>';
  jahre.forEach(j => {
    h += `<tr><td style="${TD_STYLE} text-align:center;">${j.jahr}</td>`;
    aktiveSpalten.forEach(k => { h += `<td style="${TD_STYLE}">${zelleFn(j, k)}</td>`; });
    h += '</tr>';
  });
  h += '</table>';
  return h;
}

// Rechenweg als Liste von Textzeilen (reiner Text, ohne HTML)
function rechenwegZeilen(j) {
  const par = n => (n < 0 ? `(${eur(n)})` : eur(n));
  const art = j.gewinn >= 0 ? 'Gewinn' : 'Verlust';

  switch (j.fehlt) {
    case 'gewinn':
      return [`Gewinn/Verlust = Erträge − Aufwendungen = ${eur(j.ertr)} − ${eur(j.aufw)} = ${eur(j.gewinn)} (${art})`];
    case 'ertr':
      return [`Erträge = Aufwendungen + Gewinn/Verlust = ${eur(j.aufw)} + ${par(j.gewinn)} = ${eur(j.ertr)}`];
    case 'aufw':
      return [`Aufwendungen = Erträge − Gewinn/Verlust = ${eur(j.ertr)} − ${par(j.gewinn)} = ${eur(j.aufw)}`];
    case 'ekAnf':
      return [`EK 01.01. = EK 31.12. − Gewinn/Verlust = ${eur(j.ekEnd)} − ${par(j.gewinn)} = ${eur(j.ekAnf)}`];
    case 'ekEnd':
      return [`EK 31.12. = EK 01.01. + Gewinn/Verlust = ${eur(j.ekAnf)} + ${par(j.gewinn)} = ${eur(j.ekEnd)}`];
  }
  return [];
}

// ============================================================================
// HAUPTFUNKTION – AUFGABEN ANZEIGEN
// ============================================================================

function zeigeZufaelligeEkAufgaben() {
  const container = document.getElementById('Container');

  if (!container) {
    console.error("Container nicht gefunden");
    return;
  }

  const kundeSelect = document.getElementById('ekKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  const anzeigeName = kundeValue || '[Modellunternehmen]';

  const anzahl = parseInt(document.getElementById('anzahlAufgaben')?.value) || 3;
  const anzahlJahre = parseInt(document.getElementById('anzahlJahre')?.value) || 2;
  const mitVerlust = document.getElementById('mitVerlust')?.checked;
  const anknuepfen = document.getElementById('anknuepfen')?.checked;
  const zeigeRechenweg = document.getElementById('zeigeRechenweg')?.checked;

  // Spalten-Checkboxen auslesen
  const spalteAufwErtr = document.getElementById('spalteAufwErtr')?.checked ?? true;
  const spalteGewinn = document.getElementById('spalteGewinn')?.checked ?? true;
  const spalteEk = document.getElementById('spalteEk')?.checked ?? true;

  const anzahlGewaehlt = (spalteAufwErtr ? 1 : 0) + (spalteGewinn ? 1 : 0) + (spalteEk ? 1 : 0);

  if (anzahlGewaehlt < 2) {
    alert('Bitte wähle mindestens 2 Spaltengruppen aus, damit sinnvolle Berechnungen möglich sind.');
    return;
  }

  let aktiveSpalten = [];
  if (spalteAufwErtr) aktiveSpalten.push('aufw', 'ertr');
  if (spalteEk) aktiveSpalten.push('ekAnf', 'ekEnd');
  if (spalteGewinn) aktiveSpalten.push('gewinn'); // Gewinn-Spalte landet nun garantiert ganz rechts

  letzteAktiveSpalten = aktiveSpalten;

  const aufgaben = [];
  for (let i = 0; i < anzahl; i++) {
    const u = pick(unternehmensVarianten)(anzeigeName);
    aufgaben.push({
      intro: pick(einleitungen)(u),
      jahre: erzeugeJahre(anzahlJahre, mitVerlust, anknuepfen, aktiveSpalten)
    });
  }
  letzteEkAufgaben = aufgaben;
  
  let aufgabenHTML = '';
  let loesungenHTML = '<h2 class="loesung">Lösung</h2>';

  aufgaben.forEach((a, idx) => {
    // Aufgabe: verdeckte Zelle bleibt leer
    const tabelle = baueTabelle(a.jahre, (j, k) => (j.fehlt === k ? '' : eur(j[k])), aktiveSpalten);
    const liStyle = anzahl === 1 ? 'style="margin-bottom: 1.5em; list-style: none;"' : 'style="margin-bottom: 1.5em;"';
    aufgabenHTML += `<li ${liStyle}>${a.intro}${tabelle}</li>`;

    // Lösung: dieselbe Tabelle, fehlender Wert blau und fett
    const loesungsTabelle = baueTabelle(a.jahre, (j, k) =>
      j.fehlt === k
        ? `<span style="color:#0070c0;"><strong>${eur(j[k])}</strong></span>`
        : eur(j[k]),
      aktiveSpalten
    );

    // Nummerierung bei der Lösung nur anzeigen, wenn es mehr als 1 Aufgabe gibt
    const loesungsPraefix = anzahl > 1 ? `<strong>${idx + 1}.</strong>` : '';
    loesungenHTML += `<div style="margin-top: 1.5em;">${loesungsPraefix}${loesungsTabelle}`;

    if (zeigeRechenweg) {
      a.jahre.forEach(j => {
        loesungenHTML += `<div style="border: 1px solid #ccc; background-color:#fff; font-family:courier; padding: 4px 8px; margin: 0 0 6px;">`;
        loesungenHTML += `<strong>${j.jahr}:</strong><br>${rechenwegZeilen(j).join('<br>')}`;
        loesungenHTML += `</div>`;
      });
    }
    loesungenHTML += `</div>`;
  });

  const aufgabenContainer = document.getElementById('aufgabenContainer');
  const loesungenContainer = document.getElementById('loesungenContainer');

  // Bei 1 Aufgabe ein einfaches <ul> ohne Nummerierung verwenden, sonst <ol>
  const listenTag = anzahl === 1 ? 'ul' : 'ol';
  const listenStyle = anzahl === 1 ? ' style="list-style: none; padding-left: 0;"' : '';

  if (aufgabenContainer && loesungenContainer) {
    aufgabenContainer.innerHTML = `<${listenTag}${listenStyle}>${aufgabenHTML}</${listenTag}>`;
    loesungenContainer.innerHTML = loesungenHTML;
  } else {
    container.innerHTML = `<${listenTag}${listenStyle}>${aufgabenHTML}</${listenTag}><hr style="margin: 2em 0;">${loesungenHTML}`;
  }
}
// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Assistent für Schüler der Realschule (BwR). Du hilfst beim Eigenkapitalvergleich: Schüler berechnen in einer Tabelle fehlende Werte (Summe der Aufwendungen, Summe der Erträge, Eigenkapital zum 01.01., Eigenkapital zum 31.12.).

Aufgabe:
- Nenne KEINE fertigen Ergebnisse und keine fertigen Rechnungen mit eingesetzten Zahlen.
- Führe die Schüler durch gezielte Fragen und Hinweise zum Rechenweg.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage zuerst: Welcher Wert fehlt in der Zeile? Welche Werte kennst du schon?
- Frage: Wie hängen Erträge und Aufwendungen mit dem Erfolg (Gewinn oder Verlust) zusammen?
- Frage: Wie verändert sich das Eigenkapital, wenn das Unternehmen Gewinn bzw. Verlust macht?
- Lass die Schüler zuerst den Erfolg des Jahres bestimmen und danach den fehlenden Wert.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht das Ergebnis.
- Erst wenn der Schüler selbst auf das richtige Ergebnis kommt, bestätige es.

Hintergrundwissen (nur für dich – nicht vorwegnehmen):
- Erfolg = Erträge − Aufwendungen
- Erfolg = Eigenkapital am 31.12. − Eigenkapital am 01.01. (in diesen Aufgaben gibt es keine Privatentnahmen und Einlagen)
- Erträge größer als Aufwendungen: Gewinn, das Eigenkapital steigt
- Aufwendungen größer als Erträge: Verlust, das Eigenkapital sinkt
- Das Eigenkapital zum 31.12. eines Jahres ist meist das Eigenkapital zum 01.01. des Folgejahres
- „####" bedeutet: Der Wert wird im Programm nicht angezeigt und muss berechnet werden

Typische Fehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- Anfangs- und Endbestand des Eigenkapitals werden verwechselt (Ende minus Anfang, nicht umgekehrt)
- Erträge und Aufwendungen werden vertauscht, dadurch stimmt das Vorzeichen des Erfolgs nicht
- Bei einem Verlust wird das Eigenkapital fälschlich erhöht statt gemindert
- Der Erfolg wird zwar berechnet, aber nicht auf den fehlenden Wert angewendet
- Aufwendungen werden mit dem Eigenkapital verwechselt

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 📊💶📈📉✅❓

Was du NICHT tust:
- Nenne das Ergebnis nicht, bevor der Schüler es selbst berechnet hat
- Rechne nicht vor, auch nicht „zur Kontrolle"
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist
- Wenn der Schüler ein Ergebnis nennt, sage nur, ob es stimmt; bei falschen Ergebnissen hilf mit einer Frage, die auf den Fehler führt
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
// MOODLE-XML-EXPORT – Fragetyp „Cloze“ (Lückentext mit NUMERICAL)
// Pro Aufgabe (Tabelle) eine Cloze-Frage, jede verdeckte Zelle ist eine Lücke.
// ============================================================================

const MOODLE_EK_PRAEFIX = '7.5-07#T';
const MOODLE_EK_TITELENDE = 'meinBwR-Berechnen';
const MOODLE_EK_HINWEIS = '';
const MOODLE_EK_PUNKTE_PRO_LUECKE = 1;

function mxEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mxCdata(s) {
  return '<![CDATA[' + String(s ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
}

// Eindeutige, zeitabhängige ID (yyMMddHHmmss), pro Browser streng aufsteigend
function mxIdBasis() {
  const SCHLUESSEL = 'moodleEkLetzteIdSekunde';
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

function mxBaueClozeXml(aufgaben) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';

  aufgaben.forEach(a => {
    const titel = `${MOODLE_EK_PRAEFIX}${mxIdBasis()}${MOODLE_EK_TITELENDE}`;
    const punkte = a.jahre.length * MOODLE_EK_PUNKTE_PRO_LUECKE;

    // Frage: Tabelle, verdeckte Zellen werden zu SHORTANSWER-Lücken
    const tabelle = baueTabelle(a.jahre, (j, k) => {
      if (j.fehlt === k) {
        const korrekterWert = mxMoodleBetrag(j[k]);
        // Moodle Cloze Shortanswer Syntax: {1:SHORTANSWER:=5.000,00 €} oder mit Toleranz für Schreibweisen
        return `{${MOODLE_EK_PUNKTE_PRO_LUECKE}:SHORTANSWER:=${korrekterWert}}`;
      } else {
        return eur(j[k]);
      }
    }, letzteAktiveSpalten);

    const frage = `<p>${a.intro}</p>${tabelle}<p><em>${MOODLE_EK_HINWEIS}</em></p>`;

    // Rückmeldung: Rechenweg je Geschäftsjahr
    let feedback = '<p><strong>Lösungsweg</strong></p>';
    a.jahre.forEach(j => {
      feedback += `<p><strong>${j.jahr}:</strong><br>${rechenwegZeilen(j).join('<br>')}</p>`;
    });

    xml += `  <question type="cloze">\n`;
    xml += `    <name>\n      <text>${mxEsc(titel)}</text>\n    </name>\n`;
    xml += `    <questiontext format="html">\n      <text>${mxCdata(frage)}</text>\n    </questiontext>\n`;
    xml += `    <generalfeedback format="html">\n      <text>${mxCdata(feedback)}</text>\n    </generalfeedback>\n`;
    xml += `    <defaultgrade>${punkte}</defaultgrade>\n`;
    xml += `    <penalty>0.3333333</penalty>\n`;
    xml += `    <hidden>0</hidden>\n`;
    xml += `    <idnumber></idnumber>\n`;
    xml += `  </question>\n\n`;
  });

  xml += `</quiz>\n`;
  return xml;
}

// Formatiert den Wert exakt so, wie der Schüler ihn eingeben soll (z.B. 5.000,00 €)
function mxMoodleBetrag(n) {
  return fmt(n) + '\u00a0€'; // Nutzt deine vorhandene fmt()-Funktion + geschütztes Leerzeichen und €
}

function exportiereMoodle() {
  if (!letzteEkAufgaben.length) {
    alert('Bitte zuerst Aufgaben erstellen.');
    return;
  }
  const xml = mxBaueClozeXml(letzteEkAufgaben);

  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const dateiname = `quiz-eigenkapitalvergleich-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

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
  const kundeSelect = document.getElementById('ekKunde');

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
    zeigeZufaelligeEkAufgaben();
  }, 500);
});