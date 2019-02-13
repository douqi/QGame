
var DYNotify = {
    // 抛出通知事件
    post : function(tag, param) {
        return this._onNotify(tag, param);
    },

    // 注册监听事件
    regObserver : function(target, cb, name, object) {
        // 获取事件的监听列表
        var tm = this._targets[name];
        if (!tm) {
            tm = this._targets[name] = {};
        }

        // 获取该对象对应的通知键值
        var tk;
        if (typeof(target) == "string") {
            tk = target;
            // 初始化事件通知对象
            tm[tk] = tm[tk] || {target : object};
        } else {
            tk = target.uuid;
            // 对象不存在或者已失效时不再继续处理
            if(!tk) {
                DDERROR("target is not a valid node!!!");
                return;
            }
            tm[tk] = tm[tk] || {target : target};
        }
        // 刷新回调事件
        tm[tk].cb = cb;
    },

    // 注册监听事件列表
    regObservers : function(target, cb, names, object) {
        for (let i = 0; i < names.length; ++i) {
            this.regObserver(target, cb, names[i], object);
        }
    },

    // 注销监听事件
    unregObserver : function(target, name) {
        var tm = this._targets[name];
        // 没有该事件的监听列表时不再继续处理
        if (!tm) {
            return;
        }

        // 删除对应的监听
        if (typeof(target) == "string") {
            if (tm[target]) {
                delete tm[target];
            }
        } else {
            var tk = target.uuid;
            if(tk && tm[tk]){
                delete tm[tk];
            }
        }

        // 清空没有通知对象的事件
        if (dy.utils.countProperty(tm)<=0) {
            delete this._targets[name];
        }
    },

    // 注销监听事件列表
    unregObservers : function(target, names) {
        for (let i = 0; i < names.length; ++i) {
            this.unregObserver(target, names[i]);
        }
    },

    // 移除对象上绑定的所有监听事件
    removeAllObservers : function(target) {
        // 获取该对象对应的通知键值
        var tk;
        if (typeof(target) == "string") {
            tk = target;
        } else {
            tk = target.uuid;
            // 对象不存在或者已失效时不再继续处理
            if(!tk) {
                DDERROR("target is not a valid node!!!");
                return;
            }
        }
        
        // 遍历监听事件列表，删掉所有事件下与该通知键值一致的对象
        for(var key in this._targets) {
            var item = this._targets[key];
            if (item[tk]) {
                delete item[tk];

                // 清空没有通知对象的事件
                if (dy.utils.countProperty(item)<=0) {
                    delete this._targets[key];
                }
            }
        }
    },

    // PRIVATE
    // 监听事件列表，格式为：key-字符串，一般为HYKey中定义的字段；value-对象，字符串，一般为HYKey中定义的字段；
    // value对象的key为node对象的uuid或者传过来的对象名（一般为类名），
    // value对象的值的内容有：cb-回调事件，target-监听该事件的对象
    _targets : {},
    // 通知事件
    _onNotify : function(name, param) {
        var targets = this._targets[name] || {};

        // 该事件名下注册的所有事件逐一通知
        for(var key in targets) {
            var item = targets[key];
            // 未被销毁的node的_objFlags为偶数，非node无_objFlags
            if (cc.isValid(item.target)) {
                item.cb(item.target, name, param);
            } else { // 删除已无效的通知对象
                delete targets[key];
            }
        }
    },
};

module.exports = DYNotify;