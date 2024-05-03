generatePortfolio();

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

function generatePortfolio() {

  const svgWidth = 550;
  const svgHeight = 380;

  const portfolios = [
    {
      name: document.getElementById('portfolioA').value,
      x: 50 + parseFloat(svgWidth) * parseFloat(document.getElementById('portfolioAx').value) / 200,
      y: svgHeight - (parseFloat(svgHeight) * parseFloat(document.getElementById('portfolioAy').value) / 40),
    },
    {
      name: document.getElementById('portfolioB').value,
      x: 50 + parseFloat(svgWidth) * parseFloat(document.getElementById('portfolioBx').value) / 200,
      y: svgHeight - (parseFloat(svgHeight) * parseFloat(document.getElementById('portfolioBy').value) / 40),
    },
    {
      name: document.getElementById('portfolioC').value,
      x: 50 + parseFloat(svgWidth) * parseFloat(document.getElementById('portfolioCx').value) / 200,
      y: svgHeight - (parseFloat(svgHeight) * parseFloat(document.getElementById('portfolioCy').value) / 40),
    },
    {
      name: document.getElementById('portfolioD').value,
      x: 50 + parseFloat(svgWidth) * parseFloat(document.getElementById('portfolioDx').value) / 200,
      y: svgHeight - (parseFloat(svgHeight) * parseFloat(document.getElementById('portfolioDy').value) / 40),
    }
  ];

  const svg = document.getElementById('portfolioSVG');

  const existingItems = svg.querySelectorAll('.item');
  existingItems.forEach(item => item.remove());

  portfolios.forEach(portfolio => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', portfolio.x);
    circle.setAttribute('cy', portfolio.y);
    circle.setAttribute('r', 10);
    circle.setAttribute('fill', getRandomColor());
    circle.classList.add('item');
    circle.classList.add('circle');
    svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', portfolio.x);
    text.setAttribute('y', portfolio.y);
    text.setAttribute('font-size', 18);
    text.setAttribute('fill', '#333');
    text.setAttribute('transform', 'translate(15,5)');
    text.textContent = portfolio.name;
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
