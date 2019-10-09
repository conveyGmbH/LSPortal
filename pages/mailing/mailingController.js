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
                dataMail: Mailing.MaildokumentView.defaultValue,
                dataTestMail: getEmptyDefaultValue(Mailing.TestMailView.defaultRestriction),
                dataFirstQuestion: null,
                firstquestionbez: getResourceText("mailing.on"),
                memobez: getResourceText("mailing.off"),
                specTypeToggle: null,
                saveFlag: null,
                sendTestMailShowFlag: 0,
                testMailShowPanelFlag: 0,
                testMailSuccessMsgFlag: 0,
                sendtstmailLabel: getResourceText("mailing.send")
            }, commandList]);
            var that = this;
            this.ssItems = [];
            var firstquestion = pageElement.querySelector("#firstquestioncombo"); 
            var erstefragelabel = pageElement.querySelector("#erstefragelabel");
            var textComment = pageElement.querySelector(".input_text_comment");
            var initAnrede = pageElement.querySelector("#InitMailingAnrede");
            var sendbtn = pageElement.querySelector(".sendtestmail-button.win-button");

            // select combo
            var initSprache = pageElement.querySelector("#InitSprache");

            var getRecordId = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                var recordId = AppData.getRecordId("Maildokument");
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
                        that.setNewDataMail();
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
            
            var setDataMail = function (dataMail) {
                // Bug: textarea control shows 'null' string on null value in Internet Explorer!
                if (dataMail.Mailtext === null) {
                    dataMail.Mailtext = "";
                }
                if (textComment) {
                    if (that.binding.dataMail.Mailtext) {
                        WinJS.Utilities.addClass(textComment, "input_text_comment_big");
                    } else {
                        WinJS.Utilities.removeClass(textComment, "input_text_comment_big");
                    }
                }
                AppBar.modified = false;
                return dataMail;
            };
            this.setDataMail = setDataMail;

            var setNewDataMail = function (newDataMail) {
                AppData.setRecordId("Maildokument", 0);
                that.binding.dataMail = getEmptyDefaultValue(Mailing.MaildokumentView.defaultValue);
                that.binding.dataMail.VeranstaltungID = AppData.getRecordId("Veranstaltung");
                that.binding.dataMail.INITSpracheID = 0;
            };
            this.setNewDataMail = setNewDataMail;

            var resultConverter = function (item, index) {
                item.Sprache = item.TITLE;
                item.ErsteFrage = item.Thema;
                erstefragelabel.textContent = item.ErsteFrage;
                that.ssItems = [];
                if (typeof item.Thema !== "undefined") {
                    that.ssItems.push({
                        title: "",
                        value: null
                    });
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
                                value: "0"+i
                            });
                        }
                    }
                }
            };
            this.resultConverter = resultConverter;
            
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataMail = that.binding.dataMail;
                if (dataMail && AppBar.modified && !AppBar.busy) {
                    AppBar.busy = true;
                    var recordId = getRecordId();
                    if (recordId) {
                        ret = Mailing.MaildokumentView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "dataMail update: success!");
                            AppBar.modified = false;
                            var master = Application.navigator.masterControl;
                            if (master && master.controller) {
                                if (that.binding.saveFlag === true) {
                                    that.binding.saveFlag = false;
                                    master.controller.loadData();
                                } else {
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(recordId);
                                        if (typeof complete === "function") {
                                            complete(response);
                                        }
                                    }  
                                )};
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
                        ret = Mailing.MaildokumentView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "MaildokumentView insert: success!");
                            AppBar.modified = false;
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.binding.dataMail = setDataMail(json.d);
                                AppData.setRecordId("Maildokument", that.binding.dataMail.MaildokumentVIEWID);
                                /* Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen */
                                var master = Application.navigator.masterControl;
                                if (master && master.controller) {
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(getRecordId());
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

            var getTestMailData = function() {
                that.binding.dataTestMail.MailDokumentID = parseInt(that.binding.dataMail.MaildokumentVIEWID);
                that.binding.dataTestMail.AnredeID = parseInt(that.binding.dataTestMail.AnredeID);
                that.binding.dataTestMail.TestType = parseInt(2);
            }
            this.getTestMailData = getTestMailData;
            
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
                        AppBar.modified = true;
                        //that.saveData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving mail");
                    });
                    Log.ret(Log.l.trace);
                },
                clickTestMailOpen : function(event) {
                    Log.call(Log.l.trace, "Mailing.Controller.clickTestMailOpen");
                    if (that.binding.sendTestMailShowFlag === 0) {
                        that.binding.sendTestMailShowFlag = 1;
                        that.binding.testMailShowPanelFlag = 1;
                        that.binding.testMailSuccessMsgFlag = 0;
                        window.setTimeout(function () {
                            pageElement.querySelector(".sendtestmail-button.win-button").focus();
                        }, 0);
                    } else {
                        that.binding.sendTestMailShowFlag = 0;
                        that.binding.testMailShowPanelFlag = 0;
                        that.binding.testMailSuccessMsgFlag = 0;
                    }
                    Log.ret(Log.l.trace);
                },
                clickSendTestMail: function() {
                    Log.call(Log.l.trace, "Mailing.Controller.clickSendTestMail");
                    AppData.setErrorMsg(that.binding);
                    that.getTestMailData();
                    Log.call(Log.l.trace, "Mailing.Controller.clickSendTestMail");
                    var ret = new WinJS.Promise.as().then(function () {
                        return Mailing.TestMailView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "TestMailView insert: success!");
                            AppBar.modified = false;
                            that.binding.dataTestMail = getEmptyDefaultValue(Mailing.TestMailView.defaultRestriction);
                            that.binding.testMailShowPanelFlag = 0;
                            that.binding.testMailSuccessMsgFlag = 1;
                            // ProduktView returns object already parsed from json file in response
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting Testmail");
                            AppBar.busy = false;
                            that.binding.dataTestMail = getEmptyDefaultValue(Mailing.TestMailView.defaultRestriction);
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.dataTestMail);
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    var recordId = getRecordId();
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
                                that.binding.dataMail.MemoSpec = null;
                                AppBar.modified = true;
                            that.saveData(function (response) {
                                // called asynchronously if ok
                                if (typeof complete === "function") {
                                complete(response);
                                }
                            }, function (errorResponse) {
                                if (typeof error === "function") {
                                error(errorResponse);
                                }
                            });
                            } else {
                                that.binding.dataMail.SpecType = 1;
                                that.binding.dataMail.MemoSpec = null;
                                AppBar.modified = true;
                            that.saveData(function (response) {
                                // called asynchronously if ok
                                if (typeof complete === "function") {
                                complete(response);
                                }
                            }, function (errorResponse) {
                                if (typeof error === "function") {
                                error(errorResponse);
                                }
                            });
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
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
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
                    if (!AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };


            var loadData = function (recordId) {
                Log.call(Log.l.trace, "Mailing.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                that.binding.sendTestMailShowFlag = 0;
                that.binding.testMailShowPanelFlag = 0;
                that.binding.testMailSuccessMsgFlag = 0;
                var ret = new WinJS.Promise.as().then(function () {
                    if (!AppData.initAnredeView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initAnredeData...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return AppData.initAnredeView.select(function (json) {
                            Log.print(Log.l.trace, "initAnredeView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initAnrede && initAnrede.winControl) {
                                    initAnrede.winControl.data = new WinJS.Binding.List(json.d.results);
                                    initAnrede.selectedIndex = 0;
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initAnrede && initAnrede.winControl &&
                            (!initAnrede.winControl.data || !initAnrede.winControl.data.length)) {
                            initAnrede.winControl.data = new WinJS.Binding.List(AppData.initAnredeView.getResults());
                            initAnrede.selectedIndex = 0;
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
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
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initSprache && initSprache.winControl &&
                            (!initSprache.winControl.data || !initSprache.winControl.data.length)) {
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
                    if (recordId) {
                        AppData.setRecordId("Maildokument", recordId);
                        return Mailing.MaildokumentView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Mailing: success!");
                            if (json && json.d) {
                                that.binding.dataMail = setDataMail(json.d);
                                Log.print(Log.l.trace, "Mailing: success!");
                            }
                            // startContact returns object already parsed from json file in response
                        },
                        function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.

                            AppData.setErrorMsg(that.binding, errorResponse);
                        },
                            recordId);
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