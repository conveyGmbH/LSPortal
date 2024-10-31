// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/siteHelp/siteHelpController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("siteHelp");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.

            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;
            this.prevIsDarkTheme = null;

            if (!options) {
                options = {};
            }
            options.showHalfCircle = true;

            var commandList = [];
            
            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to navigations away from this page.
            this.controller = null;
            Log.ret(Log.l.trace);
        }

        
            }
            Log.ret(Log.l.u1);
            return ret;
        }
    });
})();
