// controller for page: genFragEvents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/genFragAnswers/genFragAnswersService.js" />
/// <reference path="~/www/fragments/genFragAnswers/genFragAnswers.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenFragAnswers", {
        Controller: WinJS.Class.derive(Fragments.RecordsetController, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "GenFragAnswers.Controller.");
            var listView = fragmentElement.querySelector("#genFragAnswers.listview");
            Fragments.RecordsetController.apply(this, [fragmentElement, {
                loadingState: null
            }, [], GenFragAnswers.answerTable, GenFragAnswers.answerView, listView]);

            var that = this;

            var layout = null;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenFragAnswers.Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.u1, "GenFragAnswers.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = GenFragAnswers.ListLayout.GenFragAnswersLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (AppBar.scope && typeof AppBar.scope.resizeGenFragAnswers === "function") {
                                AppBar.scope.resizeGenFragAnswers();
                            }
                        }
                        that.binding.loadingState = listView.winControl.loadingState;
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.u1);
                },
                onFocusOut: function (event) {
                    Log.call(Log.l.trace, "GenFragAnswers.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataAnswers.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                }
            }
            this.eventHandlers = eventHandlers;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "keydown", function (e) {
                    if (!e.ctrlKey && !e.altKey) {
                        switch (e.keyCode) {
                        case WinJS.Utilities.Key.end:
                        case WinJS.Utilities.Key.home:
                        case WinJS.Utilities.Key.leftArrow:
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.space:
                            e.stopImmediatePropagation();
                            break;
                        }
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "contextmenu", function (e) {
                    var targetTagName = e.target &&
                        e.target.tagName &&
                        e.target.tagName.toLowerCase();
                    if (targetTagName === "textarea" || targetTagName === "input") {
                        e.stopImmediatePropagation();
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "focusout", this.eventHandlers.onFocusOut.bind(this));
            }
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