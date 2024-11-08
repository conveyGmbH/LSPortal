// controller for page: helpTextList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/helpTextList/helpTextListService.js" />
/// <reference path="~/www/fragments/helpTextList/helpTextList.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />



(function () {
    "use strict";

    var namespaceName = "HelpTextList";

    WinJS.Namespace.define("HelpTextList", {
        Controller: WinJS.Class.derive(Fragments.RecordsetController, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            var listView = fragmentElement.querySelector("#helpTextList.listview");
            Fragments.RecordsetController.apply(this, [fragmentElement, {
                loadingState: null
            }, [], null, HelpTextList.helpTextView, listView]);
            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;

            var layout = null;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.u1, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = HelpTextList.ListLayout.HelpTextListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (AppBar.scope && typeof AppBar.scope.resizeHelpTextList === "function") {
                                AppBar.scope.resizeHelpTextList();
                            }
                        }
                        that.binding.loadingState = listView.winControl.loadingState;
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.u1);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                clickShowHelpText: function(ev) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (ev && ev.target && typeof AppData.setHelpTextUserStatus === "function") {
                        var helpTextId = ev.target.helpTextId;
                        AppData.setHelpTextUserStatus(helpTextId, 0).then(function() {
                            that.loadData();
                        });
                    }
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
