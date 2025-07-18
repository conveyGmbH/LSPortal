// controller for page: info
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
    var namespaceName = "InfodeskEmpList";

    WinJS.Namespace.define("InfodeskEmpList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataEmployee: getEmptyDefaultValue(InfodeskEmpList.defaultValue),
                btnFirstNameText: getResourceText("employee.firstName"),
                btnNameText: getResourceText("employee.name"),
                btnEmployeeLicenceText: getResourceText("employee.licence"),
                mitarbeiterText: getResourceText("infodesk.employee"),
                employeeId: null,
                eventId: null,
                searchString: "",
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic
            }, commandList, true]);

            this.refreshPromise = null;
            this.refreshWaitTimeMs = 1000 * 30;

            this.nextUrl = null;
            this.nextskillentryUrl = null;
            this.nextDocUrl = null;
            this.employees = null;
            this.docs = null;
            this.events = null;

            this.firstDocsIndex = 0;
            this.firstEmployeesIndex = 0;

            var that = this;

            var eventsDropdown = pageElement.querySelector("#events");

            // ListView control
            var listView = pageElement.querySelector("#infodeskEmployeeList.listview");
            var btnFirstName = document.getElementById("btn_firstName");
            var btnName = document.getElementById("btn_Name");
            var progress = null;
            var counter = null;
            var layout = null;
            var lastPrevLogin = [];
            this.docs = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var getOrderLicenceBtn = function () {
                return pageElement.querySelector("#orderLicenceBtn");
            }
            this.getOrderLicenceBtn = getOrderLicenceBtn;

            var highlightorderLicenceBtn = function (state) {
                if (state === 1) {
                    pageElement.querySelector("#orderLicenceBtn").style.borderColor = Colors.offColor;
                } else {
                    pageElement.querySelector("#orderLicenceBtn").style.borderColor = "transparent";
                }
            }
            this.highlightorderLicenceBtn = highlightorderLicenceBtn;

            var getEventId = function () {
                Log.print(Log.l.trace, "getEventId Event._eventId=" + that.binding.eventId);
                return that.binding.eventId;
            }
            this.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "setEventId eventId=" + value);
                that.binding.eventId = value;
            }
            this.setEventId = setEventId;

            var cancelPromises = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (that.refreshPromise) {
                    Log.print(Log.l.trace, "cancel previous refresh Promise");
                    that.refreshPromise.cancel();
                    that.refreshPromise = null;
                }
                Log.ret(Log.l.trace);
            }
            this.cancelPromises = cancelPromises;

            this.dispose = function () {
                that.cancelPromises();
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.employees) {
                    that.employees = null;
                }
                if (that.events) {
                    that.events = null;
                }
                AppData.setRestriction("SkillEntry", {});
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
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (!recordId) {
                    recordId = that.binding.employeeId;
                }
                if (that.employees && that.nextskillentryUrl && listView) {
                    AppBar.busy = true;
                    that.binding.loading = true;
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select InfodeskEmpList.employeeView...");
                    ret = InfodeskEmpList.employeeSkillentryView.selectNext(function (json) { //skillentryview employeeView
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "InfodeskEmpList.employeeView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0 && that.employees) {
                            that.nextskillentryUrl =
                                InfodeskEmpList.employeeSkillentryView.getNextUrl(json); //that.nextskillentryview
                            var results = json.d.results;

                            //hole anhand der recordid die Fähigkeiten des jeweiligen Mitarbeiters mit der recordid

                            var actualItem = null;
                            var resultsUnique = [];
                            if (that.binding.restriction.countCombobox >= 1) {
                                var zähler = 0;
                                results.forEach(function (item) {
                                    if (!actualItem) {
                                        actualItem = item;
                                    }
                                    if (actualItem.Login === item.Login) {
                                        zähler++;
                                    } else {
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
                                        if (lastPrevLogin.MitarbeiterID !== actualItem.MitarbeiterID ||
                                            lastPrevLogin.MitarbeiterVIEWID !== actualItem.MitarbeiterVIEWID) {
                                            resultsUnique.push(actualItem);
                                        }
                                    }
                                    if (actualItem.Login !== item.Login) {
                                        actualItem = item;
                                        resultsUnique.push(actualItem);
                                    }
                                    if (index === results.length - 1) {
                                        lastPrevLogin = actualItem;
                                    }
                                });
                            }
                            Log.print(lastPrevLogin);
                            results = resultsUnique;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.employees.push(item);
                            });
                        } else {
                            that.nextskillentryUrl = null;
                        }
                        if (recordId) {
                            that.selectRecordId(recordId);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        that.nextskillentryUrl = null;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        AppBar.busy = false;
                        that.binding.loading = false;
                    }, null, that.nextskillentryUrl);
                } else if (that.employees && that.nextUrl && listView) {
                    AppBar.busy = true;
                    that.binding.loading = true;
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select InfodeskEmpList.employeeView...");
                    ret = InfodeskEmpList.employeeView.selectNext(function (json) {
                        Log.print(Log.l.trace, "InfodeskEmpList.employeeView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0 && that.employees) {
                            that.nextUrl = InfodeskEmpList.employeeView.getNextUrl(json); //that.nextskillentryview
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                                that.binding.count = that.employees.push(item);
                            });
                        } else {
                            that.nextUrl = 0;
                        }
                        if (recordId) {
                            that.selectRecordId(recordId);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        that.nextUrl = 0;
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.binding.loading = false;
                    }, null, that.nextUrl);
                } else {
                    ret = WinJS.Promise.as();
                }
                ret = ret.then(function () {
                    if (that.nextDocUrl) {
                        return WinJS.Promise.timeout(250);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.nextDocUrl) {
                        Log.print(Log.l.trace, "calling select InfodeskEmpList.employeeDocView...");
                        return InfodeskEmpList.userPhotoView.selectNext(function (jsonDoc) {
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
                            } else {
                                that.nextDocUrl = null;
                            }
                            AppBar.busy = false;
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            that.nextDocUrl = null;
                            AppBar.busy = false;
                            Log.print(Log.l.error, "InfodeskEmpList.employeeDocView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, null, that.nextDocUrl);
                    } else {
                        if (recordId) {
                            that.selectRecordId(recordId);
                        }
                        AppBar.busy = false;
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadNextUrl = loadNextUrl;

            var scopeFromRecordId = function (recordId) {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (that.employees && recordId) {
                    var i, item = null;
                    for (i = 0; i < that.employees.length; i++) {
                        var employee = that.employees.getAt(i);
                        if (employee && typeof employee === "object" &&
                            (employee.MitarbeiterID || employee.MitarbeiterVIEWID) === recordId) {
                            item = employee;
                            break;
                        }
                    }
                    if (item) {
                        Log.print(Log.l.trace, "found i=" + i);
                        ret = { index: i, item: item };
                    } else {
                        Log.print(Log.l.trace, "not found");
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.scopeFromRecordId = scopeFromRecordId;

            var scrollToRecordId = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (that.binding.loading ||
                    listView && listView.winControl && listView.winControl.loadingState !== "complete") {
                    WinJS.Promise.timeout(50).then(function () {
                        that.scrollToRecordId(recordId);
                    });
                } else if (listView && listView.winControl) {
                    var scope = that.scopeFromRecordId(recordId);
                    if (scope && scope.index >= 0) {
                        listView && listView.winControl.ensureVisible(scope.index);
                        WinJS.Promise.timeout(50).then(function () {
                            var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                            var elementOfFirstVisible = listView.winControl.elementFromIndex(indexOfFirstVisible);
                            var element = listView.winControl.elementFromIndex(scope.index);
                            var height = listView.clientHeight;
                            if (element && elementOfFirstVisible) {
                                var offsetDiff = element.offsetTop - elementOfFirstVisible.offsetTop;
                                if (offsetDiff > height - element.clientHeight) {
                                    listView.winControl.scrollPosition += offsetDiff - (height - element.clientHeight);
                                } else if (offsetDiff < 0) {
                                    listView.winControl.indexOfFirstVisible = scope.index;
                                }
                            }
                        });
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.scrollToRecordId = scrollToRecordId;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    if (that.employees && that.employees.length) {
                        var bFound = false;
                        for (var i = 0; i < that.employees.length; i++) {
                            var employee = that.employees.getAt(i);
                            if (employee && typeof employee === "object" &&
                                (employee.MitarbeiterID || employee.MitarbeiterVIEWID) === recordId) {
                                listView.winControl.selection.set(i);
                                that.scrollToRecordId(recordId);
                                bFound = true;
                                break;
                            }
                        }
                        if (!bFound) {
                            if (that.nextUrl || that.nextskillentryUrl) {
                                that.loadNextUrl(recordId);
                            } else {
                                listView.winControl.selection.set(0);
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
                item.nameInitial = (item.Vorname && item.Nachname)
                    ? item.Vorname.substr(0, 1) + item.Nachname.substr(0, 1)
                    : (item.Vorname ? item.Vorname.substr(0, 2) : item.Nachname ? item.Nachname.substr(0, 2) : "");
                item.nameInitialBkgColor = Colors.getColorFromNameInitial(item.nameInitial);
                if (item.INITBenAnwID !== 0 && item.INITBenAnwID !== null && item.Present !== 1) {
                    var map = InfodeskEmpList.initBenAnwView.getMap();
                    var results = InfodeskEmpList.initBenAnwView.getResults();
                    if (map && results) {
                        var curIndex = map[item.INITBenAnwID];
                        item.title = results[curIndex].TITLE;
                    }
                }
                item.onlineColor = "gray";
                if (item.LastCallTS) {
                    var lastCallDate = getDateObject(item.LastCallTS);
                    if (lastCallDate) {
                        var lastCallMs = lastCallDate.getTime();
                        var diffMinutes = (Date.now() - lastCallMs) / 60000;
                        if (diffMinutes > 15) {
                            item.onlineColor = Colors.offColor;
                        } else if (diffMinutes > 3) {
                            item.onlineColor = Colors.pauseColor;
                        } else {
                            item.onlineColor = Colors.onColor;
                        }
                    }
                }
                item.OvwContentDOCCNT3 = "";
                if (that.docs) {  //   && index >= that.firstEmployeesIndex
                    for (var i = 0; i < that.docs.length; i++) {
                        var doc = that.docs[i];
                        if (doc.DOC1MitarbeiterVIEWID === item.MitarbeiterVIEWID) {
                            var docContent = doc.OvwContentDOCCNT3 ? doc.OvwContentDOCCNT3 : doc.DocContentDOCCNT1;
                            if (docContent) {
                                var sub = docContent.search("\r\n\r\n");
                                if (sub >= 0) {
                                    var data = docContent.substr(sub + 4);
                                    if (data && data !== "null") {
                                        item.OvwContentDOCCNT3 = "data:image/jpeg;base64," + data;
                                    } else {
                                        item.OvwContentDOCCNT3 = "";
                                    }
                                } else {
                                    item.OvwContentDOCCNT3 = "";
                                }
                            } else {
                                item.OvwContentDOCCNT3 = "";
                            }
                            that.firstDocsIndex = i + 1;
                            that.firstEmployeesIndex = index + 1;
                            break;
                        }
                    }
                }
            }
            this.resultConverter = resultConverter;

            var resultDocConverter = function (item, index) {
                if (that.employees) { // && index >= that.firstDocsIndex
                    for (var i = 0; i < that.employees.length; i++) { // geänderte Stelle
                        var employee = that.employees.getAt(i);
                        if ((employee.MitarbeiterID || employee.MitarbeiterVIEWID) === item.DOC1MitarbeiterVIEWID) {
                            var docContent = item.OvwContentDOCCNT3
                                ? item.OvwContentDOCCNT3
                                : item.DocContentDOCCNT1;
                            if (docContent) {
                                var sub = docContent.search("\r\n\r\n");
                                if (sub >= 0) {
                                    var data = docContent.substr(sub + 4);
                                    if (data && data !== "null") {
                                        employee.OvwContentDOCCNT3 = "data:image/jpeg;base64," + data;
                                    } else {
                                        employee.OvwContentDOCCNT3 = "";
                                    }
                                } else {
                                    employee.OvwContentDOCCNT3 = "";
                                }
                            } else {
                                employee.OvwContentDOCCNT3 = "";
                            }
                            // preserve scroll position on change of row data!
                            var indexOfFirstVisible = -1;
                            if (listView && listView.winControl) {
                                indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                            }
                            that.employees.setAt(i, employee);
                            if (indexOfFirstVisible >= 0 && listView && listView.winControl) {
                                listView.winControl.indexOfFirstVisible = indexOfFirstVisible;
                            }
                            that.firstEmployeesIndex = i + 1;
                            that.firstDocsIndex = index + 1;
                            that.binding.photoData = employee.OvwContentDOCCNT3;
                            break;
                        }
                    }
                }
            }
            this.resultDocConverter = resultDocConverter;

            var checkLoadingFinished = function () {
                WinJS.Promise.timeout(10).then(function () {
                    if (!AppBar.busy) {
                        that.binding.loading = false;
                    } else {
                        WinJS.Promise.timeout(100).then(function () {
                            that.checkLoadingFinished();
                        });
                    }
                });
            }
            this.checkLoadingFinished = checkLoadingFinished;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                                        that.binding.employeeId = item.data.MitarbeiterID || item.data.MitarbeiterVIEWID;
                                        var curPageId = Application.getPageId(nav.location);
                                        if ((curPageId === "infodesk") &&
                                            typeof AppBar.scope.loadData === "function") {
                                            AppBar.scope.loadData(that.binding.employeeId);
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                        } else if (listView.winControl.loadingState === "complete") {
                            that.checkLoadingFinished();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.employees && (that.nextUrl || that.nextskillentryUrl)) {
                            that.loadNextUrl();
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = null;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            var loadData = function () {
                var ret;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.firstDocsIndex = 0;
                that.firstEmployeesIndex = 0;
                AppBar.busy = true;
                that.binding.loading = true;
                AppData.setErrorMsg(that.binding);
                that.cancelPromises();
                ret = new WinJS.Promise.as().then(function () {
                    if (!that.events) {
                        return InfodeskEmpList.eventView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "eventView: success!");
                            // eventView returns object already parsed from json file in response
                            if (json && json.d && json.d.results.length > 0) {
                                var results = json.d.results;
                                that.events = new WinJS.Binding.List(results);
                                if (eventsDropdown && eventsDropdown.winControl) {
                                    eventsDropdown.winControl.data = that.events;
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
                    if (!restriction) {
                        restriction = InfodeskEmpList.defaultRestriction;
                    }
                    restriction.VeranstaltungID = that.binding.eventId || AppData.getRecordId("Veranstaltung");

                    if (restriction.OrderAttribute === "SortVorname") {
                        if (btnName) {
                            if (restriction.btn_textContent) {
                                btnFirstName.textContent = restriction.btn_textContent;
                            }
                            btnName.textContent = getResourceText("infodeskEmpList.name");
                        }
                    } else {
                        if (btnFirstName) {
                            if (restriction.btn_textContent) {
                                btnName.textContent = restriction.btn_textContent;
                            }
                            btnFirstName.textContent = getResourceText("infodeskEmpList.firstName");
                        }
                    }

                    // Wenn Nachricht vorhanden dann sortiere nach info2 und info2TS
                    /*if (AppData._userMessagesData.MessagesCounter && AppData._userMessagesData.MessagesCounter > 0) {
                        restriction.OrderAttribute = "Info1TS";
                        restriction.OrderDesc = true;
                    }*/
                    //if (restriction.Names && restriction.Names.length > 0) {
                    //restriction.bUseOr = true;
                    //that.binding.dataEmployee.Names = restriction.Names;
                    //}
                    that.nextUrl = null;
                    that.nextskillentryUrl = null;
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
                                if (listView && listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.employees.dataSource;
                                    Log.print(Log.l.trace, "Data loaded");
                                }
                            } else {
                                that.binding.count = 0;
                                that.nextskillentryUrl = null;
                                listView.winControl.itemDataSource = null;
                                that.employees = null;
                                AppBar.busy = false;
                                that.binding.loading = false;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            AppBar.busy = false;
                            that.binding.loading = false;
                        }, restriction); //that.binding.restriction beim neuladen ist die leer
                    } else {
                        return InfodeskEmpList.employeeView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "InfodeskEmpList: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.count = json.d.results.length;
                                that.nextUrl = InfodeskEmpList.employeeView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.employees = new WinJS.Binding.List(results);

                                if (listView && listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.employees.dataSource;
                                }
                            } else {
                                that.binding.count = 0;
                                that.nextUrl = null;
                                that.employees = null;
                                AppBar.busy = false;
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = null;
                                }
                                that.binding.loading = false;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            AppBar.busy = false;
                            that.binding.loading = false;
                        }, restriction);
                    }
                }).then(function () {
                    var restriction = AppData.getRestriction("SkillEntry");
                    var defaultrestriction = InfodeskEmpList.defaultRestriction;
                    if (!restriction) {
                        restriction = defaultrestriction;
                    }
                    // todo: load image data and set src of img-element
                    Log.print(Log.l.trace, "calling select userPhotoView...");
                    return WinJS.Promise.timeout(250);
                }).then(function () {
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
                        AppBar.busy = false;
                    }, function (errorResponse) {
                        that.binding.photoData = "";
                        AppBar.busy = false;
                    }, restriction, {
                            orderAttribute: restriction.OrderAttribute, desc: restriction.OrderDesc
                        });
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    if (that.binding.employeeId) {
                        that.selectRecordId(that.binding.employeeId);
                    } else if (listView && listView.winControl && listView.winControl.selection) {
                        listView.winControl.selection.set(0);
                    }
                    that.refreshPromise = WinJS.Promise.timeout(that.refreshWaitTimeMs).then(function () {
                        that.loadData();
                    });
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
                var restriction = AppData.getRestriction("SkillEntry");
                if (restriction && restriction.VeranstaltungID) {
                    that.binding.eventId = restriction.VeranstaltungID;
                } else {
                    that.binding.eventId = AppData.getRecordId("Veranstaltung");
                }
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
