// SALESFORCE LEAD LIBRARY

(function() {
    'use strict';

    const STANDARD_SALESFORCE_LEAD_FIELDS = {
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

    function injectCSS() {
        const cssContent = `
            /* Smooth transitions */
            * {
                transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
            }

            /* Sidebar */
            .sidebar {
                transition: all 0.3s ease;
            }

            /* Cards - with dark mode support */
            .card {
                background-color: var(--Window, #ffffff);
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                border: 1px solid #e5e7eb;
            }
            .cnv-ui-dark .card {
                border-color: #525252;
                box-shadow: 0 1px 3px 0 rgba(255, 255, 255, 0.05);
            }
            .card:hover {
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }
            .cnv-ui-dark .card:hover {
                box-shadow: 0 10px 15px -3px rgba(255, 255, 255, 0.05);
            }

            /* Field cards (CardView) - with dark mode support */
            .field-card {
                transition: all 0.2s ease;
                cursor: pointer;
                background-color: var(--Window, #ffffff);
                border: 1px solid #e5e7eb;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            }
            .cnv-ui-dark .field-card {
                border-color: #525252;
                box-shadow: 0 1px 3px 0 rgba(255, 255, 255, 0.05);
            }
            .field-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                border-color: var(--accent-color, #3b82f6);
            }
            .field-card.active-field {
                border-left: 4px solid #10B981;
            }
            .field-card.inactive-field {
                border-left: 4px solid #EF4444;
                opacity: 0.7;
                background-color: var(--box-bkg, #f9fafb);
            }

            /* Toggle switch - Reduced size with dark mode */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 36px;
                height: 18px;
            }
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .3s;
                border-radius: 18px;
            }
            .cnv-ui-dark .toggle-slider {
                background-color: #4b5563;
            }
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 2px;
                bottom: 2px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
            }
            .cnv-ui-dark .toggle-slider:before {
                background-color: #e5e7eb;
            }
            input:checked + .toggle-slider {
                background-color: #10B981;
            }
            input:checked + .toggle-slider:before {
                transform: translateX(18px);
            }

            /* Modal - with dark mode support */
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }
            .modal.show {
                display: flex;
            }
            .modal-content {
                position: relative;
                background-color: var(--Window, white);
                padding: 0;
                width: 90%;
                max-width: 500px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                animation: modalSlideIn 0.3s ease-out;
            }
            .cnv-ui-dark .modal-content {
                border-color: #525252;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            }
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* View toggle buttons */
            .view-toggle-btn.active {
                background-color: var(--accent-color, #3B82F6);
                color: white;
            }

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

            /* Attachment items styling - with dark mode */
            .attachment-item {
                display: flex;
                align-items: center;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 8px;
                background: var(--Window, white);
                transition: all 0.2s ease;
            }
            .cnv-ui-dark .attachment-item {
                border-color: #525252;
            }
            .attachment-item:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                border-color: var(--accent-color, #3b82f6);
            }
            .attachment-icon {
                margin-right: 12px;
                font-size: 24px;
                color: var(--label-color, #6b7280);
            }
            .attachment-details {
                flex: 1;
                min-width: 0;
            }
            .attachment-name {
                font-weight: 500;
                color: var(--WindowText, #1f2937);
                margin-bottom: 4px;
            }
            .attachment-meta {
                display: flex;
                gap: 12px;
                font-size: 12px;
                color: var(--label-color, #6b7280);
            }
            .view-attachment-btn {
                padding: 6px 10px;
                background: var(--accent-color, #3b82f6);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .view-attachment-btn:hover {
                opacity: 0.9;
                transform: scale(1.05);
            }
            .view-attachment-btn i {
                font-size: 14px;
            }

            /* Toast animations */
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            /* Field items for Field Configurator - with dark mode support */
            .sf-field-item {
                background-color: var(--Window, #ffffff);
                border: 1px solid #e2e8f0;
            }
            .cnv-ui-dark .sf-field-item {
                border-color: #525252;
            }

            .sf-field-item.sf-field-required {
                border-left: 3px solid #f59e0b;
                background-color: rgba(245, 158, 11, 0.1);
                border-color: var(--accent-color, #667eea);
            }
            .cnv-ui-dark .sf-field-item.sf-field-required {
                background-color: rgba(245, 158, 11, 0.15);
            }

            .sf-field-item.sf-field-custom {
                border-left: 3px solid var(--accent-color, #2563eb);
                background-color: rgba(37, 99, 235, 0.1);
            }
            .cnv-ui-dark .sf-field-item.sf-field-custom {
                background-color: rgba(37, 99, 235, 0.2);
            }

            .sf-field-item.sf-field-active {
                background-color: rgba(37, 99, 235, 0.1);
                border-color: var(--accent-color, #667eea);
            }
            .cnv-ui-dark .sf-field-item.sf-field-active {
                background-color: rgba(37, 99, 235, 0.15);
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
            this.credentials = sessionStorage.getItem('credentials');
            this.currentEventId = null;
            this._initializationPhase = 'not_started';
            this._dbConfigLoaded = false;

            this.serverName = config.serverName || sessionStorage.getItem('serverName') || 'lstest.convey.de';
            this.apiName = config.apiName || sessionStorage.getItem('apiName') || 'apisftest';

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
                        if (!this.credentials) {
                            throw new Error("No credentials found");
                        }

                        const headers = new Headers({
                            Accept: "application/json",
                            Authorization: `Basic ${this.credentials}`,
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

                        const url = `https://${this.serverName}/${this.apiName}/${endpoint}`;

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

        async loadFieldMappingsFromAPI(eventId) {
            if (!eventId) {
                return;
            }

            if (!this.credentials) return;

            try {
                const endpoint = `LS_FieldMappings?$filter=EventId eq '${eventId}'&$format=json`;
                const data = await this.createApiService().request('GET', endpoint);

                if (!data) {
                    return;
                }

                if (data.d && data.d.results && data.d.results.length > 0) {
                    const configRecord = data.d.results[0];

                    if (configRecord.ConfigData) {
                        try {
                            const parsedConfig = JSON.parse(configRecord.ConfigData);

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
                }

            } catch (error) {
                console.error('Failed to load field mappings from DB:', error);
                return false;
            }
        }

        async saveFieldMappingsToAPI(fieldName, operation = 'update') {
            if (!this.currentEventId || !this.credentials) return false;

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
        modal.className = 'sf-lib-transfer-loading-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 32px; text-align: center; min-width: 300px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <div style="margin-bottom: 16px;">
                    <svg style="width: 64px; height: 64px; color: #3b82f6; animation: spin 1s linear infinite;" viewBox="0 0 24 24">
                        <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                        <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0;">${message}</p>
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
        modal.className = 'sf-lib-transfer-error-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        // Format the message to make field names and values bold
        const formattedMessage = formatErrorMessage(message);

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 0; max-width: 500px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg style="width: 24px; height: 24px; color: #dc2626;" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">${title}</h2>
                    </div>
                </div>
                <div style="padding: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap; line-height: 1.5;">${formattedMessage}</p>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: flex-end;">
                    <button id="ok" class="sf-lib-close-error-modal" style="padding: 10px 20px; border: none; background: #dc2626; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: background 0.2s;">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.sf-lib-close-error-modal');
        closeBtn.addEventListener('click', () => modal.remove());
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = '#b91c1c';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = '#dc2626';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function showSuccessModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'sf-lib-transfer-success-modal';
        modal.id = 'sf-lib-persistent-success-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 0; max-width: 500px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg style="width: 24px; height: 24px; color: #059669;" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">${title}</h2>
                    </div>
                </div>
                <div style="padding: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap; line-height: 1.5;">${message}</p>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span id="sf-lib-auto-close-countdown" style="color: #6b7280; font-size: 13px;"></span>
                    <button id="ok" class="sf-lib-close-success-modal" style="padding: 10px 20px; border: none; background: #059669; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: background 0.2s;">
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
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = '#047857';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = '#059669';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    function showModernToast(message, type = 'info', duration = 4000) {
        let container = document.getElementById('sf-lib-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sf-lib-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: center;
            `;
            document.body.appendChild(container);
        }

        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        const colors = {
            success: { bg: '#10B981', border: '#059669' },
            error: { bg: '#EF4444', border: '#DC2626' },
            warning: { bg: '#F59E0B', border: '#D97706' },
            info: { bg: '#3B82F6', border: '#2563EB' }
        };

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${colors[type].bg};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
            animation: slideDown 0.3s ease-out;
            border: 2px solid ${colors[type].border};
            min-width: 300px;
            max-width: 500px;
        `;

        toast.innerHTML = `
            <div style="flex-shrink: 0;">${icons[type]}</div>
            <div style="flex: 1;">${message}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Show a confirmation dialog using WinJS confirmModal
     * Promise-based wrapper around WinJS confirmModal for async/await support
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>} - true if confirmed, false if cancelled
     */
    function showConfirmDialog(title, message, options = {}) {
        return new Promise((resolve) => {
            const confirmText = options.confirmText || 'OK';
            const cancelText = options.cancelText || 'Cancel';

            // Use WinJS confirmModal which handles stacking context properly
            if (typeof confirmModal === 'function') {
                confirmModal(title, message, confirmText, cancelText, function(result) {
                    resolve(result === true);
                });
            } else if (typeof Application !== 'undefined' && Application.confirmModal) {
                Application.confirmModal(title, message, confirmText, cancelText, function(result) {
                    resolve(result === true);
                });
            } else {
                // Fallback to native confirm if WinJS not available
                const result = window.confirm(message);
                resolve(result);
            }
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
            const headerColor = options.headerColor || '#3b82f6';

            // Use native <dialog> element to ensure proper stacking above WinJS panels
            const dialog = document.createElement('dialog');
            dialog.className = 'sf-lib-dialog';
            dialog.style.cssText = `
                border: none;
                border-radius: 12px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                background: var(--Window, white);
            `;

            dialog.innerHTML = `
                <div style="background: ${headerColor}; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 18px; font-weight: bold; margin: 0;">${title}</h3>
                    <button id="sf-lib-close-x" style="color: white; background: none; border: none; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 16px;">
                        <label class="label-color" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--WindowText, #374151);">Field Name (Read-only)</label>
                        <input type="text" id="sf-lib-field-name" readonly
                               style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: var(--Window, white); color: var(--WindowText, #1f2937); opacity: 0.7; box-sizing: border-box;"
                               value="${fieldName}" />
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label class="label-color" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--WindowText, #374151);">Custom Label</label>
                        <input type="text" id="sf-lib-custom-label"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: var(--Window, white); color: var(--WindowText, #1f2937); box-sizing: border-box;"
                               value="${currentLabel}" />
                        <p style="font-size: 12px; color: var(--WindowText, #6b7280); margin-top: 8px;">Enter a custom label for this field</p>
                    </div>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; background: var(--box-bkg, #f9fafb); border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="sf-lib-cancel-edit" style="padding: 10px 20px; border: 1px solid #d1d5db; background: var(--box-bkg, white); color: var(--WindowText, #374151); border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;">
                        ${cancelText}
                    </button>
                    <button id="sf-lib-save-edit" style="padding: 10px 20px; border: none; background: ${headerColor}; color: white; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;">
                        <span style="margin-right: 8px;">✓</span>${saveText}
                    </button>
                </div>
            `;

            document.body.appendChild(dialog);
            dialog.showModal();

            const closeXBtn = dialog.querySelector('#sf-lib-close-x');
            const cancelBtn = dialog.querySelector('#sf-lib-cancel-edit');
            const saveBtn = dialog.querySelector('#sf-lib-save-edit');
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
            const headerColor = options.headerColor || 'var(--accent-color, #3b82f6)';

            // Use native <dialog> element to ensure proper stacking above WinJS panels
            const dialog = document.createElement('dialog');
            dialog.className = 'sf-lib-dialog';
            dialog.style.cssText = `
                border: none;
                border-radius: 12px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                background: var(--Window, white);
            `;

            dialog.innerHTML = `
                <div style="background: ${headerColor}; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 18px; font-weight: bold; margin: 0;">Add Custom Field</h3>
                    <button id="sf-lib-close-x" style="color: white; background: none; border: none; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--WindowText, #374151);">Field Name *</label>
                        <input type="text" id="sf-lib-field-name" placeholder="e.g., Area__c"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: var(--Window, white); color: var(--WindowText, #1f2937); box-sizing: border-box;" />
                        <p id="sf-lib-field-name-error" style="font-size: 12px; color: #dc2626; margin-top: 6px; display: none;"></p>
                        <p style="font-size: 12px; color: var(--WindowText, #6b7280); margin-top: 4px;">You must first verify the exact field name in Salesforce and enter it here without spaces.</p>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--WindowText, #374151);">Default Value</label>
                        <textarea id="sf-lib-field-value" rows="3" placeholder="e.g., Germany, France"
                                  style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: var(--Window, white); color: var(--WindowText, #1f2937); box-sizing: border-box; resize: vertical;"></textarea>
                        <p style="font-size: 12px; color: var(--WindowText, #6b7280); margin-top: 8px;">Optional default value for this custom field</p>
                    </div>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; background: var(--box-bkg, #f9fafb); border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="sf-lib-cancel" style="padding: 10px 20px; border: 1px solid #d1d5db; background: var(--box-bkg, white); color: var(--WindowText, #374151); border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;">
                        ${cancelText}
                    </button>
                    <button id="sf-lib-save" style="padding: 10px 20px; border: none; background: ${headerColor}; color: white; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;">
                        <span style="margin-right: 8px;">✓</span>${saveText}
                    </button>
                </div>
            `;

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
                    nameInput.style.borderColor = '#dc2626';
                    return;
                }
                if (!fieldName.match(/^[a-zA-Z][a-zA-Z0-9_]*(__c)?$/)) {
                    errorEl.textContent = 'Invalid field name: no spaces allowed. Use only letters, numbers and underscores (e.g. MyField__c).';
                    errorEl.style.display = 'block';
                    nameInput.style.borderColor = '#dc2626';
                    return;
                }

                closeDialog({ fieldName, fieldValue });
            };

            nameInput.addEventListener('input', () => {
                errorEl.style.display = 'none';
                nameInput.style.borderColor = '#d1d5db';
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
     * @returns {Promise<string|null>} - The new value or null if cancelled
     */
    function showEditCustomFieldDialog(fieldName, currentValue, options = {}) {
        return new Promise((resolve) => {
            const saveText = options.saveText || 'Save Changes';
            const cancelText = options.cancelText || 'Cancel';
            const headerColor = options.headerColor || '#10b981';

            // Use native <dialog> element to ensure proper stacking above WinJS panels
            const dialog = document.createElement('dialog');
            dialog.className = 'sf-lib-dialog';
            dialog.style.cssText = `
                border: none;
                border-radius: 12px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                background: var(--Window, white);
            `;

            dialog.innerHTML = `
                <div style="background: ${headerColor}; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 18px; font-weight: bold; margin: 0;">Edit Custom Field</h3>
                    <button id="sf-lib-close-x" style="color: white; background: none; border: none; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--WindowText, #374151);">Field Name (Read-only)</label>
                        <input type="text" id="sf-lib-field-name" readonly
                               style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: var(--Window, white); color: var(--WindowText, #1f2937); opacity: 0.7; box-sizing: border-box;"
                               value="${fieldName}" />
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--WindowText, #374151);">Default Value</label>
                        <textarea id="sf-lib-field-value" rows="3"
                                  style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: var(--Window, white); color: var(--WindowText, #1f2937); box-sizing: border-box; resize: vertical;">${currentValue}</textarea>
                        <p style="font-size: 12px; color: var(--WindowText, #6b7280); margin-top: 8px;">Update the default value for this custom field</p>
                    </div>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; background: var(--box-bkg, #f9fafb); border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="sf-lib-cancel" style="padding: 10px 20px; border: 1px solid #d1d5db; background: var(--box-bkg, white); color: var(--WindowText, #374151); border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;">
                        ${cancelText}
                    </button>
                    <button id="sf-lib-save" style="padding: 10px 20px; border: none; background: ${headerColor}; color: white; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;">
                        <span style="margin-right: 8px;">✓</span>${saveText}
                    </button>
                </div>
            `;

            document.body.appendChild(dialog);
            dialog.showModal();

            const closeXBtn = dialog.querySelector('#sf-lib-close-x');
            const cancelBtn = dialog.querySelector('#sf-lib-cancel');
            const saveBtn = dialog.querySelector('#sf-lib-save');
            const valueInput = dialog.querySelector('#sf-lib-field-value');

            // Focus on value input
            valueInput.focus();
            valueInput.select();

            const closeDialog = (result) => {
                dialog.close();
                dialog.remove();
                resolve(result);
            };

            closeXBtn.addEventListener('click', () => closeDialog(null));
            cancelBtn.addEventListener('click', () => closeDialog(null));
            saveBtn.addEventListener('click', () => closeDialog(valueInput.value));

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
            'ConvertedDate', 'ConvertedOpportunityId', 'Country', 'CountryCode',
            'CreatedById', 'CreatedDate', 'DandbCompanyId', 'Description', 'Email',
            'EmailBouncedDate', 'EmailBouncedReason', 'Fax', 'FirstName',
            'GeocodeAccuracy', 'Id', 'IndividualId', 'Industry', 'IsConverted',
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
            '__metadata', 'KontaktViewId', 'Id', 'ContactId', 'CreatedDate', 'LastModifiedDate',
            'CreatedById', 'LastModifiedById', 'SystemModstamp', 'DeviceId',
            'DeviceRecordId', 'EventId', 'RequestBarcode', 'StatusMessage'
        ];
        return systemFields.includes(fieldName);
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
                serverName: config.serverName || 'lstest.convey.de',
                apiName: config.apiName || 'apisftest',
                ...config
            };

            injectCSS();

            this.connectionManager = ConnectionPersistenceManager;
            this.leadEditsManager = new LeadEditsManager();
            this.fieldMappingService = new FieldMappingService({
                serverName: this.config.serverName,
                apiName: this.config.apiName
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

                const width = 500;
                const height = 650;
                const left = (screen.width - width) / 2;
                const top = (screen.height - height) / 2;

                const popup = window.open(
                    authUrl,
                    'salesforce-auth',
                    `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=no`
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
                this.connectionManager.clearConnection();
                localStorage.removeItem('orgId');
                localStorage.removeItem('sf_access_token');
                localStorage.removeItem('sf_instance_url');
                localStorage.removeItem('sf_user_info');
                localStorage.removeItem('sf_connected');
                localStorage.removeItem('sf_connected_at');

                await fetch(`${this.config.backendUrl}/api/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
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

            console.log('_collectActiveFieldsOnly - Final payload fields:', Object.keys(salesforceData));
            return { salesforceData, externalIdField };
        }

        async _transferToSalesforce(leadData, externalIdField = null) {
            const apiUrl = `${this.config.backendUrl}/api/salesforce/leads`;
            const orgId = localStorage.getItem('orgId') || 'default';

            const payload = {
                leadData: leadData,
                attachments: [],
                leadId: this.currentLeadData?.KontaktViewId || this.currentLeadData?.Id,
                ...(externalIdField && { externalIdField })
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Org-Id': orgId
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

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

            const isProduction = isProductionHost || (port !== '' && port !== '3000');

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

                // Pass portal credentials to FieldMappingService so it can load from DB
                if (this._portalConfig.user && this._portalConfig.password) {
                    const creds = btoa(`${this._portalConfig.user}:${this._portalConfig.password}`);
                    this._instance.fieldMappingService.credentials = creds;
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
                rootElement.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 300px;">
                        <div style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: var(--accent-color, #2563eb); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                        <p class="text-textcolor" style="margin-top: 16px; font-size: 16px;" data-win-res="{textContent: 'crmSettings.loadingFields'}">Loading fields...</p>
                        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
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
                    <style>
                        .sf-card { background-color: var(--Window, #ffffff); box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); border: 1px solid var(--sf-border, #e5e7eb); }
                        .cnv-ui-dark .sf-card { border-color: #525252; box-shadow: 0 1px 3px 0 rgba(255,255,255,0.05); }
                        .spinner { border: 3px solid #e2e8f0; border-top-color: var(--accent-color, #667eea); border-radius: 50%; width: 40px; height: 40px; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
                        .cnv-ui-dark .spinner { border-color: #525252; border-top-color: var(--accent-color, #667eea); }
                        @keyframes spin { to { transform: rotate(360deg); } }
                        .filter-tab { padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; border: none; background: transparent; cursor: pointer; }
                        .filter-tab:hover { background: rgba(0,0,0,0.05); }
                        .cnv-ui-dark .filter-tab:hover { background: rgba(255,255,255,0.1); }
                        .filter-tab.active { background: var(--accent-color, #3b82f6); color: white; }
                        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
                        .modal.show { display: flex; }
                        .sf-input { background-color: var(--Window, white); color: var(--WindowText, #1f2937); border: 1px solid #d1d5db; }
                        .cnv-ui-dark .sf-input { border-color: #525252; }
                        .sf-input:focus { border-color: var(--accent-color, #3b82f6); outline: none; }
                        .sf-modal-content { background-color: var(--Window, white); border: 1px solid #e5e7eb; }
                        .cnv-ui-dark .sf-modal-content { border-color: #525252; }
                        .sf-modal-footer { background-color: var(--box-bkg, #f9fafb); border-top: 1px solid #e5e7eb; }
                        .cnv-ui-dark .sf-modal-footer { background-color: var(--box-bkg, #1f2937); border-top-color: #525252; }
                        .sf-btn-secondary { background-color: var(--box-bkg, #e2e8f0); border: 1px solid #d1d5db; }
                        .cnv-ui-dark .sf-btn-secondary { border-color: #525252; }
                        .sf-btn-secondary:hover { opacity: 0.9; }
                        .sf-header { background-color: var(--Window, white); border-bottom: 1px solid #e5e7eb; }
                        .cnv-ui-dark .sf-header { border-bottom-color: #525252; }
                        .sf-filter-border { border-bottom: 1px solid #e5e7eb; }
                        .cnv-ui-dark .sf-filter-border { border-bottom-color: #525252; }
                    </style>
                    <div class="contenthost-background" style="display: flex; flex-direction: column; height: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; box-sizing: border-box;">
                        <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                            <header class="sf-header" style="padding: 16px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 16px; border-radius: 8px;">
                                    <div style="flex: 1;">
                                        <h1 class="text-textcolor" style="font-size: 20px; font-weight: bold;" data-win-res="{textContent: 'crmSettings.fieldConfigurator'}">Field Configurator</h1>
                                        <p id="event-info" class="label-color" style="font-size: 14px; margin-top: 8px;" data-win-res="{textContent: 'crmSettings.fieldConfiguratorDesc'}">Configure which fields will be transferred to Salesforce for this event. Required fields (LastName, Company) are always included.</p>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                        <div id="sf-status-card" style="display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
                                            <div id="sf-status-indicator" style="width: 10px; height: 10px; background: #fbbf24; border-radius: 50%;"></div>
                                            <span id="sf-status-text" style="font-size: 13px; font-weight: 500; color: #92400e;" data-win-res="{textContent: 'sforce.statusDisconnected'}">Disconnected</span>
                                            <div id="sf-user-section" style="display: none; align-items: center; gap: 8px; margin-left: 8px; padding-left: 12px; border-left: 1px solid #fcd34d;">
                                                <div id="sf-user-avatar" style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: bold; font-size: 10px;">
                                                    ?
                                                </div>
                                                <span id="sf-user-name" class="text-textcolor" style="font-size: 13px; font-weight: 500;">
                                                    Unknown
                                                </span>
                                            </div>
                                        </div>
                                        <button id="sf-connect-btn" class="accent-background-color" style="display: flex; padding: 0 16px; height: 38px; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; align-items: center; gap: 8px;">
                                            <i class="fa-solid fa-plug"></i> <span data-win-res="{textContent: 'sforce.btnConnect'}">Connect to Salesforce</span>
                                        </button>
                                        <button id="sf-disconnect-btn" style="display: none; padding: 0 16px; height: 38px; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 500; border: 1px solid #fecaca; border-radius: 8px; cursor: pointer; align-items: center; gap: 8px;">
                                            <i class="fa-solid fa-right-from-bracket"></i> <span data-win-res="{textContent: 'sforce.btnDisconnect'}">Disconnect</span>
                                        </button>
                                        <button id="settings-save-btn" class="accent-background-color" style="display: flex; padding: 0 20px; height: 38px; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; align-items: center; gap: 8px;">
                                            <i class="fa-solid fa-floppy-disk"></i> <span data-win-res="{textContent: 'crmSettings.save'}">Save</span>
                                        </button>
                                    </div>
                                </div>
                            </header>

                            <main style="flex: 1; overflow-y: auto; padding: 16px 0;">
                                <div id="virtual-mode-info" class="sf-card" style="display: none; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                                        <span style="color: var(--accent-color, #3b82f6); font-size: 20px; margin-top: 4px;">ℹ️</span>
                                        <div>
                                            <p class="text-textcolor" style="font-size: 14px; font-weight: 500; margin: 0;" data-win-res="{textContent: 'crmSettings.noContactsFound'}">No contacts found for this event.</p>
                                            <p class="label-color" style="font-size: 14px; margin: 4px 0 0;" data-win-res="{textContent: 'crmSettings.configureTestData'}">You can configure test data below for testing the transfer. All fields are editable for testing purposes.</p>
                                        </div>
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px;">
                                    <div class="sf-card" style="border-radius: 12px; padding: 16px;">
                                        <div id="totalFieldsCount" style="font-size: 24px; font-weight: bold; color: var(--accent-color, #3b82f6);">0</div>
                                        <div class="label-color" style="font-size: 14px;" data-win-res="{textContent: 'crmSettings.totalFields'}">Total Fields</div>
                                    </div>
                                    <div class="sf-card" style="border-radius: 12px; padding: 16px;">
                                        <div id="activeFieldsCount" style="font-size: 24px; font-weight: bold; color: #10b981;">0</div>
                                        <div class="label-color" style="font-size: 14px;" data-win-res="{textContent: 'crmSettings.activeFields'}">Active Fields</div>
                                    </div>
                                    <div class="sf-card" style="border-radius: 12px; padding: 16px;">
                                        <div id="inactiveFieldsCount" class="label-color" style="font-size: 24px; font-weight: bold;">0</div>
                                        <div class="label-color" style="font-size: 14px;" data-win-res="{textContent: 'crmSettings.inactiveFields'}">Inactive Fields</div>
                                    </div>
                                    <div class="sf-card" style="border-radius: 12px; padding: 16px;">
                                        <div id="customFieldsCount" style="font-size: 24px; font-weight: bold; color: var(--accent-color, #3b82f6);">0</div>
                                        <div class="label-color" style="font-size: 14px;" data-win-res="{textContent: 'crmSettings.customFields'}">Custom Fields</div>
                                    </div>
                                </div>

                                <div class="sf-card" style="border-radius: 12px; padding: 16px;">
                                    <div style="position: relative; margin-bottom: 16px; max-width: 400px;">
                                        <span class="label-color" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%);">🔍</span>
                                        <input type="text" id="searchField" class="sf-input" data-win-res="{placeholder: 'crmSettings.searchFields'}" placeholder="Search fields..."
                                            style="width: 100%; padding: 12px 16px 12px 48px; border-radius: 8px; font-size: 14px;" />
                                    </div>

                                    <div class="sf-filter-border label-color" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; padding-bottom: 12px;">
                                        <button class="filter-tab label-color" data-filter="all" data-win-res="{textContent: 'crmSettings.allFields'}">
                                            All Fields
                                        </button>
                                        <button class="filter-tab active" data-filter="active" data-win-res="{textContent: 'crmSettings.activeFields'}">
                                            Active Fields
                                        </button>
                                        <button class="filter-tab label-color" data-filter="inactive" data-win-res="{textContent: 'crmSettings.inactiveFields'}">
                                            Inactive Fields
                                        </button>
                                        <button class="filter-tab label-color" data-filter="required" data-win-res="{textContent: 'crmSettings.required'}">
                                            Required
                                        </button>
                                        <button class="filter-tab label-color" data-filter="custom" data-win-res="{textContent: 'crmSettings.customFields'}">
                                            Custom Fields
                                        </button>
                                    </div>

                                    <button id="addCustomFieldBtn" class="accent-background-color" style="display: none; margin-bottom: 16px; padding: 8px 16px; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">
                                        <span style="margin-right: 8px;">➕</span>
                                        <span data-win-res="{textContent: 'crmSettings.addCustomField'}">Add Custom Field</span>
                                    </button>

                                    <div id="fieldsContainer" class="label-color" style="text-align: center; padding: 48px 0;">
                                        <div class="spinner"></div>
                                        <div style="margin-top: 8px;" data-win-res="{textContent: 'crmSettings.loadingFields'}">Loading fields...</div>
                                    </div>
                                </div>

                            </main>
                        </div>
                    </div>

                    <div id="customFieldModal" class="modal">
                        <div class="sf-modal-content" style="border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); max-width: 500px; width: 100%; margin: 16px;">
                            <div class="accent-background-color" style="color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="font-size: 18px; font-weight: bold; margin: 0;" data-win-res="{textContent: 'crmSettings.addCustomField'}">Add Custom Field</h3>
                                <button style="color: white; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                            </div>

                            <div style="padding: 24px;">
                                <div style="margin-bottom: 16px;">
                                    <label class="label-color" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;" data-win-res="{textContent: 'crmSettings.fieldName'}">Field Name *</label>
                                    <input type="text" id="customFieldName" class="sf-input" data-win-res="{placeholder: 'crmSettings.fieldNamePlaceholder'}" placeholder="e.g., Area__c"
                                           style="width: 100%; padding: 8px 12px; border-radius: 8px; font-size: 14px;" />
                                    <p class="label-color" style="font-size: 12px; margin-top: 8px;" data-win-res="{textContent: 'crmSettings.verifyFieldName'}">
                                        You must first verify the exact field name in Salesforce and enter it here without spaces.
                                    </p>
                                </div>

                                <div style="margin-bottom: 16px;">
                                    <label class="label-color" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;" data-win-res="{textContent: 'crmSettings.defaultValue'}">Default Value</label>
                                    <textarea id="customFieldValue" rows="3" class="sf-input" data-win-res="{placeholder: 'crmSettings.defaultValuePlaceholder'}" placeholder="e.g., Germany, France"
                                              style="width: 100%; padding: 8px 12px; border-radius: 8px; font-size: 14px; resize: vertical;"></textarea>
                                    <p class="label-color" style="font-size: 12px; margin-top: 8px;" data-win-res="{textContent: 'crmSettings.optionalDefaultValue'}">Optional: Set a default value for this field</p>
                                </div>

                                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                    <button id="cancel" class="sf-btn-secondary text-textcolor" style="padding: 8px 16px; border-radius: 8px; font-weight: 500; cursor: pointer;" data-win-res="{textContent: 'sforce.btnCancel'}">
                                        Cancel
                                    </button>
                                    <button id="ok" class="accent-background-color" style="padding: 8px 16px; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">
                                        <span style="margin-right: 8px;">✓</span> <span data-win-res="{textContent: 'crmSettings.saveField'}">Save Field</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Custom Field Modal -->
                    <div id="editCustomFieldModal" class="modal">
                        <div class="sf-modal-content" style="border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); max-width: 500px; width: 100%; margin: 16px;">
                            <div style="background: #10b981; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="font-size: 18px; font-weight: bold; margin: 0;" data-win-res="{textContent: 'crmSettings.editCustomField'}">Edit Custom Field</h3>
                                <button style="color: white; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                            </div>

                            <div style="padding: 24px;">
                                <div style="margin-bottom: 16px;">
                                    <label class="label-color" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;" data-win-res="{textContent: 'crmSettings.fieldNameReadonly'}">Field Name (Read-only)</label>
                                    <input type="text" id="editCustomFieldName" class="sf-input" readonly
                                           style="width: 100%; padding: 8px 12px; border-radius: 8px; font-size: 14px; opacity: 0.7;" />
                                </div>

                                <div style="margin-bottom: 16px;">
                                    <label class="label-color" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;" data-win-res="{textContent: 'crmSettings.defaultValue'}">Default Value</label>
                                    <textarea id="editCustomFieldValue" rows="3" class="sf-input" data-win-res="{placeholder: 'crmSettings.defaultValuePlaceholder'}" placeholder="e.g., Germany, France"
                                              style="width: 100%; padding: 8px 12px; border-radius: 8px; font-size: 14px; resize: vertical;"></textarea>
                                    <p class="label-color" style="font-size: 12px; margin-top: 8px;" data-win-res="{textContent: 'crmSettings.updateDefaultValue'}">Update the default value for this custom field</p>
                                </div>

                                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                    <button id="editCancel" class="sf-btn-secondary text-textcolor" style="padding: 8px 16px; border-radius: 8px; font-weight: 500; cursor: pointer;" data-win-res="{textContent: 'sforce.btnCancel'}">
                                        Cancel
                                    </button>
                                    <button id="editOk" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">
                                        <span style="margin-right: 8px;">✓</span> <span data-win-res="{textContent: 'crmSettings.saveChanges'}">Save Changes</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="toast-container" style="position: fixed; top: 16px; right: 16px; z-index: 50; display: flex; flex-direction: column; gap: 8px;"></div>
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
                        'Accept': 'application/xml'
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

                const excludedFields = ['__metadata', 'Id', 'CreatedDate', 'LastModifiedDate', 'SystemModstamp', 'IsDeleted'];

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
            const toastContainer = document.getElementById('toast-container') || (() => {
                const container = document.createElement('div');
                container.id = 'toast-container';
                container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
                document.body.appendChild(container);
                return container;
            })();

            const toast = document.createElement('div');
            const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
            const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

            toast.style.cssText = `
                background: ${bgColor};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                font-weight: 500;
                min-width: 250px;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
            `;

            toast.innerHTML = `
                <span style="font-size: 18px; font-weight: bold;">${icon}</span>
                <span>${message}</span>
            `;

            toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    toast.remove();
                    if (toastContainer.children.length === 0) {
                        toastContainer.remove();
                    }
                }, 300);
            }, 3000);

            if (!document.getElementById('toast-animations')) {
                const style = document.createElement('style');
                style.id = 'toast-animations';
                style.textContent = `
                    @keyframes slideIn {
                        from {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes slideOut {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
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
                    <div class="label-color" style="text-align: center; padding: 48px 0;">
                        <div class="text-textcolor" style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No fields found</div>
                        <div>No ${labels[currentFilter] || currentFilter} match your criteria</div>
                    </div>
                `;
            } else {
                let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 12px; margin-top: 4px;">';

                filteredFields.forEach(field => {
                    const isActive = field.active || field.required;
                    const isRequired = field.required;
                    const isCustom = field.isCustomField;

                    let fieldClass = 'sf-field-item';
                    if (isRequired) fieldClass += ' sf-field-required';
                    else if (isCustom) fieldClass += ' sf-field-custom';
                    else if (isActive) fieldClass += ' sf-field-active';

                    html += `
                        <label class="field-item ${fieldClass}${isRequired ? ' required' : ''}${isActive ? ' active' : ''}${isCustom ? ' user-custom-field' : ''}"
                               data-field="${field.name}"
                               data-is-custom="${isCustom}"
                               data-field-id="${field.id || ''}"
                               style="border-radius: 6px; padding: 10px 12px; display: flex; align-items: ${isCustom ? 'flex-start' : 'center'}; gap: 12px; cursor: pointer;">
                            <input type="checkbox" class="field-checkbox"
                                   ${isActive ? 'checked' : ''}
                                   ${isRequired ? 'disabled' : ''}
                                   style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-color, #667eea); flex-shrink: 0;" />
                            <div class="field-info" style="flex: 1; min-width: 0;">
                                ${isCustom ? `
                                    <div class="field-label-with-flags" style="display: flex; flex-direction: column; gap: 2px;">
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span class="text-textcolor" style="font-size: 13px; font-weight: 500;">${field.label}</span>
                                            <span style="background: var(--accent-color, #2563eb); color: white; font-size: 9px; padding: 2px 6px; border-radius: 3px; font-weight: 600;">CUSTOM</span>
                                            <button class="edit-custom-field-btn label-color"
                                                    data-field-id="${field.id || ''}"
                                                    data-field-name="${field.name}"
                                                    title="Edit custom field"
                                                    style="margin-left: auto; background: none; border: none; cursor: pointer; padding: 4px; font-size: 14px;"
                                                    onclick="event.stopPropagation();">
                                                ✏️
                                            </button>
                                        </div>
                                        <div style="font-size: 11px; color: #6b7280; text-align: left;">
                                            <span style="color: var(--accent-color, #2563eb);">SF:</span> ${field.name}
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
                                           style="flex: 1; min-width: 0; text-align: left; width: 100%; padding: 8px 12px; border-radius: 4px; font-size: 14px; margin-top: 6px;"
                                           onclick="event.stopPropagation();">
                                ` : `
                                    <div class="text-textcolor" style="font-size: 13px; font-weight: 500; line-height: 1.5; text-align: left;">
                                        <span style="color: #6b7280;">LS:</span> ${field.name}
                                        ${isRequired ? '<span style="display: inline-block; background: #f59e0b; color: white; font-size: 9px; padding: 2px 6px; border-radius: 3px; font-weight: 600; margin-left: 6px;">REQUIRED</span>' : ''}
                                    </div>
                                    ${field.hasCustomLabel && field.customLabel !== field.name ? `<div style="font-size: 12px; margin-top: 2px; text-align: left;"><span style="color: var(--accent-color, #2563eb);">SF:</span> <span style="color: var(--accent-color, #2563eb); font-weight: 500;">${field.customLabel}</span></div>` : ''}
                                `}
                            </div>
                            ${isCustom ? `
                                <button class="delete-custom-field-btn label-color"
                                        data-field-id="${field.id || ''}"
                                        data-field-name="${field.name}"
                                        title="Delete custom field"
                                        style="font-size: 14px; background: none; border: none; cursor: pointer; padding: 4px;"
                                        onclick="event.stopPropagation();">
                                    🗑️
                                </button>
                            ` : (!isRequired && !isStandardSalesforceField(field.name)) ? `
                                <button class="edit-field-label-btn label-color" data-field-name="${field.name}"
                                        style="background: transparent; border: none; padding: 4px; cursor: pointer; font-size: 16px; line-height: 1;"
                                        title="Edit field label"
                                        onclick="event.stopPropagation();">
                                    ✏️
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
                        if (isActive) {
                            fieldItem.classList.add('active');
                        } else {
                            fieldItem.classList.remove('active');
                        }

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
                    // Update active tab styling
                    filterTabs.forEach(t => {
                        t.classList.remove('active');
                        t.style.background = 'transparent';
                        t.style.color = '#4b5563';
                    });
                    tab.classList.add('active');
                    tab.style.background = '#3b82f6';
                    tab.style.color = 'white';

                    // Get filter and RE-RENDER the grid
                    const filter = tab.getAttribute('data-filter');
                    rootElement._currentFilter = filter;

                    // Re-render the grid with the new filter (listeners attached inline)
                    SalesforceLeadLib._renderFieldsGrid(rootElement, rootElement._fieldMappingService, filter);

                    console.log('Filter changed to:', filter);
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
                headerColor: 'var(--accent-color, #3b82f6)',
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

                // Re-render grid to show new field (switch to custom tab)
                rootElement._currentFilter = 'custom';
                this._renderFieldsGrid(rootElement, fieldMappingService, 'custom');
                this._attachCheckboxListeners(rootElement, fieldMappingService);
                this._attachDeleteListeners(rootElement, fieldMappingService);
                this._attachEditListeners(rootElement, fieldMappingService);
                this._attachCustomFieldValueListeners(rootElement, fieldMappingService);

                // Update active tab styling
                const filterTabs = rootElement.querySelectorAll('.filter-tab');
                filterTabs.forEach(t => {
                    const filter = t.getAttribute('data-filter');
                    if (filter === 'custom') {
                        t.classList.add('active');
                        t.style.background = '#3b82f6';
                        t.style.color = 'white';
                    } else {
                        t.classList.remove('active');
                        t.style.background = 'transparent';
                        t.style.color = '#4b5563';
                    }
                });

                SalesforceLeadLib._showToast('Custom field added successfully!', 'success');

            } catch (error) {
                console.error('Failed to add custom field:', error);
                SalesforceLeadLib._showToast('Failed to add custom field: ' + error.message, 'error');
            }
        }

        /**
         * Attach checkbox listeners to field items
         * @private
         */
        static _attachCheckboxListeners(rootElement, fieldMappingService) {
            const checkboxes = rootElement.querySelectorAll('.field-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', async (e) => {
                    const fieldItem = e.target.closest('.field-item');
                    const fieldName = fieldItem.getAttribute('data-field');
                    const isActive = e.target.checked;

                    try {
                        // Update field config in memory
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

                        // Mark as modified
                        fieldMappingService.modified = true;

                        // Save to localStorage
                        fieldMappingService.saveConfig();

                        // Save to API/database if eventId is available
                        if (fieldMappingService.currentEventId) {
                            await fieldMappingService.saveFieldMappingsToAPI(fieldName, isActive ? 'activate' : 'deactivate');
                            console.log(`Field ${fieldName} ${isActive ? 'activated' : 'deactivated'} and saved to API`);
                        } else {
                            console.log(`Field ${fieldName} ${isActive ? 'activated' : 'deactivated'} (localStorage only - no eventId)`);
                        }

                        // Update statistics counter without re-rendering the grid
                        SalesforceLeadLib._updateStatisticsCounter(rootElement, fieldMappingService);

                    } catch (error) {
                        console.error('Failed to toggle field:', error);
                        e.target.checked = !isActive; // Revert checkbox
                    }
                });
            });
        }

        /**
         * Attach listeners to custom field value inputs
         * @private
         */
        static _attachCustomFieldValueListeners(rootElement, fieldMappingService) {
            const valueInputs = rootElement.querySelectorAll('.custom-field-value-input');
            valueInputs.forEach(input => {
                // Debounce timer
                let saveTimer;

                input.addEventListener('input', (e) => {
                    const fieldId = e.target.getAttribute('data-field-id');
                    const fieldName = e.target.getAttribute('data-field-name');
                    const newValue = e.target.value;

                    // Clear existing timer
                    if (saveTimer) {
                        clearTimeout(saveTimer);
                    }

                    // Debounce: save after 500ms of no typing
                    saveTimer = setTimeout(async () => {
                        try {
                            // Find and update the custom field
                            const customFields = fieldMappingService.customFields || [];
                            const customField = customFields.find(cf => cf.id === fieldId);

                            if (customField) {
                                customField.value = newValue;

                                // Save to localStorage
                                fieldMappingService.saveConfig();

                                // Save to API if eventId is available
                                if (fieldMappingService.currentEventId) {
                                    await fieldMappingService.saveFieldMappingsToAPI(fieldName, 'update');
                                }

                                console.log(`Custom field "${fieldName}" value updated to: "${newValue}"`);
                            }
                        } catch (error) {
                            console.error('Failed to update custom field value:', error);
                        }
                    }, 500);
                });
            });
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

            // Add all fields from API
            for (const fieldName in apiFields) {
                if (apiFields.hasOwnProperty(fieldName) && !processedFields.has(fieldName)) {
                    const isStandardSalesforce = standardSalesforceFields.hasOwnProperty(fieldName);
                    const sfInfo = isStandardSalesforce ? standardSalesforceFields[fieldName] : null;
                    const config = fieldConfig.find(f => f.fieldName === fieldName);

                    // No config = inactive by default (must be explicitly activated in settings)
                    let isActive;
                    if (config) {
                        isActive = config.active === true;
                    } else {
                        isActive = false;
                    }

                    allFields.push({
                        name: fieldName,
                        active: isActive,
                        required: sfInfo ? sfInfo.required : false,
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

                    // Only active if explicitly set in config
                    let isActive = config ? config.active === true : false;

                    allFields.push({
                        name: fieldName,
                        active: isActive,
                        required: sfInfo.required || false,
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
         * Attach delete listeners to custom field delete buttons
         * @private
         * @deprecated - Delete listeners are now attached in _attachInlineListeners
         */
        static _attachDeleteListeners(rootElement, fieldMappingService) {
            // Note: Delete listeners are now attached in _attachInlineListeners
            // This function is kept for backwards compatibility but does nothing
        }

        /**
         * Attach edit listeners to field label edit buttons
         * @private
         */
        static _attachEditListeners(rootElement, fieldMappingService) {
            // Handle edit-field-label-btn for all fields (standard and custom)
            const editLabelButtons = rootElement.querySelectorAll('.edit-field-label-btn');
            editLabelButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering field-item click

                    const fieldName = button.getAttribute('data-field-name');

                    // Open edit label modal
                    this._openEditFieldLabelModal(rootElement, fieldMappingService, fieldName);
                });
            });

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

            if (!newLabel.trim()) {
                SalesforceLeadLib._showToast('Please enter a label', 'error');
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

                // Re-render grid to show updated label
                const currentFilter = rootElement._currentFilter || 'active';
                this._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);
                this._attachCheckboxListeners(rootElement, fieldMappingService);
                this._attachDeleteListeners(rootElement, fieldMappingService);
                this._attachEditListeners(rootElement, fieldMappingService);
                this._attachCustomFieldValueListeners(rootElement, fieldMappingService);

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
            // Find the custom field
            const customFields = fieldMappingService.customFields || [];
            const customField = customFields.find(cf => cf.id === fieldId);

            if (!customField) {
                SalesforceLeadLib._showToast('Custom field not found', 'error');
                return;
            }

            const currentName = customField.sfFieldName || customField.fieldName || customField.name || '';
            const currentValue = customField.value || '';

            // Use native dialog for proper stacking above WinJS panels
            const newValue = await showEditCustomFieldDialog(currentName, currentValue, {
                headerColor: '#10b981',
                saveText: 'Save Changes',
                cancelText: 'Cancel'
            });

            // If cancelled, newValue will be null
            if (newValue === null) {
                return;
            }

            try {
                // Store old name for comparison
                const oldName = customField.sfFieldName || customField.fieldName || customField.name;

                // Update custom field value (name stays the same - it's read-only)
                customField.value = newValue;

                // Save to config
                fieldMappingService.saveConfig();

                // Save to API if eventId is available
                if (fieldMappingService.currentEventId) {
                    await fieldMappingService.saveFieldMappingsToAPI(currentName, 'update');
                }

                console.log(`Custom field "${oldName}" updated with value:`, newValue);

                // Re-render grid
                const currentFilter = rootElement._currentFilter || 'custom';
                SalesforceLeadLib._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);

                // Re-attach listeners
                SalesforceLeadLib._attachCheckboxListeners(rootElement, fieldMappingService);
                SalesforceLeadLib._attachDeleteListeners(rootElement, fieldMappingService);
                SalesforceLeadLib._attachEditListeners(rootElement, fieldMappingService);
                SalesforceLeadLib._attachCustomFieldValueListeners(rootElement, fieldMappingService);

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
                            <div style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: var(--accent-color, #2563eb); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                            <p class="text-textcolor" style="margin-top: 16px; font-size: 16px;" data-win-res="{textContent: 'sforce.loadingData'}">Loading data...</p>
                            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
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

                // Sync customLabels to instance so transfer can access them
                const instance = this._getInstance();
                if (instance) {
                    instance.fieldMappingService.customLabels = customLabels;
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
                        <div style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: var(--accent-color, #2563eb); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                        <p class="text-textcolor" style="margin-top: 16px; font-size: 16px;" data-win-res="{textContent: 'sforce.loadingData'}">Loading lead data...</p>
                        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
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

                // Sync customLabels to instance so transfer can access them
                const instance = this._getInstance();
                if (instance) {
                    instance.fieldMappingService.customLabels = customLabels;
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
                        'Authorization': `Basic ${credentials}`
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
                        'Authorization': `Basic ${credentials}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('OData API error:', response.status, errorText);
                    throw new Error(`OData API call failed: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();
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

            const exportStatus = this.getExportStatus(contactId);
            const isExported = exportStatus !== null;
            const exportInfo = isExported
                ? `<div id="export-status-banner" style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                       <i class="fa-solid fa-circle-check" style="color: #2563eb; font-size: 20px;"></i>
                       <div>
                           <div class="text-textcolor" style="font-weight: 600; font-size: 14px;">Already exported to Salesforce</div>
                           <div class="label-color" style="font-size: 12px;">
                               Salesforce ID: <strong>${this._escapeHtml(exportStatus.salesforceId)}</strong>
                               • Exported: ${new Date(exportStatus.exportedAt).toLocaleString()}
                               ${exportStatus.exportedBy ? `• By: ${this._escapeHtml(exportStatus.exportedBy)}` : ''}
                           </div>
                       </div>
                       <button id="clear-export-status-btn" style="margin-left: auto; background: none; border: 1px solid #93c5fd; border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #2563eb; cursor: pointer;">
                           Clear & Re-export
                       </button>
                   </div>`
                : '';

            return `
                <style>
                    .sf-export-card { background-color: var(--Window, white); border: 1px solid #e5e7eb; }
                    .cnv-ui-dark .sf-export-card { border-color: #525252; }
                    .sf-export-table th { background-color: var(--box-bkg, #f9fafb); border-color: #e5e7eb; }
                    .cnv-ui-dark .sf-export-table th { background-color: var(--box-bkg, #1f2937); border-color: #525252; }
                    .sf-export-table td { border-color: #e5e7eb; }
                    .cnv-ui-dark .sf-export-table td { border-color: #525252; }
                    .sf-field-card { background-color: var(--box-bkg, #f9fafb); border: 1px solid #e5e7eb; }
                    .cnv-ui-dark .sf-field-card { background-color: var(--box-bkg, #1f2937); border-color: #525252; }
                    .sf-btn-view-inactive { background-color: var(--box-bkg, #e5e7eb); }
                    .cnv-ui-dark .sf-btn-view-inactive { background-color: var(--box-bkg, #374151); }
                </style>
                <div class="contenthost-background" style="max-width: 1400px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh;">
                    ${exportInfo}

                    <div class="sf-export-card" style="border-radius: 8px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
                        <div style="flex: 1; min-width: 250px;">
                            <h1 class="text-textcolor" style="font-size: 24px; font-weight: bold; margin: 0;" data-win-res="{textContent: 'sforce.title'}">
                                Transfer Lead to Salesforce
                            </h1>
                        </div>
                        <div style="display: flex; align-items: stretch; gap: 12px; flex-wrap: wrap;">
                            <div id="api-status-user-card" style="display: flex; align-items: center; gap: 10px; padding: 0 14px; height: 40px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
                                <div id="api-status-indicator" style="width: 10px; height: 10px; background: #fbbf24; border-radius: 50%;"></div>
                                <span id="api-status-text" style="font-size: 13px; font-weight: 500; color: #92400e;" data-win-res="{textContent: 'sforce.statusDisconnected'}">Disconnected</span>
                                <div id="user-profile-section" style="display: none; align-items: center; gap: 8px; margin-left: 8px; padding-left: 12px; border-left: 1px solid #fcd34d;">
                                    <div id="user-avatar-header" style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: bold; font-size: 10px;">
                                        MK
                                    </div>
                                    <span id="user-name-header" class="text-textcolor" style="font-size: 13px; font-weight: 500;">
                                        Maxim Kemajou
                                    </span>
                                </div>
                            </div>

                            <button id="disconnect-sf-btn" style="display: none; padding: 0 16px; height: 40px; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 500; border: 1px solid #fecaca; border-radius: 8px; cursor: pointer; align-items: center; gap: 8px; transition: background-color 0.2s;">
                                <i class="fa-solid fa-right-from-bracket"></i> <span data-win-res="{textContent: 'sforce.btnDisconnect'}">Disconnect</span>
                            </button>

                            <button id="sf-connect-btn" class="accent-background-color" style="display: flex; padding: 0 18px; height: 40px; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;">
                                <i class="fa-solid fa-plug"></i> <span data-win-res="{textContent: 'sforce.btnConnect'}">Connect to Salesforce</span>
                            </button>

                            <button id="transferToSalesforceBtnHeader" class="transferToSalesforceBtn" style="display: none; padding: 0 18px; height: 40px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;">
                                <i class="fa-solid fa-paper-plane"></i> <span data-win-res="{textContent: 'sforce.btnTransfer'}">Transfer to Salesforce</span>
                            </button>
                        </div>
                    </div>

                    <div class="sf-export-card" style="border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px;">
                            <div style="flex: 1; min-width: 200px;">
                                <h2 class="text-textcolor" style="font-size: 18px; font-weight: 600; margin: 0 0 4px 0;" data-win-res="{textContent: 'sforce.leadInformation'}">
                                    Lead Information
                                </h2>
                                <div class="label-color" style="font-size: 13px;">
                                    <span data-win-res="{textContent: 'sforce.sourceLeadReport'}">Source: Lead Report</span>
                                    <span style="margin: 0 8px;">•</span>
                                    <span>ID: ${this._escapeHtml(contactId)}</span>
                                    <span style="margin-left: 12px; padding: 2px 8px; background: #d1fae5; color: #065f46; border-radius: 4px; font-weight: 500;" data-win-res="{textContent: 'sforce.statusActive'}">Active</span>
                                    <span style="margin-left: 8px;" data-win-res="{textContent: 'sforce.createdUnknown'}">Created: Unknown</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button id="view-list-btn" class="view-toggle active accent-background-color" data-view="list" style="padding: 8px 16px; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-list"></i>
                                    <span data-win-res="{textContent: 'sforce.viewList'}">List</span>
                                </button>
                                <button id="view-cards-btn" class="view-toggle sf-btn-view-inactive text-textcolor" data-view="cards" style="padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-grip"></i>
                                    <span data-win-res="{textContent: 'sforce.viewCards'}">Cards</span>
                                </button>
                            </div>
                        </div>

                        <div id="list-view" style="overflow-x: auto;">
                            <table class="sf-export-table" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead>
                                    <tr style="border-bottom: 2px solid;">
                                        <th class="label-color" style="text-align: left; padding: 12px; font-weight: 600; text-transform: uppercase; font-size: 12px;" data-win-res="{textContent: 'sforce.colFieldName'}">FIELD NAME</th>
                                        <th class="label-color" style="text-align: left; padding: 12px; font-weight: 600; text-transform: uppercase; font-size: 12px;" data-win-res="{textContent: 'sforce.colValue'}">VALUE</th>
                                        <th class="label-color" style="text-align: left; padding: 12px; font-weight: 600; text-transform: uppercase; font-size: 12px;" data-win-res="{textContent: 'sforce.colStatus'}">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${allFields.map(field => `
                                        <tr style="border-bottom: 1px solid;">
                                            <td class="text-textcolor" style="padding: 12px;">
                                                <div style="font-weight: 500;">${this._escapeHtml(field.label || field.name)}</div>
                                                ${field.label && field.label !== field.name
                                                    ? `<div class="label-color" style="font-size: 11px;">${this._escapeHtml(field.name)}</div>`
                                                    : ``
                                                }
                                                ${field.isCustomField
                                                    ? `<div style="font-size: 12px; color: var(--accent-color, #2563eb);" data-win-res="{textContent: 'sforce.customField'}">Custom</div>`
                                                    : ``
                                                }
                                            </td>
                                            <td class="text-textcolor" style="padding: 12px;">
                                                ${isTestMode
                                                    ? `<input type="text"
                                                        class="test-field-input"
                                                        data-field-name="${this._escapeHtml(field.name)}"
                                                        data-event-id="${this._escapeHtml(eventId || '')}"
                                                        value="${this._escapeHtml(field.value || '')}"
                                                        style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: var(--Window, white); color: var(--text-color, #1f2937);"
                                                        placeholder="Enter test value..."
                                                    />`
                                                    : (field.value ? this._escapeHtml(field.value) : '<span class="label-color" style="font-style: italic;" data-win-res="{textContent: \'sforce.noValue\'}">No value</span>')
                                                }
                                            </td>
                                            <td style="padding: 12px;">
                                                <span style="display: inline-block; padding: 4px 8px; background: #d1fae5; color: #065f46; border-radius: 4px; font-size: 12px; font-weight: 500;" data-win-res="{textContent: 'sforce.statusActive'}">
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
                                <div class="sf-field-card" style="border-radius: 8px; padding: 16px;">
                                    ${field.isCustomField
                                        ? `<div style="font-size: 12px; color: var(--accent-color, #2563eb); margin-bottom: 4px;" data-win-res="{textContent: 'sforce.customField'}">Custom</div>`
                                        : ``
                                    }
                                    <div class="text-textcolor" style="font-weight: 600; margin-bottom: 4px;">${this._escapeHtml(field.label || field.name)}</div>
                                    ${field.label && field.label !== field.name
                                        ? `<div class="label-color" style="font-size: 11px; margin-bottom: 8px;">${this._escapeHtml(field.name)}</div>`
                                        : `<div style="margin-bottom: 8px;"></div>`
                                    }
                                    <div class="text-textcolor" style="font-size: 14px; margin-bottom: 8px;">
                                        ${isTestMode
                                            ? `<input type="text"
                                                class="test-field-input"
                                                data-field-name="${this._escapeHtml(field.name)}"
                                                data-event-id="${this._escapeHtml(eventId || '')}"
                                                value="${this._escapeHtml(field.value || '')}"
                                                style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: var(--Window, white); color: var(--text-color, #1f2937);"
                                                placeholder="Enter test value..."
                                            />`
                                            : (field.value ? this._escapeHtml(field.value) : '<span class="label-color" style="font-style: italic;" data-win-res="{textContent: \'sforce.noValue\'}">No value</span>')
                                        }
                                    </div>
                                    <span style="display: inline-block; padding: 3px 8px; background: #d1fae5; color: #065f46; border-radius: 4px; font-size: 11px; font-weight: 500;" data-win-res="{textContent: 'sforce.statusActive'}">
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
                            <div style="display:flex; align-items:center; gap:12px; padding:10px 12px; border:1px solid #e5e7eb; border-radius:8px; background:var(--box-bkg, #f9fafb);">
                                <span style="font-size:22px; color:#6b7280;">
                                    <i class="fa-solid fa-paperclip"></i>
                                </span>
                                <div style="flex:1; min-width:0;">
                                    <div class="text-textcolor" style="font-weight:500; font-size:13px;">Attachment ${index + 1}</div>
                                    <div class="label-color" style="font-size:11px; font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${this._escapeHtml(id.trim())}</div>
                                </div>
                                <button class="sf-view-attachment-btn" data-attachment-id="${this._escapeHtml(id.trim())}" style="padding:6px 12px; background:var(--accent-color,#2563eb); color:white; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap;">
                                    <i class="fa-solid fa-eye" style="margin-right:4px;"></i>Preview
                                </button>
                            </div>
                        `).join('');
                        return `
                            <div class="sf-export-card" style="border-radius:8px; padding:20px 24px; margin-top:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
                                    <i class="fa-solid fa-paperclip" style="color:var(--accent-color,#2563eb); font-size:16px;"></i>
                                    <h2 class="text-textcolor" style="font-size:16px; font-weight:600; margin:0;">Attachments (${ids.length})</h2>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:8px;">${rows}</div>
                            </div>
                        `;
                    })()}

                    <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end;">
                        <button id="cancel" class="cancelExportBtn sf-btn-secondary text-textcolor" style="padding: 10px 24px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;" data-win-res="{textContent: 'sforce.btnCancel'}">
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
                listBtn.addEventListener('click', () => {
                    listView.style.display = 'block';
                    cardsView.style.display = 'none';
                    listBtn.style.background = '#0070d2';
                    listBtn.style.color = 'white';
                    cardsBtn.style.background = '#e5e7eb';
                    cardsBtn.style.color = '#374151';
                });

                cardsBtn.addEventListener('click', () => {
                    listView.style.display = 'none';
                    cardsView.style.display = 'grid';
                    cardsBtn.style.background = '#0070d2';
                    cardsBtn.style.color = 'white';
                    listBtn.style.background = '#e5e7eb';
                    listBtn.style.color = '#374151';
                });
            }

            const clearExportBtn = rootElement.querySelector('#clear-export-status-btn');
            if (clearExportBtn) {
                clearExportBtn.addEventListener('click', () => {
                    const contactId = leadData.KontaktViewId || leadData.ContactId || leadData.KontaktVIEWID;
                    if (contactId) {
                        this.clearExportStatus(contactId);
                        const banner = rootElement.querySelector('#export-status-banner');
                        if (banner) {
                            banner.remove();
                        }
                        this._showToast('Export status cleared. You can now re-export this contact.', 'success');
                    }
                });
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
                    clickedBtn.innerHTML = `<span style="display: inline-block; width: 14px; height: 14px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px;"></span>${_t('sforce.transferring', 'Transferring...')}`;
                    clickedBtn.style.opacity = '0.8';

                    try {
                        const instance = this._getInstance();
                        if (!instance) {
                            throw new Error('SalesforceLeadLib instance not found');
                        }

                        const transferData = {};

                        if (!allFields || allFields.length === 0) {
                            throw new Error('No field data available for transfer');
                        }

                        const isTestMode = leadData && leadData._isTestMode === true;
                        const fakeData = isTestMode ? (leadData._fakeData || {}) : null;

                        allFields.forEach(field => {
                            if (field && field.name) {
                                let sfFieldName = field.name;
                                if (!isStandardSalesforceField(field.name)) {
                                    const customLabel = instance.fieldMappingService?.customLabels?.[field.name];
                                    if (customLabel) sfFieldName = customLabel;
                                    if (!sfFieldName.endsWith('__c')) {
                                        sfFieldName = sfFieldName + '__c';
                                    }
                                }

                                if (isTestMode && fakeData && fakeData[field.name] !== undefined) {
                                    transferData[sfFieldName] = fakeData[field.name];
                                } else if (field.transferValue !== undefined) {
                                    transferData[sfFieldName] = field.transferValue;
                                } else {
                                    transferData[sfFieldName] = field.value || '';
                                }
                            }
                        });

                        const numericFields = ['AnnualRevenue', 'NumberOfEmployees'];
                        numericFields.forEach(fieldName => {
                            if (transferData.hasOwnProperty(fieldName)) {
                                const value = transferData[fieldName];
                                if (value !== null && value !== undefined && value !== '') {
                                    const numValue = Number(value);
                                    if (!isNaN(numValue)) {
                                        transferData[fieldName] = numValue;
                                    } else {
                                        delete transferData[fieldName];
                                    }
                                } else {
                                    delete transferData[fieldName];
                                }
                            }
                        });

                        const backendUrl = instance.config.backendUrl;
                        const orgId = localStorage.getItem('orgId') || 'default';

                        const payload = {
                            leadData: transferData,
                            attachments: [],  // No attachments for now from Portal
                            leadId: leadData.KontaktViewId || leadData.ContactId || null
                        };

                        const response = await fetch(`${backendUrl}/api/salesforce/leads`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Org-Id': orgId
                            },
                            body: JSON.stringify(payload)
                        });

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
                                    `The server encountered an error while processing your request.\n\nDetails: ${errorDetails}\n\nPlease check the backend logs for more information.`
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
                        const contactId = leadData.KontaktViewId || leadData.ContactId || leadData.KontaktVIEWID;
                        if (contactId) {
                            this._saveExportStatus(contactId, salesforceId);
                        }

                        showSuccessModal(
                            'Lead Transferred Successfully!',
                            `The lead has been successfully transferred to Salesforce.\n\nSalesforce ID: ${salesforceId}`
                        );

                    } catch (error) {
                        console.error('Transfer error:', error);

                        transferBtns.forEach(b => b.disabled = false);
                        clickedBtn.innerHTML = originalText;
                        clickedBtn.style.opacity = '1';

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
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                background: var(--Window, white);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            `;

            dialog.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:var(--accent-color,#2563eb); color:white; flex-shrink:0;">
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
                    <div style="color:#6b7280; font-size:14px; text-align:center;">
                        <div style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:var(--accent-color,#2563eb);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div>
                        ${_t('sforce.loading', 'Loading...')}
                    </div>
                </div>
            `;

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
                    modalBody.innerHTML = `<div style="color:#6b7280; text-align:center; padding:40px;">${_t('sforce.noAttachmentContent', 'No content available for this attachment.')}</div>`;
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
                        modalBody.innerHTML = `<div style="width:100%; text-align:center;">${svgStr}</div>`;
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
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) statusText.textContent = _t('sforce.statusChecking', 'Checking...');

                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                const authStatus = await instance._checkAuthenticationStatus();

                if (authStatus && authStatus.success) {
                    const userInfo = authStatus.userInfo || {};
                    const displayName = userInfo.display_name || userInfo.username || 'Unknown user';

                    if (statusCard) {
                        statusCard.style.background = '#dcfce7';
                        statusCard.style.borderColor = '#86efac';
                    }
                    if (indicator) indicator.style.background = '#10b981';
                    if (statusText) {
                        statusText.textContent = _t('sforce.statusConnected', 'Connected');
                        statusText.style.color = '#16a34a';
                    }

                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) disconnectBtn.style.display = 'flex';

                    const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                    if (transferBtnHeader) transferBtnHeader.style.display = 'flex';
                } else {
                    if (statusCard) {
                        statusCard.style.background = '#fef3c7';
                        statusCard.style.borderColor = '#fcd34d';
                    }
                    if (indicator) indicator.style.background = '#fbbf24';
                    if (statusText) {
                        statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                        statusText.style.color = '#f59e0b';
                    }
                    if (userSection) userSection.style.display = 'none';
                    if (connectBtn) connectBtn.style.display = 'flex';
                    if (disconnectBtn) disconnectBtn.style.display = 'none';

                    const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                    if (transferBtnHeader) transferBtnHeader.style.display = 'none';
                }

            } catch (error) {
                console.error('Failed to check connection status:', error);

                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                    statusText.style.color = '#f59e0b';
                }
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
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) statusText.textContent = _t('sforce.statusDisconnecting', 'Disconnecting...');
                if (disconnectBtn) disconnectBtn.disabled = true;

                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                await instance.disconnect();

                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                    statusText.style.color = '#f59e0b';
                }
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

                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                    statusText.style.color = '#f59e0b';
                }
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
                if (indicator) indicator.style.background = '#fbbf24';
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
                        statusCard.style.background = '#dcfce7';
                        statusCard.style.borderColor = '#86efac';
                    }
                    if (indicator) indicator.style.background = '#10b981';
                    if (statusText) {
                        statusText.textContent = _t('sforce.statusConnected', 'Connected');
                        statusText.style.color = '#16a34a';
                    }

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

                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = _t('sforce.connectionFailed', 'Connection Failed');
                    statusText.style.color = '#f59e0b';
                }
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
                    if (indicator) indicator.style.background = '#fbbf24';
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
                const sfConnected = localStorage.getItem('sf_connected');
                const savedUserInfo = localStorage.getItem('sf_user_info');

                if (sfConnected === 'true' && savedUserInfo) {
                    const userInfo = JSON.parse(savedUserInfo);
                    const displayName = userInfo.display_name || userInfo.username || 'Salesforce User';

                    if (statusCard) {
                        statusCard.style.background = '#dcfce7';
                        statusCard.style.borderColor = '#86efac';
                    }
                    if (indicator) indicator.style.background = '#10b981';
                    if (statusText) {
                        statusText.textContent = _t('sforce.statusConnected', 'Connected');
                        statusText.style.color = '#16a34a';
                    }
                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) disconnectBtn.style.display = 'flex';

                    const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                    if (transferBtn) transferBtn.style.display = 'flex';
                } else {
                    if (statusCard) {
                        statusCard.style.background = '#fef3c7';
                        statusCard.style.borderColor = '#fcd34d';
                    }
                    if (indicator) indicator.style.background = '#fbbf24';
                    if (statusText) {
                        statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                        statusText.style.color = '#92400e';
                    }
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
                if (indicator) indicator.style.background = '#fbbf24';
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
                        statusCard.style.background = '#dcfce7';
                        statusCard.style.borderColor = '#86efac';
                    }
                    if (indicator) indicator.style.background = '#10b981';
                    if (statusText) {
                        statusText.textContent = _t('sforce.statusConnected', 'Connected');
                        statusText.style.color = '#16a34a';
                    }
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
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = _t('sforce.connectionFailed', 'Connection Failed');
                    statusText.style.color = '#f59e0b';
                }
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
                if (indicator) indicator.style.background = '#fbbf24';
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

                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                    statusText.style.color = '#92400e';
                }
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

                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = _t('sforce.statusDisconnected', 'Disconnected');
                    statusText.style.color = '#92400e';
                }
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
                if (this.BATCH_EXCLUDED_FIELDS.has(apiFieldName)) return;
                if (/\s/.test(apiFieldName)) return;

                const fieldInfo = processedData[apiFieldName];
                const isActive = typeof fieldInfo === 'object' ? (fieldInfo.active !== false) : true;
                if (!isActive) return;

                const value = typeof fieldInfo === 'object' ? fieldInfo.value : fieldInfo;

                const isQuestionAnswerTextField = /^(Question|Answers|Text)\d{2}$/.test(apiFieldName);
                if (!isQuestionAnswerTextField) {
                    if (!value || (typeof value === 'string' && (value.trim() === '' || value === 'N/A'))) return;
                } else {
                    if (value !== null && value !== undefined && typeof value === 'string' && (value.trim() === '' || value === 'N/A')) return;
                }

                let sfFieldName;
                if (this.STANDARD_SF_FIELDS.has(apiFieldName)) {
                    sfFieldName = apiFieldName;
                } else {
                    const customLabel = fieldMappingService?.customLabels?.[apiFieldName];
                    if (customLabel && customLabel.trim() !== '' && customLabel !== apiFieldName) {
                        sfFieldName = customLabel.trim();
                    } else {
                        sfFieldName = apiFieldName;
                    }
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
            if (customIdLabel?.trim()?.endsWith('__c')) return customIdLabel.trim();
            return null;
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
                const sessionToken = localStorage.getItem('sf_session_token') || '';

                const payload = {
                    leadData: salesforceLeadData,
                    attachments: attachments || [],
                    ...(externalIdField && { externalIdField })
                };

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Org-Id': orgId,
                        ...(sessionToken && { 'X-Session-Token': sessionToken })
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });

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
            const safeMessage = (message || '').replace(/[\r\n]+/g, ' ').substring(0, 512);
            const safeMs = Math.max(0, Math.round(milliseconds || 0));

            const id = kontaktViewId.toLowerCase();
            const encodedMessage = encodeURIComponent(safeMessage);
            const endpoint = `LS_SetLeadExportStatus?id='${id}'&status='${safeStatus}'&message='${encodedMessage}'&milliseconds=${safeMs}&$format=json`;

            try {
                // LS_SetLeadExportStatus is on odata_apisf, not odata_online
                const baseUrl = `${this._portalConfig.serverUrl}/odata_apisf`;
                const url = `${baseUrl}/${endpoint}`;
                const credentials = btoa(`${this._portalConfig.user}:${this._portalConfig.password}`);

                console.log(`📊 LS_SetLeadExportStatus: id=${id}, status=${safeStatus}, ms=${safeMs}`);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Basic ${credentials}`
                    }
                });

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

        /** @private Status colors for batch modals */
        static BATCH_STATUS_COLORS = {
            success: '#10b981',
            failed: '#ef4444',
            duplicate: '#f59e0b',
            skipped: '#6b7280'
        };

        /** @private Status icons for batch modals */
        static BATCH_STATUS_ICONS = {
            success: '&#10003;',
            failed: '&#10007;',
            duplicate: '&#9888;',
            skipped: '&#8212;'
        };

        /**
         * Show batch progress modal with live updates
         * @param {number} totalCount - Total number of leads to transfer
         * @returns {Object} { modal, updateProgress(current, total, leadName), updateLeadStatus(result), close() }
         */
        static showBatchProgressModal(totalCount) {
            const modal = document.createElement('div');
            modal.id = 'batch-progress-modal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.6); display: flex; align-items: center;
                justify-content: center; z-index: 10001;
            `;

            modal.innerHTML = `
                <div style="background: var(--Window, white); border-radius: 12px; padding: 32px; width: 550px; max-width: 95vw; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 20px; color: var(--WindowText, #111827);">${_t('crmExport.batchTransferTitle', 'Batch Transfer')}</h2>
                        <span id="batch-progress-counter" style="font-size: 14px; color: var(--ColorLabel);">0 / ${totalCount}</span>
                    </div>
                    <div id="batch-current-lead" style="background: var(--ColorTileBackground); border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 14px; color: var(--ColorText);">
                        ${_t('crmExport.preparing', 'Preparing...')}
                    </div>
                    <div style="background: var(--ColorLabel); border-radius: 9999px; height: 8px; margin-bottom: 20px; overflow: hidden;">
                        <div id="batch-progress-bar" style="background: var(--ColorAccent); height: 100%; width: 0%; border-radius: 9999px; transition: width 0.3s ease;"></div>
                    </div>
                    <div id="batch-results-list" style="flex: 1; overflow-y: auto; max-height: 300px; border: 1px solid var(--ColorLabel); border-radius: 8px; margin-bottom: 16px;"></div>
                    <div style="text-align: center;">
                        <button id="batch-cancel-btn" style="
                            padding: 10px 32px; border: 2px solid #dc2626; background: var(--Window, white); color: #dc2626;
                            border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                        ">${_t('crmExport.btnCancel', 'Cancel')}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const cancelBtn = modal.querySelector('#batch-cancel-btn');
            cancelBtn.addEventListener('click', () => {
                SalesforceLeadLib.cancelBatch();
                cancelBtn.textContent = _t('crmExport.cancelling', 'Cancelling...');
                cancelBtn.disabled = true;
                cancelBtn.style.opacity = '0.5';
            });
            cancelBtn.addEventListener('mouseenter', () => {
                if (!cancelBtn.disabled) { cancelBtn.style.background = '#dc2626'; cancelBtn.style.color = 'white'; }
            });
            cancelBtn.addEventListener('mouseleave', () => {
                if (!cancelBtn.disabled) { cancelBtn.style.background = 'var(--Window, white)'; cancelBtn.style.color = '#dc2626'; }
            });

            const STATUS_COLORS = this.BATCH_STATUS_COLORS;
            const STATUS_ICONS = this.BATCH_STATUS_ICONS;

            return {
                modal,

                updateProgress(current, total, leadName) {
                    const counter = modal.querySelector('#batch-progress-counter');
                    const bar = modal.querySelector('#batch-progress-bar');
                    const currentLead = modal.querySelector('#batch-current-lead');
                    if (counter) counter.textContent = `${current} / ${total}`;
                    if (bar) bar.style.width = `${(current / total) * 100}%`;
                    if (currentLead) currentLead.textContent = `${_t('crmExport.transferring', 'Transferring:')} ${leadName}`;
                },

                updateLeadStatus(result) {
                    const list = modal.querySelector('#batch-results-list');
                    if (!list) return;
                    const color = STATUS_COLORS[result.status] || '#6b7280';
                    const icon = STATUS_ICONS[result.status] || '?';
                    const entry = document.createElement('div');
                    entry.style.cssText = `display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--ColorTileBackground); font-size: 13px;`;
                    entry.innerHTML = `
                        <span style="width: 22px; height: 22px; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">${icon}</span>
                        <span style="flex: 1; color: var(--WindowText, #111827); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${SalesforceLeadLib._escapeHtml(result.displayName)}</span>
                        <span style="color: ${color}; font-weight: 500; font-size: 12px; flex-shrink: 0;">${result.status}</span>
                        <span style="color: var(--ColorLabel); font-size: 11px; flex-shrink: 0;">${result.milliseconds ? (result.milliseconds / 1000).toFixed(1) + 's' : ''}</span>
                    `;
                    list.appendChild(entry);
                    list.scrollTop = list.scrollHeight;
                },

                close() {
                    if (modal.parentNode) modal.parentNode.removeChild(modal);
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
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.6); display: flex; align-items: center;
                justify-content: center; z-index: 10002;
            `;

            const totalSeconds = (summary.totalMs / 1000).toFixed(1);
            const STATUS_COLORS = this.BATCH_STATUS_COLORS;
            const STATUS_ICONS = this.BATCH_STATUS_ICONS;

            let headerColor = '#10b981';
            let headerText = _t('crmExport.batchTransferComplete', 'Batch Transfer Complete');
            if (summary.cancelled) {
                headerColor = '#f59e0b';
                headerText = _t('crmExport.batchTransferCancelled', 'Batch Transfer Cancelled');
            } else if (summary.failedCount > 0 && summary.successCount === 0) {
                headerColor = '#ef4444';
                headerText = _t('crmExport.batchTransferFailed', 'Batch Transfer Failed');
            } else if (summary.failedCount > 0) {
                headerColor = '#f59e0b';
                headerText = _t('crmExport.batchTransferPartial', 'Batch Transfer Partial');
            }

            const buildStatBox = (label, count, color) => `
                <div style="flex: 1; text-align: center; padding: 16px 8px; border-right: 1px solid var(--ColorLabel);">
                    <div style="font-size: 28px; font-weight: 700; color: ${color};">${count}</div>
                    <div style="font-size: 12px; color: var(--ColorLabel); margin-top: 2px;">${label}</div>
                </div>
            `;

            const buildResultRow = (r) => {
                const color = STATUS_COLORS[r.status] || '#6b7280';
                const icon = STATUS_ICONS[r.status] || '?';
                const time = r.milliseconds ? `${(r.milliseconds / 1000).toFixed(1)}s` : '';
                const sfId = r.salesforceId ? `<span style="color: var(--ColorLabel); font-size: 11px;">SF: ${r.salesforceId}</span>` : '';
                const msg = r.message ? `<span style="color: var(--ColorLabel); font-size: 11px;">${SalesforceLeadLib._escapeHtml(r.message)}</span>` : '';
                return `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px 20px; border-bottom: 1px solid var(--ColorTileBackground);">
                        <span style="width: 22px; height: 22px; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">${icon}</span>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; color: var(--ColorText); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${SalesforceLeadLib._escapeHtml(r.displayName)}</div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">${sfId}${msg}</div>
                        </div>
                        <span style="color: ${color}; font-weight: 500; font-size: 12px; flex-shrink: 0;">${r.status}</span>
                        <span style="color: var(--ColorLabel); font-size: 11px; flex-shrink: 0; min-width: 35px; text-align: right;">${time}</span>
                    </div>
                `;
            };

            modal.innerHTML = `
                <div style="background: var(--Window, white); border-radius: 12px; width: 550px; max-width: 95vw; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden;">
                    <div style="background: ${headerColor}; color: white; padding: 20px 28px;">
                        <h2 style="margin: 0; font-size: 20px;">${headerText}</h2>
                        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">${summary.total} ${_t('crmExport.leadsProcessed', 'leads processed in')} ${totalSeconds}s</p>
                    </div>
                    <div style="display: flex; gap: 0; border-bottom: 1px solid var(--ColorLabel);">
                        ${buildStatBox(_t('crmExport.statSuccess', 'Success'), summary.successCount, '#10b981')}
                        ${buildStatBox(_t('crmExport.statFailed', 'Failed'), summary.failedCount, '#ef4444')}
                        ${buildStatBox(_t('crmExport.statDuplicate', 'Duplicate'), summary.duplicateCount, '#f59e0b')}
                        ${buildStatBox(_t('crmExport.statSkipped', 'Skipped'), summary.skippedCount, '#6b7280')}
                    </div>
                    <div style="flex: 1; overflow-y: auto; max-height: 350px; padding: 8px 0;">
                        ${summary.results.map(r => buildResultRow(r)).join('')}
                    </div>
                    <div style="padding: 16px 28px; border-top: 1px solid var(--ColorLabel); text-align: center;">
                        <button id="batch-summary-close" style="
                            padding: 10px 40px; background: var(--ColorAccent); color: white; border: none;
                            border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                        ">${_t('crmExport.btnClose', 'Close')}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('#batch-summary-close');
            const closeSummary = () => {
                if (modal.parentNode) modal.parentNode.removeChild(modal);
                if (typeof onClose === 'function') {
                    onClose();
                }
                // No reload — cells are already updated in real-time by onLeadComplete
            };
            closeBtn.addEventListener('click', closeSummary);
            closeBtn.addEventListener('mouseenter', () => { closeBtn.style.opacity = '0.85'; });
            closeBtn.addEventListener('mouseleave', () => { closeBtn.style.opacity = '1'; });
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
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center;
                    justify-content: center; z-index: 10003;
                `;
                modal.innerHTML = `
                    <div style="background: var(--Window, white); border-radius: 12px; padding: 28px; width: 420px; max-width: 90vw; box-shadow: 0 20px 40px rgba(0,0,0,0.25);">
                        <h3 style="margin: 0 0 16px 0; font-size: 18px; color: var(--ColorText);">${this._escapeHtml(title)}</h3>
                        <p style="margin: 0 0 24px 0; font-size: 14px; color: var(--ColorLabel); line-height: 1.5; white-space: pre-line;">${this._escapeHtml(message)}</p>
                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button id="confirm-cancel-btn" style="
                                padding: 10px 24px; border: 1px solid var(--ColorLabel); background: var(--Window); color: var(--ColorText);
                                border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
                            ">${this._escapeHtml(cancelText)}</button>
                            <button id="confirm-ok-btn" style="
                                padding: 10px 24px; border: none; background: ${okColor}; color: white;
                                border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
                            ">${this._escapeHtml(okText)}</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                const cleanup = (result) => { if (modal.parentNode) modal.parentNode.removeChild(modal); resolve(result); };
                modal.querySelector('#confirm-ok-btn').addEventListener('click', () => cleanup(true));
                modal.querySelector('#confirm-cancel-btn').addEventListener('click', () => cleanup(false));
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
        static async renderContactList(rootElement, eventId, options = {}) {
            const { pageSize = 200 } = options;

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

            // --- Loading spinner ---
            rootElement.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;min-height:200px;">
                    <div style="width:40px;height:40px;border:4px solid #e5e7eb;border-top-color:#2563eb;border-radius:50%;animation:sf-spin 0.8s linear infinite;"></div>
                    <p style="margin-top:14px;font-size:14px;color:#6b7280;">${_t('crmExport.loadingContacts', 'Loading contacts…')}</p>
                    <style>@keyframes sf-spin{to{transform:rotate(360deg);}}</style>
                </div>`;

            try {
                // --- Load field mappings ---
                const instance = this._getInstance();
                if (!instance) throw new Error('SalesforceLeadLib not initialized. Call SalesforceLeadLib.init() first.');
                const fieldMappingService = instance.fieldMappingService;

                if (!fieldMappingService.fieldConfig?.config?.fields?.length) {
                    await fieldMappingService.loadFieldMappingsFromAPI(eventId);
                }

                // --- Load LS_LeadReport data (follow OData pagination) ---
                let allItems = [];
                let nextEndpoint = `LS_LeadReport?$filter=EventId eq '${eventId}'&$top=${pageSize}&$format=json`;
                while (nextEndpoint) {
                    const data = await this._callPortalODataAPI(nextEndpoint);
                    const pageItems = data?.d?.results || [];
                    allItems = allItems.concat(pageItems);
                    // Follow OData __next link for server-side pagination
                    if (data?.d?.__next) {
                        // __next is a full URL; extract the relative path after the OData root
                        const nextUrl = data.d.__next;
                        const odataIdx = nextUrl.indexOf('/odata');
                        nextEndpoint = odataIdx !== -1 ? nextUrl.substring(nextUrl.indexOf('/', odataIdx + 1) + 1) : null;
                    } else {
                        nextEndpoint = null;
                    }
                }

                console.log(`[CRM Export] Total leads loaded: ${allItems.length} (pagination pages followed)`);

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

                    for (let i = 0; i < 15; i++) {
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
                const sfStatus = await this._checkSfConnectionSilent();

                // --- Build CSS + HTML ---
                const STICKY_COL_LEFT = 52; // left offset: 32px checkbox + 20px dot column
                const colHeaders = displayColumns.map((col, i) => {
                    const label = getColumnLabel(col);
                    if (i === 0) return `<th class="sf-cl-th sf-cl-th-first-data" style="position:sticky;left:${STICKY_COL_LEFT}px;z-index:3;background:#1f2937;">${esc(label)}</th>`;
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
                    <style>
                        .sf-cl-wrap { display:flex; flex-direction:column; height:100%; padding:0 16px; box-sizing:border-box; overflow:hidden; }
                        .sf-cl-toolbar { display:flex; align-items:center; gap:8px; padding:10px 0; flex-wrap:wrap; }
                        .sf-cl-btn { padding:7px 14px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid transparent; }
                        .sf-cl-btn-batch { background:var(--ColorAccent); color:#fff; border-color:var(--ColorAccent); }
                        .sf-cl-btn-batch:disabled { opacity:0.5; cursor:not-allowed; }
                        .sf-cl-btn-refresh { background:var(--ColorTileBackground); color:var(--ColorText); border-color:var(--ColorLabel); }
                        .sf-cl-btn-toggle { background:var(--ColorAccent); color:#fff; border-color:var(--ColorAccent); display:flex; align-items:center; justify-content:center; width:34px; height:34px; padding:0; border-radius:6px; }
                        .sf-cl-btn-toggle svg { transition:transform .3s; }
                        .sf-cl-btn-toggle.active svg { transform:rotate(45deg); }
                        .sf-cl-count { font-size:12px; color:var(--ColorLabel); }
                        /* Filter bar */
                        .sf-cl-filter-bar { display:none; flex-wrap:wrap; gap:10px; padding:10px 12px; background:var(--ColorTileBackground); border-radius:8px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,.1); align-items:flex-end; }
                        .sf-cl-filter-bar.sf-cl-filter-visible { display:flex; }
                        .sf-cl-fg { position:relative; flex:1; min-width:130px; }
                        .sf-cl-fg input { width:100%; padding:6px 8px; border:1px solid var(--ColorLabel); border-radius:6px; font-size:13px; height:34px; outline:none; box-sizing:border-box; background:var(--Window); color:var(--ColorText); transition:border-color .2s; }
                        .sf-cl-fg input:focus { border-color:var(--ColorAccent); box-shadow:0 0 0 2px rgba(217,97,63,.2); }
                        .sf-cl-fg label { position:absolute; top:50%; left:8px; transform:translateY(-50%); background:var(--Window); padding:0 4px; color:var(--ColorLabel); font-size:13px; transition:all .2s; pointer-events:none; }
                        .sf-cl-fg input:focus + label,
                        .sf-cl-fg input:not(:placeholder-shown) + label { top:0; font-size:11px; color:var(--ColorAccent); }
                        .sf-cl-filter-actions { display:flex; gap:10px; align-self:flex-end; margin-left:auto; }
                        .sf-cl-btn-apply { background:var(--ColorAccent); color:#fff; border:none; padding:6px 18px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; height:34px; }
                        .sf-cl-btn-apply:hover { opacity:.9; }
                        .sf-cl-btn-reset { background:var(--ColorLabel); color:#fff; border:none; padding:6px 18px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; height:34px; }
                        .sf-cl-btn-reset:disabled { opacity:.5; cursor:not-allowed; }
                        /* Table */
                        .sf-cl-table-wrap { overflow-x:auto; overflow-y:auto; flex:1; min-height:0; scrollbar-width:thin; position:relative; border:1px solid var(--ColorLabel); border-radius:8px; }
                        .sf-cl-table-wrap::-webkit-scrollbar { height:8px; width:8px; }
                        .sf-cl-table-wrap::-webkit-scrollbar-track { background:var(--ColorTileBackground); }
                        .sf-cl-table-wrap::-webkit-scrollbar-thumb { background:var(--ColorLabel); border-radius:4px; }
                        .sf-cl-table { border-collapse:collapse; width:max-content; min-width:100%; font-size:13px; }
                        .sf-cl-th { background:#1f2937; color:#f9fafb; padding:8px 10px; text-align:left; white-space:nowrap; font-weight:600; position:sticky; top:0; z-index:2; }
                        .sf-cl-th-sticky { position:sticky; left:0; z-index:3; background:#1f2937; }
                        .sf-cl-td { padding:7px 10px; border-bottom:1px solid var(--ColorLabel); white-space:nowrap; vertical-align:middle; color:var(--ColorText); }
                        .sf-cl-td-sticky { position:sticky; left:0; z-index:1; background:var(--Window); }
                        .sf-cl-td-first-data { background:var(--Window); }
                        .sf-cl-row:hover .sf-cl-td { background:var(--ColorTileBackground); }
                        .sf-cl-row:hover .sf-cl-td-sticky, .sf-cl-row:hover .sf-cl-td-first-data { background:var(--ColorTileBackground); }
                        .sf-cl-row-success .sf-cl-td { background:rgba(220,252,231,0.6) !important; }
                        .sf-cl-row-success .sf-cl-td-sticky, .sf-cl-row-success .sf-cl-td-first-data { background:rgba(220,252,231,0.9) !important; }
                        .sf-cl-row-failed .sf-cl-td { background:rgba(254,226,226,0.6) !important; }
                        .sf-cl-row-failed .sf-cl-td-sticky, .sf-cl-row-failed .sf-cl-td-first-data { background:rgba(254,226,226,0.9) !important; }
                        .sf-cl-row-duplicate .sf-cl-td { background:rgba(254,243,199,0.6) !important; }
                        .sf-cl-row-duplicate .sf-cl-td-sticky, .sf-cl-row-duplicate .sf-cl-td-first-data { background:rgba(254,243,199,0.9) !important; }
                        .sf-export-badge-dot { width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0; }
                        .dot-success { background:#16a34a; }
                        .dot-failed { background:#dc2626; }
                        .dot-duplicate { background:#d97706; }
                        .sf-cl-empty { padding:32px; text-align:center; color:var(--ColorLabel); }
                        /* Connection status card */
                        .sf-cl-status-wrap { display:flex; align-items:center; gap:10px; margin-left:auto; }
                        .sf-cl-status-card { display:flex; align-items:center; gap:10px; padding:8px 14px; border-radius:8px; border:1px solid var(--ColorLabel); background:var(--ColorTileBackground); }
                        .sf-cl-status-card.connected { border-color:#86efac; background:rgba(220,252,231,0.3); }
                        .sf-cl-status-dot { width:10px; height:10px; border-radius:50%; background:var(--ColorLabel); }
                        .sf-cl-status-dot.connected { background:#10b981; }
                        .sf-cl-status-text { font-size:13px; font-weight:500; color:var(--ColorText); }
                        .sf-cl-status-text.connected { color:#16a34a; }
                        .sf-cl-user-section { display:none; align-items:center; gap:8px; margin-left:8px; padding-left:12px; border-left:1px solid var(--ColorLabel); }
                        .sf-cl-user-section.visible { display:flex; }
                        .sf-cl-user-avatar { width:24px; height:24px; background:var(--ColorAccent); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:10px; }
                        .sf-cl-user-name { font-size:13px; font-weight:500; color:var(--ColorText); }
                        .sf-cl-btn-disconnect { padding:0 16px; height:38px; background:var(--ColorTileBackground); color:#dc2626; font-size:13px; font-weight:500; border:1px solid #fecaca; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:8px; }
                        .sf-cl-btn-connect { padding:0 16px; height:38px; background:var(--ColorAccent); color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:8px; }
                    </style>
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
                            <span class="sf-cl-count" id="sf-cl-count">${allItems.length} ${_t('crmExport.contacts', 'contacts')}</span>
                            ${isFakeData ? `<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_t('crmExport.demoData', 'Demo Data')}</span>` : ''}
                            ${sfBtnHtml}
                        </div>
                        ${activeFilterFields.length > 0 ? `
                        <div class="sf-cl-filter-bar" id="sf-cl-filter-bar">
                            ${filterHTML}
                            <div class="sf-cl-filter-actions">
                                <button class="sf-cl-btn-apply" id="sf-cl-apply-btn">${_t('crmExport.btnApplyFilters', 'Apply Filters')}</button>
                                <button class="sf-cl-btn-reset" id="sf-cl-reset-btn" disabled>${_t('crmExport.btnResetFilters', 'Reset Filters')}</button>
                            </div>
                        </div>` : ''}
                        <div class="sf-cl-table-wrap">
                            <table class="sf-cl-table" id="sf-cl-table">
                                <thead>
                                    <tr>
                                        <th class="sf-cl-th sf-cl-th-sticky" style="width:32px;left:0;">
                                            <input type="checkbox" id="sf-cl-select-all" title="${_t('crmExport.selectAll', 'Select all')}" />
                                        </th>
                                        <th class="sf-cl-th" style="width:20px;position:sticky;left:32px;z-index:3;background:#1f2937;"></th>
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
                        return `<tr class="sf-cl-row ${rowClass}" data-lead-id="${esc(item.Id)}">
                            <td class="sf-cl-td sf-cl-td-sticky"><input type="checkbox" class="sf-cl-row-cb" /></td>
                            <td class="sf-cl-td sf-cl-td-first-data" style="text-align:center;position:sticky;left:32px;z-index:1;background:inherit;">
                                ${dotClass ? `<span class="sf-export-badge-dot ${dotClass}" title="${esc(exportStatus)}"></span>` : ''}
                            </td>
                            ${cells}
                        </tr>`;
                    }).join('');

                    emptyEl.style.display = items.length === 0 ? 'block' : 'none';
                    if (countEl) countEl.textContent = `${items.length} / ${allItems.length} ${_t('crmExport.contacts', 'contacts')}`;
                    updateBatchBtn();
                };

                const updateBatchBtn = () => {
                    const batchBtn = rootElement.querySelector('#sf-cl-batch-btn');
                    if (!batchBtn) return;
                    const checked = rootElement.querySelectorAll('.sf-cl-row-cb:checked');
                    batchBtn.disabled = checked.length === 0;
                    batchBtn.textContent = `${_t('crmExport.startBatchTransfer', 'Start Batch Transfer')} (${checked.length})`;
                };

                const updateResetBtn = () => {
                    const resetBtn = rootElement.querySelector('#sf-cl-reset-btn');
                    if (!resetBtn) return;
                    const hasValue = [...rootElement.querySelectorAll('.sf-cl-filter-input')]
                        .some(i => i.value.trim() !== '');
                    resetBtn.disabled = !hasValue;
                };

                renderRows(allItems);

                // --- Filter: apply (local, no re-fetch) ---
                const applyFilters = () => {
                    const filters = [];
                    rootElement.querySelectorAll('.sf-cl-filter-input').forEach(input => {
                        const col = input.dataset.col;
                        const val = input.value.trim();
                        if (!val) return;
                        filters.push({ col, val: val.toLowerCase(), isDate: isDateCol(col) });
                    });

                    if (filters.length === 0) {
                        renderRows(allItems);
                        return;
                    }

                    const filtered = allItems.filter(item => {
                        return filters.every(({ col, val, isDate }) => {
                            const cellValue = item[col];
                            if (cellValue == null || cellValue === '') return false;
                            if (isDate) {
                                // Match date prefix (e.g. "2026-02-27")
                                return String(cellValue).includes(val);
                            }
                            return String(cellValue).toLowerCase().includes(val);
                        });
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

                // Reset button
                const resetBtn = rootElement.querySelector('#sf-cl-reset-btn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        rootElement.querySelectorAll('.sf-cl-filter-input').forEach(i => i.value = '');
                        resetBtn.disabled = true;
                        renderRows(allItems);
                    });
                }

                // Refresh
                rootElement.querySelector('#sf-cl-refresh-btn').addEventListener('click', () => {
                    this.renderContactList(rootElement, eventId, options);
                });

                // SF Connect / Disconnect buttons
                const sfConnectBtn = rootElement.querySelector('#sf-cl-connect-btn');
                const sfDisconnectBtn = rootElement.querySelector('#sf-cl-disconnect-btn');
                if (sfConnectBtn) {
                    sfConnectBtn.addEventListener('click', async () => {
                        await this._sfConnectPopup();
                        this.renderContactList(rootElement, eventId, options);
                    });
                }
                if (sfDisconnectBtn) {
                    sfDisconnectBtn.addEventListener('click', async () => {
                        await this._sfDisconnect();
                        this.renderContactList(rootElement, eventId, options);
                    });
                }

                // Batch Transfer
                rootElement.querySelector('#sf-cl-batch-btn').addEventListener('click', async () => {
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
                                            // cells offset: 0=checkbox, 1=dot, 2+=data columns
                                            const cell = row.cells[colIdx + 2];
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
                await fetch(`${instance.config.backendUrl}/api/logout`, { method: 'POST' });
            } catch { /* ignore */ }
            ['sf_session_token', 'sf_access_token', 'sf_instance_url', 'sf_connection_status', 'sf_user_info'].forEach(k => localStorage.removeItem(k));
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
                const pw = 520, ph = 660;
                const pl = Math.round((screen.width - pw) / 2);
                const pt = Math.round((screen.height - ph) / 2);
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

        static showBatchAlertModal(message, { title = 'Notice', okText = 'OK', color = '#2563eb' } = {}) {
            return new Promise((resolve) => {
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center;
                    justify-content: center; z-index: 10003;
                `;
                modal.innerHTML = `
                    <div style="background: var(--Window, white); border-radius: 12px; padding: 28px; width: 420px; max-width: 90vw; box-shadow: 0 20px 40px rgba(0,0,0,0.25);">
                        <h3 style="margin: 0 0 16px 0; font-size: 18px; color: var(--WindowText, #111827);">${this._escapeHtml(title)}</h3>
                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">${this._escapeHtml(message)}</p>
                        <div style="text-align: right;">
                            <button id="alert-ok-btn" style="
                                padding: 10px 32px; border: none; background: ${color}; color: white;
                                border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
                            ">${this._escapeHtml(okText)}</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                const cleanup = () => { if (modal.parentNode) modal.parentNode.removeChild(modal); resolve(); };
                modal.querySelector('#alert-ok-btn').addEventListener('click', cleanup);
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
