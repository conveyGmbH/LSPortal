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
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Mandatory.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0
            }]);
            this.nextUrl = null;
            this.loading = false;
            this.questions = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#mandatoryquestion.listview");
            var confirmMandatoryQuestionnaire = pageElement.querySelector("#confirmMandatoryQuestionnaire");
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

            var changeMandatorySetting = function (pageProperty, status) {
                Log.call(Log.l.trace, "Settings.Controller.", "pageProperty=" + pageProperty + " color=" + status);
                var pOptionTypeId = null;
                var pValue = null;

                switch (pageProperty) {
                    case "showHideQuestionnaire":
                        pOptionTypeId = 20;
                        break;
                    case "confirmMandatoryQuestionnaire":
                        pOptionTypeId = 22;
                        break;
                }
                if (typeof status === "boolean" && status) {
                    pValue = "1";
                } else {
                    pValue = "0";
                }

                if (pOptionTypeId) {
                    AppData.call("PRC_SETVERANSTOPTION",
                        {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            pOptionTypeID: pOptionTypeId,
                            pValue: pValue
                        },
                        function (json) {
                            Log.print(Log.l.info, "call success! ");
                        },
                        function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                }
            };
            this.changeMandatorySetting = changeMandatorySetting;

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
                            Log.print(Log.l.error, "success" + response);
                        },
                        function (errorResponse) {
                            Log.print(Log.l.error, "error saving employee" + errorResponse);
                        }).then(function () {
                            that.loadData();
                        });
                    Log.ret(Log.l.trace);
                },
                clickDoMandatory: function (event) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    console.log(event.currentTarget.winControl.checked);
                    Log.call(Log.l.trace, "Event.Controller.");
                    var toggle = event.currentTarget.winControl;
                    if (toggle) {
                        // that.binding.isQuestionnaireVisible = toggle.checked;
                        AppData._persistentStates.showConfirmQuestion = toggle.checked;
                    }
                    that.changeMandatorySetting(event.target.id, toggle.checked);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                changedMandatoryField: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    //analog zu changedTextDate
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var value = event.currentTarget.value;
                        if (that.curRecId && !that.prevRecId) {
                            var curScope = that.scopeFromRecordId(that.curRecId);
                            if (curScope &&
                                curScope.item &&
                                curScope.item.PflichtFlag !== value) {
                                curScope.item.PflichtFlag = value;

                                var newRecId = curScope.item.FragenAntwortenVIEWID;
                                //var newRecord = that.getFieldEntries(curScope.index, curScope.item.Fragentyp);
                                //that.mergeRecord(curScope.item, newRecord);
                                //that.questions.setAt(curScope.index, curScope.item);
                                //if (newRecId !== 0 && newRecId !== that.curRecId) {
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
                                //}
                                // set modified!
                                // AppBar.modified = true;
                            }
                        }
                    }
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
                                layout = Application.QuestiongroupLayout.QuestionsLayout;
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
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                /*onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Mandatory.Controller.");
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
                            Mandatory.CR_V_FragengruppeView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Mandatory.CR_V_FragengruppeView: success!");
                                // selectNext returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.nextUrl = Mandatory.CR_V_FragengruppeView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item) {
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
                }*/
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
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                //this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                //this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
            }

            var resultConverter = function (item, index) {
                switch (item.INITOptionTypeID) {
                    case 22:
                        if (item.LocalValue === "0") {
                            AppData._persistentStates.showConfirmQuestion = false;
                        }
                        break;
                    default:
                        // defaultvalues
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "Mandatory.Controller.");
                AppData.setErrorMsg(that.binding);

                var ret = new WinJS.Promise.as().then(function () {
                    return Mandatory.manquestView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Mandatory.manquestView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.count = json.d.results.length;
                            //that.nextUrl = MandatoryList.mandatoryView.getNextUrl(json);
                            var results = json.d.results;
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
                    AppData._persistentStates.showConfirmQuestion = true;
                    return Mandatory.CR_VERANSTOPTION_ODataView.select(function (json) {
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
                        confirmMandatoryQuestionnaire.winControl.checked = AppData._persistentStates.showConfirmQuestion;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });

                }).then(function () {
                    var mandatoryListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mandatoryList"));
                    if (mandatoryListFragmentControl && mandatoryListFragmentControl.controller) {
                        return mandatoryListFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#mandatorylisthost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "mandatoryList");
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
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
                                // called asynchronously if ok
                                AppBar.modified = false;
                                var mandatoryListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mandatoryList"));
                                if (mandatoryListFragmentControl && mandatoryListFragmentControl.controller) {
                                    mandatoryListFragmentControl.controller.saveData(complete, error);
                                } else {
                                    if (typeof complete === "function") {
                                        complete({});
                                    }
                                    ret = WinJS.Promise.as();
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
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();




