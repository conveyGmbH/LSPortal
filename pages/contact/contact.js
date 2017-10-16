// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/contact/contactController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("contact");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            // add page specific commands to AppBar
            var commandList = [
                { id: "clickBack", label: getResourceText("command.backward"), tooltip: getResourceText("tooltip.backward"), section: "primary", svg: "navigate_left" },
                //{ id: "clickNew", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.createNewContact"), section: "primary", svg: "user_plus" },
                { id: "clickRotateLeft", label: getResourceText("command.rotate"), tooltip: getResourceText("tooltip.rotateLeft"), section: "primary", svg: "rotate_left" },
                { id: "clickRotateRight", label: getResourceText("command.rotate"), tooltip: getResourceText("tooltip.rotateRight"), section: "primary", svg: "rotate_right" },
                { id: "clickZoomIn", label: getResourceText("command.zoomin"), tooltip: getResourceText("tooltip.zoomin"), section: "primary", svg: "zoom_in" },
                { id: "clickZoomOut", label: getResourceText("command.zoomout"), tooltip: getResourceText("tooltip.zoomout"), section: "primary", svg: "zoom_out" },
                { id: "clickForward", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.ok"), section: "primary", svg: "navigate_check", key: WinJS.Utilities.Key.enter }
                //{ id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.delete"), section: "primary", svg: "garbage_can" }
            ];
            this.controller = new Contact.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
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

        unload: function () {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to navigations away from this page.
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            var ret = null;
            var that = this;
            /// <param name="element" domElement="true" />
            Log.call(Log.l.u1, pageName + ".");
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    var docContainer = element.querySelector(".doc-container");
                    var fieldsContainer = element.querySelector(".fields-container");
                    if (that.controller && fieldsContainer && fieldsContainer.style && docContainer && docContainer.style) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight - 8;
                            var fieldWidth;
                            if (that.controller.hasDoc()) {
                                if (width > 699) {
                                    fieldWidth = width / 2 - 16;
                                } else {
                                    fieldWidth = width;
                                }
                                if (docContainer.style) {
                                    docContainer.style.display = "inline";
                                }
                            } else {
                                fieldWidth = width;
                                if (docContainer.style) {
                                    docContainer.style.display = "none";
                                }
                            }
                            var contentheader = element.querySelector(".content-header");
                            if (contentheader) {
                                height -= contentheader.clientHeight;
                            }
                            if (width !== that.prevWidth) {
                                that.prevWidth = width;
                                fieldsContainer.style.width = fieldWidth.toString() + "px";
                                docContainer.style.width = fieldWidth.toString() + "px";
                            }
                            if (height !== that.prevHeight) {
                                that.prevHeight = height;
                                docContainer.style.height = height.toString() + "px";
                            }
                            WinJS.Utilities.removeClass(element, "view-size-small");
                            WinJS.Utilities.removeClass(element, "view-size-medium-small");
                            WinJS.Utilities.removeClass(element, "view-size-medium");
                            WinJS.Utilities.removeClass(element, "view-size-bigger");
                            if (fieldWidth > 499) {
                                // remove class: view-size-small  
                                WinJS.Utilities.removeClass(fieldsContainer, "view-size-small");
                            } else {
                                // add class: view-size-small    
                                WinJS.Utilities.addClass(fieldsContainer, "view-size-small");
                            }
                            if (fieldWidth > 699) {
                                // remove class: view-size-medium-small  
                                WinJS.Utilities.removeClass(fieldsContainer, "view-size-medium-small");
                            } else {
                                // add class: view-size-medium-small    
                                WinJS.Utilities.addClass(fieldsContainer, "view-size-medium-small");
                            }
                            if (fieldWidth > 899) {
                                // remove class: view-size-medium    
                                WinJS.Utilities.removeClass(fieldsContainer, "view-size-medium");
                            } else {
                                // add class: view-size-medium
                                WinJS.Utilities.addClass(fieldsContainer, "view-size-medium");
                            }
                            if (fieldWidth > 1099) {
                                // remove class: view-size-bigger
                                WinJS.Utilities.removeClass(fieldsContainer, "view-size-bigger");
                            } else {
                                // add class: view-size-bigger
                                WinJS.Utilities.addClass(fieldsContainer, "view-size-bigger");
                            }
                            that.controller.calcImagePosition();
                        }
                    }
                    that.inResize = 0;
                });
            }
            Log.ret(Log.l.u1);
            return ret || WinJS.Promise.as();
        }
    });
})();
