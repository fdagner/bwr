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