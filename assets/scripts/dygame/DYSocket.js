var DYSocket = {
    mSocket : null,
    
    mLastUrl : null,
    mDelegate : null,
    
    connect(url, delegate){
        var self = this;

        self.mLastUrl = url;
        self.mDelegate = delegate;

        if(self.mSocket){
            return;
        }

        var ws = new WebSocket(url);
        ws.binaryType = "arraybuffer";

        ws.onopen = self._onOpen.bind(self);
        ws.onmessage = self._onMessage.bind(self);
        ws.onerror = self._onError.bind(self);
        ws.onclose = self._onClose.bind(self);
        
        self.mSocket = ws;
    },

    send(msg){
        var self = this;
        if(!self.mSocket){
            if(!self.mLastUrl){
                DDERROR("please connect socket.io first");
                return;
            }

            self._reconnect();
        }

        if (self.mSocket.readyState !== WebSocket.OPEN){
            dy.utils.scheduleOnce(function(){
                self.send(msg);
            }, 1);
            return;
        }

        var buf = JSON.stringify(msg);
        var arrData = new Uint8Array(dy.utils.encodeUtf8(buf));
        self.mSocket.send(arrData.buffer);
    },

    close(){
        var self  = this;
        if(!self.mSocket){
            return;
        }

        self.mSocket.close();
        self.mSocket = null;
    },

    _reconnect(){
        var self = this;
        if(self.mSocket){
            return;
        }

        var ws = new WebSocket(self.mLastUrl);
        ws.binaryType = "arraybuffer";

        ws.onopen = self._onOpen.bind(self);
        ws.onmessage = self._onMessage.bind(self);
        ws.onerror = self._onError.bind(self);
        ws.onclose = self._onClose.bind(self);
        
        self.mSocket = ws;
    },

    _onMessage(evt){
        var self = this;
        if(!self.mDelegate){
            return;
        }
        // try{
            var binary = new Uint8Array(evt.data);
            var data = JSON.parse(dy.utils.decodeUtf8(binary));
            self.mDelegate(data);
        // }
        // catch(e){
        //     DDERROR("_onMessage err, {0}", e);
        // }
    },

    _onOpen(){
        console.log("onopen");
    },

    _onError(evt){
        console.log("_onError: ", evt);
    },

    _onClose(evt){
        console.log("_onClose: ", evt);
        this.mSocket = null;
        require("DYNotify").post(dykey.kEventSocketLost);
    },
}

module.exports = DYSocket;

