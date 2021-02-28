// controller for page: eventMediaAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventMediaAdministration/eventMediaAdministrationService.js" />

(function () {
    "use strict";

    var b64 = window.base64js;

    WinJS.Namespace.define("EventMediaAdministration", {
        getClassNameOffline: function (useOffline) {
            return (useOffline ? "field_line field_line_even" : "hide-element");
        },
        
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
            var that = this;
                        
            Application.Controller.apply(this, [pageElement, {
                docId: 0,
                showSvg: false,
                showPhoto: false,
                showAudio: false,
                showUpload: false,
                moreDocs: false,
                userHidesList: false,
                showList: false
            }, commandList]);

            this.pageElement = pageElement;
            this.docViewer = null;

            var setDocCount = function(count) {
                Log.call(Log.l.trace, "EventMediaAdministration.Controller.", "count=" + count);
                if (count > 1) {
                    that.binding.moreDocs = true;
                } else {
                    that.binding.moreDocs = false;
                    if (!count) {
                        that.binding.showSvg = false;
                        that.binding.showPhoto = false;
                        that.binding.showAudio = false;
                    }
                }
                if (that.binding.userHidesList) {
                    that.binding.showList = false;
                } else {
                    that.binding.showList = that.binding.moreDocs;
                }
                AppBar.replaceCommands([
                    { id: 'clickShowList', label: !that.binding.showList ? getResourceText('sketch.showList') : getResourceText('sketch.hideList'), tooltip: !that.binding.showList ? getResourceText('sketch.showList') : getResourceText('sketch.hideList'), section: 'primary', svg: that.binding.showList ? 'document_height' : 'elements3' }
                ]);
                Log.ret(Log.l.trace);
            }
            that.setDocCount = setDocCount;

            var getDocViewer = function (docGroup, docFormat) {
                var docViewer;
                Log.call(Log.l.trace, "EventMediaAdministration.Controller.", "docGroup=" + docGroup + " docFormat=" + docFormat);
                if (AppData.isSvg(docGroup, docFormat)) {
                    that.binding.showSvg = true;
                    that.binding.showPhoto = false;
                    that.binding.showAudio = false;
                    docViewer = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("svgMedia"));
                } else if (AppData.isImg(docGroup, docFormat)) {
                    that.binding.showPhoto = true;
                    that.binding.showSvg = false;
                    that.binding.showAudio = false;
                    docViewer = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("imgMedia"));
                } else if (AppData.isAudio(docGroup, docFormat)) {
                    that.binding.showAudio = true;
                    that.binding.showSvg = false;
                    that.binding.showPhoto = false;
                    docViewer = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("videoMedia"));
                } else {
                    docViewer = null;
                }
                Log.ret(Log.l.trace);
                return docViewer;
            }

            var prevDocId;
            var inLoadDoc = false;
            var loadDoc = function (docId, docGroup, docFormat) {
                var ret = null;
                var parentElement;
                Log.call(Log.l.trace, "EventMediaAdministration.Controller.", "docId=" + docId + " docGroup=" + docGroup + " docFormat=" + docFormat);
                // prevent recursive calls here!
                if (inLoadDoc) {
                    if (docId === prevDocId) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        Log.print(Log.l.trace, "busy - try later again");
                        ret = WinJS.Promise.timeout(50).then(function () {
                            return loadDoc(docId, docGroup, docFormat);
                        });
                    }
                } else {
                    // set semaphore
                    inLoadDoc = true;
                    prevDocId = docId;
                    // check for need of command update in AppBar
                    var bGetNewDocViewer = false;
                    var bUpdateCommands = false;
                    var prevDocViewer = that.docViewer;
                    var newDocViewer = null;
                    if (docGroup && docFormat) {
                        that.binding.showUpload = false;
                        newDocViewer = getDocViewer(docGroup, docFormat);
                        if (newDocViewer && newDocViewer.controller) {
                            Log.print(Log.l.trace, "found docViewer!");
                            that.docViewer = newDocViewer;
                            bUpdateCommands = true;
                            ret = that.docViewer.controller.loadData(docId);
                        } else if (AppData.isSvg(docGroup, docFormat)) {
                            that.binding.showSvg = true;
                            that.binding.showPhoto = false;
                            that.binding.showAudio = false;
                            Log.print(Log.l.trace, "load new svgSketch!");
                            parentElement = pageElement.querySelector("#svgMediahost");
                            if (parentElement) {
                                bGetNewDocViewer = true;
                                bUpdateCommands = true;
                                ret = Application.loadFragmentById(parentElement, "svgMedia", { docId: docId });
                            }
                        } else if (AppData.isImg(docGroup, docFormat)) {
                            that.binding.showPhoto = true;
                            that.binding.showSvg = false;
                            that.binding.showAudio = false;
                            Log.print(Log.l.trace, "load new imgSketch!");
                            parentElement = pageElement.querySelector("#imgMediahost");
                            if (parentElement) {
                                bGetNewDocViewer = true;
                                bUpdateCommands = true;
                                ret = Application.loadFragmentById(parentElement, "imgMedia", { docId: docId });
                            }
                        } else if (AppData.isAudio(docGroup, docFormat)) {
                            that.binding.showAudio = true;
                            that.binding.showSvg = false;
                            that.binding.showPhoto = false;
                            Log.print(Log.l.trace, "load new videoMedia!");
                            parentElement = pageElement.querySelector("#videoMediahost");
                            if (parentElement) {
                                bGetNewDocViewer = true;
                                bUpdateCommands = true;
                                ret = Application.loadFragmentById(parentElement, "videoMedia", { docId: docId });
                            }
                        }
                    } else {
                        that.binding.showUpload = true;
                        that.binding.showSvg = false;
                        that.binding.showPhoto = false;
                        that.binding.showAudio = false;
                        ret = that.loadUpload(docId);
                    }
                    // do command update if needed
                    var js = {
                        doc: ret || WinJS.Promise.as(),
                        text: that.loadText(docId)
                    }
                    ret = WinJS.Promise.join(js).then(function () {
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

            var loadData = function (docId, docGroup, docFormat) {
                Log.call(Log.l.trace, "EventMediaAdministration.Controller.", "docId=" + docId + " docGroup=" + docGroup + " docFormat=" + docFormat);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!docId) {
                        //load list first -> docId, showSvg, showPhoto, moreDocs set
                        return that.loadList();
                    } else {
                        //load doc then if docId is set
                        return that.loadDoc(docId, docGroup, docFormat);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var loadList = function (docId) {
                Log.call(Log.l.trace, "EventMediaAdministration.", "docId=" + docId);
                var ret;
                var mediaListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mediaList"));
                if (mediaListFragmentControl && mediaListFragmentControl.controller) {
                    ret = mediaListFragmentControl.controller.loadData(docId, {
                        eventTextUsageId: EventMediaAdministration._eventTextUsageId,
                        eventId: EventMediaAdministration._eventId
                    });
                } else {
                    var parentElement = pageElement.querySelector("#mediaListhost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "mediaList", {
                            eventTextUsageId: EventMediaAdministration._eventTextUsageId,
                            eventId: EventMediaAdministration._eventId
                        });
                    } else {
                        ret = WinJS.Promise.as();
                    }
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadList = loadList;

            var loadText = function (docId) {
                Log.call(Log.l.trace, "EventMediaAdministration.", "docId=" + docId);
                var ret;
                var mediaTextFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mediaText"));
                if (mediaTextFragmentControl && mediaTextFragmentControl.controller &&
                    typeof mediaTextFragmentControl.controller.setDocId === "function" &&
                    typeof mediaTextFragmentControl.controller.loadData === "function") {
                    mediaTextFragmentControl.controller.setDocId(docId);
                    ret = mediaTextFragmentControl.controller.loadData();
                } else {
                    var parentElement = pageElement.querySelector("#mediaTexthost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "mediaText", {
                            docId: docId
                        });
                    } else {
                        ret = WinJS.Promise.as();
                    }
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadText = loadText;

            var loadUpload = function (docId) {
                Log.call(Log.l.trace, "EventMediaAdministration.", "docId=" + docId);
                var ret;
                var uploadMediaFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("uploadMedia"));
                if (uploadMediaFragmentControl && uploadMediaFragmentControl.controller &&
                    typeof uploadMediaFragmentControl.controller.setDocId === "function") {
                    uploadMediaFragmentControl.controller.setDocId(docId);
                } else {
                    var parentElement = pageElement.querySelector("#uploadMediahost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "uploadMedia", {
                            docId: docId
                        });
                    } else {
                        ret = WinJS.Promise.as();
                    }
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadUpload = loadUpload;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    that.insertData();
                    Log.ret(Log.l.trace);
                },
                clickShowList: function (event) {
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                    if (that.binding.moreDocs) {
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
                            if (newShowList) {
                                that.binding.showList = true;
                                WinJS.Promise.timeout(0).then(function() {
                                    var mediaListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mediaList"));
                                    if (mediaListFragmentControl && mediaListFragmentControl.controller &&
                                        typeof mediaListFragmentControl.controller.forceLayout === "function") {
                                        mediaListFragmentControl.controller.forceLayout();
                                    }
                                    return WinJS.UI.Animation.slideUp(mySketchList);
                                }).then(function() {
                                    replaceCommands(newShowList);
                                    if (pageControl && pageControl.updateLayout) {
                                        pageControl.prevWidth = 0;
                                        pageControl.prevHeight = 0;
                                        return pageControl.updateLayout.call(pageControl, pageElement) || WinJS.Promise.as();
                                    } else {
                                        return WinJS.Promise.as();
                                    }
                                });
                            } else {
                                var promise;
                                if (pageControl && pageControl.updateLayout) {
                                    pageControl.prevWidth = 0;
                                    pageControl.prevHeight = 0;
                                    promise = pageControl.updateLayout.call(pageControl, pageElement) || WinJS.Promise.timeout(0);
                                } else {
                                    promise = WinJS.Promise.timeout(0);
                                }
                                promise.then(function () {
                                    return WinJS.UI.Animation.slideDown(mySketchList);
                                }).then(function() {
                                    that.binding.showList = false;
                                    replaceCommands(newShowList);
                                });
                            }
                        } else {
                            replaceCommands(newShowList);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
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
                clickNew: function () {
                    return false;
                },
                clickShowList: function () {
                    if (that.binding.moreDocs) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            /*var saveData = function(complete, error) {
                var ret;
                Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                var mediaTextFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mediaText"));
                if (mediaTextFragmentControl && mediaTextFragmentControl.controller) {
                    mediaTextFragmentControl.controller.setDocId(docId);
                    ret = mediaTextFragmentControl.controller.saveData(complete, error);
                } else {
                    if (typeof complete === "function") {
                        complete({});
                    }
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;*/

            var getEventTextUsageId = function () {
                return EventMediaAdministration._eventTextUsageId;
            }
            that.getEventTextUsageId = getEventTextUsageId;

            var setEventTextUsageId = function (value) {
                Log.print(Log.l.trace, "eventTextUsageId=" + value);
                EventMediaAdministration._eventTextUsageId = value;
            }
            that.setEventTextUsageId = setEventTextUsageId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "eventId=" + value);
                EventMediaAdministration._eventId = value;
            }
            that.setEventId = setEventId;

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                that.setEventId(master.controller.binding.eventId);
            }

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                var eventTextUsageHost = pageElement.querySelector("#eventTextUsageHostMedia");
                if (eventTextUsageHost) {
                    return Application.loadFragmentById(eventTextUsageHost, "eventTextUsage", {});
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                Log.print(Log.l.trace, "eventTextUsage loaded");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();

