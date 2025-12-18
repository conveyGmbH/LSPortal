// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/info/infoController.js" />

(function () {
    "use strict";
    var pageName = Application.getPagePath("crmSettings");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            // add page specific commands to AppBar
            var commandList = [
                { id: "clickBack", label: getResourceText("command.backward"), tooltip: getResourceText("tooltip.backward"), section: "primary", svg: "navigate_left" },
                { id: "clickOk", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.ok"), section: "primary", svg: "navigate_check" }
            ];
            this.controller = new CrmSettings.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            var that = this;
            Log.call(Log.l.trace, pageName + ".");

            // Save field mappings before unloading if modified
            var eventId = that.controller && that.controller.binding && that.controller.binding.eventId;

            var ret = WinJS.Promise.as().then(function () {
                if (eventId && SalesforceLeadLib && typeof SalesforceLeadLib.saveFieldMapping === "function") {
                    Log.print(Log.l.info, "Saving field mappings before unload...");
                    return SalesforceLeadLib.saveFieldMapping(eventId).then(function (saved) {
                        if (saved) {
                            Log.print(Log.l.info, "Field mappings saved successfully");
                        }
                        return WinJS.Promise.as();
                    }, function (err) {
                        Log.print(Log.l.error, "Failed to save field mappings: " + (err && err.message || err));
                        return WinJS.Promise.as(); // Continue even if save fails
                    });
                }
                return WinJS.Promise.as();
            }).then(function (response) {
                // do any page state completion
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
        }
    });
})();