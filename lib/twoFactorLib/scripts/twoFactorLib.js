// twoFactorLib.js - 2FA Integration for LeadSuccess Portal 

(function () {
    "use strict";

    // CONFIGURATION ET VARIABLES GLOBALES
       
    const query = (typeof getQueryStringParameters === "function") ? getQueryStringParameters() : null;
    let nodeHostname = null;
    if (query && query.nodeHost) {
        nodeHostname = query.nodeHost;
    }

    let API_HOSTNAME = "deimos.convey.de"; // default DEIMOS
    let getBaseUrl = function() {
        return 'https://' + (nodeHostname ? nodeHostname : API_HOSTNAME) + '/2fabackend/api/v1'
        //return 'http://localhost:4000/api/v1'; // only for local development
    };

    let currentSession = {
        activeContainer: null,
        setPasswordCallback: null
    };

    let globalObject = typeof window !== 'undefined' ? window :
        typeof self !== 'undefined' ? self :
         typeof global !== 'undefined' ? global : {};

    // UTILY FUNCTIONS

    // Database request function
    async function apiRequest(method, endpoint, username, password, extraData = {}) {

         const data = {
            username: username,
            password: password,
            ...extraData
         }

        const url = `${getBaseUrl()}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(30000)
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        console.log('🌐 2FA API Request:', { 
            method, 
            url, 
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : []
        });

        try {
            const response = await fetch(url, options);

            const responseText = await response.text();

            // check if response is JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {

                // Extract meaningful error from HTML if possible
                if (responseText.includes('503') || responseText.includes('Service Unavailable')) {
                    throw new Error('Service temporarily unavailable - please try again later');
                } else if (responseText.includes('404') || responseText.includes('Not Found')) {
                    throw new Error('2FA service not found - please contact administrator');
                } else if (responseText.includes('500') || responseText.includes('Internal Server Error')) {
                    throw new Error('Server error - please try again later');
                } else {
                    throw new Error('Invalid server response - please contact administrator');
                }
            }

            if (!response.ok) {
                const errorMessage = result?.message || result?.error || `Request failed with status ${response.status}`;
                console.error(' API Error Response:', { status: response.status, result });
                throw new Error(errorMessage);
            }

            console.log(' API Request successful:', { status: response.status, hasResult: !!result });
            return result;

        } catch (error) {
            console.error(' 2FA API Request Error:', error);
            
            // Improve error messages based on error type
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your internet connection');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error - cannot reach 2FA service. Please check your connection.');
            } else if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
                throw new Error('Cannot reach server - please check server address');
            } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
                throw new Error('Connection refused - 2FA service may be offline');
            } else {
                // Re-throw the error as-is if it's already meaningful
                throw error;
            }
        }
    }

    // Convert a standard Promise to WinJS Promise
    function toWinJSPromise(promise) {
        if (typeof WinJS !== 'undefined' && WinJS.Promise) {
            return new WinJS.Promise(function (complete, error) {
                promise.then(complete).catch(error);
            });
        }
        return promise;
    }

    // Icon detection based on device info
    function getDeviceIcon(deviceInfo) {
        const info = deviceInfo.toLowerCase();
        if (info.includes('iphone') || info.includes('ios')) return '📱';
        if (info.includes('android')) return '🤖';
        if (info.includes('windows')) return '💻';
        if (info.includes('mac') || info.includes('macos')) return '🖥️';
        if (info.includes('linux')) return '🐧';
        if (info.includes('tablet') || info.includes('ipad')) return '📱';
        if (info.includes('chrome')) return '🌐';
        if (info.includes('firefox')) return '🦊';
        if (info.includes('safari')) return '🧭';
        if (info.includes('edge')) return '🔷';
        return '📟';
    }

    // detect if currentDevice corresponding to the current user agent 
    function detectIfCurrentDevice(deviceInfo) {
        const currentUA = navigator.userAgent;
        const deviceInfoLower = deviceInfo.toLowerCase();

        if (deviceInfoLower.includes('chrome') && currentUA.includes('Chrome')) return true;
        if (deviceInfoLower.includes('firefox') && currentUA.includes('Firefox')) return true;
        if (deviceInfoLower.includes('safari') && currentUA.includes('Safari') && !currentUA.includes('Chrome')) return true;
        if (deviceInfoLower.includes('edge') && currentUA.includes('Edge')) return true;

        return false;
    }

    // Error handling functions 
    function showError(message) {
        console.error('2FA Error:', message);
        if (typeof AppData !== 'undefined' && AppData.setErrorMsg) {
            AppData.setErrorMsg({
                error: {
                    errorMsg: message,
                    displayErrorMsg: 'inline'
                }
            });
        } else {
            alert('2FA Error: ' + message);
        }
    }

    // Error message success 
    function showSuccess(message) {
        console.log('2FA Success:', message);
        const notification = document.createElement('div');
        notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #d4edda;
        color: #155724; border: 1px solid #c3e6cb; padding: 12px 20px;
        border-radius: 4px; z-index: 9999; font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
    }

    // Detect device type 
    function detectDevice() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('mobile')) {
            if (ua.includes('android')) return 'Android Mobile';
            if (ua.includes('iphone')) return 'iPhone';
            return 'Mobile Device';
        }
        if (ua.includes('tablet') || ua.includes('ipad')) {
            if (ua.includes('ipad')) return 'iPad';
            return 'Tablet';
        }
        if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome Browser';
        if (ua.includes('firefox')) return 'Firefox Browser';
        if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari Browser';
        if (ua.includes('edge')) return 'Edge Browser';
        return 'Web Browser';
    }

    // =============================================================================
    // INJECTION CSS
    // =============================================================================

    function injectCSS() {
        if (document.getElementById('twoFactorLibCSS')) return;

        const style = document.createElement('style');
        style.id = 'twoFactorLibCSS';
        style.textContent = `
        .tfa-spinner {
            border: 2px solid #f3f4f6; border-top: 2px solid #007acc;
            border-radius: 50%; width: 20px; height: 20px;
            animation: tfa-spin 1s linear infinite; display: inline-block;
        }
        @keyframes tfa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .tfa-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 9999; display: flex;
            align-items: center; justify-content: center; backdrop-filter: blur(4px);
        }
        
        .tfa-modal {
            background: white; border-radius: 8px; max-width: 500px; width: 90%;
            max-height: 85vh; overflow-y: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            animation: tfa-fadeIn 0.3s ease-in-out;
        }
        
        @keyframes tfa-fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .tfa-device-item {
            padding: 15px; margin-bottom: 10px; border: 1px solid #ddd;
            border-radius: 8px; display: flex; justify-content: space-between;
            align-items: center; transition: all 0.2s;
        }

        .tfa-device-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        
        .tfa-current-device { border-color: #007acc; background: #f0f8ff; }
        
        .tfa-error-shake { animation: tfa-shake 0.5s ease-in-out; }
        @keyframes tfa-shake {
            0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .tfa-btn-primary {
            background: #007acc; color: white; border: none; padding: 10px 16px;
            border-radius: 4px; cursor: pointer; font-size: 14px; transition: background-color 0.2s;
        }
        .tfa-btn-primary:hover { background: #005f9a; }
        .tfa-btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        
        .tfa-btn-secondary {
            background: #6c757d; color: white; border: none; padding: 8px 12px;
            border-radius: 4px; cursor: pointer; font-size: 12px; transition: background-color 0.2s;
        }
        .tfa-btn-secondary:hover { background: #545b62; }
        
        .tfa-btn-danger {
            background: #dc3545; color: white; border: none; padding: 8px 12px;
            border-radius: 4px; cursor: pointer; font-size: 12px; transition: background-color 0.2s;
        }
        .tfa-btn-danger:hover { background: #c82333; }
        
        .tfa-input {
            width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;
            font-size: 14px; box-sizing: border-box;
        }
        .tfa-input:focus {
            outline: none; border-color: #007acc; box-shadow: 0 0 0 2px rgba(0,122,204,0.2);
        }
        
        .tfa-tabs {
            display: flex; border-bottom: 2px solid #ddd; margin-bottom: 20px;
        }
        
        .tfa-tab-btn {
            flex: 1; padding: 12px; border: none; background: #f8f9fa; color: #333;
            cursor: pointer; font-size: 14px; border-radius: 4px 4px 0 0;
            margin-right: 2px; transition: all 0.2s;
        }
        .tfa-tab-btn.active { background: #007acc; color: white; }
        
        .tfa-utf8-support { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }


        .tfa-critical-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 10000; display: flex;
            align-items: center; justify-content: center; backdrop-filter: blur(4px);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .tfa-critical-modal-content {
            background: white; border-radius: 12px; max-width: 450px; width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3); animation: tfa-modalFadeIn 0.3s ease-out;
            overflow: hidden;
        }
        
        @keyframes tfa-modalFadeIn {
            from { opacity: 0; transform: scale(0.9) translateY(-20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .tfa-modal-header {
            padding: 20px 24px 16px; border-bottom: 1px solid #e5e7eb;
            display: flex; justify-content: space-between; align-items: center;
        }
        
        .tfa-modal-title {
            font-size: 18px; font-weight: 600; color: #111827; margin: 0;
        }
        
        .tfa-modal-close {
            background: none; border: none; font-size: 24px; color: #6b7280;
            cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;
        }
        .tfa-modal-close:hover { background: #f3f4f6; color: #374151; }
        
        .tfa-modal-body {
            padding: 20px 24px 24px;
        }
        
        .tfa-warning-box {
            display: flex; padding: 16px; margin-bottom: 20px; border-radius: 8px;
            border-left: 4px solid #f59e0b; background: #fffbeb;
        }
        
        .tfa-warning-icon {
            font-size: 20px; margin-right: 12px; color: #f59e0b;
        }
        
        .tfa-warning-content {
            flex: 1;
        }
        
        .tfa-warning-title {
            font-weight: 600; color: #92400e; margin: 0 0 4px;
        }
        
        .tfa-warning-text {
            color: #b45309; font-size: 14px; margin: 0;
        }
        
        .tfa-form-group {
            margin-bottom: 20px;
        }
        
        .tfa-form-label {
            display: block; font-weight: 500; color: #374151; margin-bottom: 6px;
            font-size: 14px;
        }
        
        .tfa-form-input {
            width: 100%; padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 8px;
            font-size: 16px; transition: border-color 0.2s; box-sizing: border-box;
        }
        .tfa-form-input:focus {
            outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        
        .tfa-form-help {
            font-size: 12px; color: #6b7280; margin-top: 4px;
        }
        
        .tfa-readonly-field {
            background: #f9fafb; border: 2px solid #e5e7eb; color: #374151;
            padding: 12px 16px; border-radius: 8px; font-weight: 500;
        }
        
        .tfa-modal-actions {
            display: flex; gap: 12px; margin-top: 24px;
        }
        
        .tfa-btn-cancel {
            flex: 1; background: #f3f4f6; color: #374151; border: none; padding: 12px 20px;
            border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .tfa-btn-cancel:hover { background: #e5e7eb; }
        
        .tfa-btn-danger {
            flex: 1; background: #dc2626; color: white; border: none; padding: 12px 20px;
            border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center;
        }
        .tfa-btn-danger:hover { background: #b91c1c; }
        .tfa-btn-danger:disabled { background: #9ca3af; cursor: not-allowed; }
        
        .tfa-error-message {
            background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
            padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-size: 14px;
            display: none;
        }
        
        .tfa-success-message {
            background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;
            padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-size: 14px;
            display: none;
        }
    `;

        document.head.appendChild(style);
        console.log(' 2FA CSS injected');
    }

    
    // MODAL MANAGEMENT

    let activeModals = [];

    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            activeModals.push(modalId);
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            activeModals = activeModals.filter(id => id !== modalId);
        }
    }

    function closeAllModals() {
        activeModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = 'none';
        });
        activeModals = [];
    }

   
    // GENERATE MAIN INTERFACE   

    // Create the main 2FA management interface 
    async function createMainInterface(container, username, password, userData = {}) {
        try {

            console.log('🔧 Creating 2FA interface for:', username);
            currentSession.activeContainer = container;

            container.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #e9ecef; border-radius: 4px;">
                <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
                <p style="margin: 0; color: #333;">Loading 2FA status...</p>
            </div>
        `;

            // Post with credentials
            const status = await apiRequest('POST', '/auth/status', username, password);

            const interfaceHtml = `
            <div class="tfa-main-interface" style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: white; border: 1px solid #ddd; border-radius: 8px;
                padding: 20px; margin: 10px 0;
            ">
                <div class="tfa-header" style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 32px; margin-bottom: 10px;">
                        ${status.is2FAEnabled ? '🔒' : '🔓'}
                    </div>
                    <h2 style="margin: 0; color: #333; font-size: 18px;">
                        Two-Factor Authentication ${status.is2FAEnabled ? 'Active' : 'Inactive'}
                    </h2>
                    <p style="color: #666; margin: 5px 0; font-size: 14px;">
                        User: <strong>${username}</strong>
                    </p>
                </div>

                <div class="tfa-tabs">
                    <button class="tfa-tab-btn active" data-tab="overview">📊 Overview</button>
                    <button class="tfa-tab-btn" data-tab="devices">📱 Devices</button>
                </div>

                <div class="tfa-tab-content" id="tfa-tab-content" style="min-height: 200px;"></div>

                <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
                    <strong>Debug:</strong> Interface created at ${new Date().toLocaleTimeString()} | 
                    API: ${getBaseUrl()} | Status: ${status.is2FAEnabled ? 'Enabled' : 'Disabled'}
                </div>
            </div>
        `;

            container.innerHTML = interfaceHtml;

            // add Event listeners for tab buttons
            const tabBtns = container.querySelectorAll('.tfa-tab-btn');
            tabBtns.forEach(btn => {
                btn.onclick = () => switchTab(btn.dataset.tab, container, username, password, status);
            });

            // change to overview tab by default
            await switchTab('overview', container, username, password, status);
            console.log(' Main interface created successfully');

        } catch (error) {
            console.error(' Error creating 2FA interface:', error);
            container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
                <h3>2FA Service Unavailable</h3>
                <p>Unable to load 2FA interface: ${error.message}</p>
            </div>
        `;
            throw error;
        }
    }

    // switch between tabs in the 2FA interface 
    async function switchTab(tabId, container, username, password, userData) {
        try {

            const tabBtns = container.querySelectorAll('.tfa-tab-btn');

            tabBtns.forEach(btn => {
                if (btn.dataset.tab === tabId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            const tabContent = container.querySelector('#tfa-tab-content');

            switch (tabId) {
                case 'overview':
                    await loadOverviewTab(tabContent, username, password, userData);
                    break;
                case 'devices':
                    await loadDevicesTab(tabContent, username, password, userData);
                    break;
                default:
                    tabContent.innerHTML = `<div style="padding: 20px; text-align: center;">Unknown tab: ${tabId}</div>`;
            }

        } catch (error) {
            console.error(` Error switching to tab ${tabId}:`, error);
            const tabContent = container.querySelector('#tfa-tab-content');
            if (tabContent) {
                tabContent.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #dc3545;">
                    <p>Error loading ${tabId} tab: ${error.message}</p>
                </div>
            `;
            }
        }
    }

    // load Overview Tab with user data and status
    async function loadOverviewTab(container, username, password, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading overview...</div>';

        try {

            // get user data from API with 
            const status = await apiRequest('POST', '/auth/status', username, password);

            const overviewHtml = `
            <div class="tfa-overview">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="padding: 20px; border-radius: 8px; background: white; border: 1px solid #ddd;">
                        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Account Information</h3>
                        <div style="font-size: 14px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span><strong>Username:</strong></span>
                                <span>${username}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span><strong>2FA Status:</strong></span>
                                <span style="color: ${status.is2FAEnabled ? '#28a745' : '#ffc107'};">
                                    ${status.is2FAEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span><strong>Active Devices:</strong></span>
                                <span>${status.activeDevices || 0}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                <span><strong>DB Password:</strong></span>
                                <span style="color: ${status.hasDBPassword ? '#28a745' : '#6c757d'};">
                                    ${status.hasDBPassword ? 'Generated' : 'Not Set'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 20px; border-radius: 8px; text-align: center; background: white; border: 1px solid #ddd;">
                        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Security Status</h3>
                        <div style="font-size: 48px; margin-bottom: 15px;">
                            ${status.is2FAEnabled ? '🔒' : '⚠️'}
                        </div>
                        <div style="margin-bottom: 20px;">
                            <span style="
                                background: ${status.is2FAEnabled ? '#d4edda' : '#fff3cd'}; 
                                color: ${status.is2FAEnabled ? '#155724' : '#856404'}; 
                                padding: 8px 16px; border-radius: 20px; font-size: 12px; display: inline-block;
                            ">
                                ${status.is2FAEnabled ? 'Account Secured' : 'Enable 2FA for Security'}
                            </span>
                        </div>
                        ${!status.is2FAEnabled ? `
                            <button onclick="TwoFactorLib.enable2FA('${username}', '${password}')" 
                                    class="tfa-btn-primary" style="font-size: 14px; padding: 12px 20px;">
                                🛡️ Enable 2FA
                            </button>
                        ` : `
                            <button onclick="TwoFactorLib.disable2FA('${username}', '${password}')" 
                                    class="tfa-btn-danger" style="font-size: 12px; padding: 10px 16px;">
                                🔓 Disable 2FA
                            </button>
                        `}
                    </div>
                </div>

            </div>
        `;

            container.innerHTML = overviewHtml;

        } catch (error) {
            console.error(' Error loading overview:', error);
            container.innerHTML = `
            <div style="color: #dc3545; text-align: center; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                 Error loading overview: ${error.message}
            </div>
        `;
        }
    }

    // load devices tab with user's authentication devices
    async function loadDevicesTab(container, username, password, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading devices...</div>';

        try {
            const devices = await apiRequest('POST', '/devices/list', username, password);

            let devicesHtml = `
            <div class="tfa-devices">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #333; font-size: 16px;">Authentication Devices</h3>
                    <button onclick="TwoFactorLib.addNewDevice('${username}', '${password}')" class="tfa-btn-primary">
                        ➕ Add Device
                    </button>
                </div>
        `;

            if (devices.devices && devices.devices.length > 0) {
                devices.devices.forEach(device => {
                    const deviceIcon = getDeviceIcon(device.deviceInfo);
                    const isCurrentDevice = detectIfCurrentDevice(device.deviceInfo);
                    devicesHtml += `
                    <div class="tfa-device-item ${isCurrentDevice ? 'tfa-current-device' : ''}">
                        <div style="display: flex; align-items: center;">
                            <div style="font-size: 24px; margin-right: 15px;">${deviceIcon}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px; display: flex; align-items: center;" class="tfa-utf8-support">
                                    <span id="deviceName-${device.deviceId}" class="device-name tfa-utf8-support">${device.deviceInfo}</span>
                                    ${isCurrentDevice ? '<span style="margin-left: 8px; background: #d4edda; color: #155724; padding: 2px 8px; border-radius: 12px; font-size: 10px;">Current</span>' : ''}
                                    <button onclick="TwoFactorLib.startEditDevice(${device.deviceId}, '${device.deviceInfo.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${username}', '${password}')" 
                                            class="tfa-edit-btn" style="
                                        margin-left: 8px; background: none; border: none; color: #666; 
                                        cursor: pointer; padding: 2px; opacity: 0.7; transition: opacity 0.2s;
                                    " 
                                    onmouseover="this.style.opacity='1'" 
                                    onmouseout="this.style.opacity='0.7'"
                                    title="Edit device name">
                                        ✏️
                                    </button>
                                </div>
                                <div style="color: #666; font-size: 12px;">
                                    ${device.authMethod} • Active
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button onclick="TwoFactorLib.removeDevice(${device.deviceId}, '${device.deviceInfo.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}', '${username}', '${password}')" 
                                    class="tfa-btn-danger" title="Remove device">
                                🗑️ Remove
                            </button>
                        </div>
                    </div>
                `;
                });
            } else {
                devicesHtml += `
                <div style="text-align: center; padding: 40px; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">📱</div>
                    <p style="color: #666; margin-bottom: 20px; font-size: 14px;">No devices configured yet. Add your first authentication device to secure your account.</p>
                    <button onclick="TwoFactorLib.enable2FA('${username}', '${password}')" class="tfa-btn-primary" style="padding: 12px 24px;">
                        🛡️ Enable 2FA
                    </button>
                </div>
            `;
            }

            devicesHtml += '</div>';
            container.innerHTML = devicesHtml;

        } catch (error) {
            container.innerHTML = `
            <div style="color: #dc3545; text-align: center; padding: 20px;">
                 Error loading devices: ${error.message}
            </div>
        `;
        }
    }

    // Show the 2FA setup modal for the user to configure their 2FA settings
    async function show2FASetup(username, password) {
        try {
            console.log('🔧 Starting 2FA setup for:', username);

            const existingModal = document.getElementById('tfa-setup-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Create and show the setup modal
            const modalHtml = `
            <div id="tfa-setup-modal" class="tfa-modal-overlay" style="display: none;">
                <div class="tfa-modal">
                    <div style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="margin: 0; color: #333;">Setup Two-Factor Authentication</h3>
                            <button onclick="TwoFactorLib.closeSetupModal()" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
                        </div>
                        <div id="tfa-setup-content">
                            <div style="text-align: center; padding: 20px;">
                                <div class="tfa-spinner"></div>
                                <p style="margin-top: 10px;">Setting up 2FA...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            showModal('tfa-setup-modal');
            
            const result = await apiRequest('POST', '/auth/setup-2fa',  username, password, {
                deviceInfo: detectDevice()
            });

            if (result.success) {
                // store the sessionToken for later use in verification
                const setupSessionToken = result.sessionToken;

                // update modal content with setup instructions
                const setupContent = document.getElementById('tfa-setup-content');
                setupContent.innerHTML = `
                <div style="text-align: center;">
                    <div style="background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
                        <img src="${result.totpSetup.qrCodeDataURL}" alt="QR Code" style="max-width: 200px; height: auto;">
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold;">Manual entry key:</p>
                        <code style="background: white; padding: 8px; border-radius: 4px; font-family: monospace; word-break: break-all; display: block;">
                            ${result.totpSetup.secret}
                        </code>
                        <button onclick="TwoFactorLib.copyToClipboard('${result.totpSetup.secret}')" 
                                class="tfa-btn-secondary" style="margin-top: 10px;">
                            📋 Copy Key
                        </button>
                    </div>

                    <div style="text-align: left; font-size: 13px; color: #666; margin-bottom: 20px;">
                        <p style="font-weight: bold; margin-bottom: 10px;">Setup Instructions:</p>
                        <ol style="margin: 0; padding-left: 20px;">
                            <li>Scan the QR code or enter the key manually</li>
                            <li>Enter a device name (minimum 3 characters)</li>
                            <li>Enter the 6-digit code</li>
                            <li>Auto-validation when both fields are complete</li>
                        </ol>

                    </div>

                    <form id="tfa-setup-form" style="text-align: left;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Device Name *</label>
                            <input type="text" id="tfa-device-name" class="tfa-input" 
                                   placeholder="e.g., John's iPhone, Work Laptop" 
                                   required minlength="3" maxlength="50">
                            <small style="color: #666;">Minimum 3 characters required</small>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Verification Code</label>
                            <input type="text" id="tfa-setup-code" class="tfa-input" 
                                   placeholder="123456" maxlength="6" pattern="[0-9]{6}" required
                                   style="text-align: center; font-size: 18px; letter-spacing: 2px;">
                        </div>

                        <button type="submit" id="tfa-setup-submit" class="tfa-btn-primary" style="width: 100%;" disabled>
                            <span id="tfa-setup-btn-text">Enable 2FA</span>
                            <span id="tfa-setup-spinner" class="tfa-spinner" style="display: none; margin-left: 10px;"></span>
                        </button>
                    </form>

                    <div id="tfa-setup-error" style="display: none; margin-top: 15px; padding: 10px; background: #f8d7da; color: #721c24; border-radius: 4px;"></div>
                </div>
            `;

                // auto-validation when 6 digits are entered
                const form = document.getElementById('tfa-setup-form');
                const deviceNameInput = document.getElementById('tfa-device-name');
                const codeInput = document.getElementById('tfa-setup-code');
                const submitBtn = document.getElementById('tfa-setup-submit');

                // fuction validation
                const validateForm = () => {
                    const deviceName = deviceNameInput.value.trim();
                    const code = codeInput.value.trim();
                    const isValid = deviceName.length >= 3 && /^\d{6}$/.test(code);

                    submitBtn.disabled = !isValid;
                    submitBtn.style.background = isValid ? '#007acc' : '#ccc';
                    submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
                };

                // auto-Submit when both fields are valid
                const autoSubmitIfValid = () => {
                    const deviceName = deviceNameInput.value.trim();
                    const code = codeInput.value.trim();

                    if (deviceName.length >= 3 && /^\d{6}$/.test(code)) {
                        console.log('🔧 Auto-submitting 2FA setup - both fields valid');
                        setTimeout(() => {
                            form.dispatchEvent(new Event('submit'));
                        }, 300);
                    }
                };

                deviceNameInput.addEventListener('input', validateForm);
                codeInput.addEventListener('input', (e) => {
                    validateForm();

                    // auto-submit when 6 digits entered
                    if (e.target.value.length === 6) {
                        autoSubmitIfValid();
                    }
                });
                deviceNameInput.focus();

                // send form data to API on submit
                form.addEventListener("submit", async (e) => {
                  e.preventDefault();

                  const deviceName = deviceNameInput.value.trim();
                  const code = codeInput.value.trim();

                  if (deviceName.length < 3) {
                    TwoFactorLib.showSetupError("Device name must be at least 3 characters");
                    return;
                  }

                  if (!/^\d{6}$/.test(code)) {
                    TwoFactorLib.showSetupError("Please enter a valid 6-digit code");
                    return;
                  }

                  TwoFactorLib.setSetupLoading(true);
                  TwoFactorLib.hideSetupError();

                  try {

                    // prepare request data
                    const requestData = {
                      sessionToken: setupSessionToken,
                      totpCode: code,
                      deviceName: deviceName,
                      username: username,
                    };

                    const verifyResult = await apiRequest("POST", "/auth/verify-2fa", username, password, requestData);

                    if (verifyResult.success) {
                      closeModal("tfa-setup-modal");


                      if (typeof currentSession.setPasswordCallback === 'function' && verifyResult.dbPassword) {
                            currentSession.setPasswordCallback(verifyResult.dbPassword);
                            console.log('2FA setup complete - switched to DBPassword for session');
                        }

                        showSuccess(`Device "${deviceName}" has been successfully added! You can now use your account with 2FA protection.`);


                      if (currentSession.activeContainer) {
                        setTimeout(async () => {
                          try {
                            await createMainInterface(currentSession.activeContainer, username, password);
                            console.log("Interface refreshed after device addition");
                          } catch (error) {
                            console.error("Error refreshing interface:", error);
                          }
                        }, 500);
                      }
                    }
                  } catch (error) {
                    console.error(" Setup verification error:", error);
                    TwoFactorLib.showSetupError(error.message);
                    codeInput.value = "";
                    codeInput.focus();
                  } finally {
                    TwoFactorLib.setSetupLoading(false);
                  }
                });

                console.log(' 2FA setup modal created successfully');
            }
        } catch (error) {
            console.error(' Error in 2FA setup:', error);
            closeModal('tfa-setup-modal');
            showError('Failed to set up 2FA: ' + error.message);
        }
    }

    // TWOFACTOR LIBRARY - OBJET
    let TwoFactorLib = {

        // entry point for the 2FA library 
        getStatus: function (root, username, password, setTokenPassword, language, hostName) {

            const promise = (async () => {
                try {
                    console.log('TwoFactorLib.getStatus called for user:', username, "hostName: ", hostName);

                    if (hostName) API_HOSTNAME = hostName;

                    injectCSS();

                    currentSession.setPasswordCallback = setTokenPassword;

                    if (!root || !('innerHTML' in root)) {
                        throw new Error('Invalid root container element');
                    }

                    root.innerHTML = '<div style="background: yellow; padding: 10px; color: black;">🧪 TFA Container Test - Loading interface...</div>';

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    await createMainInterface(root, username, password);
                    console.log('2FA interface created successfully');

                    return {
                        status: 'success',
                        message: '2FA interface loaded successfully',
                        username: username,
                        note: 'Using original password for all API calls'
                    };

                } catch (error) {
                    console.error(' Error in TwoFactorLib.getStatus:', error);

                    if (root) {
                        root.innerHTML = `
                        <div style="text-align: center; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                            <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
                            <h3 style="margin: 0 0 10px 0; color: #721c24;">2FA Service Error</h3>
                            <p style="margin: 0; color: #721c24; font-size: 14px;">
                                Unable to load 2FA interface: ${error.message}
                            </p>
                        </div>
                    `;
                    }
                    return {
                        status: 'error',
                        message: error.message,
                        error: error
                    };
                }
            })();

            return toWinJSPromise(promise);
        },

        // check 2FA status only the login process 
        verify2FA: function (root, username, password, setTokenPassword, language, hostName) {

            const promise = (async () => {

                try {
                    if (hostName) {
                        API_HOSTNAME = hostName;
                    }

                    injectCSS();

                    return new Promise((resolve, reject) => {
                        const existingModal = document.getElementById('tfa-verify-modal');
                        if (existingModal) {
                            existingModal.remove();
                        }

                        const modalHtml = `
                        <div id="tfa-verify-modal" class="tfa-modal-overlay" style="display: flex;">
                            <div class="tfa-modal" style="max-width: 400px;">
                                <div style="padding: 30px;">
                                    <div style="text-align: center; margin-bottom: 20px;">
                                        <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
                                        <h3 style="margin: 0; color: #333;">Two-Factor Authentication</h3>
                                        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                                            Enter the 6-digit code from your authenticator app
                                        </p>
                                    </div>

                                    <form id="tfa-verify-form">
                                        <div style="margin-bottom: 20px;">
                                            <input type="text" id="tfa-verify-code" class="tfa-input" 
                                                maxlength="6" pattern="[0-9]{6}" required placeholder="000000"
                                                style="text-align: center; font-size: 20px; letter-spacing: 5px;">
                                        </div>
                                        
                                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                            <button type="submit" id="tfa-verify-submit" class="tfa-btn-primary" 
                                                    style="flex: 1; font-size: 16px; font-weight: bold;">
                                                Verify
                                            </button>
                                            <button type="button" id="tfa-verify-cancel" class="tfa-btn-secondary" 
                                                    style="padding: 10px 20px; font-size: 16px;">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>

                                    <div id="tfa-verify-error" style="
                                        color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; 
                                        padding: 10px; border-radius: 4px; margin-top: 15px;
                                        font-size: 14px; text-align: center; display: none;
                                    "></div>
                                </div>
                            </div>
                        </div>
                    `;

                        document.body.insertAdjacentHTML('beforeend', modalHtml);

                        const verifyForm = document.getElementById('tfa-verify-form');
                        const codeInput = document.getElementById('tfa-verify-code');
                        const submitBtn = document.getElementById('tfa-verify-submit');
                        const cancelBtn = document.getElementById('tfa-verify-cancel');
                        const errorDiv = document.getElementById('tfa-verify-error');

                        // Cancel button handler
                        cancelBtn.onclick = () => {
                            console.log('2FA verification cancelled by user');
                            document.getElementById('tfa-verify-modal').remove();
                            reject({
                                status: 'cancelled',
                                message: '2FA verification cancelled by user'
                            });
                        };

                    
                        // improved error message handler
                        const showError = (errorMessage) => {
                            let cleanMessage = errorMessage;
                            if (typeof errorMessage === 'string') {
                                // remove HTML/DOCTYPE content
                                cleanMessage = errorMessage
                                    .replace(/<!DOCTYPE.*?>/gi, '')
                                    .replace(/<html.*?>.*?<\/html>/gis, '')
                                    .replace(/<.*?>/g, '')
                                    .trim();
                                
                                // if the cleaned message is empty or too long, use a generic message
                                if (!cleanMessage || cleanMessage.length > 200) {
                                    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
                                        cleanMessage = 'Network error - please check your connection';
                                    } else if (errorMessage.includes('timeout')) {
                                        cleanMessage = 'Request timeout - please try again';
                                    } else if (errorMessage.includes('500') || errorMessage.includes('Internal')) {
                                        cleanMessage = 'Server error - please try again later';
                                    } else {
                                        cleanMessage = 'Authentication failed - please check your code';
                                    }
                                }
                            }

                            errorDiv.textContent = cleanMessage;
                            errorDiv.style.display = 'block';
                            errorDiv.classList.add('tfa-error-shake');
                            setTimeout(() => errorDiv.classList.remove('tfa-error-shake'), 500);
                        };

                        verifyForm.onsubmit = async (e) => {
                            e.preventDefault();

                            const code = codeInput.value.trim();
                            if (code.length !== 6) {
                                showError('Please enter a 6-digit code');
                                return;
                            }

                            submitBtn.disabled = true;
                            submitBtn.textContent = 'Verifying...';
                            cancelBtn.disabled = true;
                            errorDiv.style.display = 'none';

                            try {

                                const requestData = {
                                    totpCode: code,
                                    username: username
                                };

                                const result = await apiRequest('POST', '/auth/verify-2fa', username, password, requestData);

                                if (result.success) {
                                   console.log('2FA verified successfully');                                  

                                    const modal = document.getElementById('tfa-verify-modal');
                                    if (modal) {
                                        modal.remove();
                                    }

                                     if (typeof setTokenPassword === 'function' && result.dbPassword) {
                                        setTokenPassword(result.dbPassword);
                                        console.log('Switched to DBPassword for session');
                                    }else {
                                            console.log('No DBPassword received or setTokenPassword not available');
                                    }
                                    resolve({
                                        status: 'success',
                                        message: '2FA verification successful',
                                        result: result,
                                        user: result.user,
                                        note: 'Using DBPassword for future API calls',
                                        dbPassword: result.dbPassword
                                    });
                                }
                            } catch (error) {
                                console.error(' 2FA verification error:', error);
                                showError(error.message);

                                submitBtn.disabled = false;
                                submitBtn.textContent = 'Verify';
                                cancelBtn.disabled = false;
                                codeInput.value = '';
                                codeInput.focus();
                            }
                        };

                        // auto-submit when 6 digits are entered
                        codeInput.oninput = () => {
                            if (codeInput.value.length === 6 && !submitBtn.disabled) {
                                setTimeout(() => verifyForm.dispatchEvent(new Event('submit')), 100);
                            }
                        };

                        // escape key handler
                        codeInput.onkeydown = (e) => {
                            if (e.key === 'Escape') {
                                cancelBtn.click();
                            }
                        };

                        setTimeout(() => codeInput.focus(), 100);
                    });

                } catch (error) {
                    console.error('Error in TwoFactorLib.verify2FA:', error);
                    return {
                        status: 'error',
                        message: error.message,
                        error: error
                    };
                }
            })();

            return toWinJSPromise(promise);
        },
        
        // enable 2FA 
        enable2FA: async function (username, password) {
            try {
                await show2FASetup(username, password);
            } catch (error) {
                if (error.message !== 'Setup cancelled') {
                    showError('Failed to enable 2FA: ' + error.message);
                }
            }
        },

        // disabled 2FA 
        disable2FA: async function (username, originalPassword) {
            try {
                console.log(' Starting 2FA disable:', { username });

                // Show the modal
                const result = await TwoFactorLib.showDisable2FAModal(username, originalPassword);

                if (result.success) {
                    showSuccess('2FA disabled successfully! You can now login with your original password only.');

                    // update the password callback if available - switch back to original password
                    if (typeof currentSession.setPasswordCallback === 'function') {
                        // Note: We don't have the original password here, but the procedure should have reset it
                        console.log('2FA disabled - password should be reset to original by procedure');
                    }

                    // refresh the interface
                    if (currentSession.activeContainer) {
                        await createMainInterface(currentSession.activeContainer, username, currentPassword);
                    }
                }

            } catch (error) {
                if (error.message !== 'Operation cancelled') {
                    showError('Failed to disable 2FA: ' + error.message);
                }
            }
        },

        // add a new device 
        addNewDevice: async function (username, password) {

            try {
                await show2FASetup(username, password);
            } catch (error) {
                if (error.message !== 'Setup cancelled') {
                    showError('Failed to add device: ' + error.message);
                }
            }
        },

        // remove a device with Original Password Modal 
        removeDevice: async function (deviceId, deviceName, username, currentPassword) {

            try {
                console.log('Starting device removal:', { deviceId, deviceName, username });

                // check if this might be the last device by getting device list first
                let isLastDevice = false;
                try {
                    const devicesList = await apiRequest('POST', '/devices/list', username, currentPassword);
                    isLastDevice = devicesList.devices && devicesList.devices.length === 1;
                } catch (error) {
                    console.warn('Could not check device count:', error);
                }

                // show the modal with original password request
                const result = await TwoFactorLib.showRemoveDeviceModal(deviceId, deviceName, username, currentPassword, isLastDevice);

                if (result.success) {
                    // show appropriate success message
                    if (result.twoFactorDisabled) {
                        showSuccess('Last device removed and 2FA disabled successfully! You can now login with your original password only.');
                    } else {
                        showSuccess(`Device "${deviceName}" removed successfully!`);
                    }

                    // refresh the interface
                    if (currentSession.activeContainer) {
                        await createMainInterface(currentSession.activeContainer, username, currentPassword);
                    }
                }

            } catch (error) {
                if (error.message !== 'Operation cancelled') {
                    showError('Failed to remove device: ' + error.message);
                }
            }
        },

        // allows the user to edit the name of an authentication device 
        startEditDevice: function (deviceId, currentName, username, password) {
            const nameElement = document.getElementById(`deviceName-${deviceId}`);
            if (!nameElement) return;

            // input element for editing
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'tfa-input';
            input.style.cssText = `
                width: 200px; padding: 4px 8px; font-size: 14px; 
                border: 1px solid #007acc; border-radius: 4px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            `;

            nameElement.replaceWith(input);
            input.focus();
            input.select();

            const saveEdit = async () => {
                const newName = input.value.trim();

                if (newName && newName !== currentName && newName.length >= 3) {
                    try {

                        const result = await apiRequest('POST', '/devices/rename', username, password, {
                            deviceId: deviceId,                            
                            newDeviceName: newName
                        });

                        if (result.success) {
                            showSuccess(`Device renamed to "${newName}"`);

                            if (currentSession.activeContainer) {
                                await createMainInterface(currentSession.activeContainer, username, password);
                            }
                            return;
                        }
                    } catch (error) {
                        showError('Failed to rename device: ' + error.message);
                    }
                }

                restoreOriginalName();
            };

            const restoreOriginalName = () => {
                const span = document.createElement('span');
                span.id = `deviceName-${deviceId}`;
                span.className = 'device-name tfa-utf8-support';
                span.textContent = currentName;
                input.replaceWith(span);
            };

            // save/cancel events
            input.addEventListener('blur', saveEdit);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    restoreOriginalName();
                }
            });
        },

        // slear the 2FA interface and reset the session 
        clear: function (root) {
            try {
                if (root && 'innerHTML' in root) {
                    root.innerHTML = '';
                    closeAllModals();

                    currentSession = {
                        activeContainer: null,
                        setPasswordCallback: null
                    };

                    return { status: 'success', message: '2FA interface cleared' };
                } else {
                    throw new Error('Invalid root container element');
                }
            } catch (error) {
                console.error('Error clearing 2FA interface:', error);
                return { status: 'error', message: error.message };
            }
        },

        // close modal
        closeSetupModal: function () {
            closeModal('tfa-setup-modal');
        },

        showSetupError: function (message) {
            const errorDiv = document.getElementById('tfa-setup-error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                errorDiv.classList.add('tfa-error-shake');
                setTimeout(() => errorDiv.classList.remove('tfa-error-shake'), 500);
            }
        },

        hideSetupError: function () {
            const errorDiv = document.getElementById('tfa-setup-error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
                errorDiv.classList.remove('tfa-error-shake');
            }
        },

        setSetupLoading: function (loading) {
            const submitBtn = document.getElementById('tfa-setup-submit');
            const btnText = document.getElementById('tfa-setup-btn-text');
            const spinner = document.getElementById('tfa-setup-spinner');

            if (submitBtn && btnText && spinner) {
                if (loading) {
                    submitBtn.disabled = true;
                    btnText.textContent = 'Processing...';
                    spinner.style.display = 'inline-block';
                } else {
                    submitBtn.disabled = false;
                    btnText.textContent = 'Enable 2FA';
                    spinner.style.display = 'none';
                }
            }
        },

        copyToClipboard: function (text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    showSuccess('Copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    showError('Failed to copy to clipboard');
                });
            } else {
                // Fallback pour les anciens navigateurs
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showSuccess('Copied to clipboard!');
                } catch (err) {
                    showError('Failed to copy to clipboard');
                }
                document.body.removeChild(textArea);
            }
        },

        showRemoveDeviceModal: function(deviceId, deviceName, username, currentPassword, isLastDevice = false) {
            return new Promise((resolve, reject) => {
                // CREATE modal dynamically instead of checking if it exists
                const existingModal = document.getElementById('tfa-remove-device-modal');
                if (existingModal) {
                    existingModal.remove();
                }

                const modalHtml = `
                    <div id="tfa-remove-device-modal" class="tfa-critical-modal" style="display: flex;">
                        <div class="tfa-critical-modal-content">
                            <div class="tfa-modal-header">
                                <h3 class="tfa-modal-title">🗑️ Remove Device</h3>
                                <button class="tfa-modal-close" onclick="TwoFactorLib.closeRemoveDeviceModal()">×</button>
                            </div>
                            <div class="tfa-modal-body">
                                ${isLastDevice ? `
                                    <div class="tfa-warning-box">
                                        <div class="tfa-warning-icon">⚠️</div>
                                        <div class="tfa-warning-content">
                                            <div class="tfa-warning-title">Last Device Warning</div>
                                            <p class="tfa-warning-text">This is your last device. Removing it will completely disable 2FA for your account.</p>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="tfa-form-group">
                                    <label class="tfa-form-label">Username</label>
                                    <div class="tfa-readonly-field">${username}</div>
                                </div>
                                
                                <div class="tfa-form-group">
                                    <label class="tfa-form-label">Device to Remove</label>
                                    <div class="tfa-readonly-field">${deviceName}</div>
                                </div>
                                
                                <form id="tfa-remove-device-form">
                                    <div class="tfa-form-group">
                                        <label class="tfa-form-label" for="tfa-remove-password">Original Password *</label>
                                        <input type="password" id="tfa-remove-password" class="tfa-form-input" 
                                            placeholder="Enter your original login password" required>
                                        <div class="tfa-form-help">Enter the password you use to login (not your 2FA code)</div>
                                    </div>
                                    
                                    <div class="tfa-modal-actions">
                                        <button type="button" class="tfa-btn-cancel" onclick="TwoFactorLib.closeRemoveDeviceModal()">
                                            Cancel
                                        </button>
                                        <button type="submit" class="tfa-btn-danger">
                                            <span id="tfa-remove-btn-text">${isLastDevice ? 'Remove & Disable 2FA' : 'Remove Device'}</span>
                                            <span id="tfa-remove-spinner" class="tfa-spinner" style="display: none; margin-left: 8px;"></span>
                                        </button>
                                    </div>
                                </form>
                                
                                <div id="tfa-remove-error" class="tfa-error-message"></div>
                            </div>
                        </div>
                    </div>
                `;

                document.body.insertAdjacentHTML('beforeend', modalHtml);

                const form = document.getElementById('tfa-remove-device-form');
                const passwordInput = document.getElementById('tfa-remove-password');
                
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    
                    const originalPassword = passwordInput.value.trim();
                    if (!originalPassword) {
                        TwoFactorLib.showRemoveError('Original password is required');
                        return;
                    }

                    TwoFactorLib.setRemoveLoading(true);
                    TwoFactorLib.hideRemoveError();

                    try {
                        const result = await apiRequest('POST', '/devices/remove', username, originalPassword, {
                            deviceId: deviceId,
                            confirmDelete: isLastDevice
                        });

                        if (result.success) {
                            TwoFactorLib.closeRemoveDeviceModal();
                            resolve({
                                success: true,
                                message: result.message || 'Device removed successfully',
                                data: result,
                                twoFactorDisabled: result.twoFactorDisabled || false
                            });
                        }
                    } catch (error) {
                        if (error.message.includes('This is your last device') && !isLastDevice) {
                            if (confirm(`⚠️ WARNING: This is your last device. Removing it will completely disable 2FA for your account.\n\nAre you sure you want to continue?`)) {
                                try {
                                    const confirmResult = await apiRequest('POST', '/devices/remove', username, originalPassword, {
                                        deviceId: deviceId,
                                        confirmDelete: true
                                    });
                                    
                                    if (confirmResult.success) {
                                        TwoFactorLib.closeRemoveDeviceModal();
                                        resolve({
                                            success: true,
                                            message: 'Last device removed and 2FA disabled successfully',
                                            data: confirmResult,
                                            twoFactorDisabled: true
                                        });
                                    }
                                } catch (confirmError) {
                                    TwoFactorLib.showRemoveError('Failed to remove device: ' + confirmError.message);
                                }
                            }
                        } else {
                            TwoFactorLib.showRemoveError('Failed to remove device: ' + error.message);
                        }
                    } finally {
                        TwoFactorLib.setRemoveLoading(false);
                    }
                };

                // Focus password input
                setTimeout(() => passwordInput.focus(), 100);
                
                // Cleanup function for modal close
                window.twoFactorRemoveCleanup = () => {
                    reject(new Error('Operation cancelled'));
                };
            });
        },

        showDisable2FAModal: function(username, currentPassword) {
            return new Promise((resolve, reject) => {
                // CREATE modal dynamically instead of checking if it exists
                const existingModal = document.getElementById('tfa-disable-2fa-modal');
                if (existingModal) {
                    existingModal.remove();
                }

                const modalHtml = `
                    <div id="tfa-disable-2fa-modal" class="tfa-critical-modal" style="display: flex;">
                        <div class="tfa-critical-modal-content">
                            <div class="tfa-modal-header">
                                <h3 class="tfa-modal-title">🔓 Disable Two-Factor Authentication</h3>
                                <button class="tfa-modal-close" onclick="TwoFactorLib.closeDisable2FAModal()">×</button>
                            </div>
                            <div class="tfa-modal-body">
                                <div class="tfa-warning-box">
                                    <div class="tfa-warning-icon">⚠️</div>
                                    <div class="tfa-warning-content">
                                        <div class="tfa-warning-title">Security Warning</div>
                                        <p class="tfa-warning-text">Disabling 2FA will make your account significantly less secure. All devices will be removed.</p>
                                    </div>
                                </div>
                                
                                <div class="tfa-form-group">
                                    <label class="tfa-form-label">Username</label>
                                    <div class="tfa-readonly-field">${username}</div>
                                </div>
                                
                                <form id="tfa-disable-2fa-form">
                                    <div class="tfa-form-group">
                                        <label class="tfa-form-label" for="tfa-disable-password">Original Password *</label>
                                        <input type="password" id="tfa-disable-password" class="tfa-form-input" 
                                            placeholder="Enter your original login password" required>
                                        <div class="tfa-form-help">Enter the password you use to login (not your 2FA code)</div>
                                    </div>
                                    
                                    <div class="tfa-modal-actions">
                                        <button type="button" class="tfa-btn-cancel" onclick="TwoFactorLib.closeDisable2FAModal()">
                                            Cancel
                                        </button>
                                        <button type="submit" class="tfa-btn-danger">
                                            <span id="tfa-disable-btn-text">Disable 2FA</span>
                                            <span id="tfa-disable-spinner" class="tfa-spinner" style="display: none; margin-left: 8px;"></span>
                                        </button>
                                    </div>
                                </form>
                                
                                <div id="tfa-disable-error" class="tfa-error-message"></div>
                            </div>
                        </div>
                    </div>
                `;

                document.body.insertAdjacentHTML('beforeend', modalHtml);

                const form = document.getElementById('tfa-disable-2fa-form');
                const passwordInput = document.getElementById('tfa-disable-password');
                
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    
                    const originalPassword = passwordInput.value.trim();
                    if (!originalPassword) {
                        TwoFactorLib.showDisableError('Original password is required');
                        return;
                    }

                    // Double confirmation for this critical operation
                    if (!confirm('⚠️ FINAL WARNING: Are you absolutely sure you want to disable Two-Factor Authentication?\n\nThis will make your account significantly less secure.')) {
                        return;
                    }

                    TwoFactorLib.setDisableLoading(true);
                    TwoFactorLib.hideDisableError();

                    try {
                        const result = await apiRequest('POST', '/auth/disable-2fa', username, originalPassword);

                        if (result.success) {
                            TwoFactorLib.closeDisable2FAModal();
                            resolve({
                                success: true,
                                message: result.message || '2FA disabled successfully',
                                data: result
                            });
                        }
                    } catch (error) {
                        TwoFactorLib.showDisableError('Failed to disable 2FA: ' + error.message);
                    } finally {
                        TwoFactorLib.setDisableLoading(false);
                    }
                };

                // Focus password input
                setTimeout(() => passwordInput.focus(), 100);
                
                // Cleanup function for modal close
                window.twoFactorDisableCleanup = () => {
                    reject(new Error('Operation cancelled'));
                };
            });
        },


        closeRemoveDeviceModal: function() {
            const modal = document.getElementById('tfa-remove-device-modal');
            if (modal) {
                modal.remove();
                if (window.twoFactorRemoveCleanup) {
                    window.twoFactorRemoveCleanup();
                    window.twoFactorRemoveCleanup = null;
                }
            }
        },

        closeDisable2FAModal: function() {
            const modal = document.getElementById('tfa-disable-2fa-modal');
            if (modal) {
                modal.remove();
                if (window.twoFactorDisableCleanup) {
                    window.twoFactorDisableCleanup();
                    window.twoFactorDisableCleanup = null;
                }
            }
        },

        showRemoveError: function(message) {
            const errorDiv = document.getElementById('tfa-remove-error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
        },

        hideRemoveError: function() {
            const errorDiv = document.getElementById('tfa-remove-error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        },

        setRemoveLoading: function(loading) {
            const btnText = document.getElementById('tfa-remove-btn-text');
            const spinner = document.getElementById('tfa-remove-spinner');
            const submitBtn = document.querySelector('#tfa-remove-device-form button[type="submit"]');
            
            if (btnText && spinner && submitBtn) {
                if (loading) {
                    submitBtn.disabled = true;
                    spinner.style.display = 'inline-block';
                } else {
                    submitBtn.disabled = false;
                    spinner.style.display = 'none';
                }
            }
        },

        showDisableError: function(message) {
            const errorDiv = document.getElementById('tfa-disable-error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
        },

        hideDisableError: function() {
            const errorDiv = document.getElementById('tfa-disable-error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        },

        setDisableLoading: function(loading) {
            const btnText = document.getElementById('tfa-disable-btn-text');
            const spinner = document.getElementById('tfa-disable-spinner');
            const submitBtn = document.querySelector('#tfa-disable-2fa-form button[type="submit"]');
            
            if (btnText && spinner && submitBtn) {
                if (loading) {
                    submitBtn.disabled = true;
                    spinner.style.display = 'inline-block';
                } else {
                    submitBtn.disabled = false;
                    spinner.style.display = 'none';
                }
            }
        },

        // Check if device is the last active device for user
        isLastActiveDevice: async function(username, password) {
            try {
                const devicesList = await apiRequest('POST', '/devices/list', username, password);
                return devicesList.devices && devicesList.devices.length <= 1;
            } catch (error) {
                console.warn('Could not check if last device:', error);
                return false;
            }
        }
    };

    globalObject.TwoFactorLib = TwoFactorLib;

    // Logs for debugging
    console.log('🔧 TwoFactorLib loaded successfully ');
    console.log('🌐 API Base URL:', getBaseUrl());
    console.log('📱 Detected Device:', detectDevice());
    console.log(' All endpoints secured with POST + credentials');

})();