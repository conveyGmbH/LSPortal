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
                progress: {
                    percent: 0,
                    text: "",
                    show: null
                }
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
                    }
                    Log.ret(Log.l.trace);
                },
                exportAllChartsToPdf: function(event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    var percent = 0;
                    var statusText = "";
                    that.binding.progress = {
                        percent: percent,
                        text: statusText,
                        show: 1
                    };
                    var ret = new WinJS.Promise.as().then(function() {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        html2canvas(document.getElementById("startContactshost"),
                            {
                                scale: 1
                            }).then(canvas => { /*, { dpi: 300 }*/
                            var widthOfCanvas = canvas.width;
                            var heightOfCanvas = canvas.height;
                            var ratioCanvas = widthOfCanvas / heightOfCanvas;
                            var img = canvas.toDataURL(); //image data of canvas
                            //set the orientation
                            var doc;
                            if (widthOfCanvas > heightOfCanvas) {
                                doc = new jsPDF('l', 'px', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                            } else {
                                doc = new jsPDF('p', 'px', 'a4'); /*[heightOfCanvas, widthOfCanvas]*/
                            }
                            var widthOfPDF = doc.internal.pageSize.width;
                            var heightOfPDF = doc.internal.pageSize.height;
                            var ratioOfPDF = widthOfPDF / heightOfPDF;
                            doc.addImage(img, 'PNG', 0, 0, widthOfPDF, heightOfPDF);
                            doc.save('startContactshost.pdf');
                        });
                    }).then(function () {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        html2canvas(document.getElementById("startCountryshost"),
                            {
                                scale: 1
                            }).then(canvas => { /*, { dpi: 300 }*/
                            var widthOfCanvas = canvas.width;
                            var heightOfCanvas = canvas.height;
                            var ratioCanvas = widthOfCanvas / heightOfCanvas;
                            var img = canvas.toDataURL(); //image data of canvas
                            //set the orientation
                            var doc;
                            if (widthOfCanvas > heightOfCanvas) {
                                doc = new jsPDF('l', 'px', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                            } else {
                                doc = new jsPDF('p', 'px', 'a4'); /*[heightOfCanvas, widthOfCanvas]*/
                            }
                            var widthOfPDF = doc.internal.pageSize.width;
                            var heightOfPDF = doc.internal.pageSize.height;
                            var ratioOfPDF = widthOfPDF / heightOfPDF;
                            doc.addImage(img, 'PNG', 0, 0, widthOfPDF, heightOfPDF);
                            doc.save('startCountryshost.pdf');
                        });
                    }).then(function () {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        html2canvas(document.getElementById("startQuestionshost"),
                            {
                                scale: 1
                            }).then(canvas => { /*, { dpi: 300 }*/
                            var widthOfCanvas = canvas.width;
                            var heightOfCanvas = canvas.height;
                            var ratioCanvas = widthOfCanvas / heightOfCanvas;
                            var img = canvas.toDataURL(); //image data of canvas
                            //set the orientation
                            var doc;
                            if (widthOfCanvas > heightOfCanvas) {
                                doc = new jsPDF('l', 'px', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                            } else {
                                doc = new jsPDF('p', 'px', 'a4'); /*[heightOfCanvas, widthOfCanvas]*/
                            }
                            var widthOfPDF = doc.internal.pageSize.width;
                            var heightOfPDF = doc.internal.pageSize.height;
                            var ratioOfPDF = widthOfPDF / heightOfPDF;
                            doc.addImage(img, 'PNG', 0, 0, widthOfPDF, heightOfPDF);
                            doc.save('startQuestionshost.pdf');
                        });
                    }).then(function () {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        html2canvas(document.getElementById("startContactspDhost"),
                            {
                                scale: 1
                            }).then(canvas => { /*, { dpi: 300 }*/
                            var widthOfCanvas = canvas.width;
                            var heightOfCanvas = canvas.height;
                            var ratioCanvas = widthOfCanvas / heightOfCanvas;
                            var img = canvas.toDataURL(); //image data of canvas
                            //set the orientation
                            var doc;
                            if (widthOfCanvas > heightOfCanvas) {
                                doc = new jsPDF('l', 'px', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                            } else {
                                doc = new jsPDF('p', 'px', 'a4'); /*[heightOfCanvas, widthOfCanvas]*/
                            }
                            var widthOfPDF = doc.internal.pageSize.width;
                            var heightOfPDF = doc.internal.pageSize.height;
                            var ratioOfPDF = widthOfPDF / heightOfPDF;
                            doc.addImage(img, 'PNG', 0, 0, widthOfPDF, heightOfPDF);
                            doc.save('startContactspDhost.pdf');
                        });
                    }).then(function () {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        return html2canvas(document.getElementById("startPremiumdiaIndustrieshost"),
                            {
                                scale: 1
                            }).then(canvas => { /*, { dpi: 300 }*/
                            var widthOfCanvas = canvas.width;
                            var heightOfCanvas = canvas.height;
                            var ratioCanvas = widthOfCanvas / heightOfCanvas;
                            var img = canvas.toDataURL(); //image data of canvas
                            //set the orientation
                            var doc;
                            if (widthOfCanvas > heightOfCanvas) {
                                doc = new jsPDF('l', 'px', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                            } else {
                                doc = new jsPDF('p', 'px', 'a4'); /*[heightOfCanvas, widthOfCanvas]*/
                            }
                            var widthOfPDF = doc.internal.pageSize.width;
                            var heightOfPDF = doc.internal.pageSize.height;
                            var ratioOfPDF = widthOfPDF / heightOfPDF;
                            doc.addImage(img, 'PNG', 0, 0, widthOfPDF, heightOfPDF);
                                 doc.save('startPremiumdiaIndustrieshost.pdf', { returnPromise: true }).then(function () {
                                     that.binding.progress.show = null;
                                 });
                        });
                    });
                    Log.ret(Log.l.trace);
                },
                exportBrowserViewToPdf: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var percent = 0;
                    var statusText = "";
                    that.binding.progress = {
                        percent: percent,
                        text: statusText,
                        show: 1
                    };
                    var element = document.getElementById("tiles-container");/*tiles-container startContactshost*/
                    //element.style.transform = "transform";
                    var ret = new WinJS.Promise.as().then(function () {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        return html2canvas(element,
                            {
                            scale: 2
                        }).then(canvas => { /*, { dpi: 300 }*/
                                that.binding.progress = {
                                    percent: 25,
                                    text: statusText,
                                    show: 1
                                };
                            var widthOfCanvas = canvas.width;
                            var heightOfCanvas = canvas.height;
                            var ratioCanvas = widthOfCanvas / heightOfCanvas;
                            var img = canvas.toDataURL(); //image data of canvas
                            //set the orientation
                            var doc;
                            if (widthOfCanvas > heightOfCanvas) {
                                doc = new jsPDF('l', 'px', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                            } else {
                                doc = new jsPDF('p', 'px', 'a4'); /*[heightOfCanvas, widthOfCanvas]*/
                            }
                            var widthOfPDF = doc.internal.pageSize.width;
                            var heightOfPDF = doc.internal.pageSize.height;
                            var ratioOfPDF = widthOfPDF / heightOfPDF;
                                that.binding.progress = {
                                    percent: 75,
                                    text: statusText,
                                    show: 1
                                };
                            doc.addImage(img, 'PNG', 0, 0, widthOfPDF, heightOfPDF);
                                doc.save('test.pdf', { returnPromise: true });
                            });
                    }).then(function () {
                        that.binding.progress = {
                            percent: 100,
                            text: statusText,
                            show: 1
                        };
                    }).then(function() {
                        WinJS.Promise.timeout(1000).then(function() {
                            that.binding.progress.show = null;
                        });
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
            });
            Log.ret(Log.l.trace);
        })
    });
})();
