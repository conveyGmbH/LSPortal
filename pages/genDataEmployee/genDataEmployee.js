// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/genDataEmployee/genDataEmployeeController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("genDataEmployee");

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
                { id: "clickNew", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.newEmployee"), section: "primary", svg: "user_plus" },
                { id: "clickOk", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.ok"), section: "primary", svg: "navigate_check", key: WinJS.Utilities.Key.enter },
                { id: "clickExportQrcode", label: getResourceText("command.userPwExport"), tooltip: getResourceText("tooltip.export"), section: "primary", svg: "arrow_barrier_down" },
                { id: "clickChangeLogin", label: getResourceText("command.changeLogin"), tooltip: getResourceText("tooltip.changeLogin"), section: "primary", svg: "benutzer" },
                //{ id: "clickExport", label: getResourceText("command.export"), tooltip: getResourceText("tooltip.export"), section: "primary", svg: "arrow_barrier_down" },
                { id: "clickDelete2fa", label: getResourceText("command.delete2fa"), tooltip: getResourceText("tooltip.delete2fa"), section: "primary", svg: "lock_open" },
                { id: "clickUnlock", label: getResourceText("command.unlockUser"), tooltip: getResourceText("tooltip.unlockUser"), section: "primary", svg: "arrow_circle2" },
                { id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.deleteEmployee"), section: "primary", svg: "garbage_can" },
                { id: "clickReorder", label: getResourceText("command.newNachbestellungen"), tooltip: getResourceText("tooltip.newNachbestellungen"), section: "primary", svg: "bestellungen2" },
                { id: "clickAddLicences", label: getResourceText("command.addLicences"), tooltip: getResourceText("tooltip.addLicences"), section: "primary", svg: "bestellungen" }
            ];

            this.controller = new GenDataEmployee.Controller(element, commandList);
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

        canUnload: function (complete, error) {
            Log.call(Log.l.trace, pageName + ".");
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
                    var err = { status: 500, statusText: "fatal: page already deleted!" };
                    error(err);
                });
            }
            Log.ret(Log.l.trace);
            return ret;
        },

        updateLayout: function (element, viewState, lastViewState) {
            var ret = null;
            var that = this;
            /// <param name="element" domElement="true" />
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    var contentarea = element.querySelector(".contentarea");
                    if (contentarea) {
                        var width = contentarea.clientWidth;
                        var height = contentarea.clientHeight;
                        if (width !== that.prevWidth) {
                            that.prevWidth = width;
                            if (that.controller &&
                                typeof that.controller.resizeGenFragEvents === "function") {
                                that.controller.resizeGenFragEvents();
                            }
                        }
                        if (height !== that.prevHeight) {
                            that.prevHeight = height;
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
