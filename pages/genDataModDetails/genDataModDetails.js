﻿// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/genDataModDetails/genDataModDetailsController.js" />
(function () {
    "use strict";

    var pageName = Application.getPagePath("genDataModDetails");

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
                { id: "clickOpenNewMod", label: getResourceText("command.newmod"), tooltip: getResourceText("tooltip.newmod"), section: "primary", svg: "plus" },
                { id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.deletemod"), section: "primary", svg: "garbage_can" },
                { id: "clickSave", label: getResourceText("command.save"), tooltip: getResourceText("tooltip.save"), section: "primary", svg: "navigate_check" }//, key: WinJS.Utilities.Key.enter
            ];
            this.controller = new GenDataModDetails.Controller(element, commandList);
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
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
        }
    });
})();
