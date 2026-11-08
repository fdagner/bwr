// Funktion zum Generieren von zufälligen Beträgen zwischen min und max, gerundet auf volle Hundert
function getRandomAmount_100(min, max) {
  let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(randomValue / 100) * 100; // Runden auf volle Hundert
}

function getRandomAmount_1000(min, max) {
  let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(randomValue / 1000) * 1000; // Runden auf volle Tausend
}

function getRandomAmount_1(min, max) {
  let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(randomValue); // Runden auf voller einer
}

// Funktion zum Generieren einer zufälligen Zahl zwischen min und max
function getRandomYears(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; // Zufällige Jahre generieren
}

// Funktion, um die Anschaffungskosten zu setzen, wobei die beiden Werte nahe beieinander liegen
function setAnschaffungskosten() {
  // Generiere den Betrag für Anlage I
  let anlageI = getRandomAmount_1000(30000, 300000);
  let quantity =
    getRandomAmount_100((anlageI / 100) * 0.5, (anlageI / 100) * 1.25) * 100;
  let personalI = getRandomAmount_100(15000, 30000) / 100000;
  let materialI = getRandomAmount_100(15000, 30000) / 100000;
  let energyI = getRandomAmount_100(5000, 15000) / 100000;
  let variableI = getRandomAmount_1000(anlageI * 0.05, anlageI * 0.1);
  let fixI = getRandomAmount_1000(anlageI * 0.05, anlageI * 0.1);
  let interest = getRandomAmount_1(2, 6);

  // Generiere den Betrag für Anlage II, der maximal von Anlage I abweicht
  let abweichung = getRandomAmount_100(-10000, 10000);
  let abweichung2 = getRandomAmount_1000(-10000, 10000);
  let anlageII = anlageI + abweichung;
  let personalII = personalI + abweichung / 2 / 100000;
  let materialII = materialI + abweichung / 2 / 100000;
  let energyII = energyI + abweichung / 2 / 100000;
  let variableII = variableI + abweichung2;
  let fixII = fixI + abweichung2;

  // Sicherstellen, dass der Betrag für Anlage II im Bereich von 30.000 bis 300.000 bleibt
  if (anlageII < 30000) {
    anlageII = 30000;
  } else if (anlageII > 300000) {
    anlageII = 300000;
  }

  // Sicherstellen, dass der Betrag für Personal II im Bereich von 0.15 bis 0.30 bleibt
  if (personalII < 0.15) {
    personalII = 0.15;
  } else if (personalII > 0.3) {
    personalII = 0.3;
  }

  // Sicherstellen, dass der Betrag für Material II im Bereich von 0.15 bis 0.30 bleibt
  if (materialII < 0.1) {
    materialII = 0.1;
  } else if (materialII > 0.4) {
    materialII = 0.4;
  }

  // Sicherstellen, dass der Betrag für Enregie II im Bereich von 0.05 bis 0.15 bleibt
  if (energyII < 0.05) {
    energyII = 0.05;
  } else if (energyII > 0.15) {
    energyII = 0.15;
  }

  // Sicherstellen, dass der Betrag für Variable II im Bereich bleibt
  if (variableII < Math.round(anlageI / 100 / 1000) * 1000) {
    variableII = variableI;
  } else if (variableII > Math.round(anlageI / 10 / 1000) * 1000) {
    variableII = variableI;
  }

  // Sicherstellen, dass der Betrag für Fix II im Bereich von 1000 bis 10000 bleibt
  if (fixII < Math.round(anlageI / 100 / 1000) * 1000) {
    fixII = fixI;
  } else if (fixII > Math.round(anlageI / 10 / 1000) * 1000) {
    fixII = fixI;
  }

  // Generiere eine zufällige Nutzungsdauer zwischen 5 und 10 Jahren
  let nutzungsdauer = getRandomYears(5, 10);

  let costI = parseFloat(
    personalI + materialI + energyI + variableI / quantity + fixI / quantity,
  );
  let costII = parseFloat(
    personalII +
      materialII +
      energyII +
      variableII / quantity +
      fixII / quantity,
  );
  let minSell = Math.min(costI, costII);
  let sell = getRandomAmount_1(minSell * 1.25, minSell * 1.75);
  profitI = sell - costI;
  profitII = sell - costII;

  AmortationAbschreibungI = anlageI / nutzungsdauer.toFixed(2);
  AmortationAbschreibungII = anlageII / nutzungsdauer.toFixed(2);
  AmortationZinsenI = (anlageI * interest) / (2 * 100).toFixed(2);
  AmortationZinsenII = (anlageII * interest) / (2 * 100).toFixed(2);
  AmortationGewinnI = quantity * profitI.toFixed(2);
  AmortationGewinnII = quantity * profitII.toFixed(2);
  AmortationZeitI =
    anlageI / (AmortationAbschreibungI + AmortationZinsenI + AmortationGewinnI);
  AmortationZeitII =
    anlageI /
    (AmortationAbschreibungII + AmortationZinsenII + AmortationGewinnII);
  VergleichSummeFixI = AmortationAbschreibungI + AmortationZinsenI + fixI;
  VergleichSummeFixII = AmortationAbschreibungII + AmortationZinsenII + fixII;
  VergleichPersonalI = quantity * personalI.toFixed(2);
  VergleichPersonalII = quantity * personalII.toFixed(2);
  VergleichMaterialI = quantity * materialI.toFixed(2);
  VergleichMaterialII = quantity * materialII.toFixed(2);
  VergleichEnergieI = quantity * energyI.toFixed(2);
  VergleichEnergieII = quantity * energyII.toFixed(2);
  VergleichSummeVariableI =
    VergleichPersonalI + VergleichMaterialI + VergleichEnergieI + variableI;
  VergleichSummeVariableII =
    VergleichPersonalII + VergleichMaterialII + VergleichEnergieII + variableII;
  VergleichGesamtkostenI = VergleichSummeVariableI + VergleichSummeFixI;
  VergleichGesamtkostenII = VergleichSummeVariableII + VergleichSummeFixII;

  // Die Beträge in der Tabelle aktualisieren
  document.getElementById("anlageI").innerText = anlageI.toLocaleString(
    "de-DE",
    { style: "currency", currency: "EUR" },
  );
  document.getElementById("anlageII").innerText = anlageII.toLocaleString(
    "de-DE",
    { style: "currency", currency: "EUR" },
  );
  document.getElementById("AmortationAnschaffungskostenI").innerText =
    anlageI.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  document.getElementById("AmortationAnschaffungskostenII").innerText =
    anlageII.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  document.getElementById("VergleichAnschaffungskostenI").innerText =
    anlageI.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  document.getElementById("VergleichAnschaffungskostenII").innerText =
    anlageII.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  document.getElementById("nutzungsdauerI").innerText =
    nutzungsdauer + " Jahre";
  document.getElementById("nutzungsdauerII").innerText =
    nutzungsdauer + " Jahre";
  document.getElementById("AmortationNutzungsdauerI").innerText =
    nutzungsdauer + " Jahre";
  document.getElementById("AmortationNutzungsdauerII").innerText =
    nutzungsdauer + " Jahre";
  document.getElementById("VergleichNutzungsdauerI").innerText =
    nutzungsdauer + " Jahre";
  document.getElementById("VergleichNutzungsdauerII").innerText =
    nutzungsdauer + " Jahre";
  document.getElementById("quantityI").innerText =
    quantity.toLocaleString("de-DE").replace(/\./g, " ") + " Teile/Jahr";
  document.getElementById("quantityII").innerText =
    quantity.toLocaleString("de-DE").replace(/\./g, " ") + " Teile/Jahr";
  document.getElementById("personalI").innerText =
    personalI.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) +
    " /Stück";
  document.getElementById("personalII").innerText =
    personalII.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) +
    " /Stück";
  document.getElementById("materialI").innerText =
    materialI.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) +
    " /Stück";
  document.getElementById("materialII").innerText =
    materialII.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) +
    " /Stück";
  document.getElementById("energyI").innerText =
    energyI.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) +
    " /Stück";
  document.getElementById("energyII").innerText =
    energyII.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) +
    " /Stück";
  document.getElementById("variableI").innerText = variableI.toLocaleString(
    "de-DE",
    { style: "currency", currency: "EUR" },
  );
  document.getElementById("variableII").innerText = variableII.toLocaleString(
    "de-DE",
    { style: "currency", currency: "EUR" },
  );
  document.getElementById("VergleichVariableI").innerText =
    variableI.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  document.getElementById("VergleichVariableII").innerText =
    variableII.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  document.getElementById("fixI").innerText = fixI.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
  document.getElementById("fixII").innerText = fixII.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
  document.getElementById("VergleichFixI").innerText = fixI.toLocaleString(
    "de-DE",
    { style: "currency", currency: "EUR" },
  );
  document.getElementById("VergleichFixII").innerText = fixII.toLocaleString(
    "de-DE",
    { style: "currency", currency: "EUR" },
  );
  document.getElementById("interestI").innerText =
    interest.toLocaleString("de-DE").replace(/\./g, " ") + " %";
  document.getElementById("interestII").innerText =
    interest.toLocaleString("de-DE").replace(/\./g, " ") + " %";
  document.getElementById("profitI").innerText = profitI.toLocaleString(
    "de-DE",
    { style: "currency", currency: "EUR" },
  );
  document.getElementById("profitII").innerText = profitII.toLocaleString(
    "de-DE",
    { style: "currency", currency: "EUR" },
  );
  document.getElementById("AmortationAbschreibungI").innerText =
    AmortationAbschreibungI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("AmortationAbschreibungII").innerText =
    AmortationAbschreibungII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichAbschreibungI").innerText =
    AmortationAbschreibungI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichAbschreibungII").innerText =
    AmortationAbschreibungII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("AmortationZinsenI").innerText =
    AmortationZinsenI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("AmortationZinsenII").innerText =
    AmortationZinsenII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichZinsenI").innerText =
    AmortationZinsenI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichZinsenII").innerText =
    AmortationZinsenII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("AmortationGewinnI").innerText =
    AmortationGewinnI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("AmortationGewinnII").innerText =
    AmortationGewinnII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("AmortationZeitI").innerText =
    AmortationZeitI.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  document.getElementById("AmortationZeitII").innerText =
    AmortationZeitII.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  document.getElementById("VergleichSummeFixI").innerText =
    VergleichSummeFixI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichSummeFixII").innerText =
    VergleichSummeFixII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichPersonalI").innerText =
    VergleichPersonalI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichPersonalII").innerText =
    VergleichPersonalII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichPersonalI").innerText =
    VergleichPersonalI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichPersonalII").innerText =
    VergleichPersonalII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichMaterialI").innerText =
    VergleichMaterialI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichMaterialII").innerText =
    VergleichMaterialII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichEnergieI").innerText =
    VergleichEnergieI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichEnergieII").innerText =
    VergleichEnergieII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichSummeVariableI").innerText =
    VergleichSummeVariableI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichSummeVariableII").innerText =
    VergleichSummeVariableII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichGesamtkostenI").innerText =
    VergleichGesamtkostenI.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  document.getElementById("VergleichGesamtkostenII").innerText =
    VergleichGesamtkostenII.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
}

// Sobald die Seite geladen wird, die Werte setzen
window.onload = function () {
  setAnschaffungskosten();
};

function investitionsrechnungHerunterladen() {
  const investitionsrechnungHTML = document.getElementById(
    "investitionsrechnungContainer",
  ).innerHTML;
  const blob = new Blob([investitionsrechnungHTML], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "investitionsrechnung.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function investitionsrechnungKopiereInZwischenablage() {
  const investitionsrechnungHTML = document.getElementById(
    "investitionsrechnungContainer",
  ).innerHTML;
  navigator.clipboard
    .writeText(investitionsrechnungHTML)
    .then(() => zeigeModal("Code wurde in die Zwischenablage kopiert"))
    .catch((err) =>
      console.error("Fehler beim Kopieren in die Zwischenablage:", err),
    );
}

function investitionsrechnungHerunterladenAlsPNG() {
  const investitionsrechnungContainer = document.getElementById(
    "investitionsrechnungContainer",
  );

  html2canvas(investitionsrechnungContainer, optionshtml2canvas).then(
    (canvas) => {
      const dataURL = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = "investitionsrechnung.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  );
}

let clipboardInvestitionsrechnung = new ClipboardJS(
  "#officeButtonInvestitionsrechnung",
);

clipboardInvestitionsrechnung.on("success", function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  zeigeModal("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardInvestitionsrechnung.on("error", function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  zeigeModal("Fehler beim Kopieren der Tabelle.");
});
