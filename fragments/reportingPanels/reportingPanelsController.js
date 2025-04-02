// controller for page: voucherAdministrationList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/reportingPanels/reportingPanelsService.js" />
/// <reference path="~/www/fragments/reportingPanels/reportingPanels.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />



(function () {
    "use strict";

    var namespaceName = "ReportingPanels";

    WinJS.Namespace.define("ReportingPanels", {
        Controller: WinJS.Class.derive(Fragments.RecordsetController, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            var listView = fragmentElement.querySelector("#reportingPanels.listview");
            Fragments.RecordsetController.apply(this, [fragmentElement, {
                loadingState: null
            }, [], ReportingPanels.exportPDFView, ReportingPanels.exportPDFView, listView]);
            var pageBinding = AppBar.scope && AppBar.scope.binding; 

            var that = this;
            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
            }

            //Date convertion
            var getDateObject = function (dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        moment().locale("de");
                        ret = moment(milliseconds).locale("de").format("DD.MM.YYYY HH:mm");//new Date(milliseconds).toLocaleTimeString().slice(0, -3);

                    //.toLocaleString('de-DE').substr(0, 10);
                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var resultConverter = function (item, index) {
                item.index = index;
                item.TooltipData = "";
                if (item.FinishedTS) {
                    item.FinishedTS = that.getDateObject(item.FinishedTS);
                }
                if (item.FilterCreateDate) {
                    item.TooltipData += getResourceText("reporting.entrydatelabel") + that.getDateObject(item.FilterCreateDate) + "\n";
                }
                if (item.FilterModDate) {
                    item.TooltipData += getResourceText("reporting.changedatelabel") + that.getDateObject(item.FilterModDate) + "\n";
                }
                if (item.FilterByLand) {
                    item.TooltipData += getResourceText("reporting.countrylabel") + item.FilterByLand + "\n";
                }
                if (item.FilterByMitarbeiter) {
                    item.TooltipData += getResourceText("reporting.employeelabel") + item.FilterByMitarbeiter;
                }
            }
            this.resultConverter = resultConverter;

            this.eventHandlers = {
                onLoadingStateChanged: function (eventInfo) {
                    var i;
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
                        // Double the size of the buffers on both sides
                        if (!maxLeadingPages) {
                            maxLeadingPages = listView.winControl.maxLeadingPages * 4;
                            listView.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = listView.winControl.maxTrailingPages * 4;
                            listView.winControl.maxTrailingPages = maxTrailingPages;
                        }
                        Colors.loadSVGImageElements(listView, "action-image", null, "#ffffff", "name");
                        if (listView.winControl.loadingState === "itemsLoading") {
                            /* if (!layout) {
                                 layout = Application.EmpListLayout.EmployeesLayout;
                                 listView.winControl.layout = { type: layout };
                             }*/
                            // load SVG images
                            //Colors.loadSVGImageElements(listView, "action-image", null, "#ffffff", "name");
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            //that.disableButton();
                        } else if (listView.winControl.loadingState === "complete") {
                            //that.disableButton();
                        }
                        Log.ret(Log.l.trace);
                    }
                }
            };
            
            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
            }
            
            that.processAll().then(function () {
                that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            
        })
    });
})();
