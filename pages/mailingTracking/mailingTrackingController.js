// controller for page: mailingTracking
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailing/mailingService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("MailingTracking", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingTracking.Controller.");
            Application.Controller.apply(this, [pageElement, {
                mailingtrackingdata: getEmptyDefaultValue(MailingTracking.MailTrackingDialogView.defaultValue)
            }, commandList]);
            var that = this;

            var datefield = pageElement.querySelector("#InitSprache");
            var timefield = pageElement.querySelector("#InitSprache");

            // select combo
            var initSprache = pageElement.querySelector("#InitSprache");
            var textComment = pageElement.querySelector(".input_text_comment");

            var getRecordId = function () {
                Log.call(Log.l.trace, "MailingTracking.Controller.");
                var recordId = AppData.getRecordId("Maildokument");
                Log.ret(Log.l.trace, recordId);
                return recordId;
            };
            this.getRecordId = getRecordId;

            var getTimeToSend = function(date) {
                Log.call(Log.l.trace, "MailingTracking.Controller.");
                var year = date.getFullYear(),
                    month = date.getMonth() + 1,
                    day = date.getDate(),
                    hour = date.getHours(),
                    min = date.getMinutes();
                month = (month < 10 ? '0' + month : month);
                day = (day < 10 ? '0' + day : day);
                hour = (hour < 10 ? '0' + hour : hour); 
                min = (min < 10 ? '0' + min : min);

                datefield.val(day + '/' + month + '/' + year);
                timefield.val(hour + ':' + min);
            }
            this.getTimeToSend = getTimeToSend;

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
                
                
            };
            this.resultConverter = resultConverter;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                
            };
            this.saveData = saveData;
            
            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    Application.navigateById("publish", event);
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
                    if (that.binding.dataMail && AppBar.modified && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "MailingTracking.", "recordId=" + recordId);
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
                        return MailingTracking.MailTrackingDialogView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "MailingTracking: success!");
                            if (json && json.d) {
                                that.binding.mailingtrackingdata = json.d.results;
                                Log.print(Log.l.trace, "MailingTracking: success!");
                            }
                            // startContact returns object already parsed from json file in response
                        },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.

                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            recordId);
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
                //return that.loadData(getRecordId());
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            })
    });
})();