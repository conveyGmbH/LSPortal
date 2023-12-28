// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/fragments/userMessages/userMessagesController.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("UserMessages.ListLayout", {
        MessagesLayout: WinJS.Class.define(function (options) {
            this._site = null;
            this._surface = null;
        },
        {
            // This sets up any state and CSS layout on the surface of the custom layout
            initialize: function (site) {
                this._site = site;
                this._surface = this._site.surface;

                // Add a CSS class to control the surface level layout
                WinJS.Utilities.addClass(this._surface, "messagesLayout");

                return WinJS.UI.Orientation.vertical;
            },

            // Reset the layout to its initial state
            uninitialize: function () {
                WinJS.Utilities.removeClass(this._surface, "messagesLayout");
                this._site = null;
                this._surface = null;
            }
        })
    });


    var fragmentName = Application.getFragmentPath("userMessages");
    var inResize = 0;

    Fragments.define(fragmentName, {
        // This function is called whenever a user navigates to this fragment. It
        // populates the fragment elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Initialize the fragment here.
            inResize = 0;

            var commandList;
            if (!AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic) {
                commandList = [];
            } else {
                commandList = [
                    { id: "clickSendMessage", label: getResourceText("command.sendMessage"), tooltip: getResourceText("tooltip.sendMessage"), section: "primary", svg: "paper_jet2" }
                ];
            }
            this.controller = new UserMessages.Controller(element, commandList, options);

            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Respond to navigations away from this page.

            this.controller = null;
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            Log.call(Log.l.u1, fragmentName + ".");
            // TODO: Respond to changes in viewState.

            Log.ret(Log.l.u1);
        }
    });
})();