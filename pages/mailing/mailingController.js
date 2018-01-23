// controller for page: mailing
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailing/mailingService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("Mailing", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Mailing.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataMail: getEmptyDefaultValue(Mailing.MaildokumentView.defaultValue)
            }, commandList]);
            var that = this;

            var standard = pageElement.querySelector("#standard");

            var setstandard = function () {
                if (that.binding.dataMail.IsDefault === null) {
                    return standard.checked = false;
                } else {
                    return standard.checked = true;
                }
            }
            this.setstandard = setstandard;

            var getstandard = function () {
                if (standard.checked === false) {
                    that.binding.dataMail.IsDefault = null;
                } else {
                    that.binding.dataMail.IsDefault = 1;
                }
            }
            this.getstandard = getstandard;

            var setDataMail = function (newDataMail) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.newMail.VeranstaltungID = AppData.getRecordId("Veranstaltung");
                that.binding.newMail.SpracheID = AppData.getLanguageId();
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            }
            this.setDataMail = setDataMail;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                that.getstandard();
                var dataMail = that.binding.dataMail;
                if (dataMail && AppBar.modified && !AppBar.busy) {
                    var recordId = dataMail.MaildokumentVIEWID;
                    if (recordId) {
                        AppBar.busy = true;
                        ret = Mailing.MaildokumentView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "dataMail update: success!");
                            AppBar.modified = false;
                            if (typeof complete === "function") {
                                complete(response);
                            }
                        },
                            function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            },
                            recordId, dataMail);
                    } else {
                        Log.print(Log.l.info, "not supported");
                        ret = WinJS.Promise.as();
                    }

                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataMail);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function(event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "Mail saved");
                        var newMail = getEmptyDefaultValue(Mailing.MaildokumentView.defaultValue);
                        Mailing.MaildokumentView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "MaildokumentView insert: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.setDataMail(json.d);
                                /* Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen */
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    master.controller.binding.mailId = that.binding.dataMail.MaildokumentVIEWID;
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(that.binding.dataMail.MaildokumentVIEWID);
                                    });
                                }
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting mail");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, newMail);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving mail");
                    });
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function(event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function(event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    Application.navigateById("publish", event);
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
                    if (that.binding.dataMail && that.binding.dataMail.MaildokumentVIEWID) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
            
            var loadData = function (mailID) {
                Log.call(Log.l.trace, "MailingProduct.", "mailID=" + mailID);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return Mailing.MaildokumentView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Mailing: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.dataMail = json.d;
                            that.setstandard();
                            Log.print(Log.l.trace, "Mailing: success!");
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, mailID);
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // Finally, wire up binding
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return that.loadData(that.binding.mailID);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            mailID: null
        })
    });
})();