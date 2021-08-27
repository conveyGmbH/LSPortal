// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Home", {
        _actions: [
            
        ],
        _actionsdefault: [
            { page: "voucherAdministration", imageName: "Gutschein1.1" },
            { page: "esStaffAdministration", imageName: "id_card" },
            { page: "esVoucherUsers", imageName: "voucher_contact" },
            //{ page: "resourcesAdministration", imageName: "user_headset" },
            { page: "start", imageName: "Dashboard" },
            { page: "event", imageName: "calendar_1" },
            { page: "questionList", imageName: "question_and_answer" },
            { page: "mailing", imageName: "mail" },
            { page: "employee", imageName: "keys" },
            { page: "contacts", imageName: "businesspeople2" },
            { page: "reporting", imageName: "download" },
            { page: "visitorFlowDashboard", imageName: "lsvFlow" },
            { page: "visitorFlowEntExt", imageName: "window_gear" }
            //{ page: "infodesk", imageName: "magnifying_glass" }
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
        },
        _StartPageTileView: {
            get: function () {
                return AppData.getFormatView("StartPageTile", 20657);
            }
        },
        StartPageTileView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = Home._StartPageTileView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
