(function() {
  var DataFilter, YuwanGivingGraph;

  DataFilter = (function() {
    function DataFilter() {}

    DataFilter.from_response = function(res) {
      var k, k1, v, v1, _ref, _ref1, _results, _results1;
      switch (res.by) {
        case 'hour':
          _ref = res.data;
          _results = [];
          for (k in _ref) {
            v = _ref[k];
            _results.push({
              date: new Date(k),
              users: v,
              sum: d3.sum((function() {
                var _results1;
                _results1 = [];
                for (k1 in v) {
                  v1 = v[k1];
                  _results1.push(v1);
                }
                return _results1;
              })())
            });
          }
          return _results;
          break;
        case 'minute':
          _ref1 = res.data;
          _results1 = [];
          for (k in _ref1) {
            v = _ref1[k];
            _results1.push({
              date: new Date(k),
              users: v,
              sum: d3.sum((function() {
                var _results2;
                _results2 = [];
                for (k1 in v) {
                  v1 = v[k1];
                  _results2.push(v1);
                }
                return _results2;
              })())
            });
          }
          return _results1;
      }
    };

    return DataFilter;

  })();

  window.YuwanGivingGraph = YuwanGivingGraph = (function() {
    function YuwanGivingGraph(options) {
      this.$graph = options.elm;
      this.api_url = options.api_url;
      this.room_id = options.room_id;
      this.graph_width = this.$graph.width();
      this.graph_height = this.$graph.height();
      this.init();
    }

    YuwanGivingGraph.prototype.init = function() {
      jQuery(window).on('resize', (function(_this) {
        return function() {
          return _this.resize();
        };
      })(this));
      this.axis_height = 25;
      return this.axis_margin = 5;
    };

    YuwanGivingGraph.prototype.resize = function() {
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

    YuwanGivingGraph.prototype.render = function(dataset) {
      var axis_date_format, axis_scale, color_scale, data_length, first_date, height_scale, height_without_axis, last_date, max, rect_width, svg, tip, x_scale, xaxis, y_scale;
      this.dataset = dataset;
      data_length = dataset.length;
      height_without_axis = this.graph_height - this.axis_height - this.axis_margin;
      max = d3.max(dataset.map(function(data) {
        return data.sum;
      }));
      rect_width = this.graph_width / data_length;
      x_scale = d3.scale.linear().domain([0, data_length]).range([0, this.graph_width]);
      y_scale = d3.scale.linear().domain([0, max]).range([height_without_axis, 0]);
      height_scale = d3.scale.linear().domain([0, max]).range([0, height_without_axis]);
      color_scale = d3.scale.linear().domain([0, max]).range(['#99D7E2', '#25807F']);
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
        return "<div class='time'>\n  <span>时段:</span>\n  <span class='time-text'>" + (axis_date_format(date0)) + " - " + (axis_date_format(date1)) + "</span>\n</div>\n<div class='count'>\n  <span>鱼丸数:</span>\n  <span class='count-text'>" + data.sum + "</span>\n</div>";
      });
      svg = d3.select(this.$graph[0]).append('svg').attr({
        'width': this.graph_width,
        'height': this.graph_height
      }).call(tip);
      svg.selectAll('rect.bar').data(dataset).enter().append('rect').attr({
        'class': 'bar',
        'x': function(data, idx) {
          return x_scale(idx);
        },
        'y': function(data, idx) {
          return y_scale(data.sum);
        },
        'width': function() {
          return rect_width - 1;
        },
        'height': function(data, idx) {
          return height_scale(data.sum);
        },
        'fill': function(data) {
          return color_scale(data.sum);
        }
      }).on({
        'mouseover': tip.show,
        'mouseout': tip.hide
      });
      xaxis = d3.svg.axis().scale(axis_scale).orient('bottom').tickFormat(axis_date_format);
      return svg.append('g').call(xaxis).attr({
        'class': 'axis',
        'transform': (function(_this) {
          return function() {
            var offset;
            offset = rect_width / 2;
            return "translate(" + offset + ", " + (_this.graph_height - _this.axis_height) + ")";
          };
        })(this)
      });
    };

    YuwanGivingGraph.prototype.request = function() {
      return jQuery.ajax({
        type: 'GET',
        url: this.api_url,
        data: {
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

    return YuwanGivingGraph;

  })();

}).call(this);
