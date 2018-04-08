var mapVisualization = (function() {
    'use strict';

    var renderKeyOnSVG = function(statisticName, color) {
        var svg = d3.select("svg");
        var width = +svg.attr("width");
        var height = +svg.attr("height");
        var x = d3.scaleLinear()
            .domain([1, 10])
            .rangeRound([600, 860]);

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
    };

    var renderMapOnSVG = function(topoJSON, color) {
        var svg = d3.select("svg");
        var width = +svg.attr("width");
        var height = +svg.attr("height");
        var path = d3.geoPath();

        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(topoJSON, topoJSON.objects.counties).features)
            .enter().append("path")
                .attr("fill", function(d) { return color(d.rate = 8); })
                .attr("d", path)
            .append("title")
                .text(function(d) { return d.rate + "%"; });

        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(topoJSON, topoJSON.objects.states).features)
            .enter().append("path")
                .attr("d", path)
    };

    var requestUSTopoJSON = function(callback) {
        d3.queue()
            .defer(d3.json, "https://d3js.org/us-10m.v1.json")
            .await(callback);
    };

    var resetSVG = function() {
        var svg = d3.select("svg");
        svg.html("");
    }

    return  {
        requestUSTopoJSON,
        renderMapOnSVG,
        renderKeyOnSVG,
        resetSVG
    };

}())
