﻿// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/login/loginController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("login");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app"s data.
        ready: function(element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            var splitviewPaneWrapper = document.querySelector(".win-splitview-panewrapper");
            if (splitviewPaneWrapper && splitviewPaneWrapper.style) {
                splitviewPaneWrapper.style.width = "0";
                splitviewPaneWrapper.style.maxWidth = "0";
            }
            NavigationBar.enablePage("home");
            NavigationBar.disablePage("localevents");
            NavigationBar.disablePage("siteevents");
            NavigationBar.disablePage("events");
            NavigationBar.disablePage("questionList");
            NavigationBar.disablePage("mailing");
            NavigationBar.disablePage("employee");
            NavigationBar.disablePage("contacts");
            NavigationBar.disablePage("reporting");
            NavigationBar.disablePage("infodesk");
            NavigationBar.disablePage("settings");
            NavigationBar.disablePage("info");
            NavigationBar.disablePage("search");
            NavigationBar.disablePage("support");

            // add page specific commands to AppBar
            var commandList = [
                { id: "clickOk", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.ok"), section: "primary", svg: "navigate_check", key: WinJS.Utilities.Key.enter },
                { id: 'clickAccount', label: getResourceText('start.buttonAccount'), tooltip: getResourceText('start.buttonAccount'), section: 'secondary' }
            ];
            this.controller = new Login.Controller(element, commandList);
            Log.ret(Log.l.trace);
        },

        canUnload: function(complete, error) {
            Log.call(Log.l.trace, pageName + ".");
            var ret;
            if (this.controller) {
                ret = this.controller.saveData(function (response) {
                    // called asynchronously if ok
                    var splitviewPaneWrapper = document.querySelector(".win-splitview-panewrapper");
                    if (splitviewPaneWrapper && splitviewPaneWrapper.style) {
                        splitviewPaneWrapper.style.width = "";
                        splitviewPaneWrapper.style.maxWidth = "";
                    }
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

        unload: function() {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to navigations away from this page.
            Log.ret(Log.l.trace);
        },

        updateLayout: function(element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
        }
    });
})();