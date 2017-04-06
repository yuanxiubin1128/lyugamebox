'use strict';

var pMgr = require("PlayerManager").getInstance();
var packet = require('Lpackage');
var common = require('Common');
var msgbox = require('Msgbox');
var msgcode = require('Msgcode');
var TuiBingConfig = require("TuiBingConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        perBankerList: cc.ScrollView,
        itemPreforb: cc.Prefab,
        goldPrefab: cc.Prefab,

        goldBtnLsit: [cc.Button],

        bankerNameLabel: cc.Label,
        bankerGoldLabel: cc.Label,
        bankerTimesLabel: cc.Label,
        betPoolLabel: cc.Label,

        maJiangList: [cc.Node],
        bgList: [cc.Node],
        // 游戏属性
        _banker_id: cc.Integer,
        _banker_name: String,
        _game_state: cc.Integer,
        _banker_times: cc.Integer,
        _banker_gold: cc.Integer,

        _south_pool: new Array(),
        _sky_pool: new Array(),
        _north_pool: new Array(),

        _select_gold: cc.Integer,
        _can_bet_gold: cc.Integer,

        _MajiangSpriteList: [cc.SpriteFrame]
    },

    // use this for initialization
    onLoad: function onLoad() {
        this._select_gold = 0;
        var obj = { playerid: 0, gold: 0 };
        this._south_pool.push(obj);

        var btn = this.goldBtnLsit[0];
        if (btn != null) {
            var button = btn.getComponent(cc.Button);
            var select_gold = parseInt(btn.node.name) * 1000;
            var max = pMgr.main_role.gold;
            if (select_gold <= max) {
                button.interactable = false;
                this._select_gold = select_gold;
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    reSetGame: function reSetGame() {
        for (var i = 0; i < this.bgList.length; i++) {
            var bg = this.bgList[i];
            bg.removeAllChildren();
        }
        var obj = { majiang1: "bg", majiang2: "bg" };
        for (var i = 0; i < this.maJiangList.length; i++) {
            var majiangnode = this.maJiangList[i];
            this.OpenMajiang(majiangnode, obj);
            var pointbg = majiangnode.getChildByName("PointBg");
            pointbg.active = false;
        }
        this.betPoolLabel.string = 0;
    },

    initBanker: function initBanker() {
        this._banker_id = 0;
        this._banker_name = 0;
        this.bankerNameLabel.string = "庄家";
        this.bankerGoldLabel.string = 0;
        this.bankerTimesLabel.string = 0;
        this.betPoolLabel.string = 0;
    },

    onQueueChanged: function onQueueChanged(banker, list) {
        this._banker_id = banker.bankerid;
        this._banker_name = banker.bankername;
        this.bankerNameLabel.string = this._banker_name;

        var node = cc.find("GameBgLayer/BankerList/view/content");
        node.removeAllChildren();

        // console.log("id = " + id + ";name = "+ name);

        for (var i = 0; i < list.length; i++) {
            var info = list[i];
            var item = cc.instantiate(this.itemPreforb);
            var sprite = item.getComponent("PreBankerItem");
            sprite.onChangeName(info.playerid, info.playername, info.type);
            item.x = 0;
            item.y = -i * 40;
            node.addChild(item);
        }
        node.height = list.length * 40;
    },

    onGameStateChange: function onGameStateChange(state) {
        this._game_state = state;
        for (var i = 0; i < this.maJiangList.length; i++) {
            var majiangnode = this.maJiangList[i];
            majiangnode.active = state == 6 || state == 7;
        }
        if (state == 5) {
            this.reSetGame();
        }
        switch (state) {
            case TuiBingConfig.State.Stop:
                {
                    this.initBanker();
                    cc.ll.msgbox.addMsg(msgcode.TUIBING_STATE_STOP);
                }break;
            case TuiBingConfig.State.Begin:
                {};
            case TuiBingConfig.State.Begin_Check_Begin:
                {};
            case TuiBingConfig.State.Begin_Check_Keep:
                {
                    cc.ll.msgbox.addMsg(msgcode.TUIBING_STATE_BEGIN);
                }break;
            case TuiBingConfig.State.WaitOpen:
                {
                    cc.ll.msgbox.addMsg(msgcode.TUIBING_STATE_WAITOPEN);
                }break;
            case TuiBingConfig.State.Openning:
                {
                    cc.ll.msgbox.addMsg(msgcode.TUIBING_STATE_OPENNING);
                }break;
            case TuiBingConfig.State.Reward:
                {
                    cc.ll.msgbox.addMsg(msgcode.TUIBING_STATE_REWARD);
                }break;
        }
    },

    onGoldAction: function onGoldAction(id, pos, gold) {
        var bgstr = "";
        if (pos == 1) {
            bgstr = "GameBgLayer/GameBg/SouthBg";
        } else if (pos == 2) {
            bgstr = "GameBgLayer/GameBg/SkyBg";
        } else if (pos == 3) {
            bgstr = "GameBgLayer/GameBg/NorthBg";
        }
        if (bgstr.length <= 5) {
            return;
        }
        var num = 0;
        if (gold < 10000) {
            num = 1;
        } else if (gold >= 10000 && gold < 100000) {
            num = 2;
        } else if (gold >= 100000) {
            num = 3;
        }

        var node = cc.find(bgstr);
        for (var i = 0; i < num; i++) {
            var x = Math.round(Math.random() * node.width) - node.width / 2;
            x = x > 0 ? x - 30 : x + 30;
            var y = Math.round(Math.random() * node.height) - node.height / 2;
            y = y > 0 ? y - 30 : y + 30;
            var gold = cc.instantiate(this.goldPrefab);
            gold.x = x;
            gold.y = y;
            node.addChild(gold);
        }
    },

    onAutoSelectGold: function onAutoSelectGold() {
        var max = pMgr.main_role.gold;
        this._select_gold = 0;
        for (var i = this.goldBtnLsit.length - 1; i >= 0; i--) {
            var btn = this.goldBtnLsit[i];
            var button = btn.getComponent(cc.Button);
            var select_gold = parseInt(btn.node.name) * 1000;
            if (select_gold <= this._can_bet_gold) {
                if (select_gold > max) {
                    button.interactable = true;
                } else {
                    button.interactable = false;
                    this._select_gold = select_gold;
                }
            }
        }
    },

    onBetGold: function onBetGold(event, pos) {
        if (self._game_state != 5) {
            return;
        }
        var maxgold = pMgr.main_role.gold;
        if (maxgold < 1000) {
            cc.ll.msgbox.addMsg(msgcode.GOLD_NOT_ENOUGH);
            return;
        }

        if (this._select_gold == 0) {
            cc.ll.msgbox.addMsg(msgcode.TUIBING_SELECT_GOLD);
            return;
        }

        if (this._select_gold > maxgold) {
            this.onAutoSelectGold();
        }

        if (this._select_gold > this._can_bet_gold) {
            cc.ll.msgbox.addMsg(msgcode.TUIBING_MORETHAN_BANKER);
            return;
        }

        var p = new packet("ReqTuiBingBet");
        p.lpack.pos = parseInt(pos);
        p.lpack.gold = this._select_gold;
        cc.ll.net.send(p.pack());
    },

    onSelectGold: function onSelectGold(event, gold) {
        var max = pMgr.main_role.gold;
        var select_gold = parseInt(gold);
        if (select_gold > max) {
            return;
        }
        if (select_gold > this._can_bet_gold) {
            return;
        }
        var node = event.target;
        for (var i = 0; i < this.goldBtnLsit.length; i++) {
            var btn = this.goldBtnLsit[i];
            var button = btn.getComponent(cc.Button);
            button.interactable = btn.node.name != node.name;
        }
        this._select_gold = select_gold;
    },

    onBetGoldCount: function onBetGoldCount(gold) {
        this.betPoolLabel.string = gold;
        this._can_bet_gold = this._banker_gold - gold;
    },

    OpenMajiang: function OpenMajiang(node, obj) {
        var changesprite = function changesprite(sprite_node, sprite_name) {
            var sprite = sprite_node.getComponent(cc.Sprite);
            var frame = new cc.SpriteFrame();
            var realUrl = cc.url.raw("resources/erguotou/" + sprite_name + ".png");
            var texture = cc.textureCache.addImage(realUrl);
            frame.setTexture(texture);
            sprite.spriteFrame = frame;
        };
        var majiang1 = node.getChildByName("Majiang1");
        var majiang2 = node.getChildByName("Majiang2");
        var pointbg = node.getChildByName("PointBg");
        pointbg.active = true;
        var namespr = "img_majiang_" + obj.majiang1;
        changesprite(majiang1, namespr);
        namespr = "img_majiang_" + obj.majiang2;
        changesprite(majiang2, namespr);
        if (obj.majiang1 == "bg") {
            return;
        }
        var numspr = pointbg.getChildByName("NumSpr");
        var num = (obj.majiang1 + obj.majiang2) % 10;
        namespr = "img_" + num + "point_num";
        changesprite(numspr, namespr);
    },

    // majiangs 0 庄 1 南 2 天 3 北 {majiang1 majiang2}
    onOpenMajiang: function onOpenMajiang(majiangs) {
        // 先撒骰子
        var random_1 = Math.ceil(Math.random() * 5 + 1);
        var random_2 = Math.ceil(Math.random() * 5 + 1);

        var majianglist = this.maJiangList;
        var openmajiang = this.OpenMajiang;
        var open = function open(id) {
            var node = majianglist[id];
            var nums = majiangs[id];
            openmajiang(node, nums);
        };
        var open1 = function open1() {
            open(0);
        };
        var open2 = function open2() {
            open(1);
        };
        var open3 = function open3() {
            open(2);
        };
        var open4 = function open4() {
            open(3);
        };

        var act1 = cc.callFunc(open1);
        var act2 = cc.delayTime(0.5);
        var act3 = cc.callFunc(open2);
        var act4 = cc.delayTime(0.5);
        var act5 = cc.callFunc(open3);
        var act6 = cc.delayTime(0.5);
        var act7 = cc.callFunc(open4);
        var act = cc.sequence(act1, act2, act3, act4, act5, act6, act7);
        this.node.runAction(act);
    },

    onBankerInfo: function onBankerInfo(obj) {
        this._banker_id = obj.id;
        this._banker_name = obj.name;
        this._banker_times = obj.times;
        this._banker_gold = obj.gold;
        this.bankerNameLabel.string = obj.name;
        this.bankerGoldLabel.string = obj.gold;
        this.bankerTimesLabel.string = obj.times;
    }
});