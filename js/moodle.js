// Select the container for the Kontenplan
const dragContainer = document.getElementById('dragContainer');

// Select the container for radio options
const radioOptionsContainer = document.getElementById('radioOptionsContainer');

// Fill the container with checkboxes for the accounts from the YAML file
parsedData.konten.forEach(konto => {
  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = konto.value_number + ' ' + konto.value_account;
  checkbox.id = 'konto_' + konto.value_number; // Assign a unique ID for each checkbox
  const label = document.createElement('label');
  label.htmlFor = 'konto_' + konto.value_number;
  label.appendChild(document.createTextNode(konto.label));
  
    // Create radio options for the chart of accounts
    const radioOptionContainer = document.createElement('div');
    radioOptionContainer.classList.add('radioKonto');
    const radioOption = document.createElement('input');
    radioOption.type = 'radio';
    radioOption.name = 'kontenplanOption';
    radioOption.value = konto.value_number + " " + konto.value_account;
  
    // Add event listener to add or remove %100% if selected or not selected
    radioOption.addEventListener('change', function () {
      const selectedKonto = konto.value_number;
      const existingText = dragContainer.innerText;

            // Check whether the radio button is selected
            if (this.checked) {
              // Change the fill property of the SVG
              svgKonto.setAttribute('fill', 'green');
            } else {
      
            }
  
      if (!existingText.includes(selectedKonto)) {
        console.error(`Konto ${selectedKonto} wurde nicht gefunden.`);
        return;
      }
  
      // Remove all existing %100%
      const newTextWithout100 = existingText.replace(/%100%/g, '');
  
      if (this.checked) {
        // Add %100% in front of the selected account
        const newText = newTextWithout100.replace(new RegExp(selectedKonto, 'g'), `%100%${selectedKonto}`);
        dragContainer.innerText = newText;
      } else {
        // Remove %100% from the selected account
        dragContainer.innerText = newTextWithout100;
      }
    });
  
    // Add radio option to the container
    radioOptionContainer.appendChild(radioOption);
  
    // Add account label to the container
    const kontoLabel = document.createElement('label');
    kontoLabel.innerText = konto.label;
  
    // Add radio option container and account label to the main container
    radioOptionContainer.appendChild(kontoLabel);
    radioOptionsContainer.appendChild(radioOptionContainer);
  
  });

  function handleDragStart(event) {
    const dragContainer = document.getElementById('dragContainer');
    event.dataTransfer.setData('text/plain', dragContainer.innerText);
  }

  function handleCopyClick() {
      const kontoClipboard = document.getElementById('dragContainer').innerText;
      navigator.clipboard.writeText(kontoClipboard)
          .then(() => alert('Text wurde in die Zwischenablage kopiert'))
          .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
  }

  // Select the drop-down menu for UST
const svgKontoUST = document.getElementById('svgKontoUST');

// Select the container for the Kontenplan UST
const dragContainerUST = document.getElementById('dragContainerUST');

// Select the container for radio options UST
const radioOptionsContainerUST = document.getElementById('radioOptionsContainerUST');

// Loop through UST radio options
document.querySelectorAll('input[name="USTOption"]').forEach(ustOption => {
  ustOption.addEventListener('change', function () {
    const selectedUSTOption = this.value;
    const existingTextUST = dragContainerUST.innerText;

    // Check whether the radio button is selected
    if (this.checked) {
      // Change the fill property of the SVG for UST
      svgKontoUST.setAttribute('fill', 'green');
    } else {
      // Handle case when the radio button is unchecked (if needed)
    }

    if (!existingTextUST.includes(selectedUSTOption)) {
      console.error(`UST Option ${selectedUSTOption} wurde nicht gefunden.`);
      return;
    }

    // Remove all existing %100%
    const newTextWithout100UST = existingTextUST.replace(/%100%/g, '');

    if (this.checked) {
      // Add %100% in front of the selected UST option
      const newTextUST = newTextWithout100UST.replace(new RegExp(selectedUSTOption, 'g'), `%100%${selectedUSTOption}`);
      dragContainerUST.innerText = newTextUST;
    } else {
      // Remove %100% from the selected UST option
      dragContainerUST.innerText = newTextWithout100UST;
    }
  });
});

function handleDragStartUST(event) {
  const dragContainerUST = document.getElementById('dragContainerUST');
  event.dataTransfer.setData('text/plain', dragContainerUST.innerText);
}

function handleUSTCopyClick() {
  const USTClipboard = document.getElementById('dragContainerUST').innerText;
  navigator.clipboard.writeText(USTClipboard)
      .then(() => alert('Text wurde in die Zwischenablage kopiert'))
      .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}