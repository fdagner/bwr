function getRandomInteger(min, max) {
    // Math.floor rundet die Zahl ab, um eine Ganzzahl zu erhalten
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIntegerWithSteps(min, max, step) {
    const range = (max - min) / step;
    return Math.floor(Math.random() * range) * step + min;
}


const partsOfSpeech = {
    einkauf: ['Wir kaufen ', 'Wir beziehen ', 'Unsere Firma kauft ', 'Wir erwerben ', 'Wir haben bezogen: ', 'Wir haben gekauft: '],
    einkauf_alt2: ['Kauf von ', 'Einkauf von ', 'Erwerb von ', 'Beschaffung von ', 'Bezug von '],
    einkauf_alt: ['Wir bezahlen bar: ', 'Barzahlung: ', 'Wir erhalten eine Eingangsrechnung für ', 'Es geht eine Rechnung ein über ', 'Wir haben auf Rechnung gekauft:  ', 'Wir bekommen eine Rechnung für ', 'Es wird uns eine Rechnung gestellt über ', 'Unsere Firma erhält eine Rechnung über ', 'Eine Rechnung wird an uns gesandt über '],
    werkstoffe: ['Rohstoffe', 'Hilfsstoffe', 'Betriebsstoffe', 'Fremdbauteile'],
    werkstoffe_alt: ['Rohstoffen', 'Hilfsstoffen', 'Betriebsstoffen', 'Fremdbauteilen'],
    sachanlagen: ['einen Computer', 'einen PC', 'einen Laptop', 'eine Fertigungsmaschine', 'Büromöbel', 'einen Gabelstapler', 'einen Kommissionierroboter', 'eine Prüf- und Inspektionsanlage', 'einen 3D-Drucker', 'einen gebrauchten Kleintransporter', `${getRandomInteger(2, 10)} Büroregale`, 'einen Aktenschrank', `${getRandomInteger(2, 10)} Netzwerkserver`, `${getRandomInteger(2, 10)} Kopierer`, 'eine Maschine', 'eine Produktionsmaschine', ' eine Fertigungsanlage '],
    wert: [' mit Kosten in Höhe von ', ' im Wert von ', ' mit ', ' mit einem Wert in Höhe von ', ' mit einem Betrag in Höhe von ', ' mit einem finanziellen Einsatz von ', ' im Umfang von '],
    zahlung: ['in bar', 'per Barzahlung', 'auf Rechnung', 'auf Ziel', 'per Banküberweisung', 'gegen Rechnung', 'nebst Erhalt einer Eingangsrechnung'],
    abzglRabatt: [`, abzüglich ${getRandomIntegerWithSteps(5, 20, 5)} % Treuerabatt`, `, abzüglich ${getRandomIntegerWithSteps(5, 20, 5)} % Sonderrabatt`, `. ${getRandomIntegerWithSteps(5, 20, 5)} % Rabatt können abgezogen werden`, `. Wir erhalten ${getRandomIntegerWithSteps(5, 20, 5)} % Kundenrabatt`, `. Wir erhalten ${getRandomIntegerWithSteps(5, 20, 5)} % Rabatt`,],
    begleichung: [
        'Wir begleichen die Rechnung aus dem Geschäftsfall Satz per Banküberweisung.',
        'Der Rechnungsbetrag aus dem Satz. Geschäftsfall wird per Banküberweisung beglichen.',
        'Wir bezahlen die Rechnung aus Geschäftfall Satz in bar.'
    ],

    generateNetAmount: (min, max) => {
        const amount = Math.floor(Math.random() * (max - min + 1)) + min;
        return Math.floor(amount / 100) * 100; // Runde auf ganze Hunderter
    },
    generateGrossAmount: netAmount => {
        const taxRate = 0.19; // Beispiel: 19% Mehrwertsteuer
        const grossAmount = netAmount * (1 + taxRate);
        return grossAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) // Formatierung mit Tausenderpunkt und zwei Dezimalstellen
    },
};

function generateText() {
    const getRandomElement = array => array[Math.floor(Math.random() * array.length)];
    const selectedCategory = document.querySelector('input[name="category"]:checked').value;

    const sentencesWithRechnung = [];
    const generatedListItems = [];
    const rabattCheckbox = document.getElementById('rabattCheckbox');
    const isRabattActive = rabattCheckbox.checked;

    for (let i = 1; i <= 10; i++) {
        const useEinkaufAlt = (selectedCategory === 'sachanlagen' || selectedCategory === 'werkstoffe') && Math.random() < 0.5;
        const useEinkaufAlt2 = selectedCategory === 'werkstoffe' && Math.random() < 0.5;

        let einkaufArray;

        if (useEinkaufAlt2) {
            einkaufArray = partsOfSpeech.einkauf_alt2;
        } else if (useEinkaufAlt) {
            einkaufArray = partsOfSpeech.einkauf_alt;
        } else {
            einkaufArray = partsOfSpeech.einkauf;
        }

        const einkauf = getRandomElement(einkaufArray);
        const wert = getRandomElement(partsOfSpeech.wert);

        const zahlung = (useEinkaufAlt || useEinkaufAlt2) ? '' : getRandomElement(partsOfSpeech.zahlung);

        let selectedPartOfSpeech;
        let numbersInSentence;

        if (selectedCategory === 'werkstoffe') {
            selectedPartOfSpeech = getRandomElement(partsOfSpeech[useEinkaufAlt2 ? 'werkstoffe_alt' : 'werkstoffe']);
        } else if (selectedCategory === 'sachanlagen') {
            const selectedSentence = getRandomElement(partsOfSpeech.sachanlagen);

            // Extrahiere alle Ganzzahlen aus dem Satz
            numbersInSentence = selectedSentence.match(/\b\d+\b/g);

            // Überprüfe, ob eine Zahl zwischen 2 und 10 im Satz vorhanden ist
            const hasNumberInRange = numbersInSentence && numbersInSentence.some(number => {
                const num = parseInt(number, 10);
                return num >= 2 && num <= 10;
            });

            // Füge "je" vor ${amountText} ein, wenn eine Zahl zwischen 2 und 10 vorhanden ist
            selectedPartOfSpeech = hasNumberInRange ? `${selectedSentence}` : selectedSentence;
        }

        let amount;
        let isNetAmount;
        let netAmountText;

        if (selectedCategory === 'werkstoffe') {
            amount = partsOfSpeech.generateNetAmount(100, 5000);
            isNetAmount = Math.random() < 0.5;
            netAmountText = `Listenpreis ${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} netto`;
        } else if (selectedCategory === 'sachanlagen') {
            amount = partsOfSpeech.generateNetAmount(1002, 10000);
            isNetAmount = Math.random() < 0.5;
            netAmountText = `${amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} netto`;
        }


        const grossAmount = partsOfSpeech.generateGrossAmount(amount);
        const grossAmountText = `${grossAmount} brutto`;
        const amountText = isNetAmount ? netAmountText : grossAmountText;
        let zahlungAlt2 = '';
        let hasNumberInRange = false; // Hier deklarieren

        if (useEinkaufAlt2) {
            zahlungAlt2 = ' ' + getRandomElement(partsOfSpeech.zahlung);
        }

        const generatedSentence = `${einkauf}${selectedPartOfSpeech}${zahlungAlt2}`;

        if (selectedCategory === 'sachanlagen') {
            // Überprüfe, ob eine Zahl zwischen 2 und 10 im Satz vorhanden ist
            hasNumberInRange = numbersInSentence && numbersInSentence.some(number => {
                const num = parseInt(number, 10);
                return num >= 2 && num <= 10;
            });
        }

        const amountDescription = hasNumberInRange ? `${wert}je ${amountText}` : `${wert}${amountText}`;
        const paymentDescription = `${zahlung ? ' ' + zahlung : ''}`;

        const sentenceOrder = Math.random() < 0.5 ? `${amountDescription}${paymentDescription}` : `${paymentDescription}${amountDescription}`;
        let finalSentence = `${generatedSentence} ${sentenceOrder}`;

        if (isRabattActive) {
            const rabattText = getRandomElement(partsOfSpeech.abzglRabatt);
            finalSentence += `${rabattText}`;
        }

        finalSentence += '.';
        generatedListItems.push(`<li>${finalSentence}</li>`);

        if (finalSentence.includes('Rechnung')) {
            sentencesWithRechnung.push({ index: i, sentence: finalSentence });
        }
    }

    if (sentencesWithRechnung.length > 0) {

        const begleichungListItems = sentencesWithRechnung.map(({ index }) => {
            const begleichungSentence = getRandomElement(partsOfSpeech.begleichung).replace('Satz', index);
            return `<li>${begleichungSentence}</li>`;
        });

        generatedListItems.push('', '</ol><p>Ergänzende Geschäftsfälle:</p><ol start="11">', ...begleichungListItems);
    }

    function cleanUpGeneratedText(text) {
        // Remove leading and trailing spaces
        const trimmedText = text.trim();

        // Remove multiple spaces between words
        const cleanedText = trimmedText.replace(/\s+/g, ' ');

        // Remove spaces before punctuation marks
        const finalText = cleanedText.replace(/\s*([.,;:!?])/g, '$1');

        return finalText;
    }

    const outputList = `<ol>${generatedListItems.join('')}</ol>`;
    document.getElementById('output').innerHTML = outputList;
}
