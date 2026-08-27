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

    // recordId -> event UUID memoization now lives in CrmProviders.resolveEventId/
    // rememberEventId (lib/CrmProviders/scripts/crmProviderRegistry.js), shared
    // with crmExportController.js instead of each controller keeping its own copy.

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
                    // True only until loadData() settles one of the three
                    // states below — shows a spinner instead of a blank
                    // page between clicking the tab and eventId resolving.
                    showLoading: true,
                    // Tri-state gate for the "module not activated" card: stays false
                    // during initial load so the card doesn't flash before the eventId
                    // is resolved. Set true only once we've confirmed there is none.
                    showInactive: false,
                    // A license may include CRM integration (eventId resolves) while
                    // the client hasn't connected any CRM yet on CRM Connections —
                    // that's a distinct state from "no license at all" (showInactive)
                    // and from "ready to show the Field Configurator" (showProviderUI).
                    showNoProvider: false,
                    showProviderUI: false
                }, commandList
            ]);

            var that = this;

            // Bumped by dispose() and every loadData() call. Captured by
            // closure at the top of loadData(); any .then() callback checks
            // isCurrent() before touching bindings or SalesforceLeadLib.
            var loadGeneration = 0;

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

            var noProviderCtaBtn = pageElement.querySelector(".crm-noprovider-cta");
            if (noProviderCtaBtn) {
                noProviderCtaBtn.addEventListener("click", function () {
                    Application.navigateById("crmConnections");
                });
            }

            var saveData = function(complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                // Save field mappings before unloading if modified
                // Get eventId from the current binding (UUID from FCT_GetUniqueRecordID)
                var eventId = that.binding && that.binding.eventId;

                var ret = WinJS.Promise.as().then(function () {
                    var adapter = window.CrmProviders
                        ? CrmProviders.getAdapter(CrmProviders.resolveActiveCrmProvider())
                        : window.SalesforceLeadLib;
                    if (eventId && adapter && typeof adapter.saveFieldMapping === "function") {
                        Log.print(Log.l.info, "Saving field mappings before unload...");
                        return adapter.saveFieldMapping(eventId).then(function (saved) {
                            if (saved) {
                                Log.print(Log.l.info, "Field mappings saved successfully");
                            }
                            return WinJS.Promise.as();
                        }, function (err) {
                            Log.print(Log.l.error, "Failed to save field mappings: " + (err && err.message || err));
                            if (typeof error === "function") {
                                error(err);
                            }
                            return WinJS.Promise.as(); // Continue even if save fails
                        });
                    }
                    return WinJS.Promise.as();
                }).then(function (response) {
                    // do any page state completion
                    if (typeof complete === "function") {
                        complete(response);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            function openFieldMappingUI(adapter, eventId, isCurrent) {
                if (!fieldMappingsContainer) { return WinJS.Promise.as(); }
                if (!adapter || typeof adapter.openFieldMapping !== "function") {
                    // Connected, but this provider's Field Configurator isn't wired
                    // up yet (e.g. HubSpot before Phase 4 lands) — say so plainly
                    // rather than leaving the container blank.
                    Log.print(Log.l.error, namespaceName + ".Controller. No openFieldMapping for provider " + (adapter && adapter.id));
                    fieldMappingsContainer.innerHTML =
                        '<div class="sf-cl-empty" style="padding:40px 20px;text-align:center;color:var(--sf-text-2);">' +
                        'Field mapping for ' + (adapter && adapter.label ? adapter.label : "this CRM") +
                        ' isn\'t available yet.</div>';
                    return WinJS.Promise.as();
                }
                return adapter.openFieldMapping(fieldMappingsContainer, eventId).then(
                    function () {
                        if (!isCurrent()) { return; }
                        Log.print(Log.l.info, "Field Mapping UI opened successfully");
                        console.log('Field Mapping UI opened successfully');
                        AppBar.modified = false; // Reset modified flag after loading new event
                    },
                    function (error) {
                        if (!isCurrent()) { return; }
                        Log.print(Log.l.error, "Failed to open Field Mapping UI: " + (error && error.message));
                    }
                );
            }

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                console.log('CrmSettings loadData called, getRecordId():', getRecordId());

                // Captured by closure: if a newer loadData() call (or dispose())
                // bumps loadGeneration before this chain's .then() callbacks run,
                // isCurrent() goes false and they become no-ops instead of
                // painting a stale field configurator over whatever is now on screen.
                var myGeneration = ++loadGeneration;
                function isCurrent() { return myGeneration === loadGeneration; }

                // IMPORTANT: Clear container IMMEDIATELY to show loading state
                // This prevents showing stale data from previous event
                if (fieldMappingsContainer && SalesforceLeadLib && typeof SalesforceLeadLib.clear === "function") {
                    SalesforceLeadLib.clear(fieldMappingsContainer);
                    // Skeleton placeholder (token-styled, light+dark) until
                    // openFieldMapping renders its own full skeleton page
                    fieldMappingsContainer.innerHTML =
                        '<div class="sf-fieldmap-root" aria-busy="true">' +
                        '<div class="sf-fieldmap-stats" style="margin-top: 20px;">' +
                        '<div class="sf-skeleton" style="height: 82px;"></div>' +
                        '<div class="sf-skeleton" style="height: 82px;"></div>' +
                        '<div class="sf-skeleton" style="height: 82px;"></div>' +
                        '<div class="sf-skeleton" style="height: 82px;"></div>' +
                        '</div></div>';
                }
                // Re-show the spinner for this fresh load (a prior load may
                // have already flipped this to false) — cleared again once
                // the tri-state gate below settles. The skeleton above sits
                // inside #fieldmappings-container, which stays hidden until
                // showProviderUI is true, so it alone doesn't cover this gap.
                that.binding.showLoading = true;

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
                    console.log('Opening Field Mapping, eventId:', that.binding.eventId);
                    // eventId is resolved (or definitively failed to resolve) —
                    // one of the tri-state branches below is about to fire, so
                    // the loading spinner is no longer needed.
                    that.binding.showLoading = false;
                    var eventId = that.binding.eventId;

                    // Only show the Field Mapping UI when a UUID eventId exists, i.e. when
                    // the mandant has an active SF-API-User. Without it we must behave exactly
                    // like CRM Export: leave the binding to show the "module not activated"
                    // message and open nothing. (Previously this page force-displayed the
                    // container and fell back to a localStorage-only mode on recordId, which
                    // made Settings show the UI while Export correctly showed the notice.)
                    if (!eventId) {
                        that.binding.showInactive = true;
                        that.binding.showNoProvider = false;
                        that.binding.showProviderUI = false;
                        Log.print(Log.l.info, "No eventId (no SF-API-User) — showing inactive message, no UI");
                        console.log('No eventId — CRM module not activated for this mandant');
                        return WinJS.Promise.as();
                    }
                    that.binding.showInactive = false;

                    var providerId = window.CrmProviders ? CrmProviders.resolveActiveCrmProvider() : "salesforce";
                    var adapter = window.CrmProviders ? CrmProviders.getAdapter(providerId) : window.SalesforceLeadLib;

                    // Existing Salesforce clients predate the CRM Connections catalog
                    // and have never gone through an explicit connect/switch there —
                    // skip the real checkConnection() gate for them so their current
                    // behavior stays unchanged (mirrors crmExportController.js).
                    var skipConnectionGate = providerId === "salesforce" &&
                        window.CrmProviders && !CrmProviders.hasExplicitProviderChoice();

                    if (skipConnectionGate || !adapter || typeof adapter.checkConnection !== "function") {
                        that.binding.showNoProvider = false;
                        that.binding.showProviderUI = true;
                        return openFieldMappingUI(adapter, eventId, isCurrent);
                    }

                    return Promise.resolve(adapter.checkConnection()).then(function (result) {
                        if (!isCurrent()) { return; }
                        if (result && result.connected) {
                            that.binding.showNoProvider = false;
                            that.binding.showProviderUI = true;
                            return openFieldMappingUI(adapter, eventId, isCurrent);
                        } else {
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



