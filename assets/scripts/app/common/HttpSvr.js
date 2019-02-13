let DYData = require("DYData");

var S_LOGIC_URL = "https://qgame.dayukeji.com:12004";
// var S_LOGIC_URL = "https://qgame-test.dayukeji.com:12004";


// 通用接口
// https://hyqsserver1.dayukeji.com:11004/Logic/user/getTimestamp  //获取服务器时间

// 逻辑相关
// /Logic/user/getServerConfig?gameId=20101           // 获取远程配置
// /Logic/user/queryuser   根据gameId和openid获取玩家数据
// /Logic/user/queryuid     根据gameId和uid获取玩家数据
// /Logic/user/insertuser   插入玩家(gameId, openid, uid, token, [honor, coin, param])
// /Logic/user/updatehonor 更新玩家荣耀(gameId, uid, honor)
// /Logic/user/updatecoin  更新玩家金币(gameId, uid, coin)
// /Logic/user/updateparam  更新玩家数据(gameId, uid, param)

// 排行榜相关
// /Stat/ranking/queryranking         gameId, [start, limit]     查询排行榜数据
// /Stat/ranking/insertranking         gameId, uid, nick, score  更新排行榜数据
// /Stat/ranking/queryrankingpos   gameId, uid   获取玩家排行榜位置

var HttpSvr = {
    getTimestamp(cb){
        var tUrl = "https://hyqsserver1.dayukeji.com:11004/Logic/user/getTimestamp";
        this._requestCommon(cb, tUrl, "", "GET");
    },

    getServerGates(cb){
        var tUrl = S_LOGIC_URL + "/Logic/user/getServerGates"
        var t = {};
        t.gameId = dy.utils.gameId();
        t.svr = dy.utils.gameSvr();
        var strParam = dy.common.genParamStr(t);
        this._requestCommon(cb, tUrl, strParam, "GET");
    },

    getTitleRank(titleArr, cb){
        var tUrl = S_LOGIC_URL + "/Logic/user/getTitleRank"
        var t = {};
        t.uid = dy.cache.userInfo.uid;
        t.gameId = dy.utils.gameId();
        t.titles = "";
        for(let i = 0; i < titleArr.length; ++i){
            if(i > 0){
                t.titles += ";";
            }
            t.titles += titleArr[i];
        }

        var strParam = dy.common.genParamStr(t);
        this._requestCommon(cb, tUrl, strParam, "GET");
    },
  
    setTitleRank(title, score, param, cb){
        var tUrl = S_LOGIC_URL + "/Logic/user/setTitleRank"
        var t = {};
        t.uid = dy.cache.userInfo.uid;
        t.gameId = dy.utils.gameId();
        t.nick = dy.login.userInfo.nick;
        t.avatar = dy.login.userInfo.avatar;
        
        t.title = title;
        t.score = score;
        t.param = param;

        var strParam = dy.common.genParamStr(t);
        this._requestCommon(cb, tUrl, strParam, "GET");
    },

    _requestCommon(cb, url, content, method){
        var xhr = cc.loader.getXMLHttpRequest();
       
        xhr.cb = cb;
        xhr.ontimeout = function() {
            xhr.isAborted = true;
            xhr.abort();
            if (xhr.cb) {
                xhr.cb(-1, "ontimeout;" + url);
                xhr.cb = null;
            }
        };
        xhr.timeout = 15000;

        xhr.onreadystatechange = function() {
            if (!xhr || xhr.isAborted) {
                return;
            }
            // // DDLOG("onreadystatechange, readyState={0}, statue={1}", xhr.readyState, xhr.status);
            if (xhr.readyState == 4) { // && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                // // DDLOG(response);

                if (xhr.cb) {
                    var resp = {};
                    if (xhr.status == 200) {
                        try {
                            DDLOG(response);
                            resp = JSON.parse(response);
                        } catch (e) {
                            resp = {};
                        }

                        xhr.cb(null, resp);
                    } else {
                        xhr.cb(xhr.status || -1, "on_" + xhr.status + ";" + url);
                    }

                    xhr.cb = null;
                }
            }
        };

        xhr.onerror = function() {
            if (xhr.cb) {
                xhr.cb(-2, "onerror;" + url);
                xhr.cb = null;
            }
        };

        var strParam = content;
        if (cc.sys.isNative) {
            if ("win32" != dy.utils.platform()) {
                xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            }

        }

        method = method || "GET";
        if (method == "GET") {
            if (strParam.length > 0) {
                url = encodeURI(String.format("{0}?{1}&{2}={3}", url, strParam, "ts" + dy.utils.currentTick(), dy.utils.currentTick()));
            }
            // DDLOG("GET urlApi : {0}", url);

            xhr.open('GET', url, true);
            xhr.send();
        } else {
            // DDLOG("POST urlApi : {0}", url);
            xhr.open('POST', url, true);
            strParam = encodeURI(strParam);
            xhr.send(strParam);
        }
    },
}

module.exports = HttpSvr;