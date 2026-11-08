const myList = ['0500 GR (Grundstücke)', '0530 BVG (Betriebs- und Verwaltungsgebäude)', '0700 MA (Maschinen und Anlagen)', '0840 FP (Fuhrpark)', '0860 BM (Büromaschinen)', '0870 BGA (Büromöbel und Geschäftsausstattung)', '0890 GWG (Geringwertige Wirtschaftsgüter)', '1500 WP (Wertpapiere des Anlagevermögens)', '2000 R (Rohstoffe)', '2010 F (Fremdbauteile)', '2020 H (Hilfsstoffe)', '2030 B (Betriebsstoffe)', '2400 FO (Forderungen aus Lieferungen und Leistungen)', '2470 ZWFO (Zweifelhafte Forderungen)', '2600 VORST (Vorsteuer)', '2800 BK (Bank)', '2880 KA (Kasse)', '2900 ARA (Aktive Rechnungsabgrenzung)', '3000 EK (Eigenkapital)', '3001 P (Privatkonto)', '3670 EWB (Einzelwertberichtigung)', '3680 PWB (Pauschalwertberichtigung)', '3900 RST (Rückstellungen)', '4200 KBKV (Kurzfristige Bankverbindlichkeiten)', '4250 LBKV (Langfristige Bankverbindlichkeiten)', '4400 VE (Verbindlichkeiten aus LL)', '4800 UST (Umsatzsteuer)', '4830 VFA (Sonst. Steuerverbindlichkeiten)', '4840 VSV (Verbindlichkeiten gegenüber Sozialversicherungsträgern)', '4900 PRA (Passive Rechnungsabgrenzung)', '5000 UEFE (Umsatzerlöse für eigene Erzeugnisse)', '5001 EBFE (Erlösberichtigungen)', '5400 EMP (Erlöse aus Vermietung und Verpachtung)', '5430 ASBE (Andere sonst. betriebl. Erträge)', '5490 PFE (Periodenfremde Erträge)', '5495 EFO (Erträge aus abgeschriebenen Forderungen)', '5650 EAWP (Erträge aus dem Abgang von Wertpapieren des Anlagevermögens)', '5710 ZE (Zinserträge)', '5780 DDE (Dividendenerträge)', '6000 AWR (Aufwendungen für Rohstoffe)', '6001 BZKR (Bezugskosten für Rohstoffe)', '6002 NR (Nachlässe für Rohstoffe)', '6010 AWF (Aufwendungen für Fremdbauteile)', '6011 BZKF (Bezugskosten für Fremdbauteile)', '6012 NF (Nachlässe für Fremdbauteile)', '6020 AWH (Aufwendungen für Hilfsstoffe)', '6021 BZKH (Bezugskosten für Hilfsstoffe)', '6022 NH (Nachlässe für Hilfsstoffe)', '6030 AWB (Aufwendungen für Betriebsstoffe)', '6031 BZKB (Bezugskosten für Betriebsstoffe)', '6032 NB (Nachlässe für Betriebsstoffe)', '6040 AWVM (Aufwendungen für Verpackungsmaterial)', '6140 AFR (Ausgangsfrachten)', '6160 FRI (Fremdinstandhaltung)', '6200 LG (Löhne und Gehälter)', '6400 AGASV (Arbeitgeberanteil zur Sozialversicherung)', '6520 ABSA (Abschr. auf Sachanlagen)', '6540 ABGWG (Abschreibungen auf GWG)', '6700 AWMP (Mieten, Pachten)', '6730 GEB (Gebühren)', '6750 KGV (Kosten des Geldverkehrs)', '6760 PROV (Provisionen)', '6770 RBK (Rechts- und Beratungskosten)', '6800 BMK (Büromaterial und Kleingüter)', '6820 KOM (Kommunikationsgebühren)', '6850 REK (Reisekosten)', '6870 WER (Werbung)', '6900 VBEI (Versicherungsbeiträge)', '6950 ABFO (Abschreibungen auf Forderungen)', '6990 PFAW (Periodenfremde Aufwendungen)', '7000 GWST (Gewerbesteuer)', '7020 GRST (Grundsteuer)', '7030 KFZST (Kraftfahrzeugsteuer)', '7460 VAWP (Verluste aus dem Abgang von Wertpapieren des Anlagevermögens)', '7510 ZAW (Zinsaufwendungen)', '8010 SBK (Schlussbilanzkonto)', '8020 GUV (Gewinn- und Verlustkonto)'];
        
                function filterListByFirstDigit(list, digit) {
                    const filteredList = [];
                    for (let i = 0; i < list.length; i++) {
                        if (list[i][0] === digit.toString()) {
                            filteredList.push(list[i]);
                        }
                    }
                    return filteredList;
                }
        
                function filterListByDigit(digit) {
                    const filteredList = filterListByFirstDigit(myList, digit);
                    const listContainer = document.getElementById('list-container');
                    listContainer.innerHTML = '';
                    for (let i = 0; i < filteredList.length; i++) {
                        const listItem = document.createElement('li');
                        listItem.textContent = filteredList[i];
                        listContainer.appendChild(listItem);
                    }
                }
        
                function showAllAccounts() {
                    const listContainer = document.getElementById('list-container');
                    listContainer.innerHTML = '';
                    for (let i = 0; i < myList.length; i++) {
                        const listItem = document.createElement('li');
                        listItem.textContent = myList[i];
                        listContainer.appendChild(listItem);
                    }
                }
        
                function handleDropdownChange() {
                    const selectedValue = document.getElementById('kontenplan-dropdown').value;
        
                    if (selectedValue === "all") {
                        showAllAccounts();
                    } else {
                        filterListByDigit(parseInt(selectedValue));
                    }
                }
        
                function handleSearchInput() {
                    const searchValue = document.getElementById('search-input').value.toLowerCase();
                    const filteredList = myList.filter(item => item.toLowerCase().includes(searchValue));
                    const listContainer = document.getElementById('list-container');
                    listContainer.innerHTML = '';
                    for (let i = 0; i < filteredList.length; i++) {
                        const listItem = document.createElement('li');
                        listItem.textContent = filteredList[i];
                        listContainer.appendChild(listItem);
                    }
                }

const myList2 = KONTENPLAN.map(k => kontoLangBez(k.nr));   // zentrale Quelle: js/utils.js

    function filterListByFirstDigit(list, digit) {
        const filteredList = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i][0] === digit.toString()) {
                filteredList.push(list[i]);
            }
        }
        return filteredList;
    }

    function filterListByDigit(digit) {
        const filteredList = filterListByFirstDigit(myList2, digit);
        const listContainer = document.getElementById('list-container');
        listContainer.innerHTML = '';
        for (let i = 0; i < filteredList.length; i++) {
            const listItem = document.createElement('li');
            listItem.textContent = filteredList[i];
            listContainer.appendChild(listItem);
        }
    }

    function showAllAccounts() {
        const listContainer = document.getElementById('list-container');
        listContainer.innerHTML = '';
        for (let i = 0; i < myList2.length; i++) {
            const listItem = document.createElement('li');
            listItem.textContent = myList2[i];
            listContainer.appendChild(listItem);
        }
    }

    function handleDropdownChange() {
        const selectedValue = document.getElementById('kontenplan-dropdown').value;

        if (selectedValue === "all") {
            showAllAccounts();
        } else {
            filterListByDigit(parseInt(selectedValue));
        }
    }

    function handleSearchInput() {
        const searchValue = document.getElementById('search-input').value.toLowerCase();
        const filteredList = myList2.filter(item => item.toLowerCase().includes(searchValue));
        const listContainer = document.getElementById('list-container');
        listContainer.innerHTML = '';
        for (let i = 0; i < filteredList.length; i++) {
            const listItem = document.createElement('li');
            listItem.textContent = filteredList[i];
            listContainer.appendChild(listItem);
        }
    }
