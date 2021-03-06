﻿// controller for page: contact
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/event/eventService.js" />
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/OpenXml/scripts/linq.js" />
/// <reference path="~/www/lib/OpenXml/scripts/ltxml.js" />
/// <reference path="~/www/lib/OpenXml/scripts/ltxml-extensions.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-load.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-inflate.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-deflate.js" />
/// <reference path="~/www/lib/OpenXml/scripts/FileSaver.js" />
/// <reference path="~/www/lib/OpenXml/scripts/openxml.js" />
/// <reference path="~/www/lib/base64js/scripts/base64js.min.js" />
/// <reference path="~/www/pages/contactResultsEdit/contactResultsEditService.js" />



(function () {
    "use strict";
    var b64 = window.base64js;
    WinJS.Namespace.define("ContactResultsEdit", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Contact.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataContact: getEmptyDefaultValue(Contact.contactView.defaultValue),
                dataContactAudio: getEmptyDefaultValue(Contact.exportAudioDataView.defaultValue),
                InitAnredeItem: { InitAnredeID: 0, TITLE: "" },
                InitLandItem: { InitLandID: 0, TITLE: "" },
                showPhoto: false,
                showModified: false,
                modifyData: null,
                editData: null
            }, commandList]);
            this.img = null;
            var that = this;

            // select combo
            var initAnrede = pageElement.querySelector("#InitAnrede");
            var initLand = pageElement.querySelector("#InitLand");
            var textComment = pageElement.querySelector(".input_text_comment");

            //pdf exists flag
            var pdfExists = false;
            var audioExists = false;

            // show business card photo
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

            var month = null;

            var photoview = pageElement.querySelector("#contactPhoto.photoview");

            var getPhotoData = function() {
                return AppData._photoData;
            }

            var hasDoc = function() {
                return (typeof getPhotoData() === "string" && getPhotoData() !== null);
            }
            this.hasDoc = hasDoc;

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
            
            var getDateObject = function (modifyDate, editDate) {
                var dateString, milliseconds, time;
                if (modifyDate) {
                     dateString = modifyDate.replace("\/Date(", "").replace(")\/", "");
                     milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                     time = new Date(milliseconds);
                     that.binding.modifyData = ("0" + time.getDate()).slice(-2) + "." + ("0" + (time.getMonth() + 1)).slice(-2) + "." + time.getFullYear();
                     Log.call(Log.l.trace, "Contact.Controller.");
                }
                if (editDate) {
                     dateString = editDate.replace("\/Date(", "").replace(")\/", "");
                     milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                     time = new Date(milliseconds);
                     that.binding.editData = ("0" + time.getDate()).slice(-2) + "." + ("0" + (time.getMonth() + 1)).slice(-2) + "." + time.getFullYear();
                     Log.call(Log.l.trace, "Contact.Controller.");
                }
                Log.call(Log.l.trace, "Contact.Controller.");
            };
            this.getDateObject = getDateObject;

            this.dispose = function () {
                if (initAnrede && initAnrede.winControl) {
                    initAnrede.winControl.data = null;
                }
                if (initLand && initLand.winControl) {
                    initLand.winControl.data = null;
                }
                if (that.img) {
                    removePhoto();
                    that.img.src = "";
                    that.img = null;
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
                    var containerWidth = 340; //photoview.clientWidth
                    var containerHeight = 190; //photoview.clientHeight

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
                            imgRotation = 0;
                            var containerWidth = photoview.clientWidth;
                            if (containerWidth < that.img.naturalWidth) {
                                imgScale = containerWidth / that.img.naturalWidth;
                                imgWidth = containerWidth;
                            } else {
                                imgScale = 1;
                                imgWidth = that.img.naturalWidth;
                            }
                            imgHeight = that.img.naturalHeight * imgScale;
                            imgLeft = imgNaturalLeft * imgScale;
                            imgTop = imgNaturalTop * imgScale;
                            if (that.img.style) {
                                that.img.style.transform = "";
                                that.img.style.marginLeft = 0;
                                that.img.style.marginTop = 0;
                                that.img.style.width = imgWidth + "px";
                                that.img.style.height = imgHeight + "px";
                            }
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
                                    var promise = pageControl.updateLayout.call(pageControl, pageElement) || WinJS.Promise.as();
                                    promise.then(function () {
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

            var setDataContact = function(newDataContact) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                // Bug: textarea control shows 'null' string on null value in Internet Explorer!
                if (newDataContact.ModifiedTS) {
                    that.getDateObject(newDataContact.ModifiedTS, null);
                }
                if (newDataContact.Erfassungsdatum) {
                    that.getDateObject(null, newDataContact.Erfassungsdatum);
                }
                if (newDataContact.Bemerkungen === null) {
                    newDataContact.Bemerkungen = "";
                }
                that.binding.dataContact = newDataContact;
                if (!that.binding.dataContact.KontaktVIEWID) {
                    that.binding.dataContact.Nachbearbeitet = 1;
                }
                if (that.binding.dataContact.Erfassungsdatum === that.binding.dataContact.ModifiedTS) {
                    that.binding.showModified = false;
                } else {
                    that.binding.showModified = true;
                }
                if (textComment) {
                    if (that.binding.dataContact.Bemerkungen) {
                        WinJS.Utilities.addClass(textComment, "input_text_comment_big");
                    } else {
                        WinJS.Utilities.removeClass(textComment, "input_text_comment_big");
                    }
                }
                that.binding.dataContact.Mitarbeiter_Fullname = (that.binding.dataContact.Mitarbeiter_Vorname ? (that.binding.dataContact.Mitarbeiter_Vorname + " ") : "") + (that.binding.dataContact.Mitarbeiter_Nachname ? that.binding.dataContact.Mitarbeiter_Nachname : "");
                that.binding.dataContact.Bearbeiter_Fullname = (that.binding.dataContact.Bearbeiter_Vorname ? (that.binding.dataContact.Bearbeiter_Vorname + " ") : "") + (that.binding.dataContact.Bearbeiter_Nachname ? that.binding.dataContact.Bearbeiter_Nachname : "");
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            }
            this.setDataContact = setDataContact;

            var setInitLandItem = function(newInitLandItem) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.InitLandItem = newInitLandItem;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
            }
            this.setInitLandItem = setInitLandItem;

            var setInitAnredeItem = function (newInitAnredeItem) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.InitAnredeItem = newInitAnredeItem;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
            }
            this.setInitAnredeItem = setInitAnredeItem;

            var getRecordId = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                var recordId = AppData.getRecordId("Kontakt");
                if (!recordId) {
                    that.setDataContact(getEmptyDefaultValue(Contact.contactView.defaultValue));
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var setRecordId = function (recordId) {
                Log.call(Log.l.trace, "Contact.Controller.", recordId);
                if (!recordId) {
                    that.setDataContact(getEmptyDefaultValue(Contact.contactView.defaultValue));
                }
                AppData.setRecordId("Kontakt", recordId);
                Log.ret(Log.l.trace);
            }
            this.setRecordId = setRecordId;
            
            var getAudioData = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = Contact.exportAudioDataView.select(function (json) {
                        Log.print(Log.l.trace, "exportAudioDataView: success!");
                        if (json && json.d) {
                            var results = json.d.results;
                            var resultcount = results.length;
                            that.binding.dataContactAudio = results;
                            if (resultcount === 0) {
                                Log.print(Log.l.trace, "No Audio-File found!");
                                audioExists = false;
                            } else {
                                Log.print(Log.l.trace, "Audio-File found!");
                                audioExists = true;
                            }
                            AppBar.busy = false;
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, { KontaktID: recordId });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getAudioData = getAudioData;

            var exportContactAudio = function (audioData) {
                AppBar.busy = true;
                for (var i = 0; i < audioData.length; i++) {
                    var audioType = audioData[i].DocExt;
                    var audioDataraw = audioData[i].DocContentDOCCNT1;
                    var sub = audioDataraw.search("\r\n\r\n");
                    var audioDataBase64;
                    if(sub !== -1)
                        audioDataBase64 = audioDataraw.substr(sub + 4);
                    else
                        audioDataBase64 = audioDataraw;

                    var audioDatac = that.base64ToBlob(audioDataBase64, audioType);
                    var audioName = audioData[i].DateiName;
                    saveAs(audioDatac, audioName);
                }
                AppBar.busy = false;
            }
            this.exportContactAudio = exportContactAudio;

            var checkOnPdf = function() {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = Contact.exportKontaktDataView.select(function (json) {
                        Log.print(Log.l.trace, "exportKontaktDataView: success!");
                        if (json && json.d) {
                            var results = json.d.results[0];
                            if (!results) {
                                Log.print(Log.l.trace, "No PDF-File found!");
                                pdfExists = false;
                            } else {
                                Log.print(Log.l.trace, "PDF-File found!");
                                pdfExists = true;
                            }
                            AppBar.busy = false;
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, { KontaktID: recordId });
                } 
                Log.ret(Log.l.trace);
                return ret;
            }
            this.checkOnPdf = checkOnPdf;

            var base64ToBlob = function (base64Data, contentType) {
                contentType = contentType || '';
                var sliceSize = 1024;
                var byteCharacters = atob(base64Data);
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

            var exportContactPdf = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = Contact.exportKontaktDataView.select(function (json) {
                        Log.print(Log.l.trace, "exportKontaktDataView: success!");
                        if (json && json.d) {
                            var results = json.d.results[0];
                            var pdfDataraw = results.DocContentDOCCNT1;
                            var sub = pdfDataraw.search("\r\n\r\n");
                            var pdfDataBase64 = pdfDataraw.substr(sub + 4);
                            var pdfData = that.base64ToBlob(pdfDataBase64, "pdf");
                            var pdfName = results.szOriFileNameDOC1;
                            saveAs(pdfData, pdfName);
                            AppBar.busy = false;
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                        }, { KontaktID: recordId});
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportContactPdf = exportContactPdf;

            var deleteData = function (complete, error) {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = getRecordId();
                if (recordId) {
                        AppData.setErrorMsg(that.binding);
                        AppData.call("PRC_DeleteKontakt", {
                            pKontaktID: recordId
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                            var master = Application.navigator.masterControl;
                            master.controller.deleteContactLineInList();
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

            var resultMandatoryConverter = function (item, index) {
                if (item.FieldFlag) {
                    var inputfield = null;
                    if (item.AttributeName === "AnredeID") {
                        inputfield = pageElement.querySelector("#InitAnrede");
                    } else if (item.AttributeName === "LandID") {
                        inputfield = pageElement.querySelector("#InitLand");
                    } else {
                        inputfield = pageElement.querySelector("input[name=" + item.AttributeName + "]");
                    }
                    if (inputfield) {
                        WinJS.Utilities.addClass(inputfield, "mandatory-bkg");
                    }
                }
            };
            this.resultMandatoryConverter = resultMandatoryConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickExport: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    that.exportContactPdf();
                    Log.ret(Log.l.trace);
                },
                clickExportAudio: function() {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    that.exportContactAudio(that.binding.dataContactAudio);
                    Log.ret(Log.l.trace);
                },
                clickNew: function(event){
                    Log.call(Log.l.trace, "Contact.Controller.");
                    Application.navigateById(Application.navigateNewId, event);
                    Log.ret(Log.l.trace);
                },
                clickDelete: function(event){
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var confirmTitle = getResourceText("contact.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace,"clickDelete: user choice OK");
                            deleteData(function(response) {
                                // delete OK - goto start
                            }, function(errorResponse) {
                                // delete ERROR
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
                            });
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                blockEnterKey: function (event) {
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward")
                            AppBar.commandList[i].key = null;
                    }

                },
                releaseEnterKey: function (event) {
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward")
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                    }
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "contact saved");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                            master.controller.loadData(master.controller.binding.contactId).then(function () {
                                master.controller.selectRecordId(that.binding.dataContact.KontaktVIEWID);
                            });
                        }
                    },
                        function (errorResponse) {
                            Log.print(Log.l.error, "error saving employee");
                        });

                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickZoomIn: function(event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
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
                    Log.call(Log.l.trace, "Contact.Controller.");
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
                    Log.call(Log.l.trace, "Contact.Controller.");
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
                    Log.call(Log.l.trace, "Contact.Controller.");
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
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    Application.navigateById("publish", event);
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
                clickBack: function() {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickExport: function() {
                    if (pdfExists === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickExportAudio: function () {
                    if (audioExists === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickNew: function() {
                    if (that.binding.dataContact && that.binding.dataContact.KontaktVIEWID) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickDelete: function() {
                    if (that.binding.dataContact && that.binding.dataContact.KontaktVIEWID && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                },
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
                    if (getPhotoData()) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickRotateRight: function () {
                    if (getPhotoData()) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickForward: function () {
                    return AppBar.busy;
                }
            }

            var loadInitSelection = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                if (typeof that.binding.dataContact.KontaktVIEWID !== "undefined") {
                    var map, results, curIndex;
                    if (typeof that.binding.dataContact.INITAnredeID !== "undefined") {
                        Log.print(Log.l.trace, "calling select initAnredeData: Id=" + that.binding.dataContact.INITAnredeID + "...");
                        map = AppData.initAnredeView.getMap();
                        results = AppData.initAnredeView.getResults();
                        if (map && results) {
                            curIndex = map[that.binding.dataContact.INITAnredeID];
                            if (typeof curIndex !== "undefined") {
                                that.setInitAnredeItem(results[curIndex]);
                            }
                        }
                    }
                    if (typeof that.binding.dataContact.INITLandID !== "undefined") {
                        Log.print(Log.l.trace, "calling select initLandData: Id=" + that.binding.dataContact.INITLandID + "...");
                        map = AppData.initLandView.getMap();
                        results = AppData.initLandView.getResults();
                        if (map && results) {
                            curIndex = map[that.binding.dataContact.INITLandID];
                            if (typeof curIndex !== "undefined") {
                                that.setInitLandItem(results[curIndex]);
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
                return WinJS.Promise.as();
            }
            this.loadInitSelection = loadInitSelection;

            var loadData = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!AppData.initAnredeView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initAnredeData...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return AppData.initAnredeView.select(function (json) {
                            Log.print(Log.l.trace, "initAnredeView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initAnrede && initAnrede.winControl) {
                                    initAnrede.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initAnrede && initAnrede.winControl &&
                            (!initAnrede.winControl.data || !initAnrede.winControl.data.length)) {
                            initAnrede.winControl.data = new WinJS.Binding.List(AppData.initAnredeView.getResults());
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!AppData.initLandView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initLandData...");
                        //@nedra:25.09.2015: load the list of INITLand for Combobox
                        return AppData.initLandView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "initLandView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initLand && initLand.winControl) {
                                    initLand.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initLand && initLand.winControl &&
                            (!initLand.winControl.data || !initLand.winControl.data.length)) {
                            initLand.winControl.data = new WinJS.Binding.List(AppData.initLandView.getResults());
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    return Contact.mandatoryView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "MandatoryList.mandatoryView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            //that.nextUrl = MandatoryList.mandatoryView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultMandatoryConverter(item, index);
                            });
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        LanguageSpecID: AppData.getLanguageId()
                    });

                }).then(function () {
                    var recordId = getRecordId();
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select contactView...");
                        return Contact.contactView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "contactView: success!");
                            if (json && json.d) {
                                // now always edit!
                                json.d.Flag_NoEdit = AppRepl.replicator && AppRepl.replicator.inFastRepl;
                                that.setDataContact(json.d);
                                var importCardscanId = AppData.getRecordId("DOC1IMPORT_CARDSCAN");
                                if (importCardscanId !== json.d.DOC1Import_CardscanID) {
                                    AppData._photoData = null;
                                    AppData.setRecordId("DOC1IMPORT_CARDSCAN", json.d.DOC1Import_CardscanID);
                                }
                                loadInitSelection();
                                that.checkOnPdf();
                                that.getAudioData();
                            }
                        }, function (errorResponse) {
                            AppData._photoData = null;
                            AppData.setRecordId("DOC1IMPORT_CARDSCAN", null);
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        AppData._photoData = null;
                        AppData.setRecordId("DOC1IMPORT_CARDSCAN", null);
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (getPhotoData()) {
                        showPhoto();
                        return WinJS.Promise.as();
                    } else {
                        var importCardscanId = AppData.getRecordId("DOC1IMPORT_CARDSCAN");
                        if (importCardscanId) {
                            // todo: load image data and set src of img-element
                            Log.print(Log.l.trace, "calling select contactView...");
                            return Contact.cardScanView.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "cardScanData: success!");
                                if (json && json.d) {
                                    var docContent;
                                    //if (json.d.wFormat === 1) {
                                    //    docContent = json.d.PrevContentDOCCNT2;
                                    //} else {
                                        docContent = json.d.DocContentDOCCNT1;
                                    //}
                                    if (docContent) {
                                        var sub = docContent.search("\r\n\r\n");
                                        if (sub >= 0) {
                                            var data = docContent.substr(sub + 4);
                                            if (data && data !== "null") {
                                                AppData._photoData = data;
                                            } else {
                                                AppData._photoData = null;
                                            }
                                        } else {
                                            AppData._photoData = null;
                                        }
                                    } else {
                                        AppData._photoData = null;
                                    }
                                } else {
                                    AppData._photoData = null;
                                }
                                showPhoto();
                            }, function (errorResponse) {
                                AppData._photoData = null;
                                showPhoto();
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, importCardscanId);
                        } else {
                            AppData._photoData = null;
                            showPhoto();
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataContact = that.binding.dataContact;
                // set Nachbearbeitet empty!
                if (!dataContact.Nachbearbeitet) {
                    dataContact.Nachbearbeitet = null;
                } else {
                    dataContact.Nachbearbeitet = 1;
                }
                if (dataContact && AppBar.modified && !AppBar.busy) {
                    var recordId = getRecordId();
                    if (recordId) {
                        AppBar.busy = true;
                        ret = Contact.contactView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "contactData update: success!");
                            AppBar.modified = false;
                            AppData.getContactData();
                            complete(response);
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                        }, recordId, dataContact).then(function() {
                            //load of format relation record data
                            Log.print(Log.l.trace, "calling select contactView...");
                            return Contact.contactView.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "contactView: success!");
                                if (json && json.d) {
                                    // now always edit!
                                    json.d.Flag_NoEdit = AppRepl.replicator && AppRepl.replicator.inFastRepl;
                                    that.setDataContact(json.d);
                                    loadInitSelection();
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, recordId);
                        });
                    } else {
                        dataContact.HostName = (window.device && window.device.uuid);
                        dataContact.MitarbeiterID = AppData.getRecordId("Mitarbeiter");
                        dataContact.VeranstaltungID = AppData.getRecordId("Veranstaltung");
                        AppBar.busy = true;
                        ret = Contact.contactView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "contactData insert: success!");
                            // contactData returns object already parsed from json file in response
                            if (json && json.d) {
                                // now always edit!
                                json.d.Flag_NoEdit = AppRepl.replicator && AppRepl.replicator.inFastRepl;
                                that.setDataContact(json.d);
                                setRecordId(that.binding.dataContact.KontaktVIEWID);
                                AppData.getUserData();
                            }
                            complete(json);
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                        }, dataContact);
                    }
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function() {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataContact);//dataContact
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                
                Log.print(Log.l.trace, "Checking if there is a PDF-File!");
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });

            Log.ret(Log.l.trace);
        })
    });
})();


