        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const dropZoneText = document.getElementById('dropZoneText');

        // Klick → Dateidialog öffnen
        dropZone.addEventListener('click', () => fileInput.click());

        // Drag-over → visuelles Feedback
        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = 'var(--accent-color)';
          dropZone.style.background = '#f0f8ff';
          dropZoneText.textContent = 'Loslassen zum Hochladen';
        });

        // Drag-leave → zurücksetzen
        dropZone.addEventListener('dragleave', () => {
          dropZone.style.borderColor = '#ccc';
          dropZone.style.background = 'white';
          dropZoneText.textContent = 'Datei hierher ziehen oder klicken';
        });

        // Drop → Datei übernehmen und verarbeiten
        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#ccc';
          dropZone.style.background = 'white';
          dropZoneText.textContent = 'Datei hierher ziehen oder klicken';

          const files = e.dataTransfer.files;
          if (files.length > 0) {
            fileInput.files = files;
            handleFileUpload();           // Deine Upload-Funktion aufrufen
            dropZoneText.textContent = 'Hochgeladen: ' + files[0].name;
          }
        });

function updateLocalStorageStatus(status) {
          document.getElementById('localStorageStatus').textContent = status;
        }

        function loadUploadedDataFromLocalStorage() {
          const uploadedDataJSON = localStorage.getItem('uploadedYamlCompanyData');
          if (uploadedDataJSON) {
            updateLocalStorageStatus('Daten werden aus dem Browserspeicher verwendet.');
            try {
              const uploadedData = JSON.parse(uploadedDataJSON);
              // Verarbeiten Sie die geladenen Daten
            } catch (error) {
              console.error("Error parsing uploaded data from Local Storage:", error);
            }
          } else {
            updateLocalStorageStatus('Standarddaten werden verwendet.');
          }
        }

        // Rufen Sie die Funktion zum Laden der Daten aus dem Local Storage auf
        loadUploadedDataFromLocalStorage();

let slideIndex = 1;
      let autoTimer;                  // für das automatische Intervall

      showSlides(slideIndex);

      // Manuelle Weiter-/Zurück-Navigation
      function plusSlides(n) {
        clearTimeout(autoTimer);    // Automatik stoppen
        showSlides(slideIndex += n);
        startAuto();                // danach wieder automatisch starten
      }

      // Direkt zu einer bestimmten Folie springen (falls du Dots/Punkte hast – sonst ignorierbar)
      function currentSlide(n) {
        clearTimeout(autoTimer);
        showSlides(slideIndex = n);
        startAuto();
      }

      function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName("mySlides");

        if (n > slides.length) { slideIndex = 1; }
        if (n < 1) { slideIndex = slides.length; }

        for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
        }

        slides[slideIndex - 1].style.display = "block";
      }

      // Automatik starten / neu starten
      function startAuto() {
        autoTimer = setTimeout(() => {
          plusSlides(1);          // nächste Folie
        }, 3000);                   // 3000 ms = 3 Sekunden
      }

      startAuto();                    // beim Laden sofort starten
