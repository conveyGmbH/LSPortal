// twoFactorLib.js - 2FA Integration for LeadSuccess Portal 

(function () {
    "use strict";

    // Global configuration
    let currentSession = {
        activeContainer: null,
        setPasswordCallback: null,
    };


    // API configuration
    const query = (typeof getQueryStringParameters === "function") ? getQueryStringParameters() : null;
    let nodeHostname = null;
    if (query && query.nodeHost) {
        nodeHostname = query.nodeHost;
    }

    // API_HOSTNAME ist nur als Fallback (also vermutlich gar nicht) verwendet
    let API_HOSTNAME = "deimos.convey.de"; // DEIMOS Server
    let API_HOSTNAME_NEW = "deimos.convey.de"; // main.germanywestcentral.cloudapp.azure.com
    let getBaseUrl = function() {
        return 'https://' + (nodeHostname ? nodeHostname : API_HOSTNAME) + '/2fabackend/api/v1';
    };


    let globalObject = typeof window !== 'undefined' ? window :
        typeof self !== 'undefined' ? self :
         typeof global !== 'undefined' ? global : {};

    // UTILY FUNCTIONS

    // API Request
    async function apiRequest(method, endpoint, username, password, extraData = {}) {

        // Always include credentials in request
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
            signal: AbortSignal.timeout(20000)
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseText = await response.text();

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {

                // Handle HTML error responses
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

            console.log(' API Request successful:', { status: response.status, endpoint});
            return result;

        } catch (error) {
            console.error(' 2FA API Request Error:', error);
            
            // Improve error messages based on error type
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your internet connection');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error - cannot reach 2FA service');
            } else {
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

    // Icon detection based on device info (Font Awesome, theme-safe)
    function getDeviceIcon(deviceInfo) {
        const info = deviceInfo.toLowerCase();
        let icon = 'fa-mobile-screen-button';
        if (info.includes('iphone') || info.includes('ios') || info.includes('android') || info.includes('mobile')) {
            icon = 'fa-mobile-screen-button';
        } else if (info.includes('tablet') || info.includes('ipad')) {
            icon = 'fa-tablet-screen-button';
        } else if (info.includes('windows') || info.includes('linux')) {
            icon = 'fa-laptop';
        } else if (info.includes('mac') || info.includes('macos')) {
            icon = 'fa-desktop';
        } else if (info.includes('chrome') || info.includes('firefox') || info.includes('safari') || info.includes('edge')) {
            icon = 'fa-globe';
        }
        return `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
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

    // Success toast (token-styled, light+dark)
    function showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'tfa-toast';
        notification.setAttribute('role', 'status');
        notification.innerHTML = '<span class="tfa-toast-icon" aria-hidden="true"><i class="fa-solid fa-circle-check"></i></span>';
        const text = document.createElement('span');
        text.textContent = message;
        notification.appendChild(text);
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
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


    // LOCALISATION
    
    // Function to retrieve localized texts
    function getResourceText(key) {
        if (typeof window.getResourceText === 'function') {
            return window.getResourceText(key);
        }

        // English fallback if the function doesn't exist
        const fallbacks = {
            // [GENERAL]
            "tfa.title": "Two-Factor Authentication",
            "tfa.loading": "Loading Two-Factor Authentication...",
            "tfa.success": "Two-Factor Authentication successful.",
            "tfa.error": "Two-Factor Authentication failed.",
            "tfa.overview": "Overview",
            "tfa.Loading2FAStatus": "Loading 2FA status...",
            "tfa.statusUnavailable": "2FA Service Unavailable",
            "tfa.statusLoadMessage": "Unable to load 2FA interface:",
            
            // // [STATUS Message]
            "tfa.statusEnabled": "2FA is enabled",
            "tfa.statusDisabled": "2FA is disabled",
            "tfa.statusSecured": "Account Secured",
            "tfa.statusEnableForSecurity": "Enable 2FA for Security",
            "tfa.2faActive": "Active",
            "tfa.2faInactive": "Inactive",
            "tfa.2FAStatus": "2FA Status",

            // [TABS]
            "tfa.tabOverview": "Overview",
            "tfa.tabDevices": "Devices",
            "tfa.tabOverviewAccountInfos": "Account Information",
            "tfa.tabOverviewStatus": "Status",
            "tfa.tabOverviewActiveDevices": "Active Devices",
            "tfa.tabLoadAuthDevicesTab": "Authentication Devices",
            "tfa.tabloadOverviewTab": "Loading overview...",
            "tfa.tabloadOverviewErrorTab": "Error loading overview",
            "tfa.tabLoadingDevice": "Loading devices...",
            "tfa.noDevicesMessage": "No devices configured yet. Add your first authentication device to secure your account",
                
            // [BUTTONS]
            'tfa.btnEnable': 'Enable 2FA',
            'tfa.btnDisable': 'Disable 2FA',
            'tfa.btnSetup': 'Setup',
            'tfa.btnCancel': 'Cancel',
            'tfa.btnConfirm': 'Confirm',
            'tfa.btnContinue': 'Continue',
            'tfa.btnBack': 'Back',
            'tfa.btnRetry': 'Retry',
            'tfa.btnAddDevice': "Add Device", 
            'tfa.btnRemove': "Remove",
            'tfa.btnClose': "Close",
            'tfa.btnVerify': "Verify",
            'tfa.btnRemoveDisable': "Remove & Disable 2FA",
            
            // [SETUP PROCESS]
            'tfa.setupTitle': 'Setup 2FA',
            'tfa.setupInstruction': 'Scan the QR code with your authenticator app',
            'tfa.setupManualKey': 'Manual key:',
            'tfa.setupEnterCode': 'Enter the 6-digit code:',
            'tfa.setupStep1': 'Step 1: Install an authenticator app',
            'tfa.setupStep2': 'Step 2: Scan QR code or enter manual key',
            'tfa.setupStep3': 'Step 3: Enter verification code',
            'tfa.setupAppSuggestions': 'Recommended apps: Google Authenticator, Microsoft Authenticator, Authy',
            "tfa.deviceNameLabel": "Device Name",
            "tfa.deviceNamePlaceholder": "e.g., John's iPhone, Work Laptop",
            "tfa.deviceNameHelp": "Choose a name to identify this device",
            "tfa.showSetupErrorDeviceName" : "Device name must be at least 3 characters",
            "tfa.showSetupErrorDeviceCode" : "Please enter a valid 6-digit code",
            "tfa.setupLoading": "Setting up 2FA...",
            "tfa.setupComplete": "Setup complete!",
            
            // [VERIFICATION]
            'tfa.verifyTitle': 'Enter 2FA Code',
            'tfa.verifyInstruction': 'Enter the 6-digit code from your authenticator app:',
            'tfa.verifyPlaceholder': '000000',
            'tfa.verifyInputLabel': '6-digit code',
            "tfa.verifying": "Verifying...",
            
            // [DISABLE PROCESS]
            'tfa.disableTitle': 'Disable 2FA',
            'tfa.disableWarning': 'Disabling 2FA will make your account less secure.',
            'tfa.disableConfirmation': 'Are you sure you want to disable Two-Factor Authentication?',
            'tfa.disableEnterPassword': 'Enter your password to confirm:',
            'tfa.disableEnterCode': 'Enter your current 2FA code to confirm:',
            "tfa.originalPasswordLabel": "Password *",
            "tfa.originalPasswordPlaceholder": "Enter your password to confirm",
            "tfa.lastDeviceWarningTitle": "Last Device Warning",
            "tfa.lastDeviceWarningText": "This is your last device. Removing it will completely disable 2FA for your account.",
            "tfa.deviceName":"Device Name",
            
            // [ERRORS MESSAGES]
            'tfa.errorInvalidCode': 'Invalid code. Please try again.',
            'tfa.errorExpiredCode': 'Code has expired. Please generate a new one.',
            'tfa.errorSetupFailed': '2FA setup failed',
            'tfa.errorVerifyFailed': '2FA verification failed',
            'tfa.errorDisableFailed': 'Failed to disable 2FA',
            'tfa.errorNetworkError': 'Network error. Please check your connection.',
            'tfa.errorServerError': 'Server error. Please try again later.',
            'tfa.errorInvalidPassword': 'Invalid password.',
            'tfa.errorTooManyAttempts': 'Too many failed attempts. Please try again later.',
            "tfa.serviceError": "Service Error", 
            "tfa.interfaceLoadError": "Interface Load Error", 
            "tfa.setupFailed": "Failed to set up 2FA", 
            "tfa.setupFailedWithError": "Failed to set up 2FA: {error}", 
            "tfa.verificationFailed": "Verification failed", 
            "tfa.invalidCode": "Invalid verification code", 
            "tfa.sessionExpired": "Session expired. Please try again", 
            "tfa.networkError": "Network error. Please check your connection", 
            "tfa.unexpectedError": "An unexpected error occurred", 
            "tfa.errorDigitalCode": "Please enter a 6-digit code", 
            "tfa.enableFailed": "Failed to enable 2FA...", 
            "tfa.addDeviceFailed": "Failed to add device", 
            "tfa.removeDeviceFailed": "Failed to remove device", 
            "tfa.renameDeviceFailed": "Failed to rename device", 
            "tfa.copyFailed": "Failed to copy to clipboard", 
            "tfa.passwordRequired": "Your password is required", 
            "tfa.devicesLoadError": "Error loading devices", 
            
            //  [SUCCESS MESSAGES]
            'tfa.successEnabled': '2FA successfully enabled',
            'tfa.successDisabled': '2FA successfully disabled',
            'tfa.successVerified': 'Code verified successfully',
            'tfa.successSetupComplete': '2FA setup completed successfully',
            "tfa.disabledSuccessUpdating": "2FA disabled successfully! Updating permissions...",
            "tfa.disabledSuccess": "2FA disabled successfully!",
            "tfa.lastDeviceRemovedUpdating":"Last device removed and 2FA disabled! Updating permissions...",
            "tfa.lastDeviceRemovedSuccess":"Last device removed and 2FA disabled successfully!",
            "tfa.deviceRemoved":"Device",
            "tfa.successfully":"removed successfully",
            "tfa.deviceRenamed":"Device renamed to",
            "tfa.deviceAddedSuccess": "Device",
            "tfa.updatingPermissions": "has been successfully added! Updating permissions...",
            "tfa.copiedToClipboard":"Copied to clipboard!",
            
            // [INFOS MESSAGES]
            'tfa.infoBackupCodes': 'Save these backup codes in a safe place:',
            'tfa.infoQrCodeAlt': 'QR Code for 2FA setup',
            'tfa.infoManualEntry': 'If you cannot scan the QR code, enter this key manually:',
            'tfa.infoTimeSync': 'Make sure your device time is synchronized',
            'tfa.infoKeepAppOpen': 'Keep your authenticator app open during setup',
            
            // [INFOS MESSAGES]Backup codes
            'tfa.backupTitle': 'Backup Codes',
            'tfa.backupDescription': 'These codes can be used if you lose access to your authenticator device.',
            'tfa.backupWarning': 'Each code can only be used once. Store them securely.',
            'tfa.backupDownload': 'Download Codes',
            'tfa.backupPrint': 'Print Codes',
            'tfa.backupCopy': 'Copy to Clipboard',
            
            // Help and instructions
            'tfa.helpWhatIs2FA': 'What is Two-Factor Authentication?',
            'tfa.help2FADescription': '2FA adds an extra layer of security by requiring a second verification step.',
            'tfa.helpTroubleshooting': 'Troubleshooting',
            'tfa.helpContactSupport': 'Contact Support',
            'tfa.helpFaq': 'Frequently Asked Questions',

            // [DEVICE MANAGEMENT]
            "tfa.currentDevice": "Current Device",
            "tfa.activeStatus": "Active", 
            "tfa.removeDeviceTitle": "Remove Device", 
            "tfa.editDeviceTitle": "Edit Device Name", 
            "tfa.deviceToRemove": "Device to Remove"

        };
        
        return fallbacks[key] || key;
    }

   
    // CSS INJECTION

    // The tenant accent (--ColorAccent) is set at runtime by the portal theme
    // engine and can be any CSS color format. CSS alone cannot derive alpha
    // tints from it without color-mix() (unavailable in older WebViews), so we
    // resolve it to "r, g, b" here and expose it as --tfa-accent-rgb for the
    // rgba(var(--tfa-accent-rgb), .x) tints in twoFactorLib.css.
    // All component styles now live in css/twoFactorLib.css (token layer).
    function injectCSS() {
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
                document.documentElement.style.setProperty('--tfa-accent-rgb', rgb.slice(0, 3).join(', '));
            }
        } catch (e) { /* keep the CSS fallback value */ }
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

            // Store only UI reference
            currentSession.activeContainer = container;

            container.innerHTML = `
                <div class="tfa-loading-block">
                    <span class="tfa-spinner" style="margin-bottom: 10px;"></span>
                    <p style="margin: 8px 0 0;">
                        ${getResourceText('tfa.Loading2FAStatus')}
                    </p>
                </div>
            `;

            // Pass credentials explicitly
            const status = await apiRequest('POST', '/auth/status', username, password);

            const interfaceHtml = `
                <div class="tfa-main-interface tfa-container">
                    <div class="tfa-header" style="text-align: center; margin-bottom: 20px;">
                        <span class="tfa-icon-badge ${status.is2FAEnabled ? 'tfa-icon-badge--on' : 'tfa-icon-badge--off'}" aria-hidden="true">
                            <i class="fa-solid ${status.is2FAEnabled ? 'fa-shield-halved' : 'fa-triangle-exclamation'}"></i>
                        </span>
                        <h2 style="margin: 0; font-size: 18px; font-weight: 700;">
                            ${getResourceText('tfa.title')} ${status.is2FAEnabled ? getResourceText('tfa.2faActive') : getResourceText('tfa.2faInactive')}
                        </h2>
                        <p style="margin: 6px 0 0; font-size: 14px; color: var(--tfa-text-2);">
                            ${getResourceText('account.login')}: <strong>${username}</strong>
                        </p>
                    </div>

                    <div style="text-align: center;">
                        <div class="tfa-tabs" role="tablist">
                            <button class="tfa-tab-btn active" role="tab" aria-selected="true" data-tab="overview"><i class="fa-solid fa-chart-simple" aria-hidden="true"></i> ${getResourceText('tfa.tabOverview')}</button>
                            <button class="tfa-tab-btn" role="tab" aria-selected="false" data-tab="devices"><i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i> ${getResourceText('tfa.tabDevices')}</button>
                        </div>
                    </div>
                    <div class="tfa-tab-content" id="tfa-tab-content" style="min-height: 200px;"></div>
                </div>
            `;
            container.innerHTML = interfaceHtml;

            // Event listeners with explicit credential passing
            const tabBtns = container.querySelectorAll('.tfa-tab-btn');
            tabBtns.forEach(btn => {
                btn.onclick = () => {
                    switchTab(btn.dataset.tab, container, username, password, status);
                };
            });

            await switchTab('overview', container, username, password, status);

        } catch (error) {
            console.error('Error creating 2FA interface:', error);
            container.innerHTML = `
                <div class="tfa-error-block">
                    <div style="font-size: 28px; margin-bottom: 10px;"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>
                    <h3>${getResourceText('tfa.statusUnavailable')}</h3>
                    <p>${getResourceText('tfa.statusLoadMessage')}: ${error.message}</p>
                </div>
            `;
            throw error;
        }
    }

    // Switch between tabs in the 2FA interface 
    async function switchTab(tabId, container, username, password, userData) {
        try {

            const tabBtns = container.querySelectorAll('.tfa-tab-btn');
            tabBtns.forEach(btn => {
                const isActive = btn.dataset.tab === tabId;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', String(isActive));
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
            console.error(`Error switching to tab ${tabId}:`, error);
            const tabContent = container.querySelector('#tfa-tab-content');
            if (tabContent) {
                tabContent.innerHTML = `
                    <div class="tfa-error-block">
                        <p>Error loading ${tabId} tab: ${error.message}</p>
                    </div>
                `;
            }
        }
    }

    // Load overview tab
    async function loadOverviewTab(container, username, password, userData) {
        container.innerHTML = `<div class="tfa-loading-block"><span class="tfa-spinner"></span><p style="margin: 8px 0 0;">${getResourceText('tfa.tabloadOverviewTab')}</p></div>`;

        try {

            // get user data from API with
            const status = await apiRequest('POST', '/auth/status', username, password);

            const overviewHtml = `
            <div class="tfa-overview">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="tfa-overview-card">
                        <h3>${getResourceText('tfa.tabOverviewAccountInfos')}</h3>
                        <div>
                            <div class="tfa-info-row">
                                <span class="tfa-info-label">${getResourceText('account.login')}:</span>
                                <span>${username}</span>
                            </div>
                            <div class="tfa-info-row">
                                <span class="tfa-info-label">${getResourceText('tfa.2FAStatus')}:</span>
                                <span class="tfa-status-pill ${status.is2FAEnabled ? 'tfa-status-pill--on' : 'tfa-status-pill--off'}">
                                    <i class="fa-solid ${status.is2FAEnabled ? 'fa-circle-check' : 'fa-circle-exclamation'}" aria-hidden="true"></i>
                                    ${status.is2FAEnabled ? getResourceText('tfa.statusEnabled') : getResourceText('tfa.statusDisabled')}
                                </span>
                            </div>
                            <div class="tfa-info-row">
                                <span class="tfa-info-label">${getResourceText('tfa.tabOverviewActiveDevices')}:</span>
                                <span style="font-weight: 700;">${status.activeDevices || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div class="tfa-overview-card" style="text-align: center;">
                        <h3>${getResourceText('tfa.statusEnableForSecurity')}</h3>
                        <span class="tfa-icon-badge ${status.is2FAEnabled ? 'tfa-icon-badge--on' : 'tfa-icon-badge--off'}" aria-hidden="true">
                            <i class="fa-solid ${status.is2FAEnabled ? 'fa-lock' : 'fa-triangle-exclamation'}"></i>
                        </span>
                        <div style="margin-bottom: 20px;">
                            <span class="tfa-status-pill ${status.is2FAEnabled ? 'tfa-status-pill--on' : 'tfa-status-pill--off'}">
                                ${status.is2FAEnabled ? getResourceText('tfa.statusSecured') : getResourceText('tfa.statusEnableForSecurity')}
                            </span>
                        </div>
                       ${!status.is2FAEnabled ? `
                            <button id="tfa-enable-btn" data-username="${username}" class="tfa-btn-primary">
                                <i class="fa-solid fa-shield-halved" aria-hidden="true"></i> ${getResourceText('tfa.btnEnable')}
                            </button>
                        ` : `
                            <button id="tfa-disable-btn" data-username="${username}" class="tfa-btn-danger" style="flex: none;">
                                <i class="fa-solid fa-unlock" aria-hidden="true"></i> ${getResourceText('tfa.btnDisable')}
                            </button>
                        `}
                    </div>
                </div>

            </div>
        `;

            container.innerHTML = overviewHtml;

            const enableBtn = container.querySelector('#tfa-enable-btn');
            const disableBtn = container.querySelector('#tfa-disable-btn');

            if (enableBtn) {
                enableBtn.onclick = () => {
                    TwoFactorLib.enable2FA(username, password);
                };
            }

            if (disableBtn) {
                disableBtn.onclick = () => {
                    TwoFactorLib.disable2FA(username, password);
                };
            }
        } catch (error) {
            console.error(' Error loading overview:', error);
            container.innerHTML = `
            <div class="tfa-error-block">
                 ${getResourceText('tfa.tabloadOverviewErrorTab')}: ${error.message}
            </div>
        `;
        }
    }


    async function loadDevicesTab(container, username, password, userData) {
        container.innerHTML = `<div class="tfa-loading-block"><span class="tfa-spinner"></span><p style="margin: 8px 0 0;">${getResourceText('tfa.tabLoadingDevice')}</p></div>`;


        try {
            // Pass credentials explicitly
            const devices = await apiRequest('POST', '/devices/list', username, password);

            let devicesHtml = `
                <div class="tfa-devices">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; flex-wrap: wrap;">
                        <h3 style="margin: 0; font-size: 15px; font-weight: 700;">
                        ${getResourceText('tfa.tabLoadAuthDevicesTab')}</h3>
                        <button id="tfa-add-device-btn" class="tfa-btn-primary">
                            <i class="fa-solid fa-plus" aria-hidden="true"></i> ${getResourceText('tfa.btnAddDevice')}
                        </button>
                    </div>
            `;

            if (devices.devices && devices.devices.length > 0) {
                devices.devices.forEach(device => {
                    const deviceIcon = getDeviceIcon(device.deviceInfo);
                    const isCurrentDevice = detectIfCurrentDevice(device.deviceInfo);
                    devicesHtml += `
                        <div class="tfa-device-item ${isCurrentDevice ? 'tfa-current-device' : ''}">
                            <div style="display: flex; align-items: center; min-width: 0;">
                                <span class="tfa-device-icon">${deviceIcon}</span>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px; display: flex; align-items: center; flex-wrap: wrap;">
                                        <span id="deviceName-${device.deviceId}">${device.deviceInfo}</span>
                                        ${isCurrentDevice ? `<span class="tfa-current-pill">${getResourceText('tfa.currentDevice')}</span>` : ''}
                                        <button class="tfa-edit-btn"
                                            data-device-id="${device.deviceId}"
                                            data-device-name="${device.deviceInfo}"
                                            title="${getResourceText('tfa.editDeviceTitle')}"
                                            aria-label="${getResourceText('tfa.editDeviceTitle')}">
                                            <i class="fa-solid fa-pen" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                    <div class="tfa-device-meta">
                                        ${device.authMethod} • ${getResourceText('tfa.activeStatus')}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 5px;">
                                <button class="tfa-remove-device-btn tfa-btn-danger" style="flex: none;"
                                        data-device-id="${device.deviceId}"
                                        data-device-name="${device.deviceInfo}"
                                        title="${getResourceText('tfa.removeDeviceTitle')}">
                                    <i class="fa-solid fa-trash-can" aria-hidden="true"></i> ${getResourceText('tfa.btnRemove')}
                                </button>
                            </div>
                        </div>
                    `;
                });
            } else {
                devicesHtml += `
                    <div class="tfa-empty">
                        <div class="tfa-empty-icon"><i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i></div>
                        <p style="margin: 0 0 20px; font-size: 14px;">${getResourceText('tfa.noDevicesMessage')}</p>
                    <button id="tfa-enable-empty-btn" class="tfa-btn-primary">
                        <i class="fa-solid fa-shield-halved" aria-hidden="true"></i> ${getResourceText('tfa.btnEnable')}
                    </button>
                    </div>
                `;
            }

            devicesHtml += '</div>';
            container.innerHTML = devicesHtml;

            // Button handlers with explicit credential passing
            const addBtn = container.querySelector('#tfa-add-device-btn');
            if (addBtn) {
                addBtn.onclick = () => {
                    TwoFactorLib.addNewDevice(username, password);
                };
            }

            const enableEmptyBtn = container.querySelector('#tfa-enable-empty-btn');
            if (enableEmptyBtn) {
                enableEmptyBtn.onclick = () => {
                    TwoFactorLib.enable2FA(username, password);
                };
            }

            const removeButtons = container.querySelectorAll('.tfa-remove-device-btn');
            removeButtons.forEach(btn => {
                btn.onclick = () => {
                    TwoFactorLib.removeDevice(
                        parseInt(btn.dataset.deviceId),
                        btn.dataset.deviceName,
                        username,
                        password
                    );
                };
            });

            const editButtons = container.querySelectorAll('.tfa-edit-btn');
            editButtons.forEach(btn => {
                btn.onclick = () => {
                    TwoFactorLib.startEditDevice(
                        parseInt(btn.dataset.deviceId),
                        btn.dataset.deviceName,
                        username,
                        password
                    );
                };
            });

        } catch (error) {
            container.innerHTML = `
                <div class="tfa-error-block">
                    ${getResourceText('tfa.devicesLoadError')}: ${error.message}
                </div>
            `;
        }
    }

    async function show2FASetup(username, password) {
        try {
            console.log('🔧 Starting 2FA setup for:', username);

            const existingModal = document.getElementById('tfa-setup-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Create setup modal
            const modalHtml = `
                <div id="tfa-setup-modal" class="tfa-modal-overlay tfa-container" style="display: none;">
                    <div class="tfa-modal" role="dialog" aria-modal="true" aria-labelledby="tfa-setup-title">
                        <div class="tfa-modal-header">
                            <h3 class="tfa-modal-title" id="tfa-setup-title">
                                <i class="fa-solid fa-qrcode" aria-hidden="true" style="color: var(--tfa-accent);"></i>
                                ${getResourceText('tfa.setupTitle')}
                            </h3>
                            <button class="tfa-modal-close" onclick="TwoFactorLib.closeSetupModal()" aria-label="${getResourceText('tfa.btnClose')}">
                                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div class="tfa-modal-body">
                            <div id="tfa-setup-content">
                                <div class="tfa-loading-block">
                                    <span class="tfa-spinner"></span>
                                    <p style="margin: 8px 0 0;">${getResourceText('tfa.setupLoading')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            showModal('tfa-setup-modal');
            
            // Pass credentials explicitly to setup endpoint
            const result = await apiRequest('POST', '/auth/setup-2fa', username, password, {
                deviceInfo: detectDevice()
            });

            if (result.success) {

                const setupSessionToken = result.sessionToken;

                // Update modal with QR code
                const setupContent = document.getElementById('tfa-setup-content');
                setupContent.innerHTML = `
                    <div style="text-align: center;">
                        <div class="tfa-qr-card">
                            <div class="tfa-qr-container">
                                <img src="${result.totpSetup.qrCodeDataURL}" alt="${getResourceText('tfa.infoQrCodeAlt')}">
                            </div>
                        </div>

                        <div class="tfa-manual-key">
                            <p style="margin: 0 0 10px 0; font-weight: 600; font-size: 13px;">${getResourceText('tfa.setupManualKey')}</p>
                            <code>${result.totpSetup.secret}</code>
                            <button onclick="TwoFactorLib.copyToClipboard('${result.totpSetup.secret}')"
                                    class="tfa-btn-secondary" style="margin-top: 10px;">
                                <i class="fa-solid fa-copy" aria-hidden="true"></i> ${getResourceText('tfa.backupCopy')}
                            </button>
                        </div>

                        <form id="tfa-setup-form" style="text-align: left;">
                            <div class="tfa-form-group">
                                <label class="tfa-form-label" for="tfa-device-name">${getResourceText('tfa.deviceName')} *</label>
                                <input type="text" id="tfa-device-name" class="tfa-input"
                                    placeholder="${getResourceText('tfa.deviceNamePlaceholder')}"
                                    required minlength="3" maxlength="50">
                                <small class="tfa-form-help">${getResourceText('tfa.deviceNameHelp')}</small>
                            </div>

                            <div class="tfa-form-group" style="margin-bottom: 20px;">
                                <label class="tfa-form-label" for="tfa-setup-code">${getResourceText('tfa.verifyInputLabel')}</label>
                                <input type="text" id="tfa-setup-code" class="tfa-input tfa-code-input"
                                     placeholder="${getResourceText('tfa.verifyPlaceholder')}" maxlength="6" pattern="[0-9]{6}" required
                                     inputmode="numeric" autocomplete="one-time-code">
                            </div>

                            <button type="submit" id="tfa-setup-submit" class="tfa-btn-primary" style="width: 100%;" disabled>
                                <span id="tfa-setup-btn-text">${getResourceText('tfa.btnEnable')}</span>
                                <span id="tfa-setup-spinner" class="tfa-spinner" style="display: none; margin-left: 10px;"></span>
                            </button>
                        </form>

                        <div id="tfa-setup-error" class="tfa-error-message" role="alert"></div>
                    </div>
                `;

                // Form validation
                const form = document.getElementById('tfa-setup-form');
                const deviceNameInput = document.getElementById('tfa-device-name');
                const codeInput = document.getElementById('tfa-setup-code');
                const submitBtn = document.getElementById('tfa-setup-submit');

                const validateForm = () => {
                    const deviceName = deviceNameInput.value.trim();
                    const code = codeInput.value.trim();
                    const isValid = deviceName.length >= 3 && /^\d{6}$/.test(code);

                    // Visual state handled by .tfa-btn-primary:disabled (tokens)
                    submitBtn.disabled = !isValid;
                };

                codeInput.addEventListener('input', () => {
                    validateForm();
                    // Auto-submit when 6 digits entered (Firefox compatible)
                    if (codeInput.value.length === 6 && !submitBtn.disabled) {
                        submitBtn.click();
                    }
                });

                codeInput.addEventListener('input', validateForm);

                // Form submission - pass credentials explicitly
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const deviceName = deviceNameInput.value.trim();
                    const code = codeInput.value.trim();

                    if (deviceName.length < 3) {
                        TwoFactorLib.showSetupError(getResourceText('tfa.showSetupErrorDeviceName'));
                        return;
                    }

                    if (!/^\d{6}$/.test(code)) {
                        TwoFactorLib.showSetupError(getResourceText('tfa.showSetupErrorDeviceCode'));
                        return;
                    }

                    TwoFactorLib.setSetupLoading(true);
                    TwoFactorLib.hideSetupError();

                    try {
                        // Pass credentials and setup data explicitly
                        const verifyResult = await apiRequest('POST', '/auth/verify-2fa', username, password, {
                            sessionToken: setupSessionToken,
                            totpCode: code,
                            deviceName: deviceName,
                            username: username
                        });

                        if (verifyResult.success) {
                            closeModal('tfa-setup-modal');

                            showSuccess(`${getResourceText('tfa.deviceAddedSuccess')} "${deviceName}" ${getResourceText('tfa.updatingPermissions')}`);

                            await new Promise(resolve => setTimeout(resolve, 1000));

                            // Notify app of DBPassword if available
                            if (typeof currentSession.setPasswordCallback === 'function' && verifyResult.dbPassword) {
                                currentSession.setPasswordCallback(verifyResult.dbPassword);
                            }

                            showSuccess(getResourceText('tfa.setupComplete'));

                            // Refresh interface with new password
                            if (currentSession.activeContainer) {
                                const newPassword = verifyResult.dbPassword || password;
                                await createMainInterface(currentSession.activeContainer, username, newPassword);
                            }
                    }
                    } catch (error) {
                        console.error('❌ Setup verification error:', error);
                        TwoFactorLib.showSetupError(error.message);
                        codeInput.value = '';
                        codeInput.focus();
                    } finally {
                        TwoFactorLib.setSetupLoading(false);
                    }
                });

                deviceNameInput.focus();
            }
        } catch (error) {
            console.error('❌ Error in 2FA setup:', error);
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

                    if (hostName) API_HOSTNAME = hostName;

                    injectCSS();

                    // Store ONLY UI references and callback, NO credentials
                    currentSession.setPasswordCallback = setTokenPassword;
                    currentSession.activeContainer = root;


                    if (!root || !('innerHTML' in root)) {
                        throw new Error('Invalid root container element');
                    }

                    root.innerHTML = `
                        <div class="tfa-container tfa-loading-block" style="padding: 40px 20px; margin: 10px 0;">
                            <span class="tfa-spinner" style="width: 28px; height: 28px; border-width: 3px;"></span>
                            <p style="margin: 12px 0 0; font-size: 14px;">
                                 ${getResourceText('tfa.loading')}
                            </p>
                        </div>
                    `;
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    await createMainInterface(root, username, password);

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
                            <div class="tfa-error-block">
                                <div style="font-size: 28px; margin-bottom: 10px;"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>
                                <h3>${getResourceText('tfa.serviceError')}</h3>
                                <p>${getResourceText('tfa.interfaceLoadError')}: ${error.message}</p>
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
                            <div id="tfa-verify-modal" class="tfa-modal-overlay tfa-container" style="display: flex;">
                                <div class="tfa-modal" style="max-width: 400px;" role="dialog" aria-modal="true" aria-labelledby="tfa-verify-title">
                                    <div style="padding: 30px;">
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <span class="tfa-icon-badge tfa-icon-badge--on" aria-hidden="true">
                                                <i class="fa-solid fa-shield-halved"></i>
                                            </span>
                                            <h3 style="margin: 0; font-weight: 700;" id="tfa-verify-title">Two-Factor Authentication</h3>
                                            <p style="margin: 10px 0 0 0; color: var(--tfa-text-2); font-size: 14px;">
                                                Enter the 6-digit code from your authenticator app
                                            </p>
                                        </div>

                                        <form id="tfa-verify-form">
                                            <div style="margin-bottom: 20px;">
                                                <input type="text" id="tfa-verify-code" class="tfa-input tfa-code-input"
                                                    maxlength="6" pattern="[0-9]{6}" required placeholder="000000"
                                                    inputmode="numeric" autocomplete="one-time-code"
                                                    aria-label="6-digit verification code">
                                            </div>

                                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                                <button type="submit" id="tfa-verify-submit" class="tfa-btn-primary"
                                                        style="flex: 1;">
                                                    Verify
                                                </button>
                                                <button type="button" id="tfa-verify-cancel" class="tfa-btn-cancel" style="flex: none;">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>

                                        <div id="tfa-verify-error" class="tfa-error-message" role="alert" style="text-align: center;"></div>
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

                        cancelBtn.onclick = () => {
                            document.getElementById('tfa-verify-modal').remove();
                            reject({
                                status: 'cancelled',
                                message: '2FA verification cancelled by user'
                            });
                        };

                        verifyForm.onsubmit = async (e) => {
                            e.preventDefault();

                            const code = codeInput.value.trim();
                            if (code.length !== 6) {
                                errorDiv.textContent = getResourceText('tfa.pleaseEnterCode');
                                errorDiv.style.display = 'block';
                                return;
                            }

                            submitBtn.disabled = true;
                            submitBtn.textContent = 'Verifying...';
                            cancelBtn.disabled = true;
                            errorDiv.style.display = 'none';

                            try {
                                // Pass credentials explicitly
                                const result = await apiRequest('POST', '/auth/verify-2fa', username, password, {
                                    totpCode: code,
                                    username: username
                                });

                                if (result.success) {
                                    const modal = document.getElementById('tfa-verify-modal');
                                    if (modal) {
                                        modal.remove();
                                    }

                                    // Notify app of DBPassword if available
                                    if (typeof setTokenPassword === 'function' && result.dbPassword) {
                                        setTokenPassword(result.dbPassword);
                                    }

                                    resolve({
                                        status: 'success',
                                        message: '2FA verification successful',
                                        result: result,
                                        user: result.user,
                                        note: 'DBPassword provided by PRC_ActivateTwoFactor'
                                    });
                                }
                            } catch (error) {
                                console.error('❌ 2FA verification error:', error);
                                errorDiv.textContent = error.message;
                                errorDiv.style.display = 'block';

                                submitBtn.disabled = false;
                                submitBtn.textContent = 'Verify';
                                cancelBtn.disabled = false;
                                codeInput.value = '';
                                codeInput.focus();
                            }
                        };

                        // Auto-submit when 6 digits entered
                        codeInput.oninput = () => {
                            if (codeInput.value.length === 6 && !submitBtn.disabled) {
							    submitBtn.click();
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

        enable2FA: async function (username, password) {
            try {
                await show2FASetup(username, password);
            } catch (error) {
                if (error.message !== 'Setup cancelled') {
                    showError(`${getResourceText('tfa.enableFailed')}: ${error.message}`);
                }
            }
        },

        // Disable 2FA
        disable2FA: async function (username, currentPassword) {
            try {

                // Show modal to get original password and handle disable directly
                const result = await TwoFactorLib.showDisable2FAModal(username, currentPassword);

                if (result.success) {
                    showSuccess(getResourceText('tfa.disabledSuccessUpdating'));

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Get original password from result
                    const passwordToUse = result.originalPassword || currentPassword;

                    // Notify app of password change
                    if (typeof currentSession.setPasswordCallback === 'function') {
                        currentSession.setPasswordCallback(passwordToUse);
                    }

                    showSuccess(getResourceText('tfa.disabledSuccess'));

                    // Refresh interface with original password
                    if (currentSession.activeContainer) {
                        setTimeout(async () => {
                            await createMainInterface(currentSession.activeContainer, username, passwordToUse);
                        }, 200);
                    }
                }

            } catch (error) {
                if (error.message !== 'Operation cancelled') {
                    console.error('❌ Error in disable2FA:', error);
                    showError(`${getResourceText('tfa.disableFailed')}: ${error.message}`);
                }
            }
        },

        // Clear interface - reset everything
        clear: function (root) {
            try {
                if (root && 'innerHTML' in root) {
                    root.innerHTML = '';
                    closeAllModals();

                    // Reset session - NO credential cleanup needed
                    currentSession = {
                        activeContainer: null,
                        setPasswordCallback: null
                    };

                    return { 
                        status: 'success', 
                        message: '2FA interface cleared' 
                    };
                } else {
                    throw new Error('Invalid root container element');
                }
            } catch (error) {
                return { status: 'error', message: error.message };
            }
        },

        // add a new device 
        addNewDevice: async function (username, password) {

            try {
                await show2FASetup(username, password);
            } catch (error) {
                if (error.message !== 'Setup cancelled') {
                showError(`${getResourceText('tfa.addDeviceFailed')}: ${error.message}`);
                }
            }
        },

        removeDevice: async function (deviceId, deviceName, username, currentPassword) {
            try {

                 let isLastDevice = false;

                  try {
                        const devicesList = await apiRequest('POST', '/devices/list', username, currentPassword);
                        isLastDevice = devicesList.devices && devicesList.devices.length === 1;
                    } catch (error) {
                        console.warn('Could not check device count:', error);
                    }


                // Check if last device...
                const result = await TwoFactorLib.showRemoveDeviceModal(deviceId, deviceName, username, currentPassword, isLastDevice);

                if (result.success) {

                    if (result.twoFactorDisabled) {

                            // Last device removed
                            showSuccess(getResourceText('tfa.lastDeviceRemovedUpdating'));

                            await new Promise(resolve => setTimeout(resolve, 1000));

                            const passwordToUse = result.originalPassword ||result.currentPassword ||result.data?.DBPassword || currentPassword;

                            // Notify app of password change
                            if (typeof currentSession.setPasswordCallback === 'function') {
                                currentSession.setPasswordCallback(passwordToUse);
                            }

                            showSuccess(getResourceText('tfa.lastDeviceRemovedSuccess'));


                            // Refresh interface with original password 
                            if (currentSession.activeContainer) {
                                setTimeout(async () => {
                                    await createMainInterface(currentSession.activeContainer, username, passwordToUse);
                                }, 500);
                            }
                        } else {
                            // Not last device 
                            showSuccess(`${getResourceText('tfa.deviceRemoved')} "${deviceName}" ${getResourceText('tfa.successfully')}`);

                            if (currentSession.activeContainer) {
                                setTimeout(async () => {
                                    await createMainInterface(currentSession.activeContainer, username, currentPassword);
                                }, 500);
                            }
                        }
                }

            } catch (error) {
                if (error.message !== 'Operation cancelled') {
                    console.error('❌ Error in removeDevice:', error);
                    showError(`${getResourceText('tfa.removeDeviceFailed')}: ${error.message}`);
                }
            }
        },

        showRemoveDeviceModal: function(deviceId, deviceName, username, currentPassword, isLastDevice = false) {
            return new Promise((resolve, reject) => {
                const existingModal = document.getElementById('tfa-remove-device-modal');
                if (existingModal) {
                    existingModal.remove();
                }

                const modalHtml = `
                    <div id="tfa-remove-device-modal" class="tfa-critical-modal tfa-container" style="display: flex;">
                        <div class="tfa-critical-modal-content">
                            <div class="tfa-modal-header">
                                <h3 class="tfa-modal-title"><i class="fa-solid fa-trash-can" aria-hidden="true" style="color: var(--tfa-error);"></i> ${getResourceText('tfa.removeDeviceTitle')}</h3>
                                    <button class="tfa-modal-close" onclick="TwoFactorLib.closeRemoveDeviceModal()" title="${getResourceText('tfa.btnClose')}" aria-label="${getResourceText('tfa.btnClose')}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                            </div>
                            <div class="tfa-modal-body">
                                ${isLastDevice ? `
                                    <div class="tfa-warning-box">
                                        <div class="tfa-warning-icon"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>
                                        <div class="tfa-warning-content">
                                            <div class="tfa-warning-title">${getResourceText('tfa.lastDeviceWarningTitle')}</div>
                                            <p class="tfa-warning-text">${getResourceText('tfa.lastDeviceWarningText')}</p>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="tfa-form-group">
                                    <label class="tfa-form-label">${getResourceText('account.login')}</label>
                                    <div class="tfa-readonly-field">${username}</div>
                                </div>
                                
                                <div class="tfa-form-group">
                                    <label class="tfa-form-label">${getResourceText('tfa.deviceToRemove')}</label>
                                    <div class="tfa-readonly-field">${deviceName}</div>
                                </div>
                                
                                <form id="tfa-remove-device-form">
                                    <div class="tfa-form-group">
                                        <label class="tfa-form-label" for="tfa-remove-password">${getResourceText('tfa.originalPasswordLabel')}</label>
                                        <input type="password" id="tfa-remove-password" class="tfa-form-input" 
                                            placeholder="${getResourceText('tfa.originalPasswordPlaceholder')}" required>
                                    </div>
                                    
                                    <div class="tfa-modal-actions">
                                        <button type="button" class="tfa-btn-cancel" onclick="TwoFactorLib.closeRemoveDeviceModal()">
                                            ${getResourceText('tfa.btnCancel')}
                                        </button>
                                        <button type="submit" class="tfa-btn-danger">
                                            <span id="tfa-remove-btn-text">${isLastDevice ? getResourceText('tfa.btnRemoveDisable') : getResourceText('tfa.btnRemove')}</span>
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
                    TwoFactorLib.showRemoveError(getResourceText('tfa.passwordRequired'));
                        return;
                    }

                    TwoFactorLib.setRemoveLoading(true);
                    TwoFactorLib.hideRemoveError();

                    try {
                        // Pass original password explicitly to remove endpoint
                        const result = await apiRequest('POST', '/devices/remove', username, originalPassword, {
                            deviceId: deviceId,
                            confirmDelete: isLastDevice
                        });

                        if (result.success) {
                            TwoFactorLib.closeRemoveDeviceModal();

                            resolve({
                                success: true,
                                message: result.twoFactorDisabled ?  'Last device removed and 2FA disabled successfully' :  'Device removed successfully',
                                twoFactorDisabled: result.twoFactorDisabled,
                                originalPassword: result.originalPassword || result.currentPassword || result.data?.originalPassword || originalPassword,
                                currentPassword: result.currentPassword || result.originalPassword || result.data?.originalPassword || originalPassword,
                                data: result
                            });
                        }
                    } catch (error) {
                            TwoFactorLib.showRemoveError(error.message);

                    } finally {
                        TwoFactorLib.setRemoveLoading(false);
                    }
                };

                setTimeout(() => passwordInput.focus(), 100);

                window.twoFactorRemoveCleanup = () => {
                    reject(new Error('Operation cancelled'));
                };
            });
        },

        // Allows the user to edit the name of an authentication device 
        startEditDevice: function (deviceId, currentName, username, password) {
            const nameElement = document.getElementById(`deviceName-${deviceId}`);
            if (!nameElement) return;

            // input element for editing
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'tfa-input';
            input.style.cssText = 'width: 200px; padding: 4px 8px; font-size: 14px; min-height: 30px;';

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
                            showSuccess(`${getResourceText('tfa.deviceRenamed')} "${newName}"`);

                            if (currentSession.activeContainer) {
                                await createMainInterface(currentSession.activeContainer, username, password);
                            }
                            return;
                        }
                    } catch (error) {
                        showError(`${getResourceText('tfa.renameDeviceFailed')}: ${error.message}`);
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
                showSuccess(getResourceText('tfa.copiedToClipboard'));
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    showError(getResourceText('tfa.copyFailed'));
                });
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showSuccess(getResourceText('tfa.copiedToClipboard'));
                } catch (err) {
                    showError('Failed to copy to clipboard');
                }
                document.body.removeChild(textArea);
            }
        },

        showDisable2FAModal: function(username, currentPassword) {
            return new Promise((resolve, reject) => {
                // Create modal dynamically instead of checking if it exists
                const existingModal = document.getElementById('tfa-disable-2fa-modal');
                if (existingModal) {
                    existingModal.remove();
                }

                const modalHtml = `
                    <div id="tfa-disable-2fa-modal" class="tfa-critical-modal" style="display: flex;">
                        <div class="tfa-critical-modal-content">
                            <div class="tfa-modal-header">
                                <h3 class="tfa-modal-title"><i class="fa-solid fa-unlock" aria-hidden="true" style="color: var(--tfa-warning);"></i> ${getResourceText('tfa.disableTitle')}</h3>
                                <button class="tfa-modal-close" onclick="TwoFactorLib.closeDisable2FAModal()" aria-label="${getResourceText('tfa.btnClose')}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                            </div>
                            <div class="tfa-modal-body">
                                <div class="tfa-warning-box">
                                    <div class="tfa-warning-icon"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>
                                    <div class="tfa-warning-content">
                                        <p class="tfa-warning-text">${getResourceText('tfa.disableWarning')}</p>
                                    </div>
                                </div>

                                <div class="tfa-form-group">
                                    <label class="tfa-form-label">${getResourceText('account.login')}</label>
                                    <div class="tfa-readonly-field">${username}</div>
                                </div>

                                <form id="tfa-disable-2fa-form">
                                    <div class="tfa-form-group">
                                        <label class="tfa-form-label" for="tfa-disable-password">${getResourceText('tfa.disableLabelPassword')}</label>
                                        <input type="password" id="tfa-disable-password" class="tfa-form-input" 
                                           placeholder="${getResourceText('tfa.disableEnterPassword')}" required>
                                    </div>

                                    <div class="tfa-modal-actions">
                                        <button type="button" class="tfa-btn-cancel" onclick="TwoFactorLib.closeDisable2FAModal()">
                                            ${getResourceText('tfa.btnCancel')}
                                        </button>
                                        <button type="submit" class="tfa-btn-danger">
                                            <span id="tfa-disable-btn-text">${getResourceText('tfa.btnDisable')}</span>
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
                    TwoFactorLib.showDisableError(getResourceText('tfa.passwordRequired'));
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
                                data: result,
                                originalPassword: result.originalPassword || originalPassword
                            });
                        }
                    } catch (error) {
                    TwoFactorLib.showDisableError(`${getResourceText('tfa.disableFailed')}: ${error.message}`);
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
                    //window.twoFactorRemoveCleanup();
                    window.twoFactorRemoveCleanup = null;
                }
            }
        },

        closeDisable2FAModal: function() {
            const modal = document.getElementById('tfa-disable-2fa-modal');
            if (modal) {
                modal.remove();
                if (window.twoFactorDisableCleanup) {
                    //window.twoFactorDisableCleanup();
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


})();