// controller for page: localevents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/contactResultsList/contactResultsListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("ContactResultsList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "ContactResultsList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                dataContactHeader: null,
                dataContactBody: null
            }, commandList]);
            this.nextUrl = null;

            var that = this;
            var tablefull = pageElement.querySelector("#tableId");
            var tableheader = pageElement.querySelector(".table-header");
            var tablebody = pageElement.querySelector(".table-body");

            var resizableGrid = function () {
                var table = pageElement.querySelector("#tableId");
                var row = table.querySelectorAll('tr')[0],
                    cols = row ? row.children : undefined;
                if (!cols) return;

                table.style.overflow = "hidden";

                var tableHeight = table.offsetHeight;
                
                for (var i = 0; i < cols.length; i++) {
                    var div = createDiv(tableHeight);
                    cols[i].appendChild(div);
                    cols[i].style.position = "relative";
                    setListeners(div);
                }

                function setListeners(div) {
                    var pageX, curCol, nxtCol, curColWidth, nxtColWidth;

                    div.addEventListener("mousedown", function (e) {
                        curCol = e.target.parentElement;
                        nxtCol = curCol.nextElementSibling;
                        pageX = e.pageX;

                        var padding = paddingDiff(curCol);

                        curColWidth = curCol.offsetWidth - padding;
                        if (nxtCol)
                            nxtColWidth = nxtCol.offsetWidth - padding;
                    });

                    div.addEventListener("mouseover",
                        function(e) {
                            e.target.style.borderRight = "2px solid #0000ff";
                        });

                    div.addEventListener("mouseout",
                        function(e) {
                            e.target.style.borderRight = "";
                        });

                    pageElement.addEventListener("mousemove", function (e) {
                        if (curCol) {
                            var diffX = e.pageX - pageX;

                            if (nxtCol)
                                nxtCol.style.width = (nxtColWidth - (diffX)) + "px";

                            curCol.style.width = (curColWidth + diffX) + "px";
                        }
                    });

                    pageElement.addEventListener("mouseup", function (e) {
                        curCol = undefined;
                        nxtCol = undefined;
                        pageX = undefined;
                        nxtColWidth = undefined;
                        curColWidth = undefined;
                    });

                }

                function createDiv(height) {
                    var div = document.createElement("div");
                    div.style.top = 0;
                    div.style.right = 0;
                    div.style.width = "5px";
                    div.style.position = "absolute";
                    div.style.cursor = "col-resize";
                    div.style.userSelect = "none";
                    div.style.height = height + "px";
                    return div;
                }

                function paddingDiff(col) {

                    if (getStyleVal(col, "box-sizing") === "border-box") {
                        return 0;
                    }

                    var padLeft = getStyleVal(col, "padding-left");
                    var padRight = getStyleVal(col, "padding-right");
                    return (parseInt(padLeft) + parseInt(padRight));

                }

                function getStyleVal(elm, css) {
                    return (window.getComputedStyle(elm, null).getPropertyValue(css));
                }
            }
            this.resizableGrid = resizableGrid;
            
            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
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
                clickGotoPublish: function () {
                    return true;
                }
            };

            var addHeaderRow = function (item) {
                var tableheader = pageElement.querySelector(".table-header");
                var row = tableheader.appendChild(document.createElement('tr'));
                var col1 = row.appendChild(document.createElement('th'));
                var col2 = row.appendChild(document.createElement('th'));
                var col3 = row.appendChild(document.createElement('th'));
                var col4 = row.appendChild(document.createElement('th'));
                var col5 = row.appendChild(document.createElement('th'));
                var col6 = row.appendChild(document.createElement('th'));
                var col7 = row.appendChild(document.createElement('th'));
                var col8 = row.appendChild(document.createElement('th'));
                var col9 = row.appendChild(document.createElement('th'));
                
                col1.textContent = item.Name;
                col2.textContent = item.Vorname;
                col3.textContent = item.Firmenname;
                col4.textContent = item.EMail;
                col5.textContent = item.Stadt;
                col6.textContent = item.Land;
                col7.textContent = item.Prio;
                col8.textContent = item.Typ;
                col9.textContent = "Status";
            }
            this.addHeaderRow = addHeaderRow;

            var addBodyRow = function (item) {
                var tableheader = pageElement.querySelector(".table-body");
                var row = tableheader.appendChild(document.createElement('tr'));
                var col1 = row.appendChild(document.createElement('td'));
                var col2 = row.appendChild(document.createElement('td'));
                var col3 = row.appendChild(document.createElement('td'));
                var col4 = row.appendChild(document.createElement('td'));
                var col5 = row.appendChild(document.createElement('td'));
                var col6 = row.appendChild(document.createElement('td'));
                var col7 = row.appendChild(document.createElement('td'));
                var col8 = row.appendChild(document.createElement('td'));
                var col9 = row.appendChild(document.createElement('td'));

                row.value = item.KontaktVIEWID;

                col1.textContent = item.Name;
                col2.textContent = item.Vorname;
                col3.textContent = item.Firmenname;
                col4.textContent = item.EMail;
                col5.textContent = item.Stadt;
                col6.textContent = item.Land;
                col7.textContent = item.Prio;
                col8.textContent = item.Typ;
                col9.textContent = item.Status;
            }
            this.addBodyRow = addBodyRow;

            var addHeaderRowHandlers = function () {
                var tableheader = pageElement.querySelector(".table-header tr");
                var cells = tableheader.getElementsByTagName("th");
                for (var i = 0; i < cells.length; i++) {
                    var cell = tableheader.cells[i];
                    cell.onclick = function (myrow) {
                        return function () {
                            var restriction = ContactResultsList.KontaktReport.defaultRestriction;
                            var sortname = myrow.textContent;
                            restriction.OrderAttribute = sortname;
                            pageElement.querySelectorAll(".table-header tr").forEach(function (e) { e.remove() });
                            pageElement.querySelectorAll(".table-body tr").forEach(function (e) { e.remove() });
                            that.loadData(restriction);
                        };
                    }(cell);
                }
            }
            this.addHeaderRowHandlers = addHeaderRowHandlers;

            var addBodyRowHandlers = function () {
                var table = pageElement.querySelector(".table-body");
                var rows = table.getElementsByTagName("tr");
                for (var i = 0; i < rows.length; i++) {
                    var row = table.rows[i];
                    row.onclick = function (myrow) {
                        return function () {
                            var id = myrow.value;
                            AppData.setRecordId("Kontakt", id);
                            Application.navigateById("contactResultsEdit");
                        };
                    }(row);
                }
            }
            this.addBodyRowHandlers = addBodyRowHandlers;

            var resultConverter = function (item, index) {
                item.index = index;
                if (!item.Name && !item.Vorname && !item.Firmenname) {
                    item.Status = "Unvollständig";
                } else if (!item.EMail) {
                    item.Status = "Teilweise unvollständig";
                } else {
                    item.Status = "Vollständig";
                }
                if (item.KontaktVIEWID === -2) {
                    that.addHeaderRow(item);
                } else if (item.KontaktVIEWID === -1) {
                    
                } else {
                    that.addBodyRow(item);
                }
            }
            this.resultConverter = resultConverter;


            var loadData = function (restr) {
                Log.call(Log.l.trace, "MailingTypes.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select MailingTypes...");
                    if (restr) {
                        return ContactResultsList.KontaktReport.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "MailingTypes: success!");
                                if (json && json.d && json.d.results.length > 0) {
                                    // now always edit!
                                    var results = json.d.results;

                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    that.resizableGrid();
                                    that.addHeaderRowHandlers();
                                    that.addBodyRowHandlers();
                                    that.binding.count = results.length - 2;
                                    
                                } else {

                                }
                            },
                            function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, restr);
                    } else {
                        return ContactResultsList.KontaktReport.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "MailingTypes: success!");
                                if (json && json.d && json.d.results.length > 0) {
                                    // now always edit!
                                    var results = json.d.results;

                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });

                                    that.binding.count = results.length - 2;
                                    
                                } else {

                                }
                            },
                            function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, {
                                
                            });
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.resizableGrid();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.addHeaderRowHandlers();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.addBodyRowHandlers();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
                headerdata: null,
                bodydata: null
        })
    });
})(); 