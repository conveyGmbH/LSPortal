// base-class for fragment controller helper object
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Fragments", {
        define: function (path, object) {
            object._path = path;
            object._name = Application.getFragmentId(path);
            object.getAnimationElements = function() {
                return this.controller && this.controller.element;
            }
            object.dispose = function() {
                Log.call(Log.l.trace, "Fragments.FragmentControl.", "path=" + this._path);
                if (this._disposed) {
                    return;
                }
                this._disposed = true;
                Log.ret(Log.l.trace);
            },
            object.FragmentControl = WinJS.Class.define(function FragmentControl(element) {
                Log.call(Log.l.trace, "Fragments.FragmentControl.", "path=" + this._path);
                this._element = element;
                Log.ret(Log.l.trace);
            }, object);
            WinJS.Namespace.define("Fragments." + path, object);
        },

        Controller: WinJS.Class.define(function Controller(element, addPageData) {
            Log.call(Log.l.trace, "Fragments.Controller.", "path=" + this._path);
            var controllerElement = element;
            while (controllerElement &&
                    controllerElement.className !== "data-container") {
                controllerElement = controllerElement.firstElementChild || controllerElement.firstChild;
            }
            if (controllerElement) {
                Log.print(Log.l.trace, "controllerElement: #" + controllerElement.id);
                controllerElement.winControl = this;
                WinJS.Utilities.addClass(controllerElement, "win-disposable");
                this._element = controllerElement;
            } else {
                Log.print(Log.l.error, "no data-container class found for controller element");
            }
            this.pageData.generalData = AppData.generalData;
            this.pageData.appSettings = AppData.appSettings;

            // First, we call WinJS.Binding.as to get the bindable proxy object
            var propertyName;
            this.binding = WinJS.Binding.as(this.pageData);
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
                resources: {}
            },
            processAll: function () {
                var that = this;
                return WinJS.Resources.processAll(this.element).then(function () {
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
                get: function () {
                    return this._element;
                },
                set: function (newElement) {
                    this._element = newElement;
                }
            }
        })
    });
})();

