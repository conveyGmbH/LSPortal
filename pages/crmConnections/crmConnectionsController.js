// controller for page: crmConnections
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/crmConnections/crmConnectionsService.js" />
/// <reference path="~/www/lib/CrmProviders/scripts/crmProviderRegistry.js" />
/// <reference path="~/www/lib/SalesforceLeadLib/scripts/salesforceLeadLib.js" />
/// <reference path="~/www/lib/HubspotLeadLib/scripts/hubspotLeadLib.js" />

(function () {
    "use strict";
    var namespaceName = "CrmConnections";

    // The catalog itself — which CRMs are offered, in display order. Entries
    // with no registered adapter must be guarded before calling
    // CrmProviders.getAdapter() for them, since getAdapter() silently falls
    // back to Salesforce for any unregistered id (correct for crmExport/
    // crmSettings, wrong here where an unregistered id genuinely means
    // "not offered yet", not "use Salesforce instead"). Dynamics has no real
    // backend/OAuth yet (see registerDynamicsStubAdapter below) but is shown
    // as available rather than locked, per product decision — its connect()
    // surfaces a clear "not yet available" message instead of doing nothing.
    var CATALOG = [
        { id: "salesforce", label: "Salesforce", initials: "SF", badge: "popular", description: "Push leads to Leads/Contacts; bidirectional sync.", auth: "OAuth 2.0" },
        { id: "hubspot", label: "HubSpot", initials: "HS", badge: null, description: "Contacts & Deals pipeline mapping.", auth: "OAuth 2.0" },
        { id: "dynamics", label: "MS Dynamics 365", initials: "MD", badge: null, description: "Sync with Dynamics Sales & Customer Insights.", auth: "OAuth 2.0" }
    ];

    // Minimal client-side stub — no backend, no OAuth. Registered so the
    // catalog can treat Dynamics like any other adapter (no "soon" special
    // case in the click handler) while being honest that connecting doesn't
    // do anything real yet.
    function registerDynamicsStubAdapter() {
        if (!window.CrmProviders || typeof CrmProviders.registerAdapter !== "function") { return; }
        if (CrmProviders.getAdapter("dynamics").id === "dynamics") { return; } // already registered
        CrmProviders.registerAdapter({
            id: "dynamics",
            label: "MS Dynamics 365",
            apiEndpointValue: "Dynamics365",
            status: "available",
            isConnected: function () { return false; },
            checkConnection: function () { return Promise.resolve({ connected: false }); },
            connect: function () {
                return Promise.reject(new Error("MS Dynamics 365 support isn't available yet. Please contact your LeadSuccess representative for more information."));
            },
            disconnect: function () { return Promise.resolve(); }
        });
    }

    WinJS.Namespace.define(namespaceName, {

        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {

            Log.call(Log.l.trace, namespaceName + ".Controller.");
            registerDynamicsStubAdapter();
            Application.Controller.apply(this, [pageElement, {
                    eventId: null,
                    // Same tri-state gate as crmExport/crmSettings: stays false
                    // during initial load so the card doesn't flash before the
                    // eventId is resolved.
                    showInactive: false
                }, commandList
            ]);

            var that = this;
            var loadGeneration = 0;
            var catalogContainer = pageElement.querySelector("#crm-conn-container");

            this.dispose = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                loadGeneration++;
                if (catalogContainer) {
                    catalogContainer.innerHTML = "";
                }
                Log.ret(Log.l.trace);
            };

            var getRecordId = function () {
                var recordId = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    recordId = master.controller.binding.eventId;
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            };
            this.getRecordId = getRecordId;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    } else {
                        Application.navigateById("event");
                    }
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function () {
                    return !that.binding.eventId;
                }
            };

            AppData.setErrorMsg(this.binding);

            function esc(s) {
                var div = document.createElement("div");
                div.textContent = String(s == null ? "" : s);
                return div.innerHTML;
            }

            function badgeHtml(entry) {
                if (entry.badge === "popular") {
                    return '<span class="crm-conn-badge crm-conn-badge--popular">Popular</span>';
                }
                if (entry.badge === "soon") {
                    return '<span class="crm-conn-badge crm-conn-badge--soon">Soon</span>';
                }
                return "";
            }

            // Current filter/search state — survives re-renders triggered by
            // connect/disconnect/switch, reset only on a fresh loadData().
            var filterState = { query: "", tab: "all" };

            function matchesFilter(entry, status) {
                if (filterState.tab === "connected" && !status.connected) { return false; }
                if (filterState.tab === "available" && status.connected) { return false; }
                if (filterState.query) {
                    var q = filterState.query.toLowerCase();
                    if (entry.label.toLowerCase().indexOf(q) === -1) { return false; }
                }
                return true;
            }

            function renderCardsGrid(statusById, activeProviderId) {
                var gridEl = catalogContainer.querySelector(".crm-conn-grid");
                if (!gridEl) { return; }

                var visibleEntries = CATALOG.filter(function (entry) {
                    return matchesFilter(entry, statusById[entry.id] || { connected: false });
                });

                if (visibleEntries.length === 0) {
                    gridEl.innerHTML = '<div class="crm-conn-empty">No CRM matches your search.</div>';
                    return;
                }

                gridEl.innerHTML = visibleEntries.map(function (entry) {
                    var status = statusById[entry.id] || { connected: false };
                    var isSoon = entry.badge === "soon";
                    var isActive = entry.id === activeProviderId && status.connected;

                    var actionHtml;
                    if (isSoon) {
                        actionHtml = '<button class="sf-btn sf-btn--secondary crm-conn-action" disabled title="Coming soon"><i class="fa-solid fa-lock" aria-hidden="true"></i> Soon</button>';
                    } else if (isActive) {
                        actionHtml =
                            '<button class="sf-btn sf-btn--secondary crm-conn-action" data-action="manage" data-provider="' + entry.id + '">Manage</button>' +
                            '<button class="sf-btn sf-btn--danger-outline crm-conn-action" data-action="disconnect" data-provider="' + entry.id + '">Disconnect</button>';
                    } else if (activeProviderId && activeProviderId !== entry.id) {
                        // A different provider is active: connecting here means
                        // switching, which the confirm modal below warns about.
                        actionHtml = '<button class="sf-btn sf-btn--primary crm-conn-action" data-action="switch" data-provider="' + entry.id + '"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Switch to ' + esc(entry.label) + '</button>';
                    } else {
                        actionHtml = '<button class="sf-btn sf-btn--primary crm-conn-action" data-action="connect" data-provider="' + entry.id + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> Connect</button>';
                    }

                    return (
                        '<div class="crm-conn-card' + (isActive ? " crm-conn-card--active" : "") + '" data-provider-card="' + entry.id + '">' +
                            '<div class="crm-conn-card-head">' +
                                '<div class="crm-conn-avatar">' + esc(entry.initials) + "</div>" +
                                '<div class="crm-conn-card-title">' +
                                    '<div class="crm-conn-name-row">' +
                                        "<span class=\"crm-conn-name\">" + esc(entry.label) + "</span>" +
                                        (isActive ? '<span class="crm-conn-badge crm-conn-badge--connected">Connected</span>' : badgeHtml(entry)) +
                                    "</div>" +
                                    '<div class="crm-conn-auth">' + esc(entry.auth) + "</div>" +
                                "</div>" +
                            "</div>" +
                            '<p class="crm-conn-desc">' + esc(entry.description) + "</p>" +
                            '<div class="crm-conn-card-footer">' +
                                '<span class="crm-conn-status' + (status.connected ? " crm-conn-status--connected" : "") + '">' +
                                    '<span class="crm-conn-status-dot"></span>' +
                                    (status.connected ? "Connected" : "Not connected") +
                                "</span>" +
                                '<div class="crm-conn-actions">' + actionHtml + "</div>" +
                            "</div>" +
                        "</div>"
                    );
                }).join("");

                attachCatalogListeners(statusById, activeProviderId);
            }

            // Renders the full catalog shell (toolbar, search, filter tabs,
            // grid, switch-confirm modal) from current connection/active
            // state. Called on load and after any connect/disconnect/switch —
            // filterState is preserved across these re-renders.
            function renderCatalog(statusById, activeProviderId) {
                var connectedCount = CATALOG.filter(function (e) {
                    return statusById[e.id] && statusById[e.id].connected;
                }).length;

                catalogContainer.innerHTML =
                    '<div class="crm-conn-toolbar">' +
                        '<div class="crm-conn-count">' + connectedCount + " of " + CATALOG.length + " CRMs connected</div>" +
                        '<div class="crm-conn-hint">One active CRM per licence — connecting a new one replaces the current.</div>' +
                    "</div>" +
                    '<div class="crm-conn-filterbar">' +
                        '<div class="crm-conn-search">' +
                            '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
                            '<input type="text" class="crm-conn-search-input" placeholder="Search a CRM..." value="' + esc(filterState.query) + '" aria-label="Search a CRM" />' +
                        "</div>" +
                        '<div class="crm-conn-tabs" role="tablist">' +
                            ["all", "connected", "available"].map(function (tab) {
                                var tabLabel = tab === "all" ? "All" : tab === "connected" ? "Connected" : "Available";
                                return '<button class="crm-conn-tab' + (filterState.tab === tab ? " crm-conn-tab--active" : "") +
                                    '" role="tab" aria-selected="' + (filterState.tab === tab) + '" data-tab="' + tab + '">' + tabLabel + "</button>";
                            }).join("") +
                        "</div>" +
                    "</div>" +
                    '<div class="crm-conn-grid"></div>' +
                    // Confirmation modal for switching providers — hidden until
                    // a "switch" action is clicked.
                    '<div class="sf-modal-overlay crm-conn-switch-overlay" style="display:none;" role="presentation">' +
                        '<div class="sf-modal sf-modal--sm" role="alertdialog" aria-modal="true" aria-labelledby="crm-conn-switch-title">' +
                            '<div class="sf-modal__body" style="padding: 24px;">' +
                                '<h3 class="sf-modal__title" id="crm-conn-switch-title">Switch CRM?</h3>' +
                                '<p class="crm-conn-switch-text" style="margin: 12px 0 0; color: var(--sf-text-2);"></p>' +
                            "</div>" +
                            '<div class="sf-modal__footer">' +
                                '<button class="sf-btn sf-btn--secondary" data-action="switch-cancel">Cancel</button>' +
                                '<button class="sf-btn sf-btn--danger" data-action="switch-confirm">Disconnect &amp; Continue</button>' +
                            "</div>" +
                        "</div>" +
                    "</div>";

                renderCardsGrid(statusById, activeProviderId);

                var searchInput = catalogContainer.querySelector(".crm-conn-search-input");
                searchInput.addEventListener("input", function () {
                    filterState.query = searchInput.value;
                    renderCardsGrid(statusById, activeProviderId);
                });

                catalogContainer.querySelectorAll(".crm-conn-tab[data-tab]").forEach(function (tabBtn) {
                    tabBtn.addEventListener("click", function () {
                        filterState.tab = tabBtn.getAttribute("data-tab");
                        catalogContainer.querySelectorAll(".crm-conn-tab").forEach(function (t) {
                            t.classList.toggle("crm-conn-tab--active", t === tabBtn);
                            t.setAttribute("aria-selected", String(t === tabBtn));
                        });
                        renderCardsGrid(statusById, activeProviderId);
                    });
                });
            }

            function showSwitchConfirm(fromLabel, toLabel, onConfirm) {
                var overlay = catalogContainer.querySelector(".crm-conn-switch-overlay");
                var text = overlay.querySelector(".crm-conn-switch-text");
                text.textContent = "You're currently connected to " + fromLabel + ". Connecting to " + toLabel +
                    " will disconnect " + fromLabel + " and you'll need to reconfigure your field mappings. Continue?";
                overlay.style.display = "flex";

                var cancelBtn = overlay.querySelector('[data-action="switch-cancel"]');
                var confirmBtn = overlay.querySelector('[data-action="switch-confirm"]');

                function cleanup() {
                    overlay.style.display = "none";
                    cancelBtn.removeEventListener("click", onCancel);
                    confirmBtn.removeEventListener("click", onConfirmClick);
                }
                function onCancel() { cleanup(); }
                function onConfirmClick() { cleanup(); onConfirm(); }

                cancelBtn.addEventListener("click", onCancel);
                confirmBtn.addEventListener("click", onConfirmClick);
            }

            function attachCatalogListeners(statusById, activeProviderId) {
                catalogContainer.querySelectorAll(".crm-conn-action[data-action]").forEach(function (btn) {
                    btn.addEventListener("click", function () {
                        var action = btn.getAttribute("data-action");
                        var providerId = btn.getAttribute("data-provider");
                        var adapter = window.CrmProviders && CrmProviders.getAdapter(providerId);
                        if (!adapter || adapter.id !== providerId) {
                            // getAdapter() fell back to Salesforce for an
                            // unregistered id — nothing to do for that entry.
                            return;
                        }

                        if (action === "connect") {
                            btn.disabled = true;
                            btn.textContent = "Connecting…";
                            adapter.connect().then(function () {
                                CrmProviders.setActiveProvider(providerId);
                                return reload();
                            }).catch(function (err) {
                                Log.print(Log.l.error, namespaceName + ".Controller. connect error: " + (err && err.message));
                                btn.disabled = false;
                                btn.textContent = "Connect";
                                if (window.SalesforceLeadLib && typeof SalesforceLeadLib.showAlertDialog === "function") {
                                    SalesforceLeadLib.showAlertDialog("Not available", err && err.message);
                                }
                            });
                        } else if (action === "switch") {
                            var fromEntry = CATALOG.filter(function (e) { return e.id === activeProviderId; })[0];
                            var toEntry = CATALOG.filter(function (e) { return e.id === providerId; })[0];
                            showSwitchConfirm(fromEntry ? fromEntry.label : activeProviderId, toEntry ? toEntry.label : providerId, function () {
                                var fromAdapter = window.CrmProviders && CrmProviders.getAdapter(activeProviderId);
                                (fromAdapter && fromAdapter.id === activeProviderId ? fromAdapter.disconnect() : WinJS.Promise.as())
                                    .then(function () { return adapter.connect(); })
                                    .then(function () {
                                        CrmProviders.setActiveProvider(providerId);
                                        return reload();
                                    })
                                    .catch(function (err) {
                                        Log.print(Log.l.error, namespaceName + ".Controller. switch error: " + (err && err.message));
                                    });
                            });
                        } else if (action === "disconnect") {
                            adapter.disconnect().then(function () {
                                return reload();
                            });
                        } else if (action === "manage") {
                            // Manage = jump to CRM Settings' Field Configurator
                            // for the active provider.
                            Application.navigateById("crmSettings");
                        }
                    });
                });
            }

            // Checks every registered CATALOG entry's connection status in
            // parallel and re-renders. "soon" entries are never checked (no
            // adapter registered for them). Every adapter method here
            // (connect/disconnect/checkConnection) returns a native Promise
            // (they're plain async functions) — no WinJS.Promise bridging
            // needed except at loadData()'s own outer chain.
            function reload() {
                var checks = CATALOG.map(function (entry) {
                    var adapter = window.CrmProviders && CrmProviders.getAdapter(entry.id);
                    if (!adapter || adapter.id !== entry.id || typeof adapter.checkConnection !== "function") {
                        return Promise.resolve({ id: entry.id, connected: false });
                    }
                    return Promise.resolve(adapter.checkConnection()).then(function (result) {
                        return { id: entry.id, connected: !!(result && result.connected) };
                    }).catch(function () {
                        return { id: entry.id, connected: false };
                    });
                });

                return Promise.all(checks).then(function (results) {
                    var statusById = {};
                    results.forEach(function (r) { statusById[r.id] = r; });
                    var activeProviderId = window.CrmProviders ? CrmProviders.resolveActiveCrmProvider() : "salesforce";
                    // Only treat the resolved provider as "active" if it's
                    // actually connected — resolveActiveCrmProvider() can return
                    // "salesforce" as a bare default with nothing connected yet.
                    if (!(statusById[activeProviderId] && statusById[activeProviderId].connected)) {
                        activeProviderId = null;
                    }
                    renderCatalog(statusById, activeProviderId);
                });
            }

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");

                var myGeneration = ++loadGeneration;
                function isCurrent() { return myGeneration === loadGeneration; }

                // Fresh load (event switch) — don't carry a stale search/filter
                // from whatever event was previously viewed.
                filterState.query = "";
                filterState.tab = "all";

                if (catalogContainer) {
                    catalogContainer.innerHTML = "";
                }

                var ret = new WinJS.Promise.as().then(function () {
                    var recordId = getRecordId();
                    var memoized = window.CrmProviders && CrmProviders.resolveEventId(recordId);
                    if (recordId && memoized) {
                        that.binding.eventId = memoized;
                        return WinJS.Promise.as();
                    }
                    return AppData.call("FCT_GetUniqueRecordID", {
                        pRelationName: "Veranstaltung",
                        pRecordID: recordId
                    }, function (json) {
                        if (!isCurrent()) { return; }
                        that.binding.eventId =
                            (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID);
                        if (window.CrmProviders) {
                            CrmProviders.rememberEventId(recordId, that.binding.eventId);
                        }
                    }, function (errorResponse) {
                        if (!isCurrent()) { return; }
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.binding.eventId = null;
                    });
                }).then(function () {
                    if (!isCurrent()) { return; }
                    if (that.binding.eventId) {
                        that.binding.showInactive = false;
                        return reload().catch(function (err) {
                            if (!isCurrent()) { return; }
                            Log.print(Log.l.error, namespaceName + ".Controller. reload error: " + (err && err.message));
                        });
                    } else {
                        that.binding.showInactive = true;
                        Log.print(Log.l.info, namespaceName + ".Controller. No eventId available for CRM connections");
                    }
                }).then(function () {
                    if (!isCurrent()) { return; }
                    AppBar.triggerDisableHandlers();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();
