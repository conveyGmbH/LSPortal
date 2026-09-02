// dynamicsLeadLib.js - MS Dynamics 365 integration for LeadSuccess Portal
//
// Structural sibling of HubspotLeadLib/SalesforceLeadLib, called
// interchangeably through the CrmProviders registry. Talks to its own
// dynamics-backend (distinct from Salesforce/HubSpot's), sharing one
// LeadSuccess Azure AD App Registration across all clients. What's still
// per-client is the Dynamics 365 org (resourceUrl), so connect() prompts
// for it before opening the OAuth popup, unlike SF/HubSpot's one-click GET.
// No tenant ID is asked: Azure AD's 'common' endpoint auto-detects it.
//
// Does NOT extend SalesforceLeadLib or share its static _dataCache, so
// cache entries for the same eventId under different providers can't collide.

(function () {
    "use strict";

    const DYN_RESOURCE_URL_KEY = "dyn_resource_url";
    const DYN_ORG_ID_KEY = "dyn_org_id";
    const DYN_SESSION_ID_KEY = "dyn_session_id";
    const DYN_USER_INFO_KEY = "dyn_user_info";

    class DynamicsLeadLib {
        static _portalConfig = null;
        // Distinct from SalesforceLeadLib/HubspotLeadLib's caches — see file header.
        static _dataCache = new Map();

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

        // Dev port 5003, part of the 5001/5002/5003 SF/HubSpot/Dynamics range.
        static _backendUrl() {
            const hostname = window.location.hostname;
            // Anchored suffix match, not substring: includes('convey.de') would
            // also match an attacker-controlled host like "convey.de.evil.com".
            const isProductionDomain = (host, domain) => host === domain || host.endsWith('.' + domain);
            const isProductionHost = isProductionDomain(hostname, 'convey.de') ||
                isProductionDomain(hostname, 'azurewebsites.net') ||
                isProductionDomain(hostname, 'azurestaticapps.net');
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

        // Only asks for the Organization URL, not a tenant ID: most clients don't
        // know their Azure AD tenant GUID, and dynamics-backend's /api/dynamics/auth
        // defaults to the 'common' endpoint when none is sent.
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

        // Unlike SF/HubSpot's single GET /auth/<provider>, this needs a POST first
        // to attach resourceUrl to the server session before it returns the authUrl.
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

        // --- Batch transfer (leadTransferAdapter, consumed via SalesforceLeadLib.executeBatchTransfer) ---
        // No configurable upsert key: dynamics-backend does its own duplicate
        // check by email server-side rather than upserting by a chosen property.

        // Always null here; executeBatchTransfer's generic contract still holds.
        static detectUpsertKey() {
            return null;
        }

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

        // Return shape matches SalesforceLeadLib.transferSingleLead's contract
        // exactly — required by shared result-handling code in executeBatchTransfer.
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
        // Delegates to SalesforceLeadLib's generalized openFieldMapping, same as HubspotLeadLib.
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
        // Delegates to SalesforceLeadLib's generalized renderContactList; batch
        // transfer uses DynamicsLeadLib's own transferAdapter above instead of
        // Salesforce's Lead-object logic.
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

    window.DynamicsLeadLib = DynamicsLeadLib;

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
