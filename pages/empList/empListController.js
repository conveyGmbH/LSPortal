// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/empList/empListService.js" />
/// <reference path="~/www/pages/empList/exportXlsx.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "EmpList";

    WinJS.Namespace.define("EmpList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            var restriction = AppData.getRestriction("Employee");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                employeeId: 0,
                searchString: (restriction && restriction.Vorname) ? restriction.Vorname[0] : "",
                hasTwoFactor: null,
                locked: null,
                licenceWarning: false,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                btnFirstNameText: getResourceText("employee.firstName"),
                btnNameText: getResourceText("employee.name"),
                btnEmployeeLicenceText: getResourceText("employee.licence")
            }, commandList, true]);
            this.nextUrl = null;
            this.employees = null;
            this.selectEmployeePromise = null;
            this.licenceWarningSelected = false;
            this.busy = false;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#employeeList.listview");

            this.dispose = function () {
                if (that.selectEmployeePromise) {
                    that.selectEmployeePromise.cancel();
                }
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.employees) {
                    that.employees = null;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

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

            var setSelIndex = function (index) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "index=" + index);
                if (that.employees && that.employees.length > 0) {
                    if (index >= that.employees.length) {
                        index = that.employees.length - 1;
                    }
                    that.binding.selIdx = index;
                    listView.winControl.selection.set(index);
                }
                Log.ret(Log.l.trace);
            }
            this.setSelIndex = setSelIndex;


            var cutSerialNumber = function (serialNumber) {
                var ret = "";
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                if (typeof serialNumber === "string") {
                    var sub = serialNumber.search("0000000000");
                    if (sub >= 0) {
                        ret = serialNumber.substr(sub + 10);
                    } else {
                        ret = serialNumber;
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.cutSerialNumber = cutSerialNumber;

            var scrollToRecordId = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (that.binding.loading) {
                    WinJS.Promise.timeout(50).then(function () {
                        that.scrollToRecordId(recordId);
                    });
                } else {
                    if (recordId && listView && listView.winControl && that.employees) {
                        for (var i = 0; i < that.employees.length; i++) {
                            var employee = that.employees.getAt(i);
                            if (employee && typeof employee === "object" &&
                                employee.MitarbeiterVIEWID === recordId) {
                                listView.winControl.indexOfFirstVisible = i;
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.scrollToRecordId = scrollToRecordId;

            var selectRecordId = function (recordId) {
                var employee;
                if (!recordId) {
                    recordId = that.binding.employeeId;
                }
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (listView && listView.winControl && listView.winControl.selection && that.employees) {
                    var recordIdNotFound = true;
                    for (var i = 0; i < that.employees.length; i++) {
                        employee = that.employees.getAt(i);
                        if (employee && typeof employee === "object" && employee.MitarbeiterVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            that.scrollToRecordId(recordId);
                            recordIdNotFound = false;
                            break;
                        }
                    }
                    if (recordIdNotFound) {
                        if (that.nextUrl) {
                            that.loadNextUrl(recordId);
                        } else {
                            listView.winControl.selection.set(0);
                            var curPageId = Application.getPageId(nav.location);
                            if ((curPageId === "employee" ||
                                 curPageId === "skillEntry") &&
                                typeof AppBar.scope.loadData === "function") {
                                employee = that.employees.getAt(0);
                                if (employee) {
                                    that.binding.employeeId = employee.MitarbeiterVIEWID;
                                } else {
                                    that.binding.employeeId = 0;
                                }
                                AppBar.scope.loadData(that.binding.employeeId);
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var loadNextUrl = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (that.employees && that.nextUrl && listView &&
                    (!recordId || recordId === that.binding.employeeId)) {
                    that.busy = true;
                    that.binding.loading = true;
                    AppData.setErrorMsg(that.binding);
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    Log.print(Log.l.trace, "calling select EmpList.employeeView...");
                    that.refreshNextPromise = EmpList.employeeView.selectNext(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "EmpList.employeeView: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            that.nextUrl = EmpList.employeeView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                                that.binding.count = that.employees.push(item);
                            });
                        } else {
                            that.binding.loading = false;
                        }
                        that.busy = false;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.busy = false;
                        that.binding.loading = false;
                    }, null, nextUrl);
                }
                Log.ret(Log.l.trace);
                return that.refreshNextPromise;
            }
            this.loadNextUrl = loadNextUrl;


            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.employees.length; i++) {
                    var employee = that.employees.getAt(i);
                    if (employee && typeof employee === "object" &&
                        employee.MitarbeiterVIEWID === recordId) {
                        item = employee;
                        break;
                    }
                }
                if (item) {
                    Log.ret(Log.l.trace, "i=" + i);
                    return { index: i, item: item };
                } else {
                    Log.ret(Log.l.trace, "not found");
                    return null;
                }
            };
            this.scopeFromRecordId = scopeFromRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
                item.Names = "";
                item.fullName = (item.Vorname && item.Nachname)
                    ? (item.Vorname + " " + item.Nachname)
                    : (item.Vorname ? item.Vorname
                        : (item.Nachname ? item.Nachname : ""));
                item.nameInitial = (item.Vorname && item.Nachname)
                    ? item.Vorname.substr(0, 1) + item.Nachname.substr(0, 1)
                    : (item.Vorname ? item.Vorname.substr(0, 2) : item.Nachname ? item.Nachname.substr(0, 2) : "");
                item.nameInitialBkgColor = Colors.getColorFromNameInitial(item.nameInitial);
                if (typeof item.CS1504SerienNr === "string") {
                    item.CS1504SerienNr = that.cutSerialNumber(item.CS1504SerienNr);
                }
                item.recordIcon = Binding.Converter.getIconFromID(item.IconID, "EmpList");
                if (!item.recordIcon) {
                    item.recordIcon = "user";
                }
                if (item.Locked) {
                    item.addonIcon = "delete";
                    item.addonColor = "firebrick";
                    item.addonIconTitle = item.ReasonLocked;
                } else if (item.HasTwoFactor) {
                    item.addonIcon = "lock";
                    item.addonColor = "forestgreen";
                    item.addonIconTitle = "2FA enabled";
                } else {
                    item.addonIcon = "";
                    item.addonColor = "transparent";
                    item.addonIconTitle = "";
                }
            }
            this.resultConverter = resultConverter;

            var checkLoadingFinished = function () {
                WinJS.Promise.timeout(10).then(function () {
                    if (!that.busy) {
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
                                    if (AppBar.scope && AppBar.scope.binding.isVeranstaltungComboboxVisible) {
                                        AppBar.scope.binding.isVeranstaltungComboboxVisible = false;
                                    }
                                    if (item.data && item.data.MitarbeiterVIEWID &&
                                        item.data.MitarbeiterVIEWID !== that.binding.employeeId) {
                                        if (AppBar.scope &&
                                            typeof AppBar.scope.saveData === "function") {
                                            AppBar.scope.saveData(function (response) {
                                                // called asynchronously if ok
                                                that.binding.employeeId = item.data.MitarbeiterVIEWID;
                                                that.binding.hasTwoFactor = item.data.HasTwoFactor;
                                                that.binding.locked = item.data.Locked;
                                                that.binding.selIdx = item.index;
                                                var curPageId = Application.getPageId(nav.location);
                                                if ((curPageId === "employee" || curPageId === "skillentry" || curPageId === "employeeVisitorFlow") &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData(that.binding.employeeId);
                                                } else {
                                                    Application.navigateById("employee");
                                                }
                                            }, function (errorResponse) {
                                                if (that.binding.employeeId) {
                                                    that.selectRecordId();
                                                }
                                            });
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
                    var i;
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
                            if (that.employees && that.employees.length > 0) {
                                var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                                for (i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                    var element = listView.winControl.elementFromIndex(i);
                                    if (element && element.parentElement && element.parentElement.parentElement) {
                                        if (element.firstElementChild) {
                                            if (element.firstElementChild.disabled &&
                                                !AppHeader.controller.binding.userData.SiteAdmin) {
                                                if (!WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.addClass(element, "win-nonselectable");
                                                }
                                                if (!WinJS.Utilities.hasClass(element.parentElement.parentElement, "win-disabled")) {
                                                    WinJS.Utilities.addClass(element.parentElement.parentElement, "win-disabled");
                                                }
                                            } else {
                                                if (WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.removeClass(element, "win-nonselectable");
                                                }
                                                if (WinJS.Utilities.hasClass(element.parentElement.parentElement, "win-disabled")) {
                                                    WinJS.Utilities.removeClass(element.parentElement.parentElement, "win-disabled");
                                                }
                                            }
                                        }
                                    }
                                }
                                // load SVG images
                                Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor, "name");
                                Colors.loadSVGImageElements(listView, "addon-image", 16, "#ffffff", "name", null, {
                                    "lock": {
                                        strokeWidth: 600
                                    },
                                    "delete": {
                                        strokeWidth: 600
                                    }
                                });
                                Colors.loadSVGImageElements(listView, "warning-image", 40, Colors.offColor);
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            that.checkLoadingFinished();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible) {
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

            var loadData = function (recordId) {
                var prevLicenceWarning = that.binding.licenceWarning;
                var jsonResponse = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId + "prevID" + that.binding.employeeId);
                if (that.selectEmployeePromise) {
                    that.selectEmployeePromise.cancel();
                }
                restriction = AppData.getRestriction("Employee");
                Log.print(Log.l.trace, "EmpList.Controller. restriction Employee:" + (restriction ? JSON.stringify(restriction) : ""));
                var defaultRestriction = copyByValue(EmpList.employeeView.defaultRestriction);
                if (!restriction) {
                    restriction = defaultRestriction;
                }
                if (restriction.OrderAttribute === "SortVorname") {
                    if (restriction.OrderDesc) {
                        that.binding.btnFirstNameText = getResourceText("employee.firstNameDesc");
                    } else {
                        that.binding.btnFirstNameText = getResourceText("employee.firstNameAsc");
                    }
                    that.binding.btnNameText = getResourceText("employee.name");
                    that.binding.btnEmployeeLicenceText = getResourceText("employee.licence");
                } else if (restriction.OrderAttribute === "SortNachname") {
                    that.binding.btnFirstNameText = getResourceText("employee.firstName");
                    if (restriction.OrderDesc) {
                        that.binding.btnNameText = getResourceText("employee.nameDesc");
                    } else {
                        that.binding.btnNameText = getResourceText("employee.nameAsc");
                    }
                    that.binding.btnEmployeeLicenceText = getResourceText("employee.licence");
                } else if (restriction.OrderAttribute === "NichtLizenzierteApp") {
                    that.binding.btnFirstNameText = getResourceText("employee.firstName");
                    that.binding.btnNameText = getResourceText("employee.name");
                    if (restriction.OrderDesc) {
                        that.binding.btnEmployeeLicenceText = getResourceText("employee.licenceDesc");
                    } else {
                        that.binding.btnEmployeeLicenceText = getResourceText("employee.licenceAsc");
                    }
                }
                if (!recordId) {
                    that.busy = true;
                    that.binding.loading = true;
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!that.licenceWarningSelected) {
                        return AppData.call("FCT_ExistsLicenceWarning", {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung")
                        }, function (json) {
                            Log.print(Log.l.info, "call FCT_ExistsLicenceWarning: success! FCT_ExistsLicenceWarning=" +
                                (json && json.d && json.d.results && json.d.results.FCT_ExistsLicenceWarning));
                            if (json && json.d && json.d.results && json.d.results.FCT_ExistsLicenceWarning) {
                                that.binding.licenceWarning = true;
                            } else {
                                that.binding.licenceWarning = false;
                            }
                            that.licenceWarningSelected = true;
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "call FCT_ExistsLicenceWarning: error");
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    Log.print(Log.l.trace, "calling select employeeView...");
                    return EmpList.employeeView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "select employeeView: success!");
                        jsonResponse = json;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "select employeeView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.busy = false;
                        that.binding.loading = false;
                    }, recordId || restriction);
                }).then(function () {
                    var json = jsonResponse;
                    // employeeView returns object already parsed from json file in response
                    if (!recordId) {
                        if (json && json.d && json.d.results.length > 0) {
                            that.binding.count = json.d.results.length;
                            that.nextUrl = EmpList.employeeView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.employees = new WinJS.Binding.List(results);
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.employees.dataSource;
                            }
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;
                            that.employees = null;
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                            that.binding.loading = false;
                        }
                        that.busy = false;
                    } else {
                        if (json && json.d) {
                            var employee = json.d;
                            that.resultConverter(employee);
                            var objectRec = scopeFromRecordId(recordId);
                            if (objectRec && objectRec.index >= 0) {
                                that.employees.setAt(objectRec.index, employee);
                                that.binding.employeeId = recordId;
                                that.binding.hasTwoFactor = employee.HasTwoFactor;
                                that.binding.locked = employee.Locked;
                            } else {
                                ret = that.loadData();
                            }
                        }
                    }
                    return WinJS.Promise.as();
                }).then(function () {
                    if (that.binding.employeeId) {
                        that.selectRecordId();
                    }
                    var pageControl = pageElement.winControl;
                    if (pageControl && pageControl.updateLayout && !pageControl.inResize &&
                        prevLicenceWarning !== that.binding.licenceWarning) {
                        pageControl.prevWidth = 0;
                        pageControl.prevHeight = 0;
                        pageControl.updateLayout.call(pageControl, pageElement);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            if (!AppData._persistentStates.showvisitorFlow) {
                NavigationBar.disablePage("employeeVisitorFlow");
            }
            //#8443 only TEMP - Admin cant see it 
            NavigationBar.disablePage("skillentry");

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();
