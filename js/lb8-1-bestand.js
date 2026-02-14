// js/bestand.js

// Konten für Werkstoffe
const werkstoffe = [
  { name: "Rohstoffe", aufwand: "6000 AWR", bestand: "2000 R", faktor: 2 }, // ← Rohstoffe 10x höher
  { name: "Fremdbauteile", aufwand: "6010 AWF", bestand: "2010 F" },
  { name: "Hilfsstoffe", aufwand: "6020 AWH", bestand: "2020 H" },
  { name: "Betriebsstoffe", aufwand: "6030 AWB", bestand: "2030 B" }
];

// Hilfsfunktion für zufällige Bestände
function generateRandomBestand(faktor = 1) {
  // Basisbereich: 1.000 – 50.000
  // Rohstoffe bekommen Faktor ~10 → 10.000 – 500.000
  const min = 1000 * faktor;
  const max = 50000 * faktor;
  return Math.round((Math.random() * (max - min) + min) / 100) * 100;
}

// Formatierung (unverändert)
function formatBetrag(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function erstelleZufaelligeBestandsveraenderungen() {
  const bestandsdaten = werkstoffe.map(w => {
    // Rohstoffe bekommen explizit den 10-fachen Faktor
    const faktor = w.faktor || 1;
    const anfangs = generateRandomBestand(faktor);
    const schluss = generateRandomBestand(faktor);
    const veraenderung = schluss - anfangs;
    const art = veraenderung > 0 ? "Mehrung" : "Minderung";
    const betrag = Math.abs(veraenderung);
    let buchung = "";
    if (veraenderung > 0) {
      buchung = `${w.bestand} an ${w.aufwand}`;
    } else if (veraenderung < 0) {
      buchung = `${w.aufwand} an ${w.bestand}`;
    } else {
      buchung = "Keine Veränderung – keine Buchung";
    }
    return { ...w, anfangs, schluss, veraenderung, art, betrag, buchung };
  });

  return bestandsdaten;
}

function zeigeZufaelligeBestandsveraenderungen() {
  const container = document.getElementById('Container');
  if (!container) return;

  container.innerHTML = '';

  const bestandsdaten = erstelleZufaelligeBestandsveraenderungen();

  // ── AUFGABE ───────────────────────────────────────────────────────────────
  let html = '<h2>Aufgabe</h2>';
  html += `<p>Berechne die Bestandsveränderungen für die Werkstoffe:</p>`;
  html += `<table style="border-collapse: collapse; width: 100%; max-width: 900px; margin-bottom: 2em; font-family: courier;">`;
  html += `<thead><tr style="background:#f0f0f0;"><th style="padding:8px; text-align:left;">Werkstoff</th><th style="padding:8px; text-align:right;">Anfangsbestand €</th><th style="padding:8px; text-align:right;">Schlussbestand €</th><th style="padding:8px; text-align:right;">Bestandsveränderung €</th><th style="padding:8px; text-align:right;">Art</th></tr></thead>`;
  html += `<tbody>`;
  bestandsdaten.forEach(d => {
    html += `<tr style="border-bottom:1px solid #ccc;">
      <td style="padding:8px;">${d.name}</td>
      <td style="padding:8px; text-align:right;">${formatBetrag(d.anfangs)}</td>
      <td style="padding:8px; text-align:right;">${formatBetrag(d.schluss)}</td>
      <td style="padding:8px; text-align:right;">&nbsp;</td>
      <td style="padding:8px; text-align:right;">&nbsp;</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  html += `<p>Bilde die Buchungssätze zu den ermittelten Bestandsveränderungen.</p>`;

  // ── LÖSUNG ────────────────────────────────────────────────────────────────
  html += '<h2 style="margin-top:2.5em">Lösung</h2>';

  // Tabelle mit Veränderungen (wie in Aufgabe, aber jetzt ausgefüllt)
  html += `<table style="border-collapse: collapse; width: 100%; max-width: 900px; margin-bottom: 2em; font-family: courier;">`;
  html += `<thead><tr style="background:#f0f0f0;"><th style="padding:8px; text-align:left;">Werkstoff</th><th style="padding:8px; text-align:right;">Anfangsbestand €</th><th style="padding:8px; text-align:right;">Schlussbestand €</th><th style="padding:8px; text-align:right;">Bestandsveränderung €</th><th style="padding:8px; text-align:left;">Art</th></tr></thead>`;
  html += `<tbody>`;
  bestandsdaten.forEach(d => {
    html += `<tr style="border-bottom:1px solid #ccc;">
      <td style="padding:8px;">${d.name}</td>
      <td style="padding:8px; text-align:right;">${formatBetrag(d.anfangs)}</td>
      <td style="padding:8px; text-align:right;">${formatBetrag(d.schluss)}</td>
      <td style="padding:8px; text-align:right;">${d.veraenderung !== 0 ? formatBetrag(d.betrag) : '—'}</td>
      <td style="padding:8px;">${d.art}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  // ── BUCHUNGSSÄTZE (separat darunter, im gewohnten Tabellen-Format) ───────
  html += `<strong>Buchungssätze:</strong><br>`;
  html += `
  <table style="white-space:nowrap; background-color:#fff; font-family:courier; min-width:700px; border-collapse:collapse; margin:1em 0 1.8em 0;">
    <tbody>`;

bestandsdaten.forEach(d => {
  if (d.veraenderung !== 0) {
    html += `
    <tr>
      <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">${d.buchung.split(' an ')[0]}</td>
      <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px" tabindex="1"></td>
      <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px" tabindex="1">an</td>
      <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">${d.buchung.split(' an ')[1]}</td>
      <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right" tabindex="1">${formatBetrag(d.betrag)} €</td>
    </tr>`;
  } else {
    html += `
    <tr>
      <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" colspan="5" tabindex="1"><em>${d.name}: Keine Bestandsveränderung – keine Buchung</em></td>
    </tr>`;
  }
});

  html += `</tbody></table>`;

  container.innerHTML = html;
}

// Automatisches Ausführen beim Laden
document.addEventListener("DOMContentLoaded", function() {
  zeigeZufaelligeBestandsveraenderungen();
});

