// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/info/infoService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Info", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            var timezone = jstz && jstz.determine();
            if (timezone) {
                timezone.name();
            }

            Log.call(Log.l.trace, "Info.Controller.");
            Application.Controller.apply(this, [pageElement, {
                portalInfo: getEmptyDefaultValue(Info.appInfoSpecView.defaultValue),
                version: Application.version,
                environment: "Platform: " + navigator.appVersion,
                timezone: timezone && ("Timezone: " + timezone.name()),
                expandSubMenuMode: (AppData.generalData.expandSubMenuMode || Application.expandSubMenuModes.single),
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com",
                homepageUrl: "https://" + getResourceText("info.homepage")
            }, commandList]);

            var expandSubMenuModeSelect = pageElement.querySelector("#expandSubMenuModeSelect");

            var that = this;

            var setupLog = function () {
                var settings = null;
                Log.call(Log.l.trace, "Info.Controller.");
                if (that.binding.generalData.logEnabled) {
                    settings = {
                        target: that.binding.generalData.logTarget,
                        level: that.binding.generalData.logLevel,
                        group: that.binding.generalData.logGroup,
                        noStack: that.binding.generalData.logNoStack
                    };
                }
                Log.ret(Log.l.trace);
                Log.init(settings);
            };
            this.setupLog = setupLog;

            var setPortalInfo = function (portalInfo) {
                if (portalInfo.VersionInfo) {
                    that.binding.portalInfo.dbVersion = portalInfo.VersionInfo;
                }
            };
            this.setPortalInfo = setPortalInfo;

            var loadData = function () {
                Log.call(Log.l.trace, "Info.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (expandSubMenuModeSelect && expandSubMenuModeSelect.winControl) {
                        var expandSubMenuModeList = new WinJS.Binding.List([
                            { mode: Application.expandSubMenuModes.all, label: getResourceText("info.expandSubMenuModeAll") },
                            { mode: Application.expandSubMenuModes.toggle, label: getResourceText("info.expandSubMenuModeToggle") },
                            { mode: Application.expandSubMenuModes.single, label: getResourceText("info.expandSubMenuModeSingle") }
                        ]);
                        expandSubMenuModeSelect.winControl.data = expandSubMenuModeList;
                        that.binding.expandSubMenuMode = (AppData.generalData.expandSubMenuMode || Application.expandSubMenuModes.single);
                    }
                    return WinJS.Promise.as();
                }).then(function () {
                    return Info.appInfoSpecView.select(function (json) {
                        Log.print(Log.l.trace, "appInfoSpecView: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var result = json.d.results[0];
                            that.setPortalInfo(result);
                            Log.print(Log.l.trace, "Data loaded");
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    });
                }).then(function () {
                    var parentElement = pageElement.querySelector("#helpTextListHost");
                    if (parentElement) {
                        return Application.loadFragmentById(parentElement, "helpTextList");
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);

                return ret;
            };
            this.loadData = loadData;


            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    } else {
                        Application.navigateById(Application.startPageId, event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                /*clickLogEnabled: function (event) {
                    Log.call(Log.l.trace, "info.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.logEnabled = toggle.checked;
                        }
                    }
                    Log.ret(Log.l.trace);
                },*/
                clickCameraUseGrayscale: function (event) {
                    Log.call(Log.l.trace, "info.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.cameraUseGrayscale = toggle.checked;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changedCameraQuality: function (event) {
                    Log.call(Log.l.trace, "info.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var range = event.currentTarget;
                        if (range) {
                            that.binding.generalData.cameraQuality = range.value;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changedLogLevel: function (event) {
                    Log.call(Log.l.trace, "info.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var range = event.currentTarget;
                        if (range) {
                            that.binding.generalData.logLevel = range.value;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickLogGroup: function (event) {
                    Log.call(Log.l.trace, "info.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.logGroup = toggle.checked;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickLogNoStack: function (event) {
                    Log.call(Log.l.trace, "info.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.logNoStack = toggle.checked;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                changedExpandSubMenuMode: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        that.binding.generalData.expandSubMenuMode = event.currentTarget.value;
                        Log.print(Log.l.trace, "expandSubMenuMode=" + that.binding.generalData.expandSubMenuMode);
                        WinJS.Promise.timeout(0).then(function () {
                            NavigationBar.groups = Application.navigationBarGroups;
                        });
                    }
                    Log.ret(Log.l.trace);
                }
            }

            this.disableHandlers = {
                clickOk: function () {
                    // always enabled!
                    return false;
                }
            }

            AppData.setErrorMsg(this.binding);

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }),
        getLogLevelName: function (level) {
            Log.call(Log.l.trace, "Info.", "level=" + level);
            var key = "log" + level;
            Log.print(Log.l.trace, "key=" + key);
            var name = getResourceText("info." + key);
            Log.ret(Log.l.trace, "name=" + name);
            return name;
        }
    });
})();



