// controller for page: crmSettings
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/crmSettings/crmSettingsService.js" />
/// <reference path="~/www/lib/SalesforceLeadLib/scripts/salesforceLeadLib.js" />

(function () {
    "use strict";
    var namespaceName = "CrmSettings";

    WinJS.Namespace.define(namespaceName, {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {

            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventId: null
            }, commandList]);

            var that = this;

            var fieldMappingsContainer = pageElement.querySelector("#fieldmappings-container");
            if (fieldMappingsContainer && SalesforceLeadLib) {
                // initialize salesforceLeadLib call
                Log.print(Log.l.info, "Initializing SalesforceLeadLib...");

                // Initialize with Portal Admin credentials
                var serverUrl = AppData.getBaseURL(AppData.appSettings.odata.onlinePort);
                var apiName = AppData.getOnlinePath();
                var user = AppData.getOnlineLogin();
                var password = AppData.getOnlinePassword();

                Log.print(Log.l.info, "ServerUrl: " + serverUrl + ", ApiName: " + apiName + ", User: " + user);
                SalesforceLeadLib.init(serverUrl, apiName, user, password);
            }

            this.dispose = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");

                if (fieldMappingsContainer && SalesforceLeadLib && typeof SalesforceLeadLib.clear === "function") {
                    // Clear Field Mapping UI when leaving page
                    SalesforceLeadLib.clear(fieldMappingsContainer);
                }
                Log.ret(Log.l.trace);

            }

            var getRecordId = function () {
                var recordId = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    recordId = master.controller.binding.eventId;
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    } else {
                        Application.navigateById("event");
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                }
            }

            this.disableHandlers = {
                clickOk: function () {
                    // always enabled!
                    return !that.binding.eventId;
                }
            }

            AppData.setErrorMsg(this.binding);

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = new WinJS.Promise.as().then(function() {
                    return AppData.call("FCT_GetUniqueRecordID", {
                        pRelationName: "Veranstaltung",
                        pRecordID: getRecordId()
                    }, function (json) {
                        Log.print(Log.l.info, "call FCT_GetUniqueRecordID: success! FCT_GetUniqueRecordID=" +
                            (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID));
                        that.binding.eventId =
                            (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call FCT_ExistsLicenceWarning: error");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.binding.eventId = null;
                    });
                }).then(function () {
                    // Initialize and open Field Mapping UI (Mentis: #8513)
                    if (fieldMappingsContainer && SalesforceLeadLib && typeof SalesforceLeadLib.init === "function") {
                        // Open Field Mapping UI with UUID eventId (async, no need to wait)
                        if (that.binding.eventId) {
                            Log.print(Log.l.info, "Opening Field Mapping for eventId (UUID): " + that.binding.eventId);

                            // Call openFieldMapping and handle promise properly
                            SalesforceLeadLib.openFieldMapping(fieldMappingsContainer, that.binding.eventId).then(
                                function() {
                                    Log.print(Log.l.info, "Field Mapping UI opened successfully");
                                },
                                function(error) {
                                    Log.print(Log.l.error, "Failed to open Field Mapping UI: " + error.message);
                                }
                            );
                        } else {
                            Log.print(Log.l.error, "No eventId available for Field Mapping");
                        }
                    }
                    AppBar.triggerDisableHandlers();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



