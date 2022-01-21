// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/seriesResourceAdministration/seriesResourceAdministrationController.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Application.seriesResourceAdministrationLayout", {
        EventTextLayout: WinJS.Class.define(function (options) {
                this._site = null;
                this._surface = null;
            },
            {
                // This sets up any state and CSS layout on the surface of the custom layout
                initialize: function (site) {
                    this._site = site;
                    this._surface = this._site.surface;

                    // Add a CSS class to control the surface level layout
                    WinJS.Utilities.addClass(this._surface, "eventTextLayout");

                    return WinJS.UI.Orientation.vertical;
                },

                // Reset the layout to its initial state
                uninitialize: function () {
                    WinJS.Utilities.removeClass(this._surface, "eventTextLayout");
                    this._site = null;
                    this._surface = null;
                }
            })
    });

    var pageName = Application.getPagePath("seriesResourceAdministration");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;
            // TODO: Initialize the page here.
            // add page specific commands to AppBar
            var commandList = [
                { id: "clickBack", label: getResourceText("command.backward"), tooltip: getResourceText("tooltip.backward"), section: "primary", svg: "navigate_left" },
                { id: "clickNew", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.newEventText"), section: "primary", svg: "plus" },
                { id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.delete"), section: "primary", svg: "garbage_can" },
                { id: "clickForward", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.ok"), section: "primary", svg: "navigate_check", key: WinJS.Utilities.Key.enter }
            ];
            this.controller = new SeriesResourceAdministration.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickForward.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            var ret;
            Log.call(Log.l.trace, pageName + ".");
            if (this.controller) {
                ret = this.controller.saveData(function (response) {
                    // called asynchronously if ok
                complete(response);
                }, function (errorResponse) {
                    error(errorResponse);
            });
            } else {
                ret = WinJS.Promise.as();
            }
            Log.ret(Log.l.trace);
            return ret;
        },

        unload: function () {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to navigations away from this page.
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
            var ret = null;
            var that = this;
            /// <param name="element" domElement="true" />
            Log.call(Log.l.u1, pageName + ".");
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    if (that.controller) {
                        var contentArea = element.querySelector("#seriesResourceAdministrationController .contentarea");
                        if (contentArea) {
                            var fragmentHost = element.querySelector(".contentarea > .fragmenthost");
                            var listHeader = element.querySelector(".contentarea > .list-header");
                            var listView = element.querySelector(".contentarea > .listview");
                            var width = contentArea.clientWidth;
                            var height = contentArea.clientHeight - 18;
                            if (fragmentHost) {
                                height -= fragmentHost.clientHeight;
                            }
                            if (listHeader) {
                                height -= listHeader.clientHeight;
                            }
                            if (width !== that.prevWidth) {
                                if (listView && listView.style) {
                                    listView.style.width = width.toString() + "px";
                                }
                                that.prevWidth = width;
                            }
                            if (height !== that.prevHeight) {
                                if (listView && listView.style) {
                                    listView.style.height = height.toString() + "px";
                                }
                                that.prevHeight = height;
                            }
                        }
                    }
                    that.inResize = 0;
                });
            }
            Log.ret(Log.l.u1);
            return ret || WinJS.Promise.as();
        }
    });
})();