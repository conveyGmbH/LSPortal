// controller for page: imgMedia
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/imgMedia/imgMediaService.js" />

(function () {
    "use strict";

    var namespaceName = "ImgMedia";

    WinJS.Namespace.define(namespaceName, {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.", "docId=" + (options && options.docId));

            var imgWidth = 0;
            var imgHeight = 0;

            var imgScale = 1;
            var imgRotation = 0;

            var scaleIn = 1.25;
            var scaleOut = 0.8;

            Fragments.Controller.apply(this, [fragmentElement, {
                docId: null,
                dataDoc: {}
            }, commandList]);
            this.img = null;

            var that = this;

            var getDocData = function () {
                return that.binding.dataDoc && that.binding.dataDoc.imgData;
            }
            var hasDoc = function () {
                return (getDocData() && typeof getDocData() === "string");
            }
            this.hasDoc = hasDoc;

            this.dispose = function () {
                that.removeDoc();
                if (that.img) {
                    that.img.src = "";
                    that.img = null;
                }
            }

            var resultConverter = function (item, index) {
                if (item) {
                    that.binding.docId = item.MandantDokumentVIEWID;
                    if (item.DocContentDOCCNT1 && item.DocGroup === AppData.DocGroup.Image && item.ContentEncoding === 4096) {
                        var key1 = "Content-Type:";
                        var key2 = "Accept-Ranges:";
                        var pos1 = item.DocContentDOCCNT1.indexOf(key1);
                        var pos2 = item.DocContentDOCCNT1.indexOf(key2);
                        var sub = item.DocContentDOCCNT1.search("\r\n\r\n");
                        if (pos1 >= 0 && pos2 > pos1 && sub > pos2) {
                            item.ContentType = item.DocContentDOCCNT1.substring(pos1 + key1.length, pos2).trim().replace("\r\n","");
                            item.imgData = "data:" + item.ContentType + ";base64," + item.DocContentDOCCNT1.substr(sub + 4);
                        } else {
                            item.imgData = "";
                        }
                    } else {
                        item.imgData = "";
                    }
                    item.DocContentDOCCNT1 = "";
                }
            }
            this.resultConverter = resultConverter;

            var removeImage = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (fragmentElement) {
                    var imageItemBox = fragmentElement.querySelector("#imgDoc .win-itembox");
                    if (imageItemBox) {
                        var oldElement = imageItemBox.firstElementChild || imageItemBox.firstChild;
                        if (oldElement) {
                            imageItemBox.removeChild(oldElement);
                            oldElement.innerHTML = "";
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.removeImage = removeImage;

            var calcImagePosition = function (opt) {
                var newScale, newRotate, marginLeft, marginTop;
                if (opt) {
                    newScale = opt.scale;
                    newRotate = opt.rotate;
                }
                if (typeof newRotate !== "undefined") {
                    imgRotation = newRotate;
                }
                var docContainer = fragmentElement.querySelector(".doc-container");
                if (docContainer && that.img) {
                    var containerWidth = docContainer.clientWidth;
                    var containerHeight = docContainer.clientHeight;
                    var scrollbarSize = 18;

                    if (newScale) {
                        imgScale = newScale;
                        imgWidth = that.img.naturalWidth * imgScale;
                        imgHeight = that.img.naturalHeight * imgScale;
                    } else {
                        imgWidth = that.img.naturalWidth;
                        imgHeight = that.img.naturalHeight;
                        imgScale = 1;
                        switch (imgRotation) {
                            case 90:
                            case 270:
                                if (containerWidth / containerHeight > that.img.naturalHeight / that.img.naturalWidth) {
                                    if (containerHeight < that.img.naturalWidth) {
                                        imgWidth = containerHeight;
                                        imgScale = containerHeight / that.img.naturalWidth;
                                        imgHeight = that.img.naturalHeight * imgScale;
                                    }
                                } else {
                                    if (containerWidth < that.img.naturalHeight) {
                                        imgHeight = containerWidth;
                                        imgScale = containerWidth / that.img.naturalHeight;
                                        imgWidth = that.img.naturalWidth * imgScale;
                                    }
                                }
                                break;
                            case 180:
                            default:
                                if (containerWidth / containerHeight > that.img.naturalWidth / that.img.naturalHeight) {
                                    if (containerHeight < that.img.naturalHeight) {
                                        imgHeight = containerHeight;
                                        imgScale = containerHeight / that.img.naturalHeight;
                                        imgWidth = that.img.naturalWidth * imgScale;
                                    }
                                } else {
                                    if (containerWidth < that.img.naturalWidth) {
                                        imgWidth = containerWidth;
                                        imgScale = containerWidth / that.img.naturalWidth;
                                        imgHeight = that.img.naturalHeight * imgScale;
                                    }
                                }
                        }
                    }
                    var viewPort = fragmentElement.querySelector("#imgDoc.imgview > .win-viewport");
                    if (viewPort && viewPort.style) {
                        if (newScale) {
                            viewPort.style.overflowX = "auto";
                            viewPort.style.overflowY = "auto";
                        } else {
                            viewPort.style.overflowX = "hidden";
                            viewPort.style.overflowY = "hidden";
                        }
                    }
                    var imageItemBox = fragmentElement.querySelector("#imgDoc .win-itembox");
                    if (imageItemBox && imageItemBox.style) {
                        switch (imgRotation) {
                            case 90:
                            case 270:
                                if (imgHeight <= containerWidth) {
                                    imageItemBox.style.width = containerWidth + "px";
                                } else {
                                    imageItemBox.style.width = imgHeight + "px";
                                }
                                if (imgWidth <= containerHeight) {
                                    imageItemBox.style.height = containerHeight + "px";
                                } else {
                                    imageItemBox.style.height = imgWidth + "px";
                                }
                                break;
                            case 180:
                            default:
                                if (imgWidth <= containerWidth) {
                                    imageItemBox.style.width = containerWidth + "px";
                                } else {
                                    imageItemBox.style.width = imgWidth + "px";
                                }
                                if (imgHeight <= containerHeight) {
                                    imageItemBox.style.height = containerHeight + "px";
                                } else {
                                    imageItemBox.style.height = imgHeight + "px";
                                }
                        }
                    }

                    if (imgRotation === 90 || imgRotation === 270) {
                        marginTop = (imgHeight - imgWidth) / 2;
                        marginLeft = (imgWidth - imgHeight) / 2;
                        if (imgHeight < containerWidth) {
                            marginLeft += (containerWidth - imgHeight) / 2;
                        }
                        if (imgWidth < containerHeight) {
                            marginTop += (containerHeight - imgWidth) / 2;
                        }
                    } else {
                        if (imgWidth < containerWidth) {
                            marginLeft = (containerWidth - imgWidth) / 2;
                        } else {
                            marginLeft = 0;
                        }
                        if (imgHeight < containerHeight) {
                            marginTop = (containerHeight - imgHeight) / 2;
                        } else {
                            marginTop = 0;
                        }
                    }
                    if (that.img.style) {
                        if (typeof newRotate !== "undefined") {
                            that.img.style.transform = "rotate( " + imgRotation + "deg)";
                        }
                        that.img.style.marginLeft = marginLeft + "px";
                        that.img.style.marginTop = marginTop + "px";
                        that.img.style.width = imgWidth + "px";
                        that.img.style.height = imgHeight + "px";
                    }
                }
            }
            this.calcImagePosition = calcImagePosition;

            var showImage = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (fragmentElement) {
                    var imageItemBox = fragmentElement.querySelector("#imgDoc .win-itembox");
                    if (imageItemBox) {
                        if (getDocData()) {
                            that.img = new Image();
                            WinJS.Utilities.addClass(that.img, "active");
                            that.img.src = getDocData();
                            var pinchElement = fragmentElement.querySelector(".pinch");
                            if (pinchElement) {
                                var imageViewport = fragmentElement.querySelector("#imgDoc .win-viewport");
                                var prevScrollLeft = 0;
                                var prevScrollTop = 0;
                                var prevScale = 1;
                                var prevCenter, prevCenterInImage;
                                var prevOffsetLeft = 0;
                                var prevOffsetTop = 0;
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
                                    if (e.center && typeof e.center.x === "number" && typeof e.center.x === "number") {
                                        prevOffsetLeft = 0;
                                        prevOffsetTop = 0;
                                        var element = e.target;
                                        while (element) {
                                            prevOffsetLeft += element.offsetLeft;
                                            prevOffsetTop += element.offsetTop;
                                            element = element.offsetParent;
                                        }
                                        Log.print(Log.l.trace, "prevOffsetLeft=" + prevOffsetLeft + " prevOffsetTop=" + prevOffsetTop);
                                        prevCenter = {
                                            x: e.center.x - prevOffsetLeft,
                                            y: e.center.y - prevOffsetTop
                                        }
                                        if (imageViewport) {
                                            prevScrollLeft = imageViewport.scrollLeft;
                                            prevScrollTop = imageViewport.scrollTop;
                                        }
                                        prevCenterInImage = {
                                            x: (prevCenter.x + prevScrollLeft) / prevScale,
                                            y: (prevCenter.y + prevScrollTop) / prevScale
                                        }
                                        Log.print(Log.l.trace, "prevCenter.x=" + prevCenter.x + " prevCenter.y=" + prevCenter.y + " prevCenterInImage.x=" + prevCenterInImage.x + " prevCenterInImage.y=" + prevCenterInImage.y);
                                    }
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
                                        if (e.center && typeof e.center.x === "number" && typeof e.center.x === "number") {
                                            var center = {
                                                x: e.center.x - prevOffsetLeft,
                                                y: e.center.y - prevOffsetTop
                                            }
                                            if (imageViewport) {
                                                prevScrollLeft = imageViewport.scrollLeft;
                                                prevScrollTop = imageViewport.scrollTop;
                                            }
                                            var centerInImage = {
                                                x: (center.x + prevScrollLeft) / scale,
                                                y: (center.y + prevScrollTop) / scale
                                            }
                                            Log.print(Log.l.trace, "center.x=" + center.x + " center.y=" + center.y + " centerInImage.x=" + centerInImage.x + " centerInImage.y=" + centerInImage.y);
                                            var deltaLeft = (prevCenterInImage.x - centerInImage.x) * scale;
                                            var deltaTop = (prevCenterInImage.y - centerInImage.y) * scale;
                                            if (imageViewport) {
                                                imageViewport.scrollLeft += deltaLeft;
                                                imageViewport.scrollTop += deltaTop;
                                            }
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
                                        if (e.center && typeof e.center.x === "number" && typeof e.center.x === "number") {
                                            var center = {
                                                x: e.center.x - prevOffsetLeft,
                                                y: e.center.y - prevOffsetTop
                                            }
                                            var centerInImage = {
                                                x: (center.x + prevScrollLeft) / scale,
                                                y: (center.y + prevScrollTop) / scale
                                            }
                                            Log.print(Log.l.trace, "center.x=" + center.x + " center.y=" + center.y + " centerInImage.x=" + centerInImage.x + " centerInImage.y=" + centerInImage.y);
                                            var deltaLeft = (prevCenterInImage.x - centerInImage.x) * scale;
                                            var deltaTop = (prevCenterInImage.y - centerInImage.y) * scale;
                                            if (imageViewport) {
                                                imageViewport.scrollLeft += deltaLeft;
                                                imageViewport.scrollTop += deltaTop;
                                            }
                                        }
                                    }
                                });
                                if (pan) {
                                    ham.on("panstart", function (e) {
                                        if (imageViewport) {
                                            prevScrollLeft = imageViewport.scrollLeft;
                                            prevScrollTop = imageViewport.scrollTop;
                                        }
                                    });
                                    ham.on("panmove", function (e) {
                                        if (e.deltaX || e.deltaY) {
                                            var deltaLeft = prevScrollLeft - e.deltaX;
                                            var deltaTop = prevScrollTop - e.deltaY;
                                            Log.print(Log.l.trace, "pan deltaX=" + e.deltaX + " deltaY=" + e.deltaY);
                                            if (imageViewport) {
                                                imageViewport.scrollLeft = deltaLeft;
                                                imageViewport.scrollTop = deltaTop;
                                            }
                                        }
                                    });
                                    ham.on("panend", function (e) {
                                        if (e.deltaX || e.deltaY) {
                                            var deltaLeft = prevScrollLeft - e.deltaX;
                                            var deltaTop = prevScrollTop - e.deltaY;
                                            Log.print(Log.l.trace, "pan deltaX=" + e.deltaX + " deltaY=" + e.deltaY);
                                            if (imageViewport) {
                                                imageViewport.scrollLeft = deltaLeft;
                                                imageViewport.scrollTop = deltaTop;
                                            }
                                        }
                                    });
                                } else {
                                    pinchElement.style.touchAction = "pan-x pan-y";
                                }
                            }
                            WinJS.Promise.timeout(0).then(function () {
                                var ret = null;
                                if (AppBar.scope) {
                                    var pageElement = AppBar.scope.pageElement;
                                    if (pageElement) {
                                        var pageControl = pageElement.winControl;
                                        if (pageControl && pageControl.updateLayout) {
                                            pageControl.prevWidth = 0;
                                            pageControl.prevHeight = 0;
                                            ret = pageControl.updateLayout.call(pageControl, pageElement);
                                        }
                                    }
                                }
                                return ret || WinJS.Promise.as();
                            }).then(function () {
                                imgRotation = 0;
                                imgScale = 1;
                                calcImagePosition();
                                var lastElement = imageItemBox.lastElementChild || imageItemBox.lastChild;
                                var oldElement = imageItemBox.firstElementChild || imageItemBox.firstChild;
                                if (oldElement && oldElement.style) {
                                    oldElement.style.display = "block";
                                    oldElement.style.position = "absolute";
                                }
                                if (that.img.style) {
                                    that.img.style.transform = "";
                                    that.img.style.visibility = "hidden";
                                    that.img.style.display = "block";
                                    that.img.style.position = "absolute";
                                }
                                imageItemBox.appendChild(that.img);

                                /*var animationDistanceX = imgWidth / 4;
                                var animationOptions = { top: "0px", left: animationDistanceX.toString() + "px" };
                                if (that.img.style) {
                                    that.img.style.visibility = "";
                                }
                                WinJS.UI.Animation.enterContent(that.img, animationOptions).then(function () {
                                    if (that.img.style) {
                                        that.img.style.display = "";
                                        that.img.style.position = "";
                                    }
                                    while (imageItemBox.childElementCount > 1) {
                                        oldElement = imageItemBox.firstElementChild || imageItemBox.firstChild;
                                        if (oldElement) {
                                            imageItemBox.removeChild(oldElement);
                                            oldElement.innerHTML = "";
                                        }
                                    }
                                });
                                */
                                if (that.img.style) {
                                    that.img.style.visibility = "";
                                }
                                if (lastElement) {
                                    WinJS.UI.Animation.crossFade(that.img, lastElement).then(function() {
                                        if (that.img.style) {
                                            that.img.style.display = "";
                                            that.img.style.position = "";
                                        }
                                        while (imageItemBox.childElementCount > 1) {
                                            oldElement = imageItemBox.firstElementChild || imageItemBox.firstChild;
                                            if (oldElement) {
                                                imageItemBox.removeChild(oldElement);
                                                oldElement.innerHTML = "";
                                            }
                                        }
                                    });
                                } else {
                                    WinJS.UI.Animation.fadeIn(that.img).then(function() {
                                        if (that.img.style) {
                                            that.img.style.display = "";
                                            that.img.style.position = "";
                                        }
                                    });
                                }
                            });
                        } else {
                            that.removeImage();
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }

            /*var showImageAfterResize = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var fragmentControl = fragmentElement.winControl;
                if (fragmentControl && fragmentControl.updateLayout) {
                    fragmentControl.prevWidth = 0;
                    fragmentControl.prevHeight = 0;
                    var promise = fragmentControl.updateLayout.call(fragmentControl, fragmentElement) || WinJS.Promise.as();
                    promise.then(function () {
                        showImage();
                    });
                }
                Log.ret(Log.l.trace);
            }*/

            var loadData = function (docId) {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "docId=" + docId);
                if (docId) {
                    AppData.setErrorMsg(that.binding);
                    ret = ImgMedia.docView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ImgMedia.docView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.resultConverter(json.d);
                            that.binding.dataDoc = json.d;
                            if (hasDoc()) {
                                Log.print(Log.l.trace, "IMG Element: " + getDocData().substr(0, 100) + "...");
                            }
                            //showImageAfterResize();
                            showImage();
                        }
                    },
                    function(errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                    docId);
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            };
            this.loadData = loadData;

            var removeDoc = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.binding.dataDoc = {};
                that.removeImage();
                Log.ret(Log.l.trace);
            }
            this.removeDoc = removeDoc;

            // define handlers
            this.eventHandlers = {
                clickZoomIn: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var rotate = imgRotation + 90;
                    if (rotate >= 360) {
                        rotate = 0;
                    }
                    that.calcImagePosition({
                        rotate: rotate
                    });
                    AppBar.triggerDisableHandlers();
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
                return that.loadData(options && options.docId);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



