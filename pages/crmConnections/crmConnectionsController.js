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
/// <reference path="~/www/lib/DynamicsLeadLib/scripts/dynamicsLeadLib.js" />

(function () {
    "use strict";
    var namespaceName = "CrmConnections";

    // The catalog itself — which CRMs are offered, in display order. Entries
    // with no registered adapter must be guarded before calling
    // CrmProviders.getAdapter() for them, since getAdapter() silently falls
    // back to Salesforce for any unregistered id (correct for crmExport/
    // crmSettings, wrong here where an unregistered id genuinely means
    // "not offered yet", not "use Salesforce instead"). Dynamics now has a
    // real adapter (DynamicsLeadLib, registered on script load) backed by
    // dynamics-backend's centralized Azure AD app — same multi-tenant-app
    // model as Salesforce/HubSpot.
    var CATALOG = [
        { id: "salesforce", label: "Salesforce", icon: "fa-brands fa-salesforce", iconColor: "#00a1e0", badge: null, description: "Push leads to Leads/Contacts; bidirectional sync.", auth: "OAuth 2.0" },
        { id: "hubspot", label: "HubSpot", icon: "fa-brands fa-hubspot", iconColor: "#ff7a59", badge: null, description: "Contacts & Deals pipeline mapping.", auth: "OAuth 2.0" },
        { id: "dynamics", label: "MS Dynamics 365", icon: "fa-solid fa-building", iconColor: "#0078d4", badge: null, description: "Sync with Dynamics Sales & Customer Insights.", auth: "OAuth 2.0" }
    ];

    WinJS.Namespace.define(namespaceName, {

        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {

            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                    eventId: null,
                    // True only until loadData() settles showInactive/the
                    // catalog — shows a spinner instead of a blank page
                    // between clicking the tab and eventId resolving.
                    showLoading: true,
                    // Same tri-state gate as crmExport/crmSettings: stays false
                    // during initial load so the card doesn't flash before the
                    // eventId is resolved.
                    showInactive: false
                }, commandList
            ]);

            var that = this;
            var loadGeneration = 0;
            var catalogContainer = pageElement.querySelector("#crm-conn-container");

            // Custom page header (icon + title), same pattern/classes as
            // CRM Export's renderContactList so both screens look like one
            // product. No "System Online" style badge here — there's no
            // real health-check backing one, so it stays honest and just
            // shows the icon + title (the connected-count line below it
            // already carries the real status).
            function pageHeaderHtml() {
                return (
                    '<div class="sf-cl-page-header">' +
                        '<div class="sf-cl-page-header__main">' +
                            '<div class="sf-cl-page-header__icon"><i class="fa-solid fa-plug" aria-hidden="true"></i></div>' +
                            '<div class="sf-cl-page-header__text">' +
                                '<h1 class="sf-cl-page-header__title">CRM Connections</h1>' +
                            "</div>" +
                        "</div>" +
                    "</div>"
                );
            }

            // Every registered provider lib needs Portal Admin credentials
            // before checkConnection()/connect() can call its backend — same
            // init() call as crmExport/crmSettingsController, needed here too
            // since this page checks every adapter's connection status on
            // load (see reload() below) without going through those pages.
            if (window.SalesforceLeadLib) {
                var serverUrl = AppData.getBaseURL(AppData.appSettings.odata.onlinePort);
                var apiName = AppData.getOnlinePath();
                var user = AppData.getOnlineLogin();
                var password = AppData.getOnlinePassword();

                SalesforceLeadLib.init(serverUrl, apiName, user, password);
                if (window.HubspotLeadLib) {
                    HubspotLeadLib.init(serverUrl, apiName, user, password);
                }
                if (window.DynamicsLeadLib) {
                    DynamicsLeadLib.init(serverUrl, apiName, user, password);
                }
                if (window.CrmProviders && CrmProviders.LeadReportSource) {
                    CrmProviders.LeadReportSource.init(serverUrl, apiName, user, password);
                }
            }

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
                    // A client is licensed for exactly one CRM at a time: once any
                    // provider is active, every other card is locked — connecting
                    // a new one is only possible after deleting the current
                    // connection, never a direct "switch" action.
                    var isLockedByOther = !isSoon && activeProviderId && activeProviderId !== entry.id;

                    var actionHtml;
                    if (isSoon) {
                        actionHtml = '<button class="sf-btn sf-btn--secondary crm-conn-action" disabled title="Coming soon"><i class="fa-solid fa-lock" aria-hidden="true"></i> Soon</button>';
                    } else if (isActive) {
                        actionHtml =
                            '<button class="sf-btn sf-btn--secondary crm-conn-action crm-conn-action--manage" data-action="manage" data-provider="' + entry.id + '">Manage</button>' +
                            '<button class="sf-btn sf-btn--danger-outline crm-conn-action crm-conn-action--delete" data-action="disconnect" data-provider="' + entry.id + '">Delete connection</button>';
                    } else if (isLockedByOther) {
                        actionHtml = '<button class="sf-btn sf-btn--secondary crm-conn-action" disabled title="Delete the current connection before connecting a different CRM"><i class="fa-solid fa-lock" aria-hidden="true"></i> Locked</button>';
                    } else {
                        actionHtml = '<button class="sf-btn sf-btn--primary crm-conn-action" data-action="connect" data-provider="' + entry.id + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> Connect</button>';
                    }

                    return (
                        '<div class="crm-conn-card' + (isActive ? " crm-conn-card--active" : "") + (isLockedByOther ? " crm-conn-card--locked" : "") + '" data-provider-card="' + entry.id + '">' +
                            (isActive ? '<span class="crm-conn-badge crm-conn-badge--active">Active</span>' : "") +
                            '<div class="crm-conn-card-head">' +
                                '<div class="crm-conn-avatar"><i class="' + entry.icon + '" aria-hidden="true" style="color:' + entry.iconColor + ';"></i></div>' +
                                '<div class="crm-conn-card-title">' +
                                    '<div class="crm-conn-name-row">' +
                                        "<span class=\"crm-conn-name\">" + esc(entry.label) + "</span>" +
                                        badgeHtml(entry) +
                                    "</div>" +
                                    '<div class="crm-conn-auth">' +
                                        (status.connected ? '<span class="crm-conn-status' + (status.connected ? " crm-conn-status--connected" : "") + '"><span class="crm-conn-status-dot"></span>Connected · </span>' : "") +
                                        esc(entry.auth) +
                                    "</div>" +
                                "</div>" +
                            "</div>" +
                            '<p class="crm-conn-desc">' + esc(entry.description) + "</p>" +
                            (isActive && status.userInfo ? '<div class="crm-conn-meta"><i class="fa-regular fa-user" aria-hidden="true"></i> ' + esc(status.userInfo) + "</div>" : "") +
                            (!isActive ? '<div class="crm-conn-card-footer">' +
                                '<span class="crm-conn-status' + (status.connected ? " crm-conn-status--connected" : "") + '">' +
                                    '<span class="crm-conn-status-dot"></span>' +
                                    (status.connected ? "Connected" : "Not connected") +
                                "</span>" +
                            "</div>" : "") +
                            '<div class="crm-conn-actions' + (isActive ? " crm-conn-actions--full" : "") + '">' + actionHtml + "</div>" +
                        "</div>"
                    );
                }).join("");

                attachCatalogListeners(statusById, activeProviderId);
            }

            // Renders the full catalog shell (toolbar, search, filter tabs,
            // grid, delete-confirm modal) from current connection/active
            // state. Called on load and after any connect/disconnect —
            // filterState is preserved across these re-renders.
            function renderCatalog(statusById, activeProviderId) {
                var connectedCount = CATALOG.filter(function (e) {
                    return statusById[e.id] && statusById[e.id].connected;
                }).length;

                catalogContainer.innerHTML =
                    pageHeaderHtml() +
                    '<div class="crm-conn-toolbar">' +
                        '<div class="crm-conn-count">' + connectedCount + " of " + CATALOG.length + " CRMs connected</div>" +
                    "</div>" +
                    '<div class="crm-conn-hint">' +
                        '<i class="fa-solid fa-circle-info" aria-hidden="true"></i>' +
                        "<span>One active CRM per licence — connecting a new one replaces the current.</span>" +
                    "</div>" +
                    '<div class="crm-conn-filterbar">' +
                        '<div class="crm-conn-search">' +
                            '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
                            '<input type="text" class="crm-conn-search-input" placeholder="Search a CRM..." value="' + esc(filterState.query) + '" aria-label="Search a CRM" />' +
                        "</div>" +
                        '<select class="crm-conn-filter-select" aria-label="Filter CRMs">' +
                            ["all", "connected", "available"].map(function (tab) {
                                var tabLabel = tab === "all" ? "All" : tab === "connected" ? "Connected" : "Available";
                                return '<option value="' + tab + '"' + (filterState.tab === tab ? " selected" : "") + '>' + tabLabel + "</option>";
                            }).join("") +
                        "</select>" +
                    "</div>" +
                    '<div class="crm-conn-grid"></div>' +
                    // Confirmation modal for deleting the active connection —
                    // hidden until a "disconnect" action is clicked.
                    '<div class="sf-modal-overlay crm-conn-delete-overlay" style="display:none;" role="presentation">' +
                        '<div class="sf-modal sf-modal--sm" role="alertdialog" aria-modal="true" aria-labelledby="crm-conn-delete-title">' +
                            '<div class="sf-modal__body" style="padding: 24px;">' +
                                '<h3 class="sf-modal__title" id="crm-conn-delete-title">Delete connection?</h3>' +
                                '<p class="crm-conn-delete-text" style="margin: 12px 0 0; color: var(--sf-text-2);"></p>' +
                            "</div>" +
                            '<div class="sf-modal__footer">' +
                                '<button class="sf-btn sf-btn--secondary" data-action="delete-cancel">Cancel</button>' +
                                '<button class="sf-btn sf-btn--danger" data-action="delete-confirm">Delete connection</button>' +
                            "</div>" +
                        "</div>" +
                    "</div>";

                renderCardsGrid(statusById, activeProviderId);

                var searchInput = catalogContainer.querySelector(".crm-conn-search-input");
                searchInput.addEventListener("input", function () {
                    filterState.query = searchInput.value;
                    renderCardsGrid(statusById, activeProviderId);
                });

                var filterSelect = catalogContainer.querySelector(".crm-conn-filter-select");
                if (filterSelect) {
                    filterSelect.addEventListener("change", function () {
                        filterState.tab = filterSelect.value;
                        renderCardsGrid(statusById, activeProviderId);
                    });
                }
            }

            function showDeleteConfirm(providerLabel, onConfirm) {
                var overlay = catalogContainer.querySelector(".crm-conn-delete-overlay");
                var text = overlay.querySelector(".crm-conn-delete-text");
                text.textContent = "This will delete your " + providerLabel + " connection and you'll need to reconfigure your field mappings if you reconnect. Continue?";
                overlay.style.display = "flex";

                var cancelBtn = overlay.querySelector('[data-action="delete-cancel"]');
                var confirmBtn = overlay.querySelector('[data-action="delete-confirm"]');

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
                        } else if (action === "disconnect") {
                            var entry = CATALOG.filter(function (e) { return e.id === providerId; })[0];
                            showDeleteConfirm(entry ? entry.label : providerId, function () {
                                adapter.disconnect().then(function () {
                                    return reload();
                                });
                            });
                        } else if (action === "manage") {
                            // Manage = jump to CRM Settings' Field Configurator
                            // for the active provider.
                            Application.navigateById("crmSettings");
                        }
                    });
                });
            }

            // Shown in catalogContainer while reload()'s connection checks are
            // in flight, so switching events doesn't flash an empty
            // container between showLoading clearing and the real cards
            // rendering (they overlap: connect() re-check calls also refresh
            // rather than replace this, only the initial loadData() path
            // shows it since renderCatalog's own innerHTML replaces it).
            function renderCatalogSkeleton() {
                catalogContainer.innerHTML =
                    pageHeaderHtml() +
                    '<div class="crm-conn-toolbar">' +
                        '<div class="sf-skeleton" style="height: 20px; width: 180px;"></div>' +
                    "</div>" +
                    '<div class="crm-conn-filterbar">' +
                        '<div class="sf-skeleton" style="height: 38px; flex: 1; max-width: 320px;"></div>' +
                        '<div class="sf-skeleton" style="height: 38px; width: 220px; border-radius: var(--sf-radius-pill);"></div>' +
                    "</div>" +
                    '<div class="crm-conn-grid" aria-busy="true" aria-label="Loading CRM connections">' +
                        CATALOG.map(function () {
                            return (
                                '<div class="crm-conn-card">' +
                                    '<div class="crm-conn-card-head">' +
                                        '<div class="sf-skeleton" style="width: 40px; height: 40px; border-radius: var(--sf-radius-sm);"></div>' +
                                        '<div style="flex: 1;">' +
                                            '<div class="sf-skeleton" style="height: 16px; max-width: 120px; margin-bottom: 8px;"></div>' +
                                            '<div class="sf-skeleton" style="height: 12px; max-width: 80px;"></div>' +
                                        "</div>" +
                                    "</div>" +
                                    '<div class="sf-skeleton" style="height: 13px; margin: 12px 0 4px;"></div>' +
                                    '<div class="sf-skeleton" style="height: 13px; max-width: 70%; margin-bottom: 16px;"></div>' +
                                    '<div class="crm-conn-card-footer">' +
                                        '<div class="sf-skeleton" style="height: 24px; width: 90px; border-radius: var(--sf-radius-pill);"></div>' +
                                        '<div class="sf-skeleton" style="height: 34px; width: 90px;"></div>' +
                                    "</div>" +
                                "</div>"
                            );
                        }).join("") +
                    "</div>";
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
                        return { id: entry.id, connected: !!(result && result.connected), userInfo: (result && result.userInfo) || "" };
                    }).catch(function () {
                        return { id: entry.id, connected: false, userInfo: "" };
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
                // Re-show the spinner for this fresh load (a prior load may
                // have already flipped this to false) — cleared again once
                // showInactive/the catalog below settles.
                that.binding.showLoading = true;

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
                    // eventId is resolved (or definitively failed to resolve) —
                    // the branch below is about to fire, so the loading
                    // spinner is no longer needed.
                    that.binding.showLoading = false;
                    if (that.binding.eventId) {
                        that.binding.showInactive = false;
                        renderCatalogSkeleton();
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
