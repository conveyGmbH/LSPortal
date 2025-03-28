﻿// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
/// <reference path="../../../lib/WinJS/scripts/base.min.js" />
/// <reference path="../../../lib/WinJS/scripts/ui.js" />
/// <reference path="../../../lib/convey/scripts/logging.js" />
/// <reference path="../../../lib/convey/scripts/strings.js" />
/// <reference path="../../../lib/convey/scripts/dataService.js" />
/// <reference path="../../../lib/convey/scripts/colors.js" />
/// <reference path="../../../lib/convey/scripts/navigator.js" />
/// <reference path="../../../lib/convey/scripts/appbar.js" />
/// <reference path="../../../../plugins/cordova-plugin-statusbar/www/statusbar.js" />
/// <reference path="../../../../plugins/cordova-plugin-device/www/device.js" />
/// <reference path="../../../../plugins/cordova-plugin-fullscreen/www/AndroidFullScreen.js" />

(function () {
    "use strict";

    // some shortcuts
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;
    var b64 = window.base64js;

    // define a class for the page frame
    WinJS.Namespace.define("Application", {
        _version: "",
        /**
         * @property {string} version - The application version.
         * @memberof Application
         * @description Read/Write. Retrieve or sets The application version.
         */
        version: {
            get: function () {
                return Application._version;
            },
            set: function (newVersion) {
                Application._version = newVersion;
            }
        },
        prevOrientation: {
            get: function () {
                if (Application.pageframe) {
                    return Application.pageframe._prevOrientation;
                } else {
                    return 0;
                }
            }
        },
        _refreshAfterFetchOverride: null,
        /**
         * @property {function} refreshAfterFetchOverride - Hook function for processing UI refresh after replication data is fetched
         * @memberof Application
         * @description Read/Write. Retrieves or sets an optional hook function for processing UI refresh after replication data is fetched.
         *  This function is called from the framework after data is fetched via replication, e.g.:
         <pre>
            Application.refreshAfterFetchOverride = function () {
                // do anything useful from time to time...
            };
         </pre>
         */
        refreshAfterFetchOverride: {
            get: function () {
                return Application._refreshAfterFetchOverride;
            },
            set: function (newRefreshAfterFetchOverride) {
                Application._refreshAfterFetchOverride = newRefreshAfterFetchOverride;
            }
        },
        refreshAfterFetch: function (fetchRequests) {
            if (typeof Application._refreshAfterFetchOverride === "function") {
                Application._refreshAfterFetchOverride(fetchRequests);
            }
        },
        _reflectFastReqOverride: null,
        /**
         * @property {function} reflectFastReqOverride - Hook function for processing UI refresh while fast replication is running
         * @memberof Application
         * @description Read/Write. Retrieves or sets an optional hook function for processing UI refresh while fast replication is running.
         *  This function is called from the framework ofter while fast replication is running, e.g.:
         <pre>
            Application.reflectFastReqOverride = function (numFastReqs) {
                // do anything useful from time to time...
            };
         </pre>
         */
        reflectFastReqOverride: {
            get: function () {
                return Application._reflectFastReqOverride;
            },
            set: function (newReflectFastReqOverride) {
                Application._reflectFastReqOverride = newReflectFastReqOverride;
            }
        },
        reflectFastReq: function (numFastReqs) {
            if (typeof Application._reflectFastReqOverride === "function") {
                Application._reflectFastReqOverride(numFastReqs);
            }
        },

        ensureScreenLayout: function () {
            Log.call(Log.l.trace, "Application.");
            var ret = null;
            var isAndroid = false;
            if (typeof device === "object" && typeof device.platform === "string") {
                if (device.platform === "Android") {
                    isAndroid = true;
                }
            }
            if (isAndroid &&
                typeof AndroidFullScreen === "object") {
                try {
                    var visibilityMode;
                    if (AppData._persistentStates.fullScreen) {
                        visibilityMode = AndroidFullScreen.SYSTEM_UI_FLAG_FULLSCREEN |
                            AndroidFullScreen.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                            AndroidFullScreen.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                    } else {
                        visibilityMode = AndroidFullScreen.SYSTEM_UI_FLAG_VISIBLE;
                    }
                    Log.print(Log.l.trace, "AndroidFullScreen.setSystemUiVisibility visibilityMode=" + visibilityMode);
                    AndroidFullScreen.setSystemUiVisibility(visibilityMode,
                        function () {
                            Log.print(Log.l.trace, "AndroidFullScreen.setSystemUiVisibility succeeded!");
                        },
                        function (error) {
                            Log.print(Log.l.error, "AndroidFullScreen.setSystemUiVisibility failed!" + error);
                        });
                } catch (ex2) {
                    Log.print(Log.l.error, "AndroidFullScreen bar error " + ex2.message);
                }
            }
            Log.ret(Log.l.info);
        },
        /**
         * @class PageFrame 
         * @memberof Application
         * @param {string} aName - Name of the application 
         * @description The class definition for the application frame. 
         *  The name of the application is used in case of saving peristent settings in a file.
         *  Create an instance of this class in your application startup code, usually at the end of index.js, like this:
         <pre>
         // initiate the page frame class
         var pageframe = new Application.PageFrame("MyApp");
         </pre>
         */
        PageFrame: WinJS.Class.define(
            // Define the constructor function for the PageFrame.
            function PageFrame(aName) {
                this._name = aName;
                Application.pageframe = this;

                AppData.persistentStatesDefaults = copyMissingMembersByValue(AppData.persistentStatesDefaults, AppData._persistentStatesDefaults);

                this._prevOrientation = this._getOrientation();
                Application.getOrientation = this._getOrientation.bind(this);

                document.addEventListener("deviceready", this.onReady.bind(this), false);
            }, {
                // private elements
                _name: null,
                _prevEvent: null,
                _filenamePersistentStates: "PersistentStates.json",
                _filenamePSEncoded: "psf",
                _prevOrientation: 0,
                _splashScreenDone: 0,
                /**
                 * @property {string} name - The application name.
                 * @memberof Application.PageFrame
                 * @description Read-only. Retrieve or sets The application name.
                 */
                name: {
                    get: function () {
                        return this._name;
                    }
                },
                /**
                 * @property {string} filenamePersistentStates - The application persistent states filename.
                 * @memberof Application.PageFrame
                 * @description Read-only. Retrieve or sets The application persistent states filename.
                 */
                filenamePersistentStates: {
                    get: function () {
                        if (this._name) {
                            return this._name + "." + this._filenamePersistentStates;
                        } else {
                            return this._filenamePersistentStates;
                        }
                    }
                },
                /**
                 * @property {string} filenamePSEncoded - The application persistent states filename.
                 * @memberof Application.PageFrame
                 * @description Read-only. Retrieve or sets The application persistent states filename.
                 */
                filenamePSEncoded: {
                    get: function () {
                        return (this._name ? this._name : "leadsuccess") + "." + this._filenamePSEncoded;
                    }
                },
                // splashScreenDone property
                /**
                 * @property {boolean} splashScreenDone - True if the splash screen is already closed.
                 * @memberof Application.PageFrame
                 * @description Read-only. Retrieve if the splash screen is already closed.
                 */
                splashScreenDone: {
                    get: function () { return this._splashScreenDone; },
                    set: function (newSplashScreenDone) { this._splashScreenDone = newSplashScreenDone; }
                },

                // Handle the deviceready event. 
                onReady: function () {
                    if (navigator.splashscreen &&
                        typeof navigator.splashscreen.hide === "function") {
                        var splashScreen = document.querySelector(".splash-screen-container");
                        if (splashScreen && splashScreen.style) {
                            splashScreen.style.display = "none";
                        }
                    }
                    // initial logging
                    Log.init({
                        target: Log.targets.console,
                        level: Log.l.none,
                        group: false,
                        noStack: true
                    });
                    Log.call(Log.l.trace, "PageFrame.", "");
                    WinJS.Promise.timeout(0).then(function () {
                        var followUp = function() {
                            Application.pageframe.loadPersistentStates(function () {
                                // setup logging from states
                                if (AppData._persistentStates.logEnabled === true) {
                                    var settings = {
                                        target: AppData._persistentStates.logTarget,
                                        level: AppData._persistentStates.logLevel,
                                        group: AppData._persistentStates.logGroup,
                                        noStack: AppData._persistentStates.logNoStack,
                                        logWinJS: AppData._persistentStates.logWinJS
                                    };
                                    Log.init(settings);
                                }
                                Application.pageframe.initialize();
                            });
                        }
                        if (!Application.pageframe._aboutData &&
                            AppData.persistentStatesDefaults.encodeSettings) {
                            var img = new Image;
                            img.onload = function () {
                                var canvas = document.createElement('canvas');
                                canvas.width = this.naturalWidth;
                                canvas.height = this.naturalHeight;
                                canvas.getContext('2d').drawImage(this, 0, 0);
                                Application.pageframe._aboutData = b64.toByteArray(canvas.toDataURL('image/png')
                                    .replace(/^data:image\/png;base64,/, ''));
                                followUp();
                            }
                            img.onerror = function () {
                                followUp();
                            }
                            img.src = "images/about-bkg.png";
                        } else {
                            followUp();
                        }
                    }).then(function () {
                        Application.version = navigator.appInfo ? "Version " + navigator.appInfo.version : "";
                    });
                    Log.ret(Log.l.trace);
                },

                // Handle the application resume event 
                onResume: function () {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    WinJS.Promise.timeout(2000).then(function () {
                        if (typeof Application.onResumeOverride === "function") {
                            Application.onResumeOverride();
                        }
                    });

                    // metadata try connect with vpn using register-user 
                    var url = AppData.getBaseURL(AppData.appSettings.odata.onlinePort) + "/" + AppData.getOnlinePath(true) + "/$metadata";
                    var options = AppData.initXhrOptions("GET", url, true);
                    Log.print(Log.l.info, "calling xhr method=GET metadata... url=" + options.url);
                    WinJS.xhr(options).then(function xhrSuccess(response) {
                        Log.print(Log.l.info, "AppData.call xhr metadata.", "method=GET" + options.url);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error=" + AppData.getErrorMsgFromResponse(errorResponse));
                        //AppData.setErrorMsg(AppBar.scope.binding, errorResponse);
                    });
                    Application.ensureScreenLayout();
                    Log.ret(Log.l.trace);
                },

                // Handle the application pause event 
                onPause: function () {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    if (Application.navigator &&
                        Application.navigator.pageElement &&
                        typeof Application.navigator.pageElement.canUnload === "function") {
                        Application.navigator.pageElement.canUnload(function (response) {
                            Log.print(Log.l.trace, "onPause: canUnload success!");
                            Application.pageframe.savePersistentStates();
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "onPause: canUnload failure " + errorResponse);
                            Application.pageframe.savePersistentStates();
                        });
                    } else {
                        Application.pageframe.savePersistentStates();
                    }
                    Log.ret(Log.l.trace);
                },

                _onOnlineHandler: null,
                _onOfflineHandler: null,
                onOnlineHandler: {
                    get: function () {
                        return Application.pageframe._onOnlineHandler;
                    },
                    set: function (newHandler) {
                        Application.pageframe._onOnlineHandler = newHandler;
                    }
                },
                onOfflineHandler: {
                    get: function () {
                        return Application.pageframe._onOfflineHandler;
                    },
                    set: function (newHandler) {
                        Application.pageframe._onOfflineHandler = newHandler;
                    }
                },
                // Handle the application online event 
                onOnline: function (eventInfo) {
                    Log.call(Log.l.info, "PageFrame.", "");
                    if (typeof Application.pageframe._onOnlineHandler === "function") {
                        Application.pageframe._onOnlineHandler(eventInfo);
                    }
                    Log.ret(Log.l.info);
                },

                // Handle the application resume event 
                onOffline: function (eventInfo) {
                    Log.call(Log.l.info, "PageFrame.", "");
                    if (typeof Application.pageframe._onOfflineHandler === "function") {
                        Application.pageframe._onOfflineHandler(eventInfo);
                    }
                    Log.ret(Log.l.info);
                },

                onPrefersColorSchemeChange: function (e) {
                    Log.call(Log.l.info, "PageFrame.", "");
                    if (!AppData._persistentStates.manualTheme) {
                        Colors.isDarkTheme = e && e.matches;
                    }
                    Log.ret(Log.l.info);
                },

                openLocalDB: function (complete) {
                    Log.call(Log.l.u1, "PageFrame.", "");
                    AppData.openLocalDB(function (res) {
                        if (typeof complete === "function") {
                            complete();
                        }
                    }, function (err) {
                        if (typeof complete === "function") {
                            complete();
                        }
                    });
                    Log.ret(Log.l.u1);
                },

                _hasPlainLocalStorage: false,
                _hasPlainSettingsFile: false,
                // load PersistentStates from File
                loadPersistentStates: function (complete) {
                    var loggingInitialized = (Log._logging !== null);
                    if (loggingInitialized) {
                        Log.call(Log.l.trace, "PageFrame.", "");
                    }
                    var checkForLocalStorage = function () {
                        try {
                            if (window.localStorage) {
                                Log.print(Log.l.info, "using localStorage");
                                try {
                                    var data = window.localStorage.getItem(Application.pageframe.filenamePSEncoded);
                                    if (data) {
                                        var byteArray = Application.pageframe.psFromData(b64.toByteArray(data));
                                        var decoder = new TextDecoder();
                                        data = decoder.decode(byteArray);
                                    } else {
                                        data = window.localStorage.getItem(Application.pageframe.filenamePersistentStates);
                                        if (data) {
                                            Application.pageframe._hasPlainLocalStorage = true;
                                        }
                                    }
                                    if (data) {
                                        AppData._persistentStates = JSON.parse(data);
                                        Log.print(Log.l.info, "data loaded from localStorage");
                                    }
                                } catch (exception) {
                                    Log.print(Log.l.error, "loadPersistentStates parse error " + exception.message);
                                }
                            }
                        } catch (exception) {
                            Log.print(Log.l.error, "loadPersistentStates parse error " + exception.message);
                        }
                        AppData._persistentStates = copyMissingMembersByValue(AppData._persistentStates, AppData.persistentStatesDefaults);
                        AppData._persistentStates.encodeSettings = AppData.persistentStatesDefaults.encodeSettings;
                        if (AppData._persistentStates.encodeSettings) {
                            Application.pageframe.savePersistentStates();
                        }
                        if (typeof complete === "function") {
                            complete();
                        }
                    };
                    if (typeof window.resolveLocalFileSystemURL === "function") {
                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
                            Log.print(Log.l.info, "resolveLocalFileSystemURL: file system open name=" + dirEntry.name);
                            dirEntry.getFile(Application.pageframe.filenamePSEncoded, { create: false, exclusive: false }, function (fileEntry) {
                                fileEntry.file(function (file) {
                                    var reader = new FileReader();
                                    reader.onerror = function (e) {
                                        Log.print(Log.l.error, "Failed file read: " + e.toString());
                                        checkForLocalStorage();
                                    };
                                    reader.onloadend = function () {
                                        var data = this.result;
                                        Log.print(Log.l.info, "Successful file read!");
                                        try {
                                            var byteArray = Application.pageframe.psFromData(b64.toByteArray(data));
                                            var decoder = new TextDecoder();
                                            data = decoder.decode(byteArray);
                                            AppData._persistentStates = JSON.parse(data);
                                            Log.print(Log.l.info, "data loaded from file name=" + Application.pageframe.filenamePSEncoded);
                                            AppData._persistentStates = copyMissingMembersByValue(AppData._persistentStates, AppData.persistentStatesDefaults);
                                        } catch (exception) {
                                            Log.print(Log.l.error, "loadPersistentStates parse error " + exception.message);
                                        }
                                        if (!AppData._persistentStates ||
                                            !AppData._persistentStates.odata ||
                                            !AppData._persistentStates.odata.login ||
                                            !AppData._persistentStates.odata.password) {
                                            checkForLocalStorage();
                                        } else {
                                            complete();
                                        }
                                    };
                                    reader.readAsText(file);
                                }, function (errorResponse) {
                                    Log.print(Log.l.error, "file read error " + errorResponse.toString());
                                    checkForLocalStorage();
                                });
                            }, function (errorResponse) {
                                Log.print(Log.l.info, "getFile(" + Application.pageframe.filenamePSEncoded + ") error " + errorResponse.toString());
                                dirEntry.getFile(Application.pageframe.filenamePersistentStates, { create: false, exclusive: false }, function (fileEntry) {
                                    fileEntry.file(function (file) {
                                        var reader = new FileReader();
                                        reader.onerror = function (e) {
                                            Log.print(Log.l.error, "Failed file read: " + e.toString());
                                            checkForLocalStorage();
                                        };
                                        reader.onloadend = function () {
                                            var data = this.result;
                                            Log.print(Log.l.info, "Successful file read!");
                                            try {
                                                AppData._persistentStates = JSON.parse(data);
                                                Log.print(Log.l.info, "data loaded from file name=" + Application.pageframe.filenamePersistentStates);
                                                Application.pageframe._hasPlainSettingsFile = true;
                                                AppData._persistentStates = copyMissingMembersByValue(AppData._persistentStates, AppData.persistentStatesDefaults);
                                                AppData._persistentStates.encodeSettings = AppData.persistentStatesDefaults.encodeSettings;
                                                if (AppData._persistentStates.encodeSettings) {
                                                    Application.pageframe.savePersistentStates();
                                                }
                                            } catch (exception) {
                                                Log.print(Log.l.error, "loadPersistentStates parse error " + exception.message);
                                            }
                                            if (!AppData._persistentStates ||
                                                !AppData._persistentStates.odata ||
                                                !AppData._persistentStates.odata.login ||
                                                !AppData._persistentStates.odata.password) {
                                                checkForLocalStorage();
                                            } else {
                                                complete();
                                            }
                                        };
                                        reader.readAsText(file);
                                    }, function (errorResponse) {
                                        Log.print(Log.l.error, "file read error " + errorResponse.toString());
                                        checkForLocalStorage();
                                    });
                                }, function (errorResponse) {
                                    Log.print(Log.l.error, "getFile(" + Application.pageframe.filenamePersistentStates + ") error " + errorResponse.toString());
                                    checkForLocalStorage();
                                });
                            });
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "resolveLocalFileSystemURL error " + errorResponse.toString());
                            checkForLocalStorage();
                        });
                    } else {
                        checkForLocalStorage();
                    }
                    if (!loggingInitialized) {
                        Log.call(Log.l.trace, "PageFrame.", "");
                    }
                    Log.ret(Log.l.trace);
                },
                _inSavePersistentStates: 0,
                /**
                 * @function savePersistentStates
                 * @memberof Application.PageFrame
                 * @description Use this function to save the peristent application state.
                 */
                savePersistentStates: function () {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    if (Application.pageframe._inSavePersistentStates > 0) {
                        Log.print(Log.l.info, "savePersistentStates: semaphore set - try later again");
                        WinJS.Promise.timeout(250).then(function () {
                            Application.pageframe.savePersistentStates();
                        });
                    } else {
                        Application.pageframe._inSavePersistentStates++;
                        try {
                            if (window.localStorage) {
                                Log.print(Log.l.trace, "using localStorage");
                                var data = JSON.stringify(AppData._persistentStates);
                                if (data) {
                                    var fileName;
                                    if (AppData._persistentStates.encodeSettings) {
                                        var encoder = new TextEncoder();
                                        var byteArray = Application.pageframe.psFromData(encoder.encode(data));
                                        data = b64.fromByteArray(byteArray);
                                        fileName = Application.pageframe.filenamePSEncoded;
                                    } else {
                                        fileName = Application.pageframe.filenamePersistentStates;
                                    }
                                    window.localStorage.setItem(fileName, data);
                                    if (AppData._persistentStates.encodeSettings && Application.pageframe._hasPlainLocalStorage) {
                                        window.localStorage.removeItem(Application.pageframe.filenamePersistentStates);
                                    }
                                    Log.print(Log.l.trace, "data saved to localStorage");
                                    if (typeof window.resolveLocalFileSystemURL === "function") {
                                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
                                            Log.print(Log.l.info, "resolveLocalFileSystemURL: file system open name=" + JSON.stringify(dirEntry));
                                            dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
                                                fileEntry.createWriter(function (fileWriter) {
                                                    fileWriter.onerror = function (e) {
                                                        Log.print(Log.l.error, "Failed file write: " + e.toString());
                                                    };
                                                    var dataObj = new Blob([data], { type: 'text/plain' });
                                                    fileWriter.write(dataObj);
                                                    Log.print(Log.l.info, "fileWriter: data written to file name=" + fileName);
                                                    if (AppData._persistentStates.encodeSettings && Application.pageframe._hasPlainSettingsFile) {
                                                        Log.print(Log.l.info, "fileWriter: now delete file " + Application.pageframe.filenamePersistentStates);
                                                        dirEntry.getFile(Application.pageframe.filenamePersistentStates, { create: true, exclusive: false }, function(fileEntry) {
                                                            fileEntry.remove(function () {
                                                                Log.print(Log.l.info, "file " + Application.pageframe.filenamePersistentStates + " deleted!");
                                                            },
                                                            function (errorResponse) {
                                                                Log.print(Log.l.error, "file delete: Failed remove file " + Application.pageframe.filenamePersistentStates + " error: " + JSON.stringify(errorResponse));
                                                            },
                                                            function () {
                                                                Log.print(Log.l.trace, "file delete: extra ignored!" + Application.pageframe.filenamePersistentStates);
                                                            });
                                                        }, function (errorResponse) {
                                                            Log.print(Log.l.info, "deleteFile: getFile(" + Application.pageframe.filenamePersistentStates + ") error " + JSON.stringify(errorResponse));
                                                        });
                                                        Application.pageframe._hasPlainSettingsFile = false;
                                                    }
                                                    Application.pageframe._inSavePersistentStates--;
                                                }, function (errorResponse) {
                                                    Log.print(Log.l.error, "createWriter(" + fileName + ") error " + JSON.stringify(errorResponse));
                                                    Application.pageframe._inSavePersistentStates--;
                                                });
                                            }, function (errorResponse) {
                                                Log.print(Log.l.error, "getFile(" + fileName + ") error " + JSON.stringify(errorResponse));
                                                Application.pageframe._inSavePersistentStates--;
                                            });
                                        }, function (errorResponse) {
                                            Log.print(Log.l.error, "resolveLocalFileSystemURL error " + JSON.stringify(errorResponse));
                                            Application.pageframe._inSavePersistentStates--;
                                        });
                                    } else {
                                        Log.print(Log.l.info, "resolveLocalFileSystemURL: NOT SUPPORTED");
                                        Application.pageframe._inSavePersistentStates--;
                                    }
                                } else {
                                    Log.print(Log.l.error, "NOT DATA TO SAVE");
                                    Application.pageframe._inSavePersistentStates--;
                                }
                            } else {
                                Log.print(Log.l.error, "window.localStorage: NOT SUPPORTED");
                                Application.pageframe._inSavePersistentStates--;
                            }
                        } catch (exception) {
                            Log.print(Log.l.error, "savePersistentStates stringify error " + exception.message);
                            Application.pageframe._inSavePersistentStates--;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                // load language-specific rsource strings from remote 
                loadRemoteResource: function (languageId, complete, error, pageName, isRegister) {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    if (typeof pageName === "undefined" || pageName === null) {
                        pageName = "general, label, tooltip, command, flyout";
                    }
                    if (typeof isRegister === "undefined") {
                        isRegister = true;
                    }
                    var ret = AppData.call("PRC_GetLangText", {
                        pLanguageID: languageId,
                        pTextTitle: pageName,
                        pResourceTypeID: 20004
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            window.strings[item.ResultTitle] = item.ResultText;
                        });
                        complete(window.strings);
                        Log.print(Log.l.trace, "call success! window.strings");
                    }, function (err) {
                        Log.print(Log.l.error, "call error");
                        error(err);
                    }, isRegister);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                // load language-specific resource strings
                loadLocalResources: function (language, complete, error) {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    // fallback of invalid language codes
                    // need to be extended for other languages!
                    var url = "strings";
                    // check for existence of native WinRT resources
                    // don't use language specific paths in this case
                    // look: https://msdn.microsoft.com/library/windows/apps/xaml/hh965324
                    var resources = Resources.get();
                    if (!resources) {
                        url += "/" + language;
                    }
                    url += "/resources.resjson";
                    Log.print(Log.l.trace, "trying to load resources from " + url);
                    var ret = WinJS.xhr({ url: url }).then(function (res) {
                        Log.print(Log.l.trace, "resource ok for language=" + language);
                        try {
                            window.strings = JSON.parse(res.responseText);
                            // remember successfully loaded languageId
                            if (AppData._persistentStates.prevLanguageId !== AppData._persistentStates.languageId) {
                                AppData._persistentStates.prevLanguageId = AppData._persistentStates.languageId;
                                Application.pageframe.savePersistentStates();
                                AppData.clearLgntInits();
                                NavigationBar.setMenuForGroups();
                            }
                            complete(window.strings);
                        } catch (exception) {
                            Log.print(Log.l.error, "resource parse error " + exception.message);
                            error({ status: 500, statusText: "resource parse error " + exception.message });
                        }
                    }, function (err) {
                        Log.print(Log.l.error, "resource load error at url=" + url + " " + err.statusText);
                        error(err);
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                },
                // Globalization plugin provides locale per callback only
                // finishes always with value of length > 0
                initLanguage: function (complete, error, language) {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    function repairLanguage(language) {
                        var i, row, pos, lang;
                        language = language || "en-US";
                        var languages = AppData.getDefLanguages();
                        var lowerCase = language.toLowerCase();
                        var posSubLanguage = lowerCase.indexOf("-");
                        if (posSubLanguage >= 0) {
                            Log.print(Log.l.trace, "language contains sub-language lowerCase=" + lowerCase);
                            // language contains sub-language
                            for (i = 0; i < languages.length; i++) {
                                row = languages[i];
                                if (row.DOMCode === lowerCase) {
                                    language = language.substr(0, posSubLanguage) + "-" + language.substr(posSubLanguage + 1).toUpperCase();
                                    Log.print(Log.l.trace, "found in default languages: " + language);
                                    return language;
                                }
                            }
                            var mainLanguage = lowerCase.substr(0, posSubLanguage);
                            Log.print(Log.l.trace, "try without sub-language again mainLanguage=" + mainLanguage);
                            for (i = 0; i < languages.length; i++) {
                                row = languages[i];
                                pos = row.DOMCode.indexOf("-");
                                if (pos >= 0) {
                                    lang = row.DOMCode.substr(0, pos);
                                } else {
                                    lang = row.DOMCode;
                                }
                                if (lang === mainLanguage) {
                                    if (pos >= 0) {
                                        language = lang + "-" + row.DOMCode.substr(pos + 1).toUpperCase();
                                    } else {
                                        language = lang + "-" + lang.toUpperCase();
                                    }
                                    Log.print(Log.l.trace, "found in default languages, add default sublanguage: " + language);
                                    return language;
                                }
                            }
                        } else {
                            Log.print(Log.l.trace, "language contains NO sub-language lowerCase=" + lowerCase);
                            for (i = 0; i < languages.length; i++) {
                                row = languages[i];
                                pos = row.DOMCode.indexOf("-");
                                if (pos >= 0) {
                                    lang = row.DOMCode.substr(0, pos);
                                } else {
                                    lang = row.DOMCode;
                                }
                                if (lang === lowerCase) {
                                    if (pos >= 0) {
                                        language = lang + "-" + row.DOMCode.substr(pos + 1).toUpperCase();
                                    } else {
                                        language = lang + "-" + lang.toUpperCase();
                                    }
                                    Log.print(Log.l.trace, "found in default languages, add default sublanguage: " + language);
                                    return language;
                                }
                            }
                        }
                        language = "en-US";
                        return language;
                    }
                    function checkForOverride(languageId) {
                        var newLanguage;
                        // check for existence of native WinRT resources
                        // don't use language specific paths in this case
                        // look: https://msdn.microsoft.com/library/windows/apps/xaml/hh965324
                        var resources = Resources.get();
                        if (languageId && !resources) {
                            newLanguage = AppData.getLanguageFromId(languageId);
                            Application.language = newLanguage;
                            AppData._persistentStates.languageId = languageId;
                            complete(Application.language);
                        } else {
                            if (languageId) {
                                newLanguage = AppData.getLanguageFromId(languageId);
                            } else {
                                newLanguage = repairLanguage(language || window.navigator.userLanguage || window.navigator.language);
                            }
                            var bOk;
                            if (resources) {
                                if (Resources.primaryLanguage() === newLanguage) {
                                    Log.print(Log.l.info, "newLanguage = " + newLanguage + " already set!");
                                    bOk = true;
                                } else {
                                    Log.print(Log.l.info, "override newLanguage = " + newLanguage);
                                    // override user setting in operating system here!
                                    bOk = Resources.primaryLanguageOverride(newLanguage);
                                }
                            } else {
                                bOk = true;
                            }
                            if (bOk) {
                                Application.language = newLanguage;
                                AppData._persistentStates.languageId = AppData.getLanguageId();
                                complete(Application.language);
                            } else {
                                Log.print(Log.l.error, "primaryLanguageOverride(" + newLanguage + ") failed!");
                                error(Application.language);
                            }
                        }
                    }
                    // use language from globalization in app context!
                    if (typeof language === "undefined" &&
                        typeof navigator.globalization === "object") {
                        navigator.globalization.getLocaleName(
                            function (locale) {
                                Log.print(Log.l.trace, "getLocaleName returned value=" + locale.value + "\n");
                                if (locale) {
                                    Application.language = repairLanguage(locale.value);
                                }
                                checkForOverride(AppData.getLanguageId());
                            },
                            function (err) {
                                Log.print(Log.l.error, "getLocaleName returned error=" + err);
                                Application.language = "en-US";
                                AppData._persistentStates.languageId = AppData.getLanguageId();
                                error(Application.language);
                            }
                        );
                    } else {
                        checkForOverride(AppData._persistentStates.languageId);
                    }
                    Log.ret(Log.l.trace);
                },
                _aboutData: null,
                psFromData: function (data) {
                    var byteArray = Application.pageframe._aboutData;
                    if (byteArray && byteArray.length > 256) {
                        for (var i = 0; i < data.length; i++) {
                            var j = i + 256;
                            if (j >= byteArray.length) j = 256;
                            data[i] ^= byteArray[j];
                        }
                    }
                    return data;
                },
                checkForResources: function (language, complete, error) {
                    Log.call(Log.l.trace, "PageFrame.", "language=" + language);
                    Application.pageframe.loadLocalResources(language, function () {
                        if (!AppData._persistentStates.loadRemoteResource) {
                            complete();
                        }
                    }, function (err) {
                        Log.print(Log.l.error, "loadLocalResources failed");
                        if (!AppData._persistentStates.loadRemoteResource) {
                            error();
                        }
                    }).then(function () {
                        if (AppData._persistentStates.loadRemoteResource) {
                            return Application.pageframe.loadRemoteResource(AppData.getIdFromLanguage(language), function () {
                                complete();
                            }, function (err) {
                                Log.print(Log.l.error, "loadLocalResources failed - ignore error here!");
                                complete();
                            });
                        } else {
                            return WinJS.Promise.timeout(0);
                        }
                    }).then(function () {
                        // alert box feature
                        Application._initAlert();
                        Application._initModal();
                    });
                    Log.ret(Log.l.trace);
                },
                checkForLanguage: function () {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    var language;
                    if (AppData._persistentStates.languageId) {
                        language = AppData.getLanguageFromId(AppData._persistentStates.languageId);
                    }
                    Application.pageframe.initLanguage(function (result) {
                        WinJS.Promise.timeout(0).then(function () {
                            Application.pageframe.checkForResources(result, function () {
                                WinJS.Promise.timeout(0).then(function () {
                                    Application.pageframe.post_initialize();
                                });
                            }, function () {
                                Log.print(Log.l.error, "checkForResources failed");
                                WinJS.Promise.timeout(0).then(function () {
                                    Application.pageframe.post_initialize();
                                });
                            });
                        });
                    }, function (result) {
                        Log.print(Log.l.error, "initLanguage failed");
                        WinJS.Promise.timeout(0).then(function () {
                            Application.pageframe.checkForResources(result, function () {
                                WinJS.Promise.timeout(0).then(function () {
                                    Application.pageframe.post_initialize();
                                });
                            }, function () {
                                Log.print(Log.l.error, "checkForResources failed");
                                WinJS.Promise.timeout(0).then(function () {
                                    Application.pageframe.post_initialize();
                                });
                            });
                        });
                    }, language);
                    Log.ret(Log.l.trace);
                },

                /**
                 * @function reCheckForLanguage
                 * @param {function} complete - Copmpletion handler callback function. This function does not receive a parameter.
                 * @param {function} error - Error handler callback function. This function does not receive a parameter.
                 * @memberof Application.PageFrame
                 * @description Use this function to check for change of current user language.
                 *  On user language changes all language specific resources are freed and reloaded.
                 */
                reCheckForLanguage: function (complete, error, language) {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    if (AppData._persistentStates.prevLanguageId === AppData._persistentStates.languageId) {
                        Log.print(Log.l.trace, "extra ignored! prevLanguageId=" + AppData._persistentStates.prevLanguageId);
                        complete();
                    } else {
                        Application.pageframe.initLanguage(function (result) {
                            WinJS.Promise.timeout(0).then(function () {
                                Application.pageframe.checkForResources(result, function () {
                                    WinJS.Promise.timeout(0).then(function () {
                                        complete();
                                    });
                                }, function () {
                                    Log.print(Log.l.error, "checkForResources failed");
                                    error();
                                });
                            });
                        }, function (result) {
                            Log.print(Log.l.error, "initLanguage failed");
                            error();
                        }, AppData.getLanguageFromId(AppData._persistentStates.languageId));
                    }
                    Log.ret(Log.l.trace);
                },
                /**
                 * @function hideSplashScreen
                 * @memberof Application.PageFrame
                 * @description Use this function to hide the splash screen after application startup.
                 */
                hideSplashScreen: function () {
                    var ret = null;
                    Log.call(Log.l.info, "PageFrame.", "");
                    if (!Application.pageframe.splashScreenDone) {
                        Application.pageframe.splashScreenDone = 1;
                        if (navigator.splashscreen &&
                            typeof navigator.splashscreen.hide === "function") {
                            navigator.splashscreen.hide();
                        } else {
                            var splashScreen = document.querySelector(".splash-screen-container");
                            if (splashScreen) {
                                Log.print(Log.l.info, "calling Animatioon.fadeOut for splashScreen");
                                ret = WinJS.UI.Animation.fadeOut(splashScreen).done(function () {
                                    if (splashScreen.style) {
                                        splashScreen.style.display = "none";
                                    }
                                    return Application.ensureScreenLayout();
                                });
                            }
                        }
                    }
                    if (!ret) {
                        ret = Application.ensureScreenLayout();
                    }
                    Log.ret(Log.l.info);
                    return ret;
                },

                // start of frame initializing
                initialize: function () {
                    Log.call(Log.l.trace, "PageFrame.", "");
                    Log.print(Log.l.trace, "initialize Colors");
                    var themeId = 2;
                    if (Application.theme) {
                        switch (Application.theme) {
                            case "dark":
                                themeId = 1;
                                break;
                            case "light":
                                themeId = 0;
                                break;
                        }
                    } else if (AppData._persistentStates.manualTheme) {
                        if (AppData._persistentStates.isDarkTheme) {
                            themeId = 1;
                        } else {
                            themeId = 0;
                        }
                    }
                    if (themeId === 2 && typeof window.matchMedia === "function") {
                        AppData._persistentStates.manualTheme = false;
                        var prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");
                        AppData._persistentStates.isDarkTheme = prefersColorSchemeDark && prefersColorSchemeDark.matches;
                        if (!AppData._persistentStates.isDarkTheme && WinJS.UI._Accents && WinJS.UI._Accents._isDarkTheme) {
                            AppData._persistentStates.isDarkTheme = WinJS.UI._Accents._isDarkTheme;
                        }
                        if (typeof prefersColorSchemeDark.addListener === "function") {
                            prefersColorSchemeDark.addListener(this.onPrefersColorSchemeChange.bind(this));
                        } else if (typeof prefersColorSchemeDark.addEventListener === "function") {
                            prefersColorSchemeDark.addEventListener("change", this.onPrefersColorSchemeChange.bind(this), false);
                        }
                        document.addEventListener("colorschemechange", this.onPrefersColorSchemeChange.bind(this), false);
                    } else {
                        AppData._persistentStates.manualTheme = true;
                        AppData._persistentStates.isDarkTheme = (themeId === 1);
                    }
                    if (typeof AppData._persistentStates.individualColors === "undefined") {
                        AppData._persistentStates.individualColors = false;
                    }
                    if (!AppData._persistentStates.individualColors) {
                        AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                    }
                    var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                    var promise = colors._loadCssPromise || WinJS.Promise.timeout(0);
                    promise.then(function () {
                        // Before calling WinJS.UI.processAll you have to read resjson and set the global "strings" variable
                        // and before that the language has to be known from the device
                        // call getLocaleName via Globalization plugin
                        Log.print(Log.l.trace, "initialize Language");
                        if (Application.language) {
                            AppData._persistentStates.languageId = AppData.getIdFromLanguage(Application.language);
                        }
                        Application.pageframe.checkForLanguage();
                    });
                    Log.ret(Log.l.trace, "");
                },

                post_initialize: function () {
                    Log.call(Log.l.trace, "PageFrame.", "");

                    // reset navigation history
                    nav.history = app.sessionState.history || {};
                    nav.history.current.initialPlaceholder = true;

                    // add application state event handlers
                    document.addEventListener("resume", this.onResume.bind(this), false);
                    document.addEventListener("pause", this.onPause.bind(this), false);

                    // add network state event handlers
                    document.addEventListener("online", this.onOnline.bind(this), false);
                    document.addEventListener("offline", this.onOffline.bind(this), false);

                    // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work. 
                    ui.disableAnimations();

                    // instanciate the appbar 
                    Log.print(Log.l.info, "initialize AppBar");
                    var appBar = new AppBar.AppBarClass({
                        size: AppData._persistentStates.appBarSize,
                        hideOverflowButton: AppData._persistentStates.appBarHideOverflowButton
                    });

                    var defaultTerminateAppHandler = WinJS.Application._terminateApp;
                    WinJS.Application._terminateApp = function (data, e) {
                        if (AppBar.scope) {
                            var err = { status: data.errorNumber, statusText: data.description };
                            AppData.setErrorMsg(AppBar.scope.binding, err);
                        } else {
                            defaultTerminateAppHandler(data, e);
                        }
                    };

                    // instanciate the navigation bar 
                    var navigatorOptions;
                    if (AppData._persistentStates.navigatorOptions) {
                        navigatorOptions = AppData._persistentStates.navigatorOptions;
                    }
                    // go on with page navigation
                    var p = ui.processAll().then(function () {
                        Log.print(Log.l.trace, "initialize NavigationBar");
                        var navigationBar = new NavigationBar.ListViewClass(Application.navigationBarPages, Application.navigationBarGroups, Application.navigationMasterDetail, navigatorOptions);
                        var appHeaderPage = Application.getPagePath("appHeader");
                        var headerhost = document.querySelector("#headerhost");
                        if (appHeaderPage && headerhost) {
                            return WinJS.UI.Pages.render(appHeaderPage, headerhost);
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        var startPage = Application.initPage || Application.startPage;
                        var startPageId = Application.query && Application.query.pageId ||
                            Application.getPageId(startPage);
                        return Application.navigateById(startPageId, nav.state);
                    }).then(function () {
                        Log.print(Log.l.trace, "calling sched");
                        return sched.requestDrain(sched.Priority.aboveNormal + 1);
                    }).then(function () {
                        Log.print(Log.l.trace, "calling enableAnimations");
                        ui.enableAnimations();
                        return WinJS.Promise.timeout(Application.pageframe.splashScreenDone ? 0 : 10000);
                    }).then(function () {
                        return Application.pageframe.hideSplashScreen();
                    });
                    Log.ret(Log.l.trace, "");
                    return p;
                },

                // Calculates positioning of navigation bar and contenthost
                /**
                 * @function updateLayout
                 * @memberof Application.PageFrame
                 * @description Call this function to recalculate and update the positioning of all application UI elements only if you need this independent from application windows size change.
                 *  The {@link https://msdn.microsoft.com/en-us/library/windows/apps/hh466035.aspx window.onresize} event handler calls the {@link Application.PageControlNavigator._resized} function by default, so there is no need to respond to windows size change.
                 */
                updateLayout: function () {
                    Log.call(Log.l.u1, "PageFrame.", "");
                    if (Application.navigator) {
                        Application.navigator._resized();
                    }
                    Log.ret(Log.l.u1, "");
                },
                getMsgCursorPos: function (e) {
                    var ret;
                    Log.call(Log.l.u2, "PageFrame.", "");
                    if (!e) {
                        Log.print(Log.l.u2, "no event");
                        ret = { x: 0, y: 0 };
                    } else if (e.pageX || e.pageY) {
                        Log.print(Log.l.u2, "used pageX/pageY");
                        ret = { x: e.pageX, y: e.pageY };
                    } else if (e.clientX || e.clientY) {
                        Log.print(Log.l.u2, "used clientX/clientY");
                        ret = {
                            x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
                            y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop
                        };
                    } else {
                        ret = { x: 0, y: 0 };
                    }
                    Log.ret(Log.l.u2, "x=" + ret.x + " y=" + ret.y);
                    return ret;
                },
                /**
                 * @function screenToClient
                 * @param {Object} targetElement - A HTML element
                 * @param {Object} ptScreen - A point object with x and y members containing the screen coordinates of a point in px.
                 * @returns {Object} A point object with x and y members containing the relative coordinates of the point in px.
                 * @memberof Application.PageFrame
                 * @description Call this function to retrieve coordinates relatie to a given HTML element in the application.
                 */
                screenToClient: function (targetElement, ptScreen) {
                    Log.call(Log.l.u2, "PageFrame.", "ptScreen: x=" + ptScreen.x + " y=" + ptScreen.y);
                    var x = ptScreen.x;
                    var y = ptScreen.y;

                    // element offset is reflected in relation to different offset parents
                    // on different platforms! So, normalize to page fragment or document.body!
                    while (targetElement) {
                        x -= targetElement.offsetLeft;
                        y -= targetElement.offsetTop;
                        if ((targetElement.offsetParent.tagName === "div" ||
                            targetElement.offsetParent.tagName === "DIV") &&
                            targetElement.offsetParent.className.indexOf("pagecontrol") >= 0 ||
                            targetElement.offsetParent.tagName === "body" ||
                            targetElement.offsetParent.tagName === "BODY") {
                            break;
                        }
                        targetElement = targetElement.offsetParent;
                    }
                    if (NavigationBar.ListView && NavigationBar.ListView.listElement) {
                        var listElement = NavigationBar.ListView.listElement;
                        if (NavigationBar.orientation === "vertical") {
                            x -= listElement.clientWidth;
                        } else if (NavigationBar.orientation === "horizontal") {
                            y -= listElement.clientHeight;
                        }
                    }
                    if (AppBar.barElement && AppBar.barControl &&
                        AppBar._commandList && AppBar._commandList.length > 0) {
                        if (AppBar.barControl.placement === "top") {
                            y -= AppBar.barElement.clientHeight;
                        }
                    }

                    if (Application.navigator.masterElement && Application.navigator._nextMaster) {
                        x -= Application.navigator.masterElement.clientWidth;
                    }
                    // width of the splitviewpane @byhung
                    var splitView = document.querySelector("#root-split-view");
                    if (splitView) {
                        var splitViewControl = splitView.winControl;
                        if (splitViewControl &&
                            (splitViewControl.paneOpened &&
                                splitViewControl.openedDisplayMode === WinJS.UI.SplitView.OpenedDisplayMode.inline ||
                                !splitViewControl.paneOpened &&
                                splitViewControl.closedDisplayMode === WinJS.UI.SplitView.ClosedDisplayMode.inline)) {
                            var splitViewPane = document.querySelector("#root-split-view-pane");
                            if (splitViewPane && splitViewPane.clientWidth > 0) {
                                x -= splitViewPane.clientWidth;
                                x -= 10;
                            }
                        }
                    }
                    var splitViewToggle = document.querySelector("#root-split-view-toggle");
                    x += splitViewToggle.clientWidth;

                    var contenthost = document.querySelector("#contenthost");
                    if (contenthost) {
                        var element = contenthost.firstElementChild || contenthost.firstChild;
                        if (element) {
                            var contentarea = element.querySelector(".contentarea");
                            if (contentarea) {
                                if (contentarea.scrollLeft) {
                                    x += contentarea.scrollLeft;
                                }
                                if (contentarea.scrollTop) {
                                    y += contentarea.scrollTop;
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.u2, "x=" + x + " y=" + y);
                    return { x: x, y: y };
                },


                // get current display orientation 
                _getOrientation: function () {
                    Log.call(Log.l.u2, "PageFrame.", "");
                    var orientation = window.orientation;
                    if (typeof orientation === "undefined") {
                        // no orientation provided
                        if (window.innerWidth > window.innerHeight && window.innerWidth > Application.maxViewSize.small) {
                            orientation = 90;
                        } else {
                            orientation = 0;
                        }
                    }
                    Log.ret(Log.l.u2, "orientation=" + orientation);
                    return orientation;
                }
            }
        )
    });
})();
