(function() {
  var ChatlinesGraph, DataFilter;

  DataFilter = (function() {
    function DataFilter() {}

    DataFilter.from_response = function(res) {
      var k, v;
      switch (res.by) {
        case 'hour':
          return (function() {
            var _ref, _results;
            _ref = res.data;
            _results = [];
            for (k in _ref) {
              v = _ref[k];
              _results.push({
                'date': new Date(k),
                'count': v
              });
            }
            return _results;
          })();
        case 'minute':
          return (function() {
            var _ref, _results;
            _ref = res.data;
            _results = [];
            for (k in _ref) {
              v = _ref[k];
              _results.push({
                'date': new Date(k),
                'count': v
              });
            }
            return _results;
          })();
      }
    };

    return DataFilter;

  })();

  window.ChatlinesGraph = ChatlinesGraph = (function() {
    function ChatlinesGraph(options) {
      this.$graph = options.elm;
      this.api_url = options.api_url;
      this.room_id = options.room_id;
      this.graph_width = this.$graph.width();
      this.graph_height = this.$graph.height();
      this.init();
    }

    ChatlinesGraph.prototype.init = function() {
      jQuery(window).on('resize', (function(_this) {
        return function() {
          return _this.resize();
        };
      })(this));
      this.axis_height = 25;
      return this.axis_margin = 5;
    };

    ChatlinesGraph.prototype.resize = function() {
      var new_graph_height, new_graph_width;
      new_graph_width = this.$graph.width();
      new_graph_height = this.$graph.height();
      if (new_graph_width !== this.graph_width || new_graph_height !== this.graph_height) {
        console.debug('graph: resize');
        this.graph_width = new_graph_width;
        this.graph_height = new_graph_height;
        this.$graph.find('svg').remove();
        return this.render(this.dataset);
      }
    };

    ChatlinesGraph.prototype.render = function(dataset) {
      var axis_date_format, axis_scale, color_scale, data_length, first_date, height_scale, height_without_axis, last_date, line, max, rect_width, svg, tip, x_scale, xaxis, y_scale;
      this.dataset = dataset;
      max = d3.max(dataset.map(function(data) {
        return data.count;
      }));
      data_length = dataset.length;
      rect_width = this.graph_width / data_length;
      height_without_axis = this.graph_height - this.axis_height - this.axis_margin;
      height_scale = d3.scale.linear().domain([0, max]).range([0, height_without_axis]);
      x_scale = d3.scale.linear().domain([0, data_length]).range([0, this.graph_width]);
      y_scale = d3.scale.linear().domain([0, max]).range([height_without_axis, 20]);
      color_scale = d3.scale.linear().domain([0, max]).range(['#bbf', '#44f']);
      first_date = dataset[0].date;
      last_date = d3.time.hour.offset(dataset[dataset.length - 1].date, 1);
      axis_scale = d3.time.scale().domain([first_date, last_date]).range([0, this.graph_width]);
      axis_date_format = d3.time.format('%H:%M');
      tip = d3.tip().attr({
        'class': 'bar-tip'
      }).offset([-10, 0]).html(function(data) {
        var date0, date1;
        date0 = data.date;
        date1 = d3.time.hour.offset(date0, 1);
        return "<div class='time'>\n  <span>时段:</span>\n  <span class='time-text'>" + (axis_date_format(date0)) + " - " + (axis_date_format(date1)) + "</span>\n</div>\n<div class='count'>\n  <span>聊天数:</span>\n  <span class='count-text'>" + data.count + "</span>\n</div>";
      });
      svg = d3.select(this.$graph[0]).append('svg').attr({
        'width': this.graph_width,
        'height': this.graph_height
      }).call(tip);
      xaxis = d3.svg.axis().scale(axis_scale).orient('bottom').tickFormat(axis_date_format);
      svg.append('g').call(xaxis).attr({
        'class': 'axis',
        'transform': (function(_this) {
          return function() {
            var offset;
            offset = rect_width / 2;
            return "translate(" + offset + ", " + (_this.graph_height - _this.axis_height) + ")";
          };
        })(this)
      });
      line = d3.svg.line().x(function(data, idx) {
        return x_scale(idx + 0.5);
      }).y(function(data, idx) {
        return y_scale(data.count);
      });
      svg.append('path').datum(dataset).attr({
        'class': 'polyline',
        'd': line
      });
      return svg.selectAll('circle.point').data(dataset).enter().append('circle').attr({
        'class': 'point',
        'cx': function(data, idx) {
          return x_scale(idx + 0.5);
        },
        'cy': function(data, idx) {
          return y_scale(data.count);
        },
        'r': function() {
          return 2;
        }
      }).on({
        'mouseover': tip.show,
        'mouseout': tip.hide
      });
    };

    ChatlinesGraph.prototype.request = function() {
      return jQuery.ajax({
        type: 'GET',
        url: this.api_url,
        data: {
          "for": 'chat',
          room_id: this.room_id,
          by: 'hour',
          start: '2015-02-12 00:',
          end: '2015-02-16 00:'
        },
        success: (function(_this) {
          return function(res) {
            var dataset;
            dataset = DataFilter.from_response(res);
            return _this.render(dataset);
          };
        })(this)
      });
    };

    return ChatlinesGraph;

  })();

}).call(this);
