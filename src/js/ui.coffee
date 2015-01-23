class CounterUi
  SCAN_PERIOD: 500
  SEND_PERIOD: 2000
  # 鱼丸答谢响应时间
  YUWAN_TNANKS_DELAY: 4000
  # 调试模式，true 时不会发送聊天
  DEBUG_MODE: false 

  constructor: ->
    @chatlist = new ChatList
    @yuwan_stack = new YuwanStack @
    @chat_queue = new ChatQueue @


  # 销毁实例，并停止所有工作进程计时器
  destory: ->
    @chatlist = null
    clearInterval @scan_timer
    clearInterval @send_timer


  # 启动工作进程
  # 有两个工作进程，一个扫描进程，一个发言进程
  # 扫描进程每 0.5 秒运行一次
  # 发言进程每 2 秒运行一次
  start: ->
    @scan_timer = setInterval =>
      @_thanks()
    , @SCAN_PERIOD

    @send_timer = setInterval =>
      @chat_queue.shift()
    , @SEND_PERIOD


  # 鱼丸答谢
  _thanks: ->
    # 获取新增的鱼丸投喂记录，加入堆栈
    @yuwan_stack
      .push @chatlist.updated_lines('yuwan')
      .release (username, data)=>
        _actions = [
          '投喂', '投出', '投掷', '投放' 
          '赠送', '赠予', '送来'
          '抛出', '发放', '空投' 
          '丢来', '丢出'
          '分发', '发射'
          '打赏'
        ]
        
        _action = _actions[~~ (Math.random() * _actions.length)]
        _text = "感谢 #{username} #{_action}的#{data.count}个鱼丸！"
        @chat_queue.push _text

        # 升级检查
        if true #data.begin_userlevel is not data.end_userlevel
          _levels = {
            user1:  '菜鸟'
            user2:  '黄铜一'
            user3:  '黄铜二'
            user4:  '黄铜三'
            user5:  '黄铜四'
            user6:  '黄铜五'
            user7:  '白银一'
            user8:  '白银二'
            user9:  '白银三'
            user10: '白银四'
            user11: '白银五'
            user12: '黄金一'
            user13: '黄金二'
            user14: '黄金三'
            user15: '黄金四'
            user16: '黄金五'
            user17: '铂金一'
            user18: '铂金二'
            user19: '铂金三'
            user20: '铂金四'
            user21: '铂金五'
            user22: '钻石一'
            user23: '钻石二'
            user24: '钻石三'
            user25: '钻石四'
            user26: '钻石五'
          }

          if data.end_userlevel != data.begin_userlevel
            # console.debug data
            _level = _levels[data.end_userlevel]
            _text1 = "！！恭喜 #{username} 渡劫到#{_level}！"
            @chat_queue.push _text1



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
      @userlevel = @$li.find('img').attr('src').split('classimg/')[1].split('.png')[0]

  # 标记为已经统计
  mark_counted: ->
    @$li.addClass('counted')


# 鱼丸堆栈，记录投喂人和投喂数
class YuwanStack
  constructor: (@cui)->
    @data = {}
  
  push: (lines)->
    time = new Date().getTime()
    for line in lines
      username = line.username
      userlevel = line.userlevel
      @data[username] ?= {
        updated_at: time
        count: 0
        begin_userlevel: userlevel
      }
      @data[username].updated_at = time
      @data[username].count += 100
      @data[username].end_userlevel = userlevel

    return @


  # 检查堆栈中的鱼丸记录
  # 当当前时间减去鱼丸记录最后更新时间，其间隔大于 4 秒时
  # 释放该鱼丸记录
  # 同时采用传入的 callback func 进行处理
  # 2015.1.23 由于发言方法已修改，因此可以一次释放多条记录了
  release: (func)->
    time = new Date().getTime()
    for username, d of @data
      if time - d.updated_at >= @cui.YUWAN_TNANKS_DELAY
        func username, d
        delete @data[username]

    return @



class ChatSender
  constructor: (@cui)->
    @chars = [',', '.', '~', ';', '!', '`']
    @idx = 0

  send: (text)->
    char = @chars[@idx]
    @idx++
    @idx = 0 if @idx is 6

    _text = "#{text}#{char}"

    f = [
      {name: "content", value: _text}
      {name: "scope", value: jQuery("#privatstate").val()}
    ]

    c = check_user_login();
    d = if not c then touristuid else c.wl_uid
    f.push {name: "sender", value: d}

    if jQuery("#privateuid").val() > 0
      f.push {name: "receiver", value: jQuery("#privateuid").val()}

    console.debug _text
    if not @cui.DEBUG_MODE
      thisMovie("WebRoom").js_sendmsg Sttencode(f)



# 用法：
# chat_queue.push(text) // 放入对话
# chat_queue.shift() // 发送对话
class ChatQueue
  constructor: (@cui)->
    @queue = []
    @chatsender = new ChatSender @cui

  push: (text)->
    @queue.push text

  shift: ->
    # console.debug @queue.length
    text = @queue.shift()
    @chatsender.send(text) if text?


do ->
  window.cui.destory() if window.cui?
  window.cui = new CounterUi
  window.cui.start()