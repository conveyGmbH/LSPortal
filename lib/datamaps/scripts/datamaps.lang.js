/*
 * datamaps.lang.js
 * Add-on für datamaps.world.en.js
 *
 * - Nur EINE Datamaps-Lib laden (datamaps.world.en.js), dieses File danach.
 * - Ländernamen werden zur Laufzeit umgeschaltet: en, de, fr, it
 *   (Geometrie/Arcs bleiben gleich, nur properties.name wird ersetzt).
 * - Weitere Sprachen: DatamapsLang.addLanguage("es", { "Germany": "Alemania", ... })
 * - Hover-Fix: ersetzt mouseover/mouseout der Lib durch mouseenter/mouseleave,
 *   ohne moveToFront (kein DOM-Umhängen -> kein Flackern / Hängenbleiben in Edge).
 * - create(): leert den Container vor dem Erzeugen -> keine alte Karte/SVG mehr.
 *
 * API (global):
 *   DatamapsLang.setLanguage(lang)  // "de"/"de-DE"/1031, "fr"/"fr-FR"/1036, "it"/"it-IT"/1040, sonst "en"
 *   DatamapsLang.getLanguage()      // "en" | "de" | "fr" | "it" (bzw. per addLanguage ergänzt)
 *   DatamapsLang.getLanguages()     // alle verfügbaren Sprachcodes
 *   DatamapsLang.addLanguage(code, names) // eigene Sprache/Übersetzungen ergänzen
 *   DatamapsLang.create(options, lang) // wie new Datamap(options), inkl. Sprache + Hover-Fix
 *   DatamapsLang.fixHover(map)      // Hover-Fix für eine bereits erzeugte Karte
 */
(function () {
    "use strict";

    // Englischer Name (aus datamaps.world.en.js) -> deutscher Name.
    // Nicht aufgeführte Namen sind in beiden Sprachen gleich.
    // Englischer Name (aus datamaps.world.en.js) -> Name in der Zielsprache.
    // Nicht aufgeführte Namen sind identisch mit dem englischen Namen.
    var NAMES = {
        de: {
            "Albania": "Albanien",
            "United Arab Emirates": "Vereinigte Arabische Emirate",
            "Argentina": "Argentinien",
            "Armenia": "Armenien",
            "Antarctica": "Antarktis",
            "French Southern and Antarctic Lands": "Französische Süd- und Antarktisgebiete",
            "Australia": "Australien",
            "Austria": "Österreich",
            "Azerbaijan": "Aserbaidschan",
            "Belgium": "Belgien",
            "Bangladesh": "Bangladesch",
            "Bulgaria": "Bulgarien",
            "The Bahamas": "Die Bahamas",
            "Bosnia and Herzegovina": "Bosnien und Herzegowina",
            "Belarus": "Weißrussland",
            "Bolivia": "Bolivien",
            "Brazil": "Brasilien",
            "Central African Republic": "Zentralafrikanische Republik",
            "Canada": "Kanada",
            "Switzerland": "Schweiz",
            "Ivory Coast": "Elfenbeinküste",
            "Cameroon": "Kamerun",
            "Democratic Republic of the Congo": "Demokratische Republik Kongo",
            "Republic of the Congo": "Republik Kongo",
            "Colombia": "Kolumbien",
            "Cuba": "Kuba",
            "Northern Cyprus": "Türkische Republik Nordzypern",
            "Cyprus": "Zypern",
            "Czech Republic": "Tschechien",
            "Germany": "Deutschland",
            "Djibouti": "Dschibuti",
            "Denmark": "Dänemark",
            "Dominican Republic": "Dominikanische Republik",
            "Algeria": "Algerien",
            "Egypt": "Ägypten",
            "Spain": "Spanien",
            "Estonia": "Estland",
            "Ethiopia": "Äthiopien",
            "Finland": "Finnland",
            "Fiji": "Fidschi",
            "Falkland Islands": "Falklandinseln",
            "France": "Frankreich",
            "French Guiana": "Französisch-Guayana",
            "Gabon": "Gabun",
            "United Kingdom": "Vereinigtes Königreich",
            "Georgia": "Georgien",
            "Guinea Bissau": "Guinea-Bissau",
            "Equatorial Guinea": "Äquatorialguinea",
            "Greece": "Griechenland",
            "Greenland": "Grönland",
            "Croatia": "Kroatien",
            "Hungary": "Ungarn",
            "Indonesia": "Indonesien",
            "India": "Indien",
            "Ireland": "Irland",
            "Iraq": "Irak",
            "Iceland": "Island",
            "Italy": "Italien",
            "Jamaica": "Jamaika",
            "Jordan": "Jordanien",
            "Kazakhstan": "Kasachstan",
            "Kenya": "Kenia",
            "Kyrgyzstan": "Kirgisistan",
            "Cambodia": "Kambodscha",
            "South Korea": "Südkorea",
            "Lebanon": "Libanon",
            "Libya": "Libyen",
            "Lithuania": "Litauen",
            "Luxembourg": "Luxemburg",
            "Latvia": "Lettland",
            "Morocco": "Marokko",
            "Moldova": "Moldawien",
            "Madagascar": "Madagaskar",
            "Mexico": "Mexiko",
            "Macedonia": "Mazedonien",
            "Mongolia": "Mongolei",
            "Mozambique": "Mosambik",
            "Mauritania": "Mauretanien",
            "New Caledonia": "Neukaledonien",
            "Netherlands": "Niederlande",
            "Norway": "Norwegen",
            "New Zealand": "Neuseeland",
            "Philippines": "Philippinen",
            "Papua New Guinea": "Papua-Neuguinea",
            "Poland": "Polen",
            "North Korea": "Nordkorea",
            "Qatar": "Katar",
            "Romania": "Rumänien",
            "Russia": "Russland",
            "Rwanda": "Ruanda",
            "Western Sahara": "Westsahara",
            "Saudi Arabia": "Saudi-Arabien",
            "South Sudan": "Südsudan",
            "Solomon Islands": "Salomonen",
            "Republic of Serbia": "Serbien",
            "Slovakia": "Slowakei",
            "Slovenia": "Slowenien",
            "Sweden": "Schweden",
            "Swaziland": "Swasiland",
            "Syria": "Syrien",
            "Chad": "Tschad",
            "Tajikistan": "Tadschikistan",
            "East Timor": "Osttimor",
            "Trinidad and Tobago": "Trinidad und Tobago",
            "Tunisia": "Tunesien",
            "Turkey": "Türkei",
            "United Republic of Tanzania": "Tansania",
            "United States of America": "Vereinigte Staaten von Amerika",
            "Uzbekistan": "Usbekistan",
            "West Bank": "Westjordanland",
            "Yemen": "Jemen",
            "South Africa": "Südafrika",
            "Zambia": "Sambia",
            "Zimbabwe": "Simbabwe"
        },
        fr: {
            "Albania": "Albanie",
            "United Arab Emirates": "Émirats arabes unis",
            "Argentina": "Argentine",
            "Armenia": "Arménie",
            "Antarctica": "Antarctique",
            "French Southern and Antarctic Lands": "Terres australes et antarctiques françaises",
            "Australia": "Australie",
            "Austria": "Autriche",
            "Azerbaijan": "Azerbaïdjan",
            "Belgium": "Belgique",
            "Benin": "Bénin",
            "Bulgaria": "Bulgarie",
            "The Bahamas": "Bahamas",
            "Bosnia and Herzegovina": "Bosnie-Herzégovine",
            "Belarus": "Biélorussie",
            "Bolivia": "Bolivie",
            "Brazil": "Brésil",
            "Bhutan": "Bhoutan",
            "Central African Republic": "République centrafricaine",
            "Switzerland": "Suisse",
            "Chile": "Chili",
            "China": "Chine",
            "Ivory Coast": "Côte d'Ivoire",
            "Cameroon": "Cameroun",
            "Democratic Republic of the Congo": "République démocratique du Congo",
            "Republic of the Congo": "République du Congo",
            "Colombia": "Colombie",
            "Northern Cyprus": "Chypre du Nord",
            "Cyprus": "Chypre",
            "Czech Republic": "Tchéquie",
            "Germany": "Allemagne",
            "Denmark": "Danemark",
            "Dominican Republic": "République dominicaine",
            "Algeria": "Algérie",
            "Ecuador": "Équateur",
            "Egypt": "Égypte",
            "Eritrea": "Érythrée",
            "Spain": "Espagne",
            "Estonia": "Estonie",
            "Ethiopia": "Éthiopie",
            "Finland": "Finlande",
            "Fiji": "Fidji",
            "Falkland Islands": "Îles Malouines",
            "French Guiana": "Guyane",
            "United Kingdom": "Royaume-Uni",
            "Georgia": "Géorgie",
            "Guinea": "Guinée",
            "Gambia": "Gambie",
            "Guinea Bissau": "Guinée-Bissau",
            "Equatorial Guinea": "Guinée équatoriale",
            "Greece": "Grèce",
            "Greenland": "Groenland",
            "Croatia": "Croatie",
            "Haiti": "Haïti",
            "Hungary": "Hongrie",
            "Indonesia": "Indonésie",
            "India": "Inde",
            "Ireland": "Irlande",
            "Iraq": "Irak",
            "Iceland": "Islande",
            "Israel": "Israël",
            "Italy": "Italie",
            "Jamaica": "Jamaïque",
            "Jordan": "Jordanie",
            "Japan": "Japon",
            "Kyrgyzstan": "Kirghizistan",
            "Cambodia": "Cambodge",
            "South Korea": "Corée du Sud",
            "Kuwait": "Koweït",
            "Lebanon": "Liban",
            "Libya": "Libye",
            "Lithuania": "Lituanie",
            "Latvia": "Lettonie",
            "Morocco": "Maroc",
            "Moldova": "Moldavie",
            "Mexico": "Mexique",
            "Macedonia": "Macédoine",
            "Myanmar": "Birmanie",
            "Montenegro": "Monténégro",
            "Mongolia": "Mongolie",
            "Mauritania": "Mauritanie",
            "Malaysia": "Malaisie",
            "Namibia": "Namibie",
            "New Caledonia": "Nouvelle-Calédonie",
            "Netherlands": "Pays-Bas",
            "Norway": "Norvège",
            "Nepal": "Népal",
            "New Zealand": "Nouvelle-Zélande",
            "Peru": "Pérou",
            "Papua New Guinea": "Papouasie-Nouvelle-Guinée",
            "Poland": "Pologne",
            "Puerto Rico": "Porto Rico",
            "North Korea": "Corée du Nord",
            "Romania": "Roumanie",
            "Russia": "Russie",
            "Western Sahara": "Sahara occidental",
            "Saudi Arabia": "Arabie saoudite",
            "Sudan": "Soudan",
            "South Sudan": "Soudan du Sud",
            "Senegal": "Sénégal",
            "Solomon Islands": "Îles Salomon",
            "El Salvador": "Salvador",
            "Somalia": "Somalie",
            "Republic of Serbia": "Serbie",
            "Slovakia": "Slovaquie",
            "Slovenia": "Slovénie",
            "Sweden": "Suède",
            "Syria": "Syrie",
            "Chad": "Tchad",
            "Thailand": "Thaïlande",
            "Tajikistan": "Tadjikistan",
            "Turkmenistan": "Turkménistan",
            "East Timor": "Timor oriental",
            "Trinidad and Tobago": "Trinité-et-Tobago",
            "Tunisia": "Tunisie",
            "Turkey": "Turquie",
            "Taiwan": "Taïwan",
            "United Republic of Tanzania": "Tanzanie",
            "Uganda": "Ouganda",
            "United States of America": "États-Unis",
            "Uzbekistan": "Ouzbékistan",
            "Vietnam": "Viêt Nam",
            "West Bank": "Cisjordanie",
            "Yemen": "Yémen",
            "South Africa": "Afrique du Sud",
            "Zambia": "Zambie"
        },
        it: {
            "United Arab Emirates": "Emirati Arabi Uniti",
            "Antarctica": "Antartide",
            "French Southern and Antarctic Lands": "Terre australi e antartiche francesi",
            "Azerbaijan": "Azerbaigian",
            "Belgium": "Belgio",
            "The Bahamas": "Bahamas",
            "Bosnia and Herzegovina": "Bosnia ed Erzegovina",
            "Belarus": "Bielorussia",
            "Brazil": "Brasile",
            "Central African Republic": "Repubblica Centrafricana",
            "Switzerland": "Svizzera",
            "Chile": "Cile",
            "China": "Cina",
            "Ivory Coast": "Costa d'Avorio",
            "Cameroon": "Camerun",
            "Democratic Republic of the Congo": "Repubblica Democratica del Congo",
            "Republic of the Congo": "Repubblica del Congo",
            "Northern Cyprus": "Cipro del Nord",
            "Cyprus": "Cipro",
            "Czech Republic": "Repubblica Ceca",
            "Germany": "Germania",
            "Djibouti": "Gibuti",
            "Denmark": "Danimarca",
            "Dominican Republic": "Repubblica Dominicana",
            "Egypt": "Egitto",
            "Spain": "Spagna",
            "Ethiopia": "Etiopia",
            "Finland": "Finlandia",
            "Fiji": "Figi",
            "Falkland Islands": "Isole Falkland",
            "France": "Francia",
            "French Guiana": "Guyana francese",
            "United Kingdom": "Regno Unito",
            "Guinea Bissau": "Guinea-Bissau",
            "Equatorial Guinea": "Guinea Equatoriale",
            "Greece": "Grecia",
            "Greenland": "Groenlandia",
            "Croatia": "Croazia",
            "Hungary": "Ungheria",
            "Ireland": "Irlanda",
            "Iceland": "Islanda",
            "Israel": "Israele",
            "Italy": "Italia",
            "Jamaica": "Giamaica",
            "Jordan": "Giordania",
            "Japan": "Giappone",
            "Kazakhstan": "Kazakistan",
            "Kyrgyzstan": "Kirghizistan",
            "Cambodia": "Cambogia",
            "South Korea": "Corea del Sud",
            "Lebanon": "Libano",
            "Libya": "Libia",
            "Lithuania": "Lituania",
            "Luxembourg": "Lussemburgo",
            "Latvia": "Lettonia",
            "Morocco": "Marocco",
            "Moldova": "Moldavia",
            "Mexico": "Messico",
            "Mozambique": "Mozambico",
            "New Caledonia": "Nuova Caledonia",
            "Netherlands": "Paesi Bassi",
            "Norway": "Norvegia",
            "New Zealand": "Nuova Zelanda",
            "Peru": "Perù",
            "Philippines": "Filippine",
            "Papua New Guinea": "Papua Nuova Guinea",
            "Poland": "Polonia",
            "Puerto Rico": "Porto Rico",
            "North Korea": "Corea del Nord",
            "Portugal": "Portogallo",
            "Rwanda": "Ruanda",
            "Western Sahara": "Sahara Occidentale",
            "Saudi Arabia": "Arabia Saudita",
            "South Sudan": "Sudan del Sud",
            "Solomon Islands": "Isole Salomone",
            "Republic of Serbia": "Serbia",
            "Slovakia": "Slovacchia",
            "Sweden": "Svezia",
            "Syria": "Siria",
            "Chad": "Ciad",
            "Thailand": "Thailandia",
            "Tajikistan": "Tagikistan",
            "East Timor": "Timor Est",
            "Trinidad and Tobago": "Trinidad e Tobago",
            "Turkey": "Turchia",
            "United Republic of Tanzania": "Tanzania",
            "Ukraine": "Ucraina",
            "United States of America": "Stati Uniti d'America",
            "West Bank": "Cisgiordania",
            "South Africa": "Sudafrica"
        }
    };

    var originalNames = null; // englische Originalnamen, Index = Geometrie-Index
    var currentLang = "en";

    function getGeometries() {
        var DM = window.Datamap;
        var topo = DM && DM.prototype && DM.prototype.worldTopo;
        return (topo && topo.objects && topo.objects.world && topo.objects.world.geometries) || null;
    }

    // Windows-LCIDs -> Sprachcode
    var LCID = {
        "1031": "de", "2055": "de", "3079": "de", "4103": "de", "5127": "de",
        "1036": "fr", "2060": "fr", "3084": "fr", "4108": "fr", "5132": "fr",
        "1040": "it", "2064": "it",
        "1033": "en", "2057": "en"
    };

    function normalizeLang(lang) {
        var s = String(lang === undefined || lang === null ? "" : lang).toLowerCase();
        if (LCID.hasOwnProperty(s)) {
            s = LCID[s];
        }
        var code = s.split(/[-_]/)[0];   // "fr-CH" -> "fr"
        return (code !== "en" && NAMES.hasOwnProperty(code)) ? code : "en";
    }

    function setLanguage(lang) {
        var geoms = getGeometries();
        if (!geoms) {
            if (window.console) {
                console.warn("DatamapsLang: Datamap bzw. worldTopo nicht geladen - datamaps.world.en.js vorher einbinden.");
            }
            return false;
        }
        if (!originalNames) {
            originalNames = [];
            for (var i = 0; i < geoms.length; i++) {
                originalNames.push(geoms[i].properties.name);
            }
        }
        currentLang = normalizeLang(lang);
        for (var j = 0; j < geoms.length; j++) {
            var en = originalNames[j];
            var dict = NAMES[currentLang];
            geoms[j].properties.name = (dict && dict[en]) || en;
        }
        return true;
    }

    function getLanguage() {
        return currentLang;
    }

    function getLanguages() {
        var list = ["en"];
        for (var k in NAMES) {
            if (NAMES.hasOwnProperty(k)) {
                list.push(k);
            }
        }
        return list;
    }

    // Neue Sprache ergänzen oder bestehende erweitern/korrigieren.
    // names: { "<englischer Name>": "<Übersetzung>", ... }
    function addLanguage(code, names) {
        code = String(code || "").toLowerCase();
        if (!code || code === "en") {
            return false;
        }
        var dict = NAMES[code] || (NAMES[code] = {});
        for (var k in names) {
            if (names.hasOwnProperty(k)) {
                dict[k] = names[k];
            }
        }
        if (currentLang === code) {
            setLanguage(code);   // aktive Sprache sofort neu anwenden
        }
        return true;
    }

    // entspricht val() aus datamaps (dort privat)
    function val(datumValue, optionsValue, context) {
        var value = (typeof datumValue !== "undefined") ? datumValue : optionsValue;
        if (typeof value === "undefined") {
            return null;
        }
        return (typeof value === "function") ? value(context) : value;
    }

    function hidePopup(map) {
        d3.select(map.options.element).selectAll(".datamaps-hoverover").style("display", "none");
    }

    function fixHover(map) {
        if (!map || !map.svg || !map.options) {
            return;
        }
        var opts = map.options.geographyConfig || {};
        var subunits = map.svg.selectAll(".datamaps-subunit");

        // Original-Handler der Lib entfernen
        subunits.on("mouseover", null).on("mouseout", null);

        // Tooltip darf den Hover nicht "stehlen"
        d3.select(map.options.element).selectAll(".datamaps-hoverover").style("pointer-events", "none");

        if (!opts.highlightOnHover && !opts.popupOnHover) {
            return;
        }

        subunits
            .on("mouseenter", function (d) {
                var $this = d3.select(this);
                var datum = (map.options.data && map.options.data[d.id]) || {};

                if (opts.highlightOnHover) {
                    // nur speichern, wenn noch nicht gespeichert (verhindert "Hover-Farbe als Originalfarbe")
                    if (!this.__dmPrev) {
                        this.__dmPrev = {
                            "fill": $this.style("fill"),
                            "stroke": $this.style("stroke"),
                            "stroke-width": $this.style("stroke-width"),
                            "stroke-opacity": $this.style("stroke-opacity"),
                            "fill-opacity": $this.style("fill-opacity")
                        };
                    }
                    $this
                        .style("fill", val(datum.highlightFillColor, opts.highlightFillColor, datum))
                        .style("stroke", val(datum.highlightBorderColor, opts.highlightBorderColor, datum))
                        .style("stroke-width", val(datum.highlightBorderWidth, opts.highlightBorderWidth, datum))
                        .style("stroke-opacity", val(datum.highlightBorderOpacity, opts.highlightBorderOpacity, datum))
                        .style("fill-opacity", val(datum.highlightFillOpacity, opts.highlightFillOpacity, datum));
                    // bewusst KEIN moveToFront (appendChild) -> Ursache der Event-Schleife
                }

                if (opts.popupOnHover) {
                    map.updatePopup($this, d, opts, map.svg);
                }
            })
            .on("mouseleave", function () {
                var $this = d3.select(this);
                var prev = this.__dmPrev;
                if (prev) {
                    for (var attr in prev) {
                        if (prev.hasOwnProperty(attr)) {
                            $this.style(attr, prev[attr]);
                        }
                    }
                    this.__dmPrev = null;
                }
                $this.on("mousemove", null);
                hidePopup(map);
            });

        // Sicherheitsnetz: Maus verlässt die ganze Karte -> alles zurücksetzen
        map.svg.on("mouseleave.dmfix", function () {
            subunits.each(function () {
                var prev = this.__dmPrev;
                if (prev) {
                    var $el = d3.select(this);
                    for (var attr in prev) {
                        if (prev.hasOwnProperty(attr)) {
                            $el.style(attr, prev[attr]);
                        }
                    }
                    this.__dmPrev = null;
                }
            });
            hidePopup(map);
        });
    }

    function create(options, lang) {
        if (!options || !options.element) {
            throw new Error("DatamapsLang.create: options.element fehlt");
        }
        if (typeof lang !== "undefined") {
            setLanguage(lang);
        } else {
            setLanguage(currentLang);
        }

        // Container leeren: Datamaps hängt sonst bei jedem new Datamap() ein weiteres SVG an
        var el = options.element;
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }

        // Flache Kopie, damit ein wiederverwendetes options-Objekt nicht mehrfach gewrappt wird
        var o = {};
        for (var k in options) {
            if (options.hasOwnProperty(k)) {
                o[k] = options[k];
            }
        }
        var userDone = options.done;
        o.done = function (map) {
            fixHover(map);
            if (typeof userDone === "function") {
                userDone(map);
            }
        };
        return new window.Datamap(o);
    }

    window.DatamapsLang = {
        setLanguage: setLanguage,
        getLanguage: getLanguage,
        getLanguages: getLanguages,
        addLanguage: addLanguage,
        fixHover: fixHover,
        create: create,
        names: NAMES,
        namesDe: NAMES.de      // abwärtskompatibel
    };
})();