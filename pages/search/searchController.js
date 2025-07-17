// controller for page: search
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/search/searchService.js" />

(function () { 
    "use strict";
    WinJS.Namespace.define("Search", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Search.Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventId: 0,
                restriction: getEmptyDefaultValue(Search.contactView.defaultValue),
                Erfassungsart0: Search.Erfassungsart0,
                Erfassungsart1: Search.Erfassungsart1,
                Erfassungsart2: Search.Erfassungsart2,
                Erfassungsart3: Search.Erfassungsart3,
                Bearbeitet0: Search.Bearbeitet0,
                Bearbeitet1: Search.Bearbeitet1,
                Bearbeitet2: Search.Bearbeitet2
            }, commandList]);
            this.employees = null;

            var that = this;

            var eventsDropdown = pageElement.querySelector("#events");
            var erfasserID = pageElement.querySelector("#ErfasserIDSearch");
            //var erfasserIDname = document.getElementById("ErfasserIDSearch");
            var erfassungsDatum = pageElement.querySelector("#Erfassungsdatum.win-datepicker");
            var modifiedTs = pageElement.querySelector("#modifiedTS.win-datepicker");
            var initLand = pageElement.querySelector("#InitLandSearch");
            var radios = pageElement.querySelectorAll('input[type="radio"]');

            this.dispose = function () {
                if (initLand && initLand.winControl) {
                    initLand.winControl.data = null;
                }
                if (erfasserID && erfasserID.winControl) {
                    erfasserID.winControl.data = null;
                }
                if (that.employees) {
                    that.employees = {};
                }
            }

            // set to null here to initiate bindinghandler later on change
            that.binding.restriction.INITLandID = null; //
            that.binding.restriction.MitarbeiterID = null;

            var getEventId = function () {
                var eventId = null;
                Log.call(Log.l.trace, "Search.Controller.");
                if (that.binding.eventId) {
                    eventId = that.binding.eventId;
                } else {
                    eventId = AppData.getRecordId("Veranstaltung");
                }
                Log.ret(Log.l.trace, eventId);
                return eventId;
            }
            this.getEventId = getEventId;

            var showDateRestrictions = function () {
                return WinJS.Promise.as().then(function () {
                    if (typeof that.binding.restriction.useErfassungsdatum == "undefined") {
                        that.binding.restriction.useErfassungsdatum = false;
                    }
                    if (typeof that.binding.restriction.usemodifiedTS == "undefined") {
                        that.binding.restriction.usemodifiedTS = false;
                    }
                    if (erfassungsDatum && erfassungsDatum.winControl) {
                        erfassungsDatum.winControl.disabled = !that.binding.restriction.useErfassungsdatum;
                    }
                    if (modifiedTs && modifiedTs.winControl) {
                        modifiedTs.winControl.disabled = !that.binding.restriction.usemodifiedTS;
                    }
                });
            }
            this.showDateRestrictions = showDateRestrictions;

            var resultConverter = function (item, index) {
                item.index = index;
                item.fullName = (item.Vorname ? (item.Vorname + " ") : "") + (item.Nachname ? item.Nachname : "");
                /*if (that.employees) {
                    that.employees.push(item);
                }*/
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Search.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "Search.Controller.");
                    Application.navigateById(Application.navigateNewId, event);
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Search.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Search.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "Search.Controller.");
                    Application.navigateById("contact", event); //byhung contactlist
                    Log.ret(Log.l.trace);
                },
                clickErfassungsdatum: function (event) {
                    if (event.currentTarget) {
                        that.binding.restriction.useErfassungsdatum = event.currentTarget.checked;
                    }
                    that.showDateRestrictions();
                },
                clickmodifiedTS: function (event) {
                    if (event.currentTarget) {
                        that.binding.restriction.usemodifiedTS = event.currentTarget.checked;
                    }
                    that.showDateRestrictions();
                },
                changeErfassungsdatum: function (event) {
                    if (event.currentTarget) {
                        that.binding.restriction.Erfassungsdatum = event.currentTarget.current;
                    }
                },
                changeModifiedTS: function (event) {
                    if (event.currentTarget) {
                        that.binding.restriction.ModifiedTS = event.currentTarget.current;
                    }
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Search.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Search.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickResetRestriction: function () {
                    Log.call(Log.l.trace, "Search.Controller.");
                    that.binding.restriction = getEmptyDefaultValue(Search.defaultValue);
                    if (Erfassungsdatum && Erfassungsdatum.winControl) {
                        Erfassungsdatum.winControl.disabled = true;
                    }
                    if (modifiedTS && modifiedTS.winControl) {
                        modifiedTS.winControl.disabled = true;
                    }
                    AppData.setRestriction("Kontakt", that.binding.restriction);
                    that.loadData();
                    Log.ret(Log.l.trace);
                },
                changeEventId: function (parameters) {
                    Log.call(Log.l.trace, "Search.Controller.");
                    if (event && event.currentTarget) {
                        //that.setEventId(event.currentTarget.value);
                        that.binding.restriction.VeranstaltungID = parseInt(that.binding.eventId); //that.getEventId()
                        that.loadData();
                    }
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
            if (eventsDropdown) {
                this.addRemovableEventListener(eventsDropdown, "change", this.eventHandlers.changeEventId.bind(this));
            }
            var saveRestriction = function (complete, error) {
                var ret = WinJS.Promise.as().then(function () {
                    for (var i = 0; i < radios.length; i++) {
                        if (radios[i].name === "Erfassungsart" && radios[i].checked) {
                            Search.Erfassungsart = radios[i].value;
                            break;
                        }
                    }
                    // Hier erweitern mit manuelle Erfassung
                    if (Search.Erfassungsart === "1") { // Barcode
                        that.binding.restriction.SHOW_Barcode = 1;
                        that.binding.restriction.SHOW_Visitenkarte = null;
                    } else if (Search.Erfassungsart === "2") { // Visitenkarte
                        that.binding.restriction.SHOW_Barcode = null;
                        that.binding.restriction.SHOW_Visitenkarte = 1;
                    } else if (Search.Erfassungsart === "3") { // Manuelle Erfassung
                        that.binding.restriction.SHOW_Barcode = "NULL";
                        that.binding.restriction.SHOW_Visitenkarte = "NULL";
                    } else { // Alle Kontakte
                        that.binding.restriction.SHOW_Barcode = null;
                        that.binding.restriction.SHOW_Visitenkarte = null;
                    }

                    for (var j = 0; j < radios.length; j++) {
                        if (radios[j].name === "Bearbeitet" && radios[j].checked) {
                            Search.Bearbeitet = radios[j].value;
                            break;
                        }
                    }
                    if (Search.Bearbeitet === "1") {
                        that.binding.restriction.Nachbearbeitet = "NULL";
                    } else if (Search.Bearbeitet === "2") {
                        that.binding.restriction.Nachbearbeitet = 1;
                    } else {
                        that.binding.restriction.Nachbearbeitet = null;
                    }

                    if (!that.binding.restriction.useErfassungsdatum &&
                        typeof that.binding.restriction.Erfassungsdatum !== "undefined") {
                        delete that.binding.restriction.Erfassungsdatum;
                    }
                    //@nedra:10.11.2015: Erfassungsdatum is undefined if it is not updated -> Erfassungsdatum = current date
                    if (that.binding.restriction.useErfassungsdatum &&
                        typeof that.binding.restriction.Erfassungsdatum === "undefined") {
                        that.binding.restriction.Erfassungsdatum = new Date();
                    }
                    if (!that.binding.restriction.usemodifiedTS &&
                        typeof that.binding.restriction.ModifiedTS !== "undefined") {
                        delete that.binding.restriction.ModifiedTS;
                    }
                    //@nedra:10.11.2015: modifiedTS is undefined if it is not updated -> modifiedTS = current date
                    if (that.binding.restriction.usemodifiedTS &&
                        typeof that.binding.restriction.ModifiedTS === "undefined") {
                        that.binding.restriction.ModifiedTS = new Date();
                    }

                    if (that.binding.restriction.INITLandID === "0") {
                        that.binding.restriction.INITLandID = "";
                    }
                    if (that.binding.restriction.MitarbeiterID === 0) {
                        that.binding.restriction.MitarbeiterID = "";
                    }
                    that.binding.restriction.bExact = false;
                    AppData.setRestriction('Kontakt', that.binding.restriction);
                    AppData.setRecordId("Kontakt", null);
                    complete({});
                    return WinJS.Promise.as();
                });
                return ret;
            }
            this.saveRestriction = saveRestriction;

            // if there is still employees to load 
            var getNextData = function () {
                if (that.nextUrl !== null) {
                    that.loading = true;

                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select Search.employeeView...");
                    Search.employeeView.selectNext(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Search.employeeView: success!");
                        var savediD = erfasserID.value;
                        var saveIndex = erfasserID.selectedIndex;
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d) {
                            that.nextUrl = Search.employeeView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                                that.binding.count = that.employees.push(item);
                            });
                            if (erfasserID && erfasserID.winControl) {
                                erfasserID.winControl.data = that.employees;
                            }
                        } else {
                            that.nextUrl = null;
                        }

                        for (var i = 0; i < erfasserID.length; i++) {
                            if (erfasserID[i].value === that.binding.restriction.MitarbeiterID) {
                                saveIndex = i;
                            }
                        }
                        //erfasserIDname.selectedIndex = saveIndex; 
                        erfasserID.selectedIndex = saveIndex;
                    },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            that.loading = false;
                        },
                        null,
                        that.nextUrl);

                    that.loading = false;
                }
            }
            this.getNextData = getNextData;

            var loadData = function (complete, error) {
                that.binding.messageText = null;
                AppData.setErrorMsg(that.binding);
                var ret = WinJS.Promise.as().then(function () {
                    if (!that.events) {
                        return Search.eventView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "eventView: success!");
                            // eventView returns object already parsed from json file in response
                            if (json && json.d && json.d.results.length > 0) {
                                var results = [/*{
                                    VeranstaltungVIEWID: "",
                                    Name: ""
                                }*/].concat(json.d.results);
                                that.events = new WinJS.Binding.List(results);
                                if (eventsDropdown && eventsDropdown.winControl) {
                                    eventsDropdown.winControl.data = that.events;
                                    if (that.binding.eventId) {
                                        for (var i = 0; i < results.length; i++) {
                                            if (that.binding.eventId === results[i].VeranstaltungVIEWID) {
                                                eventsDropdown.selectedIndex = i;
                                            }
                                        }
                                    } else {
                                        eventsDropdown.selectedIndex = 0;
                                    }
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!AppData.initLandView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initLandData...");
                        //@nedra:25.09.2015: load the list of INITLand for Combobox
                        return AppData.initLandView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "initLandDataView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initLand && initLand.winControl) {
                                    initLand.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initLand && initLand.winControl &&
                            (!initLand.winControl.data || !initLand.winControl.data.length)) {
                            initLand.winControl.data = new WinJS.Binding.List(AppData.initLandView.getResults());
                        }
                        //initLand.selectedIndex = 0;
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    //if (!that.employees || !that.employees.length) {
                    //var veranstaltungId = parseInt(that.binding.restriction.VeranstaltungID) || AppData.getRecordId("Veranstaltung");
                        return Search.employeeView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            that.employees = new WinJS.Binding.List([Search.employeeView.defaultValue]);
                            Log.print(Log.l.trace, "Reporting: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.nextUrl = Search.employeeView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                    that.employees.push(item);
                                });
                                if (erfasserID && erfasserID.winControl) {
                                    erfasserID.winControl.data = that.employees;
                                }
                                //erfasserID.selectedIndex = Search.employeeView.defaultValue.index;
                                //that.binding.mitarbeiterId = Search.employeeView.defaultValue.MitarbeiterVIEWID;

                            } else {
                                that.nextUrl = null;
                                that.employees = null;
                            }

                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                                VeranstaltungID: that.getEventId() /*AppData.getRecordId("Veranstaltung")*/
                            });
                   // } else {
                        /*if (erfasserID && erfasserID.winControl) {
                            erfasserID.winControl.data = that.erfasserID;
                        }
                        that.binding.mitarbeiterId = Search.employeeView.defaultValue.MitarbeiterVIEWID;
                        
                    }
                    return WinJS.Promise.as();*/
                }).then(function () {
                    if (that.nextUrl !== null) {
                        that.getNextData();
                    }
                }).then(function () {
                    var savedRestriction = AppData.getRestriction("Kontakt");
                    if (!savedRestriction) {
                        savedRestriction = {};
                    } else {
                        if (savedRestriction.SHOW_Barcode && !that.binding.restriction.SHOW_Visitenkarte) { // Barcode
                            radios[0].checked = true;
                        } else if (savedRestriction.SHOW_Visitenkarte && !savedRestriction.SHOW_Barcode) { // Visitenkarte
                            radios[1].checked = true;
                        } else if (savedRestriction.SHOW_Visitenkarte === "NULL" && savedRestriction.SHOW_Barcode === "NULL") { // Manuelle Erfassng
                            radios[2].checked = true;
                        }else { // Alle Kontakte
                            radios[3].checked = true;
                        }
                        if (savedRestriction.Nachbearbeitet === "NULL") {
                            radios[4].checked = true;
                        } else if (savedRestriction.Nachbearbeitet === 1) {
                            radios[5].checked = true;
                        } else {
                            radios[6].checked = true;
                        }
                        that.binding.restriction.MitarbeiterID = savedRestriction.MitarbeiterID;

                    }
                    var defaultRestriction = Search.contactView.defaultValue;
                    var prop;
                    for (prop in defaultRestriction) {
                        if (defaultRestriction.hasOwnProperty(prop)) {
                            if (typeof savedRestriction[prop] === "undefined") {
                                savedRestriction[prop] = defaultRestriction[prop];
                            }
                        }
                    }
                    that.binding.restriction = savedRestriction;

                    // always define date types
                    if (typeof that.binding.restriction.Erfassungsdatum === "undefined") {
                        that.binding.restriction.Erfassungsdatum = new Date();
                    }
                    if (typeof that.binding.restriction.ModifiedTS === "undefined") {
                        that.binding.restriction.ModifiedTS = new Date();
                    }
                    // erfasserIDname.selectedIndex = 0;
                });
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                var savedRestriction = AppData.getRestriction("Kontakt");
                if (typeof savedRestriction === "object") {
                    that.binding.restriction = savedRestriction;
                    copyMissingMembersByValue(that.binding.restriction, Search.contactView.defaultValue);
                }
                if (that.binding.restriction.VeranstaltungID) {
                    that.binding.eventId = that.binding.restriction.VeranstaltungID;
                }
                Log.print(Log.l.trace, "Data loaded");
                return that.showDateRestrictions();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Date restrictions shown");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



