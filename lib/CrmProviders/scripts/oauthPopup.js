// Shared OAuth popup flow for CRM provider connect() implementations;
// only the auth URL and postMessage success type differ between providers.

(function () {
    "use strict";

    // Resolves with the "<successMessageType>" postMessage payload, or null
    // if the popup is closed without ever posting it. Centers on the
    // BROWSER WINDOW, not the physical screen, so it lands correctly on
    // multi-monitor / RDP setups.
    function openOAuthPopup(options) {
        var authUrl = options.authUrl;
        var successMessageType = options.successMessageType;
        var popupName = options.popupName || "crm-auth";
        var width = options.width || 600;
        var height = options.height || 750;

        return new Promise(function (resolve) {
            var dualLeft = window.screenLeft ?? window.screenX ?? 0;
            var dualTop = window.screenTop ?? window.screenY ?? 0;
            var winW = window.outerWidth || screen.width;
            var winH = window.outerHeight || screen.height;
            var left = Math.round(dualLeft + (winW - width) / 2);
            var top = Math.round(dualTop + (winH - height) / 2);

            var popup = window.open(
                authUrl,
                popupName,
                "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top +
                ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=yes"
            );

            var handled = false;
            var onMessage = function (event) {
                if (event.data && event.data.type === successMessageType && !handled) {
                    handled = true;
                    window.removeEventListener("message", onMessage);
                    clearInterval(pollClosed);
                    if (popup && !popup.closed) { popup.close(); }
                    resolve(event.data);
                }
            };
            window.addEventListener("message", onMessage);

            var pollClosed = setInterval(function () {
                if (popup && popup.closed && !handled) {
                    handled = true;
                    clearInterval(pollClosed);
                    window.removeEventListener("message", onMessage);
                    resolve(null);
                }
            }, 800);
        });
    }

    window.CrmProviders = window.CrmProviders || {};
    window.CrmProviders.openOAuthPopup = openOAuthPopup;

})();
