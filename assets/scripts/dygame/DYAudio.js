var DYData = require("DYData");

var kMusicFlag = "K_MUSIC_FLAG";
var kSoundFlag = "K_SOUND_FLAG";

var S_MUSIC_FLAG = false;
var S_SOUND_FLAG = false;

var S_AUDIO_GAP = 1000;

var DYAudio = {
	_curMusic : null, 
	_curMusicFile : null, 

	_curTheEffect : null,
	
	_cacheClips : null,
	_cacheClipsTick : null,
    
    init(){
		console.log("DYAudio.init");
        S_MUSIC_FLAG = (DYData.getStat(kMusicFlag, "false") == "true");
		S_SOUND_FLAG = (DYData.getStat(kSoundFlag, "false") == "true");
		
		this._cacheClips = {};
		this._cacheClipsTick = {};
    },

	// 播放在编辑期内拖拽好的音效
	playClip : function(filePath, loop, volume){
		if (S_SOUND_FLAG || !filePath){
			return;
		}
		// DDLOG("DYAudio play: {0}", filePath);
		return cc.audioEngine.play(filePath, loop, volume);
	},

	// 通过音效名播放音效(需要手动获取音效的完整url)
	play : function(snd, loop, volume, cb){
		if(dy.cache.forbidden.mute){
			return;
		}
		// 尝试用weixin 模式播放
		if(window.wx && window.wx.createInnerAudioContext){
			return this.playWithWeixin(snd, loop, volume, cb);
		}
		// 为避免频繁播放音效，每种音效播放间隔必须在n秒以上
        var tFuncInvoke = function(sid){
            dy.utils.scheduleOnce(function(){
                cb && cb(sid);
            }, 0);
        };
		if (S_SOUND_FLAG || !snd){
            tFuncInvoke();
			return;
		}
		// DDLOG("DYAudio play: {0}", snd);
		var self = this;

		var tClip = self._cacheClips[snd];
		if(tClip){
			var tClickTick = self._cacheClipsTick[snd] || 0;
			if(dy.utils.currentTick() - tClickTick < S_AUDIO_GAP){
				return;
			}

			self._cacheClipsTick[snd] = dy.utils.currentTick();
			var sid = dy.audio.playClip(tClip, loop, volume);
			tFuncInvoke(sid);
			return;
		}
		
		var url = String.format("audio/{0}", snd);
        dy.loader.loadRes(url, cc.AudioClip, function(err, res){
            if (err) {
                tFuncInvoke();
                return;
			}
			self._cacheClips[snd] = res;
			self._cacheClipsTick[snd] = dy.utils.currentTick();

            var sid = dy.audio.playClip(res, loop, volume);
			tFuncInvoke(sid);
        });

		// return cc.audioEngine.playEffect(tUrl, loop, volume);
	},

	setLoop : function(audioId, loop){
		cc.audioEngine.setLoop(audioId, loop);
	},

	isLoop : function(audioId){
		return cc.audioEngine.isLoop(audioId);
	},

	// 设置音量（0.0 ~ 1.0）
	setVolume : function(audioId, volume){
		return cc.audioEngine.setVolume(audioId, volume);
	},

	// 获取音量（0.0 ~ 1.0）
	getVolume : function(audioId){
		return cc.audioEngine.getVolume(audioId);
	},

	pause : function(audioId){
		return cc.audioEngine.pause(audioId);
	},	

	resume : function(audioId){
		if(S_MUSIC_FLAG){
			return;
		}

		return cc.audioEngine.resume(audioId);
	},	

	pauseAll : function(){
		return cc.audioEngine.pauseAll();
	},

	resumeAll : function(){
		if(S_MUSIC_FLAG){
			return;
		}
		
		return cc.audioEngine.resumeAll();
	},

	stop : function(audioId){
		return cc.audioEngine.stop(audioId);
	},

	stopAll : function(){
		this.stopTheEffect()
		
		return cc.audioEngine.stopAll();
	},

	setFinishCallback : function(audioId, callback){
		return cc.audioEngine.setFinishCallback(audioId, callback);
	},

	uncache : function(filePath){
		return cc.audioEngine.uncache(filePath);
	},

	uncacheAll : function(){
		this._cacheClips = {};
		return cc.audioEngine.uncacheAll();	
	},

	setMusicMute : function(flag){
		S_MUSIC_FLAG = flag;
		DYData.setStat(kMusicFlag, S_MUSIC_FLAG);
		if (flag) {
			this.playMusic(null, true);
		} else {
			this.stopMusic();
		}
	},

	setSoundMute : function(flag){
		S_SOUND_FLAG = flag;
		DYData.setStat(kSoundFlag, S_SOUND_FLAG);
	},

	isMusicMute : function(){
		return S_MUSIC_FLAG;
	},

	isSoundMute : function(){
		return S_SOUND_FLAG;
	},

	// 播放在编辑期内拖拽好的背景音乐: 自动处理播放中的音乐, 切换至指定音乐
	playMusicClip : function(filePath, loop, volume){
		var self = this;

		filePath = filePath || self._curMusicFile;
		if (self.isMusicMute() || !filePath){
			return;
		}

		if (self._curMusic != null) {
			if(filePath == self._curMusicFile){
				return;
			}

			self.stopMusic(self._curMusic);
		}

		self._curMusic = cc.audioEngine.playEffect(filePath, loop, volume)
		self._curMusicFile = filePath;
	
		return self._curMusic;
	},

    // 通过音乐名播放背景音乐(需要手动获取音乐的完整url)
	playMusic : function(filePath, loop, volume){
		var self = this;

		filePath = filePath || self._curMusicFile;
		if (self.isMusicMute() || !filePath){
			return;
		}

		var tUrl = cc.url.raw(String.format("resources/audio/{0}.mp3", filePath));
		if (self._curMusic != null) {
			if(tUrl == self._curMusicFile){
				return;
			}

			self.stopMusic(self._curMusic);
		}

		self._curMusic = cc.audioEngine.playEffect(tUrl, loop, volume)
		self._curMusicFile = tUrl;
		return self._curMusic;
	},

	stopMusic : function(audioId){
		var self = this;
		
		self.stopTheEffect()

		if (self._curMusic == null){
			return;
		}

		audioId = audioId || self._curMusic;
		cc.audioEngine.stop(audioId);

		self._curMusic = null;
	},

	// 独奏指定音效的处理: playTheEffect, stopTheEffect, getTheEffect
	playTheEffect : function(snd, loop){
		var self = this;
		
		if(self.isSoundMute()){
			return;
		}

		var url = String.format("audio/{0}", snd);
        dy.loader.loadRes(url, cc.AudioClip, function(err, res){
            if (err) {
                return;
            }
            
            if( !self._curTheEffect ){
            	dy.audio.pauseAll();
            	self._curTheEffect = cc.audioEngine.playEffect(res, loop);
            }
        });
    },

    stopTheEffect : function(){
    	var self = this;
    	if (!self._curTheEffect){
    		return;
    	}

    	cc.audioEngine.stop(self._curTheEffect);
        self._curTheEffect = null;
        self.resumeAll();
    },

    getTheEffect : function(){
    	return this._curTheEffect;
	},
	
	
	_domCache : null,
	playWithWeixin(snd, loop, volume){
		var self = this;
		self._domCache = self._domCache || {};

		var tDom = self._domCache[snd];
		if(!tDom){
			tDom =  wx.createInnerAudioContext();
			tDom.src = String.format("https://hyqs.dayukeji.com/qgame/{0}/audio/{1}.mp3", dy.utils.gameId(),snd);
			tDom.autoplay = true;
			tDom.loop = loop || false;
			tDom.volume = volume || 1;
			
			self._domCache[snd] = tDom;
			return;
		}

		// if(!tDom.paused){
		// 	return;
		// }
		// tDom.stop();
		tDom.play();
	},

	// playWithDom(snd, loop, volume, cb){
	// 	if(!window.document){
	// 		return this.play(snd, loop, volume, cb);
	// 	}

	// 	if(window.wx && window.wx.createInnerAudioContext){
	// 		return this.playWithWeixin(snd, loop, volume, cb);
	// 	}
		
	// 	var self = this;
	// 	var tDom = document.getElementById(snd);
	// 	if(tDom){
	// 		if(!tDom.isIdle){
	// 			return;
	// 		}

	// 		tDom.isIdle = false;
	// 		tDom.pause();
	// 		tDom.currentTime = 0;
	// 		tDom.play();
			
	// 		return;
	// 	}
		
	// 	tDom = document.createElement("audio");
	// 	tDom.setAttribute("id",snd)
	// 	document.body.appendChild(tDom);
		
	// 	dy.loader.loadRes(String.format("audio/{0}", snd), cc.RawAsset, function(err, res){
	// 		if(!err){
	// 			tDom.src = res;
	// 			tDom.controls = false;
	// 			tDom.autoplay = true;
	// 			tDom.isIdle = false;
	// 			tDom.onended = function(){
	// 				tDom.isIdle = true;
	// 			}
	// 		}
	// 	});	
	// }
};

module.exports = DYAudio;