// controller for page: mediaList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/mediaList/mediaListService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";

    var namespaceName = "MediaList";

    WinJS.Namespace.define("MediaList", {
        videoExtList: [
            "mpg", "mpeg", "m1v", "mp2", "mpe", "mpv2", "mp4", "m4v",
            "mp4v", "ogg", "ogv", "asf", "avi", "mov", "wmv"
        ],
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            if (options) {
                MediaList._eventTextUsageId = options.eventTextUsageId;
                MediaList._eventId = options.eventId;
                MediaList._showOnlyEventMedia = options.showOnlyEventMedia;
            }
            Fragments.Controller.apply(this, [fragmentElement, {
                docId: 0,
                docGroup: null,
                docFormat: null,
                flagInsert: null,
                addIndex: null
            }]);
            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;

            this.nextUrl = null;
            this.records = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#mediaList.listview");

            var doScrollIntoViewAnimation = false;
            var initialScrollPosition = 0;
            var wheelValueFactor = 100;
            var waitingForMouseScroll = false;
            var wheelScrollAdd = 0;
            var checkForWheelEndPromise = null;

            var onTouch = function(eventId, x, y) {
                if (listView && listView.winControl) {
                    listView.winControl.scrollPosition = initialScrollPosition + x/4;
                }
            };
            var touchPhysics = new TouchPhysics.TouchPhysics(onTouch);
            var checkForWheelEnd = function(eventInfo) {
                if (checkForWheelEndPromise) {
                    checkForWheelEndPromise.cancel();
                }
                checkForWheelEndPromise = WinJS.Promise.timeout(TouchPhysics.wheelEndTimerMs).then(function() {
                    waitingForMouseScroll = false;
                    checkForWheelEndPromise = null;
                    touchPhysics.processUp(MANIPULATION_PROCESSOR_MANIPULATIONS.MANIPULATION_TRANSLATE_X, wheelScrollAdd*wheelValueFactor, 0);
                    wheelScrollAdd = 0;
                });
            }
            this.checkForWheelEnd = checkForWheelEnd;

            this.dispose = function () {
                if (checkForWheelEndPromise) {
                    checkForWheelEndPromise.cancel();
                }
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.records) {
                    that.records = null;
                }
            }

            var scaleItemsAfterResize = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (listView && fragmentElement &&
                    fragmentElement.winControl &&
                    fragmentElement.winControl.prevWidth &&
                    fragmentElement.winControl.prevHeight) {
                    var i;
                    var imgScale = 1;
                    var imgWidth = 0;
                    var imgHeight = 0;
                    var marginLeft = 0;
                    var marginTop = 0;
                    // scale SVG images
                    var svgList = listView.querySelectorAll(".list-svg");
                    if (svgList) {
                        for (i = 0; i < svgList.length; i++) {
                            imgWidth = svgList[i].clientWidth;
                            imgHeight = svgList[i].clientHeight;
                            var svg = svgList[i].firstElementChild;
                            if (svg) {
                                WinJS.Utilities.addClass(svg, "list-svg-item");
                                var height = Math.floor(svg.height && svg.height.baseVal && svg.height.baseVal.value || 0);
                                var width = Math.floor(svg.width && svg.width.baseVal && svg.width.baseVal.value || 0);
                                if (height && width) {
                                    if (height > width) {
                                        imgScale = width / height;
                                        marginTop = 0;
                                        marginLeft = Math.floor(imgHeight * (1 - imgScale) / 2);
                                        imgWidth = Math.floor(imgHeight * imgScale);
                                    } else {
                                        imgScale = height / width;
                                        marginLeft = 0;
                                        marginTop = Math.floor(imgWidth * (1 - imgScale) / 2);
                                        imgHeight = Math.floor(imgWidth * imgScale);
                                    }
                                    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
                                    if (svg.style) {
                                        svg.style.marginLeft = marginLeft + "px";
                                        svg.style.marginTop = marginTop + "px";
                                        svg.style.width = imgWidth + "px";
                                        svg.style.height = imgHeight + "px";
                                    }
                                }
                                var surface = svg.querySelector("#surface");
                                if (surface) {
                                    surface.setAttribute("fill", "#ffffff");
                                }
                            }
                        }
                    }
                    // scale photo images
                    var imgList = listView.querySelectorAll(".list-img");
                    if (imgList) {
                        for (i = 0; i < imgList.length; i++) {
                            var img = imgList[i].querySelector(".list-img-item");
                            if (img && img.src && img.style) {
                                if (img.naturalWidth && img.naturalHeight) {
                                    if (imgList[i].clientWidth < img.naturalWidth) {
                                        imgScale = imgList[i].clientWidth / img.naturalWidth;
                                        imgWidth = imgList[i].clientWidth;
                                    } else {
                                        imgScale = 1;
                                        imgWidth = img.naturalWidth;
                                    }
                                    imgHeight = img.naturalHeight * imgScale;
                                    if (imgList[i].clientHeight < imgHeight) {
                                        imgScale *= imgList[i].clientHeight / imgHeight;
                                        imgHeight = imgList[i].clientHeight;
                                    }
                                    imgWidth = img.naturalWidth * imgScale;

                                    if (imgWidth < imgList[i].clientWidth) {
                                        marginLeft = (imgList[i].clientWidth - imgWidth) / 2;
                                    } else {
                                        marginLeft = 0;
                                    }
                                    if (imgHeight < imgList[i].clientHeight) {
                                        marginTop = (imgList[i].clientHeight - imgHeight) / 2;
                                    } else {
                                        marginTop = 0;
                                    }
                                    img.style.marginLeft = marginLeft + "px";
                                    img.style.marginTop = marginTop + "px";
                                    img.style.width = imgWidth + "px";
                                    img.style.height = imgHeight + "px";
                                } else {
                                    img.style.objectFit = "contain";
                                    imgList[i].style.objectPosition = "50% 50%";
                                }
                            }
                        }
                    }
                    WinJS.Promise.timeout(50).then(function () {
                        if (AppBar.scope) {
                            var pageElement = AppBar.scope.pageElement;
                            if (pageElement) {
                                var pageControl = pageElement.winControl;
                                if (pageControl && pageControl.updateLayout) {
                                    pageControl.prevWidth = 0;
                                    pageControl.prevHeight = 0;
                                    pageControl.updateLayout.call(pageControl, pageElement);
                                }
                            }
                        }
                    });
                } else if (that.binding.count > 1) {
                    WinJS.Promise.timeout(50).then(function () {
                        scaleItemsAfterResize();
                    });
                }
                Log.ret(Log.l.trace);
            }


            var resultConverter = function (item, index) {
                if (item) {
                    var doc = item;
                    item.showPdf = AppData.isPdf(doc.DocGroup, doc.DocFormat);
                    item.showSvg = AppData.isSvg(doc.DocGroup, doc.DocFormat);
                    item.showImg = AppData.isImg(doc.DocGroup, doc.DocFormat);
                    item.showAudio = AppData.isAudio(doc.DocGroup, doc.DocFormat);
                    item.showPlay = false;
                    if (typeof item.Url === "string" &&
                        (item.Url.indexOf("https://") === 0 || item.Url.indexOf("http://") === 0)) {
                        item.showVideo = false;
                        var extPos = item.Url.lastIndexOf(".");
                        if (extPos > 0) {
                            var ext = item.Url.substr(extPos + 1);
                            if (MediaList.videoExtList.indexOf(ext) >= 0) {
                                item.showVideo = true;
                            }
                        }
                        if (!item.showVideo) {
                            var posServer = item.Url.indexOf("://");
                            var server = item.Url.substr(posServer + 3).split("/")[0];
                            if (server === "www.youtube.com" || server === "youtu.be") {
                                item.showPlay = true;
                            }
                        }
                    } else {
                        item.showVideo = AppData.isVideo(doc.DocGroup, doc.DocFormat);
                    }
                    item.showIcon = false;
                    item.nameIcon = "";
                    item.srcImg = "";
                    item.srcSvg = "";
                    if (item.showImg) {
                        var docContent = doc.OvwContentDOCCNT3;
                        if (docContent) {
                            var sub = docContent.search("\r\n\r\n");
                            if (sub >= 0) {
                                var data = docContent.substr(sub + 4);
                                if (data && data !== "null") {
                                    item.srcImg = "data:image/jpeg;base64," + data;
                                }
                            }
                        }
                    } else if (item.showSvg) {
                        item.srcSvg = doc.OvwContentDOCCNT3;
                    } else if (item.showPdf) {
                        item.nameIcon = "document_pdf";
                        item.showIcon = true;
                    } else if (item.showAudio) {
                        item.nameIcon = "music";
                        item.showIcon = true;
                    } else if (item.showVideo) {
                        item.nameIcon = "movie";
                        item.showIcon = true;
                    } else if (item.showPlay) {
                        item.nameIcon = "media_play";
                        item.showIcon = true;
                    } else {
                        item.nameIcon = "document_empty";
                        item.showIcon = true;
                    }
                    if (item.ModifiedTS) {
                        // convert ModifiedTS
                        item.currentDate = getDateObject(item.ModifiedTS);
                        var curMoment = moment(item.currentDate);
                        if (curMoment) {
                            curMoment.locale(Application.language);
                            item.currentDateString = curMoment.format("ll HH:mm");
                        }
                    } else {
                        item.currentDateString = "";
                    }
                    item.currentTitle = item.Titel || item.LabelTitle;
                }
            }
            this.resultConverter = resultConverter;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    //if current doc is saved successfully, change selection
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item && item.data) {
                                        that.binding.docId = item.data.MandantDokumentVIEWID;
                                        that.binding.docGroup = item.data.DocGroup;
                                        that.binding.docFormat = item.data.DocFormat;
                                        that.binding.flagInsert = item.data.FlagInsert;
                                        that.binding.addIndex = item.data.AddIndex;
                                        if (AppBar.scope) {
                                            doScrollIntoViewAnimation = true;
                                            if (AppBar.scope.pageElement &&
                                                AppBar.scope.pageElement.winControl &&
                                                typeof AppBar.scope.pageElement.winControl.canUnload === "function") {
                                                AppBar.scope.pageElement.winControl.canUnload(function(response) {
                                                    // called asynchronously if ok
                                                    //load doc with new recordId
                                                    if (AppBar.scope) {
                                                        if (typeof AppBar.scope.setFlagInsert === "function") {
                                                            AppBar.scope.setFlagInsert(that.binding.flagInsert);
                                                        }
                                                        if (typeof AppBar.scope.setAddIndex === "function") {
                                                            AppBar.scope.setAddIndex(that.binding.addIndex);
                                                        }
                                                        if (typeof AppBar.scope.loadDoc === "function") {
                                                            AppBar.scope.loadDoc(that.binding.docId, that.binding.docGroup, that.binding.docFormat);
                                                        }
                                                    }
                                                }, function(errorResponse) {
                                                    // error handled in saveData!
                                                });
                                            } else {
                                                if (typeof AppBar.scope.setFlagInsert === "function") {
                                                    AppBar.scope.setFlagInsert(that.binding.flagInsert);
                                                }
                                                if (typeof AppBar.scope.setAddIndex === "function") {
                                                    AppBar.scope.setAddIndex(that.binding.addIndex);
                                                }
                                                //load doc with new recordId
                                                if (typeof AppBar.scope.loadDoc === "function") {
                                                    AppBar.scope.loadDoc(that.binding.docId, that.binding.docGroup, that.binding.docFormat);
                                                }
                                            }
                                            WinJS.Promise.timeout(50).then(function() {
                                                Log.print(Log.l.trace, "now update layout...");
                                                var fragmentControl = fragmentElement.winControl;
                                                if (fragmentControl && fragmentControl.updateLayout) {
                                                    fragmentControl.prevWidth = 0;
                                                    fragmentControl.prevHeight = 0;
                                                    return fragmentControl.updateLayout.call(fragmentControl, fragmentElement);
                                                } else {
                                                    return WinJS.Promise.as();
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "complete") {
                            Colors.loadSVGImageElements(listView, "list-icon-item", 80, Colors.navigationColor, "name");
                            scaleItemsAfterResize();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                wheelHandler: function(eventInfo) {
                    if (eventInfo && listView && listView.winControl) {
                        var wheelWithinListView = eventInfo.target && (listView.contains(eventInfo.target) || listView === eventInfo.target);
                        if (wheelWithinListView) {
                            eventInfo.stopPropagation();
                            eventInfo.preventDefault();

                            var wheelValue;
                            if (!waitingForMouseScroll) {
                                waitingForMouseScroll = true;
                                initialScrollPosition = listView.winControl.scrollPosition;
                                if (typeof eventInfo.deltaY === 'number') {
                                    wheelValue = Math.abs(eventInfo.deltaX || eventInfo.deltaY || 0);
                                } else {
                                    wheelValue = Math.abs(eventInfo.wheelDelta || 0);
                                }
                                if (wheelValue) {
                                    wheelValueFactor = Math.min(10000 / wheelValue, 120);
                                }
                                touchPhysics.processDown(MANIPULATION_PROCESSOR_MANIPULATIONS.MANIPULATION_TRANSLATE_X, 0, 0);
                                WinJS.Promise.timeout(TouchPhysics.wheelStartTimerMs).then(function() {
                                    that.eventHandlers.wheelHandler(eventInfo);
                                });
                                return;
                            }
                            var wheelingForward;

                            if (typeof eventInfo.deltaY === 'number') {
                                wheelingForward = (eventInfo.deltaX || eventInfo.deltaY) > 0;
                                wheelValue = Math.abs(eventInfo.deltaX || eventInfo.deltaY || 0);
                            } else {
                                wheelingForward = eventInfo.wheelDelta < 0;
                                wheelValue = Math.abs(eventInfo.wheelDelta || 0);
                            }
                            wheelScrollAdd += wheelingForward ? wheelValue : -wheelValue;

                            touchPhysics.processMove(MANIPULATION_PROCESSOR_MANIPULATIONS.MANIPULATION_TRANSLATE_X, wheelScrollAdd*wheelValueFactor, 0);
                            that.checkForWheelEnd(eventInfo);
                        }
                    }
                }
            }
            this.eventHandlers = eventHandlers;

            var scrollIntoView = function (curIndex) {
                Log.call(Log.l.u1, namespaceName + ".Controller.");
                if (listView && listView.winControl) {
                    var listControl = listView.winControl;
                    var containers = listView.querySelectorAll(".win-container");
                    if (containers && that.records && containers.length === that.records.length && containers[0]) {
                        var surface = listView.querySelector(".win-surface");
                        if (surface) {
                            var overflow = surface.clientWidth - listView.clientWidth;
                            if (overflow > 0) {
                                var doScroll = true;
                                var containersWidth = 0;
                                var i = curIndex - 1;
                                if (i >= 0 && i < containers.length - 1) {
                                    containersWidth = containers[curIndex].offsetLeft;
                                    var margin = containers[curIndex].offsetLeft -
                                        (containers[i].offsetLeft + containers[i].offsetWidth);
                                    if (containersWidth - Math.max(60, containers[i].offsetWidth / 4) < listControl.scrollPosition) {
                                        containersWidth -= Math.max(60, containers[i].offsetWidth / 4);
                                    } else if (containersWidth + containers[curIndex].offsetWidth +
                                        ((curIndex + 1 < containers.length) ? Math.max(60, containers[curIndex + 1].offsetWidth / 4) : margin) -
                                        listView.clientWidth > listControl.scrollPosition) {
                                        containersWidth += containers[curIndex].offsetWidth +
                                            ((curIndex + 1 < containers.length) ? Math.max(60, containers[curIndex + 1].offsetWidth / 4) : margin) -
                                            listView.clientWidth;
                                    } else {
                                        Log.ret(Log.l.u1, "extra ignored");
                                        doScroll = false;
                                    }
                                }
                                if (doScroll) {
                                    var scrollPosition = Math.floor(containersWidth);
                                    if (scrollPosition < 0) {
                                        scrollPosition = 0;
                                    } else if (scrollPosition > overflow) {
                                        scrollPosition = overflow;
                                    }
                                    if (listControl.scrollPosition !== scrollPosition) {
                                        if (doScrollIntoViewAnimation) {
                                            var prevScrollPosition = listControl.scrollPosition;
                                            var animationDistanceX = (scrollPosition - prevScrollPosition) / 3;
                                            var animationOptions = { top: "0px", left: animationDistanceX.toString() + "px" };
                                            listControl.scrollPosition = scrollPosition;
                                            WinJS.UI.Animation.enterContent(surface, animationOptions).done(function() {
                                                doScrollIntoViewAnimation = false;
                                            });
                                        } else {
                                            listControl.scrollPosition = scrollPosition;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Log.ret(Log.l.u1);
            }
            that.scrollIntoView = scrollIntoView;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "wheel", this.eventHandlers.wheelHandler.bind(this));
                this.addRemovableEventListener(listView, "mousewheel", this.eventHandlers.wheelHandler.bind(this));
            }

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    if (typeof complete === "function") {
                        complete({});
                    }
                });
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            var prevOptions = null;
            var inLoadData = false;
            var loadData = function (docId, curOptions) {
                var i, selIdx = -1, reloadDocView = false;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "docId=" + docId);
                if (inLoadData) {
                    if (curOptions && prevOptions &&
                        prevOptions.eventTextUsageId === curOptions.eventTextUsageId &&
                        prevOptions.eventId === curOptions.eventId) {
                        Log.ret(Log.l.trace, "extra ignored");
                        return WinJS.Promise.as();
                    } else {
                        Log.ret(Log.l.trace, "busy - try later again");
                        return WinJS.Promise.timeout(50).then(function () {
                            return that.loadData(docId, curOptions);
                        });
                    }
                }
                inLoadData = true;
                prevOptions = curOptions;
                if (curOptions) {
                    MediaList._eventTextUsageId = curOptions.eventTextUsageId;
                    MediaList._eventId = curOptions.eventId;
                }
                AppData.setErrorMsg(pageBinding);
                var ret = MediaList.eventDocView.select(function (json) {
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.print(Log.l.trace, "MediaList.eventDocView: success!");
                    // select returns object already parsed from json file in response
                    if (json && json.d) {
                        that.nextUrl = MediaList.eventDocView.getNextUrl(json, that.binding.isLocal);
                        var results = json.d.results;
                        if (results && results.length > 0) {
                            if (that.records) {
                                // reload the bindable list
                                that.records.length = 0;
                                results.forEach(function(item, index) {
                                    that.resultConverter(item, index);
                                    that.records.push(item);
                                });
                            } else {
                                results.forEach(function(item, index) {
                                    that.resultConverter(item, index);
                                });
                                // Now, we call WinJS.Binding.List to get the bindable list
                                that.records = new WinJS.Binding.List(results);
                            }
                            // find selection index
                            //as default, show first doc in doc page
                            selIdx = 0;
                            if (docId) {
                                for (i = 0; i < results.length; i++) {
                                    if (results[i].MandantDokumentVIEWID === docId) {
                                        selIdx = i;
                                        break;
                                    }
                                }
                            }
                            Log.print(Log.l.trace, "MediaList.eventDocView: selIdx=" + selIdx);
                        } else {
                            if (that.records) {
                                that.records.length = 0;
                            }
                            that.binding.docId = 0;
                            that.binding.docGroup = null;
                            that.binding.docFormat = null;
                            that.binding.flagInsert = null;
                            that.binding.addIndex = null;
                        }
                    } else {
                        if (that.records) {
                            that.records.length = 0;
                        }
                        that.binding.docId = 0;
                        that.binding.docGroup = null;
                        that.binding.docFormat = null;
                        that.binding.flagInsert = null;
                        that.binding.addIndex = null;
                    }
                    reloadDocView = true;
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    inLoadData = false;
                    AppData.setErrorMsg(pageBinding, errorResponse);
                }).then(function() {
                    if (reloadDocView) {
                        // show/hide this fragment, so use timeout!
                        that.binding.count = that.records ? that.records.length : 0;
                        if (AppBar.scope && typeof AppBar.scope.setDocCount === "function") {
                            AppBar.scope.setDocCount(that.binding.count);
                        }
                        return WinJS.Promise.timeout(50);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (reloadDocView) {
                        if (listView && listView.winControl) {
                            if (that.records && that.records.length > 0 && listView.winControl.selection && selIdx >= 0) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.records.dataSource;
                                return listView.winControl.selection.set(selIdx).then(function() {
                                    //load doc with new recordId
                                    var row = that.records.getAt(selIdx);
                                    if (row) {
                                        that.binding.docId = row.MandantDokumentVIEWID;
                                        that.binding.docGroup = row.DocGroup;
                                        that.binding.docFormat = row.DocFormat;
                                        that.binding.flagInsert = row.FlagInsert;
                                        that.binding.addIndex = row.AddIndex;
                                    }
                                });
                            } else {
                                return WinJS.Promise.as();
                            }
                        } else {
                            return WinJS.Promise.as();
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (reloadDocView && AppBar.scope) {
                        if (typeof AppBar.scope.setFlagInsert === "function") {
                            AppBar.scope.setFlagInsert(that.binding.flagInsert);
                        }
                        if (typeof AppBar.scope.setAddIndex === "function") {
                            AppBar.scope.setAddIndex(that.binding.addIndex);
                        }
                        if (typeof AppBar.scope.loadDoc === "function") {
                            AppBar.scope.loadDoc(that.binding.docId, that.binding.docGroup, that.binding.docFormat);
                        }
                    }
                    inLoadData = false;
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var forceLayout = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (listView && listView.winControl) {
                    listView.winControl.forceLayout();
                }
                Log.ret(Log.l.trace);
            }
            that.forceLayout = forceLayout;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(options && options.docId, options);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



