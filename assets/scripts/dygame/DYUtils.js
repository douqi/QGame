let DYData = require("DYData");
let Config = require("Config");


const kGameVer    = "5d4ac9f2-5658-4dca-9bb0-5f287e0d614b";
const kOpenID   = "8b40c787-95cf-4976-b29e-df8d25ce5e5d";

const S_JSB_CACHE_PATH = "jsb_cache/";
const S_JSB_HOTFIX_PATH = "c98759c9a82b24c176af027949f417b0/";
const S_APP_SECRET = "apsdfAJOJ(#@&($0809283JLJOOJ";

var S_JSB_FUNC_ID = 1000;
var S_JSB_FUNC = {};

var S_POOLS = {};

var DYUtils = {
    random : function(from, to){
        var abs = Math.abs(to - from) + 1;
        var rand = Math.floor(Math.random() * abs);
        var min = Math.min(from, to);
        return (min + rand);
    },

     /**
     * @returns a clone of an object
     * ATTENTION: the deep copy is relative, it doesn't work for inner object, just fine for properties
     */
    clone : function(a) {
        if(!a){
            return a;
        }

        var at = typeof(a);
        if (at == "object" ){
            // 忽略所有组件类型的 "deep copy"
            // if(a.__classname__  && typeof(a.__classname__) == "string" && a.__classname__.startsWith("cc.") ){
            //     return a;
            // }

            if(a.__classname__){
                return a;
            }

            var ret = undefined;
            if(a instanceof Array){
                ret = [];
                for (var i = 0; i < a.length; i++) {
                    let t = this.clone(a[i]);
                    if(t || t == 0 || t == "" || t == false){
                        ret[i] = t;
                    }
                }
            }
            else{
                ret = {}
                for(var key in a) {
                    if (a.hasOwnProperty(key)){
                        let t = this.clone(a[key]);
                        if(t || t == 0 || t == "" || t == false){
                            ret[key] = t;
                        }
                    }
                }
            }
            return ret;
        }
        return a;
    },

    guid : function() {
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },

    isValidIden : function(iden){
        var sId = iden.toString();
        var aCity={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"} 

        var iSum = 0;
        var info = "" ;
        if(!/^\d{17}(\d|x)$/i.test(sId)){
            return false;
        }
            
        sId=sId.replace(/x$/i,"a");
        if(aCity[parseInt(sId.substr(0,2))]==null) {
            return false;
        }

        var sBirthday = sId.substr(6,4)+"-"+Number(sId.substr(10,2))+"-"+Number(sId.substr(12,2));
        var d = new Date(sBirthday.replace(/-/g,"/")) ;
        if(sBirthday != (d.getFullYear()+"-"+ (d.getMonth()+1) + "-" + d.getDate())){
            return false;
        }
        for(var i = 17;i>=0;i --) iSum += (Math.pow(2,i) % 11) * parseInt(sId.charAt(17 - i),11) ;
        if(iSum%11!=1){
            return false;
        }
        //aCity[parseInt(sId.substr(0,2))]+","+sBirthday+","+(sId.substr(16,1)%2?"男":"女");//此次还可以判断出输入的身份证号的人性别
        return true;
    },

    currentTick : function(){
        // the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
        return Date.now();
    },

    currentSecond : function(){
        return Math.floor(dy.utils.currentTick()/1000);
    },

    countProperty : function(obj){
        if(!obj){
            return 0;
        }
        
        return Object.getOwnPropertyNames(obj).length;
    },

    countItem : function(obj){
        if(!obj){
            return 0;
        }
        var len = 0;
        for(var i in obj){
            if(obj[i]){
                len++;
            }
        }
        return len;
    },

    // delegate : function(client, clientMethod) { 
    //     return function() { 
    //         return clientMethod.apply(client, arguments); 
    //     } 
    // }, 

    openId : function(){
        var tid = DYData.getStat(kOpenID, "");
        if(!tid){
            tid = this.guid();
            DYData.setStat(kOpenID, tid);
        }
        
        return tid;
    },

    genSign(plain){      
        var strPlain = S_APP_SECRET + dy.crypto.base64.encode(plain);
        return dy.crypto.md5.hex_md5(strPlain);
    },
   
    scheduleOnce(listener, interval){
        return cc.director.getScheduler().schedule(listener, dy.theRoot, 0, 0, interval, false);
    },

    schedule(listener, interval, times){
        return cc.director.getScheduler().schedule(listener, dy.theRoot, interval, times, interval, false);
    },

    unschedule(listener){
        return cc.director.getScheduler().unschedule(listener, dy.theRoot);
    },

    
    gameId(){
        return Config.GAME_ID;
    },

    gameVer(){
        var ver = DYData.getStat(kGameVer, Config.GAME_VER);
        if(DYUtils.compareVer(ver, Config.GAME_VER) < 0){
            ver = Config.GAME_VER;
            DYData.setStat(kGameVer, ver);
        }

        return ver; 
    },

    gameOrigVer(){
        return Config.GAME_VER;
    },

    setGameVer(ver){
        DYData.setStat(kGameVer, ver);
    },

    gameMode(){
        return Config.GAME_MODE;
    },

    gameSvr(){
        return Config.GAME_SVR.toUpperCase();
    },

    platform(){
        if (cc.sys.isNative){
            switch(cc.sys.platform){
            case cc.sys.WIN32 : 
                return "win32"
            case cc.sys.LINUX : 
                return "linux"
            case cc.sys.MACOS : 
                return "mac"
            case cc.sys.ANDROID : 
                return "android"
            case cc.sys.IPHONE : 
            case cc.sys.IPAD : 
                return "ios"
            default: 
                return "unknown"
            }
        }

        return "web";
    },

    channel : function(){
        var tChannel = "";
        if (cc.sys.isNative){
            // 客户端版本
            if ("android" == dy.utils.platform()){
                // 安卓
                tChannel = jsb.reflection.callStaticMethod("com/dygame/common/DYCommon", "channelName", "(Ljava/lang/String;)Ljava/lang/String;", "");
            }
            else if("ios" == dy.utils.platform()){
                tChannel = jsb.reflection.callStaticMethod("DYCommon_iOS", "channelName:", "");
            }
        }
        else if (cc.sys.isBrowser){
            // 从 cookie 中获取 channel
            tChannel = sessionStorage.getItem("channelName");   
        }

        tChannel = tChannel || "000000";
        return tChannel;
    },

    hideLoading : function(){
        if (cc.sys.isNative){
            // 客户端版本
            if ("android" == dy.utils.platform()){
                // 安卓
                return jsb.reflection.callStaticMethod("com/dygame/common/DYCommon", "hideLoading", "()V");
            }
            else if ("ios" == dy.utils.platform()){
                return jsb.reflection.callStaticMethod("DYCommon_iOS", "hideLoading:", "");
            }
        }
    },  

    // 将 callback 转化为 func_id 
    pushInvoke : function(cb){
        var funcId = (++S_JSB_FUNC_ID);

        var strFuncId = String.format("{0}", funcId);
        S_JSB_FUNC[strFuncId] = cb;

        return funcId;
    },

    // 将 func_id 转化为 callback(默认将其删除)
    popInvoke : function(funcId, bReserve){
        bReserve = bReserve || false;

        var strFuncId = String.format("{0}", funcId);
        var cb = S_JSB_FUNC[strFuncId];
        if (!bReserve){
            delete S_JSB_FUNC[strFuncId];
        }

        return cb;
    },

    cachePath : function(){
        if (!cc.sys.isNative) {
            return S_JSB_CACHE_PATH;
        }
        var path = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + S_JSB_CACHE_PATH);
        // DDLOG("Storage path for cachePath : " + path);

        return path;
    }, 

    hotfixPath : function(){
        if (!cc.sys.isNative) {
            return S_JSB_HOTFIX_PATH;
        }
        var path = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + S_JSB_HOTFIX_PATH);
        // DDLOG("Storage path for hotfixPath : " + path);

        return path;
    },

    compareVer : function(curV, reqV){  
        var diff = 0;

        if(curV === reqV){
            // DDLOG("in dy.utils.compareVer: " + curV + " --- " + reqV + ", " + diff);
            return 0;
        }

        if(curV && reqV){  
            //将两个版本号拆成数字  
            var arr1 = curV.split("."), arr2 = reqV.split(".");  
            var minLength=Math.min(arr1.length,arr2.length), position=0;  
            //依次比较版本号每一位大小，当对比得出结果后跳出循环（后文有简单介绍）  
            while(position<minLength && ((diff=parseInt(arr1[position])-parseInt(arr2[position]))==0)){  
                position++;  
            }  
            diff=(diff!=0)?diff:(arr1.length-arr2.length);  
        }
        else
        {  
            diff = -1;
        }  

        return diff;
    },

    verifyAsset : function(filePath, asset){
        var fileStr = jsb.fileUtils.getDataFromFile(filePath);
        if (!fileStr){
            return true;
        }

        var md5 = dy.crypto.md5.hex_md5_for_uint8arr(fileStr);
        if (md5.toUpperCase() === asset.md5.toUpperCase()){
            return true;
        }
        
        return false;
    },

    createPool : function(key){
        if(!S_POOLS[key]){
            S_POOLS[key] = new cc.NodePool();
        }
        return S_POOLS[key];
    },

    destroyPool : function(key){
        if (S_POOLS[key]){
            S_POOLS[key].clear();
            delete S_POOLS[key];
        }
    },  

    clearAllPool : function(){
        for(var key in S_POOLS){
            S_POOLS[key].clear();
            delete S_POOLS[key];
        }
    },

    stringForDaily : function(){
        var t = new Date();
        var tStr = String.format("{0}{1}{2}",String.fill("%04d", t.getFullYear()),String.fill("%02d", t.getMonth()),String.fill("%02d", t.getDate()))
        return tStr;

    },

    stringForSec : function(sec){
        var tHour   = String.fill("%02d", Math.floor(sec/3600));
        var tMin    = String.fill("%02d", Math.floor((sec%3600)/60));
        var tSec   = String.fill("%02d", Math.floor(sec%60));

        return String.format("{0}:{1}:{2}", tHour, tMin, tSec);
    },

    stringForTick : function(tick){
        var sec = Math.floor(tick / 1000);
        var tMin    = String.fill("%02d", Math.floor(sec/60));
        var tSec    = String.fill("%02d", Math.floor(sec%60));
        var tTick   = String.fill("%03d", (tick%1000));

        return String.format("{0}:{1}:{2}", tMin, tSec, tTick);
    },

    stringForDigitalClock : function(sec){
        var tMin    = String.fill("%02d", Math.floor((sec%3600)/60));
        var tSec   = String.fill("%02d", Math.floor(sec%60));

        return String.format("{0} : {1}", tMin, tSec);
    },

    gc : function(){
        if (cc.sys.isNative){
            cc.textureCache.removeAllTextures();    
        }
        cc.sys.garbageCollect();
    },

    getParamExt : function(pk, pp){
        pp = pp || "";
        
        try{
            if ("android" == dy.utils.platform()){
                return jsb.reflection.callStaticMethod("com/dygame/common/DYCommon", "getParamExt", "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;", pk.toString(), pp.toString());
            }
            else if("ios" == dy.utils.platform()){
                return jsb.reflection.callStaticMethod("DYCommon_iOS", "getParamExt:withParam:", pk.toString(), pp.toString());
            }
            else if (cc.sys.isBrowser){  
                var name = pk;
                var nameCookie = sessionStorage.getItem(name);
                if(nameCookie){
                    return nameCookie;
                }
                var val = null,
                reg = new RegExp("[\\?&]" + name + "=([^&]+)","i");
                if(reg.test(document.location.search)){
                    val = RegExp.$1;
                }
                return val ? decodeURIComponent(val): pp;
                   
            }
        }
        catch(err){}
        finally{}

        return "";
    },

    isComplexFont : function(){
        // 是否为繁体字
        return (this.getParamExt("K_IS_COMPLEX_FONT") == "TRUE");
    },

    nativeCall : function(fileName, funcName, param, listener, defaultDelegate, paramType) {
        var tPlatform = dy.utils.platform();
		if ("android" == tPlatform){
            var tParamType = paramType || "(Ljava/lang/String;I)V";
			return jsb.reflection.callStaticMethod("com/dygame/common/" + fileName, funcName, tParamType, param, listener);
		} else if ("ios" == tPlatform){
			return jsb.reflection.callStaticMethod(fileName, funcName + ":withListener:", param, listener.toString());
		} else {
            if(defaultDelegate){
                return defaultDelegate();
            }
		}
    },

    nativeDelegate : function(delegate) {
        // 强制约定与平台层的交互形式: strEvent = JSONSTR( {event:"", param:JSONSTR({})}) )
        var tFuncListener = function(strEvent){
            var et = JSON.parse(strEvent || "{}");
            et.param = JSON.parse(et.param || "{}");
            delegate && delegate(et);
        }
        return this.pushInvoke(tFuncListener);
    },

    compileStr : function(code){ 
        //对字符串进行加密       
        var c=String.fromCharCode(code.charCodeAt(0)+code.length);
        for(var i=1;i<code.length;i++){      
            c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
        }   
        return escape(c);   
    },
    
    uncompileStr : function(code){      
        //字符串进行解密
        code=unescape(code);      
        var c=String.fromCharCode(code.charCodeAt(0)-code.length);      
        for(var i=1;i<code.length;i++){      
            c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));      
        }      
        return c;   
    },

    // 这个方法的作用是得到某一个字符串对应UTF-8编码的字节序列，可在服务端语言，如C#中通过 System.Text.Encoding.UTF8.GetString(bytes) 方法将字节序列解码为相应的字符串。
    encodeUtf8(text) {
        const code = encodeURIComponent(text);
        const bytes = [];
        for (var i = 0; i < code.length; i++) {
            const c = code.charAt(i);
            if (c === '%') {
                const hex = code.charAt(i + 1) + code.charAt(i + 2);
                const hexVal = parseInt(hex, 16);
                bytes.push(hexVal);
                i += 2;
            } else bytes.push(c.charCodeAt(0));
        }
        return bytes;
    },
    
    decodeUtf8(bytes) {
        var encoded = "";
        for (var i = 0; i < bytes.length; i++) {
            encoded += '%' + bytes[i].toString(16);
        }
        return decodeURIComponent(encoded);
    },
}

module.exports = DYUtils;