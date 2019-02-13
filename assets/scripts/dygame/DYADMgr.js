var DYADMgr = {
    name: "DYADMgr",

    AD_BANNER       : "BANNER",
    AD_INTERSTITIAL : "INTERSTITIAL",
    AD_VIDEO        : "VIDEO",
    AD_INCENTIVE    : "INCENTIVE",
    AD_WALL         : "WALL",

    EVENT_INIT_SUCC     : "EVENT_INIT_SUCC",  	// sdk初始化成功
	EVENT_INIT_FAIL     : "EVENT_INIT_FAIL",  	// sdk初始化失败
	EVENT_SHOW_SUCC     : "EVENT_SHOW_SUCC",  	// sdk登陆成功
	EVENT_SHOW_FAIL     : "EVENT_SHOW_FAIL",  	// sdk登陆失败

    // sdk初始化
    init : function(param, cb) {
        var self = this;

		// 网页或者非安卓和ios的native版本直接返回初始化成功
		var tDefaultDelegate = function() {
			dy.utils.scheduleOnce(function(){
				cb && cb({event: self.EVENT_INIT_SUCC, param: {}});
			}, 0);
		}

		// 客户端版本
		
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			DYADHandler.init(param, cb);
		}
		else{
			tDefaultDelegate();
		}
    },
    
    // 判断广告现在是否可以观看
    canShow : function(adType, reloadWhenFailed) {
        // 只有客户端版本支持广告
        var self = this;

        // 客户端版本
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			return DYADHandler.canShow(adType, reloadWhenFailed);
        }
        
        return true;
    },
    
    // 播放广告
    show : function(adType, cb) {
        var self = this;

		// 网页或者非安卓和ios的native版本直接返回初始化成功
		var tDefaultDelegate = function() {
			dy.utils.scheduleOnce(function(){
				cb && cb({event: self.EVENT_SHOW_SUCC, param: {}});
			}, 0);
		}

		// 客户端版本
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			DYADHandler.show(adType, cb);
		}
		else{
			tDefaultDelegate();
		}
    },
    
    // 隐藏广告
    hide : function(adType) {
        var self = this;

        // 客户端版本
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			DYADHandler.hide(adType);
		}
    },

};
module.exports = DYADMgr;