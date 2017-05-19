// general app settings
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/sqlite.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("AppData", {
        _persistentStatesDefaults: {
            colorSettings: {
                // navigation-color with 100% saturation and brightness
                accentColor: "#0078D7"
            },
            languageId: 0,
            prevLanguageId: 0,
            showAppBkg: false,
            logEnabled: false,
            logLevel: 3,
            logGroup: false,
            logNoStack: true,
            inputBorder: 1,
            odata: {
                https: true,
                hostName: "",
                onlinePort: 8090,
                urlSuffix: null,
                onlinePath: "odata_online", // serviceRoot online requests
                login: "",
                password: "",
                registerPath: "odata_register", // serviceRoot register requests
                registerLogin: "",
                registerPassword: "",
                useOffline: true,
                replActive: true,
                replInterval: 30,
                replPrevPostMs: 0,
                replPrevSelectMs: 0,
                replPrevFlowSpecId: 0,
                replSyncPostOrder: false,
                dbSiteId: 0,
                serverSiteId: 1,
                timeZoneAdjustment: 0,
                timeZoneRemoteAdjustment: null,
                timeZoneRemoteDiffMs: 0,
                serverFailure: false
            }
        },
        _persistentStates: {},
        _db: null,
        _dbInit: null,
        _formatViews: [],
        _lgntInits: []
    });

    WinJS.Namespace.define("AppData", {
        persistentStatesDefaults: {
            set: function(newPersistentStatesDefaults) {
                AppData._persistentStatesDefaults = newPersistentStatesDefaults;
                AppData._persistentStates = newPersistentStatesDefaults;
            },
            get: function() {
                return AppData._persistentStatesDefaults;
            }
        },
        getBaseURL: function (port) {
            return (AppData._persistentStates.odata.https ? "https" : "http") + "://" + AppData._persistentStates.odata.hostName +
                   (port !== 80 && port !== 443 ? ":" + port : "") +
                   (AppData._persistentStates.odata.urlSuffix ? ("/" + AppData._persistentStates.odata.urlSuffix) : "");
        },
        getOnlinePath: function(isRegister) {
            return isRegister ? AppData._persistentStates.odata.registerPath : AppData._persistentStates.odata.onlinePath;
        },
        getOnlineLogin: function(isRegister) {
            return isRegister ? AppData._persistentStates.odata.registerLogin : 
                (AppData._persistentStates.odata.login ? AppData._persistentStates.odata.login : (window.device && window.device.uuid));
        },
        getOnlinePassword: function (isRegister) {
            return isRegister ? AppData._persistentStates.odata.registerPassword :
                (AppData._persistentStates.odata.password ? AppData._persistentStates.odata.password : (window.device && window.device.uuid));
        }
    });
    WinJS.Namespace.define("AppData", {
        getErrorMsgFromResponse: function(errorResponse) {
            var errorMsg = "Error occured!";
            if (errorResponse) {
                if (typeof errorResponse === "string") {
                    errorMsg += "\r\n" + errorResponse;
                } else if (typeof errorResponse === "number") {
                    errorMsg += " Status: " + errorResponse;
                } else if (typeof errorResponse === "object") {
                    if (errorResponse.status || errorResponse.code) {
                        errorMsg += " Status: ";
                        errorMsg += (errorResponse.status || errorResponse.code);
                        if (errorResponse.statusText || errorResponse.message) {
                            errorMsg += "\r\n" + (errorResponse.statusText || errorResponse.message);
                        }
                    }
                    if (!errorResponse.data && (errorResponse.responseText || errorResponse.response)) {
                        try {
                            errorResponse.data = JSON.parse(errorResponse.responseText || errorResponse.response);
                        } catch (exception) {
                            Log.print(Log.l.error, "resource parse error " + (errorResponse.responseText || errorResponse.response));
                        }
                    }
                    if (errorResponse.data) {
                        var data = errorResponse.data;
                        if (data.error) {
                            Log.print(Log.l.error, "error code=" + data.error.code);
                            errorMsg += "\r\ncode=" + data.error.code;
                            if (data.error.message) {
                                Log.print(Log.l.error, "error message=" + data.error.message.value);
                                errorMsg += "\r\nmessage=" + data.error.message.value;
                            }
                        }
                        if (data.code || data.errno || data.hostname || data.syscall) {
                            errorMsg += "\r\nhostname=" + data.hostname +
                                "\r\nsyscall=" + data.syscall +
                                "\r\ncode=" + data.code +
                                "\r\nerrno=" + data.errno;
                        }
                    }
                }
            }
            return errorMsg;
        },
        setErrorMsg: function(obj, errorResponse) {
            if (obj) {
                var error;
                if (errorResponse) {
                    error = {
                        errorMsg: AppData.getErrorMsgFromResponse(errorResponse),
                        displayErrorMsg: "block"
                    }
                } else {
                    error = {
                        errorMsg: "",
                        displayErrorMsg: "none"
                    }
                }
                obj.error = error;
                if (AppBar.scope && AppBar.scope.element) {
                    var closeErrorMessage = function(element) {
                        WinJS.UI.Animation.fadeOut(element).done(function () {
                            obj.error = {
                                errorMsg: "",
                                displayErrorMsg: "none"
                            }
                        });
                    }
                    var errorMessage = AppBar.scope.element.querySelector(".error-message");
                    if (errorMessage) {
                        errorMessage.onclick = function (event) {
                            closeErrorMessage(errorMessage);
                        }
                        //WinJS.Promise.timeout(30000).then(function() {
                        //    closeErrorMessage(errorMessage);
                        //});
                        if (errorResponse) {
                            //WinJS.UI.Animation.fadeIn(errorMessage).done(function() {
                            if (errorMessage.style) {
                                errorMessage.style.opacity = "";
                            }
                            //});
                        }
                    }
                }
            }
        },
        // language property
        _language: "",
        language: {
            get: function () { return Application._language; },
            set: function(newLanguage) {
                 Application._language = newLanguage;
            }
        },
        getLanguageFromId: function (languageId) {
            var languages = AppData.getDefLanguages();
            for (var i = 0; i < languages.length; i++) {
                var row = languages[i];
                if (row.LanguageSpecID === languageId) {
                    Log.print(Log.l.trace, "found in default languages: " + row.DOMCode);
                    var pos = row.DOMCode.indexOf("-");
                    var language;
                    if (pos >= 0) {
                        language = row.DOMCode.substr(0, pos) + "-" + row.DOMCode.substr(pos + 1).toUpperCase();
                    } else {
                        language = row.DOMCode + "-" + row.DOMCode.toUpperCase();
                    }
                    return language;
                }
            }
            return "en-US";
        },
        getLanguageId: function () {
            var language = Application.language.toLowerCase();
            var languages = AppData.getDefLanguages();
            for (var i = 0; i < languages.length; i++) {
                var row = languages[i];
                if (row.DOMCode.toLowerCase() === language) {
                    Log.print(Log.l.trace, "found in default languages: " + row.LanguageSpecID);
                    return row.LanguageSpecID;
                }
            }
            return 1033;
        },
        appSettings: {
            get: function() {
                var data = {
                    odata: AppData._persistentStates.odata
                };
                return data;
            }
        },
        setConnectionProperties: function(db, properties, complete, error) {
            Log.call(Log.l.trace, "createConnectionProperties.");

            var modifyProp = function(tx, prop, params) {
                var query = "SELECT * FROM \"ConnectionProperties\" WHERE \"Key\" = ?";
                var stmtInsert = "INSERT INTO \"ConnectionProperties\"(\"Value\",\"Text\",\"Key\") VALUES(?,?,?)";
                var stmtUpdate = "UPDATE \"ConnectionProperties\" SET \"Value\" = ?,\"Text\" = ? WHERE \"Key\" = ?";
                Log.print(Log.l.info, "createConnectionProperties.modifyProp: " + [query, [prop]]);
                tx.executeSql(query, [prop], function(tx2, res2) {
                    var nextStmt;
                    Log.print(Log.l.info, "createConnectionProperties.modifyProp: result count=" + res2.rows.length);
                    if (res2.rows.length === 0) {
                        nextStmt = stmtInsert;
                    } else {
                        nextStmt = stmtUpdate;
                    }
                    Log.print(Log.l.info, "createConnectionProperties.modifyProp: " + [nextStmt, params]);
                    tx2.executeSql(nextStmt, params, function (tx3, res3) {
                        Log.print(Log.l.info, "createConnectionProperties.modifyProp: " + "success!");
                    }, function (tx3, err) {
                        error(err);
                    });
                }, function(tx2, err) {
                    error(err);
                });
            }
            var values = [];
            var stmt = "PRAGMA foreign_keys = 1";
            Log.print(Log.l.info, stmt);
            var ret = SQLite.xsql(db, stmt, values).then(function() {
                Log.print(Log.l.info, "PRAGMA foreign_keys = 1: success!");
                stmt = "PRAGMA recursive_triggers = 1";
                Log.print(Log.l.info, stmt);
                return SQLite.xsql(db, stmt, values).then(function () {
                    Log.print(Log.l.info, "PRAGMA recursive_triggers = 1: success!");
                }, function (err) {
                    Log.print(Log.l.error, "PRAGMA recursive_triggers = 1: error!");
                    error(err);
                });
            }, function (err) {
                Log.print(Log.l.error, "PRAGMA foreign_keys = 1: error!");
                error(err);
            }).then(function () {
                stmt = "CREATE TABLE IF NOT EXISTS \"ConnectionProperties\"(\"ConnectionPropertiesID\" INTEGER,\"Key\" TEXT UNIQUE NOT NULL,\"Value\" INTEGER,\"Text\" TEXT,PRIMARY KEY(\"ConnectionPropertiesID\"))";
                Log.print(Log.l.info, stmt);
                return SQLite.xsql(db, stmt, values).then(function () {
                    Log.print(Log.l.info, "createConnectionProperties: CREATE TABLE success!");
                }, function (err) {
                    Log.print(Log.l.error, "createConnectionProperties: CREATE TABLE: error!");
                    error(err);
                });
            }).then(function () {
                return SQLite.tx(db, function(tx) {
                    for (var prop in properties) {
                        if (properties.hasOwnProperty(prop)) {
                            var value = null;
                            var text = null;
                            var type = typeof properties[prop];
                            if (type === "number") {
                                value = properties[prop];
                            } else {
                                text = properties[prop];
                            }
                            var params = [value, text, prop];
                            modifyProp(tx, prop, params);
                        }
                    }
                }).then(function() {
                    Log.print(Log.l.trace, "createConnectionProperties.db.transaction complete!");
                    complete();
                }, function(err) {
                    Log.print(Log.l.error, "createConnectionProperties.db.transaction error!");
                    error(err);
                });
            });
            Log.ret(Log.l.trace);
            return ret;
        }
    });
})();