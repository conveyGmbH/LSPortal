// controller for page: mediaList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/mediaList/mediaListService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MediaList", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "MediaList.Controller.");
            if (options) {
                MediaList._eventTextUsageId = options.eventTextUsageId;
                MediaList._eventId = options.eventId;
            }
            Fragments.Controller.apply(this, [fragmentElement, {
                docId: null,
                DocGroup: null,
                DocFormat: null
            }]);
            var that = this;

            this.nextUrl = null;
            this.records = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#mediaList.listview");

            var scaleItemsAfterResize = function() {
                Log.call(Log.l.trace, "MediaList.Controller.");
                if (listView && fragmentElement && 
                    fragmentElement.winControl &&
                    fragmentElement.winControl.prevWidth &&
                    fragmentElement.winControl.prevHeight) {
                    var i;
                    // scale SVG images
                    var svglist = listView.querySelectorAll(".list-svg");
                    if (svglist) {
                        for (i = 0; i < svglist.length; i++) {
                            var svg = svglist[i].firstElementChild;
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
                    var imglist = listView.querySelectorAll(".list-img");
                    if (imglist) {
                        for (i = 0; i < imglist.length; i++) {
                            var img = imglist[i].querySelector(".list-img-item");
                            if (img && img.src && img.naturalWidth && img.naturalHeight && img.style) {
                                var offset = (imglist[i].clientHeight -
                                    (imglist[i].clientWidth * img.naturalHeight) / img.naturalWidth) / 2;
                                img.style.marginTop = offset.toString() + "px";
                            }
                        }
                    }
                    /*WinJS.Promise.timeout(50).then(function () {
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
                    });*/
                } else if (that.binding.count > 1) {
                    WinJS.Promise.timeout(50).then(function () {
                        scaleItemsAfterResize();
                    });
                }
                Log.ret(Log.l.trace);
            }


            var resultConverter = function (item, index) {
                Log.call(Log.l.trace, "MediaList.Controller.");
                if (item) {
                    var doc = item;
                    item.showSvg = AppData.isSvg(doc.DocGroup, doc.DocFormat);
                    item.showImg = AppData.isImg(doc.DocGroup, doc.DocFormat);
                    item.showAudio = AppData.isAudio(doc.DocGroup, doc.DocFormat);
                    item.showVideo = AppData.isVideo(doc.DocGroup, doc.DocFormat);
                    item.showIcon = false;
                    item.nameIcon = "";
                    item.srcImg = "";
                    item.srcSvg = "";
                    if (item.showImg) {
                        var docContent = doc.OvwContentDOCCNT3;
                        if (docContent) {
                            var sub = docContent.search("\r\n\r\n");
                            if (sub >= 0) {
                                var data = docContent.substr(sub + 4);
                                if (data && data !== "null") {
                                    item.srcImg = "data:image/jpeg;base64," + data;
                                }
                            }
                        }
                    } else if (item.showSvg) {
                        item.srcSvg = doc.OvwContentDOCCNT3;
                    } else if (item.showAudio) {
                        item.nameIcon = "music";
                        item.showIcon = true;
                    } else if (item.showVideo) {
                        item.nameIcon = "movie";
                        item.showIcon = true;
                    } else {
                        item.nameIcon = "document_empty";
                        item.showIcon = true;
                    }
                    if (item.ModifiedTS) {
                        // convert ModifiedTS 
                        item.currentDate = getDateObject(item.ModifiedTS);
                        var curMoment = moment(item.currentDate);
                        if (curMoment) {
                            curMoment.locale(Application.language);
                            item.currentDateString = curMoment.format("ll HH:mm");
                        }
                    } else {
                        item.currentDateString = "";
                    }
                    item.currentTitle = item.Titel || item.LabelTitle;
                }
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MediaList.Controller.");
                    //if current doc is saved successfully, change selection
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data) {
                                        that.binding.docId = item.data.MandantDokumentVIEWID;
                                        that.binding.DocGroup = item.data.DocGroup;
                                        that.binding.DocFormat = item.data.DocFormat;
                                        if (AppBar.scope &&
                                            AppBar.scope.pageElement &&
                                            AppBar.scope.pageElement.winControl &&
                                            typeof AppBar.scope.pageElement.winControl.canUnload === "function") {
                                                AppBar.scope.pageElement.winControl.canUnload(function(response) {
                                                // called asynchronously if ok
                                                //load doc with new recordId
                                                if (AppBar.scope && typeof AppBar.scope.loadDoc === "function") {
                                                    AppBar.scope.loadDoc(that.binding.docId, that.binding.DocGroup, that.binding.DocFormat);
                                                }
                                            }, function(errorResponse) {
                                                // error handled in saveData!
                                            });
                                        } else {
                                            //load doc with new recordId
                                            if (AppBar.scope && typeof AppBar.scope.loadDoc === "function") {
                                                AppBar.scope.loadDoc(that.binding.docId, that.binding.DocGroup, that.binding.DocFormat);
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
                    Log.call(Log.l.trace, "MediaList.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "complete") {
                            Colors.loadSVGImageElements(listView, "list-icon-item", 80, Colors.navigationColor, "name");
                            scaleItemsAfterResize();
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            }
            this.eventHandlers = eventHandlers;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
            }

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "MediaList.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    if (typeof complete === "function") {
                        complete({});
                    }
                });
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;


            var loadData = function (docId, curOptions) {
                var i, selIdx = -1, ret, reloadDocView = false, row;
               
                Log.call(Log.l.trace, "MediaList.", "docId=" + docId);
                if (curOptions) {
                    MediaList._eventTextUsageId = curOptions.eventTextUsageId;
                    MediaList._eventId = curOptions.eventId;
                }
                if (docId) {
                    that.binding.docId = docId;
                }
                AppData.setErrorMsg(that.binding);
                // find index of docId
                if (docId && that.records) {
                    for (i = 0; i < that.records.length; i++) {
                        row = that.records.getAt(i);
                        if (row && row.MandantDokumentVIEWID === docId) {
                            selIdx = i;
                            break;
                        }
                    }
                }
                if (selIdx >= 0) {
                    ret = MediaList.eventDocView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "MediaList.eventDocView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.resultConverter(json.d, selIdx);
                            that.records.setAt(selIdx, json.d);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, docId);
                } else {
                    if (that.records) {
                        that.records.length = 0;
                    }
                    ret = MediaList.eventDocView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "MediaList.eventDocView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.nextUrl = MediaList.eventDocView.getNextUrl(json, that.binding.isLocal);
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
                                //as default, show first doc in doc page
                                selIdx = 0;
                                if (docId) {
                                    for (i = 0; i < results.length; i++) {
                                        if (results[i].MandantDokumentVIEWID === docId) {
                                            selIdx = i;
                                            break;
                                        }
                                    }
                                }
                                Log.print(Log.l.trace, "MediaList.eventDocView: selIdx=" + selIdx);
                            }
                        } else {
                            that.binding.docId = null;
                            that.binding.DocGroup = null;
                            that.binding.DocFormat = null;
                        }
                        reloadDocView = true;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }
                ret = ret.then(function() {
                    if (reloadDocView) {
                        // show/hide this fragment, so use timeout!
                        that.binding.count = that.records ? that.records.length : 0;
                        if (AppBar.scope && typeof AppBar.scope.setDocCount === "function") {
                            AppBar.scope.setDocCount(that.binding.count);
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
                                        that.binding.docId = row.MandantDokumentVIEWID;
                                        that.binding.DocGroup = row.DocGroup;
                                        that.binding.DocFormat = row.DocFormat;
                                    }
                                });
                            }
                        } else {
                            return WinJS.Promise.as();
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (reloadDocView &&
                        AppBar.scope && typeof AppBar.scope.loadDoc === "function" && that.binding.docId) {
                        AppBar.scope.loadDoc(that.binding.docId, that.binding.DocGroup, that.binding.DocFormat);
                    }
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var forceLayout = function() {
                Log.call(Log.l.trace, "MediaList.");
                if (listView && listView.winControl) {
                    listView.winControl.forceLayout();
                }
                Log.ret(Log.l.trace);
            }
            that.forceLayout = forceLayout;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



