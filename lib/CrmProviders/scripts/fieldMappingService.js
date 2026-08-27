// fieldMappingService.js - shared LS_FieldMappings persistence for CRM provider libs
//
// Extracted from SalesforceLeadLib's FieldMappingService class
// (lib/SalesforceLeadLib/scripts/salesforceLeadLib.js). Reading/writing the
// portal's own LS_FieldMappings OData entity, the session cache, and the
// cross-portal _foreignCustomFields preservation logic have nothing to do
// with which CRM provider is active — every provider persists its field
// mapping config the same way, just scoped to a different ApiEndpoint value
// (e.g. 'LeadSuccess_Event_API' for Salesforce, 'HubSpot' for HubSpot) — so
// this is shared rather than reimplemented per provider.

(function () {
    'use strict';

    // HubSpot's default field-mapping list, mirroring the shape of
    // STANDARD_SALESFORCE_LEAD_FIELDS in salesforceLeadLib.js
    // ({ '<crmField>': { label, required } }). 'ls_lead_id' is the critical
    // upsert-key row (mirrors Salesforce's 'Id' -> LS_LeadId__c row) — it
    // must always be offered so it can be mapped for upsert, even on an
    // event with no sample lead yet. Field names/shape match LSPortalNext's
    // HS_DEFAULT_MAPPINGS (src/services/crm/registry.ts in that repo).
    const HS_DEFAULT_MAPPINGS = {
        'ls_lead_id': { label: 'ID (→ ls_lead_id)', required: false },
        'firstname': { label: 'First Name', required: false },
        'lastname': { label: 'Last Name', required: true },
        'company': { label: 'Company', required: true },
        'email': { label: 'Email', required: false },
        'phone': { label: 'Phone', required: false },
        'mobilephone': { label: 'Mobile Phone', required: false },
        'jobtitle': { label: 'Title', required: false },
        'website': { label: 'Website', required: false },
        'address': { label: 'Street', required: false },
        'city': { label: 'City', required: false },
        'zip': { label: 'Postal Code', required: false },
        'country': { label: 'Country', required: false }
    };

    // MS Dynamics 365's default field-mapping list, same shape as
    // HS_DEFAULT_MAPPINGS above but with Dynamics' own standard Lead entity
    // field names (NOT HubSpot's — the two were previously conflated by
    // DynamicsLeadLib borrowing HS_DEFAULT_MAPPINGS, which pointed the Field
    // Configurator at HubSpot property names like 'email'/'company' instead
    // of Dynamics' real 'emailaddress1'/'companyname'). 'ls_lead_id_prop' is
    // deliberately not a native Dynamics Lead field — a client normally maps
    // the upsert key onto a custom field they've created on Lead (Dynamics
    // has no HubSpot-style arbitrary "unique property" concept out of the
    // box); dynamics-backend's /api/dynamics/leads currently does its own
    // duplicate check by email rather than a configurable upsert key.
    const DYN_DEFAULT_MAPPINGS = {
        'firstname': { label: 'First Name', required: false },
        'lastname': { label: 'Last Name', required: true },
        'companyname': { label: 'Company', required: true },
        'emailaddress1': { label: 'Email', required: false },
        'telephone1': { label: 'Phone', required: false },
        'mobilephone': { label: 'Mobile Phone', required: false },
        'jobtitle': { label: 'Title', required: false },
        'websiteurl': { label: 'Website', required: false },
        'address1_line1': { label: 'Street', required: false },
        'address1_city': { label: 'City', required: false },
        'address1_postalcode': { label: 'Postal Code', required: false },
        'address1_country': { label: 'Country', required: false }
    };

    class FieldMappingService {
        constructor(config = {}) {
            this.fieldConfig = this.loadConfig();
            this.customLabels = {};
            this.customFieldNames = {};
            this.customFields = [];

            // Which CRM provider's LS_FieldMappings rows this instance reads/
            // writes (filtered/written via ApiEndpoint). Defaults to
            // Salesforce's value so any not-yet-migrated call site keeps
            // working unchanged.
            this.apiEndpointValue = config.apiEndpointValue || 'LeadSuccess_Event_API';
            // Default field-mapping list for this provider (not consumed
            // internally by this class today — the rendering/grid code that
            // consumes it lives in each provider's own lib file — but kept on
            // the instance so callers can read it without hardcoding a
            // provider-specific constant name).
            this.defaultMappings = config.defaultMappings || null;

            // Session cache: survives page destroy/re-create on tab switches.
            // Accepts an externally-owned Map (e.g. SalesforceLeadLib._dataCache,
            // so Salesforce's cache entries stay exactly where existing code
            // outside this class already expects them), defaulting to this
            // service's own static cache when none is supplied.
            this.dataCache = config.dataCache || FieldMappingService._dataCache;

            // Portal OData credentials/base URL — this class is shared by every
            // CRM provider lib, so it must not hardcode a dependency on any one
            // provider's static config (e.g. SalesforceLeadLib._portalConfig).
            // Each provider lib passes its own via the constructor.
            this.portalConfig = config.portalConfig || null;

            this.credentials =
            this.currentEventId = null;
            this._initializationPhase = 'not_started';
            this._dbConfigLoaded = false;


            this.loadCustomFieldNames();
            this.loadCustomFields();
        }

        /** Fields are inactive by default - must be explicitly activated in CRM Settings. */
        shouldFieldBeActiveByDefault(fieldName) {
            return false;
        }

        createApiService() {
            return {
                request: async (method, endpoint, data = null) => {
                    const errorElement = document.getElementById("errorMessage");
                    if (errorElement) errorElement.style.display = "none";

                    try {
                        const credentials = this.credentials ||
                            (this.portalConfig?.user && this.portalConfig?.password
                                ? btoa(`${this.portalConfig.user}:${this.portalConfig.password}`)
                                : null);

                        if (!credentials) {
                            throw new Error("No credentials found");
                        }

                        const headers = new Headers({
                            Accept: "application/json",
                            Authorization: `Basic ${credentials}`,
                            'X-Requested-With': 'XMLHttpRequest'
                        });

                        if (method !== "GET") {
                            headers.append("Content-Type", "application/json");
                        }

                        const config = {
                            method,
                            headers,
                            credentials: "same-origin",
                        };

                        if (data) {
                            config.body = JSON.stringify(data);
                        }

                        const url = `${this.portalConfig.baseUrl}/${endpoint}`;

                        const response = await fetch(url, config);

                        if (!response.ok) {
                            let errorData = {};
                            try {
                                const errorText = await response.text();
                                if (errorText.trim()) {
                                    errorData = JSON.parse(errorText);
                                }
                            } catch (parseError) {
                                // Could not parse error response
                            }
                            throw new Error(`HTTP ${response.status}: ${errorData.error?.message || errorData.message || response.statusText}`);
                        }

                        const text = await response.text();

                        if (!text.trim()) {
                            return { success: true };
                        }

                        return JSON.parse(text);
                    } catch (error) {
                        throw error;
                    }
                }
            };
        }

        async initializeFields(leadData, eventId) {
            try {
                this.currentEventId = eventId;
                this._initializationPhase = 'loading_db';

                if (eventId) {
                    await this.loadFieldMappingsFromAPI(eventId);
                    this._dbConfigLoaded = true;
                }

                this._initializationPhase = 'applying_defaults';
                const hasDbConfig = this.fieldConfig?.config?.fields?.length > 0;

                if (leadData) {
                    Object.keys(leadData).forEach(fieldName => {
                        const existingConfig = this.getFieldConfig(fieldName);

                        if (existingConfig && existingConfig.active !== undefined) {
                            // Already configured in DB
                        } else {
                            const shouldBeActive = !hasDbConfig && this.shouldFieldBeActiveByDefault(fieldName);
                            this.setFieldConfigLocal(fieldName, { active: shouldBeActive });
                        }
                    });
                }

                this._initializationPhase = 'complete';
                return true;

            } catch (error) {
                console.error('Field mapping initialization failed, falling back to local-only mode:', error);
                this._initializationPhase = 'applying_defaults';

                const hasDbConfig = this.fieldConfig?.config?.fields?.length > 0;
                if (leadData) {
                    Object.keys(leadData).forEach(fieldName => {
                        const existingConfig = this.getFieldConfig(fieldName);
                        if (!existingConfig || existingConfig.active === undefined) {
                            const shouldBeActive = !hasDbConfig && this.shouldFieldBeActiveByDefault(fieldName);
                            this.setFieldConfigLocal(fieldName, { active: shouldBeActive });
                        }
                    });
                }

                this._initializationPhase = 'complete';
                return true;
            }
        }

        setFieldConfigLocal(fieldName, config) {
            if (!this.fieldConfig.config) {
                this.fieldConfig.config = { fields: [] };
            }

            const existingIndex = this.fieldConfig.config.fields.findIndex(
                field => field.fieldName === fieldName
            );

            const fieldConfig = {
                fieldName: fieldName,
                active: config.active !== undefined ? config.active : false,
                customLabel: this.customLabels[fieldName] || this.formatFieldLabel(fieldName),
                updatedAt: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                this.fieldConfig.config.fields[existingIndex] = {
                    ...this.fieldConfig.config.fields[existingIndex],
                    ...fieldConfig
                };
            } else {
                this.fieldConfig.config.fields.push(fieldConfig);
            }

            this.saveConfig();
        }

        /** @private Apply a raw ConfigData JSON string onto this service instance */
        _applyConfigData(configDataStr) {
            if (!configDataStr) return;
            // A background revalidation (e.g. openFieldMapping's stale-while-
            // revalidate re-render, fired at page mount) can still be in flight
            // while the user has the label-edit dialog open. That path calls
            // getFieldConfig(fieldName) and mutates the returned object IN
            // PLACE — if this method then reassigns this.fieldConfig to a
            // fresh object from the network/cache, the in-place edit becomes
            // orphaned on the old (now-unreferenced) object, and the edit's
            // own save call persists the pre-edit config instead. Confirmed
            // live: editing Company's label sent no customLabel to the server.
            // _editInFlight (set by _openEditFieldLabelModal for the duration
            // of the dialog + its own save) blocks the reassignment here so a
            // concurrent revalidation can't clobber an edit that's in progress.
            if (this._editInFlight) return;
            try {
                const parsedConfig = JSON.parse(configDataStr);

                if (parsedConfig.fieldConfig) {
                    this.fieldConfig = parsedConfig.fieldConfig;
                }

                if (parsedConfig.customLabels) {
                    this.customLabels = parsedConfig.customLabels;
                }

                if (this.fieldConfig?.config?.fields) {
                    for (const field of this.fieldConfig.config.fields) {
                        if (field.customLabel && field.customLabel !== field.fieldName) {
                            if (!this.customLabels[field.fieldName]) {
                                this.customLabels[field.fieldName] = field.customLabel;
                            }
                        }
                    }
                }

                if (parsedConfig.customFields && Array.isArray(parsedConfig.customFields)) {
                    // The LS_FieldMappings table is shared with LSPortalNext, which
                    // writes customFields in a different shape ({lsField, crmField,
                    // transform}). Only adopt entries that carry a WinJS custom-field
                    // name; otherwise the grid renders them as "Unnamed" and editing
                    // fails. Foreign-shaped entries are kept aside (_foreignCustomFields)
                    // so saveFieldMappingsToAPI can round-trip them back unchanged
                    // instead of wiping the other portal's config.
                    const isWinJsShape = (cf) => cf && (cf.sfFieldName || cf.fieldName || cf.name);
                    this.customFields = parsedConfig.customFields.filter(isWinJsShape);
                    this._foreignCustomFields = parsedConfig.customFields.filter(cf => !isWinJsShape(cf));
                }
            } catch (parseError) {
                console.error('Failed to parse ConfigData:', parseError);
            }
        }

        async loadFieldMappingsFromAPI(eventId) {
            if (!eventId) {
                return;
            }

            const hasCredentials = this.credentials ||
                (this.portalConfig?.user && this.portalConfig?.password);
            if (!hasCredentials) return;

            // Session cache: the config is re-requested on every tab switch
            // (fresh controller + service each navigation). Serve the cached
            // raw JSON string instead; every save refreshes the cache entry.
            const cacheKey = `fieldmap:${eventId}:${this.apiEndpointValue}`;
            const cached = this.dataCache.get(cacheKey);
            if (cached) {
                this._applyConfigData(cached.configDataStr);
                return;
            }

            try {
                const endpoint = `LS_FieldMappings?$filter=EventId eq '${eventId}' and ApiEndpoint eq '${this.apiEndpointValue}'&$format=json`;
                const data = await this.createApiService().request('GET', endpoint);

                if (!data) {
                    return;
                }

                let configDataStr = null;
                if (data.d && data.d.results && data.d.results.length > 0) {
                    configDataStr = data.d.results[0].ConfigData || null;
                }

                // Cache "no record yet" too (null) — avoids a re-fetch per tab
                // switch on events without a saved config.
                this.dataCache.set(cacheKey, { configDataStr });
                this._applyConfigData(configDataStr);

            } catch (error) {
                console.error('Failed to load field mappings from DB:', error);
                return false;
            }
        }

        async saveFieldMappingsToAPI(fieldName, operation = 'update') {
            const hasCredentials = this.credentials ||
                (this.portalConfig?.user && this.portalConfig?.password);
            if (!this.currentEventId || !hasCredentials) return false;

            try {
                if (fieldName !== 'bulk_save') {
                    this.showSaveIndicator(fieldName, 'saving');
                }

                const configData = {
                    fieldConfig: this.fieldConfig,
                    customLabels: this.customLabels,
                    // Round-trip any foreign-shaped entries (e.g. LSPortalNext mappings)
                    // untouched alongside our own, so we don't wipe the other portal's config.
                    customFields: [...(this.customFields || []), ...(this._foreignCustomFields || [])],
                    lastModified: new Date().toISOString(),
                    modifiedField: fieldName,
                    operation: operation,
                    version: "1.0"
                };

                const existingRecord = await this.findExistingRecord();

                let saveResponse;

                if (existingRecord) {
                    saveResponse = await this.updateRecord(existingRecord.FieldMappingsViewId, configData);
                } else {
                    saveResponse = await this.createRecord(configData);
                }

                if (saveResponse.success) {
                    // Keep the session cache in sync with what was just persisted,
                    // so the next tab entry reflects the save without a re-fetch.
                    this.dataCache.set(`fieldmap:${this.currentEventId}:${this.apiEndpointValue}`, {
                        configDataStr: JSON.stringify(configData)
                    });
                    if (fieldName !== 'bulk_save') {
                        this.showSaveIndicator(fieldName, 'success');
                    }
                    return true;
                } else {
                    throw new Error(saveResponse.error || 'Database save operation failed');
                }

            } catch (error) {
                console.error('Failed to save field mappings to DB:', error);
                if (fieldName !== 'bulk_save') {
                    this.showSaveIndicator(fieldName, 'error');
                }
                return false;
            }
        }

        async findExistingRecord() {
            try {
                const endpoint = `LS_FieldMappings?$filter=EventId eq '${this.currentEventId}' and ApiEndpoint eq '${this.apiEndpointValue}'&$format=json`;
                const data = await this.createApiService().request('GET', endpoint);

                if (data.d && data.d.results && data.d.results.length > 0) {
                    return data.d.results[0];
                }
                return null;

            } catch (error) {
                throw error;
            }
        }

        async createRecord(configData) {
            try {
                const payload = {
                    ApiEndpoint: this.apiEndpointValue,
                    EventId: this.currentEventId,
                    ConfigData: JSON.stringify(configData)
                };

                const result = await this.createApiService().request('POST', 'LS_FieldMappings', payload);

                if (result) {
                    return { success: true, data: result };
                } else {
                    return { success: false, error: 'POST request failed' };
                }

            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        async updateRecord(recordId, configData) {
            try {
                const currentData = await this.findExistingRecord();
                if (!currentData) {
                    throw new Error('Cannot find record to update');
                }

                try {
                    await this.createApiService().request('DELETE', `LS_FieldMappings(${recordId})`);
                } catch (deleteError) {
                }

                const createResult = await this.createRecord(configData);
                if (createResult.success) {
                    return { success: true };
                } else {
                    throw new Error('Failed to recreate record');
                }

            } catch (error) {
                try {
                    const payload = { ConfigData: JSON.stringify(configData) };
                    const result = await this.createApiService().request('PUT', `LS_FieldMappings(${recordId})`, payload);

                    if (result) {
                        return { success: true };
                    }
                } catch (putError) {
                }

                return { success: false, error: error.message };
            }
        }

        showSaveIndicator(fieldName, status) {
            const fieldElement = document.querySelector(`[data-field-name="${fieldName}"]`);
            if (!fieldElement) return;

            const existingIndicator = fieldElement.querySelector('.sf-lib-save-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }

            const indicator = document.createElement('div');
            indicator.className = `sf-lib-save-indicator save-${status}`;

            const icons = {
                saving: '<svg class="spinner" width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
                success: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
                error: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
            };

            indicator.innerHTML = icons[status];

            const fieldHeader = fieldElement.querySelector('.field-header');
            if (fieldHeader) {
                fieldHeader.appendChild(indicator);
            }

            if (status !== 'saving') {
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 2000);
            }
        }

        async setCustomLabel(fieldName, label) {
            this.customLabels[fieldName] = label;

            const fieldConfig = this.getFieldConfig(fieldName) || {};
            fieldConfig.customLabel = label;
            this.setFieldConfig(fieldName, fieldConfig);

            await this.k(fieldName, 'label');

            this.saveCustomLabels();
        }

        getCurrentEventId() {
            if (!this.currentEventId) {
                const sessionEventId = sessionStorage.getItem('selectedEventId');
                if (sessionEventId) {
                    this.currentEventId = sessionEventId;
                }
            }
            return this.currentEventId;
        }

        setCurrentEventId(eventId) {
            this.currentEventId = eventId;
        }

        loadConfig() {
            return {
                apiEndpoint: "LeadSuccess_Event_API",
                eventId: null,
                config: { fields: [] }
            };
        }

        loadCustomLabels() {
            return {};
        }

        saveConfig() { }

        saveCustomLabels() { }

        getFieldConfig(fieldName) {
            if (!this.fieldConfig.config || !this.fieldConfig.config.fields) {
                return null;
            }
            return this.fieldConfig.config.fields.find(field => field.fieldName === fieldName);
        }

        async setFieldConfig(fieldName, config) {
            if (!this.fieldConfig.config) {
                this.fieldConfig.config = { fields: [] };
            }

            const existingIndex = this.fieldConfig.config.fields.findIndex(
                field => field.fieldName === fieldName
            );

            const fieldConfig = {
                fieldName: fieldName,
                active: config.active !== undefined ? config.active : false,
                customLabel: this.customLabels[fieldName] || this.formatFieldLabel(fieldName),
                updatedAt: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                this.fieldConfig.config.fields[existingIndex] = {
                    ...this.fieldConfig.config.fields[existingIndex],
                    ...fieldConfig
                };
            } else {
                this.fieldConfig.config.fields.push(fieldConfig);
            }

            if (!this._isLoadingFromBackend) {
                if (this.currentEventId) {
                    // Same guard as _openEditFieldLabelModal (salesforceLeadLib.js):
                    // blocks a concurrent background revalidation's _applyConfigData
                    // from reassigning this.fieldConfig between this method's
                    // synchronous mutation above and saveFieldMappingsToAPI reading
                    // it below, which would silently drop this toggle's change.
                    this._editInFlight = true;
                    try {
                        await this.saveFieldMappingsToAPI(fieldName, 'toggle');
                    } catch (error) {
                        console.error(`Error saving field config for ${fieldName}:`, error);
                    } finally {
                        this._editInFlight = false;
                    }
                }
            }

            this.saveConfig();

            this.syncWithBackend().catch(() => {});
        }

        formatFieldLabel(fieldName) {
            return fieldName;
        }

        applyCustomLabels(leadData) {
            const result = {};

            for (const [key, value] of Object.entries(leadData)) {
                const fieldConfig = this.getFieldConfig(key);
                const customLabel = this.customLabels[key];
                const finalLabel = customLabel || this.formatFieldLabel(key);

                result[key] = {
                    value: value,
                    label: finalLabel,
                    active: fieldConfig ? fieldConfig.active === true : false
                };
            }

            return result;
        }

        isFieldActive(fieldName) {
            const config = this.getFieldConfig(fieldName);
            return config ? config.active === true : false;
        }


        loadCustomFieldNames() {
            try {
                const saved = localStorage.getItem('fieldMappingCustomNames');
                if (saved) {
                    this.customFieldNames = JSON.parse(saved);
                }
            } catch (error) {
                this.customFieldNames = {};
            }
        }

        async syncWithBackend() {
            if (this._isLoadingFromBackend) {
                return;
            }

            if (this._isTransferInProgress) return;

            if (this.syncTimeout) {
                clearTimeout(this.syncTimeout);
            }

            this.syncTimeout = setTimeout(() => {
                try {
                    this.saveConfig();
                } catch (error) {
                    console.error('Failed to save locally:', error);
                }
            }, 1000);
        }

        setTransferMode(isActive) {
            this._isTransferInProgress = isActive;
        }

        loadCustomFields() {
            if (!this.customFields) {
                this.customFields = [];
            }
        }

        saveCustomFields() { }

        async addCustomField(fieldData) {
            const newField = {
                id: `custom_${Date.now()}`,
                label: fieldData.label || '',
                sfFieldName: fieldData.sfFieldName || '',
                value: fieldData.value || '',
                active: fieldData.active === true,
                isCustom: true,
                createdAt: new Date().toISOString(),
                createdBy: 'user'
            };

            this.customFields.push(newField);
            this.saveCustomFields();

            if (this.currentEventId) {
                await this.saveFieldMappingsToAPI('custom_field_add', 'custom_field');
            }

            return newField;
        }

    }

    // @private Fallback session data cache used only when no `dataCache` is
    // passed in via constructor config. Salesforce continues to pass in
    // SalesforceLeadLib._dataCache explicitly (see salesforceLeadLib.js) so
    // its cache entries stay exactly where the rest of that file already
    // expects them; a provider with no equivalent static cache of its own
    // (e.g. a first-cut HubSpot integration) gets a working cache for free.
    FieldMappingService._dataCache = new Map();

    window.CrmProviders = window.CrmProviders || {};
    window.CrmProviders.FieldMappingService = FieldMappingService;
    window.CrmProviders.HS_DEFAULT_MAPPINGS = HS_DEFAULT_MAPPINGS;
    window.CrmProviders.DYN_DEFAULT_MAPPINGS = DYN_DEFAULT_MAPPINGS;

})();
