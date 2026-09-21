// Shared LS_FieldMappings persistence for CRM provider libs. Every provider
// persists its field mapping config the same way, just scoped to a
// different ApiEndpoint value (e.g. 'LeadSuccess_Event_API' for Salesforce,
// 'HubSpot' for HubSpot).

(function () {
    'use strict';

    // 'ls_lead_id' is the upsert-key row and must always be offered, even on
    // an event with no sample lead yet.
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

    // Dynamics' own standard Lead entity field names (NOT HubSpot's —
    // 'emailaddress1'/'companyname', not 'email'/'company'). No upsert-key
    // field here: Dynamics has no HubSpot-style arbitrary "unique property"
    // concept, so dynamics-backend does its own duplicate check by email
    // instead of a configurable upsert key.
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

            // Defaults to Salesforce's value so any not-yet-migrated call site keeps working unchanged.
            this.apiEndpointValue = config.apiEndpointValue || 'LeadSuccess_Event_API';
            this.defaultMappings = config.defaultMappings || null;

            // Session cache surviving page destroy/re-create on tab switches.
            // Accepts an externally-owned Map (e.g. SalesforceLeadLib._dataCache)
            // so an existing provider's cache entries stay where its own code expects them.
            this.dataCache = config.dataCache || FieldMappingService._dataCache;

            this.portalConfig = config.portalConfig || null;

            this.credentials =
            this.currentEventId = null;
            this._initializationPhase = 'not_started';
            this._dbConfigLoaded = false;


            this.loadCustomFieldNames();
            this.loadCustomFields();
        }

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
                            }
                            // OData (v2 especially) nests the real text under error.message.value
                            // rather than error.message being a plain string - reading it straight
                            // rendered every OData 400/404 as the literal text "[object Object]".
                            const odataMessage = errorData.error?.message;
                            const messageText = typeof odataMessage === 'string'
                                ? odataMessage
                                : (odataMessage?.value || errorData.message || response.statusText);
                            throw new Error(`HTTP ${response.status}: ${messageText}`);
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

        _applyConfigData(configDataStr) {
            if (!configDataStr) return;
            // A background revalidation can fire while the label-edit dialog
            // is open and mutating this.fieldConfig in place; reassigning it
            // here would orphan that in-place edit so its save persists the
            // pre-edit config instead. _editInFlight blocks that window.
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
                    // LS_FieldMappings is shared with LSPortalNext, which writes
                    // customFields in a different shape ({lsField, crmField, transform}).
                    // Foreign-shaped entries are kept aside (_foreignCustomFields) so
                    // saveFieldMappingsToAPI round-trips them unchanged instead of
                    // wiping the other portal's config.
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

            // Config is re-requested on every tab switch (fresh controller +
            // service each navigation); serve the cache instead.
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

                // Cache "no record yet" too (null) to avoid a re-fetch per tab switch.
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
                    // Round-trip foreign-shaped entries untouched so we don't wipe the other portal's config.
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
                    // Keep the cache in sync so the next tab entry reflects the save without a re-fetch.
                    this.dataCache.set(`fieldmap:${this.currentEventId}:${this.apiEndpointValue}`, {
                        configDataStr: JSON.stringify(configData)
                    });
                    // renderContactList() recomputes its columns from this field config on every
                    // entry, but only re-fetches LS_LeadReport when 'contacts:*' is a cache miss —
                    // otherwise it renders the same cached rows straight away. Without also
                    // dropping 'contacts:*' here, a toggle/label edit made in crmSettings is
                    // invisible in crmExport until the user hits Refresh, because crmExport never
                    // knows this save happened.
                    this.dataCache.delete(`contacts:${this.currentEventId}:${this.apiEndpointValue}`);
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
                    throw new Error(`Failed to recreate record: ${createResult.error || 'unknown error'}`);
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
                    // Blocks a concurrent _applyConfigData reassignment of this.fieldConfig
                    // between the mutation above and saveFieldMappingsToAPI reading it below.
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

    // Fallback session data cache used only when no `dataCache` is passed in via constructor config.
    FieldMappingService._dataCache = new Map();

    window.CrmProviders = window.CrmProviders || {};
    window.CrmProviders.FieldMappingService = FieldMappingService;
    window.CrmProviders.HS_DEFAULT_MAPPINGS = HS_DEFAULT_MAPPINGS;
    window.CrmProviders.DYN_DEFAULT_MAPPINGS = DYN_DEFAULT_MAPPINGS;

})();
