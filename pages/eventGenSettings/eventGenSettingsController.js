// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventGenSettings/eventGenSettingsService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventGenSettings", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventGenSettings.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataEvent: getEmptyDefaultValue(EventGenSettings.conferenceExhibitorView.defaultValue),
                newEventData: getEmptyDefaultValue(EventGenSettings.conferenceExhibitorView.newEventDefault),
                websiteData: getEmptyDefaultValue(EventGenSettings.mandantStartView.defaultValue)
            }, commandList]);

            var that = this;

            //select combo
            var livestartdate = pageElement.querySelector("#livestartdate");
            var livestarttime = pageElement.querySelector("#livestarttime");
            var liveenddate = pageElement.querySelector("#liveenddate");
            var liveendtime = pageElement.querySelector("#liveendtime");
            var listshowdate = pageElement.querySelector("#listshowdate");
            var listshowtime = pageElement.querySelector("#listshowtime");
            var listremovedate = pageElement.querySelector("#listremovedate");
            var listremovetime = pageElement.querySelector("#listremovetime");
            var neweventbox = pageElement.querySelector("#newevent");
            var showbox = pageElement.querySelector(".showcontainer");

            var eventtyp = pageElement.querySelector("#eventTyp");

            this.fieldisempty = false;

            this.dispose = function () {

            }

            var getDateObject = function (dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = new Date(milliseconds);
                } else {
                    //ret = new Date();
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var formatDate = function (date) {
                var d = new Date(date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                return [year, month, day].join('-');
            }
            this.formatDate = formatDate;

            var formatTime = function (time) {
                var currentTime = time;
                var gmt = -(new Date()).getTimezoneOffset() / 60;
                var totalSeconds = Math.floor(currentTime / 1000);
                var seconds = ('0' + totalSeconds % 60).slice(-2);
                var totalMinutes = Math.floor(totalSeconds / 60);
                var minutes = ('0' + totalMinutes % 60).slice(-2);
                var totalHours = Math.floor(totalMinutes / 60);
                var hours = ('0' + (totalHours + gmt) % 24).slice(-2);
                return hours + ":" + minutes;
            }
            this.formatTime = formatTime;

            var setDataEvent = function (newDataEvent) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.newEventData.VeranstaltungName = "";
                that.binding.dataEvent = newDataEvent;
                // convert LiveStartTS
                if (newDataEvent.LiveStartTS) {
                    that.binding.dataEvent.LiveStartDate = that.formatDate(that.getDateObject(newDataEvent.LiveStartTS));
                    that.binding.dataEvent.LiveStartTime = that.formatTime(that.getDateObject(newDataEvent.LiveStartTS));
                }
                if (newDataEvent.LiveEndTS) {
                    // convert LiveDuration
                    that.binding.dataEvent.LiveEndDate = that.formatDate(that.getDateObject(newDataEvent.LiveEndTS));
                    that.binding.dataEvent.LiveEndTime = that.formatTime(that.getDateObject(newDataEvent.LiveEndTS));
                }
                if (newDataEvent.ListShowTS) {
                    // convert ListShowTS
                    that.binding.dataEvent.ListShowDate = that.formatDate(that.getDateObject(newDataEvent.ListShowTS));
                    that.binding.dataEvent.ListShowTime = that.formatTime(that.getDateObject(newDataEvent.ListShowTS));
                }
                if (newDataEvent.ListRemoveTS) {
                    // convert ListRemoveTS
                    that.binding.dataEvent.ListRemoveDate = that.formatDate(that.getDateObject(newDataEvent.ListRemoveTS));
                    that.binding.dataEvent.ListRemoveTime = that.formatTime(that.getDateObject(newDataEvent.ListRemoveTS));
                }
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            };
            this.setDataEvent = setDataEvent;

            var getDateTimeData = function (date) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/;
                var dateArray = reggie.exec(date);
                if (dateArray) {
                    var dateObject = new Date(
                        (+dateArray[1]),
                        (+dateArray[2]) - 1, // Careful, month starts at 0!
                        (+dateArray[3]),
                        (+dateArray[4]),
                        (+dateArray[5])
                    );
                    return "/Date(" + dateObject.getTime() + ")/";
                } else {
                    return null;
                }
            }
            this.getDateTimeData = getDateTimeData;

            var createMandantVaText = function (id) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("Prc_CreateMandantVAText", {
                    pVeranstaltungID: id
                }, function (json) {
                    Log.print(Log.l.info, "call success!");
                }, function (error) {
                    Log.print(Log.l.error, "call error");

                });
            }
            this.createMandantVaText = createMandantVaText;

            var insertNewEvent = function () {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                AppData.setErrorMsg(that.binding);
                return AppData.call("PRC_CreateUserVeranstaltung", {
                    pVeranstaltungName: that.binding.newEventData.VeranstaltungName
                }, function (json) {
                    Log.print(Log.l.info, "call success!");
                    //that.createMandantVaText(json.d.results[0].NewVeranstaltungID);
                    neweventbox.style.display = "none";
                    showbox.style.display = "block";
                    var veranstaltungId = null;
                    if (json && json.d.results[0] && json.d.results[0].NewVeranstaltungID) {
                        veranstaltungId = json.d.results[0].NewVeranstaltungID;
                    var master = Application.navigator.masterControl;
                        that.setEventId(veranstaltungId);                        
                        if (master && master.controller && typeof master.controller.loadData === "function") {
                    master.controller.loadData();
                        };
                    } else {
                        Log.print(Log.l.error, "call error veranstaltungId is null");
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call error");

                });
            }
            this.insertNewEvent = insertNewEvent;

            var getDataEvent = function () {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                if (that.binding.dataEvent.LiveStartDate && that.binding.dataEvent.LiveStartTime) {
                    that.binding.dataEvent.LiveStartTS = that.getDateTimeData(that.binding.dataEvent.LiveStartDate + " " + that.binding.dataEvent.LiveStartTime);
                } else {
                    that.binding.dataEvent.LiveStartTS = null;
                }
                if (that.binding.dataEvent.LiveEndDate && that.binding.dataEvent.LiveEndTime) {
                    that.binding.dataEvent.LiveEndTS = that.getDateTimeData(that.binding.dataEvent.LiveEndDate + " " + that.binding.dataEvent.LiveEndTime);
                } else {
                    that.binding.dataEvent.LiveEndTS = null;
                }
                if (that.binding.dataEvent.ListShowDate && that.binding.dataEvent.ListShowTime) {
                    that.binding.dataEvent.ListShowTS = that.getDateTimeData(that.binding.dataEvent.ListShowDate + " " + that.binding.dataEvent.ListShowTime);
                } else {
                    that.binding.dataEvent.ListShowTS = null;
                }
                if (that.binding.dataEvent.ListRemoveDate && that.binding.dataEvent.ListRemoveTime) {
                    that.binding.dataEvent.ListRemoveTS = that.getDateTimeData(that.binding.dataEvent.ListRemoveDate + " " + that.binding.dataEvent.ListRemoveTime);
                } else {
                    that.binding.dataEvent.ListRemoveTS = null;
                }
                Log.ret(Log.l.trace);
            };
            this.getDataEvent = getDataEvent;

            var changeAppSetting = function (toggleId, checked) {
                Log.call(Log.l.trace, "Settings.Controller.", "toggleId=" + toggleId + " checked=" + checked);
                switch (toggleId) {
                    case "sharedNotes":
                        if (checked) {
                            that.binding.dataEvent.SharedNotes = 1;
                        } else {
                            that.binding.dataEvent.SharedNotes = null;
                        }
                        break;
                    case "requireReg":
                        if (checked) {
                            that.binding.dataEvent.RequireReg = 1;
                        } else {
                            that.binding.dataEvent.RequireReg = null;
                        }
                        break;
                    case "acceptRec":
                        if (checked) {
                            that.binding.dataEvent.AcceptRec = 1;
                        } else {
                            that.binding.dataEvent.AcceptRec = null;
                        }
                        break;
                    case "showAllowAudio":
                        if (checked) {
                            that.binding.dataEvent.AllowAudio = 1;
                        } else {
                            that.binding.dataEvent.AllowAudio = null;
                        }
                        break;
                    case "showAllowVideo":
                        if (checked) {
                            that.binding.dataEvent.AllowVideo = 1;
                        } else {
                            that.binding.dataEvent.AllowVideo = null;
                        }
                        break;
                    case "hideSilentVideos":
                        if (checked) {
                            that.binding.dataEvent.HideSilentVideos = 1;
                        } else {
                            that.binding.dataEvent.HideSilentVideos = null;
                        }
                        break;
                    case "speakerVideosPinned":
                        if (checked) {
                            that.binding.dataEvent.SpeakerVideosPinned = 1;
                        } else {
                            that.binding.dataEvent.SpeakerVideosPinned = null;
                        }
                        break;
                    case "showNoMemberList":
                        if (checked) {
                            that.binding.dataEvent.NoMemberList = 1;
                        } else {
                            that.binding.dataEvent.NoMemberList = null;
                        }
                        break;
                    case "listOnlyModerators":
                        if (checked) {
                            that.binding.dataEvent.ListOnlyModerators = 1;
                        } else {
                            that.binding.dataEvent.ListOnlyModerators = null;
                        }
                        break;
                    case "showShowNames":
                        if (checked) {
                            that.binding.dataEvent.ShowNames = 1;
                        } else {
                            that.binding.dataEvent.ShowNames = null;
                        }
                        break;
                    case "showRecordSession":
                        if (checked) {
                            that.binding.dataEvent.RecordSession = 1;
                        } else {
                            that.binding.dataEvent.RecordSession = null;
                        }
                        break;
                    case "showQuestions":
                        if (checked) {
                            that.binding.dataEvent.ShowQuestions = 1;
                        } else {
                            that.binding.dataEvent.ShowQuestions = null;
                        }
                        break;
                    case "showICS":
                        if (checked) {
                            that.binding.dataEvent.ShowICS = 1;
                        } else {
                            that.binding.dataEvent.ShowICS = null;
                        }
                        break;
                    case "publishRecording":
                        if (checked) {
                            that.binding.dataEvent.PublishRecording = 1;
                        } else {
                            that.binding.dataEvent.PublishRecording = null;
                        }
                        break;
                    case "showType":
                        if (checked) {
                            that.binding.dataEvent.ShowType = 1;
                        } else {
                            that.binding.dataEvent.ShowType = null;
                        }
                        break;
                    case "showReg":
                        if (checked) {
                            that.binding.dataEvent.ShowReg = 1;
                        } else {
                            that.binding.dataEvent.ShowReg = null;
                        }
                        break;
                    case "speakerName":
                        if (checked) {
                            that.binding.dataEvent.SpeakerName = 1;
                        } else {
                            that.binding.dataEvent.SpeakerName = null;
                        }
                        break;
                    case "speakerFN":
                        if (checked) {
                            that.binding.dataEvent.SpeakerFN = 1;
                        } else {
                            that.binding.dataEvent.SpeakerFN = null;
                        }
                        break;
                    case "speakerImage":
                        if (checked) {
                            that.binding.dataEvent.SpeakerImage = 1;
                        } else {
                            that.binding.dataEvent.SpeakerImage = null;
                        }
                        break;
                    case "speakerTitle":
                        if (checked) {
                            that.binding.dataEvent.SpeakerTitle = 1;
                        } else {
                            that.binding.dataEvent.SpeakerTitle = null;
                        }
                        break;
                    case "speakerCV":
                        if (checked) {
                            that.binding.dataEvent.SpeakerCV = 1;
                        } else {
                            that.binding.dataEvent.SpeakerCV = null;
                        }
                        break;
                }
                Log.ret(Log.l.trace);
            };
            this.changeAppSetting = changeAppSetting;

            var warningMsg = function (fieldName) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                alert(getResourceText("eventGenSettings.warnmsg") + fieldName);
                Log.ret(Log.l.trace);
            }
            this.warningMsg = warningMsg;

            var warningMsgDecider = function (fieldId) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                // getting id for the field without data and sending the WarningMsg
                switch (fieldId) {
                    case 1:
                        that.warningMsg(getResourceText("eventGenSettings.startdate"));
                        break;
                    case 2:
                        that.warningMsg(getResourceText("eventGenSettings.starttime"));
                        break;
                    case 3:
                        that.warningMsg(getResourceText("eventGenSettings.enddate"));
                        break;
                    case 4:
                        that.warningMsg(getResourceText("eventGenSettings.endtime"));
                        break;
                    case 5:
                        that.warningMsg(getResourceText("eventGenSettings.listshowdate"));
                        break;
                    case 6:
                        that.warningMsg(getResourceText("eventGenSettings.listshowtime"));
                        break;
                    case 7:
                        that.warningMsg(getResourceText("eventGenSettings.listremovedate"));
                        break;
                    case 8:
                        that.warningMsg(getResourceText("eventGenSettings.listremovetime"));
                        break;
                    default:
                }
                Log.ret(Log.l.trace);
            }
            this.warningMsgDecider = warningMsgDecider;

            var isValidDate = function (date) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                if (moment(date).isValid() && typeof date !== 'undefined') {
                    Log.ret(Log.l.trace);
                    return true;
                } else {
                    Log.ret(Log.l.trace);
                    return false;
                }
            }
            this.isValidDate = isValidDate;

            var isValidTime = function (time) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                if (moment(time, "HH:mm").isValid() && typeof time !== 'undefined') {
                    Log.ret(Log.l.trace);
                    return true;
                } else {
                    Log.ret(Log.l.trace);
                    return false;
                }
            }
            this.isValidTime = isValidTime;

            var checkValidDate = function (date, time, dateId, timeId) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                if ((typeof date === "undefined" || date === "") && (typeof time === "undefined" || time === "")) {
                    Log.ret(Log.l.trace);
                    return true;
                }
                if ((that.isValidDate(date) && that.isValidTime(time))) {
                    Log.ret(Log.l.trace);
                    return true;
                } else {
                    if (!that.isValidDate(date)) {
                        that.warningMsgDecider(dateId);
                    }
                    if (!that.isValidTime(time)) {
                        that.warningMsgDecider(timeId);
                    }
                    Log.ret(Log.l.trace);
                    return false;
                }
            }
            this.checkValidDate = checkValidDate();

            var checkifFieldIsEmpty = function () {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                //Checking if a Date and Time field has only 1 with data to throw a Warning Msg
                if (!checkValidDate(that.binding.dataEvent.LiveStartDate, that.binding.dataEvent.LiveStartTime, 1, 2)) {
                    Log.ret(Log.l.trace);
                    return true;
                } else if (!checkValidDate(that.binding.dataEvent.LiveEndDate, that.binding.dataEvent.LiveEndTime, 3, 4)) {
                    Log.ret(Log.l.trace);
                    return true;
                } else if (!checkValidDate(that.binding.dataEvent.ListShowDate, that.binding.dataEvent.ListShowTime, 5, 6)) {
                    Log.ret(Log.l.trace);
                    return true;
                } else if (!checkValidDate(that.binding.dataEvent.ListRemoveDate, that.binding.dataEvent.ListRemoveTime, 7, 8)) {
                    Log.ret(Log.l.trace);
                    return true;
                } else {
                    Log.ret(Log.l.trace);
                    return false;
                }
            }
            this.checkifFieldIsEmpty = checkifFieldIsEmpty;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOpenWebpage: function () {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    var windowObjectReference = window.open(that.binding.websiteData, "Homepage", "popup");
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "event settings saved");
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving event settings");
                    });
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    if (neweventbox.style.display === "none") {
                        neweventbox.style.display = "block";
                        showbox.style.display = "none";
                    } else {
                        neweventbox.style.display = "none";
                        showbox.style.display = "block";
                    }
                },
                onClickSave: function () {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    that.insertNewEvent();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeAppSetting: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    AppBar.modified = true;
                    if (event.currentTarget) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            var value = toggle.checked || event.currentTarget.value;
                            that.changeAppSetting(event.currentTarget.id, value);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                blockEnterKey: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickOk")
                            AppBar.commandList[i].key = null;
                    }

                },
                releaseEnterKey: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickOk")
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                    }
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "EventGenSettings.Controller.");
                    var recordId = that.getEventId();
                    if (recordId) {
                        that.getDeleteEventData(recordId);
                    }
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function () {
                    if (that.binding.dataEvent && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (typeof that.getEventId === "function") {
                        if (that.getEventId() !== AppData.getRecordId("Veranstaltung") && !that.binding.active && !AppBar.busy) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }
            };

            var getEventId = function () {
                Log.print(Log.l.trace, "getEventId EventGenSettings._eventId=" + EventGenSettings._eventId);
                return EventGenSettings._eventId;
            }
            this.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "setEventId EventGenSettings._eventId=" + value);
                EventGenSettings._eventId = value;
            }
            this.setEventId = setEventId;

            var getConferenceId = function () {
                Log.print(Log.l.trace, "getEventId EventGenSettings._eventId=" + EventGenSettings._conferenceId);
                return EventGenSettings._conferenceId;
            }
            this.getConferenceId = getConferenceId;

            var setConferenceId = function (value) {
                Log.print(Log.l.trace, "setEventId EventGenSettings._conferenceId=" + value);
                EventGenSettings._conferenceId = value;
            }
            this.setConferenceId = setConferenceId;

            var resultConverter = function (item, index) {
                var property = AppData.getPropertyFromInitoptionTypeID(item);
                /*if (property && property !== "individualColors" && (!item.pageProperty) && item.LocalValue) {
                    item.colorValue = "#" + item.LocalValue;
                    AppData.applyColorSetting(property, item.colorValue);
                }*/
            }
            this.resultConverter = resultConverter;

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    AppData.setErrorMsg(that.binding);
                    return AppData.call("PRC_GetEventTypeList", {
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (eventtyp.winControl && json.d) {
                            // add ListView dataSource
                            eventtyp.winControl.data = new WinJS.Binding.List(json.d.results);
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                }).then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select eventView...");
                    return EventGenSettings.conferenceExhibitorView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "eventView: success!");
                        if (json && json.d) {
                            // now always edit!
                            that.setDataEvent(json.d.results[0]);
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    Log.print(Log.l.trace, "calling select mandantStartView...");
                    return EventGenSettings.mandantStartView.select(function (json) {
                        Log.print(Log.l.trace, "mandantStartView: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var result = json.d.results[0];
                            that.binding.websiteData = result.StartUrl;
                            Log.print(Log.l.trace, "Data loaded");
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    });
                }).then(function () {
                    Log.print(Log.l.trace, "AppBar.notifyModified = " + AppBar.notifyModified);
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            //save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataEvent = that.binding.dataEvent;
                if (AppBar.modified && that.checkifFieldIsEmpty() && !AppBar.busy) {
                    error({});
                    return WinJS.Promise.as();
                } else {
                    if (dataEvent && AppBar.modified && !AppBar.busy) {
                        that.getDataEvent();
                        var recordId = dataEvent.ConferenceExhibitorVIEWID;
                        if (recordId) {
                            AppBar.busy = true;
                            AppBar.triggerDisableHandlers();
                            ret = EventGenSettings.conferenceExhibitorView.update(function (response) {
                                AppBar.busy = false;
                                AppBar.triggerDisableHandlers();
                                // called asynchronously if ok
                                Log.print(Log.l.info, "eventData update: success!");
                                AppBar.modified = false;
                                complete(response);
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                AppBar.triggerDisableHandlers();
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                            }, recordId, dataEvent);
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
                                complete({});
                            }
                        });
                    }
                };
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            var selectConfExhibitorId = function () {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.getEventId();
                if (recordId) {
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_ConfExhibitorID", {
                        pVeranstaltungID: recordId
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.setConferenceId(json.d.results[0].ConferenceExhibitorID);
                        that.loadData();
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    //AppData.setErrorMsg(that.binding, err);
                    Log.print(Log.l.error, "call error" + err.status + ": " + err.statusText);
                }
                Log.ret(Log.l.trace);
            };
            this.selectConfExhibitorId = selectConfExhibitorId;

            var getDeleteEventData = function (eventID) {
                Log.call(Log.l.trace, "EventGenSettings.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    // var curScope = that.deleteEventData;
                    var curScope = that.binding.dataEvent;
                    if (curScope) {
                        var confirmTitle = getResourceText("localevents.labelDelete") + ": " + curScope.MeetingName +
                            "\r\n" + getResourceText("localevents.eventDelete");
                        confirm(confirmTitle, function (result) {
                            if (result) {
                                AppBar.busy = true;
                                AppData.setErrorMsg(that.binding);
                                return AppData.call("PRC_DeleteVeranstaltung", {
                                    pVeranstaltungID: eventID
                                }, function (json) {
                                    Log.print(Log.l.info, "call success! ");
                                    AppBar.busy = false;
                                    that.setEventId(0);
                                    var master = Application.navigator.masterControl;
                                    if (master && master.controller && typeof master.controller.loadData === "function") {
                                        return master.controller.loadData();
                                    }
                                    return WinJS.Promise.as();
                                }, function (error) {
                                    AppBar.busy = false;
                                    Log.print(Log.l.error, "call error");
                                });
                            } else {
                                Log.print(Log.l.trace, "clickDelete: event choice CANCEL");
                                return WinJS.Promise.as();
                            }
                        });
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getDeleteEventData = getDeleteEventData;

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                that.setEventId(master.controller.binding.eventId);
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                var recordId = getEventId();
                if (recordId) {
                    return that.selectConfExhibitorId();
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



