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
      return this.send_timer = setInterval((function(_this) {
        return function() {
          if (jQuery('#chat_dispatch').val().length === 0) {
            return _this.chat_queue.shift();
          }
        };
      })(this), this.SEND_PERIOD);
    };

    CounterUi.prototype._scan = function() {
      var chatlines, data, line, zhuzi_lines, _i, _len, _results;
      chatlines = this.chatlist.updated_lines();
      zhuzi_lines = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = chatlines.length; _i < _len; _i++) {
          line = chatlines[_i];
          if (line.kind === 'zhuzi') {
            _results.push(line);
          }
        }
        return _results;
      })();
      this._thanks(zhuzi_lines);
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
          var _action, _actions, _text;
          _actions = ['投喂', '投出', '投掷', '投放', '赠送', '赠予', '送来', '送出', '抛出', '发放', '空投', '扔出', '丢来', '丢出', '分发', '发射', '打赏', '快递'];
          _action = _actions[~~(Math.random() * _actions.length)];
          _text = "感谢 " + username + " " + _action + "的" + data.count + "棵竹子！";
          return _this.chat_queue.push(_text);
        };
      })(this));
    };

    return CounterUi;

  })();

  this.ZhiBoChatList = ChatList = (function() {
    function ChatList() {
      this.$elm = jQuery('ul.chat-content-container');
      this.$elm.find('li.chat-item').removeClass('counted');
    }

    ChatList.prototype.lines = function(kind) {
      var li, line, lines;
      if (kind == null) {
        kind = 'all';
      }
      lines = (function() {
        var _i, _len, _ref, _results;
        _ref = this.$elm.find('li.chat-item');
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
        _ref = this.$elm.find('li.chat-item:not(.counted)');
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
      if (this.$li.hasClass('chat-send-bamboo')) {
        this.kind = 'zhuzi';
        this.username = this.$li.find('.chat-user-name').text();
        this.count = parseInt(this.$li.find('.chat-num').text());
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
      var char, _text;
      char = this.chars[this.idx];
      this.idx++;
      if (this.idx === 6) {
        this.idx = 0;
      }
      _text = "" + text + char;
      console.debug(_text);
      if (!this.cui.DEBUG_MODE) {
        jQuery('#chat_dispatch').val(_text);
        return jQuery('.dispatch-btn').trigger('click');
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
