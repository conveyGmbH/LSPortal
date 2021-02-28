// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/fragments/uploadMedia/uploadMediaController.js" />

(function () {
    "use strict";

    var fragmentName = Application.getFragmentPath("uploadMedia");

    Fragments.define(fragmentName, {
        // This function is called whenever a user navigates to this fragment. It
        // populates the fragment elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Initialize the fragment here.

            var commandList = [
                { id: "clickUpload", label: getResourceText("command.upload"), tooltip: getResourceText("eventMediaAdministration.FileUpload"), section: "primary", svg: "cloud_upload" }
            ];
            // add page specific commands to AppBar
            this.controller = new UploadMedia.Controller(element, options, commandList);

            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Respond to navigations away from this page.
            this.controller = null;
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            Log.call(Log.l.u1, fragmentName + ".");
            // TODO: Respond to changes in viewState.
            Log.ret(Log.l.u1);
        }
    });
})();