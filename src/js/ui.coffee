class CounterUi
  SCAN_PERIOD: 500
  SEND_PERIOD: 8000
  SAVE_PERIOD: 30000
  # SAVE_PERIOD: 5000
  STATUS_SAVE_PERIOD: 30000
  # STATUS_SAVE_PERIOD: 5000

  # 鱼丸答谢响应时间
  YUWAN_TNANKS_DELAY: 4000
  # 调试模式，true 时不会发送聊天
  DEBUG_MODE: false 

  constructor: ->
    @chatlist = new ChatList
    @yuwan_stack = new YuwanStack @
    @chat_queue = new ChatQueue @
    @save_queue = new SaveQueue @


  # 销毁实例，并停止所有工作进程计时器
  destory: ->
    @chatlist = null
    clearInterval @scan_timer
    clearInterval @send_timer
    clearInterval @save_timer
    clearInterval @status_save_timer


  # 启动工作进程
  # 有两个工作进程，一个扫描进程，一个发言进程
  # 扫描进程每 0.5 秒运行一次
  # 发言进程每 2 秒运行一次
  start: ->
    @scan_timer = setInterval =>
      @_scan()
    , @SCAN_PERIOD

    @send_timer = setInterval =>
      @chat_queue.shift()
    , @SEND_PERIOD

    @save_timer = setInterval =>
      @save_queue.release()
    , @SAVE_PERIOD

    @status_save_timer = setInterval =>
      follow_count = jQuery('#followtit').text().replace(',', '') # 关注人气
      online_number = jQuery('#ol_num').text().replace(',', '') # 在线人数

      console.debug "关注数：" + follow_count, "在线数：" + online_number

      if not @room_id?
        @room_id = jQuery('input[name=room_id]').val()

      # console.debug "即将保存 #{@queue.length} 条记录"
      jQuery.ajax
        type: 'POST'
        url: 'http://yuwan.4ye.me/api/room_status'
        data:
          room_status: {
            room_id: @room_id
            follow_count: follow_count
            online_number: online_number
            time: new Date().getTime()
          }
        success: (res)->
          console.debug '聊天室状态保存成功'

    , @STATUS_SAVE_PERIOD


  # 扫描聊天信息，并进行相应处理
  _scan: ->
    chatlines = @chatlist.updated_lines()

    # 鱼丸答谢
    yuwan_lines = (line for line in chatlines when line.kind is 'yuwan')
    @_thanks yuwan_lines

    # 酬勤答谢
    chouqin_lines = (line for line in chatlines when line.kind is 'chouqin')
    @_thanks_choutin chouqin_lines

    # 持久化聊天保存
    for line in chatlines
      data = line.get_save_data()
      @save_queue.push data if data?



  # 鱼丸答谢
  _thanks: (yuwan_lines)->
    # 获取新增的鱼丸投喂记录，加入堆栈
    @yuwan_stack
      .push yuwan_lines
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
        _levels = {
          user1:  '菜鸟'
          user2:  '黄铜五'
          user3:  '黄铜四'
          user4:  '黄铜三'
          user5:  '黄铜二'
          user6:  '黄铜一'
          user7:  '白银五'
          user8:  '白银四'
          user9:  '白银三'
          user10: '白银二'
          user11: '白银一'
          user12: '黄金五'
          user13: '黄金四'
          user14: '黄金三'
          user15: '黄金二'
          user16: '黄金一'
          user17: '铂金五'
          user18: '铂金四'
          user19: '铂金三'
          user20: '铂金二'
          user21: '铂金一'
          user22: '钻石五'
          user23: '钻石四'
          user24: '钻石三'
          user25: '钻石二'
          user26: '钻石一'
        }

        if data.end_userlevel != data.begin_userlevel
          # console.debug data
          _level = _levels[data.end_userlevel]
          _text1 = "！！恭喜 #{username} 渡劫到#{_level}！"
          @chat_queue.push _text1

  # 酬勤答谢
  _thanks_choutin: (chouqin_lines)->
    for line in chouqin_lines
      _text = "感谢 #{line.username} 赠送的#{line.chouqinlevel}酬勤！"
      @chat_queue.push _text


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

# 当前用户“我”说的话
# <li class="jschartli">
#   <p class="my_cont">
#     <span><img src="http://staticlive.douyutv.com/common/douyu/images/roomadmin.gif?20140704"></span>
#     <span class="name">
#       <a href="#" class="nick js_nick" rel="1331302" gid="1">我:</a>
#     </span>
#     <span class="m" chatid="4e7113263f3e41f57651000000000000">感谢&nbsp;ft303ft&nbsp;送来的200个鱼丸！!</span>
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

# 赠送特殊鱼丸
# <li class="jschartli">
#   <p class="text_cont">
#     <img src="http://staticlive.douyutv.com/common/douyu/images/classimg/user2.png">
#       <a href="#" class="nick js_nick" rel="10021060">mawenzhe7</a>
#       <br>赠送给主播
#       <i><img src="http://staticlive.douyutv.com/common/douyu/images/zs520.png?v3979.1">
#       </i>个鱼丸
#       <img src="http://staticlive.douyutv.com/common/douyu/images/yw520.png?20150430">
#   </p>
# </li>

# 赠送酬勤
# <li class="jschartli counted aaa">
#   <p class="text_cont">
#     <img src="http://staticlive.douyutv.com/common/douyu/images/classimg/user7.png">
#     <a href="#" class="nick" rel="939651">泣血剑殇</a> 
#     赠送了高级酬勤
#     <img src="http://staticlive.douyutv.com/common/douyu/images/cq3.gif?">
#     成为了本房间
#     <span>
#     <img src="http://staticlive.douyutv.com/common/douyu/images/no3.gif?">
#     </span>会员
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
      @userlevel = @$li.find('img').attr('src').split('classimg/')[1].split('.gif')[0]

    else if @raw.indexOf('被管理员') > -1 and @raw.indexOf('禁言') > -1
      @kind = 'forbid'
      @username = @raw.split('被管理员')[0].split('系统广播: ')[1]
      @manager = @raw.split('被管理员')[1].split('禁言')[0]

    else if @raw.indexOf('赠送给主播') > -1
      @kind = 'yuwan'
      @username = @$li.find('.nick').text()
      @userlevel = @$li.find('img').attr('src').split('classimg/')[1].split('.gif')[0]

      # 这里要分情况，特殊赠送的话是图片
      if @$li.find('i img').length > 0
        src = @$li.find('i img').attr('src')
        match = src.match /zs([0-9]+)/
        @count = parseInt(match[1]) if match
      else
        @count = parseInt @$li.find('i').text()

    else if @raw.indexOf('酬勤') > -1
      @kind = 'chouqin'
      @username = @$li.find('.nick').text()
      @chouqinlevel = @raw.match(/赠送了(.+)酬勤/)[1]

  # 标记为已经统计
  mark_counted: ->
    @$li.addClass('counted')

  # 整理为适合网络保存的结构
  get_save_data: ->
    re = switch @kind
      when 'chat'
        {
          username: @username
          text: @chat
        }
      when 'welcome'
        {
          username: @username
          userlevel: @userlevel
        }
      when 'forbid'
        {
          username: @username
          manager: @manager
        }
      when 'yuwan'
        {
          username: @username
          userlevel: @userlevel
        }

    return if not re?

    # re.room_id = $ROOM.room_id # 斗鱼房间ID
    re.room_id = jQuery('input[name=room_id]').val()
    re.talk_time = new Date().getTime()
    re.chat_type = @kind
    return re



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
      @data[username].count += line.count
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



# 持久化保存队列，攒一批存一批
class SaveQueue
  constructor: (@cui)->
    @queue = []

  push: (data)->
    @queue.push data

  release: ->
    return if @queue.length is 0

    # console.debug "即将保存 #{@queue.length} 条记录"
    jQuery.ajax
      type: 'POST'
      url: 'http://yuwan.4ye.me/api/chat_lines'
      data:
        chat_lines: @queue
      success: (res)->
        console.debug '聊天信息保存成功'

    @queue = []



do ->
  window.cui.destory() if window.cui?
  window.cui = new CounterUi
  window.cui.start()