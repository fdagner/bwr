// js/company-loader.js
// Zentrale, globale Ladelogik für Modellunternehmen + eigene Unternehmen.
// Wird einmal pro Seite eingebunden (nach js-yaml.min.js, vor dem Seiten-Skript).
// Stellt global bereit: yamlData (Array), getUserCompanies, saveUserCompanies,
// mergeUserCompaniesIntoYamlData, getCompanyByName, refreshCompanies, companiesReady.
// Feuert das Event 'yamlDataLoaded' auf document, sobald die Daten bereit sind.

var yamlData = [];

(function () {
  "use strict";

  function unternehmenSchluessel(c) {
    return (
      String(c?.unternehmen?.id ?? "") +
      "|" +
      String(c?.unternehmen?.name ?? "")
        .trim()
        .toLowerCase()
    );
  }
  function existiertInCore(unternehmen, coreData) {
    const s = unternehmenSchluessel(unternehmen);
    const name = String(unternehmen?.unternehmen?.name ?? "")
      .trim()
      .toLowerCase();
    return (coreData || []).some(
      (c) =>
        unternehmenSchluessel(c) === s ||
        String(c?.unternehmen?.name ?? "")
          .trim()
          .toLowerCase() === name,
    );
  }
  function dedupliziere(liste) {
    const seen = new Set();
    const out = [];
    for (const c of liste || []) {
      const key = unternehmenSchluessel(c);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }

  function getUserCompanies() {
    const stored = localStorage.getItem("userCompanies");
    if (!stored) return [];
    try {
      return JSON.parse(stored) || [];
    } catch (e) {
      return [];
    }
  }
  function saveUserCompanies(companies) {
    localStorage.setItem("userCompanies", JSON.stringify(companies || []));
  }

  async function fetchCore() {
    try {
      const resp = await fetch("js/unternehmen.yml?v=" + Date.now());
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const text = await resp.text();
      const coreData = jsyaml.load(text) || [];
      try {
        sessionStorage.setItem("standardYamlData", JSON.stringify(coreData));
      } catch (e) {}
      try {
        localStorage.setItem("standardYamlData", JSON.stringify(coreData));
      } catch (e) {}
      return coreData;
    } catch (err) {
      console.warn(
        "Core-YAML konnte nicht frisch geladen werden, Fallback auf Cache",
        err,
      );
      try {
        const s =
          sessionStorage.getItem("standardYamlData") ||
          localStorage.getItem("standardYamlData");
        return s ? JSON.parse(s) || [] : [];
      } catch (e) {
        return [];
      }
    }
  }

  async function loadUploaded(coreData) {
    const uploadedJSON = localStorage.getItem("uploadedYamlCompanyData");
    if (!uploadedJSON) return [];
    let uploaded;
    try {
      uploaded = JSON.parse(uploadedJSON);
    } catch (e) {
      localStorage.removeItem("uploadedYamlCompanyData");
      return [];
    }
    if (!Array.isArray(uploaded)) return [];
    const verwendeteIds = new Set(coreData.map((c) => c?.unternehmen?.id));
    const zusaetzliche = [];
    for (const u of uploaded) {
      if (existiertInCore(u, coreData)) continue; // exaktes Duplikat
      if (verwendeteIds.has(u?.unternehmen?.id)) {
        const maxId = Math.max(
          0,
          ...[...coreData, ...zusaetzliche].map(
            (c) => Number(c?.unternehmen?.id) || 0,
          ),
        );
        let neueId = maxId + 1;
        while (
          verwendeteIds.has(neueId) ||
          zusaetzliche.some((x) => x?.unternehmen?.id === neueId)
        )
          neueId++;
        const copy = JSON.parse(JSON.stringify(u));
        if (copy.unternehmen) copy.unternehmen.id = neueId;
        verwendeteIds.add(neueId);
        zusaetzliche.push(copy);
      } else {
        verwendeteIds.add(u?.unternehmen?.id);
        zusaetzliche.push(u);
      }
    }
    if (zusaetzliche.length === 0) {
      localStorage.removeItem("uploadedYamlCompanyData");
    } else {
      localStorage.setItem(
        "uploadedYamlCompanyData",
        JSON.stringify(zusaetzliche),
      );
    }
    return zusaetzliche;
  }

  function mergeUserCompaniesIntoYamlData() {
    const userCompanies = getUserCompanies();
    if (userCompanies.length === 0) return;
    userCompanies.forEach((c) => {
      c._isUserCompany = true;
    });
    const base = yamlData.filter((c) => !c._isUserCompany);
    yamlData = [...base, ...userCompanies];
    window.yamlData = yamlData;
  }

  let readyPromise = null;
  let loaded = false;

  async function init() {
    const coreData = await fetchCore();
    const zusaetzliche = await loadUploaded(coreData);
    yamlData = dedupliziere([...coreData, ...zusaetzliche]);
    window.yamlData = yamlData;
    // Eigene Unternehmen anhängen
    const userCompanies = getUserCompanies();
    if (userCompanies.length > 0) {
      userCompanies.forEach((c) => {
        c._isUserCompany = true;
      });
      const base = yamlData.filter((c) => !c._isUserCompany);
      yamlData = [...base, ...userCompanies];
      window.yamlData = yamlData;
    }
    loaded = true;
    // Diagnose-Log: wie viele, welche, eigene, gespeichertes Modellunternehmen
    try {
      showCompanyInfo();
    } catch (e) {
      console.warn("company-loader log fehlgeschlagen", e);
    }
    try {
      document.dispatchEvent(new Event("yamlDataLoaded"));
    } catch (e) {}
    return yamlData;
  }

  function showCompanyInfo() {
    const userCompanies = getUserCompanies();
    const myCompany = (localStorage.getItem("myCompany") || "").trim();
    console.log("[company-loader] Unternehmen geladen:", yamlData.length);
    console.log(
      "[company-loader] Eigene Unternehmen (" + userCompanies.length + "):",
      userCompanies.map((c) => c?.unternehmen?.name).filter(Boolean),
    );
    console.log(
      "[company-loader] Gespeichertes Modellunternehmen (myCompany):",
      myCompany || "(keines)",
    );
    const liste = yamlData.map((c) =>
      (
        c?.unternehmen?.id +
        " " +
        c?.unternehmen?.name +
        " " +
        (c?.unternehmen?.rechtsform || "")
      ).trim(),
    );
    console.log("[company-loader] Liste:", liste);
    return {
      count: yamlData.length,
      userCompanies: userCompanies
        .map((c) => c?.unternehmen?.name)
        .filter(Boolean),
      myCompany: myCompany || null,
      list: liste,
    };
  }
  function getCompanies() {
    return yamlData;
  }
  function getCompanyByName(name) {
    return (yamlData || []).find((c) => c?.unternehmen?.name === name);
  }
  function isLoaded() {
    return loaded;
  }
  function companiesReady() {
    if (!readyPromise) readyPromise = init();
    return readyPromise;
  }
  async function refreshCompanies() {
    readyPromise = null;
    await companiesReady();
  }

  // Back-compat: no-op loaders für Seiten, die sie noch aufrufen
  function loadYamlFromLocalStorage() {
    return loaded;
  }
  function loadDefaultYaml() {
    /* handled by loader */
  }

  // Globals exponieren
  window.BwRCompanies = {
    getCompanies,
    getCompanyByName,
    getUserCompanies,
    saveUserCompanies,
    mergeUserCompaniesIntoYamlData,
    refreshCompanies,
    companiesReady,
    isLoaded,
    showCompanyInfo,
  };
  window.showCompanyInfo = showCompanyInfo;
  window.getUserCompanies = getUserCompanies;
  window.saveUserCompanies = saveUserCompanies;
  window.mergeUserCompaniesIntoYamlData = mergeUserCompaniesIntoYamlData;
  window.getCompanyByName = getCompanyByName;
  window.refreshCompanies = refreshCompanies;
  window.companiesReady = companiesReady;
  window.loadYamlFromLocalStorage = loadYamlFromLocalStorage;
  window.loadDefaultYaml = loadDefaultYaml;

  // Auto-Start
  readyPromise = init();
})();
