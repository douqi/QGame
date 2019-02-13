// var S_SOCKET_URL = "wss://192.168.90.233:5000";
// var S_SOCKET_URL = "ws://echo.websocket.org";
// var S_SOCKET_URL = "wss://qgame.dayukeji.com:10023"; /// A服
var S_SOCKET_URL = "wss://qgame.dayukeji.com:11023"; /// B服
// var S_SOCKET_URL = "wss://qgame.dayukeji.com:12023"; /// 测试服

var S_SEQ_ID = 1000;
var DYData = require("DYData");
var GameSvr = {
    mHandler : null, 
    mExactHandler : null,

    init(){
        var self = this;
        // dy.socket.connect(S_SOCKET_URL, self._onRecvFromServer.bind(self));

        self.mHandler = {};
        self.mExactHandler = {};
    },

    setServer(socketUrl){
        var self = this;
        if(socketUrl){
            S_SOCKET_URL = socketUrl;
        }
        dy.socket.connect(S_SOCKET_URL, self._onRecvFromServer.bind(self));
        
        dy.utils.schedule(function(){
            self.requestPing();
        }, 10);
    },


    requestPing(){
        if(!dy.userMgr){
            return;
        }
        
        var t = {};
        t.mid = dykey.kCommandPing;
        t.state = dy.gameState.toData();
        t.userinfo = dy.userMgr.getInfo();       
        
        this._requestCommon(t);
    },

    requestNotice(cb){
        var t = {};
        t.mid = dykey.kCommandNotice;

        this._requestCommon(t, cb);
    },

    requestLogin(openId, nick, avatar, cb){
        var t = {};
        t.mid = dykey.kCommandLogin;
       
        t.openid = openId;
        t.nick = nick;
        t.avatar = avatar;

        this._requestCommon(t, cb);
    },

    requestJoinRoom(cb){
        var t = {};
        t.mid = dykey.kCommandJoinRoom;

        this._requestCommon(t, cb);
    },

    requestLeaveRoom(cb){
        var t = {};
        t.mid = dykey.kCommandLeaveRoom;

        this._requestCommon(t, cb);
    },

    requestCharge(code, cb){
        var t = {};
        t.mid = dykey.kCommandCharge;
        t.code = code;

        this._requestCommon(t, cb);
    },

    requestJoinFriendRoom(uid, oppoUid, roomId, cb){
        var t = {};
        t.mid = dykey.kCommandJoinFriendRoom;
        t.uid = uid;
        t.oppouid = oppoUid;
        t.roomid = roomId;

        this._requestCommon(t, cb);
    },

    // 
    requestInviteFrom(fuid, cb){
        var t = {};
        t.mid = dykey.kCommandInviteFrom;
        t.fuid = fuid;
        this._requestCommon(t, cb);
    },

    requestAllInvited(start, end, cb){
        var t = {};
        t.mid = dykey.kCommandAllInvited;
        t.start = start;
        t.end = end;
        this._requestCommon(t, cb);
    },

    requestFetchInviteBonus(fuid, cb){
        var t = {};
        t.mid = dykey.kCommandFetchInviteBonus;
        t.fuid = fuid;
        this._requestCommon(t, cb);
    },

    requestTodayInvited(cb){
        var t = {};
        t.mid = dykey.kCommandTodayInvited;
        this._requestCommon(t, cb);
    },

    _requestCommon(param, listener){
        var self = this;
        param.gameid = param.gameid || dy.utils.gameId();
        if(dy.cache.userInfo && dy.cache.userInfo.uid){
            param.uid = dy.cache.userInfo.uid;
        }
        param.seq = param.seq || self._genSeqId();
        param.nonce = dy.utils.guid();
        param.sign = dy.utils.genSign(String.format("{0}{1}{2}", param.mid, param.seq, param.nonce));
        if(listener){
            self.mExactHandler[param.seq] = listener;
        }
        
        console.log("_requestCommon: ", param);
        // dy.socket.emit("hello", param);
        dy.socket.send(param);
    },

    _onRecvFromServer(msg){
        var self = this;

        // try {
            // var tCmd = JSON.parse(msg);
            console.log("_onRecvFromServer: ", msg);
            var tCmd = msg;

            if(msg.code == 9999){
                // 此时网络异常出现，应该重新登录服务器，以恢复状态
                require("DYNotify").post(dykey.kEventSocketClose);
                return;
            }
            
            if(tCmd.time){
                dy.cache.serverTime = tCmd.time;
                
                if(dy.cache.match && dy.cache.match.time){
                    dy.cache.match.time.current = tCmd.time;
                    require("DYNotify").post(dykey.kEventUpdateTime);
                }
            }

            // 如果在请求时，有回调请求， 则精确匹配至回调即可
            if(tCmd.seq && self.mExactHandler[tCmd.seq]){
                var tListener = self.mExactHandler[tCmd.seq];
                delete self.mExactHandler[tCmd.seq];
                tListener(tCmd);
                return;
            }

            // 没有精确匹配到回调, 则进入正常的命令处理逻辑
            var tFunc = self.mHandler[tCmd.mid];
            if(tFunc){
                // tFunc.apply(self, tCmd);
                tFunc(tCmd);
                return;
            }

            require("DYNotify").post(tCmd.mid, tCmd);
        // } catch (error) {
        //     DDERROR("_onRecvFromServer:", error);
        // }
    },

    _genSeqId(){
        var tSeq = S_SEQ_ID++;
        return parseStr(tSeq);
    },
}

module.exports = GameSvr;