// controller for page: localevents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/employeeGenPWList/employeeGenPWListService.js" />
/// <reference path="~/www/pages/employeeGenPWList/exportXlsx.js" />
/// <reference path="~/www/lib/jQueryQRCode/scripts/jquery.qrcode.min.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("EmployeeGenPWList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EmployeeGenPWList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                veranstaltungId: 0,
                fairmandantId: 0,
                firstentry: 0,
                dataEmployeegenpwlistHeaderValue: getEmptyDefaultValue(EmployeeGenPWList.defaultHeaderRestriction),
                dataEmployeegenpwlistHeaderText: getEmptyDefaultValue(EmployeeGenPWList.defaultHeaderRestriction)
            }, commandList]);
            this.nextUrl = null;

            var that = this;

            // ListView control
            var progress = null;
            var counter = null;
            var layout = null;

            var table = pageElement.querySelector("#tableId");
            var tableHeader = pageElement.querySelector(".table-header");
            var tableBody = pageElement.querySelector(".table-body");


            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (tableBody && tableBody.winControl) {
                    tableBody.winControl.data = null;
                }
                if (that.employeePWListdata) {
                    that.employeePWListdata = null;
                }
            }

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var setInitialHeaderTextValue = function () {
                Log.print(Log.l.trace, "Setting up initial header texts and value shown in header of table");
                //text part
                that.binding.dataEmployeegenpwlistHeaderText.Name = getResourceText("employeegenpwlist.name");
                that.binding.dataEmployeegenpwlistHeaderText.Login = getResourceText("employeegenpwlist.login");
                that.binding.dataEmployeegenpwlistHeaderText.GenPassword = getResourceText("employeegenpwlist.password");
                that.binding.dataEmployeegenpwlistHeaderText.Barcode = getResourceText("employeegenpwlist.barcode");
                
                //value part
                that.binding.dataEmployeegenpwlistHeaderValue.Name = 1; //32
                that.binding.dataEmployeegenpwlistHeaderValue.Login = 2;
                that.binding.dataEmployeegenpwlistHeaderValue.GenPassword = 3;// 35
                that.binding.dataEmployeegenpwlistHeaderValue.Barcode = 4;
                
            }
            this.setInitialHeaderTextValue = setInitialHeaderTextValue;

            var setCellTitle = function () {
                Log.print(Log.l.trace, "Setting up initial Title of the cells!");
                var cells = pageElement.querySelectorAll("td");
                for (var i = 0; i < cells.length; i++) {
                    if (cells[i].title === "1") {
                        cells[i].title = getResourceText("employeegenpwlist.name");
                    }
                    if (cells[i].title === "2") {
                        cells[i].title = getResourceText("employeegenpwlist.login");
                    }
                    if (cells[i].title === "3") {
                        cells[i].title = getResourceText("employeegenpwlist.password");
                    }
                    if (cells[i].title === "4") {
                        cells[i].title = getResourceText("employeegenpwlist.barcode");
                    }
                }
            }
            this.setCellTitle = setCellTitle;

            var addHeaderRowHandlers = function () {
                if (tableHeader) {
                    var cells = tableHeader.getElementsByTagName("th");
                    for (var i = 0; i < cells.length; i++) {
                        var cell = cells[i];
                        if (!cell.onclick) {
                            cell.onclick = function (myrow) {
                                return function () {
                                    var restriction = EmployeeGenPWList.defaultRestriction;
                                    var sortId = myrow.value;
                                    var sorttext = myrow.textContent;
                                };
                            }(cell);
                        }
                    }
                }
            }
            this.addHeaderRowHandlers = addHeaderRowHandlers;

            var addBodyRowHandlers = function () {
                if (tableBody) {
                    var rows = tableBody.getElementsByTagName("tr");
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        if (!row.onclick) {
                            row.onclick = function (myrow) {
                                return function () {
                                    var id = myrow.value;
                                    for (var i = 0; i < that.siteeventsdataraw.length; i++) {
                                        if (that.siteeventsdataraw[i].VeranstaltungVIEWID === id) {
                                            for (var rowi = 0; rowi < rows.length; rowi++) {
                                                rows[rowi].style.backgroundColor = "";
                                                //myrow.style.opacity = 1;
                                                rows[rowi].classList.remove('selected');
                                            }
                                            myrow.style.backgroundColor = Colors.navigationColor; /*navigationColor*/
                                            //myrow.style.opacity = 0.4;
                                            myrow.className += " selected";
                                            
                                        }
                                    }

                                };
                            }(row);
                        }
                    }
                }
            }
            this.addBodyRowHandlers = addBodyRowHandlers;
            
            var loadNextUrl = function () {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                if (that.employeePWListdata && that.nextUrl) {
                    that.loading = true;
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select EmployeeGenPWList.employeePWView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    EmployeeGenPWList.employeePWView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "EmployeeGenPWList.employeePWView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && that.employeePWListdata) {
                            that.nextUrl =EmployeeGenPWList.employeePWView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.employeePWListdata.push(item);
                            });
                            //that.barcodeRecords = new WinJS.Binding.List(results);
                        }
                        that.loading = false;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //Log.print(Log.l.error, "ContactList.contactView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    },
                        null,
                        nextUrl);
                } else {
                    that.loading = false;
                }
                Log.ret(Log.l.trace);
            }
            this.loadNextUrl = loadNextUrl;

            var generateQRCodes = function() {
                if (that.employeePWListdata) {
                    //if (that.employeePWListdata) {
                        
                            var barcodeImage = pageElement.querySelectorAll(".userinfo-qrcode-container");
                            if (barcodeImage && barcodeImage.length > 0) {
                                for (var y = 0; y < barcodeImage.length; y++) {
                                    if (barcodeImage[y].childElementCount > 0) {
                                        var oldElement = barcodeImage[y].firstElementChild;
                                        if (oldElement) {
                                            barcodeImage[y].removeChild(oldElement);
                                        }
                                    }
                                    var value = "#LI:" +
                                        that.employeePWListdata.getAt(y).Login +
                                        "/" +
                                        that.employeePWListdata.getAt(y)
                                            .GenPassword; // barcodeImage.barcode.substring(9, 13)
                                    var qrcodeViewer = document.createElement("div");
                                    WinJS.Utilities.addClass(qrcodeViewer, "userinfo-qrcode");
                                    $(qrcodeViewer).qrcode({
                                        text: value,
                                        width: 50,
                                        height: 50,
                                        correctLevel: 0 //QRErrorCorrectLevel.M
                                    });
                                    barcodeImage[y].appendChild(qrcodeViewer);
                                }
                            }
                    that.loading = false;
                    // load SVG images
                    Colors.loadSVGImageElements(table, "action-image", 40, Colors.textColor);
                    Colors.loadSVGImageElements(table, "action-image-flag", 40);
                    that.loadNextUrl();
                }
                Log.ret(Log.l.trace);
            }
            this.generateQRCodes = generateQRCodes;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickExport: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    var exporter = new ExportXlsx.ExporterClass();
                    var dbView = EmployeeGenPWList.employeePWExportView;
                    var fileName = "Passworte";
                    exporter.saveXlsxFromView(dbView, fileName, function (result) {
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                    }, null , null);
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    Application.navigateById("userinfo", event);
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
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    Application.navigateById("publish", event);
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
            
            var resultConverter = function (item, index) {
                item.index = index;
                item.Name = (item.Vorname ? (item.Vorname + " ") : "") + (item.Nachname ? item.Nachname : "");
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "EmployeeGenPWList.Controller.");
                that.loading = true;
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return EmployeeGenPWList.employeePWView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "EmployeeGenPWList: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            that.nextUrl = EmployeeGenPWList.employeePWView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.binding.count = results.length;

                            that.employeePWListdata = new WinJS.Binding.List(results);
                            
                            if (tableBody.winControl) {
                                // add ListView dataSource
                                tableBody.winControl.data = that.employeePWListdata;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                            //that.addBodyRowHandlers();
                            //that.addHeaderRowHandlers();
                            that.setCellTitle();
                            that.generateQRCodes();
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;
                            that.employeePWListdata = null;
                            if (tableBody.winControl) {
                                // add ListView dataSource
                                tableBody.winControl.data = null;
                            }
                            that.loading = false;
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    }, {
                            GenPassword: ['NOT NULL'],
                            VeranstaltungID: AppData.getRecordId("Veranstaltung")
                       }
                    );
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;
            
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.setInitialHeaderTextValue();
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
                employeePWListdata: null
            })
    });
})();