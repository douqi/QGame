 /**
 * ============================
 * @FileName: DYLoader.js
 * @Desc:     加载资源
 * @Author:   Chen
 * @DateTime: 2018-05-21
 * ============================
 */

var DYLoader = {
    // 加载的资源及资源引用的其它资源在切换场景时自动删除
    loadRes : function( url,  type, completeCallback) {
        return cc.loader.loadRes(url, type, (err, res) => {
            if (completeCallback) {
                completeCallback(err, res);
            }
            if (!err) {
                // 这样处理的原因是: 
                // 这是因为 loadRes("btn/btn1", cc.SpriteFrame ...) 获取的是 SpriteFrame 资源，
                // 而 releaseRes("btn/btn1") 释放的是 Texture2D 资源本身，并没有释放 spriteFrame，
                // 所以再次加载的时候，获取到了之前缓存的 spriteFrame，而它的贴图其实已经删除了。
                // 问题的根本还是因为一个 url 可以对应不同 type 的多个资源。
                cc.loader.setAutoReleaseRecursively(res, true);
            }
        });
    },

    // 加载的资源及资源引用的其它资源在切换场景时也不会被删除
    loadStaticRes : function(url,  type, completeCallback) {
        return cc.loader.loadRes(url, type, (err, res) => {
            if (completeCallback) {
                completeCallback(err, res);
            }
            if (!err) {
                cc.loader.setAutoReleaseRecursively(res, false);
            }
        });
    },

    // 立即释放资源（缓存引用和资源内容都被清理，需要等gc）
    releaseRes : function(url) {
        var deps = cc.loader.getDependsRecursively(url);
        cc.loader.release(deps);
    },

    // 立即释放释放所有资源（需要等gc）
    releaseAll : function(url) {
        cc.loader.releaseAll();
    },

    // 立即释放释放所有资源（需要等gc）
    releaseTiledLayer : function(tiledlayer) {
        tiledlayer.releaseMap();
    },

    // 加载文件夹下所有资源
    loadResDir : function( url, progressCallback, completeCallback) {
        var currentResCount = cc.loader.getResCount(); 
        return cc.loader.loadResDir(url, progressCallback,
            function (err, objects, urls) { 
                if (completeCallback) {
                    completeCallback(err, objects, urls);
                }
                if (!err) {
                    cc.loader.releaseResDir(url);
                }
            }
        ); 

    },

	// 预加载场景
    preloadScene : function(scene, delegate) {
    	return cc.director.preloadScene(scene, delegate);
    },

    // 加载场景
    loadScene : function(scene, delegate) {
        var tFunc = function() {
            // require("HYResolution").fit();
            delegate && delegate();
        }
    	return cc.director.loadScene(scene, tFunc);
    }, 

    // 加载资源，异步
    loadPrefab: function(path, delegate, skipInstantiate) {
        this.loadRes(path, cc.Prefab, function(err, prefab) {
            if (err) {
                DDLOG("Error url [" + err + "]");
                delegate && delegate(err);
                return;
            } else if (!skipInstantiate) {
                var tPanel = cc.instantiate(prefab);
                delegate && delegate(err, tPanel); 
            } else {
                delegate && delegate(err, prefab); 
            }
        });
    },

    // 设置图片，异步
    setSpriteFrame: function(sprite, path, delegate) {
        this.loadRes(path, cc.SpriteFrame, function(err, res) {
            if (!err && sprite) {
                sprite.spriteFrame = res; 
            }
            delegate && delegate(err, res)
        });
    },

    createNode : function (componentType) {
        let node = new cc.Node();
        if(componentType){
            node = node.addComponent(componentType);
        }

        return node;
    },
};
module.exports = DYLoader;