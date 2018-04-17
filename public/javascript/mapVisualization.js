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

    var centroid = function(points) {
        // var averageX = 0;
        // var averageY = 0;
        // for (var i = 0; i < points.length; i++) {
            // averageX += points[i][0] / points.length;
            // averageY += points[i][1] / points.length;
        // }
        // return [averageX, averageY]
        var minHeight = points[0][1];
        var maxHeight = points[0][1];
        var minWidth = points[0][0];
        var maxWidth = points[0][0];
        for (var i = 1; i < points.length; i++) {
            minHeight = Math.min(minHeight, points[i][1])
            maxHeight = Math.max(maxHeight, points[i][1])
            minWidth = Math.min(minWidth, points[i][0])
            maxWidth = Math.max(maxWidth, points[i][0])
        }
        var heightDifference = maxHeight - minHeight
        var widthDifference = maxWidth - minWidth

        return [(maxWidth + minWidth) / 2, (maxHeight + minHeight) / 2]
    }

    var stateScaleHeight = function(points) {
        var minHeight = points[0][1];
        var maxHeight = points[0][1];
        var minWidth = points[0][0];
        var maxWidth = points[0][0];
        for (var i = 1; i < points.length; i++) {
            minHeight = Math.min(minHeight, points[i][1])
            maxHeight = Math.max(maxHeight, points[i][1])
            minWidth = Math.min(minWidth, points[i][0])
            maxWidth = Math.max(maxWidth, points[i][0])
        }
        var heightDifference = maxHeight - minHeight
        var widthDifference = maxWidth - minWidth

        return Math.min(960 / widthDifference, 600 / heightDifference) * .9
    }

    var zoomIntoState = function(d, svg) {
        console.log(d)
        var width = +svg.attr("width");
        var height = +svg.attr("height");
        var selection = svg.select('#path' + d.id);
        var x = d.geometry.coordinates[0][0][0][0]
        var y = d.geometry.coordinates[0][0][0][1]
        var centroidCoords = centroid(d.geometry.coordinates[0][0])
        d3.zoom().translateTo(selection, centroidCoords[0], centroidCoords[1]);
        d3.zoom().scaleBy(selection, stateScaleHeight(d.geometry.coordinates[0][0]));
        svg.transition().duration(750).attr('transform', d3.zoomTransform(selection.node()));
    }

    var zoomOut = function(d, svg) {
        var selection = svg.select('#path' + d.id);
        d3.zoom().translateTo(selection, 480, 300);
        d3.zoom().scaleBy(selection, 1 / stateScaleHeight(d.geometry.coordinates[0][0]));
        svg.transition().duration(750).attr('transform', d3.zoomTransform(selection.node()));
    }

    var renderUSOnSVG = function(geographyData, color) {
        var svg = d3.select("#map-container");
        var path = d3.geoPath();
        var currentZoomedInStateId

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
                    if (currentZoomedInStateId !== d.id) {
                        zoomIntoState(d, svg)
                        currentZoomedInStateId = d.id;
                    } else {
                        zoomOut(d, svg);
                        currentZoomedInStateId = null
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

    var setZoomable = function() {
        var realSvg = d3.select("svg");
        var svg = d3.select("#map-container");
        // realSvg.call(d3.zoom().on('zoom', function() {
            // svg.attr('transform', d3.event.transform);
        // }));
        var states = d3.select('#states path');
        states.on('click', function(d) {
            console.log('heyyyy')
            d3.zoom().translateTo(d, 500, 500);
        })
    }

    return  {
        requestUSTopoJSON,
        renderUSOnSVG,
        renderKeyOnSVG,
        resetSVG,
        setZoomable
    };

}())
