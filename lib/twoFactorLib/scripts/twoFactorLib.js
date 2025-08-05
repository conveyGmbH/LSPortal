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

    let API_HOSTNAME = "deimos.convey.de"; // DEIMOS Server
    let getBaseUrl = function() {
        return 'https://' + (nodeHostname ? nodeHostname : API_HOSTNAME) + '/2fabackend/api/v1'
       // return 'http://localhost:4000/api/v1'; // only for local development
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
            .tfa-container {
                font-family: "Open Sans", "Segoe UI", "Segoe UI Web", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif, "Segoe MDL2 Assets", Symbols, "S
                color: var(--WindowText);
                background-color: var(--Window);
            }

            /* Loaders - using system style */
            .tfa-spinner {
                border: 2px solid rgba(0,0,0,0.1);
                border-top: 2px solid var(--WindowText);
                border-radius: 50%;
                width: 20px;
                height: 20px;
                animation: tfa-spin 1s linear infinite;
                display: inline-block;
            }
            .cnv-ui-dark .tfa-spinner {
                border: 2px solid rgba(255,255,255,0.1);
                border-top: 2px solid var(--WindowText);
            }

            @keyframes tfa-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Wait circle - matching system loader */
            .tfa-wait-circle {
                position: absolute;
                width: 50px !important;
                height: 50px !important;
                margin: 0;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
            }

            /* Modal overlay */
            .tfa-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            }

            /* Modal content - using system colors */
            .tfa-modal {
                background-color: var(--Window);
                color: var(--WindowText);
                border-radius: 8px;
                border:1px solid #e6e6e6;
                max-width: 500px;
                width: 90%;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                animation: tfa-fadeIn 0.3s ease-in-out;
            }
            .cnv-ui-dark .tfa-modal {
                background-color: var(--Window);
                border-color: #525252;
                box-shadow: 0 4px 16px rgba(255,255,255,0.1);
            }

            @keyframes tfa-fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .tfa-form-group {
                margin-bottom: 16px;
            }

            .tfa-form-label {
                display: block;
                font-weight: 500;
                color: var(--WindowText);
                margin-bottom: 6px;
                font-size: 14px;
                font-family: inherit;
            }

            .tfa-form-help {
                font-size: 12px;
                color: var(--label-color);
                margin-top: 4px;
            }

            /* Device items */
            .tfa-device-item {
                padding: 15px;
                margin-bottom: 10px;
                border: 1px solid #e6e6e6;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
                background-color: var(--Window);
            }
            .cnv-ui-dark .tfa-device-item {
                border-color: #525252;
                background-color: var(--Window);
            }

            .tfa-device-item:hover {
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .cnv-ui-dark .tfa-device-item:hover {
                box-shadow: 0 2px 8px rgba(255,255,255,0.1);
            }

            .tfa-current-device {
                border-color: var(--accent-color, #007acc);
                background-color: rgba(0,122,204,0.1);
            }
            .cnv-ui-dark .tfa-current-device {
                background-color: rgba(0,122,204,0.2);
            }

            /* Buttons - matching system win-button style */
            .tfa-btn-primary {
                background-color: var(--accent-color, #007acc);
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-family: inherit;
                transition: background-color 0.2s;
                min-height: 32px;
            }
            .tfa-btn-primary:hover {
                background-color: var(--accent-color, #005f9a);
                opacity: 0.9;
            }
            .tfa-btn-primary:disabled {
                background-color: #ccc;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .tfa-btn-secondary {
                background-color: var(--label-color, #6c757d);
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-family: inherit;
                transition: background-color 0.2s;
            }

            .tfa-btn-danger {
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-family: inherit;
                transition: background-color 0.2s;
            }
            .tfa-btn-danger:hover {
                background-color: #c82333;
            }

            /* Input fields - matching system win-textbox style */
            .tfa-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 2px;
                font-size: 14px;
                font-family: inherit;
                box-sizing: border-box;
                background-color: var(--Window);
                color: var(--WindowText);
                min-height: 32px;
            }
            .cnv-ui-dark .tfa-input {
                border-color: #525252;
            }

            .tfa-input:focus {
                outline: none;
                border-color: var(--accent-color, #007acc);
                box-shadow: 0 0 0 2px rgba(0,122,204,0.2);
            }
            
            /* System button integration */
            .tfa-btn-primary.win-button {
                background-color: var(--accent-background-color, #007acc);
                border-radius: var(--use-border-radius, 4px);
            }
            
            .tfa-btn-secondary.win-button {
                border-radius: var(--use-border-radius, 4px);
            }

            .tfa-btn-cancel {
                background-color: var(--box-bkg);
                color: var(--WindowText);
                border: 1px solid #e6e6e6;
            }
            .cnv-ui-dark .tfa-btn-cancel {
                border-color: #525252;
            }


            /* Tabs - matching system style */
            .tfa-tabs {
                display: flex;
                border-bottom: 2px solid #e6e6e6;
                margin-bottom: 20px;
            }
            .cnv-ui-dark .tfa-tabs {
                border-bottom-color: #525252;
            }

            .tfa-tab-btn {
                flex: 1;
                padding: 12px;
                border: none;
                background-color: var(--box-bkg);
                color: var(--WindowText);
                cursor: pointer;
                font-size: 14px;
                font-family: inherit;
                border-radius: 4px 4px 0 0;
                margin-right: 2px;
                transition: all 0.2s;
            }

            .tfa-tab-btn.active {
                background-color: var(--accent-color, #007acc);
            }

            .tfa-tab-btn:hover:not(.active) {
                background-color: rgba(0,0,0,0.1);
            }
            .cnv-ui-dark .tfa-tab-btn:hover:not(.active) {
                background-color: rgba(255,255,255,0.1);
            }

            /* Critical modal - enhanced styling */
            .tfa-critical-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.6);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            }

            .tfa-critical-modal-content {
                 background-color: var(--Window);
                color: var(--WindowText);
                border-radius: 8px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                animation: tfa-modalFadeIn 0.3s ease-out;
                overflow: hidden;
                border: 1px solid #e6e6e6;
            }
            .cnv-ui-dark .tfa-critical-modal-content {
                border-color: #525252;
                box-shadow: 0 8px 32px rgba(255,255,255,0.1);
            }

            /* Form styling */
            .tfa-form-group {
                margin-bottom: 20px;
            }

            /* Form inputs */
            .tfa-form-input,
            .tfa-input {
                border: 2px solid #e6e6e6;
                background-color: var(--Window);
                color: var(--WindowText);
            }
            .cnv-ui-dark .tfa-form-input,
            .cnv-ui-dark .tfa-input {
                border-color: #525252;
            }

            .tfa-form-label {
                display: block;
                font-weight: 500;
                color: var(--label-color);
                margin-bottom: 6px;
                font-size: 14px;
                font-family: inherit;
            }

            .tfa-form-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #d1d5db;
                border-radius: 8px;
                font-size: 16px;
                font-family: inherit;
                transition: border-color 0.2s;
                box-sizing: border-box;
                background-color: var(--Window);
                color: var(--WindowText);
            }
            .cnv-ui-dark .tfa-form-input {
                border-color: #525252;
            }

            .tfa-form-input:focus {
                outline: none;
                border-color: var(--accent-color, #3b82f6);
                box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
            }

            /* Warning box */
            .tfa-warning-box {
                display: flex;
                padding: 16px;
                margin-bottom: 20px;
                border-radius: 8px;
                border-left: 4px solid #f59e0b;
                background-color: var(--box-bkg, #fffbeb);
            }
            
            /* Modal headers */
            .tfa-modal-header {
                background-color: var(--Window);
                border-bottom: 1px solid #e6e6e6;
                padding: 16px 20px;
                border-bottom: 1px solid #e6e6e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: var(--Window);
            }
            .cnv-ui-dark .tfa-modal-header {
                border-bottom-color: #525252;
            }
            
            .tfa-modal-close {
                background: none;
                border: none;
                font-size: 20px;
                color: var(--WindowText);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .tfa-modal-close:hover {
                background-color: rgba(0,0,0,0.1);
            }
            .cnv-ui-dark .tfa-modal-close:hover {
                background-color: rgba(255,255,255,0.1);
            }

            .tfa-modal-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--WindowText);
                margin: 0;
            }

            .tfa-modal-body {
                padding: 20px;
                background-color: var(--Window);
            }
                .tfa-modal-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
                padding-top: 16px;
                border-top: 1px solid #e6e6e6;
            }
            .cnv-ui-dark .tfa-modal-actions {
                border-top-color: #525252;
            }

            .tfa-btn-cancel {
                flex: 1;
                background-color: var(--box-bkg);
                color: var(--WindowText);
                border: 1px solid #e6e6e6;
                padding: 10px 16px;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
                font-size: 14px;
            }
            .cnv-ui-dark .tfa-btn-cancel {
                border-color: #525252;
            }
            .tfa-btn-cancel:hover {
                background-color: rgba(0,0,0,0.05);
            }
            .cnv-ui-dark .tfa-btn-cancel:hover {
                background-color: rgba(255,255,255,0.05);
            }

            .tfa-btn-danger {
                flex: 1;
                background-color: #dc2626;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: inherit;
                font-size: 14px;
            }
            .tfa-btn-danger:hover {
                background-color: #b91c1c;
            }
            .tfa-btn-danger:disabled {
                background-color: #9ca3af;
                cursor: not-allowed;
            }
                
                /* Warning boxes */
                .tfa-warning-box {
                    background-color: var(--box-bkg, #fffbeb);
                    border-left-color: #f59e0b;
                }
                .cnv-ui-dark .tfa-warning-box {
                    background-color: rgba(245, 158, 11, 0.1);
                }

                /* Error and success messages */
                .tfa-error-message {
                    background-color: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-size: 14px;
                    display: none;
                }
                .cnv-ui-dark .tfa-error-message {
                    background-color: rgba(185,28,28,0.1);
                    border-color: rgba(254,202,202,0.3);
                }

                .tfa-success-message {
                    background-color: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #166534;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-size: 14px;
                    display: none;
                }
                .cnv-ui-dark .tfa-success-message {
                    background-color: rgba(22,101,52,0.1);
                    border-color: rgba(187,247,208,0.3);
                }

                /* Main interface styling */
                .tfa-main-interface {
                    font-family: inherit;
                    background-color: var(--Window);
                    color: var(--WindowText);
                    border: 1px solid #e6e6e6;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 10px 0;
                }
                .cnv-ui-dark .tfa-main-interface {
                    border-color: #525252;
                }

                /* Overview grid */
                .tfa-overview {
                    display: grid;
                    gap: 20px;
                }

                @media (max-width: 768px) {
                    .tfa-overview {
                        grid-template-columns: 1fr;
                    }
                }

                /* Readonly field */
                .tfa-readonly-field {
                    background-color: var(--box-bkg);
                    border: 2px solid #e5e7eb;
                    color: var(--WindowText);
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                    font-family: inherit;
                }
                .cnv-ui-dark .tfa-readonly-field {
                    border-color: #525252;
                }

                /* Icon replacements - using system style instead of emojis */
                .tfa-icon-security::before { content: "🔒"; }
                .tfa-icon-warning::before { content: "⚠️"; }
                .tfa-icon-device::before { content: "📱"; }
                .tfa-icon-success::before { content: "✅"; }
                .tfa-icon-error::before { content: "❌"; }

                /* Responsive adjustments */
                @media (max-width: 899px) {
                    .tfa-modal {
                        width: 95%;
                        margin: 10px;
                    }
                    
                    .tfa-critical-modal-content {
                        width: 95%;
                        margin: 10px;
                    }
                }

                @media (max-width: 499px) {
                    .tfa-tabs {
                        flex-direction: column;
                    }
                    
                    .tfa-tab-btn {
                        margin-right: 0;
                        margin-bottom: 2px;
                    }
                    
                    .tfa-device-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
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

            // Store only UI reference
            currentSession.activeContainer = container;

            container.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #e9ecef; border-radius: 4px;">
                <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
                <p style="margin: 0; color: #333;">Loading 2FA status...</p>
            </div>
        `;

            // Pass credentials explicitly
            const status = await apiRequest('POST', '/auth/status', username, password);

            const interfaceHtml = `
                <div class="tfa-main-interface tfa-container" style="
                    background: var(--Window); border: 1px solid #e6e6e6; border-radius: 8px;
                    padding: 20px; margin: 10px 0;
                ">
                    <div class="tfa-header" style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 32px; margin-bottom: 10px;">
                            ${status.is2FAEnabled ? '<span class="tfa-icon-security"></span>' : '<span class="tfa-icon-warning"></span>'}
                        </div>
                        <h2 class="text-textcolor" style="margin: 0; font-size: 18px;">
                            Two-Factor Authentication ${status.is2FAEnabled ? 'Active' : 'Inactive'}
                        </h2>
                        <p class="label-color" style="margin: 5px 0; font-size: 14px;">
                            User: <strong>${username}</strong>
                        </p>
                    </div>

                    <div class="tfa-tabs">
                        <button class="tfa-tab-btn active" data-tab="overview">📊 Overview</button>
                        <button class="tfa-tab-btn" data-tab="devices">📱 Devices</button>
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
            console.log('Main interface created successfully');

        } catch (error) {
            console.error('Error creating 2FA interface:', error);
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

    // Switch between tabs in the 2FA interface 
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
            console.error(`Error switching to tab ${tabId}:`, error);
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

    // Load overview tab
    async function loadOverviewTab(container, username, password, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading overview...</div>';

        try {

            // get user data from API with 
            const status = await apiRequest('POST', '/auth/status', username, password);

            const overviewHtml = `
            <div class="tfa-overview">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="box-bkg" style="padding: 20px; border-radius: 8px; border: 1px solid #e6e6e6;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px;">Account Information</h3>
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
                        </div>
                    </div>

                    <div class="box-bkg" style="padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e6e6e6;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px;">Security Status</h3>
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
                            <button id="tfa-enable-btn" data-username="${username}"
                                    class="tfa-btn-primary win-button accent-background-color" 
                                    style="font-size: 14px; padding: 12px 20px; border-radius: 4px;">
                                🛡️ Enable 2FA
                            </button>
                        ` : `
                            <button id="tfa-disable-btn" data-username="${username}"
                                    class="tfa-btn-danger win-button" 
                                    style="background-color: #dc3545; font-size: 12px; padding: 10px 16px; border-radius: 4px;">
                                🔓 Disable 2FA
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
            <div style="color: #dc3545; text-align: center; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                 Error loading overview: ${error.message}
            </div>
        `;
        }
    }


    async function loadDevicesTab(container, username, password, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading devices...</div>';

        try {
            // Pass credentials explicitly
            const devices = await apiRequest('POST', '/devices/list', username, password);

            let devicesHtml = `
                <div class="tfa-devices">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 16px;">Authentication Devices</h3>
                        <button id="tfa-add-device-btn" class="tfa-btn-primary">
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
                                    <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px; display: flex; align-items: center;">
                                        <span id="deviceName-${device.deviceId}">${device.deviceInfo}</span>
                                        ${isCurrentDevice ? '<span style="margin-left: 8px; background: #d4edda; color: #155724; padding: 2px 8px; border-radius: 12px; font-size: 10px;">Current</span>' : ''}
                                        <button class="tfa-edit-btn" 
                                            data-device-id="${device.deviceId}" 
                                            data-device-name="${device.deviceInfo}"
                                            style="margin-left: 8px; background: none; border: none; color: #666; cursor: pointer; padding: 2px;"
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
                                <button class="tfa-remove-device-btn tfa-btn-danger"
                                        data-device-id="${device.deviceId}"
                                        data-device-name="${device.deviceInfo}"
                                        title="Remove device">
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
                       <button id="tfa-enable-btn" class="tfa-btn-primary accent-background-color" 
                                style="font-size: 14px; padding: 12px 20px;">
                        🛡️ Enable 2FA
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
                <div style="color: #dc3545; text-align: center; padding: 20px;">
                    ❌ Error loading devices: ${error.message}
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
                <div id="tfa-setup-modal" class="tfa-modal-overlay" style="display: none;">
                    <div class="tfa-modal">
                        <div style="padding: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <h3 style="margin: 0; ">Setup Two-Factor Authentication</h3>
                                <button onclick="TwoFactorLib.closeSetupModal()" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
                            </div>
                            <div id="tfa-setup-content">
                                <div style="text-align: center; padding: 20px;">
                                    <div class="wait-circle-container">
                                        <progress class="win-ring win-large wait-circle"></progress>
                                    </div>
                                    <p style="margin-top: 10px;">Setting up 2FA...</p>
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
                // Temporary session token ONLY for this setup flow
                const setupSessionToken = result.sessionToken;

                // Update modal with QR code
                const setupContent = document.getElementById('tfa-setup-content');
                setupContent.innerHTML = `
                    <div style="text-align: center;">
                        <div style="padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
                            <img src="${result.totpSetup.qrCodeDataURL}" alt="QR Code" style="max-width: 200px; height: auto;">
                        </div>

                        <div style="padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                            <p style="margin: 0 0 10px 0; font-weight: bold;">Manual entry key:</p>
                            <code style= padding: 8px; border-radius: 4px; font-family: monospace; word-break: break-all; display: block;">
                                ${result.totpSetup.secret}
                            </code>
                            <button onclick="TwoFactorLib.copyToClipboard('${result.totpSetup.secret}')" 
                                    class="tfa-btn-secondary" style="margin-top: 10px;">
                                📋 Copy Key
                            </button>
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

                // Form validation
                const form = document.getElementById('tfa-setup-form');
                const deviceNameInput = document.getElementById('tfa-device-name');
                const codeInput = document.getElementById('tfa-setup-code');
                const submitBtn = document.getElementById('tfa-setup-submit');

                const validateForm = () => {
                    const deviceName = deviceNameInput.value.trim();
                    const code = codeInput.value.trim();
                    const isValid = deviceName.length >= 3 && /^\d{6}$/.test(code);

                    submitBtn.disabled = !isValid;
                    submitBtn.style.background = isValid ? '#007acc' : '#ccc';
                    submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
                };

                deviceNameInput.addEventListener('input', validateForm);
                codeInput.addEventListener('input', validateForm);

                // Form submission - pass credentials explicitly
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const deviceName = deviceNameInput.value.trim();
                    const code = codeInput.value.trim();

                    if (deviceName.length < 3) {
                        TwoFactorLib.showSetupError('Device name must be at least 3 characters');
                        return;
                    }

                    if (!/^\d{6}$/.test(code)) {
                        TwoFactorLib.showSetupError('Please enter a valid 6-digit code');
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

                            showSuccess(`Device "${deviceName}" has been successfully added! Updating permissions...`);

                            await new Promise(resolve => setTimeout(resolve, 5000));

                            // Notify app of DBPassword if available
                            if (typeof currentSession.setPasswordCallback === 'function' && verifyResult.dbPassword) {
                                currentSession.setPasswordCallback(verifyResult.dbPassword);
                                console.log(' 2FA setup complete - notified app of DBPassword');
                            }

                            showSuccess(`Setup complete!`);
                            console.log("Setup complete !")

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
                    console.log('TwoFactorLib.getStatus called for user:', username, "hostName: ", hostName);

                    if (hostName) API_HOSTNAME = hostName;

                    injectCSS();

                    // Store ONLY UI references and callback, NO credentials
                    currentSession.setPasswordCallback = setTokenPassword;
                    currentSession.activeContainer = root;


                    if (!root || !('innerHTML' in root)) {
                        throw new Error('Invalid root container element');
                    }

                    root.innerHTML = `
                        <div class="tfa-container" style="
                            text-align: center; 
                            padding: 40px 20px; 
                            background-color: var(--Window); 
                            border: 1px solid #e6e6e6; 
                            border-radius: 8px; 
                            margin: 10px 0;
                        ">
                            <div class="wait-circle-container" style="position: relative; margin-bottom: 20px;">
                                <progress class="win-ring win-large wait-circle"></progress>
                            </div>
                            <p class="text-textcolor" style="margin: 0; font-size: 14px; font-family: inherit;">
                                Loading 2FA interface...
                            </p>
                        </div>
                    `;
                    
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
                                            <h3 style="margin: 0;">Two-Factor Authentication</h3>
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

                        cancelBtn.onclick = () => {
                            console.log('2FA verification cancelled by user');
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
                                errorDiv.textContent = 'Please enter a 6-digit code';
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
                                    console.log(' 2FA verified successfully');

                                    const modal = document.getElementById('tfa-verify-modal');
                                    if (modal) {
                                        modal.remove();
                                    }

                                    // Notify app of DBPassword if available
                                    if (typeof setTokenPassword === 'function' && result.dbPassword) {
                                        setTokenPassword(result.dbPassword);
                                        console.log(' Notified app of DBPassword');
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
                                //setTimeout(() => verifyForm.dispatchEvent(new Event('submit')), 100);
                                // Ted 20250804: So funktioniert's auch mit Firefox...
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

        // Enable 2FA 
        enable2FA: async function (username, password) {
            try {
                await show2FASetup(username, password);
            } catch (error) {
                if (error.message !== 'Setup cancelled') {
                    showError('Failed to enable 2FA: ' + error.message);
                }
            }
        },

        // Disable 2FA
        disable2FA: async function (username, currentPassword) {
            try {
                console.log('🔓 Starting 2FA disable:', { username });

                // Show modal to get original password
                const result = await TwoFactorLib.showDisable2FAModal(username, currentPassword);

                if (result.success) {
                    console.log(' 2FA disable result:', result);
                    console.log("result", result)

                    showSuccess('2FA disabled successfully! Updating permissions...');

                    await new Promise(resolve => setTimeout(resolve, 5000));

                    // Get original password from result
                    const passwordToUse = result.originalPassword || 
                                 result.currentPassword || 
                                 result.data?.originalPassword ||
                                 currentPassword;

                    console.log('🎯 Password to use:', passwordToUse?.substring(0, 4) + '***');
                    console.log('Password to use:', passwordToUse);


                    // Notify app of password change
                    if (typeof currentSession.setPasswordCallback === 'function') {
                        currentSession.setPasswordCallback(passwordToUse);
                        console.log('Notified app of password:', passwordToUse?.substring(0, 4) + '***');
                    }

                    showSuccess('2FA disabled successfully!');

                    // Refresh interface with original password
                    if (currentSession.activeContainer) {
                        setTimeout(async () => {
                            await createMainInterface(currentSession.activeContainer, username, passwordToUse);
                        }, 500);
                    }
                }

            } catch (error) {
                if (error.message !== 'Operation cancelled') {
                    console.error('❌ Error in disable2FA:', error);
                    showError('Failed to disable 2FA: ' + error.message);
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

                    return { status: 'success', message: '2FA interface cleared' };
                } else {
                    throw new Error('Invalid root container element');
                }
            } catch (error) {
                console.error('Error clearing 2FA interface:', error);
                return { status: 'error', message: error.message };
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

        removeDevice: async function (deviceId, deviceName, username, currentPassword) {
            try {
                console.log('🗑️ Starting device removal:', { deviceId, deviceName, username });

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

                            // Last device removed - feedback 
                            showSuccess(`Last device removed and 2FA disabled! Updating permissions...`);
                            
                        
                            await new Promise(resolve => setTimeout(resolve, 5000));

                            // DEBUG : Check all possible password
                            console.log('🔍 DEBUG - Password sources:', {
                                'result.originalPassword': result.originalPassword?.substring(0, 4) + '***',
                                'result.currentPassword': result.currentPassword?.substring(0, 4) + '***', 
                                'result.data?.DBPassword': result.data?.DBPassword?.substring(0, 4) + '***',
                                'result.data?.originalPassword': result.data?.originalPassword?.substring(0, 4) + '***',
                                'currentPassword': currentPassword?.substring(0, 4) + '***'
                            });


                            const passwordToUse = result.originalPassword ||result.currentPassword || 
                                                result.data?.DBPassword || currentPassword;

                            console.log('🎯 Password selected for use:', passwordToUse?.substring(0, 4) + '***');

                            
                            console.log('passwordToUse:', passwordToUse);

                        
                            // Notify app of password change  
                            if (typeof currentSession.setPasswordCallback === 'function') {
                                currentSession.setPasswordCallback(passwordToUse);
                                console.log('Notified app of password:', passwordToUse?.substring(0, 4) + '***');
                            }

                            showSuccess(`Last device removed and 2FA disabled successfully!`);

                            // Refresh interface with original password 
                            if (currentSession.activeContainer) {
                                setTimeout(async () => {
                                    await createMainInterface(currentSession.activeContainer, username, passwordToUse);
                                }, 500);
                            }
                        } else {
                            // Not last device - simple refresh
                            showSuccess(`Device "${deviceName}" removed successfully!`);

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
                    showError('Failed to remove device: ' + error.message);
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
                        <div class="tfa-critical-modal-content box-bkg">
                            <div class="tfa-modal-header">
                                <h3 class="tfa-modal-title text-textcolor">🗑️ Remove Device</h3>
                                    <button class="tfa-modal-close" onclick="TwoFactorLib.closeRemoveDeviceModal()" title="Close">×</button>
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
                                data: result,
                                originalPassword: result.originalPassword || originalPassword
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