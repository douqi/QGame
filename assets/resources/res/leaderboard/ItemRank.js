cc.Class({
    extends: cc.Component,

    properties: {
        sprIdx : cc.Sprite,
        labIdx : cc.Label,
        sprIcon : cc.Sprite,
        labNick : cc.Label,
        labCareer : cc.Label,
        labCoin : cc.Label,
    },

    init(idx, avatar, nick, career, coin){
        var self = this;
        self.labIdx.string = idx;
        self.labNick.string = nick;
        self.labCareer.string = career;
        self.labCoin.string = coin;
        if(avatar){
            dy.common.loadAvatar(self.sprIcon, avatar);    
        }
        
        if(idx > 0 && idx <= 3){
            var url = String.format("res/leaderboard/img_bg_rank{0}", idx);
            cc.loader.loadRes(url, cc.SpriteFrame, function(err, res){
                if(!err){
                    self.sprIdx.spriteFrame = res;
                }
            });            
        }
        else{
            self.sprIdx.spriteFrame = null;
        }

    },

});
