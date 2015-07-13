(function() {
  var ChatLine, ChatList, ChatQueue, ChatSender, ChouqinStack, CounterUi, SaveQueue, YuwanStack;

  CounterUi = (function() {
    CounterUi.prototype.SCAN_PERIOD = 500;

    CounterUi.prototype.SEND_PERIOD = 8000;

    CounterUi.prototype.SAVE_PERIOD = 30000;

    CounterUi.prototype.STATUS_SAVE_PERIOD = 30000;

    CounterUi.prototype.YUWAN_TNANKS_DELAY = 4000;

    CounterUi.prototype.DEBUG_MODE = false;

    function CounterUi() {
      this.chatlist = new ChatList;
      this.yuwan_stack = new YuwanStack(this);
      this.chouqin_stack = new ChouqinStack(this);
      this.chat_queue = new ChatQueue(this);
      this.save_queue = new SaveQueue(this);
    }

    CounterUi.prototype.destory = function() {
      this.chatlist = null;
      clearInterval(this.scan_timer);
      clearInterval(this.send_timer);
      clearInterval(this.save_timer);
      return clearInterval(this.status_save_timer);
    };

    CounterUi.prototype.start = function() {
      this.scan_timer = setInterval((function(_this) {
        return function() {
          return _this._scan();
        };
      })(this), this.SCAN_PERIOD);
      this.send_timer = setInterval((function(_this) {
        return function() {
          return _this.chat_queue.shift();
        };
      })(this), this.SEND_PERIOD);
      this.save_timer = setInterval((function(_this) {
        return function() {
          return _this.save_queue.release();
        };
      })(this), this.SAVE_PERIOD);
      return this.status_save_timer = setInterval((function(_this) {
        return function() {
          var follow_count, online_number;
          follow_count = jQuery('#followtit').text().replace(',', '');
          online_number = jQuery('#ol_num').text().replace(',', '');
          console.debug("关注数：" + follow_count, "在线数：" + online_number);
          if (_this.room_id == null) {
            _this.room_id = jQuery('input[name=room_id]').val();
          }
          return jQuery.ajax({
            type: 'POST',
            url: 'http://yuwan.4ye.me/api/room_status',
            data: {
              room_status: {
                room_id: _this.room_id,
                follow_count: follow_count,
                online_number: online_number,
                time: new Date().getTime()
              }
            },
            success: function(res) {
              return console.debug('聊天室状态保存成功');
            }
          });
        };
      })(this), this.STATUS_SAVE_PERIOD);
    };

    CounterUi.prototype._scan = function() {
      var chatlines, chouqin_lines, data, line, yuwan_lines, _i, _len, _results;
      chatlines = this.chatlist.updated_lines();
      yuwan_lines = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = chatlines.length; _i < _len; _i++) {
          line = chatlines[_i];
          if (line.kind === 'yuwan') {
            _results.push(line);
          }
        }
        return _results;
      })();
      this._thanks(yuwan_lines);
      chouqin_lines = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = chatlines.length; _i < _len; _i++) {
          line = chatlines[_i];
          if (line.kind === 'chouqin') {
            _results.push(line);
          }
        }
        return _results;
      })();
      this._thanks_choutin(chouqin_lines);
      _results = [];
      for (_i = 0, _len = chatlines.length; _i < _len; _i++) {
        line = chatlines[_i];
        data = line.get_save_data();
        if (data != null) {
          _results.push(this.save_queue.push(data));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    CounterUi.prototype._thanks = function(yuwan_lines) {
      return this.yuwan_stack.push(yuwan_lines).release((function(_this) {
        return function(username, data) {
          var _action, _actions, _level, _levels, _text, _text1;
          _actions = ['投喂', '投出', '投掷', '投放', '赠送', '赠予', '送来', '送出', '抛出', '发放', '空投', '扔出', '丢来', '丢出', '分发', '发射', '打赏', '快递'];
          _action = _actions[~~(Math.random() * _actions.length)];
          _text = "感谢 " + username + " " + _action + "的" + data.count + "个鱼丸！";
          _this.chat_queue.push(_text);
          _levels = {
            user1: '菜鸟',
            user2: '黄铜五',
            user3: '黄铜四',
            user4: '黄铜三',
            user5: '黄铜二',
            user6: '黄铜一',
            user7: '白银五',
            user8: '白银四',
            user9: '白银三',
            user10: '白银二',
            user11: '白银一',
            user12: '黄金五',
            user13: '黄金四',
            user14: '黄金三',
            user15: '黄金二',
            user16: '黄金一',
            user17: '铂金五',
            user18: '铂金四',
            user19: '铂金三',
            user20: '铂金二',
            user21: '铂金一',
            user22: '钻石五',
            user23: '钻石四',
            user24: '钻石三',
            user25: '钻石二',
            user26: '钻石一'
          };
          if (data.end_userlevel !== data.begin_userlevel) {
            _level = _levels[data.end_userlevel];
            _text1 = "！！恭喜 " + username + " 渡劫到" + _level + "！";
            return _this.chat_queue.push(_text1);
          }
        };
      })(this));
    };

    CounterUi.prototype._thanks_choutin = function(chouqin_lines) {
      return this.chouqin_stack.push(chouqin_lines).release((function(_this) {
        return function(username, data) {
          var chouqinlevel, _i, _len, _ref, _results, _text;
          _ref = ['初级', '中级', '高级'];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            chouqinlevel = _ref[_i];
            if (data[chouqinlevel] > 0) {
              _text = "感谢 " + username + " 赠送的" + data[chouqinlevel] + "个" + chouqinlevel + "酬勤！";
              _results.push(_this.chat_queue.push(_text));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
    };

    return CounterUi;

  })();

  ChatList = (function() {
    function ChatList() {
      this.$elm = jQuery('ul#chat_line_list');
      this.$elm.find('li.jschartli').removeClass('counted');
    }

    ChatList.prototype.lines = function(kind) {
      var li, line, lines;
      if (kind == null) {
        kind = 'all';
      }
      lines = (function() {
        var _i, _len, _ref, _results;
        _ref = this.$elm.find('li.jschartli');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          li = _ref[_i];
          _results.push(new ChatLine(jQuery(li)));
        }
        return _results;
      }).call(this);
      switch (kind) {
        case 'all':
          return lines;
        default:
          return (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = lines.length; _i < _len; _i++) {
              line = lines[_i];
              if (line.kind === kind) {
                _results.push(line);
              }
            }
            return _results;
          })();
      }
    };

    ChatList.prototype.updated_lines = function(kind) {
      var li, line, lines, re, _i, _len;
      if (kind == null) {
        kind = 'all';
      }
      lines = (function() {
        var _i, _len, _ref, _results;
        _ref = this.$elm.find('li.jschartli:not(.counted)');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          li = _ref[_i];
          _results.push(new ChatLine(jQuery(li)));
        }
        return _results;
      }).call(this);
      re = (function() {
        var _i, _len, _results;
        switch (kind) {
          case 'all':
            return lines;
          default:
            _results = [];
            for (_i = 0, _len = lines.length; _i < _len; _i++) {
              line = lines[_i];
              if (line.kind === kind) {
                _results.push(line);
              }
            }
            return _results;
        }
      })();
      for (_i = 0, _len = re.length; _i < _len; _i++) {
        line = re[_i];
        line.mark_counted();
      }
      return re;
    };

    return ChatList;

  })();


  /*
   * 对话行
   * 对话行分为三种类型：
   * 1. 普通对话。包含说话人和说话内容
   * 2. 到访欢迎。包含到访人和到访人等级信息
   * 3. 封禁广播。包含被封禁人信息
   * 4. 赠送鱼丸。包含鱼丸赠送人和鱼丸数量（目前只能是100个）
  
   * 普通对话
   * <li class="jschartli chartli">
   *   <p class="text_cont">
   *     <span class="name">
   *       <a href="#" class="nick js_nick" rel="1320690">jeffery0523:</a>
   *     </span>
   *     <span class="text_cont">2cm是什么梗</span>
   *   </p>
   * </li>
  
   * 当前用户“我”说的话
   * <li class="jschartli">
   *   <p class="my_cont">
   *     <span><img src="http://staticlive.douyutv.com/common/douyu/images/roomadmin.gif?20140704"></span>
   *     <span class="name">
   *       <a href="#" class="nick js_nick" rel="1331302" gid="1">我:</a>
   *     </span>
   *     <span class="m" chatid="4e7113263f3e41f57651000000000000">感谢&nbsp;ft303ft&nbsp;送来的200个鱼丸！!</span>
   *   </p>
   * </li>
  
   * 到访欢迎
   * <li class="jschartli">
   *   <p class="text_cont">
   *     <a style="color:#F00">系统提示</a>
   *     <a></a>
   *     ：欢迎 
   *     <img src="http://staticlive.douyutv.com/common/douyu/images/classimg/user12.png">
   *     <a style="color:#F00" class="js_nick" rel="2425">兮诺</a>
   *     <a></a> 来到 <a style="color:#F00">炉石王师傅</a>的直播间
   *   </p>
   * </li>
  
   * 封禁广播
   * <li class="jschartli">
   *   <p class="text_cont">
   *     <a style="color:#FF0000">系统广播: 群125200871丶180合击w9m5u被管理员禁言</a>
   *   </p>
   * </li>
   * <li class="jschartli"> 
   *   <p class="text_cont">
   *     <a style="color:#FF0000">系统广播: dengkenxie842被管理员珞晓沫禁言</a>
   *   </p>
   * </li>
  
   * 赠送鱼丸
   * <li class="jschartli">
   *   <p class="text_cont">
   *     <img src="http://staticlive.douyutv.com/common/douyu/images/classimg/user4.png"> 
   *     <a href="#" class="nick js_nick" rel="3170929">HitMANooooo</a>
   *     赠送给主播<i>100</i>个鱼丸
   *     <img src="http://staticlive.douyutv.com/common/douyu/images/yw.png">
   *   </p>
   * </li>
  
   * 赠送特殊鱼丸
   * <li class="jschartli">
   *   <p class="text_cont">
   *     <img src="http://staticlive.douyutv.com/common/douyu/images/classimg/user2.png">
   *       <a href="#" class="nick js_nick" rel="10021060">mawenzhe7</a>
   *       <br>赠送给主播
   *       <i><img src="http://staticlive.douyutv.com/common/douyu/images/zs520.png?v3979.1">
   *       </i>个鱼丸
   *       <img src="http://staticlive.douyutv.com/common/douyu/images/yw520.png?20150430">
   *   </p>
   * </li>
  
   * 赠送酬勤
   * <li class="jschartli counted aaa">
   *   <p class="text_cont">
   *     <img src="http://staticlive.douyutv.com/common/douyu/images/classimg/user7.png">
   *     <a href="#" class="nick" rel="939651">泣血剑殇</a> 
   *     赠送了高级酬勤
   *     <img src="http://staticlive.douyutv.com/common/douyu/images/cq3.gif?">
   *     成为了本房间
   *     <span>
   *     <img src="http://staticlive.douyutv.com/common/douyu/images/no3.gif?">
   *     </span>会员
   *   </p>
   * </li>
   */

  ChatLine = (function() {
    function ChatLine($li) {
      var match, src;
      this.$li = $li;
      this.raw = this.$li.find('p.text_cont').text();
      if (this.$li.hasClass('chartli')) {
        this.kind = 'chat';
        this.username = this.$li.find('.name').text().slice(0, -1);
        this.chat = this.$li.find('span.text_cont').text();
      } else if (this.raw.indexOf('系统提示：欢迎') > -1) {
        this.kind = 'welcome';
        this.username = this.raw.split(' ')[2];
        this.userlevel = this.$li.find('img').attr('src').split('classimg/')[1].split('.gif')[0];
      } else if (this.raw.indexOf('被管理员') > -1 && this.raw.indexOf('禁言') > -1) {
        this.kind = 'forbid';
        this.username = this.raw.split('被管理员')[0].split('系统广播: ')[1];
        this.manager = this.raw.split('被管理员')[1].split('禁言')[0];
      } else if (this.raw.indexOf('赠送给主播') > -1) {
        this.kind = 'yuwan';
        this.username = this.$li.find('.nick').text();
        this.userlevel = this.$li.find('img').attr('src').split('classimg/')[1].split('.gif')[0];
        if (this.$li.find('i img').length > 0) {
          src = this.$li.find('i img').attr('src');
          match = src.match(/zs([0-9]+)/);
          if (match) {
            this.count = parseInt(match[1]);
          }
        } else {
          this.count = parseInt(this.$li.find('i').text());
        }
      } else if (this.raw.indexOf('酬勤') > -1) {
        this.kind = 'chouqin';
        this.username = this.$li.find('.nick').text();
        this.chouqinlevel = this.raw.match(/赠送了(.+)酬勤/)[1];
      }
    }

    ChatLine.prototype.mark_counted = function() {
      return this.$li.addClass('counted');
    };

    ChatLine.prototype.get_save_data = function() {
      var re;
      re = (function() {
        switch (this.kind) {
          case 'chat':
            return {
              username: this.username,
              text: this.chat
            };
          case 'welcome':
            return {
              username: this.username,
              userlevel: this.userlevel
            };
          case 'forbid':
            return {
              username: this.username,
              manager: this.manager
            };
          case 'yuwan':
            return {
              username: this.username,
              userlevel: this.userlevel
            };
        }
      }).call(this);
      if (re == null) {
        return;
      }
      re.room_id = jQuery('input[name=room_id]').val();
      re.talk_time = new Date().getTime();
      re.chat_type = this.kind;
      return re;
    };

    return ChatLine;

  })();

  YuwanStack = (function() {
    function YuwanStack(cui) {
      this.cui = cui;
      this.data = {};
    }

    YuwanStack.prototype.push = function(lines) {
      var line, time, userlevel, username, _base, _i, _len;
      time = new Date().getTime();
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        username = line.username;
        userlevel = line.userlevel;
        if ((_base = this.data)[username] == null) {
          _base[username] = {
            updated_at: time,
            count: 0,
            begin_userlevel: userlevel
          };
        }
        this.data[username].updated_at = time;
        this.data[username].count += line.count;
        this.data[username].end_userlevel = userlevel;
      }
      return this;
    };

    YuwanStack.prototype.release = function(func) {
      var d, time, username, _ref;
      time = new Date().getTime();
      _ref = this.data;
      for (username in _ref) {
        d = _ref[username];
        if (time - d.updated_at >= this.cui.YUWAN_TNANKS_DELAY) {
          func(username, d);
          delete this.data[username];
        }
      }
      return this;
    };

    return YuwanStack;

  })();

  ChouqinStack = (function() {
    function ChouqinStack(cui) {
      this.cui = cui;
      this.data = {};
    }

    ChouqinStack.prototype.push = function(lines) {
      var chouqinlevel, line, time, username, _base, _base1, _i, _len;
      time = new Date().getTime();
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        username = line.username;
        chouqinlevel = line.chouqinlevel;
        if ((_base = this.data)[username] == null) {
          _base[username] = {
            updated_at: time
          };
        }
        this.data[username].updated_at = time;
        if ((_base1 = this.data[username])[chouqinlevel] == null) {
          _base1[chouqinlevel] = 0;
        }
        this.data[username][chouqinlevel] = this.data[username][chouqinlevel] + 1;
      }
      return this;
    };

    ChouqinStack.prototype.release = function(func) {
      var d, time, username, _ref;
      time = new Date().getTime();
      _ref = this.data;
      for (username in _ref) {
        d = _ref[username];
        if (time - d.updated_at >= this.cui.YUWAN_TNANKS_DELAY) {
          func(username, d);
          delete this.data[username];
        }
      }
      return this;
    };

    return ChouqinStack;

  })();

  ChatSender = (function() {
    function ChatSender(cui) {
      this.cui = cui;
      this.chars = [',', '.', '~', ';', '!', '`'];
      this.idx = 0;
    }

    ChatSender.prototype.send = function(text) {
      var c, char, d, f, _text;
      char = this.chars[this.idx];
      this.idx++;
      if (this.idx === 6) {
        this.idx = 0;
      }
      _text = "" + text + char;
      f = [
        {
          name: "content",
          value: _text
        }, {
          name: "scope",
          value: jQuery("#privatstate").val()
        }
      ];
      c = check_user_login();
      d = !c ? touristuid : c.wl_uid;
      f.push({
        name: "sender",
        value: d
      });
      if (jQuery("#privateuid").val() > 0) {
        f.push({
          name: "receiver",
          value: jQuery("#privateuid").val()
        });
      }
      console.debug(_text);
      if (!this.cui.DEBUG_MODE) {
        return thisMovie("WebRoom").js_sendmsg(Sttencode(f));
      }
    };

    return ChatSender;

  })();

  ChatQueue = (function() {
    function ChatQueue(cui) {
      this.cui = cui;
      this.queue = [];
      this.chatsender = new ChatSender(this.cui);
    }

    ChatQueue.prototype.push = function(text) {
      return this.queue.push(text);
    };

    ChatQueue.prototype.shift = function() {
      var text;
      text = this.queue.shift();
      if (text != null) {
        return this.chatsender.send(text);
      }
    };

    return ChatQueue;

  })();

  SaveQueue = (function() {
    function SaveQueue(cui) {
      this.cui = cui;
      this.queue = [];
    }

    SaveQueue.prototype.push = function(data) {
      return this.queue.push(data);
    };

    SaveQueue.prototype.release = function() {
      if (this.queue.length === 0) {
        return;
      }
      jQuery.ajax({
        type: 'POST',
        url: 'http://yuwan.4ye.me/api/chat_lines',
        data: {
          chat_lines: this.queue
        },
        success: function(res) {
          return console.debug('聊天信息保存成功');
        }
      });
      return this.queue = [];
    };

    return SaveQueue;

  })();

  (function() {
    if (window.cui != null) {
      window.cui.destory();
    }
    window.cui = new CounterUi;
    return window.cui.start();
  })();

}).call(this);
