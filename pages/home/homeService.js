// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Home", {
        _actions: [
            
        ],
        _actionsList: null,
        _StartPageTileView: {
            get: function () {
                return AppData.getFormatView("StartPageTile", 20657);
            }
        },
        StartPageTileView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = Home._StartPageTileView.select(complete, error,
                    {
                        LanguageSpecID: AppData.getLanguageId()
                    },{
                    ordered: true,
                        orderAttribute: "TileIDX",
                        asc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
