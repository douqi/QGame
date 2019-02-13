 /**
 * ============================
 * @FileName: DYLoginMgr.js
 * @Desc:     第三方登陆
 * @Author:   Chen, Sam
 * @DateTime: 2018-08-10
 * ============================
 */

//  登录的返回结果保存在 dy.login.userInfo 中， 且必然包含如下字段： 
// id(openId或userId), token, nick(昵称)), avatar(头像), param(扩展)

//  分享打开的信息保存在 dy.login.openInfo 中， 且必然包含如下字段： 
// startPot, shareTicket

var kAuth = "1a5ec560-9dc7-436b-be0e-e71cc82caa56";

var DYLoginMgr = {
	name: "DYLoginMgr",
	
	EVENT_INIT_SUCC 	: "EVENT_INIT_SUCC",  	// sdk初始化成功
	EVENT_INIT_FAIL     : "EVENT_INIT_FAIL",  	// sdk初始化失败
	EVENT_LOGIN_SUCC    : "EVENT_LOGIN_SUCC",  	// sdk登陆成功
	EVENT_LOGIN_FAIL    : "EVENT_LOGIN_FAIL",  	// sdk登陆失败
	EVENT_LOGOUT_SUCC   : "EVENT_LOGOUT_SUCC",  // sdk注销成功
	EVENT_LOGOUT_FAIL   : "EVENT_LOGOUT_FAIL",  // sdk注销失败
	EVENT_SHARE_SUCC    : "EVENT_SHARE_SUCC",   // 分享成功
	EVENT_SHARE_FAIL    : "EVENT_SHARE_FAIL",   // 分享失败

	// 初始化
	init : function(param, delegate) {
		var self = this;

		// 网页或者非安卓和ios的native版本直接返回初始化成功
		var tDefaultDelegate = function() {
			dy.utils.scheduleOnce(function(){
				delegate && delegate({event: self.EVENT_INIT_SUCC, param: {}});
			}, 0);
		}

		// 客户端版本
		
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			DYLoginHandler.init(param, delegate);
		}
		else{
			tDefaultDelegate();
		}
	},

	// sdk登陆
	login : function(param, delegate) {
		var self = this;
		// 网页或者非安卓和ios的native版本直接返回初始化成功
		var tDefaultDelegate = function(id, token, nick, avatar, param) {
			dy.utils.scheduleOnce(function(){
				var et = {
					event : self.EVENT_LOGIN_SUCC,
					param : {id : id || "", token : token || "",nick : nick || "", avatar : avatar || "", param : param || ""}
				};
				delegate && delegate(et);
			}, 0);
		}

		// 客户端版本
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			DYLoginHandler.login(param, delegate);
		}
		else{
			tDefaultDelegate(dy.utils.openId(), "", "DY10000");
		}
	},

	// sdk regLogout
	regLogout : function(param, delegate) {
		// 客户端版本
		if (cc.sys.isNative) {
			var tParam = JSON.stringify(param || {});
            var tListener = dy.utils.nativeDelegate(delegate);
			dy.utils.nativeCall("DYLoginMgr", "regLogout", tParam, tListener);
		}
	},

	// sdk注销
	logout : function(param) {
		// 客户端版本
		if (cc.sys.isNative) {
			var tParam = JSON.stringify(param || {});
			dy.utils.nativeCall("DYLoginMgr", "logout", tParam, 0);
		}
	},

	updateScore(k, v, cb){
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			DYLoginHandler.updateScore(k, v, cb);
		}
	},

	// shareItem = {title:"", image:""}
	share(shareItem, cb){
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			DYLoginHandler.updateConfig(dy.cache.config.share);
			DYLoginHandler.share(shareItem, "", "", cb);
		}
		else{
			dy.utils.scheduleOnce(function(){
				cb && cb(dy.login.EVENT_SHARE_SUCC);
			}, 0);
			console.log("dy.login.share: ", shareItem);
		}
	},

	shareWithParam(shareItem, startPot, startParam, cb){
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			DYLoginHandler.updateConfig(dy.cache.config.share);
			DYLoginHandler.share(shareItem, startPot, startParam, cb);
		}
		else{
			dy.utils.scheduleOnce(function(){
				cb && cb(dy.login.EVENT_SHARE_SUCC);
			}, 0);
			console.log("dy.login.share: ", shareItem);
		}
	},
	
	shareForGroup(shareItem, startPot, cb){
		if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
			// 微信
			DYLoginHandler.updateConfig(dy.cache.config.share);
			DYLoginHandler.shareForGroup(shareItem, startPot, cb);
		}
		else{
			dy.utils.scheduleOnce(function(){
				cb && cb(dy.login.EVENT_SHARE_SUCC);
			}, 0);
			console.log("dy.login.shareForGroup: ", shareItem);
		}
	},

	isAuthed(){
		return (require("DYData").getStat(kAuth, "FALSE") === "TRUE");
	},

	setAuthed(){
		require("DYData").setStat(kAuth, "TRUE");
	},

	onShow(res){
		dy.login.openInfo = {};
		dy.login.openInfo.startPot = res.query.startPot;
		dy.login.openInfo.startParam = res.query.startParam;
		dy.login.openInfo.shareTicket = res.shareTicket;

		if(dy.login.openInfo && dy.login.openInfo.startPot == "COMIC" && dy.login.openInfo.startParam){
			dy.login.openInfo.startPot = "";
			try{
				var tComic = JSON.parse(dy.login.openInfo.startParam);
				dy.common.showComicAnswerDlg(tComic);
			}
			catch(e){}
		}
		else{
			require("DYNotify").post(dykey.kEventFromShare);
		}
		
		
	},
};

module.exports = DYLoginMgr;