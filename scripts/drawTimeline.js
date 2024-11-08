$(document).ready(function() {

    var $this = $('#timelinechart');
    var width = $this.data("width");
    var height = $this.data("height");
    var config = $this.data("config");
    var {gutter} = config;
    var now = Date.now();

    var data = [
      {
        "label": "Resource A",
        "times": [{"text": "", "start_time": Date.parse('2020-01-14T15:20:00Z'), "end_time": Date.parse('2020-05-30T03:59:00Z')}]
      },
      {
        "label": "Resource B",
        "times": [{"text": "", "start_time": Date.parse('2020-01-21T15:20:00Z'), "end_time": Date.parse('2020-06-05T03:59:00Z')}]
      },
      {
        "label": "Resource C",
        "times": [{"text": "", "start_time": Date.parse('2020-03-28T15:20:00Z'), "end_time": Date.parse('2020-06-12T03:59:00Z')}]
      },
      {
        "label": "Resource D",
        "times": [{"text": "", "start_time": Date.parse('2020-01-21T15:20:00Z'), "end_time": Date.parse('2020-06-05T03:59:00Z')}]
      },
      {
        "label": "Resource E",
        "times": [{"text": "", "start_time": Date.parse('2020-01-14T15:20:00Z'), "end_time": Date.parse('2020-05-30T03:59:00Z')}]
      },
      {
        "label": "Resource F",
        "times": [{"text": "", "start_time": Date.parse('2020-03-28T15:20:00Z'), "end_time": Date.parse('2020-06-12T03:59:00Z')}]
      },
      {
        "label": "Resource G",
        "times": [{"text": "", "start_time": Date.parse('2020-01-14T15:20:00Z'), "end_time": Date.parse('2020-05-30T03:59:00Z')}]
      },
      {
        "label": "Resource H",
        "times": [{"text": "", "start_time": Date.parse('2020-03-14T15:20:00Z'), "end_time": Date.parse('2020-07-27T03:59:00Z')}]
      },
      {
        "label": "Resource I",
        "times": [{"text": "", "start_time": Date.parse('2021-01-14T15:20:00Z'), "end_time": Date.parse('2021-05-30T03:59:00Z')}]
      },
      {
        "label": "Resource J",
        "times": [{"text": "", "start_time": Date.parse('2021-01-15T15:20:00Z'), "end_time": Date.parse('2021-05-30T03:59:00Z')}]
      }
    ];

    var lanes = [];
    var times = [];
  
    $.each(data, function(index, value) {
      lanes.push(value.label);
      $.each(value.times, function(_, v) {v["lane"] = index;});
      times.push(value.times);
    });

    var items = times.flat(1);
    $.each(items, function(i, v) {
        v.id = i;
      });

    var timeBegin = d3.min(items, function(d) { return d["start_time"]; });
    var timeEnd = d3.max(items, function(d) { return d["end_time"]; });

    var m = [25, 80, 15, 105];
    var w = width - m[1] - m[3];
    var h = height - m[0] - m[2];
    var miniHeight = 50;
    var mainHeight = h - miniHeight - 50;

    var x =  d3.scaleTime().range([0, w]).domain([timeBegin, timeEnd]);
    var xTop = d3.scaleTime().range([0, w]).domain([timeBegin, timeEnd]);
    var x1 = d3.scaleLinear().range([0, w]);
    var y1 = d3.scaleLinear().range([0, mainHeight]).domain([0, lanes.length]);

    var xAxis = d3.axisBottom(x).ticks(d3.timeMonth).tickFormat(d => d3.timeFormat("%Y-%m")(d));
    var xAxisTop = d3.axisBottom(xTop).ticks(d3.timeMonth).tickFormat(d => d3.timeFormat("%Y-%m-%d")(d));

    var chartWidth = w + m[1] + m[3];
    var chartHeight = h + m[0] + m[2];

    var chart = d3.select($this[0])
      .append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")

    chart.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", w)
      .attr("height", mainHeight);

    var main = chart.append("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")")
      .attr("width", w)
      .attr("height", mainHeight)
      .attr("class", "main");

    var mini = chart.append("g")
      .attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0]) + ")")
      .attr("width", w)
      .attr("height", miniHeight)
      .attr("class", "mini");

    var gX = chart.append("g")
      .attr("class", "base axis")
      .attr("transform", "translate(" + m[3] + "," + (mainHeight + miniHeight) + ")")
      .call(xAxis);

    gX.selectAll('.tick text');

    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var gXTop = chart.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + m[3] + "," + 0 + ")")
      .attr("font-size", 20)
      .call(xAxisTop);

    main.append('svg:defs');

    main.append("g")
      .attr("class", "core-chart")
      .selectAll(".laneLines")
      .data(items)
      .enter().append("line")
      .attr("x1", 0)
      .attr("y1", function(d) {
        return y1(d.lane);
      })
      .attr("x2", w)
      .attr("y2", function(d) {
        return y1(d.lane);
      })
      .attr("stroke", "lightgray")

    main.append("g")
      .attr("class", "core-labels")
      .selectAll(".laneText")
      .data(lanes)
      .enter().append("text")
      .text(function(d) {
        return d;
      })
      .attr("x", (-m[1] + 10))
      .attr("y", function(d, i) {
        return y1(i + .5);
      })
      .attr("dy", ".5ex")
      .attr("text-anchor", "start")
      .attr("class", "laneText");

    var itemRects = main.append("g").attr("clip-path", "url(#clip)");
    var currentLine = main.append('line').attr('class', "currentLine").attr("clip-path", "url(#clip)");

    function brushed(e) {
        var timeSelection = e.selection.map(x.invert, x);
        var minExtent = timeSelection[0];
        var maxExtent = timeSelection[1];
        drawBrush(minExtent, maxExtent);
    };

    var brush = d3.brushX()
      .extent([
        [0, 0],
        [w, miniHeight]
      ])
      .on("brush", brushed);

    var gBrush = mini.append("g")
      .attr("class", "x brush")
      .call(brush)   
      .call(brush.move, x.range());

    function toDays(d) {
      d = d || 0;
      return d / 24 / 60 / 60 / 1000;
    }

    function toUTC(d) {
      if (!d || !d.getFullYear) return 0;
      return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function daysBetween(d1, d2) {
      return toDays(toUTC(d2) - toUTC(d1));
    }

    gBrush
      .transition(d3.transition().duration(750))
      .delay(500)
      .call(brush.move, [w * 0.2, w * 0.8]);

    function drawBrush(minExtent, maxExtent) {
        var visItems = items.filter(function(d) {
          return d.start_time < maxExtent && d.end_time > minExtent;
        });

        var toolTipDateFormat = d3.timeFormat("%Y-%m");
        var days = daysBetween(minExtent, maxExtent);

        var tFormat = "%Y-%m";
        var tTick = 'timeMonth';
        if (days < 40) {tFormat = "%Y-%m-%d"; tTick = 'timeWeek';}
        xAxisTop.ticks(d3[tTick]).tickFormat(d => d3.timeFormat(tFormat)(d));

        x1.domain([minExtent, maxExtent]);
        xTop.domain([minExtent, maxExtent]);
        gXTop.call(xAxisTop);

        currentLine.attr("x1", x1(now)).attr("x2", x1(now)).attr("y1", 0).attr("y2", mainHeight);

        //update main item rects
        var rects = itemRects.selectAll("rect")
            .data(visItems, function(d) {return d.id;})
            .attr("x", function(d) {return x1(d.start_time);})
            .attr("width", function(d) {return x1(d.end_time) - x1(d.start_time);});

        rects.enter().append("rect")
            .attr("class", function(d) {return "miniItem " + d.state;})
            .attr("x", function(d) {return x1(d.start_time);})
            .attr("y", function(d) {return y1(d.lane + gutter);})
            .attr("width", function(d) {return x1(d.end_time) - x1(d.start_time);})
            .attr("height", function(d) {return y1(1 - 2 * gutter);})
            .on("mouseover", function(e, d) {
              div.transition()
                .duration(200)
                .style("opacity", .9);
              div.html("Start Time " + toolTipDateFormat(d.start_time) + "<br>" + "End Time " + toolTipDateFormat(d.end_time))
                .style("left", (e.pageX) + "px")
                .style("top", (e.pageY - 28) + "px");
            })
           .on("mouseout", function() {div.transition().duration(500).style("opacity", 0);});

        rects.exit().remove();
    }

});