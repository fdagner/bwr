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
   if (cityName === "t-konto" || cityName === "buchungssatz" || cityName === "vorkontierung") {
     moodleDropdown.style.display = "block";
   } else {
     moodleDropdown.style.display = "none";
   }
 } else {
   console.error("Das Element mit der ID 'moodleDropdown' wurde nicht gefunden.");
 }

}