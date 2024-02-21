// Auf 2 Dezimalstellen runden
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatDecimal(amount) {
  return new Intl.NumberFormat("de-DE", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Formatieren der Zahl mit Leerzeichen als Tausendertrennzeichen, ohne Dezimalkomma
function formatNumberWithSpace(number) {
  const formattedNumber = new Intl.NumberFormat("de-DE", {
    useGrouping: false,
  }).format(number);
  return formattedNumber.replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
}

document.getElementById("hideLEgend").addEventListener("click", function () {
  gewinnschwelleChart.options.plugins.legend.display =
    !gewinnschwelleChart.options.plugins.legend.display;
  gewinnschwelleChart.update();
});

function validateAndGenerateChart() {
  const fixkostenInput = document.getElementById("fixkosten");
  const variablestückkostenInput = document.getElementById(
    "variablestückkosten"
  );
  const nettoverkaufserlösestückInput = document.getElementById(
    "nettoverkaufserlösestück"
  );

  const fixkosten = parseFloat(fixkostenInput.value);
  const variablestückkosten = parseFloat(variablestückkostenInput.value);
  const nettoverkaufserlösestück = parseFloat(
    nettoverkaufserlösestückInput.value
  );

  if (
    isNaN(fixkosten) ||
    isNaN(variablestückkosten) ||
    isNaN(nettoverkaufserlösestück) ||
    fixkosten < 0 ||
    fixkosten > 999999999 ||
    variablestückkosten < 0 ||
    variablestückkosten > 100000 ||
    nettoverkaufserlösestück < 0 ||
    nettoverkaufserlösestück > 50000
  ) {
    alert(
      "Bitte geben Sie gültige positive Werte ein:\nFixkosten: 0 - 999999999\nVariable Stückkosten: 0 - 100000\nNettoverkaufserlöse pro Stück: 0 - 50000"
    );
    return;
  }

  generateChart();
}

function calculateData(
  fixkosten,
  variablestückkosten,
  nettoverkaufserlösestück,
  maxMenge
) {
  let gewinnschwelle;
  let gewinnschwellenmenge;
  gewinnschwelle = fixkosten / (nettoverkaufserlösestück - variablestückkosten);
  gewinnschwelle = roundToTwoDecimals(gewinnschwelle);
  gewinnschwellenmenge = gewinnschwelle * nettoverkaufserlösestück;

  let variablekosten = variablestückkosten * maxMenge;
  let gesamtkosten = fixkosten + variablekosten;
  let nettoverkaufserlöse = nettoverkaufserlösestück * maxMenge;

  return {
    gewinnschwelle,
    gewinnschwellenmenge,
    variablekosten,
    gesamtkosten,
    nettoverkaufserlöse,
  };
}

function generateChart() {
  const plugin = {
    id: "customCanvasBackgroundColor",
    options: {
      color: "white", // Set the default color
    },
    beforeDraw: (myChart) => {
      const { ctx } = myChart;
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = plugin.options.color || "#ffffff";
      ctx.fillRect(0, 0, myChart.width, myChart.height);
      ctx.restore();
    },
  };
  let fixkosten = parseFloat(document.getElementById("fixkosten").value);
  let variablestückkosten = parseFloat(
    document.getElementById("variablestückkosten").value
  );
  let nettoverkaufserlösestück = parseFloat(
    document.getElementById("nettoverkaufserlösestück").value
  );

  if (
    isNaN(fixkosten) ||
    isNaN(variablestückkosten) ||
    isNaN(nettoverkaufserlösestück)
  ) {
    alert("Please enter valid numeric values for all fields.");
  }
  let maxMenge;
  let gewinnschwelleNenner = nettoverkaufserlösestück - variablestückkosten;
  if (gewinnschwelleNenner > 0) {
    maxMenge =
      Math.ceil(
        (fixkosten / (nettoverkaufserlösestück - variablestückkosten)) * 2
      ) || 1000; // Die maximale Menge wird dynamisch berechnet oder auf 1000 gesetzt, falls die Berechnung fehlschlägt
  } else {
    alert(
      "Ungültige Werte: die Nettoverkaufserlöse müssen höher als die Variablen Stückkosten sein."
    );
    return {
      maxMenge: null,
    };
  }

  let {
    gewinnschwelle,
    gewinnschwellenmenge,
    variablekosten,
    gesamtkosten,
    nettoverkaufserlöse,
  } = calculateData(
    fixkosten,
    variablestückkosten,
    nettoverkaufserlösestück,
    maxMenge
  );

  if (window.gewinnschwelleChart instanceof Chart) {
    window.gewinnschwelleChart.destroy();
  }

  const ctx = document.getElementById("gewinnschwelleChart").getContext("2d");
  window.gewinnschwelleChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Nettoverkaufserlöse",
          data: [
            { x: 0, y: 0 },
            { x: maxMenge, y: nettoverkaufserlöse },
          ],
          backgroundColor: "rgba(39, 245, 112, 0.8)",
          borderColor: "rgba(39, 245, 112, 0.8)",
          borderWidth: 3,
          showLine: true,
        },
        {
          label: "Gesamtkosten",
          data: [
            { x: 0, y: fixkosten },
            { x: maxMenge, y: gesamtkosten },
          ],
          backgroundColor: "rgba(0, 99, 132, 1)",
          borderColor: "rgba(0, 99, 132, 1)",
          borderWidth: 3,
          showLine: true,
        },
        {
          label: "Variablen Kosten",
          data: [
            { x: 0, y: 0 },
            { x: maxMenge, y: variablekosten },
          ],
          backgroundColor: "rgba(255, 99, 132, 1)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 3,
          showLine: true,
        },
        {
          label: "Fixkosten",
          data: [
            { x: 0, y: fixkosten },
            { x: maxMenge, y: fixkosten },
          ],
          backgroundColor: "rgba(245, 193, 39, 0.8)",
          borderColor: "rgba(245, 193, 39, 0.8)",
          borderWidth: 3,
          showLine: true,
        },
        {
          type: "scatter",
          label: "Gewinnschwelle",
          data: [
            { x: 0, y: gewinnschwellenmenge },
            { x: gewinnschwelle, y: gewinnschwellenmenge },
            { x: gewinnschwelle, y: 0 },
          ],
          borderColor: "rgba(0, 0, 0, 1)",
          borderWidth: 2,
          pointRadius: 12,
          showLine: true,
          borderDash: [5, 5],
        },
      ],
    },
    options: {
      responsive: true,
      aspectRatio: 1.5,
      plugins: {
        title: { display: true, text: "Gewinnschwelle", font: { size: 20 } },
        legend: { position: "bottom", labels: { font: { size: 16 } } },
        tooltip: { mode: "index", intersect: false },
      },
      hover: { mode: "x-axis", intersect: false },
      scales: {
        y: {
          title: {
            display: true,
            text: "Umsatz / Kosten",
          },
          beginAtZero: true,
          max: gewinnschwellenmenge * 1.5,
          min: 0,
        },
        x: {
          max: maxMenge,
          title: {
            display: true,
            text: "Absatz (verkaufte Menge)",
          },
        },
      },
    },
    plugins: [plugin],
  });

  let zufallszahl = Math.floor(Math.random() * 16) + 10;
  let deckungsbeitragstück = nettoverkaufserlösestück - variablestückkosten;
  gewinnschwelleMitVerlust = Math.round(
    gewinnschwelle - (zufallszahl * gewinnschwelle) / 100
  );
  let deckungsbeitraGesamtmitVerlust =
    deckungsbeitragstück * gewinnschwelleMitVerlust;
  let verlust = deckungsbeitraGesamtmitVerlust - fixkosten;
  verlust = formatCurrency(verlust);
  let gewinnzone = formatNumberWithSpace(Math.ceil(gewinnschwelle));
  gewinnschwelleMitVerlust = formatNumberWithSpace(gewinnschwelleMitVerlust);
  deckungsbeitragstück = formatCurrency(deckungsbeitragstück);
  gewinnschwellenmenge = formatCurrency(gewinnschwellenmenge);
  variablekosten = formatCurrency(variablekosten);
  gesamtkosten = formatCurrency(gesamtkosten);
  nettoverkaufserlöse = formatCurrency(nettoverkaufserlöse);
  fixkosten = formatCurrency(fixkosten);
  nettoverkaufserlösestück = formatCurrency(nettoverkaufserlösestück);
  variablestückkosten = formatCurrency(variablestückkosten);
  gewinnschwelle = parseFloat(gewinnschwelle);
  gewinnschwelle = formatDecimal(gewinnschwelle);
  deckungsbeitraGesamtmitVerlust = formatCurrency(
    deckungsbeitraGesamtmitVerlust
  );

  let aufgabeSatz;
  const randomAufgabeSatz = Math.random();
  aufgabeSatz = `<h3>Aufgabe</h3>`;
  if (randomAufgabeSatz < 0.5) {
    aufgabeSatz += `Wir produzieren im aktuellen Quartal Fertigerzeugnisse, die zu einem Nettoverkaufspreis von ${nettoverkaufserlösestück} verkauft werden. 
    Die Fixkosten belaufen sich auf ${fixkosten}. Bei der Produktion entstehen variable Kosten je Stück in Höhe von ${variablestückkosten}. 
    Berechnen Sie, wie viele Fertigerzeugnisse hergestellt und abgesetzt werden müssen, um Gewinn zu erwirtschaften.`;
  } else if (randomAufgabeSatz > 0.5) {
    aufgabeSatz += `Wir produzierten im letzten Quartal ${gewinnschwelleMitVerlust} Fertigerzeugnisse, die zu einem Nettoverkaufspreis von je ${nettoverkaufserlösestück} verkauft wurden. 
    Bei der Produktion entstanden variable Kosten je Stück in Höhe von ${variablestückkosten}. Wir haben einen Verlust in Höhe von ${verlust} erzielt.
    Berechnen Sie, wie viele Fertigerzeugnisse hergestellt und abgesetzt werden müssen, um im nächsten Quartal Gewinn zu erwirtschaften.`;
  }

  let loesungSatz = `<h3>Lösung</h3>`;
  loesungSatz += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
  loesungSatz += `<tbody>`;
  loesungSatz += `<tr>`;
  loesungSatz += `<td>Nettoverkaufspreis / Stück</td><td style="padding-left:16px;text-align:right;">${nettoverkaufserlösestück}</td>`;
  loesungSatz += `</tr>`;
  loesungSatz += `<tr>`;
  loesungSatz += `<td>- variable Kosten / Stück</td><td style="padding-left:16px;text-align:right;">${variablestückkosten}</td>`;
  loesungSatz += `</tr>`;
  loesungSatz += `<tr>`;
  loesungSatz += `<td style="border-top: solid 1px #ccc">= Deckungsbeitrag / Stück</td>`;
  loesungSatz += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${deckungsbeitragstück}<br></td>`;
  loesungSatz += `</tr>`;
  loesungSatz += `</tbody>`;
  loesungSatz += `</table>`;
  loesungSatz += `<br>`;
  if (randomAufgabeSatz > 0.5) {
    loesungSatz += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
    loesungSatz += `<tbody>`;
    loesungSatz += `<tr>`;
    loesungSatz += `<td>Deckungsbeitrag gesamt</td><td style="padding-left:16px;text-align:right;">${deckungsbeitraGesamtmitVerlust}</td>`;
    loesungSatz += `</tr>`;
    loesungSatz += `<tr>`;
    loesungSatz += `<td>Fixkosten</td><td style="padding-left:16px;text-align:right;">${fixkosten}</td>`;
    loesungSatz += `</tr>`;
    loesungSatz += `<tr>`;
    loesungSatz += `<td style="border-top: solid 1px #ccc">Verlust</td>`;
    loesungSatz += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verlust}<br></td>`;
    loesungSatz += `</tr>`;
    loesungSatz += `</tbody>`;
    loesungSatz += `</table>`;
    loesungSatz += `<br>`;
  }
  loesungSatz += `Gewinnschwelle: ${fixkosten} / ${deckungsbeitragstück} = ${gewinnschwelle}  `;
  loesungSatz += `<br><br>`;
  loesungSatz += `Es müssen ${gewinnzone} Fertigerzeugnisse produziert und abgesetzt werden, um den Beginn der Gewinnzone zu erreichen.`;

  document.getElementById("gewinnschwelleAufgabeContainer").innerHTML =
    aufgabeSatz + loesungSatz;
}

function gewinnschwelleHerunterladenAlsPNG() {
  const wertetabelle = document.getElementById("gewinnschwelleContainer");

  html2canvas(wertetabelle).then((canvas) => {
    const dataURL = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "gewinnschwelle.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}


function gewinnschwelleKopiereInZwischenablage() {
  const gewinnschwelleHTML = document.getElementById('gewinnschwelleAufgabeContainer').innerHTML.replace(/&nbsp;/g, ' ');;
  navigator.clipboard.writeText(gewinnschwelleHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function gewinnschwelleHerunterladen() {
  const emailHTML = document.getElementById('gewinnschwelleAufgabeContainer').innerHTML.replace(/&nbsp;/g, ' ');;
  const blob = new Blob([emailHTML], { type: 'html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gewinnschwelle.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


function gewinnschwelleHerunterladenAlsPNG() {
  const wertetabelle = document.getElementById('gewinnschwelleAufgabeContainer');

  html2canvas(wertetabelle).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'gewinnschwelle.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Hier wird generiereWertetabelle() beim Laden der Seite ausgeführt
  generateChart();
});
