// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Auf 2 Dezimalstellen runden
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}


// Formatieren der Zahl mit Leerzeichen als Tausendertrennzeichen, ohne Dezimalkomma
function formatNumberWithSpace(number) {
  const formattedNumber = new Intl.NumberFormat('de-DE', { useGrouping: false }).format(number);
  return formattedNumber.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
}

function roundUpToNearest(number) {
  const digits = Math.floor(Math.log10(number));
  const factor = Math.pow(10, digits);

  if (factor < 10) {
    return Math.ceil(number / 10) * 10;
  } else if (factor < 100) {
    return Math.ceil(number / 100) * 100;
  } else {
    return Math.ceil(number / 1000) * 1000;
  }
}


let lagerkosten;
let bedarf;
function berechneOptimaleBestellmengeUndHaeufigkeit() {
  let optimaleBestellmenge = parseInt(document.getElementById("optimaleBestellmenge").value, 10);
  let optimaleBestellhaeufigkeit = parseInt(document.getElementById("optimaleBestellhaeufigkeit").value, 10);
  let bestellkosten = parseInt(document.getElementById("bestellkosten").value, 10);
  let schrittweite = parseInt(document.getElementById("schrittweite").value, 10);

  function validateInputs(optimaleBestellmenge, optimaleBestellhaeufigkeit, bestellkosten, schrittweite) {
    const inputs = [
      { value: optimaleBestellmenge, min: 1, max: 999999999, message: "Optimale Bestellmenge (1 - 99999)" },
      { value: optimaleBestellhaeufigkeit, min: 1, max: 100, message: "Optimale Bestellhäufigkeit (1 - 100)" },
      { value: bestellkosten, min: 0, max: 999999999, message: "Bestellkosten (1 - 999)" },
      { value: schrittweite, min: 1, max: 100, message: "Schrittweite (1 - 100)" }
    ];

    for (const input of inputs) {
      if (isNaN(input.value) || input.value < input.min || input.value > input.max) {
        alert(`Bitte eine gültige Zahl eingeben: ${input.message}.`);
        return false;
      }
    }

    return true;
  }

  // Verwendung:
  if (!validateInputs(optimaleBestellmenge, optimaleBestellhaeufigkeit, bestellkosten, schrittweite)) {
    return;
  }

  // Input-Feldwerte abrufen
  optimaleBestellmenge = document.getElementById('optimaleBestellmenge').value;
  bestellkosten = document.getElementById('bestellkosten').value;
  optimaleBestellhaeufigkeit = document.getElementById('optimaleBestellhaeufigkeit').value;
  bedarf = optimaleBestellmenge * optimaleBestellhaeufigkeit;
  // Andler-Formel anwenden
  lagerkosten = (2 * bedarf * bestellkosten) / (optimaleBestellmenge * optimaleBestellmenge);
  lagerkosten = roundToTwoDecimals(lagerkosten);
  // Wertetabelle erstellen
  generiereWertetabelle();
}

function generiereWertetabelle() {
  // Tabelle leeren
  const lagerkostenElement = document.getElementById('lagerkosten');
  const bedarfElement = document.getElementById('bedarf');
  const wertetabelleElement = document.getElementById('wertetabelle');

  lagerkostenElement.innerText = formatCurrency(lagerkosten);
  bedarfElement.innerText = formatNumberWithSpace(bedarf);
  wertetabelleElement.innerHTML = '';

  // Input-Feldwerte abrufen
  const bestellkosten = parseInt(document.getElementById('bestellkosten').value, 10);
  const optimaleBestellhaeufigkeit = parseInt(document.getElementById('optimaleBestellhaeufigkeit').value, 10);
  const schrittweite = parseInt(document.getElementById('schrittweite').value, 10);

  const werteArray = [];

  // Berechnungen außerhalb der Schleife
  const durchschnittlicherBestand = roundToTwoDecimals(bedarf / (2 * optimaleBestellhaeufigkeit));
  const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * optimaleBestellhaeufigkeit);
  const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
  const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

  werteArray.push({
    bestellmenge: Math.round(bedarf / optimaleBestellhaeufigkeit),
    haeufigkeit: optimaleBestellhaeufigkeit,
    durchschnittlicherBestand: durchschnittlicherBestand,
    bestellkostenGesamt: bestellkostenGesamt,
    lagerhaltungskosten: lagerhaltungskosten,
    gesamtkosten: gesamtkosten
  });

  let schritte = schrittweite;
  for (let haeufigkeit = Math.max(0); haeufigkeit <= Math.min(100); haeufigkeit += schritte) {
    if (haeufigkeit < 1 || haeufigkeit > 100 || haeufigkeit === optimaleBestellhaeufigkeit) continue;

    // Werte berechnen
    const durchschnittlicherBestand = roundToTwoDecimals(bedarf / (2 * haeufigkeit));
    const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * haeufigkeit);
    const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
    const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

    // Werte zum Array hinzufügen
    werteArray.push({
      bestellmenge: Math.round(bedarf / haeufigkeit),
      haeufigkeit: haeufigkeit,
      durchschnittlicherBestand: durchschnittlicherBestand,
      bestellkostenGesamt: bestellkostenGesamt,
      lagerhaltungskosten: lagerhaltungskosten,
      gesamtkosten: gesamtkosten
    });
  }

  // Tabelle nach Bestellmenge absteigend sortieren
  werteArray.sort((a, b) => b.haeufigkeit - a.haeufigkeit);

  // Tabelle erstellen
  const table = document.createElement('table');
  table.style.width = '680px';
  table.style.borderCollapse = 'collapse';

  const thTitles = ['Bestellmenge', 'Bestellhäufigkeit', 'Durchschn. Lagerbestand', 'Bestellkosten', 'Lagerkosten', 'Gesamtkosten'];
  const headerRow = table.insertRow(0);

  thTitles.forEach(title => {
    const th = document.createElement('th');
    th.textContent = title;
    th.style.backgroundColor = '#f5f5f5';
    th.style.border = '1px solid #000';
    th.style.padding = '4px';
    headerRow.appendChild(th);
  });

  werteArray.forEach(wert => {
    const row = table.insertRow(-1);
    ['bestellmenge', 'haeufigkeit', 'durchschnittlicherBestand', 'bestellkostenGesamt', 'lagerhaltungskosten', 'gesamtkosten'].forEach(key => {
      const cell = row.insertCell();
      if (['bestellkostenGesamt', 'lagerhaltungskosten', 'gesamtkosten'].includes(key)) {
        cell.textContent = formatCurrency(wert[key]);
      } else {
        cell.textContent = formatNumberWithSpace(wert[key]);
      }
      cell.style.border = '1px solid #000';
      cell.style.textAlign = ['Bestellkosten', 'Lagerkosten', 'Gesamtkosten'].includes(key) ? 'right' : 'center';
      cell.style.padding = '4px';
    });
  });

  // Tabelle in DOM einfügen
  wertetabelleElement.appendChild(table);

  drawChart(werteArray);
}

function drawChart(werteArray) {
// Note: changes to the plugin code is not reflected to the chart, because the plugin is loaded at chart construction time and editor changes only trigger an chart.update().
const plugin = {
  id: 'customCanvasBackgroundColor',
  options: {
    color: 'white', // Set the default color
  },
  beforeDraw: (myChart) => {
    const { ctx } = myChart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = plugin.options.color || '#ffffff';
    ctx.fillRect(0, 0, myChart.width, myChart.height);
    ctx.restore();
  }
};
  const optimaleBestellmenge = parseInt(document.getElementById("optimaleBestellmenge").value, 10);
  const bestellkosten = parseInt(document.getElementById("bestellkosten").value, 10);
  const optimaleBestellhaeufigkeit = parseInt(document.getElementById('optimaleBestellhaeufigkeit').value, 10);
  const bedarf = optimaleBestellmenge * optimaleBestellhaeufigkeit;
  const lagerkosten = (2 * bedarf * bestellkosten) / (optimaleBestellmenge * optimaleBestellmenge);
  const labels = [];
  const lagerhaltungskostenData = [];
  const bestellkostenData = [];
  const gesamtkostenData = [];
  let schrittebestellmenge = roundUpToNearest(optimaleBestellmenge / 100)
  // Daten für das Diagramm berechnen
  for (let i = 0; i <= optimaleBestellmenge * 2; i += schrittebestellmenge) {
    const durchschnittlicherBestand = roundToTwoDecimals(i / 2);
    const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * bedarf / i);
    const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
    const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

    labels.push(i);
    lagerhaltungskostenData.push(parseFloat(lagerhaltungskosten));
    bestellkostenData.push(parseFloat(bestellkostenGesamt));
    gesamtkostenData.push(parseFloat(gesamtkosten));
  }
  if (window.myChart instanceof Chart) {
    window.myChart.destroy();
  }
  let ychartmax = roundUpToNearest((optimaleBestellhaeufigkeit * bestellkosten + optimaleBestellmenge / 2 * lagerkosten) * 3);
  const ctx = document.getElementById('myChart').getContext('2d');

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Lagerhaltungskosten',
        data: lagerhaltungskostenData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 3,
        pointRadius: 0,
        borderDash: [4,2],
      }, {
        label: 'Bestellkosten',
        data: bestellkostenData,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 3,
        pointRadius: 0,
      },
      {
        label: 'Gesamtkosten',
        data: gesamtkostenData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 3,
        pointRadius: 0,
        borderDash: [10,5],
      }]
    },
    options: {
      responsive: true,
      plugins: {
          customCanvasBackgroundColor: {
          color: 'white',
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Bestellmenge'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Kosten'
          },
          beginAtZero: true,
          max: ychartmax,
          ticks: {
            callback: function (value, index, values) {
              return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
            },
          }
        }
      }
    },
    plugins: [plugin],
  });


}




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

function randomizePortfolios() {
  const portfolios = [
    document.getElementById('portfolioA').value,
    document.getElementById('portfolioB').value,
    document.getElementById('portfolioC').value,
    document.getElementById('portfolioD').value
  ];

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const svg = document.getElementById('portfolioSVG');

  const existingItems = svg.querySelectorAll('.item');
  existingItems.forEach(item => item.remove());

  portfolios.forEach(portfolio => {
    let x, y;
    switch (portfolio) {
      case portfolios[0]:
        x = getRandomNumber(55, 250);
        y = getRandomNumber(15, 180);
        break;
      case portfolios[1]:
        x = getRandomNumber(375, 550);
        y = getRandomNumber(15, 180);
        break;
      case portfolios[2]:
        x = getRandomNumber(375, 550);
        y = getRandomNumber(215, 350);
        break;
      case portfolios[3]:
        x = getRandomNumber(55, 250);
        y = getRandomNumber(215, 350);
        break;
      default:
        break;
    }

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 10);
    circle.setAttribute('fill', getRandomColor());
    circle.classList.add('item');
    circle.classList.add('circle');
    svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('font-size', 18);
    text.setAttribute('fill', '#333');
    text.setAttribute('transform', 'translate(15,5)');
    text.textContent = portfolio;
    text.classList.add('item');
    text.classList.add('text');
    svg.appendChild(text);
  });
}


function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let textLabelsVisible = true;
let circleLabelsVisible = true;


function portfolioToggleText() {
  const textlabels = document.querySelectorAll('.text');

  textlabels.forEach(textlabel => textlabel.style.display = textLabelsVisible ? 'none' : 'inline');

  textLabelsVisible = !textLabelsVisible;
}

function portfolioToggleCircle() {
  const circlelabels = document.querySelectorAll('.circle');

  circlelabels.forEach(circlelabel => circlelabel.style.display = circleLabelsVisible ? 'none' : 'inline');

  circleLabelsVisible = !circleLabelsVisible;
}


function portfolioHerunterladen() {
  const portfolioHTML = document.getElementById('portfolioContainer').innerHTML;
  const blob = new Blob([portfolioHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function portfolioKopiereInZwischenablage() {
  const portfolioHTML = document.getElementById('portfolioContainer').innerHTML;
  navigator.clipboard.writeText(portfolioHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function portfolioHerunterladenAlsPNG() {
  const portfolioContainer = document.getElementById('portfolioContainer');

  html2canvas(portfolioContainer, optionshtml2canvas).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'portfolio.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

function bestellmengeDiagrammHerunterladenAlsPNG() {
  const portfolioContainer = document.getElementById('myChart');

  html2canvas(portfolioContainer, optionshtml2canvas).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'bestellmengeDiagramm.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}


function bestellmengeKopiereInZwischenablage() {
  const bestellmengeHTML = document.getElementById('wertetabelle').innerHTML.replace(/&nbsp;/g, ' ');;
  navigator.clipboard.writeText(bestellmengeHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function bestellmengeHerunterladen() {
  const emailHTML = document.getElementById('wertetabelle').innerHTML.replace(/&nbsp;/g, ' ');;
  const blob = new Blob([emailHTML], { type: 'html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bestellmenge.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


function bestellmengeHerunterladenAlsPNG() {
  const wertetabelle = document.getElementById('wertetabelle');

  html2canvas(wertetabelle, optionshtml2canvas).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'bestellmenge.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

let clipboardeinkauf = new ClipboardJS('#bestellmengeOfficeButton');

clipboardeinkauf.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardeinkauf.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


document.addEventListener('DOMContentLoaded', function () {
  // Hier wird generiereWertetabelle() beim Laden der Seite ausgeführt
  berechneOptimaleBestellmengeUndHaeufigkeit();
});

 