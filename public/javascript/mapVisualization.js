(function() {
    'use strict';
    var svg = d3.select("svg");
    var width = +svg.attr("width");
    var height = +svg.attr("height");
	var statisticName = "Test Statistic";

    var mobilityStatistics = d3.map();

    var path = d3.geoPath();

	var x = d3.scaleLinear()
		.domain([1, 10])
		.rangeRound([600, 860]);

	var color = d3.scaleThreshold()
		.domain(d3.range(2, 10))
		.range(d3.schemeBlues[9]);

	var g = svg.append("g")
		.attr("class", "key")
		.attr("transform", "translate(0,40)");

	g.selectAll("rect")
	  .data(color.range().map(function(d) {
		  d = color.invertExtent(d);
		  if (d[0] == null) d[0] = x.domain()[0];
		  if (d[1] == null) d[1] = x.domain()[1];
		  return d;
		}))
	  .enter().append("rect")
		.attr("height", 8)
		.attr("x", function(d) { return x(d[0]); })
		.attr("width", function(d) { return x(d[1]) - x(d[0]); })
		.attr("fill", function(d) { return color(d[0]); });

	g.append("text")
		.attr("class", "caption")
		.attr("x", x.range()[0])
		.attr("y", -6)
		.attr("fill", "#000")
		.attr("text-anchor", "start")
		.attr("font-weight", "bold")
		.text(statisticName);

	g.call(d3.axisBottom(x)
		.tickSize(13)
		.tickFormat(function(x, i) { return i ? x : x + "%"; })
		.tickValues(color.domain()))
	  .select(".domain")
		.remove();

	d3.queue()
		.defer(d3.json, "https://d3js.org/us-10m.v1.json")
		.await(ready);

	function ready(error, us) {
	  if (error) throw error;

	  svg.append("g")
		  .attr("class", "counties")
		.selectAll("path")
		.data(topojson.feature(us, us.objects.counties).features)
		.enter().append("path")
		  .attr("fill", function(d) { return color(d.rate = 5); })
		  .attr("d", path)
		.append("title")
		  .text(function(d) { return d.rate + "%"; });

	  svg.append("g")
		  .attr("class", "states")
		.selectAll("path")
		.data(topojson.feature(us, us.objects.states).features)
		.enter().append("path")
		  .attr("d", path)
	}
}())
