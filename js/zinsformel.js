function zinsformelHerunterladen() {
    const zinsformelHTML = document.getElementById('zinsformelContainer').innerHTML;
    const blob = new Blob([zinsformelHTML], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'zinsformel.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  function zinsformelKopiereInZwischenablage() {
    const zinsformelHTML = document.getElementById('zinsformelContainer').innerHTML;
    navigator.clipboard.writeText(zinsformelHTML)
      .then(() => alert('Code wurde in die Zwischenablage kopiert'))
      .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
  }
  
  function zinsformelHerunterladenAlsPNG() {
    const zinsformelContainer = document.getElementById('zinsformelContainer');
  
    html2canvas(zinsformelContainer, optionshtml2canvas).then(canvas => {
      const dataURL = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'zinsformel.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
  
  function umstellen() {
    const variable = document.getElementById('variable').value;  // Die aktuell ausgewählte Variable aus dem Dropdown
    const formelDiv = document.getElementById('zinsformelContainer');

    // Formel umstellen basierend auf der ausgewählten Variable
    let formel = '';

    switch (variable) {
        case 'Z':
            formel = `
            <math xmlns="http://www.w3.org/1998/Math/MathML" displaystyle="true" style="font-size: 1.5rem; color: darkblue;overflow: hidden;">
                <mi>Z</mi><mo>=</mo>
                <mfrac>
                    <mrow><mi>K</mi><mo>&#x22C5;</mo><mi>p</mi><mo>&#x22C5;</mo><mi>t</mi></mrow>
                    <mrow><mn>100</mn><mo>&#x22C5;</mo><mn>360</mn></mrow>
                </mfrac>
            </math>`;
            break;
        case 'K':
            formel = `
            <math xmlns="http://www.w3.org/1998/Math/MathML" displaystyle="true" style="font-size: 1.5rem; color: darkblue;overflow: hidden;">
                <mi>K</mi><mo>=</mo>
                <mfrac>
                    <mrow><mi>Z</mi><mo>&#x22C5;</mo><mn>100</mn><mo>&#x22C5;</mo><mn>360</mn></mrow>
                    <mrow><mi>p</mi><mo>&#x22C5;</mo><mi>t</mi></mrow>
                </mfrac>
            </math>`;
            break;
        case 'p':
            formel = `
            <math xmlns="http://www.w3.org/1998/Math/MathML" displaystyle="true" style="font-size: 1.5rem; color: darkblue;overflow: hidden;">
                <mi>p</mi><mo>=</mo>
                <mfrac>
                    <mrow><mi>Z</mi><mo>&#x22C5;</mo><mn>100</mn><mo>&#x22C5;</mo><mn>360</mn></mrow>
                    <mrow><mi>K</mi><mo>&#x22C5;</mo><mi>t</mi></mrow>
                </mfrac>
            </math>`;
            break;
        case 't':
            formel = `
            <math xmlns="http://www.w3.org/1998/Math/MathML" displaystyle="true" style="font-size: 1.5rem; color: darkblue;overflow: hidden;">
                <mi>t</mi><mo>=</mo>
                <mfrac>
                    <mrow><mi>Z</mi><mo>&#x22C5;</mo><mn>100</mn><mo>&#x22C5;</mo><mn>360</mn></mrow>
                    <mrow><mi>K</mi><mo>&#x22C5;</mo><mi>p</mi></mrow>
                </mfrac>
            </math>`;
            break;
    }

    // Formel in den div einfügen
    formelDiv.innerHTML = formel;

    // Zustand der Checkbox prüfen und die Folgezeile anzeigen oder entfernen
    const isChecked = document.getElementById('toggleSecondLine').checked;
    if (isChecked) {
        addOrRemoveSecondLine(true, variable);  // Folgezeile hinzufügen mit der Variable
    } else {
        addOrRemoveSecondLine(false); // Folgezeile entfernen
    }
}

// Funktion für das Hinzufügen oder Entfernen der zweiten Zeile
function addOrRemoveSecondLine(show, variable) {
    const mathElement = document.getElementById('zinsformelContainer');

    if (!mathElement) {
        console.error('Math-Element nicht gefunden!');
        return;
    }

    // Prüfen, ob bereits ein MathML-Element für die zweite Zeile existiert
    const existingSecondMath = mathElement.querySelector('.second-math');

    if (show && !existingSecondMath) {
        // Neues MathML-Element für die zweite Zeile erstellen
        const breakline = document.createElement('br');
        const newMathElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
        newMathElement.setAttribute('class', 'second-math');
        newMathElement.setAttribute('style', 'font-size: 1.5rem; color: darkblue; margin-top: 10px;overflow: hidden;'); // Optionales Styling für die zweite Zeile
        // Erstellen der zweiten Zeile
        const mrow = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');

        const variableElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi');
        variableElement.textContent = variable;  // Die Variable hier einfügen

        const equalSign = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo');
        equalSign.textContent = '=';

        const multiplySign = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mo');
        multiplySign.textContent = '...';

        mrow.appendChild(variableElement);  // Füge die Variable vor dem '=' hinzu
        mrow.appendChild(equalSign);
        mrow.appendChild(multiplySign);

        newMathElement.appendChild(mrow);

        // Das neue Math-Element für die zweite Zeile in den Container einfügen
        mathElement.appendChild(breakline);
        mathElement.appendChild(newMathElement);
    } else if (!show && existingSecondMath) {
        // Wenn show false ist, entferne die zweite Zeile
        existingSecondMath.remove();
    }
}

