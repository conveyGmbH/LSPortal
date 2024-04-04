// service for page: genDataUserInfo
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "UploadUserPhoto";

    WinJS.Namespace.define("UploadUserPhoto", {
        docExtList: [
            "jpg", "jpeg", "jpe", "gif", "png"
        ],
        _docFormatList: [],
        docFormatList: {
            get: function () {
                if (!UploadUserPhoto._docFormatList.length) {
                    UploadUserPhoto.docExtList.forEach(function (fileExtension) {
                        var wFormat = AppData.getDocFormatFromExt(fileExtension);
                        if (wFormat) {
                            var docFormat = AppData.getDocFormatInfo(wFormat);
                            if (docFormat) {
                                docFormat.docFormat = wFormat;
                                UploadUserPhoto._docFormatList.push(docFormat);
                            }
                        }
                    });
                }
                return UploadUserPhoto._docFormatList;
            }
        },
        getDocView: function (docGroup) {
            var tableName = "DOC1Mitarbeiter";
            return AppData.getFormatView(tableName, 0);
        },
        docView: {
            //only insert needed, will delete previous DOCxMandantDokument records in before trigger
            insert: function (complete, error, viewResponse, docId, docGroup) {
                Log.call(Log.l.trace, namespaceName + ".docView.", "docId=" + docId + " docGroup=" + docGroup);
                if (viewResponse) {
                    var pkName = "DOC1Mitarbeiter";
                    viewResponse[pkName] = docId;
                }
                var ret = UploadUserPhoto.getDocView(docGroup).insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
