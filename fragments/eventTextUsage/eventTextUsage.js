// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/fragments/eventTextUsage/eventTextUsageController.js" />

(function () {
    "use strict";

    var fragmentName = Application.getFragmentPath("eventTextUsage");

    Fragments.define(fragmentName, {
        // This function is called whenever a user navigates to this fragment. It
        // populates the fragment elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Initialize the fragment here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            Colors.changeCSS("#eventTextUsageList .win-selected", "color", Colors.navigationColor);

            this.controller = new EventTextUsage.Controller(element, options);

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
            /// <param name="element" domElement="true" />
            Log.call(Log.l.u1, fragmentName + ".");
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
                                if (width > 0) {
                                    var listView = element.querySelector("#eventTextUsageList.listview");
                                    var listControl = listView && listView.winControl;
                                    var textUsage = that.controller.textUsage;
                                    if (listView && listControl && textUsage && textUsage.length > 0) {
                                        if (listControl.loadingState === "complete") {
                                            var container, i, selectionBkg, itemWidth;
                                            // calculate width for each cell
                                            var containers = listView.querySelectorAll(".win-container");
                                            if (containers && containers.length === textUsage.length) {
                                                var fontWidth = width > 499 ? 7 : 5;
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
                                                var surface = listView.querySelector(".win-surface");
                                                if (surface && surface.style) {
                                                    surface.style.width = strWidth;
                                                }
                                                // ListView container elements used in filled ListView
                                                var itemsContainer = listView.querySelector(".win-itemscontainer");
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
                                                            widthTextUsageItem = width / textUsage.length;
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
                                                if (listControl && listControl.selection) {
                                                    var selectionCount = listControl.selection.count();
                                                    if (selectionCount === 1 && typeof that.controller.scrollIntoView === "function") {
                                                        // Only one item is selected, show the page
                                                        listControl.selection.getItems().done(function(items) {
                                                            that.controller.scrollIntoView(items[0].index);
                                                        });
                                                    }
                                                }
                                            }
                                        } else {
                                            WinJS.Promise.timeout(50).then(function() {
                                                that.prevWidth = 0;
                                                that.prevHeight = 0;
                                                that.updateLayout.call(that, element);
                                            });
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