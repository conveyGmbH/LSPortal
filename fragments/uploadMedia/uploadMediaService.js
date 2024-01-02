// service for page: imgMedia
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "UploadMedia";

    WinJS.Namespace.define("UploadMedia", {
        docExtList: [
            "jpg", "jpeg", "jpe", "gif", "png", "svg", "svgz", "pdf", "txt", "htm",
            "html", "mpg", "mpeg", "m1v", "mp2", "mpa", "mpe", "mpv2", "mp4", "m4v",
            "mp4v", "ogg", "ogv", "asf", "avi", "mov", "wmv", "mp3", "m4a", "oga",
            "wav", "wma", "aiff", "aifc", "au", "mid", "midi"
        ],
        _docFormatList: [],
        docFormatList: {
            get: function() {
                if (!UploadMedia._docFormatList.length) {
                    UploadMedia.docExtList.forEach(function(fileExtension) {
                        var wFormat = AppData.getDocFormatFromExt(fileExtension);
                        if (wFormat) {
                            var docFormat = AppData.getDocFormatInfo(wFormat);
                            if (docFormat) {
                                docFormat.docFormat = wFormat;
                                UploadMedia._docFormatList.push(docFormat);
                            }
                        }
                    });
                }
                return UploadMedia._docFormatList;
            }
        },
        getDocView: function (docGroup) {
            var tableName = "DOC" + docGroup + "MandantDokument";
            return AppData.getFormatView(tableName, 0);
        },
        docView: {
            //only insert needed, will delete previous DOCxMandantDokument records in before trigger
            insert: function (complete, error, viewResponse, docId, docGroup) {
                Log.call(Log.l.trace, namespaceName + ".docView.", "docId=" + docId + " docGroup=" + docGroup);
                if (viewResponse) {
                    var pkName = "DOC" + docGroup + "MandantDokumentVIEWID";
                    viewResponse[pkName] = docId;
                }
                var ret = UploadMedia.getDocView(docGroup).insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
