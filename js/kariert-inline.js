document.getElementById("generate").addEventListener("click", function () {
  const rowsInput = document.getElementById("rows");
  const columnsInput = document.getElementById("columns");
  const rows = parseInt(rowsInput.value, 10);
  const columns = parseInt(columnsInput.value, 10);

  // Validierung
  if (isNaN(rows) || rows < 1 || rows > 56) {
    zeigeModal("Bitte geben Sie eine gültige Anzahl von Zeilen (1-56) ein.");
    rowsInput.focus();
    return;
  }

  if (isNaN(columns) || columns < 1 || columns > 40) {
    zeigeModal("Bitte geben Sie eine gültige Anzahl von Spalten (1-40) ein.");
    columnsInput.focus();
    return;
  }

  const cellSizeCm = 0.5;
  const borderColorRaw = document.getElementById("borderColor").value;
  const borderColor = /^#[0-9a-fA-F]{6}$/.test(borderColorRaw)
    ? borderColorRaw
    : "#D3D3D3";

  // SVG Element erstellen
  let svg = `<svg width="${columns * cellSizeCm * 37.795275591}" height="${rows * cellSizeCm * 37.795275591}" xmlns="http://www.w3.org/2000/svg">`;

  // Horizontale Linien hinzufügen
  for (let i = 0; i <= rows; i++) {
    const y = i * cellSizeCm * 37.795275591;
    svg += `<line x1="0" y1="${y}" x2="${columns * cellSizeCm * 37.795275591}" y2="${y}" stroke="${borderColor}" stroke-width="1"/>`;
  }

  // Vertikale Linien hinzufügen
  for (let i = 0; i <= columns; i++) {
    const x = i * cellSizeCm * 37.795275591;
    svg += `<line x1="${x}" y1="0" x2="${x}" y2="${rows * cellSizeCm * 37.795275591}" stroke="${borderColor}" stroke-width="1"/>`;
  }

  svg += "</svg>";

  // SVG in den Container einfügen
  document.getElementById("svg-container").innerHTML = svg;

  // HTML-Tabelle erstellen
  let table =
    '<table style="border-collapse: collapse; margin-top: 20px; table-layout: fixed; width: auto;">';
  for (let r = 0; r < rows; r++) {
    table += `<tr style="height: 0.5cm;">`;
    for (let c = 0; c < columns; c++) {
      table += `<td style="width: 0.5cm; height: 0.5cm; border: 1px solid ${borderColor}; padding: 0; line-height: 0.5cm; vertical-align: middle; mso-height-rule: exactly;"></td>`;
    }
    table += "</tr>";
  }
  table += "</table>";

  // Tabelle in den Container einfügen
  document.getElementById("table-container").innerHTML = table;
});

function svgcontainerHerunterladen() {
  const svgcontainer = document.getElementById("svg-container").innerHTML;
  const blob = new Blob([svgcontainer], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "kariert.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

let clipboardtablecontainer = new ClipboardJS("#officeButtontablecontainer");

clipboardtablecontainer.on("success", function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  zeigeModal("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardtablecontainer.on("error", function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  zeigeModal("Die Tabelle wurde in die Zwischenablage kopiert.");
});
