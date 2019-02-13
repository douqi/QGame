cc.Class({
    extends: cc.Component,

    properties: {
        labIdx : cc.Label,
        
        labCareer : cc.Label,
    },

    init(idx,  career){
        var self = this;
        self.labIdx.string = idx;
        self.labCareer.string = career;
    },
});
