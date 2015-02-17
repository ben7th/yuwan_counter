class DataFilter
  @from_response: (res)->
    switch res.by
      when 'hour'
        for k, v of res.data
          {
            date: new Date k
            users: v
            sum: d3.sum (v1 for k1, v1 of v)
          }
      when 'minute'
        for k, v of res.data
          {
            date: new Date k
            users: v
            sum: d3.sum (v1 for k1, v1 of v)
          }


window.YuwanGivingGraph = class YuwanGivingGraph
  constructor: (options)->
    @$graph = options.elm
    @api_url = options.api_url
    @room_id = options.room_id

    @graph_width = @$graph.width()
    @graph_height = @$graph.height()

    @init()

  init: ->
    jQuery(window).on 'resize', => @resize()
    @axis_height = 25
    @axis_margin = 5

  resize: ->
    new_graph_width = @$graph.width()
    new_graph_height = @$graph.height()

    if new_graph_width != @graph_width or new_graph_height != @graph_height
      console.debug 'graph: resize'
      @graph_width = new_graph_width
      @graph_height = new_graph_height
      @$graph.find('svg').remove()
      @render(@dataset)

  render: (dataset)->
    @dataset = dataset
    data_length = dataset.length
    height_without_axis = @graph_height - @axis_height - @axis_margin
    max = d3.max dataset.map (data)-> data.sum
    rect_width = @graph_width / data_length

    x_scale = d3.scale.linear()
      .domain [0, data_length]
      .range [0, @graph_width]

    y_scale = d3.scale.linear()
      .domain [0, max]
      .range [height_without_axis, 0]

    height_scale = d3.scale.linear()
      .domain [0, max]
      .range [0, height_without_axis]

    color_scale = d3.scale.linear()
      .domain [0, max]
      .range ['#99D7E2', '#25807F']

    first_date = dataset[0].date
    last_date = d3.time.hour.offset(dataset[dataset.length - 1].date, 1)
    axis_scale = d3.time.scale()
      .domain [first_date, last_date]
      .range [0, @graph_width]
    axis_date_format = d3.time.format('%H:%M')

    # 增加提示
    tip = d3.tip()
      .attr
        'class': 'bar-tip'
      .offset [-10, 0]
      .html (data)->
        date0 = data.date
        date1 = d3.time.hour.offset(date0, 1)
        """
          <div class='time'>
            <span>时段:</span>
            <span class='time-text'>#{axis_date_format date0} - #{axis_date_format date1}</span>
          </div>
          <div class='count'>
            <span>鱼丸数:</span>
            <span class='count-text'>#{data.sum}</span>
          </div>
        """

    # 放置 svg
    svg = d3.select @$graph[0]
      .append('svg')
      .attr
        'width': @graph_width
        'height': @graph_height
      .call tip

    # 绘制矩形
    svg.selectAll('rect.bar')
      .data dataset
      .enter()
      .append 'rect'
      .attr
        'class': 'bar'
        'x': (data, idx)->
          x_scale(idx)
        'y': (data, idx)->
          y_scale(data.sum)
        'width': ->
          rect_width - 1
        'height': (data, idx)->
          height_scale(data.sum)
        'fill': (data)->
          color_scale(data.sum)
      .on
        'mouseover': tip.show
        'mouseout': tip.hide

    # 绘制数轴
    xaxis = d3.svg.axis()
      .scale axis_scale
      .orient 'bottom'
      .tickFormat axis_date_format

    svg.append('g')
      .call xaxis
      .attr
        'class': 'axis'
        'transform': =>
          offset = rect_width / 2
          "translate(#{offset}, #{@graph_height - @axis_height})"

  request: ->
    jQuery.ajax
      type: 'GET'
      url: @api_url
      data:
        room_id: @room_id
        by: 'hour'
        start: '2015-02-12 00:'
        end: '2015-02-16 00:'
      success: (res)=>
        # console.debug res
        dataset = DataFilter.from_response res
        # console.debug dataset
        @render dataset