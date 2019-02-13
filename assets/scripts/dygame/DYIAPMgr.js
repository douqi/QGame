 /**
 * ============================
 * @FileName: DYIAPMgr.js
 * @Desc:     第三方支付
 * @Author:   Chen, Sam
 * @DateTime: 2018-08-10
 * ============================
 */

var DYIAPMgr = {
    name: "DYIAPMgr",
    EVENT_INIT_SUCC   : "EVENT_INIT_SUCC",   // sdk初始化成功
    EVENT_INIT_FAIL   : "EVENT_INIT_FAIL",   // sdk初始化失败
    EVENT_PAY_SUCC    : "EVENT_PAY_SUCC",  	 // sdk支付成功
    EVENT_PAY_FAIL    : "EVENT_PAY_FAIL",  	 // sdk支付失败

    // sdk初始化
    init : function(param, delegate) {
		var self = this;
		// 网页或者非安卓和ios的native版本直接返回初始化成功
		var tDefaultDelegate = function(param) {
            dy.utils.scheduleOnce(function(){
                delegate && delegate({event: self.EVENT_INIT_SUCC, param: param || {}});
            }, 0);
		}

		var tParam = JSON.stringify(param || {});
		// 客户端版本
        if (cc.sys.isNative) {
            var tListener = dy.utils.nativeDelegate(delegate);
            dy.utils.nativeCall("DYIAPMgr", "init", tParam, tListener, tDefaultDelegate);
        } 
        else{
			if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
				// 微信
			}
			tDefaultDelegate(tParam);
		}
        
    },
    
    // sdk支付
    pay : function(param, delegate) {
		var self = this;
		// 网页或者非安卓和ios的native版本直接返回支付失败
		var tDefaultDelegate = function() {
            dy.utils.scheduleOnce(function(){
                delegate && delegate({event: self.EVENT_PAY_FAIL, param: param || {}});
            }, 0);
		}

		// 客户端版本
        if (cc.sys.isNative) {
            var tParam = JSON.stringify(param || {});
            var tListener = dy.utils.nativeDelegate(delegate);
            dy.utils.nativeCall("DYIAPMgr", "pay", tParam, tListener, tDefaultDelegate);
        } 
        else{
			if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
				// 微信
			}
			tDefaultDelegate();
		}
    },
};

module.exports = DYIAPMgr;