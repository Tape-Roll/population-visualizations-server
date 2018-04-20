// Object that responds to events by modifying the map
// It also holds the data
function MapController() {
    this.states = {};
    this.counties = {};
    this.filter = {
        shouldFindPercentage: false,
        statName: "median_age"
    };
    this.currYear = 2016;
    this.color = {};
    this.maxStateValue = 0;
    this.minStateValue = 100;
    this.maxCountyPop = 0;
    this.minCountyPop = 100;
    this.leftColor = "white";
    this.rightColor = "red";
    this.init = function() {
        // Load data for states right at the beginning
        loadStates(this.filter.statName).then(
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
                                .scaleLinear()
                                .domain([this.minStateValue, this.maxStateValue])
                                .range([this.leftColor, this.rightColor]);
                            // To rescale the key, rescale the colors, reset the key, and then
                            // rerender the key
                            //mapVisualization.renderKeyOnSVG("Test Statistic", this.color);
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
                                            return loadCounties(stateId, this.filter.statName).then(
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
                                                                        .statisticsTable[
                                                                        this.filter.statName
                                                                    ]
                                                                );
                                                                element.value = pop;
                                                                this.statePopulation += pop;
                                                            }.bind(this)
                                                        );
                                                        Object.keys(this.counties).forEach(
                                                            function(key) {
                                                                this.getCountry(key).value /=
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
                this.currYear = event.detail;
                this.updateMap();
            }.bind(this)
        );
    };
    this.getScale = function() {
        var scale = [];
        // avoid infinite loops
        if (this.maxStateValue - this.minStateValue < 10) {
            this.maxStateValue = this.minStateValue + 10;
        }
        for (
            var i = this.minStateValue;
            i <= this.maxStateValue;
            i += (this.maxStateValue - this.minStateValue) / 10
        ) {
            scale.push(i);
        }

        return scale;
    };
    // Updates the map. Call this when some data has changed
    this.updateMap = function() {
        // Area id can be for a state or county
        var scale = this.getScale();
        this.findStateValues();

        this.color = d3
            .scaleLinear()
            .domain([this.minStateValue, this.maxStateValue])
            .range([this.leftColor, this.rightColor]);

        mapVisualization.recolorMap(
            function(id) {
                var ret = this.getState(id);
                if (ret === undefined) {
                    console.log("State undefined: " + id + ", year: " + this.currYear);
                    ret = this.getCounty(id);
                }

                return ret;
            }.bind(this),
            this.color
        );
    };
    // Returns the state with the given id if it exists
    this.getState = function(id) {
        id = parseInt(id);
        return this.states[parseInt(id)];
    };
    // Returns the county with the given id if it exists
    this.getCounty = function(id) {
        id = parseInt(id);
        if (this.counties[id] === undefined || this.counties[id].value === undefined) {
            // Uh oh. The county isn't found or set up right
            return { name: "unknown", value: -1 };
        }
        return this.counties[id];
    };
    // Updates the value for each state based on the currYear
    // Also updates minPop and maxPop for states
    this.findStateValues = function(stateArray) {
        this.maxStateValue = 0;
        this.minStateValue = 10000000000;
        var total = 0;
        if (stateArray !== undefined) {
            console.log(stateArray);
            stateArray.forEach(
                function(element) {
                    var value = parseInt(
                        element.years[this.currYear].statisticsTable[this.filter.statName]
                    );
                    element.value = value;
                    this.states[element.state_id] = element;
                    total += value;
                    this.minStateValue = Math.min(value, this.minStateValue);
                    this.maxStateValue = Math.max(value, this.maxStateValue);
                }.bind(this)
            );
        } else {
            Object.keys(this.states).forEach(
                function(key) {
                    var value = 0;
                    if (this.getState(key).years[this.currYear] === undefined) {
                        value = -1;
                    } else {
                        value = parseInt(
                            this.getState(key).years[this.currYear].statisticsTable[
                                this.filter.statName
                            ]
                        );
                    }
                    this.getState(key).value = value;
                    total += value;
                    this.minStateValue = Math.min(value, this.minStateValue);
                    this.maxStateValue = Math.max(value, this.maxStateValue);
                }.bind(this)
            );
        }

        if (this.filter.shouldFindPercentage) {
            this.maxStateValue = 0;
            this.minStateValue = 100;
            Object.keys(this.states).forEach(
                function(key) {
                    this.getState(key).value /= total / 100;
                    this.minStateValue = Math.min(this.getState(key).value, this.minStateValue);
                    this.maxStateValue = Math.max(this.getState(key).value, this.maxStateValue);
                }.bind(this)
            );
        }
    };
}

new MapController().init();
