// controller for page: startContacts
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/startContacts/startContactsService.js" />

(function () {
    "use strict";

    var namespaceName = "StartContacts";

    WinJS.Namespace.define("StartContacts", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                startcontactdata: getEmptyDefaultValue(StartContacts.veranstaltungView.defaultValue)
            }]);

            var that = this;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var eventId = AppBar.scope.getEventId();
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return StartContacts.veranstaltungView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "mitarbeiterView: success!");
                            // mitarbeiterView returns object already parsed from json file in response
                            if (json && json.d && json.d.results) {
                                that.binding.startcontactdata = json.d.results[0];
                                if (typeof AppBar === "object" && AppBar.scope) {
                                    /*if (AppBar.scope.binding && typeof AppBar.scope.binding.countContacts !== "undefined") {
                                        AppBar.scope.binding.countContacts = that.binding.startcontactdata.AnzKontakte;
                                    }*/
                                    if (that.binding.startcontactdata &&
                                        that.binding.startcontactdata.AnzKontakte &&
                                        that.binding.startcontactdata.AnzKontakte > 0) {
                                        AppBar.scope.binding.countContacts = true;
                                    } else {
                                        AppBar.scope.binding.countContacts = false;
                                    }
                                }
                            }
                            return WinJS.Promise.as();
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        },
                        { VeranstaltungVIEWID: eventId });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
        })
    });
})();
