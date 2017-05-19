// base-class for page controller helper object
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Application", {
        Controller: WinJS.Class.define(function Controller(pageElement, addPageData, isMaster) {
            Log.call(Log.l.trace, "Application.Controller.");
            var controllerElement = pageElement;
            while (controllerElement &&
                controllerElement.className !== "data-container") {
                controllerElement = controllerElement.firstElementChild || controllerElement.firstChild;
            }
            if (controllerElement) {
                Log.print(Log.l.trace, "controllerElement: #" + controllerElement.id);
                controllerElement.winControl = this;
                WinJS.Utilities.addClass(controllerElement, "win-disposable");
                this._element = controllerElement;
            }
            this.pageData.generalData = AppData.generalData;
            this.pageData.appSettings = AppData.appSettings;

            // Set scope only if commandList is specified - don't use commandList for master views!
            if (!isMaster) {
                AppBar.scope = this;
            }

            // First, we call WinJS.Binding.as to get the bindable proxy object
            this.binding = WinJS.Binding.as(this.pageData);
            var propertyName;
            AppData.setErrorMsg(this.binding);
            // Then, we add all properties of derived class to the bindable proxy object
            if (addPageData) {
                for (propertyName in addPageData) {
                    if (addPageData.hasOwnProperty(propertyName)) {
                        Log.print(Log.l.trace, "added " + propertyName + "=" + addPageData[propertyName]);
                        this.binding.addProperty(propertyName, addPageData[propertyName]);
                    }
                }
            }

            this._eventHandlerRemover = [];

            var that = this;
            this.addRemovableEventListener = function (e, eventName, handler, capture) {
                e.addEventListener(eventName, handler, capture);
                that._eventHandlerRemover.push(function () {
                    e.removeEventListener(eventName, handler);
                });
            };

            Log.ret(Log.l.trace);
        }, {
            pageData: {
                generalData: AppData.generalData,
                appSettings: AppData.appSettings,
                resources: {},
                messageText: null,
                error: {
                    errorMsg: "",
                    displayErrorMsg: "none"
                }
            },
            _disableHandlers: {},
            disableHandlers: {
                get: function() {
                    return this._disableHandlers;
                },
                set: function(newDisableHandlers) {
                    this._disableHandlers = newDisableHandlers;
                    // todo: don't do this for master views!
                    AppBar.disableHandlers = this._disableHandlers;
                }
            },
            _eventHandlers: {},
            eventHandlers: {
                get: function() {
                    return this._eventHandlers;
                },
                set: function(newEventHandlers) {
                    this._eventHandlers = newEventHandlers;
                    // todo: don't do this for master views!
                    AppBar.eventHandlers = this._eventHandlers;
                }
            },
            processAll: function() {
                var that = this;
                return WinJS.Resources.processAll(this.element).then(function() {
                    return WinJS.Binding.processAll(that.element, that.binding);
                });
            },
            _disposed: false,
            _dispose: function () {
                if (this._disposed) {
                    return;
                }
                this._disposed = true;
                for (var i = 0; i < this._eventHandlerRemover.length; i++) {
                    this._eventHandlerRemover[i]();
                }
                this._eventHandlerRemover = null;
                this._element = null;
            },
            _derivedDispose: null,
            dispose: {
                get: function () {
                    if (this._derivedDispose) {
                        this._derivedDispose();
                    }
                    return this._dispose;
                },
                set: function (newDispose) {
                    if (typeof newDispose === "function") {
                        this._derivedDispose = newDispose;
                    }
                }
            },
            element: {
                get: function() {
                    return this._element;
                },
                set: function(newElement) {
                    this._element = newElement;
                }
            }
        })
    });
})();

