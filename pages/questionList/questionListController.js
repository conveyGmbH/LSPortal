// controller for page: questionList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/lib/OpenXml/scripts/linq.js" />
/// <reference path="~/www/lib/OpenXml/scripts/ltxml.js" />
/// <reference path="~/www/lib/OpenXml/scripts/ltxml-extensions.js" />
/// <reference path="~/www/lib/jszip/scripts/jszip.js" />
/// <reference path="~/www/lib/FileSaver/scripts/FileSaver.js" />
/// <reference path="~/www/lib/OpenXml/scripts/openxml.js" />
/// <reference path="~/www/lib/base64js/scripts/base64js.min.js" />
/// <reference path="~/www/pages/questionList/questionListService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("QuestionList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "QuestionList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                questionId: AppData.getRecordId("FragenAntworten"),
                questiongroupflag: true
            }, commandList]);
            this.nextUrl = null;
            this.loading = false;
            this.initFragengruppe = null;
            this.questions = null;
            this.labelOn = getResourceText("questionList.on");
            this.labelOff = getResourceText("questionList.off");
            this.textarea = getResourceText("questionList.textarea");

            var that = this;
            that.checkingQuestionareBarcodePDFFlag = false;

            // ListView control
            var listView = pageElement.querySelector("#listQuestionList.listview");

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.questions) {
                    that.questions = null;
                }
                if (that.initFragengruppe) {
                    that.initFragengruppe = null;
                }
            }

            var singleRatingTemplate = null, multiRatingTemplate = null, comboTemplate = null, singleTemplate = null, multiTemplate = null;
            // Conditional renderer that chooses between templates
            var listQuestionListRenderer = function (itemPromise) {
                return itemPromise.then(function (item) {
                    if (item.data.Fragentyp === 1) {
                        if (!multiTemplate) {
                            multiTemplate = pageElement.querySelector(".questionList-multi-template").winControl;
                        }
                        return multiTemplate.renderItem(itemPromise);
                    } else if (item.data.Fragentyp === 2) {
                        if (!singleRatingTemplate) {
                            singleRatingTemplate = pageElement.querySelector(".questionList-rating-template").winControl;
                        }
                        return singleRatingTemplate.renderItem(itemPromise);
                    } else if (item.data.Fragentyp === 3) {
                        if (!multiRatingTemplate) {
                            multiRatingTemplate = pageElement.querySelector(".questionList-multiRating-template").winControl;
                        }
                        return multiRatingTemplate.renderItem(itemPromise);
                    } else if (item.data.Fragentyp === 4) {
                        if (!comboTemplate) {
                            comboTemplate = pageElement.querySelector(".questionList-combo-template").winControl;
                        }
                        return comboTemplate.renderItem(itemPromise);
                    } else {
                        if (!singleTemplate) {
                            singleTemplate = pageElement.querySelector(".questionList-single-template").winControl;
                        }
                        return singleTemplate.renderItem(itemPromise);
                    }
                });
            }
            this.listQuestionListRenderer = listQuestionListRenderer;

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var mouseDown = false;

            var resultConverter = function (item, index) {
                var prevQuestion = null;

                if (!index) {
                    index = 0;
                }
                for (var j = 1; j <= 28; j++) {
                    if (item.Anzahl && j <= item.Anzahl) {
                        item["Line" + j.toString()] = 1;
                    } else {
                        item["Line" + j.toString()] = null;
                    }
                    var key;
                    if (j < 10) {
                        key = "Antwort0" + j.toString();
                    } else {
                        key = "Antwort" + j.toString();
                    }
                    if (item[key] === null) {
                        item[key] = "";
                    }
                }
                var map = QuestionList.initFragengruppeView.getMap();
                var results = QuestionList.initFragengruppeView.getResults();
                if (map && results) {
                    var curIndex = map[item.INITFragengruppeID];
                    if (typeof curIndex !== "undefined" && results[curIndex]) {
                        item["FragengruppeTITLE"] = results[curIndex].TITLE;
                    }
                    if (index > 0) {
                        prevQuestion = that.questions.getAt(index - 1);
                    }
                    if (prevQuestion) {
                        if (map[prevQuestion.INITFragengruppeID] === curIndex) {
                            item.FLAG_Trennlinie = null;
                        } else {
                            item.FLAG_Trennlinie = 1;
                        }
                    } else {
                        if (item.INITFragengruppeID && item.INITFragengruppeID !== "0") {
                            item.FLAG_Trennlinie = 1;
                        } else {
                            item.FLAG_Trennlinie = null;
                        }
                    }
                }
                item.showText = (item.Freitext === "1") ? true : false;
                item.showDate = (item.DateCombobox === "1") ? true : false;
                item.questiongroupflag = that.binding.questiongroupflag;
                item.labelOn = that.labelOn;
                item.labelOff = that.labelOff;
                item.textarea = that.textarea;
                if (item.Sortierung) {
                    if (typeof item.Sortierung !== "string") {
                        item.questionNumber = item.Sortierung.toString();
                    } else {
                        item.questionNumber = item.Sortierung;
                    }
                    item.questionNumber += ". ";
                } else {
                    item.questionNumber = "";
                }
                item.questionTitle = item.questionNumber + item.Fragestellung;
            }
            this.resultConverter = resultConverter;

            // get field entries
            var getFieldEntries = function (index, item) {
                Log.call(Log.l.trace, "questionListController.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var i, key;
                        var fields = element.querySelectorAll('input[type="text"]');
                        ret["Fragestellung"] = fields[0].value;
                        for (i = 1; i < fields.length; i++) {
                            if (i < 10) {
                                key = "Antwort0" + i.toString();
                            } else {
                                key = "Antwort" + i.toString();
                            }
                            ret[key] = fields[i].value;
                        }
                    }
                }
                if (item.showText) {
                    ret["Freitext"] = "1";
                    if (item.showDate) {
                        ret["DateCombobox"] = "1";
                    } else {
                        ret["DateCombobox"] = null;
                    }
                } else {
                    ret["Freitext"] = null;
                    ret["DateCombobox"] = null;
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var mergeRecord = function (prevRecord, newRecord) {
                Log.call(Log.l.trace, "questionListController.");
                var ret = false;
                for (var prop in newRecord) {
                    if (newRecord.hasOwnProperty(prop)) {
                        if (newRecord[prop] !== prevRecord[prop]) {
                            prevRecord[prop] = newRecord[prop];
                            ret = true;
                        }  
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.mergeRecord = mergeRecord;

            var scrollToRecordId = function (recordId) {
                Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                if (that.loading) {
                    WinJS.Promise.timeout(50).then(function () {
                        that.scrollToRecordId(recordId);
                    });
                } else {
                    if (recordId && listView && listView.winControl) {
                        for (var i = 0; i < that.questions.length; i++) {
                            var question = that.questions.getAt(i);
                            if (question && typeof question === "object" &&
                                question.FragenAntwortenVIEWID === recordId) {
                                listView.winControl.indexOfFirstVisible = i;
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.scrollToRecordId = scrollToRecordId;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.questions.length; i++) {
                        var question = that.questions.getAt(i);
                        if (question && typeof question === "object" &&
                            question.FragenAntwortenVIEWID === recordId) {
                            listView.winControl.selection.set(i).done(function () {
                                WinJS.Promise.timeout(50).then(function () {
                                    that.scrollToRecordId(recordId);
                                });
                            });
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i = 0;
                var item = null;
                Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                if (that.questions) for (i = 0; i < that.questions.length; i++) {
                    var question = that.questions.getAt(i);
                    if (question && typeof question === "object" &&
                        question.FragenAntwortenVIEWID === recordId) {
                        item = question;
                        break;
                    }
                }
                if (item) {
                    Log.ret(Log.l.trace, "i=" + i);
                    return { index: i, item: item };
                } else {
                    Log.ret(Log.l.trace, "not found");
                    return null;
                }
            };
            this.scopeFromRecordId = scopeFromRecordId;

            var setQuestionType = function (type) {
                Log.call(Log.l.trace, "QuestionList.Controller.", "type=" + type);
                if (that.curRecId && !that.prevRecId) {
                    var curScope = that.scopeFromRecordId(that.curRecId);
                    if (curScope && curScope.item &&
                        curScope.item.Fragentyp !== type) {
                        curScope.item.Fragentyp = type;
                        switch (type) {
                            case 1:
                                curScope.item.Multiselection = "1";
                                curScope.item.Combobox = null;
                                break;
                            case 2:
                                curScope.item.Multiselection = "2";
                                curScope.item.Combobox = null;
                                if (curScope.item.Anzahl < 2) {
                                    curScope.item.Anzahl = 2;
                                } else if (curScope.item.Anzahl > 6) {
                                    curScope.item.Anzahl = 6;
                                }
                                break;
                            case 3:
                                curScope.item.Multiselection = "3";
                                curScope.item.Combobox = null;
                                if (curScope.item.Anzahl > 6) {
                                    curScope.item.Anzahl = 6;
                                }
                                break;
                            case 4:
                                curScope.item.Multiselection = "0";
                                curScope.item.Combobox = "1";
                                if (curScope.item.Anzahl < 2) {
                                    curScope.item.Anzahl = 2;
                                }
                                break;
                            default:
                                curScope.item.Multiselection = "0";
                                curScope.item.Combobox = null;
                        }
                        var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                        that.mergeRecord(curScope.item, newRecord);
                        that.resultConverter(curScope.item, curScope.index);
                        that.questions.setAt(curScope.index, curScope.item);
                        AppBar.modified = true;
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.setQuestionType = setQuestionType;

            var setAnswerCount = function (value) {
                Log.call(Log.l.trace, "QuestionList.Controller.", "value=" + value);
                if (that.curRecId && !that.prevRecId) {
                    var curScope = that.scopeFromRecordId(that.curRecId);
                    if (curScope && curScope.item &&
                        value !== curScope.item.Anzahl) {
                        var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                        that.mergeRecord(curScope.item, newRecord);
                        curScope.item.Anzahl = value;
                        that.resultConverter(curScope.item, curScope.index);
                        that.questions.setAt(curScope.index, curScope.item);
                        AppBar.modified = true;
                    }
                }
                Log.ret(Log.l.trace);
            };
            this.setAnswerCount = setAnswerCount;

            this.inAnswerCountFromRange = false;
            var answerCountFromRange = function (range) {
                Log.call(Log.l.trace, "QuestionList.Controller.", "range=" + range);
                if (mouseDown) {
                    Log.print(Log.l.trace, "mouseDown is set!");
                    WinJS.Promise.timeout(250).then(function () {
                        that.answerCountFromRange(range);
                    });
                } else {
                    if (range) {
                        var value = range.value;
                        Log.print(Log.l.trace, "value=", value);
                        WinJS.Promise.timeout(50).then(function () {
                            that.setAnswerCount(value);
                            that.inAnswerCountFromRange = false;
                        });
                    } else {
                        that.inAnswerCountFromRange = false;
                    }
                }
                Log.ret(Log.l.trace);
            };
            this.answerCountFromRange = answerCountFromRange;

            var deleteData = function () {
                Log.call(Log.l.trace, "QuestionList.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.curRecId;
                if (recordId) {
                    AppBar.busy = true;
                    QuestionList.questionListView.deleteRecord(function (response) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        that.loadData().then(function () {
                            that.selectRecordId(that.binding.questionId);
                        });
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

            var saveData = function (complete, error) {
                var ret = null;
                Log.call(Log.l.trace, "QuestionList.Controller.");
                AppData.setErrorMsg(that.binding);
                // standard call via modify
                var recordId = that.prevRecId;
                if (!recordId) {
                    // called via canUnload
                    recordId = that.curRecId;
                }
                that.prevRecId = 0;
                if (recordId) {
                    var curScope = that.scopeFromRecordId(recordId);
                    if (curScope && curScope.item) {
                        var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                        if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) {
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = QuestionList.questionListView.update(function (response) {
                                Log.print(Log.l.info, "questionListView update: success!");
                                if (that.questions) {
                                    that.resultConverter(curScope.item, curScope.index);
                                    that.questions.setAt(curScope.index, curScope.item);
                                }
                                AppData.getUserData();
                                AppBar.modified = false;
                                // called asynchronously if ok
                                if (typeof complete === "function") {
                                    complete(response);
                                    that.checkingQuestionnaireBarcodePdf();
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            }, recordId, curScope.item);
                        } else {
                            Log.print(Log.l.trace, "no changes in recordId:" + recordId);
                        }
                    }
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                        complete({});
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            var base64ToBlob = function (base64Data, contentType) {
                contentType = contentType || '';
                var sliceSize = 1024;
                var byteCharacters = atob(base64Data);
                var bytesLength = byteCharacters.length;
                var slicesCount = Math.ceil(bytesLength / sliceSize);
                var byteArrays = new Array(slicesCount);

                for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                    var begin = sliceIndex * sliceSize;
                    var end = Math.min(begin + sliceSize, bytesLength);

                    var bytes = new Array(end - begin);
                    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                        bytes[i] = byteCharacters[offset].charCodeAt(0);
                    }
                    byteArrays[sliceIndex] = new Uint8Array(bytes);
                }
                return new Blob(byteArrays, { type: contentType });
            }
            this.base64ToBlob = base64ToBlob;

            var exportQuestionnaireBarcodePdf = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                AppBar.busy = true;
                ret = QuestionList.barcodeExportPdfView.select(function (json) {
                    Log.print(Log.l.trace, "barcodeExportPdfView: success!");
                    if (json && json.d) {
                        var results = json.d.results[0];
                        var pdfDataraw = results.DocContentDOCCNT1;
                        var sub = pdfDataraw.search("\r\n\r\n");
                        var pdfDataBase64 = pdfDataraw.substr(sub + 4);
                        var pdfData = that.base64ToBlob(pdfDataBase64, "pdf");
                        var pdfName = results.szOriFileNameDOC1;
                        saveAs(pdfData, pdfName);
                        AppBar.busy = false;
                    }
                }, function (errorResponse) {
                    AppBar.busy = false;
                    AppData.setErrorMsg(that.binding, errorResponse);
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportQuestionnaireBarcodePdf = exportQuestionnaireBarcodePdf;

            var checkingQuestionnaireBarcodePdf = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                AppBar.busy = true;
                ret = QuestionList.barcodeExportPdfView.select(function (json) {
                    Log.print(Log.l.trace, "barcodeExportPdfView: success!");
                    if (json && json.d && json.d.results) {
                        var results = json.d.results[0];
                        if (!results) {
                            that.checkingQuestionareBarcodePDFFlag = false;
                        } else {
                            that.checkingQuestionareBarcodePDFFlag = true;
                        }
                        AppBar.busy = false;
                    }
                }, function (errorResponse) {
                    AppBar.busy = false;
                    AppData.setErrorMsg(that.binding, errorResponse);
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.checkingQuestionnaireBarcodePdf = checkingQuestionnaireBarcodePdf;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickPdf: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    that.exportQuestionnaireBarcodePdf();
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    AppBar.busy = true;
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "question saved");
                        AppBar.triggerDisableHandlers();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving question");
                    });
                    QuestionList.questionListView.insert(function (json) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        var recordId = (json && json.d && json.d.FragenVIEWID);
                        Log.print(Log.l.info, "questionListView insert: success! recordId=" + recordId);
                        that.binding.questionId = recordId;
                        that.loadData().then(function () {
                            that.selectRecordId(that.binding.questionId);
                        });
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    var recordId = that.curRecId;
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "question saved");
                        that.binding.questionId = recordId;
                        if (AppBar.modified) {
                        that.loadData().then(function () {
                            that.selectRecordId(that.binding.questionId);
                        });
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving question");
                    });
                    Log.ret(Log.l.trace);
                },
                clickLineUp: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung > 1) {
                            curScope.item.Sortierung--;
                            var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                            that.mergeRecord(curScope.item, newRecord);
                            that.resultConverter(curScope.item, curScope.index);
                            that.questions.setAt(curScope.index, curScope.item);
                            // set modified!
                            AppBar.modified = true;
                            that.binding.questionId = curScope.item.FragenAntwortenVIEWID;
                            that.saveData(function (response) {
                                Log.print(Log.l.trace, "question saved");
                                that.loadData().then(function () {
                                    that.selectRecordId(that.binding.questionId);
                                });
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "error saving question");
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickLineDown: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung < that.binding.count) {
                            curScope.item.Sortierung += 2;
                            var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                            that.mergeRecord(curScope.item, newRecord);
                            that.resultConverter(curScope.item, curScope.index);
                            that.questions.setAt(curScope.index, curScope.item);
                            // set modified!
                            AppBar.modified = true;
                            that.binding.questionId = curScope.item.FragenAntwortenVIEWID;
                            that.saveData(function (response) {
                                Log.print(Log.l.trace, "question saved");
                                that.loadData().then(function () {
                                    that.selectRecordId(that.binding.questionId);
                                });
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "error saving question");
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changedQuestiongroup: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var value = event.currentTarget.value;
                        if (that.curRecId && !that.prevRecId && !that.inAnswerCountFromRange) {
                            var curScope = that.scopeFromRecordId(that.curRecId);
                            if (curScope && curScope.item &&
                                curScope.item.INITFragengruppeID !== value) {
                                curScope.item.INITFragengruppeID = value;
                                var map = QuestionList.initFragengruppeView.getMap();
                                var results = QuestionList.initFragengruppeView.getResults();
                                if (map && results) {
                                    var curIndex = map[curScope.item.INITFragengruppeID];
                                    if (typeof curIndex !== "undefined" && results[curIndex]) {
                                        curScope.item.FragengruppeTITLE = results[curIndex].TITLE;
                                    }
                                }
                                var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                                that.mergeRecord(curScope.item, newRecord);
                                that.resultConverter(curScope.item, curScope.index);
                                that.questions.setAt(curScope.index, curScope.item);
                                // set modified!
                                AppBar.modified = true;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changedShowText: function(event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (event.currentTarget && AppBar.notifyModified && 
                        listView && listView.winControl && 
                        (listView.winControl.loadingState === "complete" || listView.winControl.loadingState === "itemsLoaded") &&
                        that.curRecId && !that.prevRecId && !that.inAnswerCountFromRange) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            var curScope = that.scopeFromRecordId(that.curRecId);
                            if (curScope && curScope.item && 
                                curScope.item.showText !== toggle.checked) {
                                curScope.item.showText = toggle.checked;
                                var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                                that.mergeRecord(curScope.item, newRecord);
                                that.resultConverter(curScope.item, curScope.index);
                                AppBar.notifyModified = false;
                                that.questions.setAt(curScope.index, curScope.item);
                                AppBar.notifyModified = true;
                                // set modified!
                                AppBar.modified = true;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changedShowDate: function(event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (event.currentTarget && AppBar.notifyModified && 
                        listView && listView.winControl && 
                        (listView.winControl.loadingState === "complete" || listView.winControl.loadingState === "itemsLoaded") &&
                        that.curRecId && !that.prevRecId && !that.inAnswerCountFromRange) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            var curScope = that.scopeFromRecordId(that.curRecId);
                            if (curScope && curScope.item && 
                                curScope.item.showDate !== toggle.checked) {
                                curScope.item.showDate = toggle.checked;
                                var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                                that.mergeRecord(curScope.item, newRecord);
                                that.resultConverter(curScope.item, curScope.index);
                                AppBar.notifyModified = false;
                                that.questions.setAt(curScope.index, curScope.item);
                                AppBar.notifyModified = true;
                                // set modified!
                                AppBar.modified = true;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changedAnswerCount: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (event.target && AppBar.notifyModified) {
                        if (that.inAnswerCountFromRange) {
                            Log.print(Log.l.trace, "extra ignored");
                        } else {
                            that.inAnswerCountFromRange = true;
                            that.answerCountFromRange(event.target);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickButton: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var id = event.currentTarget.id;
                        Log.print(Log.l.trace, "button id=" + id + " pressed!");
                        var type;
                        switch (id) {
                            case "multi":
                                type = 1;
                                break;
                            case "singleRating":
                                type = 2;
                                break;
                            case "multiRating":
                                type = 3;
                                break;
                            case "combo":
                                type = 4;
                                break;
                            default:
                                type = 0;
                        }
                        that.setQuestionType(type);
                        if (listView && listView.winControl) {
                            var listControl = listView.winControl;
                            if (listControl.selection) {
                                var selectionCount = listControl.selection.count();
                                if (selectionCount === 1) {
                                    // Only one item is selected, show the page
                                    listControl.selection.getItems().done(function (items) {
                                        var item = items[0];
                                        if (item.data && item.data.FragenAntwortenVIEWID) {
                                            var newRecId = item.data.FragenAntwortenVIEWID;
                                            Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                            AppData.setRecordId('FragenAntworten', newRecId);
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            var recordId = that.curRecId;
                                            if (that.prevRecId !== 0) { //
                                                that.saveData(function (response) {
                                                    Log.print(Log.l.trace, "question saved");
                                                    that.binding.questionId = recordId;
                                                    that.loadData(that.binding.questionId).then(function () {
                                                        that.selectRecordId(that.binding.questionId);
                                                    });
                                                    AppBar.triggerDisableHandlers();
                                                }, function (errorResponse) {
                                                    Log.print(Log.l.error, "error saving question");
                                                });
                                            } else {
                                                AppBar.triggerDisableHandlers();
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    var recordId = that.curRecId;
                    if (recordId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item) {
                            var confirmTitle = getResourceText("questionList.labelDelete") + ": " +
                                (curScope.item.Fragestellung ? curScope.item.Fragestellung : "") +
                                "\r\n" + getResourceText("questionList.questionDelete");
                            confirm(confirmTitle, function (result) {
                                if (result) {
                                    Log.print(Log.l.trace, "clickDelete: user choice OK");
                                    var question;
                                    if (curScope.index > 0) {
                                        question = that.questions.getAt(curScope.index - 1);
                                    } else {
                                        question = that.questions.getAt(1);
                                    }
                                    if (question) {
                                        that.binding.questionId = question.FragenAntwortenVIEWID;
                                    }
                                    that.deleteData();
                                } else {
                                    Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                                }
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onPointerDown: function (e) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onMouseDown: function (e) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onPointerUp: function (e) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onMouseUp: function (e) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.FragenAntwortenVIEWID) {
                                        var newRecId = item.data.FragenAntwortenVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            AppData.setRecordId('FragenAntworten', newRecId);
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            if (that.prevRecId !== 0) {
                                                that.saveData(function (response) {
                                                    Log.print(Log.l.trace, "question saved");
                                                    AppBar.triggerDisableHandlers();
                                                }, function (errorResponse) {
                                                    Log.print(Log.l.error, "error saving question");
                                                });
                                            } else {
                                                AppBar.triggerDisableHandlers();
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        // single list selection
                        if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                            listView.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                        }
                        // direct selection on each tap
                        if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                            listView.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                        }
                        // Double the size of the buffers on both sides
                        /*
                        if (!maxLeadingPages) {
                            maxLeadingPages = listView.winControl.maxLeadingPages * 2;
                            listView.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = listView.winControl.maxTrailingPages * 2;
                            listView.winControl.maxTrailingPages = maxTrailingPages;
                        }
                        */
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.QuestionListLayout.QuestionsLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            if (that.questions) {
                                var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                                for (var i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                    var element = listView.winControl.elementFromIndex(i);
                                    if (element) {
                                        Colors.loadSVGImageElements(element, "question-list-image", 28, "#2b2b2b");
                                        Colors.loadSVGImageElements(element, "question-list-image-selected", 28, Colors.navigationColor);
                                        Colors.loadSVGImageElements(element, "question-image", 28, Colors.textColor);
                                        var item = that.questions.getAt(i);
                                        if (item) {
                                            var comboInitFragengruppe = element.querySelector("#InitFragengruppe.win-dropdown");
                                            if (comboInitFragengruppe && comboInitFragengruppe.winControl) {
                                                if (!comboInitFragengruppe.winControl.data ||
                                                    comboInitFragengruppe.winControl.data && !comboInitFragengruppe.winControl.data.length) {
                                                    comboInitFragengruppe.winControl.data = that.initFragengruppe;
                                                }
                                                comboInitFragengruppe.value = item.INITFragengruppeID;
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (eventInfo && eventInfo.detail) {
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
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.questions && that.nextUrl) {
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "calling select QuestionList.questionListView...");
                            var nextUrl = that.nextUrl;
                            that.nextUrl = null;
                            QuestionList.questionListView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "QuestionList.questionListView: success!");
                                // selectNext returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.nextUrl = QuestionList.questionListView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item) {
                                        that.resultConverter(item, that.questions.length);
                                        that.binding.count = that.questions.push(item);
                                    });
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }, null, nextUrl);
                        } else {
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (eventInfo && eventInfo.target) {
                        var comboInputFocus = eventInfo.target.querySelector(".win-dropdown:focus");
                        if (comboInputFocus) {
                            eventInfo.preventDefault();
                        } else {
                            // set focus into textarea if current mouse cursor is inside of element position
                            var setFocusOnElement = function (element) {
                                WinJS.Promise.timeout(0).then(function () {
                                    // set focus async!
                                    element.focus();
                                });
                            };
                            var textInputs = eventInfo.target.querySelectorAll(".win-textbox");
                            if (textInputs && textInputs.length > 0) {
                                for (var i = 0; i < textInputs.length; i++) {
                                    var textInput = textInputs[i];
                                    var position = WinJS.Utilities.getPosition(textInput);
                                    if (position) {
                                        var left = position.left;
                                        var top = position.top;
                                        var width = position.width;
                                        var height = position.height;
                                        if (that.cursorPos.x >= left && that.cursorPos.x <= left + width &&
                                            that.cursorPos.y >= top && that.cursorPos.y <= top + height) {
                                            setFocusOnElement(textInput);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
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
                clickPdf: function () {
                    if (that.checkingQuestionareBarcodePDFFlag === false || that.binding.generalData.publishFlag === 1) {
                        return true;
                    } else {
                        return false;
                    }
                },
                clickNew: function () {
                    // never disabled!
                    return false;
                },
                clickForward: function () {
                    // never disabled!
                    return false;
                },
                clickLineUp: function () {
                    var ret = true;
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung > 1) {
                            ret = false;
                        }
                    }
                    return ret;
                },
                clickLineDown: function () {
                    var ret = true;
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung < that.binding.count) {
                            ret = false;
                        }
                    }
                    return ret;
                },
                clickDelete: function () {
                    var ret = true;
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            that.binding.count > 1) {
                            ret = false;
                        }
                    }
                    return ret;
                }
            }

            // register ListView event handler
            if (listView) {
                // prevent some keyboard actions from listview to navigate within controls!
                this.addRemovableEventListener(listView, "keydown", function (e) {
                    if (!e.ctrlKey && !e.altKey) {
                        switch (e.keyCode) {
                            case WinJS.Utilities.Key.end:
                            case WinJS.Utilities.Key.home:
                            case WinJS.Utilities.Key.leftArrow:
                            case WinJS.Utilities.Key.rightArrow:
                            case WinJS.Utilities.Key.space:
                                e.stopImmediatePropagation();
                                break;
                        }
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
            }

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "QuestionList.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!QuestionList.initFragengruppeView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initFragengruppeView...");
                        //@nedra:25.09.2015: load the list of InitFragengruppe for Combobox
                        return QuestionList.initFragengruppeView.select(function (json) {
                            Log.print(Log.l.trace, "initFragengruppeView: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 1) {
                                that.initFragengruppe = new WinJS.Binding.List(json.d.results);
                                that.binding.questiongroupflag = true;
                            } else {
                                that.binding.questiongroupflag = false;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            QuestionList.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        that.initFragengruppe = new WinJS.Binding.List(QuestionList.initFragengruppeView.getResults());
                        if (QuestionList.initFragengruppeView.getResults().length > 1) {
                            that.binding.questiongroupflag = true;
                        } else {
                            that.binding.questiongroupflag = false;
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    that.loading = true;
                    return QuestionList.questionListView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "QuestionList.questionListView: success!");
                        // select returns object already parsed from json file in response
                        if (that.questions && recordId) {
                            if (json && json.d) {
                                var question = json.d;
                                var objectrec = scopeFromRecordId(recordId);
                                that.resultConverter(question, objectrec.index);
                                that.questions.setAt(objectrec.index, question);
                            }
                        } else {
                            if (json && json.d && json.d.results) {
                                that.nextUrl = QuestionList.questionListView.getNextUrl(json);
                                var results = json.d.results;
                                if (that.questions) {
                                    that.questions.length = 0;
                                } else {
                                    // Now, we call WinJS.Binding.List to get the bindable list
                                    that.questions = new WinJS.Binding.List([]);
                                }
                                results.forEach(function (item) {
                                    that.resultConverter(item, that.questions.length);
                                    that.binding.count = that.questions.push(item);
                                });

                                if (listView.winControl) {
                                    // fix focus handling
                                    that.setFocusOnItemInListView(listView);

                                    listView.winControl._supressScrollIntoView = false;
                                    // add ListView itemTemplate
                                    listView.winControl.itemTemplate = that.listQuestionListRenderer.bind(that);
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.questions.dataSource;
                                }
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        
                    }, recordId);
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
                return that.selectRecordId(that.binding.questionId);
            }).then(function () {
                that.checkingQuestionnaireBarcodePdf();
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                Log.print(Log.l.trace, "Record selected");
            });
            Log.ret(Log.l.trace);
        }, {
            prevRecId: 0,
            curRecId: 0,
            cursorPos: { x: 0, y: 0 }
        })
    });
})();

