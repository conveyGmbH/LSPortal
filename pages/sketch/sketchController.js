﻿// controller for page: sketch
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Sketch", {
        getClassNameOffline: function (useOffline) {
            return (useOffline ? "field_line field_line_even" : "hide-element");
        },
        
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Sketch.Controller.");
            var that = this;
            
            Application.Controller.apply(this, [pageElement, {
                showSvg: false,
                showPhoto: false,
                showAudio: false,
                showList: false,
                moreNotes: false,
                userHidesList: false,
                contactId: AppData.getRecordId("Kontakt")
            }, commandList]);

            this.pageElement = pageElement;
            this.docViewer = null;

            var setNotesCount = function(count) {
                Log.call(Log.l.trace, "Sketch.Controller.", "count=" + count);
                if (count > 1) {
                    that.binding.moreNotes = true;
                } else {
                    that.binding.moreNotes = false;
                    if (!count) {
                        that.binding.showSvg = false;
                        that.binding.showPhoto = false;
                        that.binding.showAudio = false;
                    }
                }
                if (that.binding.userHidesList) {
                    that.binding.showList = false;
                } else {
                    that.binding.showList = that.binding.moreNotes;
                }
                AppBar.replaceCommands([
                    { id: 'clickShowList', label: !that.binding.showList ? getResourceText('sketch.showList') : getResourceText('sketch.hideList'), tooltip: !that.binding.showList ? getResourceText('sketch.showList') : getResourceText('sketch.hideList'), section: 'primary', svg: that.binding.showList ? 'document_height' : 'elements3' }
                ]);
                Log.ret(Log.l.trace);
            }
            that.setNotesCount = setNotesCount;

            var getDocViewer = function (docGroup, docFormat) {
                var docViewer;
                Log.call(Log.l.trace, "Sketch.Controller.", "docGroup=" + docGroup + " docFormat=" + docFormat);
                if (AppData.isSvg(docGroup, docFormat)) {
                    that.binding.showSvg = true;
                    that.binding.showPhoto = false;
                    that.binding.showAudio = false;
                    docViewer = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("svgSketch"));
                } else if (AppData.isImg(docGroup, docFormat)) {
                    that.binding.showPhoto = true;
                    that.binding.showSvg = false;
                    that.binding.showAudio = false;
                    docViewer = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("imgSketch"));
                } else if (AppData.isAudio(docGroup, docFormat)) {
                    that.binding.showAudio = true;
                    that.binding.showSvg = false;
                    that.binding.showPhoto = false;
                    docViewer = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("wavSketch"));
                } else {
                    docViewer = null;
                }
                Log.ret(Log.l.trace);
                return docViewer;
            }

            var prevNoteId;
            var inLoadDoc = false;
            var loadDoc = function (noteId, docGroup, docFormat) {
                var ret;
                var parentElement;
                Log.call(Log.l.trace, "Sketch.Controller.", "noteId=" + noteId + " docGroup=" + docGroup + " docFormat=" + docFormat);
                // prevent recursive calls here!
                if (inLoadDoc) {
                    if (noteId === prevNoteId) {
                        Log.print(Log.l.trace, "extra ignored");
                        ret = WinJS.Promise.as();
                    } else {
                        Log.print(Log.l.trace, "busy - try later again");
                        ret = WinJS.Promise.timeout(50).then(function () {
                            return loadDoc(noteId, docGroup, docFormat);
                        });
                    }
                } else {
                    // set semaphore
                    inLoadDoc = true;
                    prevNoteId = noteId;
                    // check for need of command update in AppBar
                    var bGetNewDocViewer = false;
                    var bUpdateCommands = false;
                    var prevDocViewer = that.docViewer;
                    var newDocViewer = getDocViewer(docGroup, docFormat);
                    if (newDocViewer && newDocViewer.controller) {
                        Log.print(Log.l.trace, "found docViewer!");
                        that.docViewer = newDocViewer;
                        bUpdateCommands = true;
                        ret = that.docViewer.controller.loadData(noteId);
                    } else if (AppData.isSvg(docGroup, docFormat)) {
                        that.binding.showSvg = true;
                        that.binding.showPhoto = false;
                        that.binding.showAudio = false;
                        Log.print(Log.l.trace, "load new svgSketch!");
                        parentElement = pageElement.querySelector("#svghost");
                        if (parentElement) {
                            bGetNewDocViewer = true;
                            bUpdateCommands = true;
                            ret = Application.loadFragmentById(parentElement, "svgSketch", { noteId: noteId, isLocal: false });
                        } else {
                            ret = WinJS.Promise.as();
                        }
                    } else if (AppData.isImg(docGroup, docFormat)) {
                        that.binding.showPhoto = true;
                        that.binding.showSvg = false;
                        that.binding.showAudio = false;
                        Log.print(Log.l.trace, "load new imgSketch!");
                        parentElement = pageElement.querySelector("#imghost");
                        if (parentElement) {
                            bGetNewDocViewer = true;
                            bUpdateCommands = true;
                            ret = Application.loadFragmentById(parentElement, "imgSketch", { noteId: noteId, isLocal: false });
                        } else {
                            ret = WinJS.Promise.as();
                        }
                    } else if (AppData.isAudio(docGroup, docFormat)) {
                        that.binding.showAudio = true;
                        that.binding.showSvg = false;
                        that.binding.showPhoto = false;
                        Log.print(Log.l.trace, "load new wavSketch!");
                        parentElement = pageElement.querySelector("#wavhost");
                        if (parentElement) {
                            bGetNewDocViewer = true;
                            bUpdateCommands = true;
                            ret = Application.loadFragmentById(parentElement, "wavSketch", { noteId: noteId, isLocal: false });
                        } else {
                            ret = WinJS.Promise.as();
                        }
                    } else {
                        ret = WinJS.Promise.as();
                    }
                    // do command update if needed
                    ret = ret.then(function () {
                        if (bUpdateCommands) {
                            if (bGetNewDocViewer) {
                                that.docViewer = getDocViewer(docGroup, docFormat);
                            }
                            if (prevDocViewer !== that.docViewer && that.docViewer && that.docViewer.controller) {
                                that.docViewer.controller.updateCommands(prevDocViewer && prevDocViewer.controller);
                            }
                        }
                        if (prevDocViewer !== that.docViewer && prevDocViewer && prevDocViewer.controller) {
                            prevDocViewer.controller.removeDoc();
                        }
                        // reset semaphore
                        inLoadDoc = false;
                        AppBar.triggerDisableHandlers();
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadDoc = loadDoc;

            var loadData = function (noteId, docGroup, docFormat) {
                Log.call(Log.l.trace, "Sketch.Controller.", "noteId=" + noteId + " docGroup=" + docGroup + " docFormat=" + docFormat);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!noteId) {
                        //load list first -> noteId, showSvg, showPhoto, moreNotes set
                        return that.loadList(noteId);
                    } else {
                        //load doc then if noteId is set
                        return loadDoc(noteId, docGroup, docFormat);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var loadList = function (noteId) {
                Log.call(Log.l.trace, "Sketch.", "noteId=" + noteId);
                var ret;
                var sketchListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("sketchList"));
                if (sketchListFragmentControl && sketchListFragmentControl.controller) {
                    ret = sketchListFragmentControl.controller.loadData(that.binding.contactId, noteId);
                } else {
                    var parentElement = pageElement.querySelector("#listhost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "sketchList", { contactId: that.binding.contactId, isLocal: false });
                    } else {
                        ret = WinJS.Promise.as();
                    }
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadList = loadList;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Sketch.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
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
                    if (that.binding.moreNotes) {
                        var mySketchList = pageElement.querySelector(".listfragmenthost");
                        var pageControl = pageElement.winControl;
                        var newShowList = !that.binding.showList;
                        var replaceCommands = function () {
                            if (!newShowList && mySketchList && mySketchList.style) {
                                mySketchList.style.display = "none";
                            }
                            AppBar.replaceCommands([
                                { id: 'clickShowList', label: !that.binding.showList ? getResourceText('sketch.showList') : getResourceText('sketch.hideList'), tooltip: !that.binding.showList ? getResourceText('sketch.showList') : getResourceText('sketch.hideList'), section: 'primary', svg: that.binding.showList ? 'document_height' : 'elements3' }
                            ]);
                            WinJS.Promise.timeout(50).then(function () {
                                mySketchList = pageElement.querySelector(".listfragmenthost");
                                if (mySketchList && mySketchList.style) {
                                    mySketchList.style.position = "";
                                    mySketchList.style.top = "";
                                    if (newShowList) {
                                        mySketchList.style.display = "";
                                    }
                                }
                            });
                        };
                        that.binding.userHidesList = !newShowList;
                        if (mySketchList && mySketchList.style) {
                            mySketchList.style.display = "block";
                            mySketchList.style.position = "absolute";
                            if (pageControl) {
                                pageControl.prevWidth = 0;
                                pageControl.prevHeight = 0;
                            }
                            var contentarea = pageElement.querySelector(".contentarea");
                            if (contentarea) {
                                var contentHeader = pageElement.querySelector(".content-header");
                                var height = contentarea.clientHeight;
                                mySketchList.style.top = (height - 178).toString() + "px";
                                if (contentHeader) {
                                    height -= contentHeader.clientHeight;
                                }
                                if (newShowList) {
                                    that.binding.showList = true;
                                    WinJS.UI.Animation.slideUp(mySketchList).done(function () {
                                        replaceCommands(newShowList);
                                    });
                                } else {
                                    var mySketchViewers = pageElement.querySelectorAll(".sketchfragmenthost");
                                    if (mySketchViewers) {
                                        var mySketch, i;
                                        for (i = 0; i < mySketchViewers.length; i++) {
                                            mySketch = mySketchViewers[i];
                                            if (mySketch && mySketch.style) {
                                                mySketch.style.height = height.toString() + "px";
                                            }
                                        }
                                    }
                                    if (Application.navigator) {
                                        Application.navigator._updateFragmentsLayout();
                                    }
                                    WinJS.Promise.timeout(0).then(function () {
                                        WinJS.UI.Animation.slideDown(mySketchList).done(function () {
                                            that.binding.showList = false;
                                            replaceCommands(newShowList);
                                        });
                                    });
                                }
                            }
                        } else {
                            replaceCommands(newShowList);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
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

