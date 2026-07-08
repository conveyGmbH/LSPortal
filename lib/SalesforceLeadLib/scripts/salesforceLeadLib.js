// SALESFORCE LEAD LIBRARY

(function() {
    'use strict';

    const STANDARD_SALESFORCE_LEAD_FIELDS = {
        // The LS lead GUID — must always be offered so it can be mapped to the
        // Salesforce External ID (LS_LeadId__c) for upsert, even on an event with no
        // sample lead yet. Without this mapping every transfer creates duplicates.
        'Id': { label: 'ID (→ LS_LeadId__c)', required: false },
        'Salutation': { label: 'Salutation', required: false },
        'FirstName': { label: 'First Name', required: false },
        'LastName': { label: 'Last Name', required: true },
        'Company': { label: 'Company', required: true },
        'Email': { label: 'Email', required: false },
        'Phone': { label: 'Phone', required: false },
        'MobilePhone': { label: 'Mobile Phone', required: false },
        'Fax': { label: 'Fax', required: false },
        'Title': { label: 'Title', required: false },
        'Website': { label: 'Website', required: false },
        'Street': { label: 'Street', required: false },
        'City': { label: 'City', required: false },
        'State': { label: 'State', required: false },
        'PostalCode': { label: 'Postal Code', required: false },
        'Country': { label: 'Country', required: false },
        'Description': { label: 'Description', required: false }
    };

    // The tenant accent (--ColorAccent) is set at runtime by the portal theme
    // engine and can be any CSS color format. CSS alone cannot derive alpha
    // tints from it without color-mix() (unavailable in older WebViews), so we
    // resolve it to "r, g, b" here and expose it as --sf-accent-rgb for the
    // rgba(var(--sf-accent-rgb), .x) tints in salesforceLeadLib.css.
    function syncAccentRgbToken() {
        try {
            const accent = getComputedStyle(document.documentElement)
                .getPropertyValue('--ColorAccent').trim();
            if (!accent || !document.body) return;
            const probe = document.createElement('div');
            probe.style.cssText = 'display:none;color:' + accent;
            document.body.appendChild(probe);
            const rgb = getComputedStyle(probe).color.match(/\d+/g);
            probe.remove();
            if (rgb && rgb.length >= 3) {
                document.documentElement.style.setProperty('--sf-accent-rgb', rgb.slice(0, 3).join(', '));
            }
        } catch (e) { /* keep the CSS fallback value */ }
    }

    function injectCSS() {
        // Refresh on every call: entry points re-invoke injectCSS() so a
        // runtime accent change is always picked up.
        syncAccentRgbToken();

        const cssContent = `
            /* Scrollbar styling - with dark mode */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            .cnv-ui-dark ::-webkit-scrollbar-track {
                background: #374151;
            }
            ::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }

        `;

        const styleElement = document.createElement('style');
        styleElement.id = 'salesforce-lead-lib-styles';
        styleElement.textContent = cssContent;

        if (!document.getElementById('salesforce-lead-lib-styles')) {
            document.head.appendChild(styleElement);
        }
    }

    function toWinJSPromise(promise) {
        if (typeof WinJS !== 'undefined' && WinJS.Promise) {
            return new WinJS.Promise(function (complete, error) {
                promise.then(complete).catch(error);
            });
        }
        return promise;
    }

    class ConnectionPersistenceManager {
        static CONNECTION_KEY = 'sf_connection_status';
        static USER_INFO_KEY = 'sf_user_info';
        static CONNECTED_AT_KEY = 'sf_connected_at';
        static CONNECTION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

        static saveConnection(userInfo) {
            try {
                const orgId = localStorage.getItem('orgId') || 'default';
                const connectionData = {
                    status: 'connected',
                    userInfo: userInfo,
                    orgId: orgId,
                    connectedAt: Date.now(),
                    expiresAt: Date.now() + this.CONNECTION_TIMEOUT
                };

                localStorage.setItem(this.CONNECTION_KEY, 'connected');
                localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(connectionData));
                localStorage.setItem(this.CONNECTED_AT_KEY, Date.now().toString());

                this.syncPendingModifications();

                return true;
            } catch (error) {
                return false;
            }
        }

        static syncPendingModifications() {
            try {
                const eventId = sessionStorage.getItem('selectedEventId');
                if (!eventId) return;

                const storageKey = `lead_edits_${eventId}`;
                const pendingEdits = localStorage.getItem(storageKey);

                if (pendingEdits) {
                    const editData = JSON.parse(pendingEdits);
                    const changesCount = Object.keys(editData.changes || {}).length;

                    if (changesCount > 0) {
                    }
                }
            } catch (error) {
                // ignored
            }
        }

        static loadConnection() {
            try {
                const status = localStorage.getItem(this.CONNECTION_KEY);
                const userInfoStr = localStorage.getItem(this.USER_INFO_KEY);
                const connectedAt = localStorage.getItem(this.CONNECTED_AT_KEY);

                if (status !== 'connected' || !userInfoStr || !connectedAt) {
                    return null;
                }

                const connectionData = JSON.parse(userInfoStr);
                const connectionAge = Date.now() - parseInt(connectedAt);

                if (connectionAge > this.CONNECTION_TIMEOUT) {
                    this.clearConnection();
                    return null;
                }

                return connectionData;
            } catch (error) {
                this.clearConnection();
                return null;
            }
        }

        static clearConnection() {
            try {
                const orgId = localStorage.getItem('orgId') || 'default';
                localStorage.removeItem(this.CONNECTION_KEY);
                localStorage.removeItem(this.USER_INFO_KEY);
                localStorage.removeItem(this.CONNECTED_AT_KEY);
                return true;
            } catch (error) {
                return false;
            }
        }

        static isConnected() {
            const connection = this.loadConnection();
            return connection !== null;
        }

        static getUserInfo() {
            const connection = this.loadConnection();
            return connection ? connection.userInfo : null;
        }
    }

    class LeadEditsManager {
        constructor(options = {}) {
            this.MAX_LEADS = options.maxLeads || 30;
            this.STORAGE_PREFIX = 'lead_edits_';
            this.AUTO_CLEANUP_ON_SAVE = options.autoCleanup !== false;
        }

        saveEdits(eventId, edits) {
            if (!eventId) return false;

            const key = `${this.STORAGE_PREFIX}${eventId}`;

            try {
                const existing = this.getMetadata(eventId);

                const data = {
                    data: edits,
                    lastAccessed: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    editCount: Object.keys(edits).length,
                    createdAt: existing?.createdAt || new Date().toISOString()
                };

                localStorage.setItem(key, JSON.stringify(data));

                if (this.AUTO_CLEANUP_ON_SAVE) {
                    this.cleanup();
                }

                return true;
            } catch (error) {
                console.error(`Failed to save edits for ${eventId}:`, error);

                if (error.name === 'QuotaExceededError') {
                    this.cleanup(true);

                    try {
                        localStorage.setItem(key, JSON.stringify(data));
                        return true;
                    } catch (retryError) {
                        return false;
                    }
                }

                return false;
            }
        }

        saveFieldEdit(eventId, fieldName, value) {
            if (!eventId || !fieldName) return false;

            let edits = this.loadEdits(eventId) || {};
            edits[fieldName] = value;
            return this.saveEdits(eventId, edits);
        }

        loadEdits(eventId) {
            if (!eventId) return null;

            const key = `${this.STORAGE_PREFIX}${eventId}`;
            const stored = localStorage.getItem(key);

            if (!stored) {
                return null;
            }

            try {
                const parsed = JSON.parse(stored);
                parsed.lastAccessed = new Date().toISOString();
                localStorage.setItem(key, JSON.stringify(parsed));

                return parsed.data;
            } catch (error) {
                return null;
            }
        }

        getMetadata(eventId) {
            if (!eventId) return null;

            const key = `${this.STORAGE_PREFIX}${eventId}`;
            const stored = localStorage.getItem(key);

            if (!stored) return null;

            try {
                return JSON.parse(stored);
            } catch (error) {
                return null;
            }
        }

        cleanup(aggressive = false) {
            const allLeads = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.STORAGE_PREFIX)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        allLeads.push({
                            key: key,
                            eventId: key.replace(this.STORAGE_PREFIX, ''),
                            lastAccessed: new Date(data.lastAccessed),
                            editCount: data.editCount || 0,
                            size: localStorage.getItem(key).length
                        });
                    } catch (error) {
                        localStorage.removeItem(key);
                    }
                }
            }

            allLeads.sort((a, b) => a.lastAccessed - b.lastAccessed);

            const maxLeads = aggressive ? Math.floor(this.MAX_LEADS * 0.7) : this.MAX_LEADS;
            const toRemove = allLeads.length - maxLeads;

            if (toRemove > 0) {
                for (let i = 0; i < toRemove; i++) {
                    localStorage.removeItem(allLeads[i].key);
                }

                return toRemove;
            } else {
                return 0;
            }
        }

    }

    class FieldMappingService {
        constructor(config = {}) {
            this.fieldConfig = this.loadConfig();
            this.customLabels = {};
            this.customFieldNames = {};
            this.customFields = [];

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
                            (SalesforceLeadLib._portalConfig?.user && SalesforceLeadLib._portalConfig?.password
                                ? btoa(`${SalesforceLeadLib._portalConfig.user}:${SalesforceLeadLib._portalConfig.password}`)
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

                        const url = `${SalesforceLeadLib._portalConfig.baseUrl}/${endpoint}`;

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
                    this.customFields = parsedConfig.customFields;
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
                (SalesforceLeadLib._portalConfig?.user && SalesforceLeadLib._portalConfig?.password);
            if (!hasCredentials) return;

            // Session cache: the config is re-requested on every tab switch
            // (fresh controller + service each navigation). Serve the cached
            // raw JSON string instead; every save refreshes the cache entry.
            const cacheKey = `fieldmap:${eventId}`;
            const cached = SalesforceLeadLib._dataCache.get(cacheKey);
            if (cached) {
                this._applyConfigData(cached.configDataStr);
                return;
            }

            try {
                const endpoint = `LS_FieldMappings?$filter=EventId eq '${eventId}'&$format=json`;
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
                SalesforceLeadLib._dataCache.set(cacheKey, { configDataStr });
                this._applyConfigData(configDataStr);

            } catch (error) {
                console.error('Failed to load field mappings from DB:', error);
                return false;
            }
        }

        async saveFieldMappingsToAPI(fieldName, operation = 'update') {
            const hasCredentials = this.credentials ||
                (SalesforceLeadLib._portalConfig?.user && SalesforceLeadLib._portalConfig?.password);
            if (!this.currentEventId || !hasCredentials) return false;

            try {
                if (fieldName !== 'bulk_save') {
                    this.showSaveIndicator(fieldName, 'saving');
                }

                const configData = {
                    fieldConfig: this.fieldConfig,
                    customLabels: this.customLabels,
                    customFields: this.customFields || [],
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
                    SalesforceLeadLib._dataCache.set(`fieldmap:${this.currentEventId}`, {
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
                const endpoint = `LS_FieldMappings?$filter=EventId eq '${this.currentEventId}'&$format=json`;
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
                    ApiEndpoint: 'LeadSuccess_Event_API',
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
                    try {
                        await this.saveFieldMappingsToAPI(fieldName, 'toggle');
                    } catch (error) {
                        console.error(`Error saving field config for ${fieldName}:`, error);
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

    function showTransferLoadingModal(message = 'Processing...') {
        const modal = document.createElement('div');
        modal.className = 'sf-lib-transfer-loading-modal sf-modal-overlay';

        modal.innerHTML = `
            <div class="sf-modal sf-modal--sm" role="dialog" aria-modal="true" aria-busy="true">
                <div class="sf-modal__body" style="text-align:center;padding:32px 24px;">
                    <span class="sf-spinner sf-spinner--lg" style="margin-bottom:16px;"></span>
                    <p style="font-size:15px;font-weight:600;margin:0;">${message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }


    /**
     * Format error message to make field names and values bold
     * Example: "Email: invalid email address: test@example.com" -> "**Email**: invalid email address: **test@example.com**"
     */
    function formatErrorMessage(message) {
        if (!message) return '';

        // "Email: invalid email address
        let formatted = message.replace(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+?):\s*(.+)$/gm, (_match, field, error, value) => {
            return `<strong>${field}</strong>: ${error}: <strong>${value}</strong>`;
        });

        // "FieldName: error message" (without value)
        // Example: "LastName: This field is required"
        formatted = formatted.replace(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+)$/gm, (match, field, error) => {
            // Don't re-process if already has <strong> tag
            if (match.includes('<strong>')) return match;
            return `<strong>${field}</strong>: ${error}`;
        });

       
        // Example: "Missing required fields: FirstName, LastName, Company"
        formatted = formatted.replace(/:\s*([A-Za-z_][A-Za-z0-9_]*(?:,\s*[A-Za-z_][A-Za-z0-9_]*)+)/g, (_match, fields) => {
            const boldFields = fields.split(/,\s*/).map(f => `<strong>${f.trim()}</strong>`).join(', ');
            return `: ${boldFields}`;
        });

        return formatted;
    }

    function showErrorModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'sf-lib-transfer-error-modal sf-modal-overlay';

        // Format the message to make field names and values bold
        const formattedMessage = formatErrorMessage(message);

        modal.innerHTML = `
            <div class="sf-modal" role="alertdialog" aria-modal="true" aria-labelledby="sf-lib-error-title">
                <div class="sf-modal__header">
                    <span class="sf-icon-badge sf-icon-badge--error" aria-hidden="true">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </span>
                    <h2 class="sf-modal__title" id="sf-lib-error-title">${title}</h2>
                </div>
                <div class="sf-modal__body">
                    <p style="margin:0;white-space:pre-wrap;">${formattedMessage}</p>
                </div>
                <div class="sf-modal__footer">
                    <button id="ok" class="sf-lib-close-error-modal sf-btn sf-btn--danger">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.sf-lib-close-error-modal');
        closeBtn.addEventListener('click', () => modal.remove());
        closeBtn.focus();

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function showSuccessModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'sf-lib-transfer-success-modal sf-modal-overlay';
        modal.id = 'sf-lib-persistent-success-modal';
        modal.style.zIndex = '999999';

        modal.innerHTML = `
            <div class="sf-modal" role="dialog" aria-modal="true" aria-labelledby="sf-lib-success-title">
                <div class="sf-modal__header">
                    <span class="sf-icon-badge sf-icon-badge--success" aria-hidden="true">
                        <i class="fa-solid fa-circle-check"></i>
                    </span>
                    <h2 class="sf-modal__title" id="sf-lib-success-title">${title}</h2>
                </div>
                <div class="sf-modal__body">
                    <p style="margin:0;white-space:pre-wrap;">${message}</p>
                </div>
                <div class="sf-modal__footer sf-modal__footer--split">
                    <span id="sf-lib-auto-close-countdown" style="color:var(--sf-text-2);font-size:13px;"></span>
                    <button id="ok" class="sf-lib-close-success-modal sf-btn sf-btn--primary">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.sf-lib-close-success-modal');
        const countdownSpan = modal.querySelector('#sf-lib-auto-close-countdown');

        let secondsLeft = 15;
        countdownSpan.textContent = `${_t('sforce.autoClosingIn', 'Auto-closing in')} ${secondsLeft}s...`;

        const countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) {
                countdownSpan.textContent = `${_t('sforce.autoClosingIn', 'Auto-closing in')} ${secondsLeft}s...`;
            } else {
                clearInterval(countdownInterval);
                modal.remove();
            }
        }, 1000);

        const closeModal = () => {
            clearInterval(countdownInterval);
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        closeBtn.focus();

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    function showModernToast(message, type = 'info', duration = 4000) {
        let container = document.getElementById('sf-lib-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sf-lib-toast-container';
            container.className = 'sf-toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: '<i class="fa-solid fa-circle-check"></i>',
            error: '<i class="fa-solid fa-circle-xmark"></i>',
            warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
            info: '<i class="fa-solid fa-circle-info"></i>'
        };
        const validType = icons[type] ? type : 'info';

        const toast = document.createElement('div');
        toast.className = `sf-toast sf-toast--${validType}`;
        toast.setAttribute('role', validType === 'error' ? 'alert' : 'status');

        toast.innerHTML = `
            <span class="sf-toast__icon" aria-hidden="true">${icons[validType]}</span>
            <div style="flex: 1;">${message}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('is-leaving');
            setTimeout(() => {
                toast.remove();
                if (container.children.length === 0) container.remove();
            }, 300);
        }, duration);
    }

    /**
     * Show a confirmation dialog using a native <dialog> styled with the
     * modern token layer (matches the rest of the CRM UI). A native <dialog>
     * with showModal() stacks correctly above WinJS panels, so we no longer
     * defer to the legacy WinJS confirmModal look.
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Object} options - { confirmText, cancelText, type: 'danger'|... }
     * @returns {Promise<boolean>} - true if confirmed, false if cancelled
     */
    function showConfirmDialog(title, message, options = {}) {
        return new Promise((resolve) => {
            const confirmText = options.confirmText || 'OK';
            const cancelText = options.cancelText || 'Cancel';
            const isDanger = options.type === 'danger';
            const iconClass = isDanger ? 'fa-triangle-exclamation' : 'fa-circle-question';
            const badgeClass = isDanger ? 'sf-icon-badge--error' : 'sf-icon-badge--accent';
            const confirmBtnClass = isDanger ? 'sf-btn--danger' : 'sf-btn--primary';

            const esc = SalesforceLeadLib._escapeHtml;
            const dialog = document.createElement('dialog');
            dialog.className = 'sf-lib-dialog sf-dialog sf-dialog--sm';
            dialog.setAttribute('aria-labelledby', 'sf-confirm-dlg-title');
            dialog.innerHTML = `
                <div class="sf-modal__header">
                    <span class="sf-icon-badge ${badgeClass}" aria-hidden="true">
                        <i class="fa-solid ${iconClass}"></i>
                    </span>
                    <h3 class="sf-modal__title" id="sf-confirm-dlg-title">${esc(title)}</h3>
                </div>
                <div class="sf-modal__body">
                    <p style="margin:0;white-space:pre-line;color:var(--sf-text-2);">${esc(message)}</p>
                </div>
                <div class="sf-modal__footer">
                    <button id="sf-confirm-cancel" class="sf-btn sf-btn--secondary">${esc(cancelText)}</button>
                    <button id="sf-confirm-ok" class="sf-btn ${confirmBtnClass}">${esc(confirmText)}</button>
                </div>
            `;

            if (document.body.classList.contains('cnv-ui-dark')) {
                dialog.classList.add('cnv-ui-dark');
            }
            document.body.appendChild(dialog);
            dialog.showModal();

            const close = (result) => {
                dialog.close();
                dialog.remove();
                resolve(result);
            };
            dialog.querySelector('#sf-confirm-ok').addEventListener('click', () => close(true));
            dialog.querySelector('#sf-confirm-cancel').addEventListener('click', () => close(false));
            dialog.querySelector('#sf-confirm-cancel').focus();
            dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(false); });
            dialog.addEventListener('click', (e) => { if (e.target === dialog) close(false); });
        });
    }

    /**
     * Show an alert dialog using WinJS alert
     * @param {string} message - Dialog message
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>} - true when closed
     */
    function showAlertDialog(title, message, options = {}) {
        return new Promise((resolve) => {
            const fullMessage = title ? `${title}\n\n${message}` : message;

            if (typeof alert === 'function' && alert !== window.alert) {
                alert(fullMessage, function(result) {
                    resolve(true);
                });
            } else if (typeof Application !== 'undefined' && Application.alert) {
                Application.alert(fullMessage, function(result) {
                    resolve(true);
                });
            } else {
                // Fallback to native alert if WinJS not available
                window.alert(fullMessage);
                resolve(true);
            }
        });
    }

    /**
     * Show an edit label dialog using native <dialog> for proper z-index in WinJS
     * @param {string} title - Dialog title
     * @param {string} fieldName - The field name (read-only)
     * @param {string} currentLabel - Current label value
     * @param {Object} options - Additional options
     * @returns {Promise<string|null>} - The new label or null if cancelled
     */
    function showEditLabelDialog(title, fieldName, currentLabel, options = {}) {
        return new Promise((resolve) => {
            const saveText = options.saveText || 'Save Changes';
            const cancelText = options.cancelText || 'Cancel';

            // Use native <dialog> element to ensure proper stacking above WinJS panels
            const dialog = document.createElement('dialog');
            dialog.className = 'sf-lib-dialog sf-dialog';
            dialog.setAttribute('aria-labelledby', 'sf-lib-dialog-title');

            dialog.innerHTML = `
                <div class="sf-modal__header">
                    <span class="sf-icon-badge sf-icon-badge--accent" aria-hidden="true">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </span>
                    <h3 class="sf-modal__title" id="sf-lib-dialog-title">${title}</h3>
                    <button id="sf-lib-close-x" class="sf-icon-btn" aria-label="${cancelText}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="sf-modal__body">
                    <div style="margin-bottom: 16px;">
                        <label class="sf-field-label" for="sf-lib-field-name">Field Name (Read-only)</label>
                        <input type="text" id="sf-lib-field-name" class="sf-input" readonly value="${fieldName}" />
                    </div>
                    <div>
                        <label class="sf-field-label" for="sf-lib-custom-label">Salesforce target field</label>
                        <input type="text" id="sf-lib-custom-label" class="sf-input" value="${currentLabel}" />
                        <p class="sf-field-hint">
                            Enter the Salesforce field this maps to (e.g. a custom field ending in <code>__c</code>).
                            Use <b>Reset to default</b> to remove the mapping and restore the original behavior.
                        </p>
                    </div>
                </div>
                <div class="sf-modal__footer sf-modal__footer--split">
                    <button id="sf-lib-reset-edit" class="sf-btn sf-btn--ghost sf-btn--sm">
                        <i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Reset to default
                    </button>
                    <div style="display: flex; gap: 10px;">
                        <button id="sf-lib-cancel-edit" class="sf-btn sf-btn--secondary">
                            ${cancelText}
                        </button>
                        <button id="sf-lib-save-edit" class="sf-btn sf-btn--primary">
                            <i class="fa-solid fa-check" aria-hidden="true"></i> ${saveText}
                        </button>
                    </div>
                </div>
            `;

            if (document.body.classList.contains('cnv-ui-dark')) {
                dialog.classList.add('cnv-ui-dark');
            }

            document.body.appendChild(dialog);
            dialog.showModal();

            const closeXBtn = dialog.querySelector('#sf-lib-close-x');
            const cancelBtn = dialog.querySelector('#sf-lib-cancel-edit');
            const saveBtn = dialog.querySelector('#sf-lib-save-edit');
            const resetBtn = dialog.querySelector('#sf-lib-reset-edit');
            const labelInput = dialog.querySelector('#sf-lib-custom-label');

            // Focus on label input
            labelInput.focus();
            labelInput.select();

            const closeDialog = (result) => {
                dialog.close();
                dialog.remove();
                resolve(result);
            };

            closeXBtn.addEventListener('click', () => closeDialog(null));
            cancelBtn.addEventListener('click', () => closeDialog(null));
            saveBtn.addEventListener('click', () => closeDialog(labelInput.value));
            // Reset returns a sentinel so the caller can remove the custom mapping and
            // restore the field's default behavior.
            if (resetBtn) resetBtn.addEventListener('click', () => closeDialog('__RESET__'));

            // Save on Enter key
            labelInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    closeDialog(labelInput.value);
                }
            });

            // Close on backdrop click
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeDialog(null);
                }
            });

            // Close on Escape key
            dialog.addEventListener('cancel', (e) => {
                e.preventDefault();
                closeDialog(null);
            });
        });
    }

    /**
     * Show add custom field dialog using native <dialog> for proper z-index in WinJS
     * @param {Object} options - Additional options
     * @returns {Promise<{fieldName: string, fieldValue: string}|null>} - The field data or null if cancelled
     */
    function showAddCustomFieldDialog(options = {}) {
        return new Promise((resolve) => {
            const saveText = options.saveText || 'Save Field';
            const cancelText = options.cancelText || 'Cancel';

            // Use native <dialog> element to ensure proper stacking above WinJS panels
            const dialog = document.createElement('dialog');
            dialog.className = 'sf-lib-dialog sf-dialog';
            dialog.setAttribute('aria-labelledby', 'sf-lib-dialog-title');

            dialog.innerHTML = `
                <div class="sf-modal__header">
                    <span class="sf-icon-badge sf-icon-badge--accent" aria-hidden="true">
                        <i class="fa-solid fa-plus"></i>
                    </span>
                    <h3 class="sf-modal__title" id="sf-lib-dialog-title">Add Custom Field</h3>
                    <button id="sf-lib-close-x" class="sf-icon-btn" aria-label="${cancelText}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="sf-modal__body">
                    <div style="margin-bottom: 16px;">
                        <label class="sf-field-label" for="sf-lib-field-name">Field Name *</label>
                        <input type="text" id="sf-lib-field-name" class="sf-input" placeholder="e.g., Area__c" />
                        <p id="sf-lib-field-name-error" class="sf-field-error" role="alert"></p>
                        <p class="sf-field-hint">You must first verify the exact field name in Salesforce and enter it here without spaces.</p>
                    </div>
                    <div>
                        <label class="sf-field-label" for="sf-lib-field-value">Default Value</label>
                        <textarea id="sf-lib-field-value" class="sf-textarea" rows="3" placeholder="e.g., Germany, France"></textarea>
                        <p class="sf-field-hint">Optional default value for this custom field</p>
                    </div>
                </div>
                <div class="sf-modal__footer">
                    <button id="sf-lib-cancel" class="sf-btn sf-btn--secondary">
                        ${cancelText}
                    </button>
                    <button id="sf-lib-save" class="sf-btn sf-btn--primary">
                        <i class="fa-solid fa-check" aria-hidden="true"></i> ${saveText}
                    </button>
                </div>
            `;

            if (document.body.classList.contains('cnv-ui-dark')) {
                dialog.classList.add('cnv-ui-dark');
            }

            document.body.appendChild(dialog);
            dialog.showModal();

            const closeXBtn = dialog.querySelector('#sf-lib-close-x');
            const cancelBtn = dialog.querySelector('#sf-lib-cancel');
            const saveBtn = dialog.querySelector('#sf-lib-save');
            const nameInput = dialog.querySelector('#sf-lib-field-name');
            const valueInput = dialog.querySelector('#sf-lib-field-value');

            // Focus on name input
            nameInput.focus();

            const closeDialog = (result) => {
                dialog.close();
                dialog.remove();
                resolve(result);
            };

            const errorEl = dialog.querySelector('#sf-lib-field-name-error');

            const validateAndSave = () => {
                const fieldName = nameInput.value.trim();
                const fieldValue = valueInput.value.trim();

                if (!fieldName) {
                    errorEl.textContent = 'Field name is required.';
                    errorEl.style.display = 'block';
                    nameInput.classList.add('sf-input--error');
                    nameInput.focus();
                    return;
                }
                if (!fieldName.match(/^[a-zA-Z][a-zA-Z0-9_]*(__c)?$/)) {
                    errorEl.textContent = 'Invalid field name: no spaces allowed. Use only letters, numbers and underscores (e.g. MyField__c).';
                    errorEl.style.display = 'block';
                    nameInput.classList.add('sf-input--error');
                    nameInput.focus();
                    return;
                }

                closeDialog({ fieldName, fieldValue });
            };

            nameInput.addEventListener('input', () => {
                errorEl.style.display = 'none';
                nameInput.classList.remove('sf-input--error');
            });

            closeXBtn.addEventListener('click', () => closeDialog(null));
            cancelBtn.addEventListener('click', () => closeDialog(null));
            saveBtn.addEventListener('click', validateAndSave);

            // Save on Enter key in name input
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    validateAndSave();
                }
            });

            // Close on backdrop click
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeDialog(null);
                }
            });

            // Close on Escape key
            dialog.addEventListener('cancel', (e) => {
                e.preventDefault();
                closeDialog(null);
            });
        });
    }

    /**
     * Show edit custom field dialog using native <dialog> for proper z-index in WinJS
     * @param {string} fieldName - The field name (read-only)
     * @param {string} currentValue - Current default value
     * @param {Object} options - Additional options
     * @returns {Promise<{sfFieldName: string, label: string, value: string}|null>} - The updated field data or null if cancelled
     */
    function showEditCustomFieldDialog(fieldName, currentValue, options = {}) {
        return new Promise((resolve) => {
            const saveText = options.saveText || 'Save Changes';
            const cancelText = options.cancelText || 'Cancel';
            const currentLabel = options.currentLabel || '';

            // Use native <dialog> element to ensure proper stacking above WinJS panels
            const dialog = document.createElement('dialog');
            dialog.className = 'sf-lib-dialog sf-dialog';
            dialog.setAttribute('aria-labelledby', 'sf-lib-dialog-title');

            dialog.innerHTML = `
                <div class="sf-modal__header">
                    <span class="sf-icon-badge sf-icon-badge--accent" aria-hidden="true">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </span>
                    <h3 class="sf-modal__title" id="sf-lib-dialog-title">Edit Custom Field</h3>
                    <button id="sf-lib-close-x" class="sf-icon-btn" aria-label="${cancelText}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="sf-modal__body">
                    <div style="margin-bottom: 16px;">
                        <label class="sf-field-label" for="sf-lib-field-name">SF Field Name</label>
                        <input type="text" id="sf-lib-field-name" class="sf-input" value="${fieldName}" />
                        <p class="sf-field-hint">Exact field API name in Salesforce (e.g. Branch__c)</p>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label class="sf-field-label" for="sf-lib-field-label">Display Label</label>
                        <input type="text" id="sf-lib-field-label" class="sf-input" placeholder="${fieldName}" value="${currentLabel}" />
                        <p class="sf-field-hint">Name shown in the field list (leave empty to use SF field name)</p>
                    </div>
                    <div>
                        <label class="sf-field-label" for="sf-lib-field-value">Default Value</label>
                        <textarea id="sf-lib-field-value" class="sf-textarea" rows="3">${currentValue}</textarea>
                        <p class="sf-field-hint">Update the default value for this custom field</p>
                    </div>
                </div>
                <div class="sf-modal__footer">
                    <button id="sf-lib-cancel" class="sf-btn sf-btn--secondary">
                        ${cancelText}
                    </button>
                    <button id="sf-lib-save" class="sf-btn sf-btn--primary">
                        <i class="fa-solid fa-check" aria-hidden="true"></i> ${saveText}
                    </button>
                </div>
            `;

            if (document.body.classList.contains('cnv-ui-dark')) {
                dialog.classList.add('cnv-ui-dark');
            }

            document.body.appendChild(dialog);
            dialog.showModal();

            const closeXBtn = dialog.querySelector('#sf-lib-close-x');
            const cancelBtn = dialog.querySelector('#sf-lib-cancel');
            const saveBtn = dialog.querySelector('#sf-lib-save');
            const sfNameInput = dialog.querySelector('#sf-lib-field-name');
            const labelInput = dialog.querySelector('#sf-lib-field-label');
            const valueInput = dialog.querySelector('#sf-lib-field-value');

            // Focus on SF field name input
            sfNameInput.focus();
            sfNameInput.select();

            const closeDialog = (result) => {
                dialog.close();
                dialog.remove();
                resolve(result);
            };

            const doSave = () => closeDialog({
                sfFieldName: sfNameInput.value.trim(),
                label: labelInput.value.trim(),
                value: valueInput.value
            });

            closeXBtn.addEventListener('click', () => closeDialog(null));
            cancelBtn.addEventListener('click', () => closeDialog(null));
            saveBtn.addEventListener('click', doSave);

            // Save on Enter key in text inputs (not textarea)
            [sfNameInput, labelInput].forEach(input => {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        doSave();
                    }
                });
            });

            // Close on backdrop click
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeDialog(null);
                }
            });

            // Close on Escape key
            dialog.addEventListener('cancel', (e) => {
                e.preventDefault();
                closeDialog(null);
            });
        });
    }


    // UTILITY FUNCTIONS
    function isStandardSalesforceField(fieldName) {
        const standardFields = [
            'Address', 'AnnualRevenue', 'City', 'CleanStatus', 'Company',
            'CompanyDunsNumber', 'ConvertedAccountId', 'ConvertedContactId',
            'ConvertedDate', 'ConvertedOpportunityId', 'Country', 'CountryCode',  'CreatedById', 'CreatedDate', 'DandbCompanyId', 'Description', 'Email', 'EmailBouncedDate', 'EmailBouncedReason', 'Fax', 'FirstName',  'GeocodeAccuracy', 'Id', 'IndividualId', 'Industry', 'IsConverted',
            'IsDeleted', 'IsPriorityRecord', 'IsUnreadByOwner', 'Jigsaw',
            'JigsawContactId', 'LastActivityDate', 'LastModifiedById',
            'LastModifiedDate', 'LastName', 'LastReferencedDate', 'LastViewedDate',
            'Latitude', 'LeadSource', 'Longitude', 'MasterRecordId', 'MobilePhone',
            'Name', 'NumberOfEmployees', 'OwnerId', 'Phone', 'PhotoUrl',
            'PostalCode', 'Rating', 'Salutation', 'State', 'StateCode', 'Status',
            'Street', 'SystemModstamp', 'Title', 'Website'
        ];

        return standardFields.includes(fieldName);
    }

    function isSystemField(fieldName) {
        const systemFields = [
            '__metadata', 'KontaktViewId', 'Id', 'ContactId', 'CreatedDate', 'LastModifiedDate', 'CreatedById', 'LastModifiedById', 'SystemModstamp', 'DeviceId',
                 'DeviceRecordId', 'EventId', 'RequestBarcode', 'StatusMessage'
        ];
        return systemFields.includes(fieldName);
    }

    // Salesforce system/audit/calculated fields that are READ-ONLY via the API.
    // Used as a guard: a user may map a read-only LS source (e.g. CreatedById) TO a
    // writable SF custom field, but never use one of these as the SF TARGET — Salesforce
    // would reject the create/update. Source: SF system fields reference.
    function isNonWritableSalesforceField(fieldName) {
        const nonWritable = [
            'Id', 'IsDeleted', 'MasterRecordId',
            'CreatedById', 'CreatedDate', 'LastModifiedById', 'LastModifiedDate',
            'SystemModstamp', 'LastActivityDate', 'LastViewedDate', 'LastReferencedDate',
            'Name', 'IsConverted', 'ConvertedDate', 'ConvertedAccountId',
            'ConvertedContactId', 'ConvertedOpportunityId', 'PhotoUrl', 'CleanStatus',
            'Jigsaw', 'JigsawContactId', 'GeocodeAccuracy', 'EmailBouncedReason',
            'EmailBouncedDate', 'IndividualId'
        ];
        return nonWritable.includes((fieldName || '').trim());
    }

    
    // Localization helper: returns translated string or fallback
    function _t(key, fallback) {
        try {
            if (typeof WinJS !== 'undefined' && WinJS.Resources && WinJS.Resources.getString) {
                const result = WinJS.Resources.getString(key);
                if (result && !result.empty) return result.value;
            }
        } catch (e) { /* ignore */ }
        return fallback;
    }

    // MAIN LIBRARY CLASS
    class SalesforceLeadLib {
        constructor(config = {}) {
            this.config = {
                backendUrl: config.backendUrl || (window.location.hostname === 'localhost'
                    ? 'http://localhost:3000'
                    : 'https://lsapisfbackend.convey.de/'),
                serverName: 'lstest.convey.de',
                apiName: 'apisftest',
                ...config
            };

            injectCSS();

            this.connectionManager = ConnectionPersistenceManager;
            this.leadEditsManager = new LeadEditsManager();
            this.fieldMappingService = new FieldMappingService({
                serverName: config.serverName,
                apiName: config.apiName
            });

            this.currentLeadData = null;
            this.currentContainer = null;
            this.isTransferInProgress = false;

            console.log(`SalesforceLeadLib v${this.version} initialized`);
        }

        async initialize(container, leadData, credentials, options = {}) {
            try {
                this.currentContainer = container;
                this.currentLeadData = leadData;

                if (credentials) {
                    sessionStorage.setItem('credentials', credentials);
                }

                const eventId = options.eventId || leadData?.EventId || leadData?.Id;
                if (eventId) {
                    sessionStorage.setItem('selectedEventId', eventId);
                    await this.fieldMappingService.initializeFields(leadData, eventId);
                }

                return toWinJSPromise(Promise.resolve({ success: true }));
            } catch (error) {
                console.error('Initialization error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        async loadLead(container, leadData, eventId) {
            try {
                this.currentContainer = container;
                this.currentLeadData = leadData;

                if (eventId) {
                    sessionStorage.setItem('selectedEventId', eventId);
                    await this.fieldMappingService.initializeFields(leadData, eventId);
                }

                const html = this._generateLeadHTML(leadData);
                container.innerHTML = html;

                this._attachEventListeners();

                return toWinJSPromise(Promise.resolve({ success: true }));
            } catch (error) {
                console.error('Load lead error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        async transferLead(leadData) {
            try {
                if (this.isTransferInProgress) {
                    throw new Error('Transfer already in progress');
                }

                this.isTransferInProgress = true;
                this.fieldMappingService.setTransferMode(true);

                const { salesforceData: activeFields, externalIdField } = this._collectActiveFieldsOnly(leadData);

                if (!activeFields || Object.keys(activeFields).length === 0) {
                    throw new Error('No active fields with values to transfer');
                }

                const hasLastName = activeFields.LastName && String(activeFields.LastName).trim() !== '';
                const hasCompany = activeFields.Company && String(activeFields.Company).trim() !== '';

                if (!hasLastName && !hasCompany) {
                    throw new Error('Both Last Name and Company are required fields.');
                }

                const modal = showTransferLoadingModal('Transferring lead to Salesforce...');

                const response = await this._transferToSalesforce(activeFields, externalIdField);

                if (modal) modal.remove();

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Transfer failed with status ${response.status}`);
                }

                const result = await response.json();

                this.isTransferInProgress = false;
                this.fieldMappingService.setTransferMode(false);

                return toWinJSPromise(Promise.resolve({
                    success: true,
                    salesforceId: result.salesforceId,
                    message: result.message
                }));

            } catch (error) {
                this.isTransferInProgress = false;
                this.fieldMappingService.setTransferMode(false);
                console.error('Transfer error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        async connect(credentials) {
            try {
                if (credentials) {
                    sessionStorage.setItem('credentials', credentials);
                }

                const orgId = 'default';
                localStorage.setItem('orgId', orgId);

                const authUrl = `${this.config.backendUrl}/auth/salesforce?orgId=${encodeURIComponent(orgId)}`;

                // Size large enough that the Salesforce login page fits without its own
                // scrollbar, and center on the BROWSER WINDOW (not the physical screen) so
                // it lands correctly on multi-monitor / RDP setups.
                const width = 600;
                const height = 750;
                const dualLeft = window.screenLeft ?? window.screenX ?? 0;
                const dualTop = window.screenTop ?? window.screenY ?? 0;
                const winW = window.outerWidth || screen.width;
                const winH = window.outerHeight || screen.height;
                const left = Math.round(dualLeft + (winW - width) / 2);
                const top = Math.round(dualTop + (winH - height) / 2);

                const popup = window.open(
                    authUrl,
                    'salesforce-auth',
                    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
                );

                if (!popup) {
                    throw new Error("Popup was blocked. Please allow popups for this site.");
                }

                return new Promise((resolve, reject) => {
                    const messageListener = (event) => {
                        if (event.data && event.data.type === 'SALESFORCE_AUTH_SUCCESS') {
                            console.log('OAuth success message received:', event.data);

                            const realOrgId = event.data.orgId;
                            const userInfo = event.data.userInfo;
                            localStorage.setItem('orgId', realOrgId);
                            if (event.data.sessionToken) {
                                localStorage.setItem('sf_session_token', event.data.sessionToken);
                            }
                            if (event.data.accessToken) {
                                localStorage.setItem('sf_access_token', event.data.accessToken);
                            }
                            if (event.data.instanceUrl) {
                                localStorage.setItem('sf_instance_url', event.data.instanceUrl);
                            }
                            if (event.data.refreshToken) {
                                localStorage.setItem('sf_refresh_token', event.data.refreshToken);
                            }

                            popup.close();
                            clearInterval(checkClosed);
                            window.removeEventListener('message', messageListener);

                            if (userInfo) {
                                console.log('Using userInfo from OAuth event:', userInfo);
                                this.connectionManager.saveConnection(userInfo);
                                localStorage.setItem('sf_user_info', JSON.stringify(userInfo));
                                resolve({ success: true, userInfo });
                            } else {
                                this._checkAuthenticationStatus().then(resolve).catch(reject);
                            }
                        }
                    };

                    window.addEventListener('message', messageListener);

                    const checkClosed = setInterval(() => {
                        if (popup.closed) {
                            clearInterval(checkClosed);
                            window.removeEventListener('message', messageListener);
                            this._checkAuthenticationStatus().then(resolve).catch(reject);
                        }
                    }, 1000);
                });

            } catch (error) {
                console.error('Connection error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        async disconnect() {
            try {
                // Read the isolation key BEFORE clearing localStorage — the backend
                // resolves the stored connection by X-Org-Id / X-Session-Token, so we
                // must send them or removeConnection() never runs and the (now
                // disk-persisted) connection survives the logout.
                const orgId = localStorage.getItem('orgId') || '';
                const sessionToken = localStorage.getItem('sf_session_token') || '';

                this.connectionManager.clearConnection();
                localStorage.removeItem('orgId');
                localStorage.removeItem('sf_session_token');
                localStorage.removeItem('sf_access_token');
                localStorage.removeItem('sf_instance_url');
                localStorage.removeItem('sf_refresh_token');
                localStorage.removeItem('sf_user_info');
                localStorage.removeItem('sf_connected');
                localStorage.removeItem('sf_connected_at');

                await fetch(`${this.config.backendUrl}/api/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(orgId && { 'X-Org-Id': orgId }),
                        ...(sessionToken && { 'X-Session-Token': sessionToken })
                    }
                }).catch(err => console.warn('Server logout failed:', err));

                return { success: true };

            } catch (error) {
                console.error('Disconnect error:', error);
                throw error;
            }
        }

        clear(container) {
            if (container) {
                container.innerHTML = '';
            }
            this.currentLeadData = null;
            this.currentContainer = null;
        }

        _generateLeadHTML(leadData) {
            return `
                <div class="sf-lib-container">
                    <div class="sf-lib-header">
                        <h2>Lead Information</h2>
                        <button id="sf-lib-transfer-btn" class="sf-lib-btn-primary">Transfer to Salesforce</button>
                    </div>
                    <div class="sf-lib-fields">
                        ${this._generateFieldsHTML(leadData)}
                    </div>
                </div>
            `;
        }

        _generateFieldsHTML(leadData) {
            const processedData = this.fieldMappingService.applyCustomLabels(leadData);
            let html = '';

            for (const [fieldName, fieldInfo] of Object.entries(processedData)) {
                if (isSystemField(fieldName)) continue;

                html += `
                    <div class="sf-lib-field-row" data-field-name="${fieldName}">
                        <div class="sf-lib-field-label">${fieldInfo.label || fieldName}</div>
                        <div class="sf-lib-field-value">${fieldInfo.value || '-'}</div>
                        <div class="sf-lib-field-actions">
                            <label class="sf-lib-toggle-switch">
                                <input type="checkbox" ${fieldInfo.active ? 'checked' : ''}>
                                <span class="sf-lib-toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                `;
            }

            return html;
        }

        _attachEventListeners() {
            if (!this.currentContainer) return;

            const transferBtn = this.currentContainer.querySelector('#sf-lib-transfer-btn');
            if (transferBtn) {
                transferBtn.addEventListener('click', () => {
                    this.transferLead(this.currentLeadData)
                        .then(result => {
                            showSuccessModal(_t('sforce.transferSuccessTitle', 'Transfer Successful'), result.message);
                        })
                        .catch(error => {
                            showErrorModal(_t('sforce.transferFailedTitle', 'Transfer Failed'), error.message);
                        });
                });
            }

            const toggles = this.currentContainer.querySelectorAll('.sf-lib-toggle-switch input');
            toggles.forEach(toggle => {
                toggle.addEventListener('change', async (e) => {
                    const row = e.target.closest('.sf-lib-field-row');
                    const fieldName = row.dataset.fieldName;
                    const isActive = e.target.checked;

                    await this.fieldMappingService.setFieldConfig(fieldName, { active: isActive });
                });
            });
        }

        // Sends all active fields from config. Non-standard SF fields get __c suffix automatically.
        // Returns { salesforceData, externalIdField } where externalIdField is the __c field name if configured.
        _collectActiveFieldsOnly(leadData) {
            const salesforceData = {};
            const excludedFields = new Set(['__metadata', 'KontaktViewId']);
            const fieldConfigArray = this.fieldMappingService.fieldConfig?.config?.fields || [];
            const hasFieldConfig = fieldConfigArray.length > 0;

            console.log('_collectActiveFieldsOnly - fieldConfig has', fieldConfigArray.length, 'fields');
            console.log('_collectActiveFieldsOnly - customLabels:', JSON.stringify(this.fieldMappingService.customLabels || {}));

            if (!hasFieldConfig) {
                console.warn('No field config found - using default standard SF fields');
                for (const [fieldName, value] of Object.entries(leadData)) {
                    if (excludedFields.has(fieldName)) continue;
                    if (!isStandardSalesforceField(fieldName)) continue;
                    if (!value || (typeof value === 'string' && value.trim() === '')) continue;

                    salesforceData[fieldName] = typeof value === 'string' ? value.trim() : value;
                }
                return { salesforceData, externalIdField: null };
            }

            const activeFieldsMap = new Map();
            for (const configField of fieldConfigArray) {
                if (configField.active === true) {
                    activeFieldsMap.set(configField.fieldName, configField);
                }
            }

            const customFields = this.fieldMappingService.customFields || [];
            for (const customField of customFields) {
                if (customField.active === true && customField.sfFieldName) {
                    activeFieldsMap.set(customField.id || customField.sfFieldName, {
                        fieldName: customField.sfFieldName,
                        isCustomField: true,
                        value: customField.value
                    });
                }
            }

            console.log('_collectActiveFieldsOnly - Active fields:', Array.from(activeFieldsMap.keys()));

            for (const [fieldName, configField] of activeFieldsMap) {
                if (excludedFields.has(fieldName)) continue;

                let value = leadData[fieldName];

                if (configField.isCustomField && configField.value) {
                    value = configField.value;
                }

                if (!value || (typeof value === 'string' && (value.trim() === '' || value === 'N/A'))) {
                    continue;
                }

                let sfFieldName = fieldName;
                if (!isStandardSalesforceField(fieldName)) {
                    const customLabel = this.fieldMappingService.customLabels?.[fieldName];
                    if (customLabel) sfFieldName = customLabel;
                    if (!sfFieldName.endsWith('__c')) {
                        sfFieldName = sfFieldName + '__c';
                    }
                }

                // Numeric fields must be sent as numbers, not strings
                if (sfFieldName === 'AnnualRevenue' || sfFieldName === 'NumberOfEmployees') {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) salesforceData[sfFieldName] = numValue;
                    continue;
                }

                salesforceData[sfFieldName] = typeof value === 'string' ? value.trim() : value;
            }

            // Force required SF fields (LastName, Company) - SF rejects leads without these
            const requiredSfFields = ['LastName', 'Company'];
            for (const reqField of requiredSfFields) {
                if (!salesforceData[reqField]) {
                    // Try to find value from leadData using reverse customLabels mapping
                    const customLabels = this.fieldMappingService?.customLabels || {};
                    for (const [odataField, sfField] of Object.entries(customLabels)) {
                        if (sfField === reqField && leadData[odataField]) {
                            salesforceData[reqField] = typeof leadData[odataField] === 'string'
                                ? leadData[odataField].trim() : leadData[odataField];
                            break;
                        }
                    }
                    // Fallback: try direct field name from leadData
                    if (!salesforceData[reqField] && leadData[reqField]) {
                        salesforceData[reqField] = typeof leadData[reqField] === 'string'
                            ? leadData[reqField].trim() : leadData[reqField];
                    }
                }
            }

            // External ID auto-inclusion (e.g. LS_LeadId__c)
            const externalIdSfField = this.fieldMappingService?.customLabels?.['Id'];
            if (externalIdSfField?.trim()?.endsWith('__c') && leadData.Id) {
                salesforceData[externalIdSfField.trim()] = leadData.Id;
            }
            const externalIdField = externalIdSfField?.trim()?.endsWith('__c')
                ? externalIdSfField.trim() : null;

            return { salesforceData, externalIdField };
        }

        async _reactivateSession() {
            const orgId = localStorage.getItem('orgId') || 'default';
            const refreshToken = localStorage.getItem('sf_refresh_token');

            // Try refresh token first (permanent, no expiry)
            if (refreshToken) {
                try {
                    const response = await fetch(`${this.config.backendUrl}/api/salesforce/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ refreshToken, organizationId: orgId })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.sessionId) localStorage.setItem('sf_session_token', data.sessionId);
                        if (data.accessToken) localStorage.setItem('sf_access_token', data.accessToken);
                        if (data.instanceUrl) localStorage.setItem('sf_instance_url', data.instanceUrl);
                        // Refresh token rotation: save new refresh token if provided
                        if (data.refreshToken) localStorage.setItem('sf_refresh_token', data.refreshToken);
                        return true;
                    }
                    // Refresh token revoked — clear it
                    localStorage.removeItem('sf_refresh_token');
                } catch { /* fall through to accessToken attempt */ }
            }

            // Fallback: try existing access token (valid ~2h)
            const accessToken = localStorage.getItem('sf_access_token');
            const instanceUrl = localStorage.getItem('sf_instance_url');
            if (!accessToken || !instanceUrl) return false;

            try {
                const response = await fetch(`${this.config.backendUrl}/api/salesforce/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ accessToken, instanceUrl, organizationId: orgId })
                });
                if (!response.ok) return false;
                const data = await response.json();
                if (data.sessionId) localStorage.setItem('sf_session_token', data.sessionId);
                return true;
            } catch {
                return false;
            }
        }

        async _transferToSalesforce(leadData, externalIdField = null) {
            const apiUrl = `${this.config.backendUrl}/api/salesforce/leads`;
            const orgId = localStorage.getItem('orgId') || 'default';
            const sessionToken = localStorage.getItem('sf_session_token') || '';

            const payload = {
                leadData: leadData,
                attachments: [],
                leadId: this.currentLeadData?.KontaktViewId || this.currentLeadData?.Id,
                ...(externalIdField && { externalIdField })
            };

            const doFetch = async () => {
                const token = localStorage.getItem('sf_session_token') || '';
                return fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Org-Id': orgId,
                        ...(token && { 'X-Session-Token': token })
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
            };

            let response = await doFetch();

            // Auto-reconnect if session expired on backend
            if (response.status === 401) {
                const reactivated = await this._reactivateSession();
                if (reactivated) {
                    response = await doFetch();
                } else {
                    return {
                        ok: false,
                        status: 401,
                        sessionExpired: true,
                        json: async () => ({ message: 'Salesforce session expired. Please reconnect to Salesforce and try again.' })
                    };
                }
            }

            if (!response.ok) {
                const errorData = await response.json();
                return {
                    ok: false,
                    status: response.status,
                    json: async () => errorData
                };
            }

            const result = await response.json();

            return {
                ok: true,
                status: 200,
                json: async () => ({
                    success: result.success,
                    salesforceId: result.salesforceId,
                    isUpdate: result.isUpdate || false,
                    message: result.message || 'Lead transferred successfully'
                })
            };
        }

        async _checkAuthenticationStatus() {
            const isPortalContext = !this.config.backendUrl ||
                this.config.backendUrl.includes('localhost') ||
                window.location.hostname.includes('convey.de') ||
                window.location.hostname.includes('leadsuccess') ||
                SalesforceLeadLib._portalConfig;

            if (isPortalContext) {
                console.log('Portal context detected - checking localStorage for saved auth');
                const accessToken = localStorage.getItem('sf_access_token');
                const instanceUrl = localStorage.getItem('sf_instance_url');
                const savedUserInfo = localStorage.getItem('sf_user_info');
                const sfConnected = localStorage.getItem('sf_connected');

                if ((accessToken && instanceUrl) || sfConnected === 'true') {
                    console.log('Found saved Salesforce connection');
                    const userInfo = savedUserInfo ? JSON.parse(savedUserInfo) : { display_name: 'Salesforce User' };
                    return { success: true, userInfo };
                }

                return { success: false, reason: 'Portal context - no saved credentials' };
            }

            const orgId = localStorage.getItem('orgId') || 'default';

            const response = await fetch(`${this.config.backendUrl}/api/salesforce/check`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Org-Id': orgId
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                const userInfo = responseData.userInfo || responseData;

                this.connectionManager.saveConnection(userInfo);

                if (responseData.tokens) {
                    localStorage.setItem('sf_access_token', responseData.tokens.access_token);
                    localStorage.setItem('sf_instance_url', responseData.tokens.instance_url);
                }

                localStorage.setItem('sf_user_info', JSON.stringify(userInfo));

                return { success: true, userInfo };
            } else {
                this.connectionManager.clearConnection();
                throw new Error('Authentication failed');
            }
        }

        // ========================================
        // LSPORTAL INTEGRATION API
        // ========================================

        /**
         * Initialize library with Portal Admin credentials
         * @param {string} serverUrl - Full server URL with http(s):// and optional :port
         * @param {string} apiName - API path name (e.g., "odata_online")
         * @param {string} user - Portal Admin username
         * @param {string} password - Portal Admin password
         */
        /**
         * @private Session data cache. Lives on the static class, so it
         * survives WinJS page destroy/re-create on every tab switch (the
         * detail controllers are rebuilt from scratch each navigation).
         * Keys:
         *   'contacts:{eventId}' -> { items, skip, hasMore, savedAt } (SWR)
         *   'fieldmap:{eventId}' -> { configDataStr } (raw JSON string —
         *       re-parsed on hit so local mutations never alias the cache)
         * Cleared per-event by Refresh; fieldmap refreshed on every save.
         */
        static _dataCache = new Map();

        static init(serverUrl, apiName, user, password) {
            this._portalConfig = {
                serverUrl: serverUrl,
                apiName: apiName,
                user: user,
                password: password,
                baseUrl: `${serverUrl}/${apiName}`
            };

            this._instance = null;

            return true;
        }

        /**
         * Detect environment (production or development) using same logic as backend
         * @private
         */
        static _detectEnvironment() {
            const hostname = window.location.hostname;
            const port = window.location.port;

            // Check for production patterns (same as backend server.js)
            const isProductionHost = hostname.includes('convey.de') ||
                                   hostname.includes('azurewebsites.net') ||
                                   hostname.includes('azurestaticapps.net');

            // Any localhost/127.0.0.1 is dev, regardless of port — dev servers
            // (live-server, vite, etc.) pick random high ports like 51170, and
            // treating "port !== 3000" as production wrongly pointed the client at
            // the prod backend, which then blocked the request via CORS.
            const isLocalhost = hostname === 'localhost' ||
                                hostname === '127.0.0.1' ||
                                hostname === '[::1]';

            const isProduction = isProductionHost && !isLocalhost;

            return isProduction;
        }

        /**
         * Get or create singleton instance for Salesforce operations
         * @private
         */
        static _getInstance() {
            if (!this._portalConfig) {
                console.error('Portal configuration not initialized. Call init() first.');
                return null;
            }

            if (!this._instance) {
                const isProduction = this._detectEnvironment();
                const backendUrl = isProduction
                    ? 'https://lsapisfbackend.convey.de'
                    : 'http://localhost:3000';

                this._instance = new SalesforceLeadLib({
                    backendUrl: backendUrl,
                    serverName: this._portalConfig.serverUrl.replace(/^https?:\/\//, ''),
                    apiName: this._portalConfig.apiName
                });

                // Pass portal credentials to FieldMappingService and OData calls
                if (this._portalConfig.user && this._portalConfig.password) {
                    const creds = btoa(`${this._portalConfig.user}:${this._portalConfig.password}`);
                    this._instance.fieldMappingService.credentials = creds;
                    this._instance.credentials = creds;
                    sessionStorage.setItem('credentials', creds);
                }
            }

            return this._instance;
        }

        /**
         * Clear all HTML elements from container
         * @param {HTMLElement} rootElement - Container element to clear
         */
        static clear(rootElement) {
            if (!rootElement) {
                return;
            }

            while (rootElement.firstChild) {
                rootElement.removeChild(rootElement.firstChild);
            }
        }

        /**
         * @param {HTMLElement} rootElement - Container for the UI
         * @param {string} eventId - Event UUID from UniqueRecordId table (null for localStorage-only mode)
         * @param {Object} options - Optional configuration
         * @param {number} options.recordId - RecordId for localStorage-only mode (used when eventId is null)
         */
        static async openFieldMapping(rootElement, eventId, options = {}) {
            injectCSS();
            const localStorageOnlyMode = !eventId && options.recordId;
            const storageKey = localStorageOnlyMode ? `event_${options.recordId}` : eventId;

            if (!rootElement) {
                throw new Error('rootElement is required');
            }

            if (!eventId && !options.recordId) {
                throw new Error('eventId (UUID) or options.recordId is required');
            }

            if (!this._portalConfig) {
                throw new Error('Library not initialized. Call init() first with Portal Admin credentials');
            }

            try {
                this.clear(rootElement);
                // Skeleton mirror of the final layout (header / KPI row / field grid)
                // with a shimmer sweep while config + API fields load.
                rootElement.innerHTML = `
                    <div class="sf-fieldmap-root" aria-busy="true" aria-label="Loading fields">
                        <div class="sf-fieldmap-header">
                            <div style="flex: 1; min-width: 260px;">
                                <div class="sf-skeleton" style="height: 24px; max-width: 220px; margin-bottom: 10px;"></div>
                                <div class="sf-skeleton" style="height: 13px; max-width: 420px;"></div>
                            </div>
                            <div class="sf-fieldmap-actions">
                                <div class="sf-skeleton" style="height: 38px; width: 150px; border-radius: var(--sf-radius-pill);"></div>
                                <div class="sf-skeleton" style="height: 38px; width: 120px;"></div>
                                <div class="sf-skeleton" style="height: 38px; width: 90px;"></div>
                            </div>
                        </div>
                        <div class="sf-fieldmap-stats">
                            <div class="sf-skeleton" style="height: 82px;"></div>
                            <div class="sf-skeleton" style="height: 82px;"></div>
                            <div class="sf-skeleton" style="height: 82px;"></div>
                            <div class="sf-skeleton" style="height: 82px;"></div>
                        </div>
                        <div class="sf-card" style="padding: 16px;">
                            <div class="sf-skeleton" style="height: 38px; max-width: 400px; margin-bottom: 16px;"></div>
                            <div class="sf-skeleton" style="height: 32px; max-width: 480px; border-radius: var(--sf-radius-pill); margin-bottom: 16px;"></div>
                            <div class="sf-fieldmap-grid">
                                ${'<div class="sf-skeleton" style="height: 56px;"></div>'.repeat(9)}
                            </div>
                        </div>
                    </div>
                `;

                if (typeof WinJS !== 'undefined' && WinJS.Resources && WinJS.Resources.processAll) {
                    WinJS.Resources.processAll(rootElement);
                }

                if (localStorageOnlyMode) {
                    sessionStorage.setItem('selectedEventId', '');
                    sessionStorage.setItem('localStorageOnlyMode', 'true');
                    sessionStorage.setItem('localStorageKey', storageKey);
                } else {
                    sessionStorage.setItem('selectedEventId', eventId);
                    sessionStorage.setItem('localStorageOnlyMode', 'false');
                    sessionStorage.removeItem('localStorageKey');
                }

                const credentials = btoa(`${this._portalConfig.user}:${this._portalConfig.password}`);
                sessionStorage.setItem('credentials', credentials);
                sessionStorage.setItem('serverName', this._portalConfig.serverUrl.replace(/^https?:\/\//, ''));
                sessionStorage.setItem('apiName', this._portalConfig.apiName);

                const instance = new SalesforceLeadLib({
                    backendUrl: this._portalConfig.baseUrl,
                    serverName: this._portalConfig.serverUrl.replace(/^https?:\/\//, ''),
                    apiName: this._portalConfig.apiName
                });

                const html = `
                    <div class="contenthost-background sf-fieldmap-root">
                        <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                            <header class="sf-fieldmap-header">
                                <div style="flex: 1; min-width: 260px;">
                                    <h1 data-win-res="{textContent: 'crmSettings.fieldConfigurator'}">Field Configurator</h1>
                                    <p id="event-info" class="sf-fieldmap-desc" data-win-res="{textContent: 'crmSettings.fieldConfiguratorDesc'}">Configure which fields will be transferred to Salesforce for this event. Required fields (LastName, Company) are always included.</p>
                                </div>
                                <div class="sf-fieldmap-actions">
                                    <div id="sf-status-card" class="sf-connection-chip">
                                        <span id="sf-status-indicator" class="sf-dot sf-dot--warning"></span>
                                        <span id="sf-status-text" class="sf-connection-chip__text" data-win-res="{textContent: 'sforce.statusDisconnected'}">Disconnected</span>
                                        <div id="sf-user-section" class="sf-connection-chip__user">
                                            <span id="sf-user-avatar" class="sf-avatar">?</span>
                                            <span id="sf-user-name" class="sf-connection-chip__text">Unknown</span>
                                        </div>
                                    </div>
                                    <button id="sf-connect-btn" class="sf-btn sf-btn--primary">
                                        <i class="fa-solid fa-plug" aria-hidden="true"></i> <span data-win-res="{textContent: 'sforce.btnConnect'}">Connect to Salesforce</span>
                                    </button>
                                    <button id="sf-disconnect-btn" class="sf-btn sf-btn--danger-outline" style="display:none;">
                                        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> <span data-win-res="{textContent: 'sforce.btnDisconnect'}">Disconnect</span>
                                    </button>
                                    <button id="settings-save-btn" class="sf-btn sf-btn--primary">
                                        <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> <span data-win-res="{textContent: 'crmSettings.save'}">Save</span>
                                    </button>
                                </div>
                            </header>

                            <main style="flex: 1; overflow-y: auto; padding: 16px 0;">
                                <div id="virtual-mode-info" class="sf-card" style="display: none; padding: 16px; margin-bottom: 16px;">
                                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                                        <span class="sf-icon-badge sf-icon-badge--info" style="width: 36px; height: 36px; font-size: 15px;" aria-hidden="true">
                                            <i class="fa-solid fa-circle-info"></i>
                                        </span>
                                        <div>
                                            <p style="font-size: 14px; font-weight: 600; margin: 0; color: var(--sf-text);" data-win-res="{textContent: 'crmSettings.noContactsFound'}">No contacts found for this event.</p>
                                            <p style="font-size: 13px; margin: 4px 0 0; color: var(--sf-text-2);" data-win-res="{textContent: 'crmSettings.configureTestData'}">You can configure test data below for testing the transfer. All fields are editable for testing purposes.</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="sf-fieldmap-stats">
                                    <div class="sf-tile">
                                        <div id="totalFieldsCount" class="sf-tile__value" style="color: var(--sf-accent);">0</div>
                                        <div class="sf-tile__label" data-win-res="{textContent: 'crmSettings.totalFields'}">Total Fields</div>
                                    </div>
                                    <div class="sf-tile">
                                        <div id="activeFieldsCount" class="sf-tile__value" style="color: var(--sf-success);">0</div>
                                        <div class="sf-tile__label" data-win-res="{textContent: 'crmSettings.activeFields'}">Active Fields</div>
                                    </div>
                                    <div class="sf-tile">
                                        <div id="inactiveFieldsCount" class="sf-tile__value" style="color: var(--sf-text-2);">0</div>
                                        <div class="sf-tile__label" data-win-res="{textContent: 'crmSettings.inactiveFields'}">Inactive Fields</div>
                                    </div>
                                    <div class="sf-tile">
                                        <div id="customFieldsCount" class="sf-tile__value" style="color: var(--sf-accent);">0</div>
                                        <div class="sf-tile__label" data-win-res="{textContent: 'crmSettings.customFields'}">Custom Fields</div>
                                    </div>
                                </div>

                                <div class="sf-card" style="padding: 16px;">
                                    <div class="sf-fieldmap-search">
                                        <i class="fa-solid fa-magnifying-glass sf-fieldmap-search__icon" aria-hidden="true"></i>
                                        <input type="text" id="searchField" class="sf-input" data-win-res="{placeholder: 'crmSettings.searchFields'}" placeholder="Search fields..." aria-label="Search fields" />
                                    </div>

                                    <div class="sf-tabs" role="tablist" style="margin-bottom: 16px; flex-wrap: wrap;">
                                        <button class="sf-tabs__tab filter-tab" role="tab" aria-selected="false" data-filter="all" data-win-res="{textContent: 'crmSettings.allFields'}">
                                            All Fields
                                        </button>
                                        <button class="sf-tabs__tab filter-tab active" role="tab" aria-selected="true" data-filter="active" data-win-res="{textContent: 'crmSettings.activeFields'}">
                                            Active Fields
                                        </button>
                                        <button class="sf-tabs__tab filter-tab" role="tab" aria-selected="false" data-filter="inactive" data-win-res="{textContent: 'crmSettings.inactiveFields'}">
                                            Inactive Fields
                                        </button>
                                        <button class="sf-tabs__tab filter-tab" role="tab" aria-selected="false" data-filter="required" data-win-res="{textContent: 'crmSettings.required'}">
                                            Required
                                        </button>
                                        <button class="sf-tabs__tab filter-tab" role="tab" aria-selected="false" data-filter="custom" data-win-res="{textContent: 'crmSettings.customFields'}">
                                            Custom Fields
                                        </button>
                                    </div>

                                    <button id="addCustomFieldBtn" class="sf-btn sf-btn--primary sf-btn--sm" style="display: none; margin-bottom: 16px;">
                                        <i class="fa-solid fa-plus" aria-hidden="true"></i>
                                        <span data-win-res="{textContent: 'crmSettings.addCustomField'}">Add Custom Field</span>
                                    </button>

                                    <div id="fieldsContainer">
                                        <div class="sf-fieldmap-grid" aria-hidden="true">
                                            <div class="sf-skeleton" style="height: 56px;"></div>
                                            <div class="sf-skeleton" style="height: 56px;"></div>
                                            <div class="sf-skeleton" style="height: 56px;"></div>
                                            <div class="sf-skeleton" style="height: 56px;"></div>
                                            <div class="sf-skeleton" style="height: 56px;"></div>
                                            <div class="sf-skeleton" style="height: 56px;"></div>
                                        </div>
                                    </div>
                                </div>

                            </main>
                        </div>
                    </div>
                `;

                rootElement.innerHTML = html;

                if (typeof WinJS !== 'undefined' && WinJS.Resources && WinJS.Resources.processAll) {
                    WinJS.Resources.processAll(rootElement);
                }

                try {
                    rootElement._currentFilter = 'active';
                    rootElement._fieldMappingService = instance.fieldMappingService;
                    rootElement._localStorageOnlyMode = localStorageOnlyMode;

                    const effectiveEventId = localStorageOnlyMode ? null : eventId;
                    // Load DB config and API fields in parallel to minimize loading time
                    await Promise.all([
                        instance.fieldMappingService.initializeFields({}, effectiveEventId),
                        this._loadApiFieldsInBackground(rootElement, instance.fieldMappingService)
                    ]);

                    if (localStorageOnlyMode) {
                        const infoBox = rootElement.querySelector('#virtual-mode-info');
                        if (infoBox) {
                            infoBox.style.display = 'block';
                        }
                    }

                    this._renderFieldsGrid(rootElement, instance.fieldMappingService, 'active');
                    this._attachFieldConfiguratorListeners(rootElement, instance.fieldMappingService);

                } catch (error) {
                    console.error('Failed to initialize field mappings:', error);
                    const fieldsContainer = rootElement.querySelector('#fieldsContainer');
                    if (fieldsContainer) {
                        fieldsContainer.innerHTML = `
                            <div style="color: red; padding: 10px;">
                                <strong>Error loading field mappings:</strong><br>
                                ${error.message}
                            </div>
                        `;
                    }
                }

                return { success: true };

            } catch (error) {
                console.error('openFieldMapping error:', error);
                throw error;
            }
        }

        /**
         * Load API fields from OData and store them in fieldMappingService
         * @private
         */
        static async _loadApiFieldsInBackground(rootElement, fieldMappingService) {
            try {
                const eventId = fieldMappingService.currentEventId;
                let apiFields = null;

                if (eventId) {
                    const endpoint = `LS_LeadReport?$filter=EventId eq '${eventId}'&$top=1&$select=*&$format=json`;
                    const leadDataResponse = await this._callPortalODataAPI(endpoint);

                    if (leadDataResponse && leadDataResponse.d && leadDataResponse.d.results && leadDataResponse.d.results[0]) {
                        const sampleData = leadDataResponse.d.results[0];
                        apiFields = {};

                        for (const key in sampleData) {
                            if (key !== '__metadata') {
                                apiFields[key] = key;
                            }
                        }
                    }
                }

                if (!apiFields) {
                    apiFields = await this._loadFieldsFromMetadata();
                }

                if (apiFields && Object.keys(apiFields).length > 0) {
                    fieldMappingService.apiFields = apiFields;
                }
            } catch (apiError) {
                console.warn('[Background Load] Failed to load API fields:', apiError);
            }
        }

        /**
         * Load fields from OData $metadata (for events without contacts)
         * @private
         */
        static async _loadFieldsFromMetadata() {
            try {
                if (!SalesforceLeadLib._portalConfig) {
                    return null;
                }

                const { serverUrl, apiName, user, password } = SalesforceLeadLib._portalConfig;
                const metadataUrl = `${serverUrl}/${apiName}/$metadata`;

                const credentials = btoa(`${user}:${password}`);

                const response = await fetch(metadataUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Accept': 'application/xml',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
                }

                const xmlText = await response.text();

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

                const parseError = xmlDoc.querySelector('parsererror');
                if (parseError) {
                    return null;
                }

                const entityTypes = xmlDoc.getElementsByTagName('EntityType');

                let targetEntity = null;

                for (let entity of entityTypes) {
                    const entityName = entity.getAttribute('Name');
                    if (entityName === 'LS_LeadReport') {
                        targetEntity = entity;
                        break;
                    }
                }

                if (!targetEntity) {
                    return null;
                }

                const properties = targetEntity.getElementsByTagName('Property');

                const apiFields = {};

                // 'Id' is kept: it must be mappable to LS_LeadId__c (upsert key), so it is
                // intentionally NOT excluded here.
                const excludedFields = ['__metadata', 'CreatedDate', 'LastModifiedDate', 'SystemModstamp', 'IsDeleted'];

                for (let prop of properties) {
                    const name = prop.getAttribute('Name');
                    if (name && !excludedFields.includes(name)) {
                        apiFields[name] = name;
                    }
                }

                return apiFields;

            } catch (error) {
                return null;
            }
        }

        /**
         * Save field mapping if modified
         * @param {string} eventId - Event ID
         * @returns {Promise<boolean>} - Promise that resolves to true if saved successfully
         */
        static async saveFieldMapping(eventId) {
            try {
                console.log('[saveFieldMapping] Called with eventId:', eventId);

                let container = document.querySelector('#fieldmappings-container');
                if (!container || !container._fieldMappingService) {
                    container = document.querySelector('#fieldConfiguratorContainer');
                }

                if (!container || !container._fieldMappingService) {
                    console.warn('[saveFieldMapping] Field mapping service not found in any container');
                    return Promise.resolve(false);
                }

                const fieldMappingService = container._fieldMappingService;
                console.log('[saveFieldMapping] fieldMappingService.currentEventId:', fieldMappingService.currentEventId);
                console.log('[saveFieldMapping] fieldMappingService.modified:', fieldMappingService.modified);

                // Always use the service's currentEventId (may differ from param)
                const saveEventId = fieldMappingService.currentEventId || eventId;
                console.log('[saveFieldMapping] Using saveEventId:', saveEventId);

                if (!fieldMappingService.modified) {
                    console.log('[saveFieldMapping] No modifications to save');
                    return Promise.resolve(true);
                }

                fieldMappingService.saveConfig();
                const success = await fieldMappingService.saveFieldMappingsToAPI('bulk_save', 'auto_save');

                if (success) {
                    console.log('Field mappings saved successfully');
                    fieldMappingService.modified = false;
                    return Promise.resolve(true);
                } else {
                    console.error('Failed to save field mappings to API');
                    return Promise.resolve(false);
                }

            } catch (error) {
                console.error('Error saving field mappings:', error);
                return Promise.reject(error);
            }
        }

        /**
         * Show a toast notification
         * @private
         */
        static _showToast(message, type = 'success') {
            // Delegates to the shared toast implementation (single visual source).
            showModernToast(message, type, 3000);
        }

        /**
         * Render fields grid for Field Configurator
         * @private
         */
        static _renderFieldsGrid(rootElement, fieldMappingService, currentFilter) {
            const fieldsContainer = rootElement.querySelector('#fieldsContainer');
            if (!fieldsContainer) return;

            currentFilter = currentFilter || 'active';
            const standardSalesforceFields = STANDARD_SALESFORCE_LEAD_FIELDS;
            const fieldConfig = fieldMappingService.fieldConfig?.config?.fields || [];
            const customLabels = fieldMappingService.customLabels || {};
            const apiFields = fieldMappingService.apiFields || {};
            const allFields = [];
            const processedFields = new Set();

            for (const fieldName in apiFields) {
                if (apiFields.hasOwnProperty(fieldName) && !processedFields.has(fieldName)) {
                    const isStandardSalesforce = standardSalesforceFields.hasOwnProperty(fieldName);
                    const sfInfo = isStandardSalesforce ? standardSalesforceFields[fieldName] : null;
                    const config = fieldConfig.find(f => f.fieldName === fieldName);
                    const customLabel = customLabels[fieldName];

                    const defaultLabel = sfInfo ? sfInfo.label : fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();

                    const isRequired = sfInfo ? sfInfo.required : false;
                    let isActive;
                    if (config) {
                        isActive = config.active === true;
                    } else {
                        // No config = inactive by default (must be explicitly activated in settings)
                        // Exception: required fields (LastName, Company) are always active
                        isActive = isRequired;
                    }

                    allFields.push({
                        name: fieldName,
                        label: customLabel || defaultLabel,
                        defaultLabel: defaultLabel,
                        hasCustomLabel: !!customLabel,
                        customLabel: customLabel || null,
                        active: isActive,
                        required: isRequired,
                        isCustomField: false,
                        isApiField: true,
                        isStandardSalesforce: isStandardSalesforce
                    });
                    processedFields.add(fieldName);
                }
            }

            if (Object.keys(apiFields).length === 0) {
                for (const fieldName in standardSalesforceFields) {
                    if (!processedFields.has(fieldName)) {
                        const sfInfo = standardSalesforceFields[fieldName];
                        const config = fieldConfig.find(f => f.fieldName === fieldName);
                        const customLabel = customLabels[fieldName];
                        const defaultLabel = sfInfo.label;

                        const isRequired = sfInfo.required || false;
                        let isActive = config ? config.active === true : isRequired;

                        allFields.push({
                            name: fieldName,
                            label: customLabel || defaultLabel,
                            defaultLabel: defaultLabel,
                            hasCustomLabel: !!customLabel,
                            customLabel: customLabel || null,
                            active: isActive,
                            required: isRequired,
                            isCustomField: false,
                            isApiField: false,
                            isStandardSalesforce: true
                        });
                        processedFields.add(fieldName);
                    }
                }
            }

            const customFields = fieldMappingService.customFields || [];
            customFields.forEach(cf => {
                const fieldName = cf.sfFieldName || cf.fieldName || cf.name || 'Unnamed';
                const customLabel = customLabels[fieldName];
                allFields.push({
                    name: fieldName,
                    label: customLabel || cf.label || fieldName,
                    defaultLabel: cf.label || fieldName,
                    hasCustomLabel: !!customLabel,
                    customLabel: customLabel || null,
                    value: cf.value || '',
                    active: cf.active === true,
                    required: false,
                    isCustomField: true,
                    id: cf.id
                });
            });

            let filteredFields = allFields.filter(field => {
                if (currentFilter === 'custom') return field.isCustomField;
                if (currentFilter === 'active') return field.active;
                if (currentFilter === 'inactive') return !field.active;
                if (currentFilter === 'required') return field.required;
                return true; // 'all'
            });

            const activeCount = allFields.filter(f => f.active).length;
            const inactiveCount = allFields.filter(f => !f.active).length;
            const customCount = allFields.filter(f => f.isCustomField).length;

            rootElement.querySelector('#totalFieldsCount').textContent = allFields.length;
            rootElement.querySelector('#activeFieldsCount').textContent = activeCount;
            rootElement.querySelector('#inactiveFieldsCount').textContent = inactiveCount;
            rootElement.querySelector('#customFieldsCount').textContent = customCount;

            const addBtn = rootElement.querySelector('#addCustomFieldBtn');
            if (addBtn) {
                addBtn.style.display = currentFilter === 'custom' ? 'flex' : 'none';
            }

            if (filteredFields.length === 0) {
                const labels = { all: 'All Fields', active: 'Active Fields', inactive: 'Inactive Fields', required: 'Required Fields', custom: 'Custom Fields' };
                fieldsContainer.innerHTML = `
                    <div class="sf-empty">
                        <i class="fa-solid fa-magnifying-glass sf-empty__icon" aria-hidden="true"></i>
                        <div class="sf-empty__title">No fields found</div>
                        <p class="sf-empty__hint">No ${labels[currentFilter] || currentFilter} match your criteria</p>
                    </div>
                `;
            } else {
                let html = '<div class="sf-fieldmap-grid">';

                filteredFields.forEach(field => {
                    const isActive = field.active || field.required;
                    const isRequired = field.required;
                    const isCustom = field.isCustomField;

                    html += `
                        <label class="field-item sf-fieldmap-card${isRequired ? ' required' : ''}${isActive ? ' active' : ''}${isCustom ? ' user-custom-field' : ''}"
                               data-field="${field.name}"
                               data-is-custom="${isCustom}"
                               data-field-id="${field.id || ''}">
                            <span class="sf-toggle">
                                <input type="checkbox" class="field-checkbox"
                                       ${isActive ? 'checked' : ''}
                                       ${isRequired ? 'disabled' : ''}
                                       role="switch" aria-checked="${isActive}"
                                       aria-label="${field.name}" />
                                <span class="sf-toggle__track"></span>
                            </span>
                            <div class="field-info" style="flex: 1; min-width: 0;">
                                ${isCustom ? `
                                    <div class="field-label-with-flags" style="display: flex; flex-direction: column; gap: 2px;">
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span class="sf-fieldmap-card__name">${field.label}</span>
                                            <span class="sf-pill sf-pill--accent sf-pill--xs">CUSTOM</span>
                                            <button class="edit-custom-field-btn sf-icon-btn"
                                                    data-field-id="${field.id || ''}"
                                                    data-field-name="${field.name}"
                                                    title="Edit custom field"
                                                    aria-label="Edit custom field ${field.name}"
                                                    style="margin-left: auto; width: 26px; height: 26px; font-size: 13px;"
                                                    onclick="event.stopPropagation();">
                                                <i class="fa-solid fa-pen" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div class="sf-fieldmap-card__mapping">
                                            <span class="sf-fieldmap-card__muted">SF:</span> ${field.name}
                                        </div>
                                    </div>
                                    <input type="text" class="field-input field-value-input custom-field-value-input sf-input"
                                           data-custom-field="true"
                                           data-custom-field-id="${field.id || ''}"
                                           data-field-id="${field.id || ''}"
                                           data-field-name="${field.name}"
                                           data-sf-field="${field.name}"
                                           value="${field.value || ''}"
                                           placeholder="Enter default value..."
                                           style="margin-top: 6px;"
                                           onclick="event.stopPropagation();">
                                ` : `
                                    <div class="sf-fieldmap-card__name">
                                        <span class="sf-fieldmap-card__muted">LS:</span> ${field.name}
                                        ${isRequired ? '<span class="sf-pill sf-pill--warning sf-pill--xs" style="margin-left: 6px;">REQUIRED</span>' : ''}
                                        ${isNonWritableSalesforceField(field.name) ? '<span class="sf-pill sf-pill--info sf-pill--xs" style="margin-left: 6px;" title="Salesforce system field — it cannot be a mapping TARGET, but you may map it as a SOURCE to a writable custom field.">SYSTEM</span>' : ''}
                                    </div>
                                    ${field.hasCustomLabel && field.customLabel !== field.name ? `<div class="sf-fieldmap-card__mapping"><i class="fa-solid fa-arrow-right-long" aria-hidden="true" style="font-size: 10px; margin-right: 4px;"></i>SF: ${field.customLabel}</div>` : ''}
                                `}
                            </div>
                            ${isCustom ? `
                                <button class="delete-custom-field-btn sf-icon-btn"
                                        data-field-id="${field.id || ''}"
                                        data-field-name="${field.name}"
                                        title="Delete custom field"
                                        aria-label="Delete custom field ${field.name}"
                                        style="width: 26px; height: 26px; font-size: 13px;"
                                        onclick="event.stopPropagation();">
                                    <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                                </button>
                            ` : !isRequired ? `
                                <button class="edit-field-label-btn sf-icon-btn" data-field-name="${field.name}"
                                        title="${field.name === 'Id' ? 'Set SF External ID field name (e.g. LS_LeadId__c)' : 'Edit SF target field'}"
                                        aria-label="Edit SF target field for ${field.name}"
                                        style="width: 26px; height: 26px; font-size: 13px;"
                                        onclick="event.stopPropagation();">
                                    <i class="fa-solid fa-pen" aria-hidden="true"></i>
                                </button>
                            ` : ''}
                        </label>
                    `;
                });

                html += '</div>';
                fieldsContainer.innerHTML = html;

                this._attachInlineListeners(rootElement, fieldMappingService);
            }
        }

        /**
         * Attach all listeners inline after rendering (optimized single pass)
         * @private
         */
        static _attachInlineListeners(rootElement, fieldMappingService) {
            rootElement.querySelectorAll('.field-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', async (e) => {
                    const fieldItem = e.target.closest('.field-item');
                    const fieldName = fieldItem.getAttribute('data-field');
                    const isCustomField = fieldItem.getAttribute('data-is-custom') === 'true';
                    const fieldId = fieldItem.getAttribute('data-field-id');
                    const isActive = e.target.checked;

                    try {
                        if (isCustomField && fieldId) {
                            const customField = (fieldMappingService.customFields || []).find(cf => cf.id === fieldId);
                            if (customField) {
                                customField.active = isActive;
                                fieldMappingService.modified = true;
                                fieldMappingService.saveConfig();

                                if (fieldMappingService.currentEventId) {
                                    await fieldMappingService.saveFieldMappingsToAPI(fieldName, isActive ? 'custom_activate' : 'custom_deactivate');
                                }
                            }
                        } else {
                            if (!fieldMappingService.fieldConfig.config) {
                                fieldMappingService.fieldConfig.config = { fields: [] };
                            }

                            const existingIndex = fieldMappingService.fieldConfig.config.fields.findIndex(
                                f => f.fieldName === fieldName
                            );

                            if (existingIndex >= 0) {
                                fieldMappingService.fieldConfig.config.fields[existingIndex].active = isActive;
                            } else {
                                fieldMappingService.fieldConfig.config.fields.push({
                                    fieldName: fieldName,
                                    active: isActive
                                });
                            }

                            fieldMappingService.modified = true;
                            fieldMappingService.saveConfig();

                            if (fieldMappingService.currentEventId) {
                                await fieldMappingService.saveFieldMappingsToAPI(fieldName, isActive ? 'activate' : 'deactivate');
                            }
                        }

                        // Update field item styling
                        fieldItem.classList.toggle('active', isActive);
                        e.target.setAttribute('aria-checked', String(isActive));

                        SalesforceLeadLib._updateStatisticsCounter(rootElement, fieldMappingService);

                        // Re-render grid if filter is 'active' or 'inactive' to show/hide the field immediately
                        const currentFilter = rootElement._currentFilter || 'active';
                        if (currentFilter === 'active' || currentFilter === 'inactive') {
                            SalesforceLeadLib._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);
                        }
                    } catch (error) {
                        console.error('Failed to toggle field:', error);
                        e.target.checked = !isActive;
                    }
                });
            });

            // Delete custom field listeners
            rootElement.querySelectorAll('.delete-custom-field-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const fieldId = button.getAttribute('data-field-id');
                    const fieldName = button.getAttribute('data-field-name');

                    // Use modern confirmation dialog
                    const confirmed = await showConfirmDialog(
                        'Delete Custom Field?',
                        `Are you sure you want to delete the custom field "${fieldName}"?\n\nThis action cannot be undone.`,
                        {
                            confirmText: 'Delete',
                            cancelText: 'Cancel',
                            type: 'danger'
                        }
                    );

                    if (confirmed) {
                        try {
                            fieldMappingService.customFields = (fieldMappingService.customFields || []).filter(
                                cf => cf.id !== fieldId
                            );
                            fieldMappingService.saveConfig();

                            if (fieldMappingService.currentEventId) {
                                await fieldMappingService.saveFieldMappingsToAPI(fieldName, 'custom_field_delete');
                            }

                            const currentFilter = rootElement._currentFilter || 'custom';
                            SalesforceLeadLib._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);
                            SalesforceLeadLib._showToast(`Custom field "${fieldName}" deleted`, 'success');
                        } catch (error) {
                            console.error('Failed to delete custom field:', error);
                            SalesforceLeadLib._showToast('Failed to delete: ' + error.message, 'error');
                        }
                    }
                });
            });

            // Edit custom field listeners
            rootElement.querySelectorAll('.edit-custom-field-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const fieldId = button.getAttribute('data-field-id');
                    const fieldName = button.getAttribute('data-field-name');
                    SalesforceLeadLib._openEditCustomFieldModal(rootElement, fieldMappingService, fieldId, fieldName);
                });
            });

            // Edit field label listeners (for standard fields)
            rootElement.querySelectorAll('.edit-field-label-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const fieldName = button.getAttribute('data-field-name');
                    SalesforceLeadLib._openEditFieldLabelModal(rootElement, fieldMappingService, fieldName);
                });
            });

            // Custom field value input listeners (debounced)
            rootElement.querySelectorAll('.custom-field-value-input').forEach(input => {
                let saveTimer;
                input.addEventListener('input', (e) => {
                    const fieldId = e.target.getAttribute('data-field-id');
                    const fieldName = e.target.getAttribute('data-field-name');
                    const newValue = e.target.value;

                    if (saveTimer) clearTimeout(saveTimer);
                    saveTimer = setTimeout(async () => {
                        try {
                            const customField = (fieldMappingService.customFields || []).find(cf => cf.id === fieldId);
                            if (customField) {
                                customField.value = newValue;
                                fieldMappingService.saveConfig();
                                if (fieldMappingService.currentEventId) {
                                    await fieldMappingService.saveFieldMappingsToAPI(fieldName, 'update');
                                }
                            }
                        } catch (error) {
                            console.error('Failed to update custom field value:', error);
                        }
                    }, 500);
                });
            });
        }

        /**
         * Attach event listeners for Field Configurator
         * @private
         */
        static _attachFieldConfiguratorListeners(rootElement, fieldMappingService) {
            // Search functionality
            const searchField = rootElement.querySelector('#searchField');
            if (searchField) {
                searchField.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const fieldItems = rootElement.querySelectorAll('.field-item');

                    fieldItems.forEach(item => {
                        // Get the first div inside the field-item (contains label and field name)
                        const labelDiv = item.querySelector('div > div');
                        if (labelDiv) {
                            const label = labelDiv.textContent.toLowerCase();
                            item.style.display = label.includes(searchTerm) ? 'flex' : 'none';
                        }
                    });
                });
            }

            // Filter tabs - RE-RENDER the grid when clicked
            const filterTabs = rootElement.querySelectorAll('.filter-tab');
            filterTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Update active tab styling (segmented control state via classes only)
                    filterTabs.forEach(t => {
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');

                    // Get filter and RE-RENDER the grid
                    const filter = tab.getAttribute('data-filter');
                    rootElement._currentFilter = filter;

                    // Re-render the grid with the new filter (listeners attached inline)
                    SalesforceLeadLib._renderFieldsGrid(rootElement, rootElement._fieldMappingService, filter);
                });
            });

            // Add Custom Field button
            const addCustomFieldBtn = rootElement.querySelector('#addCustomFieldBtn');
            if (addCustomFieldBtn) {
                addCustomFieldBtn.addEventListener('click', () => {
                    this._openAddCustomFieldModal(rootElement, fieldMappingService);
                });
            }

            // Cancel button - navigates back without saving pending changes
            const cancelBtn = rootElement.querySelector('#settings-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', async () => {
                    // Check if there are unsaved changes
                    if (fieldMappingService.modified) {
                        const confirmed = await showConfirmDialog(
                            'Discard Changes?',
                            'You have unsaved changes. Are you sure you want to discard them?',
                            { confirmText: 'Discard', cancelText: 'Keep Editing' }
                        );
                        if (!confirmed) {
                            return;
                        }
                        // Reset modified flag
                        fieldMappingService.modified = false;
                    }

                    // Navigate back using WinJS navigation if available
                    if (typeof WinJS !== 'undefined' && WinJS.Navigation && WinJS.Navigation.back) {
                        WinJS.Navigation.back();
                    } else if (window.history && window.history.back) {
                        window.history.back();
                    }
                });
            }

            // Save button
            const saveBtn = rootElement.querySelector('#settings-save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', async () => {
                    try {
                        // Save to localStorage first
                        fieldMappingService.saveConfig();
                        console.log('Field configuration saved locally');

                        // Reset modified flag after save
                        fieldMappingService.modified = false;

                        // Check if we're in localStorage-only mode (no eventId means no API persistence)
                        if (!fieldMappingService.currentEventId) {
                            console.log('localStorage-only mode: Configuration saved locally');
                            SalesforceLeadLib._showToast('Configuration saved locally!', 'success');
                            return;
                        }

                        // Save to LS_FieldMappings database
                        const success = await fieldMappingService.saveFieldMappingsToAPI('bulk_save', 'manual_save');

                        if (success) {
                            console.log('Field configuration saved to database successfully');
                            SalesforceLeadLib._showToast('Field configuration saved successfully!', 'success');
                        } else {
                            console.warn('Saved locally but database save failed');
                            SalesforceLeadLib._showToast('Configuration saved locally, but database sync failed. Please try again.', 'error');
                        }
                    } catch (error) {
                        console.error('Failed to save configuration:', error);
                        SalesforceLeadLib._showToast('Failed to save configuration: ' + error.message, 'error');
                    }
                });
            }

            // Salesforce Connect/Disconnect buttons in CRM Settings header
            const sfConnectBtn = rootElement.querySelector('#sf-connect-btn');
            const sfDisconnectBtn = rootElement.querySelector('#sf-disconnect-btn');

            if (sfConnectBtn) {
                sfConnectBtn.addEventListener('click', () => {
                    this._handleSalesforceConnectInSettings(rootElement);
                });
            }

            if (sfDisconnectBtn) {
                sfDisconnectBtn.addEventListener('click', () => {
                    this._handleSalesforceDisconnectInSettings(rootElement);
                });
            }

            // Check initial Salesforce connection status
            this._checkSalesforceConnectionInSettings(rootElement);
        }

        /**
         * Open Add Custom Field modal using native <dialog> for proper z-index
         * @private
         */
        static async _openAddCustomFieldModal(rootElement, fieldMappingService) {
            // Use native dialog for proper stacking above WinJS panels
            const result = await showAddCustomFieldDialog({
                saveText: 'Save Field',
                cancelText: 'Cancel'
            });

            // If cancelled, result will be null
            if (!result) {
                return;
            }

            const { fieldName, fieldValue } = result;
            // Validation already done in the dialog — fieldName is guaranteed valid here

            try {
                // Add custom field via fieldMappingService
                const newField = {
                    id: Date.now().toString(),
                    sfFieldName: fieldName,
                    fieldName: fieldName,
                    name: fieldName,
                    label: fieldName,
                    value: fieldValue,
                    active: true,
                    isCustomField: true
                };

                fieldMappingService.customFields = fieldMappingService.customFields || [];
                fieldMappingService.customFields.push(newField);

                // Mark as modified
                fieldMappingService.modified = true;

                // Save to localStorage
                fieldMappingService.saveConfig();

                // Save to database
                if (fieldMappingService.currentEventId) {
                    await fieldMappingService.saveFieldMappingsToAPI(fieldName, 'custom_field_add');
                    console.log('Custom field added and saved to database:', newField);
                } else {
                    console.log('Custom field added (localStorage only - no eventId):', newField);
                }

                // Re-render grid to show new field (_renderFieldsGrid calls _attachInlineListeners internally)
                rootElement._currentFilter = 'custom';
                this._renderFieldsGrid(rootElement, fieldMappingService, 'custom');

                // Update active tab styling
                const filterTabs = rootElement.querySelectorAll('.filter-tab');
                filterTabs.forEach(t => {
                    const isCustomTab = t.getAttribute('data-filter') === 'custom';
                    t.classList.toggle('active', isCustomTab);
                    t.setAttribute('aria-selected', String(isCustomTab));
                });

                SalesforceLeadLib._showToast('Custom field added successfully!', 'success');

            } catch (error) {
                console.error('Failed to add custom field:', error);
                SalesforceLeadLib._showToast('Failed to add custom field: ' + error.message, 'error');
            }
        }


        /**
         * Update statistics counter without re-rendering the grid
         * @private
         */
        static _updateStatisticsCounter(rootElement, fieldMappingService) {
            // Use global constant for standard Salesforce Lead fields
            const standardSalesforceFields = STANDARD_SALESFORCE_LEAD_FIELDS;

            // Get field configuration
            const fieldConfig = fieldMappingService.fieldConfig?.config?.fields || [];
            const apiFields = fieldMappingService.apiFields || {};

            // Build ALL fields list - combine API fields with standard Salesforce fields
            const allFields = [];
            const processedFields = new Set();

            // Add all fields from API.
            // isActive must use the SAME rule as _renderFieldsGrid (no config =
            // required fields count as active) — the two used to disagree, so
            // toggling a field made the Active counter jump to a wrong value.
            for (const fieldName in apiFields) {
                if (apiFields.hasOwnProperty(fieldName) && !processedFields.has(fieldName)) {
                    const isStandardSalesforce = standardSalesforceFields.hasOwnProperty(fieldName);
                    const sfInfo = isStandardSalesforce ? standardSalesforceFields[fieldName] : null;
                    const config = fieldConfig.find(f => f.fieldName === fieldName);
                    const isRequired = sfInfo ? sfInfo.required : false;
                    const isActive = config ? config.active === true : isRequired;

                    allFields.push({
                        name: fieldName,
                        active: isActive,
                        required: isRequired,
                        isCustomField: false
                    });
                    processedFields.add(fieldName);
                }
            }

            // Fallback to standard fields if no API fields
            if (Object.keys(apiFields).length === 0) {
                for (const fieldName in standardSalesforceFields) {
                    const sfInfo = standardSalesforceFields[fieldName];
                    const config = fieldConfig.find(f => f.fieldName === fieldName);
                    const isRequired = sfInfo.required || false;
                    const isActive = config ? config.active === true : isRequired;

                    allFields.push({
                        name: fieldName,
                        active: isActive,
                        required: isRequired,
                        isCustomField: false
                    });
                }
            }

            // Add custom fields
            const customFields = fieldMappingService.customFields || [];
            customFields.forEach(cf => {
                const fieldName = cf.sfFieldName || cf.fieldName || cf.name || 'Unnamed';
                allFields.push({
                    name: fieldName,
                    active: cf.active === true,
                    required: false,
                    isCustomField: true,
                    id: cf.id
                });
            });

            // Calculate statistics
            const activeCount = allFields.filter(f => f.active).length;
            const inactiveCount = allFields.filter(f => !f.active).length;
            const customCount = allFields.filter(f => f.isCustomField).length;

            // Update statistics elements
            const totalFieldsCountEl = rootElement.querySelector('#totalFieldsCount');
            const activeFieldsCountEl = rootElement.querySelector('#activeFieldsCount');
            const inactiveFieldsCountEl = rootElement.querySelector('#inactiveFieldsCount');
            const customFieldsCountEl = rootElement.querySelector('#customFieldsCount');

            if (totalFieldsCountEl) totalFieldsCountEl.textContent = allFields.length;
            if (activeFieldsCountEl) activeFieldsCountEl.textContent = activeCount;
            if (inactiveFieldsCountEl) inactiveFieldsCountEl.textContent = inactiveCount;
            if (customFieldsCountEl) customFieldsCountEl.textContent = customCount;
        }


        /**
         * Open Edit Field Label modal using native <dialog> for proper z-index
         * @private
         */
        static async _openEditFieldLabelModal(rootElement, fieldMappingService, fieldName) {
            // Get current label
            const customLabels = fieldMappingService.customLabels || {};
            const currentLabel = customLabels[fieldName] || fieldName;

            // Use native dialog for proper stacking above WinJS panels
            const newLabel = await showEditLabelDialog('Edit Field Label', fieldName, currentLabel, {
                headerColor: '#3b82f6',
                saveText: 'Save Changes',
                cancelText: 'Cancel'
            });

            // If cancelled, newLabel will be null
            if (newLabel === null) {
                return;
            }

            // Reset to default OR an empty value → remove the custom mapping so the field
            // returns to its default behavior (no custom SF target). This is the way out of
            // a mapping whose original source name is itself a blocked system field.
            if (newLabel === '__RESET__' || !newLabel.trim()) {
                try {
                    if (fieldMappingService.customLabels) {
                        delete fieldMappingService.customLabels[fieldName];
                    }
                    const fc = fieldMappingService.getFieldConfig(fieldName);
                    if (fc) {
                        delete fc.customLabel;
                        fc.updatedAt = new Date().toISOString();
                    }
                    await fieldMappingService.saveFieldMappingsToAPI(fieldName, 'label');
                    SalesforceLeadLib._showToast(`"${fieldName}" mapping reset to default.`, 'success');
                    const currentFilter = rootElement._currentFilter || 'active';
                    this._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);
                } catch (error) {
                    console.error('Failed to reset mapping:', error);
                    SalesforceLeadLib._showToast('Failed to reset mapping: ' + error.message, 'error');
                }
                return;
            }

            // Guard: the SF TARGET must be writable. Salesforce rejects writes to its
            // system/audit/calculated fields, so mapping onto one would make every
            // transfer fail. Reject it here with a clear message.
            if (isNonWritableSalesforceField(newLabel)) {
                SalesforceLeadLib._showToast(
                    `"${newLabel.trim()}" is a read-only Salesforce system field and cannot be a mapping target. Use a writable field (e.g. a custom field ending in __c).`,
                    'error'
                );
                return;
            }

            try {
                // Update custom label in the customLabels dictionary
                fieldMappingService.customLabels = fieldMappingService.customLabels || {};
                fieldMappingService.customLabels[fieldName] = newLabel.trim();

                // ALSO update the customLabel in fieldConfig.config.fields[] to ensure sync
                const fieldConfig = fieldMappingService.getFieldConfig(fieldName);
                if (fieldConfig) {
                    fieldConfig.customLabel = newLabel.trim();
                    fieldConfig.updatedAt = new Date().toISOString();
                } else {
                    // If field doesn't exist in config, add it
                    if (!fieldMappingService.fieldConfig.config) {
                        fieldMappingService.fieldConfig.config = { fields: [] };
                    }
                    fieldMappingService.fieldConfig.config.fields.push({
                        fieldName: fieldName,
                        active: true,
                        customLabel: newLabel.trim(),
                        updatedAt: new Date().toISOString()
                    });
                }

                // Save to API (await to ensure persistence before page change)
                const saved = await fieldMappingService.saveFieldMappingsToAPI(fieldName, 'label');
                if (!saved) {
                    console.warn('Failed to save label to API');
                }

                console.log(`Label for field "${fieldName}" updated to "${newLabel}"`);

                // Re-render grid to show updated label (_renderFieldsGrid calls _attachInlineListeners internally)
                const currentFilter = rootElement._currentFilter || 'active';
                this._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);

            } catch (error) {
                console.error('Failed to update label:', error);
                SalesforceLeadLib._showToast('Failed to update label: ' + error.message, 'error');
            }
        }

        /**
         * Open Edit Custom Field modal
         * @private
         */
        static async _openEditCustomFieldModal(rootElement, fieldMappingService, fieldId, fieldName) {
            // Find the custom field. Match by id first, but fall back to the SF
            // field name: after a config reload the service holds fresh objects,
            // and older saved configs may carry a different (or no) id, so a
            // strict id match alone would wrongly report "not found".
            const customFields = fieldMappingService.customFields || [];
            const matchesName = (cf) => {
                const n = cf.sfFieldName || cf.fieldName || cf.name;
                return fieldName && n === fieldName;
            };
            let customField = null;
            if (fieldId) customField = customFields.find(cf => String(cf.id) === String(fieldId));
            if (!customField) customField = customFields.find(matchesName);

            if (!customField) {
                SalesforceLeadLib._showToast('Custom field not found', 'error');
                return;
            }

            // Heal a missing/legacy id so future edits and the config match
            if (!customField.id) {
                customField.id = `custom_${Date.now()}`;
            }

            const currentName = customField.sfFieldName || customField.fieldName || customField.name || '';
            const currentValue = customField.value || '';
            const currentLabel = customField.label || '';

            // Use native dialog for proper stacking above WinJS panels
            const result = await showEditCustomFieldDialog(currentName, currentValue, {
                headerColor: '#10b981',
                saveText: 'Save Changes',
                cancelText: 'Cancel',
                currentLabel: currentLabel
            });

            // If cancelled, result will be null
            if (result === null) {
                return;
            }

            try {
                // Store old name for comparison
                const oldName = customField.sfFieldName || customField.fieldName || customField.name;

                // Update sfFieldName, label, and value
                if (result.sfFieldName && result.sfFieldName !== '') {
                    customField.sfFieldName = result.sfFieldName;
                    customField.fieldName = result.sfFieldName;
                }
                customField.value = result.value;
                customField.label = result.label !== '' ? result.label : (customField.sfFieldName || currentName);

                // Save to config
                fieldMappingService.saveConfig();

                // Save to API if eventId is available
                if (fieldMappingService.currentEventId) {
                    await fieldMappingService.saveFieldMappingsToAPI(currentName, 'update');
                }

                console.log(`Custom field "${oldName}" updated — label: "${customField.label}", value: "${customField.value}"`);

                // Re-render grid (_renderFieldsGrid calls _attachInlineListeners internally)
                const currentFilter = rootElement._currentFilter || 'custom';
                SalesforceLeadLib._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);

                SalesforceLeadLib._showToast('Custom field updated successfully!', 'success');

            } catch (error) {
                console.error('Failed to update custom field:', error);
                SalesforceLeadLib._showToast('Failed to update custom field: ' + error.message, 'error');
            }
        }

        /**
         * Open CRM Test Export UI with data from LS_LeadReport
         * @param {HTMLElement} rootElement - Container for the UI
         * @param {string} eventId - Event UUID from UniqueRecordId table (null for localStorage-only mode)
         * @param {Object} options - Optional configuration
         * @param {number} options.recordId - RecordId for localStorage-only mode (used when eventId is null)
         */
        static async openCrmTestExport(rootElement, eventId, options = {}) {
            injectCSS();
            const localStorageOnlyMode = !eventId && options.recordId;
            const storageKey = localStorageOnlyMode ? `event_${options.recordId}` : eventId;
            // Skip lead data API call when we know there are no contacts (for instant display)
            const skipLeadDataCall = options.skipLeadDataCall || false;

            if (!rootElement) {
                throw new Error('rootElement is required');
            }

            if (!eventId && !options.recordId) {
                throw new Error('eventId (UUID) or options.recordId is required');
            }

            if (!this._portalConfig) {
                throw new Error('Library not initialized. Call init() first');
            }

            try {
                this.clear(rootElement);

                // Only show loading indicator if we need to make API calls
                if (!skipLeadDataCall) {
                    rootElement.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 300px;">
                            <span class="sf-spinner sf-spinner--lg"></span>
                            <p style="margin-top: 16px; font-size: 15px; color: var(--sf-text-2); font-family: var(--sf-font);" data-win-res="{textContent: 'sforce.loadingData'}">Loading data...</p>
                        </div>
                    `;

                    // Apply localization to loading message
                    if (typeof WinJS !== 'undefined' && WinJS.Resources && WinJS.Resources.processAll) {
                        WinJS.Resources.processAll(rootElement);
                    }
                }

                // Transform the data: use field names (keys) as values for preview
                let leadData = {};

                if (skipLeadDataCall) {
                    // Skip API call - use default field structure directly (instant)
                    console.log('[Test Mode] Skipping lead data API call - using default fields');
                    leadData = this._getDefaultLeadReportFields();
                } else {
                    // Load data from LS_LeadReport endpoint with EventId filter
                    // We only need one record to get the field structure
                    const endpoint = `LS_LeadReport?$filter=EventId eq '${eventId}'&$top=1&$format=json`;
                    const leadDataResponse = await this._callPortalODataAPI(endpoint);

                    // Extract first result
                    const rawLeadData = leadDataResponse && leadDataResponse.d && leadDataResponse.d.results && leadDataResponse.d.results[0];

                    if (rawLeadData) {
                        // We have real data - use field names as preview values
                        for (const key in rawLeadData) {
                            if (rawLeadData.hasOwnProperty(key) && key !== '__metadata') {
                                leadData[key] = key;
                            }
                        }
                    } else {
                        // No contacts for this event - use default field structure for preview
                        // This allows configuring field mappings even when there are no contacts yet
                        leadData = this._getDefaultLeadReportFields();
                    }
                }

                // Load field configuration from API or localStorage
                let configData = null;

                if (eventId) {
                    // Normal mode - load from API
                    configData = await this._loadFieldConfigFromAPI(eventId);
                } else if (localStorageOnlyMode) {
                    // localStorage-only mode - load from localStorage
                    configData = {
                        fieldConfig: this._loadFieldConfig(storageKey),
                        customFields: this._loadCustomFields(storageKey),
                        customLabels: this._loadCustomLabels(storageKey)
                    };
                }

                const fieldConfig = configData?.fieldConfig || null;
                const customFields = configData?.customFields || [];
                const customLabels = configData?.customLabels || {};

                // Sync fieldConfig + customLabels to instance so buildLeadDataFromItem can use them
                const instance = this._getInstance();
                if (instance) {
                    instance.fieldMappingService.customLabels = customLabels;
                    if (fieldConfig) {
                        instance.fieldMappingService.fieldConfig = fieldConfig;
                    }
                }

                const allFields = this._buildActiveFieldsList(leadData, fieldConfig, customFields, customLabels);

                // In test mode, use fakeDataGenerator to generate realistic fake data for transfer
                // Get all active field names for fake data generation
                const activeFieldNames = allFields.map(f => f.name);

                // Build custom field defaults from the customFields configuration
                // This allows custom fields to use their defined default values instead of "Test_fieldName"
                const customFieldDefaults = {};
                if (customFields && Array.isArray(customFields)) {
                    customFields.forEach(cf => {
                        const fieldName = cf.sfFieldName || cf.fieldName || cf.name;
                        if (fieldName && cf.value) {
                            customFieldDefaults[fieldName] = cf.value;
                        }
                    });
                    console.log('[Test Mode] Custom field defaults:', customFieldDefaults);
                }

                // Use the global fakeDataGenerator to fill empty fields with fake data
                let fakeDataForTransfer = {};
                if (window.fakeDataGenerator) {
                    const result = window.fakeDataGenerator.fillEmptyFields({}, activeFieldNames, customFieldDefaults);
                    fakeDataForTransfer = result.data;
                    console.log('[Test Mode] Generated fake data using fakeDataGenerator:', fakeDataForTransfer);
                } else {
                    console.warn('[Test Mode] fakeDataGenerator not available, using field names as values');
                }

                // Load previously saved test values from localStorage and merge with fake data
                const displayId = eventId || storageKey;
                const savedTestValues = this._loadTestFieldValues(displayId);
                if (savedTestValues && Object.keys(savedTestValues).length > 0) {
                    console.log('[Test Mode] Loaded saved test values from localStorage:', savedTestValues);
                    // Merge saved values (override generated fake data)
                    fakeDataForTransfer = { ...fakeDataForTransfer, ...savedTestValues };
                }

                allFields.forEach(field => {
                    // Get fake value for this field (may include saved values)
                    const fakeValue = fakeDataForTransfer[field.name] || '';
                    // Store for transfer
                    field.transferValue = fakeValue;
                    // Display fake value in UI (or field name as fallback if no fake data available)
                    field.value = fakeValue || field.name;
                });

                // Create a leadData object with fake values for transfer
                const testLeadData = { ...leadData };
                testLeadData._isTestMode = true;
                testLeadData._fakeData = fakeDataForTransfer;

                // Create HTML interface with editable inputs for test mode
                const htmlOptions = { isTestMode: true, eventId: displayId };
                const html = this._buildCrmExportHTML(testLeadData, allFields, `test-${displayId}`, htmlOptions);
                rootElement.innerHTML = html;

                // Apply WinJS resource strings for localization
                if (typeof WinJS !== 'undefined' && WinJS.Resources && WinJS.Resources.processAll) {
                    WinJS.Resources.processAll(rootElement);
                }

                // Attach event listeners with test mode options
                const listenerOptions = { isTestMode: true, eventId: displayId };
                this._attachCrmExportListeners(rootElement, testLeadData, allFields, listenerOptions);

                return { success: true, leadData };

            } catch (error) {
                console.error('openCrmTestExport error:', error);
                rootElement.innerHTML = `
                    <div style="padding: 20px; color: #dc2626;">
                        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;"><i class="fa-solid fa-circle-xmark"></i> Error Loading Test Data</h3>
                        <p>${error.message}</p>
                    </div>
                `;
                throw error;
            }
        }

        /**
         * Open CRM Export UI with real contact data
         * @param {HTMLElement} rootElement - Container for the UI
         * @param {string} contactId - Contact UUID from UniqueRecordId table
         */
        static async openCrmExport(rootElement, contactId) {
            injectCSS();
            if (!rootElement) {
                throw new Error('rootElement is required');
            }

            if (!contactId) {
                throw new Error('contactId (UUID) is required');
            }

            if (!this._portalConfig) {
                throw new Error('Library not initialized. Call init() first');
            }

            try {
                this.clear(rootElement);

                // Show loading indicator
                rootElement.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 300px;">
                        <span class="sf-spinner sf-spinner--lg"></span>
                        <p style="margin-top: 16px; font-size: 15px; color: var(--sf-text-2); font-family: var(--sf-font);" data-win-res="{textContent: 'sforce.loadingData'}">Loading lead data...</p>
                    </div>
                `;

                if (typeof WinJS !== 'undefined' && WinJS.Resources && WinJS.Resources.processAll) {
                    WinJS.Resources.processAll(rootElement);
                }

                // Using LS_LeadReportById with id parameter instead of $filter for better performance
                const endpoint = `LS_LeadReportById?id='${contactId}'&$format=json`;
                const leadDataResponse = await this._callPortalODataAPI(endpoint);

                // Extract first result
                const leadData = leadDataResponse && leadDataResponse.d && leadDataResponse.d.results && leadDataResponse.d.results[0];

                if (!leadData) {
                    throw new Error('No lead data found for this contact');
                }

                // Load field configuration for the event from API
                const eventId = leadData.EventId || leadData.VeranstaltungVIEWID;

                // Load from LS_FieldMappings database
                const configData = await this._loadFieldConfigFromAPI(eventId);

                const fieldConfig = configData?.fieldConfig || null;
                const customFields = configData?.customFields || [];
                const customLabels = configData?.customLabels || {};

                // Sync fieldConfig + customLabels to instance so buildLeadDataFromItem can use them
                const instance = this._getInstance();
                if (instance) {
                    instance.fieldMappingService.customLabels = customLabels;
                    if (fieldConfig) {
                        instance.fieldMappingService.fieldConfig = fieldConfig;
                    }
                }

                const allFields = this._buildActiveFieldsList(leadData, fieldConfig, customFields, customLabels);

                // Create HTML interface
                const html = this._buildCrmExportHTML(leadData, allFields, contactId);
                rootElement.innerHTML = html;

                // Apply WinJS resource strings for localization
                if (typeof WinJS !== 'undefined' && WinJS.Resources && WinJS.Resources.processAll) {
                    WinJS.Resources.processAll(rootElement);
                }

                // Attach event listeners
                this._attachCrmExportListeners(rootElement, leadData, allFields);

                return { success: true, leadData };

            } catch (error) {
                console.error('openCrmExport error:', error);
                rootElement.innerHTML = `
                    <div style="padding: 20px; color: #dc2626;">
                        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;"><i class="fa-solid fa-circle-xmark"></i> Error Loading Lead Data</h3>
                        <p>${error.message}</p>
                    </div>
                `;
                throw error;
            }
        }

        /**
         * Internal method to call Portal API endpoints
         * @private
         */
        static async _callPortalAPI(endpoint, params) {
            if (!this._portalConfig) {
                throw new Error('Portal configuration not initialized');
            }

            const url = `${this._portalConfig.baseUrl}/${endpoint}`;
            console.log('Calling Portal API:', url, params);

            try {
                // Create Basic Auth header
                const credentials = btoa(`${this._portalConfig.user}:${this._portalConfig.password}`);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(params)
                });

                if (!response.ok) {
                    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Portal API response:', data);
                return data;

            } catch (error) {
                console.error('Portal API call error:', error);
                throw error;
            }
        }

        /**
         * Internal method to call Portal OData API endpoints (GET)
         * @private
         */
        static async _callPortalODataAPI(endpoint) {
            if (!this._portalConfig) {
                throw new Error('Portal configuration not initialized');
            }

            const url = `${this._portalConfig.baseUrl}/${endpoint}`;

            try {
                // Create Basic Auth header
                const credentials = btoa(`${this._portalConfig.user}:${this._portalConfig.password}`);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('OData API error:', response.status, errorText);
                    throw new Error(`OData API call failed: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (jsonErr) {
                    // Bad control characters in data (e.g. in Description/Question fields) — sanitize
                    // eslint-disable-next-line no-control-regex
                    const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
                    data = JSON.parse(cleaned);
                }
                return data;

            } catch (error) {
                console.error('Portal OData API call error:', error.message);
                throw error;
            }
        }

        /**
         * Load field configuration from LS_FieldMappings API
         * @private
         */
        static async _loadFieldConfigFromAPI(eventId) {
            if (!eventId) {
                console.warn('No eventId provided for loading field config');
                return null;
            }

            try {
                const endpoint = `LS_FieldMappings?$filter=EventId eq '${eventId}'&$format=json`;
                const data = await this._callPortalODataAPI(endpoint);

                if (!data || !data.d || !data.d.results || data.d.results.length === 0) {
                    console.log('No field mappings found in database for event:', eventId);
                    return null;
                }

                const configRecord = data.d.results[0];

                if (configRecord.ConfigData) {
                    try {
                        const parsedConfig = JSON.parse(configRecord.ConfigData);
                        console.log('Loaded config from API:', parsedConfig);
                        return parsedConfig;
                    } catch (parseError) {
                        console.error('Failed to parse ConfigData from database:', parseError);
                        return null;
                    }
                } else {
                    console.log('Configuration record found but no ConfigData');
                    return null;
                }

            } catch (error) {
                console.error('Failed to load field config from API:', error);
                return null;
            }
        }

        /**
         * Load field configuration from localStorage
         * @private
         */
        static _loadFieldConfig(eventId) {
            try {
                // FieldMappingService uses 'salesforce_field_mapping' as the global key
                // This contains the config structure: { config: { fields: [...] } }
                const globalConfig = localStorage.getItem('salesforce_field_mapping');
                if (globalConfig) {
                    const parsed = JSON.parse(globalConfig);
                    // Return the full structure so _buildActiveFieldsList can access .config.fields
                    return parsed;
                }
                return { config: { fields: [] } };
            } catch (error) {
                console.error('Failed to load field config:', error);
                return { config: { fields: [] } };
            }
        }

        /**
         * Load custom fields from localStorage
         * @private
         */
        static _loadCustomFields(eventId) {
            try {
                const customFields = localStorage.getItem(`customFields_${eventId}`);
                return customFields ? JSON.parse(customFields) : [];
            } catch (error) {
                console.error('Failed to load custom fields:', error);
                return [];
            }
        }

        /**
         * Load custom labels from localStorage
         * @private
         */
        static _loadCustomLabels(eventId) {
            try {
                // Try to load from event-specific storage first
                const eventLabels = localStorage.getItem(`customLabels_${eventId}`);
                if (eventLabels) {
                    return JSON.parse(eventLabels);
                }

                // Fallback to global custom labels
                const globalLabels = localStorage.getItem('salesforce_custom_labels');
                return globalLabels ? JSON.parse(globalLabels) : {};
            } catch (error) {
                console.error('Failed to load custom labels:', error);
                return {};
            }
        }

        /**
         * Load edited test values from localStorage (for test mode only)
         * @private
         */
        static _loadTestFieldValues(eventId) {
            try {
                const testValues = localStorage.getItem(`testFieldValues_${eventId}`);
                return testValues ? JSON.parse(testValues) : {};
            } catch (error) {
                console.error('Failed to load test field values:', error);
                return {};
            }
        }

        /**
         * Save edited test values to localStorage (for test mode only)
         * @private
         */
        static _saveTestFieldValues(eventId, fieldValues) {
            try {
                localStorage.setItem(`testFieldValues_${eventId}`, JSON.stringify(fieldValues));
                console.log('[Test Mode] Saved test field values to localStorage:', fieldValues);
            } catch (error) {
                console.error('Failed to save test field values:', error);
            }
        }

        /**
         * Save a single test field value to localStorage
         * @private
         */
        static _saveTestFieldValue(eventId, fieldName, value) {
            const currentValues = this._loadTestFieldValues(eventId);
            currentValues[fieldName] = value;
            this._saveTestFieldValues(eventId, currentValues);
        }

        /**
         * Get default field structure for LS_LeadReport when no contacts exist
         * This allows previewing field mappings even when the event has no contacts yet
         * @private
         */
        static _getDefaultLeadReportFields() {
            // Return a structure with standard LS_LeadReport fields
            // Each field name is used as both key and value for preview
            const defaultFields = {
                // Standard Salesforce Lead fields
                'FirstName': 'FirstName',
                'LastName': 'LastName',
                'Company': 'Company',
                'Email': 'Email',
                'Phone': 'Phone',
                'MobilePhone': 'MobilePhone',
                'Title': 'Title',
                'Website': 'Website',
                'Street': 'Street',
                'City': 'City',
                'State': 'State',
                'PostalCode': 'PostalCode',
                'Country': 'Country',
                'Description': 'Description',
                'Industry': 'Industry',
                'AnnualRevenue': 'AnnualRevenue',
                'NumberOfEmployees': 'NumberOfEmployees',
                'LeadSource': 'LeadSource',
                'Status': 'Status',
                'Rating': 'Rating',
                'Salutation': 'Salutation',
                'Fax': 'Fax',
                // System/metadata fields from LS_LeadReport
                'Id': 'Id',
                'KontaktViewId': 'KontaktViewId',
                'EventId': 'EventId',
                'ContactId': 'ContactId'
            };
            return defaultFields;
        }

        /**
         * Build list of active fields with their values
         * Uses the same logic as _renderFieldsGrid for consistency between crmSettings and crmExport
         * @private
         */
        static _buildActiveFieldsList(leadData, fieldConfig, customFields, customLabels = {}) {
            // Use global constant for standard Salesforce Lead fields (same as _renderFieldsGrid)
            const standardSalesforceFields = STANDARD_SALESFORCE_LEAD_FIELDS;

            // Required fields that must always appear
            const requiredFieldNames = ['LastName', 'Company'];

            const allFields = [];
            const addedFieldNames = new Set();

            // Get field configuration array
            // Note: fieldConfig structure is { config: { fields: [...] } }
            const fieldConfigArray = fieldConfig?.config?.fields || [];
            const hasFieldConfig = fieldConfigArray.length > 0;

            // Helper function to check if field is active (same logic as _renderFieldsGrid)
            const isFieldActive = (fieldName, configField) => {
                const isStandardSalesforce = standardSalesforceFields.hasOwnProperty(fieldName);

                if (configField) {
                    // If config exists, field must be explicitly active (active === true)
                    return configField.active === true;
                } else {
                    // If no config, field is inactive by default (must be explicitly activated in settings)
                    return false;
                }
            };

            if (hasFieldConfig) {
                // Use field config from database
                fieldConfigArray.forEach(configField => {
                    const fieldName = configField.fieldName;

                    // No filtering - if user activated a field in CRM Settings, it appears in CRM Export
                    // Field value will be empty if not present in leadData

                    const isRequired = requiredFieldNames.includes(fieldName);
                    const isActive = isFieldActive(fieldName, configField);
                    const sfInfo = standardSalesforceFields[fieldName];

                    // Include if active OR required
                    if (isActive || isRequired) {
                        const customLabel = customLabels[fieldName];
                        const defaultLabel = sfInfo ? sfInfo.label : fieldName.replace(/([A-Z])/g, ' $1').trim();

                        // Special handling for Question/Answer fields:
                        // QuestionXX contains the question title, AnswersXX contains the actual answer
                        let fieldValue = leadData[fieldName] || '';
                        let displayLabel = customLabel || defaultLabel;

                        // Check if this is a QuestionXX field - use AnswersXX for value
                        const questionMatch = fieldName.match(/^Question(\d+)$/);
                        if (questionMatch) {
                            const num = questionMatch[1];
                            const answerFieldName = `Answers${num}`;
                            // Use the question title as label, answer as value
                            const questionTitle = leadData[fieldName];
                            if (questionTitle && !customLabel) {
                                displayLabel = questionTitle; // Use question text as label
                            }
                            fieldValue = leadData[answerFieldName] || '';
                        }

                        allFields.push({
                            name: fieldName,
                            label: displayLabel,
                            value: fieldValue,
                            required: isRequired,
                            isCustomField: false
                        });
                        addedFieldNames.add(fieldName);
                    }
                });

                // When config exists, only use fields that are explicitly in config and active
                // Do NOT auto-add standard SF fields that aren't in config
                // This ensures crmExport shows exactly what was configured in crmSettings

                // Only add required fields if they're missing (LastName, Company are mandatory for SF)
                requiredFieldNames.forEach(reqFieldName => {
                    if (!addedFieldNames.has(reqFieldName)) {
                        const sfInfo = standardSalesforceFields[reqFieldName];
                        const customLabel = customLabels[reqFieldName];
                        allFields.push({
                            name: reqFieldName,
                            label: customLabel || (sfInfo ? sfInfo.label : reqFieldName),
                            value: leadData[reqFieldName] || '',
                            required: true,
                            isCustomField: false
                        });
                        addedFieldNames.add(reqFieldName);
                    }
                });
            } else {
                // No config saved yet - only include required fields (LastName, Company)
                // All other fields are inactive by default until explicitly activated in CRM Settings
                requiredFieldNames.forEach(reqFieldName => {
                    if (!addedFieldNames.has(reqFieldName)) {
                        const sfInfo = standardSalesforceFields[reqFieldName];
                        const customLabel = customLabels[reqFieldName];
                        allFields.push({
                            name: reqFieldName,
                            label: customLabel || (sfInfo ? sfInfo.label : reqFieldName),
                            value: leadData[reqFieldName] || '',
                            required: true,
                            isCustomField: false
                        });
                        addedFieldNames.add(reqFieldName);
                    }
                });
            }

            // Add custom fields (only active ones)
            customFields.forEach(cf => {
                if (cf.active === true) {
                    const fieldName = cf.sfFieldName || cf.fieldName || cf.name;

                    // Avoid duplicates
                    if (!addedFieldNames.has(fieldName)) {
                        const customLabel = customLabels[fieldName];
                        allFields.push({
                            name: fieldName,
                            label: customLabel || cf.label || fieldName,
                            value: cf.value || leadData[fieldName] || '',
                            required: false,
                            isCustomField: true
                        });
                        addedFieldNames.add(fieldName);
                    }
                }
            });

            return allFields;
        }

        /** @private */
        static _escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /** @private */
        static _buildCrmExportHTML(leadData, allFields, contactId, options = {}) {
            const isTestMode = options.isTestMode || false;
            const eventId = options.eventId || null;

            const lastStatus = (leadData.LastExportStatus || '').toLowerCase();
            const lastMessage = leadData.LastExportMessage || '';
            const lastTimestamp = leadData.LastExportTimestamp || '';

            const hasPreviousExport = !!lastStatus;
            const bannerState = lastStatus === 'success' ? 'success' : lastStatus === 'duplicate' ? 'warning' : lastStatus === 'failed' ? 'error' : '';
            const bannerIcon = lastStatus === 'success' ? 'fa-circle-check' : lastStatus === 'duplicate' ? 'fa-triangle-exclamation' : lastStatus === 'failed' ? 'fa-circle-xmark' : 'fa-circle-info';
            const formattedDate = lastTimestamp ? (() => { try { const d = new Date(parseInt(lastTimestamp.replace(/\/Date\((\d+)\)\//, '$1'))); return d.toLocaleString(); } catch(e) { return lastTimestamp; } })() : '';
            const exportInfo = hasPreviousExport
                ? `<div id="export-status-banner" class="sf-export-banner${bannerState ? ` sf-export-banner--${bannerState}` : ''}">
                       <i class="fa-solid ${bannerIcon} sf-export-banner__icon" aria-hidden="true"></i>
                       <div>
                           <div class="sf-export-banner__title">${leadData.LastExportStatus}</div>
                           <div class="sf-export-banner__meta">
                               ${lastMessage ? this._escapeHtml(lastMessage) : ''}
                               ${formattedDate ? `• ${formattedDate}` : ''}
                           </div>
                       </div>
                   </div>`
                : '<div id="export-status-banner" style="display:none;"></div>';

            return `
                <div class="contenthost-background sf-export-root">
                    ${exportInfo}

                    <div class="sf-export-card" style="padding: 20px 24px; margin-bottom: 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
                        <div style="flex: 1; min-width: 250px;">
                            <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: var(--sf-text);" data-win-res="{textContent: 'sforce.title'}">
                                Transfer Lead to Salesforce
                            </h1>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                            <div id="api-status-user-card" class="sf-connection-chip">
                                <span id="api-status-indicator" class="sf-dot sf-dot--warning"></span>
                                <span id="api-status-text" class="sf-connection-chip__text" data-win-res="{textContent: 'sforce.statusDisconnected'}">Disconnected</span>
                                <div id="user-profile-section" class="sf-connection-chip__user">
                                    <span id="user-avatar-header" class="sf-avatar">?</span>
                                    <span id="user-name-header" class="sf-connection-chip__text"></span>
                                </div>
                            </div>

                            <button id="disconnect-sf-btn" class="sf-btn sf-btn--danger-outline" style="display: none;">
                                <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> <span data-win-res="{textContent: 'sforce.btnDisconnect'}">Disconnect</span>
                            </button>

                            <button id="sf-connect-btn" class="sf-btn sf-btn--primary">
                                <i class="fa-solid fa-plug" aria-hidden="true"></i> <span data-win-res="{textContent: 'sforce.btnConnect'}">Connect to Salesforce</span>
                            </button>

                            <button id="transferToSalesforceBtnHeader" class="transferToSalesforceBtn sf-btn sf-btn--success" style="display: none;">
                                <i class="fa-solid fa-paper-plane" aria-hidden="true"></i> <span data-win-res="{textContent: 'sforce.btnTransfer'}">Transfer to Salesforce</span>
                            </button>
                        </div>
                    </div>

                    <div class="sf-export-card" style="padding: 24px;">
                        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px;">
                            <div style="flex: 1; min-width: 200px;">
                                <h2 style="font-size: 17px; font-weight: 700; margin: 0 0 4px 0; color: var(--sf-text);" data-win-res="{textContent: 'sforce.leadInformation'}">
                                    Lead Information
                                </h2>
                                <div style="font-size: 13px; color: var(--sf-text-2); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <span data-win-res="{textContent: 'sforce.sourceLeadReport'}">Source: Lead Report</span>
                                    <span>•</span>
                                    <span>ID: ${this._escapeHtml(contactId)}</span>
                                    <span class="sf-pill sf-pill--success sf-pill--xs" data-win-res="{textContent: 'sforce.statusActive'}">Active</span>
                                    <span>${(() => { try { const raw = leadData.CreatedDate || ''; const ms = parseInt(raw.replace(/\/Date\((\d+)\)\//, '$1')); return ms ? 'Created: ' + new Date(ms).toLocaleDateString() : ''; } catch(e) { return ''; } })()}</span>
                                </div>
                            </div>
                            <div class="sf-tabs">
                                <button id="view-list-btn" class="view-toggle sf-tabs__tab is-active" data-view="list" aria-pressed="true">
                                    <i class="fa-solid fa-list" aria-hidden="true"></i>
                                    <span data-win-res="{textContent: 'sforce.viewList'}">List</span>
                                </button>
                                <button id="view-cards-btn" class="view-toggle sf-tabs__tab" data-view="cards" aria-pressed="false">
                                    <i class="fa-solid fa-grip" aria-hidden="true"></i>
                                    <span data-win-res="{textContent: 'sforce.viewCards'}">Cards</span>
                                </button>
                            </div>
                        </div>

                        <div id="list-view" style="overflow-x: auto;">
                            <table class="sf-export-table">
                                <thead>
                                    <tr>
                                        <th data-win-res="{textContent: 'sforce.colFieldName'}">FIELD NAME</th>
                                        <th data-win-res="{textContent: 'sforce.colValue'}">VALUE</th>
                                        <th data-win-res="{textContent: 'sforce.colStatus'}">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${allFields.map(field => `
                                        <tr>
                                            <td>
                                                <div style="font-weight: 500;">${this._escapeHtml(field.label || field.name)}</div>
                                                ${field.label && field.label !== field.name
                                                    ? `<div style="font-size: 11px; color: var(--sf-text-2);">${this._escapeHtml(field.name)}</div>`
                                                    : ``
                                                }
                                                ${field.isCustomField
                                                    ? `<div style="font-size: 12px; color: var(--sf-accent);" data-win-res="{textContent: 'sforce.customField'}">Custom</div>`
                                                    : ``
                                                }
                                            </td>
                                            <td>
                                                ${isTestMode
                                                    ? `<input type="text"
                                                        class="test-field-input sf-input"
                                                        data-field-name="${this._escapeHtml(field.name)}"
                                                        data-event-id="${this._escapeHtml(eventId || '')}"
                                                        value="${this._escapeHtml(field.value || '')}"
                                                        placeholder="Enter test value..."
                                                    />`
                                                    : (field.value ? this._escapeHtml(field.value) : '<span style="font-style: italic; color: var(--sf-text-muted);" data-win-res="{textContent: \'sforce.noValue\'}">No value</span>')
                                                }
                                            </td>
                                            <td>
                                                <span class="sf-pill sf-pill--success sf-pill--xs" data-win-res="{textContent: 'sforce.statusActive'}">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div id="cards-view" style="display: none; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                            ${allFields.map(field => `
                                <div class="sf-field-card">
                                    ${field.isCustomField
                                        ? `<div style="font-size: 12px; color: var(--sf-accent); margin-bottom: 4px;" data-win-res="{textContent: 'sforce.customField'}">Custom</div>`
                                        : ``
                                    }
                                    <div style="font-weight: 600; margin-bottom: 4px; color: var(--sf-text);">${this._escapeHtml(field.label || field.name)}</div>
                                    ${field.label && field.label !== field.name
                                        ? `<div style="font-size: 11px; margin-bottom: 8px; color: var(--sf-text-2);">${this._escapeHtml(field.name)}</div>`
                                        : `<div style="margin-bottom: 8px;"></div>`
                                    }
                                    <div style="font-size: 14px; margin-bottom: 8px; color: var(--sf-text);">
                                        ${isTestMode
                                            ? `<input type="text"
                                                class="test-field-input sf-input"
                                                data-field-name="${this._escapeHtml(field.name)}"
                                                data-event-id="${this._escapeHtml(eventId || '')}"
                                                value="${this._escapeHtml(field.value || '')}"
                                                placeholder="Enter test value..."
                                            />`
                                            : (field.value ? this._escapeHtml(field.value) : '<span style="font-style: italic; color: var(--sf-text-muted);" data-win-res="{textContent: \'sforce.noValue\'}">No value</span>')
                                        }
                                    </div>
                                    <span class="sf-pill sf-pill--success sf-pill--xs" data-win-res="{textContent: 'sforce.statusActive'}">
                                        Active
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Attachments Section -->
                    ${(() => {
                        const attachmentIdList = leadData.AttachmentIdList;
                        if (!attachmentIdList) return '';
                        const ids = attachmentIdList.split(',').filter(id => id.trim() !== '');
                        if (ids.length === 0) return '';
                        const rows = ids.map((id, index) => `
                            <div class="sf-attach-row">
                                <span style="font-size:20px; color:var(--sf-text-2);">
                                    <i class="fa-solid fa-paperclip" aria-hidden="true"></i>
                                </span>
                                <div style="flex:1; min-width:0;">
                                    <div style="font-weight:500; font-size:13px; color:var(--sf-text);">Attachment ${index + 1}</div>
                                    <div style="font-size:11px; font-family:monospace; color:var(--sf-text-2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${this._escapeHtml(id.trim())}</div>
                                </div>
                                <button class="sf-view-attachment-btn sf-btn sf-btn--primary sf-btn--sm" data-attachment-id="${this._escapeHtml(id.trim())}">
                                    <i class="fa-solid fa-eye" aria-hidden="true"></i> Preview
                                </button>
                            </div>
                        `).join('');
                        return `
                            <div class="sf-export-card" style="padding:20px 24px; margin-top:20px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
                                    <i class="fa-solid fa-paperclip" style="color:var(--sf-accent); font-size:16px;" aria-hidden="true"></i>
                                    <h2 style="font-size:16px; font-weight:700; margin:0; color:var(--sf-text);">Attachments (${ids.length})</h2>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:8px;">${rows}</div>
                            </div>
                        `;
                    })()}

                    <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end;">
                        <button id="cancel" class="cancelExportBtn sf-btn sf-btn--secondary" data-win-res="{textContent: 'sforce.btnCancel'}">
                            Cancel
                        </button>
                    </div>

                    <div id="exportStatusMessage" style="margin-top: 16px; padding: 12px; border-radius: 8px; display: none;"></div>
                </div>
            `;
        }

        /** @private */
        static _attachCrmExportListeners(rootElement, leadData, allFields, options = {}) {
            const isTestMode = options.isTestMode || false;
            const eventId = options.eventId || null;

            // Update the #export-status-banner after a single transfer
            const updateStatusBanner = (status, message) => {
                const banner = rootElement.querySelector('#export-status-banner');
                if (!banner) return;
                const s = status.toLowerCase();
                const state = s === 'success' ? 'success' : s === 'duplicate' ? 'warning' : 'error';
                const icon = s === 'success' ? 'fa-circle-check' : s === 'duplicate' ? 'fa-triangle-exclamation' : 'fa-circle-xmark';
                banner.style.cssText = '';
                banner.className = `sf-export-banner sf-export-banner--${state}`;
                banner.innerHTML = `
                    <i class="fa-solid ${icon} sf-export-banner__icon" aria-hidden="true"></i>
                    <div>
                        <div class="sf-export-banner__title">${status}</div>
                        <div class="sf-export-banner__meta">${message}</div>
                    </div>`;
            };

            const transferBtns = rootElement.querySelectorAll('.transferToSalesforceBtn');
            const cancelBtn = rootElement.querySelector('.cancelExportBtn');
            const statusMessage = rootElement.querySelector('#exportStatusMessage');

            if (isTestMode && eventId) {
                const testInputs = rootElement.querySelectorAll('.test-field-input');
                testInputs.forEach(input => {
                    let saveTimeout = null;
                    input.addEventListener('input', (e) => {
                        const fieldName = e.target.dataset.fieldName;
                        const value = e.target.value;

                        if (leadData._fakeData) {
                            leadData._fakeData[fieldName] = value;
                        }

                        const fieldObj = allFields.find(f => f.name === fieldName);
                        if (fieldObj) {
                            fieldObj.value = value;
                            fieldObj.transferValue = value;
                        }

                        if (saveTimeout) clearTimeout(saveTimeout);
                        saveTimeout = setTimeout(() => {
                            this._saveTestFieldValue(eventId, fieldName, value);
                        }, 300);
                    });

                    input.addEventListener('change', (e) => {
                        const fieldName = e.target.dataset.fieldName;
                        const value = e.target.value;

                        const allInputsForField = rootElement.querySelectorAll(`.test-field-input[data-field-name="${fieldName}"]`);
                        allInputsForField.forEach(inp => {
                            if (inp !== e.target) {
                                inp.value = value;
                            }
                        });
                    });
                });
            }

            const listBtn = rootElement.querySelector('#view-list-btn');
            const cardsBtn = rootElement.querySelector('#view-cards-btn');
            const listView = rootElement.querySelector('#list-view');
            const cardsView = rootElement.querySelector('#cards-view');

            if (listBtn && cardsBtn && listView && cardsView) {
                const setView = (mode) => {
                    const isList = mode === 'list';
                    listView.style.display = isList ? 'block' : 'none';
                    cardsView.style.display = isList ? 'none' : 'grid';
                    listBtn.classList.toggle('is-active', isList);
                    listBtn.setAttribute('aria-pressed', String(isList));
                    cardsBtn.classList.toggle('is-active', !isList);
                    cardsBtn.setAttribute('aria-pressed', String(!isList));
                };
                listBtn.addEventListener('click', () => setView('list'));
                cardsBtn.addEventListener('click', () => setView('cards'));
            }

            rootElement.querySelectorAll('.sf-view-attachment-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const attachmentId = btn.dataset.attachmentId;
                    await this._showAttachmentModal(attachmentId);
                });
            });

            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#disconnect-sf-btn');

            if (connectBtn) {
                connectBtn.addEventListener('click', () => {
                    this._handleSalesforceConnect(rootElement);
                });
            }

            if (disconnectBtn) {
                disconnectBtn.addEventListener('click', () => {
                    this._handleSalesforceDisconnect(rootElement);
                });
            }

            if (connectBtn) {
                this._checkInitialConnectionStatus(rootElement);
            }

            transferBtns.forEach(btn => {
                btn.addEventListener('click', async (event) => {
                    const clickedBtn = event.currentTarget;

                    const connectBtn = rootElement.querySelector('#sf-connect-btn');
                    if (connectBtn && connectBtn.style.display !== 'none') {
                        this._showToast('Please connect to Salesforce first', 'error');
                        return;
                    }

                    transferBtns.forEach(b => b.disabled = true);
                    const originalText = clickedBtn.innerHTML;
                    clickedBtn.innerHTML = `<span style="display: inline-block; width: 14px; height: 14px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: sf-spin 0.6s linear infinite; margin-right: 8px;"></span>${_t('sforce.transferring', 'Transferring...')}`;
                    clickedBtn.style.opacity = '0.8';

                    try {
                        const instance = this._getInstance();
                        if (!instance) {
                            throw new Error('SalesforceLeadLib instance not found');
                        }

                        const transferData = SalesforceLeadLib.buildLeadDataFromItem(leadData, instance.fieldMappingService);
                        const externalIdField = SalesforceLeadLib.detectExternalIdField(instance.fieldMappingService);

                        if (!transferData || Object.keys(transferData).length === 0) {
                            throw new Error('No active fields with values to transfer');
                        }

                        const backendUrl = instance.config.backendUrl;
                        const orgId = localStorage.getItem('orgId') || 'default';

                        // Fetch attachments from OData before transfer
                        const attachments = await SalesforceLeadLib.fetchAttachmentsForBatch(leadData.AttachmentIdList);

                        const payload = {
                            leadData: transferData,
                            attachments,
                            leadId: leadData.KontaktViewId || leadData.ContactId || null,
                            ...(externalIdField && { externalIdField })
                        };

                        const doFetch = async () => {
                            const token = localStorage.getItem('sf_session_token') || '';
                            return fetch(`${backendUrl}/api/salesforce/leads`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Org-Id': orgId,
                                    ...(token && { 'X-Session-Token': token })
                                },
                                body: JSON.stringify(payload)
                            });
                        };

                        const transferStartTime = Date.now();
                        let response = await doFetch();

                        // Auto-reconnect if backend session expired
                        if (response.status === 401) {
                            const reactivated = await instance._reactivateSession();
                            if (reactivated) {
                                response = await doFetch();
                            } else {
                                return {
                                    success: false,
                                    status: 'failed',
                                    message: 'Salesforce session expired. Please reconnect to Salesforce and try again.',
                                    salesforceId: null,
                                    sessionExpired: true
                                };
                            }
                        }

                        let responseData = {};
                        const contentType = response.headers.get('content-type');

                        if (contentType && contentType.includes('application/json')) {
                            try {
                                responseData = await response.json();
                            } catch (parseError) {
                                console.error('Failed to parse JSON response:', parseError);
                                responseData = { message: 'Invalid response from server' };
                            }
                        } else {
                            const textResponse = await response.text();
                            console.error('Non-JSON response:', textResponse);
                            responseData = { message: textResponse || 'Invalid response format from server' };
                        }

                        if (!response.ok) {
                            console.error('Transfer failed:', {
                                status: response.status,
                                statusText: response.statusText,
                                data: responseData
                            });

                            // Handle 400 errors (validation errors, missing fields, etc.)
                            if (response.status === 400) {
                                let errorTitle = 'Validation Error';
                                if (responseData.error === 'MISSING_CUSTOM_FIELDS' || responseData.error === 'MISSING_FIELDS') {
                                    errorTitle = 'Missing Fields in Salesforce';
                                }

                                let errorMessage = responseData.message || 'A validation error occurred.';

                                if (responseData.data) {
                                    if (responseData.data.errors && Array.isArray(responseData.data.errors)) {
                                        const errorsList = responseData.data.errors.join('\n• ');
                                        errorMessage = `${responseData.data.message || responseData.message || 'Validation failed'}\n\n• ${errorsList}`;
                                    } else if (responseData.data.message) {
                                        errorMessage = responseData.data.message;
                                    }
                                }

                                if (responseData.errors && Array.isArray(responseData.errors)) {
                                    const errorsList = responseData.errors.join('\n• ');
                                    errorMessage = `${responseData.message || 'Validation failed'}\n\n• ${errorsList}`;
                                }

                                showErrorModal(errorTitle, errorMessage);

                                transferBtns.forEach(b => b.disabled = false);
                                clickedBtn.innerHTML = originalText;
                                clickedBtn.style.opacity = '1';
                                return;
                            }

                            // Handle 500 errors
                            if (response.status === 500) {
                                let errorDetails = responseData.message || responseData.error || 'Internal server error';

                                if (responseData.data) {
                                    if (responseData.data.errors && Array.isArray(responseData.data.errors)) {
                                        errorDetails = responseData.data.errors.join('\n• ');
                                    } else if (responseData.data.message) {
                                        errorDetails = responseData.data.message;
                                    }
                                }

                                showErrorModal(
                                    'Server Error',
                                    errorDetails
                                );

                                transferBtns.forEach(b => b.disabled = false);
                                clickedBtn.innerHTML = originalText;
                                clickedBtn.style.opacity = '1';
                                return;
                            }

                            // Handle 409 Conflict errors
                            if (response.status === 409) {
                                let errorMessage = responseData.message || 'Duplicate lead found';

                                if (responseData.data && responseData.data.existingLead) {
                                    const existing = responseData.data.existingLead;
                                    errorMessage = `${responseData.data.message || responseData.message || 'Duplicate lead found'}\n\n`;
                                    errorMessage += `Existing Lead in Salesforce:\n`;
                                    if (existing.name) errorMessage += `• Name: ${existing.name}\n`;
                                    if (existing.company) errorMessage += `• Company: ${existing.company}\n`;
                                    if (existing.email) errorMessage += `• Email: ${existing.email}\n`;
                                    if (existing.salesforceId) errorMessage += `• Salesforce ID: ${existing.salesforceId}`;
                                }

                                showErrorModal(_t('sforce.duplicateLeadTitle', 'Duplicate Lead'), errorMessage);
                                updateStatusBanner('Duplicate', responseData.message || 'Duplicate lead found');

                                SalesforceLeadLib.callSetLeadExportStatus(
                                    leadData.Id || leadData.KontaktViewId,
                                    'Duplicate',
                                    responseData.message || 'Duplicate lead found',
                                    Date.now() - transferStartTime
                                );

                                transferBtns.forEach(b => b.disabled = false);
                                clickedBtn.innerHTML = originalText;
                                clickedBtn.style.opacity = '1';
                                return;
                            }

                            throw new Error(responseData.message || responseData.data?.message || `Transfer failed with status ${response.status}`);
                        }

                        transferBtns.forEach(b => {
                            b.innerHTML = `✓ ${_t('sforce.transferred', 'Transferred')}`;
                            b.style.background = '#059669';
                            b.style.opacity = '1';
                        });

                        const salesforceId = responseData.salesforceId || responseData.id || 'Unknown';
                        const isUpdate = responseData.isUpdate || false;
                        const backendMessage = responseData.message || (isUpdate ? 'Lead successfully updated in Salesforce' : 'Lead successfully created in Salesforce');
                        const contactId = leadData.KontaktViewId || leadData.ContactId || leadData.KontaktVIEWID;
                        if (contactId) {
                            this._saveExportStatus(contactId, salesforceId);
                        }

                        const contactGuid = leadData.Id || leadData.KontaktViewId;
                        SalesforceLeadLib.callSetLeadExportStatus(
                            contactGuid,
                            'Success',
                            backendMessage,
                            Date.now() - transferStartTime
                        );

                        updateStatusBanner('Success', `${backendMessage} • SF ID: ${salesforceId}`);
                        showSuccessModal(
                            isUpdate ? 'Lead Updated Successfully!' : 'Lead Created Successfully!',
                            `${backendMessage}\n\nSalesforce ID: ${salesforceId}`
                        );

                    } catch (error) {
                        console.error('Transfer error:', error);

                        SalesforceLeadLib.callSetLeadExportStatus(
                            leadData.Id || leadData.KontaktViewId,
                            'Failed',
                            error.message || 'Transfer failed',
                            typeof transferStartTime !== 'undefined' ? Date.now() - transferStartTime : 0
                        );

                        transferBtns.forEach(b => b.disabled = false);
                        clickedBtn.innerHTML = originalText;
                        clickedBtn.style.opacity = '1';

                        updateStatusBanner('Failed', error.message || 'Transfer failed');
                        showErrorModal('Transfer Error', error.message || 'An unexpected error occurred during transfer.');
                    }
                });
            });

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (WinJS && WinJS.Navigation && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                });
            }
        }

        /** @private */
        static async _showAttachmentModal(attachmentId) {
            const dialog = document.createElement('dialog');
            dialog.className = 'sf-lib-dialog';
            dialog.style.cssText = `
                border: none;
                border-radius: 12px;
                padding: 0;
                width: 900px;
                max-width: 95vw;
                max-height: 90vh;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                background: var(--Window, white);
                color: var(--WindowText, #374151);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            `;

            dialog.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:var(--sf-accent); color:white; flex-shrink:0;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fa-solid fa-paperclip"></i>
                        <span id="sf-attachment-modal-title" style="font-weight:700; font-size:15px;">${_t('sforce.loading', 'Loading...')}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button id="sf-attachment-download-btn" style="display:none; padding:6px 14px; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); border-radius:6px; color:white; font-size:12px; font-weight:600; cursor:pointer;">
                            <i class="fa-solid fa-download" style="margin-right:4px;"></i>${_t('sforce.btnDownload', 'Download')}
                        </button>
                        <button id="sf-attachment-close-btn" style="background:none; border:none; color:white; font-size:20px; cursor:pointer; line-height:1; padding:4px 8px;">&times;</button>
                    </div>
                </div>
                <div id="sf-attachment-modal-body" style="flex:1; overflow:auto; padding:20px; display:flex; align-items:center; justify-content:center; min-height:300px;">
                    <div style="color:var(--ColorLabel, #6b7280); font-size:14px; text-align:center;">
                        <span class="sf-spinner" style="margin:0 auto 12px;display:block;"></span>
                        ${_t('sforce.loading', 'Loading...')}
                    </div>
                </div>
            `;

            if (document.body.classList.contains('cnv-ui-dark')) {
                dialog.classList.add('cnv-ui-dark');
            }

            document.body.appendChild(dialog);
            dialog.showModal();

            const modalTitle = dialog.querySelector('#sf-attachment-modal-title');
            const modalBody = dialog.querySelector('#sf-attachment-modal-body');
            const downloadBtn = dialog.querySelector('#sf-attachment-download-btn');
            const closeBtn = dialog.querySelector('#sf-attachment-close-btn');

            const closeDialog = () => {
                dialog.close();
                if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
            };

            closeBtn.addEventListener('click', closeDialog);
            dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });

            try {
                const endpoint = `LS_AttachmentById?Id=%27${encodeURIComponent(attachmentId)}%27&$format=json`;
                const data = await this._callPortalODataAPI(endpoint);

                let attachment = null;
                if (data?.d?.results?.length > 0) attachment = data.d.results[0];
                else if (data?.d) attachment = data.d;

                if (!attachment?.Body) {
                    modalBody.innerHTML = `<div style="color:var(--ColorLabel, #6b7280); text-align:center; padding:40px;">${_t('sforce.noAttachmentContent', 'No content available for this attachment.')}</div>`;
                    return;
                }

                const fileName = attachment.Name || 'attachment';
                const fileType = attachment.ContentType || 'application/octet-stream';
                const extension = fileName.split('.').pop().toLowerCase();
                modalTitle.textContent = fileName;

                // Process body
                let body = attachment.Body.replace(/\s+/g, '');
                let finalType = fileType;
                const isSVG = extension === 'svg' || fileType === 'image/svg+xml';

                if (isSVG) {
                    finalType = 'image/svg+xml';
                } else if (!finalType) {
                    const mime = { pdf:'application/pdf', jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', txt:'text/plain' };
                    finalType = mime[extension] || 'application/octet-stream';
                }

                const dataUrl = `data:${finalType};base64,${body}`;

                // Set up download button
                downloadBtn.style.display = 'inline-block';
                downloadBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = dataUrl; a.download = fileName;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                };

                // Render preview
                if (isSVG) {
                    try {
                        const svgStr = atob(body);
                        modalBody.innerHTML = `<div style="width:100%; text-align:center;background:#fff;border-radius:8px;padding:12px;box-sizing:border-box;">${svgStr}</div>`;
                        const svgEl = modalBody.querySelector('svg');
                        if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.maxHeight = '70vh'; }
                        else modalBody.innerHTML = `<object data="${dataUrl}" type="image/svg+xml" style="width:100%;height:60vh;">${_t('sforce.svgNotSupported', 'SVG not supported')}</object>`;
                    } catch {
                        modalBody.innerHTML = `<object data="${dataUrl}" type="image/svg+xml" style="width:100%;height:60vh;">${_t('sforce.svgNotSupported', 'SVG not supported')}</object>`;
                    }
                } else if (finalType.startsWith('image/')) {
                    modalBody.innerHTML = `<img src="${dataUrl}" alt="${this._escapeHtml(fileName)}" style="max-width:100%; max-height:70vh; object-fit:contain;">`;
                } else if (finalType === 'application/pdf') {
                    modalBody.innerHTML = `<iframe src="${dataUrl}#view=Fit" style="width:100%; height:70vh; border:none;"><p>${_t('sforce.pdfNotSupported', 'PDF not supported.')} <a href="${dataUrl}" download="${this._escapeHtml(fileName)}">${_t('sforce.btnDownload', 'Download')}</a></p></iframe>`;
                } else if (finalType.startsWith('audio/')) {
                    modalBody.innerHTML = `<audio controls style="width:100%;"><source src="${dataUrl}" type="${finalType}">${_t('sforce.audioNotSupported', 'Your browser does not support audio.')}</audio>`;
                } else if (finalType.startsWith('video/')) {
                    modalBody.innerHTML = `<video controls style="max-width:100%; max-height:70vh;"><source src="${dataUrl}" type="${finalType}">${_t('sforce.videoNotSupported', 'Your browser does not support video.')}</video>`;
                } else {
                    modalBody.innerHTML = `<div style="text-align:center; padding:40px; color:#6b7280;"><i class="fa-solid fa-file" style="font-size:48px; margin-bottom:16px; display:block;"></i><div style="font-size:14px; margin-bottom:8px;">${this._escapeHtml(fileName)}</div><div style="font-size:12px;">${_t('sforce.previewNotAvailable', 'Preview not available for this file type')} (${this._escapeHtml(finalType)})</div><div style="margin-top:8px; font-size:12px;">${_t('sforce.useDownloadButton', 'Use the Download button to open the file.')}</div></div>`;
                }

            } catch (error) {
                modalBody.innerHTML = `<div style="color:#ef4444; text-align:center; padding:40px;">${_t('sforce.errorLoading', 'Error loading:')} ${this._escapeHtml(error.message)}</div>`;
            }
        }

        /** @private */
        static async _checkInitialConnectionStatus(rootElement) {
            const statusCard = rootElement.querySelector('#api-status-user-card');
            const indicator = rootElement.querySelector('#api-status-indicator');
            const statusText = rootElement.querySelector('#api-status-text');
            const userSection = rootElement.querySelector('#user-profile-section');
            const userAvatar = rootElement.querySelector('#user-avatar-header');
            const userName = rootElement.querySelector('#user-name-header');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#disconnect-sf-btn');

            if (!statusCard || !connectBtn) {
                return;
            }

            try {
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusChecking', 'Checking...');

                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                const authStatus = await instance._checkAuthenticationStatus();

                if (authStatus && authStatus.success) {
                    const userInfo = authStatus.userInfo || {};
                    const displayName = userInfo.display_name || userInfo.username || 'Unknown user';

                    if (statusCard) { statusCard.classList.add('is-connected'); statusCard.classList.remove('is-failed'); }
                    if (indicator) indicator.className = 'sf-dot sf-dot--success';
                    if (statusText) statusText.textContent = _t('sforce.statusConnected', 'Connected');

                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) disconnectBtn.style.display = 'flex';

                    const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                    if (transferBtnHeader) transferBtnHeader.style.display = 'flex';
                } else {
                    if (statusCard) statusCard.classList.remove('is-connected', 'is-failed');
                    if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                    if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                    if (userSection) userSection.style.display = 'none';
                    if (connectBtn) connectBtn.style.display = 'flex';
                    if (disconnectBtn) disconnectBtn.style.display = 'none';

                    const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                    if (transferBtnHeader) transferBtnHeader.style.display = 'none';
                }

            } catch (error) {
                console.error('Failed to check connection status:', error);

                if (statusCard) statusCard.classList.remove('is-connected', 'is-failed');
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) disconnectBtn.style.display = 'none';

                const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                if (transferBtnHeader) transferBtnHeader.style.display = 'none';
            }
        }

        /** @private */
        static async _handleSalesforceDisconnect(rootElement) {
            const statusCard = rootElement.querySelector('#api-status-user-card');
            const indicator = rootElement.querySelector('#api-status-indicator');
            const statusText = rootElement.querySelector('#api-status-text');
            const userSection = rootElement.querySelector('#user-profile-section');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#disconnect-sf-btn');

            try {
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusDisconnecting', 'Disconnecting...');
                if (disconnectBtn) disconnectBtn.disabled = true;

                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                await instance.disconnect();

                if (statusCard) statusCard.classList.remove('is-connected', 'is-failed');
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) {
                    disconnectBtn.style.display = 'none';
                    disconnectBtn.disabled = false;
                }

                const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                if (transferBtnHeader) transferBtnHeader.style.display = 'none';

                this._showToast('Disconnected from Salesforce successfully', 'success');

            } catch (error) {
                console.error('Disconnect error:', error);

                if (statusCard) statusCard.classList.remove('is-connected', 'is-failed');
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) {
                    disconnectBtn.style.display = 'none';
                    disconnectBtn.disabled = false;
                }

                const transferBtnHeaderErr = rootElement.querySelector('#transferToSalesforceBtnHeader');
                if (transferBtnHeaderErr) transferBtnHeaderErr.style.display = 'none';

                this._showToast('Disconnection failed: ' + (error.message || 'Unknown error'), 'error');
            }
        }

        /** @private */
        static async _handleSalesforceConnect(rootElement) {
            const statusCard = rootElement.querySelector('#api-status-user-card');
            const indicator = rootElement.querySelector('#api-status-indicator');
            const statusText = rootElement.querySelector('#api-status-text');
            const userSection = rootElement.querySelector('#user-profile-section');
            const userAvatar = rootElement.querySelector('#user-avatar-header');
            const userName = rootElement.querySelector('#user-name-header');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#disconnect-sf-btn');

            try {
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusConnecting', 'Connecting...');
                if (connectBtn) connectBtn.disabled = true;

                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                const authStatus = await instance.connect();

                if (authStatus && authStatus.success) {
                    const userInfo = authStatus.userInfo || {};
                    const orgName = userInfo.organization_name || userInfo.orgName || 'Salesforce';
                    const displayName = userInfo.display_name || userInfo.username || 'Unknown user';

                    localStorage.setItem('sf_user_info', JSON.stringify(userInfo));
                    localStorage.setItem('sf_connected', 'true');
                    localStorage.setItem('sf_connected_at', new Date().toISOString());

                    if (statusCard) { statusCard.classList.add('is-connected'); statusCard.classList.remove('is-failed'); }
                    if (indicator) indicator.className = 'sf-dot sf-dot--success';
                    if (statusText) statusText.textContent = _t('sforce.statusConnected', 'Connected');

                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) {
                        disconnectBtn.style.display = 'flex';
                        disconnectBtn.disabled = false;
                    }

                    const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                    if (transferBtnHeader) transferBtnHeader.style.display = 'flex';

                    this._showToast(`Connected to ${orgName} as ${displayName}`, 'success');

                } else {
                    throw new Error('Authentication failed');
                }

            } catch (error) {
                console.error('Connection error:', error);

                if (statusCard) statusCard.classList.remove('is-connected', 'is-failed');
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.connectionFailed', 'Connection Failed');
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) {
                    connectBtn.style.display = 'flex';
                    connectBtn.disabled = false;
                }
                if (disconnectBtn) disconnectBtn.style.display = 'none';

                const transferBtnHeaderErr = rootElement.querySelector('#transferToSalesforceBtnHeader');
                if (transferBtnHeaderErr) transferBtnHeaderErr.style.display = 'none';

                let errorMessage = 'Connection failed';
                if (error.message) {
                    if (error.message.includes('Popup was blocked')) {
                        errorMessage = 'Popup blocked. Please allow popups for this site.';
                    } else {
                        errorMessage = error.message;
                    }
                }

                this._showToast(errorMessage, 'error');

                setTimeout(() => {
                    if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                    if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                }, 3000);
            }
        }

        /** @private */
        static async _checkSalesforceConnectionInSettings(rootElement) {
            const statusCard = rootElement.querySelector('#sf-status-card');
            const indicator = rootElement.querySelector('#sf-status-indicator');
            const statusText = rootElement.querySelector('#sf-status-text');
            const userSection = rootElement.querySelector('#sf-user-section');
            const userAvatar = rootElement.querySelector('#sf-user-avatar');
            const userName = rootElement.querySelector('#sf-user-name');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#sf-disconnect-btn');

            if (!statusCard || !connectBtn) return;

            try {
                // Fast path: cached flag from a previous connect on this device.
                // Fallback: ask the backend — the OAuth session survives page
                // reloads (it lives server-side), but localStorage 'sf_connected'
                // is only written by the connect buttons, so after a WinJS
                // page reload the settings header wrongly showed Disconnected.
                let connected = false;
                let displayName = 'Salesforce User';

                const sfConnected = localStorage.getItem('sf_connected');
                const savedUserInfo = localStorage.getItem('sf_user_info');
                if (sfConnected === 'true' && savedUserInfo) {
                    const userInfo = JSON.parse(savedUserInfo);
                    connected = true;
                    displayName = userInfo.display_name || userInfo.username || 'Salesforce User';
                } else {
                    const silent = await this._checkSfConnectionSilent();
                    if (silent.connected) {
                        connected = true;
                        displayName = silent.userInfo || 'Salesforce User';
                        // Re-seed the cache so the other views agree without
                        // their own backend round-trip.
                        localStorage.setItem('sf_connected', 'true');
                        localStorage.setItem('sf_user_info', JSON.stringify({ display_name: displayName }));
                    }
                }

                if (connected) {
                    if (statusCard) {
                        statusCard.classList.add('is-connected');
                        statusCard.classList.remove('is-failed');
                    }
                    if (indicator) indicator.className = 'sf-dot sf-dot--success';
                    if (statusText) statusText.textContent = _t('sforce.statusConnected', 'Connected');
                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) disconnectBtn.style.display = 'flex';

                    const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                    if (transferBtn) transferBtn.style.display = 'flex';
                } else {
                    if (statusCard) statusCard.classList.remove('is-connected', 'is-failed');
                    if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                    if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                    if (userSection) userSection.style.display = 'none';
                    if (connectBtn) connectBtn.style.display = 'flex';
                    if (disconnectBtn) disconnectBtn.style.display = 'none';

                    const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                    if (transferBtn) transferBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('Error checking SF connection:', error);

                const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                if (transferBtn) transferBtn.style.display = 'none';
            }
        }

        /** @private */
        static async _handleSalesforceConnectInSettings(rootElement) {
            const statusCard = rootElement.querySelector('#sf-status-card');
            const indicator = rootElement.querySelector('#sf-status-indicator');
            const statusText = rootElement.querySelector('#sf-status-text');
            const userSection = rootElement.querySelector('#sf-user-section');
            const userAvatar = rootElement.querySelector('#sf-user-avatar');
            const userName = rootElement.querySelector('#sf-user-name');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#sf-disconnect-btn');

            try {
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusConnecting', 'Connecting...');
                if (connectBtn) connectBtn.disabled = true;

                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                const authStatus = await instance.connect();

                if (authStatus && authStatus.success) {
                    const userInfo = authStatus.userInfo || {};
                    const orgName = userInfo.organization_name || userInfo.orgName || 'Salesforce';
                    const displayName = userInfo.display_name || userInfo.username || 'Unknown user';

                    localStorage.setItem('sf_user_info', JSON.stringify(userInfo));
                    localStorage.setItem('sf_connected', 'true');
                    localStorage.setItem('sf_connected_at', new Date().toISOString());

                    if (statusCard) {
                        statusCard.classList.add('is-connected');
                        statusCard.classList.remove('is-failed');
                    }
                    if (indicator) indicator.className = 'sf-dot sf-dot--success';
                    if (statusText) statusText.textContent = _t('sforce.statusConnected', 'Connected');
                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) {
                        disconnectBtn.style.display = 'flex';
                        disconnectBtn.disabled = false;
                    }

                    const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                    if (transferBtn) transferBtn.style.display = 'flex';

                    this._showToast(`Connected to ${orgName} as ${displayName}`, 'success');
                } else {
                    throw new Error('Authentication failed');
                }

            } catch (error) {
                console.error('Connection error:', error);

                if (statusCard) {
                    statusCard.classList.remove('is-connected');
                    statusCard.classList.add('is-failed');
                }
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.connectionFailed', 'Connection Failed');
                if (userSection) userSection.style.display = 'none';

                const transferBtnErr = rootElement.querySelector('#transferToSalesforceBtn');
                if (transferBtnErr) transferBtnErr.style.display = 'none';
                if (connectBtn) {
                    connectBtn.style.display = 'flex';
                    connectBtn.disabled = false;
                }
                if (disconnectBtn) disconnectBtn.style.display = 'none';

                let errorMessage = 'Connection failed';
                if (error.message && error.message.includes('Popup was blocked')) {
                    errorMessage = 'Popup blocked. Please allow popups for this site.';
                } else if (error.message) {
                    errorMessage = error.message;
                }

                this._showToast(errorMessage, 'error');

                setTimeout(() => {
                    if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                }, 3000);
            }
        }

        /** @private */
        static async _handleSalesforceDisconnectInSettings(rootElement) {

            const statusCard = rootElement.querySelector('#sf-status-card');
            const indicator = rootElement.querySelector('#sf-status-indicator');
            const statusText = rootElement.querySelector('#sf-status-text');
            const userSection = rootElement.querySelector('#sf-user-section');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#sf-disconnect-btn');

            try {
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusDisconnecting', 'Disconnecting...');
                if (disconnectBtn) disconnectBtn.disabled = true;

                const instance = this._getInstance();
                if (instance) {
                    await instance.disconnect();
                }

                localStorage.removeItem('sf_connected');
                localStorage.removeItem('sf_connected_at');
                localStorage.removeItem('sf_user_info');
                localStorage.removeItem('sf_access_token');
                localStorage.removeItem('sf_instance_url');
                localStorage.removeItem('sf_refresh_token');

                if (statusCard) statusCard.classList.remove('is-connected', 'is-failed');
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) {
                    disconnectBtn.style.display = 'none';
                    disconnectBtn.disabled = false;
                }

                const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                if (transferBtn) transferBtn.style.display = 'none';

                this._showToast('Disconnected from Salesforce', 'success');

            } catch (error) {
                console.error('Disconnect error:', error);

                localStorage.removeItem('sf_connected');
                localStorage.removeItem('sf_connected_at');
                localStorage.removeItem('sf_user_info');

                if (statusCard) statusCard.classList.remove('is-connected', 'is-failed');
                if (indicator) indicator.className = 'sf-dot sf-dot--warning';
                if (statusText) statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) {
                    disconnectBtn.style.display = 'none';
                    disconnectBtn.disabled = false;
                }

                const transferBtnErr = rootElement.querySelector('#transferToSalesforceBtn');
                if (transferBtnErr) transferBtnErr.style.display = 'none';

                this._showToast('Disconnected from Salesforce', 'success');
            }
        }

        // ============================================
        // Export Status Tracking Methods
        // ============================================

        /** @private */
        static _saveExportStatus(contactId, salesforceId) {
            try {
                const exportStatus = {
                    contactId: contactId,
                    salesforceId: salesforceId,
                    exportedAt: new Date().toISOString(),
                    exportedBy: localStorage.getItem('sf_user_info')
                        ? JSON.parse(localStorage.getItem('sf_user_info')).display_name
                        : 'Unknown'
                };

                const existingStatuses = this._getExportStatuses();
                existingStatuses[contactId] = exportStatus;
                localStorage.setItem('sf_export_statuses', JSON.stringify(existingStatuses));
            } catch (error) {
                console.error('Failed to save export status:', error);
            }
        }

        /** @private */
        static _getExportStatuses() {
            try {
                const statuses = localStorage.getItem('sf_export_statuses');
                return statuses ? JSON.parse(statuses) : {};
            } catch (error) {
                console.error('Failed to load export statuses:', error);
                return {};
            }
        }

        static getExportStatus(contactId) {
            const statuses = this._getExportStatuses();
            return statuses[contactId] || null;
        }

        static isExported(contactId) {
            return this.getExportStatus(contactId) !== null;
        }

        static getExportedContactIds() {
            const statuses = this._getExportStatuses();
            return Object.keys(statuses);
        }

        static clearExportStatus(contactId) {
            try {
                const statuses = this._getExportStatuses();
                delete statuses[contactId];
                localStorage.setItem('sf_export_statuses', JSON.stringify(statuses));
            } catch (error) {
                console.error('Failed to clear export status:', error);
            }
        }

        static clearAllExportStatuses() {
            localStorage.removeItem('sf_export_statuses');
        }

        // ============================================================
        // BATCH TRANSFER SERVICE
        // ============================================================

        /** @private batch cancel flag */
        static _batchCancelled = false;

        /** @private System/metadata fields to exclude from Salesforce transfer */
        static BATCH_EXCLUDED_FIELDS = new Set([
            'Id', 'CreatedDate', 'LastModifiedDate', 'CreatedById', 'LastModifiedById',
            'SystemModstamp', 'IsDeleted', 'MasterRecordId', 'LastActivityDate',
            'LastViewedDate', 'LastReferencedDate', 'Jigsaw', 'JigsawContactId',
            'CleanStatus', 'CompanyDunsNumber', 'DandbCompanyId', 'EmailBouncedReason','EmailBouncedDate', 'IndividualId', 'apiEndpoint', 'credentials', 'serverName', 'apiName', 'AttachmentIdList', 'EventID', '__metadata', 'KontaktViewId', 'LastExportStatus', 'LastExportTimestamp',
            'LastExportMilliseconds', 'LastExportMessage', 'ExportAttempts'
        ]);

        /** @private Standard Salesforce Lead fields (no __c suffix needed) */
        static STANDARD_SF_FIELDS = new Set([
            'ActionCadenceAssigneeId', 'ActionCadenceId', 'ActionCadenceState',
            'ActiveTrackerCount', 'ActivityMetricId', 'ActivityMetricRollupId',
            'Address', 'AnnualRevenue', 'City', 'CleanStatus', 'Company',
            'CompanyDunsNumber', 'ConvertedAccountId', 'ConvertedContactId',
            'ConvertedDate', 'ConvertedOpportunityId', 'ConnectionReceivedId',
            'ConnectionSentId', 'Country', 'CountryCode', 'CurrencyIsoCode',
            'DandbCompanyId', 'Description', 'Division', 'Email',
            'EmailBouncedDate', 'EmailBouncedReason', 'ExportStatus', 'Fax',
            'FirstCallDateTime', 'FirstEmailDateTime', 'FirstName',
            'GeocodeAccuracy', 'GenderIdentity', 'HasOptedOutOfEmail',
            'HasOptedOutOfFax', 'IndividualId', 'Industry', 'IsConverted',
            'IsDeleted', 'IsPriorityRecord', 'IsUnreadByOwner', 'Jigsaw',
            'JigsawContactId', 'LastActivityDate', 'LastName', 'LastReferencedDate',
            'LastViewedDate', 'Latitude', 'LeadSource', 'Longitude',
            'MasterRecordId', 'MiddleName', 'MobilePhone', 'Name',
            'NumberOfEmployees', 'OwnerId', 'PartnerAccountId', 'Phone',
            'PhotoUrl', 'PostalCode', 'Pronouns', 'Rating', 'RecordTypeId',
            'Salutation', 'ScheduledResumeDateTime', 'ScoreIntelligenceId',
            'State', 'StateCode', 'Status', 'Street', 'Suffix', 'Title', 'Website', 'Id', 'CreatedDate', 'LastModifiedDate', 'SystemModstamp'
        ]);

        /** Extract GUID from OData __metadata.uri */
        static extractGuidFromMetadata(data) {
            try {
                const uri = data?.__metadata?.uri;
                if (!uri) return null;
                const match = uri.match(/guid'([0-9a-f-]{36})'/i);
                return match ? match[1] : null;
            } catch {
                return null;
            }
        }

        /** Get a display name for a lead item */
        static getLeadDisplayName(itemData) {
            const parts = [];
            if (itemData.FirstName) parts.push(itemData.FirstName);
            if (itemData.LastName) parts.push(itemData.LastName);
            if (parts.length === 0 && itemData.Company) parts.push(itemData.Company);
            if (parts.length === 0 && itemData.Email) parts.push(itemData.Email);
            return parts.join(' ') || 'Unknown Lead';
        }

        /** Build Salesforce lead data from an OData item using active field config */
        static buildLeadDataFromItem(itemData, fieldMappingService) {
            const salesforceData = {};

            const processedData = fieldMappingService?.applyCustomLabels(itemData) ||
                Object.fromEntries(Object.entries(itemData).map(([key, value]) => [key, {
                    value, label: key, active: true
                }]));


            if (fieldMappingService) {
                const customFields = typeof fieldMappingService.getAllCustomFields === 'function'
                    ? fieldMappingService.getAllCustomFields()
                    : (fieldMappingService.customFields || []);
                if (customFields) {
                    customFields.forEach(field => {
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

            Object.keys(processedData).forEach(apiFieldName => {
                // A system/LS-internal field is excluded by default — UNLESS the user has
                // explicitly mapped it to a different SF target (e.g. CreatedById ->
                // Campaign_AVT_Contact__c). In that case the mapping is deliberate and must
                // be honored, so we let it through and resolve its custom target below.
                const explicitTarget = fieldMappingService?.customLabels?.[apiFieldName];
                const hasExplicitMapping = explicitTarget && explicitTarget.trim() !== '' && explicitTarget !== apiFieldName;
                if (this.BATCH_EXCLUDED_FIELDS.has(apiFieldName) && !hasExplicitMapping) return;
                if (/\s/.test(apiFieldName)) return;

                const fieldInfo = processedData[apiFieldName];
                const isActive = typeof fieldInfo === 'object' ? (fieldInfo.active !== false) : true;
                if (!isActive) return;

                const value = typeof fieldInfo === 'object' ? fieldInfo.value : fieldInfo;

                if (!value || (typeof value === 'string' && (value.trim() === '' || value === 'N/A'))) return;

                let sfFieldName;
                // An explicit user mapping always wins — even for a "standard" source like
                // Id. The LS "Id" (GUID) must go to its mapped External ID field
                // (e.g. LS_LeadId__c), never to the SF standard "Id" (which SF rejects as
                // "Id field should not be specified in the sobject data").
                if (hasExplicitMapping) {
                    sfFieldName = explicitTarget.trim();
                    if (!this.STANDARD_SF_FIELDS.has(sfFieldName) && !sfFieldName.endsWith('__c')) {
                        sfFieldName = sfFieldName + '__c';
                    }
                } else if (this.STANDARD_SF_FIELDS.has(apiFieldName)) {
                    sfFieldName = apiFieldName;
                } else {
                    sfFieldName = apiFieldName;
                    if (!sfFieldName.endsWith('__c')) {
                        sfFieldName = sfFieldName + '__c';
                    }
                }

                if (sfFieldName === 'AnnualRevenue' || sfFieldName === 'NumberOfEmployees') {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) salesforceData[sfFieldName] = numValue;
                    return;
                }

                if (salesforceData[sfFieldName] === undefined) {
                    salesforceData[sfFieldName] = typeof value === 'string' ? value.trim() : value;
                }
            });

            // Force required SF fields (LastName, Company) - SF rejects leads without these
            const SF_REQUIRED_FIELDS = ['LastName', 'Company'];
            for (const reqField of SF_REQUIRED_FIELDS) {
                if (!salesforceData[reqField]) {
                    const reverseMap = {};
                    if (fieldMappingService?.customLabels) {
                        for (const [odataField, sfField] of Object.entries(fieldMappingService.customLabels)) {
                            if (sfField === reqField) reverseMap[reqField] = odataField;
                        }
                    }
                    const odataFieldName = reverseMap[reqField] || reqField;
                    const val = itemData[odataFieldName] || itemData[reqField];
                    if (val && typeof val === 'string' && val.trim() !== '') {
                        salesforceData[reqField] = val.trim();
                    }
                }
            }

            // Auto-include External ID field if configured (for upsert support)
            const externalIdSfField = fieldMappingService?.customLabels?.['Id'];
            if (externalIdSfField?.trim()?.endsWith('__c') && itemData.Id) {
                salesforceData[externalIdSfField.trim()] = itemData.Id;
            }

            return salesforceData;
        }

        /** Detect the external ID field from customLabels['Id'], returns __c field name or null */
        static detectExternalIdField(fieldMappingService) {
            const customIdLabel = fieldMappingService?.customLabels?.['Id'];
            const result = customIdLabel?.trim()?.endsWith('__c') ? customIdLabel.trim() : null;
            return result;
        }

        /** Transfer a single lead to Salesforce via backend API */
        static async transferSingleLead(leadData, attachments, externalIdField = null) {
            try {
                const instance = this._getInstance();
                if (!instance) throw new Error('SalesforceLeadLib not initialized');

                let salesforceLeadData = { ...leadData };

                Object.keys(salesforceLeadData).forEach(key => {
                    if (salesforceLeadData[key] === null || salesforceLeadData[key] === '' || salesforceLeadData[key] === 'N/A') {
                        delete salesforceLeadData[key];
                    }
                });

                const apiUrl = `${instance.config.backendUrl}/api/salesforce/leads`;
                const orgId = localStorage.getItem('orgId') || 'default';

                const payload = {
                    leadData: salesforceLeadData,
                    attachments: attachments || [],
                    ...(externalIdField && { externalIdField })
                };

                const doFetch = async () => {
                    const token = localStorage.getItem('sf_session_token') || '';
                    return fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Org-Id': orgId,
                            ...(token && { 'X-Session-Token': token })
                        },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                };

                let response = await doFetch();

                // Auto-reconnect if backend session expired
                if (response.status === 401) {
                    const reactivated = await instance._reactivateSession();
                    if (reactivated) {
                        response = await doFetch();
                    } else {
                        return {
                            success: false,
                            status: 'failed',
                            message: 'Salesforce session expired. Please reconnect to Salesforce and try again.',
                            salesforceId: null,
                            sessionExpired: true
                        };
                    }
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

                    // Handle 409 Conflict as duplicate (not failed)
                    if (response.status === 409) {
                        return {
                            success: false,
                            status: 'duplicate',
                            message: errorData.data?.message || errorData.message || `HTTP ${response.status}`,
                            salesforceId: errorData.data?.existingId || null,
                            duplicateWarning: true,
                            isUpdate: false
                        };
                    }

                    // Prefer Salesforce error messages over generic wrapper message
                    const sfMessage = errorData.sfErrors?.length
                        ? errorData.sfErrors.map(e => e.message).filter(Boolean).join(' | ')
                        : null;
                    // For MISSING_FIELDS: build a clean message from missingFields array
                    const missingFieldsMsg = errorData.error === 'MISSING_FIELDS' && errorData.missingFields?.length
                        ? `Unknown SF fields: ${errorData.missingFields.join(', ')}`
                        : null;
                    return {
                        success: false,
                        status: 'failed',
                        message: sfMessage || missingFieldsMsg || errorData.message || errorData.error || `HTTP ${response.status}`,
                        salesforceId: null,
                        duplicateWarning: null,
                        isUpdate: false
                    };
                }

                const result = await response.json();
                return {
                    success: result.success !== false,
                    status: result.duplicateWarning ? 'duplicate' : (result.success !== false ? 'success' : 'failed'),
                    message: result.message || `HTTP ${response.status}`,
                    salesforceId: result.salesforceId || null,
                    duplicateWarning: result.duplicateWarning || null,
                    isUpdate: result.isUpdate || false,
                    attachmentsTransferred: result.attachments ? result.attachments.filter(a => a.success).length : 0
                };
            } catch (error) {
                return {
                    success: false,
                    status: 'failed',
                    message: error.message || `HTTP ${response?.status || 'unknown'}`,
                    salesforceId: null,
                    duplicateWarning: null,
                    isUpdate: false
                };
            }
        }

        /**
         * Call LS_SetLeadExportStatus stored procedure via Portal OData API
         * Records transfer status in the database (fire-and-forget)
         * @param {string} kontaktViewId - GUID of the lead
         * @param {string} status - Export status (Success/Failed/Duplicate)
         * @param {string} message - Status message
         * @param {number} milliseconds - Transfer duration in ms
         */
        static async callSetLeadExportStatus(kontaktViewId, status, message, milliseconds) {
            if (!kontaktViewId) {
                console.warn('LS_SetLeadExportStatus: Missing kontaktViewId');
                return null;
            }

            const safeStatus = (status || 'Unknown').substring(0, 32);
            const safeMessage = (message || '').replace(/[\r\n]+/g, ' ').replace(/'/g, "''").substring(0, 512);
            const safeMs = Math.max(0, Math.round(milliseconds || 0));

            const id = kontaktViewId.toLowerCase();
            const encodedMessage = encodeURIComponent(safeMessage);
            const endpoint = `LS_SetLeadExportStatus?id='${id}'&status='${safeStatus}'&message='${encodedMessage}'&milliseconds=${safeMs}&$format=json`;

            const credentials = (this._portalConfig?.user && this._portalConfig?.password)
                ? btoa(`${this._portalConfig.user}:${this._portalConfig.password}`)
                : sessionStorage.getItem('credentials');

            if (!credentials) {
                console.warn('[LS_SetLeadExportStatus] Missing portal credentials, skipping');
                return null;
            }

            try {
                // LS_SetLeadExportStatus is on odata_apisf, not odata_online
                // Derive apisf service name from apiName (e.g. "LSTEST-Client01odata_online" → "LSTEST-Client01odata_apisf")
                const url = `${this._portalConfig.baseUrl}/${endpoint}`;

                const response = await fetch(url, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.status === 401) {
                    console.warn('[LS_SetLeadExportStatus] 401 Unauthorized — user lacks access to odata_apisf on this server');
                    return null;
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ LS_SetLeadExportStatus failed (${response.status}):`, errorText);
                    return null;
                }

                const data = await response.json();
                const result = data?.d?.results?.[0] || data?.d;
                console.log(`✅ LS_SetLeadExportStatus recorded:`, result);
                return result;
            } catch (error) {
                console.error('❌ LS_SetLeadExportStatus error:', error);
                return null;
            }
        }

        /**
         * Fetch attachments for a lead (batch-friendly, no DOM manipulation)
         * Uses Portal OData API to fetch attachment data
         * @param {string} attachmentIdList - Comma-separated attachment IDs
         * @returns {Array} Array of { Name, Body, ContentType }
         */
        static async fetchAttachmentsForBatch(attachmentIdList) {
            if (!attachmentIdList) return [];

            const attachmentIds = attachmentIdList.split(',').filter(id => id.trim() !== '');
            if (attachmentIds.length === 0) return [];

            const attachments = [];

            for (const attachmentId of attachmentIds) {
                try {
                    const endpoint = `LS_AttachmentById?Id=%27${encodeURIComponent(attachmentId)}%27&$format=json`;
                    const data = await this._callPortalODataAPI(endpoint);

                    let attachmentData = null;
                    if (data?.d?.results?.length > 0) {
                        attachmentData = data.d.results[0];
                    } else if (data?.d) {
                        attachmentData = data.d;
                    }

                    if (attachmentData?.Body) {
                        const fileName = attachmentData.Name || '';
                        const extension = fileName.split('.').pop().toLowerCase();
                        const isSVG = extension === 'svg' || attachmentData.ContentType === 'image/svg+xml';

                        let processedBody = attachmentData.Body;
                        let finalContentType = attachmentData.ContentType;

                        if (isSVG) {
                            try {
                                const testDecode = atob(attachmentData.Body.replace(/\s+/g, ''));
                                if (testDecode.includes('<svg') || testDecode.includes('<?xml')) {
                                    processedBody = attachmentData.Body.replace(/\s+/g, '');
                                } else {
                                    throw new Error('Not SVG Base64');
                                }
                            } catch {
                                if (attachmentData.Body.includes('<svg') || attachmentData.Body.includes('<?xml')) {
                                    processedBody = btoa(decodeURIComponent(encodeURIComponent(attachmentData.Body)));
                                } else {
                                    processedBody = attachmentData.Body.replace(/\s+/g, '');
                                }
                            }
                            finalContentType = 'image/svg+xml';
                        } else {
                            processedBody = attachmentData.Body.replace(/\s+/g, '');
                            if (!finalContentType) {
                                const mimeTypes = {
                                    'pdf': 'application/pdf', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
                                    'png': 'image/png', 'gif': 'image/gif', 'txt': 'text/plain',
                                    'doc': 'application/msword',
                                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                };
                                finalContentType = mimeTypes[extension] || 'application/octet-stream';
                            }
                        }

                        attachments.push({
                            Name: fileName,
                            Body: processedBody,
                            ContentType: finalContentType
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching attachment ${attachmentId}:`, error);
                }
            }

            return attachments;
        }

        /**
         * Cancel the current batch transfer
         */
        static cancelBatch() {
            this._batchCancelled = true;
            console.log('Batch transfer cancellation requested');
        }

        /**
         * Execute batch transfer of multiple leads
         * Sequential processing (1 at a time) to respect Salesforce API limits
         *
         * @param {Array} items - Array of itemData objects (from OData lead data)
         * @param {Object} options - Configuration
         * @param {Object} options.fieldMappingService - The FieldMappingService instance
         * @param {Function} options.onProgress - Callback(current, total, leadName)
         * @param {Function} options.onLeadComplete - Callback(result) per lead
         * @returns {Object} Summary { results[], successCount, failedCount, duplicateCount, skippedCount, totalMs, cancelled }
         */
        static async executeBatchTransfer(items, options = {}) {
            const { fieldMappingService, onProgress, onLeadComplete, skipExportStatus } = options;

            this._batchCancelled = false;
            const results = [];
            const batchStartTime = Date.now();

            for (let i = 0; i < items.length; i++) {
                if (this._batchCancelled) {
                    for (let j = i; j < items.length; j++) {
                        const skippedItem = items[j];
                        results.push({
                            index: j,
                            itemData: skippedItem,
                            displayName: this.getLeadDisplayName(skippedItem),
                            status: 'skipped',
                            message: 'Cancelled by user',
                            salesforceId: null,
                            milliseconds: 0
                        });
                    }
                    break;
                }

                const item = items[i];
                const displayName = this.getLeadDisplayName(item);

                if (onProgress) onProgress(i + 1, items.length, displayName);

                const leadStartTime = Date.now();

                // Validate required fields
                if (!item.LastName && !item.Company) {
                    const result = {
                        index: i,
                        itemData: item,
                        displayName,
                        status: 'skipped',
                        message: 'Missing required fields (LastName or Company)',
                        salesforceId: null,
                        milliseconds: Date.now() - leadStartTime
                    };
                    results.push(result);
                    if (onLeadComplete) onLeadComplete(result);
                    continue;
                }

                try {
                    // 1. Build SF data
                    const leadData = this.buildLeadDataFromItem(item, fieldMappingService);

                    // 2. Fetch attachments
                    const attachments = await this.fetchAttachmentsForBatch(item.AttachmentIdList);

                    // 3. Transfer to Salesforce (with External ID for upsert if configured)
                    const externalIdField = this.detectExternalIdField(fieldMappingService);
                    const transferResult = await this.transferSingleLead(leadData, attachments, externalIdField);

                    const milliseconds = Date.now() - leadStartTime;

                    // 4. Record export status in DB (fire-and-forget) — skipped for fake/demo data
                    const kontaktViewId = item.Id || this.extractGuidFromMetadata(item);
                    if (kontaktViewId && !skipExportStatus) {
                        this.callSetLeadExportStatus(
                            kontaktViewId,
                            transferResult.duplicateWarning ? 'Duplicate' : (transferResult.success ? 'Success' : 'Failed'),
                            transferResult.message,
                            milliseconds
                        );
                    }

                    const result = {
                        index: i,
                        itemData: item,
                        displayName,
                        status: transferResult.status,
                        message: transferResult.message,
                        salesforceId: transferResult.salesforceId,
                        duplicateWarning: transferResult.duplicateWarning,
                        attachmentsTransferred: transferResult.attachmentsTransferred || 0,
                        milliseconds
                    };

                    results.push(result);
                    if (onLeadComplete) onLeadComplete(result);

                } catch (error) {
                    const milliseconds = Date.now() - leadStartTime;
                    const result = {
                        index: i,
                        itemData: item,
                        displayName,
                        status: 'failed',
                        message: error.message || 'Unexpected error',
                        salesforceId: null,
                        milliseconds
                    };
                    results.push(result);
                    if (onLeadComplete) onLeadComplete(result);
                }
            }

            const summary = {
                results,
                total: items.length,
                successCount: results.filter(r => r.status === 'success').length,
                failedCount: results.filter(r => r.status === 'failed').length,
                duplicateCount: results.filter(r => r.status === 'duplicate').length,
                skippedCount: results.filter(r => r.status === 'skipped').length,
                totalMs: Date.now() - batchStartTime,
                cancelled: this._batchCancelled
            };

            console.log('Batch transfer complete:', summary);
            return summary;
        }

        // ============================================================
        // BATCH TRANSFER MODALS
        // ============================================================

        /** @private Status icons for batch modals */
        static BATCH_STATUS_ICONS = {
            success: '&#10003;',
            failed: '&#10007;',
            duplicate: '&#9888;',
            skipped: '&#8212;'
        };

        /** @private Maps batch statuses onto the semantic state classes (tokens) */
        static BATCH_STATUS_CLASS = {
            success: 'success',
            failed: 'error',
            duplicate: 'warning',
            skipped: 'neutral'
        };

        /**
         * Show batch progress modal with live updates
         * @param {number} totalCount - Total number of leads to transfer
         * @returns {Object} { modal, updateProgress(current, total, leadName), updateLeadStatus(result), close() }
         */
        static showBatchProgressModal(totalCount) {
            const modal = document.createElement('div');
            modal.id = 'batch-progress-modal';
            modal.className = 'sf-modal-overlay';
            modal.style.zIndex = '10001';

            modal.innerHTML = `
                <div class="sf-modal" role="dialog" aria-modal="true" aria-labelledby="batch-progress-title">
                    <div class="sf-modal__header">
                        <span class="sf-icon-badge sf-icon-badge--accent" aria-hidden="true">
                            <i class="fa-solid fa-paper-plane"></i>
                        </span>
                        <h2 class="sf-modal__title" id="batch-progress-title">${_t('crmExport.batchTransferTitle', 'Batch Transfer')}</h2>
                        <span id="batch-progress-counter" style="font-size: 14px; color: var(--sf-text-2); font-variant-numeric: tabular-nums;">0 / ${totalCount}</span>
                    </div>
                    <div class="sf-modal__body">
                        <div id="batch-current-lead" class="sf-tile" style="padding: 12px 16px; margin-bottom: 14px; font-size: 14px;">
                            ${_t('crmExport.preparing', 'Preparing...')}
                        </div>
                        <div class="sf-progress" style="margin-bottom: 16px;" role="progressbar" aria-valuemin="0" aria-valuemax="${totalCount}" aria-valuenow="0">
                            <div id="batch-progress-bar" class="sf-progress__bar"></div>
                        </div>
                        <div id="batch-results-list" class="sf-result-list" style="max-height: 300px;"></div>
                    </div>
                    <div class="sf-modal__footer" style="justify-content: center;">
                        <button id="batch-cancel-btn" class="sf-btn sf-btn--danger-outline">${_t('crmExport.btnCancel', 'Cancel')}</button>
                    </div>
                </div>
            `;

            document.body.classList.add('sf-modal-open');
            document.body.appendChild(modal);

            const cancelBtn = modal.querySelector('#batch-cancel-btn');
            cancelBtn.addEventListener('click', () => {
                SalesforceLeadLib.cancelBatch();
                cancelBtn.textContent = _t('crmExport.cancelling', 'Cancelling...');
                cancelBtn.disabled = true;
            });

            const STATUS_CLASS = this.BATCH_STATUS_CLASS;
            const STATUS_ICONS = this.BATCH_STATUS_ICONS;
            const progressTrack = modal.querySelector('.sf-progress');

            return {
                modal,

                updateProgress(current, total, leadName) {
                    const counter = modal.querySelector('#batch-progress-counter');
                    const bar = modal.querySelector('#batch-progress-bar');
                    const currentLead = modal.querySelector('#batch-current-lead');
                    if (counter) counter.textContent = `${current} / ${total}`;
                    if (bar) bar.style.width = `${(current / total) * 100}%`;
                    if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(current));
                    if (currentLead) currentLead.textContent = `${_t('crmExport.transferring', 'Transferring:')} ${leadName}`;
                },

                updateLeadStatus(result) {
                    const list = modal.querySelector('#batch-results-list');
                    if (!list) return;
                    const stateClass = STATUS_CLASS[result.status] || 'neutral';
                    const icon = STATUS_ICONS[result.status] || '?';
                    const entry = document.createElement('div');
                    entry.className = 'sf-result-row';
                    entry.innerHTML = `
                        <span class="sf-pill sf-pill--${stateClass}" style="width: 22px; justify-content: center; padding: 4px 0;" aria-hidden="true">${icon}</span>
                        <span class="sf-result-row__name">${SalesforceLeadLib._escapeHtml(result.displayName)}</span>
                        <span class="sf-pill sf-pill--${stateClass}">${result.status}</span>
                        <span class="sf-result-row__meta">${result.milliseconds ? (result.milliseconds / 1000).toFixed(1) + 's' : ''}</span>
                    `;
                    list.appendChild(entry);
                    list.scrollTop = list.scrollHeight;
                },

                close() {
                    if (modal.parentNode) modal.parentNode.removeChild(modal);
                    document.body.classList.remove('sf-modal-open');
                }
            };
        }

        /**
         * Show batch summary modal after transfer completes
         * @param {Object} summary - Batch transfer summary from executeBatchTransfer
         * @returns {HTMLElement} The modal element
         */
        static showBatchSummaryModal(summary, onClose) {
            const modal = document.createElement('div');
            modal.id = 'batch-summary-modal';
            modal.className = 'sf-modal-overlay';
            modal.style.zIndex = '10002';

            const totalSeconds = (summary.totalMs / 1000).toFixed(1);
            const STATUS_CLASS = this.BATCH_STATUS_CLASS;
            const STATUS_ICONS = this.BATCH_STATUS_ICONS;

            let headerState = 'success';
            let headerIcon = 'fa-circle-check';
            let headerText = _t('crmExport.batchTransferComplete', 'Batch Transfer Complete');
            if (summary.cancelled) {
                headerState = 'warning';
                headerIcon = 'fa-triangle-exclamation';
                headerText = _t('crmExport.batchTransferCancelled', 'Batch Transfer Cancelled');
            } else if (summary.failedCount > 0 && summary.successCount === 0) {
                headerState = 'error';
                headerIcon = 'fa-circle-xmark';
                headerText = _t('crmExport.batchTransferFailed', 'Batch Transfer Failed');
            } else if (summary.failedCount > 0) {
                headerState = 'warning';
                headerIcon = 'fa-triangle-exclamation';
                headerText = _t('crmExport.batchTransferPartial', 'Batch Transfer Partial');
            }

            const buildStatBox = (label, count, stateClass) => `
                <div class="sf-stat sf-stat--${stateClass}">
                    <div class="sf-stat__value">${count}</div>
                    <div class="sf-stat__label">${label}</div>
                </div>
            `;

            const buildResultRow = (r) => {
                const stateClass = STATUS_CLASS[r.status] || 'neutral';
                const icon = STATUS_ICONS[r.status] || '?';
                const time = r.milliseconds ? `${(r.milliseconds / 1000).toFixed(1)}s` : '';
                const sfId = r.salesforceId ? `<span class="sf-result-row__meta">SF: ${r.salesforceId}</span>` : '';
                const msg = r.message ? `<span class="sf-result-row__meta sf-result-row__msg">${SalesforceLeadLib._escapeHtml(r.message)}</span>` : '';
                return `
                    <div class="sf-result-row">
                        <span class="sf-pill sf-pill--${stateClass}" style="width: 22px; justify-content: center; padding: 4px 0;" aria-hidden="true">${icon}</span>
                        <div style="flex: 1; min-width: 0;">
                            <div class="sf-result-row__name">${SalesforceLeadLib._escapeHtml(r.displayName)}</div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">${sfId}${msg}</div>
                        </div>
                        <span class="sf-pill sf-pill--${stateClass}">${r.status}</span>
                        <span class="sf-result-row__meta" style="min-width: 35px; text-align: right;">${time}</span>
                    </div>
                `;
            };

            modal.innerHTML = `
                <div class="sf-modal" role="dialog" aria-modal="true" aria-labelledby="batch-summary-title">
                    <div class="sf-modal__header">
                        <span class="sf-icon-badge sf-icon-badge--${headerState}" aria-hidden="true">
                            <i class="fa-solid ${headerIcon}"></i>
                        </span>
                        <div style="flex: 1; min-width: 0;">
                            <h2 class="sf-modal__title" id="batch-summary-title">${headerText}</h2>
                            <p class="sf-modal__subtitle">${summary.total} ${_t('crmExport.leadsProcessed', 'leads processed in')} ${totalSeconds}s</p>
                        </div>
                    </div>
                    <div style="display: flex; border-bottom: 1px solid var(--sf-border);">
                        ${buildStatBox(_t('crmExport.statSuccess', 'Success'), summary.successCount, 'success')}
                        ${buildStatBox(_t('crmExport.statFailed', 'Failed'), summary.failedCount, 'error')}
                        ${buildStatBox(_t('crmExport.statDuplicate', 'Duplicate'), summary.duplicateCount, 'warning')}
                        ${buildStatBox(_t('crmExport.statSkipped', 'Skipped'), summary.skippedCount, 'neutral')}
                    </div>
                    <div style="flex: 1; overflow-y: auto; max-height: 350px; padding: 4px 12px;">
                        ${summary.results.map(r => buildResultRow(r)).join('')}
                    </div>
                    <div class="sf-modal__footer" style="justify-content: center;">
                        <button id="batch-summary-close" class="sf-btn sf-btn--primary" style="min-width: 140px;">${_t('crmExport.btnClose', 'Close')}</button>
                    </div>
                </div>
            `;

            document.body.classList.add('sf-modal-open');
            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('#batch-summary-close');
            const closeSummary = () => {
                if (modal.parentNode) modal.parentNode.removeChild(modal);
                document.body.classList.remove('sf-modal-open');
                if (typeof onClose === 'function') {
                    onClose();
                }
                // No reload — cells are already updated in real-time by onLeadComplete
            };
            closeBtn.addEventListener('click', closeSummary);
            closeBtn.focus();
            modal.addEventListener('click', (e) => { if (e.target === modal) closeSummary(); });

            return modal;
        }

        /**
         * Show a confirmation modal for batch operations
         * @param {string} message - Confirmation message
         * @param {Object} options - { title, okText, cancelText, okColor }
         * @returns {Promise<boolean>} true if OK, false if Cancel
         */
        static showBatchConfirmModal(message, { title = _t('crmExport.confirmTitle', 'Confirm'), okText = _t('crmExport.btnOk', 'OK'), cancelText = _t('crmExport.btnCancel', 'Cancel'), okColor = '#2563eb' } = {}) {
            return new Promise((resolve) => {
                const modal = document.createElement('div');
                modal.className = 'sf-modal-overlay';
                modal.style.zIndex = '10003';
                modal.innerHTML = `
                    <div class="sf-modal sf-modal--sm" role="dialog" aria-modal="true" aria-labelledby="sf-confirm-title">
                        <div class="sf-modal__body" style="padding: 24px;">
                            <h3 class="sf-modal__title" id="sf-confirm-title" style="margin-bottom: 12px;">${this._escapeHtml(title)}</h3>
                            <p style="margin: 0; color: var(--sf-text-2); white-space: pre-line;">${this._escapeHtml(message)}</p>
                        </div>
                        <div class="sf-modal__footer">
                            <button id="confirm-cancel-btn" class="sf-btn sf-btn--secondary">${this._escapeHtml(cancelText)}</button>
                            <button id="confirm-ok-btn" class="sf-btn sf-btn--primary">${this._escapeHtml(okText)}</button>
                        </div>
                    </div>
                `;
                document.body.classList.add('sf-modal-open');
                document.body.appendChild(modal);
                const cleanup = (result) => {
                    if (modal.parentNode) modal.parentNode.removeChild(modal);
                    document.body.classList.remove('sf-modal-open');
                    resolve(result);
                };
                modal.querySelector('#confirm-ok-btn').addEventListener('click', () => cleanup(true));
                modal.querySelector('#confirm-cancel-btn').addEventListener('click', () => cleanup(false));
                modal.querySelector('#confirm-cancel-btn').focus();
                modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(false); });
            });
        }

        /**
         * Show an alert modal for batch operations
         * @param {string} message - Alert message
         * @param {Object} options - { title, okText, color }
         * @returns {Promise<void>}
         */
        /**
         * Render a contact list (LS_LeadReport) with checkboxes, toolbar, filter bar, and batch transfer support.
         * Call this once from your Portal page after SalesforceLeadLib is initialized.
         *
         * @param {HTMLElement} rootElement - Container element to inject the UI into
         * @param {string} eventId - Event GUID to filter LS_LeadReport
         * @param {Object} [options]
         * @param {number} [options.pageSize=200] - Max rows to load ($top)
         *
         * @example
         * await SalesforceLeadLib.renderContactList(
         *     document.getElementById('contact-list-container'),
         *     '00000000-0000-0000-0000-000000000000'
         * );
         */

        /**
         * Returns a file-type emoji icon based on content type or file extension.
         */
        static _getAttachmentIcon(contentType, fileName) {
            const ext = (fileName || '').split('.').pop().toLowerCase();
            const ct = (contentType || '').toLowerCase();
            let cls = 'fa-solid fa-file', color = '#6b7280';
            if (ct.startsWith('image/') || ['jpg','jpeg','png','gif','svg','webp'].includes(ext)) { cls = 'fa-solid fa-file-image'; color = '#8b5cf6'; }
            else if (ct === 'application/pdf' || ext === 'pdf') { cls = 'fa-solid fa-file-pdf'; color = '#dc2626'; }
            else if (ct.startsWith('audio/') || ['mp3','wav','ogg'].includes(ext)) { cls = 'fa-solid fa-file-audio'; color = '#16a34a'; }
            else if (ct.startsWith('video/') || ['mp4','webm','mov'].includes(ext)) { cls = 'fa-solid fa-file-video'; color = '#ea580c'; }
            else if (['doc','docx'].includes(ext)) { cls = 'fa-solid fa-file-word'; color = '#2563eb'; }
            else if (['xls','xlsx','csv'].includes(ext)) { cls = 'fa-solid fa-file-excel'; color = '#15803d'; }
            else if (['zip','rar','7z'].includes(ext)) { cls = 'fa-solid fa-file-zipper'; color = '#ca8a04'; }
            return `<i class="${cls}" style="color:${color};"></i>`;
        }

        /**
         * Shows a tabbed attachment viewer modal (like displayLsAttachmentListController).
         * Badge click → this modal opens directly with tabs for each file.
         */
        static async _showAttachmentListModal(attachmentIdList, leadName) {
            const attachmentIds = (attachmentIdList || '').split(',').map(s => s.trim()).filter(Boolean);
            if (attachmentIds.length === 0) return;

            const esc = (s) => this._escapeHtml(String(s ?? ''));
            const _t = (key, fallback) => {
                try { return WinJS.Resources.getString(key).value || fallback; } catch (e) { return fallback; }
            };

            const dialog = document.createElement('dialog');
            dialog.style.cssText = 'border:none;border-radius:12px;padding:0;width:820px;max-width:96vw;height:85vh;box-shadow:0 20px 40px rgba(0,0,0,.35);background:var(--Window,white);display:flex;flex-direction:column;overflow:hidden;';
            dialog.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:var(--ColorAccent,#2563eb);color:#fff;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:18px;">📎</span>
                        <div>
                            <div style="font-weight:700;font-size:14px;" id="sf-av-title">${esc(leadName)}</div>
                            <div style="font-size:11px;opacity:.8;" id="sf-av-subtitle">${attachmentIds.length} ${_t('crmExport.attachmentsCount','attachment(s)')}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <button id="sf-av-download" style="display:none;padding:5px 12px;background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">⬇ ${_t('sforce.btnDownload','Download')}</button>
                        <button id="sf-av-close" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;padding:2px 8px;line-height:1;">&times;</button>
                    </div>
                </div>
                <div id="sf-av-tabs" style="display:flex;gap:4px;padding:8px 12px;background:var(--ColorTileBackground);border-bottom:1px solid var(--ColorLabel);overflow-x:auto;flex-shrink:0;"></div>
                <div id="sf-av-content" style="flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;padding:16px;background:var(--Window);">
                    <div style="display:flex;align-items:center;gap:10px;color:var(--ColorLabel, #6b7280);font-size:14px;">
                        <div style="width:22px;height:22px;border:3px solid var(--ColorLabel, #e5e7eb);border-top-color:var(--ColorAccent,#2563eb);border-radius:50%;animation:sf-spin .8s linear infinite;"></div>
                        ${_t('sforce.loading','Loading...')}
                    </div>
                </div>`;

            if (document.body.classList.contains('cnv-ui-dark')) {
                dialog.classList.add('cnv-ui-dark');
            }

            document.body.appendChild(dialog);
            dialog.showModal();

            const closeDialog = () => { dialog.close(); dialog.remove(); };
            dialog.querySelector('#sf-av-close').addEventListener('click', closeDialog);
            dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });

            const tabsEl = dialog.querySelector('#sf-av-tabs');
            const contentEl = dialog.querySelector('#sf-av-content');
            const downloadBtn = dialog.querySelector('#sf-av-download');
            const subtitleEl = dialog.querySelector('#sf-av-subtitle');

            let currentDownload = null;

            const setActiveTab = (activeTab) => {
                tabsEl.querySelectorAll('.sf-av-tab').forEach(t => {
                    t.style.background = 'var(--ColorTileBackground,#f3f4f6)';
                    t.style.color = 'var(--WindowText,#374151)';
                    t.style.borderColor = 'var(--ColorLabel,#d1d5db)';
                });
                activeTab.style.background = 'var(--ColorAccent,#2563eb)';
                activeTab.style.color = '#fff';
                activeTab.style.borderColor = 'var(--ColorAccent,#2563eb)';
            };

            // Fetch all attachments in parallel — names + body in one go

            const metas = await Promise.all(attachmentIds.map(async (id, i) => {
                try {
                    const endpoint = `LS_AttachmentById?Id=%27${encodeURIComponent(id)}%27&$format=json`;
                    const data = await SalesforceLeadLib._callPortalODataAPI(endpoint);
                    const att = data?.d?.results?.[0] || data?.d || {};
                    return { id, name: att.Name || `Attachment ${i + 1}`, contentType: att.ContentType || '', body: att.Body, bodyLength: att.BodyLength };
                } catch {
                    return { id, name: `Attachment ${i + 1}`, contentType: '', body: null };
                }
            }));

            // Build tabs with real names + icons
            metas.forEach((meta, i) => {
                const shortName = meta.name.length > 22 ? meta.name.substring(0, 20) + '…' : meta.name;
                const label = `${SalesforceLeadLib._getAttachmentIcon(meta.contentType, meta.name)} <span>${esc(shortName)}</span>`;
                const tab = document.createElement('button');
                tab.className = 'sf-av-tab';
                tab.innerHTML = label;
                tab.title = meta.name;
                tab.dataset.idx = i;
                tab.style.cssText = 'padding:5px 12px;border-radius:6px;border:1px solid var(--ColorLabel, #d1d5db);background:var(--ColorTileBackground, #f3f4f6);color:var(--WindowText, #374151);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s;';
                tab.addEventListener('click', () => renderFromMeta(metas[i], tab));
                tabsEl.appendChild(tab);
            });

            // Render from already-fetched meta (no second fetch needed)
            const renderFromMeta = (meta, tab) => {
                setActiveTab(tab);
                subtitleEl.textContent = meta.name;
                downloadBtn.style.display = 'none';
                currentDownload = null;

                if (!meta.body) {
                    contentEl.innerHTML = `<div style="color:var(--ColorLabel, #6b7280);text-align:center;padding:32px;">${_t('sforce.noAttachmentContent','No file content available.')}</div>`;
                    return;
                }

                const base64 = meta.body.replace(/\s+/g, '');
                const fileType = meta.contentType || '';
                const fileName = meta.name;
                const dataUrl = `data:${fileType};base64,${base64}`;

                currentDownload = { dataUrl, fileName };
                downloadBtn.style.display = 'inline-block';
                downloadBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = currentDownload.dataUrl;
                    a.download = currentDownload.fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };

                if (fileType === 'image/svg+xml' || fileName.toLowerCase().endsWith('.svg')) {
                    try {
                        const svgString = atob(base64);
                        contentEl.innerHTML = `<div style="width:100%;max-height:100%;overflow:auto;background:#fff;border-radius:8px;padding:12px;box-sizing:border-box;">${svgString}</div>`;
                        const svgEl = contentEl.querySelector('svg');
                        if (svgEl) { svgEl.style.width = '100%'; svgEl.style.height = 'auto'; svgEl.style.maxHeight = '60vh'; }
                        else contentEl.innerHTML = `<object data="${dataUrl}" type="image/svg+xml" style="width:100%;height:60vh;">SVG not supported</object>`;
                    } catch {
                        contentEl.innerHTML = `<object data="${dataUrl}" type="image/svg+xml" style="width:100%;height:60vh;">SVG not supported</object>`;
                    }
                } else if (fileType.startsWith('image/')) {
                    contentEl.innerHTML = `<img src="${dataUrl}" alt="${esc(fileName)}" style="max-width:100%;max-height:65vh;object-fit:contain;" />`;
                } else if (fileType === 'application/pdf') {
                    contentEl.innerHTML = `<iframe src="${dataUrl}#view=Fit" style="width:100%;height:65vh;border:none;" type="application/pdf"></iframe>`;
                } else if (fileType.startsWith('audio/')) {
                    contentEl.innerHTML = `<audio controls style="width:100%;"><source src="${dataUrl}" type="${esc(fileType)}"></audio>`;
                } else if (fileType.startsWith('video/')) {
                    contentEl.innerHTML = `<video controls style="width:100%;max-height:65vh;"><source src="${dataUrl}" type="${esc(fileType)}"></video>`;
                } else {
                    const sizeKb = meta.bodyLength ? `${(meta.bodyLength / 1024).toFixed(1)} KB` : '';
                    contentEl.innerHTML = `<div style="text-align:center;color:#6b7280;padding:32px;"><div style="font-size:48px;margin-bottom:12px;">${SalesforceLeadLib._getAttachmentIcon(fileType, fileName)}</div><div style="font-weight:600;margin-bottom:4px;">${esc(fileName)}</div><div style="font-size:12px;">${esc(fileType)} ${sizeKb}</div><div style="margin-top:8px;font-size:12px;">${_t('sforce.noAttachmentContent','Preview not available — use Download.')}</div></div>`;
                }
            };

            // Render first tab
            const firstTab = tabsEl.querySelector('.sf-av-tab');
            if (firstTab) renderFromMeta(metas[0], firstTab);
        }

        static async renderContactList(rootElement, eventId, options = {}) {
            injectCSS();
            const { pageSize = 100 } = options;

            // --- Helpers ---
            const esc = (s) => this._escapeHtml(String(s ?? ''));

            const DATE_PATTERNS = ['Date', 'Timestamp', 'Modstamp'];
            const isDateCol = (col) => DATE_PATTERNS.some(p => col.includes(p));

            const formatCell = (col, val) => {
                if (val == null) return '';
                const s = String(val);
                // OData /Date(ms)/ → YYYY-MM-DD
                const m = s.match(/^\/Date\((\d+)\)\/$/);
                if (m) {
                    return new Date(parseInt(m[1])).toISOString().split('T')[0];
                }
                // ISO date strings in date columns → YYYY-MM-DD
                if (isDateCol(col) && s.length >= 10) {
                    const d = new Date(s);
                    if (!isNaN(d)) return d.toISOString().split('T')[0];
                }
                return s;
            };

            const getExportDotClass = (status) => {
                if (!status) return '';
                const s = status.toLowerCase();
                if (s === 'success') return 'dot-success';
                if (s === 'failed') return 'dot-failed';
                if (s === 'duplicate') return 'dot-duplicate';
                return '';
            };

            const getRowClass = (status) => {
                if (!status) return '';
                const s = status.toLowerCase();
                if (s === 'success') return 'sf-cl-row-success';
                if (s === 'failed') return 'sf-cl-row-failed';
                if (s === 'duplicate') return 'sf-cl-row-duplicate';
                return '';
            };

            // --- Session cache (stale-while-revalidate) ---
            // Tab switches destroy/recreate the page, re-fetching everything.
            // If we already have this event's contacts in the session cache,
            // render them instantly and refresh silently in the background.
            const contactsCacheKey = `contacts:${eventId}`;
            const forceRefresh = options.forceRefresh === true;
            if (forceRefresh) {
                SalesforceLeadLib._dataCache.delete(contactsCacheKey);
                SalesforceLeadLib._dataCache.delete(`fieldmap:${eventId}`);
            }
            const cachedContacts = SalesforceLeadLib._dataCache.get(contactsCacheKey);

            // --- Loading spinner (skipped on a cache hit — content is instant) ---
            if (!cachedContacts) {
                rootElement.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;min-height:200px;">
                        <span class="sf-spinner sf-spinner--lg"></span>
                        <p style="margin-top:14px;font-size:14px;color:var(--sf-text-2);font-family:var(--sf-font);">${_t('crmExport.loadingContacts', 'Loading contacts…')}</p>
                    </div>`;
            }

            try {
                // --- Load field mappings ---
                const instance = this._getInstance();
                if (!instance) throw new Error('SalesforceLeadLib not initialized. Call SalesforceLeadLib.init() first.');
                const fieldMappingService = instance.fieldMappingService;

                // Reload field config (served from the session cache unless a
                // save invalidated it — see loadFieldMappingsFromAPI)
                await fieldMappingService.loadFieldMappingsFromAPI(eventId);

                // --- Load LS_LeadReport data ---
                // OData only supports __next for first 2 pages; use $skip for full pagination.
                // Load first page only — remaining pages loaded via infinite scroll on scroll.
                const buildEndpoint = (skip) =>
                    `LS_LeadReport?$filter=EventId eq '${eventId}'&$top=${pageSize}&$skip=${skip}&$format=json`;

                let allItems = [];
                let currentSkip = 0;
                let hasMorePages = false;
                const servedFromCache = !!cachedContacts;
                if (cachedContacts) {
                    // Same object references as the previous visit — local batch
                    // status updates stay visible; background refresh follows.
                    allItems = cachedContacts.items;
                    currentSkip = cachedContacts.skip;
                    hasMorePages = cachedContacts.hasMore;
                } else {
                    const firstData = await this._callPortalODataAPI(buildEndpoint(0));
                    allItems = firstData?.d?.results || [];
                    currentSkip = allItems.length;
                    // More pages exist if we got a full page
                    hasMorePages = allItems.length === pageSize;
                }

                // --- Fake data fallback for events with no contacts ---
                let isFakeData = false;
                const _fakeStatusKey = `sf_demo_export_status_${eventId}`;
                if (allItems.length === 0 && window.fakeDataGenerator) {
                    isFakeData = true;

                    // Build a reverse map: sfFieldName → odataFieldName from customLabels
                    // e.g. { 'LastName': 'Nachname', 'FirstName': 'Vorname', ... }
                    const customLabels = fieldMappingService?.customLabels || {};
                    const sfToOdata = {};
                    for (const [odataField, sfField] of Object.entries(customLabels)) {
                        sfToOdata[sfField] = odataField;
                    }

                    // SF fields that fakeDataGenerator can produce (State excluded — SF picklist fails with German values)
                    const FAKE_SF_FIELDS = ['LastName', 'FirstName', 'Company', 'Email', 'Phone', 'MobilePhone',
                        'Title', 'Street', 'City', 'PostalCode', 'Country', 'Description'];

                    let savedFakeStatuses = {};
                    try { savedFakeStatuses = JSON.parse(localStorage.getItem(_fakeStatusKey) || '{}'); } catch (e) {}

                    for (let i = 0; i < 50; i++) {
                        const result = window.fakeDataGenerator.fillEmptyFields({}, FAKE_SF_FIELDS);
                        const sfData = result.data;

                        // Build item using OData field names (as keys) so isFieldActive() matches
                        const item = {};
                        for (const sfField of FAKE_SF_FIELDS) {
                            const odataField = sfToOdata[sfField] || sfField; // fallback to SF name if no mapping
                            item[odataField] = sfData[sfField];
                        }

                        item.Id = `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`;
                        const saved = savedFakeStatuses[item.Id] || {};
                        item.LastExportStatus = saved.LastExportStatus || '';
                        item.LastExportTimestamp = saved.LastExportTimestamp || '';
                        item.LastExportMessage = saved.LastExportMessage || '';
                        item.ExportAttempts = saved.ExportAttempts || '';
                        allItems.push(item);
                    }
                    console.log('[CRM Export] No contacts found — showing fake demo data');
                }

                // Seed/update the session cache (never for demo data)
                if (!isFakeData) {
                    SalesforceLeadLib._dataCache.set(contactsCacheKey, {
                        items: allItems, skip: currentSkip, hasMore: hasMorePages, savedAt: Date.now()
                    });
                }

                // --- Determine columns ---
                const EXPORT_STATUS_FIELDS = ['LastExportStatus', 'LastExportTimestamp', 'LastExportMessage', 'ExportAttempts'];
                // 'Id' is intentionally NOT hidden — user may activate it in CRM Settings (e.g. mapped to LS_LeadId__c)
                const HIDDEN_FIELDS = new Set(['__metadata', 'AttachmentIdList', 'EventId']);

                const hasFieldConfig = fieldMappingService?.fieldConfig?.config?.fields?.length > 0;

                const allODataColumns = allItems.length > 0
                    ? Object.keys(allItems[0]).filter(k => !HIDDEN_FIELDS.has(k))
                    : [];

                const exportStatusSet = new Set(EXPORT_STATUS_FIELDS);
                const REQUIRED_FIELDS = ['LastName', 'Company'];
                const requiredSet = new Set(REQUIRED_FIELDS);

                // For fake data: show all generated columns (no field config filtering)
                // For real data: filter by active fields if config exists
                const activeODataColumns = hasFieldConfig
                    ? allODataColumns.filter(col => exportStatusSet.has(col) || requiredSet.has(col) || fieldMappingService.isFieldActive(col))
                    : allODataColumns;

                // An active field must show as a column even if it's absent from the loaded
                // rows — e.g. system fields (CreatedById, …) that the fake-data generator
                // doesn't produce, or a field the first OData row happens not to carry.
                // Append any active configured field that isn't already a column.
                if (hasFieldConfig) {
                    const alreadyColumns = new Set(activeODataColumns);
                    const configFields = fieldMappingService?.fieldConfig?.config?.fields || [];
                    for (const f of configFields) {
                        if (f.active === true && f.fieldName
                            && !alreadyColumns.has(f.fieldName)
                            && !HIDDEN_FIELDS.has(f.fieldName)
                            && !exportStatusSet.has(f.fieldName)) {
                            activeODataColumns.push(f.fieldName);
                            alreadyColumns.add(f.fieldName);
                        }
                    }
                }

                // Active custom fields (not from OData, have fixed values)
                const activeCustomFields = (fieldMappingService?.customFields || [])
                    .filter(cf => cf.active === true && cf.sfFieldName);
                const customFieldColumns = activeCustomFields.map(cf => cf.sfFieldName);
                const customFieldValues = {};
                activeCustomFields.forEach(cf => { customFieldValues[cf.sfFieldName] = cf.value || ''; });

                const displayColumns = [...new Set([...EXPORT_STATUS_FIELDS, ...activeODataColumns, ...customFieldColumns])];

                const getColumnLabel = (col) => fieldMappingService?.customLabels?.[col] || col;

                // Filter inputs: static default fields, only shown if present in OData columns
                const DEFAULT_FILTER_FIELDS = [
                    'FirstName', 'LastName', 'Company', 'Email', 'City', 'Country',
                    'MobilePhone', 'Phone', 'PostalCode', 'State', 'Street', 'Title', 'Description'
                ];
                const displayColumnSet = new Set(displayColumns);
                const activeFilterFields = DEFAULT_FILTER_FIELDS.filter(f => displayColumnSet.has(f));

                // --- SF Connection check ---
                // `let` (not const): the connect/disconnect buttons refresh this in place
                // via _refreshSfStatusBar() instead of re-rendering the whole list, so the
                // already-loaded contacts and the infinite-scroll state are preserved.
                let sfStatus = await this._checkSfConnectionSilent();

                // --- Build CSS + HTML ---
                const STICKY_COL_LEFT = 52; // left offset: 32px checkbox + 20px dot column
                const colHeaders = displayColumns.map((col, i) => {
                    const label = getColumnLabel(col);
                    if (i === 0) return `<th class="sf-cl-th sf-cl-th-first-data" style="position:sticky;left:${STICKY_COL_LEFT}px;z-index:3;background:var(--sf-table-header-bg);">${esc(label)}</th>`;
                    return `<th class="sf-cl-th">${esc(label)}</th>`;
                }).join('');

                const filterHTML = activeFilterFields.map(col => {
                    const inputType = isDateCol(col) ? 'date' : 'text';
                    return `<div class="sf-cl-fg">
                        <input class="sf-cl-filter-input" id="sf-cl-fi-${esc(col)}" data-col="${esc(col)}"
                            type="${inputType}" placeholder=" " />
                        <label for="sf-cl-fi-${esc(col)}">${esc(getColumnLabel(col))}</label>
                    </div>`;
                }).join('');

                // SF connection status card (same design as CRM Settings)
                const sfDisplayName = sfStatus.userInfo || 'Salesforce User';
                const sfInitials = sfDisplayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const sfBtnHtml = `
                    <div class="sf-cl-status-wrap">
                        <div id="sf-cl-status-card" class="sf-cl-status-card${sfStatus.connected ? ' connected' : ''}">
                            <div id="sf-cl-status-dot" class="sf-cl-status-dot${sfStatus.connected ? ' connected' : ''}"></div>
                            <span id="sf-cl-status-text" class="sf-cl-status-text${sfStatus.connected ? ' connected' : ''}">${sfStatus.connected ? _t('sforce.statusConnected', 'Connected') : _t('sforce.statusDisconnected', 'Disconnected')}</span>
                            <div id="sf-cl-user-section" class="sf-cl-user-section${sfStatus.connected ? ' visible' : ''}">
                                <div id="sf-cl-user-avatar" class="sf-cl-user-avatar">${sfStatus.connected ? esc(sfInitials) : '?'}</div>
                                <span id="sf-cl-user-name" class="sf-cl-user-name">${sfStatus.connected ? esc(sfDisplayName) : ''}</span>
                            </div>
                        </div>
                        <button id="sf-cl-disconnect-btn" class="sf-cl-btn-disconnect" style="display:${sfStatus.connected ? 'flex' : 'none'};">${_t('sforce.btnDisconnect', 'Disconnect')}</button>
                        <button id="sf-cl-connect-btn" class="sf-cl-btn-connect" style="display:${sfStatus.connected ? 'none' : 'flex'};">${_t('sforce.btnConnectShort', 'Connect SF')}</button>
                    </div>`;

                rootElement.innerHTML = `
                    <div class="sf-cl-wrap">
                        <div class="sf-cl-toolbar">
                            <button class="sf-cl-btn sf-cl-btn-batch" id="sf-cl-batch-btn" disabled>${_t('crmExport.startBatchTransfer', 'Start Batch Transfer')} (0)</button>
                            <button class="sf-cl-btn sf-cl-btn-refresh" id="sf-cl-refresh-btn">${_t('crmExport.btnRefresh', 'Refresh')}</button>
                            ${activeFilterFields.length > 0 ? `
                            <button class="sf-cl-btn sf-cl-btn-toggle" id="sf-cl-filter-btn" title="${_t('crmExport.toggleFilters', 'Toggle Filters')}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>` : ''}
                            <div class="sf-cl-status-filter" id="sf-cl-status-filter">
                                <span class="sf-cl-filter-label">${_t('crmExport.filterStatus', 'Status:')}</span>
                                <button class="sf-cl-status-pill active" data-status="">${_t('crmExport.filterAll', 'All')} <span id="sf-cl-pill-all-count"></span></button>
                                <button class="sf-cl-status-pill pill-empty" data-status="__empty">${_t('crmExport.filterNotExported', 'Not exported')} <span id="sf-cl-pill-empty-count"></span></button>
                                <button class="sf-cl-status-pill pill-success" data-status="success">${_t('crmExport.filterSuccess', 'Success')} <span id="sf-cl-pill-success-count"></span></button>
                                <button class="sf-cl-status-pill pill-failed" data-status="failed">${_t('crmExport.filterFailed', 'Failed')} <span id="sf-cl-pill-failed-count"></span></button>
                                <button class="sf-cl-status-pill pill-dup" data-status="duplicate">${_t('crmExport.filterDuplicate', 'Duplicate')} <span id="sf-cl-pill-dup-count"></span></button>
                                <span style="width:1px;height:24px;background:var(--sf-border-strong);margin:0 6px;display:inline-block;"></span>
                                <select id="sf-cl-completeness-select" aria-label="${_t('crmExport.filterAllComplete', 'All Leads')}">
                                    <option value="">${_t('crmExport.filterAllComplete', 'All Leads')}</option>
                                    <option value="vollstaendig">${_t('crmExport.filterComplete', 'Complete Leads')}</option>
                                    <option value="unvollstaendig">${_t('crmExport.filterIncomplete', 'Incomplete Leads')}</option>
                                </select>
                            </div>
                            <span class="sf-cl-count" id="sf-cl-count">${allItems.length} ${_t('crmExport.contacts', 'contacts')}</span>
                            ${isFakeData ? `<span class="sf-pill sf-pill--warning sf-pill--xs"><i class="fa-solid fa-flask" aria-hidden="true"></i> ${_t('crmExport.demoData', 'Demo Data')}</span>` : ''}
                            ${sfBtnHtml}
                        </div>
                        <div class="sf-cl-filter-bar" id="sf-cl-filter-bar">
                            ${filterHTML}
                            <div class="sf-cl-filter-group">
                                <label class="sf-cl-filter-label">${_t('crmExport.filterDateVon', 'Erfassungsdatum Von')}</label>
                                <input type="date" class="sf-cl-filter-input" id="sf-cl-date-von" />
                            </div>
                            <div class="sf-cl-filter-group">
                                <label class="sf-cl-filter-label">${_t('crmExport.filterDateBis', 'Bis')}</label>
                                <input type="date" class="sf-cl-filter-input" id="sf-cl-date-bis" />
                            </div>
                            <div class="sf-cl-filter-actions">
                                <button class="sf-cl-btn-apply" id="sf-cl-apply-btn">${_t('crmExport.btnApplyFilters', 'Apply Filters')}</button>
                                <button class="sf-cl-btn-reset" id="sf-cl-reset-btn" disabled>${_t('crmExport.btnResetFilters', 'Reset Filters')}</button>
                            </div>
                        </div>
                        <div id="sf-cl-filter-hint" class="sf-cl-filter-hint" style="display:none;" role="status">
                            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> <span id="sf-cl-filter-hint-text"></span>
                        </div>
                        <div class="sf-cl-table-wrap">
                            <table class="sf-cl-table" id="sf-cl-table">
                                <thead>
                                    <tr>
                                        <th class="sf-cl-th sf-cl-th-sticky" style="width:32px;left:0;">
                                            <input type="checkbox" id="sf-cl-select-all" title="${_t('crmExport.selectAll', 'Select all')}" />
                                        </th>
                                        <th class="sf-cl-th" style="width:20px;position:sticky;left:32px;z-index:3;background:var(--sf-table-header-bg);"></th>
                                        <th class="sf-cl-th" style="width:55px;text-align:center;">${_t('crmExport.colAttachments', 'Attach.')}</th>
                                        ${colHeaders}
                                    </tr>
                                </thead>
                                <tbody id="sf-cl-tbody"></tbody>
                            </table>
                            <div id="sf-cl-empty" class="sf-cl-empty" style="display:none;">${_t('crmExport.noContactsFound', 'No contacts found.')}</div>
                        </div>
                    </div>`;

                // --- Fix parent layout: make .contentarea a flex column so we fill remaining height ---
                const contentArea = rootElement.closest('.contentarea');
                if (contentArea) {
                    contentArea.style.display = 'flex';
                    contentArea.style.flexDirection = 'column';
                    contentArea.style.overflow = 'hidden';
                }
                const contentRecord = rootElement.closest('.content-record');
                if (contentRecord) {
                    contentRecord.style.flex = '1';
                    contentRecord.style.minHeight = '0';
                    contentRecord.style.display = 'flex';
                    contentRecord.style.flexDirection = 'column';
                }
                rootElement.style.flex = '1';
                rootElement.style.minHeight = '0';
                rootElement.style.display = 'flex';
                rootElement.style.flexDirection = 'column';

                // --- Render rows ---
                const renderRows = (items) => {
                    const tbody = rootElement.querySelector('#sf-cl-tbody');
                    const emptyEl = rootElement.querySelector('#sf-cl-empty');
                    const countEl = rootElement.querySelector('#sf-cl-count');

                    tbody.innerHTML = items.map(item => {
                        const exportStatus = item.LastExportStatus || '';
                        const rowClass = getRowClass(exportStatus);
                        const dotClass = getExportDotClass(exportStatus);
                        const cells = displayColumns.map((col, i) => {
                            const cellValue = item[col] !== undefined ? item[col] : (customFieldValues[col] || '');
                            if (i === 0) return `<td class="sf-cl-td sf-cl-td-first-data" style="position:sticky;left:${STICKY_COL_LEFT}px;z-index:1;background:inherit;">${esc(formatCell(col, cellValue))}</td>`;
                            return `<td class="sf-cl-td">${esc(formatCell(col, cellValue))}</td>`;
                        }).join('');
                        const attachIds = (item.AttachmentIdList || '').split(',').filter(s => s.trim());
                        const attachCount = attachIds.length;
                        const attachCell = attachCount > 0
                            ? `<td class="sf-cl-td" style="text-align:center;"><button class="sf-cl-attach-badge" data-attach-ids="${esc(item.AttachmentIdList || '')}" data-lead-name="${esc(item.LastName || item.Company || item.Id || '')}" title="${_t('crmExport.viewAttachments', 'View attachments')}" aria-label="${_t('crmExport.viewAttachments', 'View attachments')} (${attachCount})"><i class="fa-solid fa-paperclip" aria-hidden="true"></i> ${attachCount}</button></td>`
                            : `<td class="sf-cl-td" style="text-align:center;color:var(--ColorLabel);">—</td>`;
                        return `<tr class="sf-cl-row ${rowClass}" data-lead-id="${esc(item.Id)}">
                            <td class="sf-cl-td sf-cl-td-sticky"><input type="checkbox" class="sf-cl-row-cb" /></td>
                            <td class="sf-cl-td sf-cl-td-first-data" style="text-align:center;position:sticky;left:32px;z-index:1;background:var(--Window);">
                                ${dotClass ? `<span class="sf-export-badge-dot ${dotClass}" title="${esc(exportStatus)}"></span>` : ''}
                            </td>
                            ${attachCell}
                            ${cells}
                        </tr>`;
                    }).join('');

                    emptyEl.style.display = items.length === 0 ? 'block' : 'none';
                    const totalLabel = hasMorePages ? `${allItems.length}+` : `${allItems.length}`;
                    if (countEl) countEl.textContent = `${items.length} / ${totalLabel} ${_t('crmExport.contacts', 'contacts')}`;

                    // Filtering is in-memory over the already-loaded pages. When a filter is
                    // active and more pages remain unloaded, warn the user that matches in
                    // not-yet-scrolled pages are not shown — otherwise a missing contact looks
                    // like "not found" when it is simply not loaded yet.
                    const hint = rootElement.querySelector('#sf-cl-filter-hint');
                    const hintText = rootElement.querySelector('#sf-cl-filter-hint-text');
                    if (hint && hintText) {
                        if (isAnyFilterActive() && hasMorePages) {
                            hintText.textContent = `${_t('crmExport.filterPartialWarning', 'Filtering only the loaded contacts — scroll down to load and include more.')} (${allItems.length}${hasMorePages ? '+' : ''})`;
                            hint.style.display = 'block';
                        } else {
                            hint.style.display = 'none';
                        }
                    }
                    updateBatchBtn();
                };

                // True when any text/date filter or status/completeness filter is set.
                const isAnyFilterActive = () => {
                    if (activeStatusFilter !== '' || activeCompleteFilter !== '') return true;
                    return [...rootElement.querySelectorAll('.sf-cl-filter-input')].some(i => i.value.trim() !== '');
                };

                // Append new rows to existing tbody (used by infinite scroll)
                const appendRows = (items) => {
                    const tbody = rootElement.querySelector('#sf-cl-tbody');
                    const countEl = rootElement.querySelector('#sf-cl-count');
                    tbody.insertAdjacentHTML('beforeend', items.map(item => {
                        const exportStatus = item.LastExportStatus || '';
                        const rowClass = getRowClass(exportStatus);
                        const dotClass = getExportDotClass(exportStatus);
                        const cells = displayColumns.map((col, i) => {
                            const cellValue = item[col] !== undefined ? item[col] : (customFieldValues[col] || '');
                            if (i === 0) return `<td class="sf-cl-td sf-cl-td-first-data" style="position:sticky;left:${STICKY_COL_LEFT}px;z-index:1;background:inherit;">${esc(formatCell(col, cellValue))}</td>`;
                            return `<td class="sf-cl-td">${esc(formatCell(col, cellValue))}</td>`;
                        }).join('');
                        const attachIds = (item.AttachmentIdList || '').split(',').filter(s => s.trim());
                        const attachCount = attachIds.length;
                        const attachCell = attachCount > 0
                            ? `<td class="sf-cl-td" style="text-align:center;"><button class="sf-cl-attach-badge" data-attach-ids="${esc(item.AttachmentIdList || '')}" data-lead-name="${esc(item.LastName || item.Company || item.Id || '')}" title="${_t('crmExport.viewAttachments', 'View attachments')}" aria-label="${_t('crmExport.viewAttachments', 'View attachments')} (${attachCount})"><i class="fa-solid fa-paperclip" aria-hidden="true"></i> ${attachCount}</button></td>`
                            : `<td class="sf-cl-td" style="text-align:center;color:var(--ColorLabel);">—</td>`;
                        return `<tr class="sf-cl-row ${rowClass}" data-lead-id="${esc(item.Id)}">
                            <td class="sf-cl-td sf-cl-td-sticky"><input type="checkbox" class="sf-cl-row-cb" /></td>
                            <td class="sf-cl-td sf-cl-td-first-data" style="text-align:center;position:sticky;left:32px;z-index:1;background:var(--Window);">
                                ${dotClass ? `<span class="sf-export-badge-dot ${dotClass}" title="${esc(exportStatus)}"></span>` : ''}
                            </td>
                            ${attachCell}
                            ${cells}
                        </tr>`;
                    }).join(''));
                    const totalLabel = hasMorePages ? `${allItems.length}+` : `${allItems.length}`;
                    const visibleRows = rootElement.querySelectorAll('#sf-cl-tbody tr').length;
                    if (countEl) countEl.textContent = `${visibleRows} / ${totalLabel} ${_t('crmExport.contacts', 'contacts')}`;
                    updateBatchBtn();
                };

                const updateBatchBtn = () => {
                    const batchBtn = rootElement.querySelector('#sf-cl-batch-btn');
                    if (!batchBtn) return;
                    const checked = rootElement.querySelectorAll('.sf-cl-row-cb:checked');
                    // Disable unless Salesforce is connected AND at least one row is selected —
                    // without a connection a transfer can only fail, so don't let it start.
                    batchBtn.disabled = !sfStatus.connected || checked.length === 0;
                    batchBtn.title = sfStatus.connected ? '' : _t('crmExport.connectFirst', 'Connect to Salesforce first');
                    batchBtn.textContent = `${_t('crmExport.startBatchTransfer', 'Start Batch Transfer')} (${checked.length})`;
                };

                // Re-check the SF connection and update ONLY the status bar + batch button.
                // Used by the connect/disconnect buttons so the loaded contacts and the
                // infinite-scroll state (allItems / currentSkip / observer) stay intact —
                // the connection state never affects the contact list itself.
                const refreshSfStatusBar = async () => {
                    sfStatus = await this._checkSfConnectionSilent();
                    const card        = rootElement.querySelector('#sf-cl-status-card');
                    const dot         = rootElement.querySelector('#sf-cl-status-dot');
                    const statusText  = rootElement.querySelector('#sf-cl-status-text');
                    const userSection = rootElement.querySelector('#sf-cl-user-section');
                    const userAvatar  = rootElement.querySelector('#sf-cl-user-avatar');
                    const userName    = rootElement.querySelector('#sf-cl-user-name');
                    const connectBtn  = rootElement.querySelector('#sf-cl-connect-btn');
                    const disconnect  = rootElement.querySelector('#sf-cl-disconnect-btn');

                    const connected = !!sfStatus.connected;
                    const name = sfStatus.userInfo || 'Salesforce User';
                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                    if (card)       card.classList.toggle('connected', connected);
                    if (dot)        dot.classList.toggle('connected', connected);
                    if (statusText) {
                        statusText.classList.toggle('connected', connected);
                        statusText.textContent = connected
                            ? _t('sforce.statusConnected', 'Connected')
                            : _t('sforce.statusDisconnected', 'Disconnected');
                    }
                    if (userSection) userSection.classList.toggle('visible', connected);
                    if (userAvatar)  userAvatar.textContent = connected ? initials : '?';
                    if (userName)    userName.textContent = connected ? name : '';
                    if (disconnect)  disconnect.style.display = connected ? 'flex' : 'none';
                    if (connectBtn)  connectBtn.style.display = connected ? 'none' : 'flex';

                    updateBatchBtn();
                };

                let activeStatusFilter = ''; // '' = All, '__empty' = not exported, 'success', 'failed', 'duplicate'
                let activeCompleteFilter = ''; // '' = Alle, 'vollstaendig', 'unvollstaendig'

                const extractTimestamp = (odataDate) => {
                    const m = String(odataDate || '').match(/\/Date\((\d+)\)\//);
                    return m ? parseInt(m[1]) : null;
                };

                const updateStatusPillCounts = () => {
                    const counts = { '': allItems.length, '__empty': 0, 'success': 0, 'failed': 0, 'duplicate': 0 };
                    allItems.forEach(item => {
                        const s = (item.LastExportStatus || '').toLowerCase();
                        if (!s) counts['__empty']++;
                        else if (s === 'success') counts['success']++;
                        else if (s === 'failed') counts['failed']++;
                        else if (s === 'duplicate') counts['duplicate']++;
                    });
                    const map = { '': '#sf-cl-pill-all-count', '__empty': '#sf-cl-pill-empty-count', 'success': '#sf-cl-pill-success-count', 'failed': '#sf-cl-pill-failed-count', 'duplicate': '#sf-cl-pill-dup-count' };
                    Object.entries(map).forEach(([key, sel]) => {
                        const el = rootElement.querySelector(sel);
                        if (el) el.textContent = `(${counts[key]})`;
                    });
                };

                const updateResetBtn = () => {
                    const resetBtn = rootElement.querySelector('#sf-cl-reset-btn');
                    if (!resetBtn) return;
                    const hasValue = [...rootElement.querySelectorAll('.sf-cl-filter-input')]
                        .some(i => i.value.trim() !== '');
                    const completenessVal = rootElement.querySelector('#sf-cl-completeness-select')?.value || '';
                    resetBtn.disabled = !hasValue && activeStatusFilter === '' && activeCompleteFilter === '' && completenessVal === '';
                };

                renderRows(allItems);
                updateStatusPillCounts();

                // --- Silent revalidation (stale-while-revalidate) ---
                // The cached list rendered instantly above; now re-fetch the same
                // range in ONE request and swap it in, preserving the user's
                // selection, active filters and scroll position. On failure the
                // cached view simply stays.
                if (servedFromCache) {
                    (async () => {
                        try {
                            const topCount = Math.max(allItems.length, pageSize);
                            const fresh = await this._callPortalODataAPI(
                                `LS_LeadReport?$filter=EventId eq '${eventId}'&$top=${topCount}&$skip=0&$format=json`);
                            const freshItems = fresh?.d?.results || [];

                            // Preserve UI state across the re-render
                            const checkedIds = new Set([...rootElement.querySelectorAll('.sf-cl-row-cb:checked')]
                                .map(cb => cb.closest('tr')?.dataset.leadId).filter(Boolean));
                            const wrap = rootElement.querySelector('.sf-cl-table-wrap');
                            const scrollTop = wrap ? wrap.scrollTop : 0;

                            allItems = freshItems;
                            currentSkip = freshItems.length;
                            hasMorePages = freshItems.length === topCount;
                            SalesforceLeadLib._dataCache.set(contactsCacheKey, {
                                items: allItems, skip: currentSkip, hasMore: hasMorePages, savedAt: Date.now()
                            });

                            if (isAnyFilterActive()) {
                                applyFilters();
                            } else {
                                renderRows(allItems);
                            }
                            updateStatusPillCounts();

                            // Restore checked rows + scroll position
                            if (checkedIds.size > 0) {
                                rootElement.querySelectorAll('#sf-cl-tbody tr').forEach(tr => {
                                    if (checkedIds.has(tr.dataset.leadId)) {
                                        const cb = tr.querySelector('.sf-cl-row-cb');
                                        if (cb) cb.checked = true;
                                    }
                                });
                                updateBatchBtn();
                            }
                            if (wrap) wrap.scrollTop = scrollTop;
                        } catch (e) {
                            console.warn('[CRM Export] Silent refresh failed — keeping cached view:', e);
                        }
                    })();
                }

                // --- Infinite scroll: load next pages via $skip as user scrolls ---
                if (hasMorePages) {
                    const tableWrap = rootElement.querySelector('.sf-cl-table-wrap');

                    // Shared load function used by both infinite scroll and "Load more" button
                    let isLoadingMore = false;
                    const loadNextPage = async () => {
                        if (!hasMorePages || isLoadingMore) return;
                        isLoadingMore = true;
                        loader.style.display = 'block';
                        loadMoreBtn.style.display = 'none';
                        try {
                            const data = await this._callPortalODataAPI(buildEndpoint(currentSkip));
                            const newItems = data?.d?.results || [];
                            allItems = allItems.concat(newItems);
                            currentSkip += newItems.length;
                            hasMorePages = newItems.length === pageSize;
                            // Keep the session cache in step with what is loaded
                            if (!isFakeData) {
                                SalesforceLeadLib._dataCache.set(contactsCacheKey, {
                                    items: allItems, skip: currentSkip, hasMore: hasMorePages, savedAt: Date.now()
                                });
                            }
                            // With an active filter, appending raw rows would show items the
                            // filter should hide (and rows would appear under a "no contacts
                            // found" message). Re-apply the filter over ALL loaded items
                            // instead, so newly loaded pages join the filtered view correctly.
                            if (isAnyFilterActive()) {
                                applyFilters();
                            } else {
                                appendRows(newItems);
                            }
                            updateStatusPillCounts();
                            if (!hasMorePages) {
                                loader.style.display = 'none';
                                loadMoreBtn.style.display = 'none';
                                scrollObserver.disconnect();
                            } else {
                                loadMoreBtn.style.display = 'block';
                            }
                        } catch (e) {
                            console.error('[CRM Export] Load more error:', e);
                            loadMoreBtn.style.display = 'block';
                        }
                        loader.style.display = 'none';
                        isLoadingMore = false;
                    };

                    // "Load more" button above the loader
                    const loadMoreBtn = document.createElement('div');
                    loadMoreBtn.style.cssText = 'padding:10px;text-align:center;';
                    loadMoreBtn.innerHTML = `<button class="sf-btn sf-btn--secondary sf-btn--sm">${_t('crmExport.loadMore', 'Load more')}</button>`;
                    loadMoreBtn.querySelector('button').addEventListener('click', loadNextPage);
                    tableWrap.appendChild(loadMoreBtn);

                    // Spinner loader
                    const loader = document.createElement('div');
                    loader.id = 'sf-cl-load-more';
                    loader.style.cssText = 'display:none;padding:12px;text-align:center;';
                    loader.innerHTML = `<span class="sf-spinner"></span>`;
                    tableWrap.appendChild(loader);

                    // Sentinel for IntersectionObserver (invisible div at bottom)
                    const sentinel = document.createElement('div');
                    sentinel.id = 'sf-cl-sentinel';
                    sentinel.style.cssText = 'height:1px;width:100%;';
                    tableWrap.appendChild(sentinel);

                    const scrollObserver = new IntersectionObserver(async (entries) => {
                        if (!entries[0].isIntersecting) return;
                        await loadNextPage();
                    }, { root: tableWrap, threshold: 0.1 });

                    scrollObserver.observe(sentinel);
                }

                // --- Filter: apply (local, no re-fetch) ---
                const applyFilters = () => {
                    const filters = [];
                    // Only the text/column inputs carry data-col. The Von/Bis date inputs
                    // also have .sf-cl-filter-input but NO data-col and are handled by the
                    // dedicated date range below — including them here pushed {col: undefined}
                    // which made item[undefined] === undefined reject every row.
                    rootElement.querySelectorAll('.sf-cl-filter-input[data-col]').forEach(input => {
                        const col = input.dataset.col;
                        const val = input.value.trim();
                        if (!val) return;
                        filters.push({ col, val: val.toLowerCase(), isDate: isDateCol(col) });
                    });

                    const filtered = allItems.filter(item => {
                        // Text filters
                        const passText = filters.every(({ col, val, isDate }) => {
                            const cellValue = item[col];
                            if (cellValue == null || cellValue === '') return false;
                            if (isDate) return String(cellValue).includes(val);
                            return String(cellValue).toLowerCase().includes(val);
                        });
                        if (!passText) return false;
                        // Status filter
                        if (activeStatusFilter !== '') {
                            const s = (item.LastExportStatus || '').toLowerCase();
                            if (activeStatusFilter === '__empty' && s) return false;
                            if (activeStatusFilter !== '__empty' && s !== activeStatusFilter) return false;
                        }
                        // Completeness filter
                        if (activeCompleteFilter === 'vollstaendig') {
                            if (item.IsIncomplete == 1 || item.QuestionnaireEmpty == 1 || item.QuestionnaireIncomplete == 1) return false;
                        } else if (activeCompleteFilter === 'unvollstaendig') {
                            if (!item.IsIncomplete && !item.QuestionnaireEmpty && !item.QuestionnaireIncomplete) return false;
                        }
                        // Date Von/Bis filter on SystemModstamp.
                        // "T00:00:00" forces LOCAL midnight — a bare "YYYY-MM-DD" parses as
                        // UTC midnight, which shifts the range by the timezone offset and
                        // wrongly excludes leads captured in the first/last hours of a day.
                        const vonVal = rootElement.querySelector('#sf-cl-date-von')?.value;
                        const bisVal = rootElement.querySelector('#sf-cl-date-bis')?.value;
                        if (vonVal || bisVal) {
                            const ts = extractTimestamp(item.SystemModstamp);
                            if (vonVal && (!ts || ts < new Date(vonVal + 'T00:00:00').getTime())) return false;
                            if (bisVal && (!ts || ts >= new Date(bisVal + 'T00:00:00').getTime() + 86400000)) return false;
                        }
                        return true;
                    });
                    renderRows(filtered);
                };

                // --- Events ---
                // Select All
                rootElement.querySelector('#sf-cl-select-all').addEventListener('change', (e) => {
                    rootElement.querySelectorAll('.sf-cl-row-cb').forEach(cb => cb.checked = e.target.checked);
                    updateBatchBtn();
                });

                // Row checkboxes
                rootElement.querySelector('#sf-cl-tbody').addEventListener('change', (e) => {
                    if (e.target.classList.contains('sf-cl-row-cb')) {
                        updateBatchBtn();
                        const allCbs = rootElement.querySelectorAll('.sf-cl-row-cb');
                        const checkedCbs = rootElement.querySelectorAll('.sf-cl-row-cb:checked');
                        const selectAll = rootElement.querySelector('#sf-cl-select-all');
                        selectAll.indeterminate = checkedCbs.length > 0 && checkedCbs.length < allCbs.length;
                        selectAll.checked = checkedCbs.length === allCbs.length && allCbs.length > 0;
                    }
                });

                // Show/Hide filters (toggle button with rotate animation)
                const filterBtn = rootElement.querySelector('#sf-cl-filter-btn');
                if (filterBtn) {
                    filterBtn.addEventListener('click', () => {
                        const bar = rootElement.querySelector('#sf-cl-filter-bar');
                        bar.classList.toggle('sf-cl-filter-visible');
                        filterBtn.classList.toggle('active');
                    });
                }

                // Filter inputs → enable Reset button
                const filterBar = rootElement.querySelector('#sf-cl-filter-bar');
                if (filterBar) {
                    filterBar.addEventListener('input', updateResetBtn);
                }

                // Apply button
                const applyBtn = rootElement.querySelector('#sf-cl-apply-btn');
                if (applyBtn) applyBtn.addEventListener('click', applyFilters);

                // Date range: apply immediately when a date is picked (no extra
                // Apply click needed — matches how the status pills behave)
                ['#sf-cl-date-von', '#sf-cl-date-bis'].forEach(sel => {
                    rootElement.querySelector(sel)?.addEventListener('change', () => {
                        applyFilters();
                        updateResetBtn();
                    });
                });

                // Status filter pills (data-status)
                rootElement.querySelector('#sf-cl-status-filter')?.addEventListener('click', (e) => {
                    const pill = e.target.closest('[data-status]');
                    if (!pill) return;
                    activeStatusFilter = pill.dataset.status;
                    rootElement.querySelectorAll('[data-status]').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    applyFilters();
                    updateResetBtn();
                });

                // Completeness dropdown
                rootElement.querySelector('#sf-cl-completeness-select')?.addEventListener('change', (e) => {
                    activeCompleteFilter = e.target.value;
                    applyFilters();
                    updateResetBtn();
                });

                // Attachment badge click (delegated)
                rootElement.querySelector('#sf-cl-tbody').addEventListener('click', (e) => {
                    const badge = e.target.closest('.sf-cl-attach-badge');
                    if (!badge) return;
                    SalesforceLeadLib._showAttachmentListModal(badge.dataset.attachIds, badge.dataset.leadName);
                });

                // Reset button
                const resetBtn = rootElement.querySelector('#sf-cl-reset-btn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        rootElement.querySelectorAll('.sf-cl-filter-input').forEach(i => i.value = '');
                        activeStatusFilter = '';
                        activeCompleteFilter = '';
                        rootElement.querySelectorAll('[data-status]').forEach(p => p.classList.remove('active'));
                        rootElement.querySelector('[data-status=""]')?.classList.add('active');
                        const completenessSelect = rootElement.querySelector('#sf-cl-completeness-select');
                        if (completenessSelect) completenessSelect.value = '';
                        resetBtn.disabled = true;
                        renderRows(allItems);
                    });
                }

                // Refresh — bypasses the session cache (contacts + field config)
                rootElement.querySelector('#sf-cl-refresh-btn').addEventListener('click', () => {
                    this.renderContactList(rootElement, eventId, { ...options, forceRefresh: true });
                });

                // SF Connect / Disconnect buttons
                const sfConnectBtn = rootElement.querySelector('#sf-cl-connect-btn');
                const sfDisconnectBtn = rootElement.querySelector('#sf-cl-disconnect-btn');
                if (sfConnectBtn) {
                    sfConnectBtn.addEventListener('click', async () => {
                        await this._sfConnectPopup();
                        // Refresh only the status bar + batch button — keep the loaded
                        // contacts and scroll position (connection doesn't change the list).
                        // Retry once: right after the OAuth popup closes the backend may not
                        // have finished persisting the session yet, so the first /check can
                        // still report "not connected". (The old full re-render hid this race
                        // because reloading field mappings + contacts took long enough.)
                        await refreshSfStatusBar();
                        if (!sfStatus.connected) {
                            await new Promise(r => setTimeout(r, 600));
                            await refreshSfStatusBar();
                        }
                    });
                }
                if (sfDisconnectBtn) {
                    sfDisconnectBtn.addEventListener('click', async () => {
                        await this._sfDisconnect();
                        await refreshSfStatusBar();
                    });
                }

                // Batch Transfer
                rootElement.querySelector('#sf-cl-batch-btn').addEventListener('click', async () => {
                    if (!sfStatus.connected) return; // safety net — button is disabled when not connected
                    const checkedRows = [...rootElement.querySelectorAll('.sf-cl-row-cb:checked')];
                    if (checkedRows.length === 0) return;

                    const selectedItems = checkedRows.map(cb => {
                        const row = cb.closest('tr');
                        return allItems.find(item => item.Id === row.dataset.leadId);
                    }).filter(Boolean);

                    const confirmed = await this.showBatchConfirmModal(
                        `${_t('crmExport.btnTransfer', 'Transfer')} ${selectedItems.length} contact(s) to Salesforce?`,
                        { title: _t('crmExport.startBatchTransfer', 'Start Batch Transfer'), okText: _t('crmExport.btnTransfer', 'Transfer'), okColor: 'var(--ColorAccent)' }
                    );
                    if (!confirmed) return;

                    const { modal: progressModal, updateProgress, updateLeadStatus } = this.showBatchProgressModal(selectedItems.length);

                    const summary = await this.executeBatchTransfer(selectedItems, {
                        fieldMappingService,
                        skipExportStatus: isFakeData,
                        onProgress: (current, total, name) => updateProgress(current, total, name),
                        onLeadComplete: (result) => {
                            updateLeadStatus(result);
                            const row = rootElement.querySelector(`tr[data-lead-id="${result.itemData?.Id}"]`);
                            if (row) {
                                row.className = `sf-cl-row ${getRowClass(result.status)}`;
                                const dot = row.querySelector('.sf-export-badge-dot');
                                const dotCls = getExportDotClass(result.status);
                                if (dot) {
                                    dot.className = `sf-export-badge-dot ${dotCls}`;
                                    dot.title = result.status;
                                } else if (dotCls) {
                                    const dotCell = row.cells[1];
                                    if (dotCell) dotCell.innerHTML = `<span class="sf-export-badge-dot ${dotCls}" title="${esc(result.status)}"></span>`;
                                }
                                // Keep sticky cell background in sync
                                const stickyTd = row.querySelector('.sf-cl-td-sticky');
                                if (stickyTd) stickyTd.className = `sf-cl-td sf-cl-td-sticky`;

                                // Update export status cells in real-time
                                if (result.status !== 'skipped') {
                                    const exportValues = {
                                        LastExportStatus: result.status === 'success' ? 'Success' : result.status === 'duplicate' ? 'Duplicate' : 'Failed',
                                        LastExportTimestamp: new Date().toISOString().split('T')[0],
                                        LastExportMessage: result.message || '',
                                        ExportAttempts: ''
                                    };
                                    displayColumns.forEach((col, colIdx) => {
                                        if (exportValues.hasOwnProperty(col)) {
                                            // cells offset: 0=checkbox, 1=dot, 2=attachments, 3+=data columns
                                            const cell = row.cells[colIdx + 3];
                                            if (cell) cell.textContent = exportValues[col];
                                        }
                                    });
                                }
                            }
                        }
                    });

                    if (progressModal?.parentNode) progressModal.parentNode.removeChild(progressModal);

                    // Update allItems in-memory so re-batch uses fresh status
                    summary.results.forEach(result => {
                        if (result.status === 'skipped' || !result.itemData?.Id) return;
                        const item = allItems.find(i => i.Id === result.itemData.Id);
                        if (item) {
                            item.LastExportStatus = result.status === 'success' ? 'Success' : result.status === 'duplicate' ? 'Duplicate' : 'Failed';
                            item.LastExportTimestamp = new Date().toISOString().split('T')[0];
                            item.LastExportMessage = result.message || '';
                        }
                    });
                    updateStatusPillCounts();

                    // For fake demo data: persist export statuses to localStorage so they survive refresh
                    if (isFakeData) {
                        const toSave = {};
                        allItems.forEach(item => {
                            if (item.LastExportStatus) {
                                toSave[item.Id] = {
                                    LastExportStatus: item.LastExportStatus,
                                    LastExportTimestamp: item.LastExportTimestamp,
                                    LastExportMessage: item.LastExportMessage,
                                    ExportAttempts: item.ExportAttempts || ''
                                };
                            }
                        });
                        try { localStorage.setItem(_fakeStatusKey, JSON.stringify(toSave)); } catch (e) {}
                    }

                    this.showBatchSummaryModal(summary, () => { /* cells already updated in real-time */ });

                    rootElement.querySelectorAll('.sf-cl-row-cb').forEach(cb => cb.checked = false);
                    rootElement.querySelector('#sf-cl-select-all').checked = false;
                    updateBatchBtn();
                });

            } catch (err) {
                rootElement.innerHTML = `<div class="sf-cl-empty" style="color:var(--ColorAccent);">${_t('crmExport.errorLoadingContacts', 'Error loading contacts:')} ${this._escapeHtml(err.message)}</div>`;
            }
        }

        /**
         * Silent SF connection check — returns { connected, userInfo } without throwing
         * @private
         */
        static async _checkSfConnectionSilent() {
            try {
                const instance = this._getInstance();
                if (!instance) return { connected: false };
                const backendUrl = instance.config.backendUrl;
                const orgId = localStorage.getItem('orgId') || '';
                const sessionToken = localStorage.getItem('sf_session_token') || '';
                const resp = await fetch(`${backendUrl}/api/salesforce/check`, {
                    headers: {
                        ...(orgId && { 'X-Org-Id': orgId }),
                        ...(sessionToken && { 'X-Session-Token': sessionToken })
                    }
                });
                if (!resp.ok) return { connected: false };
                const json = await resp.json();
                if (json.connected) {
                    return { connected: true, userInfo: json.userInfo?.display_name || json.userInfo?.username || '' };
                }
                return { connected: false };
            } catch {
                return { connected: false };
            }
        }

        /**
         * Disconnect from Salesforce
         * @private
         */
        static async _sfDisconnect() {
            try {
                const instance = this._getInstance();
                if (!instance) return;
                // Send the isolation key + cookies so the backend can resolve and
                // remove THIS user's stored (and disk-persisted) connection.
                const orgId = localStorage.getItem('orgId') || '';
                const sessionToken = localStorage.getItem('sf_session_token') || '';
                await fetch(`${instance.config.backendUrl}/api/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        ...(orgId && { 'X-Org-Id': orgId }),
                        ...(sessionToken && { 'X-Session-Token': sessionToken })
                    }
                });
            } catch { /* ignore */ }
            ['orgId', 'sf_session_token', 'sf_access_token', 'sf_instance_url', 'sf_refresh_token', 'sf_connection_status', 'sf_user_info', 'sf_connected', 'sf_connected_at'].forEach(k => localStorage.removeItem(k));
        }

        /**
         * Open SF OAuth popup and wait for result
         * @private
         */
        static _sfConnectPopup() {
            return new Promise((resolve) => {
                const instance = this._getInstance();
                if (!instance) return resolve();
                const orgId = localStorage.getItem('orgId') || '';
                const authUrl = `${instance.config.backendUrl.replace('/api', '')}/auth/salesforce?orgId=${encodeURIComponent(orgId)}`;
                // Large enough to avoid the Salesforce page scrolling, centered on the
                // browser window (multi-monitor / RDP aware).
                const pw = 600, ph = 750;
                const dualLeft = window.screenLeft ?? window.screenX ?? 0;
                const dualTop = window.screenTop ?? window.screenY ?? 0;
                const winW = window.outerWidth || screen.width;
                const winH = window.outerHeight || screen.height;
                const pl = Math.round(dualLeft + (winW - pw) / 2);
                const pt = Math.round(dualTop + (winH - ph) / 2);
                const popup = window.open(authUrl, 'sf-auth', `width=${pw},height=${ph},left=${pl},top=${pt},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=yes`);
                let handled = false;
                const onMsg = (e) => {
                    if (e.data?.type === 'SALESFORCE_AUTH_SUCCESS' && !handled) {
                        handled = true;
                        window.removeEventListener('message', onMsg);
                        if (e.data.sessionToken) localStorage.setItem('sf_session_token', e.data.sessionToken);
                        if (e.data.orgId) localStorage.setItem('orgId', e.data.orgId);
                        if (popup && !popup.closed) popup.close();
                        resolve();
                    }
                };
                window.addEventListener('message', onMsg);
                const t = setInterval(() => {
                    if (popup?.closed && !handled) {
                        handled = true;
                        clearInterval(t);
                        window.removeEventListener('message', onMsg);
                        resolve();
                    }
                }, 800);
            });
        }

        static showBatchAlertModal(message, { title = 'Notice', okText = 'OK' } = {}) {
            return new Promise((resolve) => {
                const modal = document.createElement('div');
                modal.className = 'sf-modal-overlay';
                modal.style.zIndex = '10003';
                modal.innerHTML = `
                    <div class="sf-modal sf-modal--sm" role="alertdialog" aria-modal="true" aria-labelledby="sf-alert-title">
                        <div class="sf-modal__body" style="padding: 24px;">
                            <h3 class="sf-modal__title" id="sf-alert-title" style="margin-bottom: 12px;">${this._escapeHtml(title)}</h3>
                            <p style="margin: 0; color: var(--sf-text-2);">${this._escapeHtml(message)}</p>
                        </div>
                        <div class="sf-modal__footer">
                            <button id="alert-ok-btn" class="sf-btn sf-btn--primary" style="min-width: 110px;">${this._escapeHtml(okText)}</button>
                        </div>
                    </div>
                `;
                document.body.classList.add('sf-modal-open');
                document.body.appendChild(modal);
                const cleanup = () => {
                    if (modal.parentNode) modal.parentNode.removeChild(modal);
                    document.body.classList.remove('sf-modal-open');
                    resolve();
                };
                modal.querySelector('#alert-ok-btn').addEventListener('click', cleanup);
                modal.querySelector('#alert-ok-btn').focus();
                modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(); });
            });
        }
    }

    // Expose to window
    window.SalesforceLeadLib = SalesforceLeadLib;

    // Also expose helper classes and functions for advanced usage
    window.SalesforceLeadLib.ConnectionPersistenceManager = ConnectionPersistenceManager;
    window.SalesforceLeadLib.LeadEditsManager = LeadEditsManager;
    window.SalesforceLeadLib.FieldMappingService = FieldMappingService;
    window.SalesforceLeadLib.showModernToast = showModernToast;
    window.SalesforceLeadLib.showErrorModal = showErrorModal;
    window.SalesforceLeadLib.showSuccessModal = showSuccessModal;
    window.SalesforceLeadLib.showConfirmDialog = showConfirmDialog;
    window.SalesforceLeadLib.showAlertDialog = showAlertDialog;

    console.log('SalesforceLeadLib loaded and ready');

})();
