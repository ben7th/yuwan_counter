(function() {
  var ChatLine, ChatList, ChatSender, CounterUi, YuwanStack;

  CounterUi = (function() {
    function CounterUi() {
      this.chatlist = new ChatList;
      this.chatsender = new ChatSender;
      this.yuwan_stack = new YuwanStack;
    }

    CounterUi.prototype.destory = function() {
      this.chatlist = null;
      return this.stop();
    };

    CounterUi.prototype.start = function() {
      this.timer_seconds = 0;
      return this.timer = setInterval((function(_this) {
        return function() {
          _this._thanks();
          return _this.timer_seconds += 2;
        };
      })(this), 2000);
    };

    CounterUi.prototype.stop = function() {
      return clearInterval(this.timer);
    };

    CounterUi.prototype._thanks = function() {
      this.yuwan_stack.push(this.timer_seconds, this.chatlist.updated_lines('yuwan'));
      return this.yuwan_stack.pop(this.timer_seconds, (function(_this) {
        return function(username, count) {
          var _action, _actions, _text;
          _actions = ['投喂', '投出', '投掷', '投放', '赠送', '赠予', '送来', '抛出', '发放', '空投', '丢来', '丢出', '分发', '发射', '打赏'];
          _action = _actions[~~(Math.random() * _actions.length)];
          _text = "感谢 " + username + " " + _action + "的" + count + "个鱼丸！";
          return _this.chatsender.send(_text);
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
      }
    }

    ChatLine.prototype.mark_counted = function() {
      return this.$li.addClass('counted');
    };

    return ChatLine;

  })();

  YuwanStack = (function() {
    function YuwanStack() {
      this.data = {};
    }

    YuwanStack.prototype.push = function(timer_seconds, lines) {
      var line, username, _base, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        username = line.username;
        if ((_base = this.data)[username] == null) {
          _base[username] = {
            seconds: timer_seconds,
            count: 0
          };
        }
        this.data[username].seconds = timer_seconds;
        _results.push(this.data[username].count += 100);
      }
      return _results;
    };

    YuwanStack.prototype.pop = function(timer_seconds, func) {
      var d, username, _ref;
      _ref = this.data;
      for (username in _ref) {
        d = _ref[username];
        if (timer_seconds - d.seconds >= 4) {
          func(username, d.count);
          delete this.data[username];
          return;
        }
      }
    };

    return YuwanStack;

  })();

  ChatSender = (function() {
    function ChatSender() {
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
      console.debug(_text);
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
      return thisMovie("WebRoom").js_sendmsg(Sttencode(f));
    };

    return ChatSender;

  })();

  (function() {
    if (window.cui != null) {
      window.cui.destory();
    }
    window.cui = new CounterUi;
    return window.cui.start();
  })();

}).call(this);
