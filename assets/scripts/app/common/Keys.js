var M = {
    // for game
 

    // 通用类型命令
    kCommandLogin       : "1001",
    kCommandClose       : "1002",
    kCommandJoinRoom    : "1003",
    kCommandJoinNotify  : "1004",
    kCommandLeaveRoom   : "1005",
    kCommandLeaveNotify : "1006",
    kCommandReward      : "1007",
    kCommandReadyNotify : "1008",
    kCommandCharge      : "1009",   //兑换码
    kCommandPing        : "1010",   // keep alive
    kCommandJoinFriendRoom : "1011",  // 创建或加入好友房间
    kCommandNotice      : "1012",     // 每日公告
    kCommandInviteFrom          : "1013",       // 上报邀请我的好友ID
    kCommandAllInvited          : "1014",       // 获取所有已邀请好友的状态
    kCommandFetchInviteBonus    : "1015",       // 领取奖励
    kCommandTodayInvited        : "1016",       // 获取今日好友

    // 通用型事件
    kEventFromShare : "K_EVENT_FROM_SHARE",
    kEventSocketClose : "K_EVENT_SOCKET_CLOSE",
    kEventSocketLost : "K_EVENT_SOCKET_LOST",
 
    // 业务逻辑事件
    kEventMovePerson : "K_EVENT_MOVE_PERSON",
    kEventMergePerson : "K_EVENT_MERGE_PERSON",
    kEventBuyPerson : "K_EVENT_BUY_PERSON",
    kEventSellPerson : "K_EVENT_SELL_PERSON",
    kEventSpeedTimeup : "K_EVENT_SPEED_TIMEUP",
    kEventForSign : "K_EVENT_FOR_SIGN",
    kEventUpgrade : "K_EVENT_UPGRADE",
    kEventUseTicket : "K_EVENT_USE_TICKET",
    // kEventUpdateTime : "K_EVENT_UPDATE_TIME",
    // kEventUpdateUserInfo : "K_EVENT_UPDATE_USER_INFO", 
    // kEventUpdateOppoInfo : "K_EVENT_UPDATE_OPPO_INFO",
    // kEventForceQuit : "K_EVENT_FORCE_QUIT",
    // kEventChangeModels : "K_EVENT_CHANGE_MODELS",
    // kEventCloseGuideTip : "K_EVENT_CLOSE_GUIDE_TIP",
    // kEventPlayMatch     : "K_EVENT_PLAY_MATCH",
    // kEventPlayFriend    : "K_EVENT_PLAY_FRIEND",
    // kEventPlayLevel     : "K_EVENT_PLAY_LEVEL",
    
    kUserCoin : "K_USER_COIN",
    kUserDiamond : "K_USER_DIAMOND",
    kTotalUserCoin : "K_TOTAL_USER_COIN",
    kUserTicket : "K_USER_TICKET",
    kUserMulti : "K_USER_MULTI",
    kUserRound : "K_USER_ROUND",
    kUserFreeBox : "K_USER_FREE_BOX",

    kLevelRank : "K_LEVEL_RANK",
};

window.dykey = M;