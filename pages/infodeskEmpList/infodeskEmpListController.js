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
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "InfodeskEmpList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                employeeId: AppData.getRecordId("Mitarbeiter")
            }, true]);
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

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "InfodeskEmpList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.employees.length; i++) {
                        var employee = that.employees.getAt(i);
                        if (employee && typeof employee === "object" &&
                            employee.MitarbeiterID === recordId) {
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

            var resultConverter = function (item, index) {
                //if (restriction.Aktiv.length === 2) {
                item.index = index;
                item.fullName =
                (item.Vorname ? (item.Vorname + " ") : "") +
                (item.Nachname ? item.Nachname : ""); // muss geändert werden
                //}
                if (item.INITBenAnwID !== 0 && item.INITBenAnwID !== null) {
                    for (var i = 0; i < messages.length; i++) {
                        if (messages[i].INITBenAnwID === item.INITBenAnwID) {
                            item.title = messages[i].TITLE;
                            break;
                        }

                    }
                }
                if (item.Present === 1 && item.Aktiv === "X") {
                    //document.getElementById("list-empList").className = "list-compressed";
                    item.presentClass = "list-compressed-green";
                } else {
                    //document.getElementById("list-empList").className = "list-compressed-gray";
                    item.presentClass = "list-compressed-gray";
                }
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
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
                                    if (item.data && item.data.MitarbeiterID &&
                                        item.data.MitarbeiterID !== that.binding.employeeId) {
                                        if (AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                            AppBar.scope.saveData(function (response) {
                                                // called asynchronously if ok
                                                that.binding.employeeId = item.data.MitarbeiterID;
                                                var curPageId = Application.getPageId(nav.location);
                                                if ((curPageId === "infodesk") &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData(that.binding.employeeId);
                                                } else {
                                                    Application.navigateById("infodesk");
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
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "calling select InfodeskEmpList.employeeView...");
                            InfodeskEmpList.employeeView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "InfodeskEmpList.employeeView: success!");
                                // employeeView returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.nextUrl = InfodeskEmpList.employeeView.getNextUrl(json);
                                    var results = json.d.results;
                                    var resultsUnique = [];
                                    var actualItem;

                                    if (restriction.countCombobox > 1) {

                                        var zähler = 0;
                                        results.forEach(function (item) {
                                            if (actualItem === undefined)
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
                                                actualItem = undefined;
                                            }
                                        });
                                    }

                                    //Die Mitarbeiterliste muss zu Beginn unique Mitarbeiter sein
                                    results.forEach(function (item, index) {
                                        if (actualItem === undefined) {
                                            actualItem = item;
                                            if (lastPrevLogin[0].Login !== item.Login)
                                                resultsUnique.push(actualItem);
                                        }

                                        if (actualItem.Login !== item.Login) {
                                            actualItem = item;
                                            resultsUnique.push(actualItem);
                                        }
                                        if (index === 99)
                                            lastPrevLogin[0] = actualItem;
                                    });



                                    results = resultsUnique;
                                    that.binding.count = results.length;

                                    results.forEach(function (item, index) { //<!--
                                        that.resultConverter(item, index);
                                        that.binding.count = that.employees.push(item);
                                    });
                                } else {
                                    that.nextUrl = null;
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
                            }, null, that.nextUrl);
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
                listView.addEventListener("selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                listView.addEventListener("loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                listView.addEventListener("footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
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
                        return InfodeskEmpList.employeeView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "InfodeskEmpList: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.binding.count = json.d.results.length;
                                that.nextUrl = InfodeskEmpList.employeeView.getNextUrl(json);
                                var results = json.d.results;

                                //hole anhand der recordid die Fähigkeiten des jeweiligen Mitarbeiters mit der recordid

                                var actualItem;
                                var resultsUnique = [];
                                if (restriction.countCombobox > 1) {
                                    var zähler = 0;
                                    results.forEach(function (item) {
                                        if (actualItem === undefined)
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
                                            actualItem = undefined;
                                        }
                                    });
                                }
                                else {
                                    //Die Mitarbeiterliste muss zu Beginn unique Mitarbeiter sein
                                    results.forEach(function (item, index) {
                                        if (actualItem === undefined) {
                                            actualItem = item;
                                            resultsUnique.push(actualItem);
                                        }

                                        if (actualItem.Login !== item.Login) {
                                            actualItem = item;
                                            resultsUnique.push(actualItem);
                                        }
                                        if (index === 99)
                                            lastPrevLogin.push(actualItem);
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
                    }
                    );

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
            });
            Log.ret(Log.l.trace);
        }, {
            nextUrl: null,
            loading: false,
            employees: null
        })
    });
})();
