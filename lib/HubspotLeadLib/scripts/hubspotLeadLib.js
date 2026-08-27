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

        // --- Batch transfer (leadTransferAdapter) ---
        // Consumed by SalesforceLeadLib.executeBatchTransfer via
        // providerConfig.transferAdapter — see that method's header comment
        // for the full contract. HubSpot's shape differs from Salesforce's
        // Lead object in three ways this adapter accounts for: flat property
        // names (no __c suffix), the upsert key is a plain property
        // (ls_lead_id) rather than a field mapped through customLabels['Id'],
        // and duplicate detection is a real HubSpot API call
        // (batch-check) rather than a 409 surfaced by the transfer itself.

        // Returns the HubSpot property name configured as the upsert key
        // (ls_lead_id by default, but the client may have remapped it), or
        // null if none is configured — mirrors
        // SalesforceLeadLib.detectExternalIdField's contract but HubSpot
        // properties need no suffix, unlike Salesforce's __c convention.
        static detectUpsertKey(fieldMappingService) {
            const mapped = fieldMappingService?.customLabels?.['Id'];
            return (mapped && mapped.trim()) ? mapped.trim() : 'ls_lead_id';
        }

        // Builds a flat { <hubspot property>: value } object from an
        // LS_LeadReport row, honoring the same active-field/custom-label
        // config SalesforceLeadLib.buildLeadDataFromItem reads — just
        // without the __c suffixing or SF-required-field coercion, since
        // HubSpot property names are used as-is and required-ness is
        // enforced by HubSpot itself at write time.
        static buildContactData(itemData, fieldMappingService) {
            const contactData = {};
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

                // HubSpot rejects any property name with an uppercase letter
                // ("Names for properties should be lowercase") — a mapping
                // explicitly chosen by the client is honored as typed (they
                // may have created the custom property with that exact
                // name), but an unmapped source field falls back to its
                // OData column name (Company, FirstName — PascalCase) which
                // must be lowercased, not used verbatim.
                const explicitTarget = fieldMappingService?.customLabels?.[sourceField];
                const hubspotProperty = (explicitTarget && explicitTarget.trim()) || sourceField.toLowerCase();

                if (contactData[hubspotProperty] === undefined) {
                    contactData[hubspotProperty] = typeof value === 'string' ? value.trim() : value;
                }
            });

            // The upsert key must ride along even if its source field (Id)
            // isn't itself "active" in the field config — otherwise the
            // upsert has nothing to match on.
            const upsertKey = this.detectUpsertKey(fieldMappingService);
            if (upsertKey && itemData.Id && contactData[upsertKey] === undefined) {
                contactData[upsertKey] = itemData.Id;
            }

            return contactData;
        }

        // Transfers one contact via POST /api/hubspot/contacts (create or
        // upsert depending on whether idProperty/idValue are present).
        // Return shape matches SalesforceLeadLib.transferSingleLead's
        // contract exactly (status/message/salesforceId/duplicateWarning)
        // so executeBatchTransfer's generic result handling needs no
        // provider-specific branching.
        static async transferOne(contactData, attachments, upsertKey) {
            try {
                const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "default";
                const sessionToken = localStorage.getItem(HS_SESSION_TOKEN_KEY) || "";

                const response = await fetch(`${this._backendUrl()}/api/hubspot/contacts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Org-Id': orgId,
                        ...(sessionToken && { 'X-Session-Token': sessionToken })
                    },
                    credentials: 'include',
                    body: JSON.stringify({ contactData, idProperty: upsertKey || undefined })
                });

                if (response.status === 401) {
                    return {
                        success: false,
                        status: 'failed',
                        message: 'HubSpot session expired. Please reconnect to HubSpot and try again.',
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
                            message: data.message || 'Contact already exists',
                            salesforceId: data.error?.id || null,
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

                // Attach files after the contact exists — HubSpot has no
                // attachment field on Contact, files are visible via a Note
                // on the timeline (see providers/hubspot/index.js).
                let attachmentsTransferred = 0;
                if (data.hubspotId && attachments && attachments.length > 0) {
                    try {
                        const attachRes = await fetch(`${this._backendUrl()}/api/hubspot/contacts/${data.hubspotId}/attachments`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Org-Id': orgId,
                                ...(sessionToken && { 'X-Session-Token': sessionToken })
                            },
                            credentials: 'include',
                            body: JSON.stringify({ files: attachments })
                        });
                        const attachData = await attachRes.json().catch(() => ({}));
                        attachmentsTransferred = attachData.uploaded || 0;
                    } catch { /* attachment failure doesn't fail the transfer itself */ }
                }

                return {
                    success: true,
                    status: 'success',
                    message: data.message || (data.isUpdate ? 'Contact updated' : 'Contact created'),
                    salesforceId: data.hubspotId || null,
                    duplicateWarning: null,
                    isUpdate: data.isUpdate || false,
                    attachmentsTransferred
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

        // Batch pre-flight duplicate check via POST /api/hubspot/contacts/
        // batch-check (providers/hubspot/index.js) — tells the caller, for
        // each lead, whether it's already synced (idProperty match — the
        // exact same lead), has an email conflict (a different contact owns
        // that email — the scenario that would 409 on transfer), or wasn't
        // found. Returns a Map<leadId, {status, hubspotId?, url?}> for O(1)
        // per-row lookup by the UI, rather than the raw results array.
        static async checkDuplicates(leads, fieldMappingService) {
            const upsertKey = this.detectUpsertKey(fieldMappingService);
            const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "default";
            const sessionToken = localStorage.getItem(HS_SESSION_TOKEN_KEY) || "";

            const payload = {
                idProperty: upsertKey,
                leads: leads.map((item) => ({
                    leadId: item.Id,
                    // Reuses buildContactData's own field-mapping resolution
                    // (active-field/custom-label lookup) instead of assuming
                    // the source column is always called "Email" — honors
                    // whatever the client has actually mapped to HubSpot's
                    // email property.
                    email: this.buildContactData(item, fieldMappingService).email || null,
                    // Same value transferOne's upsert will send under
                    // upsertKey (buildContactData injects itemData.Id there
                    // — see above), so the check and the eventual transfer
                    // always agree on what identifies this lead.
                    idPropertyValue: item.Id
                }))
            };

            const response = await fetch(`${this._backendUrl()}/api/hubspot/contacts/batch-check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Org-Id': orgId,
                    ...(sessionToken && { 'X-Session-Token': sessionToken })
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Duplicate check failed: HTTP ${response.status}`);
            }

            const data = await response.json();
            const byLeadId = new Map();
            (data.results || []).forEach((r) => byLeadId.set(r.leadId, r));
            return byLeadId;
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
        // parameterized with HubSpot's own config. Batch transfer now uses
        // HubspotLeadLib's own transferAdapter (buildContactData/
        // detectUpsertKey/transferOne above) instead of Salesforce's Lead-
        // object logic.
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
                supportsBatchTransfer: true,
                transferAdapter: {
                    buildContactData: (itemData, fieldMappingService) => HubspotLeadLib.buildContactData(itemData, fieldMappingService),
                    detectUpsertKey: (fieldMappingService) => HubspotLeadLib.detectUpsertKey(fieldMappingService),
                    transferOne: (contactData, attachments, upsertKey) => HubspotLeadLib.transferOne(contactData, attachments, upsertKey)
                },
                duplicateCheckAdapter: {
                    checkDuplicates: (leads, fieldMappingService) => HubspotLeadLib.checkDuplicates(leads, fieldMappingService)
                }
            });
        }
    }

    // Expose to window
    window.HubspotLeadLib = HubspotLeadLib;

    // Register with the CRM provider registry (lib/CrmProviders/scripts/
    // crmProviderRegistry.js). openFieldMapping/renderContactList/
    // saveFieldMapping all delegate to SalesforceLeadLib's generalized
    // implementations (same rich UI, own config); batch transfer runs
    // through this file's own transferAdapter (buildContactData/
    // detectUpsertKey/transferOne) instead of Salesforce's Lead-object
    // logic, and the "Check Duplicates" button (renderContactList's
    // duplicateCheckAdapter) surfaces /api/hubspot/contacts/batch-check.
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
