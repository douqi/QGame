var S_DUAN          = [54, 114, 194, 294, 394, 494];
var S_DUAN_LEVEL    = [4,9,14,24,34,44,54,69,84,99,114,134,154,174,194];

var S_WEEK_TICK = 7 * 24 * 3600 * 1000;
var S_WEEK_BEGIN = new Date("1970-1-5 00:00:00");


var S_UNIT = ["", "k", "m","b", "g", "t", "p", "e", "z", "y", "n", "d", "u"];

var DYData = require("DYData");
var Common = {
    
    restartGame: function() {
        // dy.audio.stopMusic();
        // dy.audio.stopAll();
        // dy.audio.uncacheAll();

        cc.game.restart();
    },

    gotoScene : function(sceneName){
        var tFuncGoto = function(){
            // dy.utils.gc();
            dy.ad.hide(dy.ad.AD_BANNER);
        }
        dy.cache.loadingScene = sceneName;
        cc.director.loadScene("LoadingScene", tFuncGoto); 
    },

    mOpenTimestamp : null,
    getOpenTimestamp : function(cb, forceUpdate){
        var self = this;
       
        var tFuncInvoke = function(err, resp){
            dy.utils.scheduleOnce(function(){
                cb && cb(err, resp);
            });
        }

        if (!forceUpdate && self.mOpenTimestamp){ 
            tFuncInvoke(null, {timestamp: self.mOpenTimestamp});
            return;
        }

        var tFuncResp = function(err, resp){
            if(!err){
                self.mOpenTimestamp = resp.timestamp;
            }
            tFuncInvoke(err, resp);
        }
        dy.httpSvr.getTimestamp(tFuncResp);
    },

    formatFruitStr : function(fruit){
        var tVal = parseInt(fruit);
        if(tVal < 10000){
            return parseStr(tVal);
        }

        return String.format("{0}万", (tVal / 10000).toFixed(2));
    },

    formatWeekStr : function(tick){
        var tIdxWeek = Math.floor((new Date(parseInt(tick)).getTime() - S_WEEK_BEGIN.getTime()) / S_WEEK_TICK);
        return parseStr(tIdxWeek);
    },

    formatLevelStr : function(level){
        var t1 = 0;
        var t2 = 0;

        var tLevel = (parseInt(level) || 1) - 1;

        if(tLevel >= 100){
            tLevel = tLevel - 100;
            t1 = 5 + Math.floor(tLevel / 50);
            t2 = tLevel % 50 + 1;
        }
        else if(tLevel >= 60){
            tLevel = tLevel - 60;
            t1 = 4;
            t2 = tLevel % 40 + 1;
        }
        else if(tLevel >= 30){
            tLevel = tLevel - 30;
            t1 = 3;
            t2 = tLevel % 30 + 1;
        }
        else if(tLevel >= 10){
            tLevel = tLevel - 10;
            t1 = 2;
            t2 = tLevel % 20 + 1;
        }
        else {
            t1 = 1;
            t2 = tLevel + 1;
        }

        return String.format("{0}-{1}", t1, t2);
    },

    parseCoinStr(coinStr){
        var tCoinStr = coinStr || "0;0";
        var tCoinArr = tCoinStr.split(";");
        return {val: parseFloat(tCoinArr[0]), unit: parseInt(tCoinArr[1])};
    },
    
    // degree: 用于当前显示的 unit与真实unit的关系. 当 degree = 1 时，显示 val * 1000, unit - 1 
    formatCoinStr(coin, degree, floor){
        degree = degree || 0;

        var tVal = coin.val;
        var tUnit = coin.unit;

        while(tVal / 1000 > 1){
            // 提升一级
            tVal /= 1000;
            tUnit += 1;
        }

        while(tUnit > 0 && degree > 0){
            tVal *= 1000;
            tUnit -= 1;
            
            degree--;
        }

        if(tUnit >= S_UNIT.length){
            tUnit = String.format("{0}{1}", S_UNIT[S_UNIT.length-1], tUnit-S_UNIT.length+1)
        }
        else{
            tUnit = S_UNIT[tUnit];
        }

        var tStr = "";
        if(!tUnit){
            tStr = String.format("{0}", Math.floor(tVal));
        }
        else if(floor){
            tStr = String.format("{0}{1}", Math.floor(tVal), tUnit);
        }
        else{
            tStr = String.format("{0}{1}", tVal.toFixed(2), tUnit);
        }
        
        return tStr;
    },

    compareCoin(coin1, coin2){
        if(coin1.unit == coin2.unit){
            return coin1.val - coin2.val;
        }

        if(coin1.unit > coin2.unit){
            let tVal = coin1.val * Math.pow(1000, coin1.unit - coin2.unit);
            return tVal - coin2.val;
        }

        if(coin1.unit < coin2.unit){
            let tVal = coin2.val * Math.pow(1000, coin2.unit - coin1.unit);
            return coin1.val - tVal;
        }

        return 0;
    },

    addCoin(coin1, coin2){
        var tCoin = {val: coin1.val, unit : coin1.unit};
        
        var tVal = parseFloat(coin2.val);
        var tUnit = coin2.unit;
        
        if(tUnit == tCoin.unit){
            tCoin.val += tVal;
        }
        else if(tUnit < tCoin.unit){
            let tCnt = tCoin.unit - tUnit;
            while(tCnt > 0){
                tCoin.val *= 1000;
                tCnt--;
            }

            tCoin.val += tVal;
            tCoin.unit = tUnit;
        }
        else{
            let tCnt = tUnit - tCoin.unit;
            while(tCnt > 0){
                tVal *= 1000;
                tCnt--;
            }

            tCoin.val += tVal;
            // tCoin.unit = tUnit;
        }


        while(tCoin.val / 1000 > 1){
            // 提升一级
            tCoin.val /= 1000;
            tCoin.unit += 1;
        }

        return tCoin;
    },

    multiCoin(coin, param){
        var tCoin = {val: coin.val, unit : coin.unit};
        
        var tVal = parseFloat(param);
        tCoin.val *= tVal;

        while(tCoin.val / 1000 > 1){
            // 提升一级
            tCoin.val /= 1000;
            tCoin.unit += 1;
        }

        return tCoin;
    },

    mSpeed : null,
    speedUp(speed, time){
        var self = this;
        if(self.mSpeed && self.mSpeed > 1){
            return;
        }

        self.mSpeed = speed;
        dy.utils.scheduleOnce(function(){
            self.mSpeed = 1;
            require("DYNotify").post(dykey.kEventSpeedTimeup);
        }, time);
    },
    isSpeeding(){
        return (this.mSpeed && this.mSpeed > 1);
    },

    mLaunchTick : null,
    getLaunchTick(){
        if(!this.mLaunchTick){
            this.mLaunchTick = dy.utils.currentTick();
            return 0;
        }

        return dy.utils.currentTick() - this.mLaunchTick;
    },

    genCommand(cmd, args){
        var content = cmd;
        for(let i = 0; i < args.length; ++i){
            content += "|";
            content += args[i];
        }

        return content;
    },

    genParamStr(params){
        var strParam = "";
        for (var key in params) {
            if (strParam.length > 0) {
                strParam = strParam + "&";
            }
            strParam = strParam + String.format("{0}={1}", key, params[key]);
        }

        return strParam;
    },

    genUserSign(uid, token){
        var strPlain = String.format("{0}&gameID={1}&userID={2}&{3}", mvsHelper.config.MVS_APP_KEY, mvsHelper.config.MVS_APP_ID, uid, token);
        return dy.crypto.md5.hex_md5(strPlain);
    },

    genGlobalSign(uid){
        var strPlain = String.format("{0}&gameID={1}&userID={2}&{3}", mvsHelper.config.MVS_APP_KEY, mvsHelper.config.MVS_APP_ID, uid, mvsHelper.config.MVS_APP_SECRET);
        return dy.crypto.md5.hex_md5(strPlain);
    },

    genHashSign(uid, token, tag, param){
        if(tag === "SET"){
            var strPlain = String.format("{0}&gameID={1}&key={2}&userID={3}&value={4}&{5}",mvsHelper.config.MVS_APP_KEY, mvsHelper.config.MVS_APP_ID, param.key, uid, param.value, token);
            return dy.crypto.md5.hex_md5(strPlain);
        }
        if(tag === "GET"){
            var strPlain = String.format("{0}&gameID={1}&key={2}&userID={3}&{4}",mvsHelper.config.MVS_APP_KEY, mvsHelper.config.MVS_APP_ID, param.key, uid, token);
            return dy.crypto.md5.hex_md5(strPlain);
        }

        return "";
    },

    toast(msg, delay){
        dy.loader.loadPrefab("prefabs/page/PanelToast", function(err, panel){
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("DYGame"); //cc.find("Canvas");
            var tComp = panel.getComponent("PanelToast");
            tComp.init(delay, msg);
            tParent.addChild(panel, 100);
        }, false);
    },

    showFace(cb, face, target){
        var url = String.format("res/game/{0}", face);
        dy.loader.loadRes(url, cc.SpriteFrame, function(err, res){
            if(err){
                cb && cb(true);
                return;
            }
            var tParent = target || cc.find("Canvas");
            var panel = dy.loader.createNode();
            var tComp = panel.addComponent(cc.Sprite);
            tComp.spriteFrame = res;
            tParent.addChild(panel);

            cb && cb(null, panel);
        });
    },
    
    mOfflineDlgShowing : null,
    showOfflineDlg(offline){
        var self = this;
        if (self.mOfflineDlgShowing){
            return;
        }
        self.mOfflineDlgShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelOfflineDlg", function(err, panel){
            self.mOfflineDlgShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            
            var tParent = cc.find("Canvas");
            var tComp = panel.getComponent("PanelOfflineDlg");
            tComp.init(offline);
            tParent.addChild(panel);
            tComp.show(true);

        }, false);
    },

    mCertainDlgShowing : null,
    showCertainDlg(cb, title, content, confirm, withClose, target){
        var self = this;
        if (self.mCertainDlgShowing){
            return;
        }
        self.mCertainDlgShowing = true;

        dy.loader.loadPrefab("prefabs/page/PanelCertainDlg", function(err, panel){
            self.mCertainDlgShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelCertainDlg");
            tComp.init(title, content, confirm, withClose, cb);
            tParent.addChild(panel);
            tComp.show(true);

        }, false);
    },

    mGetVideoCoinShowing : null,
    showGetVideoCoin(cb, title, content, confirm, data, target){
        var self = this;
        if (self.mGetVideoCoinShowing){
            return;
        }
        self.mGetVideoCoinShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelGetVideoCoin", function(err, panel){
            self.mGetVideoCoinShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelGetVideoCoin");
            tComp.init(title, content, confirm, data, cb);
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    
    mSelectDlgShowing : null,
    showSelectDlg(cb, title, content, confirm, cancel, target){
        var self = this;
        if (self.mSelectDlgShowing){
            return;
        }
        self.mSelectDlgShowing = true;

        dy.loader.loadPrefab("prefabs/page/PanelSelectDlg", function(err, panel){
            dy.utils.scheduleOnce(function(){
                self.mSelectDlgShowing = false;
            }, 1); 

            if(err || !panel){
                cb && cb(true);
                return;
            }
            
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelSelectDlg");
            tComp.init(title, content, confirm, cancel, cb);
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    mSelectRankDlgShowing : null,
    showSelectRankDlg(pos, mode){
        var self = this;
        self.showGlobalRank();
        return;

        if (self.mSelectRankDlgShowing){
            return;
        }
        self.mSelectRankDlgShowing = true;

        dy.loader.loadPrefab("prefabs/page/PanelSelectRankDlg", function(err, panel){
            self.mSelectRankDlgShowing = false; 

            if(err || !panel){
                cb && cb(true);
                return;
            }

            var tParent = cc.find("DYGame");
            var tComp = panel.getComponent("PanelSelectRankDlg");
            tComp.init(pos, mode);
            tParent.addChild(panel);
        }, false);
    },

    mSpeedUpDlgShowing : null,
    showSpeedUpDlg(cb, target) {
        var self = this;
        if (self.mSpeedUpDlgShowing){
            return;
        }
        self.mSpeedUpDlgShowing = true;

        dy.loader.loadPrefab("prefabs/page/PanelSpeedUpDlg", function(err, panel){
            self.mSpeedUpDlgShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelSpeedUpDlg");
            tComp.init(cb);
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    mLevelUnlockDlgShowing : null,
    showLevelUnlockDlg(newLevel, target) {
        var self = this;
        if (self.mLevelUnlockDlgShowing){
            return;
        }
        self.mLevelUnlockDlgShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelLevelUnlockDlg", function(err, panel){
            self.mLevelUnlockDlgShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelLevelUnlockDlg");
            tComp.init(newLevel);
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },


    mLeaderboardShowing : null,
    showLeaderboard(cb, target, isGroup){
        var self = this;

        if (self.mLeaderboardShowing){
            return;
        }
        self.mLeaderboardShowing = true;
        dy.loader.loadPrefab("prefabs/page/PanelLeaderboard", function(err, panel){
            self.mLeaderboardShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            var tParent = target || cc.find("DYGame");
            var tComp = panel.getComponent("PanelLeaderboard");
            tComp.init(isGroup);
            
            tParent.addChild(panel);
        });
    },

    showGlobalRank(cb, target){
        var self = this;

        if (self.mLeaderboardShowing){
            return;
        }
        self.mLeaderboardShowing = true;
        dy.loader.loadPrefab("prefabs/page/PanelGlobalRank", function(err, panel){
            self.mLeaderboardShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelGlobalRank");
            tComp.init();
            
            tParent.addChild(panel);
        });
    },

    mPanelShopShowing : null,
    showPanelShop(cb, target){
        var self = this;
        if (self.mPanelShopShowing){
            return;
        }
        self.mPanelShopShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelShop", function(err, panel){
            self.mPanelShopShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelShop");
            // tComp.init();
            tParent.addChild(panel);
            // tComp.show(true);
        }, false);
    },

    mPanelInviteShowing : null,
    showPanelInvite(){
        var self = this;
        if (self.mPanelInviteShowing){
            return;
        }
        self.mPanelInviteShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelInviteDlg", function(err, panel){
            self.mPanelInviteShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            
            var tParent = cc.find("Canvas");
            // var tComp = panel.getComponent("PanelShop");
            // tComp.init();
            tParent.addChild(panel);
            // tComp.show(true);
        }, false);
    },

    mPanelInviteShowing : null,
    showPanelTodayInvite(){
        var self = this;
        if (self.mPanelInviteShowing){
            return;
        }
        self.mPanelInviteShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelTodayInviteDlg", function(err, panel){
            self.mPanelInviteShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            
            var tParent = cc.find("Canvas");
            // var tComp = panel.getComponent("PanelShop");
            // tComp.init();
            tParent.addChild(panel);
            // tComp.show(true);
        }, false);
    },


    mPanelSignShowing : null,
    showPanelSign(){
        var self = this;
        if (self.mPanelSignShowing){
            return;
        }
        self.mPanelSignShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelSignDlg", function(err, panel){
            self.mPanelSignShowing = false;
            if(err || !panel){
                cb && cb(true);
                return;
            }
            
            var tParent = cc.find("Canvas");
            // var tComp = panel.getComponent("PanelShop");
            // tComp.init();
            tParent.addChild(panel);
            // tComp.show(true);
        }, false);
    },
    mGetMultiShowing : null,
    showGetMulti(title, content, data){
        var self = this;
        if (self.mGetMultiShowing){
            return;
        }
        self.mGetMultiShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelGetMulti", function(err, panel){
            self.mGetMultiShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("Canvas");
            var tComp = panel.getComponent("PanelGetMulti");
            tComp.init(title, content, data);
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    mGetCoinShowing : null,
    showGetCoin(title, content, data, bAnim){
        var self = this;
        if (self.mGetCoinShowing){
            return;
        }
        self.mGetCoinShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelGetCoin", function(err, panel){
            self.mGetCoinShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("Canvas");
            var tComp = panel.getComponent("PanelGetCoin");
            tComp.init(title, content, data);
            tParent.addChild(panel);
            tComp.show(bAnim);
        }, false);
    },

    // 获取钻石
    mGetDiamondShowing : null,
    showGetDiamond(bonus, anotherBonus){
        var self = this;
        if (self.mGetDiamondShowing){
            return;
        }
        self.mGetDiamondShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelGetDiamond", function(err, panel){
            self.mGetDiamondShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("Canvas");
            var tComp = panel.getComponent("PanelGetDiamond");
            tComp.init(bonus, anotherBonus);
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    // 再来获取钻石
    mAnotherDiamondShowing : null,
    showAnotherDiamond(bonus){
        var self = this;
        if (self.mAnotherDiamondShowing){
            return;
        }
        self.mAnotherDiamondShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelAnotherDiamond", function(err, panel){
            self.mAnotherDiamondShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("Canvas");
            var tComp = panel.getComponent("PanelAnotherDiamond");
            tComp.init(bonus);
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    // 再来获取钻石
    mPanelDiskShowing : null,
    showPanelDiskDlg(){
        var self = this;
        if (self.mPanelDiskShowing){
            return;
        }
        self.mPanelDiskShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelDiskDlg", function(err, panel){
            self.mPanelDiskShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("Canvas");
            var tComp = panel.getComponent("PanelDiskDlg");
            // tComp.init(bonus);
            tParent.addChild(panel);
            // tComp.show(true);
        }, false);
    },

    mPanelHelpShowing : null,
    showPanelHelp(){
        var self = this;
        if (self.mPanelHelpShowing){
            return;
        }
        self.mPanelHelpShowing = true;

        dy.loader.loadPrefab("prefabs/game/PanelHelpDlg", function(err, panel){
            self.mPanelHelpShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("Canvas");
            var tComp = panel.getComponent("PanelHelpDlg");
            tParent.addChild(panel);
        }, false);
    },

    showBonus(param, isTutorial, cb){
        var self = this;

        if (self.mBonusShowing){
            return;
        }
        self.mBonusShowing = true;

        var tUrl = "prefabs/page/PanelBonus";
        var tCompName = "PanelBonus";
        if(isTutorial){
            tUrl = "prefabs/tutorial/PanelBonusTutorial";
            tCompName = "PanelBonusTutorial";
        }

        dy.loader.loadPrefab(tUrl, function(err, panel){
            self.mBonusShowing = false;
            if(err || !panel){
                return;
            }
            var tParent = cc.find("Canvas");
            var tComp = panel.getComponent(tCompName);
            tComp.init(param, cb);
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    // 
    mFreeCoinDlgShowing : null,
    showGetFreeCoin(target){
        var self = this;
        if (self.mFreeCoinDlgShowing){
            return;
        }
        self.mFreeCoinDlgShowing = true;

        dy.loader.loadPrefab("prefabs/page/PanelFreeCoin", function(err, panel){
            self.mFreeCoinDlgShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelFreeCoin");
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    mDailyTaskDlgShowing : null,
    showDailyTask(target){
        var self = this;
        if (self.mDailyTaskDlgShowing){
            return;
        }
        self.mDailyTaskDlgShowing = true;

        dy.loader.loadPrefab("prefabs/page/PanelDailyTask", function(err, panel){
            self.mDailyTaskDlgShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = target || cc.find("Canvas");
            var tComp = panel.getComponent("PanelDailyTask");
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },

    mComicDlgShowing : null,
    showComicDlg(comicIdx){
        var self = this;
        if (self.mComicDlgShowing){
            return;
        }
        self.mComicDlgShowing = true;

        dy.loader.loadPrefab("prefabs/page/PanelComicDlg", function(err, panel){
            self.mComicDlgShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("DYGame");
            var tComp = panel.getComponent("PanelComicDlg");
            tComp.init(comicIdx);
            
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },
    showComicAnswerDlg(param){
        var self = this;
        if (self.mComicDlgShowing){
            return;
        }
        self.mComicDlgShowing = true;

        dy.loader.loadPrefab("prefabs/page/PanelComicDlg", function(err, panel){
            self.mComicDlgShowing = false;
            if(err || !panel){
                return;
            }
            
            var tParent = cc.find("DYGame");
            var tComp = panel.getComponent("PanelComicDlg");
            tComp.initWithAnswer(param);
            
            tParent.addChild(panel);
            tComp.show(true);
        }, false);
    },


    mNoticeDlgShowing : null,
    tryShowNotice(){
        var self = this;
        if(dy.cache.forbidden.comic == 1){
            return;
        }

        if (self.mNoticeDlgShowing){
            return;
        }
        self.mNoticeDlgShowing = true;

        dy.gameSvr.requestNotice(function(resp){
            if(resp.mid == dykey.kCommandNotice && resp.code == 0){
                // 请求到公告
                if(!resp.data || resp.data.length <= 0){
                    self.mNoticeDlgShowing = false;
                    return;
                }

                dy.loader.loadPrefab("prefabs/page/PanelNoticeDlg", function(err, panel){
                    self.mNoticeDlgShowing = false;
                    
                    if(err || !panel){
                        return;
                    }

                    var tParent = cc.find("Canvas");
                    var tComp = panel.getComponent("PanelNoticeDlg");
                    tComp.init(resp.data);
                    
                    tParent.addChild(panel);
                    tComp.show(true);
                }, false);
            }
            else{
                self.mNoticeDlgShowing = false;
            }
        });
    },

    getDuan(honor){
        for(let i = 0; i < S_DUAN.length; ++i){
            if(honor <= S_DUAN[i]){
                return i;
            }
        }
        return S_DUAN.length;
    },

    getDuanName(honor){
        var dw = this.getDuan(honor);
        return dy.i18n.t(String.format("DW_{0}", dw));
    },

    getDuanLevel(honor){
        for(let i = 0; i < S_DUAN_LEVEL.length; ++i){
            if(honor <= S_DUAN_LEVEL[i]){
                return i;
            }
        }
        return S_DUAN_LEVEL.length;
    },
    
    getDuanLevelArea(honor){
        var level = this.getDuanLevel(honor);
        
        var t = {};
        if(level >= S_DUAN_LEVEL.length){
            t.min = S_DUAN_LEVEL[S_DUAN_LEVEL.length-1] + (level - S_DUAN_LEVEL.length) * 20;
            t.max = t.min + 20;
            return t;
        }

        if(level <= 0){
            t.min = -1;
            t.max = S_DUAN_LEVEL[0];
        }
        else{
            t.min = S_DUAN_LEVEL[level-1];
            t.max = S_DUAN_LEVEL[level];
        }

        return t;
    },

    loadAvatar(spr, avatar, isRobot){
        if(isRobot){
            dy.loader.loadRes(avatar, cc.SpriteFrame, function(err, res){
                if(!err){
                    spr.spriteFrame = res;
                }
            });
            return;
        }
        if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
            let img = wx.createImage();
            img.src = avatar || dy.login.userInfo.avatar;
            img.onload = function(){
                let texture = new cc.Texture2D();
                texture.initWithElement(img);
                texture.handleLoadedTexture();
                spr.spriteFrame = new cc.SpriteFrame(texture);
            };

            return;
        }
        
        {
            let tUrl = String.format("res/game_unpack/user/img_user{0}", dy.utils.random(1, 30));
            dy.loader.loadRes(tUrl, cc.SpriteFrame, function(err, res){
                if(!err){
                    spr.spriteFrame = res;
                }
            });
        }
    },

    tryQuit(force){
        if(force){
            cc.game.restart();
        }
    },

    checkInfoData(serverInfo, clientInfo){
        var tRet = ( (!serverInfo.score || serverInfo.score == clientInfo.score) && 
                     (!serverInfo.block || serverInfo.block == clientInfo.block) &&
                     (!serverInfo.row || serverInfo.row == clientInfo.row) &&
                     (!serverInfo.col || serverInfo.col == clientInfo.col) &&
                     (!serverInfo.combo || serverInfo.combo == clientInfo.combo) );
        if(!tRet){
            console.log("checkInfoData: ", serverInfo, clientInfo);
        }
        return tRet;
    },
}

module.exports = Common;
