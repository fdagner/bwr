// Begin Marketing

function updateChartPoint(pointIndex, value) {
  const chartLine = document.getElementById('chartLine');
  let d = chartLine.getAttribute('d');

  d = d.replace(new RegExp(`(${pointIndex * 100 + 25},)([0-9]+)`), (_, prefix, oldValue) => `${prefix}${300 - value}`);

  chartLine.setAttribute('d', d);
}

let labelsVisible = true;
let colorlabelsVisible = true;

function cycleToggleLabels() {
  const labels = document.querySelectorAll('.label');
  labels.forEach(label => label.style.display = labelsVisible ? 'none' : 'inline');
  labelsVisible = !labelsVisible;
}

function cycleToggleColorlabels() {
  const colorlabels = document.querySelectorAll('.colorlabel');
  colorlabels.forEach(colorlabel => colorlabel.style.display = colorlabelsVisible ? 'none' : 'inline');
  colorlabelsVisible = !colorlabelsVisible;
}

function produktlebenszyklusHerunterladen() {
  const produktlebenszyklusHTML = document.getElementById('produktlebenszyklusContainer').innerHTML;
  const blob = new Blob([produktlebenszyklusHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'produktlebenszyklus.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function produktlebenszyklusKopiereInZwischenablage() {
  const produktlebenszyklusHTML = document.getElementById('produktlebenszyklusContainer').innerHTML;
  navigator.clipboard.writeText(produktlebenszyklusHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function produktlebenszyklusHerunterladenAlsPNG() {
  const produktlebenszyklusContainer = document.getElementById('produktlebenszyklusContainer');

  html2canvas(produktlebenszyklusContainer, optionshtml2canvas).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'produktlebenszyklus.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

// ============================================
// Dynamisches Markierungssystem
// ============================================

const MAX_MARKIERUNGEN = 5;
const FARBEN = ['blue', 'green', 'red', 'purple', 'orange'];
let markierungen = [];
let markierungCounter = 0;

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  updateAddButtonState();
});

function addMarkierung() {
  if (markierungen.length >= MAX_MARKIERUNGEN) {
    alert('Maximale Anzahl von Markierungen erreicht (5)');
    return;
  }

  markierungCounter++;
  const id = markierungCounter;
  const color = FARBEN[markierungen.length];
  
  const markierung = {
    id: id,
    color: color,
    position: 350, // Mittlere Position
    text: '',
    textVisible: true
  };
  
  markierungen.push(markierung);
  
  // HTML für die Steuerung erstellen
  createMarkierungControl(markierung);
  
  // SVG-Elemente erstellen
  createMarkierungSVG(markierung);
  
  updateAddButtonState();
}

function createMarkierungControl(markierung) {
  const container = document.getElementById('markierungenContainer');
  
  const div = document.createElement('div');
  div.className = 'markierung-item';
  div.id = `markierung-control-${markierung.id}`;
  
  div.innerHTML = `
    <div class="markierung-header">
      <span style="color: ${markierung.color};">● Markierung ${markierung.id}</span>
      <button class="delete-btn" onclick="removeMarkierung(${markierung.id})">
        <svg xmlns="http://www.w3.org/2000/svg" height="12" width="10" fill="white" viewBox="0 0 448 512">
          <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
        </svg>
        Löschen
      </button>
    </div>
    <div class="markierung-controls">
      <div class="slider-container">
        <div class="slider-label">
          <span>Position entlang der Kurve</span>
          <span id="position-value-${markierung.id}">Mitte</span>
        </div>
        <input 
          id="slider-${markierung.id}" 
          type="range" 
          min="50" 
          max="660" 
          value="${markierung.position}" 
          oninput="updateMarkierungPosition(${markierung.id}, this.value)"
        >
      </div>
    </div>
    <div class="text-input-container">
      <input 
        id="text-input-${markierung.id}" 
        type="text" 
        placeholder="Beschriftung eingeben..." 
        value="${markierung.text}"
        oninput="updateMarkierungText(${markierung.id}, this.value)"
      >
      <button 
        id="text-toggle-${markierung.id}" 
        class="text-toggle ${markierung.textVisible ? '' : 'inactive'}"
        onclick="toggleMarkierungText(${markierung.id})"
      >
        ${markierung.textVisible ? '👁️ Text' : '🚫 Text'}
      </button>
    </div>
  `;
  
  container.appendChild(div);
}

function createMarkierungSVG(markierung) {
  const svgContainer = document.getElementById('markierungenSVG');
  
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.id = `markierung-svg-${markierung.id}`;
  g.setAttribute('visibility', 'visible');
  
  // Kreuz-Linien
  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', '0');
  line1.setAttribute('y1', '0');
  line1.setAttribute('x2', '20');
  line1.setAttribute('y2', '20');
  line1.setAttribute('stroke', markierung.color);
  line1.setAttribute('stroke-width', '4');
  
  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.setAttribute('x1', '20');
  line2.setAttribute('y1', '0');
  line2.setAttribute('x2', '0');
  line2.setAttribute('y2', '20');
  line2.setAttribute('stroke', markierung.color);
  line2.setAttribute('stroke-width', '4');
  
  // Text
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.id = `markierung-text-${markierung.id}`;
  text.setAttribute('x', '-5');
  text.setAttribute('y', '-15');
  text.setAttribute('font-size', '20');
  text.setAttribute('fill', markierung.color);
  text.setAttribute('font-weight', 'bold');
  text.textContent = markierung.text;
  
  g.appendChild(line1);
  g.appendChild(line2);
  g.appendChild(text);
  
  svgContainer.appendChild(g);
  
  // Position initialisieren
  updateMarkierungPosition(markierung.id, markierung.position);
}

function updateMarkierungPosition(id, value) {
  const markierung = markierungen.find(m => m.id === id);
  if (!markierung) return;
  
  markierung.position = value;
  
  const group = document.getElementById(`markierung-svg-${id}`);
  const path = document.getElementById('chartLine');
  
  const length = path.getTotalLength();
  const point = path.getPointAtLength((value - 50) / 625 * length);
  
  const slope = getSlope(path, (value - 50) / 625);
  const yOffset = 8 * slope;
  
  group.setAttribute('transform', `translate(${point.x + 50},${point.y + yOffset - 10})`);
  
  // Position-Label aktualisieren
  const positionLabel = document.getElementById(`position-value-${id}`);
  if (positionLabel) {
    const percent = ((value - 50) / 610 * 100).toFixed(0);
    let label = 'Einführung';
    if (percent > 80) label = 'Degeneration';
    else if (percent > 60) label = 'Sättigung';
    else if (percent > 40) label = 'Reife';
    else if (percent > 20) label = 'Wachstum';
    positionLabel.textContent = label;
  }
}

function updateMarkierungText(id, text) {
  const markierung = markierungen.find(m => m.id === id);
  if (!markierung) return;
  
  markierung.text = text;
  
  const textElement = document.getElementById(`markierung-text-${id}`);
  if (textElement) {
    textElement.textContent = text;
  }
}

function toggleMarkierungText(id) {
  const markierung = markierungen.find(m => m.id === id);
  if (!markierung) return;
  
  markierung.textVisible = !markierung.textVisible;
  
  const textElement = document.getElementById(`markierung-text-${id}`);
  const toggleBtn = document.getElementById(`text-toggle-${id}`);
  
  if (textElement) {
    textElement.style.display = markierung.textVisible ? 'block' : 'none';
  }
  
  if (toggleBtn) {
    toggleBtn.className = `text-toggle ${markierung.textVisible ? '' : 'inactive'}`;
    toggleBtn.innerHTML = markierung.textVisible ? '👁️ Text' : '🚫 Text';
  }
}

function removeMarkierung(id) {
  const index = markierungen.findIndex(m => m.id === id);
  if (index === -1) return;
  
  // Aus Array entfernen
  markierungen.splice(index, 1);
  
  // HTML entfernen
  const control = document.getElementById(`markierung-control-${id}`);
  if (control) control.remove();
  
  // SVG entfernen
  const svg = document.getElementById(`markierung-svg-${id}`);
  if (svg) svg.remove();
  
  updateAddButtonState();
}

function updateAddButtonState() {
  const btn = document.getElementById('addMarkierungBtn');
  if (btn) {
    btn.disabled = markierungen.length >= MAX_MARKIERUNGEN;
    if (markierungen.length >= MAX_MARKIERUNGEN) {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" fill="#999" viewBox="0 0 448 512">
          <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
        </svg>
        Maximum erreicht (5/5)
      `;
    } else {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" fill="#ff4800" viewBox="0 0 448 512">
          <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
        </svg>
        Markierung hinzufügen (${markierungen.length}/5)
      `;
    }
  }
}

function getSlope(path, t) {
  const epsilon = 0.001;
  const p1 = path.getPointAtLength(t * path.getTotalLength());
  const p2 = path.getPointAtLength((t + epsilon) * path.getTotalLength());
  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  return slope;
}