// (function () {
// 	"use strict";
	
//     function generateHTML(status, username) {

//         try {
//             const container = document.createElement('div');
//             // container.classList.add();

//             const statusText = document.createElement('h1');
//             // statusText.classList.add();

//             const statusPassword = document.createElement('input');
//             statusPassword.type = 'password';
//             statusPassword.classList.add('input_field', 'win-textbox', 'twoFAinput');
//             statusPassword.placeholder = 'Password';

//             const statusButton = document.createElement('button');
//             statusButton.id = 'statusButton';
//             statusButton.classList.add('list-button-left', 'win-button', 'enable2FA');

//             // TODO: Dynamically get username
//             switch (status) {
//                 case 'active':
//                     statusText.textContent = 'Two Factor Authentication is Active';
//                     statusButton.textContent = 'Disable Two Factor';
//                     statusButton.addEventListener('click', () => {
//                         TwoFactorLib.changeStatus(username, statusPassword.value, 'disable');
//                     });
//                     break;

//                 case 'inactive':
//                     statusText.textContent = 'Two Factor Authentication is Inactive';
//                     statusButton.textContent = 'Enable Two Factor';
//                     statusButton.addEventListener('click', () => {
//                         TwoFactorLib.changeStatus(username, statusPassword.value, 'enable');
//                     });
//                     break;

//                 case 'create':
//                     statusText.textContent = 'You have not configured Two Factor Authentication';
//                     statusButton.textContent = 'Enable Two Factor'
//                     statusButton.addEventListener('click', () => {
//                         TwoFactorLib.changeStatus(username, statusPassword.value, 'create');
//                     });
//                     break;

//                 default:
//                     break;
//             }

//             container.appendChild(statusText);
//             container.appendChild(statusPassword);
//             container.appendChild(statusButton);
//             return container
//         } catch (error) {
//             console.log('Error when generating HTML: ', error)
//         }

//     };

// 	let globalObject =
// 		typeof window !== 'undefined' ? window :
// 		typeof self !== 'undefined' ? self :
// 		typeof global !== 'undefined' ? global :
// 		{};
	
// 	let TwoFactorLib = {
		
// 	};

//     // erzeugt die Oberfl�che f�r TFA-Administration innerhalb von root-Element
//     // Diese Oberfl�che wird mit clear() wieder entfernt
//     // nach erfolgreicher Authentifizierung ist callback-function aufzurufen mit dem 
//     // DB-Password das von der Datenbank beim Aufruf von PRC_ActivateTwoFactor zur�ckgegeben wird:
//     // setDBPassword(dbPassword)
//     // return-Wert: { resultCode: number, resultMessage: string }
//     // bei resultCode === 0 ist alles ok sonst wird resultMessage als Fehlertext angezeigt
//     TwoFactorLib.getStatus = async function (root, username, setDBPassword, language) {

// 		try {
//             if (root && 'innerHTML' in root) {
//                 //root.innerHTML = "alles ok! <b>" + username + "</b>";
//                 /*
// 				console.log(root)
// 				// const twoFactor = document.createElement('p');
// 				// twoFactor.textContent = 'Hello' + username;
// 				// root.appendChild(twoFactor);
// 				// return {status: 'success', root: root};

// 				// Request logic
// 				const response = await fetch('/node2fa/getStatus', {
// 					method: 'POST',
// 					headers: { 'Content-Type': 'application/json' },
// 					body: JSON.stringify({
// 						username: username
// 					})
// 				}); 
// 				const responseData = await response.json();
// 				console.log(responseData);
// 				if (responseData.exists) {
// 					if (responseData.active) {
// 						root.appendChild(generateHTML('active', username));
// 						return {status: 'success', root: root};
// 					} else {
// 						root.appendChild(generateHTML('inactive', username));
// 						return {status: 'success', root: root};
// 					}
// 				} else {
// 				   root.appendChild(generateHTML('create', root));
// 				   return {status: 'success', root: root};
// 				}
//                 */
//                 return { status: 'ok' };
// 			} else {
// 				throw new Error('Invalid root object');
//             }
// 		} catch (error) {
// 			console.error('Error getting status: ', error);
// 			return {status: 'error', message: error};
// 		}
//     };

//     // erzeugt Popup-Dialog f�r TFA-Authentifizierung mit root-Element als Anker
//     // nach Eingabe wird der Popup-Dialog wieder entfernt
//     // nach erfolgreicher Authentifizierung ist callback-function aufzurufen mit dem 
//     // DB-Password das von der Datenbank beim Aufruf von PRC_ActivateTwoFactor zur�ckgegeben wird:
//     // setDBPassword(dbPassword)
//     // return-Wert: { resultCode: number, resultMessage: string }
//     // bei resultCode === 0 ist alles ok sonst wird resultMessage als Fehlertext angezeigt
//     TwoFactorLib.verify2FA = async function (root, username, setDBPassword, language) {
//         try {
//             if (root && 'innerHTML' in root) {
//                 //root.innerHTML = "alles ok! <b>" + username + "</b>";
//                 /*
//                 const response = await fetch('/node2fa/verify2FA', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                         username: username,
//                         token: token
//                     })
//                 });
//                 const responseData = await response.json();
//                 console.log(responseData);
//                 */
//                 return { status: 'ok' };
//             } else {
//                 throw new Error('Invalid root object');
//             }
//         } catch (error) {
//             console.error('Error getting status: ', error);
//             return { status: 'error', message: error };
//         }
//         // Returns responseData.success = true if it validated, false if not

//     }


// /*
// 	TwoFactorLib.changeStatus = async function(username, password, action) {

// 		const response = await fetch('/node2fa/changeStatus', {
// 			method: 'POST',
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify({
// 				username: username,
// 				password: password,
// 				action: action
// 			})
// 		}); 
// 		const responseData = await response.json();
// 		console.log(responseData);
// 		if (responseData.waiting) {
// 			const qrCode = document.createElement('div');
// 			qrCode.innerHTML = responseData.device.info;
// 			const container = document.createElement('div');

//             const statusPassword = document.createElement('input');
//             statusPassword.classList.add('input_field', 'win-textbox', 'twoFAinput');
// 			statusPassword.type = 'number';
//             statusPassword.placeholder = 'Authentication Token';

// 			const statusButton = document.createElement('button');
//             statusButton.id = 'statusButton';
//             statusButton.classList.add('list-button-left', 'win-button', 'enable2FA');
// 			statusButton.textContent = 'Confirm Two Factor';
// 			statusButton.addEventListener('click', () => {
// 				console.log('Verifying with DeviceID ', responseData.device.id, ' and token: ', statusPassword.value);
// 				TwoFactorLib.confirmActivation(responseData.device.id, statusPassword.value, username);
// 			});

// 			container.appendChild(qrCode);
// 			container.appendChild(statusPassword);
// 			container.appendChild(statusButton);

// 			document.getElementById('2faContainer').innerHTML = '';
// 			document.getElementById('2faContainer').appendChild(container);
// 		} else {
// 			const root = document.getElementById('2faContainer');
// 			TwoFactorLib.clear(root);
// 			TwoFactorLib.getStatus(root, username);
// 		}

// 	};

// 	TwoFactorLib.confirmActivation = async function (deviceID, token, username) {
		
// 		const response = await fetch('/node2fa/confirmActivation', {
// 			method: 'POST',
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify({
// 				deviceID: deviceID,
// 				token: token,
// 				username: username
// 			})
// 		});
// 		const responseData = await response.json();
// 		if (response.ok) {
// 			let localStore = JSON.parse(window.localStorage.getItem("LeadSuccessPortal.PersistentStates.json"));
// 			localStore.odata.password = responseData.pass
// 			// Reload
// 			const root = document.getElementById('2faContainer');
// 			TwoFactorLib.clear(root);
// 			TwoFactorLib.getStatus(root, responseData.username);
// 		}
// 		// const responseData = await response.json();
// 		// console.log(responseData);


// 	};
// */
// 	TwoFactorLib.clear = function(root) {
// 		try {
// 			if (root && 'innerHTML' in root) {
// 				root.innerHTML = '';
// 				return {status: 'success', root: root};
// 			} else {
// 				throw new Error('Invalid root object');
// 			}
// 		} catch (error) {
// 			console.error('Error clearing: ', error);
// 			return {status: 'error', message: error};
// 		}
// 	};

// 	globalObject["TwoFactorLib"] = TwoFactorLib;
// }());

/**
 * twoFactorLib.js - Complete 2FA Library for LeadSuccess Portal
 */
(function () {
    "use strict";
    
    // Backend API configuration
    const API_BASE_URL = window.location.origin + '/api/v1'; 
    
    // Global state of the 2FA application
    let currentUser = null;
    let sessionToken = null;
    let currentUserPassword = null;
    let activeTab = 'overview';
    
    // Reference to the global object (window, self, global)
    let globalObject =
        typeof window !== 'undefined' ? window :
        typeof self !== 'undefined' ? self :
        typeof global !== 'undefined' ? global :
        {};

    // =============================================================================
    // HELPER FUNCTIONS - Utility functions
    // =============================================================================

    /**
     * Makes an API request to the 2FA backend
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Data to send
     * @returns {Promise} - Promise of the response
     */
    async function apiRequest(method, endpoint, data = null) {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (sessionToken) {
            options.headers['X-Session-Token'] = sessionToken;
        }

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Request failed with status ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Detects device type from User-Agent string
     * @param {string} userAgent - User-Agent string
     * @returns {string} - Detected device name
     */
    function detectDeviceFromUserAgent(userAgent = navigator.userAgent) {
        const ua = userAgent.toLowerCase();
        
        // Mobile devices
        if (ua.includes('mobile')) {
            if (ua.includes('android')) return 'Android Mobile';
            if (ua.includes('iphone')) return 'iPhone';
            return 'Mobile Device';
        }
        
        // Tablets
        if (ua.includes('tablet') || ua.includes('ipad')) {
            if (ua.includes('ipad')) return 'iPad';
            return 'Tablet';
        }
        
        // Desktop browsers
        if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome Browser';
        if (ua.includes('firefox')) return 'Firefox Browser';
        if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari Browser';
        if (ua.includes('edge')) return 'Edge Browser';
        if (ua.includes('opera')) return 'Opera Browser';
        
        return 'Web Browser';
    }

    /**
     * Gets the icon for a device type
     * @param {string} deviceInfo - Device information
     * @returns {string} - Emoji representing the device
     */
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

    /**
     * Masks sensitive data for display
     * @param {string} data - Data to mask
     * @returns {string} - Masked data
     */
    function maskSensitiveData(data) {
        if (!data || data.length < 8) return '***MASKED***';
        return data.substring(0, 4) + '***' + data.substring(data.length - 4);
    }

    /**
     * Shows a modern confirmation dialog
     * @param {string} message - Message to display
     * @returns {boolean} - True if confirmed
     */
    function showConfirm(message) {
        // For WinJS, you can use MessageDialog or native confirm
        return confirm(message);
    }

    /**
     * Shows an error notification
     * @param {string} message - Error message
     */
    function showError(message) {
        console.error('2FA Error:', message);
        // For WinJS, you can use your existing notification system
        // or adapt with MessageDialog
        alert('2FA Error: ' + message);
    }

    /**
     * Shows a success notification
     * @param {string} message - Success message
     */
    function showSuccess(message) {
        console.log('2FA Success:', message);
        // For WinJS, adapt with your notification system
        alert('Success: ' + message);
    }

    // =============================================================================
    // UI GENERATION FUNCTIONS - Interface generation functions
    // =============================================================================

    /**
     * Creates the main 2FA management interface
     * @param {string} status - 2FA state ('active', 'inactive', 'create')
     * @param {string} username - Username
     * @param {Object} userData - User data
     * @returns {HTMLElement} - DOM element of the interface
     */
    function generateMainInterface(status, username, userData = {}) {
        const container = document.createElement('div');
        container.className = 'tfa-main-container';
        container.style.cssText = `
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 10px 0;
        `;

        // Header with 2FA status
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom: 20px; text-align: center;';
        
        const statusIcon = status === 'active' ? '🔒' : (status === 'inactive' ? '🔓' : '🔐');
        const statusText = status === 'active' ? 'Two-Factor Authentication Active' :
                          status === 'inactive' ? 'Two-Factor Authentication Inactive' :
                          'Two-Factor Authentication Not Configured';
        
        header.innerHTML = `
            <div style="font-size: 2em; margin-bottom: 10px;">${statusIcon}</div>
            <h2 style="margin: 0; color: #333;">${statusText}</h2>
            <p style="color: #666; margin: 5px 0;">User: <strong>${username}</strong></p>
        `;

        // Tab navigation
        const tabNavigation = document.createElement('div');
        tabNavigation.className = 'tfa-tab-navigation';
        tabNavigation.style.cssText = `
            display: flex;
            border-bottom: 2px solid #ddd;
            margin-bottom: 20px;
        `;

        const tabs = [
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'devices', label: 'Devices', icon: '📱' },
            { id: 'sessions', label: 'Sessions', icon: '🔗' }
        ];

        tabs.forEach(tab => {
            const tabButton = document.createElement('button');
            tabButton.className = 'tfa-tab-button';
            tabButton.style.cssText = `
                flex: 1;
                padding: 12px;
                border: none;
                background: ${activeTab === tab.id ? '#007acc' : 'transparent'};
                color: ${activeTab === tab.id ? 'white' : '#333'};
                cursor: pointer;
                font-size: 14px;
                font-weight: ${activeTab === tab.id ? 'bold' : 'normal'};
                transition: all 0.3s ease;
            `;
            tabButton.innerHTML = `${tab.icon} ${tab.label}`;
            tabButton.onclick = () => switchTab(tab.id, container, username, userData);
            tabNavigation.appendChild(tabButton);
        });

        // Tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tfa-tab-content';
        tabContent.id = 'tfa-tab-content';

        // Final assembly
        container.appendChild(header);
        container.appendChild(tabNavigation);
        container.appendChild(tabContent);

        // Load initial tab content
        switchTab(activeTab, container, username, userData);

        return container;
    }

    /**
     * Switches active tab and updates content
     * @param {string} tabId - ID of the tab to activate
     * @param {HTMLElement} container - Main container
     * @param {string} username - Username
     * @param {Object} userData - User data
     */
    function switchTab(tabId, container, username, userData) {
        activeTab = tabId;
        
        // Update tab button appearance
        const tabButtons = container.querySelectorAll('.tfa-tab-button');
        tabButtons.forEach((btn, index) => {
            const isActive = ['overview', 'devices', 'sessions'][index] === tabId;
            btn.style.background = isActive ? '#007acc' : 'transparent';
            btn.style.color = isActive ? 'white' : '#333';
            btn.style.fontWeight = isActive ? 'bold' : 'normal';
        });

        // Update content
        const tabContent = container.querySelector('#tfa-tab-content');
        if (tabContent) {
            switch (tabId) {
                case 'overview':
                    loadOverviewTab(tabContent, username, userData);
                    break;
                case 'devices':
                    loadDevicesTab(tabContent, username, userData);
                    break;
                case 'sessions':
                    loadSessionsTab(tabContent, username, userData);
                    break;
            }
        }
    }

    /**
     * Loads the Overview tab content
     * @param {HTMLElement} container - Tab container
     * @param {string} username - Username
     * @param {Object} userData - User data
     */
    async function loadOverviewTab(container, username, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading overview...</div>';
        
        try {
            // Load user status
            const status = await apiRequest('POST', '/auth/status', { username });
            
            const overviewHtml = `
                <div class="tfa-overview">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #333;">Account Information</h3>
                            <div style="space-y: 10px;">
                                <p><strong>Username:</strong> ${username}</p>
                                <p><strong>2FA Status:</strong> 
                                    <span style="color: ${status.is2FAEnabled ? 'green' : 'orange'};">
                                        ${status.is2FAEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </p>
                                <p><strong>Active Devices:</strong> ${status.activeDevices || 0}</p>
                                <p><strong>Active Sessions:</strong> ${status.activeSessions || 0}</p>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #333;">Security Status</h3>
                            <div style="text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 15px;">
                                    ${status.is2FAEnabled ? '🔒' : '⚠️'}
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <span style="background: ${status.is2FAEnabled ? '#d4edda' : '#fff3cd'}; 
                                                 color: ${status.is2FAEnabled ? '#155724' : '#856404'}; 
                                                 padding: 8px 16px; border-radius: 20px; font-size: 14px;">
                                        ${status.is2FAEnabled ? 'Account Secured' : 'Enable 2FA for Security'}
                                    </span>
                                </div>
                                ${!status.is2FAEnabled ? `
                                    <button onclick="TwoFactorLib.enable2FA('${username}')" 
                                            style="background: #007acc; color: white; border: none; padding: 10px 20px; 
                                                   border-radius: 5px; cursor: pointer; font-size: 14px;">
                                        🛡️ Enable 2FA
                                    </button>
                                ` : `
                                    <button onclick="TwoFactorLib.disable2FA('${username}')" 
                                            style="background: #dc3545; color: white; border: none; padding: 10px 20px; 
                                                   border-radius: 5px; cursor: pointer; font-size: 14px;">
                                        🔓 Disable 2FA
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = overviewHtml;
            
        } catch (error) {
            container.innerHTML = `
                <div style="color: red; text-align: center; padding: 20px;">
                    ❌ Error loading overview: ${error.message}
                </div>
            `;
        }
    }

    /**
     * Loads the Devices tab content
     * @param {HTMLElement} container - Tab container
     * @param {string} username - Username
     * @param {Object} userData - User data
     */
    async function loadDevicesTab(container, username, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading devices...</div>';
        
        try {
            // Load device list
            const devices = await apiRequest('GET', `/devices/list/${username}`);
            
            let devicesHtml = `
                <div class="tfa-devices">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #333;">Authentication Devices</h3>
                        <button onclick="TwoFactorLib.addNewDevice('${username}')" 
                                style="background: #007acc; color: white; border: none; padding: 10px 20px; 
                                       border-radius: 5px; cursor: pointer;">
                            ➕ Add Device
                        </button>
                    </div>
            `;

            if (devices.devices && devices.devices.length > 0) {
                devices.devices.forEach(device => {
                    const deviceIcon = getDeviceIcon(device.deviceInfo);
                    devicesHtml += `
                        <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; 
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center;">
                                <div style="font-size: 24px; margin-right: 15px;">${deviceIcon}</div>
                                <div>
                                    <div style="font-weight: bold; margin-bottom: 5px;">${device.deviceInfo}</div>
                                    <div style="color: #666; font-size: 12px;">${device.authMethod} • Active</div>
                                </div>
                            </div>
                            <div>
                                <button onclick="TwoFactorLib.editDevice(${device.deviceId}, '${device.deviceInfo}')" 
                                        style="background: #6c757d; color: white; border: none; padding: 5px 10px; 
                                               margin-right: 5px; border-radius: 3px; cursor: pointer;">
                                    ✏️ Edit
                                </button>
                                <button onclick="TwoFactorLib.removeDevice(${device.deviceId}, '${device.deviceInfo}')" 
                                        style="background: #dc3545; color: white; border: none; padding: 5px 10px; 
                                               border-radius: 3px; cursor: pointer;">
                                    🗑️ Remove
                                </button>
                            </div>
                        </div>
                    `;
                });
            } else {
                let emptyMessage = '';
                let emptyIcon = '';
                
                switch (devices.twoFactorStatus) {
                    case 'disabled':
                        emptyIcon = '🔓';
                        emptyMessage = '2FA has been disabled. No authentication devices are active.';
                        break;
                    case 'never_activated':
                        emptyIcon = '🔐';
                        emptyMessage = '2FA has never been activated for this account.';
                        break;
                    default:
                        emptyIcon = '📱';
                        emptyMessage = 'No devices configured yet. Add your first authentication device to secure your account.';
                }

                devicesHtml += `
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 8px;">
                        <div style="font-size: 48px; margin-bottom: 15px;">${emptyIcon}</div>
                        <p style="color: #666; margin-bottom: 20px;">${emptyMessage}</p>
                        <button onclick="TwoFactorLib.enable2FA('${username}')" 
                                style="background: #007acc; color: white; border: none; padding: 12px 24px; 
                                       border-radius: 5px; cursor: pointer; font-size: 16px;">
                            🛡️ Enable 2FA
                        </button>
                    </div>
                `;
            }

            devicesHtml += '</div>';
            container.innerHTML = devicesHtml;
            
        } catch (error) {
            container.innerHTML = `
                <div style="color: red; text-align: center; padding: 20px;">
                    ❌ Error loading devices: ${error.message}
                </div>
            `;
        }
    }

    /**
     * Loads the Sessions tab content
     * @param {HTMLElement} container - Tab container
     * @param {string} username - Username
     * @param {Object} userData - User data
     */
    async function loadSessionsTab(container, username, userData) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Loading sessions...</div>';
        
        try {
            // Load session list
            const sessions = await apiRequest('GET', `/sessions/list/${username}`);
            
            let sessionsHtml = `
                <div class="tfa-sessions">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #333;">Active Sessions</h3>
                        <button onclick="TwoFactorLib.logoutAllSessions('${username}')" 
                                style="background: #dc3545; color: white; border: none; padding: 10px 20px; 
                                       border-radius: 5px; cursor: pointer;">
                            🚪 Logout Other Sessions
                        </button>
                    </div>
            `;

            if (sessions.sessions && sessions.sessions.length > 0) {
                sessions.sessions.forEach((session, index) => {
                    const deviceIcon = getDeviceIcon(session.deviceInfo || 'Unknown Device');
                    const isCurrent = index === 0; // First session = current session
                    
                    sessionsHtml += `
                        <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; 
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                                    border-left: 4px solid ${isCurrent ? '#007acc' : '#ddd'};">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <div style="font-size: 24px; margin-right: 15px;">${deviceIcon}</div>
                                    <div>
                                        <div style="font-weight: bold; margin-bottom: 5px;">
                                            ${session.deviceInfo || 'Unknown Device'}
                                            ${isCurrent ? '<span style="background: #007acc; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">Current</span>' : ''}
                                        </div>
                                        <div style="color: #666; font-size: 12px;">
                                            Started: ${session.loginTime ? new Date(session.loginTime).toLocaleString() : 'Unknown'}
                                        </div>
                                        <div style="color: #666; font-size: 12px;">
                                            Last activity: ${session.lastUsed ? new Date(session.lastUsed).toLocaleString() : 'Unknown'}
                                        </div>
                                        <div style="color: #666; font-size: 12px;">
                                            2FA: ${session.authenticated2FA ? '✅ Verified' : '❌ Not verified'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                sessionsHtml += `
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 8px;">
                        <div style="font-size: 48px; margin-bottom: 15px;">🔗</div>
                        <p style="color: #666;">No active sessions found.</p>
                    </div>
                `;
            }

            sessionsHtml += '</div>';
            container.innerHTML = sessionsHtml;
            
        } catch (error) {
            container.innerHTML = `
                <div style="color: red; text-align: center; padding: 20px;">
                    ❌ Error loading sessions: ${error.message}
                </div>
            `;
        }
    }

    // =============================================================================
    // MAIN TWOFACTOR LIBRARY OBJECT - Main 2FA library object
    // =============================================================================

    let TwoFactorLib = {
        
        /**
         * Gets 2FA status and generates the main interface
         * @param {HTMLElement} root - Root element for interface insertion
         * @param {string} username - Username
         * @param {function} setTokenPassword - Callback function to set the token password
         * @param {string} language - Interface language
         * @returns {Promise} - Operation promise
         */
        getStatus: async function (root, username, setTokenPassword, language) {
            try {
                if (!root || !('innerHTML' in root)) {
                    throw new Error('Invalid root object');
                }

                console.log('TwoFactorLib.getStatus called for:', username);

                // Store global references
                currentUser = { username };
                
                // Check user's 2FA status
                let userStatus;
                try {
                    userStatus = await apiRequest('POST', '/auth/status', { username });
                } catch (error) {
                    // If API is not available, display a basic interface
                    console.warn('2FA API not available:', error.message);
                    root.innerHTML = `
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; text-align: center;">
                            <h3 style="margin: 0 0 10px 0; color: #856404;">Two-Factor Authentication</h3>
                            <p style="margin: 0; color: #856404;">2FA service is currently unavailable.</p>
                        </div>
                    `;
                    return { status: 'warning', message: 'Service unavailable' };
                }

                // Determine 2FA status
                const status = userStatus.is2FAEnabled ? 'active' : 
                              (userStatus.exists ? 'inactive' : 'create');

                // Generate and insert main interface
                const mainInterface = generateMainInterface(status, username, userStatus);
                root.innerHTML = '';
                root.appendChild(mainInterface);

                console.log('TwoFactorLib.getStatus completed successfully');
                return { status: 'success', data: userStatus };

            } catch (error) {
                console.error('Error in TwoFactorLib.getStatus:', error);
                if (root) {
                    root.innerHTML = `
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; text-align: center;">
                            <h3 style="margin: 0 0 10px 0; color: #721c24;">Two-Factor Authentication Error</h3>
                            <p style="margin: 0; color: #721c24;">Unable to load 2FA interface: ${error.message}</p>
                        </div>
                    `;
                }
                return { status: 'error', message: error.message };
            }
        },

        /**
         * Shows the 2FA verification interface (modal popup)
         * @param {HTMLElement} root - Root element (used as anchor)
         * @param {string} username - Username
         * @param {function} setTokenPassword - Callback function to set the token password
         * @param {string} language - Interface language
         * @returns {Promise} - Operation promise
         */
        verify2FA: async function (root, username, setTokenPassword, language) {
            try {
                console.log('TwoFactorLib.verify2FA called for:', username);

                // For WinJS, we can create a modal dialog
                // or use your application's existing interface
                
                return new Promise((resolve, reject) => {
                    // Create a 2FA verification dialog
                    const modal = document.createElement('div');
                    modal.style.cssText = `
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(0,0,0,0.5); z-index: 9999;
                        display: flex; align-items: center; justify-content: center;
                    `;
                    
                    modal.innerHTML = `
                        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;">
                            <h2 style="margin: 0 0 20px 0; text-align: center;">Two-Factor Authentication</h2>
                            <p style="text-align: center; margin-bottom: 20px; color: #666;">
                                Enter the 6-digit code from your authenticator app
                            </p>
                            <input type="text" id="tfa-verify-code" maxlength="6" 
                                   style="width: 100%; padding: 15px; font-size: 18px; text-align: center; 
                                          border: 2px solid #ddd; border-radius: 5px; margin-bottom: 20px;
                                          letter-spacing: 3px;" 
                                   placeholder="000000">
                            <div style="display: flex; gap: 10px;">
                                <button id="tfa-verify-cancel" 
                                        style="flex: 1; padding: 12px; background: #6c757d; color: white; 
                                               border: none; border-radius: 5px; cursor: pointer;">
                                    Cancel
                                </button>
                                <button id="tfa-verify-submit" 
                                        style="flex: 1; padding: 12px; background: #007acc; color: white; 
                                               border: none; border-radius: 5px; cursor: pointer;">
                                    Verify
                                </button>
                            </div>
                            <div id="tfa-verify-error" style="color: red; text-align: center; margin-top: 15px; display: none;"></div>
                        </div>
                    `;

                    document.body.appendChild(modal);

                    const codeInput = modal.querySelector('#tfa-verify-code');
                    const submitBtn = modal.querySelector('#tfa-verify-submit');
                    const cancelBtn = modal.querySelector('#tfa-verify-cancel');
                    const errorDiv = modal.querySelector('#tfa-verify-error');

                    // Submission handler
                    const handleSubmit = async () => {
                        const code = codeInput.value.trim();
                        if (code.length !== 6) {
                            errorDiv.textContent = 'Please enter a 6-digit code';
                            errorDiv.style.display = 'block';
                            return;
                        }

                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Verifying...';

                        try {
                            // Call 2FA verification API
                            const result = await apiRequest('POST', '/auth/verify-2fa', {
                                sessionToken: sessionToken,
                                totpCode: code
                            });

                            if (result.success) {
                                // Set new password if provided
                                if (result.dbPassword && setTokenPassword) {
                                    setTokenPassword(result.dbPassword);
                                }

                                document.body.removeChild(modal);
                                resolve({ success: true, data: result });
                            } else {
                                throw new Error(result.message || 'Verification failed');
                            }
                        } catch (error) {
                            errorDiv.textContent = error.message;
                            errorDiv.style.display = 'block';
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Verify';
                        }
                    };

                    // Cancellation handler
                    const handleCancel = () => {
                        document.body.removeChild(modal);
                        reject(new Error('Verification cancelled by user'));
                    };

                    // Events
                    submitBtn.onclick = handleSubmit;
                    cancelBtn.onclick = handleCancel;
                    codeInput.onkeypress = (e) => {
                        if (e.key === 'Enter') handleSubmit();
                        if (e.key === 'Escape') handleCancel();
                    };

                    // Auto-submit if 6 digits entered
                    codeInput.oninput = () => {
                        if (codeInput.value.length === 6) {
                            setTimeout(handleSubmit, 100);
                        }
                    };

                    // Focus on input
                    setTimeout(() => codeInput.focus(), 100);
                });

            } catch (error) {
                console.error('Error in TwoFactorLib.verify2FA:', error);
                return { status: 'error', message: error.message };
            }
        },

        /**
         * Enables 2FA for the user
         * @param {string} username - Username
         */
        enable2FA: async function (username) {
            try {
                const password = await this.requestPassword('Enter your password to enable 2FA');
                
                const result = await apiRequest('POST', '/auth/setup-2fa', {
                    username: username,
                    password: password,
                    deviceInfo: detectDeviceFromUserAgent()
                });

                if (result.success) {
                    showSuccess('2FA enabled successfully!');
                    // Reload interface
                    this.refreshInterface(username);
                }
            } catch (error) {
                if (error.message !== 'cancelled') {
                    showError('Failed to enable 2FA: ' + error.message);
                }
            }
        },

        /**
         * Disables 2FA for the user
         * @param {string} username - Username
         */
        disable2FA: async function (username) {
            try {
                if (!showConfirm('Are you sure you want to disable Two-Factor Authentication?\n\nThis will make your account less secure.')) {
                    return;
                }

                const password = await this.requestPassword('Enter your password to disable 2FA');
                
                const result = await apiRequest('POST', '/auth/disable-2fa', {
                    username: username,
                    password: password
                });

                if (result.success) {
                    showSuccess('2FA disabled successfully!');
                    // Reload interface
                    this.refreshInterface(username);
                }
            } catch (error) {
                if (error.message !== 'cancelled') {
                    showError('Failed to disable 2FA: ' + error.message);
                }
            }
        },

        /**
         * Adds a new 2FA device
         * @param {string} username - Username
         */
        addNewDevice: async function (username) {
            try {
                const password = await this.requestPassword('Enter your password to add a new device');
                
                const result = await apiRequest('POST', '/auth/setup-2fa', {
                    username: username,
                    password: password,
                    deviceInfo: detectDeviceFromUserAgent()
                });

                if (result.success) {
                    showSuccess('Device added successfully!');
                    // Reload devices tab
                    this.refreshInterface(username);
                }
            } catch (error) {
                if (error.message !== 'cancelled') {
                    showError('Failed to add device: ' + error.message);
                }
            }
        },

        /**
         * Removes a 2FA device
         * @param {number} deviceId - Device ID
         * @param {string} deviceName - Device name
         */
        removeDevice: async function (deviceId, deviceName) {
            try {
                if (!showConfirm(`Are you sure you want to remove the device "${deviceName}"?\n\nThis action cannot be undone.`)) {
                    return;
                }

                const password = await this.requestPassword('Enter your password to remove this device');
                
                const result = await apiRequest('DELETE', `/devices/remove/${deviceId}`, {
                    username: currentUser.username,
                    password: password,
                    confirmDelete: false
                });

                if (result.success) {
                    showSuccess('Device removed successfully!');
                    // Reload interface
                    this.refreshInterface(currentUser.username);
                }
            } catch (error) {
                if (error.message !== 'cancelled') {
                    showError('Failed to remove device: ' + error.message);
                }
            }
        },

        /**
         * Logs out all other sessions
         * @param {string} username - Username
         */
        logoutAllSessions: async function (username) {
            try {
                if (!showConfirm('This will log you out of all other sessions. Continue?')) {
                    return;
                }

                const password = await this.requestPassword('Enter your password to logout all sessions');
                
                const result = await apiRequest('POST', '/sessions/logout-all', {
                    username: username,
                    password: password
                });

                if (result.success) {
                    showSuccess('All other sessions logged out successfully!');
                    // Reload sessions tab
                    this.refreshInterface(username);
                }
            } catch (error) {
                if (error.message !== 'cancelled') {
                    showError('Failed to logout sessions: ' + error.message);
                }
            }
        },

        /**
         * Requests password from user
         * @param {string} message - Message to display
         * @returns {Promise<string>} - Entered password
         */
        requestPassword: function (message = 'Enter your password') {
            return new Promise((resolve, reject) => {
                // Use currentUserPassword if available
                if (currentUserPassword) {
                    resolve(currentUserPassword);
                    return;
                }

                // Create password input dialog
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                `;
                
                modal.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;">
                        <h3 style="margin: 0 0 15px 0;">Authentication Required</h3>
                        <p style="margin-bottom: 20px; color: #666;">${message}</p>
                        <input type="password" id="password-input" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 5px; margin-bottom: 20px;"
                               placeholder="Password">
                        <div style="display: flex; gap: 10px;">
                            <button id="password-cancel" 
                                    style="flex: 1; padding: 12px; background: #6c757d; color: white; 
                                           border: none; border-radius: 5px; cursor: pointer;">
                                Cancel
                            </button>
                            <button id="password-submit" 
                                    style="flex: 1; padding: 12px; background: #007acc; color: white; 
                                           border: none; border-radius: 5px; cursor: pointer;">
                                Continue
                            </button>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);

                const passwordInput = modal.querySelector('#password-input');
                const submitBtn = modal.querySelector('#password-submit');
                const cancelBtn = modal.querySelector('#password-cancel');

                const handleSubmit = () => {
                    const password = passwordInput.value.trim();
                    if (password) {
                        currentUserPassword = password; // Store for future use
                        document.body.removeChild(modal);
                        resolve(password);
                    }
                };

                const handleCancel = () => {
                    document.body.removeChild(modal);
                    reject(new Error('cancelled'));
                };

                submitBtn.onclick = handleSubmit;
                cancelBtn.onclick = handleCancel;
                passwordInput.onkeypress = (e) => {
                    if (e.key === 'Enter') handleSubmit();
                    if (e.key === 'Escape') handleCancel();
                };

                setTimeout(() => passwordInput.focus(), 100);
            });
        },

        /**
         * Refreshes the 2FA interface
         * @param {string} username - Username
         */
        refreshInterface: function (username) {
            // Find main container and reload
            const container = document.querySelector('.tfa-main-container');
            if (container && container.parentElement) {
                this.getStatus(container.parentElement, username, null, 'en');
            }
        },

        /**
         * Clears the 2FA interface
         * @param {HTMLElement} root - Root element to clear
         * @returns {Object} - Operation result
         */
        clear: function (root) {
            try {
                if (root && 'innerHTML' in root) {
                    root.innerHTML = '';
                    // Reset global variables
                    currentUser = null;
                    sessionToken = null;
                    currentUserPassword = null;
                    activeTab = 'overview';
                    return { status: 'success', root: root };
                } else {
                    throw new Error('Invalid root object');
                }
            } catch (error) {
                console.error('Error clearing 2FA interface:', error);
                return { status: 'error', message: error.message };
            }
        }
    };

    // Expose TwoFactorLib in the global object
    globalObject["TwoFactorLib"] = TwoFactorLib;

})();