// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/infodesk/infodeskController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("infodesk");
    var masterDetailPageName = Application.getPagePath("infodeskEmpList");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            // add page specific commands to AppBar
            var commandList = [
                { id: "clickBack", label: getResourceText("command.backward"), tooltip: getResourceText("tooltip.backward"), section: "primary", svg: "navigate_left" },
                { id: "clickResetRestriction", label: getResourceText("command.resetRestriction"), tooltip: getResourceText("tooltip.resetRestriction"), section: "primary", svg: "funnel_delete" },
                { id: "clickSendMessage", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.sendMessage"), section: "primary", svg: "paper_jet2", key: WinJS.Utilities.Key.enter }
            ];
            if (!AppHeader.controller.binding.userData.SiteAdmin &&
                !AppData._persistentStates.leadsuccessFeatureStandard) {
                commandList = [
                    { id: "clickBack", label: getResourceText("command.backward"), tooltip: getResourceText("tooltip.backward"), section: "primary", svg: "navigate_left" }
                ];
            }
            this.controller = new Infodesk.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            Log.ret(Log.l.trace);
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
            if (element && !this.inResize) {
                this.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    var empList = element.querySelector("#infodeskEmployeeList.listview");
                    if (empList && empList.style) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight - 8;
                            var contentheader = element.querySelector(".content-header");
                            if (contentheader) {
                                height -= contentheader.clientHeight;
                            }
                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                contentarea.style.width = width.toString() + "px";
                            }
                            if (height !== that.prevHeight) {
                                that.prevHeight = height;
                                contentarea.style.height = height.toString() + "px";
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