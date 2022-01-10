// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/fragments/startContacts/startContactsController.js" />

(function () {
    "use strict";

    var fragmentName = Application.getFragmentPath("startContacts");

    Fragments.define(fragmentName, {
        // This function is called whenever a user navigates to this fragment. It
        // populates the fragment elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Initialize the fragment here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            this.controller = new StartContacts.Controller(element, options);
            var barcodeContainer = document.querySelector(".barcode-container");
            if (barcodeContainer) {
                Colors.loadSVGImageElements(barcodeContainer, "app-logo", { width: 50, height: 50 }, Colors.textColor);
            }
            var businesscardsContainer = document.querySelector(".businesscards-container");
            if (businesscardsContainer) {
                Colors.loadSVGImageElements(businesscardsContainer, "app-logo", { width: 50, height: 50 }, Colors.textColor);
            }
            var manuallyContainer = document.querySelector(".manually-container");
            if (manuallyContainer) {
                Colors.loadSVGImageElements(manuallyContainer, "app-logo", { width: 50, height: 50 }, Colors.textColor);
            }
            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Respond to navigations away from this page.

            this.controller = null;
            Log.ret(Log.l.trace);
        },
        updateLayout: function (element, viewState, lastViewState) {

        }
    });
})();