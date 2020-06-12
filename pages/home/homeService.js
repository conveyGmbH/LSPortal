// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Home", {
        _actions: [
            { page: "esStaffAdministration", imageName: "id_card" },
            { page: "voucherAdministration", imageName: "Gutschein1.1" },
            { page: "reporting", imageName: "download" },
            { page: "contacts", imageName: "businesspeople2" },
            { page: "infodesk", imageName: "magnifying_glass" },
            { page: "questionList", imageName: "question_and_answer" },
            { page: "event", imageName: "calendar_1" },
            { page: "mailing", imageName: "mail" },
            { page: "employee", imageName: "keys" },
            { page: "start", imageName: "home" }
        ],
        _actionsList: null,
        actionsView: {
            get: function () {
                if (!Home._actionsList) {
                    var list = [];
                    Home._actions.forEach(function (item, index) {
                        var curGroups = Application.navigationBarGroups.filter(function(group) {
                            return (group.id === item.page);
                        });
                        if (curGroups && curGroups[0] && !curGroups[0].disabled) {
                            item.title = getResourceText(item.page + ".title");
                            item.comment = getResourceText(item.page + ".comment");
                            list.push(item);
                        }
                    });
                    Home._actionsList = new WinJS.Binding.List(list);
                }
                return Home._actionsList;
            }
        }
    });
})();
