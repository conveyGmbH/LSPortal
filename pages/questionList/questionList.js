﻿// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/questionList/questionListController.js" />
(function () {
    "use strict";

    WinJS.Namespace.define("Application.QuestionListLayout", {
        QuestionsLayout: WinJS.Class.define(function (options) {
            this._site = null;
            this._surface = null;
        },
        {
            // This sets up any state and CSS layout on the surface of the custom layout
            initialize: function (site) {
                this._site = site;
                this._surface = this._site.surface;

                // Add a CSS class to control the surface level layout
                WinJS.Utilities.addClass(this._surface, "questionListLayout");
                return WinJS.UI.Orientation.vertical;
            },

            // Reset the layout to its initial state
            uninitialize: function () {
                WinJS.Utilities.removeClass(this._surface, "questionListLayout");
                this._site = null;
                this._surface = null;
            }
        })
    });

    var pageName = Application.getPagePath("questionList");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            Log.call(Log.l.u1, pageName + ".");
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            // add page specific commands to AppBar
            var commandList = [
                { id: 'clickBack', label: getResourceText('command.backward'), tooltip: getResourceText('tooltip.backward'), section: 'primary', svg: 'navigate_left' },
                //{ id: "clickPdf", label: getResourceText("command.exportPdf"), tooltip: getResourceText("tooltip.exportPdf"), section: "primary", svg: "document_pdf" },
                { id: "clickNew", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.newQuestionsAnswers"), section: "primary", svg: "plus" },
                { id: 'clickForward', label: getResourceText('command.ok'), tooltip: getResourceText('tooltip.ok'), section: 'primary', svg: 'navigate_check', key: WinJS.Utilities.Key.enter },
                { id: "clickLineUp", label: getResourceText("command.lineUp"), tooltip: getResourceText("tooltip.lineUp"), section: "primary", svg: "navigate_up2" },
                { id: "clickLineDown", label: getResourceText("command.lineDown"), tooltip: getResourceText("tooltip.lineDown"), section: "primary", svg: "navigate_down2" },
                { id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.deleteQuestionsAnswers"), section: "primary", svg: "garbage_can" }
            ];
            if (!AppHeader.controller.binding.userData.SiteAdmin &&
                AppData._persistentStates.leadsuccessBasic) {
                commandList = [
                    { id: 'clickBack', label: getResourceText('command.backward'), tooltip: getResourceText('tooltip.backward'), section: 'primary', svg: 'navigate_left' }
                ];
            }
            this.controller = new QuestionList.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
                this.controller.addRemovableEventListener(document, "mousedown", this.controller.eventHandlers.onMouseDown.bind(this.controller));
                this.controller.addRemovableEventListener(document, "pointerdown", this.controller.eventHandlers.onPointerDown.bind(this.controller));
                this.controller.addRemovableEventListener(document, "mouseup", this.controller.eventHandlers.onMouseUp.bind(this.controller));
                this.controller.addRemovableEventListener(document, "pointerup", this.controller.eventHandlers.onPointerUp.bind(this.controller));
                //this.controller.addRemovableEventListener(window, "clickPdf", this.controller.eventHandlers.clickPdf.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },
        canUnload: function (complete, error) {
            Log.call(Log.l.trace, pageName + ".");
            var ret = null;
            if (this.controller) {
                var that = this;
                ret = this.controller.saveData(function (saveResponse) {
                    // called asynchronously if ok
                    // anstatt AppData.generalData.publishFlag den master..publishFlag prüfen
                    if (that.controller.getPublishFlag() === 1) {
                        /*var confirmTitle = getResourceText("publish.publishText");
                        confirm(confirmTitle, function (result) {
                            if (result && that.controller) {
                                that.controller.publish(function (response) {
                                    AppData.getUserData().then(function() {
                                        complete(response);
                                    });
                                }, function (errorResponse) {
                                    error(errorResponse);
                                });
                            } else {
                                complete(saveResponse);
                            }
                        });*/
                        Application.navigateById("publish", event);
                        complete(saveResponse);
                    } else {
                        complete(saveResponse);
                    }
                }, function (errorResponse) {
                    error(errorResponse);
                });
            }
            return ret || WinJS.Promise.as();
        },
        unload: function (complete, error) {
            Log.call(Log.l.u1, pageName + ".");
            // TODO: Respond to navigations away from this page.
            Log.ret(Log.l.trace);
        },
        updateLayout: function (element, viewState, lastViewState) {
            var ret = null;
            var that = this;
            /// <param name="element" domElement="true" />
            Log.call(Log.l.u1, pageName + ".");
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(100).then(function () {
                    var listQuestionnaire = element.querySelector("#listQuestionList.listview");
                    if (listQuestionnaire && listQuestionnaire.style) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight - 8;

                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                listQuestionnaire.style.width = width.toString() + "px";
                            }
                            if (height !== that.prevHeight) {
                                that.prevHeight = height;
                                listQuestionnaire.style.height = height.toString() + "px";
                            }
                        }
                    }
                    that.inResize = 0;

                }).then(function() {
                   // var counter = element.querySelector(".counter");
                   // counter.scrollIntoView(false);
                });
                
            }
            
            Log.ret(Log.l.u1);
            return ret;
        }
    });
})();
