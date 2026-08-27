// dynamicsLeadLib.js - MS Dynamics 365 integration for LeadSuccess Portal
//
// Structural sibling of HubspotLeadLib/SalesforceLeadLib (same static-class
// shape, same public method names) so it can be called interchangeably
// through the CrmProviders registry. Talks to dynamics-backend
// (c:\gitprojects\NodeJsBackend\dynamics-backend, server.js) — a distinct
// backend from Salesforce/HubSpot's, same multi-tenant-app model: one
// LeadSuccess Azure AD App Registration (DYNAMICS_CLIENT_ID/SECRET in that
// backend's .env), shared across every client, same as SF_CLIENT_ID/
// HUBSPOT_CLIENT_ID. What's still per-client is which Dynamics 365 ORG to
// connect to — resourceUrl, the Dynamics equivalent of HubSpot's orgId — so
// connect() asks for that value before opening the OAuth popup, instead of
// a single one-click GET like SF/HubSpot. No tenant ID is asked: Azure AD's
// 'common' multi-tenant endpoint detects the signing-in user's own tenant
// automatically (see dynamics-backend's /api/dynamics/auth).
//
// Deliberately does NOT extend SalesforceLeadLib or share its
// static _dataCache: a distinct class means a distinct static field, so
// contacts/fieldmap cache entries for the same eventId under a different
// provider can never collide even though the key strings look the same.

(function () {
    "use strict";

    const DYN_RESOURCE_URL_KEY = "dyn_resource_url";
    const DYN_ORG_ID_KEY = "dyn_org_id";
    const DYN_SESSION_ID_KEY = "dyn_session_id";
    const DYN_USER_INFO_KEY = "dyn_user_info";

    class DynamicsLeadLib {
        static _portalConfig = null;
        // Distinct from SalesforceLeadLib._dataCache/HubspotLeadLib._dataCache
        // — see file header.
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
        // dynamics-backend is deployed at Isapidynamicsbackend on Azure App
        // Service (crm-backend/dynamics-backend), independent from
        // salesforce-backend and hubspot-backend — own port in dev (5003,
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
                ? "https://isapidynamicsbackend-h0hgf9are6e2ambw.westeurope-01.azurewebsites.net"
                : "http://localhost:5003";
        }

        static isConnected() {
            return !!localStorage.getItem(DYN_SESSION_ID_KEY);
        }

        static async checkConnection() {
            try {
                const sessionId = localStorage.getItem(DYN_SESSION_ID_KEY) || "";
                const resp = await fetch(`${this._backendUrl()}/api/dynamics/check`, {
                    headers: {
                        ...(sessionId && { "X-Session-Token": sessionId })
                    },
                    credentials: "include"
                });
                if (!resp.ok) return { connected: false };
                const json = await resp.json();
                if (json.connected) {
                    return {
                        connected: true,
                        userInfo: (json.userInfo && (json.userInfo.name || json.userInfo.username)) || ""
                    };
                }
                return { connected: false };
            } catch {
                return { connected: false };
            }
        }

        // Small inline prompt for the one value that identifies *which*
        // Dynamics 365 org to connect to (resourceUrl) — the LeadSuccess app
        // registration itself (clientId/clientSecret) is already configured
        // server-side, same as SF/HubSpot's connected app, so the user is
        // never asked for those. Uses the shared .sf-modal component classes
        // rather than a bespoke dialog.
        // Only asks for the Organization URL — not a tenant ID. Most clients
        // don't know their Azure AD tenant GUID, and dynamics-backend's
        // /api/dynamics/auth defaults to the 'common' multi-tenant endpoint
        // when no tenantId is sent, letting Azure AD detect the signing-in
        // user's own tenant automatically (same as SF/HubSpot's OAuth flows,
        // where the client never provides an org identifier up front).
        static _promptForOrgDetails() {
            return new Promise((resolve, reject) => {
                const overlay = document.createElement("div");
                overlay.className = "sf-modal-overlay dyn-org-prompt-overlay";
                overlay.setAttribute("role", "presentation");
                overlay.innerHTML = `
                    <div class="sf-modal sf-modal--sm" role="alertdialog" aria-modal="true" aria-labelledby="dyn-org-prompt-title">
                        <div class="sf-modal__body" style="padding: 24px;">
                            <h3 class="sf-modal__title" id="dyn-org-prompt-title">Connect to Dynamics 365</h3>
                            <p style="margin: 8px 0 16px; color: var(--sf-text-2); font-size: 13.5px;">Enter your Dynamics 365 organization URL. You'll sign in with your Microsoft account next.</p>
                            <label style="display:block; font-size: 12.5px; font-weight: 600; margin-bottom: 4px; color: var(--sf-text);">Organization URL</label>
                            <input type="text" class="sf-input dyn-org-resource-input" placeholder="https://yourorg.crm4.dynamics.com" style="width:100%;" />
                        </div>
                        <div class="sf-modal__footer">
                            <button class="sf-btn sf-btn--secondary" data-action="dyn-org-cancel">Cancel</button>
                            <button class="sf-btn sf-btn--primary" data-action="dyn-org-continue">Continue</button>
                        </div>
                    </div>`;
                document.body.appendChild(overlay);

                const resourceInput = overlay.querySelector(".dyn-org-resource-input");
                resourceInput.value = localStorage.getItem(DYN_RESOURCE_URL_KEY) || "";

                function cleanup() {
                    overlay.remove();
                }
                overlay.querySelector('[data-action="dyn-org-cancel"]').addEventListener("click", () => {
                    cleanup();
                    reject(new Error("cancelled"));
                });
                overlay.querySelector('[data-action="dyn-org-continue"]').addEventListener("click", () => {
                    const resourceUrl = resourceInput.value.trim().replace(/\/+$/, "");
                    if (!resourceUrl) { return; }
                    cleanup();
                    resolve({ resourceUrl });
                });
            });
        }

        // Open the Dynamics OAuth popup. Unlike SF/HubSpot's single GET
        // /auth/<provider>, dynamics-backend needs a POST first (to attach
        // resourceUrl to the server session before redirecting to Azure AD)
        // which returns the authUrl to actually open. No tenantId is sent —
        // the backend defaults to Azure AD's 'common' endpoint.
        static async connect() {
            const orgDetails = await this._promptForOrgDetails();
            const orgId = localStorage.getItem(DYN_ORG_ID_KEY) || "default";

            const authResp = await fetch(`${this._backendUrl()}/api/dynamics/auth`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resourceUrl: orgDetails.resourceUrl,
                    orgId: orgId
                })
            });
            if (!authResp.ok) {
                const body = await authResp.json().catch(() => ({}));
                throw new Error(body.message || "Failed to start Dynamics 365 sign-in.");
            }
            const authJson = await authResp.json();

            const result = await window.CrmProviders.openOAuthPopup({
                authUrl: authJson.authUrl,
                successMessageType: "DYNAMICS_AUTH_SUCCESS",
                popupName: "dynamics-auth"
            });
            if (!result) {
                return { success: false };
            }
            localStorage.setItem(DYN_RESOURCE_URL_KEY, orgDetails.resourceUrl);
            if (authJson.orgId) localStorage.setItem(DYN_ORG_ID_KEY, authJson.orgId);
            if (result.sessionId) localStorage.setItem(DYN_SESSION_ID_KEY, result.sessionId);
            if (result.userInfo) localStorage.setItem(DYN_USER_INFO_KEY, JSON.stringify(result.userInfo));
            return { success: true, userInfo: result.userInfo };
        }

        static async disconnect() {
            try {
                const sessionId = localStorage.getItem(DYN_SESSION_ID_KEY) || "";
                await fetch(`${this._backendUrl()}/api/dynamics/disconnect`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        ...(sessionId && { "X-Session-Token": sessionId })
                    }
                });
            } catch { /* ignore */ }
            [DYN_RESOURCE_URL_KEY, DYN_ORG_ID_KEY, DYN_SESSION_ID_KEY, DYN_USER_INFO_KEY]
                .forEach((k) => localStorage.removeItem(k));
        }

        static clear(rootElement) {
            if (rootElement) {
                rootElement.innerHTML = "";
            }
        }

        // --- Batch transfer (leadTransferAdapter) ---
        // Consumed by SalesforceLeadLib.executeBatchTransfer via
        // providerConfig.transferAdapter (see hubspotLeadLib.js's own
        // adapter for the full contract this mirrors). Dynamics differs
        // from both Salesforce and HubSpot in two ways this adapter
        // accounts for: field names use Dynamics' own Lead entity schema
        // (DYN_DEFAULT_MAPPINGS, e.g. emailaddress1/companyname — not
        // HubSpot's flat lowercase names, despite looking similar), and
        // there's no configurable upsert key — dynamics-backend's
        // /api/dynamics/leads does its own duplicate check by email
        // server-side rather than upserting by a client-chosen property.

        // Dynamics has no per-client configurable upsert key today (see
        // file header) — returns null so executeBatchTransfer's generic
        // "pass whatever key detectUpsertKey returns" contract still holds,
        // it's just never truthy here.
        static detectUpsertKey() {
            return null;
        }

        // Builds a flat { <dynamics field>: value } object from an
        // LS_LeadReport row, same active-field/custom-label resolution as
        // HubspotLeadLib.buildContactData — just against Dynamics' own
        // field names via DYN_DEFAULT_MAPPINGS/customLabels instead of
        // HubSpot's.
        static buildContactData(itemData, fieldMappingService) {
            const leadData = {};
            const processedData = fieldMappingService?.applyCustomLabels(itemData) ||
                Object.fromEntries(Object.entries(itemData).map(([key, value]) => [key, {
                    value, label: key, active: true
                }]));

            Object.keys(processedData).forEach((sourceField) => {
                if (window.SalesforceLeadLib?.BATCH_EXCLUDED_FIELDS?.has(sourceField)) return;
                if (/\s/.test(sourceField)) return;

                const fieldInfo = processedData[sourceField];
                const isActive = typeof fieldInfo === 'object' ? (fieldInfo.active !== false) : true;
                if (!isActive) return;

                const value = typeof fieldInfo === 'object' ? fieldInfo.value : fieldInfo;
                if (!value || (typeof value === 'string' && (value.trim() === '' || value === 'N/A'))) return;

                const explicitTarget = fieldMappingService?.customLabels?.[sourceField];
                const dynamicsField = (explicitTarget && explicitTarget.trim()) || sourceField;

                if (leadData[dynamicsField] === undefined) {
                    leadData[dynamicsField] = typeof value === 'string' ? value.trim() : value;
                }
            });

            return leadData;
        }

        // Transfers one lead via POST /api/dynamics/leads. Return shape
        // matches SalesforceLeadLib.transferSingleLead's contract exactly,
        // same as HubspotLeadLib.transferOne — see that method's comment
        // for why (shared result-handling code in executeBatchTransfer).
        static async transferOne(leadData, attachments) {
            try {
                const sessionId = localStorage.getItem(DYN_SESSION_ID_KEY) || "";

                const response = await fetch(`${this._backendUrl()}/api/dynamics/leads`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(sessionId && { 'X-Session-Token': sessionId })
                    },
                    credentials: 'include',
                    body: JSON.stringify({ leadData, attachments: attachments || [] })
                });

                if (response.status === 401) {
                    return {
                        success: false,
                        status: 'failed',
                        message: 'Dynamics 365 session expired. Please reconnect and try again.',
                        salesforceId: null,
                        sessionExpired: true
                    };
                }

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    if (response.status === 409) {
                        return {
                            success: false,
                            status: 'duplicate',
                            message: data.message || 'Duplicate lead found',
                            salesforceId: data.dynamicsId || null,
                            duplicateWarning: true,
                            isUpdate: false
                        };
                    }
                    return {
                        success: false,
                        status: 'failed',
                        message: data.message || `HTTP ${response.status}`,
                        salesforceId: null,
                        duplicateWarning: null,
                        isUpdate: false
                    };
                }

                return {
                    success: true,
                    status: 'success',
                    message: data.message || 'Lead created',
                    salesforceId: data.leadId || null,
                    duplicateWarning: null,
                    isUpdate: false,
                    attachmentsTransferred: data.attachments?.transferred || 0
                };
            } catch (error) {
                return {
                    success: false,
                    status: 'failed',
                    message: error.message || 'Unexpected error',
                    salesforceId: null,
                    duplicateWarning: null,
                    isUpdate: false
                };
            }
        }

        // --- Field Configurator ---
        // Delegates to SalesforceLeadLib's generalized openFieldMapping, same
        // as HubspotLeadLib — see hubspotLeadLib.js for how apiEndpointValue/
        // defaultMappings/dataCache/providerLabel/crmAdapter steer the
        // generic rendering per-provider.
        static async openFieldMapping(rootElement, eventId, options = {}) {
            if (!this._portalConfig) { throw new Error("DynamicsLeadLib not initialized. Call init() first."); }
            const dynamicsAdapter = window.CrmProviders && CrmProviders.getAdapter("dynamics");
            return window.SalesforceLeadLib.openFieldMapping(rootElement, eventId, {
                ...options,
                apiEndpointValue: "Dynamics365",
                providerLabel: "MS Dynamics 365",
                defaultMappings: CrmProviders.DYN_DEFAULT_MAPPINGS,
                dataCache: DynamicsLeadLib._dataCache,
                crmAdapter: (dynamicsAdapter && dynamicsAdapter.id === "dynamics") ? dynamicsAdapter : null
            });
        }

        static async saveFieldMapping(eventId) {
            return window.SalesforceLeadLib.saveFieldMapping(eventId);
        }

        // --- Contact list ---
        // Delegates to SalesforceLeadLib's generalized renderContactList, same
        // as HubspotLeadLib. Batch transfer now uses DynamicsLeadLib's own
        // transferAdapter (buildContactData/detectUpsertKey/transferOne
        // above) instead of Salesforce's Lead-object logic.
        static async renderContactList(rootElement, eventId, options = {}) {
            if (!this._portalConfig) { throw new Error("DynamicsLeadLib not initialized. Call init() first."); }
            const dynamicsAdapter = window.CrmProviders && CrmProviders.getAdapter("dynamics");
            return window.SalesforceLeadLib.renderContactList(rootElement, eventId, {
                ...options,
                apiEndpointValue: "Dynamics365",
                providerLabel: "MS Dynamics 365",
                defaultMappings: CrmProviders.DYN_DEFAULT_MAPPINGS,
                dataCache: DynamicsLeadLib._dataCache,
                crmAdapter: (dynamicsAdapter && dynamicsAdapter.id === "dynamics") ? dynamicsAdapter : null,
                supportsBatchTransfer: true,
                transferAdapter: {
                    buildContactData: (itemData, fieldMappingService) => DynamicsLeadLib.buildContactData(itemData, fieldMappingService),
                    detectUpsertKey: (fieldMappingService) => DynamicsLeadLib.detectUpsertKey(fieldMappingService),
                    transferOne: (leadData, attachments, upsertKey) => DynamicsLeadLib.transferOne(leadData, attachments, upsertKey)
                }
            });
        }
    }

    // Expose to window
    window.DynamicsLeadLib = DynamicsLeadLib;

    // Register with the CRM provider registry (lib/CrmProviders/scripts/
    // crmProviderRegistry.js). Replaces crmConnectionsController.js's old
    // client-side-only registerDynamicsStubAdapter() now that dynamics-backend
    // has a real centralized app registration to connect through.
    if (window.CrmProviders && typeof window.CrmProviders.registerAdapter === "function") {
        window.CrmProviders.registerAdapter({
            id: "dynamics",
            label: "MS Dynamics 365",
            apiEndpointValue: "Dynamics365",
            status: "available",
            isConnected: DynamicsLeadLib.isConnected,
            checkConnection: function () { return DynamicsLeadLib.checkConnection(); },
            connect: function () { return DynamicsLeadLib.connect(); },
            disconnect: function () { return DynamicsLeadLib.disconnect(); },
            renderContactList: function (rootElement, eventId, options) {
                return DynamicsLeadLib.renderContactList(rootElement, eventId, options);
            },
            openFieldMapping: function (rootElement, eventId, options) {
                return DynamicsLeadLib.openFieldMapping(rootElement, eventId, options);
            },
            saveFieldMapping: function (eventId) {
                return DynamicsLeadLib.saveFieldMapping(eventId);
            }
        });
    }

    console.log("DynamicsLeadLib loaded and ready");

})();
