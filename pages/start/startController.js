// controller for page: start
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/start/startService.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.de.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.en.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />

/*
 Structure of states to be set from external modules:
 {
    networkState: newNetworkstate:
 }
*/

(function () {
    "use strict";

    WinJS.Namespace.define("Start", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Start.Controller.");
            Application.Controller.apply(this, [pageElement, {
                noLicence: getResourceText("info.nolicence"),
                disableEditEvent: NavigationBar.isPageDisabled("event"),
                comment: getResourceText("info.comment"),
                dataLicence: null,
                countContacts: true,
                dataLicenceUser: getEmptyDefaultValue(Start.licenceUserView.defaultValue),
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com"
                // add dynamic scripts to page element, src is either a file or inline text:
            }, commandList]);
            this.applist = null;
            this.nextUrl = null;

            var that = this;

            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var listView = pageElement.querySelector("#dataLicenceUserList.listview");

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.kontaktanzahldata) {
                    that.kontaktanzahldata = null;
                }
                if (that.applist) {
                    that.applist = null;
                }
            }
            var setRestriction = function (restriction) {
                AppData.setRestriction("Kontakt", restriction);
            };
            this.setRestriction = setRestriction;

            var getEventId = function () {
                var eventId = null;
                Log.call(Log.l.trace, "Start.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller) {
                    eventId = master.controller.binding.eventId;
                } else {
                    eventId = AppData.getRecordId("Veranstaltung");
                }
                Log.ret(Log.l.trace, eventId);
                return eventId;
            }
            this.getEventId = getEventId;

            var resultConverter = function (item, index) {
                item.index = index;
                item.buttonColor = Colors.tileBackgroundColor;
                item.buttonTitle = Colors.tileTextColor;
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "Start.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var startContactsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startContacts"));
                    if (startContactsFragmentControl && startContactsFragmentControl.controller) {
                        return startContactsFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startContactshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "startContacts", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startCountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startCountrys"));
                    if (startCountrysFragmentControl && startCountrysFragmentControl.controller) {
                        return startCountrysFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startCountryshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "startCountrys", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startQuestionsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startQuestions"));
                    if (startQuestionsFragmentControl && startQuestionsFragmentControl.controller) {
                        return startQuestionsFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startQuestionshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "startQuestions", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startContactspDFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startContactspD"));
                    if (startContactspDFragmentControl && startContactspDFragmentControl.controller) {
                        return startContactspDFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startContactspDhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "startContactspD", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startTop10CountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startTop10Countrys"));
                    if (startTop10CountrysFragmentControl && startTop10CountrysFragmentControl.controller) {
                        return startTop10CountrysFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startTop10Countryshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "startTop10Countrys", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startTop10UsersFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startTop10Users"));
                    if (startTop10UsersFragmentControl && startTop10UsersFragmentControl.controller) {
                        return startTop10UsersFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startTop10Usershost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "startTop10Users", {});
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
                    return Start.licenceView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "licenceView: success!");
                        // kontaktanzahlView returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            that.binding.dataLicence = json.d.results[0];
                            if (that.binding.dataLicence.UserListe) {
                                that.binding.dataLicence.UserListe = that.binding.dataLicence.UserListe.replace(/,/gi, " ");
                            }
                        }
                        return WinJS.Promise.as();
                    },
                        function (errorResponse) {
                            that.userLicence = null;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        });
                }).then(function () {
                    return Start.licenceUserView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "licenceView: success!");

                        // licenceUserView returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            that.nextUrl = Start.licenceUserView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.dataLicenceUser = new WinJS.Binding.List(results);
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.dataLicenceUser.dataSource;
                            }
                        } else {
                            var tilebottum = pageElement.querySelector(".tile-bottom");
                            tilebottum.style.minHeight = "0px";
                            tilebottum.style.height = "96px";
                            that.nextUrl = null;
                            that.dataLicenceUser = null;
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                        }
                        return WinJS.Promise.as();
                    },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        },
                        {
                            LizenzFlag: 1
                        });
                }).then(function () {
                    Log.print(Log.l.trace, "Start.Controller. getUserData");
                    AppData.getUserData();
                    Log.ret(Log.l.trace);
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickEditEvent: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var command = event.currentTarget;
                    if (command) {
                        Log.print(Log.l.trace, "clickButton event command.name=" + command.name);
                        Application.navigateById(command.id, event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    Application.navigateById("account", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
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
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Skills.Controller.");
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
                                layout = Application.StartLayout.StartLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {

                            that.addScrollIntoViewCheckForInputElements(listView);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EmpList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.dataLicenceUser && that.nextUrl) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "calling select Start.licenceUserView...");
                            var nextUrl = that.nextUrl;
                            that.nextUrl = null;
                            Start.licenceUserView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Start.licenceUserView: success!");
                                // employeeView returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.nextUrl = Start.licenceUserView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                        that.binding.count = that.dataLicenceUser.push(item);
                                    });
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                that.loading = false;
                            }, null, nextUrl);
                        } else {
                            that.loading = false;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickLicenceUser: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    AppData.setRecordId("MitarbeiterVIEW_20471", event.currentTarget.value);
                    Application.navigateById("employee", event);
                    Log.ret(Log.l.trace);
                },
                clickGoToNorthAmerica: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var startCountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startCountrys"));
                    if (startCountrysFragmentControl && startCountrysFragmentControl.controller) {
                        startCountrysFragmentControl.controller.goToNorthAmerica();
                    }
                    Log.ret(Log.l.trace);
                },
                clickGoToEurope: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var startCountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startCountrys"));
                    if (startCountrysFragmentControl && startCountrysFragmentControl.controller) {
                        startCountrysFragmentControl.controller.goToEurope();
                    }
                    Log.ret(Log.l.trace);
                },
                clickGoToAfrica: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var startCountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startCountrys"));
                    if (startCountrysFragmentControl && startCountrysFragmentControl.controller) {
                        startCountrysFragmentControl.controller.goToAfrica();
                    }
                    Log.ret(Log.l.trace);
                },
                clickGoToAsia: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var startCountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startCountrys"));
                    if (startCountrysFragmentControl && startCountrysFragmentControl.controller) {
                        startCountrysFragmentControl.controller.goToAsia();
                    }
                    Log.ret(Log.l.trace);
                },
                clickGoToWorld: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var startCountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("startCountrys"));
                    if (startCountrysFragmentControl && startCountrysFragmentControl.controller) {
                        startCountrysFragmentControl.controller.goToWorld();
                    }
                    Log.ret(Log.l.trace);
                },
                clickListAllContacts: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    that.setRestriction({
                        VeranstaltungID: that.getEventId(),
                        SHOW_Barcode: null,
                        SHOW_Visitenkarte: null,
                        Nachbearbeitet: null
                    });
                    AppData.setRecordId("Kontakt", null);
                    WinJS.Promise.timeout(0).then(function () {
                        Application.navigateById("contact", event);
                    });
                    Log.ret(Log.l.trace);
                },
                clickListBusinessCardContacts: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    that.setRestriction({
                        VeranstaltungID: that.getEventId(),
                        SHOW_Barcode: null,
                        SHOW_Visitenkarte: 1
                    });
                    AppData.setRecordId("Kontakt", null);
                    WinJS.Promise.timeout(0).then(function () {
                        Application.navigateById("contact", event);
                    });
                    Log.ret(Log.l.trace);
                },
                clickListBusinessCardNotEditedContacts: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    that.setRestriction({
                        VeranstaltungID: that.getEventId(),
                        SHOW_Barcode: null,
                        SHOW_Visitenkarte: 1,
                        Nachbearbeitet: 1
                    });
                    AppData.setRecordId("Kontakt", null);
                    WinJS.Promise.timeout(0).then(function () {
                        Application.navigateById("contact", event);
                    });
                    Log.ret(Log.l.trace);
                },
                clickListBarcodeContacts: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    that.setRestriction({
                        VeranstaltungID: that.getEventId(),
                        SHOW_Barcode: 1,
                        SHOW_Visitenkarte: null
                    });
                    AppData.setRecordId("Kontakt", null);
                    WinJS.Promise.timeout(0).then(function () {
                        Application.navigateById("contact", event);
                    });
                    Log.ret(Log.l.trace);
                },
                clickListManuellContacts: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    that.setRestriction({
                        VeranstaltungID: that.getEventId(),
                        SHOW_Barcode: "NULL",
                        SHOW_Visitenkarte: "NULL"
                    });
                    AppData.setRecordId("Kontakt", null);
                    WinJS.Promise.timeout(0).then(function () {
                        Application.navigateById("contact", event);
                    });
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
                clickEditEvent: function () {
                    return that.binding.disableEditEvent;
                }
            };

            if (listView) {
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            // finally, load the data
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            })/*.then(function () {
                WinJS.Promise.timeout(50).then(function () {
                    if (AppHeader.controller.binding.userData.IsNoAdminUser) {
                        var confirmTitle = getResourceText("start.confirmIsAppUser");
                        alert(confirmTitle);
                    }
                });
                Log.print(Log.l.trace, "IsAppUser: alertbox");
            })*/.then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return WinJS.Promise.timeout(Application.pageframe.splashScreenDone ? 0 : 1000);
            }).then(function () {
                Log.print(Log.l.trace, "Splash time over");
                return Application.pageframe.hideSplashScreen();
            }).then(function () {
                WinJS.Promise.timeout(50).then(function () {
                    // prüfen ob auf mandantfähigkeit dieses Flag 
                    if (!AppHeader.controller.binding.userData.IsNoAdminUser && that.binding.generalData.publishFlag) {
                        var confirmTitle = getResourceText("start.confirmTextPublish");
                        confirm(confirmTitle, function (result) {
                            if (result) {
                                Application.navigateById("publish");
                            } else {
                                Log.print(Log.l.trace, "publishflag: user choice CANCEL");
                            }
                        });
                    }
                });
                Log.print(Log.l.trace, "Splash screen vanished");
            });
            Log.ret(Log.l.trace);
        })
    });
})();







