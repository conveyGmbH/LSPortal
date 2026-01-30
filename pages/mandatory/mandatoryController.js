// controller for page: mandatory
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mandatory/mandatoryService.js" />
/// <reference path="~/www/fragments/mandatoryList/mandatoryListController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Mandatory", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Mandatory.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com",
                doMandatoryShowFlag: null,
                noticeOn: getResourceText("mandatory.noticeOn"),
                noticeOff: getResourceText("mandatory.noticeOff"),
                Mandatory1: Mandatory.Mandatory1,
                Mandatory2: Mandatory.Mandatory2
            }, commandList]);
            this.nextUrl = null;
            this.loading = false;
            this.questions = null;
            this.fragmentVisible = true;

            var that = this;
            this.curRecId = 0;
            this.prevRecId = 0;

            // ListView control
            var listView = pageElement.querySelector("#mandatoryquestion.listview");
            //var confirmMandatoryQuestionnaire = pageElement.querySelector("#confirmMandatoryQuestionnaire");
            var radio1 = pageElement.querySelector("#option1");
            var radio2 = pageElement.querySelector("#option2");
            /*
            // prevent some keyboard actions from listview to navigate within controls!
            listView.addEventListener("keydown", function (e) {
                if (!e.ctrlKey && !e.altKey) {
                    switch (e.keyCode) {
                        case WinJS.Utilities.Key.leftArrow:
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.space:
                            e.stopImmediatePropagation();
                            break;
                    }
                }
            }.bind(this), true);
            */
            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var mouseDown = false;

            /*if (AppData._persistentStates.showConfirmQuestion) {
                confirmMandatoryQuestionnaire.winControl.checked = AppData._persistentStates.showConfirmQuestion;
            }*/

            var getEventId = function () {
                var eventId = null;
                Log.call(Log.l.trace, "Reporting.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller) {
                    eventId = master.controller.binding.eventId;
                } else {
                    eventId = AppData.getRecordId("Veranstaltung");
                }
                Log.ret(Log.l.trace, eventId);
                return eventId;
            }
            this.getEventId = getEventId;

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "Mandatory.Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var fields = element.querySelectorAll('input[type="checkbox"]');
                        ret["PflichtFlag"] = (fields[0] && fields[0].checked) ? 1 : null;
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var mergeRecord = function (prevRecord, newRecord) {
                Log.call(Log.l.trace, "Mandatory.Controller.");
                var ret = false;
                for (var prop in newRecord) {
                    if (newRecord.hasOwnProperty(prop)) {
                        if (newRecord[prop] !== prevRecord[prop]) {
                            prevRecord[prop] = newRecord[prop];
                            ret = true;
                        }
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.mergeRecord = mergeRecord;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "Mandatory.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    if (that.questions) {
                        for (var i = 0; i < that.questions.length; i++) {
                            var question = that.questions.getAt(i);
                            if (question && typeof question === "object" &&
                                question.FragenAntwortenVIEWID === recordId) {
                                listView.winControl.selection.set(i);
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i = null;
                Log.call(Log.l.trace, "Mandatory.Controller.", "recordId=" + recordId);
                var item = null;
                if (that.questions) {
                    for (i = 0; i < that.questions.length; i++) {
                        var question = that.questions.getAt(i);
                        if (question &&
                            typeof question === "object" &&
                            question.FragenAntwortenVIEWID === recordId) {
                            item = question;
                            break;
                        }
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

            var changeMandatorySetting = function (status) {
                Log.call(Log.l.trace, "Mandatory.Controller.");
                AppData.call("PRC_SETVERANSTOPTION", {
                    pVeranstaltungID: that.getEventId(),
                    pOptionTypeID: 22,
                    pValue: status
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                });
                Log.ret(Log.l.trace);
            };
            this.changeMandatorySetting = changeMandatorySetting;

            var validateCb = function () {
                Log.call(Log.l.trace, "Mandatory.Controller.");
                that.binding.doMandatoryShowFlag = null;
                var combBox = pageElement.querySelectorAll(".reqCB");
                for (var i = 0; i < combBox.length; i++) {
                    if (combBox[i].checked === true) {
                        that.binding.doMandatoryShowFlag = 1;
                    }
                }
                Log.call(Log.l.trace, "Mandatory.Controller.");
            }
            this.validateCb = validateCb;

            var loadFragment = function () {
                var mandatoryListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mandatoryList"));
                if (mandatoryListFragmentControl && mandatoryListFragmentControl.controller) {
                    return mandatoryListFragmentControl.controller.loadData();
                } else {
                    var parentElement = pageElement.querySelector("#mandatorylisthost");
                    if (parentElement) {
                        return Application.loadFragmentById(parentElement, "mandatoryList", {});
                    } else {
                        return WinJS.Promise.as();
                    }
                }
            }
            this.loadFragment = loadFragment;

            var saveFragment = function () {
                var mandatoryListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mandatoryList"));
                if (mandatoryListFragmentControl && mandatoryListFragmentControl.controller) {
                    return mandatoryListFragmentControl.controller.saveData();
                }
            }
            that.saveFragment = saveFragment;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.info, "success" + response);
                        that.saveFragment();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee" + errorResponse);
                    });
                    Log.ret(Log.l.trace);
                },
                clickDoMandatory: function (event) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    // value = "1" => show alert box and force user fill out question
                    // value = "0" => show confirm box and not force user fill out question
                    that.changeMandatorySetting(event.target.value);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickReqManCb: function (event) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    AppBar.modified = true;
                    that.validateCb();
                    that.saveData(function (response) {
                        Log.print(Log.l.info, "success" + response);
                        //that.saveFragment();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee" + errorResponse);
                    });
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.FragenAntwortenVIEWID) {
                                        var newRecId = item.data.FragenAntwortenVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            AppData.setRecordId('FragenAntworten', newRecId);
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            if (that.prevRecId !== 0) {
                                                that.saveData(function (response) {
                                                    Log.print(Log.l.trace, "question saved");
                                                    AppBar.triggerDisableHandlers();
                                                }, function (errorResponse) {
                                                    Log.print(Log.l.error, "error saving question");
                                                });
                                            } else {
                                                AppBar.triggerDisableHandlers();
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
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
                                layout = Application.MandatoryQuestionLayout.MandatoryLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
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
                            that.validateCb();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    /*Log.call(Log.l.trace, "Mandatory.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var mandatoryListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mandatoryList"));
                        var visible = eventInfo.detail.visible;
                        if (visible) {
                            if (!that.fragmentVisible) {
                                if (mandatoryListFragmentControl && mandatoryListFragmentControl.controller) {
                                    mandatoryListFragmentControl.controller.loadData();
                                } else if (listView) {
                                    var parentElement = listView.querySelector("#mandatorylisthost");
                                    if (parentElement) {
                                        Application.loadFragmentById(parentElement, "mandatoryList");
                                    }
                                }
                                that.fragmentVisible = true;
                            }
                        } else if (that.fragmentVisible) {
                            if (mandatoryListFragmentControl && mandatoryListFragmentControl.controller) {
                                mandatoryListFragmentControl.controller.saveData(function (response) {
                                    Log.print(Log.l.info, "mandatoryList.Controller. update: success!");
                                }, function (errorResponse) {
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                });
                            }
                            that.fragmentVisible = false;
                        }
                    }
                    Log.ret(Log.l.trace);*/
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.questions && that.nextUrl) {
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "calling select Mandatory.CR_V_FragengruppeView...");
                            Mandatory.manquestView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Mandatory.CR_V_FragengruppeView: success!");
                                // selectNext returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.nextUrl = Mandatory.manquestView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item) {
                                        that.resultConverter(item, that.binding.count);
                                        that.binding.count = that.questions.push(item);
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
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
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
                clickOk: function () {
                    return AppBar.busy;
                }
            }

            // register ListView event handler
            if (listView) {
                // prevent some keyboard actions from listview to navigate within controls!
                this.addRemovableEventListener(listView, "keydown", function (e) {
                    if (!e.ctrlKey && !e.altKey) {
                        switch (e.keyCode) {
                            case WinJS.Utilities.Key.leftArrow:
                            case WinJS.Utilities.Key.rightArrow:
                            case WinJS.Utilities.Key.space:
                                e.stopImmediatePropagation();
                                break;
                        }
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "contextmenu", function (e) {
                    var targetTagName = e.target &&
                        e.target.tagName &&
                        e.target.tagName.toLowerCase();
                    if (targetTagName === "textarea" || targetTagName === "input") {
                        e.stopImmediatePropagation();
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
            }

            var resultConverter = function (item, index) {
                switch (item.INITOptionTypeID || item.OptionTypeID) {
                    case 22:
                        if (item.LocalValue === "0") {
                            //AppData._persistentStates.showConfirmQuestion = false;
                            that.binding.Mandatory1 = false;
                            that.binding.Mandatory2 = true;
                        } else {
                            that.binding.Mandatory1 = true;
                            that.binding.Mandatory2 = false;
                        }
                        break;
                    default:
                    // defaultvalues
                }
                if (item.Sortierung && item.Fragestellung) {
                    item.QuestionWithNumber = item.Sortierung + ". " + item.Fragestellung;
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "Mandatory.Controller.");
                AppData.setErrorMsg(that.binding);
                that.questions = null;
                that.loading = true;
                var ret = new WinJS.Promise.as().then(function () {
                    that.loadFragment();
                }).then(function () {
                    return Mandatory.manquestView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Mandatory.manquestView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.count = json.d.results.length;
                            that.nextUrl = Mandatory.manquestView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            // Now, we call WinJS.Binding.List to get the bindable list
                            that.questions = new WinJS.Binding.List(results);
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.questions.dataSource;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, null);
                }).then(function () {
                    //AppData._persistentStates.showConfirmQuestion = true;
                    return AppData.getOptions(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Reporting: success!");
                        // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response

                        if (json && json.d) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                        }
                        //confirmMandatoryQuestionnaire.winControl.checked = AppData._persistentStates.showConfirmQuestion;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                            VeranstaltungID: that.getEventId(),
                            MandantWide: 1,
                            IsForApp: 0
                        });
                }).then(function () {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                var ret = null;
                Log.call(Log.l.trace, "Mandatory.Controller.");
                AppData.setErrorMsg(that.binding);
                // standard call via modify
                var recordId = that.prevRecId;
                if (!recordId) {
                    // called via canUnload
                    recordId = that.curRecId;
                    that.curRecId = 0;
                }
                that.prevRecId = 0;
                if (recordId) {
                    var curScope = that.scopeFromRecordId(recordId);
                    if (curScope && curScope.item) {
                        var newRecord = that.getFieldEntries(curScope.index);
                        if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) {
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = Mandatory.manquestView.update(function (response) {
                                Log.print(Log.l.info, "Mandatory.Controller. update: success!");
                                AppData.getUserData();
                                // called asynchronously if ok
                                AppData.getUserData();
                                AppBar.modified = false;
                                that.validateCb();
                                if (typeof complete === "function") {
                                    complete({});
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            }, recordId, curScope.item);
                        } else {
                            Log.print(Log.l.trace, "no changes in recordId:" + recordId);
                        }
                    }
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return that.setRadioButtons();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();




