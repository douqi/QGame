var DYData = require("DYData");
var GameState = require("GameState");

cc.Class({    
    name: "PanelBoot",
    extends: cc.Component,

    properties: {
    },

    mCallback : null,
    
    init : function(cb){
        var self = this;
        self.mCallback = cb;
        self._prepare();
    },

    _prepare : function(){
        var self = this;
        
        self._initWithConfig();
        self._tryLogin(); 
    },

    
    _initWithConfig : function(){
        //渲染模式为canvas时，关闭脏矩形
        var Config = require("Config");

        // if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
        //     cc.renderer.enableDirtyRegion(false);
        // }
        // if (dy.utils.platform() == "web" && cc.sys.os != cc.sys.OS_IOS){
        //     cc.audioEngine.setMaxWebAudioSize(100);
        // }
        
        cc.game.setFrameRate(30);
        // cc.director.setAnimationInterval(1.0/30);
        
        if(cc.debug){
            cc.debug.setDisplayStats(Config.DEBUG_FPS);
        }
        else{
            cc.director.setDisplayStats(Config.DEBUG_FPS);  
        }
        
        if(Config.DEBUG_MEM){
             dy.theRoot.schedule(function(){
                var sum = 0;

                let allTex = cc.textureCache.getAllTextures();
                for (let ti = 0; ti < allTex.length; ++ti){
                    let tex = allTex[ti];
                    sum += (tex.pixelWidth * tex.pixelHeight * 4) / 1024 / 1024;
                }
                
                DDLOG("TextureCache Memory Size: {0} M".format(sum.toFixed(2)));
            }, 1);
        }
        cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
        // cc.view.enableAutoFullScreen(true);

    },

    _onLoginComplete : function(err, resp){
        var self = this;
        if(err){
            dy.utils.scheduleOnce(function(){
                self._doLogin(self._onLoginComplete.bind(self));
            }, 1);
            return;
        }

        self.mCallback && self.mCallback();
    },   

    _tryLogin : function(){
        var self = this;

        dy.login.login("", function(et){
            if(et.event != dy.login.EVENT_LOGIN_SUCC){
                dy.utils.scheduleOnce(self._tryLogin.bind(self), 1);
                return;
            }
            
            dy.login.userInfo = et.param;

            self._doLogin(self._onLoginComplete.bind(self));
        });
    },

    _doLogin(cb){
        // if(true){
        //     cb && cb(null);
        //     return;
        // }
        var self = this;
        
        var tBegin = Date.now();

        var tFuncLoginResp = function(resp){
            console.log("requestLogin cost: ", Date.now() - tBegin);
            tBegin = Date.now();
            
            if(resp.mid != dykey.kCommandLogin || resp.code != 0){
                cb && cb(true);
                return;
            }
           
            cb && cb(null);
        }

        
        // 从服务器获取远端服务器列表
        var tFuncGetServerGates = function(err, resp){
            console.log("getServerGates cost: ", Date.now() - tBegin);
            tBegin = Date.now();

            if(err || resp.errorCode != 0){
                cb && cb(true);
                return;
            }
            dy.gameSvr.setServer(resp.data.host);
            dy.utils.scheduleOnce(function(){
                //cc.log("requestLogin" + new Date().getTime())
                dy.gameSvr.requestLogin(dy.login.userInfo.id, dy.login.userInfo.nick, dy.login.userInfo.avatar, tFuncLoginResp);
            }, 0);
        }
        
        
        dy.httpSvr.getServerGates(tFuncGetServerGates);
    },

});
