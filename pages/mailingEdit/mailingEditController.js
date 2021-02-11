// controller for page: mailing
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingEdit/mailingEditService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("MailingEdit", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Mailing.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataMail: MailingEdit.MaildokumentView.defaultValue,
                dataTestMail: getEmptyDefaultValue(MailingEdit.TestMailView.defaultRestriction),
                firstquestionbez: getResourceText("mailing.on"),
                memobez: getResourceText("mailing.off"),
                sendtstmailLabel: getResourceText("mailing.send"),
                mailName : null,
                sendTestMailShowFlag: 0,
                testMailShowPanelFlag: 0,
                testMailSuccessMsgFlag: 0
            }, commandList]);

            var that = this;
            
            var firstquestion = pageElement.querySelector("#firstquestioncombo"); 
            var erstefragelabel = pageElement.querySelector("#erstefragelabel");
            var textComment = pageElement.querySelector(".input_text_comment");
            var initAnrede = pageElement.querySelector("#InitMailingAnrede");
            var sendbtn = pageElement.querySelector(".sendtestmail-button.win-button");
            var mailingeditboxhead = pageElement.querySelectorAll(".list-symbol-ID");
            var contentarea = pageElement.querySelectorAll(".contentarea");
            var initSprache = pageElement.querySelector("#InitSprache");
            var mailMessage = pageElement.querySelector(".mail-message");

            // select combo
            var tempDropdown = pageElement.querySelector("#templatedropdown");

            // get the id of the Maildokument
            var getRecordId = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                var recordId = AppData.getRecordId("VAMail");
                Log.ret(Log.l.trace, recordId);
                return recordId;
            };
            this.getRecordId = getRecordId;

            var getLangRecordId = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                var langrecordId = AppData.getRecordId("VAMailVIEW_20623");
                Log.ret(Log.l.trace, langrecordId);
                return langrecordId;
            };
            this.getLangRecordId = getLangRecordId;

            var loadIcons = function () {
                for (var i = 0; i < mailingeditboxhead.length; i++) {
                    Colors.loadSVGImageElements(mailingeditboxhead[i], "action-image", 40, Colors.textColor, "name");
                } 
            }
            this.loadIcons = loadIcons;

            var setDataMail = function (dataMail) {
                // Bug: textarea control shows 'null' string on null value in Internet Explorer!
               
                AppBar.modified = false;
                return dataMail;
            };
            this.setDataMail = setDataMail;

            var getDataMail = function(dataMail) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                if (dataMail.IsActive === false) {
                    that.binding.dataMail.IsActive = null;
                } else {
                    that.binding.dataMail.IsActive = 1; 
                }
                if (dataMail.LayoutID) {
                    dataMail.LayoutID = parseInt(dataMail.LayoutID);
                }
            }
            this.getDataMail = getDataMail;

            var setNewDataMail = function () {
                
                that.binding.dataMail.INITSpracheID = 0;
            };
            this.setNewDataMail = setNewDataMail;

            var resultConverter = function (item, index) {
                
            };
            this.resultConverter = resultConverter;
            
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                that.getDataMail(that.binding.dataMail);
                var dataMail = that.binding.dataMail;
                if (dataMail && AppBar.modified && !AppBar.busy) {
                    AppBar.busy = true;
                    var recordId = getRecordId();
                    if (recordId) {
                        ret = WinJS.Promise.as().then(function () {
                            MailingEdit.MaildokumentView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "dataMail update: success!");
                            AppBar.modified = false;
                             if (typeof complete === "function") {
                                   complete(dataMail);
                                 }
                            }, function (errorResponse) {
                            AppBar.busy = false;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                            }, recordId, dataMail);
                        });
                    } else {
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
                    AppData.call("PRC_ScheduleTestMail", {
                        pRecordID: that.binding.dataMail.VAMailVIEWID,
                        pTableName: "VAMail",
                        pGenderID: parseInt(that.binding.dataTestMail.AnredeID),
                        pFirstName: that.binding.dataTestMail.Vorname,
                        pLastName: that.binding.dataTestMail.Nachname,
                        pTargetAddres: that.binding.dataTestMail.TargetAddr,
                        pLanguageSpecID: parseInt(that.binding.dataTestMail.LanguageID)
                    }, function (json) {
                        Log.print(Log.l.info, "call success!");
                        mailMessage.textContent = getResourceText("mailingEdit.mailsuccess");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                        mailMessage.textContent = getResourceText("mailingEdit.mailerror");
                    });
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    WinJS.Promise.as().then(function () {
                        that.saveData(function (response) {
                            Log.print(Log.l.trace, "prev Mail saved");
                            //AppBar.modified = true;
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error saving mail");
                        });
                    }).then(function () {
                        that.loadData();
                    });
                    Log.ret(Log.l.trace);
                },
                clickOpenEdit: function(event) {
                    Log.call(Log.l.trace, "Mailing.Controller.");
                    var id = event.currentTarget.id;
                    var x;
                    switch (id) {
                        case "nameheader":
                            x = pageElement.querySelector("#namebottom");
                            if (x.style.display === "none") {
                                x.style.display = "block";
                            } else {
                                x.style.display = "none";
                            }
                            break;
                        case "headerfielsheader":
                            x = pageElement.querySelector("#headerfielsbottom");
                            if (x.style.display === "none") {
                                x.style.display = "block";
                            } else {
                                x.style.display = "none";
                            }
                            break;
                        case "emailtextheader":
                            x = pageElement.querySelector("#emailtextbottom");
                            if (x.style.display === "none") {
                                x.style.display = "block";
                            } else {
                                x.style.display = "none";
                            }
                            break;
                        case "dispatchoptionsheader":
                            x = pageElement.querySelector("#dispatchoptionsbottom");
                            if (x.style.display === "none") {
                                x.style.display = "block";
                            } else {
                                x.style.display = "none";
                            }
                            break;
                        case "enableheader":
                            x = pageElement.querySelector("#enablebottom");
                            if (x.style.display === "none") {
                                x.style.display = "block";
                            } else {
                                x.style.display = "none";
                            }
                            break;
                    default:
                    }
                    Log.call(Log.l.trace, "Mailing.Controller.");
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
                clickTestMailOpen: function() {
                    if (that.binding.dataMail && that.binding.dataMail.MaildokumentVIEWID && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var resultLangConverter = function (item, index) {
                item.index = index;
                that.mailLang.push({ LanguageID: item.LanguageSpecID, TITLE: item.LanguageTitle });
            }
            this.resultLangConverter = resultLangConverter;

            var loadData = function() {
                Log.call(Log.l.trace, "Mailing.");
                var recordId = getRecordId();
                var langRecordId = getLangRecordId();
                AppData.setErrorMsg(that.binding);
                that.binding.sendTestMailShowFlag = 0;
                that.binding.testMailShowPanelFlag = 0;
                that.binding.testMailSuccessMsgFlag = 0;
                if (initSprache && initSprache.winControl) {
                    initSprache.winControl.data.length = 0;
                    that.mailLang = [];
                }
                
                var ret = new WinJS.Promise.as().then(function() {
                    if (!AppData.initAnredeView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initAnredeData...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return AppData.initAnredeView.select(function(json) {
                                Log.print(Log.l.trace, "initAnredeView: success!");
                                if (json && json.d && json.d.results) {
                                    // Now, we call WinJS.Binding.List to get the bindable list
                                    if (initAnrede && initAnrede.winControl) {
                                        initAnrede.winControl.data = new WinJS.Binding.List(json.d.results);
                                        initAnrede.selectedIndex = 0;
                                    }
                                }
                            },
                            function(errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                    } else {
                        if (initAnrede &&
                            initAnrede.winControl &&
                            (!initAnrede.winControl.data || !initAnrede.winControl.data.length)) {
                            initAnrede.winControl.data = new WinJS.Binding.List(AppData.initAnredeView.getResults());
                            initAnrede.selectedIndex = 0;
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function() {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return MailingEdit.initSpracheView.select(function(json) {
                                Log.print(Log.l.trace, "initSpracheView: success!");
                                if (json && json.d && json.d.results) {
                                    var results = json.d.results;
                                    that.mailLang = that.mailLang.concat({ INITSpracheID: 0, TITLE: "" });
                                    // Now, we call WinJS.Binding.List to get the bindable list
                                    results.forEach(function(item, index) {
                                        that.resultLangConverter(item, index);
                                    });
                                    if (initSprache && initSprache.winControl) {
                                        initSprache.winControl.data = new WinJS.Binding.List(that.mailLang);
                                        initSprache.selectedIndex = 0;
                                    }
                                }
                            },
                            function(errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, { VAMailVIEWID: recordId, TitleLangID: AppData.getLanguageId()});
                
                }).then(function () {
                        Log.print(Log.l.trace, "calling select FragebogenzeileView...");
                        //@nedra:25.09.2015: load the list of InitFragengruppe for Combobox
                        return MailingEdit.VAMail.select(function (json) {
                            Log.print(Log.l.trace, "Mailing.FragebogenzeileView: success!");
                            // select returns object already parsed from json file in response
                            if (json && json.d && json.d.results) {
                                var result = json.d.results[0];
                                that.tempid = result.VAMailTypeID;
                                that.binding.mailName = result;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, { VAMailVIEWID: recordId, LanguageSpecID: langRecordId});
                }).then(function () {
                    Log.print(Log.l.trace, "calling select initSpracheView...");
                    //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                    return MailingEdit.vAMailTemplateView.select(function (json) {
                        Log.print(Log.l.trace, "initSpracheView: success!");
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            results = results.concat({ VAMailTemplateVIEWID: 0, TITLE: "DEFAULT" });
                            // Now, we call WinJS.Binding.List to get the bindable list
                            if (tempDropdown && tempDropdown.winControl) {
                                tempDropdown.winControl.data = new WinJS.Binding.List(results);
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { VAMailTypeID: that.tempid });

                }).then(function () {
                    if (recordId) {
                       // AppData.setRecordId("Maildokument", recordId);
                        return MailingEdit.MaildokumentView.select(function (json) {
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
                    //AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var getErrorMsgFromErrorStack = function (errorMsg) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_GetErrorStack", {
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppBar.modified = false;
                    if (json.d.results[0].ResultMessageID > 0) {
                        errorMsg.data.error.code = json.d.results[0].ResultCode;
                        errorMsg.data.error.message.value = that.getLangSpecErrorMsg(json.d.results[0].ResultMessageID, errorMsg);
                        Log.print(Log.l.info, "call success! ");
                    } else {
                        errorMsg.data.error.message.value = json.d.results[0].ResultMessage;
                        errorMsg.data.error.code = json.d.results[0].ResultCode;
                        AppData.setErrorMsg(that.binding, errorMsg);
                        Log.print(Log.l.info, "call success! ");
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                    AppBar.modified = false;

                });
                Log.ret(Log.l.trace);
            }
            this.getErrorMsgFromErrorStack = getErrorMsgFromErrorStack;

            var getLangSpecErrorMsg = function (resultmessageid, errorMsg) {
                Log.call(Log.l.trace, "Employee.Controller.");
                var lang = AppData.getLanguageId();
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_GetLangText", {
                    pTextID: resultmessageid,
                    pLanguageID: lang
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    errorMsg.data.error.message.value = json.d.results[0].ResultText;
                    AppData.setErrorMsg(that.binding, errorMsg);
                }, function (error) {
                    Log.print(Log.l.error, "call error");

                });
                Log.ret(Log.l.trace);
            }
            this.getLangSpecErrorMsg = getLangSpecErrorMsg;

            // Finally, wire up binding
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                that.loadIcons();
            });
            Log.ret(Log.l.trace);
        }, {
                mailLang: [],
                mailTempID: 0,
                tempid: 0
        })
    });
})();