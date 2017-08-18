// controller for page: mailing
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/infodesk/infodeskService.js"/>
/// <reference path="~/www/pages/infodeskEmpList/infodeskEmpListController.js"/>
/// <reference path="~/www/fragments/userMessages/userMessagesController.js" />

(function () {
    "use strict";
    // TEST-COMMIT by hung
    // WinJS.Namespace.define("Infodesk", {
    //    controller: null
    // });
    WinJS.Namespace.define("Infodesk", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Infodesk.Controller.");
            Application.Controller.apply(this, [pageElement, {
                messestandData: getEmptyDefaultValue(Infodesk.Messestand.defaultValue),
                restriction: getEmptyDefaultValue(Infodesk.defaultRestriction),
                dataEmployee: getEmptyDefaultValue(Infodesk.SkillEntry.defaultValue)
            }]);
            //Infodesk.controller = this;
            var comboboxSkills1 = pageElement.querySelector("#skills1");
            var comboboxSkills2 = pageElement.querySelector("#skills2");

            var positionen = [];
            var sprachen = [];

            var that = this;
            var prevLogin = null;

            var getRecordId = function () {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                var recordId = that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterID;
                if (!recordId) {
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        recordId = master.controller.binding.employeeId;
                    }
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var loadInitSelection = function (item) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                var keyValue;

                if (item.SkillTypeSkillsVIEWID === 20) {
                    if (that.binding.restriction.SkillType1Sortierung) {
                        if (that.binding.restriction.SkillType1Sortierung < 10)
                            keyValue = "Skills0" + that.binding.restriction.SkillType1Sortierung;
                        else
                            keyValue = "Skills" + that.binding.restriction.SkillType1Sortierung;

                        comboboxSkills1.value = that.binding.restriction.SkillType1Sortierung;
                        comboboxSkills1.title = item[keyValue];
                    } else
                        comboboxSkills1.value = 0;
                }

                if (item.SkillTypeSkillsVIEWID === 21) {
                    if (that.binding.restriction.SkillType2Sortierung) {
                        if (that.binding.restriction.SkillType2Sortierung < 10)
                            keyValue = "Skills0" + that.binding.restriction.SkillType2Sortierung;
                        else
                            keyValue = "Skills" + that.binding.restriction.SkillType2Sortierung;
                        comboboxSkills2.value = that.binding.restriction.SkillType2Sortierung;
                        comboboxSkills2.title = item[keyValue];
                    }
                    else
                        comboboxSkills2.value = 0;
                }

                Log.ret(Log.l.trace);
                return WinJS.Promise.as();
            }
            this.loadInitSelection = loadInitSelection;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Infodesk.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSearch: function (event) {
                    Log.call(Log.l.trace, "Infodesk.Controller.");
                    //loaddata guter weg -> fehlt aber die restriction
                    that.loadData(that.binding.employeeId).then(function () {
                          Log.print(Log.l.trace, "contact saved");
                          var master = Application.navigator.masterControl;
                          if (master && master.controller && master.controller.binding) {
                              //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                              master.controller.loadData().then(function () {
                                  master.controller.selectRecordId(that.binding.employeeId);
                              });
                          }
                      });

                    //byhung infodeskEmpList
                    //Application.navigateById("infodesk", event);
                  /* // that.saveData(function (response) {
                        Log.print(Log.l.trace, "contact saved");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                            master.controller.loadData().then(function () {
                                master.controller.selectRecordId(that.binding.employeeId);
                            });
                        }
                    //}, function (errorResponse) {
                      //  Log.print(Log.l.error, "error saving employee");
                    //});

                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);*/
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
                },
                clickSearch: function () {
                    return false;
                }
            };

            var saveRestriction = function (complete, error) {
                var ret = WinJS.Promise.as().then(function () {
                    complete({});
                    AppData.setRestriction("SkillEntry", that.binding.restriction); //SkillEntryView_20472
                    // Abfrage wenn beide comboboxen nicht ausgewählt
                    // spannende Stelle // letzen Wert der Comboboxen
                    that.binding.restriction.countCombobox = 0;
                    if (that.binding.restriction.SkillType1Sortierung === "0") {
                        that.binding.restriction.SkillType1Sortierung = 0;
                        delete that.binding.restriction.Sortierung;
                        delete that.binding.restriction.SkillTypeID;
                    }
                    if (that.binding.restriction.SkillType2Sortierung === "0") {
                        that.binding.restriction.SkillType2Sortierung = 0;
                        delete that.binding.restriction.Sortierung;
                        delete that.binding.restriction.SkillTypeID;
                    }
                    // Abfrage wenn beide comboboxen ausgewählt
                    // spannende Stelle // letzen Wert der Comboboxen
                    if (comboboxSkills1.value !== "0" && comboboxSkills2.value !== "0") {
                        //TODO wenn z.B von drei Comboboxen nur zwei ausgewählt wurde muss nach der SkilltypeID sowie für SkillTypeXSortierung einzeln abgefragt werden welcher gesetzt
                        that.binding.restriction.Aktiv = [];
                        that.binding.restriction.SkillTypeID = [];
                        that.binding.restriction.Sortierung = [];
                        for (var i = 0; i < 2; i++) {
                            that.binding.restriction.Aktiv.push("X");
                            that.binding.restriction.SkillTypeID.push(20 + i);
                            if (that.binding.restriction.SkillTypeID[i] === 20)
                                that.binding.restriction.Sortierung.push(that.binding.restriction.SkillType1Sortierung);
                            if (that.binding.restriction.SkillTypeID[i] === 21)
                                that.binding.restriction.Sortierung.push(that.binding.restriction.SkillType2Sortierung);
                        }
                        that.binding.restriction.countCombobox = 2;
                        that.binding.restriction.bAndInEachRow = true;

                    }
                    // Abfrage wenn eine oder keine Combobox ausgewählt
                    if (comboboxSkills1.value === "0" || comboboxSkills2.value === "0") {
                        if (that.binding.restriction.SkillType1Sortierung !== 0) {
                            //Postion
                            that.binding.restriction.SkillTypeID = 20;
                            that.binding.restriction.Sortierung = that.binding.restriction.SkillType1Sortierung;
                        }
                        if (that.binding.restriction.SkillType2Sortierung !== 0) {
                            //Sprache
                            that.binding.restriction.SkillTypeID = 21;
                            that.binding.restriction.Sortierung = that.binding.restriction.SkillType2Sortierung;
                        }
                        if (comboboxSkills1.value === "0" && comboboxSkills2.value === "0") {
                            that.binding.restriction.Aktiv = undefined;
                        } else {
                            that.binding.restriction.Aktiv = "X";
                        }

                        that.binding.restriction.bAndInEachRow = false;
                    }

                    return WinJS.Promise.as();
                });
                return ret;

            }
            this.saveRestriction = saveRestriction;

            var resultConverter = function (item, index) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                if (index >= 0 && index < 5) {
                    var skills = [
                        {
                            value: 0,
                            title: " "
                        }
                    ];
                    for (var i = 1; i <= 28; i++) {
                        var keyValue;
                        var keyTitle = item.TITLE;
                        var iStr = i.toString();

                        if (i < 10) {
                            keyValue = "Skills0" + iStr;

                        } else {
                            keyValue = "Skills" + iStr;
                        }

                        if (item[keyValue]) {
                            Log.print(Log.l.trace, keyTitle + "=" + item[keyValue]);
                            skills.push(
                            {
                                value: i,
                                title: item[keyValue]
                            });
                        }
                    }
                    Log.print(Log.l.trace, "allSkills[" + index + "].length=" + skills.length);
                    var elementId = "#skills" + (index + 1).toString();
                    var initskills = pageElement.querySelector(elementId);
                    if (initskills && initskills.winControl) {
                        initskills.winControl.data = new WinJS.Binding.List(skills);
                    }
                    if (item.SkillTypeSkillsVIEWID === 20) {
                        positionen = skills;
                    }
                    if (item.SkillTypeSkillsVIEWID === 21) {
                        sprachen = skills;
                    }
                }
                Log.ret(Log.l.trace, "");
            }
            this.resultConverter = resultConverter;


            // Then, do anything special on this page
            var loadData = function (recordId) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select skillTypeSkills...");
                    return Infodesk.skillTypeSkills.select(function (json) {
                        Log.print(Log.l.trace, "skillTypeSkills: success!");
                        if (json && json.d) {
                            json.d.results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                        }
                        Log.print(Log.l.trace, "Infodesk: success!");
                    });
                }).then(function () {
                    //load of format relation record data
                    // für labels
                    Log.print(Log.l.trace, "calling select Messestand...");
                    return Infodesk.Messestand.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "Messestand: success!");
                        if (json && json.d) {
                            // now always edit!
                            // hole Daten aus der Messestand
                            var results = json.d.results;
                            if (results.length > 0) {
                                that.binding.messestandData = results[0];
                            } else {
                                that.binding.messestandData = getEmptyDefaultValue(Infodesk.Messestand.defaultValue);
                            }
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    //restriction speichern
                    var savedRestriction = AppData.getRestriction("SkillEntry"); //
                    if (!savedRestriction) {
                        savedRestriction = {};
                    }
                    that.binding.restriction = savedRestriction;
                    var defaultRestriction = Infodesk.defaultRestriction;
                    var prop;
                    for (prop in defaultRestriction) {
                        if (defaultRestriction.hasOwnProperty(prop)) {
                            if (typeof savedRestriction[prop] === "undefined") {
                                savedRestriction[prop] = defaultRestriction[prop];
                            }
                        }
                    }
                    that.binding.restriction = savedRestriction;
                }).then(function () {
                    if (that.binding.dataEmployee.Positionen !== "" || that.binding.dataEmployee.Sprachen !== "") {
                        that.binding.dataEmployee.Positionen = "";
                        that.binding.dataEmployee.Sprachen = "";
                    }
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select employeeView...");
                        return Infodesk.SkillEntry.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "skillEntryView: success!");
                            if (json && json.d) {
                                for (var i = 0; i < json.d.results.length; i++) {
                                    //SkillTypeID und Sortierung
                                    if (json.d.results[i].MitarbeiterID === recordId) {
                                        that.binding.dataEmployee.Vorname = json.d.results[i].Vorname;
                                        that.binding.dataEmployee.Nachname = json.d.results[i].Nachname;
                                        if (json.d.results[i].Aktiv === "X") {
                                            if (json.d.results[i].SkillTypeID === 20) {
                                                for (var j = 0; j < positionen.length; j++) {
                                                    if (json.d.results[i].Sortierung === positionen[j].value) {
                                                        that.binding.dataEmployee
                                                            .Positionen =
                                                            that.binding.dataEmployee.Positionen +
                                                            positionen[j].title +
                                                            "\n";
                                                    }
                                                }
                                            }
                                            if (json.d.results[i].SkillTypeID === 21) {
                                                for (var k = 0; k < sprachen.length; k++) {
                                                    if (json.d.results[i].Sortierung === sprachen[k].value) {
                                                        that.binding.dataEmployee
                                                            .Sprachen =
                                                            that.binding.dataEmployee.Sprachen +
                                                            sprachen[k].title +
                                                            "\t";
                                                    }
                                                }
                                            }
                                        }
                                    }
                                };

                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                            MitarbeiterID: recordId
                        }).then(function () {
                            Log.print(Log.l.trace, "calling select skillTypeSkills...");
                            return Infodesk.skillTypeSkills.select(function (json) {
                                Log.print(Log.l.trace, "skillTypeSkills: success!");
                                if (json && json.d) {
                                    json.d.results.forEach(function (item, index) {
                                        that.loadInitSelection(item);
                                    });
                                }
                                Log.print(Log.l.trace, "Infodesk: success!");
                            });

                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var empRolesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("userMessages"));
                    if (empRolesFragmentControl && empRolesFragmentControl.controller) {
                        return empRolesFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#userMessageshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "userMessages", { recordId: recordId });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    // getRestriction into that.binding.restriction
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataEmployee = that.binding.dataEmployee;
                if (dataEmployee && AppBar.modified && !AppBar.busy) {
                    ret = WinJS.Promise.as();
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        complete(dataEmployee);
                    });
                }
                Log.ret(Log.l.trace);
                return ret;

            }
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(getRecordId());// parameter übergeben ? getRecordId()
            }).then(function () {
                var master = Application.navigator.masterControl;
                master.controller.selectRecordId(getRecordId());
                Log.print(Log.l.trace, "Data loaded");
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Date restrictions shown");
            });
            Log.ret(Log.l.trace);
        })
    });
})();