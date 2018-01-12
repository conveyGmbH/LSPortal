// controller for page: MailingProduct
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingProduct/mailingProductService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("MailingProduct", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingProduct.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataProduct: getEmptyDefaultValue(MailingProduct.MaildokumentView.defaultValue)
            }, commandList]);
            var that = this;
            
            // Then, do anything special on this page

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    Application.navigateById("publish", event);
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
                    if (that.binding.dataProduct && that.binding.dataProduct.MaildokumentVIEWID) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "MailingProduct.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataProduct = that.binding.dataProduct;
                if (dataProduct && AppBar.modified && !AppBar.busy) {
                    var recordId = dataProduct.MaildokumentVIEWID;
                    if (recordId) {
                        AppBar.busy = true;
                        ret = MailingProduct.MaildokumentView.update(function(response) {
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
                            recordId, dataProduct);
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
                            complete(dataProduct);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var loadData = function () {
                Log.call(Log.l.trace, "MailingProduct.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return MailingProduct.MaildokumentView.select(function(json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "MailingProduct: success!");
                            // startContact returns object already parsed from json file in response
                            if (json && json.d && json.d.results) {
                                that.binding.dataProduct = json.d.results[0];
                                Log.print(Log.l.trace, "MailingProduct: success!");
                            }
                        }, function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        },
                        {
                            LanguageID: AppData.getLanguageId(),
                            SpecType: 2
                        }
                    );
                }).then(function () {
                    if (that.binding.dataProduct.MaildokumentVIEWID) {
                        var mailingProductLineFragmentControl =
                            Application.navigator.getFragmentControlFromLocation(
                                Application.getFragmentPath("mailingProductLine"));
                        if (mailingProductLineFragmentControl && mailingProductLineFragmentControl.controller) {
                            return mailingProductLineFragmentControl.controller.loadData(that.binding.dataProduct
                                .MaildokumentVIEWID);
                        } else {
                            var parentElement = pageElement.querySelector("#mailingProductLinehost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement,
                                    "mailingProductLine",
                                    { mailingLine: that.binding.dataProduct.MaildokumentVIEWID });
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
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

            // Finally, wire up binding
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();