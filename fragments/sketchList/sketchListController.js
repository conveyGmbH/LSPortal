// controller for page: sketchList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/sketchList/sketchListService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";

    var namespaceName = "SketchList";

    WinJS.Namespace.define("SketchList", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                contactId: options.contactId,
                isLocal: options.isLocal,
                noteId: null,
                DocGroup: null,
                DocFormat: null
            }]);
            var that = this;
            var layout = null;

            this.nextUrl = null;
            this.records = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#sketchList.listview");

            var doScrollIntoViewAnimation = false;
            var initialScrollPosition = 0;
            var wheelValueFactor = 100;
            var waitingForMouseScroll = false;
            var wheelScrollAdd = 0;
            var checkForWheelEndPromise = null;

            var onTouch = function (eventId, x, y) {
                if (listView && listView.winControl) {
                    listView.winControl.scrollPosition = initialScrollPosition + x / 4;
                }
            };
            var touchPhysics = new TouchPhysics.TouchPhysics(onTouch);
            var checkForWheelEnd = function (eventInfo) {
                if (checkForWheelEndPromise) {
                    checkForWheelEndPromise.cancel();
                }
                checkForWheelEndPromise = WinJS.Promise.timeout(TouchPhysics.wheelEndTimerMs).then(function () {
                    waitingForMouseScroll = false;
                    checkForWheelEndPromise = null;
                    touchPhysics.processUp(MANIPULATION_PROCESSOR_MANIPULATIONS.MANIPULATION_TRANSLATE_X, wheelScrollAdd * wheelValueFactor, 0);
                    wheelScrollAdd = 0;
                });
            }
            this.checkForWheelEnd = checkForWheelEnd;

            var scaleItemsAfterResize = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (listView && fragmentElement && 
                    fragmentElement.winControl &&
                    fragmentElement.winControl.prevWidth &&
                    fragmentElement.winControl.prevHeight) {
                    var i;
                    // scale SVG images
                    var svgList = listView.querySelectorAll(".list-svg");
                    if (svgList) {
                        for (i = 0; i < svgList.length; i++) {
                            var svg = svgList[i].firstElementChild;
                            if(svg) {
                                WinJS.Utilities.addClass(svg, "list-svg-item");
                                svg.viewBox.baseVal.height = svg.height && svg.height.baseVal && svg.height.baseVal.value;
                                svg.viewBox.baseVal.width = svg.width && svg.width.baseVal && svg.width.baseVal.value;
                                var surface = svg.querySelector("#surface");
                                if (surface) {
                                    surface.setAttribute("fill", "#ffffff");
                                }
                            }
                        }
                    }
                    // scale photo images
                    var imgList = listView.querySelectorAll(".list-img");
                    if (imgList) {
                        for (i = 0; i < imgList.length; i++) {
                            var img = imgList[i].querySelector(".list-img-item");
                            if (img && img.src && img.naturalWidth && img.naturalHeight && img.style) {
                                var imgScale = 1;
                                var imgWidth = 0;
                                var imgHeight = 0;
                                var marginLeft = 0;
                                var marginTop = 0;
                                if (imgList[i].clientWidth < img.naturalWidth) {
                                    imgScale = imgList[i].clientWidth / img.naturalWidth;
                                    imgWidth = imgList[i].clientWidth;
                                } else {
                                    imgScale = 1;
                                    imgWidth = img.naturalWidth;
                                }
                                imgHeight = img.naturalHeight * imgScale;
                                if (imgList[i].clientHeight < imgHeight) {
                                    imgScale *= imgList[i].clientHeight / imgHeight;
                                    imgHeight = imgList[i].clientHeight;
                                }
                                imgWidth = img.naturalWidth * imgScale;

                                if (imgWidth < imgList[i].clientWidth) {
                                    marginLeft = (imgList[i].clientWidth - imgWidth) / 2;
                                } else {
                                    marginLeft = 0;
                                }
                                if (imgHeight < imgList[i].clientHeight) {
                                    marginTop = (imgList[i].clientHeight - imgHeight) / 2;
                                } else {
                                    marginTop = 0;
                                }
                                img.style.marginLeft = marginLeft + "px";
                                img.style.marginTop = marginTop + "px";
                                img.style.width = imgWidth + "px";
                                img.style.height = imgHeight + "px";
                            }
                        }
                    }
                    WinJS.Promise.timeout(50).then(function () {
                        if (AppBar.scope) {
                            var pageElement = AppBar.scope.pageElement;
                            if (pageElement) {
                                var pageControl = pageElement.winControl;
                                if (pageControl && pageControl.updateLayout) {
                                    pageControl.prevWidth = 0;
                                    pageControl.prevHeight = 0;
                                    pageControl.updateLayout.call(pageControl, pageElement);
                                }
                            }
                        }
                    });
                } else if (that.binding.count > 1) {
                    WinJS.Promise.timeout(50).then(function () {
                        scaleItemsAfterResize();
                    });
                }
                Log.ret(Log.l.trace);
            }


            var resultConverter = function (item, index) {
                if (item) {
                    var doc = item;
                    item.showSvg = AppData.isSvg(doc.DocGroup, doc.DocFormat);
                    item.showImg = AppData.isImg(doc.DocGroup, doc.DocFormat);
                    item.showAudio = AppData.isAudio(doc.DocGroup, doc.DocFormat);
                    item.showVideo = AppData.isVideo(doc.DocGroup, doc.DocFormat);
                    item.showIcon = false;
                    item.nameIcon = "";
                    if (item.showImg) {
                        var docContent = doc.OvwContentDOCCNT3;
                        if (docContent) {
                            var sub = docContent.search("\r\n\r\n");
                            if (sub >= 0) {
                                var data = docContent.substr(sub + 4);
                                if (data && data !== "null") {
                                    item.srcImg = "data:image/jpeg;base64," + data;
                                } else {
                                    item.srcImg = "";
                                }
                            } else {
                                item.srcImg = "";
                            }
                        } else {
                            item.srcImg = "";
                        }
                        item.srcSvg = "";
                    } else if (item.showSvg) {
                        item.srcImg = "";
                        item.srcSvg = doc.OvwContentDOCCNT3;
                    } else if (item.showAudio) {
                        item.nameIcon = "music";
                        item.showIcon = true;
                    } else if (item.showVideo) {
                        item.nameIcon = "movie";
                        item.showIcon = true;
                    }
                    if (item.ErfasstAm) {
                        // convert ErfasstAm 
                        var date = getDateObject(item.ErfasstAm);
                        var curMoment = moment(date);
                        if (curMoment) {
                            curMoment.locale(Application.language);
                            item.date = curMoment.format("ll HH:mm");
                        }
                    } else {
                        item.date = "";
                    }
                }
            }
            this.resultConverter = resultConverter;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    //if current sketch is saved successfully, change selection
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data) {
                                        that.binding.noteId = item.data.KontaktNotizVIEWID;
                                        that.binding.DocGroup = item.data.DocGroup;
                                        that.binding.DocFormat = item.data.DocFormat;
                                        if (AppBar.scope &&
                                            AppBar.scope.pageElement &&
                                            AppBar.scope.pageElement.winControl &&
                                            typeof AppBar.scope.pageElement.winControl.canUnload === "function") {
                                                AppBar.scope.pageElement.winControl.canUnload(function(response) {
                                                // called asynchronously if ok
                                                //load sketch with new recordId
                                                if (AppBar.scope && typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData(that.binding.noteId, that.binding.DocGroup, that.binding.DocFormat);
                                                }
                                            }, function(errorResponse) {
                                                // error handled in saveData!
                                            });
                                        } else {
                                            //load sketch with new recordId
                                            if (AppBar.scope && typeof AppBar.scope.loadData === "function") {
                                                AppBar.scope.loadData(that.binding.noteId, that.binding.DocGroup, that.binding.DocFormat);
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = new WinJS.UI.GridLayout();
                                layout.orientation = "horizontal";
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            Colors.loadSVGImageElements(listView, "list-icon-item", 80, Colors.textColor, "name");
                            scaleItemsAfterResize();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                wheelHandler: function(eventInfo) {
                    Log.call(Log.l.u1, namespaceName + ".Controller.");
                    if (eventInfo && listView && listView.winControl) {
                        var wheelWithinListView = eventInfo.target && (listView.contains(eventInfo.target) || listView === eventInfo.target);
                        if (wheelWithinListView) {
                            eventInfo.stopPropagation();
                            eventInfo.preventDefault();

                            var wheelValue;
                            if (!waitingForMouseScroll) {
                                waitingForMouseScroll = true;
                                initialScrollPosition = listView.winControl.scrollPosition;
                                if (typeof eventInfo.deltaY === 'number') {
                                    wheelValue = Math.abs(eventInfo.deltaX || eventInfo.deltaY || 0);
                                } else {
                                    wheelValue = Math.abs(eventInfo.wheelDelta || 0);
                                }
                                if (wheelValue) {
                                    wheelValueFactor = 10000 / wheelValue;
                                }
                                touchPhysics.processDown(MANIPULATION_PROCESSOR_MANIPULATIONS.MANIPULATION_TRANSLATE_X, 0, 0);
                                WinJS.Promise.timeout(TouchPhysics.wheelStartTimerMs).then(function () {
                                    that.eventHandlers.wheelHandler(eventInfo);
                                });
                                return;
                            }
                            var wheelingForward;

                            if (typeof eventInfo.deltaY === 'number') {
                                wheelingForward = (eventInfo.deltaX || eventInfo.deltaY) > 0;
                                wheelValue = Math.abs(eventInfo.deltaX || eventInfo.deltaY || 0);
                            } else {
                                wheelingForward = eventInfo.wheelDelta < 0;
                                wheelValue = Math.abs(eventInfo.wheelDelta || 0);
                            }
                            wheelScrollAdd += wheelingForward ? wheelValue : -wheelValue;

                            touchPhysics.processMove(MANIPULATION_PROCESSOR_MANIPULATIONS.MANIPULATION_TRANSLATE_X, wheelScrollAdd * wheelValueFactor, 0);
                            that.checkForWheelEnd(eventInfo);
                        }
                    }
                    Log.ret(Log.l.u1);
                }
            }
            this.eventHandlers = eventHandlers;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "wheel", this.eventHandlers.wheelHandler.bind(this));
                this.addRemovableEventListener(listView, "mousewheel", this.eventHandlers.wheelHandler.bind(this));
            }

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    if (typeof complete === "function") {
                        complete({});
                    }
                });
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;


            var loadData = function (contactId, noteId) {
                var i, selIdx = -1, ret, reloadDocView = false, row;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "contactId=" + contactId + " noteId=" + noteId);
                if (contactId) {
                    that.binding.contactId = contactId;
                }
                AppData.setErrorMsg(that.binding);
                // find index of noteId
                if (noteId && that.records) {
                    for (i = 0; i < that.records.length; i++) {
                        row = that.records.getAt(i);
                        if (row && row.KontaktNotizVIEWID === noteId) {
                            selIdx = i;
                            break;
                        }
                    }
                }
                if (selIdx >= 0) {
                    ret = SketchList.sketchlistView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, namespaceName + ".sketchlistView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.resultConverter(json.d, selIdx);
                            that.records.setAt(selIdx, json.d);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, noteId, that.binding.isLocal);
                } else {
                    if (that.records) {
                        that.records.length = 0;
                    }
                    ret = SketchList.sketchlistView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, namespaceName + ".sketchlistView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.nextUrl = SketchList.sketchlistView.getNextUrl(json, that.binding.isLocal);
                            var results = json.d.results;
                            if (results && results.length > 0) {
                                if (that.records) {
                                    // reload the bindable list
                                    results.forEach(function(item, index) {
                                        that.resultConverter(item, index);
                                        that.records.push(item);
                                    });
                                } else {
                                    results.forEach(function(item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    // Now, we call WinJS.Binding.List to get the bindable list
                                    that.records = new WinJS.Binding.List(results);
                                }
                                // find selection index
                                //as default, show first sketchnote in sketch page
                                selIdx = 0;
                                if (noteId) {
                                    for (i = 0; i < results.length; i++) {
                                        if (results[i].KontaktNotizVIEWID === noteId) {
                                            selIdx = i;
                                            break;
                                        }
                                    }
                                }
                                Log.print(Log.l.trace, namespaceName + ".sketchlistView: selIdx=" + selIdx);
                            }
                        } else {
                            that.binding.noteId = null;
                            that.binding.DocGroup = null;
                            that.binding.DocFormat = null;
                        }
                        reloadDocView = true;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        KontaktID: that.binding.contactId
                    }, that.binding.isLocal);
                }
                ret = ret.then(function() {
                    if (reloadDocView) {
                        // show/hide this fragment, so use timeout!
                        that.binding.count = that.records ? that.records.length : 0;
                        if (AppBar.scope && typeof AppBar.scope.setNotesCount === "function") {
                            AppBar.scope.setNotesCount(that.binding.count);
                        }
                        return WinJS.Promise.timeout(50);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (reloadDocView) {
                        if (listView && listView.winControl) {
                            // add ListView dataSource
                            listView.winControl.itemDataSource = that.records.dataSource;
                            if (that.records && that.records.length > 0 && listView.winControl.selection) {
                                return listView.winControl.selection.set(selIdx).then(function() {
                                    //load doc with new recordId
                                    row = that.records.getAt(selIdx);
                                    if (row) {
                                        that.binding.docId = row.KontaktNotizVIEWID;
                                        that.binding.DocGroup = row.DocGroup;
                                        that.binding.DocFormat = row.DocFormat;
                                    }
                                });
                            } else {
                                return WinJS.Promise.as();
                            }
                        } else {
                            return WinJS.Promise.as();
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (reloadDocView &&
                        AppBar.scope && typeof AppBar.scope.loadDoc === "function" && that.binding.noteId) {
                        AppBar.scope.loadDoc(that.binding.noteId, that.binding.DocGroup, that.binding.DocFormat);
                    }
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    that.forceLayout();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var forceLayout = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                WinJS.Promise.timeout(0).then(function() {
                    if (listView && listView.winControl) {
                        listView.winControl.forceLayout();
                    }
                });
                Log.ret(Log.l.trace);
            }
            that.forceLayout = forceLayout;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(that.binding.contactId);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



