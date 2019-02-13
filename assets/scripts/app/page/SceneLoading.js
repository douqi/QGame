cc.Class({
    extends: cc.Component,

    properties: {
        sprMonster : cc.Sprite,
        labLoading : cc.Label,

        pfbGuideTip : cc.Prefab,
    },
    mLoadIdx : null,
    mMaxIdx : null,

    mLoading : null,
    mMinLoading : null,
    
    start () {
        var self = this;

        self.sprMonster.node.runAction(cc.repeatForever(cc.sequence(
            cc.moveBy(1, 0, -15), 
            cc.moveBy(3, 0, 15),
        )));

        self.mLoading = 0;
        self.mMinLoading = 5; //dy.utils.random(5, 10);
        self.labLoading.string = "正在安排考场^_^";
        
        self.schedule(self._updateLabel.bind(self), 0.1);
        
        self.mLoadIdx = 0;
        self.mMaxIdx = 2;
        self.scheduleOnce(self.lateStart.bind(self), 0);

        
        if(dy.cache.loadingScene == "BattleScene" && dy.gameState.mode != 0 ){
            var t = dy.gameState.getTarget();
            if(t && t.targetTip){
                self._showGuideTip("", t.targetTip, cc.v2(0, 0), false, true);
            }
        }
    },

    _showGuideTip(title, content, ptOrig, autoHide, withNpc){
        var self = this;
       
        var tPanel = cc.instantiate(self.pfbGuideTip);
        var tComp = tPanel.getComponent("PanelGuideTip");
        tComp.init(title, content, withNpc);
        tComp.show(false, ptOrig, true);
    },

    lateStart(){
        var self = this;
        dy.loader.preloadScene(dy.cache.loadingScene, function(){
            self._preSceneLoaded();
        });
    },

    _updateLabel(){
        var self = this;
        self.mLoading++;
        if(self.mLoading >= self.mMinLoading){
            self._preSceneLoaded();
            self.unscheduleAllCallbacks(); 
            return;
        }
    },

    _preSceneLoaded : function(){
        var self = this;
        self.mLoadIdx++;
        if(self.mLoadIdx >= self.mMaxIdx){
            cc.director.loadScene(dy.cache.loadingScene);  
            return;
        }
    },

});
