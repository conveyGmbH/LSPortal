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

    var pageName = Application.getPagePath("home");

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
                                var tilesContainer = element.querySelector(".tiles-container");
                                var listView = element.querySelector("#homeActions.listview");
                                var tileBottom = element.querySelector(".tile-bottom");
                                if (listView && listView.style && 
                                    tilesContainer && tilesContainer.style && 
                                    tileBottom && tileBottom.style) {
                                    var count = that.controller.binding && that.controller.binding.count;
                                    if (count > 0) {
                                        var itemWidth = 410;
                                        var itemHeight = 110;
                                        var actionItem = listView.querySelector(".action-item");
                                        if (actionItem) {
                                            itemWidth = actionItem.clientWidth + 30;
                                        }
                                        var itemsPerLine = Math.max(Math.floor(width / itemWidth),1);
                                        var itemLines = Math.floor(count / itemsPerLine + 0.99);
                                        var listHeight = itemLines * itemHeight;
                                        while (itemsPerLine > 2 && (height - (listHeight + 20 + tileBottom.clientHeight)) > itemHeight) {
                                            itemsPerLine--;
                                            itemLines = Math.floor(count / itemsPerLine + 0.99);
                                            listHeight = itemLines * itemHeight;
                                        }
                                        var listWidth = itemsPerLine * itemWidth;
                                        if (tilesContainer.clientHeight !== listHeight) {
                                            tilesContainer.style.height = (listHeight + 20) + "px";
                                        }
                                        if (listView.clientWidth !== listWidth && listWidth < width) {
                                            listView.style.width = (listWidth + 20) + "px";
                                            listView.style.marginLeft = "calc(50% - " + (listWidth/2 + 20) + "px)";
                                        }
                                    }
                                    var verticalSpace = height - (tilesContainer.clientHeight + tileBottom.clientHeight);
                                    if (verticalSpace > 0) {
                                        tileBottom.style.display = "block";
                                        tileBottom.style.position = "absolute";
                                        tileBottom.style.bottom = 0;
                                        tilesContainer.style.marginTop = Math.max(((verticalSpace / 2) - 20),0) + "px";
                                    } else {
                                        tileBottom.style.display = "";
                                        tileBottom.style.position = "";
                                        tileBottom.style.bottom = "";
                                        tilesContainer.style.marginTop = "";
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
