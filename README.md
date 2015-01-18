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

## 斗鱼用户等级标识

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