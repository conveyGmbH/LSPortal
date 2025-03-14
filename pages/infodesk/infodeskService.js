﻿// service for page: mailing
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Infodesk",
    {
        //für die combobox Skilltypeskills
        _skillTypeSkills: {
            get: function () {
                return AppData.getFormatView("SkillTypeSkills", 0);
            }
        },
        skillTypeSkills: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Infodesk.");
                var ret = Infodesk._skillTypeSkills.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "Sortierung"
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        // 
        //Messestandview20470 - für die Bezeichner und show/hide
        _Messestand: {
            get: function () {
                return AppData.getFormatView("Messestand", 20470);
            }
        },
        Messestand: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Infodesk.");
                var ret = Infodesk._Messestand.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                SkillType1: "",
                SkillType2: "",
                SkillType3: "",
                SkillType4: "",
                SkillType5: "",
                SkillType1ID: null,
                SkillType2ID: null,
                SkillType3ID: null,
                SkillType4ID: null,
                SkillType5ID: null
            }
        },
        defaultRestriction: {
            Aktiv: "",
            bAndInEachRow: true,
            bUseOr: false,
            countCombobox: 0,
            Vorname: "",
            Nachname: "",
            Login: "",
            Names: "",
            SkillType1Sortierung: 0,
            SkillType2Sortierung: 0,
            SkillType3Sortierung: 0,
            SkillType4Sortierung: 0,
            SkillType5Sortierung: 0,
            SkillTypeID: {},
            Sortierung: {},
            OrderAttribute: "SortNachname",
            OrderDesc: true
        },
        _SkillEntry: {
            get: function () {
                return AppData.getFormatView("SkillEntry", 20472);
            }
        },
        SkillEntry: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Infodesk.");
                var ret = Infodesk._SkillEntry.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                MitarbeiterID: 0,
                firstskill: "",
                secondskill: "",
                thirdskill: "",
                fourthskill: "",
                fifthskill: ""
            }
        },
        _benutzerNachrichtView: {
            get: function() {
                return AppData.getFormatView("BenutzerNachricht", 0);
            }
        },
        benutzerNachrichtView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "benutzerNachrichtView.");
                var ret = Infodesk._benutzerNachrichtView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "benutzerNachrichtView.");
                var ret = Infodesk._benutzerNachrichtView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "benutzerNachrichtView.");
                var ret = Infodesk._benutzerNachrichtView.insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        },
        _benutzerView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0);
            }
        },
        benutzerView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = Infodesk._benutzerView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = Infodesk._benutzerView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = Infodesk._benutzerView.insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                BenutzerVIEWID: 0,
                Info1: "",
                Info2: "",
                Info1TS: "",
                Info2TS: "",
                Vorname: "",
                Name: "",
                TelefonFestnetz: "",
                TelefonMobil: "",
                Titel: "",
                Position: "",
                Present: 0,
                EMail: ""
            }
        },
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20699, false);
            }
        },
        employeeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = Infodesk._employeeView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            defaultValue: {
                MitarbeiterVIEWID: 0,
                Doc1MitarbeiterID: 0,
                Vorname: "",
                Nachname: ""
            }
        },
        _userPhotoView: {
            get: function () {
                return AppData.getFormatView("DOC1Mitarbeiter", 0);
            }
        },
        userPhotoView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = Infodesk._userPhotoView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();