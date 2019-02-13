var DYData =  require("DYData");

cc.Class({
    extends: cc.Component,

    properties: {
        sprMonster : cc.Sprite,
        labLoading : cc.Label,
    },
    mLoadIdx : null,
    mMaxIdx : null,

    mLoading : null,
    mLoadingScene : null,
    
    onLoad(){
        cc.view.setDesignResolutionSize(720, 1280, cc.ResolutionPolicy.EXTRACT_FIT);
    },
    
    start () {
        var self = this;

        self.sprMonster.node.runAction(cc.repeatForever(cc.sequence(
            cc.moveBy(1, 0, -15), 
            cc.moveBy(3, 0, 15),
        )));

        self.mLoadIdx = 0;
        self.mMaxIdx = 2;

        self.labLoading.node.active = false;
        self.labLoading.string = "";
        
        self._init();

        require("DYData").sendEvent("游戏入口", {"默认" :"1"});
    },

    _init(){
        var self = this;
        var tFuncDummy = function(){
            self.scheduleOnce(self._init.bind(self), 1);
        }
        var tRespInitLogin = null;
        var tRespInitIap = null;
        var tRespInitAd = null;
        
        tRespInitLogin = function(et){
            if (et.event == dy.login.EVENT_INIT_SUCC){
                self.labLoading.node.active = true;
                self.mLoading = 0;
                self.labLoading.string = String.format("正在登录: {0}%", 0);
                self.schedule(self._updateLabel.bind(self), 0.1);

                dy.iap.init({}, tRespInitIap);
            }
            else{
                DDERROR("init login error");
                self.scheduleOnce(tFuncDummy, 0);
            }
        };
        tRespInitIap = function(et){
            if (et.event == dy.iap.EVENT_INIT_SUCC){
                dy.ad.init({}, tRespInitAd);
            }
            else{
                DDERROR("init iap error");
                self.scheduleOnce(tFuncDummy, 0);
            }
        };
        tRespInitAd = function(et){
            if (et.event == dy.iap.EVENT_INIT_SUCC){
                dy.loader.loadStaticRes("prefabs/boot/PanelBoot", cc.Prefab, function (err, res) {
                    var item = cc.instantiate(res);
                    self.node.parent.addChild(item, 1);
                    item.getComponent("PanelBoot").init(function () {
                        self._preSceneLoaded();
                        // self._prepare();
                    });
                });
            }
            else{
                DDERROR("init ad error");
                self.scheduleOnce(tFuncDummy, 0);
            }
        };

        dy.login.init({}, tRespInitLogin);
        self._prepare();
    },


    _updateLabel(){
        var self = this;
        self.mLoading++;
       
        if(self.mLoading <= 100){
            self.labLoading.string = String.format("正在登录: {0}%", self.mLoading);
            return;
        }

        self.unscheduleAllCallbacks();        
    },

    _prepare(){
        var self = this;
        self.mLoadingScene = "Game";
        dy.loader.preloadScene(self.mLoadingScene, function(){
            self._preSceneLoaded();
        });
    },

    _preSceneLoaded : function(){
        var self = this;
        self.mLoadIdx++;
        if(self.mLoadIdx >= self.mMaxIdx){
            cc.director.loadScene(self.mLoadingScene);  
            return;
        }
    },

});
