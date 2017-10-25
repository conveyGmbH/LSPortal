// controller for page: svgSketch
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/svgSketch/svgSketchService.js" />
/// <reference path="~/www/fragments/svgSketch/svgeditor.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SvgSketch", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "SvgSketch.Controller.");

            // instanciate SVGEditor class
            var svgEditor = new SVGEditor.SVGEditorClass();
            svgEditor.fnCreateDrawDiv();
            svgEditor.fnStartSketch();

            this.svgEditor = svgEditor;

            Fragments.Controller.apply(this, [fragmentElement, {
                noteId: options.noteId,
                
                dataSketch: {},
                color: svgEditor.drawcolor && svgEditor.drawcolor[0],
                width: 0
            }, commandList]);

            var that = this;

            this.dispose = function () {
                if (this.svgEditor) {
                    this.svgEditor.dispose();
                    this.svgEditor = null;
                }
            }

            var resultConverter = function (item) {
                Log.call(Log.l.trace, "SvgSketch.Controller.");
                if (item) {
                    item.ExecAppTypeID = 15;
                    item.Quelltext = item.DocContentDOCCNT1;
                    item.DocContentDOCCNT1 = null;
                }
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var showSvgAfterResize = function () {
                Log.call(Log.l.trace, "SvgSketch.Controller.");
                var fragmentControl = fragmentElement.winControl;
                if (fragmentControl && fragmentControl.updateLayout) {
                    fragmentControl.prevWidth = 0;
                    fragmentControl.prevHeight = 0;
                    var promise = fragmentControl.updateLayout.call(fragmentControl, fragmentElement) || WinJS.Promise.as();
                    promise.then(function () {
                        that.svgEditor.fnLoadSVG(that.binding.dataSketch.Quelltext);
                    });
                }
                Log.ret(Log.l.trace);
            }

            var loadData = function (noteId) {
                Log.call(Log.l.trace, "SvgSketch.Controller.");
                AppData.setErrorMsg(that.binding);
                if (noteId) {
                    that.binding.noteId = noteId;
                }
                var ret = new WinJS.Promise.as().then(function () {
                    var doret = null;
                    if (that.binding.noteId !== null) {
                        doret = SvgSketch.sketchDocView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "SvgSketch.sketchDocView: success!");
                                // select returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.resultConverter(json.d);
                                    that.binding.dataSketch = json.d;
                                    if (typeof that.binding.dataSketch.Quelltext !== "undefined" &&
                                        that.binding.dataSketch.Quelltext) {
                                        Log.print(Log.l.trace,
                                            "SVG Element: " +
                                            that.binding.dataSketch.Quelltext.substr(0, 100) +
                                            "...");
                                    }
                                    showSvgAfterResize();
                                }
                            },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            that.binding.noteId);
                    }
                    return doret;
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // finally, load the data
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



