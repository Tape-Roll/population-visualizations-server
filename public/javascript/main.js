// Object that responds to events by modifying the map
// It also holds the data
function MapController() {
    this.states = {};
    this.counties = {};
    this.currYear = 2016;
    this.color = {};
    this.maxStatePop = 0;
    this.minStatePop = 100;
    this.maxCountyPop = 0;
    this.minCountyPop = 100;
    this.init = function() {
        // Load data for states right at the beginning
        loadStates().then(
            function(stateArray) {
                // setup this.states
                this.findStateValues(stateArray);
                // Setup map
                mapVisualization.requestUSTopoJSON(
                    function(err, geographyData) {
                        if (err) {
                            throw err;
                        } else {
                            // First element is the lower bound, the last element is the upper
                            // bound. The ones in between are the steps where the color changes.
                            // Yes, the array needs to be this exact length for it to work :/
                            var scale = this.getScale();
                            this.color = d3
                                .scaleThreshold()
                                .domain(scale)
                                .range(d3.schemeSpectral[11].reverse());
                            // To rescale the key, rescale the colors, reset the key, and then
                            // rerender the key
                            mapVisualization.renderKeyOnSVG("Test Statistic", this.color);
                            mapVisualization.renderUSOnSVG(
                                geographyData,
                                this.color,
                                function(stateId) {
                                    // Getting state info
                                    return this.getState(stateId);
                                }.bind(this),
                                function(stateId) {
                                    return new Promise(
                                        function(resolve, reject) {
                                            return loadCounties(stateId).then(
                                                function(counts) {
                                                    // Getting county info
                                                    this.counties = {};
                                                    this.statePopulation = 0;
                                                    try {
                                                        counts.forEach(
                                                            function(element) {
                                                                this.counties[
                                                                    element.county_id
                                                                ] = element;
                                                                var pop = parseInt(
                                                                    element.years[this.currYear]
                                                                        .statisticsTable.total_pop
                                                                );
                                                                element.value = pop;
                                                                this.statePopulation += pop;
                                                            }.bind(this)
                                                        );
                                                        Object.keys(this.counties).forEach(
                                                            function(key) {
                                                                this.counties[key].value /=
                                                                    this.statePopulation / 100;
                                                            }.bind(this)
                                                        );
                                                    } catch (e) {
                                                        console.log(e);
                                                    }
                                                    return resolve(
                                                        function(countyId) {
                                                            return this.getCounty(countyId);
                                                        }.bind(this)
                                                    );
                                                }.bind(this)
                                            );
                                        }.bind(this)
                                    );
                                }.bind(this)
                            );
                        }
                    }.bind(this)
                );
            }.bind(this)
        );
        window.addEventListener(
            "YearChanged",
            function(event) {
                console.log("Why");
                this.currYear = event.detail;
                this.updateMap();
            }.bind(this)
        );
    };
    this.getScale = function() {
        var scale = [];
        console.log(this.maxStatePop, this.minStatePop);
        // avoid infinite loops
        if (this.maxStatePop - this.minStatePop < 10) {
            this.maxStatePop = this.minStatePop + 10;
        }
        for (
            var i = this.minStatePop;
            i <= this.maxStatePop;
            i += (this.maxStatePop - this.minStatePop) / 10
        ) {
            scale.push(i);
        }

        console.log(scale);

        return scale;
    };
    this.updateMap = function() {
        // Area id can be for a state or county
        console.log(this.currYear);

        var scale = this.getScale();
        this.color = d3
            .scaleThreshold()
            .domain(scale)
            .range(d3.schemeSpectral[11]);

        this.findStateValues();
        mapVisualization.recolorMap(
            function(id) {
                if (this.states[id] !== undefined) {
                    return this.getState(id);
                } else {
                    return this.getCounty(id);
                }
            }.bind(this),
            this.color
        );
    };
    this.getState = function(id) {
        id = parseInt(id);
        return this.states[parseInt(id)];
    };
    this.getCounty = function(id) {
        id = parseInt(id);
        if (this.counties[id] === undefined || this.counties[id].value === undefined) {
            // Uh oh. The county isn't found or set up right
            return { name: "unknown", value: -1 };
        }
        return this.counties[id];
    };
    this.findStateValues = function(stateArray) {
        this.maxStatePop = 0;
        this.minStatePop = 100;
        var total = 0;
        if (stateArray !== undefined) {
            stateArray.forEach(
                function(element) {
                    var pop = parseInt(element.years[this.currYear].statisticsTable.total_pop);
                    element.value = pop;
                    this.states[element.state_id] = element;
                    total += pop;
                }.bind(this)
            );
        } else {
            Object.keys(this.states).forEach(
                function(key) {
                    var pop = parseInt(
                        this.states[key].years[this.currYear].statisticsTable.total_pop
                    );
                    this.states[key].value = pop;
                    total += pop;
                }.bind(this)
            );
        }

        Object.keys(this.states).forEach(
            function(key) {
                this.states[key].value /= total / 100;
                this.minStatePop = Math.min(this.states[key].value, this.minStatePop);
                this.maxStatePop = Math.max(this.states[key].value, this.maxStatePop);
            }.bind(this)
        );
    };
}

new MapController().init();
