var mapVisualization = (function() {
    'use strict';
    var currentZoomedInState

    var renderKeyOnSVG = function(statisticName, color) {
        var svg = d3.select("svg");
        var width = +svg.attr("width");
        var height = +svg.attr("height");
        var x = d3.scaleLinear()
            .domain([color.domain()[0], color.domain()[color.domain().length - 1]])
            .rangeRound([600, 860]);

        var g = d3.select('.key')

        g
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
            .tickFormat(function(x, i) { return x + "%"; })
            .tickValues(color.domain()))
            .select(".domain")
            .remove();
    };

    var calculateStateBounds = function(points) {
        // All of the for loops are needed because some states have multiple
        // closed shapes
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

        return [(stateBounds.maxWidth + stateBounds.minWidth) / 2,
            (stateBounds.maxHeight + stateBounds.minHeight) / 2]
    }

    var stateScaleHeight = function(points) {
        var stateBounds = calculateStateBounds(points);
        var heightDifference = stateBounds.maxHeight - stateBounds.minHeight
        var widthDifference = stateBounds.maxWidth - stateBounds.minWidth

        return Math.min(960 / widthDifference, 600 / heightDifference) * .9
    }

    var zoomIntoState = function(d, svg) {
        var width = +svg.attr("width");
        var height = +svg.attr("height");
        var selection = svg.select('#path' + d.id);
        var centerCoords = calculateCenter(d.geometry.coordinates)
        d.prevFill = selection.attr('fill')
        selection.attr("fill", 'none')
        d3.zoom().translateTo(selection, centerCoords[0], centerCoords[1]);
        d3.zoom().scaleBy(selection, stateScaleHeight(d.geometry.coordinates));
        svg.transition().duration(750).attr('transform', d3.zoomTransform(selection.node()));
    }

    var resetTransform = function(d, svg, color) {
        var selection = svg.select('#path' + d.id);
        selection.attr("fill", function(d) { return d.prevFill; })
        d3.zoom().translateTo(selection, 480, 300);
        d3.zoom().scaleBy(selection, 1 / stateScaleHeight(d.geometry.coordinates));
    }

    var zoomOut = function(d, svg) {
        resetTransform(d, svg)
        var selection = svg.select('#path' + d.id);
        svg.transition().duration(750).attr('transform', d3.zoomTransform(selection.node()));
    }

    var renderCountiesForStateOnSVG = function(stateId, geographyData, color, zoomOutCallback, countyDataFunction) {
        var svg = d3.select("#map-container");
        var counties = d3.select("#counties");
        var path = d3.geoPath();
        var countiesForState = topojson.feature(geographyData,
            geographyData.objects.counties).features.filter(function(county) {
                return county.id.startsWith(stateId)})
        counties
            .attr("class", "counties")
            .attr("id", "counties")
            .selectAll("path")
            .data(countiesForState)
            .enter().append("path")
                .attr("fill", function(d) { return color(countyDataFunction(d.id).value); })
                .attr("d", path)
                .attr("id", function(d) { return "path" + d.id; })
                .on('click', function() {
                    zoomOutCallback();
                })
            .append("title")
                .text(function(d) { return countyDataFunction(d.id).name + ": " + countyDataFunction(d.id).value + "%"; });
    }

    var renderUSOnSVG = function(geographyData, color, dataFunction, getCountyDataFunction) {
        var svg = d3.select("#map-container");
        var states = d3.select("#states");
        var path = d3.geoPath();
        currentZoomedInState = null

        states
            .attr("class", "states")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(geographyData, geographyData.objects.states).features)
            .enter().append("path")
                .attr("fill", function(d) { return color(dataFunction(d.id).value); })
                .attr("d", path)
                .attr("id", function(d) { return "path" + d.id; })
                .on('mouseover', function(d) {
                    var selection = svg.select('#path' + d.id)
                    var node = selection.node()
                    var parentNode = node.parentNode
                    parentNode.appendChild(node);
                    selection.attr('filter', 'drop-shadow(0px 0px 10px)');
                })
                .on('mouseout', function(d) {
                    console.log('hello')
                    var selection = svg.select('#path' + d.id)
                    selection.attr('filter', null);
                })
                .on('click', function(d) {
                    if (!currentZoomedInState || currentZoomedInState.id !== d.id) {
                        if (currentZoomedInState) {
                            resetTransform(currentZoomedInState, svg)
                            resetNode('counties')
                        }
                        zoomIntoState(d, svg)
                        currentZoomedInState = d;
                        getCountyDataFunction(d.id)
                            .then(function(countyDataFunction) {
                                renderCountiesForStateOnSVG(d.id, geographyData, color, function() {
                                    resetNode('counties')
                                    zoomOut(d, svg);
                                    currentZoomedInState = null
                                }, countyDataFunction);
                            })
                    } else {
                        resetNode('counties')
                        zoomOut(d, svg);
                        currentZoomedInState = null
                    }
                })
            .append("title")
                .text(function(d) { return dataFunction(d.id).name + ": " + dataFunction(d.id).value + "%"; });

    };

    var recolorMap = function(pathDataFunction, color) {
        d3.selectAll('path')
            .attr("fill", function(d) { return color(pathDataFunction(d.id)); })
    }

    // Will be null if not zoomed in
    var getCurrentlyZoomedInStateId = function() {
        return currentZoomedInState.id
    }

    var requestUSTopoJSON = function(callback) {
        d3.queue()
            .defer(d3.json, "https://d3js.org/us-10m.v1.json")
            .await(callback);
    };

    var resetNode = function(nodeId) {
        var svg = d3.select("#" + nodeId);
        svg.html("");
    }

    return  {
        requestUSTopoJSON,
        renderUSOnSVG,
        renderKeyOnSVG,
        resetNode,
        getCurrentlyZoomedInStateId
    };

}())
