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
    var namespaceName = "MailingOptions";

    WinJS.Namespace.define("MailingOptions", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingOptions.Controller.");
            Application.Controller.apply(this, [pageElement, {
                connTypData: getEmptyDefaultValue(MailingOptions.VAMailServerView.defaultValue),
                isProductMailOn: AppData._persistentStates.productMailOn,
                isNachbearbeitetFlagAutoSetToNull: AppData._persistentStates.nachbearbeitetFlagAutoSetToNull,
                isThankMailOn: AppData._persistentStates.thankYouMailOn,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com"
            }, commandList]);

            var that = this;

            this.verbindungsarten = new WinJS.Binding.List([
                { value: "plain", TITLE: "Keine / None" },
                { value: "ssl", TITLE: "SSL / TLS" },
                { value: "starttls", TITLE: "STARTTLS" }
            ]);

            var setConnTypCombo = function () {
                var connTypCombo = pageElement.querySelector("#showconnTypCombo");
                connTypCombo.winControl.data = that.verbindungsarten;
            }
            this.setConnTypCombo = setConnTypCombo;

            var setEventId = function (value) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "eventId=" + value);
                MailingOptions._eventId = value;
                Log.ret(Log.l.trace);
            }
            this.setEventId = setEventId;

            var setconnTypId = function (value) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "VAMailServerVIEWID=" + value);
                MailingOptions._connTypId = value;
                Log.ret(Log.l.trace);
            }
            this.setconnTypId = setconnTypId;

            var getConnTypId = function () {
                var connTypId = null;
                Log.call(Log.l.trace, "MailingOptions.Controller.");
                connTypId = MailingOptions._connTypId;
                return connTypId;
            }
            this.getConnTypId = getConnTypId;

            var getEventId = function () {
                var eventId = null;
                Log.call(Log.l.trace, "MailingOptions.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller) {
                    eventId = master.controller.binding.eventId;
                } else {
                    eventId = AppData.getRecordId("Veranstaltung");
                }
                Log.ret(Log.l.trace, eventId);
                return eventId;
            }
            this.getEventId = getEventId;

            var setMailId = function (value) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "mailId=" + value);
                MailingOptions._mailId = value;
                Log.ret(Log.l.trace);
            }
            this.setMailId = setMailId;

            var getMailId = function () {
                Log.print(Log.l.trace, "MailIdId Event._mailId=" + MailingOptions._mailId);
                return MailingOptions._mailId;
            }
            this.getMailId = getMailId;

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
                        pVeranstaltungID: that.getEventId(),
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

            var insertConnTyp = function () {
                Log.call(Log.l.trace, "MailingOptions.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return MailingOptions.VAMailServerView.insert(function (json) {
                        AppBar.busy = false;
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "VAMailServerView insert: success!");
                        AppBar.modified = false;
                        // ProduktView returns object already parsed from json file in response
                        that.loadData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error inserting ConnTyp");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { FairMandantID : AppData._userData.FairMandantID});
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.insertConnTyp = insertConnTyp;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var err = null;
                var connTypData = that.binding.connTypData;
                if (connTypData && AppBar.modified && !AppBar.busy) {
                    AppBar.busy = true;
                    var recordId = getConnTypId();
                    if (recordId) {
                        ret = WinJS.Promise.as().then(function () {
                            MailingOptions.VAMailServerView.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "dataMail update: success!");
                                AppBar.modified = false;
                                if (typeof complete === "function") {
                                    complete(connTypData);
                                }
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                err = errorResponse;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.getErrorMsgFromErrorStack(errorResponse).then(function () {
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                    if (typeof error === "function") {
                                        error(errorResponse);
                                    }
                                });
                                }, recordId, connTypData);
                        });
                    } else {
                        ret = WinJS.Promise.as();
                    }
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(connTypData);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MailingOptions.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    WinJS.Promise.as().then(function () {
                            that.saveData(function (response) {
                                Log.print(Log.l.trace, "saved");
                                //AppBar.modified = true;
                                that.loadData();
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "error saving");
                            });
                    });
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
            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickSave: function () {
                    if (that.binding.connTypData && AppBar.modified && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var loadData = function () {
                Log.call(Log.l.trace, "MailingOptions.Controller.");
                AppData.setErrorMsg(that.binding);
                //that.binding.veranstOption = getEmptyDefaultValue(Event.CR_VERANSTOPTION_ODataView.defaultValue);
                var ret = new WinJS.Promise.as().then(function () {
                    return MailingOptions.VAMailServerView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "MailingOptions: success!");
                        // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results[0];
                            that.setconnTypId(results.VAMailServerVIEWID);
                            that.binding.connTypData = results;
                        } else {
                            that.insertConnTyp();
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    var recordId = getEventId();
                    if (recordId) {
                        return AppData.getOptions(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "MailingOptions: success!");
                            // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length > 1) {
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    //that.resultConverterOption(item, index);
                                    if (item.INITOptionTypeID && item.INITOptionTypeID === 31 || item.OptionTypeID && item.OptionTypeID === 31) {
                                        if (item.LocalValue === "1") {
                                            that.binding.isThankMailOn = true;
                                        } else {
                                            that.binding.isThankMailOn = false;
                                        }
                                    }
                                });
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                                VeranstaltungID: recordId, //AppData.getRecordId("Veranstaltung")
                                MandantWide: 1,
                                IsForApp: 0
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                return that.setConnTypCombo();
            }).then(function () {
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();
