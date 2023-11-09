// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/genDataEmpList/genDataEmpListController.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Application.GenDataEmpListLayout", {
        GenDataEmpListLayout: WinJS.Class.define(function (options) {
            this._site = null;
            this._surface = null;
        },
        {
            // This sets up any state and CSS layout on the surface of the custom layout
            initialize: function (site) {
                this._site = site;
                this._surface = this._site.surface;

                // Add a CSS class to control the surface level layout
                WinJS.Utilities.addClass(this._surface, "genDataEmpListLayout");

                return WinJS.UI.Orientation.vertical;
            },

            // Reset the layout to its initial state
            uninitialize: function () {
                WinJS.Utilities.removeClass(this._surface, "genDataEmpListLayout");
                this._site = null;
                this._surface = null;
            }
        })
    });

    var pageName = Application.getPagePath("genDataEmpList");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            this.controller = new GenDataEmpList.Controller(element);
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
                    var genDataEmpList = element.querySelector("#genDataEmpList.listview");
                    if (genDataEmpList && genDataEmpList.style) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var width = contentarea.offsetWidth;
                            var height = contentarea.offsetHeight - 8;
                            var contentheader = element.querySelector(".content-header");
                            if (contentheader) {
                                height -= contentheader.clientHeight;
                            }
                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                genDataEmpList.style.width = width.toString() + "px";
                            }
                            if (height !== that.prevHeight) {
                                that.prevHeight = height;
                                genDataEmpList.style.height = height.toString() + "px";
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