﻿// controller for page: startContacts
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/visitorFlowLevelIndicator/visitorFlowLevelIndicatorService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VisitorFlowLevelIndicator", {
        Controller: WinJS.Class.derive(Fragments.RecordsetController, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "VisitorFlowLevelIndicator.Controller.");
            var listView = fragmentElement.querySelector("#visitorFlowLevelIndicatorList.listview");



            Fragments.RecordsetController.apply(this, [fragmentElement, {
                bereichdata: {},
                timeselectupdate: 60,
                vtitle : null
            }, [], VisitorFlowLevelIndicator.visitorFlowLevelView, null, listView]);

            var that = this;

            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var timecategory = fragmentElement.querySelector("#timeCategory");
            
            var creatingTimeCategory = function () {
                Log.call(Log.l.trace, "VisitorFlowLevelIndicator.Controller.");
                var timedatacategory = [
                    {
                        value: 60,
                        title: getResourceText("visitorFlowLevelIndicator.hour")
                    },
                    {
                        value: 30,
                        title: getResourceText("visitorFlowLevelIndicator.halfhour")
                    }
                ];
                if (timecategory && timecategory.winControl) {
                    timecategory.winControl.data = new WinJS.Binding.List(timedatacategory);
                    timecategory.selectedIndex = 0;
                }
            }
            this.creatingTimeCategory = creatingTimeCategory;

            this.eventHandlers = {
                changeTime: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowLevelIndicator.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var value = event.currentTarget.value;
                        that.binding.timeselectupdate = value;
                        VisitorFlowLevelIndicator.timeselectupdate = value;
                        if (that.records) {
                            that.records.length = 0;
                        }
                        WinJS.Promise.timeout(50).then(function() {
                            that.loadData();
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "VisitorFlowLevelIndicator.Controller.");
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
                                layout = Application.VisitorFlowLevelIndicatorLayout.VisitorFlowLevelIndicatorLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images

                        }
                    }
                    Log.ret(Log.l.trace);
                }
            };

            var resultConverterhour = function (item, index) {
                item.index = index;
                item.EintritteGesamt = item.EintritteBereich - item.AustritteBereich;
                item.Zeitraum = item.Zeitraum + ":00";
                item.EintritteAustritteBereich = item.EintritteBereich + " / " + item.AustritteBereich;
            }
            this.resultConverterhour = resultConverterhour;

            var resultConverterhalfhour = function (item, index) {
                item.index = index;
                item.EintritteGesamt = item.EintritteBereich - item.AustritteBereich;
                item.EintritteAustritteBereich = item.EintritteBereich + " / " + item.AustritteBereich;
            }
            this.resultConverterhalfhour = resultConverterhalfhour;
            var resultConverter = function(item, index) {
                var timeselectupdate = (typeof that.binding.timeselectupdate === "number") ? that.binding.timeselectupdate : parseInt(that.binding.timeselectupdate);
                if (timeselectupdate === 60) {
                    return that.resultConverterhour(item, index);
                } else {
                    return that.resultConverterhalfhour(item, index);
                }
            }
            this.resultConverter = resultConverter;

            /*var loadData = function () {
                Log.call(Log.l.trace, "VisitorFlowLevelIndicator.");
                var visitorFlowOverviewFragmentControl =
                    Application.navigator.getFragmentControlFromLocation(
                        Application.getFragmentPath("visitorFlowOverview"));
                if (visitorFlowOverviewFragmentControl &&
                    visitorFlowOverviewFragmentControl.controller) {
                    //console.log(visitorFlowOverviewFragmentControl.controller.binding.visitordata.TITLE);
                }
                that.binding.timeselectupdate = parseInt(timecategory.value);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                        Log.print(Log.l.trace, "calling timebereichView...");
                        if (that.binding.timeselectupdate === 60) {
                        return VisitorFlowLevelIndicator.bereichhourView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "bereichhourView: success!");
                                // mitarbeiterView returns object already parsed from json file in response
                                if (json && json.d) {
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverterhour(item, index);
                                    });
                                    that.timeItem = new WinJS.Binding.List(results); 
                                    //that.timeItem = new WinJS.Binding.List(datahour);
                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.timeItem.dataSource;
                                    }
                                } else {
                                    that.timeItem = null;
                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = null;
                                    }
                                }
                                return WinJS.Promise.as();
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                return WinJS.Promise.as();
                            }, { TITLE: visitorFlowOverviewFragmentControl.controller.binding.visitordata.TITLE  });
                        }
                        else if (that.binding.timeselectupdate === 30) {
                        return VisitorFlowLevelIndicator.bereichhalfhour.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                //that.removeDisposablePromise(cr_V_BereichSelectPromise);
                                Log.print(Log.l.trace, "bereichhalfhour: success!");
                                // mitarbeiterView returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.binding.bereichdata = json.d;
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverterhalfhour(item, index);
                                    });
                                    that.timeItem = new WinJS.Binding.List(results); 
                                    //that.timeItem = new WinJS.Binding.List(datahalfhour);
                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.timeItem.dataSource;
                                    }
                                } else {
                                    that.timeItem = null;
                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = null;
                                    }
                                }
                                return WinJS.Promise.as();
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                return WinJS.Promise.as();
                            }, { TITLE: visitorFlowOverviewFragmentControl.controller.binding.visitordata.TITLE });
                        } else {
                        return VisitorFlowLevelIndicator.bereichhourView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "bereichhourView: success!");
                                // mitarbeiterView returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.binding.bereichdata = json.d;
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverterhour(item, index);
                                    });
                                    that.timeItem = new WinJS.Binding.List(results);
                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.timeItem.dataSource;
                                    }
                                } else {
                                    that.timeItem = null;
                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = null;
                                    }
                                }
                                return WinJS.Promise.as();
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                return WinJS.Promise.as();
                            }, { TITLE: visitorFlowOverviewFragmentControl.controller.binding.visitordata.TITLE });
                        }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;*/

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.creatingTimeCategory();
            }).then(function () {
                Log.print(Log.l.trace, "creatingTimeCategory returned");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            timeItem: null
        })
    });
})();
