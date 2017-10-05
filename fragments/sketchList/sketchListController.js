﻿// controller for page: sketchList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/sketchList/sketchListService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SketchList", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "SketchList.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                contactId: options.contactId
        }]);
            var that = this;
            var layout = null;

            this.sketches = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#sketchList.listview");


            var resultConverter = function (item, index) {
                Log.call(Log.l.trace, "SketchList.Controller.");
                if (item) {
                    var doc = item;
                    var isSvg = (doc.DocGroup === 3 && doc.DocFormat === 75) ? true : false;
                    var isImg = (doc.DocGroup === 1) ? true : false;
                    if (isImg) {
                        var docContent = doc.OvwContentDOCCNT3;
                        if (docContent) {
                            var sub = docContent.search("\r\n\r\n");
                            item.OvwContentDOCCNT3 = "data:image/jpeg;base64," + docContent.substr(sub + 4);
                        }
                        item.showImg = true;
                    }
                    if (isSvg) {
                        item.showSvg = true;
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SketchList.Controller.");
                    //if current sketch is saved successfully, change selection
                    AppBar.scope.saveData(function (response) {
                        // called asynchronously if ok
                        if (listView && listView.winControl) {
                            var listControl = listView.winControl;
                            if (listControl.selection) {
                                var selectionCount = listControl.selection.count();
                                if (selectionCount === 1) {
                                    // Only one item is selected, show the page
                                    listControl.selection.getItems().done(function(items) {
                                        var item = items[0];

                                        //load sketch with new recordId
                                        var curId = item.data.KontaktNotizVIEWID;
                                        AppBar.scope.setRecordId(curId);
                                        AppBar.scope.loadSketch();
                                    });
                                }
                            }
                        }
                    }, function (errorResponse) {
                        AppBar.scope.loadSketch();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SketchList.Controller.");
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
                            // scale SVG images
                            var svglist = listView.querySelectorAll(".list-svg");
                            if (svglist) {
                                var i;
                                for (i = 0; i < svglist.length; i++) {
                                    var svg = svglist[i].firstElementChild;
                                    WinJS.Utilities.addClass(svg, "list-svg-item");
                                    svg.viewBox.baseVal.height = svg.height.baseVal.value;
                                    svg.viewBox.baseVal.width = svg.width.baseVal.value;
                                }
                            }
                            AppBar.scope.loadSketch();
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            }
            this.eventHandlers = eventHandlers;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView,
                    "selectionchanged",
                    this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView,
                    "loadingstatechanged",
                    this.eventHandlers.onLoadingStateChanged.bind(this));
            }


            /*var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "SketchList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    if (sketches) {
                        for (var i = 0; i < that.sketches.length; i++) {
                            var sketch = that.sketches.getAt(i);
                            if (sketch &&
                                typeof sketch === "object" &&
                                sketch.KontaktNotizVIEWID === recordId) {
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
                var i;
                Log.call(Log.l.trace, "SketchList.Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.sketches.length; i++) {
                    var sketch = that.sketches.getAt(i);
                    if (sketch && typeof sketch === "object" &&
                        sketch.KontaktNotizVIEWID === recordId) {
                        item = sketch;
                        break;
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
            this.scopeFromRecordId = scopeFromRecordId;*/

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "SketchList.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    if (typeof complete === "function") {
                        complete({});
                    }
                });
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;


            var loadData = function (contactId) {
                var conId = 0;
                if (contactId) {
                    conId = contactId;
                }
                
                Log.call(Log.l.trace, "SketchList.");
                AppData.setErrorMsg(that.binding);

                var ret = new WinJS.Promise.as().then(function () {
                    return SketchList.sketchlistView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "SketchList.sketchlistView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.count = json.d.results.length;
                            //that.nextUrl = MandatoryList.mandatoryView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            // Now, we call WinJS.Binding.List to get the bindable list
                            that.sketches = new WinJS.Binding.List(results);
                            //as default, show first sketchnote in sketch page
                            if (that.sketches !== null) {
                                var curId = that.sketches._keyMap[0].data.KontaktNotizVIEWID;
                                AppBar.scope.setRecordId(curId);
                            }
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.sketches.dataSource;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        KontaktID: conId
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



