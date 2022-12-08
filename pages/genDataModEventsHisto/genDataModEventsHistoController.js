// controller for page: genDataModEventsHisto
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataModEventsHisto/genDataModEventsHistoService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("GenDataModEventsHisto", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "GenDataModEventsHisto.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                dataContact: null
            }, commandList]);

            var that = this;
            var progress = null;

            var table = pageElement.querySelector("#tableId");
            var tableHeader = pageElement.querySelector(".table-header");
            var tableBody = pageElement.querySelector(".table-body");

            var getRecordId = function () {
                Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                var recordId = AppData.getRecordId("IncidentUID");
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var getDateObject = function (date) {
                Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                var dateString = date.replace("\/Date(", "").replace(")\/", "");
                var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                var time = new Date(milliseconds);
                var formdate = ("0" + time.getDate()).slice(-2) + "." + ("0" + (time.getMonth() + 1)).slice(-2) + "." + time.getFullYear() + " " + time.getUTCHours() + ":" + time.getUTCMinutes() + ":" + time.getUTCSeconds();
                Log.ret(Log.l.trace);
                return time;
            };
            this.getDateObject = getDateObject;

            var getDateTime = function (date) {
                Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                var currentDate = getDateObject(date);
                var curMoment = moment(currentDate);
                curMoment.locale(Application.language);
                var currentDateString = curMoment.format("L");
                var currentTimeString = curMoment.format("HH:mm:ss");
                return currentDateString + " " + currentTimeString;

            }
            this.getDateTime = getDateTime;

            var setDataContact = function (data) {
                Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                that.binding.dataContact = data;
                that.binding.dataContact.fullName = "";
                if (data.Anrede) {
                    that.binding.dataContact.fullName = data.Anrede + " ";
                }
                if (data.FirstName) {
                    that.binding.dataContact.fullName += data.FirstName + " ";
                }
                if (data.LastName) {
                    that.binding.dataContact.fullName += data.LastName;
                }
                Log.ret(Log.l.trace);
            }
            this.setDataContact = setDataContact;

            var loadIcons = function () {
                Colors.loadSVGImageElements(tableBody, "action-image", 40, Colors.textColor, "name");
            }
            this.loadIcons = loadIcons;

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
                        function (e) {
                            e.target.style.borderRight = "2px solid #0000ff";
                        });

                    div.addEventListener("mouseout",
                        function (e) {
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

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
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

            var resultConverter = function (item, index) {
                item.index = index;
                if (item.CreatorName === null) {
                    item.CreatorName = "auto";
                }
                if (item.IncidentTSUTC) {
                    item.IncidentTSUTC = that.getDateTime(item.IncidentTSUTC);
                }
                if (tableBody &&
                    tableBody.winControl &&
                    tableBody.winControl.data) {
                    that.binding.count = tableBody.winControl.data.push(item);
                }
            }
            this.resultConverter = resultConverter;

            var getPersonId = function () {
                return AppData.getRecordId("IncidentPID");
            }
            this.getPersonId = getPersonId;

            var getEventId = function () {
                return AppData.getRecordId("IncidentVID");
            }
            this.getEventId = getEventId;

            var loadNextUrl = function () {
                Log.call(Log.l.trace, "GenDataModEventsHisto.Controller.");
                if (that.binding.dataContact && that.nextUrl && listView) {
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select GenDataModEventsHisto.incidentView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    GenDataModEventsHisto.incidentView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "GenDataModEventsHisto.incidentView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && that.binding.dataContact) {
                            that.nextUrl = GenDataModEventsHisto.incidentView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.binding.dataContact.push(item);
                            });
                        }
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        that.loading = false;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //Log.print(Log.l.error, "ContactList.contactView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        that.loading = false;
                    },
                        null,
                        nextUrl);
                } else {
                    if (progress && progress.style) {
                        progress.style.display = "none";
                    }
                    that.loading = false;
                }
                Log.ret(Log.l.trace);
            }
            this.loadNextUrl = loadNextUrl;

            var loadData = function () {
                Log.call(Log.l.trace, "ContactResultsCriteria.Controller.");
                AppData.setErrorMsg(that.binding);
                var personId = getPersonId();
                var eventId = getEventId();
                var ret = new WinJS.Promise.as().then(function () {
                    var recordId = getRecordId();
                    Log.print(Log.l.trace, "calling select contactView...");
                    return GenDataModEventsHisto.contactView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "contactView: success!");
                        if (json && json.d && json.d.results) {
                            var result = json.d.results[0];
                            // now always edit!
                            that.setDataContact(result);
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, {BenutzerVIEWID: recordId, LanguageSpecID: AppData.getLanguageId()});
                }).then(function () {
                    Log.print(Log.l.trace, "calling select contactView...");
                    var recordId = getRecordId();
                    return GenDataModEventsHisto.incidentView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "contactView: success!");
                        if (json && json.d && json.d.results) {
                            that.nextUrl = GenDataModEventsHisto.incidentView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { PersonID: personId, VeranstaltungID: eventId, LanguageSpecID: AppData.getLanguageId() });
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
                return that.loadIcons();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {

            })
    });
})();




