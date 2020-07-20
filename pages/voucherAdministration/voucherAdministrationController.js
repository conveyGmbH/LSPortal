// controller for page: voucherAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/voucherAdministration/voucherAdministrationService.js" />
/// <reference path="~/www/fragments/voucherAdministrationList/voucherAdministrationListController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("VoucherAdministration", {
        Controller: WinJS.Class.derive(Application.Controller,function Controller(pageElement, commandList) {
                Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                Application.Controller.apply(this,
                    [
                        pageElement, {
                            dataVoucherOrderEvent: getEmptyDefaultValue(VoucherAdministration.defaultRestriction),
                            recordID: 0,
                            newdevices: 0,
                            category: null,
                            orderbtnLabel: getResourceText("voucherAdministration.btnlabelorder"),
                            showMsg: 'none'
                        }, commandList
                    ]);

                var that = this;

                var vouchercategory = pageElement.querySelector("#voucherCategory");
                this.veranstterID = 0;

                var saveRestriction = function () {
                    AppData.setRestriction("", that.binding.restriction);
                }
                this.saveRestriction = saveRestriction;

                var getRecordId = function () {
                    Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                    
                    Log.ret(Log.l.trace, that.binding.recordID);
                    return that.binding.recordID;
                }
                this.getRecordId = getRecordId;

                var getDateObject = function (dateData) {
                    var ret;
                    if (dateData) {
                        var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                        var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        ret = new Date(milliseconds).toLocaleDateString();
                        //.toLocaleString('de-DE').substr(0, 10);
                    } else {
                        ret = "";
                    }
                    return ret;
                };
                this.getDateObject = getDateObject;

                /*var orderVoucher = function (id) {
                    Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                    var parid = parseInt(id);
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_OrderVouchers", {
                        pVeranstaltungID: parid,
                        pArticleTypeID: parid,
                        pNumVouchers: parid,
                        pUserComment: parid
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.loadData();
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.orderVoucher = orderVoucher;
                */

                var resetFields = function() {
                    Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                    that.binding.dataVoucherOrderEvent.UserComment = "";
                    that.binding.dataVoucherOrderEvent.NumVouchers = 0;
                    vouchercategory.selectedIndex = 0;
                }
                this.resetFields = resetFields;

                var createCsv = function (filename, rows) {
                    Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                    var processRow = function (row) {
                        var finalVal = '';
                        for (var j = 0; j < row.length; j++) {
                            var innerValue = row[j] === null ? '' : row[j].toString();
                            if (row[j] instanceof Date) {
                                innerValue = row[j].toLocaleString();
                            };
                            var result = innerValue.replace(/"/g, '""');
                            if (result.search(/("|,|\n)/g) >= 0)
                                result = '"' + result + '"';
                            if (j > 0)
                                finalVal += '';
                            finalVal += result;
                        }
                        return finalVal + '\n';
                    };

                    var csvFile = '';
                    for (var i = 0; i < rows.length; i++) {
                        csvFile += processRow(rows[i]);
                    }

                    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                    if (navigator.msSaveBlob) { // IE 10+
                        navigator.msSaveBlob(blob, filename);
                    } else {
                        var link = document.createElement("a");
                        if (link.download !== undefined) { // feature detection
                            // Browsers that support HTML5 download attribute
                            var url = URL.createObjectURL(blob);
                            link.setAttribute("href", url);
                            link.setAttribute("download", filename);
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }
                    }
                }
                this.createCsv = createCsv;
                
                var resultConverter = function (item, index) {
                    item.index = index;
                    item.Startdatum = that.getDateObject(item.Startdatum);
                    item.Enddatum = that.getDateObject(item.Enddatum);
                }
                this.resultConverter = resultConverter;
            
                var showWaitingText = function (show) {
                    var waitingMsg = pageElement.querySelector("#waitingmsg");
                    if (show === 1) {
                        waitingMsg.style.display = "block";
                    } else {
                        waitingMsg.style.display = "none";
                    }
                }
                this.showWaitingText = showWaitingText;

                // define handlers
                this.eventHandlers = {
                    clickBack: function (event) {
                        Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                        if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickOrderNewVoucher: function () {
                        Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                        AppData.setErrorMsg(that.binding);
                        that.showWaitingText(1);
                        var vid = AppData.getRecordId("Veranstaltung");
                        Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                        AppData.call("PRC_OrderVouchers", {
                            pVeranstaltungID: vid,
                            pArticleTypeID: parseInt(that.binding.dataVoucherOrderEvent.ArticleTypeID),
                            pNumVouchers: parseInt(that.binding.dataVoucherOrderEvent.NumVouchers),
                            pUserComment: that.binding.dataVoucherOrderEvent.UserComment
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                            that.resetFields();
                            that.loadData(1);
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                            that.resetFields();
                            that.showWaitingText(0);
                        });
                        Log.ret(Log.l.trace);
                    },
                    clickSortSpecOpen: function (event) {
                        var voucherAdministrationListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("voucherAdministrationList"));
                        var item = voucherAdministrationListFragmentControl.controller.scopeFromRecordId(event.target.value);
                        if (voucherAdministrationListFragmentControl && voucherAdministrationListFragmentControl.controller) {
                            return voucherAdministrationListFragmentControl.controller.openSecondaryList(item, event.target.value);
                        }
                        Log.call(Log.l.trace, "VoucherAdministrationList.Controller.");
                    },
                    clickDownloadVoucher: function (event) {
                        var id = parseInt(event.target.value);
                        Log.call(Log.l.trace, "VoucherAdministrationList.Controller.");
                        AppData.call("PRC_DownloadVoucherOrder", {
                            pESVoucherOrderID: id
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                            var downloadname = "Download.csv";
                            that.createCsv(downloadname, json.d.results);
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                        Log.ret(Log.l.trace);
                    },
                    clickChangeUserState: function (event) {
                        Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                        Application.navigateById("userinfo", event);
                        Log.ret(Log.l.trace);
                    },
                    clickGotoPublish: function (event) {
                        Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                        Application.navigateById("publish", event);
                        Log.ret(Log.l.trace);
                    },
                    clickTopButton: function (event) {
                        Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                        var anchor = document.getElementById("menuButton");
                        var menu = document.getElementById("menu1").winControl;
                        var placement = "bottom";
                        menu.show(anchor, placement);
                        Log.ret(Log.l.trace);
                    },
                    clickLogoff: function (event) {
                        Log.call(Log.l.trace, "VoucherAdministration.Controller.");
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
                    }
                };

                var loadData = function (waitingMsg) {
                    Log.call(Log.l.trace, "VoucherAdministration.Controller.");
                    that.loading = true;
                    var ID = AppData.getRecordId("Veranstaltung");
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        return VoucherAdministration.VeranstaltungView.select(function (json) {
                                Log.print(Log.l.trace, "LangESArticleTypeView: success!");
                                if (json && json.d && json.d.results) {
                                    var results = json.d.results[0];
                                    // Now, we call WinJS.Binding.List to get the bindable list
                                    that.veranstterID = results.VeranstaltungTerminID;
                                }
                            },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            { VeranstaltungVIEWID: AppData.getRecordId("Veranstaltung") });
                    }).then(function () {
                        return VoucherAdministration.LangESArticleTypeView.select(function(json) {
                                Log.print(Log.l.trace, "LangESArticleTypeView: success!");
                                if (json && json.d && json.d.results) {
                                    var results = json.d.results;
                                    // Now, we call WinJS.Binding.List to get the bindable list
                                    if (vouchercategory && vouchercategory.winControl) {
                                        vouchercategory.winControl.data = new WinJS.Binding.List(results);
                                        that.binding.dataVoucherOrderEvent.ArticleTypeID = results[0].ESArticleTypeID;
                                        vouchercategory.selectedIndex = 0;
                                    }
                                }
                            },
                            function(errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            { LanguageSpecID: AppData.getLanguageId(), VeranstaltungID: AppData.getRecordId("Veranstaltung"), VeranstaltungTerminID: that.veranstterID});
                    }).then(function () {
                        var voucherAdministrationListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("voucherAdministrationList"));
                        if (voucherAdministrationListFragmentControl && voucherAdministrationListFragmentControl.controller) {
                            return voucherAdministrationListFragmentControl.controller.loadData();
                        } else {
                            var parentElement = pageElement.querySelector("#voucheradministrationlisthost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "voucherAdministrationList");
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                     }).then(function () {
                         if (waitingMsg) {
                             that.showWaitingText(0);
                         } else {
                             Log.print(Log.l.trace, "WaitingMsg display not set!");
                         }
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                };
                this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "WaitingMsg display none");
                return that.showWaitingText(0);
            }).then(function () {
               Log.print(Log.l.trace, "Binding wireup page complete");
               return that.loadData(); 
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
                Log.ret(Log.l.trace);
            })
    });
})();