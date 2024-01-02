// service for page: contactList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";
    WinJS.Namespace.define("GenDataModList", {
        _personAdresseView: {
            get: function () {
                return AppData.getFormatView("PersonAdresse", 20636);
            }
        },
        personAdresseView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        LanguageID: AppData.getLanguageId()
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "PersonLastName",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "EventResourceAdministration.eventView.");
                   
                var ret = GenDataModList._personAdresseView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = GenDataModList._personAdresseView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = GenDataModList._personAdresseView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return GenDataModList._personAdresseView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return GenDataModList._personAdresseView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModList._personAdresseView.oDataPkName) {
                        ret = record[GenDataModList._personAdresseView.oDataPkName];
                    }
                    if (!ret && GenDataModList._personAdresseView.pkName) {
                        ret = record[GenDataModList._personAdresseView.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();

