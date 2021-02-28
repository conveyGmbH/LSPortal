// service for page: imgMedia
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("UploadMedia", {
        docFormatList: [
            //{fileExtension: ".bmp", mimeType: "image/bmp", docGroup: 1, docFormat: 1},
            //{fileExtension: ".tif", mimeType: "image/tiff", docGroup: 1, docFormat: 2},
            //{fileExtension: ".tiff", mimeType: "image/tiff", docGroup: 1, docFormat: 2},
            {fileExtension: ".jpg", mimeType: "image/jpeg", docGroup: 1, docFormat: 3},
            {fileExtension: ".jpeg", mimeType: "image/jpeg", docGroup: 1, docFormat: 3},
            {fileExtension: ".jpe", mimeType: "image/jpeg", docGroup: 1, docFormat: 3},
            {fileExtension: ".gif", mimeType: "image/gif", docGroup: 1, docFormat: 5},
            {fileExtension: ".png", mimeType: "image/png", docGroup: 1, docFormat: 53},
            {fileExtension: ".svg", mimeType: "image/svg+xml", docGroup: 3, docFormat: 75},
            {fileExtension: ".svgz", mimeType: "image/svg+xml", docGroup: 3, docFormat: 76},
            {fileExtension: ".pdf", mimeType: "application/pdf", docGroup: 3, docFormat: 1557},
            {fileExtension: ".txt", mimeType: "text/plain", docGroup: 3, docFormat: 1009},
            {fileExtension: ".htm", mimeType: "text/html", docGroup: 3, docFormat: 1101},
            {fileExtension: ".html", mimeType: "text/html", docGroup: 3, docFormat: 1101},
            {fileExtension: ".mpg", mimeType: "video/mpeg", docGroup: 5, docFormat: 72},
            {fileExtension: ".mpeg", mimeType: "video/mpeg", docGroup: 5, docFormat: 72},
            {fileExtension: ".m1v", mimeType: "video/mpeg", docGroup: 5, docFormat: 72},
            {fileExtension: ".mp2", mimeType: "video/mpeg", docGroup: 5, docFormat: 72},
            {fileExtension: ".mpa", mimeType: "video/mpeg", docGroup: 5, docFormat: 72},
            {fileExtension: ".mpe", mimeType: "video/mpeg", docGroup: 5, docFormat: 72},
            {fileExtension: ".mpv2", mimeType: "video/mpeg", docGroup: 5, docFormat: 72},
            {fileExtension: ".mp4", mimeType: "video/mp4", docGroup: 5, docFormat: 72},
            {fileExtension: ".m4v", mimeType: "video/mp4", docGroup: 5, docFormat: 72},
            {fileExtension: ".mp4v", mimeType: "video/mp4", docGroup: 5, docFormat: 72},
            {fileExtension: ".ogg", mimeType: "video/ogg", docGroup: 5, docFormat: 72},
            {fileExtension: ".ogv", mimeType: "video/ogg", docGroup: 5, docFormat: 72},
            {fileExtension: ".asf", mimeType: "video/x-ms-asf", docGroup: 5, docFormat: 81},
            {fileExtension: ".avi", mimeType: "video/avi", docGroup: 5, docFormat: 13},
            {fileExtension: ".mov", mimeType: "video/quicktime", docGroup: 5, docFormat: 68},
            {fileExtension: ".wmv", mimeType: "video/x-ms-wmv", docGroup: 5, docFormat: 83},
            {fileExtension: ".mp3", mimeType: "audio/mpeg", docGroup: 6, docFormat: 67},
            {fileExtension: ".m4a", mimeType: "audio/mp4", docGroup: 6, docFormat: 67},
            {fileExtension: ".oga", mimeType: "audio/ogg", docGroup: 6, docFormat: 67},
            {fileExtension: ".wav", mimeType: "audio/wav", docGroup: 6, docFormat: 14},
            {fileExtension: ".wma", mimeType: "audio/x-ms-wma", docGroup: 6, docFormat: 82},
            {fileExtension: ".aiff", mimeType: "audio/aiff", docGroup: 6, docFormat: 71},
            {fileExtension: ".aifc", mimeType: "audio/aiff", docGroup: 6, docFormat: 71},
            {fileExtension: ".au", mimeType: "audio/basic", docGroup: 6, docFormat: 69},
            {fileExtension: ".mid", mimeType: "audio/mid", docGroup: 7, docFormat: 60},
            {fileExtension: ".midi", mimeType: "audio/mid", docGroup: 7, docFormat: 60}
        ],
        getDocView: function (docGroup) {
            var tableName = "DOC" + docGroup + "MandantDokument";
            return AppData.getFormatView(tableName, 0);
        }
    });
    WinJS.Namespace.define("UploadMedia", {
        docView: {
            //only insert needed, will delete previous DOCxMandantDokument records in before trigger
            insert: function (complete, error, viewResponse, docId, docGroup) {
                Log.call(Log.l.trace, "docView.", "docId=" + docId + " docGroup=" + docGroup);
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
