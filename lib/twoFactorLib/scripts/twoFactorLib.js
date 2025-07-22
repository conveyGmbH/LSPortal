/*twoFactorLib.js - 2FA Integration for LeadSuccess Portal */

(function () {
    "use strict";

    // =============================================================================
    // CONFIGURATION ET VARIABLES GLOBALES
    // =============================================================================
    const query = (typeof getQueryStringParameters === "function") ? getQueryStringParameters() : null;
    let nodeHostname = null;
    if (query && query.nodeHost) {
        nodeHostname = query.nodeHost;
    }
    let API_HOSTNAME = "deimos.convey.de"; //  per default DEIMOS
    let getBaseUrl = function() {
        return 'https://' + (nodeHostname ? nodeHostname : API_HOSTNAME) + '/2fabackend/api/v1'
    };

    let currentSession = {
        username: null,
        sessionToken: null,
        userPassword: null,
        setupData: null,
        activeContainer: null,
        setPasswordCallback: null
    };

    let globalObject = typeof window !== 'undefined' ? window :
        typeof self !== 'undefined' ? self :
         typeof global !== 'undefined' ? global : {};

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    function getStoredPassword() {
        // Check session for password
        if (currentSession.userPassword) {
            console.log('Password found in session');
            return currentSession.userPassword;
        }

        try {
            const loginData = localStorage.getItem('loginData');
            if (loginData) {
                const parsed = JSON.parse(loginData);
                if (parsed.password) {
                    console.log('Password found in localStorage');
                    return parsed.password;
                }
            }
        } catch (e) {
            console.warn('Could not parse loginData from localStorage:', e);
        }

        //  AppData - check for persistent states Winjs
        if (typeof AppData !== 'undefined' && AppData._persistentStates && AppData._persistentStates.odata) {
            if (AppData._persistentStates.odata.password) {
                console.log('Password found in AppData');
                return AppData._persistentStates.odata.password;
            }
        }
        console.warn('No password found in any source');
        return null;
    }

    /* DB Request Function  */
    async function apiRequest(method, endpoint, data = null) {
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
            
            // Get response text first to handle both JSON and HTML responses
            const responseText = await response.text();
            
            // Check if response is JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                // If not JSON, it might be an HTML error page
                console.error(' Non-JSON response received:', responseText.substring(0, 200));
                
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


    /* Convertit a standard Promise to WinJS Promise */
    function toWinJSPromise(promise) {
        if (typeof WinJS !== 'undefined' && WinJS.Promise) {
            return new WinJS.Promise(function (complete, error) {
                promise.then(complete).catch(error);
            });
        }
        return promise;
    }

    /* Icon detection based on device info */
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

    /* detect If currentDevice corresponding to the current user agent */
    function detectIfCurrentDevice(deviceInfo) {
        const currentUA = navigator.userAgent;
        const deviceInfoLower = deviceInfo.toLowerCase();

        if (deviceInfoLower.includes('chrome') && currentUA.includes('Chrome')) return true;
        if (deviceInfoLower.includes('firefox') && currentUA.includes('Firefox')) return true;
        if (deviceInfoLower.includes('safari') && currentUA.includes('Safari') && !currentUA.includes('Chrome')) return true;
        if (deviceInfoLower.includes('edge') && currentUA.includes('Edge')) return true;

        return false;
    }

    /*Error handling functions */
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

    /* Error message success */

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

    /* Detect device type */
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
    `;

        document.head.appendChild(style);
        console.log(' 2FA CSS injected');
    }

    // =============================================================================
    // MODAL MANAGEMENT
    // =============================================================================

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

    // =============================================================================
    // GENERATE MAIN INTERFACE
    // =============================================================================

    /* Create the main 2FA management interface */
    async function createMainInterface(container, username, userData = {}) {
        try {
            console.log('🔧 Creating 2FA interface for:', username);
            currentSession.username = username;
            currentSession.activeContainer = container;

            container.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #e9ecef; border-radius: 4px;">
                <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
                <p style="margin: 0; color: #333;">Loading 2FA status...</p>
            </div>
        `;

            const status = await apiRequest('POST', '/auth/status', { username });

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
                btn.onclick = () => switchTab(btn.dataset.tab, container, username, status);
            });

            // Change to overview tab by default
            await switchTab('overview', container, username, status);
            console.log(' Main interface created successfully');

        } catch (error) {
            console.error(' Error creating 2FA interface:', error);
            container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                <div style="font-size: 32px; margin-bottom: 10px;"></div>
                <h3>2FA Service Unavailable</h3>
                <p>Unable to load 2FA interface: ${error.message}</p>
            </div>
        `;
            throw error;
        }
    }

    /* Switch between tabs in the 2FA interface */
    async function switchTab(tabId, container, username, userData) {
        try {
            console.log('🔧 Switching to tab:', tabId);

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
                    await loadOverviewTab(tabContent, username, userData);
                    break;
                case 'devices':
                    await loadDevicesTab(tabContent, username, userData);
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

    /* load Overview Tab with user data and status */
    async function loadOverviewTab(container, username, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading overview...</div>';

        try {
            const status = await apiRequest('POST', '/auth/status', { username });

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
                            <button onclick="TwoFactorLib.enable2FA('${username}')" 
                                    class="tfa-btn-primary" style="font-size: 14px; padding: 12px 20px;">
                                🛡️ Enable 2FA
                            </button>
                        ` : `
                            <button onclick="TwoFactorLib.disable2FA('${username}')" 
                                    class="tfa-btn-danger" style="font-size: 12px; padding: 10px 16px;">
                                🔓 Disable 2FA
                            </button>
                        `}
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 4px;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">Test Controls</h4>
                    <button onclick="TwoFactorLib.testAPI().then(console.log)" 
                            class="tfa-btn-secondary" style="margin-right: 10px;">
                        🧪 Test API
                    </button>
                    <button onclick="location.reload()" class="tfa-btn-primary">
                        🔄 Refresh Page
                    </button>
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

    /* Load Devices Tab with user's authentication devices */
    async function loadDevicesTab(container, username, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading devices...</div>';

        try {
            const devices = await apiRequest('GET', `/devices/list/${username}`);

            let devicesHtml = `
            <div class="tfa-devices">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #333; font-size: 16px;">Authentication Devices</h3>
                    <button onclick="TwoFactorLib.addNewDevice('${username}')" class="tfa-btn-primary">
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
                                    <button onclick="TwoFactorLib.startEditDevice(${device.deviceId}, '${device.deviceInfo.replace(/'/g, '\\\'')}')" 
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
                            <button onclick="TwoFactorLib.removeDevice(${device.deviceId}, '${device.deviceInfo.replace(/'/g, '\\\'')}')" 
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
                    <button onclick="TwoFactorLib.enable2FA('${username}')" class="tfa-btn-primary" style="padding: 12px 24px;">
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

    /* Show the 2FA setup modal for the user to configure their 2FA settings. */
    async function show2FASetup(username) {
        try {
            console.log('🔧 Starting 2FA setup for:', username);

            // get password
            let password = getStoredPassword();
            if (!password) {
                throw new Error('No password available - please login first');
            }

            currentSession.userPassword = password;

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

            // Call API Setup
            const result = await apiRequest('POST', '/auth/setup-2fa', {
                username: username,
                password: password,
                deviceInfo: detectDevice()
            });

            if (result.success) {
                currentSession.setupData = result;

                // Update modal content with setup instructions
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
                        <p style="font-weight: bold; margin-bottom: 10px;"> CORRECTIONS APPLIQUÉES:</p>
                        <ol style="margin: 0; padding-left: 20px;">
                            <li>📱 Scan the QR code or enter the key manually</li>
                            <li>✏️ Enter a device name (minimum 3 characters)</li>
                            <li>🔢 Enter the 6-digit code</li>
                            <li>⚡ Auto-validation when both fields are complete</li>
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

                // Auto-validation when 6 digits are entered
                const form = document.getElementById('tfa-setup-form');
                const deviceNameInput = document.getElementById('tfa-device-name');
                const codeInput = document.getElementById('tfa-setup-code');
                const submitBtn = document.getElementById('tfa-setup-submit');

                // Fonction validation
                const validateForm = () => {
                    const deviceName = deviceNameInput.value.trim();
                    const code = codeInput.value.trim();
                    const isValid = deviceName.length >= 3 && /^\d{6}$/.test(code);

                    submitBtn.disabled = !isValid;
                    submitBtn.style.background = isValid ? '#007acc' : '#ccc';
                    submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
                };

                // Auto-Submit when both fields are valid
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
                    // Auto-submit when 6 digits entered
                    if (e.target.value.length === 6) {
                        autoSubmitIfValid();
                    }
                });
                deviceNameInput.focus();

                // Send form data to API on submit
                form.addEventListener("submit", async (e) => {
                  e.preventDefault();

                  const deviceName = deviceNameInput.value.trim();
                  const code = codeInput.value.trim();

                  if (deviceName.length < 3) {
                    TwoFactorLib.showSetupError(
                      "Device name must be at least 3 characters"
                    );
                    return;
                  }

                  if (!/^\d{6}$/.test(code)) {
                    TwoFactorLib.showSetupError(
                      "Please enter a valid 6-digit code"
                    );
                    return;
                  }

                  TwoFactorLib.setSetupLoading(true);
                  TwoFactorLib.hideSetupError();

                  try {
                    // Prepare request data
                    const requestData = {
                      totpCode: code,
                      deviceName: deviceName,
                    };

                    // Add sessionToken if we have one from the setup process
                    if (currentSession.setupData && currentSession.setupData.sessionToken) {
                      requestData.sessionToken =
                        currentSession.setupData.sessionToken;
                      console.log("Using setup sessionToken for verification");
                    } else {
                      // Fallback to username
                      requestData.username = username;
                      console.log("👤 Using username for setup verification");
                    }

                    const verifyResult = await apiRequest(
                      "POST",
                      "/auth/verify-2fa",
                      requestData
                    );

                    if (verifyResult.success) {
                      closeModal("tfa-setup-modal");

                      // Update password in main application AND persistent states
                      if ( verifyResult.dbPassword && currentSession.setPasswordCallback) {
                        currentSession.setPasswordCallback( verifyResult.dbPassword);
                        currentSession.userPassword = verifyResult.dbPassword;

                        // Update persistent states if available
                        if (typeof AppData !== "undefined" && AppData._persistentStates && AppData._persistentStates.odata) {
                          AppData._persistentStates.odata.password =  verifyResult.dbPassword;
                          console.log("Updated AppData password after 2FA device addition");
                        }
                      }

                      showSuccess(`Device "${deviceName}" has been successfully added to your account!`);

                      if (currentSession.activeContainer) {
                        setTimeout(async () => {
                          try {
                            await createMainInterface(currentSession.activeContainer, username);
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

    // =============================================================================
    // OBJET PRINCIPAL TWOFACTOR LIBRARY
    // =============================================================================

    let TwoFactorLib = {

        /* Entry point for the 2FA library */
        getStatus: function (root, username, setTokenPassword, language, hostName) {
            const promise = (async () => {
                try {
                    console.log('TwoFactorLib.getStatus called for user:', username, "hostName: ", hostName);
                    if (hostName) {
                        API_HOSTNAME = hostName;
                    }
                    injectCSS();

                    if (!root || !('innerHTML' in root)) {
                        throw new Error('Invalid root container element');
                    }

                    currentSession.setPasswordCallback = setTokenPassword;

                    root.innerHTML = '<div style="background: yellow; padding: 10px; color: black;">🧪 TFA Container Test - Loading interface...</div>';
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    await createMainInterface(root, username);
                    console.log('2FA interface created successfully');

                    return {
                        status: 'success',
                        message: '2FA interface loaded successfully',
                        username: username
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

        /* Check 2FA status only the login process  */
        verify2FA: function (root, username, setTokenPassword, language, hostName) {
            const promise = (async () => {
                try {
                    console.log('TwoFactorLib.verify2FA called for user:', username, 'hostName:', hostName);
                    if (hostName) {
                        API_HOSTNAME = hostName;
                    }
                    injectCSS();

                    currentSession.username = username;
                    currentSession.setPasswordCallback = setTokenPassword;

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

                        // Fonction pour récupérer le sessionToken le plus récent
                        const getLatestSessionToken = async (username) => {
                            try {
                                console.log('🔍 Searching for latest session token for user:', username);
                                
                                // Try to get sessionToken from status API
                                const statusResult = await apiRequest('POST', '/auth/status', { username });
                                if (statusResult && statusResult.sessionToken) {
                                    return statusResult.sessionToken;
                                }
                               
                                return null;
                                
                            } catch (error) {
                                console.warn('⚠️ Could not retrieve sessionToken:', error.message);
                                return null;
                            }
                        };

                        // Improved error message handler
                        const showError = (errorMessage) => {
                            let cleanMessage = errorMessage;
                            if (typeof errorMessage === 'string') {
                                // Remove HTML/DOCTYPE content
                                cleanMessage = errorMessage
                                    .replace(/<!DOCTYPE.*?>/gi, '')
                                    .replace(/<html.*?>.*?<\/html>/gis, '')
                                    .replace(/<.*?>/g, '')
                                    .trim();
                                
                                // If the cleaned message is empty or too long, use a generic message
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
                                // Try to get sessionToken first
                                const sessionToken = await getLatestSessionToken(username);
                                
                                const requestData = {
                                    totpCode: code
                                };

                                // Add either sessionToken or username
                                if (sessionToken) {
                                    requestData.sessionToken = sessionToken;
                                    console.log('Using sessionToken for verification');
                                } else {
                                    requestData.username = username;
                                    console.log('👤 Using username for verification');
                                }

                                const result = await apiRequest('POST', '/auth/verify-2fa', requestData);

                                if (result.success) {
                                    if (result.dbPassword && setTokenPassword) {
                                        setTokenPassword(result.dbPassword);
                                        console.log('DBPassword set successfully');
                                    }

                                    document.getElementById('tfa-verify-modal').remove();
                                    resolve({
                                        status: 'success',
                                        message: '2FA verification successful',
                                        data: result
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

                        // Auto-submit when 6 digits are entered
                        codeInput.oninput = () => {
                            if (codeInput.value.length === 6 && !submitBtn.disabled) {
                                setTimeout(() => verifyForm.dispatchEvent(new Event('submit')), 100);
                            }
                        };

                        // Escape key handler
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
        
        
        
        /* Activate 2FA */
        enable2FA: async function (username) {
            try {
                await show2FASetup(username);
            } catch (error) {
                if (error.message !== 'Setup cancelled') {
                    showError('Failed to enable 2FA: ' + error.message);
                }
            }
        },

        /* Disabled 2FA */
        disable2FA: async function (username) {
            try {
                if (!confirm('Are you sure you want to disable Two-Factor Authentication?\n\nThis will make your account less secure.')) {
                    return;
                }

                let password = getStoredPassword();
                if (!password) {
                    showError('No password available - please login first');
                    return;
                }

                const result = await apiRequest('POST', '/auth/disable-2fa', {
                    username: username,
                    password: password
                });

                if (result.success) {
                    showSuccess('2FA disabled successfully!');

                    if (currentSession.activeContainer) {
                        await createMainInterface(currentSession.activeContainer, username);
                    }
                }
            } catch (error) {
                showError('Failed to disable 2FA: ' + error.message);
            }
        },

        /* Add a new device */
        addNewDevice: async function (username) {
            try {
                await show2FASetup(username);
            } catch (error) {
                if (error.message !== 'Setup cancelled') {
                    showError('Failed to add device: ' + error.message);
                }
            }
        },

        /* Remove a device */
        removeDevice: async function (deviceId, deviceName) {
            try {
                if (!confirm(`Are you sure you want to remove the device "${deviceName}"?\n\nThis action cannot be undone.`)) {
                    return;
                }

                let password = getStoredPassword();
                if (!password) {
                    showError('No password available - please login first');
                    return;
                }

                const result = await apiRequest('DELETE', `/devices/remove/${deviceId}`, {
                    username: currentSession.username,
                    password: password,
                    confirmDelete: false
                });

                if (result.success) {
                    showSuccess('Device removed successfully!');

                    if (currentSession.activeContainer) {
                        await createMainInterface(currentSession.activeContainer, currentSession.username);
                    }
                }
            } catch (error) {
                if (error.message.includes('This is your last device')) {
                    if (confirm(`This is your last device. Removing it will disable 2FA completely.\n\nAre you sure you want to continue?`)) {
                        try {
                            let password = getStoredPassword();
                            const result = await apiRequest('DELETE', `/devices/remove/${deviceId}`, {
                                username: currentSession.username,
                                password: password,
                                confirmDelete: true
                            });

                            if (result.success) {
                                showSuccess('Last device removed and 2FA disabled successfully!');

                                if (currentSession.activeContainer) {
                                    await createMainInterface(currentSession.activeContainer, currentSession.username);
                                }
                            }
                        } catch (secondError) {
                            showError('Failed to remove device: ' + secondError.message);
                        }
                    }
                } else {
                    showError('Failed to remove device: ' + error.message);
                }
            }
        },

        /* Allows the user to edit the name of an authentication device */
        startEditDevice: function (deviceId, currentName) {
            const nameElement = document.getElementById(`deviceName-${deviceId}`);
            if (!nameElement) return;

            // Input element for editing
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
                        let password = getStoredPassword();
                        if (!password) {
                            showError('No password available - please login first');
                            restoreOriginalName();
                            return;
                        }

                        const result = await apiRequest('PUT', `/devices/rename/${deviceId}`, {
                            username: currentSession.username,
                            password: password,
                            newDeviceName: newName
                        });

                        if (result.success) {
                            showSuccess(`Device renamed to "${newName}"`);

                            if (currentSession.activeContainer) {
                                await createMainInterface(currentSession.activeContainer, currentSession.username);
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

            // Save/cancel events
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

        /* Test API connectivity.
         * This function checks if the API is reachable and returns the status.
         */
        testAPI: async function () {
            try {
                console.log('🧪 Testing API connectivity...');
                const response = await fetch(`${getBaseUrl()}/health`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(10000)
                });

                const result = await response.json();
                console.log(' API Test Result:', { status: response.status, ok: response.ok, result });

                return {
                    success: response.ok,
                    status: response.status,
                    data: result
                };
            } catch (error) {
                console.error(' API Test Failed:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        /* Clear the 2FA interface and reset the session.
         * This function clears the current 2FA interface and resets the session data.
         */
        clear: function (root) {
            try {
                if (root && 'innerHTML' in root) {
                    root.innerHTML = '';
                    closeAllModals();
                    currentSession = {
                        username: null,
                        sessionToken: null,
                        userPassword: null,
                        setupData: null,
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

        // Function to close the 2FA setup modal
        closeSetupModal: function () {
            closeModal('tfa-setup-modal');
        },

        // Fonction helper to get the stored password from the session
        setSessionPassword: function (password) {
            currentSession.userPassword = password;
            console.log('🔧 Session password stored for 2FA operations');
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
        }
    };

    globalObject.TwoFactorLib = TwoFactorLib;

    // Logs for debugging
    console.log('🔧 TwoFactorLib loaded successfully');
    console.log('🌐 API Base URL:', getBaseUrl());
    console.log('📱 Detected Device:', detectDevice());

})();