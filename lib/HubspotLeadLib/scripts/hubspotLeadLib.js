// Structural sibling of SalesforceLeadLib (same static-class shape/method
// names) so both work interchangeably through the CrmProviders registry.
// Talks to a different backend than Salesforce (crm-backend, not
// LSAPISFSamples_www), reusing the same X-Org-Id / X-Session-Token headers.
//
// Deliberately does NOT extend SalesforceLeadLib or share its static
// _dataCache: keeps SF/HubSpot cache entries for the same eventId from
// colliding even though the key strings look the same.

(function () {
    "use strict";

    const HS_ORG_ID_KEY = "hs_org_id";
    const HS_SESSION_TOKEN_KEY = "hs_session_token";
    const HS_USER_INFO_KEY = "hs_user_info";

    class HubspotLeadLib {
        static _portalConfig = null;
        // Distinct from SalesforceLeadLib._dataCache — see file header.
        static _dataCache = new Map();

        // Call once before renderContactList()/openFieldMapping().
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

        // Dev port 5002 (SF/HubSpot/Dynamics use 5001/5002/5003).
        static _backendUrl() {
            const hostname = window.location.hostname;
            // Anchored suffix match, not substring — includes('convey.de')
            // would also match an attacker-controlled "convey.de.evil.com".
            const isProductionDomain = (host, domain) => host === domain || host.endsWith('.' + domain);
            const isProductionHost = isProductionDomain(hostname, 'convey.de') ||
                isProductionDomain(hostname, 'azurewebsites.net') ||
                isProductionDomain(hostname, 'azurestaticapps.net');
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

        // orgId defaults to 'default' until the first successful OAuth
        // handshake returns the real isolation key (same convention SF uses).
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

        // Read the isolation key BEFORE clearing localStorage, or the
        // disconnect request can't identify which connection to remove.
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

        // Consumed by SalesforceLeadLib.executeBatchTransfer via
        // providerConfig.transferAdapter. Unlike Salesforce, HubSpot uses
        // flat property names (no __c suffix) and duplicate detection is a
        // real API call (batch-check) rather than a 409 from the transfer.

        // Upsert key property name (ls_lead_id unless remapped), or null.
        static detectUpsertKey(fieldMappingService) {
            const mapped = fieldMappingService?.customLabels?.['Id'];
            return (mapped && mapped.trim()) ? mapped.trim() : 'ls_lead_id';
        }

        // Builds a flat { <hubspot property>: value } object from an
        // LS_LeadReport row; required-ness is enforced by HubSpot itself.
        static buildContactData(itemData, fieldMappingService) {
            const contactData = {};
            const processedData = fieldMappingService?.applyCustomLabels(itemData) ||
                Object.fromEntries(Object.entries(itemData).map(([key, value]) => [key, {
                    value, label: key, active: true
                }]));

            // Active custom fields (user-defined, fixed value — e.g. "Lead Source")
            // are a separate list from the OData columns applyCustomLabels just
            // processed above, and were never merged in here, so they silently
            // never reached HubSpot regardless of their Active toggle in CRM
            // Settings. Same merge Salesforce's buildLeadDataFromItem already does.
            if (fieldMappingService) {
                const customFields = typeof fieldMappingService.getAllCustomFields === 'function'
                    ? fieldMappingService.getAllCustomFields()
                    : (fieldMappingService.customFields || []);
                if (customFields) {
                    customFields.forEach((field) => {
                        if (field.active) {
                            const editedValue = itemData[field.sfFieldName];
                            processedData[field.sfFieldName] = {
                                value: editedValue !== undefined ? editedValue : (field.value || ''),
                                label: field.label || field.sfFieldName,
                                active: true,
                                isCustomField: true
                            };
                        }
                    });
                }
            }

            const droppedFields = [];
            Object.keys(processedData).forEach((sourceField) => {
                if (window.SalesforceLeadLib?.BATCH_EXCLUDED_FIELDS?.has(sourceField)) return;
                if (/\s/.test(sourceField)) {
                    droppedFields.push(sourceField);
                    return;
                }

                const fieldInfo = processedData[sourceField];
                const isActive = typeof fieldInfo === 'object' ? (fieldInfo.active !== false) : true;
                if (!isActive) return;

                const value = typeof fieldInfo === 'object' ? fieldInfo.value : fieldInfo;
                if (!value || (typeof value === 'string' && (value.trim() === '' || value === 'N/A'))) return;

                // HubSpot rejects property names with uppercase letters, so
                // an unmapped source field (e.g. "FirstName") must be
                // lowercased; an explicit client mapping is honored as typed.
                const explicitTarget = fieldMappingService?.customLabels?.[sourceField];
                const hubspotProperty = (explicitTarget && explicitTarget.trim()) || sourceField.toLowerCase();
                if (/\s/.test(hubspotProperty)) {
                    droppedFields.push(sourceField);
                    return;
                }

                if (contactData[hubspotProperty] === undefined) {
                    contactData[hubspotProperty] = typeof value === 'string' ? value.trim() : value;
                }
            });

            // HubSpot property names can't contain spaces — silently excluding
            // these fields (instead of erroring) previously left the client with
            // no way to know a custom field's value was never actually sent.
            // buildContactData runs once per lead (batch transfer, duplicate
            // check), so the toast is shown at most once per field name per
            // page load to avoid spamming a batch of 100 identical warnings.
            if (droppedFields.length > 0) {
                console.warn(`[HubSpot] Field(s) skipped — property name contains a space, not a valid HubSpot property key: ${droppedFields.join(', ')}`);
                HubspotLeadLib._warnedDroppedFields = HubspotLeadLib._warnedDroppedFields || new Set();
                const newlyWarned = droppedFields.filter(f => !HubspotLeadLib._warnedDroppedFields.has(f));
                if (newlyWarned.length > 0 && typeof window.SalesforceLeadLib?._showToast === 'function') {
                    newlyWarned.forEach(f => HubspotLeadLib._warnedDroppedFields.add(f));
                    window.SalesforceLeadLib._showToast(
                        `Skipped field(s) with spaces in their name (not sent to HubSpot): ${newlyWarned.join(', ')}`,
                        'warning'
                    );
                }
            }

            // Must ride along even if Id isn't "active" in the field config,
            // or the upsert has nothing to match on.
            const upsertKey = this.detectUpsertKey(fieldMappingService);
            if (upsertKey && itemData.Id && contactData[upsertKey] === undefined) {
                contactData[upsertKey] = itemData.Id;
            }

            return contactData;
        }

        // Return shape matches SalesforceLeadLib.transferSingleLead exactly
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

                // HubSpot has no attachment field on Contact; files are
                // attached via a Note on the timeline instead.
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

        // Returns Map<leadId, {status, hubspotId?, url?}> for O(1) lookup
        // by the UI. status distinguishes an exact idProperty match from an
        // email conflict (a different contact owns that email — the case
        // that would 409 on transfer) from not-found.
        static async checkDuplicates(leads, fieldMappingService) {
            const upsertKey = this.detectUpsertKey(fieldMappingService);
            const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "default";
            const sessionToken = localStorage.getItem(HS_SESSION_TOKEN_KEY) || "";

            const payload = {
                idProperty: upsertKey,
                leads: leads.map((item) => ({
                    leadId: item.Id,
                    // Reuses buildContactData's mapping instead of assuming
                    // the source column is always "Email".
                    email: this.buildContactData(item, fieldMappingService).email || null,
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

        // Delegates to SalesforceLeadLib's generalized openFieldMapping,
        // parameterized with HubSpot's own config.
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

        // Generic across providers — reads whatever openFieldMapping stashed
        // on the #fieldmappings-container element.
        static async saveFieldMapping(eventId) {
            return window.SalesforceLeadLib.saveFieldMapping(eventId);
        }

        // Delegates to SalesforceLeadLib's generalized renderContactList,
        // but batch transfer uses this file's own transferAdapter below
        // instead of Salesforce's Lead-object logic.
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

    window.HubspotLeadLib = HubspotLeadLib;

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
