// service for page: mailing
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
            select: function (complete, error) {
                Log.call(Log.l.trace, "Infodesk.");
                var ret = Infodesk._Messestand.select(complete, error, null);
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
            //Aktiv: null,
            Vorname: "",
            Nachname: "",
            Login: "",
            SkillType1Sortierung: 0,
            SkillType2Sortierung: 0,
            SkillType3Sortierung: 0,
            SkillType4Sortierung: 0,
            SkillType5Sortierung: 0
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
                Vorname: "",
                Nachname: "",
                firstskill: "",
                secondskill: "",
                thirdskill: "",
                fourthskill: "",
                fifthskill: ""
            }
        }
    });
})();