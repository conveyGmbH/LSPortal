// controller for page: startContacts
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

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
            }

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

            var resultConverterhour = function (item, index) {
                item.index = index;
                if (Math.sign(item.Inside) === 1) {

                } else {
                    item.Inside = 0;
                }
                if (Math.sign(item.MaxInside) === 1) {

                } else {
                    item.MaxInside = 0;
                }
                var eintritteGesamt = item.EintritteBereich - item.AustritteBereich;
                if (Math.sign(eintritteGesamt) === 1 || eintritteGesamt > 0 || eintritteGesamt === 0) {
                    item.EintritteGesamt = eintritteGesamt;
                }
                else {
                    item.EintritteGesamt = 0;
                }
                if (Math.sign(item.EintritteBereich) === 1 || item.EintritteBereich > 0 || item.EintritteBereich === 0) {
                    item.EintritteBereich = item.EintritteBereich;
                }
                else {
                    item.EintritteBereich = 0;
                }
                if (Math.sign(item.AustritteBereich) === 1 || item.AustritteBereich > 0 || item.AustritteBereich === 0) {
                    item.AustritteBereich = item.AustritteBereich;
                }
                else {
                    item.AustritteBereich = 0;
                }
                item.Zeitraum = item.Zeitraum + ":00";
                item.EintritteAustritteBereich = item.EintritteBereich + " / " + item.AustritteBereich;
            }
            this.resultConverterhour = resultConverterhour;

            var resultConverterhalfhour = function (item, index) {
                item.index = index;
                if (Math.sign(item.Inside) === 1) {

                } else {
                    item.Inside = 0;
                }
                if (Math.sign(item.MaxInside) === 1) {

                } else {
                    item.MaxInside = 0;
                }
                var eintritteGesamt = item.EintritteBereich - item.AustritteBereich;
                if (eintritteGesamt > 0 || eintritteGesamt === 0) {
                    item.EintritteGesamt = eintritteGesamt;
                }
                else {
                    item.EintritteGesamt = 0;
                }
                if (Math.sign(item.EintritteBereich) === 1 || item.EintritteBereich > 0 || item.EintritteBereich === 0) {
                    item.EintritteBereich = item.EintritteBereich;
                }
                else {
                    item.EintritteBereich = 0;
                }
                if (Math.sign(item.AustritteBereich) === 1 || item.AustritteBereich > 0 || item.AustritteBereich === 0) {
                    item.AustritteBereich = item.AustritteBereich;
                }
                else {
                    item.AustritteBereich = 0;
                }
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
                        WinJS.Promise.timeout(50).then(function () {
                            that.loadData();
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "VisitorFlowLevelIndicator.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.VisitorFlowLevelIndicatorLayout.VisitorFlowLevelIndicatorLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MediaText.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

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
