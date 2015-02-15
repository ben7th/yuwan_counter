if not console.debug?
  console.debug = -> {}

jQuery ->
  new ChatlinesGraph({
    elm: jQuery('.page-stat.chatlines .graph')
    api_url: 'http://yuwan.4ye.me/api/chat_lines/stat'
    room_id: 54779
  }).request()

  new YuwanGivingGraph({
    elm: jQuery('.page-stat.yuwan-giving .graph')
    api_url: 'http://yuwan.4ye.me/api/chat_lines/username_yuwan_stat'
    room_id: 54779
  }).request()