// controller for page: photo
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/adminAppHelpText/adminAppHelpText.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/fragments/videoMedia/videoMediaService.js" />


(function () {
    "use strict";

    var namespaceName = "AdminAppHelpText";

    WinJS.Namespace.define("AdminAppHelpText", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                pageData: getEmptyDefaultValue(AdminAppHelpText.langAppHelpTextView.defaultValue),
                pageId: 0,
                pageLangId: 0,
                showVideo: false,
                videoUrl: ""
            }, commandList]);

            var that = this;

            var fileInput = pageElement.querySelector("#myFile");
            var textField = pageElement.querySelector("#textField");
            var videoCon = pageElement.querySelector("#noteFrame");

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                
            }

            var getVideoId = function (url) {
                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                var match = url ? url.match(regExp) : null;
                return (match && match[2] && match[2].length === 11) ? match[2] : null;
            }
            
            var resultConverter = function (item, index) {
                item.index = index;
                if (item.MediaURL) {
                    that.binding.showVideo = true;
                    that.binding.videoUrl = getVideoId(item.MediaURL);
                    if (that.binding.videoUrl) {
                        that.binding.videoUrl = "https://www.youtube.com/embed/" + that.binding.videoUrl;
                    }
                    videoCon.src = that.binding.videoUrl;
                    item.index = index;
                } else {
                    if (videoCon) {
                        videoCon.src = "";
                    }
                    that.binding.showVideo = false;
                }
            }
            this.resultConverter = resultConverter;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var err = null;
                var dataPage = that.binding.pageData;
                if (dataPage && AppBar.modified && !AppBar.busy) {
                    AppBar.busy = true;
                    var recordId = that.binding.pageLandId;
                    if (recordId) {
                        ret = WinJS.Promise.as().then(function () {
                            AdminAppHelpText.langAppHelpTextView.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "dataPage update: success!");
                                AppBar.modified = false;
                                if (typeof complete === "function") {
                                    complete(dataPage);
                                } else {
                                        var master = Application.navigator.masterControl;
                                        if (master && master.controller) {
                                            master.controller.loadData();
                                        }
                                }
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                err = errorResponse;
                                AppData.getErrorMsgFromErrorStack(errorResponse).then(function () {
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                    if (typeof error === "function") {
                                        error(errorResponse);
                                    }
                                });
                            }, recordId, dataPage).then(function () {
                                if (!err) {
                                    var master = Application.navigator.masterControl;
                                    if (master && master.controller) {
                                        master.controller.loadData(recordId);
                                    }
                                } else {
                                    return WinJS.Promise.as();
                                }
                            });
                        });
                    } else {
                        ret = WinJS.Promise.as();
                    }
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataPage);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onFileInput: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");

                    var file = pageElement.querySelector("#myFile").files[0]; // Die ausgewählte Datei

                    if (file) {
                        var reader = new FileReader();

                        // Datei wird gelesen
                        reader.onload = (e) => {
                            that.binding.pageData.BodyText = e.target.result; // Inhalt in das Textarea einfügen
                        };

                        reader.onerror = (e) => {
                            alert("Fehler beim Lesen der Datei!");
                        };

                        reader.readAsText(file); // Datei als Text lesen
                        fileInput.value = "";
                        AppBar.modified = true;
                    } else {
                        alert("Keine Datei ausgewählt!");
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                blockEnterKey: function (event) {
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickOk")
                            AppBar.commandList[i].key = null;
                    }

                },
                releaseEnterKey: function (event) {
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickOk")
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                    }
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickOk: function () {
                    if (AppBar.modified) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var loadData = function (appHelpTextId, languageSpecId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                that.binding.pageId = appHelpTextId;
                var ret;
                if (appHelpTextId) {
                    ret = new WinJS.Promise.as().then(function () {
                        return AdminAppHelpText.langAppHelpTextView.select(function (json) {
                            Log.print(Log.l.trace, "langAppHelpTextView: success!");
                            if (json && json.d) {
                                var result = json.d.results[0];
                                that.binding.pageLandId = result.LangAppHelpTextVIEWID;
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.binding.pageData = result;
                                Log.print(Log.l.trace, "Data loaded");
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            that.loading = false;
                            }, { LangAppHelpTextVIEWID: appHelpTextId, LanguageSpecID: languageSpecId});
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();


