cc.Class({
    extends: cc.Component,

    viewMgr : null,
    onEnter(){
        console.log("onEnter should be override", this.name);
    },
    onExit(){
        console.log("onExit should be override", this.name);
    },

    __btnLocking : null,
    __btnListener : null,
    addClickListener(btnName, btnListener){
        var self = this;
        self.__btnListener = self.__btnListener || {};
        self.__btnListener[btnName] = btnListener;
    },

    lockClick(){
        this.__btnLocking = true;
    },
    unlockClick(){
        this.__btnLocking = false;
    },

    buttonListener : function(event){
        var self = this;
        var target = event.target;
        // DDLOG(target.name);

        if(self.__btnLocking){
            return;
        }

        if(self.__btnListener[target.name]){
            dy.audio.play("snd_click");
            self.__btnListener[target.name](event);
        }
    },
});

