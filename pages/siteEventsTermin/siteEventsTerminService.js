// service for page: siteEventsNeuAus
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteEventsTermin", {
        _FairVeranstalterView: {
            get: function () {
                return AppData.getFormatView("FairVeranstalter", 20579);
            }
        },
        FairVeranstalterView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsTermin._FairVeranstalterView.select(complete,
                    error,
                    restriction,
                    { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _VeranstaltungView: {
            get: function() {
                return AppData.getFormatView("VeranstaltungTermin", 20568);
            }
        },
        VeranstaltungView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsTermin._VeranstaltungView.select(complete,
                    error,
                    restriction,
                    { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsTermin._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsTermin._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: null
            }
        },
        defaultValue: {
            VeranstaltungName: null,
            DisplayName: null,
            FairVeranstalterID: 0, //deimos muss dann angepasst werden
            StartDatum: null,
            EndDatum: null,
            VeranstaltungTerminVIEWID: 0,
            MailBCC: null,
            MailCC: null,
            MailFrom: null,
            MailReplyTo: null,
            StatusID: null,
            HostReference: null,
            EventSuccessID: null,
            DefRemoteKonfigID: 0,
            TerminClosed: 0,
            EventURL: ""
        },
        _remoteKonfigurationView: {
            get: function () {
                return AppData.getFormatView("RemoteKonfiguration", 0, false);
            }
        },
        remoteKonfigurationView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "eventView.");
                var ret = SiteEventsTermin._remoteKonfigurationView.select(complete, error, restriction,
                    {
                        ordered: true,
                        orderAttribute: "ShowText"
                    });
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "eventView.");
                var ret = SiteEventsTermin._remoteKonfigurationView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                RemoteKonfigurationVIEWID: 0,
                ComboText: "",
                ShowText: ""
            }
        }
    });
})();
