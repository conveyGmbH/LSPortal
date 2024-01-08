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
                dataBenutzer: getEmptyDefaultValue(Infodesk.benutzerView.defaultValue),
                employeeId: null,
                photoData: "",
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com"
            }, commandList]);

            var prevMasterLoadPromise = null;

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
                that.binding.employeeId = recordId;
                AppBar.triggerDisableHandlers();
                Log.ret(Log.l.trace);
            };
            this.setRecordId = setRecordId;

            var getRecordId = function () {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                Log.ret(Log.l.trace, that.binding.employeeId);
                return that.binding.employeeId;
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
                if (that.binding.dataBenutzer.Name !== newDataBenutzer.Name)
                    that.binding.dataBenutzer = newDataBenutzer;
                AppBar.notifyModified = prevNotifyModified;
                AppData.setRecordId("Benutzer", newDataBenutzer.BenutzerVIEWID);
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

            var saveRestriction = function () {
                Log.call(Log.l.trace, "Infodesk.Controller.");
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
                Log.print("restriction number:" + that.binding.restriction.countCombobox + ", restriction: " + that.binding.restriction);
                AppData.setRestriction("SkillEntry", that.binding.restriction);
                Log.ret(Log.l.trace, "");
            }
            this.saveRestriction = saveRestriction;


            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Infodesk.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "contact saved");
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickSearch: function (event) {
                    Log.call(Log.l.trace, "Infodesk.Controller.");
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") { 
                            prevMasterLoadPromise.cancel();
                        }
                        prevMasterLoadPromise = master.controller.loadData().then(function () {
                            prevMasterLoadPromise = null;
                            if (master && master.controller && that.binding.employeeId) {
                                master.controller.selectRecordId(that.binding.employeeId);
                            }
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
                changedSkill: function(event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    switch (event.target.id) {
                        case "skills1":
                            that.binding.restriction.SkillType1Sortierung = event.target.value;
                            break;
                        case "skills2":
                            that.binding.restriction.SkillType2Sortierung = event.target.value;
                            break;
                        case "skills3":
                            that.binding.restriction.SkillType3Sortierung = event.target.value;
                            break;
                        case "skills4":
                            that.binding.restriction.SkillType4Sortierung = event.target.value;
                            break;
                        case "skills5":
                            that.binding.restriction.SkillType5Sortierung = event.target.value;
                            break;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        prevMasterLoadPromise = master.controller.loadData().then(function () {
                            prevMasterLoadPromise = null;
                            if (master && master.controller && that.binding.employeeId) {
                                master.controller.selectRecordId(that.binding.employeeId);
                            }
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
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
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                        prevMasterLoadPromise = master.controller.loadData().then(function () {
                            prevMasterLoadPromise = null;
                            if (master && master.controller && that.binding.employeeId) {
                                master.controller.selectRecordId(that.binding.employeeId);
                            }
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderFirstname: function (event) {
                    Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                    that.binding.restriction.OrderAttribute = "SortVorname";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("SkillEntry", that.binding.restriction);

                    if (event.target.textContent === getResourceText("infodeskEmpList.firstNameDesc")) {
                        event.target.textContent = getResourceText("infodeskEmpList.firstNameAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("infodeskEmpList.firstNameDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }
                       

                    var master = Application.navigator.masterControl;
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickOrderLastname: function (event) {
                    Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                    var master = Application.navigator.masterControl;
                    that.binding.restriction.OrderAttribute = "SortNachname";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("SkillEntry", that.binding.restriction);
                    if (event.target.textContent === getResourceText("infodeskEmpList.nameDesc")) {
                        event.target.textContent = getResourceText("infodeskEmpList.nameAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("infodeskEmpList.nameDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }


                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickResetRestriction: function() {
                    Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                    that.binding.restriction = Infodesk.defaultRestriction;
                    that.binding.restriction.SkillType1Sortierung = 0;
                    that.binding.restriction.SkillType2Sortierung = 0;
                    that.binding.restriction.SkillType3Sortierung = 0;
                    that.binding.restriction.SkillType4Sortierung = 0;
                    that.binding.restriction.SkillType5Sortierung = 0;
                    that.binding.restriction.Names = "";
                    that.binding.restriction.Login = [null, null, null];
                    that.binding.restriction.Vorname = [null, null, null];
                    that.binding.restriction.Nachname = [null, null, null];
                    that.binding.restriction.countCombobox = 0;
                    AppData.setRestriction("SkillEntry", that.binding.restriction);
                    var master = Application.navigator.masterControl;
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                blockEnterKey: function (event) {
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickSendMessage")
                            AppBar.commandList[i].key = null;
                    }

                },
                releaseEnterKey: function (event) {
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickSendMessage")
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                    }
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
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
                },
                clickSendMessage: function () {
                    if (that.binding.employeeId && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

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
                    initskills.selectedIndex = 0;
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
                    if (recordId) {
                        AppData.setErrorMsg(that.binding);
                        return Infodesk.employeeView.select(function (json) {
                            Log.print(Log.l.trace, "Infodesk employeeView: success!");
                                if (json && json.d) {
                                    that.binding.dataEmployee.Vorname = json.d.Vorname;
                                    that.binding.dataEmployee.Nachname = json.d.Nachname;
                                    that.binding.dataEmployee.Login = json.d.Login;
                                    that.binding.dataEmployee.fullname = json.d.Vorname + " " + json.d.Nachname;
                                    that.binding.dataEmployee.MitarbeiterID = json.d.MitarbeiterVIEWID;
                                    setRecordId(that.binding.dataEmployee.MitarbeiterID);
                                }
                            },
                            function (errorResponse) {
                                that.binding.dataEmployee = getEmptyDefaultValue(Infodesk.SkillEntry.defaultValue);
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, recordId);
                    } else {
                        that.binding.dataEmployee = getEmptyDefaultValue(Infodesk.SkillEntry.defaultValue);
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        //load of format relation record data
                        that.binding.dataEmployee.firstskill = "";
                        that.binding.dataEmployee.secondskill = "";
                        that.binding.dataEmployee.thirdskill = "";
                        that.binding.dataEmployee.fourthskill = "";
                        that.binding.dataEmployee.fifthskill = "";
                        Log.print(Log.l.trace, "calling select employeeView...");
                        return Infodesk.SkillEntry.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "skillEntryView: success!");
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.dataEmployee.MitarbeiterVIEWID = json.d.results[0].MitarbeiterID;
                                setRecordId(that.binding.dataEmployee.MitarbeiterVIEWID);
                                that.binding.dataEmployee.Vorname = json.d.results[0].Vorname;
                                that.binding.dataEmployee.Nachname = json.d.results[0].Nachname;
                                that.binding.dataEmployee.Login = json.d.results[0].Login;
                                that.binding.dataEmployee.Doc1MitarbeiterID = json.d.results[0].DOC1MitarbeiterID;
                                for (var i = 0; i < json.d.results.length; i++) {
                                    //SkillTypeID und Sortierung
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
                                };
                            }
                        },
                            function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            {
                                MitarbeiterID: recordId
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        //load of format relation record data
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "calling select benutzerView...");
                        return Infodesk.benutzerView.select(function (json) {
                            Log.print(Log.l.trace, "benutzerView: success!");
                            if (json && json.d) {
                                that.setDataBenutzer(json.d);
                            }
                        }, function (errorResponse) {
                            if (errorResponse.status === 404) {
                                Log.print(Log.l.trace, "benutzerView: ignore NOT_FOUND error here!");
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
                    if (recordId && that.binding.dataEmployee.Doc1MitarbeiterID) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "calling select userPhotoView...");
                        return Infodesk.userPhotoView.select(function (json) {
                            Log.print(Log.l.trace, "userPhotoView: success!");
                            if (json && json.d &&
                                typeof json.d.DocContentDOCCNT1 === "string") {
                                var sub = json.d.DocContentDOCCNT1.search("\r\n\r\n");
                                that.binding.photoData = "data:image/jpeg;base64," + json.d.DocContentDOCCNT1.substr(sub + 4);
                            }
                        }, function (errorResponse) {
                            that.binding.photoData = "";
                            if (errorResponse.status === 404) {
                                Log.print(Log.l.trace, "userPhotoView: ignore NOT_FOUND error here!");
                            } else {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }
                        }, recordId);
                    } else {
                        that.binding.photoData = "";
                        return WinJS.Promise.as();
                    }
                });
            }
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (!recordId) {
                    if (data && data.BenutzerVIEWID) {
                        recordId = data.BenutzerVIEWID;
                    }
                }
                if (recordId) {
                    AppBar.modified = true;
                    var dataBenutzer = that.binding.dataBenutzer;
                    if (dataBenutzer && AppBar.modified && !AppBar.busy) {
                        if (dataBenutzer.BenutzerVIEWID || data.BenutzerVIEWID) {
                            ret = Infodesk.benutzerView.update(function(response) {
                                    // called asynchronously if ok
                                    // force reload of userData for Present flag
                                    AppBar.modified = false;
                                    Log.print(Log.l.trace, "benutzerView: update success!");
                                    complete(response);
                                },
                                function(errorResponse) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                    error(errorResponse);
                                },
                                data.BenutzerVIEWID,
                                dataBenutzer).then(function() {
                                if (recordId) {
                                    //load of format relation record data
                                    AppData.setErrorMsg(that.binding);
                                    Log.print(Log.l.trace, "calling select benutzerView...");
                                    return Infodesk.benutzerView.select(function(json) {
                                        Log.print(Log.l.trace, "benutzerView: success!");
                                        if (json && json.d) {
                                            that.binding.dataBenutzer = json.d;
                                        }
                                    },
                                    function(errorResponse) {
                                        if (errorResponse.status === 404) {
                                            Log.print(Log.l.trace, "benutzerView: ignore NOT_FOUND error here!");
                                            that.setDataBenutzer(
                                                getEmptyDefaultValue(Infodesk.benutzerView.defaultValue));
                                        } else {
                                            AppData.setErrorMsg(that.binding, errorResponse);
                                        }
                                    },
                                    recordId);
                                } else {
                                    that.setDataBenutzer(getEmptyDefaultValue(Infodesk.benutzerView.defaultValue));
                                    return WinJS.Promise.as();
                                }
                            });
                        } else {
                            ret = new WinJS.Promise.as().then(function () {
                                complete(dataBenutzer);
                            });
                        }
                    } else {
                        ret = new WinJS.Promise.as().then(function() {
                            complete(dataBenutzer);
                        });
                    }
                } else {
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(getRecordId());// parameter übergeben ? getRecordId()
            }).then(function () {
                var userImageContainer = pageElement.querySelector(".userimg-container");
                if (userImageContainer) {
                    Colors.loadSVGImageElements(userImageContainer, "svgimg", 128, Colors.textColor, "name");
                }
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Date restrictions shown");
            });
            Log.ret(Log.l.trace);
        })
    });
})();