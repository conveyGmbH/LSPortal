// service for page: imgMedia
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "ImgMedia";

    WinJS.Namespace.define("ImgMedia", {
        _docView: {
            get: function () {
                return AppData.getFormatView("MandantDokument", 20635);
            }
        },
        docView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".docView.");
                var ret = ImgMedia._docView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
