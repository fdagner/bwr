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
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.textContent = "Page not found.";}
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
        return;
      }
    }
  };

   // Konfigurationsoptionen für html2canvas
   const optionshtml2canvas = {
    scale: 2, // Maßstab für die Ausgabeauflösung
  };