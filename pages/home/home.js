// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/home/homeController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Application.HomeLayout", {
        HomeLayout: WinJS.Class.define(function (options) {
                this._site = null;
                this._surface = null;
            },
            {
                // This sets up any state and CSS layout on the surface of the custom layout
                initialize: function (site) {
                    this._site = site;
                    this._surface = this._site.surface;

                    // Add a CSS class to control the surface level layout
                    WinJS.Utilities.addClass(this._surface, "homeLayout");

                    return WinJS.UI.Orientation.vertical;
                },

                // Reset the layout to its initial state
                uninitialize: function () {
                    WinJS.Utilities.removeClass(this._surface, "homeLayout");
                    this._site = null;
                    this._surface = null;
                }
            })
    });
    var pageName = Application.getPagePath("home");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            var contentarea = element.querySelector(".contentarea");
            if (contentarea && contentarea.style) {
                contentarea.style.backgroundColor = Colors.tileBackgroundColor;
            }

            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            if (!options) {
                options = {};
            }
            options.showHalfCircle = true;

            var commandList = [];

            this.controller = new Home.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to navigations away from this page.
            this.controller = null;
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            var ret = null;
            var that = this;
            Log.call(Log.l.u1, pageName + ".");
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function() {
                    if (that.controller) {
                        var contentArea = element.querySelector(".contentarea");
                        if (contentArea) {
                            var width = contentArea.clientWidth;
                            var height = contentArea.clientHeight;
                            var contentHeader = element.querySelector(".content-header");
                            if (contentHeader) {
                                height -= contentHeader.clientHeight;
                            }
                            if (width !== that.prevWidth || height !== that.prevHeight) {
                                var tileTop = element.querySelector(".tile-top");
                                var tileBottom = element.querySelector(".tile-bottom");
                                if (tileTop && tileBottom && tileBottom.style) {
                                    if (tileTop.clientHeight + tileBottom.clientHeight < height) {
                                        tileBottom.style.display = "block";
                                        tileBottom.style.position = "absolute";
                                        tileBottom.style.bottom = 0;
                                    } else {
                                        tileBottom.style.display = "";
                                        tileBottom.style.position = "";
                                        tileBottom.style.bottom = "";
                                    }
                                }
                                that.prevWidth = width;
                                that.prevHeight = height;
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
