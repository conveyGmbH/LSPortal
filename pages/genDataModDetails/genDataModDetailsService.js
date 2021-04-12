// service for page: contactList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";
    WinJS.Namespace.define("GenDataModDetails", {
        docExtList: [
            "jpg", "jpeg", "jpe", "gif", "png", "svg", "svgz", "pdf", "txt", "htm",
            "html", "mpg", "mpeg", "m1v", "mp2", "mpa", "mpe", "mpv2", "mp4", "m4v",
            "mp4v", "ogg", "ogv", "asf", "avi", "mov", "wmv", "mp3", "m4a", "oga",
            "wav", "wma", "aiff", "aifc", "au", "mid", "midi"
        ],
        _docFormatList: [],
        docFormatList: {
            get: function () {
                if (!GenDataModDetails._docFormatList.length) {
                    GenDataModDetails.docExtList.forEach(function (fileExtension) {
                        var wFormat = AppData.getDocFormatFromExt(fileExtension);
                        if (wFormat) {
                            var docFormat = AppData.getDocFormatInfo(wFormat);
                            if (docFormat) {
                                docFormat.docFormat = wFormat;
                                GenDataModDetails._docFormatList.push(docFormat);
                            }
                        }
                    });
                }
                return GenDataModDetails._docFormatList;
            }
        },
        _adresseView: {
            get: function () {
                return AppData.getFormatView("Adresse", 20637);
            }
        },
        _adresseTable: {
            get: function () {
                return AppData.getFormatView("Adresse", 0);
            }
        },
        _adresseId: 0,
        _initPersonKategorieId: 0
    });
    WinJS.Namespace.define("GenDataModDetails", {
        adresseView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        AdresseVIEWID: GenDataModDetails._adresseId,
                        LanguageSpecID: AppData.getLanguageId()
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "AdresseVIEWID",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "EventResourceAdministration.eventView.");
                   
                var ret = GenDataModDetails._adresseView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = GenDataModDetails._adresseView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = GenDataModDetails._adresseView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Firstname: "",
                Lastname: "",
                EMail: "",
                PersonCategoryID: 0
            },
            relationName: GenDataModDetails._adresseView.relationName,
            pkName: GenDataModDetails._adresseView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModDetails._adresseView.oDataPkName) {
                        ret = record[GenDataModDetails._adresseView.oDataPkName];
                    }
                    if (!ret && GenDataModDetails._adresseView.pkName) {
                        ret = record[GenDataModDetails._adresseView.pkName];
                    }
                }
                return ret;
            }
        },
        adresseTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventResourceAdministration.eventTable.");
                var ret = GenDataModDetails._adresseTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataModDetails._adresseTable.relationName,
            pkName: GenDataModDetails. _adresseTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModDetails._adresseTable.oDataPkName) {
                        ret = record[GenDataModDetails._adresseTable.oDataPkName];
                    }
                    if (!ret && GenDataModDetails._adresseTable.pkName) {
                        ret = record[GenDataModDetails._adresseTable.pkName];
                    }
                }
                return ret;
            }
        },
    });
    WinJS.Namespace.define("GenDataModDetails", {
        _initPersonKategorie: {
            get: function () {
                return AppData.getLgntInit("LGNTINITPersonKategorie");
            }
        }
    });
    WinJS.Namespace.define("GenDataModDetails", {
        initPersonKategorieView: {
            select: function(complete, error) {
                Log.call(Log.l.trace, "GenDataModDetails.LGNTINITPersonKategorieV.");

                var ret = GenDataModDetails._initPersonKategorie.select(complete, error, null, {ordered: true});
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
    WinJS.Namespace.define("GenDataModDetails", {
        _adressePersonTable: {
            get: function () {
                return AppData.getFormatView("PersonAdresse", 0);
            }
        },
        _personAdresseId: 0
    });
    WinJS.Namespace.define("GenDataModDetails", {
        personAdresseTable: {
            select: function (complete, error, restriction) {
                if (!restriction) {
                    restriction = {
                        PersonAdresseVIEWID: GenDataModDetails._personAdresseId
                    };
                }
                Log.call(Log.l.trace, "EventResourceAdministration.eventView.");
                   
                var ret = GenDataModDetails._adressePersonTable.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventResourceAdministration.eventTable.");
                var ret = GenDataModDetails._adressePersonTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataModDetails._adressePersonTable.relationName,
            pkName: GenDataModDetails._adressePersonTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModDetails._adressePersonTable.oDataPkName) {
                        ret = record[GenDataModDetails._adressePersonTable.oDataPkName];
                    }
                    if (!ret && GenDataModDetails._adressePersonTable.pkName) {
                        ret = record[GenDataModDetails._adressePersonTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
    WinJS.Namespace.define("GenDataModDetails", {
        _adresseDOC: {
            get: function () {
                return AppData.getFormatView("DOC1Adresse", 0);
            }
        }
    });
    WinJS.Namespace.define("GenDataModDetails", {
        adresseDOC: {
            select: function (complete, error, restriction) {
                if (!restriction) {
                    restriction = {
                        DOC1AdresseVIEWID: GenDataModDetails._adresseId
                    };
                }
                Log.call(Log.l.trace, "GenDataModDetails.adresseDOC.");

                var ret = GenDataModDetails._adresseDOC.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "GenDataModDetails.adresseDOC.");
                var ret = GenDataModDetails._adresseDOC.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "GenDataModDetails.adresseDOC");
                var ret = GenDataModDetails._adresseDOC.insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataModDetails._adresseDOC.relationName,
            pkName: GenDataModDetails._adresseDOC.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModDetails._adresseDOC.oDataPkName) {
                        ret = record[GenDataModDetails._adresseDOC.oDataPkName];
                    }
                    if (!ret && GenDataModDetails._adresseDOC.pkName) {
                        ret = record[GenDataModDetails._adresseDOC.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();

