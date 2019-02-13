window.dy = window.dy || {};

var Config = require("./Config")
//扩展的一些常用方法
// [Debug]
window.DDLOG  = function(){
    if( Config.LOG_LEVEL < 2){
        return;
    }
    var log = String.format.apply(this, arguments);
    console.log(log);
};
window.DDINFO  = function(){
    if( Config.LOG_LEVEL < 1){
        return;
    }
    var log = String.format.apply(this, arguments);
    console.warn(log);
};
window.DDERROR  = function(){
    var log = String.format.apply(this, arguments);
    console.error(log);
};

// for String
if(!String.format){
    String.format = function(){
        var argLen = arguments.length;
        if (0 === argLen) {
            return "";
        }
        var msg = arguments[0];
        if (1 === argLen) {
            return "" + msg;
        }
        let args = arguments[1];
        if (arguments.length == 2 && typeof (args) == "object") {
            for (let key in args) {
                if(args[key]!=undefined){
                    let reg = new RegExp("({" + key + "})", "g");
                    msg = msg.replace(reg, args[key]);
                }
            }
        }
        else {
            for (let i = 1; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //let reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
    　　　　　　　　　　　　let reg= new RegExp("({)" + (i-1) + "(})", "g");
                    msg = msg.replace(reg, arguments[i]);
                }
            }
        }
    
        return msg;
    }
}
 
String.prototype.format = function(args) {
    return String.format(this, args);
};
Object.defineProperty(String.prototype, "format", { enumerable: false });

if(!String.fill){
    String.fill = function(){
        var as=[].slice.call(arguments);
        var fmt = as.shift();
        var i=0;
        return fmt.replace(/%(\w)?(\d)?([dfsx])/ig, function(_,a,b,c){
              var s=b?new Array(b-0+1).join(a||""):"";
              if(c=="d") s+=parseInt(as[i++]);
              return b?s.slice(b*-1):s;
        });
    };
}

String.prototype.trim = function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
};
Object.defineProperty(String.prototype, "trim", { enumerable: false });

String.prototype.ltrim = function(){
    return this.replace(/(^\s*)/g,"");
};
Object.defineProperty(String.prototype, "ltrim", { enumerable: false });

String.prototype.rtrim = function(){
    return this.replace(/(\s*$)/g,"");
};
Object.defineProperty(String.prototype, "rtrim", { enumerable: false });

String.trim = function(str){
    var str1 = str;
    return str1.trim();
};

String.ltrim = function(str){
    var str1 = str;
    return str1.ltrim();
};

String.rtrim = function(str){
    var str1 = str;
    return str1.rtrim();
};

String.prototype.replaceAll = String.prototype.replaceAll || function(s1,s2){ 
    return this.replace(new RegExp(s1,"gm"),s2); 
}
Object.defineProperty(String.prototype, "replaceAll", { enumerable: false });


window.parseStr = window.parseStr || function(e){
    return e + "";
}

// Actions
dy.progressTo = dy.progressTo || function(duration, from, to, target){
    var tComp = target.getComponent(cc.ProgressBar);
    if(!tComp){
        return cc.delayTime(duration);
    }
    
    var tCnt = Math.floor(duration * 100);
    var tPer = (to - from) / tCnt;
    var tDur = duration / tCnt;
    var bReverse = (from > to);

    var tIdx = 0;
    var act = cc.repeat(cc.sequence(cc.callFunc(function(){
        if(tIdx == 0){
            tComp.progress = from;
        }
        else{
            tComp.progress += tPer;
        }
        tIdx++;
        
        if(bReverse){
            if(tComp.progress < to){
                tComp.progress = to;
            }
        }
        else{
            if(tComp.progress > to){
                tComp.progress = to;
            }
        }
    }), cc.delayTime(tDur)), tCnt + 1);

    return act;
}

dy.destroySelf = dy.destroySelf || function(target){
    var act = cc.callFunc(function(){
        target.destroy();
    });
    return act;
}

dy.numberRun = dy.numberRun || function(duration, fmt, from, to, target, cb){
    var tComp = target.getComponent(cc.Label);
    if(!tComp){
        return cc.delayTime(duration);
    }
    
    var tCnt = Math.floor(duration * 15);
    var tPer = (to - from) / tCnt;
    var tDur = duration / (tCnt + 2);
    var bReverse = (from > to);

    var tIdx = 0;
    var tCur = 0;
    var act = cc.repeat(cc.sequence(cc.callFunc(function(){
        if(tIdx == 0){
            tCur = from;
        }
        else{
            tCur += tPer;
        }
        tIdx++;

        if(bReverse){
            if(tCur < to){
                tCur = to;
            }
        }
        else{
            if(tCur > to){
                tCur = to;
            }
        }
        tComp.string = String.format(fmt, Math.floor(tCur));
        cb && cb(tCur);
    }), cc.delayTime(tDur)), tCnt + 2);

    return act;
}