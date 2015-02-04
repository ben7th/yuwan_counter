(function() {
  var ChatLine, ChatList, ChatQueue, ChatSender, CounterUi, SaveQueue, YuwanStack;

  CounterUi = (function() {
    CounterUi.prototype.SCAN_PERIOD = 500;

    CounterUi.prototype.SEND_PERIOD = 2000;

    CounterUi.prototype.SAVE_PERIOD = 5000;

    CounterUi.prototype.YUWAN_TNANKS_DELAY = 4000;

    CounterUi.prototype.DEBUG_MODE = true;

    function CounterUi() {
      this.chatlist = new ChatList;
      this.yuwan_stack = new YuwanStack(this);
      this.chat_queue = new ChatQueue(this);
      this.save_queue = new SaveQueue(this);
    }

    CounterUi.prototype.destory = function() {
      this.chatlist = null;
      clearInterval(this.scan_timer);
      return clearInterval(this.send_timer);
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
      return this.save_timer = setInterval((function(_this) {
        return function() {
          return _this.save_queue.release();
        };
      })(this), this.SAVE_PERIOD);
    };

    CounterUi.prototype._scan = function() {
      var chatlines, line, yuwan_lines, _i, _len, _results;
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
      _results = [];
      for (_i = 0, _len = chatlines.length; _i < _len; _i++) {
        line = chatlines[_i];
        _results.push(this.save_queue.push(line.get_save_data()));
      }
      return _results;
    };

    CounterUi.prototype._thanks = function(yuwan_lines) {
      return this.yuwan_stack.push(yuwan_lines).release((function(_this) {
        return function(username, data) {
          var _action, _actions, _level, _levels, _text, _text1;
          _actions = ['投喂', '投出', '投掷', '投放', '赠送', '赠予', '送来', '抛出', '发放', '空投', '丢来', '丢出', '分发', '发射', '打赏'];
          _action = _actions[~~(Math.random() * _actions.length)];
          _text = "感谢 " + username + " " + _action + "的" + data.count + "个鱼丸！";
          _this.chat_queue.push(_text);
          if (true) {
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
          }
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

  ChatLine = (function() {
    function ChatLine($li) {
      this.$li = $li;
      this.raw = this.$li.find('p.text_cont').text();
      if (this.$li.hasClass('chartli')) {
        this.kind = 'chat';
        this.username = this.$li.find('.name').text().slice(0, -1);
        this.chat = this.$li.find('span.text_cont').text();
      } else if (this.raw.indexOf('系统提示：欢迎') > -1) {
        this.kind = 'welcome';
        this.username = this.raw.split(' ')[2];
        this.userlevel = this.$li.find('img').attr('src').split('classimg/')[1].split('.png')[0];
      } else if (this.raw.indexOf('被管理员') > -1 && this.raw.indexOf('禁言') > -1) {
        this.kind = 'forbid';
        this.username = this.raw.split('被管理员')[0].split('系统广播: ')[1];
        this.manager = this.raw.split('被管理员')[1].split('禁言')[0];
      } else if (this.raw.indexOf('赠送给主播') > -1) {
        this.kind = 'yuwan';
        this.username = this.$li.find('.nick').text();
        this.count = 100;
        this.userlevel = this.$li.find('img').attr('src').split('classimg/')[1].split('.png')[0];
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
      re.room_id = $ROOM.room_id;
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
        this.data[username].count += 100;
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
