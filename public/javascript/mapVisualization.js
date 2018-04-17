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

    var calculateStateBounds = function(points) {
        var minHeight = points[0][0][0][1];
        var maxHeight = points[0][0][0][1];
        var minWidth = points[0][0][0][0];
        var maxWidth = points[0][0][0][0];
        for (var i = 0; i < points.length; i++) {
            for (var j = 0; j < points[i].length; j++) {
                for (var k = 1; k < points[i][j].length; k++) {
                    minHeight = Math.min(minHeight, points[i][j][k][1])
                    maxHeight = Math.max(maxHeight, points[i][j][k][1])
                    minWidth = Math.min(minWidth, points[i][j][k][0])
                    maxWidth = Math.max(maxWidth, points[i][j][k][0])
                }
            }
        }
        return {
            minHeight,
            maxHeight,
            minWidth,
            maxWidth
        }
    }

    var calculateCenter = function(points) {
        var stateBounds = calculateStateBounds(points);

        return [(stateBounds.maxWidth + stateBounds.minWidth) / 2, (stateBounds.maxHeight + stateBounds.minHeight) / 2]
    }

    var stateScaleHeight = function(points) {
        var stateBounds = calculateStateBounds(points);
        var heightDifference = stateBounds.maxHeight - stateBounds.minHeight
        var widthDifference = stateBounds.maxWidth - stateBounds.minWidth

        return Math.min(960 / widthDifference, 600 / heightDifference) * .9
    }

    var zoomIntoState = function(d, svg) {
        console.log(d)
        var width = +svg.attr("width");
        var height = +svg.attr("height");
        var selection = svg.select('#path' + d.id);
        var centerCoords = calculateCenter(d.geometry.coordinates)
        d3.zoom().translateTo(selection, centerCoords[0], centerCoords[1]);
        d3.zoom().scaleBy(selection, stateScaleHeight(d.geometry.coordinates));
        svg.transition().duration(750).attr('transform', d3.zoomTransform(selection.node()));
    }

    var resetTransform = function(d, svg) {
        var selection = svg.select('#path' + d.id);
        d3.zoom().translateTo(selection, 480, 300);
        d3.zoom().scaleBy(selection, 1 / stateScaleHeight(d.geometry.coordinates));
    }

    var zoomOut = function(d, svg) {
        resetTransform(d, svg)
        var selection = svg.select('#path' + d.id);
        svg.transition().duration(750).attr('transform', d3.zoomTransform(selection.node()));
    }

    var renderUSOnSVG = function(geographyData, color) {
        var svg = d3.select("#map-container");
        var path = d3.geoPath();
        var currentZoomedInState

        svg.append("g")
            .attr("class", "states")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(geographyData, geographyData.objects.states).features)
            .enter().append("path")
                .attr("fill", function(d) { return color(8); })
                .attr("d", path)
                .attr("id", function(d) { return "path" + d.id; })
                .on('click', function(d) {
                    if (!currentZoomedInState || currentZoomedInState.id !== d.id) {
                        if (currentZoomedInState) {
                            resetTransform(currentZoomedInState, svg)
                        }
                        zoomIntoState(d, svg)
                        currentZoomedInState = d;
                    } else {
                        zoomOut(d, svg);
                        currentZoomedInState = null
                    }
                })
            .append("title")
                .text(function(d) { return d.rate + "%"; });

        // svg.append("g")
            // .attr("class", "states")
            // .attr("id", "states")
            // .selectAll("path")
            // .data(topojson.feature(geographyData, geographyData.objects.states).features)
            // .enter().append("path")
                // .attr("d", path)
                // .attr("id", function(d) { return "path" + d.id; })
    };

    var requestUSTopoJSON = function(callback) {
        d3.queue()
            .defer(d3.json, "https://d3js.org/us-10m.v1.json")
            .await(callback);
    };

    var resetSVG = function() {
        var svg = d3.select("#map-container");
        svg.html("");
    }

    // var setZoomable = function() {
        // var realSvg = d3.select("svg");
        // var svg = d3.select("#map-container");
        // // realSvg.call(d3.zoom().on('zoom', function() {
            // // svg.attr('transform', d3.event.transform);
        // // }));
        // var states = d3.select('#states path');
        // states.on('click', function(d) {
            // d3.zoom().translateTo(d, 500, 500);
        // })
    // }

    return  {
        requestUSTopoJSON,
        renderUSOnSVG,
        renderKeyOnSVG,
        resetSVG,
    };

}())
