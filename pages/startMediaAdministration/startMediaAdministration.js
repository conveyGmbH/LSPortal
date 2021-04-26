// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/startMediaAdministration/startMediaAdministrationController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("startMediaAdministration");

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
                { id: 'clickBack', label: getResourceText('command.backward'), tooltip: getResourceText('tooltip.backward'), section: 'primary', svg: 'navigate_left' },
                { id: "clickNew", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.newEventMedien"), section: "primary", svg: "plus" },
                { id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.delete"), section: "primary", svg: "garbage_can" },
                { id: 'clickShowList', label: getResourceText('sketch.showList'), tooltip: getResourceText('sketch.showList'), section: 'primary', svg: 'elements3' },
                { id: 'clickForward', label: getResourceText('command.ok'), tooltip: getResourceText('tooltip.ok'), section: 'primary', svg: 'navigate_check', key: WinJS.Utilities.Key.enter }
            ];

            this.controller = new StartMediaAdministration.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            var ret;
            Log.call(Log.l.trace, pageName + ".");
            if (this.controller) {
                ret = this.controller.saveData(function (response) {
                    // called asynchronously if ok
                    complete(response);
                }, function (errorResponse) {
                    error(errorResponse);
                });
            } else {
                ret = WinJS.Promise.as();
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
            Log.call(Log.l.trace, pageName + ".");
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    var i, myDocFragment;
                    var myTextUsage = element.querySelector(".seriesTextUsagefragmenthost");
                    var myMediaContainer = element.querySelector(".media-container");
                    var myDocFragments = element.querySelectorAll(".docfragmenthost");
                    var myTextFragment = element.querySelector(".textfragmenthost");
                    var myMediaList = element.querySelector(".listfragmenthost");
                    if (myMediaContainer && myTextUsage && myMediaList && myDocFragments && myTextFragment) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var bHalfSize = false;
                            var contentHeader = element.querySelector(".content-header");
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight - (contentHeader ? contentHeader.clientHeight : 0);

                            if (width > Application.maxViewSize.mediumSmall) {
                                bHalfSize = true;
                            }
                            height -= myTextUsage.clientHeight;
                            if (that.controller && that.controller.binding && that.controller.binding.showList) {
                                height -= myMediaList.clientHeight;
                            }
                            if (width !== that.prevWidth || height !== that.prevHeight) {
                                if (myMediaContainer.style) {
                                    myMediaContainer.style.width = width.toString() + "px";
                                    myMediaContainer.style.height = height.toString() + "px";
                                    WinJS.Utilities.removeClass(element, "view-size-small");
                                    WinJS.Utilities.removeClass(element, "view-size-medium-small");
                                    WinJS.Utilities.removeClass(element, "view-size-medium");
                                    WinJS.Utilities.removeClass(element, "view-size-bigger");
                                    if (width > Application.maxViewSize.small) {
                                        // remove class: view-size-small  
                                        WinJS.Utilities.removeClass(myTextUsage, "view-size-small");
                                    } else {
                                        // add class: view-size-small    
                                        WinJS.Utilities.addClass(myTextUsage, "view-size-small");
                                    }
                                    if (width > Application.maxViewSize.mediumSmall) {
                                        // remove class: view-size-medium-small  
                                        WinJS.Utilities.removeClass(myTextUsage, "view-size-medium-small");
                                    } else {
                                        // add class: view-size-medium-small    
                                        WinJS.Utilities.addClass(myTextUsage, "view-size-medium-small");
                                    }
                                    if (width > Application.maxViewSize.medium) {
                                        // remove class: view-size-medium    
                                        WinJS.Utilities.removeClass(myTextUsage, "view-size-medium");
                                    } else {
                                        // add class: view-size-medium
                                        WinJS.Utilities.addClass(myTextUsage, "view-size-medium");
                                    }
                                    if (width > Application.maxViewSize.bigger) {
                                        // remove class: view-size-bigger
                                        WinJS.Utilities.removeClass(myTextUsage, "view-size-bigger");
                                    } else {
                                        // add class: view-size-bigger
                                        WinJS.Utilities.addClass(myTextUsage, "view-size-bigger");
                                    }
                                    if (bHalfSize) {
                                        myMediaContainer.style.overflowY = "hidden";
                                        if (myTextFragment.style) {
                                            myTextFragment.style.left = "0";
                                            myTextFragment.style.top = "0";
                                            myTextFragment.style.width = "50%";
                                            myTextFragment.style.height = "100%";
                                        }
                                        for (i = 0; i < myDocFragments.length; i++) {
                                            myDocFragment = myDocFragments[i];
                                            if (myDocFragment && myDocFragment.style) {
                                                myDocFragment.style.left = "50%";
                                                myDocFragment.style.top = "0";
                                                myDocFragment.style.width = "50%";
                                                myDocFragment.style.height = "100%";
                                            }
                                        }
                                    } else {
                                        myMediaContainer.style.overflowY = "auto";
                                        for (i = 0; i < myDocFragments.length; i++) {
                                            myDocFragment = myDocFragments[i];
                                            if (myDocFragment && myDocFragment.style) {
                                                myDocFragment.style.left = "0";
                                                myDocFragment.style.top = "0";
                                                myDocFragment.style.width = "100%";
                                                myDocFragment.style.height = "370px";
                                            }
                                        }
                                        if (myTextFragment.style) {
                                            myTextFragment.style.left = "0";
                                            myTextFragment.style.top = "370px";
                                            myTextFragment.style.width = "100%";
                                            myTextFragment.style.height = "";
                                        }
                                    }
                                    if (myTextFragment.clientWidth > Application.maxViewSize.small) {
                                        // remove class: view-size-small  
                                        WinJS.Utilities.removeClass(myTextFragment, "view-size-small");
                                    } else {
                                        // add class: view-size-small    
                                        WinJS.Utilities.addClass(myTextFragment, "view-size-small");
                                    }
                                    if (myTextFragment.clientWidth > Application.maxViewSize.mediumSmall) {
                                        // remove class: view-size-medium-small  
                                        WinJS.Utilities.removeClass(myTextFragment, "view-size-medium-small");
                                    } else {
                                        // add class: view-size-medium-small    
                                        WinJS.Utilities.addClass(myTextFragment, "view-size-medium-small");
                                    }
                                    if (myTextFragment.clientWidth > Application.maxViewSize.medium) {
                                        // remove class: view-size-medium    
                                        WinJS.Utilities.removeClass(myTextFragment, "view-size-medium");
                                    } else {
                                        // add class: view-size-medium
                                        WinJS.Utilities.addClass(myTextFragment, "view-size-medium");
                                    }
                                    if (myTextFragment.clientWidth > Application.maxViewSize.bigger) {
                                        // remove class: view-size-bigger
                                        WinJS.Utilities.removeClass(myTextFragment, "view-size-bigger");
                                    } else {
                                        // add class: view-size-bigger
                                        WinJS.Utilities.addClass(myTextFragment, "view-size-bigger");
                                    }
                                }
                                that.prevWidth = width;
                                that.prevHeight = height;
                            }
                        }
                    }
                    that.inResize = 0;
                });
            }
            Log.ret(Log.l.trace);
            return ret || WinJS.Promise.as();
        }
    });

})();





