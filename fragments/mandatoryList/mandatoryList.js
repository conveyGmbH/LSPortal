﻿// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/fragments/mandatoryList/mandatoryListController.js" />

(function () {
    "use strict";

    var fragmentName = Application.getFragmentPath("mandatoryList");
    var inResize = 0;

    Fragments.define(fragmentName, {
        // This function is called whenever a user navigates to this fragment. It
        // populates the fragment elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Initialize the fragment here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            this.controller = new MandatoryList.Controller(element, options);

            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Respond to navigations away from this page.

            this.controller = null;
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            Log.call(Log.l.trace, fragmentName + ".");
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
                    var err = { status: 500, statusText: "fatal: fragment already deleted!" };
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
            Log.call(Log.l.u1, fragmentName + ".");
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(100).then(function () {
                    var win_single_itemsblock = element.querySelector("#mandatoryList .win-single-itemsblock");
                    var win_itemscontainer = element.querySelector("#mandatoryList .win-itemscontainer");/*#mandatoryList.listview*/
                    if (win_itemscontainer && win_itemscontainer.style) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight;
                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                win_itemscontainer.style.width = width.toString() + "px";
                            }
                            /*if (height !== that.prevHeight) {
                                that.prevHeight = height;
                                empList.style.height = height.toString() + "px";
                            }*/
                        }
                    }
                    if (win_single_itemsblock && win_single_itemsblock.style) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight;
                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                win_single_itemsblock.style.width = width.toString() + "px";
                            }
                            /*if (height !== that.prevHeight) {
                                that.prevHeight = height;
                                empList.style.height = height.toString() + "px";
                            }*/
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