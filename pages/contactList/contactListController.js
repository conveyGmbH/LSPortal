// controller for page: contactList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/contactList/contactListService.js" />
/// <reference path="~/www/pages/contact/contactController.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("ContactList",
    {
        Controller: WinJS.Class.derive(Application.Controller,
            function Controller(pageElement) {
                Log.call(Log.l.trace, "ContactList.Controller.");
                Application.Controller.apply(this,[pageElement, {
                        count: 0,
                        doccount: 0,
                        contactId: null
                    }, true
                ]);
                this.nextUrl = null;
                this.nextDocUrl = null;
                this.loading = false;
                this.contacts = null;
                this.docs = null;

                this.firstDocsIndex = 0;
                this.firstContactsIndex = 0;

                var that = this;

                // ListView control
                var listView = pageElement.querySelector("#contactList.listview");

                this.dispose = function () {
                    if (listView && listView.winControl) {
                        listView.winControl.itemDataSource = null;
                    }
                    if (that.contacts) {
                        that.contacts = null;
                    }
                    if (that.docs) {
                        that.docs = null;
                    }
                    listView = null;
                }

                var progress = null;
                var counter = null;
                var layout = null;

                var maxLeadingPages = 0;
                var maxTrailingPages = 0;

                var handlePageEnable = function (contact) {
                    Log.call(Log.l.trace, "ContactList.Controller.", "recordId=" + (contact && contact.KontaktVIEWID));
                    if (AppData._persistentStates.hideQuestionnaire) {
                        NavigationBar.disablePage("questionnaire");
                    } else if (contact && contact.SHOW_Zeilenantwort) {
                        NavigationBar.enablePage("questionnaire");
                    } else {
                        NavigationBar.disablePage("questionnaire");
                    }
                    // if toggle sketch is on then show sketch even if there is sketch -> Show_KontaktNotiz === null
                    if (contact && contact.SHOW_KontaktNotiz) {
                        NavigationBar.enablePage("sketch");
                    } else {
                        NavigationBar.disablePage("sketch");
                    }
                    if (AppData._persistentStates.hideSketch) {
                        NavigationBar.disablePage("sketch");
                    } else {
                        NavigationBar.enablePage("sketch");
                    }
                    Log.ret(Log.l.trace);
                };

                var svgFromContact = function (id) {
                    if (id === 3) {
                        return "office_building";
                    } else if (id === 2) {
                        return "businesswoman";
                    } else if (id === 1) {
                        return "businessperson";
                    } else {
                        return "user";
                    }
                };
                this.svgFromContact = svgFromContact;

                var svgFromOption = function (option) {
                    var ret = null;
                    if (option) {
                        //console.log(option);
                        if (option.isVisitenkarte) {
                            ret = "id_card";
                        } else if (option.isBarcode) {
                            ret = "barcode";
                        } else
                            ret = "edit";
                    }
                    return ret;
                }
                this.svgFromOption = svgFromOption;

                var background = function (index) {
                    if (index % 2 === 0) {
                        return 1;
                    } else {
                        return null;
                    }
                };
                this.background = background;

                var getRestriction = function() {
                    var restriction = AppData.getRestriction("Kontakt");
                    if (!restriction) {
                        restriction = {};
                    } else {
                        if (!restriction.useErfassungsdatum &&
                            typeof restriction.Erfassungsdatum !== "undefined") {
                            delete restriction.Erfassungsdatum;
                        }
                        //@nedra:10.11.2015: Erfassungsdatum is undefined if it is not updated -> Erfassungsdatum = current date
                        if (restriction.useErfassungsdatum &&
                            typeof restriction.Erfassungsdatum === "undefined") {
                            restriction.Erfassungsdatum = new Date();
                        }
                        if (!restriction.usemodifiedTS &&
                            typeof restriction.ModifiedTS !== "undefined") {
                            delete restriction.ModifiedTS;
                        }
                        //@nedra:10.11.2015: modifiedTS is undefined if it is not updated -> modifiedTS = current date
                        if (restriction.usemodifiedTS &&
                            typeof restriction.ModifiedTS === "undefined") {
                            restriction.ModifiedTS = new Date();
                        }
                    }
                    return restriction;
                }
                this.getRestriction = getRestriction;

                var loadNextUrl = function (recordId) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                    if (that.contacts && that.nextUrl && listView) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        that.loading = true;
                        if (progress && progress.style) {
                            progress.style.display = "inline";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "none";
                        }
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "calling select ContactList.contactView...");
                        ContactList.contactView.selectNext(function (json) { //json is undefined
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "ContactList.contactView: success!");
                            // startContact returns object already parsed from json file in response
                            if (json && json.d && that.contacts) {
                                that.nextUrl = ContactList.contactView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, that.binding.count);
                                    that.binding.count = that.contacts.push(item);
                                });
                            } else {
                                that.nextUrl = null;
                            }
                            if (recordId) {
                                that.selectRecordId(recordId);
                            }
                            if (that.nextDocUrl) {
                                WinJS.Promise.timeout(250).then(function() {
                                    Log.print(Log.l.trace, "calling select ContactList.contactDocView...");
                                    ContactList.contactDocView.selectNext(function (json) { //json is undefined
                                        // this callback will be called asynchronously
                                        // when the response is available
                                        Log.print(Log.l.trace, "ContactList.contactDocView: success!");
                                        // startContact returns object already parsed from json file in response
                                        if (json && json.d) {
                                            that.nextDocUrl = ContactList.contactDocView.getNextUrl(json);
                                            var results = json.d.results;
                                            results.forEach(function (item, index) {
                                                that.resultDocConverter(item, that.binding.doccount);
                                                that.binding.doccount = that.docs.push(item);
                                            });
                                        } else {
                                            that.nextDocUrl = null;
                                        }
                                    }, function (errorResponse) {
                                        // called asynchronously if an error occurs
                                        // or server returns response with an error status.
                                        Log.print(Log.l.error, "ContactList.contactDocView: error!");
                                        AppData.setErrorMsg(that.binding, errorResponse);
                                    }, null, that.nextDocUrl);
                                });
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "ContactList.contactView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }, null, that.nextUrl);
                    }
                    Log.ret(Log.l.trace);
                }
                this.loadNextUrl = loadNextUrl;

                var scopeFromRecordId = function (recordId) {
                    var i;
                    Log.call(Log.l.trace, "Questiongroup.Controller.", "recordId=" + recordId);
                    var item = null;
                    if (that.contacts) {
                        for (i = 0; i < that.contacts.length; i++) {
                            var contact = that.contacts.getAt(i);
                            if (contact && typeof contact === "object" &&
                                contact.KontaktVIEWID === recordId) {
                                item = contact;
                                break;
                            }
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

                var scrollToRecordId = function (recordId) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                    if (that.loading) {
                        WinJS.Promise.timeout(50).then(function () {
                            that.scrollToRecordId(recordId);
                        });
                    } else {
                        if (recordId && listView && listView.winControl && that.contacts) {
                            for (var i = 0; i < that.contacts.length; i++) {
                                var contact = that.contacts.getAt(i);
                                if (contact && typeof contact === "object" &&
                                    contact.KontaktVIEWID === recordId) {
                                    listView.winControl.indexOfFirstVisible = i - 1;
                                    break;
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.scrollToRecordId = scrollToRecordId;

                var selectRecordId = function (recordId) {
                    var contact;
                    Log.call(Log.l.trace, "ContactList.Controller.", "recordId=" + recordId);
                    var recordIdNotFound = true;
                    if (recordId && listView && listView.winControl && listView.winControl.selection && that.contacts) {
                        for (var i = 0; i < that.contacts.length; i++) {
                            contact = that.contacts.getAt(i);
                            if (contact &&
                                typeof contact === "object" &&
                                contact.KontaktVIEWID === recordId) {
                                listView.winControl.selection.set(i).done(function() {
                                    WinJS.Promise.timeout(50).then(function() {
                                        that.scrollToRecordId(recordId);
                                    });
                                });
                                recordIdNotFound = false;
                                handlePageEnable(contact);
                                break;
                            }
                        }
                        if (recordIdNotFound) {
                            that.loadNextUrl(recordId);
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.selectRecordId = selectRecordId;

                var resultConverter = function (item, index) {
                    var map = AppData.initLandView.getMap();
                    var results = AppData.initLandView.getResults();

                    if (map && results) {
                        var curIndex = map[item.INITLandID];
                        if (typeof curIndex !== "undefined") {
                            var curInitLand = results[curIndex];
                            if (curInitLand) {
                                item["Land"] = curInitLand.TITLE;
                            }
                        }
                    }
                    item.index = index;
                    item.svgFormOf = svgFromContact(item.INITAnredeID);
                    item.svgSource = svgFromOption({
                        isVisitenkarte: item.SHOW_Visitenkarte,
                        isBarcode: item.SHOW_Barcode
                    });
                    item.company = ((item.Firmenname ? (item.Firmenname + " ") : ""));
                    item.fullName =
                    ((item.Title ? (item.Title + " ") : "") +
                        (item.Vorname ? (item.Vorname + " ") : "") +
                        (item.Name ? item.Name : ""));
                    item.address =
                        ((item.Strasse ? (item.Strasse + "\r\n") : "") +
                            ((item.PLZ || item.Stadt)
                                ? ((item.PLZ ? (item.PLZ + " ") : "") + (item.Stadt ? item.Stadt : "") + "\r\n")
                                : "") +
                            (item.Land ? (item.Land + "\r\n") : "") +
                            ((item.TelefonMobil)
                                ? (item.TelefonMobil + "\r\n")
                                : (item.TelefonFestnetz ? (item.TelefonFestnetz + "\r\n") : "") +
                                (item.EMail ? item.EMail : ""))) +
                        (item.Freitext1 ? "\r\n" + item.Freitext1 : "");
                    item.globalContactId = item.CreatorSiteID + "/" + item.CreatorRecID;
                    item.mitarbeiterFullName = (item.Mitarbeiter_Vorname ? (item.Mitarbeiter_Vorname + " ") : "") +
                        (item.Mitarbeiter_Nachname ? item.Mitarbeiter_Nachname : "");
                    item.OvwContentDOCCNT3 = "";
                    if (that.docs && index >= that.firstContactsIndex) {
                        for (var i = that.firstDocsIndex; i < that.docs.length; i++) {
                            var doc = that.docs[i];
                            if (doc.KontaktVIEWID === item.KontaktVIEWID) {
                                var docContent = doc.OvwContentDOCCNT3;
                                if (docContent) {
                                    var sub = docContent.search("\r\n\r\n");
                                    item.OvwContentDOCCNT3 = "data:image/jpeg;base64," + docContent.substr(sub + 4);
                                }
                                that.firstDocsIndex = i + 1;
                                that.firstContactsIndex = index + 1;
                                break;
                            }
                        }
                    }
                }
                this.resultConverter = resultConverter;

                var resultDocConverter = function(item, index) {
                    if (that.contacts && index >= that.firstDocsIndex) {
                        for (var i = that.firstContactsIndex; i < that.contacts.length; i++) {
                            var contact = that.contacts.getAt(i);
                            if (contact.KontaktVIEWID === item.KontaktVIEWID) {
                                var docContent = item.OvwContentDOCCNT3;
                                if (docContent) {
                                    var sub = docContent.search("\r\n\r\n");
                                    contact.OvwContentDOCCNT3 = "data:image/jpeg;base64," + docContent.substr(sub + 4);
                                } else {
                                    contact.OvwContentDOCCNT3 = "";
                                }
                                // preserve scroll position on change of row data!
                                var indexOfFirstVisible = -1;
                                if (listView && listView.winControl) {
                                    indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                }
                                that.contacts.setAt(i, contact);
                                if (indexOfFirstVisible >= 0 && listView && listView.winControl) {
                                    listView.winControl.indexOfFirstVisible = indexOfFirstVisible;
                                }
                                that.firstContactsIndex = i + 1;
                                that.firstDocsIndex = index + 1;
                                break;
                            }
                        }
                    }
                }
                this.resultDocConverter = resultDocConverter;

                // define handlers
                this.eventHandlers = {
                    clickBack: function (event) {
                        Log.call(Log.l.trace, "ContactList.Controller.");
                        if (WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    onSelectionChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "ContactList.Controller.");
                        if (listView && listView.winControl) {
                            var listControl = listView.winControl;
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
                                                },  function (errorResponse) {
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
                    onItemInvoked: function(eventInfo) {
                        Log.call(Log.l.trace, "ContactList.Controller.");
                        Application.showDetail();
                        Log.ret(Log.l.trace);
                    },
                    onLoadingStateChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "ContactList.Controller.");
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
                            // Double the size of the buffers on both sides
                            if (!maxLeadingPages) {
                                maxLeadingPages = listView.winControl.maxLeadingPages * 4;
                                listView.winControl.maxLeadingPages = maxLeadingPages;
                            }
                            if (!maxTrailingPages) {
                                maxTrailingPages = listView.winControl.maxTrailingPages * 4;
                                listView.winControl.maxTrailingPages = maxTrailingPages;
                            }
                            if (listView.winControl.loadingState === "itemsLoading") {
                                if (!layout) {
                                    layout = Application.ContactListLayout.ContactsLayout;
                                    listView.winControl.layout = { type: layout };
                                }
                            } else if (listView.winControl.loadingState === "complete") {
                                // load SVG images
                                Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor, "name");
                                if (that.loading) {
                                    progress = listView.querySelector(".list-footer .progress");
                                    counter = listView.querySelector(".list-footer .counter");
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
                        if (eventInfo && eventInfo.detail && listView) {
                            var visible = eventInfo.detail.visible;
                            if (visible) {
                                var contentHeader = listView.querySelector(".content-header");
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
                        if (listView) {
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
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

                };

                this.disableHandlers = {
                    clickBack: function () {
                        if (WinJS.Navigation.canGoBack === true) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }

                // register ListView event handler
                if (listView) {
                    this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                    this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                    this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                    this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                }

                Log.print(Log.l.trace, "calling select ContactList.contactView...");
                var loadData = function (recordId) {
                    Log.call(Log.l.trace, "ContactList.Controller.");
                    that.firstDocsIndex = 0;
                    that.firstContactsIndex = 0;
                    that.loading = true;
                    if (listView) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        if (progress && progress.style) {
                            progress.style.display = "inline";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "none";
                        }
                    }
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        if (!AppData.initLandView.getResults().length) {
                            Log.print(Log.l.trace, "calling select initLandData...");
                            //@nedra:25.09.2015: load the list of INITLand for Combobox
                            return AppData.initLandView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "initLandView: success!");
                            },
                                function (errorResponse) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        return ContactList.contactView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "contactView: success!");
                            // startContact returns object already parsed from json file in response
                            if (!recordId) {
                                if (json && json.d) {
                                    that.binding.count = json.d.results.length;
                                    that.nextUrl = ContactList.contactView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    that.contacts = new WinJS.Binding.List(results);

                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.contacts.dataSource;
                                    }
                                    Log.print(Log.l.trace, "Data loaded");
                                    if (results[0] && results[0].KontaktVIEWID) {
                                        WinJS.Promise.timeout(0).then(function() {
                                            that.selectRecordId(results[0].KontaktVIEWID);
                                        });
                                    }
                                } else {
                                    that.binding.count = 0;
                                    that.nextUrl = null;
                                    that.contacts = null;
                                    if (listView) {
                                        if (listView.winControl) {
                                            // add ListView dataSource
                                            listView.winControl.itemDataSource = null;
                                        }
                                        progress = listView.querySelector(".list-footer .progress");
                                        counter = listView.querySelector(".list-footer .counter");
                                        if (progress && progress.style) {
                                            progress.style.display = "none";
                                        }
                                        if (counter && counter.style) {
                                            counter.style.display = "inline";
                                        }
                                    }
                                    that.loading = false;
                                }
                            } else {
                                if (json && json.d && that.contacts) {
                                    var contact = json.d;
                                    that.resultConverter(contact);
                                    var objectrec = scopeFromRecordId(recordId);
                                    that.contacts.setAt(objectrec.index, contact);
                                }
                            }
                        },  function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (listView) {
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                            }
                            that.loading = false;
                        },
                        getRestriction(),
                        recordId);
                    }).then(function () {
                        return WinJS.Promise.timeout(250).then(function () {
                            return ContactList.contactDocView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "contactDocView: success!");
                                // startContact returns object already parsed from json file in response
                                if (json && json.d && json.d.results && json.d.results.length) {
                                    that.binding.doccount = json.d.results.length;
                                    that.nextDocUrl = ContactList.contactDocView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function(item, index) {
                                        that.resultDocConverter(item, index);
                                    });
                                    that.docs = results;
                                } else {
                                    Log.print(Log.l.trace, "contactDocView: no data found!");
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                Log.print(Log.l.error, "ContactList.contactDocView: error!");
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            getRestriction());
                        });
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
                    Log.print(Log.l.trace, "Record selected");
                });
                Log.ret(Log.l.trace);
            })
    });
})();






