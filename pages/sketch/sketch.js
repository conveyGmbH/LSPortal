// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/sketch/sketchController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("sketch");

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
            AppBar.commandList = [
                { id: 'clickBack', label: getResourceText('command.backward'), tooltip: getResourceText('tooltip.backward'), section: 'primary', svg: 'navigate_left' },
                //{ id: "clickNew", label: getResourceText("command.new"), tooltip: getResourceText("tooltip.new"), section: "primary", svg: "user_plus" },
                { id: 'clickForward', label: getResourceText('command.ok'), tooltip: getResourceText('tooltip.ok'), section: 'primary', svg: 'navigate_check', key: WinJS.Utilities.Key.enter },
                { id: 'clickUndo', label: getResourceText('command.undo'), tooltip: getResourceText('tooltip.undo'), section: 'primary', svg: 'undo' },
                { id: 'clickRedo', label: getResourceText('command.redo'), tooltip: getResourceText('tooltip.redo'), section: 'primary', svg: 'redo' },
                { id: 'clickDelete', label: getResourceText('command.delete'), tooltip: getResourceText('tooltip.delete'), section: 'primary', svg: 'delete' },
                { id: 'clickShapes', label: getResourceText('sketch.shape'), tooltip: getResourceText('sketch.shape'), section: 'secondary' },
                { id: 'clickColors', label: getResourceText('sketch.color'), tooltip: getResourceText('sketch.color'), section: 'secondary' },
                { id: 'clickWidths', label: getResourceText('sketch.width'), tooltip: getResourceText('sketch.width'), section: 'secondary' },
                { id: 'clickShowList', label: getResourceText('sketch.showList'), tooltip: getResourceText('sketch.showList'), section: 'primary', svg: 'elements3' }
            ];

            this.controller = new Sketch.Controller(element);
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
            Log.call(Log.l.trace, pageName + ".");
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    var mySketchViewers = element.querySelectorAll(".sketchfragmenthost");
                    if (mySketchViewers) for (var i = 0; i < mySketchViewers.length; i++) {
                        var mySketch = mySketchViewers[i];
                        if (mySketch && mySketch.style) {
                            var contentarea = element.querySelector(".contentarea");
                            if (contentarea) {
                                var contentHeader = element.querySelector(".content-header");
                                var width = contentarea.clientWidth;
                                var height = contentarea.clientHeight - (contentHeader ? contentHeader.clientHeight : 0);

                                that.prevWidth = parseInt(mySketch.style.width);
                                that.prevHeight = parseInt(mySketch.style.height);
                                
                                if (width !== that.prevWidth) {
                                    mySketch.style.width = width.toString() + "px";
                                }
                                if (height !== that.prevHeight) {
                                    mySketch.style.height = height.toString() + "px";
                                }
                            }
                        }
                    }
                    that.inResize = 0;
                });
            }
            Log.ret(Log.l.trace);
            return ret;
        }
    });

})();





