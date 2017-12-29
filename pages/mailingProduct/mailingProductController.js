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
                dataProduct: MailingProduct.MaildokumentView.defaultValue
            }, commandList]);
            this.MaildokumentVIEWID = 0;
            this.productMail = 0;
            var that = this;
            
            // Then, do anything special on this page

            var LanguageId = function () {
                var lang = AppData.getLanguageId();
                switch (lang) {
                    case 1031:
                        lang = 1;
                    break;
                    case 1033:
                        lang = 2;
                    break;
                    case 1036:
                        lang = 3;
                    break;
                    case 1040:
                        lang = 4;
                    break;
                default:
                }
                return lang;
            }
            this.LanguageId = LanguageId;

            var setDataProductMail = function () {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataProduct.MaildokumentVIEWID = that.productMail.MaildokumentVIEWID;
                that.binding.dataProduct.Sender = that.productMail.Sender;
                that.binding.dataProduct.Subject = that.productMail.Subject;
                that.binding.dataProduct.CCAddr = that.productMail.CCAddr;
                that.binding.dataProduct.BCCAddr = that.productMail.BCCAddr;
                that.binding.dataProduct.Mailtext = that.productMail.Mailtext;
                that.binding.dataProduct.ReplyTo = that.productMail.ReplyTo;
                that.binding.dataProduct.INITSpracheID = that.LanguageId();
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            }
            this.setDataProductMail = setDataProductMail;

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
                                complete(response);
                            },
                            function(errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
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
                        complete(dataProduct);
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var resultConverter = function (item, index) {
                var map = MailingProduct.MAILERZEILENView.getMap();
                var results = MailingProduct.MAILERZEILENView.getResults();
                if (map && results) {
                    var curIndex = map[item.MAILERZEILENVIEWID];
                    if (typeof curIndex !== "undefined") {
                        var curMailerline = results[curIndex];
                        if (curMailerline) {
                            item["ZeilenText"] = curMailerline.ZeilenText;
                        }
                    }
                }
                item.index = index;
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "MailingProduct.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                        return MailingProduct.MaildokumentView.select(function(json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "MailingProduct: success!");
                                // startContact returns object already parsed from json file in response
                                if (json && json.d) {
                                    //that.nextUrl = MailingProduct.MaildokumentView.getNextUrl(json);
                                    var results = json.d.results[0];
                                    that.MaildokumentVIEWID = results.MaildokumentVIEWID;
                                    that.productMail = results;
                                    that.setDataProductMail();
                                    Log.print(Log.l.trace, "MailingProduct: success!");
                                } else {
                                    
                                }
                            }, function(errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                        {
                            INITSpracheID: that.LanguageId()
                        }
                    );
                }).then(function () {
                    var mailingProductLineFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("mailingProductLine"));
                    if (mailingProductLineFragmentControl && mailingProductLineFragmentControl.controller) {
                        return mailingProductLineFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#mailingProductLinehost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "mailingProductLine", { mailingLine: that.MaildokumentVIEWID });
                        } else {
                            return WinJS.Promise.as();
                        }
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
        }, {
            mailingZeile: null
        })
    });
})();