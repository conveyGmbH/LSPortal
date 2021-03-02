// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/eventTextUsage/eventTextUsageService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventTextUsage", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "EventTextUsage.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
            }]);

            this.textUsage = new WinJS.Binding.List([]);
            var that = this;

            // now do anything...
            var listView = fragmentElement.querySelector("#eventTextUsageList.listview");

            var doScrollIntoViewAnimation = false;
            var waitingForMouseScroll = false;
            var wheelScrollAdd = 0;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventTextUsage.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    Log.print(Log.l.trace, "item.data.INITDokVerwendungID=" + (item.data && item.data.INITDokVerwendungID));
                                    if (item.data && item.data.INITDokVerwendungID &&
                                        AppBar.scope && 
                                        typeof AppBar.scope.loadData === "function" &&
                                        typeof AppBar.scope.getEventTextUsageId === "function" &&
                                        typeof AppBar.scope.setEventTextUsageId === "function" &&
                                        AppBar.scope.getEventTextUsageId() !== item.data.INITDokVerwendungID) {
                                        doScrollIntoViewAnimation = true;
                                        AppBar.scope.setEventTextUsageId(item.data.INITDokVerwendungID);
                                        AppBar.scope.loadData();
                                        WinJS.Promise.timeout(50).then(function() {
                                            Log.print(Log.l.trace, "now update layout...");
                                            var fragmentControl = fragmentElement.winControl;
                                            if (fragmentControl && fragmentControl.updateLayout) {
                                                fragmentControl.prevWidth = 0;
                                                fragmentControl.prevHeight = 0;
                                                return fragmentControl.updateLayout.call(fragmentControl, fragmentElement);
                                            } else {
                                                return WinJS.Promise.as();
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventTextUsage.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                        } else if (listView.winControl.loadingState === "complete") {
                            var surface = listView.querySelector(".win-surface");
                            if (surface) {
                                if (surface.clientWidth < listView.clientWidth) {
                                    WinJS.Promise.timeout(50).then(function() {
                                        var pageControl = fragmentElement.winControl;
                                        if (pageControl && pageControl.updateLayout) {
                                            pageControl.prevWidth = 0;
                                            pageControl.prevHeight = 0;
                                            return pageControl.updateLayout.call(pageControl, fragmentElement);
                                        } else {
                                            return WinJS.Promise.as();
                                        }
                                    });
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                wheelHandler: function(eventInfo) {
                    Log.call(Log.l.u1, "MediaList.Controller.");
                    
                    if (eventInfo && listView && listView.winControl) {
                        var wheelWithinListView = eventInfo.target && (listView.contains(eventInfo.target) || listView === eventInfo.target);
                        if (wheelWithinListView) {
                            eventInfo.stopPropagation();
                            eventInfo.preventDefault();

                            var wheelValue;
                            var wheelingForward;

                            if (typeof eventInfo.deltaY === 'number') {
                                wheelingForward = (eventInfo.deltaX || eventInfo.deltaY) > 0;
                                wheelValue = Math.abs(eventInfo.deltaX || eventInfo.deltaY || 0);
                            } else {
                                wheelingForward = eventInfo.wheelDelta < 0;
                                wheelValue = Math.abs(eventInfo.wheelDelta || 0);
                            }
                            wheelScrollAdd += wheelingForward ? wheelValue : -wheelValue;
                            if (waitingForMouseScroll) {
                                Log.ret(Log.l.u1, "extra ignored");
                                return;
                            }
                            waitingForMouseScroll = true;
                            listView.winControl.scrollPosition += wheelScrollAdd / 2;
                            wheelScrollAdd = 0;
                            WinJS.Promise.timeout(20).then(function() {
                                waitingForMouseScroll = false;
                            });
                        }
                    }
                    Log.ret(Log.l.u1);
                }
            }
            this.eventHandlers = eventHandlers;

            var scrollIntoView = function (curIndex) {
                Log.call(Log.l.u1, "EventTextUsage.Controller.");
                if (listView && listView.winControl) {
                    var listControl = listView.winControl;
                    var containers = listView.querySelectorAll(".win-container");
                    if (containers && containers.length === that.textUsage.length && containers[0]) {
                        var surface = listView.querySelector(".win-surface");
                        if (surface) {
                            var overflow = surface.clientWidth - listView.clientWidth;
                            if (overflow > 0) {
                                var containersWidth = 0;
                                for (var i = 0; i < curIndex; i++) {
                                    containersWidth += containers[i].clientWidth;
                                    if (i === curIndex - 1) {
                                        containersWidth -= containers[i].clientWidth / 4;
                                    }
                                }
                                var scrollPosition = Math.floor(containersWidth);
                                if (scrollPosition < 0) {
                                    scrollPosition = 0;
                                } else if (scrollPosition > overflow) {
                                    scrollPosition = overflow;
                                }
                                if (listControl.scrollPosition !== scrollPosition) {
                                    var prevScrollPosition = listControl.scrollPosition;
                                    listControl.scrollPosition = scrollPosition;
                                    if (doScrollIntoViewAnimation) {
                                        var animationDistanceX = (scrollPosition - prevScrollPosition) / 2;
                                        var animationOptions = { top: "0px", left: animationDistanceX.toString() + "px" };
                                        WinJS.UI.Animation.enterContent(surface, animationOptions).done(function() {
                                            doScrollIntoViewAnimation = false;
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                Log.ret(Log.l.u1);
            }
            that.scrollIntoView = scrollIntoView;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "wheel", this.eventHandlers.wheelHandler.bind(this));
                this.addRemovableEventListener(listView, "mousewheel", this.eventHandlers.wheelHandler.bind(this));
            }

            var loadData = function () {
                Log.call(Log.l.trace, "EventTextUsage.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (that.textUsage.length === 0) {
                        var results = EventTextUsage.eventTextUsageView.getResults();
                        if (results && results.length > 0) {
                            results.forEach(function (item, index) {
                                //that.resultConverter(item, index);
                                that.textUsage.push(item);
                            });
                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.textUsage.dataSource;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                            return WinJS.Promise.as();
                        } else {
                            return EventTextUsage.eventTextUsageView.select(function (json) {
                                Log.print(Log.l.trace, "appInfoSpecView: success!");
                                if (json && json.d && json.d.results && json.d.results.length > 0) {
                                    results = json.d.results;
                                    results.forEach(function (item, index) {
                                        //that.resultConverter(item, index);
                                        that.textUsage.push(item);
                                    });
                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.textUsage.dataSource;
                                    }
                                    Log.print(Log.l.trace, "Data loaded");
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (listView && listView.winControl) {
                        return listView.winControl.selection.set(0);
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            textUsage: null
        })
    });
})();



