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

    // recordId -> event UUID memoization now lives in CrmProviders.resolveEventId/
    // rememberEventId (lib/CrmProviders/scripts/crmProviderRegistry.js), shared
    // with crmSettingsController.js instead of each controller keeping its own copy.

    // WinJS's navigator appends the new page fragment before removing the old
    // one, so an old controller's uncancelled loadData() chain can still be
    // resolving while a new controller is already checking eventId. Guarding
    // this way (rather than trying to thread WinJS.Promise.cancel() through
    // the singleton SalesforceLeadLib's internals) is the cheap, reliable fix:
    // any .then() from a superseded loadData() call becomes a no-op the
    // instant a newer loadData() starts or the controller is disposed.

    WinJS.Namespace.define(namespaceName, {

        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {

            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                    eventId: null,
                    // Tri-state gate for the "module not activated" card: stays false
                    // during initial load so the card doesn't flash before the eventId
                    // is resolved. Set true only once we've confirmed there is none.
                    showInactive: false,
                    // A license may include CRM integration (eventId resolves) while
                    // the client hasn't connected any CRM yet on CRM Connections —
                    // that's a distinct state from "no license at all" (showInactive)
                    // and from "ready to show the batch export UI" (showProviderUI).
                    showNoProvider: false,
                    showProviderUI: false
                }, commandList
            ]);

            var that = this;

            // Bumped by dispose() and every loadData() call. Captured by
            // closure at the top of loadData(); any .then() callback checks
            // isCurrent() before touching bindings or SalesforceLeadLib.
            var loadGeneration = 0;

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
                // Every registered provider lib needs the same Portal Admin
                // credentials to read LS_LeadReport/LS_FieldMappings — init()
                // them all here rather than only when a controller happens to
                // switch to that provider.
                if (window.HubspotLeadLib) {
                    HubspotLeadLib.init(serverUrl, apiName, user, password);
                }
                if (window.DynamicsLeadLib) {
                    DynamicsLeadLib.init(serverUrl, apiName, user, password);
                }
                if (window.CrmProviders && CrmProviders.LeadReportSource) {
                    CrmProviders.LeadReportSource.init(serverUrl, apiName, user, password);
                }
            }

            this.dispose = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");

                // Invalidate any in-flight loadData() chain: every remaining
                // .then() callback's isCurrent() check will now fail, so it
                // becomes a no-op instead of mutating a torn-down page.
                loadGeneration++;

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

            var noProviderCtaBtn = pageElement.querySelector(".crm-noprovider-cta");
            if (noProviderCtaBtn) {
                noProviderCtaBtn.addEventListener("click", function () {
                    Application.navigateById("crmConnections");
                });
            }

            function renderProviderUI(adapter, eventId, isCurrent) {
                if (!crmExportContainer) { return WinJS.Promise.as(); }
                if (!adapter || typeof adapter.renderContactList !== "function") {
                    // Connected, but this provider's lead-list rendering isn't wired
                    // up yet (e.g. HubSpot before Phase 4/6 land) — say so plainly
                    // rather than leaving the container blank.
                    Log.print(Log.l.error, namespaceName + ".Controller. No renderContactList for provider " + (adapter && adapter.id));
                    crmExportContainer.innerHTML =
                        '<div class="sf-cl-empty" style="padding:40px 20px;text-align:center;color:var(--sf-text-2);">' +
                        'Lead export for ' + (adapter && adapter.label ? adapter.label : "this CRM") +
                        ' isn\'t available yet.</div>';
                    return WinJS.Promise.as();
                }
                return Promise.resolve(adapter.renderContactList(crmExportContainer, eventId)).catch(function (err) {
                    if (!isCurrent()) { return; }
                    Log.print(Log.l.error, namespaceName + ".Controller. renderContactList error: " + (err && err.message));
                });
            }

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                console.log('CrmSettings loadData called, getRecordId():', getRecordId());

                // Captured by closure: if a newer loadData() call (or dispose())
                // bumps loadGeneration before this chain's .then() callbacks run,
                // isCurrent() goes false and they become no-ops instead of
                // painting stale data/counts over whatever is now on screen.
                var myGeneration = ++loadGeneration;
                function isCurrent() { return myGeneration === loadGeneration; }

                // IMPORTANT: Clear container IMMEDIATELY to show loading state
                // This prevents showing stale data from previous event
                if (crmExportContainer && SalesforceLeadLib && typeof SalesforceLeadLib.clear === "function") {
                    SalesforceLeadLib.clear(crmExportContainer);
                }

                var ret = new WinJS.Promise.as().then(function() {
                    var recordId = getRecordId();
                    // recordId -> UUID is immutable: serve the session memo when known
                    var memoized = window.CrmProviders && CrmProviders.resolveEventId(recordId);
                    if (recordId && memoized) {
                        that.binding.eventId = memoized;
                        return WinJS.Promise.as();
                    }
                    return AppData.call("FCT_GetUniqueRecordID", {
                        pRelationName: "Veranstaltung",
                        pRecordID: recordId
                    }, function (json) {
                        if (!isCurrent()) { return; }
                        Log.print(Log.l.info, "call FCT_GetUniqueRecordID: success! FCT_GetUniqueRecordID=" +
                            (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID));
                        that.binding.eventId =
                            (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID);
                        if (window.CrmProviders) {
                            CrmProviders.rememberEventId(recordId, that.binding.eventId);
                        }
                    }, function (errorResponse) {
                        if (!isCurrent()) { return; }
                        Log.print(Log.l.error, "call FCT_GetUniqueRecordID: error");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.binding.eventId = null;
                    });
                }).then(function () {
                    if (!isCurrent()) { return; }
                    Log.print(Log.l.trace, namespaceName + ".Controller. eventId=" + that.binding.eventId);
                    var eventId = that.binding.eventId;
                    if (!eventId) {
                        // No eventId: no CRM license at all for this mandant.
                        that.binding.showInactive = true;
                        that.binding.showNoProvider = false;
                        that.binding.showProviderUI = false;
                        Log.print(Log.l.info, namespaceName + ".Controller. No eventId available for CRM Export");
                        return WinJS.Promise.as();
                    }
                    that.binding.showInactive = false;

                    var providerId = window.CrmProviders ? CrmProviders.resolveActiveCrmProvider() : "salesforce";
                    var adapter = window.CrmProviders ? CrmProviders.getAdapter(providerId) : window.SalesforceLeadLib;

                    // Existing Salesforce clients predate the CRM Connections catalog
                    // and have never gone through an explicit connect/switch there —
                    // skip the real checkConnection() gate for them so their current
                    // behavior stays unchanged. Only a client who has explicitly used
                    // CRM Connections (any provider, including re-picking Salesforce)
                    // goes through the real connected/not-connected check.
                    var skipConnectionGate = providerId === "salesforce" &&
                        window.CrmProviders && !CrmProviders.hasExplicitProviderChoice();

                    if (skipConnectionGate || !adapter || typeof adapter.checkConnection !== "function") {
                        that.binding.showNoProvider = false;
                        that.binding.showProviderUI = true;
                        return renderProviderUI(adapter, eventId, isCurrent);
                    }

                    return Promise.resolve(adapter.checkConnection()).then(function (result) {
                        if (!isCurrent()) { return; }
                        if (result && result.connected) {
                            // Licensed AND a CRM is connected: show the real batch export UI.
                            that.binding.showNoProvider = false;
                            that.binding.showProviderUI = true;
                            return renderProviderUI(adapter, eventId, isCurrent);
                        } else {
                            // Licensed but no CRM connected yet: point the client at
                            // CRM Connections instead of showing an empty/broken table.
                            that.binding.showNoProvider = true;
                            that.binding.showProviderUI = false;
                            Log.print(Log.l.info, namespaceName + ".Controller. License present but no CRM connected");
                        }
                    }).catch(function (err) {
                        if (!isCurrent()) { return; }
                        Log.print(Log.l.error, namespaceName + ".Controller. checkConnection error: " + (err && err.message));
                        that.binding.showNoProvider = true;
                        that.binding.showProviderUI = false;
                    });
                }).then(function() {
                    if (!isCurrent()) { return; }
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



