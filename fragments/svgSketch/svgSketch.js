// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/fragments/svgSketch/svg.js" />
/// <reference path="~/www/fragments/svgSketch/svgSketchController.js" />

(function () {
    "use strict";

    var fragmentName = Application.getFragmentPath("svgSketch");

    Fragments.define(fragmentName, {
        // This function is called whenever a user navigates to this fragment. It
        // populates the fragment elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Initialize the page here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            var commandList = [];
            this.controller = new SvgSketch.Controller(element, options, commandList);

            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Respond to navigations away from this page.
            this.controller = null;
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            var ret = null;
            var that = this;
            Log.call(Log.l.u1, fragmentName + ".");
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    var svg = element.querySelector("#svgsketch.svgdiv");
                    if (svg && svg.style) {
                        var fragment = element.querySelector(".svgSketchFragment");
                        if (fragment) {
                            var width = fragment.clientWidth;
                            var height = fragment.clientHeight;

                            if (width > 0 && width !== that.prevWidth) {
                                that.prevWidth = width;
                                svg.style.width = width.toString() + "px";
                            }
                            if (height > 0 && height !== that.prevHeight) {
                                that.prevHeight = height;
                                svg.style.height = height.toString() + "px";
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