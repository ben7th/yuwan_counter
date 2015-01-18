class CounterUi
  constructor: ->
    @chatlist = new ChatList

  destory: ->
    @chatlist = null

class ChatList
  constructor: ->
    @$elm = jQuery 'ul#chat_line_list'

  # 获取当前页面内所有对话行
  lines: (kind = 'all')->
    lines = for li in @$elm.find('li.jschartli')
      new ChatLine jQuery(li)

    switch kind
      when 'all'
        return lines
      else
        return (line for line in lines when line.kind is kind)


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

    if @raw.indexOf('系统提示：欢迎') > -1
      @kind = 'welcome'
      @username = @raw.split(' ')[2]
      @userlevel = @$li.find('img').attr('src').split('classimg/')[1].split('.png')[0]

    if @raw.indexOf('被管理员') > -1 and @raw.indexOf('禁言') > -1
      @kind = 'forbid'
      @username = @raw.split('被管理员')[0].split('系统广播: ')[1]
      @manager = @raw.split('被管理员')[1].split('禁言')[0]

    if @raw.indexOf('赠送给主播') > -1
      @kind = 'yuwan'
      @username = @$li.find('.nick').text()
      @count = 100

do ->
  window.cui.destory() if window.cui?
  window.cui = new CounterUi