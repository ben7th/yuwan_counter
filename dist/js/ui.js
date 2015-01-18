(function() {
  var ChatLine, ChatList, CounterUi;

  CounterUi = (function() {
    function CounterUi() {
      this.chatlist = new ChatList;
    }

    CounterUi.prototype.destory = function() {
      return this.chatlist = null;
    };

    return CounterUi;

  })();

  ChatList = (function() {
    function ChatList() {
      this.$elm = jQuery('ul#chat_line_list');
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
      }
      if (this.raw.indexOf('系统提示：欢迎') > -1) {
        this.kind = 'welcome';
        this.username = this.raw.split(' ')[2];
        this.userlevel = this.$li.find('img').attr('src').split('classimg/')[1].split('.png')[0];
      }
      if (this.raw.indexOf('被管理员') > -1 && this.raw.indexOf('禁言') > -1) {
        this.kind = 'forbid';
        this.username = this.raw.split('被管理员')[0].split('系统广播: ')[1];
        this.manager = this.raw.split('被管理员')[1].split('禁言')[0];
      }
      if (this.raw.indexOf('赠送给主播') > -1) {
        this.kind = 'yuwan';
        this.username = this.$li.find('.nick').text();
        this.count = 100;
      }
    }

    return ChatLine;

  })();

  (function() {
    if (window.cui != null) {
      window.cui.destory();
    }
    return window.cui = new CounterUi;
  })();

}).call(this);
