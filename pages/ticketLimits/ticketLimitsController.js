// controller for page: TicketLimits
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/ticketLimits/ticketLimitsService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("TicketLimits", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "TicketLimits.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataTicketLimits: getEmptyDefaultValue(TicketLimits.CRVeranstaltungBucketView.defaultValue)
            }, commandList]);
            var that = this;
            
            // Then, do anything special on this page

            var isHtml = function (input) {
                var parser = new DOMParser();
                var text = parser.parseFromString(input, 'text/html');
                return text.outerHTML;
            }
            this.isHtml = isHtml;

            this.eventHandlers = {
                clickASave: function (event) {
                    Log.call(Log.l.trace, "TicketLimits.Controller.");
                    that.saveData();
                    Log.call(Log.l.trace, "TicketLimits.Controller.");
                },
                clickBack: function (event) {
                    Log.call(Log.l.trace, "TicketLimits.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "TicketLimits.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "TicketLimits.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "TicketLimits.Controller.");
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
            }

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickSave: function () {
                    if (that.binding.dataTicketLimits && that.binding.dataTicketLimits.CRVeranstaltungBucketVIEWID) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "TicketLimits.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataTicketLimits = that.binding.dataTicketLimits;
                if (dataTicketLimits && AppBar.modified && !AppBar.busy) {
                    var recordId = dataTicketLimits.CRVeranstaltungBucketVIEWID;
                    if (recordId) {
                        AppBar.busy = true;
                        ret = TicketLimits.CRVeranstaltungBucketView.update(function(response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "dataProduct update: success!");
                                AppBar.modified = false;
                                if (typeof complete === "function") {
                                    complete(response);
                                }
                            },
                            function(errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            },
                            recordId, dataTicketLimits);
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
                            complete(dataTicketLimits);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "TicketLimits.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return TicketLimits.CRVeranstaltungBucketView.select(function(json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "TicketLimits: success!");
                            // startContact returns object already parsed from json file in response
                            if (json && json.d && json.d.results) {
                                that.binding.dataTicketLimits = json.d.results[0];
                                that.binding.dataTicketLimits.BucketInfo = that.isHtml(that.binding.dataTicketLimits.BucketInfo);
                                Log.print(Log.l.trace, "TicketLimits: success!");
                            }
                        }, function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        },
                        {
                            CRVeranstaltungBucketVIEWID: recordId,
                            LanguageSpecID : AppData.getLanguageId()
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
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();