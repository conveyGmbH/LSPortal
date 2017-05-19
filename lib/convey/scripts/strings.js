// Collection of String utility functions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />

"use strict";

(function() {
    "use strict";

    WinJS.Utilities._require([
        'WinJS/Core/_Global',
        'WinJS/Core/_Base'
    ], function resourcesInit(_Global, _Base) {
        "use strict";

        function get() {
            var resources = null;
            try {
                resources = _Global.Windows.ApplicationModel.Resources.Core;
            } catch (e) { }
            return resources;
        }
        WinJS.Namespace.define("Resources", {
            get: get
        });
    });

})();
/* 

// retrieve resource text value

function getResourceText(
   resourceName   // is a string containing the resource name
 );

 Purpose:
   Retrieves the language specific resource text

*/

function getResourceText(resourceName) {
    Log.call(Log.l.u1);
    var string = WinJS.Resources.getString(resourceName);
    if (string) {
        Log.ret(Log.l.u1, string.value);
        return string.value;
    } else {
        Log.ret(Log.l.u1);
        return null;
    }
}

function getResourceTextSection(sectionName) {
    Log.call(Log.l.u1);
    var ret = {};
    var strings = window.strings;
    if (sectionName && strings) {
        for (var prop in strings) {
            if (strings.hasOwnProperty(prop)) {
                if (prop.substr(0, sectionName.length + 1) === sectionName + ".") {
                    var newProp = prop.substr(sectionName.length + 1, prop.length - sectionName.length - 1);
                    ret[newProp] = strings[prop];
                    Log.print(Log.l.u1, newProp + ": " + ret[newProp]);
                }
            }
        }
    }
    Log.ret(Log.l.u1);
    return ret;
}

function getEmptyDefaultValue(defaultValue) {
    var ret = {};
    Log.call(Log.l.u1);
    for (var prop in defaultValue) {
        if (defaultValue.hasOwnProperty(prop)) {
            var type = typeof defaultValue[prop];
            if (type === "string") {
                ret[prop] = "";
            } else if (type === "number") {
                ret[prop] = 0;
            }
        }
    }
    Log.ret(Log.l.u1);
    return ret;
}

/* 

// binding of resource text to element

function bindResource(
   element,       // is an element object
   resourceName   // is a string containing the resource name
 );

 Purpose:
   Retrieves the language specific resource text and 
   replaces the textContent of element by this text

*/
function bindResource(element, resourceName) {
    Log.call(Log.l.u2);
    if (element) {
        element.textContent = getResourceText(resourceName);
    }
    Log.ret(Log.l.u2);
}

// eliminate Sybase bad character!
function jsonParse(text) {
    if (text && typeof text === "string") {
        var cleanText = text.replace(/\x1a/g, "?");
        return JSON.parse(cleanText);
    } else {
        return null;
    }
}


// alert box via Flyout
(function() {
    "use strict";

    WinJS.Namespace.define("Application", {
        _alertHandler: null,
        alertHandler: {
            get: function() {
                return Application._alertHandler;
            },
            set: function(aHandler) {
                Application._alertHandler = aHandler;
            }
        },
        // alert box functionality
        _initAlert: function() {
            Log.call(Log.l.trace, "Application.", "");
            var okButton = document.querySelector("#okButton");
            if (okButton) {
                okButton.addEventListener("click", function(event) {
                    Application._closeAlert();
                    if (typeof Application.alertHandler === "function") {
                        Application.alertHandler(true);
                        Application.alertHandler = null;
                    }
                }, false);
            }
            var cancelButton = document.querySelector("#cancelButton");
            if (cancelButton) {
                cancelButton.addEventListener("click", function(event) {
                    Application._closeAlert();
                    if (typeof Application.alertHandler === "function") {
                        Application.alertHandler(false);
                        Application.alertHandler = null;
                    }
                }, false);
            }
            Log.ret(Log.l.trace);
        },
        _closeAlert: function() {
            Log.call(Log.l.trace, "Application.", "");
            var alertFlyout = document.querySelector("#alertFlyout");
            if (alertFlyout && alertFlyout.winControl) {
                var alertText = document.querySelector("#alertText");
                if (alertText) {
                    alertText.textContent = "";
                }
                alertFlyout.winControl.hide();
            }
            Log.ret(Log.l.trace);
        },
        alert: function(text, handler) {
            Log.call(Log.l.trace, "Application.", "text=" + text);
            var alertFlyout = document.querySelector("#alertFlyout");
            if (alertFlyout && alertFlyout.winControl) {
                var alertText = document.querySelector("#alertText");
                if (alertText) {
                    alertText.textContent = text;
                }
                if (alertFlyout.winControl.hidden) {
                    Application.alertHandler = handler;
                    var context = { flyoutOk: getResourceText('flyout.ok') };
                    var cancelButton = document.querySelector("#cancelButton");
                    if (cancelButton && cancelButton.style.display !== "none") {
                        cancelButton.style.display = "none";
                    }
                    var okButton = document.querySelector("#okButton");
                    if (okButton) {
                        WinJS.Binding.processAll(okButton, context);
                        var anchor = (AppBar && AppBar.scope && AppBar.scope.element) ? AppBar.scope.element : document.body;
                        alertFlyout.winControl.show(anchor);
                    }
                }
            }
            Log.ret(Log.l.trace);
        },
        confirm: function(text, handler) {
            Log.call(Log.l.trace, "Application.", "text=" + text);
            var alertFlyout = document.querySelector("#alertFlyout");
            if (alertFlyout && alertFlyout.winControl) {
                var alertText = document.querySelector("#alertText");
                if (alertText) {
                    alertText.textContent = text;
                }
                if (alertFlyout.winControl.hidden) {
                    Application.alertHandler = handler;
                    var context = {
                        flyoutOk: getResourceText('flyout.ok'),
                        flyoutCancel: getResourceText('flyout.cancel')
                    };
                    var cancelButton = document.querySelector("#cancelButton");
                    if (cancelButton && cancelButton.style.display === "none") {
                        cancelButton.style.display = "";
                        WinJS.Binding.processAll(cancelButton, context);
                    }
                    var okButton = document.querySelector("#okButton");
                    if (okButton) {
                        WinJS.Binding.processAll(okButton, context);
                        var anchor = (AppBar && AppBar.scope && AppBar.scope.element) ? AppBar.scope.element : document.body;
                        alertFlyout.winControl.show(anchor);
                    }
                }
            }
            Log.ret(Log.l.trace);
        }
    });
})();

function alert(text, handler) {
    Application.alert(text, handler);
}

function confirm(text, handler) {
    Application.confirm(text, handler);
}


/* @nedra: 10.09.2015: date function */
function getDatum() {
    // current date
    var date = new Date();
    // getMonth() returns an integer between 0 and 11. 0 corresponds to January, 11 to December.
    var month = date.getMonth() + 1;
    var monthStr = month.toString();
    if (month >= 1 && month <= 9) {
        monthStr = "0" + monthStr;
    }
    var day = date.getDate();
    var dayStr = day.toString();
    if (day >= 1 && day <= 9) {
        dayStr = "0" + dayStr;
    }
    var year = date.getFullYear();
    var yearStr = year.toString();
    // string result for date
    return dayStr + "." + monthStr + "." + yearStr;
}


/* @nedra:10.09.2015: clock function*/
function getClock() {
    // current date
    var date = new Date();
    var hour = date.getHours();
    var hourStr = hour.toString();
    if (hour >= 0 && hour <= 9) {
        hourStr = "0" + hourStr;
    }
    var minute = date.getMinutes();
    var minuteStr = minute.toString();
    if (minute >= 0 && minute <= 9) {
        minuteStr = "0" + minuteStr;
    }
    return hourStr + ":" + minuteStr;
}

function fireEvent(eventName, element) {
    if (!element) {
        element = document;
    }
    // Gecko-style approach (now the standard) takes more work
    var eventClass;

    // Different events have different event classes.
    // If this switch statement can't map an eventName to an eventClass,
    // the event firing is going to fail.
    switch (eventName) {
        case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
        case "mousedown":
        case "mouseup":
            eventClass = "MouseEvents";
            break;

        case "focus":
        case "change":
        case "blur":
        case "select":
            eventClass = "HTMLEvents";
            break;

        default:
            eventClass = "HTMLEvents";
            break;
    }
    // dispatch for firefox + others
    var evt = document.createEvent(eventClass);
    evt.initEvent(event, true, true); // event type,bubbling,cancelable
    return !element.dispatchEvent(evt);
}

function utf8_encode(argString) {
    //  discuss at: http://phpjs.org/functions/utf8_encode/ 
    // original by: Webtoolkit.info (http://www.webtoolkit.info/) 
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net) 
    // improved by: sowberry 
    // improved by: Jack 
    // improved by: Yves Sucaet 
    // improved by: kirilloid 
    // bugfixed by: Onno Marsman 
    // bugfixed by: Onno Marsman 
    // bugfixed by: Ulrich 
    // bugfixed by: Rafal Kukawski 
    // bugfixed by: kirilloid 
    //   example 1: utf8_encode('Kevin van Zonneveld'); 
    //   returns 1: 'Kevin van Zonneveld' 


    if (argString === null || typeof argString === 'undefined') {
        return '';
    }


    // .replace(/\r\n/g, "\n").replace(/\r/g, "\n"); 
    var string = (argString + '');
    var utftext = '',
      start, end, stringl = 0;


    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;


        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode(
              (c1 >> 6) | 192, (c1 & 63) | 128
            );
        } else if ((c1 & 0xF800) !== 0xD800) {
            enc = String.fromCharCode(
              (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
            );
        } else {
            // surrogate pairs 
            if ((c1 & 0xFC00) !== 0xD800) {
                throw new RangeError('Unmatched trail surrogate at ' + n);
            }
            var c2 = string.charCodeAt(++n);
            if ((c2 & 0xFC00) !== 0xDC00) {
                throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
            }
            c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
            enc = String.fromCharCode(
              (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
            );
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }


    if (end > start) {
        utftext += string.slice(start, stringl);
    }


    return utftext;
}


