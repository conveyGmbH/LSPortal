﻿// controller for page: imgSketch
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/imgSketch/imgSketchService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ImgSketch", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "ImgSketch.Controller.", "noteId=" + (options && options.noteId));

            var imgWidth = 0;
            var imgHeight = 0;

            var imgScale = 1;
            var imgRotation = 0;

            var marginLeft = 0;
            var marginTop = 0;

            var scaleIn = 1.25;
            var scaleOut = 0.8;

            Fragments.Controller.apply(this, [fragmentElement, {
                noteId: 0,
                dataSketch: {}
            }, commandList]);
            this.img = null;

            var that = this;

            var getDocData = function () {
                return that.binding.dataSketch && that.binding.dataSketch.photoData;
            }
            var hasDoc = function () {
                return (getDocData() && typeof getDocData() === "string");
            }
            this.hasDoc = hasDoc;

            this.dispose = function () {
                if (that.img) {
                    that.removePhoto();
                    that.img.src = "";
                    that.img = null;
                }
            }

            var resultConverter = function (item, index) {
                Log.call(Log.l.trace, "ImgSketch.Controller.");
                if (item) {
                    if (item.DocContentDOCCNT1 && item.DocGroup === AppData.DocGroup.Image && item.DocFormat === 3) {
                        var sub = item.DocContentDOCCNT1.search("\r\n\r\n");
                        item.photoData = "data:image/jpeg;base64," + item.DocContentDOCCNT1.substr(sub + 4);
                    } else {
                        item.photoData = "";
                    }
                    item.DocContentDOCCNT1 = "";
                }
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var removePhoto = function () {
                if (fragmentElement) {
                    var photoItemBox = fragmentElement.querySelector("#notePhoto .win-itembox");
                    if (photoItemBox) {
                        var oldElement = photoItemBox.firstElementChild || photoItemBox.firstChild;
                        if (oldElement) {
                            oldElement.parentNode.removeChild(oldElement);
                            oldElement.innerHTML = "";
                        }
                    }
                }
            }
            this.removePhoto = removePhoto;

            var calcImagePosition = function (opt) {
                var newScale, newRotate;
                if (opt) {
                    newScale = opt.scale;
                    newRotate = opt.rotate;
                }
                if (typeof newRotate !== "undefined") {
                    imgRotation = newRotate;
                }
                if (fragmentElement && that.img) {
                    var containerWidth = fragmentElement.clientWidth;
                    var containerHeight = fragmentElement.clientHeight;

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
                    var photoItemBox = fragmentElement.querySelector("#notePhoto .win-itembox");
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
                Log.call(Log.l.trace, "ImgSketch.Controller.");
                if (fragmentElement) {
                    var photoItemBox = fragmentElement.querySelector("#notePhoto .win-itembox");
                    if (photoItemBox) {
                        if (getDocData()) {
                            if (photoItemBox.childElementCount > 1) {
                                var oldElement = photoItemBox.firstElementChild || photoItemBox.firstChild;
                                if (oldElement) {
                                    oldElement.style.display = "block";
                                    oldElement.style.position = "absolute";
                                }
                            }
                            that.img = new Image();
                            WinJS.Utilities.addClass(that.img, "active");
                            that.img.src = getDocData();
                            var pinchElement = fragmentElement.querySelector(".pinch");
                            if (pinchElement) {
                                var prevScale;
                                var ham = new Hammer.Manager(pinchElement);
                                var pan = null;
                                var pinch = new Hammer.Pinch();
                                var vendor = navigator.vendor;
                                // touch-action not supported on Safari, so use Hammer instead!
                                if (vendor && vendor.indexOf("Apple") >= 0) {
                                    pan = new Hammer.Pan();
                                    ham.add([pinch, pan]);
                                } else {
                                    ham.add([pinch]);
                                }
                                ham.on("pinchstart", function (e) {
                                    prevScale = imgScale;
                                });
                                ham.on("pinch", function (e) {
                                    if (e.scale) {
                                        var scale = prevScale * e.scale;
                                        if (scale <= 1 &&
                                        ((imgRotation === 0 || imgRotation === 180) && imgWidth * scale > 100 ||
                                            (imgRotation === 90 || imgRotation === 270) && imgHeight * scale > 100)) {
                                            that.calcImagePosition({
                                                scale: scale
                                            });
                                        }
                                    }
                                });
                                ham.on("pinchend", function (e) {
                                    if (e.scale) {
                                        var scale = prevScale * e.scale;
                                        if (scale <= 1 &&
                                        ((imgRotation === 0 || imgRotation === 180) && imgWidth * scale > 100 ||
                                            (imgRotation === 90 || imgRotation === 270) && imgHeight * scale > 100)) {
                                            that.calcImagePosition({
                                                scale: scale
                                            });
                                        }
                                    }
                                });
                                if (pan) {
                                    var prevScrollLeft = 0;
                                    var prevScrollTop = 0;

                                    var photoViewport = fragmentElement.querySelector("#notePhoto .win-viewport");
                                    ham.on("panstart", function (e) {
                                        if (photoViewport) {
                                            prevScrollLeft = photoViewport.scrollLeft;
                                            prevScrollTop = photoViewport.scrollTop;
                                        }
                                    });
                                    ham.on("panmove", function (e) {
                                        if (e.deltaX || e.deltaY) {
                                            var deltaLeft = prevScrollLeft - e.deltaX;
                                            var deltaTop = prevScrollTop - e.deltaY;
                                            Log.print(Log.l.trace, "pan deltaX=" + e.deltaX + " deltaY=" + e.deltaY);
                                            if (photoViewport) {
                                                photoViewport.scrollLeft = deltaLeft;
                                                photoViewport.scrollTop = deltaTop;
                                            }
                                        }
                                    });
                                    ham.on("panend", function (e) {
                                        if (e.deltaX || e.deltaY) {
                                            var deltaLeft = prevScrollLeft - e.deltaX;
                                            var deltaTop = prevScrollTop - e.deltaY;
                                            Log.print(Log.l.trace, "pan deltaX=" + e.deltaX + " deltaY=" + e.deltaY);
                                            if (photoViewport) {
                                                photoViewport.scrollLeft = deltaLeft;
                                                photoViewport.scrollTop = deltaTop;
                                            }
                                        }
                                    });
                                } else {
                                    pinchElement.style.touchAction = "pan-x pan-y";
                                }
                            }
                            WinJS.Promise.timeout(0).then(function () {
                                imgRotation = 0;
                                imgScale = 1;
                                calcImagePosition();
                                if (photoItemBox.childElementCount > 0) {
                                    if (that.img.style) {
                                        that.img.style.transform = "";
                                        that.img.style.visibility = "hidden";
                                        that.img.style.display = "block";
                                        that.img.style.position = "absolute";
                                        that.img.style.top = fragmentElement.offsetTop.toString() + "px";
                                    }
                                    photoItemBox.appendChild(that.img);

                                    var animationDistanceX = imgWidth / 4;
                                    var animationOptions = { top: "0px", left: animationDistanceX.toString() + "px" };
                                    if (that.img.style) {
                                        that.img.style.visibility = "";
                                    }
                                    WinJS.UI.Animation.enterContent(that.img, animationOptions).then(function () {
                                        if (that.img.style) {
                                            that.img.style.display = "";
                                            that.img.style.position = "";
                                        }
                                        if (photoItemBox.childElementCount > 1) {
                                            var oldElement = photoItemBox.firstElementChild || photoItemBox.firstChild;
                                            if (oldElement) {
                                                oldElement.parentNode.removeChild(oldElement);
                                                oldElement.innerHTML = "";
                                            }
                                        }
                                    });
                                    if (photoItemBox.childElementCount > 1) {
                                        WinJS.Promise.timeout(50).then(function () {
                                            var oldElement = photoItemBox.firstElementChild || photoItemBox.firstChild;
                                            if (oldElement) {
                                                animationOptions.left = (-animationDistanceX).toString() + "px";
                                                WinJS.UI.Animation.exitContent(oldElement, animationOptions);
                                            }
                                        });
                                    }
                                } else {
                                    photoItemBox.appendChild(that.img);
                                }
                            });
                        } else {
                            that.removePhoto();
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }

            var showPhotoAfterResize = function () {
                Log.call(Log.l.trace, "ImgSketch.Controller.");
                var fragmentControl = fragmentElement.winControl;
                if (fragmentControl && fragmentControl.updateLayout) {
                    fragmentControl.prevWidth = 0;
                    fragmentControl.prevHeight = 0;
                    var promise = fragmentControl.updateLayout.call(fragmentControl, fragmentElement) || WinJS.Promise.as();
                    promise.then(function () {
                        showPhoto();
                    });
                }
                Log.ret(Log.l.trace);
            }

            var loadData = function (noteId) {
                var ret;
                Log.call(Log.l.trace, "ImgSketch.Controller.", "noteId=" + noteId);
                if (noteId) {
                    AppData.setErrorMsg(that.binding);
                    ret = ImgSketch.sketchDocView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ImgSketch.sketchDocView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.noteId = json.d.KontaktNotizVIEWID;
                            that.resultConverter(json.d);
                            that.binding.dataSketch = json.d;
                            if (hasDoc()) {
                                Log.print(Log.l.trace,
                                    "IMG Element: " +
                                    getDocData().substr(0, 100) +
                                    "...");
                            }
                            showPhotoAfterResize();
                        }
                    },
                    function(errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                    noteId);
                } else {
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var removeDoc = function() {
                Log.call(Log.l.trace, "ImgSketch.Controller.");
                that.binding.dataSketch = {};
                that.removePhoto();
                Log.ret(Log.l.trace);
            }
            this.removeDoc = removeDoc;

            // define handlers
            this.eventHandlers = {
                clickZoomIn: function (event) {
                    Log.call(Log.l.trace, "ImgSketch.Controller.");
                    if (that.hasDoc() && imgScale * scaleIn < 1) {
                        that.calcImagePosition({
                            scale: imgScale * scaleIn
                        });
                    } else {
                        that.calcImagePosition({
                            scale: 1
                        });
                    }
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickZoomOut: function (event) {
                    Log.call(Log.l.trace, "ImgSketch.Controller.");
                    if (that.hasDoc() &&
                        ((imgRotation === 0 || imgRotation === 180) && imgWidth * imgScale * scaleOut > 100 ||
                         (imgRotation === 90 || imgRotation === 270) && imgHeight * imgScale * scaleOut > 100)) {
                        that.calcImagePosition({
                            scale: imgScale * scaleOut
                        });
                    } else {
                        if (imgRotation === 0 || imgRotation === 180) {
                            that.calcImagePosition({
                                scale: 100 / imgWidth
                            });
                        } else {
                            that.calcImagePosition({
                                scale: 100 / imgHeight
                            });
                        }
                    }
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickRotateLeft: function (event) {
                    Log.call(Log.l.trace, "ImgSketch.Controller.");
                    var rotate = imgRotation - 90;
                    if (rotate < 0) {
                        rotate = 270;
                    }
                    that.calcImagePosition({
                        rotate: rotate
                    });
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickRotateRight: function (event) {
                    Log.call(Log.l.trace, "ImgSketch.Controller.");
                    var rotate = imgRotation + 90;
                    if (rotate >= 360) {
                        rotate = 0;
                    }
                    that.calcImagePosition({
                        rotate: rotate
                    });
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "ImgSketch.Controller.");
                    var confirmTitle = getResourceText("sketch.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            WinJS.Promise.as().then(function () {
                                return ImgSketch.sketchView.deleteRecord(function (response) {
                                    // called asynchronously if ok
                                    Log.print(Log.l.trace, "ImgSketchData delete: success!");
                                    //reload sketchlist
                                    if (AppBar.scope && typeof AppBar.scope.loadList === "function") {
                                        AppBar.scope.loadList(null);
                                    }
                                },
                                    function (errorResponse) {
                                        // called asynchronously if an error occurs
                                        // or server returns response with an error status.
                                        AppData.setErrorMsg(that.binding, errorResponse);

                                        var message = null;
                                        Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                                        if (errorResponse.data && errorResponse.data.error) {
                                            Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                                            if (errorResponse.data.error.message) {
                                                Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                                message = errorResponse.data.error.message.value;
                                            }
                                        }
                                        if (!message) {
                                            message = getResourceText("error.delete");
                                        }
                                        alert(message);
                                    },
                                    that.binding.noteId,
                                    that.binding.isLocal);
                            });
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickZoomIn: function () {
                    if (that.hasDoc() && imgScale < 1) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickZoomOut: function () {
                    if (that.hasDoc() &&
                        ((imgRotation === 0 || imgRotation === 180) && imgWidth * imgScale > 100 ||
                         (imgRotation === 90 || imgRotation === 270) && imgHeight * imgScale > 100)) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickRotateLeft: function () {
                    if (getDocData()) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickRotateRight: function () {
                    if (getDocData()) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(options && options.noteId);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



