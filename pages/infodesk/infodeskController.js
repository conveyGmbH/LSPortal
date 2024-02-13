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

    var namespaceName = "Infodesk";

    WinJS.Namespace.define("Infodesk", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                messestandData: getEmptyDefaultValue(Infodesk.Messestand.defaultValue),
                restriction: getEmptyDefaultValue(Infodesk.defaultRestriction),
                dataSkillEntry: getEmptyDefaultValue(Infodesk.SkillEntry.defaultValue),
                dataEmployee: getEmptyDefaultValue(Infodesk.employeeView.defaultValue),
                dataBenutzer: getEmptyDefaultValue(Infodesk.benutzerView.defaultValue),
                photoData: "",
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com"
            }, commandList]);

            var prevMasterLoadPromise = null;

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

            this.img = null;
            var that = this;

            // show business card photo
            var imageOffsetX = 0;
            var imageOffsetY = 0;

            var imgWidth = 0;
            var imgHeight = 0;
            var imgLeft = 0;
            var imgTop = 0;
            var imgScale = 1;

            var photoView = pageElement.querySelector("#employeePhoto.photoview");

            var getPhotoData = function () {
                return that.binding.photoData;
            }
            var setPhotoData = function (newPhotoData) {
                if (newPhotoData !== that.binding.photoData) {
                    var prevNotifyModified = AppBar.notifyModified;
                    AppBar.notifyModified = false;
                    that.binding.photoData = newPhotoData;
                    AppBar.notifyModified = prevNotifyModified;
                    that.showPhoto();
                }
            }

            this.dispose = function () {
                if (comboboxSkills1 && comboboxSkills1.winControl) {
                    comboboxSkills1.winControl.data = null;
                }
                if (comboboxSkills2 && comboboxSkills2.winControl) {
                    comboboxSkills2.winControl.data = null;
                }
                if (comboboxSkills3 && comboboxSkills3.winControl) {
                    comboboxSkills3.winControl.data = null;
                }
                if (comboboxSkills4 && comboboxSkills4.winControl) {
                    comboboxSkills4.winControl.data = null;
                }
                if (comboboxSkills5 && comboboxSkills5.winControl) {
                    comboboxSkills5.winControl.data = null;
                }
                if (that.img) {
                    that.removePhoto();
                    that.img.src = "";
                    that.img = null;
                }
            }

            var calcImagePosition = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (photoView && that.img) {
                    var containerWidth = photoView.clientWidth;
                    var containerHeight = photoView.clientHeight;
                    if (that.img.naturalWidth && that.img.naturalHeight) {
                        imgScale = 1;
                        if (containerWidth * that.img.naturalHeight < containerHeight * that.img.naturalWidth) {
                            if (containerWidth < that.img.naturalWidth) {
                                imgScale = containerWidth / that.img.naturalWidth;
                            }
                        } else {
                            if (containerHeight < that.img.naturalHeight) {
                                imgScale = containerHeight / that.img.naturalHeight;
                            }
                        }
                        imgWidth = that.img.naturalWidth * imgScale;
                        imgHeight = that.img.naturalHeight * imgScale;
                    }

                    var photoItemBox = photoView.querySelector(".win-itembox");
                    if (photoItemBox && photoItemBox.style) {
                        photoItemBox.style.width = imgWidth + "px";
                        photoItemBox.style.height = imgHeight + "px";
                    }
                    imgLeft = (imgWidth - containerWidth) / 2;
                    imgTop = (imgHeight - containerHeight) / 2;

                    if (that.img.style) {
                        that.img.style.marginLeft = -imgLeft + "px";
                        that.img.style.marginTop = -imgTop + "px";
                        that.img.style.width = imgWidth + "px";
                        that.img.style.height = imgHeight + "px";
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.calcImagePosition = calcImagePosition;

            var hasDoc = function () {
                return (typeof getPhotoData() === "string" && getPhotoData() !== "");
            }
            this.hasDoc = hasDoc;

            var showPhoto = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (photoView) {
                    var photoItemBox = photoView.querySelector(".win-itembox");
                    if (photoItemBox) {
                        if (photoItemBox.style) {
                            photoItemBox.style.visibility = "hidden";
                        }
                        if (getPhotoData()) {
                            that.img = new Image();
                            photoItemBox.appendChild(that.img);
                            WinJS.Utilities.addClass(that.img, "active");
                            that.img.src = "data:image/jpeg;base64," + getPhotoData();
                            if (photoItemBox.childElementCount > 1) {
                                var oldElement = photoItemBox.firstElementChild || photoItemBox.firstChild;
                                if (oldElement) {
                                    oldElement.parentNode.removeChild(oldElement);
                                    oldElement.innerHTML = "";
                                }
                            }
                            that.calcImagePosition();
                            WinJS.Promise.timeout(0).then(function () {
                                imageOffsetX = photoItemBox.offsetLeft + pageElement.offsetLeft;
                                imageOffsetY = photoItemBox.offsetTop + pageElement.offsetTop;
                                Log.print(Log.l.trace, "imageOffsetX=" + imageOffsetX + " imageOffsetY=" + imageOffsetY);
                                var pageControl = pageElement.winControl;
                                if (pageControl && pageControl.updateLayout) {
                                    pageControl.prevWidth = 0;
                                    pageControl.prevHeight = 0;
                                    var promise = pageControl.updateLayout.call(pageControl, pageElement) || WinJS.Promise.as();
                                    promise.then(function () {
                                        if (photoItemBox.style) {
                                            photoItemBox.style.visibility = "";
                                        }
                                        var animationDistanceY = imgHeight / 10;
                                        var animationOptions = { left: "0px", top: animationDistanceY.toString() + "px" };
                                        return WinJS.UI.Animation.enterContent(photoItemBox, animationOptions);
                                    }).then(function () {
                                        AppBar.triggerDisableHandlers();
                                    });
                                }
                            });
                        } else {
                            that.removePhoto();
                            var pageControl = pageElement.winControl;
                            if (pageControl && pageControl.updateLayout) {
                                pageControl.prevWidth = 0;
                                pageControl.prevHeight = 0;
                                pageControl.updateLayout.call(pageControl, pageElement).then(function () {
                                    AppBar.triggerDisableHandlers();
                                });
                            }
                        }
                    }
                }
                AppBar.triggerDisableHandlers();
                Log.ret(Log.l.trace);
            }
            this.showPhoto = showPhoto;

            var removePhoto = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (photoView) {
                    var photoItemBox = photoView.querySelector(".win-itembox");
                    if (photoItemBox) {
                        var oldElement = photoItemBox.firstElementChild || photoItemBox.firstChild;
                        if (oldElement) {
                            oldElement.parentNode.removeChild(oldElement);
                            oldElement.innerHTML = "";
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.removePhoto = removePhoto;

            var getRecordId = function () {
                var recordId = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    recordId = master.controller.binding.employeeId;
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
                AppBar.notifyModified = prevNotifyModified;
            };
            this.setDataBenutzer = setDataBenutzer;

            var loadInitSelection = function (item) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var keyValue;

                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
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
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace);
                return WinJS.Promise.as();
            }
            this.loadInitSelection = loadInitSelection;

            var saveRestriction = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
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
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace, "");
            }
            this.saveRestriction = saveRestriction;


            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickSearch: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        prevMasterLoadPromise = master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);

                },
                /*changeEventId: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    if (event.target.value) {
                        that.binding.restriction.VeranstaltungID = event.target.value;
                        // use Veranstaltung2 for event selection of multi-event administrators !== Veranstaltung (admin's own event!)
                        AppData.setRecordId("Veranstaltung2",
                            (typeof that.binding.restriction.VeranstaltungID === "string") ?
                            parseInt(that.binding.restriction.VeranstaltungID) : that.binding.restriction.VeranstaltungID);
                    } else {
                        delete that.binding.restriction.VeranstaltungID;
                        AppData.setRecordId("Veranstaltung2", 0);
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },*/
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                changedSkill: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var prevNotifyModified = AppBar.notifyModified;
                    AppBar.notifyModified = false;
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
                    AppBar.notifyModified = prevNotifyModified;
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        prevMasterLoadPromise = master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var prevNotifyModified = AppBar.notifyModified;
                    AppBar.notifyModified = false;
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
                    AppBar.notifyModified = prevNotifyModified;
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        prevMasterLoadPromise = master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderFirstname: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var prevNotifyModified = AppBar.notifyModified;
                    AppBar.notifyModified = false;
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    that.binding.restriction.OrderAttribute = "SortVorname";
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
                    AppBar.notifyModified = prevNotifyModified;
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        prevMasterLoadPromise = master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderLastname: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var prevNotifyModified = AppBar.notifyModified;
                    AppBar.notifyModified = false;
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
                    AppBar.notifyModified = prevNotifyModified;
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        prevMasterLoadPromise = master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                /*clickOrderLicence: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.binding.restriction.OrderAttribute = "NichtLizenzierteApp";
                    if (event.target.textContent === getResourceText("employee.licenceAsc")) {
                        that.binding.restriction.OrderDesc = true;
                    } else {
                        that.binding.restriction.OrderDesc = false;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },*/
                clickResetRestriction: function () {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var prevNotifyModified = AppBar.notifyModified;
                    AppBar.notifyModified = false;
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
                    AppBar.notifyModified = prevNotifyModified;
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        prevMasterLoadPromise = master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                clickOk: function () {
                    if (getRecordId() && !AppBar.busy && AppBar.modified) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var resultConverter = function (item, index) {
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
                    that.loadInitSelection(item);
                }
            }
            this.resultConverter = resultConverter;

            // Then, do anything special on this page
            var loadData = function (recordId) {
                var newPhotoData = "";
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
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
                        }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "calling select employeeView...");
                        return Infodesk.employeeView.select(function (json) {
                            Log.print(Log.l.trace, "employeeView: success!");
                            if (json && json.d) {
                                var prevNotifyModified = AppBar.notifyModified;
                                AppBar.notifyModified = false;
                                that.binding.dataEmployee.MitarbeiterVIEWID = json.d.MitarbeiterVIEWID;
                                that.binding.dataEmployee.Doc1MitarbeiterID = json.d.DOC1MitarbeiterID;
                                if (!that.binding.dataBenutzer.Vorname && !that.binding.dataBenutzer.Name) {
                                    that.binding.dataBenutzer.Vorname = json.d.Vorname;
                                    that.binding.dataBenutzer.Name = json.d.Nachname;
                                }
                                AppBar.notifyModified = prevNotifyModified;
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!firstskill || !firstskill.length) {
                        Log.print(Log.l.trace, "calling select skillTypeSkills...");
                        return Infodesk.skillTypeSkills.select(function (json) {
                            Log.print(Log.l.trace, "skillTypeSkills: success!");
                            if (json && json.d) {
                                var prevNotifyModified = AppBar.notifyModified;
                                AppBar.notifyModified = false;
                                json.d.results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                AppBar.notifyModified = prevNotifyModified;
                            }
                            Log.print(Log.l.trace, "Infodesk: success!");
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    //load of format relation record data
                    // für labels
                    if (!that.binding.messestandData.SkillType1ID) {
                        Log.print(Log.l.trace, "calling select Messestand...");
                        return Infodesk.Messestand.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "Messestand: success!");
                            if (json && json.d) {
                                // now always edit!
                                // hole Daten aus der Messestand
                                var prevNotifyModified = AppBar.notifyModified;
                                AppBar.notifyModified = false;
                                var results = json.d.results;
                                if (results.length > 0) {
                                    that.binding.messestandData = results[0];
                                } else {
                                    that.binding.messestandData = getEmptyDefaultValue(Infodesk.Messestand.defaultValue);
                                }
                                AppBar.notifyModified = prevNotifyModified;
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select SkillEntry...");
                        return Infodesk.SkillEntry.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "skillEntryView: success!");
                            var prevNotifyModified = AppBar.notifyModified;
                            AppBar.notifyModified = false;
                            that.binding.dataSkillEntry.firstskill = "";
                            that.binding.dataSkillEntry.secondskill = "";
                            that.binding.dataSkillEntry.thirdskill = "";
                            that.binding.dataSkillEntry.fourthskill = "";
                            that.binding.dataSkillEntry.fifthskill = "";
                            that.binding.dataSkillEntry.MitarbeiterID = null;
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.dataSkillEntry.MitarbeiterID = json.d.results[0].MitarbeiterID;
                                for (var i = 0; i < json.d.results.length; i++) {
                                    //SkillTypeID und Sortierung
                                    if (json.d.results[i].Aktiv === "X") {
                                        if (firstskill.skilltypesortierung &&
                                            json.d.results[i].SkillTypeID === firstskill.skilltypesortierung) {
                                            for (var j = 0; j < firstskill.length; j++) {
                                                if (json.d.results[i].Sortierung === firstskill[j].value) {
                                                    that.binding.dataSkillEntry.firstskill +=
                                                        (that.binding.dataSkillEntry.firstskill ? ", " + firstskill[j].title : firstskill[j].title);
                                                }
                                            }
                                        } else if (secondskill.skilltypesortierung &&
                                            json.d.results[i].SkillTypeID === secondskill.skilltypesortierung) {
                                            for (var k = 0; k < secondskill.length; k++) {
                                                if (json.d.results[i].Sortierung === secondskill[k].value) {
                                                    that.binding.dataSkillEntry.secondskill +=
                                                        (that.binding.dataSkillEntry.secondskill ? ", " + secondskill[k].title : secondskill[k].title);
                                                }
                                            }
                                        } else if (thirdskill.skilltypesortierung &&
                                            json.d.results[i].SkillTypeID === thirdskill.skilltypesortierung) {
                                            for (var l = 0; l < thirdskill.length; l++) {
                                                if (json.d.results[i].Sortierung === thirdskill[l].value) {
                                                    that.binding.dataSkillEntry.thirdskill +=
                                                        (that.binding.dataSkillEntry.thirdskill ? ", " + thirdskill[l].title : thirdskill[l].title);
                                                }
                                            }
                                        } else if (fourthskill.skilltypesortierung &&
                                            json.d.results[i].SkillTypeID === fourthskill.skilltypesortierung) {
                                            for (var m = 0; m < fourthskill.length; m++) {
                                                if (json.d.results[i].Sortierung === fourthskill[m].value) {
                                                    that.binding.dataSkillEntry.fourthskill +=
                                                        (that.binding.dataSkillEntry.fourthskill ? ", " + fourthskill[m].title : fourthskill[m].title);
                                                }
                                            }
                                        } else if (fifthskill.skilltypesortierung &&
                                            json.d.results[i].SkillTypeID === fifthskill.skilltypesortierung) {
                                            for (var n = 0; n < fifthskill.length; n++) {
                                                if (json.d.results[i].Sortierung === fifthskill[n].value) {
                                                    that.binding.dataSkillEntry.fifthskill +=
                                                        (that.binding.dataSkillEntry.fifthskill ? ", " + fifthskill[n].title : fifthskill[n].title);
                                                }
                                            }
                                        }
                                    }
                                };
                            }
                            AppBar.notifyModified = prevNotifyModified;
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                                MitarbeiterID: recordId
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
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
                    } else {
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
                                newPhotoData = json.d.DocContentDOCCNT1.substr(sub + 4);
                            }
                        }, function (errorResponse) {
                            if (errorResponse.status === 404) {
                                Log.print(Log.l.trace, "userPhotoView: ignore NOT_FOUND error here!");
                            } else {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }
                        }, that.binding.dataEmployee.Doc1MitarbeiterID);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.binding.dataBenutzer.Info2 && that.binding.dataBenutzer.Info2TSRead) {
                        //that.binding.dataBenutzer.Info2 = null;
                        that.binding.dataBenutzer.Info2TSRead = null;
                        AppBar.modified = true;
                        return that.saveData(function (response) {
                            // called asynchronously if ok
                            AppBar.modified = false;
                            AppData.getMessagesData();
                            complete(response);
                        }, function (errorResponse) {
                            AppBar.modified = false;
                            error(errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    //restriction speichern
                    var savedRestriction = AppData.getRestriction("SkillEntry");
                    if (!savedRestriction) {
                        savedRestriction = {};
                    }
                    var prevNotifyModified = AppBar.notifyModified;
                    AppBar.notifyModified = false;
                    that.binding.restriction = savedRestriction;
                    var defaultRestriction = Infodesk.defaultRestriction;
                    for (var prop in defaultRestriction) {
                        if (defaultRestriction.hasOwnProperty(prop)) {
                            if (typeof savedRestriction[prop] === "undefined") {
                                savedRestriction[prop] = defaultRestriction[prop];
                            }
                        }
                    }
                    that.binding.restriction = savedRestriction;
                    AppBar.notifyModified = prevNotifyModified;
                    if (recordId) {
                        setPhotoData(newPhotoData);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataBenutzer = that.binding.dataBenutzer;
                if (dataBenutzer && dataBenutzer.BenutzerVIEWID && AppBar.modified && !AppBar.busy) {
                    AppBar.busy = true;
                    ret = Infodesk.benutzerView.update(function (response) {
                        // called asynchronously if ok
                        // force reload of userData for Present flag
                        Log.print(Log.l.trace, "benutzerView: update success!");
                        AppBar.modified = false;
                        AppBar.busy = false;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppBar.busy = false;
                        if (typeof complete === "function") {
                            error(errorResponse);
                        } else {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }
                    }, dataBenutzer.BenutzerVIEWID, dataBenutzer).then(function () {
                        if (typeof complete === "function") {
                            complete(dataBenutzer);
                            return WinJS.Promise.as();
                        } else {
                            return that.loadData(getRecordId());
                        }
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataBenutzer);
                        }
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