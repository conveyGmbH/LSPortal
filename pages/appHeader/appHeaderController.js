﻿﻿// controller for page: contact
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
            this.pageData.userMessagesDataCount = AppData._userMessagesData.MessagesCounter;
            this.pageData.photoData = null;
            this.pageData.showNameInHeader = !!AppData._persistentStates.showNameInHeader;
            this.pageData.loadUserImage = true;

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
                        WinJS.Promise.timeout(50).then(function() {
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

            var setLogo = function() {
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

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var employeeId = AppData.getRecordId("Mitarbeiter");
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
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    that.setLogo();
                    that.binding.publishFlag = that.getPublishFlag();
                    that.binding.genDataFlag = that.binding.userData && that.binding.userData.IsCustomerAdmin || that.binding.userData.IsMidiAdmin;
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // Finally, wire up binding
            WinJS.Resources.processAll(that.element).then(function () {
                return WinJS.Binding.processAll(that.element, that.binding);
            }).then(function () {
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


