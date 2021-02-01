// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/eventResourceAdministration/eventResourceAdministrationController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("eventResourceAdministration");

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
                { id: "clickOk", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.ok"), section: "primary", svg: "navigate_check" }
            ];
            this.controller = new EventResourceAdministration.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickOk.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            var that = this;
            Log.call(Log.l.trace, pageName + ".");
            var ret = WinJS.Promise.as().then(function (response) {
                //that.controller.setupLog();
                Application.pageframe.savePersistentStates();
                complete(response);
            });
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
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight;
                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                var dokVerwendungList = element.querySelector("#dokVerwendungList.listview");
                                var listControl = dokVerwendungList && dokVerwendungList.winControl;
                                var textUsage = that.controller.textUsage;
                                if (dokVerwendungList && listControl && textUsage) {
                                    var container, i, selectionBkg, itemWidth;
                                    if (listControl.loadingState === "complete") {
                                        // calculate width for each cell
                                        var containers = dokVerwendungList.querySelectorAll(".win-container");
                                        if (containers && containers.length === textUsage.length) {
                                            var fontWidth = width > 499 ? 8 : 6;
                                            var totalLen = 0;
                                            var maxLen = 0;
                                            var item;
                                            for (i = 0; i < textUsage.length; i++) {
                                                item = textUsage.getAt(i);
                                                if (item) {
                                                    itemWidth = item.TITLE ? item.TITLE.length : 0;
                                                    totalLen = totalLen + itemWidth;
                                                    if (itemWidth > maxLen) {
                                                        maxLen = itemWidth;
                                                    }
                                                }
                                            }
                                            var strWidth = width.toString() + "px";
                                            if (width < maxLen * textUsage.length * fontWidth) {
                                                width = maxLen * textUsage.length * fontWidth;
                                                strWidth = width.toString() + "px";
                                            }
                                            var surface = dokVerwendungList.querySelector(".win-surface");
                                            if (surface && surface.style) {
                                                surface.style.width = strWidth;
                                            }
                                            // ListView container elements used in filled ListView
                                            var itemsContainer = dokVerwendungList.querySelector(".win-itemscontainer");
                                            if (itemsContainer && itemsContainer.style) {
                                                itemsContainer.style.width = strWidth;
                                            }
                                            for (i = 0; i < textUsage.length; i++) {
                                                item = textUsage.getAt(i);
                                                if (item) {
                                                    itemWidth = item.TITLE ? item.TITLE.length : 0;
                                                    var widthTextUsageItem;
                                                    if (totalLen > 0) {
                                                        widthTextUsageItem = (width * itemWidth) / totalLen;
                                                    } else {
                                                        widthTextUsageItem = width / itemWidth;
                                                    }
                                                    container = containers[i];
                                                    if (container) {
                                                        var strContainerWidth = widthTextUsageItem.toString() + "px";
                                                        if (container.style) {
                                                            container.style.width = strContainerWidth;
                                                        }
                                                        selectionBkg = container.querySelector(".win-selectionbackground");
                                                        if (selectionBkg && selectionBkg.style) {
                                                            var horizontalTexts = container.querySelectorAll(".navigationbar-horizontal-text");
                                                            if (horizontalTexts && horizontalTexts[0]) {
                                                                var textElement = horizontalTexts[0].querySelector(".navigationbar-inner-text");
                                                                if (textElement && textElement.offsetWidth > 0 && selectionBkg && selectionBkg.style) {
                                                                    selectionBkg.style.left = "calc(50% - " + (textElement.offsetWidth / 2).toString() + "px)";
                                                                    selectionBkg.style.right = "";
                                                                    selectionBkg.style.width = textElement.offsetWidth.toString() + "px";
                                                                    selectionBkg.style.backgroundColor = Colors.navigationColor;
                                                                    selectionBkg.style.opacity = 1;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            if (listControl && listControl.selection && NavigationBar.data) {
                                                var selectionCount = listControl.selection.count();
                                                if (selectionCount === 1 && typeof that.controller.scrollIntoView === "function") {
                                                    // Only one item is selected, show the page
                                                    listControl.selection.getItems().done(function(items) {
                                                        that.controller.scrollIntoView(items[0].index);
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (height !== that.prevHeight) {
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