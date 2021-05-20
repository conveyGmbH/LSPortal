// controller for page: GenDataModHisto
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataModHisto/genDataModHistoService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    
    WinJS.Namespace.define("GenDataModHisto", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList, isMaster) {
                Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                Application.RecordsetController.apply(this, [pageElement, {
                      count: 0
                }, commandList]);

                // ListView control
                var listView = pageElement.querySelector("#genDataModHisto.listview");
                

                this.nextUrl = null;
                this.nextDocUrl = null;
                this.loading = false;
                this.modHistoData = null;
              
                this.firstmodHistoDataIndex = 0;

                var that = this;

                var mouseDown = false;
              
                this.dispose = function () {
                    if (listView && listView.winControl) {
                        listView.winControl.itemDataSource = null;
                    }
                    if (that.modHistoData) {
                        that.modHistoData = null;
                    }
                    listView = null;
                }

                var progress = null;
                var counter = null;
                var layout = null;

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

                var getRestriction = function() {
                    var restriction = AppData.getRestriction("Kontakt");
                    if (!restriction) {
                        restriction = {};
                    }
                    return restriction;
                }
                this.getRestriction = getRestriction;

                var loadNextUrl = function (recordId) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                    if (that.modHistoData && that.nextUrl && listView) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        that.loading = true;
                        if (progress && progress.style) {
                            progress.style.display = "inline";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "none";
                        }
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "calling select GenDataModHisto.personAdresseView...");
                        var nextUrl = that.nextUrl;
                        that.nextUrl = null;
                        GenDataModHisto.personAdresseView.selectNext(function (json) { //json is undefined
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "GenDataModHisto.personAdresseView: success!");
                            // startContact returns object already parsed from json file in response
                            if (json && json.d && that.modHistoData) {
                                that.nextUrl = GenDataModHisto.personAdresseView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, that.binding.count);
                                    that.binding.count = that.modHistoData.push(item);
                                });
                            }
                            if (recordId) {
                                that.selectRecordId(recordId);
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "GenDataModHisto.personAdresseView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }, null, nextUrl);
                    }
                    Log.ret(Log.l.trace);
                }
                this.loadNextUrl = loadNextUrl;

                var scopeFromRecordId = function (recordId) {
                    var i;
                    Log.call(Log.l.trace, "Questiongroup.Controller.", "recordId=" + recordId);
                    var item = null;
                    if (that.modHistoData) {
                        for (i = 0; i < that.modHistoData.length; i++) {
                            var mod = that.modHistoData.getAt(i);
                            if (mod && typeof mod === "object" &&
                                mod.PersonAdresseVIEWID === recordId) {
                                item = mod;
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

                var scrollToRecordId = function (recordId) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                    if (that.loading) {
                        WinJS.Promise.timeout(50).then(function () {
                            that.scrollToRecordId(recordId);
                        });
                    } else {
                        if (recordId && listView && listView.winControl && that.modHistoData) {
                            for (var i = 0; i < that.modHistoData.length; i++) {
                                var mod = that.modHistoData.getAt(i);
                                if (mod && typeof mod === "object" &&
                                    mod.PersonAdresseVIEWID === recordId) {
                                    listView.winControl.indexOfFirstVisible = i - 1;
                                    break;
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.scrollToRecordId = scrollToRecordId;

                var selectRecordId = function (recordId) {
                    var mod;
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.", "recordId=" + recordId);
                    var recordIdNotFound = true;
                    if (recordId && listView && listView.winControl && listView.winControl.selection && that.modHistoData) {
                        for (var i = 0; i < that.modHistoData.length; i++) {
                            mod = that.modHistoData.getAt(i);
                            if (mod &&
                                typeof mod === "object" &&
                                mod.PersonAdresseVIEWID === recordId) {
                                AppData.setRecordId("Kontakt", recordId);
                                listView.winControl.selection.set(i).done(function() {
                                    WinJS.Promise.timeout(50).then(function() {
                                        that.scrollToRecordId(recordId);
                                    });
                                });
                                recordIdNotFound = false;
                                break;
                            }
                        }
                        if (recordIdNotFound) {
                            that.loadNextUrl(recordId);
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.selectRecordId = selectRecordId;

                var resultConverter = function (item, index) {
                    item.index = index;
                    
                }
                this.resultConverter = resultConverter;
              
                // define handlers
                this.eventHandlers = {
                    clickBack: function (event) {
                        Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                        if (WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    onPointerDown: function (e) {
                        Log.call(Log.l.trace, "Questiongroup.Controller.");
                        that.cursorPos = { x: e.pageX, y: e.pageY };
                        mouseDown = true;
                        Log.ret(Log.l.trace);
                    },
                    onMouseDown: function (e) {
                        Log.call(Log.l.trace, "Questiongroup.Controller.");
                        that.cursorPos = { x: e.pageX, y: e.pageY };
                        mouseDown = true;
                        Log.ret(Log.l.trace);
                    },
                    onPointerUp: function (e) {
                        Log.call(Log.l.trace, "Questiongroup.Controller.");
                        mouseDown = false;
                        Log.ret(Log.l.trace);
                    },
                    onMouseUp: function (e) {
                        Log.call(Log.l.trace, "Questiongroup.Controller.");
                        mouseDown = false;
                        Log.ret(Log.l.trace);
                    },
                    clickUpdateRating: function (event) {
                        Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                        var ret;
                        var rating = pageElement.querySelectorAll("#modRating");
                        var listControl = listView.winControl;
                        listControl.selection.getItems().done(function(items) {
                            var modRatingData = items[0].data;
                            var index = modRatingData.index;
                            var recordId = modRatingData.BenutzerVIEWID;
                            var newrating = rating[index].winControl.userRating;
                            modRatingData.Rating = newrating;
                            if (recordId) {
                                AppBar.busy = true;
                                AppBar.triggerDisableHandlers();
                                ret = GenDataModHisto.benutzerTable.update(function (response) {
                                    AppBar.busy = false;
                                    AppBar.triggerDisableHandlers();
                                    // called asynchronously if ok
                                    Log.print(Log.l.info, "eventData update: success!");
                                    AppBar.modified = false;
                                }, function (errorResponse) {
                                    AppBar.busy = false;
                                    AppBar.triggerDisableHandlers();
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                    }, recordId, modRatingData);
                            } else {
                                Log.print(Log.l.info, "not supported");
                                ret = WinJS.Promise.as();
                            }
                        });
                        Log.ret(Log.l.trace);
                        return ret;
                    },
                    clickUpdateRatingText: function (event) {
                        Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                        var ratingtext = pageElement.querySelectorAll("#modRatingText");
                        var ret;
                        var listControl = listView.winControl;
                        var selectionCount = listControl.selection.count();
                        listControl.selection.getItems().done(function (items) {
                            var modRatingTextData = items[0].data;
                            var recordId = modRatingTextData.BenutzerVIEWID;
                            var index = modRatingTextData.index;
                            var newratingtext = ratingtext[index].value;
                            if (index !== that.indexold) {
                                Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                            } else {
                                 if (modRatingTextData.RatingText !== newratingtext) {
                                     Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                                     modRatingTextData.RatingText = newratingtext;
                                     if (recordId) {
                                         AppBar.busy = true;
                                         AppBar.triggerDisableHandlers();
                                         ret = GenDataModHisto.benutzerTable.update(function (response) {
                                             AppBar.busy = false;
                                             AppBar.triggerDisableHandlers();
                                             // called asynchronously if ok
                                             Log.print(Log.l.info, "eventData update: success!");
                                             AppBar.modified = false;
                                         }, function (errorResponse) {
                                             AppBar.busy = false;
                                             AppBar.triggerDisableHandlers();
                                             // called asynchronously if an error occurs
                                             // or server returns response with an error status.
                                             AppData.setErrorMsg(that.binding, errorResponse);
                                             }, recordId, modRatingTextData);
                                     } else {
                                         Log.print(Log.l.info, "not supported");
                                         ret = WinJS.Promise.as();
                                     }
                               }
                            }
                            that.indexold = index;
                            Log.ret(Log.l.trace);
                        });
                        Log.ret(Log.l.trace);
                        return ret;
                    },
                    onItemInvoked: function (eventInfo) {
                        Log.call(Log.l.trace, "Questiongroup.Controller.");
                        if (eventInfo && eventInfo.target) {
                            var comboInputFocus = eventInfo.target.querySelector(".win-dropdown:focus");
                            if (comboInputFocus) {
                                eventInfo.preventDefault();
                            } else {
                                // set focus into textarea if current mouse cursor is inside of element position
                                var setFocusOnElement = function (element) {
                                    WinJS.Promise.timeout(0).then(function () {
                                        // set focus async!
                                        element.focus();
                                    });
                                };
                                var textInputs = eventInfo.target.querySelectorAll(".win-textbox");
                                if (textInputs && textInputs.length > 0) {
                                    for (var i = 0; i < textInputs.length; i++) {
                                        var textInput = textInputs[i];
                                        var position = WinJS.Utilities.getPosition(textInput);
                                        if (position) {
                                            var left = position.left;
                                            var top = position.top;
                                            var width = position.width;
                                            var height = position.height;
                                            if (that.cursorPos.x >= left && that.cursorPos.x <= left + width &&
                                                that.cursorPos.y >= top && that.cursorPos.y <= top + height) {
                                                setFocusOnElement(textInput);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        Log.ret(Log.l.trace);
                    },
                    onLoadingStateChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "GenDataModHisto.Controller.");
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
                                    layout = Application.GenDataModHistoLayout.GenDataModHistoLayout;
                                    listView.winControl.layout = { type: layout };
                                }
                            } else if (listView.winControl.loadingState === "itemsLoaded") {
                               
                                
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
                    },
                    onHeaderVisibilityChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                        if (eventInfo && eventInfo.detail && listView) {
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
                        Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                        if (listView) {
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
                            var visible = eventInfo.detail.visible;

                            if (visible && that.modHistoData && that.nextUrl) {
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

                this.disableHandlers = {
                    clickBack: function () {
                        if (WinJS.Navigation.canGoBack === true) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }

                // register ListView event handler
                if (listView) {
                this.addRemovableEventListener(listView, "keydown", function (e) {
                    if (!e.ctrlKey && !e.altKey) {
                        switch (e.keyCode) {
                        case WinJS.Utilities.Key.end:
                        case WinJS.Utilities.Key.home:
                        case WinJS.Utilities.Key.leftArrow:
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.space:
                            e.stopImmediatePropagation();
                            break;
                        }
                    }
                }.bind(this), true);
                    this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                    this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                    this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                }

                Log.print(Log.l.trace, "calling select GenDataModHisto.personAdresseView...");

                var getPersonId = function () {
                    return GenDataModHisto._personId;
                }
                that.getPersonId = getPersonId;

                var setPersonId = function (value) {
                    Log.print(Log.l.trace, "personId=" + value);
                    GenDataModHisto._personId = value;
                }
                that.setPersonId = setPersonId;
            
                var loadData = function () {
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                    AppData.setErrorMsg(that.binding);
                    var master = Application.navigator.masterControl;
                        master.controller.setPersonId();
                    var personId = getPersonId();
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                    var ret = new WinJS.Promise.as().then(function () {
                        if (personId) {
                            //load of format relation record data
                            Log.print(Log.l.trace, "calling select contactView...");
                            return GenDataModHisto.benutzerView.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "contactView: success!");
                                if (json && json.d && json.d.results) {
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    that.binding.count = results.length;
                                    that.modHistoData = new WinJS.Binding.List(results);
                                    
                                    if (listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.modHistoData.dataSource;
                                    }
                                    //that.selectRecordId(json.d.results[0].MitarbeiterVIEWID);
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        } else {
                            Log.print(Log.l.trace, "No PersonID selected!");
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
                    that.loading = true;
                    return that.loadData();
                }).then(function () {
                    AppBar.notifyModified = true;
                    Log.print(Log.l.trace, "Record selected");
                });
                Log.ret(Log.l.trace);
        }, {
                cursorPos: { x: 0, y: 0 },
                indexold: 0
        })
    });
})();




