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
                showSettingsFlag: false,
                themeId: 2,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com"
            }, commandList]);

            var themeSelect = pageElement.querySelector("#themeSelect");

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

            var checkColorLimit = function (color, isBkg) {
                if (Colors.isDarkTheme) {
                    var rgbColor = Colors.hex2rgb(color);
                    var hsvColor = Colors.rgb2hsv(rgbColor);
                    if (isBkg && hsvColor.v < 50 ||
                        !isBkg && hsvColor.v > 50) {
                        rgbColor = Colors.hsv2rgb(
                            hsvColor.h,
                            hsvColor.s,
                            100 - hsvColor.v
                        );
                        color = Colors.rgb2hex(rgbColor.r, rgbColor.g, rgbColor.b);
                    }
                }
                return color;
            };
            var createColorPicker = function (colorProperty) {
                Log.call(Log.l.trace, "Settings.Controller.");
                var color = Colors[colorProperty];
                switch (colorProperty) {
                    case "backgroundColor":
                        color = checkColorLimit(color, true);
                        break;
                    case "navigationColor":
                        color = checkColorLimit(color, false);
                        break;
                    case "dashboardColor":
                        color = checkColorLimit(color, false);
                        break;
                }
                if (that.binding && that.binding.generalData &&
                    that.binding.generalData.colorSettings) {
                    that.binding.generalData.colorSettings[colorProperty] = color;
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
                            color = checkColorLimit(color, true);
                            break;
                        case "navigationColor":
                            pOptionTypeId = 13;
                            color = checkColorLimit(color, false);
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
                        case "dashboardColor":
                            pOptionTypeId = 46;
                            color = checkColorLimit(color, false);
                            break;
                        default:
                        // defaultvalues
                    }
                    if (pOptionTypeId) {
                        AppData.call("PRC_SETVERANSTOPTION", {
                            pIsForMandant: that.binding.generalData.mandantOption ? 1 : 0,
                            pVeranstaltungID: that.binding.generalData.mandantOption ? 0 : AppData.getRecordId("Veranstaltung"),
                            pOptionTypeID: pOptionTypeId,
                            pValue: pValue
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                            if (that.binding && that.binding.generalData &&
                                that.binding.generalData.colorSettings) {
                                that.binding.generalData.colorSettings[colorProperty] = color;
                            }
                            Application.pageframe.savePersistentStates();
                            AppData.applyColorSetting(colorProperty, color);
                            WinJS.Promise.timeout(0).then(function () {
                                if (colorProperty === "accentColor") {
                                    that.createColorPicker("backgroundColor");
                                    that.createColorPicker("textColor");
                                    that.createColorPicker("labelColor");
                                    that.createColorPicker("tileTextColor");
                                    that.createColorPicker("tileBackgroundColor");
                                    that.createColorPicker("navigationColor");
                                    that.createColorPicker("dashboardColor");
                                }
                            });
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                            that.loadData();
                        });
                    }
                }
                Log.ret(Log.l.trace);
                return color;
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
            this.createColorPicker("dashboardColor");

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
                        Application.navigateById(Application.startPageId, event);
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
                changedTheme: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        var themeId = event.currentTarget.value;
                        if (typeof themeId === "string") {
                            themeId = parseInt(themeId);
                        }
                        if (themeId === 2 && typeof window.matchMedia === "function") {
                            that.binding.generalData.manualTheme = false;
                            var prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");
                            that.binding.generalData.isDarkTheme = prefersColorSchemeDark && prefersColorSchemeDark.matches;
                        } else {
                            that.binding.generalData.manualTheme = true;
                            that.binding.generalData.isDarkTheme = (themeId === 1);
                        }
                        Log.print(Log.l.trace, "isDarkTheme=" + that.binding.generalData.isDarkTheme +
                            " manualTheme=" + that.binding.generalData.manualTheme);
                        var colors = Colors.updateColors();
                        var promise = (colors && colors._loadCssPromise) || WinJS.Promise.timeout(0);
                        promise.then(function () {
                            Colors.isDarkTheme = that.binding.generalData.isDarkTheme;
                            that.createColorPicker("backgroundColor");
                            that.createColorPicker("textColor");
                            that.createColorPicker("labelColor");
                            that.createColorPicker("tileTextColor");
                            that.createColorPicker("tileBackgroundColor");
                            that.createColorPicker("navigationColor");
                            that.createColorPicker("dashboardColor");
                            AppBar.loadIcons();
                            NavigationBar.groups = Application.navigationBarGroups;
                        });
                        Application.pageframe.savePersistentStates();
                        var pValue;
                        if (that.binding.generalData.isDarkTheme) {
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
                    Log.ret(Log.l.trace);
                },
                clickMandantOption: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    var toggle = event.currentTarget.winControl;
                    that.binding.generalData.mandantOption = toggle.checked;
                    //Application.pageframe.savePersistentStates();
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
                                    var dashboardColorType = 0;
                                    if (AppData._userData.VeranstaltungTyp === 0) {
                                        //if(AppData._userData.isSupreme === "1")
                                        switch (AppData._userData.IsSupreme) {
                                            case "1":
                                                // type 3 
                                                dashboardColorType = 3;
                                                break;
                                            case "2":
                                                // type 4
                                                dashboardColorType = 4;
                                                break;
                                            default:
                                        }
                                    }
                                    var colorSettings =
                                        AppData.persistentStatesDefaults.colorSettingsDefaults[dashboardColorType ||
                                        AppData._userData.VeranstaltungTyp] ||
                                        AppData.persistentStatesDefaults.colorSettingsDefaults[0];
                                    if (colorSettings) {
                                        AppData.persistentStatesDefaults.colorSettings = copyByValue(colorSettings);
                                    }
                                    var colors = new Colors.ColorsClass(colorSettings);
                                    var promise = colors._loadCssPromise || WinJS.Promise.timeout(0);
                                    promise.then(function () {
                                        that.createColorPicker("accentColor");
                                        that.createColorPicker("backgroundColor");
                                        that.createColorPicker("textColor");
                                        that.createColorPicker("labelColor");
                                        that.createColorPicker("tileTextColor");
                                        that.createColorPicker("tileBackgroundColor");
                                        that.createColorPicker("navigationColor");
                                        that.createColorPicker("dashboardColor");
                                        AppBar.loadIcons();
                                        NavigationBar.groups = Application.navigationBarGroups;
                                    });
                                });
                            }
                            that.binding.generalData.individualColors = toggle.checked;
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
                            Log.print(Log.l.trace, "showAppBkg=" + toggle.checked);
                            WinJS.Promise.timeout(0).then(function () {
                                var appBkg = document.querySelector(".app-bkg");
                                if (appBkg && appBkg.style) {
                                    appBkg.style.visibility = that.binding.generalData.showAppBkg ? "visible" : "hidden";
                                }
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickInputBorderBottom: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.generalData.inputBorderBottom = toggle.checked;
                            Log.print(Log.l.trace, "inputBorderBottom=" + toggle.checked);
                            Colors.updateColors();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                ChangeIconStrokeWidth: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        that.binding.generalData.iconStrokeWidth = event.currentTarget.value;
                        Log.print(Log.l.trace, "iconStrokeWidth=" + event.currentTarget.value);
                        WinJS.Promise.timeout(0).then(function () {
                            AppBar.loadIcons();
                            NavigationBar.groups = Application.navigationBarGroups;
                            Application.pageframe.savePersistentStates();
                        });
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
                            Log.print(Log.l.trace, "inputBorder=" + range.value);
                            WinJS.Promise.timeout(0).then(function () {
                                Colors.inputBorder = that.binding.generalData.inputBorder;
                                Colors.changeCSS(".color_picker_trigger", "border-width", that.binding.generalData.inputBorder + "px");
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changedInputBorderRadius: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget && AppBar.notifyModified &&
                        that.binding && that.binding.generalData) {
                        var range = event.currentTarget;
                        if (range) {
                            that.binding.generalData.inputBorderRadius = range.value;
                            Log.print(Log.l.trace, "inputBorderRadius=" + range.value);
                            WinJS.Promise.timeout(0).then(function () {
                                Colors.inputBorderRadius = that.binding.generalData.inputBorderRadius;
                                Colors.changeCSS(".color_picker_trigger", "border-radius", that.binding.generalData.inputBorderRadius + "px");
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                ChangeColorPicker: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (event.currentTarget) {
                        var colorProperty = event.currentTarget.id;
                        var childElement = pageElement.querySelector("#" + colorProperty);
                        if (childElement) {
                            var colorPicker = null;
                            var color = childElement.value || "";
                            // HIER -> überprüfe ob Farbzahl gültig ist
                            // hier raus und in den resultconverter
                            function isHexaColor(sNum) {
                                return (typeof sNum === "string") && (sNum.length === 6 || sNum.length === 3)
                                    && !isNaN(parseInt(sNum, 16));
                            };
                            var pickerParent = pageElement.querySelector("#" + colorProperty + "_picker");
                            if (pickerParent) {
                                var colorcontainer = pickerParent.querySelector(".color_container");
                                if (colorcontainer) {
                                    colorPicker = colorcontainer.colorPicker;
                                    if (colorPicker && isHexaColor(color.replace("#", ""))) {
                                        colorPicker.color = color;
                                    }
                                }
                            }
                            if (color && isHexaColor(color.replace("#", ""))) {
                                that.changeColorSetting(colorProperty, color);
                            } else if (colorPicker && colorPicker.color) {
                                that.changeColorSetting(colorProperty, colorPicker.color);
                            }
                        }
                    }
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
                    item.colorValue = "#" + item.LocalValue;
                    if (that.binding && that.binding.generalData &&
                        that.binding.generalData.colorSettings) {
                        that.binding.generalData.colorSettings[property] = item.colorValue;
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
                    if (property === "accentColor") {
                        WinJS.Promise.timeout(0).then(function () {
                            that.createColorPicker("accentColor", true);
                            that.createColorPicker("backgroundColor");
                            that.createColorPicker("textColor");
                            that.createColorPicker("labelColor");
                            that.createColorPicker("tileTextColor");
                            that.createColorPicker("tileBackgroundColor");
                            that.createColorPicker("navigationColor");
                            that.createColorPicker("dashboardColor");
                        });
                    }
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
                                that.createColorPicker("dashboardColor");
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
                var ret = new WinJS.Promise.as().then(function () {
                    if (themeSelect && themeSelect.winControl) {
                        var themeSelectList = new WinJS.Binding.List([
                            { themeId: 0, label: that.binding.generalData.light },
                            { themeId: 1, label: that.binding.generalData.dark },
                            { themeId: 2, label: that.binding.generalData.system }
                        ]);
                        themeSelect.winControl.data = themeSelectList;
                        that.binding.themeId = that.binding.generalData.manualTheme ?
                            (that.binding.generalData.isDarkTheme ? 1 : 0) : 2;
                    }
                    return WinJS.Promise.as();
                }).then(function () {
                    return AppData.getOptions(function (json) {
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            if (typeof that.resultConverter === "function") {
                                that.resultConverter(item, index);
                            }
                        });
                        Application.pageframe.savePersistentStates();
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                            VeranstaltungID: 0, //AppData.getRecordId("Veranstaltung")
                            MandantWide: 0,
                            IsForApp: 0
                        });
                    /*return Settings.CR_VERANSTOPTION_ODataView.select(function (json) {
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
                    }, { VeranstaltungID: AppData.getRecordId("Veranstaltung") });*/
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
                    var colors = Colors.updateColors();
                    return (colors && colors._loadCssPromise) || WinJS.Promise.as();
                });
                return ret;
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

