// controller for page: settings
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/colors.js" />
/// <reference path="~/www/lib/convey/scripts/colorPicker.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js"/>
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/settings/settingsService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Settings", {
        Controller: WinJS.Class.derive(Application.Controller, function controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Settings.Controller.");
            Application.Controller.apply(this, [pageElement, {
                //  InitColor: { colorhx: 0, colorTitle: ""}
            }, commandList]);
            this.colorSet = null;
            var that = this;
            var individualColorToggle = pageElement.querySelector(".individualColor");

            this.dispose = function () {
                var colorContainers = pageElement.querySelectorAll(".color_container");
                if (colorContainers) {
                    for (var i = 0; i < colorContainers.length; i++) {
                        var colorContainer = colorContainers[i];
                        if (colorContainer && colorContainer.colorPicker &&
                            typeof colorContainer.colorPicker._dispose === "function") {
                            colorContainer.colorPicker._dispose();
                            colorContainer.colorPicker = null;
                        }
                    }
                }
            }

            var createColorPicker = function (colorProperty, doRecreate) {
                Log.call(Log.l.trace, "Settings.Controller.");
                that.binding.generalData[colorProperty] = Colors[colorProperty];
                var id = "#" + colorProperty + "_picker";
                var element = pageElement.querySelector(id);
                if (element) {
                    var colorPicker = new ColorPicker.ColorPickerClass(
                        element, 10, 28,
                        Colors[colorProperty],
                        function (color) { // callback function for change of color property!
                            if (this.triggerElement) {
                                if (this.triggerElement && this.triggerElement.style) {
                                    if (colorProperty === "textColor") {
                                        this.triggerElement.style.borderColor = color;
                                    } else {
                                        this.triggerElement.style.borderColor = Colors.textColor;
                                    }
                                }
                            }
                            that.changeColorSetting(colorProperty, color);
                        }
                    );
                    var triggerElement = colorPicker.triggerElement;
                    if (triggerElement && triggerElement.style) {
                        triggerElement.style.borderColor = Colors.textColor;
                    }
                }
                Log.ret(Log.l.trace);
            };
            this.createColorPicker = createColorPicker;

            var changeColorSetting = function (colorProperty, color) {
                Log.call(Log.l.trace, "Settings.Controller.", "colorProperty=" + colorProperty + " color=" + color);
                var pValue = color.replace("#", "");
                var pOptionTypeId = null;
                switch (colorProperty) { //event.currentTarget.id
                    case "accentColor":
                        pOptionTypeId = 11;
                        break;
                    case "backgroundColor":
                        pOptionTypeId = 12;
                        break;
                    case "navigationColor":
                        pOptionTypeId = 13;
                        break;
                    case "textColor":
                        pOptionTypeId = 14;
                        break;
                    case "labelColor":
                        pOptionTypeId = 15;
                        break;
                    case "tileTextColor":
                        pOptionTypeId = 16;
                        break;
                    case "tileBackgroundColor":
                        pOptionTypeId = 17;
                        break;
                    default:
                        // defaultvalues
                }
                if (pOptionTypeId) {
                    AppData.call("PRC_SETVERANSTOPTION",
                        {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            pOptionTypeID: pOptionTypeId,
                            pValue: pValue
                        },
                        function (json) {
                            Log.print(Log.l.info, "call success! ");
                        },
                        function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                    that.applyColorSetting(colorProperty, color);
                    //Colors.updateColors();
                }
            }
            this.changeColorSetting = changeColorSetting;

            var applyColorSetting = function (colorProperty, color) {
                Log.call(Log.l.trace, "Settings.Controller.", "colorProperty=" + colorProperty + " color=" + color);
                Colors[colorProperty] = color;
                that.binding.generalData[colorProperty] = color;

                switch (colorProperty) {
                    case "accentColor":
                        that.createColorPicker("backgroundColor");
                        that.createColorPicker("textColor");
                        that.createColorPicker("labelColor");
                        that.createColorPicker("tileTextColor");
                        that.createColorPicker("tileBackgroundColor");
                        that.createColorPicker("navigationColor");
                        // fall through...
                    case "navigationColor":
                        AppBar.loadIcons();
                        NavigationBar.groups = Application.navigationBarGroups;
                        break;
                }
                Log.ret(Log.l.trace);
            }
            this.applyColorSetting = applyColorSetting;

            // create all color pickers!
            this.createColorPicker("accentColor", true);
            this.createColorPicker("backgroundColor");
            this.createColorPicker("textColor");
            this.createColorPicker("labelColor");
            this.createColorPicker("tileTextColor");
            this.createColorPicker("tileBackgroundColor");
            this.createColorPicker("navigationColor");

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    } else {
                        Application.navigateById("start", event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickIsDarkTheme: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.isDarkTheme = toggle.checked;
                        }
                        WinJS.Promise.timeout(0).then(function () {
                            Colors.isDarkTheme = that.binding.generalData.isDarkTheme;
                            Log.print(Log.l.trace, "isDarkTheme=" + Colors.isDarkTheme);
                            that.createColorPicker("backgroundColor");
                            that.createColorPicker("textColor");
                            that.createColorPicker("labelColor");
                            that.createColorPicker("tileTextColor");
                            that.createColorPicker("tileBackgroundColor");
                            that.createColorPicker("navigationColor");
                        });
                        var pValue = "0";
                        if (toggle.checked) {
                            pValue = "1";
                        }

                        AppData.call("PRC_SETVERANSTOPTION", {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            pOptionTypeID: 18,
                            pValue: pValue
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                        });

                    }
                    Log.ret(Log.l.trace);
                },
                clickIndividualColors: function (event) {
                    var restoreDefault = false;
                    // var pValue = "0";
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            if (!toggle.checked) {
                                restoreDefault = true;
                                //    pValue = "1";
                            } else {
                                that.loadData();
                            }
                            that.binding.generalData.individualColors = toggle.checked;
                        }
                        AppData._persistentStates.individualColors = that.binding.generalData.individualColors;
                        if (restoreDefault) {
                            WinJS.Promise.timeout(0).then(function () {
                                AppData._persistentStates.individualColors = false;
                                /*if (!(AppData._persistentStates.individualColors)) {
                                    //delete AppData.persistentStatesDefaults.colorSettings;
                                    var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                                    that.createColorPicker("accentColor", true);
                                    that.createColorPicker("backgroundColor");
                                    that.createColorPicker("textColor");
                                    that.createColorPicker("labelColor");
                                    that.createColorPicker("tileTextColor");
                                    that.createColorPicker("tileBackgroundColor");
                                    that.createColorPicker("navigationColor");
                                } else {*/
                                    AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                                    var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                                    that.createColorPicker("accentColor", true);
                                    that.createColorPicker("backgroundColor");
                                    that.createColorPicker("textColor");
                                    that.createColorPicker("labelColor");
                                    that.createColorPicker("tileTextColor");
                                    that.createColorPicker("tileBackgroundColor");
                                    that.createColorPicker("navigationColor");
                                //} 

                                AppBar.loadIcons();
                                NavigationBar.groups = Application.navigationBarGroups;
                            });
                        }

                        Application.pageframe.savePersistentStates();
                        var pValue = "0";
                        if (toggle.checked) {
                            pValue = "1";
                        }
                        AppData.call("PRC_SETVERANSTOPTION",
                                {
                                    pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                                    pOptionTypeID: 10,
                                    pValue: pValue
                                },
                                function (json) {
                                    Log.print(Log.l.info, "call success! ");
                                },
                                function (error) {
                                    Log.print(Log.l.error, "call error");
                                });
                        //   that.applyColorSetting(colorProperty, color);
                        //Colors.updateColors();
                    }

                    Log.ret(Log.l.trace);
                },
                clickShowAppBkg: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.showAppBkg = toggle.checked;
                            if (AppBar.notifyModified) {
                                AppData._persistentStates.showAppBkg = that.binding.generalData.showAppBkg;
                                Log.print(Log.l.trace, "showAppBkg=" + AppData._persistentStates.showAppBkg);
                            }
                        }
                        WinJS.Promise.timeout(0).then(function () {
                            var appBkg = document.querySelector(".app-bkg");
                            if (appBkg && appBkg.style) {
                                appBkg.style.visibility = AppData._persistentStates.showAppBkg ? "visible" : "hidden";
                            }
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                changedInputBorder: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var range = event.currentTarget;
                        if (range) {
                            that.binding.generalData.inputBorder = range.value;
                        }
                        WinJS.Promise.timeout(0).then(function () {
                            Colors.inputBorder = that.binding.generalData.inputBorder;
                            Log.print(Log.l.trace, "inputBorder=" + Colors.inputBorder);
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                ChangeColorPicker: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    var colorProperty = event.currentTarget.id;
                    var pickerParent = pageElement.querySelector("#" + colorProperty + "_picker");
                    var childElement = pageElement.querySelector("#" + colorProperty);
                    var color = childElement.value;
                    // HIER -> überprüfe ob Farbzahl gültig ist 
                    // hier raus und in den resultconverter
                    function isHexaColor(sNum) {
                        return (typeof sNum === "string") && (sNum.length === 6 || sNum.length === 3)
                               && !isNaN(parseInt(sNum, 16));
                    };
                    var colorcontainer = pickerParent.querySelector(".color_container");
                    var colorPicker = colorcontainer.colorPicker;
                    if (pickerParent) {
                        if (colorcontainer) {
                            if (colorPicker && isHexaColor(color.replace("#", ""))) {
                                colorPicker.color = color;
                            }
                        }
                    }
                    if (isHexaColor(color.replace("#", ""))) {
                        that.changeColorSetting(colorProperty, color);
                    } else {
                        that.changeColorSetting(colorProperty, colorPicker.color);
                        childElement.value = colorPicker.color;
                    }
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function () {
                    // always enabled!
                    return false;
                }
            }
            var resultConverter = function (item, index) {
                if (item.INITOptionTypeID > 10) {
                    switch (item.INITOptionTypeID) {
                        case 11:
                            item.colorPickerId = "accentColor";
                            break;
                        case 12:
                            item.colorPickerId = "backgroundColor";
                            break;
                        case 13:
                            item.colorPickerId = "navigationColor";
                            break;
                        case 14:
                            item.colorPickerId = "textColor";
                            break;
                        case 15:
                            item.colorPickerId = "labelColor";
                            break;
                        case 16:
                            item.colorPickerId = "tileTextColor";
                            break;
                        case 17:
                            item.colorPickerId = "tileBackgroundColor";
                            break;
                        case 18:
                            if (item.LocalValue === "1") {
                                that.binding.generalData.isDarkTheme = true;
                            } else {
                                that.binding.generalData.isDarkTheme = false;
                            }
                            Colors.isDarkTheme = that.binding.generalData.isDarkTheme;
                            break;
                        case 20:
                            item.pageProperty = "questionnaire";
                            if (item.LocalValue === "0") {
                                AppData._persistentStates.hideQuestionnaire = true;
                            } else {
                                AppData._persistentStates.hideQuestionnaire = false;
                            }
                            break;
                        case 21:
                            item.pageProperty = "sketch";
                            if (item.LocalValue === "0") {
                                AppData._persistentStates.hideSketch = true;
                            } else {
                                AppData._persistentStates.hideSketch = false;
                            }
                            break;
                        default:
                            // defaultvalues
                    }

                    if (item.colorPickerId) {
                        var childElement = pageElement.querySelector("#" + item.colorPickerId);
                        item.colorValue = "#" + item.LocalValue;
                        if (childElement) {
                            childElement.value = item.colorValue;
                        }
                        var pickerParent = pageElement.querySelector("#" + item.colorPickerId + "_picker");
                        if (pickerParent) {
                            var colorcontainer = pickerParent.querySelector(".color_container");
                            if (colorcontainer) {
                                var colorPicker = colorcontainer.colorPicker;
                                if (colorPicker) {
                                    colorPicker.color = item.colorValue;

                                }
                            }
                        }
                        that.applyColorSetting(item.colorPickerId, item.colorValue);
                    }
                } else if (item.INITOptionTypeID === 10) {
                    item.colorPickerId = "individualColors";
                    // var childElement = pageElement.querySelector("#" + item.colorPickerId);
                    if (item.LocalValue === "1")
                        that.binding.generalData.individualColors = true;
                    else {
                        var restoreDefault = false;
                        Log.call(Log.l.trace, "Settings.Controller.");
                        //  if (event.currentTarget && AppBar.notifyModified) {
                        //var toggle = event.currentTarget.winControl;
                        if (individualColorToggle) {
                            if (!individualColorToggle.checked) {
                                restoreDefault = true;
                            }
                            that.binding.generalData.individualColors = individualColorToggle.checked;
                        }
                        AppData._persistentStates.individualColors = that.binding.generalData.individualColors;
                        if (restoreDefault) {
                            WinJS.Promise.timeout(0).then(function () {
                                AppData._persistentStates.individualColors = false;
                                AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                                var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                                that.createColorPicker("accentColor", true);
                                that.createColorPicker("backgroundColor");
                                that.createColorPicker("textColor");
                                that.createColorPicker("labelColor");
                                that.createColorPicker("tileTextColor");
                                that.createColorPicker("tileBackgroundColor");
                                that.createColorPicker("navigationColor");
                                AppBar.loadIcons();
                                NavigationBar.groups = Application.navigationBarGroups;
                            });
                        }
                        Application.pageframe.savePersistentStates();
                    }
                }
                if (item.pageProperty) {
                    if (item.LocalValue === "1") {
                        NavigationBar.enablePage(item.pageProperty);
                    } else if (item.LocalValue === "0") {
                        NavigationBar.disablePage(item.pageProperty);
                    }
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function (complete, error) {
                AppData._persistentStates.hideQuestionnaire = false;
                AppData._persistentStates.hideSketch = false;
                return Settings.CR_VERANSTOPTION_ODataView.select(function (json) {
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.print(Log.l.trace, "Reporting: success!");
                    // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response

                    if (json && json.d) {
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverter(item, index);
                        });

                    }
                    for (var i = 0; i < Application.navigationBarGroups.length; i++) {
                        if (Application.navigationBarGroups[i].id === "events") {
                            if (individualColorToggle) {
                                if (Application.navigationBarGroups[i].disabled === true) {
                                    individualColorToggle.style.display = "none";
                                } else {
                                    individualColorToggle.style.display = "";
                                }
                            }
                            break;
                        }
                    }
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.setErrorMsg(that.binding, errorResponse);
                }).then(function () {
                    Colors.updateColors();
                    return WinJS.Promise.as();
                });

            };
            this.loadData = loadData;
            AppData.setErrorMsg(this.binding);

            that.processAll().then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                return that.loadData();
            });
            Log.ret(Log.l.trace);
        }),
        getInputBorderName: function (level) {
            Log.call(Log.l.trace, "Settings.", "level=" + level);
            var key = "border" + level;
            Log.print(Log.l.trace, "key=" + key);
            var resources = getResourceTextSection("settings");
            var name = resources[key];
            Log.ret(Log.l.trace, "name=" + name);
            return name;
        }
    });
})();

