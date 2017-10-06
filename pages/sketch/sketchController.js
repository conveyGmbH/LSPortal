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
/// <reference path="~/www/pages/sketch/svgeditor.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Sketch", {
        getClassNameOffline: function (useOffline) {
            return (useOffline ? "field_line field_line_even" : "hide-element");
        },
        
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Sketch.Controller.");

            var that = this;

            var getPhotoData = function () {
                return that.binding.sketchData && that.binding.sketchData.DocContentDOCCNT1;
            }

            var hasDoc = function () {
                return (typeof getPhotoData() === "string" && getPhotoData() !== null);
            }
            this.hasDoc = hasDoc;

            // show note photo
            var imageOffsetX = 0;
            var imageOffsetY = 0;

            var imgWidth = 0;
            var imgHeight = 0;
            var imgLeft = 0;
            var imgTop = 0;
            var imgScale = 1;
            var imgRotation = 0;
            var imgNaturalLeft = 0;
            var imgNaturalTop = 0;

            var marginLeft = 0;
            var marginTop = 0;

            var scaleIn = 1.25;
            var scaleOut = 0.8;

            var photoview = pageElement.querySelector("#notePhoto.photoview");

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
                showPhoto: false,
                showList: false
            }]);
            this.svgEditor = svgEditor;

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
                        that.binding.showPhoto = true;
                    }
                    if (isSvg) {
                        item.ExecAppTypeID = 15;
                        item.Quelltext = item.DocContentDOCCNT1;
                        item.DocContentDOCCNT1 = null;
                        item.showSvg = true;
                        that.binding.curSvg = true;
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var removePhoto = function () {
                if (photoview) {
                    var photoItemBox = photoview.querySelector("#contactPhoto .win-itembox");
                    if (photoItemBox) {
                        var oldElement = photoItemBox.firstElementChild || photoItemBox.firstChild;
                        if (oldElement) {
                            oldElement.parentNode.removeChild(oldElement);
                            oldElement.innerHTML = "";
                        }
                    }
                }
            }

            var calcImagePosition = function (options) {
                var newScale, newRotate;
                if (options) {
                    newScale = options.scale;
                    newRotate = options.rotate;
                }
                if (typeof newRotate !== "undefined") {
                    imgRotation = newRotate;
                }
                if (photoview && that.img) {
                    var containerWidth = photoview.clientWidth;
                    var containerHeight = photoview.clientHeight;

                    if (newScale) {
                        imgScale = newScale;
                        imgWidth = that.img.naturalWidth * imgScale;
                        imgHeight = that.img.naturalHeight * imgScale;
                    } else {
                        switch (imgRotation) {
                            case 90:
                            case 270:
                                if (containerWidth < that.img.naturalHeight) {
                                    imgHeight = containerWidth;
                                    imgScale = containerWidth / that.img.naturalHeight;
                                } else {
                                    imgScale = 1;
                                    imgHeight = that.img.naturalHeight;
                                }
                                imgWidth = that.img.naturalWidth * imgScale;
                                break;
                            case 180:
                            default:
                                if (containerWidth < that.img.naturalWidth) {
                                    imgScale = containerWidth / that.img.naturalWidth;
                                    imgWidth = containerWidth;
                                } else {
                                    imgScale = 1;
                                    imgWidth = that.img.naturalWidth;
                                }
                                imgHeight = that.img.naturalHeight * imgScale;
                        }
                    }
                    var photoItemBox = photoview.querySelector("#contactPhoto .win-itembox");
                    if (photoItemBox && photoItemBox.style) {
                        switch (imgRotation) {
                            case 90:
                            case 270:
                                if (imgHeight <= containerWidth) {
                                    photoItemBox.style.width = containerWidth + "px";
                                } else {
                                    photoItemBox.style.width = imgHeight + "px";
                                }
                                if (imgWidth <= containerHeight) {
                                    photoItemBox.style.height = containerHeight + "px";
                                } else {
                                    photoItemBox.style.height = imgWidth + "px";
                                }
                                break;
                            case 180:
                            default:
                                if (imgWidth <= containerWidth) {
                                    photoItemBox.style.width = containerWidth + "px";
                                } else {
                                    photoItemBox.style.width = imgWidth + "px";
                                }
                                if (imgHeight <= containerHeight) {
                                    photoItemBox.style.height = containerHeight + "px";
                                } else {
                                    photoItemBox.style.height = imgHeight + "px";
                                }
                        }
                    }
                    imgLeft = (imgWidth - containerWidth) / 2;
                    imgTop = (imgHeight - containerHeight) / 2;
                    imgNaturalLeft = imgLeft / imgScale;
                    imgNaturalTop = imgTop / imgScale;

                    if (imgRotation === 90 || imgRotation === 270) {
                        marginTop = (imgHeight - imgWidth) / 2;
                        marginLeft = (imgWidth - imgHeight) / 2;
                        if (imgHeight < containerWidth) {
                            marginLeft += (imgHeight - containerWidth) / 2;
                        }
                        if (imgWidth < containerHeight) {
                            marginTop += (imgWidth - containerHeight) / 2;
                        }
                    } else {
                        if (imgWidth < containerWidth) {
                            marginLeft = (imgWidth - containerWidth) / 2;
                        } else {
                            marginLeft = 0;
                        }
                        if (imgHeight < containerHeight) {
                            marginTop = (imgHeight - containerHeight) / 2;
                        } else {
                            marginTop = 0;
                        }
                    }


                    if (that.img.style) {
                        if (typeof newRotate !== "undefined") {
                            that.img.style.transform = "rotate( " + imgRotation + "deg)";
                        }
                        that.img.style.marginLeft = -marginLeft + "px";
                        that.img.style.marginTop = -marginTop + "px";
                        that.img.style.width = imgWidth + "px";
                        that.img.style.height = imgHeight + "px";
                    }
                }
            }
            this.calcImagePosition = calcImagePosition;

            var showPhoto = function () {
                if (photoview) {
                    var photoItemBox = photoview.querySelector("#contactPhoto .win-itembox");
                    if (photoItemBox) {
                        if (photoItemBox.style) {
                            photoItemBox.style.visibility = "hidden";
                        }
                        if (getPhotoData()) {
                            that.img = new Image();
                            photoItemBox.appendChild(that.img);
                            WinJS.Utilities.addClass(that.img, "active");
                            that.img.src = "data:image/jpeg;base64," + getPhotoData();
                            if (photoItemBox.childElementCount > 1) {
                                var oldElement = photoItemBox.firstElementChild || photoItemBox.firstChild;
                                if (oldElement) {
                                    oldElement.parentNode.removeChild(oldElement);
                                    oldElement.innerHTML = "";
                                }
                            }
                            imgScale = 1;
                            imgWidth = that.img.naturalWidth * imgScale;
                            imgHeight = that.img.naturalHeight * imgScale;
                            imgRotation = 0;
                            imgLeft = imgNaturalLeft * imgScale;
                            imgTop = imgNaturalTop * imgScale;
                            var ham = new Hammer($(".pinch")[0], {
                                domEvents: true
                            });
                            ham.get('pinch').set({ enable: true, therhold: 10 });
                            var prevScale = imgScale;
                            $(".pinch").on("pinchstart", function (e) {
                                prevScale = imgScale;
                            });
                            $(".pinch").on("pinch", function (e) {
                                var scale = prevScale * e.originalEvent.gesture.scale;
                                if (scale <= 1 &&
                                    ((imgRotation === 0 || imgRotation === 180) && imgWidth * scale > 100 ||
                                    (imgRotation === 90 || imgRotation === 270) && imgHeight * scale > 100)) {
                                    that.calcImagePosition({
                                        scale: scale
                                    });
                                }
                            });
                            $(".pinch").on("pinchend", function (e) {
                                var scale = prevScale * e.originalEvent.gesture.scale;
                                if (scale <= 1 &&
                                    ((imgRotation === 0 || imgRotation === 180) && imgWidth * scale > 100 ||
                                    (imgRotation === 90 || imgRotation === 270) && imgHeight * scale > 100)) {
                                    that.calcImagePosition({
                                        scale: scale
                                    });
                                }
                            });
                            var prevScrollLeft = 0;
                            var prevScrollTop = 0;

                            var photoViewport = photoview.querySelector("#contactPhoto .win-viewport");
                            var contentarea = pageElement.querySelector(".contentarea");

                            $(".pinch").on("panstart", function (e) {
                                if (photoViewport) {
                                    prevScrollLeft = photoViewport.scrollLeft;
                                }
                                if (contentarea) {
                                    prevScrollTop = contentarea.scrollTop;
                                }
                            });
                            $(".pinch").on("panmove", function (e) {
                                var deltaLeft = prevScrollLeft - e.originalEvent.gesture.deltaX;
                                var deltaTop = prevScrollTop - e.originalEvent.gesture.deltaY;
                                Log.print(Log.l.trace, "pan deltaX=" + e.originalEvent.gesture.deltaX + " deltaY=" + e.originalEvent.gesture.deltaY);
                                if (photoViewport) {
                                    photoViewport.scrollLeft = deltaLeft;
                                }
                                if (contentarea) {
                                    contentarea.scrollTop = deltaTop;
                                }
                            });
                            $(".pinch").on("panend", function (e) {
                                var deltaLeft = prevScrollLeft - e.originalEvent.gesture.deltaX;
                                var deltaTop = prevScrollTop - e.originalEvent.gesture.deltaY;
                                Log.print(Log.l.trace, "pan deltaX=" + e.originalEvent.gesture.deltaX + " deltaY=" + e.originalEvent.gesture.deltaY);
                                if (photoViewport) {
                                    photoViewport.scrollLeft = deltaLeft;
                                }
                                if (contentarea) {
                                    contentarea.scrollTop = deltaTop;
                                }
                            });
                            WinJS.Promise.timeout(0).then(function () {
                                imageOffsetX = photoview.offsetLeft + pageElement.offsetLeft;
                                imageOffsetY = photoview.offsetTop + pageElement.offsetTop;
                                Log.print(Log.l.trace, "imageOffsetX=" + imageOffsetX + " imageOffsetY=" + imageOffsetY);
                                var pageControl = pageElement.winControl;
                                if (pageControl && pageControl.updateLayout) {
                                    pageControl.prevWidth = 0;
                                    pageControl.prevHeight = 0;
                                    pageControl.updateLayout.call(pageControl, pageElement).then(function () {
                                        if (photoItemBox.style) {
                                            photoItemBox.style.visibility = "";
                                        }
                                        var animationDistanceX = imgWidth / 10;
                                        var animationOptions = { top: "0px", left: animationDistanceX.toString() + "px" };
                                        return WinJS.UI.Animation.enterContent(photoItemBox, animationOptions);
                                    }).then(function () {
                                        AppBar.triggerDisableHandlers();
                                    });
                                }
                            });
                        } else {
                            removePhoto();
                            var pageControl = pageElement.winControl;
                            if (pageControl && pageControl.updateLayout) {
                                pageControl.prevWidth = 0;
                                pageControl.prevHeight = 0;
                                pageControl.updateLayout.call(pageControl, pageElement).then(function () {
                                    AppBar.triggerDisableHandlers();
                                });
                            }
                        }
                    }
                }
                AppBar.triggerDisableHandlers();
            }



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
                            that.resultConverter(json.d);
                            that.binding.dataSketch = json.d;
                            if (that.binding.dataSketch.showSvg) {
                                if (typeof that.binding.dataSketch.Quelltext !== "undefined" &&
                                    that.binding.dataSketch.Quelltext) {
                                    Log.print(Log.l.trace,
                                        "SVG Element: " +
                                        that.binding.dataSketch.Quelltext.substr(0, 100) +
                                        "...");
                                }
                                WinJS.Promise.timeout(0).then(function() {
                                    that.svgEditor.fnLoadSVG(that.binding.dataSketch.Quelltext);
                                });
                            } else if (that.binding.dataSketch.showImg) {
                                showPhoto();
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

