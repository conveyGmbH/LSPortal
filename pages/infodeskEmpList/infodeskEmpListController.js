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

    WinJS.Namespace.define("InfodeskEmpList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                employeeId: AppData.getRecordId("Mitarbeiter")
            }, commandList, true]);
            this.nextUrl = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#infodeskEmployeeList.listview");
            var progress = null;
            var counter = null;
            var layout = null;
            var messages = [];
            var lastPrevLogin = [];

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.employees) {
                    that.employees = null;
                }
                listView = null;
            }

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var loadNextUrl = function (recordId) {
                Log.call(Log.l.trace, "QuestionList.Controller.");
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (that.employees && that.nextUrl && listView) {
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
                    for (var i = 0; i < that.employees.length; i++) {
                        var employee = that.employees.getAt(i);
                        if (employee && typeof employee === "object" &&
                            (employee.MitarbeiterID || employee.MitarbeiterVIEWID) === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            //byhung
            Log.print(Log.l.trace, "calling select InfodeskEmpList.skillentryView...");
            var restriction = AppData.getRestriction("SkillEntry");
            if (!restriction) {
                restriction = {};
            }
            that.binding.restriction = restriction;

            var getRestriction = function () {
                var restriction = AppData.getRestriction("SkillEntry");
                if (!restriction) {
                    restriction = {};
                }
                return restriction;
            }
            this.getRestriction = getRestriction;

            var resultConverter = function (item, index) {
                //if (restriction.Aktiv.length === 2) {
                item.index = index;
                item.fullName =
                (item.Vorname ? (item.Vorname + " ") : "") +
                (item.Nachname ? item.Nachname : ""); // muss geändert werden
                //}
                if (item.INITBenAnwID !== 0 && item.INITBenAnwID !== null && item.Present !== 1) {
                    for (var i = 0; i < messages.length; i++) {
                        if (messages[i].INITBenAnwID === item.INITBenAnwID) {
                            item.title = messages[i].TITLE;
                            break;
                        }

                    }
                }
               /* if (item.Present === 1) { // && item.Aktiv === "X"
                    //document.getElementById("list-empList").className = "list-compressed";
                    item.presentClass = "list-compressed-green";
                } else {
                    //document.getElementById("list-empList").className = "list-compressed-gray";
                    item.presentClass = "list-compressed-red";
                }*/
            }
            this.resultConverter = resultConverter;

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
                                    if (item.data && (item.data.MitarbeiterID || item.data.MitarbeiterVIEWID) &&
                                        (item.data.MitarbeiterID || item.data.MitarbeiterVIEWID) !== that.binding.employeeId) {
                                        // called asynchronously if ok
                                        that.binding.employeeId = item.data.MitarbeiterID || item.data.MitarbeiterVIEWID;
                                        var curPageId = Application.getPageId(nav.location);
                                        if ((curPageId === "infodesk" || curPageId === "infodeskEmpList") &&
                                            typeof AppBar.scope.loadData === "function") {
                                            AppBar.scope.loadData(that.binding.employeeId);
                                            Application.navigateById("infodesk");
                                        } else {
                                            Application.navigateById("infodesk");
                                        }
                                    }
                                });
                                Application.navigateById("infodesk");
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

                            that.loadNextUrl();
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

            var loadData = function (recordid) {
                Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
                that.loading = true;
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (progress && progress.style) {
                    progress.style.display = "inline";
                }
                if (counter && counter.style) {
                    counter.style.display = "none";
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return InfodeskEmpList.initBenAnwView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "InitBenAnw: success!");
                        if (json && json.d) {
                            // now always edit!
                            var results = json.d.results;

                            results.forEach(function (item, index) {
                                messages.push(item);

                            });
                        }
                    }).then(function () {
                        var restriction = AppData.getRestriction("SkillEntry");
                        if (!restriction) {
                            restriction = {};
                        }
                        if (that.binding.restriction.countCombobox && that.binding.restriction.countCombobox > 0) {
                            return InfodeskEmpList.employeeSkillentryView.select(function(json) {
                                    // this callback will be called asynchronously
                                    // when the response is available
                                    AppData.setErrorMsg(that.binding);
                                    Log.print(Log.l.trace, "InfodeskEmpList: success!");
                                    // employeeView returns object already parsed from json file in response
                                    if (json && json.d) {
                                        that.nextUrl = InfodeskEmpList.employeeSkillentryView.getNextUrl(json);
                                        var results = json.d.results;

                                        //hole anhand der recordid die Fähigkeiten des jeweiligen Mitarbeiters mit der recordid

                                        var actualItem = null;
                                        var resultsUnique = [];
                                        if (that.binding.restriction.countCombobox >= 1) {
                                            var zähler = 0;
                                            results.forEach(function(item) {
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
                                            results.forEach(function(item, index) {
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

                                        results.forEach(function(item, index) {
                                            that.resultConverter(item, index);
                                        });
                                        that.employees = new WinJS.Binding.List(results);

                                        if (listView.winControl) {
                                            // add ListView dataSource
                                            listView.winControl.itemDataSource = that.employees.dataSource;
                                        }
                                        Log.print(Log.l.trace, "Data loaded");
                                        if (results[0] && results[0].MitarbeiterVIEWID) {
                                            WinJS.Promise.timeout(0).then(function() {
                                                that.selectRecordId(results[0].MitarbeiterVIEWID);
                                            });
                                        }
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
                                },
                                function(errorResponse) {
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
                                },
                                restriction); //that.binding.restriction beim neuladen ist die leer
                        } else {
                            return InfodeskEmpList.employeeView.select(function (json) {
                                    // this callback will be called asynchronously
                                    // when the response is available
                                    Log.print(Log.l.trace, "EmpList: success!");
                                    // employeeView returns object already parsed from json file in response
                                        if (json && json.d) {
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
                        };
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
                return that.selectRecordId(that.binding.employeeId);
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Record selected");
            }).then(function () {
                Application.navigateById("infodesk");
            });
            Log.ret(Log.l.trace);
        }, {
            nextUrl: null,
            loading: false,
            employees: null
        })
    });
})();
