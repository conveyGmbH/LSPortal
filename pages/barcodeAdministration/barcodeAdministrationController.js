// controller for page: mailing
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/barcode/scripts/JsBarcode.all.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/barcodeAdministration/barcodeAdministrationService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("BarcodeAdministration", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
            var listView = pageElement.querySelector("#barcodeAdministration.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                count: 0
            }, commandList, false, BarcodeAdministration.fragebogenZeileBCView, null, listView]);
            this.questionslistBarcode = null;

            var that = this;

            this.resultConverter = function (item, index) {
            };

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.questionslistBarcode) {
                    that.questionslistBarcode = null;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;
            var printmode = false;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            // First, we call WinJS.Binding.as to get the bindable proxy object
            this.binding = WinJS.Binding.as(this.pageData);

            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                     if (WinJS.Navigation.canGoBack === true) {
                       WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    } else {
                      Application.navigateById("start", event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickbeforeprint: function(event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    var listSurface = pageElement.querySelector("#barcodeAdministration .win-surface");
                    var listviewBarcodeAdministration = pageElement.querySelector("#barcodeAdministration .listView");
                    var height = listSurface.clientHeight;
                    if (listSurface) {
                        var printSurface = document.createElement("div");
                        WinJS.Utilities.addClass(printSurface, "barcode-print-surface");
                        //printSurface.style.height = "3000px"; //height.toString()height.toString() +
                        printSurface.style.overflowY = "scroll";
                        printSurface.innerHTML = listSurface.innerHTML;
                        printSurface.style.overflowY = "scroll";
                        document.body.insertBefore(printSurface, document.body.firstElementChild);
                    }
                },
                clickafterprint: function(event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    var printSurface = document.querySelector(".barcode-print-surface");
                    if (printSurface) {
                        document.body.removeChild(printSurface);
                        printSurface.innerHTML = "";
                    }
                },
                clickPrint: function (event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    // chrome beforeprint
                    /*var mywindow = window.open('', 'PRINT', 'height=4400,width=1100');
                    //mywindow.document.write('<html><head><link href="barcodeAdministration.css" rel="stylesheet" /></head><body>');
                    mywindow.document.write(document.getElementById("printarea").innerHTML);
                    mywindow.document.write('<style>.barcode img {margin: 25px 50px; background: transparent;}</style>');
                    //mywindow.document.write('</body></html>');
                    mywindow.document.close(); // necessary for IE >= 10
                    mywindow.focus(); // necessary for IE >= 10*/

                    setTimeout(function() {
                        window.print();
                    }, 100);
                    /*mywindow.close();*/
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
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
                                layout = Application.QuestiongroupLayout.QuestionsLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                for (var i = 0; i < that.records.length; i++) {
                                    var itemElement = listView.winControl.elementFromIndex(i);
                                    if (itemElement) {
                                        var barcodeImages = itemElement.querySelectorAll(".barcode-image");
                                        if (barcodeImages) {
                                            for (var j = 0; j < barcodeImages.length; j++) {
                                                var barcodeImage = barcodeImages[j];
                                                if (barcodeImage && barcodeImage.barcode) {
                                                    var name = "barcode_" + i + "_" + j;
                                                    barcodeImage.setAttribute("name", name);
                                                    var value = barcodeImage.barcode.substring(9, 13);
                                                    JsBarcode("[name=" + name + "]",
                                                        value,
                                                        { width: 2, height: 25, displayValue: false });
                                                }
                                            }
                                        }
                                    }
                                }
                                
                                /*
                                if (that.records) {
                                    var items = that.records;
                                    var barcode = document.querySelector(".barcode");
                                    if (items) {
                                        for (var i = 0; i < items.length; i++) {
                                            var item = items.getAt(i);
                                            var thema = document.createElement("div");
                                            var sortierung = document.createElement("div");
                                            thema.textContent = item.Thema;
                                            sortierung.textContent = item.Sortierung+".";
                                            barcode.appendChild(sortierung);
                                            barcode.appendChild(thema);
                                            for (var y = 1; y < item.Anzahl + 1; y++) {
                                                var value, antworttext;
                                                if (y < 10) {
                                                    if (item["Antwort0" + y]) {
                                                        value = item["Antwort0" + y].substring(9, 13);
                                                        antworttext = item["AntwortNr0" + y];
                                                    }
                                                } else {
                                                    if (item["Antwort" + y]) {
                                                        value = item["Antwort" + y].substring(9, 13);
                                                        antworttext = item["AntwortNr" + y];
                                                    }
                                                }
                                                if (antworttext) {
                                                    var barcode1 = document.createElement("img");
                                                    barcode.appendChild(barcode1);
                                                    barcode1.setAttribute("id", "barcode" + i + "" + y);
                                                    JsBarcode("#barcode" + i + "" + y, value, { width: 1.5, height: 25, text: antworttext, fontsize: 8, textAlign: "left", textMargin: 25, background: "transparent"});
                                                }

                                            }
                                        }

                                    }
                                }
                                */
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    if (eventInfo && eventInfo.detail) {
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
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) { //
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }

                        } else {
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            if (that.records && that.loading!== true)
                                that.loading = false;
                            else
                                that.loading = true;
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
            }

            this.disableHandlers = {
                clickOk: function () {
                    // always enabled!
                    return false;
                },
                clickBack: function () {
                    // always enabled!
                    return false;
                },
                clickPrint: function () {
                    return false;
                }
            };

            // Finally, wire up binding
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