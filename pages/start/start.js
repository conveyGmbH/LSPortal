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
                contentarea.style.backgroundColor = Colors.tileBackgroundColor;
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
                                var tileTop = element.querySelector(".tile-top");
                                //var tileMiddle = element.querySelector(".tile-middle");
                                var tileBottom = element.querySelector(".tile-bottom");
                                /*if (tileTop && tileMiddle && tileBottom && tileTop.style) {
                                    if (tileBottom.clientHeight + tileMiddle.clientHeight + tileTop.clientHeight < height) {
                                        tileTop.style.height =
                                            (height - tileBottom.clientHeight - tileMiddle.clientHeight).toString() +
                                            "px";
                                    } else {
                                        tileTop.style.height = "";
                                    }
                                }*/
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
                                var worldContainer = element.querySelector('#worldcontainer');
                                if (worldContainer && worldContainer.style) {
                                    var worldContainerWidth = width / 2 - 52;
                                    if (element.className) {
                                        if (element.className.indexOf("view-size-small") >= 0) {
                                            worldContainerWidth = width - 20;
                                        } else if (element.className.indexOf("view-size-medium") >= 0) {
                                            worldContainerWidth = width - 36;
                                        }
                                    }
                                    if (worldContainerWidth > that.controller.worldMapMaxWidth) {
                                        worldContainer.style.width = that.controller.worldMapMaxWidth.toString() + "px";
                                        worldContainer.style.marginLeft = ((worldContainerWidth - that.controller.worldMapMaxWidth) / 2).toString() + "px";
                                    } else {
                                        worldContainer.style.width = "";
                                        worldContainer.style.marginLeft = "";
                                    }
                                }
                                if (width !== that.prevWidth) {
                                    if (typeof that.controller.worldChart === "function") {
                                        that.controller.worldChart();    
                                    }
                                    if (typeof that.controller.showDonutChart === "function") {
                                        that.controller.showDonutChart("countryPie", false);
                                    }
                                    if (typeof that.controller.showPieChart === "function") {
                                        that.controller.showPieChart("visitorsEditedChart", false);
                                    }
                                    if (typeof that.controller.showBarChart === "function") {
                                        that.controller.showBarChart("visitorsPerDayChart", false);
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
