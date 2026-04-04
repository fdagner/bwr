// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let yamlData = [];

// ============================================================================
// YAML-DATEN LADEN
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
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => console.error("Konnte unternehmen.yml nicht laden:", err));
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

const familienNamen = [
  'Müller', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Ivanov', 'Petrov', 
  'Yilmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Garcia', 'Martinez', 'Lopez',       
  'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder',
  'Neumann', 'Braun', 'Zimmermann', 'Krüger', 'Hartmann', 'Schmitt',
];

const maennlVornamen = ['Omar', 'Hassan', 'Karim', 'Stefan', 'Andreas', 'Christian', 'Carlos', 'Luis', 'Peter', 'Martin'];
const weiblVornamen  = ['Sandra', 'Milena', 'Ana', 'Ivana', 'Christine', 'Aylin', 'Fatma', 'Elif', 'Linh', 'Mai', 'Andrea', 'Sabine', 'Claudia', 'Nicole', 'Julia', 'Maria'];

// ============================================================================
// EINKOMMENSQUELLEN – FARBEN
// ============================================================================

const FARBEN = {
  arbeitN:  { bg: '#1a9e8f', text: '#fff', label: 'Nichtselbstständige Arbeit' },
  arbeitS:  { bg: '#2980b9', text: '#fff', label: 'Selbstständige Arbeit' },
  vermoegen:{ bg: '#e67e22', text: '#fff', label: 'Vermögen' },
  transfer: { bg: '#27ae60', text: '#fff', label: 'Staatliche Leistungen' },
};

// ============================================================================
// FALLBEISPIELE
// ============================================================================

const fallbeispiele = [

  // ── NICHTSELBSTSTÄNDIGE ARBEIT ───────────────────────────────────────────
  {
    typ: 'arbeit_n',
    beschreibung: (n) => `${pick(maennlVornamen)} ${n} arbeitet als Buchhalter bei einem Industrieunternehmen. Jeden Monat erhält er sein Gehalt auf sein Konto überwiesen.`,
    quellen: [
      { akteur: 'Industrieunternehmen', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Gehalt', quelle: 'Nichtselbstständige Arbeit', einkommensart: 'Gehalt' }
    ],
  },
  {
    typ: 'arbeit_n',
    beschreibung: (n) => `${pick(weiblVornamen)} ${n} ist als Krankenpflegerin in einem Krankenhaus angestellt. Sie erhält am Monatsende ihren Lohn.`,
    quellen: [
      { akteur: 'Krankenhaus', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Lohn', quelle: 'Nichtselbstständige Arbeit', einkommensart: 'Lohn' }
    ],
  },
  {
    typ: 'arbeit_n',
    beschreibung: (n) => `${pick(maennlVornamen)} ${n} ist Auszubildender in einem Handwerksbetrieb. Er bekommt monatlich eine Ausbildungsvergütung ausgezahlt.`,
    quellen: [
      { akteur: 'Handwerksbetrieb', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Ausbildungsvergütung', quelle: 'Nichtselbstständige Arbeit', einkommensart: 'Ausbildungsvergütung' }
    ],
  },
  {
    typ: 'arbeit_n',
    beschreibung: (n) => `${pick(weiblVornamen)} ${n} arbeitet als Lehrerin an einer staatlichen Schule. Am Ende des Monats wird ihr Gehalt vom Freistaat überwiesen.`,
    quellen: [
      { akteur: 'Freistaat Bayern', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Gehalt (Beamtin)', quelle: 'Nichtselbstständige Arbeit', einkommensart: 'Gehalt (Beamtenbezüge)' }
    ],
  },

  // ── SELBSTSTÄNDIGE ARBEIT ────────────────────────────────────────────────
  {
    typ: 'arbeit_s',
    beschreibung: (n) => `${pick(maennlVornamen)} ${n} betreibt eine eigene Schreinerei. Am Jahresende ermittelt er seinen Gewinn aus dem Betrieb.`,
    quellen: [
      { akteur: 'Eigene Schreinerei', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Gewinn', quelle: 'Selbstständige Arbeit', einkommensart: 'Gewinn' }
    ],
  },
  {
    typ: 'arbeit_s',
    beschreibung: (n) => `${pick(weiblVornamen)} ${n} ist freiberufliche Grafikdesignerin. Sie stellt ihren Kunden nach Projektabschluss ein Honorar in Rechnung.`,
    quellen: [
      { akteur: 'Auftraggeber / Kunden', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Honorar', quelle: 'Selbstständige Arbeit', einkommensart: 'Honorar' }
    ],
  },
  {
    typ: 'arbeit_s',
    beschreibung: (n) => `${pick(maennlVornamen)} ${n} tritt als selbstständiger Musiker auf Konzerten und Veranstaltungen auf. Nach jedem Auftritt erhält er seine Gage.`,
    quellen: [
      { akteur: 'Veranstalter', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Gage', quelle: 'Selbstständige Arbeit', einkommensart: 'Gage' }
    ],
  },
  {
    typ: 'arbeit_s',
    beschreibung: (n) => `${pick(weiblVornamen)} ${n} ist niedergelassene Ärztin mit eigener Praxis. Ihre Einnahmen stammen aus Behandlungshonoraren der Krankenkassen und Privatpatienten.`,
    quellen: [
      { akteur: 'Krankenkassen / Patienten', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Honorar', quelle: 'Selbstständige Arbeit', einkommensart: 'Honorar / Gewinn' }
    ],
  },

  // ── VERMÖGENSEINKOMMEN ───────────────────────────────────────────────────
  {
    typ: 'vermoegen',
    beschreibung: (n) => `Familie ${n} hat Ersparnisse auf einem Festgeldkonto angelegt. Am Jahresende schreibt die Bank Zinsen auf das Konto gut.`,
    quellen: [
      { akteur: 'Bank', pfeilRechts: 'Faktor Kapital', pfeilLinks: 'Zinseinkünfte', quelle: 'Vermögen', einkommensart: 'Zinseinkünfte' }
    ],
  },
  {
    typ: 'vermoegen',
    beschreibung: (n) => `Familie ${n} besitzt eine Eigentumswohnung, die sie an einen Mieter vermietet. Monatlich fließt die Miete auf ihr Konto.`,
    quellen: [
      { akteur: 'Mieter', pfeilRechts: 'Faktor Boden / Kapital', pfeilLinks: 'Mieteinkünfte', quelle: 'Vermögen', einkommensart: 'Mieteinkünfte' }
    ],
  },
  {
    typ: 'vermoegen',
    beschreibung: (n) => `${pick(maennlVornamen)} ${n} ist Aktionär eines Automobilherstellers. Jährlich erhält er seinen Anteil am Unternehmensgewinn als Dividende ausgezahlt.`,
    quellen: [
      { akteur: 'Automobilhersteller', pfeilRechts: 'Faktor Kapital', pfeilLinks: 'Dividende', quelle: 'Vermögen', einkommensart: 'Dividende (Kapitaleinkünfte)' }
    ],
  },
  {
    typ: 'vermoegen',
    beschreibung: (n) => `Familie ${n} hat einen landwirtschaftlichen Betrieb an einen Pächter verpachtet. Der Pächter zahlt dafür jährlich Pacht.`,
    quellen: [
      { akteur: 'Pächter', pfeilRechts: 'Faktor Boden', pfeilLinks: 'Pachteinkünfte', quelle: 'Vermögen', einkommensart: 'Pachteinkünfte' }
    ],
  },

  // ── STAATLICHE / SOZIALE LEISTUNGEN ─────────────────────────────────────
  {
    typ: 'transfer',
    beschreibung: (n) => `Familie ${n} hat zwei minderjährige Kinder. Monatlich überweist die Familienkasse Kindergeld auf das Konto der Eltern.`,
    quellen: [
      { akteur: 'Familienkasse / Staat', pfeilRechts: '—', pfeilLinks: 'Kindergeld', quelle: 'Staatliche Leistungen', einkommensart: 'Kindergeld' }
    ],
  },
  {
    typ: 'transfer',
    beschreibung: (n) => `${pick(maennlVornamen)} ${n} ist nach 40 Berufsjahren in Rente gegangen. Monatlich überweist die Deutsche Rentenversicherung seine Altersrente.`,
    quellen: [
      { akteur: 'Deutsche Rentenversicherung', pfeilRechts: '—', pfeilLinks: 'Altersrente', quelle: 'Staatliche Leistungen', einkommensart: 'Altersrente' }
    ],
  },
  {
    typ: 'transfer',
    beschreibung: (n) => `${pick(maennlVornamen)} ${n} leistet seinen Wehrdienst bei der Bundeswehr. Für seinen Dienst erhält er monatlich Sold.`,
    quellen: [
      { akteur: 'Bundeswehr / Staat', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Sold', quelle: 'Staatliche Leistungen', einkommensart: 'Sold' }
    ],
  },
  {
    typ: 'transfer',
    beschreibung: (n) => `${pick(weiblVornamen)} ${n} hat nach der Geburt ihres Kindes Anspruch auf Elterngeld. Der Staat überweist ihr für 12 Monate monatlich Elterngeld.`,
    quellen: [
      { akteur: 'Staat (Elterngeldstelle)', pfeilRechts: '—', pfeilLinks: 'Elterngeld', quelle: 'Staatliche Leistungen', einkommensart: 'Elterngeld' }
    ],
  },

  // ── GEMISCHTE AUFGABEN ───────────────────────────────────────────────────
  {
    typ: 'gemischt',
    beschreibung: (n) => `Familie ${n}: ${pick(maennlVornamen)} ${n} ist als Ingenieur bei einem Automobilhersteller angestellt und bezieht ein monatliches Gehalt. Seine Frau ${pick(weiblVornamen)} ${n} betreibt eine eigene Yogaschule und erzielt daraus Gewinn. Außerdem besitzen sie eine vermietete Wohnung.`,
    quellen: [
      { akteur: 'Automobilhersteller', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Gehalt', quelle: 'Nichtselbstständige Arbeit', einkommensart: 'Gehalt' },
      { akteur: 'Eigene Yogaschule', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Gewinn', quelle: 'Selbstständige Arbeit', einkommensart: 'Gewinn' },
      { akteur: 'Mieter', pfeilRechts: 'Faktor Kapital', pfeilLinks: 'Mieteinkünfte', quelle: 'Vermögen', einkommensart: 'Mieteinkünfte' },
    ],
  },
  {
    typ: 'gemischt',
    beschreibung: (n) => `Familie ${n}: ${pick(weiblVornamen)} ${n} arbeitet als Bankkauffrau und erhält monatlich ihr Gehalt. Ihr Mann ${pick(maennlVornamen)} ${n} ist Rentner und bezieht Altersrente. Für ihre zwei Kinder erhalten sie Kindergeld.`,
    quellen: [
      { akteur: 'Bank', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Gehalt', quelle: 'Nichtselbstständige Arbeit', einkommensart: 'Gehalt' },
      { akteur: 'Deutsche Rentenversicherung', pfeilRechts: '—', pfeilLinks: 'Altersrente', quelle: 'Staatliche Leistungen', einkommensart: 'Altersrente' },
      { akteur: 'Familienkasse / Staat', pfeilRechts: '—', pfeilLinks: 'Kindergeld', quelle: 'Staatliche Leistungen', einkommensart: 'Kindergeld' },
    ],
  },
  {
    typ: 'gemischt',
    beschreibung: (n) => `Familie ${n}: ${pick(maennlVornamen)} ${n} ist selbstständiger Steuerberater. Seine Frau ${pick(weiblVornamen)} ${n} ist als Sekretärin angestellt. Zusätzlich haben sie Ersparnisse bei der Bank angelegt, auf die sie jährlich Zinsen erhalten.`,
    quellen: [
      { akteur: 'Eigene Steuerberaterkanzlei', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Honorar / Gewinn', quelle: 'Selbstständige Arbeit', einkommensart: 'Honorar / Gewinn' },
      { akteur: 'Arbeitgeber (Büro)', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Gehalt', quelle: 'Nichtselbstständige Arbeit', einkommensart: 'Gehalt' },
      { akteur: 'Bank', pfeilRechts: 'Faktor Kapital', pfeilLinks: 'Zinseinkünfte', quelle: 'Vermögen', einkommensart: 'Zinseinkünfte' },
    ],
  },
  {
    typ: 'gemischt',
    beschreibung: (n) => `Familie ${n}: ${pick(maennlVornamen)} ${n} ist Soldat bei der Bundeswehr und erhält Sold. Seine Frau ${pick(weiblVornamen)} ${n} ist freiberufliche Fotografin und stellt ihren Kunden Honorare in Rechnung. Das Paar vermietet außerdem eine Einliegerwohnung.`,
    quellen: [
      { akteur: 'Bundeswehr / Staat', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Sold', quelle: 'Staatliche Leistungen', einkommensart: 'Sold' },
      { akteur: 'Auftraggeber / Kunden', pfeilRechts: 'Faktor Arbeit', pfeilLinks: 'Honorar', quelle: 'Selbstständige Arbeit', einkommensart: 'Honorar' },
      { akteur: 'Mieter (Einliegerwohnung)', pfeilRechts: 'Faktor Boden/Kapital', pfeilLinks: 'Mieteinkünfte', quelle: 'Vermögen', einkommensart: 'Mieteinkünfte' },
    ],
  },
];

// ============================================================================
// HILFSFUNKTION FARBE
// ============================================================================

function quelleFarbe(quelle) {
  if (quelle.includes('Nichtselbst'))  return FARBEN.arbeitN;
  if (quelle.includes('Selbst'))       return FARBEN.arbeitS;
  if (quelle.includes('Vermögen'))     return FARBEN.vermoegen;
  if (quelle.includes('Staatl') || quelle.includes('Soziale') || quelle.includes('Leistung')) return FARBEN.transfer;
  return { bg: '#888', text: '#fff', label: quelle };
}

// ============================================================================
// HAUPTFUNKTION – AUFGABEN ANZEIGEN
// ============================================================================

function zeigeZufaelligeEinkommensaufgaben() {
  const container = document.getElementById('Container');
  if (!container) return;

  const anzahl    = parseInt(document.getElementById('anzahlAufgaben')?.value) || 4;
  const typFilter = document.getElementById('typFilter')?.value || 'alle';

  let pool = fallbeispiele;
  if (typFilter !== 'alle') pool = fallbeispiele.filter(f => f.typ === typFilter);
  if (pool.length === 0) pool = fallbeispiele;

  const ausgewaehlte = shuffle(pool).slice(0, Math.min(anzahl, pool.length));
  const namen = ausgewaehlte.map(() => pick(familienNamen));

 letzteGenerierteAufgaben = ausgewaehlte.map((fall, idx) => ({
  fall,
  name: namen[idx],
  text: fall.beschreibung(namen[idx]), 
}));

  // ── Aufgabenstellung ─────────────────────────────────────────────────────
  let html = `<h2>Aufgaben</h2>`;
  html += `<p style="font-style:italic; color:#555; font-size:0.95rem;">Lies die folgenden Fallbeispiele. Trage Akteur, Einkommensart und Einkommensquelle in die Tabelle unten ein.</p>`;
  html += `<ol>`;

letzteGenerierteAufgaben.forEach(({ text }, idx) => {
  html += `<li>${text}</li>`;  // derselbe "Stefan Müller..." wie im Prompt
});

  html += `</ol>`;

  // ── EINE gemeinsame Ausfülltabelle ───────────────────────────────────────
  html += `<h3>Tabelle</h3>`;
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:650px;">`;
  html += `<thead><tr style="background:#eee;">
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:center; width:40px;">Nr.</th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Akteur (Geldgeber)</th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Einkommensart</th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Einkommensquelle</th>
  </tr></thead><tbody>`;

  ausgewaehlte.forEach((fall, idx) => {
    fall.quellen.forEach((q, qi) => {
      html += `<tr>
        <td style="border:1px solid #ccc; padding:6px 10px; text-align:center; color:#888; font-size:0.85rem; vertical-align:top;">${qi === 0 ? (idx + 1) : ''}</td>
        <td style="border:1px solid #ccc; padding:6px 10px; height:32px;">&nbsp;</td>
        <td style="border:1px solid #ccc; padding:6px 10px; height:32px;">&nbsp;</td>
        <td style="border:1px solid #ccc; padding:6px 10px; height:32px;">&nbsp;</td>
      </tr>`;
    });
    if (idx < ausgewaehlte.length - 1) {
      html += `<tr><td colspan="4" style="border-left:1px solid #ccc; border-right:1px solid #ccc; border-top:2px solid #999; padding:0; height:0;"></td></tr>`;
    }
  });

  html += `</tbody></table>`;

  // ── Lösungstabelle ───────────────────────────────────────────────────────
  html += `<h2 style="margin-top:2em;">Lösung</h2>`;
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:650px;">`;
  html += `<thead><tr style="background:#eee;">
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:center; width:40px;">Nr.</th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Akteur (Geldgeber)</th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Einkommensart</th>
    <th style="border:1px solid #ccc; padding:6px 10px; text-align:left;">Einkommensquelle</th>
  </tr></thead><tbody>`;

  ausgewaehlte.forEach((fall, idx) => {
    fall.quellen.forEach((q, qi) => {
      const farbe = quelleFarbe(q.quelle);
      html += `<tr>
        <td style="border:1px solid #ccc; padding:5px 9px; text-align:center; color:#888; font-size:0.85rem; vertical-align:top;">${qi === 0 ? (idx + 1) : ''}</td>
        <td style="border:1px solid #ccc; padding:5px 9px;">${q.akteur}</td>
        <td style="border:1px solid #ccc; padding:5px 9px;">${q.einkommensart}</td>
        <td style="border:1px solid #ccc; padding:5px 9px;">
          <span style="background:${farbe.bg}; color:${farbe.text}; padding:2px 8px; border-radius:3px; font-size:0.85rem; font-weight:bold;">${q.quelle}</span>
        </td>
      </tr>`;
    });
    if (idx < ausgewaehlte.length - 1) {
      html += `<tr><td colspan="4" style="border-left:1px solid #ccc; border-right:1px solid #ccc; border-top:2px solid #999; padding:0; height:0;"></td></tr>`;
    }
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
    const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && vorschau.style.display !== 'none') {
    vorschau.textContent = erstelleKiPromptText();
  }
}

let letzteGenerierteAufgaben = []; // { fall, name } pro Aufgabe

function erstelleLoesungsTextV(fall, name) {
  return fall.quellen
    .map(q =>
      `Akteur: ${q.akteur} | Einkommensart: ${q.einkommensart} | Einkommensquelle: ${q.quelle}`
    )
    .join('\n');
}


function erstelleKiPromptText() {
  let aufgabenUndLoesungen = "";

  if (letzteGenerierteAufgaben.length === 0) {
    aufgabenUndLoesungen = "(Noch keine Aufgaben generiert. Bitte zuerst neue Aufgaben erstellen.)";
  } else {
    aufgabenUndLoesungen = letzteGenerierteAufgaben
      .map(({ fall, name, text }, idx) => {
        const nr = idx + 1;
        return `Aufgabe ${nr}:\n${text}\n\nMusterlösung ${nr}:\n${erstelleLoesungsTextV(fall, name)}`;
      })
      .join("\n\n---\n\n");
  }

  return KI_ASSISTENT_PROMPT.replace("###AUFGABEN und LÖSUNGEN###", aufgabenUndLoesungen);
}



// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Wirtschaftsassistent für Schüler der Realschule (BwR / Wirtschaft). Du hilfst beim Verständnis von Einkommensquellen und Einkommensarten.

Aufgabe:
- Gib KEINE fertigen Lösungen direkt vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Zuordnung.
- Ziel: Lernförderung, eigenes Denken.

Wichtige Begriffe (korrekt verwenden!):
- Einkommensquelle = Woher kommt das Einkommen? (Nichtselbstständige Arbeit / Selbstständige Arbeit / Vermögen / Staatliche Leistungen)
- Einkommensart = Wie heißt es konkret? (Gehalt, Lohn, Gewinn, Honorar, Zinsen, Miete, Kindergeld …)

Pädagogischer Ansatz:
- Frage, in welcher Beziehung die Person zum Geldgeber steht (angestellt? selbstständig? Eigentümer? Staat?).
- Stelle gezielte Rückfragen.
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst auf den richtigen Begriff kommt, bestätige ihn.

Begrüße den Schüler freundlich und gib ihm eine Aufgabe vor, die du aus der folgenden Aufgabenliste zufällig auswählst.
Arbeitsauftrag: "Lies das Fallbeispiel. Nenne dazu Akteur, Einkommensart und Einkommensquelle."

Aufgabenliste:

###AUFGABEN und LÖSUNGEN###

Methodik bei Rückfragen:
- Ist die Person bei jemandem angestellt oder arbeitet sie auf eigene Rechnung?
- Bekommt die Person Geld für ihre Arbeit, für ihr Eigentum oder vom Staat?
- Wie heißt die konkrete Einkommensart – Lohn, Gehalt, Gewinn, Honorar, Gage, Zinsen, Miete, Dividende?
- Hat die Person selbst gearbeitet oder stellt sie etwas zur Verfügung?
- Kommt das Geld von einem privaten Unternehmen oder vom Staat / einer Sozialversicherung?

Die vier Einkommensquellen mit ihren Einkommensarten:

1. Nichtselbstständige Arbeit (Einkommensquelle)
   - Person ist bei einem Arbeitgeber angestellt (Arbeitsvertrag)
   - Einkommensarten: Lohn, Gehalt, Ausbildungsvergütung, Beamtenbezüge

2. Selbstständige Arbeit (Einkommensquelle)
   - Person arbeitet auf eigene Rechnung, kein Arbeitgeber
   - Einkommensarten: Gewinn, Honorar, Gage

3. Vermögen (Einkommensquelle)
   - Person stellt Kapital oder Boden zur Verfügung
   - Einkommensarten: Zinsen, Miete, Pacht, Dividende

4. Staatliche Leistungen (Einkommensquelle)
   - Zahlung vom Staat oder Sozialversicherung ohne direkte wirtschaftliche Gegenleistung
   - Einkommensarten: Kindergeld, Altersrente, Elterngeld, Sold, Arbeitslosengeld

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 💶📊🏠🏛️

Was du NICHT tust:
- Nenne die Einkommensart nicht direkt, bevor der Schüler selbst argumentiert hat
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort"

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch eine andere Aufgabe üben? Dann geb ich dir einfach die nächste!"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Lösung selbst findet und versteht.
`;

function kopiereKiPrompt() {
  const promptText = erstelleKiPromptText();
  navigator.clipboard
    .writeText(promptText)
    .then(() => {
      const btn = document.getElementById("kiPromptKopierenBtn");
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
      btn.classList.add("ki-prompt-btn--success");
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove("ki-prompt-btn--success");
      }, 2500);
    })
    .catch(() => alert("Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren."));
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    vorschau.textContent = erstelleKiPromptText();  // ← neu befüllen
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
    zeigeZufaelligeEinkommensaufgaben(); // 
  }, 500);
});