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
            
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
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
                Log.call(Log.l.trace, "MailingProduct.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return Mailing.MaildokumentView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Mailing: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            that.binding.dataMail = json.d.results[0];
                            Log.print(Log.l.trace, "Mailing: success!");
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                        {
                            MaildokumentVIEWID : mailID,
                            LanguageID: AppData.getLanguageId()
                        }
                    );
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
                return that.loadData(that.binding.mailID);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            mailID: null
        })
    });
})();