// Shared OAuth popup flow for CRM provider connect() implementations;
// only the auth URL and postMessage success type differ between providers.

(function () {
    "use strict";

    var POLL_CLOSED_MS = 500;
    var POLL_RESULT_MS = 1500;
    // Covers a user who walks away mid-consent; without it the promise (and
    // the caller's "Connecting..." button) could stay pending forever.
    var DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
    // How long to keep asking the backend after the popup *looks* closed.
    var DEFAULT_CLOSED_GRACE_MS = 2 * 60 * 1000;

    // Resolves with:
    //   - the "<successMessageType>" payload (postMessage or pollResult),
    //   - { error } on an error message/result or a blocked popup,
    //   - null when the popup is closed without a result, on timeout, or when
    //     the caller cancels.
    // Never rejects and never stays pending. Centers on the BROWSER WINDOW,
    // not the physical screen, so it lands correctly on multi-monitor / RDP
    // setups.
    //
    // Optional options:
    //   errorMessageType - postMessage type that carries an OAuth error
    //   allowedOrigins   - ignore postMessages from any other origin
    //   pollResult       - async () => payload | { error } | null. Asked
    //                      periodically for the result on the backend. Needed
    //                      when the provider's pages send a COOP header: that
    //                      severs window.opener (no postMessage can arrive) and
    //                      makes popup.closed read true while the popup is
    //                      still open, so "closed" can't be trusted as a cancel.
    //   closedGraceMs    - with pollResult, how long to keep polling after
    //                      the popup looks closed
    //   onWaiting        - called once when the popup looks closed but polling
    //                      continues (e.g. to show "Waiting for authorization")
    //   onCancelable     - receives a function that aborts the flow
    function openOAuthPopup(options) {
        var authUrl = options.authUrl;
        var successMessageType = options.successMessageType;
        var errorMessageType = options.errorMessageType || null;
        var allowedOrigins = Array.isArray(options.allowedOrigins) && options.allowedOrigins.length
            ? options.allowedOrigins
            : null;
        var pollResult = typeof options.pollResult === "function" ? options.pollResult : null;
        var closedGraceMs = options.closedGraceMs || DEFAULT_CLOSED_GRACE_MS;
        var popupName = options.popupName || "crm-auth";
        var width = options.width || 600;
        var height = options.height || 750;
        var timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

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

            if (!popup) {
                resolve({ error: "popup_blocked" });
                return;
            }

            var handled = false;
            var pollClosed = null;
            var pollResultTimer = null;
            var timeoutId = null;
            var closedGraceId = null;
            var pollInFlight = false;

            function closePopup() {
                try { if (!popup.closed) { popup.close(); } } catch (e) { /* severed reference */ }
            }

            function finish(value) {
                if (handled) { return; }
                handled = true;
                window.removeEventListener("message", onMessage);
                clearInterval(pollClosed);
                clearInterval(pollResultTimer);
                clearTimeout(timeoutId);
                clearTimeout(closedGraceId);
                resolve(value);
            }

            function onMessage(event) {
                if (handled || !event.data || typeof event.data !== "object") { return; }
                if (allowedOrigins && allowedOrigins.indexOf(event.origin) === -1) { return; }
                if (event.data.type === successMessageType) {
                    closePopup();
                    finish(event.data);
                } else if (errorMessageType && event.data.type === errorMessageType) {
                    closePopup();
                    finish({ error: event.data.error || "authorization_failed" });
                }
            }
            window.addEventListener("message", onMessage);

            function checkBackend() {
                if (handled || pollInFlight) { return; }
                pollInFlight = true;
                Promise.resolve().then(pollResult).then(function (value) {
                    pollInFlight = false;
                    if (value) {
                        closePopup();
                        finish(value);
                    }
                }, function () {
                    pollInFlight = false;
                });
            }

            if (pollResult) {
                pollResultTimer = setInterval(checkBackend, POLL_RESULT_MS);
            }

            pollClosed = setInterval(function () {
                if (!popup.closed) { return; }
                clearInterval(pollClosed);
                if (!pollResult) {
                    finish(null);
                    return;
                }
                // Closed, or only looks closed after a COOP opener cut: ask
                // the backend now, then keep polling for a while.
                checkBackend();
                if (typeof options.onWaiting === "function") {
                    try { options.onWaiting(); } catch (e) { /* UI hook only */ }
                }
                closedGraceId = setTimeout(function () { finish(null); }, closedGraceMs);
            }, POLL_CLOSED_MS);

            timeoutId = setTimeout(function () {
                closePopup();
                finish(null);
            }, timeoutMs);

            if (typeof options.onCancelable === "function") {
                options.onCancelable(function () {
                    closePopup();
                    finish(null);
                });
            }
        });
    }

    window.CrmProviders = window.CrmProviders || {};
    window.CrmProviders.openOAuthPopup = openOAuthPopup;

})();
