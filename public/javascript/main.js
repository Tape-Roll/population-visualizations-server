// Load data for states right at the beginning
loadStates().then(function(stateArray) {
    var states = {};
    var totalPopulation = 0;
    stateArray.forEach(function(element) {
        var pop = parseInt(element.years["2016"].statisticsTable.total_pop);
        totalPopulation += pop;
        element.value = pop;
        states[element.state_id] = element;
    });
    Object.keys(states).forEach(function(key) {
        states[key].value /= totalPopulation / 100;
    });

    // Setup map
    mapVisualization.requestUSTopoJSON(function(err, geographyData) {
        if (err) {
            throw err;
        } else {
            // First element is the lower bound, the last element is the upper
            // bound. The ones in between are the steps where the color changes.
            // Yes, the array needs to be this exact length for it to work :/
            var color = d3
                .scaleThreshold()
                .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
                .range(d3.schemeSpectral[11].reverse());
            // To rescale the key, rescale the colors, reset the key, and then
            // rerender the key
            mapVisualization.renderKeyOnSVG("Test Statistic", color);
            mapVisualization.renderUSOnSVG(
                geographyData,
                color,
                function(stateId) {
                    // Getting state info
                    return states[parseInt(stateId)];
                },
                function(stateId) {
                    return new Promise(function(resolve, reject) {
                        return loadCounties(stateId).then(function(counts) {
                            // Getting county info
                            var counties = {};
                            var totalPopulation = 0;
                            try {
                                counts.forEach(element => {
                                    counties[element.county_id] = element;
                                    var pop = parseInt(
                                        element.years["2016"].statisticsTable.total_pop
                                    );
                                    element.value = pop;
                                    totalPopulation += pop;
                                });
                                Object.keys(counties).forEach(function(key) {
                                    counties[key].value /= totalPopulation / 100;
                                });
                                console.log(counties);
                            } catch (e) {
                                console.log(e);
                            }
                            return resolve(function(countyId) {
                                countyId = parseInt(countyId);
                                if (
                                    counties[countyId] === undefined ||
                                    counties[countyId].value === undefined
                                ) {
                                    return { name: "unknown", value: -1 };
                                }
                                return counties[countyId];
                            });
                        });
                    });
                }
            );
        }
    });
});
