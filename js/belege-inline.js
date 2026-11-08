document.addEventListener("DOMContentLoaded", () => {
  ["umsatzsteuerInput", "quittungUSTInput", "kassenbonUSTInput"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.value = UST_REGEL;
    },
  );
});

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);

  for (const [key, value] of params) {
    const field = document.getElementById(key + "Input");
    if (field) {
      field.value = decodeURIComponent(value).replace(/<[^>]*>/g, "");
    }
  }

  // Automatisch Beleg generieren
  if (typeof applyOrderData === "function") {
    setTimeout(() => applyOrderData(), 500);
  }
});

// Eingabefelder je nach Bescheidart ein-/ausblenden
function updateFields() {
  const sel = document.getElementById("svgDropdownBescheid").value;
  const grund = sel === "bescheid1.svg";
  const kfz = sel === "bescheid4.svg";
  document.getElementById("bescheidGrundsteuer").style.display = grund
    ? "block"
    : "none";
  document.getElementById("bescheidAbfall").style.display =
    grund || kfz ? "none" : "block";
  document.getElementById("bescheidKraftfahrzeugsteuer").style.display = kfz
    ? "block"
    : "none";
}

// Live-Anzeige der berechneten (jährlichen) Frist im Formular
function bescheidKfzFristAnzeige() {
  const anzeige = document.getElementById("bescheidFristAnzeige");
  if (!anzeige) return;
  // Frist ohne Jahr, wenn kein Jahr im Beleg steht (Jahr-Feld leer
  // oder Zulassung ohne Jahr); „Skript verwenden" druckt immer ein Jahr;
  // "20.." im Jahr-Feld druckt den Platzhalter "20.." statt eines Jahres
  const scriptJahr = document.getElementById("scriptJahrBescheid");
  const jahrFeld = document.getElementById("jahrBescheid");
  const scriptAktiv = !!(scriptJahr && scriptJahr.checked);
  const jahrText = jahrFeld ? jahrFeld.value.trim() : "";
  const ohneJahr = !scriptAktiv && jahrText === "";
  const jahrAnzeige = !scriptAktiv && jahrText === "20.." ? "20.." : null;
  const fristen =
    typeof window.bescheidKfzFristen === "function"
      ? window.bescheidKfzFristen(
          document.getElementById("bescheidZulassungInput").value,
          ohneJahr,
          jahrAnzeige,
        )
      : [];
  anzeige.textContent = fristen.length
    ? `${fristen[0]}${fristen[1] ? `, danach ${fristen[1]}` : ""}`
    : "–";
}

document
  .getElementById("svgDropdownBescheid")
  .addEventListener("change", () => {
    updateFields();
    // Vorlage unmittelbar auf die gewählte Art umschalten
    if (typeof bescheidApplySVGholen === "function") {
      bescheidApplySVGholen(true);
    }
  });

// Kaufdatum: Frist-Anzeige live mitberechnen
document
  .getElementById("bescheidZulassungInput")
  .addEventListener("input", bescheidKfzFristAnzeige);

// Jahr-Feld: manuelle Änderung (auch Leeren) übernimmt der Nutzer –
// die automatische Jahr-Befüllung (Briefdatum) greift danach nicht mehr
const jahrBescheidFeld = document.getElementById("jahrBescheid");
if (jahrBescheidFeld) {
  jahrBescheidFeld.addEventListener("input", () => {
    jahrBescheidFeld.dataset.kfzUser = "1";
    delete jahrBescheidFeld.dataset.kfzAuto;
    bescheidKfzFristAnzeige();
  });
}

// Kassenbon: Artikel 2/3 nur bei Klassisch/eBon, nicht bei Taxi
const kassenbonDropdown = document.getElementById("svgDropdownKassenbon");
if (kassenbonDropdown) {
  const kassenbonArtikelSichtbar = () => {
    const taxi = kassenbonDropdown.value === "kassenbontaxi.svg";
    ["kassenbonArtikel2", "kassenbonArtikel3"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = taxi ? "none" : "";
    });
  };
  kassenbonDropdown.addEventListener("change", kassenbonArtikelSichtbar);
  window.addEventListener("load", kassenbonArtikelSichtbar);
}

// "Skript verwenden": aktuelles Jahr ins Jahr-Feld eintragen (das Feld ist
// dann gesperrt – das per SVG-Skript übergebene Jahr entspricht dem Feld)
const scriptJahrBescheidBox = document.getElementById("scriptJahrBescheid");
if (scriptJahrBescheidBox) {
  scriptJahrBescheidBox.addEventListener("change", () => {
    if (
      scriptJahrBescheidBox.checked &&
      typeof bescheidKfzFristAnzeige === "function"
    ) {
      jahrBescheidFeld.value = String(new Date().getFullYear());
      bescheidKfzFristAnzeige();
    }
  });
}

// Ersetzt BEIDE bisherigen load-Handler (addEventListener + window.onload)
window.addEventListener("load", function () {
  // Bescheidart aus URL setzen (falls gültig)
  const art = new URLSearchParams(window.location.search).get("art");
  const dropdown = document.getElementById("svgDropdownBescheid");
  if (art && Array.from(dropdown.options).some((o) => o.value === art)) {
    dropdown.value = art;
  }
  updateFields();
  // Zulassung: Standard = heutiges Datum (TT.MM.JJJJ), nur falls noch leer
  const zulassungInput = document.getElementById("bescheidZulassungInput");
  if (zulassungInput && !zulassungInput.value.trim()) {
    const heute = new Date();
    const p = (n) => String(n).padStart(2, "0");
    zulassungInput.value = `${p(heute.getDate())}.${p(
      heute.getMonth() + 1,
    )}.${heute.getFullYear()}`;
  }
  // Betrag: Standard = zufälliger Betrag 500–1500 €, nur falls noch leer
  const betragInput = document.getElementById("bescheidBetragInput");
  if (betragInput && !betragInput.value.trim()) {
    const cents = Math.round((500 + Math.random() * 1000) * 100);
    betragInput.value = (cents / 100).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  bescheidKfzFristAnzeige();
});

// Zinssatz-Einstellungen und Hinweis-Banner
(function () {
  const bannerWert = document.getElementById("mahnungBasiszinsBannerWert");
  const bannerSeit = document.getElementById("mahnungBasiszinsBannerSeit");
  const bannerB2b = document.getElementById("mahnungB2bBannerWert");
  const zinssatzInput = document.getElementById("mahnungZinssatzInput");

  // Banner-/Lade-Formatierung: deutschen Zinswert "1,52"
  const mahnungZinsText = (x) =>
    Number(x).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  function mahnungUpdateZinssatzAnzeige() {
    if (bannerWert && typeof getBasiszinssatz === "function") {
      bannerWert.textContent = mahnungZinsText(getBasiszinssatz()) + " %";
    } else if (bannerWert) {
      bannerWert.textContent = mahnungZinsText(1.52) + " %";
    }
    if (bannerSeit && typeof BASISZINSSATZ_SEIT !== "undefined") {
      bannerSeit.textContent = BASISZINSSATZ_SEIT;
    }
    if (bannerB2b && typeof verzugszinsSatz === "function") {
      bannerB2b.textContent =
        mahnungZinsText(verzugszinsSatz("unternehmen")) + " % p. a.";
    }
  }

  // Standard-Button: Zinssatz-Feld wieder auf Basiszins + 9 pp setzen
  document
    .getElementById("mahnungZinssatzStandard")
    .addEventListener("click", function () {
      if (typeof verzugszinsSatz === "function") {
        zinssatzInput.value = verzugszinsSatz("unternehmen");
      }
      if (typeof mahnungApplySVGholen === "function") mahnungApplySVGholen();
    });

  // Vorlagenwechsel: Mahnung sofort mit der neu gewählten Vorlage aufbauen
  document
    .getElementById("svgDropdownMahnung")
    ?.addEventListener("change", function () {
      if (typeof mahnungApplySVGholen === "function") mahnungApplySVGholen();
    });

  document.addEventListener("basiszinschange", function () {
    mahnungUpdateZinssatzAnzeige();
    if (
      zinssatzInput &&
      document.activeElement !== zinssatzInput &&
      typeof verzugszinsSatz === "function"
    ) {
      zinssatzInput.value = verzugszinsSatz("unternehmen");
    }
  });

  window.addEventListener("load", function () {
    // Zinssatz-Feld auf den-gültigenwert bringen
    if (zinssatzInput && typeof verzugszinsSatz === "function") {
      zinssatzInput.value = verzugszinsSatz("unternehmen");
    }
    // Datum: (Brief) mit heutigem Datum vorbelegen; Fälligkeit liegt 30 Tage zurück
    const heute = new Date();
    const iso = (d) => {
      const p = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    };
    const datumBrief = document.getElementById("mahnungRechnungsdatumInput");
    const datumFaellig = document.getElementById("mahnungFaelligkeitInput");
    if (datumFaellig && !datumFaellig.value) {
      const rueck = new Date(heute);
      rueck.setDate(rueck.getDate() - 30);
      datumFaellig.value = iso(rueck);
    }
    if (datumBrief && !datumBrief.value) {
      const rechnung = new Date(heute);
      rechnung.setDate(rechnung.getDate() - 45);
      datumBrief.value = iso(rechnung);
    }

    // Datum-Auswahl des Briefs auf aktuelles Datum setzen
    const p0 = (n) => String(n).padStart(2, "0");
    const tagSel = document.getElementById("tagMahnung");
    const monatSel = document.getElementById("monatMahnung");
    if (
      tagSel &&
      tagSel.querySelector(`option[value="${p0(new Date().getDate())}"]`)
    ) {
      tagSel.value = p0(new Date().getDate());
    }
    if (
      monatSel &&
      monatSel.querySelector(`option[value="${p0(new Date().getMonth() + 1)}"]`)
    ) {
      monatSel.value = p0(new Date().getMonth() + 1);
    }

    // Jahr des Briefs vorbelegen (aktuelles Jahr), falls leer
    const jahrInput = document.getElementById("jahrMahnung");
    if (jahrInput && !jahrInput.value) {
      jahrInput.value = String(new Date().getFullYear());
      // Falls der Beleg schon ohne Jahr gerendert wurde, neu aufbauen
      const jahrElem = document.querySelector(
        "#mahnungContainer .aktuellesJahrMahnung",
      );
      if (
        jahrElem &&
        !jahrElem.textContent &&
        typeof mahnungApplySVGholen === "function"
      ) {
        mahnungApplySVGholen();
      }
    }
    mahnungUpdateZinssatzAnzeige();
  });
})();

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem("myCompany");

  if (!myCompanyName) return;

  // Finde alle Dropdowns mit class="meinUnternehmen"
  const dropdowns = document.querySelectorAll("select.meinUnternehmen");

  dropdowns.forEach((dropdown) => {
    // Suche nach der passenden Option
    const options = Array.from(dropdown.options);
    const matchingOption = options.find((opt) => opt.value === myCompanyName);

    if (matchingOption) {
      dropdown.value = myCompanyName;

      // Trigger change event falls andere Scripts darauf reagieren
      const event = new Event("change", { bubbles: true });
      dropdown.dispatchEvent(event);

      console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
    }
  });
}

function autoSelectMyCompanyOnlyIfNeeded() {
  const company = localStorage.getItem("myCompany");
  if (!company) return;

  document.querySelectorAll("select.meinUnternehmen").forEach((select) => {
    // Nur setzen, wenn leer oder Placeholder
    if (
      !select.value ||
      select.value.trim() === "" ||
      select.value === "Bitte wählen"
    ) {
      const opt = Array.from(select.options).find(
        (o) => o.value === company || o.text === company,
      );
      if (opt) {
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeURLParameters(); // zuerst!

  // Sobald die Unternehmensdaten geladen sind (belege.js feuert 'yamlDataLoaded')
  if (
    typeof yamlData !== "undefined" &&
    yamlData?.length > 0 &&
    document.querySelector("select.meinUnternehmen")?.options.length > 0
  ) {
    autoSelectMyCompanyOnlyIfNeeded();
  } else {
    document.addEventListener(
      "yamlDataLoaded",
      () => {
        autoSelectMyCompanyOnlyIfNeeded();
      },
      { once: true },
    );
  }
});
