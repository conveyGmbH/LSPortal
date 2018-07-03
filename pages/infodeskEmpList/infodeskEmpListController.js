﻿// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/infodeskEmpList/infodeskEmpListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("InfodeskEmpList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataEmployee: getEmptyDefaultValue(InfodeskEmpList.defaultValue),
                mitarbeiterText: getResourceText("infodesk.employee"),
                count: 0,
                employeeId: AppData.getRecordId("Benutzer")
            }, commandList, true]);
            this.nextUrl = null;

            this.refreshPromise = null;
            this.refreshWaitTimeMs = 30000;

            // idle wait Promise and wait time:
            this.restartPromise = null;
            this.idleWaitTimeMs = 60000;

            this.failurePromise = null;
            this.failureWaitTimeMs = 6000;

            this.animationPromise = null;

            var that = this;

            this.dispose = function () {
                that.cancelPromises();
            };

            var cancelPromises = function () {
                Log.call(Log.l.trace, "Barcode.Controller.");
                if (that.animationPromise) {
                    Log.print(Log.l.trace, "cancel previous animation Promise");
                    that.animationPromise.cancel();
                    that.animationPromise = null;
                }
                if (that.restartPromise) {
                    Log.print(Log.l.trace, "cancel previous restart Promise");
                    that.restartPromise.cancel();
                    that.restartPromise = null;
                }
                if (that.failurePromise) {
                    Log.print(Log.l.trace, "cancel previous failure Promise");
                    that.failurePromise.cancel();
                    that.failurePromise = null;
                }
                Log.ret(Log.l.trace);
            }
            this.cancelPromises = cancelPromises;

            /*var deleteAndNavigate = function (targetPage) {
                Log.call(Log.l.trace, "Barcode.Controller.", "targetPage=" + that.targetPage);
                that.cancelPromises();
                var contactId = AppData.getRecordId("Kontakt");
                Log.print(Log.l.trace, "contactId=" + contactId);
                if (contactId) {
                    Log.print(Log.l.trace, "delete existing contactID=" + contactId);
                    Barcode.contactView.deleteRecord(function (json) {
                        // this callback will be called asynchronously
                        Log.print(Log.l.trace, "contactView: deleteRecord success!");
                        AppData.setRecordId("Kontakt", null);
                        if (that.refreshPromise) {
                            Log.print(Log.l.trace, "cancel previous refresh Promise");
                            that.refreshPromise.cancel();
                            that.refreshPromise = null;
                        }
                        that.cancelPromises();
                        Application.navigateById(targetPage);
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, contactId);
                }
                Log.ret(Log.l.trace);
            }
            this.deleteAndNavigate = deleteAndNavigate;*/

            var waitForIdleAction = function () {
                Log.call(Log.l.trace, "Barcode.Controller.", "idleWaitTimeMs=" + that.idleWaitTimeMs);
                that.cancelPromises();
                that.restartPromise = WinJS.Promise.timeout(that.idleWaitTimeMs).then(function () {
                    Log.print(Log.l.trace, "timeout occurred, navigate back to start page!");
                    if (that.refreshPromise) {
                        Log.print(Log.l.trace, "cancel previous refresh Promise");
                        that.refreshPromise.cancel();
                        that.refreshPromise = null;
                    }
                    that.cancelPromises();
                    //Application.navigateById("start");
                });
                Log.ret(Log.l.trace);
            };
            this.waitForIdleAction = waitForIdleAction;

            var waitForFailureAction = function () {
                Log.call(Log.l.trace, "Barcode.Controller.", "failureWaitTimeMs=" + that.failureWaitTimeMs);
                that.cancelPromises();
                that.failurePromise = WinJS.Promise.timeout(that.failureWaitTimeMs).then(function () {
                    Log.print(Log.l.trace, "timeout occurred, navigate to failed page!");
                    if (that.refreshPromise) {
                        Log.print(Log.l.trace, "cancel previous refresh Promise");
                        that.refreshPromise.cancel();
                        that.refreshPromise = null;
                    }
                    that.cancelPromises();
                    Application.navigateById("failed");
                });
                Log.ret(Log.l.trace);
            };
            this.waitForFailureAction = waitForFailureAction;

            // ListView control
            var listView = pageElement.querySelector("#infodeskEmployeeList.listview");
            var btnFirstName = document.getElementById("btn_firstName");
            var btnName = document.getElementById("btn_Name");
            var progress = null;
            var counter = null;
            var layout = null;
            var messages = [];
            var lastPrevLogin = [];
            this.docs = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;
            this.firstDocsIndex = 0;
            this.firstContactsIndex = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.employees) {
                    that.employees = null;
                }
                listView = null;
            }


            var getRestriction = function () {
                var restriction = AppData.getRestriction("SkillEntry");
                if (!restriction) {
                    restriction = {};
                }
                return restriction;
            }
            this.getRestriction = getRestriction;

            Log.print(Log.l.trace, "calling select InfodeskEmpList.skillentryView...");
            var restriction = AppData.getRestriction("SkillEntry");
            if (!restriction) {
                restriction = {};
            }
            that.binding.restriction = restriction;

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var loadNextUrl = function (recordId) {
                Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                if (!recordId) {
                    recordId = that.binding.employeeId;
                }
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (that.employees && (that.nextUrl || that.nextskillentryUrl) && listView) {
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "none";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select InfodeskEmpList.employeeView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    InfodeskEmpList.employeeView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "InfodeskEmpList.employeeView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && that.employees) {
                            that.nextUrl = InfodeskEmpList.employeeView.getNextUrl(json);
                            var results = json.d.results;

                            //hole anhand der recordid die Fähigkeiten des jeweiligen Mitarbeiters mit der recordid

                            var actualItem = null;
                            var resultsUnique = [];
                            if (that.binding.restriction.countCombobox >= 1) {
                                var zähler = 0;
                                results.forEach(function (item) {
                                    if (!actualItem)
                                        actualItem = item;
                                    if (actualItem.Login === item.Login)
                                        zähler++;
                                    else {
                                        actualItem = item;
                                        zähler = 1;
                                    }
                                    if (zähler === that.binding.restriction.countCombobox) {
                                        resultsUnique.push(actualItem);
                                        zähler = 0;
                                        actualItem = null;
                                    }
                                });
                            } else {
                                //Die Mitarbeiterliste muss zu Beginn unique Mitarbeiter sein
                                results.forEach(function (item, index) {
                                    if (!actualItem) {
                                        actualItem = item;
                                        if (lastPrevLogin.MitarbeiterID !== actualItem.MitarbeiterID || lastPrevLogin.MitarbeiterVIEWID !== actualItem.MitarbeiterVIEWID)
                                            resultsUnique.push(actualItem);
                                    }

                                    if (actualItem.Login !== item.Login) {
                                        actualItem = item;
                                        resultsUnique.push(actualItem);
                                    }
                                    if (index === results.length - 1)
                                        lastPrevLogin = actualItem;
                                });
                            }
                            Log.print(lastPrevLogin);
                            results = resultsUnique;

                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.employees.push(item);
                            });
                        }
                        if (recordId) {
                            that.selectRecordId(recordId);
                        }
                        if (that.nextDocUrl) {
                            WinJS.Promise.timeout(250).then(function () {
                                Log.print(Log.l.trace, "calling select ContactList.contactDocView...");
                                var nextDocUrl = that.nextDocUrl;
                                that.nextDocUrl = null;
                                InfodeskEmpList.userPhotoView.selectNext(function (jsonDoc) {
                                    // this callback will be called asynchronously
                                    // when the response is available
                                    Log.print(Log.l.trace, "ContactList.contactDocView: success!");
                                    // startContact returns object already parsed from json file in response
                                    if (jsonDoc && jsonDoc.d) {
                                        that.nextDocUrl = InfodeskEmpList.userPhotoView.getNextUrl(jsonDoc);
                                        var resultsDoc = jsonDoc.d.results;
                                        resultsDoc.forEach(function (item, index) {
                                            that.resultDocConverter(item, that.binding.doccount);
                                            that.binding.doccount = that.docs.push(item);
                                        });
                                    }
                                }, function (errorResponse) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                    Log.print(Log.l.error, "ContactList.contactDocView: error!");
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                }, null, nextDocUrl);
                            });
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //Log.print(Log.l.error, "ContactList.contactView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    },
                    null,
                    nextUrl);
                } else {
                    if (progress && progress.style) {
                        progress.style.display = "none";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "inline";
                    }
                    that.loading = false;
                }
                Log.ret(Log.l.trace);
            }
            this.loadNextUrl = loadNextUrl;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "InfodeskEmpList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    if (that.employees && that.employees.length) {
                        for (var i = 0; i < that.employees.length; i++) {
                            var employee = that.employees.getAt(i);
                            if (employee && typeof employee === "object" &&
                                (employee.MitarbeiterID || employee.MitarbeiterVIEWID) === recordId) {
                                listView.winControl.selection.set(i);
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var resultConverter = function (item, index) {
                //if (restriction.Aktiv.length === 2) {
                item.index = index;
                item.fullName =
                (item.Vorname ? (item.Vorname + " ") : "") +
                (item.Nachname ? item.Nachname : ""); // muss geändert werden
                //}
                if (item.INITBenAnwID !== 0 && item.INITBenAnwID !== null && item.Present !== 1) {
                    var map = InfodeskEmpList.initBenAnwView.getMap();
                    var results = InfodeskEmpList.initBenAnwView.getResults();
                    if (map && results) {
                        var curIndex = map[item.INITBenAnwID];
                        item.title = results[curIndex].TITLE;
                    }
                }
                item.OvwContentDOCCNT3 = "";
                if (that.docs && index >= that.firstContactsIndex) {
                    for (var i = 0; i < that.docs.length; i++) {
                        var doc = that.docs[i];
                        if (doc.DOC1MitarbeiterVIEWID === item.MitarbeiterVIEWID) {
                            var docContent = doc.OvwContentDOCCNT3 ? doc.OvwContentDOCCNT3 : doc.DocContentDOCCNT1;
                            if (docContent) {
                                var sub = docContent.search("\r\n\r\n");
                                item.OvwContentDOCCNT3 = "data:image/jpeg;base64," + docContent.substr(sub + 4);
                            }
                            that.firstDocsIndex = i + 1;
                            that.firstContactsIndex = index + 1;
                            break;
                        }
                    }
                }
            }
            this.resultConverter = resultConverter;

            var resultDocConverter = function (item, index) {

                if (that.employees) {
                    for (var i = 0; i < that.employees.length; i++) { // geänderte Stelle
                        var employee = that.employees.getAt(i);
                        if ((employee.MitarbeiterID || employee.MitarbeiterVIEWID) === item.DOC1MitarbeiterVIEWID) {
                            var docContent = item.OvwContentDOCCNT3
                                   ? item.OvwContentDOCCNT3
                                   : item.DocContentDOCCNT1;
                            if (docContent) {
                                var sub = docContent.search("\r\n\r\n");
                                employee.OvwContentDOCCNT3 = "data:image/jpeg;base64," + docContent.substr(sub + 4);
                            } else {
                                employee.OvwContentDOCCNT3 = "";
                            }
                            // preserve scroll position on change of row data!
                            var indexOfFirstVisible = -1;
                            if (listView && listView.winControl) {
                                indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                            }
                            that.employees.setAt(i, employee);
                            if (i === 0 && listView && listView.winControl) {
                                listView.winControl.indexOfFirstVisible = indexOfFirstVisible;
                            }
                            that.firstContactsIndex = i + 1;
                            that.firstDocsIndex = index + 1;
                            that.binding.photoData = employee.OvwContentDOCCNT3;
                            break;
                        }
                    }
                }
            }
            this.resultDocConverter = resultDocConverter;
            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Infodesk.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && (item.data.MitarbeiterID || item.data.MitarbeiterVIEWID)) {
                                        //&&(item.data.MitarbeiterID || item.data.MitarbeiterVIEWID) !== that.binding.employeeId
                                        // called asynchronously if ok
                                        var employeeId = item.data.MitarbeiterID || item.data.MitarbeiterVIEWID;
                                        var curPageId = Application.getPageId(nav.location);
                                        if ((curPageId === "infodesk" || curPageId === "infodeskEmpList") &&
                                            typeof AppBar.scope.loadData === "function") {
                                            if (employeeId) {
                                                that.binding.employeeId = employeeId;
                                                AppBar.scope.loadData(that.binding.employeeId);
                                            }
                                            
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        // single list selection
                        if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                            listView.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                        }
                        // direct selection on each tap
                        if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                            listView.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                        }
                        // Double the size of the buffers on both sides
                        if (!maxLeadingPages) {
                            maxLeadingPages = listView.winControl.maxLeadingPages * 4;
                            listView.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = listView.winControl.maxTrailingPages * 4;
                            listView.winControl.maxTrailingPages = maxTrailingPages;
                        }
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.EmpListLayout.EmployeesLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);

                            //that.loadNextUrl();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible) {
                            var contentHeader = listView.querySelector(".content-header");
                            if (contentHeader) {
                                var halfCircle = contentHeader.querySelector(".half-circle");
                                if (halfCircle && halfCircle.style) {
                                    if (halfCircle.style.visibility === "hidden") {
                                        halfCircle.style.visibility = "";
                                        WinJS.UI.Animation.enterPage(halfCircle);
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.employees && that.nextUrl) {
                            that.loading = true;
                            that.loadNextUrl();
                        } else {
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
               /* changeSearchField: function (event) {
                    setTimeout(function () {
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
                       // var master = Application.navigator.masterControl;
                        //if (master && master.controller && master.controller.binding) {
                            //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                            that.loadData().then(function () {
                                if (that.binding.employeeId)
                                    that.selectRecordId(that.binding.employeeId);
                            });
                        //}
                    }, 2000);

                }*/
            };

            this.disableHandlers = null;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            var loadData = function (recordid) {
                Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                that.loading = true;
                if (listView && listView.querySelector(".list-footer .progress")) {
                    progress = listView.querySelector(".list-footer .progress");
                }
                if (listView && listView.querySelector(".list-footer .counter")) {
                    counter = listView.querySelector(".list-footer .counter");
                }

                if (progress && progress.style) {
                    progress.style.display = "inline";
                }
                if (counter && counter.style) {
                    counter.style.display = "none";
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!InfodeskEmpList.initBenAnwView.getResults().length) {
                        return InfodeskEmpList.initBenAnwView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "InitBenAnw: success!");
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var restriction = AppData.getRestriction("SkillEntry");
                    var defaultrestriction = InfodeskEmpList.defaultRestriction;
                    if (!restriction) {
                        restriction = defaultrestriction;
                    }
                    if (restriction.OrderAttribute === "Vorname") {
                        if (btnName) {
                            btnName.textContent = getResourceText("infodeskEmpList.name");
                        }
                    } else {
                        if (btnFirstName) {
                            btnFirstName.textContent = getResourceText("infodeskEmpList.firstName");
                        }
                    }
                    if (restriction.Names && restriction.Names.length > 0) {
                        //restriction.bUseOr = true;
                        that.binding.dataEmployee.Names = restriction.Names;
                    }
                    if (restriction.countCombobox && restriction.countCombobox > 0) {
                        return InfodeskEmpList.employeeSkillentryView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "InfodeskEmpList: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                that.nextskillentryUrl = InfodeskEmpList.employeeSkillentryView.getNextUrl(json);
                                var results = json.d.results;

                                //hole anhand der recordid die Fähigkeiten des jeweiligen Mitarbeiters mit der recordid

                                var actualItem = null;
                                var resultsUnique = [];
                                if (restriction.countCombobox >= 1) {
                                    var zähler = 0;
                                    results.forEach(function (item) {
                                        if (!actualItem)
                                            actualItem = item;
                                        if (actualItem.Login === item.Login)
                                            zähler++;
                                        else {
                                            actualItem = item;
                                            zähler = 1;
                                        }
                                        if (zähler === restriction.countCombobox) {
                                            resultsUnique.push(actualItem);
                                            zähler = 0;
                                            actualItem = null;
                                        }
                                    });
                                } else {
                                    //Die Mitarbeiterliste muss zu Beginn unique Mitarbeiter sein
                                    results.forEach(function (item, index) {
                                        if (!actualItem) {
                                            actualItem = item;
                                            resultsUnique.push(actualItem);
                                        }

                                        if (actualItem.Login !== item.Login) {
                                            actualItem = item;
                                            resultsUnique.push(actualItem);
                                        }
                                        if (results.length - 1 === 99)
                                            lastPrevLogin = actualItem;
                                    });
                                }
                                results = resultsUnique;
                                that.binding.count = results.length;

                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.employees = new WinJS.Binding.List(results);
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.employees.dataSource;
                                }
                                Log.print(Log.l.trace, "Data loaded");
                                /*if (results[0]) {
                                    WinJS.Promise.timeout(0).then(function () {
                                        that.selectRecordId(results[0].MitarbeiterVIEWID);
                                    });
                                }*/
                            } else {
                                that.binding.count = 0;
                                that.nextskillentryUrl = null;
                                that.employees = null;
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = null;
                                }
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }, restriction, {
                           orderAttribute: restriction.OrderAttribute, desc: true
                        }); //that.binding.restriction beim neuladen ist die leer
                    } else {
                        return InfodeskEmpList.employeeView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "EmpList: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.count = json.d.results.length;
                                that.nextUrl = InfodeskEmpList.employeeView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.employees = new WinJS.Binding.List(results);

                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.employees.dataSource;
                                }
                                if (that.refreshPromise) {
                                    that.refreshPromise.cancel();
                                }
                                that.refreshPromise = WinJS.Promise.timeout(that.refreshWaitTimeMs).then(function () {
                                    that.loadData();
                                });
                            } else {
                                that.binding.count = 0;
                                that.nextUrl = null;
                                that.employees = null;
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = null;
                                }
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                                if (that.refreshPromise) {
                                    that.refreshPromise.cancel();
                                }
                                that.refreshPromise = WinJS.Promise.timeout(that.refreshWaitTimeMs).then(function () {
                                    that.loadData();
                                });
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }, restriction);
                    }
                }).then(function () {
                    if (that.binding.employeeId) {
                        that.selectRecordId(that.binding.employeeId);
                    }
                    // todo: load image data and set src of img-element
                    Log.print(Log.l.trace, "calling select userPhotoView...");
                    return WinJS.Promise.timeout(250).then(function () {
                        return InfodeskEmpList.userPhotoView.select(function (json) {
                            Log.print(Log.l.trace, "userPhotoView: success!");
                            if (json && json.d) {
                                that.binding.doccount = json.d.results.length;
                                that.nextDocUrl = InfodeskEmpList.userPhotoView.getNextUrl(json);
                                var results = json.d.results;

                                results.forEach(function (item, index) {
                                    that.resultDocConverter(item, index);
                                });
                                that.docs = results;
                            } else {
                                that.binding.photoData = "";
                            }

                        }, function (errorResponse) {
                            that.binding.photoData = "";
                        });
                    });
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    AppBar.notifyModified = true;
                    that.waitForIdleAction();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return that.selectRecordId(that.binding.employeeId);
            }).then(function () {
                Log.print(Log.l.trace, "Record selected");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
            nextUrl: null,
            loading: false,
            employees: null
        })
    });
})();
