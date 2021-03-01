// controller for page: imgMedia
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/uploadMedia/uploadMediaService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("UploadMedia", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "UploadMedia.Controller.", "docId=" + (options && options.docId));

            Fragments.Controller.apply(this, [fragmentElement, {
                docId: options && options.docId,
                fileInfo: "",
                dataDoc: {}
            }, commandList]);

            var dropZone = fragmentElement.querySelector("#dropzone");
            var fileOpener = fragmentElement.querySelector("input[type=file]");

            var that = this;

            /*var base64ToBlob = function (base64Data, contentType) {
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
            this.base64ToBlob = base64ToBlob;*/

            var insertImage = function (wFormat, mimeType, fileName, result) {
                var cameraQuality = 80;
                var ovwEdge = 256;
                var prevEdge = 1920;
                var prevLength = 0;
                var err = null;
                Log.call(Log.l.trace, "UploadMedia.Controller.");
                AppData.setErrorMsg(that.binding);

                var img = new Image();
                img.src = result;

                var imageData = result.split(',')[1];

                var dataDoc = {
                    wFormat: wFormat,
                    ColorType: 11,
                    ulDpm: 0,
                    szOriFileNameDOC1: fileName,
                    ulOvwEdge: ovwEdge,
                    ulPrevEdge: prevEdge,
                    ContentEncoding: 4096
                }
                // UTC-Zeit in Klartext
                var now = new Date();
                var dateStringUtc = now.toUTCString();

                var ret = new WinJS.Promise.as().then(function () {
                    return WinJS.Promise.timeout(50);
                }).then(function () {
                    var width = img.width;
                    var height = img.height;
                    Log.print(Log.l.trace, "width=" + width + " height=" + height);
                    if (width && height && (width < 3840 || height < 3840) || imageData.length < 1000000) {
                        dataDoc.ulWidth = width;
                        dataDoc.ulHeight = height;
                        // keep original 
                        return WinJS.Promise.as();
                    }
                    return Colors.resizeImageBase64(imageData, "image/jpeg", 3840, cameraQuality, 0.25);
                }).then(function (resizeData) {
                    if (resizeData) {
                        Log.print(Log.l.trace, "resized");
                        imageData = resizeData;
                        mimeType = "image/jpeg";
                        var posExt = fileName.lastIndexOf(".");
                        if (posExt >= 0) {
                            fileName = fileName.substr(0, posExt) + ".jpg";
                        } else {
                            fileName += ".jpg";
                        }
                        dataDoc.wFormat = 3;
                        img.src = "data:image/jpeg;base64," + imageData;
                        return WinJS.Promise.timeout(50);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    return Colors.resizeImageBase64(imageData, "image/jpeg", prevEdge, cameraQuality);
                }).then(function (prevData) {
                    if (prevData && prevData.length < imageData.length) {
                        var contentLengthPrev = Math.floor(prevData.length * 3 / 4);
                        dataDoc.PrevContentDOCCNT2 =
                            "Content-Type: image/jpegAccept-Ranges: bytes\x0D\x0ALast-Modified: " +
                            dateStringUtc +
                            "\x0D\x0AContent-Length: " +
                            contentLengthPrev +
                            "\x0D\x0A\x0D\x0A" +
                            prevData;
                        prevLength = prevData.length;
                    } else {
                        prevLength = imageData.length;
                    }
                    return Colors.resizeImageBase64(prevData || imageData, "image/jpeg", ovwEdge, cameraQuality);
                }).then(function (ovwData) {
                    dataDoc.ulWidth = img.width;
                    dataDoc.ulHeight = img.height;

                    // decodierte Dateigröße
                    var contentLength = Math.floor(imageData.length * 3 / 4);

                    dataDoc.DocContentDOCCNT1 = "Content-Type: " + mimeType + "Accept-Ranges: bytes\x0D\x0ALast-Modified: " +
                        dateStringUtc +
                        "\x0D\x0AContent-Length: " +
                        contentLength +
                        "\x0D\x0A\x0D\x0A" +
                        imageData;

                    if (ovwData && ovwData.length < prevLength) {
                        var contentLengthOvw = Math.floor(ovwData.length * 3 / 4);
                        dataDoc.OvwContentDOCCNT3 =
                            "Content-Type: image/jpegAccept-Ranges: bytes\x0D\x0ALast-Modified: " +
                            dateStringUtc +
                            "\x0D\x0AContent-Length: " +
                            contentLengthOvw +
                            "\x0D\x0A\x0D\x0A" +
                            ovwData;
                    }
                    AppBar.busy = true;
                    return UploadMedia.docView.insert(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "docView insert: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.dataDoc = json.d;
                            that.binding.docId = json.d.DOC1MandantDokumentVIEWID;
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                    dataDoc, that.binding.docId, 1);
                }).then(function () {
                    if (AppBar.scope && typeof AppBar.scope.loadList === "function") {
                        return AppBar.scope.loadList(that.binding.docId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (AppBar.scope && typeof AppBar.scope.loadDoc === "function") {
                        return AppBar.scope.loadDoc(that.binding.docId, 1, wFormat);
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.insertImage = insertImage;

            function getFileData(file, name, type, size) {
                var posExt = name.lastIndexOf(".");
                var ext = (posExt >= 0) ? name.substr(posExt + 1) : "";
                Log.call(Log.l.trace, "UploadMedia.Controller.", "name=" + name + " ext=" + ext + " type=" + type + " size=" + size);
                that.binding.fileInfo = name + " (" + type + ") - " + size + " bytes";

                var fileExtensions = UploadMedia.docFormatList.map(function(item) {
                    return item.fileExtension;
                });
                var index = fileExtensions.indexOf(type);
                if (index < 0 || UploadMedia.docFormatList[index].mimeType !== type) {
                    var mimeTypes = UploadMedia.docFormatList.map(function(item) {
                        return item.mimeType;
                    });
                    index = mimeTypes.indexOf(type);
                }
                var docFormat = (index >= 0) ? UploadMedia.docFormatList[index] : null;
                if (docFormat) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        // reader.result
                        if (reader.result) {
                            Log.print(Log.l.u1, "result=" + reader.result.substr(0, 64) + "...");

                            switch (docFormat.docGroup) {
                                case 1: {
                                    that.insertImage(docFormat.docFormat, type, name, reader.result);
                                }
                                break;
                            }

                            // test wandle base64 to blob bzw. file und dann speicher
                            /*var blob = that.base64ToBlob(base64String, type);
                            saveAs(blob, "Test.txt");*/
                        }
                    };
                    reader.onerror = function(error) {
                        AppData.setErrorMsg(that.binding, error);
                    };
                    reader.readAsDataURL(file);
                } else {
                    AppData.setErrorMsg(that.binding, "unknown file type: " + type);
                }
                Log.ret(Log.l.trace);
            }
            that.getFileData = getFileData;

            var eventHandlers = {
                handleFileChoose: function (event) {
                    if (event && event.target) {
                        // FileList-Objekt des input-Elements auslesen, auf dem 
                        // das change-Event ausgelöst wurde (event.target)
                        var files = event.target.files;
                        for (var i = 0; i < files.length; i++) {
                            getFileData(files[i], files[i].name, files[i].type, files[i].size);
                        }
                    }
                },
                onDragOver: function(event) {
                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (event.dataTransfer) {
                            event.dataTransfer.dropEffect = "copy";
                        }
                    }
                },
                onDrop: function(event) {
                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (event.dataTransfer) {
                            var files = event.dataTransfer.files; // FileList Objekt
                            for (var i = 0; i < files.length; i++) {
                                getFileData(files[i], files[i].name, files[i].type, files[i].size);
                            }
                        }
                    }
                },
                clickUpload: function(event) {
                    if (fileOpener) {
                        fileOpener.click();
                    }
                }
            };
            this.eventHandlers = eventHandlers;
            
            // Initialisiere Drag&Drop EventListener
            if (dropZone) {
                this.addRemovableEventListener(dropZone, "dragover", this.eventHandlers.onDragOver.bind(this));
                this.addRemovableEventListener(dropZone, "drop", this.eventHandlers.onDrop.bind(this));
            }

            //Initialisiere fileOpener           
            if (fileOpener) {
                var accept = "";
                var mimeTypes = UploadMedia.docFormatList.map(function(item) {
                    return item.mimeType;
                });
                var uniqueMimeTypes = mimeTypes.filter(function(item, index) {
                    return mimeTypes.indexOf(item) === index;
                });
                for (var i = 0; i < uniqueMimeTypes.length; i++) {
                    if (accept) {
                        accept += ",";
                    }
                    accept += uniqueMimeTypes[i];
                }
                fileOpener.setAttribute("accept", accept);
                this.addRemovableEventListener(fileOpener, "change", this.eventHandlers.handleFileChoose.bind(this));
            }

            var setDocId = function(docId) {
                that.binding.docId = docId;
            }
            this.setDocId = setDocId;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                that.updateCommands();
            });
            Log.ret(Log.l.trace);
        })
    });
})();



