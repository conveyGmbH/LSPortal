// controller for page: start
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/startPremium/startPremiumService.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.de.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.en.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />
/// <reference path="~/www/lib/jspdf/jspdf.min.js"/>
/// <reference path="~/www/lib"/>

/*
 Structure of states to be set from external modules:
 {
    networkState: newNetworkstate:
 }
*/

(function () {
    "use strict";

    WinJS.Namespace.define("StartPremium", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Start.Controller.");
            Application.Controller.apply(this, [pageElement, {
                noLicence: getResourceText("info.nolicence"),
                disableEditEvent: NavigationBar.isPageDisabled("event"),
                comment: getResourceText("info.comment"),
                dataLicence: null,
                countContacts: true,
                dataLicenceUser: getEmptyDefaultValue(StartPremium.licenceUserView.defaultValue),
                // add dynamic scripts to page element, src is either a file or inline text:
            }, commandList]);
            this.applist = null;
            this.nextUrl = null;

            var that = this;
            this.isSupreme = parseInt(AppData._persistentStates.showdashboardMesagoCombo); /*AppData._userData.IsSupreme*/

            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var listView = pageElement.querySelector("#dataLicenceUserList.listview");
            var exportPdfBtn = pageElement.querySelector("#btn-vis");

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
            }
            this.setRestriction = setRestriction;

            var resultConverter = function (item, index) {
                item.index = index;
                item.buttonColor = Colors.tileBackgroundColor;
                item.buttonTitle = Colors.tileTextColor;
            }
            this.resultConverter = resultConverter;

            // define data handling standard methods
            var getRecordId = function () {
                return AppData.getRecordId("Mitarbeiter");
            };
            this.getRecordId = getRecordId;

            var loadData = function () {
                Log.call(Log.l.trace, "Start.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var startContactsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaCountrys"));
                    if (startContactsFragmentControl && startContactsFragmentControl.controller) {
                        return startContactsFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startContactshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaCountrys", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startCountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaYearRange"));
                    if (startCountrysFragmentControl && startCountrysFragmentControl.controller) {
                        return startCountrysFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startCountryshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaYearRange", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startQuestionsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaVisitors"));
                    if (startQuestionsFragmentControl && startQuestionsFragmentControl.controller) {
                        return startQuestionsFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startQuestionshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaVisitors", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startContactspDFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaCountrysIndustries"));
                    if (startContactspDFragmentControl && startContactspDFragmentControl.controller) {
                        return startContactspDFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startContactspDhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaCountrysIndustries", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var startContactspDFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaIndustries"));
                    if (startContactspDFragmentControl && startContactspDFragmentControl.controller) {
                        return startContactspDFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#startPremiumdiaIndustrieshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaIndustries", {});
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
                            that.binding.dataLicence.UserListe = that.binding.dataLicence.UserListe.replace(/,/gi, " ");
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
                exportPdf: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var element = document.getElementById("tiles-container");
                    //element.style.transform = "transform";
                    var ret = new WinJS.Promise.as().then(function () {
                        var doc = new jsPDF("landscape", "mm", 'a3');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;
                        html2canvas(element, { dpi: 300}).then(canvas => {
                            var img = canvas.toDataURL(); //image data of canvas
                            var base64result = img.split(',')[1];
                            return img; /*Colors.resizeImageBase64(base64result, "image/png", 0, 0, 1.25);*/
                        }).then(function (rezizedData) {
                            var data = "data:image/png;base64," + rezizedData;
                            doc.addImage(rezizedData, 0, 0, width, height);
                            doc.save('DashboardOverview_300dpi.pdf');
                        }); 
                    })/*.then(function() {
                        var countryChart = document.getElementById("countryChart");
                        var imgData = countryChart.toDataURL();
                        var pdf = new jsPDF("landscape");
                        pdf.addImage(imgData, 'image/png', 0, 0);
                        pdf.save("download.pdf");
                    })*/;
                    /*html2pdf(element, {
                        margin: 1,
                        filename: 'myfile.pdf',
                        image: { type: 'jpeg', quality: 1 },
                        html2canvas: { scale: 2, logging: true },
                        jsPDF: { unit: 'in', format: 'a4', orientation: 'l' }
                    });*/
                    /*html2canvas(document.getElementById("startContactspDhost"), {
                        onrendered: function (canvas) {
                            var img = canvas.toDataURL(); //image data of canvas
                            var doc = new jsPDF("landscape");
                            doc.addImage(img, 0, 0);
                            doc.save('startContactspDhostNoQuality.pdf');
                        }
                    });*/
                    /*html2canvas(document.getElementById("startContactshost"), {
                        quality: 4,
                        scale: 5,
                        onrendered: function (canvas) {
                            var img = canvas.toDataURL(); //image data of canvas
                            var doc = new jsPDF("landscape");
                            doc.addImage(img, 0, 0);
                            doc.save('startContactshost.pdf');
                        }
                    });
                    html2canvas(document.getElementById("startCountryshost"), {
                        quality: 4,
                        scale: 5,
                        onrendered: function (canvas) {
                            var img = canvas.toDataURL(); //image data of canvas
                            var doc = new jsPDF("landscape");
                            doc.addImage(img, 0, 0);
                            doc.save('startCountryshost.pdf');
                        }
                    });
                    html2canvas(document.getElementById("startQuestionshost"), {
                        quality: 4,
                        scale: 5,
                        onrendered: function (canvas) {
                            var img = canvas.toDataURL(); //image data of canvas
                            var doc = new jsPDF("landscape");
                            doc.addImage(img, 0, 0);
                            doc.save('startQuestionshost.pdf');
                        }
                    });
                    html2canvas(document.getElementById("startPremiumdiaIndustrieshost"), {
                        quality: 4,
                        scale: 5,
                        onrendered: function (canvas) {
                            var img = canvas.toDataURL(); //image data of canvas
                            var doc = new jsPDF("landscape");
                            doc.addImage(img, 0, 0);
                            doc.save('startPremiumdiaIndustrieshost.pdf');
                        }
                    });*/
                    Log.ret(Log.l.trace);

                },
                clickListBusinessCardContacts: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    that.setRestriction({
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

            var checkIfSurpreme = function () {
                if (that.isSupreme === 2) {
                    var fieldLineFull = pageElement.querySelector(".field_line_full");
                    //fieldLineFull.className = "field_line field_line_full_double";
                    var fieldLineFullInner = pageElement.querySelector("#startPremiumdiaIndustrieshost");
                    //fieldLineFullInner.style.height = "580px";
                } else {
                    // getfragment of diaIndustriesController and set binding for display
                }
            }
            this.checkIfSurpreme = checkIfSurpreme;

            var checkTip = function () {
                if (that.isSupreme === 2) {
                    var event = pageElement.querySelector(".circle-with-text-event-dot");
                    event.style.backgroundColor = Colors.dashboardColor;
                    var surpremeColor = "#cc5b87";
                    var global = pageElement.querySelector(".circle-with-text-global-dot");
                    global.style.backgroundColor = surpremeColor;
                    var eventText = pageElement.querySelector(".circle-with-text-event-text");
                    eventText.style.color = Colors.labelColor;
                    var globalText = pageElement.querySelector(".circle-with-text-global-text");
                    globalText.style.color = Colors.labelColor;
                } else {
                    var tip = pageElement.querySelector(".tip-container"); /*.tip*/
                    tip.style.display = "none";
                }
            }
            this.checkTip = checkTip;

            // finally, load the data
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.checkIfSurpreme();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.checkTip();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function() {
                Log.print(Log.l.trace, "Data loaded");
            })/*.then(function () {
                WinJS.Promise.timeout(50).then(function () {
                    if (AppHeader.controller.binding.userData.IsNoAdminUser) {
                        var confirmTitle = getResourceText("start.confirmIsAppUser");
                        alert(confirmTitle);
                    }
                });
                Log.print(Log.l.trace, "IsAppUser: alertbox");
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return WinJS.Promise.timeout(Application.pageframe.splashScreenDone ? 0 : 1000);
            }).then(function () {
                Log.print(Log.l.trace, "Splash time over");
                return Application.pageframe.hideSplashScreen();
            }).then(function () {
                WinJS.Promise.timeout(50).then(function () {
                    if (that.binding.generalData.publishFlag) {
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
            }).then(function() {
                WinJS.Promise.timeout(50).then(function () {
                    if (AppHeader.controller.binding.userData.IsNoAdminUser) {
                        var confirmTitle = getResourceText("start.confirmIsAppUser");
                        confirm(confirmTitle, function (result) {
                            if (result) {

                            } else {
                                Log.print(Log.l.trace, "IsAppUser: user choice CANCEL");
                            }
            });
                    }
                });
            Log.print(Log.l.trace, "Splash screen vanished");
        })*/;
            Log.ret(Log.l.trace);
        })
    });
})();







