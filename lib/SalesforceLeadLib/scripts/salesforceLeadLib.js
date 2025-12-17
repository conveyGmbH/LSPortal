/**
 * SALESFORCE LEAD LIBRARY 
 *
 * Consolidates all Salesforce Lead management functionality:
 * - displayLeadTransferController.js
 * - FieldMappingService.js
 * - LeadEditsManager.js
 * - transferModals.js
 */

(function() {
    'use strict';
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

/* Cards */
.card {
    background-color: #ffffff;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Field cards (CardView) */
.field-card {
    transition: all 0.2s ease;
    cursor: pointer;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.field-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: #3b82f6;
}
.field-card.active-field {
    border-left: 4px solid #10B981;
}
.field-card.inactive-field {
    border-left: 4px solid #EF4444;
    opacity: 0.7;
    background-color: #f9fafb;
}

/* Toggle switch - Reduced size */
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
input:checked + .toggle-slider {
    background-color: #10B981;
}
input:checked + .toggle-slider:before {
    transform: translateX(18px);
}

/* Modal */
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
    background-color: white;
    padding: 0;
    width: 90%;
    max-width: 500px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: modalSlideIn 0.3s ease-out;
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
    background-color: #3B82F6;
    color: white;
}

/* Scrollbar styling */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-track {
    background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Attachment items styling */
.attachment-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 8px;
    background: white;
    transition: all 0.2s ease;
}
.attachment-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
}
.attachment-icon {
    margin-right: 12px;
    font-size: 24px;
    color: #6b7280;
}
.attachment-details {
    flex: 1;
    min-width: 0;
}
.attachment-name {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 4px;
}
.attachment-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #6b7280;
}
.view-attachment-btn {
    padding: 6px 10px;
    background: #3b82f6;
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
    background: #2563eb;
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

            console.log(`LeadEditsManager initialized (max ${this.MAX_LEADS} leads)`);
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

        clearLeadEdits(eventId) {
            if (!eventId) {
                console.error('Cannot clear edits: eventId is required');
                return false;
            }

            const key = `${this.STORAGE_PREFIX}${eventId}`;
            localStorage.removeItem(key);
            console.log(`Cleared edits for EventId: ${eventId}`);
            return true;
        }

        clearAll() {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.STORAGE_PREFIX)) {
                    keys.push(key);
                }
            }

            keys.forEach(key => localStorage.removeItem(key));
            console.log(`Cleared all ${keys.length} lead edits`);
            return keys.length;
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

        getStorageInfo() {
            let totalSize = 0;
            let leadCount = 0;
            const leads = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.STORAGE_PREFIX)) {
                    const value = localStorage.getItem(key);
                    const size = value.length;
                    totalSize += size;
                    leadCount++;

                    try {
                        const data = JSON.parse(value);
                        leads.push({
                            eventId: key.replace(this.STORAGE_PREFIX, ''),
                            size: size,
                            editCount: data.editCount || 0,
                            lastAccessed: data.lastAccessed,
                            lastModified: data.lastModified
                        });
                    } catch (error) {
                        // Skip corrupted entries
                    }
                }
            }

            leads.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));

            return {
                leadCount,
                maxLeads: this.MAX_LEADS,
                totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2),
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                usage: `${leadCount}/${this.MAX_LEADS} leads`,
                usagePercent: ((leadCount / this.MAX_LEADS) * 100).toFixed(1),
                leads: leads,
                needsCleanup: leadCount > this.MAX_LEADS * 0.8
            };
        }

        showStorageInfo() {
            const info = this.getStorageInfo();

            console.log('Lead Edits Storage Info:');
            console.log(`   Leads: ${info.leadCount}/${info.maxLeads} (${info.usagePercent}%)`);
            console.log(`   Size: ${info.totalSizeKB} KB (${info.totalSizeMB} MB)`);

            if (info.needsCleanup) {
                console.warn(`Storage almost full! Consider running cleanup.`);
            }

            if (info.leads.length > 0) {
                console.log(`   Most recent: ${info.leads[0].eventId} (${info.leads[0].editCount} edits)`);
            }

            return info;
        }

        exportAll() {
            const allEdits = {};

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.STORAGE_PREFIX)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        const eventId = key.replace(this.STORAGE_PREFIX, '');
                        allEdits[eventId] = data;
                    } catch (error) {
                        console.error(`Failed to export ${key}:`, error);
                    }
                }
            }

            console.log(`Exported ${Object.keys(allEdits).length} lead edits`);
            return allEdits;
        }

        importAll(editsData) {
            let imported = 0;
            let failed = 0;

            Object.entries(editsData).forEach(([eventId, data]) => {
                try {
                    const key = `${this.STORAGE_PREFIX}${eventId}`;
                    localStorage.setItem(key, JSON.stringify(data));
                    imported++;
                } catch (error) {
                    console.error(`Failed to import ${eventId}:`, error);
                    failed++;
                }
            });

            console.log(`Import complete: ${imported} succeeded, ${failed} failed`);
            return { imported, failed };
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

            this.serverName = config.serverName || sessionStorage.getItem('serverName') || 'lstest.convey.de';
            this.apiName = config.apiName || sessionStorage.getItem('apiName') || 'apisftest';

            this.loadCustomFieldNames();
            this.loadCustomFields();
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
                                const text = await response.text();
                                if (text.trim()) {
                                    errorData = JSON.parse(text);
                                }
                            } catch (parseError) {
                                console.warn('Could not parse error response as JSON:', parseError);
                            }
                            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
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

                if (eventId) {
                    console.log(`Loading field mappings from API for event: ${eventId}`);
                    await this.loadFieldMappingsFromAPI(eventId);
                }

                if (leadData) {
                    Object.keys(leadData).forEach(fieldName => {
                        const existingConfig = this.getFieldConfig(fieldName);
                        if (!existingConfig) {
                            this.setFieldConfigLocal(fieldName, { active: true });
                        }
                    });
                }
                return true;

            } catch (error) {
                console.error('Field mapping initialization failed, falling back to local-only mode:', error);

                if (leadData) {
                    Object.keys(leadData).forEach(fieldName => {
                        const existingConfig = this.getFieldConfig(fieldName);
                        if (!existingConfig) {
                            this.setFieldConfigLocal(fieldName, { active: true });
                        }
                    });
                }
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

                            if (parsedConfig.customFields && Array.isArray(parsedConfig.customFields)) {
                                this.customFields = parsedConfig.customFields;
                                console.log(`Loaded ${this.customFields.length} custom fields from API`);
                            }

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

            await this.saveFieldMappingsToAPI(fieldName, 'label');

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
            const savedConfig = localStorage.getItem('salesforce_field_mapping');
            return savedConfig ? JSON.parse(savedConfig) : {
                apiEndpoint: "LeadSuccess_Event_API",
                eventId: null,
                config: { fields: [] }
            };
        }

        loadCustomLabels() {
            const savedLabels = localStorage.getItem('salesforce_custom_labels');
            return savedLabels ? JSON.parse(savedLabels) : {};
        }

        saveConfig() {
            localStorage.setItem('salesforce_field_mapping', JSON.stringify(this.fieldConfig));
        }

        saveCustomLabels() {
            localStorage.setItem('salesforce_custom_labels', JSON.stringify(this.customLabels));
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

        exportConfiguration() {
            const exportData = {
                exportedAt: new Date().toISOString(),
                version: "1.0",
                fieldMapping: this.fieldConfig,
                customLabels: this.customLabels,
                metadata: {
                    totalFields: this.fieldConfig.config?.fields?.length || 0,
                    activeFields: this.fieldConfig.config?.fields?.filter(f => f.active).length || 0,
                    customLabelsCount: Object.keys(this.customLabels).length
                }
            };

            return exportData;
        }

        filterFields(fields, filterType) {
            if (filterType === 'all') return fields;

            return fields.map(field => {
                const fieldConfig = this.getFieldConfig(field.apiName);
                const isActive = fieldConfig ? fieldConfig.active : true;

                if (filterType === 'active' && isActive) return field;
                if (filterType === 'inactive' && !isActive) return field;
                return null;
            }).filter(field => field !== null);
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

        getAllConfiguredFields() {
            return this.fieldConfig.config?.fields?.map(f => f.fieldName) || [];
        }

        isFieldActive(fieldName) {
            const config = this.getFieldConfig(fieldName);
            return config ? config.active !== false : true;
        }

        setCustomFieldName(originalFieldName, salesforceFieldName) {
            this.customFieldNames[originalFieldName] = salesforceFieldName;
            this.saveCustomFieldNames();
        }

        getCustomFieldName(originalFieldName) {
            return this.customFieldNames[originalFieldName] || originalFieldName;
        }

        getAllCustomFieldNames() {
            return { ...this.customFieldNames };
        }

        saveCustomFieldNames() {
            try {
                localStorage.setItem('fieldMappingCustomNames', JSON.stringify(this.customFieldNames));
            } catch (error) {
                console.error('Failed to save custom field names:', error);
            }
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

        mapFieldNamesForSalesforce(leadData) {
            const mappedData = {};

            const systemFieldsToExclude = [
                '__metadata', 'KontaktViewId', 'Id', 'CreatedDate', 'LastModifiedDate',
                'CreatedById', 'LastModifiedById', 'DeviceId', 'DeviceRecordId',
                'RequestBarcode', 'EventId', 'SystemModstamp', 'AttachmentIdList',
                'IsReviewed', 'StatusMessage'
            ];

            for (const [originalField, value] of Object.entries(leadData)) {
                if (systemFieldsToExclude.includes(originalField)) {
                    console.log(`Excluding system field from SF transfer: ${originalField}`);
                    continue;
                }

                const isActive = this.isFieldActive(originalField);
                if (isActive === false) {
                    console.log(`Excluding inactive field from SF transfer: ${originalField}`);
                    continue;
                }

                let salesforceFieldName = originalField;

                const customLabel = this.customLabels[originalField];
                const defaultLabel = this.formatFieldLabel(originalField);

                const isValidSalesforceFieldName = (name) => {
                    if (!name || name.trim() === '') return false;
                    return /^[a-zA-Z][a-zA-Z0-9_]*(__c)?$/.test(name.trim());
                };

                if (customLabel && customLabel.trim() !== '' && customLabel !== defaultLabel) {
                    const trimmedLabel = customLabel.trim();

                    if (isValidSalesforceFieldName(trimmedLabel)) {
                        salesforceFieldName = trimmedLabel;
                        console.log(`Using custom label: ${originalField} → ${salesforceFieldName}`);
                    } else {
                        console.warn(`Invalid custom label "${trimmedLabel}" for "${originalField}", using original name`);
                        salesforceFieldName = originalField;
                    }
                }
                else if (this.customFieldNames[originalField]) {
                    salesforceFieldName = this.customFieldNames[originalField];
                    console.log(`Using custom field name: ${originalField} → ${salesforceFieldName}`);
                }
                else {
                    console.log(`Using original field name: ${originalField}`);
                }

                mappedData[salesforceFieldName] = value;
            }

            return mappedData;
        }

        applyEnhancedLabels(leadData) {
            if (window.enhancedFieldMappingService) {
                return window.enhancedFieldMappingService.applyEnhancedDataProcessing(leadData);
            }
            return this.applyCustomLabels(leadData);
        }

        getActiveFieldNames() {
            const activeFields = [];
            if (this.fieldConfig && this.fieldConfig.config && this.fieldConfig.config.fields) {
                for (const field of this.fieldConfig.config.fields) {
                    if (field.active !== false) {
                        activeFields.push(field.fieldName);
                    }
                }
            }
            return activeFields;
        }

        async saveActiveFieldsToBackend() {
            try {
                const activeFields = this.getActiveFieldNames();
                const customLabels = this.customLabels || {};

                console.log(`Saving ${activeFields.length} active fields to backend...`);

                const response = await fetch('http://localhost:3000/api/salesforce/field-config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        activeFields,
                        customLabels
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to save field config: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('Field configuration saved to backend:', result);
                return result;

            } catch (error) {
                console.error('Failed to save field configuration to backend:', error);
                throw error;
            }
        }

        async loadActiveFieldsFromBackend() {
            try {
                console.log('Loading field configuration from backend...');

                const response = await fetch('http://localhost:3000/api/salesforce/field-config', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.log('Not connected to Salesforce, skipping field config load');
                        return null;
                    }
                    throw new Error(`Failed to load field config: ${response.statusText}`);
                }

                const config = await response.json();
                console.log(`Loaded ${config.activeFields?.length || 0} active fields from backend`);

                this._isLoadingFromBackend = true;

                if (config.activeFields && config.activeFields.length > 0) {
                    for (const fieldName of config.activeFields) {
                        await this.setFieldConfig(fieldName, { active: true });
                    }

                    if (this.fieldConfig && this.fieldConfig.config && this.fieldConfig.config.fields) {
                        for (const field of this.fieldConfig.config.fields) {
                            if (!config.activeFields.includes(field.fieldName)) {
                                await this.setFieldConfig(field.fieldName, { active: false });
                            }
                        }
                    }
                }

                if (config.customLabels) {
                    const cleanedLabels = {};
                    let hadInvalidLabels = false;

                    for (const [apiName, sfName] of Object.entries(config.customLabels)) {
                        if (/\s/.test(sfName)) {
                            console.warn(`Removing invalid custom label "${apiName}" → "${sfName}" (contains spaces)`);
                            hadInvalidLabels = true;
                        } else {
                            cleanedLabels[apiName] = sfName;
                        }
                    }

                    this.customLabels = { ...this.customLabels, ...cleanedLabels };
                    this.saveConfig();

                    if (hadInvalidLabels) {
                        console.log('Cleaned invalid custom labels, saving to backend...');
                        await this.saveFieldMappingsToAPI('bulk_save', 'cleanup');
                    }
                }

                this._isLoadingFromBackend = false;

                return config;

            } catch (error) {
                console.error('Failed to load field configuration from backend:', error);
                this._isLoadingFromBackend = false;
                return null;
            }
        }

        async syncWithBackend() {
            if (this._isLoadingFromBackend) {
                console.log('Skipping sync - currently loading from backend');
                return;
            }

            if (this._isTransferInProgress) {
                console.log('Skipping sync - transfer in progress');
                return;
            }

            // DISABLED for LSPortal - no external backend
            // Just save locally instead
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
            try {
                const saved = localStorage.getItem('salesforce_custom_fields');
                if (saved) {
                    this.customFields = JSON.parse(saved);
                    console.log(`Loaded ${this.customFields.length} custom fields from localStorage`);
                } else {
                    this.customFields = [];
                }
            } catch (error) {
                console.error('Failed to load custom fields:', error);
                this.customFields = [];
            }
        }

        saveCustomFields() {
            try {
                localStorage.setItem('salesforce_custom_fields', JSON.stringify(this.customFields));
                console.log(`Saved ${this.customFields.length} custom fields to localStorage`);
            } catch (error) {
                console.error('Failed to save custom fields:', error);
            }
        }

        getAllCustomFields() {
            return this.customFields || [];
        }

        getActiveCustomFields() {
            return (this.customFields || []).filter(field => field.active !== false);
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

        async updateCustomField(fieldId, updates) {
            const index = this.customFields.findIndex(f => f.id === fieldId);

            if (index === -1) {
                console.error(`Custom field not found: ${fieldId}`);
                return false;
            }

            this.customFields[index] = {
                ...this.customFields[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            this.saveCustomFields();

            if (this.currentEventId) {
                await this.saveFieldMappingsToAPI('custom_field_update', 'custom_field');
            }

            console.log('Custom field updated:', this.customFields[index]);
            return true;
        }

        async deleteCustomField(fieldId) {
            const index = this.customFields.findIndex(f => f.id === fieldId);

            if (index === -1) {
                console.error(`Custom field not found: ${fieldId}`);
                return false;
            }

            const deletedField = this.customFields.splice(index, 1)[0];
            this.saveCustomFields();

            if (this.currentEventId) {
                await this.saveFieldMappingsToAPI('custom_field_delete', 'custom_field');
            }

            console.log('Custom field deleted:', deletedField);
            return true;
        }

        async toggleCustomField(fieldId) {
            const field = this.customFields.find(f => f.id === fieldId);

            if (!field) {
                console.error(`Custom field not found: ${fieldId}`);
                return false;
            }

            field.active = !field.active;
            this.saveCustomFields();

            if (this.currentEventId) {
                await this.saveFieldMappingsToAPI('custom_field_toggle', 'custom_field');
            }

            console.log(`Custom field ${field.active ? 'activated' : 'deactivated'}:`, field);
            return field.active;
        }

        getCustomFieldById(fieldId) {
            return this.customFields.find(f => f.id === fieldId) || null;
        }

        getCustomFieldBySfName(sfFieldName) {
            return this.customFields.find(f => f.sfFieldName === sfFieldName) || null;
        }

        customFieldExists(sfFieldName) {
            return this.customFields.some(f => f.sfFieldName === sfFieldName);
        }

        getAllActiveFieldNamesForTransfer() {
            const standardActiveFields = this.getActiveFieldNames();
            const customActiveFields = this.getActiveCustomFields().map(f => f.sfFieldName);

            return [...standardActiveFields, ...customActiveFields];
        }

        async bulkSaveToDatabase() {
            const eventId = this.getCurrentEventId();

            if (!eventId) {
                console.error('Bulk save failed: No event ID available');
                console.log('Available session data:', {
                    selectedEventId: sessionStorage.getItem('selectedEventId'),
                    selectedLeadSource: sessionStorage.getItem('selectedLeadSource'),
                    hasLeadData: !!sessionStorage.getItem('selectedLeadData')
                });
                throw new Error('No event ID available for bulk save. Please refresh the page and try again.');
            }

            console.log('Performing bulk save to database with event ID:', eventId);

            const success = await this.saveFieldMappingsToAPI('bulk_save', 'bulk_export');

            if (success) {
                console.log('Bulk save to database completed successfully');
            } else {
                console.error('Bulk save to database failed');
            }

            return success;
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

    function showFieldCreationConfirmationModal(missingFields, labels, totalFields) {
        return new Promise((resolve) => {
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
                padding: 20px;
            `;

            const fieldList = missingFields.map(fieldName => {
                const label = labels[fieldName] || fieldName;
                return { name: fieldName, label };
            });

            modal.innerHTML = `
                <div style="background: white; border-radius: 12px; padding: 0; max-width: 600px; width: 100%; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <svg style="width: 24px; height: 24px; color: #f59e0b;" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">Create Custom Salesforce Fields</h2>
                        </div>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            The following custom fields don't exist in Salesforce yet and will be created automatically as <strong>Text</strong> fields (255 characters).
                        </p>
                    </div>

                    <div style="flex: 1; overflow-y: auto; padding: 24px;">
                        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-weight: 600; color: #374151; font-size: 14px;">Fields to Create</span>
                                <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">${missingFields.length}</span>
                            </div>
                            <div style="max-height: 300px; overflow-y: auto; background: white; border-radius: 6px; padding: 12px;">
                                ${fieldList.map(f => `
                                    <div style="display: flex; align-items: start; gap: 8px; padding: 8px; border-bottom: 1px solid #f3f4f6; last-child:border-bottom: none;">
                                        <svg style="width: 16px; height: 16px; color: #10b981; flex-shrink: 0; margin-top: 2px;" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                        </svg>
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="font-weight: 600; color: #111827; font-size: 13px; font-family: 'Courier New', monospace;">${f.name}</div>
                                            ${f.label !== f.name ? `<div style="color: #6b7280; font-size: 12px; margin-top: 2px;">Display: ${f.label}</div>` : ''}
                                        </div>
                                        <span style="background: #e0e7ff; color: #4f46e5; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; white-space: nowrap;">Text (255)</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 12px;">
                            <div style="display: flex; gap: 8px;">
                                <svg style="width: 20px; height: 20px; color: #3b82f6; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                </svg>
                                <div style="flex: 1;">
                                    <strong style="color: #1e40af; font-size: 13px; display: block; margin-bottom: 4px;">Transfer Summary</strong>
                                    <ul style="margin: 0; padding-left: 16px; color: #1e3a8a; font-size: 12px;">
                                        <li>Total active fields: <strong>${totalFields}</strong></li>
                                        <li>New fields to create: <strong>${missingFields.length}</strong></li>
                                        <li>Existing fields: <strong>${totalFields - missingFields.length}</strong></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 20px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: flex-end; gap: 12px;">
                        <button id="sf-lib-cancel-field-creation" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
                            Cancel
                        </button>
                        <button id="sf-lib-confirm-field-creation" style="padding: 10px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                            Create Fields & Transfer
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const confirmBtn = modal.querySelector('#sf-lib-confirm-field-creation');
            const cancelBtn = modal.querySelector('#sf-lib-cancel-field-creation');

            confirmBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            cancelBtn.addEventListener('mouseenter', () => {
                cancelBtn.style.background = '#f3f4f6';
            });
            cancelBtn.addEventListener('mouseleave', () => {
                cancelBtn.style.background = 'white';
            });

            confirmBtn.addEventListener('mouseenter', () => {
                confirmBtn.style.background = '#2563eb';
            });
            confirmBtn.addEventListener('mouseleave', () => {
                confirmBtn.style.background = '#3b82f6';
            });
        });
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
                    <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap; line-height: 1.5;">${message}</p>
                </div>
                <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: flex-end;">
                    <button id="sf-lib-close-error-modal" style="padding: 10px 20px; border: none; background: #dc2626; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: background 0.2s;">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('#sf-lib-close-error-modal');
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
                    <button id="sf-lib-close-success-modal" style="padding: 10px 20px; border: none; background: #059669; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: background 0.2s;">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('#sf-lib-close-success-modal');
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

    function showConfirmDialog(title, message, options = {}) {
        return new Promise((resolve) => {
            const confirmText = options.confirmText || 'Confirm';
            const cancelText = options.cancelText || 'Cancel';
            const type = options.type || 'info';

            const modal = document.createElement('div');
            modal.className = 'sf-lib-modal';
            modal.style.cssText = `
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                align-items: center;
                justify-content: center;
                padding: 20px;
            `;

            const colorMap = {
                info: { bg: '#3b82f6', hover: '#2563eb' },
                warning: { bg: '#f59e0b', hover: '#d97706' },
                danger: { bg: '#dc2626', hover: '#b91c1c' },
                success: { bg: '#10b981', hover: '#059669' }
            };

            const color = colorMap[type] || colorMap.info;

            modal.innerHTML = `
                <div class="sf-lib-modal-content" style="max-width: 500px; width: 100%;">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
                        <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">${title}</h2>
                    </div>
                    <div style="padding: 24px;">
                        <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap; line-height: 1.5;">${message}</p>
                    </div>
                    <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: flex-end; gap: 12px;">
                        <button id="sf-lib-cancel-confirm" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
                            ${cancelText}
                        </button>
                        <button id="sf-lib-confirm-confirm" style="padding: 10px 20px; border: none; background: ${color.bg}; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const confirmBtn = modal.querySelector('#sf-lib-confirm-confirm');
            const cancelBtn = modal.querySelector('#sf-lib-cancel-confirm');

            confirmBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            cancelBtn.addEventListener('mouseenter', () => {
                cancelBtn.style.background = '#f3f4f6';
            });
            cancelBtn.addEventListener('mouseleave', () => {
                cancelBtn.style.background = 'white';
            });

            confirmBtn.addEventListener('mouseenter', () => {
                confirmBtn.style.background = color.hover;
            });
            confirmBtn.addEventListener('mouseleave', () => {
                confirmBtn.style.background = color.bg;
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            });
        });
    }

    function showAlertDialog(title, message, options = {}) {
        return new Promise((resolve) => {
            const buttonText = options.buttonText || 'OK';
            const type = options.type || 'info';

            const modal = document.createElement('div');
            modal.className = 'sf-lib-modal';
            modal.style.cssText = `
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                align-items: center;
                justify-content: center;
                padding: 20px;
            `;

            const colorMap = {
                info: { bg: '#3b82f6', hover: '#2563eb' },
                warning: { bg: '#f59e0b', hover: '#d97706' },
                error: { bg: '#dc2626', hover: '#b91c1c' },
                success: { bg: '#10b981', hover: '#059669' }
            };

            const color = colorMap[type] || colorMap.info;

            modal.innerHTML = `
                <div class="sf-lib-modal-content" style="max-width: 500px; width: 100%;">
                    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
                        <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">${title}</h2>
                    </div>
                    <div style="padding: 24px;">
                        <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap; line-height: 1.5;">${message}</p>
                    </div>
                    <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: flex; justify-content: flex-end;">
                        <button id="sf-lib-close-alert" style="padding: 10px 20px; border: none; background: ${color.bg}; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: background 0.2s;">
                            ${buttonText}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('#sf-lib-close-alert');
            closeBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = color.hover;
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = color.bg;
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(true);
                }
            });
        });
    }

    
    // UTILITY FUNCTIONS
    
    function formatFieldLabel(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    function formatTimeAgo(timestamp) {
        const now = Date.now();
        const seconds = Math.floor((now - new Date(timestamp)) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count > 0) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    }

    function getFileIcon(contentType, filename) {
        if (!contentType && filename) {
            const ext = filename.split('.').pop().toLowerCase();
            const extMap = {
                'pdf': 'fa-file-pdf',
                'doc': 'fa-file-word',
                'docx': 'fa-file-word',
                'xls': 'fa-file-excel',
                'xlsx': 'fa-file-excel',
                'ppt': 'fa-file-powerpoint',
                'pptx': 'fa-file-powerpoint',
                'zip': 'fa-file-archive',
                'rar': 'fa-file-archive',
                'jpg': 'fa-file-image',
                'jpeg': 'fa-file-image',
                'png': 'fa-file-image',
                'gif': 'fa-file-image',
                'txt': 'fa-file-alt',
                'csv': 'fa-file-csv'
            };
            return extMap[ext] || 'fa-file';
        }

        if (contentType.startsWith('image/')) return 'fa-file-image';
        if (contentType.includes('pdf')) return 'fa-file-pdf';
        if (contentType.includes('word') || contentType.includes('document')) return 'fa-file-word';
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'fa-file-excel';
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'fa-file-powerpoint';
        if (contentType.includes('zip') || contentType.includes('archive')) return 'fa-file-archive';
        if (contentType.includes('text')) return 'fa-file-alt';

        return 'fa-file';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    function isStandardSalesforceField(fieldName) {
        const standardFields = [
            'ActionCadenceAssigneeId', 'ActionCadenceId', 'ActionCadenceState',
            'ActiveTrackerCount', 'ActivityMetricId', 'ActivityMetricRollupId',
            'Address', 'AnnualRevenue', 'City', 'CleanStatus', 'Company',
            'CompanyDunsNumber', 'ConvertedAccountId', 'ConvertedContactId',
            'ConvertedDate', 'ConvertedOpportunityId', 'ConnectionReceivedId',
            'ConnectionSentId', 'Country', 'CountryCode', 'CurrencyIsoCode',
            'DandBCompanyId', 'Description', 'Division', 'Email',
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
            'State', 'StateCode', 'Status', 'Street', 'Suffix', 'Title', 'Website',
            'Id', 'CreatedDate', 'LastModifiedDate', 'SystemModstamp'
        ];

        return standardFields.includes(fieldName);
    }

    function isSystemField(fieldName) {
        const systemFields = [
            '__metadata', 'KontaktViewId', 'Id', 'CreatedDate', 'LastModifiedDate',
            'CreatedById', 'LastModifiedById', 'SystemModstamp', 'DeviceId',
            'DeviceRecordId', 'EventId', 'RequestBarcode', 'StatusMessage'
        ];
        return systemFields.includes(fieldName);
    }

    
    // MAIN LIBRARY CLASS
    
    class SalesforceLeadLib {
        constructor(config = {}) {
            this.version = '1.0.0';
            this.config = {
                backendUrl: config.backendUrl || (window.location.hostname === 'localhost'
                    ? 'http://localhost:3000'
                    : 'https://lsapisfbackend.convey.de/'),
                serverName: config.serverName || 'lstest.convey.de',
                apiName: config.apiName || 'apisftest',
                ...config
            };

            // Inject CSS
            injectCSS();

            // Initialize services
            this.connectionManager = ConnectionPersistenceManager;
            this.leadEditsManager = new LeadEditsManager();
            this.fieldMappingService = new FieldMappingService({
                serverName: this.config.serverName,
                apiName: this.config.apiName
            });

            // State
            this.currentLeadData = null;
            this.currentContainer = null;
            this.isTransferInProgress = false;

            console.log(`SalesforceLeadLib v${this.version} initialized`);
        }

        // Initialize library with container and lead data
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

        // Load lead into container
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

        // Transfer lead to Salesforce
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

                // Validate required fields
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

        // Get transfer status for a lead
        async getStatus(leadId) {
            try {
                const response = await fetch(`${this.config.backendUrl}/api/leads/transfer-status/${leadId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to get transfer status');
                }

                const result = await response.json();
                return toWinJSPromise(Promise.resolve(result));

            } catch (error) {
                console.error('Get status error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        //  Connect to Salesforce
        async connect(credentials) {
            try {
                if (credentials) {
                    sessionStorage.setItem('credentials', credentials);
                }

                const orgId = 'default';
                localStorage.setItem('orgId', orgId);

                const authUrl = `${this.config.backendUrl}/auth/salesforce?orgId=${encodeURIComponent(orgId)}`;

                // Calculate center position
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
                            localStorage.setItem('orgId', realOrgId);

                            popup.close();
                            clearInterval(checkClosed);
                            window.removeEventListener('message', messageListener);

                            this._checkAuthenticationStatus().then(resolve).catch(reject);
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

        // Disconnect from Salesforce
        async disconnect() {
            try {
                this.connectionManager.clearConnection();
                localStorage.removeItem('orgId');

                await fetch(`${this.config.backendUrl}/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                }).catch(err => console.warn('Server logout failed:', err));

                showModernToast('Successfully disconnected from Salesforce', 'success');

                return toWinJSPromise(Promise.resolve({ success: true }));

            } catch (error) {
                console.error('Disconnect error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        //  Save field mapping configuration
        async saveFieldMapping(config) {
            try {
                if (config.fieldName && config.label) {
                    await this.fieldMappingService.setCustomLabel(config.fieldName, config.label);
                }

                if (config.fieldName && config.active !== undefined) {
                    await this.fieldMappingService.setFieldConfig(config.fieldName, { active: config.active });
                }

                return toWinJSPromise(Promise.resolve({ success: true }));

            } catch (error) {
                console.error('Save field mapping error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        // Get field mapping for event
        async getFieldMapping(eventId) {
            try {
                await this.fieldMappingService.loadFieldMappingsFromAPI(eventId);

                return toWinJSPromise(Promise.resolve({
                    success: true,
                    fieldConfig: this.fieldMappingService.fieldConfig,
                    customLabels: this.fieldMappingService.customLabels,
                    customFields: this.fieldMappingService.customFields
                }));

            } catch (error) {
                console.error('Get field mapping error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        // Clear container
        clear(container) {
            if (container) {
                container.innerHTML = '';
            }
            this.currentLeadData = null;
            this.currentContainer = null;
        }

        // Generate HTML for lead display
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

        // Generate HTML for fields
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

        // Attach event listeners
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

        // Collect active fields only
        _collectActiveFieldsOnly(leadData) {
            const salesforceData = {};
            const excludedFields = new Set([
                'Id', 'CreatedDate', 'LastModifiedDate', 'CreatedById', 'LastModifiedById',
                'SystemModstamp', 'IsDeleted', 'MasterRecordId', '__metadata', 'KontaktViewId',
                'AttachmentIdList', 'EventID', 'DeviceId', 'DeviceRecordId'
            ]);

            const processedData = this.fieldMappingService.applyCustomLabels(leadData);

            for (const [fieldName, fieldInfo] of Object.entries(processedData)) {
                if (excludedFields.has(fieldName)) continue;

                const isActive = fieldInfo.active !== false;
                if (!isActive) continue;

                const value = fieldInfo.value;
                if (!value || (typeof value === 'string' && (value.trim() === '' || value === 'N/A'))) {
                    continue;
                }

                let sfFieldName = fieldName;
                if (!isStandardSalesforceField(fieldName)) {
                    sfFieldName = this.fieldMappingService.customLabels?.[fieldName] || fieldName;
                }

                salesforceData[sfFieldName] = typeof value === 'string' ? value.trim() : value;
            }

            return salesforceData;
        }

        // Transfer to Salesforce backend
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

        // Check authentication status
        async _checkAuthenticationStatus() {
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

                return { success: true, userInfo };
            } else {
                this.connectionManager.clearConnection();
                throw new Error('Authentication failed');
            }
        }

        // Build complete interface matching displayLeadTransfer.html
        buildCompleteInterface(container) {
            const html = `
<div class="flex h-screen flex-col">
    <!-- Main Content (no sidebar) -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header with API Status + User Profile integrated -->
        <header class="bg-white border-b border-gray-200 py-4 px-6">
            <div class="flex justify-between items-center mb-3">
                <!-- Left: Logo + Title -->
                <div class="flex items-center">
                    <img src="/images/LS-Icons_LS.png" alt="LS" class="w-10 h-10 rounded-lg p-1 mr-3">
                    <div>
                        <h1 class="text-xl font-bold text-gray-800">Transfer Lead to Salesforce</h1>
                        <p class="text-xs text-gray-500">LeadSuccess - Salesforce API Manager</p>
                    </div>
                </div>

                <!-- Right: API Status + User Profile + Buttons -->
                <div class="flex items-center space-x-4">
                    <!-- API Status Badge -->
                    <div id="api-status-card" class="flex items-center px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                        <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        <div>
                            <span class="text-xs font-medium text-gray-600">API Status</span>
                            <p class="text-xs text-gray-500">Disconnected</p>
                        </div>
                    </div>

                    <!-- User Profile (hidden initially) -->
                    <div id="user-profile-header" class="flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg" style="display: none;">
                        <div id="user-avatar-header" class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs mr-2">?</div>
                        <div>
                            <p id="user-name-header" class="text-xs font-medium text-gray-800">Not connected</p>
                            <p id="user-email-header" class="text-xs text-gray-500">-</p>
                        </div>
                    </div>

                    <!-- Disconnect Button (hidden initially) -->
                    <button id="disconnect-sf-btn" class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors flex items-center" style="display: none;">
                        <i class="fas fa-sign-out-alt mr-2"></i>
                        Disconnect
                    </button>

                    <!-- Connect Button -->
                    <button id="connectButton" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center text-sm">
                        <i class="fas fa-plug mr-2"></i> Connect to Salesforce
                    </button>

                    <!-- Transfer Button -->
                    <button id="transferToSalesforceBtn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <i class="fas fa-sync-alt mr-2"></i> Transfer Lead
                    </button>
                </div>
            </div>

            <!-- Second row: Documentation links -->
            <div class="text-sm text-gray-500">
                API documentation available
                <a href="/docs/LeadSuccess_API_for SalesForce.pdf" download class="text-blue-600 hover:underline">here</a>
                -
                <button id="postmanButton" class="text-blue-600 hover:underline inline-flex items-center">
                    <img src="/images/postman-icon.svg" alt="Postman" class="w-4 h-4 mr-1"> Test API in Postman
                </button>
            </div>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div id="active-stats-card" class="card rounded-xl p-4 cursor-pointer transition-shadow" data-filter="active">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-sm font-medium text-gray-500">Active</p>
                            <p id="active-field-count" class="text-lg font-bold text-green-600">0</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-check-circle text-green-500 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div id="inactive-stats-card" class="card rounded-xl p-4 cursor-pointer transition-shadow" data-filter="inactive">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-sm font-medium text-gray-500">Inactive</p>
                            <p id="inactive-field-count" class="text-lg font-bold text-red-600">0</p>
                        </div>
                        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-times-circle text-red-500 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div id="total-stats-card" class="card rounded-xl p-4 cursor-pointer transition-shadow" data-filter="all">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-sm font-medium text-gray-500">Total</p>
                            <p id="total-field-count" class="text-lg font-bold text-blue-600">0</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-chart-bar text-blue-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Field Management Controls -->
            <div class="card rounded-xl p-4 mb-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-gray-800">Field Management Controls</h2>
                    <div class="flex items-center space-x-3">
                        <!-- View Toggle -->
                        <div class="flex items-center space-x-2 mr-4">
                            <button id="listViewBtn" class="view-toggle-btn active px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm flex items-center">
                                <i class="fas fa-list mr-1"></i> List
                            </button>
                            <button id="cardViewBtn" class="view-toggle-btn px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm flex items-center">
                                <i class="fas fa-th mr-1"></i> Cards
                            </button>
                        </div>
                        <!-- Filter Buttons -->
                        <div class="flex items-center space-x-2">
                            <button data-filter="all" class="filter-btn px-3 py-1.5 text-gray-600 border-b-2 border-transparent text-sm font-medium hover:bg-gray-50">
                                All Fields
                            </button>
                            <button data-filter="active" class="filter-btn active px-3 py-1.5 text-blue-600 border-b-2 border-blue-600 text-sm font-medium hover:bg-blue-50">
                                Active Only
                            </button>
                            <button data-filter="inactive" class="filter-btn px-3 py-1.5 text-gray-600 border-b-2 border-transparent text-sm font-medium hover:bg-gray-50">
                                Inactive Only
                            </button>
                            <button data-filter="custom" class="filter-btn px-3 py-1.5 text-gray-600 border-b-2 border-transparent text-sm font-medium hover:bg-gray-50">
                                <i class="fas fa-plus-circle mr-1"></i> Custom Fields
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                        <span id="fields-summary">Showing all fields</span>
                    </div>
                </div>
            </div>

            <!-- Lead Information -->
            <div id="lead-data-container" class="card rounded-xl p-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-gray-800">Lead Information</h2>
                    <button id="backButton" class="text-gray-600 hover:text-gray-800 text-sm flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i> Back to Lead Selection
                    </button>
                </div>

                <div id="lead-info-header" class="mb-3" style="display: none;">
                    <div class="flex items-center text-sm text-gray-500 mb-2">
                        <span id="lead-source" class="mr-2">Source: -</span>
                        <span class="mr-2">•</span>
                        <span id="lead-id">ID: -</span>
                    </div>
                    <div class="flex items-center">
                        <span id="lead-status-badge" class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded mr-2">-</span>
                        <span id="lead-created" class="text-sm text-gray-500">Created: -</span>
                    </div>
                </div>

                <!-- ListView Container (Table) -->
                <div id="list-view-container">
                    <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Field Name</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Value</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Status</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="leadData" class="bg-white divide-y divide-gray-200">
                                <!-- Fields will be populated here as table rows -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- CardView Container (Grid) -->
                <div id="card-view-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style="display: none;">
                    <!-- Field cards will be generated dynamically here -->
                </div>

                <!-- Custom Fields View Container (Table) -->
                <div id="custom-fields-view-container" style="display: none;">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">Custom Salesforce Fields</h3>
                            <p class="text-sm text-gray-500 mt-1">Manage custom field mappings for Salesforce lead transfer</p>
                        </div>
                        <button id="add-custom-field-btn" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
                            <i class="fas fa-plus mr-2"></i>
                            Add Custom Field
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Field Name</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Value</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Status</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="custom-fields-table-body" class="bg-white divide-y divide-gray-200">
                                <!-- Custom fields will be populated here as table rows -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Empty state for custom fields -->
                    <div id="custom-fields-empty-state" class="text-center py-12" style="display: none;">
                        <i class="fas fa-plus-circle text-gray-300 text-6xl mb-4"></i>
                        <p class="text-gray-500 text-lg">No custom fields configured</p>
                        <p class="text-gray-400 text-sm mb-4">Add custom fields to map data to your Salesforce org</p>
                        <button class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium" onclick="document.getElementById('add-custom-field-btn').click()">
                            <i class="fas fa-plus mr-2"></i> Add Your First Custom Field
                        </button>
                    </div>
                </div>

                <!-- Empty State -->
                <div id="empty-state" class="text-center py-12">
                    <i class="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
                    <p class="text-gray-500 text-lg">No lead loaded</p>
                    <p class="text-gray-400 text-sm">Select a lead to view and transfer to Salesforce</p>
                </div>
            </div>

            <!-- Attachments Section -->
            <div id="attachmentsPreview" class="card rounded-xl p-4 mt-4" style="display: none;">
                <h3 class="text-md font-bold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-paperclip mr-2 text-blue-600"></i>
                    Attachments to Transfer
                </h3>
                <ul id="attachmentsList" class="space-y-2"></ul>
                <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-700 attachments-summary">
                        <i class="fas fa-info-circle mr-1"></i>
                        <span class="font-medium">0 file(s)</span> will be transferred with this lead
                    </p>
                </div>
            </div>
        </main>
    </div>
</div>

<!-- Edit Field Modal -->
<div id="edit-field-modal" class="modal">
    <div class="modal-content">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <h3 class="text-lg font-bold">Edit Field</h3>
            <button id="close-edit-modal" class="text-white hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div class="p-6">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Field Name</label>
                <input type="text" id="edit-field-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" readonly>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Field Value</label>
                <textarea id="edit-field-value" rows="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="mb-6 flex items-center">
                <label class="toggle-switch mr-3">
                    <input type="checkbox" id="edit-field-active">
                    <span class="toggle-slider"></span>
                </label>
                <span class="text-sm font-medium text-gray-700">Active Field</span>
            </div>
            <div class="flex justify-end space-x-3">
                <button id="cancel-edit-btn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    Cancel
                </button>
                <button id="save-edit-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    Save Changes
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Edit Label Modal -->
<div id="edit-label-modal" class="modal">
    <div class="modal-content">
        <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <h3 class="text-lg font-bold">Edit Field Label</h3>
            <button id="close-edit-label-modal" class="text-white hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div class="p-6">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">API Field Name (Read-only)</label>
                <input type="text" id="edit-field-api-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none" readonly>
                <p class="text-xs text-gray-500 mt-1">This is the original field name from the API</p>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Salesforce Field Name</label>
                <input type="text" id="edit-field-custom-label" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Hot__c, CustomField__c">
                <p class="text-xs text-gray-500 mt-1">
                    Must start with a letter, contain only letters, numbers, and underscores.<br>
                    Custom fields should end with __c (e.g., Question01__c → Hot__c)
                </p>
            </div>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4">
                <p class="text-xs text-blue-700">
                    <strong>Example:</strong> Map "Question01" to "Hot__c" - this custom name will be used when transferring to Salesforce.
                </p>
            </div>
            <div class="flex justify-end space-x-3">
                <button id="cancel-edit-label-btn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    Cancel
                </button>
                <button id="save-edit-label-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                    Save Label
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Missing Fields Modal -->
<div id="missing-fields-modal" class="modal">
    <div class="modal-content">
        <div class="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <h3 class="text-lg font-bold flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Custom Fields Missing in Salesforce
            </h3>
            <button id="close-missing-fields-modal" class="text-white hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div class="p-6">
            <p class="text-gray-600 mb-4">
                The following custom fields don't exist in your Salesforce org. Would you like to create them automatically?
            </p>
            <div id="missing-fields-list" class="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto mb-4">
                <!-- Fields will be listed here -->
            </div>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4">
                <p class="text-sm text-blue-700">
                    <strong>Note:</strong> Fields will be created as Text fields with length 255. You can modify them later in Salesforce Setup.
                </p>
            </div>
            <div class="flex justify-end space-x-3">
                <button id="skip-field-creation-btn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center">
                    Skip & Continue
                </button>
                <button id="create-fields-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center">
                     Create Fields
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Field Details Modal -->
<div id="field-details-modal" class="modal">
    <div class="modal-content" style="max-width: 800px; max-height: 80vh;">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <h3 id="field-details-title" class="text-sm font-bold">Field Details</h3>
            <button id="close-field-details-modal" class="text-white hover:text-gray-200 text-xl">&times;</button>
        </div>
        <div id="field-details-body" class="p-4 overflow-auto" style="max-height: calc(80vh - 60px);">
            <!-- Content will be loaded here -->
        </div>
    </div>
</div>

<!-- Attachment Preview Modal -->
<div id="attachment-preview-modal" class="modal">
    <div class="modal-content" style="max-width: 90vw; max-height: 90vh; width: 1000px;">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <h3 id="attachment-modal-title" class="text-lg font-bold">Attachment Preview</h3>
            <button id="close-attachment-modal" class="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>
        <div id="attachment-modal-body" class="p-6 overflow-auto" style="max-height: calc(90vh - 80px);">
            <!-- Content will be loaded here -->
        </div>
    </div>
</div>

<!-- Bulk Action Success Modal -->
<div id="bulk-action-success-modal" class="modal" style="display: none;">
    <div class="modal-content" style="max-width: 500px;">
        <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2 text-2xl"></i>
                <h3 class="text-lg font-bold">Success</h3>
            </div>
            <button id="close-bulk-success-modal" class="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>
        <div class="p-6">
            <p id="bulk-action-message" class="text-gray-700 text-base mb-4"></p>
            <div class="flex justify-end">
                <button id="confirm-bulk-success" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    OK
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Bulk Action Error Modal -->
<div id="bulk-action-error-modal" class="modal" style="display: none;">
    <div class="modal-content" style="max-width: 500px;">
        <div class="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-2 text-2xl"></i>
                <h3 class="text-lg font-bold">Error</h3>
            </div>
            <button id="close-bulk-error-modal" class="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>
        <div class="p-6">
            <p id="bulk-error-message" class="text-gray-700 text-base mb-4"></p>
            <div class="flex justify-end">
                <button id="confirm-bulk-error" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                    OK
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2"></div>
            `;

            container.innerHTML = html;

            // Wire up the "Back to Lead Selection" button
            const backButton = container.querySelector('#backButton');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    console.log('Back to Lead Selection clicked (no actual navigation)');
                });
            }

            console.log('Complete interface built successfully');
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
            console.log('SalesforceLeadLib.init() called for LSPortal integration');
            console.log('ServerUrl:', serverUrl);
            console.log('ApiName:', apiName);
            console.log('User:', user);

            // Store credentials in memory for later API calls
            this._portalConfig = {
                serverUrl: serverUrl,
                apiName: apiName,
                user: user,
                password: password,
                baseUrl: `${serverUrl}/${apiName}`
            };

            console.log('Portal configuration saved:', {
                serverUrl: this._portalConfig.serverUrl,
                apiName: this._portalConfig.apiName,
                user: this._portalConfig.user,
                baseUrl: this._portalConfig.baseUrl
            });

            return true;
        }

        /**
         * Clear all HTML elements from container
         * @param {HTMLElement} rootElement - Container element to clear
         */
        static clear(rootElement) {
            if (!rootElement) {
                console.warn('clear() called with null rootElement');
                return;
            }

            console.log('Clearing container:', rootElement.id || rootElement.className);

            // Remove all child elements
            while (rootElement.firstChild) {
                rootElement.removeChild(rootElement.firstChild);
            }

            console.log('Container cleared successfully');
        }

        /**
         * Open Field Mapping UI for LS_LeadReport (exact copy of fieldConfigurator.html interface)
         * @param {HTMLElement} rootElement - Container for the UI
         * @param {string} eventId - Event UUID from UniqueRecordId table
         */
        static async openFieldMapping(rootElement, eventId) {
            console.log('openFieldMapping() called');
            console.log('RootElement:', rootElement);
            console.log('EventId (UUID):', eventId);

            if (!rootElement) {
                throw new Error('rootElement is required');
            }

            if (!eventId) {
                throw new Error('eventId (UUID) is required');
            }

            if (!this._portalConfig) {
                throw new Error('Library not initialized. Call init() first with Portal Admin credentials');
            }

            try {
                // Clear existing content
                this.clear(rootElement);

                // Store eventId for later use
                sessionStorage.setItem('selectedEventId', eventId);

                // Store credentials in sessionStorage for FieldMappingService
                const credentials = btoa(`${this._portalConfig.user}:${this._portalConfig.password}`);
                sessionStorage.setItem('credentials', credentials);
                sessionStorage.setItem('serverName', this._portalConfig.serverUrl.replace(/^https?:\/\//, ''));
                sessionStorage.setItem('apiName', this._portalConfig.apiName);

                // Create instance with Portal configuration
                const instance = new SalesforceLeadLib({
                    backendUrl: this._portalConfig.baseUrl,
                    serverName: this._portalConfig.serverUrl.replace(/^https?:\/\//, ''),
                    apiName: this._portalConfig.apiName
                });

                // Build Field Configurator interface with inline styles
                const html = `
                    <style>
                        .card { background-color: #ffffff; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
                        .spinner { border: 3px solid #e2e8f0; border-top-color: #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
                        @keyframes spin { to { transform: rotate(360deg); } }
                        .filter-tab { padding: 8px 16px; font-size: 14px; font-weight: 500; color: #4b5563; border-radius: 8px; border: none; background: transparent; cursor: pointer; }
                        .filter-tab:hover { background: #f3f4f6; }
                        .filter-tab.active { background: #3b82f6; color: white; }
                        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
                        .modal.show { display: flex; }
                    </style>
                    <div style="display: flex; flex-direction: column; height: 100%; background-color: rgb(249, 250, 251);">
                        <!-- Main Content -->
                        <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                            <!-- Header -->
                            <header style="background: white; border-bottom: 1px solid #e5e7eb; padding: 16px 24px;">
                                <div>
                                    <h1 style="font-size: 20px; font-weight: bold; color: #1f2937;">Field Configurator</h1>
                                    <p id="event-info" style="font-size: 14px; color: #6b7280; margin-top: 8px;">Configure which fields will be transferred to Salesforce for this event. Required fields (LastName, Company) are always included.</p>
                                </div>
                            </header>

                            <!-- Content -->
                            <main style="flex: 1; overflow-y: auto; padding: 16px;">
                                <!-- Info message for virtual mode (hidden by default) -->
                                <div id="virtual-mode-info" class="card" style="display: none; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                                        <span style="color: #3b82f6; font-size: 20px; margin-top: 4px;">ℹ️</span>
                                        <div>
                                            <p style="font-size: 14px; color: #1f2937; font-weight: 500; margin: 0;">No contacts found for this event.</p>
                                            <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0;">You can configure test data below for testing the transfer. All fields are editable for testing purposes.</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Statistics -->
                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px;">
                                    <div class="card" style="border-radius: 12px; padding: 16px;">
                                        <div id="totalFieldsCount" style="font-size: 24px; font-weight: bold; color: #3b82f6;">0</div>
                                        <div style="font-size: 14px; color: #6b7280;">Total Fields</div>
                                    </div>
                                    <div class="card" style="border-radius: 12px; padding: 16px;">
                                        <div id="activeFieldsCount" style="font-size: 24px; font-weight: bold; color: #10b981;">0</div>
                                        <div style="font-size: 14px; color: #6b7280;">Active Fields</div>
                                    </div>
                                    <div class="card" style="border-radius: 12px; padding: 16px;">
                                        <div id="inactiveFieldsCount" style="font-size: 24px; font-weight: bold; color: #6b7280;">0</div>
                                        <div style="font-size: 14px; color: #6b7280;">Inactive Fields</div>
                                    </div>
                                    <div class="card" style="border-radius: 12px; padding: 16px;">
                                        <div id="customFieldsCount" style="font-size: 24px; font-weight: bold; color: #3b82f6;">0</div>
                                        <div style="font-size: 14px; color: #6b7280;">Custom Fields</div>
                                    </div>
                                </div>

                                <!-- Configuration Section -->
                                <div class="card" style="border-radius: 12px; padding: 16px;">
                                    <!-- Search Bar -->
                                    <div style="position: relative; margin-bottom: 16px;">
                                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #9ca3af;">🔍</span>
                                        <input type="text" id="searchField" placeholder="Search fields..."
                                            style="width: 100%; padding: 12px 16px 12px 48px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" />
                                    </div>

                                    <!-- Filter Tabs -->
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                                        <button class="filter-tab" data-filter="all">
                                            All Fields
                                        </button>
                                        <button class="filter-tab active" data-filter="active">
                                            Active Fields
                                        </button>
                                        <button class="filter-tab" data-filter="inactive">
                                            Inactive Fields
                                        </button>
                                        <button class="filter-tab" data-filter="required">
                                            Required
                                        </button>
                                        <button class="filter-tab" data-filter="custom">
                                            Custom Fields
                                        </button>
                                    </div>

                                    <!-- Add Custom Field Button (shown only when Custom Fields tab is active) -->
                                    <button id="addCustomFieldBtn" style="display: none; margin-bottom: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">
                                        <span style="margin-right: 8px;">➕</span>
                                        Add Custom Field
                                    </button>

                                    <!-- Fields Grid -->
                                    <div id="fieldsContainer" style="text-align: center; padding: 48px 0; color: #6b7280;">
                                        <div class="spinner"></div>
                                        <div style="margin-top: 8px;">Loading fields...</div>
                                    </div>
                                </div>

                                <!-- Bottom Action Buttons -->
                                <div class="card" style="border-radius: 12px; padding: 16px; margin-top: 16px;">
                                    <!-- Action Buttons - Normal Mode -->
                                    <div id="normal-mode-buttons" style="display: none; justify-content: flex-end; gap: 12px;">
                                        <button style="padding: 12px 24px; background: #e2e8f0; color: #374151; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                                             Cancel
                                        </button>
                                        <button style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                                           Save
                                        </button>
                                    </div>

                                    <!-- Action Buttons - Virtual Mode -->
                                    <div id="virtual-mode-buttons" style="display: none; justify-content: flex-end; gap: 12px;">
                                        <button style="padding: 12px 24px; background: #e2e8f0; color: #374151; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                                            <span style="margin-right: 8px;">💾</span> Save
                                        </button>
                                        <button style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                                             Test & Transfer
                                        </button>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>

                    <!-- Custom Field Modal -->
                    <div id="customFieldModal" class="modal">
                        <div style="background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); max-width: 500px; width: 100%; margin: 16px;">
                            <div style="background: #3b82f6; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="font-size: 18px; font-weight: bold; margin: 0;">Add Custom Field</h3>
                                <button style="color: white; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                            </div>

                            <div style="padding: 24px;">
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Field Name *</label>
                                    <input type="text" id="customFieldName" placeholder="e.g., Area__c"
                                           style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; color: #1f2937;" />
                                    <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                                        You must first verify the exact field name in Salesforce and enter it here without spaces.
                                    </p>
                                </div>

                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Default Value</label>
                                    <textarea id="customFieldValue" rows="3" placeholder="e.g., Germany, France"
                                              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; resize: vertical; background: white; color: #1f2937;"></textarea>
                                    <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">Optional: Set a default value for this field</p>
                                </div>

                                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                    <button style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 8px; font-weight: 500; cursor: pointer;">
                                        Cancel
                                    </button>
                                    <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">
                                        <span style="margin-right: 8px;">✓</span> Save Field
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Custom Field Modal -->
                    <div id="editCustomFieldModal" class="modal">
                        <div style="background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); max-width: 500px; width: 100%; margin: 16px;">
                            <div style="background: #10b981; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="font-size: 18px; font-weight: bold; margin: 0;">Edit Custom Field</h3>
                                <button style="color: white; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                            </div>

                            <div style="padding: 24px;">
                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Field Name (Read-only)</label>
                                    <input type="text" id="editCustomFieldName" readonly
                                           style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #f3f4f6; color: #6b7280;" />
                                </div>

                                <div style="margin-bottom: 16px;">
                                    <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Default Value</label>
                                    <textarea id="editCustomFieldValue" rows="3" placeholder="e.g., Germany, France"
                                              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; resize: vertical; background: white; color: #1f2937;"></textarea>
                                    <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">Update the default value for this custom field</p>
                                </div>

                                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                    <button style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 8px; font-weight: 500; cursor: pointer;">
                                        Cancel
                                    </button>
                                    <button style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">
                                        <span style="margin-right: 8px;">✓</span> Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Toast Container -->
                    <div id="toast-container" style="position: fixed; top: 16px; right: 16px; z-index: 50; display: flex; flex-direction: column; gap: 8px;"></div>
                `;

                rootElement.innerHTML = html;

                // Initialize Field Mapping Service and load fields
                try {
                    await instance.fieldMappingService.initializeFields({}, eventId);

                    // Store current filter state on rootElement
                    rootElement._currentFilter = 'active';
                    rootElement._fieldMappingService = instance.fieldMappingService;

                    // Render the fields grid with default 'active' filter
                    this._renderFieldsGrid(rootElement, instance.fieldMappingService, 'active');

                    // Attach event listeners
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

                console.log('Field Mapping UI created successfully');
                return toWinJSPromise(Promise.resolve({ success: true }));

            } catch (error) {
                console.error('openFieldMapping error:', error);
                return toWinJSPromise(Promise.reject(error));
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

            // Auto-remove after 3 seconds
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    toast.remove();
                    if (toastContainer.children.length === 0) {
                        toastContainer.remove();
                    }
                }, 300);
            }, 3000);

            // Add CSS animations if not already present
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

            // Default to 'active' filter if not specified
            currentFilter = currentFilter || 'active';

            // Get standard Salesforce Lead fields
            const standardFields = [
                { name: 'FirstName', label: 'First Name' },
                { name: 'LastName', label: 'Last Name', required: true },
                { name: 'Company', label: 'Company', required: true },
                { name: 'Email', label: 'Email' },
                { name: 'Phone', label: 'Phone' },
                { name: 'MobilePhone', label: 'Mobile Phone' },
                { name: 'Title', label: 'Title' },
                { name: 'Website', label: 'Website' },
                { name: 'Street', label: 'Street' },
                { name: 'City', label: 'City' },
                { name: 'State', label: 'State' },
                { name: 'PostalCode', label: 'Postal Code' },
                { name: 'Country', label: 'Country' },
                { name: 'Description', label: 'Description' },
                { name: 'Industry', label: 'Industry' },
                { name: 'AnnualRevenue', label: 'Annual Revenue' },
                { name: 'NumberOfEmployees', label: 'Number Of Employees' },
                { name: 'LeadSource', label: 'Lead Source' },
                { name: 'Status', label: 'Status' },
                { name: 'Rating', label: 'Rating' }
            ];

            // Get field configuration
            const fieldConfig = fieldMappingService.fieldConfig?.config?.fields || [];
            const customLabels = fieldMappingService.customLabels || {};

            // Build ALL fields list
            const allFields = standardFields.map(sf => {
                const config = fieldConfig.find(f => f.fieldName === sf.name);
                const customLabel = customLabels[sf.name];
                return {
                    name: sf.name,
                    label: customLabel || sf.label,
                    active: config ? config.active !== false : sf.required || false,
                    required: sf.required || false,
                    isCustomField: false
                };
            });

            // Add custom fields
            const customFields = fieldMappingService.customFields || [];
            customFields.forEach(cf => {
                const fieldName = cf.sfFieldName || cf.fieldName || cf.name || 'Unnamed';
                const customLabel = customLabels[fieldName];
                allFields.push({
                    name: fieldName,
                    label: customLabel || cf.label || fieldName,
                    active: cf.active !== false,
                    required: false,
                    isCustomField: true,
                    id: cf.id
                });
            });

            // Filter based on currentFilter
            let filteredFields = allFields.filter(field => {
                if (currentFilter === 'custom') return field.isCustomField;
                if (currentFilter === 'active') return field.active;
                if (currentFilter === 'inactive') return !field.active;
                if (currentFilter === 'required') return field.required;
                return true; // 'all'
            });

            // Update statistics
            const activeCount = allFields.filter(f => f.active).length;
            const inactiveCount = allFields.filter(f => !f.active).length;
            const customCount = allFields.filter(f => f.isCustomField).length;

            rootElement.querySelector('#totalFieldsCount').textContent = allFields.length;
            rootElement.querySelector('#activeFieldsCount').textContent = activeCount;
            rootElement.querySelector('#inactiveFieldsCount').textContent = inactiveCount;
            rootElement.querySelector('#customFieldsCount').textContent = customCount;

            // Show/hide Add Custom Field button
            const addBtn = rootElement.querySelector('#addCustomFieldBtn');
            if (addBtn) {
                addBtn.style.display = currentFilter === 'custom' ? 'flex' : 'none';
            }

            // Render
            if (filteredFields.length === 0) {
                const labels = { all: 'All Fields', active: 'Active Fields', inactive: 'Inactive Fields', required: 'Required Fields', custom: 'Custom Fields' };
                fieldsContainer.innerHTML = `
                    <div style="text-align: center; padding: 48px 0; color: #6b7280;">
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No fields found</div>
                        <div>No ${labels[currentFilter] || currentFilter} match your criteria</div>
                    </div>
                `;
            } else {
                let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 12px; margin-top: 4px;">';

                filteredFields.forEach(field => {
                    const isActive = field.active || field.required;
                    const isRequired = field.required;
                    const isCustom = field.isCustomField;

                    let borderStyle = '';
                    let bgStyle = '';
                    let mainBorder = 'border: 1px solid #e2e8f0;';

                    if (isRequired) {
                        borderStyle = 'border-left: 3px solid #f59e0b;';
                        bgStyle = 'background: #fffbeb;';
                        mainBorder = 'border: 1px solid #667eea;';
                    } else if (isCustom) {
                        borderStyle = 'border-left: 3px solid #2563eb;';
                        bgStyle = 'background: #eff6ff;';
                    } else if (isActive) {
                        bgStyle = 'background: #ebf4ff;';
                        mainBorder = 'border: 1px solid #667eea;';
                    }

                    html += `
                        <label class="field-item${isRequired ? ' required' : ''}${isActive ? ' active' : ''}${isCustom ? ' user-custom-field' : ''}"
                               data-field="${field.name}"
                               data-is-custom="${isCustom}"
                               data-field-id="${field.id || ''}"
                               style="${borderStyle}${bgStyle} ${mainBorder} border-radius: 6px; padding: 10px 12px; display: flex; align-items: ${isCustom ? 'flex-start' : 'center'}; gap: 12px; cursor: pointer;">
                            <input type="checkbox" class="field-checkbox"
                                   ${isActive ? 'checked' : ''}
                                   ${isRequired ? 'disabled' : ''}
                                   style="width: 18px; height: 18px; cursor: pointer; accent-color: #667eea; flex-shrink: 0;" />
                            <div class="field-info" style="flex: 1; min-width: 0;">
                                ${isCustom ? `
                                    <!-- Custom field layout -->
                                    <div class="field-label-with-flags" style="display: flex; align-items: center; gap: 6px;">
                                        <span class="ls-flag" style="color: #2563eb; font-size: 0.75rem;">Custom:</span>
                                        <span style="color: #2563eb; font-weight: 500; font-size: 13px;">${field.label}</span>
                                        <button class="edit-field-label-btn" data-field-name="${field.name}"
                                                title="Edit label mapping"
                                                style="margin-left: auto; background: none; border: none; color: #718096; cursor: pointer; padding: 4px; font-size: 14px;"
                                                onclick="event.stopPropagation();">
                                            ✏️
                                        </button>
                                    </div>
                                    <input type="text" class="field-input field-value-input custom-field-value-input"
                                           data-custom-field="true"
                                           data-custom-field-id="${field.id || ''}"
                                           data-field-id="${field.id || ''}"
                                           data-field-name="${field.name}"
                                           data-sf-field="${field.name}"
                                           value="${field.value || ''}"
                                           placeholder="${field.name}"
                                           style="flex: 1; min-width: 0; text-align: left; width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 14px; margin-top: 6px;"
                                           onclick="event.stopPropagation();">
                                ` : `
                                    <!-- Standard field layout -->
                                    <div style="font-size: 13px; font-weight: 500; color: #1f2937; line-height: 1.5;
                                    text-align: left;">
                                        LS: ${field.label}
                                        ${isRequired ? '<span style="display: inline-block; background: #f59e0b; color: white; font-size: 9px; padding: 2px 6px; border-radius: 3px; font-weight: 600; margin-left: 6px;">REQUIRED</span>' : ''}
                                    </div>
                                `}
                            </div>
                            ${isCustom ? `
                                <button class="delete-custom-field-btn"
                                        data-field-id="${field.id || ''}"
                                        data-field-name="${field.name}"
                                        title="Delete custom field"
                                        style="font-size: 14px; background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px;"
                                        onclick="event.stopPropagation();">
                                    🗑️
                                </button>
                            ` : !isRequired ? `
                                <button class="edit-field-label-btn" data-field-name="${field.name}"
                                        style="background: transparent; color: #6b7280; border: none; padding: 4px; cursor: pointer; font-size: 16px; line-height: 1;"
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
            }

            // Show normal mode buttons
            rootElement.querySelector('#normal-mode-buttons').style.display = 'flex';
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

                    // Re-render the grid with the new filter
                    SalesforceLeadLib._renderFieldsGrid(rootElement, rootElement._fieldMappingService, filter);

                    // Re-attach checkbox, delete, edit, and custom field value listeners after re-render
                    SalesforceLeadLib._attachCheckboxListeners(rootElement, rootElement._fieldMappingService);
                    SalesforceLeadLib._attachDeleteListeners(rootElement, rootElement._fieldMappingService);
                    SalesforceLeadLib._attachEditListeners(rootElement, rootElement._fieldMappingService);
                    SalesforceLeadLib._attachCustomFieldValueListeners(rootElement, rootElement._fieldMappingService);

                    console.log('Filter changed to:', filter);
                });
            });

            // Attach checkbox, delete, edit, and custom field value listeners
            this._attachCheckboxListeners(rootElement, fieldMappingService);
            this._attachDeleteListeners(rootElement, fieldMappingService);
            this._attachEditListeners(rootElement, fieldMappingService);
            this._attachCustomFieldValueListeners(rootElement, fieldMappingService);

            // Add Custom Field button
            const addCustomFieldBtn = rootElement.querySelector('#addCustomFieldBtn');
            if (addCustomFieldBtn) {
                addCustomFieldBtn.addEventListener('click', () => {
                    this._openAddCustomFieldModal(rootElement, fieldMappingService);
                });
            }

            // Save button
            const saveBtn = rootElement.querySelector('#normal-mode-buttons button:last-child');
            if (saveBtn) {
                saveBtn.addEventListener('click', async () => {
                    try {
                        // Save to localStorage first
                        fieldMappingService.saveConfig();
                        console.log('Field configuration saved locally');

                        // Save to LS_FieldMapping database
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
        }

        /**
         * Open Add Custom Field modal
         * @private
         */
        static _openAddCustomFieldModal(rootElement, fieldMappingService) {
            const modal = rootElement.querySelector('#customFieldModal');
            if (!modal) {
                console.error('Modal #customFieldModal not found');
                return;
            }

            // Show modal
            modal.classList.add('show');

            // Clear inputs
            const nameInput = modal.querySelector('#customFieldName');
            const valueInput = modal.querySelector('#customFieldValue');
            if (nameInput) nameInput.value = '';
            if (valueInput) valueInput.value = '';

            // Get all buttons in the modal
            const modalContent = modal.querySelector('div[style*="background: white"]');
            if (!modalContent) {
                console.error('Modal content not found');
                return;
            }

            // Close button (X) - in header
            const headerButtons = modal.querySelectorAll('button');
            const closeBtn = headerButtons[0]; // First button is the X button in header

            // Cancel and Save buttons - in footer
            const footerDiv = modal.querySelector('div[style*="justify-content: flex-end"]');
            const footerButtons = footerDiv ? footerDiv.querySelectorAll('button') : [];
            const cancelBtn = footerButtons[0]; // First button in footer
            const saveBtn = footerButtons[1]; // Second button in footer

            // Close modal function
            const closeModal = () => {
                modal.classList.remove('show');
            };

            // Remove old event listeners by cloning buttons
            if (closeBtn) {
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                newCloseBtn.addEventListener('click', closeModal);
            }

            if (cancelBtn) {
                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                newCancelBtn.addEventListener('click', closeModal);
            }

            if (saveBtn) {
                const newSaveBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                newSaveBtn.addEventListener('click', async () => {
                    const fieldName = nameInput ? nameInput.value.trim() : '';
                    const fieldValue = valueInput ? valueInput.value.trim() : '';

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

                        // Save to config
                        fieldMappingService.saveConfig();

                        console.log('Custom field added:', newField);

                        // Close modal
                        closeModal();

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
                });
            }

            // Click outside to close
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            };
        }

        /**
         * Attach checkbox listeners to field items
         * @private
         */
        static _attachCheckboxListeners(rootElement, fieldMappingService) {
            const checkboxes = rootElement.querySelectorAll('.field-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const fieldItem = e.target.closest('.field-item');
                    const fieldName = fieldItem.getAttribute('data-field');
                    const isActive = e.target.checked;

                    try {
                        // Update field config in memory only (don't save to localStorage or API yet)
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

                        // Update statistics counter without re-rendering the grid
                        SalesforceLeadLib._updateStatisticsCounter(rootElement, fieldMappingService);

                        console.log(`Field ${fieldName} ${isActive ? 'activated' : 'deactivated'} (in memory)`);

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
                    saveTimer = setTimeout(() => {
                        try {
                            // Find and update the custom field
                            const customFields = fieldMappingService.customFields || [];
                            const customField = customFields.find(cf => cf.id === fieldId);

                            if (customField) {
                                customField.value = newValue;

                                // Save to localStorage
                                fieldMappingService.saveConfig();

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
            // Get standard Salesforce Lead fields
            const standardFields = [
                { name: 'FirstName', label: 'First Name' },
                { name: 'LastName', label: 'Last Name', required: true },
                { name: 'Company', label: 'Company', required: true },
                { name: 'Email', label: 'Email' },
                { name: 'Phone', label: 'Phone' },
                { name: 'MobilePhone', label: 'Mobile Phone' },
                { name: 'Title', label: 'Title' },
                { name: 'Website', label: 'Website' },
                { name: 'Street', label: 'Street' },
                { name: 'City', label: 'City' },
                { name: 'State', label: 'State' },
                { name: 'PostalCode', label: 'Postal Code' },
                { name: 'Country', label: 'Country' },
                { name: 'Description', label: 'Description' },
                { name: 'Industry', label: 'Industry' },
                { name: 'AnnualRevenue', label: 'Annual Revenue' },
                { name: 'NumberOfEmployees', label: 'Number Of Employees' },
                { name: 'LeadSource', label: 'Lead Source' },
                { name: 'Status', label: 'Status' },
                { name: 'Rating', label: 'Rating' }
            ];

            // Get field configuration
            const fieldConfig = fieldMappingService.fieldConfig?.config?.fields || [];
            const customLabels = fieldMappingService.customLabels || {};

            // Build ALL fields list
            const allFields = standardFields.map(sf => {
                const config = fieldConfig.find(f => f.fieldName === sf.name);
                const customLabel = customLabels[sf.name];
                return {
                    name: sf.name,
                    label: customLabel || sf.label,
                    active: config ? config.active !== false : sf.required || false,
                    required: sf.required || false,
                    isCustomField: false
                };
            });

            // Add custom fields
            const customFields = fieldMappingService.customFields || [];
            customFields.forEach(cf => {
                const fieldName = cf.sfFieldName || cf.fieldName || cf.name || 'Unnamed';
                const customLabel = customLabels[fieldName];
                allFields.push({
                    name: fieldName,
                    label: customLabel || cf.label || fieldName,
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
         */
        static _attachDeleteListeners(rootElement, fieldMappingService) {
            const deleteButtons = rootElement.querySelectorAll('.delete-custom-field-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering field-item click

                    const fieldId = button.getAttribute('data-field-id');
                    const fieldName = button.getAttribute('data-field-name');

                    // Confirm deletion
                    if (confirm(`Are you sure you want to delete the custom field "${fieldName}"?`)) {
                        try {
                            // Remove from customFields array
                            fieldMappingService.customFields = fieldMappingService.customFields || [];
                            fieldMappingService.customFields = fieldMappingService.customFields.filter(
                                cf => cf.id !== fieldId
                            );

                            // Save to config
                            fieldMappingService.saveConfig();

                            console.log(`Custom field "${fieldName}" deleted successfully`);

                            // Re-render grid
                            const currentFilter = rootElement._currentFilter || 'custom';
                            SalesforceLeadLib._renderFieldsGrid(rootElement, fieldMappingService, currentFilter);

                            // Re-attach listeners
                            SalesforceLeadLib._attachCheckboxListeners(rootElement, fieldMappingService);
                            SalesforceLeadLib._attachDeleteListeners(rootElement, fieldMappingService);

                        } catch (error) {
                            console.error('Failed to delete custom field:', error);
                            SalesforceLeadLib._showToast('Failed to delete custom field: ' + error.message, 'error');
                        }
                    }
                });
            });
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

            // Also handle old edit-custom-field-btn if any exist
            const editButtons = rootElement.querySelectorAll('.edit-custom-field-btn');
            editButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering field-item click

                    const fieldId = button.getAttribute('data-field-id');
                    const fieldName = button.getAttribute('data-field-name');

                    // Open edit modal
                    this._openEditCustomFieldModal(rootElement, fieldMappingService, fieldId, fieldName);
                });
            });
        }

        /**
         * Open Edit Field Label modal
         * @private
         */
        static _openEditFieldLabelModal(rootElement, fieldMappingService, fieldName) {
            const modal = rootElement.querySelector('#editCustomFieldModal');
            if (!modal) {
                console.error('Modal #editCustomFieldModal not found');
                return;
            }

            // Get current label
            const customLabels = fieldMappingService.customLabels || {};
            const currentLabel = customLabels[fieldName] || fieldName;

            // Show modal
            modal.classList.add('show');

            // Update modal title
            const modalTitle = modal.querySelector('h3');
            if (modalTitle) {
                modalTitle.textContent = 'Edit Field Label';
            }

            // Update modal header color to blue for label editing
            const modalHeader = modal.querySelector('div[style*="background: #10b981"]');
            if (modalHeader) {
                modalHeader.style.background = '#3b82f6';
            }

            // Set inputs
            const nameInput = modal.querySelector('#editCustomFieldName');
            const valueInput = modal.querySelector('#editCustomFieldValue');

            if (nameInput) {
                nameInput.value = fieldName;
            }

            if (valueInput) {
                valueInput.value = currentLabel;
                valueInput.rows = 1;
            }

            // Update labels
            const labels = modal.querySelectorAll('label');
            if (labels[0]) labels[0].textContent = 'Field Name (Read-only)';
            if (labels[1]) labels[1].textContent = 'Custom Label';

            const helpText = modal.querySelector('p[style*="font-size: 12px"]');
            if (helpText) {
                helpText.textContent = 'Enter a custom label for this field';
            }

            // Get buttons
            const headerButtons = modal.querySelectorAll('button');
            const closeBtn = headerButtons[0]; // X button

            const footerDiv = modal.querySelector('div[style*="justify-content: flex-end"]');
            const footerButtons = footerDiv ? footerDiv.querySelectorAll('button') : [];
            const cancelBtn = footerButtons[0];
            const saveBtn = footerButtons[1];

            // Close modal function
            const closeModal = () => {
                modal.classList.remove('show');
                // Reset modal header color
                if (modalHeader) {
                    modalHeader.style.background = '#10b981';
                }
            };

            // Remove old event listeners by cloning buttons
            if (closeBtn) {
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                newCloseBtn.addEventListener('click', closeModal);
            }

            if (cancelBtn) {
                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                newCancelBtn.addEventListener('click', closeModal);
            }

            if (saveBtn) {
                const newSaveBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                newSaveBtn.addEventListener('click', () => {
                    const newLabel = valueInput ? valueInput.value.trim() : '';

                    if (!newLabel) {
                        SalesforceLeadLib._showToast('Please enter a label', 'error');
                        return;
                    }

                    try {
                        // Update custom label
                        fieldMappingService.customLabels = fieldMappingService.customLabels || {};
                        fieldMappingService.customLabels[fieldName] = newLabel;

                        // Save to localStorage
                        fieldMappingService.saveCustomLabels();

                        // Save to API
                        fieldMappingService.saveFieldMappingsToAPI(fieldName, 'label').catch(error => {
                            console.error('Failed to save label to API:', error);
                        });

                        console.log(`Label for field "${fieldName}" updated to "${newLabel}"`);

                        // Close modal
                        closeModal();

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
                });
            }
        }

        /**
         * Open Edit Custom Field modal
         * @private
         */
        static _openEditCustomFieldModal(rootElement, fieldMappingService, fieldId, fieldName) {
            const modal = rootElement.querySelector('#editCustomFieldModal');
            if (!modal) {
                console.error('Modal #editCustomFieldModal not found');
                return;
            }

            // Find the custom field
            const customFields = fieldMappingService.customFields || [];
            const customField = customFields.find(cf => cf.id === fieldId);

            if (!customField) {
                SalesforceLeadLib._showToast('Custom field not found', 'error');
                return;
            }

            // Show modal
            modal.classList.add('show');

            // Set inputs
            const nameInput = modal.querySelector('#editCustomFieldName');
            const valueInput = modal.querySelector('#editCustomFieldValue');
            if (nameInput) nameInput.value = customField.sfFieldName || customField.fieldName || customField.name || '';
            if (valueInput) valueInput.value = customField.value || '';

            // Get buttons
            const modalContent = modal.querySelector('div[style*="background: white"]');
            if (!modalContent) {
                console.error('Modal content not found');
                return;
            }

            const headerButtons = modal.querySelectorAll('button');
            const closeBtn = headerButtons[0]; // X button in header

            const footerDiv = modal.querySelector('div[style*="justify-content: flex-end"]');
            const footerButtons = footerDiv ? footerDiv.querySelectorAll('button') : [];
            const cancelBtn = footerButtons[0];
            const saveBtn = footerButtons[1];

            // Close modal function
            const closeModal = () => {
                modal.classList.remove('show');
            };

            // Remove old event listeners by cloning buttons
            if (closeBtn) {
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                newCloseBtn.addEventListener('click', closeModal);
            }

            if (cancelBtn) {
                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                newCancelBtn.addEventListener('click', closeModal);
            }

            if (saveBtn) {
                const newSaveBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                newSaveBtn.addEventListener('click', () => {
                    const newValue = valueInput ? valueInput.value.trim() : '';

                    try {
                        // Update custom field value
                        customField.value = newValue;

                        // Save to config
                        fieldMappingService.saveConfig();

                        console.log(`Custom field "${fieldName}" updated with value:`, newValue);

                        // Close modal
                        closeModal();

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
                });
            }

            // Click outside to close
            modal.onclick = (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            };
        }

        /**
         * Open CRM Test Export UI with dummy data
         * @param {HTMLElement} rootElement - Container for the UI
         * @param {string} eventId - Event UUID from UniqueRecordId table
         */
        static async openCrmTestExport(rootElement, eventId) {
            console.log('openCrmTestExport() called');
            console.log('RootElement:', rootElement);
            console.log('EventId (UUID):', eventId);

            if (!rootElement) {
                throw new Error('rootElement is required');
            }

            if (!eventId) {
                throw new Error('eventId (UUID) is required');
            }

            if (!this._portalConfig) {
                throw new Error('Library not initialized. Call init() first');
            }

            try {
                this.clear(rootElement);

                const html = `
                    <div class="crm-test-export-container" style="padding: 20px;">
                        <h2 style="margin-bottom: 20px; font-size: 24px; font-weight: bold;">
                            CRM Test Export (Dummy Data)
                        </h2>
                        <p style="margin-bottom: 15px; color: #666;">
                            Test lead export to Salesforce with dummy data (Event: ${eventId})
                        </p>
                        <div>
                            <button style="padding: 10px 20px; background: #0070d2; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Test Export to Salesforce
                            </button>
                        </div>
                    </div>
                `;

                rootElement.innerHTML = html;

                console.log('CRM Test Export UI created successfully');
                return toWinJSPromise(Promise.resolve({ success: true }));

            } catch (error) {
                console.error('openCrmTestExport error:', error);
                return toWinJSPromise(Promise.reject(error));
            }
        }

        /**
         * Open CRM Export UI with real contact data
         * @param {HTMLElement} rootElement - Container for the UI
         * @param {string} contactId - Contact UUID from UniqueRecordId table
         */
        static async openCrmExport(rootElement, contactId) {
            console.log('openCrmExport() called');
            console.log('RootElement:', rootElement);
            console.log('ContactId (UUID):', contactId);

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

                // Load lead data via LS_LeadReport using OData
                // Note: contactId is the UUID from FCT_GetUniqueRecordID for the Kontakt record
                // We use Id filter for LS_LeadReport (Id is the unique identifier for each lead)
                const endpoint = `LS_LeadReport?$filter=Id eq '${contactId}'&$format=json`;
                const leadDataResponse = await this._callPortalODataAPI(endpoint);

                console.log('Lead data response:', leadDataResponse);

                // Extract first result
                const leadData = leadDataResponse && leadDataResponse.d && leadDataResponse.d.results && leadDataResponse.d.results[0];

                if (!leadData) {
                    throw new Error('No lead data found for this contact');
                }

                // Load field configuration for the event from API
                const eventId = leadData.EventId || leadData.VeranstaltungVIEWID;
                console.log('EventId from lead data:', eventId);

                // Load from LS_FieldMapping database
                const configData = await this._loadFieldConfigFromAPI(eventId);

                const fieldConfig = configData?.fieldConfig || null;
                const customFields = configData?.customFields || [];
                const customLabels = configData?.customLabels || {};

                console.log('Field config loaded from API:', fieldConfig);
                console.log('Custom fields loaded from API:', customFields.length);
                console.log('Custom labels loaded from API:', Object.keys(customLabels).length);

                // Build field list with only active fields
                const allFields = this._buildActiveFieldsList(leadData, fieldConfig, customFields, customLabels);
                console.log('Active fields to display:', allFields.length);

                // Create HTML interface
                const html = this._buildCrmExportHTML(leadData, allFields, contactId);
                rootElement.innerHTML = html;

                // Attach event listeners
                this._attachCrmExportListeners(rootElement, leadData, allFields);

                console.log('CRM Export UI created successfully');
                return toWinJSPromise(Promise.resolve({ success: true, leadData }));

            } catch (error) {
                console.error('openCrmExport error:', error);
                rootElement.innerHTML = `
                    <div style="padding: 20px; color: #dc2626;">
                        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">❌ Error Loading Lead Data</h3>
                        <p>${error.message}</p>
                    </div>
                `;
                return toWinJSPromise(Promise.reject(error));
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
            console.log('Calling Portal OData API:', url);

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
                    throw new Error(`OData API call failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Portal OData API response:', data);
                return data;

            } catch (error) {
                console.error('Portal OData API call error:', error);
                throw error;
            }
        }

        /**
         * Load field configuration from LS_FieldMapping API
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
                const config = localStorage.getItem(`fieldConfig_${eventId}`);
                return config ? JSON.parse(config) : { fields: [] };
            } catch (error) {
                console.error('Failed to load field config:', error);
                return { fields: [] };
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
         * Build list of active fields with their values
         * @private
         */
        static _buildActiveFieldsList(leadData, fieldConfig, customFields, customLabels = {}) {
            const standardFields = [
                { name: 'FirstName', label: 'First Name' },
                { name: 'LastName', label: 'Last Name', required: true },
                { name: 'Company', label: 'Company', required: true },
                { name: 'Email', label: 'Email' },
                { name: 'Phone', label: 'Phone' },
                { name: 'MobilePhone', label: 'Mobile Phone' },
                { name: 'Title', label: 'Title' },
                { name: 'Website', label: 'Website' },
                { name: 'Street', label: 'Street' },
                { name: 'City', label: 'City' },
                { name: 'State', label: 'State' },
                { name: 'PostalCode', label: 'Postal Code' },
                { name: 'Country', label: 'Country' },
                { name: 'Description', label: 'Description' },
                { name: 'Industry', label: 'Industry' },
                { name: 'AnnualRevenue', label: 'Annual Revenue' },
                { name: 'NumberOfEmployees', label: 'Number Of Employees' },
                { name: 'LeadSource', label: 'Lead Source' },
                { name: 'Status', label: 'Status' },
                { name: 'Rating', label: 'Rating' }
            ];

            const allFields = [];

            // Check if field config exists and has fields
            const hasFieldConfig = fieldConfig && fieldConfig.fields && fieldConfig.fields.length > 0;

            // Add standard fields (respecting Field Configurator settings)
            standardFields.forEach(sf => {
                let isActive;

                if (hasFieldConfig) {
                    // If config exists, use it to determine if field is active
                    const config = fieldConfig.fields.find(f => f.fieldName === sf.name);
                    // Show field if: explicitly set to active, OR required, OR not in config (default to showing it)
                    isActive = config ? (config.active !== false) : true;
                } else {
                    // No config saved yet - show all standard fields
                    isActive = true;
                }

                if (isActive) {
                    // Use custom label if available, otherwise use default label
                    const customLabel = customLabels[sf.name];
                    allFields.push({
                        name: sf.name,
                        label: customLabel || sf.label,
                        value: leadData[sf.name] || '',
                        required: sf.required || false,
                        isCustomField: false
                    });
                }
            });

            // Add custom fields (only active ones)
            customFields.forEach(cf => {
                if (cf.active !== false) {
                    const fieldName = cf.sfFieldName || cf.fieldName || cf.name;
                    const customLabel = customLabels[fieldName];
                    allFields.push({
                        name: fieldName,
                        label: customLabel || cf.label || fieldName,
                        value: cf.value || '',
                        required: false,
                        isCustomField: true
                    });
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
         * @private
         */
        static _buildCrmExportHTML(leadData, allFields, contactId) {
            return `
                <div style="max-width: 1200px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <!-- Header -->
                    <div style="margin-bottom: 24px;">
                        <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">
                            Transfer Lead to Salesforce
                        </h1>
                        <p style="color: #6b7280; font-size: 14px;">
                            Contact ID: ${this._escapeHtml(contactId)}
                        </p>
                    </div>

                    <!-- Lead Fields -->
                    <div style="background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 20px;">
                        <h2 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                            Lead Information
                        </h2>

                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                            ${allFields.map(field => `
                                <div style="display: flex; flex-direction: column;">
                                    <label style="font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                                        ${this._escapeHtml(field.label)}${field.required ? ' <span style="color: #dc2626;">*</span>' : ''}
                                        ${field.isCustomField ? '<span style="display: inline-block; background: #2563eb; color: white; font-size: 9px; padding: 2px 6px; border-radius: 3px; margin-left: 6px;">CUSTOM</span>' : ''}
                                    </label>
                                    <div style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; color: #1f2937;">
                                        ${field.value ? this._escapeHtml(field.value) : '<span style="color: #9ca3af;">Not provided</span>'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="cancelExportBtn" style="padding: 10px 24px; background: #e5e7eb; color: #374151; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;">
                            Cancel
                        </button>
                        <button id="transferToSalesforceBtn" style="padding: 10px 24px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px;">
                            🚀 Transfer to Salesforce
                        </button>
                    </div>

                    <!-- Status Message -->
                    <div id="exportStatusMessage" style="margin-top: 16px; padding: 12px; border-radius: 8px; display: none;"></div>
                </div>
            `;
        }

        /**
         * Attach event listeners for CRM Export UI
         * @private
         */
        static _attachCrmExportListeners(rootElement, leadData, allFields) {
            const transferBtn = rootElement.querySelector('#transferToSalesforceBtn');
            const cancelBtn = rootElement.querySelector('#cancelExportBtn');
            const statusMessage = rootElement.querySelector('#exportStatusMessage');

            if (transferBtn) {
                transferBtn.addEventListener('click', async () => {
                    transferBtn.disabled = true;
                    transferBtn.textContent = 'Transferring...';
                    transferBtn.style.opacity = '0.6';

                    try {
                        // Simulate transfer (in real implementation, call Salesforce API)
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Show success message
                        statusMessage.style.display = 'block';
                        statusMessage.style.background = '#d1fae5';
                        statusMessage.style.color = '#065f46';
                        statusMessage.innerHTML = `
                            <strong>✓ Success!</strong> Lead transferred to Salesforce successfully.
                        `;

                        transferBtn.textContent = '✓ Transferred';
                        transferBtn.style.background = '#059669';

                    } catch (error) {
                        console.error('Transfer error:', error);
                        statusMessage.style.display = 'block';
                        statusMessage.style.background = '#fee2e2';
                        statusMessage.style.color = '#991b1b';
                        statusMessage.innerHTML = `
                            <strong>✗ Error!</strong> ${error.message}
                        `;

                        transferBtn.disabled = false;
                        transferBtn.textContent = '🚀 Transfer to Salesforce';
                        transferBtn.style.opacity = '1';
                    }
                });
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    console.log('Export cancelled');
                    // User can implement navigation back
                });
            }
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
