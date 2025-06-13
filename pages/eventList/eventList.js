// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/eventList/eventListController.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Application.EventListLayout", {
        EventListLayout: WinJS.Class.define(function (options) {
            this._site = null;
            this._surface = null;
        }, {
                // This sets up any state and CSS layout on the surface of the custom layout
                initialize: function (site) {
                    this._site = site;
                    this._surface = this._site.surface;

                    // Add a CSS class to control the surface level layout
                    WinJS.Utilities.addClass(this._surface, "eventListLayout");

                    return WinJS.UI.Orientation.vertical;
                },

                // Reset the layout to its initial state
                uninitialize: function () {
                    WinJS.Utilities.removeClass(this._surface, "eventListLayout");
                    this._site = null;
                    this._surface = null;
                }
            })
    });

    var pageName = Application.getPagePath("eventList");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            // add page specific commands to AppBar
            var commandList = [
                { id: "clickBack", label: getResourceText("command.backward"), tooltip: getResourceText("tooltip.backward"), section: "primary", svg: "navigate_left" },
                { id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.deleteevent"), section: "primary", svg: "garbage_can" },
                { id: "copyQuestionnaire", label: getResourceText("command.copyQuestionnaire"), tooltip: getResourceText("tooltip.copyQuestionnaire"), section: "primary", svg: "copy" },
                { id: "clickNew", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.newevent"), section: "primary", svg: "plus" },
                { id: "clickChange", label: getResourceText("command.eventFavourite"), tooltip: getResourceText("tooltip.eventFavourite"), section: "primary", svg: "star2" }
            ];

            var isMaster = Application.navigator && Application.navigator._nextMaster === pageName;
            this.controller = new EventList.Controller(element, commandList, isMaster);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, pageName + ".");
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
                ret = WinJS.Promise.timeout(0).then(function () {
                    var eventList = element.querySelector("#eventList.listview");
                    if (eventList && eventList.style) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var nav = WinJS.Navigation;
                            var curPageId = Application.getPageId(nav.location);
                            that.controller.hideBtnFilterNotPublished(curPageId);
                            that.controller.showDashboardFeature(curPageId);
                            var width = contentarea.offsetWidth;
                            var height = contentarea.offsetHeight - 8;
                            var contentheader = element.querySelector(".content-header");
                            if (contentheader) {
                                height -= contentheader.clientHeight;
                            }
                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                eventList.style.width = width.toString() + "px";
                            }
                            if (height !== that.prevHeight) {
                                that.prevHeight = height;
                                eventList.style.height = height.toString() + "px";
                            }
                        }
                    }
                    that.inResize = 0;
                });
            }
            Log.ret(Log.l.u1);
            return ret;
        }
    });
})();
