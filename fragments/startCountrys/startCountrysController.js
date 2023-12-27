// controller for page: startContacts
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/startCountrys/startCountrysService.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.de.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.en.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />

(function () {
    "use strict";

    var namespaceName = "StartCountrys";

    WinJS.Namespace.define(namespaceName, {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            var lang = AppData.getLanguageId();
            var srcDatamaps;
            switch (lang) {
            case 1033:
                srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                break;
            case 1036:
                srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                break;
            case 1040:
                srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                break;
            default:
                srcDatamaps = "lib/datamaps/scripts/datamaps.world.de.js";
            }
            Fragments.Controller.apply(this, [fragmentElement, {
                scripts: [{ src: srcDatamaps, type: "text/javascript" }]
            }]);


            this.worldMapMaxWidth = 600;
            this.worldMap = null;
            this.worldMapHeight = 0;
            this.countryKeyData = null;

            var that = this;
            this.countryColors = [];
            
            var isotoInitlandId = function (isoCode) {
                var results = AppData.initLandView.getResults();
                if (results && results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].Alpha3_ISOCode === isoCode) {
                            return results[i].INITLandID;
                        }
                    }
                }
            };
            this.isotoInitlandId = isotoInitlandId;

            var marginWorlfmap = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var worldmap = fragmentElement.querySelector(".start-map-chart");
                var contentarea = fragmentElement.querySelector(".contentarea");
                var worldButtonContainer = fragmentElement.querySelector(".worldbutton");
                    var heightW = worldmap.clientHeight;
                    var widthW = contentarea.clientHeight - worldButtonContainer.clientHeight;
                    var marginTop = (widthW - heightW) / 2;
                var marginTopP = marginTop.toString() + "px";
                worldmap.style.marginTop = marginTopP;
                Log.ret(Log.l.trace);
            }
            this.marginWorlfmap = marginWorlfmap;

            var setWorldbuttonStyle = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var worldbutton1 = fragmentElement.querySelector("#worldbutton1");
                var worldbutton2 = fragmentElement.querySelector("#worldbutton2");
                var worldbutton3 = fragmentElement.querySelector("#worldbutton3");
                var worldbutton4 = fragmentElement.querySelector("#worldbutton4");
                var worldbutton5 = fragmentElement.querySelector("#worldbutton5");
                var header = fragmentElement.querySelector(".gridtitlecountries").offsetWidth;
                if (worldbutton1) {
                    var objwi = header / 5;
                    var objwi2 = objwi.toString();
                    worldbutton1.style.width = objwi2 -1 + "px";
                    worldbutton2.style.width = objwi2 - 1 + "px";
                    worldbutton3.style.width = objwi2 + "px";
                    worldbutton4.style.width = objwi2 + "px";
                    worldbutton5.style.width = objwi2 + "px";
                }
                Log.ret(Log.l.trace);
            }
            this.setWorldbuttonStyle = setWorldbuttonStyle;

            var goToNorthAmerica = function () {
                that.worldMap.svg.selectAll(".datamaps-subunits").transition().duration(750).attr("transform", "scale(1.0)translate(100, 0)");
            };
            this.goToNorthAmerica = goToNorthAmerica;

            var goToSouthAmerica = function () {
                that.worldMap.svg.selectAll(".datamaps-subunits").transition().duration(750).attr("transform", "scale(2.0)translate(-50,-150)");
            };
            this.goToSouthAmerica = goToSouthAmerica;

            var goToEurope = function () {
                that.worldMap.svg.selectAll(".datamaps-subunits").transition().duration(750).attr("transform", "scale(3.0)translate(-180,-60)");
            };
            this.goToEurope = goToEurope;

            var goToAfrica = function () {
                that.worldMap.svg.selectAll(".datamaps-subunits").transition().duration(750).attr("transform", "scale(2.5)translate(-160,-140)");
            };
            this.goToAfrica = goToAfrica;

            var goToAsia = function () {
                that.worldMap.svg.selectAll(".datamaps-subunits").transition().duration(750).attr("transform", "scale(2.0)translate(-240,-65)");
            };
            this.goToAsia = goToAsia;

            var goToAustralia = function () {
                that.worldMap.svg.selectAll(".datamaps-subunits").transition().duration(750).attr("transform", "scale(3.0)translate(-200,-200)");
            };
            this.goToAustralia = goToAustralia;

            var goToWorld = function () {
                that.worldMap.svg.selectAll(".datamaps-subunits").transition().duration(750).attr("transform", "");
            };
            this.goToWorld = goToWorld;

            var worldChart = function (bAnimated) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    if (!that.countryKeyData) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        var worldContainer = fragmentElement.querySelector("#worldcontainer");
                        if (worldContainer) {
                            var height = worldContainer.clientWidth / 2;
                            if (height > that.worldMapMaxWidth / 2) {
                                height = that.worldMapMaxWidth / 2;
                            }
                            var width = height * 150 / 100;
                            if (that.worldMapHeight !== height) {
                                that.worldMapHeight = height;
                                var hiliRgb = Colors.hex2rgb(Colors.textColor);
                                var hiliBorderColor = "rgba(" + hiliRgb.r + "," + hiliRgb.g + "," + hiliRgb.b + ",0.2)";
                                if (!that.countryKeyData) {
                                    Log.print(Log.l.trace, "load empty map");
                                    that.countryKeyData = {};
                                }
                                var fills = {
                                    defaultFill: "#d3d3d3"
                                };
                                if (that.countryColors) {
                                    for (var i = 0; i < that.countryColors.length; i++) {
                                        fills["HIGH" + i] = that.countryColors[i];
                                    }
                                }
                                try {
                                    worldContainer.innerHTML = "";
                                    if (worldContainer.style) {
                                        if (bAnimated) {
                                            worldContainer.style.visibility = "hidden";
                                        }
                                    }
                                    that.worldMap = new Datamap({
                                        element: worldContainer,
                                        projection: 'mercator',
                                        height: height - 20,
                                        width: width - 20,
                                        fills: fills,
                                        // Array --> 'Countrykey' : { fillKey : 'Rate of importance'}
                                        data: that.countryKeyData,
                                        geographyConfig: {
                                            popupOnHover: true, /*false*/
                                            highlightOnHover: true,
                                            highlightFillColor: Colors.dashboardColor,
                                            highlightBorderColor: hiliBorderColor
                                        },
                                        done: function (datamap) {
                                            var allSubunits = datamap.svg.selectAll('.datamaps-subunit');
                                            allSubunits.on('click', function (geography) {
                                                var landId = that.isotoInitlandId(geography.id);
                                                that.setRestriction({
                                                    INITLandID: landId
                                                });
                                                AppData.setRecordId("Kontakt", null);
                                                WinJS.Promise.timeout(0).then(function () {
                                                    Application.navigateById("contact");
                                                });
                                            });
                                            if (bAnimated) {
                                                WinJS.Promise.timeout(50).then(function () {
                                                    if (worldContainer.style) {
                                                        worldContainer.style.visibility = "";
                                                    }
                                                    WinJS.UI.Animation.enterContent(worldContainer).done(function () {
                                                        var fragmentControl = fragmentElement.winControl;
                                                        if (fragmentControl && fragmentElement.updateLayout) {
                                                            fragmentControl.prevWidth = 0;
                                                            fragmentControl.prevHeight = 0;
                                                            fragmentControl.updateLayout.call(fragmentControl, fragmentElement);
                                                        }
                                                    });
                                                });
                                            } else {
                                                var fragmentControl = fragmentElement.winControl;
                                                if (fragmentControl && fragmentElement.updateLayout) {
                                                    fragmentControl.prevWidth = 0;
                                                    fragmentControl.prevHeight = 0;
                                                    fragmentControl.updateLayout.call(pageControl, fragmentElement);
                                                }
                                            }
                                        }
                                    });
                                } catch (ex) {
                                    Log.print(Log.l.error, "exception occurred: " + ex.message);
                                }
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.worldChart = worldChart;

            var setRestriction = function (restriction) {
                AppData.setRestriction("Kontakt", restriction);
            }
            this.setRestriction = setRestriction;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                
            };

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
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
                    return StartCountrys.reportLand.select(function (json) {
                        Log.print(Log.l.trace, "reportLand: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var color = Colors.dashboardColor;
                            that.countryKeyData = {};
                            // store result for next use
                            var countryresult = json.d.results;
                            for (var ci = 0; ci < countryresult.length; ci++) {
                                if (countryresult[ci].Land === null) {
                                    countryresult[ci].Land = getResourceText("reporting.nocountry");
                                }
                                if (countryresult[ci].Land) {
                                    that.countryColors[ci] = color;
                                    var rgbColor = Colors.hex2rgb(color);
                                    var hsvColor = Colors.rgb2hsv(rgbColor);
                                    hsvColor.s *= 0.8;
                                    hsvColor.v /= 0.8;
                                    rgbColor = Colors.hsv2rgb(hsvColor);
                                    color = Colors.rgb2hex(rgbColor);
                                }
                                var isoCode = countryresult[ci].Alpha3_ISOCode;
                                if (isoCode) {
                                    that.countryKeyData[isoCode] = {
                                        fillKey: "HIGH" + ci
                                    }
                                }
                            }
                            that.worldMapHeight = 0;
                            that.worldChart(true);
                        }

                    }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        return WinJS.Promise.as();
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
                Log.print(Log.l.trace, "Data loaded");
                that.setWorldbuttonStyle();
            });
            Log.ret(Log.l.trace);
        }, {
        })
    });
})();