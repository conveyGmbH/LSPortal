// controller for page: eventResourceAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventResourceAdministration/eventResourceAdministrationService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventResourceAdministration", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventResource: {
                    LabelTitle: "",
                    LabelDescription: "",
                    LabelMainTitle: "",
                    LabelSubTitle: "",
                    LabelSummary: "",
                    LabelBody: ""
                },
                DokVerwendungID: 0,
                VeranstaltungID: 0,
                overView: { Email: "" }
            }, commandList]);

            this.eventResources = new WinJS.Binding.List([]);

            var that = this;

            var dokVerwendungList = pageElement.querySelector("#dokVerwendungList.listview");

            var listLangMandantDokumentList = pageElement.querySelector("#listLangMandantDokumentList.listview");

            var singleRatingTemplate = null, multiRatingTemplate = null, comboTemplate = null, singleTemplate = null, multiTemplate = null;
            // Conditional renderer that chooses between templates
            var listQuestionListRenderer = function (itemPromise) {
                return itemPromise.then(function (item) {
                    if (item.data.Fragentyp === 1) {
                        if (!multiTemplate) {
                            multiTemplate = pageElement.querySelector(".questionList-multi-template").winControl;
                        }
                        return multiTemplate.renderItem(itemPromise);
                    } else if (item.data.Fragentyp === 2) {
                        if (!singleRatingTemplate) {
                            singleRatingTemplate = pageElement.querySelector(".questionList-rating-template").winControl;
                        }
                        return singleRatingTemplate.renderItem(itemPromise);
                    } else if (item.data.Fragentyp === 3) {
                        if (!multiRatingTemplate) {
                            multiRatingTemplate = pageElement.querySelector(".questionList-multiRating-template").winControl;
                        }
                        return multiRatingTemplate.renderItem(itemPromise);
                    } else if (item.data.Fragentyp === 4) {
                        if (!comboTemplate) {
                            comboTemplate = pageElement.querySelector(".questionList-combo-template").winControl;
                        }
                        return comboTemplate.renderItem(itemPromise);
                    } else {
                        if (!singleTemplate) {
                            singleTemplate = pageElement.querySelector(".questionList-single-template").winControl;
                        }
                        return singleTemplate.renderItem(itemPromise);
                    }
                });
            }
            this.listQuestionListRenderer = listQuestionListRenderer;

            var resultConverter = function(item, index) {
                if (!item.NameTitle) {
                    item.NameTitle = "";
                }
                if (!item.NameDescription) {
                    item.NameDescription = "";
                }
                if (!item.NameMainTitle) {
                    item.NameMainTitle = "";
                }
                if (!item.NameSubTitle) {
                    item.NameSubTitle = "";
                }
                if (!item.NameSummary) {
                    item.NameSummary = "";
                }
                if (!item.NameBody) {
                    item.NameBody = "";
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var restriction = {};
                that.reportingItem = new WinJS.Binding.List();
                var ret = new WinJS.Promise.as().then(function () {
                    if (that.reportingItem.length === 0) {
                        return EventResourceAdministration.LGNTINITDokVerwendungView.select(function (json) {
                            Log.print(Log.l.trace, "appInfoSpecView: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    //that.resultConverter(item, index);
                                    that.reportingItem.push(item);
                                });
                                if (dokVerwendungList && dokVerwendungList.winControl) {
                                    // add ListView dataSource
                                    dokVerwendungList.winControl.itemDataSource = that.reportingItem.dataSource;
                                }
                                Log.print(Log.l.trace, "Data loaded");
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            that.loading = false;
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.binding.DokVerwendungID && that.binding.VeranstaltungID) {
                        return EventResourceAdministration.LangMandantDokumentVIEWFormat.select(function (json) {
                            Log.print(Log.l.trace, "appInfoSpecView: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var results = json.d.results;
                                results.forEach(function(item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.eventResources = new WinJS.Binding.List(results);
                                Log.print(Log.l.trace, "Data loaded");
                            } else {
                                that.eventResources = new WinJS.Binding.List([]);
                            }
                            if (listLangMandantDokumentList && listLangMandantDokumentList.winControl) {
                                listLangMandantDokumentList.winControl.itemDataSource = that.eventResources.dataSource;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            that.loading = false;
                        }, {
                            LanguageSpecID: AppData.getLanguageId(),
                            VeranstaltungID: that.binding.VeranstaltungID,
                            DokVerwendungID: that.binding.DokVerwendungID
                        }); /*that.binding.DokVerwendungID*/
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                var ret = null;
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
                        var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                        if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) {
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = EventResourceAdministration.LangMandantDokumentVIEW.update(function (response) {
                                Log.print(Log.l.info, "questionListView update: success!");
                                if (that.eventResources) {
                                    that.resultConverter(curScope.item, curScope.index);
                                    that.eventResources.setAt(curScope.index, curScope.item);
                                }
                                //AppData.getUserData();
                                AppBar.modified = false;
                                // called asynchronously if ok
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
                complete({});
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    } else {
                        Application.navigateById(Application.startPageId, event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
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
                },
                /*clickOpenEdit: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    //nameheader 
                    //namebottom
                    var namebottom = pageElement.querySelector("#namebottom");
                    if (event.currentTarget.id === "nameheader" && namebottom) {
                        if (namebottom.style.display === "") {
                            namebottom.style.display = "none";
                        } else {
                            namebottom.style.display = "";
                        }
                    }
                    Log.ret(Log.l.trace);
                },*/
                clickChangeDokVerwendung: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    var value = parseInt(event.currentTarget.value);
                    that.binding.DokVerwendungID = value;
                    that.loadData();
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ContactList.Controller.");
                    if (dokVerwendungList && dokVerwendungList.winControl) {
                        var listControl = dokVerwendungList.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    var curPageId = Application.getPageId(nav.location);
                                    if (item.data &&
                                        item.data.KontaktVIEWID &&
                                        item.data.KontaktVIEWID !== that.binding.contactId) {
                                        if (AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                            //=== "function" save wird nicht aufgerufen wenn selectionchange
                                            // current detail view has saveData() function
                                            AppBar.scope.saveData(function (response) {
                                                // called asynchronously if ok
                                                that.binding.contactId = item.data.KontaktVIEWID;
                                                AppData.setRecordId("Kontakt", that.binding.contactId);
                                                handlePageEnable(item.data);
                                                if (curPageId === "contact" &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData();
                                                } else {
                                                    Application.navigateById("contact");
                                                }
                                            }, function (errorResponse) {
                                                that.selectRecordId(that.binding.contactId);
                                            });
                                        } else {
                                            // current detail view has NO saveData() function - is list
                                            that.binding.contactId = item.data.KontaktVIEWID;
                                            AppData.setRecordId("Kontakt", that.binding.contactId);
                                            handlePageEnable(item.data);
                                            if (curPageId === "contact" &&
                                                typeof AppBar.scope.loadData === "function") {
                                                AppBar.scope.loadData();
                                            } else {
                                                Application.navigateById("contact");
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (eventInfo && eventInfo.target) {
                        var comboInputFocus = eventInfo.target.querySelector(".win-dropdown:focus");
                        if (comboInputFocus) {
                            eventInfo.preventDefault();
                        } else {
                            // set focus into textarea if current mouse cursor is inside of element position
                            var setFocusOnElement = function (element) {
                                WinJS.Promise.timeout(0).then(function () {
                                    // set focus async!
                                    element.focus();
                                });
                            };
                            var textInputs = eventInfo.target.querySelectorAll(".win-textbox");
                            if (textInputs && textInputs.length > 0) {
                                for (var i = 0; i < textInputs.length; i++) {
                                    var textInput = textInputs[i];
                                    var position = WinJS.Utilities.getPosition(textInput);
                                    if (position) {
                                        var left = position.left;
                                        var top = position.top;
                                        var width = position.width;
                                        var height = position.height;
                                        if (that.cursorPos.x >= left && that.cursorPos.x <= left + width &&
                                            that.cursorPos.y >= top && that.cursorPos.y <= top + height) {
                                            setFocusOnElement(textInput);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ContactList.Controller.");
                    if (dokVerwendungList && dokVerwendungList.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + dokVerwendungList.winControl.loadingState);
                        // single list selection
                        if (dokVerwendungList.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                            dokVerwendungList.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                        }
                        // direct selection on each tap
                        if (dokVerwendungList.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                            dokVerwendungList.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                        }
                        // Double the size of the buffers on both sides
                        if (!maxLeadingPages) {
                            maxLeadingPages = dokVerwendungList.winControl.maxLeadingPages * 4;
                            dokVerwendungList.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = dokVerwendungList.winControl.maxTrailingPages * 4;
                            dokVerwendungList.winControl.maxTrailingPages = maxTrailingPages;
                        }
                        if (dokVerwendungList.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.ContactListLayout.ContactsLayout;
                                dokVerwendungList.winControl.layout = { type: layout };
                            }
                        } else if (dokVerwendungList.winControl.loadingState === "itemsLoaded") {
                            var indexOfFirstVisible = dokVerwendungList.winControl.indexOfFirstVisible;
                            var indexOfLastVisible = dokVerwendungList.winControl.indexOfLastVisible;
                            for (var i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                var element = dokVerwendungList.winControl.elementFromIndex(i);
                                if (element) {
                                    var img = element.querySelector(".list-compressed-doc");
                                    if (img && img.src) {
                                        that.imageRotate(element);
                                    }
                                }
                            }
                        } else if (dokVerwendungList.winControl.loadingState === "complete") {
                            // load SVG images
                            Colors.loadSVGImageElements(dokVerwendungList, "action-image-right", 40, Colors.textColor, "name", null, {
                                "barcode-qr": { useStrokeColor: false }
                            });
                            if (that.loading) {
                                progress = dokVerwendungList.querySelector(".list-footer .progress");
                                counter = dokVerwendungList.querySelector(".list-footer .counter");
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
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ContactList.Controller.");
                    if (eventInfo && eventInfo.detail && dokVerwendungList) {
                        var visible = eventInfo.detail.visible;
                        if (visible) {
                            var contentHeader = dokVerwendungList.querySelector(".content-header");
                            if (contentHeader) {
                                var halfCircle = contentHeader.querySelector(".half-circle");
                                if (halfCircle && halfCircle.style) {
                                    if (halfCircle.style.visibility === "hidden") {
                                        halfCircle.style.visibility = "";
                                        WinJS.UI.Animation.enterPage(halfCircle);
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ContactList.Controller.");
                    if (dokVerwendungList) {
                        progress = dokVerwendungList.querySelector(".list-footer .progress");
                        counter = dokVerwendungList.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;

                        if (visible && that.contacts && that.nextUrl) {
                            that.loadNextUrl();
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
                    Log.ret(Log.l.trace);
                }
            }

            this.disableHandlers = {
                clickOk: function () {
                    // always enabled!
                    return false;
                }
            }

            if (listLangMandantDokumentList) {
                this.addRemovableEventListener(listLangMandantDokumentList, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
            }
            AppData.setErrorMsg(this.binding);

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



