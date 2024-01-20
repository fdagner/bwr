  // Select the drop-down menu
  const kontoAuswahlRadio = document.getElementById('kontoAuswahl');
  const svgKonto = document.getElementById('svgKonto');
  
  // Select the container for the Kontenplan
  const dragContainer = document.getElementById('dragContainer');
  
  // Select the container for radio options
  const radioOptionsContainer = document.getElementById('radioOptionsContainer');
  
  // Fill the drop-down menu with the accounts from the YAML file and create radio options
  parsedData.konten.forEach(konto => {
    const option = document.createElement('option');
    option.value = konto.value_number + " " + konto.value_account;
    option.text = konto.label;
    kontoAuswahlSelect.appendChild(option);
  
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