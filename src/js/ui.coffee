class CounterUi
  constructor: ->
    @chatlist = new ChatList
    @chatsender = new ChatSender

    @yuwan_stack = new YuwanStack

  destory: ->
    @chatlist = null
    @stop()

  # 启动工作进程
  # 工作进程是一个每 2 秒运行一次的 timer
  start: ->
    @timer_seconds = 0
    @timer = setInterval =>
      @_thanks()
      @timer_seconds += 2
    , 2000


  # 停止工作进程
  stop: ->
    clearInterval @timer

  # 鱼丸答谢
  _thanks: ->
    # 获取新增的鱼丸投喂记录，加入堆栈
    @yuwan_stack.push @timer_seconds, @chatlist.updated_lines('yuwan')
    @yuwan_stack.pop @timer_seconds, (username, count)=>
      _actions = [
        '投喂', '投出', '投掷', '投放' 
        '赠送', '赠予', '送来'
        '抛出', '发放', '空投' 
        '丢来', '丢出'
        '分发', '发射'
        '打赏'
      ]
      
      _action = _actions[~~ (Math.random() * _actions.length)]
      _text = "感谢 #{username} #{_action}的#{count}个鱼丸！"
      @chatsender.send _text


class ChatList
  constructor: ->
    @$elm = jQuery 'ul#chat_line_list'
    @$elm.find('li.jschartli').removeClass 'counted'

  # 获取当前页面内所有对话行
  lines: (kind = 'all')->
    lines = for li in @$elm.find('li.jschartli')
      new ChatLine jQuery(li)

    switch kind
      when 'all'
        return lines
      else
        return (line for line in lines when line.kind is kind)

  # 获取当前页面内所有新增对话行
  # 已经获取过一次的对话行会被标记，下次不再获取
  updated_lines: (kind = 'all')->
    lines = for li in @$elm.find('li.jschartli:not(.counted)')
      new ChatLine jQuery(li)

    re = switch kind
      when 'all'
        lines
      else
        (line for line in lines when line.kind is kind)

    for line in re
      line.mark_counted()

    re

# 对话行
# 对话行分为三种类型：
# 1. 普通对话。包含说话人和说话内容
# 2. 到访欢迎。包含到访人和到访人等级信息
# 3. 封禁广播。包含被封禁人信息
# 4. 赠送鱼丸。包含鱼丸赠送人和鱼丸数量（目前只能是100个）

# 普通对话
# <li class="jschartli chartli">
#   <p class="text_cont">
#     <span class="name">
#       <a href="#" class="nick js_nick" rel="1320690">jeffery0523:</a>
#     </span>
#     <span class="text_cont">2cm是什么梗</span>
#   </p>
# </li>

# 到访欢迎
# <li class="jschartli">
#   <p class="text_cont">
#     <a style="color:#F00">系统提示</a>
#     <a></a>
#     ：欢迎 
#     <img src="http://staticlive.douyutv.com/common/douyu/images/classimg/user12.png">
#     <a style="color:#F00" class="js_nick" rel="2425">兮诺</a>
#     <a></a> 来到 <a style="color:#F00">炉石王师傅</a>的直播间
#   </p>
# </li>

# 封禁广播
# <li class="jschartli">
#   <p class="text_cont">
#     <a style="color:#FF0000">系统广播: 群125200871丶180合击w9m5u被管理员禁言</a>
#   </p>
# </li>
# <li class="jschartli"> 
#   <p class="text_cont">
#     <a style="color:#FF0000">系统广播: dengkenxie842被管理员珞晓沫禁言</a>
#   </p>
# </li>

# 赠送鱼丸
# <li class="jschartli">
#   <p class="text_cont">
#     <img src="http://staticlive.douyutv.com/common/douyu/images/classimg/user4.png"> 
#     <a href="#" class="nick js_nick" rel="3170929">HitMANooooo</a>
#     赠送给主播<i>100</i>个鱼丸
#     <img src="http://staticlive.douyutv.com/common/douyu/images/yw.png">
#   </p>
# </li>

class ChatLine
  constructor: (@$li)->
    @raw = @$li.find('p.text_cont').text()
    
    # 根据 dom 结构判断对话类型
    if @$li.hasClass 'chartli'
      @kind = 'chat'
      @username = @$li.find('.name').text()[0...-1]
      @chat = @$li.find('span.text_cont').text()

    else if @raw.indexOf('系统提示：欢迎') > -1
      @kind = 'welcome'
      @username = @raw.split(' ')[2]
      @userlevel = @$li.find('img').attr('src').split('classimg/')[1].split('.png')[0]

    else if @raw.indexOf('被管理员') > -1 and @raw.indexOf('禁言') > -1
      @kind = 'forbid'
      @username = @raw.split('被管理员')[0].split('系统广播: ')[1]
      @manager = @raw.split('被管理员')[1].split('禁言')[0]

    else if @raw.indexOf('赠送给主播') > -1
      @kind = 'yuwan'
      @username = @$li.find('.nick').text()
      @count = 100

  # 标记为已经统计
  mark_counted: ->
    @$li.addClass('counted')


# 鱼丸堆栈，记录投喂人和投喂数
class YuwanStack
  constructor: ->
    @data = {}
  
  push: (timer_seconds, lines)->
    for line in lines
      username = line.username
      @data[username] ?= {
        seconds: timer_seconds
        count: 0
      }
      @data[username].seconds = timer_seconds
      @data[username].count += 100

    # console.debug @data

  # 从堆栈中弹出一个鱼丸记录，生成答谢信息
  # 只有当时间间隔大于等于 2 秒时，才弹出
  # 为防止弹幕爆炸，一次只弹出一条答谢
  pop: (timer_seconds, func)->
    # console.debug @data
    for username, d of @data
      if timer_seconds - d.seconds >= 4
        func(username, d.count)
        delete @data[username]
        return

class ChatSender
  constructor: ->
    @chars = [',', '.', '~', ';', '!', '`']
    @idx = 0

  send: (text)->
    char = @chars[@idx]
    @idx++
    @idx = 0 if @idx is 6

    _text = "#{text}#{char}"

    console.debug _text

    f = [
      {name: "content", value: _text}
      {name: "scope", value: jQuery("#privatstate").val()}
    ]

    c = check_user_login();
    d = if not c then touristuid else c.wl_uid
    f.push {name: "sender", value: d}

    if jQuery("#privateuid").val() > 0
      f.push {name: "receiver", value: jQuery("#privateuid").val()}

    thisMovie("WebRoom").js_sendmsg Sttencode(f)

do ->
  window.cui.destory() if window.cui?
  window.cui = new CounterUi

  # 启动鱼丸答谢功能
  # window.cui.enable('yuwan_thanks')
  window.cui.start()