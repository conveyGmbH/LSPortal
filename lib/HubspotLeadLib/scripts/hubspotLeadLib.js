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

        // TODO(deploy): crm-backend (NodeJsBackend/crm-backend) has no confirmed
        // production URL yet — it's only ever been run against localhost:4000
        // so far (see LSPortalNext's src/services/hubspot/config.ts, which has
        // the same localhost-only default with no hardcoded prod fallback).
        // Fill in the real deployed URL here once crm-backend is hosted
        // somewhere reachable from production LSPortal.
        static _backendUrl() {
            return "http://localhost:4000";
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
    }

    // Expose to window
    window.HubspotLeadLib = HubspotLeadLib;

    // Register with the CRM provider registry (lib/CrmProviders/scripts/
    // crmProviderRegistry.js). renderContactList/openFieldMapping/
    // saveFieldMapping/checkDuplicates land here in later phases (Phase 4
    // field-mapping discriminator, Phase 6 duplicate-check) — connect/
    // disconnect/check are enough for the CRM connections catalog (Phase 5)
    // to show HubSpot as connectable.
    if (window.CrmProviders && typeof window.CrmProviders.registerAdapter === "function") {
        window.CrmProviders.registerAdapter({
            id: "hubspot",
            label: "HubSpot",
            apiEndpointValue: "HubSpot",
            status: "available",
            isConnected: HubspotLeadLib.isConnected,
            checkConnection: function () { return HubspotLeadLib.checkConnection(); },
            connect: function () { return HubspotLeadLib.connect(); },
            disconnect: function () { return HubspotLeadLib.disconnect(); }
        });
    }

    console.log("HubspotLeadLib loaded and ready");

})();
