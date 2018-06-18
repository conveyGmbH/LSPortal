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
                count: 0
            }, commandList]);
            var that = this;
            this.curRecId = 0;
            this.prevRecId = 0;
            this.fields = null;
            this.productList = null;
            var progress = null;
            var counter = null;
            var layout = null;
            
            var listView = pageElement.querySelector("#productsList.listview");

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
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select MaildokumentView...");
                    return Products.ProduktnameView.select(function (json) {
                        Log.print(Log.l.trace, "MaildokumentView: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            // store result for next use
                            if (json.d.results[0].ProduktnameVIEWID) {
                                that.mailID = json.d.results[0].ProduktnameVIEWID;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        LanguageID: AppData.getLanguageId()
                    });
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
                                var getTextareaForFocus = function (element) {
                                    var focusElement = null;
                                    if (element) {
                                        var freitextInputs =
                                            element.querySelectorAll(".win-textarea, .win-textbox");
                                        if (freitextInputs)
                                            for (var i = 0; i < freitextInputs.length; i++) {
                                                var freitextInput = freitextInputs[i];
                                                if (freitextInput) {
                                                    var position = WinJS.Utilities.getPosition(freitextInput);
                                                    if (position) {
                                                        var left = position.left;
                                                        var top = position.top;
                                                        var width = position.width;
                                                        var height = position.height;
                                                        if (that.cursorPos.x >= left &&
                                                            that.cursorPos.x <= left + width &&
                                                            that.cursorPos.y >= top &&
                                                            that.cursorPos.y <= top + height + 2) {
                                                            focusElement = freitextInput;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                    }
                                    Log.ret(Log.l.trace);
                                    return focusElement;
                                }
                                var trySetActive = function (element, scroller) {
                                    var success = true;
                                    // don't call setActive() if a dropdown control has focus!
                                    var comboInputFocus = element.querySelector(".win-dropdown:focus");
                                    if (!comboInputFocus) {
                                        try {
                                            var focusElement;
                                            if (typeof element.setActive === "function") {
                                                focusElement = getTextareaForFocus(element);
                                                element.setActive();
                                                if (focusElement && focusElement !== element) {
                                                    focusElement.focus();
                                                }
                                            } else {
                                                // check for existence of WinRT
                                                var resources = Resources.get();
                                                if (resources) {
                                                    focusElement = getTextareaForFocus(element);
                                                    if (focusElement && focusElement !== element) {
                                                        WinJS.Promise.timeout(0).then(function () {
                                                            focusElement.focus();
                                                        });
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            // setActive() raises an exception when trying to focus an invisible item. Checking visibility is non-trivial, so it's best
                                            // just to catch the exception and ignore it. focus() on the other hand, does not raise exceptions.
                                            success = false;
                                        }
                                    }
                                    return success;
                                };
                                // overwrite _setFocusOnItem for this ListView to supress automatic
                                // scroll-into-view when calling item.focus() in base.js implementation
                                // by prevent the call of _ElementUtilities._setActive(item);
                                listView.winControl._setFocusOnItem = function ListView_setFocusOnItem(entity) {
                                    this._writeProfilerMark("_setFocusOnItem,info");
                                    if (this._focusRequest) {
                                        this._focusRequest.cancel();
                                    }
                                    if (this._isZombie()) {
                                        return;
                                    }
                                    var winControl = this;
                                    var setFocusOnItemImpl = function (item) {
                                        if (winControl._isZombie()) {
                                            return;
                                        }

                                        if (winControl._tabManager.childFocus !== item) {
                                            winControl._tabManager.childFocus = item;
                                        }
                                        winControl._focusRequest = null;
                                        if (winControl._hasKeyboardFocus && !winControl._itemFocused) {
                                            if (winControl._selection._keyboardFocused()) {
                                                winControl._drawFocusRectangle(item);
                                            }
                                            // The requestItem promise just completed so _cachedCount will
                                            // be initialized.
                                            if (entity.type === WinJS.UI.ObjectType.groupHeader ||
                                                entity.type === WinJS.UI.ObjectType.item) {
                                                winControl._view
                                                    .updateAriaForAnnouncement(item,
                                                    (
                                                        entity.type === WinJS.UI.ObjectType.groupHeader
                                                            ? winControl._groups.length()
                                                            : winControl._cachedCount));
                                            }

                                            // Some consumers of ListView listen for item invoked events and hide the listview when an item is clicked.
                                            // Since keyboard interactions rely on async operations, sometimes an invoke event can be received before we get
                                            // to WinJS.Utilities._setActive(item), and the listview will be made invisible. If that happens and we call item.setActive(), an exception
                                            // is raised for trying to focus on an invisible item. Checking visibility is non-trivial, so it's best
                                            // just to catch the exception and ignore it.
                                            winControl._itemFocused = true;
                                            trySetActive(item);
                                        }
                                    };

                                    if (entity.type === WinJS.UI.ObjectType.item) {
                                        this._focusRequest = this._view.items.requestItem(entity.index);
                                    } else if (entity.type === WinJS.UI.ObjectType.groupHeader) {
                                        this._focusRequest = this._groups.requestHeader(entity.index);
                                    } else {
                                        this._focusRequest = WinJS.Promise.wrap(
                                            entity.type === WinJS.UI.ObjectType.header
                                                ? this._header
                                                : this._footer);
                                    }
                                    this._focusRequest.then(setFocusOnItemImpl);
                                };

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
                lastProduct: null,
                deleteIDProduct : null
            })
    });
})();