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
                dataContactHeaderValue: getEmptyDefaultValue(ContactResultsList.KontaktReport.defaultContactHeader),
                dataContactHeaderText: getEmptyDefaultValue(ContactResultsList.KontaktReport.defaultContactHeader),
                noctcount: 0,
                searchString: ""
            }, commandList]);
            this.nextUrl = null;

            var that = this;
            var table = pageElement.querySelector("#tableId");
            var tableHeader = pageElement.querySelector(".table-header");
            var tableBody = pageElement.querySelector(".table-body");
            var contentArea = pageElement.querySelector(".contentarea");
            var selectAll = pageElement.querySelector("#selectAll");
            var searchInput = pageElement.querySelector("#searchInput");
            
            this.dispose = function () {
                if (tableBody && tableBody.winControl) {
                    tableBody.winControl.data = null;
                }
            }

            var getEventId = function () {
                Log.print(Log.l.trace, "getEventId ContactResultsList._eventId=" + ContactResultsList._eventId);
                return ContactResultsList._eventId;
            }
            this.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "setEventId ContactResultsList._eventId=" + value);
                ContactResultsList._eventId = value;
            }
            this.setEventId = setEventId;

            var colorStatus = function() {
                var statusrow = pageElement.querySelectorAll("#status");
                for (var i = 1; i < statusrow.length; i++) {
                    if (statusrow[i].textContent === getResourceText("contactResultsCriteria.incomplete")) {
                        statusrow[i].style.color = "red";
                    } else if (statusrow[i].textContent === getResourceText("contactResultsCriteria.partialcomplete")) {
                        statusrow[i].style.color = "orange";
                    } else {
                        statusrow[i].style.color = "green";
                    }
                }
            }
            this.colorStatus = colorStatus;

            var addZero = function (i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }
            this.addZero = addZero;

            var getDateObject = function (date) {
                Log.call(Log.l.trace, "MailingList.Controller.");
                var dateString = date.replace("\/Date(", "").replace(")\/", "");
                var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                var time = new Date(milliseconds);
                var formdate = ("0" + time.getDate()).slice(-2) + "." + ("0" + (time.getMonth() + 1)).slice(-2) + "." + time.getFullYear() + " " + that.addZero(time.getUTCHours()) + ":" + that.addZero(time.getMinutes());
                Log.ret(Log.l.trace);
                return formdate;
            };
            this.getDateObject = getDateObject;

            var resizableGrid = function () {
                var row = tableHeader ? tableHeader.querySelector("tr") : null,
                    cols = row ? row.children : null;
                if (!cols) return;

                var tableHeight = table.offsetHeight;
                
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

                function getStyleVal(elm, css) {
                    return (window.getComputedStyle(elm, null).getPropertyValue(css));
                }

                function paddingDiff(col) {
                    if (getStyleVal(col, "box-sizing") === "border-box") {
                        return 0;
                    }
                    var padLeft = getStyleVal(col, "padding-left");
                    var padRight = getStyleVal(col, "padding-right");
                    return (parseInt(padLeft) + parseInt(padRight));

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

                for (var i = 0; i < cols.length; i++) {
                    var columnSelector = cols[i].querySelector("div");
                    if (columnSelector && columnSelector.style) {
                        columnSelector.style.height = tableHeight + "px";
                    } else {
                        var div = createDiv(tableHeight);
                        cols[i].appendChild(div);
                        cols[i].style.position = "relative";
                        setListeners(div);
                    }
                }
            }
            this.resizableGrid = resizableGrid;

            var setInitialHeaderTextValue = function() {
                Log.print(Log.l.trace, "Setting up initial header texts and value shown in header of table");
                //text part
                that.binding.dataContactHeaderText.Name = getResourceText("contactResultsList.headername");
                that.binding.dataContactHeaderText.Vorname = getResourceText("contactResultsList.headervorname");
                that.binding.dataContactHeaderText.Firmenname = getResourceText("contactResultsList.headerfirmenname");
                that.binding.dataContactHeaderText.EMail = getResourceText("contactResultsList.headeremail");
                that.binding.dataContactHeaderText.Land = getResourceText("contactResultsList.headerland");
                that.binding.dataContactHeaderText.Erfassungsdatum = getResourceText("contactResultsList.headererfassungsdatum");
                that.binding.dataContactHeaderText.ModifiedTS = getResourceText("contactResultsList.headeränderungsdatum");
                that.binding.dataContactHeaderText.MailVersandTS = getResourceText("contactResultsList.headeremailversandtzeit");
                that.binding.dataContactHeaderText.Prio = getResourceText("contactResultsList.headerkontaktprio");
                that.binding.dataContactHeaderText.Typ = getResourceText("contactResultsList.headerkontakttyp");
                that.binding.dataContactHeaderText.Status = getResourceText("contactResultsList.headerstatus");
                //value part
                that.binding.dataContactHeaderValue.Name = getResourceText("contactResultsList.headername");
                that.binding.dataContactHeaderValue.Vorname = getResourceText("contactResultsList.headervorname");
                that.binding.dataContactHeaderValue.Firmenname = getResourceText("contactResultsList.headerfirmenname");
                that.binding.dataContactHeaderValue.EMail = getResourceText("contactResultsList.headeremail");
                that.binding.dataContactHeaderValue.Land = getResourceText("contactResultsList.headerland");
                that.binding.dataContactHeaderValue.Erfassungsdatum = getResourceText("contactResultsList.headererfassungsdatum");
                that.binding.dataContactHeaderValue.ModifiedTS = getResourceText("contactResultsList.headeränderungsdatum");
                that.binding.dataContactHeaderValue.MailVersandTS = getResourceText("contactResultsList.headeremailversandtzeit");
                that.binding.dataContactHeaderValue.Prio = getResourceText("contactResultsList.headerkontaktprio");
                that.binding.dataContactHeaderValue.Typ = getResourceText("contactResultsList.headerkontakttyp");
                that.binding.dataContactHeaderValue.Status = getResourceText("contactResultsList.headerstatus");
            }
            this.setInitialHeaderTextValue = setInitialHeaderTextValue;

            var setHeaderText = function (headervalue, headertext) {
                var up = " ↑";
                var down = " ↓";
                var headervalueup = headervalue.concat(up);
                var headervaluedown = headervalue.concat(down);
                if (headervalue === "Name") {
                    if (headertext === headervalueup) {
                        that.binding.dataContactHeaderText.Name = headervaluedown;
                    } else if (headertext === headervaluedown) {
                        that.binding.dataContactHeaderText.Name = headervalueup;
                    } else {
                        that.binding.dataContactHeaderText.Name = headervaluedown;
                    }
                }
                if (headervalue === "Vorname") {
                    if (headertext === headervalueup) {
                        that.binding.dataContactHeaderText.Vorname = headervaluedown;
                    } else if (headertext === headervaluedown) {
                        that.binding.dataContactHeaderText.Vorname = headervalueup;
                    } else {
                        that.binding.dataContactHeaderText.Vorname = headervaluedown;
                    }
                }
                if (headervalue === "Firmenname") {
                    if (headertext === headervalueup) {
                        that.binding.dataContactHeaderText.Firmenname = headervaluedown;
                    } else if (headertext === headervaluedown) {
                        that.binding.dataContactHeaderText.Firmenname = headervalueup;
                    } else {
                        that.binding.dataContactHeaderText.Firmenname = headervaluedown;
                    }
                }
                if (headervalue === "EMail") {
                    if (headertext === headervalueup) {
                        that.binding.dataContactHeaderText.EMail = headervaluedown;
                    } else if (headertext === headervaluedown) {
                        that.binding.dataContactHeaderText.EMail = headervalueup;
                    } else {
                        that.binding.dataContactHeaderText.EMail = headervaluedown;
                    }
                }
                if (headervalue === "Stadt") {
                    if (headertext === headervalueup) {
                        that.binding.dataContactHeaderText.Stadt = headervaluedown;
                    } else if (headertext === headervaluedown) {
                        that.binding.dataContactHeaderText.Stadt = headervalueup;
                    } else {
                        that.binding.dataContactHeaderText.Stadt = headervaluedown;
                    }
                }
                if (headervalue === "Land") {
                    if (headertext === headervalueup) {
                        that.binding.dataContactHeaderText.Land = headervaluedown;
                    } else if (headertext === headervaluedown) {
                        that.binding.dataContactHeaderText.Land = headervalueup;
                    } else {
                        that.binding.dataContactHeaderText.Land = headervaluedown;
                    }
                }
                if (headervalue === "Prio") {
                    if (headertext === headervalueup) {
                        that.binding.dataContactHeaderText.Prio = headervaluedown;
                    } else if (headertext === headervaluedown) {
                        that.binding.dataContactHeaderText.Prio = headervalueup;
                    } else {
                        that.binding.dataContactHeaderText.Prio = headervaluedown;
                    }
                }
                if (headervalue === "Typ") {
                    if (headertext === headervalueup) {
                        that.binding.dataContactHeaderText.Typ = headervaluedown;
                    } else if (headertext === headervaluedown) {
                        that.binding.dataContactHeaderText.Typ = headervalueup;
                    } else {
                        that.binding.dataContactHeaderText.Typ = headervaluedown;
                    }
                }
            }
            this.setHeaderText = setHeaderText;

            var addHeaderRowHandlers = function () {
                if (tableHeader) {
                    var cells = tableHeader.getElementsByTagName("th");
                    for (var i = 1; i < cells.length; i++) {
                        var cell = cells[i];
                        if (!cell.onclick) {
                            cell.onclick = function (myrow) {
                                return function () {
                                    var restriction = ContactResultsList.KontaktReport.defaultRestriction;
                                    var sortname = myrow.value;
                                    var sorttext = myrow.textContent;
                                    if (restriction.OrderAttribute !== sortname) {
                                        restriction.VeranstaltungID = that.getEventId();
                                        restriction.OrderAttribute = sortname;
                                        restriction.OrderDesc = false;
                                        that.loadData(restriction);
                                        that.setHeaderText(myrow.value, sorttext);
                                        Log.call(Log.l.trace, "ContactResultsList.Controller.");
                                    } else {
                                        restriction.OrderDesc = !restriction.OrderDesc;
                                        restriction.VeranstaltungID = that.getEventId();
                                        that.loadData(restriction);
                                        that.setHeaderText(myrow.value, sorttext);
                                        Log.call(Log.l.trace, "ContactResultsList.Controller.");
                                    }
                                };
                            }(cell);
                        }
                    }
                }
            }
            this.addHeaderRowHandlers = addHeaderRowHandlers;

            var addBodyRowHandlers = function () {
                if (tableBody) {
                    var rows = tableBody.getElementsByTagName("tr");
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        if (!row.onclick) {
                            row.ondblclick = function (myrow) {
                                return function () {
                                    var id = myrow.value;
                                    AppData.setRecordId("Kontakt", id);
                                    Application.navigateById("contactResultsEdit");
                                };
                            }(row);
                        }
                    }
                }
            }
            this.addBodyRowHandlers = addBodyRowHandlers;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onSearchInput: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (event.keyCode === 13) {
                        if (event.currentTarget.value.length > 2) {
                            that.searchKontaktListe(event.currentTarget.value);
                        }
                        if (event.currentTarget.value.length === 0) {
                            that.loadData();
                        }
                    }
                },
                onSelectAll: function(event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    var selectBoxData = pageElement.querySelectorAll(".checkbox");
                    if (selectAll.checked) {
                        Log.call(Log.l.trace, "ContactResultsList.Controller.");
                        for (var i = 0; i < selectBoxData.length; i++) {
                            selectBoxData[i].checked = true;
                        }
                    } else {
                        Log.call(Log.l.trace, "ContactResultsList.Controller.");
                        for (var i = 0; i < selectBoxData.length; i++) {
                            selectBoxData[i].checked = false;
                        }
                    }
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
                    Log.call(Log.l.trace, "ContactResultList.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                onItemInserted: function(eventInfo) {
                    var index = eventInfo && eventInfo.detail && eventInfo.detail.index;
                    Log.call(Log.l.trace, "ContactResultList.Controller.", "index="+index);
                    that.resizableGrid();
                    that.addHeaderRowHandlers();
                    that.addBodyRowHandlers();
                    Log.ret(Log.l.trace);
                },
                onContentScroll: function(eventInfo) {
                    Log.call(Log.l.trace, "ContactResultList.Controller.");
                    if (contentArea && that.nextUrl) {
                        var scrollMax = contentArea.scrollHeight - contentArea.clientHeight;
                        var scrollPos = contentArea.scrollTop;
                        if (scrollPos === scrollMax) {
                            that.loadNextUrl();
                        }
                    }
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

            if (contentArea) {
                this.addRemovableEventListener(contentArea, "scroll", this.eventHandlers.onContentScroll.bind(this));
            }

            if (selectAll) {
                this.addRemovableEventListener(selectAll, "change", this.eventHandlers.onSelectAll.bind(this));
            }
            if (searchInput) {
                this.addRemovableEventListener(searchInput, "keydown", this.eventHandlers.onSearchInput.bind(this));
            }

            var resultConverter = function (item, index) {
                item.index = index;
                    if (!item.Name && !item.Vorname && !item.Firmenname) {
                        item.Status = getResourceText("contactResultsCriteria.incomplete");
                    } else if (!item.EMail) {
                        item.Status = getResourceText("contactResultsCriteria.partialcomplete");
                    } else {
                        item.Status = getResourceText("contactResultsCriteria.complete");
                }
                if (item.Anzahl) {
                    that.binding.noctcount = item.Anzahl;
                }
                if (item.Erfassungsdatum) {
                    item.Erfassungsdatum = that.getDateObject(item.Erfassungsdatum);
                }
                if (item.ModifiedTS) {
                    item.ModifiedTS = that.getDateObject(item.ModifiedTS);
                }
                if (item.MailVersandTS) {
                    item.MailVersandTS = that.getDateObject(item.MailVersandTS);
                }
                    if (tableBody &&
                        tableBody.winControl &&
                        tableBody.winControl.data) {
                        that.binding.count = tableBody.winControl.data.push(item);
                    }
            }
            this.resultConverter = resultConverter;

            var loadNextUrl = function () {
                var ret = null;
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
                if (that.nextUrl) {
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select ContactResultsList.contactView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    ret = ContactResultsList.KontaktReport.selectNext(function(json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ContactResultsList.KontaktReport: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            that.nextUrl = ContactResultsList.KontaktReport.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function(item, index) {
                                that.resultConverter(item, index);
                            });
                        }
                    },
                    function(errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "ContactResultsList.KontaktReport: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    },
                    null,
                    nextUrl).then(function () {
                        return WinJS.Promise.timeout(100);
                    }).then(function () {
                        that.eventHandlers.onItemInserted();
                        return WinJS.Promise.as();
                    });
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            }
            this.loadNextUrl = loadNextUrl;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
                // Dummy Save Data Function
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (typeof complete === "function") {
                        complete({});
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            var searchKontaktListe = function (searchString) {
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
                AppData.setErrorMsg(that.binding);
                if (tableBody && tableBody.winControl) {
                    if (tableBody.winControl.data) {
                        tableBody.winControl.data.length = 0;
                    } else {
                        tableBody.winControl.data = WinJS.Binding.List([]);
                    }
                }
                AppData.call("PRC_SearchKontaktListe", {
                    pAttributeIdx: 0,
                    pVeranstaltungId: that.getEventId(), // Für Alle suchen 0 eintragen!
                    pSuchText: searchString
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppBar.busy = false;
                    var results = json.d.results;
                    results.forEach(function (item, index) {
                        that.resultConverter(item, index);
                    });
                }, function (errorResponse) {
                    Log.print(Log.l.error, "call error");
                    AppBar.busy = false;
                    AppData.setErrorMsg(that.binding, errorResponse);
                });
                Log.ret(Log.l.trace);
            }
            this.searchKontaktListe = searchKontaktListe;

            var loadData = function (restr) {
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
                AppData.setErrorMsg(that.binding);
                that.binding.noctcount = 0;
                that.nextUrl = null;
                if (tableBody && tableBody.winControl) {
                    if (tableBody.winControl.data) {
                        tableBody.winControl.data.length = 0;
                    } else {
                        tableBody.winControl.data = WinJS.Binding.List([]);
                    }
                }
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select MailingTypes...");
                    if (restr) {
                        return ContactResultsList.KontaktReport.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "MailingTypes: success!");
                                if (json && json.d && json.d.results.length > 0) {
                                    that.nextUrl = ContactResultsList.KontaktReport.getNextUrl(json);
                                    // now always edit!
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
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
                                    that.nextUrl = ContactResultsList.KontaktReport.getNextUrl(json);
                                    // now always edit!
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                }
                            },
                            function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, {
                                VeranstaltungID: that.getEventId()
                            });
                    }
                }).then(function () {
                    return WinJS.Promise.timeout(100);
                }).then(function () {
                    return that.colorStatus();
                }).then(function () {
                    that.eventHandlers.onItemInserted();
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
                return that.setInitialHeaderTextValue();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.addHeaderRowHandlers();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.addBodyRowHandlers();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.colorStatus();
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