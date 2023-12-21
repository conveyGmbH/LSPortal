// controller for page: mailingTracking
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingTracking/mailingTrackingService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("MailingTracking", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingTracking.Controller.");
            Application.Controller.apply(this, [pageElement, {
                mailingtrackingdata: getEmptyDefaultValue(MailingTracking.MailTrackingDialogView.defaultValue),
                statusheader: "",
                senddate: new Date().toLocaleString(),
                mailsendoptdata: null
            }, commandList]);
            var that = this;

            var exhibitorcategory = pageElement.querySelector("#exhibitorcategory");
            var mailtype = pageElement.querySelector("#mailtype");
            var fairmandant = pageElement.querySelector("#fairmandant");
            var status = pageElement.querySelector("#status");
            var once = getResourceText("mailingtracking.onlyonetxt");
            var all = getResourceText("mailingtracking.alltxt");
            var mailsendoptiondata = pageElement.querySelector("#mailsendopt");

            var stati = [{ TITLE: 'READY' }, { TITLE: 'SENT' }];
            var exhibitorcategorys = [{ TITLE: "APP" }, { TITLE: "SERVICE" }, { TITLE: "FREE" }, { TITLE: "IPAD" }, { TITLE: "RTW" }];
            var mailsendoptions = [{ TITLE: all, VALUE: null }, { TITLE: once, VALUE: 1 }];

            // select combo
            var initSprache = pageElement.querySelector("#InitSprache");
            var textComment = pageElement.querySelector(".input_text_comment");

            var setDisabledFields = function () {
                Log.call(Log.l.trace, "MailingTracking.Controller.");
                if (mailtype) {
                    WinJS.Utilities.addClass(mailtype, "mandatory-bkg");
                }
                if (fairmandant) {
                    WinJS.Utilities.addClass(fairmandant, "mandatory-bkg");
                }
            }
            this.setDisabledFields = setDisabledFields;


            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "EmpRoles.Controller.");
                var ret = {};
                var fields = pageElement.querySelectorAll('input[type="checkbox"]');
                ret["Active"] = (fields[0] && fields[0].checked) ? 1 : null;
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            if (exhibitorcategory && exhibitorcategory.winControl) {
                exhibitorcategory.winControl.data = new WinJS.Binding.List(exhibitorcategorys);
            }
            if (status && status.winControl) {
                status.winControl.data = new WinJS.Binding.List(stati);
            }
            if (mailsendoptiondata && mailsendoptiondata.winControl) {
                mailsendoptiondata.winControl.data = new WinJS.Binding.List(mailsendoptions);
            }

            var getTimeToSend = function (rawdate) {
                Log.call(Log.l.trace, "MailingTracking.Controller.");
                var dateString = rawdate.replace("\/Date(", "").replace(")\/", "");
                var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000; //
                var date = new Date(milliseconds).toISOString();
                that.binding.mailingtrackingdata.ScheduledSendTS = date;
            }
            this.getTimeToSend = getTimeToSend;

            var getStatusHeader = function (rawdate) {
                Log.call(Log.l.trace, "MailingTracking.Controller.");
                that.binding.statusheader = rawdate;
            }
            this.getStatusHeader = getStatusHeader;

            var setTimeToSend = function () {
                Log.call(Log.l.trace, "MailingTracking.Controller.");

            }
            this.setTimeToSend = setTimeToSend;

            var setMailingTrackingData = function (mailingtrackingdata) {
                // Bug: textarea control shows 'null' string on null value in Internet Explorer!
                if (mailingtrackingdata.SupportComment === null) {
                    mailingtrackingdata.SupportComment = "";
                }
                if (textComment) {
                    if (that.binding.mailingtrackingdata.SupportComment) {
                        WinJS.Utilities.addClass(textComment, "input_text_comment_big");
                    } else {
                        WinJS.Utilities.removeClass(textComment, "input_text_comment_big");
                    }
                }
                AppBar.modified = false;
                return mailingtrackingdata;
            };
            this.setMailingTrackingData = setMailingTrackingData;

            var resultConverter = function (item, index) {
                if (item.SchedultedSendTS) {
                    that.getTimeToSend(item.SchedultedSendTS);
                }

            };
            this.resultConverter = resultConverter;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "MailingTracking.Controller.");
                AppData.setErrorMsg(that.binding);
                if (typeof that.binding.mailingtrackingdata.LanguageSpecID === "string") {
                    that.binding.mailingtrackingdata.LanguageSpecID = parseInt(that.binding.mailingtrackingdata.LanguageSpecID);
                }
                Log.call(Log.l.trace, "Mailing.Controller.");
                return AppData.call("PRC_UpdateExhibitorMailing",
                    {
                        pExhibitorMailingStatusID: that.binding.mailingtrackingdata.ExhibitorMailingStatusVIEWID,
                        pStatus: that.binding.mailingtrackingdata.Status,
                        pMailAddress: that.binding.mailingtrackingdata.UsedMailAddress,
                        pScheduledSendTS: that.binding.mailingtrackingdata.ScheduledSendTS,
                        pSupportComment: that.binding.mailingtrackingdata.SupportComment,
                        pLanguageSpecID: that.binding.mailingtrackingdata.LanguageSpecID,
                        pExhibitorCategory: that.binding.mailingtrackingdata.ExhibitorCategory,
                        pTempOnly: that.binding.mailsendoptdata

                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        AppBar.busy = false;
                        AppBar.modified = false;
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            AppData.setRecordId("ExhibitorMailingStatus", that.binding.mailingtrackingdata.FairMandantVeranstID);
                            master.controller.loadData();
                        }
                        that.loadData(that.binding.mailingtrackingdata.ExhibitorMailingStatusVIEWID);
                        Log.ret(Log.l.trace);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
            };
            this.saveData = saveData;

            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MailingTracking.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "MailingTracking.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "MailingTracking.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "MailingTracking.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "MailingTracking.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "MailingTracking.Controller.");
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
                    if (that.binding.mailingtrackingdata && AppBar.modified && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "MailingTracking.", "recordId=" + recordId);
                if (!recordId) {
                    recordId = AppData.getRestriction("ExhibitorMailingStatus");
                }
                that.binding.senddate = new Date().toLocaleString();
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!MailingTracking.initSpracheView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return MailingTracking.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;

                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initSprache && initSprache.winControl &&
                            (!initSprache.winControl.data || !initSprache.winControl.data.length)) {
                            var results = MailingTracking.initSpracheView.getResults();
                            initSprache.winControl.data = new WinJS.Binding.List(results);
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        AppData.setRecordId("MailingTracking", recordId);
                        return AppData.call("PRC_GetExhMailingStatus", {
                            pExhibitorMailingStatusID: recordId
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                            that.binding.mailingtrackingdata = json.d.results[0];
                            if (that.binding.mailingtrackingdata.SupportComment === null) {
                                that.binding.mailingtrackingdata.SupportComment = "";
                            }
                            that.binding.statusheader = "";
                            // that.getTimeToSend(that.binding.mailingtrackingdata.ScheduledSendTS);
                            that.getStatusHeader(that.binding.mailingtrackingdata.LastSendTS);
                            Log.print(Log.l.trace, "MailingTracking: success!");
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // Finally, wire up binding
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                that.setDisabledFields();
            });
            Log.ret(Log.l.trace);
        }, {
        })
    });
})();
