﻿// controller for page: startMediaAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/startMediaAdministration/startMediaAdministrationService.js" />

(function () {
    "use strict";

    var b64 = window.base64js;

    WinJS.Namespace.define("StartMediaAdministration", {
        getClassNameOffline: function (useOffline) {
            return (useOffline ? "field_line field_line_even" : "hide-element");
        },

        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
            var that = this;

            Application.Controller.apply(this, [pageElement, {
                docId: 0,
                showSvg: false,
                showPhoto: false,
                showAudio: false,
                showUpload: false,
                moreDocs: false,
                userHidesList: false,
                showList: false,
                flagInsert: null,
                addIndex: null
            }, commandList]);

            this.pageElement = pageElement;
            this.docViewer = null;

            var setDocCount = function (count) {
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.", "count=" + count);
                if (count > 1) {
                    that.binding.moreDocs = true;
                } else {
                    that.binding.moreDocs = false;
                    if (!count) {
                        that.binding.docId = 0;
                        that.binding.showSvg = false;
                        that.binding.showPhoto = false;
                        that.binding.showAudio = false;
                        that.binding.showUpload = false;
                        that.binding.flagInsert = null;
                        that.binding.addIndex = null;
                        var uploadMediaFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("uploadMedia"));
                        if (uploadMediaFragmentControl && uploadMediaFragmentControl.controller &&
                            typeof uploadMediaFragmentControl.controller.setDocId === "function") {
                            uploadMediaFragmentControl.controller.setDocId(that.binding.docId);
                        }
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
            this.setDocCount = setDocCount;

            var setFlagInsert = function (flagInsert) {
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.", "flagInsert=" + flagInsert);
                that.binding.flagInsert = flagInsert;
                Log.ret(Log.l.trace);
            }
            this.setFlagInsert = setFlagInsert;

            var setAddIndex = function (addIndex) {
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.", "addIndex=" + addIndex);
                that.binding.addIndex = addIndex;
                Log.ret(Log.l.trace);
            }
            this.setAddIndex = setAddIndex;

            var getDocViewer = function (docGroup, docFormat) {
                var docViewer;
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.", "docGroup=" + docGroup + " docFormat=" + docFormat);
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
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.", "docId=" + docId + " docGroup=" + docGroup + " docFormat=" + docFormat);
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
                    that.binding.docId = docId;
                    // check for need of command update in AppBar
                    var bGetNewDocViewer = false;
                    var bUpdateCommands = false;
                    var prevDocViewer = that.docViewer;
                    var newDocViewer = null;
                    var prevShowUpload = that.binding.showUpload;
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
                        that.binding.showUpload = !!docId;
                        that.binding.showSvg = false;
                        that.binding.showPhoto = false;
                        that.binding.showAudio = false;
                        bUpdateCommands = true;
                        if (that.binding.showUpload) {
                            ret = that.loadUpload(docId);
                        } else {
                            ret = WinJS.Promise.as();
                        }
                    }
                    // do command update if needed
                    var js = {
                        doc: ret || WinJS.Promise.as(),
                        text: that.loadText(docId)
                    }
                    ret = WinJS.Promise.join(js).then(function () {
                        if (bUpdateCommands) {
                            var uploadMediaFragmentControl;
                            if (that.binding.showUpload) {
                                if (prevShowUpload !== that.binding.showUpload) {
                                    uploadMediaFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("uploadMedia"));
                                    if (uploadMediaFragmentControl && uploadMediaFragmentControl.controller) {
                                        uploadMediaFragmentControl.controller.updateCommands(prevDocViewer && prevDocViewer.controller);
                                    }
                                }
                            } else {
                                if (bGetNewDocViewer) {
                                    that.docViewer = getDocViewer(docGroup, docFormat);
                                }
                                if (prevShowUpload !== that.binding.showUpload) {
                                    uploadMediaFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("uploadMedia"));
                                    that.docViewer.controller.updateCommands(uploadMediaFragmentControl && uploadMediaFragmentControl.controller);
                                } else if (prevDocViewer !== that.docViewer && that.docViewer && that.docViewer.controller) {
                                    that.docViewer.controller.updateCommands(prevDocViewer && prevDocViewer.controller);
                                }
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

            var loadData = function () {
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    return that.saveData();
                }).then(function () {
                    return that.loadList();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var loadList = function (docId) {
                Log.call(Log.l.trace, "StartMediaAdministration.", "docId=" + docId);
                var ret = null;
                var mediaListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mediaList"));
                if (mediaListFragmentControl && mediaListFragmentControl.controller) {
                    ret = mediaListFragmentControl.controller.loadData(docId, {
                        eventTextUsageId: StartMediaAdministration._eventTextUsageId,
                        eventStartId: StartMediaAdministration._eventStartId
                    });
                } else {
                    var parentElement = pageElement.querySelector("#mediaListhost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "mediaList", {
                            eventTextUsageId: StartMediaAdministration._eventTextUsageId,
                            eventStartId: StartMediaAdministration._eventStartId
                        });
                    }
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            }
            this.loadList = loadList;

            var loadText = function (docId) {
                Log.call(Log.l.trace, "StartMediaAdministration.", "docId=" + docId);
                var ret = null;
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
                            docId: docId,
                            eventUsageId: StartMediaAdministration._eventTextUsageId,
                            eventStartId: StartMediaAdministration._eventStartId
                        });
                    }
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            }
            this.loadText = loadText;

            var loadUpload = function (docId) {
                Log.call(Log.l.trace, "StartMediaAdministration.", "docId=" + docId);
                var ret = null;
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
                    }
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            }
            this.loadUpload = loadUpload;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickShowList: function (event) {
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
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
                                WinJS.Promise.timeout(0).then(function () {
                                    var mediaListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mediaList"));
                                    if (mediaListFragmentControl && mediaListFragmentControl.controller &&
                                        typeof mediaListFragmentControl.controller.forceLayout === "function") {
                                        mediaListFragmentControl.controller.forceLayout();
                                    }
                                    return WinJS.UI.Animation.slideUp(mySketchList);
                                }).then(function () {
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
                                }).then(function () {
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
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                    AppBar.busy = true;
                    that.saveData(function (response) {
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "media text saved");
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "error saving media text");
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                    if (that.binding.docId && that.binding.addIndex && that.binding.flagInsert) {
                        var confirmTitle = getResourceText("eventMediaAdministration.questionDelete");
                        confirm(confirmTitle, function (result) {
                            if (result) {
                                Log.print(Log.l.trace, "clickDelete: user choice OK");
                                that.deleteData();
                            } else {
                                Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                            }
                        });
                    } else {
                        Log.print(Log.l.info, "not allowed to delete docId=" + that.binding.docId +
                            " addIndex=" + that.binding.addIndex + " flagInsert=" + that.binding.flagInsert);
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                    that.insertData();
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
                clickShowList: function () {
                    if (that.binding.moreDocs) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (!AppBar.busy && that.binding.docId && that.binding.addIndex && that.binding.flagInsert) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickNew: function () {
                    if (!AppBar.busy && that.binding.docId && that.binding.flagInsert) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickForward: function () {
                    if (!AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            var saveData = function (complete, error) {
                var ret;
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                var mediaTextFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mediaText"));
                if (mediaTextFragmentControl && mediaTextFragmentControl.controller) {
                    ret = mediaTextFragmentControl.controller.saveData(function (response) {
                        Log.print(Log.l.trace, "media saved");
                        if (typeof complete === "function") {
                            complete(response);
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving media");
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    });
                } else {
                    if (typeof complete === "function") {
                        complete({});
                    }
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var insertData = function () {
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (that.binding.docId && that.binding.flagInsert) {
                        AppBar.busy = true;
                        return AppData.call("Prc_CopyFromMandantDokument", {
                            pPrevMandantDokumentID: that.binding.docId,
                            pLanguageSpecID: 0
                        }, function (json) {
                            AppBar.busy = false;
                            Log.print(Log.l.info, "call PRC_CopyFromMandantDokument: success!");
                            if (json &&
                                json.d &&
                                json.d.results &&
                                json.d.results[0] &&
                                json.d.results[0].MandantDokumentVIEWID) {
                                that.binding.docId = json.d.results[0].MandantDokumentVIEWID;
                            } else {
                                var err = { status: 0, statusText: "no record returned from insert!" };
                                AppData.setErrorMsg(that.binding, err);
                            }
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            Log.print(Log.l.error, "call PRC_CopyFromMandantDokument: error");
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        Log.print(Log.l.info, "not allowed to call PRC_CopyFromMandantDokument on docId=" + that.binding.docId +
                            " addIndex=" + that.binding.addIndex + " flagInsert=" + that.binding.flagInsert);
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    return that.loadList(that.binding.docId);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.insertData = insertData;

            var deleteData = function () {
                Log.call(Log.l.trace, "StartMediaAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    AppBar.busy = true;
                    return StartMediaAdministration.mediaTable.deleteRecord(function (json) {
                        AppBar.busy = false;
                        Log.print(Log.l.info, "deleteRecord: success!");
                        that.binding.docId = null;
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "deleteRecord: error");
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, that.binding.docId);
                }).then(function () {
                    return that.loadList();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.deleteData = deleteData;

            var getEventStartId = function () {
                return StartMediaAdministration._eventStartId;
            }
            that.getEventStartId = getEventStartId;

            var setEventStartId = function (value) {
                Log.print(Log.l.trace, "eventStartId=" + value);
                StartMediaAdministration._eventStartId = value;
                return that.loadData();
            }
            that.setEventStartId = setEventStartId;

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                that.setEventStartId(master.controller.binding.startId);
            }

            // finally, load the data
            this.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                var eventTextUsageHost = pageElement.querySelector("#SeriesTextUsageHostMedia");
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

