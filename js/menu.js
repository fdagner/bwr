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
    var moodleDropdown = document.getElementById("moodleDropdown");
    if (cityName === "t-konto" || cityName === "buchungssatz") {
        moodleDropdown.style.display = "block";
    } else {
        moodleDropdown.style.display = "none";
    }
}