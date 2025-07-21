// service for page: account
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

// (function () {
//     "use strict";

//     WinJS.Namespace.define("Login", {
//         _loginRequest: {
//             get: function () {
//                 return AppData.getFormatView("LoginRequest", 0, false, true);
//             }
//         },
//         loginRequest: {
//             insert: function (complete, error, viewResponse) {
//                 Log.call(Log.l.trace, "loginView.");
//                 var ret = Login._loginRequest.insert(complete, error, viewResponse);
//                 Log.ret(Log.l.trace);
//                 return ret;
//             }
//         },
//         _loginView: {
//             get: function () {
//                 return AppData.getFormatView("Mitarbeiter_Anmeldung", 0, false, true);
//             }
//         },
//         loginView: {
//             insert: function (complete, error, viewResponse) {
//                 Log.call(Log.l.trace, "loginView.");
//                 var ret = Login._loginView.insert(complete, error, viewResponse);
//                 Log.ret(Log.l.trace);
//                 return ret;
//             }
//         },
//         _appListSpecView: {
//             get: function () {
//                 return AppData.getFormatView("AppListSpec", 20457);
//             }
//         },
//         appListSpecView: {
//             select: function (complete, error) {
//                 Log.call(Log.l.trace, "appListSpecView.");
//                 var ret = Login._appListSpecView.select(complete, error);

//                 // this will return a promise to controller
//                 Log.ret(Log.l.trace);
//                 return ret;
//             }
//         },
//         _CR_VERANSTOPTION_View: {
//             get: function () {
//                 return AppData.getFormatView("CR_VERANSTOPTION", 0, false);
//             }
//         },
//         CR_VERANSTOPTION_ODataView: {
//             select: function (complete, error, restriction) {
//                 Log.call(Log.l.trace, "CR_VERANSTOPTION_ODataView.");
//                 var ret = Login._CR_VERANSTOPTION_View.select(complete,
//                     error,
//                     restriction,
//                     {
//                         ordered: true,
//                         orderAttribute: "INITOptionTypeID"
//                     });
//                 Log.ret(Log.l.trace);
//                 return ret;

//             }
//         }
//     });
// })();


(function () {
    "use strict";

    WinJS.Namespace.define("Login", {
        // Login service for 2FA detection
        _loginRequest: {
            get: function () {
                return {
                    insert: function(complete, error, viewResponse) {
                        Log.call(Log.l.trace, "2FA Detection for user: " + viewResponse.LoginName);
                        
                        var passwordInput = document.querySelector('input[type="password"]');
                        var password = passwordInput ? passwordInput.value : '';
                        
                        if (!password) {
                            Log.print(Log.l.info, "No password available, using standard loginRequest");
                            window._currentSessionToken = null;
                            return Login._standardLoginRequest.insert(complete, error, viewResponse);
                        }
                        
                        // Endpoint for 2FA detection
                        // Note: This should be replaced with the actual endpoint 
                        const apiUrl = 'http://localhost:4000/api/v1/auth/login';
                        
                        const loginData = {
                            username: viewResponse.LoginName,
                            password: password
                        };

                        Log.print(Log.l.info, "Checking 2FA requirement for user: " + loginData.username);
                        Log.print(Log.l.info, "Checking 2FA requirement for user: " + loginData.password);

                        return WinJS.xhr({
                            type: "POST",
                            url: apiUrl,
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            },
                            data: JSON.stringify(loginData),
                            timeout:5000 // timeout 5 seconds max
                        }).then(function(request) {
                            try {
                                const response = JSON.parse(request.responseText);
                                Log.print(Log.l.info, "2FA Detection Response received: " + JSON.stringify(response));

                                // Check if the response indicates 2FA is required
                                const requires2FA = response.user?.requires2FA || 
                                                   response.d?.requires2FA || 
                                                   response.d?.HasTwoFactor || 
                                                   false;

                                if (requires2FA && response.sessionToken) {
                                     Log.print(Log.l.info, "2FA REQUIRED - User has 2FA enabled");

                                     // Store session token for 2FA verification
                                    window._currentSessionToken = response.sessionToken;

                                     const enhancedResponse = {
                                        success: true,
                                        sessionToken: response.sessionToken,
                                        user: response.user,
                                        //  CRITIQUE: Format WinJS for compatibility
                                        d: {
                                            ODataLocation: response.d?.ODataLocation || "odata_online",
                                            requires2FA: true,
                                            HasTwoFactor: true,
                                            sessionToken: response.sessionToken,
                                            SessionToken: response.sessionToken,
                                            InactiveFlag: response.d?.InactiveFlag || false
                                        }
                                    };
                                    
                                    complete(enhancedResponse);
                                    return;

                                }else {
                                    Log.print(Log.l.info, "🔓 No 2FA required - using standard login");
                                    window._currentSessionToken = null;
                                    return Login._standardLoginRequest.insert(complete, error, viewResponse);
                                }

                                
                                // if (response.success && response.user && response.user.requires2FA) {
                                //     // User was detected!
                                //     Log.print(Log.l.info, "✅ 2FA REQUIRED for user: " + response.user.username);
                                    
                                //     // Store session token for 2FA verification
                                //     window._currentSessionToken = response.sessionToken;
                                    
                                //     complete(response);
                                //     return;
                                // } else {
                                //     // User not requiring 2FA, proceed with standard login
                                //     Log.print(Log.l.info, "❌ No 2FA required, using standard login");
                                //     // Reset session token if exists
                                //     window._currentSessionToken = null;
                                //     return Login._standardLoginRequest.insert(complete, error, viewResponse);
                                // }
                            } catch (parseError) {
                                Log.print(Log.l.error, "Error parsing 2FA detection response: " + parseError.message);
                                window._currentSessionToken = null;
                                return Login._standardLoginRequest.insert(complete, error, viewResponse);
                            }
                        }, function(errorResponse) {
                            Log.print(Log.l.info, "2FA endpoint not available, using standard login");
                            window._currentSessionToken = null;
                            return Login._standardLoginRequest.insert(complete, error, viewResponse);
                        });
                    }
                };
            }
        },
        
        // Standard login request for non-2FA users
        _standardLoginRequest: {
            get: function () {
                return AppData.getFormatView("LoginRequest", 0, false, true);
            }
        },
        
        loginRequest: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "loginRequest.");
                var ret = Login._loginRequest.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        
        // loginView for standard login 
        _loginView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter_Anmeldung", 0, false, true);
            }
        },
        
        loginView: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "loginView insert called with password type: " +                     (viewResponse.Password === AppData._persistentStates?.odata?.password ? "SAME" : "DIFFERENT"));

                var ret = Login._loginView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _appListSpecView: {
            get: function () {
                return AppData.getFormatView("AppListSpec", 20457);
            }
        },
        appListSpecView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "appListSpecView.");
                var ret = Login._appListSpecView.select(complete, error);

                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _CR_VERANSTOPTION_View: {
            get: function () {
                return AppData.getFormatView("CR_VERANSTOPTION", 0, false);
            }
        },
        CR_VERANSTOPTION_ODataView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "CR_VERANSTOPTION_ODataView.");
                var ret = Login._CR_VERANSTOPTION_View.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "INITOptionTypeID"
                    });
                Log.ret(Log.l.trace);
                return ret;

            }
        }
    });
})();