// hubspotLeadLib.js - HubSpot integration for LeadSuccess Portal
//
// Structural sibling of SalesforceLeadLib (same static-class shape, same
// public method names) so both can be called interchangeably through the
// CrmProviders registry. Talks to the unified crm-backend
// (c:\gitprojects\NodeJsBackend\crm-backend, providers/hubspot/index.js) —
// a different backend than Salesforce's (LSAPISFSamples_www), reusing the
// exact same X-Org-Id / X-Session-Token isolation header convention.
//
// Deliberately does NOT extend SalesforceLeadLib or share its
// static _dataCache: a distinct class means a distinct static field, so
// contacts/fieldmap cache entries for the same eventId under Salesforce vs.
// HubSpot can never collide even though the key strings look the same.

(function () {
    "use strict";

    const HS_ORG_ID_KEY = "hs_org_id";
    const HS_SESSION_TOKEN_KEY = "hs_session_token";
    const HS_USER_INFO_KEY = "hs_user_info";

    class HubspotLeadLib {
        static _portalConfig = null;
        // Distinct from SalesforceLeadLib._dataCache — see file header.
        static _dataCache = new Map();

        // Same shape as SalesforceLeadLib.init(): call once with the Portal
        // Admin credentials before renderContactList()/openFieldMapping().
        static init(serverUrl, apiName, user, password) {
            this._portalConfig = {
                serverUrl: serverUrl,
                apiName: apiName,
                user: user,
                password: password,
                baseUrl: `${serverUrl}/${apiName}`
            };
            return true;
        }

        // Same dev/production split as SalesforceLeadLib._detectEnvironment():
        // any localhost/127.0.0.1 is dev regardless of port, everything else
        // (convey.de, azurewebsites.net, azurestaticapps.net) is production.
        // hubspot-backend is deployed at lsapihubspotbackend-* on Azure App
        // Service (crm-backend/hubspot-backend), independent from
        // salesforce-backend and dynamics-backend — own port in dev (5002,
        // part of the 5001/5002/5003 SF/HubSpot/Dynamics range), own host in
        // production.
        static _backendUrl() {
            const hostname = window.location.hostname;
            const isProductionHost = hostname.includes('convey.de') ||
                hostname.includes('azurewebsites.net') ||
                hostname.includes('azurestaticapps.net');
            const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
            const isProduction = isProductionHost && !isLocalhost;
            return isProduction
                ? "https://lsapihubspotbackend-ebh5fmd6c8e6gcbk.westeurope-01.azurewebsites.net"
                : "http://localhost:5002";
        }

        static isConnected() {
            return !!localStorage.getItem(HS_SESSION_TOKEN_KEY);
        }

        static async checkConnection() {
            try {
                const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "";
                const sessionToken = localStorage.getItem(HS_SESSION_TOKEN_KEY) || "";
                const resp = await fetch(`${this._backendUrl()}/api/hubspot/check`, {
                    headers: {
                        ...(orgId && { "X-Org-Id": orgId }),
                        ...(sessionToken && { "X-Session-Token": sessionToken })
                    }
                });
                if (!resp.ok) return { connected: false };
                const json = await resp.json();
                if (json.connected) {
                    return {
                        connected: true,
                        userInfo: (json.userInfo && (json.userInfo.display_name || json.userInfo.username)) || ""
                    };
                }
                return { connected: false };
            } catch {
                return { connected: false };
            }
        }

        // Open the HubSpot OAuth popup via the shared CrmProviders helper
        // (lib/CrmProviders/scripts/oauthPopup.js) and persist the resulting
        // session. orgId is the same isolation key convention SF already
        // uses against its backend (see resolveConnectionKey in both
        // LSAPISFSamples_www/salesforce-backend/server.js and
        // crm-backend/core/isolation.js): whatever the last successful OAuth
        // handshake returns, defaulting to 'default' until then.
        static async connect() {
            const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "default";
            const authUrl = `${this._backendUrl()}/auth/hubspot?orgId=${encodeURIComponent(orgId)}`;
            const result = await window.CrmProviders.openOAuthPopup({
                authUrl: authUrl,
                successMessageType: "HUBSPOT_AUTH_SUCCESS",
                popupName: "hubspot-auth"
            });
            if (!result) {
                return { success: false };
            }
            if (result.orgId) localStorage.setItem(HS_ORG_ID_KEY, result.orgId);
            if (result.sessionToken) localStorage.setItem(HS_SESSION_TOKEN_KEY, result.sessionToken);
            if (result.userInfo) localStorage.setItem(HS_USER_INFO_KEY, JSON.stringify(result.userInfo));
            return { success: true, userInfo: result.userInfo };
        }

        // Read the isolation key BEFORE clearing localStorage — the backend
        // resolves the stored connection by X-Org-Id / X-Session-Token, so it
        // must be sent or the disconnect never reaches the right connection
        // (mirrors SalesforceLeadLib._sfDisconnect()'s ordering).
        static async disconnect() {
            try {
                const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "";
                const sessionToken = localStorage.getItem(HS_SESSION_TOKEN_KEY) || "";
                await fetch(`${this._backendUrl()}/api/hubspot/logout`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        ...(orgId && { "X-Org-Id": orgId }),
                        ...(sessionToken && { "X-Session-Token": sessionToken })
                    }
                });
            } catch { /* ignore */ }
            [HS_ORG_ID_KEY, HS_SESSION_TOKEN_KEY, HS_USER_INFO_KEY].forEach((k) => localStorage.removeItem(k));
        }

        static clear(rootElement) {
            if (rootElement) {
                rootElement.innerHTML = "";
            }
        }

        // --- Field Configurator ---
        // Delegates to SalesforceLeadLib's generalized openFieldMapping — same
        // rich UI (search, All/Active/Inactive/Required/Custom tabs, editable
        // per-field CRM target, custom-field authoring, Connect/Disconnect
        // header) that Salesforce already has, just parameterized with
        // HubSpot's own config instead of a separate simplified
        // implementation. See salesforceLeadLib.js's openFieldMapping/
        // _renderFieldsGrid/_attachFieldConfiguratorListeners for how
        // apiEndpointValue/defaultMappings/dataCache/providerLabel/crmAdapter
        // steer the generic rendering per-provider.
        static async openFieldMapping(rootElement, eventId, options = {}) {
            if (!this._portalConfig) { throw new Error("HubspotLeadLib not initialized. Call init() first."); }
            const hubspotAdapter = window.CrmProviders && CrmProviders.getAdapter("hubspot");
            return window.SalesforceLeadLib.openFieldMapping(rootElement, eventId, {
                ...options,
                apiEndpointValue: "HubSpot",
                providerLabel: "HubSpot",
                defaultMappings: CrmProviders.HS_DEFAULT_MAPPINGS,
                dataCache: HubspotLeadLib._dataCache,
                crmAdapter: (hubspotAdapter && hubspotAdapter.id === "hubspot") ? hubspotAdapter : null
            });
        }

        // Delegates to SalesforceLeadLib.saveFieldMapping — it's already fully
        // generic (reads whatever fieldMappingService openFieldMapping stashed
        // on the #fieldmappings-container element, regardless of provider).
        static async saveFieldMapping(eventId) {
            return window.SalesforceLeadLib.saveFieldMapping(eventId);
        }

        // --- Contact list ---
        // Delegates to SalesforceLeadLib's generalized renderContactList — same
        // rich UI (search, column filters, status pills, sort, connect/
        // disconnect header, infinite scroll) that Salesforce already has,
        // parameterized with HubSpot's own config instead of a separate
        // simplified implementation. Batch transfer stays disabled
        // (supportsBatchTransfer: false) until Phase 6 generalizes the actual
        // transfer logic (Contact object, no __c suffix, /api/hubspot route —
        // structurally different from Salesforce's Lead-object transfer).
        static async renderContactList(rootElement, eventId, options = {}) {
            if (!this._portalConfig) { throw new Error("HubspotLeadLib not initialized. Call init() first."); }
            const hubspotAdapter = window.CrmProviders && CrmProviders.getAdapter("hubspot");
            return window.SalesforceLeadLib.renderContactList(rootElement, eventId, {
                ...options,
                apiEndpointValue: "HubSpot",
                providerLabel: "HubSpot",
                defaultMappings: CrmProviders.HS_DEFAULT_MAPPINGS,
                dataCache: HubspotLeadLib._dataCache,
                crmAdapter: (hubspotAdapter && hubspotAdapter.id === "hubspot") ? hubspotAdapter : null,
                supportsBatchTransfer: false
            });
        }
    }

    // Expose to window
    window.HubspotLeadLib = HubspotLeadLib;

    // Register with the CRM provider registry (lib/CrmProviders/scripts/
    // crmProviderRegistry.js). openFieldMapping/renderContactList/
    // saveFieldMapping all delegate to SalesforceLeadLib's generalized
    // implementations (same rich UI, own config) — only the actual batch
    // transfer (Contact object, no __c suffix, /api/hubspot route) and
    // checkDuplicates remain to generalize, both in Phase 6.
    if (window.CrmProviders && typeof window.CrmProviders.registerAdapter === "function") {
        window.CrmProviders.registerAdapter({
            id: "hubspot",
            label: "HubSpot",
            apiEndpointValue: "HubSpot",
            status: "available",
            isConnected: HubspotLeadLib.isConnected,
            checkConnection: function () { return HubspotLeadLib.checkConnection(); },
            connect: function () { return HubspotLeadLib.connect(); },
            disconnect: function () { return HubspotLeadLib.disconnect(); },
            renderContactList: function (rootElement, eventId, options) {
                return HubspotLeadLib.renderContactList(rootElement, eventId, options);
            },
            openFieldMapping: function (rootElement, eventId, options) {
                return HubspotLeadLib.openFieldMapping(rootElement, eventId, options);
            },
            saveFieldMapping: function (eventId) {
                return HubspotLeadLib.saveFieldMapping(eventId);
            }
        });
    }

    console.log("HubspotLeadLib loaded and ready");

})();
