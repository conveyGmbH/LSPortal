// controller for page: contact
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/appHeader/appHeaderService.js" />


(function () {
    "use strict";

    var namespaceName = "AppHeader";

    WinJS.Namespace.define("AppHeader", {
        controller: null
    });
    WinJS.Namespace.define("AppHeader", {
        Controller: WinJS.Class.define(function Controller(pageElement) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            this.element = pageElement.querySelector("#appHeaderController.data-container");
            if (this.element) {
                this.element.winControl = this;
            }
            this.pageData.publishFlag = false;
            this.pageData.errorFlag = false;
            this.pageData.userData = AppData._userData;
            this.pageData.genDataFlag = AppData._userData && AppData._userData.IsCustomerAdmin || AppData._userData.IsMidiAdmin;
            this.pageData.isSiteAdmin = AppData._userData.SiteAdmin? true : false;
            this.pageData.userMessagesDataCount = AppData._userMessagesData.MessagesCounter;
            this.pageData.photoData = null;
            this.pageData.showNameInHeader = !!AppData._persistentStates.showNameInHeader;
            this.pageData.loadUserImage = true;
            this.pageData.ServerName = "";

            AppHeader.controller = this;
            var that = this;
            
            // First, we call WinJS.Binding.as to get the bindable proxy object
            this.binding = WinJS.Binding.as(this.pageData);

            var getPublishFlag = function () {
                Log.call(Log.l.trace, "Reporting.Controller.");
                if (AppData._userData && (AppData._userData.IsCustomerAdmin || AppData._userData.SiteAdmin || AppData._userData.IsMidiAdmin)) {
                    var master = Application.navigator.masterControl;
                    if (master &&
                        master.controller &&
                        master.controller.binding &&
                        typeof master.controller.binding.publishFlag !== "undefined") {
                        that.binding.publishFlag = master.controller.binding.publishFlag;
                    } else {
                        if (AppData.generalData) {
                            that.binding.publishFlag = AppData.generalData.publishFlag;
                        }
                    }
                } else {
                    if (AppData.generalData) {
                        that.binding.publishFlag = !AppHeader.controller.binding.userData.IsNoAdminUser && AppData.generalData.publishFlag;
                    }
                }
                var publishFlag = that.binding.publishFlag;
                Log.ret(Log.l.trace, publishFlag);
                return publishFlag;
            }
            this.getPublishFlag = getPublishFlag;

            // show business card photo
            var userImageContainer = pageElement.querySelector(".user-image-container");
            var showPhoto = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var userImg;
                if (that.binding.photoData) {
                    if (userImageContainer) {
                        userImg = new Image();
                        userImg.id = "userImg";
                        WinJS.Utilities.addClass(userImg, "user-photo");
                        userImg.src = "data:image/jpeg;base64," + that.binding.photoData;
                        userImageContainer.appendChild(userImg);
                        if (userImageContainer.childElementCount > 2) {
                            var oldElement = userImageContainer.firstElementChild.nextElementSibling;
                            if (oldElement) {
                                oldElement.parentNode.removeChild(oldElement);
                                oldElement.innerHTML = "";
                            }
                        }
                        WinJS.Promise.timeout(50).then(function () {
                            if (userImg && userImg.style && userImg.naturalWidth && userImg.naturalHeight) {
                                var width = userImg.naturalWidth;
                                var height = userImg.naturalHeight;
                                if (width > height) {
                                    var left = 20 * (1 - (userImg.naturalWidth / userImg.naturalHeight));
                                    userImg.style.width = "auto";
                                    userImg.style.height = "40px";
                                    userImg.style.left = left + "px";
                                    userImg.style.top = "-32px";
                                } else {
                                    var top = -32 + 20 * (1 - (userImg.naturalHeight / userImg.naturalWidth));
                                    userImg.style.width = "40px";
                                    userImg.style.height = "auto";
                                    userImg.style.left = "0";
                                    userImg.style.top = top + "px";
                                }
                            }
                        });
                    }
                    AppBar.triggerDisableHandlers();
                } else {
                    userImg = pageElement.querySelector("#userImg");
                    if (userImg) {
                        userImg.parentNode.removeChild(userImg);
                    }
                }
                Log.ret(Log.l.trace);
            }

            var setLogo = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var appLogoContainer = pageElement.querySelector(".app-logo-container");
                if (appLogoContainer) {
                    NavigationBar._logoLoaded = true;
                    var rgb = Colors.hex2rgb(Colors.navigationColor);
                    var rgbStr = (rgb.r + rgb.g + rgb.b) / 3 >= 128 ? "#000000" : "#ffffff";
                    // load the image file
                    var svgObject = appLogoContainer.querySelector(".app-logo");
                    if (svgObject) {
                        Colors.loadSVGImage({
                            fileName: AppData._persistentStates.logo,
                            element: svgObject,
                            size: { width: 182, height: 44 },
                            useStrokeColor: false,
                            strokeWidth: 100
                        });
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.setLogo = setLogo;

            var setServerList = function (results) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (results) {
                    for (var i = 0; i < results.length; i++) {
                        var row = results[i];
                        if (row.IsActive === "1") {
                            Log.print(Log.l.info, "found LanguageId=" + row.LocationID);
                            that.binding.LocationID = row.LocationID;
                            that.binding.ServerName = row.LocationName;
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var employeeId = AppData.getRecordId("Mitarbeiter");
                var ret = new WinJS.Promise.as().then(function () {
                /*    if (employeeId) {
                        return AppHeader.GlobalUserServersVIEW.select(function(json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "GlobalUserServersVIEW: success!");
                                if (json && json.d && json.d.results && json.d.results.length) {
                                    that.binding.count = json.d.results.length;
                                    if (that.binding.count > 1) {
                                        that.binding.showServerList = true;
                                    }
                                    //that.nextDocUrl = Account.GlobalUserServersRT.getNextUrl(json);
                                    var results = json.d.results;
                                    setServerList(results);
                                } else {
                                    Log.print(Log.l.trace, "GlobalUserServersVIEW: no data found!");
                                }
                        }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                Log.print(Log.l.error, "Account.GlobalUserServersVIEW: error!");
                                AppData.setErrorMsg(that.binding, errorResponse);
                        }, null);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {*/
                    that.setLogo();
                    that.binding.userData = AppData._userData;
                    that.binding.genDataFlag = AppData._userData && AppData._userData.IsCustomerAdmin || AppData._userData.IsMidiAdmin;
                    that.binding.isSiteAdmin = AppData._userData.SiteAdmin ? true : false;
                    that.binding.userMessagesDataCount = AppData._userMessagesData.MessagesCounter;
                    that.binding.showNameInHeader = !!AppData._persistentStates.showNameInHeader;
                    that.binding.publishFlag = that.getPublishFlag();
                    that.binding.genDataFlag = that.binding.userData && that.binding.userData.IsCustomerAdmin || that.binding.userData.IsMidiAdmin;
                    that.binding.isSiteAdmin = that.binding.userData && that.binding.userData.SiteAdmin;
                    if (that.binding.errorFlag) {
                        return WinJS.Promise.as();
                    }
                    if (employeeId) {
                        // todo: load image data and set src of img-element
                        Log.print(Log.l.trace, "calling select contactView...");
                        return AppHeader.userPhotoView.select(function (json) {
                            Log.print(Log.l.trace, "userPhotoView: success!");
                            if (json && json.d) {
                                var docContent = json.d.OvwContentDOCCNT3
                                    ? json.d.OvwContentDOCCNT3
                                    : json.d.DocContentDOCCNT1;
                                if (docContent) {
                                    var sub = docContent.search("\r\n\r\n");
                                    if (sub >= 0) {
                                        var newContent = docContent.substr(sub + 4);
                                        if (!that.binding.photoData ||
                                            that.binding.photoData !== newContent) {
                                            that.binding.photoData = newContent;
                                            showPhoto();
                                        }
                                    }
                                } else {
                                    that.binding.photoData = "";
                                    showPhoto();
                                }
                            } else {
                                that.binding.photoData = "";
                                showPhoto();
                            }
                        }, function (errorResponse) {
                            that.binding.photoData = "";
                            that.binding.errorFlag = true;
                            showPhoto();
                            // ignore that
                        }, employeeId);
                    } else {
                        that.binding.photoData = "";
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var reloadMenu = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var menu1 = pageElement.querySelector("#menu1");
                if (menu1) {
                    var commands = menu1.querySelectorAll(".win-command");
                    if (commands) for (var i = 0; i < commands.length; i++) {
                        var command = commands[i];
                        if (command && command.winControl) {
                            var newLabel = getResourceText("label." + command.id);
                            Log.print(Log.l.trace, "label[" + command.id + "]=" + newLabel);
                            command.winControl.label = newLabel;
                            var winToggleIcon = command.querySelector(".win-toggleicon");
                            if (winToggleIcon) {
                                if (command.id === "logoff") {
                                    if (!WinJS.Utilities.hasClass(winToggleIcon.nextElementSibling, "win-toggleicon")) {
                                        var clonedIcon = winToggleIcon.cloneNode();
                                        if (clonedIcon) {
                                            WinJS.Utilities.addClass(winToggleIcon, "red-icon");
                                            clonedIcon.name = command.name;
                                            WinJS.Utilities.addClass(clonedIcon, "white-icon");
                                            if (clonedIcon.style) {
                                                clonedIcon.style.display = "inline";
                                            }
                                            winToggleIcon.parentElement.insertBefore(clonedIcon, winToggleIcon.nextElementSibling);
                                            WinJS.Promise.timeout(0).then(function () {
                                                Colors.loadSVGImageElements(menu1, "white-icon", 24, "#ffffff", "name");
                                                Colors.loadSVGImageElements(menu1, "win-toggleicon.red-icon", 24, Colors.offColor, "name");
                                            });
                                        }
                                    }
                                } else while (winToggleIcon.firstElementChild || winToggleIcon.firstChild) {
                                    winToggleIcon.removeChild(winToggleIcon.firstElementChild || winToggleIcon.firstChild);
                                }
                                winToggleIcon.name = command.name;
                            }
                        }
                        Colors.loadSVGImageElements(menu1, "win-toggleicon:not(.red-icon):not(.white-icon)", 24, Colors.isDarkTheme ? "#ffffff" : "#000000", "name");
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.reloadMenu = reloadMenu;

            // Finally, wire up binding
            WinJS.Resources.processAll(that.element).then(function () {
                return WinJS.Binding.processAll(that.element, that.binding);
            }).then(function () {
                that.reloadMenu();
                Log.print(Log.l.trace, "Binding wireup page complete, data will be loaded later!");
            });
            Log.ret(Log.l.trace);
        }, {
            pageData: {
                generalData: AppData.generalData,
                appSettings: AppData.appSettings
            }
        })
    });
})();


