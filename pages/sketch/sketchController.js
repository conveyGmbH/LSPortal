// controller for page: sketch
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/sketch/sketchService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Sketch", {
        getClassNameOffline: function (useOffline) {
            return (useOffline ? "field_line field_line_even" : "hide-element");
        },
        
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Sketch.Controller.");

            var that = this;
            
            Application.Controller.apply(this, [pageElement, {
                showSvg: false,
                showPhoto: false,
                showList: false,
                moreNotes: false
            }]);

            this.contactId = 0;
            this.noteId = 0;

            var getSvgFragmentController = function () {
                var ret;
                Log.call(Log.l.trace, "Sketch.Controller.");
                ret = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("svgSketch"));
                if (ret) {
                    ret = ret.controller;
                }
                Log.ret(Log.l.trace);
                return ret;
            }

            // check modify state
            // modified==true when startDrag() in svg.js is called!
            var isModified = function () {
                Log.call(Log.l.trace, "svgSketchController.");
                var ret;
                var svgFragmentController = getSvgFragmentController();
                if (svgFragmentController) {
                    ret = svgFragmentController.isModified();
                } else ret = false;
                Log.ret(Log.l.trace);
                return ret;
            }
            this.isModified = isModified;


            var loadData = function () {
                Log.call(Log.l.trace, "Sketch.Controller.");
                AppData.setErrorMsg(that.binding);
                that.contactId = AppData.getRecordId("Kontakt");
                var ret = new WinJS.Promise.as().then(function () {
                    /*if (!that.contactId) {
                        var newContact = {
                            HostName: (window.device && window.device.uuid),
                            MitarbeiterID: AppData.getRecordId("Mitarbeiter"),
                            VeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            Nachbearbeitet: 1
                        };
                        Log.print(Log.l.trace, "insert new contactView for MitarbeiterID=" + newContact.MitarbeiterID);
                        AppData.setErrorMsg(that.binding);
                        return Sketch.contactView.insert(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "contactView: success!");
                            // contactData returns object already parsed from json file in response
                            if (json && json.d) {
                                that.contactId = json.d.KontaktVIEWID;
                                AppData.setRecordId("Kontakt", that.contactId);
                                AppData.getUserData();
                            } else {
                                AppData.setErrorMsg(that.binding, { status: 404, statusText: "no data found" });
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, newContact);
                    } else {
                        Log.print(Log.l.trace, "use existing that.contactID=" + that.contactId);
                        return WinJS.Promise.as();
                    }*/
                }).then(function () {
                    //load list first -> noteId, showSvg, showPhoto, moreNotes set
                    var sketchListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("sketchList"));
                    if (sketchListFragmentControl && sketchListFragmentControl.controller) {
                        return sketchListFragmentControl.controller.loadData(that.contactId);
                    } else {
                        var parentElement = pageElement.querySelector("#listhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "sketchList", { contactId: that.contactId });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    if (that.binding.showSvg) {
                        var svgFragmentController = getSvgFragmentController();
                        if (svgFragmentController) {
                            return svgFragmentController.loadData(that.noteId);
                        } else {
                            var parentElement = pageElement.querySelector("#svghost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "svgSketch", { noteId: that.noteId });
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    } else return WinJS.Promise.as();
                }).then(function () {
                    if (that.binding.showPhoto) {
                        var imgFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("imgSketch"));
                        if (imgFragmentControl && imgFragmentControl.controller) {
                            return imgFragmentControl.controller.loadData(that.noteId);
                        } else {
                            var parentElement = pageElement.querySelector("#imghost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "imgSketch", { noteId: that.noteId });
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    } else return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
            }
            this.loadData = loadData;
            
            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Sketch.Controller.");
                var ret = null;
                AppData.setErrorMsg(that.binding);
                if (that.noteId !== 0) {
                    ret = new WinJS.Promise.as().then(function() {
                        var svgFragmentController = getSvgFragmentController();
                        var doret;
                        if (svgFragmentController) {
                            svgFragmentController.saveData(function() {
                                    Log.print(Log.l.trace, "saveData completed...");
                                    doret = complete();
                                },
                                function(errorResponse) {
                                    Log.print(Log.l.error, "saveData error...");
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                    doret = error();
                                });
                        } else {
                            doret = complete();
                        }
                        return doret;
                    });
                } /*else {
                                //insert if a primary key is not available (getRecordId() == null)
                                dataSketch.KontaktID = AppData.getRecordId("Kontakt");
                                dataSketch.ExecAppTypeID = 15; // SVG note
                                if (!dataSketch.KontaktID) {
                                    return new WinJS.Promise.as().then(function () {
                                        var errorResponse = {
                                            status: -1,
                                            statusText: "missing recordId for table Kontakt"
                                        }
                                        AppData.setErrorMsg(that.binding, errorResponse);
                                        error(errorResponse);
                                    });
                                } else {
                                    return Sketch.sketchView.insert(function (json) {
                                        // this callback will be called asynchronously
                                        // when the response is available
                                        Log.print(Log.l.trace, "sketchData insert: success!");
                                        // contactData returns object already parsed from json file in response
                                        if (json && json.d) {
                                            that.binding.dataSketch = json.d;
                                            setRecordId(that.binding.dataSketch.KontaktNotizVIEWID);
                                            if (typeof that.binding.dataSketch.Quelltext !== "undefined" &&
                                                that.binding.dataSketch.Quelltext) {
                                                Log.print(Log.l.trace, "SVG Element: " + that.binding.dataSketch.Quelltext.substr(0, 100) + "...");
                                            }
                                            WinJS.Promise.timeout(0).then(function () {
                                                that.svgEditor.fnLoadSVG(that.binding.dataSketch.Quelltext);
                                            });
                                        }
                                        complete(json);
                                    }, function (errorResponse) {
                                        // called asynchronously if an error occurs
                                        // or server returns response with an error status.
                                        AppData.setErrorMsg(that.binding, errorResponse);
                                        error(errorResponse);
                                    }, dataSketch);
                                }
                            }*/
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    Application.navigateById(Application.navigateNewId, event);
                    Log.ret(Log.l.trace);
                },
                clickRedo: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickRedo(event);
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickDelete(event);
                    Log.ret(Log.l.trace);
                },
                clickUndo: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickUndo(event);
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    Application.navigateById("start", event);
                    Log.ret(Log.l.trace);
                },
                clickShapes: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickShapes(event);
                    Log.ret(Log.l.trace);
                },
                clickColors: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickColors(event);
                    Log.ret(Log.l.trace);
                },
                clickWidths: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickWidths(event);
                    Log.ret(Log.l.trace);
                },
                // Eventhandler for tools
                clickTool: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickTool(event);
                    Log.ret(Log.l.trace);
                },
                // Eventhandler for colors
                clickColor: function (event){
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickColor(event);
                    Log.ret(Log.l.trace);
                },
                clickWidth: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.", "selected width=" + that.binding.width);
                    if (getSvgFragmentController()) getSvgFragmentController().eventHandlers.clickWidth(event);
                    Log.ret(Log.l.trace);
                },
                clickShowList: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.binding.showList = (that.binding.showList === false) ? true : false;
                    pageElement.winControl.updateLayout(pageElement);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickNew: function () {
                    if (that.binding.generalData.contactId) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickUndo: function () {
                    if (that.binding.showSvg && getSvgFragmentController()) {
                        return getSvgFragmentController().disableHandlers.clickUndo();
                    } else {
                        return true;
                    }
                },
                clickRedo: function () {
                    if (that.binding.showSvg && getSvgFragmentController()) {
                        return getSvgFragmentController().disableHandlers.clickRedo();
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (that.binding.showSvg && getSvgFragmentController()) {
                        return getSvgFragmentController().disableHandlers.clickDelete();
                    } else {
                        return true;
                    }
                },
                clickForward: function () {
                    // never disable!
                    return false;
                },
                clickShowList: function () {
                    if (that.binding.moreNotes) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            // finally, load the data
            that.processAll().then(function() {
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

