﻿// For an introduction to the Page Control template, see the following documentation:
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
            var commandList = [
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

            this.controller = new Sketch.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            Log.call(Log.l.trace, pageName + ".");
            var ret;
            var that = this;
            if (that.controller) {
                ret = WinJS.Promise.as().then(function (response) {
                    // called asynchronously if ok
                    // call fragment canUnload
                    var doc = that.controller.getDocViewer();
                    if (doc && doc.canUnload) {
                        doc.canUnload(complete, error);
                    } else {
                        complete(response);
                    }
                });
            } else {
                ret = WinJS.Promise.as().then(function () {
                    complete(response);
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
                    var mySketchList = element.querySelector(".listfragmenthost");
                    if (mySketchViewers) {
                        var contentarea = element.querySelector(".contentarea");
                        if (contentarea) {
                            var mySketch, i;
                            var contentHeader = element.querySelector(".content-header");
                            var width = contentarea.clientWidth;
                            var height = contentarea.clientHeight - (contentHeader ? contentHeader.clientHeight : 0);

                            if (that.controller && that.controller.binding && that.controller.binding.showList) {
                                height -= mySketchList.clientHeight;
                            }
                            if (width !== that.prevWidth) {
                                for (i = 0; i < mySketchViewers.length; i++) {
                                    mySketch = mySketchViewers[i];
                                    if (mySketch && mySketch.style) {
                                        mySketch.style.width = width.toString() + "px";
                                    }
                                }
                                that.prevWidth = width;
                            }
                            if (height !== that.prevHeight) {
                                for (i = 0; i < mySketchViewers.length; i++) {
                                    mySketch = mySketchViewers[i];
                                    if (mySketch && mySketch.style) {
                                        mySketch.style.height = height.toString() + "px";
                                    }
                                }
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





