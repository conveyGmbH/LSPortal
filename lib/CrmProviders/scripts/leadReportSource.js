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

    // Which columns to show in a contact table: the 4 export-status columns
    // (always shown) + whichever LS_LeadReport columns are marked active in
    // the given FieldMappingService, falling back to every column when no
    // field config has been saved yet (a brand-new event) so the table isn't
    // empty-looking before the client configures anything. Extracted from
    // SalesforceLeadLib.renderContactList so every provider's contact table
    // filters columns identically — this has nothing to do with which CRM is
    // active, only with which LS_LeadReport fields the client activated.
    var EXPORT_STATUS_FIELDS = ["LastExportStatus", "LastExportTimestamp", "LastExportMessage", "ExportAttempts"];
    var HIDDEN_FIELDS = { "__metadata": true, "AttachmentIdList": true, "EventId": true };
    var REQUIRED_FIELDS = { "LastName": true, "Company": true };

    function computeDisplayColumns(items, fieldMappingService) {
        var hasFieldConfig = !!(fieldMappingService && fieldMappingService.fieldConfig &&
            fieldMappingService.fieldConfig.config && fieldMappingService.fieldConfig.config.fields &&
            fieldMappingService.fieldConfig.config.fields.length > 0);

        var allColumns = (items && items.length > 0)
            ? Object.keys(items[0]).filter(function (k) { return !HIDDEN_FIELDS[k]; })
            : [];

        var activeColumns = hasFieldConfig
            ? allColumns.filter(function (col) {
                return EXPORT_STATUS_FIELDS.indexOf(col) !== -1 || REQUIRED_FIELDS[col] || fieldMappingService.isFieldActive(col);
            })
            : allColumns;

        // Re-add any field marked active in the saved config but absent from
        // the sampled row (e.g. a field the first loaded row happens not to
        // carry) — without this, an active field could silently vanish.
        if (hasFieldConfig) {
            var already = {};
            activeColumns.forEach(function (c) { already[c] = true; });
            var configFields = fieldMappingService.fieldConfig.config.fields || [];
            configFields.forEach(function (f) {
                if (f.active === true && f.fieldName && !already[f.fieldName] &&
                    !HIDDEN_FIELDS[f.fieldName] && EXPORT_STATUS_FIELDS.indexOf(f.fieldName) === -1) {
                    activeColumns.push(f.fieldName);
                    already[f.fieldName] = true;
                }
            });
        }

        var seen = {};
        var displayColumns = [];
        EXPORT_STATUS_FIELDS.concat(activeColumns).forEach(function (col) {
            if (!seen[col]) { seen[col] = true; displayColumns.push(col); }
        });
        return displayColumns;
    }

    // Formats an LS_LeadReport cell value for display: OData /Date(ms)/
    // strings and ISO date strings in date-named columns become YYYY-MM-DD;
    // everything else is returned as-is. Extracted from
    // SalesforceLeadLib.renderContactList's formatCell/isDateCol so every
    // provider's contact table formats dates identically.
    var DATE_PATTERNS = ["Date", "Timestamp", "Modstamp"];
    function isDateCol(col) {
        return DATE_PATTERNS.some(function (p) { return col.indexOf(p) !== -1; });
    }
    function formatCell(col, val) {
        if (val == null) { return ""; }
        var s = String(val);
        var m = s.match(/^\/Date\((\d+)\)\/$/);
        if (m) { return new Date(parseInt(m[1], 10)).toISOString().split("T")[0]; }
        if (isDateCol(col) && s.length >= 10) {
            var d = new Date(s);
            if (!isNaN(d)) { return d.toISOString().split("T")[0]; }
        }
        return s;
    }

    window.CrmProviders = window.CrmProviders || {};
    window.CrmProviders.LeadReportSource = {
        init: init,
        fetchLeadReportPage: fetchLeadReportPage,
        computeDisplayColumns: computeDisplayColumns,
        formatCell: formatCell
    };

})();
