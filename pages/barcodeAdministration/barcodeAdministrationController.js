﻿// controller for page: mailing
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
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
/// <reference path="~/www/pages/barcodeAdministration/barcodeAdministrationService.js" />


(function () {
    "use strict";

    var namespaceName = "BarcodeAdministration";

    WinJS.Namespace.define("BarcodeAdministration", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");

            var listView = pageElement.querySelector("#barcodeAdministration.listview");

            Application.RecordsetController.apply(this, [pageElement, {
            }, commandList, false, BarcodeAdministration.fragebogenZeileBCView, null, listView]);

            this.questionslistBarcode = null;
            this.checkingQuestionareBarcodePDFFlag = false;

            var that = this;


            this.resultConverter = function (item, index) {
                item.index = index;
            };

            var layout = null;

            var printElementById = function (id) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "id=" + id);
                var mywindow = window.open('', 'PRINT', 'resizable=1,height=800,width=1200');
                mywindow.document.write('<html><head><title>' + getResourceText("barcodeAdministration.title") + '</title>');
                mywindow.document.write('</head><body >');
                mywindow.document.write((document.getElementById(id)).querySelector(".win-surface").innerHTML);
                //mywindow.document.write('<style> .barcodeAdministration-content {width: 100%; font-family: "Segoe UI",sans-serif,"Segoe MDL2 Assets",Symbols,"Segoe UI Emoji"; orientation: landscape; transform: scale(66%); transform-origin: left top; page-break-inside: avoid}.frage-container {width: 100%; page-break-inside: avoid}.barcode-item { width: 480px; margin-right: 20px;overflow: hidden;float: left; page-break-inside: avoid}.barcode-items{page-break-inside: avoid} @media print {.frage-container {width: 100%; page-break-inside; avoid}}.barcode-frage-titel {display: inline;width: 100%; font-size: 25px; float: left;word-break: break-word;}.barcode-items{page-break-inside: avoid} .barcode-item { width: 480px; margin-right: 20px;overflow: hidden;float: left; page-break-inside: avoid} .barcode-antwort-text {height: 200px;display: block;margin-left: 8px; font-size: 25px; word-break: break-word;}</style>');
                //mywindow.document.write('<style> .barcodeAdministration-content {width: 100%; zoom: 0.6; orientation: landscape; page-break-inside: avoid}.frage-container {width: 100%; page-break-inside: avoid}.barcode-items{page-break-inside: avoid} @media print {.frage-container {width: 100%; page-break-inside; avoid}}.barcode-frage-titel {display: inline;width: 100%; font-size: 25px; float: left;}.barcode-items{page-break-inside: avoid} .barcode-item { width: 450px; height: 170px; margin-right: 150px;margin-bottom: 120px;overflow: hidden;float: left; page-break-inside: avoid} .barcode-antwort-text {display: block;margin-left: 8px; font-size: 25px;}</style>');
                mywindow.document.write('<style> @supports (-ms-ime-align: auto) {body {zoom: 75%;}}' +
                    '@media print{@page {size: A4 landscape;max-height:100%; max-width:100%}}' +
                    'body {size: landscape;}' +
                    '.barcodeAdministration-content {width: 100%;}' +
                    '.frage-container {width: 100%;}' +
                    '.barcode-frage-titel {display: inline;width: 100%;font-size: 16.5px;float: left;word-break: break-word;}' +
                    '.barcode-item {width: 180px;height: 170px;margin-right: 180px;margin-bottom: 105px;overflow: hidden;float: left;}' +
                    '.barcode-antwort-text {display: block;margin-left: 8px;font-size: 16.5px;word-break: break-word;}' +
                    '</style>');
                mywindow.document.write('</body></html>');
                mywindow.document.close();
                mywindow.focus();
                mywindow.print();
                mywindow.close();
                Log.ret(Log.l.trace);
                return true;
            }

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

            var exportQuestionnaireBarcodePdf = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                var ret = BarcodeAdministration.barcodeExportPdfView.select(function (json) {
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
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportQuestionnaireBarcodePdf = exportQuestionnaireBarcodePdf;

            var checkingQuestionnaireBarcodePdf = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                var ret = BarcodeAdministration.barcodeExportPdfView.select(function (json) {
                    Log.print(Log.l.trace, "exportKontaktDataView: success!");
                    if (json && json.d && json.d.results) {
                        var results = json.d.results[0];
                        if (!results) {
                            that.checkingQuestionareBarcodePDFFlag = false;
                        } else {
                            that.checkingQuestionareBarcodePDFFlag = true;
                        }
                        AppBar.busy = false;
                    }
                }, function (errorResponse) {
                    AppBar.busy = false;
                    AppData.setErrorMsg(that.binding, errorResponse);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.checkingQuestionnaireBarcodePdf = checkingQuestionnaireBarcodePdf;

            /*this.beforeprint = function (event) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                /*var listSurface = pageElement.querySelector("#barcodeAdministration .win-surface");
                var height = listSurface.clientHeight;
                if (listSurface) {
                    var printSurface = document.createElement("div");
                    WinJS.Utilities.addClass(printSurface, "barcode-print-surface");
                    printSurface.style.height = height.toString(); //height.toString()height.toString() +
                    printSurface.innerHTML = listSurface.innerHTML;
                    document.body.insertBefore(printSurface, document.body.firstElementChild);
                }
                setTimeout(function () {
                    printElementById("barcodeAdministration");
                }, 100);
            }*/
            /*this.afterprint = function (event) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var printSurface = document.querySelector(".barcode-print-surface");
                if (printSurface) {
                    document.body.removeChild(printSurface);
                    printSurface.innerHTML = "";
                }
            }*/
            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickPdf: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.exportQuestionnaireBarcodePdf();
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    } else {
                        Application.navigateById(Application.startPageId, event);
                    }
                    Log.ret(Log.l.trace);
                },
                KeyPress: function(e) {
                    // Ensure event is not null
                    e = e || window.event;

                    if ((e.which === 80 || e.keyCode === 80) && e.ctrlKey) {
                        // Ctrl + Z
                        // Do Something
                        e.preventDefault();
                    }
                    setTimeout(function () {
                        printElementById("barcodeAdministration");
                    }, 100);
                },
                clickbeforeprint: function (event) {
                    printElementById("barcodeAdministration");
                    Log.ret(Log.l.trace);
                },
                /*clickafterprint: function (event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    /*var printSurface = document.querySelector(".barcode-print-surface");
                    if (printSurface) {
                        document.body.removeChild(printSurface);
                        printSurface.innerHTML = "";
                    }
                },*/
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.BarcodeAdministration.BarcodeAdministrationLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.records) {
                                for (var i = 0; i < that.records.length; i++) {
                                    var itemElement = listView.winControl.elementFromIndex(i);
                                    if (itemElement) {
                                        var barcodeImages = itemElement.querySelectorAll(".barcode-image");
                                        if (barcodeImages) {
                                            for (var j = 0; j < barcodeImages.length; j++) {
                                                var barcodeImage = barcodeImages[j];
                                                if (barcodeImage && barcodeImage.barcode) {
                                                    var name = "barcode_" + i + "_" + j;
                                                    barcodeImage.setAttribute("name", name);
                                                    var value = barcodeImage.barcode.substring(9, 13);
                                                    JsBarcode("[name=" + name + "]",
                                                        value,
                                                        { height: 50, displayValue: false });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
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
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                clickOk: function () {
                    // always enabled!
                    return false;
                },
                clickBack: function () {
                    // always enabled!
                    return false;
                },
                clickPdf: function () {
                    if (that.checkingQuestionareBarcodePDFFlag === false) {
                         return true;
                    } else {
                         return false;
                    }
                },
                clickafterprint: function () {
                    return false;
                }/*,
                clickbeforeprint: function() {
                    return false;
                }*/
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
            }

            // Finally, wire up binding
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                that.checkingQuestionnaireBarcodePdf();
            }).then(function () {
                Log.print(Log.l.trace, "checkingQuestionnaireBarcodePdf returned");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();