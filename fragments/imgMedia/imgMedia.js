// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/fragments/imgMedia/imgMediaController.js" />

(function () {
    "use strict";

    var fragmentName = Application.getFragmentPath("imgMedia");

    Fragments.define(fragmentName, {
        // This function is called whenever a user navigates to this fragment. It
        // populates the fragment elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Initialize the fragment here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;
            this.prevIsDarkTheme = null;

            // add page specific commands to AppBar
            var commandList = [
                { id: "clickZoomIn", label: getResourceText("command.zoomin"), tooltip: getResourceText("tooltip.pictureZoomin"), section: "primary", svg: "zoom_in" },
                { id: "clickZoomOut", label: getResourceText("command.zoomout"), tooltip: getResourceText("tooltip.pictureZoomout"), section: "primary", svg: "zoom_out" }
            ];
            this.controller = new ImgMedia.Controller(element, options, commandList);

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
                    var docContainer = element.querySelector(".doc-container");
                    if (docContainer && docContainer.style) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            if (contentarea.style && 
                                (that.prevIsDarkTheme === null || that.prevIsDarkTheme !== Colors.isDarkTheme)) {
                                if (Colors.isDarkTheme) {
                                    var bkg = Colors.hex2rgb(Colors.tileBackgroundColor);
                                    var bkgHsv = Colors.rgb2hsv(bkg);
                                    bkgHsv.s = Math.min(255, bkgHsv.s * 4);
                                    bkgHsv.v /= 4;
                                    var darkBkg = Colors.hsv2rgb(bkgHsv);
                                    contentarea.style.backgroundColor = Colors.rgb2hex(darkBkg);
                                } else {
                                    contentarea.style.backgroundColor = Colors.tileBackgroundColor;
                                }
                            }
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight;
                            var bReposition = false;

                            if (width > 0 && width !== that.prevWidth) {
                                that.prevWidth = width;
                                docContainer.style.width = width.toString() + "px";
                                bReposition = true;
                            }
                            if (height > 0 && height !== that.prevHeight) {
                                that.prevHeight = height;
                                docContainer.style.height = height.toString() + "px";
                                bReposition = true;
                            }
                            if (bReposition && that.controller) {
                                that.controller.calcImagePosition();
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