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
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";

    // Hide or show the details element based on the active tab
    let moodleDropdown = document.getElementById("moodleDropdown");

    if (moodleDropdown) {
        if (cityName === "t-konto" || cityName === "buchungssatz" || cityName === "vorkontierung" || cityName === "einkauf" || cityName === "verkauf") {
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
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
             elmnt.innerHTML = this.responseText;
             // Inline-Skripte in eingefügtem HTML ausführen
             elmnt.querySelectorAll('script').forEach(function (s) {
               var ns = document.createElement('script');
               if (s.src) ns.src = s.src; else ns.textContent = s.textContent;
               document.head.appendChild(ns);
             });
           }
            if (this.status == 404) {elmnt.textContent = "Page not found.";}
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        }
        xhttp.open("GET", file + "?t=" + Date.now(), true);
        xhttp.send();
        return;
      }
    }
  };

   // Konfigurationsoptionen für html2canvas
   const optionshtml2canvas = {
    scale: 2, // Maßstab für die Ausgabeauflösung
  };
(function () {
  const mq = window.matchMedia('(max-width: 768px)');

  document.addEventListener('click', e => {
    // Hamburger
    const toggle = e.target.closest('.nav-toggle');
    if (toggle) {
      const nav = document.querySelector('.navbar');
      if (!nav) return;
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      return;
    }

    // Dropdowns per Klick (nur mobil)
    const btn = e.target.closest('.navbar .dropbtn, .navbar .sub-dropbtn');
    if (btn && mq.matches) {
      e.preventDefault();
      const parent = btn.parentElement;   // .dropdown bzw. .dropdown-sub
      [...parent.parentElement.children].forEach(s => {
        if (s !== parent) s.classList.remove('open');
      });
      parent.classList.toggle('open');
    }
  });

  // Beim Wechsel auf Desktop alles zurücksetzen
  mq.addEventListener('change', () => {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    nav.classList.remove('open');
    nav.querySelectorAll('.open').forEach(el => el.classList.remove('open'));
  });
})();

// Auto-include von navigation.html / footer.html (w3-include-html)
(function autoInclude() {
  const run = () => { try { includeHTML(); } catch (e) { /* ignore */ } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();

// Auto-Klick auf #defaultOpen (z. B. Hilfe-Seite: ersten Tab beim Laden aktivieren)
(function autoDefaultOpen() {
  const run = () => {
    const el = document.getElementById('defaultOpen');
    if (el && typeof el.click === 'function') el.click();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();


// Modellunternehmen-Anzeige in der Navigation (ehemals Inline-Script in navigation.html)
(function () {
  function upd() {
    var el = document.getElementById("modellunternehmenAnzeige");
    if (!el) return;
    var name = (localStorage.getItem('myCompany') || '').trim();
    if (name) {
      el.innerHTML = 'Modellunternehmen: <strong>' + name + '</strong>';
      el.style.background = '--accent-color';
      el.style.color = '#fff';
      el.style.fontSize = '14px';
    } else {
      el.innerHTML = '<a href="index.html#modellunternehmen" style="color:#5a4500; text-decoration: underline; font-weight: 600; font-size: 14px;">kein Modellunternehmen - hier auswaehlen</a>';
      el.style.background = 'rgba(255, 193, 7, 0.35)';
      el.style.color = '#5a4500';
      el.style.fontSize = '14px';
    }
  }
  const tryRun = () => {
    if (document.getElementById('modellunternehmenAnzeige')) {
      upd();
      setInterval(upd, 2000);
      window.addEventListener('storage', function (e) { if (e.key === 'myCompany') upd(); });
    } else {
      setTimeout(tryRun, 200);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryRun, { once: true });
  else tryRun();
})();
