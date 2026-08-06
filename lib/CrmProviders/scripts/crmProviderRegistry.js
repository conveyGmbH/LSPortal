// crmProviderRegistry.js - CRM provider registry for LeadSuccess Portal
//
// A vanilla-JS equivalent of LSPortalNext's CrmAdapter/registry pattern
// (src/services/crm/registry.ts, src/hooks/useClientCrm.ts). One CRM is
// active per client license at a time; this registry lets crmExport/
// crmSettings/crmConnections call into whichever provider is active
// without hardcoding Salesforce.
//
// Each adapter is expected to expose:
//   id, label, apiEndpointValue, status ("available" | "soon")
//   isConnected()            - sync, localStorage token presence check
//   checkConnection()        - async, hits the provider's backend /check
//   connect() / disconnect() - async, OAuth popup flow
//   renderContactList(rootElement, eventId, options) - async
//   openFieldMapping(rootElement, eventId, options)  - async
//   checkDuplicates(leads, mappings) - async, optional

(function () {
    "use strict";

    var PROVIDER_IDS = ["salesforce", "hubspot", "dynamics"];
    var ACTIVE_PROVIDER_STORAGE_KEY = "ls_active_crm_provider";

    var adapters = {};

    // recordId -> event UUID is immutable, so FCT_GetUniqueRecordID only
    // needs one round-trip per event and session. Shared across pages
    // instead of each controller keeping its own copy.
    var eventIdByRecordId = {};

    function registerAdapter(adapter) {
        if (!adapter || !adapter.id) {
            throw new Error("CrmProviders.registerAdapter: adapter.id is required");
        }
        adapters[adapter.id] = adapter;
    }

    // Salesforce is the default, mirroring getCrmAdapter() in LSPortalNext:
    // callers that don't (or can't yet) resolve a provider keep existing
    // Salesforce behavior unchanged.
    function getAdapter(providerId) {
        if (providerId && adapters[providerId]) {
            return adapters[providerId];
        }
        return adapters.salesforce || null;
    }

    // Deterministic provider resolution, mirroring LSPortalNext's
    // useResolvedCrmProvider(): (1) explicit choice if valid, (2) else the
    // first registered provider with a live connection, (3) else Salesforce.
    function resolveActiveCrmProvider() {
        var stored = null;
        try {
            stored = localStorage.getItem(ACTIVE_PROVIDER_STORAGE_KEY);
        } catch (e) { /* localStorage unavailable — fall through */ }

        if (stored && PROVIDER_IDS.indexOf(stored) !== -1) {
            return stored;
        }

        for (var i = 0; i < PROVIDER_IDS.length; i++) {
            var id = PROVIDER_IDS[i];
            var adapter = adapters[id];
            if (adapter && typeof adapter.isConnected === "function" && adapter.isConnected()) {
                return id;
            }
        }

        return "salesforce";
    }

    function setActiveProvider(providerId) {
        if (PROVIDER_IDS.indexOf(providerId) === -1) {
            throw new Error("CrmProviders.setActiveProvider: unknown provider '" + providerId + "'");
        }
        try {
            localStorage.setItem(ACTIVE_PROVIDER_STORAGE_KEY, providerId);
        } catch (e) { /* localStorage unavailable — active provider won't persist across reloads */ }
    }

    // Shared recordId -> eventId (UUID) memo, replacing the copy that used
    // to be duplicated verbatim in crmExportController.js and
    // crmSettingsController.js.
    function resolveEventId(recordId) {
        return recordId ? eventIdByRecordId[recordId] : undefined;
    }

    function rememberEventId(recordId, eventId) {
        if (recordId && eventId) {
            eventIdByRecordId[recordId] = eventId;
        }
    }

    window.CrmProviders = {
        PROVIDER_IDS: PROVIDER_IDS,
        ACTIVE_PROVIDER_STORAGE_KEY: ACTIVE_PROVIDER_STORAGE_KEY,
        registerAdapter: registerAdapter,
        getAdapter: getAdapter,
        resolveActiveCrmProvider: resolveActiveCrmProvider,
        setActiveProvider: setActiveProvider,
        resolveEventId: resolveEventId,
        rememberEventId: rememberEventId
    };

    console.log("CrmProviders registry loaded and ready");

})();
