// controller for page: eventSeries
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataQuestions/genDataQuestionsService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("GenDataQuestions", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, "GenDataQuestions.Controller.");
            // ListView control
            var listView = pageElement.querySelector("#genDataQuestions.listview");

            Application.RecordsetController.apply(this, [pageElement, {
            }, commandList, isMaster, null, GenDataQuestions.questionView, listView]);
            
            var that = this;

            var layout = null;

            var resultConverter = function (item, index) {
                Log.call(Log.l.trace, "GenDataQuestions.Controller.");
                item.index = index;
                item.nameInitial = (item.QuestionTitle)
                    ? item.QuestionTitle.substr(0, 2)
                    : (item.QuestionTitle ? item.QuestionTitle.substr(0, 2) : "");
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var checkLoadingFinished = function () {
                WinJS.Promise.timeout(10).then(function () {
                    if (!AppBar.busy) {
                        that.binding.loading = false;
                    } else {
                        WinJS.Promise.timeout(100).then(function () {
                            that.checkLoadingFinished();
                        });
                    }
                });
            }
            this.checkLoadingFinished = checkLoadingFinished;
            // define handlers
            this.eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataQuestions.Controller.");
                    var curPageId = Application.getPageId(nav.location);
                    that.selectionChanged(function() {
                        AppData.setRecordId("Question", that.curRecId);
                        if (curPageId === "genDataAnswers" && typeof AppBar.scope.loadData === "function") {
                            AppBar.scope.loadData();
                        } else {
                            Application.navigateById("genDataAnswers");
                        }
                    }).then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.u1, "GenDataQuestions.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.GenDataQuestionsLayout.GenDataQuestionsLayout;
                                listView.winControl.layout = { type: layout };
                            }
                            //smallest List color change
                            var circleElement = pageElement.querySelector(".list-compact-only .list-div-left > span");
                            if (circleElement && circleElement.style) {
                                circleElement.style.backgroundColor = Colors.accentColor;
                            }
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "action-image-flag", 40);
                        } else if (listView.winControl.loadingState === "complete") {
                            that.checkLoadingFinished();
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.u1);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataQuestions.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            };
            this.disableHandlers = {
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "loadData complete");
                if (that.binding.count > 0 && listView && listView.winControl) {
                    listView.winControl.selection.set(0);
                }
            });
            Log.ret(Log.l.trace);
        }, {
            nextUrl: null,
            loading: false
        })
    });
})();
