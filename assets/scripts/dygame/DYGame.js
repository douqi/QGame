let DYData = require("DYData");
let kLanguage = "K_LANGUAGE";
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        window.dy = window.dy || {};
        dy.cache = dy.cache || {};
        
        cc.game.addPersistRootNode(this.node);
        
        dy.theRoot = this;
        dy.utils = require("DYUtils");
        dy.loader = require("DYLoader");
        dy.crypto = require("DYCrypto")
        dy.login = require("DYLoginMgr");
        dy.iap = require("DYIAPMgr");
        dy.ad = require("DYADMgr");
        dy.socket = require("DYSocket");
        dy.audio = require("DYAudio");
        dy.audio.init();
        
        this._initLocale();

        // for App
        dy.common = require("Common");
        dy.httpSvr = require("HttpSvr");
        dy.gameSvr = require("GameSvr");
        dy.gameSvr.init();
    },

    _initLocale(){
        // 添加多语言设置
        {
            dy.locale = "cn";
            dy.localeList = ["en", "cn", "tw"];
            var lang = cc.sys.language;
            if (lang == cc.sys.LANGUAGE_CHINESE) {
                dy.localeList.indexOf() >= 0
                if (dy.utils.isComplexFont() && (dy.localeList.indexOf("tw") >= 0)) {
                    lang = "tw";
                } else if (dy.localeList.indexOf("cn") >= 0) {
                    lang = "cn";
                } else {
                    lang = dy.localeList[1];
                }
            } else if (dy.localeList.indexOf("en") >= 0) {
                lang = "en";
            } else {
                lang = dy.localeList[1];
            }
            lang = DYData.getStat(kLanguage, lang);

            dy.i18n = {};
            dy.i18n.switchTo = function(tLang){
                if (dy.localeList.indexOf(tLang) >= 0) {
                    dy.locale = tLang;
                    dy.i18n.t = function(id) {
                        return require(tLang)[id];
                    }
                    DYData.setStat(kLanguage, tLang)
                }
            }
            dy.i18n.switchTo(lang);
        }

    
    }
    
});