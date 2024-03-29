﻿// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/esStaffAdministration/esStaffAdministrationController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("esStaffAdministration");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            this.inResize = 0;

            // add page specific commands to AppBar
            var commandList = [
                { id: "clickBack", label: getResourceText("command.backward"), tooltip: getResourceText("tooltip.backward"), section: "primary", svg: "navigate_left" },
                { id: "clickExport", label: getResourceText("command.exportPdfTicket"), tooltip: getResourceText("tooltip.exportPdfTicket"), section: "primary", svg: "document_pdf" },
                { id: "clickPreOrderTicket", label: getResourceText("command.orderTicket"), tooltip: getResourceText("tooltip.orderTicket"), section: "primary", svg: "id_card" },
                { id: "clickSendPDF", label: getResourceText("command.sendPDF"), tooltip: getResourceText("tooltip.sendPDF"), section: "primary", svg: "document_pdf_mail" },
                { id: "clickSendWallet", label: getResourceText("command.sendWallet"), tooltip: getResourceText("tooltip.sendWallet"), section: "primary", svg: "wallet_mail" },
                //{ id: "clickSendPDFWallet", label: getResourceText("command.sendPDFWallet"), tooltip: getResourceText("tooltip.sendPDFWallet"), section: "primary", svg: "document_pdf_wallet2" },
                { id: "clickNew", label: getResourceText("command.newStaff"), tooltip: getResourceText("tooltip.newStaff"), section: "primary", svg: "user_plus" },
                { id: "clickOk", label: getResourceText("command.ok"), tooltip: getResourceText("tooltip.ok"), section: "primary", svg: "navigate_check", key: WinJS.Utilities.Key.enter },
                { id: "clickDeleteTicket", label: getResourceText("command.deleteTicket"), tooltip: getResourceText("tooltip.deleteTicket"), section: "primary", svg: "delete_Ticket" },
                { id: "clickDelete", label: getResourceText("command.delete"), tooltip: getResourceText("tooltip.deleteStaff"), section: "primary", svg: "garbage_can" }
            ];

            this.controller = new EsStaffAdministration.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to navigations away from this page.
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            Log.call(Log.l.trace, pageName + ".");
            var ret;
            if (this.controller) {
                ret = this.controller.saveData(function (response) {
                    // called asynchronously if ok
                    complete(response);
                }, function (errorResponse) {
                    error(errorResponse);
                });
            } else {
                ret = WinJS.Promise.as().then(function () {
                    var err = { status: 500, statusText: "fatal: page already deleted!" };
                    error(err);
                });
            }
            Log.ret(Log.l.trace);
            return ret;
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
        }
    });
})();