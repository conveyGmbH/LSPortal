﻿// controller for page: sketch
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/sketch/sketchService.js" />
/// <reference path="~/www/pages/sketch/svgeditor.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Sketch", {
        getClassNameOffline: function (useOffline) {
            return (useOffline ? "field_line field_line_even" : "hide-element");
        },
        
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Sketch.Controller.");
            // instanciate SVGEditor class
            var svgEditor = new SVGEditor.SVGEditorClass();
            svgEditor.registerTouchEvents();
            svgEditor.fnCreateDrawDiv();
            svgEditor.fnStartSketch();

            Application.Controller.apply(this, [pageElement, {
                dataSketch: {},
                color: svgEditor.drawcolor && svgEditor.drawcolor[0],
                width: 0,
                curSvg: false,
                curImg: false,
                showList: false
            }]);
            this.svgEditor = svgEditor;

            var that = this;

            this.dispose = function () {
                if (this.svgEditor) {
                    this.svgEditor.dispose();
                    this.svgEditor = null;
                }
            }

            // define data handling standard methods
            //@Nedra:16.10.2015 recordID is the primary key of relation Kontaktnotiz, in the update and select case
            var getRecordId = function () {
                Log.call(Log.l.trace, "Sketch.Controller.");
                var recordId = AppData.getRecordId("KontaktNotiz");
                //var recordId = Sketch._sketchView.KontaktNotizVIEWID;
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            //@Nedra:16.10.2015 in the insert case the recordId will be set
            var setRecordId = function (aRecordId) {
                Log.call(Log.l.trace, "Sketch.Controller.", "aRecordId=" + aRecordId);
                AppData.setRecordId("KontaktNotiz", aRecordId);
                Log.ret(Log.l.trace);
            }
            this.setRecordId = setRecordId;

            // check modify state
            //@Nedra:14.10.2015 modofied==true when startDrag() in sketch.js is called!
            var isModified = function () {
                Log.call(Log.l.trace, "sketchController.");
                Log.ret(Log.l.trace, that.svgEditor.modified);
                return that.svgEditor.modified;
            }
            this.isModified = isModified;

            var resultConverter = function (item) {
                Log.call(Log.l.trace, "Sketch.Controller.");
                if (item) {
                    var doc = item;
                    var isSvg = (doc.DocGroup === 3 && doc.DocFormat === 75) ? true : false;
                    var isImg = (doc.DocGroup === 1) ? true : false;
                    if (isImg) {
                        var docContent = doc.DocContentDOCCNT1;
                        if (docContent) {
                            var sub = docContent.search("\r\n\r\n");
                            item.DocContentDOCCNT1 = "data:image/jpeg;base64," + docContent.substr(sub + 4);
                        }
                        item.showImg = true;
                        that.binding.curImg = true;
                    }
                    if (isSvg) {
                        item.showSvg = true;
                        that.binding.curSvg = true;
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var loadSketch = function () {
                var recordId = that.getRecordId();
                /*var restriction;
                if (!recordId) {
                    restriction = { KontaktID: contactId };
                } else {
                    restriction = null;
                }
                if (recordId || restriction) {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select contactView...");
                    return Sketch.sketchView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "contactView: success!");
                        if (json && json.d) {
                            if (restriction) {
                                if (json.d.results && json.d.results.length > 0) {
                                    that.binding.dataSketch = json.d.results[0];
                                    that.setRecordId(that.binding.dataSketch.KontaktNotizVIEWID);
                                } else {
                                    that.binding.dataSketch = {};
                                }
                            } else {
                                that.binding.dataSketch = json.d;
                            }
                            if (typeof that.binding.dataSketch.Quelltext !== "undefined" &&
                                that.binding.dataSketch.Quelltext) {
                                Log.print(Log.l.trace, "SVG Element: " + that.binding.dataSketch.Quelltext.substr(0,100) + "...");
                            }
                            WinJS.Promise.timeout(0).then(function () {
                                that.svgEditor.fnLoadSVG(that.binding.dataSketch.Quelltext);
                            });
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId, restriction);
                } else {
                    return WinJS.Promise.as();
                }*/
                if (recordId !== null) {
                    return Sketch.sketchDocView.select(function(json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Sketch.sketchDocView: success!");
                            // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.dataSketch = json.d;
                            that.resultConverter(that.binding.dataSketch);
                            if (that.binding.dataSketch.showSvg) {
                                if (typeof that.binding.dataSketch.DocContentDOCCNT1 !== "undefined" &&
                                    that.binding.dataSketch.DocContentDOCCNT1) {
                                    Log.print(Log.l.trace,
                                        "SVG Element: " +
                                        that.binding.dataSketch.DocContentDOCCNT1.substr(0, 100) +
                                        "...");
                                }
                                WinJS.Promise.timeout(0).then(function() {
                                    that.svgEditor.fnLoadSVG(that.binding.dataSketch.DocContentDOCCNT1);
                                });
                            } else if (that.binding.dataSketch.showImg) {
                                //bind dataSketch in img div
                                var imgdiv = pageElement.getElementById("img-item");
                                imgdiv.src = that.binding.dataSketch.DocContentDOCCNT1;
                            }
                        }
                    },
                    function(errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                    recordId);
                }
                
            }
            this.loadSketch = loadSketch;

            var loadData = function () {
                Log.call(Log.l.trace, "Sketch.Controller.");
                AppData.setErrorMsg(that.binding);
                var contactId = AppData.getRecordId("Kontakt");
                var ret = new WinJS.Promise.as().then(function () {
                    /*if (!contactId) {
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
                                contactId = json.d.KontaktVIEWID;
                                AppData.setRecordId("Kontakt", contactId);
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
                        Log.print(Log.l.trace, "use existing contactID=" + contactId);
                        return WinJS.Promise.as();
                    }*/
                }).then(function () {
                    var sketchListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("sketchList"));
                    if (sketchListFragmentControl && sketchListFragmentControl.controller) {
                        return sketchListFragmentControl.controller.loadData(contactId);
                    } else {
                        var parentElement = pageElement.querySelector("#sketchlisthost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "sketchList", { contactId: contactId });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(loadSketch());
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // save data
            var saveData = function (complete, error) {
                var ret;
                Log.call(Log.l.trace, "Sketch.Controller.");
                AppData.setErrorMsg(that.binding);
                var dataSketch = that.binding.dataSketch;
                if (dataSketch.DocContentDOCCNT1 && AppBar.modified) {
                    ret = new WinJS.Promise.as().then(function() {
                        that.svgEditor.fnSaveSVG(function (quelltext) {
                            dataSketch.Quelltext = quelltext;
                            var recordId = getRecordId();
                            var doret = null;
                            if (recordId) {
                                doret = Sketch.sketchView.update(function(response) {
                                        // called asynchronously if ok
                                        Log.print(Log.l.trace, "sketchData update: success!");
                                        that.svgEditor.modified = false;
                                        complete(response);
                                    },
                                    function(errorResponse) {
                                        // called asynchronously if an error occurs
                                        // or server returns response with an error status.
                                        AppData.setErrorMsg(that.binding, errorResponse);
                                        error(errorResponse);
                                    },
                                    recordId,
                                    dataSketch);
                            }
                            return doret;
                            /*else {
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
                        });
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        complete(dataSketch);
                    });
                }
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
                /*clickRedo: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.svgEditor.fnRedoSVG(event);
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.svgEditor.fnNewSVG(event);
                    Log.ret(Log.l.trace);
                },
                clickUndo: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.svgEditor.fnUndoSVG(event);
                    Log.ret(Log.l.trace);
                },*/
                clickForward: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    Application.navigateById("start", event);
                    Log.ret(Log.l.trace);
                },
                clickShapes: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.svgEditor.toggleToolbox("shapesToolbar");
                    Log.ret(Log.l.trace);
                },
                clickColors: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.svgEditor.toggleToolbox("colorsToolbar");
                    Log.ret(Log.l.trace);
                },
                clickWidths: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.svgEditor.toggleToolbox("widthsToolbar");
                    Log.ret(Log.l.trace);
                },
                // Eventhandler for tools
                clickTool: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    var tool = event.currentTarget;
                    if (tool && tool.id) {
                        if (tool.id.length > 4) {
                            var toolNo = tool.id.substr(4);
                            Log.print(Log.l.trace, "selected tool:" + tool.id + " with no=" + toolNo);
                            that.svgEditor.fnSetShape(parseInt(toolNo));
                        } //else {
                        that.svgEditor.hideToolbox("shapesToolbar");
                        that.svgEditor.registerTouchEvents();
                        //}
                    }
                    Log.ret(Log.l.trace);
                },
                // Eventhandler for colors
                clickColor: function (event){
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    var color = event.currentTarget;
                    if (color && color.id) {
                        if (color.id.length > 10) {
                            var colorNo = color.id.substr(10); // color tags
                            var nColorNo = parseInt(colorNo);
                            that.binding.color = that.svgEditor.drawcolor[nColorNo];
                            Log.print(Log.l.trace, "selected color:" + color.id + " with no=" + colorNo + " color=" + that.binding.color);
                            that.svgEditor.fnSetColor(nColorNo);
                        } //else {
                        that.svgEditor.hideToolbox("colorsToolbar");
                        that.svgEditor.registerTouchEvents();
                        //}
                    }
                    Log.ret(Log.l.trace);
                },
                clickWidth: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.", "selected width=" + that.binding.width);
                    that.svgEditor.hideToolbox("widthsToolbar");
                    that.svgEditor.registerTouchEvents();
                    Log.ret(Log.l.trace);
                },
                clickShowList: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.binding.showList = (that.binding.showList === false) ? true : false;
                    //resize sketch to show list
                    var mySketch = pageElement.querySelector("#svgsketch");
                    var prevheight = mySketch.style.height;
                    if (mySketch && mySketch.style) {
                        if (that.binding.showList) {
                            mySketch.style.height = (parseInt(prevheight) - 150) + "px";
                        } else {
                            mySketch.style.height = (parseInt(prevheight) + 150) + "px";
                        }
                    }
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
                /*clickUndo: function () {
                    if (that.svgEditor && that.svgEditor.fnCanUndo()) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickRedo: function () {
                    if (that.svgEditor && that.svgEditor.fnCanRedo()) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (that.svgEditor && that.svgEditor.fnCanNew()) {
                        return false;
                    } else {
                        return true;
                    }
                },*/
                clickForward: function () {
                    // never disable!
                    return false;
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

