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
        
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Sketch.Controller.");
            var docViewer = null;
            var that = this;
            
            Application.Controller.apply(this, [pageElement, {
                showSvg: false,
                showPhoto: false,
                showList: false,
                moreNotes: false,
                userHidesList: false
            }, commandList]);

            this.contactId = AppData.getRecordId("Kontakt");
            this.pageElement = pageElement;

            var setNotesCount = function(count) {
                Log.call(Log.l.trace, "Sketch.Controller.", "count=" + count);
                if (count > 1) {
                    that.binding.moreNotes = true;
                } else {
                    that.binding.moreNotes = false;
                }
                if (!that.binding.userHidesList) {
                    that.binding.showList = that.binding.moreNotes;
                }
                AppBar.replaceCommands([
                    { id: 'clickShowList', label: getResourceText('sketch.showList'), tooltip: getResourceText('sketch.showList'), section: 'primary', svg: that.binding.showList ? 'document_height' : 'elements3' }
                ]);
                Log.ret(Log.l.trace);
            }
            that.setNotesCount = setNotesCount;

            var getDocViewer = function (docGroup, docFormat) {
                Log.call(Log.l.trace, "Sketch.Controller.", "docGroup=" + docGroup + " docFormat=" + docFormat);
                docViewer = null;
                if (AppData.isSvg(docGroup, docFormat)) {
                    that.binding.showSvg = true;
                    that.binding.showPhoto = false;
                    docViewer = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("svgSketch"));
                } else if (AppData.isImg(docGroup, docFormat)) {
                    that.binding.showSvg = false;
                    that.binding.showPhoto = true;
                    docViewer = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("imgSketch"));
                }
                Log.ret(Log.l.trace);
                return docViewer;
            }
            that.docViewer = {
                get: function() {
                    return docViewer;
                }
            }

            var loadDoc = function (noteId, docGroup, docFormat) {
                var ret;
                var parentElement;
                Log.call(Log.l.trace, "Sketch.Controller.", "noteId=" + noteId + " docGroup=" + docGroup + " docFormat=" + docFormat);
                getDocViewer(docGroup, docFormat);
                if (docViewer && docViewer.controller) {
                    ret = docViewer.controller.loadData(noteId);
                } else if (AppData.isSvg(docGroup, docFormat)) {
                    that.binding.showSvg = true;
                    that.binding.showPhoto = false;
                    parentElement = pageElement.querySelector("#svghost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "svgSketch", { noteId: noteId });
                    } else {
                        ret = WinJS.Promise.as();
                    }
                } else if (AppData.isImg(docGroup, docFormat)) {
                    that.binding.showSvg = false;
                    that.binding.showPhoto = true;
                    parentElement = pageElement.querySelector("#imghost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "imgSketch", { noteId: noteId });
                    } else {
                        ret = WinJS.Promise.as();
                    }
                } else {
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }

            var loadData = function (noteId, docGroup, docFormat) {
                Log.call(Log.l.trace, "Sketch.Controller.", "noteId=" + noteId + " docGroup=" + docGroup + " docFormat=" + docFormat);
                AppData.setErrorMsg(that.binding);
                that.contactId = AppData.getRecordId("Kontakt");
                var ret = new WinJS.Promise.as().then(function () {
                    //load list first -> noteId, showSvg, showPhoto, moreNotes set
                    if (!noteId) {
                        var sketchListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("sketchList"));
                        if (sketchListFragmentControl && sketchListFragmentControl.controller) {
                            return sketchListFragmentControl.controller.loadData(that.contactId);
                        } else {
                            var parentElement = pageElement.querySelector("#listhost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement,"sketchList",{ contactId: that.contactId });
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    } else {
                        return loadDoc(noteId, docGroup, docFormat);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;
            
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
                clickForward: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    Application.navigateById("contact", event);
                    Log.ret(Log.l.trace);
                },
                clickShowList: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    that.binding.showList = !that.binding.showList;
                    that.binding.userHidesList = !that.binding.showList;
                    if (pageElement.winControl) {
                        pageElement.winControl.prevHeight = 0;
                        pageElement.winControl.prevWidth = 0;
                    }
                    AppBar.replaceCommands([
                        { id: 'clickShowList', label: getResourceText('sketch.showList'), tooltip: getResourceText('sketch.showList'), section: 'primary', svg: that.binding.showList ? 'document_height' : 'elements3' }
                    ]);
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
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();

