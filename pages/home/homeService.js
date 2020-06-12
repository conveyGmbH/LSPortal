// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Home", {
        _actions: [
            { page: "esStaffAdministration", imageName: "keys" },
            { page: "voucherAdministration", imageName: "Gutschein1.1" },
            { page: "resourcesAdministration", imageName: "user_headset" },
            { page: "start", imageName: "home" }
        ],
        _actionsList: null,
        actionsView: {
            get: function () {
                if (!Home._actionsList) {
                    var list = [];
                    Home._actions.forEach(function (item, index) {
                        item.title = getResourceText(item.page + ".title");
                        item.comment = getResourceText(item.page + ".comment");
                        item.imageBkgColor = Colors.navigationColor;
                        list.push(item);
                    });
                    Home._actionsList = new WinJS.Binding.List(list);
                }
                return Home._actionsList;
            }
        }
    });
})();
