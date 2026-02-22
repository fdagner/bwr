// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';

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

  const kundeSelect = document.getElementById('vertriebKunde');
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
// SVG-ICONS
// Platzhalter-SVGs – können durch eigene SVG-Grafiken ersetzt werden.
// Jede Funktion gibt einen <svg>-String zurück.
// ============================================================================

const ICONS = {
  // Hersteller – Fabrik / Zahnrad
  hersteller: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <!-- Gebäude -->
    <rect x="6" y="28" width="52" height="28" rx="2"/>
    <!-- Schornstein -->
    <rect x="12" y="16" width="8" height="14"/>
    <rect x="28" y="20" width="8" height="10"/>
    <!-- Fenster -->
    <rect x="10" y="36" width="8" height="8"/>
    <rect x="28" y="36" width="8" height="8"/>
    <rect x="46" y="36" width="8" height="8"/>
    <!-- Tor -->
    <rect x="26" y="44" width="12" height="12"/>
    <!-- Rauch-Linien -->
    <path d="M16 12 Q18 8 16 4"/>
    <path d="M32 16 Q34 12 32 8"/>
  </svg>`,

  // Großhändler – Lager / großes Gebäude
  grosshaendler: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <!-- Hauptgebäude -->
    <rect x="4" y="30" width="56" height="26" rx="2"/>
    <!-- Dach / Giebel -->
    <polyline points="2,30 32,10 62,30"/>
    <!-- Tore -->
    <rect x="8" y="40" width="14" height="16"/>
    <rect x="42" y="40" width="14" height="16"/>
    <!-- Mittelfenster -->
    <rect x="27" y="36" width="10" height="8"/>
  </svg>`,

  // Einzelhändler – Ladengeschäft
  einzelhaendler: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <!-- Gebäude -->
    <rect x="6" y="26" width="52" height="30" rx="2"/>
    <!-- Schaufenster -->
    <rect x="10" y="32" width="18" height="14"/>
    <rect x="36" y="32" width="18" height="14"/>
    <!-- Tür -->
    <rect x="26" y="42" width="12" height="14"/>
    <!-- Vordach -->
    <rect x="4" y="22" width="56" height="6" rx="1"/>
    <!-- Schild -->
    <rect x="16" y="14" width="32" height="8" rx="2"/>
  </svg>`,

  // Endverbraucher – Personengruppe
  endverbraucher: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <!-- Person Mitte -->
    <circle cx="32" cy="16" r="7"/>
    <path d="M20 54 Q20 38 32 38 Q44 38 44 54"/>
    <!-- Person links -->
    <circle cx="14" cy="20" r="6"/>
    <path d="M4 54 Q4 40 14 40 Q20 40 22 44"/>
    <!-- Person rechts -->
    <circle cx="50" cy="20" r="6"/>
    <path d="M60 54 Q60 40 50 40 Q44 40 42 44"/>
  </svg>`,

  // Online-Shop – Einkaufswagen mit Bildschirm
  onlineshop: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <!-- Bildschirm -->
    <rect x="6" y="8" width="52" height="34" rx="3"/>
    <line x1="26" y1="42" x2="22" y2="52"/>
    <line x1="38" y1="42" x2="42" y2="52"/>
    <line x1="18" y1="52" x2="46" y2="52"/>
    <!-- Einkaufswagen -->
    <polyline points="16,16 20,16 26,34 44,34 48,20 22,20"/>
    <circle cx="28" cy="38" r="2" fill="#333"/>
    <circle cx="42" cy="38" r="2" fill="#333"/>
  </svg>`,

  // Außendienst – Person mit Aktenkoffer
  aussendienst: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <!-- Kopf -->
    <circle cx="32" cy="14" r="8"/>
    <!-- Körper -->
    <path d="M18 54 Q18 34 32 34 Q46 34 46 54"/>
    <!-- Aktenkoffer -->
    <rect x="38" y="40" width="16" height="12" rx="2"/>
    <path d="M41 40 L41 37 Q41 35 44 35 L49 35 Q52 35 52 37 L52 40"/>
    <line x1="38" y1="46" x2="54" y2="46"/>
  </svg>`,

  // handelsvertreter / Zwischenhändler – LKW
  handelsvertreter: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <!-- Ladefläche -->
    <rect x="2" y="22" width="36" height="24" rx="2"/>
    <!-- Führerhaus -->
    <path d="M38 46 L38 30 Q38 22 46 22 L60 22 L60 46 Z"/>
    <!-- Windschutzscheibe -->
    <path d="M40 30 L40 24 Q40 26 46 26 L58 26 L58 30 Z"/>
    <!-- Räder -->
    <circle cx="14" cy="48" r="5"/>
    <circle cx="32" cy="48" r="5"/>
    <circle cx="52" cy="48" r="5"/>
    <!-- Boden -->
    <line x1="2" y1="46" x2="60" y2="46"/>
  </svg>`,

  // Eigener Laden – Flagship Store
  eigenerLaden: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <!-- Gebäude -->
    <rect x="8" y="24" width="48" height="32" rx="2"/>
    <!-- Giebel -->
    <polyline points="4,24 32,8 60,24"/>
    <!-- Stern / Flagge als Premium-Symbol -->
    <polygon points="32,12 33.5,16.5 38,16.5 34.5,19 36,23.5 32,21 28,23.5 29.5,19 26,16.5 30.5,16.5" fill="#333" stroke="none"/>
    <!-- Tür -->
    <rect x="26" y="40" width="12" height="16"/>
    <!-- Fenster -->
    <rect x="12" y="30" width="10" height="8"/>
    <rect x="42" y="30" width="10" height="8"/>
  </svg>`,
};

// Pfeil zwischen Stationen
function pfeilSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48" fill="none" stroke="#aaa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" y1="24" x2="26" y2="24"/>
    <polyline points="18,16 26,24 18,32"/>
  </svg>`;
}

// ============================================================================
// VERTRIEBSWEG-DEFINITIONEN
// Jeder Eintrag hat:
//   label        – Bezeichnung des Vertriebswegs
//   stufen       – Anzahl der Zwischenstufen (0 = direkt)
//   stationen    – Array der Kettenglieder { iconKey, bezeichnung }
//   formulierungen – Array von Funktionen (u) => Einleitungstext
//   loesung      – Funktion (strat) => Lösungstext
// ============================================================================

const vertriebswege = {

  direkt_online: {
    label: 'Direkter Vertrieb – Online-Shop',
    stufen: 0,
    stationen: [
      { iconKey: 'hersteller',     bezeichnung: 'Hersteller' },
      { iconKey: 'onlineshop',     bezeichnung: 'Eigener Online-Shop' },
      { iconKey: 'endverbraucher', bezeichnung: 'Endverbraucher' },
    ],
    formulierungen: [
      (u) => `${u} möchte sich in diesem Geschäftsjahr mehr um die Vermarktung seiner Produkte kümmern. Mit folgender Grafik verdeutlicht er seinen bisherigen Vertriebsweg:`,
      (u) => `${u} plant, seinen Absatz zu steigern. Im Rahmen der Marketingplanung stellt das Unternehmen seinen aktuellen Vertriebsweg grafisch dar:`,
      (u) => `Im Zuge der Vertriebsanalyse dokumentiert ${u} den Weg seiner Produkte bis zum Kunden in der folgenden Übersicht:`,
    ],
    loesung: () => `Es liegt ein <strong>direkter Vertrieb</strong> vor, da das Unternehmen seine Produkte über einen eigenen Online-Shop unmittelbar an die Endverbraucher verkauft. Es ist kein Zwischenhändler eingeschaltet.`,
  },

  direkt_laden: {
    label: 'Direkter Vertrieb – Eigener Laden',
    stufen: 0,
    stationen: [
      { iconKey: 'hersteller',     bezeichnung: 'Hersteller' },
      { iconKey: 'eigenerLaden',   bezeichnung: 'Eigenes Ladengeschäft' },
      { iconKey: 'endverbraucher', bezeichnung: 'Endverbraucher' },
    ],
    formulierungen: [
      (u) => `${u} möchte sich in diesem Geschäftsjahr mehr um die Vermarktung seiner Produkte kümmern. Mit folgender Grafik verdeutlicht er seinen bisherigen Vertriebsweg:`,
      (u) => `Im Rahmen einer Marketinganalyse legt ${u} dar, wie seine Produkte zum Kunden gelangen:`,
      (u) => `${u} hat seinen Vertrieb kürzlich überprüft. Die folgende Grafik zeigt den aktuellen Absatzweg:`,
    ],
    loesung: () => `Es liegt ein <strong>direkter Vertrieb</strong> vor, da das Unternehmen seine Produkte über ein eigenes Ladengeschäft unmittelbar an die Endverbraucher abgibt. Es ist kein Zwischenhändler eingeschaltet.`,
  },

  direkt_aussendienst: {
    label: 'Direkter Vertrieb – Außendienst',
    stufen: 0,
    stationen: [
      { iconKey: 'hersteller',     bezeichnung: 'Hersteller' },
      { iconKey: 'aussendienst',   bezeichnung: 'Außendienstmitarbeiter' },
      { iconKey: 'endverbraucher', bezeichnung: 'Gewerbekunde' },
    ],
    formulierungen: [
      (u) => `${u} möchte sich in diesem Geschäftsjahr mehr um die Vermarktung seiner Produkte kümmern. Mit folgender Grafik verdeutlicht er seinen bisherigen Vertriebsweg:`,
      (u) => `Zur Vorbereitung auf eine Marketingbesprechung dokumentiert ${u} seinen Vertriebsweg in der folgenden Grafik:`,
      (u) => `${u} überprüft seine Vertriebsstrategie. Die Grafik zeigt, wie das Unternehmen seine Produkte aktuell absetzt:`,
    ],
    loesung: () => `Es liegt ein <strong>direkter Vertrieb</strong> vor, da das Unternehmen seine Produkte durch eigene Außendienstmitarbeiter unmittelbar an die Gewerbekunden verkauft. Es ist kein Zwischenhändler eingeschaltet.`,
  },

   indirekt_handelsvertreter: {
    label: 'Indirekter Vertrieb – Handelsvertreter',
    stufen: 0,
    stationen: [
      { iconKey: 'hersteller',     bezeichnung: 'Hersteller' },
      { iconKey: 'handelsvertreter',   bezeichnung: 'Handelsvertreter' },
      { iconKey: 'endverbraucher', bezeichnung: 'Gewerbekunde' },
    ],
    formulierungen: [
      (u) => `${u} möchte sich in diesem Geschäftsjahr mehr um die Vermarktung seiner Produkte kümmern. Mit folgender Grafik verdeutlicht er seinen bisherigen Vertriebsweg:`,
      (u) => `Zur Vorbereitung auf eine Marketingbesprechung dokumentiert ${u} seinen Vertriebsweg in der folgenden Grafik:`,
      (u) => `${u} überprüft seine Vertriebsstrategie. Die Grafik zeigt, wie das Unternehmen seine Produkte aktuell absetzt:`,
    ],
    loesung: () => `Es liegt ein <strong>indirekter Vertrieb</strong> vor, da das Unternehmen seine Produkte durch einen Handelsvertreter an die Gewerbekunden verkauft.`,
  },

  indirekt_1: {
    label: 'Indirekter Vertrieb',
    stufen: 1,
    stationen: [
      { iconKey: 'hersteller',     bezeichnung: 'Hersteller' },
      { iconKey: 'einzelhaendler', bezeichnung: 'Einzelhändler' },
      { iconKey: 'endverbraucher', bezeichnung: 'Endverbraucher' },
    ],
    formulierungen: [
      (u) => `${u} möchte sich in diesem Geschäftsjahr mehr um die Vermarktung seiner Produkte kümmern. Mit folgender Grafik verdeutlicht er seinen bisherigen Vertriebsweg:`,
      (u) => `Im Rahmen der jährlichen Vertriebsplanung stellt ${u} seinen Absatzweg grafisch dar:`,
      (u) => `${u} analysiert seine Vermarktungsstrategie. Die folgende Grafik zeigt, wie das Unternehmen seine Produkte zum Kunden bringt:`,
    ],
    loesung: () => `Es liegt ein <strong>indirekter Vertrieb</strong> vor, da die Produkte nicht unmittelbar an die Endverbraucher, sondern über den Einzelhandel als Zwischenhändler verkauft werden. Es handelt sich um einen indirekten Vertriebsweg.`,
  },

  indirekt_2: {
    label: 'Indirekter Vertrieb',
    stufen: 2,
    stationen: [
      { iconKey: 'hersteller',     bezeichnung: 'Hersteller' },
      { iconKey: 'grosshaendler',  bezeichnung: 'Großhändler' },
      { iconKey: 'einzelhaendler', bezeichnung: 'Einzelhändler' },
      { iconKey: 'endverbraucher', bezeichnung: 'Endverbraucher' },
    ],
    formulierungen: [
      (u) => `${u} möchte sich in diesem Geschäftsjahr mehr um die Vermarktung seiner Produkte kümmern. Mit folgender Grafik verdeutlicht er seinen bisherigen Vertriebsweg:`,
      (u) => `Im Rahmen der Vertriebsanalyse zeigt ${u} den Weg seiner Produkte bis zum Endkunden:`,
      (u) => `${u} überarbeitet seine Absatzstrategie und dokumentiert hierzu den bestehenden Vertriebsweg:`,
    ],
    loesung: () => `Es liegt ein <strong>indirekter Vertrieb</strong> vor, da die Produkte nicht unmittelbar an die Endverbraucher, sondern über den Groß- und Einzelhandel an die Endverbraucher verkauft werden. Es handelt sich um einen indirekten Vertriebsweg.`,
  },

  indirekt_3: {
    label: 'Indirekter Vertrieb',
    stufen: 3,
    stationen: [
      { iconKey: 'hersteller',     bezeichnung: 'Hersteller' },
      { iconKey: 'handelsvertreter', bezeichnung: 'Handelsvertreter' },
      { iconKey: 'grosshaendler',  bezeichnung: 'Großhändler' },
      { iconKey: 'einzelhaendler', bezeichnung: 'Einzelhändler' },
      { iconKey: 'endverbraucher', bezeichnung: 'Endverbraucher' },
    ],
    formulierungen: [
      (u) => `${u} möchte sich in diesem Geschäftsjahr mehr um die Vermarktung seiner Produkte kümmern. Mit folgender Grafik verdeutlicht er seinen bisherigen Vertriebsweg:`,
      (u) => `Im Rahmen der Exportstrategie stellt ${u} dar, wie seine Produkte international zum Endkunden gelangen:`,
      (u) => `${u} importiert Waren aus dem Ausland und verkauft sie über mehrere Stufen. Die Grafik zeigt den vollständigen Absatzweg:`,
    ],
    loesung: () => `Es liegt ein <strong>indirekter Vertrieb</strong> vor, da die Produkte über drei Zwischenstufen – Handelsvertreter, Großhändler und Einzelhändler – an die Endverbraucher gelangen. Es handelt sich um einen indirekten Vertriebsweg.`,
  },
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
// SVG-DEFINITIONEN
// Jedes Icon ist ein SVG-String. Beim Seitenstart werden diese per Canvas
// in Base64-PNGs gerendert (iconBase64Cache). Word akzeptiert <img src="data:...">
// problemlos – so kommen die Icons zuverlässig ins Dokument.
// Zum Austauschen: SVG-String im ICON_SVGS-Objekt ersetzen.
// ============================================================================

const ICON_SVGS = {

  hersteller: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="6" y="30" width="52" height="26" rx="2" fill="none" stroke="#222" stroke-width="3"/>
    <rect x="11" y="18" width="8" height="14" fill="none" stroke="#222" stroke-width="2.5"/>
    <rect x="27" y="22" width="8" height="10" fill="none" stroke="#222" stroke-width="2.5"/>
    <rect x="9" y="38" width="9" height="8" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="27" y="38" width="9" height="8" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="45" y="38" width="9" height="8" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="26" y="44" width="12" height="12" fill="none" stroke="#222" stroke-width="2"/>
    <path d="M15 14 Q17 10 15 6" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round"/>
    <path d="M31 18 Q33 14 31 10" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  grosshaendler: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="4" y="32" width="56" height="24" rx="2" fill="none" stroke="#222" stroke-width="3"/>
    <polyline points="2,32 32,12 62,32" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
    <rect x="7" y="40" width="14" height="16" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="43" y="40" width="14" height="16" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="27" y="37" width="10" height="9" fill="none" stroke="#222" stroke-width="2"/>
  </svg>`,

  einzelhaendler: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="6" y="28" width="52" height="28" rx="2" fill="none" stroke="#222" stroke-width="3"/>
    <rect x="10" y="34" width="18" height="12" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="36" y="34" width="18" height="12" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="26" y="42" width="12" height="14" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="4" y="23" width="56" height="7" rx="1" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="16" y="14" width="32" height="9" rx="2" fill="none" stroke="#222" stroke-width="2"/>
  </svg>`,

  endverbraucher: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="15" r="7" fill="none" stroke="#222" stroke-width="2.5"/>
    <path d="M20 52 Q20 36 32 36 Q44 36 44 52" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="13" cy="19" r="5.5" fill="none" stroke="#222" stroke-width="2"/>
    <path d="M4 52 Q4 39 13 39 Q19 39 21 43" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round"/>
    <circle cx="51" cy="19" r="5.5" fill="none" stroke="#222" stroke-width="2"/>
    <path d="M60 52 Q60 39 51 39 Q45 39 43 43" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  onlineshop: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="6" y="8" width="52" height="32" rx="3" fill="none" stroke="#222" stroke-width="3"/>
    <line x1="26" y1="40" x2="22" y2="52" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="38" y1="40" x2="42" y2="52" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="17" y1="52" x2="47" y2="52" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
    <polyline points="15,16 19,16 25,32 43,32 47,20 21,20" fill="none" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="27" cy="36" r="2" fill="#222"/>
    <circle cx="41" cy="36" r="2" fill="#222"/>
  </svg>`,

  aussendienst: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="28" cy="13" r="7" fill="none" stroke="#222" stroke-width="2.5"/>
    <path d="M16 52 Q16 33 28 33 Q40 33 40 52" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="40" y="38" width="16" height="13" rx="2" fill="none" stroke="#222" stroke-width="2"/>
    <path d="M43 38 L43 35 Q43 33 46 33 L51 33 Q54 33 54 35 L54 38" fill="none" stroke="#222" stroke-width="2"/>
    <line x1="40" y1="44" x2="56" y2="44" stroke="#222" stroke-width="1.5"/>
  </svg>`,

  handelsvertreter: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="2" y="24" width="36" height="22" rx="2" fill="none" stroke="#222" stroke-width="2.5"/>
    <path d="M38 46 L38 30 Q38 24 46 24 L60 24 L60 46 Z" fill="none" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M40 30 L58 30" fill="none" stroke="#222" stroke-width="2"/>
    <circle cx="14" cy="49" r="5" fill="none" stroke="#222" stroke-width="2.5"/>
    <circle cx="32" cy="49" r="5" fill="none" stroke="#222" stroke-width="2.5"/>
    <circle cx="52" cy="49" r="5" fill="none" stroke="#222" stroke-width="2.5"/>
    <line x1="2" y1="46" x2="60" y2="46" stroke="#222" stroke-width="2"/>
  </svg>`,

  eigenerLaden: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="8" y="26" width="48" height="30" rx="2" fill="none" stroke="#222" stroke-width="3"/>
    <polyline points="4,26 32,8 60,26" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
    <rect x="26" y="40" width="12" height="16" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="11" y="32" width="11" height="9" fill="none" stroke="#222" stroke-width="2"/>
    <rect x="42" y="32" width="11" height="9" fill="none" stroke="#222" stroke-width="2"/>
    <polygon points="32,12 33.2,15.8 37.2,15.8 34,18.2 35.2,22 32,19.6 28.8,22 30,18.2 26.8,15.8 30.8,15.8" fill="#222"/>
  </svg>`,
};

// Cache für fertig gerenderte Base64-PNGs
const iconBase64Cache = {};

// Wandelt alle SVGs einmalig beim Seitenstart in Base64-PNGs um
function renderIconsToBase64() {
  return new Promise((resolve) => {
    const keys = Object.keys(ICON_SVGS);
    let done = 0;

    keys.forEach((key) => {
      const svgStr = ICON_SVGS[key];
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 64, 64);
        iconBase64Cache[key] = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        done++;
        if (done === keys.length) resolve();
      };

      img.onerror = () => {
        // Fallback: kein Icon
        iconBase64Cache[key] = '';
        done++;
        if (done === keys.length) resolve();
      };

      img.src = url;
    });
  });
}

// ============================================================================
// GRAFIK-KETTE BAUEN
// Jede Station: Base64-PNG-Icon über der Bezeichnung, in einer Tabellenzelle.
// Pfeil als HTML-Entity. Word akzeptiert <img src="data:image/png;base64,...">
// ============================================================================

function erstelleKettenGrafik(stationen) {
  let html = `<table style="border-collapse:collapse; margin:12px 0;"><tr>`;

  stationen.forEach((station, idx) => {
    const b64 = iconBase64Cache[station.iconKey] || '';
    const iconTag = b64
      ? `<img src="${b64}" width="48" height="48" style="display:block; margin:0 auto 4px;" alt="${station.bezeichnung}">`
      : '';

    html += `<td style="border:1px solid #bbb; padding:8px 14px; text-align:center; vertical-align:bottom; font-weight:bold; font-size:0.82rem; background:#fff; min-width:70px;">`;
    html += iconTag;
    html += station.bezeichnung;
    html += `</td>`;

    if (idx < stationen.length - 1) {
      html += `<td style="border:none; padding:0 6px; text-align:center; vertical-align:middle; font-size:1.2rem; color:#666; font-weight:bold;">&rarr;</td>`;
    }
  });

  html += `</tr></table>`;
  return html;
}

// ============================================================================
// HAUPTFUNKTION – VERTRIEBSWEGE ANZEIGEN
// ============================================================================

function zeigeZufaelligeVertriebswege() {
  const anzahlSelect = document.getElementById('vertriebAnzahl');
  const anzahl = parseInt(anzahlSelect?.value || '4');
  const container = document.getElementById('Container');

  if (!container) {
    console.error("Container nicht gefunden");
    return;
  }

  container.innerHTML = '';

  const kundeSelect = document.getElementById('vertriebKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  const anzeigeName = kundeValue || '[Modellunternehmen]';

  // Vertriebsweg-Keys in zufälliger Reihenfolge, bei Bedarf wiederholen
  const alleKeys = Object.keys(vertriebswege);
  let aufgabenListe = [];
  while (aufgabenListe.length < anzahl) {
    aufgabenListe = [...aufgabenListe, ...shuffle(alleKeys)];
  }
  aufgabenListe = aufgabenListe.slice(0, anzahl);

  let aufgabenHTML = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2>Lösung</h2>';

  aufgabenListe.forEach((key, idx) => {
    const strat = vertriebswege[key];
    const ausgabe = pick(unternehmensVarianten)(anzeigeName);
    const einleitung = pick(strat.formulierungen)(ausgabe);

    // Aufgabentext
    aufgabenHTML += `<li style="margin-bottom: 2em;">`;
    aufgabenHTML += `<p>${einleitung}</p>`;
    aufgabenHTML += erstelleKettenGrafik(strat.stationen);
    aufgabenHTML += `<p style="margin-top:8px; font-style:italic; color:#555;">Leite aus der Grafik die Art des Vertriebswegs ab.</p>`;
    aufgabenHTML += `</li>`;

    // Lösung
    loesungenHTML += `<div style="border: 1px solid #ccc; background-color:#fff; font-family:courier; padding: 4px 8px; margin: 0 0 12px;">`;
    loesungenHTML += `<strong>${idx + 1}. ${strat.label}</strong><br>`;
    loesungenHTML += `<span style="font-family: sans-serif; font-size:0.9rem;">${strat.loesung()}</span>`;
    loesungenHTML += `</div>`;
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Vertriebswege-Assistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von direktem und indirektem Vertrieb.

Aufgabe:
- Gib KEINE fertigen Lösungen (Bezeichnung des Vertriebswegs) vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Bestimmung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach der Anzahl der Stationen zwischen Hersteller und Endverbraucher.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige die vollständige Bezeichnung.

Methodik bei Rückfragen:
- Wie viele Stationen liegen zwischen Hersteller und Endverbraucher?
- Gibt es einen oder mehrere Zwischenhändler?
- Wer sind die Zwischenhändler – Groß- oder Einzelhändler?
- Verkauft der Hersteller direkt oder indirekt?

Die Vertriebswege:

1. Direkter Vertrieb
   - Kein Zwischenhändler zwischen Hersteller und Endverbraucher
   - Beispiele: Online-Shop, eigenes Ladengeschäft, Außendienst
   - Vorteil: volle Kontrolle, höhere Marge
   - Nachteil: hoher eigener Aufwand, begrenzte Reichweite

2. Indirekter Vertrieb
   - Ein Zwischenhändler (meist Einzelhändler)
   - Hersteller → Einzelhändler → Endverbraucher
   - Vorteil: breitere Marktabdeckung
   - Nachteil: geringere Marge, weniger Kontrolle

3. Indirekter Vertrieb
   - Zwei Zwischenhändler: Groß- und Einzelhändler
   - Hersteller → Großhändler → Einzelhändler → Endverbraucher
   - Vorteil: sehr breite Marktabdeckung, geringer eigener Logistikaufwand
   - Nachteil: niedrigste Marge, kaum Kontrolle über Endpreis

3. Indirekter Vertrieb
   - Drei Zwischenhändler: z.B. Handelsvertreter, Groß- und Einzelhändler
   - Hersteller → Handelsvertreter → Großhändler → Einzelhändler → Endverbraucher

Typische Abgrenzungsfehler der Schüler:
- Direkter Vertrieb ≠ kurzer Weg (ein Online-Shop ist direkt, auch wenn das Paket weit reist)
- Stufenzahl = Anzahl der Zwischenhändler, nicht die Gesamtzahl der Stationen
- Außendienst = direkter Vertrieb, da eigene Mitarbeiter des Herstellers

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🚚🏪✅❓

Was du NICHT tust:
- Nenne den Vertriebsweg nicht, bevor der Schüler ihn selbst erarbeitet hat
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
  const kundeSelect = document.getElementById('vertriebKunde');

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

document.addEventListener('DOMContentLoaded', function () {
  // Icons zuerst als Base64-PNGs rendern, dann Aufgaben erstellen
  renderIconsToBase64().then(function () {
    setTimeout(function () {
      autoSelectMyCompany();
      zeigeZufaelligeVertriebswege();
    }, 300);
  });
});