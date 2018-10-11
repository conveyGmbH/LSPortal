// controller for page: products
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailing/mailingService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("Products", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Products.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataProduct: getEmptyDefaultValue(Products.ProduktnameView.defaultValue),
                dataNewProduct: getEmptyDefaultValue(Products.ProduktView.defaultValue),
                emtyQuestion: Products.FragenView.defaultValue,
                mailingProductLineQuestionID: null,
                qaID: null,
                count: 0
            }, commandList]);
            var that = this;
            this.LanguageID = AppData.getLanguageId();
            this.curRecId = 0;
            this.prevRecId = 0;
            this.fields = null;
            this.productList = null;
            var progress = null;
            var counter = null;
            var layout = null;
            
            var listView = pageElement.querySelector("#productsList.listview");

            var languageIDtoInitID = function() {
                switch (that.LanguageID) {
                case 1031:
                    that.LanguageID = 1;
                        break;
                case 1033:
                    that.LanguageID = 2;
                        break;
                case 1036:
                    that.LanguageID = 3;
                        break;
                case 1040:
                    that.LanguageID = 4;
                        break;
                default:
                }
            }
            this.languageIDtoInitID = languageIDtoInitID;

            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "Products.Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        that.dataProduct = element.querySelectorAll('input[type="text"]');
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;
            
            var deleteData = function () {
                Log.call(Log.l.trace, "Products.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.deleteIDProduct;
                if (recordId) {
                    AppBar.busy = true;
                    Products.ProduktView.deleteRecord(function (response) {
                        AppBar.busy = false;
                        that.loadData();
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

            var mergeRecord = function (prevRecord, newRecord) {
                Log.call(Log.l.trace, "Products.Controller.");
                var ret = false;
                for (var prop in newRecord) {
                    if (newRecord.hasOwnProperty(prop)) {
                        if (newRecord[prop] !== prevRecord[prop]) {
                            prevRecord[prop] = newRecord[prop];
                            ret = true;
                        }
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.mergeRecord = mergeRecord;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "Products.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    if (that.dataProduct) {
                        for (var i = 0; i < that.dataProduct.length; i++) {
                            var field = that.dataProduct.getAt(i);
                            if (field &&
                                typeof field === "object" &&
                                field.ProduktnameVIEWID === recordId) {
                                listView.winControl.selection.set(i);
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "Products.Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.productList.length; i++) {
                    var field = that.productList.getAt(i);
                    if (field && typeof field === "object" &&
                        field.ProduktnameVIEWID === recordId) {
                        item = field;
                        break;
                    }
                }
                if (item) {
                    Log.ret(Log.l.trace, "i=" + i);
                    return { index: i, item: item };
                } else {
                    Log.ret(Log.l.trace, "not found");
                    return null;
                }
            };
            this.scopeFromRecordId = scopeFromRecordId;
            
            var insertProduct = function () {
                Log.call(Log.l.trace, "Products.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return Products.ProduktView.insert(function (json) {
                        AppBar.busy = false;
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "ProduktView insert: success!");
                        AppBar.modified = false;
                        // ProduktView returns object already parsed from json file in response
                        that.loadData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error inserting product");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { VeranstaltungID: AppData.getRecordId("Veranstaltung") });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.insertProduct = insertProduct;

            var getMailerzeilenVIEWID = function() {
                Log.call(Log.l.trace, "Products.Controller.");
                AppData.setErrorMsg(that.binding);
                var produktID = that.deleteIDProduct;
                var ret = new WinJS.Promise.as().then(function () {
                    return Products.MAILERZEILENView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "MAILERZEILENView select: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.MailerzeilenID = json.d.results[0].MAILERZEILENVIEWID;
                            that.MailerZeile = json.d.results[0];
                            that.updateQuestionAnwser();
                        }
                        
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error selecting mailerzeilen");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { MaildokumentID: that.MailID, ProduktID: produktID });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getMailerzeilenVIEWID = getMailerzeilenVIEWID;

            var updateQuestionAnwser = function () {
                Log.call(Log.l.trace, "Products.Controller.");
                var index = listView.winControl._selection._focused.index;
                var elementA = listView.winControl.elementFromIndex(index);
                var comboboxAnwser = elementA.querySelector("#productanwsercombo.win-dropdown");
                that.MailerZeile.AntwortenID = parseInt(comboboxAnwser.value);
                var elementQ = listView.winControl.elementFromIndex(index);
                var comboboxQuestion = elementQ.querySelector("#productquestioncombo.win-dropdown");
                that.MailerZeile.FragenID = parseInt(comboboxQuestion.value);
                delete that.MailerZeile.MAILERZEILENVIEWID;
                var ret = null;
                Log.call(Log.l.trace, "Product.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.MailerzeilenID;
                if (recordId) {
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = Products.MAILERZEILENView.update(function (response) {
                                Log.print(Log.l.info, "Products.Controller. update: success!");
                                // called asynchronously if ok
                                AppBar.modified = false;
                                if (typeof complete === "function") {
                                    complete(response);
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                                }, recordId, that.MailerZeile);
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;

            }
            this.updateQuestionAnwser = updateQuestionAnwser;

            var getAnwserDataOnRAW = function(inx, questionID) {
                Log.call(Log.l.trace, "Products.Controller.");
                AppData.setErrorMsg(that.binding);
                that.productAnwserData = [];
                for (var i = 0; i < that.productAnwserDataRaw.length; i++) {
                    if (!questionID) {
                        if (that.productAnwserDataRaw[i].FragenID === 1684) {
                            that.productAnwserData.push({
                                AntwortenVIEWID: that.productAnwserDataRaw[i].AntwortenVIEWID,
                                Antwort: that.productAnwserDataRaw[i].Antwort
                            });
                        }
                    } else {
                        if(that.productAnwserDataRaw[i].FragenID == questionID) {
                            that.productAnwserData.push({
                                AntwortenVIEWID: that.productAnwserDataRaw[i].AntwortenVIEWID,
                                Antwort: that.productAnwserDataRaw[i].Antwort
                            });
                        }
                    }
                }
                that.productAnwserData.push({
                    AntwortenVIEWID: null,
                    Antwort: null
                });
                var elementA = listView.winControl.elementFromIndex(inx);
                var comboboxAnwser = elementA.querySelector("#productanwsercombo.win-dropdown");
                comboboxAnwser.winControl.data = new WinJS.Binding.List(that.productAnwserData);
                comboboxAnwser.value = that.binding.qaID[inx].AntwortenID;
                Log.call(Log.l.trace, "Products.Controller.");
            }
            this.getAnwserDataOnRAW = getAnwserDataOnRAW;

            var saveData = function (complete, error) {
                var ret = null;
                Log.call(Log.l.trace, "Product.Controller.");
                AppData.setErrorMsg(that.binding);
                // standard call via modify
                var recordId = that.prevRecId;
                if (!recordId) {
                    // called via canUnload
                    recordId = that.curRecId;
                }
                that.prevRecId = 0;
                if (recordId) {
                    var curScope = that.scopeFromRecordId(recordId);
                    if (curScope && curScope.item) {
                        var newRecord = that.getFieldEntries(curScope.index);
                        if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) {
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = Products.ProduktnameView.update(function (response) {
                                Log.print(Log.l.info, "Products.Controller. update: success!");
                                // called asynchronously if ok
                                AppBar.modified = false;
                                if (typeof complete === "function") {
                                    complete(response);
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            }, recordId, curScope.item);
                        } else {
                            Log.print(Log.l.trace, "no changes in recordId:" + recordId);
                        }
                    }
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Products.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    that.insertProduct();
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Products.Controller.");
                    var recordId = that.curRecId;
                    if (recordId) {
                        var curScope = that.binding.dataProduct;
                        if (curScope) {
                            var confirmTitle = getResourceText("mailing.labelDelete") + ": " + curScope.Name +
                                "\r\n" + getResourceText("mailing.mailDelete");
                            confirm(confirmTitle, function (result) {
                                if (result) {
                                    Log.print(Log.l.trace, "clickDelete: product choice OK");
                                    that.deleteData(function (response) {
                                        // delete OK 
                                        that.loadData();
                                    }, function (errorResponse) {
                                        // delete ERROR
                                        var message = null;
                                        Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                                        if (errorResponse.data && errorResponse.data.error) {
                                            Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                                            if (errorResponse.data.error.message) {
                                                Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                                message = errorResponse.data.error.message.value;
                                            }
                                        }
                                        if (!message) {
                                            message = getResourceText("error.delete");
                                        }
                                        alert(message);
                                    });
                                } else {
                                    Log.print(Log.l.trace, "clickDelete: product choice CANCEL");
                                }
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "Products.Controller.");
                    that.saveData();
                    that.getMailerzeilenVIEWID();
                    Log.ret(Log.l.trace);
                },
                clickQuestionProduct: function (event) {
                    Log.call(Log.l.trace, "Products.Controller.");
                    if(event.currentTarget) {
                        //var productindex = listView.options[listView.selectedIndex];
                        var productindex = listView.winControl.selection._focused.index;
                        var productquestion = event.currentTarget.value;
                        that.getAnwserDataOnRAW(productindex, productquestion);
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Products.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.ProduktnameVIEWID) {
                                        var newRecId = item.data.ProduktnameVIEWID;
                                        that.deleteIDProduct = item.data.ProduktID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            AppData.setRecordId('Produktname', newRecId);
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            if (that.prevRecId !== 0) {
                                                that.saveData(function (response) {
                                                    Log.print(Log.l.trace, "mandatory field saved");
                                                    AppBar.triggerDisableHandlers();
                                                }, function (errorResponse) {
                                                    Log.print(Log.l.error, "error saving mandatory field");
                                                });
                                            } else {
                                                AppBar.triggerDisableHandlers();
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Questionnaire.Controller.");
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Questionnaire.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible) {
                            if (that.dataProduct && that.nextUrl) {
                                that.loading = true;
                                if (progress && progress.style) {
                                    progress.style.display = "inline";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "none";
                                }
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "calling select ListLocal.contactView...");
                                var nextUrl = that.nextUrl;
                                that.nextUrl = null;
                                Products.ProduktnameView.selectNext(function (json) {
                                    // this callback will be called asynchronously
                                    // when the response is available
                                    Log.print(Log.l.trace, "ListLocal.contactView: success!");
                                    // startContact returns object already parsed from json file in response
                                    if (json && json.d) {
                                        that.nextUrl = Products.ProduktnameView.getNextUrl(json);
                                        
                                    }
                                }, function (errorResponse) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                    if (progress && progress.style) {
                                        progress.style.display = "none";
                                    }
                                    if (counter && counter.style) {
                                        counter.style.display = "inline";
                                    }
                                    that.loading = false;
                                }, null, nextUrl);
                            } else {
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Products.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        // single list selection
                        if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                            listView.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                        }
                        // direct selection on each tap
                        if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                            listView.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                        }
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Products.ListLayout.MailingProductLineLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                that.loading = false;
                            }
                            for (var i = 0; i < that.binding.count; i++) {
                                var elementQ = listView.winControl.elementFromIndex(i);
                                var comboboxQuestion = elementQ.querySelector("#productquestioncombo.win-dropdown");
                                comboboxQuestion.winControl.data = that.productQuestionData;
                                comboboxQuestion.value = that.binding.qaID[i].FragenID;
                                that.getAnwserDataOnRAW(i, that.binding.qaID[i].FragenID);
                            } 
                            /*for (var i = 0; i < that.binding.count; i++) {
                                var elementA = listView.winControl.elementFromIndex(i);
                                var comboboxAnwser = elementA.querySelector("#productanwsercombo.win-dropdown");
                                comboboxAnwser.winControl.data = that.productAnwserData;
                            }
                            */
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Products.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Products.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "Questionnaire.Controller.");
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
                    if (that.binding.dataProduct) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                // prevent some keyboard actions from listview to navigate within controls!
                this.addRemovableEventListener(listView, "keydown", function (e) {
                    if (!e.ctrlKey && !e.altKey) {
                        switch (e.keyCode) {
                        case WinJS.Utilities.Key.leftArrow:
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.space:
                            e.stopImmediatePropagation();
                            break;
                        }
                    }
                }.bind(this), true);
            }
            
            var loadData = function() {
                Log.call(Log.l.trace, "Products");
                AppData.setErrorMsg(that.binding);
                that.languageIDtoInitID();
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select MaildokumentView...");
                    return Products.MaildokumentView.select(function (json) {
                        Log.print(Log.l.trace, "MaildokumentView: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use
                            if (json.d.results.length === 0) {
                                Log.print(Log.l.trace, "No productmail found!");
                                that.MailIDFlag = false;
                            } else
                            {
                                that.MailID = json.d.results[0].MaildokumentVIEWID;
                                that.MailIDFlag = true;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                            INITSpracheID: that.LanguageID,
                            SpecType : 2
                    });
                }).then(function () {
                    if (that.MailIDFlag === true) {
                        Log.print(Log.l.trace, "calling select FragenView...");
                        //@nedra:25.09.2015: load the list of FragenView for Combobox
                        return Products.MAILERZEILENView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "FragenView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                that.binding.qaID = json.d.results;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, { MaildokumentID: that.mailID });
                    }
                }).then(function () {
                    if (that.MailIDFlag === true) {
                        Log.print(Log.l.trace, "calling select FragenView...");
                        //@nedra:25.09.2015: load the list of FragenView for Combobox
                        return Products.AntwortenView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "FragenView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                that.productAnwserDataRaw = json.d.results;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }); 
                    }
                }).then(function () {
                    if (that.MailIDFlag === true) {
                        Log.print(Log.l.trace, "calling select FragenView...");
                        //@nedra:25.09.2015: load the list of FragenView for Combobox
                        return Products.FragenView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "FragenView: success!");
                            if (json && json.d && json.d.results) {
                                that.productQuestionDataRAW = json.d.results;
                                that.productQuestionDataRAW.unshift(that.binding.emtyQuestion);
                                // Now, we call WinJS.Binding.List to get the bindable list
                                that.productQuestionData = new WinJS.Binding.List(that.productQuestionDataRAW);
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    }
                }).then(function () {
                    if (that.MailIDFlag === true) {
                        Log.print(Log.l.trace, "calling select FragenView...");
                        //@nedra:25.09.2015: load the list of FragenView for Combobox
                        return Products.AntwortenView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "FragenView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                that.productAnwserData = new WinJS.Binding.List(json.d.results);
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });  
                    }
                }).then(function () {
                    return Products.ProduktnameView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Products: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d) {
                            var results = json.d.results;
                            that.binding.count = results.length;
                            that.dataProduct = new WinJS.Binding.List(results);
                            that.productList = new WinJS.Binding.List(results);
                            if (listView && listView.winControl) {
                                // fix focus handling
                                that.setFocusOnItemInListView(listView);

                                listView.winControl._supressScrollIntoView = true;
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.dataProduct.dataSource;
                            }

                        } else {
                            that.dataProduct = null;
                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { LanguageSpecID: AppData.getLanguageId()});
                    }).then(function () {
                    //getshowMailSpec();
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
                newProduct: null,
                productList : null,
                MailID: null,
                MailIDFlag: false,
                MailerzeilenID: null,
                MailerZeile : null,
                lastProduct: null,
                deleteIDProduct: null,
                productQuestionDataRAW: null,
                productQuestionData: null,
                productAnwserData: null,
                productAnwserDataRaw: null
            })
    });
})();