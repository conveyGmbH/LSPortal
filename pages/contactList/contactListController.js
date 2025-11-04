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
    var namespaceName = "ContactList";

    WinJS.Namespace.define("ContactList",
        {
            Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                // ListView control
                var listView = pageElement.querySelector("#contactList.listview");
                this.listView = listView;
                Application.Controller.apply(this, [pageElement, {
                    count: 0,
                    doccount: 0,
                    contactId: 0,
                    noctcount: 0,
                    noeccount: 0,
                    nouccount: 0,
                    searchString: "",
                    eventId: 0,
                    leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                    btnDateSort: ContactList._orderAttribute === "Erfassungsdatum" ?
                        getResourceText(ContactList._orderDesc ? "contactList.btnDateDesc" : "contactList.btnDateAsc") :
                        getResourceText("contactList.btnDateSort"),
                    btnCompanySort: ContactList._orderAttribute === "Firmenname" ?
                        getResourceText(ContactList._orderDesc ? "contactList.btnCompanyDesc" : "contactList.btnCompanyAsc") :
                        getResourceText("contactList.btnCompanySort"),
                    btnNameSort: ContactList._orderAttribute === "Name" ?
                        getResourceText(ContactList._orderDesc ? "contactList.btnNameDesc" : "contactList.btnNameAsc") :
                        getResourceText("contactList.btnNameSort"),
                    showEventCombo: AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents
                }, commandList, true]);
                this.nextUrl = null;
                this.nextDocUrl = null;
                this.contacts = null;
                this.docs = null;
                this.refreshPromise = null;
                this.refreshDocPromise = null;
                this.refreshNextPromise = null;
                this.refreshNextDocPromise = null;
                this.refreshWaitTimeMs = 30000;

                this.firstDocsIndex = 0;
                this.firstContactsIndex = 0;

                var that = this;

                var eventsDropdown = pageElement.querySelector("#events");
                var eventsContainer = pageElement.querySelector("#events-container");
                var searchField = pageElement.querySelector("#searchField");
                var btnDateSort = pageElement.querySelector("#btnDateSort");
                var btnCompanySort = pageElement.querySelector("#btnCompanySort");
                var btnNameSort = pageElement.querySelector("#btnNameSort");

                // ListView control
                var listView = pageElement.querySelector("#contactList.listview");

                var cancelPromises = function () {
                    Log.call(Log.l.trace, "ContactList.Controller.");
                    if (that.refreshPromise) {
                        Log.print(Log.l.trace, "cancel previous refresh Promise");
                        that.refreshPromise.cancel();
                        that.refreshPromise = null;
                    }
                    if (that.refreshDocPromise) {
                        Log.print(Log.l.trace, "cancel previous doc refresh Promise");
                        that.refreshDocPromise.cancel();
                        that.refreshDocPromise = null;
                    }
                    if (that.refreshNextPromise) {
                        Log.print(Log.l.trace, "cancel previous next refresh Promise");
                        that.refreshNextPromise.cancel();
                        that.refreshNextPromise = null;
                    }
                    if (that.refreshNextDocPromise) {
                        Log.print(Log.l.trace, "cancel previous next doc refresh Promise");
                        that.refreshNextDocPromise.cancel();
                        that.refreshNextDocPromise = null;
                    }
                    Log.ret(Log.l.trace);
                }
                this.cancelPromises = cancelPromises;

                this.dispose = function () {
                    that.cancelPromises();
                    ContactList._prevJson = null;
                    ContactList._collator = null;
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
                that.loadDataDelayedPromise = null;

                var maxLeadingPages = 0;
                var maxTrailingPages = 0;

                var imgSrcDataType = "data:image/jpeg;base64,";

                var setEventId = function (value) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.", "eventId=" + value);
                    ContactList._eventId = value;
                    that.binding.eventId = value;
                    AppData.setRecordId("Veranstaltung2", that.binding.eventId);
                    Log.ret(Log.l.trace);
                }
                this.setEventId = setEventId;

                var setSelIndex = function (index) {
                    Log.call(Log.l.trace, "GenDataEmpList.Controller.", "index=" + index);
                    if (that.contacts && that.contacts.length > 0) {
                        if (index >= that.contacts.length) {
                            index = that.contacts.length - 1;
                        }
                        that.binding.selIdx = index;
                        listView.winControl.selection.set(index);
                    }
                    Log.ret(Log.l.trace);
                }
                this.setSelIndex = setSelIndex;

                var loadDataDelayed = function (searchString) {
                    if (that.loadDataDelayedPromise) {
                        that.loadDataDelayedPromise.cancel();
                        that.removeDisposablePromise(that.loadDataDelayedPromise);
                    }
                    that.loadDataDelayedPromise = WinJS.Promise.timeout(450).then(function () {
                        that.loadData(searchString);
                    });
                    that.addDisposablePromise(that.loadDataDelayedPromise);
                }
                this.loadDataDelayed = loadDataDelayed;

                var handlePageEnable = function (contact) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + (contact && contact.KontaktVIEWID));
                    if (AppData._persistentStates.hideQuestionnaire) {
                        NavigationBar.disablePage("questionnaire");
                    } else if (contact && contact.SHOW_Zeilenantwort) {
                        NavigationBar.enablePage("questionnaire");
                    } else {
                        NavigationBar.disablePage("questionnaire");
                    }
                    if (contact && contact.SHOW_KontaktNotiz) {
                        NavigationBar.enablePage("sketch");
                    } else {
                        NavigationBar.disablePage("sketch");
                    }
                    Log.ret(Log.l.trace);
                };

                var getRestriction = function () {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var restriction = AppData.getRestriction("Kontakt");
                    if (that.binding.searchString) {
                        restriction = that.binding.searchString;
                    }
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
                    Log.ret(Log.l.trace);
                    return restriction;
                }
                this.getRestriction = getRestriction;

                var loadNextUrl = function (recordId) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                    if (that.contacts && that.nextUrl && listView) {
                        AppBar.busy = true;
                        that.binding.loading = true;
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "calling select ContactList.contactView...");
                        var nextUrl = that.nextUrl;
                        that.nextUrl = null;
                        that.refreshNextPromise = ContactList.contactView.selectNext(function (json) { //json is undefined
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "ContactList.contactView: success!");
                            // startContact returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length > 0 && that.contacts) {
                                that.nextUrl = ContactList.contactView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, that.binding.count);
                                    that.binding.count = that.contacts.push(item);
                                });
                            } else {
                                that.binding.loading = false;
                            }
                            AppBar.busy = false;
                            if (that.nextDocUrl) {
                                that.refreshNextDocPromise = WinJS.Promise.timeout(250).then(function () {
                                    Log.print(Log.l.trace, "calling select ContactList.contactDocView...");
                                    var nextDocUrl = that.nextDocUrl;
                                    that.nextDocUrl = null;
                                    ContactList.contactDocView.selectNext(function (jsonDoc) {
                                        // this callback will be called asynchronously
                                        // when the response is available
                                        Log.print(Log.l.trace, "ContactList.contactDocView: success!");
                                        // startContact returns object already parsed from json file in response
                                        if (jsonDoc && jsonDoc.d) {
                                            that.nextDocUrl = ContactList.contactDocView.getNextUrl(jsonDoc);
                                            var resultsDoc = jsonDoc.d.results;
                                            resultsDoc.forEach(function (item, index) {
                                                that.resultDocConverter(item, that.binding.doccount);
                                                that.binding.doccount = that.docs.push(item);
                                            });
                                        }
                                    }, function (errorResponse) {
                                        // called asynchronously if an error occurs
                                        // or server returns response with an error status.
                                        Log.print(Log.l.error, "ContactList.contactDocView: error!");
                                        AppData.setErrorMsg(that.binding, errorResponse);
                                    }, null, nextDocUrl);
                                });
                            }
                            if (recordId) {
                                that.selectRecordId(recordId);
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "ContactList.contactView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                            AppBar.busy = false;
                            that.binding.loading = false;
                        }, null, nextUrl);
                    }
                    Log.ret(Log.l.trace);
                    return that.refreshNextPromise;
                }
                this.loadNextUrl = loadNextUrl;

                var scopeFromRecordId = function (recordId) {
                    var i;
                    Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                    if (that.binding.loading ||
                        listView && listView.winControl && listView.winControl.loadingState !== "complete") {
                        WinJS.Promise.timeout(50).then(function () {
                            that.scrollToRecordId(recordId);
                        });
                    } else {
                        if (listView && listView.winControl) {
                            var scope = that.scopeFromRecordId(recordId);
                            if (scope && scope.index >= 0) {
                                listView && listView.winControl.ensureVisible(scope.index);
                                WinJS.Promise.timeout(50).then(function () {
                                    var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                    var elementOfFirstVisible = listView.winControl.elementFromIndex(indexOfFirstVisible);
                                    var element = listView.winControl.elementFromIndex(scope.index);
                                    var height = listView.clientHeight;
                                    if (element && elementOfFirstVisible) {
                                        var offsetDiff = element.offsetTop - elementOfFirstVisible.offsetTop;
                                        if (offsetDiff > height - element.clientHeight) {
                                            listView.winControl.scrollPosition += offsetDiff - (height - element.clientHeight);
                                        } else if (offsetDiff < 0) {
                                            listView.winControl.indexOfFirstVisible = scope.index;
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.scrollToRecordId = scrollToRecordId;

                var selectRecordId = function (recordId) {
                    var contact;
                    Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                    var recordIdNotFound = true;
                    if (recordId && listView && listView.winControl && listView.winControl.selection && that.contacts) {
                        for (var i = 0; i < that.contacts.length; i++) {
                            contact = that.contacts.getAt(i);
                            if (contact && typeof contact === "object" && contact.KontaktVIEWID === recordId) {
                                AppData.setRecordId("Kontakt", recordId);
                                listView.winControl.selection.set(i);
                                that.scrollToRecordId(recordId);
                                recordIdNotFound = false;
                                handlePageEnable(contact);
                                break;
                            }
                        }
                        if (recordIdNotFound && that.nextUrl) {
                            that.loadNextUrl(recordId);
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.selectRecordId = selectRecordId;

                var resultConverter = function (item, index, prevOvwContentDOCCNT3) {
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
                    item.nameInitial = (item.Vorname && item.Name)
                        ? item.Vorname.substr(0, 1) + item.Name.substr(0, 1)
                        : (item.Vorname ? item.Vorname.substr(0, 2) : item.Name ? item.Name.substr(0, 2) : "");
                    item.nameInitialBkgColor = Colors.getColorFromNameInitial(item.nameInitial);
                    item.company = ((item.Firmenname ? (item.Firmenname + " ") : ""));
                    item.fullName = ((item.Title ? (item.Title + " ") : "") +
                        (item.Vorname ? (item.Vorname + " ") : "") + (item.Name ? item.Name : ""));
                    /*item.address =
                        ((item.Strasse ? (item.Strasse + "\r\n") : "") +
                            ((item.PLZ || item.Stadt)
                                ? ((item.PLZ ? (item.PLZ + " ") : "") + (item.Stadt ? item.Stadt : "") + "\r\n")
                                : "") +
                            (item.Land ? (item.Land + "\r\n") : "") +
                            ((item.TelefonMobil)
                                ? (item.TelefonMobil + "\r\n")
                                : (item.TelefonFestnetz ? (item.TelefonFestnetz + "\r\n") : "") +
                                (item.EMail ? item.EMail : ""))) +
                        (item.Freitext1 ? "\r\n" + item.Freitext1 : "");*/
                    item.address = item.EMail;
                    item.globalContactId = item.CreatorSiteID + "/" + item.CreatorRecID;
                    item.mitarbeiterFullName = (item.Mitarbeiter_Vorname ? (item.Mitarbeiter_Vorname + " ") : "") +
                        (item.Mitarbeiter_Nachname ? item.Mitarbeiter_Nachname : "");
                    if (prevOvwContentDOCCNT3) {
                        item.OvwContentDOCCNT3 = prevOvwContentDOCCNT3;
                    } else {
                        item.OvwContentDOCCNT3 = "";
                        if (that.docs && index >= that.firstContactsIndex) {
                            for (var i = that.firstDocsIndex; i < that.binding.doccount; i++) {
                                var doc = that.docs[i];
                                if (doc.KontaktVIEWID === item.KontaktVIEWID) {
                                    var docContent = doc.OvwContentDOCCNT3;
                                    if (docContent) {
                                        var sub = docContent.search("\r\n\r\n");
                                        if (sub >= 0) {
                                            var data = docContent.substr(sub + 4);
                                            if (data && data !== "null") {
                                                item.OvwContentDOCCNT3 = imgSrcDataType + data;
                                            } else {
                                                item.OvwContentDOCCNT3 = "";
                                            }
                                        } else {
                                            item.OvwContentDOCCNT3 = "";
                                        }
                                    } else {
                                        item.OvwContentDOCCNT3 = "";
                                    }
                                    that.firstDocsIndex = i + 1;
                                    that.firstContactsIndex = index + 1;
                                    break;
                                }
                            }
                        }
                    }
                    item.showDoc = true;
                    if (item.SHOW_Barcode || item.IMPORT_CARDSCANID && !item.SHOW_Visitenkarte) {
                        item.svgSource = "barcode-qr"; //item.IMPORT_CARDSCANID ? "barcode-qr" : "barcode"
                    } else if (!item.SHOW_Barcode && item.IMPORT_CARDSCANID && item.SHOW_Visitenkarte) {
                        item.svgSource = "";
                    } else {
                        item.svgSource = "manuel_Portal";
                    }
                }
                this.resultConverter = resultConverter;

                var resultDocConverter = function (item, index) {
                    if (that.contacts && index >= that.firstDocsIndex) {
                        for (var i = that.firstContactsIndex; i < that.contacts.length; i++) {
                            var contact = that.contacts.getAt(i);
                            if (contact.KontaktVIEWID === item.KontaktVIEWID) {
                                var docContent = item.OvwContentDOCCNT3;
                                if (docContent) {
                                    var sub = docContent.search("\r\n\r\n");
                                    if (sub >= 0) {
                                        var data = docContent.substr(sub + 4);
                                        if (data && data !== "null") {
                                            contact.OvwContentDOCCNT3 = imgSrcDataType + data;
                                        } else {
                                            contact.OvwContentDOCCNT3 = "";
                                        }
                                    } else {
                                        contact.OvwContentDOCCNT3 = "";
                                    }
                                } else {
                                    contact.OvwContentDOCCNT3 = "";
                                }
                                contact.showDoc = (contact.IMPORT_CARDSCANID || contact.SHOW_Barcode) ? true : false;
                                if (contact.SHOW_Barcode || contact.IMPORT_CARDSCANID && !contact.SHOW_Visitenkarte) {
                                    contact.svgSource = "barcode-qr"; //contact.IMPORT_CARDSCANID ? "barcode-qr" : "barcode"
                                } else {
                                    contact.svgSource = "";
                                }
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

                var imageRotate = function (element) {
                    Log.call(Log.l.u1, namespaceName + ".Controller.");
                    if (element && typeof element.querySelector === "function") {
                        var img = element.querySelector(".list-compressed-doc");
                        if (img && img.src && img.src.substr(0, imgSrcDataType.length) === imgSrcDataType) {
                            var imgWidth = img.naturalWidth;
                            var imgHeight = img.naturalHeight;
                            Log.print(Log.l.trace, "img width=" + imgWidth + " height=" + imgHeight);
                            if (imgWidth && imgHeight) {
                                if (imgWidth < imgHeight && img.style) {
                                    var containerElement = img.parentNode;
                                    if (containerElement) {
                                        var marginLeft = (imgWidth - imgHeight) * containerElement.clientWidth / imgHeight / 2;
                                        var marginTop = (imgHeight - imgWidth) * containerElement.clientWidth / imgHeight / 2;
                                        img.style.marginLeft = -marginLeft + "px";
                                        img.style.marginTop = -marginTop + "px";
                                        img.style.height = containerElement.clientWidth + "px";
                                    }
                                    if (AppData._persistentStates.turnThumbsLeft) {
                                        img.style.transform = "rotate(270deg)";
                                    } else {
                                        img.style.transform = "rotate(90deg)";
                                    }
                                    img.style.width = "auto";
                                }
                            } else {
                                WinJS.Promise.timeout(0).then(function () {
                                    that.imageRotate(element);
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.u1);
                }
                this.imageRotate = imageRotate;

                // define handlers
                this.eventHandlers = {
                    clickBack: function (event) {
                        Log.call(Log.l.trace, namespaceName + ".Controller.");
                        if (WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    changeSearchField: function (event) {
                        Log.call(Log.l.trace, namespaceName + ".Controller.");
                        if (event && event.currentTarget) {
                            that.binding.searchString = event.currentTarget.value;
                            that.loadDataDelayed(that.binding.searchString);
                            //that.loadData(that.binding.searchString);
                        }
                        Log.ret(Log.l.trace);
                    },
                    changeEventId: function (parameters) {
                        Log.call(Log.l.trace, namespaceName + ".Controller.");
                        if (event && event.currentTarget) {
                            that.setEventId(parseInt(event.currentTarget.value));
                            var restriction = AppData.getRestriction("Kontakt");
                            if (typeof restriction === "object") {
                                //always reset contact restriction when VeranstaltungID changed
                                if (restriction && restriction.VeranstaltungID !== AppData.getRecordId("Veranstaltung2")) {
                                    AppData.setRestriction("Kontakt", copyMissingMembersByValue({}, { VeranstaltungID: AppData.getRecordId("Veranstaltung2")}));
                                }
                            }
                            that.loadData();
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickOrderBy: function (event) {
                        Log.call(Log.l.trace, namespaceName + ".Controller.");
                        if (event && event.currentTarget) {
                            var newOrderAttribute = null;
                            if (event.currentTarget.id === "btnDateSort") {
                                newOrderAttribute = "Erfassungsdatum";
                                that.binding.btnCompanySort = getResourceText("contactList.btnCompanySort");
                                that.binding.btnNameSort = getResourceText("contactList.btnNameSort");
                            }
                            if (event.currentTarget.id === "btnCompanySort") {
                                newOrderAttribute = "Firmenname";
                                that.binding.btnDateSort = getResourceText("contactList.btnDateSort");
                                that.binding.btnNameSort = getResourceText("contactList.btnNameSort");
                            }
                            if (event.currentTarget.id === "btnNameSort") {
                                newOrderAttribute = "Name";
                                that.binding.btnDateSort = getResourceText("contactList.btnDateSort");
                                that.binding.btnCompanySort = getResourceText("contactList.btnCompanySort");
                            }
                            if (newOrderAttribute !== ContactList._orderAttribute) {
                                // bei mehreren Button müsste hier der vorher ausgewählte auf "Default-Text gesetzt werden!
                                ContactList._orderAttribute = newOrderAttribute;
                                ContactList._orderDesc = true;
                            } else {
                                ContactList._orderDesc = !ContactList._orderDesc;
                            }
                            var newRscText = "contactList." +
                                event.currentTarget.id.replace("Sort", ContactList._orderDesc ? "Desc" : "Asc");
                            that.binding[event.currentTarget.id] = getResourceText(newRscText);
                            that.loadData();
                        }
                        Log.ret(Log.l.trace);
                    },
                    onSelectionChanged: function (eventInfo) {
                        Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                                                    if (curPageId === "contactResultsEdit" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData();
                                                    }
                                                    else if (curPageId === "contact" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData();
                                                    } else if (curPageId === "contactResultsQuestion" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData();
                                                    } else if (curPageId === "contactResultsAttach" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData();
                                                    } else if (curPageId === "contactResultsCriteria" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData();
                                                    } else if (curPageId === "contactResultsEvents" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData();
                                                    } else {
                                                        Application.navigateById("contact");
                                                    }
                                                }, function (errorResponse) {
                                                    if (that.binding.contactId) {
                                                        that.selectRecordId(that.binding.contactId);
                                                    }
                                                });
                                            } else {
                                                // current detail view has NO saveData() function - is list
                                                that.binding.contactId = item.data.KontaktVIEWID;
                                                AppData.setRecordId("Kontakt", that.binding.contactId);
                                                handlePageEnable(item.data);
                                                if (curPageId === "contactResultsQuestion" &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData();
                                                } else if (curPageId === "contact" &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData();
                                                } else if (curPageId === "contact" &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData();
                                                } else if (curPageId === "contactResultsCriteria" &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData();
                                                } else if (curPageId === "contactResultsEvents" &&
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
                        Log.call(Log.l.trace, namespaceName + ".Controller.");
                        Application.showDetail();
                        Log.ret(Log.l.trace);
                    },
                    onLoadingStateChanged: function (eventInfo) {
                        var i;
                        Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                                    layout = Application.ContactListLayout.ContactListLayout;
                                    listView.winControl.layout = { type: layout };
                                }
                            } else if (listView.winControl.loadingState === "itemsLoaded") {
                                var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                                for (i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                    var element = listView.winControl.elementFromIndex(i);
                                    if (element) {
                                        var img = element.querySelector(".list-compressed-doc");
                                        if (img && img.src) {
                                            that.imageRotate(element);
                                        }
                                    }
                                }
                                that.fitColumnWidthToContent();
                                //set list-order column
                                var headerListFields = listView.querySelectorAll(".list-header-columns > div");
                                if (headerListFields) for (i = 0; i < headerListFields.length; i++) {
                                    if (headerListFields[i].id === ContactList._orderAttribute) {
                                        if (ContactList._orderDesc) {
                                            WinJS.Utilities.removeClass(headerListFields[i], "order-asc");
                                            WinJS.Utilities.addClass(headerListFields[i], "order-desc");
                                        } else {
                                            WinJS.Utilities.addClass(headerListFields[i], "order-asc");
                                            WinJS.Utilities.removeClass(headerListFields[i], "order-desc");
                                        }
                                    } else {
                                        WinJS.Utilities.removeClass(headerListFields[i], "order-asc");
                                        WinJS.Utilities.removeClass(headerListFields[i], "order-desc");
                                    }
                                }
                                // load SVG images
                                Colors.loadSVGImageElements(listView, "action-image-right", 40, Colors.textColor, "name", null, {
                                    "barcode-qr": { useStrokeColor: false }
                                });
                            } else if (listView.winControl.loadingState === "complete") {
                                that.checkLoadingFinished();
                            }
                        }
                        Log.ret(Log.l.trace);
                    },
                    onFooterVisibilityChanged: function (eventInfo) {
                        Log.call(Log.l.trace, namespaceName + ".Controller.");
                        if (listView) {
                            var visible = eventInfo.detail.visible;
                            if (visible && that.nextUrl) {
                                that.loadNextUrl();
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
                if (searchField) {
                    this.addRemovableEventListener(searchField, "input", this.eventHandlers.changeSearchField.bind(this));
                }
                if (eventsDropdown) {
                    this.addRemovableEventListener(eventsDropdown, "change", this.eventHandlers.changeEventId.bind(this));
                }
                if (btnDateSort) {
                    this.addRemovableEventListener(btnDateSort, "click", this.eventHandlers.clickOrderBy.bind(this));
                }
                if (btnCompanySort) {
                    this.addRemovableEventListener(btnCompanySort, "click", this.eventHandlers.clickOrderBy.bind(this));
                }
                if (btnNameSort) {
                    this.addRemovableEventListener(btnNameSort, "click", this.eventHandlers.clickOrderBy.bind(this));
                }

                var loadData = function (recordId) {
                    Log.call(Log.l.info, namespaceName + ".Controller.", "recordId=" + recordId);
                    if (!recordId) {
                        if (that.events && AppData.initLandView.getResults().length) {
                            that.cancelPromises();
                            that.firstDocsIndex = 0;
                            that.firstContactsIndex = 0;
                            that.binding.doccount = 0;
                            that.nextDocUrl = null;
                        }
                        AppBar.busy = true;
                        that.binding.loading = true;
                    }
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        if (!(AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents)) {
                            that.binding.showEventCombo = false;
                            return WinJS.Promise.as();
                        } else {
                            if (!that.events) {
                                return ContactList.eventView.select(function (json) {
                                    // this callback will be called asynchronously
                                    // when the response is available
                                    Log.print(Log.l.trace, "eventView: success!");
                                    // eventView returns object already parsed from json file in response
                                    if (json && json.d && json.d.results.length > 0) {
                                        if (json.d.results.length <= 1) {
                                            that.binding.showEventCombo = false;
                                        } else {
                                            var results = json.d.results;
                                            that.events = new WinJS.Binding.List(results);
                                            if (eventsDropdown && eventsDropdown.winControl) {
                                                eventsDropdown.winControl.data = that.events;
                                                if (that.binding.eventId) {
                                                    for (var i = 0; i < results.length; i++) {
                                                        if (that.binding.eventId === results[i].VeranstaltungVIEWID) {
                                                            eventsDropdown.selectedIndex = i;
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    eventsDropdown.selectedIndex = 0;
                                                }
                                            }
                                            that.binding.showEventCombo = true;
                                        }
                                    } else {
                                        that.binding.showEventCombo = false;
                                    }
                                }, function (errorResponse) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                });
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    }).then(function () {
                        if (!AppData.initLandView.getResults().length) {
                            Log.print(Log.l.trace, "calling select initLandData...");
                            //@nedra:25.09.2015: load the list of INITLand for Combobox
                            return AppData.initLandView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "initLandView: success!");
                            }, function (errorResponse) {
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
                            Log.print(Log.l.info, "contactView: success!");
                            // startContact returns object already parsed from json file in response
                            if (!recordId) {
                                that.firstDocsIndex = 0;
                                that.firstContactsIndex = 0;
                                that.binding.doccount = 0;
                                that.nextDocUrl = null;
                                if (json && json.d && json.d.results.length > 0) {
                                    that.binding.count = json.d.results.length;
                                    that.nextUrl = ContactList.contactView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    that.contacts = new WinJS.Binding.List(results);
                                    if (listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.contacts.dataSource;
                                    }
                                    if (AppData.getRecordId("Kontakt")) {
                                        that.binding.contactId = AppData.getRecordId("Kontakt");
                                    }

                                } else {
                                    that.binding.count = 0;
                                    that.nextUrl = null;
                                    that.contacts = null;
                                    if (listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = null;
                                    }
                                    that.binding.loading = false;
                                }
                                AppBar.busy = false;
                            } else {
                                if (json && json.d) {
                                    var contact = json.d;
                                    var objectrec = scopeFromRecordId(recordId);
                                    if (objectrec && objectrec.index >= 0) {
                                        var firstContactsIndex = that.firstContactsIndex;
                                        that.firstContactsIndex = that.contacts.length;
                                        that.resultConverter(contact, objectrec.index, objectrec.item && objectrec.item.OvwContentDOCCNT3);
                                        that.firstContactsIndex = firstContactsIndex;
                                        that.contacts.setAt(objectrec.index, contact);
                                    } else {
                                        that.loadData();
                                    }
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            AppBar.busy = false;
                            that.binding.loading = false;
                        }, recordId || getRestriction());
                    }).then(function () {
                        if (!ContactList._eventId) {
                            that.binding.noctcount = 0;
                            that.binding.noeccount = 0;
                            that.binding.nouccount = 0;
                            return WinJS.Promise.as();
                        } else {
                            return ContactList.veranstaltungView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "veranstaltungView: success!");
                                // startContact returns object already parsed from json file in response
                                if (json && json.d && json.d.results && json.d.results.length > 0) {
                                    var results = json.d.results[0];
                                    that.binding.noctcount = results.AnzKontakte;
                                    that.binding.noeccount = results.AnzEditierteKontakte;
                                    that.binding.nouccount = results.AnzNichtEditierteKontakte;
                                } else {
                                    that.binding.noctcount = 0;
                                    that.binding.noeccount = 0;
                                    that.binding.nouccount = 0;
                                    Log.print(Log.l.trace, "veranstaltungView: no data found!");
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                Log.print(Log.l.error, "ContactList.veranstaltungView: error!");
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        }
                    }).then(function () {
                        if (!recordId) {
                            that.refreshDocPromise = WinJS.Promise.timeout(250).then(function () {
                                return ContactList.contactDocView.select(function (json) {
                                    // this callback will be called asynchronously
                                    // when the response is available
                                    Log.print(Log.l.trace, "contactDocView: success!");
                                    // startContact returns object already parsed from json file in response
                                    if (json && json.d && json.d.results && json.d.results.length) {
                                        that.binding.doccount = json.d.results.length;
                                        that.nextDocUrl = ContactList.contactDocView.getNextUrl(json);
                                        var results = json.d.results;
                                        results.forEach(function (item, index) {
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
                                }, getRestriction());
                            });
                        }
                    }).then(function () {
                        if (that.binding.contactId) {
                            that.selectRecordId(that.binding.contactId);
                        }
                    });
                    if (!recordId) {
                        that.refreshPromise = ret;
                    }
                    Log.ret(Log.l.info);
                    return ret;
                };
                this.loadData = loadData;

                var removeSelectedRow = function () {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var listControl = listView && listView.winControl;
                    if (listControl &&
                        listControl.currentItem &&
                        listControl.currentItem.index >= 0) {
                        if (that.contacts.length > 1) {
                            var index = listView.winControl.currentItem.index;
                            var nextItem;
                            var nextIndex;
                            if (index > 0) {
                                nextIndex = index - 1;
                                nextItem = that.contacts.getAt(nextIndex);
                            } else {
                                nextItem = that.contacts.getAt(index + 1);
                                nextIndex = 0;
                            }
                            var nextRecordId;
                            if (nextItem) {
                                nextRecordId = nextItem.KontaktVIEWID;
                            } else {
                                nextRecordId = 0;
                            }
                            that.contacts.splice(index, 1);
                            that.selectRecordId(nextRecordId);
                        } else {
                            that.contacts.length = 0;
                            AppData.setRecordId("Kontakt", 0);
                            handlePageEnable(null);
                            // "leeren" Kontakt laden
                            AppBar.scope.loadData();
                            // Liste neu laden bei leer
                            that.loadData();
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.removeSelectedRow = removeSelectedRow;

                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    var restriction = AppData.getRestriction("Kontakt");
                    if (restriction && restriction.VeranstaltungID) {
                        return that.setEventId(restriction.VeranstaltungID);
                    } else if (AppData.getRecordId("Veranstaltung2")) {
                        return that.setEventId(AppData.getRecordId("Veranstaltung2"));
                    } else {
                        return that.setEventId(AppData.getRecordId("Veranstaltung"));
                    }
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.loadData();
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    AppBar.notifyModified = true;
                });
                Log.ret(Log.l.trace);
            }, {
                    nextUrl: null,
                    loading: false,
                    contact: null
                })
        });
})();
