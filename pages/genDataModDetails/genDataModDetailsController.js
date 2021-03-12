// controller for page: GenDataModDetails
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataModDetails/genDataModDetailsService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    
    WinJS.Namespace.define("GenDataModDetails", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
                Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                Application.RecordsetController.apply(this, [pageElement, {
                    modData: null,
                    modpaData: null,
                    newmodData: getEmptyDefaultValue(GenDataModDetails.personAdresseView.defaultValue),
                    newmodlabel: getResourceText("genDataModDetails.newmodlabel")
                }, commandList]);
            
                var that = this;

                // select combo
                var initAnrede = pageElement.querySelector("#InitAnrede");
                var initLand = pageElement.querySelector("#InitLand");
                var newmod = pageElement.querySelector("#newmod");
                var kategorie = pageElement.querySelector("#InitKategorie");
                var kategorienew = pageElement.querySelector("#InitKategorieNew");

                var firstname = pageElement.querySelector("#firstname");
                var name = pageElement.querySelector("#name");
                var email = pageElement.querySelector("#email");

                var checkAddModFields = function() {
                    Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                    if (!email.value) {
                        email.style.border = "2px solid red";
                        return false;
                    } else {
                        email.style.borderTop = "none";
                        email.style.borderLeft = "none";
                        email.style.borderRight = "none";
                        email.style.borderBottom = "1px solid grey";
                        return true;
                    }
                }
                this.checkAddModFields = checkAddModFields;

                var resultConverter = function (item, index) {
                    item.index = index;
                    
                }
                this.resultConverter = resultConverter;
              
                // define handlers
                this.eventHandlers = {
                    clickBack: function (event) {
                        Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        if (WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickSave: function() {
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
                    clickAddMod: function(event) {
                        Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        var newMod = that.binding.newmodData;
                        var fieldcheck = that.checkAddModFields();
                        if (fieldcheck === true) {
                            AppData.setErrorMsg(that.binding);
                            AppData.call("PRC_CreatePerson", {
                                pPersonEMailID : newMod.EMail,
                                pPersonFirstname: newMod.Firstname,
                                pPersonLastname: newMod.Lastname
                            }, function (json) {
                                Log.print(Log.l.info, "call success!");
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(json.d.results[0].NewPersonAdresseID);
                                    });
                                }
                            }, function (error) {
                                Log.print(Log.l.error, "call error");
                            });
                        } else {
                            Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        }
                    },
                    clickOpenNewMod: function(event) {
                        Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        if (newmod.style.display === "none") {
                            newmod.style.display = "block";
                        } else {
                            newmod.style.display = "none";
                            that.binding.newmodData = getEmptyDefaultValue(GenDataModDetails.personAdresseView.defaultValue);
                        }
                    },
                    onHeaderVisibilityChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                        if (eventInfo && eventInfo.detail && listView) {
                            var visible = eventInfo.detail.visible;
                            if (visible) {
                                var contentHeader = listView.querySelector(".content-header");
                                if (contentHeader) {
                                    var halfCircle = contentHeader.querySelector(".half-circle");
                                    if (halfCircle && halfCircle.style) {
                                        if (halfCircle.style.visibility === "hidden") {
                                            halfCircle.style.visibility = "";
                                            WinJS.UI.Animation.enterPage(halfCircle);
                                        }
                                    }
                                }
                            }
                        }
                        Log.ret(Log.l.trace);
                    }
                };

                this.disableHandlers = {
                    clickBack: function() {
                        if (WinJS.Navigation.canGoBack === true) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    clickSave: function () {
                        if (that.binding.modData && AppBar.modified && !AppBar.busy) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                };

                var getAdresseId = function () {
                    return GenDataModDetails._adresseId;
                }
                that.getAdresseId = getAdresseId;

                var setAdresseId = function (value) {
                    Log.print(Log.l.trace, "adresseId=" + value);
                    GenDataModDetails._adresseId = value;
                }
                that.setAdresseId = setAdresseId;

                var getPersonAdresseId = function () {
                    return GenDataModDetails._personAdresseId;
                }
                that.getPersonAdresseId = getPersonAdresseId;

                var setPersonAdresseId = function (value) {
                    Log.print(Log.l.trace, "personadresseId=" + value);
                    GenDataModDetails._personAdresseId = value;
                }
                that.setPersonAdresseId = setPersonAdresseId;

                var loadData = function () {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    AppData.setErrorMsg(that.binding);
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
                            }
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        if (!AppData.initLandView.getResults().length) {
                            Log.print(Log.l.trace, "calling select initLandData...");
                            //@nedra:25.09.2015: load the list of INITLand for Combobox
                            return AppData.initLandView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "initLandView: success!");
                                if (json && json.d && json.d.results) {
                                    // Now, we call WinJS.Binding.List to get the bindable list
                                    if (initLand && initLand.winControl) {
                                        initLand.winControl.data = new WinJS.Binding.List(json.d.results);
                                    }
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        } else {
                            if (initLand && initLand.winControl &&
                                (!initLand.winControl.data || !initLand.winControl.data.length)) {
                                initLand.winControl.data = new WinJS.Binding.List(AppData.initLandView.getResults());
                            }
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select contactView...");
                        return GenDataModDetails.initPersonKategorieView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "contactView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (kategorie && kategorie.winControl) {
                                    kategorie.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                                kategorie.selectedIndex = 0;
                                if (kategorienew && kategorienew.winControl) {
                                    kategorienew.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                                kategorienew.selectedIndex = 0;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    }).then(function () {
                        var recordId = getAdresseId();
                        if (recordId) {
                            //load of format relation record data
                            Log.print(Log.l.trace, "calling select contactView...");
                            return GenDataModDetails.adresseView.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "contactView: success!");
                                if (json && json.d && json.d.results) {
                                    // now always edit!
                                    var results = json.d.results;
                                    that.binding.modData = results[0];
                                }
                            }, function (errorResponse) {
                               
                            });
                        } 
                    }).then(function () {
                        var recordId = getPersonAdresseId();
                        if (recordId) {
                            //load of format relation record data
                            Log.print(Log.l.trace, "calling select contactView...");
                            return GenDataModDetails.personAdresseTable.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "contactView: success!");
                                if (json && json.d && json.d.results) {
                                    // now always edit!
                                    var results = json.d.results;
                                    that.binding.modpaData = results[0];
                                }
                            }, function (errorResponse) {

                            });
                        }
                    }).then(function () {
                        AppBar.notifyModified = true;
                        return WinJS.Promise.as();
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                }
                this.loadData = loadData;

                // save data
                var saveData = function (complete, error) {
                    Log.call(Log.l.trace, "GenDataModDetails.Controller.");
                    AppData.setErrorMsg(that.binding);
                    var ret;
                    var dataMod = that.binding.modData;
                    if (dataMod && AppBar.modified && !AppBar.busy) {
                        var recordId = getAdresseId();
                        if (recordId) {
                            AppBar.busy = true;
                            ret = GenDataModDetails.adresseTable.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "dataMod update: success!");
                                AppBar.modified = false;
                                
                                complete(response);
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                                }, recordId, dataMod).then(function () {
                                //load of format relation record data
                                Log.print(Log.l.trace, "calling select contactView...");
                                
                            });
                        }
                    } else if (AppBar.busy) {
                        ret = WinJS.Promise.timeout(100).then(function () {
                            return that.saveData(complete, error);
                        });
                    } else {
                        ret = new WinJS.Promise.as().then(function () {
                            if (typeof complete === "function") {
                                complete(dataMod);//dataContact
                            }
                        });
                    }
                    Log.ret(Log.l.trace);
                    return ret;
                }
                this.saveData = saveData;

                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.loadData();
                }).then(function () {
                    AppBar.notifyModified = true;
                    Log.print(Log.l.trace, "Record selected");
                });
                Log.ret(Log.l.trace);
            })
    });
})();