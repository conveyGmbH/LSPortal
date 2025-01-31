// controller for page: start
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/startPremium/startPremiumService.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/jspdf/jspdf.min.js"/>
/// <reference path="~/www/fragments/diaCountrysIndustries/diaCountrysIndustriesController.js"/>
/// <reference path="~/www/fragments/diaIndustries/diaIndustriesController.js"/>



(function () {
    "use strict";

    WinJS.Namespace.define("StartPremium", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "StartPremium.Controller.");
            Application.Controller.apply(this, [pageElement, {
                progress: {
                    percent: 0,
                    text: "",
                    show: null
                },
                exportActive: false,
                dashBoardZip: null
            }, commandList]);

            var that = this;

            this.isSupreme = parseInt(AppData._persistentStates.showdashboardMesagoCombo) || parseInt(AppData._userData.IsSupreme);

            var excelButton = pageElement.querySelector("#btn-excel");
            var overlay = pageElement.querySelector("#overlay");
            var icon = pageElement.querySelector(".dashboard-tip-download-container");

            this.dispose = function () {

            }

            var loadIcon = function () {
                Colors.loadSVGImageElements(icon, "action-image", 40, Colors.textColor, "name");
            }
            this.loadIcon = loadIcon;

            var getEventId = function () {
                return StartPremium._eventId;
            }
            that.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "eventId=" + value);
                StartPremium._eventId = value;
            }
            that.setEventId = setEventId;

            var base64ToBlob = function (base64Data, contentType) {
                contentType = contentType || '';
                var sliceSize = 1024;
                var byteCharacters = atob(base64Data);
                var bytesLength = byteCharacters.length;
                var slicesCount = Math.ceil(bytesLength / sliceSize);
                var byteArrays = new Array(slicesCount);

                for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                    var begin = sliceIndex * sliceSize;
                    var end = Math.min(begin + sliceSize, bytesLength);

                    var bytes = new Array(end - begin);
                    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                        bytes[i] = byteCharacters[offset].charCodeAt(0);
                    }
                    byteArrays[sliceIndex] = new Uint8Array(bytes);
                }
                return new Blob(byteArrays, { type: contentType });
            }
            this.base64ToBlob = base64ToBlob;

            var exportDbExcel = function (recordId) {
                Log.call(Log.l.trace, "StartPremium.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                if (recordId) {
                    AppBar.busy = true;
                    ret = StartPremium.DOC3ExportPDFView.select(function (json) {
                        Log.print(Log.l.trace, "exportKontaktDataView: success!");
                        if (json && json.d) {
                            var results = json.d.results[0];
                            var excelDataraw = results.DocContentDOCCNT1;
                            var sub = excelDataraw.search("\r\n\r\n");
                            var excelDataBase64 = excelDataraw.substr(sub + 4);
                            var excelData = that.base64ToBlob(excelDataBase64, "xlsx");
                            var excelName = results.szOriFileNameDOC1;
                            saveAs(excelData, excelName);
                            overlay.style.display = "none";
                            AppBar.busy = false;
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                        }, { DOC3ExportPDFVIEWID: recordId });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportDbExcel = exportDbExcel;

            var loadData = function () {
                Log.call(Log.l.trace, "Start.Controller.");
                that.setEventId(AppData.getRecordId("Veranstaltung2"));
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var diaCountrysFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaCountrys"));
                    if (diaCountrysFragmentControl && diaCountrysFragmentControl.controller) {
                        return diaCountrysFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#diaCountryshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaCountrys", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var diaYearRangeFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaYearRange"));
                    if (diaYearRangeFragmentControl && diaYearRangeFragmentControl.controller) {
                        return diaYearRangeFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#diaYearRangehost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaYearRange", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var diaVisitorsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaVisitors"));
                    if (diaVisitorsFragmentControl && diaVisitorsFragmentControl.controller) {
                        return diaVisitorsFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#diaVisitorshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaVisitors", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var diaCountrysIndustriespDFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaCountrysIndustries"));
                    if (diaCountrysIndustriespDFragmentControl && diaCountrysIndustriespDFragmentControl.controller) {
                        return diaCountrysIndustriespDFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#diaCountrysIndustriespDhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaCountrysIndustries", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var diaIndustriespDFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("diaIndustries"));
                    if (diaIndustriespDFragmentControl && diaIndustriespDFragmentControl.controller) {
                        return diaIndustriespDFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#diaIndustrieshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "diaIndustries", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done(/* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickEditEvent: function (event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    var command = event.currentTarget;
                    if (command) {
                        Log.print(Log.l.trace, "clickButton event command.name=" + command.name);
                        Application.navigateById(command.id, event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    Application.navigateById("account", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
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
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    if (eventInfo && eventInfo.detail) {
                    }
                    Log.ret(Log.l.trace);
                },
                exportDashboardExcel: function(event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    excelButton.disabled = "true";
                    overlay.style.display = "block";
                    if (that.isSupreme === 2) {
                        AppData.setErrorMsg(that.binding);
                        return AppData.call("PRC_DBExcelRequest", {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            pLanguageSpecID: AppData.getLanguageId(),
                            pExportType: "DBSUPREME",
                            psyncRun: 1
                        }, function (json) {
                            Log.print(Log.l.info, "call success!");
                            if (json && json.d.results[0]) {
                                excelButton.removeAttribute("disabled");
                                that.exportDbExcel(json.d.results[0]);
                            } else {
                                Log.print(Log.l.error, "call error DOC3ExportPDFID is null");
                            }
                        }, function (error) {
                            Log.print(Log.l.error, "call error");

                        });
                    } else {
                        AppData.setErrorMsg(that.binding);
                        excelButton.disabled = "true";
                        return AppData.call("PRC_DBExcelRequest", {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            pLanguageSpecID: AppData.getLanguageId(),
                            pExportType: "DBPREMIUM",
                            psyncRun: 1
                        }, function (json) {
                            Log.print(Log.l.info, "call success!");
                            if (json && json.d.results[0]) {
                                excelButton.removeAttribute("disabled");
                                that.exportDbExcel(json.d.results[0]);
                            } else {
                                Log.print(Log.l.error, "call error DOC3ExportPDFID is null");
                            }
                        }, function (error) {
                            Log.print(Log.l.error, "call error");

                        });
                    }
                    Log.ret(Log.l.trace);
                },
                exportAllChartsToPdf: function (event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
                    var percent = 0;
                    var statusText = "";
                    /*if (!that.binding.dashBoardZip) {
                        that.binding.dashBoardZip = new JSZip();
                    }*/
                    var zipCharts = new JSZip();
                    that.binding.progress = {
                        percent: percent,
                        text: statusText,
                        show: 1
                    };
                    that.binding.exportActive = true;
                    var ret = new WinJS.Promise.as().then(function () {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        // diaCountrys chart
                        that.binding.progress.text = getResourceText('diaCountrys.top10');
                        return html2canvas(document.getElementById("diaCountryshost"),
                            {
                                scale: 1,
                                quality: 4
                            }).then(canvas => { /*, { dpi: 300 }*/
                                var widthOfCanvas = canvas.width;
                                var heightOfCanvas = canvas.height;
                                //set the orientation
                                var orientation, mmLeft, mmTop, mmWidth, mmHeight;
                                var mmLongSide = 297, mmShortSide = 210, mmBorder = 5, scale = 1;
                                if (widthOfCanvas >= heightOfCanvas) {
                                    orientation = 'l';
                                    mmLeft = mmBorder;
                                    mmWidth = mmLongSide - 2 * mmBorder;
                                    mmHeight = mmWidth * heightOfCanvas / widthOfCanvas;
                                    if (mmHeight > (mmShortSide - 2 * mmBorder)) {
                                        scale = (mmShortSide - 2 * mmBorder) / mmHeight;
                                        mmHeight *= scale;
                                        mmWidth *= scale;
                                        mmLeft = (mmLongSide - mmWidth) / 2;
                                    }
                                    mmTop = (mmShortSide - mmHeight) / 2;
                                } else {
                                    orientation = 'p';
                                    mmTop = mmBorder;
                                    mmHeight = mmLongSide - 2 * mmBorder;
                                    mmWidth = mmHeight * widthOfCanvas / heightOfCanvas;
                                    if (mmWidth > (mmShortSide - 2 * mmBorder)) {
                                        scale = (mmShortSide - 2 * mmBorder) / mmWidth;
                                        mmHeight *= scale;
                                        mmWidth *= scale;
                                        mmTop = (mmLongSide - mmHeight) / 2;
                                    }
                                    mmLeft = (mmShortSide - mmWidth) / 2;
                                }
                                var doc = new jsPDF(orientation, 'mm', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                                doc.addImage(canvas.toDataURL(), 'png', mmLeft, mmTop, mmWidth, mmHeight);
                                that.binding.progress.percent = 25;
                                that.binding.progress.text = getResourceText('diaCountrys.top10');
                                //doc.save(getResourceText('diaCountrys.top10'));
                            zipCharts.file(getResourceText('diaCountrys.top10') + '.pdf', doc.output('blob'));
                            });
                    }).then(function () {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        // diaYearRange chart
                        that.binding.progress.text = getResourceText('diaYearRange.title');
                        return html2canvas(document.getElementById("diaYearRangehost"),
                            {
                                scale: 1,
                                quality: 4
                            }).then(canvas => { /*, { dpi: 300 }*/
                                var widthOfCanvas = canvas.width;
                                var heightOfCanvas = canvas.height;
                                //set the orientation
                                var orientation, mmLeft, mmTop, mmWidth, mmHeight;
                                var mmLongSide = 297, mmShortSide = 210, mmBorder = 5, scale = 1;
                                if (widthOfCanvas >= heightOfCanvas) {
                                    orientation = 'l';
                                    mmLeft = mmBorder;
                                    mmWidth = mmLongSide - 2 * mmBorder;
                                    mmHeight = mmWidth * heightOfCanvas / widthOfCanvas;
                                    if (mmHeight > (mmShortSide - 2 * mmBorder)) {
                                        scale = (mmShortSide - 2 * mmBorder) / mmHeight;
                                        mmHeight *= scale;
                                        mmWidth *= scale;
                                        mmLeft = (mmLongSide - mmWidth) / 2;
                                    }
                                    mmTop = (mmShortSide - mmHeight) / 2;
                                } else {
                                    orientation = 'p';
                                    mmTop = mmBorder;
                                    mmHeight = mmLongSide - 2 * mmBorder;
                                    mmWidth = mmHeight * widthOfCanvas / heightOfCanvas;
                                    if (mmWidth > (mmShortSide - 2 * mmBorder)) {
                                        scale = (mmShortSide - 2 * mmBorder) / mmWidth;
                                        mmHeight *= scale;
                                        mmWidth *= scale;
                                        mmTop = (mmLongSide - mmHeight) / 2;
                                    }
                                    mmLeft = (mmShortSide - mmWidth) / 2;
                                }
                                var doc = new jsPDF(orientation, 'mm', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                                doc.addImage(canvas.toDataURL(), 'png', mmLeft, mmTop, mmWidth, mmHeight);
                                that.binding.progress.percent = 50;
                                that.binding.progress.text = getResourceText('diaYearRange.title');
                                //doc.save(getResourceText('diaYearRange.title'));
                            zipCharts.file(getResourceText('diaYearRange.title') + '.pdf', doc.output('blob'));
                            });
                    }).then(function () {
                        /*var doc = new jsPDF("landscape", "mm", 'a4');
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;*/
                        // diaVisitors chart
                        that.binding.progress.text = getResourceText('diaVisitors.title');
                        return html2canvas(document.getElementById("diaVisitorshost"),
                            {
                                scale: 1,
                                quality: 4
                            }).then(canvas => { /*, { dpi: 300 }*/
                                var widthOfCanvas = canvas.width;
                                var heightOfCanvas = canvas.height;
                                //set the orientation
                                var orientation, mmLeft, mmTop, mmWidth, mmHeight;
                                var mmLongSide = 297, mmShortSide = 210, mmBorder = 5, scale = 1;
                                if (widthOfCanvas >= heightOfCanvas) {
                                    orientation = 'l';
                                    mmLeft = mmBorder;
                                    mmWidth = mmLongSide - 2 * mmBorder;
                                    mmHeight = mmWidth * heightOfCanvas / widthOfCanvas;
                                    if (mmHeight > (mmShortSide - 2 * mmBorder)) {
                                        scale = (mmShortSide - 2 * mmBorder) / mmHeight;
                                        mmHeight *= scale;
                                        mmWidth *= scale;
                                        mmLeft = (mmLongSide - mmWidth) / 2;
                                    }
                                    mmTop = (mmShortSide - mmHeight) / 2;
                                } else {
                                    orientation = 'p';
                                    mmTop = mmBorder;
                                    mmHeight = mmLongSide - 2 * mmBorder;
                                    mmWidth = mmHeight * widthOfCanvas / heightOfCanvas;
                                    if (mmWidth > (mmShortSide - 2 * mmBorder)) {
                                        scale = (mmShortSide - 2 * mmBorder) / mmWidth;
                                        mmHeight *= scale;
                                        mmWidth *= scale;
                                        mmTop = (mmLongSide - mmHeight) / 2;
                                    }
                                    mmLeft = (mmShortSide - mmWidth) / 2;
                                }
                                var doc = new jsPDF(orientation, 'mm', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                                doc.addImage(canvas.toDataURL(), 'png', mmLeft, mmTop, mmWidth, mmHeight);
                                //doc.save(getResourceText('diaVisitors.title'));
                                that.binding.progress.percent = 75;
                                that.binding.progress.text = getResourceText('diaVisitors.title');
                            zipCharts.file(getResourceText('diaVisitors.title') + '.pdf', doc.output('blob'));
                            });
                    }).then(function () {
                        var diaCountrysIndustriespDFragmentControl =
                            Application.navigator.getFragmentControlFromLocation(
                                Application.getFragmentPath("diaCountrysIndustries"));
                        if (diaCountrysIndustriespDFragmentControl &&
                            diaCountrysIndustriespDFragmentControl.controller) {
                            Log.ret(Log.l.trace);
                            return diaCountrysIndustriespDFragmentControl.controller.exportCharts();
                        } else {
                            var parentElement = pageElement.querySelector("#diaCountrysIndustriespDhost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "diaCountrysIndustries", {});
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    }).then(function () {
                        var diaCountrysIndustriesFragmentControl =
                            Application.navigator.getFragmentControlFromLocation(
                                Application.getFragmentPath("diaIndustries"));
                        if (diaCountrysIndustriesFragmentControl &&
                            diaCountrysIndustriesFragmentControl.controller) {
                            Log.ret(Log.l.trace);
                            return diaCountrysIndustriesFragmentControl.controller.exportCharts();
                        } else {
                            var parentElement = pageElement.querySelector("#diIndustrieshost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "diaIndustries", {});
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    }).then(function() {
                        that.binding.exportActive = false;
                    }).then(function () {
                        zipCharts.generateAsync({ type: 'blob' }).then(function (content) {
                            saveAs(content, 'Reports.zip');
                        });
                        that.binding.progress.show = null;
                    });
                },
                exportBrowserViewToPdf: function (event) {
                    Log.call(Log.l.trace, "StartPremium.Controller.");
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
                        var dpi = window.devicePixelRatio * 96;
                        return html2canvas(element, {
                            scale: 1,
                            quality: 4
                        }).then(canvas => { /*, { dpi: 300 }*/
                            that.binding.progress = {
                                percent: 25,
                                text: statusText,
                                show: 1
                            };
                            var widthOfCanvas = canvas.width;
                            var heightOfCanvas = canvas.height;
                            //function myFunction() {
                            //var myWindow = window.open("", "MsgWindow", "width=widthOfCanvas,height=heightOfCanvas");
                            //myWindow.document.write('<img src="' + canvas.toDataURL() + '"/>');
                            //}
                            //set the orientation
                            var orientation, mmLeft, mmTop, mmWidth, mmHeight;
                            var mmLongSide = 297, mmShortSide = 210, mmBorder = 5, scale = 1;
                            if (widthOfCanvas >= heightOfCanvas) {
                                orientation = 'l';
                                mmLeft = mmBorder;
                                mmWidth = mmLongSide - 2 * mmBorder;
                                mmHeight = mmWidth * heightOfCanvas / widthOfCanvas;
                                if (mmHeight > (mmShortSide - 2 * mmBorder)) {
                                    scale = (mmShortSide - 2 * mmBorder) / mmHeight;
                                    mmHeight *= scale;
                                    mmWidth *= scale;
                                    mmLeft = (mmLongSide - mmWidth) / 2;
                                }
                                mmTop = (mmShortSide - mmHeight) / 2;
                            } else {
                                orientation = 'p';
                                mmTop = mmBorder;
                                mmHeight = mmLongSide - 2 * mmBorder;
                                mmWidth = mmHeight * widthOfCanvas / heightOfCanvas;
                                if (mmWidth > (mmShortSide - 2 * mmBorder)) {
                                    scale = (mmShortSide - 2 * mmBorder) / mmWidth;
                                    mmHeight *= scale;
                                    mmWidth *= scale;
                                    mmTop = (mmLongSide - mmHeight) / 2;
                                }
                                mmLeft = (mmShortSide - mmWidth) / 2;
                            }
                            var doc = new jsPDF(orientation, 'mm', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                            doc.addImage(canvas.toDataURL(), 'png', mmLeft, mmTop, mmWidth, mmHeight);
                            that.binding.progress = {
                                percent: 75,
                                text: statusText,
                                show: 1
                            };
                            if (that.isSupreme === 2) {
                                statusText = getResourceText("label.startSurpreme");
                                doc.save(getResourceText("label.startSurpreme"), { returnPromise: true });
                            } else {
                                statusText = getResourceText("label.startPremium");
                                doc.save(getResourceText("label.startPremium"), { returnPromise: true });
                            }
                        });
                    }).then(function () {
                        that.binding.progress = {
                            percent: 100,
                            text: statusText,
                            show: 1
                        };
                    }).then(function () {
                        WinJS.Promise.timeout(1000).then(function () {
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

            var checkTip = function () {
                if (that.isSupreme === 2) {
                    var event = pageElement.querySelector(".circle-with-text-event-dot");
                    event.style.backgroundColor = Colors.dashboardColor;
                    var surpremeColor = "#092052";
                    var global = pageElement.querySelector(".circle-with-text-global-dot");
                    global.style.backgroundColor = surpremeColor;
                    var eventText = pageElement.querySelector(".circle-with-text-event-text");
                    eventText.style.color = Colors.labelColor;
                    var globalText = pageElement.querySelector(".circle-with-text-global-text");
                    globalText.style.color = Colors.labelColor;
                } else {
                    var tip = pageElement.querySelector(".tip-container");
                    tip.style.display = "none";
                }
            }
            this.checkTip = checkTip;

            // finally, load the data
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Calling checkTip");
                return that.checkTip();
            }).then(function () {
                Log.print(Log.l.trace, "Calling loadData");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Calling loadData");
                return that.loadIcon();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();
