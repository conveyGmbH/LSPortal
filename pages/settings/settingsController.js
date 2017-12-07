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
                showSettingsFlag: false
            }, commandList]);
            this.colorSet = null;
            var that = this;

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

            var createColorPicker = function (colorProperty) {
                Log.call(Log.l.trace, "Settings.Controller.");
                if (that.binding && that.binding.generalData) {
                    that.binding.generalData[colorProperty] = Colors[colorProperty];
                }
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
                if (color) {
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
                        Application.pageframe.savePersistentStates();
                        AppData.call("PRC_SETVERANSTOPTION", {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            pOptionTypeID: pOptionTypeId,
                            pValue: pValue
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                        AppData.applyColorSetting(colorProperty, color);
                        WinJS.Promise.timeout(0).then(function () {
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
                        });
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.changeColorSetting = changeColorSetting;

            // create all color pickers!
            this.createColorPicker("accentColor");
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
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.isDarkTheme = toggle.checked;
                            Log.print(Log.l.trace, "isDarkTheme=" + toggle.checked);
                            WinJS.Promise.timeout(0).then(function () {
                                Colors.isDarkTheme = toggle.checked;
                                that.createColorPicker("backgroundColor");
                                that.createColorPicker("textColor");
                                that.createColorPicker("labelColor");
                                that.createColorPicker("tileTextColor");
                                that.createColorPicker("tileBackgroundColor");
                                that.createColorPicker("navigationColor");
                                AppBar.loadIcons();
                                NavigationBar.groups = Application.navigationBarGroups;
                            });
                            Application.pageframe.savePersistentStates();
                            var pValue;
                            if (toggle.checked) {
                                pValue = "1";
                            } else {
                                pValue = "0";
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
                    }
                    Log.ret(Log.l.trace);
                },
                clickIndividualColors: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            if (!toggle.checked && AppData._persistentStates.individualColors) {
                                WinJS.Promise.timeout(0).then(function () {
                                    AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                                    var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                                    that.createColorPicker("accentColor");
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
                            that.binding.generalData.individualColors = toggle.checked;
                            AppData._persistentStates.individualColors = toggle.checked;
                            Application.pageframe.savePersistentStates();
                            var pValue;
                            if (toggle.checked) {
                                pValue = "1";
                            } else {
                                pValue = "0";
                            }
                            AppData.call("PRC_SETVERANSTOPTION", {
                                pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                                pOptionTypeID: 10,
                                pValue: pValue
                            }, function (json) {
                                Log.print(Log.l.info, "call success! ");
                            }, function (error) {
                                Log.print(Log.l.error, "call error");
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickShowAppBkg: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.showAppBkg = toggle.checked;
                            AppData._persistentStates.showAppBkg = toggle.checked;
                            Log.print(Log.l.trace, "showAppBkg=" + AppData._persistentStates.showAppBkg);
                            WinJS.Promise.timeout(0).then(function () {
                                var appBkg = document.querySelector(".app-bkg");
                                if (appBkg && appBkg.style) {
                                    appBkg.style.visibility = AppData._persistentStates.showAppBkg ? "visible" : "hidden";
                                }
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changedInputBorder: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        var range = event.currentTarget;
                        if (range) {
                            that.binding.generalData.inputBorder = range.value;
                            AppData._persistentStates.inputBorder = range.value;
                            Log.print(Log.l.trace, "inputBorder=" + AppData._persistentStates.inputBorder);
                            WinJS.Promise.timeout(0).then(function () {
                                Colors.inputBorder = AppData._persistentStates.inputBorder;
                            });
                        }
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
                var property = AppData.getPropertyFromInitoptionTypeID(item);
                
                if (property && property !== "individualColors" && (!item.pageProperty) && item.LocalValue) {
                    var childElement = pageElement.querySelector("#" + property);
                    item.colorValue = "#" + item.LocalValue;
                    if (childElement) {
                        childElement.value = item.colorValue;
                    }
                    var pickerParent = pageElement.querySelector("#" + property + "_picker");
                    if (pickerParent) {
                        var colorcontainer = pickerParent.querySelector(".color_container");
                        if (colorcontainer) {
                            var colorPicker = colorcontainer.colorPicker;
                            if (colorPicker) {
                                colorPicker.color = item.colorValue;
                            }
                        }
                    }
                    AppData.applyColorSetting(property, item.colorValue);
                } else if (property === "individualColors") {
                    if (that.binding && that.binding.generalData) {
                        if (item.LocalValue === "1") {
                            that.binding.generalData.individualColors = true;
                        } else if (that.binding.generalData.individualColors) {
                            that.binding.generalData.individualColors = false;
                            WinJS.Promise.timeout(0).then(function () {
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

                    if (json && json.d && json.d.results && json.d.results.length > 0) {
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverter(item, index);
                        });
                        Application.pageframe.savePersistentStates();
                    }
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.setErrorMsg(that.binding, errorResponse);
                }).then(function () {
                    for (var i = 0; i < Application.navigationBarGroups.length; i++) {
                        if (Application.navigationBarGroups[i].id === "events") {
                            if (!Application.navigationBarGroups[i].disabled) {
                                if (that.binding) {
                                    that.binding.showSettingsFlag = true;
                                }
                            }
                            break;
                        }
                    }
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

