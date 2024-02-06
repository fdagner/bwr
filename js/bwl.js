// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Formatieren der Zahl mit Leerzeichen als Tausendertrennzeichen, ohne Dezimalkomma
function formatNumberWithSpace(number) {
  const formattedNumber = new Intl.NumberFormat('de-DE', { useGrouping: false }).format(number);
  return formattedNumber.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
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
      { value: optimaleBestellmenge, min: 1, max: 999999999, message: "Optimale Bestellmenge (1 - 999999999)" },
      { value: optimaleBestellhaeufigkeit, min: 1, max: 100, message: "Optimale Bestellhäufigkeit (1 - 100)" },
      { value: bestellkosten, min: 0, max: 999999999, message: "Bestellkosten (0 - 999999999)" },
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
  const durchschnittlicherBestand = (bedarf / (2 * optimaleBestellhaeufigkeit)).toFixed(2);
  const bestellkostenGesamt = (bestellkosten * optimaleBestellhaeufigkeit).toFixed(2);
  const lagerhaltungskosten = (durchschnittlicherBestand * lagerkosten).toFixed(2);
  const gesamtkosten = (parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten)).toFixed(2);

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
    const durchschnittlicherBestand = (bedarf / (2 * haeufigkeit)).toFixed(2);
    const bestellkostenGesamt = (bestellkosten * haeufigkeit).toFixed(2);
    const lagerhaltungskosten = (durchschnittlicherBestand * lagerkosten).toFixed(2);
    const gesamtkosten = (parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten)).toFixed(2);

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
      cell.textContent = formatNumberWithSpace(wert[key]);
      cell.style.border = '1px solid #000';
      cell.style.textAlign = ['Bestellkosten', 'Lagerkosten', 'Gesamtkosten'].includes(key) ? 'right' : 'center';
      cell.style.padding = '4px';
    });
  });

  // Tabelle in DOM einfügen
  wertetabelleElement.appendChild(table);
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

  html2canvas(produktlebenszyklusContainer).then(canvas => {
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

  html2canvas(portfolioContainer).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'portfolio.png';
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

  html2canvas(wertetabelle).then(canvas => {
      const dataURL = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'bestellmenge.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  });
}