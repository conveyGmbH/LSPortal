// controller for page: GenDataModDetails
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataModDetails/genDataModDetailsService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    
    WinJS.Namespace.define("GenDataModDetails", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
                Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                Application.RecordsetController.apply(this, [pageElement, {
                    modData: null,
                    modpaData: null,
                    newmodData: getEmptyDefaultValue(GenDataModDetails.adresseView.defaultValue),
                    newmodlabel: getResourceText("genDataModDetails.newmodlabel"),
                    fileInfo: "",
                    docId: 0,
                    dataDoc: {},
                    pExist: 0
                }, commandList]);
            
                var that = this;

                // select combo
                var initAnrede = pageElement.querySelector("#InitAnrede");
                var initLand = pageElement.querySelector("#InitLand");
                var newmod = pageElement.querySelector("#newmod");
                var kategorie = pageElement.querySelector("#InitKategorie");
                var kategorienew = pageElement.querySelector("#InitKategorieNew");
                var dropZone = pageElement.querySelector("#dropzone");
                var fileOpener = pageElement.querySelector("input[type=file]");
                var modPicture = pageElement.querySelector("#modpicture");
                var picChangeButton = pageElement.querySelector("#picchange");

                var firstname = pageElement.querySelector("#firstname");
                var email = pageElement.querySelector("#email");

                var checkAddModFields = function() {
                    Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                    if (!email.value) {
                        email.style.border = "2px solid red";
                        return false;
                    } else {
                        email.style.borderTop = "none";
                        email.style.borderLeft = "none";
                        email.style.borderRight = "none";
                        email.style.borderBottom = "1px solid grey";
                        return true;
                    }
                }
                this.checkAddModFields = checkAddModFields;

                var updateImage = function (wFormat, mimeType, fileName, result) {
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
                        var recordId = that.getAdresseId();
                        return GenDataModDetails.adresseDOC.update(function (response) {
                            // this callback will be called asynchronously
                            // when the response is available
                            AppBar.busy = false;
                            AppBar.modified = false;
                            Log.print(Log.l.trace, "adresseDOC update: success!");
                            that.loadData();
                            complete(response);
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, recordId, dataDoc);
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                };
                this.updateImage = updateImage;

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
                        DOC1AdresseVIEWID: that.binding.docId,
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
                        return GenDataModDetails.adresseDOC.insert(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            AppBar.busy = false;
                            Log.print(Log.l.trace, "adresseDOC insert: success!");
                            // select returns object already parsed from json file in response
                            that.loadData();
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, dataDoc);
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                };
                this.insertImage = insertImage;

                var resultConverter = function (item, index) {
                    item.index = index;
                    
                }
                this.resultConverter = resultConverter;

                function getFileData(file, name, type, size) {
                    var posExt = name.lastIndexOf(".");
                    var ext = (posExt >= 0) ? name.substr(posExt + 1) : "";
                    Log.call(Log.l.trace, "UploadMedia.Controller.", "name=" + name + " ext=" + ext + " type=" + type + " size=" + size);
                    that.binding.fileInfo = name + " (" + type + ") - " + size + " bytes";

                    var fileExtensions = GenDataModDetails.docFormatList.map(function (item) {
                        return item.fileExtension;
                    });
                    var index = fileExtensions.indexOf(type);
                    if (index < 0 || GenDataModDetails.docFormatList[index].mimeType !== type) {
                        var mimeTypes = GenDataModDetails.docFormatList.map(function (item) {
                            return item.mimeType;
                        });
                        index = mimeTypes.indexOf(type);
                    }
                    var docFormat = (index >= 0) ? GenDataModDetails.docFormatList[index] : null;
                    if (docFormat) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            // reader.result
                            if (reader.result) {
                                Log.print(Log.l.u1, "result=" + reader.result.substr(0, 64) + "...");

                                switch (docFormat.docGroup) {
                                    case 1: {
                                        if (that.binding.pExist > 0) {
                                           that.updateImage(docFormat.docFormat, type, name, reader.result);
                                        } else {
                                           that.insertImage(docFormat.docFormat, type, name, reader.result); 
                                        }
                                    }
                                        break;
                                }
                                // test wandle base64 to blob bzw. file und dann speicher
                                /*var blob = that.base64ToBlob(base64String, type);
                                saveAs(blob, "Test.txt");*/
                            }
                        };
                        reader.onerror = function (error) {
                            AppData.setErrorMsg(that.binding, error);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        AppData.setErrorMsg(that.binding, "unknown file type: " + type);
                    }
                    Log.ret(Log.l.trace);
                }
                that.getFileData = getFileData;

                // define handlers
                this.eventHandlers = {
                    clickBack: function (event) {
                        Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        if (WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickSave: function() {
                        Log.call(Log.l.trace, "Mailing.Controller.");
                        WinJS.Promise.as().then(function () {
                            that.saveData(function (response) {
                                Log.print(Log.l.trace, "prev Mail saved");
                                //AppBar.modified = true;
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "error saving mail");
                            });
                        }).then(function () {
                            that.loadData();
                        });

                        Log.ret(Log.l.trace);
                    },
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
                    onDragOver: function (event) {
                        if (event) {
                            event.stopPropagation();
                            event.preventDefault();
                            if (event.dataTransfer) {
                                event.dataTransfer.dropEffect = "copy";
                            }
                        }
                    },
                    onDrop: function (event) {
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
                    clickUpload: function (event) {
                        if (fileOpener) {
                            fileOpener.click();
                        }
                    },
                    clickAddMod: function(event) {
                        Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        var newMod = that.binding.newmodData;
                        var fieldcheck = that.checkAddModFields();
                        if (fieldcheck === true) {
                            AppData.setErrorMsg(that.binding);
                            AppData.call("PRC_CreatePerson", {
                                pPersonEMailID : newMod.EMail,
                                pPersonFirstname: newMod.Firstname,
                                pPersonLastname: newMod.Lastname,
                                pPersonCategoryID: parseInt(newMod.PersonCategoryID)
                            }, function (json) {
                                Log.print(Log.l.info, "call success!");
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(json.d.results[0].NewPersonAdresseID);
                                    }).then(function () {
                                        that.binding.newmodData = getEmptyDefaultValue(GenDataModDetails.adresseView.defaultValue);
                                        newmod.style.display = "none";
                                    });
                                }
                            }, function (error) {
                                Log.print(Log.l.error, "call error");
                            });
                        } else {
                            Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        }
                    },
                    clickOpenNewMod: function(event) {
                        Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        if (newmod.style.display === "none") {
                            newmod.style.display = "block";
                            that.binding.modData.AdresseVIEWID = null;
                        } else {
                            newmod.style.display = "none";
                            that.loadData();
                            that.binding.newmodData = getEmptyDefaultValue(GenDataModDetails.adresseView.defaultValue);
                            
                        }
                    },
                    onHeaderVisibilityChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        if (eventInfo && eventInfo.detail && listView) {
                            var visible = eventInfo.detail.visible;
                            if (visible) {
                                var contentHeader = listView.querySelector(".content-header");
                                if (contentHeader) {
                                    var halfCircle = contentHeader.querySelector(".half-circle");
                                    if (halfCircle && halfCircle.style) {
                                        if (halfCircle.style.visibility === "hidden") {
                                            halfCircle.style.visibility = "";
                                            WinJS.UI.Animation.enterPage(halfCircle);
                                        }
                                    }
                                }
                            }
                        }
                        Log.ret(Log.l.trace);
                    }
                };

         
                // Initialisiere Drag&Drop EventListener
                if (dropZone) {
                    this.addRemovableEventListener(dropZone, "dragover", this.eventHandlers.onDragOver.bind(this));
                    this.addRemovableEventListener(dropZone, "drop", this.eventHandlers.onDrop.bind(this));
                    this.addRemovableEventListener(dropZone, "click", this.eventHandlers.clickUpload.bind(this));
                }

                //Initialisiere fileOpener           
                if (fileOpener) {
                    var accept = "";
                    var mimeTypes = GenDataModDetails.docFormatList.map(function (item) {
                        return item.mimeType;
                    });
                    var uniqueMimeTypes = mimeTypes.filter(function (item, index) {
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

                this.disableHandlers = {
                    clickBack: function() {
                        if (WinJS.Navigation.canGoBack === true) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    clickSave: function () {
                        if (that.binding.modData && AppBar.modified && !AppBar.busy) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                };

                var selectCountry = function() {
                    Log.print(Log.l.trace, "selecting country");
                    if (!that.binding.modData.LandName) {
                            for (var j = 0; j < initLand.length; j++) {
                                if (initLand[j].value === "53") {
                                    initLand.selectedIndex = j;
                            }
                        }
                    }
                }
                this.selectCountry = selectCountry;

                var getAdresseId = function () {
                    return GenDataModDetails._adresseId;
                }
                that.getAdresseId = getAdresseId;

                var setAdresseId = function (value) {
                    Log.print(Log.l.trace, "adresseId=" + value);
                    GenDataModDetails._adresseId = value;
                }
                that.setAdresseId = setAdresseId;

                var getPersonAdresseId = function () {
                    return GenDataModDetails._personAdresseId;
                }
                that.getPersonAdresseId = getPersonAdresseId;

                var setPersonAdresseId = function (value) {
                    Log.print(Log.l.trace, "personadresseId=" + value);
                    GenDataModDetails._personAdresseId = value;
                }
                that.setPersonAdresseId = setPersonAdresseId;

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
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select contactView...");
                        return GenDataModDetails.initPersonKategorieView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "contactView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (kategorie && kategorie.winControl) {
                                    kategorie.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                                kategorie.selectedIndex = 0;
                                if (kategorienew && kategorienew.winControl) {
                                    kategorienew.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                                kategorienew.selectedIndex = 0;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    }).then(function () {
                        var recordId = getAdresseId();
                        that.binding.docId = getAdresseId();
                        if (recordId) {
                            //load of format relation record data
                            Log.print(Log.l.trace, "calling select contactView...");
                            return GenDataModDetails.adresseView.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "contactView: success!");
                                if (json && json.d && json.d.results) {
                                    // now always edit!
                                    var results = json.d.results;
                                    that.binding.modData = results[0];
                                }
                            }, function (errorResponse) {
                               
                            });
                        } 
                    }).then(function () {
                        var recordId = getPersonAdresseId();
                        if (recordId) {
                            //load of format relation record data
                            Log.print(Log.l.trace, "calling select contactView...");
                            return GenDataModDetails.personAdresseTable.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "contactView: success!");
                                if (json && json.d && json.d.results) {
                                    // now always edit!
                                    var results = json.d.results;
                                    that.binding.modpaData = results[0];
                                }
                            }, function (errorResponse) {
                                Log.print(Log.l.trace, "calling select contactView...");
                            });
                        }
                    }).then(function () {
                        var recordId = getAdresseId();
                        if (recordId) {
                            //load of format relation record data
                            Log.print(Log.l.trace, "calling select contactView...");
                            return GenDataModDetails.adresseDOC.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "contactView: success!");
                                if (json && json.d && json.d.results && json.d.results.length > 0) {
                                    // now always edit!
                                    var results = json.d.results;
                                    var key1 = "Content-Type:";
                                    var key2 = "Accept-Ranges:";
                                    var pos1 = json.d.results[0].DocContentDOCCNT1.indexOf(key1);
                                    var pos2 = json.d.results[0].DocContentDOCCNT1.indexOf(key2);
                                    var ContentType = json.d.results[0].DocContentDOCCNT1.substring(pos1 + key1.length, pos2).trim().replace("\r\n", "");
                                    var sub = results[0].DocContentDOCCNT1.search("\r\n\r\n");
                                    var data = results[0].DocContentDOCCNT1.substr(sub + 4);
                                    modPicture.src = "data: " + ContentType + ";base64," + data;
                                    that.binding.pExist = 1;
                                    dropZone.style.display = "none";
                                    modPicture.style.display = "block";
                                    picChangeButton.style.display = "block";
                                } else {
                                    that.binding.pExist = 0;
                                    modPicture.src = "";
                                    modPicture.style.display = "none";
                                    that.binding.fileInfo = "";
                                    dropZone.style.display = "block";
                                    picChangeButton.style.display = "none";
                                }
                            }, function (errorResponse) {
                                Log.print(Log.l.trace, "calling select contactView...");
                                }, { DOC1AdresseVIEWID: recordId});
                        }
                    }).then(function () {
                        Log.print(Log.l.trace, "select country");
                        return that.selectCountry();
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
                    Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                    AppData.setErrorMsg(that.binding);
                    var ret;
                    var dataMod = that.binding.modData;
                    if (dataMod && AppBar.modified && !AppBar.busy) {
                        var recordId = getAdresseId();
                        if (recordId) {
                            AppBar.busy = true;
                            ret = GenDataModDetails.adresseTable.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "dataMod update: success!");
                                AppBar.modified = false;
                                
                                complete(response);
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                                }, recordId, dataMod).then(function () {
                                //load of format relation record data
                                var datapaMod = that.binding.modpaData;
                                datapaMod.INITPersonKategorieID = parseInt(datapaMod.INITPersonKategorieID);
                                var recordId = getPersonAdresseId();
                                Log.print(Log.l.trace, "calling select contactView...");
                                ret = GenDataModDetails.personAdresseTable.update(function(response) {
                                        AppBar.busy = false;
                                        // called asynchronously if ok
                                        Log.print(Log.l.info, "dataMod update: success!");
                                        AppBar.modified = false;
                                        that.loadData();
                                        complete(response);
                                    },
                                    function(errorResponse) {
                                        AppBar.busy = false;
                                        // called asynchronously if an error occurs
                                        // or server returns response with an error status.
                                        AppData.setErrorMsg(that.binding, errorResponse);
                                        error(errorResponse);
                                    },
                                    recordId,
                                    datapaMod);
                            });
                        }
                    } else if (AppBar.busy) {
                        ret = WinJS.Promise.timeout(100).then(function () {
                            return that.saveData(complete, error);
                        });
                    } else {
                        ret = new WinJS.Promise.as().then(function () {
                            if (typeof complete === "function") {
                                complete(dataMod);//dataContact
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
                    AppBar.notifyModified = true;
                    Log.print(Log.l.trace, "Record selected");
                });
                Log.ret(Log.l.trace);
            })
    });
})();