// leadReportSource.js - shared LS_LeadReport OData reader for CRM provider libs
//
// Extracted from SalesforceLeadLib's renderContactList (LS_LeadReport fetch +
// pagination, lib/SalesforceLeadLib/scripts/salesforceLeadLib.js). Reading the
// portal's own LS_LeadReport OData entity has nothing to do with which CRM
// provider is active — every provider lib shows the same lead rows, just
// transferred to a different backend — so this is shared rather than
// reimplemented per provider.

(function () {
    "use strict";

    var portalConfig = null;

    // Same shape as SalesforceLeadLib.init(): call once with the Portal
    // Admin credentials before fetchLeadReportPage(). Controllers that
    // already call SalesforceLeadLib.init(...) call this alongside it.
    function init(serverUrl, apiName, user, password) {
        portalConfig = {
            serverUrl: serverUrl,
            apiName: apiName,
            user: user,
            password: password,
            baseUrl: serverUrl + "/" + apiName
        };
        return true;
    }

    async function callPortalODataAPI(endpoint) {
        if (!portalConfig) {
            throw new Error("CrmProviders.LeadReportSource not initialized. Call init() first.");
        }
        var url = portalConfig.baseUrl + "/" + endpoint;
        var credentials = btoa(portalConfig.user + ":" + portalConfig.password);

        var response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": "Basic " + credentials,
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        if (!response.ok) {
            var errorText = await response.text();
            throw new Error("OData API call failed: " + response.status + " " + response.statusText + " - " + errorText);
        }

        var text = await response.text();
        try {
            return JSON.parse(text);
        } catch (jsonErr) {
            // Bad control characters in data (e.g. in Description/Question fields) — sanitize
            // eslint-disable-next-line no-control-regex
            var cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
            return JSON.parse(cleaned);
        }
    }

    // OData only supports __next for the first 2 pages; $skip is used for
    // full pagination instead. Returns { items, skip, hasMore }.
    async function fetchLeadReportPage(eventId, skip, pageSize) {
        var endpoint = "LS_LeadReport?$filter=EventId eq '" + eventId + "'" +
            "&$top=" + pageSize + "&$skip=" + skip + "&$format=json";
        var data = await callPortalODataAPI(endpoint);
        var items = (data && data.d && data.d.results) || [];
        return {
            items: items,
            skip: skip + items.length,
            hasMore: items.length === pageSize
        };
    }

    window.CrmProviders = window.CrmProviders || {};
    window.CrmProviders.LeadReportSource = {
        init: init,
        fetchLeadReportPage: fetchLeadReportPage
    };

})();
