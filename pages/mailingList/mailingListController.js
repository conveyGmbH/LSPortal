﻿// controller for page: mailingList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingList/mailingListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("MailingList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                dataMailingHeaderValue: getEmptyDefaultValue(MailingList.VAMail.defaultContactHeader),
                dataMailingHeaderText: getEmptyDefaultValue(MailingList.VAMail.defaultContactHeader),
                maileditlabel: getResourceText("mailingList.maileditlabel")
            }, commandList]);
            this.nextUrl = null;

            var that = this;
            var table = pageElement.querySelector("#tableId");
            var tableHeader = pageElement.querySelector(".table-header");
            var tableBody = pageElement.querySelector(".table-body");
            var contentArea = pageElement.querySelector(".contentarea"); 

            this.dispose = function () {
                if (tableBody && tableBody.winControl) {
                    tableBody.winControl.data = null;
                }
            }

            var loadIcons = function () {
                var icons = pageElement.querySelectorAll("#icons .action-image");
                for (var i = 0; i < icons.length; i++) {
                    icons[i].name = "mail_open2";
                }
                Colors.loadSVGImageElements(tableBody, "action-image", 40, Colors.textColor, "name");
            }
            this.loadIcons = loadIcons;

            var initializeTemplates = function (complete, error) {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = AppData.getRecordId("Veranstaltung");
                if (recordId) {
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_INITVAMails", {
                        pVeranstaltungID: recordId
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                } else {
                    var err = { status: 0, statusText: "no event" };
                    error(err);
                }
                Log.ret(Log.l.trace);
            };
            this.initializeTemplates = initializeTemplates;

            var loadFlags = function() {
                var flagde = pageElement.querySelectorAll("#flags #flagde");
                for (var i = 0; i < flagde.length; i++) {
                    flagde[i].name = "de";
                }
                var flaggb = pageElement.querySelectorAll("#flags #flaggb");
                for (var i = 0; i < flaggb.length; i++) {
                    flaggb[i].name = "gb";
                }
                var flagit = pageElement.querySelectorAll("#flags #flagit");
                for (var i = 0; i < flagit.length; i++) {
                    flagit[i].name = "it";
                }
                var flagfr = pageElement.querySelectorAll("#flags #flagfr");
                for (var i = 0; i < flagfr.length; i++) {
                    flagfr[i].name = "fr";
                }
                var flages = pageElement.querySelectorAll("#flags #flages");
                for (var i = 0; i < flages.length; i++) {
                    flages[i].name = "es";
                }
                var flagelse = pageElement.querySelectorAll("#flags #flagelse");
                for (var i = 0; i < flagelse.length; i++) {
                    flagelse[i].name = "threedots";
                }
                Colors.loadSVGImageElements(tableBody, "flag-image", 20, null , "name");
            }
            this.loadFlags = loadFlags;

            var setFlags = function(flagdata) {
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
                var flaggb = pageElement.querySelectorAll("#flags #flaggb");
                var flagde = pageElement.querySelectorAll("#flags #flagde");
                var flagfr = pageElement.querySelectorAll("#flags #flagfr");
                var flages = pageElement.querySelectorAll("#flags #flages");
                var flagit = pageElement.querySelectorAll("#flags #flagit");
                var flagelse = pageElement.querySelectorAll("#flags #flagelse");

                for (var i = 0; i < flagdata.length; i++) {
                    if (flagdata[i].EN_OK) {
                        flaggb[i].style.display = "block";
                    } else {
                        flaggb[i].style.display = "none";
                    }
                    if (flagdata[i].DE_OK) {
                        flagde[i].style.display = "block";
                    } else {
                        flagde[i].style.display = "none";
                    }
                    if (flagdata[i].FR_OK) {
                        flagfr[i].style.display = "block";
                    } else {
                        flagfr[i].style.display = "none";
                    }
                    if (flagdata[i].ES_OK) {
                        flages[i].style.display = "block";
                    } else {
                        flages[i].style.display = "none";
                    }
                    if (flagdata[i].IT_OK) {
                        flagit[i].style.display = "block";
                    } else {
                        flagit[i].style.display = "none";
                    }
                    if (flagdata[i].ELSE_OK) {
                        flagelse[i].style.display = "block";
                    } else {
                        flagelse[i].style.display = "none";
                    }
                }
            }
            this.setFlags = setFlags;

            var editButton = function() {
                var editbutton = pageElement.querySelectorAll(".mailedit-button");
                for (var i = 0; i < editbutton.length; i++) {
                    editbutton[i].textContent = getResourceText("mailingList.maileditlabel");
                }
            }
            this.editButton = editButton;

            var createHeaderData = function() {
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
                that.binding.dataMailingHeaderValue.VAMailTypeID = "VAMailTypeID";
                that.binding.dataMailingHeaderValue.MailTypeName = "MailTypeName";
                that.binding.dataMailingHeaderValue.VeranstaltungName ="VeranstaltungName" ;
                that.binding.dataMailingHeaderValue.Serie = "Serie";
                that.binding.dataMailingHeaderValue.TemplateName = "TemplateName";
                that.binding.dataMailingHeaderValue.LastModUTC = "LastModUTC";
                that.binding.dataMailingHeaderValue.Language = "Language";
                that.binding.dataMailingHeaderValue.IsActive = "IsActive";
                that.binding.dataMailingHeaderText.VAMailTypeID = getResourceText("mailingList.headerMailTyp");
                that.binding.dataMailingHeaderText.MailTypeName = getResourceText("mailingList.headermailtypename");
                that.binding.dataMailingHeaderText.VeranstaltungName = getResourceText("mailingList.headerveranstaltungname");
                that.binding.dataMailingHeaderText.Serie = getResourceText("mailingList.headerserie");
                that.binding.dataMailingHeaderText.TemplateName = getResourceText("mailingList.headertemplatename");
                that.binding.dataMailingHeaderText.LastModUTC = getResourceText("mailingList.headerlastmodutc");
                that.binding.dataMailingHeaderText.Language = getResourceText("mailingList.headerlanguage");
                that.binding.dataMailingHeaderText.IsActive = getResourceText("mailingList.headeractive");
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
            }
            this.createHeaderData = createHeaderData;

            var setMailStatusColor = function() {
                var mailActiveStatus = pageElement.querySelectorAll("#mailactivestatus");
                var active = getResourceText("mailingList.active");
                for (var i = 0; i < mailActiveStatus.length; i++) {
                    if (mailActiveStatus[i].textContent === active) {
                        mailActiveStatus[i].style.backgroundColor = "green";
                    } else {
                        mailActiveStatus[i].style.backgroundColor = "orange";
                    }
                }
            }
            this.setMailStatusColor = setMailStatusColor;

            var addZero = function(i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }
            this.addZero = addZero;

            var getDateObject = function (date) {
                Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                var dateString = date.replace("\/Date(", "").replace(")\/", "");
                var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                var time = new Date(milliseconds);
                var formdate = ("0" + time.getDate()).slice(-2) + "." + ("0" + (time.getMonth() + 1)).slice(-2) + "." + time.getFullYear() + " " + that.addZero(time.getUTCHours()) + ":" + that.addZero(time.getMinutes());
                Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
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
                    if (headertext === headervalue + " ↓") {

                    } else if (headertext === headervalue + " ↑") {

                    } else {

                    }
                }
                if (headervalue === "Firmenname") {
                    if (headertext === headervalue + " ↓") {

                    } else if (headertext === headervalue + " ↑") {

                    } else {

                    }
                }
                if (headervalue === "EMail") {
                    if (headertext === headervalue + " ↓") {

                    } else if (headertext === headervalue + " ↑") {

                    } else {

                    }
                }
                if (headervalue === "Stadt") {
                    if (headertext === headervalue + " ↓") {

                    } else if (headertext === headervalue + " ↑") {

                    } else {

                    }
                }
                if (headervalue === "Land") {
                    if (headertext === headervalue + " ↓") {

                    } else if (headertext === headervalue + " ↑") {

                    } else {

                    }
                }
                if (headervalue === "KontaktPrio") {
                    if (headertext === headervalue + " ↓") {

                    } else if (headertext === headervalue + " ↑") {

                    } else {

                    }
                }
                if (headervalue === "KontaktTyp") {
                    if (headertext === headervalue + " ↓") {

                    } else if (headertext === headervalue + " ↑") {

                    } else {

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
                                    if (restriction.OrderAttribute !== sortname) {
                                        restriction.OrderAttribute = sortname;
                                        restriction.OrderDesc = false;
                                        that.loadData(restriction);
                                        that.setHeaderText(myrow.value);
                                        Log.call(Log.l.trace, "ContactResultsList.Controller.");
                                    } else {
                                        restriction.OrderDesc = !restriction.OrderDesc;
                                        that.loadData(restriction);
                                        that.setHeaderText(myrow.value);
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
                                    AppData.setRecordId("VAMail", id);
                                    AppData.setRecordId("VAMailVIEW_20632", id);
                                    Application.navigateById("mailingEdit");
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
                clickMailEdit: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    var id = parseInt(event.currentTarget.value);
                    var langid = parseInt(AppData.getLanguageId());
                    AppData.setRecordId("VAMail", id);
                    AppData.setRecordId("VAMailVIEW_20632", id);
                    AppData.setRecordId("VAMailVIEW_20623", langid);
                    Application.navigateById("mailingEdit");
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
                onItemInserted: function (eventInfo) {
                    var index = eventInfo && eventInfo.detail && eventInfo.detail.index;
                    Log.call(Log.l.trace, "ContactResultList.Controller.", "index=" + index);
                    that.resizableGrid();
                    that.addHeaderRowHandlers();
                    that.addBodyRowHandlers();
                    Log.ret(Log.l.trace);
                },
                onContentScroll: function (eventInfo) {
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

            var resultConverter = function (item, index) {
                item.index = index;
                if (item.IsActive) {
                    item.IsActive = getResourceText("mailingList.active");
                } else {
                    item.IsActive = getResourceText("mailingList.pending");
                }
                if (item.LastModUTC) {
                    item.LastModUTC = that.getDateObject(item.LastModUTC);
                }
                if (item.SendMailTSUTC) {
                    item.SendMailTSUTC = that.getDateObject(item.SendMailTSUTC);
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
                    ret = ContactResultsList.KontaktReport.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ContactResultsList.KontaktReport: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            that.nextUrl = ContactResultsList.KontaktReport.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                        }
                    },
                        function (errorResponse) {
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

            var processAllData = function() {
                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.createHeaderData();
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
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.loadIcons();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.loadFlags();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.setFlags(that.flagdata);
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.editButton();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.setMailStatusColor();
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    AppBar.notifyModified = true;
                }); 
            }
            this.processAllData = processAllData;

            var loadData = function (restr) {
                Log.call(Log.l.trace, "MailingTypes.Controller.");
                AppData.setErrorMsg(that.binding);
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
                        return MailingList.VAMail.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "MailingTypes: success!");
                            if (json && json.d && json.d.results.length > 0) {
                                that.nextUrl = MailingList.VAMail.getNextUrl(json);
                                // now always edit!
                                var results = json.d.results;
                                that.flagdata = results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.processAllData();
                            }
                        },
                            function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, restr);
                    } else {
                        return MailingList.VAMail.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "MailingTypes: success!");
                            if (json && json.d && json.d.results.length > 0) {
                                that.nextUrl = MailingList.VAMail.getNextUrl(json);
                                // now always edit!
                                var results = json.d.results;
                                that.flagdata = results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                            }
                        },
                            function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, {
                                LanguageSpecID : AppData.getLanguageId()
                            });
                    }
                }).then(function () {
                    return WinJS.Promise.timeout(100);
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
                return that.initializeTemplates();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.createHeaderData();
            }).then(function () {
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
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadIcons();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadFlags();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.setFlags(that.flagdata);
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.editButton();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.setMailStatusColor();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            }); 
            Log.ret(Log.l.trace);
        }, {
                headerdata: null,
                bodydata: null,
                flagdata: null
            })
    });
})(); 