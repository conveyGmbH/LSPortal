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

    WinJS.Namespace.define("StartContacts", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "StartContacts.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                startcontactdata: getEmptyDefaultValue(StartContacts.mitarbeiterView.defaultValue)
            }]);

            var that = this;

            var getRecordId = function () {
                return AppData.getRecordId("Mitarbeiter");
            };
            this.getRecordId = getRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "StartContacts.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var recordId = getRecordId();
                    if (!recordId) {
                        ret = WinJS.Promise.as();
                    } else {
                        Log.print(Log.l.trace, "calling select mitarbeiterView...");
                        ret = StartContacts.mitarbeiterView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "mitarbeiterView: success!");
                            // mitarbeiterView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.binding.startcontactdata = json.d;
                                if (typeof AppBar === "object" && AppBar.scope) {
                                    if (AppBar.scope.binding && typeof AppBar.scope.binding.countContacts !== "undefined") {
                                        AppBar.scope.binding.countContacts = that.binding.startcontactdata.AnzKontakte;
                                    }
                                }
                            }
                            return WinJS.Promise.as();
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        }, recordId);
                    }
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
