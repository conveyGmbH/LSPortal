// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/start/startController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Application.StartLayout", {
        StartLayout: WinJS.Class.define(function (options) {
                this._site = null;
                this._surface = null;
            },
            {
                // This sets up any state and CSS layout on the surface of the custom layout
                initialize: function (site) {
                    this._site = site;
                    this._surface = this._site.surface;

                    // Add a CSS class to control the surface level layout
                    WinJS.Utilities.addClass(this._surface, "startLayout");

                    return WinJS.UI.Orientation.vertical;
                },

                // Reset the layout to its initial state
                uninitialize: function () {
                    WinJS.Utilities.removeClass(this._surface, "startLayout");
                    this._site = null;
                    this._surface = null;
                }
            })
    });
    var pageName = Application.getPagePath("start");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            var contentarea = element.querySelector(".contentarea");
            if (contentarea && contentarea.style) {
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
            var fieldTiles = element.querySelectorAll(".field_tile");
            if (fieldTiles && fieldTiles.length > 0) {
                for (var i = 0; i < fieldTiles.length; i++) {
                    var fieldTile = fieldTiles[i];
                    if (fieldTile && fieldTile.style) {
                        fieldTile.style.backgroundColor = Colors.backgroundColor;
                    }
                }
            }

            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            if (!options) {
                options = {};
            }
            options.showHalfCircle = true;

            var commandList = [];

            this.controller = new Start.Controller(element, commandList);
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
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight;
                            var contentHeader = element.querySelector(".content-header");
                            if (contentHeader) {
                                height -= contentHeader.clientHeight;
                            }
                            if (width !== that.prevWidth || height !== that.prevHeight) {
                                var fragmenthost = element.querySelector(".fragmenthost");
                                var tilesContainer = element.querySelector(".tile-content-inner");
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

                                var horizontalSpace = width - (fragmenthost.clientWidth * 2);
                                if (horizontalSpace > 120 && horizontalSpace < 140) {
                                    /*tileBottom.style.display = "block";
                                    tileBottom.style.position = "absolute";
                                    tileBottom.style.bottom = 0;*/
                                    tilesContainer.style.marginLeft = Math.max(((horizontalSpace / 2) - 10), 0) + "px";
                                } else {
                                    /*tileBottom.style.display = "";
                                    tileBottom.style.position = "";
                                    tileBottom.style.bottom = "";*/
                                    tilesContainer.style.marginLeft = "";
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
