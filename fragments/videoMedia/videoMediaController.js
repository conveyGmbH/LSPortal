// controller for page: videoMedia
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/fragments/videoMedia/videoMediaService.js" />

(function () {
    "use strict";

    var namespaceName = "VideoMedia";

    WinJS.Namespace.define("VideoMedia", {
        audioExtList: [
            "mpa", "mp3", "m4a", "oga",
            "wav", "wma", "aiff", "aifc", "au", "mid", "midi"
        ],
        videoExtList: [
            "mpg", "mpeg", "m1v", "mp2", "mpe", "mpv2", "mp4", "m4v",
            "mp4v", "ogg", "ogv", "asf", "avi", "mov", "wmv"
        ],
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.", "noteId=" + (options && options.noteId) + " url=" + (options && options.url));

            Fragments.Controller.apply(this, [fragmentElement, {
                noteId: null,
                url: null,
                dataSketch: {
                    mediaData: ""
                },
                showVideo: false,
                showAudio: false,
                showFrame: false
            }, commandList]);

            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;

            var getVideoId = function (url) {
                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                var match = url ? url.match(regExp) : null;
                return (match && match[2] && match[2].length === 11) ? match[2] : null;
            }

            var getDocData = function () {
                if (that.binding && that.binding.dataSketch && that.binding.dataSketch.mediaData) {
                    return that.binding.dataSketch.mediaData;
                }
                return "";
            }
            var getDocType = function () {
                if (that.binding && that.binding.dataSketch && that.binding.dataSketch.type) {
                    return that.binding.dataSketch.type;
                }
                return "";
            }
            var hasDoc = function () {
                return (getDocData() && typeof getDocData() === "string");
            }
            this.hasDoc = hasDoc;

            this.dispose = function () {
                that.removeDoc();
            }

            var resultConverter = function (item, index) {
                if (item.DocContentDOCCNT1 && AppData.isVideo(item.DocGroup, item.DocFormat) || AppData.isAudio(item.DocGroup, item.DocFormat)) {
                    Log.print(Log.l.trace, "DocGroup=" + item.DocGroup + "DocFormat=" + item.DocFormat);
                    item.type = AppData.getDocType(item.DocFormat);
                    if (!item.type) {
                        Log.print(Log.l.trace, "search in DOCContent...");
                        var typeTag = "Content-Type: ";
                        var typeStr = item.DocContentDOCCNT1.search(typeTag).substr(typeTag.length);
                        var endPos = typeStr.indexOf("Accept-Ranges:");
                        if (endPos > 0) {
                            typeStr = typeStr.substr(0, endPos);
                        }
                        item.type = typeStr.replace("\r\n", "");
                    }
                    Log.print(Log.l.trace, "content type==" + item.type);
                    if (item.type) {
                        var sub = item.DocContentDOCCNT1.search("\r\n\r\n");
                        item.mediaData = "data:" + item.type + ";base64," + item.DocContentDOCCNT1.substr(sub + 4);
                    } else {
                        item.mediaData = "";
                    }
                } else {
                    item.mediaData = "";
                }
                item.DocContentDOCCNT1 = "";
            }
            this.resultConverter = resultConverter;

            var removeMedia = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var audio = fragmentElement.querySelector("#noteAudio");
                if (audio) {
                    if (typeof audio.pause === "function") {
                        audio.pause();
                    }
                    audio.src = "";
                }
                var video = fragmentElement.querySelector("#noteVideo");
                if (video) {
                    if (typeof video.pause === "function") {
                        video.pause();
                    }
                    video.src = "";
                }
                var frame = fragmentElement.querySelector("#noteFrame");
                if (frame) {
                    frame.src = "";
                }
                if (that.binding) {
                    that.binding.dataSketch = {
                        mediaData: ""
                    };
                    that.binding.showVideo = false;
                    that.binding.showAudio = false;
                    that.binding.showFrame = false;
                }
                Log.ret(Log.l.trace);
            }
            this.removeMedia = removeMedia;

            var bindMedia = function (url) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "url=" + url);
                AppData.setErrorMsg(pageBinding);
                if (typeof url === "string" || that.binding.dataSketch) {
                    var isVideo = false;
                    var isAudio = false;
                    var isFrame = false;
                    if (typeof url === "string" &&
                        (url.indexOf("https://") === 0 || url.indexOf("http://") === 0)) {
                        var extPos = url.lastIndexOf(".");
                        if (extPos > 0) {
                            var ext = url.substr(extPos + 1);
                            if (VideoMedia.videoExtList.indexOf(ext) >= 0) {
                                isVideo = true;
                            }
                            if (VideoMedia.audioExtList.indexOf(ext) >= 0) {
                                isAudio = true;
                            }
                        }
                        if (!isVideo && !isAudio) {
                            var posServer = url.indexOf("://");
                            var server = url.substr(posServer + 3).split("/")[0];
                            if (server === "www.youtube.com" || server === "youtu.be") {
                                var videoId = getVideoId(url);
                                if (videoId) {
                                    url = "https://www.youtube.com/embed/" + videoId;
                                    isFrame = true;
                                }
                            }
                        }
                    }
                    if (!isVideo && !isAudio && !isFrame) {
                        url = null;
                    }
                    var audio, video, frame;
                    if (isVideo || AppData.isVideo(that.binding.dataSketch.DocGroup, that.binding.dataSketch.DocFormat)) {
                        video = fragmentElement.querySelector("#noteVideo");
                        if (video && (url || hasDoc())) {
                            that.binding.showVideo = true;
                            that.binding.showAudio = false;
                            that.binding.showFrame = false;
                            try {
                                video.src = url || getDocData();
                                if (typeof video.load === "function") {
                                    video.load();
                                }
                                if (typeof video.play === "function") {
                                    video.play();
                                }
                            } catch (e) {
                                Log.print(Log.l.error, "video returned error:" + e);
                                AppData.setErrorMsg(pageBinding, e);
                            }
                            audio = fragmentElement.querySelector("#noteAudio");
                            if (audio) {
                                if (typeof audio.pause === "function") {
                                    audio.pause();
                                }
                                audio.src = "";
                            }
                            frame = fragmentElement.querySelector("#noteFrame");
                            if (frame) {
                                frame.src = "";
                            }
                        } else {
                            that.removeMedia();
                        }
                    } else if (isAudio || AppData.isAudio(that.binding.dataSketch.DocGroup, that.binding.dataSketch.DocFormat)) {
                        audio = fragmentElement.querySelector("#noteAudio");
                        if (audio && (url || hasDoc())) {
                            that.binding.showVideo = false;
                            that.binding.showAudio = true;
                            that.binding.showFrame = false;
                            try {
                                audio.src = url || getDocData();
                                if (typeof audio.load === "function") {
                                    audio.load();
                                }
                                if (typeof audio.play === "function") {
                                    audio.play();
                                }
                            } catch (e) {
                                Log.print(Log.l.error, "audio returned error:" + e);
                                AppData.setErrorMsg(pageBinding, e);
                            }
                            video = fragmentElement.querySelector("#noteVideo");
                            if (video) {
                                if (typeof video.pause === "function") {
                                    video.pause();
                                }
                                video.src = "";
                            }
                            frame = fragmentElement.querySelector("#noteFrame");
                            if (frame) {
                                frame.src = "";
                            }
                        } else {
                            that.removeMedia();
                        }
                    } else if (isFrame) {
                        frame = fragmentElement.querySelector("#noteFrame");
                        if (frame && url) {
                            that.binding.showVideo = false;
                            that.binding.showAudio = false;
                            that.binding.showFrame = true;
                            try {
                                frame.src = url;
                            } catch (e) {
                                Log.print(Log.l.error, "frame returned error:" + e);
                                AppData.setErrorMsg(pageBinding, e);
                            }
                            audio = fragmentElement.querySelector("#noteAudio");
                            if (audio) {
                                if (typeof audio.pause === "function") {
                                    audio.pause();
                                }
                                audio.src = "";
                            }
                            video = fragmentElement.querySelector("#noteVideo");
                            if (video) {
                                if (typeof video.pause === "function") {
                                    video.pause();
                                }
                                video.src = "";
                            }
                        } else {
                            that.removeMedia();
                        }
                    } else {
                        that.removeMedia();
                    }
                }
                Log.ret(Log.l.trace);
            };
            this.bindMedia = bindMedia;

            var loadData = function (noteId, url) {
                var ret;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "noteId=" + noteId + " url=" + url);
                if (url) {
                    that.bindMedia(url);
                    ret = WinJS.Promise.as();
                } else if (noteId) {
                    AppData.setErrorMsg(pageBinding);
                    ret = VideoMedia.sketchDocView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "WavSketch.sketchDocView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.noteId = json.d.KontaktNotizVIEWID;
                            that.resultConverter(json.d);
                            that.binding.dataSketch = json.d;
                            if (hasDoc()) {
                                Log.print(Log.l.trace,
                                    "Video/Audio: " +
                                    getDocData().substr(0, 100) +
                                    "...");
                            }
                        }
                        that.bindMedia();
                    },
                    function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(pageBinding, errorResponse);
                        that.removeMedia();
                    },
                    noteId);
                } else {
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var removeDoc = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.removeMedia();
                Log.ret(Log.l.trace);
            }
            this.removeDoc = removeDoc;

            var saveData = function (complete, error) {
                //wav can't be changed
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                });
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            var deleteData = function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.deleteData = deleteData;

            // define handlers
            this.eventHandlers = {
            };

            this.disableHandlers = {
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                if (options && options.url) {
                    that.bindMedia(options.url);
                    return WinJS.Promise.as();
                } else {
                    return that.loadData(options && options.noteId);
                }
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



