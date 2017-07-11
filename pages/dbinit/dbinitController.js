// controller for page: dbinit
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dbinit.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/dbinit/dbinitService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("DBInit", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "DBInit.Controller.");
            Application.Controller.apply(this, [pageElement, {
                progress: {
                    percent: 0,
                    text: "",
                    show: null
                }
            }]);

            var that = this;

            var getStartPage = function() {
                var startPage;
                var userId = null;
                if (typeof AppData._persistentStates.allRecIds !== "undefined" &&
                    typeof AppData._persistentStates.allRecIds["Mitarbeiter"] !== "undefined") {
                    userId = AppData._persistentStates.allRecIds["Mitarbeiter"];
                    Log.print(Log.l.info, "userId=" + userId);
                }
                if (!userId || 
                    !that.binding.appSettings.odata.login ||
                    !that.binding.appSettings.odata.password/* ||
                    !that.binding.appSettings.odata.dbSiteId*/) {
                    startPage = "login";
                } else {
                    startPage = "start";
                }
                return startPage;
            }

            // define handlers
            this.eventHandlers = {
            };

            this.disableHandlers = {
            }

            var showGroupsMenu = function () {
                var i, updateMenu = false;
                Log.call(Log.l.trace, "Start.Controller.");
                if (that.applist && that.applist.length > 0) {
                    for (i = 0; i < Application.navigationBarGroups.length; i++) {
                        if (that.applist.indexOf(Application.navigationBarGroups[i].id) >= 0) {
                            if (Application.navigationBarGroups[i].disabled) {
                                Log.print(Log.l.trace, "enable id=" + Application.navigationBarGroups[i].id);
                                Application.navigationBarGroups[i].disabled = false;
                                updateMenu = true;
                            };
                        } else {
                            if (!Application.navigationBarGroups[i].disabled) {
                                Log.print(Log.l.trace, "disable id=" + Application.navigationBarGroups[i].id);
                                Application.navigationBarGroups[i].disabled = true;
                                updateMenu = true;
                            };
                        }
                    }
                } else {
                    for (i = 0; i < Application.navigationBarGroups.length; i++) {
                        if (!Application.navigationBarGroups[i].disabled) {
                            Log.print(Log.l.trace, "disable id=" + Application.navigationBarGroups[i].id);
                            Application.navigationBarGroups[i].disabled = true;
                            updateMenu = true;
                        }
                    }
                }
                if (updateMenu) {
                    NavigationBar.groups = Application.navigationBarGroups;
                }
                for (i = 0; i < Application.navigationBarGroups.length; i++) {
                    if (Application.navigationBarGroups[i].disabled) {
                        NavigationBar.disablePage(Application.navigationBarGroups[i].id);
                    } else {
                        NavigationBar.enablePage(Application.navigationBarGroups[i].id);
                    }
                    if (NavigationBar.pages && NavigationBar.pages.length > 0) {
                        for (var j = 0; j < NavigationBar.pages.length; j++) {
                            if (NavigationBar.pages[j]) {
                                if (NavigationBar.pages[j].group === Application.navigationBarGroups[i].group) {
                                    NavigationBar.pages[j].disabled = Application.navigationBarGroups[i].disabled;
                                }
                                if (NavigationBar.pages[j].id === "event") {
                                    that.binding.disableEditEvent = NavigationBar.pages[j].disabled;
                                }
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.showGroupsMenu = showGroupsMenu;

            var openDb = function () {
                AppBar.busy = true;

                var ret;
                Log.call(Log.l.info, "Account.Controller.");
                if (AppRepl.replicator &&
                    AppRepl.replicator.state === "running") {
                    Log.print(Log.l.info, "replicator still running - try later!");
                    ret = WinJS.Promise.timeout(500).then(function () {
                        that.openDb();
                    });
                } else {
                    ret = AppData.openDB(function () {
                        AppBar.busy = false;
                        Log.print(Log.l.info, "openDB success!");
                        AppData._curGetUserDataId = 0;
                        AppData.getUserData();
                    }, function (err) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "openDB error!");
                        AppData.setErrorMsg(that.binding, err);
                    }, function (res) {
                        if (res) {
                            that.binding.progress = {
                                percent: res.percent,
                                text: res.statusText,
                                show: 1
                            }
                        }
                    }).then(function () {
                        return DBInit.appListSpecView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "appListSpecView: success!");
                            // kontaktanzahlView returns object already parsed from json file in response
                            if (json && json.d && json.d.results) {
                                that.applist = [];
                                for (var i = 0; i < json.d.results.length; i++) {
                                    var row = json.d.results[i];
                                    if (row && row.Title) {
                                        if (that.applist.indexOf(row.Title) >= 0) {
                                            Log.print(Log.l.trace, "extra ignored " + row.Title);
                                        } else {
                                            Log.print(Log.l.trace, "add applist[" + i + "]=" + row.Title);
                                            that.applist.push(row.Title);
                                        }
                                        if (row.AlternativeStartApp) {
                                            Log.print(Log.l.trace, "reset home page of app to page=" + row.Title);
                                            Application.startPage = Application.getPagePath(row.Title);
                                        }
                                    }
                                }
                            }
                            that.showGroupsMenu();
                            return WinJS.Promise.as();
                        }, function (errorResponse) {
                            that.applist = null;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        });
                    }).then(function() {
                        WinJS.Promise.timeout(0).then(function () {
                            // navigate async here to ensure load of navigation menu!
                            Application.navigateById(getStartPage());
                        });
                    });
                }
                Log.ret(Log.l.info);
                return ret;
            };
            that.openDb = openDb;

            that.processAll().then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
                // now open the DB
                that.openDb();
            });
            Log.ret(Log.l.trace);
        })
    });
})();


