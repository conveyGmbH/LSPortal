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
                dataEventMedia: EventMediaAdministration.eventTextView.defaultMediaAdministrationData,
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


            var base64ToBlob = function (base64Data, contentType) {
                contentType = contentType || '';
                var sliceSize = 1024;
                var base64result = base64Data.split(',')[1];
                var byteCharacters = atob(base64result);
                var bytesLength = byteCharacters.length;
                var slicesCount = Math.ceil(bytesLength / sliceSize);
                var byteArrays = new Array(slicesCount);

                for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                    var begin = sliceIndex * sliceSize;
                    var end = Math.min(begin + sliceSize, bytesLength);

                    var bytes = new Array(end - begin);
                    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                        bytes[i] = byteCharacters[offset].charCodeAt(0);
                    }
                    byteArrays[sliceIndex] = new Uint8Array(bytes);
                }
                return new Blob(byteArrays, { type: contentType });
            }
            this.base64ToBlob = base64ToBlob;

            var output = [];

            function getBase64 (file, type) {
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    // reader.result
                    var base64String = reader.result;
                    output.push('<li><strong>', file.name, '</strong> (', file.type || 'n/a', ') - ',
                        file.size, ' bytes</li>');
                    document.getElementById('dateiListe').innerHTML = '<ul>' + output.join('') + '</ul>';
                    // test wandle base64 to blob bzw. file und dann speicher
                    /*var blob = that.base64ToBlob(base64String, type);
                    saveAs(blob, "Test.txt");*/
                };
                reader.onerror = function (error) {
                    AppData.setErrorMsg(that.binding, error);
                };
            }

            function fileChoose(evt) {
                // FileList-Objekt des input-Elements auslesen, auf dem 
                // das change-Event ausgelöst wurde (event.target)
                var files = evt.target.files;
                for (var i = 0; i < files.length; i++) {
                    getBase64(files[i], files[i].type);
                }
                //evt.target.value = "";
            }

            function fileDragAndDrop(evt) {
                evt.stopPropagation();
                evt.preventDefault();

                var files = evt.dataTransfer.files; // FileList Objekt
                for (var i = 0; i < files.length; i++) {
                    getBase64(files[i], files[i].type);
                }
            }

            function handleDragOver(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                evt.dataTransfer.dropEffect = 'copy';
            }

            // Initialisiere Drag&Drop EventListener
            var dropZone = document.getElementById('dropzone');
            dropZone.addEventListener('dragover', handleDragOver, false);
            dropZone.addEventListener('drop', fileDragAndDrop, false);

            //Initialisiere fileChooser           
            var fileChooser = document.getElementById('fileChooser');
            fileChooser.addEventListener('change', fileChoose, false);

            var setNotesCount = function(count) {
                Log.call(Log.l.trace, "EventMediaAdministration.Controller.", "count=" + count);
                if (count > 1) {
                    that.binding.moreNotes = true;
                } else {
                    that.binding.moreNotes = false;
                    if (!count) {
                        that.binding.showSvg = false;
                        that.binding.showPhoto = false;
                    }
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

            var prevNoteId;
            var inLoadDoc = false;
            var loadDoc = function (noteId, docGroup, docFormat) {
                var ret;
                var parentElement;
                Log.call(Log.l.trace, "EventMediaAdministration.Controller.", "noteId=" + noteId + " docGroup=" + docGroup + " docFormat=" + docFormat);
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
                        parentElement = pageElement.querySelector("#svgMediahost");
                        if (parentElement) {
                            bGetNewDocViewer = true;
                            bUpdateCommands = true;
                            ret = Application.loadFragmentById(parentElement, "svgMedia", { noteId: noteId, isLocal: false });
                        } else {
                            ret = WinJS.Promise.as();
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
                            ret = Application.loadFragmentById(parentElement, "imgMedia", { noteId: noteId, isLocal: false });
                        } else {
                            ret = WinJS.Promise.as();
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
                            ret = Application.loadFragmentById(parentElement, "videoMedia", { noteId: noteId, isLocal: false });
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
                var mediaListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mediaList"));
                if (mediaListFragmentControl && mediaListFragmentControl.controller) {
                    ret = mediaListFragmentControl.controller.loadData(that.binding.contactId, noteId);
                } else {
                    var parentElement = pageElement.querySelector("#mediaListhost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "mediaList", { contactId: that.binding.contactId, isLocal: false });
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
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
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
                clickForward: function (event) {
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                    //Application.navigateById("contact", event);
                    // savedate..
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    that.insertData();
                    Log.ret(Log.l.trace);
                },
                clickShowList: function (event) {
                    Log.call(Log.l.trace, "EventMediaAdministration.Controller.");
                    var mySketchList = pageElement.querySelector(".listfragmenthost");
                    var pageControl = pageElement.winControl;
                    var newShowList = !that.binding.showList;
                    var replaceCommands = function () {
                        if (!newShowList && mySketchList && mySketchList.style) {
                            mySketchList.style.display = "none";
                        }
                        if (pageControl) {
                            pageControl.prevHeight = 0;
                            pageControl.prevWidth = 0;
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
                                var mySketchViewers = pageElement.querySelectorAll(".eventMediaAdministrationfragmenthost");
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
                clickForward: function () {
                    // never disable!
                    return false;
                },
                clickNew: function () {
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

            var setEventId = function (value) {
                Log.print(Log.l.trace, "eventId=" + value);
                EventMediaAdministration._eventId = value;
            }
            that.setEventId = setEventId;

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                var eventTextUsageHost = pageElement.querySelector("#eventTextUsageHostMedia.fragmenthost");
                if (eventTextUsageHost) {
                    return Application.loadFragmentById(eventTextUsageHost, "eventTextUsage", {});
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
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

