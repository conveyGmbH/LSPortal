// implements an application-wide tool and menu bar
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/colors.js" />
/// <reference path="~/plugins/cordova-plugin-device/www/device.js" />

function getSubDocument(embeddingElement) {
    if (embeddingElement.nodeName === "svg" ||
        embeddingElement.nodeName === "SVG") {
        return embeddingElement;
    }
    if (embeddingElement.contentDocument) {
        return embeddingElement.contentDocument;
    } else {
        var subdoc = null;
        try {
            subdoc = embeddingElement.getSVGDocument();
        } catch (e) {
        }
        return subdoc;
    }
}

(function () {
    "use strict";

    WinJS.Namespace.define("AppBar", {
        outputCommand: WinJS.UI.eventHandler(function(ev) {
            Log.call(Log.l.trace, "AppBar.");
            var commandId = null;
            var command = ev.currentTarget;
            if (command && command.winControl) {
                commandId = command.winControl.commandId;
                if (!commandId && command.winControl._originalICommand) {
                    commandId = command.winControl._originalICommand.commandId;
                }
                var label = command.winControl.label || command.winControl.icon || "button";
                var section = command.winControl.section || "";
                var msg = section + " command " + label + " with id=" + commandId + " was pressed";
                Log.print(Log.l.trace, msg);
            }
            if (commandId) {
                if (AppBar.barControl && AppBar.barControl.opened) {
                    Log.print(Log.l.u1, "closing AppBar");
                    AppBar.barControl.close();
                }
                if (AppBar._eventHandlers) {
                    var handler = AppBar._eventHandlers[commandId];
                    if (typeof handler == 'function') {
                        Log.print(Log.l.u1, "calling handler");
                        handler(ev);
                    }
                }
            }
            Log.ret(Log.l.trace);
        }),

        // define a class for the appbar
        AppBarClass: WinJS.Class.define(
            // Define the constructor function for the ListViewClass.
            function AppBarClass(settings) {
                Log.call(Log.l.trace, "AppBar.");
                this._element = document.querySelector("#appbar");
                AppBar._appBar = this;
                document.body.addEventListener("keydown", function(e) {
                    return AppBar._appBar._handleKeydown(e);
                }.bind(this), true);
                Log.ret(Log.l.trace);
            }, {
                // anchor for element istself
                _element: null,
                _promises: null,
                _handleKeydown: function(e) {
                    var commandElement = null;
                    if (!e.ctrlKey && !e.altKey) {
                        if (AppBar._commandList && AppBar.barControl && AppBar.barControl.data) {
                            for (var i = 0; i < AppBar._commandList.length; i++) {
                                if (AppBar._commandList[i].key === e.keyCode) {
                                    var command = AppBar.barControl.data.getAt(i);
                                    if (command && !command.disabled) {
                                        commandElement = command.element;
                                    }
                                    e.stopImmediatePropagation();
                                    break;
                                }
                            }
                        }
                    }
                    if (commandElement) {
                        commandElement.focus();
                    }
                }
            }
        ),
        loadIcons: function() {
            Log.call(Log.l.u2, "AppBar.");
            if (AppBar._commandList && AppBar.barControl && AppBar.barControl.data) {
                for (var i = 0; i < AppBar._commandList.length; i++) {
                    var section = AppBar._commandList[i].section;
                    var svg = AppBar._commandList[i].svg;
                    if (section === 'primary' && svg) {
                        var command = AppBar.barControl.data.getAt(i);
                        if (command && command.element) {
                            var winCommandimage = command.element.querySelector(".win-commandimage");
                            if (winCommandimage) {
                                var svgObject = document.createElement("div");
                                if (svgObject) {
                                    svgObject.setAttribute("width", "24");
                                    svgObject.setAttribute("height", "24");
                                    svgObject.style.display = "inline";
                                    svgObject.id = svg;

                                    // insert svg object before span element
                                    var parentNode = winCommandimage.parentNode;
                                    parentNode.insertBefore(svgObject, winCommandimage);

                                    // overlay span element over svg object to enable user input
                                    winCommandimage.setAttribute("style", "position: relative; top: -28px; width: 24px; height: 24px;");

                                    // load the image file
                                    var promise = Colors.loadSVGImage({
                                        fileName: svg,
                                        color: Colors.navigationColor,
                                        element: svgObject
                                    });
                                    AppBar._appBar._promises.push(promise);
                                }
                            }
                        }
                    }
                }
            }
            Log.ret(Log.l.u2);
        },
        scope: {
            get: function() { return AppBar._scope; },
            set: function(newScope) {
                AppBar._scope = newScope;
                AppBar._notifyModified = false;
                AppBar._modified = false;
                AppBar._busy = false;
            }
        },
        eventHandlers: {
            get: function() { return AppBar._eventHandlers; },
            set: function(newEventHandlers) {
                Log.call(Log.l.u2, "AppBar.eventHandlers.");
                AppBar._eventHandlers = newEventHandlers;
                Log.ret(Log.l.u2);
            }
        },
        disableHandlers: {
            get: function() { return AppBar._disableHandlers; },
            set: function(newDisableHandlers) {
                Log.call(Log.l.u2, "AppBar.disableHandlers.");
                if (AppBar._scope && newDisableHandlers) {
                    AppBar._disableCommandIds = [];
                    AppBar._disableHandlers = [];
                    for (var commandId in newDisableHandlers) {
                        if (newDisableHandlers.hasOwnProperty(commandId)) {
                            AppBar._disableCommandIds.push(commandId);
                            AppBar._disableHandlers.push(newDisableHandlers[commandId]);
                        }
                    }
                } else {
                    AppBar._disableCommandIds = null;
                    AppBar._disableHandlers = null;
                }
                if (AppBar._commandList) {
                    for (var j = 0; j < AppBar._commandList.length; j++) {
                        var disableHandler = null;
                        if (AppBar._disableCommandIds) {
                            for (var k = 0; k < AppBar._disableCommandIds.length; k++) {
                                if (AppBar._disableCommandIds[k] === AppBar._commandList[j].id) {
                                    Log.print(Log.l.u1, "disableHandler for commandId=", AppBar._commandList[j].id);
                                    disableHandler = AppBar._disableHandlers[k];
                                    break;
                                }
                            }
                        }
                        if (typeof disableHandler === "function") {
                            Log.print(Log.l.u1, "call disableHandler of commandId=", AppBar._commandList[j].id);
                            AppBar.disableCommand(AppBar._commandList[j].id, disableHandler());
                        } else {
                            Log.print(Log.l.u1, "enable commandId=", AppBar._commandList[j].id);
                            AppBar.disableCommand(AppBar._commandList[j].id, false);
                        }
                    }
                }
                Log.ret(Log.l.u2);
            }
        },
        triggerDisableHandlers: function() {
            if (AppBar._commandList && AppBar._disableHandlers) {
                for (var j = 0; j < AppBar._commandList.length; j++) {
                    var disableHandler = null;
                    if (AppBar._disableCommandIds) {
                        for (var k = 0; k < AppBar._disableCommandIds.length; k++) {
                            if (AppBar._disableCommandIds[k] === AppBar._commandList[j].id) {
                                Log.print(Log.l.u1, "disableHandler for commandId=", AppBar._commandList[j].id);
                                disableHandler = AppBar._disableHandlers[k];
                                break;
                            }
                        }
                    }
                    if (typeof disableHandler === "function") {
                        Log.print(Log.l.u1, "call disableHandler of commandId=", AppBar._commandList[j].id);
                        AppBar.disableCommand(AppBar._commandList[j].id, disableHandler());
                    }
                }
            }
        },
        commandList: {
            get: function() { return AppBar._commandList; },
            set: function(newCommandList) {
                Log.call(Log.l.u2, "AppBar.commandList.");
                if (typeof AppBar._detachDisableHandlers === "function") {
                    AppBar._detachDisableHandlers();
                    AppBar._detachDisableHandlers = null;
                }
                AppBar._appBar._promises = [];
                if (AppBar.barControl) {
                    var i;
                    if (!AppBar.barControl.data) {
                        AppBar.barControl.data = new WinJS.Binding.List();
                    } else {
                        AppBar.barControl.data.length = 0;
                    }
                    // remove clickBack on all platforms except iOS - problem: Windows Desktop < 10!
                    if (typeof device === "object" && device.platform !== "iOS" &&
                        document.body.clientWidth <= 499) {
                        for (i = 0; i < newCommandList.length; i++) {
                            if (newCommandList[i].id === "clickBack") {
                                newCommandList[i].section = "secondary";
                                break;
                            }
                        }
                    }

                    // place enter key command as most right primary
                    var idxKeyEnter = -1;
                    for (i = 0; i < newCommandList.length; i++) {
                        if (newCommandList[i].section === "primary") {
                            if (idxKeyEnter < 0 && newCommandList[i].key === WinJS.Utilities.Key.enter) {
                                idxKeyEnter = i;
                                break;
                            }
                        }
                    }
                    var idxPrimary = -1;
                    if (idxKeyEnter >= 0) {
                        var width = 54; // always add ... extra space
                        for (i = 0; i < newCommandList.length; i++){
                            if (newCommandList[i].section === "primary") {
                                width += 68;
                                idxPrimary = i;
                            }
                            if (width > document.body.clientWidth) {
                                break;
                            }
                        }
                        if (idxPrimary >= 0 && idxPrimary !== idxKeyEnter) {
                            var enterCommand = newCommandList.slice(idxKeyEnter)[0];
                            var prevCommand = newCommandList.splice(idxPrimary, 1, enterCommand)[0];
                            newCommandList.splice(idxKeyEnter, 1, prevCommand);
                        }
                    }
                    // enable/disable AppBar
                    if (newCommandList.length > 0) {
                        var existsPrimary = false;
                        for (i = 0; i < newCommandList.length; i++) {
                            if (newCommandList[i].section === "primary") {
                                existsPrimary = true;
                                break;
                            }
                        }
                        AppBar.barControl.disabled = false;
                        if (existsPrimary) {
                            AppBar.barControl.closedDisplayMode = "compact";
                        } else {
                            AppBar.barControl.closedDisplayMode = "minimal";
                        }
                    } else {
                        AppBar.barControl.disabled = true;
                        AppBar.barControl.closedDisplayMode = "none";
                    }
                    AppBar.barControl.close();

                    if (newCommandList.length > 0 && AppBar.barControl.data) {
                        // insert new buttons
                        for (i = 0; i < newCommandList.length; i++) {
                            Log.print(Log.l.u1,
                                "section=" + newCommandList[i].section +
                                " id=" + newCommandList[i].commandId +
                                " label=" + newCommandList[i].label +
                                " svg=" + newCommandList[i].svg);
                            if (!newCommandList[i].onclick) {
                                newCommandList[i].onclick = AppBar.outputCommand;
                            }
                            if (typeof newCommandList[i].disabled === "undefined") {
                                newCommandList[i].disabled = true;
                            }
                            newCommandList[i].commandId = newCommandList[i].id;
                            var command = new WinJS.UI.AppBarCommand(null, newCommandList[i]);
                            AppBar.barControl.data.push(command);
                        }
                    }
                    if (AppBar.barElement) {
                        // set the foreground elements color
                        var ellipsisElements = AppBar.barElement.querySelectorAll("hr.win-command, .win-appbar-ellipsis, .win-label");
                        if (ellipsisElements && ellipsisElements.length > 0) {
                            for (var j = 0; j < ellipsisElements.length; j++) {
                                ellipsisElements[j].style.color = AppBar.textColor;
                            }
                        }
                    }
                }
                AppBar._commandList = newCommandList;
                AppBar._eventHandlers = null;
                AppBar._disableHandlers = null;
                AppBar._disableCommandIds = null;
                AppBar.loadIcons();
                WinJS.Promise.timeout(0).then(function () {
                    if (Application.navigator) {
                        Application.navigator._resized();
                    }
                });
                Log.ret(Log.l.u2);
            }
        },
        // DOM element property, returns the DOM element
        barElement: {
            get: function() { return AppBar._appBar && AppBar._appBar._element; }
        },
        // winControl property, returns the WinJS control
        barControl: {
            get: function() { return AppBar._appBar && AppBar._appBar._element && AppBar._appBar._element.winControl; }
        },
        textColor: {
            get: function() { return AppBar._textColor; }
        },
        disableCommand: function(commandId, disabled) {
            Log.call(Log.l.u1, "AppBar.", "commandId=" + commandId + " disabled=" + disabled);
            if (AppBar._commandList && AppBar.barControl && AppBar.barControl.data) {
                for (var i = 0; i < AppBar._commandList.length; i++) {
                    if (AppBar._commandList[i].id === commandId) {
                        var command = AppBar.barControl.data.getAt(i);
                        if (command) {
                            command.disabled = disabled;
                        }
                        break;
                    }
                }
            }
            Log.ret(Log.l.u1);
        },
        notifyModified: {
            get: function() {
                return (AppBar._notifyModified);
            },
            set: function (newNotifyModified) {
                AppBar._notifyModified = newNotifyModified;
                if (newNotifyModified) {
                    AppBar.triggerDisableHandlers();
                }
            }
        },
        modified: {
            get: function () {
                if (AppBar.scope && typeof AppBar.scope.isModified === "function") {
                    AppBar._modified = AppBar.scope.isModified();
                }
                return AppBar._modified;
            },
            set: function (newModified) {
                if (AppBar._modified !== newModified) {
                    AppBar._modified = newModified;
                }
                if (AppBar.notifyModified) {
                    AppBar.triggerDisableHandlers();
                }
                if (AppBar.scope &&
                    typeof AppBar.scope.modifyHandler === "function") {
                    AppBar.scope.modifyHandler();
                }
            }
        },
        _busy: false,
        busy: {
            get: function() {
                return AppBar._busy;
            },
            set: function(newBusy) {
                AppBar._busy = newBusy;
                if (AppBar.notifyModified) {
                    AppBar.triggerDisableHandlers();
                }
            }
        },
        handleEvent: function (type, id, event) {
            Log.call(Log.l.trace, "AppBar.", "type=" + type + " id=" + id);
            if (type === "change" && !AppBar._notifyModified) {
                Log.print(Log.l.trace, "extra ignored: change of id=" + id);
            } else if (AppBar.scope && AppBar.scope.eventHandlers) {
                var curHandler = AppBar.scope.eventHandlers[id];
                if (typeof curHandler === "function") {
                    curHandler(event);
                } else {
                    Log.print(Log.l.error, "handler for id=" + id + " is no function!");
                }
            }
            Log.ret(Log.l.trace);
        },
        _scope: null,
        _notifyModified: false,
        _modified: false,
        _commandList: null,
        _eventHandlers: null,
        _disableHandlers: null,
        _disableCommandIds: null,
        _appBar: null
    });

})();

