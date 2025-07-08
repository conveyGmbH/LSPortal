(function () {
	"use strict";
	
    function generateHTML(status, username) {

        try {
            const container = document.createElement('div');
            // container.classList.add();

            const statusText = document.createElement('h1');
            // statusText.classList.add();

            const statusPassword = document.createElement('input');
            statusPassword.type = 'password';
            statusPassword.classList.add('input_field', 'win-textbox', 'twoFAinput');
            statusPassword.placeholder = 'Password';

            const statusButton = document.createElement('button');
            statusButton.id = 'statusButton';
            statusButton.classList.add('list-button-left', 'win-button', 'enable2FA');

            // TODO: Dynamically get username
            switch (status) {
                case 'active':
                    statusText.textContent = 'Two Factor Authentication is Active';
                    statusButton.textContent = 'Disable Two Factor';
                    statusButton.addEventListener('click', () => {
                        TwoFactorLib.changeStatus(username, statusPassword.value, 'disable');
                    });
                    break;

                case 'inactive':
                    statusText.textContent = 'Two Factor Authentication is Inactive';
                    statusButton.textContent = 'Enable Two Factor';
                    statusButton.addEventListener('click', () => {
                        TwoFactorLib.changeStatus(username, statusPassword.value, 'enable');
                    });
                    break;

                case 'create':
                    statusText.textContent = 'You have not configured Two Factor Authentication';
                    statusButton.textContent = 'Enable Two Factor'
                    statusButton.addEventListener('click', () => {
                        TwoFactorLib.changeStatus(username, statusPassword.value, 'create');
                    });
                    break;

                default:
                    break;
            }

            container.appendChild(statusText);
            container.appendChild(statusPassword);
            container.appendChild(statusButton);
            return container
        } catch (error) {
            console.log('Error when generating HTML: ', error)
        }

    };

	let globalObject =
		typeof window !== 'undefined' ? window :
		typeof self !== 'undefined' ? self :
		typeof global !== 'undefined' ? global :
		{};
	
	let TwoFactorLib = {
		
	};

    // erzeugt die Oberfläche für TFA-Administration innerhalb von root-Element
    // Diese Oberfläche wird mit clear() wieder entfernt
    TwoFactorLib.getStatus = async function (root, username, setTokenPassword, language) {

		try {
            if (root && 'innerHTML' in root) {
                //root.innerHTML = "alles ok! <b>" + username + "</b>";
                /*
				console.log(root)
				// const twoFactor = document.createElement('p');
				// twoFactor.textContent = 'Hello' + username;
				// root.appendChild(twoFactor);
				// return {status: 'success', root: root};

				// Request logic
				const response = await fetch('/node2fa/getStatus', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: username
					})
				}); 
				const responseData = await response.json();
				console.log(responseData);
				if (responseData.exists) {
					if (responseData.active) {
						root.appendChild(generateHTML('active', username));
						return {status: 'success', root: root};
					} else {
						root.appendChild(generateHTML('inactive', username));
						return {status: 'success', root: root};
					}
				} else {
				   root.appendChild(generateHTML('create', root));
				   return {status: 'success', root: root};
				}
                */
                return { status: 'ok' };
			} else {
				throw new Error('Invalid root object');
            }
		} catch (error) {
			console.error('Error getting status: ', error);
			return {status: 'error', message: error};
		}
    };

    // erzeugt Popup-Dialog für TFA-Authentifizierung mit root-Element als Anker
    // nach Eingabe wird der Popup-Dialog wieder entfernt
    TwoFactorLib.verify2FA = async function (root, username, setTokenPassword, language) {
        try {
            if (root && 'innerHTML' in root) {
                //root.innerHTML = "alles ok! <b>" + username + "</b>";
                /*
                const response = await fetch('/node2fa/verify2FA', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: username,
                        token: token
                    })
                });
                const responseData = await response.json();
                console.log(responseData);
                */
                return { status: 'ok' };
            } else {
                throw new Error('Invalid root object');
            }
        } catch (error) {
            console.error('Error getting status: ', error);
            return { status: 'error', message: error };
        }
        // Returns responseData.success = true if it validated, false if not

    }


/*
	TwoFactorLib.changeStatus = async function(username, password, action) {

		const response = await fetch('/node2fa/changeStatus', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: username,
				password: password,
				action: action
			})
		}); 
		const responseData = await response.json();
		console.log(responseData);
		if (responseData.waiting) {
			const qrCode = document.createElement('div');
			qrCode.innerHTML = responseData.device.info;
			const container = document.createElement('div');

            const statusPassword = document.createElement('input');
            statusPassword.classList.add('input_field', 'win-textbox', 'twoFAinput');
			statusPassword.type = 'number';
            statusPassword.placeholder = 'Authentication Token';

			const statusButton = document.createElement('button');
            statusButton.id = 'statusButton';
            statusButton.classList.add('list-button-left', 'win-button', 'enable2FA');
			statusButton.textContent = 'Confirm Two Factor';
			statusButton.addEventListener('click', () => {
				console.log('Verifying with DeviceID ', responseData.device.id, ' and token: ', statusPassword.value);
				TwoFactorLib.confirmActivation(responseData.device.id, statusPassword.value, username);
			});

			container.appendChild(qrCode);
			container.appendChild(statusPassword);
			container.appendChild(statusButton);

			document.getElementById('2faContainer').innerHTML = '';
			document.getElementById('2faContainer').appendChild(container);
		} else {
			const root = document.getElementById('2faContainer');
			TwoFactorLib.clear(root);
			TwoFactorLib.getStatus(root, username);
		}

	};

	TwoFactorLib.confirmActivation = async function (deviceID, token, username) {
		
		const response = await fetch('/node2fa/confirmActivation', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				deviceID: deviceID,
				token: token,
				username: username
			})
		});
		const responseData = await response.json();
		if (response.ok) {
			let localStore = JSON.parse(window.localStorage.getItem("LeadSuccessPortal.PersistentStates.json"));
			localStore.odata.password = responseData.pass
			// Reload
			const root = document.getElementById('2faContainer');
			TwoFactorLib.clear(root);
			TwoFactorLib.getStatus(root, responseData.username);
		}
		// const responseData = await response.json();
		// console.log(responseData);


	};
*/
	TwoFactorLib.clear = function(root) {
		try {
			if (sessionStorage.getItem('sessionToken')) {
				sessionStorage.removeItem('sessionToken');
			}
			if (root && 'innerHTML' in root) {
				root.innerHTML = '';
				return {status: 'success', root: root};
			} else {
				throw new Error('Invalid root object');
			}
		} catch (error) {
			console.error('Error clearing: ', error);
			return {status: 'error', message: error};
		}
	};

	globalObject["TwoFactorLib"] = TwoFactorLib;
}());

