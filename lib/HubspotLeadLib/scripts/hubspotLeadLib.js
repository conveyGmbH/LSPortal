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
                ? "https://hubspot.leadsuccess.convey.de"
                : "http://localhost:5002";
        }

        static isConnected() {
            return !!localStorage.getItem(HS_SESSION_TOKEN_KEY);
        }

        // In-memory only (not localStorage) — read-only status can change on
        // HubSpot's side at any time, so it shouldn't outlive the tab/reload.
        // Fetched at most once per READONLY_CACHE_TTL_MS, shared by every
        // buildContactData() call in a batch run and by the Field Mapping UI,
        // instead of each contact/each mapping render hitting the backend.
        static _readOnlyFieldsCache = null; // { names: Set<string>, fetchedAt: number } | null
        static READONLY_CACHE_TTL_MS = 60_000;

        static async getReadOnlyPropertyNames() {
            const cached = HubspotLeadLib._readOnlyFieldsCache;
            if (cached && (Date.now() - cached.fetchedAt) < HubspotLeadLib.READONLY_CACHE_TTL_MS) {
                return cached.names;
            }
            try {
                const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "";
                const sessionToken = localStorage.getItem(HS_SESSION_TOKEN_KEY) || "";
                const resp = await fetch(`${this._backendUrl()}/api/hubspot/properties/readonly`, {
                    headers: {
                        ...(orgId && { "X-Org-Id": orgId }),
                        ...(sessionToken && { "X-Session-Token": sessionToken })
                    }
                });
                if (!resp.ok) return cached?.names || new Set();
                const data = await resp.json();
                const names = new Set(data.readOnlyFields || []);
                HubspotLeadLib._readOnlyFieldsCache = { names, fetchedAt: Date.now() };
                return names;
            } catch {
                return cached?.names || new Set();
            }
        }

        // Same pattern/cache as getReadOnlyPropertyNames, but ALL valid
        // contact property names - lets a new custom field's name be checked
        // against the real HubSpot schema up front, instead of only failing
        // much later via checkFieldsExistence's 422 at actual transfer time.
        static _allPropertyNamesCache = null; // { names: Set<string>, fetchedAt: number } | null

        static async getAllPropertyNames() {
            const cached = HubspotLeadLib._allPropertyNamesCache;
            if (cached && (Date.now() - cached.fetchedAt) < HubspotLeadLib.READONLY_CACHE_TTL_MS) {
                return cached.names;
            }
            try {
                const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "";
                const sessionToken = localStorage.getItem(HS_SESSION_TOKEN_KEY) || "";
                const resp = await fetch(`${this._backendUrl()}/api/hubspot/properties/names`, {
                    headers: {
                        ...(orgId && { "X-Org-Id": orgId }),
                        ...(sessionToken && { "X-Session-Token": sessionToken })
                    }
                });
                if (!resp.ok) return cached?.names || null;
                const data = await resp.json();
                const names = new Set(data.propertyNames || []);
                HubspotLeadLib._allPropertyNamesCache = { names, fetchedAt: Date.now() };
                return names;
            } catch {
                return cached?.names || null;
            }
        }

        // Same pattern/cache again, but { propertyName: "date" | "datetime" }
        // for every date-typed contact property - lets buildContactData
        // convert a mapped value to what HubSpot actually accepts instead of
        // sending a user-typed string like "31.02.2026" as-is (QA D1-D4: a
        // malformed date fails the WHOLE contact with a 422, silently).
        static _dateFieldsCache = null; // { types: Map<string,string>, fetchedAt: number } | null

        static async getDateFieldTypes() {
            const cached = HubspotLeadLib._dateFieldsCache;
            if (cached && (Date.now() - cached.fetchedAt) < HubspotLeadLib.READONLY_CACHE_TTL_MS) {
                return cached.types;
            }
            try {
                const orgId = localStorage.getItem(HS_ORG_ID_KEY) || "";
                const sessionToken = localStorage.getItem(HS_SESSION_TOKEN_KEY) || "";
                const resp = await fetch(`${this._backendUrl()}/api/hubspot/properties/date-fields`, {
                    headers: {
                        ...(orgId && { "X-Org-Id": orgId }),
                        ...(sessionToken && { "X-Session-Token": sessionToken })
                    }
                });
                if (!resp.ok) return cached?.types || new Map();
                const data = await resp.json();
                const types = new Map(Object.entries(data.dateFields || {}));
                HubspotLeadLib._dateFieldsCache = { types, fetchedAt: Date.now() };
                return types;
            } catch {
                return cached?.types || new Map();
            }
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

        // Parses a date typed by a user (Add/Edit Custom Field's default value)
        // or coming from an OData source field, in any of the formats QA found
        // in the wild: the OData /Date(ms)/ wrapper, ISO "YYYY-MM-DD", and the
        // German "dd.MM.yyyy". Returns a UTC midnight Date, or null if the
        // string matches none of these shapes or isn't a real calendar date
        // (e.g. "31.02.2026" - JS Date would otherwise silently roll that over
        // to March 3rd instead of rejecting it).
        static _parseFlexibleDate(value) {
            const odataDate = window.SalesforceLeadLib?.parseODataDateValue?.(value);
            if (odataDate) return odataDate;

            const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (isoMatch) {
                return HubspotLeadLib._toUtcDateIfValid(+isoMatch[1], +isoMatch[2], +isoMatch[3]);
            }

            const deMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (deMatch) {
                return HubspotLeadLib._toUtcDateIfValid(+deMatch[3], +deMatch[2], +deMatch[1]);
            }

            return null;
        }

        // year/month(1-12)/day as typed - re-reads the constructed Date's own
        // fields to confirm they didn't change, since new Date(Date.UTC(...))
        // never throws and instead rolls an out-of-range day/month into the
        // next one (e.g. Feb 31 -> Mar 3), which is exactly the invalid input
        // this needs to catch rather than silently "correct".
        static _toUtcDateIfValid(year, month, day) {
            const d = new Date(Date.UTC(year, month - 1, day));
            const isValid = d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
            return isValid ? d : null;
        }

        // HubSpot date properties want "YYYY-MM-DD"; datetime properties want
        // midnight UTC as an epoch-ms LONG (per HubSpot's property docs).
        // dateFieldType is undefined for a non-date property, in which case a
        // string is passed through unchanged - only OData's own /Date(ms)/
        // wrapper is unwrapped regardless, since that's never a valid contact
        // value in any other property type.
        static _formatValueForHubSpot(value, dateFieldType) {
            if (typeof value !== 'string') return value;
            const trimmed = value.trim();

            if (!dateFieldType) {
                const odataDate = window.SalesforceLeadLib?.parseODataDateValue?.(trimmed);
                return odataDate ? odataDate.toISOString().split('T')[0] : trimmed;
            }

            const parsed = HubspotLeadLib._parseFlexibleDate(trimmed);
            if (!parsed) return trimmed; // let HubSpot's own 422 report the bad value - caller warns first, see buildContactData
            return dateFieldType === 'datetime' ? parsed.getTime() : parsed.toISOString().split('T')[0];
        }

        // Builds a flat { <hubspot property>: value } object from an
        // LS_LeadReport row; required-ness is enforced by HubSpot itself.
        // Async because it fetches (cached) which target properties are
        // read-only in HubSpot, to drop them here instead of sending a value
        // HubSpot would silently ignore anyway.
        // options.silent skips every user-facing toast (dropped-field
        // warnings included) - validateLeadsForTransfer calls this per lead
        // just to sniff the email value BEFORE the user has confirmed
        // anything, and was firing the read-only warning toast on every
        // click of "Start Batch Transfer" even when the user went on to
        // cancel. The real transfer path (executeBatchTransfer) does not
        // pass this, so the warning still fires exactly once, at the point
        // the transfer actually happens.
        static async buildContactData(itemData, fieldMappingService, options = {}) {
            const silent = options.silent === true;
            const contactData = {};
            const readOnlyFields = await HubspotLeadLib.getReadOnlyPropertyNames();
            const dateFieldTypes = await HubspotLeadLib.getDateFieldTypes();
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
            const droppedReadOnlyFields = [];
            const droppedSystemFields = [];
            const invalidDateFields = [];
            Object.keys(processedData).forEach((sourceField) => {
                // Same escape hatch as Salesforce's buildLeadDataFromItem: a system/LS-internal
                // field (CreatedDate, SystemModstamp, ...) is excluded by default, UNLESS the
                // user explicitly mapped it to a real HubSpot property - otherwise that mapping
                // silently never reached HubSpot with no warning (QA D1: CreatedDate -> closedate,
                // active and saved, but absent from the payload and from readOnlyFieldsDropped).
                if (window.SalesforceLeadLib?.BATCH_EXCLUDED_FIELDS?.has(sourceField)) {
                    const explicitTarget = fieldMappingService?.customLabels?.[sourceField];
                    const hasExplicitMapping = explicitTarget && explicitTarget.trim() !== '' && explicitTarget !== sourceField;
                    if (!hasExplicitMapping) {
                        droppedSystemFields.push(sourceField);
                        return;
                    }
                }
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

                // Read-only in HubSpot (createdate, hs_analytics_*, etc.) -
                // HubSpot's API would accept the write and silently ignore
                // the value, so dropping it here saves the wasted payload
                // bytes/API quota rather than finding out after the fact.
                if (readOnlyFields.has(hubspotProperty)) {
                    droppedReadOnlyFields.push(hubspotProperty);
                    return;
                }

                // A date-typed target whose value doesn't parse in any known
                // format (OData, ISO, dd.MM.yyyy) would otherwise be sent as
                // the raw string and fail the WHOLE contact with a 422 from
                // HubSpot, with no indication of which field caused it (QA
                // D2/D4). Skip it here instead, the same way a read-only or
                // nonexistent target is skipped, and warn below.
                const dateFieldType = dateFieldTypes.get(hubspotProperty);
                if (dateFieldType && typeof value === 'string' && !HubspotLeadLib._parseFlexibleDate(value.trim())) {
                    invalidDateFields.push({ field: hubspotProperty, value: value.trim() });
                    return;
                }

                if (contactData[hubspotProperty] === undefined) {
                    contactData[hubspotProperty] = HubspotLeadLib._formatValueForHubSpot(value, dateFieldType);
                }
            });

            // HubSpot property names can't contain spaces — silently excluding
            // these fields (instead of erroring) previously left the client with
            // no way to know a custom field's value was never actually sent.
            // buildContactData runs once per lead (batch transfer, duplicate
            // check), so the toast is shown at most once per field name per
            // page load to avoid spamming a batch of 100 identical warnings.
            //
            // Both console.warn and the toast live inside the same "if
            // (!silent)" block - QA caught that console.warn used to fire
            // unconditionally, so it logged at the click of "Start Batch
            // Transfer" (during validateLeadsForTransfer's preview) while the
            // toast only showed later at the real transfer, an inconsistent
            // pair of signals firing at two different moments for the same
            // event. Preview calls (silent: true) now produce neither.
            if (droppedFields.length > 0 && !silent) {
                HubspotLeadLib._warnedDroppedFields = HubspotLeadLib._warnedDroppedFields || new Set();
                const newlyWarned = droppedFields.filter(f => !HubspotLeadLib._warnedDroppedFields.has(f));
                if (newlyWarned.length > 0) {
                    console.warn(`[HubSpot] Field(s) skipped — property name contains a space, not a valid HubSpot property key: ${newlyWarned.join(', ')}`);
                    newlyWarned.forEach(f => HubspotLeadLib._warnedDroppedFields.add(f));
                    if (typeof window.SalesforceLeadLib?._showToast === 'function') {
                        window.SalesforceLeadLib._showToast(
                            `Skipped field(s) with spaces in their name (not sent to HubSpot): ${newlyWarned.join(', ')}`,
                            'warning'
                        );
                    }
                }
            }

            // Same "warn once per field name per page load" pattern as above -
            // a batch of 100 leads mapped to the same read-only target would
            // otherwise spam the same toast 100 times.
            if (droppedReadOnlyFields.length > 0 && !silent) {
                const uniqueReadOnly = [...new Set(droppedReadOnlyFields)];
                HubspotLeadLib._warnedReadOnlyFields = HubspotLeadLib._warnedReadOnlyFields || new Set();
                const newlyWarned = uniqueReadOnly.filter(f => !HubspotLeadLib._warnedReadOnlyFields.has(f));
                if (newlyWarned.length > 0) {
                    console.warn(`[HubSpot] Field(s) skipped — read-only in HubSpot, value not sent: ${newlyWarned.join(', ')}`);
                    newlyWarned.forEach(f => HubspotLeadLib._warnedReadOnlyFields.add(f));
                    if (typeof window.SalesforceLeadLib?._showToast === 'function') {
                        window.SalesforceLeadLib._showToast(
                            `Skipped field(s) that are read-only in HubSpot (value not sent): ${newlyWarned.join(', ')}. Map to a different property instead.`,
                            'warning'
                        );
                    }
                }
            }

            // Same "warn once per field name per page load" pattern as above - a system/
            // LS-internal field (CreatedDate, SystemModstamp, ...) mapped and active but with
            // no explicit target is a no-op mapping the user can't otherwise tell isn't sent.
            if (droppedSystemFields.length > 0 && !silent) {
                const uniqueSystem = [...new Set(droppedSystemFields)];
                HubspotLeadLib._warnedSystemFields = HubspotLeadLib._warnedSystemFields || new Set();
                const newlyWarned = uniqueSystem.filter(f => !HubspotLeadLib._warnedSystemFields.has(f));
                if (newlyWarned.length > 0) {
                    console.warn(`[HubSpot] Field(s) skipped — LeadSuccess system field, not sent unless mapped to a HubSpot property: ${newlyWarned.join(', ')}`);
                    newlyWarned.forEach(f => HubspotLeadLib._warnedSystemFields.add(f));
                    if (typeof window.SalesforceLeadLib?._showToast === 'function') {
                        window.SalesforceLeadLib._showToast(
                            `Skipped system field(s) not sent to HubSpot: ${newlyWarned.join(', ')}. Map to a HubSpot property first, or unmap it.`,
                            'warning'
                        );
                    }
                }
            }

            // Same idea as the other warnings, but deduped by "field + value"
            // rather than by field name alone: unlike a read-only/system field
            // (always the same reason regardless of lead), a date can be valid
            // on one lead and malformed on another, and QA specifically asked
            // for the bad value to be shown rather than a generic message.
            if (invalidDateFields.length > 0 && !silent) {
                HubspotLeadLib._warnedInvalidDates = HubspotLeadLib._warnedInvalidDates || new Set();
                const newlyWarned = invalidDateFields.filter(
                    ({ field, value }) => !HubspotLeadLib._warnedInvalidDates.has(`${field}\u0000${value}`)
                );
                if (newlyWarned.length > 0) {
                    const descriptions = newlyWarned.map(({ field, value }) => `${field}="${value}"`);
                    console.warn(`[HubSpot] Field(s) skipped — not a valid date (expected dd.MM.yyyy, yyyy-MM-dd, or ISO): ${descriptions.join(', ')}`);
                    newlyWarned.forEach(({ field, value }) => HubspotLeadLib._warnedInvalidDates.add(`${field}\u0000${value}`));
                    if (typeof window.SalesforceLeadLib?._showToast === 'function') {
                        window.SalesforceLeadLib._showToast(
                            `Skipped field(s) with an unrecognized date (value not sent): ${descriptions.join(', ')}. Use dd.MM.yyyy or yyyy-MM-dd.`,
                            'warning'
                        );
                    }
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
                leads: await Promise.all(leads.map(async (item) => ({
                    leadId: item.Id,
                    // Reuses buildContactData's mapping instead of assuming
                    // the source column is always "Email". silent: true - this
                    // only checks for existing HubSpot contacts, no field
                    // values are actually sent here, so a read-only-field
                    // warning would be noise at best, misleading at worst.
                    email: (await this.buildContactData(item, fieldMappingService, { silent: true })).email || null,
                    idPropertyValue: item.Id
                })))
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
                crmAdapter: (hubspotAdapter && hubspotAdapter.id === "hubspot") ? hubspotAdapter : null,
                getReadOnlyTargetFieldNames: () => HubspotLeadLib.getReadOnlyPropertyNames()
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
                    buildContactData: (itemData, fieldMappingService, options) => HubspotLeadLib.buildContactData(itemData, fieldMappingService, options),
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
