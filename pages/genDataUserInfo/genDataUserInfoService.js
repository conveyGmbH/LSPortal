// service for page: genDataUserInfo
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/colors.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenDataUserInfo", {
        _benutzerView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0);
            }
        },
        benutzerView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = GenDataUserInfo._benutzerView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = GenDataUserInfo._benutzerView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = GenDataUserInfo._benutzerView.insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Vorname: "",
                Name: "",
                Titel: "",
                INITAnredeID: 0,
                INITLandID: 0,
                Position: "",
                Firma: "",
                Strasse: "",
                PLZ: "",
                Stadt: "",
                TelefonFestnetz: "",
                TelefonMobil: "",
                EMail: "",
                Bemerkungen: ""
            }
        },
        docExtList: [
            "jpg", "jpeg", "jpe", "gif", "png"
        ],
        _docFormatList: [],
        docFormatList: {
            get: function () {
                if (!GenDataUserInfo._docFormatList.length) {
                    GenDataUserInfo.docExtList.forEach(function (fileExtension) {
                        var wFormat = AppData.getDocFormatFromExt(fileExtension);
                        if (wFormat) {
                            var docFormat = AppData.getDocFormatInfo(wFormat);
                            if (docFormat) {
                                docFormat.docFormat = wFormat;
                                GenDataUserInfo._docFormatList.push(docFormat);
                            }
                        }
                    });
                }
                return GenDataUserInfo._docFormatList;
            }
        },
        _userPhotoView: {
            get: function () {
                return AppData.getFormatView("DOC1Mitarbeiter", 0);
            }
        },
        userPhotoView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = GenDataUserInfo._userPhotoView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = GenDataUserInfo._userPhotoView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = GenDataUserInfo._userPhotoView.insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = GenDataUserInfo._userPhotoView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();

