// service for page: startContacts
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VisitorFlowLevelIndicator", {
        _bereichhourView: {
            get: function () {
                return AppData.getFormatView("CR_V_Bereich", 20614);
            }
        },
        _bereichhalfhourView: {
            get: function () {
                return AppData.getFormatView("CR_V_Bereich", 20615);
            }
        },
        timeselectupdate: 60,
        getRestriction: function() {
            var ret = null;
            var visitorFlowOverviewFragmentControl =
                Application.navigator.getFragmentControlFromLocation(
                    Application.getFragmentPath("visitorFlowOverview"));
            if (visitorFlowOverviewFragmentControl &&
                visitorFlowOverviewFragmentControl.controller &&
                visitorFlowOverviewFragmentControl.controller.binding &&
                visitorFlowOverviewFragmentControl.controller.binding.visitordata) {
                ret = {
                    TITLE: visitorFlowOverviewFragmentControl.controller.binding.visitordata.TITLE
                };
            }    
            return ret;
        }
    });

    WinJS.Namespace.define("VisitorFlowLevelIndicator", {
        visitorFlowLevelView: {
            select: function (complete, error, restriction) {
                if (!restriction) {
                    restriction = VisitorFlowLevelIndicator.getRestriction();
                }
                Log.call(Log.l.trace, "visitorFlowLevelView.", "restriction=" + restriction);
                var curView;
                var timeselectupdate = (typeof VisitorFlowLevelIndicator.timeselectupdate === "number") ? VisitorFlowLevelIndicator.timeselectupdate : parseInt(VisitorFlowLevelIndicator.timeselectupdate);
                if (timeselectupdate === 30) {
                    curView = VisitorFlowLevelIndicator._bereichhalfhourView;
                } else {
                    curView = VisitorFlowLevelIndicator._bereichhourView;
                }

                var ret = curView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    var curView;
                    var timeselectupdate = (typeof VisitorFlowLevelIndicator.timeselectupdate === "number") ? VisitorFlowLevelIndicator.timeselectupdate : parseInt(VisitorFlowLevelIndicator.timeselectupdate);
                    if (timeselectupdate === 30) {
                        curView = VisitorFlowLevelIndicator._bereichhalfhourView;
                    } else {
                        curView = VisitorFlowLevelIndicator._bereichhourView;
                    }
                    return curView.relationName;
                }
            },
            pkName: {
                get: function() {
                    var curView;
                    var timeselectupdate = (typeof VisitorFlowLevelIndicator.timeselectupdate === "number") ? VisitorFlowLevelIndicator.timeselectupdate : parseInt(VisitorFlowLevelIndicator.timeselectupdate);
                    if (timeselectupdate === 30) {
                        curView = VisitorFlowLevelIndicator._bereichhalfhourView;
                    } else {
                        curView = VisitorFlowLevelIndicator._bereichhourView;
                    }
                    return curView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    var curView;
                    var timeselectupdate = (typeof VisitorFlowLevelIndicator.timeselectupdate === "number") ? VisitorFlowLevelIndicator.timeselectupdate : parseInt(VisitorFlowLevelIndicator.timeselectupdate);
                    if (timeselectupdate === 30) {
                        curView = VisitorFlowLevelIndicator._bereichhalfhourView;
                    } else {
                        curView = VisitorFlowLevelIndicator._bereichhourView;
                    }
                    if (curView.oDataPkName) {
                        ret = record[curView.oDataPkName];
                    }
                    if (!ret && curView.pkName) {
                        ret = record[curView.pkName];
                    }
                }
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();