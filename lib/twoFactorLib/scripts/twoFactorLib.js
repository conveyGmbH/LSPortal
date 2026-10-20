// twoFactorLib.js - 2FA Integration for LeadSuccess Portal
//
// Public API (unchanged, used by accountController.js / loginController.js):
//   TwoFactorLib.getStatus(root, username, password, setTokenPassword, language, hostName)
//   TwoFactorLib.verify2FA(root, username, password, setTokenPassword, language, hostName)
//   TwoFactorLib.clear(root)
//
// 2FA-Review (2026-10):
//   - one "security section" instead of Overview/Devices tabs
//   - setup in 2 steps (scan, confirm) with a 6-box code input
//   - all user / server values are HTML-escaped (device names are user input)
//   - verify2FA always settles its promise
//   - clear() only resets the session it owns, stale responses are ignored
//   - modals are tracked and removed when the page is disposed

(function () {
    "use strict";

    // Global configuration
    let currentSession = {
        activeContainer: null,
        setPasswordCallback: null,
        generation: 0
    };

    // API configuration
    const query = (typeof getQueryStringParameters === "function") ? getQueryStringParameters() : null;
    let nodeHostname = null;
    if (query && query.nodeHost) {
        nodeHostname = query.nodeHost;
    }

    // API_HOSTNAME ist nur als Fallback (also vermutlich gar nicht) verwendet
    let API_HOSTNAME = "deimos.convey.de"; // DEIMOS Server
    let getBaseUrl = function () {
        return 'https://' + (nodeHostname ? nodeHostname : API_HOSTNAME) + '/2fabackend/api/v1';
    };

    let globalObject = typeof window !== 'undefined' ? window :
        typeof self !== 'undefined' ? self :
            typeof global !== 'undefined' ? global : {};

    const MODAL_IDS = ['tfa-setup-modal', 'tfa-verify-modal', 'tfa-remove-device-modal', 'tfa-disable-2fa-modal'];

    // UTILITY FUNCTIONS

    // Escape every value that is not a static template (device names are user input!)
    function esc(value) {
        return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // API Request
    async function apiRequest(method, endpoint, username, password, extraData = {}) {

        // Always include credentials in request
        const data = {
            username: username,
            password: password,
            ...extraData
        };

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
                    throw new Error(t('tfa.errorServiceUnavailable'));
                } else if (responseText.includes('404') || responseText.includes('Not Found')) {
                    throw new Error(t('tfa.errorServiceNotFound'));
                } else if (responseText.includes('500') || responseText.includes('Internal Server Error')) {
                    throw new Error(t('tfa.errorServerError'));
                } else {
                    throw new Error(t('tfa.errorInvalidResponse'));
                }
            }

            if (!response.ok) {
                const errorMessage = (result && (result.message || result.error)) || t('tfa.errorRequestFailed', { status: response.status });
                console.error('2FA API error', { status: response.status, endpoint });
                throw new Error(errorMessage);
            }

            return result;

        } catch (error) {
            // Improve error messages based on error type
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                throw new Error(t('tfa.errorTimeout'));
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(t('tfa.errorNetworkError'));
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

    // Icon based on the device name the user chose (Font Awesome, theme-safe)
    function getDeviceIcon(deviceInfo) {
        const info = String(deviceInfo || '').toLowerCase();
        let icon = 'fa-mobile-screen-button';
        if (info.includes('tablet') || info.includes('ipad')) {
            icon = 'fa-tablet-screen-button';
        } else if (info.includes('laptop') || info.includes('windows') || info.includes('linux') || info.includes('pc')) {
            icon = 'fa-laptop';
        } else if (info.includes('mac')) {
            icon = 'fa-desktop';
        }
        return `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
    }

    // TOTP is what authenticator apps use; show a readable, localized label
    function authMethodLabel(method) {
        if (!method || String(method).toUpperCase() === 'TOTP') {
            return t('tfa.authenticatorApp');
        }
        return method;
    }

    // Accepts ISO strings, timestamps and OData "/Date(123)/"
    function formatDate(value) {
        if (!value) return '';
        let date;
        const odata = typeof value === 'string' && value.match(/\/Date\((-?\d+)/);
        if (odata) {
            date = new Date(parseInt(odata[1], 10));
        } else {
            date = new Date(value);
        }
        if (isNaN(date.getTime())) return '';
        try {
            return date.toLocaleDateString((typeof Application === 'object' && Application.language) || undefined,
                { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return date.toLocaleDateString();
        }
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
            alert(message);
        }
    }

    // Success toast (token-styled, light+dark)
    function showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'tfa-toast tfa-container';
        notification.setAttribute('role', 'status');
        notification.innerHTML = '<span class="tfa-toast-icon" aria-hidden="true"><i class="fa-solid fa-circle-check"></i></span>';
        const text = document.createElement('span');
        text.textContent = message;
        notification.appendChild(text);
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Default device name for a new authenticator (user can change it)
    function detectDevice() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('iphone')) return 'iPhone';
        if (ua.includes('ipad')) return 'iPad';
        if (ua.includes('android')) return ua.includes('mobile') ? 'Android phone' : 'Android tablet';
        if (ua.includes('mobile')) return t('tfa.mobilePhone');
        return t('tfa.authenticatorApp');
    }

    // LOCALISATION

    // English fallbacks; used when the portal has no text for a key
    const FALLBACKS = {
        "tfa.title": "Two-Factor Authentication",
        "tfa.loading": "Loading Two-Factor Authentication...",
        "tfa.Loading2FAStatus": "Loading 2FA status...",
        "tfa.statusUnavailable": "2FA Service Unavailable",
        "tfa.statusLoadMessage": "Unable to load 2FA interface:",
        "tfa.tabLoadAuthDevicesTab": "Authentication Devices",
        "tfa.noDevicesMessage": "No devices configured yet. Add your first authentication device to secure your account",
        "tfa.btnAddDevice": "Add Device",
        "tfa.btnEnable": "Enable 2FA",
        "tfa.btnDisable": "Disable 2FA",
        "tfa.btnCancel": "Cancel",
        "tfa.btnBack": "Back",
        "tfa.btnRetry": "Retry",
        "tfa.btnRemove": "Remove",
        "tfa.btnClose": "Close",
        "tfa.btnVerify": "Verify",
        "tfa.btnRemoveDisable": "Remove & Disable 2FA",
        "tfa.setupTitle": "Setup 2FA",
        "tfa.setupAppSuggestions": "Recommended apps: Google Authenticator, Microsoft Authenticator, Authy",
        "tfa.setupLoading": "Setting up 2FA...",
        "tfa.verifyTitle": "Enter 2FA Code",
        "tfa.verifyInstruction": "Enter the 6-digit code from your authenticator app:",
        "tfa.verifyInputLabel": "6-digit code",
        "tfa.verifying": "Verifying...",
        "tfa.deviceName": "Device Name",
        "tfa.deviceNamePlaceholder": "e.g., John's iPhone, Work Laptop",
        "tfa.deviceNameHelp": "Choose a name to identify this device",
        "tfa.showSetupErrorDeviceName": "Device name must be at least 3 characters",
        "tfa.showSetupErrorDeviceCode": "Please enter a valid 6-digit code",
        "tfa.infoQrCodeAlt": "QR Code for 2FA setup",
        "tfa.backupCopy": "Copy to Clipboard",
        "tfa.disableTitle": "Disable 2FA",
        "tfa.disableWarning": "Disabling 2FA will make your account less secure.",
        "tfa.disableLabelPassword": "Password *",
        "tfa.disableEnterPassword": "Enter your password to confirm",
        "tfa.disableFailed": "Failed to disable 2FA",
        "tfa.originalPasswordLabel": "Password *",
        "tfa.originalPasswordPlaceholder": "Enter your password to confirm",
        "tfa.lastDeviceWarningTitle": "Last Device Warning",
        "tfa.lastDeviceWarningText": "This is your last device. Removing it will completely disable 2FA for your account.",
        "tfa.removeDeviceTitle": "Remove Device",
        "tfa.editDeviceTitle": "Edit Device Name",
        "tfa.deviceToRemove": "Device to Remove",
        "tfa.serviceError": "Service Error",
        "tfa.interfaceLoadError": "Interface Load Error",
        "tfa.setupFailed": "Failed to set up 2FA",
        "tfa.enableFailed": "Failed to enable 2FA...",
        "tfa.addDeviceFailed": "Failed to add device",
        "tfa.removeDeviceFailed": "Failed to remove device",
        "tfa.renameDeviceFailed": "Failed to rename device",
        "tfa.copyFailed": "Failed to copy to clipboard",
        "tfa.copiedToClipboard": "Copied to clipboard!",
        "tfa.passwordRequired": "Your password is required",
        "tfa.disabledSuccess": "2FA disabled successfully!",
        "tfa.lastDeviceRemovedSuccess": "Last device removed and 2FA disabled successfully!",
        "tfa.deviceRemoved": "Device",
        "tfa.successfully": "removed successfully",
        "tfa.deviceRenamed": "Device renamed to",
        "account.login": "User",
        "tfa.errorServerError": "Server error. Please try again later.",
        "tfa.errorNetworkError": "Network error. Please check your connection.",
        "tfa.errorServiceUnavailable": "The 2FA service is temporarily unavailable. Please try again later.",
        "tfa.errorServiceNotFound": "The 2FA service was not found. Please contact your administrator.",
        "tfa.errorInvalidResponse": "The 2FA service sent an invalid response. Please contact your administrator.",
        "tfa.errorTimeout": "The 2FA service did not answer in time. Please check your connection and try again.",
        "tfa.errorRequestFailed": "Request failed (status {status}).",
        "tfa.mobilePhone": "Mobile phone",
        // [2FA-Review] new keys
        "tfa.chipOn": "On",
        "tfa.chipOff": "Off",
        "tfa.sectionDescOn": "Signing in asks for a code from your authenticator app.",
        "tfa.sectionDescOff": "Protect your LeadSuccess account with a 6-digit code from an authenticator app when you sign in.",
        "tfa.btnSetUp": "Set up 2FA",
        "tfa.btnTurnOff": "Turn off 2FA",
        "tfa.btnTurnOn": "Turn on 2FA",
        "tfa.btnScanned": "I scanned it",
        "tfa.lastDeviceHint": "Removing the last device turns 2FA off.",
        "tfa.whyQuickTitle": "Takes 2 minutes",
        "tfa.whyQuickText": "Scan a QR code with Google Authenticator, Microsoft Authenticator or Authy.",
        "tfa.whyOfflineTitle": "Works offline",
        "tfa.whyOfflineText": "Codes are generated on your phone, no SMS needed.",
        "tfa.whyBackupTitle": "Several devices",
        "tfa.whyBackupText": "Add a second phone or laptop as a backup.",
        "tfa.stepScan": "Scan QR code",
        "tfa.stepConfirm": "Confirm code",
        "tfa.scanHint": "Open your authenticator app and scan this code.",
        "tfa.cantScan": "Can't scan? Enter this key:",
        "tfa.confirmHint": "Enter the 6-digit code shown in your app.",
        "tfa.deviceAdded": "{name} added. 2FA is on.",
        "tfa.addedOn": "Added {date}",
        "tfa.lastUsedOn": "Last used {date}",
        "tfa.authenticatorApp": "Authenticator app",
        "tfa.digitLabel": "Digit {n}",
        "tfa.pleaseEnterCode": "Please enter the 6-digit code",
        "tfa.processing": "Processing...",
        "tfa.verifyFailedRetry": "That code didn't match. Codes change every 30 seconds, enter the current one."
    };

    // Function to retrieve localized texts (falls back when the portal returns the key itself)
    function getResourceText(key) {
        if (typeof window.getResourceText === 'function') {
            const text = window.getResourceText(key);
            if (text && text !== key) {
                return text;
            }
        }
        return FALLBACKS[key] || key;
    }

    // Localized text with {placeholders}
    function t(key, vars) {
        let text = getResourceText(key);
        if (vars) {
            Object.keys(vars).forEach(function (name) {
                text = text.split('{' + name + '}').join(vars[name]);
            });
        }
        return text;
    }

    // CSS INJECTION

    // The tenant accent (--ColorAccent) is set at runtime by the portal theme
    // engine and can be any CSS color format. CSS alone cannot derive alpha
    // tints from it without color-mix() (unavailable in older WebViews), so we
    // resolve it to "r, g, b" here and expose it as --tfa-accent-rgb for the
    // rgba(var(--tfa-accent-rgb), .x) tints in twoFactorLib.css.
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

    // A modal can carry a cancel function (rejects the pending promise of its flow)
    function removeModal(modalId, cancel) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const cancelFn = modal._tfaCancel;
            modal._tfaCancel = null;
            modal.remove();
            if (cancel && typeof cancelFn === 'function') {
                cancelFn();
            }
        }
    }

    function closeModal(modalId) {
        removeModal(modalId, true);
    }

    function closeAllModals() {
        MODAL_IDS.forEach(function (id) { removeModal(id, true); });
    }

    function createModal(modalId, options) {
        removeModal(modalId, true);
        const critical = options.critical;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div id="${modalId}" class="${critical ? 'tfa-critical-modal' : 'tfa-modal-overlay'} tfa-container" style="display: flex;">
                <div class="${critical ? 'tfa-critical-modal-content' : 'tfa-modal'}" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title">
                    <div class="tfa-modal-header">
                        <h3 class="tfa-modal-title" id="${modalId}-title">${options.icon || ''} ${esc(options.title)}</h3>
                        ${options.closable === false ? '' : `
                        <button type="button" class="tfa-modal-close" data-tfa-close aria-label="${esc(t('tfa.btnClose'))}" title="${esc(t('tfa.btnClose'))}">
                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </button>`}
                    </div>
                    <div class="tfa-modal-body" id="${modalId}-body">${options.body || ''}</div>
                </div>
            </div>`;
        const modal = wrapper.firstElementChild;
        modal._tfaCancel = options.onCancel || null;
        modal.addEventListener('click', function (e) {
            if (e.target.closest('[data-tfa-close]')) {
                e.preventDefault();
                closeModal(modalId);
            }
        });
        modal.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && options.closable !== false) {
                closeModal(modalId);
            }
        });
        document.body.appendChild(modal);
        return modal;
    }

    function loadingBlock(text) {
        return `<div class="tfa-loading-block"><span class="tfa-spinner"></span><p style="margin: 8px 0 0;">${esc(text)}</p></div>`;
    }

    // 6-BOX CODE INPUT

    function otpHtml(id) {
        let html = `<div class="tfa-otp" id="${id}" role="group" aria-label="${esc(t('tfa.verifyInputLabel'))}">`;
        for (let i = 0; i < 6; i++) {
            html += `<input type="text" inputmode="numeric" pattern="[0-9]*" class="tfa-otp-digit"
                        aria-label="${esc(t('tfa.digitLabel', { n: i + 1 }))}"
                        autocomplete="${i === 0 ? 'one-time-code' : 'off'}">`;
        }
        return html + '</div>';
    }

    // onComplete fires once all 6 digits are present (typing, paste or SMS/OS autofill)
    function wireOtp(group, onChange, onComplete) {
        const inputs = Array.prototype.slice.call(group.querySelectorAll('input'));
        const value = () => inputs.map(i => i.value).join('');
        const fill = (digits, start) => {
            digits.split('').forEach((d, k) => {
                if (inputs[start + k]) inputs[start + k].value = d;
            });
            const next = inputs[Math.min(start + digits.length, 5)];
            if (next) next.focus();
        };
        const changed = () => {
            group.classList.remove('tfa-otp--error');
            if (onChange) onChange(value());
            if (/^\d{6}$/.test(value()) && onComplete) onComplete(value());
        };
        inputs.forEach((input, i) => {
            input.addEventListener('input', () => {
                const digits = input.value.replace(/\D/g, '');
                if (digits.length > 1) {
                    input.value = '';
                    fill(digits.slice(0, 6 - i), i);
                } else {
                    input.value = digits;
                    if (digits && inputs[i + 1]) inputs[i + 1].focus();
                }
                changed();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && inputs[i - 1]) {
                    inputs[i - 1].value = '';
                    inputs[i - 1].focus();
                    e.preventDefault();
                    changed();
                } else if (e.key === 'ArrowLeft' && inputs[i - 1]) {
                    inputs[i - 1].focus();
                } else if (e.key === 'ArrowRight' && inputs[i + 1]) {
                    inputs[i + 1].focus();
                }
            });
            input.addEventListener('paste', (e) => {
                const text = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, '');
                if (!text) return;
                e.preventDefault();
                inputs.forEach(x => { x.value = ''; });
                fill(text.slice(0, 6), 0);
                changed();
            });
        });
        return {
            value,
            focus: () => inputs[0].focus(),
            clear: () => { inputs.forEach(x => { x.value = ''; }); inputs[0].focus(); },
            setError: (on) => group.classList.toggle('tfa-otp--error', !!on),
            setDisabled: (on) => inputs.forEach(x => { x.disabled = !!on; })
        };
    }

    // GENERATE MAIN INTERFACE

    function renderSection(status, devices) {
        const on = !!status.is2FAEnabled;
        let html = `
            <div class="tfa-main-interface tfa-container">
                <div class="tfa-sec-head">
                    <span class="tfa-shield ${on ? 'tfa-shield--on' : 'tfa-shield--off'}" aria-hidden="true">
                        <i class="fa-solid ${on ? 'fa-shield-halved' : 'fa-triangle-exclamation'}"></i>
                    </span>
                    <div class="tfa-sec-text">
                        <div class="tfa-sec-title">
                            <span>${esc(t('tfa.title'))}</span>
                            <span class="tfa-chip ${on ? 'tfa-chip--on' : 'tfa-chip--off'}">${esc(on ? t('tfa.chipOn') : t('tfa.chipOff'))}</span>
                        </div>
                        <p class="tfa-sec-desc">${esc(on ? t('tfa.sectionDescOn') : t('tfa.sectionDescOff'))}</p>
                    </div>
                    ${on ? `
                    <button type="button" class="tfa-btn-secondary" data-tfa-action="add">
                        <i class="fa-solid fa-plus" aria-hidden="true"></i> ${esc(t('tfa.btnAddDevice'))}
                    </button>` : `
                    <button type="button" class="tfa-btn-primary" data-tfa-action="enable">
                        <i class="fa-solid fa-shield-halved" aria-hidden="true"></i> ${esc(t('tfa.btnSetUp'))}
                    </button>`}
                </div>`;

        if (on) {
            html += `<div class="tfa-dev-head"><h4>${esc(t('tfa.tabLoadAuthDevicesTab'))}</h4></div><ul class="tfa-devs">`;
            if (!devices.length) {
                html += `<li class="tfa-dev tfa-dev--empty">${esc(t('tfa.noDevicesMessage'))}</li>`;
            }
            devices.forEach(function (device, index) {
                const added = formatDate(device.createdAt || device.created_at || device.CreatedAt || device.createdDate);
                const used = formatDate(device.lastUsedAt || device.lastUsed || device.last_used_at || device.LastUsed);
                html += `
                    <li class="tfa-dev">
                        <span class="tfa-device-icon">${getDeviceIcon(device.deviceInfo)}</span>
                        <div class="tfa-dev-body">
                            <div class="tfa-dev-name" data-tfa-device-id="${esc(device.deviceId)}">${esc(device.deviceInfo)}</div>
                            <div class="tfa-dev-meta">
                                <span>${esc(authMethodLabel(device.authMethod))}</span>
                                ${added ? `<span>${esc(t('tfa.addedOn', { date: added }))}</span>` : ''}
                                ${used ? `<span>${esc(t('tfa.lastUsedOn', { date: used }))}</span>` : ''}
                            </div>
                        </div>
                        <div class="tfa-dev-actions">
                            <button type="button" class="tfa-icon-btn" data-tfa-action="rename" data-tfa-index="${index}"
                                    title="${esc(t('tfa.editDeviceTitle'))}" aria-label="${esc(t('tfa.editDeviceTitle'))}: ${esc(device.deviceInfo)}">
                                <i class="fa-solid fa-pen" aria-hidden="true"></i>
                            </button>
                            <button type="button" class="tfa-icon-btn tfa-icon-btn--danger" data-tfa-action="remove" data-tfa-index="${index}"
                                    title="${esc(t('tfa.removeDeviceTitle'))}" aria-label="${esc(t('tfa.removeDeviceTitle'))}: ${esc(device.deviceInfo)}">
                                <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                            </button>
                        </div>
                    </li>`;
            });
            html += `</ul>
                <div class="tfa-sec-foot">
                    <p>${esc(t('tfa.lastDeviceHint'))}</p>
                    <button type="button" class="tfa-link-danger" data-tfa-action="disable">${esc(t('tfa.btnTurnOff'))}</button>
                </div>`;
        } else {
            html += `
                <div class="tfa-why">
                    <div><b>${esc(t('tfa.whyQuickTitle'))}</b>${esc(t('tfa.whyQuickText'))}</div>
                    <div><b>${esc(t('tfa.whyOfflineTitle'))}</b>${esc(t('tfa.whyOfflineText'))}</div>
                    <div><b>${esc(t('tfa.whyBackupTitle'))}</b>${esc(t('tfa.whyBackupText'))}</div>
                </div>`;
        }
        return html + '</div>';
    }

    // Create the main 2FA management interface. Returns true when rendered.
    async function createMainInterface(container, username, password) {
        const generation = ++currentSession.generation;
        currentSession.activeContainer = container;
        container.innerHTML = loadingBlock(t('tfa.Loading2FAStatus'));

        try {
            const status = await apiRequest('POST', '/auth/status', username, password);
            let devices = [];
            if (status && status.is2FAEnabled) {
                const list = await apiRequest('POST', '/devices/list', username, password);
                devices = (list && list.devices) || [];
            }

            // A newer render (or clear()) happened meanwhile: drop this response
            if (generation !== currentSession.generation || !document.body.contains(container)) {
                return false;
            }

            container.innerHTML = renderSection(status || {}, devices);
            container.onclick = function (e) {
                const btn = e.target.closest('[data-tfa-action]');
                if (!btn || !container.contains(btn)) return;
                const device = devices[parseInt(btn.getAttribute('data-tfa-index'), 10)];
                switch (btn.getAttribute('data-tfa-action')) {
                    case 'enable':
                        TwoFactorLib.enable2FA(username, password);
                        break;
                    case 'add':
                        TwoFactorLib.addNewDevice(username, password);
                        break;
                    case 'disable':
                        TwoFactorLib.disable2FA(username, password);
                        break;
                    case 'rename':
                        if (device) TwoFactorLib.startEditDevice(device.deviceId, device.deviceInfo, username, password);
                        break;
                    case 'remove':
                        if (device) TwoFactorLib.removeDevice(device.deviceId, device.deviceInfo, username, password);
                        break;
                    case 'retry':
                        createMainInterface(container, username, password);
                        break;
                }
            };
            return true;

        } catch (error) {
            console.error('Error creating 2FA interface:', error);
            if (generation !== currentSession.generation) {
                return false;
            }
            container.innerHTML = `
                <div class="tfa-error-block tfa-container">
                    <h3>${esc(t('tfa.statusUnavailable'))}</h3>
                    <p>${esc(t('tfa.statusLoadMessage'))} ${esc(error.message)}</p>
                    <button type="button" class="tfa-btn-secondary" data-tfa-action="retry" style="margin-top: 12px;">
                        ${esc(t('tfa.btnRetry'))}
                    </button>
                </div>`;
            container.onclick = function (e) {
                if (e.target.closest('[data-tfa-action="retry"]')) {
                    createMainInterface(container, username, password);
                }
            };
            return false;
        }
    }

    // The DB user's password is switched server-side (PRC_ActivateTwoFactor etc.).
    // Same pause as the original lib before the portal re-logs with the new password,
    // otherwise OData calls get a 401 and the browser shows its Basic-Auth dialog.
    function waitForDbUserChange() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    function refreshInterface(username, password) {
        if (currentSession.activeContainer) {
            return createMainInterface(currentSession.activeContainer, username, password);
        }
        return Promise.resolve(false);
    }

    // SETUP (enable 2FA / add device)

    function stepsHtml(current) {
        const names = [t('tfa.stepScan'), t('tfa.stepConfirm')];
        return '<ol class="tfa-steps">' + names.map(function (name, i) {
            const cls = i + 1 < current ? 'tfa-step--done' : (i + 1 === current ? 'tfa-step--current' : '');
            return `<li class="${cls}"${i + 1 === current ? ' aria-current="step"' : ''}>${i + 1}. ${esc(name)}</li>`;
        }).join('') + '</ol>';
    }

    function groupKey(secret) {
        return String(secret || '').replace(/(.{4})/g, '$1 ').trim();
    }

    async function show2FASetup(username, password, isAdditional) {
        const modalId = 'tfa-setup-modal';
        const titleText = isAdditional ? t('tfa.btnAddDevice') : t('tfa.setupTitle');
        createModal(modalId, {
            title: titleText,
            icon: '<i class="fa-solid fa-qrcode" aria-hidden="true" style="color: var(--tfa-accent);"></i>',
            body: loadingBlock(t('tfa.setupLoading'))
        });

        let result;
        try {
            result = await apiRequest('POST', '/auth/setup-2fa', username, password, {
                deviceInfo: detectDevice()
            });
            if (!result || !result.success || !result.totpSetup) {
                throw new Error((result && result.message) || t('tfa.setupFailed'));
            }
        } catch (error) {
            removeModal(modalId, false);
            throw error;
        }

        const state = {
            sessionToken: result.sessionToken,
            secret: result.totpSetup.secret,
            qr: result.totpSetup.qrCodeDataURL,
            deviceName: detectDevice()
        };

        const body = () => document.getElementById(modalId + '-body');

        const renderScan = () => {
            const el = body();
            if (!el) return;
            el.innerHTML = `
                ${stepsHtml(1)}
                <div class="tfa-qr-row">
                    <div class="tfa-qr-card">
                        <div class="tfa-qr-container"><img src="${esc(state.qr)}" alt="${esc(t('tfa.infoQrCodeAlt'))}"></div>
                    </div>
                    <div class="tfa-qr-side">
                        <p class="tfa-small">${esc(t('tfa.scanHint'))}</p>
                        <p class="tfa-small">${esc(t('tfa.setupAppSuggestions'))}</p>
                        <p class="tfa-small tfa-small--gap">${esc(t('tfa.cantScan'))}</p>
                        <code class="tfa-key">${esc(groupKey(state.secret))}</code>
                        <button type="button" class="tfa-btn-secondary tfa-btn-sm" data-tfa-copy>
                            <i class="fa-solid fa-copy" aria-hidden="true"></i> ${esc(t('tfa.backupCopy'))}
                        </button>
                    </div>
                </div>
                <div class="tfa-modal-actions">
                    <button type="button" class="tfa-btn-cancel" data-tfa-close>${esc(t('tfa.btnCancel'))}</button>
                    <button type="button" class="tfa-btn-primary" data-tfa-next>${esc(t('tfa.btnScanned'))}</button>
                </div>`;
            el.querySelector('[data-tfa-copy]').onclick = () => TwoFactorLib.copyToClipboard(state.secret);
            el.querySelector('[data-tfa-next]').onclick = renderConfirm;
            el.querySelector('[data-tfa-next]').focus();
        };

        const renderConfirm = () => {
            const el = body();
            if (!el) return;
            const submitLabel = isAdditional ? t('tfa.btnAddDevice') : t('tfa.btnTurnOn');
            el.innerHTML = `
                ${stepsHtml(2)}
                <form id="tfa-setup-form" novalidate>
                    <div class="tfa-form-group">
                        <label class="tfa-form-label" for="tfa-device-name">${esc(t('tfa.deviceName'))}</label>
                        <input type="text" id="tfa-device-name" class="tfa-input" maxlength="50"
                               value="${esc(state.deviceName)}" placeholder="${esc(t('tfa.deviceNamePlaceholder'))}">
                        <small class="tfa-form-help">${esc(t('tfa.deviceNameHelp'))}</small>
                    </div>
                    <p class="tfa-small tfa-center">${esc(t('tfa.confirmHint'))}</p>
                    ${otpHtml('tfa-setup-code')}
                    <div id="tfa-setup-error" class="tfa-error-message" role="alert"></div>
                    <div class="tfa-modal-actions">
                        <button type="button" class="tfa-btn-cancel" data-tfa-back>${esc(t('tfa.btnBack'))}</button>
                        <button type="submit" id="tfa-setup-submit" class="tfa-btn-primary" data-label="${esc(submitLabel)}" disabled>
                            <span id="tfa-setup-btn-text">${esc(submitLabel)}</span>
                            <span id="tfa-setup-spinner" class="tfa-spinner" style="display: none;"></span>
                        </button>
                    </div>
                </form>`;

            const form = el.querySelector('#tfa-setup-form');
            const nameInput = el.querySelector('#tfa-device-name');
            const submitBtn = el.querySelector('#tfa-setup-submit');
            let busy = false;

            const isValid = () => nameInput.value.trim().length >= 3 && /^\d{6}$/.test(otp.value());
            const otp = wireOtp(el.querySelector('#tfa-setup-code'),
                () => { submitBtn.disabled = busy || !isValid(); },
                () => { if (isValid() && !busy) submit(); });

            nameInput.addEventListener('input', () => {
                state.deviceName = nameInput.value;
                submitBtn.disabled = busy || !isValid();
            });
            el.querySelector('[data-tfa-back]').onclick = renderScan;

            const submit = async () => {
                const deviceName = nameInput.value.trim();
                const code = otp.value();
                if (deviceName.length < 3) {
                    TwoFactorLib.showSetupError(t('tfa.showSetupErrorDeviceName'));
                    nameInput.focus();
                    return;
                }
                if (!/^\d{6}$/.test(code)) {
                    TwoFactorLib.showSetupError(t('tfa.showSetupErrorDeviceCode'));
                    otp.focus();
                    return;
                }
                busy = true;
                TwoFactorLib.setSetupLoading(true);
                TwoFactorLib.hideSetupError();
                otp.setDisabled(true);
                try {
                    const verifyResult = await apiRequest('POST', '/auth/verify-2fa', username, password, {
                        sessionToken: state.sessionToken,
                        totpCode: code,
                        deviceName: deviceName,
                        username: username
                    });
                    if (!verifyResult || !verifyResult.success) {
                        throw new Error((verifyResult && verifyResult.message) || t('tfa.verifyFailedRetry'));
                    }

                    removeModal(modalId, false);
                    showSuccess(t('tfa.deviceAdded', { name: deviceName }));

                    // Notify app of DBPassword at once (the portal switches its OData password)
                    if (typeof currentSession.setPasswordCallback === 'function' && verifyResult.dbPassword) {
                        currentSession.setPasswordCallback(verifyResult.dbPassword);
                    }
                    await waitForDbUserChange();
                    await refreshInterface(username, verifyResult.dbPassword || password);
                } catch (error) {
                    console.error('Setup verification error:', error);
                    busy = false;
                    TwoFactorLib.setSetupLoading(false);
                    otp.setDisabled(false);
                    otp.setError(true);
                    TwoFactorLib.showSetupError(error.message || t('tfa.verifyFailedRetry'));
                    otp.clear();
                }
            };

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!busy) submit();
            });
            otp.focus();
        };

        renderScan();
    }

    // TWOFACTOR LIBRARY - OBJECT

    let TwoFactorLib = {

        // entry point for the 2FA library (account page)
        getStatus: function (root, username, password, setTokenPassword, language, hostName) {
            const promise = (async () => {
                try {
                    if (hostName) API_HOSTNAME = hostName;
                    if (!root || !('innerHTML' in root)) {
                        throw new Error('Invalid root container element');
                    }
                    injectCSS();

                    // Store ONLY UI references and callback, NO credentials
                    currentSession.setPasswordCallback = setTokenPassword;

                    const ok = await createMainInterface(root, username, password);
                    return {
                        status: ok ? 'success' : 'error',
                        message: ok ? '2FA interface loaded successfully' : '2FA interface could not be loaded',
                        username: username
                    };
                } catch (error) {
                    console.error('Error in TwoFactorLib.getStatus:', error);
                    if (root && 'innerHTML' in root) {
                        root.innerHTML = `
                            <div class="tfa-error-block tfa-container">
                                <h3>${esc(t('tfa.serviceError'))}</h3>
                                <p>${esc(t('tfa.interfaceLoadError'))}: ${esc(error.message)}</p>
                            </div>`;
                    }
                    return { status: 'error', message: error.message, error: error };
                }
            })();
            return toWinJSPromise(promise);
        },

        // code prompt during login; always resolves or rejects
        verify2FA: function (root, username, password, setTokenPassword, language, hostName) {
            const promise = new Promise((resolve, reject) => {
                if (hostName) {
                    API_HOSTNAME = hostName;
                }
                injectCSS();

                const modalId = 'tfa-verify-modal';
                createModal(modalId, {
                    title: t('tfa.verifyTitle'),
                    icon: '<i class="fa-solid fa-shield-halved" aria-hidden="true" style="color: var(--tfa-success);"></i>',
                    onCancel: () => reject({ status: 'cancelled', message: '2FA verification cancelled by user' }),
                    body: `
                        <form id="tfa-verify-form" novalidate>
                            <p class="tfa-small tfa-center">${esc(t('tfa.verifyInstruction'))}</p>
                            ${otpHtml('tfa-verify-code')}
                            <div id="tfa-verify-error" class="tfa-error-message" role="alert" style="text-align: center;"></div>
                            <div class="tfa-modal-actions">
                                <button type="button" class="tfa-btn-cancel" data-tfa-close>${esc(t('tfa.btnCancel'))}</button>
                                <button type="submit" id="tfa-verify-submit" class="tfa-btn-primary" disabled>${esc(t('tfa.btnVerify'))}</button>
                            </div>
                        </form>`
                });

                const form = document.getElementById('tfa-verify-form');
                const submitBtn = document.getElementById('tfa-verify-submit');
                const errorDiv = document.getElementById('tfa-verify-error');
                let busy = false;

                const showVerifyError = (message) => {
                    errorDiv.textContent = message;
                    errorDiv.style.display = 'block';
                };

                const otp = wireOtp(document.getElementById('tfa-verify-code'),
                    (value) => { submitBtn.disabled = busy || !/^\d{6}$/.test(value); },
                    () => { if (!busy) submit(); });

                const submit = async () => {
                    const code = otp.value();
                    if (!/^\d{6}$/.test(code)) {
                        showVerifyError(t('tfa.pleaseEnterCode'));
                        return;
                    }
                    busy = true;
                    submitBtn.disabled = true;
                    submitBtn.textContent = t('tfa.verifying');
                    otp.setDisabled(true);
                    errorDiv.style.display = 'none';

                    try {
                        const result = await apiRequest('POST', '/auth/verify-2fa', username, password, {
                            totpCode: code,
                            username: username
                        });
                        if (!result || !result.success) {
                            throw new Error((result && result.message) || t('tfa.verifyFailedRetry'));
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
                        removeModal(modalId, false);
                    } catch (error) {
                        console.error('2FA verification error:', error);
                        busy = false;
                        showVerifyError(error.message || t('tfa.verifyFailedRetry'));
                        submitBtn.textContent = t('tfa.btnVerify');
                        otp.setDisabled(false);
                        otp.setError(true);
                        otp.clear();
                        submitBtn.disabled = true;
                    }
                };

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (!busy) submit();
                });
                setTimeout(() => otp.focus(), 50);
            });

            return toWinJSPromise(promise);
        },

        enable2FA: async function (username, password) {
            try {
                await show2FASetup(username, password, false);
            } catch (error) {
                if (error && error.message !== 'Operation cancelled') {
                    showError(`${t('tfa.enableFailed')}: ${error.message}`);
                }
            }
        },

        // Disable 2FA
        disable2FA: async function (username, currentPassword) {
            try {
                const result = await TwoFactorLib.showDisable2FAModal(username, currentPassword);
                if (result.success) {
                    const passwordToUse = result.originalPassword || currentPassword;

                    // Notify app of password change at once
                    if (typeof currentSession.setPasswordCallback === 'function') {
                        currentSession.setPasswordCallback(passwordToUse);
                    }
                    await waitForDbUserChange();
                    showSuccess(t('tfa.disabledSuccess'));
                    await refreshInterface(username, passwordToUse);
                }
            } catch (error) {
                if (error && error.message !== 'Operation cancelled') {
                    console.error('Error in disable2FA:', error);
                    showError(`${t('tfa.disableFailed')}: ${error.message}`);
                }
            }
        },

        // Clear interface - only resets the session owned by this root
        clear: function (root) {
            try {
                if (!root || !('innerHTML' in root)) {
                    throw new Error('Invalid root container element');
                }
                root.innerHTML = '';
                root.onclick = null;
                if (!currentSession.activeContainer || currentSession.activeContainer === root) {
                    currentSession.generation++;
                    currentSession.activeContainer = null;
                    currentSession.setPasswordCallback = null;
                }
                closeAllModals();
                return { status: 'success', message: '2FA interface cleared' };
            } catch (error) {
                return { status: 'error', message: error.message };
            }
        },

        // add a new device
        addNewDevice: async function (username, password) {
            try {
                await show2FASetup(username, password, true);
            } catch (error) {
                if (error && error.message !== 'Operation cancelled') {
                    showError(`${t('tfa.addDeviceFailed')}: ${error.message}`);
                }
            }
        },

        removeDevice: async function (deviceId, deviceName, username, currentPassword) {
            try {
                let isLastDevice = false;
                try {
                    const devicesList = await apiRequest('POST', '/devices/list', username, currentPassword);
                    isLastDevice = !!(devicesList.devices && devicesList.devices.length === 1);
                } catch (error) {
                    console.warn('Could not check device count:', error);
                }

                const result = await TwoFactorLib.showRemoveDeviceModal(deviceId, deviceName, username, currentPassword, isLastDevice);
                if (result.success) {
                    if (result.twoFactorDisabled) {
                        const passwordToUse = result.originalPassword || result.currentPassword ||
                            (result.data && result.data.DBPassword) || currentPassword;
                        if (typeof currentSession.setPasswordCallback === 'function') {
                            currentSession.setPasswordCallback(passwordToUse);
                        }
                        await waitForDbUserChange();
                        showSuccess(t('tfa.lastDeviceRemovedSuccess'));
                        await refreshInterface(username, passwordToUse);
                    } else {
                        showSuccess(`${t('tfa.deviceRemoved')} "${deviceName}" ${t('tfa.successfully')}`);
                        await refreshInterface(username, currentPassword);
                    }
                }
            } catch (error) {
                if (error && error.message !== 'Operation cancelled') {
                    console.error('Error in removeDevice:', error);
                    showError(`${t('tfa.removeDeviceFailed')}: ${error.message}`);
                }
            }
        },

        showRemoveDeviceModal: function (deviceId, deviceName, username, currentPassword, isLastDevice = false) {
            return new Promise((resolve, reject) => {
                createModal('tfa-remove-device-modal', {
                    critical: true,
                    title: t('tfa.removeDeviceTitle'),
                    icon: '<i class="fa-solid fa-trash-can" aria-hidden="true" style="color: var(--tfa-error);"></i>',
                    onCancel: () => reject(new Error('Operation cancelled')),
                    body: `
                        ${isLastDevice ? `
                        <div class="tfa-warning-box">
                            <div class="tfa-warning-icon"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>
                            <div class="tfa-warning-content">
                                <div class="tfa-warning-title">${esc(t('tfa.lastDeviceWarningTitle'))}</div>
                                <p class="tfa-warning-text">${esc(t('tfa.lastDeviceWarningText'))}</p>
                            </div>
                        </div>` : ''}
                        <div class="tfa-form-group">
                            <label class="tfa-form-label">${esc(t('tfa.deviceToRemove'))}</label>
                            <div class="tfa-readonly-field">${esc(deviceName)}</div>
                        </div>
                        <form id="tfa-remove-device-form">
                            <div class="tfa-form-group">
                                <label class="tfa-form-label" for="tfa-remove-password">${esc(t('tfa.originalPasswordLabel'))}</label>
                                <input type="password" id="tfa-remove-password" class="tfa-form-input" autocomplete="current-password"
                                       placeholder="${esc(t('tfa.originalPasswordPlaceholder'))}" required>
                            </div>
                            <div id="tfa-remove-error" class="tfa-error-message" role="alert"></div>
                            <div class="tfa-modal-actions">
                                <button type="button" class="tfa-btn-cancel" data-tfa-close>${esc(t('tfa.btnCancel'))}</button>
                                <button type="submit" class="tfa-btn-danger">
                                    <span id="tfa-remove-btn-text">${esc(isLastDevice ? t('tfa.btnRemoveDisable') : t('tfa.btnRemove'))}</span>
                                    <span id="tfa-remove-spinner" class="tfa-spinner" style="display: none;"></span>
                                </button>
                            </div>
                        </form>`
                });

                const form = document.getElementById('tfa-remove-device-form');
                const passwordInput = document.getElementById('tfa-remove-password');

                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const originalPassword = passwordInput.value.trim();
                    if (!originalPassword) {
                        TwoFactorLib.showRemoveError(t('tfa.passwordRequired'));
                        return;
                    }
                    TwoFactorLib.setRemoveLoading(true);
                    TwoFactorLib.hideRemoveError();
                    try {
                        const result = await apiRequest('POST', '/devices/remove', username, originalPassword, {
                            deviceId: deviceId,
                            confirmDelete: isLastDevice
                        });
                        if (!result || !result.success) {
                            throw new Error((result && result.message) || t('tfa.removeDeviceFailed'));
                        }
                        const data = result.data || {};
                        resolve({
                            success: true,
                            twoFactorDisabled: result.twoFactorDisabled,
                            originalPassword: result.originalPassword || result.currentPassword || data.originalPassword || originalPassword,
                            currentPassword: result.currentPassword || result.originalPassword || data.originalPassword || originalPassword,
                            data: result
                        });
                        removeModal('tfa-remove-device-modal', false);
                    } catch (error) {
                        TwoFactorLib.showRemoveError(error.message);
                    } finally {
                        TwoFactorLib.setRemoveLoading(false);
                    }
                };

                setTimeout(() => passwordInput.focus(), 50);
            });
        },

        // Inline rename of an authentication device
        startEditDevice: function (deviceId, currentName, username, password) {
            const root = currentSession.activeContainer || document;
            const nameElement = Array.prototype.slice.call(root.querySelectorAll('[data-tfa-device-id]'))
                .filter(el => el.getAttribute('data-tfa-device-id') === String(deviceId))[0];
            if (!nameElement) return;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.maxLength = 50;
            input.className = 'tfa-input tfa-input--inline';
            input.setAttribute('aria-label', t('tfa.editDeviceTitle'));
            nameElement.replaceWith(input);
            input.focus();
            input.select();

            let done = false;
            const restoreOriginalName = () => {
                if (done) return;
                done = true;
                input.replaceWith(nameElement);
            };

            const saveEdit = async () => {
                if (done) return;
                const newName = input.value.trim();
                if (!newName || newName === currentName || newName.length < 3) {
                    restoreOriginalName();
                    return;
                }
                done = true;
                input.disabled = true;
                try {
                    const result = await apiRequest('POST', '/devices/rename', username, password, {
                        deviceId: deviceId,
                        newDeviceName: newName
                    });
                    if (!result || !result.success) {
                        throw new Error((result && result.message) || t('tfa.renameDeviceFailed'));
                    }
                    showSuccess(`${t('tfa.deviceRenamed')} "${newName}"`);
                    await refreshInterface(username, password);
                } catch (error) {
                    showError(`${t('tfa.renameDeviceFailed')}: ${error.message}`);
                    input.replaceWith(nameElement);
                }
            };

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
                submitBtn.disabled = !!loading;
                btnText.textContent = loading ? t('tfa.processing') : (submitBtn.getAttribute('data-label') || t('tfa.btnTurnOn'));
                spinner.style.display = loading ? 'inline-block' : 'none';
            }
        },

        copyToClipboard: function (text) {
            const fallback = () => {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showSuccess(t('tfa.copiedToClipboard'));
                } catch (err) {
                    showError(t('tfa.copyFailed'));
                }
                document.body.removeChild(textArea);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showSuccess(t('tfa.copiedToClipboard'));
                }).catch(fallback);
            } else {
                fallback();
            }
        },

        showDisable2FAModal: function (username, currentPassword) {
            return new Promise((resolve, reject) => {
                createModal('tfa-disable-2fa-modal', {
                    critical: true,
                    title: t('tfa.disableTitle'),
                    icon: '<i class="fa-solid fa-unlock" aria-hidden="true" style="color: var(--tfa-warning);"></i>',
                    onCancel: () => reject(new Error('Operation cancelled')),
                    body: `
                        <div class="tfa-warning-box">
                            <div class="tfa-warning-icon"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>
                            <div class="tfa-warning-content">
                                <p class="tfa-warning-text">${esc(t('tfa.disableWarning'))}</p>
                            </div>
                        </div>
                        <form id="tfa-disable-2fa-form">
                            <div class="tfa-form-group">
                                <label class="tfa-form-label" for="tfa-disable-password">${esc(t('tfa.disableLabelPassword'))}</label>
                                <input type="password" id="tfa-disable-password" class="tfa-form-input" autocomplete="current-password"
                                       placeholder="${esc(t('tfa.disableEnterPassword'))}" required>
                            </div>
                            <div id="tfa-disable-error" class="tfa-error-message" role="alert"></div>
                            <div class="tfa-modal-actions">
                                <button type="button" class="tfa-btn-cancel" data-tfa-close>${esc(t('tfa.btnCancel'))}</button>
                                <button type="submit" class="tfa-btn-danger">
                                    <span id="tfa-disable-btn-text">${esc(t('tfa.btnTurnOff'))}</span>
                                    <span id="tfa-disable-spinner" class="tfa-spinner" style="display: none;"></span>
                                </button>
                            </div>
                        </form>`
                });

                const form = document.getElementById('tfa-disable-2fa-form');
                const passwordInput = document.getElementById('tfa-disable-password');

                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const originalPassword = passwordInput.value.trim();
                    if (!originalPassword) {
                        TwoFactorLib.showDisableError(t('tfa.passwordRequired'));
                        return;
                    }
                    TwoFactorLib.setDisableLoading(true);
                    TwoFactorLib.hideDisableError();
                    try {
                        const result = await apiRequest('POST', '/auth/disable-2fa', username, originalPassword);
                        if (!result || !result.success) {
                            throw new Error((result && result.message) || t('tfa.disableFailed'));
                        }
                        resolve({
                            success: true,
                            message: result.message || '2FA disabled successfully',
                            data: result,
                            originalPassword: result.originalPassword || originalPassword
                        });
                        removeModal('tfa-disable-2fa-modal', false);
                    } catch (error) {
                        TwoFactorLib.showDisableError(`${t('tfa.disableFailed')}: ${error.message}`);
                    } finally {
                        TwoFactorLib.setDisableLoading(false);
                    }
                };

                setTimeout(() => passwordInput.focus(), 50);
            });
        },

        closeRemoveDeviceModal: function () {
            closeModal('tfa-remove-device-modal');
        },

        closeDisable2FAModal: function () {
            closeModal('tfa-disable-2fa-modal');
        },

        showRemoveError: function (message) {
            const errorDiv = document.getElementById('tfa-remove-error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
        },

        hideRemoveError: function () {
            const errorDiv = document.getElementById('tfa-remove-error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        },

        setRemoveLoading: function (loading) {
            const spinner = document.getElementById('tfa-remove-spinner');
            const submitBtn = document.querySelector('#tfa-remove-device-form button[type="submit"]');
            if (spinner && submitBtn) {
                submitBtn.disabled = !!loading;
                spinner.style.display = loading ? 'inline-block' : 'none';
            }
        },

        showDisableError: function (message) {
            const errorDiv = document.getElementById('tfa-disable-error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
        },

        hideDisableError: function () {
            const errorDiv = document.getElementById('tfa-disable-error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        },

        setDisableLoading: function (loading) {
            const spinner = document.getElementById('tfa-disable-spinner');
            const submitBtn = document.querySelector('#tfa-disable-2fa-form button[type="submit"]');
            if (spinner && submitBtn) {
                submitBtn.disabled = !!loading;
                spinner.style.display = loading ? 'inline-block' : 'none';
            }
        },

        // Check if device is the last active device for user
        isLastActiveDevice: async function (username, password) {
            try {
                const devicesList = await apiRequest('POST', '/devices/list', username, password);
                return !!(devicesList.devices && devicesList.devices.length <= 1);
            } catch (error) {
                console.warn('Could not check if last device:', error);
                return false;
            }
        }
    };

    globalObject.TwoFactorLib = TwoFactorLib;

})();
