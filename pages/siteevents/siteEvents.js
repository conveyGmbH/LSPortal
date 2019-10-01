// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/siteEvents/siteEventsController.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Application.SiteEventsLayout", {
        SiteEventsLayout: WinJS.Class.define(function (options) {
            this._site = null;
            this._surface = null;
        },
            {
                // This sets up any state and CSS layout on the surface of the custom layout
                initialize: function (site) {
                    this._site = site;
                    this._surface = this._site.surface;

                    // Add a CSS class to control the surface level layout
                    WinJS.Utilities.addClass(this._surface, "siteEventsLayout");

                    return WinJS.UI.Orientation.vertical;
                },

                // Reset the layout to its initial state
                uninitialize: function () {
                    WinJS.Utilities.removeClass(this._surface, "siteEventsLayout");
                    this._site = null;
                    this._surface = null;
                }
            })
    });

    var pageName = Application.getPagePath("siteevents");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            // add page specific commands to AppBar
            var commandList = [
                { id: "clickBack", label: getResourceText("command.backward"), tooltip: getResourceText("tooltip.backward"), section: "primary", svg: "navigate_left" },
                { id: "clickNewTermin", label: getResourceText("command.newTermin"), tooltip: getResourceText("tooltip.newTermin"), section: "primary", svg: "plus" },
                { id: "clickNew", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.newExhibitor"), section: "primary", svg: "plus" },
                { id: "clickReorder", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.newNachbestellungen"), section: "primary", svg: "Bestellungen" },
                { id: "clickChange", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.eventchange"), section: "primary", svg: "VA_wechsel" },
                { id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.deleteExhibitor"), section: "primary", svg: "garbage_can" },
                { id: "clickExport", label: getResourceText("command.export"), tooltip: getResourceText("tooltip.export"), section: "primary", svg: "arrow_barrier_down" },
                { id: "clickExportQrcode", label: getResourceText("command.userPwExport"), tooltip: getResourceText("tooltip.export"), section: "secondary" },
                { id: "clickExportRegistrationList", label: getResourceText("command.registrationList"), tooltip: getResourceText("tooltip.export"), section: "secondary" },
                { id: "clickExportLockedDeviceList", label: getResourceText("command.lockedDeviceList"), tooltip: getResourceText("tooltip.export"), section: "secondary" }
            ];

            this.controller = new SiteEvents.Controller(element, commandList);
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
        }
    });
})();