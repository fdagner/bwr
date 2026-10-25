  // ── Unternehmen / Werkstoffbezeichnungen aus YAML ─────────────────────────
let yamlData = [];

function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  if (userCompanies.length > 0) yamlData = [...yamlData, ...userCompanies];
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
      console.warn('localStorage YAML kaputt:', err);
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
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => console.error('Konnte unternehmen.yml nicht laden:', err));
}

function fillUnternehmenSelect() {
  const select = document.getElementById('unternehmenSelect');
  if (!select || !yamlData.length) return;

  select.innerHTML = '<option value="">– allgemein (Rohstoffe usw.) –</option>';

  [...yamlData]
    .sort((a, b) => {
      const ba = a.unternehmen?.branche || '', bb = b.unternehmen?.branche || '';
      if (ba !== bb) return ba.localeCompare(bb);
      return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
    })
    .forEach(c => {
      const u = c.unternehmen;
      if (!u?.name) return;
      const opt = document.createElement('option');
      opt.value = u.name;
      opt.textContent = (u.branche ? `${u.branche} – ` : '') + `${u.name} ${u.rechtsform || ''}`.trim();
      select.appendChild(opt);
    });

  // „Mein Unternehmen" vorauswählen, falls vorhanden
  const mein = localStorage.getItem('myCompany');
  if (mein && [...select.options].some(o => o.value === mein)) select.value = mein;
}

// Zufällige Bezeichnung aus YAML, sonst allgemeine Form (z. B. "Rohstoffen")
function getWerkstoffName(key) {
  const name = document.getElementById('unternehmenSelect')?.value;
  const eintrag = name ? yamlData.find(e => e.unternehmen?.name === name) : null;
  const liste = eintrag?.unternehmen?.werkstoffe?.[key];
  const kandidaten = Array.isArray(liste)
    ? liste.map(v => String(v ?? '').trim()).filter(v => v.length > 0)
    : [];
  if (kandidaten.length > 0) return kandidaten[Math.floor(Math.random() * kandidaten.length)];
  return KONTEN_CONFIG[key].label;
}
  
  function formatBetrag(value) {
      return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function rnd(min, max, step) {
      return Math.round((Math.random() * (max - min) + min) / step) * step;
    }

    const KONTEN_CONFIG = {
      AWR: { nr: '6000', name: 'AWR', label: 'Rohstoffen',       rahmen: { VE: [5000,20000], BK: [1000,10000], KA: [500,3000] } },
      AWF: { nr: '6010', name: 'AWF', label: 'Fremdbauteilen',   rahmen: { VE: [1000, 5000], BK: [500,  3000], KA: [100, 800]  } },
      AWH: { nr: '6020', name: 'AWH', label: 'Hilfsstoffen',     rahmen: { VE: [500,  3000], BK: [200,  1500], KA: [50,  500]  } },
      AWB: { nr: '6030', name: 'AWB', label: 'Betriebsstoffen',  rahmen: { VE: [500,  3000], BK: [200,  1500], KA: [50,  500]  } }
    };

    const POOL = ['VE','VE','VE','BK','BK','KA'];

    function gegenKonto(typ) {
      if (typ === 'VE') return { nr: '4400', kurz: 'VE' };
      if (typ === 'BK') return { nr: '2800', kurz: 'BK' };
      if (typ === 'KA') return { nr: '2880', kurz: 'KA' };
    }

        function geschaeftsfall(key, b) {
      const cfg = KONTEN_CONFIG[key];
      const wst = b.werkstoff || cfg.label;
        const texte = {
        VE: `Einkauf von ${wst} in Höhe von ${formatBetrag(b.betrag)}\u00a0€ netto auf Ziel.`,
        BK: `Kauf von ${wst} in Höhe von ${formatBetrag(b.betrag)}\u00a0€ netto per Banküberweisung.`,
        KA: `Beschaffung von ${wst} in Höhe von ${formatBetrag(b.betrag)}\u00a0€ netto in bar.`,
      };
      return texte[b.typ];
    }

    function renderTKontoAufgabe(titel, buchungen) {
      // Zeilenanzahl entspricht genau der Anzahl der Buchungen
      let rows = '';
      for (let i = 0; i < buchungen.length; i++) {
        const b = buchungen[i];
        rows += `<tr style="border-top:2px solid #ccc;">
          <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}.) ${b.typ}` : '&nbsp;'}</td>
          <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) + '\u00a0€' : '&nbsp;'}</td>
          <td style="padding:3px 2px 3px 6px;min-width:100px;">&nbsp;</td>
          <td style="text-align:right;padding:3px 2px;min-width:100px;">&nbsp;</td>
        </tr>`;
      }
      return `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
        <thead><tr>
          <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
          <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${titel}</span></th>
          <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    }


 // ── Moodle-Cloze-Export ───────────────────────────────────────────────────
let letzteAufgabe = [];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sonderzeichen, die in Cloze-Antworten maskiert werden müssen
function clozeEsc(s) {
  return String(s).replace(/([\\}#~\/])/g, '\\$1');
}

function clozeSelect(optionen) {
    return '{' + MOODLE_PREIS_PUNKTE_PRO_AUFGABE + ':MULTICHOICE:' +
    optionen.map(o => (o.richtig ? '=' : '') + clozeEsc(o.text)).join('~') + '}';
}

// Falsche Werkstoffe: Bezeichnungen der ANDEREN Konten (YAML, sonst allgemeine Form)
function getFalscheWerkstoffe(key, richtig, n = 3) {
  const name = document.getElementById('unternehmenSelect')?.value;
  const eintrag = name ? yamlData.find(e => e.unternehmen?.name === name) : null;
  let pool = [];
  Object.keys(KONTEN_CONFIG).filter(k => k !== key).forEach(k => {
    const liste = eintrag?.unternehmen?.werkstoffe?.[k];
    const eigene = Array.isArray(liste)
      ? liste.map(v => String(v ?? '').trim()).filter(v => v.length > 0)
      : [];
    if (eigene.length) pool.push(...eigene);
    else pool.push(KONTEN_CONFIG[k].label);
  });
  pool = [...new Set(pool)].filter(v => v !== richtig);
  return shuffleArray(pool).slice(0, n);
}

// ============================================================================
// MOODLE-CLOZE-EXPORT – Titel, ID und Punkte
// ============================================================================
const MOODLE_PREIS_PRAEFIX = '8.3-01#B';
const MOODLE_PREIS_TITELENDE = 'meinBwR-Buchungslesen';
const MOODLE_PREIS_PUNKTE_PRO_AUFGABE = 1;   // Gewicht pro Dropdown

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

function xmlEsc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


function exportiereMoodle() {
  const container = document.getElementById('Container');
  if (!container) return;

  // 1) Beschreibung: alles vor der Lösung (Aufgabenstellung + T-Konten), ohne die Überschrift "Aufgabe"
  let beschreibung = '';
  for (const el of container.children) {
    if (el.classList.contains('loesung')) break;
    if (el.tagName === 'H2') continue;
    beschreibung += el.outerHTML;
  }

  // 2) Geschäftsfälle aus dem (bearbeiteten) Container
  const absaetze = [...container.querySelectorAll('p')]
    .map(p => p.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(t => /^\d+\.\s/.test(t));

  if (!absaetze.length) { alert('Keine Geschäftsfälle im Container gefunden.'); return; }

      const re = /^(\d+)\.\s*(Einkauf|Kauf|Beschaffung|Verkauf)\s+von\s+(.+?)\s+in Höhe von\s+([\d.,]+)\s*€\s+(?:(netto|brutto)\s+)?(auf Ziel|per Banküberweisung|in bar)\.?$/;
      const zahlungen = ['auf Ziel', 'per Banküberweisung', 'in bar'];

  let zeilen = '';
  const uebersprungen = [];

  absaetze.forEach(text => {
    const m = text.match(re);
    if (!m) { uebersprungen.push(text.slice(0, 40) + '…'); return; }
    const [, nr, verb, werkstoff, betrag, nettoBrutto, zahlung] = m;

    // Konto der Buchung (nur um Werkstoffe desselben Kontos als Falschantwort auszuschließen)
    let key = null;
    letzteAufgabe.forEach(k => k.buchungen.forEach(b => { if (String(b.nr) === nr) key = k.key; }));

    const richtigesVerb = (verb === 'Verkauf') ? 'Einkauf' : verb;
    const verbDD = clozeSelect(shuffleArray([
      { text: richtigesVerb, richtig: true },
      { text: 'Verkauf',     richtig: false }
    ]));

    const werkstoffDD = clozeSelect(shuffleArray([
      { text: werkstoff, richtig: true },
      ...getFalscheWerkstoffe(key, werkstoff).map(t => ({ text: t, richtig: false }))
    ]));

    const zahlungDD = clozeSelect(shuffleArray(
      zahlungen.map(t => ({ text: t, richtig: t === zahlung }))
    ));

           zeilen += `<p><strong>${nr}.</strong> ${verbDD} von ${werkstoffDD} in Höhe von ${betrag}\u00a0€ ${nettoBrutto || 'netto'} ${zahlungDD}.</p>`;
          });

  if (!zeilen) { alert('Kein Geschäftsfall hatte das erwartete Format.'); return; }
  if (uebersprungen.length) {
    alert('Nicht erkannt (übersprungen):\n' + uebersprungen.join('\n'));
  }

  const titel = `${MOODLE_PREIS_PRAEFIX}${mxIdBasis()}${MOODLE_PREIS_TITELENDE}`;
  const fragetext = beschreibung + zeilen;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="cloze">
    <name><text>${mxEsc(titel)}</text></name>
    <questiontext format="html"><text>${mxCdata(fragetext)}</text></questiontext>
    <generalfeedback format="html"><text></text></generalfeedback>
    <penalty>0.3333333</penalty>
    <hidden>0</hidden>
  </question>
</quiz>`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'buchungslesen_werkstoffe_cloze.xml';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
function generiereAufgabe() {
      const container = document.getElementById('Container');
      if (!container) return;
      container.innerHTML = '';

      const ausgewaehlt = ['AWR','AWF','AWH','AWB'].filter(k =>
        document.getElementById('cb_' + k).checked
      );

      if (ausgewaehlt.length === 0) {
        container.innerHTML = '<p>Bitte mindestens ein Konto auswählen.</p>';
        return;
      }

      const anzahl = parseInt(document.getElementById('anzahlSelect').value, 10);
      const showNr = document.getElementById('showKontoNr').checked;

      let globalNr = 1;
      const alleKonten = ausgewaehlt.map(key => {
        const cfg = KONTEN_CONFIG[key];
        const buchungen = [];
        for (let i = 0; i < anzahl; i++) {
          const typ = POOL[Math.floor(Math.random() * POOL.length)];
          const [mn, mx] = cfg.rahmen[typ];
          const step = typ === 'KA' ? 10 : 100;
          buchungen.push({ nr: globalNr++, typ, betrag: rnd(mn, mx, step), werkstoff: getWerkstoffName(key) });
        }
        return { key, buchungen };
      });
      letzteAufgabe = alleKonten;
      // ── AUFGABE ──────────────────────────────────────────────────────
      let html = '<h2>Aufgabe zum Buchungslesen</h2>';
      html += `<p>Formuliere für die Eintragungen in den T-Konten jeweils einen Geschäftsfall.</p>`;

      html += `<div style="display:flex;flex-wrap:wrap;gap:18px;margin:1.5em 0 2em;">`;
      alleKonten.forEach(({ key, buchungen }) => {
        const cfg   = KONTEN_CONFIG[key];
        const titel = showNr ? `${cfg.nr} ${cfg.name}` : cfg.name;
        html += `<div>${renderTKontoAufgabe(titel, buchungen)}</div>`;
      });
      html += `</div>`;

      // ── LÖSUNG ───────────────────────────────────────────────────────
      html += `<h2 style="margin-top:2.5em" class="loesung">Lösung</h2>`;

      // Geschäftsfälle
      html += `<strong>Geschäftsfälle:</strong><br><br>`;
      let nr = 1;
      alleKonten.forEach(({ key, buchungen }) => {
        buchungen.forEach(b => {
          html += `<p><strong>${nr}.</strong> ${geschaeftsfall(key, b)}</p>`;
          nr++;
        });
      });

    
      container.innerHTML = html;
    }

    document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('unternehmenSelect')?.addEventListener('change', generiereAufgabe);
  if (!loadYamlFromLocalStorage()) loadDefaultYaml();
});

document.addEventListener('yamlDataLoaded', () => {
  fillUnternehmenSelect();
  generiereAufgabe();
});