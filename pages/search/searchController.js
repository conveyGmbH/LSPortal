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
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Search.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: Search.contactView.defaultValue,
                Erfassungsart0: Search.Erfassungsart0,
                Erfassungsart1: Search.Erfassungsart1,
                Erfassungsart2: Search.Erfassungsart2,
                Bearbeitet0: Search.Bearbeitet0,
                Bearbeitet1: Search.Bearbeitet1,
                Bearbeitet2: Search.Bearbeitet2
            }]);
            this.employees = null;

            var that = this;

            var erfasserID = pageElement.querySelector("#ErfasserIDSearch");
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
                    that.employees = null;
                }
            }

            // set to null here to initiate bindinghandler later on change
            that.binding.restriction.INITLandID = null; //

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
                if (that.employees) {
                    that.employees.push(item);
                }
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
                    Application.navigateById("contactList", event); //byhung contactlist
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

            var saveRestriction = function (complete, error) {
                var ret = WinJS.Promise.as().then(function () {

                    for (var i = 0; i < radios.length; i++) {
                        if (radios[i].name === "Erfassungsart" && radios[i].checked) {
                            Search.Erfassungsart = radios[i].value;
                            break;
                        }
                    }
                    if (Search.Erfassungsart === "1") {
                        that.binding.restriction.SHOW_Barcode = 1;
                        that.binding.restriction.SHOW_Visitenkarte = null;
                    } else if (Search.Erfassungsart === "2") {
                        that.binding.restriction.SHOW_Barcode = null;
                        that.binding.restriction.SHOW_Visitenkarte = 1;
                    } else {
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
                    AppData.setRestriction('Kontakt', that.binding.restriction);
                    AppData.setRecordId("Kontakt", null);
                    complete({});
                    return WinJS.Promise.as();
                });
                return ret;
            }
            this.saveRestriction = saveRestriction;


            var loadData = function (complete, error) {
                that.binding.messageText = null;
                AppData.setErrorMsg(that.binding);
                var ret = WinJS.Promise.as().then(function () {
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
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!that.employees || !that.employees.length) {
                        that.employees = new WinJS.Binding.List([Search.employeeView.defaultValue]);
                        return Search.employeeView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Reporting: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.nextUrl = Search.employeeView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                if (erfasserID && erfasserID.winControl) {
                                    erfasserID.winControl.data = that.employees;
                                }
                                that.binding.mitarbeiterId = Search.employeeView.defaultValue.MitarbeiterVIEWID;
                            } else {
                                that.nextUrl = null;
                                that.employees = null;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                            VeranstaltungID: AppData.getRecordId("Veranstaltung")
                        });
                    } else {
                        if (erfasserID && erfasserID.winControl) {
                            erfasserID.winControl.data = that.erfasserID;
                        }
                        that.binding.mitarbeiterId = Search.employeeView.defaultValue.MitarbeiterVIEWID;
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var savedRestriction = AppData.getRestriction("Kontakt");
                    if (!savedRestriction) {
                        savedRestriction = {};
                    } else {
                        if (savedRestriction.SHOW_Barcode && !that.binding.restriction.SHOW_Visitenkarte) {
                            radios[0].checked = true;
                        } else if (savedRestriction.SHOW_Visitenkarte && !savedRestriction.SHOW_Barcode) {
                            radios[1].checked = true;
                        } else {
                            radios[2].checked = true;
                        }
                        if (savedRestriction.Nachbearbeitet === "NULL") {
                            radios[3].checked = true;
                        } else if (savedRestriction.Nachbearbeitet === 1) {
                            radios[4].checked = true;
                        } else {
                            radios[5].checked = true;
                        }

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

                });
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
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



