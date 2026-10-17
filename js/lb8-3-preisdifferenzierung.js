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

  const kundeSelect = document.getElementById('diffKunde');
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
// PREISDIFFERENZIERUNG-DEFINITIONEN
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

function getPreisBereich() {
  const min = parseInt(document.getElementById('preisMin').value) || 100;
  const max = parseInt(document.getElementById('preisMax').value) || 1000;
  return { min: Math.min(min, max - 1), max: Math.max(min + 1, max) };
}


function zufallsPreisInBereich(von, bis) {
  const step = 5;
  const schritte = Math.floor((bis - von) / step);
  if (schritte <= 0) return von;
  return von + Math.floor(Math.random() * (schritte + 1)) * step;
}

// Gibt einen Preis und einen zweiten, abweichenden Preis zurück (für Vergleiche)
// Gibt einen Preis und einen zweiten, abweichenden Preis zurück (für Vergleiche)
function zweiPreise() {
  const { min, max } = getPreisBereich();
  // p1 im oberen Drittel wählen, damit nach unten genug Spielraum bleibt
  const drittel = Math.round((max - min) / 3);
  const p1 = zufallsPreisInBereich(min + drittel, max);
  // Zweiter Preis: 5–15 % günstiger
  const rabatt = 0.01 + Math.random() * 0.04;
  let p2 = Math.round((p1 * (1 - rabatt)) / 5) * 5;
  // Garantieren dass p2 wirklich kleiner als p1 und nicht unter min fällt
  p2 = Math.max(min, Math.min(p2, p1 - 5));
  return { hoch: p1, niedrig: p2 };
}

function einPreis() {
  const { min, max } = getPreisBereich();
  return zufallsPreisInBereich(min, max);
}



const differenzierungen = {
  person: {
    label: 'Personenbezogene Preisdifferenzierung',
    kurzbeschreibung: 'Verschiedene Preise für verschiedene Personengruppen (z. B. Schüler, Senioren)',
    formulierungen: [
      (u, ph, pn) => `${u} verkauft ein Fertigerzeugnis regulär für ${ph} €. Schüler und Studierende erhalten dasselbe Produkt für ${pn} €, sofern sie ihren Ausweis vorzeigen.`,
      (u, ph, pn) => `Ein Fertigerzeugnis von ${u} kostet für Erwachsene ${ph} €. Rentnerinnen und Rentner zahlen hingegen nur ${pn} € – der Preis richtet sich nach der Personengruppe, nicht nach dem Produkt.`,
      (u, ph, pn) => `${u} bietet ein Fertigerzeugnis zum Preis von ${ph} € an. Mitglieder eines Vereins erhalten auf Nachweis einen Sonderpreis von ${pn} €.`,
      (u, ph, pn) => `Für Gewerbetreibende berechnet ${u} bei einem Fertigerzeugnis ${ph} €. Privatpersonen zahlen denselben Listenpreis, Behörden hingegen erhalten einen Sonderpreis von ${pn} €.`,
      (u, ph, pn) => `${u} legt für ein Fertigerzeugnis zwei Preise fest: ${ph} € für Neukunden und ${pn} € für Stammkunden, die bereits mehrfach gekauft haben.`,
      (u, ph, pn) => `Das Fertigerzeugnis von ${u} kostet im Normalfall ${ph} €. Auszubildende und Schüler erhalten es auf Antrag für ${pn} €, da das Unternehmen junge Käufer gezielt ansprechen möchte.`,
    ]
  },

  menge: {
    label: 'Mengenbezogene Preisdifferenzierung',
    kurzbeschreibung: 'Günstigerer Preis bei größeren Abnahmemengen (Mengenrabatt)',
    formulierungen: [
      (u, ph, pn) => `Bei ${u} kostet ein einzelnes Fertigerzeugnis ${ph} €. Wer mindestens zehn Stück auf einmal abnimmt, zahlt nur noch ${pn} € pro Stück.`,
      (u, ph, pn) => `${u} berechnet für ein Fertigerzeugnis bei kleinen Bestellungen ${ph} € je Einheit. Ab einer Bestellmenge von 50 Stück sinkt der Stückpreis auf ${pn} €.`,
      (u, ph, pn) => `Ein Fertigerzeugnis von ${u} wird im Einzelkauf für ${ph} € angeboten. Großabnehmer, die mehr als 20 Einheiten bestellen, erhalten einen Staffelpreis von ${pn} € pro Stück.`,
      (u, ph, pn) => `${u} staffelt den Preis für ein Fertigerzeugnis nach Abnahmemenge: Bei 1–9 Stück werden ${ph} € fällig, ab 10 Stück nur noch ${pn} € je Einheit.`,
      (u, ph, pn) => `Wer bei ${u} ein einzelnes Fertigerzeugnis kauft, zahlt ${ph} €. Für Bestellungen von Paletten oder Großmengen gilt ein reduzierter Preis von ${pn} € pro Stück.`,
      (u, ph, pn) => `${u} gewährt bei einem Fertigerzeugnis einen Mengenrabatt: Der Einzelpreis beträgt ${ph} €, bei Abnahme von mindestens 25 Einheiten sinkt er auf ${pn} € pro Stück.`,
    ]
  },

  zeit: {
    label: 'Zeitbezogene Preisdifferenzierung',
    kurzbeschreibung: 'Verschiedene Preise zu verschiedenen Zeiten (z. B. Saison, Tageszeit)',
    formulierungen: [
      (u, ph, pn) => `${u} verkauft ein Fertigerzeugnis in der Hauptsaison für ${ph} €. Außerhalb der Saison, wenn die Nachfrage geringer ist, wird dasselbe Produkt für ${pn} € angeboten.`,
      (u, ph, pn) => `In den Sommermonaten berechnet ${u} für ein Fertigerzeugnis ${ph} €. Im Winter, wo die Nachfrage deutlich geringer ausfällt, liegt der Preis bei nur ${pn} €.`,
      (u, ph, pn) => `${u} setzt den Preis für ein Fertigerzeugnis zu Spitzenzeiten auf ${ph} €. In Zeiten geringerer Nachfrage – etwa außerhalb der Stoßzeiten – werden nur ${pn} € verlangt.`,
      (u, ph, pn) => `Kurz vor Weihnachten bietet ${u} ein Fertigerzeugnis für ${ph} € an. Nach den Feiertagen, wenn die Nachfrage abflaut, sinkt der Preis auf ${pn} €.`,
      (u, ph, pn) => `${u} hat für ein Fertigerzeugnis unterschiedliche Preise je nach Jahreszeit festgelegt: In der Hochsaison ${ph} €, in der Nebensaison ${pn} €.`,
      (u, ph, pn) => `Zu Messezeiten verkauft ${u} ein Fertigerzeugnis für ${ph} €. In den Wochen danach, wenn die Nachfrage nachlässt, reduziert das Unternehmen den Preis auf ${pn} €.`,
    ]
  },

  raum: {
    label: 'Raumbezogene Preisdifferenzierung',
    kurzbeschreibung: 'Verschiedene Preise je nach Verkaufsort oder Absatzgebiet (Region, Land, online/stationär)',
    formulierungen: [
      (u, ph, pn) => `${u} verkauft ein Fertigerzeugnis im stationären Fachhandel für ${ph} €. Im eigenen Online-Shop ist dasselbe Produkt für ${pn} € erhältlich, da dort geringere Betriebskosten anfallen.`,
      (u, ph, pn) => `Im Ladengeschäft von ${u} kostet ein Fertigerzeugnis ${ph} €. Wer es über die Website bestellt, zahlt nur ${pn} € – der Preis hängt davon ab, wo gekauft wird.`,
      (u, ph, pn) => `${u} verkauft ein Fertigerzeugnis im Inland für ${ph} €. Auf dem ausländischen Markt, wo die Kaufkraft geringer ist, wird dasselbe Produkt für ${pn} € angeboten.`,
      (u, ph, pn) => `In Großstädten berechnet ${u} für ein Fertigerzeugnis ${ph} €. In ländlichen Regionen mit schwächerer Nachfrage liegt der Preis bei ${pn} €.`,
      (u, ph, pn) => `Auf dem deutschen Markt kostet ein Fertigerzeugnis von ${u} ${ph} €. Für den Export in Länder mit niedrigerem Preisniveau gilt ein Exportpreis von ${pn} €.`,
      (u, ph, pn) => `${u} legt für ein Fertigerzeugnis je nach Absatzgebiet unterschiedliche Preise fest: Im Inland ${ph} €, im benachbarten Ausland ${pn} € – angepasst an die dortigen Marktbedingungen.`,
      (u, ph, pn) => `Im eigenen Flagship-Store in der Innenstadt berechnet ${u} für ein Fertigerzeugnis ${ph} €. Auf dem Marktplatz einer Partnerplattform im Internet wird dasselbe Produkt für ${pn} € angeboten.`,
      (u, ph, pn) => `${u} betreibt sowohl einen stationären Laden als auch einen Online-Shop. Ein Fertigerzeugnis kostet im Laden ${ph} €, online hingegen nur ${pn} € – das Unternehmen passt den Preis dem jeweiligen Vertriebsweg an.`,
      (u, ph, pn) => `${u} differenziert den Preis für ein Fertigerzeugnis regional: Im wirtschaftsstarken Süden werden ${ph} € verlangt, in strukturschwächeren Regionen hingegen nur ${pn} €.`,
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
// HAUPTFUNKTION – PREISDIFFERENZIERUNG ANZEIGEN
// ============================================================================

function zeigeZufaelligePreisdifferenzierung() {
  const container = document.getElementById('Container');

  if (!container) {
    console.error("Container nicht gefunden");
    return;
  }

  validierePreisEingabe();

  const minVal = parseInt(document.getElementById('preisMin').value);
  const maxVal = parseInt(document.getElementById('preisMax').value);
  if (isNaN(minVal) || isNaN(maxVal) || minVal >= maxVal) return;

  container.innerHTML = '';

  const kundeSelect = document.getElementById('diffKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  const anzeigeName = kundeValue || '[Modellunternehmen]';

  // Alle 4 Differenzierungsarten in zufälliger Reihenfolge
  const alleDiffKeys = shuffle(['person', 'menge', 'zeit', 'raum']);

  let aufgabenHTML = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2 class="loesung">Lösung</h2>';

  alleDiffKeys.forEach((diffKey, idx) => {
    const diff = differenzierungen[diffKey];
    const { hoch, niedrig } = zweiPreise();
    const ausgabe = pick(unternehmensVarianten)(anzeigeName);
    const text = pick(diff.formulierungen)(ausgabe, hoch.toLocaleString('de-DE'), niedrig.toLocaleString('de-DE'));

    aufgabenHTML += `<li>${text}</li>`;

    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${idx + 1}.</strong><br>`;
    loesungenHTML += `<div style="border: 1px solid #ccc; background-color:#fff; font-family:courier; padding: 4px 8px; margin: 0 0 6px;">
      <strong>${diff.label}</strong> – ${diff.kurzbeschreibung}
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
Du bist ein freundlicher Marketing-Assistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von Preisdifferenzierung.

Aufgabe:
- Gib KEINE fertigen Lösungen (Begriffsnamen) vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Zuordnung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage, welches Merkmal den Preisunterschied auslöst (Person? Menge? Zeit? Ort?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst auf den richtigen Begriff kommt, bestätige ihn.

Methodik bei Rückfragen:
- Wer zahlt den niedrigeren Preis – alle oder nur bestimmte Personen?
- Spielt die Menge eine Rolle?
- Hängt der Preis vom Zeitpunkt ab?
- Ist der Preis in einer Region anders als in einer anderen?

Die vier Arten der Preisdifferenzierung:

1. Personenbezogene Preisdifferenzierung
   - Verschiedene Preise für verschiedene Personengruppen
   - Beispiele: Schüler, Senioren, Vereinsmitglieder, Stammkunden
   - Kriterium: Wer kauft?

2. Mengenbezogene Preisdifferenzierung
   - Günstigerer Stückpreis bei größerer Abnahmemenge
   - Beispiele: Mengenrabatt, Staffelpreise, Großhandelspreise
   - Kriterium: Wie viel wird gekauft?

3. Zeitbezogene Preisdifferenzierung
   - Verschiedene Preise zu verschiedenen Zeiten
   - Beispiele: Saison, Tageszeit, Stoßzeiten, Feiertage
   - Kriterium: Wann wird gekauft?

4. Raumbezogene Preisdifferenzierung
   - Verschiedene Preise in verschiedenen Regionen oder Märkten
   - Beispiele: Inland vs. Ausland, Großstadt vs. Land, verschiedene Länder
   - Kriterium: Wo wird gekauft?

Typische Abgrenzungsfehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- Zeitbezogen ≠ Mengenbezogen (auch wenn beides „weniger zahlen" bedeuten kann)
- Raumbezogen ≠ Personenbezogen (Auslandspreise hängen am Ort, nicht an der Person)
- Das auslösende Merkmal entscheidet – nicht der Preis selbst

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 💰📊✅❓

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
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const kundeSelect = document.getElementById('diffKunde');

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

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    autoSelectMyCompany();
      zeigeZufaelligePreisdifferenzierung()
  }, 500);

});
