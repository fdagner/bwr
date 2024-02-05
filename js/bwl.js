// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Formatieren der Zahl mit Leerzeichen als Tausendertrennzeichen, ohne Dezimalkomma
function formatNumberWithSpace(number) {
  const formattedNumber = new Intl.NumberFormat('de-DE', { useGrouping: false }).format(number);
  return formattedNumber.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
}



let optimaleBestellhaeufigkeit;
let optimaleBestellmenge;
let lagerkosten;
let bedarf;
function berechneOptimaleBestellmengeUndHaeufigkeit() {
  let optimaleBestellmenge = parseInt(document.getElementById("optimaleBestellmenge").value);
  let optimaleBestellhaeufigkeit = parseInt(document.getElementById("optimaleBestellhaeufigkeit").value);
  let bestellkosten = parseInt(document.getElementById("bestellkosten").value);
  let schrittweite = parseInt(document.getElementById("schrittweite").value);

  // Validate inputs
  if (
    isNaN(optimaleBestellmenge) || isNaN(optimaleBestellhaeufigkeit) ||
    isNaN(bestellkosten) || isNaN(schrittweite) ||
    optimaleBestellmenge < 1 || optimaleBestellmenge > 999999999
  ) {
    alert("Bitte eine gültige Zahl eingeben: Optimale Bestellmenge (1 - 999999999).");
    return;
  }

  if (
    optimaleBestellhaeufigkeit < 1 || optimaleBestellhaeufigkeit > 365
  ) {
    alert("Bitte eine gültige Zahl eingeben: Optimale Bestellhäufigkeit (1 - 365).");
    return;
  }

  if (
    bestellkosten < 0 || bestellkosten > 999999999
  ) {
    alert("Bitte eine gültige Zahl eingeben: Bestellkosten (0 - 999999999).");
    return;
  }

  if (
    schrittweite < 1 || schrittweite > 365
  ) {
    alert("Bitte eine gültige Zahl eingeben: Schrittweite (1 - 365).");
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
  document.getElementById('lagerkosten').innerText = formatCurrency(lagerkosten);
  document.getElementById('bedarf').innerText = formatNumberWithSpace(bedarf);
  document.getElementById('wertetabelle').innerHTML = '';

  // Input-Feldwerte abrufen
  let bestellkosten = parseInt(document.getElementById('bestellkosten').value);
  let optimaleBestellhaeufigkeit = parseInt(document.getElementById('optimaleBestellhaeufigkeit').value);
  let schrittweite = parseInt(document.getElementById('schrittweite').value);
  // Array für die Werte erstellen
  let werteArray = [];
  // Werte zur Tabelle hinzufügen
  werteArray.push({
    bestellmenge: Math.round(bedarf / optimaleBestellhaeufigkeit),
    haeufigkeit: optimaleBestellhaeufigkeit,
    durchschnittlicherBestand: (bedarf / (2 * optimaleBestellhaeufigkeit)).toFixed(2),
    bestellkostenGesamt: (bestellkosten * optimaleBestellhaeufigkeit).toFixed(2),
    lagerhaltungskosten: ((bedarf / (2 * optimaleBestellhaeufigkeit)) * lagerkosten).toFixed(2),
    gesamtkosten: (bestellkosten * optimaleBestellhaeufigkeit + (bedarf / (2 * optimaleBestellhaeufigkeit)) * lagerkosten).toFixed(2)
  });
  let schritte = schrittweite;
  for (let haeufigkeit = Math.max(0); haeufigkeit <= Math.min(100); haeufigkeit += schritte) {
    if (haeufigkeit < 1 || haeufigkeit > 100 || haeufigkeit === optimaleBestellhaeufigkeit) continue; // Überspringe die optimale Häufigkeit

    // Werte zum Array hinzufügen
    werteArray.push({
      bestellmenge: Math.round(bedarf / haeufigkeit),
      haeufigkeit: haeufigkeit,
      durchschnittlicherBestand: (bedarf / (2 * haeufigkeit)).toFixed(2),
      bestellkostenGesamt: (bestellkosten * haeufigkeit).toFixed(2),
      lagerhaltungskosten: ((bedarf / (2 * haeufigkeit)) * lagerkosten).toFixed(2),
      gesamtkosten: (bestellkosten * haeufigkeit + (bedarf / (2 * haeufigkeit)) * lagerkosten).toFixed(2)
    });
  }
  // Tabelle nach Bestellmenge absteigend sortieren
  werteArray.sort((a, b) => b.haeufigkeit - a.haeufigkeit);
  // Tabelle erstellen
  let table = document.createElement('table');
  table.style.width = '100%';  // Setzt die Breite der Tabelle
  table.style.borderCollapse = 'collapse';  // Setzt den border-collapse-Stil

  let headerRow = table.insertRow(0);
  let bestellmengeHeader = document.createElement('th');
  let haeufigkeitHeader = document.createElement('th');
  let durchschnittlicherBestandHeader = document.createElement('th');
  let bestellkostenHeader = document.createElement('th');
  let lagerhaltungskostenHeader = document.createElement('th');
  let gesamtkostenHeader = document.createElement('th');

  // Füge die Überschriften als <th> mit Hintergrundfarbe und Border hinzu
  bestellmengeHeader.textContent = 'Bestellmenge';
  haeufigkeitHeader.textContent = 'Bestellhäufigkeit';
  durchschnittlicherBestandHeader.textContent = 'Durchschn. Lagerbestand';
  bestellkostenHeader.textContent = 'Bestellkosten';
  lagerhaltungskostenHeader.textContent = 'Lagerkosten';
  gesamtkostenHeader.textContent = 'Gesamtkosten';

  headerRow.appendChild(bestellmengeHeader);
  headerRow.appendChild(haeufigkeitHeader);
  headerRow.appendChild(durchschnittlicherBestandHeader);
  headerRow.appendChild(bestellkostenHeader);
  headerRow.appendChild(lagerhaltungskostenHeader);
  headerRow.appendChild(gesamtkostenHeader);

  // Füge Hintergrundfarbe und Border für <th> hinzu
  const thElements = [bestellmengeHeader, haeufigkeitHeader, durchschnittlicherBestandHeader, bestellkostenHeader, lagerhaltungskostenHeader, gesamtkostenHeader];
  thElements.forEach(th => {
    th.style.backgroundColor = '#f5f5f5';  // Setzt die Hintergrundfarbe
    th.style.border = '1px solid #000';  // Setzt die Border
    th.style.padding = '4px';  // Setzt die Border
  });

  // Werte zur sortierten Tabelle hinzufügen
  for (let i = 0; i < werteArray.length; i++) {
    let row = table.insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);
    let cell6 = row.insertCell(5);

    cell1.innerHTML = formatNumberWithSpace(werteArray[i].bestellmenge);
    cell2.innerHTML = formatNumberWithSpace(werteArray[i].haeufigkeit);
    cell3.innerHTML = formatNumberWithSpace(werteArray[i].durchschnittlicherBestand);
    cell4.innerHTML = formatCurrency(werteArray[i].bestellkostenGesamt);
    cell5.innerHTML = formatCurrency(werteArray[i].lagerhaltungskosten);
    cell6.innerHTML = formatCurrency(werteArray[i].gesamtkosten);

    // Stile für jedes TD (table data) hinzufügen
    cell1.style.border = '1px solid #000';
    cell1.style.textAlign = 'center';
    cell2.style.border = '1px solid #000';
    cell2.style.textAlign = 'center';
    cell3.style.border = '1px solid #000';
    cell3.style.textAlign = 'center';
    cell4.style.border = '1px solid #000';
    cell4.style.textAlign = 'right';
    cell4.style.padding = '4px';
    cell5.style.border = '1px solid #000';
    cell5.style.textAlign = 'right';
    cell5.style.padding = '4px';
    cell6.style.border = '1px solid #000';
    cell6.style.textAlign = 'right';
    cell6.style.padding = '4px';
  }

  // Tabelle zum Dokument hinzufügen
  document.getElementById('wertetabelle').appendChild(table);
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