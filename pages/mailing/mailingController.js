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
                specTypeToggle: null
            }, commandList]);
            var that = this;
            this.ssItems = [];
            var firstquestion = pageElement.querySelector("#firstquestioncombo"); 
            var erstefragelabel = pageElement.querySelector("#erstefragelabel");

            // select combo
            var initSprache = pageElement.querySelector("#InitSprache");

            var getLanguage = function () {
                var ret = null;
                Log.call(Log.l.trace, "Mailing.Controller.");
                var results = Mailing.initSpracheView.getResults();
                var map = Mailing.initSpracheView.getMap();
                if (map && results && that.binding.dataMail &&
                    that.binding.dataMail.INITSpracheID) {
                    var curIndex = map[that.binding.dataMail.INITSpracheID];
                    if (typeof curIndex !== "undefined") {
                        var row = results[curIndex];
                        Log.print(Log.l.info, "found LanguageId=" + row.LanguageID);
                        ret = row.LanguageID;
                    }
                }
                if (!ret) {
                    ret = Application.getLanguageId();
                }
                Log.ret(Log.l.trace);
                return ret;
            }

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

            var getDataMail = function (dataMail) {
                if (dataMail.ReplyTo === "") {
                    dataMail.ReplyTo = null;
                }
                if (dataMail.Sender === "") {
                    dataMail.Sender = null;
                }
                if (dataMail.BCCAddr === "") {
                    dataMail.BCCAddr = null;
                }
                if (dataMail.CCAddr === "") {
                    dataMail.CCAddr = null;
                }
                if (dataMail.Subject === "") {
                    dataMail.Subject = null;
                }
                if (dataMail.Beschreibung === "") {
                    dataMail.Beschreibung = null;
                }
                if (dataMail.MemoSpec === "") {
                    dataMail.MemoSpec = null;
                }
                if (dataMail.Mailtext === "") {
                    dataMail.Mailtext = null;
                }
            };
            this.getDataMail = getDataMail;

            var setDataMail = function (dataMail) {
                if (typeof dataMail.ReplyTo === "undefined" || dataMail.ReplyTo === null) {
                    dataMail.ReplyTo = "";
                }
                if (typeof dataMail.Sender === "undefined" || dataMail.Sender === null) {
                    dataMail.Sender = "";
                }
                if (typeof dataMail.BCCAddr === "undefined" || dataMail.BCCAddr === null) {
                    dataMail.BCCAddr = "";
                }
                if (typeof dataMail.CCAddr === "undefined" || dataMail.CCAddr === null) {
                    dataMail.CCAddr = "";
                }
                if (typeof dataMail.Subject === "undefined" || dataMail.Subject === null) {
                    dataMail.Subject = "";
                }
                if (typeof dataMail.Beschreibung === "undefined" || dataMail.Beschreibung === null) {
                    dataMail.Beschreibung = "";
                }
                if (typeof dataMail.MemoSpec === "undefined" || dataMail.MemoSpec === null) {
                    dataMail.MemoSpec = "";
                }
                if (typeof dataMail.Mailtext === "undefined" || dataMail.Mailtext === null) {
                    dataMail.Mailtext = "";
                }
            };
            this.setDataMail = setDataMail;

            var setNewDataMail = function (newDataMail) {
                var prevSpracheId = that.binding.dataMail.INITSpracheID;
                that.binding.dataMail = getEmptyDefaultValue(Mailing.MaildokumentView.defaultValue);
                that.binding.dataMail.MaildokumentVIEWID = 0;
                that.binding.dataMail.VeranstaltungID = AppData.getRecordId("Veranstaltung");
                that.binding.dataMail.INITSpracheID = prevSpracheId;
                AppBar.modified = true;
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
                var dataMail = that.binding.dataMail;
                if (dataMail && AppBar.modified && !AppBar.busy) {
                    that.getDataMail(dataMail);
                    AppBar.busy = true;
                    var recordId = dataMail.MaildokumentVIEWID;
                    if (recordId) {
                        ret = Mailing.MaildokumentView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "dataMail update: success!");
                            AppBar.modified = false;
                            var master = Application.navigator.masterControl;
                            if (master && master.controller &&
                                master.controller.binding) {
                                master.controller.binding.languageId = getLanguage();
                                master.controller.loadData().then(function () {
                                    master.controller.selectRecordId(that.binding.dataMail.MaildokumentVIEWID);
                                    if (typeof complete === "function") {
                                        complete(response);
                                    }
                                });
                            } else if (typeof complete === "function") {
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
                        Mailing.MaildokumentView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "MaildokumentView insert: success!");
                            AppBar.modified = false;
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.binding.dataMail = json.d;
                                /* Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen */
                                var master = Application.navigator.masterControl;
                                if (master && master.controller) {
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(that.binding.dataMail.MaildokumentVIEWID);
                                    });
                                }
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting mail");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, dataMail);
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
                        Log.print(Log.l.trace, "prev Mail saved");
                        that.setNewDataMail();
                        that.saveData();
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
                                        that.loadData(getRecordId());
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
                    if (that.binding.dataMail && AppBar.modified && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (that.binding.dataMail && that.binding.dataMail.MaildokumentVIEWID && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickNew: function () {
                    if (that.binding.dataMail && that.binding.dataMail.MaildokumentVIEWID && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };


            var loadData = function (mailId) {
                Log.call(Log.l.trace, "Mailing.", "mailId=" + mailId);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!Mailing.initSpracheView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return Mailing.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;

                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                }
                                var master = Application.navigator.masterControl;
                                if (master && master.controller &&
                                    master.controller.binding &&
                                    that.binding.dataMail && !that.binding.dataMail.INITSpracheID) {
                                    for (var i = 0; i < results.length; i++) {
                                        var row = results[i];
                                        if (row.LanguageID === master.controller.binding.languageId) {
                                            that.binding.dataMail.INITSpracheID = row.INITSpracheID;
                                            break;
                                        }
                                    }
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initSprache && initSprache.winControl) {
                            var results = Mailing.initSpracheView.getResults();
                            initSprache.winControl.data = new WinJS.Binding.List(results);
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
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
                    if (mailId) {
                        return Mailing.MaildokumentView.select(function(json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Mailing: success!");
                            if (json && json.d) {
                                that.setDataMail(json.d);
                                that.binding.dataMail = json.d;
                                Log.print(Log.l.trace, "Mailing: success!");
                            }
                            // startContact returns object already parsed from json file in response
                        },
                        function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.

                            AppData.setErrorMsg(that.binding, errorResponse);
                        },
                        mailId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
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
        })
    });
})();