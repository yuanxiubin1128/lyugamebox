var packet = require( "Lpackage" )
var msgcode = require( 'Msgcode' )
var ErrorCode = require( "errorcode" )
var TuiBingConfig = require("TuiBingConfig")

var onLogin = function( pack ){
    var result = pack.result;
    if ( result == 0 ) {
        var obj = {id:pack.id, name:pack.name, gold:pack.gold, gm:pack.gmlevel}
        var player = require('Player')
        var pPlayer = new player();
        pPlayer.login(obj)
    }else if( result == ErrorCode.ACCOUNT_SEAL ){
        var timestamp3 = pack.id;
        var newDate = new Date();
        newDate.setTime(timestamp3 * 1000);
        var msg = msgcode[ result ] + " " + newDate.toLocaleString() + msgcode.END_COLOR +msgcode.END_SIZE;
        cc.ll.notice.addMsg ( 2, msg, null);
    }else{
        cc.ll.msgbox.addMsg(result);
    }
    cc.ll.loading.removeLoading();
}

var onRegister = function( pack ){
    var result = pack.result ;
    if ( result != 0 ){
        cc.ll.msgbox.addMsg(result);
    }
}

var onEnterRoom = function( pack ){
    var result = pack.result;
    if (result == 0) {
        cc.ll.sSceneMgr.onChangeScene("tuibingview");
    }else{
        cc.ll.msgbox.addMsg(result);
    }
}

var onBeBanker = function( pack ){
    var result = pack.result;
    if (result != 0 ){
        cc.ll.msgbox.addMsg(result);
    }
}

var onTuibingUnbanker = function( pack ){
    var result = pack.result;
    if (result != 0 ){
        cc.ll.msgbox.addMsg(result);
    }else{
        var node = cc.find("Canvas/GameBgLayer");
        if( node ){
            var viewlogic = node.getComponent("OnGameViewLoad");
            viewlogic.showUnBankerTips(); 
        }
    }
}

var onTuibingLeaveQueue = function( pack ){
    var result = pack.result;
    if (result != 0 ){
        cc.ll.msgbox.addMsg(result);
    }
}

var onTuiBingQueueChange = function( pack ) {
    var node = cc.find("Canvas/GameBgLayer");
    if( node ){
        var gamelogic = node.getComponent("GameLogic");
        var banker = { 
            bankerid: pack.bankerid,  
            bankername : pack.bankername,
        }
        gamelogic.onQueueChanged(banker, pack.queue);
    }
}

var onTuiBingGameState = function( pack ){
    var state = pack.state
    var node = cc.find("Canvas/GameBgLayer");
    if( node ){
        var gamelogic = node.getComponent( "GameLogic" );
        gamelogic.onGameStateChange( state );
    }
    if (state == TuiBingConfig.State.Ready) {
        cc.ll.notice.removeMsg(998);
    }
}

var onGoldChange = function( pack ){
    var gold = pack.gold;
    cc.ll.pMgr.main_role.onGoldChanged( gold );
}

var onTuiBingBet = function( pack ) {
    var result = pack.result;
    var id = pack.id;
    var pos = pack.pos;
    var gold = pack.gold;
    if (result == 0){
        var node = cc.find("Canvas/GameBgLayer");
        if( node ){
            var gamelogic = node.getComponent( "GameLogic" );
            gamelogic.onPlayerBet( id, pos, gold )
        }
    }else{
        cc.ll.msgbox.addMsg(result);
    }
}

var onKeepBanker = function( pack ) {
    // let begincallback = function() {
    //     var p = new packet( "ReqKeepBanker" );
    //     p.lpack.iskeep = 0;
    //     p.lpack.gold = 200000;
    //     cc.ll.net.send( p.pack() );
    // }
    // let endcallback = function() {
    //     //下庄
    //     var p = new packet( "ReqKeepBanker" );
    //     p.lpack.iskeep = 1;
    //     p.lpack.gold = 0;
    //     cc.ll.net.send( p.pack() );
    // }
    // cc.ll.notice.addMsg(1,msgcode.TUIBING_KEEP_BANKER, begincallback, endcallback, 998);
    var node = cc.find("Canvas/GameBgLayer");
    if( node ){
        var gameviewload = node.getComponent( "OnGameViewLoad" );
        gameviewload.onShowKeepBanker()
    }
}

var onBankerBegin = function( pack ) {
    let begincallback = function() {
        var p = new packet( "ReqTuiBingBegin" );
        cc.ll.net.send( p.pack() );
    }
    let endcallback = function() {
        //下庄
        var p = new packet( "ReqKeepBanker" );
        p.lpack.iskeep = 1;
        p.lpack.gold = 0;
        cc.ll.net.send( p.pack() );
    }
    var time = TuiBingConfig.Time.Begin;
    var str = msgcode.TUIBING_BANKER_BEGIN + "<br/><color=#FF0000><size = 25>00:0"+time+"</color></size>";
    var node = cc.ll.notice.addMsg(1,str, begincallback, endcallback, 998);
    var msgnode = node.getChildByName("NoticeBg").getChildByName("NoticeLabel");
    var msglabel = msgnode.getComponent(cc.RichText);
    
    var intervalID = setInterval(function(){
        time--;
        if (cc.isValid(node)) {
            var str = msgcode.TUIBING_BANKER_BEGIN + "<br/><color=#FF0000><size = 25>00:0"+time+"</color></size>";
            msglabel.string = str;
        }
    }, 1000);
    setTimeout(function(){ clearInterval(intervalID); }, time * 1000);
}

var onTuiBingBetGold = function( pack ) {
    var goldlist = pack.gold;
    var node = cc.find("Canvas/GameBgLayer");
    if( node ){
        var gamelogic = node.getComponent( "GameLogic" );
        // gamelogic.onGoldAction( gold )
        gamelogic.onBetGoldCount( goldlist );
    }
}

var onDealMajiang = function( pack ) {
    var majiangs = pack.majiangs
    var dice1 = pack.dice1
    var dice2 = pack.dice2
    var node = cc.find("Canvas/GameBgLayer");
    if( node ){
        var gamelogic = node.getComponent( "GameLogic" );
        // gamelogic.onGoldAction( gold )
        gamelogic.onOpenMajiang( majiangs, dice1, dice2 );
    }
}

var onCloseClient = function( pack ) {
    var type = pack.type;
    var msg = "unknow error";
    if(type == 1){
        msg = msgcode.NETWORK_OTHER_LOGIN;
    }else if( type == 2 ){
        msg = msgcode.NETWORK_RELOGIN;
    }
    var okcallback = function(argument) {
        cc.ll.sSceneMgr.onChangeScene("loginview");
    }
    cc.ll.notice.addMsg ( 2, msg, okcallback);
}

var onTuibingBankerInfo = function( pack ) {
    var obj = {
        name : pack.name,
        id : pack.id,
        gold : pack.gold,
        times : pack.times,
    };
    var node = cc.find("Canvas/GameBgLayer");
    if( node ){
        var gamelogic = node.getComponent( "GameLogic" );
        gamelogic.onBankerInfo( obj );
    }
}

var onResKeepBanker = function( pack ) {
    var result = pack.result;
    if (result != 0 ){
        cc.ll.msgbox.addMsg(result);
    }
}

var onToTuiBingResult = function( pack ) {
    var winlist = pack.iswiner;
    var goldlist = pack.posgold;
    var node = cc.find("Canvas/GameBgLayer");
    if( node ){
        var gamelogic = node.getComponent( "GameLogic" );
        gamelogic.onSendReward( winlist, goldlist );
    }
}

var onTuibingAllPlayer = function( pack ){
    var list = pack.list;
    var node = cc.find("Canvas/GameBgLayer");
    if( node ){
        var gamelogic = node.getComponent( "GameLogic" );
        gamelogic.onShowAllPlayer( list );
    }
}

var onAddGold = function( pack ){
    var result = pack.result;
    if (result == 0) {
        cc.ll.notice.addMsg(2, msgcode.GM_PAYMENT_OK, function(){});
    } else {
        cc.ll.notice.addMsg(2, result);
    }
    // cc.ll.loading.removeLoading();
}

var onCheckName = function( pack ){
    var result = pack.result;
    if (result == 0){
        var index = pack.index;
        var id = pack.id;
        var name = pack.name;
        var event = require("LLEvent");
        var obj = {id : id, name : name};
        event.dispatchEvent( index, obj )
    }else{
        // cc.ll.msgbox.addMsg(result);
        var node = cc.ll.notice.addMsg( 2, result, null);
        node.setTimeOut( 3 );
    }
}

var onToTradeGold = function(pack){
    var id = pack.fromid;
    var name = pack.fromname;
    var gold = pack.gold;

    var str = msgcode.TRANSTFER_NOTICE_1 + name + msgcode.TRANSTFER_NOTICE_2 + gold + msgcode.TRANSTFER_NOTICE_3
    cc.ll.notice.addMsg( 2, str, null);
}

var onTradeGold = function(pack){
    var result = pack.result;
    if (result == 0) {
        var node = cc.ll.notice.addMsg( 2, msgcode.TRANSTFER_COMPLETE, null);
    }else{
        var node = cc.ll.notice.addMsg( 2, result, null);
    }
}

var FuncMap = {
    "Reslogin": onLogin,
    "ResRegister" : onRegister,
    "ResEnterRoom" : onEnterRoom,
    "ResBeBanker" : onBeBanker,
    "ResTuiBingQueueChange" : onTuiBingQueueChange,
    "ToTuiBingGameState" : onTuiBingGameState,
    "ToGoldChange" : onGoldChange,
    "ResTuiBingBet" : onTuiBingBet,
    "ToKeepBanker" : onKeepBanker,
    "ResKeepBanker" : onResKeepBanker,
    "ToBankerBegin" : onBankerBegin,
    "ToTuiBingBetGold" : onTuiBingBetGold,
    "ToDealMajiang" : onDealMajiang,
    "ToCloseClient" : onCloseClient,
    "ToTuibingBankerInfo" : onTuibingBankerInfo,
    "ResTuiBingUnbanker" : onTuibingUnbanker,
    "ResTuibingLeaveQueue" : onTuibingLeaveQueue,
    "ToTuiBingResult" : onToTuiBingResult,
    "ResTuiBingAllPlayer" : onTuibingAllPlayer,
    "ResAddGold" : onAddGold,
    "ResCheckName" : onCheckName,
    "ToTreadeGold" : onToTradeGold,
    "ResTradeGold" : onTradeGold,
}

var msgdispatch = cc.Class({
    // extends: cc.Component,
    name : "MsgDispatch",
    statics:{
        dispatch : function(head, buffer){
            var func = FuncMap[head];
            if (func !== null) {
                var p = new packet( head );
                p.unpack( buffer );
                func( p.msg );
            }
        },
    },
})
module.exports = msgdispatch;