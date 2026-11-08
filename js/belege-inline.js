document.addEventListener('DOMContentLoaded', () => {
            ['umsatzsteuerInput', 'quittungUSTInput', 'kassenbonUSTInput'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = UST_REGEL;
            });
        });

document.addEventListener('DOMContentLoaded', function () {
            const params = new URLSearchParams(window.location.search);

            for (const [key, value] of params) {
                const field = document.getElementById(key + 'Input');
                if (field) {
                    field.value = decodeURIComponent(value).replace(/<[^>]*>/g, '');
                }
            }

            // Automatisch Beleg generieren
            if (typeof applyOrderData === 'function') {
                setTimeout(() => applyOrderData(), 500);
            }
        });

// Eingabefelder je nach Bescheidart ein-/ausblenden
            function updateFields() {
                const sel = document.getElementById("svgDropdownBescheid").value;
                const grund = sel === "bescheid1.svg";
                document.getElementById("bescheidGrundsteuer").style.display = grund ? "block" : "none";
                document.getElementById("bescheidAbfall").style.display = grund ? "none" : "block";
            }

            document.getElementById("svgDropdownBescheid").addEventListener("change", updateFields);

            // Ersetzt BEIDE bisherigen load-Handler (addEventListener + window.onload)
            window.addEventListener("load", function () {
                const art = new URLSearchParams(window.location.search).get("art");
                const dropdown = document.getElementById("svgDropdownBescheid");
                if (art && Array.from(dropdown.options).some(o => o.value === art)) {
                    dropdown.value = art;
                }
                updateFields();
            });

// Zinssatz-Einstellungen und Hinweis-Banner
            (function () {
                const bannerWert = document.getElementById('mahnungBasiszinsBannerWert');
                const bannerSeit = document.getElementById('mahnungBasiszinsBannerSeit');
                const bannerB2b = document.getElementById('mahnungB2bBannerWert');
                const zinssatzInput = document.getElementById('mahnungZinssatzInput');

                // Banner-/Lade-Formatierung: deutschen Zinswert "1,52"
                const mahnungZinsText = (x) =>
                    Number(x).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                function mahnungUpdateZinssatzAnzeige() {
                    if (bannerWert && typeof getBasiszinssatz === 'function') {
                        bannerWert.textContent = mahnungZinsText(getBasiszinssatz()) + ' %';
                    } else if (bannerWert) {
                        bannerWert.textContent = mahnungZinsText(1.52) + ' %';
                    }
                    if (bannerSeit && typeof BASISZINSSATZ_SEIT !== 'undefined') {
                        bannerSeit.textContent = BASISZINSSATZ_SEIT;
                    }
                    if (bannerB2b && typeof verzugszinsSatz === 'function') {
                        bannerB2b.textContent = mahnungZinsText(verzugszinsSatz('unternehmen')) + ' % p. a.';
                    }
                }

                // Standard-Button: Zinssatz-Feld wieder auf Basiszins + 9 pp setzen
                document.getElementById('mahnungZinssatzStandard').addEventListener('click', function () {
                    if (typeof verzugszinsSatz === 'function') {
                        zinssatzInput.value = verzugszinsSatz('unternehmen');
                    }
                    if (typeof mahnungApplySVGholen === 'function') mahnungApplySVGholen();
                });

                // Vorlagenwechsel: Mahnung sofort mit der neu gewählten Vorlage aufbauen
                document.getElementById('svgDropdownMahnung')?.addEventListener('change', function () {
                    if (typeof mahnungApplySVGholen === 'function') mahnungApplySVGholen();
                });

                document.addEventListener('basiszinschange', function () {
                    mahnungUpdateZinssatzAnzeige();
                    if (zinssatzInput && document.activeElement !== zinssatzInput &&
                        typeof verzugszinsSatz === 'function') {
                        zinssatzInput.value = verzugszinsSatz('unternehmen');
                    }
                });

                window.addEventListener('load', function () {
                    // Zinssatz-Feld auf den-gültigenwert bringen
                    if (zinssatzInput && typeof verzugszinsSatz === 'function') {
                        zinssatzInput.value = verzugszinsSatz('unternehmen');
                    }
                    // Datum: (Brief) mit heutigem Datum vorbelegen; Fälligkeit liegt 30 Tage zurück
                    const heute = new Date();
                    const iso = (d) => {
                        const p = (n) => String(n).padStart(2, '0');
                        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
                    };
                    const datumBrief = document.getElementById('mahnungRechnungsdatumInput');
                    const datumFaellig = document.getElementById('mahnungFaelligkeitInput');
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
                    const p0 = (n) => String(n).padStart(2, '0');
                    const tagSel = document.getElementById('tagMahnung');
                    const monatSel = document.getElementById('monatMahnung');
                    if (tagSel && tagSel.querySelector(`option[value="${p0(new Date().getDate())}"]`)) {
                        tagSel.value = p0(new Date().getDate());
                    }
                    if (monatSel && monatSel.querySelector(`option[value="${p0(new Date().getMonth() + 1)}"]`)) {
                        monatSel.value = p0(new Date().getMonth() + 1);
                    }

                    // Jahr des Briefs vorbelegen (aktuelles Jahr), falls leer
                    const jahrInput = document.getElementById('jahrMahnung');
                    if (jahrInput && !jahrInput.value) {
                        jahrInput.value = String(new Date().getFullYear());
                        // Falls der Beleg schon ohne Jahr gerendert wurde, neu aufbauen
                        const jahrElem = document.querySelector('#mahnungContainer .aktuellesJahrMahnung');
                        if (jahrElem && !jahrElem.textContent && typeof mahnungApplySVGholen === 'function') {
                            mahnungApplySVGholen();
                        }
                    }
                    mahnungUpdateZinssatzAnzeige();
                });
            })();

// Get the element with id="defaultOpen" and click on it
        document.getElementById("defaultOpen").click();

        function autoSelectMyCompany() {
            const myCompanyName = localStorage.getItem('myCompany');

            if (!myCompanyName) return;

            // Finde alle Dropdowns mit class="meinUnternehmen"
            const dropdowns = document.querySelectorAll('select.meinUnternehmen');

            dropdowns.forEach(dropdown => {
                // Suche nach der passenden Option
                const options = Array.from(dropdown.options);
                const matchingOption = options.find(opt => opt.value === myCompanyName);

                if (matchingOption) {
                    dropdown.value = myCompanyName;

                    // Trigger change event falls andere Scripts darauf reagieren
                    const event = new Event('change', { bubbles: true });
                    dropdown.dispatchEvent(event);

                    console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
                }
            });
        }


        function autoSelectMyCompanyOnlyIfNeeded() {
            const company = localStorage.getItem('myCompany');
            if (!company) return;

            document.querySelectorAll('select.meinUnternehmen').forEach(select => {
                // Nur setzen, wenn leer oder Placeholder
                if (!select.value || select.value.trim() === '' || select.value === 'Bitte wählen') {
                    const opt = Array.from(select.options).find(o => o.value === company || o.text === company);
                    if (opt) {
                        select.value = opt.value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            initializeURLParameters();           // zuerst!

            // Sobald die Unternehmensdaten geladen sind (belege.js feuert 'yamlDataLoaded')
            if (typeof yamlData !== 'undefined' && yamlData?.length > 0 &&
                document.querySelector('select.meinUnternehmen')?.options.length > 0) {
                autoSelectMyCompanyOnlyIfNeeded();
            } else {
                document.addEventListener('yamlDataLoaded', () => {
                    autoSelectMyCompanyOnlyIfNeeded();
                }, { once: true });
            }
        });
