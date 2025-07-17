// controller for page: startContacts
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/visitorFlowOverview/visitorFlowOverviewService.js" />

(function () {
    "use strict";

    var namespaceName = "VisitorFlowOverview";

    WinJS.Namespace.define("VisitorFlowOverview", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                visitordata: {CR_V_BereichVIEWID: null},
                ZutritteAlle: 0
            }]);

            this.refreshWaitTimeMs = 5000;

            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;
            
            var entextcategory = fragmentElement.querySelector("#entextSelect");
            var dot = fragmentElement.querySelector(".dot");

            var getRecordId = function () {
                return AppData.getRecordId("Mitarbeiter");
            };
            this.getRecordId = getRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
                if (Math.sign(item.Inside) === 1) {
                    
                } else {
                    item.Inside = 0;
                }
                var zutritteAlle = item.ZutritteBereichHeute - item.AustritteBereichHeute;
                if (Math.sign(zutritteAlle) === 1 || zutritteAlle > 0 || zutritteAlle === 0) {
                    that.binding.ZutritteAlle = zutritteAlle;
                }
                else {
                    that.binding.ZutritteAlle = 0;
                }
                if (that.binding.ZutritteAlle >= item.Limit) {
                    dot.style.backgroundColor = Colors.offColor;
                } else if (item.WarnLimit !== null && item.WarnLimit > 0 && that.binding.ZutritteAlle >= item.WarnLimit && that.binding.ZutritteAlle < item.Limit) {
                    dot.style.backgroundColor = Colors.pauseColor;
                } else {
                    dot.style.backgroundColor = Colors.onColor;
                }
            }
            this.resultConverter = resultConverter;
            
            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(pageBinding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!that.binding.visitordata.CR_V_BereichVIEWID) {
                        Log.print(Log.l.trace, "CR_V_BereichVIEWID=" + that.binding.visitordata.CR_V_BereichVIEWID);
                        return VisitorFlowOverview.visitorView.select(function (json) {
                            Log.print(Log.l.trace, "select VisitorFlowOverview: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var results = json.d.results;
                                if (entextcategory && entextcategory.winControl) {
                                    entextcategory.winControl.data = new WinJS.Binding.List(results);
                                    entextcategory.selectedIndex = 0;
                                    if (!that.binding.visitordata.CR_V_BereichVIEWID) {
                                        that.binding.visitordata = results[0];
                                    }
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "select VisitorFlowOverview: error!");
                            AppData.setErrorMsg(pageBinding, errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    Log.print(Log.l.trace, "CR_V_BereichVIEWID=" + that.binding.visitordata.CR_V_BereichVIEWID);
                    return VisitorFlowOverview.visitorView.select(function (json) {
                        Log.print(Log.l.trace, "VisitorFlowOverview: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.binding.visitordata = results[0];
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "select VisitorFlowOverview: error!");
                        AppData.setErrorMsg(pageBinding, errorResponse);
                    }, { CR_V_BereichVIEWID: that.binding.visitordata.CR_V_BereichVIEWID });
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
        })
    });
})();
