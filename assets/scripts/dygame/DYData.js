var DYData = {
    mCacheData : {},
    getCache(key, def, noSign){
        let self = this;

        let tVal = self.mCacheData[key];
        if(!tVal){
            return def;
        }

        if(noSign){
            return tVal;
        }

        let tSignVal = self.mCacheData[key + "_sign"];
        if(self._genSign(key, tVal) != tSignVal){
            return def;
        }

        return tVal;
    },

    setCache(key, val, noSign){
        let self = this;

        self.mCacheData[key] = val;
        self.mCacheData[key + "_sign"] = self._genSign(key, val);
    },

    _genSign(key, val){
        var tSign = parseStr(key) + parseStr(val);
        return tSign;
    },

    clearCache (key){
        let self = this;
        delete self.mCacheData[key];
        delete self.mCacheData[key + "_sign"];
    },

    getStat(key, def){
        let ls = cc.sys.localStorage;
        let tVal = ls.getItem(key);
        if(!tVal){
            return def;
        }

        let tSignVal = ls.getItem(key + "_sign");
        if(dy.utils.genSign(parseStr(key) + parseStr(tVal)) != tSignVal){
            return def;
        }

        return tVal;
    },

    setStat(key, val){
        let ls = cc.sys.localStorage;
        ls.setItem(key, val);
        ls.setItem(key + "_sign", dy.utils.genSign(parseStr(key) + parseStr(val)));
    },

    clearStat(key){
        let ls = cc.sys.localStorage;
        ls.removeItem(key);
    },

    sendEvent(event, param){
        if(window.wx && window.wx.aldSendEvent){
            wx.aldSendEvent(event, param);
        }
    }
}

module.exports = DYData;