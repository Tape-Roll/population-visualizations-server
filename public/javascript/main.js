// Object that responds to events by modifying the map
// It also holds the data
function MapController() {
    this.states = {};
    this.counties = {};
    this.filter = {
        shouldFindPercentage: false,
        statName: "moved_county.age.1 to 4 years"
        //statName: "median_age"
    };
    this.currYear = 2016;
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
                mapVisualization.setStateColor(
                    d3
                        .scaleLinear()
                        .domain([this.minStateValue, this.maxStateValue])
                        .range([this.leftColor, this.rightColor])
                );

                // Set up tool tip
                mapVisualization.setMouseoverFormatterPercent(this.filter.shouldFindPercentage);

                // Setup map
                mapVisualization.requestUSTopoJSON(
                    function(err, geographyData) {
                        if (err) {
                            throw err;
                        } else {
                            // To rescale the key, rescale the colors, reset the key, and then
                            // rerender the key
                            //mapVisualization.renderKeyOnSVG("Test Statistic", this.color);
                            mapVisualization.renderUSOnSVG(
                                geographyData,
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
                                                    this.findCountyValues(counts);
                                                    mapVisualization.setCountyColor(
                                                        d3
                                                            .scaleLinear()
                                                            .domain([
                                                                this.minCountyValue,
                                                                this.maxCountyValue
                                                            ])
                                                            .range([
                                                                this.leftColor,
                                                                this.rightColor
                                                            ])
                                                    );

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
    // Updates the map. Call this when some data has changed
    this.updateMap = function() {
        mapVisualization.setMouseoverFormatterPercent(this.filter.shouldFindPercentage);

        this.findStateValues();
        this.findCountyValues();

        mapVisualization.setStateColor(
            d3
                .scaleLinear()
                .domain([this.minStateValue, this.maxStateValue])
                .range([this.leftColor, this.rightColor])
        );

        mapVisualization.setCountyColor(
            d3
                .scaleLinear()
                .domain([this.minCountyValue, this.maxCountyValue])
                .range([this.leftColor, this.rightColor])
        );

        mapVisualization.recolorMap(
            function(id) {
                var ret = this.getState(id);
                if (ret === undefined) {
                    ret = this.getCounty(id);
                } else {
                }

                return ret;
            }.bind(this)
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
            console.log("Missing county: ", this.counties);
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
                    var value = parseInt(this.findValue(element));
                    element.value = value;
                    this.states[element.state_id] = element;
                    total += value;
                    if (value >= 0) {
                        this.minStateValue = Math.min(value, this.minStateValue);
                        this.maxStateValue = Math.max(value, this.maxStateValue);
                    }
                }.bind(this)
            );
        } else {
            Object.keys(this.states).forEach(
                function(key) {
                    var value = 0;
                    if (this.getState(key).years[this.currYear] === undefined) {
                        value = -1;
                    } else {
                        value = parseInt(this.findValue(this.getState(key)));
                    }
                    this.getState(key).value = value;
                    total += value;
                    if (value >= 0) {
                        this.minStateValue = Math.min(value, this.minStateValue);
                        this.maxStateValue = Math.max(value, this.maxStateValue);
                    }
                }.bind(this)
            );
        }

        if (this.filter.shouldFindPercentage) {
            this.maxStateValue = 0;
            this.minStateValue = 100;
            Object.keys(this.states).forEach(
                function(key) {
                    this.getState(key).value /= total / 100;
                    if (this.getState(key).value >= 0) {
                        this.minStateValue = Math.min(this.getState(key).value, this.minStateValue);
                        this.maxStateValue = Math.max(this.getState(key).value, this.maxStateValue);
                    }
                }.bind(this)
            );
        }
    };

    this.findCountyValues = function(countyArray) {
        this.maxCountyValue = 0;
        this.minCountyValue = 10000000000;
        var total = 0;
        if (countyArray !== undefined) {
            try {
                countyArray.forEach(
                    function(element) {
                        this.counties[element.county_id] = element;
                        var pop = parseInt(this.findValue(element));
                        element.value = pop;
                        total += pop;
                        if (pop >= 0) {
                            this.minCountyValue = Math.min(pop, this.minCountyValue);
                            this.maxCountyValue = Math.max(pop, this.maxCountyValue);
                        }
                    }.bind(this)
                );
            } catch (e) {
                console.log(e);
            }
        } else {
            Object.keys(this.counties).forEach(
                function(key) {
                    var value = 0;
                    if (this.getCounty(key).years[this.currYear] === undefined) {
                        value = -1;
                    } else {
                        value = parseInt(this.findValue(this.getCounty(key)));
                    }
                    this.getCounty(key).value = value;
                    total += value;
                    if (value >= 0) {
                        this.minCountyValue = Math.min(value, this.minCountyValue);
                        this.maxCountyValue = Math.max(value, this.maxCountyValue);
                    }
                }.bind(this)
            );
        }

        if (this.filter.shouldFindPercentage) {
            this.maxCountyValue = 0;
            this.minCountyValue = 100;
            Object.keys(this.counties).forEach(
                function(key) {
                    this.getCounty(key).value /= total / 100;
                    if (this.getCounty(key).value >= 0) {
                        this.minCountyValue = Math.min(
                            this.getCounty(key).value,
                            this.minCountyValue
                        );
                        this.maxCountyValue = Math.max(
                            this.getCounty(key).value,
                            this.maxCountyValue
                        );
                    }
                }.bind(this)
            );
        }
    };

    this.findValue = function(obj) {
        var table = obj.years[this.currYear].statisticsTable;
        keys = this.filter.statName.split(".");
        keys.forEach(
            function(element) {
                table = table[element];
            }.bind(this)
        );
        return table;
    };
}

new MapController().init();
