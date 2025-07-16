// controller for page: siteEventsNeuAus
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/siteEventsTermin/siteEventsTerminService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("SiteEventsTermin", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataTermin: getEmptyDefaultValue(SiteEventsTermin.defaultValue), //SiteEventsTermin.defaultValue
                InitFairVeranstalterItem: { FairVeranstalterID: 0, Name: "" },
                VeranstaltungTerminID: 0,
                eventclosedtext: getResourceText("siteeventsTermin.eventclosed")
            }, commandList]);
            
            var fairVeranstalter = pageElement.querySelector("#FairVeranstalter");
            this.binding.dataTermin.StartDatum = new Date();
            this.binding.dataTermin.EndDatum = new Date();

            var that = this;

            var terminStatus = pageElement.querySelector("#TerminStatus");
            var initServer = pageElement.querySelector("#InitServer");

            var creatingTerminStatusCategory = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var terminStatusCategory = [
                    {
                        value: 0,
                        TITLE: null
                    },
                    {
                        value: 1,
                        TITLE: "CANCELED"
                    },
                    {
                        value: 2,
                        TITLE: "HIDE"
                    },
                    {
                        value: 3,
                        TITLE: "SHOW"
                    }
                ];
                if (terminStatus && terminStatus.winControl) {
                    terminStatus.winControl.data = new WinJS.Binding.List(terminStatusCategory);
                    terminStatus.selectedIndex = 0;
                }
            };
            this.creatingTerminStatusCategory = creatingTerminStatusCategory;

            var getRecordId = function () {
                Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                that.binding.VeranstaltungTerminID = AppData.getRecordId("VeranstaltungTermin");
                Log.ret(Log.l.trace, that.binding.VeranstaltungTerminID);
                return that.binding.VeranstaltungTerminID;
            }
            this.getRecordId = getRecordId;

            var saveTermin = function () {
                Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                AppBar.busy = true;      
                AppData.setErrorMsg(that.binding);
                that.binding.dataTermin.StartDatum = new Date(that.binding.dataTermin.StartDatum).toISOString();
                that.binding.dataTermin.EndDatum = new Date(that.binding.dataTermin.EndDatum).toISOString();
                var field = pageElement.querySelector('input[type="checkbox"]');
                if (field.checked) {
                    that.binding.dataTermin.TerminClosed = 1;
                } else {
                    that.binding.dataTermin.TerminClosed = 0;
                }
                if (typeof that.binding.dataTermin.MailBCC === "undefined") {
                    that.binding.dataTermin.MailBCC = null;
                }
                if (typeof that.binding.dataTermin.MailCC === "undefined") {
                    that.binding.dataTermin.MailCC = null;
                }
                if (typeof that.binding.dataTermin.MailFrom === "undefined") {
                    that.binding.dataTermin.MailFrom = null;
                }
                if (typeof that.binding.dataTermin.MailReplyTo === "undefined") {
                    that.binding.dataTermin.MailReplyTo = null;
                }
                if (that.binding.dataTermin.DefRemoteKonfigID === null) {
                    that.binding.dataTermin.DefRemoteKonfigID = 0;
                }
                if (typeof that.binding.dataTermin.DefRemoteKonfigID === "string") {
                    that.binding.dataTermin.DefRemoteKonfigID = parseInt(that.binding.dataTermin.DefRemoteKonfigID);
                }
                if (that.binding.dataTermin.FairVeranstalterID === null) {
                    that.binding.dataTermin.FairVeranstalterID = 0;
                }
                AppData.call("PRC_CreateVATerminPortal",
                    {
                        pShortName: that.binding.dataTermin.VeranstaltungName,
                        pDisplayName: that.binding.dataTermin.DisplayName,
                        pStartDate: that.binding.dataTermin.StartDatum,
                        pEndDate: that.binding.dataTermin.EndDatum,
                        pFairVeranstalterID: parseInt(that.binding.dataTermin.FairVeranstalterID),
                        pFairLocationID: 0, /* Stand 2023 @hung: For now always 0 */
                        pVeranstaltungTerminID: that.binding.dataTermin.VeranstaltungTerminVIEWID,
                        pStatus: that.binding.dataTermin.Status,
                        pHostReference: that.binding.dataTermin.HostReference,
                        pEventSuccessID: that.binding.dataTermin.EventSuccessID,
                        pDefRemoteKonfigID: that.binding.dataTermin.DefRemoteKonfigID,
                        pMailBCC: that.binding.dataTermin.MailBCC,
                        pMailCC: that.binding.dataTermin.MailCC,
                        pMailFrom: that.binding.dataTermin.MailFrom,
                        pMailReplyTo: that.binding.dataTermin.MailReplyTo,
                        pTerminCLosed: that.binding.dataTermin.TerminClosed,
                        pEventURL: that.binding.dataTermin.EventURL
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        AppBar.modified = false;
                        AppBar.busy = false;
                        if (that.binding.VeranstaltungTerminID === 0) {
                            Application.navigateById("siteevents");
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                Log.ret(Log.l.trace); 
            }
            this.saveTermin = saveTermin;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                    if (that.binding.dataTermin && AppBar.modified && !AppBar.busy) {
                    that.saveTermin();
                    }
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
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
                    if (that.binding.dataTermin.VeranstaltungName && AppBar.modified && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            var getDateObject = function (dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = new Date(milliseconds).toISOString();
                    //.toLocaleString('de-DE').substr(0, 10);
                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var setTerminData = function (terminData) {
                if (typeof terminData.MailBCC === "undefined") {
                    terminData.MailBCC = null;
                }
                if (typeof terminData.MailCC === "undefined") {
                    terminData.MailCC = null;
                }
                if (typeof terminData.MailFrom === "undefined") {
                    terminData.MailFrom = null;
                }
                if (typeof terminData.MailReplyTo === "undefined") {
                    terminData.MailReplyTo = null;
                }
                if (terminData.StartDatum) {
                    terminData.StartDatum = that.getDateObject(terminData.StartDatum);
                }
                if (terminData.EndDatum) {
                    terminData.EndDatum = that.getDateObject(terminData.EndDatum);
                }
                that.binding.dataTermin = terminData;
                AppBar.triggerDisableHandlers();
            }
            this.setTerminData = setTerminData;

            var loadData = function (complete, error) {
                AppData.setErrorMsg(that.binding);
                var ret = WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    that.remoteServerList = new WinJS.Binding.List([SiteEventsTermin.remoteKonfigurationView.defaultValue]);
                    // that.employees = new WinJS.Binding.List([Search.employeeView.defaultValue]);
                    initServer.winControl.data = new WinJS.Binding.List();
                    Log.print(Log.l.trace, "calling select eventView...");
                    return SiteEventsTermin.remoteKonfigurationView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "eventView: success!");
                        if (json && json.d) {
                            // now always edit!
                            var results = json.d.results;
                            //that.setDataEvent(json.d);
                            results.forEach(function (item, index) {
                                //that.resultConverter(item, index);
                                that.remoteServerList.push(item);
                            });
                            if (initServer && initServer.winControl) {
                                initServer.winControl.data = that.remoteServerList;
                                initServer.selectedIndex = 0;
                            }
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    Log.print(Log.l.trace, "calling select MaildokumentView...");
                    return SiteEventsTermin.FairVeranstalterView.select(function (json) {
                        Log.print(Log.l.trace, "FairVeranstalterView: success!");
                        /*if (!that.employees || !that.employees.length) {
                            that.employees = new WinJS.Binding.List([Search.employeeView.defaultValue]);*/
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            // store result for next use
                            var result = json.d.results;
                            if (fairVeranstalter && fairVeranstalter.winControl) {
                                fairVeranstalter.winControl.data = new WinJS.Binding.List(result);
                                that.binding.dataTermin.FairVeranstalterID = result[0].FairVeranstalterVIEWID;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    if (that.binding.VeranstaltungTerminID !== 0) {
                        Log.print(Log.l.trace, "calling select VeranstaltungView...");
                        //@nedra:25.09.2015: load the list of FragenView for Combobox
                        return SiteEventsTermin.VeranstaltungView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "VeranstaltungView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                var result = json.d.results[0];
                                //that.binding.dataTermin = result;
                                that.setTerminData(result);
                                fairVeranstalter.disabled = true; 
                                Log.print(Log.l.trace, "VeranstaltungView: success!");
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, { VeranstaltungTerminVIEWID: that.binding.VeranstaltungTerminID });
                    }
                });
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                that.creatingTerminStatusCategory();
            }).then(function () {
                Log.print(Log.l.trace, "getRecordId loaded!");
                return that.getRecordId();
            }).then(function () {
                var caption_field = pageElement.querySelector(".caption-field");
                if (!caption_field) {
                    return WinJS.Promise.as();
                }
                if (that.binding.VeranstaltungTerminID !== 0) {
                    caption_field.textContent = getResourceText("siteeventsTermin.titleUpdate");

                } else {
                    caption_field.textContent = getResourceText("siteeventsTermin.title");
                }
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            });
            Log.ret(Log.l.trace);
        }, {
                eventChangeId: null
            })

    });
})();
