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

            if (element) {
                var shapeElements = element.querySelectorAll(".tool-image");
                if (shapeElements && shapeElements.length > 0) {
                    for (var i = 0; i < shapeElements.length; i++) {
                        if (shapeElements[i].id && shapeElements[i].id.length > 0) {
                            var svgObject = shapeElements[i];
                            // insert svg object before span element 
                            if (svgObject && !svgObject.firstChild) {
                                var size = 28;
                                if (svgObject.parentNode &&
                                    svgObject.parentNode.clientWidth) {
                                    size = svgObject.parentNode.clientWidth;
                                }
                                svgObject.setAttribute("width", size.toString());
                                svgObject.setAttribute("height", size.toString());
                                svgObject.style.display = "inline";

                                // overlay span element over svg object to enable user input
                                //winCommandimage.setAttribute("style", "position: relative; top: -28px; width: 24px; height: 24px;");

                                // load the image file
                                Colors.loadSVGImage({
                                    fileName: shapeElements[i].id,
                                    color: Colors.textColor,
                                    size: size,
                                    useFillColor: false,
                                    useStrokeColor: true
                                });
                            }
                        }
                    }
                }
            }
            var toolBackgroundColor;
            if (Colors.isDarkTheme) {
                toolBackgroundColor = "#2b2b2b";
            } else {
                toolBackgroundColor = "#f2f2f2";
            }
            Colors.changeCSS(".tool-box", "background-color", toolBackgroundColor);

            this.controller = new SvgSketch.Controller(element, options);

            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Respond to navigations away from this page.
            this.controller = null;
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            Log.call(Log.l.trace, fragmentName + ".");
            var ret;
            if (this.controller) {
                ret = this.controller.saveData(function (response) {
                    // called asynchronously if ok
                    complete(response);
                }, function (errorResponse) {
                    error(errorResponse);
                });
            } else {
                ret = WinJS.Promise.as().then(function () {
                    var err = { status: 500, statusText: "fatal: fragment already deleted!" };
                    error(err);
                });
            }
            Log.ret(Log.l.trace);
            return ret;
        },

        updateLayout: function (element, viewState, lastViewState) {
            var ret = null;
            var that = this;
            Log.call(Log.l.u1, fragmentName + ".");
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    var fragment = element.querySelector(".svgSketchfragment");
                    var svg = element.querySelector("#svgsketch.svgdiv");

                    var width = fragment.clientWidth;
                    var height = fragment.clientHeight;
                    
                    if (svg && svg.style) {
                        if (fragment) {
                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                svg.style.width = width.toString() + "px";
                            }
                            if (height !== that.prevHeight) {
                                that.prevHeight = height;
                                svg.style.height = (height - 10).toString() + "px";
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