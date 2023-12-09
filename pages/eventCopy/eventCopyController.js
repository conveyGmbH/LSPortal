// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventCopy/eventCopyService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventCopy", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventCopy.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataDestEventCombo: getEmptyDefaultValue(EventCopy.VeranstaltungView.defaultValue),
                dataSrcEventCombo: getEmptyDefaultValue(EventCopy.VeranstaltungView.defaultValue),
                dataEventCopy: 0,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic
            }, commandList]);

            var that = this;

            var eventTyp = pageElement.querySelector("#eventTyp");
            var checkbox1 = pageElement.querySelector('#checkbox1');
            var checkbox2 = pageElement.querySelector('#checkbox2');
            var checkbox3 = pageElement.querySelector('#checkbox3');
            var checkbox4 = pageElement.querySelector('#checkbox4');
            var checkbox5 = pageElement.querySelector('#checkbox5');

            var getEventId = function () {
                Log.print(Log.l.trace, "getEventId EventCopy._eventId=" + EventCopy._eventId);
                return EventCopy._eventId;
            }
            this.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "setEventId EventCopy._eventId=" + value);
                EventCopy._eventId = value;
            }
            this.setEventId = setEventId;

            var master = Application.navigator.masterControl;
            if (master &&
                master.controller &&
                master.controller.binding &&
                master.controller.binding.eventId) {
                that.setEventId(master.controller.binding.eventId);
            }

            var addHyphenAfterWordsExceptLast = function(textstring) {
                // Split the input string into words
                var words = textstring.split(" ");

                // Join the words with hyphens, except for the last word
                var result = words.slice(0, -1).join("-") + " " + words[words.length - 1];

                return result;
            }
            this.addHyphenAfterWordsExceptLast = addHyphenAfterWordsExceptLast;

            var disableCheckboxes = function() {
                // Get all the checkboxes
                var checkboxes = document.querySelectorAll('input[type="checkbox"]');

                // Check if the 5th checkbox is checked
                if (checkboxes[4].checked) {
                    // Disable the first 4 checkboxes
                    for (var i = 0; i < 4; i++) {
                        checkboxes[i].disabled = true;
                    }
                } else {
                    // Enable all checkboxes
                    for (var i = 0; i < checkboxes.length; i++) {
                        checkboxes[i].disabled = false;
                    }
                }
                AppBar.triggerDisableHandlers();
            }
            this.disableCheckboxes = disableCheckboxes;

            var getCheckboxData = function () {
                // Create an array to store the checkbox data
                var checkboxData = "";

                // Check if each checkbox is checked and push its value to the checkboxData array if it is
                if (checkbox1.checked) {
                    checkboxData += "QUESTIONNAIRE|";
                }
                if (checkbox2.checked) {
                    checkboxData += "MAILS|";
                }
                if (checkbox3.checked) {
                    checkboxData += "COLORS|";
                }
                if (checkbox4.checked) {
                    checkboxData += "OPTIONS|";
                }
                if (checkbox5.checked) {
                    checkboxData += "ALL";
                }

                // Return the checkbox data as an array
                return checkboxData;
            }
            this.getCheckboxData = getCheckboxData;
            
            var showSuccessModal = function() {
                var modal = pageElement.querySelector("#successModal");
                modal.style.display = "block";
            }
            this.showSuccessModal = showSuccessModal;

            var hideSuccessModal = function() {
                var modal = pageElement.querySelector("#successModal");
                modal.style.display = "none";
            }
            this.hideSuccessModal = hideSuccessModal;

            var showErrorModal = function () {
                var modal = pageElement.querySelector("#errorModal");
                modal.style.display = "block";
            }
            this.showErrorModal = showErrorModal;

            var hideErrorModal = function () {
                var modal = pageElement.querySelector("#errorModal");
                modal.style.display = "none";
            }
            this.hideErrorModal = hideErrorModal;

            // process Copy
            var processCopy = function (srcVaid, destVaid, restoreCategories) {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_CopyConfig", {
                    pSrcVAID: srcVaid,
                    pDestVAID: destVaid,
                    pRestoreCategories: restoreCategories
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    that.showSuccessModal();
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                    that.showErrorModal();
                });
                Log.ret(Log.l.trace);
            };
            this.processCopy = processCopy;

            var getCopyData = function () {
                Log.call(Log.l.trace, "EventCopy.Controller.");
                var eventId = that.getEventId();
                var combodata = parseInt(eventTyp.value);
                var checkboxdata = that.getCheckboxData();
                Log.ret(Log.l.trace);
                return that.processCopy(combodata, eventId, checkboxdata);
            }
            this.getCopyData = getCopyData;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventCopy.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickCopy: function() {
                    Log.call(Log.l.trace, "EventCopy.Controller.");
                    that.getCopyData();
                    Log.ret(Log.l.trace);
                },
                clickdisableCheckboxes: function(event) {
                    Log.call(Log.l.trace, "EventCopy.Controller.");
                    that.disableCheckboxes();
                    Log.ret(Log.l.trace);
                },
                clickhideSuccessModal: function(event) {
                    Log.call(Log.l.trace, "EventCopy.Controller.");
                    that.hideSuccessModal();
                    Log.ret(Log.l.trace);
                },
                clickhideErrorModal: function (event) {
                    Log.call(Log.l.trace, "EventCopy.Controller.");
                    that.hideErrorModal();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EventCopy.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "userinfo.Controller.");
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
                clickGotoPublish: function () {
                    return false;
                },
                clickCopy: function() {
                    return !(checkbox1.checked ||
                        checkbox2.checked ||
                        checkbox3.checked ||
                        checkbox4.checked ||
                        checkbox5.checked);
                }
            };

            var resultConverter = function (item, index) {
                item.index = index;
                if (that.getEventId() === item.VeranstaltungVIEWID) {
                    that.binding.dataDestEventCombo.VeranstaltungVIEWID = item.VeranstaltungVIEWID;
                    that.binding.dataDestEventCombo.Name = item.Name;
                }
            }
            this.resultConverter = resultConverter;
            
            var resultComboConverter = function (item, index) {
                item.index = index;
                if (that.getEventId() === item.VeranstaltungVIEWID) {
                    delete that.binding.dataSrcEventCombo[item.index];
                }
            }
            this.resultComboConverter = resultComboConverter;
            
            var loadData = function () {
                Log.call(Log.l.trace, "EventCopy.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select questionView...");
                    return EventCopy.VeranstaltungView.select(function (json) {
                        Log.print(Log.l.trace, "questionView: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use 
                            var results = json.d.results;
                            that.binding.dataSrcEventCombo = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.binding.dataSrcEventCombo.forEach(function (item, index) {
                                that.resultComboConverter(item, index);
                            });
                            if (eventTyp && eventTyp.winControl) {
                                eventTyp.winControl.data = new WinJS.Binding.List(that.binding.dataSrcEventCombo);
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {

                        });
                }).then(function () {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();
