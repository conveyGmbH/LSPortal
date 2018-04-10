// controller for page: mailing
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailing/mailingService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("Mailing", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Mailing.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataMail: getEmptyDefaultValue(Mailing.MaildokumentView.defaultValue),
                dataFirstQuestion: null,
                specTypeToggle : null
            }, commandList]);
            var that = this;
            this.ssItems = [];
            var mailingErrorMsg = pageElement.querySelector("#mailingerror");
            var mailingcontent = pageElement.querySelector(".mailing-content");
            var firstquestion = pageElement.querySelector("#firstquestioncombo"); 
            var languageCombo = pageElement.querySelector("#InitLanguage");
            var erstefragelabel = pageElement.querySelector("#erstefragelabel");
            var languageID = AppData.getLanguageId();

            var getRecordId = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                var recordId = that.binding.dataMail && that.binding.dataMail.MaildokumentVIEWID;
                if (!recordId) {
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        recordId = master.controller.binding.mailingId;
                    }
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            };
            this.getRecordId = getRecordId;
            
            var deleteData = function () {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.binding.dataMail.MaildokumentVIEWID;
                if (recordId) {
                    AppBar.busy = true;
                    Mailing.MaildokumentView.deleteRecord(function (response) {
                        AppBar.busy = false;
                        var master = Application.navigator.masterControl;
                        if (master && master.controller) {
                            master.controller.loadData();
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

            var getDataMail = function () {
                if (that.binding.dataMail.ReplyTo == "") {
                    that.binding.dataMail.ReplyTo = null;
                }
                if (that.binding.dataMail.Sender == "") {
                    that.binding.dataMail.Sender = null;
                }
                if (that.binding.dataMail.BCCAddr == "") {
                    that.binding.dataMail.BCCAddr = null;
                }
                if (that.binding.dataMail.CCAddr == "") {
                    that.binding.dataMail.CCAddr = null;
                }
                if (that.binding.dataMail.Subject == "") {
                    that.binding.dataMail.Subject = null;
                }
                if (that.binding.dataMail.Beschreibung == "") {
                    that.binding.dataMail.Beschreibung = null;
                }
                if (that.binding.dataMail.MemoSpec == "") {
                    that.binding.dataMail.MemoSpec = null;
                }
                if (that.binding.dataMail.Mailtext == "") {
                    that.binding.dataMail.Mailtext = null;
                }
            };
            this.getDataMail = getDataMail;

            var setDataMail = function () {
                if (typeof that.binding.dataMail.ReplyTo === "undefined" || that.binding.dataMail.ReplyTo == null) {
                    that.binding.dataMail.ReplyTo = "";
                }
                if (typeof that.binding.dataMail.Sender === "undefined" || that.binding.dataMail.Sender == null) {
                    that.binding.dataMail.Sender = "";
                }
                if (typeof that.binding.dataMail.BCCAddr === "undefined" || that.binding.dataMail.BCCAddr == null) {
                    that.binding.dataMail.BCCAddr = "";
                }
                if (typeof that.binding.dataMail.CCAddr === "undefined" || that.binding.dataMail.CCAddr == null) {
                    that.binding.dataMail.CCAddr = "";
                }
                if (typeof that.binding.dataMail.Subject === "undefined" || that.binding.dataMail.Subject == null) {
                    that.binding.dataMail.Subject = "";
                }
                if (typeof that.binding.dataMail.Beschreibung === "undefined" || that.binding.dataMail.Beschreibung == null) {
                    that.binding.dataMail.Beschreibung = "";
                }
                if (typeof that.binding.dataMail.MemoSpec === "undefined" || that.binding.dataMail.MemoSpec == null) {
                    that.binding.dataMail.MemoSpec = "";
                }
                if (typeof that.binding.dataMail.Mailtext === "undefined" || that.binding.dataMail.Mailtext == null) {
                    that.binding.dataMail.Mailtext = "";
                }
            };
            this.setDataMail = setDataMail;

            var setNewDataMail = function (newDataMail) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.newMail.VeranstaltungID = AppData.getRecordId("Veranstaltung");
                that.binding.newMail.INITSpracheID = AppData.getLanguageId();
                switch (that.binding.newMail.INITSpracheID) {
                case 1.033:
                        that.binding.newMail.INITSpracheID = 2;
                        break;
                case 1.036:
                        that.binding.newMail.INITSpracheID = 3;
                        break;
                case 1.040:
                        that.binding.newMail.INITSpracheID = 4;
                        break;
                default:
                        that.binding.newMail.INITSpracheID = 1;
                }
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            };
            this.setNewDataMail = setNewDataMail;

            var resultConverter = function (item, index) {
                item.Sprache = item.TITLE;
                item.ErsteFrage = item.Thema;
                erstefragelabel.textContent = item.ErsteFrage;
                that.ssItems = [];
                if (typeof item.Thema !== "undefined") {
                    for (var i = 1; i <= 28; i++) {
                        var keyValue, keyTitle;
                        var iStr = i.toString();
                        if (i < 10) {
                            keyValue = "SS0" + iStr;
                            keyTitle = "SS0" + iStr;
                        } else {
                            keyValue = "SS" + iStr;
                            keyTitle = "SS" + iStr;
                        }
                        if (item[keyTitle] && item[keyValue] && item[keyTitle] !== "null" && item[keyValue] !== "null") {
                            that.ssItems.push({
                                title: item[keyTitle],
                                value: item[keyValue]
                            });
                        }
                    }
                    that.ssItems.push({
                            title: "",
                            value: null
                    });
                }
            };
            this.resultConverter = resultConverter;
            
           
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                that.getDataMail();
                var dataMail = that.binding.dataMail;
                if (dataMail && AppBar.modified && !AppBar.busy) {
                    var recordId = dataMail.MaildokumentVIEWID;
                    if (recordId) {
                        AppBar.busy = true;
                        ret = Mailing.MaildokumentView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "dataMail update: success!");
                            AppBar.modified = false;
                            if (typeof complete === "function") {
                                complete(response);
                            }
                        },
                        function (errorResponse) {
                            AppBar.busy = false;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        },
                        recordId, dataMail);
                    } else {
                        Log.print(Log.l.info, "not supported");
                        ret = WinJS.Promise.as();
                    }
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataMail);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function(event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "Mail saved");
                        that.binding.newMail = getEmptyDefaultValue(Mailing.MaildokumentView.defaultValue);
                        that.setNewDataMail();
                        Mailing.MaildokumentView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "MaildokumentView insert: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.binding.newMail = json.d;
                                /* Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen */
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    master.controller.binding.mailId = 0;
                                    master.controller.binding.mailId = that.binding.newMail.MaildokumentVIEWID;
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(that.binding.newMail.MaildokumentVIEWID);
                                    });
                                }
                                mailingErrorMsg.style.display = "none";
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting mail");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, that.binding.newMail);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving mail");
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    var recordId = that.binding.dataMail.MaildokumentVIEWID;
                    if (recordId) {
                        var curScope = that.binding.dataMail;
                        if (curScope) {
                            var confirmTitle = getResourceText("mailing.labelDelete") + ": " + curScope.Beschreibung +
                                "\r\n" + getResourceText("mailing.mailDelete");
                            confirm(confirmTitle, function (result) {
                                if (result) {
                                    Log.print(Log.l.trace, "clickDelete: mail choice OK");
                                    that.deleteData(function (response) {
                                        // delete OK 
                                        that.loadData();
                                    }, function (errorResponse) {
                                        // delete ERROR
                                        var message = null;
                                        Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                                        if (errorResponse.data && errorResponse.data.error) {
                                            Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                                            if (errorResponse.data.error.message) {
                                                Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                                message = errorResponse.data.error.message.value;
                                            }
                                        }
                                        if (!message) {
                                            message = getResourceText("error.delete");
                                        }
                                        alert(message);
                                    });
                                } else {
                                    Log.print(Log.l.trace, "clickDelete: mail choice CANCEL");
                                }
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickFirstQuestion: function (event) {
                    Log.call(Log.l.trace, "info.Controller.");
                    //if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            if (toggle.checked === false) {
                                that.binding.dataMail.SpecType = null;
                            } else {
                                that.binding.dataMail.SpecType = 1;
                            }
                        }
                    //}
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function(event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function(event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                }
            };
            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickSave: function () {
                    if (that.binding.dataMail && that.binding.dataMail.MaildokumentVIEWID) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (that.binding.dataMail && that.binding.dataMail.INITSpracheID === 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
            };

            var loadData = function (mailID) {
                Log.call(Log.l.trace, "MailingProduct.", "mailID=" + mailID);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select FragebogenzeileView...");
                    //@nedra:25.09.2015: load the list of InitFragengruppe for Combobox
                    return Mailing.FragebogenzeileView.select(function (json) {
                        Log.print(Log.l.trace, "Mailing.FragebogenzeileView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });

                            // Now, we call WinJS.Binding.List to get the bindable list
                            if (firstquestion && firstquestion.winControl) {
                                firstquestion.winControl.data = new WinJS.Binding.List(that.ssItems);
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        SORTIERUNG: 1
                    });
                }).then(function () {
                    if (mailID === 0) {
                        mailingErrorMsg.textContent = getResourceText("mailing.maillingerrormsg");
                        mailingcontent.style.display = "none";
                        return WinJS.Promise.as();
                    } else {
                        return Mailing.MaildokumentView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Mailing: success!");
                                if (json && json.d) {
                                    that.binding.dataMail = json.d;
                                    that.firstQuestionFlag = that.binding.dataMail.SpecType;
                                    that.setDataMail();
                                    Log.print(Log.l.trace, "Mailing: success!");
                                }
                                mailingErrorMsg.style.display = "none";
                                mailingcontent.style.display = "inline";
                                // startContact returns object already parsed from json file in response
                            },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.

                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            mailID);
                    }
                }).then(function () {
                    Log.print(Log.l.trace, "calling select InitSpracheView...");
                    //@nedra:25.09.2015: load the list of InitSpracheView for Combobox
                    return Mailing.initSpracheView.select(function (json) {
                        Log.print(Log.l.trace, "Mailing.InitSpracheView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });

                            // Now, we call WinJS.Binding.List to get the bindable list
                            if (languageCombo && languageCombo.winControl) {
                                languageCombo.winControl.data = new WinJS.Binding.List(results);
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                        {
                            LanguageSpecID: languageID
                        });
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // Finally, wire up binding
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(getRecordId());
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
                mailID: null,
                newMail: null,
                specType: null,
                firstQuestionFlag: null
        })
    });
})();