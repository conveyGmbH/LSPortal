// controller for page: mailingList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingTemplateEvent/mailingTemplateEventService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("MailingTemplateEvent", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                dataTemplateEventHeaderValue: getEmptyDefaultValue(MailingTemplateEvent.VAMailLayout.defaultRestriction),
                dataTemplateEventHeaderText: getEmptyDefaultValue(MailingTemplateEvent.VAMailLayout.defaultRestriction),
                newDataTemplate: getEmptyDefaultValue(MailingTemplateEvent.VAMailLayout.insertRestriction),
                templatesearchlabel: getResourceText("mailingTemplateEvent.templatesearchbtn"),
                templateinsertbtnlabel: getResourceText("mailingTemplateEvent.templateinserthbtn"),
                deleteID : null
            }, commandList]);
            this.nextUrl = null;

            var that = this;
            var table = pageElement.querySelector("#tableId");
            var tableHeader = pageElement.querySelector(".table-header");
            var tableBody = pageElement.querySelector(".table-body");
            var contentArea = pageElement.querySelector(".contentarea");
            var directory = pageElement.querySelector("#directorydropdown"); 
            //var firstdirectory = pageElement.querySelector("#firstdirectorydropdown");
            
            this.dispose = function () {
                if (tableBody && tableBody.winControl) {
                    tableBody.winControl.data = null;
                }
            }
            
            var editButton = function() {
                var editbutton = pageElement.querySelectorAll(".mailedit-button");
                for (var i = 0; i < editbutton.length; i++) {
                    editbutton[i].textContent = getResourceText("mailingList.maileditlabel");
                }
            }
            this.editButton = editButton;

            var createHeaderData = function() {
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
                that.binding.dataTemplateEventHeaderValue.TemplateName = "TemplateName";
                that.binding.dataTemplateEventHeaderValue.MailTypeTitle = "MailTypeTitle";
                that.binding.dataTemplateEventHeaderValue.VeranstaltungName ="VeranstaltungName" ;
                that.binding.dataTemplateEventHeaderValue.UsedVeranstaltung = "UsedVeranstaltung";
                that.binding.dataTemplateEventHeaderValue.LangsAvailable = "LangsAvailable";
                that.binding.dataTemplateEventHeaderValue.Erfassungsdatum = "Erfassungsdatum";
                that.binding.dataTemplateEventHeaderValue.IsActive = "IsActive";
                that.binding.dataTemplateEventHeaderText.TemplateName = getResourceText("mailingTemplateEvent.headertemplatename");
                that.binding.dataTemplateEventHeaderText.MailTypeTitle = getResourceText("mailingTemplateEvent.headermailtypetitle");
                that.binding.dataTemplateEventHeaderText.VeranstaltungName = getResourceText("mailingTemplateEvent.headerveranstaltungname");
                that.binding.dataTemplateEventHeaderText.UsedVeranstaltung = getResourceText("mailingTemplateEvent.headerusedveranstaltung");
                that.binding.dataTemplateEventHeaderText.LangsAvailable = getResourceText("mailingTemplateEvent.headerlangsavailable");
                that.binding.dataTemplateEventHeaderText.Erfassungsdatum = getResourceText("mailingTemplateEvent.headererfassungsdatum");
                that.binding.dataTemplateEventHeaderText.IsActive = getResourceText("mailingTemplateEvent.headerisactive");
                Log.call(Log.l.trace, "ContactResultsList.Controller.");
            }
            this.createHeaderData = createHeaderData;

            var setMailStatusColor = function() {
                var templateActiveStatus = pageElement.querySelectorAll("#templateactivestatus");
                var active = getResourceText("mailingList.active");
                for (var i = 0; i <= templateActiveStatus.length; i++) {
                    if (templateActiveStatus[i].textContent === active) {
                        templateActiveStatus[i].style.backgroundColor = "green";
                    } else {
                        templateActiveStatus[i].style.backgroundColor = "orange";
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
            
            var addHeaderRowHandlers = function () {
                if (tableHeader) {
                    var cells = tableHeader.getElementsByTagName("th");
                    for (var i = 1; i < cells.length; i++) {
                        var cell = cells[i];
                        if (!cell.onclick) {
                            cell.onclick = function (myrow) {
                                return function () {
                                    var restriction = MailingTemplateEvent.VAMailLayout.defaultRestriction;
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
                                    Application.navigateById("MailingTemplateEventEdit");
                                };
                            }(row);
                        }
                    }
                }
            }
            this.addBodyRowHandlers = addBodyRowHandlers;

            var insertBtn = function() {
                var insertTemplate = pageElement.querySelector("#inserttemplate");
                if (insertTemplate.style.display === "none") {
                    insertTemplate.style.display = "block";
                } else {
                    that.binding.newDataTemplate = getEmptyDefaultValue(MailingTemplateEvent.VAMailLayout.insertRestriction);
                    insertTemplate.style.display = "none";
                }
            }
            this.insertBtn = insertBtn;

            var processAllData = function() {
                Log.call(Log.l.trace, "Employee.Controller.");
                that.processAll().then(function () {
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

            var getLangSpecErrorMsg = function (resultmessageid, errorMsg) {
                Log.call(Log.l.trace, "Employee.Controller.");
                var lang = AppData.getLanguageId();
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_GetLangText", {
                    pTextID: resultmessageid,
                    pLanguageID: lang
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    errorMsg.data.error.message.value = json.d.results[0].ResultText;
                    AppData.setErrorMsg(that.binding, errorMsg);
                }, function (error) {
                    Log.print(Log.l.error, "call error");

                });
                Log.ret(Log.l.trace);
            }
            this.getLangSpecErrorMsg = getLangSpecErrorMsg;

            var getErrorMsgFromErrorStack = function (errorMsg) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_GetErrorStack", {
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppBar.modified = false;
                    if (json.d.results[0].ResultMessageID > 0) {
                        errorMsg.data.error.code = json.d.results[0].ResultCode;
                        errorMsg.data.error.message.value = that.getLangSpecErrorMsg(json.d.results[0].ResultMessageID, errorMsg);
                        Log.print(Log.l.info, "call success! ");
                    } else {
                        errorMsg.data.error.message.value = json.d.results[0].ResultMessage;
                        errorMsg.data.error.code = json.d.results[0].ResultCode;
                        AppData.setErrorMsg(that.binding, errorMsg);
                        Log.print(Log.l.info, "call success! ");
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                    AppBar.modified = false;

                });
                Log.ret(Log.l.trace);
            }
            this.getErrorMsgFromErrorStack = getErrorMsgFromErrorStack;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    that.insertBtn();
                    Log.ret(Log.l.trace);
                },
                clickInsertLayout: function(event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppBar.busy = true;
                    Log.print(Log.l.trace, "eployee saved");
                    var newLayoutData = that.binding.newDataTemplate;
                    newLayoutData.VAMailTypeID = parseInt(newLayoutData.VAMailTypeID);
                    MailingTemplateEvent.VAMailLayout.insert(function(json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "employeeView insert: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                Log.print(Log.l.error, "error inserting employee");
                                that.insertBtn();
                                that.processAll().then(function () {
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
                                    return that.editButton();
                                }).then(function () {
                                    Log.print(Log.l.trace, "Binding wireup page complete");
                                    return that.setMailStatusColor();
                                }).then(function () {
                                    Log.print(Log.l.trace, "Data loaded");
                                    AppBar.notifyModified = true;
                                });
                            }
                            AppBar.modified = true;
                        },
                        function(errorResponse) {
                            Log.print(Log.l.error, "error inserting employee");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        },
                        newLayoutData);
                    Log.ret(Log.l.trace);
                },
                clickTemplateSearch: function(event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                  
                },
                clickLayoutEdit: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    var id = parseInt(event.currentTarget.value);
                    AppData.setRecordId("VAMail", id);
                    Application.navigateById("MailingTemplateEventEdit");
                },
                setDeleteID: function (event) {
                    var tar = event.currentTarget.value;
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    var checkbox = pageElement.querySelectorAll(".checkbox");
                    for (var i = 0; i < checkbox.length; i++) {
                        if (checkbox[i].value === tar && checkbox[i].checked === false) {
                            checkbox[i].checked = false;
                            that.binding.deleteID = null;
                            Log.call(Log.l.trace, "Mailing.Controller.");
                        } else if (checkbox[i].value === tar) {
                            that.binding.deleteID = parseInt(checkbox[i].value);
                           Log.call(Log.l.trace, "Mailing.Controller."); 
                        } else {
                            checkbox[i].checked = false;
                            Log.call(Log.l.trace, "Mailing.Controller.");
                        }
                    }
                    Log.call(Log.l.trace, "Mailing.Controller.");
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    AppData.setErrorMsg(that.binding);
                    var recordId = that.binding.deleteID;
                    if (recordId) {
                        AppBar.busy = true;
                        MailingTemplateEvent.VAMailLayout.deleteRecord(function (response) {
                            AppBar.busy = false;
                            that.processAllData();
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            that.getErrorMsgFromErrorStack(errorResponse);
                        }, recordId);
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

            var resultCategoryConverter = function (item, index) {
                item.index = index;
                if (item.LanguageTitle) {
                    that.templateData.push({ VAMailTypeID: item.VAMailTypeID, TITLE: item.LanguageTitle });
                }
            }
            this.resultCategoryConverter = resultCategoryConverter;

            var resultConverter = function (item, index) {
                item.index = index;
                if (item.IsActive) {
                    item.IsActive = getResourceText("mailingList.active");
                } else {
                    item.IsActive = getResourceText("mailingList.pending");
                }
                if (item.ModifiedTS) {
                    item.ModifiedTS = that.getDateObject(item.ModifiedTS);
                }
                if (item.CreateTS) {
                    item.CreateTS = that.getDateObject(item.CreateTS);
                }
                if (item.LanguageTitle) {
                    that.templateData.push({ VAMailTypeID: item.VAMailTypeID, TITLE: item.LanguageTitle });
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
                    ret = MailingTemplateEvent.VAMailLayout.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ContactResultsList.KontaktReport: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            that.nextUrl = MailingTemplateEvent.VAMailLayout.getNextUrl(json);
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
                    Log.print(Log.l.trace, "calling select initSpracheView...");
                    //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                    return MailingTemplateEvent.LangVAMailTypeView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;
                                that.templateData = that.templateData.concat({ INITSpracheID: 0, TITLE: "" });
                                // Now, we call WinJS.Binding.List to get the bindable list
                                results.forEach(function (item, index) {
                                    that.resultCategoryConverter(item, index);
                                });
                                if (directory && directory.winControl) {
                                    directory.winControl.data = new WinJS.Binding.List(that.templateData);
                                    directory.selectedIndex = 0;
                                }
                                /*if (firstdirectory && firstdirectory.winControl) {
                                    firstdirectory.winControl.data = new WinJS.Binding.List(that.templateData);
                                    firstdirectory.selectedIndex = 0;
                                }*/
                        } 
                        },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, { LanguageSpecID : AppData.getLanguageId() });

                }).then(function () {
                    Log.print(Log.l.trace, "calling select VAMailLayout...");
                    if (restr) {
                        return MailingTemplateEvent.VAMailLayout.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "VAMailLayout: success!");
                            if (json && json.d && json.d.results.length > 0) {
                                that.nextUrl = MailingTemplateEvent.VAMailLayout.getNextUrl(json);
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
                        return MailingTemplateEvent.VAMailLayout.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "VAMailLayout: success!");
                            if (json && json.d && json.d.results.length > 0) {
                                that.nextUrl = MailingTemplateEvent.VAMailLayout.getNextUrl(json);
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
                templateData: []
            })
    });
})(); 