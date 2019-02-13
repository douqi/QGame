
var S_INTERVAL = 0.1;

cc.Class({
    extends: cc.Component,

    properties: {
        pfbItem : cc.Prefab,
    },

    mTotalCnt : null,
    mVisibleCnt : null,
    mBufferCnt : null,
    mGap : null,
    mUpdateCallback : null,

    mScvCore : null,
    mItems : null,
    mInited : null,
    mCreated : null,

    // Ex: init(100, 4, 1, 10, null);
    init(totalCnt, visibleCnt, bufferCnt, gap, updateCb){
        var self = this;
        self.mTotalCnt = totalCnt;
        self.mVisibleCnt = visibleCnt;
        self.mBufferCnt = bufferCnt;
        self.mGap = gap;
        self.mUpdateCallback = updateCb;

        self.mInited = true;
        self.tryCreateItems();
    },

    start(){
        var self = this;
        self.mScvCore = self.node.getComponent(cc.ScrollView);
        self.tryCreateItems();
    },

    tryCreateItems(){
        var self = this;
        if(!self.mScvCore){
            return;
        }

        if(!self.mInited){
            return;
        }

        if(self.mCreated){
            return;
        }
        self.mCreated = true;
        
        self.mItems = [];
        
        var tCnt = Math.min(self.mTotalCnt, self.mVisibleCnt+(self.mBufferCnt*2));
        for(let i = 0; i < tCnt; ++i){
            var item = cc.instantiate(self.pfbItem);
            if(self.mScvCore.vertical){
                item.position = cc.v2(0, 0 - ((i+1)*self.mGap + (i+0.5)*(item.height)));
            }
            else{
                item.position = cc.v2(((i+1)*self.mGap + (i+0.5)*(item.width)), 0);
            }
            
            item.__scveid = i;

            self.mScvCore.content.addChild(item);
            self.mItems[i] = item;
            if(self.mUpdateCallback){
                self.mUpdateCallback(item, i);
            }
        }

        this.updateTimer = 0;
        if(self.mScvCore.vertical){
            this.lastContentPos = this.mScvCore.content.y;
            this.bufferZoneMax = self.mBufferCnt * (this.mItems[0].height+self.mGap);
            this.bufferZoneMin = (0-(this.mItems.length-self.mBufferCnt)*(this.mItems[0].height+self.mGap));
            this.mScvCore.content.height = self.mTotalCnt * (this.mItems[0].height+self.mGap);
        }
        else{
            this.lastContentPos = this.mScvCore.content.x;
            this.bufferZoneMin = 0 - self.mBufferCnt * 2 * self.mBufferCnt * (this.mItems[0].width+self.mGap);
            this.bufferZoneMax = (this.mItems.length- 2*self.mBufferCnt)*(this.mItems[0].width+self.mGap);
            this.mScvCore.content.width = self.mTotalCnt * (this.mItems[0].width+self.mGap);
        }
        
    },

     // 返回item在ScrollView空间的坐标值
     getPositionInView: function (item) {
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.mScvCore.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    update(dt){
        if(this.mScvCore.vertical){
            this._updateVertical(dt);
        }
        else{
            this._updateHorizental(dt);
        }
    },

    _updateHorizental(dt){
        var self = this;
        if(!self.mInited){
            return;
        }
        if(!this.mItems || this.mItems.length <= 0){
            return;
        }

        this.updateTimer += dt;
        if (this.updateTimer < S_INTERVAL) {
            return; // we don't need to do the math every frame
        }

        this.updateTimer = 0;
        let items = this.mItems;
        // 如果当前content的y坐标小于上次记录值，则代表往下滚动，否则往上。
        let isLeft = this.mScvCore.content.x < this.lastContentPos;
        // 实际创建项占了多高（即它们的高度累加）
        let offset = (items[0].width + self.mGap) * items.length;
        let newX = 0;

        // 遍历数组，更新item的位置和显示
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isLeft) {
                // 提前计算出该item的新的y坐标
                newX = items[i].x + offset;
                // 如果往下滚动时item已经超出缓冲矩形，且newX未超出content上边界，
                // 则更新item的坐标（即上移了一个offset的位置），同时更新item的显示内容
                if (viewPos.x < this.bufferZoneMin && newX < this.mScvCore.content.width) {
                    items[i].setPositionX(newX);

                    let idx = items[i].__scveid + items.length;
                    items[i].__scveid = idx;
                    if(self.mUpdateCallback){
                        self.mUpdateCallback(items[i], idx);
                    }
                }
            } else {
                // 提前计算出该item的新的y坐标
                newX = items[i].x - offset;
                // 如果往上滚动时item已经超出缓冲矩形，且newX未超出content下边界，
                // 则更新item的坐标（即下移了一个offset的位置），同时更新item的显示内容
                if (viewPos.x > this.bufferZoneMax && newX > 0) {
                    items[i].setPositionX(newX);

                    let idx = items[i].__scveid - items.length;
                    items[i].__scveid = idx;
                    if(self.mUpdateCallback){
                        self.mUpdateCallback(items[i], idx);
                    }
                }
            }
        }

        // 更新lastContentPos和总项数显示
        this.lastContentPos = this.mScvCore.content.x;
    },

    _updateVertical(dt){
        var self = this;
        if(!self.mInited){
            return;
        }
        if(!this.mItems || this.mItems.length <= 0){
            return;
        }

        this.updateTimer += dt;
        if (this.updateTimer < S_INTERVAL) {
            return; // we don't need to do the math every frame
        }

        this.updateTimer = 0;
        let items = this.mItems;
        // 如果当前content的y坐标小于上次记录值，则代表往下滚动，否则往上。
        let isDown = this.mScvCore.content.y < this.lastContentPos;
        // 实际创建项占了多高（即它们的高度累加）
        let offset = (items[0].height + self.mGap) * items.length;
        let newY = 0;

        // 遍历数组，更新item的位置和显示
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isDown) {
                // 提前计算出该item的新的y坐标
                newY = items[i].y + offset;
                // 如果往下滚动时item已经超出缓冲矩形，且newY未超出content上边界，
                // 则更新item的坐标（即上移了一个offset的位置），同时更新item的显示内容
                if (viewPos.y < this.bufferZoneMin && newY < 0) {
                    items[i].setPositionY(newY);

                    let idx = items[i].__scveid - items.length;
                    items[i].__scveid = idx;
                    if(self.mUpdateCallback){
                        self.mUpdateCallback(items[i], idx);
                    }
                }
            } else {
                // 提前计算出该item的新的y坐标
                newY = items[i].y - offset;
                // 如果往上滚动时item已经超出缓冲矩形，且newY未超出content下边界，
                // 则更新item的坐标（即下移了一个offset的位置），同时更新item的显示内容
                if (viewPos.y > this.bufferZoneMax && newY > -this.mScvCore.content.height) {
                    items[i].setPositionY(newY);

                    let idx = items[i].__scveid + items.length;
                    items[i].__scveid = idx;
                    if(self.mUpdateCallback){
                        self.mUpdateCallback(items[i], idx);
                    }
                }
            }
        }

        // 更新lastContentPos和总项数显示
        this.lastContentPos = this.mScvCore.content.y;
    },

});
