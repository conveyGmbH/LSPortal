// controller for page: reportingList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/reportingList/reportingListService.js" />
/// <reference path="~/www/pages/reporting/reportingController.js" />



(function () {
    "use strict";

    WinJS.Namespace.define("ReportingList", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "ReportingList.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, options]);
            var that = this;

            // now do anything...
            var listView = fragmentElement.querySelector("#reportingList.listview");

            var eventHandlers = {

            }
            this.eventHandlers = eventHandlers;

            var loadData = function () {
                Log.call(Log.l.trace, "ReportingList.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return ReportingList.analysisListView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "analysisListView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d) {
                            var results = json.d.results;
                            that.reportingItem = new WinJS.Binding.List(results);

                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.reportingItem.dataSource;
                            }
                        } else {
                            that.reportingItem = null;
                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            reportingItem: null
        })
    });
})();