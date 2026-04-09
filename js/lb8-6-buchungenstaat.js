// ============================================================================
// STAAT & STEUERN - GESCHÄFTSFÄLLE MIT KONTO-AUSWAHL
// ============================================================================
// Globale Variablen
let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';
let letzteGenerierteGeschaeftsfaelle = [];

// Konten-Definitionen
const kontenDefinitionen = {
  '7020 GRST': {
    beschreibung: 'Grundsteuer',
  },
  '7000 GWST': {
    beschreibung: 'Gewerbesteuer',
  },
  '7030 KFZST': {
    beschreibung: 'KFZ-Steuer',
  },
  '6730 GEB': {
    beschreibung: 'Gebühren',
  }
};

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
    console.log(`${userCompanies.length} Benutzerunternehmen hinzugefügt. Gesamt: ${yamlData.length} Unternehmen`);
  }
}

function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      console.log(`yamlData aus localStorage geladen (${yamlData.length} Unternehmen)`);
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
      console.log(`Standard yamlData geladen (${yamlData.length} Unternehmen)`);
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => {
      console.error("Konnte unternehmen.yml nicht laden:", err);
    });
}

// ============================================================================
// KONTO-AUSWAHL FUNKTIONEN
// ============================================================================
function initializeKontoAuswahl() {
  const kontoGrid = document.getElementById('kontoGrid');
  if (!kontoGrid) return;

  kontoGrid.innerHTML = '';

  Object.entries(kontenDefinitionen).forEach(([kontoNr, info]) => {
    const item = document.createElement('div');
    item.className = 'konto-checkbox-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `konto-${kontoNr.replace(/\s/g, '-')}`;
    checkbox.value = kontoNr;
    checkbox.checked = true;
    checkbox.onchange = updateAuswahlInfo;

    const label = document.createElement('label');
    label.className = 'konto-label';
    label.htmlFor = checkbox.id;

    const nummer = document.createElement('div');
    nummer.className = 'konto-nummer';
    nummer.textContent = kontoNr;

    const beschreibung = document.createElement('div');
    beschreibung.className = 'konto-beschreibung';
    beschreibung.textContent = info.beschreibung;

    label.appendChild(nummer);
    label.appendChild(beschreibung);

    item.appendChild(checkbox);
    item.appendChild(label);

    kontoGrid.appendChild(item);
  });

  updateAuswahlInfo();
}

function updateAuswahlInfo() {
  const auswahlInfo = document.getElementById('auswahlInfo');
  const checkboxes = document.querySelectorAll('#kontoGrid input[type="checkbox"]');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

  if (checkedCount === 0) {
    auswahlInfo.textContent = '⚠️ Keine Konten ausgewählt - es werden alle verwendet';
    auswahlInfo.style.background = '#fff3cd';
    auswahlInfo.style.color = '#856404';
  } else if (checkedCount === checkboxes.length) {
    auswahlInfo.textContent = '✓ Alle Konten ausgewählt';
    auswahlInfo.style.background = '#d4edda';
    auswahlInfo.style.color = '#155724';
  } else {
    auswahlInfo.textContent = `✓ ${checkedCount} von ${checkboxes.length} Konten ausgewählt`;
    auswahlInfo.style.background = '#d1ecf1';
    auswahlInfo.style.color = '#0c5460';
  }
}

function alleKontenAuswaehlen() {
  document.querySelectorAll('#kontoGrid input[type="checkbox"]').forEach(cb => cb.checked = true);
  updateAuswahlInfo();
}

function alleKontenAbwaehlen() {
  document.querySelectorAll('#kontoGrid input[type="checkbox"]').forEach(cb => cb.checked = false);
  updateAuswahlInfo();
}

function getAusgewaehlteKonten() {
  const checkboxes = document.querySelectorAll('#kontoGrid input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// ============================================================================
// GESCHÄFTSFALL-DEFINITIONEN
// ============================================================================
const geschaeftsfallTypen = {

  // --------------------------------------------------------------------------
  // 7020 GRST – Grundsteuer
  // --------------------------------------------------------------------------
  grundsteuer: {
    name: 'Grundsteuer',
    konto: '7020 GRST',
    behoerden: ['Stadtsteueramt', 'Stadtkasse', 'Gemeindekasse'],
    belegtyp: 'bescheid',
    bescheidArt: 'bescheid1.svg',  // → URL-Parameter art=bescheid1.svg
    zahlungsarten: [
      { text: ' geht ein ', konto: '4400 VE' },
      { text: ' liegt vor ', konto: '4400 VE' },
    ],
    mitVorsteuer: false,
    geschaeftsfaelle: [
      { beschreibung: 'Der Bescheid für die Grundsteuer für das Betriebsgrundstück ' },
      { beschreibung: 'Die Grundsteuerbescheid für das Betriebsgelände ' },
    ],
    betragsbereich: { min: 200, max: 1500 }
  },

  // --------------------------------------------------------------------------
  // 7000 GWST – Gewerbesteuer
  // --------------------------------------------------------------------------
  gewerbesteuer: {
    name: 'Gewerbesteuer',
    konto: '7000 GWST',
    behoerden: ['Stadtsteueramt', 'Gewerbesteueramt', 'Stadtkasse', 'Gemeindekasse'],
    belegtyp: 'bescheid',
    bescheidArt: null,        // → URL-Parameter art=Gewerbesteuer
    zahlungsarten: [
      { text: ' geht ein ', konto: '4400 VE' },
      { text: ' liegt vor ', konto: '4400 VE' },

    ],
    mitVorsteuer: false,
    geschaeftsfaelle: [
      { beschreibung: ' Der Gewerbesteuerbescheid ' },
      { beschreibung: ' Der Bescheid für die Gewerbesteuervorauszahlung ' },
      { beschreibung: ' Der jährliche Gewerbesteuerbescheid ' }
    ],
    betragsbereich: { min: 5000, max: 50000 }
  },

  // --------------------------------------------------------------------------
  // 7030 KFZST – KFZ-Steuer
  // --------------------------------------------------------------------------
  kfzsteuer: {
    name: 'KFZ-Steuer',
    konto: '7030 KFZST',
    behoerden: ['Hauptzollamt', 'Zollamt', 'Kraftfahrzeugsteuerstelle'],
    belegtyp: 'bescheid',
    bescheidArt: null,
    zahlungsarten: [
      { text: ' geht ein ', konto: '4400 VE' },
      { text: ' liegt vor ', konto: '4400 VE' },
    ],
    mitVorsteuer: false,
    geschaeftsfaelle: [
      { beschreibung: ' Der KFZ-Steuerbescheid für den Firmenwagen ' },
      { beschreibung: ' Der KFZ-Steuerbescheid für das Betriebsfahrzeug ' },
      { beschreibung: ' Ein KFZ-Steuerbescheid für einen Lieferwagen ' },
    ],
    betragsbereich: { min: 80, max: 600 }
  },

  // --------------------------------------------------------------------------
  // 6730 GEB – Gebühren (Abfall, IHK, Gewerbeamt …)
  // --------------------------------------------------------------------------
  gebuehren_abfall: {
    name: 'Abfallgebühren',
    konto: '6730 GEB',
    behoerden: ['Stadtentsorgung', 'AWM', 'Abfallwirtschaftsbetrieb', 'Kreisbauhof'],
    belegtyp: 'bescheid',
    bescheidArt: 'bescheid2.svg',    // → URL-Parameter art=Abfallentsorgung
    bescheidBezeichnung: 'Abfallentsorgungsgebühren',
    zahlungsarten: [
      { text: ' liegt vor ', konto: '4400 VE' },
      { text: ' geht ein ', konto: '4400 VE' },
    ],
    mitVorsteuer: false,
    geschaeftsfaelle: [
      { beschreibung: ' Der Abfallgebührenbescheid für das Betriebsgelände ' },
      { beschreibung: ' Ein Bescheid für Abfallgebühren ' },
      { beschreibung: ' Der Bescheid zu den Müllabfuhrgebühren' },
    ],
    betragsbereich: { min: 150, max: 800 }
  },


  gebuehren_abwasser: {
    name: 'Abwassergebühren',
    konto: '6730 GEB',
    behoerden: ['Stadtentwässerung', 'Abwasserzweckverband', 'Kommunalbetriebe', 'Klärwerk'],
    belegtyp: 'bescheid',
    bescheidArt: 'bescheid3.svg',        // → URL-Parameter art=Abwasser
    bescheidBezeichnung: 'Abwassergebühren',
    zahlungsarten: [
      { text: ' liegt vor ', konto: '4400 VE' },
      { text: ' geht ein ', konto: '4400 VE' },
    ],
    mitVorsteuer: false,
    geschaeftsfaelle: [
      { beschreibung: ' Ein Abwassergebührenbescheid für das Betriebsgelände ' },
      { beschreibung: ' Der Bescheid für die Abwassergebühren ' },
      { beschreibung: ' Der Bescheid der Kanal- und Abwassergebühren ' },
    ],
    betragsbereich: { min: 100, max: 600 }
  },

  gebuehren_sonstige: {
    name: 'Sonstige Gebühren (Gewerbeamt, Genehmigungen)',
    konto: '6730 GEB',
    behoerden: ['Gewerbeamt', 'Landratsamt', 'Bauordnungsamt', 'Gemeindeverwaltung'],
    belegtyp: 'bescheid',
    bescheidArt: null,              // kein passender Bescheid
    zahlungsarten: [
      { text: ' liegt vor ', konto: '4400 VE' },
      { text: ' geht ein ', konto: '4400 VE' },
    ],
    mitVorsteuer: false,
    geschaeftsfaelle: [
      { beschreibung: ' Ein Gebührenbescheid für eine Baugenehmigung ' },
      { beschreibung: ' Ein Bescheid für Verwaltungsgebühren für eine behördliche Genehmigung ' },
    ],
    betragsbereich: { min: 50, max: 500 }
  }
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================
function formatCurrency(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}

function generateRandomBetrag(min = 100, max = 1000) {
  const steps = Math.floor((max - min) / 5);
  return min + (Math.floor(Math.random() * steps) * 5);
}

function parseNumericValue(value) {
  if (!value) return '0';
  return value.toString().replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
}

const wertFormulierungen = [
  ' in Höhe von ',
  ' mit einem Betrag von ',
  ' über '
];

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================
function erstelleZufallsGeschaeftsfall() {
  // Hole ausgewählte Konten
  const ausgewaehlteKonten = getAusgewaehlteKonten();

  // Filtere Typen nach ausgewählten Konten
  let verfuegbareTypen = Object.keys(geschaeftsfallTypen);
  if (ausgewaehlteKonten.length > 0) {
    verfuegbareTypen = verfuegbareTypen.filter(typKey =>
      ausgewaehlteKonten.includes(geschaeftsfallTypen[typKey].konto)
    );
  }
  if (verfuegbareTypen.length === 0) {
    verfuegbareTypen = Object.keys(geschaeftsfallTypen);
  }

  const zufallsTyp = verfuegbareTypen[Math.floor(Math.random() * verfuegbareTypen.length)];
  const typ = geschaeftsfallTypen[zufallsTyp];

  const behoerde = typ.behoerden[Math.floor(Math.random() * typ.behoerden.length)];
  const zahlungsart = typ.zahlungsarten[Math.floor(Math.random() * typ.zahlungsarten.length)];
  const geschaeftsfall = typ.geschaeftsfaelle[Math.floor(Math.random() * typ.geschaeftsfaelle.length)];

  // Für Grundsteuer: Messbetrag + Hebesatz berechnen und als sauberen Betrag zurückgeben
  // Typische Hebesätze Bayern: 300, 350, 400, 450, 500, 550, 600
  const grundsteuerHebesaetze = [300, 350, 400, 450, 500, 550, 600];
  let extraDaten = {};

  if (zufallsTyp === 'grundsteuer') {
    const hebesatz = grundsteuerHebesaetze[Math.floor(Math.random() * grundsteuerHebesaetze.length)];
    // Messbetrag in realistischem Bereich, gerundet auf glatte Werte
    const messbetraege = [50, 80, 100, 120, 150, 180, 200, 250, 400, 500, 750, 800, 1000];
    const messbetrag = messbetraege[Math.floor(Math.random() * messbetraege.length)];
    // Jahressteuerbetrag berechnen → für Bescheid (wird dort in 4 Raten aufgeschlüsselt)
    const jahresbetrag = Math.round(messbetrag * hebesatz) / 100;
    // Quartalsbetrag → für den Buchungssatz (nächste fällige Rate)
    const quartalsbetrag = Math.round((jahresbetrag) * 100) / 100;
    extraDaten = { messbetrag, hebesatz, jahresbetrag, berechneterBetrag: quartalsbetrag };
  }

  const { min, max } = typ.betragsbereich;
  const betrag = (zufallsTyp === 'grundsteuer' && extraDaten.berechneterBetrag)
    ? extraDaten.berechneterBetrag
    : generateRandomBetrag(min, max);

  const betragFormatted = formatCurrency(betrag);

  const varianten = [
    `bei ${kunde}`,
    `im Unternehmen ${kunde}`,
    `der Firma ${kunde}`
  ];
  const ausgabe = varianten[Math.floor(Math.random() * varianten.length)];

  const wertPhrase = wertFormulierungen[Math.floor(Math.random() * wertFormulierungen.length)];

  const zText = zahlungsart.text.trim();
  let verbindung = '';
  if (zText && !zText.startsWith(',') && !zText.startsWith('.')) {
    verbindung = ' ';
  }

  const geschaeftsfallText =
    `${geschaeftsfall.beschreibung}${ausgabe}${verbindung}${zText}${wertPhrase}${betragFormatted}.`;

  return {
    text: geschaeftsfallText,
    typ: zufallsTyp,
    typDaten: typ,
    behoerde: behoerde,
    zahlungsart: zahlungsart,
    betrag: betrag,
    betragFormatted: betragFormatted,
    extraDaten: extraDaten
  };
}

// ============================================================================
// BUCHUNGSSATZ ERSTELLEN
// ============================================================================
function erstelleBuchungssatz(geschaeftsfall) {
  const typ = geschaeftsfall.typDaten;

  // Steuern/Gebühren: immer ohne Vorsteuer, einfacher Buchungssatz
  const buchungssatzHTML = `
    <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
      <tbody>
        <tr>
          <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${typ.konto}</td>
          <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
          <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
          <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.zahlungsart.konto}</td>
          <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.betragFormatted}</td>
        </tr>
      </tbody>
    </table><br>`;

  return buchungssatzHTML;
}

function erstellePlainBuchungssatz(geschaeftsfall) {
  const typ = geschaeftsfall.typDaten;

  // Steuern/Gebühren: immer ohne Vorsteuer, einfacher Buchungssatz
  const buchungssatzPlain = `${typ.konto} an ${geschaeftsfall.zahlungsart.konto} ${geschaeftsfall.betragFormatted}`;

  return buchungssatzPlain;
}

// ============================================================================
// BELEG-URL ERSTELLEN
// URL-Parameter-Schema (bescheid):
//   beleg=bescheid
//   art=Gewerbesteuer | Abwasser | Abfallentsorgung   ← steuert svgDropdownBescheid
//   messbetrag, hebesatz       → Gewerbesteuer
//   abfallgebuehr              → Gebühren (Abwasser / Abfallentsorgung)
//   abfallbezeichnung          → Gebühren (Bezeichnungszeile im Bescheid)
//   tag, monat, jahr
//   unternehmen                → datenBescheid-Dropdown
// ============================================================================
function erstelleBelegURL(geschaeftsfall) {
  const typ = geschaeftsfall.typDaten;

  // Kein Bescheid-Art definiert → kein Button
  if (!typ.bescheidArt) return null;

  const params = new URLSearchParams();
  params.set('beleg', 'bescheid');
  params.set('art', typ.bescheidArt);

  // Datum
  const now = new Date();
  params.set('tag', now.getDate().toString().padStart(2, '0'));
  params.set('monat', (now.getMonth() + 1).toString().padStart(2, '0'));
  params.set('jahr', now.getFullYear().toString());

  // Unternehmen
  const kundeSelect = document.getElementById('staatKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  if (kundeValue) params.set('unternehmen', kundeValue);

  // Art-spezifische Parameter
  if (typ.bescheidArt === 'bescheid1.svg') {
    const extra = geschaeftsfall.extraDaten || {};
    params.set('messbetrag', (extra.messbetrag || '').toString());
    params.set('hebesatz', (extra.hebesatz || '').toString());
  }

  if (typ.bescheidArt === 'Gewerbesteuer') {
    // Steuermessbetrag rückrechnen: typischer Hebesatz 400 %
    const hebesatz = 400;
    const messbetrag = Math.round(geschaeftsfall.betrag / (hebesatz / 100));
    params.set('messbetrag', messbetrag.toString());
    params.set('hebesatz', hebesatz.toString());
  }

  if (typ.bescheidArt === 'Abwasser' || typ.bescheidArt === 'Abfallentsorgung') {
    params.set('abfallgebuehr', parseNumericValue(geschaeftsfall.betragFormatted));
    // abfallbezeichnung aus dem Typ übernehmen
    params.set('abfallbezeichnung', typ.bescheidBezeichnung || typ.bescheidArt);
  }

  return `belege.html?${params.toString()}`;
}

// ============================================================================
// BELEG-BUTTON ERSTELLEN
// ============================================================================
function erstelleBelegButton(nummer, geschaeftsfall) {
  const url = erstelleBelegURL(geschaeftsfall);

  // Kein Bescheid → leeren Platzhalter zurückgeben (damit Nummerierung stimmt)
  if (!url) {
    return `
      <div
        style="width:100%; padding:10px 12px; font-size:13px; margin-bottom:8px;
               color:#999; border:1px dashed #ccc; border-radius:4px; text-align:center;"
        title="Für diesen Geschäftsfalltyp ist kein Bescheid verfügbar"
      >
        ${nummer}. Noch kein Bescheid verfügbar
      </div>`;
  }

  const belegTypName = 'Bescheid';

  // URL sicher als data-Attribut speichern, onclick liest daraus
  return `
    <button
      class="geschaeftsfall-beleg-button"
      data-url="${url.replace(/"/g, '&quot;')}"
      onclick="window.open(this.dataset.url, '_blank')"
      title="${belegTypName} für Aufgabe ${nummer} erstellen"
      style="width:100%; padding:10px 12px; font-size:14px; margin-bottom:8px;"
    >
      📄 ${nummer}. ${belegTypName} erstellen
    </button>`;
}

// ============================================================================
// HAUPTFUNKTION – GESCHÄFTSFÄLLE ANZEIGEN
// ============================================================================
function zeigeZufaelligeGeschaeftsfaelle() {
  const anzahl = parseInt(document.getElementById('anzahlDropdown').value);
  const container = document.getElementById('Container');
  const buttonColumn = document.getElementById('button-column');

  if (!container || !buttonColumn) {
    console.error("Container oder Button-Column nicht gefunden");
    return;
  }

  container.innerHTML = '';
  buttonColumn.innerHTML = '';

  const testGf = erstelleZufallsGeschaeftsfall();
  if (!testGf) {
    container.innerHTML = `
      <div style="padding: 14px 16px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; color: #856404; margin-top: 16px;">
        ⚠️ <strong>Keine passenden Geschäftsfälle verfügbar.</strong><br>
        Die gewählte Kombination aus Optionen und Konten ergibt keine gültigen Aufgaben.
        Bitte wählen Sie weitere Konten aus oder aktivieren Sie mehr Optionen.
      </div>`;
    return;
  }

  let aufgabenHTML = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2>Lösung</h2>';

letzteGenerierteGeschaeftsfaelle = [testGf];
for (let i = 1; i < anzahl; i++) {
  const gf = erstelleZufallsGeschaeftsfall();
  if (gf) letzteGenerierteGeschaeftsfaelle.push(gf);
}
const geschaeftsfaelle = letzteGenerierteGeschaeftsfaelle;

  geschaeftsfaelle.forEach((gf, idx) => {
    const i = idx + 1;
    aufgabenHTML  += `<li>${gf.text}</li>`;
    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${i}.</strong><br>${erstelleBuchungssatz(gf)}</div>`;

    const buttonHTML = erstelleBelegButton(i, gf);
    const div = document.createElement('div');
    div.style.margin = '12px 0';
    div.innerHTML = buttonHTML;
    buttonColumn.appendChild(div);
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
    const vorschau = document.getElementById("kiPromptVorschau");
if (vorschau && vorschau.style.display !== "none") {
  vorschau.textContent = erstelleKiPromptText();
}
}

// ============================================================================
// DROPDOWN BEFÜLLEN
// ============================================================================
function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) {
    console.warn("yamlData ist leer → keine Unternehmen zum Befüllen");
    return;
  }

  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });

  const kundeSelect = document.getElementById('staatKunde');
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

  console.log(`Dropdown befüllt mit ${sortedCompanies.length} Unternehmen`);
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================
const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis von Buchungssätzen im Bereich Staat & Steuern.

Aufgabe:
- Gib KEINE fertigen Buchungssätze, Beträge oder Konten vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach dem konkreten Geschäftsfall oder Bescheid und dessen Inhalt.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Buchungssatz.

Methodik bei Rückfragen:
- Um welche Art von Steuer oder Gebühr handelt es sich?
- An wen wird gezahlt – eine Behörde, das Finanzamt, die Gemeinde?
- Wie wurde gezahlt – per Überweisung (Bank) oder bar (Kasse)?
- Gibt es Vorsteuer? (Hinweis: Bei Steuern und Gebühren an Behörden gibt es KEINE Vorsteuer!)
- Welche Konten sind betroffen?
- Welche Seite (Soll/Haben) wird beim Aufwandskonto gebucht?


A. Begrüße den Schüler freundlich mit "Hallo" und gib ihm einen Geschäftfall vor, den du zufällig aus der folgenden Aufgabenliste auswählst:
Arbeitsauftrag: "Bilde den Buchungssatz zum Geschäftsfall."

###AUFGABEN und LÖSUNGEN###

B. Sobald der Schüler einen Geschäftsfall geschickt hat, stelle die Fragen nacheinander (nicht in einer Antwort). Schreibe nie die Lösung in deine Antwort, wenn der Schüler falsch antwortet. Bevor du die nächste Frage stellst, sollte die aktuelle Frage richtig beantwortet sein.
   - Frage: „Welche Konten werden benötigt?" Prüfe, ob die Schülerlösung stimmt. Schaue dazu für dich in der Musterlösung nach welche Konten gebucht werden! Sage dann, ob der Schüler falsch liegt oder ob es richtig ist.
   - Frage weiter "Bilde nun den vollständigen Buchungssatz"

Kontenplan – Staat & Steuern:
Aufwandskonten (immer im SOLL):
- 7020 GRST – Grundsteuer (Steuer auf betrieblich genutzten Grundbesitz)
- 7000 GWST – Gewerbesteuer (Steuer auf den Gewerbeertrag)
- 7030 KFZST – KFZ-Steuer (Steuer für betriebliche Kraftfahrzeuge)
- 6730 GEB – Gebühren (Abfall, Abwasser, Verwaltungsgebühren, Genehmigungen)

BUhcung Bescheid (immer im HABEN):
- 4400 VE – Verbindlichkeiten

Buchungslogik:
- Aufwandskonto immer im Soll
- Verbindlichkeiten immer im Haben
- KEINE Vorsteuer bei Steuern und Gebühren an Behörden!

Buchungssatz-Schema (immer einfach):
Aufwandskonto (Soll) | Betrag | an | Verbindlichkeiten (Haben) | Betrag

Beispiel Gewerbesteuer:
7000 GWST | 1.200,00 € | an | 4400 VE | 1.200,00 €

Häufige Schülerfehler – darauf hinweisen, nicht vorwegnehmen:
- Vorsteuer gebucht, obwohl keine USt bei Behörden
- Falsches Steuerkonto (z. B. GRST statt GWST)
- Soll und Haben verwechselt
- KFZ-Steuer mit Furhpark oder Betriebsstoffen verwechselt
- Gebühren (6730 GEB) mit sonstigen Aufwendungen verwechselt

Besondere Hinweise für den Unterricht:
- Steuern sind Aufwendungen → mindern den Gewinn
- Gewerbesteuer: berechnet aus Gewerbeertrag × Steuermesszahl × Hebesatz
- KFZ-Steuer: Jahressteuer für jedes betriebliche Fahrzeug
- Grundsteuer: Jahressteuer auf betrieblich genutzten Grundbesitz
- Gebühren (6730 GEB): Gegenleistung der Verwaltung für konkrete Leistungen

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🏛️✅❓💡

Was du NICHT tust:
- Nenne den fertigen Buchungssatz nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist

Nenne den fertigen Buchungssatz erst, wenn der Schüler selbst darauf gekommen ist. Verbessere am Schluss dann auch Formfehler, zum Beispiel Großschreibung der Konten (VE statt Ve) und weise darauf hin die DIN 5008 zu beachten: Tausenderpunkt bei den Beträgen mit zwei Nachkommastellen und €-Zeichen: z. B. 12.000,00 €
Gib ganz am Ende jeder erfolgreichen Aufgabe den die Musterlösung in der HTMl-Version aus.
Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch einen anderen Geschäftsfall üben? Dann geb ich dir einfach den nächsten!" Dann wähle wieder einen zufälligen aus, der noch nicht dran war.
Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Buchung selbst findet und versteht.
`;

function erstelleKiPromptText() {
  let inhalt = '';
  if (letzteGenerierteGeschaeftsfaelle.length === 0) {
    inhalt = '(Noch keine Aufgaben generiert. Bitte zuerst Geschäftsfälle erstellen.)';
  } else {
    inhalt = letzteGenerierteGeschaeftsfaelle.map((geschaeftsfall, idx) => {
      const nr = idx + 1;
      const bs = erstelleBuchungssatz(geschaeftsfall); // HTML
      const bsPlain = erstellePlainBuchungssatz(geschaeftsfall); // Klartext, kein HTML
      return `--- Aufgabe ${nr} ---\n${geschaeftsfall.text}\nMusterlösung Aufgabe ${nr}: ${bsPlain}\nMusterlösung Aufgabe ${nr} als HTML:\n${bs}`;
    }).join('\n\n');
  }
  return KI_ASSISTENT_PROMPT.replace('###AUFGABEN und LÖSUNGEN###', inhalt);
}

function kopiereKiPrompt() {
    const promptText = erstelleKiPromptText();
  navigator.clipboard.writeText(promptText).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('ki-prompt-btn--success'); }, 2500);
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
    vorschau.textContent = erstelleKiPromptText(); // dynamisch
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
  initializeKontoAuswahl();

  const kundeSelect = document.getElementById('staatKunde');

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  kundeSelect.addEventListener('change', () => {
    kunde = kundeSelect.value.trim() || '';
    console.log('Kunde geändert:', kunde);
  });

  if (!loadYamlFromLocalStorage()) {
    loadDefaultYaml();
  }

  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
  }

  // Prompt-Text in Vorschau einfügen
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
});

// Auto-Select: Mein Unternehmen aus localStorage
function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  if (!myCompanyName) return;

  const dropdowns = document.querySelectorAll('select.meinUnternehmen');
  dropdowns.forEach(dropdown => {
    const matchingOption = Array.from(dropdown.options).find(opt => opt.value === myCompanyName);
    if (matchingOption) {
      dropdown.value = myCompanyName;
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(autoSelectMyCompany, 100);
});