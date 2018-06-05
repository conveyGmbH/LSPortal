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
    WinJS.Namespace.define("Infodesk", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Infodesk.Controller.");
            Application.Controller.apply(this, [pageElement, {
                messestandData: getEmptyDefaultValue(Infodesk.Messestand.defaultValue),
                restriction: getEmptyDefaultValue(Infodesk.defaultRestriction),
                dataEmployee: getEmptyDefaultValue(Infodesk.SkillEntry.defaultValue),
                dataBenutzer: Infodesk.benutzerView && Infodesk.benutzerView.defaultValue,
                restrictionNames: InfodeskEmpList.defaultValue.Names,
                messages: getEmptyDefaultValue(Infodesk.benutzerView.defaultValue)
            }, commandList]);
            //Infodesk.controller = this;
            var comboboxSkills1 = pageElement.querySelector("#skills1");
            var comboboxSkills2 = pageElement.querySelector("#skills2");
            var comboboxSkills3 = pageElement.querySelector("#skills3");
            var comboboxSkills4 = pageElement.querySelector("#skills4");
            var comboboxSkills5 = pageElement.querySelector("#skills5");

            var firstskill = [];
            var secondskill = [];
            var thirdskill = [];
            var fourthskill = [];
            var fifthskill = [];

            var that = this;

            var restriction = AppData.getRestriction("SkillEntry"); //
            if (!restriction) {
                restriction = Infodesk.defaultRestriction;
            }
            that.binding.restriction = restriction;
            var defaultRestriction = Infodesk.defaultRestriction;
            var prop;
            for (prop in defaultRestriction) {
                if (defaultRestriction.hasOwnProperty(prop)) {
                    if (typeof restriction[prop] === "undefined") {
                        restriction[prop] = defaultRestriction[prop];
                    }
                }
            }
            that.binding.restriction = restriction;

            var setRecordId = function (recordId) {
                Log.call(Log.l.trace, "UserInfo.Controller.", recordId);
                AppData.setRecordId("Benutzer", recordId);
                Log.ret(Log.l.trace);
            };
            this.setRecordId = setRecordId;

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

            var setDataBenutzer = function (newDataBenutzer) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                if (newDataBenutzer.Info1 === null) {
                    newDataBenutzer.Info1 = "";
                }
                if (newDataBenutzer.Info2 === null) {
                    newDataBenutzer.Info2 = "";
                }
                that.binding.dataBenutzer = newDataBenutzer;
                AppBar.modified = true;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
                return that.binding.dataBenutzer;
            };
            this.setDataBenutzer = setDataBenutzer;

            var loadInitSelection = function (item) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                var keyValue;

                if (item.Sortierung === 1) {
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

                if (item.Sortierung === 2) {
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

                if (item.Sortierung === 3) {
                    if (that.binding.restriction.SkillType3Sortierung) {
                        if (that.binding.restriction.SkillType3Sortierung < 10)
                            keyValue = "Skills0" + that.binding.restriction.SkillType3Sortierung;
                        else
                            keyValue = "Skills" + that.binding.restriction.SkillType3Sortierung;
                        comboboxSkills3.value = that.binding.restriction.SkillType3Sortierung;
                        comboboxSkills3.title = item[keyValue];
                    }
                    else
                        comboboxSkills3.value = 0;
                }

                if (item.Sortierung === 4) {
                    if (that.binding.restriction.SkillType4Sortierung) {
                        if (that.binding.restriction.SkillType4Sortierung < 10)
                            keyValue = "Skills0" + that.binding.restriction.SkillType4Sortierung;
                        else
                            keyValue = "Skills" + that.binding.restriction.SkillType4Sortierung;
                        comboboxSkills4.value = that.binding.restriction.SkillType4Sortierung;
                        comboboxSkills4.title = item[keyValue];
                    }
                    else
                        comboboxSkills4.value = 0; // wenn eins wegelöscht wird, dann 
                }

                if (item.Sortierung === 5) {
                    if (that.binding.restriction.SkillType5Sortierung) {
                        if (that.binding.restriction.SkillType5Sortierung < 10)
                            keyValue = "Skills0" + that.binding.restriction.SkillType5Sortierung;
                        else
                            keyValue = "Skills" + that.binding.restriction.SkillType5Sortierung;
                        comboboxSkills5.value = that.binding.restriction.SkillType5Sortierung;
                        comboboxSkills5.title = item[keyValue];
                    }
                    else
                        comboboxSkills5.value = 0;
                }
                Log.ret(Log.l.trace);
                return WinJS.Promise.as();
            }
            this.loadInitSelection = loadInitSelection;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Infodesk.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "contact saved");

                    },
                        function (errorResponse) {
                            Log.print(Log.l.error, "error saving employee");
                        });

                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickSearch: function (event) {
                    Log.call(Log.l.trace, "Infodesk.Controller.");
                    that.saveRestriction(function () {
                        // called asynchronously if ok
                        complete({});
                    });
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                        master.controller.loadData().then(function () {
                            master.controller.selectRecordId(that.binding.employeeId);
                        });
                    }
                    //that.loadData(getRecordId());
                    Log.ret(Log.l.trace);

                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    setTimeout(function() {
                        Log.call(Log.l.trace, "Event.Controller.");
                        that.binding.restriction.Vorname = [];
                        that.binding.restriction.Nachname = [];
                        that.binding.restriction.Login = [];
                        if (event.target.value) {
                            that.binding.restriction.Names = event.target.value;
                            that.binding.restriction.Vorname = [event.target.value, null, null];
                            that.binding.restriction.Login = [null, event.target.value, null];
                            that.binding.restriction.Nachname = [null, null, event.target.value];
                            that.binding.restriction.bUseOr = false;
                            that.binding.restriction.bAndInEachRow = true;
                        } else {
                            that.binding.restriction.Names = event.target.value;
                            that.binding.restriction.Login = event.target.value;
                            that.binding.restriction.Vorname = event.target.value;
                            that.binding.restriction.Nachname = event.target.value;
                            delete that.binding.restriction.bUseOr;
                        }
                        that.saveRestriction(function () {
                            // called asynchronously if ok
                            complete({});
                        });
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                            master.controller.loadData().then(function () {
                                if (that.binding.employeeId)
                                    master.controller.selectRecordId(that.binding.employeeId);
                            });
                        }
                    }, 2000);

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
                },
                clickSendMessage: function() {
                    var ret = true;
                    if (that.binding.dataBenutzer.BenutzerVIEWID) {
                        ret = false;
                    }
                    return ret;
                }
            };

            // register comboboxSkills1 event handler
            if (comboboxSkills1) {
                this.addRemovableEventListener(comboboxSkills1, "onchange", this.eventHandlers.testChangeSomething.bind(this));
            }
            var saveRestriction = function (complete, error) {
                var ret = WinJS.Promise.as().then(function () {
                    if (typeof firstskill.skilltypesortierung === "undefined")
                        firstskill.skilltypesortierung = null;
                    if (typeof secondskill.skilltypesortierung === "undefined")
                        secondskill.skilltypesortierung = null;
                    if (typeof thirdskill.skilltypesortierung === "undefined")
                        thirdskill.skilltypesortierung = null;
                    if (typeof fourthskill.skilltypesortierung === "undefined")
                        fourthskill.skilltypesortierung = null;
                    if (typeof fifthskill.skilltypesortierung === "undefined")
                        fifthskill.skilltypesortierung = null;

                    that.binding.restriction.countRestriction = 0;
                    if (that.binding.restriction.Login.length > 0) {
                        that.binding.restriction.countRestriction++;
                    }
                    if (that.binding.restriction.Vorname.length > 0) {
                        that.binding.restriction.countRestriction++;
                    }
                    if (that.binding.restriction.Nachname.length > 0) {
                        that.binding.restriction.countRestriction++;
                    }
                    if (that.binding.restriction.Names) {

                    }
                    //SkillEntryView_20472
                    // Abfrage wenn beide comboboxen nicht ausgewählt
                    // spannende Stelle // letzen Wert der Comboboxen
                    if (comboboxSkills1.value === "") {
                        comboboxSkills1.value = "0";
                    }
                    if (comboboxSkills2.value === "") {
                        comboboxSkills2.value = "0";
                    }
                    if (comboboxSkills3.value === "") {
                        comboboxSkills3.value = "0";
                    }
                    if (comboboxSkills4.value === "") {
                        comboboxSkills4.value = "0";
                    }
                    if (comboboxSkills5.value === "") {
                        comboboxSkills5.value = "0";
                    }
                    if (that.binding.restriction.Names && that.binding.restriction.Names.length > 0) {
                        that.binding.restriction.Aktiv = ["X", "X", "X"];
                    } else {
                        that.binding.restriction.Aktiv = ["X", "X", "X"];
                    }
                    that.binding.restriction.SkillTypeID = [];
                    that.binding.restriction.Sortierung = [];

                    that.binding.restriction.countCombobox = 0;

                    if (that.binding.restriction.SkillType1Sortierung === "0") {
                        that.binding.restriction.SkillType1Sortierung = 0;
                    }
                    if (that.binding.restriction.SkillType2Sortierung === "0") {
                        that.binding.restriction.SkillType2Sortierung = 0;
                    }
                    if (that.binding.restriction.SkillType3Sortierung === "0") {
                        that.binding.restriction.SkillType3Sortierung = 0;
                    }
                    if (that.binding.restriction.SkillType4Sortierung === "0") {
                        that.binding.restriction.SkillType4Sortierung = 0;
                    }
                    if (that.binding.restriction.SkillType5Sortierung === "0") {
                        that.binding.restriction.SkillType5Sortierung = 0;
                    }
                    if (firstskill.skilltypesortierung && that.binding.restriction.SkillType1Sortierung) {
                        if (that.binding.restriction.SkillType1Sortierung !== 0) {
                            that.binding.restriction.SkillTypeID = [firstskill.skilltypesortierung, firstskill.skilltypesortierung, firstskill.skilltypesortierung];
                            that.binding.restriction.Sortierung = [that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung];
                            if (that.binding.restriction.Names) {
                                that.binding.restriction.Vorname = [that.binding.restriction.Names, null, null];
                                that.binding.restriction.Login = [null, that.binding.restriction.Names, null];
                                that.binding.restriction.Nachname = [null, null, that.binding.restriction.Names];
                            }

                            that.binding.restriction.countCombobox++;
                        }
                    }
                    if (secondskill.skilltypesortierung && that.binding.restriction.SkillType2Sortierung) {
                        if (that.binding.restriction.SkillType2Sortierung !== 0) {
                            that.binding.restriction.SkillTypeID = [firstskill.skilltypesortierung, firstskill.skilltypesortierung, firstskill.skilltypesortierung, secondskill.skilltypesortierung, secondskill.skilltypesortierung, secondskill.skilltypesortierung];
                            that.binding.restriction.Sortierung = [that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType2Sortierung];
                            that.binding.restriction.Aktiv = ["X", "X", "X", "X", "X", "X"];
                            if (that.binding.restriction.Names) {
                                that.binding.restriction.Vorname = [that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null];
                                that.binding.restriction.Login = [null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null];
                                that.binding.restriction.Nachname = [null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names];
                            }
                            that.binding.restriction.countCombobox++;
                        }
                    }
                    if (thirdskill.skilltypesortierung && that.binding.restriction.SkillType3Sortierung) {
                        if (that.binding.restriction.SkillType3Sortierung !== 0) {
                            that.binding.restriction.SkillTypeID = [firstskill.skilltypesortierung, firstskill.skilltypesortierung, firstskill.skilltypesortierung, secondskill.skilltypesortierung, secondskill.skilltypesortierung, secondskill.skilltypesortierung, thirdskill.skilltypesortierung, thirdskill.skilltypesortierung, thirdskill.skilltypesortierung];
                            that.binding.restriction.Sortierung = [that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType3Sortierung, that.binding.restriction.SkillType3Sortierung, that.binding.restriction.SkillType3Sortierung];
                            //that.binding.restriction.Aktiv.push("X");
                            that.binding.restriction.Aktiv = ["X", "X", "X", "X", "X", "X", "X", "X", "X"];
                            if (that.binding.restriction.Names) {
                                that.binding.restriction.Vorname = [that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null];
                                that.binding.restriction.Login = [null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null];
                                that.binding.restriction.Nachname = [null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names];
                            }
                            that.binding.restriction.countCombobox++;
                        }
                    }
                    if (fourthskill.skilltypesortierung && that.binding.restriction.SkillType4Sortierung) {
                        if (that.binding.restriction.SkillType4Sortierung !== 0) {
                            that.binding.restriction.SkillTypeID = [firstskill.skilltypesortierung, firstskill.skilltypesortierung, firstskill.skilltypesortierung, secondskill.skilltypesortierung, secondskill.skilltypesortierung, secondskill.skilltypesortierung, thirdskill.skilltypesortierung, thirdskill.skilltypesortierung, thirdskill.skilltypesortierung, fourthskill.skilltypesortierung, fourthskill.skilltypesortierung, fourthskill.skilltypesortierung];
                            that.binding.restriction.Sortierung = [that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType3Sortierung, that.binding.restriction.SkillType3Sortierung, that.binding.restriction.SkillType3Sortierung, that.binding.restriction.SkillType4Sortierung, that.binding.restriction.SkillType4Sortierung, that.binding.restriction.SkillType4Sortierung];
                            //that.binding.restriction.Aktiv.push("X");
                            that.binding.restriction.Aktiv = ["X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X"];
                            if (that.binding.restriction.Names) {
                                that.binding.restriction.Vorname = [that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null];
                                that.binding.restriction.Login = [null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null];
                                that.binding.restriction.Nachname = [null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names];
                            }
                            that.binding.restriction.countCombobox++;
                        }
                    }
                    if (fifthskill.skilltypesortierung && that.binding.restriction.SkillType5Sortierung) {
                        if (that.binding.restriction.SkillType5Sortierung !== 0) {
                            that.binding.restriction.SkillTypeID = [firstskill.skilltypesortierung, firstskill.skilltypesortierung, firstskill.skilltypesortierung, secondskill.skilltypesortierung, secondskill.skilltypesortierung, secondskill.skilltypesortierung, thirdskill.skilltypesortierung, thirdskill.skilltypesortierung, thirdskill.skilltypesortierung, fourthskill.skilltypesortierung, fourthskill.skilltypesortierung, fourthskill.skilltypesortierung, fifthskill.skilltypesortierung, fifthskill.skilltypesortierung, fifthskill.skilltypesortierung];
                            that.binding.restriction.Sortierung = [that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType1Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType2Sortierung, that.binding.restriction.SkillType3Sortierung, that.binding.restriction.SkillType3Sortierung, that.binding.restriction.SkillType3Sortierung, that.binding.restriction.SkillType4Sortierung, that.binding.restriction.SkillType4Sortierung, that.binding.restriction.SkillType4Sortierung, that.binding.restriction.SkillType5Sortierung, that.binding.restriction.SkillType5Sortierung, that.binding.restriction.SkillType5Sortierung];
                            that.binding.restriction.Aktiv = ["X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X"];
                            if (that.binding.restriction.Names) {
                                that.binding.restriction.Vorname = [that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null];
                                that.binding.restriction.Login = [null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null];
                                that.binding.restriction.Nachname = [null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names, null, null, that.binding.restriction.Names];
                            }
                            that.binding.restriction.countCombobox++;
                        }
                    }

                    that.binding.restriction.bAndInEachRow = true;
                    that.binding.restriction.bUseOr = false;

                    //}
                    Log.print("restriction number:" + that.binding.restriction.countCombobox + ", restriction: " + that.binding.restriction);
                    AppData.setRestriction("SkillEntry", that.binding.restriction);
                    complete({});
                    return WinJS.Promise.as();
                });
                return ret;

            }
            this.saveRestriction = saveRestriction;
            var resultDocConverter = function (item, recordId) { // geänderte Stelle
                if (recordId) {
                    if (recordId === item.DOC1MitarbeiterVIEWID) {
                        item.OvwContentDOCCNT3 = item.OvwContentDOCCNT3 ? item.OvwContentDOCCNT3 : item.DocContentDOCCNT1;
                        if (item.OvwContentDOCCNT3) {
                            var sub = item.OvwContentDOCCNT3.search("\r\n\r\n");
                            that.binding.photoData = "data:image/jpeg;base64," + item.OvwContentDOCCNT3.substr(sub + 4);
                        } else {
                            that.binding.photoData = null;
                        }
                    }
                    // that.showPhoto();
                }
            }
            this.resultDocConverter = resultDocConverter;

            var resultConverter = function (item, index) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                if (index >= 0 && index < 5) {
                    var skills = [
                        {
                            value: 0,
                            title: " "
                        }
                    ];
                    // skills.Sortierung = item.Sortierung;
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
                    that.binding.restriction.Sortierung[index] = item.Sortierung; //exception
                    that.binding.restriction.SkillTypeID[index] = item.SkillTypeSkillsVIEWID;

                    if (item.Sortierung === 1) {
                        firstskill = skills;
                        if (item.SkillTypeSkillsVIEWID)
                            firstskill.skilltypesortierung = item.SkillTypeSkillsVIEWID;
                    }
                    if (item.Sortierung === 2) {
                        secondskill = skills;
                        if (item.SkillTypeSkillsVIEWID)
                            secondskill.skilltypesortierung = item.SkillTypeSkillsVIEWID;

                    }
                    if (item.Sortierung === 3) {
                        thirdskill = skills;
                        if (item.SkillTypeSkillsVIEWID)
                            thirdskill.skilltypesortierung = item.SkillTypeSkillsVIEWID;

                    }
                    if (item.Sortierung === 4) {
                        fourthskill = skills;
                        if (item.SkillTypeSkillsVIEWID)
                            fourthskill.skilltypesortierung = item.SkillTypeSkillsVIEWID;

                    }
                    if (item.Sortierung === 5) {
                        fifthskill = skills;
                        if (item.SkillTypeSkillsVIEWID)
                            fifthskill.skilltypesortierung = item.SkillTypeSkillsVIEWID;

                    }
                }
                Log.ret(Log.l.trace, "");
            }
            this.resultConverter = resultConverter;

            // show business card photo
            var userPhotoContainer = pageElement.querySelector("#userPhoto");
            var showPhoto = function () {
                if (that.binding.photoData) {
                    if (userPhotoContainer) {
                        var userImg = new Image();
                        userImg.id = "userImg";
                        userPhotoContainer.appendChild(userImg);
                        WinJS.Utilities.addClass(userImg, "user-photo");
                        userImg.src = that.binding.photoData;
                    }
                    AppBar.triggerDisableHandlers();
                } else {
                    var userimg = pageElement.querySelector("#userImg");
                    if (userimg) {
                        userimg.parentNode.removeChild(userimg);
                    }
                }
            }
            this.showPhoto = showPhoto;

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
                                that.binding.messestandData = Infodesk.Messestand.defaultValue;
                            }
                        }
                    },
                        function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                }).then(function () {
                    var empRolesFragmentControl = Application.navigator
                        .getFragmentControlFromLocation(Application.getFragmentPath("userMessages"));
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

                }).then(function () {
                    if (that.binding.dataEmployee.firstskill !== "" ||
                        that.binding.dataEmployee.secondskill !== "" ||
                        that.binding.dataEmployee.thirdskill !== "" ||
                        that.binding.dataEmployee.fourthskill !== "" ||
                        that.binding.dataEmployee.fifthskill !== "") {
                        that.binding.dataEmployee.firstskill = "";
                        that.binding.dataEmployee.secondskill = "";
                        that.binding.dataEmployee.thirdskill = "";
                        that.binding.dataEmployee.fourthskill = "";
                        that.binding.dataEmployee.fifthskill = "";
                    }
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select employeeView...");
                        return Infodesk.SkillEntry.select(function(json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "skillEntryView: success!");
                                if (json && json.d && json.d.results.length > 0) {
                                    if (json.d.results[0].MitarbeiterID === recordId) {
                                        that.binding.dataEmployee.Vorname = json.d.results[0].Vorname;
                                        that.binding.dataEmployee.Nachname = json.d.results[0].Nachname;
                                        that.binding.dataEmployee.Login = json.d.results[0].Login;
                                    }
                                    for (var i = 0; i < json.d.results.length; i++) {
                                        //SkillTypeID und Sortierung
                                        if (json.d.results[i].MitarbeiterID === recordId) {
                                            if (json.d.results[i].Aktiv === "X") {
                                                if (firstskill.skilltypesortierung &&
                                                    json.d.results[i].SkillTypeID === firstskill.skilltypesortierung) {
                                                    for (var j = 0; j < firstskill.length; j++) {
                                                        if (json.d.results[i].Sortierung === firstskill[j].value) {
                                                            that.binding.dataEmployee
                                                                .firstskill =
                                                                that.binding.dataEmployee.firstskill +
                                                                firstskill[j].title +
                                                                "\n";
                                                        }
                                                    }
                                                } else if (secondskill.skilltypesortierung &&
                                                    json.d.results[i].SkillTypeID === secondskill.skilltypesortierung) {
                                                    for (var k = 0; k < secondskill.length; k++) {
                                                        if (json.d.results[i].Sortierung === secondskill[k].value) {
                                                            that.binding.dataEmployee
                                                                .secondskill =
                                                                that.binding.dataEmployee.secondskill +
                                                                secondskill[k].title +
                                                                "\t";
                                                        }
                                                    }
                                                } else if (thirdskill.skilltypesortierung &&
                                                    json.d.results[i].SkillTypeID === thirdskill.skilltypesortierung) {
                                                    for (var l = 0; l < thirdskill.length; l++) {
                                                        if (json.d.results[i].Sortierung === thirdskill[l].value) {
                                                            that.binding.dataEmployee
                                                                .thirdskill =
                                                                that.binding.dataEmployee.thirdskill +
                                                                thirdskill[l].title +
                                                                "\t";
                                                        }
                                                    }
                                                } else if (fourthskill.skilltypesortierung &&
                                                    json.d.results[i].SkillTypeID === fourthskill.skilltypesortierung) {
                                                    for (var m = 0; m < fourthskill.length; m++) {
                                                        if (json.d.results[i].Sortierung === fourthskill[m].value) {
                                                            that.binding.dataEmployee
                                                                .fourthskill =
                                                                that.binding.dataEmployee.fourthskill +
                                                                fourthskill[m].title +
                                                                "\t";
                                                        }
                                                    }
                                                } else if (fifthskill.skilltypesortierung &&
                                                    json.d.results[i].SkillTypeID === fifthskill.skilltypesortierung) {
                                                    for (var n = 0; n < fifthskill.length; n++) {
                                                        if (json.d.results[i].Sortierung === fifthskill[n].value) {
                                                            that.binding.dataEmployee
                                                                .fifthskill =
                                                                that.binding.dataEmployee.fifthskill +
                                                                fifthskill[n].title +
                                                                "\t";
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    };
                                }
                            },
                            function(errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            {
                                MitarbeiterID: recordId
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function() {
                    if (recordId) {
                        return Infodesk.employeeView.select(function(json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "skillEntryView: success!");
                                if (json && json.d) {
                                    that.binding.dataEmployee.Vorname = json.d.results[0].Vorname;
                                    that.binding.dataEmployee.Nachname = json.d.results[0].Nachname;
                                    that.binding.dataEmployee.Login = json.d.results[0].Login;
                                }
                            },
                            function(errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            {
                                MitarbeiterVIEWID: recordId
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select benutzerView...");
                        return Infodesk.benutzerView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "benutzerView: success!");
                            if (json && json.d) {
                                that.setDataBenutzer(json.d);
                                setRecordId(that.binding.dataBenutzer.BenutzerVIEWID);
                            }
                        },
                            function (errorResponse) {
                                if (errorResponse.status === 404) {
                                    // ignore NOT_FOUND error here!
                                    that.setDataBenutzer(getEmptyDefaultValue(Infodesk.benutzerView.defaultValue));
                                } else {
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                }
                            },
                            recordId);
                    } else {
                        that.setDataBenutzer(getEmptyDefaultValue(Infodesk.benutzerView.defaultValue));
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!recordId) {
                        setRecordId(that.binding.dataBenutzer.BenutzerVIEWID);
                    }
                    if (recordId) {
                        if (that.binding.photoData !== null) {
                            that.binding.photoData = null;
                            that.showPhoto();
                        }
                        return Infodesk.userPhotoView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "benutzerView: success!");
                            if (json && json.d) {
                                //that.binding.doccount = json.d.results.length;
                                //that.nextDocUrl = InfodeskEmpList.userPhotoView.getNextUrl(json);
                                var results = json.d;
                                that.doc = results;

                                that.resultDocConverter(that.doc, recordId);

                            }
                        },
                            function (errorResponse) {
                                if (errorResponse.status === 404) {
                                    //that.setDataBenutzer(getEmptyDefaultValue(Infodesk.benutzerView.defaultValue));
                                } else {
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                }
                            }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    that.showPhoto();
                });
            }
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataBenutzer = setDataBenutzer(that.binding.dataBenutzer);
                if (dataBenutzer && AppBar.modified && !AppBar.busy) {
                    var recordId = getRecordId();
                    if (recordId) {
                        Infodesk.benutzerView.update(function (response) {
                            // called asynchronously if ok
                            // force reload of userData for Present flag
                            AppBar.modified = false;
                            // AppData.getUserData();
                            complete(response);
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                        }, recordId, dataBenutzer);
                    }
                    ret = WinJS.Promise.as();
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        complete(dataBenutzer);
                    });
                }
                Log.ret(Log.l.trace);
                return ret;

            }
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();// parameter übergeben ? getRecordId()
            })/*.then(function () {
                var master = Application.navigator.masterControl;
                if (master) {
                    master.controller.selectRecordId(getRecordId());
                }
                Log.print(Log.l.trace, "Data loaded");
            })*/.then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Date restrictions shown");
            });
            Log.ret(Log.l.trace);
        })
    });
})();