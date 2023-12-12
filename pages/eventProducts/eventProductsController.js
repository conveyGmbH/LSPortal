// controller for page: EventProducts
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventProducts/eventProductsService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("EventProducts", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventProducts.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                productsshowflag: null
            }, commandList]);
            this.products = null;
            this.deselectRowId = null;
            this.selectedRow = null;

            var that = this;

            var table = pageElement.querySelector("#tableId");
            var tableHeader = pageElement.querySelector(".table-header");
            var tableBody = pageElement.querySelector(".table-body");
            var productTypDropdown = pageElement.querySelector("#productTyp");

            this.dispose = function () {
                if (that.products) {
                    that.products = null;
                }
                if (tableBody && tableBody.winControl) {
                    tableBody.winControl.data = null;
                }
            }
            
            var resultConverter = function (item, index) {
                item.index = index;
               
            }
            this.resultConverter = resultConverter;

            var getVeranstaltungId = function () {
                return EventProducts._veranstaltungId;
            }
            that.getVeranstaltungId = getVeranstaltungId;

            var setVeranstaltungId = function (value) {
                Log.print(Log.l.trace, "veranstaltungId=" + value);
                EventProducts._veranstaltungId = value;
            }
            that.setVeranstaltungId = setVeranstaltungId;

            var master = Application.navigator.masterControl;
            if (master &&
                master.controller &&
                master.controller.binding &&
                master.controller.binding.eventId) {
                that.setVeranstaltungId(master.controller.binding.eventId);
            }

            var resizableGrid = function () {
                var row = tableHeader ? tableHeader.querySelector("tr") : null,
                    cols = row ? row.children : null;
                if (!cols) return;

                var tableHeight = table.offsetHeight;

                function createDiv(height) {
                    var div = document.createElement("div");
                    div.style.top = 0;
                    div.style.right = 0;
                    div.style.width = "5px";
                    div.style.position = "absolute";
                    div.style.cursor = "col-resize";
                    div.style.userSelect = "none";
                    div.style.height = height + "px";
                    return div;
                }

                function getStyleVal(elm, css) {
                    return (window.getComputedStyle(elm, null).getPropertyValue(css));
                }

                function paddingDiff(col) {
                    if (getStyleVal(col, "box-sizing") === "border-box") {
                        return 0;
                    }
                    var padLeft = getStyleVal(col, "padding-left");
                    var padRight = getStyleVal(col, "padding-right");
                    return (parseInt(padLeft) + parseInt(padRight));

                }

                function setListeners(div) {
                    var pageX, curCol, nxtCol, curColWidth, nxtColWidth;

                    div.addEventListener("mousedown", function (e) {
                        curCol = e.target.parentElement;
                        nxtCol = curCol.nextElementSibling;
                        pageX = e.pageX;

                        var padding = paddingDiff(curCol);

                        curColWidth = curCol.offsetWidth - padding;
                        if (nxtCol)
                            nxtColWidth = nxtCol.offsetWidth - padding;
                    });

                    div.addEventListener("mouseover",
                        function (e) {
                            e.target.style.borderRight = "2px solid #0000ff";
                        });

                    div.addEventListener("mouseout",
                        function (e) {
                            e.target.style.borderRight = "";
                        });

                    pageElement.addEventListener("mousemove", function (e) {
                        if (curCol) {
                            var diffX = e.pageX - pageX;

                            if (nxtCol)
                                nxtCol.style.width = (nxtColWidth - (diffX)) + "px";

                            curCol.style.width = (curColWidth + diffX) + "px";
                        }
                    });

                    pageElement.addEventListener("mouseup", function (e) {
                        curCol = undefined;
                        nxtCol = undefined;
                        pageX = undefined;
                        nxtColWidth = undefined;
                        curColWidth = undefined;
                    });

                }

                for (var i = 0; i < cols.length; i++) {
                    var columnSelector = cols[i].querySelector("div");
                    if (columnSelector && columnSelector.style) {
                        columnSelector.style.height = tableHeight + "px";
                    } else {
                        var div = createDiv(tableHeight);
                        cols[i].appendChild(div);
                        cols[i].style.position = "relative";
                        setListeners(div);
                    }
                }
            }
            this.resizableGrid = resizableGrid;

                var addBodyRowHandlers = function () {
                    if (tableBody) {
                        var rows = tableBody.getElementsByTagName("tr");
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];

                            if (!row.onclick) {
                                row.onclick = function (myrow) {
                                    return function () {
                                        var id = myrow.value;
                                        that.deselectRowId = parseInt(id);
                                        if (myrow.classList.contains("selected")) {
                                            myrow.classList.remove("selected");
                                            that.deselectRowId = null;
                                            AppBar.modified = true;
                                        } else {
                                            myrow.classList.add("selected");
                                            that.deselectRowId = parseInt(id);
                                            AppBar.modified = true;
                                        }
                                    };
                                }(row);
                            }
                        }
                    }
                }
                this.addBodyRowHandlers = addBodyRowHandlers;

                var sortTable = function (n) {
                    Log.call(Log.l.trace, "MailingList.Controller.");
                    var rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
                    switching = true;
                    // Set the sorting direction to ascending:
                    dir = "asc";
                    /* Make a loop that will continue until
                    no switching has been done: */
                    while (switching) {
                        // Start by saying: no switching is done:
                        switching = false;
                        rows = table.rows;
                        /* Loop through all table rows (except the
                        first, which contains table headers): */
                        for (i = 1; i < (rows.length - 1); i++) {
                            // Start by saying there should be no switching:
                            shouldSwitch = false;
                            /* Get the two elements you want to compare,
                            one from current row and one from the next: */
                            x = rows[i].getElementsByTagName("TD")[n];
                            y = rows[i + 1].getElementsByTagName("TD")[n];
                            /* Check if the two rows should switch place,
                            based on the direction, asc or desc: */
                            if (Number(x.innerHTML) > Number(y.innerHTML)) {
                                shouldSwitch = true;
                                break;
                            }
                            if (dir === "asc") {
                                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                                    // If so, mark as a switch and break the loop:
                                    shouldSwitch = true;
                                    break;
                                }
                            } else if (dir === "desc") {
                                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                                    // If so, mark as a switch and break the loop:
                                    shouldSwitch = true;
                                    break;
                                }
                            }
                        }
                        if (shouldSwitch) {
                            /* If a switch has been marked, make the switch
                            and mark that a switch has been done: */
                            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                            switching = true;
                            // Each time a switch is done, increase this count by 1:
                            switchcount++;
                        } else {
                            /* If no switching has been done AND the direction is "asc",
                            set the direction to "desc" and run the while loop again. */
                            if (switchcount === 0 && dir === "asc") {
                                dir = "desc";
                                switching = true;
                            }
                        }
                    }
                }
            this.sortTable = sortTable;

            var creatingProductsCategory = function () {
                Log.call(Log.l.trace, "SiteEventsList.Controller.");
                return AppData.call("PRC_GetAvailableProducts",
                    {
                        pVeranstaltungID: that.getVeranstaltungId(),
                        pLanguageSpecID: AppData.getLanguageId()
                    },
                    function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (json && json.d && json.d.results.length > 0) {
                            var results = json.d.results;
                            if (productTypDropdown && productTypDropdown.winControl) {
                                productTypDropdown.winControl.data = new WinJS.Binding.List(results);
                                productTypDropdown.selectedIndex = 0;
                            }
                        } else {
                            Log.print(Log.l.error, "call error");
                        }
                    },
                    function (error) {
                        Log.print(Log.l.error, "call error");
                    });
            }
            this.creatingProductsCategory = creatingProductsCategory;
            
            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventProducts.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSortTable: function (event) {
                    Log.call(Log.l.trace, "MailingList.Controller.");
                    that.sortTable(parseInt(event.currentTarget.id));
                    Log.ret(Log.l.trace);
                },
                clickShowAddProduct: function(event) {
                    if (that.binding.productsshowflag === null) {
                        that.binding.productsshowflag = 1;
                    } else {
                        that.binding.productsshowflag = null;
                    }
                },
                clickAddNewProduct: function(event) {
                    var productId = parseInt(productTypDropdown.value);
                    Log.call(Log.l.trace, "EventProducts.Controller.");
                    return AppData.call("PRC_AddProduct",
                        {
                            pVeranstaltungID: that.getVeranstaltungId(),
                            pProductID: productId
                        },
                        function (json) {
                            Log.print(Log.l.info, "call success! ");
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.productsshowflag = null;
                                that.loadData();
                                that.creatingProductsCategory();
                            } else {

                            }
                        },
                        function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                },
                clickRemoveProduct: function (event) {
                    Log.call(Log.l.trace, "EventProducts.Controller.");
                    return AppData.call("PRC_RemoveProduct",
                            {
                                pVeranstaltungID: that.getVeranstaltungId(),
                                pProductID: that.deselectRowId
                            },
                            function (json) {
                                Log.print(Log.l.info, "call success! ");
                                if (json && json.d && json.d.results.length > 0) {
                                    var results = json.d.results;
                                    that.deselectRowId = null;
                                    that.loadData();
                                    that.creatingProductsCategory();
                                } else {

                                }
                            },
                            function (error) {
                                Log.print(Log.l.error, "call error");
                            });
                },
                ontableselect : function(event) {
                    if (event.target.tagName === "TD") {
                        // Get the clicked row
                        var clickedRow = event.target.parentNode;
                        // Deselect the previously selected row
                        if (that.selectedRow) {
                            that.selectedRow.classList.remove("selected");
                        }
                        clickedRow.classList.add("selected");
                        that.deselectRowId = parseInt(clickedRow.value);
                        AppBar.modified = true;
                        that.selectedRow = clickedRow;
                        
                    }
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "EventProducts.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EventProducts.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EventProducts.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
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
                clickRemoveProduct: function () {
                    if (that.deselectRowId === null) {
                        return true;
                    } else {
                        return false;
                    }
                }
            };

            // register ListView event handler
            if (table) {
                this.addRemovableEventListener(table, "click", this.eventHandlers.ontableselect.bind(this));
            }
            
            var loadData = function () {
                Log.call(Log.l.trace, "EventProducts.Controller.");
                that.loading = true;
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
                    var vaid = that.getVeranstaltungId();
                    if (!vaid) {
                        Log.call(Log.l.trace, "No VeranstaltungID found!");
                    
                    } else {
                        return AppData.call("PRC_GetAssignedProducts",
                            {
                                pVeranstaltungID: vaid,
                                pLanguageSpecID: AppData.getLanguageId()
                            },
                            function (json) {
                                Log.print(Log.l.info, "call success! ");
                                if (json && json.d && json.d.results.length > 0) {
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });

                                    that.binding.count = results.length;

                                    if (tableBody && tableBody.winControl) {
                                        tableBody.winControl.data = new WinJS.Binding.List(json.d.results);
                                    }

                                    //that.addBodyRowHandlers();
                                } else {
                                    Log.call(Log.l.trace, "No VeranstaltungID found!");
                                }
                            },
                            function (error) {
                                Log.print(Log.l.error, "call error");
                            });
                    }
                    Log.ret(Log.l.trace);
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Loading Data for products");
                that.creatingProductsCategory();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                //that.addBodyRowHandlers();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {

        })
    });
})();
