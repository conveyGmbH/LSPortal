// SALESFORCE LEAD LIBRARY

(function() {
    'use strict';

    // Standard Salesforce Lead fields - these are active by default
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
        'Description': { label: 'Description', required: false },
        'Industry': { label: 'Industry', required: false },
        'AnnualRevenue': { label: 'Annual Revenue', required: false },
        'NumberOfEmployees': { label: 'Number Of Employees', required: false },
        'LeadSource': { label: 'Lead Source', required: false },
        'Status': { label: 'Status', required: false },
        'Rating': { label: 'Rating', required: false }
    };

    // CSS INJECTION
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

        // Avoid duplicate injection
        if (!document.getElementById('salesforce-lead-lib-styles')) {
            document.head.appendChild(styleElement);
        }
    }

    // WINJS PROMISE COMPATIBILITY
    function toWinJSPromise(promise) {
        if (typeof WinJS !== 'undefined' && WinJS.Promise) {
            return new WinJS.Promise(function (complete, error) {
                promise.then(complete).catch(error);
            });
        }
        return promise;
    }

    // CONNECTION PERSISTENCE MANAGER    
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

                console.log('Connection saved to localStorage for org', orgId, ':', userInfo.display_name || userInfo.username);

                this.syncPendingModifications();

                return true;
            } catch (error) {
                console.error('Failed to save connection:', error);
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
                        console.log(`Found ${changesCount} pending lead modifications to sync`);
                    }
                }
            } catch (error) {
                console.error('Failed to sync pending modifications:', error);
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
                    console.log('Connection expired, clearing...');
                    this.clearConnection();
                    return null;
                }

                return connectionData;
            } catch (error) {
                console.error('Failed to load connection:', error);
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
                console.error('Failed to clear connection:', error);
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

    // LEAD EDITS MANAGER    
    class LeadEditsManager {
        constructor(options = {}) {
            this.MAX_LEADS = options.maxLeads || 30;
            this.STORAGE_PREFIX = 'lead_edits_';
            this.AUTO_CLEANUP_ON_SAVE = options.autoCleanup !== false;
        }

        saveEdits(eventId, edits) {
            if (!eventId) {
                console.error('Cannot save edits: eventId is required');
                return false;
            }

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
                console.log(`Saved ${data.editCount} edits for EventId: ${eventId}`);

                if (this.AUTO_CLEANUP_ON_SAVE) {
                    this.cleanup();
                }

                return true;
            } catch (error) {
                console.error(`Failed to save edits for ${eventId}:`, error);

                if (error.name === 'QuotaExceededError') {
                    console.warn('localStorage quota exceeded! Running cleanup...');
                    this.cleanup(true);

                    try {
                        localStorage.setItem(key, JSON.stringify(data));
                        console.log('Save successful after cleanup');
                        return true;
                    } catch (retryError) {
                        console.error('Save failed even after cleanup:', retryError);
                        return false;
                    }
                }

                return false;
            }
        }

        saveFieldEdit(eventId, fieldName, value) {
            if (!eventId || !fieldName) {
                console.error('eventId and fieldName are required');
                return false;
            }

            let edits = this.loadEdits(eventId) || {};
            edits[fieldName] = value;
            return this.saveEdits(eventId, edits);
        }

        loadEdits(eventId) {
            if (!eventId) {
                console.warn('Cannot load edits: eventId is required');
                return null;
            }

            const key = `${this.STORAGE_PREFIX}${eventId}`;
            const stored = localStorage.getItem(key);

            if (!stored) {
                console.log(`No edits found for EventId: ${eventId}`);
                return null;
            }

            try {
                const parsed = JSON.parse(stored);
                parsed.lastAccessed = new Date().toISOString();
                localStorage.setItem(key, JSON.stringify(parsed));

                console.log(`Loaded ${parsed.editCount || 0} edits for EventId: ${eventId}`);
                return parsed.data;
            } catch (error) {
                console.error(`Failed to parse edits for ${eventId}:`, error);
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
                console.error(`Failed to parse metadata for ${eventId}:`, error);
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
                        console.error(`Corrupted data in ${key}, will be removed`);
                        localStorage.removeItem(key);
                    }
                }
            }

            allLeads.sort((a, b) => a.lastAccessed - b.lastAccessed);

            const maxLeads = aggressive ? Math.floor(this.MAX_LEADS * 0.7) : this.MAX_LEADS;
            const toRemove = allLeads.length - maxLeads;

            if (toRemove > 0) {
                console.log(`Cleaning up ${toRemove} old leads (${aggressive ? 'aggressive' : 'normal'} mode)`);

                for (let i = 0; i < toRemove; i++) {
                    localStorage.removeItem(allLeads[i].key);
                    console.log(`Removed: ${allLeads[i].eventId} (last accessed: ${allLeads[i].lastAccessed.toLocaleString()})`);
                }

                return toRemove;
            } else {
                console.log(`No cleanup needed (${allLeads.length}/${maxLeads} leads)`);
                return 0;
            }
        }

    }

    // FIELD MAPPING SERVICE    
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

        /**
         * Check if a field should be active by default based on its type
         * Priority: DB config > Standard Salesforce (active) > API fields (inactive)
         * @param {string} fieldName - The field name
         * @returns {boolean} - Whether the field should be active by default
         */
        shouldFieldBeActiveByDefault(fieldName) {
            // __metadata is internal OData field - always inactive
            if (fieldName === '__metadata') {
                return false;
            }

            // Standard Salesforce Lead fields - active by default
            if (STANDARD_SALESFORCE_LEAD_FIELDS && STANDARD_SALESFORCE_LEAD_FIELDS[fieldName]) {
                return true;
            }

            // All other fields - inactive by default
            // User can activate any field they want to send to SF
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
                            let errorText = '';
                            try {
                                errorText = await response.text();
                                console.error('API Error Response Body:', errorText);
                                if (errorText.trim()) {
                                    errorData = JSON.parse(errorText);
                                }
                            } catch (parseError) {
                                console.warn('Could not parse error response as JSON:', parseError);
                                console.error('Raw error text:', errorText);
                            }
                            throw new Error(`HTTP ${response.status}: ${errorData.error?.message || errorData.message || response.statusText}`);
                        }

                        const text = await response.text();

                        if (!text.trim()) {
                            return { success: true };
                        }

                        try {
                            return JSON.parse(text);
                        } catch (parseError) {
                            console.warn('Response is not valid JSON:', text);
                            throw new Error(`Invalid JSON response: ${parseError.message}`);
                        }
                    } catch (error) {
                        console.error('API request error:', error);
                        throw error;
                    }
                }
            };
        }

        async initializeFields(leadData, eventId) {
            try {
                this.currentEventId = eventId;
                this._initializationPhase = 'loading_db';

                // Load DB configuration FIRST (if eventId is available)
                if (eventId) {
                    await this.loadFieldMappingsFromAPI(eventId);
                    this._dbConfigLoaded = true;
                }

                // Apply default rules for fields WITHOUT existing config
                this._initializationPhase = 'applying_defaults';

                if (leadData) {
                    Object.keys(leadData).forEach(fieldName => {
                        const existingConfig = this.getFieldConfig(fieldName);

                        if (existingConfig && existingConfig.active !== undefined) {
                            // Config exists in DB - keep it as is
                            console.log(`[Init] Field "${fieldName}": Using DB config (active=${existingConfig.active})`);
                        } else {
                            // No DB config - apply default rules based on field type
                            const shouldBeActive = this.shouldFieldBeActiveByDefault(fieldName);
                            this.setFieldConfigLocal(fieldName, { active: shouldBeActive });
                            console.log(`[Init] Field "${fieldName}": Applied default (active=${shouldBeActive})`);
                        }
                    });
                }

                // Mark initialization as complete
                this._initializationPhase = 'complete';
                console.log(`[Init] Initialization complete`);
                return true;

            } catch (error) {
                console.error('[Init] Field mapping initialization failed, falling back to local-only mode:', error);
                this._initializationPhase = 'applying_defaults';

                if (leadData) {
                    Object.keys(leadData).forEach(fieldName => {
                        const existingConfig = this.getFieldConfig(fieldName);
                        if (!existingConfig || existingConfig.active === undefined) {
                            // Apply default rules based on field type
                            const shouldBeActive = this.shouldFieldBeActiveByDefault(fieldName);
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
                active: config.active !== undefined ? config.active : true,
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

            if (!this.credentials) {
                console.warn('No credentials available for database access');
                return;
            }

            try {
                const endpoint = `LS_FieldMappings?$filter=EventId eq '${eventId}'&$format=json`;
                console.log(`API Endpoint: https://${this.serverName}/${this.apiName}/${endpoint}`);

                const data = await this.createApiService().request('GET', endpoint);

                if (!data) {
                    console.log('No data returned from API');
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

                            // Also sync customLabels from fieldConfig.config.fields[] customLabel property
                            // This ensures backwards compatibility and data consistency
                            if (this.fieldConfig?.config?.fields) {
                                for (const field of this.fieldConfig.config.fields) {
                                    if (field.customLabel && field.customLabel !== field.fieldName) {
                                        // If field has a custom label different from its name, ensure it's in customLabels
                                        if (!this.customLabels[field.fieldName]) {
                                            this.customLabels[field.fieldName] = field.customLabel;
                                        }
                                    }
                                }
                            }

                            if (parsedConfig.customFields && Array.isArray(parsedConfig.customFields)) {
                                this.customFields = parsedConfig.customFields;
                            }

                            // Log summary
                            const fieldsCount = this.fieldConfig?.config?.fields?.length || 0;
                            const labelsCount = Object.keys(this.customLabels || {}).length;
                            const customCount = this.customFields?.length || 0;
                            console.log(`Loaded from LS_FieldMappings: ${fieldsCount} field configs, ${labelsCount} custom labels, ${customCount} custom fields`)

                        } catch (parseError) {
                            console.error('Failed to parse ConfigData from database, using default config:', parseError);
                            console.log('Raw ConfigData:', configRecord.ConfigData?.substring(0, 500));
                        }
                    } else {
                        console.log('Configuration record found but no ConfigData');
                    }
                } else {
                    console.log('No existing field mappings found in database for this event');
                    console.log('API Response structure:', data);
                }

            } catch (error) {
                console.error('Failed to load field mappings from database, continuing with local config:', error);
                return false;
            }
        }

        async saveFieldMappingsToAPI(fieldName, operation = 'update') {
            if (!this.currentEventId) {
                console.warn('No event ID available for saving to database');
                return false;
            }

            if (!this.credentials) {
                console.warn('No credentials available for database save');
                return false;
            }

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

                console.log('Checking for existing configuration record...');
                const existingRecord = await this.findExistingRecord();

                let saveResponse;

                if (existingRecord) {
                    console.log(`Updating existing record with ID: ${existingRecord.FieldMappingsViewId}`);
                    saveResponse = await this.updateRecord(existingRecord.FieldMappingsViewId, configData);
                } else {
                    console.log('Creating new configuration record...');
                    saveResponse = await this.createRecord(configData);
                }

                if (saveResponse.success) {
                    if (fieldName !== 'bulk_save') {
                        this.showSaveIndicator(fieldName, 'success');
                    }
                    console.log('Field mappings saved to database successfully');
                    return true;
                } else {
                    throw new Error(saveResponse.error || 'Database save operation failed');
                }

            } catch (error) {
                console.error('Failed to save field mappings to database:', error);
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
                console.error('Error finding existing record:', error);
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
                    console.log('Record created successfully:', result);
                    return { success: true, data: result };
                } else {
                    return { success: false, error: 'POST request failed' };
                }

            } catch (error) {
                console.error('Error creating record:', error);
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
                    console.log('Record updated via delete-recreate strategy');
                    return { success: true };
                } else {
                    throw new Error('Failed to recreate record');
                }

            } catch (error) {
                try {
                    const payload = { ConfigData: JSON.stringify(configData) };
                    const result = await this.createApiService().request('PUT', `LS_FieldMappings(${recordId})`, payload);

                    if (result) {
                        console.log('Record updated via PUT fallback');
                        return { success: true };
                    }
                } catch (putError) {
                    console.error('PUT fallback also failed:', putError);
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
                    console.log('Event ID recovered from session storage:', sessionEventId);
                }
            }
            return this.currentEventId;
        }

        setCurrentEventId(eventId) {
            this.currentEventId = eventId;
            console.log('Event ID set to:', eventId);
        }

        loadConfig() {
            // Always start with empty config - real config comes from DB via loadFieldMappingsFromAPI()
            // localStorage is no longer used for field config to avoid stale data
            return {
                apiEndpoint: "LeadSuccess_Event_API",
                eventId: null,
                config: { fields: [] }
            };
        }

        loadCustomLabels() {
            // Custom labels come from DB via loadFieldMappingsFromAPI()
            return {};
        }

        saveConfig() {
            // Config is saved to DB via saveFieldMappingsToAPI()
            // localStorage is no longer used to avoid sync issues
            console.log('Config will be saved to DB (not localStorage)');
        }

        saveCustomLabels() {
            // Custom labels are saved to DB via saveFieldMappingsToAPI()
            console.log('Custom labels will be saved to DB (not localStorage)');
        }

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
                active: config.active !== undefined ? config.active : true,
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
                        const success = await this.saveFieldMappingsToAPI(fieldName, 'toggle');
                        if (success) {
                            console.log(`Field config for ${fieldName} saved to database successfully`);
                        } else {
                            console.warn(`Failed to save field config for ${fieldName} to database`);
                        }
                    } catch (error) {
                        console.error(`Error saving field config for ${fieldName} to database:`, error);
                    }
                }
            } else {
                console.log(`Skipping database save for ${fieldName} - loading from backend`);
            }

            this.saveConfig();

            this.syncWithBackend().catch(error => {
                console.error('Background sync failed (non-critical):', error);
            });
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
                    active: fieldConfig ? fieldConfig.active !== false : true
                };
            }

            return result;
        }


        isFieldActive(fieldName) {
            const config = this.getFieldConfig(fieldName);
            return config ? config.active !== false : true;
        }


        loadCustomFieldNames() {
            try {
                const saved = localStorage.getItem('fieldMappingCustomNames');
                if (saved) {
                    this.customFieldNames = JSON.parse(saved);
                    console.log('Loaded custom field names:', this.customFieldNames);
                }
            } catch (error) {
                console.error('Failed to load custom field names:', error);
                this.customFieldNames = {};
            }
        }


        // saveActiveFieldsToBackend() 
        async syncWithBackend() {
            if (this._isLoadingFromBackend) {
                return;
            }

            if (this._isTransferInProgress) {
                console.log('Skipping sync - transfer in progress');
                return;
            }

            if (this.syncTimeout) {
                clearTimeout(this.syncTimeout);
            }

            this.syncTimeout = setTimeout(() => {
                try {
                    console.log('Saving configuration locally...');
                    this.saveConfig();
                    console.log('Local save completed');
                } catch (error) {
                    console.error('Failed to save locally:', error);
                }
            }, 1000);
        }

        setTransferMode(isActive) {
            this._isTransferInProgress = isActive;
            console.log(`${isActive ? 'LOCKED' : 'UNLOCKED'} Transfer mode: ${isActive ? 'ENABLED' : 'DISABLED'}`);
        }

        loadCustomFields() {
            // Custom fields are now loaded from DB via loadFieldMappingsFromAPI()
            if (!this.customFields) {
                this.customFields = [];
            }
            console.log(`Custom fields initialized: ${this.customFields.length} fields`);
        }

        saveCustomFields() {
            // Custom fields are now saved to DB via saveFieldMappingsToAPI()
            console.log(`Custom fields will be saved to DB: ${(this.customFields || []).length} fields`);
        }

        async addCustomField(fieldData) {
            const newField = {
                id: `custom_${Date.now()}`,
                label: fieldData.label || '',
                sfFieldName: fieldData.sfFieldName || '',
                value: fieldData.value || '',
                active: fieldData.active !== false,
                isCustom: true,
                createdAt: new Date().toISOString(),
                createdBy: 'user'
            };

            this.customFields.push(newField);
            this.saveCustomFields();

            if (this.currentEventId) {
                await this.saveFieldMappingsToAPI('custom_field_add', 'custom_field');
            }

            console.log('Custom field added:', newField);
            return newField;
        }

    }

    // MODAL FUNCTIONS
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
        countdownSpan.textContent = `Auto-closing in ${secondsLeft}s...`;

        const countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) {
                countdownSpan.textContent = `Auto-closing in ${secondsLeft}s...`;
            } else {
                clearInterval(countdownInterval);
                console.log('Success modal auto-closing after 15 seconds');
                modal.remove();
            }
        }, 1000);

        console.log('Success modal created with 15 second timer');

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
                        <p style="font-size: 12px; color: var(--WindowText, #6b7280); margin-top: 8px;">You must first verify the exact field name in Salesforce and enter it here without spaces.</p>
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

            closeXBtn.addEventListener('click', () => closeDialog(null));
            cancelBtn.addEventListener('click', () => closeDialog(null));
            saveBtn.addEventListener('click', () => {
                const fieldName = nameInput.value.trim();
                const fieldValue = valueInput.value.trim();
                if (fieldName) {
                    closeDialog({ fieldName, fieldValue });
                }
            });

            // Save on Enter key in name input
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const fieldName = nameInput.value.trim();
                    const fieldValue = valueInput.value.trim();
                    if (fieldName) {
                        closeDialog({ fieldName, fieldValue });
                    }
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

                const activeFields = this._collectActiveFieldsOnly(leadData);

                if (!activeFields || Object.keys(activeFields).length === 0) {
                    throw new Error('No active fields with values to transfer');
                }

                        const hasLastName = activeFields.LastName && activeFields.LastName.trim() !== '';
                const hasCompany = activeFields.Company && activeFields.Company.trim() !== '';

                if (!hasLastName && !hasCompany) {
                    throw new Error('Both Last Name and Company are required fields.');
                }

                const modal = showTransferLoadingModal('Transferring lead to Salesforce...');

                const response = await this._transferToSalesforce(activeFields);

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
                            showSuccessModal('Transfer Successful', result.message || 'Lead transferred successfully!');
                        })
                        .catch(error => {
                            showErrorModal('Transfer Failed', error.message);
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
        _collectActiveFieldsOnly(leadData) {
            const salesforceData = {};
            const excludedFields = new Set(['__metadata']);
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
                return salesforceData;
            }

            const activeFieldsMap = new Map();
            for (const configField of fieldConfigArray) {
                if (configField.active !== false) {
                    activeFieldsMap.set(configField.fieldName, configField);
                }
            }

            const customFields = this.fieldMappingService.customFields || [];
            for (const customField of customFields) {
                if (customField.active !== false && customField.sfFieldName) {
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

                salesforceData[sfFieldName] = typeof value === 'string' ? value.trim() : value;
            }

            console.log('_collectActiveFieldsOnly - Final payload fields:', Object.keys(salesforceData));
            return salesforceData;
        }

        async _transferToSalesforce(leadData) {
            const apiUrl = `${this.config.backendUrl}/api/salesforce/leads`;
            const orgId = localStorage.getItem('orgId') || 'default';

            const payload = {
                leadData: leadData,
                attachments: [],
                leadId: this.currentLeadData?.KontaktViewId || this.currentLeadData?.Id
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
                    <div class="contenthost-background" style="display: flex; flex-direction: column; height: 100%;">
                        <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                            <header class="sf-header" style="padding: 16px 24px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
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

                            <main style="flex: 1; overflow-y: auto; padding: 16px;">
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
                    await instance.fieldMappingService.initializeFields({}, effectiveEventId);

                    if (localStorageOnlyMode) {
                        const infoBox = rootElement.querySelector('#virtual-mode-info');
                        if (infoBox) {
                            infoBox.style.display = 'block';
                        }
                    }

                    this._renderFieldsGrid(rootElement, instance.fieldMappingService, 'active');
                    this._attachFieldConfiguratorListeners(rootElement, instance.fieldMappingService);
                    this._loadApiFieldsInBackground(rootElement, instance.fieldMappingService);

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
         * Load API fields in background and re-render grid if fields are found
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
                    console.log(`[Background Load] Applying default rules for ${Object.keys(apiFields).length} API fields`);

                    for (const fieldName in apiFields) {
                        const existingConfig = fieldMappingService.getFieldConfig(fieldName);

                        if (!existingConfig || existingConfig.active === undefined) {
                            const shouldBeActive = fieldMappingService.shouldFieldBeActiveByDefault(fieldName);
                            fieldMappingService.setFieldConfigLocal(fieldName, { active: shouldBeActive });
                            console.log(`[Background Load] Field "${fieldName}": Applied default (active=${shouldBeActive})`);
                        } else {
                            console.log(`[Background Load] Field "${fieldName}": Keeping existing config (active=${existingConfig.active})`);
                        }
                    }

                    const currentFilter = rootElement._currentFilter || 'active';
                    this._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);
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

                    let isActive;
                    if (config) {
                        isActive = config.active !== false;
                    } else {
                        isActive = isStandardSalesforce;
                    }

                    allFields.push({
                        name: fieldName,                          
                        label: customLabel || defaultLabel,       
                        defaultLabel: defaultLabel,               
                        hasCustomLabel: !!customLabel,            
                        customLabel: customLabel || null,         
                        active: isActive,
                        required: sfInfo ? sfInfo.required : false,
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

                        let isActive = config ? config.active !== false : true;

                        allFields.push({
                            name: fieldName,
                            label: customLabel || defaultLabel,
                            defaultLabel: defaultLabel,
                            hasCustomLabel: !!customLabel,
                            customLabel: customLabel || null,
                            active: isActive,
                            required: sfInfo.required || false,
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
                    active: cf.active !== false,
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
                            ` : !isRequired ? `
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

            // Note: Checkbox, delete, edit, and custom field value listeners
            // are now attached inline in _renderFieldsGrid via _attachInlineListeners

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

            if (!fieldName) {
                SalesforceLeadLib._showToast('Please enter a field name', 'error');
                return;
            }

            // Validate Salesforce field name format
            if (!fieldName.match(/^[a-zA-Z][a-zA-Z0-9_]*(__c)?$/)) {
                SalesforceLeadLib._showToast('Invalid field name. Must start with a letter, contain only letters, numbers, and underscores. Custom fields should end with __c', 'error');
                return;
            }

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

                    // Standard Salesforce fields are active by default, others are inactive
                    let isActive;
                    if (config) {
                        isActive = config.active !== false;
                    } else {
                        isActive = isStandardSalesforce;
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

                    // Standard Salesforce fields are active by default
                    let isActive = config ? config.active !== false : true;

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
                    active: cf.active !== false,
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
                console.log('CRM Export - Loading config for eventId:', eventId);

                // Load from LS_FieldMappings database
                const configData = await this._loadFieldConfigFromAPI(eventId);
                console.log('CRM Export - Config data loaded:', configData);

                const fieldConfig = configData?.fieldConfig || null;
                const customFields = configData?.customFields || [];
                const customLabels = configData?.customLabels || {};

                // Sync customLabels to instance so transfer can access them
                const instance = this._getInstance();
                if (instance) {
                    instance.fieldMappingService.customLabels = customLabels;
                }

                console.log('CRM Export - fieldConfig:', fieldConfig);
                console.log('CRM Export - fieldConfig.config.fields count:', fieldConfig?.config?.fields?.length || 0);
                console.log('CRM Export - customFields count:', customFields.length);

                const allFields = this._buildActiveFieldsList(leadData, fieldConfig, customFields, customLabels);
                console.log('CRM Export - Active fields count:', allFields.length);

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

            console.log('_buildActiveFieldsList - fieldConfig structure:', fieldConfig);
            console.log('_buildActiveFieldsList - fieldConfigArray length:', fieldConfigArray.length);
            console.log('_buildActiveFieldsList - hasFieldConfig:', hasFieldConfig);

            // Helper function to check if field is active (same logic as _renderFieldsGrid)
            const isFieldActive = (fieldName, configField) => {
                const isStandardSalesforce = standardSalesforceFields.hasOwnProperty(fieldName);

                if (configField) {
                    // If config exists, use config.active !== false (same as _renderFieldsGrid line 4007)
                    return configField.active !== false;
                } else {
                    // If no config, standard Salesforce fields are active by default (same as _renderFieldsGrid line 4010)
                    return isStandardSalesforce;
                }
            };

            if (hasFieldConfig) {
                // Count truly active fields for logging
                const activeFieldsInConfig = fieldConfigArray.filter(f => isFieldActive(f.fieldName, f));
                console.log('_buildActiveFieldsList - Active fields in config:', activeFieldsInConfig.map(f => f.fieldName));

                // Use field config from database - includes ALL configured fields
                fieldConfigArray.forEach(configField => {
                    const fieldName = configField.fieldName;
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
                        console.log(`_buildActiveFieldsList - Added required field: ${reqFieldName}`);
                    }
                });
            } else {
                // No config saved yet - use all standard Salesforce fields as active by default
                for (const fieldName in standardSalesforceFields) {
                    const sfInfo = standardSalesforceFields[fieldName];
                    const customLabel = customLabels[fieldName];
                    allFields.push({
                        name: fieldName,
                        label: customLabel || sfInfo.label,
                        value: leadData[fieldName] || '',
                        required: sfInfo.required || false,
                        isCustomField: false
                    });
                    addedFieldNames.add(fieldName);
                }
            }

            // Add custom fields (only active ones)
            customFields.forEach(cf => {
                if (cf.active !== false) {
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

        /**
         * Escape HTML to prevent XSS and display issues
         * @private
         */
        static _escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * Build CRM Export HTML interface
         * @param {Object} leadData - Lead data object
         * @param {Array} allFields - Array of field objects
         * @param {string} contactId - Contact ID
         * @param {Object} options - Additional options
         * @param {boolean} options.isTestMode - If true, render editable inputs for values
         * @param {string} options.eventId - Event ID for localStorage (test mode)
         * @private
         */
        static _buildCrmExportHTML(leadData, allFields, contactId, options = {}) {
            const isTestMode = options.isTestMode || false;
            const eventId = options.eventId || null;

            // Check if this contact was already exported
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
                    <!-- Export Status Banner (if already exported) -->
                    ${exportInfo}

                    <!-- Header with Connection Status -->
                    <div class="sf-export-card" style="border-radius: 8px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
                        <div style="flex: 1; min-width: 250px;">
                            <h1 class="text-textcolor" style="font-size: 24px; font-weight: bold; margin: 0;" data-win-res="{textContent: 'sforce.title'}">
                                Transfer Lead to Salesforce
                            </h1>
                        </div>
                        <div style="display: flex; align-items: stretch; gap: 12px; flex-wrap: wrap;">
                            <!-- API Status indicator -->
                            <div id="api-status-user-card" style="display: flex; align-items: center; gap: 10px; padding: 0 14px; height: 40px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
                                <div id="api-status-indicator" style="width: 10px; height: 10px; background: #fbbf24; border-radius: 50%;"></div>
                                <span id="api-status-text" style="font-size: 13px; font-weight: 500; color: #92400e;" data-win-res="{textContent: 'sforce.statusDisconnected'}">Disconnected</span>
                                <!-- User Profile (hidden when disconnected) -->
                                <div id="user-profile-section" style="display: none; align-items: center; gap: 8px; margin-left: 8px; padding-left: 12px; border-left: 1px solid #fcd34d;">
                                    <div id="user-avatar-header" style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: bold; font-size: 10px;">
                                        MK
                                    </div>
                                    <span id="user-name-header" class="text-textcolor" style="font-size: 13px; font-weight: 500;">
                                        Maxim Kemajou
                                    </span>
                                </div>
                            </div>

                            <!-- Disconnect Button (hidden initially) -->
                            <button id="disconnect-sf-btn" style="display: none; padding: 0 16px; height: 40px; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 500; border: 1px solid #fecaca; border-radius: 8px; cursor: pointer; align-items: center; gap: 8px; transition: background-color 0.2s;">
                                <i class="fa-solid fa-right-from-bracket"></i> <span data-win-res="{textContent: 'sforce.btnDisconnect'}">Disconnect</span>
                            </button>

                            <!-- Connect Button -->
                            <button id="sf-connect-btn" class="accent-background-color" style="display: flex; padding: 0 18px; height: 40px; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;">
                                <i class="fa-solid fa-plug"></i> <span data-win-res="{textContent: 'sforce.btnConnect'}">Connect to Salesforce</span>
                            </button>

                            <!-- Transfer to Salesforce Button (in header) -->
                            <button id="transferToSalesforceBtnHeader" class="transferToSalesforceBtn" style="display: none; padding: 0 18px; height: 40px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;">
                                <i class="fa-solid fa-paper-plane"></i> <span data-win-res="{textContent: 'sforce.btnTransfer'}">Transfer to Salesforce</span>
                            </button>
                        </div>
                    </div>

                    <!-- Lead Information Card -->
                    <div class="sf-export-card" style="border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px;">
                            <div style="flex: 1; min-width: 200px;">
                                <h2 class="text-textcolor" style="font-size: 18px; font-weight: 600; margin: 0 0 4px 0;" data-win-res="{textContent: 'sforce.leadInformation'}">
                                    Lead Information
                                </h2>
                                <div class="label-color" style="font-size: 13px;">
                                    <span data-win-res="{textContent: 'sforce.sourceLeadReport'}">Source: Lead Report</span>
                                    <span style="margin: 0 8px;">•</span>
                                    <span>ID: ${this._escapeHtml(contactId).substring(0, 8)}...</span>
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

                        <!-- Table View -->
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

                        <!-- Cards View (hidden by default) -->
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

                    <!-- Action Buttons -->
                    <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end;">
                        <button id="cancel" class="cancelExportBtn sf-btn-secondary text-textcolor" style="padding: 10px 24px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;" data-win-res="{textContent: 'sforce.btnCancel'}">
                            Cancel
                        </button>
                    </div>

                    <!-- Status Message -->
                    <div id="exportStatusMessage" style="margin-top: 16px; padding: 12px; border-radius: 8px; display: none;"></div>
                </div>
            `;
        }

        /**
         * Attach event listeners for CRM Export UI
         * @param {HTMLElement} rootElement - Container element
         * @param {Object} leadData - Lead data object
         * @param {Array} allFields - Array of field objects
         * @param {Object} options - Additional options
         * @param {boolean} options.isTestMode - If true, attach listeners for editable inputs
         * @param {string} options.eventId - Event ID for localStorage (test mode)
         * @private
         */
        static _attachCrmExportListeners(rootElement, leadData, allFields, options = {}) {
            const isTestMode = options.isTestMode || false;
            const eventId = options.eventId || null;

            const transferBtns = rootElement.querySelectorAll('.transferToSalesforceBtn');
            const cancelBtn = rootElement.querySelector('.cancelExportBtn');
            const statusMessage = rootElement.querySelector('#exportStatusMessage');

            // In test mode, attach listeners to editable inputs to save to localStorage
            if (isTestMode && eventId) {
                const testInputs = rootElement.querySelectorAll('.test-field-input');
                testInputs.forEach(input => {
                    // Save on input change (debounced)
                    let saveTimeout = null;
                    input.addEventListener('input', (e) => {
                        const fieldName = e.target.dataset.fieldName;
                        const value = e.target.value;

                        // Update leadData._fakeData for transfer
                        if (leadData._fakeData) {
                            leadData._fakeData[fieldName] = value;
                        }

                        // Update allFields for consistency
                        const fieldObj = allFields.find(f => f.name === fieldName);
                        if (fieldObj) {
                            fieldObj.value = value;
                            fieldObj.transferValue = value;
                        }

                        // Debounce localStorage save
                        if (saveTimeout) clearTimeout(saveTimeout);
                        saveTimeout = setTimeout(() => {
                            this._saveTestFieldValue(eventId, fieldName, value);
                        }, 300);
                    });

                    // Also sync between list and cards view inputs
                    input.addEventListener('change', (e) => {
                        const fieldName = e.target.dataset.fieldName;
                        const value = e.target.value;

                        // Update all inputs with the same field name
                        const allInputsForField = rootElement.querySelectorAll(`.test-field-input[data-field-name="${fieldName}"]`);
                        allInputsForField.forEach(inp => {
                            if (inp !== e.target) {
                                inp.value = value;
                            }
                        });
                    });
                });
            }

            // List/Cards view toggle
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

            // Clear export status button (if exists)
            const clearExportBtn = rootElement.querySelector('#clear-export-status-btn');
            if (clearExportBtn) {
                clearExportBtn.addEventListener('click', () => {
                    const contactId = leadData.KontaktViewId || leadData.ContactId || leadData.KontaktVIEWID;
                    if (contactId) {
                        this.clearExportStatus(contactId);
                        // Remove the banner
                        const banner = rootElement.querySelector('#export-status-banner');
                        if (banner) {
                            banner.remove();
                        }
                        this._showToast('Export status cleared. You can now re-export this contact.', 'success');
                    }
                });
            }

            // Salesforce Connection and Disconnect buttons
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

            // Check initial connection status
            if (connectBtn) {
                this._checkInitialConnectionStatus(rootElement);
            }

            // Attach transfer handler to all transfer buttons (bottom and header)
            transferBtns.forEach(btn => {
                btn.addEventListener('click', async (event) => {
                    const clickedBtn = event.currentTarget;

                    // Check if connected to Salesforce first
                    const connectBtn = rootElement.querySelector('#sf-connect-btn');
                    if (connectBtn && connectBtn.style.display !== 'none') {
                        this._showToast('Please connect to Salesforce first', 'error');
                        return;
                    }

                    // Disable all transfer buttons during transfer
                    transferBtns.forEach(b => b.disabled = true);
                    const originalText = clickedBtn.innerHTML;
                    clickedBtn.innerHTML = '<span style="display: inline-block; width: 14px; height: 14px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px;"></span>Transferring...';
                    clickedBtn.style.opacity = '0.8';

                    try {
                        // Get instance
                        const instance = this._getInstance();
                        if (!instance) {
                            throw new Error('SalesforceLeadLib instance not found');
                        }

                        // Prepare lead data for transfer
                        const transferData = {};

                        if (!allFields || allFields.length === 0) {
                            throw new Error('No field data available for transfer');
                        }

                        // Check if we're in test mode (leadData has _isTestMode flag)
                        const isTestMode = leadData && leadData._isTestMode === true;
                        const fakeData = isTestMode ? (leadData._fakeData || {}) : null;

                        if (isTestMode) {
                            console.log('[Test Mode] Using fake data for transfer');
                        }

                        allFields.forEach(field => {
                            if (field && field.name) {
                                let sfFieldName = field.name;
                                if (!isStandardSalesforceField(field.name)) {
                                    // Use custom label as SF field name if mapped
                                    const customLabel = instance.fieldMappingService?.customLabels?.[field.name];
                                    if (customLabel) sfFieldName = customLabel;
                                    if (!sfFieldName.endsWith('__c')) {
                                        sfFieldName = sfFieldName + '__c';
                                    }
                                }

                                // In test mode, use fake data; otherwise use actual field value
                                if (isTestMode && fakeData && fakeData[field.name] !== undefined) {
                                    transferData[sfFieldName] = fakeData[field.name];
                                } else if (field.transferValue !== undefined) {
                                    // Use transferValue if set (for test mode fields)
                                    transferData[sfFieldName] = field.transferValue;
                                } else {
                                    // Use actual value (normal mode)
                                    transferData[sfFieldName] = field.value || '';
                                }
                            }
                        });

                        // Convert numeric fields to proper types (Salesforce requires numbers, not strings)
                        const numericFields = ['AnnualRevenue', 'NumberOfEmployees'];
                        numericFields.forEach(fieldName => {
                            if (transferData.hasOwnProperty(fieldName)) {
                                const value = transferData[fieldName];
                                if (value !== null && value !== undefined && value !== '') {
                                    const numValue = Number(value);
                                    if (!isNaN(numValue)) {
                                        transferData[fieldName] = numValue;
                                        console.log(`[Transfer] Converted ${fieldName} to number: ${value} → ${numValue}`);
                                    } else {
                                        // Invalid number - remove field to prevent Salesforce error
                                        delete transferData[fieldName];
                                        console.warn(`[Transfer] Removed invalid numeric value for ${fieldName}: ${value}`);
                                    }
                                } else {
                                    // Empty value - remove field
                                    delete transferData[fieldName];
                                }
                            }
                        });

                        console.log('[Transfer] Final transfer data:', transferData);

                        // Call transfer API
                        const backendUrl = instance.config.backendUrl;
                        const orgId = localStorage.getItem('orgId') || 'default';

                        // Prepare payload in the format expected by backend
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

                        // Try to parse JSON response
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
                            // Response is not JSON
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

                                // Build detailed error message from response
                                let errorMessage = responseData.message || 'A validation error occurred.';

                                // Check for nested data object with errors array (Salesforce API response format)
                                if (responseData.data) {
                                    if (responseData.data.errors && Array.isArray(responseData.data.errors)) {
                                        const errorsList = responseData.data.errors.join('\n• ');
                                        errorMessage = `${responseData.data.message || responseData.message || 'Validation failed'}\n\n• ${errorsList}`;
                                    } else if (responseData.data.message) {
                                        errorMessage = responseData.data.message;
                                    }
                                }

                                // Also check for errors array at root level
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

                            // Handle 500 errors (server errors)
                            if (response.status === 500) {
                                let errorDetails = responseData.message || responseData.error || 'Internal server error';

                                // Check for nested data object with errors
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

                            // Handle 409 Conflict errors (duplicate leads)
                            if (response.status === 409) {
                                let errorMessage = responseData.message || 'Duplicate lead found';

                                // Check for existing lead details
                                if (responseData.data && responseData.data.existingLead) {
                                    const existing = responseData.data.existingLead;
                                    errorMessage = `${responseData.data.message || responseData.message || 'Duplicate lead found'}\n\n`;
                                    errorMessage += `Existing Lead in Salesforce:\n`;
                                    if (existing.name) errorMessage += `• Name: ${existing.name}\n`;
                                    if (existing.company) errorMessage += `• Company: ${existing.company}\n`;
                                    if (existing.email) errorMessage += `• Email: ${existing.email}\n`;
                                    if (existing.salesforceId) errorMessage += `• Salesforce ID: ${existing.salesforceId}`;
                                }

                                showErrorModal('Duplicate Lead', errorMessage);

                                transferBtns.forEach(b => b.disabled = false);
                                clickedBtn.innerHTML = originalText;
                                clickedBtn.style.opacity = '1';
                                return;
                            }

                            // Handle other errors
                            throw new Error(responseData.message || responseData.data?.message || `Transfer failed with status ${response.status}`);
                        }

                        // Success! Update all transfer buttons
                        transferBtns.forEach(b => {
                            b.innerHTML = '✓ Transferred';
                            b.style.background = '#059669';
                            b.style.opacity = '1';
                        });

                        // Save export status for tracking
                        const salesforceId = responseData.salesforceId || responseData.id || 'Unknown';
                        const contactId = leadData.KontaktViewId || leadData.ContactId || leadData.KontaktVIEWID;
                        if (contactId) {
                            this._saveExportStatus(contactId, salesforceId);
                        }

                        // Show success modal
                        showSuccessModal(
                            'Lead Transferred Successfully!',
                            `The lead has been successfully transferred to Salesforce.\n\nSalesforce ID: ${salesforceId}`
                        );

                    } catch (error) {
                        console.error('Transfer error:', error);

                        // Reset all buttons
                        transferBtns.forEach(b => b.disabled = false);
                        clickedBtn.innerHTML = originalText;
                        clickedBtn.style.opacity = '1';

                        // Show error modal
                        showErrorModal('Transfer Error', error.message || 'An unexpected error occurred during transfer.');
                    }
                });
            });

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    console.log('Export cancelled');
                    // Navigate back if possible
                    if (WinJS && WinJS.Navigation && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                });
            }
        }

        /**
         * Check initial Salesforce connection status on page load
         * @private
         */
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
                // Update UI to checking
                if (indicator) indicator.style.background = '#fbbf24'; // Yellow
                if (statusText) statusText.textContent = 'Checking...';

                // Get or create instance
                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                // Check authentication status
                const authStatus = await instance._checkAuthenticationStatus();

                if (authStatus && authStatus.success) {
                    const userInfo = authStatus.userInfo || {};
                    const displayName = userInfo.display_name || userInfo.username || 'Unknown user';
                    const orgName = userInfo.organization_name || userInfo.orgName || 'Unknown org';

                    // Update UI to connected
                    if (statusCard) {
                        statusCard.style.background = '#dcfce7';
                        statusCard.style.borderColor = '#86efac';
                    }
                    if (indicator) indicator.style.background = '#10b981'; // Green
                    if (statusText) {
                        statusText.textContent = 'Connected';
                        statusText.style.color = '#16a34a';
                    }

                    // Show user profile section
                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    // Generate initials for avatar
                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    // Toggle buttons
                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) disconnectBtn.style.display = 'flex';

                    // Show Transfer button in header when connected
                    const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                    if (transferBtnHeader) transferBtnHeader.style.display = 'flex';

                    console.log('Already connected to Salesforce:', orgName);
                } else {
                    // Update UI to disconnected
                    if (statusCard) {
                        statusCard.style.background = '#fef3c7';
                        statusCard.style.borderColor = '#fcd34d';
                    }
                    if (indicator) indicator.style.background = '#fbbf24';
                    if (statusText) {
                        statusText.textContent = 'Disconnected';
                        statusText.style.color = '#f59e0b';
                    }
                    if (userSection) userSection.style.display = 'none';
                    if (connectBtn) connectBtn.style.display = 'flex';
                    if (disconnectBtn) disconnectBtn.style.display = 'none';

                    // Hide Transfer button in header when disconnected
                    const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                    if (transferBtnHeader) transferBtnHeader.style.display = 'none';
                }

            } catch (error) {
                console.error('Failed to check connection status:', error);

                // Update UI to disconnected on error
                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = 'Disconnected';
                    statusText.style.color = '#f59e0b';
                }
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) disconnectBtn.style.display = 'none';

                // Hide Transfer button in header on error
                const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                if (transferBtnHeader) transferBtnHeader.style.display = 'none';
            }
        }

        /**
         * Handle Salesforce disconnect in CRM Export
         * @private
         */
        static async _handleSalesforceDisconnect(rootElement) {
            console.log('Salesforce Disconnect clicked in CRM Export');

            const statusCard = rootElement.querySelector('#api-status-user-card');
            const indicator = rootElement.querySelector('#api-status-indicator');
            const statusText = rootElement.querySelector('#api-status-text');
            const userSection = rootElement.querySelector('#user-profile-section');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#disconnect-sf-btn');

            try {
                // Update UI to disconnecting
                if (indicator) indicator.style.background = '#fbbf24'; // Yellow
                if (statusText) statusText.textContent = 'Disconnecting...';
                if (disconnectBtn) disconnectBtn.disabled = true;

                // Get or create instance
                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                // Call disconnect
                await instance.disconnect();

                // Update UI to disconnected state
                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = 'Disconnected';
                    statusText.style.color = '#f59e0b';
                }
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) {
                    disconnectBtn.style.display = 'none';
                    disconnectBtn.disabled = false;
                }

                // Hide Transfer button in header when disconnected
                const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                if (transferBtnHeader) transferBtnHeader.style.display = 'none';

                this._showToast('Disconnected from Salesforce successfully', 'success');

            } catch (error) {
                console.error('Disconnect error:', error);

                // Reset UI to disconnected on error
                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = 'Disconnected';
                    statusText.style.color = '#f59e0b';
                }
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) {
                    disconnectBtn.style.display = 'none';
                    disconnectBtn.disabled = false;
                }

                // Hide Transfer button in header on error
                const transferBtnHeaderErr = rootElement.querySelector('#transferToSalesforceBtnHeader');
                if (transferBtnHeaderErr) transferBtnHeaderErr.style.display = 'none';

                this._showToast('Disconnection failed: ' + (error.message || 'Unknown error'), 'error');
            }
        }

        /**
         * Handle Salesforce connection in CRM Export
         * @private
         */
        static async _handleSalesforceConnect(rootElement) {
            console.log('Salesforce Connect clicked in CRM Export');

            const statusCard = rootElement.querySelector('#api-status-user-card');
            const indicator = rootElement.querySelector('#api-status-indicator');
            const statusText = rootElement.querySelector('#api-status-text');
            const userSection = rootElement.querySelector('#user-profile-section');
            const userAvatar = rootElement.querySelector('#user-avatar-header');
            const userName = rootElement.querySelector('#user-name-header');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#disconnect-sf-btn');

            // Connect to Salesforce
            try {
                // Update UI to connecting
                if (indicator) indicator.style.background = '#fbbf24'; // Yellow
                if (statusText) statusText.textContent = 'Connecting...';
                if (connectBtn) connectBtn.disabled = true;

                // Get or create instance
                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                // Call connect (opens OAuth popup)
                const authStatus = await instance.connect();

                if (authStatus && authStatus.success) {
                    const userInfo = authStatus.userInfo || {};
                    const orgName = userInfo.organization_name || userInfo.orgName || 'Salesforce';
                    const displayName = userInfo.display_name || userInfo.username || 'Unknown user';

                    // Save auth info to localStorage for persistence across page loads and client changes
                    localStorage.setItem('sf_user_info', JSON.stringify(userInfo));
                    // Mark that we have a valid connection (even if we don't have actual tokens in Portal context)
                    localStorage.setItem('sf_connected', 'true');
                    localStorage.setItem('sf_connected_at', new Date().toISOString());

                    // Update UI to connected state
                    if (statusCard) {
                        statusCard.style.background = '#dcfce7';
                        statusCard.style.borderColor = '#86efac';
                    }
                    if (indicator) indicator.style.background = '#10b981'; // Green
                    if (statusText) {
                        statusText.textContent = 'Connected';
                        statusText.style.color = '#16a34a';
                    }

                    // Show user profile section
                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    // Generate initials for avatar
                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    // Toggle buttons
                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) {
                        disconnectBtn.style.display = 'flex';
                        disconnectBtn.disabled = false;
                    }

                    // Show Transfer button in header when connected
                    const transferBtnHeader = rootElement.querySelector('#transferToSalesforceBtnHeader');
                    if (transferBtnHeader) transferBtnHeader.style.display = 'flex';

                    // Show success message
                    this._showToast(`Connected to ${orgName} as ${displayName}`, 'success');

                } else {
                    throw new Error('Authentication failed');
                }

            } catch (error) {
                console.error('Connection error:', error);

                // Reset UI to disconnected on error
                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = 'Connection Failed';
                    statusText.style.color = '#f59e0b';
                }
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) {
                    connectBtn.style.display = 'flex';
                    connectBtn.disabled = false;
                }
                if (disconnectBtn) disconnectBtn.style.display = 'none';

                // Hide Transfer button in header when connection fails
                const transferBtnHeaderErr = rootElement.querySelector('#transferToSalesforceBtnHeader');
                if (transferBtnHeaderErr) transferBtnHeaderErr.style.display = 'none';

                // Show error message
                let errorMessage = 'Connection failed';
                if (error.message) {
                    if (error.message.includes('Popup was blocked')) {
                        errorMessage = 'Popup blocked. Please allow popups for this site.';
                    } else {
                        errorMessage = error.message;
                    }
                }

                this._showToast(errorMessage, 'error');

                // Reset to disconnected state after 3 seconds
                setTimeout(() => {
                    if (indicator) indicator.style.background = '#fbbf24';
                    if (statusText) statusText.textContent = 'Disconnected';
                }, 3000);
            }
        }

        /**
         * Check Salesforce connection status in CRM Settings header
         * @private
         */
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
                // Check localStorage for saved auth
                const sfConnected = localStorage.getItem('sf_connected');
                const savedUserInfo = localStorage.getItem('sf_user_info');

                if (sfConnected === 'true' && savedUserInfo) {
                    const userInfo = JSON.parse(savedUserInfo);
                    const displayName = userInfo.display_name || userInfo.username || 'Salesforce User';

                    // Update UI to connected
                    if (statusCard) {
                        statusCard.style.background = '#dcfce7';
                        statusCard.style.borderColor = '#86efac';
                    }
                    if (indicator) indicator.style.background = '#10b981';
                    if (statusText) {
                        statusText.textContent = 'Connected';
                        statusText.style.color = '#16a34a';
                    }
                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    // Generate initials
                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    // Toggle buttons
                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) disconnectBtn.style.display = 'flex';

                    // Show Transfer button when connected
                    const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                    if (transferBtn) transferBtn.style.display = 'flex';

                    console.log('CRM Settings: Salesforce already connected');
                } else {
                    // Not connected
                    if (statusCard) {
                        statusCard.style.background = '#fef3c7';
                        statusCard.style.borderColor = '#fcd34d';
                    }
                    if (indicator) indicator.style.background = '#fbbf24';
                    if (statusText) {
                        statusText.textContent = 'Disconnected';
                        statusText.style.color = '#92400e';
                    }
                    if (userSection) userSection.style.display = 'none';
                    if (connectBtn) connectBtn.style.display = 'flex';
                    if (disconnectBtn) disconnectBtn.style.display = 'none';

                    // Hide Transfer button when disconnected
                    const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                    if (transferBtn) transferBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('Error checking SF connection:', error);

                // Hide Transfer button on error
                const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                if (transferBtn) transferBtn.style.display = 'none';
            }
        }

        /**
         * Handle Salesforce connect in CRM Settings
         * @private
         */
        static async _handleSalesforceConnectInSettings(rootElement) {
            console.log('Salesforce Connect clicked in CRM Settings');

            const statusCard = rootElement.querySelector('#sf-status-card');
            const indicator = rootElement.querySelector('#sf-status-indicator');
            const statusText = rootElement.querySelector('#sf-status-text');
            const userSection = rootElement.querySelector('#sf-user-section');
            const userAvatar = rootElement.querySelector('#sf-user-avatar');
            const userName = rootElement.querySelector('#sf-user-name');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#sf-disconnect-btn');

            try {
                // Update UI to connecting
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) statusText.textContent = 'Connecting...';
                if (connectBtn) connectBtn.disabled = true;

                // Get or create instance
                const instance = this._getInstance();
                if (!instance) {
                    throw new Error('Failed to get SalesforceLeadLib instance');
                }

                // Call connect (opens OAuth popup)
                const authStatus = await instance.connect();

                if (authStatus && authStatus.success) {
                    const userInfo = authStatus.userInfo || {};
                    const orgName = userInfo.organization_name || userInfo.orgName || 'Salesforce';
                    const displayName = userInfo.display_name || userInfo.username || 'Unknown user';

                    // Save auth info to localStorage for persistence
                    localStorage.setItem('sf_user_info', JSON.stringify(userInfo));
                    localStorage.setItem('sf_connected', 'true');
                    localStorage.setItem('sf_connected_at', new Date().toISOString());

                    // Update UI to connected state
                    if (statusCard) {
                        statusCard.style.background = '#dcfce7';
                        statusCard.style.borderColor = '#86efac';
                    }
                    if (indicator) indicator.style.background = '#10b981';
                    if (statusText) {
                        statusText.textContent = 'Connected';
                        statusText.style.color = '#16a34a';
                    }
                    if (userSection) userSection.style.display = 'flex';
                    if (userName) userName.textContent = displayName;

                    // Generate initials
                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    if (userAvatar) userAvatar.textContent = initials;

                    // Toggle buttons
                    if (connectBtn) connectBtn.style.display = 'none';
                    if (disconnectBtn) {
                        disconnectBtn.style.display = 'flex';
                        disconnectBtn.disabled = false;
                    }

                    // Show Transfer button when connected
                    const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                    if (transferBtn) transferBtn.style.display = 'flex';

                    this._showToast(`Connected to ${orgName} as ${displayName}`, 'success');
                } else {
                    throw new Error('Authentication failed');
                }

            } catch (error) {
                console.error('Connection error:', error);

                // Reset UI to disconnected
                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = 'Connection Failed';
                    statusText.style.color = '#f59e0b';
                }
                if (userSection) userSection.style.display = 'none';

                // Hide Transfer button on connection failure
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

                // Reset status text after 3 seconds
                setTimeout(() => {
                    if (statusText) statusText.textContent = 'Disconnected';
                }, 3000);
            }
        }

        /**
         * Handle Salesforce disconnect in CRM Settings
         * @private
         */
        static async _handleSalesforceDisconnectInSettings(rootElement) {
            console.log('Salesforce Disconnect clicked in CRM Settings');

            const statusCard = rootElement.querySelector('#sf-status-card');
            const indicator = rootElement.querySelector('#sf-status-indicator');
            const statusText = rootElement.querySelector('#sf-status-text');
            const userSection = rootElement.querySelector('#sf-user-section');
            const connectBtn = rootElement.querySelector('#sf-connect-btn');
            const disconnectBtn = rootElement.querySelector('#sf-disconnect-btn');

            try {
                // Update UI to disconnecting
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) statusText.textContent = 'Disconnecting...';
                if (disconnectBtn) disconnectBtn.disabled = true;

                // Get or create instance
                const instance = this._getInstance();
                if (instance) {
                    await instance.disconnect();
                }

                // Clear localStorage
                localStorage.removeItem('sf_connected');
                localStorage.removeItem('sf_connected_at');
                localStorage.removeItem('sf_user_info');
                localStorage.removeItem('sf_access_token');
                localStorage.removeItem('sf_instance_url');

                // Update UI to disconnected state
                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = 'Disconnected';
                    statusText.style.color = '#92400e';
                }
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) {
                    disconnectBtn.style.display = 'none';
                    disconnectBtn.disabled = false;
                }

                // Hide Transfer button when disconnected
                const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
                if (transferBtn) transferBtn.style.display = 'none';

                this._showToast('Disconnected from Salesforce', 'success');

            } catch (error) {
                console.error('Disconnect error:', error);

                // Still clear localStorage and update UI even on error
                localStorage.removeItem('sf_connected');
                localStorage.removeItem('sf_connected_at');
                localStorage.removeItem('sf_user_info');

                if (statusCard) {
                    statusCard.style.background = '#fef3c7';
                    statusCard.style.borderColor = '#fcd34d';
                }
                if (indicator) indicator.style.background = '#fbbf24';
                if (statusText) {
                    statusText.textContent = 'Disconnected';
                    statusText.style.color = '#92400e';
                }
                if (userSection) userSection.style.display = 'none';
                if (connectBtn) connectBtn.style.display = 'flex';
                if (disconnectBtn) {
                    disconnectBtn.style.display = 'none';
                    disconnectBtn.disabled = false;
                }

                // Hide Transfer button on error
                const transferBtnErr = rootElement.querySelector('#transferToSalesforceBtn');
                if (transferBtnErr) transferBtnErr.style.display = 'none';

                this._showToast('Disconnected from Salesforce', 'success');
            }
        }

        // ============================================
        // Export Status Tracking Methods
        // ============================================

        /**
         * Save export status after successful transfer
         * @param {string} contactId - Contact UUID
         * @param {string} salesforceId - Salesforce Lead ID
         * @private
         */
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

                // Get existing export statuses
                const existingStatuses = this._getExportStatuses();

                // Update or add new status
                existingStatuses[contactId] = exportStatus;

                // Save to localStorage
                localStorage.setItem('sf_export_statuses', JSON.stringify(existingStatuses));

                console.log(`Export status saved for contact ${contactId}:`, exportStatus);
            } catch (error) {
                console.error('Failed to save export status:', error);
            }
        }

        /**
         * Get all export statuses
         * @returns {Object} Map of contactId -> exportStatus
         */
        static _getExportStatuses() {
            try {
                const statuses = localStorage.getItem('sf_export_statuses');
                return statuses ? JSON.parse(statuses) : {};
            } catch (error) {
                console.error('Failed to load export statuses:', error);
                return {};
            }
        }

        /**
         * Check if a contact has been exported
         * @param {string} contactId - Contact UUID
         * @returns {Object|null} Export status or null if not exported
         */
        static getExportStatus(contactId) {
            const statuses = this._getExportStatuses();
            return statuses[contactId] || null;
        }

        /**
         * Check if a contact has been exported (boolean)
         * @param {string} contactId - Contact UUID
         * @returns {boolean} True if exported
         */
        static isExported(contactId) {
            return this.getExportStatus(contactId) !== null;
        }

        /**
         * Get all exported contact IDs
         * @returns {Array} Array of exported contact IDs
         */
        static getExportedContactIds() {
            const statuses = this._getExportStatuses();
            return Object.keys(statuses);
        }

        /**
         * Clear export status for a contact
         * @param {string} contactId - Contact UUID
         */
        static clearExportStatus(contactId) {
            try {
                const statuses = this._getExportStatuses();
                delete statuses[contactId];
                localStorage.setItem('sf_export_statuses', JSON.stringify(statuses));
                console.log(`Export status cleared for contact ${contactId}`);
            } catch (error) {
                console.error('Failed to clear export status:', error);
            }
        }

        /**
         * Clear all export statuses
         */
        static clearAllExportStatuses() {
            localStorage.removeItem('sf_export_statuses');
            console.log('All export statuses cleared');
        }
    }


    // GLOBAL EXPOSURE
    

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
