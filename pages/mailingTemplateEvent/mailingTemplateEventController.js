﻿// controller for page: mailingList
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
            Application.Controller.apply(this,
                [
                    pageElement, {
                        count: 0,
                        dataTemplateEventHeaderValue: getEmptyDefaultValue(MailingTemplateEvent.VAMailLayout.defaultRestriction),
                        dataTemplateEventHeaderText: getEmptyDefaultValue(MailingTemplateEvent.VAMailLayout.defaultRestriction),
                        newDataTemplate: getEmptyDefaultValue(MailingTemplateEvent.VAMailLayout.insertRestriction),
                        templatesearchlabel: getResourceText("mailingTemplateEvent.templatesearchbtn"),
                        templateinsertbtnlabel: getResourceText("mailingTemplateEvent.templateinserthbtn"),
                        Edited: getResourceText("mailingTemplateEvent.edited"),
                        deleteID: null
                    },
                    commandList
                ]);
            this.nextUrl = null;

            var that = this;
            var table = pageElement.querySelector("#tableId");
            var tableHeader = pageElement.querySelector(".table-header");
            var tableBody = pageElement.querySelector(".table-body");
            var contentArea = pageElement.querySelector(".contentarea");
            var directory = pageElement.querySelector("#directorydropdown");
            var textName = pageElement.querySelector("#layouttextname");

            this.dispose = function () {
                if (tableBody && tableBody.winControl) {
                    tableBody.winControl.data = null;
                }
            }

            var editButton = function () {
                var editbutton = pageElement.querySelectorAll(".mailedit-button");
                for (var i = 0; i < editbutton.length; i++) {
                    editbutton[i].textContent = getResourceText("mailingList.maileditlabel");
                }
            }
            this.editButton = editButton;

            var setMailStatusColor = function () {
                var templateActiveStatus = pageElement.querySelectorAll("#templateactivestatus");
                var active = getResourceText("mailingList.active");
                for (var i = 0; i <= templateActiveStatus.length; i++) {
                    if (templateActiveStatus[i].textContent === active) {
                        templateActiveStatus[i].style.backgroundColor = Colors.onColor;
                    } else {
                        templateActiveStatus[i].style.backgroundColor = Colors.pauseColor;
                    }
                }
            }
            this.setMailStatusColor = setMailStatusColor;

            var addZero = function (i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }
            this.addZero = addZero;

            var getDateObject = function (date) {
                Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                var dateString = date.replace("\/Date(", "").replace(")\/", "");
                var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                var time = new Date(milliseconds);
                var formdate = ("0" + time.getDate()).slice(-2) + "." + ("0" + (time.getMonth() + 1)).slice(-2) + "." + time.getFullYear() + " " + that.addZero(time.getUTCHours()) + ":" + that.addZero(time.getMinutes());
                Log.print(Log.l.trace);
                return formdate;
            };
            this.getDateObject = getDateObject;

            var sortTable = function (n) {
                Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                var rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
                switching = true;
                // Set the sorting direction to ascending:
                dir = "asc";
                /* Make a loop that will continue until
                no switching has been done: */
                while (switching) {
                    // Start by saying: no switching is done:
                    switching = false;
                    rows = table.rows;
                    /* Loop through all table rows (except the
                    first, which contains table headers): */
                    for (i = 1; i < (rows.length - 1) ; i++) {
                        // Start by saying there should be no switching:
                        shouldSwitch = false;
                        /* Get the two elements you want to compare,
                        one from current row and one from the next: */
                        x = rows[i].getElementsByTagName("TD")[n];
                        y = rows[i + 1].getElementsByTagName("TD")[n];
                        /* Check if the two rows should switch place,
                        based on the direction, asc or desc: */
                        if (Number(x.innerHTML) > Number(y.innerHTML)) {
                            shouldSwitch = true;
                            break;
                        }
                        if (dir === "asc") {
                            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                                // If so, mark as a switch and break the loop:
                                shouldSwitch = true;
                                break;
                            }
                        } else if (dir === "desc") {
                            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                                // If so, mark as a switch and break the loop:
                                shouldSwitch = true;
                                break;
                            }
                        }
                    }
                    if (shouldSwitch) {
                        /* If a switch has been marked, make the switch
                        and mark that a switch has been done: */
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        switching = true;
                        // Each time a switch is done, increase this count by 1:
                        switchcount++;
                    } else {
                        /* If no switching has been done AND the direction is "asc",
                        set the direction to "desc" and run the while loop again. */
                        if (switchcount === 0 && dir === "asc") {
                            dir = "desc";
                            switching = true;
                        }
                    }
                }
            }
            this.sortTable = sortTable;

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

                    div.addEventListener("mousedown",
                        function (e) {
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

                    pageElement.addEventListener("mousemove",
                        function (e) {
                            if (curCol) {
                                var diffX = e.pageX - pageX;

                                if (nxtCol)
                                    nxtCol.style.width = (nxtColWidth - (diffX)) + "px";

                                curCol.style.width = (curColWidth + diffX) + "px";
                            }
                        });

                    pageElement.addEventListener("mouseup",
                        function (e) {
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

            var insertBtn = function () {
                var insertTemplate = pageElement.querySelector("#inserttemplate");
                if (insertTemplate.style.display === "none") {
                    insertTemplate.style.display = "block";
                } else {
                    that.binding.newDataTemplate = getEmptyDefaultValue(MailingTemplateEvent.VAMailLayout.insertRestriction);
                    insertTemplate.style.display = "none";
                }
            }
            this.insertBtn = insertBtn;

            var processAllData = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.resizableGrid();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    //return that.addHeaderRowHandlers();
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

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSortTable: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    that.sortTable(parseInt(event.currentTarget.id));
                    Log.ret(Log.l.trace);
                },
                onDirectoryChange: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    var st = directory.options[directory.selectedIndex].text;
                    var count = 0;
                    for (var i = 0; i < that.tableData.length; i++) {
                        if (that.tableData[i].MailTypeTitle === st) {
                            count = count + 1;
                        }
                    }
                    var str = st.replace('E-Mail ', '');
                    textName.value = str + " " + (count + 1);
                    that.binding.newDataTemplate.TextName = str + " " + (count + 1);
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    directory.style.border = "1px solid black";
                    textName.style.borderBottom = "1px solid black";
                    textName.style.borderLeft = "none";
                    textName.style.borderRight = "none";
                    textName.style.borderTop = "none";
                    that.insertBtn();
                    Log.ret(Log.l.trace);
                },
                clickInsertLayout: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    AppBar.busy = true;
                    Log.print(Log.l.trace, "eployee saved");
                    var newLayoutData = that.binding.newDataTemplate;
                    if (newLayoutData.VAMailTypeID === 0 || newLayoutData.TextName === "") {
                        if (newLayoutData.VAMailTypeID === 0) {
                            directory.style.border = "5px solid red";
                        }
                        if (newLayoutData.TextName === "") {
                            textName.style.border = "5px solid red";
                        }
                    } else {
                        newLayoutData.VAMailTypeID = parseInt(newLayoutData.VAMailTypeID);
                        MailingTemplateEvent.VAMailLayout.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "employeeView insert: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                Log.print(Log.l.error, "error inserting employee");
                                that.insertBtn();
                                //return that.loadData();
                                that.processAll().then(function () {
                                    Log.print(Log.l.trace, "Binding wireup page complete");
                                    return that.loadData();
                                }).then(function () {
                                    Log.print(Log.l.trace, "Binding wireup page complete");
                                    return that.resizableGrid();
                                }).then(function () {
                                    Log.print(Log.l.trace, "Binding wireup page complete");
                                    //return that.addHeaderRowHandlers();
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
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting employee");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, newLayoutData);
                    }
                    Log.ret(Log.l.trace);
                },
                clickTemplateSearch: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    Log.ret(Log.l.trace);
                },
                clickLayoutEdit: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    var id = parseInt(event.currentTarget.value);
                    // VAMailLayout
                    AppData.setRecordId("VAMail", id);
                    Application.navigateById("MailingTemplateEventEdit");
                    Log.ret(Log.l.trace);
                },
                setDeleteID: function (event) {
                    var tar = event.currentTarget.value;
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    var checkbox = pageElement.querySelectorAll(".checkbox");
                    for (var i = 0; i < checkbox.length; i++) {
                        if (checkbox[i].value === tar && checkbox[i].checked === false) {
                            checkbox[i].checked = false;
                            that.binding.deleteID = null;
                        } else if (checkbox[i].value === tar) {
                            that.binding.deleteID = parseInt(checkbox[i].value);
                        } else {
                            checkbox[i].checked = false;
                        }
                    }
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    AppData.setErrorMsg(that.binding);
                    var err = null;
                    var recordId = that.binding.deleteID;
                    if (recordId) {
                        AppBar.busy = true;
                        MailingTemplateEvent.VAMailLayout.deleteRecord(function (response) {
                            AppBar.busy = false;
                            //return that.loadData();
                            that.processAll().then(function () {
                                Log.print(Log.l.trace, "Binding wireup page complete");
                                return that.loadData();
                            }).then(function () {
                                Log.print(Log.l.trace, "Binding wireup page complete");
                                return that.processAllData();
                            });
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            err = errorResponse;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.getErrorMsgFromErrorStack(errorResponse).then(function () {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            });
                        }, recordId);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
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
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.", "index=" + index);
                    that.resizableGrid();
                    that.addHeaderRowHandlers();
                    that.addBodyRowHandlers();
                    Log.ret(Log.l.trace);
                },
                onContentScroll: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
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
                },
                clickDelete: function () {
                    // && that.binding.dataContact.KontaktVIEWID && 
                    if (that.binding.deleteID && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            if (contentArea) {
                this.addRemovableEventListener(contentArea, "scroll", this.eventHandlers.onContentScroll.bind(this));
            }

            if (directory) {
                this.addRemovableEventListener(directory, "change", this.eventHandlers.onDirectoryChange.bind(this));
            }

            var resultCategoryConverter = function (item, index) {
                item.index = index;
                if (item.LanguageTitle) {
                    that.templateData.push({
                        VAMailTypeID: item.VAMailTypeID,
                        TITLE: item.LanguageTitle
                    });
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
                    that.templateData.push({
                        VAMailTypeID: item.VAMailTypeID,
                        TITLE: item.LanguageTitle
                    });
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
                Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
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
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "ContactResultsList.KontaktReport: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    }, null, nextUrl).then(function () {
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
                Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
                AppData.setErrorMsg(that.binding);
                that.nextUrl = null;
                that.tableData = [];
                if (tableBody && tableBody.winControl) {
                    if (tableBody.winControl.data) {
                        tableBody.winControl.data.length = 0;
                    } else {
                        tableBody.winControl.data = WinJS.Binding.List([]);
                    }
                }
                if (directory && directory.winControl) {
                    directory.winControl.data.length = 0;
                    that.templateData = [];
                }
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select initSpracheView...");
                    //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                    return MailingTemplateEvent.LangVAMailTypeView.select(function (json) {
                        Log.print(Log.l.trace, "initSpracheView: success!");
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            that.templateData = that.templateData.concat({
                                INITSpracheID: 0,
                                TITLE: ""
                            });
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
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        LanguageSpecID: AppData.getLanguageId()
                    });
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
                                that.tableData = results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.processAllData();
                            }
                        }, function (errorResponse) {
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
                                that.tableData = results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.processAllData();
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                            LanguageSpecID: AppData.getLanguageId()
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
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.resizableGrid();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return that.addHeaderRowHandlers();
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
            templateData: [],
            tableData: []
        })
    });
})();
