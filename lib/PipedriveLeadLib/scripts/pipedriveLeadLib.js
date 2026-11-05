// Structural sibling of HubspotLeadLib (same static-class shape/method
// names) so it works interchangeably through the CrmProviders registry.
// Talks to its own backend (crm-backend/pipedrive-backend), reusing the same
// X-Org-Id / X-Session-Token headers.
//
// What differs from HubSpot:
//   - A mapping target is a Pipedrive person field, given by the label the
//     customer sees in Pipedrive ("LeadSuccess ID") or by its key. Labels may
//     contain spaces and upper case; the backend resolves them.
//   - Option fields and dates are converted by the backend (labels -> option
//     ids, "14.10.2026" -> "2026-10-14"), so values are sent as captured.
//   - The person's company goes to an Organization (org_name), found by name
//     or created.
//   - Pipedrive never blocks a duplicate person, so "always new" is offered.

(function () {
    "use strict";

    const PD_ORG_ID_KEY = "pd_org_id";
    const PD_SESSION_TOKEN_KEY = "pd_session_token";
    const PD_USER_INFO_KEY = "pd_user_info";

    // Defined in fieldMappingService.js (loaded first, see index.template.html).
    const PD_SOURCE_TO_TARGET = window.CrmProviders?.PD_SOURCE_TO_TARGET || {};

    // Same lookup as SalesforceLeadLib's _t: WinJS resource string, else fallback.
    function _t(key, fallback) {
        try {
            if (typeof WinJS !== 'undefined' && WinJS.Resources && WinJS.Resources.getString) {
                const result = WinJS.Resources.getString(key);
                if (result && !result.empty) return result.value;
            }
        } catch (e) { /* ignore */ }
        return fallback;
    }

    function _authHeaders(json) {
        const orgId = localStorage.getItem(PD_ORG_ID_KEY) || "";
        const sessionToken = localStorage.getItem(PD_SESSION_TOKEN_KEY) || "";
        return {
            ...(json && { 'Content-Type': 'application/json' }),
            ...(orgId && { "X-Org-Id": orgId }),
            ...(sessionToken && { "X-Session-Token": sessionToken })
        };
    }

    class PipedriveLeadLib {
        // Duplicate handling options shown in CRM settings (Mantis 8917).
        static DUPLICATE_HANDLING = {
            defaultMode: 'fill_empty',
            recordKey: 'crmSettings.dupRecordPerson'
        };

        // Default name of the person field holding the LeadSuccess lead id,
        // used to find a re-exported lead again. The customer creates it in
        // Pipedrive (text field); without it, matching falls back to e-mail.
        static DEFAULT_ID_FIELD = 'LeadSuccess ID';

        // "Filled: Phone | Updated: Name" from the backend's per-field changes.
        static _describeChanges(changes, noteState, isUpdate = true) {
            if (!changes) return '';
            const parts = [];
            if (changes.filled && changes.filled.length) parts.push(`${_t('crmExport.changesFilled', 'Filled')}: ${changes.filled.join(', ')}`);
            if (changes.overwritten && changes.overwritten.length) parts.push(`${_t('crmExport.changesOverwritten', 'Updated')}: ${changes.overwritten.join(', ')}`);
            if (changes.added && changes.added.length) parts.push(`${_t('crmExport.changesAdded', 'Added')}: ${changes.added.join(', ')}`);
            if (changes.multiSelectMerged && changes.multiSelectMerged.length) parts.push(`${_t('crmExport.changesMultiMerged', 'Multi-select merged')}: ${changes.multiSelectMerged.join(', ')}`);
            if (parts.length) return parts.join(' | ');
            // A person that was just created has no "changed" fields to report.
            if (!isUpdate) return noteState === 'added' ? _t('crmExport.noteAdded', 'Note added') : '';
            if (noteState === 'added') return _t('crmExport.changesNone', 'No field changed, note added');
            return _t('crmExport.changesNoneNoNote', 'No field changed');
        }

        static _transferMessage(data, noteState) {
            const nothingChanged = data.changes
                && !(data.changes.filled || []).length
                && !(data.changes.overwritten || []).length
                && !(data.changes.added || []).length
                && !(data.changes.multiSelectMerged || []).length;
            // Organization values left as they were in Pipedrive ("kept ... (fill_empty)").
            const orgKept = (data.orgDecisions || []).filter((d) => d.includes(': kept '));
            if (nothingChanged && noteState === 'exists' && !data.orgWarning && !orgKept.length) {
                return _t('crmExport.noChangesNoteExists', 'No changes, note already present');
            }
            return [data.message || (data.isUpdate ? 'Person updated' : 'Person created'), this._describeChanges(data.changes, noteState, !!data.isUpdate), ...orgKept, data.orgWarning]
                .filter(Boolean).join(' | ');
        }

        static _portalConfig = null;
        // Own cache, not shared with the other CRM libs (same eventId keys).
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

        // Dev port 5004 (SF/HubSpot/Dynamics use 5001/5002/5003).
        static _backendUrl() {
            const hostname = window.location.hostname;
            // Anchored suffix match, not substring - includes('convey.de')
            // would also match an attacker-controlled "convey.de.evil.com".
            const isProductionDomain = (host, domain) => host === domain || host.endsWith('.' + domain);
            const isProductionHost = isProductionDomain(hostname, 'convey.de') ||
                isProductionDomain(hostname, 'azurewebsites.net') ||
                isProductionDomain(hostname, 'azurestaticapps.net');
            const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
            const isProduction = isProductionHost && !isLocalhost;
            return isProduction
                ? "https://pipedrive.leadsuccess.convey.de"
                : "http://localhost:5004";
        }

        static isConnected() {
            return !!localStorage.getItem(PD_SESSION_TOKEN_KEY);
        }

        // Field lists from the backend, in memory for READONLY_CACHE_TTL_MS
        // (fields can change on Pipedrive's side at any time), shared by every
        // buildContactData() call in a batch and by the Field Mapping UI.
        static READONLY_CACHE_TTL_MS = 60_000;
        static _fieldListCache = {}; // path -> { value, fetchedAt }

        static async _getFieldList(path, pick, fallback) {
            const cached = PipedriveLeadLib._fieldListCache[path];
            if (cached && (Date.now() - cached.fetchedAt) < PipedriveLeadLib.READONLY_CACHE_TTL_MS) {
                return cached.value;
            }
            try {
                const resp = await fetch(`${this._backendUrl()}/api/pipedrive/fields/${path}`, { headers: _authHeaders(false) });
                if (!resp.ok) return cached?.value || fallback;
                const value = pick(await resp.json());
                PipedriveLeadLib._fieldListCache[path] = { value, fetchedAt: Date.now() };
                return value;
            } catch {
                return cached?.value || fallback;
            }
        }

        // Names and keys are matched case-insensitively, like the backend.
        static _lowerSet(names) {
            return new Set((names || []).map((n) => String(n).toLowerCase()));
        }

        static getReadOnlyPropertyNames() {
            return PipedriveLeadLib._getFieldList('readonly', (d) => PipedriveLeadLib._lowerSet(d.readOnlyFields), new Set());
        }

        // null when the check itself failed (offline, backend error).
        static getAllPropertyNames() {
            return PipedriveLeadLib._getFieldList('names', (d) => PipedriveLeadLib._lowerSet(d.propertyNames), null);
        }

        static async checkConnection() {
            try {
                const resp = await fetch(`${this._backendUrl()}/api/pipedrive/check`, { headers: _authHeaders(false) });
                if (!resp.ok) return { connected: false };
                const json = await resp.json();
                if (json.connected) {
                    return {
                        connected: true,
                        userInfo: (json.userInfo && (json.userInfo.display_name || json.userInfo.name)) || ""
                    };
                }
                return { connected: false };
            } catch {
                return { connected: false };
            }
        }

        // orgId defaults to 'default' until the first successful OAuth
        // handshake returns the real isolation key (same convention as HubSpot).
        // options.onWaiting / options.onCancelable: UI hooks, see openOAuthPopup.
        static async connect(options = {}) {
            const backendUrl = this._backendUrl();
            const orgId = localStorage.getItem(PD_ORG_ID_KEY) || "default";
            // The backend also keeps the result under this nonce, for when the
            // login pages cut window.opener and the postMessage never arrives.
            const nonce = (window.crypto && typeof window.crypto.randomUUID === "function")
                ? window.crypto.randomUUID()
                : Array.from(window.crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
            const authUrl = `${backendUrl}/auth/pipedrive?orgId=${encodeURIComponent(orgId)}&nonce=${encodeURIComponent(nonce)}`;
            const result = await window.CrmProviders.openOAuthPopup({
                authUrl: authUrl,
                successMessageType: "PIPEDRIVE_AUTH_SUCCESS",
                errorMessageType: "PIPEDRIVE_AUTH_ERROR",
                allowedOrigins: [new URL(backendUrl).origin],
                popupName: "pipedrive-auth",
                // Login, 2FA and the company picker can take a while.
                closedGraceMs: 5 * 60 * 1000,
                pollResult: async () => {
                    const resp = await fetch(`${backendUrl}/api/pipedrive/auth-result?nonce=${encodeURIComponent(nonce)}`);
                    if (!resp.ok) return null;
                    const data = await resp.json();
                    if (data.status === "complete") return data.result;
                    if (data.status === "error") return { error: data.error || "authorization_failed" };
                    return null;
                },
                onWaiting: options.onWaiting,
                onCancelable: options.onCancelable
            });
            if (!result) {
                return { success: false, error: "cancelled" };
            }
            if (result.error) {
                return { success: false, error: result.error };
            }
            if (result.orgId) localStorage.setItem(PD_ORG_ID_KEY, result.orgId);
            if (result.sessionToken) localStorage.setItem(PD_SESSION_TOKEN_KEY, result.sessionToken);
            if (result.userInfo) localStorage.setItem(PD_USER_INFO_KEY, JSON.stringify(result.userInfo));
            return { success: true, userInfo: result.userInfo };
        }

        // Read the isolation key BEFORE clearing localStorage, or the
        // disconnect request can't identify which connection to remove.
        static async disconnect() {
            try {
                await fetch(`${this._backendUrl()}/api/pipedrive/logout`, {
                    method: "POST",
                    credentials: "include",
                    headers: _authHeaders(false)
                });
            } catch { /* ignore */ }
            [PD_ORG_ID_KEY, PD_SESSION_TOKEN_KEY, PD_USER_INFO_KEY].forEach((k) => localStorage.removeItem(k));
            PipedriveLeadLib._fieldListCache = {};
        }

        static clear(rootElement) {
            if (rootElement) {
                rootElement.innerHTML = "";
            }
        }

        // The person field carrying the lead id: the Id row's mapping, else
        // DEFAULT_ID_FIELD. Only used when that field exists in Pipedrive, so
        // a customer who hasn't created it can still transfer (matching then
        // falls back to e-mail) instead of every lead failing on a missing field.
        static detectUpsertKey(fieldMappingService) {
            const mapped = fieldMappingService?.customLabels?.['Id'];
            return (mapped && mapped.trim()) ? mapped.trim() : PipedriveLeadLib.DEFAULT_ID_FIELD;
        }

        static async _resolveUpsertKey(fieldMappingService) {
            const key = this.detectUpsertKey(fieldMappingService);
            const allNames = await PipedriveLeadLib.getAllPropertyNames();
            if (allNames && !allNames.has(key.toLowerCase())) {
                if (!PipedriveLeadLib._warnedMissingIdField) {
                    PipedriveLeadLib._warnedMissingIdField = true;
                    console.warn(`[Pipedrive] Person field "${key}" not found - re-exports are matched by e-mail only.`);
                }
                return null;
            }
            return key;
        }

        // Builds a flat { <pipedrive field label or key>: value } object from
        // an LS_LeadReport row. options.silent skips user-facing toasts (used
        // by the duplicate check, which sends nothing).
        static async buildContactData(itemData, fieldMappingService, options = {}) {
            const silent = options.silent === true;
            const contactData = {};
            const readOnlyFields = await PipedriveLeadLib.getReadOnlyPropertyNames();
            const processedData = fieldMappingService?.applyCustomLabels(itemData) ||
                Object.fromEntries(Object.entries(itemData).map(([key, value]) => [key, {
                    value, label: key, active: true
                }]));

            // Active custom fields (user-defined, fixed value - e.g. "Lead Source").
            if (fieldMappingService) {
                const customFields = typeof fieldMappingService.getAllCustomFields === 'function'
                    ? fieldMappingService.getAllCustomFields()
                    : (fieldMappingService.customFields || []);
                (customFields || []).forEach((field) => {
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

            const droppedReadOnlyFields = [];
            const droppedSystemFields = [];
            Object.keys(processedData).forEach((sourceField) => {
                // A system/LS-internal field (CreatedDate, SystemModstamp, ...) is
                // excluded unless explicitly mapped to a Pipedrive field.
                if (window.SalesforceLeadLib?.BATCH_EXCLUDED_FIELDS?.has(sourceField)) {
                    const explicitTarget = fieldMappingService?.customLabels?.[sourceField];
                    const hasExplicitMapping = explicitTarget && explicitTarget.trim() !== '' && explicitTarget !== sourceField;
                    if (!hasExplicitMapping) {
                        droppedSystemFields.push(sourceField);
                        return;
                    }
                }

                // Id goes out through the upsert key below, and only when the
                // "LeadSuccess ID" field exists - sent here as a plain "Id" it
                // would fail the transfer on a field Pipedrive doesn't have.
                if (sourceField === 'Id') return;

                const fieldInfo = processedData[sourceField];
                const isActive = typeof fieldInfo === 'object' ? (fieldInfo.active !== false) : true;
                if (!isActive) return;

                let value = typeof fieldInfo === 'object' ? fieldInfo.value : fieldInfo;
                if (!value || (typeof value === 'string' && (value.trim() === '' || value === 'N/A'))) return;

                // Explicit mapping first, then the standard defaults
                // (FirstName -> first_name, Company -> org_name, ...), else the
                // source name itself (the backend matches it to a field label).
                const explicitTarget = fieldMappingService?.customLabels?.[sourceField];
                const target = (explicitTarget && explicitTarget.trim())
                    || PD_SOURCE_TO_TARGET[sourceField]
                    || sourceField;

                if (readOnlyFields.has(target.toLowerCase())) {
                    droppedReadOnlyFields.push(target);
                    return;
                }

                // OData's /Date(ms)/ wrapper is never a valid person value.
                if (typeof value === 'string') {
                    const odataDate = window.SalesforceLeadLib?.parseODataDateValue?.(value.trim());
                    value = odataDate ? odataDate.toISOString().split('T')[0] : value.trim();
                }

                if (contactData[target] === undefined) contactData[target] = value;
            });

            // Warn once per field name per page load, not once per lead.
            const warnOnce = (bucket, fields, consoleText, toastText) => {
                if (fields.length === 0 || silent) return;
                PipedriveLeadLib[bucket] = PipedriveLeadLib[bucket] || new Set();
                const newlyWarned = [...new Set(fields)].filter((f) => !PipedriveLeadLib[bucket].has(f));
                if (newlyWarned.length === 0) return;
                newlyWarned.forEach((f) => PipedriveLeadLib[bucket].add(f));
                console.warn(`[Pipedrive] ${consoleText}: ${newlyWarned.join(', ')}`);
                if (typeof window.SalesforceLeadLib?._showToast === 'function') {
                    window.SalesforceLeadLib._showToast(toastText.replace('{0}', newlyWarned.join(', ')), 'warning');
                }
            };
            warnOnce('_warnedReadOnlyFields', droppedReadOnlyFields,
                'Field(s) skipped - read-only in Pipedrive, value not sent',
                'Skipped field(s) that LeadSuccess cannot write in Pipedrive (value not sent): {0}. Map to a different field instead.');
            warnOnce('_warnedSystemFields', droppedSystemFields,
                'Field(s) skipped - LeadSuccess system field, not sent unless mapped to a Pipedrive field',
                'Skipped system field(s) not sent to Pipedrive: {0}. Map to a Pipedrive field first, or unmap it.');

            // Must ride along even if Id isn't "active" in the field config,
            // or a re-export has nothing to match on.
            const upsertKey = await this._resolveUpsertKey(fieldMappingService);
            if (upsertKey && itemData.Id && contactData[upsertKey] === undefined) {
                contactData[upsertKey] = itemData.Id;
            }

            return contactData;
        }

        // Event name for the note header. The event being exported is the one
        // selected in the event list (master); AppData._userData holds the
        // user's own login event, only used when nothing else is selected.
        static _currentEventName() {
            try {
                const master = window.Application && Application.navigator && Application.navigator.masterControl;
                const masterCtrl = master && master.controller;
                const selectedId = masterCtrl && masterCtrl.binding && masterCtrl.binding.eventId;
                if (selectedId && typeof masterCtrl.scopeFromRecordId === 'function') {
                    const scope = masterCtrl.scopeFromRecordId(selectedId);
                    if (scope && scope.item && scope.item.VeranstaltungName) return scope.item.VeranstaltungName;
                }
                const userData = window.AppData && AppData._userData;
                if (!userData || !userData.VeranstaltungName) return '';
                const selected = typeof AppData.getRecordId === 'function' ? AppData.getRecordId('Veranstaltung2') : null;
                if (selected && String(selected) !== String(userData.VeranstaltungID)) return '';
                const recordId = typeof AppData.getRecordId === 'function' ? AppData.getRecordId('Veranstaltung') : null;
                return !recordId || String(recordId) === String(userData.VeranstaltungID) ? userData.VeranstaltungName : '';
            } catch { return ''; }
        }

        // Lead context for the per-lead note (built and escaped by the
        // backend): who captured the lead, when, the questionnaire and the
        // capturer's comment.
        static _buildNoteContext(item) {
            if (!item) return null;
            const questionnaire = [];
            for (let i = 1; i <= 30; i++) {
                const nn = String(i).padStart(2, '0');
                const question = item[`Question${nn}`];
                const answer = item[`Answers${nn}`];
                const text = item[`Text${nn}`];
                if (question && (answer || text)) questionnaire.push({ question, answer: answer || '', text: text || '' });
            }
            return {
                eventName: this._currentEventName(),
                createdDate: item.CreatedDate || null,
                createdById: item.CreatedById || '',
                notes: item.Notes || '',
                questionnaire
            };
        }

        // Return shape matches SalesforceLeadLib.transferSingleLead exactly
        // so executeBatchTransfer's generic result handling needs no
        // provider-specific branching.
        static async transferOne(contactData, attachments, upsertKey, sourceItem, fieldMappingService) {
            const duplicateMode = (fieldMappingService && fieldMappingService.duplicateMode) || this.DUPLICATE_HANDLING.defaultMode;
            // detectUpsertKey's name may not exist in Pipedrive: only send it
            // as the match key when buildContactData actually included it.
            const idProperty = upsertKey && contactData[upsertKey] !== undefined ? upsertKey : undefined;
            try {
                const response = await fetch(`${this._backendUrl()}/api/pipedrive/persons`, {
                    method: 'POST',
                    headers: _authHeaders(true),
                    credentials: 'include',
                    body: JSON.stringify({ contactData, idProperty, duplicateMode })
                });

                if (response.status === 401) {
                    return {
                        success: false,
                        status: 'failed',
                        message: 'Pipedrive session expired. Please reconnect to Pipedrive and try again.',
                        salesforceId: null,
                        sessionExpired: true
                    };
                }

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    return {
                        success: false,
                        status: 'failed',
                        message: data.message || `HTTP ${response.status}`,
                        salesforceId: null,
                        duplicateWarning: null,
                        isUpdate: false
                    };
                }

                // Files and the lead note go on the person. leadId lets the
                // backend skip a lead whose note is already there (re-export).
                let attachmentsTransferred = 0;
                let attachmentsSkipped = false;
                let noteState = 'none';
                const note = this._buildNoteContext(sourceItem);
                const hasFiles = Boolean(attachments && attachments.length > 0);
                if (data.pipedriveId && (hasFiles || note)) {
                    try {
                        const leadId = (sourceItem && sourceItem.Id) || (idProperty ? contactData[idProperty] : null);
                        const attachRes = await fetch(`${this._backendUrl()}/api/pipedrive/persons/${data.pipedriveId}/attachments`, {
                            method: 'POST',
                            headers: _authHeaders(true),
                            credentials: 'include',
                            body: JSON.stringify({ files: attachments || [], leadId, note })
                        });
                        const attachData = await attachRes.json().catch(() => ({}));
                        attachmentsTransferred = attachData.uploaded || 0;
                        attachmentsSkipped = attachData.skipped === 'duplicate_note';
                        noteState = attachmentsSkipped ? 'exists' : (attachData.noteId ? 'added' : 'none');
                    } catch { /* attachment failure doesn't fail the transfer itself */ }
                }

                return {
                    success: true,
                    status: 'success',
                    message: this._transferMessage(data, noteState),
                    salesforceId: data.pipedriveId || null,
                    duplicateWarning: null,
                    isUpdate: data.isUpdate || false,
                    merged: data.merged || false,
                    attachmentsTransferred,
                    attachmentsSkipped
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

        // Returns Map<leadId, {status, pipedriveId?, url?}>: 'synced' (a person
        // carries this lead's id), 'email_conflict' (another person has the
        // e-mail) or 'not_found'.
        static async checkDuplicates(leads, fieldMappingService) {
            const upsertKey = await this._resolveUpsertKey(fieldMappingService);
            const leadsPayload = [];
            for (const item of leads) {
                const contactData = await this.buildContactData(item, fieldMappingService, { silent: true });
                const emailKey = Object.keys(contactData).find((k) => k.toLowerCase() === 'email');
                leadsPayload.push({
                    leadId: item.Id,
                    email: emailKey ? contactData[emailKey] : null,
                    idPropertyValue: item.Id
                });
            }

            const response = await fetch(`${this._backendUrl()}/api/pipedrive/persons/batch-check`, {
                method: 'POST',
                headers: _authHeaders(true),
                credentials: 'include',
                body: JSON.stringify({ idProperty: upsertKey, leads: leadsPayload })
            });

            if (!response.ok) {
                throw new Error(`Duplicate check failed: HTTP ${response.status}`);
            }

            const data = await response.json();
            const byLeadId = new Map();
            (data.results || []).forEach((r) => byLeadId.set(r.leadId, { ...r, hubspotId: r.pipedriveId }));
            return byLeadId;
        }

        // Delegates to SalesforceLeadLib's generalized openFieldMapping,
        // parameterized with Pipedrive's own config.
        static async openFieldMapping(rootElement, eventId, options = {}) {
            if (!this._portalConfig) { throw new Error("PipedriveLeadLib not initialized. Call init() first."); }
            const adapter = window.CrmProviders && CrmProviders.getAdapter("pipedrive");
            return window.SalesforceLeadLib.openFieldMapping(rootElement, eventId, {
                ...options,
                apiEndpointValue: "Pipedrive",
                providerLabel: "Pipedrive",
                defaultMappings: CrmProviders.PD_DEFAULT_MAPPINGS,
                dataCache: PipedriveLeadLib._dataCache,
                crmAdapter: (adapter && adapter.id === "pipedrive") ? adapter : null,
                getReadOnlyTargetFieldNames: () => PipedriveLeadLib.getReadOnlyPropertyNames(),
                duplicateHandling: PipedriveLeadLib.DUPLICATE_HANDLING
            });
        }

        // Generic across providers - reads whatever openFieldMapping stashed
        // on the #fieldmappings-container element.
        static async saveFieldMapping(eventId) {
            return window.SalesforceLeadLib.saveFieldMapping(eventId);
        }

        // Delegates to SalesforceLeadLib's generalized renderContactList, with
        // this file's own transfer and duplicate-check adapters.
        static async renderContactList(rootElement, eventId, options = {}) {
            if (!this._portalConfig) { throw new Error("PipedriveLeadLib not initialized. Call init() first."); }
            const adapter = window.CrmProviders && CrmProviders.getAdapter("pipedrive");
            return window.SalesforceLeadLib.renderContactList(rootElement, eventId, {
                ...options,
                apiEndpointValue: "Pipedrive",
                providerLabel: "Pipedrive",
                defaultMappings: CrmProviders.PD_DEFAULT_MAPPINGS,
                dataCache: PipedriveLeadLib._dataCache,
                crmAdapter: (adapter && adapter.id === "pipedrive") ? adapter : null,
                supportsBatchTransfer: true,
                transferAdapter: {
                    buildContactData: (itemData, fieldMappingService, options) => PipedriveLeadLib.buildContactData(itemData, fieldMappingService, options),
                    detectUpsertKey: (fieldMappingService) => PipedriveLeadLib.detectUpsertKey(fieldMappingService),
                    transferOne: (contactData, attachments, upsertKey, sourceItem, fieldMappingService) => PipedriveLeadLib.transferOne(contactData, attachments, upsertKey, sourceItem, fieldMappingService)
                },
                duplicateCheckAdapter: {
                    checkDuplicates: (leads, fieldMappingService) => PipedriveLeadLib.checkDuplicates(leads, fieldMappingService)
                }
            });
        }
    }

    window.PipedriveLeadLib = PipedriveLeadLib;

    if (window.CrmProviders && typeof window.CrmProviders.registerAdapter === "function") {
        window.CrmProviders.registerAdapter({
            id: "pipedrive",
            label: "Pipedrive",
            apiEndpointValue: "Pipedrive",
            status: "available",
            isConnected: PipedriveLeadLib.isConnected,
            checkConnection: function () { return PipedriveLeadLib.checkConnection(); },
            connect: function (options) { return PipedriveLeadLib.connect(options); },
            disconnect: function () { return PipedriveLeadLib.disconnect(); },
            renderContactList: function (rootElement, eventId, options) {
                return PipedriveLeadLib.renderContactList(rootElement, eventId, options);
            },
            openFieldMapping: function (rootElement, eventId, options) {
                return PipedriveLeadLib.openFieldMapping(rootElement, eventId, options);
            },
            saveFieldMapping: function (eventId) {
                return PipedriveLeadLib.saveFieldMapping(eventId);
            }
        });
    }

    console.log("PipedriveLeadLib loaded and ready");

})();
