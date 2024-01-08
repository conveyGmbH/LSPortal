// controller for page: mailingOptions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/event/eventService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("MailingOptions", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingOptions.Controller.");
            Application.Controller.apply(this, [pageElement, {
                isProductMailOn: AppData._persistentStates.productMailOn,
                isNachbearbeitetFlagAutoSetToNull: AppData._persistentStates.nachbearbeitetFlagAutoSetToNull,
                isThankMailOn: AppData._persistentStates.thankYouMailOn,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com"
            }, commandList]);

            var that = this;

            var changeAppSetting = function (toggleId, checked) {
                Log.call(Log.l.trace, "MailingOptions.Controller.", "toggleId=" + toggleId + " checked=" + checked);
                var pOptionTypeId = null;
                var hidePageItem = true;
                switch (toggleId) {
                    case "productMail":
                        pOptionTypeId = 30;
                        that.binding.isProductMailOn = checked;
                        AppData._persistentStates.productMailOn = checked;
                        hidePageItem = false;
                        break;
                    case "thankMail":
                        pOptionTypeId = 31;
                        that.binding.isThankMailOn = checked;
                        AppData._persistentStates.thankYouMailOn = checked;
                        hidePageItem = false;
                        break;
                    case "nachbearbeitetFlagAutoSetToNull":
                        pOptionTypeId = 35;
                        that.binding.isNachbearbeitetFlagAutoSetToNull = checked;
                        AppData._persistentStates.nachbearbeitetFlagAutoSetToNull = checked;
                        hidePageItem = false;
                        break;
                }
                if (pOptionTypeId) {
                    var pValue;
                    // value: show => pValue: hide!
                    if (hidePageItem) {
                        if (!checked) {
                            pValue = "1";
                        } else {
                            pValue = "0";
                        }
                    } else {
                        if (checked) {
                            pValue = "1";
                        } else {
                            pValue = "0";
                        }
                    }
                    AppData.call("PRC_SETVERANSTOPTION", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pOptionTypeID: pOptionTypeId,
                        pValue: pValue
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                }
            };
            this.changeAppSetting = changeAppSetting;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MailingOptions.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "MailingOptions.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "MailingOptions.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeAppSetting: function (event) {
                    Log.call(Log.l.trace, "MailingOptions.Controller.");
                    if (event.currentTarget) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.changeAppSetting(event.currentTarget.id, toggle.checked);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "MailingOptions.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "MailingOptions.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                }
            };

            that.processAll().then(function () {
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();