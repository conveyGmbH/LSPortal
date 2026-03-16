// controller for page: crmSettings
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/crmExport/crmExportService.js" />
/// <reference path="~/www/lib/SalesforceLeadLib/scripts/salesforceLeadLib.js" />

(function () {
    "use strict";
    var namespaceName = "CrmExport";

    WinJS.Namespace.define(namespaceName, {

        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {

            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                    eventId: null
                }, commandList
            ]);

            var that = this;

            var crmExportContainer = pageElement.querySelector("#crmexport-container");

            if (crmExportContainer && SalesforceLeadLib) {
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

                if (crmExportContainer && SalesforceLeadLib && typeof SalesforceLeadLib.clear === "function") {
                    // Clear Field Mapping UI when leaving page
                    SalesforceLeadLib.clear(crmExportContainer);
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
                console.log('CrmSettings loadData called, getRecordId():', getRecordId());

                // IMPORTANT: Clear container IMMEDIATELY to show loading state
                // This prevents showing stale data from previous event
                if (crmExportContainer && SalesforceLeadLib && typeof SalesforceLeadLib.clear === "function") {
                    SalesforceLeadLib.clear(crmExportContainer);
                    // Show loading indicator immediately
                    crmExportContainer.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 300px;"><div style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: var(--accent-color, #2563eb); border-radius: 50%; animation: spin 0.8s linear infinite;"></div><p class="text-textcolor" style="margin-top: 16px; font-size: 16px;">Loading fields...</p><style>@keyframes spin { to { transform: rotate(360deg); } }</style></div>';
                }

                var ret = new WinJS.Promise.as().then(function() {
                    return AppData.call("FCT_GetUniqueRecordID", {
                        pRelationName: "Veranstaltung",
                        pRecordID: getRecordId()
                    }, function (json) {
                        Log.print(Log.l.info, "call FCT_GetUniqueRecordID: success! FCT_GetUniqueRecordID=" +
                            (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID));
                        that.binding.eventId =
                            (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID);
                        console.log('FCT_GetUniqueRecordID success, eventId:', that.binding.eventId);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call FCT_GetUniqueRecordID: error");
                        console.error('FCT_GetUniqueRecordID error:', errorResponse);
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.binding.eventId = null;
                    });
                }).then(function () {
                    Log.print(Log.l.trace, namespaceName + ".Controller. eventId=" + that.binding.eventId);
                    if (crmExportContainer && SalesforceLeadLib && typeof SalesforceLeadLib.renderContactList === "function") {
                        var eventId = that.binding.eventId;
                        if (eventId) {
                            // Force display the container (binding hides it when eventId is null)
                            crmExportContainer.style.setProperty('display', 'block', 'important');
                            // Hide the inactive message
                            var inactiveMessage = crmExportContainer.parentElement.querySelector('.field_line_full');
                            if (inactiveMessage) {
                                inactiveMessage.style.setProperty('display', 'none', 'important');
                            }
                            // Render contact list with batch transfer UI
                            SalesforceLeadLib.renderContactList(crmExportContainer, eventId).catch(function (err) {
                                Log.print(Log.l.error, namespaceName + ".Controller. renderContactList error: " + err.message);
                            });
                        } else {
                            Log.print(Log.l.error, namespaceName + ".Controller. No eventId available for CRM Export");
                        }
                    }
                }).then(function() {
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



