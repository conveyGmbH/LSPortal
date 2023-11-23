// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataEmpList/genDataEmpListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("GenDataEmpList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "GenDataEmpList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                employeeId: 0,//AppData.getRecordId("Mitarbeiter")
                hasContacts: null,
                hasLocalevents: null,
                licenceWarning: false
            }, commandList, true]);
            this.nextUrl = null;
            this.loading = false;
            this.employees = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#genDataEmpList.listview");
            var btnFirstName = document.getElementById("btn_employee_firstName");
            var btnName = document.getElementById("btn_employee_Name");
            var btnEmployeeLicence = pageElement.querySelector("#btn_employee_licence");

            this.dispose = function () {
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

            var setSelIndex = function (index) {
                Log.call(Log.l.trace, "GenDataEmpList.Controller.", "index=" + index);
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


            var cutSerialnumer = function (serialnumer) {
                Log.call(Log.l.trace, "GenDataEmpList.Controller.");
                AppData.setErrorMsg(that.binding);
                if (serialnumer === null) {
                    return "";
                } else {
                    var serialnumernew = serialnumer;
                    if (serialnumernew) {
                        var sub = serialnumernew.search("0000000000");
                        serialnumernew = serialnumernew.substr(sub + 10);
                    }
                    return serialnumernew;
                }
            };
            this.cutSerialnumer = cutSerialnumer;

            var scrollToRecordId = function (recordId) {
                Log.call(Log.l.trace, "GenDataEmpList.Controller.", "recordId=" + recordId);
                if (that.loading) {
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
                Log.call(Log.l.trace, "GenDataEmpList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection && that.employees) {
                    for (var i = 0; i < that.employees.length; i++) {
                        var employee = that.employees.getAt(i);
                        if (employee && typeof employee === "object" &&
                            employee.MitarbeiterVIEWID === recordId) {
                            listView.winControl.selection.set(i).done(function () {
                                WinJS.Promise.timeout(50).then(function () {
                                    that.scrollToRecordId(recordId);
                                });
                            });
                            that.binding.hasContacts = employee.HatKontakte;
                            break;
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "Questiongroup.Controller.", "recordId=" + recordId);
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
                that.binding.hasLocalevents = AppHeader.controller.binding.userData.HasLocalEvents;
                item.Names = "";
                item.fullName = (item.Vorname ? (item.Vorname + " ") : "") + (item.Nachname ? item.Nachname : "");
                item.nameInitial = (item.Vorname && item.Nachname)
                    ? item.Vorname.substr(0, 1) + item.Nachname.substr(0, 1)
                    : (item.Vorname ? item.Vorname.substr(0, 2) : item.Nachname ? item.Nachname.substr(0, 2) : "");
                if (typeof cutSerialnumer !== "undefined" && typeof item.CS1504SerienNr !== "undefined") {
                    item.CS1504SerienNr = that.cutSerialnumer(item.CS1504SerienNr);
                }
                if (item.Gesperrt === 1) {
                    if (AppHeader.controller.binding.userData.SiteAdmin) {
                        item.Gesperrt = 0;
                    } else {
                        item.Gesperrt = 1;
                    }
                    item.disabled = true;
                }
                item.recordIcon = Binding.Converter.getIconFromID(item.IconID, "GenDataEmpList");
                if (!item.recordIcon) {
                    item.recordIcon = "user";
                }
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataEmpList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.MitarbeiterVIEWID &&
                                        item.data.MitarbeiterVIEWID !== that.binding.employeeId && item.data.Gesperrt !== 1) {
                                        if (AppBar.scope &&
                                            typeof AppBar.scope.saveData === "function") {
                                            AppBar.scope.saveData(function (response) {
                                                // called asynchronously if ok
                                                that.binding.employeeId = item.data.MitarbeiterVIEWID;
                                                that.binding.hasContacts = item.data.HatKontakte;
                                                that.binding.selIdx = item.index;
                                                AppData.setRecordId("MitarbeiterVIEW_20471", that.binding.employeeId);
                                                var curPageId = Application.getPageId(nav.location);
                                                if ((curPageId === "genDataEmployee") &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData(that.binding.employeeId);
                                                } else {
                                                    Application.navigateById("genDataEmployee");
                                                }
                                            }, function (errorResponse) {
                                                that.selectRecordId(that.binding.employeeId);
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
                    Log.call(Log.l.trace, "GenDataEmpList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    var i;
                    Log.call(Log.l.trace, "GenDataEmpList.Controller.");
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
                                layout = Application.GenDataEmpListLayout.GenDataEmpListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            if (that.employees && that.employees.length > 0) {
                                var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                                for (i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                    var element = listView.winControl.elementFromIndex(i);
                                    if (element) {
                                        if (element.firstElementChild) {
                                            if (element.firstElementChild.disabled) {
                                                element.style.backgroundColor = "grey";
                                                if (AppHeader.controller.binding.userData.SiteAdmin) {
                                                    if (WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                        WinJS.Utilities.removeClass(element, "win-nonselectable");
                                                    }
                                                } else {
                                                    if (!WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                        WinJS.Utilities.addClass(element, "win-nonselectable");
                                                    }
                                                }
                                            } else {
                                                if (WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.removeClass(element, "win-nonselectable");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            //smallest List color change
                            var circleElement = pageElement.querySelector('#nameInitialcircle');
                            circleElement.style.backgroundColor = Colors.accentColor;
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor, "name");
                            Colors.loadSVGImageElements(listView, "warning-image", 40, "red");
                            if (that.loading) {
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
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataEmpList.Controller.");
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
                    Log.call(Log.l.trace, "GenDataEmpList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.employees && that.nextUrl) {
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            AppData.setErrorMsg(that.binding);
                            var nextUrl = that.nextUrl;
                            that.nextUrl = null;
                            Log.print(Log.l.trace, "calling select GenDataEmpList.employeeView...");
                            GenDataEmpList.employeeView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "GenDataEmpList.employeeView: success!");
                                // employeeView returns object already parsed from json file in response
                                if (json && json.d && json.d.results.length > 0) {
                                    that.nextUrl = GenDataEmpList.employeeView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                        that.binding.count = that.employees.push(item);
                                    });
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }, null, nextUrl);
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
                Log.call(Log.l.trace, "GenDataEmpList.Controller.");
                that.loading = true;
                progress = pageElement.querySelector(".list-footer .progress");
                counter = pageElement.querySelector(".list-footer .counter");
                if (progress && progress.style) {
                    progress.style.display = "inline";
                }
                if (counter && counter.style) {
                    counter.style.display = "none";
                }
                var restriction = AppData.getRestriction("Employee");
                Log.call(Log.l.trace, "GenDataEmpList.Controller. restriction Employee:" + restriction);
                var defaultrestriction = GenDataEmpList.employeeView.defaultRestriction;
                if (!restriction) {
                    restriction = defaultrestriction;
                }
                if (restriction.OrderAttribute === "Vorname") {
                    if (btnName) {
                        if (restriction.btn_textContent) {
                            btnFirstName.textContent = restriction.btn_textContent;
                        }
                        btnName.textContent = getResourceText("employee.name");
                    }
                    btnEmployeeLicence.textContent = getResourceText("employee.licence");
                } else if (restriction.OrderAttribute === "Nachname") {
                    if (btnFirstName) {
                        if (restriction.btn_textContent) {
                            btnName.textContent = restriction.btn_textContent;
                        }
                        btnFirstName.textContent = getResourceText("employee.firstName");
                    }
                    btnEmployeeLicence.textContent = getResourceText("employee.licence");

                } else if (restriction.OrderAttribute === "NichtLizenzierteApp" ) {
                    // getResrestriction or defaultrestriction
                    btnName.textContent = getResourceText("employee.name");
                    btnFirstName.textContent = getResourceText("employee.firstName");
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    // only licence user select 
                    return GenDataEmpList.employeeView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "licenceView: success!");
                        // licenceUserView returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            var results = json.d.results;
                            that.binding.licenceWarning = true;
                            /*restriction.OrderDesc = true;
                            restriction.OrderAttribute = "NichtLizenzierteApp";
                            btnName.textContent = getResourceText("employee.name");
                            btnFirstName.textContent = getResourceText("employee.firstName");*/
                            //change order for the next select - list
                        } else {
                            that.binding.licenceWarning = false;
                        }
                        return WinJS.Promise.as();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, { NichtLizenzierteApp: 1 });
                }).then(function () {
                    return GenDataEmpList.employeeView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "GenDataEmpList: success!");
                        // employeeView returns object already parsed from json file in response
                        if (!recordId) {
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.count = json.d.results.length;
                                that.nextUrl = GenDataEmpList.employeeView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.employees = new WinJS.Binding.List(results);

                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.employees.dataSource;
                                }
                                that.selectRecordId(json.d.results[0].MitarbeiterVIEWID);
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
                            }
                        } else {
                            if (json && json.d) {
                                var employee = json.d;
                                that.resultConverter(employee);
                                var objectrec = scopeFromRecordId(recordId);
                                if (objectrec && objectrec.index) {
                                    that.employees.setAt(objectrec.index, employee);
                                } else {
                                    that.employees.setAt(0, employee);
                                }
                            }
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
                    }, restriction, recordId);
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Record selected");
            });
            Log.ret(Log.l.trace);
        })
    });
})();