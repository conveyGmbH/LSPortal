﻿// service for page: genDataUserInfo
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/colors.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenDataUserInfo", {
        _initBenAnwView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITBenAnw");
            }
        },
        _benutzerView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0);
            }
        },
        benutzerView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = UserInfo._benutzerView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = UserInfo._benutzerView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = UserInfo._benutzerView.insertWithId(complete, error, viewResponse);
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
                Firmenname: "",
                Strasse: "",
                PLZ: "",
                Stadt: "",
                TelefonFestnetz: "",
                TelefonMobil: "",
                EMail: "",
                Bemerkungen: ""
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
                var ret = UserInfo._userPhotoView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = UserInfo._userPhotoView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = UserInfo._userPhotoView.insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();

