// controller for page: imgMedia
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/pdfMedia/pdfMediaService.js" />

(function () {
    "use strict";

    var namespaceName = "PdfMedia";

    WinJS.Namespace.define("PdfMedia", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.", "docId=" + (options && options.docId));
            Fragments.Controller.apply(this, [fragmentElement, {
                docId: null,
                dataDoc: {}
            }, commandList]);
            this.iFrame = fragmentElement.querySelector("#pdfFrame");

            var that = this;

            var getDocData = function () {
                return that.binding.dataDoc && that.binding.dataDoc.docData;
            }
            var hasDoc = function () {
                return (getDocData() && typeof getDocData() === "string");
            }
            this.hasDoc = hasDoc;

            this.dispose = function () {
                that.removeDoc();
            }

            var resultConverter = function (item, index) {
                if (item) {
                    that.binding.docId = item.MandantDokumentVIEWID;
                    if (item.DocContentDOCCNT1 && AppData.isPdf(item.DocGroup, item.DocFormat) && item.ContentEncoding === 4096) {
                        var sub = item.DocContentDOCCNT1.search("\r\n\r\n");
                        if (sub >= 0) {
                            item.ContentType = "application/pdf";
                            item.docData = "data:" + item.ContentType + ";base64," + item.DocContentDOCCNT1.substr(sub + 4);
                        } else {
                            item.docData = "";
                        }
                    } else {
                        item.docData = "";
                    }
                    item.DocContentDOCCNT1 = "";
                }
            }
            this.resultConverter = resultConverter;

            var removePdf = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (that.iFrame) {
                    if (that.iFrame.style) {
                        that.iFrame.style.display = "none";
                    }
                    that.iFrame.src = "";
                }
                Log.ret(Log.l.trace);
            }
            this.removePdf = removePdf;

            var showPdf = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (that.iFrame) {
                    if (getDocData()) {
                        that.iFrame.src = getDocData();
                        if (that.iFrame.style) {
                            that.iFrame.style.display = "inline-block";
                        }
                    } else {
                        that.removePdf();
                    }
                }
                Log.ret(Log.l.trace);
            }

            var loadData = function (docId) {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "docId=" + docId);
                if (docId) {
                    AppData.setErrorMsg(that.binding);
                    ret = PdfMedia.docView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "PdfMedia.docView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.resultConverter(json.d);
                            that.binding.dataDoc = json.d;
                            if (hasDoc()) {
                                Log.print(Log.l.trace, "PDF: " + getDocData().substr(0, 100) + "...");
                            }
                            showPdf();
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
                that.removePdf();
                Log.ret(Log.l.trace);
            }
            this.removeDoc = removeDoc;

            // define handlers
            this.eventHandlers = {
            };

            this.disableHandlers = {
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



