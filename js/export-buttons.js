// ============================================================================
// EXPORT-BUTTONS – zentrales Modul
// ============================================================================
// Alle Export-Funktionen an einem Ort. Wird von den Seiten über
//   <div class="export-buttons" data-exports="png,html,office,print"></div>
//   <script src="js/export-buttons.js"></script>
// eingebunden. Das Modul rendert die Buttons automatisch beim Laden.
// ============================================================================

// Dateiname für den Export (kann von der Seite überschrieben werden)
function dateinameExport(format) {
  if (typeof window.exportDateiname === 'function') {
    try {
      const name = window.exportDateiname(format);
      if (name) return name;
    } catch (e) { /* Fallback */ }
  }
  return 'download.' + format;
}

// ---- Export-Funktionen ----

function exportHTML() {
  const codeHTML = document.getElementById('Container').innerHTML;
  const blob = new Blob([codeHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = dateinameExport('html');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportSource() {
  const codeHTML = document.getElementById('Container').innerHTML;
  navigator.clipboard.writeText(codeHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function exportPNG() {
  const container = document.getElementById('Container');
  html2canvas(container).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = dateinameExport('png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

function exportSVG() {
  const container = document.getElementById('Container');
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return alert('Kein SVG gefunden');
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = dateinameExport('svg');
  link.click();
  URL.revokeObjectURL(url);
}

function exportOffice() {
  // ClipboardJS wird beim ersten Aufruf initialisiert
  if (!window._clipboardOffice) {
    window._clipboardOffice = new ClipboardJS('#officeButton', { target: () => document.getElementById('Container') });
    window._clipboardOffice.on('success', () => {
      console.log('Die Tabelle wurde in die Zwischenablage kopiert.');
      alert('Die Tabelle wurde in die Zwischenablage kopiert.');
    });
    window._clipboardOffice.on('error', (e) => {
      console.error('Fehler beim Kopieren der Tabelle: ', e.action);
      alert('Fehler beim Kopieren der Tabelle.');
    });
  }
  const btn = document.getElementById('officeButton');
  if (btn) btn.click();
}

function exportPrint() {
  window.print();
}

// Moodle-XML-Export wird seiten-spezifisch implementiert (exportiereMoodle).
// Das Modul ruft window.exportiereMoodle() auf, falls vorhanden.
function exportMoodle() {
  if (typeof window.exportiereMoodle === 'function') {
    window.exportiereMoodle();
  } else {
    alert('Moodle-Export für diese Seite nicht verfügbar.');
  }
}

// ---- Render-Logik ----

const EXPORT_LABELS = {
  png:    { label: 'PNG',     title: 'Als PNG herunterladen',     fn: 'exportPNG' },
  svg:    { label: 'SVG',     title: 'Als SVG herunterladen',     fn: 'exportSVG' },
  html:   { label: 'HTML',    title: 'Als HTML herunterladen',    fn: 'exportHTML' },
  office: { label: 'Office',  title: 'In Zwischenablage für Office kopieren', fn: 'exportOffice', id: 'officeButton' },
  source: { label: 'Quelltext', title: 'Als HTML-Code in Zwischenablage', fn: 'exportSource' },
  print:  { label: 'Drucken', title: 'Als Arbeitsblatt drucken',  fn: 'exportPrint' },
  moodle: { label: 'Moodle-Fragetyp (XML)', title: 'Moodle-Fragetyp', fn: 'exportMoodle' },
};

function renderExportButtons() {
  document.querySelectorAll('.export-buttons').forEach(container => {
    const exports = (container.getAttribute('data-exports') || '').split(',').map(s => s.trim()).filter(Boolean);
    container.innerHTML = '';
    exports.forEach(key => {
      const cfg = EXPORT_LABELS[key];
      if (!cfg) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card-btn';
      btn.setAttribute('data-tooltip', cfg.title);
      btn.setAttribute('aria-label', cfg.title);
      btn.title = cfg.title;
      btn.textContent = cfg.label;
      btn.addEventListener('click', () => window[cfg.fn]());
      if (cfg.id) btn.id = cfg.id;
      container.appendChild(btn);
    });
  });
}

// Globale Funktionen verfügbar machen
window.exportHTML = exportHTML;
window.exportSource = exportSource;
window.exportPNG = exportPNG;
window.exportSVG = exportSVG;
window.exportOffice = exportOffice;
window.exportPrint = exportPrint;
window.exportMoodle = exportMoodle;
window.dateinameExport = dateinameExport;
window.renderExportButtons = renderExportButtons;

// Auto-Init beim Laden
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderExportButtons);
} else {
  renderExportButtons();
}
