function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  var target = document.getElementById(cityName);
  if (target) target.style.display = "block";
  // Aktiven Tab markieren (evt kann null sein, z. B. Aufruf über das
  // Mobile-Dropdown) → dann per data-on-click den passenden Button suchen.
  if (evt && evt.currentTarget) {
    evt.currentTarget.className += " active";
  } else {
    for (i = 0; i < tablinks.length; i++) {
      var dc = tablinks[i].getAttribute("data-on-click") || "";
      if (dc.indexOf('"' + cityName + '"') !== -1) {
        tablinks[i].className += " active";
        break;
      }
    }
  }
  // Mobile-Dropdown synchronisieren
  var dd = document.getElementById("tabDropdown");
  if (dd) dd.value = cityName;

  // Hide or show the details element based on the active tab
  let moodleDropdown = document.getElementById("moodleDropdown");

  if (moodleDropdown) {
    if (
      cityName === "t-konto" ||
      cityName === "buchungssatz" ||
      cityName === "vorkontierung" ||
      cityName === "einkauf" ||
      cityName === "verkauf"
    ) {
      moodleDropdown.style.display = "block";
    } else {
      moodleDropdown.style.display = "none";
    }
  } else {
  }
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      if (/[^a-zA-Z0-9_\-./]/.test(file)) continue;
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = this.responseText;
            // Inline-Skripte in eingefügtem HTML ausführen
            elmnt.querySelectorAll("script").forEach(function (s) {
              var ns = document.createElement("script");
              if (s.src) ns.src = s.src;
              else ns.textContent = s.textContent;
              document.head.appendChild(ns);
            });
          }
          if (this.status == 404) {
            elmnt.textContent = "Page not found.";
          }
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      };
      xhttp.open("GET", file + "?t=" + Date.now(), true);
      xhttp.send();
      return;
    }
  }
}

// Konfigurationsoptionen für html2canvas
const optionshtml2canvas = {
  scale: 2, // Maßstab für die Ausgabeauflösung
};
(function () {
  const mq = window.matchMedia("(max-width: 768px)");

  document.addEventListener("click", (e) => {
    // Hamburger
    const toggle = e.target.closest(".nav-toggle");
    if (toggle) {
      const nav = document.querySelector(".navbar");
      if (!nav) return;
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      return;
    }

    // Dropdowns per Klick (nur mobil)
    const btn = e.target.closest(".navbar .dropbtn, .navbar .sub-dropbtn");
    if (btn && mq.matches) {
      e.preventDefault();
      const parent = btn.parentElement; // .dropdown bzw. .dropdown-sub
      [...parent.parentElement.children].forEach((s) => {
        if (s !== parent) s.classList.remove("open");
      });
      parent.classList.toggle("open");
    }
  });

  // Beim Wechsel auf Desktop alles zurücksetzen
  mq.addEventListener("change", () => {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    nav.classList.remove("open");
    nav.querySelectorAll(".open").forEach((el) => el.classList.remove("open"));
  });
})();

// Auto-include von navigation.html / footer.html (w3-include-html)
(function autoInclude() {
  const run = () => {
    try {
      includeHTML();
    } catch (e) {
      /* ignore */
    }
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();

// Mobile-Tab-Dropdown (belege.html): aus den .tab-Buttons befüllen
(function initTabDropdown() {
  const run = () => {
    const dd = document.getElementById("tabDropdown");
    const nav = document.querySelector("nav.tab");
    if (!dd || !nav) return;
    if (dd.options.length > 0) return; // nicht doppelt befüllen
    const buttons = Array.from(nav.querySelectorAll("button.tablinks"));
    buttons.forEach((btn) => {
      let city = "";
      try {
        const spec = JSON.parse(btn.getAttribute("data-on-click") || "[]");
        const call = Array.isArray(spec) ? spec[0] : null;
        if (call && call.fn === "openCity" && Array.isArray(call.args))
          city = call.args[1] || "";
      } catch (e) {}
      if (!city) return;
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = (btn.textContent || "").trim();
      dd.appendChild(opt);
    });
    dd.addEventListener("change", () => {
      if (dd.value) openCity(null, dd.value);
    });
    // Aktiven Tab (falls openCity bereits lief) spiegeln
    const active = nav.querySelector("button.tablinks.active");
    if (active) {
      try {
        const spec = JSON.parse(active.getAttribute("data-on-click") || "[]");
        const city = (spec[0] && spec[0].args && spec[0].args[1]) || "";
        if (city) dd.value = city;
      } catch (e) {}
    }
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();

// Auto-Klick auf #defaultOpen (z. B. Hilfe-Seite: ersten Tab beim Laden aktivieren)
(function autoDefaultOpen() {
  const run = () => {
    const el = document.getElementById("defaultOpen");
    if (el && typeof el.click === "function") el.click();
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();

// Modellunternehmen-Anzeige in der Navigation (ehemals Inline-Script in navigation.html)
(function () {
  function upd() {
    var el = document.getElementById("modellunternehmenAnzeige");
    if (!el) return;
    var name = (localStorage.getItem("myCompany") || "").trim();
    if (name) {
      el.innerHTML = "Modellunternehmen: <strong>" + name + "</strong>";
      // Gültige CSS-Zuweisung (vorher: background = "--accent-color" → ungültig
      // und wurde verworfen → gelber Hintergrund blieb bis zum Reload).
      // #1466a6 = derselbe Wert wie der Inline-Style in navigation.html.
      el.style.background = "#1466a6";
      el.style.color = "#fff";
      el.style.fontSize = "14px";
    } else {
      el.innerHTML =
        '<a href="index.html#modellunternehmen" style="color:#5a4500; text-decoration: underline; font-weight: 600; font-size: 14px;">kein Modellunternehmen - hier auswaehlen</a>';
      el.style.background = "rgba(255, 193, 7, 0.35)";
      el.style.color = "#5a4500";
      el.style.fontSize = "14px";
    }
  }
  const tryRun = () => {
    if (document.getElementById("modellunternehmenAnzeige")) {
      upd();
      setInterval(upd, 2000);
      window.addEventListener("storage", function (e) {
        if (e.key === "myCompany") upd();
      });
    } else {
      setTimeout(tryRun, 200);
    }
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", tryRun, { once: true });
  else tryRun();
})();

// Seitenaufruf-Zaehler (ehemals Inline-Script in footer.html)
(function () {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "";
  if (isLocal) return;
  const aktuelleSeite = window.location.pathname || "/";
  fetch(
    "https://fdagner.de/counter.php?page=" + encodeURIComponent(aktuelleSeite),
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Zaehler aktualisiert:", data);
    })
    .catch((error) => {
      console.log("Zaehler konnte nicht geladen werden");
    });
})();
