// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/crmSettings/crmSettingsService.js" />

(function () {
    "use strict";
    var namespaceName = "ContactCrmExport";

    WinJS.Namespace.define(namespaceName, {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {

            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataContact: getEmptyDefaultValue(ContactCrmExport.contactView.defaultValue),
                contactId: null
            }, commandList]);
            

            var crmExportContainer = pageElement.querySelector("#crmexport-container");

            var that = this;

            // dispose method hits called whenever the user navigates away from this page
            this.dispose = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");

                if (crmExportContainer && salesforceLeadLib && typeof salesforceLeadLib.clear === "function") {
                    // Call Clear method from salesforceLeadLib
                    salesforceLeadLib.clear(crmExportContainer);
                }
                Log.ret(Log.l.trace);
            }

            var getRecordId = function () {
                var recordId = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    recordId = master.controller.binding.contactId;
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    } else {
                        Application.navigateById("event");
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                }
            }

            this.disableHandlers = {
                clickOk: function () {
                    // always enabled!
                    return !that.binding.eventId;
                }
            }

            AppData.setErrorMsg(this.binding);

            var setDataContact = function (newDataContact) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataContact = newDataContact;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace);
            }
            this.setDataContact = setDataContact;

            var loadData = function () {
                var recordId = getRecordId();
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + that.binding.recordId);
                var ret = new WinJS.Promise.as().then(function () {
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select contactView...recordId=" + recordId);
                        return ContactCrmExport.contactView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "select contactView: success!");
                            if (json && json.d) {
                                that.setDataContact(json.d);
                            } else {
                                that.setDataContact(getEmptyDefaultValue(ContactCrmExport.contactView.defaultValue));
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "select contactView: error!");
                            that.setDataContact(getEmptyDefaultValue(ContactCrmExport.contactView.defaultValue));
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        that.setDataContact(getEmptyDefaultValue(ContactCrmExport.contactView.defaultValue));
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        return AppData.call("FCT_GetUniqueRecordID", {
                            pRelationName: "Kontakt",
                            pRecordID: recordId
                        }, function (json) {
                            Log.print(Log.l.info, "call FCT_GetUniqueRecordID: success! FCT_GetUniqueRecordID=" +
                                (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID));
                            that.binding.contactId =
                                (json && json.d && json.d.results && json.d.results.FCT_GetUniqueRecordID);
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "call FCT_ExistsLicenceWarning: error");
                            AppData.setErrorMsg(that.binding, errorResponse);
                            that.binding.contactId = null;
                        });
                    } else {
                        that.binding.contactId = null;
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    AppBar.triggerDisableHandlers();

                    // Initialize Salesforce Lead Library and open CRM Export
                    if (that.binding.contactId && crmExportContainer) {
                        // Initialize with Portal Admin credentials
                        var serverUrl = AppData.getBaseURL(AppData.appSettings.odata.onlinePort);
                        var apiName = AppData.getOnlinePath();
                        var user = AppData.getOnlineLogin();
                        var password = AppData.getOnlinePassword();

                        SalesforceLeadLib.init(serverUrl, apiName, user, password);

                        // Open CRM Export UI with contactId
                        SalesforceLeadLib.openCrmExport(crmExportContainer, that.binding.contactId).then(
                            function () {
                                Log.print(Log.l.info, "CRM Export UI opened successfully");
                            },
                            function (error) {
                                Log.print(Log.l.error, "Failed to open CRM Export UI: " + error.message);
                            }
                        );
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



