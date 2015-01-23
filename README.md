# yuwan_counter
斗鱼直播间统计工具，用于数鱼丸和统计发言数

## 原始脚本
http://markdown.4ye.me/ngVjqQkk/1

## 编译方法
工程使用 gulp 组织源代码和进行编译。

系统内需要安装 node.js
```
npm install -g gulp # 安装 gulp
npm install # 安装环境依赖
gulp watch # 启动编译进程
```
## 原理

在页面上不断扫描斗鱼直播间对话框的内容变化，来进行分析和统计。<br/>
当斗鱼网络不稳定，导致弹幕爆炸时，分析和统计可能会有不准的情况。

## API

```javascript
window.cui.chatlist.lines() // 返回所有对话行
window.cui.chatlist.lines('chat') // 返回所有一般对话行
window.cui.chatlist.lines('welcome') // 返回所有欢迎到访对话行
window.cui.chatlist.lines('forbid') // 返回所有禁言公告行
window.cui.chatlist.lines('yuwan') // 返回所有鱼丸赠送公告行
```

```javascript
window.cui.start() // 启动自动鱼丸答谢
```

## 目前的功能特性

### 鱼丸答谢

每当有人赠送鱼丸，过四秒钟之后，给出答谢信息。如果连续赠送，间隔小于四秒，则直到赠送完毕后才给出答谢信息。

2015.1.23增加：如果用户赠送鱼丸过程中升级，给出特别贺词“渡劫成功”

TODO：当赠送鱼丸较多时，考虑延长答谢响应时间，以防止一大批鱼丸被分成多次答谢。<br/>
TODO：根据鱼丸数目的不同，给出不同的答谢词<br/>

### TODO：其他计划开发的功能

- 发言统计
- 房管封禁统计
- 定时发言
- 惯用词统计
  - 统计“再问自杀”“我选择死亡”等常用语的出现次数和频度
- 分时段记录标称观众数和实际发言观众数，给出曲线对比

### Utils

TODO：把所有对话改为由先进先出队列管理，这样鱼丸答谢的逻辑就可以简化一些。也便于以后扩展其他发言类型。

-------------------

## 附：斗鱼用户等级标识

user1
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user1.png)

user2-user6
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user2.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user3.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user4.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user5.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user6.png)

user7-user11
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user7.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user8.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user9.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user10.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user11.png)

user12-user16
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user12.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user13.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user14.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user15.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user16.png)

user17-user21
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user17.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user18.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user19.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user20.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user21.png)

user22-user26
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user22.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user23.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user24.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user25.png)
![](http://staticlive.douyutv.com/common/douyu/images/classimg/user26.png)