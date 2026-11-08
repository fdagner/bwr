// portfolioanalyse.js – Komplette Version mit dynamischen Einträgen + Umsatz-Radius

const svgWidth  = 550;
const svgHeight = 380;
const minRadius = 6;
const maxRadius = 36;   // bei Umsatz 10

// Globale Datenstruktur
let portfolioEntries = [
  { id: 'A', label: 'Question Mark',  defaultX: 25,  defaultY: 30,  emoji: '❓', isFixed: true, umsatz: 5 },
  { id: 'B', label: 'Stars',         defaultX: 150, defaultY: 35,  emoji: '⭐', isFixed: true, umsatz: 8 },
  { id: 'C', label: 'Cash Cows',     defaultX: 150, defaultY: 15,  emoji: '🐮', isFixed: true, umsatz: 7 },
  { id: 'D', label: 'Poor Dogs',     defaultX: 25,  defaultY: 5,   emoji: '🐶', isFixed: true, umsatz: 3 }
];

// ───────────────────────────────────────────────
// Initialisierung – Eingabefelder erstellen
// ───────────────────────────────────────────────
function initPortfolioInputs() {
  const container = document.getElementById('portfolioEntries');
  if (!container) {
    console.error("Element #portfolioEntries nicht gefunden!");
    return;
  }
  
  container.innerHTML = '';

  portfolioEntries.forEach((entry, index) => {
    const div = document.createElement('div');
    div.className = 'portfolio-entry';
    div.dataset.index = index;

    let removeBtn = '';
    if (!entry.isFixed) {
      removeBtn = `<button type="button" class="remove-btn" data-on-click='[{"fn":"removePortfolioEntry","args":[${index}]}]'>✕ Entfernen</button>`;
    }

    div.innerHTML = `
      <div class="entry-header">
        <strong>${entry.emoji || ''} ${entry.label}</strong>
        ${removeBtn}
      </div>
      <label>Bezeichnung:</label>
      <input type="text" class="port-name" value="${entry.emoji || ''}${entry.label}" maxlength="30"><br>
      
      <label>Rel. Marktanteil (0–200):</label>
      <input type="number" class="port-x" value="${entry.defaultX}" min="0" max="200" step="1"><br>
      
      <label>Marktwachstum (0–40):</label>
      <input type="number" class="port-y" value="${entry.defaultY}" min="0" max="40" step="1"><br>
      
      <label>Umsatz (1–10) → Kreisgröße:</label>
      <input type="number" class="port-u" value="${entry.umsatz || 5}" min="1" max="10" step="1">
    `;

    container.appendChild(div);
  });
}

// ───────────────────────────────────────────────
function addPortfolioEntry() {
  const newEntry = {
    id: 'extra_' + Date.now(),
    label: 'Neuer Eintrag',
    defaultX: Math.round(Math.random() * 160 + 20),
    defaultY: Math.round(Math.random() * 30 + 5),
    umsatz: 5,
    isFixed: false
  };
  portfolioEntries.push(newEntry);
  initPortfolioInputs();
  // Optional: direkt aktualisieren
  // generatePortfolio();
}

// ───────────────────────────────────────────────
function removePortfolioEntry(index) {
  if (portfolioEntries[index].isFixed) return;
  portfolioEntries.splice(index, 1);
  initPortfolioInputs();
  generatePortfolio();
}

// ───────────────────────────────────────────────
// Hauptzeichnungsfunktion
// ───────────────────────────────────────────────
function generatePortfolio() {
  if (!validateAllInputs()) return;

  const svg = document.getElementById('portfolioSVG');
  if (!svg) return;

  // Alte Punkte entfernen
  svg.querySelectorAll('.item').forEach(el => el.remove());

  const entryElements = document.querySelectorAll('.portfolio-entry');

  entryElements.forEach((el) => {
    const name   = el.querySelector('.port-name').value.trim();
    const xVal   = parseFloat(el.querySelector('.port-x').value);
    const yVal   = parseFloat(el.querySelector('.port-y').value);
    const umsatz = parseInt(el.querySelector('.port-u').value) || 5;

    // Koordinaten skalieren
    const cx = 50 + (svgWidth * xVal / 200);
    const cy = svgHeight - (svgHeight * yVal / 40);

    // Radius nach Umsatz
    const radius = minRadius + (maxRadius - minRadius) * (umsatz - 1) / 9;

    // Kreis zeichnen
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", getRandomColor());
    circle.classList.add("item", "circle");
    // Tooltip mit Umsatz
    circle.innerHTML = `<title>Umsatz: ${umsatz} / 10</title>`;
    svg.appendChild(circle);

    // Text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx);
    text.setAttribute("y", cy);
    text.setAttribute("font-size", 16);
    text.setAttribute("fill", "#333");
    text.setAttribute("transform", "translate(15,5)");
    text.textContent = name;
    text.classList.add("item", "text");
    svg.appendChild(text);
  });

  // Zurückschreiben der gerundeten Werte
  entryElements.forEach(el => {
    el.querySelector('.port-x').value = Math.round(parseFloat(el.querySelector('.port-x').value));
    el.querySelector('.port-y').value = Math.round(parseFloat(el.querySelector('.port-y').value));
  });
}

// ───────────────────────────────────────────────
function validateAllInputs() {
  const entries = document.querySelectorAll('.portfolio-entry');
  for (let el of entries) {
    const x = parseFloat(el.querySelector('.port-x').value);
    const y = parseFloat(el.querySelector('.port-y').value);
    const u = parseInt(el.querySelector('.port-u').value);
    const name = el.querySelector('.port-name').value.trim();

    if (isNaN(x) || x < 0 || x > 200 ||
        isNaN(y) || y < 0 || y > 40  ||
        isNaN(u) || u < 1 || u > 10  ||
        name.length < 1 || name.length > 30) {
      zeigeModal("Bitte prüfen:\n• Marktanteil: 0–200\n• Wachstum: 0–40\n• Umsatz: 1–10\n• Name: max. 30 Zeichen");
      return false;
    }
  }
  return true;
}

// ───────────────────────────────────────────────
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// ───────────────────────────────────────────────
// Zufalls-Modus
// ───────────────────────────────────────────────
function randomizePortfolios() {
  const entryElements = document.querySelectorAll('.portfolio-entry');

  // Wir erwarten, dass die ersten 4 Einträge die Standard-Quadranten sind (in dieser Reihenfolge):
  // 0 → Question Mark   (hohes Wachstum, niedriger Marktanteil)
  // 1 → Stars           (hohes Wachstum, hoher Marktanteil)
  // 2 → Cash Cows       (niedriges Wachstum, hoher Marktanteil)
  // 3 → Poor Dogs       (niedriges Wachstum, niedriger Marktanteil)

  entryElements.forEach((el, index) => {
    const xInput = el.querySelector('.port-x');
    const yInput = el.querySelector('.port-y');
    const uInput = el.querySelector('.port-u');

    let x, y;

    if (index < 4) {
      // ── Standard-Quadranten ───────────────────────────────────────
      switch (index) {
        case 0: // Question Mark – oben links
          x = randomInRange(10,  80);   // niedriger bis mittlerer Marktanteil
          y = randomInRange(22,  38);   // hohes Wachstum
          break;

        case 1: // Stars – oben rechts
          x = randomInRange(110, 190);  // hoher Marktanteil
          y = randomInRange(22,  38);   // hohes Wachstum
          break;

        case 2: // Cash Cows – unten rechts
          x = randomInRange(110, 190);  // hoher Marktanteil
          y = randomInRange(2,   18);   // niedriges Wachstum
          break;

        case 3: // Poor Dogs – unten links
          x = randomInRange(10,  80);   // niedriger bis mittlerer Marktanteil
          y = randomInRange(2,   18);   // niedriges Wachstum
          break;
      }
    } else {
      // ── Zusätzliche Einträge → komplett zufällig ──────────────────
      x = randomInRange(5, 195);
      y = randomInRange(1, 39);
    }

    // Umsatz immer zufällig (1–10)
    const umsatz = Math.floor(Math.random() * 10) + 1;

    xInput.value = x;
    yInput.value = y;
    uInput.value = umsatz;
  });

  // Direkt aktualisieren
  generatePortfolio();
}

// Hilfsfunktion für Zufallswerte in einem Bereich (inkl. ganzer Zahlen)
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ───────────────────────────────────────────────
// Toggle-Funktionen (Text / Kreise / Gitter)
// ───────────────────────────────────────────────
let textLabelsVisible   = true;
let circleLabelsVisible = true;
let gitterLabelsVisible = true;

function portfolioToggleText() {
  document.querySelectorAll('.text').forEach(el => {
    el.style.display = textLabelsVisible ? 'none' : 'inline';
  });
  textLabelsVisible = !textLabelsVisible;
}

function portfolioToggleCircle() {
  document.querySelectorAll('.circle').forEach(el => {
    el.style.display = circleLabelsVisible ? 'none' : 'inline';
  });
  circleLabelsVisible = !circleLabelsVisible;
}

function portfolioToggleGitter() {
  document.querySelectorAll('.gitter').forEach(el => {
    el.style.display = gitterLabelsVisible ? 'none' : 'inline';
  });
  gitterLabelsVisible = !gitterLabelsVisible;
}

// ───────────────────────────────────────────────
// Download / Kopieren
// ───────────────────────────────────────────────
function portfolioHerunterladen() {
  const svg = document.getElementById('portfolioSVG');
  if (!svg) return;

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'portfolioanalyse.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function portfolioKopiereInZwischenablage() {
  const svg = document.getElementById('portfolioSVG');
  if (!svg) return;

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);

  navigator.clipboard.writeText(svgStr)
    .then(() => zeigeModal('SVG-Code in die Zwischenablage kopiert'))
    .catch(err => console.error('Kopieren fehlgeschlagen:', err));
}

function portfolioHerunterladenAlsPNG() {
  const container = document.getElementById('portfolioContainer') || document.getElementById('portfolioSVG');
  if (!container || typeof html2canvas !== 'function') {
    zeigeModal('html2canvas nicht geladen oder Container nicht gefunden.');
    return;
  }

  html2canvas(container, {
    backgroundColor: '#ffffff',
    scale: 2
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'portfolioanalyse.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    console.error('PNG-Export fehlgeschlagen:', err);
    zeigeModal('Fehler beim PNG-Export.');
  });
}

// ───────────────────────────────────────────────
// Start
// ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPortfolioInputs();
  generatePortfolio();
});